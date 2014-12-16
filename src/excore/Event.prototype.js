




//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法


; (function (This) {

var slice = Array.prototype.slice;

This.prototype = { /**@inner*/

    constructor: This,
    value: {},

    init: function (obj) {
        this.value = obj;
    },


    valueOf: function () {
        return this.value;
    },

    on: function (eventName, fn, isOnce) {
        //This.bind(this.value, eventName, fn, isOnce);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.bind.apply(null, args);
        return this;
    },

    off: function (eventName, fn) {
        //This.unbind(this.value, eventName, fn);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.unbind.apply(null, args);
        return this;
    },

    bind: function (eventName, fn, isOnce) {
        //This.bind(this.value, eventName, fn, isOnce);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.bind.apply(null, args);
        return this;
    },

    unbind: function (eventName, fn) {
        //This.unbind(this.value, eventName, fn);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.unbind.apply(null, args);
        return this;
    },

    once: function (eventName, fn) {
        //This.once(this.value, eventName, fn);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.once.apply(null, args);
        return this;
    },

    trigger: function (eventName, args) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.trigger.apply(null, args);
        //return This.trigger(this.value, eventName, args);
    },

    triggerStop: function (eventName, args, stopValue) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.triggerStop.apply(null, args);
    },

    fire: function (eventName, args) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.trigger.apply(null, args);
        //return This.trigger(this.value, eventName, args);
    },

    fireStop: function (eventName, args, stopValue) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.triggerStop.apply(null, args);
    },

    has: function (eventName, fn) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.has.apply(null, args);
        //return This.has(this.value, eventName, fn);
    },

    toggle: function (eventName, fn, isOnce) {
        //This.toggle(this.value, eventName, fn, isOnce);
        var args = [this.value].concat(slice.call(arguments, 0));
        This.toggle.apply(null, args);
        return this;
    },

    unique: function (eventName, fn, isOnce) {
        var args = [this.value].concat(slice.call(arguments, 0));
        return This.unique.apply(null, args);
    }

};


This.prototype.init.prototype = This.prototype;

})(MiniQuery.Event);
