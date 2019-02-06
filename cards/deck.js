const _ = require('lodash');

const Card = require('./card');

const suits = require('./data/suits');
const orders = require('./data/orders.json');


class Deck {
  constructor() {
    this.cards = [];
    orders.forEach(
      order => suits.forEach(
        suit => this.cards.push(new Card(suit.symbol, order.symbol)),
      ),
    );
    this.shuffle();
  }

  getRandomCard() {
    return _.sample(this.cards);
  }

  shuffle() {
    const { cards } = this;
    let currentIndex = cards.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = cards[currentIndex];
      cards[currentIndex] = cards[randomIndex];
      cards[randomIndex] = temporaryValue;
    }
  }
}

module.exports = Deck;
