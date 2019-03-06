const shortid = require('shortid');

// const Player = require('../db/models/player');
const Game = require('../poker/game');

const PlayerConttoller = require('./player');

const {
  getParam,
  Sender,
  spacer,
  cmdParam,
} = require('./utils');


class GameController {
  constructor() {
    this.games = [];
    this.playerController = new PlayerConttoller().getInstance();

    this.createGame = this.createGame.bind(this);
    this.gameList = this.gameList.bind(this);
    this.auth = this.auth.bind(this);
    this.createGame = this.createGame.bind(this);
    this.getGameById = this.getGameById.bind(this);
    this.getGameByTitle = this.getGameByTitle.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
  }

  async auth(ctx) {
    let player = await this.playerController.getPlayer(ctx);
    if (!player) {
      player = await this.playerController.wakeUp(ctx, false);
    }
    return player;
  }

  async createGame(ctx) {
    const player = await this.auth(ctx);
    const title = getParam(ctx.message.text)[0];

    if (!title) {
      Sender.error(ctx, 'Потрібно вказати назву.\n▫️ ***/poker <назва>***');
      return;
    }

    for (let i = 0; i < this.games.length; i += 1) {
      if (this.games[i].title === title) {
        Sender.error(ctx, 'Така назва уже використовується');
        return;
      }
      if (this.games[i].owner.gameId === player.gameId) {
        Sender.error(ctx, `Для створення іншої гри покиньте поточну.\n ▫️ ***/leave*** - покинути ***${this.games[i].title}***`);
        return;
      }
    }

    const id = shortid.generate();
    player.joinTo(id);
    const game = new Game(id, title, player);
    this.games.push(game);
    await Sender.ok(ctx, `Гра вдало створена!\n▫️ /join ***${game.title}*** - приєднатись до гри.`);
  }

  async deleteGame(ctx) {
    const gameId = getParam(ctx.message.from);
    this.games = this.games.filter(game => game.id !== gameId);
  }

  gameList(ctx) {
    const { games } = this;

    if (games.length === 0) {
      Sender.msg(ctx, 'Поки немає активних ігор.\n▫️ ***/poker <назва>*** - щоб створити гру.');
      return;
    }

    let list = `🧤 ***Список ігр:***\n\n${spacer('#', 3)} ${spacer('Адмін', 12)} ${spacer('Стіл', 15)} Гравці\n`;
    list += `${spacer('', 50, '-')}\n`;
    for (let i = 0; i < games.length; i += 1) {
      const number = spacer(`${(i + 1)}`, 3);
      const admin = spacer(`@${games[i].owner.username}`, 12);
      const table = spacer(games[i].title, 15);
      const limit = `[${games[i].players.length}/10]`;

      list += `${number} ${admin} ***${table}*** ${limit}\n`;
    }

    Sender.msg(ctx, list);
  }

  getGameById(gameId) {
    return (this.games.find(g => g.id === gameId) || false);
  }

  getGameByTitle(gameTitle) {
    return (this.games.find(g => g.title === gameTitle) || false);
  }

  async joinGame(ctx) {
    const player = await this.auth(ctx);
    if (!player) {
      return false;
    }
    const gameTitle = cmdParam(ctx);
    if (!gameTitle) {
      Sender.error(ctx, 'Потрібно вказати назву гри.\n▫️ ***/join <назва>*** - щоб приєднатись до гри.');
      return false;
    }
    const game = this.getGameByTitle(gameTitle);
    if (!game) {
      Sender.error(ctx, 'Гру не знайдено.\n▫️ ***/join <назва>*** - щоб приєднатись до гри.');
      return false;
    }
    if (game.id === player.gameId) {
      Sender.error(ctx, 'Ви уже в цій грі.');
      return false;
    }
    game.join(player);
    player.joinTo(game.id);
    Sender.ok(ctx, `Ви приєднались до гри ${game.title}.\n▫️ ***/leave*** - покинути гру.\n\n▫️ ***/whothere*** - список гравців.`);
    return game;
  }

  async leaveGame(ctx) {
    console.log('ahah');
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

module.exports = GameController;
