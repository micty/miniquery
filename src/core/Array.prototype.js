


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
        var args = $.concat([this.value], arguments);
        This.each.apply(null, args);
        return this;
    },


    toObject: function (maps) {
        var args = $.concat([this.value], arguments);
        return This.toObject.apply(null, args);
    },


    map: function (fn) {
        var args = $.concat([this.value], arguments);
        This.map.apply(null, args);
        return this;
    },

    keep: function (fn) {
        var args = $.concat([this.value], arguments);
        this.value = This.keep.apply(null, args);
        return this;
    },


    grep: function (fn) {
        var args = $.concat([this.value], arguments);
        this.value = This.grep.apply(null, args);
        return this;
    },


    indexOf: function (item) {
        var args = $.concat([this.value], arguments);
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
        var args = $.concat([this.value], arguments);
        this.value = This.merge.apply(null, args);

        return this;
    },


    mergeUnique: function () {
        //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);

        var args = $.concat([this.value], arguments);
        this.value = This.mergeUnique.apply(null, args);

        return this;
    },


    unique: function () {

        this.value = This.unique(this.value);
        return this;
    },


    toggle: function (item) {

        var args = $.concat([this.value], arguments);
        this.value = This.toggle.apply(null, args);

        return this;
    },


    find: function (fn, startIndex) {

        var args = $.concat([this.value], arguments);

        return This.find.apply(null, args);
    },


    findIndex: function (fn, startIndex) {

        var args = $.concat([this.value], arguments);

        return This.findIndex.apply(null, args);
    },


    findItem: function (fn, startIndex) {

        var args = $.concat([this.value], arguments);

        return This.findItem.apply(null, args);
    },


    random: function () {
        this.value = This.random(this.value);
        return this;
    },


    randomItem: function () {
        return This.randomItem(this.value);
    },


    get: function (index) {

        var args = $.concat([this.value], arguments);

        return This.get.apply(null, args);
    },


    trim: function () {

        this.value = This.trim(this.value);

        return this;
    },


    group: function (size, isPadRight) {

        var args = $.concat([this.value], arguments);
        this.value = This.group.apply(null, args);

        return this;
    },


    slide: function (windowSize, stepSize) {

        var args = $.concat([this.value], arguments);
        this.value = This.slide.apply(null, args);

        return this;
    },


    circleSlice: function (startIndex, size) {

        var args = $.concat([this.value], arguments);
        this.value = This.circleSlice.apply(null, args);

        return this;
    },


    circleSlide: function (windowSize, stepSize) {

        var args = $.concat([this.value], arguments);
        this.value = This.circleSlide.apply(null, args);

        return this;
    },


    sum: function (ignoreNaN, key) {

        var args = $.concat([this.value], arguments);

        return This.sum.apply(null, args);
    },


    max: function (ignoreNaN, key) {

        var args = $.concat([this.value], arguments);

        return This.max.apply(null, args);
    },


    hasItem: function () {
        return This.hasItem(this.value);
    },


    reduceDimension: function (count) {

        var args = $.concat([this.value], arguments);
        this.value = This.reduceDimension.apply(null, args);

        return this;
    },

    //注意：
    //  $.Array(A).descartes(B, C) 并不等于
    //  $.Array(A).descartes(B).descartes(C) 中的结果

    descartes: function () {

        var args = $.concat([this.value], arguments);
        this.value = This.descartes.apply(null, args);

        return this;
    },


    divideDescartes: function (sizes) {

        var args = $.concat([this.value], arguments);
        this.value = This.divideDescartes.apply(null, args);

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

        var args = $.concat([this.value], arguments);
        this.value = This.intersection.apply(null, args);

        return this;
    },


    equals: function (array, fn) {

        var args = $.concat([this.value], arguments);

        return This.equals.apply(null, args);
    },


    isContained: function (B) {

        var args = $.concat([this.value], arguments);

        return This.isContained.apply(null, args);
    },


    padLeft: function (totalLength, paddingItem) {

        var args = $.concat([this.value], arguments);
        this.value = This.padLeft.apply(null, args);

        return this;
    },


    padRight: function (totalLength, paddingItem) {

        var args = $.concat([this.value], arguments);
        this.value = This.padRight.apply(null, args);

        return this;
    },


    pad: function (start, end, step) {

        var args = $.toArray(arguments);
        this.value = This.pad.apply(null, args);

        return this;
    }
};

This.prototype.init.prototype = This.prototype;

})(MiniQuery.Array);