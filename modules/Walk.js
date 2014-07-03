const path = require('path'),
    fs = require('./fs'),
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
     * Колбек вызывается на каждом объекте директории
     * для фильтрации конечного списка объектов.
     *
     * Если функция возвращает `true`, объект будет включен в результирующий список.
     *
     * @callback Walk~filterCallback
     * @param {string} name Имя объекта
     * @param {fs.Stats} stats Информация об объекте
     * @param {number} index Индекс объекта
     * @returns {boolean}
     */

    /**
     * Получить список объектов.
     *
     * @param {Walk~filterCallback} [filter] Функция фильтрации объектов
     * @returns {Promise} [
     *      {string[]}, Плоский список всех объектов всех директорий
     *      {string[][]} Список объектов каждой отдельной директории
     * ]
     */
    list: function(filter) {
        return Promise
            .all(this._directories.reduce(function(objects, directory) {
                objects.push(this._getDirectoryList(directory, filter));
                return objects;
            }.bind(this), []))
            .then(function(nest) {
                return [
                    nest.reduce(function(objects, list) {
                        objects = objects.concat(list);
                        return objects;
                    }, []),
                    nest
                ];
            });
    },

    /**
     * Получить список файлов рекурсивно.
     *
     * @returns {Promise} [{string[]}, {string[]}] Список абсолютных путей и список имён файлов
     */
    filesRecur: function() {
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
     * Получить список объектов заданной директории.
     *
     * @private
     * @param {string} directory Путь до директории
     * @param {Walk~filterCallback} [filter] Функция фильтрации объектов
     * @returns {Promise} {string[]} Список объектов
     */
    _getDirectoryList: function(directory, filter) {
        return fs.readdir(directory).then(function(list) {
            if(!filter) {
                return list;
            }

            return Promise.all(list.reduce(function(stats, object) {
                    stats.push(fs.fsAsync.statAsync(path.join(directory, object)));
                    return stats;
                }, []))
                .then(function(stats) {
                    return list.filter(function(name, index) {
                        return filter.call(this, name, stats[index], index);
                    }, this);
                }.bind(this));

        }.bind(this));
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
