
//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

; (function (This) {


This.prototype = { /**@inner*/

    constructor: This,
    value: '',


    init: function (string) {
        this.value = String(string);

    },


    toString: function () {
        return this.value;
    },

    valueOf: function () {
        return this.value;
    },


    format: function (arg1, arg2) {
        this.value = This.format(this.value, arg1, arg2);
        return this;
    },

    replaceAll: function (src, dest) {
        this.value = This.replaceAll(this.value, src, dest);
        return this;
    },


    replaceBetween: function (startTag, endTag, newString) {
        this.value = This.replaceBetween(this.value, startTag, endTag, newString);
        return this;
    },


    removeAll: function (src) {
        this.value = This.replaceAll(this.value, src, '');
        return this;
    },

    random: function (size) {
        this.value = This.random(size);
        return this;
    },


    trim: function () {
        this.value = This.trim(this.value);
        return this;
    },


    trimStart: function () {
        this.value = This.trimStart(this.value);
        return this;
    },


    trimEnd: function () {
        this.value = This.trimEnd(this.value);
        return this;
    },


    split: function (separators) {
        return This.split(this.value, separators);
    },


    startsWith: function (dest, ignoreCase) {
        return This.startsWith(this.value, dest, ignoreCase);
    },


    endsWith: function (dest, ignoreCase) {
        return This.endsWith(this.value, dest, ignoreCase);
    },


    contains: function (target, useOr) {
        return This.contains(this.value, target, useOr);
    },


    padLeft: function (totalWidth, paddingChar) {
        this.value = This.padLeft(this.value, totalWidth, paddingChar);
        return this;
    },


    padRight: function (totalWidth, paddingChar) {
        this.value = This.padRight(this.value, totalWidth, paddingChar);
        return this;
    },


    toCamelCase: function () {
        this.value = This.toCamelCase(this.value);
        return this;
    },


    toHyphenate: function () {
        this.value = This.toHyphenate(this.value);
        return this;
    },


    between: function (tag0, tag1) {
        this.value = This.between(this.value, tag0, tag1);
        return this;
    },


    toUtf8: function () {
        this.value = This.toUtf8(this.value);
        return this;
    },


    toValue: function (value) {
        return This.toValue(this.value);
    },

    slide: function (windowSize, stepSize) {
        return This.slide(this.value, windowSize, stepSize);
    },

    segment: function (size) {
        return This.segment(this.value, size, size);
    }
};

This.prototype.init.prototype = This.prototype;

})(MiniQuery.String);