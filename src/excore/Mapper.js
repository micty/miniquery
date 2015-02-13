
/**
* 映射器工具类。
* 实现任意类型的两个变量的关联。
* @class
* @name Mapper
*/
define('Mapper', function (require, module, exports) {

    var $ = require('$');
    var $String = require('String');
    var $Array = require('Array');

    var guidKey = '__guid-' + $String.random();
    var guid$all = {}; //容纳所有 Mapper 实例的数据


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



    

    /**
    * 构造器。
    * @inner
    */
    function Mapper() {

        //分配本实例对应的容器
        var guid = $String.random();
        this[guidKey] = guid;

        guid$all[guid] = {
            'guid': {},     //针对有 guid 属性的对象作特殊存取，以求一步定位。
            'false': {},    //针对 false|null|undefined|''|0|NaN
            'string': {},
            'number': {},
            'boolean': {},  //只针对 true
            'object': {},
            'function': {},
            'undefined': {} //这个用不到
        };
    }

    //实例方法
    Mapper.prototype = { /**@lends Mapper# */

        constructor: Mapper,
        /**
        * 根据给定的键和值设置成一对映射关系。
        * @param key 映射关系的键，可以是任何类型。
        * @param value 映射关系要关联的值，可是任何类型。
        * @return 返回第二个参数 value。
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
        set: function (key, value) {

            var guid = this[guidKey];
            var all = guid$all[guid]; //当前实例的容器

            var type = typeof key;

            //针对含有 guid 属性的对象作优先处理
            if (key && type == 'object' && guidKey in key) { 
                var guid = key[guidKey];
                all['guid'][guid] = value; //一步定位
                return value;
            }

            //false
            if (!key) { // false|null|undefined|''|0|NaN
                all['false'][String(key)] = value;
                return value;
            }

            //值类型
            if ((/^(string|number|boolean)$/g).test(type)) {
                all[type][String(key)] = value;
                return value;
            }

            //引用类型: object|function

            var key$list = all[type];
            key = getString(key); //这里确保 key 一定是一个 string
            var list = key$list[key];

            //未存在对应字符串的列表，则创建并添加
            if (!list) {
                key$list[key] = [[key, value]];
                return value;
            }


            //已存在对应字符串的列表
            var pair = $Array.findItem(list, function (pair, index) {
                return pair[0] === key;
            });

            if (pair) { //已存在，
                pair[1] = value; //改写值
            }
            else { //未找到，创建新的，添加进去一对二元组 [key, value]
                list.push([key, value]);
            }

            return value;
        },


        /**
        * 根据给定的键去获取其关联的值。
        * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
        * @param key 映射关系的键，可以是任何类型。
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
            console.log(fn === myFn);
        */
        get: function (key) {

            var guid = this[guidKey];
            var all = guid$all[guid];

            var type = typeof key;

            //针对含有 guid 属性的对象作优先处理
            if (key && type == 'object' && guidKey in key) { 
                var guid = key[guidKey];
                return all['guid'][guid]; //一步定位
            }

            //false
            if (!key) { // false|null|undefined|''|0|NaN
                return all['false'][String(key)];
            }


            //值类型，直接映射
            if ((/^(string|number|boolean)$/g).test(type)) {
                return all[type][String(key)];
            }

            //引用类型: object|function
            //通过 key 映射到一个二维数组，每个二维数组项为 [key, value]
            key = getString(key);
            var list = all[type][key];

            if (!list) {
                return;
            }


            //已存在对应字符串的列表
            var pair = $Array.findItem(list, function (pair, index) {
                return pair[0] === key;
            });

            return pair ? pair[1] : undefined;

        },


        /**
        * 根据给定的键移除一对映射关系。
        * 注意：根据映射关系的键查找所关联的值时，对键使用的是全等比较，即区分数据类型。
        * @param key 映射关系的键，可以是任何类型。
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
        remove: function (key) {

            var guid = this[guidKey];
            var all = guid$all[guid];

            var type = typeof key;

            //针对含有 guid 属性的对象作优先处理
            if (key && type == 'object' && guidKey in key) { 
                var guid = key[guidKey];
                delete all['guid'][guid]; //一步定位
                return;
            }

            //false
            if (!key) { // false|null|undefined|''|0|NaN
                delete all['false'][String(key)];
                return;
            }


            //值类型
            if ((/^(string|number|boolean)$/g).test(type)) {
                delete all[type][String(key)];
                return;
            }

            //引用类型: object|function
            var key$list = all[type];
            key = getString(key);
            var list = key$list[key];

            if (!list) {
                return;
            }

            //已存在对应字符串的列表
            //移除 key 的项
            key$list[key] = $Array.grep(list, function (pair, index) {
                return pair[0] !== key;
            });

        },


        /**
        * 销毁本实例。
        * 这会移除所有的映射关系，并且移除本实例内部使用的存放映射关系的容器对象。
        */
        destroy: function () {
            var guid = this[guidKey];
            delete guid$all[guid];
            delete this[guidKey]; //把 guid 掉，无法再访问数据
        }

    };

   
    //Mapper.guid$all = guid$all;  //for test


    //静态方法
    $.extend(Mapper, { /**@lends Mapper */

        /**
        * 获取运行时确定的随机 guid 值所使用的 key。
        * @return {string} 返回guid 值所使用的 key。
        */
        getGuidKey: function () {
            return guidKey;
        },

        /**
        * 给指定的对象设置一个 guid 值。
        * @param {Object} 要设置的对象，只要是引用类型即可。
        * @param {string} [guid] 要设置的 guid 值。
        *   当不指定时，则分配一个默认的随机字符串。(以 'default-' 开头 )
        * @return {string} 返回设置后的 guid 值。
        */
        setGuid: function (obj, guid) {
            if (guid === undefined) {
                guid = 'default-' + $String.random();
            }

            obj[guidKey] = guid;
            return guid;
        },

        /**
        * 获取指定的对象的 guid 值。
        * @param {Object} 要获取的对象，只要是引用类型即可。
        * @return {string} 返回该对象的 guid 值。
        */
        getGuid: function (obj) {
            return obj[guidKey];
        },
    });

    module.exports = Mapper;


});



