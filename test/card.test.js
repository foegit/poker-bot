const assert = require('assert');

const Card = require('../cards/card');
const NullCard = require('../cards/nullcard');

describe('Card object', () => {
  const card1 = new Card('2s');
  const card2 = new Card('kc');
  const card3 = new Card('th');
  const card4 = new Card('ad');

  it('Create new card', () => {
    assert.deepEqual(card1, { suit: 's', order: '2', rank: 2 });
    assert.deepEqual(card2, { suit: 'c', order: 'k', rank: 13 });
    assert.deepEqual(card3, { suit: 'h', order: 't', rank: 10 });
    assert.deepEqual(card4, { suit: 'd', order: 'a', rank: 14 });
    try {
      assert.throws(() => { Card('1c'); });
    } catch (err) {
      console.log(err);
    }
  });
  it('Null card', () => {
    assert.deepEqual(new NullCard(), { suit: 'd', order: '1', rank: 1 });
  });

  it('Title', () => {
    assert.equal(card1.getTitle(), '2♠️');
    assert.equal(card2.getTitle(), 'K♣️');
    assert.equal(card3.getTitle(), 'T♥️');
    assert.equal(card4.getTitle(), 'A♦️');
  });
});
