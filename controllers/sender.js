class Sender {
  constructor() {
    if (!Sender.instance) {
      this.bot = null;
      this.log = [];

      this.sendAll = this.sendAll.bind(this);
      this.toAll = this.toAll.bind(this);
      Sender.instance = this;
    }
    return Sender.instance;
  }

  init(bot) {
    this.bot = bot;
    return this;
  }
  // eslint-disable-next-line
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

  async toAll(players, msgText) {
    const msgpool = [];
    players.forEach(p => msgpool.push(this.toPlayer(p, msgText)));

    await Promise.all(msgpool);
  }
}

module.exports = new Sender();
