class Card {
  constructor(suit, order) {
    this.title = `[${suit.emoji}${order.symbol}]`;
    this.suit = suit;
    this.order = order;
  }
}

module.exports = Card;
