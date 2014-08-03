const path = require('path'),

    Cli = require('./modules/Cli'),
    Make = require('./modules/Make');

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
        var config = cli.config(commander.config).config();
        new Make({
            outdir: Cli.resolveAbsolutePath(config.outdir || commander.outdir || '.'),
            outname: config.outname || commander.outname || '',
            directories: Cli.resolveAbsolutePath(config.directories || Cli.split(commander.directories) || []),
            extensions: config.extensions || Cli.split(commander.extensions),
            blocks: config.blocks || Cli.split(commander.blocks),
            dependext: config.dependext || commander.dependext,
            jsdoctag: config.jsdoctag || commander.jsdoctag
        }).build().then(function() {
                console.log('finished');
            });
    });

cli.parse();

if(!commander.args.length) {
    commander.outputHelp();
}
