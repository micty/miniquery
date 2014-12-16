

/**
* 本地存储工具类
* @namespace
*/
MiniQuery.LocalStorage = (function (localStorage) {


    if (!localStorage) { //不支持
        return null;
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



})(localStorage);
