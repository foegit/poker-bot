const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds054128.mlab.com:54128/pokerbot`, { useNewUrlParser: true });

mongoose.connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log('! Error(database):\n', err);
});

mongoose.connection.on('open', () => {
  // eslint-disable-next-line no-console
  console.log('> MongoDB: ok');
});
