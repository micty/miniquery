
/**
* 本地存储工具类
* @namespace
* @name LocalStorage
*/
define('LocalStorage', function (require, module, exports) {

    var localStorage = window.localStorage;

    if (!localStorage) { //不支持
        return null; //须显式的返回 null，以告诉 require 加载器已加载过
    }


    var id = '__MiniQuery.LocalStorage__';
    var all = localStorage.getItem(id) || null;
    all = JSON.parse(all) || {};



    module.exports = exports = { /**@lends LocalStorage*/

        set: function (key, value) {

            if (key in all && all[key] === value) { //已存在
                return;
            }

            all[key] = value;

            var json = JSON.stringify(all);
            localStorage.setItem(id, json);

        },

        get: function (key) {
            return all[key];
        },

        remove: function (key) {
            delete all[key];
            var json = JSON.stringify(all);
            localStorage.setItem(id, json);
        },

        clear: function () {
            all = {};
            var json = JSON.stringify(all);
            localStorage.setItem(id, json);
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

        key: function (index) {
            return exports.keys()[index];
        }
    };


});


