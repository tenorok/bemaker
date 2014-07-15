const fs = require('fs'),
    path = require('path'),
    assert = require('chai').assert,
    Make = require('../modules/Make'),

    tmp = path.join(__dirname, 'fixtures/tmp/');

describe('Модуль Make.', function() {

    it('Сборка блоков с уровня common', function(done) {
        new Make({
            outdir: tmp,
            outname: 'common',
            directories: [path.join(__dirname, 'fixtures/levels/common/')],
            extensions: ['.js', '.css']
        }).build().then(function() {
                assert.equal(
                    fs.readFileSync(path.join(tmp, 'common.js')),
                    fs.readFileSync(path.join(tmp, 'build/common.js'))
                );
                assert.equal(
                    fs.readFileSync(path.join(tmp, 'common.css')),
                    fs.readFileSync(path.join(tmp, 'build/common.css'))
                );
                done();
            });
    });

});
