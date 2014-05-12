

//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Object 包装类的实例方法

; (function (This) {




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
        This.each(this.value, fn, isDeep);
        return this;
    },


    extend: function () {
        //其实是想执行 This.extend(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat(Array.prototype.slice.call(arguments, 0));
        this.value = This.extend.apply(null, args);
        return this;
    },

    extendSafely: function () {
        //其实是想执行 This.extendSafely(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat(Array.prototype.slice.call(arguments, 0));
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
        this.value = This.map(this.value, fn, isDeep);
        return this;
    },


    namespace: function (path, value) {
        this.value = This.namespace(this.value, path, value);
        return this;
    },


    parseJson: function (data) {
        this.value = This.parseJson(data);
        return this;
    },


    parseQueryString: function (url, isShallow, isCompatible) {
        this.value = This.parseQueryString(url, isShallow, isCompatible);
        return this;
    },


    remove: function (keys) {
        this.value = This.remove(this.value, keys);
        return this;
    },


    replaceValues: function (nameValues, isShallow) {
        this.value = This.replaceValues(this.value, nameValues, isShallow);
        return this;
    },


    toArray: function (rule, isDeep) {
        return This.toArray(this.value, rule, isDeep);
    },


    toJSON: function () {
        return This.toJSON(this.value);
    },


    toQueryString: function (isCompatible) {
        return This.toQueryString(this.value, isCompatible);
    },


    toString: function (innerSeparator, pairSeparator) {
        return This.toString(this.value, innerSeparator, pairSeparator);
    },


    trim: function (values, isDeep) {
        this.value = This.trim(this.value, values, isDeep);
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

    getValues: function (isDeep) {
        return This.getValues(this.value, isDeep);
    },

    getItems: function (isDeep) {
        return This.getItems(this.value, isDeep);
    }


};

This.prototype.init.prototype = This.prototype;




})(MiniQuery.Object);