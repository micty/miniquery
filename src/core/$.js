

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

        }
    };

});

