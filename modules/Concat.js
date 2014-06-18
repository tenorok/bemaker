const fs = require('fs');

/**
 * Модуль для объединения содержимого файлов.
 *
 * @constructor
 * @param {string[]} files Список абсолютных путей
 */
function Concat(files) {

    /**
     * Список абсолютных путей.
     *
     * @private
     * @type {string[]}
     */
    this._files = files;
}

Concat.prototype = {

    /**
     * Добавить файлы.
     *
     * @param {string[]} files Список абсолютных путей
     * @returns {Concat}
     */
    add: function(files) {
        this._files = this._files.concat(files);
        return this;
    },

    /**
     * Установить/получить список абсолютных путей.
     *
     * @param {string[]} [files] Список абсолютных путей
     * @returns {Concat|string[]}
     */
    files: function(files) {
        if(files) {
            this._files = files;
            return this;
        }

        return this._files;
    },

    /**
     * Получить объединённое содержимое всех файлов.
     *
     * @returns {Promise}
     */
    toString: function() {
        return new Promise(function(resolve) {
            Promise.all(this._files.reduce(function(content, file) {
                content.push(Concat.readFile(file));
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
Concat.readFile = function(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf-8', function(err, data) {
            if(err) reject(err);
            resolve(data);
        });
    });
};

module.exports = Concat;
