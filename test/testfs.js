const fs = require('fs'),
    path = require('path'),
    assert = require('chai').assert,
    rimraf = require('rimraf'),
    moduleFs = require('../modules/fs'),

    tmpPath = path.join(__dirname, 'fixtures/tmp/'),
    filesPath = path.join(__dirname, 'fixtures/files/'),
    files = {
        a: path.join(__dirname, 'fixtures/files/a.js'),
        b: path.join(__dirname, 'fixtures/files/b.js'),
        c: path.join(__dirname, 'fixtures/files/c.js')
    };

describe('Модуль fs.', function() {

    afterEach(function() {
        rimraf.sync(tmpPath);
        fs.mkdirSync(tmpPath);
        fs.writeFileSync(path.join(tmpPath, '.gitkeep'), '');
    });

    describe('Метод readFile.', function() {

        it('Получить содержимое одного файла', function(done) {
            moduleFs.readFile(files.a).then(function(content) {
                assert.equal(content, 'var a;\n');
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        it('Проверить кеширование содержимого файлов', function(done) {
            var file = path.join(tmpPath, 'cache.js');
            fs.writeFileSync(file, 'cached content');

            moduleFs.readFile(file).then(function(content) {
                assert.equal(content, 'cached content');

                fs.writeFile(file, 'other content', function() {
                    moduleFs.readFile(file).then(function(content) {
                        assert.equal(content, 'cached content');
                        done();
                    }).catch(function(err) {
                            done(err);
                        });
                });
            }).catch(function(err) {
                    done(err);
                });
        });

    });

    describe('Метод readFiles.', function() {

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

    describe('Метод readdir.', function() {

        it('Получить список объектов директории', function(done) {
            moduleFs.readdir(filesPath).then(function(list) {
                assert.deepEqual(list, [
                    'a.js',
                    'b.js',
                    'c.js'
                ]);
                done();
            }).catch(function(err) {
                    done(err);
                });
        });

        it('Проверить кеширование списка объектов директории', function(done) {
            var tmpPathReaddir = path.join(tmpPath, 'readdir');
            fs.mkdirSync(tmpPathReaddir);
            fs.writeFileSync(path.join(tmpPathReaddir, 'a.js'), '');
            fs.writeFileSync(path.join(tmpPathReaddir, 'b.css'), '');
            fs.writeFileSync(path.join(tmpPathReaddir, 'c.html'), '');

            moduleFs.readdir(tmpPathReaddir).then(function(list) {
                assert.deepEqual(list, [
                    'a.js',
                    'b.css',
                    'c.html'
                ]);

                fs.writeFile(path.join(tmpPathReaddir, 'd.dart'), '', function() {
                    moduleFs.readdir(tmpPathReaddir).then(function(list) {
                        assert.deepEqual(list, [
                            'a.js',
                            'b.css',
                            'c.html'
                        ]);
                        done();
                    }).catch(function(err) {
                            done(err);
                        });
                });
            }).catch(function(err) {
                    done(err);
                });
        });

    });

});
