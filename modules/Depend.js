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
    this._modules = this._checkDuplicates(modules || []);
}

Depend.prototype = {

    /**
     * Установить модули.
     *
     * @param {Depend~Module[]} modules Модули
     * @returns {Depend}
     */
    set: function(modules) {
        this._modules = this._checkDuplicates(modules);
        return this;
    },

    /**
     * Добавить модули к объединению.
     *
     * @param {Depend~Module[]} modules Модули
     * @returns {Depend}
     */
    add: function(modules) {
        this.set(this._modules.concat(modules));
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
        if(!name) return this._modules;

        return this._modules.filter(function(module) {
            return module.name === name;
        })[0];
    },

    /**
     * Получить индекс первого найденного модуля по его имени.
     *
     * @param {string} name Имя модуля
     * @param {Depend~Module[]} [modules] Модули среди которых осуществлять поиск
     * @returns {number} Индекс модуля или `-1`, если модуль не найден
     */
    indexOf: function(name, modules) {
        modules = modules || this._modules;

        for(var index = 0; index < modules.length; index++) {
            if(modules[index].name === name) {
                return index;
            }
        }

        return -1;
    },

    /**
     * Проверить модули на дубликаты.
     *
     * @private
     * @param {Depend~Module[]} [modules] Модули
     * @throws {Error} Обнаружен дубликат модуля
     * @returns {Depend~Module[]}
     */
    _checkDuplicates: function(modules) {
        modules.forEach(function(module) {
            var name = module.name;
            if(modules.filter(function(module) {
                return module.name === name;
            }).length > 1) {
                throw new Error('A duplicate module ' + name);
            }
        });
        return modules;
    }

};

module.exports = Depend;
