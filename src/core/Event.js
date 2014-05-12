


/**
* 事件工具类
* @class
* @param {Object} obj 要进行绑定事件的目标对象。
* @return {MiniQuery.Event} 返回一个 MiniQuery.Event 的实例。
*/
MiniQuery.Event = function Event(obj) {
    return new MiniQuery.Event.prototype.init(obj);
};


; (function ($, This, $Object, $String, $Array) {



var expando = $.expando;
var mapper = new $.Mapper();
var anonymousName = 'anonymous_' + $String.random();


$.extend(This, { /**@lends MiniQuery.Event*/
    /**
    * 给指定的对象绑定事件处理函数。
    * @param {Object} obj 要进行绑定事件的目标对象。
    * @param {string} eventName 要绑定的事件名称。
    * @param {function} handler 事件处理函数，函数内部的 this 指向参数 obj 对象。
    * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
        如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
    */
    bind: function (obj, eventName, handler, isOnce) {

        var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
        if (!all) {
            all = {};
            mapper.set(obj, all);
        }

        switch (typeof eventName) {

            case 'string':  //标准的，单个绑定
                bindItem(eventName, handler);
                break;

            case 'object':  //此时类似为 bind(obj, {click: fn, myEvent: fn}, isOnce)
                //if (!$Object.isPlain(eventName)) {
                //    throw new Error('当别参数 eventName 为 object 类型时，必须为纯对象');
                //}

                isOnce = handler; //参数位置修正
                $Object.each(eventName, function (key, value) {
                    bindItem(key, value);   //批量绑定
                });
                break;

            case 'function': //此时为 bind(obj, handler, isOnce)
                //参数位置修正
                isOnce = handler;
                handler = eventName;
                eventName = anonymousName; //匿名事件，则为总事件
                bindItem(eventName, handler);
                break;

            default:
                throw new Error('无法识别参数 eventName 的类型');
                break;

        }

        //一个内部的共用函数
        function bindItem(eventName, handler) {
            var list = all[eventName] || [];

            list.push({
                handler: handler,
                isOnce: isOnce
            });

            all[eventName] = list;
        }

    },

    /**
    * 给指定的对象绑定一个一次性的事件处理函数。
    * @param {Object} obj 要进行绑定事件的目标对象。
    * @param {string} eventName 要绑定的事件名称。
    * @param {function} handler 事件处理函数，函数内部的 this 指向参数 obj 对象。
    */
    once: function (obj, eventName, handler) {

        switch (typeof eventName) {

            case 'string':  //标准的，单个绑定
                This.bind(obj, eventName, handler, true);
                break;

            case 'function'://此时为 once(obj, handler)
            case 'object':  //此时类似为 once(obj, {click: fn, myEvent: fn})
                This.bind(obj, eventName, true);
        }
    },

    /**
    * 给指定的对象解除绑定事件处理函数。
    * @param {Object} obj 要进行解除绑定事件的目标对象。
    * @param {string} [eventName] 要解除绑定的事件名称。
        如果不指定，则移除所有的事件。
    * @param {function} [handler] 要解除绑定事件处理函数。
        如果不指定，则移除 eventName 所关联的所有事件。
    */
    unbind: function (obj, eventName, handler) {

        var all = mapper.get(obj); //获取 obj 所关联的全部事件的容器 {}
        if (!all) { //尚未存在对象 obj 所关联的事件列表
            return;
        }

        if (typeof eventName == 'function') { //匿名事件，此时为 unbind(obj, handler)
            handler = eventName;
            eventName = anonymousName;
        }

        //未指定事件名，则移除所有的事件
        if (!eventName) {
            mapper.remove(obj);
            return;
        }

        var list = all[eventName];
        if (!list) { //尚未存在该事件名所对应的事件列表
            return;
        }

        //未指定事件处理函数，则移除该事件名的所有事件处理函数
        if (!handler) {
            all[eventName] = [];
            return;
        }

        //移除 handler 的项
        all[eventName] = $Array.grep(list, function (item, index) {

            return item.handler !== handler;
        });
    },

    /**
    * 触发指定的对象上的特定类型事件。
    * @param {Object} obj 要触发事件的目标对象。
    * @param {string} eventName 要触发的事件名称。
    * @param {Array} [args] 要向事件处理函数传递的参数数组。
    * @return 返回最一后一个事件处理函数的返回值。
    */
    trigger: function (obj, eventName, args) {

        var all = mapper.get(obj); // all = {...}
        if (!all) {
            return;
        }

        var isAnonymous = false;

        //注意， 因为 args 是可选的，不要判断 eventName 是否为数组
        //或者这样判断也行：eventName === undefined || $.Object.isArray(eventName)
        if (typeof eventName != 'string') { //此时为 trigger(obj, args);
            args = eventName;
            eventName = anonymousName;
            isAnonymous = true;
        }

        var list = all[eventName]; //取得回调列表
        if (!list) {
            return;
        }

        args = args || [];
        var value;

        //依次执行回调列表中的函数，并且移除那些只需要执行一次的
        all[eventName] = $Array.map(list, function (item, index) {
            value = item.handler.apply(obj, args); //让 handler 内的 this 指向 obj
            return item.isOnce ? null : item;
        });

        //非匿名事件，则触发总事件。
        if (!isAnonymous) {
            list = all[anonymousName]; //取得回调列表
            if (list) {
                all[anonymousName] = $Array.map(list, function (item, index) {
                    item.handler.apply(obj, args); //这里的返回值不要
                    return item.isOnce ? null : item;
                });
            }
        }

        return value;
    },

    /**
    * 检测指定的对象上是否包含特定类型的事件。
    * @param {Object} obj 要检测的目标对象。
    * @param {string} [eventName] 要检测的事件名称。
        当不指定时，则判断是否包含了任意类型的事件。
    * @return 如果目标对象上包含指否类型的事件，则返回 true；否则返回 false。
    */
    has: function (obj, eventName) {

        var all = mapper.get(obj); // all = {...}
        if (!all) {   //尚未绑定任何类型的事件
            return false;
        }

        if (!eventName) {   //未指定事件名，则判断是否包含了任意类型的事件
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
        var list = all[eventName]; //取得回调列表
        if (!list || list.length == 0) {
            return false;
        }

        return true;

    }

    //for test
    //, __mapper__: mapper

});
    

})(MiniQuery, MiniQuery.Event, MiniQuery.Object, MiniQuery.String, MiniQuery.Array);


