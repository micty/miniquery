
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


    module.exports = exports = {

        set: function (key, value) {

            if (key in all && all[key] === value) { //已存在
                return;
            }

            all[key] = value;

            var json = JSON.stringify(all);
            sessionStorage.setItem(id, json);

        },

        get: function (key) {
            return all[key];
        },

        remove: function (key) {
            delete all[key];
            var json = JSON.stringify(all);
            sessionStorage.setItem(id, json);
        },

        clear: function () {
            all = {};
            var json = JSON.stringify(all);
            sessionStorage.setItem(id, json);
        },

        each: function (fn) {
            for (var key in all) {
                fn(key, all[key]);
            }
        },

        length: function () {
            return exports.keys().length;
        },

        keys: function () {
            if (typeof Object.keys == 'function') {
                return Object.keys(all);
            }

            var a = [];
            for (var key in all) {
                a.push(key);
            }

            return a;
        },

        key: function key(index) {
            return exports.keys()[index];
        }
    };

});





