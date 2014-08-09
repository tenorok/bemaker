const path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    commander = require('commander');

/**
 * Опция Commander.
 *
 * @typedef {{}} Cli~commanderOption
 * @property {string} flags Флаги
 * @property {string} [description] Описание
 * @property {*} [default] Стандартное значение
 */

/**
 * Стандартные опции Commander.
 *
 * @typedef {{}} Cli~defaultCommanderOptions
 * @property {Cli~commanderOption} * Имя опции
 */

/**
 * Модуль для упрощения написания CLI.
 *
 * @constructor
 * @param {{}} [options] Опции инициализации
 * @param {Cli~defaultCommanderOptions} [options.defaultCommanderOptions] Стандартные опции Commander
 */
function Cli(options) {

    options = options || {};

    /**
     * Версия.
     *
     * @private
     * @type {string}
     */
    this._version = '';

    /**
     * Абсолютный путь до JSON-файла с информацией по пакету.
     *
     * @private
     * @type {string}
     */
    this._packagePath = '';

    /**
     * Относительный путь до конфигурационного JSON-файла.
     *
     * @private
     * @type {string}
     */
    this._configPath = '';

    /**
     * Стандартные опции Commander.
     *
     * @private
     * @type {Cli~defaultCommanderOptions}
     */
    this._defaultCommanderOptions;

    this.defaultCommanderOptions(options.defaultCommanderOptions);

    /**
     * Экземпляр Commander.
     *
     * @private
     * @type {Command}
     */
    this._commander = this.commander(new commander.Command()).commander();
}

Cli.prototype = {

    /**
     * Установить абсолютный путь до JSON-файла с информацией по пакету.
     * Получить содержимое файла.
     *
     * @param {string} [packagePath] Абсолютный путь
     * @returns {Cli|{}}
     */
    package: function(packagePath) {
        if(packagePath) {
            this._packagePath = packagePath;
            return this;
        }

        return fs.existsSync(this._packagePath)
            ? JSON.parse(fs.readFileSync(this._packagePath, 'utf-8'))
            : {};
    },

    /**
     * Установить/получить версию пакета.
     *
     * При отсутствии явно заданной версии будет осуществлена
     * попытка получить версию из JSON-файла с информацией по пакету.
     *
     * @param {string} [version] Версия
     * @returns {Cli|string}
     */
    version: function(version) {
        if(version) {
            this._version = version;
            return this;
        }

        return this._version || this.package().version;
    },

    /**
     * Установить относительный путь до конфигурационного JSON-файла.
     * Получить содержимое файла.
     *
     * @param {string} [configPath] Относительный путь
     * @returns {Cli|{}}
     */
    config: function(configPath) {
        if(configPath) {
            this._configPath = configPath;

            if(this.isDefaultCommanderOption('config')) {
                this.setCommanderOption(this.defaultCommanderOptions().config);
            }

            return this;
        }

        return fs.existsSync(this._configPath)
            ? JSON.parse(fs.readFileSync(Cli.resolveAbsolutePath(this._configPath), 'utf-8'))
            : {};
    },

    /**
     * Соответствие сокращённых типов сообщений функциям вывода.
     *
     * @type {{}}
     */
    verboseAliases: {
        l: { log: console.log },
        i: { info: console.info },
        w: { warn: console.warn },
        e: { error: console.error }
    },

    /**
     * Развернуть сокращённые типы сообщений в функции вывода.
     *
     * Результат работы метода соответствует первому
     * аргументу конструктора модуля `Log`.
     *
     * @param {string} verbose Сокращённые типы сообщений, разделённые запятой
     * @returns {{}}
     */
    resolveVerboseAliases: function(verbose) {
        return verbose.split(',').reduce(function(out, alias) {
            return _.extend(out, this.verboseAliases[alias]);
        }.bind(this), {});
    },

    /**
     * Получить абсолютный путь для опции.
     *
     * Приоритет у явно заданной опции в commander,
     * при её отсутствии будет получен абсолютный путь из конфигурационного файла,
     * а если отсутствует и он, то будет получен абсолютный путь из значения по умолчанию.
     *
     * @param {*} commanderVal Значение опции из commander
     * @param {*} [configVal] Значение опции из конфигурационного файла
     * @param {*} [defaultVal] Стандартное значение
     * @returns {string|string[]}
     */
    resolveOptionPath: function(commanderVal, configVal, defaultVal) {
        if(commanderVal) {
            return Cli.resolveAbsolutePath(commanderVal);
        }

        if(configVal) {
            return Cli.resolveAbsolutePath(path.dirname(Cli.resolveAbsolutePath(this._configPath)), configVal);
        }

        return Cli.resolveAbsolutePath(defaultVal);
    },

    /**
     * Установить/получить экземпляр Commander
     * с выполненным парсингом process.argv.
     *
     * @param {Command} [commander] Экземпляр commander
     * @returns {Cli|Command}
     */
    commander: function(commander) {
        if(commander) {
            this._commander = commander;
            return this;
        }

        if(!this._commander.version()) {
            var version = this.version();
            if(version) {
                this._commander.version(version);
            }
        }

        var defaultCommanderOptions = this.defaultCommanderOptions();
        Object.keys(defaultCommanderOptions).forEach(function(option) {
            if(!this.getCommanderOption(option)) {
                this._commander.option(
                    defaultCommanderOptions[option].flags,
                    defaultCommanderOptions[option].description,
                    defaultCommanderOptions[option].default
                );
            }
        }, this);

        return this._commander;
    },

    /**
     * Пропарсить команду.
     *
     * @param {[]} [args=process.argv] Аргументы
     * @returns {Cli}
     */
    parse: function(args) {
        this._commander.parse(args || process.argv);
        return this;
    },

    /**
     * Получить/установить стандартные опции Commander.
     *
     * @param {Cli~defaultCommanderOptions} [options] Опции
     * @returns {Cli|Cli~defaultCommanderOptions}
     */
    defaultCommanderOptions: function(options) {
        if(options) {
            this._defaultCommanderOptions = options;
            return this;
        }

        return this._defaultCommanderOptions || {
            verbose: {
                flags: '-v, --verbose <modes>',
                description: 'l - log, i - info, w - warn, e - error, comma delimited'
            },
            config: {
                flags: '-c, --config <file>',
                description: 'config in json format',
                default: this._configPath || undefined
            }
        };
    },

    /**
     * Получить опцию Commander.
     *
     * @param {string} optionName Полное имя опции без первых минусов
     * @returns {Option|undefined}
     */
    getCommanderOption: function(optionName) {
        for(var i = 0; i < this._commander.options.length; i++) {
            if(this._commander.options[i].long === '--' + optionName) {
                return this._commander.options[i];
            }
        }
    },

    /**
     * Установить опцию Commander.
     *
     * @param {Cli~commanderOption} option Опция
     * @returns {Cli}
     */
    setCommanderOption: function(option) {
        this.removeCommanderOption(new commander.Option(option.flags, option.description).long.slice(2));
        this._commander.option(
            option.flags,
            option.description,
            option.default
        );
        return this;
    },

    /**
     * Удалить опцию Commander.
     *
     * @param {string} optionName Полное имя опции без первых минусов
     * @returns {Cli}
     */
    removeCommanderOption: function(optionName) {
        for(var i = 0; i < this._commander.options.length; i++) {
            if(this._commander.options[i].long === '--' + optionName) {
                this._commander.options.splice(i, 1);
            }
        }
        return this;
    },

    /**
     * Проверить опцию Commander на стандартно заданную.
     *
     * @param {string} optionName Полное имя опции без первых минусов
     * @returns {boolean}
     */
    isDefaultCommanderOption: function(optionName) {
        var option = this.getCommanderOption(optionName),
            defaultOption = this.defaultCommanderOptions()[optionName];

        return option.flags === defaultOption.flags &&
            option.description === defaultOption.description;
    }

};

/**
 * Получить резолв пути или массива путей.
 *
 * @private
 * @param {string} method Метод модуля `path` для резолва путей
 * @param {string} [from=CWD] Абсолютный путь для резолва относительно него,
 * по умолчанию текущая рабочая директория
 * @param {string|string[]} resolvePath Путь или массив путей для резолва
 * @returns {string|string[]}
 */
function resolveCwdPath(method, from, resolvePath) {
    if(!resolvePath) {
        resolvePath = from;
        from = process.cwd();
    }

    return Array.isArray(resolvePath)
        ? resolvePath.map(function(resolvePath) {
            return path[method](from, resolvePath);
        })
        : path[method](from, resolvePath);
}

/**
 * Получить абсолютный путь из относительного
 * или массив абсолютных путей из массива относительных
 * относительно текущей рабочей директории или заданного пути.
 *
 * @param {string} [from=CWD] Абсолютный путь для резолва относительно него,
 * по умолчанию текущая рабочая директория
 * @param {string|string[]} relativePath Относительный путь или массив путей
 * @returns {string|string[]}
 */
Cli.resolveAbsolutePath = function(from, relativePath) {
    return resolveCwdPath('resolve', from, relativePath);
};

/**
 * Получить относительный путь из абсолютного
 * или массив относительных путей из массива абсолютных
 * относительно текущей рабочей директории или заданного пути.
 *
 * @param {string} [from=CWD] Абсолютный путь для резолва относительно него,
 * по умолчанию текущая рабочая директория
 * @param {string|string[]} absolutePath Абсолютный путь или массив путей
 * @returns {string|string[]}
 */
Cli.resolveRelativePath = function(from, absolutePath) {
    return resolveCwdPath('relative', from, absolutePath);
};

/**
 * Разбить строку в массив по разделителю.
 *
 * @param {string} string Строка
 * @param {string} [separator=,] Разделитель
 * @returns {string[]|undefined}
 */
Cli.split = function(string, separator) {
    if(!string) return;
    return string.split(separator || ',');
};

module.exports = Cli;
