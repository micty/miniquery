
/**
* 带数据类型的 XML 工具类
* @namespace
*/

define('DataTypeXML', function (require, module, exports) {


    var defaults = {

        //typeof 的值
        'string': '<string name="{key}">{value}</string>',
        'number': '<int name="{key}">{value}</int>',
        'boolean': '<bool name="{key}">{value}</bool>',
        'function': '<function name="{key}">{value}</function>',

        'object': '<object name="{key}">{value}</object>',

        //'undefined': '', //这个用不到

        //构造器
        'Array': '<array name="{key}">{value}</array>',
        'Date': '<date name="{key}">{value}</date>',

        //顶层
        'root': '<object>{value}</object>'
    };

    var templates = null;



    /**
    * 根据键和值，获取相应的 XML 字符串。
    * @inner
    */
    function getXml(key, value) {

        if (value == null) { // 拦截 null 或 undefined
            return '';
        }

        var $String = require('String');

        var type = typeof value;
        var sample = templates[type];

        if (type != 'object') { // string、number、boolean、function 会进入
            return sample ? $String.format(sample, {
                key: key,
                value: value.toString()
            }) : '';
        }


        //以下是 type == 'object' 会进入的分支

        var $Object = require('Object');
        var $Array = require('Array');

        var getXml = arguments.callee; //递归要用到：引用自身，避免外部改名而影响到内部的使用

        if ($Object.isArray(value)) { // value 是一个数组

            return $String.format(templates['Array'], {

                key: key,

                value: $Array.map(value, function (item, index) { // map 中的 value 就是一个数组

                    var key = index;
                    var value = item;

                    return getXml(key, value);

                }).join('')
            });
        }

        //针对一些内置的对象类，获取构造器名称，如 Date、RegExp 等
        type = $Object.getType(value);
        sample = templates[type];

        if (sample) {
            return $String.format(sample, {
                key: key,
                value: value.toString() //这里简单处理
            });
        }


        return $String.format(templates['object'], {

            key: key,

            value: $Object.isPlain(value) ? $Object.toArray(value, function (key, value) {
                return getXml(key, value);

            }).join('') : value.toString()
        });

    }


    /**
    * 即根据类型和相应的列表，转换成键值对的 Object 对象
    * @inner
    */
    function getObject(type, list) {

        var $Object = require('Object');
        var $Array = require('Array');
        var $Boolean = require('Boolean');
        var $Date = require('Date');

        var fn = arguments.callee; //引用自身，递归用到
        var obj = {};

        var fns = {

            'string': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = item.value.toString();
                });
            },

            'int': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = Number(item.value);
                });
            },

            'bool': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = $Boolean.parse(item.value);
                });
            },

            'function': function () {
                $Array.each(list, function (item, index) {
                    var f = new Function('return ' + item.value); //创建一个函数
                    obj[item.name] = f();
                });
            },

            'date': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = $Date.parse(item.value);
                });
            },

            'array': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = [];

                    $Object.each(item, function (type, list) {
                        if (type == 'name') {
                            return true; //continue
                        }

                        var o = fn(type, list);
                        $Object.extend(obj[item.name], o); //合并到 a 中，这样 o 中的 key 刚好是 a 中的索引

                    });
                });
            },

            'object': function () {
                $Array.each(list, function (item, index) {
                    obj[item.name] = {};

                    $Object.each(item, function (type, list) {
                        if (type == 'name') {
                            return true;
                        }

                        var o = fn(type, list);
                        $Object.extend(obj[item.name], o);
                    });
                });
            }
        };

        (fns[type])();



        return obj;

    }



    module.exports = exports = /**@lendsDataTypeXML*/ {

        /**
        * 把一个 XMLDocument 对象或一个 XML 节点或一个 Object 对象解析成等价的 XML 字符串。
        *
        * 注意：当未指定第二个参数 templates 时，
        *           传入的 Object 对象中，简单属性表示该节点自身的属性；
        *           数组表示该节点的子节点集合；
        *           属性值只能是 string、number、boolean 三种值类型。
        */
        toString: function (obj, tmpl) {

            var $Object = require('Object');

            //合并参数指定的模板(如果有)
            templates = $Object.extend({}, defaults, tmpl);

            return $String.format(templates['root'],
            {
                value: $Object.toArray(obj, function (key, value) {
                    return getXml(key, value);

                }).join('')
            });
        },


        /**
        * 把一个 XML 字符串或 XMLDocument 对象或 XML 节点解析成等价结构的 Object 对象
        * 
        * 注意：表示 XML 节点中的属性名不能跟直接子节点中的任何一个节点名相同。
        * 返回的 Object 对象中，属性表示该节点自身的属性；数组表示该节点的子节点集合。
        */
        toObject: function (data) {

            var $Object = require('Object');
            var Xml = require('Xml');

            var xmlObj = Xml.toObject(data); //把字符串解析成标准的 Object
            for (var key in xmlObj) //只取第一个成员，其实就是 xmlObj['object']，这样写是为了通用性
            {
                xmlObj = xmlObj[key];
                break;
            }

            var obj = {};
            $Object.each(xmlObj, function (type, list) {
                var o = getObject(type, list);
                $Object.extend(obj, o);

            });

            return obj;
        }
    };


});

