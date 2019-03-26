// class for fix game error

module.exports = class GError {
  constructor(player, error, code = 100) {
    this.player = player;
    this.text = error;
    this.code = code;
  }
};
