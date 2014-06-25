/**
 * Модуль.
 *
 * @typedef {{}} Pool~Module
 * @property {name} Имя модуля
 */

/**
 * Модуль для хранения модулей.
 *
 * @constructor
 * @param {Pool~Module[]} [modules] Модули
 */
function Pool(modules) {

    /**
     * Модули.
     *
     * @type {Pool~Module[]}
     * @private
     */
    this._modules = this._checkDuplicates(modules || []);
}

Pool.prototype = {

    /**
     * Установить модули.
     *
     * @param {Pool~Module[]} modules Модули
     * @returns {Pool}
     */
    set: function(modules) {
        this._modules = this._checkDuplicates(modules);
        return this;
    },

    /**
     * Добавить модуль или несколько модулей в конец списка.
     *
     * @param {Pool~Module|Pool~Module[]} modules Модули
     * @returns {Pool}
     */
    push: function(modules) {
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
     * @returns {Pool~Module|Pool~Module[]}
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
     * @param {Pool~Module[]} [modules] Модули среди которых осуществлять поиск
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
     * @param {Pool~Module[]} [modules] Модули
     * @throws {Error} Обнаружен дубликат модуля
     * @returns {Pool~Module[]}
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

module.exports = Pool;
