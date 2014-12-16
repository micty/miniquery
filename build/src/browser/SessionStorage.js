

/**
* 会话存储工具类
* @namespace
*/
MiniQuery.SessionStorage = (function (sessionStorage) {


    if (!sessionStorage) { //不支持
        return null;
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



})(sessionStorage);



