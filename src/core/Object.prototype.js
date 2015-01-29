
define('Object.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Object = require('Object');


    function init(obj) {
        this.value = Object(obj);
    }


    module.exports =
    init.prototype =
    $Object.prototype = { /**@inner*/

        constructor: $Object,
        init: init,
        value: {},

        /**
        * 拆包装，获取 Object 对象。
        */
        valueOf: function () {
            return this.value;
        },


        clone: function () {
            return $Object.clone(this.value);
        },


        each: function (fn, isDeep) {

            var args = $.concat([this.value], arguments);
            $Object.each.apply(null, args);

            return this;
        },


        extend: function () {

            var args = $.concat([this.value], arguments);

            this.value = $Object.extend.apply(null, args);
            return this;
        },

        extendSafely: function () {

            var args = $.concat([this.value], arguments);

            this.value = $Object.extendSafely.apply(null, args);
            return this;
        },


        getType: function () {
            return $Object.getType(this.value);
        },


        isArray: function (isStrict) {
            return $Object.isArray(this.value, isStrict);
        },


        isBuiltinType: function () {
            return $Object.isBuiltinType(this.value);
        },


        isEmpty: function () {
            return $Object.isEmpty(this.value);
        },


        isPlain: function () {
            return $Object.isPlain(this.value);
        },


        isValueType: function () {
            return $Object.isValueType(this.value);
        },


        isWindow: function () {
            return $Object.isWindow(this.value);
        },


        isWrappedType: function () {
            return $Object.isWrappedType(this.value);
        },


        map: function (fn, isDeep) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.map.apply(null, args);
            return this;
        },


        namespace: function (path, value) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.namespace.apply(null, args);
            return this;
        },


        parseJson: function (data) {
            this.value = $Object.parseJson(data);
            return this;
        },


        parseQueryString: function (url, isShallow, isCompatible) {

            var args = $.toArray(arguments);

            this.value = $Object.parseQueryString.apply(null, args);
            return this;
        },


        remove: function (keys) {
            this.value = $Object.remove(this.value, keys);
            return this;
        },


        replaceValues: function (nameValues, isShallow) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.replaceValues.apply(null, args);
            return this;
        },


        toArray: function (rule, isDeep) {

            var args = $.concat([this.value], arguments);

            return $Object.toArray.apply(null, args);
        },


        toJson: function () {
            return $Object.toJson(this.value);
        },


        toQueryString: function (isCompatible) {

            var args = $.concat([this.value], arguments);

            return $Object.toQueryString.apply(null, args);
        },


        join: function (innerSeparator, pairSeparator) {

            var args = $.concat([this.value], arguments);

            return $Object.join.apply(null, args);
        },


        trim: function (values, isDeep) {

            var args = $.concat([this.value], arguments);

            this.value = $Object.trim.apply(null, args);
            return this;
        },

        filter: function (samples) {
            this.value = $Object.filter(this.value, samples);
            return this;
        },

        filterTo: function (src, samples) {
            this.value = $Object.filterTo(this.value, src, samples);
            return this;
        },

        grep: function (fn) {
            this.value = $Object.grep(this.value, fn);
            return this;
        },

        find: function (fn, isDeep) {
            return $Object.find(this.value, fn, isDeep);
        },

        findItem: function (fn, isDeep) {
            return $Object.findItem(this.value, fn, isDeep);
        },

        findKey: function (fn, isDeep) {
            return $Object.findKey(this.value, fn, isDeep);
        },

        findValue: function (fn, isDeep) {
            return $Object.findValue(this.value, fn, isDeep);

        },

        get: function (key, backupValue) {
            return $Object.get(this.value, key, backupValue);
        },

        set: function (key, value) {
            $Object.set(this.value, key, value);
            return this;
        },

        make: function (key, value) {
            this.value = $Object.make(key, value);
            return this;
        },

        getKeys: function (isDeep) {
            return $Object.getKeys(this.value, isDeep);
        },

        getValues: function (isDeep) {
            return $Object.getValues(this.value, isDeep);
        },

        getItems: function (isDeep) {
            return $Object.getItems(this.value, isDeep);
        }
    };


});



