const path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    commander = require('commander');

/**
 * Модуль для упрощения написания CLI.
 *
 * @constructor
 */
function Cli() {

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
     * Экземпляр Commander.
     *
     * @private
     * @type {Command}
     */
    this._commander = new commander.Command();
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
     * Установить/получить экземпляр Commander.
     *
     * @param {Command} [commander] Экземпляр commander
     * @returns {Cli|Command}
     */
    commander: function(commander) {
        if(commander) {
            this._commander = commander;
        }

        if(!this._commander.version()) {
            this._commander.version(this.version());
        }

        return !commander ? this._commander : this;
    },

    /**
     * Получить опцию Commander.
     *
     * @param {string} option Полное имя опции без первых минусов
     * @returns {Option|undefined}
     */
    getCommanderOption: function(option) {
        for(var i = 0; i < this._commander.options.length; i++) {
            if(this._commander.options[i].long === '--' + option) {
                return this._commander.options[i];
            }
        }
    }

};

/**
 * Получить абсолютный путь из относительного
 * или массив абсолютных путей из массива относительных
 * относительно текущей рабочей директории.
 *
 * @param {string|string[]} relativePath Относительный путь или массив путей
 * @returns {string|string[]}
 */
Cli.resolveAbsolutePath = function(relativePath) {
    return Array.isArray(relativePath)
        ? relativePath.map(function(relativePath) {
            return path.resolve(process.cwd(), relativePath);
        })
        : path.resolve(process.cwd(), relativePath);
};

module.exports = Cli;
