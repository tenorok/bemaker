const assert = require('chai').assert,
    path = require('path'),
    Walk = require('../modules/Walk'),

    paths = {
        flat: path.join(__dirname, 'fixtures/walk/flat/'),
        'flat/a': path.join(__dirname, 'fixtures/walk/flat/a.js'),
        'flat/b': path.join(__dirname, 'fixtures/walk/flat/b.css'),
        'flat/c': path.join(__dirname, 'fixtures/walk/flat/c.txt'),

        flat2: path.join(__dirname, 'fixtures/walk/flat2/'),
        'flat2/a': path.join(__dirname, 'fixtures/walk/flat2/a.dart'),
        'flat2/b': path.join(__dirname, 'fixtures/walk/flat2/b.less'),

        nest: path.join(__dirname, 'fixtures/walk/nest/'),
        nest2: path.join(__dirname, 'fixtures/walk/nest/nest2/'),
        nest3: path.join(__dirname, 'fixtures/walk/nest/nest3/'),
        nest21: path.join(__dirname, 'fixtures/walk/nest/nest2/nest21/')
    };

describe('Модуль Walk.', function() {

    describe('Метод list.', function() {

        it('Получить список объектов директории', function(done) {
            new Walk(paths.flat).list().spread(function(flat, nest) {
                assert.deepEqual(flat, [
                    'a.js',
                    'b.css',
                    'c.txt'
                ]);
                assert.deepEqual(nest, [[
                    'a.js',
                    'b.css',
                    'c.txt'
                ]]);
                done();
            });
        });

        it('Получить список объектов нескольких директорий', function(done) {
            new Walk([paths.flat, paths.nest]).list().spread(function(flat, nest) {
                assert.deepEqual(flat, [
                    'a.js',
                    'b.css',
                    'c.txt',
                    'a.js',
                    'b.css',
                    'nest2',
                    'nest3'
                ]);
                assert.deepEqual(nest, [
                    [
                        'a.js',
                        'b.css',
                        'c.txt'
                    ],
                    [
                        'a.js',
                        'b.css',
                        'nest2',
                        'nest3'
                    ]
                ]);
                done();
            });
        });

        it('Отфильтровать только файлы одной директории', function(done) {
            new Walk(paths.nest).list(function(name, stats, index) {
                if(index === 0) assert.equal(name, 'a.js');
                else if(index === 1) assert.equal(name, 'b.css');
                else if(index === 2) assert.equal(name, 'nest2');
                else if(index === 3) assert.equal(name, 'nest3');

                return stats.isFile();
            }).spread(function(flat) {
                assert.deepEqual(flat, [
                    'a.js',
                    'b.css'
                ]);
                done();
            });
        });

        it('Отфильтровать только файлы нескольких директорий', function(done) {
            new Walk([paths.nest, paths.nest2]).list(function(name, stats) {
                return stats.isFile();
            }).spread(function(flat) {
                    assert.deepEqual(flat, [
                        'a.js',
                        'b.css',
                        '1.js'
                    ]);
                    done();
                });
        });

    });

    describe('Метод files.', function() {

        it('Получить список файлов директории', function(done) {
            new Walk(paths.nest).files().spread(function(flat, nest) {
                assert.deepEqual(flat, [
                    'a.js',
                    'b.css'
                ]);
                assert.deepEqual(nest, [[
                    'a.js',
                    'b.css'
                ]]);
                done();
            });
        });

        it('Получить список js-файлов директории', function(done) {
            new Walk(paths.nest).files(function(name, stats, index) {
                if(index === 0) assert.equal(name, 'a.js');
                else if(index === 1) assert.equal(name, 'b.css');

                return path.extname(name) === '.js';
            }).spread(function(flat) {
                assert.deepEqual(flat, [
                    'a.js'
                ]);
                done();
            });
        });

    });

    describe('Метод filesRecur.', function() {

        it('Получить список файлов директории', function(done) {
            new Walk(paths.flat).filesRecur().spread(function(filePaths, fileNames) {
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

        it('Получить список файлов из двух директорий', function(done) {
            new Walk([paths.flat, paths.flat2]).filesRecur().spread(function(filePaths, fileNames) {
                assert.deepEqual(filePaths, [
                    paths['flat/a'],
                    paths['flat/b'],
                    paths['flat/c'],
                    paths['flat2/a'],
                    paths['flat2/b']
                ]);
                assert.deepEqual(fileNames, [
                    'a.js',
                    'b.css',
                    'c.txt',
                    'a.dart',
                    'b.less'
                ]);
                done();
            });
        });

    });

});
