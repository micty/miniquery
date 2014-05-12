
/**
* @fileOverview 这是一个  Base 文件
*/


; (function ($, Haf, Meta, ClassManager) {




/**
* @class
* Haf 框架的基类，提供最基本的方法和能力。
*/
Haf.Base = function () { 

};



Haf.Base.prototype = {

    constructor: Haf.Base, //修正构造器
    
    /**
    * @field
    */
    xtype: 'base', //为了统一

    /**
    * 获取当前实例的真实类型。
    * 返回一个类的字符串描述。
    */
    getType: function () {
        return Meta.get(this, 'className');
    },

    /**
    * 获取本实例的全局唯一标识符。
    * 该标识符在创建实例时自动分配的。
    */
    getGuid: function () {
        return Meta.getGuid(this);
    },

    /**
    * 获取 config 对象中指定成员的值。
    * 本方法为针对 config 对象中的成员的 getter 方法。
    */
    get: function (config, key) {

        if (typeof config == 'object') { //此时为 get(config, key)
            return key in config ? config[key] : this.config[key];
        }

        //否则 get(key)
        key = config;
        return this.config[key];
    },

    /**
    * 设置 config 对象中指定成员的值。
    * 该方法针对 config 对象中的成员的 setter 方法。
    * 会触发成员的 onbeforechange 和 onchange 事件(除非在调用时指定了安静模式)。
    * @param {string|Object} fieldName 要设置的成员的名称。
        当要进行批量设置时，可传入一个 key-value 的对象。
    * @param [newValue] 要设置的成员的值。
    * @param {boolean} [isQuiet=false] 是否采用安静模式。
        若指定为 true，则表示采用安静模式，不触发任何事件。
    */
    set: function (fieldName, newValue, isQuiet) {

        var isBatch = typeof fieldName == 'object';
        if (isBatch) { //此时为 set({}, isQuiet);
            isQuiet = newValue; //参数修正
            newValue = undefined;
        }

        var config = this.config;

        if (isQuiet === true) { //安静模式，不触发事件。
            if (isBatch) {
                $.Object.extend(config, fieldName);
            }
            else {
                config[fieldName] = newValue;
            }
            return;
        }


        var self = this;
        var hasAnyChange = false; //指示是否有字段的值发生了改变
        var oldConfig = $.Object.extend({}, config); //设置前，拷贝一份作为旧的

        if (isBatch) { // 此时为 set({}, isQuiet);
            $.Object.each(fieldName, set);
        }
        else { //单个的情况
            set(fieldName, newValue);
        }

        if (hasAnyChange) { //最后触发总事件
            self.trigger('change:', [config, oldConfig]); //全部字段
        }
        

        //一个共用的内部方法：只针对单项，并且会触发事件。
        function set(fieldName, newValue) {

            var oldValue = self.get(fieldName);
            var finalValue = newValue;

            var beforeEventName = 'beforechange:' + fieldName;

            if ($.Event.has(self, beforeEventName)) { //已绑定了 beforechange 事件

                //最后一个处理函数的返回值就是最终的返回值
                finalValue = self.trigger(beforeEventName, [newValue, oldValue]);

                //事件处理器返回 undefined，则使用回原来的值
                if (finalValue === undefined) {
                    finalValue = oldValue;
                }
            }

            //只有有一个字段发生了变化，hasAnyChange 就一直保持为 true。
            hasAnyChange = hasAnyChange || (finalValue !== oldValue); 

            //值发生改变
            if (finalValue !== oldValue) { //这里不能用 hasAnyChange，因它可能是上个字段的结果。
                config[fieldName] = finalValue;
                self.trigger('change:' + fieldName, [finalValue, oldValue]); //指定字段
            }
        }

    },

    
    /**
    * 调用父类的指定方法，参数传递形式为类似 call。
    * 只能由具有继承关系的实例方法去调用，而且调用方式为 this.callSuper(arguments, ...)
    */
    callSuper: function ($arguments) {

        var caller = $arguments.callee;
        var className = Meta.get(caller, 'className');
        //if (!className || !ClassManager.isInstanceOf(this, className)) {
        //    throw Haf.error('callSuper 必须在同一个类体系中的实例方法内被调用');
        //}
        
        //下面的逻辑才是真正的主流程
        var SuperClass = ClassManager.getClass(className, 1); //取得父类的构造函数
        
        var methodName = Meta.get(caller, 'methodName');

        //这里一定要从原型上取得方法引用，因为这样可以使用继承特性。
        //不能从原始的 data 中取，因为该 data 是孤立的，它可能不包含该方法。
        var fn = SuperClass.prototype[methodName]; //可能是 SuperClass 自己的方法，也可能是继承下来的。

        if (!fn) {
            throw Haf.error('父类中不存在名为 {0} 的方法', methodName);
            return;
        }

        //var args = $.Array.parse(arguments).slice(1);
        var args = Array.prototype.slice.call(arguments, 1);
        return fn.apply(this, args);
        
    },

    /**
    * 调用本实例中的 config 中指定的方法。
    * 方法中的 this 会指向当前实例。
    */
    callConfig: function (methodName) {

        var fn = this.get(methodName);
        if (typeof fn != 'function') {
            throw Haf.error('不存在名为 {0} 的方法', methodName);
        }

        var args = $.Array.parse(arguments).slice(1);
        return fn.apply(this, args);
    },
       
    /**
    * 调用本实例中的给 config 中的 redinds 中覆盖了的方法。
    * 方法中的 this 会指向当前实例。
    */
    invoke: function (methodName) {

        var origins = Meta.get(this, 'originalMethods');
        var fn = (origins || this)[methodName] || this[methodName];


        if (typeof fn != 'function') {
            throw Haf.error('不存在名为 {0} 的方法', methodName);
        }

        var args = $.Array.parse(arguments).slice(1);
        return fn.apply(this, args);


    },

    /**
    * 给 config 对象中的成员绑定一个 beforechange 事件。
    * 该事件会在 config 对象中的成员的值更新前触发，
    * 事件处理函数必须返回一个值作为该成员最终的值，否则继续使用原来的新值。
    */
    onbeforechange: function (key, fn) {

        var self = this;
        var $Event = $.Event;

        if ($.Object.isPlain(key)) { //针对 { a: fnA, b: fnB } 批量设置的情况

            var maps = key; //换个名称更容易理解

            $.Object.each(maps, function (key, fn) {
                $Event.bind(self, 'beforechange:' + key, fn);
            });
        }
        else {
            $Event.bind(self, 'beforechange:' + key, fn);
        }

    },

    /**
    * 给 config 对象中的成员绑定一个 change 事件。
    * 该事件会在 config 对象中的成员的值更新后触发，以前通知值已更新。
    */
    onchange: function (key, fn) {

        var self = this;

        if ($.Object.isPlain(key)) { //重截 onchange({a: fnA, b: fnB}) 批量设置的情况

            var maps = key; //换个名称更容易理解

            $.Object.each(maps, function (key, fn) {
                $.Event.bind(self, 'change:' + key, fn);
            });
        }
        else if (typeof key == 'function') { //重载 onchange(fn) 的情况

            fn = key;
            $.Event.bind(self, 'change:', fn);
        }
        else if ($.Object.isArray(key)) { //onchange(['a', 'b'], fn)

            var keys = key; //换个名称，此时 keys = ['a', 'b']; 类似这样的数组
            keys = $.Array.toObject(keys, keys); // 建立起 {a:'a', b:'b'} 这样的关系，可避免搜索数组

            $.Event.bind(self, 'change:', function (newConfig, oldConfig) {
                $.Object.each(newConfig, function (key, value) { //此 key 为局部变量
                    if (key in keys) {
                        fn.call(self, newConfig, oldConfig);
                        return false; //break;
                    }
                });
            });
        }
        else {
            $.Event.bind(self, 'change:' + key, fn);
        }

    },

    /**
    * 给本实例绑定事件处理函数。
    * @param {Object|string} eventName 要绑定的事件名称。
        如果为 Object，则表示批量绑定。
    * @param {function} handler 事件处理函数，函数内部的 this 指向本实例。
    * @param {boolean} [isOnce=false] 指示是否只执行一次事件处理函数，
        如果指定为 true，则执行事件处理函数后会将该处理函数从事件列表中移除。
    */
    on: function (eventName, handler, isOnce) {

        var self = this;

        if (typeof eventName == 'object') { //此时为 on( {...}, isOnce );

            var listeners = eventName;
            isOnce = handler;
            handler = undefined;

            $.Object.each(listeners, function (key, value) {

                if (typeof value == 'function') { //此时为 { eventName: fn }
                    self.bind(key, value, isOnce);
                }
                else if (typeof value == 'object') { //此时为 { eventName: {...} }
                    var fn = value.fn;
                    if (typeof fn != 'function') {
                        throw Haf.error('成员 {0} 的值为一个对象时，必须指定该对象中的 fn 为一个函数', key);
                    }

                    var single = 'single' in value ? value.single : isOnce;
                    self.bind(key, fn, single);
                }
                else {
                    throw Haf.error('无法识别 key 为 {0} 的所对应的值', key);
                }
            });
        }
        else {
            self.bind(eventName, handler, isOnce);
        }
       

    },

    /**
    * 绑定单个事件。
    * 这是一个模板方法，此处提供一个默认实现。
    * 当子类想在 on 绑定事件时，请覆盖本方法。
    */
    bind: function (eventName, handler, isOnce) {
        $.Event.bind(this, eventName, handler, isOnce);
    },


    /**
    * 给本实例解除绑定事件处理函数。
    * @param {string} [eventName] 要解除绑定的事件名称。
        如果不指定，则移除所有的事件。
    * @param {function} [handler] 要解除绑定事件处理函数。
        如果不指定，则移除 eventName 所关联的所有事件。
    */
    off: function (eventName, handler) {
        $.Event.unbind(this, eventName, handler);
    },

    /**
    * 给本实例绑定一次性的事件处理函数。
    * @param {string} eventName 要绑定的事件名称。
    * @param {function} handler 事件处理函数，函数内部的 this 指向本实例。
    */
    once: function (eventName, handler) {
        this.on(eventName, handler, true);
        //$.Event.once(this, eventName, handler); //不要用这个，因为子类可能会在 bind 中有自己的实现
    },

    /**
    * 触本实例上的特定类型事件。
    * @param {string} eventName 要触发的事件名称。
    * @param {Array} [args] 要向事件处理函数传递的参数数组。
    * @return 返回最一后一个事件处理函数的返回值。
    */
    trigger: function (eventName, args) {
        return $.Event.trigger(this, eventName, args);
    },

    /**
    * 获取本实例的字符串描述。
    * 默认返回本实例的 guid，在 Mapper 中会用到该 guid 以产生良好的分布。
    * 如果子类要重写该方法，请确保每次调用都会返回相同的字符串值，否则在事件绑定与触发时可能会产生异常。
    */
    toString: function () {
        return Meta.getGuid(this);
    },

    


    /**
    * 提供默认的初始化方法，会在创建实例时调用。
    * 子类如果要执行自己的操作，请覆盖本方法，
    * 并且显式调用 this.callSuper(arguments, config)。
    */
    initialize: function (config) {

        $.Object.extendDeeply(this.config, config);
    },

    /**
    * 销毁本实例，同时执行一些清理操作。
    * 该方法会释放所有关联的资源，包括元数据和事件。
    * 子类如果要执行自己的操作，请覆盖本方法，并且务必要调用 this.callSuper(arguments) 来执行清理操作。
    */
    dispose: function () {

        Meta.remove(this);  //1, 移除关联的元数据
        this.off();         //2, 移除绑定的事件

        //3, 如果是组件，要从组件树中清理，并且要调用 native 的清理操作
    }

    


};

})(Haf, Haf, Meta, ClassManager);