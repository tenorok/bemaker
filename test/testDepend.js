const assert = require('chai').assert,
    Depend = require('../modules/Depend');

describe('Модуль Depend.', function() {

    it('Получить модули заданные в конструкторе', function() {
        assert.deepEqual(new Depend([
            { name: 'a' },
            { name: 'b' }
        ]).get(), [
            { name: 'a' },
            { name: 'b' }
        ]);
    });

    it('Задать и получить модули методом set', function() {
        assert.deepEqual(new Depend().set([
            { name: 'a' },
            { name: 'b' }
        ]).get(), [
            { name: 'a' },
            { name: 'b' }
        ]);
    });

    it('Добавить модули', function() {
        assert.deepEqual(new Depend([
            { name: 'a' },
            { name: 'b' }
        ]).add([{ name: 'c' }]).get(), [
            { name: 'a' },
            { name: 'b' },
            { name: 'c' }
        ]);
    });

    it('Получить заданный модуль', function() {
        assert.deepEqual(new Depend([
            { name: 'a' },
            { name: 'b' },
            { name: 'c' }
        ]).get('b'), { name: 'b' });
    });

    it('Получить индекс модуля', function() {
        assert.equal(new Depend([
            { name: 'a' },
            { name: 'b' },
            { name: 'c' }
        ]).indexOf('b'), 1);
    });

    it('Получить индекс модуля из указанного списка модулей', function() {
        assert.equal(new Depend().indexOf('c', [
            { name: 'a' },
            { name: 'b' },
            { name: 'c' }
        ]), 2);
    });

    it('Получить ошибку о дублировании модулей', function() {
        assert.throws(function() {
            new Depend([
                { name: 'a' },
                { name: 'b' },
                { name: 'b' }
            ]);
        }, Error, 'A duplicate module b');
    });

    it('Получить ошибку о дублировании модулей при использовании метода set', function() {
        assert.throws(function() {
            new Depend().set([
                { name: 'a' },
                { name: 'b' },
                { name: 'a' }
            ]);
        }, Error, 'A duplicate module a');
    });

    it('Получить ошибку о дублировании модулей при использовании метода add', function() {
        assert.throws(function() {
            new Depend([{ name: 'a' }]).add([{ name: 'a' }]);
        }, Error, 'A duplicate module a');

        assert.throws(function() {
            new Depend().add([
                { name: 'a' },
                { name: 'b' },
                { name: 'b' }
            ]);
        }, Error, 'A duplicate module b');
    });

});
