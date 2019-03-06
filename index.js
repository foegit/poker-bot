const Telegraf = require('telegraf');
const http = require('http');

const GameController = require('./controllers/game');
const PlayerContoller = require('./controllers/player');

require('dotenv').load();
require('./db/database');


const bot = new Telegraf(process.env.BOT_TOKEN);
const gms = new GameController();
const plr = new PlayerContoller().getInstance();


bot.command('start', plr.start);
bot.command('removeacc', plr.removeacc);

bot.command('poker', gms.createGame);
bot.command('delete', gms.deleteGame);
bot.command('gamelist', gms.gameList);
bot.command('join', gms.joinGame);
bot.command('leave', gms.leaveGame);

// bot.command('c', cmd.createTable);
// bot.command('create', cmd.createTable);
// bot.command('d', cmd.deleteTable);
// bot.command('delete', cmd.deleteTable);
// bot.command('l', cmd.leaveTable);
// bot.command('leave', cmd.leaveTable);
// bot.command('j', cmd.joinTable);
// bot.command('join', cmd.joinTable);
// bot.command('list', cmd.showTables);
// bot.command('say', cmd.say(bot));
// bot.command('cube', cmd.cube);


bot.launch();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write(`Visit ${process.env.botAdress}`);
  res.end();
}).listen(PORT);
