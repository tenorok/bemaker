/**
 * Модуль.
 *
 * @typedef {{}} Depend~Module
 * @property {name} Имя модуля
 */

/**
 * Модуль для работы с зависимостями модулей.
 *
 * @constructor
 * @param {Depend~Module[]} [modules] Модули
 */
function Depend(modules) {

    /**
     * Модули.
     *
     * @type {Depend~Module[]}
     * @private
     */
    this._modules = modules || [];
}

Depend.prototype = {

    /**
     * Установить модули.
     *
     * @param {Depend~Module[]} modules Модули
     * @returns {Depend}
     */
    set: function(modules) {
        this._modules = modules;
        return this;
    },

    /**
     * Добавить модули к объединению.
     *
     * @param {Depend~Module[]} modules Модули
     * @returns {Depend}
     */
    add: function(modules) {
        this._modules = this._modules.concat(modules);
        return this;
    },

    /**
     * Получить модули.
     *
     * При вызове без аргумента возвращает все имеющиеся модули.
     * При вызове с заданными именем возвращает один искомый модуль.
     *
     * @param {string} [name] Имя модуля
     * @returns {Depend~Module|Depend~Module[]}
     */
    get: function(name) {
        return this._modules;
    }

};

module.exports = Depend;
