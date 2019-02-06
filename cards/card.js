const emoji = require('./data/emoji');

class Card {
  constructor(card) {
    [this.order, this.suit] = card;
  }

  getTitle() {
    return `${this.order.toUpperCase()}${emoji[this.suit]}`;
  }
}

module.exports = Card;
