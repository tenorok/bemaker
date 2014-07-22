const path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    Selector = require('bemer').modules('Selector'),
    fs = require('./fs'),
    Walk = require('./Walk'),
    Pool = require('./Pool'),
    Depend = require('./Depend'),
    Join = require('./Join');

/**
 * Опции сборки.
 *
 * @typedef {{}} Make~Config
 * @property {string} outdir Директория для сохранения файлов
 * @property {string} outname Имя для сохраняемых файлов
 * @property {string[]} directories Директории для поиска блоков (уровни переопределения)
 * @property {string[]} [extensions] Расширения файлов к сборке, по умолчанию собираются все найденные расширения
 * @property {string[]} [blocks] Блоки для сборки, по умолчанию собираются все блоки
 * @property {string} [dependext=.js] Расширение файла для чтения зависимостей
 * @property {string} [jsdoctag=bemaker] Тег для чтения зависимостей в JSDoc
 */

/**
 * Список блоков и уровни переопределения, на которых они присутствуют.
 *
 * @typedef {Pool} Make~poolBlocksList
 *
 * Где каждый модуль: {
 *      name: string,     Имя блока
 *      levels: {         Уровни переопределения, на которых присутствует блок
 *          path: string  Абсолютный путь до уровня
 *      }[]
 * }
 */

/**
 * Список блоков, их уровни переопределения и файлы.
 *
 * @typedef {Pool} Make~poolBlocksLevelsFiles
 *
 * Где каждый модуль: {
 *      name: string,               Имя блока
 *      levels: {                   Уровни переопределения, на которых присутствует блок
 *          path: string,           Абсолютный путь до уровня
 *          files: {                Файлы блока на текущем уровне
 *              basename: string,   Имя файла
 *              extname: string',   Расширение файла
 *              path: string,       Абсолютный путь до файла
 *              selector: Selector  Экземпляр модуля bemer.Selector
 *          }[]
 *      }[]
 * }
 */

/**
 * Список блоков, их уровни переопределения, файлы и зависимости.
 *
 * @typedef {Pool} Make~poolBlocks
 *
 * Где каждый модуль: {
 *      name: string,               Имя блока
 *      require: string[],          Зависимости блока
 *      levels: {                   Уровни переопределения, на которых присутствует блок
 *          path: string,           Абсолютный путь до уровня
 *          files: {                Файлы блока на текущем уровне
 *              basename: string,   Имя файла
 *              extname: string',   Расширение файла
 *              path: string,       Абсолютный путь до файла
 *              selector: Selector  Экземпляр модуля bemer.Selector
 *          }[]
 *      }[]
 * }
 */

/**
 * Сгруппированные файлы блоков по расширениям.
 *
 * Ключами являются расширения файлов.
 *
 * @typedef {{}} Make~groupsByExtensions
 * @property {Join} * Файлы блоков по расширению в ключе
 */

/**
 * Содержимое файлов блоков по расширениям.
 *
 * Ключами являются расширения файлов.
 *
 * @typedef {{}} Make~contentByExtensions
 * @property {Join} * Содержимое файлов блоков по расширению в ключе
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
     * Получить список блоков со всех уровней.
     *
     * @returns {Promise} Make~poolBlocks
     */
    getBlocks: function() {
        return this._getBlocksList()
            .then(this._getLevelsFiles.bind(this))
            .then(this._getBlocksDepends.bind(this));
    },

    /**
     * Отфильтровать требуемые блоки
     * на основании поля `blocks` в опциях сборки.
     *
     * @param {Make~poolBlocks} blocks Список блоков
     * @returns {Make~poolBlocks}
     */
    filter: function(blocks) {
        return this._config.blocks
            ? new Pool(new Depend(blocks).filter(this._config.blocks))
            : blocks;
    },

    /**
     * Отсортировать блоки по зависимостям
     * и их файлы по весу селекторов.
     *
     * @param {Make~poolBlocks} blocks Список блоков
     * @returns {Make~poolBlocks} Отсортированный список блоков
     */
    sort: function(blocks) {
        blocks.get().forEach(function(block) {
            block.levels.forEach(function(level) {
                level.files.sort(function(file1, file2) {
                    return file1.selector.weight() > file2.selector.weight();
                });
            });
        });
        return new Depend(blocks).sort();
    },

    /**
     * Сгруппировать файлы блоков по расширениям.
     *
     * @param {Make~poolBlocks} blocks Список блоков
     * @returns {Make~groupsByExtensions}
     */
    groupByExtensions: function(blocks) {
        return blocks.reduce(function(groups, block) {
            block.levels.forEach(function(level) {
                level.files.forEach(function(file) {
                    if(groups[file.extname]) {
                        groups[file.extname].addFiles([file.path]);
                    } else {
                        groups[file.extname] = new Join([{ file: file.path }]);
                    }
                });
            });
            return groups;
        }, {});
    },

    /**
     * Сохранить файлы по расширениям.
     *
     * @param {Make~groupsByExtensions} groups Файлы блоков по расширениям
     * @returns {Promise} Make~contentByExtensions
     */
    writeFilesByExtensions: function(groups) {
        var content = {};
        return Promise.all(Object.keys(groups).reduce(function(promises, extname) {
            return promises.concat(groups[extname].toString().then(function(joined) {
                content[extname] = joined;
            }));
        }, []))
            .then(function() {
                return Promise.all(Object.keys(content).reduce(function(promises, extname) {
                    promises.push(fs.fsAsync.writeFileAsync(
                        path.join(this._config.outdir, this._config.outname + extname),
                        content[extname]
                    ));
                    return promises;
                }.bind(this), []));
            }.bind(this))
            .then(function() {
                return content;
            });
    },

    /**
     * Получить список блоков и уровни переопределения,
     * на которых они присутствуют.
     *
     * @private
     * @returns {Promise} Make~poolBlocksList
     */
    _getBlocksList: function() {
        var blocks = new Pool();
        return new Walk(this._config.directories).dirs().spread(function(flat, levels) {
            levels.forEach(function(blocksList, levelIndex) {
                var levelPath = this._config.directories[levelIndex];
                blocksList.forEach(function(block) {
                    blocks.exists(block)
                        ? blocks.get(block).levels.push({ path: levelPath })
                        : blocks.push({ name: block, levels: [{ path: levelPath }] });
                });
            }, this);
            return blocks;
        }.bind(this));
    },

    /**
     * Получить файлы блоков на каждом уровне переопределения.
     *
     * @private
     * @param {Make~poolBlocksList} blocks Список блоков и уровни переопределения, на которых они присутствуют
     * @returns {Promise} Make~poolBlocksLevelsFiles
     */
    _getLevelsFiles: function(blocks) {
        return Promise.all(blocks.get().reduce(function(promises, block, blockIndex) {
            return promises.concat(block.levels.reduce(function(promises, level, levelIndex) {
                return promises.concat(new Walk(path.join(level.path, block.name)).filesRecur().spread(function(list) {
                    blocks.get()[blockIndex].levels[levelIndex].files =
                        list.names.reduce(function(files, fileName, fileIndex) {
                            var extname = '.' + fileName.split('.').slice(1).join('.'),
                                basename = path.basename(fileName, extname),
                                selector = new Selector(basename);

                            if(!selector.block()) {
                                selector.block(block.name);
                            }

                            files.push({
                                basename: basename,
                                extname: extname,
                                path: list.absolute[fileIndex],
                                selector: selector
                            });
                            return files;
                        }, []);
                }));
            }, []));
        }, [])).then(function() {
                return blocks;
            });
    },

    /**
     * Получить зависимости блоков.
     *
     * @private
     * @param {Make~poolBlocksLevelsFiles} blocks Список блоков, их уровни переопределения и файлы
     * @returns {Promise} Make~poolBlocks
     */
    _getBlocksDepends: function(blocks) {
        return Promise.all(blocks.get().reduce(function(promises, block, blockIndex) {
            block.levels.forEach(function(level) {
                level.files.forEach(function(file) {
                    if(file.extname === this._config.dependext) {
                        promises.push(fs.readFile(file.path).then(function(content) {
                            var require = Depend.parseJSDoc(content, this._config.jsdoctag);

                            blocks.get()[blockIndex].require = blocks.get()[blockIndex].require
                                ? blocks.get()[blockIndex].require.concat(require)
                                : require;
                            return file;
                        }.bind(this)));
                    }
                }, this);
            }, this);
            return promises;
        }.bind(this), [])).then(function() {
                return blocks;
            });
    }

};

module.exports = Make;
