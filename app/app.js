const Telegraph = require('telegraf');

const Logger = require('./logger/logger');
const Sender = require('./sender/sender');

class App { // екземпляр програми
  constructor(token) {
    this.bot = new Telegraph(token);
    this.sender = new Sender(this.bot);

    this.logger = new Logger();
  }
}

module.exports = App;
