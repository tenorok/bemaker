const assert = require('chai').assert,
    clicolor = require('cli-color'),
    Log = require('../modules/Log');

describe('Модуль Log.', function() {

    var log = new Log({});

    it('Простое логирующее сообщение', function() {
        assert.equal(log.log('логирующее сообщение'), clicolor[log.colors.log]('логирующее сообщение'));
    });

    it('Простое информационное сообщение', function() {
        assert.equal(log.info('информационное сообщение'), clicolor[log.colors.info]('информационное сообщение'));
    });

    it('Простое предупреждающее сообщение', function() {
        assert.equal(log.warn('предупреждающее сообщение'), clicolor[log.colors.warn]('предупреждающее сообщение'));
    });

    it('Простое сообщение об ошибке', function() {
        assert.equal(log.error('сообщение об ошибке'), clicolor[log.colors.error]('сообщение об ошибке'));
    });

    it('Указание операции в логирующем сообщении', function() {
        assert.equal(log.log({ operation: 'read' }),
            clicolor[log.colors.bracket]('[') + clicolor[log.colors.log]('read') + clicolor[log.colors.bracket](']')
        );
    });

});
