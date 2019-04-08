
class Sender {
  constructor(bot) {
    this.bot = bot;
    this.sendAll = this.sendAll.bind(this);
    this.toAll = this.toAll.bind(this);
  }

  sendMessage(ctx, msg) {
    ctx.replyWithMarkdown(msg);
  }

  error(ctx, error) {
    let errorText;
    if (error instanceof Error) {
      errorText = error.message;
    } else {
      errorText = error;
    }
    const errorMsg = `❌ ${errorText}`;
    this.sendMessage(ctx, errorMsg);
  }

  success(ctx, successText) {
    const errorMsg = `✅ ${successText}`;
    this.sendMessage(ctx, errorMsg);
  }

  async toPlayer(player, msgText) {
    await this.bot.telegram.sendMessage(player.chatId, msgText, { parse_mode: 'markdown' });
  }

  async sendAll(players, msgText) {
    const msgpool = [];
    players.forEach(p => msgpool.push(this.toPlayer(p, msgText)));

    await Promise.all(msgpool);
  }

  async toAll(players, text) {
    if (players.length === 0) {
      return;
    }
    const msgpool = [];
    const f = p => (typeof text === 'function' ? text(p) : text);
    players.forEach(p => msgpool.push(this.toPlayer(p, f(p))));

    await Promise.all(msgpool);
  }
}

module.exports = Sender;
