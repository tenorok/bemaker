const assert = require('chai').assert,
    path = require('path'),
    Walk = require('../modules/Walk'),

    paths = {
        flat: path.join(__dirname, 'fixtures/walk/flat'),
        'flat/a': path.join(__dirname, 'fixtures/walk/flat/a.js'),
        'flat/b': path.join(__dirname, 'fixtures/walk/flat/b.css'),
        'flat/c': path.join(__dirname, 'fixtures/walk/flat/c.txt'),

        flat2: path.join(__dirname, 'fixtures/walk/flat2'),
        'flat2/a': path.join(__dirname, 'fixtures/walk/flat2/a.dart'),
        'flat2/b': path.join(__dirname, 'fixtures/walk/flat2/b.less'),

        nest: path.join(__dirname, 'fixtures/walk/nest'),
        'nest/a': path.join(__dirname, 'fixtures/walk/nest/a.js'),
        'nest/b': path.join(__dirname, 'fixtures/walk/nest/b.css'),
        nest2: path.join(__dirname, 'fixtures/walk/nest/nest2'),
        'nest2/1': path.join(__dirname, 'fixtures/walk/nest/nest2/1.js'),
        nest3: path.join(__dirname, 'fixtures/walk/nest/nest3'),
        'nest3/10': path.join(__dirname, 'fixtures/walk/nest/nest3/10.js'),
        nest21: path.join(__dirname, 'fixtures/walk/nest/nest2/nest21'),
        'nest21/100': path.join(__dirname, 'fixtures/walk/nest/nest2/nest21/100.js')
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

    describe('Метод dirs.', function() {

        it('Получить список папок директории', function(done) {
            new Walk(paths.nest).dirs().spread(function(flat, nest) {
                assert.deepEqual(flat, [
                    'nest2',
                    'nest3'
                ]);
                assert.deepEqual(nest, [[
                    'nest2',
                    'nest3'
                ]]);
                done();
            });
        });

        it('Получить список папок директории кроме папки с именем nest2', function(done) {
            new Walk(paths.nest).dirs(function(name, stats, index) {
                if(index === 0) assert.equal(name, 'nest2');
                else if(index === 1) assert.equal(name, 'nest3');

                return name !== 'nest2';
            }).spread(function(flat) {
                    assert.deepEqual(flat, [
                        'nest3'
                    ]);
                    done();
                });
        });

        it('Получить список папок нескольких директорий', function(done) {
            new Walk([paths.flat, paths.nest]).dirs().spread(function(flat, nest) {
                assert.deepEqual(flat, [
                    'nest2',
                    'nest3'
                ]);
                assert.deepEqual(nest, [
                    [],
                    [
                        'nest2',
                        'nest3'
                    ]
                ]);
                done();
            });
        });

    });

    describe('Метод listRecur.', function() {

        it('Рекурсивно получить список объектов директории', function(done) {
            new Walk(paths.nest).listRecur().spread(function(flat, nest) {
                var names = [
                        'a.js',
                        'b.css',
                        'nest2',
                        'nest3',
                        '10.js',
                        '1.js',
                        'nest21',
                        '100.js'
                    ],
                    absolute = [
                        paths['nest/a'],
                        paths['nest/b'],
                        paths.nest2,
                        paths.nest3,
                        paths['nest3/10'],
                        paths['nest2/1'],
                        paths.nest21,
                        paths['nest21/100']
                    ];

                assert.deepEqual(flat.names, names);
                assert.deepEqual(flat.absolute, absolute);

                assert.deepEqual(nest[0].names, names);
                assert.deepEqual(nest[0].absolute, absolute);
                assert.deepEqual(nest[0].relative, [
                    'a.js',
                    'b.css',
                    'nest2',
                    'nest3',
                    'nest3/10.js',
                    'nest2/1.js',
                    'nest2/nest21',
                    'nest2/nest21/100.js'
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
