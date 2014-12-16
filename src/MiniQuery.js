





/**
* 以安全的方式给 MiniQuery 使用一个新的命名空间。
* 比如 MiniQuery.use('$')，则 global.$ 基本上等同于 global.MiniQuery；
* 当 global 中未存在指定的命名空间或参数中指定了要全量覆盖时，则使用全量覆盖的方式，
* 该方式会覆盖原来的命名空间，可能会造成成一些错误，不推荐使用；
* 当 global 中已存在指定的命名空间时，则只拷贝不冲突的部分到该命名空间，
* 该方式是最安全的方式，也是默认和推荐的方式。
*/
MiniQuery.use = function (newNamespace, isOverried) {

    if (!global[newNamespace] || isOverried) { //未存在或明确指定了覆盖
        global[newNamespace] = MiniQuery; //全量覆盖
        return;
    }


    //已经存在，则拷贝不冲突的成员部分
    var obj = global[newNamespace];

    for (var key in MiniQuery) {

        if ((/^(extend|toArray)$/).test(key)) {
            continue;
        }

        if (!(key in obj)) { //只拷贝不冲突的部分
            obj[key] = MiniQuery[key];
        }
    }

};


//暴露
if (typeof exports != 'undefined') { // node.js

    if (typeof module != 'undefined' && module.exports) {
        exports = module.exports = MiniQuery;
    }
    exports.MiniQuery = MiniQuery;
}
else if (typeof define == 'function' && (define.amd || define.cmd)) { //amd|cmd
    define(function (require) {
        return MiniQuery;
    });
}
else { //browser
    global.MiniQuery = MiniQuery;
}