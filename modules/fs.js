const fs = require('fs'),
    Promise = require('bluebird');

/**
 * Закешированные файлы.
 *
 * @private
 * @type {{}}
 */
var _cacheFiles = {},

    /**
     * Закешированные списки объектов директорий.
     *
     * @private
     * @type {{}}
     */
    _cacheDirList = {};

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

    /**
     * Получить список объектов директории.
     *
     * @param {string} dir Путь до директории
     * @returns {Promise} {string[]} Имена объектов
     */
    readdir: function(dir) {
        return new Promise(function(resolve, reject) {

            if(_cacheDirList[dir]) {
                return resolve(_cacheDirList[dir]);
            }

            fs.readdir(dir, function(err, files) {
                if(err) return reject(err);
                _cacheDirList[dir] = files = files || [];
                resolve(files);
            });
        });
    },

    fsAsync: Promise.promisifyAll(fs)

};
