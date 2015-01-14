
/**
* CSS 类工具
* @class
*/

define('CssClass', function (require, module, exports) {

    exports = function (node) {
        var prototype = require('CssClass.prototype');
        return new prototype.init(node);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.CssClass*/

        /**
        * 获取某个 DOM 元素的 class 类名；
        * 或者把一个用空格分隔的字符串转成 class 类名；
        * 返回一个数组。
        */
        get: function (node) {

            var names = '';
            if (node.className) {
                names = node.className;
            }
            else if (typeof node == 'string') {
                names = node;
            }

            var $Array = require('Array');

            return $Array(names.split(' ')).unique().map(function (item, index) {
                return item == '' ? null : item;

            }).valueOf();


        },

        /**
        * 判断某个 DOM 节点是否包含指定的 class 类名。
        * 如果是，则返回 true；否则返回 false。
        */
        contains: function (node, name) {
            var $Array = require('Array');

            var list = this.get(node);
            return $Array.contains(list, name);
        },

        /**
        * 给某个 DOM 节点添加指定的 class 类名（一个或多个）。
        */
        add: function (node, names) {

            var $Object = require('Object');
            var $Array = require('Array');

            var list = this.get(node);
            var classNames = $Object.isArray(names) ? names : this.get(names);

            list = $Array.mergeUnique(list, classNames);   //合并数组，并去掉重复的项
            node.className = list.join(' ');

            return this;
        },

        /**
        * 给某个 DOM 节点移除指定的 class 类名（一个或多个）。
        */
        remove: function (node, names) {

            var $Object = require('Object');
            var $Array = require('Array');

            var list = this.get(node);
            var classNames = $Object.isArray(names) ? names : this.get(names);

            $Array.each(classNames, function (item, index) {  //逐项移除
                list = $Array.remove(list, item);
            });

            node.className = list.join(' ');
            return this;
        },

        /**
        * 给某个 DOM 节点切换指定的 class 类名（一个或多个）。
        * 切换是指：如果之前已经有，则移除；否则添加进去。
        */
        toggle: function (node, names) {

            var $Object = require('Object');
            var $Array = require('Array');

            var list = this.get(node);
            var classNames = $Object.isArray(names) ? names : this.get(names);
            $Array.each(classNames, function (item, index) {  //逐项切换

                list = $Array.toggle(list, item);
            });

            node.className = list.join(' ');
            return this;
        }
    });

});



