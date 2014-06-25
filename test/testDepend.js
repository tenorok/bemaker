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

    it('Задать и получить модули отдельным методом', function() {
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

});
