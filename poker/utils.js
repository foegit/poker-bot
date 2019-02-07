// const checkWinner = (table_cards, player_cards) => {

// };

const NullCard = require('../cards/nullcard');

const sortCards = cards => cards.sort((card1, card2) => card2.rank - card1.rank);

const printCards = (cards) => {
  const cardsStr = cards.reduce((str, card) => `${str} ${card.getTitle()}`);
  return cardsStr;
};

/* combination
  {
    rank: number,
    hightCard: card.rank,
    kicker: [...kickers]
  }
*/

class Combination {
  constructor(rank = 0, cards = [], kicker = []) {
    this.rank = rank;
    this.cards = cards;
    this.kicker = kicker;
  }
}

// Flush: 5 cards of the same suit
const isFlush = (hand, board) => {
  const info = new Combination();
  const cards = [...hand, ...board];

  if (cards.length < 5) {
    return false;
  }

  sortCards(cards);

  const cardSplitter = {
    d: [],
    h: [],
    s: [],
    c: [],
  };

  for (let i = 0; i < cards.length; i += 1) {
    cardSplitter[cards[i].suit].push(cards[i]);
  }


  let flush = [];

  Object.keys(cardSplitter).forEach((key) => {
    if (cardSplitter[key].length >= 5) {
      flush = cardSplitter[key];
    }
  });

  if (flush.length >= 5) {
    info.rank = 6;
    info.cards = flush.slice(0, 5);

    return info;
  }

  return false;
};

const isStreight = (hand, board) => {
  const info = new Combination();
  const cards = [...hand, ...board];

  if (cards.length < 5) {
    return false;
  }

  sortCards(cards);
  if (cards[0].order === 'a') {
    cards.push(new NullCard());
  }

  let streight = [cards[0]];

  for (let i = 1; i < cards.length && streight.length < 5; i += 1) {
    const diff = cards[i - 1].rank - cards[i].rank;
    if (diff === 1) {
      streight.push(cards[i]);
    } else if (diff !== 0) {
      streight = [cards[i]];
      if (cards.length - i < 5) {
        break;
      }
    }
  }

  if (streight.length >= 5) {
    if (streight[0].order === '5') {
      streight.pop();
      streight.push(cards[0]);
    }
    info.rank = 5;
    info.cards = streight.slice(0, 5);

    return info;
  }
  return false;
};

const isStreightFlush = (hand, board) => {
  const info = new Combination();
  const flush = isFlush(hand, board);
  const streight = isStreight(hand, board);
  if (flush && streight) {
    for (let i = 0; i < 5; i += 1) {
      if (flush.cards[i].order !== streight.cards[i].order
        || flush.cards[i].suit !== streight.cards[i].suit) {
        return false;
      }
    }
    info.rank = 9;
    info.cards = flush.cards;

    return info;
  }
  return false;
};

const isRoyalFlush = (hand, board) => {
  const streightFlush = isStreightFlush(hand, board);

  if (streightFlush && streightFlush.cards[0].order === 'a') {
    return new Combination(10, streightFlush.cards);
  }

  return false;
};

const getCombination = (hand, board) => {
  const comb = {
    rank: 0, // comb rank 1-10
    hightCard: null, // comb hight card
    kicker: [], // kickers
  };


  // isRoyalFlash();
  // isStreightFlash();
  // isFourOfAKind();
  // isFullHouse();
  // isFlush();
  // isStreight();
  // isSet();
  // isTwoPair();
  // isPair();
  // getHightCard();

  return comb;
};

module.exports = {
  // checkWinner,
  sortCards,
  printCards,
  isRoyalFlush,
  isStreightFlush,
  isFlush,
  isStreight,
  getCombination,
};
