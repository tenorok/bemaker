const fs = require('fs'),
    Promise = require('bluebird');

/**
 * Модуль для объединения строк и содержимого файлов.
 *
 * @constructor
 * @param {array} data Данные могут быть следующего формата:
 *      - {string} string Обычная строка
 *      - {object} file Объект с описанием файла
 *          - {string} file.file Имя файла
 *          - {string} [file.content] Содержимое файла, если файл не нужно читать
 */
function Join(data) {

    /**
     * Список строк и абсолютных путей до файлов к объединению.
     *
     * @private
     * @type {array}
     */
    this._data = data;
}

Join.prototype = {

    /**
     * Добавить данные к объединению.
     *
     * @param {array} data Данные
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
     * Получить объединённое содержимое всех данных.
     *
     * @returns {Promise}
     */
    toString: function() {
        return new Promise(function(resolve) {
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
