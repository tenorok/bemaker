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

        it('Получить несуществующий модуль', function() {
            assert.isNull(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).get('d'));
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

    describe('Метод delete.', function() {

        it('Удалить один модуль по имени', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).delete('b').get(), [
                { name: 'a' },
                { name: 'c' }
            ]);
        });

        it('Удалить один модуль по индексу', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).delete(0).get(), [
                { name: 'b' },
                { name: 'c' }
            ]);
        });

        it('Удалить несколько модулей по именам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]).delete(['b', 'c']).get(), [
                { name: 'a' },
                { name: 'd' }
            ]);
        });

        it('Удалить несколько модулей по индексам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' }
            ]).delete([1, 2]).get(), [
                { name: 'a' },
                { name: 'd' }
            ]);
        });

        it('Удалить несколько модулей по именам и индексам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).delete(['b', 2, 'e']).get(), [
                { name: 'a' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод filter.', function() {

        it('Отфильтровать модули по именам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).filter(['a', 'c', 'd']).get(), [
                { name: 'a' },
                { name: 'c' },
                { name: 'd' }
            ]);
        });

        it('Отфильтровать модули по индексам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).filter([1, 3, 4]).get(), [
                { name: 'b' },
                { name: 'd' },
                { name: 'e' }
            ]);
        });

        it('Отфильтровать модули по именам и индексам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).filter(['a', 2, 'e']).get(), [
                { name: 'a' },
                { name: 'c' },
                { name: 'e' }
            ]);
        });

        it('Отфильтровать модули по результату колбека', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' },
                { name: 'd' },
                { name: 'e' }
            ]).filter(function(module, index) {
                    return module.name === 'b' || index === 3;
                }).get(), [
                { name: 'b' },
                { name: 'd' }
            ]);
        });

    });

    describe('Метод size.', function() {

        it('Получить количество модулей', function() {
            assert.equal(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).size(), 3);
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

    describe('Метод replace.', function() {

        it('Заменить один модуль на другой', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).replace('b', { name: 'd' }).get(), [
                { name: 'a' },
                { name: 'd' },
                { name: 'c' }
            ]);
        });

        it('Заменить один модуль на несколько других', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).replace('b', [{ name: 'd' }, { name: 'e' }]).get(), [
                { name: 'a' },
                { name: 'd' },
                { name: 'e' },
                { name: 'c' }
            ]);
        });

    });

    describe('Метод swap.', function() {

        it('Поменять местами модули по имени', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).swap('a', 'c').get(), [
                { name: 'c' },
                { name: 'b' },
                { name: 'a' }
            ]);
        });

        it('Поменять местами модули по индексам', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).swap(1, 2).get(), [
                { name: 'a' },
                { name: 'c' },
                { name: 'b' }
            ]);
        });

        it('Поменять местами модули по имени и индексу', function() {
            assert.deepEqual(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).swap('a', 2).get(), [
                { name: 'c' },
                { name: 'b' },
                { name: 'a' }
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

        it('Получить индекс несуществующего модуля', function() {
            assert.equal(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).indexOf('d'), -1);
        });

        it('Получить индекс модуля из указанного списка модулей', function() {
            assert.equal(new Pool().indexOf('c', [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]), 2);
        });

    });

    describe('Метод nameOf.', function() {

        it('Получить имя модуля', function() {
            assert.equal(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).nameOf(1), 'b');
        });

        it('Получить имя несуществующего модуля', function() {
            assert.equal(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).nameOf(3), '');
        });

        it('Получить индекс модуля из указанного списка модулей', function() {
            assert.equal(new Pool().nameOf(2, [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]), 'c');
        });

    });

    describe('Метод exists.', function() {

        it('Проверить существование модуля с заданным именем', function() {
            assert.isTrue(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists('b'));

            assert.isFalse(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists('d'));
        });

        it('Проверить существование модуля с заданным именем из указанного списка модулей', function() {
            assert.isTrue(new Pool().exists('b', [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]));
        });

        it('Проверить существование модуля', function() {
            assert.isTrue(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists({ name: 'c' }));

            assert.isFalse(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists({ name: 'd' }));
        });

        it('Проверить существование списка модулей', function() {
            assert.isTrue(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists([{ name: 'c' }, { name: 'b' }]));

            assert.isFalse(new Pool([
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]).exists([{ name: 'c' }, { name: 'd' }]));
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
            }, Error, 'Duplicate module b');
        });

        it('Получить ошибку о дублировании модулей при использовании метода set', function() {
            assert.throws(function() {
                new Pool().set([
                    { name: 'a' },
                    { name: 'b' },
                    { name: 'a' }
                ]);
            }, Error, 'Duplicate module a');
        });

        it('Получить ошибку о дублировании модулей при использовании метода push', function() {
            assert.throws(function() {
                new Pool([{ name: 'a' }]).push({ name: 'a' });
            }, Error, 'Duplicate module a');

            assert.throws(function() {
                new Pool().push([
                    { name: 'a' },
                    { name: 'b' },
                    { name: 'b' }
                ]);
            }, Error, 'Duplicate module b');
        });

        it('Получить ошибку о дублировании модулей при использовании метода add', function() {
            assert.throws(function() {
                new Pool([{ name: 'a' }]).add([
                    { name: 'b' },
                    { name: 'a' }
                ], 1);
            }, Error, 'Duplicate module a');
        });

    });

});
