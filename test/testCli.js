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

        it('Указание абсолютного пути для резолва относительно него', function() {
            assert.equal(Cli.resolveAbsolutePath(__dirname, 'fixtures/tmp'), path.join(__dirname, 'fixtures/tmp'));
        });

    });

    describe('Метод resolveRelativePath.', function() {

        it('Один путь', function() {
            assert.equal(Cli.resolveRelativePath(path.join(__dirname, '../test/fixtures')), 'test/fixtures');
        });

        it('Несколько путей', function() {
            assert.deepEqual(
                Cli.resolveRelativePath([path.join(__dirname, '../test/1'), path.join(__dirname, '../test/2')]),
                ['test/1', 'test/2']
            );
        });

        it('Указание абсолютного пути для резолва относительно него', function() {
            assert.equal(Cli.resolveRelativePath(
                path.join(__dirname, '../test'),
                path.join(__dirname, '../test/fixtures/tmp')
            ), 'fixtures/tmp');
        });

    });

    describe('Метод split.', function() {

        it('Обычная строка', function() {
            assert.deepEqual(Cli.split('dir1,dir2'), ['dir1', 'dir2']);
        });

        it('Изменённый разделитель', function() {
            assert.deepEqual(Cli.split('dir1:dir2', ':'), ['dir1', 'dir2']);
        });

        it('Пуста строка', function() {
            assert.isUndefined(Cli.split(''));
        });

        it('Незаданное значение', function() {
            assert.isUndefined(Cli.split(undefined));
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

    describe('Метод getOptionPath.', function() {

        it('Получить путь из явно заданной опции', function() {
            assert.equal(new Cli().resolveOptionPath('outdir', 'other/outdir'),
                path.join(__dirname, '../outdir')
            );
        });

        it('Получить путь относительно конфига', function() {
            var configPath = 'test/fixtures/cli/config.json';
            assert.equal(new Cli().config(configPath).resolveOptionPath('', 'other/outdir'),
                path.join(path.dirname(Cli.resolveAbsolutePath(configPath)), 'other/outdir')
            );
        });

        it('Получить значение по умолчанию', function() {
            assert.equal(new Cli().resolveOptionPath('', '', './out'),
                path.join(__dirname, '../out')
            );
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

        it('Метод parse', function() {
            var cmd = new Cli().parse().commander();
            assert.isTrue(cmd.hasOwnProperty('rawArgs'));
            assert.isTrue(cmd.hasOwnProperty('args'));
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

        it('Опция verbose указана вручную', function() {
            var cli = new Cli().commander(new commander.Command().option('-v, --verbose', 'another verbose'));
            assert.deepEqual(
                cli.getCommanderOption('verbose'),
                new commander.Option('-v, --verbose', 'another verbose')
            );
        });

    });

});
