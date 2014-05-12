




//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法


; (function (This) {


This.prototype = { /**@inner*/

    constructor: This,
    value: {},

    init: function (obj) {
        this.value = obj;
    },


    valueOf: function () {
        return this.value;
    },

    on: function (eventName, handler, isOnce) {
        This.bind(this.value, eventName, handler, isOnce);
        return this;
    },

    off: function (eventName, handler) {
        This.unbind(this.value, eventName, handler);
        return this;
    },

    bind: function (eventName, handler, isOnce) {
        This.bind(this.value, eventName, handler, isOnce);
        return this;
    },

    unbind: function (eventName, handler) {
        This.unbind(this.value, eventName, handler);
        return this;
    },

    once: function (eventName, handler) {
        This.once(this.value, eventName, handler);
        return this;
    },

    trigger: function (eventName, args) {
        return This.trigger(this.value, eventName, args);
    },

    has: function (eventName) {
        return This.has(this.value, eventName);
    }


};


This.prototype.init.prototype = This.prototype;

})(MiniQuery.Event);
