const mongoose = require('mongoose');

const Player = mongoose.Schema({
  tid: {
    type: mongoose.Schema.Types.Number,
    index: true,
    unique: true,
  },
  chatId: {
    type: mongoose.Schema.Types.Number,
    index: true,
    unique: true,
  },
  balance: {
    type: mongoose.Schema.Types.Number,
  },
  username: {
    type: mongoose.Schema.Types.String,
  },
  registerDate: {
    type: mongoose.Schema.Types.Date,
  },
});

module.exports = mongoose.model('Player', Player);
