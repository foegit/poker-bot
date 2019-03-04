const getParam = (cmd) => {
  if (cmd.length < 2 || cmd[0] !== '/' || cmd[1] === ' ') {
    return false;
  }
  return cmd.split(' ').slice(1);
};

const spacer = (str, n, char = ' ') => {
  if (str.length >= n) {
    return str.slice(0, n + 1);
  }
  return (str + char.repeat(n - str.length));
};

class Sender {
  static error(ctx, err) {
    let errmsg = err;
    if (err instanceof Error) {
      errmsg = err.message;
    }
    ctx.replyWithMarkdown(`❌ ${errmsg}`);
  }

  static ok(ctx, msg) {
    ctx.replyWithMarkdown(`✅ ${msg}`);
  }

  static info(ctx, msg) {
    ctx.replyWithMarkdown(`ℹ ${msg}`);
  }

  static msg(ctx, msg) {
    ctx.replyWithMarkdown(msg);
  }
}

module.exports = {
  getParam,
  Sender,
  spacer,
};
