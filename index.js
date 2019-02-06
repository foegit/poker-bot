const Telegraf = require('telegraf');
// const _ = require('lodash');


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
const { start } = require('./controllers/commands');

let deck = new Deck();

const token = process.env.BOT_TOKEN;

const bot = new Telegraf(token);

bot.start(start);

bot.command('newDeck', ({ reply }) => {
  deck = new Deck();
  deck.shuffle();
  return reply('New deck were created!');
});

bot.launch();
