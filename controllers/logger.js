const fs = require('fs');

class Logger {
  constructor() {
    if (!Logger.instance) {
      this.logs = [];
      this.filepath = './logs/logs.txt';
      this.add = this.add.bind(this);
      this.toFile = this.toFile.bind(this);
      Logger.instance = this;
      this.add(`Start writing logs to ${this.filepath}`);
    }
    return Logger.instance;
  }

  add(text) {
    const date = new Date();
    const logDate = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}]`;
    const log = `${text}`;
    this.logs.push(log);
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('logs');
    }
    fs.appendFileSync(this.filepath, `${logDate} ${text}\n`);
    console.log(`\x1b[34m${logDate} \x1b[33m${text}\x1b[0m`);
  }

  cmd(ctx) {
    const cmd = ctx.message.text;
    const from = ctx.from.username || ctx.from.id;
    const log = `cmd: ${cmd} from ${from}`;

    this.add(log);
  }

  toFile(filepath) {
    this.filepath = filepath;
  }
}

module.exports = new Logger();
