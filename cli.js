const path = require('path'),

    moment = require('moment'),

    Cli = require('./modules/Cli'),
    Make = require('./modules/Make'),
    Log = require('./modules/Log');

var defaultConfigFile = 'bemaker.json',

    cli = new Cli({
        defaultCommanderOptions: {
            verbose: {
                flags: '-v, --verbose <mod,modN>',
                description: 'verbose modes: log, info, warn, error'
            },
            config: {
                flags: '-c, --config <file=' + defaultConfigFile + '>',
                description: 'config in json format',
                default: defaultConfigFile
            }
        }
    }).package(path.join(__dirname, 'package.json')),

    commander = cli.commander()
        .usage('<command> [options]')
        .option('-o, --outdir <dir>', 'directory to output files')
        .option('-O, --outname <name>', 'name to output files')
        .option('-d, --directories <dir,dirN>', 'directories of blocks')
        .option('-e, --extensions <ext,extN>', 'extensions to build')
        .option('-b, --blocks <block,blockN>', 'blocks to build');

cli.verboseAliases = {
    log: { log: console.log },
    info: { info: console.info },
    warn: { warn: console.warn },
    error: { error: console.error }
};

commander
    .command('make [options]')
    .description('build blocks')
    .action(function() {
        var config = cli.config(commander.config).config(),
            timeStart = moment(),
            log = new Log(cli.resolveVerboseAliases(commander.verbose || Object.keys(cli.verboseAliases).toString()));

        log.info({ text: 'build started' });

        var make = new Make({
                outdir: Cli.resolveAbsolutePath(config.outdir || commander.outdir || '.'),
                outname: config.outname || commander.outname || '',
                directories: Cli.resolveAbsolutePath(config.directories || Cli.split(commander.directories) || []),
                extensions: config.extensions || Cli.split(commander.extensions),
                blocks: config.blocks || Cli.split(commander.blocks),
                dependext: config.dependext || commander.dependext,
                jsdoctag: config.jsdoctag || commander.jsdoctag
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
            });

        make.build().then(function() {
            log.info({ text: 'build finished', total: moment() - timeStart });
        });
    });

cli.parse();

if(!commander.args.length) {
    commander.outputHelp();
}
