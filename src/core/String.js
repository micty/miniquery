
/**
* 字符串工具类
* @class
*/
define('core/String', function (require, module, exports) {

    module.exports = exports = { /**@lends MiniQuery.String */

        /**
        * 用指定的值去填充一个字符串。
        * 当不指定字符串的填充标记时，则默认为 {}。
        * @param {String} string 要进行格式填充的字符串模板。
        * @param {Object} obj 要填充的键值对的对象。
        * @return 返回一个用值去填充后的字符串。
        * @example
            $String.format('{id}{type}', {id: 1, type: 'app'});
            $String.format('{2}{0}{1}', 'a', 'b', 'c');
        */
        format: function (string, obj, arg2) {
            var s = string;
            var replaceAll = exports.replaceAll;

            if (typeof obj == 'object') {
                for (var key in obj) {
                    s = replaceAll(s, '{' + key + '}', obj[key]);
                }
            }
            else {
                var args = [].slice.call(arguments, 1);
                for (var i = 0, len = args.length; i < len; i++) {
                    s = replaceAll(s, '{' + i + '}', args[i]);
                }
            }

            return s;
        },



        /**
        * 对字符串进行全局替换。
        * @param {String} target 要进行替换的目标字符串。
        * @param {String} src 要进行替换的子串，旧值。
        * @param {String} dest 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。
        * @example
            $String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
        */
        replaceAll: function (target, src, dest) {
            return target.split(src).join(dest);
        },


        /**
        * 对字符串进行区间内的替换。
        * 该方法会把整个区间替换成新的字符串，包括区间标记。
        * @param {String} string 要进行替换的目标字符串。
        * @param {String} startTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记
        * @param {String} newString 要进行替换的新子串，新值。
        * @return {String} 返回一个替换后的字符串。<br />
        *   当不存在开始标记或结束标记时，都会不进行任何处理而直接返回原字符串。
        * @example
            $String.replaceBetween('hello #--world--# this is #--good--#', '#--', '--#', 'javascript') 
            //结果为 'hello javascript this is javascript'
        */
        replaceBetween: function (string, startTag, endTag, newString) {
            var startIndex = string.indexOf(startTag);
            if (startIndex < 0) {
                return string;
            }

            var endIndex = string.indexOf(endTag);
            if (endIndex < 0) {
                return string;
            }

            var prefix = string.slice(0, startIndex);
            var suffix = string.slice(endIndex + endTag.length);

            return prefix + newString + suffix;
        },


        /**
        * 移除指定的字符子串。
        * @param {String} target 要进行替换的目标字符串。
        * @param {String|Array} src 要进行移除的子串。
            支持批量的形式，传一个数组。
        * @return {String} 返回一个替换后的字符串。
        * @example
            $String.removeAll('hi js hi abc', 'hi') 
            //结果为 ' js  abc'
        */
        removeAll: function (target, src) {

            var $Object = require('Object');
            var $Array = require('Array');
            var replaceAll = exports.replaceAll;

            if ($Object.isArray(src)) {
                $Array.each(src, function (item, index) {
                    target = replaceAll(target, item, '');
                });
                return target;
            }

            return replaceAll(target, src, '');
        },

        /**
        * 从当前 String 对象移除所有前导空白字符和尾部空白字符。
        * @param {String} 要进行操作的字符串。
        * @return {String} 返回一个新的字符串。
        * @expample
            $String.trim('  abc def mm  '); //结果为 'abc def mm'
        */
        trim: function (string) {
            return string.replace(/(^\s*)|(\s*$)/g, '');
        },

        /**
        * 从当前 String 对象移除所有前导空白字符。
        * @param {String} 要进行操作的字符串。
        * @return {String} 返回一个新的字符串。
        * @expample
            $String.trimStart('  abc def mm '); //结果为 'abc def mm  '
        */
        trimStart: function (string) {
            return string.replace(/(^\s*)/g, '');
        },

        /**
        * 从当前 String 对象移除所有尾部空白字符。
        * @param {String} 要进行操作的字符串。
        * @return {String} 返回一个新的字符串。
        * @expample
            $String.trimEnd('  abc def mm '); //结果为 '  abc def mm'
        */
        trimEnd: function (string) {
            return string.replace(/(\s*$)/g, '');
        },

        /**
        * 右对齐此实例中的字符，在左边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} string 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
            $String.padLeft('1234', 6, '0'); //结果为 '001234'，右对齐，从左边填充 '0'
            $String.padLeft('1234', 2, '0'); //结果为 '34'，右对齐，从左边开始截断
        */
        padLeft: function (string, totalWidth, paddingChar) {
            string = String(string); //转成字符串

            var len = string.length;
            if (totalWidth <= len) { //需要的长度短于实际长度，做截断处理
                return string.substr(-totalWidth); //从后面算起
            }

            paddingChar = paddingChar || ' ';

            var arr = [];
            arr.length = totalWidth - len + 1;

            return arr.join(paddingChar) + string;
        },


        /**
        * 左对齐此字符串中的字符，在右边用指定的 Unicode 字符填充以达到指定的总长度。
        * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
        * @param {String} string 要进行填充对齐的字符串。
        * @param {Number} totalWidth 填充后要达到的总长度。
        * @param {String} paddingChar 用来填充的模板字符串。
        * @return {String} 返回一个经过填充对齐后的新字符串。
        * @example
            $String.padLeft('1234', 6, '0'); //结果为 '123400'，左对齐，从右边填充 '0'
            $String.padLeft('1234', 2, '0'); //结果为 '12'，左对齐，从右边开始截断
        */
        padRight: function (string, totalWidth, paddingChar) {
            string = String(string); //转成字符串

            var len = string.length;
            if (len >= totalWidth) {
                return string.substring(0, totalWidth);
            }

            paddingChar = paddingChar || ' ';

            var arr = [];
            arr.length = totalWidth - len + 1;


            return string + arr.join(paddingChar);
        },

        /**
        * 获取位于两个标记子串之间的子字符串。
        * @param {String} string 要进行获取的大串。
        * @param {String} beginTag 区间的开始标记。
        * @param {String} endTag 区间的结束标记。
        * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
        * @example
            $String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello' 
        */
        between: function (string, beginTag, endTag) {
            var startIndex = string.indexOf(beginTag);
            if (startIndex < 0) {
                return '';
            }

            startIndex += beginTag.length;

            var endIndex = string.indexOf(endTag, startIndex);
            if (endIndex < 0) {
                return '';
            }

            return string.substr(startIndex, endIndex - startIndex);
        },

        /**
        * 产生指定格式或长度的随机字符串。
        * @param {string|int} [formater=12] 随机字符串的格式，或者长度（默认为12个字符）。
            格式中的每个随机字符用 'x' 来占位，如 'xxxx-1x2x-xx'
        * @return {string} 返回一个指定长度的随机字符串。
        * @example
            $String.random();      //返回一个 12 位的随机字符串
            $String.random(64);    //返回一个 64 位的随机字符串
            $String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
        */
        random: function (formater) {
            if (formater === undefined) {
                formater = 12;
            }

            //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
            if (typeof formater == 'number') {
                var size = formater + 1;
                if (size < 0) {
                    size = 0;
                }
                formater = [];
                formater.length = size;
                formater = formater.join('x');
            }

            return formater.replace(/x/g, function (c) {
                var r = Math.random() * 16 | 0;
                return r.toString(16);
            }).toUpperCase();
        },

        //---------------判断部分 -----------------------------------------------------

        /**
        * 确定一个字符串的开头是否与指定的字符串匹配。
        * @param {String} str 要进行判断的大字符串。
        * @param {String} dest 要进行判断的子字符串，即要检测的开头子串。
        * @param {boolean} [ignoreCase=false] 指示是否忽略大小写。默认不忽略。
        * @return {boolean} 返回一个bool值，如果大串中是以小串开头，则返回 true；否则返回 false。
        * @example
            $String.startsWith('abcdef', 'abc') //结果为 true。
            $String.startsWith('abcdef', 'Abc', true) //结果为 true。
        */
        startsWith: function (str, dest, ignoreCase) {
            if (ignoreCase) {
                var src = str.substring(0, dest.length);
                return src.toUpperCase() === dest.toString().toUpperCase();
            }

            return str.indexOf(dest) == 0;
        },


        /**
        * 确定一个字符串的末尾是否与指定的字符串匹配。
        * @param {String} str 要进行判断的大字符串。
        * @param {String} dest 要进行判断的子字符串，即要检测的末尾子串。
        * @param {boolean} [ignoreCase=false] 指示是否忽略大小写。默认不忽略。
        * @return {boolean} 返回一个bool值，如果大串中是以小串结尾，则返回 true；否则返回 false。
        * @example
            $String.endsWith('abcdef', 'def') //结果为 true。
            $String.endsWith('abcdef', 'DEF', true) //结果为 true。
        */
        endsWith: function (str, dest, ignoreCase) {
            var len0 = str.length;
            var len1 = dest.length;
            var delta = len0 - len1;

            if (ignoreCase) {
                var src = str.substring(delta, len0);
                return src.toUpperCase() === dest.toString().toUpperCase();
            }

            return str.lastIndexOf(dest) == delta;
        },

        /**
        * 检测一个字符串是否包含指定的子字符串。
        * @param {String} src 要进行检测的大串。
        * @param {String} target 要进行检测模式子串。
        * @return {boolean} 返回一个 bool 值。如果大串中包含模式子串，则返回 true；否则返回 false。
        * @example
            $String.contains('javascript is ok', 'scr');    //true
            $String.contains('javascript is ok', 'iis');    //false
        */
        contains: function (src, target, useOr) {

            var $Object = require('Object');
            var $Array = require('Array');

            src = String(src);

            if ($Object.isArray(target)) {

                var existed;

                if (useOr === true) { // or 关系，只要有一个存在，则结果为 true
                    existed = false;
                    $Array.each(target, function (item, index) {
                        existed = src.indexOf(item) > -1;
                        if (existed) {
                            return false; //break;
                        }
                    });
                }
                else { // and 关系，只要有一个不存在，则结果为 false
                    existed = true;
                    $Array.each(target, function (item, index) {
                        existed = src.indexOf(item) > -1;
                        if (!existed) {
                            return false; //break;
                        }
                    });
                }

                return existed;
            }

            return src.indexOf(target) > -1;
        },

        //---------------转换部分 -----------------------------------------------------

        /**
        * 把一个字符串转成骆驼命名法。。
        * 如 'font-size' 转成 'fontSize'。
        * @param {String} string 要进行转换的字符串。
        * @return 返回一个骆驼命名法的新字符串。
        * @example
            $String.toCamelCase('background-item-color') //结果为 'backgroundItemColor'
        */
        toCamelCase: function (string) {
            var rmsPrefix = /^-ms-/;
            var rdashAlpha = /-([a-z]|[0-9])/ig;

            return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, function (all, letter) {
                return letter.toString().toUpperCase();
            });

            /* 下面的是 mootool 的实现
            return string.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
            */
        },

        /**
        * 把一个字符串转成短线连接法。
        * 如 fontSize 转成 font-size
        * @param {String} string 要进行转换的字符串。
        * @return 返回一个用短线连接起来的新字符串。
        * @example
            $String.toHyphenate('backgroundItemColor') //结果为 'background-item-color'
        */
        toHyphenate: function (string) {
            return string.replace(/[A-Z]/g, function (match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        },

        /**
        * 把一个字符串转成 UTF8 编码。
        * @param {String} string 要进行编码的字符串。
        * @return {String} 返回一个 UTF8 编码的新字符串。
        * @example
            $String.toUtf8('你好'); //结果为 ''
        */
        toUtf8: function (string) {

            var $Array = require('Array');
            var a = [];

            $Array.each(string.split(''), function (ch, index) {
                var code = ch.charCodeAt(0);
                if (code < 0x80) {
                    a.push(code);
                }
                else if (code < 0x800) {
                    a.push(((code & 0x7C0) >> 6) | 0xC0);
                    a.push((code & 0x3F) | 0x80);
                }
                else {
                    a.push(((code & 0xF000) >> 12) | 0xE0);
                    a.push(((code & 0x0FC0) >> 6) | 0x80);
                    a.push(((code & 0x3F)) | 0x80);
                }
            });

            return '%' + $Array.keep(a, function (item, index) {
                return item.toString(16);
            }).join('%');
        },


        /**
        * 把一个字符串转成等价的值。
        * 主要是把字符串形式的 0|1|true|false|null|undefined|NaN 转成原来的数据值。
        * 当参数不是字符串或不是上述值之一时，则直接返回该参数，不作转换。
        * @param {Object} value 要进行转换的值，可以是任何类型。
        * @return {Object} 返回一个等价的值。
        * @example
            $String.toValue('NaN') //NaN
            $String.toValue('null') //null
            $String.toValue('true') //true
            $String.toValue('false') //false
            $String.toValue({}) //不作转换，直接原样返回
        */
        toValue: function (value) {
            if (typeof value != 'string') { //拦截非字符串类型的参数
                return value;
            }

            var maps = {
                //'0': 0,
                //'1': 1,
                'true': true,
                'false': false,
                'null': null,
                'undefined': undefined,
                'NaN': NaN
            };

            return value in maps ? maps[value] : value;

        },

        //---------------分裂和提取部分 -----------------------------------------------------

        /**
        * 对一个字符串进行多层次分裂，返回一个多维数组。
        * @param {String} string 要进行分裂的字符串。
        * @param {Array} separators 分隔符列表数组。
        * @return {Array} 返回一个多维数组，该数组的维数，跟指定的分隔符 separators 的长度一致。
        * @example
            var string = 'a=1&b=2|a=100&b=200;a=111&b=222|a=10000&b=20000';
            var separators = [';', '|', '&', '='];
            var a = $String.split(string, separators);
            //结果 a 为
            a = 
            [                           // ';' 分裂的结果
                [                       // '|'分裂的结果
                    [                   // '&'分裂的结果
                        ['a', '1'],     // '='分裂的结果
                        ['b', '2']
                    ],
                    [
                        ['a', '100'],
                        ['b', '200']
                    ]
                ],
                [
                    [
                        ['a', '111'],
                        ['b', '222']
                    ],
                    [
                        ['a', '10000'],
                        ['b', '20000']
                    ]
                ]
            ];
        * 
        */
        split: function (string, separators) {

            var $Array = require('Array');

            var list = String(string).split(separators[0]);

            for (var i = 1, len = separators.length; i < len; i++) {
                list = fn(list, separators[i], i);
            }

            return list;


            //一个内部方法
            function fn(list, separator, dimension) {
                dimension--;

                return $Array.map(list, function (item, index) {

                    return dimension == 0 ?
                            String(item).split(separator) :
                            fn(item, separator, dimension); //递归
                });
            }


        },


        /**
        * 用滑动窗口的方式创建分组，返回一个子串的数组。
        * @param {string|number} string 要进行分组的字符串。会调用 String(string) 转成字符串。
        * @param {number} windowSize 滑动窗口的大小。
        * @param {number} [stepSize=1] 滑动步长。默认为1。
        * @return {Array} 返回一个经过滑动窗口方式得到的子串数组。
        * @example
        *   $String.slide('012345678', 4, 3); //滑动窗口大小为4，滑动步长为3
            //得到 [ '0123', '3456', '678' ] //最后一组不足一组
        */
        slide: function (string, windowSize, stepSize) {

            var $Array = require('Array');

            var chars = String(string).split(''); //按字符切成单个字符的数组
            chars = $Array.slide(chars, windowSize, stepSize);

            return $Array.keep(chars, function (group, index) {
                return group.join('');
            });

        },

        /**
        * 对一个字符串进行分段，返回一个分段后的子串数组。
        * @param {string|number} string 要进行分段的字符串。会调用 String(string) 转成字符串。
        * @param {number} size 分段的大小。
        * @return {Array} 返回一个分段后的子串数组。
        * @example
        *   $String.segment('0123456789', 3); //进行分段，每段大小为3
            //得到 [ '012', '345', '678', '9' ] //最后一组不足一组
        */
        segment: function (string, size) {
            return exports.slide(string, size, size);
        },


        /**
        * 对一个字符串进行多层级模板解析，返回一个带有多个子名称的模板。
        * @param {string} text 要进行解析的模板字符串。
        * @param {Array} tags 多层级模板中使用的标记。
        * @return {Object} 返回一个带有多个子名称的模板。
        */
        getTemplates: function (text, tags) {

            var $Array = require('Array');

            var item0 = tags[0];

            //缓存一下，以提高 for 中的性能
            var between = exports.between;
            var replaceBetween = exports.replaceBetween;


            var samples = {};

            //先处理最外层，把大字符串提取出来。 因为内层的可能在总字符串 text 中同名
            var s = between(text, item0.begin, item0.end);

            //倒序处理子模板。 注意: 最外层的不在里面处理
            $Array.each(tags.slice(1).reverse(), function (item, index) {

                var name = item.name || index;
                var begin = item.begin;
                var end = item.end;

                var fn = item.fn;

                var sample = between(s, begin, end);

                if ('outer' in item) { //指定了 outer
                    s = replaceBetween(s, begin, end, item.outer);
                }

                if (fn) { //指定了处理函数
                    sample = fn(sample, item);
                }

                samples[name] = sample;

            });

            var fn = item0.fn;
            if (fn) { //指定了处理函数
                s = fn(s, item0);
            }

            samples[item0.name] = s; //所有的子模板处理完后，就是最外层的结果

            return samples;

        },

        /**
        * 获取一个字符串的字节长度。
        * 普通字符的字节长度为 1；中文等字符的字节长度为 2。
        * @param {string} s 要进行解析的字符串。
        * @return {Number} 返回参数字符串的字节长度。
        */
        getByteLength: function (s) {
            if (!s) {
                return 0;
            }

            return s.toString().replace(/[\u0100-\uffff]/g, '  ').length;
        }
    };




});


define('String', function (require, module, exports) {
    module.exports = require('core/String');

});




