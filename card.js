class Card {
  constructor(suit, order) {
    this.title = `[${suit.symbol}${order.symbol}]`;
    this.suit = suit;
    this.order = order;
  }
}

module.exports = Card;
