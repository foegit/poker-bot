const Sender = require('../controllers/sender');

class Player {
  constructor() {
    this.gameId = null;

    this.greeting = this.greeting.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }

  implementFromDB(dbplayer) {
    this.id = dbplayer._id;
    this.tid = dbplayer.tid;
    this.username = dbplayer.username;
    this.chatId = dbplayer.chatId;
    this.balance = dbplayer.balance;
  }

  joinTo(id) {
    this.gameId = id;
    this.joinTime = Date.now();
  }

  leaveGame() {
    this.gameId = null;
    this.joinTime = null;
  }

  getTitle() {
    return this.username || this.tid;
  }

  async greeting() {
    const geetingMsg = `👋 Привіт, ***${this.getTitle()}***!\nТвій баланс ${this.balance}`;
    await Sender.toPlayer(this, geetingMsg);
  }
}


module.exports = Player;
