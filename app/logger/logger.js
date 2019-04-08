const fs = require('fs');
const Entry = require('./entry');

class Logger {
  constructor(console = true, file = true) {
    this.writeToConsole = console;
    this.writeToFile = file;
    this.filename = 'logs.txt';
    this.logs = [];

    this.create(`Logger started. Write logs to ${this.filename}`);
  }

  create(text) {
    const entry = new Entry(text);
    try {
      if (this.writeToFile) {
        fs.appendFileSync(this.filename, entry.toString());
      }
      if (this.writeToConsole) {
        // eslint-disable-next-line
        console.log(entry.toColorString());
      }
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }
}

module.exports = Logger;
