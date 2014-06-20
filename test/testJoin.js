const assert = require('chai').assert,
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

    it('Соединение файла и строки', function(done) {
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

    it('Соединение двух файлов', function(done) {
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

    it('Добавление данных', function(done) {
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

    it('Добавление списка файлов', function(done) {
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

    it('Соединение с закешированным файлом', function(done) {
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

    describe('before* / each*.', function() {

        it('before строкой', function(done) {
            new Join(['a', 'b']).before('{').toString().then(function(content) {
                assert.equal(content, '{ab');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

    });

});
