const path = require('path'),
    assert = require('chai').assert,
    Cli = require('../modules/Cli');

describe('Модуль Cli.', function() {

    it('Метод resolveAbsolutePath: один путь', function() {
        assert.equal(Cli.resolveAbsolutePath('/test/fixtures/'), path.join(__dirname, '../test/fixtures/'));
    });

    it('Метод resolveAbsolutePath: несколько путей', function() {
        assert.deepEqual(
            Cli.resolveAbsolutePath(['/test/1/', '/test/2/']),
            [path.join(__dirname, '../test/1/'), path.join(__dirname, '../test/2/')]
        );
    });

});
