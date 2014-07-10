const assert = require('chai').assert,
    clicolor = require('cli-color'),
    Log = require('../modules/Log');

describe('Модуль Log.', function() {

    var log = new Log({});

    it('Простое логирующее сообщение', function() {
        assert.equal(log.log('логирующее сообщение'), clicolor[log.colors.log]('логирующее сообщение'));
    });

});
