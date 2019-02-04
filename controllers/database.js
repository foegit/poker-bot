const Player = require('../db/models/player');

const isPlayerExist = async (telegramId) => {
  const findRes = Player.findOne({
    telegramId,
  });
  if (findRes) {
    return true;
  }
  return false;
};

const createNewPlayer = async (ctx) => {
  try {
    const { from } = ctx;
    const player = new Player({
      telegramId: from.id,
      balance: 100,
      userName: from.username,
      registerDate: Date.now(),
    });

    await player.save();
  } catch (err) {
    throw err;
  }
};

const getPlayer = async (telegramId) => {
  try {
    const pl = await Player.findOne({ telegramId });
    return pl;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createNewPlayer,
  isPlayerExist,
  getPlayer,
};
