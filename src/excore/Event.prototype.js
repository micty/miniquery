

//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

define('Event.prototype', function (require, module, exports) {

    var $ = require('$');
    var Event = require('Event');


    function init(obj) {
        this.value = obj;
    }


    module.exports =
    init.prototype =
    Event.prototype = { /**@inner*/

        constructor: Event,
        init: init,
        value: {},


        valueOf: function () {
            return this.value;
        },

        on: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.bind.apply(null, args);
            return this;
        },

        off: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.unbind.apply(null, args);
            return this;
        },

        bind: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.bind.apply(null, args);
            return this;
        },

        unbind: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.unbind.apply(null, args);
            return this;
        },

        once: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            Event.once.apply(null, args);
            return this;
        },

        trigger: function (eventName, args) {
            var args = $.concat([this.value], arguments);
            return Event.trigger.apply(null, args);
        },

        triggerStop: function (eventName, args, stopValue) {
            var args = $.concat([this.value], arguments);
            return Event.triggerStop.apply(null, args);
        },

        fire: function (eventName, args) {
            var args = $.concat([this.value], arguments);
            return Event.trigger.apply(null, args);
        },

        fireStop: function (eventName, args, stopValue) {
            var args = $.concat([this.value], arguments);
            return Event.triggerStop.apply(null, args);
        },

        has: function (eventName, fn) {
            var args = $.concat([this.value], arguments);
            return Event.has.apply(null, args);
        },

        toggle: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            Event.toggle.apply(null, args);
            return this;
        },

        unique: function (eventName, fn, isOnce) {
            var args = $.concat([this.value], arguments);
            return Event.unique.apply(null, args);
        }
    };

});

