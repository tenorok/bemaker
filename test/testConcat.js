const assert = require('chai').assert,
    path = require('path'),
    Concat = require('../modules/Concat'),

    files = {
        a: path.join(__dirname, 'fixtures/files/a.js'),
        b: path.join(__dirname, 'fixtures/files/b.js'),
        c: path.join(__dirname, 'fixtures/files/c.js')
    };

describe('Модуль Concat.', function() {

    it('Получить содержимое одного файла', function(done) {
        Concat.readFile(files.a).then(function(content) {
            assert.equal(content, 'var a;\n');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Соединение двух файлов', function(done) {
        new Concat([
            files.a,
            files.b
        ]).toString().then(function(content) {
                assert.equal(content, 'var a;\nvar b;\n');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

    it('Добавление файлов', function(done) {
        new Concat([
            files.a,
            files.b
        ]).add([files.c]).toString().then(function(content) {
                assert.equal(content, 'var a;\nvar b;\nvar c;\n');
                done();
            }).catch(function(err) {
                done(err);
            });
    });

});
