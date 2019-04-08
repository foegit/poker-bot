const Event = require('events');
const shortid = require('shortid');

const Game = require('../poker/game');
const PlayerController = require('./player');
const Sender = require('./sender');
const Text = require('../messeges/messege');

class GameController extends Event {
  constructor() {
    super();
    if (!GameController.instance) {
      this.games = [];
      this.playerController = PlayerController;

      this.createGame = this.createGame.bind(this);
      this.getGameById = this.getGameById.bind(this);
      this.getGameByTitle = this.getGameByTitle.bind(this);

      GameController.instance = this;
    }
  }

  async createGame(player, title) {
    const id = shortid.generate();
    const game = new Game(id, title, player);
    this.games.push(game);
    player.joinTo(game);

    game.on('error', this.errorHandler);

    game.on('start', this.gameStart);
    game.on('leave', this.gameLeave);
    game.on('gameStop', this.gameStop);
    game.on('takeAll', this.takeAll);
    game.on('handOutPreFlopCards', this.delay(this.firstCards, 800));
    game.on('setFlopCards', this.delay(this.firstBoardCards, 800));
    game.on('setTurnCard', this.delay(this.turnStart, 800));
    game.on('setRiverCard', this.delay(this.riverStart, 800));
    game.on('showdown', this.delay(this.showDown));
    game.on('aheadWinner', this.delay(this.aheadWinner));
    game.on('bet', this.makeBet);
    game.on('call', this.callBet);
    game.on('fold', this.foldBet);
    game.on('raise', this.raiseBet);
    game.on('check', this.checkBet);
    game.on('wait', this.delay(this.requestMove, 1000));

    return game;
  }

  async errorHandler(error) {
    await Sender.toPlayer(error.player, error.text);
  }

  async deleteGame(game) {
    game.players.forEach(p => p.leave());
    this.games = this.games.filter(g => g.id !== game.id);
  }

  getGameById(gameId) {
    return (this.games.find(g => g.id === gameId) || false);
  }

  getGameByTitle(gameTitle) {
    return (this.games.find(g => g.title === gameTitle) || false);
  }

  async gameStart({ game }) {
    await Sender.toAll(game.players, Text.gameStarted(game));
  }

  async gameLeave({ game, player }) {
    await Sender.toAll(game.players, Text.gameLeave(player));
  }

  async gameStop({ game, player }) {
    await Sender.toAll(game.players, Text.gameStop(player));
  }

  async takeAll({ player, sum }) {
    await Sender.toPlayer(player, Text.takeAll(sum));
  }

  async firstCards({ game }) {
    await Sender.toAll(game.players, p => Text.youCards(p));
  }

  async firstBoardCards({ game }) {
    await Sender.toAll(game.players, Text.flopCards(game));
  }

  async turnStart({ game }) {
    await Sender.toAll(game.players, Text.turnCard(game));
  }

  async riverStart({ game }) {
    await Sender.toAll(game.players, Text.riverCard(game));
  }

  async showDown({ game, players, sum }) {
    let info = '***Кінець торгів. Розкриваємо карти.***\n\n';

    game.players.forEach((p) => {
      info += `***${p.getTitle()}*** ${p.comb.getTitle()} ${p.comb.getCards()}\n`;
    });
    if (players.length === 1) {
      await Sender.toAll(game.players, `${info}\n\nБанк забирає ***${players[0].getTitle()}*** і отримує ***${sum}🍪***`);
    } else {
      let winners = '';

      for (let i = 0; i < players.length - 1; i += 1) {
        winners += `${players[i].getTitle()}, `;
      }

      winners += `${players[players.length - 1].getTitle()}`;

      await Sender.toAll(game.players, `${info}\n\nБанк ділять між собою ***${winners}*** і отримують по ***${sum}🍪***`);
    }
  }

  async aheadWinner({ game, player, sum }) {
    const info = '***Кінець торгів.***\n\n';
    await Sender.toAll(game.players, `${info}Банк забирає ***${player.getTitle()}*** і отримує ***${sum}🍪***`);
  }

  async makeBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.makeBet(player, sum));
  }

  async callBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.callBet(player, sum));
  }

  async foldBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.foldBet(player, sum));
  }

  async raiseBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.raiseBet(player, sum));
  }

  async checkBet({ game, player }) {
    await Sender.toAll(game.players, Text.checkBet(player));
  }

  async requestMove({ game }) {
    const player = game.currCircle.underTheGun;
    const moves = game.getAvailableMoves(player);
    await Sender.toPlayer(player,
      Text.moveRequest(player.cards, game.currCircle.boardCard, moves));
    await Sender.toAll(game.players.filter(p => p !== player), Text.waitForBet(player));
  }

  delay(callback, timedelay) {
    return (game) => {
      setTimeout(() => callback(game), timedelay);
    };
  }
}

module.exports = new GameController();
