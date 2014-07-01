const assert = require('chai').assert,
    path = require('path'),
    Walk = require('../modules/Walk'),

    paths = {
        flat: path.join(__dirname, 'fixtures/walk/flat/'),
        'flat/a': path.join(__dirname, 'fixtures/walk/flat/a.js'),
        'flat/b': path.join(__dirname, 'fixtures/walk/flat/b.css'),
        'flat/c': path.join(__dirname, 'fixtures/walk/flat/c.txt'),

        flat2: path.join(__dirname, 'fixtures/walk/flat2/'),
        'flat2/a': path.join(__dirname, 'fixtures/walk/flat/a.dart'),
        'flat2/b': path.join(__dirname, 'fixtures/walk/flat/b.less')
    };

describe('Модуль Walk.', function() {

    it('Получить список файлов директории', function(done) {
        new Walk(paths.flat).files().spread(function(filePaths, fileNames) {
            assert.deepEqual(filePaths, [
                paths['flat/a'],
                paths['flat/b'],
                paths['flat/c']
            ]);
            assert.deepEqual(fileNames, [
                'a.js',
                'b.css',
                'c.txt'
            ]);
            done();
        });
    });

});
