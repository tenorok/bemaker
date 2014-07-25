const path = require('path'),
    fs = require('fs');

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
            return path.join(process.cwd(), relativePath);
        })
        : path.join(process.cwd(), relativePath);
};

module.exports = Cli;
