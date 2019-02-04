const Telegraf = require('telegraf');

require('dotenv').load();

const dbConnect = require('./db/database');

dbConnect.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('! Error(database)', err);
});

dbConnect.once.on('open', () => {
  // eslint-disable-next-line no-console
  console.log('> MongoDB: ok');
});

const Deck = require('./deck');
const commands = require('./controllers/commands');

let deck = new Deck();

const token = process.env.BOT_TOKEN;

const bot = new Telegraf(token);

bot.start(commands.start);

bot.command('newDeck', ({ reply }) => {
  deck = new Deck();
  deck.shuffle();
  return reply('New deck were created!');
});

bot.launch();