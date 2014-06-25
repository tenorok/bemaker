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
     * Установить/получить модули.
     *
     * @param {Depend~Module[]} [modules] Модули
     * @returns {Depend|Depend~Module[]}
     */
    modules: function(modules) {
        if(modules) {
            this._modules = modules;
            return this;
        }

        return this._modules;
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
    }

};

module.exports = Depend;
