const database = require('./database');
const { getParam, Sender } = require('./utils');

const start = async (ctx) => {
  const { from } = ctx;
  const account = await database.getPlayer(from.id);
  if (account) {
    ctx.replyWithMarkdown(`Привіт, ***${account.userName}***!\nТвій баланс: ${account.balance}🔹`);
  } else {
    const pl = await database.createNewPlayer(ctx);
    ctx.replyWithMarkdown(`***${pl.userName}***, ти вдало зар'єструвався!\nТвій баланс: ${pl.balance}🔹`);
  }
};

const createTable = async (ctx) => {
  console.log(getParam(ctx.message.text)[0]);
  try {
    Sender.ok(ctx,
      await database.createTable(ctx.from.id, getParam(ctx.message.text)[0]));
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const deleteTable = async (ctx) => {
  try {
    Sender.ok(ctx,
      await database.deleteTable(ctx.from.id, getParam(ctx.message.text)[0]));
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const leaveTable = async (ctx) => {
  try {
    Sender.ok(ctx, await database.leaveTable(ctx.from.id));
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const showTables = async (ctx) => {
  try {
    Sender.msg(ctx, await database.getTableList(ctx));
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const joinTable = async (ctx) => {
  try {
    Sender.ok(ctx, await database.addPlayerToTable(ctx.from.id,
      getParam(ctx.message.text)));
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const say = bot => async (ctx) => {
  try {
    const cleanMsg = getParam(ctx.message.text).join(' ');
    const playerChats = await database.broadcastMessage(ctx.from.id, cleanMsg, new Date());
    for (let i = 0; i < playerChats.length; i += 1) {
      bot.telegram.sendMessage(playerChats[i].chatId, `💬 ***${ctx.from.username}***: ${cleanMsg}`, { parse_mode: 'markdown' });
    }
  } catch (err) {
    Sender.error(ctx, err);
  }
};

const cube = (ctx) => {
  const randomNum = Math.floor((Math.random() * 6)) + 1;
  ctx.replyWithMarkdown(`🎲 ***${randomNum}***`);
};

module.exports = {
  start,
  createTable,
  deleteTable,
  leaveTable,
  joinTable,
  showTables,
  say,
  cube,
};
