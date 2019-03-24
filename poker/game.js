const Emitter = require('events');

const Deck = require('../cards/deck');
const Sender = require('../controllers/sender');
const moveType = require('../const/move');
const round = require('../const/gameRound');

class Game extends Emitter {
  constructor(gameId, title, player) {
    super();
    this.id = gameId;
    this.title = title;
    this.players = [player];
    this.owner = player;
    this.deck = new Deck();
    this.minBet = 0;
    this.maxBet = 100;

    this.currCircle = {
      round: round.preFlop,
      dealer: null,
      underTheGun: null,
      pickedCard: [],
      bet: 0,
      bank: 0,
      boardCard: [],
      isEnd: false,
    };
    this.isEnd = false;

    this.join = this.join.bind(this);
    this.leave = this.leave.bind(this);

    this.emit('create', this);
  }

  getMinBet() {
    return this.minBet;
  }

  getMaxBet() {
    return this.maxBet;
  }

  info() {
    let info = `Гра ***"${this.title}"***\n`;
    info += `Банк: ${this.currCircle.bank}\n`;
    info += `Мінімальна ставка: ${this.currCircle.bet}\n`;
    info += `Очікування ходу: ${this.currCircle.underTheGun}\n`;
    info += `Дилер: ${this.dealer}`;

    return info;
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

  start(player) {
    if (player !== this.owner) {
      throw new Error('Розпочати гру може тільки адмін.');
    }

    this.emit('start', this);
    this.startPreFlop();
  }

  // метод повертає гравця який наступним має ходити
  // або false якщо всі гравці зробили хід або скинули карти.

  getNextUTG() {
    const { currCircle } = this;
    const { players } = this;
    const currUTGIndex = players.indexOf(currCircle.underTheGun);
    let nextUTGIndex = -1;

    for (let i = 1; i < players.length; i += 1) {
      const index = (i + currUTGIndex) % players.length;
      if (!players[index].isFold && players[index].bet !== currCircle.bet) {
        nextUTGIndex = index;
      }
    }
    if (nextUTGIndex === -1) {
      return false;
    }

    return players[nextUTGIndex];
  }

  // гра починається з пре-флопа
  // 1. колода тасується
  // 2. ініціалізується початкові значення круга
  // 3. кожному гравцеві роздається по дві карти

  startPreFlop() {
    this.currCircle = {
      round: round.preFlop,
      dealer: this.players[0],
      underTheGun: this.players[1],
      remainPlayers: this.players,
      pickedCard: [],
      boardCard: [],
      bet: 0,
      bank: 0,
      isEnd: false,
    };

    const { pickedCard } = this.currCircle;
    const { players } = this;

    players.forEach((p) => {
      const [c1, c2] = [this.deck.pickFront(), this.deck.pickFront()];
      pickedCard.push(c1, c2);
      p.setCards([c1, c2]);
    });

    this.emit('handOutPreFlopCards', this);
  }

  startFlop() {
    const { currCircle, players, deck } = this;

    currCircle.round = round.flop;
    currCircle.underTheGun = players[1];

    const [c1, c2, c3] = [deck.pickFront(), deck.pickFront(), deck.pickFront()];

    currCircle.pickedCard.push(c1, c2, c3);
    currCircle.boardCard.push(c1, c2, c3);

    this.emit('setFlopCards', this);
  }

  // далі кожен гравець повинний зробити свій хід
  // на префлопі гравці можуть поставити початкову ставку
  // підтримати ставку або підвищити її
  // а також вийти з гри скинувши карти

  requestMove() {
    const player = this.currCircle.underTheGun;
    const moves = this.getAvailableMoves(player);
    Sender.toPlayer(player, `Ваш хід.\n${moves}`);
  }

  getMovePlayer() {
    return this.currCircle.underTheGun;
  }

  move(player, type, sum) {
    if (player !== this.getMovePlayer()) {
      throw new Error('Зараз не ваш хід');
    }

    try {
      switch (type) {
        case moveType.bet: this.bet(player, sum); break;
        case moveType.call: this.call(player); break;
        case moveType.raise: this.raise(player, sum); break;
        case moveType.check: this.check(player); break;
        case moveType.fold: this.fold(player); break;
        default: throw new Error('Невідома команда');
      }
    } catch (err) {
      throw err;
    }
  }

  getAvailableMoves(player) {
    if (this.currCircle.underTheGun !== player) {
      return false;
    }

    let moves = '';

    if (this.currCircle.bet === 0) {
      moves += '▫️ ***/bet sum*** - зробити ставку sum\n';
      if (this.currCircle.round !== round.preFlop) {
        moves += '▫️ ***/check*** - пропустити ставку\n';
      }
    } else {
      moves += `▫️ ***/call*** - підтримати поточну ставку (${this.currCircle.bet})\n`;
      moves += '▫️ ***/raise sum*** - підвищити ставку на sum\n';
    }
    moves += '▫️ ***/fold*** - скинути карти\n';


    return moves;
  }

  isYouMove(player) {
    return (player.tid === this.currCircle.underTheGun);
  }


  // визначає наступного гравця для ходу,
  // якщо таких не залишилось в данному крузі
  // то почати наступний або розкрити карти якщо це кінець рівера

  moveEnd() {
    const utg = this.getNextUTG();
    if (!utg) {
      this.nextRound();
      return;
    }

    this.currCircle.underTheGun = utg;
    this.requestMove();
  }

  nextRound() {
    // всі гравці зробили ставки
    const { currCircle } = this;

    switch (currCircle.round) {
      // mocks
      case round.blind: this.startPreFlop(); break;
      case round.preFlop: this.startFlop(); break;
      case round.flop: this.startTurn(); break;
      case round.turn: this.startRiver(); break;
      case round.river: this.showDown(); break;
      default: return false;
    }

    return true;
  }

  bet(player, sum) { // зробити початкову ставку
    const { currCircle } = this;
    if (currCircle.bet !== 0) {
      throw new Error(`Початкова ставка уже зроблена: ${currCircle.bet}.\nВи можете підтримати її(/call), або підвищити (/raise sum)`);
    }

    if (sum === undefined) {
      throw new Error('Потрібно вказати суму ставки.\n***/bet*** sum');
    }

    if (sum <= this.minBet) {
      throw new Error(`Ставка має бути більше ${this.minBet}.`);
    }

    if (sum > this.maxBet) {
      throw new Error(`Ставка має бути більше ${this.maxBet}.`);
    }

    this.currCircle.bet = sum;
    this.currCircle.underTheGun.bet = sum;
    this.currCircle.bank += sum;
    this.emit('bet', { game: this, player, sum });
    this.moveEnd();
  }

  call() { // підтримати ставку
    const { currCircle } = this;
    const player = currCircle.underTheGun;
    if (currCircle.bet === 0) {
      throw new Error(`Початкова ставка ще не зроблена.\n ***/bet sum*** - щоб зробити ставку ${currCircle.round !== round.preFlop ? ', /check - не робити ставку' : ''}.`);
    }

    player.bet = currCircle.bet;
    currCircle.bank += this.currCircle.bet;

    this.emit('call', { game: this, player, sum: currCircle.bet });
    this.moveEnd();
  }

  raise() { // збільшити ставку

  }

  fold() { // пасс

  }

  check() { // відмова робити ставку

  }
}

module.exports = Game;
