const assert = require('chai').assert,
    sinon = require('sinon'),
    Pool = require('../modules/Pool'),
    Depend = require('../modules/Depend');

describe('Модуль Depend.', function() {

    describe('Метод sort.', function() {

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

            depend.on('loop', callback);

            assert.deepEqual(depend.sort(), [
                { name: 'b', require: ['a'] },
                { name: 'a', require: ['b'] }
            ]);

            assert.equal(callback.callCount, 1, 'инициируется событие циклической зависимости');
            assert.isTrue(callback1.calledOnce);
        });

        it('Циклические зависимости от разных модулей', function() {
            var depend = new Depend([
                    { name: 'a', require: ['e'] },
                    { name: 'b', require: ['c'] },
                    { name: 'c', require: ['d'] },
                    { name: 'd', require: ['b'] },
                    { name: 'e', require: ['f'] },
                    { name: 'f', require: ['a'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs(['a', 'e', 'f', 'a']),
                callback2 = callback.withArgs(['b', 'c', 'd', 'b']);

            depend.on('loop', callback);

            assert.deepEqual(depend.sort(), [
                { name: 'f', require: ['a'] },
                { name: 'e', require: ['f'] },
                { name: 'a', require: ['e'] },
                { name: 'd', require: ['b'] },
                { name: 'c', require: ['d'] },
                { name: 'b', require: ['c'] }
            ]);

            assert.equal(callback.callCount, 2, 'два раза инициируется событие циклической зависимости');
            assert.isTrue(callback1.calledOnce, 'цикл 1');
            assert.isTrue(callback2.calledOnce, 'цикл 2');
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

        it('Циклические зависимости шести модулей', function() {
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

            depend.on('loop', callback);

            assert.deepEqual(depend.sort(), [
                { name: 'f', require: ['a'] },
                { name: 'c', require: ['f'] },
                { name: 'b', require: ['a', 'c'] },
                { name: 'd', require: ['a', 'b'] },
                { name: 'e', require: ['d', 'f', 'a'] },
                { name: 'a', require: ['f', 'e'] }
            ]);

            assert.equal(callback.callCount, 4, 'инициируются события циклической зависимости');
            assert.isTrue(callback1.calledOnce, 'цикл 1');
            assert.isTrue(callback2.calledOnce, 'цикл 2');
            assert.isTrue(callback3.calledOnce, 'цикл 3');
            assert.isTrue(callback4.calledOnce, 'цикл 4');
        });

        it('Зависимость от несуществующих модулей', function() {
            assert.deepEqual(new Depend([
                { name: 'a', require: ['b', 'c'] }
            ]).sort(), [
                { name: 'a', require: ['b', 'c'] }
            ]);
        });

        it('Практический приукрашенный пример', function() {
            assert.deepEqual(new Depend([
                { name: 'body', require: ['i-block'] },
                { name: 'document', require: ['order', 'input'] },
                { name: 'i-block' },
                { name: 'i-component', require: ['i-block'] },
                { name: 'i-control', require: ['i-component'] },
                { name: 'background', require: ['i-block', 'input'] },
                { name: 'input', require: ['i-control'] },
                { name: 'modal', require: ['background', 'i-block'] },
                { name: 'order', require: ['modal', 'i-block'] }
            ]).sort(), [
                { name: 'i-block' },
                { name: 'body', require: ['i-block'] },
                { name: 'i-component', require: ['i-block'] },
                { name: 'i-control', require: ['i-component'] },
                { name: 'input', require: ['i-control'] },
                { name: 'background', require: ['i-block', 'input'] },
                { name: 'modal', require: ['background', 'i-block'] },
                { name: 'order', require: ['modal', 'i-block'] },
                { name: 'document', require: ['order', 'input'] }
            ]);
        });

        it('Указание зависимости от несуществующего модуля', function() {
            var depend = new Depend([
                    { name: 'a', require: ['unexist'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs({
                    name: 'a',
                    require: 'unexist'
                });

            depend.on('unexist', callback);
            depend.sort();
            assert.isTrue(callback1.calledOnce, 'инициируется событие зависимости от несуществующего модуля');
        });

    });

    describe('Метод filter.', function() {

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

        it('Циклическая зависимость двух модулей', function() {
            var depend = new Depend([
                    { name: 'a', require: ['b'] },
                    { name: 'b', require: ['a'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs(['a', 'b', 'a']);

            depend.on('loop', callback);

            assert.deepEqual(depend.filter(['a', 'b']), [
                { name: 'a', require: ['b'] },
                { name: 'b', require: ['a'] }
            ]);

            assert.equal(callback.callCount, 1, 'инициируется событие циклической зависимости');
            assert.isTrue(callback1.calledOnce);
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

        it('Фильтрация несуществующего модуля и с указанием зависимости от несуществующего модуля', function() {
            var depend1 = new Depend([{ name: 'b' }]),
                depend2 = new Depend([{ name: 'b', require: ['unexist'] }]),
                callback = sinon.stub(),
                callback1 = callback.withArgs({
                    name: null,
                    require: 'unexist'
                }),
                callback2 = callback.withArgs({
                    name: 'b',
                    require: 'unexist'
                });

            depend1.on('unexist', callback);
            depend2.on('unexist', callback);

            depend1.filter('unexist');
            depend2.filter('b');

            assert.isTrue(callback1.calledOnce, 'инициируется событие попытки фильтрации несуществующего модуля');
            assert.isTrue(callback2.calledOnce, 'инициируется событие зависимости от несуществующего модуля');
        });

        it('Фильтрация и сортировка с указанием несуществующего модуля', function() {
            var depend = new Depend([
                    { name: 'a', require: ['unexist'] }
                ]),
                callback = sinon.stub(),
                callback1 = callback.withArgs({
                    name: 'a',
                    require: 'unexist'
                });

            depend.on('unexist', callback);
            depend.filter('a');
            depend.sort();
            assert.isTrue(callback1.calledOnce, 'событие не должно повторяться для одного и того же модуля');
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
