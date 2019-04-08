// const PlayerContoller = require('../controllers/player');
// const GameController = require('../controllers/game');
const Sender = require('../controllers/sender');
const Logger = require('../controllers/logger');
const Text = require('../messeges/messege');

const { spacer } = require('../controllers/utils');
const Parser = require('./parser');
const moveType = require('../const/move');

const PlayerModel = require('../db/models/player');

class CommandHandler {
  constructor(logger, sender) {
    this.logger = logger;
    this.sender = sender;


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

    const player = await this.getPlayer(ctx);
    try {
      switch (command) {
        // TEST
        case '/test': await this.test(ctx, player); break;
        // START
        case '/start': await this.start(ctx, player); break;
        case '/game': await this.game(ctx, player); break;
        case '/delete': await this.delete(ctx, player); break;
        case '/gamelist': await this.gamelist(ctx, player); break;
        case '/join': await this.join(ctx, player); break;
        case '/b': await this.balance(ctx, player); break;
        case '/cube': await CommandHandler.cube(ctx, player); break; // TODO:  create another file for this func like toys.js
        // TABLE
        case '/leave': await this.leave(ctx, player); break;
        case '/here': await this.here(ctx, player); break;
        case '/say': await this.say(ctx, player); break;
        // POKER
        case '/begin': await this.begin(ctx, player); break;
        case '/bet': await this.bet(ctx, player); break;
        case '/call': await this.call(ctx, player); break;
        case '/fold': await this.fold(ctx, player); break;
        case '/raise': await this.raise(ctx, player); break;
        case '/check': await this.check(ctx, player); break;
        default: CommandHandler.unknown(ctx, player); break;
      }
    } catch (err) {
      console.log();
    }
  }

  async start(ctx, player) {
    await Sender.sendMessage(ctx, Text.greeting(player));
  }

  async balance(ctx, player) {
    await Sender.sendMessage(ctx, Text.balanceInfo(player));
  }

  async game(ctx, player) {
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
    Sender.success(ctx, Text.gameCreated(game));
  }

  async delete(ctx, player) {
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
        Sender.error(ctx, 'Ви вже в цій грі.');
        return;
      }
      Sender.error(ctx, `Для приєднання до нової необхідно покинути поточну - ${player.game.title}\n▫️ ***/leave*** - щоб покинути поточну гру.`);
      return;
    }

    player.joinTo(game);
    game.join(player);

    Sender.success(ctx, 'Ви вдало приєднались до гри.\n▫️ ***/here*** - щоб переглянути список гравців.');
    Sender.sendAll(game.players.filter(p => p !== player), `🐾 ***${player.getTitle()}*** приєднався до гри.`);
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
    const { game } = player;
    if (!game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру.');
      return;
    }

    const message = Parser.getParams(ctx).join(' ');
    const { players } = game;

    const sendQueue = [];
    players.forEach(p => sendQueue.push(Sender.toPlayer(p, `💬 ***${player.getTitle()}:*** ${message}`)));

    await Promise.all(sendQueue);
  }

  async begin(ctx) {
    const player = await this.getPlayer(ctx);
    const { game } = player;

    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }

    try {
      game.start(player);
    } catch (err) {
      Sender.error(ctx, err);
    }
  }

  async bet(ctx, player) {
    const { game } = player;
    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }
    const sum = +(Parser.getParam(ctx));
    try {
      game.move(player, moveType.bet, sum);
    } catch (err) {
      Sender.sendMessage(ctx, 'Щось пішло не так... Спробуйте пізніше.');
      throw err;
    }
  }

  async call(ctx, player) {
    const { game } = player;
    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }

    try {
      game.move(player, moveType.call);
    } catch (err) {
      Sender.error(ctx, err);
      throw err;
    }
  }

  async fold(ctx, player) {
    const { game } = player;
    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }

    try {
      game.move(player, moveType.fold);
    } catch (err) {
      Sender.error(ctx, err);
      throw err;
    }
  }

  async raise(ctx, player) {
    const { game } = player;
    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }

    const sum = +(Parser.getParam(ctx));

    try {
      game.move(player, moveType.raise, sum);
    } catch (err) {
      Sender.error(ctx, err);
      throw err;
    }
  }

  async check(ctx, player) {
    const { game } = player;
    if (!player.game) {
      Sender.error(ctx, 'Ви не граєте в жодну гру!');
      return;
    }

    try {
      game.move(player, moveType.check);
    } catch (err) {
      Sender.error(ctx, err);
      throw err;
    }
  }

  static unknown(ctx) {
    Sender.error(ctx, `Невідома команда: ___${ctx.message.text}___`);
  }

  static cube(ctx) {
    const cube = (Date.now() % 6) + 1;

    Sender.sendMessage(ctx, `🎲 ${cube}`);
  }

  async test(ctx, player) {
    const a = await PlayerModel.findOne({ tid: player.tid }).select('balance');
    console.log(a.balance);
  }
}

module.exports = CommandHandler;
