const fs = require('fs'),
    path = require('path'),
    assert = require('chai').assert,
    Selector = require('bemer').modules('Selector'),
    Make = require('../modules/Make'),

    tmp = path.join(__dirname, 'fixtures/tmp/');

describe('Модуль Make.', function() {

    it('Метод getBlocks', function(done) {
        var common = path.join(__dirname, 'fixtures/levels/common/'),
            desktop = path.join(__dirname, 'fixtures/levels/desktop/');

        new Make({
            directories: [
                common,
                desktop
            ],
            extensions: ['.js', '.css']
        }).getBlocks().then(function(blocks) {
                assert.deepEqual(blocks.get(), [
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
                ]);
                done();
            });
    });

});
