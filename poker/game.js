const Deck = require('../cards/deck');
const Sender = require('../controllers/sender');
const moveType = require('../const/move');
const round = require('../const/gameRound');

class MoveResult {
  constructor(done, msg) {
    this.done = done;
    this.msg = msg;
  }

  static success(msg) {
    return new MoveResult(true, msg);
  }

  static fail(msg) {
    return new MoveResult(false, msg);
  }
}

class HoldemPlayer {
  constructor(player) {
    this.player = player;
    this.cards = [];
    this.bet = 0;
    this.fold = false;
  }

  static wrapPlayer(player) {
    return new HoldemPlayer(player);
  }

  static wrapPlayers(players) {
    return players.map(p => HoldemPlayer.wrapPlayer(p));
  }

  reset() {
    this.cards = [];
    this.bet = 0;
    this.fold = false;
  }

  setCards(cards) {
    this.cards = cards;
  }

  cleanCards() {
    const { cards } = this;
    this.cards = [];
    return cards;
  }
}

class Game {
  constructor(gameId, title, player) {
    this.id = gameId;
    this.title = title;
    this.players = [player];
    this.owner = player;
    this.deck = new Deck();

    this.currentPlayer = player;

    this.currCircle = {
      round: round.preFlop,
      dealer: null,
      smallBlind: null,
      bigBlind: null,
      underTheGun: null,
      remainPlayer: [],
      pickedCard: [],
      bet: 0,
      bank: 0,
      boardCard: [],
    };
    this.isEnd = false;


    this.join = this.join.bind(this);
    this.leave = this.leave.bind(this);
  }


  shuffle() {
    this.deck.shuffle();
  }

  join(player) {
    this.players.push(player);
  }

  leave(player) {
    this.players = this.players.filter(p => p.tid !== player.tid);
    if (player.tid === this.owner.tid) {
      let newOwner = this.players[0];
      for (let i = 0; i < this.players.length; i += 1) {
        if (this.players[i].joinTime < newOwner.joinTime) {
          newOwner = this.players[i];
        }
      }
      this.owner = newOwner;
    }
  }

  start() {
    this.currCircle = {
      round: round.preFlop,
      dealer: this.players[0],
      underTheGun: this.players[1],
      players: HoldemPlayer.wrapPlayers(this.players),
      pickedCard: [],
      boardCard: [],
      bet: 0,
      bank: 0,
    };
  }

  getNextUTG() {
    const { currCircle } = this;
    const index = currCircle.remainPlayers.indexOf(currCircle.underTheGun) % currCircle.remainPlayer.length;

    return this.currCircle.players.find(p => p.isMove);
  }

  requestMove() {
    const player = this.currCircle.undetTheGun;
    const moves = this.getAvailableMoves(player);
    Sender.toPlayer(this.currCircle.undetTheGun, `Ваш хід.\n${moves}`);
  }

  preFlop() {
    this.shuffle();
    const { remainPlayer } = this.currCircle;
    remainPlayer.forEach((p) => {
      const cards = [this.deck.pickFront(), this.deck.pickFront()];
      p.setCards(cards);
    });
  }

  getAvailableMoves(player) {
    if (this.currCircle.underTheGun !== player) {
      return false;
    }

    let moves = '';

    if (this.currCircle.bet === 0) {
      moves += '▫️ ***/bet sum*** - зробити ставку sum\n';
      moves += '▫️ ***/check*** - не робити ставку\n';
    } else {
      moves += `▫️ ***/call*** - підтримати поточну ставку (${this.currCircle.bet})\n`;
      moves += '▫️ ***/raise sum*** - підвищити ставку на sum\n';
    }
    moves += '▫️ ***/fold*** - скинути карти\n';


    return moves;
  }

  isYouMove(player) {
    return (player.tid === this.currentPlayer.tid);
  }

  move(player, type, sum = 0) {
    if (!this.isYouMove(player)) {
      return MoveResult.fail('Зараз не ваш хід');
    }

    switch (type) {
      case moveType.bet: return this.bet(player, sum);
      case moveType.call: return this.call(player);
      case moveType.raise: return this.raise(player, sum);
      case moveType.check: return this.check(player);
      case moveType.fold: return this.fold(player);
      default: return MoveResult.fail('Невідома команда');
    }
  }

  bet(sum) { // зробити початкову ставку
    this.currCircle.bet = sum;
  }

  call() { // підтримати ставк

  }

  raise() { // збільшити ставку

  }

  fold() { // пасс

  }

  check() { // відмова робити ставку

  }
}

module.exports = Game;
