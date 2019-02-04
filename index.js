const Telegraf = require('telegraf');
const _ = require('lodash');

const decks = require('./deck');

require('dotenv').load();

const token = process.env.BOT_TOKEN;

const bot = new Telegraf(token);

bot.start((ctx) => {
  return ctx.reply(`Hello, ${ctx.from.first_name} ${_.sample(decks)}`);
});

bot.command('start', ctx => (ctx.reply('Hello')));

bot.launch();
