


/**
* 回调列表类。
* @class
*/

define('Callbacks', function (require, module, exports) {

    var $String = require('String');
    var Mapper = require('Mapper');
    var Event = require('Event');



    var guidKey = Mapper.getGuidKey();
    var eventName = '__callback__' + $String.random();
    var slice = Array.prototype.slice;

    /**
    * @inner
    * 构造函数
    */
    function Callbacks() {
        this[guidKey] = $String.random();
    }


    $.extend(Callbacks.prototype, { /**@lends MiniQuery.Callbacks#*/

        /**
        * 添加一个回调函数到回调列表中。
        * @param {function} fn 要添加的回调函数
        * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
            如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
        */
        add: function (fn, isOnce) {
            var args = $.concat([this, eventName], arguments);
            Event.bind.apply(null, args);
        },

        /**
        * 添加一个只调用一次的回调函数到回调列表中。
        * @param {function} fn 要添加的回调函数。
            该回调函数给调用一次后会被移除。
        */
        once: function (fn) {
            var args = $.concat([this, eventName], arguments);
            Event.once.apply(null, args);
        },

        /**
        * 从回调列表中移除指定的回调函数。
        * @param {function} fn 要移除的回调函数。
        */
        remove: function (fn) {
            var args = $.concat([this, eventName], arguments);
            Event.unbind.apply(null, args);
        },

        /**
        * 调用回调列表中的回调函数，并可选地传递一些参数。
        * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
        */
        fire: function () {
            var args = $.toArray(arguments);
            return Event.trigger(this, eventName, args);
        },

        /**
        * 切换到指定的上下文来调用回调列表中的回调函数，并可选传递一些参数。
        * @param {Object} context 要切换到上下文对象。
            指定该参数后，回调函数中的 this 均指向该上下文对象。
        * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
        * @example
            var callbacks = new $.Callbacks();
            callbacks.add(function (a, b) {
                console.log(this.value, a, b);
            });
            callbacks.fireWith({ value: 100 }, 'aa', 'bb'); //输出 100, 'aa', 'bb'
        */
        fireWith: function (context) {

            var hasGuid = guidKey in context;

            var old = context[guidKey];
            context[guidKey] = this[guidKey];

            var args = slice.call(arguments, 1); //从索引为 1 开始后的所有参数都当作要传递给回调函数的参数
            var values = Event.trigger(context, eventName, args);

            if (hasGuid) {
                context[guidKey] = old;
            }
            else {
                delete context[guidKey];
            }

            return values;


        },

        /**
        * 调用回调列表中的回调函数直到某个回调函数返回指定的值为止，并可选地传递一些参数。
        * @param {Object} stopValue 要使回调列表停止调用的值。
            回调列表依次调用列表中的回调函数，当回调函数返回值为 stopValue 指定的值时，将会停止调用后面的。
        * @return {Array} 返回由被调用的回调函数的返回值所组成的数组。
        */
        fireStop: function (stopValue) {
            var args = slice.call(arguments, 1); //从索引为 1 开始后的所有参数都当作要传递给回调函数的参数
            return Event.triggerStop(this, eventName, args, stopValue);
        },

        /**
        * 判断回调列表中是否包含指定的回调函数。
        * @param {function} fn 要判断的回调函数。
        * @return {boolean} 如果回调列表中包含指定的回调函数，则返回 true；否则返回 false。
        */
        has: function (fn) {
            var args = $.concat([this, eventName], arguments);
            return Event.has.apply(null, args);
        },


        /**
        * 给回调列表添加/移除指定的回调函数。
        * 如果回调列表中存在该回调函数，则移除它；否则会添加它。
        * @param {function} fn 回调函数。 
        * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
            如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
        */
        toggle: function (fn, isOnce) {
            var args = $.concat([this, eventName], arguments);
            Event.toggle.apply(null, args);
        },

        /**
        * 给回调列表只添加一次指定的回调函数。
        * 只有当回调列表中不存在该回调函数时才添加它；否则会忽略。
        * @param {function} fn 要添加的回调函数。 
        * @param {boolean} [isOnce=false] 指示回调函数是否只给调用一次。
            如果要让回调函数给调用一次后被移除，请指定为 true；否则不指定或指定为 false。
        */
        unique: function (fn, isOnce) {
            var args = $.concat([this, eventName], arguments);
            Event.unique.apply(null, args);
        }

    });


    module.exports = Callbacks;

});





