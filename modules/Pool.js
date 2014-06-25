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
     * Добавить модуль или несколько модулей в начало списка.
     *
     * @param {Pool~Module|Pool~Module[]} modules Модули
     * @returns {Pool}
     */
    unshift: function(modules) {
        this.set((Array.isArray(modules) ? modules : [modules]).concat(this._modules));
        return this;
    },

    /**
     * Добавить модуль или несколько модулей перед модулем с заданными именем.
     *
     * @param {Pool~Module|Pool~Module[]} modules Модули
     * @param {string} name Имя модуля
     * @returns {Pool}
     */
    before: function(modules, name) {
        this.add(modules, this.indexOf(name));
        return this;
    },

    /**
     * Добавить модуль или несколько модулей после модуля с заданными именем.
     *
     * @param {Pool~Module|Pool~Module[]} modules Модули
     * @param {string} name Имя модуля
     * @returns {Pool}
     */
    after: function(modules, name) {
        this.add(modules, this.indexOf(name) + 1);
        return this;
    },

    /**
     * Добавить модуль или несколько модулей на заданный индекс.
     *
     * @param {Pool~Module|Pool~Module[]} modules Модули
     * @param {number} index Индекс
     * @returns {Pool}
     */
    add: function(modules, index) {
        Array.isArray(modules)
            ? this._modules.splice.apply(this._modules, [index, 0].concat(modules))
            : this._modules.splice(index, 0, modules);
        this._checkDuplicates();
        return this;
    },

    /**
     * Переместить модуль с заданными именем на указанную позицию.
     *
     * @param {string} name Имя модуля
     * @param {number} index Позиция
     * @returns {Pool}
     */
    move: function(name, index) {
        this._modules.splice(index, 0, this._modules.splice(this.indexOf(name), 1)[0]);
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
     * Получить количество модулей.
     *
     * @returns {number}
     */
    size: function() {
        return this._modules.length;
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
     * Проверить существование модуля с заданным именем.
     *
     * @param {string|Pool~Module|Pool~Module[]} desire Имя модуля, модуль или список модулей
     * @param {Pool~Module[]} [modules] Модули среди которых осуществлять поиск
     * @returns {boolean}
     */
    exists: function(desire, modules) {
        if(typeof desire === 'string') {
            return !!~this.indexOf(desire, modules);
        }

        if(Array.isArray(desire)) {
            return desire.every(function(module) {
                return this.exists(module.name, modules);
            }, this);
        }

        return !!~this.indexOf(desire.name, modules);
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
        modules = modules || this._modules;
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
