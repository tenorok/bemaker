/**
 * Модуль.
 *
 * @typedef {{}} Pool~Module
 * @property {string} name Имя модуля
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
     * @private
     * @type {Pool~Module[]}
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
     * Заменить модуль с заданным именем на другой модуль или несколько модулей.
     *
     * @param {string} name Имя заменяемого модуля
     * @param {Pool~Module|Pool~Module[]} modules Заменяющие модули
     * @returns {Pool}
     */
    replace: function(name, modules) {
        var index = this.indexOf(name);
        return this.delete(index).add(modules, index);
    },

    /**
     * Поменять модули местами.
     *
     * @param {string|number} first Имя или индекс первого модуля
     * @param {string|number} second Имя или индекс второго модуля
     * @returns {Pool}
     */
    swap: function(first, second) {
        var firstIndex,
            firstName,
            secondIndex,
            secondName;

        if(typeof first === 'string') {
            firstIndex = this.indexOf(first);
            firstName = first;
        } else {
            firstIndex = first;
            firstName = this.nameOf(first);
        }

        if(typeof second === 'string') {
            secondIndex = this.indexOf(second);
            secondName = second;
        } else {
            secondIndex = second;
            secondName = this.nameOf(second);
        }

        return this.move(firstName, secondIndex).move(secondName, firstIndex);
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
     * При вызове с заданными именем возвращает один искомый модуль
     * или null, если модуль не найден.
     *
     * @param {string} [name] Имя модуля
     * @returns {Pool~Module[]|Pool~Module|null}
     */
    get: function(name) {
        if(!name) return this._modules;

        for(var i = 0; i < this._modules.length; i++) {
            if(this._modules[i].name === name) {
                return this._modules[i];
            }
        }

        return null;
    },

    /**
     * Удалить модуль или несколько модулей по их именам или индексам.
     *
     * @param {string|number|*[]} desire Имя модуля, индекс модули, массив имён и индексов
     * @returns {Pool}
     */
    delete: function(desire) {
        if(Array.isArray(desire)) {
            desire
                .map(function(nameOrIndex) {
                    return typeof nameOrIndex === 'number' ? this.nameOf(nameOrIndex) : nameOrIndex;
                }, this)
                .forEach(function(name) {
                    this.delete(name);
                }, this);
            return this;
        }

        this._modules.splice(typeof desire === 'string' ? this.indexOf(desire) : desire, 1);
        return this;
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
     * Получить имя модуля по его индексу.
     *
     * @param {string} index Индекс модуля
     * @param {Pool~Module[]} [modules] Модули среди которых осуществлять поиск
     * @returns {string} Имя модуля или пустая строка, если модуль не найден
     */
    nameOf: function(index, modules) {
        modules = modules || this._modules;
        return (modules[index] || {}).name || '';
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
                throw new Error('Duplicate module ' + name);
            }
        });
        return modules;
    }

};

module.exports = Pool;
