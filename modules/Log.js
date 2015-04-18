const _ = require('lodash'),
    clicolor = require('cli-color'),
    moment = require('moment'),
    Cli = require('./Cli');

/**
 * Сообщение.
 *
 * Может быть обычной строкой или хеш-картой.
 *
 * @typedef {string|{}} Log~Message
 * @property {string} [operation] Выполняемая операция
 * @property {string} [path] Путь до файла или директории
 * @property {string} [text] Сообщение
 * @property {string} [description] Пояснение
 * @property {number} [total] Длительность операции (мс)
 */

/**
 * Опции.
 *
 * @typedef {{}} Log~Options
 * @property {boolean} [relativePath=true] Печатать пути относительно текущей рабочей директории
 */

/**
 * Функция-шаблон.
 *
 * @callback Log~patternCallback
 * @this Log
 * @param {Log~Message} message Сообщение
 * @returns {string}
 */

/**
 * Модуль логирования.
 *
 * @class
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

    /**
     * Модуль cli-color.
     *
     * @type {cli-color}
     */
    this.clicolor = clicolor;

    /**
     * Модуль moment.
     *
     * @type {moment}
     */
    this.moment = moment;

    /**
     * Функции-шаблоны стандартных типов сообщений.
     *
     * @private
     * @type {{}}
     */
    this._patterns = {
        log: this._defaultPattern,
        info: this._defaultPattern,
        warn: this._defaultPattern,
        error: this._defaultPattern
    };

    this.options({});
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
     * Установить/получить опции.
     *
     * @param {Log~Options} [options] Опции
     * @returns {Log|Log~Options}
     */
    options: function(options) {
        if(!options) {
            return this._options;
        }

        this._options = _.defaults(options, this._options || {
            relativePath: true
        });
        return this;
    },

    /**
     * Зарегистрировать тип сообщений.
     *
     * @param {string} type Имя типа
     * @param {Log~patternCallback} pattern Функция-шаблон
     * @returns {Log}
     */
    register: function(type, pattern) {
        this._patterns[type] = pattern;
        return this;
    },

    /**
     * Напечатать сообщение.
     *
     * @param {string} type Тип сообщения
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    print: function(type, message) {
        var line = this._patterns[type].call(this, this.colorize(type, this.resolveRelativePath(message)));

        if(this.out[type]) {
            this.out[type](line);
        }

        return line;
    },

    /**
     * Получить относительный путь сообщения
     * при наличии соответствующей опции.
     *
     * @param {Log~Message} message Сообщение
     * @returns {Log~Message}
     */
    resolveRelativePath: function(message) {
        if(message.path && this._options.relativePath) {
            message.path = Cli.resolveRelativePath(message.path);
        }
        return message;
    },

    /**
     * Раскрасить поля сообщения.
     *
     * @param {string} type Тип сообщения
     * @param {Log~Message} message Сообщение
     * @returns {Log~Message}
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
    },

    /**
     * Шаблон строки для вывода.
     *
     * @private
     * @param {Log~Message} message Сообщение
     * @returns {string}
     */
    _defaultPattern: function(message) {
        if(typeof message === 'string') {
            return message;
        }

        var line = [this.clicolor[this.colors.time](this.moment().format('HH:mm:ss.SSS') + ' -')];

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
            line.push(message.total + this.clicolor[this.colors.total]('ms'));
        }

        return line.join(' ');
    }

};

module.exports = Log;
