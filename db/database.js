const mongoose = require('mongoose');
const Logger = require('../controllers/logger');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds054128.mlab.com:54128/pokerbot`, { useNewUrlParser: true });

mongoose.connection.on('error', (err) => {
  Logger.add(`Connection error ${err}`);
});

mongoose.connection.on('open', () => {
  Logger.add('Connect to MongoDB.');
});
