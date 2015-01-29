
define('String.prototype', function (require, module, exports) {

    var $ = require('$');
    var $String = require('String');


    function init(string) {
        this.value = String(string);
    }

    module.exports =
    init.prototype =
    $String.prototype = { /**@inner*/

        constructor: $String,
        init: init,
        value: '',

        toString: function () {
            return this.value;
        },

        valueOf: function () {
            return this.value;
        },

        format: function (arg1, arg2) {

            var args = $.concat([this.value], arguments);
            this.value = $String.format.apply(null, args);

            return this;
        },

        replaceAll: function (src, dest) {

            var args = $.concat([this.value], arguments);
            this.value = $String.replaceAll.apply(null, args);

            return this;
        },

        replaceBetween: function (startTag, endTag, newString) {

            var args = $.concat([this.value], arguments);
            this.value = $String.replaceBetween.apply(null, args);

            return this;
        },


        removeAll: function (src) {

            this.value = $String.replaceAll(this.value, src, '');
            return this;
        },

        random: function (size) {
            this.value = $String.random(size);
            return this;
        },

        trim: function () {
            this.value = $String.trim(this.value);
            return this;
        },


        trimStart: function () {
            this.value = $String.trimStart(this.value);
            return this;
        },

        trimEnd: function () {
            this.value = $String.trimEnd(this.value);
            return this;
        },

        split: function (separators) {
            return $String.split(this.value, separators);
        },


        startsWith: function (dest, ignoreCase) {
            return $String.startsWith(this.value, dest, ignoreCase);
        },


        endsWith: function (dest, ignoreCase) {
            return $String.endsWith(this.value, dest, ignoreCase);
        },

        contains: function (target, useOr) {
            return $String.contains(this.value, target, useOr);
        },

        padLeft: function (totalWidth, paddingChar) {
            this.value = $String.padLeft(this.value, totalWidth, paddingChar);
            return this;
        },

        padRight: function (totalWidth, paddingChar) {
            this.value = $String.padRight(this.value, totalWidth, paddingChar);
            return this;
        },

        toCamelCase: function () {
            this.value = $String.toCamelCase(this.value);
            return this;
        },

        toHyphenate: function () {
            this.value = $String.toHyphenate(this.value);
            return this;
        },

        between: function (tag0, tag1) {
            this.value = $String.between(this.value, tag0, tag1);
            return this;
        },

        toUtf8: function () {
            this.value = $String.toUtf8(this.value);
            return this;
        },

        toValue: function (value) {
            return $String.toValue(this.value);
        },

        slide: function (windowSize, stepSize) {
            return $String.slide(this.value, windowSize, stepSize);
        },

        segment: function (size) {
            return $String.segment(this.value, size, size);
        }
    };

});


