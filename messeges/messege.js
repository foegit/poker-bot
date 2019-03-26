const formatCards = (cards) => {
  let format = '';
  cards.forEach((c) => {
    format += ` [[${c.getTitle()}]]`;
  });
  return format;
};

module.exports = {
  greeting(player) {
    return `👋 Привіт, ***${player.getTitle()}***!\nТвій баланс ${player.getBalance()}🍪.`;
  },

  gameCreated(game) {
    return `Гра вдало створена.\n▫️ /join ${game.title} - приєднатись до гри.`;
  },

  gameStarted(game) {
    return `***✨ Гру ${game.title} розпочато. Удачі і приємної гри.***`;
  },

  youCards(player) {
    return `***Початок торгів***\n\nВаші карти: ${formatCards(player.cards)}.`;
  },

  flopCards(game) {
    const cards = game.currCircle.boardCard;
    return `На столі з'являється три нові карти:\n${formatCards(cards)}`;
  },

  turnCard(game) {
    const cards = game.currCircle.boardCard;
    return `На столі з'являється додаткова карта:\n${formatCards(cards)}`;
  },

  riverCard(game) {
    const cards = game.currCircle.boardCard;
    return `На столі з'являється 5 карта:\n${formatCards(cards)}`;
  },

  makeBet(player, sum) {
    return `🔴 ***${player.getTitle()}*** ставить ***${sum}***🍪`;
  },

  callBet(player, currBet) {
    return `🔴 ***${player.getTitle()}*** підтримує ставку ***${currBet}***🍪`;
  },

  foldBet(player) {
    return `🔴 ***${player.getTitle()}*** виходить з торгів.`;
  },

  raiseBet(player, sum) {
    return `🔴 ***${player.getTitle()}*** підвищує ставку на ***${sum}***🍪`;
  },

  checkBet(player) {
    return `🔴 ***${player.getTitle()}*** очікує ставок інших гравців. Check`;
  },

  moveRequest(hand, board, moves) {
    return `***Ваш хід***\nРука: ${formatCards(hand)}\nСтіл: ${formatCards(board)}\n\n${moves}`;
  },

  waitForBet(player) {
    return `🕐 Очікування ходу від ***${player.getTitle()}***.`;
  },
};
