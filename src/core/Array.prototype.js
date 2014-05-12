


//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

; (function (This) {


This.prototype = { /**@inner*/

    constructor: This,
    value: [],


    init: function (array) {
        this.value = This.parse(array);
    },


    toString: function (separator) {
        separator = separator === undefined ? '' : separator;
        return this.value.join(separator);
    },

    valueOf: function () {
        return this.value;
    },


    each: function (fn, isReversed) {
        This.each(this.value, fn, isReversed);
        return this;
    },


    toObject: function (maps) {
        return This.toObject(this.value, maps);
    },


    map: function (fn) {
        this.value = This.map(this.value, fn);
        return this;
    },

    keep: function (fn) {
        this.value = This.keep(this.value, fn);
        return this;
    },


    grep: function (fn) {
        this.value = This.grep(this.value, fn);
        return this;
    },


    indexOf: function (item) {
        return This.indexOf(this.value, item);
    },


    contains: function (item) {
        return This.contains(this.value, item);
    },


    remove: function (target) {
        this.value = This.remove(this.value, target);
        return this;
    },


    removeAt: function (index) {
        this.value = This.removeAt(this.value, index);
        return this;
    },


    reverse: function () {
        this.value = This.reverse(this.value);
        return this;
    },


    merge: function () {
        //其实是想执行 MiniQuery.Array.merge(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat(Array.prototype.slice.call(arguments, 0));
        this.value = This.merge.apply(null, args);
        return this;
    },


    mergeUnique: function () {
        //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat(Array.prototype.slice.call(arguments, 0));
        this.value = This.mergeUnique.apply(null, args);
        return this;
    },


    unique: function () {
        this.value = This.unique(this.value);
        return this;
    },


    toggle: function (item) {
        this.value = This.toggle(this.value, item);
        return this;
    },


    find: function (fn, startIndex) {
        return This.find(this.value, fn, startIndex);
    },


    findIndex: function (fn, startIndex) {
        return This.findIndex(this.value, fn, startIndex);
    },


    findItem: function (fn, startIndex) {
        return This.findItem(this.value, fn, startIndex);
    },


    random: function () {
        this.value = This.random(this.value);
        return this;
    },


    randomItem: function () {
        return This.randomItem(this.value);
    },


    get: function (index) {
        return This.get(this.value, index);
    },


    trim: function () {
        this.value = This.trim(this.value);
        return this;
    },


    group: function (size, isPadRight) {
        this.value = This.group(this.value, size, isPadRight);
        return this;
    },


    slide: function (windowSize, stepSize) {
        this.value = This.slide(this.value, windowSize, stepSize);
        return this;
    },


    circleSlice: function (startIndex, size) {
        this.value = This.circleSlice(this.value, startIndex, size);
        return this;
    },


    circleSlide: function (windowSize, stepSize) {
        this.value = This.circleSlide(this.value, windowSize, stepSize);
        return this;
    },


    sum: function (ignoreNaN, key) {
        return This.sum(this.value, ignoreNaN, key);
    },


    max: function (ignoreNaN, key) {
        return This.max(this.value, ignoreNaN, key);
    },


    hasItem: function () {
        return This.hasItem(this.value);
    },


    reduceDimension: function (count) {
        this.value = This.reduceDimension(this.value, count);
        return this;
    },

    //注意：
    //  $.Array(A).descartes(B, C) 并不等于
    //  $.Array(A).descartes(B).descartes(C) 中的结果

    descartes: function () {
        var args = This.parse(arguments); //转成数组
        args = [this.value].concat(args);

        this.value = This.descartes.apply(null, args);
        return this;
    },


    divideDescartes: function (sizes) {
        this.value = This.divideDescartes(this.value, sizes);
        return this;
    },


    transpose: function () {
        this.value = This.transpose(this.value);
        return this;
    },

    //注意：
    // $.Array(a).intersection(b, c) 等于
    // $.Array(a).intersection(b).intersection(c)

    intersection: function () {
        var args = This.parse(arguments); //转成数组
        args = [this.value].concat(args);

        this.value = This.intersection.apply(null, args);
        return this;
    },


    equals: function (array, fn) {
        return This.equals(this.value, array, fn);
    },


    isContained: function (B) {
        return This.isContained(this.value, B);
    },


    padLeft: function (totalLength, paddingItem) {
        this.value = This.padLeft(this.value, totalLength, paddingItem);
        return this;
    },


    padRight: function (totalLength, paddingItem) {
        this.value = This.padRight(this.value, totalLength, paddingItem);
        return this;
    },


    pad: function (start, end, step) {
        this.value = This.pad(start, end, step);
        return this;
    }
};

This.prototype.init.prototype = This.prototype;

})(MiniQuery.Array);