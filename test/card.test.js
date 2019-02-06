const assert = require('assert');

const Card = require('../cards/card');

describe('Card object', () => {
  const card1 = new Card('2s');
  const card2 = new Card('kc');
  const card3 = new Card('th');
  const card4 = new Card('ad');

  it('Create new card', () => {
    assert.deepEqual(card1, { suit: 's', order: '2' });
  });
  it('Title', () => {
    assert.equal(card1.getTitle(), '2♠️');
    assert.equal(card2.getTitle(), 'K♣️');
    assert.equal(card3.getTitle(), 'T♥️');
    assert.equal(card4.getTitle(), 'A♦️');
  });
});
