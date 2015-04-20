const path = require('path'),

    moment = require('moment'),

    Cli = require('./modules/Cli'),
    Make = require('./modules/Make'),
    Log = require('./modules/Log');

var defaultConfigFile = 'bemaker.json',

    cli = new Cli().package(path.join(__dirname, 'package.json')),

    commander = cli.commander()
        .usage('<command> [options]')
        .option('-v, --verbose <mod,modN>', 'verbose modes: log, info, warn, error')
        .option('-c, --config <file=' + defaultConfigFile + '>', 'config in JSON format', defaultConfigFile);

cli.verboseAliases = {
    log: { log: console.log },
    info: { info: console.info },
    warn: { warn: console.warn },
    error: { error: console.error }
};

commander
    .command('make')
    .description('build blocks')
    .option('-d, --directories <dir,dirN>', 'directories of blocks')
    .option('-o, --outname <name>', 'name to output files')
    .option('-O, --outdir <dir=.>', 'directory to output files')
    .option('-e, --extensions <ext,extN>', 'extensions to build')
    .option('-b, --blocks <block,blockN>', 'blocks to build')
    .option('--dependext <ext=.js>', 'extension to read dependencies')
    .option('--jsdoctag <tag=bemaker>', 'jsdoc tag to read dependencies')
    .option('--no-before', 'do not set comment before each file')
    .option('--no-after', 'do not set comment after each file')
    .action(function(cmd) {
        var log = new Log(cli.resolveVerboseAliases(commander.verbose || Object.keys(cli.verboseAliases).toString()));

        cli.on('config-not-found', function(data) {
            if(data.path !== defaultConfigFile) {
                log.error({
                    operation: 'read',
                    path: data.path,
                    text: 'config not found'
                });
            }
        });

        var config = cli.config(commander.config).config(),
            timeStart = moment();

        if(config.verbose) {
            log.out = config.verbose;
        }

        log.info({ text: 'build started' });

        var make = new Make({
            directories: cli.resolveOptionPath(Cli.split(cmd.directories), config.directories, []),
            outname: config.outname || cmd.outname || '',
            outdir: cli.resolveOptionPath(cmd.outdir, config.outdir, '.'),
            extensions: config.extensions || Cli.split(cmd.extensions),
            blocks: config.blocks || Cli.split(cmd.blocks),
            dependext: config.dependext || cmd.dependext,
            jsdoctag: config.jsdoctag || cmd.jsdoctag,
            before: typeof config.before === 'boolean' ? config.before : cmd.before,
            after: typeof config.after === 'boolean' ? config.after : cmd.after,
            cwd: process.cwd()
        });

        make
            .on('level', function(data) {
                log.log({
                    operation: 'walk',
                    path: data.path,
                    description: 'directory'
                });
            })
            .on('block', function(data) {
                log.log({
                    operation: 'walk',
                    text: data.name,
                    description: 'block'
                });
            })
            .on('file', function(data) {
                log.log({
                    operation: 'walk',
                    path: data.path,
                    description: 'file'
                });
            })
            .on('depend', function(data) {
                log.log({
                    operation: 'read',
                    path: data.path,
                    description: 'dependencies'
                });
            })
            .on('filter', function(data) {
                log.log({
                    operation: 'filter',
                    text: data.block
                });
            })
            .on('extension', function(data) {
                log.log({
                    operation: 'group',
                    text: data.name,
                    description: 'extension'
                });
            })
            .on('save', function(data) {
                log.info({
                    operation: 'write',
                    path: data.path
                });
            })
            .on('loop', function(branch) {
                log.warn({
                    operation: 'loop',
                    text: branch.join(' → ')
                });
            });

        make.build().then(function() {
            log.info({ text: 'build finished', total: moment() - timeStart });
        });
    });

cli.parse();

if(!commander.args.length) {
    commander.outputHelp();
}
