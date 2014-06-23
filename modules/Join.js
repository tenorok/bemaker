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
     * @param {number} index Индекс элемента
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
     * @param {number} index Индекс файла
     * @param {string} path Абсолютный путь до файла
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
                indexFile = 0;

            Promise.all(this._data.reduce(function(content, part, index) {

                content.push(this._getAdditionalString(this._beforeEach, [index]));

                if(typeof part === 'string') {
                    content.push(part);
                } else {
                    content.push(
                        this._getAdditionalString(this._beforeEachFile, [indexFile, part.file]),
                        part.content || Join.readFile(part.file),
                        this._getAdditionalString(this._afterEachFile, [indexFile++, part.file])
                    );
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
