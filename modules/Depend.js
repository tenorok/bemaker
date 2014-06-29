const Pool = require('./Pool');

/**
 * Модуль.
 *
 * @typedef {{}} Depend~Module
 * @property {string} name Имя модуля
 * @property {string[]} require Список имён требуемых модулей
 */

/**
 * Модуль для сортировки модулей по зависимостям.
 *
 * @constructor
 * @param {Depend~Module[]|Pool} modules Модули
 */
function Depend(modules) {

    /**
     * Модули без дубликатов.
     *
     * @private
     * @type {Depend~Module[]}
     */
    this._modules = modules instanceof Pool ? modules.get() : new Pool(modules).get();

    /**
     * Хранилище отсортированных модулей.
     *
     * @private
     * @type {Pool}
     */
    this._pool = new Pool();
}

Depend.prototype = {

    sort: function() {

        this._modules.forEach(function(module) {
            // sorting
        }, this);

        return this._pool.get();
    }

};

module.exports = Depend;
