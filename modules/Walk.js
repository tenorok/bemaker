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
     * Получить список файлов.
     *
     * @param {Walk~filterCallback} [filter] Функция фильтрации файлов
     * @returns {Promise} [
     *      {string[]}, Плоский список всех файлов всех директорий
     *      {string[][]} Список файлов каждой отдельной директории
     * ]
     */
    files: function(filter) {
        return this.list(function(name, stats, index) {
            if(stats.isFile()) {
                return filter ? filter.apply(this, arguments) : true;
            }
        });
    },

    /**
     * Получить список папок.
     *
     * @param {Walk~filterCallback} [filter] Функция фильтрации директорий
     * @returns {Promise} [
     *      {string[]}, Плоский список всех папок всех директорий
     *      {string[][]} Список папок каждой отдельной директории
     * ]
     */
    dirs: function(filter) {
        return this.list(function(name, stats, index) {
            if(stats.isDirectory()) {
                return filter ? filter.apply(this, arguments) : true;
            }
        });
    },

    /**
     * Получить список объектов рекурсивно.
     *
     * @param {Walk~filterCallback} [filter] Функция фильтрации объектов
     * @returns {Promise} [
     *      Плоский список всех файлов всех директорий
     *      {{
     *          names: string[],    Имена объектов
     *          absolute: string[]  Абсолютные пути
     *      }},
     *      Список объектов каждой отдельной директории
     *      {{
     *          names: string[],    Имена объектов
     *          absolute: string[], Абсолютные пути
     *          relative: string[]  Относительные пути
     *      }[]}
     * ]
     */
    listRecur: function(filter) {
        return Promise
            .all(this._directories.reduce(function(files, directory) {
                files.push(this._getDirectoryListRecur(directory));
                return files;
            }.bind(this), []))
            .then(function(nest) {
                var flatNames = [],
                    flatAbsolute = [],
                    nestByPath = [];

                nest.forEach(function(objects, index) {
                    flatNames = flatNames.concat(objects[0]);
                    flatAbsolute = flatAbsolute.concat(objects[1]);

                    nestByPath.push({
                        names: objects[0],
                        absolute: objects[1],
                        relative: objects[1].reduce(function(relative, absolute) {
                            return relative.concat(path.relative(this._directories[index], absolute));
                        }.bind(this), [])
                    });
                }, this);

                return [{ names: flatNames, absolute: flatAbsolute }, nestByPath];
            }.bind(this));
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
    },

    /**
     * Рекурсивно получить список объектов директории.
     *
     * @private
     * @param {string} directory Путь до директории
     * @returns {Promise} [
     *      string[], Имена объектов
     *      string[]  Абсолютные пути
     * ]
     */
    _getDirectoryListRecur: function(directory, type) {
        return new Promise(function(resolve) {
            var walker = walk.walk(directory),
                names = [],
                absolute = [];

            walker.on(type || 'node', function(root, stat, next) {
                names.push(stat.name);
                absolute.push(path.join(root, stat.name));
                next();
            }.bind(this));

            walker.on('end', function() {
                resolve([names, absolute]);
            });
        });
    }

};

module.exports = Walk;
