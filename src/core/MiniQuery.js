

/**
* 内部用的一个 MiniQuery 容器
* @namespace
* @inner
*/
function MiniQuery() {

}

var $ = MiniQuery; //内部使用的 $ 符号


/**
* 定义一个针对 MiniQuery 的全局名称，可用作当前运行时确定的标识符。
*/
MiniQuery.expando = 'MiniQuery' + String(Math.random()).replace(/\D/g, '');



/**
* 用指定的值去扩展指定的目标对象，返回目标对象。
*/
MiniQuery.extend = function (target, obj1, obj2) {

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
};



