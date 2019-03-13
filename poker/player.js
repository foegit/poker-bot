class Player {
  constructor() {
    this.game = null;
    this.joinTime = null;
    this.leaveTime = null;

    this.getTitle = this.getTitle.bind(this);
  }

  implementFromDB(dbplayer) {
    this.id = dbplayer._id;
    this.tid = dbplayer.tid;
    this.username = dbplayer.username;
    this.chatId = dbplayer.chatId;
    this.balance = dbplayer.balance;
  }

  joinTo(game) {
    this.game = game;
    this.joinTime = Date.now();
  }

  leave() {
    this.game.leave(this);
    this.game = null;
    this.leaveTime = Date.now();
  }

  getTitle() {
    return this.username || this.tid;
  }
}


module.exports = Player;
