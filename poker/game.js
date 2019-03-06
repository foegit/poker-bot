
// const Player = require('../db/models/player');
const Deck = require('../cards/deck');

const status = {
  WAIT_PLAYER: 'Очікування гравців',
};

class Game {
  constructor(gameId, title, player) {
    this.id = gameId;
    this.title = title;
    this.players = [];
    this.players.push(player);
    this.owner = player;

    this.deck = new Deck();
    this.pickedCards = [];
    this.dealer = player.tid;

    this.currentPlayer = player.tid;
    this.status = status.WAIT_PLAYER;
    this.isEnd = false;

    this.join = this.join.bind(this);
    this.leave = this.leave.bind(this);
  }

  pongCard() {
    const card = this.deck.pickFront();
    this.deck.pushBack(card);
    return card;
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
}

module.exports = Game;