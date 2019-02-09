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

  static createCardSet(cardString) {
    const cards = [];
    cardString.split(':').forEach((card) => {
      cards.push(new Card(card));
    });
    return cards;
  }

  static sortCards(cards) {
    return cards.sort((card1, card2) => {
      if (card2.rank !== card1.rank) {
        return card2.rank - card1.rank;
      }
      return card1.suit.charCodeAt(0) - card2.suit.charCodeAt(0);
    });
  }

  getTitle() {
    return `${this.order.toUpperCase()}${emoji[this.suit]}`;
  }

  compare(card) {
    return (this.order === card.order && this.suit === card.suit);
  }
}

module.exports = Card;
