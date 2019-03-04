const assert = require('assert');

const { getParam, spacer } = require('../controllers/utils');

describe('Commands & utils', () => {
  it('Get param from cmd', () => {
    assert.equal(getParam(''), false);
    assert.equal(getParam('notacmd'), false);
    assert.equal(getParam('/'), false);
    // assert.equal(getParam('/#'), false); // TODO: check correct chars for cmd
    assert.deepEqual(getParam('/d'), []);
    assert.deepEqual(getParam('/cmd'), []);
    assert.deepEqual(getParam('/cmd 1'), ['1']);
    assert.deepEqual(getParam('/cmd f f 1'), ['f', 'f', '1']);
  });

  it('String spacer', () => {
    assert.equal(spacer('hello', 4), 'hello');
    assert.equal(spacer('hello', 5), 'hello');
    assert.equal(spacer('hello', 6), 'hello ');
    assert.equal(spacer('he', 6), 'he    ');
  });
});
