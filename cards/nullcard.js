const Card = require('./card');

class NullCard extends Card {
  constructor(card = '2d') {
    super(card);
    this.order = '1';
    this.rank = 1;
  }
}

module.exports = NullCard;
