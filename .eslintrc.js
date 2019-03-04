module.exports = {
  "extends": "airbnb-base",
  "env": {
    "mocha": true
  },
  "rules": {
    "no-underscore-dangle": [2, { "allow": ["_id"] }]
  }
};