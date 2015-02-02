
/*!
* MiniQuery JavaScript Library for kiserp
* version: 3.0.1
*/
;( function (
    global, 

    top,
    parent,
    window, 
    document,
    location,
    navigator,
    localStorage,
    sessionStorage,
    console,
    history,
    setTimeout,
    setInterval,

    JSON,

    Array, 
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String,
    
    //强制为 undefined，避免模块内因为没有显式地使用 require('$') 来加载而意外使用到外部的 $。
    //这样更容易发现错误，即发现模块内没有显式使用 var $ = require('$'); 的情况。
    $, 

    undefined
) {



/**
* 内部的模块管理器
*/
var Module = (function () {

    var id$module = {};

    /**
    * 定义指定名称的模块。
    * @param {string} id 模块的名称。
    * @param {Object|function} exports 模块的导出函数。
    */
    function define(id, exports) {
        id$module[id] = {
            required: false,
            exports: exports,
            exposed: false      //默认对外不可见
        };
    }

    /**
    * 加载指定的模块。
    * @param {string} id 模块的名称。
    * @return 返回指定的模块。
    */
    function require(id) {

        var module = id$module[id];
        if (!module) { //不存在该模块
            return;
        }

        var exports = module.exports;

        if (module.required) { //已经 require 过了
            return exports;
        }

        //首次 require
        if (typeof exports == 'function') {

            var fn = exports;
            exports = {};

            var mod = {
                id: id,
                exports: exports,
            };

            var value = fn(require, mod, exports);

            //没有通过 return 来返回值，则要导出的值在 mod.exports 里
            exports = value === undefined ? mod.exports : value;
            module.exports = exports;
        }

        module.required = true; //指示已经 require 过一次

        return exports;

    }


    /**
    * 设置或获取对外暴露的模块。
    * 通过此方法，可以控制指定的模块是否可以通过 KERP.require(id) 来加载到。
    * @param {string|Object} id 模块的名称。
        当指定为一个 {} 时，则表示批量设置。
        当指定为一个字符串时，则单个设置。
    * @param {boolean} [exposed] 模块是否对外暴露。
        当参数 id 为字符串时，且不指定该参数时，表示获取操作，
        即获取指定 id 的模块是否对外暴露。
    * @return {boolean}
    */
    function expose(id, exposed) {

        if (typeof id == 'object') { // expose({ })，批量 set

            var id$exposed = id;

            for (var id in id$exposed) {
                var exposed = id$exposed[id];
                set(id, exposed);
            }

            return;
        }

        if (arguments.length == 2) { // expose('', true|false)，单个 set
            set(id, exposed);
            return;
        }

        //get
        return get(id);


        //内部方法
        function get(id) {
            var module = id$module[id];
            if (!module) {
                return false;
            }

            return module.exposed;
        }

        function set(id, exposed) {
            var module = id$module[id];
            if (module) {
                module.exposed = !!exposed;
            }
        }
    }



    return {
        define: define,
        require: require,
        expose: expose
    };


})();


//提供快捷方式
var define = Module.define;
var require = Module.require;


/**
* 内部用的一个 MiniQuery 容器
* @namespace
* @inner
*/
define('$', function (require, module, exports) {

    var slice = Array.prototype.slice;

    //兼容性写法
    var toArray = slice.call.bind ? slice.call.bind(slice) : function ($arguments) {
        return slice.call($arguments, 0);
    };



    module.exports = exports = {

        expando: 'MiniQuery-' + Math.random().toString().slice(2),

        toArray: toArray,

        /**
        * 用指定的值去扩展指定的目标对象，返回目标对象。
        */
        extend: function (target, obj1, obj2) {

            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                for (var key in obj1) {
                    target[key] = obj1[key];
                }
            }

            if (obj2 && typeof obj2 == 'object') {
                for (var key in obj2) {
                    target[key] = obj2[key];
                }
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) { //已处理完所有参数
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                var obj = arguments[i];
                for (var name in obj) {
                    target[name] = obj[name];
                }
            }

            return target;
        },

        

        /**
        * 把数组、类数组合并成一个真正的数组。
        */
        concat: function () {

            var a = [];

            var args = toArray(arguments);

            for (var i = 0, len = args.length; i < len; i++) {

                var item = args[i];
                if (!(item instanceof Array)) {
                    item = toArray(item);
                }

                a = a.concat(item);
            }

            return a;

        },

        

        require: function (id) {
            return Module.expose(id) ? require(id) : null;
        },
    };

});



/**
* 数组工具
* @class
*/
define('Array', function (require, module, exports) {

    var $ = require('$');


    exports = function (array) {
        var prototype = require('Array.prototype');
        return new prototype.init(array);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.Array*/

        /**
        * 把数组、类数组合并成一个真正的数组。
        */
        concat: $.concat,

        /**
        * 对数组进行迭代。 
        * 对数组中的每个元素执行指定的操作。
        * 可以指定为深层次的)
        * @param {Array} array 要进行迭代的数组。
        * @param {function} fn 要执行处理的回调函数，会接受到当前元素和其索引作为参数。
        *   只有在 fn 中明确返回 false 才停止循环(相当于 break)。
        * @param {boolean} [isDeep=false] 指定是否进行深层次迭代。
            如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @return {Array} 返回当前数组。
        * @example
            $.Array.each([0, 1, 2, ['a', 'b']], function(item, index) {
                console.log(index + ': ' + item);
            }, true);
        */
        each: function (array, fn, isDeep) {

            var each = arguments.callee; //引用自身，用于递归

            for (var i = 0, len = array.length; i < len; i++) {

                var item = array[i];

                if (isDeep && (item instanceof Array)) { //指定了深层次迭代
                    each(item, fn, true);
                }
                else {
                    var value = fn(item, i);
                    if (value === false) {
                        break;
                    }
                }
            }

            return array;
        },

        /**
        * 把一个对象转成数组。
        * @param {Object} obj 要进行转换的对象。
        * @param {boolean} [useForIn=false] 指示是否使用 for in 来枚举要 obj 对象。
        * @return {Array} 返回一个数组。
            如果 obj 本身就是数组，则直接返回该对象（数组）。
            如果 obj 没有 length 属性，或者不方便使用 length，请指定 useForIn 为 true，
            则使用 for in 来枚举该对象并填充到一个新数组中然后返回该数组；
            否则如果 useForIn 指定为 false 或者不指定，并且该对象：
            1.为 undefined 
            2.或 null 
            3.或不是对象
            4.或该对象不包含 length 属性
            5.或 length 为 0
            
            则返回空数组；
            否则按 obj.length 进行枚举并填充到一个数组里进行返回。
        */
        parse: function (obj, useForIn) {
            //本身就是数组。
            //这里不要用 $.Object.isArray(obj)，因为跨页面得到的obj，即使 $.Object.getType(obj) 返回 'Array'，
            //但在 IE 下 obj instanceof Array 仍为 false，从而对 obj 调用数组实例的方法就会出错。
            //即使该方法确实存在于 obj 中，但 IE 仍会报“意外地调用了方法或属性访问”的错误。
            //
            if (obj instanceof Array) {
                return obj;
            }


            var a = [];

            if (useForIn === true) { //没有 length 属性，或者不方便使用 length，则使用 for in

                for (var name in obj) {
                    if (name === 'length') //忽略掉 length 属性
                    {
                        continue;
                    }

                    a.push(obj[name]);
                }

                return a;
            }


            if (!obj || !obj.length) { //参数非法
                return [];
            }



            try { //标准方法

                a = Array.prototype.slice.call(obj, 0);
            }
            catch (ex) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    a.push(obj[i]);
                }
            }

            return a;
        },

        /**
        * 已重载。
        * 把一个数组转成 Object 对象。
        * @param {Array} array 要进行转换的数组。 
        * @param {Array|Object|Function} [maps] 转换的映射规则。
            1.当不指定第二个参数 maps 时，将得到一个类数组的对象（arguments 就是这样的对象）。
            否则，用参数 maps 指定的映射规则去填充一个新的对象并返回该对象，其中：
                2.当 maps 为数组时，则作为键的列表[ key0,…, keyN ]一一对应去建立键值映射关系，即 {keyN: array[N]}；
                3.当 maps 为对象时，则作为键-索引的映射关系去建立对象；
                4.当 maps 为函数时，则会调用该函数取得一个处理结果。
                其中该处理函数会接受到当前处理的数组项 item 和索引 index 作为参数。
                如果处理函数返回一个数组，则第1个元素作为键，第2个元素作为值，存到目标对象上。
                如果处理函数返回一个对象，则第1个成员的键作为键，第1个成员的值作为值，存到目标对象上，其他的忽略。
                
            如果参数非法，则返回 null；
            否则把数组的元素拷贝到一个新的 Object 对象上并返回它。
        * @return {Object} 返回一个 Object 对象，该对象上包含数组的处理结果，并且包含一个 length 成员。
        * @example
            //例子1: 不指定第二个参数 maps，得到一个类数组的对象（arguments 就是这样的对象）。
            var obj = $.Array.toObject(array);
            //等价于：
            var obj = {
                0: array[0],
                1: array[1],
                //...
                length: array.length    
            };
            
            //例子2: maps 为数组，则作为键的列表[key0,…, keyN]一一对应去建立键值映射关系，即{keyN: array[N]}
            var obj = $.Array.toObject(array, ['a', 'b', 'c']);
            //等价于
            var obj = {
                a: array[0], //maps[0] --> array[0]
                b: array[1], //maps[1] --> array[1]
                c: array[2]  //maps[2] --> array[2]
            };
            
            //例子3:  maps 为对象，则作为键-索引的映射关系去建立对象
            var obj = $.Array.toObject(array, {
                a: 1,
                b: 1,
                c: 2
            });
            //等价于
            var obj = {
                a: array[1], //maps['a'] --> array[1]
                b: array[1], //maps['b'] --> array[1]
                c: array[2]  //maps['c'] --> array[2]
            };
            
            //例子4: maps 为函数，则会调用该函数取得一个处理结果
            var obj = $.Array.toObject(['a', 'b', 'c'], function(item, index) {
                return [item, index + 1000]; //第1个元素作为键，第2个元素作为值
            });
            //得到 
            obj = {
                a: 1000,
                b: 1001
                c: 1002
            };
            
            //又如：
            var obj = $.Array.toObject(['a', 'b', 'c'], function(item, index) {
                //处理函数返回一个对象，则第1个成员的键作为键，第1个成员的值作为值，存到目标对象上，其他的忽略。
                var obj = {};
                obj[item] = index + 1000;
                return obj;
                
            });
            //得到 
            obj = {
                a: 1000,
                b: 1001
                c: 1002
            };
        */
        toObject: function (array, maps) {

            var $Object = require('Object');


            //参数非法
            if (!array || !$Object.isArray(array)) {
                return null;
            }

            var obj = {};

            //未指定参数 maps
            if (maps === undefined) {
                var len = array.length;
                obj.length = len;

                for (var i = 0; i < len; i++) {
                    obj[i] = array[i];
                }

                return obj;
            }

            // maps 是数组 [ key0, key1, … ]，即键的列表
            if ($Object.isArray(maps)) {

                var count = 0;
                var len = maps.length; //键的个数

                for (var i = 0; i < len; i++) {
                    var key = maps[i];
                    if (key in obj) {
                        continue;
                    }

                    obj[key] = array[i];
                    count++;
                }

                obj.length = count; //maps 中可能含有相同的元素

                return obj;
            }


            // maps 是对象 { key0: 0, key1: 1, … }，即键跟索引的映射
            if ($Object.isPlain(maps)) {
                var len = 0;

                for (var key in maps) {
                    obj[key] = array[maps[key]];
                    len++; //计数
                }

                obj.length = len;

                return obj;
            }

            //maps 是一个处理函数
            if (typeof maps == 'function') {
                var len = array.length;

                for (var i = 0; i < len; i++) {
                    var v = maps(array[i], i); //调用处理函数以获得处理结果

                    if (v instanceof Array) { //处理函数返回的是数组
                        var key = v[0];     //第0个元素作为键
                        var value = v[1];   //第1个元素作为值

                        obj[key] = value;   //建立键值的映射关系
                    }
                    else if ($Object.isPlain(v)) { //返回的是一个对象
                        for (var key in v) { //只处理第一个key，其他的忽略
                            obj[key] = v[key]; //建立键值的映射关系
                            break;
                        }
                    }
                    else {
                        throw new Error('处理函数 maps 返回结果的格式不可识别');
                    }
                }

                obj.length = len;

                return obj;
            }

            return obj;
        },

        /**
        * 把一个数组中的元素转换到另一个数组中，返回一个新的数组。
        * 重载了map(startIndex, endIndex, fn) 使其具有 pad 和 map 的功能。
        * @param {Array} array 要进行转换的数组。
        * @param {function} fn 转换函数。
            该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        * 转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        *   null：忽略当前数组元素，即该元素在新的数组中不存在对应的项（相当于 continue）；
        *   undefined：忽略当前数组元素到最后一个元素（相当于break）；
        * @param {boolean} [isDeep=false] 指定是否进行深层次迭代。
            如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @return {Array} 返回一个转换后的新数组。
        */
        map: function (array, fn, isDeep) {

            if (typeof array == 'number') { //重载 keep(startIndex, endIndex, fn)
                var startIndex = array;
                var endIndex = fn;
                fn = isDeep;
                array = exports.pad(startIndex, endIndex);
                isDeep = false;
            }


            var map = arguments.callee; //引用自身，用于递归
            var a = [];
            var value;

            for (var i = 0, len = array.length; i < len; i++) {
                var item = array[i];

                if (isDeep && (item instanceof Array)) {
                    value = map(item, fn, true); // 此时的 value 是一个 []
                }
                else {
                    value = fn(item, i);

                    if (value === null) {
                        continue;
                    }

                    if (value === undefined) { //注意，当回调函数 fn 不返回值时，迭代会给停止掉
                        break;
                    }
                }


                a.push(value);
            }

            return a;
        },

        /**
        * 将一个数组中的元素转换到另一个数组中，并且保留所有的元素，返回一个新数组。
        * 作为参数的转换函数会为每个数组元素调用，并把当前元素和索引作为参数传给转换函数。
        * 该方法与 map 的区别在于本方法会保留所有的元素，而不管它的返回是什么。
        * 重载了keep(startIndex, endIndex, fn) 使其具有 pad 和 keep 的功能。
        * @param {Array} array 要进行转换的数组。
        * @param {function} fn 转换函数。
            该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        * 转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        * @param {boolean} [isDeep=false] 指定是否进行深层次迭代。
            如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @return {Array} 返回一个转换后的新数组。
        */
        keep: function (array, fn, isDeep) {

            if (typeof array == 'number') { //重载 keep(startIndex, endIndex, fn)
                var startIndex = array;
                var endIndex = fn;
                fn = isDeep;
                array = exports.pad(startIndex, endIndex);
                isDeep = false;
            }

            var keep = arguments.callee; //引用自身，用于递归
            var a = [];
            var value;

            for (var i = 0, len = array.length; i < len; i++) {
                var item = array[i];

                if (isDeep && (item instanceof Array)) {
                    value = keep(item, fn, true);
                }
                else {
                    value = fn(item, i);
                }

                a.push(value);
            }

            return a;
        },

        /**
        * 使用过滤函数过滤数组元素，返回一个新数组。
        * 此函数至少传递两个参数：待过滤数组和过滤函数。过滤函数必须返回 true 以保留元素或 false 以删除元素。
        * 转换函数可以返回转换后的值：
        * @param {Array} array 要进行转换的数组。
        * @param {function} fn 转换函数。
            该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        * 转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        * @param {boolean} [isDeep=false] 指定是否进行深层次迭代。
            如果要进行深层次迭代，即对数组元素为数组继续迭代的，请指定 true；否则为浅迭代。
        * @return {Array} 返回一个过滤后的新数组。
        */
        grep: function (array, fn, isDeep) {

            var grep = arguments.callee; //引用自身，用于递归
            var a = [];

            for (var i = 0, len = array.length; i < len; i++) {
                var item = array[i];

                if (isDeep && (item instanceof Array)) {
                    item = grep(item, fn, true);
                    a.push(item);
                }
                else {
                    var value = fn(item, i);
                    if (value === true) {
                        a.push(item);
                    }
                }
            }

            return a;
        },

        /**
        * 检索特定的元素在数组中第一次出现的索引位置。
        * 注意，该方法用的是全等的比较操作。
        * @param {Array} array 要进行检索的数组。
        * @param {任意类型} item 要进行检索的项。
        * @return 返回一个整数，表示检索项在数组第一次出现的索引位置。
        *   如果不存在该元素，则返回 -1。
        * @example
            $.Array.indexOf(['a', '10', 10, 'b'], 10); //使用的是全等比较，结果为 2
            
        */
        indexOf: function (array, item) {
            if (typeof array.indexOf == 'function') { //内置方法
                return array.indexOf(item);
            }

            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
        * 判断数组中是否包含特定的元素，返回 true 或 false。
        */
        contains: function (array, item) {
            return exports.indexOf(array, item) > -1;
        },


        /**
        * 从数组中删除特定的元素，返回一个新数组。
        */
        remove: function (array, target) {

            //不要用 map 方法，因为会把原有的 null 或 undefined 也删除掉，这不是本意。
            var a = [];
            for (var i = 0, len = array.length; i < len; i++) {

                var item = array[i];
                if (item === target) {
                    continue;
                }

                a.push(item);
            }

            return a;
        },

        /**
        * 从数组中删除特定索引位置的元素，返回一个新数组。
        */
        removeAt: function (array, index) {
            var a = array.slice(0); //拷贝一份。
            a.splice(index, 1);
            return a;
        },

        /**
        * 反转数组，返回一个新数组。
        */
        reverse: function (array) {
            var a = [];

            for (var i = array.length - 1; i >= 0; i--) {
                a.push(array[i]);
            }

            return a;
        },

        /**
        * 批量合并数组，返回一个新数组。
        */
        merge: function () {
            var a = [];

            for (var i = 0, len = arguments.length; i < len; i++) {
                var arg = arguments[i];
                if (arg === undefined) {
                    continue;
                }

                a = a.concat(arg);
            }

            return a;
        },

        /**
        * 批量合并数组，并删除重复的项，返回一个新数组。
        */
        mergeUnique: function () {
            var list = [];

            var argsLen = arguments.length;
            var contains = exports.contains; //缓存一下方法引用，以提高循环中的性能

            for (var index = 0; index < argsLen; index++) {
                var arg = arguments[index];
                var len = arg.length;

                for (var i = 0; i < len; i++) {
                    if (!contains(list, arg[i])) {
                        list.push(arg[i]);
                    }
                }
            }

            return list;
        },

        /**
        * 删除重复的项，返回一个新数组。
        * 定义该接口，是为了语义上更准确。
        */
        unique: function (a) {
            return exports.mergeUnique(a);
        },

        /**
        * 给数组删除（如果已经有该项）或添加（如果还没有项）一项，返回一个新数组。
        */
        toggle: function (array, item) {

            if (exports.contains(array, item)) {
                return exports.remove(array, item);
            }
            else {
                var list = array.slice(0);
                list.push(item);
                return list;
            }

        },


        /**
        * 判断符合条件的元素是否存在。
        * 只有在回调函数中明确返回 true，才算找到，此时本方法停止迭代，并返回 true 以指示找到；
        * 否则迭代继续直至完成，并返回 false 以指示不存在符合条件的元素。
        */
        find: function (array, fn, startIndex) {
            return exports.findIndex(array, fn, startIndex) > -1;
        },


        /**
        * 查找符合条件的单个元素的索引，返回第一次找到的元素的索引值，否则返回 -1。
        * 只有在回调函数中明确返回 true，才算找到。
        */
        findIndex: function (array, fn, startIndex) {
            startIndex = startIndex || 0;

            for (var i = startIndex, len = array.length; i < len; i++) {
                if (fn(array[i], i) === true) { // 只有在 fn 中明确返回 true 才停止循环
                    return i;
                }
            }

            return -1;
        },

        /**
        * 查找符合条件的单个元素，返回第一次找到的元素，否则返回 null。
        * 只有在回调函数中中明确返回 true 才算是找到。
        */
        findItem: function (array, fn, startIndex) {
            startIndex = startIndex || 0;

            for (var i = startIndex, len = array.length; i < len; i++) {
                var item = array[i];
                if (fn(item, i) === true) { // 只有在 fn 中明确返回 true 才算是找到
                    return item;
                }
            }

            return null;
        },

        /**
        * 对此数组的元素进行随机排序，返回一个新数组。
        * @param {Array} list 要进行排序的数组。
        * @return {Array} 返回一个随机排序的新数组。
        * @example
            $.Array.random( ['a', 'b', 'c', 'd'] ); 
        */
        random: function (list) {
            var array = list.slice(0);

            for (var i = 0, len = array.length; i < len; i++) {
                var index = parseInt(Math.random() * i);
                var tmp = array[i];
                array[i] = array[index];
                array[index] = tmp;
            }

            return array;
        },

        /**
        * 随机获取数组中的一个元素。
        * @param {Array} array 要进行获取元素的数组。
        * @return 随机返回一个数组项。
            当数组为空时，返回 undefined。
        * @example
            $.Array.randomItem( ['a', 'b', 'c', 'd'] ); 
        */
        randomItem: function (array) {
            var $Math = require('Math');

            var len = array.length;
            if (len < 1) {
                return undefined;
            }

            var index = $Math.randomInt(0, len - 1);
            return array[index];

        },

        /**
        * 获取数组中指定索引位置的元素。
        * 如果传入负数，则从后面开始算起。如果不传参数，则返回一份拷贝的新数组。
        */
        get: function (array, index) {
            var len = array.length;

            if (index >= 0 && index < len) {  //在常规区间
                return array[index];
            }

            var pos = index + len;
            if (index < 0 && pos >= 0) {
                return array[pos];
            }

            if (index == null) { // undefined 或 null

                return array.slice(0);
            }
        },

        /**
        * 删除数组中为 null 或 undefined 的项，返回一个新数组
        */
        trim: function (array) {
            return exports.map(array, function (item, index) {
                return item == null ? null : item;  //删除 null 或 undefined 的项
            });
        },

        /**
        * 创建分组，即把转成二维数组。返回一个二维数组。
        * 当指定第三个参数为 true 时，可在最后一组向右对齐数据。
        */
        group: function (array, size, isPadRight) {
            var groups = exports.slide(array, size, size);

            if (isPadRight === true) {
                groups[groups.length - 1] = array.slice(-size); //右对齐最后一组
            }

            return groups;
        },

        /**
        * 用滑动窗口的方式创建分组，即把转成二维数组。返回一个二维数组。
        * 可以指定窗口大小和步长。步长默认为1。
        */
        slide: function (array, windowSize, stepSize) {
            if (windowSize >= array.length) { //只够创建一组
                return [array];
            }

            stepSize = stepSize || 1;

            var groups = [];

            for (var i = 0, len = array.length; i < len; i = i + stepSize) {
                var end = i + windowSize;

                groups.push(array.slice(i, end));

                if (end >= len) {
                    break; //已达到最后一组
                }
            }

            return groups;
        },

        /**
        * 用圆形的方式截取数组片段，返回一个新的数组。
        * 即把数组看成一个首尾相接的圆圈，然后从指定位置开始截取指定长度的片段。
        */
        circleSlice: function (array, startIndex, size) {
            var a = array.slice(startIndex, startIndex + size);
            var b = [];

            var d = size - a.length;
            if (d > 0) { //该片段未达到指定大小，继续从数组头部开始截取
                b = array.slice(0, d);
            }

            return a.concat(b);
        },

        /**
        * 用圆形滑动窗口的方式创建分组，返回一个二维数组。
        * 可以指定窗口大小和步长。步长默认为 1。
        * 即把数组看成一个首尾相接的圆圈，然后开始滑动窗口。
        */
        circleSlide: function (array, windowSize, stepSize) {
            if (array.length < windowSize) {
                return [array];
            }

            stepSize = stepSize || 1;

            var groups = [];
            var circleSlice = exports.circleSlice; //缓存方法的引用，以提高循环中的性能

            for (var i = 0, len = array.length; i < len; i = i + stepSize) {
                groups.push(circleSlice(array, i, windowSize));
            }

            return groups;
        },

        /**
        * 对一个数组的所有元素进行求和。
        * @param {Array} array 要进行求和的数组。
        * @param {boolean} [ignoreNaN=false] 指示是否忽略掉值为 NaN 的项。
            如果要忽略掉值为 NaN 的项，请指定为 true；否则为 false 或不指定。
        * @param {string} [key] 要读取的项的成员的键名称。
        *   如果指定第三个参数时，将读取数组元素中的对应的成员，该使用方式主要用于由 json 组成的的数组中。
        * @return {Number} 返回数组所有元素之和。
        * @example
            var a = [1, 2, 3, 4];
            var sum = $.Array.sum(a); //得到 10
            //又如
            var a = [
                { value: 1 },
                { value: NaN },
                { value: 3 },
                { value: 4 },
            ];
            var sum = $.Array.sum(a, true, 'value'); //得到 8
    
        */
        sum: function (array, ignoreNaN, key) {
            var sum = 0;

            var hasKey = !(key === undefined);

            for (var i = 0, len = array.length; i < len; i++) {
                var value = hasKey ? array[i][key] : array[i];

                if (isNaN(value)) {
                    if (ignoreNaN === true) {
                        continue;
                    }
                    else {
                        throw new Error('第 ' + i + ' 个元素的值为 NaN');
                    }
                }
                else {
                    sum += Number(value); //可以处理 string
                }
            }

            return sum;
        },

        /**
        * 查找一个数组的所有元素中的最大值。
        * 当指定第二个参数为 true 时，可以忽略掉 NaN 的元素。
        * 当指定第三个参数时，将读取数组元素中的对应的成员，该使用方式主要用于由 json 组成的的数组中。
        */
        max: function (array, ignoreNaN, key) {
            var max = 0;

            var hasKey = !(key === undefined);

            for (var i = 0, len = array.length; i < len; i++) {
                var value = hasKey ? array[i][key] : array[i];

                if (isNaN(value)) {
                    if (ignoreNaN === true) {
                        continue;
                    }
                    else {
                        throw new Error('第 ' + i + ' 个元素的值为 NaN');
                    }
                }
                else {
                    value = Number(value); //可以处理 string
                    if (value > max) {
                        max = value;
                    }
                }
            }

            return max;
        },

        /**
        * 判断数组中是否包含元素。
        * 当传入的参数为数组，并且其 length 大于 0 时，返回 true；否则返回 false。
        */
        hasItem: function (array) {
            var $Object = require('Object');

            return $Object.isArray(array) &&
                array.length > 0;
        },

        /**
        * 给数组降维，返回一个新数组。
        * 可以指定降维次数，当不指定次数，默认为 1 次。
        */
        reduceDimension: function (array, count) {
            count = count || 1;

            var a = array;
            var concat = Array.prototype.concat; //缓存一下方法引用，以提高循环中的性能

            for (var i = 0; i < count; i++) {
                a = concat.apply([], a);
            }

            return a;
        },


        /**
        * 求两个或多个数组的笛卡尔积，返回一个二维数组。
        * @param {Array} arrayA 要进行求笛卡尔积的数组A。
        * @param {Array} arrayB 要进行求笛卡尔积的数组B。
        * @return {Array} 返回一个笛卡尔积的二维数组。
        * @example： 
            var A = [a, b]; 
            var B = [0, 1, 2]; 求积后结果为：
            var C = $.Array.descartes(A, B);
            //得到 
            C = [ 
                [a, 0], [a, 1], [a, 2], 
                [b, 0], [b, 1], [b, 2] 
            ];
        * 注意：
        *   $.Array.descartes(A, B, C)并不等于（但等于$.Array(A).descartes(B, C)的结果）
        *   $.Array.descartes($.Array.descartes(A, B), C)（但等于$.Array(A).descartes(B).descartes(C)的结果）
        */
        descartes: function (arrayA, arrayB) {
            var list = fn(arrayA, arrayB); //常规情况，两个数组

            for (var i = 2, len = arguments.length; i < len; i++) { //(如果有)多个数组，递归处理
                list = fn(list, arguments[i], true);
            }

            return list;


            /*仅内部使用的一个方法*/
            function fn(A, B, reduced) {
                var list = [];

                for (var i = 0, len = A.length; i < len; i++) {
                    for (var j = 0, size = B.length; j < size; j++) {
                        var item = [];

                        if (reduced) { //参数多于两个的情况，降维
                            item = item.concat(A[i]); //此时的 A[i] 为一个数组，如此相较于 item[0] = A[i] 可降维
                            item.push(B[j]); //把 A[i] 的所有元素压入 item 后，再把 B[j] 作为一个元素压入item
                        }
                        else { //下面组成一个有序的二元组
                            item[0] = A[i];
                            item[1] = B[j]; //这里也相当于 item.push( B[j] )
                        }

                        list.push(item);
                    }
                }

                return list;
            }
        },

        /**
        * 把笛卡尔积分解成因子，返回一个二维数组。
        * 该方法是求笛卡尔积的逆过程。
        * 参数 sizes 是各因子的长度组成的一维数组。
        */
        divideDescartes: function (array, sizes) {
            var rows = array.length; // "局部数组"的长度，从整个数组开始

            var list = [];

            for (var i = 0, len = sizes.length; i < len; i++) { //sizes的长度，就是因子的个数
                var size = sizes[i];    //当前因子的长度
                var step = rows / size;   //当前因子中的元素出现的步长(也是每个元素重复次数)

                var a = []; //分配一个数组来收集当前因子的 size 个元素

                for (var s = 0; s < size; s++) { //收集当前因子的 size 个元素
                    a.push(array[s * step][i]); //因为因子中的每个元素重复出现的次数为 step，因此采样步长为 step
                }

                rows = step; //更新下一次迭代中的"局部数组"所指示的长度
                list[i] = a; //引用到因子收集器中
            }

            return list;
        },

        /**
        * 对数组进行转置。
        * 即把数组的行与列对换，返回一个新数组。
        * @param {Array} array 要进行转置的数组。
        * @return {Array} 返回一个转置后的数组。
        * @example
        *   var A = [
                ['a', 'b', 'c'],
                [100, 200, 300]
            ];
            var B = $.Array.transpose(A);
            //得到
            C = [
                ['a', 100],
                ['b', 200],
                ['c', 300],
            ]
        */
        transpose: function (array) {
            var A = array; //换个名称，代码更简洁，也更符合线性代数的表示

            var list = [];

            var rows = A.length;    //行数
            var cols = 1;           //列数，先假设为 1 列，在扫描行时，会更新成该行的最大值

            for (var c = 0; c < cols; c++) { //从列开始扫描

                var a = [];

                for (var r = 0; r < rows; r++) { //再扫描行
                    if (A[r].length > cols) { //当前行的列数比 cols 要大，更新 cols
                        cols = A[r].length;
                    }

                    a.push(A[r][c]);
                }

                list[c] = a;
            }

            return list;
        },

        /**
        * 求两个或多个数组的交集，返回一个最小集的新数组。
        * 即返回的数组中，已对元素进行去重。
        * 元素与元素的比较操作用的是全等关系
        */
        intersection: function (arrayA, arrayB) {
            var list = arrayA;

            for (var i = 1, len = arguments.length; i < len; i++) {
                list = fn(list, arguments[i]);
            }

            return list;


            function fn(A, B) {
                var list = [];

                for (var i = 0, len = A.length; i < len; i++) {
                    var item = A[i];

                    for (var j = 0, size = B.length; j < size; j++) {
                        if (item === B[j]) {
                            list.push(item);
                            break;
                        }
                    }
                }

                return exports.unique(list);
            }
        },

        /**
        * 判断两个数组是否相等。
        * 只有同为数组并且长度一致时，才有可能相等。
        * 如何定义两个元素相等，或者定义两个元素相等的标准，由参数 fn 指定。
        * 当不指定 fn 时，由使用全等(严格相等)来判断
        */
        equals: function (A, B, fn) {
            //确保都是数组，并且长度一致
            if (!(A instanceof Array) || !(B instanceof Array) || A.length != B.length) {
                return false;
            }

            //如何定义两个元素相等，或者定义两个元素相等的标准，由参数 fn 指定。
            //当不指定时，由使用全等来判断(严格相等)
            fn = fn || function (x, y) {
                return x === y;
            };

            for (var i = 0, len = A.length; i < len; i++) {

                if (!fn(A[i], B[i])) { //只要有一个不等，整个结果就是不等
                    return false;
                }
            }

            return true;
        },

        /**
        * 判断第一个数组 A 是否包含于第二个数组 B，即 A 中所有的元素都可以在 B 中找到。
        */
        isContained: function (A, B) {
            return exports.intersection(A, B).length == A.length;
        },


        /**
        * 右对齐此数组，在左边用指定的项填充以达到指定的总长度，返回一个新数组。
        * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
        */
        padLeft: function (array, totalLength, paddingItem) {
            var delta = totalLength - array.length; //要填充的数目

            if (delta <= 0) {
                return array.slice(-delta); //-delta为正数
            }

            var a = [];
            for (var i = 0; i < delta; i++) {
                a.push(paddingItem);
            }

            a = a.concat(array);

            return a;
        },

        /**
        * 左对齐此数组，在右边用指定的项填充以达到指定的总长度，返回一个新数组。
        * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
        */
        padRight: function (array, totalLength, paddingItem) {
            var delta = totalLength - array.length;

            if (delta <= 0) {
                return array.slice(0, totalLength);
            }


            var a = array.slice(0); //克隆一份

            for (var i = 0; i < delta; i++) {
                a.push(paddingItem);
            }

            return a;
        },

        /**
        * 产生一个区间为 [start, end) 的半开区间的数组。
        * @param {number} start 半开区间的开始值。
        * @param {number} end 半开区间的结束值。
        * @param {number} [step=1] 填充的步长，默认值为 1。可以指定为负数。
        * @return {Array} 返回一个递增（减）的数组。
        *   当 start 与 end 相等时，返回一个空数组。
        * @example
            $.Array.pad(1, 9, 2); //产生一个从1到9的数组，步长为2，结果为[1, 3, 5, 7]
            $.Array.pad(5, 2, -1); //产生一个从5到2的数组，步长为-1，结果为[5, 4, 3]
        */
        pad: function (start, end, step) {
            if (start == end) {
                return [];
            }

            step = Math.abs(step || 1);

            var a = [];

            if (start < end) { //升序
                for (var i = start; i < end; i += step) {
                    a.push(i);
                }
            }
            else { //降序
                for (var i = start; i > end; i -= step) {
                    a.push(i);
                }
            }

            return a;
        },

        /**
        * 对一个数组进行分类聚合。
        * 该方法常用于对一个 JSON 数组按某个字段的值进行分组而得到一个新的 Object 对象。
        * @param {Array} array 要进行分类聚合的数组。一般是 JSON 数组。
        * @param {string|function} getKey 用于分类聚合的键，即要对 JSON 数组中的每项取哪个成员进行分类。
            可以提供一个字符串值，也可以提供一个函数以返回一个键值。
            如果提供的是函数，则会在参数中接收到当前处理的数组项和索引。
        * @param {function} [getValue] 用于处理当前数组项的函数，返回一个新值代替原来的数组项。
            如果指定该参数，则会在参数中接收到当前处理的数组项和索引，然后返回一个新值来代替原来的数组项。
            注意：类似于 $.Array.map 的规定用法，
                当返回 null 时，则会 continue，忽略该返回值；
                当返回 undefined 时，则会 break，停止再迭代数组；
        * @return {Object} 返回一个经过分类聚合的 Object 对象。
        * @example
            var books = [
                { name: 'C++', type: '计算机', year: 2012 },   
                { name: 'JavaScript', type: '计算机', year: 2011 },
                { name: '简爱', type: '文学', year: 2011 },
                { name: '数据结构', type: '计算机', year: 2013 },
                { name: '人生', type: '文学', year: 2012 },
                { name: '大学物理', type: '物理', year: 2012 },
                { name: '高等数学', type: '数学', year: 2011 },
                { name: '微积分', type: '数学', year: 2013 }
            ];
            //按 type 进行聚合(分组)
            var byTypes = $.Array.aggregate( books, 'type' );  
            
            //按 year 进行聚合(分组)，并重新返回一个值。
            var byYears = $.Array.aggregate( books, 'year', function(item, index) {
                return { name: item.name, type: item.type, year: '出版年份：' + item.year };
            });   
        
            则 byTypes = {
                '计算机': [
                    { name: 'C++', type: '计算机', year: 2012 },   
                    { name: 'JavaScript', type: '计算机', year: 2011 },
                    { name: '数据结构', type: '计算机', year: 2013 }
                ],
                '文学': [
                    { name: '简爱', type: '文学', year: 2011 }
                ],
                '物理': [
                    { name: '大学物理', type: '物理', year: 2012 }
                ],
                '数学': [
                    { name: '高等数学', type: '数学', year: 2011 },
                    { name: '微积分', type: '数学', year: 2013 }
                ]
            };
        
            byYears = {
                2011: [
                    { name: 'JavaScript', type: '计算机', year: '出版年份：2011' },
                    { name: '简爱', type: '文学', year: '出版年份：2011' },
                    { name: '高等数学', type: '数学', year: '出版年份：2011' }
                ],
                2012: [
                    { name: 'C++', type: '计算机', year: '出版年份：2012' },
                    { name: '人生', type: '文学', year: '出版年份：2012' },
                    { name: '大学物理', type: '物理', year: '出版年份：2012' }
                ],
                2013: [
                    { name: '数据结构', type: '计算机', year: '出版年份：2013' },
                    { name: '微积分', type: '数学', year: '出版年份：2013' }
                ]
            };
        */
        aggregate: function (array, getKey, getValue) {
            var isKey = typeof getKey == 'string';
            var changed = typeof getValue == 'function';

            var obj = {};

            for (var i = 0, len = array.length; i < len; i++) {
                var item = array[i];
                var key = isKey ? item[getKey] : getKey(item, i);

                if (!obj[key]) {
                    obj[key] = [];
                }

                var value = item;

                if (changed) { //指定了要变换值
                    value = getValue(item, i);

                    if (value === null) {
                        continue;
                    }

                    if (value === undefined) {
                        break;
                    }
                }

                obj[key].push(value);
            }

            return obj;


        },

        /**
        * 从一个数组拷贝一份并添加一个项目，返回一个新的数组。
        * @param {Array} array 要进行拷贝的数组。 
        * @param item 要进行添加的元素。
        * @return {Array} 返回一个包含新添加的元素的新数组。
        * @example
            var a = ['a', 'b'];
            var b = $.Array.add(a, 'c');
            console.dir(a); //结果没变，仍为 ['a', 'b']
            console.dir(b); //结果为 ['a', 'b', 'c'];
    
        */
        add: function (array, item) {
            var a = array.slice(0);
            a.push(item);
            return a;
        },

        /**
        * 统计一个数组中特定的项的个数。
        */
        count: function (array, fn) {

            if (arguments.length < 2) {
                return array.length;
            }

            if (typeof fn != 'function') {
                var value = fn;

                fn = function (item, index) {
                    return item === value;
                };
            }

            var a = exports.grep(array, fn);
            return a.length;

        }



    });

});


define('Array.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Array = require('Array');

    function init(array) {
        this.value = $Array.parse(array);
    }


    module.exports =
    init.prototype =
    $Array.prototype = { /**@inner*/

        constructor: $Array,
        init: init,

        value: [],

        toString: function (separator) {
            separator = separator === undefined ? '' : separator;
            return this.value.join(separator);
        },

        valueOf: function () {
            return this.value;
        },


        each: function (fn, isReversed) {
            var args = $.concat([this.value], arguments);
            $Array.each.apply(null, args);
            return this;
        },


        toObject: function (maps) {
            var args = $.concat([this.value], arguments);
            return $Array.toObject.apply(null, args);
        },


        map: function (fn) {
            var args = $.concat([this.value], arguments);
            $Array.map.apply(null, args);
            return this;
        },

        keep: function (fn) {
            var args = $.concat([this.value], arguments);
            this.value = $Array.keep.apply(null, args);
            return this;
        },


        grep: function (fn) {
            var args = $.concat([this.value], arguments);
            this.value = $Array.grep.apply(null, args);
            return this;
        },


        indexOf: function (item) {
            var args = $.concat([this.value], arguments);
            return $Array.indexOf(this.value, item);
        },


        contains: function (item) {
            return $Array.contains(this.value, item);
        },


        remove: function (target) {
            this.value = $Array.remove(this.value, target);
            return this;
        },


        removeAt: function (index) {
            this.value = $Array.removeAt(this.value, index);
            return this;
        },


        reverse: function () {
            this.value = $Array.reverse(this.value);
            return this;
        },


        merge: function () {

            //其实是想执行 MiniQuery.Array.merge(this.value, arguments[0], arguments[1], …);
            var args = $.concat([this.value], arguments);
            this.value = $Array.merge.apply(null, args);

            return this;
        },


        mergeUnique: function () {
            //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);

            var args = $.concat([this.value], arguments);
            this.value = $Array.mergeUnique.apply(null, args);

            return this;
        },


        unique: function () {

            this.value = $Array.unique(this.value);
            return this;
        },


        toggle: function (item) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.toggle.apply(null, args);

            return this;
        },


        find: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.find.apply(null, args);
        },


        findIndex: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.findIndex.apply(null, args);
        },


        findItem: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.findItem.apply(null, args);
        },


        random: function () {
            this.value = $Array.random(this.value);
            return this;
        },


        randomItem: function () {
            return $Array.randomItem(this.value);
        },


        get: function (index) {

            var args = $.concat([this.value], arguments);

            return $Array.get.apply(null, args);
        },


        trim: function () {

            this.value = $Array.trim(this.value);

            return this;
        },


        group: function (size, isPadRight) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.group.apply(null, args);

            return this;
        },


        slide: function (windowSize, stepSize) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.slide.apply(null, args);

            return this;
        },


        circleSlice: function (startIndex, size) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.circleSlice.apply(null, args);

            return this;
        },


        circleSlide: function (windowSize, stepSize) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.circleSlide.apply(null, args);

            return this;
        },


        sum: function (ignoreNaN, key) {

            var args = $.concat([this.value], arguments);

            return $Array.sum.apply(null, args);
        },


        max: function (ignoreNaN, key) {

            var args = $.concat([this.value], arguments);

            return $Array.max.apply(null, args);
        },


        hasItem: function () {
            return $Array.hasItem(this.value);
        },


        reduceDimension: function (count) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.reduceDimension.apply(null, args);

            return this;
        },

        //注意：
        //  $.Array(A).descartes(B, C) 并不等于
        //  $.Array(A).descartes(B).descartes(C) 中的结果

        descartes: function () {

            var args = $.concat([this.value], arguments);
            this.value = $Array.descartes.apply(null, args);

            return this;
        },


        divideDescartes: function (sizes) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.divideDescartes.apply(null, args);

            return this;
        },


        transpose: function () {

            this.value = $Array.transpose(this.value);

            return this;
        },



        //注意：
        // $.Array(a).intersection(b, c) 等于
        // $.Array(a).intersection(b).intersection(c)

        intersection: function () {

            var args = $.concat([this.value], arguments);
            this.value = $Array.intersection.apply(null, args);

            return this;
        },


        equals: function (array, fn) {

            var args = $.concat([this.value], arguments);

            return $Array.equals.apply(null, args);
        },


        isContained: function (B) {

            var args = $.concat([this.value], arguments);

            return $Array.isContained.apply(null, args);
        },


        padLeft: function (totalLength, paddingItem) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.padLeft.apply(null, args);

            return this;
        },


        padRight: function (totalLength, paddingItem) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.padRight.apply(null, args);

            return this;
        },


        pad: function (start, end, step) {

            var args = $.toArray(arguments);
            this.value = $Array.pad.apply(null, args);

            return this;
        }
    };

});


/**
* Boolean 工具类
* @class
* @param {Object} b 要进行进换的值，可以是任何类型。
* @return {MiniQuery.Boolean} 返回一个 MiniQuery.Boolean 的实例。
*/
define('Boolean', function (require, module, exports) {

    var $ = require('$');

    exports = function (b) {
        var prototype = require('Boolean.prototype');
        return new prototype.init(b);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.Boolean */

        /**
        * 解析指定的参数为 bool 值。
        * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 false；
        * 其它的转成 true
        * @param {Object} arg 要进行进换的值，可以是任何类型。
        * @return {boolean} 返回一个 bool 值。
        * @example
            $.Boolean.parse(null); //false;
            $.Boolean.parse('null'); //false;
            $.Boolean.parse(undefined); //false;
            $.Boolean.parse('undefined'); //false;
            $.Boolean.parse(0); //false;
            $.Boolean.parse('0'); //false;
            $.Boolean.parse(NaN); //false;
            $.Boolean.parse('NaN'); //false;
            $.Boolean.parse(false); //false;
            $.Boolean.parse('false'); //false;
            $.Boolean.parse(''); //false;
            $.Boolean.parse(true); //true;
            $.Boolean.parse({}); //true;
        */
        parse: function (arg) {
            if (!arg) // null、undefined、0、NaN、false、''
            {
                return false;
            }

            if (typeof arg == 'string' || arg instanceof String) {
                var reg = /^(false|null|undefined|0|NaN)$/g;

                return !reg.test(arg);
            }


            return true;
        },

        /**
        * 解析指定的参数为 int 值：0 或 1。
        * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 0；
        * 其它的转成 1
        * @param {Object} 要进行转换的值，可以是任何类型。
        * @return {int} 返回一个整型值 0 或 1。
        * @example
            $.Boolean.toInt(null); //0;
            $.Boolean.toInt('null'); //0;
            $.Boolean.toInt(undefined); //0;
            $.Boolean.toInt('undefined'); //0;
            $.Boolean.toInt(0); //0;
            $.Boolean.toInt('0'); //0;
            $.Boolean.toInt(NaN); //0;
            $.Boolean.toInt('NaN'); //0;
            $.Boolean.toInt(false); //0;
            $.Boolean.toInt('false'); //0;
            $.Boolean.toInt(''); //0;
            $.Boolean.toInt(true); //1;
            $.Boolean.toInt({}); //1;
        */
        toInt: function (arg) {
            return exports.parse(arg) ? 1 : 0;
        },

        /**
        * 反转一个 boolean 值，即 true 变成 false；false 变成 true。
        * @param {Object} 要进行反转的值，可以是任何类型。
        * @return {int} 返回一个 bool 值。
        * @example
            $.Boolean.reverse(null); //true;
            $.Boolean.reverse('null'); //true;
            $.Boolean.reverse(undefined); //true;
            $.Boolean.reverse('undefined'); //true;
            $.Boolean.reverse(0); //true;
            $.Boolean.reverse('0'); //true;
            $.Boolean.reverse(NaN); //true;
            $.Boolean.reverse('NaN'); //true;
            $.Boolean.reverse(false); //true;
            $.Boolean.reverse('false'); //true;
            $.Boolean.reverse(''); //true;
            $.Boolean.reverse(true); //false;
            $.Boolean.reverse({}); //false;
        */
        reverse: function (arg) {
            return !exports.parse(arg);
        },

        /**
        * 产生一个随机布尔值。
        * @return {boolean} 返回一个随机的 true 或 false。
        * @example
            $.Boolean.random();
        */
        random: function () {
            return !!Math.floor(Math.random() * 2); //产生随机数 0 或 1
        }
    });

});



define('Boolean.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Boolean = require('Boolean');


    function init(b) {
        this.value = $Boolean.parse(b);
    }

    
    module.exports =
    init.prototype =
    $Boolean.prototype = { /**@inner*/

        constructor: $Boolean,
        init: init,

        value: false,

        valueOf: function () {
            return this.value;
        },


        toString: function () {
            return this.value.toString();
        },


        toInt: function () {
            return this.value ? 1 : 0;
        },


        reverse: function () {
            this.value = !this.value;
            return this;
        },

        random: function () {
            this.value = $Boolean.random();
            return;
        }
    };

});


/**
* 日期时间工具
* @class
*/
define('Date', function (require, module, exports) {

    var $ = require('$');

    exports = function (date) {
        var prototype = require('Date.prototype');
        return new prototype.init(date);
    };

    module.exports = $.extend(exports, { /**@lends MiniQuery.Date */

        /**
        * 获取当前系统时间。
        * @return 返回当前系统时间实例。
        * @example
            $.Date.now();
        */
        now: function () {
            return new Date();
        },

        /**
        * 把参数 value 解析成等价的日期时间实例。
        * 当无法解析时，返回 null。
        * @param {Date|string} value 要进行解析的参数，可接受的类型为：
        *   1.Date 实例<br />
        *   2.string 字符串，包括调用 Date 实例的 toString 方法得到的字符串，也包括以下格式: 
            <pre>
                yyyy-MM-dd
                yyyy.MM.dd
                yyyy/MM/dd
                yyyy_MM_dd
                    
                HH:mm:ss
                    
                yyyy-MM-dd HH:mm:ss
                yyyy.MM.dd HH:mm:ss
                yyyy/MM/dd HH:mm:ss
                yyyy_MM_dd HH:mm:ss
            </pre>
        * @return 返回一个日期时间的实例。
        * @example
            $.Date.parse('2013-04-29 09:31:20');
        */
        parse: function (value) {
            if (value instanceof Date) {
                if (isNaN(value.getTime())) {
                    //throw new Error('参数是非法的日期实例');
                    return null;
                }

                return value;
            }

            if (typeof value != 'string') {
                //throw new Error('不支持该类型的参数：' + typeof value);
                return null;
            }


            //标准方式
            var date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }

            /*
                自定义方式：
                    yyyy-MM-dd
                    yyyy.MM.dd
                    yyyy/MM/dd
                    yyyy_MM_dd
                    
                    HH:mm:ss
                    
                    yyyy-MM-dd HH:mm:ss
                    yyyy.MM.dd HH:mm:ss
                    yyyy/MM/dd HH:mm:ss
                    yyyy_MM_dd HH:mm:ss
                    
            */

            function GetDate(s) {
                var now = new Date();

                var separator =
                        s.indexOf('.') > 0 ? '.' :
                        s.indexOf('-') > 0 ? '-' :
                        s.indexOf('/') > 0 ? '/' :
                        s.indexOf('_') > 0 ? '_' : null;

                if (!separator) {
                    //throw new Error('无法识别的日期格式：' + s);
                    return null;

                }

                var ps = s.split(separator);

                return {
                    yyyy: ps[0],
                    MM: ps[1] || 0,
                    dd: ps[2] || 1
                };
            }

            function GetTime(s) {
                var separator = s.indexOf(':') > 0 ? ':' : null;
                if (!separator) {
                    //throw new Error('无法识别的时间格式：' + s);
                    return null;

                }

                var ps = s.split(separator);

                return {
                    HH: ps[0] || 0,
                    mm: ps[1] || 0,
                    ss: ps[2] || 0
                };
            }


            var parts = value.split(' ');
            if (!parts[0]) {
                //throw new Error('无法识别的格式：' + value);
                return null;

            }

            var date = parts[0].indexOf(':') > 0 ? null : parts[0];
            var time = parts[0].indexOf(':') > 0 ? parts[0] : (parts[1] || null);

            if (date || time) {
                if (date && time) {
                    var d = GetDate(date);
                    var t = GetTime(time);
                    return new Date(d.yyyy, d.MM - 1, d.dd, t.HH, t.mm, t.ss);
                }

                if (date) {
                    var d = GetDate(date);
                    return new Date(d.yyyy, d.MM - 1, d.dd);
                }

                if (time) {
                    var now = new Date();
                    var t = GetTime(time);
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.HH, t.mm, t.ss);
                }
            }

            //throw new Error('无法识别的格式：' + value);
            return null;




        },

        /**
        * 把日期时间格式化指定格式的字符串。
        * @param {Date} datetime 要进行格式化的日期时间。
        * @param {string} formater 格式化的字符串。<br />
            其中保留的占位符有：
        <pre>
            'yyyy': 4位数年份
            'yy': 2位数年份
            'MM': 2位数的月份(01-12)
            'M': 1位数的月份(1-12)
            'dddd': '星期日|一|二|三|四|五|六'
            'dd': 2位数的日份(01-31)
            'd': 1位数的日份(1-31)
            'HH': 24小时制的2位数小时数(00-23)
            'H': 24小时制的1位数小时数(0-23)
            'hh': 12小时制的2位数小时数(00-12)
            'h': 12小时制的1位数小时数(0-12)
            'mm': 2位数的分钟数(00-59)
            'm': 1位数的分钟数(0-59)
            'ss': 2位数的秒钟数(00-59)
            's': 1位数的秒数(0-59)
            'tt': 上午：'AM'；下午: 'PM'
            't': 上午：'A'；下午: 'P'
            'TT': 上午： '上午'； 下午: '下午'
            'T': 上午： '上'； 下午: '下'
        </pre>
        * @return {string} 返回一个格式化的字符串。
        * @example
            //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
            $.Date.format(new Date(), 'yyyy年M月d日 h:m:s dddd')
        */
        format: function (datetime, formater) {

            var $String = require('String');

            var year = datetime.getFullYear();
            var month = datetime.getMonth() + 1;
            var date = datetime.getDate();
            var hour = datetime.getHours();
            var minute = datetime.getMinutes();
            var second = datetime.getSeconds();

            var padLeft = function (value, length) {
                return $String.padLeft(value, length, '0');
            };


            var isAM = hour <= 12;

            //这里不要用 {} 来映射，因为 for in 的顺序不确定
            var maps = [
                ['yyyy', padLeft(year, 4)],
                ['yy', String(year).slice(2)],
                ['MM', padLeft(month, 2)],
                ['M', month],
                ['dddd', '星期' + ('日一二三四五六'.charAt(datetime.getDay()))],
                ['dd', padLeft(date, 2)],
                ['d', date],
                ['HH', padLeft(hour, 2)],
                ['H', hour],
                ['hh', padLeft(isAM ? hour : hour - 12, 2)],
                ['h', isAM ? hour : hour - 12],
                ['mm', padLeft(minute, 2)],
                ['m', minute],
                ['ss', padLeft(second, 2)],
                ['s', second],
                ['tt', isAM ? 'AM' : 'PM'],
                ['t', isAM ? 'A' : 'P'],
                ['TT', isAM ? '上午' : '下午'],
                ['T', isAM ? '上' : '下']
            ];


            var s = formater;

            var replaceAll = $String.replaceAll;
            for (var i = 0, len = maps.length; i < len; i++) {

                var item = maps[i];
                s = replaceAll(s, item[0], item[1]);
            }

            return s;

        },

        /**
        * 将指定的年份数加到指定的 Date 实例上。
        * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的年份数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addYear(new Date(), 5); //假如当前时间是2013年，则返回的日期实例的年份为2018
            $.Date.addYear(-5);//假如当前时间是2013年，则返回的日期实例的年份为2008
        */
        addYears: function (datetime, value) {

            value = value * 12;
            return exports.addMonths(datetime, value);
        },

        /**
        * 将指定的月份数加到指定的 Date 实例上。
        * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的月份数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addMonths(new Date(), 15); //给当前时间加上15个月
        */
        addMonths: function (datetime, value) {
            //重载 addMonths( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMonth(datetime.getMonth() + value);

            return dt;
        },


        /**
        * 将指定的周数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的周数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。
            此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addWeeks(new Date(), 3); //给当前时间加上3周
        */
        addWeeks: function (datetime, value) {
            value = value * 7;
            return exports.addDays(datetime, value);
        },

        /**
        * 将指定的天数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的天数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。。<br />
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addDays(new Date(), 35); //给当前时间加上35天
        */
        addDays: function (datetime, value) {
            //重载 addDays( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setDate(datetime.getDate() + value);

            return dt;
        },

        /**
        * 将指定的小时数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的小时数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。<br />
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addHours(new Date(), 35); //给当前时间加上35小时
        */
        addHours: function (datetime, value) {
            //重载 addHours( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setHours(datetime.getHours() + value);

            return dt;
        },

        /**
        * 将指定的分钟数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的分钟数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。<br />
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addMinutes(new Date(), 90); //给当前时间加上90分钟
        */
        addMinutes: function (datetime, value) {
            //重载 addMinutes( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMinutes(datetime.getMinutes() + value);

            return dt;
        },

        /**
        * 将指定的秒数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的秒数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。<br />
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addSeconds(new Date(), 90); //给当前时间加上90秒
        */
        addSeconds: function (datetime, value) {
            //重载 addSeconds( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setSeconds(datetime.getSeconds() + value);

            return dt;
        },



        /**
        * 将指定的毫秒数加到指定的 Date 实例上。
        * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
        * @param {Number} value 要增加/减少的毫秒数。可以为正数，也可以为负数。
        * @return {Date} 返回一个新的日期实例。<br />
            此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
        * @example
            $.Date.addMilliseconds(new Date(), 2000); //给当前时间加上2000毫秒
        */
        addMilliseconds: function (datetime, value) {
            //重载 addMilliseconds( value )
            if (!(datetime instanceof Date)) {
                value = datetime;
                datetime = new Date(); //默认为当前时间
            }

            var dt = new Date(datetime);//新建一个副本，避免修改参数
            dt.setMilliseconds(datetime.getMilliseconds() + value);

            return dt;
        }

    });

});



define('Date.prototype', function (require, module, exports) {

    var $Date = require('Date');


    function init(date) {

        // 注意 Date(xxx)只返回一个 string，而不是一个 Date 实例。
        this.value = date === undefined ?
            new Date() :        //未指定参数，则使用当前日期时间
            $Date.parse(date);  //把参数解析成日期时间
    }


    module.exports =
    init.prototype =
    $Date.prototype = { /**@inner*/

        constructor: $Date,
        init: init,

        value: new Date(),


        valueOf: function () {
            return this.value;
        },


        toString: function (formater) {
            return $Date.format(this.value, formater);
        },


        format: function (formater) {
            return $Date.format(this.value, formater);
        },


        addYears: function (value) {
            this.value = $Date.addYears(this.value, value);
            return this;
        },

        addMonths: function (value) {
            this.value = $Date.addMonths(this.value, value);
            return this;
        },

        addDays: function (value) {
            this.value = $Date.addDays(this.value, value);
            return this;
        },

        addHours: function (value) {
            this.value = $Date.addHours(this.value, value);
            return this;
        },

        addMinutes: function (value) {
            this.value = $Date.addMinutes(this.value, value);
            return this;
        },

        addSeconds: function (value) {
            this.value = $Date.addSeconds(this.value, value);
            return this;
        },

        addMilliseconds: function (value) {
            this.value = $Date.addMilliseconds(this.value, value);
            return this;
        }
    };


});



/**
* 函数工具
* @namespace
*/
define('Function', function (require, module, exports) {


    module.exports = exports = { /**@lends MiniQuery.Function*/

        /**
        * 定义一个通用的空函数。
        * 实际使用中应该把它当成只读的，而不应该对它进行赋值。
        * @return 返回一个空函数，不执行任何操作。
        */
        empty: function () {
        },

        /**
        * 把函数绑定到指定的对象上，从而该函数内部的 this 指向该对象。
        * @param {Object} obj 要绑定的对象，即 this 要指向的对象
        * @param {function} fn 要绑定的函数，内部的 this 指向 obj
        * @return {function} 返回一个新的函数。
        * @example
            var p = { msg: 'hi js' };
            var obj = {
                msg: 'hello',
                hi: function(a, b, c) {
                    console.log(this.msg); // 'hi js'
                    console.log(a, b, c);
                }
            };
            $.Function.bind(p, obj.hi, 1, 2)(3); //传递附加参数
            $.Function.bind(p, obj.hi)(4, 5, 6); //传递附加参数
        */
        bind: function (obj, fn) {

            var args = Array.prototype.slice.call(arguments, 2); //通过 bind 传进来的参数(除了 obj 和 fn)

            return function () {
                var list = Array.prototype.slice.call(arguments, 0); //return 的这个函数传进来的参数
                list = args.concat(list); //合并外层的，即 bind 传进来的参数
                fn.apply(obj, list);
            }
        },

        /**
        * 间隔执行函数。
        * 该方法用 setTimeout 的方式实现间隔执行，可以指定要执行的次数。
        * 在回调函数中，会接收到当次执行次数。
        * @param {function} fn 要执行的函数。该函数的参数中会接收到当前的执行次数
        * @param {number|int} delay 时间间隔，单位为毫秒。
        * @param {number|int} [count] 要执行的次数，如果指定了，则在执行到该次数后自动停止。
        * @example
            //每隔 500ms执行一次，最多执行 23 次
            $.Function.setInterval(function(index) {
                console.log('A: ', index);
            }, 500, 23);
                
            //每隔 200ms 执行一次，当次数达到 15 以上时，停止
            $.Function.setInterval(function(index) {
                console.log('B: ', index);
                if(index >=15) {
                    return null; //返回 null 以停止
                }
                    
            }, 200);
        */
        setInterval: function (fn, delay, count) {

            //把每个传进来的函数当作一个 cache，而不是缓存在 arguments.callee，
            //因为是静态的，这样可以避免多个并发调用作产生混乱。
            var cache = fn;
            var next = arguments.callee;
            var key = '__MiniQuery.Funcion.setInterval.count__'; //一个私有的变量，尽可能不干扰原有的 fn
            cache[key] = (cache[key] || 0) + 1;

            var id = setTimeout(function () {

                var value = fn(cache[key]);

                if (value === null) {
                    clearTimeout(id);
                    return;
                }

                if (count === undefined || cache[key] < count) { //未传入 count 或 未达到指定次数
                    next(fn, delay, count);
                }

            }, delay);

        },

        debounce: function (fn, delay) {

            var timeoutId = null;

            return function () {

                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn, delay);
            }

        }


    };


});



/**
* 数学工具类
* @namespace
*/
define('Math', function (require, module, exports) {

    module.exports = exports = {  /**@lends MiniQuery.Math*/

        /**
        * 产生指定闭区间的随机整数。
        * @param {number} [minValue=0] 闭区间的左端值。
            当只指定一个参数时，minValue 默认为 0；
        * @param {number} [maxValue] 闭区间的右端值。
        * @return 返回一个整数。<br />
            当不指定任何参数时，则用 Math.random() 产生一个已移除了小数点的随机整数。
        * @example
            $.Math.randomInt(100, 200); //产生一个区间为 [100, 200] 的随机整数。
            $.Math.randomInt(100); //产生一个区间为 [0, 200] 的随机整数。
            $.Math.randomInt(); //产生一个随机整数。
        */
        randomInt: function (minValue, maxValue) {
            if (minValue === undefined && maxValue === undefined) { // 此时为  Math.randomInt()

                //先称除小数点，再去掉所有前导的 0，最后转为 number
                return Number(String(Math.random()).replace('.', '').replace(/^0*/g, ''));
            }
            else if (maxValue === undefined) {
                maxValue = minValue;    //此时相当于 Math.randomInt(minValue)
                minValue = 0;
            }

            var count = maxValue - minValue + 1;
            return Math.floor(Math.random() * count + minValue);
        },

        /**
        * 圆形求模方法。
        * 即用圆形链表的方式滑动一个数，返回一个新的数。
        * 即可正可负的双方向求模。
        * 可指定圆形链表的长度(size) 和滑动的步长(step)，滑动步长的正负号指示了滑动方向
        */
        slide: function (index, size, step) {
            step = step || 1; //步长默认为1

            index += step;
            if (index >= 0) {
                return index % size;
            }

            return (size - (Math.abs(index) % size)) % size;
        },

        /**
        * 下一个求模数
        */
        next: function (index, size) {
            return exports.slide(index, size, 1);
        },

        /**
        * 上一个求模数
        */
        previous: function (index, size, step) {
            return exports.slide(index, size, -1);
        },

        /**
        * 把一个字符串解析成十进制的整型
        */
        parseInt: function (string) {
            return parseInt(string, 10);
        },

        /**
        * 把一个含有百分号的字符串解析成等值的小数。
        * @param {string} v 要解析的参数。
            期望得到 string 类型，实际可传任何类型。
        * @return {Number} 返回一个小数。
            只有参数是字符串，并且去掉前后空格后以百分号结尾才会进行转换；否则直接返回参数。
            如果解析失败，则返回 NaN。
        */
        parsePercent: function (v) {

            var $String = require('String');

            if (typeof v == 'string' && $String(v).trim().endsWith('%')) {
                return parseInt(v) / 100;
            }

            return v;
        }

    };

});



/**
* @fileOverview 对象工具
*/



/**
* 对象工具
* @class
* @param {Object} obj 要进行包装的对象
* @return {MiniQuery.Object} 返回一个经过包装后的 MiniQuery.Object 对象
* @example
    $.Object( {a:1, b:2} );
或  new $.Object( {a:1, b:2} );
*/

define('Object', function (require, module, exports) {

    var $ = require('$');


    exports = function (obj) {
        var prototype = require('Object.prototype');
        return new prototype.init(obj);
    };

    module.exports = $.extend(exports, { /**@lends MiniQuery.Object */

        /**
        * 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
        * @function
        * @param {Object} arguments[0] 要进行扩展的对象 
        * @param {Object} arguments[1] 要进行复制的第1个对象
        * @param {Object} arguments[n] 要进行复制的第n个对象，依次类推
        * @return {Object} 返回被扩展的对象，即第一个参数。
            如果参数为空，则返回 {}。
            如果只有一个参数，则直接返回该参数。
            否则：把第二个参数到最后一个参数的成员拷贝到第一个参数对应中去，并返回第一个参数。
        * @example 
            var obj = {
                a: 1, 
                b: 2
            };
            var obj2 = $.Object.extend(obj, {b:3}, {c:4});
            //结果：
            obj = {a:1, b:3, c:4}; 
            //并且 
            obj === obj2 //为 true
        */
        extend: $.extend,

        /**
        * 用一种安全的方式来扩展对象。
        * 当目标对象不存在指定的成员时，才给该目标对象添加(扩展)该成员。
        */
        extendSafely: function () {
            var len = arguments.length;
            if (len == 0) {
                return null;
            }

            var target = arguments[0];
            if (len == 1) {
                return target;
            }

            for (var i = 1; i < len; i++) {
                var obj = arguments[i];

                for (var key in obj) {
                    if (key in target) //目标对象中已含有该成员，略过
                    {
                        continue;
                    }

                    //否则，添加
                    target[key] = obj[key];
                }
            }

            return target;
        },

        /**
        * 用多个对象深度扩展一个对象。
        */
        extendDeeply: function (target, obj1, obj2) {

            function fn(A, B) {
                A = A || {};

                for (var key in B) {
                    var value = B[key];

                    if (exports.isPlain(value)) {
                        value = fn(A[key], value);
                    }

                    A[key] = value;
                }

                return A;
            }


            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                target = fn(target, obj1);
            }

            if (obj2 && typeof obj2 == 'object') {
                target = fn(target, obj2);
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) { //已处理完所有参数
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                var objI = arguments[i];
                target = fn(target, objI);
            }

            return target;

        },


        /**
        * 深度克隆一个纯对象或数组。
        * @param {Object|Array} obj 要进行克隆的对象或数组。
            如果 obj 是数组，则返回一个拷贝数组，并且会对数组中的每项调用 clone 。
            如果 obj 不是纯对象，则直接返回该对象，不进行克隆。
        * @return {Object|Array} 克隆后的对象或数组。
        * @example
            var obj = {a: 1, b: 2, c: {a: 10, b: 20} };
            var obj2 = $.Object.clone( obj );
            console.dir( obj2 );          //与 obj 一致
            console.log( obj2 === obj );  //false
        */
        clone: function (obj) {

            var $Array = require('Array');
            var clone = arguments.callee;

            var $ = MiniQuery;

            if (exports.isArray(obj)) {
                return $Array.keep(obj, function (item, index) {
                    //优化，避免再次进入 clone 方法
                    if (!item || exports.isValueType(item) || !exports.isPlain(item)) {
                        return item;
                    }

                    return clone(item);
                });
            }

            // null、undefined、0、NaN、false、''
            // 值类型：string、number、boolean
            // 非纯对象
            if (!obj || exports.isValueType(obj) || !exports.isPlain(obj)) {
                return obj;
            }


            var target = {};

            for (var key in obj) {

                var value = obj[key];

                switch (typeof value) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                    case 'function':
                    case 'undefined':
                        target[key] = value;
                        break;

                    case 'object':
                        target[key] = clone(value);   //递归调用
                        break;
                }
            }

            return target;
        },

        /**
        * 对一个对象进行迭代。
        * 该方法可以代替 for in 的语句。
        * 只有在回调函数中明确返回 false 才停止循环。
        * @param {Object} obj 要进行迭代处理的对象
        * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
        * @param {boolean} [isDeep=false] 
            指示是否要进行深层次的迭代，如果是，请指定 true；
            否则请指定 false 或不指定。默认为 false，即浅迭代
        * @example
            var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
            $.Object.each(obj, function(key, value) {
                console.log(key, ': ', value);
            }, true);
        输出：
            a: 1,
            b: 2,
            A: 11,
            B: 22
        */
        each: function (obj, fn, isDeep) {

            var each = arguments.callee;

            for (var key in obj) {
                var value = obj[key];

                //指定了深迭代，并且当前 value 为非 null 的对象
                if (isDeep === true && value && typeof value == 'object') {
                    each(value, fn, true); //递归
                }
                else {
                    // 只有在 fn 中明确返回 false 才停止循环
                    if (fn(key, value) === false) {
                        break;
                    }
                }
            }
        },

        /**
        * 获取一个对象的真实类型的字符串描述。
        * @param obj 要检测的对象，可以是任何类型。
        * @return {String} 返回该对象的类型的字符串描述。
            当参数为 null、undefined 时，返回 null、undefined；<br />
            当参数为 string、number、boolean 的值类型时，返回 string、number、boolean；<br />
            否则返回参数的实际类型的字符串描述(构造函数的名称)：<br />
            如 Array、String、Number、Boolean、Object、Function、RegExp、Date 等
        * @example
            $.Object.getType();         //'undefined'
            $.Object.getType(null);     //'null'
            $.Object.getType('hello');  //'string'
            $.Object.getType(100);      //'number'
            $.Object.getType(false);    //'boolean'
            $.Object.getType({});       //'Object'
            $.Object.getType(function(){});//'Function'
            $.Object.getType([0, 1, 2]);   //'Array'
        */
        getType: function (obj) {
            return obj === null ? 'null' :
                obj === undefined ? 'undefined' :

                //处理值类型
                typeof obj == 'string' ? 'string' :
                typeof obj == 'number' ? 'number' :
                typeof obj == 'boolean' ? 'boolean' :

                //处理对象类型、包装类型
                Object.prototype.toString.call(obj).slice(8, -1); //去掉 "[object" 和 "]"
        },

        /**
        * 判断一个对象是否为数组类型。<br />
        * 注意：如果是跨窗口取得的数组，请使用非严格判断。<br />
        * 由于 IE 的兼容性问题，对于跨窗口取得的数组，请在使用其实例方法之前把它转成真正的数组，否则会报错。
        * @param {Object} obj 要进行判断的对象，可以是任何类型
        * @param {boolean} [useStrict] 指定是否要进行严格判断，如果是请传入 true；否则当成非严格判断
        * @return {boolean} 一个判断结果，如果为数组则返回 true；否则返回 false
        * @example
            $.Object.isArray([]) //true
            $.Object.isArray({}) //false
        */
        isArray: function (obj, useStrict) {
            if (useStrict === true) { //指定了要严格判断
                return obj instanceof Array;
            }

            //高端浏览器，如 IE9+、Firefox 4+、Safari 5+、Opera 10.5+ 和 Chrome
            if (typeof Array.isArray == 'function') { //优先使用原生的
                return Array.isArray(obj);
            }

            //加上 obj instanceof Array 并且优先检测，是为了优化，也是为了安全起见。
            return (obj instanceof Array) ||
                (exports.getType(obj) == 'Array');
        },

        /**
        * 判断一个对象是否为字符串字类型。
        * @param {Object} obj 要进行判断的对象，可以是任何类型。
        * @return {boolean} 一个判断结果，如果为字符串则返回 true；否则返回 false。
        * @example
            $.Object.isString( new String(100) ) //false
            $.Object.isString( '100' ) //true
        */
        isString: function (obj) {
            return typeof obj == 'string';
        },

        /**
        * 判断一个对象是否为数字类型。
        * @param {Object} obj 要进行判断的对象，可以是任何类型。
        * @return {boolean} 一个判断结果，如果为数字则返回 true；否则返回 false。
        * @example
            $.Object.isNumber( new Number(100) ) //false
            $.Object.isNumber( 100 ) //true
        */
        isNumber: function (obj) {
            return typeof obj == 'number';
        },

        /**
        * 判断一个对象是否为函数类型。
        * @param {Object} obj 要进行判断的对象，可以是任何类型。
        * @return {boolean} 一个判断结果，如果为函数则返回 true；否则返回 false。
        * @example
            $.Object.isFunction([]) //false
            $.Object.isFunction(function(){}) //true
        */
        isFunction: function (obj) {
            return typeof obj == 'function';
        },


        /**
        * 判断一个对象是否为内置类型。<br />
        * 内置类型是指 String, Number, Boolean, Array, Date, RegExp, Function。
        * @param {Object} obj 要进行判断的对象，可以是任何类型
        * @return {boolean} 一个判断结果，如果为内置类型则返回 true；否则返回 false
        * @example
            $.Object.isBuiltinType( 100 );   //false
            $.Object.isBuiltinType( new Number(100) ); //true
            $.Object.isBuiltinType( {} );    //false
            $.Object.isBuiltinType( [] );    //true
        */
        isBuiltinType: function (obj) {
            var types = [String, Number, Boolean, Array, Date, RegExp, Function];

            for (var i = 0, len = types.length; i < len; i++) {
                if (obj instanceof types[i]) {
                    return true;
                }
            }

            return false;
        },


        /**
        * 检测对象是否是空对象(不包含任何属性)。<br />
        * 该方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用 hasOwnProperty )。<br />
        * 该实现为 jQuery 的版本。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果为空对象则返回 true；否则返回 false
        * @example
            $.Object.isEmpty( {} );      //true
            
            function Person(){ }
            Person.prototype.name = 'abc';
            var p = new Person();
            $.Object.isEmpty( p );   //false
        */
        isEmpty: function (obj) {
            for (var name in obj) {
                return false;
            }

            return true;
        },

        /**
        * 检测一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
        * 该实现为 jQuery 的版本。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果为纯粹的对象则返回 true；否则返回 false
        * @example
            $.Object.isPlain( {} );             //true
            $.Object.isPlain( {a: 1, b: {} } );  //true
            
            function Person(){ }
            var p = new Person();
            $.Object.isPlain( p );   //false
        */
        isPlain: function (obj) {
            if (!obj || typeof obj != 'object' /*|| obj.nodeType || exports.isWindow(obj) */) {
                return false;
            }

            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var constructor = obj.constructor;

            try {
                // Not own constructor property must be Object
                if (constructor &&
                    !hasOwnProperty.call(obj, "constructor") &&
                    !hasOwnProperty.call(constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            }
            catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var key;
            for (key in obj) {
            }

            return key === undefined || hasOwnProperty.call(obj, key);
        },

        /**
        * 判断一个对象是否为值类型。<br />
        * 即 typeof 的结果是否为 string、number、boolean 中的一个。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果为 值类型则返回 true；否则返回 false
        * @example
            $.Object.isValueType(100);              //true
            $.Object.isValueType( new Number(100) );//false
        */
        isValueType: function (obj) {
            //不要用这种，否则在 rhino 的 js 引擎中会不稳定
            //return (/^(string|number|boolean)$/g).test(typeof obj); 
            var type = typeof obj;
            return type == 'string' || type == 'number' || type == 'boolean';
        },

        /**
        * 判断一个对象是否为包装类型。<br />
        * 包装类型是指 String, Number, Boolean 的 new 的实例。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果包装类型则返回 true；否则返回 false
        * @example
            console.log( $.Object.isWrappedType(100) ); //false
            console.log( $.Object.isWrappedType( new Number(100) ) );  //true
            console.log( $.Object.isWrappedType('abc') );  //false
            console.log( $.Object.isWrappedType( new String('abc') ) );  //true
            console.log( $.Object.isWrappedType(true) );  //false
            console.log( $.Object.isWrappedType( new Boolean(true) ) );  //true
        */
        isWrappedType: function (obj) {
            var types = [String, Number, Boolean];
            for (var i = 0, len = types.length; i < len; i++) {
                if (obj instanceof types[i]) {
                    return true;
                }
            }

            return false;
        },

        /**
        * 判断一个对象是否为非空的对象。
        * 非空对象是指 typeof 结果为 object 或 function，并且不是 null。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果是非空的对象则返回 true；否则返回 false。
        * @example
            console.log( $.Object.isNonNull( null ) );  //false
            console.log( $.Object.isNonNull( {} ) );  //true
            console.log( $.Object.isNonNull(100) ); //false
            console.log( $.Object.isNonNull( new Number(100) ) );  //true
            console.log( $.Object.isNonNull('abc') );  //false
            console.log( $.Object.isNonNull( new String('abc') ) );  //true
            console.log( $.Object.isNonNull(true) );  //false
            console.log( $.Object.isNonNull( new Boolean(true) ) );  //true
        */
        isNonNull: function (obj) {
            if (!obj) { //false、null、undefined、''、NaN、0
                return false;
            }

            var type = typeof obj;
            return type == 'object' || type == 'function';
        },

        /**
        * 一个简单的方法来判断一个对象是否为 window 窗口。
        * 该实现为 jQuery 的版本。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果为 window 窗口则返回 true；否则返回 false
        * @example
            $.Object.isWindow( {} ); //false
            $.Object.isWindow(top);  //true
        */
        isWindow: function (obj) {
            return obj &&
                typeof obj == 'object' &&
                'setInterval' in obj;
        },

        /**
        * 一个简单的方法来判断一个对象是否为 document 对象。
        * @param {Object} obj 要进行检测的对象，可以是任何类型
        * @return {boolean} 一个检测结果，如果为  document 对象则返回 true；否则返回 false
        * @example
            $.Object.isDocument( {} );      //false
            $.Object.isDocument(document);  //true
        */
        isDocument: function (obj) {
            return obj &&
                typeof obj == 'object' &&
                'getElementById' in obj;
        },

        /**
        * 对象映射转换器，返回一个新的对象。
        * @param {Object} obj 要进行迭代处理的对象
        * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
        * @param {boolean} [isDeep=false] 指示是否要进行深层次的迭代。
            如果是，请指定 true；
            否则请指定 false 或不指定。
            默认为 false，即浅迭代
        * @return {Object} 返回一个新的对象，key 仍为原来的 key，value 由回调函数得到
        * @example
            var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
            var obj2 = $.Object.map(obj, function(key, value) {
                return value * 100;
            }, true);
            console.dir(obj2);
        结果：
            obj2 = {a: 100, b: 200, c: {A: 1100, B: 2200}};
        */
        map: function (obj, fn, isDeep) {
            var map = arguments.callee; //引用自身，用于递归
            var target = {};

            for (var key in obj) {
                var value = obj[key];

                if (isDeep && exports.isPlain(value)) { //指定了深迭代，并且当前 value 为纯对象
                    target[key] = map(value, fn, isDeep); //递归
                }
                else {
                    target[key] = fn(key, value);
                }
            }

            return target;
        },

        /**
        * 给指定的对象快速创建多层次的命名空间，返回创建后的最内层的命名空间所指的对象。
        * @param {Object} [arg0=global] 
            要在其上面创建命名空间的对象容器。当不指定时，则默认为当前的 global 对象。
        * @param {string} arg1 命名空间，以点号进行分隔
        * @param {Object} arg2 命名空间最终指向的对象
        * @return {Object} 返回创建后的最内层的命名空间所指的对象
        * @example
            //给 obj 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
            $.Object.namespace(obj, 'A.B.C', {a:1, b:2});
            console.dir( obj.A.B.C ); //结果为 {a:1, b:2}
            
            //给当前的 global 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
            $.Object.namespace('A.B.C', {a:1, b:2});
            console.dir( A.B.C ); //结果为 {a:1, b:2}
            
            //给当前的 global 象分别创建一个 $.AA 和 $.BB 的命名空间，其值为分别 source.A 和 source.B
            $.Object.namespace(source, {
                'A': '$.AA', //source.AA -> $.A
                'B': '$.BB'  //source.BB -> $.B
            });
            
            //给 obj 对象分别创建 obj.A 和 obj.B 命名空间，其值分别为  source.A 和 source.B
            $.Object.namespace(obj, source, ['A', 'B']);
        * 
        */
        namespace: function (arg0, arg1, arg2) {

            //这个是最原始的方式：exports.namespace(obj, 'A.B.C', {a:1, b:2});
            function fn(container, path, value) {
                var list = path.split('.'); //路径
                var obj = container;

                var len = list.length;      //路径长度
                var lastIndex = len - 1;    //路径中最后一项的索引

                var isGet = value === undefined; //指示是否为取值操作，当不指定 value 时，则认为是取值操作

                for (var i = 0; i < len; i++) //迭代路径
                {
                    var key = list[i];

                    //是获取操作，但不存在该级别
                    if (isGet && !(key in obj)) {
                        return; //退出，避免产生副作用(创建对象)
                    }

                    if (i < lastIndex) {
                        obj[key] = obj[key] || {};
                        obj = obj[key]; //为下一轮做准备
                    }
                    else //最后一项
                    {
                        if (value === undefined) //不指定值时，则为获取
                        {
                            return obj[key];
                        }

                        //指定了值
                        obj[key] = value; //全量赋值

                    }
                }

                return value;
            }

            //此时为最原始的
            //exports.namespace(container, 'A.B.C', value );
            if (typeof arg1 == 'string') {
                var container = arg0;
                var path = arg1;
                var value = arg2;

                return fn(container, path, value);
            }

            //此时为
            //exports.namespace('A.B.C', value)
            if (typeof arg0 == 'string') {
                var container = global;
                var path = arg0;
                var value = arg1;

                return fn(container, path, value);
            }

            /*
            此时为：
                exports.namespace(source, {
                    'Object': '$.Object',   //source.Object -> $.Object
                    'Array': '$.Array'      //source.Array -> $.Array
                });
            要实现的功能：
                $.Object = source.Object;
                $.Array = source.Array;
            */
            if (exports.isPlain(arg1) && arg2 === undefined) {
                //换个名称更容易理解
                var source = arg0;      //此时第一个参数为要被遍历拷贝的对象 source
                var maps = arg1;        //此时第二个参数为键值对映射表 maps
                var container = global; //此时目标容器为当前的 global

                //遍历映射表
                exports.each(maps, function (key, path) {
                    if (typeof path != 'string') {
                        throw new Error('当指定第二个参数为键值对映射表时，值必须为 string 类型');
                    }

                    var value = source[key];
                    fn(container, path, value);
                });

                return container;
            }

            //
            /*
            此时为： 
                exports.namespace(container, source, ['Object', 'Array']);
            要实现的功能：
                container.Object = source.Object;
                container.Array = source.Array;    
            */
            if (exports.isArray(arg2)) {

                var $Array = require('Array');

                //换个名称更容易理解
                var container = arg0;   //此时第一个参数为目标容器 container
                var source = arg1;      //此时第二个参数为要被遍历拷贝的对象 source
                var keys = arg2;        //此时第三个参数是要拷贝的键列表

                //遍历键列表
                $Array.each(keys, function (key) {
                    container[key] = source[key];
                });

                return container;
            }
        },

        /**
        * 把 JSON 字符串解析成一个 Object 对象。
        * 该方法是 jQuery 的实现。
        * @param {String} data 要进行解析的 JSON 字符串
        * @return {Object} 返回一个等价的对象
        */
        parseJson: function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }

            var $String = require('String');

            data = $String.trim(data);

            if (global.JSON && global.JSON.parse) //标准方法
            {
                return global.JSON.parse(data);
            }

            var rvalidchars = /^[\],:{}\s]*$/,
                rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

            data = data.replace(rvalidescape, '@')
                       .replace(rvalidtokens, ']')
                       .replace(rvalidbraces, '');

            if (!rvalidchars.test(data)) {
                throw new Error('非法的 JSON 数据: ' + data);
            }

            return (new Function('return ' + data))();
        },


        /**
        * 把 Url 中的查询字符串解析为等价结构的 Object 对象。
        * @param {string} url 要进行解析的查询字符串。
        * @param {boolean} [isShallow=false] 指示是否使用浅层次进行解析。
            当显式指定 isShallow 参数为 true 时，则使用浅层次来解析(只解析一层，不进行递归解析)；
            否则(默认)使用深层次解析。
        * @param {boolean} [isCompatible=false] 指示是否使用兼容模式进行解码。
            当指定 isCompatible 参数为 true 时，将使用 unescape 来编码；
            否则(默认)使用 decodeURIComponent。
        * @return {Object} 返回一个包含键值对的 Object 对象。
            当参数 url 非法时，返回空对象 {}。
        * @example
            var url = 'a=1&b=2&c=A%3D100%26B%3D200';
            var obj = $.Object.parseQueryString(url);
        得到 obj = {a: 1, b:2, c: {A: 100, B: 200}};
        */
        parseQueryString: function (url, isShallow, isCompatible) {

            if (!url || typeof url != 'string') {
                return {}; //这里不要返回 null，免得外部调用出错
            }

            var $String = require('String');

            var fn = arguments.callee;
            var decode = isCompatible ? unescape : decodeURIComponent;  //解码方法，默认用后者
            var isDeep = !isShallow;    //深层次解析，为了语义上更好理解，换个名称
            var toValue = $String.toValue; //缓存一下方法，以提高循环中的性能


            var obj = {};

            var pairs = url.split('&');

            for (var i = 0, len = pairs.length; i < len; i++) {

                var name_value = pairs[i].split('=');

                var name = decode(name_value[0]);
                var value = name_value.length > 1 ? decode(name_value[1]) : ''; //后者针对没有'='号的情况

                //深层次解析
                if (isDeep && value.indexOf('=') > 0) { //还出现=号，说明还需要进一层次解码
                    value = fn(value); //递归调用
                }
                else { //处理一下字符串类型的 0|1|true|false|null|undefined|NaN
                    value = toValue(value); //还原常用的数据类型
                }

                if (name in obj) {
                    var a = obj[name];
                    if (a instanceof Array) {
                        a.push(value);
                    }
                    else {
                        obj[name] = [a, value];
                    }
                }
                else {
                    obj[name] = value;
                }
            }

            return obj;
        },

        /**
        * 删除对象中指定的成员，返回一个新对象。
        * 指定的成员可以以单个的方式指定，也可以以数组的方式指定(批量)。
        * @param {Object} obj 要进行处理的对象。
        * @param {String|Array|Object} keys 要删除的成员名称，可以是单个，也可以是批量。
        * @return {Object} 返回一个被删除相应成员后的新对象。
        * @example
            var obj = {
                a: 1, 
                b: 2, 
                c: 3
            };
    
            var o = $.Object.remove(obj, ['a', 'c']); //移除成员 a 和 c 
            console.dir(o); //得到 o = { b: 2 };
    
            o = $.Object.remove(obj, {a: 1, b: 2});
            console.dir(o); //得到 o = { c: 3 };
        */
        remove: function (obj, keys) {
            var target = exports.extend({}, obj); //浅拷贝一份

            if (typeof keys == 'string') {
                delete target[keys];
            }
            else if (exports.isArray(keys)) {
                for (var i = 0, len = keys.length; i < len; i++) {
                    delete target[keys[i]];
                }
            }
            else {
                for (var key in keys) {
                    delete target[key];
                }
            }

            return target;
        },

        /**
        * 用一组指定的名称-值对中的值去替换指定名称对应的值。
        * 当指定第三个参数为 true 时，将进行第一层次的搜索与替换，否则替换所有同名的成员为指定的值
        */
        replaceValues: function (target, nameValues, isShallow) {
            for (var key in target) {
                var val = target[key];
                switch (typeof val) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        for (var name in nameValues) {
                            if (key == name) {
                                target[key] = nameValues[name];
                                break;
                            }
                        }
                        break;
                    case 'object':
                        !isShallow && arguments.callee(val, nameValues);
                        break;
                }
            }
            return target;
        },

        /**
        * 把一个 Object 对象转成一个数组。
        * @param {Object} obj 要进行转换的对象
        * @param {Array|boolean|function} [rule=undefined] 转换映射规则。<br />
        *   当未指定参数 rule 时，则使用 for in 迭代收集 obj 中的值，返回一个一维的值数组；<br />
        *   当指定参数 rule 为一个数组时，则按 rule 中的顺序迭代收集 obj 中的值，返回一个一维的值的数组；<br />
        *   当指定参数 rule 为 true 时，则使用 for in 迭代收集 obj 中的名称和值，返回一个[key, value] 的二维数组，<br />
        *       即该数组中的每一项的第0个元素为名称，第1个元素为值。<br />
        *   当指定参数 rule 为一个处理函数时，将使用该处理函数的返回值作为收集到数组的值，<br />
        *       处理函数会接收到两个参数：该对象迭代的 key 和 value。<br />
        *       当返回值为 null 时，将忽略它（相当于 continue）；<br />
        *       当返回值为 undefined 时，将停止迭代（相当于 break）；<br />
        * @param {boolean} [isDeep=false] 指定是否递归处理。
            若要递归转换，请指定 true；否则请指定 false 或不指定
        * @return 返回一个数组
        * @example
            var obj = { 
                a: 1, 
                b: 2, 
                c: {
                    A: 100, 
                    B: 200, 
                    C: {
                        aa: 'a', 
                        bb: 'b'
                    } 
                } 
            };
            
            var a = $.Object.toArray(obj, null, true);
            console.dir(a);
            
            var b = $.Object.toArray(obj, ['b', 'c', 'a']);
            console.dir(b);
            
            var c = $.Object.toArray(obj, true, true);
            console.dir(c);
            
            var d = $.Object.toArray(obj, function(key, value) {
                return value + 1000;
            }, true);
            
            console.dir(d);
        * 
        */
        toArray: function (obj, rule, isDeep) {

            var toArray = arguments.callee; //引用自身，用于递归

            if (!rule) //未指定 rule: undefined|null|false
            {
                return exports.getValues(obj, isDeep);
            }

            //否则，指定了 rule 转换规则。

            // 传进来的是一个 key 数组
            if (rule instanceof Array) {
                //注意，这里不要用 $.Array.map 来过滤，
                //因为 map 会忽略掉 null 和 undefined 的值，这是不合适的

                var keys = rule; //换个名称更好理解
                var a = [];

                for (var i = 0, len = keys.length; i < len; i++) //此时没有深迭代，因为 keys 只用于第一层
                {
                    var value = obj[keys[i]]; //取得当前 key 所对应的 value
                    a.push(value); // keys[i] -> key -> value
                }

                return a;
            }

            //指定了保留 key，则返回一个二维数组
            if (rule === true) {
                var a = [];
                for (var key in obj) {
                    var value = obj[key];
                    if (isDeep === true && value && typeof value == 'object') {
                        value = toArray(value, rule, isDeep);
                    }
                    a.push([key, value]);
                }

                return a; //此时为 [ [key, value], [key, value], ... ]
            }

            //传进来的是处理函数
            if (typeof rule == 'function') {
                var fn = rule;
                var a = [];

                for (var key in obj) {
                    var value = obj[key];

                    if (isDeep === true && value && typeof value == 'object') {
                        value = toArray(value, rule, isDeep);
                    }
                    else {
                        value = fn(key, value); //调用处理函数以取得返回值
                    }

                    if (value === null) {
                        continue;
                    }

                    if (value === undefined) {
                        break;
                    }

                    a.push(value);
                }

                return a;
            }
        },

        /**
        * 把一个对象转成 JSON 字符串
        * @param {Object} obj 要进行转换的对象
        * @return {String} 返回一个 JSON 字符串
        */
        toJson: function (obj) {

            if (global.JSON) {
                var fn = function (obj) {
                    return global.JSON.stringify(obj);
                };

                exports.toJson = fn; //重写
                return fn(obj);
            }


            if (obj == null) { // null 或 undefined

                return String(obj);
            }

            switch (typeof obj) {
                case 'string':
                    return '"' + obj + '"';
                case 'number':
                case 'boolean':
                    return obj;
                case 'function':
                    return obj.toString();
            }

            //处理包装类和日期
            if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
                return arguments.callee(obj.valueOf());
            }

            //处理正则表达式
            if (obj instanceof RegExp) {
                return arguments.callee(obj.toString());
            }

            //处理数组
            if (exports.isArray(obj)) {
                var list = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    list.push(arguments.callee(obj[i]));
                }

                return '[' + list.join(', ') + ']';
            }

            var pairs = [];
            for (var name in obj) {
                pairs.push('"' + name + '": ' + arguments.callee(obj[name]));
            }
            return '{ ' + pairs.join(', ') + ' }';
        },

        /**
        * 把一个对象编码成等价结构的 Url 查询字符串。
        * @param {Object} obj 要进行编码的对象
        * @param {boolean} [isCompatible=false] 
            指定是否要使用兼容模式进行编码。<br />
            当需要使用 escape 进行编码时，请指定 true；<br />
            否则要使用 encodeURIComponent 进行编码，请指定 false 或不指定。
        * @return {string} 返回一个经过编码的 Url 查询字符串
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: { A: 100, B: 200 },
                d: null,
                e: undefined,
                f: ['a', 'b', 'c']
            };
            var s = $.Object.toQueryString(obj);
            console.log(s); 
            //结果 a=1&b=2&c=A%3D100%26B%3D200&d=null&e=undefined&f=%5Ba%2C%20b%5D
        */
        toQueryString: function (obj, isCompatible) {

            if (obj == null) {     // null 或 undefined
                return String(obj);
            }

            switch (typeof obj) {
                case 'string':
                case 'number':
                case 'boolean':
                    return obj;
            }

            if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
                return obj.valueOf();
            }

            if (exports.isArray(obj)) {
                return '[' + obj.join(', ') + ']';
            }

            var fn = arguments.callee;
            var encode = isCompatible ? escape : encodeURIComponent;

            var pairs = [];
            for (var name in obj) {
                pairs.push(encode(name) + '=' + encode(fn(obj[name])));
            }

            return pairs.join('&');

        },

        /**
        * 删除对象的成员中值为指定的值列表中的成员，返回一个新对象。
        * @param {Object} obj 要进行处理的对象
        * @param {Array} [values=[undefined, null]] 要进行删除的值的列表。
            只要成员中包含该列表中的值，就会给删除。
            默认会删除值为 undefined 和 null 的成员。
        * @param {boolean} [isDeep=false] 指定是否深层次(递归)搜索。
            如果要深层次搜索，请指定 true；
            否则，请指定 false 或不指定。
        * @return {Object} 返回一个经过删除成员的新对象。
            该对象中不包含值为指定的值列表中的项的成员。
        * @example
            var d = {
                A: 11, 
                B: null, 
                C: undefined,
                D: '0'
            };
            var obj = {
                a: 1, 
                b: null, 
                c: undefined, 
                d: d
            };
            var obj2 = $.Object.trim(obj, [null, undefined, '0'], true );
            
            console.dir(obj);   //结果没变
            console.dir(obj2);  //结果为 {a: 1, d: {AA: 11}}
            console.dir(d);     //结果没变
            console.log(obj.d === d); //true
        */
        trim: function (obj, values, isDeep) {

            if (!values && !isDeep) { //针对最常用的情况 trim(obj) 作优化
                var target = {};

                for (var key in obj) {
                    var value = obj[key];
                    if (value == null) { // undefined、null
                        continue;
                    }

                    target[key] = value;
                }

                return target;
            }

            var $Array = require('Array');

            var trim = arguments.callee; //引用自身，递归要用到
            var contains = $Array.contains;  //缓存一下，提高循环中的性能
            var extend = exports.extend;     //缓存一下，提高循环中的性能

            if (typeof values == 'boolean') { //重载 trim(obj, isDeep);
                isDeep = values;
                values = undefined;
            }

            if (!values) {
                values = [null, undefined];
            }

            var target = extend({}, obj); //浅拷贝一份

            for (var key in target) {
                var value = target[key];

                if (contains(values, value)) {
                    delete target[key]; //注意，这里不能用 delete value
                    continue;
                }

                if (isDeep === true && typeof value == 'object' && value) {
                    value = extend({}, value);          //浅拷贝一份
                    target[key] = trim(value, values, true);  //递归
                }
            }

            return target;
        },

        /**
        * 跨浏览器的 Object.create 方法。
        * 该方法会优化使用原生的 Object.create 方法，当不存在时，才使用自己的实现。
        * @example
            var obj = $.Object.create({
                name: 'micty',
                sayHi: function() {
                    console.log( this.name );
                }
            });
        
            obj.sayHi();
        */
        create: function (obj) {
            //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
            var fn = typeof Object.create === 'function' ? Object.create : function (obj) {
                function F() {
                }

                F.prototype = obj;
                F.prototype.constructor = F;

                return new F();
            }

            exports.create = fn;

            return fn(obj);
        },

        /**
        * 对一个对象进行成员过滤，返回一个过滤后的新对象。
        * 该方法可以以某个模板对指定对象进行成员拷贝。
        * @param {Object} src 要进行拷贝的对象，即数据来源。
        * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
        * @return {Object} 返回一个过滤后的新对象。
        * @example
            var src = {
                a: 100,
                b: 200,
                c: 300,
                d: 400
            };
    
            var samples = {
                a: 1,
                b: 2
            };
    
            //或 samples = ['a', 'b'];
    
            var obj = $.Object.filter(src, samples);
            console.dir(obj); //得到 obj = { a: 100, b: 200 }; 只保留 samples 中指定的成员，其他的去掉.
        */
        filter: function (src, samples) {

            var $Array = require('Array');

            var obj = {};

            if (exports.isArray(samples)) {
                $Array.each(samples, function (key, index) {

                    if (key in src) {
                        obj[key] = src[key];
                    }
                });
            }
            else if (exports.isPlain(samples)) {
                exports.each(samples, function (key, value) {

                    if (key in src) {
                        obj[key] = src[key];
                    }
                });
            }
            else if (typeof samples == 'string') {
                var key = samples;
                if (key in src) {
                    obj[key] = src[key];
                }

            }
            else {
                throw new Error('无法识别参数 samples 的类型');
            }


            return obj;
        },

        /**
        * 对一个源对象进行成员过滤，并把过滤后的结果扩展到目标对象上。
        * 该方法可以从指定的对象上拷贝指定的成员到目标对象上。
        * @param {Object} target 接收成员的目标对象。
        * @param {Object} src 要进行拷贝的对象，即数据来源。
        * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
        * @return {Object} 返回一个过滤后的新对象。
        * @example
            var target = {
                myName: 'micty'
            };
    
            var src = {
                a: 100,
                b: 200,
                c: 300,
                d: 400
            };
    
            var samples = {
                a: 1,
                b: 2
            };
    
            //或 samples = ['a', 'b'];
    
            $.Object.filterTo(target, src, samples);
            console.dir(target); //得到 target = { myName: 'micty', a: 100, b: 200 };
        */
        filterTo: function (target, src, samples) {
            var obj = exports.filter(src, samples);
            return exports.extend(target, obj);
        },

        /**
        * 使用过滤函数对指定的对象进行过滤数，返回一个新对象。
        * @param {Object} target 要进行过滤的对象。
        * @param {function} fn 过滤函数。
        *   过滤函数会接收到两个参数：当前对象中迭代中的 key 和 value。
        *   过滤函数必须明确返回 true 以保留该成员，其它值则删除该成员。
        * @return {Object} 返回一个过滤后的纯对象。
        */
        grep: function (target, fn) {

            var obj = {};

            for (var key in target) {
                var value = target[key];
                if (fn(key, value) === true) { //只有回调函数中明确返回 true 才保留该成员
                    obj[key] = value;
                }
            }

            return obj;
        },

        /**
        * 判断符合条件的元素是否存在。 
        * 只有在回调函数中明确返回 true，才算找到，此时本方法停止迭代，并返回 true 以指示找到； 
        * 否则迭代继续直至完成，并返回 false 以指示不存在符合条件的元素。
        * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
        * @param {function} fn 自定义查找的函数。
            只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
        * @param {boolean} isDeep 指示是否深层次迭代查找。
        * @return {boolean} 如果找到符合条件的元素，则返回 true；否则返回 false。
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: 2,
                d: {
                    a: 1,
                    b: 1,
                    c: 2
                }
            };
    
            var found = $.Object.find(obj, function (key, value) {
                if (key == 'b' && value == 1) {
                    return true;
                }
            }, true);
            console.log(found); //true
        */
        find: function (obj, fn, isDeep) {

            var found = false;

            exports.each(obj, function (key, value) {
                if (fn(key, value) === true) {
                    found = true;
                    return false;  // break
                }
            }, isDeep);

            return found;
        },

        /**
        * 查找符合条件的元素，返回一个键值的二元组[key, value]。
        * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
        * @param {function} fn 自定义查找的函数。
            只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
        * @param {boolean} isDeep 指示是否深层次迭代查找。
        * @return {boolean} 如果找到符合条件的元素，则返回该项的键值二元组[key, value]。
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: 2,
                d: {
                    a: 10,
                    b: 10,
                    c: 20
                }
            };
    
            var item = $.Object.findItem(obj, function (key, value) {
                return value == 20;
            }, true);
            console.log(item); //['c', 20]
        */
        findItem: function (obj, fn, isDeep) {

            var item = [];

            exports.each(obj, function (key, value) {

                if (fn(key, value) === true) {
                    item = [key, value];
                    return false;  // break
                }

            }, isDeep);

            return item;
        },

        /**
        * 查找符合条件的元素，返回该元素的键。
        * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
        * @param {function} fn 自定义查找的函数。
            只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
        * @param {boolean} isDeep 指示是否深层次迭代查找。
        * @return {boolean} 如果找到符合条件的元素，则返回该项的键；否则返回 undefined。
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: 2,
                d: {
                    a: 10,
                    b: 10,
                    c: 20
                }
            };
    
            var key = $.Object.findKey(obj, function (key, value) {
                return value == 20;
            }, true);
            console.log(key); // 'c'
        */
        findKey: function (obj, fn, isDeep) {
            var item = exports.findItem(obj, fn, isDeep);
            return item[0];
        },

        /**
        * 查找符合条件的元素，返回该元素的值。
        * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
        * @param {function} fn 自定义查找的函数。
            只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
        * @param {boolean} isDeep 指示是否深层次迭代查找。
        * @return {boolean} 如果找到符合条件的元素，则返回该元素的值；否则返回 undefined。
        * @example
            var obj = {
                a: 1,
                b: 2,
                c: 2,
                d: {
                    a: 10,
                    b: 10,
                    cc: 20
                }
            };
    
            var value = $.Object.findValue(obj, function (key, value) {
                return key == 'cc';
            }, true);
            console.log(value); //20
        */
        findValue: function (obj, fn, isDeep) {
            var item = exports.findItem(obj, fn, isDeep);
            return item[1];
        },

        /**
        * 获取指定的对象指定成员所对应的值。
        * 当对象中不存在该成员时，返回一个备用值。
        * @param {Object} obj 要获取值的对象。
        * @param key 要获取值的成员。
        * @param backupValue 备用值。。
        * @return 如果对象中存在该成员，则返回该成员所对应的值；否则，返回备用值。
        * @example
            var value = $.Object.get({}, 'a', 2);
            console.log(value); //得到 2;
    
            var value = $.Object.get({a: 1 }, 'a', 2);
            console.log(value); //得到 1;
    
            var value = $.Object.get(null, 'a', 1);
            console.log(value); //得到 1;
        */
        get: function (obj, key, backupValue) {

            if (!obj) {
                return backupValue;
            }

            if (key in obj) {
                return obj[key];
            }

            return backupValue;
        },

        /**
        * 给指定的对象设置一个键和一个值。
        * @param {Object} obj 要设置的对象。
        * @param key 设置对象所用的键。
        * @param value 设置对象所用的值。
        * @return {Object} 返回第一个参数 obj，即设置的对象。
        * @example
            var obj = $.Object.set({}, 'a', 1);
            console.dir(obj); //得到 obj = { a: 1 };
        */
        set: function (obj, key, value) {
            obj[key] = value;
            return obj;
        },

        /**
        * 用指定的键和值组合生成一个对象，支持批量操作。
        * @param {string|number|boolean|Array} key 生成对象所用的键。
            当是数组时，表示批量操作，格式必须是二元组。
        * @param value 生成对象所用的值。
        * @return {Object} 返回一个生成后的对象。
        * @example
    
            //单个操作
            var obj = $.Object.make('a', 1);
            console.dir(obj); //得到 obj = { a: 1 };
    
            //批量操作
            var obj = $.Object.make( 
                ['a', 1], 
                ['b', 2], 
                ['c', 3]
            );
            console.dir(obj); //得到 obj = { a: 1, b: 2, c: 3};
        */
        make: function (key, value) {

            var $Array = require('Array');

            var obj = {};

            if (exports.isArray(key)) {
                $Array(arguments).each(function (pair, index) {
                    obj[pair[0]] = pair[1];
                });
            }
            else {
                obj[key] = value;
            }

            return obj;
        },


        /**
        * 获取指定对象的所有成员中的键，返回一个数组。
        * @param {Object} obj 要进行获取值的对象。
        * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
            如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
            否则指定为 false，此时为返回一个一维数组。
        * @return 返回一个由值组成的一维或多维数组。
        */
        getKeys: function (obj, isDeep) {

            var fn = arguments.callee;

            var a = [];

            for (var key in obj) {

                var value = obj[key];

                if (isDeep === true &&
                    typeof value == 'object' &&
                    value !== null) {

                    key = fn(value, isDeep);
                }

                a.push(key);
            }

            return a;
        },

        /**
        * 获取指定对象的所有成员中的值，返回一个数组。
        * @param {Object} obj 要进行获取值的对象。
        * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
            如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
            否则指定为 false，此时为返回一个一维数组。
        * @return 返回一个由值组成的一维或多维数组。
        */
        getValues: function (obj, isDeep) {

            var fn = arguments.callee;

            var a = [];

            for (var key in obj) {
                var value = obj[key];

                if (isDeep === true &&
                    typeof value == 'object' &&
                    value !== null) {

                    value = fn(value, isDeep);
                }

                a.push(value);
            }

            return a;
        },

        /**
        * 获取指定对象的所有成员中的键和值，返回一个二元组 [key, value] 的数组。
        * @param {Object} obj 要进行获取值的对象。
        * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
            如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
            否则指定为 false，此时为返回一个一维数组。
        * @return 返回一个由二元组 [key, value] 组成的数组。
        */
        getItems: function (obj, isDeep) {

            return exports.toArray(obj, true, isDeep);
        },

        /**
        * 把一个对象的名称-值对转成用指定分隔符连起来的字符串。
        * @param {Object} nameValues 键值表 
        * @param {String} [nameValueSeparator='='] name_value 的分隔符。 
            如果不指定则默认为 "=" 号
        * @param {String} [pairSeparator='&'] 键值对的分隔符。
            如果不指定则默认为 "&" 号
        * @return {String} 用分隔符进行连接的字符串。
        * @example 
            var a = $.Object.join( {a:1, b:2, c:3}, '=', '&' ); //得到 'a=1&b=2&c=3'
            var b = $.Object.join( {a:1, b:2, c:3} );   //得到 'a=1&b=2&c=3'
        */
        join: function (nameValues, nameValueSeparator, pairSeparator) {
            nameValueSeparator = nameValueSeparator || '=';
            pairSeparator = pairSeparator || '&';

            var pairs = [];
            for (var name in nameValues) {
                pairs.push(name + nameValueSeparator + nameValues[name]);
            }

            return pairs.join(pairSeparator);
        },

        /**
        * 重写一个对象。
        * 该方法会清空被重写的对象，然后把目标对象的成员拷贝到被重写的对象。
        * @param {Object} src 被重写的对象。 
        * @param {Object} dest 目标对象。 
        * @return {Object} 返回被重写的那个对象。
        * @example 
            var a = { a: 1, b: 2, c: 3 };
            var b = { d: 4, e: 5 };
            var c = $.Object.overwrite(a, b);
    
            console.log(a === b); //false
            console.log(a === c); //true
            console.dir(a); // { d: 4, e: 5 }
            console.dir(c); // { d: 4, e: 5 }
    
        */
        overwrite: function (src, dest) {

            for (var key in src) {
                delete src[key];
            }

            return exports.extend(src, dest);
        }


    });

});




define('Object.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Object = require('Object');


    function init(obj) {
        this.value = Object(obj);
    }


    module.exports =
    init.prototype =
    $Object.prototype = { /**@inner*/

        constructor: $Object,
        init: init,
        value: {},

        /**
        * 拆包装，获取 Object 对象。
        */
        valueOf: function () {
            return this.value;
        },


        clone: function () {
            return $Object.clone(this.value);
        },


        each: function (fn, isDeep) {

            var args = $.concat([this.value], arguments);
            $Object.each.apply(null, args);

            return this;
        },


        extend: function () {

            var args = $.concat([this.value], arguments);

            this.value = $Object.extend.apply(null, args);
            return this;
        },

        extendSafely: function () {

            var args = $.concat([this.value], arguments);

            this.value = $Object.extendSafely.apply(null, args);
            return this;
        },


        getType: function () {
            return $Object.getType(this.value);
        },


        isArray: function (isStrict) {
            return $Object.isArray(this.value, isStrict);
        },


        isBuiltinType: function () {
            return $Object.isBuiltinType(this.value);
        },


        isEmpty: function () {
            return $Object.isEmpty(this.value);
        },


        isPlain: function () {
            return $Object.isPlain(this.value);
        },


        isValueType: function () {
            return $Object.isValueType(this.value);
        },


        isWindow: function () {
            return $Object.isWindow(this.value);
        },


        isWrappedType: function () {
            return $Object.isWrappedType(this.value);
        },


        map: function (fn, isDeep) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.map.apply(null, args);
            return this;
        },


        namespace: function (path, value) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.namespace.apply(null, args);
            return this;
        },


        parseJson: function (data) {
            this.value = $Object.parseJson(data);
            return this;
        },


        parseQueryString: function (url, isShallow, isCompatible) {

            var args = $.toArray(arguments);

            this.value = $Object.parseQueryString.apply(null, args);
            return this;
        },


        remove: function (keys) {
            this.value = $Object.remove(this.value, keys);
            return this;
        },


        replaceValues: function (nameValues, isShallow) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.replaceValues.apply(null, args);
            return this;
        },


        toArray: function (rule, isDeep) {

            var args = $.concat([this.value], arguments);

            return $Object.toArray.apply(null, args);
        },


        toJson: function () {
            return $Object.toJson(this.value);
        },


        toQueryString: function (isCompatible) {

            var args = $.concat([this.value], arguments);

            return $Object.toQueryString.apply(null, args);
        },


        join: function (innerSeparator, pairSeparator) {

            var args = $.concat([this.value], arguments);

            return $Object.join.apply(null, args);
        },


        trim: function (values, isDeep) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.trim.apply(null, args);
            return this;
        },

        filter: function (samples) {
            this.value = $Object.filter(this.value, samples);
            return this;
        },

        filterTo: function (src, samples) {
            this.value = $Object.filterTo(this.value, src, samples);
            return this;
        },

        grep: function (fn) {
            this.value = $Object.grep(this.value, fn);
            return this;
        },

        find: function (fn, isDeep) {
            return $Object.find(this.value, fn, isDeep);
        },

        findItem: function (fn, isDeep) {
            return $Object.findItem(this.value, fn, isDeep);
        },

        findKey: function (fn, isDeep) {
            return $Object.findKey(this.value, fn, isDeep);
        },

        findValue: function (fn, isDeep) {
            return $Object.findValue(this.value, fn, isDeep);

        },

        get: function (key, backupValue) {
            return $Object.get(this.value, key, backupValue);
        },

        set: function (key, value) {
            $Object.set(this.value, key, value);
            return this;
        },

        make: function (key, value) {
            this.value = $Object.make(key, value);
            return this;
        },

        getKeys: function (isDeep) {
            return $Object.getKeys(this.value, isDeep);
        },

        getValues: function (isDeep) {
            return $Object.getValues(this.value, isDeep);
        },

        getItems: function (isDeep) {
            return $Object.getItems(this.value, isDeep);
        }
    };


});





/**
* 字符串工具类
* @class
*/
define('core/String', function (require, module, exports) {

    var $ = require('$');


    exports = function (string) {
        var prototype = require('String.prototype');
        return new prototype.init(string);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.String */

        /**
        * 用指定的值去填充一个字符串。
        * 当不指定字符串的填充标记时，则默认为 {}。
        * @param {String} string 要进行格式填充的字符串模板。
        * @param {Object} obj 要填充的键值对的对象。
        * @return 返回一个用值去填充后的字符串。
        * @example
            $.String.format('{id}{type}', {id: 1, type: 'app'});
            $.String.format('{2}{0}{1}', 'a', 'b', 'c');
        */
        format: function (string, obj, arg2) {

            var s = string;

            if (typeof obj == 'object') {
                for (var key in obj) {
                    s = exports.replaceAll(s, '{' + key + '}', obj[key]);
                }

            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = args.length; i < len; i++) {
                    s = exports.replaceAll(s, '{' + i + '}', args[i]);
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
            $.String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
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
            $.String.replaceBetween('hello #--world--# this is #--good--#', '#--', '--#', 'javascript') 
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
            $.String.removeAll('hi js hi abc', 'hi') 
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
            $.String.trim('  abc def mm  '); //结果为 'abc def mm'
        */
        trim: function (string) {
            return string.replace(/(^\s*)|(\s*$)/g, '');
        },

        /**
        * 从当前 String 对象移除所有前导空白字符。
        * @param {String} 要进行操作的字符串。
        * @return {String} 返回一个新的字符串。
        * @expample
            $.String.trimStart('  abc def mm '); //结果为 'abc def mm  '
        */
        trimStart: function (string) {
            return string.replace(/(^\s*)/g, '');
        },

        /**
        * 从当前 String 对象移除所有尾部空白字符。
        * @param {String} 要进行操作的字符串。
        * @return {String} 返回一个新的字符串。
        * @expample
            $.String.trimEnd('  abc def mm '); //结果为 '  abc def mm'
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
            $.String.padLeft('1234', 6, '0'); //结果为 '001234'，右对齐，从左边填充 '0'
            $.String.padLeft('1234', 2, '0'); //结果为 '34'，右对齐，从左边开始截断
        */
        padLeft: function (string, totalWidth, paddingChar) {
            string = String(string); //转成字符串

            var len = string.length;
            if (totalWidth <= len) //需要的长度短于实际长度，做截断处理
            {
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
            $.String.padLeft('1234', 6, '0'); //结果为 '123400'，左对齐，从右边填充 '0'
            $.String.padLeft('1234', 2, '0'); //结果为 '12'，左对齐，从右边开始截断
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
        * @param {String} tag0 区间的开始标记。
        * @param {String} tag1 区间的结束标记。
        * @return {String} 返回一个子字符串。当获取不能结果时，统一返回空字符串。
        * @example
            $.String.between('abc{!hello!} world', '{!', '!}'); //结果为 'hello' 
        */
        between: function (string, tag0, tag1) {
            var startIndex = string.indexOf(tag0);
            if (startIndex < 0) {
                return '';
            }

            startIndex += tag0.length;

            var endIndex = string.indexOf(tag1, startIndex);
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
            $.String.random();      //返回一个 12 位的随机字符串
            $.String.random(64);    //返回一个 64 位的随机字符串
            $.String.random('xxxx-你好xx-xx'); //类似 'A3EA-你好B4-DC'
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
        }

    });//--------------------------------------------------------------------------------------



    //---------------判断部分 -----------------------------------------------------
    $.extend(exports, { /**@lends MiniQuery.String */

        /**
        * 确定一个字符串的开头是否与指定的字符串匹配。
        * @param {String} str 要进行判断的大字符串。
        * @param {String} dest 要进行判断的子字符串，即要检测的开头子串。
        * @param {boolean} [ignoreCase=false] 指示是否忽略大小写。默认不忽略。
        * @return {boolean} 返回一个bool值，如果大串中是以小串开头，则返回 true；否则返回 false。
        * @example
            $.String.startsWith('abcdef', 'abc') //结果为 true。
            $.String.startsWith('abcdef', 'Abc', true) //结果为 true。
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
            $.String.endsWith('abcdef', 'def') //结果为 true。
            $.String.endsWith('abcdef', 'DEF', true) //结果为 true。
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
        * 确定一个字符串是否包含指定的子字符串。
        * @param {String} src 要进行检测的大串。
        * @param {String} target 要进行检测模式子串。
        * @return {boolean} 返回一个 bool 值。如果大串中包含模式子串，则返回 true；否则返回 false。
        * @example
            $.String.contains('javascript is ok', 'scr');   //true
            $.String.contains('javascript is ok', 'iis');      //false
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
        }


    });//--------------------------------------------------------------------------------------




    //---------------转换部分 -----------------------------------------------------
    $.extend(exports, { /**@lends MiniQuery.String */


        /**
        * 转成骆驼命名法。
        * 
        */
        /**
        * 把一个字符串转成骆驼命名法。。
        * 如 'font-size' 转成 'fontSize'。
        * @param {String} string 要进行转换的字符串。
        * @return 返回一个骆驼命名法的新字符串。
        * @example
            $.String.toCamelCase('background-item-color') //结果为 'backgroundItemColor'
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
            $.String.toHyphenate('backgroundItemColor') //结果为 'background-item-color'
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
            $.String.toUtf8('你好'); //结果为 ''
        */
        toUtf8: function (string) {

            var $Array = require('Array');
            var encodes = [];

            $Array.each(string.split(''), function (ch, index) {
                var code = ch.charCodeAt(0);
                if (code < 0x80) {
                    encodes.push(code);
                }
                else if (code < 0x800) {
                    encodes.push(((code & 0x7C0) >> 6) | 0xC0);
                    encodes.push((code & 0x3F) | 0x80);
                }
                else {
                    encodes.push(((code & 0xF000) >> 12) | 0xE0);
                    encodes.push(((code & 0x0FC0) >> 6) | 0x80);
                    encodes.push(((code & 0x3F)) | 0x80);
                }
            });

            return '%' + $Array.keep(encodes, function (item, index) {
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
            $.String.toValue('NaN') //NaN
            $.String.toValue('null') //null
            $.String.toValue('true') //true
            $.String.toValue({}) //不作转换，直接原样返回
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

        }


    });//--------------------------------------------------------------------------------------





    //---------------分裂和提取部分 -----------------------------------------------------
    $.extend(exports, { /**@lends MiniQuery.String */


        /**
        * 对一个字符串进行多层次分裂，返回一个多维数组。
        * @param {String} string 要进行分裂的字符串。
        * @param {Array} separators 分隔符列表数组。
        * @return {Array} 返回一个多维数组，该数组的维数，跟指定的分隔符 separators 的长度一致。
        * @example
            var string = 'a=1&b=2|a=100&b=200;a=111&b=222|a=10000&b=20000';
            var separators = [';', '|', '&', '='];
            var a = $.String.split(string, separators);
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
        *   $.String.slide('012345678', 4, 3); //滑动窗口大小为4，滑动步长为3
            //得到 [ '0123', '3456', '678' ] //最后一组不足一组
        */
        slide: function (string, windowSize, stepSize) {

            var $Array = require('Array');

            var chars = String(string).split(''); //按字符切成单个字符的数组

            return $Array(chars).slide(windowSize, stepSize).map(function (group, index) {

                return group.join('');

            }).valueOf();

        },

        /**
        * 对一个字符串进行分段，返回一个分段后的子串数组。
        * @param {string|number} string 要进行分段的字符串。会调用 String(string) 转成字符串。
        * @param {number} size 分段的大小。
        * @return {Array} 返回一个分段后的子串数组。
        * @example
        *   $.String.segment('0123456789', 3); //进行分段，每段大小为3
            //得到 [ '012', '345', '678', '9' ] //最后一组不足一组
        */
        segment: function (string, size) {
            return exports.slide(string, size, size);
        }


    });//--------------------------------------------------------------------------------------



    $.extend(exports, { /**@lends MiniQuery.String */

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
    });




});


define('String', function (require, module, exports) {
    module.exports = require('core/String');

});






define('String.prototype', function (require, module, exports) {

    var $ = require('$');
    var $String = require('String');


    function init(string) {
        this.value = String(string);
    }

    module.exports =
    init.prototype =
    $String.prototype = { /**@inner*/

        constructor: $String,
        init: init,
        value: '',

        toString: function () {
            return this.value;
        },

        valueOf: function () {
            return this.value;
        },

        format: function (arg1, arg2) {

            var args = $.concat([this.value], arguments);
            this.value = $String.format.apply(null, args);

            return this;
        },

        replaceAll: function (src, dest) {

            var args = $.concat([this.value], arguments);
            this.value = $String.replaceAll.apply(null, args);

            return this;
        },

        replaceBetween: function (startTag, endTag, newString) {

            var args = $.concat([this.value], arguments);
            this.value = $String.replaceBetween.apply(null, args);

            return this;
        },


        removeAll: function (src) {

            this.value = $String.replaceAll(this.value, src, '');
            return this;
        },

        random: function (size) {
            this.value = $String.random(size);
            return this;
        },

        trim: function () {
            this.value = $String.trim(this.value);
            return this;
        },


        trimStart: function () {
            this.value = $String.trimStart(this.value);
            return this;
        },

        trimEnd: function () {
            this.value = $String.trimEnd(this.value);
            return this;
        },

        split: function (separators) {
            return $String.split(this.value, separators);
        },


        startsWith: function (dest, ignoreCase) {
            return $String.startsWith(this.value, dest, ignoreCase);
        },


        endsWith: function (dest, ignoreCase) {
            return $String.endsWith(this.value, dest, ignoreCase);
        },

        contains: function (target, useOr) {
            return $String.contains(this.value, target, useOr);
        },

        padLeft: function (totalWidth, paddingChar) {
            this.value = $String.padLeft(this.value, totalWidth, paddingChar);
            return this;
        },

        padRight: function (totalWidth, paddingChar) {
            this.value = $String.padRight(this.value, totalWidth, paddingChar);
            return this;
        },

        toCamelCase: function () {
            this.value = $String.toCamelCase(this.value);
            return this;
        },

        toHyphenate: function () {
            this.value = $String.toHyphenate(this.value);
            return this;
        },

        between: function (tag0, tag1) {
            this.value = $String.between(this.value, tag0, tag1);
            return this;
        },

        toUtf8: function () {
            this.value = $String.toUtf8(this.value);
            return this;
        },

        toValue: function (value) {
            return $String.toValue(this.value);
        },

        slide: function (windowSize, stepSize) {
            return $String.slide(this.value, windowSize, stepSize);
        },

        segment: function (size) {
            return $String.segment(this.value, size, size);
        }
    };

});






/**
* 自定义事件工具类。
* 该模式也叫观察者模式，该模式的另外一个别名是 订阅/发布 模式。
* 设计这种模式背后的主要动机是促进松散耦合。
* 在这种模式中，并不是一个对象调用另一对象的方法，
* 而是一个对象订阅另一个对象的特定活动并在该活动发生改变后获得通知。
* 订阅者也称之为观察者，而被观察的对象成为发布者。
* 当发生了一个重要的事件时，发布者将通知（调用）所有订阅者并且以事件对象的形式传递消息。
* @class
* @param {Object} obj 要进行绑定事件的目标对象。
* @return {MiniQuery.Event} 返回一个 MiniQuery.Event 的实例。
*/
define('Event', function (require, module, exports) {

    var $ = require('$');
    var Mapper = require('Mapper');

    var guidKey = Mapper.getGuidKey();
    var mapper = new Mapper();


    exports = function Event(obj) {
        var prototype = require('Event.prototype');
        return new prototype.init(obj);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.Event*/

        /**
        * 给指定的对象绑定指定类型的事件处理函数。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向参数 obj 对象。
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            $.Event.bind(obj, 'show', function(){
                console.log(this.value); // this 指向 obj
            });
            $.Event.bind(obj, {
                myEvent: function(){
                    console.log(this.value);
                },
                add: function(value1, value2){
                    this.value += (value1 * value2);
                }
            });
            $.Event.trigger(obj, 'show'); //输出 100
            $.Event.trigger(obj, 'add', [2, 3]);
            $.Event.trigger(obj, 'myEvent'); //输出 106
        */
        bind: function (obj, eventName, fn, isOnce) {

            var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
            if (!all) { // 首次对 obj 进行绑定事件 
                all = {};
                mapper.set(obj, all);
            }

            switch (typeof eventName) {

                case 'string':  //标准的，单个绑定
                    bindItem(eventName, fn);
                    break;

                case 'object':  //此时类似为 bind(obj, {click: fn, myEvent: fn}, isOnce)
                    var $Object = require('Object');

                    if (!$Object.isPlain(eventName)) {
                        throw new Error('当别参数 eventName 为 object 类型时，必须指定为纯对象 {}');
                    }

                    isOnce = fn; //参数位置修正
                    $Object.each(eventName, function (key, value) {
                        bindItem(key, value);   //批量绑定
                    });
                    break;

                default:
                    throw new Error('无法识别参数 eventName 的类型');
                    break;

            }

            isOnce = !!isOnce; //转成 boolean


            //一个内部的共用函数
            function bindItem(eventName, fn) {
                if (typeof fn != 'function') {
                    throw new Error('参数 fn 必须为一个 function');
                }

                var list = all[eventName] || [];

                list.push({
                    fn: fn,
                    isOnce: isOnce
                });

                all[eventName] = list;
            }

        },

        /**
        * 给指定的对象绑定一个一次性的事件处理函数。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。
            在函数内部，this 指向参数 obj 对象。
        */
        once: function (obj, eventName, fn) {
            
            var args = $.concat(arguments, [true]);
            exports.bind.apply(null, args);

        },

        /**
        * 给指定的对象解除绑定指定类型的事件处理函数。
        * @param {Object} obj 要进行解除绑定事件的目标对象。
        * @param {string} [eventName] 要解除绑定的事件名称。
            如果不指定该参数，则移除所有的事件。
            如果指定了该参数，其类型必须为 string，否则会抛出异常。
        * @param {function} [fn] 要解除绑定事件处理函数。
            如果不指定，则移除 eventName 所关联的所有事件。
        */
        unbind: function (obj, eventName, fn) {

            var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
            if (!all) { //尚未存在对象 obj 所关联的事件列表
                return;
            }


            //未指定事件名，则移除所有的事件
            if (eventName === undefined) {
                mapper.remove(obj);
                return;
            }

            //指定了事件名
            if (typeof eventName != 'string') {
                throw new Error('如果指定了参数 eventName，则其类型必须为 string');
            }

            var list = all[eventName];
            if (!list) { //尚未存在该事件名所对应的事件列表
                return;
            }

            //未指定事件处理函数，则移除该事件名的所有事件处理函数
            if (!fn) {
                all[eventName] = [];
                return;
            }

            var $Array = require('Array');

            //移除所有 fn 的项
            all[eventName] = $Array.grep(list, function (item, index) {
                return item.fn !== fn;
            });
        },

        /**
        * 触发指定的对象上的特定类型事件。
        * @param {Object} obj 要触发事件的目标对象。
        * @param {string} eventName 要触发的事件名称。
        * @param {Array} [args] 要向事件处理函数传递的参数数组。
        * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
        */
        trigger: function (obj, eventName, args) {

            var returns = [];

            var all = mapper.get(obj); // all = {...}
            if (!all) {
                return returns;
            }


            var list = all[eventName]; //取得回调列表
            if (!list) {
                return returns;
            }

            var $Array = require('Array');

            args = args || [];


            //这里要特别注意，在执行回调的过程中，回调函数里有可能会去修改回调列表，
            //即 all[eventName]，而此处又要去移除那些一次性的回调（即只执行一次的），
            //为了避免破坏回调函数里的修改结果，这里要边移除边执行回调，而且每次都要
            //以原来的回调列表为准去查询要移除的项的确切位置。

            list = list.slice(0); //复制一份，因为回调列表可能会在执行回调过程发生变化

            $Array.each(list, function (item, index) {

                if (item.isOnce) { 
                    var index = $Array.indexOf(all[eventName], item); //找到该项在回调列表中的索引位置
                    if (index > -1) {
                        all[eventName].splice(index, 1); //直接从原数组删除
                    }
                }

                var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj
                returns.push(value);

            });

            return returns;
        },

        /**
        * 触发指定的对象上的特定类型事件，当事件处理函数返回指定的值时将停止继续调用。
        * @param {Object} obj 要触发事件的目标对象。
        * @param {string} eventName 要触发的事件名称。
        * @param {Array} [args] 要向事件处理函数传递的参数数组。
        * @param [stopValue=false] 要停止继续调用时的返回值。
            当事件处理函数返回参数 stopValue 所指定的值时，将停止调用后面的处理函数。
        * @return {Array} 返回已调用的事件处理函数的返回值所组成的一个数组。
        */
        triggerStop: function (obj, eventName, args, stopValue) {

            var returns = [];

            var all = mapper.get(obj); // all = {...}
            if (!all) {
                return returns;
            }


            var list = all[eventName]; //取得回调列表
            if (!list) {
                return returns;
            }

            args = args || [];

            if (arguments.length == 3) { //不传 stopValue 时，默认为 false
                stopValue = false;
            }

            var items = [];


            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj

                if (!item.isOnce) {
                    items.push(item);
                }

                returns.push(value);

                if (value === stopValue) {
                    break;
                }
            }

            list = list.slice(i + 1);
            all[eventName] = items.concat(list);

            return returns;
        },

        /**
        * 检测指定的对象上是否包含特定类型的事件。
        * @param {Object} obj 要检测的目标对象。
        * @param {string} [eventName] 要检测的事件名称。
            当不指定时，则判断是否包含了任意类型的事件。
        * @param {function} [fn] 要检测的事件处理函数。
        * @return {boolean} 返回一个布尔值，该布尔值指示目标对象上是否包含指否类型的事件以及指定的处理函数。
            如果是则返回 true；否则返回 false。
        */
        has: function (obj, eventName, fn) {

            var all = mapper.get(obj); // all = {...}
            if (!all) {   //尚未绑定任何类型的事件
                return false;
            }


            var $Object = require('Object');

            if (eventName === undefined) {   //未指定事件名，则判断是否包含了任意类型的事件
                if ($Object.isEmpty(all)) { // 空对象 {}
                    return false;
                }

                var hasEvent = false;

                $Object.each(all, function (eventName, list) {
                    if (list && list.length > 0) {
                        hasEvent = true;
                        return false; // break, 只有在回调函数中明确返回 false 才停止循环。
                    }
                });

                return hasEvent;
            }


            //指定了事件名
            if (typeof eventName != 'string') {
                throw new Error('如果指定了参数 eventName，则其类型必须为 string');
            }

            var list = all[eventName]; //取得回调列表
            if (!list || list.length == 0) {
                return false;
            }

            if (fn === undefined) { //未指定回调函数
                return true;
            }

            var $Array = require('Array');

            //从列表中搜索该回调函数
            return $Array.find(list, function (item, index) {
                return item.fn === fn;
            });

        },

        /**
        * 给指定的对象绑定/解除绑定指定类型的事件处理函数。
        * 如果目标对象的指定类型事件中存在该处理函数，则移除它；否则会添加它。
        * @param {Object} obj 要进行绑定/解除绑定事件的目标对象。
        * @param {string} eventName 要绑定/解除绑定的事件名称。
        * @param {function} fn 事件处理函数。 
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            var fn = function() {
                console.log(this.value); // this 指向 obj
            }
            $.Event.bind(obj, 'show', fn);
            $.Event.trigger(obj, 'show'); //输出 100
    
            $.Event.toggle(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以会给移除
            $.Event.trigger(obj, 'show'); //fn 函数已给移除，因为不产生输出
        */
        toggle: function (obj, eventName, fn, isOnce) {

            if (exports.has(obj, eventName, fn)) {
                exports.unbind(obj, eventName, fn);
            }
            else {
                exports.bind(obj, eventName, fn, isOnce);
            }
        },

        /**
        * 给指定的对象只绑定一次指定类型的事件处理函数。
        * 只有当目标对象的指定类型事件中不存在该处理函数时才添加；否则忽略操作。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            var fn = function() {
                console.log(this.value); // this 指向 obj
            }
            $.Event.bind(obj, 'show', fn);
            $.Event.trigger(obj, 'show'); //输出 100
    
            $.Event.unique(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以不会重复绑定
            $.Event.trigger(obj, 'show'); //依然只输出 100
        */
        unique: function (obj, eventName, fn, isOnce) {

            if (exports.has(obj, eventName, fn)) {
                return;
            }

            exports.bind(obj, eventName, fn, isOnce);

        },

        /**
        * 创建一个通用事件类的实例。
        * 该实例内部会创建一个具有 guid 的对象用来管理事件。
        * @example
            var event = $.Event.create();
            event.on('myEvent', function () {  });
        */
        create: function () {

            var $String = require('String');

            var obj = {};
            obj[guidKey] = $String.random();

            return new exports(obj);
        },

        //for test
        //_mapper: mapper,

    });

});














//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

define('Event.prototype', function (require, module, exports) {

    var $ = require('$');
    var Event = require('Event');


    function init(obj) {
        this.value = obj;
    }


    module.exports =
    init.prototype =
    Event.prototype = { /**@inner*/

        constructor: Event,
        init: init,
        value: {},


        valueOf: function () {
            return this.value;
        },

        on: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.bind.apply(null, args);
            return this;
        },

        off: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.unbind.apply(null, args);
            return this;
        },

        bind: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.bind.apply(null, args);
            return this;
        },

        unbind: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.unbind.apply(null, args);
            return this;
        },

        once: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.once.apply(null, args);
            return this;
        },

        trigger: function (eventName, args) {
            var args = $.concat([this.value], arguments);
            return Event.trigger.apply(null, args);
        },

        triggerStop: function (eventName, args, stopValue) {
            var args = $.concat([this.value], arguments);
            return Event.triggerStop.apply(null, args);
        },

        fire: function (eventName, args) {
            var args = $.concat([this.value], arguments);
            return Event.trigger.apply(null, args);
        },

        fireStop: function (eventName, args, stopValue) {
            var args = $.concat([this.value], arguments);
            return Event.triggerStop.apply(null, args);
        },

        has: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            return Event.has.apply(null, args);
        },

        toggle: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.toggle.apply(null, args);
            return this;
        },

        unique: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            return Event.unique.apply(null, args);
        }
    };

});






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





/**
* 对外提供模块管理器。
* 主要提供给页面定义页面级别的私有模块。
*/
define('Module', function (require, module, exports) {


    var id$module = {};
    var id$factory = {}; //辅助用的，针对页面级别的多级目录的以 '/' 开头的模块 id


    //根据工厂函数反向查找对应的模块 id。
    function getId(factory) {
        var $Object = require('Object');

        return $Object.findKey(id$factory, function (key, value) {
            return value === factory;
        });
    }


    module.exports = {

        /**
        * 定义指定名称的模块。
        * @param {string} id 模块的名称。
        * @param {Object|function} factory 模块的导出函数或对象。
        */
        define: function define(id, factory) {

            id$module[id] = {
                required: false,
                exports: factory,   //这个值在 require 后可能会给改写
                exposed: false      //默认对外不可见
            };

            id$factory[id] = factory;
        },


        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @return 返回指定的模块。
        */
        require: function (id) {

            if (id.indexOf('./') == 0) { //以 './' 开头，如　'./API'
                var parentId = getId(arguments.callee.caller); //如 'List'
                if (!parentId) {
                    throw new Error('require 时如果指定了以 "./" 开头的短名称，则必须用在 define 的函数体内');
                }

                id = parentId + id.slice(1); //完整名称，如 'List/API'
            }


            var module = id$module[id];
            if (!module) { //不存在该模块
                return;
            }

            var require = arguments.callee; //引用自身
            var exports = module.exports;

            if (module.required) { //已经 require 过了
                return exports;
            }

            //首次 require
            if (typeof exports == 'function') {

                var fn = exports;
                exports = {};

                var mod = {
                    id: id,
                    exports: exports,
                };

                var value = fn(require, mod, exports);

                //没有通过 return 来返回值，则要导出的值在 mod.exports 里
                exports = value === undefined ? mod.exports : value;
                module.exports = exports;
            }

            module.required = true; //指示已经 require 过一次

            return exports;

        },
    };

});



/**
* Url 工具类
* @namespace
*/

define('excore/Url', function (require, module, exports) {


    module.exports = exports =  {  /**@lends MiniQuery.Url */

        /**
        * 获取指定 Url 的查询字符串中指定的键所对应的值。
        * @param {string} url 要进行获取的 url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
        * @example
            $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 '1'
            $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 undefined
            $.Url.getQueryString('http://www.demo.com?a=1&A=2#hash', 'A');  //返回 2
            $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true);//返回 1
            $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash', '');   //返回 'a=1&b=2'
            $.Url.getQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 {a: '1', b: '2'}
            $.Url.getQueryString('http://www.demo.com?a=&b=');              //返回 {a: '', b: ''}
            $.Url.getQueryString('http://www.demo.com?a&b');                //返回 {a: '', b: ''}
            $.Url.getQueryString('http://www.demo.com?a', 'a');             //返回 ''
        */
        getQueryString: function (url, key, ignoreCase) {

            var beginIndex = url.indexOf('?');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }

            var endIndex = url.indexOf('#');
            if (endIndex < 0) {
                endIndex = url.length;
            }

            var qs = url.slice(beginIndex + 1, endIndex);
            if (key === '') { //获取全部查询字符串的 string 类型
                return decodeURIComponent(qs);
            }

            var $Object = require('Object');
            var obj = $Object.parseQueryString(qs);

            if (key === undefined) { //未指定键，获取整个 Object 对象
                return obj;
            }

            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                return obj[key];
            }

            //以下是不区分大小写
            key = key.toString().toLowerCase();

            for (var name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }

        },



        /**
        * 给指定的 Url 添加一个查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且覆盖同名的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要添加的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回 'http://www.demo.com?a=1&b=2&c=3#hash'
            $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://www.demo.com?a=3&b=2&d=4#hash'
            $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        addQueryString: function (url, key, value) {

            var $Object = require('Object');

            var qs = exports.getQueryString(url) || {}; //先取出原来的

            if (typeof key == 'object') {
                $Object.extend(qs, key);
            }
            else {
                qs[key] = value;
            }


            //过滤掉值为 null 的项
            var obj = {};

            for (var key in qs) {
                var value = qs[key];

                if (value === null) {
                    continue;
                }
                else {
                    obj[key] = value;
                }

            }

            return exports.setQueryString(url, obj);


        },


        /**
        * 给指定的 Url 添加一个随机查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且添加一个键名为随机字符串而值为空字符串的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {number} [len] 随机键的长度。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回值类似 'http://www.demo.com?a=1&b=2&7A8CEBAFC6B4=#hash'
            $.Url.randomQueryString('http://www.demo.com?a=1&b=2#hash');  
            
            //返回值类似 'http://www.demo.com?a=1&b=2&7A8CE=#hash' 
            $.Url.randomQueryString('http://www.demo.com?a=1&b=2#hash', 5); //随机键的长度为 5
    
        */
        randomQueryString: function (url, len) {
            var $String = require('String');
            var key = $String.random(len);
            return exports.addQueryString(url, key, '');
        },



        /**
        * 把指定的 Url 和查询字符串组装成一个新的 Url。
        * 注意，该方法会删除之前的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要设置的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回 'http://www.demo.com?c=3#hash'
            $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://www.demo.com?a=3&d=4#hash'
            $.Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        setQueryString: function (url, key, value) {

            var $Object = require('Object');

            var type = typeof key;
            var isValueType = (/^(string|number|boolean)$/).test(type);

            var qs = '';

            if (arguments.length == 2 && isValueType) { //setQueryString(url, qs);
                qs = encodeURIComponent(key);
            }
            else {
                var obj = type == 'object' ? key : $Object.make(key, value);
                qs = $Object.toQueryString(obj);
            }



            var hasQuery = url.indexOf('?') > -1;
            var hasHash = url.indexOf('#') > -1;
            var a;

            if (hasQuery && hasHash) {
                a = url.split(/\?|#/g);
                return a[0] + '?' + qs + '#' + a[2];
            }

            if (hasQuery) {
                a = url.split('?');
                return a[0] + '?' + qs;
            }

            if (hasHash) {
                a = url.split('#');
                return a[0] + '?' + qs + '#' + a[1];
            }

            return url + '?' + qs;


        },

        /**
        * 判断指定的 Url 是否包含特定名称的查询字符串。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'b');  //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 false
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true); //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 true
        */
        hasQueryString: function (url, key, ignoreCase) {


            var obj = exports.getQueryString(url); //获取全部查询字符串的 Object 形式

            if (!obj) {
                return false;
            }

            var $Object = require('Object');
            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }

            if (key in obj) { //找到完全匹配的
                return true;
            }

            if (ignoreCase) { //明确指定了忽略大小写

                key = key.toString().toLowerCase();
                for (var name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }

            //区分大小写，但没找到
            return false;

        },


        /**
        * 获取指定 Url 的哈希中指定的键所对应的值。
        * @param {string} url 要进行获取的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部哈希值，对其进行 unescape 解码，
            然后返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部哈希(不解码)，返回一个 string 类型值。
        * @example
            $.Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'a');  //返回 '1'
            $.Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'c');  //返回 undefined
            $.Url.getHash('http://www.demo.com?query#a%3D1%26A%3D2', 'A');  //返回 2
            $.Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'A', true);//返回 1
            $.Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', '');   //返回 'a%3D1%26b%3D2'
            $.Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2');       //返回 {a: '1', b: '2'}
            $.Url.getHash('http://www.demo.com?query#a%3D%26b%3D');         //返回 {a: '', b: ''}
            $.Url.getHash('http://www.demo.com??query#a%26b');              //返回 {a: '', b: ''}
            $.Url.getHash('http://www.demo.com?query#a', 'a');              //返回 ''
        */
        getHash: function (url, key, ignoreCase) {

            var beginIndex = url.indexOf('#');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }

            var endIndex = url.length;

            var hash = url.slice(beginIndex + 1, endIndex);
            hash = unescape(hash); //解码

            if (key === '') { //获取全部 hash 的 string 类型
                return hash;
            }

            
            var $Object = require('Object');

            var obj = $Object.parseQueryString(hash);

            if (key === undefined) { //未指定键，获取整个 Object 对象
                return obj;
            }

            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                return obj[key];
            }


            //以下是不区分大小写
            key = key.toString().toLowerCase();

            for (var name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }
        },
        /**
        * 把指定的哈希设置到指定的 Url 上。
        * 该方法会对哈希进行 escape 编码，再设置到 Url 上，以避免哈希破坏原有的 Url。
        * 同时原有的哈希会移除掉而替换成新的。
        * @param {string} url 要设置的 url 字符串。
        * @param {string|number|boolean|Object} key 要设置的哈希的键。
            当传入一个 Object 对象时，会对键值对进行递归编码成查询字符串， 然后用 escape 编码来设置哈希。
            当传入的是一个 string|number|boolean 类型，并且不传入第三个参数， 则直接用 escape 编码来设置哈希。
        * @param {string} [value] 要添加的哈希的值。
        * @retun {string} 返回组装后的新的 Url 字符串。
        * @example
            //返回 'http://www.demo.com?#a%3D1'
            $.Url.setHash('http://www.demo.com', 'a', 1);  
            
            //返回 'http://www.demo.com?query#a%3D3%26d%3D4'
            $.Url.setHash('http://www.demo.com?query#a%3D1%26b%3D2', {a: 3, d: 4});  
    
            //返回 'http://www.demo.com?query#a%3D3%26d%3D4'
            $.Url.setHash('http://www.demo.com?query#a%3D1%26b%3D2', 'a=3&b=4'); 
            
        */
        setHash: function (url, key, value) {

            var $Object = require('Object');

            var type = typeof key;
            var isValueType = (/^(string|number|boolean)$/).test(type);


            var hash = '';

            if (arguments.length == 2 && isValueType) {
                hash = String(key);
            }
            else {
                var obj = type == 'object' ? key : $Object.make(key, value);
                hash = $Object.toQueryString(obj);
            }


            hash = escape(hash); //要进行编码，避免破坏原有的 Url

            var index = url.lastIndexOf('#');
            if (index > -1) {
                url = url.slice(0, index);
            }

            return url + '#' + hash;

        },



        /**
        * 判断指定的 Url 是否包含特定名称的查询字符串。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'b');  //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 false
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true); //返回 true
            $.Url.hasQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 true
        */
        hasHash: function (url, key, ignoreCase) {

            
            var obj = exports.getHash(url); //获取全部哈希字符串的 Object 形式

            if (!obj) {
                return false;
            }

            var $Object = require('Object');

            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }

            if (key in obj) { //找到完全匹配的
                return true;
            }


            if (ignoreCase) { //明确指定了忽略大小写

                key = key.toString().toLowerCase();

                for (var name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }

            //区分大小写，但没找到
            return false;

        }


    };

});


define('Url', function (require, module, exports) {
    return require('excore/Url');
});




/**
* 本地存储工具类
* @namespace
*/
define('LocalStorage', function (require, module, exports) {

    var localStorage = window.localStorage;

    if (!localStorage) { //不支持
        return null; //须显式的返回 null，以告诉 require 加载器已加载过
    }


    var id = '__MiniQuery.LocalStorage__';
    var all = localStorage.getItem(id) || null;
    all = JSON.parse(all) || {};


    function set(key, value) {

        if (key in all && all[key] === value) { //已存在
            return;
        }

        all[key] = value;

        var json = JSON.stringify(all);
        localStorage.setItem(id, json);

    }



    function get(key) {

        return all[key];

    }

    function remove(key) {
        delete all[key];
        var json = JSON.stringify(all);
        localStorage.setItem(id, json);
    }

    function clear() {
        all = {};
        var json = JSON.stringify(all);
        localStorage.setItem(id, json);
    }


    function each(fn) {

        for (var key in all) {
            fn(key, all[key]);
        }

    }

    function length() {
        return keys().length;
    }

    function keys() {
        if (typeof Object.keys == 'function') {
            return Object.keys(all);
        }

        var a = [];
        for (var key in all) {
            a.push(key);
        }

        return a;
    }

    function key(index) {

        return keys()[index];
    }






    module.exports = {
        set: set,
        get: get,
        remove: remove,
        clear: clear,
        each: each,
        length: length,
        keys: keys,
        key: key
    };


});




/**
* 会话存储工具类
* @namespace
*/
define('SessionStorage', function (require, module, exports) {

    var sessionStorage = window.sessionStorage;

    if (!sessionStorage) { //不支持
        return null; //须显式的返回 null，以告诉 require 加载器已加载过
    }



    var id = '__MiniQuery.SessionStorage__';
    var all = sessionStorage.getItem(id) || null;
    all = JSON.parse(all) || {};


    function set(key, value) {

        if (key in all && all[key] === value) { //已存在
            return;
        }

        all[key] = value;

        var json = JSON.stringify(all);
        sessionStorage.setItem(id, json);

    }



    function get(key) {
        return all[key];
    }

    function remove(key) {
        delete all[key];
        var json = JSON.stringify(all);
        sessionStorage.setItem(id, json);
    }

    function clear() {
        all = {};
        var json = JSON.stringify(all);
        sessionStorage.setItem(id, json);
    }


    function each(fn) {

        for (var key in all) {
            fn(key, all[key]);
        }

    }

    function keys() {
        if (typeof Object.keys == 'function') {
            return Object.keys(all);
        }

        var a = [];
        for (var key in all) {
            a.push(key);
        }

        return a;
    }

    function key(index) {

        return keys()[index];
    }

    function length() {
        return keys().length;
    }




    return {
        set: set,
        get: get,
        remove: remove,
        clear: clear,
        each: each,
        length: length,
        keys: keys,
        key: key
    };

});







/**
* Script 脚本工具
* @namespace
*/
define('Script', function (require, module, exports) {


    var defaults = {
        url: '',
        id: '',
        charset: 'utf-8',
        document: window.document,
        onload: null
    };


    /**
    * 加载单个
    * @inner
    */
    function loadSingle(url, charset, document, onload) {

        var id;

        if (typeof url == 'object') { //传入的是一个 {} 
            var config = url;

            id = config.id;
            url = config.url;
            charset = config.charset;
            document = config.document;
            onload = config.onload;
        }


        var script = document.createElement('script');
        script.type = 'text/javascript';

        if (id) {
            script.id = id;
        }

        if (charset) {
            script.charset = charset;
        }


        if (onload) { //指定了回调函数，则设置它

            if (script.readyState) { //IE

                script.onreadystatechange = function () {

                    var readyState = script.readyState;

                    if (readyState == 'loaded' || readyState == 'complete') {
                        script.onreadystatechange = null; //避免重复执行回调
                        onload();
                    }
                };
            }
            else { //标准
                script.onload = onload;
            }

        }


        script.src = url;
        document.head.appendChild(script);
    }

    /**
    * 顺序加载批量
    * @inner
    */
    function loadBatch(urls, charset, document, fn) {

        var index = 0;

        (function () {

            var next = arguments.callee;
            var url = urls[index];

            loadSingle(url, charset, document, function () {
                index++;

                if (index < urls.length) {
                    next();
                }
                else {
                    fn && fn();
                }
            });

        })();


    }


    /**
    * 单个写入
    * @inner
    */
    function document_write(url, charset, document) {

        var $String = require('String');

        var html = $String.format('<script type="text/javascript" src="{src}" {charset} ><\/script>', {
            'src': url,
            'charset': charset ? $String.format('charset="{0}"', charset) : ''
        });

        document.write(html);
    }



    
    module.exports = exports = { /**@lends MiniQuery.Script*/

        /**
        * 跨浏览器动态加载 JS 文件，并在加载完成后执行指定的回调函数。
        * @memberOf MiniQuery.Script
        * @param {string|Array} params.url 
            要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
        * @param {string} [params.charset="utf-8"] 
            要加载的 JS 文件的字符编码，默认为 utf-8。
        * @param {Document} [params.document=window.document] 
            要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
        * @param {function} [params.onload] 
            加载成功后的回调函数。
        * @example
            $.Script.load({
                url: 'a.js',
                charset: 'utf-8',
                document: document,
                id: 'myScript',
                onload: function (){ }
            });

            $.Script.load('a.js', 'utf-8', document, function(){});
            $.Script.load('a.js', 'utf-8', function(){});
            $.Script.load('a.js', document, function(){});
            $.Script.load('a.js', function(){});

            //批量加载
            $.Script.load(['a.js', 'b.js'], function(){});
        */
        load: function (params) {

            var $Object = require('Object');

            var obj = $Object.extend({}, defaults); //复制一份

            //注意，params 有可能是个数组，不能用 typeof 为 'object'
            if ($Object.isPlain(params)) { //纯对象 {}
                $Object.extend(obj, params);
            }
            else {

                obj.url = params;

                switch (typeof arguments[1]) {
                    case 'string':
                        obj.charset = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                    case 'function':
                        obj.onload = arguments[1];
                        break;
                }

                switch (typeof arguments[2]) {
                    case 'object':
                        obj.document = arguments[2];
                        break;
                    case 'function':
                        obj.onload = arguments[2];
                        break;
                }

                if (arguments[3]) {
                    obj.onload = arguments[3];
                }
            }




            var url = obj.url;

            if (typeof url == 'string') {
                loadSingle(obj);
            }
            else if (url instanceof Array) {
                loadBatch(url, obj.charset, obj.document, obj.onload);
            }
            else {
                throw new Error('参数 params.url 必须为 string 或 string 的数组');
            }


        },

        /**
        * 创建一个 script 标签，并插入 JavaScript 代码。
        * @param {string} params.code 要插入的 JS 代码。
        * @param {string} [params.id] 创建的 script 标签中的 id。
        * @param {Document} [params.document=window.document] 
            创建的 script 标签的上下文环境的 document。默认为当前窗口的 document 对象。
        * @example
            $.Script.insert({
                code: 'alert(0);',
                id: 'myScript',
                document: document
            });
            $.Script.insert('alert(0);', 'myScript', document);
            $.Script.insert('alert(0);', 'myScript');
            $.Script.insert('alert(0);', document);
        */
        insert: function (params) {
            var obj = {
                code: '',
                id: '',
                document: window.document
            };

            var $Object = require('Object');


            if ($Object.isPlain(params)) {
                $Object.extend(obj, params);
            }
            else {
                obj.code = params;

                switch (typeof arguments[1]) {
                    case 'string':
                        obj.id = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                }

                if (arguments[2]) {
                    obj.document = arguments[2];
                }
            }

            var script = obj.document.createElement('script');
            script.type = 'text/javascript';

            if (obj.id) {
                script.id = obj.id;
            }

            try { // 标准，IE 除外
                script.appendChild(obj.document.createTextNode(obj.code));
            }
            catch (ex) { // IE，但不限于 IE
                script.text = obj.code;
            }

            obj.document.getElementsByTagName('head')[0].appendChild(script);
        },

        /**
        * 用 document.write 的方式加载 JS 文件。
        * @memberOf MiniQuery.Script
        * @param {string|Array} params.url 
            要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
        * @param {string} [params.charset="utf-8"] 
            要加载的 JS 文件的字符编码，默认为 utf-8。
        * @param {Document} [params.document=window.document] 
            要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
        * @example
            $.Script.write({
                url: 'a.js',
                charset: 'utf-8',
                document: document
            });
            $.Script.write('a.js', 'utf-8', document);
            $.Script.write('a.js', 'utf-8');
            $.Script.write('a.js', document);
        */
        write: function (params) {
            var obj = {
                url: '',
                charset: '',
                document: window.document
            };

            var $Object = require('Object');

            if ($Object.isPlain(params)) {
                $Object.extend(obj, params);
            }
            else {
                obj.url = params;
                switch (typeof arguments[1]) {
                    case 'string':
                        obj.charset = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                }

                if (arguments[2]) {
                    obj.document = arguments[2];
                }

            }

            if ($Object.isArray(obj.url)) {
                var urls = obj.url;
                for (var i = 0, len = urls.length; i < len; i++) {
                    document_write(urls[i], obj.charset, obj.document);
                }
            }
            else {
                document_write(obj.url, obj.charset, obj.document);
            }
        }
    };

});





define('browser/Url', function (require, module, exports) {


    var $ = require('$');
    var $String = require('String');
    var Mapper = require('Mapper');
    var Url = require('excore/Url');

    //用来记录 window 是否已绑定了 hashchange 事件 
    var window$hashchange = new Mapper();

    //避免意外绑定到 window 中同名的事件。 
    //也可阻止用户手动去触发该事件，因为外部无法得知该事件名。
    var hashchangeEventName = '__hashchange__' + $String.random();



    module.exports = exports = {  /**@lends MiniQuery.Url */


        /**
        * 获取指定窗口的查询字符串中指定的键所对应的值。
        * @param {Window|string} window 要进行获取 Window 窗口对象。
            当指定为 Window 窗口对象时，则从 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
        * @example
        */
        getQueryString: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.getQueryString.apply(null, args);

        },


        /**
        * 给指定的窗口设置查询字符串。
        * 注意：设置窗口的查询字符串，会导致页面刷新。
        * @param {Window|string} window 要设置的 Window 窗口对象。
            当指定为 Window 窗口对象时，则对其 location.href 进行设置，从而会导致窗口刷新；
            否则当作是一个指定的 Url 字符串。
        * @param {string|Object} key 要添加的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
        */
        setQueryString: function (window, key, value) {

            var args = $.toArray(arguments);

            if (typeof window == 'string') {
                return Url.setQueryString.apply(null, args);
            }


            var location = window.location;
            var url = location.href;
            args[0] = url;

            url = Url.setQueryString.apply(null, args);
            location.href = url; //设置整个 location.href 会刷新

            return url;

        },


        /**
        * 判断指定窗口的 Url 是否包含特定名称的查询字符串。
        * @param {Window|string} window 要检查的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
        */
        hasQueryString: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.hasQueryString.apply(null, args);

        },

        /**
        * 获取指定窗口的 Url 的哈希中的指定的键所对应的值。
        * @param {Window|string} window 要进行获取的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 
            默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部哈希值，对其进行 unescape 解码，
            然后返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部哈希(不解码)，返回一个 string 类型值。
        * @example
        */
        getHash: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.getHash.apply(null, args);

        },


        /**
        * 给指定窗口的 Url 设置哈希。
        * @param {Window|string} window 要设置的 Window 窗口对象。
            当指定为 Window 窗口对象时，则对其 location.href 进行设置，
            由于设置一个窗口的哈希不会导致窗口刷新，所以本方法不会刷新窗口；
            否则当作是一个指定的 Url 字符串。
        * @param {string|number|boolean|Object} key 要添加的哈希的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串，然后用 escape 进行编码来设置哈希。
            当传入的是一个 string|number|boolean 类型，并且不传入第三个参数， 则直接用 escape 进行编码来设置哈希。
        * @param {string} [value] 要添加的哈希的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
        */
        setHash: function (window, key, value) {

            var args = $.toArray(arguments);

            if (typeof window == 'string') {
                args[0] = window;
                return Url.setHash.apply(null, args);
            }


            var location = window.location;
            var url = location.href;
            args[0] = url;

            url = Url.setHash.apply(null, args);

            var hash = Url.getHash(url, ''); //获取所有的 hash 字符串
            hash = escape(hash);
            location.hash = hash; //不要设置整个 location.href，否则会刷新

            return location.href;

        },


        /**
        * 判断指定窗口的 Url 是否包含特定名称的哈希。
        * @param {Window|string} window 要检查的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要提取的哈希的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。
            默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的哈希，则返回 true；否则返回 false。
        * @example
        */
        hasHash: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.hasHash.apply(null, args);

        },





        /**
        * 监听指定窗口 Url 的 Hash 变化，并触发一个回调函数。
        * @param {Window} window 要监听的 window 窗口。
        * @param {function} fn 当监听窗口的 hash 发生变化时，要触发的回调函数。
        *   该回调函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
        *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
        *   如果 oldHash 不存在，则为 null。
        *   该回调函数内部的 this 指向监听的窗口。
        * @param {boolean} [immediate=false] 指示初始时当窗口中存在哈希时是否要立即执行回调函数。
            初始时当窗口中存在哈希时，如果要立即执行回调函数，请指定该参数为 true；
            否则不指定或指定为 false。
        * @example
            $.Url.hashchange(top, function (newHash, oldHash) {
                console.log('new hash: ' + newHash);
                console.log('old hash: ' + oldHash);
                console.log(this === top); //true
    
            });
        */
        hashchange: function (window, fn, immediate) {

            var Event = require('Event');

            Event.bind(window, hashchangeEventName, fn);

            var location = window.location;
            var hash = exports.getHash(window, '');


            if (hash && immediate) { //如果有 hash，并且指定了要立即触发，则立即触发
                fn.call(window, hash, null); //不要用 trigger，因为可能会影响之前绑定的
            }

            if (window$hashchange.get(window)) { // window 所对应的窗口已绑定 hashchange
                return;
            }

            // window 所对应的窗口首次绑定 hashchange
            if ('onhashchange' in window) {
                window.onhashchange = function () {
                    var oldHash = hash;
                    hash = exports.getHash(window, '');
                    Event.trigger(window, hashchangeEventName, [hash, oldHash]);
                };
            }
            else {
                setInterval(function () {
                    var oldHash = hash;
                    hash = exports.getHash(window, '');
                    if (hash != oldHash) {
                        Event.trigger(window, hashchangeEventName, [hash, oldHash]);
                    }
                }, 200);
            }

            window$hashchange.set(window, true);



        },

        /**
        * 监听指定窗口 Url 的 Hash 变化，并触发相应的路由分支函数。
        * @param {Window} window 要监听的 window 窗口。
        * @param {Object} routes 路由分支函数。
        *   分支函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
        *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
        *   如果 oldHash 不存在，则为 null。
        *   分支函数内部的 this 指向监听的窗口。
        * @example
            $.Url.route(window, {
                'abc': function (newHash, oldHash) { },
                'user/': function (newHash, oldHash){ },
                'user/1234': function (newHash, oldHash) { }
            });
    
            $.Url.route(window, 'abc', function (newHash, oldHash) {
    
            });
    
        */
        route: function (window, routes) {

            var $Object = require('Object');

            if (!$Object.isPlain(routes)) { //此时为 route(window, hash, fn) 的形式
                routes = $Object.make(routes, arguments[2]); //用 hash 和 fn 组成一个 {}
            }

            exports.hashchange(window, function (newHash, oldHash) {
                var fn = routes[newHash];
                if (fn) {
                    fn.call(window, newHash, oldHash);
                }
            });


        }


    };


});


//对外暴露的 Url 模块
define('Url', function (require, module, exports) {
    var $ = require('$');
    var excoreUrl = require('excore/Url');
    var browserUrl = require('browser/Url');
    module.exports = $.extend({}, excoreUrl, browserUrl); //这里要拷到一个新的对象上
});


define('MiniQuery', function (require, module, exports) {

    var $ = require('$');

    module.exports = exports = {

        'Array': require('Array'),
        'Boolean': require('Boolean'),
        'Date': require('Date'),
        'Function': require('Function'),
        'Math': require('Math'),
        'Object': require('Object'),
        'String': require('String'),

        'Event': require('Event'),
        'Mapper': require('Mapper'),
        'Url': require('Url'),

        'LocalStorage': require('LocalStorage'),
        'SessionStorage': require('SessionStorage'),
        'Script': require('Script'),



        /**
        * 以安全的方式给 MiniQuery 使用一个新的命名空间。
        * 比如 MiniQuery.use('$')，则 global.$ 基本上等同于 global.MiniQuery；
        * 当 global 中未存在指定的命名空间或参数中指定了要全量覆盖时，则使用全量覆盖的方式，
        * 该方式会覆盖原来的命名空间，可能会造成成一些错误，不推荐使用；
        * 当 global 中已存在指定的命名空间时，则只拷贝不冲突的部分到该命名空间，
        * 该方式是最安全的方式，也是默认和推荐的方式。
        */
        use: function (namespace, overwrite) {

            if (!(namespace in global) || overwrite) { //未存在或明确指定了覆盖
                global[namespace] = exports; //全量覆盖
                return;
            }

            //已经存在，则拷贝不冲突的成员部分
            var obj = global[namespace];

            for (var key in exports) {

                if (!(key in obj)) { //只拷贝不冲突的部分
                    obj[key] = exports[key];
                }
            }

        },

        require: $.require,

    };



});


//设置对外暴露的模块
Module.expose({


    'Array': true,
    'Boolean': true,
    'Date': true,
    'Function': true,
    'Math': true,
    'Object': true,
    'String': true,

    'Event': true,
    'Mapper': true,
    'Module': true,
    'Url': true,

    'Cookie': true,
    'LocalStorage': true,
    'SessionStorage': true,
    'Script': true,
    
});





(function (define) {

    if (typeof define == 'function' && (define.amd || define.cmd)) { //amd|cmd
        define(function (require) {
            return require('MiniQuery');
        });
    }
    else { //browser 普通方式
        global.MiniQuery = require('MiniQuery');
    }


})(global.define);


})(
    this,  // 在浏览器环境中，全局对象是 this

    top,
    parent,
    window, 
    document,
    location,
    navigator,
    window.localStorage,
    window.sessionStorage,
    window.console,
    history,
    setTimeout,
    setInterval,

    window.JSON,

    Array, 
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, $ -> undefined */
    /*, undefined -> undefined */
);
