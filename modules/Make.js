const path = require('path'),
    Events = require('events').EventEmitter,

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
 * @property {boolean|Make~beforeAfterCallback} [before=true] Необходимость добавления комментария до файла
 * @property {boolean|Make~beforeAfterCallback} [after=true] Необходимость добавления комментария после файла
 * @property {string} [cwd=.] Текущая рабочая директория для резолва путей, по умолчанию текущая директория
 */

/**
 * Колбек вызывается перед установкой
 * предваряющей и последующей строки для каждого файла.
 *
 * @callback Make~beforeAfterCallback
 * @param {number} index Индекс файла
 * @param {string} absPath Абсолютный путь до файла
 * @param {string} relPath Относительный путь до файла
 * @param {string} extname Полное расширение файла (например для `file.ie.css` будет `.ie.css`)
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
 * @class
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
        jsdoctag: 'bemaker',
        before: true,
        after: true,
        cwd: __dirname
    });

    /**
     * Экземпляр событийного модуля.
     *
     * @private
     * @type {events.EventEmitter}
     */
    this._emitter = new Events();
}

Make.prototype = {

    /**
     * Собрать файлы.
     *
     * @returns {Promise} Make~contentByExtensions
     */
    build: function() {
        return this.getBlocks()
            .then(function(blocks) {
                return this.sort(this.filter(blocks));
            }.bind(this))
            .then(this.groupByExtensions.bind(this))
            .then(this.writeFilesByExtensions.bind(this))
    },

    /**
     * Получить список блоков со всех уровней.
     *
     * @returns {Promise} Make~poolBlocks
     */
    getBlocks: function() {
        return this._getBlocksList()
            .then(this._getLevelsFiles.bind(this))
            .then(this._getBlocksDepends.bind(this))
            .then(this._bindDependEvents.bind(this));
    },

    /**
     * Отфильтровать требуемые блоки
     * на основании поля `blocks` в опциях сборки.
     *
     * @param {Make~poolBlocks} blocks Список блоков
     * @fires Make#filter
     * @returns {Make~poolBlocks}
     */
    filter: function(blocks) {
        if(this._config.blocks) {
            var pool = new Pool(this._depend.filter(this._config.blocks));
            pool.get().forEach(function(block) {

                /**
                 * Событие c информацией об отфильтрованных блоках.
                 *
                 * @event Make#filter
                 * @type {{}}
                 * @property {string} block Имя блока
                 */
                this._emitter.emit('filter', { block: block.name });
            }, this);
            return pool;
        }

        return blocks;
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
        return this._depend.sort();
    },

    /**
     * Сгруппировать файлы блоков по расширениям.
     *
     * @param {Make~poolBlocks} blocks Список блоков
     * @fires Make#extension
     * @returns {Make~groupsByExtensions}
     */
    groupByExtensions: function(blocks) {
        return blocks.reduce(function(groups, block) {
            block.levels.forEach(function(level) {
                level.files.forEach(function(file) {
                    if(groups[file.extname]) {
                        groups[file.extname].addFiles([file.path]);
                    } else if(!this._config.extensions || ~this._config.extensions.indexOf(file.extname)) {
                        groups[file.extname] = new Join([{ file: file.path }]);

                        /**
                         * Событие добавления нового расширения для группировки файлов.
                         *
                         * @event Make#extension
                         * @type {{}}
                         * @property {string} name Имя расширения
                         */
                        this._emitter.emit('extension', { name: file.extname });
                    }
                }, this);
            }, this);
            return groups;
        }.bind(this), {});
    },

    /**
     * Сохранить файлы по расширениям.
     *
     * @param {Make~groupsByExtensions} groups Файлы блоков по расширениям
     * @fires Make#save
     * @returns {Promise} Make~contentByExtensions
     */
    writeFilesByExtensions: function(groups) {
        var content = {};
        return Promise.all(Object.keys(groups).reduce(function(promises, extname) {
            return promises.concat(this._setBeforeAfterFile(groups[extname], extname).toString().then(function(joined) {
                content[extname] = joined;
            }));
        }.bind(this), []))
            .then(function() {
                return Promise.all(Object.keys(content).reduce(function(promises, extname) {
                    var filePath = path.join(this._config.outdir, this._config.outname + extname);
                    promises.push(fs.fsAsync.writeFileAsync(filePath, content[extname]));

                    /**
                     * Событие сохранения собранного для расширения файла.
                     *
                     * @event Make#save
                     * @type {{}}
                     * @property {string} path Путь до сохранённого файла
                     */
                    this._emitter.emit('save', { path: filePath });
                    return promises;
                }.bind(this), []));
            }.bind(this))
            .then(function() {
                return content;
            });
    },

    /**
     * Подписаться на события модуля.
     *
     * @param {string} event Имя события
     * @param {function} listener Колбек
     * @returns {events.EventEmitter}
     */
    on: function(event, listener) {
        return this._emitter.on.call(this._emitter, event, listener);
    },

    /**
     * Инициировать проксируемое событие.
     *
     * @private
     * @param {string} event Имя события
     * @param {Arguments} data Данные события
     */
    _emitProxyEvent: function(event, data) {
        this._emitter.emit.apply(this._emitter, [event].concat(Array.prototype.slice.call(data)));
    },

    /**
     * Создать единый экземпляр `Depend` и подписаться на его события для проксирования.
     *
     * @private
     * @param {Make~poolBlocks} blocks Список блоков
     * @fires Depend#loop
     * @fires Depend#unexist
     * @returns {Make~poolBlocks}
     */
    _bindDependEvents: function(blocks) {

        /**
         * Экземпляр модуля для работы с зависимостями.
         *
         * Необходим единый экземпляр для предотвращения повторной инициации
         * событий при совместном использовании методов `filter` и `sort`.
         *
         * @private
         * @type {Depend}
         */
        this._depend = new Depend(blocks);

        this._depend.on('loop', function() {

            /**
             * Прокси для события обнаружения циклической зависимости в модуле `Depend`.
             *
             * @event Depend#loop
             * @type {string[]} branch Список имён модулей в порядке зависимостей
             */
            this._emitProxyEvent('loop', arguments);
        }.bind(this));

        this._depend.on('unexist', function() {

            /**
             * Прокси для события обнаружения несуществующего модуля.
             *
             * @event Depend#unexist
             * @type {{}}
             * @property {string|null} name Имя зависимого модуля или null, если он отсутствует
             * @property {string} require Имя несуществующего модуля
             */
            this._emitProxyEvent('unexist', arguments);
        }.bind(this));

        return blocks;
    },

    /**
     * Установить предваряющую и последующую строки вокруг каждого файла.
     *
     * @param {Join} group Группа файлов с единым расширением
     * @param {string} extname Расширение группы файлов
     * @returns {Join} Модифицированный экземпляр
     */
    _setBeforeAfterFile: function(group, extname) {
        var config = this._config,
            cwd = this._config.cwd;

        ['before', 'after'].forEach(function(place) {
            if(config[place]) {
                if(typeof config[place] === 'function') {
                    group[place + 'EachFile'](function(i, file) {
                        return config[place].call(this, i, file, path.relative(cwd, file), extname);
                    });
                } else {
                    group[place + 'EachFile'](function(i, file) {
                        return '/* ' + place + ': ' + path.relative(cwd, file) + ' */\n';
                    });
                }
            }
        });

        return group;
    },

    /**
     * Получить список блоков и уровни переопределения,
     * на которых они присутствуют.
     *
     * @private
     * @fires Make#level
     * @fires Make#block
     * @returns {Promise} Make~poolBlocksList
     */
    _getBlocksList: function() {
        var blocks = new Pool();
        return new Walk(this._config.directories).dirs().spread(function(flat, levels) {
            levels.forEach(function(blocksList, levelIndex) {
                var levelPath = this._config.directories[levelIndex];

                /**
                 * Событие чтения директорий блоков на уровне переопределения.
                 *
                 * @event Make#level
                 * @type {{}}
                 * @property {string} path Путь до уровня переопределения
                 */
                this._emitter.emit('level', { path: levelPath });

                blocksList.forEach(function(block) {

                    /**
                     * Событие чтения директории одного из блоков на уровне переопределения.
                     *
                     * @event Make#block
                     * @type {{}}
                     * @property {string} name Имя блока
                     */
                    this._emitter.emit('block', { name: block });

                    blocks.exists(block)
                        ? blocks.get(block).levels.push({ path: levelPath })
                        : blocks.push({ name: block, levels: [{ path: levelPath }] });
                }, this);
            }, this);
            return blocks;
        }.bind(this));
    },

    /**
     * Получить файлы блоков на каждом уровне переопределения.
     *
     * @private
     * @param {Make~poolBlocksList} blocks Список блоков и уровни переопределения, на которых они присутствуют
     * @fires Make#file
     * @returns {Promise} Make~poolBlocksLevelsFiles
     */
    _getLevelsFiles: function(blocks) {
        var emitter = this._emitter;
        return Promise.all(blocks.get().reduce(function(promises, block, blockIndex) {
            return promises.concat(block.levels.reduce(function(promises, level, levelIndex) {
                return promises.concat(new Walk(path.join(level.path, block.name)).filesRecur().spread(function(list) {
                    blocks.get()[blockIndex].levels[levelIndex].files =
                        list.names.reduce(function(files, fileName, fileIndex) {
                            var extname = '.' + fileName.split('.').slice(1).join('.'),
                                basename = path.basename(fileName, extname),
                                selector = new Selector(basename),
                                filePath = list.absolute[fileIndex];

                            if(!selector.block()) {
                                selector.block(block.name);
                            }

                            /**
                             * Событие чтения файла блока.
                             *
                             * @event Make#file
                             * @type {{}}
                             * @property {string} path Путь до файла
                             */
                            emitter.emit('file', { path: filePath });

                            files.push({
                                basename: basename,
                                extname: extname,
                                path: filePath,
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
     * @fires Make#depend
     * @returns {Promise} Make~poolBlocks
     */
    _getBlocksDepends: function(blocks) {
        return Promise.all(blocks.get().reduce(function(promises, block, blockIndex) {
            block.levels.forEach(function(level) {
                level.files.forEach(function(file) {
                    if(file.extname === this._config.dependext) {
                        promises.push(fs.readFile(file.path).then(function(content) {
                            var require = Depend.parseJSDoc(content, this._config.jsdoctag);

                            /**
                             * Событие чтения зависимостей блока.
                             *
                             * @event Make#depend
                             * @type {{}}
                             * @property {string} path Путь до файла с зависимостями
                             */
                            this._emitter.emit('depend', { path: file.path });

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
