const path = require('path'),
    assert = require('chai').assert,
    Cli = require('../modules/Cli');

describe('Модуль Cli.', function() {

    describe('Метод resolveAbsolutePath.', function() {

        it('Один путь', function() {
            assert.equal(Cli.resolveAbsolutePath('test/fixtures'), path.join(__dirname, '../test/fixtures'));
        });

        it('Несколько путей', function() {
            assert.deepEqual(
                Cli.resolveAbsolutePath(['test/1', 'test/2']),
                [path.join(__dirname, '../test/1'), path.join(__dirname, '../test/2')]
            );
        });

    });

    describe('Метод package.', function() {

        it('Установка и получение', function() {
            assert.deepEqual(new Cli().package(path.join(__dirname, '/fixtures/cli/package.json')).package(), {
                name: 'bemaker',
                description: 'BEM project builder',
                version: '5.0.2'
            });
        });

        it('Получение несуществующего файла', function() {
            assert.deepEqual(new Cli().package(), {});
        });

    });

    describe('Метод version.', function() {

        it('Установка и получение', function() {
            assert.equal(new Cli().version('0.1.0').version(), '0.1.0');
        });

        it('Получение версии из package.json', function() {
            assert.equal(new Cli().package(path.join(__dirname, '/fixtures/cli/package.json')).version(), '5.0.2');
        });

    });

    describe('Метод config.', function() {

        it('Установка и получение', function() {
            assert.deepEqual(new Cli().config('test/fixtures/cli/config.json').config(), {
                levels: ['common', 'desktop'],
                outname: 'all'
            });
        });

        it('Получение несуществующего конфига', function() {
            assert.deepEqual(new Cli().config(), {});
        });

    });

    describe('Метод resolveVerboseAliases.', function() {

        it('Развернуть стандартные соответствия', function() {
            assert.deepEqual(new Cli().resolveVerboseAliases('l,i,e'), {
                log: console.log,
                info: console.info,
                error: console.error
            });
        });

        it('Изменить и развернуть соответствия', function() {
            var cli = new Cli();
            cli.verboseAliases = {
                t: { time: console.time },
                te: { timeEnd: console.timeEnd },
                a: { assert: console.assert }
            };
            assert.deepEqual(cli.resolveVerboseAliases('t,te'), {
                time: console.time,
                timeEnd: console.timeEnd
            });
        });

    });

});
