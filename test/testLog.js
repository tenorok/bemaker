const assert = require('chai').assert,
    clicolor = require('cli-color'),
    Log = require('../modules/Log');

describe('Модуль Log.', function() {

    var log = new Log({}).register('log', function(message) {
        if(typeof message === 'string') {
            return message;
        }

        // Шаблон log переопределён для возможности тестировать вывод без текущего времени.
        var line = [];

        if(message.operation) {
            line.push(this.brackets(message.operation));
        }

        if(message.path) {
            line.push(this.brackets(message.path));
        }

        if(message.text) {
            line.push(message.text);
        }

        if(message.description) {
            line.push(message.description);
        }

        if(message.total) {
            line.push(message.total + this.clicolor[this.colors.total]('ms'));
        }

        return line.join(' ');
    });

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

    it('Метод brackets.', function() {
        assert.equal(log.brackets('string'),
            clicolor[log.colors.bracket]('[') + 'string' + clicolor[log.colors.bracket](']')
        );
    });

    it('Операция в логирующем сообщении', function() {
        assert.equal(log.log({ operation: 'read' }), log.brackets(clicolor[log.colors.log]('read')));
    });

    it('Путь в логирующем сообщении', function() {
        assert.equal(log.log({ path: '~/path/to/directory/' }),
            log.brackets(clicolor[log.colors.path]('~/path/to/directory/'))
        );
    });

    it('Текст в логирующем сообщении', function() {
        assert.equal(log.log({ text: 'just text' }), clicolor[log.colors.text]('just text'));
    });

    it('Пояснение в логирующем сообщении', function() {
        assert.equal(log.log({ description: 'description' }), clicolor[log.colors.description]('description'));
    });

    it('Длительность операции в логирующем сообщении', function() {
        assert.equal(log.log({ total: 502 }), clicolor[log.colors.total]('502') + clicolor[log.colors.total]('ms'));
    });

    it('Все атрибуты в логирующем сообщении', function() {
        assert.equal(log.log({
            operation: 'load',
            path: '~',
            text: 'text',
            description: 'description',
            total: 100
        }), [
            log.brackets(clicolor[log.colors.log]('load')),
            log.brackets(clicolor[log.colors.path]('~')),
            clicolor[log.colors.text]('text'),
            clicolor[log.colors.description]('description'),
            clicolor[log.colors.total]('100') + clicolor[log.colors.total]('ms')
        ].join(' '));
    });

    it('Прокраска специфичного поля и регистрация специфичного шаблона вывода', function() {
        var log = new Log(/*{ custom: console.log }*/ undefined, {
            custom: 'magenta'
        }).register('custom', function(message) {
                return 'hello ' + message.custom;
            });

        assert.equal(log.print('custom', { custom: 'world' }), 'hello ' + clicolor.magenta('world'));
    });

});
