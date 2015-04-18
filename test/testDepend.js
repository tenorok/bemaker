const assert = require('chai').assert,
    sinon = require('sinon'),
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
            var depend = new Depend([
                    { name: 'a', require: ['b'] },
                    { name: 'b', require: ['a'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs(['a', 'b', 'a']);

            depend.on('circle', callback);

            assert.deepEqual(depend.sort(), [
                { name: 'b', require: ['a'] },
                { name: 'a', require: ['b'] }
            ]);

            assert.equal(callback.callCount, 1, 'инициируется событие круговой зависимости');
            assert.isTrue(callback1.calledOnce);
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
            var depend = new Depend([
                    { name: 'a', require: ['f', 'e'] },
                    { name: 'b', require: ['a', 'c'] },
                    { name: 'c', require: ['f'] },
                    { name: 'd', require: ['a', 'b'] },
                    { name: 'e', require: ['d', 'f', 'a'] },
                    { name: 'f', require: ['a'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs(['a', 'f', 'a']),
                callback2 = callback.withArgs(['a', 'e', 'd', 'a']),
                callback3 = callback.withArgs(['a', 'e', 'd', 'b', 'a']),
                callback4 = callback.withArgs(['a', 'e', 'a']);

            depend.on('circle', callback);

            assert.deepEqual(depend.sort(), [
                { name: 'f', require: ['a'] },
                { name: 'c', require: ['f'] },
                { name: 'b', require: ['a', 'c'] },
                { name: 'd', require: ['a', 'b'] },
                { name: 'e', require: ['d', 'f', 'a'] },
                { name: 'a', require: ['f', 'e'] }
            ]);

            assert.equal(callback.callCount, 4, 'инициируются события круговой зависимости');
            assert.isTrue(callback1.calledOnce, 'первый круг');
            assert.isTrue(callback2.calledOnce, 'второй круг');
            assert.isTrue(callback3.calledOnce, 'третий круг');
            assert.isTrue(callback4.calledOnce, 'четвёртый круг');
        });

        it('Зависимость от несуществующих модулей', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b', 'c'] }
            ]).sort(), [
                { name: 'a', require: ['b', 'c'] }
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

        it('Фильтрация нескольких модулей', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['d'] },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e', require: ['c'] }
            ]).filter(['a', 'e']), [
                { name: 'a', require: ['d'] },
                { name: 'c' },
                { name: 'd' },
                { name: 'e', require: ['c'] }
            ]);
        });

        it('Фильтрация нескольких модулей с множественными зависимостями', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b', 'c'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'c' },
                { name: 'd', require: ['g'] },
                { name: 'e' },
                { name: 'f' },
                { name: 'g' }
            ]).filter(['a', 'b']), [
                { name: 'a', require: ['b', 'c'] },
                { name: 'b', require: ['c', 'd'] },
                { name: 'c' },
                { name: 'd', require: ['g'] },
                { name: 'g' }
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
