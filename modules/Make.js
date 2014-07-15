/**
 * Опции сборки.
 *
 * @typedef {{}} Make~Config
 * @property {string} config.outdir Директория для сохранения файлов
 * @property {string} config.outname Имя для сохраняемых файлов
 * @property {string[]} config.directories Директории для поиска блоков (уровни переопределения)
 * @property {string[]} config.extensions Расширения файлов к сборке
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
    this._config = config;
}

Make.prototype = {};

module.exports = Make;
