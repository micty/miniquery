


var Timer = (function () {
    

    var all = {};

    function add(name) {
        var t = new Date();
        var a = all[name] || [];
        a.push(t);

        all[name] = a;
    }

    function get(name) {
        var a = all[name];

        if (!a) {
            return -1;
        }

        if (a.length % 2 != 0) {
            throw new Error('长度必须为 2 的倍数');
        }

        var groups = $.Array.group(all[name], 2);

        var list = $.Array.map(groups, function (item, index) {
            var start = item[0];
            var end = item[1];
            return end - start;
        });

        return $.Array.sum(list);

    }

    function log(name) {

        var time = get(name);

        if (time < 0) {
            Logger.debug('{0} : null', name);
            return;
        }

        var count = all[name].length / 2;
        var av = Math.floor(time / count);

        Logger.debug('{0} : t={1}, n={2}, a={3}', name, time, count, av);
    }


    return {
        all: all,

        add: add,
        get: get,
        log: log
    };


})();


/**
* 异常类。
* @namespace
*/
var Exception = (function ($) {

    /**
    * 获取一个异常对象。
    */
    function error(formater, v1, v2, v3) {

        var args = $.Array.parse(arguments);
        var msg = $.String.format.apply(null, args);

        return new Error(msg);
    }

    return {
        error: error
    };

})(Haf);
