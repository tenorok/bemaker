# Bemaker — сборщик БЭМ-проекта

БЭМ — это методология эффективной разработки веб-приложений.
Большое количество информации размещено на официальном сайте [http://ru.bem.info](http://ru.bem.info).

Bemaker стремится воплотить наиболее простой
способ сборки проекта в БЭМ-терминах.

## Установка

    npm install bemaker

## Файловая структура проекта

Bemaker неприхотлив к файловой структуре, насколько это возможно.

Наряду с обычными файлами, в сборке так же участвуют [символьные ссылки](https://ru.wikipedia.org/wiki/Символьная_ссылка).

Ожидается, что имеется директория, хранящая в себе директории блоков,
внутри каждой из которых располагаются файлы блока в произвольной иерархии.

Например:

    blocks/
        button/
            button.js
            button.css
        input/
            input.js
            input.css

Для указания директорий с блоками используется
[опция `directories`](#Опция--d---directories-dirdirn).

#### Элементы и модификаторы

В именах файлов элементов и модификаторов можно не указывать имя блока,
сборщик достроит его самостоятельно исходя из директории блока.

Например:

    blocks/
        input/
            input.js
            __label.js     // input__label.js
            _size_s.css    // input_size_s.css

#### Порядок подключения файлов

Для каждого файла рассчитывается вес, по которому в дальнейшем будет
определяться приоритет его подключения среди прочих файлов блока.

Вес файла рассчитывается с помощью [метода `weight` модуля `Selector`
БЭМ-шаблонизатора Bemer](http://tenorok.github.io/bemer/jsdoc/module-Selector-Selector.html#weight).

В общем виде порядок подключения файлов следующий:

1. `block`
2. `block_mod`
3. `block_mod_val`
4. `block__elem`
5. `block_mod__elem`
6. `block_mod_val__elem`
7. `block__elem_mod`
8. `block__elem_mod_val`
9. `block_mod__elem_mod_val`
10. `block_mod_val__elem_mod_val`

Поддерживается возможность использования звёздочек вместо частей БЭМ-имён,
что удобно для выделения общего кода в одном месте.
У имён со звёздочками приоритет ниже, чем у имён без звёздочек.

Примеры имён со звёздочками: `block_mod_*`, `block__*` и так далее.

#### Иерархия файлов блока

Bemaker перебирает все файлы внутри директории блока
вне зависимости от иерархии вложенности.

Например, в отличии от примера, приведённого выше,
можно положить файлы элемента и модификатора в дополнительные директории:

    blocks/
        input/
            input.js
            __label/
                __label.js
            _size/
                _size_s.css

#### Уровни переопределения

В проекте может быть несколько директорий с блоками,
тогда эти директории называются уровнями переопределения.

Смысл заключается в том, что bemaker будет собирать файлы блоков
сначала с одного уровня, а затем со следующих в заданном порядке.

Это позволяет контролировать порядок наследования скриптов
и переопределения стилей блоков.

Например, блоки могут быть разложены по уровням переопределения,
соответствующим платформам устройств пользователя:

    common/              // общая реализация блоков
        input/
            input.css
    phone/               // уточнения для телефонов
        input/
            input.css    // переопределяем стили для телефонов

## Указание зависимостей

Некоторые блоки основаны на реализации других блоков, для указания
связей между ними предусмотрена возможность записи зависимостей.

Зависимости записываются в JSDoc-формате.

По умолчанию поиск зависимостей осуществляется в js-файлах
и тегах `@bemaker`, указанных где-либо в JSDoc.
В одном теге можно указать только один блок.

Например, файл `select.js` говорит о том,
что блок `select` зависит от блоков `button` и `popup`:

    /**
     * @bemaker button
     * @bemaker popup
     */

Для изменения расширения файлов с зависимостями используется
[опция `dependext`](#Опция---dependext-extjs).

Для изменения имени JSDoc-тега используется
[опция `jsdoctag`](#Опция---jsdoctag-tagbemaker).

## Использование в терминале

После установки из `npm` будет доступен
исполняемый файл: `./node_modules/.bin/bemaker`.

### Команды

#### Команда `make`

С помощью команды `make` запускается сборка проекта.
Для уточнения деталей сборки используются опции.

### Опции

#### Опция `-h, --help`

Вывести справку по использованию `bemaker` в терминале:

    $ bemaker --help

Вывести справку по команде `make`:

    $ bemaker make --help

#### Опция `-V, --version`

Вывести используемую версию `bemaker`.

#### Опция `-c, --config <file=bemaker.json>`

Опция указывает на конфигурационный файл,
содержащий все возможные опции сборки в JSON-формате.

Если директория, в которой выполняется запуск команды,
содержит файл `bemaker.json` — сборщик использует его
как конфигурационный файл автоматически.

В следующем примере указывается конфигурационный файл:

    $ bemaker make -c path/to/myconfig.json

В конфигурационном файле пути до директорий и файлов
следует указывать относительно расположения конфигурационного файла.

Опции, введённые в командной строке имеют приоритет
над опциями из конфигурационного файла.

#### Опция `-d, --directories <dir,dirN>`

Опция указывает одну или несколько
[директорий с блоками](#Файловая-структура-проекта).

Сборщик ничего не соберёт без указания расположения блоков.

Следующий пример задаёт сборку блоков из директорий `common` и `phone`:

    $ bemaker make -d common,phone

Идентичный пример в конфигурационном файле:

```json
{
    "directories": ["common", "phone"]
}
```

#### Опция `-O, --outname <name>`

Опция указывает имя сохраняемых файлов.

По умолчанию файлы сохраняются без имени, только с расширением.

Следующий пример задаёт сохраняемым файлам имя `all`:

    $ bemaker make -O all

Идентичный пример в конфигурационном файле:

```json
{
    "outname": "all"
}
```

#### Опция `-o, --outdir <dir=.>`

Опция указывает директорию для сохраняемых файлов.
Если указанная директория не существует — она будет создана автоматически.

По умолчанию файлы сохраняются в текущую директорию.

Следующий пример задаёт директорию `bundle` для сохраняемых файлов:

    $ bemaker make -o bundle

Идентичный пример в конфигурационном файле:

```json
{
    "outdir": "bundle"
}
```

#### Опция `-e, --extensions <.ext,.extN>`

Опция указывает одно или несколько расширений для сохраняемых файлов.

По умолчанию сохраняются все найденные расширения.

Следующий пример задаёт к сохранению расширения `.js` и `.css`:

    $ bemaker make -e .js,.css

Идентичный пример в конфигурационном файле:

```json
{
    "extensions": [".js", ".css"]
}
```

#### Опция `-b, --blocks <block,blockN>`

Опция указывает имя одного или нескольких блоков, которые необходимо собрать.

По умолчанию в сборку включаются все найденные блоки.

Следующий пример задаёт к сборке только блоки `button` и `input`:

    $ bemaker make -b button,input

Идентичный пример в конфигурационном файле:

```json
{
    "blocks": ["button", "input"]
}
```

#### Опция `--dependext <ext=.js>`

Опция указывает расширение файлов, в которых
сборщику следует искать [зависимости](#Указание-зависимостей) блоков.

По умолчанию поиск зависимостей осуществляется в файлах с расширением `.js`.

Следующий пример задаёт поиск зависимостей в файлах `.deps.js`:

    $ bemaker make --dependext .deps.js

Идентичный пример в конфигурационном файле:

```json
{
    "dependext": ".deps.js"
}
```

#### Опция `--jsdoctag <tag=bemaker>`

Опция указывает имя JSDoc-тега, в котором сборщику следует
читать [зависимости](#Указание-зависимостей) блоков.

По умолчанию чтение зависимостей осуществляется в теге `@bemaker`.

Следующий пример задаёт чтение зависимостей в теге `@deps`:

    $ bemaker make --jsdoctag deps

Идентичный пример в конфигурационном файле:

```json
{
    "jsdoctag": "deps"
}
```

#### Опция `--no-before`

Опция отменяет установку комментария перед содержимым каждого файла.

По умолчанию в собранном файле перед содержимым каждого файла устанавливается такого вида комментарий:

    /* before: blocks/button/button.css */

Следующий пример отменяет установку комментария:

    $ bemaker make --no-before

Идентичный пример в конфигурационном файле:

```json
{
    "before": false
}
```

#### Опция `--no-after`

Опция отменяет установку комментария после содержимого каждого файла.

По умолчанию в собранном файле после содержимого каждого файла устанавливается такого вида комментарий:

    /* after: blocks/button/button.css */

Следующий пример отменяет установку комментария:

    $ bemaker make --no-after

Идентичный пример в конфигурационном файле:

```json
{
    "after": false
}
```

#### Опция `-v, --verbose <mod,modN>`

В процессе сборки выводятся различные типы сообщений.

По умолчанию выводятся все типы сообщений.
Опция `verbose` позволяет настроить вывод только некоторых типов.

Выводимые сообщения делятся на следующие типы:

1. `log` — информация о процессе сборки (синим цветом)
2. `info` — сообщение о результате сборки (зелёным)
3. `warn` — предупреждения (жёлтым)
4. `error` — ошибки (красным)

Следующий пример будет выводить только предупреждения и ошибки:

    $ bemaker make -v warn,error

Идентичный пример опции в конфигурационном файле:

```json
{
    "verbose": ["warn", "error"]
}
```
