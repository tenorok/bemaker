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
 * @param {Pool} [pool] Модули
 */
function Depend(pool) {

    /**
     * Модули.
     *
     * @private
     * @type {Pool}
     */
    this._pool = pool;
}

Depend.prototype = {

    sort: function() {}

};

module.exports = Depend;
