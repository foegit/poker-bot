const shortid = require('shortid');

const Game = require('../poker/game');
const PlayerController = require('./player');
const Sender = require('./sender');

class GameController {
  constructor() {
    if (!GameController.instance) {
      this.games = [];
      this.playerController = PlayerController;

      this.createGame = this.createGame.bind(this);
      this.createGame = this.createGame.bind(this);
      this.getGameById = this.getGameById.bind(this);
      this.getGameByTitle = this.getGameByTitle.bind(this);
      this.leaveGame = this.leaveGame.bind(this);

      GameController.instance = this;
    }
  }

  async createGame(player, title) {
    const id = shortid.generate();
    const game = new Game(id, title, player);
    this.games.push(game);
    player.joinTo(game);
    return game;
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

  async leaveGame(ctx) {
    const player = await this.auth(ctx);
    if (!player) {
      return false;
    }
    if (player.gameId === null) {
      Sender.error(ctx, 'Ви не граєте.');
    }

    const game = this.getGameById(player.gameId);
    if (!game) {
      return false;
    }

    game.leave(player);
    player.leaveGame();

    Sender.ok(ctx, 'Ви покинули гру.');
    return game;
  }
}

module.exports = new GameController();
