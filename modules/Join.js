const fs = require('fs'),
    Promise = require('bluebird');

/**
 * Модуль для объединения строк и содержимого файлов.
 *
 * @constructor
 * @param {*[]} data Данные могут быть следующего формата:
 *      - {string} string Обычная строка
 *      - {object} file Объект с описанием файла
 *          - {string} file.file Имя файла
 *          - {string} [file.content] Содержимое файла, если файл не нужно читать
 */
function Join(data) {

    /**
     * Данные.
     *
     * @private
     * @type {*[]}
     */
    this._data = data;

    /**
     * Строка предваряющая объединённое содержимое.
     *
     * @private
     * @type {string}
     */
    this._before = '';

    /**
     * Строка предваряющая каждый элемент данных.
     *
     * @private
     * @type {string}
     */
    this._beforeEach = '';

    /**
     * Строка завершающая объединённое содержимое.
     *
     * @private
     * @type {string}
     */
    this._after = '';

    /**
     * Строка последующая за каждым элементом данных.
     *
     * @private
     * @type {string}
     */
    this._afterEach = '';
}

Join.prototype = {

    /**
     * Установить/получить данные.
     *
     * @param {*[]} [data] Данные
     * @returns {Join|*[]}
     */
    data: function(data) {
        if(data) {
            this._data = data;
            return this;
        }

        return this._data;
    },

    /**
     * Добавить данные к объединению.
     *
     * @param {*[]} data Данные
     * @returns {Join}
     */
    add: function(data) {
        this._data = this._data.concat(data);
        return this;
    },

    /**
     * Добавить список абсолютных путей до файлов.
     *
     * @param {string[]} [files] Список абсолютных путей
     * @returns {Join}
     */
    addFiles: function(files) {
        this._data = this._data.concat(files.map(function(file) {
            return { file: file };
        }));
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * первой строки.
     *
     * @callback Join~beforeCallback
     */

    /**
     * Установить первую строку.
     *
     * @param {string|Join~beforeCallback} before Строка
     * @returns {Join}
     */
    before: function(before) {
        this._before = before;
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * предваряющей строки для каждого элемента.
     *
     * @callback Join~beforeEachCallback
     * @param {number} index Индекс элемента
     */

    /**
     * Установить строку предваряющую каждый элемент.
     *
     * @param {string|Join~beforeEachCallback} beforeEach Строка
     * @returns {Join}
     */
    beforeEach: function(beforeEach) {
        this._beforeEach = beforeEach;
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * последней строки.
     *
     * @callback Join~afterCallback
     */

    /**
     * Установить последнюю строку.
     *
     * @param {string|Join~afterCallback} after Строка
     * @returns {Join}
     */
    after: function(after) {
        this._after = after;
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * последующей строки для каждого элемента.
     *
     * @callback Join~afterEachCallback
     * @param {number} index Индекс элемента
     */

    /**
     * Установить строку последующую за каждым элементом.
     *
     * @param {string|Join~afterEachCallback} afterEach Строка
     * @returns {Join}
     */
    afterEach: function(afterEach) {
        this._afterEach = afterEach;
        return this;
    },

    /**
     * Получить объединённое содержимое всех данных.
     *
     * @returns {Promise}
     */
    toString: function() {
        return new Promise(function(resolve) {

            var content = [
                this._getAdditionalString(this._before)
            ];

            Promise.all(this._data.reduce(function(content, part, index) {

                content.push(this._getAdditionalString(this._beforeEach, [index]));

                if(typeof part === 'string') {
                    content.push(part);
                } else {
                    content.push(part.content || Join.readFile(part.file));
                }

                content.push(this._getAdditionalString(this._afterEach, [index]));

                return content;
            }.bind(this), content)).then(function(content) {
                content.push(this._getAdditionalString(this._after));
                resolve(content.join(''));
            }.bind(this));
        }.bind(this));
    },

    /**
     * Получить дополнительную к данным строку.
     *
     * @private
     * @param {string|function} string Дополнительная строка
     * @param {*[]} [data] Дополнительные данные для передачи аргументов в функцию
     * @returns {string}
     */
    _getAdditionalString: function(string, data) {
        return typeof string === 'function' ? string.apply(this, data || []) : string;
    }

};

/**
 * Получить содержимое файла.
 *
 * @param {string} file Абсолютный путь до файла
 * @returns {Promise}
 */
Join.readFile = function(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf-8', function(err, data) {
            if(err) reject(err);
            resolve(data);
        });
    });
};

module.exports = Join;
