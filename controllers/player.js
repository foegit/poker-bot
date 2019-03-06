const PlayerModel = require('../db/models/player');
const Player = require('../poker/player');
const { Sender } = require('./utils');


class PlayerController {
  constructor() {
    this.players = []; // array of all active player

    this.isExist = this.isExist.bind(this);
    this.wakeUp = this.wakeUp.bind(this);
    this.sleep = this.sleep.bind(this);
    this.getPlayer = this.getPlayer.bind(this);

    this.signIn = this.signIn.bind(this);
    this.start = this.start.bind(this);
    this.removeacc = this.removeacc.bind(this);
  }

  isExist(tid) {
    for (let i = 0; i < this.players.length; i += 1) {
      if (this.players[i].tid === tid) {
        return true;
      }
    }
    return false;
  }

  sleep(ctx) {
    this.players = this.players.filter(player => player.tid !== ctx.from.id);
    Sender.ok(ctx, 'Ви в режимі офлайн');
  }

  async getPlayer(ctx) {
    return (this.players.find(p => p.tid === ctx.from.id) || false);
  }

  async wakeUp(ctx, sendResponse = true) {
    const fromDB = await PlayerModel.findOne({ tid: ctx.from.id });
    if (!fromDB) {
      return false;
    }
    const player = new Player();
    player.implementFromDB(fromDB);
    player.authDate = Date.now();
    player.lastActivity = player.authDate;
    this.players.push(player);
    if (sendResponse) {
      Sender.ok(ctx, `З поверненням, ***${fromDB.username || fromDB.tid}***!`);
    }
    return player;
  }

  async signIn(ctx) {
    const newPlayer = new PlayerModel({
      tid: ctx.from.id,
      username: ctx.from.username,
      chatId: ctx.chat.id,
      registerDate: Date.now(),
      balance: 100,
    });
    const fromDB = await newPlayer.save();
    await this.wakeUp(ctx, false);
    Sender.ok(ctx, `Привіт, ***${fromDB.username || fromDB.tid}***. {опис бота}`);
  }

  async start(ctx) {
    if (this.isExist(ctx.from.id)) {
      return;
    }

    if (await PlayerModel.findOne({ tid: ctx.from.id })) {
      this.wakeUp(ctx);
      return;
    }
    await this.signIn(ctx);
  }

  async removeacc(ctx) {
    if (!this.isExist(ctx.from.id)) {
      return;
    }
    await PlayerModel.deleteOne({ tid: ctx.from.id });
    this.removeFromList(ctx.from.id);
    Sender.ok(ctx, 'Аккаунт повністю видалено.');
  }
}

class Singleton {
  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new PlayerController();
    }
  }

  // eslint-disable-next-line
  getInstance() {
    return Singleton.instance;
  }
}

module.exports = Singleton;
