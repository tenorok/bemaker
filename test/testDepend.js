const assert = require('chai').assert,
    Pool = require('../modules/Pool'),
    Depend = require('../modules/Depend');

describe('Модуль Depend.', function() {

    describe('Сортировка по полю require.', function() {

        it('Один модуль зависит от другого', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b'] },
                { name: 'b' }
            ]).sort(), [
                { name: 'b' },
                { name: 'a', require: ['b'] }
            ]);
        });

        it('Передача экземпляра Pool', function() {
            assert.deepEqual(new Depend(new Pool([
                { name: 'a', require: ['b'] },
                { name: 'b' }
            ])).sort(), [
                { name: 'b' },
                { name: 'a', require: ['b'] }
            ]);
        });

        it('Циклическая зависимость двух модулей', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b'] },
                { name: 'b', require: ['a'] }
            ]).sort(), [
                { name: 'a', require: ['b'] },
                { name: 'b', require: ['a'] }
            ]);
        });

        it('Четыре модуля с множественными зависимостями', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'c' },
                { name: 'd', require: ['c'] }
            ]).sort(), [
                { name: 'c' },
                { name: 'd', require: ['c'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'a', require: ['b'] }
            ]);
        });

        it('Шесть модулей с множественными зависимостями', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['f', 'e'] },
                { name: 'b', require: ['a', 'c'] },
                { name: 'c', require: ['f'] },
                { name: 'd', require: ['a', 'b'] },
                { name: 'e', require: ['d', 'f', 'a'] },
                { name: 'f', require: ['a'] }
            ]).sort(), [
                { name: 'a', require: ['f', 'e'] },
                { name: 'f', require: ['a'] },
                { name: 'd', require: ['a', 'b'] },
                { name: 'e', require: ['d', 'f', 'a'] },
                { name: 'c', require: ['f'] },
                { name: 'b', require: ['a', 'c'] }
            ]);
        });

    });

});
