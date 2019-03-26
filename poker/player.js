const PlayerModel = require('../db/models/player');

class Player {
  constructor() {
    this.game = null;
    this.joinTime = null;
    this.leaveTime = null;
    // in game
    this.cards = null;
    this.isMakeBet = false;
    this.bet = 0;
    this.totalBet = 0;
    this.isFold = false;
    this.isCheck = false;
    this.comb = null;

    this.getTitle = this.getTitle.bind(this);
  }

  implementFromDB(dbplayer) {
    this.dbplayer = dbplayer;
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

  getBalance() {
    return this.balance - this.totalBet;
  }

  async refreshBalance() {
    this.balance = (await PlayerModel.findOne({ tid: this.tid }).select('balance')).balance;
  }

  async replenish(sum) {
    if (!Number.isInteger(sum)) {
      throw new Error('Сума поповнення має бути цілим числом.');
    }

    if (sum < 0) {
      throw new Error('Сума поповнення від\'ємна.');
    }

    if (sum === 0) {
      return true;
    }

    try {
      await this.dbplayer.update({ balance: this.balance + sum });
      await this.refreshBalance();
      return true;
    } catch (err) {
      throw err;
    }
  }

  setCards(cards) {
    this.cards = cards;
  }

  setBet(sum) {
    this.bet = sum;
    this.totalBet += sum;
  }

  upBet(sum) {
    this.bet += sum;
    this.totalBet += sum;
  }

  async takeAwayBet() {
    if (this.totalBet === 0) {
      return true;
    }

    try {
      await this.dbplayer.update({ balance: this.balance - this.totalBet });
      await this.refreshBalance();
      this.totalBet = 0;
      return true;
    } catch (err) {
      throw err;
    }
  }

  win(sum) {
    this.balance += sum;
  }

  setComb(comb) {
    this.comb = comb;
  }

  makeCheck() {
    this.isCheck = true;
  }

  cleanCheck() {
    this.isCheck = false;
  }

  cleanBet() {
    this.bet = 0;
  }

  reset() {
    this.cards = null;
    this.isMakeBet = false;
    this.bet = 0;
    this.totalBet = 0;
    this.isFold = false;
    this.isCheck = false;
  }
}


module.exports = Player;
