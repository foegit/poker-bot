const PlayerContoller = require('../controllers/player');
const GameController = require('../controllers/game');
const Sender = require('../controllers/sender');
const Logger = require('../controllers/logger');

const { spacer } = require('../controllers/utils');
const Parser = require('./parser');

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

  async getPlayer(ctx) {
    const player = await this.playerController.getPlayer(ctx);
    return player;
  }

  getGameByTitle(title) {
    return this.gameController.getGameByTitle(title);
  }

  getGameById(id) {
    return this.gameController.getGameById(id);
  }

  async handler(ctx) {
    const command = Parser.getCommand(ctx.message.text);

    if (!command) {
      return;
    }

    Logger.cmd(ctx);
    switch (command) {
      case '/start': await this.start(ctx); break;
      case '/game': await this.game(ctx); break;
      case '/delete': await this.delete(ctx); break;
      case '/gamelist': await this.gamelist(ctx); break;
      case '/join': await this.join(ctx); break;
      case '/leave': await this.leave(ctx); break;
      case '/here': await this.here(ctx); break;
      case '/say': await this.say(ctx); break;
      case '/cube': await CommandHandler.cube(ctx); break; // TODO:  create another file for this func like toys.js
      // POKER
      case '/begin': await this.begin(ctx); break;
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

    if (player.game) {
      Sender.error(ctx, `Для створення нової гри потрібно покинути поточну(${player.game.title})`);
      return;
    }

    const title = Parser.getParam(ctx);

    if (!title) {
      Sender.error(ctx, 'Потрібно вказати назву гри.\n/game ___назва___ - створити гру ');
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
    player.joinTo(game);
    Sender.success(ctx, `Гра вдало створена.\n/join ${game.title} - щоб приєднатись до гри.`);
  }

  async delete(ctx) {
    const player = await this.getPlayer(ctx);

    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте.');
      return;
    }

    if (player.game.owner.tid !== player.tid) {
      Sender.error(ctx, 'Тільки адмін може видалити стіл.');
      return;
    }

    this.gameController.deleteGame(player.game);

    Sender.success(ctx, 'Гра видалена.');
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
    const gameTitle = Parser.getParam(ctx);
    const game = this.getGameByTitle(gameTitle);

    if (!game) {
      Sender.error(ctx, 'Гру не знайдено');
      return;
    }

    if (game.players.length >= 10) {
      Sender.error(ctx, 'У цій грі максимум учасників - 10.');
      return;
    }

    if (player.game) {
      if (player.game.id === game.id) {
        Sender.sendMessage(ctx, 'Ви вже в цій грі.');
        return;
      }
      Sender.error(ctx, `Для приєднання до нової необхідно покинути поточну - ${player.game.title}\n▫️ ***/leave*** - щоб покинути поточну гру.`);
      return;
    }

    player.joinTo(game);
    game.join(player);

    Sender.success(ctx, 'Ви вдало приєднались до гри.\n▫️ ***/here*** - щоб переглянути список гравців.');
  }

  async leave(ctx) {
    const player = await this.getPlayer(ctx);
    player.leave();

    Sender.success(ctx, 'Ви Покинули гру\n▫️ ***/gamelist*** - щоб переглянути список ігр.');
  }

  async here(ctx) {
    const player = await this.getPlayer(ctx);

    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру.\n▫️ ***/gamelist*** - щоб переглянути список ігр.');
      return;
    }

    const { players } = player.game;

    let list = `🧤 ***Список гравців:***\n\n${spacer('#', 3)} Гравець\n`;
    list += `${spacer('', 50, '-')}\n`;
    for (let i = 0; i < players.length; i += 1) {
      const number = spacer(`${(i + 1)}`, 3);
      const playerTitle = spacer(`${players[i].getTitle()}`, 12);
      const isAdmin = players[i].tid === player.game.owner.tid ? '⭐️' : '';
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
    const message = Parser.getParams(ctx).join(' ');
    const players = game.players.filter(p => p.tid !== player.tid);

    const sendQueue = [];
    players.forEach(p => sendQueue.push(Sender.toPlayer(p, `***${player.getTitle()}:*** ${message}`)));

    await Promise.all(sendQueue);
  }

  async begin(ctx) {
    const player = await this.getPlayer(ctx);

    if (!player.game) {
      Sender.error(ctx, 'Ви не гражте в жодну гру!');
      return;
    }

    if (player.tid !== player.game.owner.tid) {
      Sender.error(ctx, `Почати гру може тільки адмін - ${player.game.owner.getTitle()}`);
      return;
    }

    player.game.start();
    Sender.sendAll(player.game.players, '💰 ***Гра почалась***');
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
