class CommandParser {
  static isCommand(text) {
    if (text.length < 2) {
      return false;
    }
    if (text[0] !== '/') {
      return false;
    }
    return true;
  }

  static getCommand(text) {
    if (!CommandParser.isCommand(text)) {
      return false;
    }

    return text.split(' ')[0];
  }

  static getParams(ctx) {
    const cmd = ctx.message.text;
    if (cmd.length < 2 || cmd[0] !== '/' || cmd[1] === ' ') {
      return false;
    }
    return cmd.split(' ').slice(1);
  }

  static getParam(ctx) {
    return CommandParser.getParams(ctx)[0];
  }
}

module.exports = CommandParser;
