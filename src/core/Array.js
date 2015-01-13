
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
                array = This.pad(startIndex, endIndex);
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
                array = This.pad(startIndex, endIndex);
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
