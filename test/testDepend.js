const assert = require('chai').assert,
    Depend = require('../modules/Depend');

describe('Модуль Depend.', function() {

    it('Задать модули в конструкторе', function() {
        assert.deepEqual(new Depend([
            { name: 'a' },
            { name: 'b' }
        ]).modules(), [
            { name: 'a' },
            { name: 'b' }
        ]);
    });

});
