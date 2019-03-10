require('dotenv').load();
require('./db/database');

const http = require('http');
const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
require('./controllers/sender').init(bot);


const CommandHandler = require('./commandHandler/commandHandler');
const Logger = require('./controllers/logger');

const cmd = new CommandHandler();

bot.on('text', cmd.handler);

bot.launch();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write(`Visit ${process.env.botAdress}`);
  res.end();
}).listen(PORT);

Logger.add(`Server restart at ${PORT} port.`);
