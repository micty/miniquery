


var slice = Array.prototype.slice;

//兼容性写法
var toArray = slice.call.bind ? slice.call.bind(slice) : function ($arguments) {
    return slice.call($arguments, 0);
};

var $; //内部使用的 $ 符号



/**
* 内部用的一个 MiniQuery 容器
* @namespace
* @inner
*/
var MiniQuery = $ = {

    expando: 'MiniQuery' + String(Math.random()).replace(/\D/g, ''),

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

    toArray: toArray,

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

    }
};



