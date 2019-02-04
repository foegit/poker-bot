const Deck = require('./deck');

class Game {
  constructor() {
    this.deck = new Deck();
    this.players = []; // player array
  }
}

module.exports = Game;
