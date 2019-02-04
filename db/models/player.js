const mongoose = require('mongoose');

const Player = mongoose.Schema({
  telegramId: {
    type: mongoose.Schema.Types.String,
  },
  balance: {
    type: mongoose.Schema.Types.Number,
  },
  userName: {
    type: mongoose.Schema.Types.String,
  },
  registerDate: {
    type: mongoose.Schema.Types.Date,
  },
});

module.exports = mongoose.model('Player', Player);
