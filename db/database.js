const mongoose = require('mongoose');
const Logger = require('../controllers/logger');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds054128.mlab.com:54128/pokerbot`, { useNewUrlParser: true });
// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-dvj8u.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });


mongoose.connection.on('error', async (err) => {
  Logger.add(`Connection error ${err}`);
});

mongoose.connection.on('open', () => {
  Logger.add('Connect to MongoDB.');
});
