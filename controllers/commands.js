const database = require('./database');

const start = async (ctx) => {
  const { from } = ctx;
  const account = await database.getPlayer(from.id);
  if (account) {
    ctx.reply(`Welcome back, ${account.userName}!\nYour balance: ${account.balance}$`);
  } else {
    const pl = await database.createNewPlayer(ctx);
    ctx.reply(`Welcome, ${pl.userName}!\nYour balance: ${account.balance}$`);
  }
};

module.exports = {
  start,
};
