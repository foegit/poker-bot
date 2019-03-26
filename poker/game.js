const Emitter = require('events');

const Deck = require('../cards/deck');
const Sender = require('../controllers/sender');
const moveType = require('../const/move');
const round = require('../const/gameRound');
const combination = require('../poker/combination');
const Text = require('../messeges/messege');
const GError = require('./gError');
const GCheck = require('./gChecker');

class Game extends Emitter {
  constructor(gameId, title, player) {
    super();
    this.id = gameId;
    this.title = title;
    this.active = false;
    this.players = [player];
    this.owner = player;
    this.deck = new Deck();
    this.minBet = 0;
    this.maxBet = 100;
    this.deposit = 0;

    this.currCircle = {
      round: round.preFlop,
      dealer: null,
      underTheGun: null,
      pickedCard: [],
      bet: 0,
      bank: 0,
      boardCard: [],
    };

    this.join = this.join.bind(this);
    this.leave = this.leave.bind(this);

    this.on('newcircle', this.startPreFlop);
    this.on('endcircle', this.startCircle);
    this.on('start', this.startCircle);
    this.on('bet', this.moveEnd);
    this.on('call', this.moveEnd);
    this.on('fold', this.moveEnd);
    this.on('raise', this.moveEnd);
    this.on('check', this.moveEnd);
    this.emit('create', this);

    this.gCheck = new GCheck(this);
  }

  start(player) {
    if (player !== this.owner) {
      const error = 'Розпочати гру може тільки адмін.';
      this.emit('error', new GError(player, error));
      return;
    }

    if (this.active) {
      const error = 'Гра уже запущенна.';
      this.emit('error', new GError(player, error));
      return;
    }

    if (this.players.length < 2) {
      const error = 'Недостатньо гравців.';
      this.emit('error', new GError(player, error));
      return;
    }

    this.active = true;
    this.emit('start', { game: this, player });
  }

  startCircle() {
    const { currCircle, players, deck } = this;

    players.push(players.shift());
    players.forEach((p) => {
      p.reset();
    });

    currCircle.round = round.preFlop;
    [currCircle.dealer, currCircle.underTheGun] = players;
    currCircle.activePlayer = players.length;
    currCircle.pickedCard = [];
    currCircle.boardCard = [];
    currCircle.bank = this.deposit;
    currCircle.bet = 0;

    this.deposit = 0;

    deck.pushBack(currCircle.pickedCard);
    deck.shuffle();

    this.emit('newcircle', { game: this });
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
    info += `Дилер: ${this.dealer}`;
    info += `Ставка: ${this.currCircle.bet}\n`;
    info += `Очікування ходу: ${this.currCircle.underTheGun.getTitle()}\n`;

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

  // метод повертає гравця який наступним має ходити
  // або false якщо всі гравці зробили хід або скинули карти.

  getNextUTG() {
    const { currCircle } = this;
    const { players } = this;
    const currUTGIndex = players.indexOf(currCircle.underTheGun);
    let nextUTGIndex = -1;

    for (let i = 1; i < players.length; i += 1) {
      const index = (i + currUTGIndex) % players.length;
      if (players[index].isFold) {
        break;
      }

      if (players[index].isCheck && currCircle.bet === 0) {
        break;
      }

      if (players[index].bet === currCircle.bet && players[index].bet !== 0) {
        break;
      }
      nextUTGIndex = index;
    }
    if (nextUTGIndex === -1) {
      return false;
    }

    return players[nextUTGIndex];
  }

  startPreFlop() {
    const { pickedCard } = this.currCircle;
    const { players } = this;

    players.forEach((p) => {
      const [c1, c2] = [this.deck.pickFront(), this.deck.pickFront()];
      pickedCard.push(c1, c2);
      p.setCards([c1, c2]);
    });

    this.emit('handOutPreFlopCards', { game: this });
    this.emit('wait', { game: this });
  }

  startFlop() {
    const { currCircle, players, deck } = this;

    currCircle.round = round.flop;
    [, currCircle.underTheGun] = players;
    currCircle.bet = 0;
    players.forEach(p => p.cleanBet());

    const [c1, c2, c3] = [deck.pickFront(), deck.pickFront(), deck.pickFront()];

    currCircle.pickedCard.push(c1, c2, c3);
    currCircle.boardCard.push(c1, c2, c3);

    this.emit('setFlopCards', { game: this });
    this.emit('wait', { game: this });
  }

  startTurn() {
    const { currCircle, players, deck } = this;

    currCircle.round = round.turn;
    [, currCircle.underTheGun] = players;
    currCircle.bet = 0;
    players.forEach(p => p.cleanBet());

    const c1 = deck.pickFront();

    currCircle.pickedCard.push(c1);
    currCircle.boardCard.push(c1);

    this.emit('setTurnCard', { game: this });
    this.emit('wait', { game: this });
  }

  startRiver() {
    const { currCircle, players, deck } = this;
    currCircle.round = round.river;
    [, currCircle.underTheGun] = players;
    currCircle.bet = 0;
    players.forEach(p => p.cleanBet());

    const c1 = deck.pickFront();

    currCircle.pickedCard.push(c1);
    currCircle.boardCard.push(c1);

    this.emit('setRiverCard', { game: this });
    this.emit('wait', { game: this });
  }

  showDown() {
    const { currCircle, players } = this;
    let maxComb = { rank: 0 };

    players.forEach((p) => {
      const playerComb = combination.getStrongestComb(p.cards, currCircle.boardCard);
      p.setComb(playerComb);

      if (playerComb.rank > maxComb.rank) {
        maxComb = playerComb;
      } else if (playerComb.rank === maxComb.rank) {
        for (let j = 0; j < playerComb.cards.length; j += 1) {
          if (playerComb.cards[j].greaterThan(maxComb.cards[j])) {
            maxComb = playerComb;
            break;
          }
        }
      }
    });

    const winners = players.filter(p => (p.comb.rank === maxComb.rank)
      && (p.comb.cards[0].equal(maxComb.cards[0])));

    const remPartOfBank = currCircle.bank % winners.length;
    const bank = currCircle.bank - remPartOfBank;

    const prize = bank / winners.length;

    players.forEach(p => p.takeAwayBet());
    winners.forEach(w => w.replenish(prize));

    this.deposit = remPartOfBank;

    this.emit('showdown', { game: this, players: winners, sum: prize });
    this.emit('endcircle', { game: this });
  }

  aheadWinner() {
    const { currCircle, players } = this;
    const lastPlayer = players.find(p => !(p.isFold));
    const prize = currCircle.bank;
    const upPrize = prize - lastPlayer.bet;

    players.forEach(p => p.takeAwayBet());

    lastPlayer.replenish(prize);

    this.emit('aheadWinner', { game: this, player: lastPlayer, sum: upPrize });
    this.emit('endcircle', { game: this });
  }


  // далі кожен гравець повинний зробити свій хід
  // на префлопі гравці можуть поставити початкову ставку
  // підтримати ставку або підвищити її
  // а також вийти з гри скинувши карти

  async requestMove() {
    const { currCircle } = this;
    const player = currCircle.underTheGun;
    const moves = this.getAvailableMoves(player);
    try {
      await Sender.toPlayer(player, Text.moveRequest(player.cards, currCircle.boardCard, moves));
    } catch (err) {
      throw err;
    }
  }

  getMovePlayer() {
    return this.currCircle.underTheGun;
  }

  move(player, type, sum) {
    if (player !== this.getMovePlayer()) {
      this.emit('error', new GError(player, 'Зараз не ваш хід', 200));
      return;
    }

    const { gCheck } = this;
    try {
      switch (type) {
        case moveType.bet: {
          const err = gCheck.bet(player, sum);
          if (err) {
            this.emit('error', err);
            return;
          }
          this.bet(player, sum);
          break;
        }
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
    if (this.currCircle.activePlayer === 1) {
      this.aheadWinner();
      return;
    }
    const utg = this.getNextUTG();
    if (!utg) {
      this.nextRound();
      return;
    }

    this.currCircle.underTheGun = utg;
    this.emit('wait', { game: this });
  }

  nextRound() {
    // всі гравці зробили ставки
    const { currCircle, players } = this;

    players.forEach(p => p.cleanCheck());

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
    currCircle.bet = sum;
    currCircle.bank += sum;
    player.setBet(sum);

    this.emit('bet', { game: this, player, sum });
  }

  call() { // підтримати ставку
    const { currCircle } = this;
    const player = currCircle.underTheGun;
    if (currCircle.bet === 0) {
      throw new Error(`Початкова ставка ще не зроблена.\n ***/bet sum*** - щоб зробити ставку ${currCircle.round !== round.preFlop ? ', /check - не робити ставку' : ''}.`);
    }

    player.setBet(currCircle.bet);
    currCircle.bank += this.currCircle.bet;

    this.emit('call', { game: this, player, sum: currCircle.bet });
  }

  raise(player, sum) { // збільшити ставку
    const { currCircle } = this;
    if (currCircle.bet === 0) {
      throw new Error(`Початкова ставка ще не зроблена.\n ***/bet sum*** - щоб зробити ставку ${currCircle.round !== round.preFlop ? ', /check - не робити ставку' : ''}.`);
    }

    const newBet = currCircle.bet + sum; // розмір нової ставки
    const playerGrowBet = newBet - player.bet; // на скільки зросте персональна ставка гравця

    currCircle.bet = newBet;
    currCircle.bank += playerGrowBet;
    player.upBet(playerGrowBet);

    this.emit('raise', { game: this, player, sum });
  }

  fold() { // пасс
    const { currCircle } = this;
    const player = currCircle.underTheGun;
    player.isFold = true;
    this.currCircle.activePlayer -= 1;

    this.emit('fold', { game: this, player });
  }

  check() { // відмова робити ставку
    const { currCircle } = this;
    const player = currCircle.underTheGun;

    player.makeCheck();
    this.emit('check', { game: this, player });
  }
}

module.exports = Game;
