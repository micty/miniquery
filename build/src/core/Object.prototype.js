

//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Object 包装类的实例方法

; (function (This) {


var slice = Array.prototype.slice;

This.prototype = { /**@inner*/

    constructor: This,
    value: {},


    init: function (obj) {
        this.value = Object(obj);
    },

    /**
    * 拆包装，获取 Object 对象。
    */
    valueOf: function () {
        return this.value;
    },


    clone: function () {
        return This.clone(this.value);
    },


    each: function (fn, isDeep) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        This.each.apply(null, args);

        return this;
    },


    extend: function () {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        this.value = This.extend.apply(null, args);
        return this;
    },

    extendSafely: function () {

        var args = [this.value].concat(slice.call(arguments, 0));

        this.value = This.extendSafely.apply(null, args);
        return this;
    },


    getType: function () {
        return This.getType(this.value);
    },


    isArray: function (isStrict) {
        return This.isArray(this.value, isStrict);
    },


    isBuiltinType: function () {
        return This.isBuiltinType(this.value);
    },


    isEmpty: function () {
        return This.isEmpty(this.value);
    },


    isPlain: function () {
        return This.isPlain(this.value);
    },


    isValueType: function () {
        return This.isValueType(this.value);
    },


    isWindow: function () {
        return This.isWindow(this.value);
    },


    isWrappedType: function () {
        return This.isWrappedType(this.value);
    },


    map: function (fn, isDeep) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        this.value = This.map.apply(null, args);
        return this;
    },


    namespace: function (path, value) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        this.value = This.namespace.apply(null, args);
        return this;
    },


    parseJson: function (data) {
        this.value = This.parseJson(data);
        return this;
    },


    parseQueryString: function (url, isShallow, isCompatible) {

        var args = slice.call(arguments, 0);

        this.value = This.parseQueryString.apply(null, args);
        return this;
    },


    remove: function (keys) {
        this.value = This.remove(this.value, keys);
        return this;
    },


    replaceValues: function (nameValues, isShallow) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        this.value = This.replaceValues.apply(null, args);
        return this;
    },


    toArray: function (rule, isDeep) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        return This.toArray.apply(null, args);
    },


    toJson: function () {
        return This.toJson(this.value);
    },


    toQueryString: function (isCompatible) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        return This.toQueryString.apply(null, args);
    },


    join: function (innerSeparator, pairSeparator) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        return This.join.apply(null, args);
    },


    trim: function (values, isDeep) {

        var args = slice.call(arguments, 0);
        args = [this.value].concat(args);

        this.value = This.trim.apply(null, args);
        return this;
    },

    filter: function (samples) {
        this.value = This.filter(this.value, samples);
        return this;
    },

    filterTo: function (src, samples) {
        this.value = This.filterTo(this.value, src, samples);
        return this;
    },

    grep: function (fn) {
        this.value = This.grep(this.value, fn);
        return this;
    },

    find: function (fn, isDeep) {
        return This.find(this.value, fn, isDeep);
    },

    findItem: function (fn, isDeep) {
        return This.findItem(this.value, fn, isDeep);
    },

    findKey: function (fn, isDeep) {
        return This.findKey(this.value, fn, isDeep);
    },

    findValue: function (fn, isDeep) {
        return This.findValue(this.value, fn, isDeep);

    },

    get: function (key, backupValue) {
        return This.get(this.value, key, backupValue);
    },

    set: function (key, value) {
        This.set(this.value, key, value);
        return this;
    },

    make: function (key, value) {
        this.value = This.make(key, value);
        return this;
    },

    getKeys: function (isDeep) {
        return This.getKeys(this.value, isDeep);
    },

    getValues: function (isDeep) {
        return This.getValues(this.value, isDeep);
    },

    getItems: function (isDeep) {
        return This.getItems(this.value, isDeep);
    }


};

This.prototype.init.prototype = This.prototype;




})(MiniQuery.Object);