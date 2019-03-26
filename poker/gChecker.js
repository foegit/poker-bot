const GError = require('./gError');

module.exports = class GChecker {
  constructor(game) {
    this.game = game;
  }

  bet(player, sum) {
    const { game } = this;
    const { currCircle } = game;
    let error;

    switch (true) {
      case (currCircle.bet !== 0):
        error = `Початкова ставка уже зроблена: ${currCircle.bet}.\n${game.getAvailableMoves(player)})`;
        break;
      case (!sum): // '', undefined, NaN
        error = 'Потрібно вказати суму ставки.\n***/bet*** sum';
        break;
      case (typeof sum !== 'number'):
        error = 'Ставка має бути числом';
        break;
      case (!Number.isInteger(sum)):
        error = 'Сума ставки має бути цілим числом.';
        break;
      case (sum <= game.minBet):
        error = `Ставка має бути більше ${game.minBet}.`;
        break;
      case (sum > game.maxBet):
        error = `Ставка має бути менше ${game.maxBet}.`;
        break;
      case (sum > player.getBalance()):
        error = `Недостатньо 🍪 для такої ставки. Ваш баланс: ${player.getBalance()}🍪`;
        break;
      default: return false;
    }

    return new GError(player, error);
  }
};
