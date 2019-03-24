const formatCards = (cards) => {
  let format = '';
  cards.forEach((c) => {
    format += ` [[${c.getTitle()}]]`;
  });
  return format;
};

module.exports = {
  greeting(player) {
    return `👋 Привіт, ***${player.getTitle()}***!\nТвій баланс ${player.balance}🍪.`;
  },

  gameCreated(game) {
    return `Гра вдало створена.\n▫️ /join ${game.title} - приєднатись до гри.`;
  },

  gameStarted(game) {
    return `***✨ Гру ${game.title} розпочато. Удачі і приємної гри.***`;
  },

  youCards(player) {
    return `Ваші карти: ${formatCards(player.cards)}.`;
  },

  flopCards(game) {
    const cards = game.currCircle.boardCard;
    return `На столі з'являється три нові карти: ${formatCards(cards)}.`;
  },

  makeBet(player, sum) {
    return `🔴 ***${player.getTitle()}*** ставить ***${sum}*** 🍪.`;
  },

  callBet(player, currBet) {
    return `🔴 ***${player.getTitle()}*** підтримує ставку ***${currBet}*** 🍪.`;
  },

  playerFold(player) {
    return `🔴 ***${player.getTitle()}*** виходить з торгів.`;
  },
};
