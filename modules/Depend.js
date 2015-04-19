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
}

Depend.prototype = {

    /**
     * Отсортировать модули по зависимостям.
     *
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

        /**
         * Хранилище посещённых во время сортировки модулей.
         *
         * @private
         * @type {Pool}
         */
        this._visited = new Pool();

        /**
         * Список модулей всевозможных ветвей зависимостей.
         * Для отслеживания и фиксации рекурсивных зависимостей.
         *
         * @private
         * @type {string[]}
         */
        this._branch = [];

        this._modules.get().forEach(this._sort, this);

        return this._sorted.get();
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
     * Отфильтровать модули для заданного модуля
     * или нескольких модулей по зависимостям.
     *
     * @param {string|string[]} name Имя заданного модуля или нескольких модулей
     * @returns {Depend~Module[]}
     */
    filter: function(name) {
        return this._modules.filter(
            typeof name === 'string'
                ? this._filter(name, [])
                : name.reduce(function(filteredNames, name) {
                    return filteredNames.concat(this._filter(name, []));
                }.bind(this), [])
        ).get();
    },

    /**
     * Рекурсивно отсортировать модули по зависимостям для заданного модуля.
     *
     * @private
     * @param {Depend~Module} module Заданный модуль
     * @fires Depend#circle
     */
    _sort: function(module) {
        this._branch.push(module.name);

        if(this._visited.exists(module)) {
            if(this._branch.length > 1 && this._branch[0] === module.name) {

                /**
                 * Событие обнаружения циклической зависимости.
                 * Передаёт список имён модулей в порядке зависимостей.
                 *
                 * @event Depend#circle
                 * @type {string[]}
                 */
                this._emitter.emit('circle', this._branch);
            }

            this._branch.pop();
            return;
        }

        this._visited.push(module);

        (module.require || []).forEach(function(requireName) {
            var requireModule = this._modules.get(requireName);
            if(requireModule) {
                this._sort(requireModule);
            }
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
     * @returns {string[]}
     */
    _filter: function(name, filteredNames) {
        var requireModule = this._modules.get(name);
        if(!requireModule) return filteredNames;

        filteredNames.push(requireModule.name);
        (requireModule.require || []).forEach(function(requireName) {
            this._filter(requireName, filteredNames);
        }, this);
        return filteredNames;
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
