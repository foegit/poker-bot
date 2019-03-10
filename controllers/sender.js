class Sender {
  constructor() {
    if (!Sender.instance) {
      this.bot = null;
      this.log = [];
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
}

module.exports = new Sender();
