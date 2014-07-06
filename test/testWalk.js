const assert = require('chai').assert,
    path = require('path'),
    Walk = require('../modules/Walk'),

    paths = {
        flat: path.join(__dirname, 'fixtures/walk/flat'),
        'flat/a': path.join(__dirname, 'fixtures/walk/flat/a.js'),
        'flat/b': path.join(__dirname, 'fixtures/walk/flat/b.css'),
        'flat/c': path.join(__dirname, 'fixtures/walk/flat/c.txt'),

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

        it('Рекурсивно получить список объектов нескольких директорий', function(done) {
            new Walk([paths.nest2, paths.nest3]).listRecur().spread(function(flat, nest) {
                assert.deepEqual(flat.names, [
                    '1.js',
                    'nest21',
                    '100.js',
                    '10.js'
                ]);
                assert.deepEqual(flat.absolute, [
                    paths['nest2/1'],
                    paths.nest21,
                    paths['nest21/100'],
                    paths['nest3/10']
                ]);
                assert.deepEqual(nest, [
                    {
                        names: ['1.js', 'nest21', '100.js'],
                        absolute: [paths['nest2/1'], paths.nest21, paths['nest21/100']],
                        relative: ['1.js', 'nest21', 'nest21/100.js']
                    },
                    {
                        names: ['10.js'],
                        absolute: [paths['nest3/10']],
                        relative: ['10.js']
                    }
                ]);
                done();
            });
        });

        it('Отфильтровать только файлы одной директории', function(done) {
            new Walk(paths.nest2).listRecur(function(name, stats, index) {
                if(index === 0) assert.equal(name, '1.js');
                else if(index === 1) assert.equal(name, 'nest21');
                else if(index === 2) assert.equal(name, '100.js');

                return stats.isFile();
            }).spread(function(flat) {
                    assert.deepEqual(flat.names, [
                        '1.js',
                        '100.js'
                    ]);
                    done();
                });
        });

    });

    describe('Метод filesRecur.', function() {

        it('Рекурсивно получить список файлов директории', function(done) {
            new Walk(paths.nest).filesRecur().spread(function(flat, nest) {
                assert.deepEqual(flat.names, [
                    'a.js',
                    'b.css',
                    '10.js',
                    '1.js',
                    '100.js'
                ]);
                assert.deepEqual(flat.absolute, [
                    paths['nest/a'],
                    paths['nest/b'],
                    paths['nest3/10'],
                    paths['nest2/1'],
                    paths['nest21/100']
                ]);
                done();
            });
        });

        it('Рекурсивно получить список файлов нескольких директорий', function(done) {
            new Walk([paths.nest2, paths.nest3]).filesRecur().spread(function(flat, nest) {
                assert.deepEqual(flat.names, [
                    '1.js',
                    '100.js',
                    '10.js'
                ]);
                assert.deepEqual(flat.absolute, [
                    paths['nest2/1'],
                    paths['nest21/100'],
                    paths['nest3/10']
                ]);
                assert.deepEqual(nest, [
                    {
                        names: ['1.js', '100.js'],
                        absolute: [paths['nest2/1'], paths['nest21/100']],
                        relative: ['1.js', 'nest21/100.js']
                    },
                    {
                        names: ['10.js'],
                        absolute: [paths['nest3/10']],
                        relative: ['10.js']
                    }
                ]);
                done();
            });
        });

        it('Отфильтровать некоторые файлы одной директории', function(done) {
            new Walk(paths.nest).listRecur(function(name, stats, index) {
                return path.extname(name) === '.css' || name === '100.js';
            }).spread(function(flat, nest) {
                    assert.deepEqual(flat.names, [
                        'b.css',
                        '100.js'
                    ]);
                    assert.deepEqual(nest, [
                        {
                            names: ['b.css', '100.js'],
                            absolute: [paths['nest/b'], paths['nest21/100']],
                            relative: ['b.css', 'nest2/nest21/100.js']
                        }
                    ]);
                    done();
                });
        });

    });

    describe('Метод dirsRecur.', function() {

        it('Рекурсивно получить список папок директории', function(done) {
            new Walk(paths.nest).dirsRecur().spread(function(flat, nest) {
                assert.deepEqual(flat.names, [
                    'nest2',
                    'nest3',
                    'nest21'
                ]);
                assert.deepEqual(flat.absolute, [
                    paths.nest2,
                    paths.nest3,
                    paths.nest21
                ]);
                done();
            });
        });

        it('Рекурсивно получить список папок нескольких директорий', function(done) {
            new Walk([paths.nest2, paths.nest3]).dirsRecur().spread(function(flat, nest) {
                assert.deepEqual(flat.names, [
                    'nest21'
                ]);
                assert.deepEqual(flat.absolute, [
                    paths.nest21
                ]);
                assert.deepEqual(nest, [
                    {
                        names: ['nest21'],
                        absolute: [paths.nest21],
                        relative: ['nest21']
                    },
                    {
                        names: [],
                        absolute: [],
                        relative: []
                    }
                ]);
                done();
            });
        });

        it('Отфильтровать некоторые папки одной директории', function(done) {
            new Walk(paths.nest).dirsRecur(function(name, stats, index) {
                return name === 'nest3';
            }).spread(function(flat, nest) {
                    assert.deepEqual(flat.names, [
                        'nest3'
                    ]);
                    done();
                });
        });

    });

});
