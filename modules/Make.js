const path = require('path'),
    _ = require('lodash'),
    Walk = require('./Walk'),
    Depend = require('./Depend');

/**
 * Опции сборки.
 *
 * @typedef {{}} Make~Config
 * @property {string} config.outdir Директория для сохранения файлов
 * @property {string} config.outname Имя для сохраняемых файлов
 * @property {string[]} config.directories Директории для поиска блоков (уровни переопределения)
 * @property {string[]} config.extensions Расширения файлов к сборке
 * @property {string} [config.dependext=.js] Расширение файла для чтения зависимостей
 * @property {string} [config.jsdoctag=bemaker] Тег для чтения зависимостей в JSDoc
 */

/**
 * Модуль логики сборки.
 *
 * @constructor
 * @param {Make~Config} config Опции сборки
 */
function Make(config) {

    /**
     * Опции сборки.
     *
     * @private
     * @type {Make~Config}
     */
    this._config = _.defaults(config, {
        dependext: '.js',
        jsdoctag: 'bemaker'
    });
}

Make.prototype = {

    /**
     * Собрать файлы.
     *
     * @returns {Promise}
     */
    build: function() {
        return this._getFileList().then(function(dirs) {
            // console.log(dirs);
        });
    },

    /**
     * Получить список файлов со всех уровней.
     *
     * @private
     * @returns {Promise} [
     *      [
     *          { dirname: 'dir', basename: 'file', extname: '.ext' }
     *          ...
     *      ]
     *      ...
     * ]
     */
    _getFileList: function() {
        return new Walk(this._config.directories).filesRecur().spread(function(flat, nest) {
            var dirs = [];
            nest.forEach(function(dir) {
                var files = [];
                dir.relative.forEach(function(relativePath) {
                    files.push({
                        dirname: path.dirname(relativePath),
                        basename: path.basename(relativePath),
                        extname: path.extname(relativePath)
                    });
                });
                dirs.push(files);
            });
            return dirs;
        });
    }

};

module.exports = Make;
