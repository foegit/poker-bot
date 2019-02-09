const assert = require('assert');

const Card = require('../cards/card');
const {
  isStreightFlush,
  isRoyalFlush,
  isFourOfAKind,
  isFullHouse,
  isFlush,
  isStreight,
  isThreeOfAKind,
  isTwoPair,
  isPair,
  isHighCard,
  getSameOrderCard,
  getStrongestComb,
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
  };
  const flush1comb = [new Card('6s'), new Card('5s'), new Card('4s'), new Card('3s'), new Card('2s')];

  const flush2 = {
    hand: [new Card('tc'), new Card('jc')],
    board: [new Card('qc'), new Card('kc'), new Card('3c')],
  };
  const flush2comb = [new Card('kc'), new Card('qc'), new Card('jc'), new Card('tc'), new Card('3c')];

  const flush3 = {
    hand: [new Card('3c'), new Card('tc')],
    board: [new Card('jc'), new Card('ac'), new Card('4c'), new Card('7c')],
  };
  const flush3comb = [new Card('ac'), new Card('jc'), new Card('tc'), new Card('7c'), new Card('4c')];

  const flush4 = {
    cards: {
      hand: [new Card('3h'), new Card('5c')],
      board: [new Card('3c'), new Card('4h'), new Card('jh'), new Card('kh'), new Card('th')],
    },
    comb: Card.createCardSet('kh:jh:th:4h:3h'),
    kicker: [],
  };

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
    cards: {
      hand: Card.createCardSet('kh:th'),
      board: Card.createCardSet('jc:9s:6h:qc:2c'),
    },
    comb: Card.createCardSet('kh:qc:jc:th:9s'),
    kicker: [],
  };

  const streight2 = {
    hand: [new Card('kh'), new Card('5h')],
    board: [new Card('jc'), new Card('3s'), new Card('4h'), new Card('ac'), new Card('2c')],
  };
  const streight2comb = [new Card('5h'), new Card('4h'), new Card('3s'), new Card('2c'), new Card('ac')];

  const foak1 = {
    cards: {
      hand: Card.createCardSet('kh:5h'),
      board: Card.createCardSet('jc:ks:4h:kc:kd'),
    },
    comb: Card.createCardSet('kc:kd:kh:ks'),
    kicker: Card.createCardSet('5h'),
  };

  const toak1 = {
    cards: {
      hand: Card.createCardSet('kh:5h'),
      board: Card.createCardSet('jc:2s:4h:kc:kd'),
    },
    comb: Card.createCardSet('kc:kd:kh'),
    kicker: Card.createCardSet('5h'),
  };
  const toak2 = {
    cards: {
      hand: Card.createCardSet('qh:5h'),
      board: Card.createCardSet('jc:ks:4h:kc:kd'),
    },
    comb: Card.createCardSet('kc:kd:ks'),
    kicker: Card.createCardSet('qh:5h'),
  };

  const pair1 = {
    cards: {
      hand: Card.createCardSet('ah:5h'),
      board: Card.createCardSet('ac:js:4h:tc:2d'),
    },
    comb: Card.createCardSet('ac:ah'),
    kicker: Card.createCardSet('5h'),
  };

  const twopair1 = {
    cards: {
      hand: Card.createCardSet('ah:5h'),
      board: Card.createCardSet('ac:js:4h:kc:kd'),
    },
    comb: Card.createCardSet('ac:ah:kc:kd'),
    kicker: Card.createCardSet('5h'),
  };

  const fullhouse1 = {
    cards: {
      hand: Card.createCardSet('ah:as'),
      board: Card.createCardSet('ac:js:4h:kc:kd'),
    },
    comb: Card.createCardSet('ac:ah:as:kc:kd'),
    kicker: [],
  };

  const fullhouse2 = {
    cards: {
      hand: Card.createCardSet('ah:ks'),
      board: Card.createCardSet('ac:js:4h:kc:kd'),
    },
    comb: Card.createCardSet('kc:kd:ks:ac:ah'),
    kicker: [],
  };

  const fullhouse3 = {
    cards: {
      hand: Card.createCardSet('ah:qs'),
      board: Card.createCardSet('qc:qh:4h:kc:kd'),
    },
    comb: Card.createCardSet('qc:qh:qs:kc:kd'),
    kicker: Card.createCardSet('ah'),
  };

  const hightcard1 = {
    cards: {
      hand: Card.createCardSet('ah:qs'),
      board: Card.createCardSet('tc:5h:3h:7c:2d'),
    },
    comb: Card.createCardSet('ah'),
    kicker: Card.createCardSet('qs'),
  };

  // const foak1comb = ;

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

  it('Four of a kind', () => {
    assert.deepEqual(isFourOfAKind(foak1.cards.hand, foak1.cards.board), {
      rank: 8, cards: foak1.comb, kicker: foak1.kicker,
    });
    assert.equal(isFourOfAKind(streight1.cards.hand, streight1.cards.board), false);
  });

  it('Full house', () => {
    assert.deepEqual(isFullHouse(fullhouse1.cards.hand, fullhouse1.cards.board), {
      rank: 7, cards: fullhouse1.comb, kicker: fullhouse1.kicker,
    });
    assert.deepEqual(isFullHouse(fullhouse2.cards.hand, fullhouse2.cards.board), {
      rank: 7, cards: fullhouse2.comb, kicker: fullhouse2.kicker,
    });
    assert.deepEqual(isFullHouse(fullhouse3.cards.hand, fullhouse3.cards.board), {
      rank: 7, cards: fullhouse3.comb, kicker: fullhouse3.kicker,
    });
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
    assert.deepEqual(isFlush(flush4.cards.hand, flush4.cards.board),
      { rank: 6, cards: flush4.comb, kicker: flush4.kicker });
    assert.deepEqual(isFlush(royalFlush1.hand, royalFlush1.board),
      { rank: 6, cards: royalFlush1comb, kicker: [] });
    assert.deepEqual(isFlush(streightFlush1.hand, streightFlush1.board),
      { rank: 6, cards: streightFlush1comb, kicker: [] });
  });

  it('Streight', () => {
    assert.deepEqual(isStreight(streightFlush1.hand, streightFlush1.board),
      { rank: 5, cards: streightFlush1comb, kicker: [] });
    assert.deepEqual(isStreight(streight1.cards.hand, streight1.cards.board),
      { rank: 5, cards: streight1.comb, kicker: streight1.kicker });
    assert.deepEqual(isStreight(streight2.hand, streight2.board),
      { rank: 5, cards: streight2comb, kicker: [] });
  });

  it('Three of a kind', () => {
    assert.deepEqual(isThreeOfAKind(toak1.cards.hand, toak1.cards.board), {
      rank: 4, cards: toak1.comb, kicker: toak1.kicker,
    });
    assert.deepEqual(isThreeOfAKind(toak2.cards.hand, toak2.cards.board), {
      rank: 4, cards: toak2.comb, kicker: toak2.kicker,
    });
    assert.equal(isThreeOfAKind(streight1.cards.hand, streight1.cards.board), false);
  });

  it('Two pair', () => {
    assert.deepEqual(isTwoPair(twopair1.cards.hand, twopair1.cards.board), {
      rank: 3, cards: twopair1.comb, kicker: twopair1.kicker,
    });
  });


  it('Pair', () => {
    assert.deepEqual(isPair(pair1.cards.hand, pair1.cards.board), {
      rank: 2, cards: pair1.comb, kicker: pair1.kicker,
    });
    assert.deepEqual(isPair(twopair1.cards.hand, twopair1.cards.board), {
      rank: 2, cards: Card.createCardSet('ac:ah'), kicker: Card.createCardSet('5h'),
    });
  });

  it('Hight card', () => {
    assert.deepEqual(isHighCard(hightcard1.cards.hand, hightcard1.cards.board), {
      rank: 1, cards: hightcard1.comb, kicker: hightcard1.kicker,
    });
  });

  it('Strongest combination', () => {
    assert.equal(getStrongestComb(royalFlush1.hand, royalFlush1.board).rank, 10);
    assert.equal(getStrongestComb(streightFlush1.hand, streightFlush1.board).rank, 9);
    assert.equal(getStrongestComb(foak1.cards.hand, foak1.cards.board).rank, 8);
    assert.equal(getStrongestComb(fullhouse1.cards.hand, fullhouse1.cards.board).rank, 7);
    assert.equal(getStrongestComb(flush4.cards.hand, flush4.cards.board).rank, 6);
    assert.equal(getStrongestComb(streight1.cards.hand, streight1.cards.board).rank, 5);
    assert.equal(getStrongestComb(toak1.cards.hand, toak1.cards.board).rank, 4);
    assert.equal(getStrongestComb(twopair1.cards.hand, twopair1.cards.board).rank, 3);
    assert.equal(getStrongestComb(pair1.cards.hand, pair1.cards.board).rank, 2);
    assert.equal(getStrongestComb(hightcard1.cards.hand, hightcard1.cards.board).rank, 1);
  });

  it('N the same order cards', () => {
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:qc:3s:2h:2s'), 2),
      Card.createCardSet('qc:qd'));
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:qc:3s:2h:2s'), 2, 2),
      Card.createCardSet('2h:2s'));
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:3c:3s:3h:ks'), 2),
      Card.createCardSet('3c:3h'));
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:3c:3s:3h:ks'), 2, 2),
      Card.createCardSet('3h:3s'));
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:3c:3s:3h:3d'), 2),
      Card.createCardSet('3c:3d'));
    assert.deepEqual(getSameOrderCard(Card.createCardSet('qd:3c:3s:3h:3d'), 2, 3),
      Card.createCardSet('3h:3s'));
  });
});
