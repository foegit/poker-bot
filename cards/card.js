const emoji = require('./data/emoji');
const ranks = require('./data/ranks');

class Card {
  constructor(card) {
    if ('23456789tjqka'.includes(card[0]) && 'dchs'.includes(card[1])) {
      [this.order, this.suit] = card;
      this.rank = ranks[this.order];
    } else {
      throw new Error(`Wrond card code! '${card}'`);
    }
  }

  getTitle() {
    return `${this.order.toUpperCase()}${emoji[this.suit]}`;
  }
}

module.exports = Card;
