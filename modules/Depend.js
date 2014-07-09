const doctrine = require('doctrine'),
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
    }

};

/**
 * Получить имена модулей из JSDoc.
 *
 * @param {string} jsdoc JSDoc
 * @returns {string[]}
 */
Depend.jsdocParse = function(jsdoc) {
    return doctrine.parse(jsdoc, { unwrap: true }).tags.reduce(function(modules, depend) {
        modules.push(depend.description);
        return modules;
    }, []);
};

module.exports = Depend;
