


/**
* 自定义事件工具类。
* 该模式也叫观察者模式，该模式的另外一个别名是 订阅/发布 模式。
* 设计这种模式背后的主要动机是促进松散耦合。
* 在这种模式中，并不是一个对象调用另一对象的方法，
* 而是一个对象订阅另一个对象的特定活动并在该活动发生改变后获得通知。
* 订阅者也称之为观察者，而被观察的对象成为发布者。
* 当发生了一个重要的事件时，发布者将通知（调用）所有订阅者并且以事件对象的形式传递消息。
* @class
* @param {Object} obj 要进行绑定事件的目标对象。
* @return {MiniQuery.Event} 返回一个 MiniQuery.Event 的实例。
*/

define('Event', function (require, module, exports) {

    var $ = require('$');
    var Mapper = require('Mapper');

    var guidKey = Mapper.getGuidKey();
    var mapper = new Mapper();


    exports = function Event(obj) {
        var prototype = require('Event.prototype');
        return new prototype.init(obj);
    };


    module.exports = $.extend(exports, { /**@lends MiniQuery.Event*/

        /**
        * 给指定的对象绑定指定类型的事件处理函数。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向参数 obj 对象。
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            $.Event.bind(obj, 'show', function(){
                console.log(this.value); // this 指向 obj
            });
            $.Event.bind(obj, {
                myEvent: function(){
                    console.log(this.value);
                },
                add: function(value1, value2){
                    this.value += (value1 * value2);
                }
            });
            $.Event.trigger(obj, 'show'); //输出 100
            $.Event.trigger(obj, 'add', [2, 3]);
            $.Event.trigger(obj, 'myEvent'); //输出 106
        */
        bind: function (obj, eventName, fn, isOnce) {

            var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
            if (!all) { // 首次对 obj 进行绑定事件 
                all = {};
                mapper.set(obj, all);
            }

            switch (typeof eventName) {

                case 'string':  //标准的，单个绑定
                    bindItem(eventName, fn);
                    break;

                case 'object':  //此时类似为 bind(obj, {click: fn, myEvent: fn}, isOnce)
                    var $Object = require('Object');

                    if (!$Object.isPlain(eventName)) {
                        throw new Error('当别参数 eventName 为 object 类型时，必须指定为纯对象 {}');
                    }

                    isOnce = fn; //参数位置修正
                    $Object.each(eventName, function (key, value) {
                        bindItem(key, value);   //批量绑定
                    });
                    break;

                default:
                    throw new Error('无法识别参数 eventName 的类型');
                    break;

            }

            isOnce = !!isOnce; //转成 boolean


            //一个内部的共用函数
            function bindItem(eventName, fn) {
                if (typeof fn != 'function') {
                    throw new Error('参数 fn 必须为一个 function');
                }

                var list = all[eventName] || [];

                list.push({
                    fn: fn,
                    isOnce: isOnce
                });

                all[eventName] = list;
            }

        },

        /**
        * 给指定的对象绑定一个一次性的事件处理函数。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。
            在函数内部，this 指向参数 obj 对象。
        */
        once: function (obj, eventName, fn) {
            
            var args = $.concat(arguments, [true]);
            exports.bind.apply(null, args);

        },

        /**
        * 给指定的对象解除绑定指定类型的事件处理函数。
        * @param {Object} obj 要进行解除绑定事件的目标对象。
        * @param {string} [eventName] 要解除绑定的事件名称。
            如果不指定该参数，则移除所有的事件。
            如果指定了该参数，其类型必须为 string，否则会抛出异常。
        * @param {function} [fn] 要解除绑定事件处理函数。
            如果不指定，则移除 eventName 所关联的所有事件。
        */
        unbind: function (obj, eventName, fn) {

            var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
            if (!all) { //尚未存在对象 obj 所关联的事件列表
                return;
            }


            //未指定事件名，则移除所有的事件
            if (eventName === undefined) {
                mapper.remove(obj);
                return;
            }

            //指定了事件名
            if (typeof eventName != 'string') {
                throw new Error('如果指定了参数 eventName，则其类型必须为 string');
            }

            var list = all[eventName];
            if (!list) { //尚未存在该事件名所对应的事件列表
                return;
            }

            //未指定事件处理函数，则移除该事件名的所有事件处理函数
            if (!fn) {
                all[eventName] = [];
                return;
            }

            var $Array = require('Array');

            //移除所有 fn 的项
            all[eventName] = $Array.grep(list, function (item, index) {
                return item.fn !== fn;
            });
        },

        /**
        * 触发指定的对象上的特定类型事件。
        * @param {Object} obj 要触发事件的目标对象。
        * @param {string} eventName 要触发的事件名称。
        * @param {Array} [args] 要向事件处理函数传递的参数数组。
        * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
        */
        trigger: function (obj, eventName, args) {

            var returns = [];

            var all = mapper.get(obj); // all = {...}
            if (!all) {
                return returns;
            }


            var list = all[eventName]; //取得回调列表
            if (!list) {
                return returns;
            }

            var $Array = require('Array');

            args = args || [];


            //这里要特别注意，在执行回调的过程中，回调函数里有可能会去修改回调列表，
            //即 all[eventName]，而此处又要去移除那些一次性的回调（即只执行一次的），
            //为了避免破坏回调函数里的修改结果，这里要边移除边执行回调，而且每次都要
            //以原来的回调列表为准去查询要移除的项的确切位置。

            list = list.slice(0); //复制一份，因为回调列表可能会在执行回调过程发生变化

            $Array.each(list, function (item, index) {

                if (item.isOnce) { 
                    var index = $Array.indexOf(all[eventName], item); //找到该项在回调列表中的索引位置
                    if (index > -1) {
                        all[eventName].splice(index, 1); //直接从原数组删除
                    }
                }

                var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj
                returns.push(value);

            });

            return returns;
        },

        /**
        * 触发指定的对象上的特定类型事件，当事件处理函数返回指定的值时将停止继续调用。
        * @param {Object} obj 要触发事件的目标对象。
        * @param {string} eventName 要触发的事件名称。
        * @param {Array} [args] 要向事件处理函数传递的参数数组。
        * @param [stopValue=false] 要停止继续调用时的返回值。
            当事件处理函数返回参数 stopValue 所指定的值时，将停止调用后面的处理函数。
        * @return {Array} 返回已调用的事件处理函数的返回值所组成的一个数组。
        */
        triggerStop: function (obj, eventName, args, stopValue) {

            var returns = [];

            var all = mapper.get(obj); // all = {...}
            if (!all) {
                return returns;
            }


            var list = all[eventName]; //取得回调列表
            if (!list) {
                return returns;
            }

            args = args || [];

            if (arguments.length == 3) { //不传 stopValue 时，默认为 false
                stopValue = false;
            }

            var items = [];


            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                var value = item.fn.apply(obj, args); //让 fn 内的 this 指向 obj

                if (!item.isOnce) {
                    items.push(item);
                }

                returns.push(value);

                if (value === stopValue) {
                    break;
                }
            }

            list = list.slice(i + 1);
            all[eventName] = items.concat(list);

            return returns;
        },

        /**
        * 检测指定的对象上是否包含特定类型的事件。
        * @param {Object} obj 要检测的目标对象。
        * @param {string} [eventName] 要检测的事件名称。
            当不指定时，则判断是否包含了任意类型的事件。
        * @param {function} [fn] 要检测的事件处理函数。
        * @return {boolean} 返回一个布尔值，该布尔值指示目标对象上是否包含指否类型的事件以及指定的处理函数。
            如果是则返回 true；否则返回 false。
        */
        has: function (obj, eventName, fn) {

            var all = mapper.get(obj); // all = {...}
            if (!all) {   //尚未绑定任何类型的事件
                return false;
            }


            var $Object = require('Object');

            if (eventName === undefined) {   //未指定事件名，则判断是否包含了任意类型的事件
                if ($Object.isEmpty(all)) { // 空对象 {}
                    return false;
                }

                var hasEvent = false;

                $Object.each(all, function (eventName, list) {
                    if (list && list.length > 0) {
                        hasEvent = true;
                        return false; // break, 只有在回调函数中明确返回 false 才停止循环。
                    }
                });

                return hasEvent;
            }


            //指定了事件名
            if (typeof eventName != 'string') {
                throw new Error('如果指定了参数 eventName，则其类型必须为 string');
            }

            var list = all[eventName]; //取得回调列表
            if (!list || list.length == 0) {
                return false;
            }

            if (fn === undefined) { //未指定回调函数
                return true;
            }

            var $Array = require('Array');

            //从列表中搜索该回调函数
            return $Array.find(list, function (item, index) {
                return item.fn === fn;
            });

        },

        /**
        * 给指定的对象绑定/解除绑定指定类型的事件处理函数。
        * 如果目标对象的指定类型事件中存在该处理函数，则移除它；否则会添加它。
        * @param {Object} obj 要进行绑定/解除绑定事件的目标对象。
        * @param {string} eventName 要绑定/解除绑定的事件名称。
        * @param {function} fn 事件处理函数。 
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            var fn = function() {
                console.log(this.value); // this 指向 obj
            }
            $.Event.bind(obj, 'show', fn);
            $.Event.trigger(obj, 'show'); //输出 100
    
            $.Event.toggle(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以会给移除
            $.Event.trigger(obj, 'show'); //fn 函数已给移除，因为不产生输出
        */
        toggle: function (obj, eventName, fn, isOnce) {

            if (exports.has(obj, eventName, fn)) {
                exports.unbind(obj, eventName, fn);
            }
            else {
                exports.bind(obj, eventName, fn, isOnce);
            }
        },

        /**
        * 给指定的对象只绑定一次指定类型的事件处理函数。
        * 只有当目标对象的指定类型事件中不存在该处理函数时才添加；否则忽略操作。
        * @param {Object} obj 要进行绑定事件的目标对象。
        * @param {string} eventName 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
        * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
            如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
        * @example
            var obj = { value: 100 };
            var fn = function() {
                console.log(this.value); // this 指向 obj
            }
            $.Event.bind(obj, 'show', fn);
            $.Event.trigger(obj, 'show'); //输出 100
    
            $.Event.unique(obj, 'show', fn); //因为 'show' 事件列表中已存在 fn 函数，所以不会重复绑定
            $.Event.trigger(obj, 'show'); //依然只输出 100
        */
        unique: function (obj, eventName, fn, isOnce) {

            if (exports.has(obj, eventName, fn)) {
                return;
            }

            exports.bind(obj, eventName, fn, isOnce);

        },

        /**
        * 创建一个通用事件类的实例。
        * 该实例内部会创建一个具有 guid 的对象用来管理事件。
        * @example
            var event = $.Event.create();
            event.on('myEvent', function () {  });
        */
        create: function () {

            var $String = require('String');

            var obj = {};
            obj[guidKey] = $.String.random();

            return new exports(obj);
        },

        //for test
        //_mapper: mapper,

    });

});








