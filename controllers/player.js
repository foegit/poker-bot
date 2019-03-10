const PlayerModel = require('../db/models/player');
const Player = require('../poker/player');
const { Sender } = require('./utils');

class PlayerController {
  constructor() {
    if (!PlayerController.instance) {
      this.players = []; // array of all active player

      this.isExist = this.isExist.bind(this);
      this.getPlayer = this.getPlayer.bind(this);

      this.sleep = this.sleep.bind(this);
      this.getPlayer = this.getPlayer.bind(this);

      this.start = this.start.bind(this);
      this.removeacc = this.removeacc.bind(this);
      PlayerController.instance = this;
    }
    return PlayerController.instance;
  }

  isExist(ctx) {
    return (this.players.find(p => p.tid === ctx.from.id) || null);
  }

  sleep(ctx) {
    this.players = this.players.filter(player => player.tid !== ctx.from.id);
    Sender.ok(ctx, 'Ви в режимі офлайн');
  }

  async getPlayer(ctx) {
    const { id } = ctx.from;

    const playerFromPool = this.isExist(ctx);


    if (playerFromPool) {
      return playerFromPool;
    }

    let playerFromDb = await PlayerModel.findOne({ tid: id });
    if (!playerFromDb) {
      playerFromDb = await PlayerController.signIn(ctx);
    }
    return this.activatePlayer(playerFromDb);
  }


  activatePlayer(fromDb) {
    const player = new Player();
    player.implementFromDB(fromDb);
    player.authDate = Date.now();
    player.lastActivity = player.authDate;
    this.players.push(player);
    return player;
  }

  static async signIn(ctx) {
    const newPlayer = new PlayerModel({
      tid: ctx.from.id,
      username: ctx.from.username,
      chatId: ctx.chat.id,
      registerDate: Date.now(),
      balance: 100,
    });

    const fromDb = await newPlayer.save();
    return fromDb;
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

const instance = new PlayerController();
module.exports = instance;
