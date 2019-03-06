
class Player {
  constructor() {
    this.gameId = null;
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
}


module.exports = Player;
