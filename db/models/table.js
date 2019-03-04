const mongoose = require('mongoose');

const Table = mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.String,
    require: true,
    unique: true,
  },
  registerDate: {
    type: mongoose.Schema.Types.Date,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Player',
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  chat: [{
    type: mongoose.Schema.Types.String,
  }],
});

module.exports = mongoose.model('Table', Table);
