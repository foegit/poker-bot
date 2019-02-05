// const checkWinner = (table_cards, player_cards) => {

// };

const sortCards = cards => cards.sort((card1, card2) => card2.order.rank - card1.order.rank);

const printCards = (cards) => {
  cards.forEach(card => console.log(card.title));
};

// Flush: 5 cards of the same suit
const isFlush = (cards) => {
  const needSuit = cards[0].suit.value;
  for (let i = 1; i < cards.lengh; i += 1) {
    if (needSuit !== cards[i].suit.value) {
      return false;
    }
  }
  return true;
};

module.exports = {
  // checkWinner,
  sortCards,
  printCards,
  isFlush,
};
