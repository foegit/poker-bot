const mongoose = require('mongoose');

const Player = mongoose.Schema({
  telegramId: {
    type: mongoose.Schema.Types.String,
    index: true,
    unique: true,
  },
  chatId: {
    type: mongoose.Schema.Types.String,
    index: true,
    unique: true,
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
  currentTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null,
  },
});

module.exports = mongoose.model('Player', Player);
