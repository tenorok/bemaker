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
     * Установить строку в начало.
     *
     * @param {string|function} before Строка
     * @returns {Join}
     */
    before: function(before) {
        this._before = before;
        return this;
    },

    /**
     * Получить объединённое содержимое всех данных.
     *
     * @returns {Promise}
     */
    toString: function() {
        return new Promise(function(resolve) {

            this._data.unshift(typeof this._before === 'function' ? this._before.call(this) : this._before);

            Promise.all(this._data.reduce(function(content, part) {

                if(typeof part === 'string') {
                    content.push(part);
                } else {
                    content.push(part.content || Join.readFile(part.file));
                }

                return content;
            }, [])).then(function(content) {
                resolve(content.join(''));
            });
        }.bind(this));
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
