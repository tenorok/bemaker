const _ = require('lodash'),
    clicolor = require('cli-color'),
    moment = require('moment');

/**
 * Сообщение.
 *
 * Может быть обычной строкой или хеш-картой.
 *
 * @typedef {string|{}} Log~Message
 * @property {string} [info.operation] Выполняемая операция
 * @property {string} [info.path] Путь до файла или директории
 * @property {string} [info.text] Сообщение
 * @property {string} [info.description] Пояснение
 * @property {number} [info.total] Длительность операции (мс)
 */

/**
 * Модуль логирования.
 *
 * @constructor
 * @param {{}} [out] Функции вывода сообщений
 * @param {function} [out.log] Логирование
 * @param {function} [out.info] Информирование
 * @param {function} [out.warn] Предупреждение
 * @param {function} [out.error] Ошибки
 * @param {{}} [colors] Цвета для вывода сообщений {@link https://github.com/medikoo/cli-color#colors}
 * @param {string} [colors.time] Время начала операции
 * @param {string} [colors.bracket] Скобки
 * @param {string} [colors.log] Логирование операции
 * @param {string} [colors.info] Информирование об операции
 * @param {string} [colors.warn] Предупреждение в операции
 * @param {string} [colors.error] Ошибка в операции
 * @param {string} [colors.path] Путь до файла или директории
 * @param {string} [colors.text] Сообщение
 * @param {string} [colors.description] Пояснение
 * @param {string} [colors.total] Длительность операции
 */
function Log(out, colors) {

    /**
     * Функции вывода сообщений.
     *
     * @type {{}}
     */
    this.out = out || {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    };

    /**
     * Цвета для вывода сообщений.
     *
     * @type {{}}
     */
    this.colors = _.defaults(colors || {}, {
        time: 'blackBright',
        bracket: 'white',

        log: 'cyan',
        info: 'green',
        warn: 'yellow',
        error: 'red',

        path: 'blueBright',
        text: 'whiteBright',
        description: 'blackBright',

        total: 'red'
    });
}

Log.prototype = {

    /**
     * Вывести логирующее сообщение.
     *
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    log: function(message) {
        return this.print('log', message);
    },

    /**
     * Вывести информационное сообщение.
     *
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    info: function(message) {
        return this.print('info', message);
    },

    /**
     * Вывести предупреждающее сообщение.
     *
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    warn: function(message) {
        return this.print('warn', message);
    },

    /**
     * Вывести сообщение об ошибке.
     *
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    error: function(message) {
        return this.print('error', message);
    },

    /**
     * Шаблон строки для вывода.
     *
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    pattern: function(message) {
        if(typeof message === 'string') {
            return message;
        }

        var line = [];

        if(message.operation) {
            line.push(this.brackets(message.operation));
        }

        if(message.path) {
            line.push(this.brackets(message.path));
        }

        if(message.text) {
            line.push(message.text);
        }

        if(message.description) {
            line.push(message.description);
        }

        if(message.total) {
            line.push(message.total + clicolor[this.colors.total]('ms'));
        }

        return line.join(' ');
    },

    /**
     * Напечатать сообщение.
     *
     * @param {string} type Тип сообщения
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    print: function(type, message) {
        var line = this.pattern(this.colorize(type, message));

        if(this.out[type]) {
            this.out[type](line);
        }

        return line;
    },

    /**
     * Раскрасить поля сообщения.
     *
     * @param {string} type Тип сообщения
     * @param {Log~Message} message Сообщение
     * @returns {string|Log~Message}
     */
    colorize: function(type, message) {
        if(typeof message === 'string') {
            return clicolor[this.colors[type]](message);
        } else if(message.operation) {
            message.operation = clicolor[this.colors[type]](message.operation);
        }

        return Object.keys(message).reduce(function(colored, key) {
            colored[key] = this.colors[key] ? clicolor[this.colors[key]](message[key]) : message[key];
            return colored;
        }.bind(this), {});
    },

    /**
     * Обрамить строку квадратными скобками.
     *
     * @param {string} content Строка
     * @returns {string}
     */
    brackets: function(content) {
        return [
            clicolor[this.colors.bracket]('[') +
            content +
            clicolor[this.colors.bracket](']')
        ].join('');
    }

};

module.exports = Log;
