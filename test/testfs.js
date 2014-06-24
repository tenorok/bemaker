const fs = require('fs'),
    assert = require('chai').assert,
    path = require('path'),
    moduleFs = require('../modules/fs'),

    files = {
        a: path.join(__dirname, 'fixtures/files/a.js'),
        b: path.join(__dirname, 'fixtures/files/b.js'),
        c: path.join(__dirname, 'fixtures/files/c.js')
    };

describe('Модуль fs.', function() {

    it('Получить содержимое одного файла', function(done) {
        moduleFs.readFile(files.a).then(function(content) {
            assert.equal(content, 'var a;\n');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Проверить кеширование содержимого файлов', function(done) {
        var file = 'test/fixtures/tmp/cache.js';
        fs.writeFileSync(file, 'cached content');

        moduleFs.readFile(file).then(function(content) {
            assert.equal(content, 'cached content');
            fs.writeFileSync(file, 'other content');
        }).catch(function(err) {
                done(err);
            });

        moduleFs.readFile(file).then(function(content) {
            assert.equal(content, 'cached content');
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Получить содержимое списка файлов', function(done) {
        moduleFs.readFiles([files.a, files.b, files.c]).then(function(content) {
            assert.deepEqual(content, ['var a;\n', 'var b;\n', 'var c;\n']);
            done();
        }).catch(function(err) {
                done(err);
            });
    });

    it('Проверить вызов колбека при получении содержимого списка файлов', function(done) {
        moduleFs.readFiles([files.c, files.a], function(file, data) {
            if(file === files.c) {
                assert.equal(data, 'var c;\n');
            } else if(file === files.a) {
                assert.equal(data, 'var a;\n');
                done();
            } else {
                done(new Error('Wrong file path.'));
            }
        });
    });

});
