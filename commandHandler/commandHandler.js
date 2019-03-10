const PlayerContoller = require('../controllers/player');
const GameController = require('../controllers/game');

const Sender = require('../controllers/sender');
const Logger = require('../controllers/logger');
const { spacer } = require('../controllers/utils');

class CommandHandler {
  constructor() {
    this.playerController = PlayerContoller;
    this.gameController = GameController;

    this.start = this.start.bind(this);
    this.game = this.game.bind(this);
    this.join = this.join.bind(this);
    this.here = this.here.bind(this);
    this.say = this.say.bind(this);
    this.handler = this.handler.bind(this);
  }

  static isCommand(text) {
    if (text.length < 2) {
      return false;
    }
    if (text[0] !== '/') {
      return false;
    }
    return true;
  }

  static getCommand(text) {
    if (!CommandHandler.isCommand(text)) {
      return false;
    }

    return text.split(' ')[0];
  }

  static getParams(ctx) {
    const cmd = ctx.message.text;
    if (cmd.length < 2 || cmd[0] !== '/' || cmd[1] === ' ') {
      return false;
    }
    return cmd.split(' ').slice(1);
  }

  static getParam(ctx) {
    return CommandHandler.getParams(ctx)[0];
  }

  async getPlayer(ctx) {
    const player = await this.playerController.getPlayer(ctx);
    return player;
  }

  getGameByTitle(title) {
    const game = this.gameController.getGameByTitle(title);
    return game;
  }

  getGameById(id) {
    const game = this.gameController.getGameById(id);
    return game;
  }

  async handler(ctx) {
    const command = CommandHandler.getCommand(ctx.message.text);

    if (!command) {
      return;
    }

    Logger.cmd(ctx);
    switch (command) {
      case '/start': await this.start(ctx); break;
      case '/game': await this.game(ctx); break;
      case '/gamelist': await this.gamelist(ctx); break;
      case '/join': await this.join(ctx); break;
      case '/here': await this.here(ctx); break;
      case '/say': await this.say(ctx); break;
      case '/cube': await CommandHandler.cube(ctx); break;

      default: CommandHandler.unknown(ctx); break;
    }
  }


  async start(ctx) {
    const player = await this.getPlayer(ctx);
    const geetingMsg = `👋 Привіт, ***${player.getTitle()}***!\nТвій баланс ${player.balance}`;
    await Sender.toPlayer(player, geetingMsg);
  }

  async game(ctx) {
    const player = await this.getPlayer(ctx);

    if (player.gameId) {
      Sender.error(ctx, 'Для створення нової гри потрібно покинути поточну.');
      return;
    }

    const title = CommandHandler.getParam(ctx);

    if (!title) {
      Sender.error(ctx, 'Потбріно вказати назву гри.\n/game ___назва___ - створити гру ');
      return;
    }

    if (title.length < 3) {
      Sender.error(ctx, 'Назва гри повина містити мінімум 3 символа');
      return;
    }

    if (title.length > 10) {
      Sender.error(ctx, 'Назва гри повина містити максимум 10 символа');
      return;
    }

    const game = await this.gameController.createGame(player, title);
    player.joinTo(game.id);
    Sender.success(ctx, `Гра вдало створена.\n/join ${game.title} - щоб приєднатись до гри.`);
  }

  async gamelist(ctx) {
    const { games } = this.gameController;

    if (games.length === 0) {
      Sender.sendMessage(ctx, '👾 Поки немає активних ігор.\n▫️ ***/game <назва>*** - щоб створити гру.');
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

    Sender.sendMessage(ctx, list);
  }

  async join(ctx) {
    const player = await this.getPlayer(ctx);
    const gameTitle = CommandHandler.getParam(ctx);
    const game = this.getGameByTitle(gameTitle);

    if (!game) {
      Sender.error(ctx, 'Гру не знайдено');
      return;
    }

    if (game.players.length >= 10) {
      Sender.error(ctx, 'У цій грі максимум учасників - 10.');
      return;
    }

    if (player.gameId) {
      const currGame = this.gameController.getGameById(player.gameId);
      if (player.gameId === game.id) {
        Sender.sendMessage(ctx, 'Ви вже в цій грі.');
        return;
      }
      if (currGame) {
        Sender.error(ctx, `Для приєднання до нової необхідно покинути поточну - ${currGame.title}\n▫️ ***/leave*** - щоб покинути поточну гру.`);
        return;
      }
    }

    player.gameId = game.id;
    game.join(player);

    Sender.success(ctx, 'Ви вдало приєднались до гри.\n▫️ ***/here*** - щоб переглянути список гравців.');
  }

  async here(ctx) {
    const player = await this.getPlayer(ctx);

    if (!player.gameId) {
      Sender.error(ctx, 'Ви не граєте в жодну гру.\n▫️ ***/gamelist*** - щоб переглянути список ігр.');
      return;
    }

    const game = this.getGameById(player.gameId);

    const { players } = game;

    let list = `🧤 ***Список гравців:***\n\n${spacer('#', 3)} Гравець\n`;
    list += `${spacer('', 50, '-')}\n`;
    for (let i = 0; i < players.length; i += 1) {
      const number = spacer(`${(i + 1)}`, 3);
      const playerTitle = spacer(`${players[i].getTitle()}`, 12);
      const isAdmin = players[i].tid === game.owner.tid ? '⭐️' : '';
      list += `${number} ***${playerTitle}*** ${isAdmin}\n`;
    }

    Sender.sendMessage(ctx, list);
  }

  async say(ctx) {
    const player = await this.getPlayer(ctx);
    if (!player.gameId) {
      Sender.error(ctx, 'Ви не граєте в жодну гру.');

      return;
    }

    const game = this.getGameById(player.gameId);
    const message = CommandHandler.getParams(ctx).join(' ');
    const players = game.players.filter(p => p.tid !== player.tid);

    const sendQueue = [];
    players.forEach(p => sendQueue.push(Sender.toPlayer(p, `***${player.getTitle()}:*** ${message}`)));

    await Promise.all(sendQueue);
  }

  static unknown(ctx) {
    Sender.error(ctx, `Невідома команда: ___${ctx.message.text}___`);
  }

  static cube(ctx) {
    const cube = (Date.now() % 6) + 1;

    Sender.sendMessage(ctx, `🎲 ${cube}`);
  }
}

module.exports = CommandHandler;
