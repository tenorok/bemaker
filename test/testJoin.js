const fs = require('fs'),
    assert = require('chai').assert,
    path = require('path'),
    Join = require('../modules/Join'),

    files = {
        a: path.join(__dirname, 'fixtures/files/a.js'),
        b: path.join(__dirname, 'fixtures/files/b.js'),
        c: path.join(__dirname, 'fixtures/files/c.js')
    };

describe('Модуль Join.', function() {

    it('Объединить две строки', function(done) {
        new Join(['a', 'b']).toString().then(function(content) {
            assert.equal(content, 'ab');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Получить содержимое одного файла', function(done) {
        Join.readFile(files.a).then(function(content) {
            assert.equal(content, 'var a;\n');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Проверить кеширование содержимого файлов', function(done) {
        var file = 'test/fixtures/tmp/cache.js';
        fs.writeFileSync(file, 'cached content');

        Join.readFile(file).then(function(content) {
            assert.equal(content, 'cached content');
            fs.writeFileSync(file, 'other content');
        }).catch(function(err) {
                done(err);
            });

        Join.readFile(file).then(function(content) {
            assert.equal(content, 'cached content');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Получить содержимое списка файлов', function(done) {
        Join.readFiles([files.a, files.b, files.c]).then(function(content) {
            assert.deepEqual(content, ['var a;\n', 'var b;\n', 'var c;\n']);
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Соединить файл и строку', function(done) {
        new Join([
            { file: files.a },
            'b'
        ]).toString().then(function(content) {
                assert.equal(content, 'var a;\nb');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Соединенить два файла', function(done) {
        new Join([
            { file: files.a },
            { file: files.b }
        ]).toString().then(function(content) {
                assert.equal(content, 'var a;\nvar b;\n');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Установить данные', function(done) {
        new Join().data([
                { file: files.a },
                'b'
            ]).toString().then(function(content) {
                assert.equal(content, 'var a;\nb');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Получить данные данные', function() {
        assert.deepEqual(new Join().data(['a', 'b']).data(), ['a', 'b']);
    });

    it('Добавить данные', function(done) {
        new Join([
            { file: files.a },
            { file: files.b }
        ]).add([{ file: files.c }, 'd']).toString().then(function(content) {
                assert.equal(content, 'var a;\nvar b;\nvar c;\nd');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Добавить список файлов', function(done) {
        new Join([{ file: files.a }]).addFiles([
                files.b,
                files.c
            ]).toString().then(function(content) {
                assert.equal(content, 'var a;\nvar b;\nvar c;\n');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Соединить с заданным содержимым файла', function(done) {
        new Join([
            { file: files.a },
            { file: files.b, content: 'cache b;\n' }
        ]).toString().then(function(content) {
                assert.equal(content, 'var a;\ncache b;\n');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    describe('before*.', function() {

        it('Строкой', function(done) {
            new Join(['a', 'b']).before('{').toString().then(function(content) {
                assert.equal(content, '{ab');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        it('Функцией', function(done) {
            new Join(['a', 'b']).before(function() { return '{'; }).toString().then(function(content) {
                assert.equal(content, '{ab');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        it('Установить данные после before', function(done) {
            new Join().before('{').data(['a', 'b']).toString().then(function(content) {
                assert.equal(content, '{ab');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        describe('beforeEach', function() {

            it('Строкой', function(done) {
                new Join(['a', 'b']).beforeEach(',').toString().then(function(content) {
                    assert.equal(content, ',a,b');
                    done();
                }).catch(function(err) {
                        done(err);
                    });
            });

            it('Функцией', function(done) {
                new Join(['a', 'b']).beforeEach(function(i) { return i + ')'; }).toString().then(function(content) {
                    assert.equal(content, '0)a1)b');
                    done();
                }).catch(function(err) {
                        done(err);
                    });
            });

        });

        describe('beforeEachFile', function() {

            it('Строкой', function(done) {
                new Join([
                    { file: files.a },
                    'c',
                    { file: files.b }
                ]).beforeEachFile(',').toString().then(function(content) {
                    assert.equal(content, ',var a;\nc,var b;\n');
                    done();
                }).catch(function(err) {
                        done(err);
                    });
            });

            it('Функцией', function(done) {
                new Join([
                    { file: files.a },
                    'c',
                    { file: files.b }
                ]).beforeEachFile(function(i, file) {
                        return i + ':' + file + ')';
                    }).toString().then(function(content) {
                        assert.equal(content, '0:' + files.a + ')var a;\nc1:' + files.b + ')var b;\n');
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            });

        });

    });

    describe('after*.', function() {

        it('Строкой', function(done) {
            new Join(['a', 'b']).after('}').toString().then(function(content) {
                assert.equal(content, 'ab}');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        it('Функцией', function(done) {
            new Join(['a', 'b']).after(function() { return '}'; }).toString().then(function(content) {
                assert.equal(content, 'ab}');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        describe('afterEach', function() {

            it('Строкой', function(done) {
                new Join(['a', 'b']).afterEach(',').toString().then(function(content) {
                    assert.equal(content, 'a,b,');
                    done();
                }).catch(function(err) {
                        done(err);
                    });
            });

            it('Функцией', function(done) {
                new Join(['a', 'b']).afterEach(function(i) { return '(' + i; }).toString().then(function(content) {
                    assert.equal(content, 'a(0b(1');
                    done();
                }).catch(function(err) {
                        done(err);
                    });
            });

        });

        describe('afterEachFile', function() {

            it('Строкой', function(done) {
                new Join([
                    { file: files.a },
                    'c',
                    { file: files.b }
                ]).afterEachFile(',').toString().then(function(content) {
                        assert.equal(content, 'var a;\n,cvar b;\n,');
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            });

            it('Функцией', function(done) {
                new Join([
                    { file: files.a },
                    'c',
                    { file: files.b }
                ]).afterEachFile(function(i, file) {
                        return '(' + i + ':' + file;
                    }).toString().then(function(content) {
                        assert.equal(content, 'var a;\n(0:' + files.a + 'cvar b;\n(1:' + files.b);
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            });

        });

    });

});
