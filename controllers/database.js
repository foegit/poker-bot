const { spacer } = require('./utils');
const Player = require('../db/models/player');
const Table = require('../db/models/table');

const createNewPlayer = async (ctx) => {
  try {
    const { from } = ctx;
    const player = new Player({
      telegramId: from.id,
      balance: 100,
      userName: from.username,
      registerDate: Date.now(),
      chatId: ctx.chat.id,
    });
    return await player.save();
  } catch (err) {
    throw err;
  }
};


// return player obj or null if player not found
const getPlayer = async (telegramId) => {
  try {
    const pl = await Player.findOne({ telegramId });
    return pl;
  } catch (err) {
    throw err;
  }
};

const getTable = async id => Table.findById(id);

const createTable = async (playerTId, title) => {
  const trimTitle = title.trim();
  if (trimTitle.length < 3) {
    throw new Error('Назва стола має складатись мінімум з 3 символів');
  }

  if (trimTitle.length >= 9) {
    throw new Error('Назва стола має складатись не більше 9 символів.');
  }

  const player = await Player.findOne({ telegramId: playerTId }).populate('currentTable');
  if (player.currentTable) {
    throw new Error(`Ви зараз за столом ${player.currentTable.title}. /leave для того щоб покинути стіл.`);
  }
  const registerDate = Date.now();
  const players = [player.id];
  const table = new Table({
    title: trimTitle,
    owner: player._id,
    registerDate,
    players,
  });
  const createdTable = await table.save();
  await player.update({ currentTable: createdTable._id });

  return `Ви вдало створили стіл ${createdTable.title}. Вашим друзям потрібно ввести ***/j ${createdTable.title}***.`;
};

const deleteTable = async (playerTId) => {
  const player = await Player.findOne({ telegramId: playerTId });
  if (!player.currentTable) {
    throw new Error('Ви не за столом.');
  }

  const table = await Table.findOne({ owner: player._id }).populate('players');
  console.log(table);

  if (!table.owner._id.equals(player._id)) {
    throw new Error('Це на ваш стіл.');
  }

  const playerLeaveQuery = [];
  for (let i = 0; i < table.players.length; i += 1) {
    playerLeaveQuery.push(table.players[i].update({ currentTable: null }));
  }

  await Promise.all(playerLeaveQuery);
  await table.delete();
  return 'Стіл вдало був видалений.';
};

// const deleteTableIfEmpty = async (tableId) => {
//   const table = await getTable(tableId);
//   if (table.players.length === 0) {
//     await table.remove();
//   }
// };

const leaveTable = async (telegramId) => {
  const player = await Player.findOne({ telegramId });
  if (!player.currentTable) {
    throw new Error('Ви не за столом.');
  }

  await player.update({ currentTable: null });
  const table = await Table.findById(player.currentTable);

  if (!table) {
    return 'Ви покинули стіл.';
  }

  await table.updateOne({
    $pull: { players: player._id },
  });

  return `Ви покинули стіл ***${table.title}***`;
};

const addPlayerToTable = async (telegramId, tableName) => {
  const table = await Table.findOne({ title: tableName });
  if (!table) {
    throw new Error('Стіл з такою назвою не знайдений. Перевірте правильність введення.');
  }
  if (table.players.length >= 10) {
    throw new Error('Стіл повний [10/10].');
  }

  const player = await Player.findOne({ telegramId });
  if (table._id.equals(player.currentTable)) {
    throw new Error('Ви вже знаходитесь за цим столом.');
  }

  await player.update({ currentTable: table._id });
  await table.update({ $addToSet: { players: player._id } });

  return `Ви вдало приєднались до стола ***${table.title}***.`;
};

const getTableList = async () => {
  const tables = await Table.find().populate('owner');
  if (tables.length === 0) {
    return 'Немає активних столів.\nЩоб створити свій /create <назва>';
  }
  let list = `🧤 ***Список столів:***\n\n${spacer('#', 3)} ${spacer('Адмін', 12)} ${spacer('Стіл', 15)} Гравці\n`;
  list += `${spacer('', 50, '-')}\n`;
  for (let i = 0; i < tables.length; i += 1) {
    const number = spacer(`${(i + 1)}`, 3);
    const admin = spacer(`@${tables[i].owner.userName}`, 12);
    const table = spacer(tables[i].title, 15);
    const limit = `[${tables[i].players.length}/10]`;

    list += `${number} ${admin} ***${table}*** ${limit}\n`;
  }
  return list;
};

const broadcastMessage = async (telegramId, msg, date) => {
  const player = await Player.findOne({ telegramId });
  if (!player.currentTable) {
    throw new Error('Ви не за столом.');
  }

  const table = await Table.findById(player.currentTable).populate('players');
  const chatEntry = `${player.userName}. ${date}. ${msg}`;
  await table.update({ $push: { chat: chatEntry } });

  return table.players.filter(p => !p._id.equals(player._id));
};

const isPlayerExist = async telegramId => !!(await getPlayer(telegramId));

module.exports = {
  createNewPlayer,
  isPlayerExist,
  getPlayer,
  getTable,
  createTable,
  deleteTable,
  leaveTable,
  addPlayerToTable,
  getTableList,
  broadcastMessage,
};
