const assert = require('chai').assert,
    Pool = require('../modules/Pool');

describe('Модуль Pool.', function() {

    describe('Метод get.', function() {

        it('Получить модули заданные в конструкторе', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' }
            ]).get(), [
                { name: 'a' },
                { name: 'b' }
            ]);
        });

        it('Получить заданный модуль', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).get('b'), { name: 'b' });
        });

    });

    describe('Метод set.', function() {

        it('Задать список модулей', function() {
            assert.deepEqual(new Pool([{ name: 'a' }]).set([
                { name: 'b' },
                { name: 'c' }
            ]).get(), [
                { name: 'b' },
                { name: 'c' }
            ]);
        });

    });

    describe('Метод push.', function() {

        it('Добавить один модуль в конец', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' }
            ]).push({ name: 'c' }).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]);
        });

        it('Добавить несколько модулей в конец', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' }
            ]).push([
                    { name: 'c' },
                    { name: 'd' }
                ]).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод unshift.', function() {

        it('Добавить один модуль в начало', function() {
            assert.deepEqual(new Pool([
                { name: 'b' },
                { name: 'c' }
            ]).unshift({ name: 'a' }).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]);
        });

        it('Добавить несколько модулей в начало', function() {
            assert.deepEqual(new Pool([
                { name: 'c' },
                { name: 'd' }
            ]).unshift([
                    { name: 'a' },
                    { name: 'b' }
                ]).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод before.', function() {

        it('Добавить один модуль перед заданным модулем', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'c' },
                { name: 'd' }
            ]).before({ name: 'b' }, 'c').get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

        it('Добавить несколько модулей перед заданным модулем', function() {
            assert.deepEqual(new Pool([
                { name: 'c' },
                { name: 'd' }
            ]).before([{ name: 'a' }, { name: 'b' }], 'c').get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод after.', function() {

        it('Добавить один модуль после заданного модуля', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'c' },
                { name: 'd' }
            ]).after({ name: 'b' }, 'a').get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

        it('Добавить несколько модулей после заданного модуля', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' }
            ]).after([{ name: 'c' }, { name: 'd' }], 'b').get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод add.', function() {

        it('Добавить один модуль на заданный индекс', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'c' },
                { name: 'd' }
            ]).add({ name: 'b' }, 1).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

        it('Добавить несколько модулей на заданный индекс', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' }
            ]).add([{ name: 'c' }, { name: 'd' }], 2).get(), [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод move.', function() {

        it('Переместить несколько модулей', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]).move('a', 3).move('d', 1).get(), [
                { name: 'b' },
                { name: 'd' },
                { name: 'c' },
                { name: 'a' }
            ]);
        });

    });

    describe('Метод indexOf.', function() {

        it('Получить индекс модуля', function() {
            assert.equal(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).indexOf('b'), 1);
        });

        it('Получить индекс модуля из указанного списка модулей', function() {
            assert.equal(new Pool().indexOf('c', [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]), 2);
        });

    });

    describe('Проверка на дублирование модулей.', function() {

        it('Получить ошибку о дублировании модулей', function() {
            assert.throws(function() {
                new Pool([
                    { name: 'a' },
                    { name: 'b' },
                    { name: 'b' }
                ]);
            }, Error, 'A duplicate module b');
        });

        it('Получить ошибку о дублировании модулей при использовании метода set', function() {
            assert.throws(function() {
                new Pool().set([
                    { name: 'a' },
                    { name: 'b' },
                    { name: 'a' }
                ]);
            }, Error, 'A duplicate module a');
        });

        it('Получить ошибку о дублировании модулей при использовании метода push', function() {
            assert.throws(function() {
                new Pool([{ name: 'a' }]).push({ name: 'a' });
            }, Error, 'A duplicate module a');

            assert.throws(function() {
                new Pool().push([
                    { name: 'a' },
                    { name: 'b' },
                    { name: 'b' }
                ]);
            }, Error, 'A duplicate module b');
        });

        it('Получить ошибку о дублировании модулей при использовании метода add', function() {
            assert.throws(function() {
                new Pool([{ name: 'a' }]).add([
                    { name: 'b' },
                    { name: 'a' }
                ], 1);
            }, Error, 'A duplicate module a');
        });

    });

});
