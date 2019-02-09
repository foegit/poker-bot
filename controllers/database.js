const Player = require('../db/models/player');

const createNewPlayer = async (ctx) => {
  try {
    const { from } = ctx;
    const player = new Player({
      telegramId: from.id,
      balance: 100,
      userName: from.username,
      registerDate: Date.now(),
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

const isPlayerExist = async telegramId => !!(await getPlayer(telegramId));

module.exports = {
  createNewPlayer,
  isPlayerExist,
  getPlayer,
};
