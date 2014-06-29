const assert = require('chai').assert,
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

    });

});
