module.exports = {
  "extends": "airbnb-base",
  "env": {
    "mocha": true
  },
  "rules": {
    "no-underscore-dangle": [2, { "allow": ["_id"] }],
    "class-methods-use-this": "off"
  }
};

/* eslint-disable class-camelcase */
/* eslint-enable class-camelcase */