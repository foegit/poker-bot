// const checkWinner = (table_cards, player_cards) => {

// };

const sortCards = cards => cards.sort((card1, card2) => card2.order.rank - card1.order.rank);

const printCards = (cards) => {
  cards.forEach(card => console.log(card.title));
};

// Flush: 5 cards of the same suit
const isFlush = (cards) => {
  if (cards.length < 5) {
    return false;
  }

  const counter = {
    d: 0,
    h: 0,
    s: 0,
    c: 0,
  };

  cards.forEach((card) => {
    counter[card.suit] += 1;
  });

  if (counter.d >= 5 || counter.h >= 5 || counter.s >= 5 || counter.c >= 5) {
    return true;
  }

  return false;
};

module.exports = {
  // checkWinner,
  sortCards,
  printCards,
  isFlush,
};
