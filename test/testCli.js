const path = require('path'),
    assert = require('chai').assert,
    commander = require('commander'),
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

    describe('Работа с commander.', function() {

        it('Получить стандартный экземпляр Commander', function() {
            assert.isTrue(new Cli().commander() instanceof commander.Command);
        });

        it('Версия указывается автоматически', function() {
            assert.equal(new Cli()
                .package(path.join(__dirname, '/fixtures/cli/package.json'))
                .commander().version(), '5.0.2');
        });

        it('Версия не должна указываться автоматически', function() {
            assert.equal(new Cli()
                .package(path.join(__dirname, '/fixtures/cli/package.json'))
                .commander(new commander.Command().version('0.1.0'))
                .commander().version(), '0.1.0');
        });

        it('Метод getCommanderOption', function() {
            assert.isUndefined(new Cli().getCommanderOption('option'));
            assert.deepEqual(
                new Cli().commander(new commander.Command().option('-o, --option')).getCommanderOption('option'),
                new commander.Option('-o, --option')
            );
        });

        it('Метод setCommanderOption', function() {
            assert.deepEqual(
                new Cli().setCommanderOption({
                    flags: '-p, --postfix <postfix>',
                    description: 'postfix to find files'
                }).getCommanderOption('postfix'),
                new commander.Option('-p, --postfix <postfix>', 'postfix to find files')
            );
        });

        it('Метод removeCommanderOption', function() {
            assert.isUndefined(new Cli().commander(new commander.Command().option('-o, --option'))
                .removeCommanderOption('option')
                .getCommanderOption('option')
            );
        });

        it('Метод setCommanderOption должен переопределять стандартные опции', function() {
            assert.deepEqual(
                new Cli().setCommanderOption({
                    flags: '-v, --verbose <param>',
                    description: 'other verbose'
                }).getCommanderOption('verbose'),
                new commander.Option('-v, --verbose <param>', 'other verbose')
            );
        });

        it('Метод defaultCommanderOptions', function() {
            assert.deepEqual(
                new Cli().defaultCommanderOptions({ block: { flags: '-b, --block <name>' }}).defaultCommanderOptions(),
                { block: { flags: '-b, --block <name>' }}
            );
        });

        it('Метод isDefaultCommanderOption', function() {
            assert.isTrue(new Cli().isDefaultCommanderOption('verbose'));
            assert.isFalse(new Cli()
                .setCommanderOption({ flags: '-v, --verbose', description: 'other verbose' })
                .isDefaultCommanderOption('verbose')
            );
        });

        it('Опция verbose указывается автоматически', function() {
            var cli = new Cli();
            assert.deepEqual(
                cli.getCommanderOption('verbose'),
                new commander.Option(
                    cli.defaultCommanderOptions().verbose.flags,
                    cli.defaultCommanderOptions().verbose.description
                )
            );
        });

        it('Опция verbose указана вручную', function() {
            var cli = new Cli().commander(new commander.Command().option('-v, --verbose', 'another verbose'));
            assert.deepEqual(
                cli.getCommanderOption('verbose'),
                new commander.Option('-v, --verbose', 'another verbose')
            );
        });

        it('Отмена автоматического указания опций', function() {
            assert.isUndefined(new Cli({ defaultCommanderOptions: {} }).getCommanderOption('verbose'));
        });

        it('Опция config указывается автоматически', function() {
            var cli = new Cli();
            assert.deepEqual(
                cli.getCommanderOption('config'),
                new commander.Option(
                    cli.defaultCommanderOptions().config.flags,
                    cli.defaultCommanderOptions().config.description
                )
            );
        });

        it('Опция config указывается автоматически с заданным конфигом', function() {
            assert.equal(new Cli()
                .config('config.json')
                .commander().parse(['bemaker', 'make']).config, 'config.json');
        });

        it('Опция config переопределяется в команде', function() {
            assert.equal(new Cli()
                .config('config.json')
                .commander().parse(['bemaker', 'make', '--config', 'my.json']).config, 'my.json');
        });

        it('Метод parse вызывается автоматически', function() {
            var cmd = new Cli().commander();
            assert.isTrue(cmd.hasOwnProperty('rawArgs'));
            assert.isTrue(cmd.hasOwnProperty('args'));
        });

    });

});