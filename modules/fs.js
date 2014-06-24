const fs = require('fs'),
    Promise = require('bluebird');

/**
 * Закешированные файлы.
 *
 * @private
 * @type {{}}
 */
var _cacheFiles = {};

module.exports = {

    /**
     * Получить содержимое файла.
     *
     * @param {string} file Путь до файла
     * @returns {Promise}
     */
    readFile: function(file) {
        return new Promise(function(resolve, reject) {

            if(_cacheFiles[file]) {
                return resolve(_cacheFiles[file]);
            }

            fs.readFile(file, 'utf-8', function(err, data) {
                if(err) return reject(err);
                _cacheFiles[file] = data = data || '';
                resolve(data);
            });
        });
    },

    /**
     * Колбек вызывается для каждого открытого файла в методе readFiles.
     *
     * @callback fs~readFilesCallback
     * @param {String} file Путь до файла
     * @param {String} data Содержимое файла
     */

    /**
     * Получить содержимое списка файлов.
     *
     * @param {string[]} files Список путей до файлов
     * @param {fs~readFilesCallback} [callback] Колбек вызывается для каждого файла
     * @returns {Promise}
     */
    readFiles: function(files, callback) {
        return Promise.all(files.reduce(function(content, file) {
            var filePromise = this.readFile(file);
            content.push(filePromise);

            filePromise.then(function(data) {
                if(callback) {
                    callback.call(this, file, data);
                }
            }.bind(this));

            return content;
        }.bind(this), []));
    },

    fsAsync: Promise.promisifyAll(fs)

};
