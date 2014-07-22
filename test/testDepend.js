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

    describe('Фильтрация модулей для заданного модуля', function() {

        it('Фильтрация одного модуля', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['d'] },
                { name: 'b' },
                { name: 'c' },
                { name: 'd', require: ['b'] },
                { name: 'e' }
            ]).filter('a'), [
                { name: 'a', require: ['d'] },
                { name: 'b' },
                { name: 'd', require: ['b'] }
            ]);
        });

        it('Фильтрация одного модуля с множественными зависимостями', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b', 'c'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).filter('a'), [
                { name: 'a', require: ['b', 'c'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Получение зависимостей из jsdoc файла.', function() {

        it('Получить имена модулей из простого JSDoc', function() {
            assert.deepEqual(Depend.parseJSDoc(
                '/**\n' +
                ' * @bemaker aaa\n' +
                ' * @bemaker bbb\n' +
                ' */'
            ), ['aaa', 'bbb']);
        });

        it('Получить имена модулей из JSDoc среди стороннего содержимого', function() {
            assert.deepEqual(Depend.parseJSDoc(
                'Bla-bla-bla\n' +
                '/**\n' +
                ' * @bemaker aaa\n' +
                ' * @bemaker bbb\n' +
                ' */\n' +
                'Bla-bla-bla'
            ), ['aaa', 'bbb']);
        });

        it('Получить имена модулей из смешанного JSDoc', function() {
            assert.deepEqual(Depend.parseJSDoc(
                '/**\n' +
                ' * @param ccc\n' +
                ' * @bemaker aaa\n' +
                ' * @type {string} ddd\n' +
                ' * @bemaker bbb\n' +
                ' */'
            ), ['aaa', 'bbb']);
        });

        it('Получить имена модулей из нескольких блоков JSDoc', function() {
            assert.deepEqual(Depend.parseJSDoc(
                '/**\n' +
                ' * @bemaker aaa\n' +
                ' * @bemaker bbb\n' +
                ' */\n' +
                'Bla-bla-bla\n' +
                '/**\n' +
                ' * @bemaker ccc\n' +
                ' * @param ccc\n' +
                ' */'
            ), ['aaa', 'bbb', 'ccc']);
        });

        it('Получить имена модулей по изменённому тегу', function() {
            assert.deepEqual(Depend.parseJSDoc(
                '/**\n' +
                ' * @param ccc\n' +
                ' * @depend aaa\n' +
                ' * @type {string} ddd\n' +
                ' * @depend bbb\n' +
                ' */',
                'depend'
            ), ['aaa', 'bbb']);
        });

    });

});
