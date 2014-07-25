const path = require('path');

/**
 * Модуль для упрощения написания CLI.
 *
 * @constructor
 */
function Cli() {}

Cli.prototype = {};

/**
 * Получить абсолютный путь из относительного
 * или массив абсолютных путей из массива относительных.
 *
 * @param {string|string[]} relativePath Относительный путь или массив путей
 * @returns {string|string[]}
 */
Cli.resolveAbsolutePath = function(relativePath) {
    return Array.isArray(relativePath)
        ? relativePath.map(function(relativePath) {
            return path.join(process.cwd(), relativePath);
        })
        : path.join(process.cwd(), relativePath);
};

module.exports = Cli;
