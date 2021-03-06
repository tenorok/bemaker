const fs = require('./fs'),
    Promise = require('bluebird');

/**
 * Элемент данных.
 *
 * Элемент может быть обычной строкой или хеш-картой.
 *
 * @typedef {string|{}} Join~DataItem
 * @property {string} file Имя файла
 * @property {string} [content] Содержимое файла, если файл не нужно читать
 */

/**
 * Модуль для объединения строк и содержимого файлов.
 *
 * @class
 * @param {Join~DataItem[]} [data] Данные
 */
function Join(data) {

    /**
     * Данные.
     *
     * @private
     * @type {Join~DataItem[]}
     */
    this._data = data || [];

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
     * Строка предваряющая каждый файл.
     *
     * @private
     * @type {string}
     */
    this._beforeEachFile = '';

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

    /**
     * Строка последующая за каждым файлом.
     *
     * @private
     * @type {string}
     */
    this._afterEachFile = '';
}

Join.prototype = {

    /**
     * Установить/получить данные.
     *
     * @param {Join~DataItem[]} [data] Данные
     * @returns {Join|Join~DataItem[]}
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
     * @param {Join~DataItem[]} data Данные
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
     * первой и последней строки.
     *
     * @callback Join~beforeAfterCallback
     */

    /**
     * Установить первую строку.
     *
     * @param {string|Join~beforeAfterCallback} before Строка
     * @returns {Join}
     */
    before: function(before) {
        this._before = before;
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * предваряющей и последующей строки для каждого элемента.
     *
     * @callback Join~beforeAfterEachCallback
     * @param {Join~DataItem} item Элемент данных
     * @param {number} index Индекс элемента
     * @param {number} length Количество элементов
     */

    /**
     * Установить строку предваряющую каждый элемент.
     *
     * @param {string|Join~beforeAfterEachCallback} beforeEach Строка
     * @returns {Join}
     */
    beforeEach: function(beforeEach) {
        this._beforeEach = beforeEach;
        return this;
    },

    /**
     * Колбек вызывается перед установкой
     * предваряющей и последующей строки для каждого файла.
     *
     * @callback Join~beforeAfterEachFileCallback
     * @param {Join~DataItem} item Элемент данных в виде хеш-карты файла
     * @param {number} index Индекс файла
     * @param {number} length Количество файлов
     */

    /**
     * Установить строку предваряющую каждый файл.
     *
     * @param {string|Join~beforeAfterEachFileCallback} beforeEachFile Строка
     * @returns {Join}
     */
    beforeEachFile: function(beforeEachFile) {
        this._beforeEachFile = beforeEachFile;
        return this;
    },

    /**
     * Установить последнюю строку.
     *
     * @param {string|Join~beforeAfterCallback} after Строка
     * @returns {Join}
     */
    after: function(after) {
        this._after = after;
        return this;
    },

    /**
     * Установить строку последующую за каждым элементом.
     *
     * @param {string|Join~beforeAfterEachCallback} afterEach Строка
     * @returns {Join}
     */
    afterEach: function(afterEach) {
        this._afterEach = afterEach;
        return this;
    },

    /**
     * Установить строку последующую за каждым файлом.
     *
     * @param {string|Join~beforeAfterEachFileCallback} afterEachFile Строка
     * @returns {Join}
     */
    afterEachFile: function(afterEachFile) {
        this._afterEachFile = afterEachFile;
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
                ],
                length = this._data.length,
                indexFile = 0,
                lengthFile = typeof this._beforeEachFile === 'function' || typeof this._afterEachFile === 'function'
                    ? this._data.filter(function(item) { return typeof item !== 'string'; }).length
                    : null;

            Promise.all(this._data.reduce(function(content, item, index) {

                content.push(this._getAdditionalString(this._beforeEach, [item, index, length]));

                if(typeof item === 'string') {
                    content.push(item);
                } else {
                    content.push(
                        this._getAdditionalString(this._beforeEachFile, [item, indexFile, lengthFile]),
                        item.content || fs.readFile(item.file),
                        this._getAdditionalString(this._afterEachFile, [item, indexFile++, lengthFile])
                    );
                }

                content.push(this._getAdditionalString(this._afterEach, [item, index, length]));

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
     * @param {Array.<Join~DataItem|number>} [data] Дополнительные данные для передачи аргументов в функцию
     * @returns {string}
     */
    _getAdditionalString: function(string, data) {
        return typeof string === 'function' ? string.apply(this, data || []) : string;
    }

};

module.exports = Join;
