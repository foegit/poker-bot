// const checkWinner = (table_cards, player_cards) => {

// };
const { sortCards } = require('../cards/card');
const NullCard = require('../cards/nullcard');

const printCards = (cards) => {
  const cardsStr = cards.reduce((str, card) => `${str} ${card.getTitle()}`);
  return cardsStr;
};

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

    return new Combination(6, flush.slice(0, 5));
  }

  return false;
};

const isStreight = (hand, board) => {
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
    return new Combination(5, streight);
  }
  return false;
};

const isStreightFlush = (hand, board) => {
  const flush = isFlush(hand, board);
  const streight = isStreight(hand, board);
  if (flush && streight) {
    for (let i = 0; i < 5; i += 1) {
      if (flush.cards[i].order !== streight.cards[i].order
        || flush.cards[i].suit !== streight.cards[i].suit) {
        return false;
      }
    }
    return new Combination(9, flush.cards);
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

const getSameOrderCard = (cards, numOfCards, iteration = 1) => {
  if ((cards.length - numOfCards) < 0) {
    return false;
  }

  sortCards(cards);

  let sameNCards = [cards[0]];
  let findCounter = 0;

  for (let i = 1; i < cards.length; i += 1) {
    if (cards[i].order === sameNCards[0].order) {
      sameNCards.push(cards[i]);
      if (sameNCards.length === numOfCards) {
        findCounter += 1;
        if (iteration === findCounter) {
          return sameNCards;
        }
        sameNCards.shift();
      }
    } else {
      sameNCards = [cards[i]];
    }
  }

  return false;
};

const getKicker = (cards, hand) => {
  const kicker = hand.filter((card) => {
    for (let i = 0; i < cards.length; i += 1) {
      if (card.order === cards[i].order && card.suit === cards[i].suit) {
        return false;
      }
    }

    return true;
  });

  // sortCards(cards);
  // sortCards(hand);

  // for (let i = 0; i < hand.length; i += 1) {
  //   for (let j = 0; j < cards.length; j += 1) {
  //     if (hand[i].compare(cards[j])) {
  //       kicker.shift();
  //       break;
  //     }
  //   }
  // }
  return kicker;
};


const isFourOfAKind = (hand, board) => {
  const cards = sortCards([...hand, ...board]);
  const fourOfAKind = getSameOrderCard(cards, 4);

  if (fourOfAKind) {
    const kicker = getKicker(fourOfAKind, hand);
    return new Combination(8, fourOfAKind, kicker);
  }
  return false;
};


const isThreeOfAKind = (hand, board) => {
  const cards = sortCards([...hand, ...board]);
  const threeOfAKind = getSameOrderCard(cards, 3);

  if (threeOfAKind) {
    return new Combination(4, threeOfAKind, getKicker(threeOfAKind, hand));
  }
  return false;
};

const isPair = (hand, board) => {
  const cards = sortCards([...hand, ...board]);
  const pair = getSameOrderCard(cards, 2);

  if (pair) {
    return new Combination(2, pair, getKicker(pair, hand));
  }

  return false;
};

const isFullHouse = (hand, board) => {
  const cards = sortCards([...hand, ...board]);
  const threeOfAKind = isThreeOfAKind(hand, board).cards;
  if (threeOfAKind) {
    const remainCards = cards.filter((card) => {
      for (let i = 0; i < threeOfAKind.length; i += 1) {
        if (card.compare(threeOfAKind[i])) {
          return false;
        }
      }
      return true;
    });
    const pair = getSameOrderCard(remainCards, 2);
    if (pair) {
      const fullHouse = [...threeOfAKind, ...pair];
      const kicker = getKicker(fullHouse, hand);
      return new Combination(7, fullHouse, kicker);
    }
  }
  return false;
};


const isTwoPair = (hand, board) => {
  const cards = sortCards([...hand, ...board]);
  const pair1 = getSameOrderCard(cards, 2);
  const pair2 = getSameOrderCard(cards, 2, 2);

  if (pair1 && pair2) {
    const twoPair = [...pair1, ...pair2];
    return new Combination(3, twoPair, getKicker(twoPair, hand));
  }

  return false;
};

const isHighCard = (hand) => {
  const sortHand = sortCards(hand);
  return new Combination(1, [sortHand[0]], [sortHand[1]]);
};

const getStrongestComb = (hand, board) => (isRoyalFlush(hand, board)
    || isStreightFlush(hand, board)
    || isFourOfAKind(hand, board)
    || isFullHouse(hand, board)
    || isFlush(hand, board)
    || isStreight(hand, board)
    || isThreeOfAKind(hand, board)
    || isTwoPair(hand, board)
    || isPair(hand, board)
    || isHighCard(hand));

module.exports = {
  // checkWinner,
  sortCards,
  printCards,
  isRoyalFlush,
  isStreightFlush,
  isFourOfAKind,
  isFullHouse,
  isFlush,
  isStreight,
  isThreeOfAKind,
  isTwoPair,
  isPair,
  isHighCard,
  getStrongestComb,
  getSameOrderCard,
};
