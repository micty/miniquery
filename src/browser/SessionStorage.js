
/**
* 会话存储工具类
* @namespace
* @name SessionStorage
*/
define('SessionStorage', function (require, module, exports) {

    var storage = window.sessionStorage;

    if (!storage) { //不支持
        return null; //须显式的返回 null，以告诉 require 加载器已加载过
    }

    var id = '__MiniQuery.SessionStorage__';
    var all = storage.getItem(id) || null;
    all = JSON.parse(all) || {};


    module.exports = exports = /**@lends SessionStorage*/ {

        /**
        * 设置一对键值。
        * @param {string} key 要进行设置的键名称。
        * @param value 要进行设置的值，可以是任何类型。
        */
        set: function (key, value) {

            if (key in all && all[key] === value) { //已存在
                return;
            }

            all[key] = value;

            var json = JSON.stringify(all);
            storage.setItem(id, json);

        },

        /**
        * 根据给定的键获取关联的值。
        * @param {string} key 要进行获取的键名称。
        * @return 返回该键所关联的值。
        */
        get: function (key) {
            return all[key];
        },

        /**
        * 移除给定的键所关联的项。
        * @param {string} key 要进行移除的键名称。
        */
        remove: function (key) {
            delete all[key];
            var json = JSON.stringify(all);
            storage.setItem(id, json);
        },

        /**
        * 清空所有项。
        */
        clear: function () {
            all = {};
            var json = JSON.stringify(all);
            storage.setItem(id, json);
        },

        /**
        * 对每一项进行迭代，并调用传入的回调函数。
        * @param {function} fn 迭代调用的回调函数。
            该函数会接收到两个参数: 
            key: 当前键的名称。
            value: 当前键所关联的值。
        */
        each: function (fn) {
            for (var key in all) {
                fn(key, all[key]);
            }
        },

        /**
        * 获取所有的项的总个数。
        */
        length: function () {
            return exports.keys().length;
        },

        /**
        * 获取所有的项的键数组。
        */
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

        /**
        * 获取所有的项的键数组指定中的项。
        * @param {number} index 键所对应的索引值。
        */
        key: function key(index) {
            return exports.keys()[index];
        }
    };

});





