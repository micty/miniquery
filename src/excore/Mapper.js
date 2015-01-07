



/**
* 映射器工具类。
* 实现任意类型的两个变量的关联。
* @class
* @param
* @example
    var mapper = new $.Mapper();
*/


define('Mapper', function (require, module, exports) {

    var $ = require('$');
    var $String = require('String');


    var guidKey = '__guid__' + $String.random();
    var guid$type$object = {}; //容纳所有 Mapper 实例的数据


    /**@inner*/
    function Mapper(key, value) {

        //分配本实例对应的容器
        var guid = $String.random();
        this[guidKey] = guid;

        guid$type$object[guid] = {
            'guid': {},     //针对有 guid 属性的对象作特殊存取，以求一步定位。
            'false': {},    //针对 false|null|undefined|''|0|NaN
            'string': {},
            'number': {},
            'boolean': {}, //只针对 true
            'object': {},
            'function': {},
            'undefined': {} //这个用不到
        };

        if (arguments.length > 0) { //这里不要判断 key，因为 key 可以为任何值。
            this.set(key, value);
        }
    }



    function getString(obj) {

        //函数的 length 属性表示形参的个数，而且是只读的。 
        //详见 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length
        //函数的 name 属性表示函数的名称，而且是只读的。 匿名函数的名称为空字符串。 
        //详见 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
        if (typeof obj == 'function') {

            var a = [];

            if ('name' in obj) {
                a.push(obj.name);
            }

            if ('length' in obj) {
                a.push(obj.length);
            }

            if (a.length > 0) {
                return a.join('#');
            }
        }

        var $Object = require('Object');

        return $Object.getType(obj); //返回相应构造器的名称，不要用　toString，因为可能会变

    }



    



    //实例方法
    $.extend(Mapper.prototype, { /**@lends MiniQuery.Mapper# */

        /**
        * 设置一对映射关系。
        * @param src 映射关系的键，可以是任何类型。
        * @param target 映射关系要关联的值，可是任何类型。
        * @return 返回第二个参数 target。
        * @example
            var obj = { a: 1, b: 2 };
            var fn = function(a, b) {
                console.log(a+b);
            };
            var mapper = new $.Mapper();
            mapper.set(obj, fn);
            mapper.set('a', 100);
            mapper.set(100, 'abc');
            mapper.set('100', 'ABC');
            mapper.set(null, 'abc');
            
        */
        set: function (src, target) {

            var all = guid$type$object[this[guidKey]];

            if (!src) { // false|null|undefined|''|0|NaN
                all['false'][String(src)] = target;
                return target;
            }

            var type = typeof src;

            if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                var guid = src[guidKey];
                all['guid'][guid] = target; //一步定位
                return;
            }


            switch (type) {
                case 'string':
                case 'number':
                case 'boolean':
                    all[type][String(src)] = target;
                    break;

                case 'object':
                case 'function':
                    var key = getString(src); //这里确保 key 一定是一个 string
                    var list = all[type][key];
                    if (list) { //已存在对应字符串的列表
                        var $Array = require('Array');
                        var pair = $Array.findItem(list, function (pair, index) {
                            return pair[0] === src;
                        });

                        if (pair) { //已存在，
                            pair[1] = target; //改写值
                        }
                        else { //未找到，创建新的，添加进去一对二元组 [src, target]
                            list.push([src, target]);
                        }
                    }
                    else { //未存在，则创建并添加
                        list = [[src, target]];
                    }

                    all[type][key] = list; //回写
            }

            return target;
        },

        /**
        * 批量设置映射关系。
        * @param {Array} list 映射关系的列表，是一个二维数组，每个数组项为[src, target] 的格式。
        * @example
            var mapper = new $.Mapper();
            mapper.setBatch([
                ['a', 100],
                ['b', 200]
                ['c', false]
            ]);
        */
        setBatch: function (list) {
            var $Array = require('Array');

            var self = this;

            $Array.each(list, function (item, index) {
                self.set(item[0], item[1]);
            });
        },

        /**
        * 获取一对映射关系所关联的值。<br />
        * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
        * @param src 映射关系的键，可以是任何类型。
        * @return 返回映射关系所关联的值。
        * @example
            var obj = { a: 1, b: 2 };
            var fn = function(a, b) {
                console.log(a+b);
            };
            
            var mapper = new $.Mapper();
            mapper.set(obj, fn);
            
            var myFn = mapper.get(obj); //获取到之前关联的 fn
            myFn(100, 200);
        */
        get: function (src) {

            var all = guid$type$object[this[guidKey]];

            // false|null|undefined|''|0|NaN
            if (!src) {
                return all['false'][String(src)];
            }


            var type = typeof src;

            if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                var guid = src[guidKey];
                return all['guid'][guid]; //一步定位
            }



            switch (type) {
                //值类型的，直接映射
                case 'string':
                case 'number':
                case 'boolean':
                    return all[type][String(src)];


                    //引用类型的，通过 key 映射到一个二维数组，每个二维数组项为 [src, target]
                case 'object':
                case 'function':
                    var key = getString(src);
                    var list = all[type][key];
                    if (list) { //已存在对应字符串的列表
                        var $Array = require('Array');
                        var pair = $Array.findItem(list, function (pair, index) {
                            return pair[0] === src;
                        });

                        if (pair) {
                            return pair[1];
                        }
                    }
            }

            return undefined;
        },


        /**
        * 根据给定的键移除一对映射关系。
        * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
        * @param src 映射关系的键，可以是任何类型。
        * @example
            var obj = { a: 1, b: 2 };
            var fn = function(a, b) {
                console.log(a+b);
            };
            
            var mapper = new $.Mapper();
            mapper.set(obj, fn);
            
            mapper.remove(obj);
            fn = mapper.get(obj);
            console.log( typeof fn); // undefined
        */
        remove: function (src) {

            var all = guid$type$object[this[guidKey]];

            // false|null|undefined|''|0|NaN
            if (!src) {
                delete all['false'][String(src)];
                return;
            }

            var type = typeof src;

            if (type == 'object' && guidKey in src) { //针对含有 guid 属性的对象作优先处理
                var guid = src[guidKey];
                delete all['guid'][guid]; //一步定位
                return;
            }


            switch (type) {
                //值类型的，直接映射
                case 'string':
                case 'number':
                case 'boolean':
                    delete all[type][String(src)];
                    break;

                    //引用类型的，通过 key 映射到一个二维数组，每个二维数组项为 [src, target]
                case 'object':
                case 'function':
                    var key = getString(src);
                    var list = all[type][key];
                    if (list) { //已存在对应字符串的列表
                        //移除 src 的项
                        var $Array = require('Array');
                        all[type][key] = $Array.grep(list, function (pair, index) {
                            return pair[0] !== src;
                        });
                    }
            }
        },


        /**
        * 销毁本实例。
        * 这会移除所有的映射关系，并且移除本实例内部使用的存放映射关系的容器对象。
        */
        dispose: function () {

            guid$type$object[this[guidKey]] = null;
            delete this[guidKey];
        }

    });

    //for test
    //Mapper.guid$type$object = guid$type$object;

    //静态方法
    $.extend(Mapper, { /**@lends MiniQuery.Mapper */
        getGuidKey: function () {
            return guidKey;
        }
    });

    module.exports = Mapper;


});



