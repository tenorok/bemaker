const fs = require('fs-extra'),
    path = require('path'),
    assert = require('chai').assert,
    sinon = require('sinon'),
    Selector = require('bemer').modules('Selector'),
    Make = require('../modules/Make'),
    Join = require('../modules/Join'),

    tmp = path.join(__dirname, 'fixtures/tmp/'),
    tmpAll = {
        js: path.join(tmp, 'all.js'),
        css: path.join(tmp, 'all.css'),
        iecss: path.join(tmp, 'all.ie.css'),
        beforeAfter: path.join(tmp, 'beforeAfter.ie.css')
    },

    unexistRoot = path.join(tmp, 'wrap/'),
    unexistDir = path.join(tmp, 'wrap/nested/'),
    unexistIECss = path.join(unexistDir, 'all.ie.css'),

    levels = path.join(__dirname, 'fixtures/levels/'),
    standardAll = {
        js: path.join(levels, 'build/all.js'),
        css: path.join(levels, 'build/all.css'),
        iecss: path.join(levels, 'build/all.ie.css'),
        beforeAfter: path.join(levels, 'build/beforeAfter.ie.css')
    },

    common = path.join(levels, 'common/'),
    desktop = path.join(levels, 'desktop/'),
    touch = path.join(levels, 'touch/');

describe('Модуль Make.', function() {

    afterEach(function() {
        Object.keys(tmpAll).forEach(function(extname) {
            if(fs.existsSync(tmpAll[extname])) {
                fs.unlinkSync(tmpAll[extname]);
            }
        });
        if(fs.existsSync(unexistRoot)) {
            fs.removeSync(unexistRoot);
        }
    });

    it('Метод getBlocks', function(done) {
        function sort(blocks) {
            blocks.forEach(function(block) {
                if(block.require) {
                    block.require.sort();
                }
            });
            return blocks.sort(function(a, b) { return a.name < b.name });
        }

        new Make({
            directories: [common, desktop]
        }).getBlocks().then(function(blocks) {
                assert.deepEqual(sort(blocks.get()), sort([
                    {
                        name: 'button',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: '__control',
                                        extname: '.css',
                                        path: path.join(common, 'button/__control.css'),
                                        selector: new Selector('__control').block('button')
                                    },
                                    {
                                        basename: 'button',
                                        extname: '.css',
                                        path: path.join(common, 'button/button.css'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button',
                                        extname: '.js',
                                        path: path.join(common, 'button/button.js'),
                                        selector: new Selector('button')
                                    }
                                ]
                            },
                            {
                                path: desktop,
                                files: [
                                    {
                                        basename: 'button',
                                        extname: '.ie.css',
                                        path: path.join(desktop, 'button/button.ie.css'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button',
                                        extname: '.js',
                                        path: path.join(desktop, 'button/button.js'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button__control',
                                        extname: '.css',
                                        path: path.join(desktop, 'button/__control/button__control.css'),
                                        selector: new Selector('button__control')
                                    }
                                ]
                            }
                        ],
                        require: ['link', 'checkbox']
                    },
                    {
                        name: 'checkbox',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'checkbox',
                                        extname: '.css',
                                        path: path.join(common, 'checkbox/checkbox.css'),
                                        selector: new Selector('checkbox')
                                    },
                                    {
                                        basename: 'checkbox_mod_val',
                                        extname: '.js',
                                        path: path.join(common, 'checkbox/_mod/checkbox_mod_val.js'),
                                        selector: new Selector('checkbox_mod_val')
                                    }
                                ]
                            }
                        ],
                        require: []
                    },
                    {
                        name: 'input',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'input',
                                        extname: '.css',
                                        path: path.join(common, 'input/input.css'),
                                        selector: new Selector('input')
                                    },
                                    {
                                        basename: 'input',
                                        extname: '.js',
                                        path: path.join(common, 'input/input.js'),
                                        selector: new Selector('input')
                                    },
                                    {
                                        basename: '__control',
                                        extname: '.css',
                                        path: path.join(common, 'input/__control/__control.css'),
                                        selector: new Selector('__control').block('input')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'checkbox']
                    },
                    {
                        name: 'link',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: '__blank',
                                        extname: '.css',
                                        path: path.join(common, 'link/__blank.css'),
                                        selector: new Selector('__blank').block('link')
                                    },
                                    {
                                        basename: 'link',
                                        extname: '.js',
                                        path: path.join(common, 'link/link.js'),
                                        selector: new Selector('link')
                                    }
                                ]
                            }
                        ],
                        require: ['under']
                    },
                    {
                        name: 'select',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'select',
                                        extname: '.css',
                                        path: path.join(common, 'select/select.css'),
                                        selector: new Selector('select')
                                    },
                                    {
                                        basename: 'select',
                                        extname: '.js',
                                        path: path.join(common, 'select/select.js'),
                                        selector: new Selector('select')
                                    },
                                    {
                                        basename: '_mod_val',
                                        extname: '.css',
                                        path: path.join(common, 'select/_mod_val/_mod_val.css'),
                                        selector: new Selector('_mod_val').block('select')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'link']
                    },
                    {
                        name: 'under',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'under',
                                        extname: '.css',
                                        path: path.join(common, 'under/under.css'),
                                        selector: new Selector('under')
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'popup',
                        levels: [
                            {
                                path: desktop,
                                files: [
                                    {
                                        basename: 'popup',
                                        extname: '.css',
                                        path: path.join(desktop, 'popup/popup.css'),
                                        selector: new Selector('popup')
                                    },
                                    {
                                        basename: 'popup',
                                        extname: '.js',
                                        path: path.join(desktop, 'popup/popup.js'),
                                        selector: new Selector('popup')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'input', 'select']
                    }
                ]));
                done();
            });
    });

    it('Метод filter', function(done) {
        var make = new Make({
            directories: [common, desktop],
            blocks: ['link', 'checkbox']
        });
        make.getBlocks().then(function(blocks) {
                assert.deepEqual(make.filter(blocks).get().sort(function(a, b) { return a.name < b.name }), [
                    {
                        name: 'checkbox',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'checkbox',
                                        extname: '.css',
                                        path: path.join(common, 'checkbox/checkbox.css'),
                                        selector: new Selector('checkbox')
                                    },
                                    {
                                        basename: 'checkbox_mod_val',
                                        extname: '.js',
                                        path: path.join(common, 'checkbox/_mod/checkbox_mod_val.js'),
                                        selector: new Selector('checkbox_mod_val')
                                    }
                                ]
                            }
                        ],
                        require: []
                    },
                    {
                        name: 'link',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: '__blank',
                                        extname: '.css',
                                        path: path.join(common, 'link/__blank.css'),
                                        selector: new Selector('__blank').block('link')
                                    },
                                    {
                                        basename: 'link',
                                        extname: '.js',
                                        path: path.join(common, 'link/link.js'),
                                        selector: new Selector('link')
                                    }
                                ]
                            }
                        ],
                        require: ['under']
                    },
                    {
                        name: 'under',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'under',
                                        extname: '.css',
                                        path: path.join(common, 'under/under.css'),
                                        selector: new Selector('under')
                                    }
                                ]
                            }
                        ]
                    }
                ].sort(function(a, b) { return a.name < b.name }));
                done();
            });
    });

    it('Метод sort', function(done) {
        var make = new Make({
            directories: [common, desktop]
        });
        make.getBlocks()
            .then(make.sort.bind(make))
            .then(function(blocks) {
                assert.deepEqual(blocks, [
                    {
                        name: 'under',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'under',
                                        extname: '.css',
                                        path: path.join(common, 'under/under.css'),
                                        selector: new Selector('under')
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'link',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'link',
                                        extname: '.js',
                                        path: path.join(common, 'link/link.js'),
                                        selector: new Selector('link')
                                    },
                                    {
                                        basename: '__blank',
                                        extname: '.css',
                                        path: path.join(common, 'link/__blank.css'),
                                        selector: new Selector('__blank').block('link')
                                    }
                                ]
                            }
                        ],
                        require: ['under']
                    },
                    {
                        name: 'checkbox',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'checkbox',
                                        extname: '.css',
                                        path: path.join(common, 'checkbox/checkbox.css'),
                                        selector: new Selector('checkbox')
                                    },
                                    {
                                        basename: 'checkbox_mod_val',
                                        extname: '.js',
                                        path: path.join(common, 'checkbox/_mod/checkbox_mod_val.js'),
                                        selector: new Selector('checkbox_mod_val')
                                    }
                                ]
                            }
                        ],
                        require: []
                    },
                    {
                        name: 'button',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'button',
                                        extname: '.css',
                                        path: path.join(common, 'button/button.css'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button',
                                        extname: '.js',
                                        path: path.join(common, 'button/button.js'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: '__control',
                                        extname: '.css',
                                        path: path.join(common, 'button/__control.css'),
                                        selector: new Selector('__control').block('button')
                                    }
                                ]
                            },
                            {
                                path: desktop,
                                files: [
                                    {
                                        basename: 'button',
                                        extname: '.ie.css',
                                        path: path.join(desktop, 'button/button.ie.css'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button',
                                        extname: '.js',
                                        path: path.join(desktop, 'button/button.js'),
                                        selector: new Selector('button')
                                    },
                                    {
                                        basename: 'button__control',
                                        extname: '.css',
                                        path: path.join(desktop, 'button/__control/button__control.css'),
                                        selector: new Selector('button__control')
                                    }
                                ]
                            }
                        ],
                        require: ['link', 'checkbox']
                    },
                    {
                        name: 'input',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'input',
                                        extname: '.css',
                                        path: path.join(common, 'input/input.css'),
                                        selector: new Selector('input')
                                    },
                                    {
                                        basename: 'input',
                                        extname: '.js',
                                        path: path.join(common, 'input/input.js'),
                                        selector: new Selector('input')
                                    },
                                    {
                                        basename: '__control',
                                        extname: '.css',
                                        path: path.join(common, 'input/__control/__control.css'),
                                        selector: new Selector('__control').block('input')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'checkbox']
                    },
                    {
                        name: 'select',
                        levels: [
                            {
                                path: common,
                                files: [
                                    {
                                        basename: 'select',
                                        extname: '.css',
                                        path: path.join(common, 'select/select.css'),
                                        selector: new Selector('select')
                                    },
                                    {
                                        basename: 'select',
                                        extname: '.js',
                                        path: path.join(common, 'select/select.js'),
                                        selector: new Selector('select')
                                    },
                                    {
                                        basename: '_mod_val',
                                        extname: '.css',
                                        path: path.join(common, 'select/_mod_val/_mod_val.css'),
                                        selector: new Selector('_mod_val').block('select')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'link']
                    },
                    {
                        name: 'popup',
                        levels: [
                            {
                                path: desktop,
                                files: [
                                    {
                                        basename: 'popup',
                                        extname: '.css',
                                        path: path.join(desktop, 'popup/popup.css'),
                                        selector: new Selector('popup')
                                    },
                                    {
                                        basename: 'popup',
                                        extname: '.js',
                                        path: path.join(desktop, 'popup/popup.js'),
                                        selector: new Selector('popup')
                                    }
                                ]
                            }
                        ],
                        require: ['button', 'input', 'select']
                    }
                ]);
                done();
            });
    });

    it('Метод groupByExtensions', function(done) {
        var make = new Make({
            directories: [common, desktop]
        });
        make.getBlocks()
            .then(make.sort.bind(make))
            .then(make.groupByExtensions.bind(make))
            .then(function(groups) {
                assert.deepEqual(groups, {
                    '.js': new Join().addFiles([
                        path.join(common, 'link/link.js'),
                        path.join(common, 'checkbox/_mod/checkbox_mod_val.js'),
                        path.join(common, 'button/button.js'),
                        path.join(desktop, 'button/button.js'),
                        path.join(common, 'input/input.js'),
                        path.join(common, 'select/select.js'),
                        path.join(desktop, 'popup/popup.js')
                    ]),
                    '.css': new Join().addFiles([
                        path.join(common, 'under/under.css'),
                        path.join(common, 'link/__blank.css'),
                        path.join(common, 'checkbox/checkbox.css'),
                        path.join(common, 'button/button.css'),
                        path.join(common, 'button/__control.css'),
                        path.join(desktop, 'button/__control/button__control.css'),
                        path.join(common, 'input/input.css'),
                        path.join(common, 'input/__control/__control.css'),
                        path.join(common, 'select/select.css'),
                        path.join(common, 'select/_mod_val/_mod_val.css'),
                        path.join(desktop, 'popup/popup.css')
                    ]),
                    '.ie.css': new Join().addFiles([
                        path.join(desktop, 'button/button.ie.css')
                    ])
                });
                done();
            });
    });

    it('Метод groupByExtensions с указанной опцией extensions', function(done) {
        var make = new Make({
            directories: [common, desktop],
            extensions: ['.css', '.ie.css']
        });
        make.getBlocks()
            .then(make.sort.bind(make))
            .then(make.groupByExtensions.bind(make))
            .then(function(groups) {
                assert.deepEqual(groups, {
                    '.css': new Join().addFiles([
                        path.join(common, 'under/under.css'),
                        path.join(common, 'link/__blank.css'),
                        path.join(common, 'checkbox/checkbox.css'),
                        path.join(common, 'button/button.css'),
                        path.join(common, 'button/__control.css'),
                        path.join(desktop, 'button/__control/button__control.css'),
                        path.join(common, 'input/input.css'),
                        path.join(common, 'input/__control/__control.css'),
                        path.join(common, 'select/select.css'),
                        path.join(common, 'select/_mod_val/_mod_val.css'),
                        path.join(desktop, 'popup/popup.css')
                    ]),
                    '.ie.css': new Join().addFiles([
                        path.join(desktop, 'button/button.ie.css')
                    ])
                });
                done();
            });
    });

    it('Метод writeFilesByExtensions', function(done) {
        var make = new Make({
            outdir: tmp,
            outname: 'all',
            directories: [common, desktop]
        });
        make.getBlocks()
            .then(make.sort.bind(make))
            .then(make.groupByExtensions.bind(make))
            .then(make.writeFilesByExtensions.bind(make))
            .then(function(content) {
                var tmp = {
                        js: fs.readFileSync(tmpAll.js, 'utf-8'),
                        css: fs.readFileSync(tmpAll.css, 'utf-8'),
                        iecss: fs.readFileSync(tmpAll.iecss, 'utf-8')
                    },
                    standard = {
                        js: fs.readFileSync(standardAll.js, 'utf-8'),
                        css: fs.readFileSync(standardAll.css, 'utf-8'),
                        iecss: fs.readFileSync(standardAll.iecss, 'utf-8')
                    };
                assert.deepEqual(content, {
                    '.js': standard.js,
                    '.css': standard.css,
                    '.ie.css': standard.iecss
                });
                assert.equal(tmp.js, standard.js);
                assert.equal(tmp.css, standard.css);
                assert.equal(tmp.iecss, standard.iecss);
                done();
            });
    });

    it('Метод writeFilesByExtensions должен создавать целевую директорию, если она не существует', function(done) {
        var make = new Make({
            outdir: unexistDir,
            outname: 'all',
            directories: [desktop],
            extensions: ['.ie.css']
        });
        make.getBlocks()
            .then(make.sort.bind(make))
            .then(make.groupByExtensions.bind(make))
            .then(make.writeFilesByExtensions.bind(make))
            .then(function() {
                assert.equal(
                    fs.readFileSync(unexistIECss, 'utf-8'),
                    fs.readFileSync(standardAll.iecss, 'utf-8')
                );
                done();
            });
    });

    it('Метод build', function(done) {
        new Make({
            outdir: tmp,
            outname: 'all',
            directories: [common, desktop],
            extensions: ['.js', '.css']
        }).build().then(function() {
            assert.equal(
                fs.readFileSync(tmpAll.js, 'utf-8'),
                fs.readFileSync(standardAll.js, 'utf-8')
            );
            assert.equal(
                fs.readFileSync(tmpAll.css, 'utf-8'),
                fs.readFileSync(standardAll.css, 'utf-8')
            );
            done();
        });
    });

    it('Передача функции в опции before и after', function(done) {
        new Make({
            outdir: tmp,
            outname: 'beforeAfter',
            directories: [desktop],
            extensions: ['.ie.css'],
            before: function(abs, rel,  ext, i, len) {
                assert.equal(abs, path.join(__dirname, 'fixtures/levels/desktop/button/button.ie.css'));
                assert.equal(rel, '../test/fixtures/levels/desktop/button/button.ie.css');
                assert.equal(ext, '.ie.css');
                assert.equal(i, 0);
                assert.equal(len, 1);
                return '/* before */\n';
            },
            after: function(abs, rel,  ext, i, len) {
                assert.equal(abs, path.join(__dirname, 'fixtures/levels/desktop/button/button.ie.css'));
                assert.equal(rel, '../test/fixtures/levels/desktop/button/button.ie.css');
                assert.equal(ext, '.ie.css');
                assert.equal(i, 0);
                assert.equal(len, 1);
                return '/* after */\n';1
            }
        }).build().then(function() {
            assert.equal(
                fs.readFileSync(tmpAll.beforeAfter, 'utf-8'),
                fs.readFileSync(standardAll.beforeAfter, 'utf-8')
            );
            done();
        });
    });

    describe('События.', function() {

        it('Метод sort должен инициировать событие loop для циклических зависимостей', function(done) {
            var make = new Make({
                    directories: [touch]
                }),
                callback = sinon.spy();

            make.on('loop', function(branch) {
                assert.lengthOf(branch, 3);
                // Наиболее вероятное значение: `['pen', 'pointer', 'pen']`, однако при задержках
                // на файловой системе может быть другой порядок: `['pointer', 'pen', 'pointer']`.
                assert.includeMembers(branch, ['pen', 'pointer']);
                callback();
            });

            make.getBlocks()
                .then(make.sort.bind(make))
                .then(function() {
                    assert.equal(callback.callCount, 1, 'событие инициируется один раз');
                    done();
                });
        });

        it('Метод filter должен инициировать событие loop для циклических зависимостей', function(done) {
            var make = new Make({
                    directories: [touch],
                    blocks: ['pointer']
                }),
                callback = sinon.spy(),
                callback1 = callback.withArgs(['pointer', 'pen', 'pointer']);

            make.on('loop', callback);

            make.getBlocks()
                .then(make.filter.bind(make))
                .then(function() {
                    assert.equal(callback.callCount, 1, 'событие инициируется один раз');
                    assert.isTrue(callback1.calledOnce);
                    done();
                });
        });

        it('Методы sort и filter должны инициировать событие unexist без повторов', function(done) {
            var make = new Make({
                    directories: [touch],
                    blocks: ['pen']
                }),
                callback = sinon.spy(),
                callback1 = callback.withArgs({
                    name: 'pen',
                    require: 'unexist'
                });

            make.on('unexist', callback);

            make.getBlocks()
                .then(function(blocks) {
                    make.sort(make.filter(blocks));
                })
                .then(function() {
                    assert.equal(callback.callCount, 1, 'событие инициируется один раз');
                    assert.isTrue(callback1.calledOnce);
                    done();
                });
        });

    });

});
