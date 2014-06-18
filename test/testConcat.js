const assert = require('chai').assert,
    Concat = require('../modules/Concat');

describe('Модуль Concat', function() {

    it('Соединение двух файлов', function() {
        assert.equal(new Concat([
            './fixtures/files/a.js',
            './fixtures/files/b.js'
        ]).get(), 'var a;var b;');
    });

});
