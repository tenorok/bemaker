const path = require('path'),
    walk = require('walk'),
    Promise = require('bluebird');

/**
 * Модуль для получения информации о файловой структуре.
 *
 * @constructor
 * @param {string|string[]} directories Одна или несколько директорий
 */
function Walk(directories) {

    /**
     * Список директорий для получения информации.
     *
     * @private
     * @type {string[]}
     */
    this._directories = Array.isArray(directories) ? directories : [directories];
}

Walk.prototype = {

    /**
     * Получить список файлов.
     *
     * @returns {Promise} [{string[]}, {string[]}] Список абсолютных путей и список имён файлов
     */
    files: function() {
        return Promise
            .all(this._directories.reduce(function(files, directory) {
                files.push(this._getDirectoryFileList(directory));
                return files;
            }.bind(this), []))
            .then(function(filesOfDirectories) {
                var filePaths = [],
                    fileNames = [];

                filesOfDirectories.forEach(function(files) {
                    filePaths = filePaths.concat(files[0]);
                    fileNames = fileNames.concat(files[1]);
                });

                return [filePaths, fileNames];
            });
    },

    /**
     * Получить список файлов директории.
     *
     * @private
     * @param {string} directory Путь до директории
     * @returns {Promise} [{string[]}, {string[]}] Список абсолютных путей и список имён файлов
     */
    _getDirectoryFileList: function(directory) {
        return new Promise(function(resolve) {
            var walker = walk.walk(directory),
                filePaths = [],
                fileNames = [];

            walker.on('file', function(root, stat, next) {
                filePaths.push(path.join(root, stat.name));
                fileNames.push(stat.name);
                next();
            }.bind(this));

            walker.on('end', function() {
                resolve([filePaths, fileNames]);
            });
        });
    }

};

module.exports = Walk;
