const Telegraf = require('telegraf');
// const _ = require('lodash');
const http = require('http');


require('dotenv').load();

const dbConnect = require('./db/database');
// const putil = require('./poker/utils');

dbConnect.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('! Error(database):\n', err);
});

dbConnect.on('open', () => {
  // eslint-disable-next-line no-console
  console.log('> MongoDB: ok');
});

const Deck = require('./cards/deck');
const cmd = require('./controllers/commands');

let deck = new Deck();

const token = process.env.BOT_TOKEN;

const bot = new Telegraf(token);

bot.start(cmd.start);

bot.command('newDeck', ({ reply }) => {
  deck = new Deck();
  deck.shuffle();
  return reply('New deck were created!');
});

bot.command('c', cmd.createTable);
bot.command('create', cmd.createTable);
bot.command('d', cmd.deleteTable);
bot.command('delete', cmd.deleteTable);
bot.command('l', cmd.leaveTable);
bot.command('leave', cmd.leaveTable);
bot.command('j', cmd.joinTable);
bot.command('join', cmd.joinTable);
bot.command('list', cmd.showTables);
bot.command('say', cmd.say(bot));
bot.command('cube', cmd.cube);

bot.launch();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello World!');
  res.end();
}).listen(PORT);
