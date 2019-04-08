
const moment = require('moment');

class Entry {
  constructor(text) {
    this.date = moment();
    this.text = text;
  }

  toString() {
    const { date, text } = this;
    const str = `[${date.local()}] ${text}`;

    return str;
  }

  toColorString() {
    const { date, text } = this;

    return `\x1b[34m${date.local()} \x1b[33m${text}\x1b[0m`;
  }
}

module.exports = Entry;
