const Events = require('events').EventEmitter,

    jsdocParser = require('comment-parser'),
    Pool = require('./Pool');

/**
 * Модуль.
 *
 * @typedef {{}} Depend~Module
 * @property {string} name Имя модуля
 * @property {string[]} require Список имён требуемых модулей
 */

/**
 * Модуль для работы с зависимостями.
 *
 * @class
 * @param {Depend~Module[]|Pool} modules Модули
 */
function Depend(modules) {

    /**
     * Хранилище имеющихся модулей.
     *
     * @private
     * @type {Pool}
     */
    this._modules = modules instanceof Pool ? modules : new Pool(modules);

    /**
     * Экземпляр событийного модуля.
     *
     * @private
     * @type {events.EventEmitter}
     */
    this._emitter = new Events();

    /**
     * Список имён обнаруженных несуществующих модулей.
     *
     * @private
     * @type {string[]}
     */
    this._unexistList = [];

    /**
     * Список модулей, посещённых во время сортировки и фильтрации.
     *
     * @private
     * @type {string[]}
     */
    this._visited = [];

    /**
     * Список модулей всевозможных ветвей зависимостей.
     * Для отслеживания и фиксации рекурсивных зависимостей.
     *
     * @private
     * @type {string[]}
     */
    this._branch = [];
}

Depend.prototype = {

    /**
     * Отсортировать модули по зависимостям.
     *
     * @fires Depend#loop
     * @fires Depend#unexist
     * @returns {Depend~Module[]}
     */
    sort: function() {

        /**
         * Хранилище отсортированных модулей.
         *
         * @private
         * @type {Pool}
         */
        this._sorted = new Pool();

        this._visited = [];
        this._branch = [];

        this._modules.get().forEach(this._sort, this);

        return this._sorted.get();
    },

    /**
     * Отфильтровать модули для заданного модуля
     * или нескольких модулей по зависимостям.
     *
     * @param {string|string[]} name Имя заданного модуля или нескольких модулей
     * @fires Depend#loop
     * @fires Depend#unexist
     * @returns {Depend~Module[]}
     */
    filter: function(name) {

        this._visited = [];
        this._branch = [];

        return this._modules.filter(
            typeof name === 'string'
                ? this._filter(name, [], null)
                : name.reduce(function(filteredNames, name) {
                    return filteredNames.concat(this._filter(name, [], null));
                }.bind(this), [])
        ).get();
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
     * Рекурсивно отсортировать модули по зависимостям для заданного модуля.
     *
     * @private
     * @param {Depend~Module} module Заданный модуль
     * @fires Depend#loop
     * @fires Depend#unexist
     */
    _sort: function(module) {
        if(this._isVisited(module.name)) {
            return;
        }

        (module.require || []).forEach(function(requireName) {
            var requireModule = this._modules.get(requireName);
            requireModule
                ? this._sort(requireModule)
                : this._emitUnexist(requireName, module.name);
        }, this);

        if(!this._sorted.exists(module)) {
            this._sorted.push(module);
        }

        this._branch.pop();
    },

    /**
     * Рекурсивно получить имена отфильтрованных модулей по зависимостям.
     *
     * @private
     * @param {string} name Имя заданного модуля
     * @param {string[]} filteredNames Имена отфильтрованных модулей
     * @param {string|null} parentName Имя зависимого модуля или null, если он отсутствует
     * @fires Depend#loop
     * @fires Depend#unexist
     * @returns {string[]}
     */
    _filter: function(name, filteredNames, parentName) {
        if(this._isVisited(name)) {
            return filteredNames;
        }

        var requireModule = this._modules.get(name);
        if(!requireModule) {
            this._emitUnexist(name, parentName);
            return filteredNames;
        }

        filteredNames.push(requireModule.name);
        (requireModule.require || []).forEach(function(requireName) {
            this._filter(requireName, filteredNames, name);
        }, this);

        this._branch.pop();

        return filteredNames;
    },

    /**
     * Проверить факт посещения модуля с указанным именем из рекурсивных методов.
     *
     * @private
     * @param {string} name Имя модуля
     * @fires Depend#loop
     * @returns {boolean}
     */
    _isVisited: function(name) {
        this._branch.push(name);

        if(~this._visited.indexOf(name)) {
            if(this._branch.length > 1 && this._branch[0] === name) {

                /**
                 * Событие обнаружения циклической зависимости.
                 * Передаёт список имён модулей в порядке зависимостей.
                 *
                 * @event Depend#loop
                 * @type {string[]}
                 */
                this._emitter.emit('loop', this._branch);
            }

            this._branch.pop();
            return true;
        }

        this._visited.push(name);
        return false;
    },

    /**
     * Инициировать событие обнаружения несуществующего модуля.
     *
     * Отдельный метод необходим для предотвращения повторной инициации
     * события по одному и тому же модулю при совместном использовании методов `filter` и `sort`.
     *
     * @private
     * @param {string} require Имя несуществующего модуля
     * @param {string|null} name Имя зависимого модуля или null, если он отсутствует
     * @fires Depend#unexist
     */
    _emitUnexist: function(require, name) {
        if(~this._unexistList.indexOf(require)) return;
        this._unexistList.push(require);

        /**
         * Событие обнаружения несуществующего модуля.
         *
         * @event Depend#unexist
         * @type {{}}
         * @property {string|null} name Имя зависимого модуля или null, если он отсутствует
         * @property {string} require Имя несуществующего модуля
         */
        this._emitter.emit('unexist', {
            name: name,
            require: require
        });
    }

};

/**
 * Получить имена модулей из JSDoc.
 *
 * @param {string} jsdoc JSDoc
 * @param {string} [tag=bemaker] Имя обрабатываемого JSDoc-тега
 * @returns {string[]}
 */
Depend.parseJSDoc = function(jsdoc, tag) {
    tag = tag || 'bemaker';
    return jsdocParser(jsdoc).reduce(function(modules, jsdocBlock) {
        return jsdocBlock.tags.reduce(function(modules, line) {
            if(line.tag === tag) {
                modules.push(line.name);
            }
            return modules;
        }, modules);
    }, []);
};

module.exports = Depend;
