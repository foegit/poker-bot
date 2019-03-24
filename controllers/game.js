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

    game.on('start', this.gameStart);
    game.on('handOutPreFlopCards', this.firstCards);
    game.on('setFlopCards', this.firstBoardCards);
    game.on('bet', this.makeBet);
    game.on('call', this.callBet);

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

  async gameStart(game) {
    await Sender.toAll(game.players, Text.gameStarted(game));
    game.requestMove();
  }

  async firstCards(game) {
    const sendQueue = [];

    game.players.forEach((p) => {
      sendQueue.push(Sender.toPlayer(p, Text.youCards(p)));
    });

    Promise.all(sendQueue);
  }

  async firstBoardCards(game) {
    await Sender.toAll(game.players, Text.flopCards(game));
  }

  async makeBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.makeBet(player, sum));
  }

  async callBet({ game, player, sum }) {
    await Sender.toAll(game.players, Text.callBet(player, sum));
  }
}

module.exports = new GameController();
