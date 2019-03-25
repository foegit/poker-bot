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
    this.comb = null;

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

  setCards(cards) {
    this.cards = cards;
  }

  setBet(sum) {
    this.bet = sum;
    this.totalBet += sum;
  }

  takeAwayBet() {
    this.balance -= this.bet;
  }

  win(sum) {
    this.balance += sum;
  }

  setComb(comb) {
    this.comb = comb;
  }

  cleanBet() {
    this.bet = 0;
  }

  reset() {
    this.cards = null;
    this.isMakeBet = false;
    this.currBet = 0;
    this.isFold = false;
  }
}


module.exports = Player;
