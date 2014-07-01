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
        return new Promise(function(resolve) {
            var filePaths = [],
                fileNames = [];

            this._directories.forEach(function(directory) {
                var walker = walk.walk(directory);

                walker.on('file', function(root, stat, next) {
                    filePaths.push(path.join(root, stat.name));
                    fileNames.push(stat.name);
                    next();
                }.bind(this));

                walker.on('end', function() {
                    resolve([filePaths, fileNames]);
                });
            });
        }.bind(this));
    }

};

module.exports = Walk;
