const assert = require('assert');

const Card = require('../cards/card');
const {
  isFlush,
  isStreight,
  isStreightFlush,
  isRoyalFlush,
} = require('../poker/utils');

describe('Combination', () => {
  // impossible comb in game
  const empty = { hand: [], board: [] };
  const notflush1 = { hand: [new Card('2d')], board: [] };
  const notflush3 = {
    hand: [new Card('kh'), new Card('2c')],
    board: [new Card('2s')],
  };
  const notflush4 = {
    hand: [new Card('kh'), new Card('2c')],
    board: [new Card('2s'), new Card('5h')],
  };

  // possible comb in game
  const notflush2 = { hand: [new Card('2d'), new Card('3d')], board: [] }; // blind
  const notflush5 = {
    hand: [new Card('2s'), new Card('2c')],
    board: [new Card('5h'), new Card('7c'), new Card('ks')],
  }; // flop

  const flush1 = {
    hand: [new Card('2s'), new Card('3s')],
    board: [new Card('4s'), new Card('5s'), new Card('6s')],
  }; // flop
  const flush1comb = [new Card('6s'), new Card('5s'), new Card('4s'), new Card('3s'), new Card('2s')];

  const flush2 = {
    hand: [new Card('tc'), new Card('jc')],
    board: [new Card('qc'), new Card('kc'), new Card('3c')],
  }; // flop
  const flush2comb = [new Card('kc'), new Card('qc'), new Card('jc'), new Card('tc'), new Card('3c')];

  const flush3 = {
    hand: [new Card('3c'), new Card('tc')],
    board: [new Card('jc'), new Card('ac'), new Card('4c'), new Card('7c')],
  }; // turn
  const flush3comb = [new Card('ac'), new Card('jc'), new Card('tc'), new Card('7c'), new Card('4c')];

  const flush4 = {
    hand: [new Card('3h'), new Card('5c')],
    board: [new Card('3c'), new Card('4h'), new Card('jh'), new Card('kh'), new Card('th')],
  }; // river
  const flush4comb = [new Card('kh'), new Card('jh'), new Card('th'), new Card('4h'), new Card('3h')];

  const royalFlush1 = {
    hand: [new Card('3h'), new Card('tc')],
    board: [new Card('jc'), new Card('qc'), new Card('kc'), new Card('8s'), new Card('ac')],
  };
  const royalFlush1comb = [new Card('ac'), new Card('kc'), new Card('qc'), new Card('jc'), new Card('tc')];

  const streightFlush1 = {
    hand: [new Card('3h'), new Card('4h')],
    board: [new Card('5h'), new Card('kd'), new Card('6h'), new Card('7h'), new Card('ac')],
  };
  const streightFlush1comb = [new Card('7h'), new Card('6h'), new Card('5h'), new Card('4h'), new Card('3h')];

  const streight1 = {
    hand: [new Card('kh'), new Card('th')],
    board: [new Card('jc'), new Card('9s'), new Card('6h'), new Card('qc'), new Card('2c')],
  };
  const streight1comb = [new Card('kh'), new Card('qc'), new Card('jc'), new Card('th'), new Card('9s')];

  const streight2 = {
    hand: [new Card('kh'), new Card('5h')],
    board: [new Card('jc'), new Card('3s'), new Card('4h'), new Card('ac'), new Card('2c')],
  };
  const streight2comb = [new Card('5h'), new Card('4h'), new Card('3s'), new Card('2c'), new Card('ac')];

  it('Royal flush', () => {
    assert.equal(isRoyalFlush(streightFlush1.hand, streightFlush1.board), false);
    assert.equal(isRoyalFlush(flush1.hand, flush1.board), false);
    assert.deepEqual(isRoyalFlush(royalFlush1.hand, royalFlush1.board),
      { rank: 10, cards: royalFlush1comb, kicker: [] });
  });

  it('Streight flush', () => {
    assert.equal(isStreightFlush(flush2.hand, flush2.board), false);

    assert.deepEqual(isStreightFlush(streightFlush1.hand, streightFlush1.board),
      { rank: 9, cards: streightFlush1comb, kicker: [] });
  });

  it('Flush', () => {
    assert.deepEqual(isFlush(empty.hand, empty.board), false);
    assert.deepEqual(isFlush(notflush1.hand, notflush1.board), false);
    assert.deepEqual(isFlush(notflush2.hand, notflush2.board), false);
    assert.deepEqual(isFlush(notflush3.hand, notflush3.board), false);
    assert.deepEqual(isFlush(notflush4.hand, notflush4.board), false);
    assert.deepEqual(isFlush(notflush5.hand, notflush5.board), false);

    assert.deepEqual(isFlush(flush1.hand, flush1.board),
      { rank: 6, cards: flush1comb, kicker: [] });
    assert.deepEqual(isFlush(flush2.hand, flush2.board),
      { rank: 6, cards: flush2comb, kicker: [] });
    assert.deepEqual(isFlush(flush3.hand, flush3.board),
      { rank: 6, cards: flush3comb, kicker: [] });
    assert.deepEqual(isFlush(flush4.hand, flush4.board),
      { rank: 6, cards: flush4comb, kicker: [] });
    assert.deepEqual(isFlush(royalFlush1.hand, royalFlush1.board),
      { rank: 6, cards: royalFlush1comb, kicker: [] });
    assert.deepEqual(isFlush(streightFlush1.hand, streightFlush1.board),
      { rank: 6, cards: streightFlush1comb, kicker: [] });
  });

  it('Streight', () => {
    assert.deepEqual(isStreight(streightFlush1.hand, streightFlush1.board),
      { rank: 5, cards: streightFlush1comb, kicker: [] });
    assert.deepEqual(isStreight(streight1.hand, streight1.board),
      { rank: 5, cards: streight1comb, kicker: [] });
    assert.deepEqual(isStreight(streight2.hand, streight2.board),
      { rank: 5, cards: streight2comb, kicker: [] });
  });
});
