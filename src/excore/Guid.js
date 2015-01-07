

/**
* 全局唯一标识符工具类（GUID: Globally Unique Identifier）。
* 提供全局 ID 生成和管理的方法，可用于给组件创建 ID。
* @namespace
*/

define('Guid', function (require, module, exports) {


    var $String = require('String');

    var anonymousName = 'Guid.anonymousName.' + $String.random();

    var group$counter = {}; //分组计数器，从 1 开始
    var guids = {};         //用于 id 的注册，以判断某个 id 在全局内是否已存在




    module.exports = exports = { /**@lends MiniQuery.Guid */

        /**
        * 获取指定分组的下一个计数器。
        * 如果尚未存在该分组，则从 1 开始计数。
        * @param {string} groupName 分组的名称。 
        * @return {int} 返回一个整数。
        * @example 
            $.Guid.next('group1'); //1
            $.Guid.next('group2'); //1
            $.Guid.next('group2'); //2
            $.Guid.next('group1'); //2
            $.Guid.next(); //1
            $.Guid.next(); //2
        */
        next: function (groupName) {

            if (arguments.length == 0) { // next()
                groupName = anonymousName;
            }

            var id = group$counter[groupName] || 0;
            id = id + 1;
            group$counter[groupName] = id;

            return id;
        },

        /**
        * 给指定分组的下计数器清零。
        * 如果尚未存在该分组，则先创建该分组。
        * @param {string} groupName 分组的名称。 
        * @example 
            $.Guid.reset('group1');
            $.Guid.reset('group2');
            $.Guid.reset();
        */
        reset: function (groupName) {
            if (arguments.length == 0) { // reset()
                groupName = anonymousName;
            }

            group$counter[groupName] = 0;
        },

        /**
        * 获取指定分组的并且按指定字符串格式化的 id 值。
        * 如果尚未存在该分组，则从 1 开始计数。
        * @param {string} groupName 分组的名称。 
        * @param {string} [formater='{0}'] 要填充的格式化字符串。
        * @return {string} 返回格式化后的 id 字符串。
        * @example 
            $.Guid.get('group1', 'label_{0}_{1}'); // 'label_1_2'
            $.Guid.get('group1', 'label_{0}_{1}'); // 'label_3_4'
            $.Guid.get('group2', 'button_{0}_{1}'); // 'button_1_2'
            $.Guid.get('group2', 'button_{0}_{0}'); // 'button_3_3'
        */
        get: function (groupName, formater) {

            var $Array = require('Array');
            var $String = require('String');

            formater = formater || '{0}';

            var reg = /\{\d+\}/g;
            var items = formater.match(reg); //把所有的 {0}、{1} 等提取出来

            var ids = $Array.map(items, function (item, index) {
                return exports.next(groupName);
            });

            var id = $String.format(formater, ids);
            exports.add(id);

            return id;
        },

        /**
        * 把指定的 id 值添加(注册)到 guid 列表中，以表示该 id 已被占用。
        * @param {string} id 字符串的 ID 值。
        * @example 
            $.Guid.add('myId');
        */
        add: function (id) {
            guids[id] = true;
        },

        /**
        * 把指定的 id 值从 guid 列表中移除，以表示该 id 已被释放。
        * @param {string} id 字符串的 ID 值。
        * @example 
            $.Guid.remove('myId');
        */
        remove: function (id) {
            delete guids[id];
        },

        /**
        * 判断指定的 id 值已给占用。
        * @param {string} id 字符串的 ID 值。
        * @example 
            $.Guid.exist('myId');
        */
        exist: function (id) {
            return !!guids[id];
        }
    };


});


