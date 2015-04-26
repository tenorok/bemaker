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
                new Join(['a', 'b', { file: 'c', content: 'c' }])
                    .beforeEach(function(item, index, length) {
                        var content = typeof item === 'string' ? item : item.content;
                        return '(' + index + ':' + length + ')' + content + ':';
                    }).toString().then(function(content) {
                        assert.equal(content, '(0:3)a:a(1:3)b:b(2:3)c:c');
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
                ]).beforeEachFile(function(item, index, length) {
                        return '(' + index + ':' + length + ')' + item.file + ':';
                    }).toString().then(function(content) {
                        assert.equal(content, '(0:2)' + files.a + ':var a;\nc(1:2)' + files.b + ':var b;\n');
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
                new Join(['a', { file: 'b', content: 'b' }, 'c'])
                    .afterEach(function(item, index, length) {
                        var content = typeof item === 'string' ? item : item.content;
                        return ':' + content + '(' + index + ':' + length + ')';
                    }).toString().then(function(content) {
                        assert.equal(content, 'a:a(0:3)b:b(1:3)c:c(2:3)');
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
                    { file: files.b },
                    'c'
                ]).afterEachFile(function(item, index, length) {
                        return ':' + item.file + '(' + index + ':' + length + ')';
                    }).toString().then(function(content) {
                        assert.equal(content, 'var a;\n:' + files.a + '(0:2)var b;\n:' + files.b + '(1:2)c');
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
            });

        });

    });

});
