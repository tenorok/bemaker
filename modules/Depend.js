const jsdocParser = require('comment-parser'),
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
 * @constructor
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
     * Хранилище отсортированных модулей.
     *
     * @private
     * @type {Pool}
     */
    this._sorted = new Pool();
}

Depend.prototype = {

    /**
     * Отсортировать модули по зависимостям.
     *
     * @returns {Depend~Module[]}
     */
    sort: function() {
        var modules = this._modules,
            sorted = this._sorted;

        modules.get().forEach(function(module) {
            var require = module.require || [];

            if(!sorted.exists(module)) {
                require.forEach(function(requireName) {
                    if(!sorted.exists(requireName)) {
                        sorted.push(modules.get(requireName));
                    }
                }, this);

                sorted.push(module);
            } else {
                require.forEach(function(requireName) {
                    if(!sorted.exists(requireName)) {
                        return sorted.unshift(modules.get(requireName));
                    }

                    var moduleIndex = sorted.indexOf(module.name);
                    if(sorted.indexOf(requireName) > moduleIndex) {
                        sorted.move(requireName, moduleIndex);
                    }
                }, this);
            }

        }, this);

        return sorted.get();
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
     * Рекурсивно получить имена отфильтрованных модулей по зависимостям.
     *
     * @private
     * @param {string} name Имя заданного модуля
     * @param {string[]} filteredNames Имена отфильтрованных модулей
     * @returns {string[]}
     */
    _filter: function(name, filteredNames) {
        filteredNames.push(this._modules.get(name).name);
        (this._modules.get(name).require || []).forEach(function(requireName) {
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
