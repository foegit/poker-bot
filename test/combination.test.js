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
} = require('../poker/combination');

describe('Combination', () => {
  it('Hight card', () => {
    assert.deepEqual(isHighCard(Card.set('ah:qs'), Card.set('tc:5h:3h:7c:2d')), {
      rank: 1,
      cards: Card.set('ah'),
      hand: Card.set('ah:qs'),
      board: Card.set('tc:5h:3h:7c:2d'),
      kicker: Card.set('qs'),
    });
  });

  it('Pair', () => {
    assert.deepEqual(isPair(Card.set('ah:5h'), Card.set('ac:js:4h:kc:kd')), {
      rank: 2,
      cards: Card.set('ac:ah'),
      hand: Card.set('ah:5h'),
      board: Card.set('ac:js:4h:kc:kd'),
      kicker: Card.set('kc:kd:js'),
    });
  });

  it('Two pair', () => {
    assert.deepEqual(isTwoPair(Card.set('ah:ac'), Card.set('kc:js:4c:4h:3d')), {
      rank: 3,
      hand: Card.set('ah:ac'),
      board: Card.set('kc:js:4c:4h:3d'),
      cards: Card.set('ac:ah:4c:4h'),
      kicker: Card.set('kc'),
    });
  });

  it('Three of a kind', () => {
    assert.deepEqual(isThreeOfAKind(Card.set('kh:6h'), Card.set('js:2s:4h:kc:kd')), {
      rank: 4,
      cards: Card.set('kc:kd:kh'),
      hand: Card.set('kh:6h'),
      board: Card.set('js:2s:4h:kc:kd'),
      kicker: Card.set('js:6h'),
    });
  });

  it('Streight', () => {
    assert.deepEqual(isStreight(Card.set('kh:5h'), Card.set('jc:3s:4h:ac:2c')), {
      rank: 5,
      hand: Card.set('kh:5h'),
      board: Card.set('jc:3s:4h:ac:2c'),
      cards: Card.set('5h:4h:3s:2c:ac'),
      kicker: [],
    });

    assert.deepEqual(isStreight(Card.set('kh:th'), Card.set('jc:9s:6h:qc:2c')), {
      rank: 5,
      cards: Card.set('kh:qc:jc:th:9s'),
      hand: Card.set('kh:th'),
      board: Card.set('jc:9s:6h:qc:2c'),
      kicker: [],
    });

    assert.deepEqual(isStreight(Card.set('7s:tc'), Card.set('6d:qs:5s:9d:8d')), {
      rank: 5,
      cards: Card.set('tc:9d:8d:7s:6d'),
      hand: Card.set('7s:tc'),
      board: Card.set('6d:qs:5s:9d:8d'),
      kicker: [],
    });
  });

  it('Flush', () => {
    assert.deepEqual(isFlush(Card.set(''), Card.set('')), false);
    assert.deepEqual(isFlush(Card.set('2d:3d'), Card.set('')), false);
    assert.deepEqual(isFlush(Card.set('2c:3s'), Card.set('5h:7c:ks')), false);

    assert.deepEqual(isFlush(Card.set('2s:3s'), Card.set('4s:5s:6s')), {
      rank: 6,
      cards: Card.set('6s:5s:4s:3s:2s'),
      hand: Card.set('2s:3s'),
      board: Card.set('4s:5s:6s'),
      kicker: [],
    });

    assert.deepEqual(isFlush(Card.set('tc:jc'), Card.set('qc:kc:3c')), {
      rank: 6,
      cards: Card.set('kc:qc:jc:tc:3c'),
      hand: Card.set('tc:jc'),
      board: Card.set('qc:kc:3c'),
      kicker: [],
    });

    assert.deepEqual(isFlush(Card.set('3c:tc'), Card.set('jc:ac:4c:7c')), {
      rank: 6,
      cards: Card.set('ac:jc:tc:7c:4c'),
      hand: Card.set('3c:tc'),
      board: Card.set('jc:ac:4c:7c'),
      kicker: [],
    });

    assert.deepEqual(isFlush(Card.set('3h:5c'), Card.set('3c:4h:jh:kh:th')), {
      rank: 6,
      cards: Card.set('kh:jh:th:4h:3h'),
      hand: Card.set('3h:5c'),
      board: Card.set('3c:4h:jh:kh:th'),
      kicker: [],
    });
  });

  it('Full house', () => {
    assert.deepEqual(isFullHouse(Card.set('ah:qs'), Card.set('qc:qh:4h:kc:kd')), {
      rank: 7,
      cards: Card.set('qc:qh:qs:kc:kd'),
      hand: Card.set('ah:qs'),
      board: Card.set('qc:qh:4h:kc:kd'),
      kicker: [],
    });

    assert.deepEqual(isFullHouse(Card.set('ah:ks'), Card.set('ac:js:4h:kc:kd')), {
      rank: 7,
      cards: Card.set('kc:kd:ks:ac:ah'),
      hand: Card.set('ah:ks'),
      board: Card.set('ac:js:4h:kc:kd'),
      kicker: [],
    });

    assert.deepEqual(isFullHouse(Card.set('ah:as'), Card.set('ac:js:4h:kc:kd')), {
      rank: 7,
      cards: Card.set('ac:ah:as:kc:kd'),
      hand: Card.set('ah:as'),
      board: Card.set('ac:js:4h:kc:kd'),
      kicker: [],
    });
  });

  it('Four of a kind', () => {
    assert.deepEqual(isFourOfAKind(Card.set('kh:5h'), Card.set('js:ks:4h:kc:kd')), {
      rank: 8,
      cards: Card.set('kc:kd:kh:ks'),
      hand: Card.set('kh:5h'),
      board: Card.set('js:ks:4h:kc:kd'),
      kicker: Card.set('js'),
    });
  });

  it('Streight flush', () => {
    assert.deepEqual(isStreightFlush(Card.set('3h:4h'), Card.set('5h:kd:6h:7h:ac')), {
      rank: 9,
      cards: Card.set('7h:6h:5h:4h:3h'),
      hand: Card.set('3h:4h'),
      board: Card.set('5h:kd:6h:7h:ac'),
      kicker: [],
    });
  });

  it('Royal flush', () => {
    assert.deepEqual(isRoyalFlush(Card.set('3h:tc'), Card.set('jc:qc:kc:8c:ac')), {
      rank: 10,
      cards: Card.set('ac:kc:qc:jc:tc'),
      hand: Card.set('3h:tc'),
      board: Card.set('jc:qc:kc:8c:ac'),
      kicker: [],
    });
  });

  it('Strongest combination', () => {
    assert.equal(getStrongestComb(Card.set('3h:tc'), Card.set('jc:qc:kc:8c:ac')).rank, 10);
    assert.equal(getStrongestComb(Card.set('3h:4h'), Card.set('5h:kd:6h:7h:ac')).rank, 9);
    assert.equal(getStrongestComb(Card.set('kh:5h'), Card.set('js:ks:4h:kc:kd')).rank, 8);
    assert.equal(getStrongestComb(Card.set('ah:qs'), Card.set('qc:qh:4h:kc:kd')).rank, 7);
    assert.equal(getStrongestComb(Card.set('2s:3s'), Card.set('4s:js:6s')).rank, 6);
    assert.equal(getStrongestComb(Card.set('kh:5h'), Card.set('jc:3s:4h:ac:2c')).rank, 5);
    assert.equal(getStrongestComb(Card.set('kh:6h'), Card.set('js:2s:4h:kc:kd')).rank, 4);
    assert.equal(getStrongestComb(Card.set('ah:ac'), Card.set('kc:js:4c:4h:3d')).rank, 3);
    assert.equal(getStrongestComb(Card.set('ah:5h'), Card.set('ac:js:4h:kc:2s')).rank, 2);
    assert.equal(getStrongestComb(Card.set('ah:qs'), Card.set('tc:5h:3h:7c:2d')).rank, 1);
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
