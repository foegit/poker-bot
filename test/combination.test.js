const assert = require('assert');

const Card = require('../cards/card');
const { isFlush } = require('../poker/utils');

describe('Test combination', () => {
  const empty = [];
  const notflush1 = [new Card('1d')];
  const notflush2 = [new Card('2d'), new Card('3d')];
  const notflush3 = [new Card('kh'), new Card('1c'), new Card('2s')];
  const notflush4 = [new Card('kh'), new Card('1c'), new Card('2s'), new Card('5h')];
  const notflush5 = [new Card('2s'), new Card('1c'), new Card('2s'), new Card('5h'), new Card('7c')];
  const flush1 = [new Card('2s'), new Card('3s'), new Card('4s'), new Card('5s'), new Card('6s')];
  const flush2 = [new Card('tc'), new Card('jc'), new Card('qc'), new Card('kc'), new Card('ac')];
  const flush3 = [new Card('3h'), new Card('tc'), new Card('jc'), new Card('jd'), new Card('qc'), new Card('kc'), new Card('ac')];

  const royalFlush1 = [new Card('3h'), new Card('tc'), new Card('jc'), new Card('qc'), new Card('kc'), new Card('8s'), new Card('ac')];
  const streightFlush1 = [new Card('3h'), new Card('4h'), new Card('5h'), new Card('7d'), new Card('6h'), new Card('7h'), new Card('ac')];

  it('Flush', () => {
    assert.equal(isFlush(empty), false);
    assert.equal(isFlush(notflush1), false);
    assert.equal(isFlush(notflush2), false);
    assert.equal(isFlush(notflush3), false);
    assert.equal(isFlush(notflush4), false);
    assert.equal(isFlush(notflush5), false);
    assert.equal(isFlush(flush1), true);
    assert.equal(isFlush(flush2), true);
    assert.equal(isFlush(flush3), true);
    assert.equal(isFlush(royalFlush1), true);
    assert.equal(isFlush(streightFlush1), true);
  });
});
