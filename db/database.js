const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

console.log(process.env);

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds054128.mlab.com:54128/pokerbot`, { useNewUrlParser: true });

module.exports = mongoose.connection;
