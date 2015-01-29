
define('Array.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Array = require('Array');

    function init(array) {
        this.value = $Array.parse(array);
    }


    module.exports =
    init.prototype =
    $Array.prototype = { /**@inner*/

        constructor: $Array,
        init: init,

        value: [],

        toString: function (separator) {
            separator = separator === undefined ? '' : separator;
            return this.value.join(separator);
        },

        valueOf: function () {
            return this.value;
        },


        each: function (fn, isReversed) {
            var args = $.concat([this.value], arguments);
            $Array.each.apply(null, args);
            return this;
        },


        toObject: function (maps) {
            var args = $.concat([this.value], arguments);
            return $Array.toObject.apply(null, args);
        },


        map: function (fn) {
            var args = $.concat([this.value], arguments);
            $Array.map.apply(null, args);
            return this;
        },

        keep: function (fn) {
            var args = $.concat([this.value], arguments);
            this.value = $Array.keep.apply(null, args);
            return this;
        },


        grep: function (fn) {
            var args = $.concat([this.value], arguments);
            this.value = $Array.grep.apply(null, args);
            return this;
        },


        indexOf: function (item) {
            var args = $.concat([this.value], arguments);
            return $Array.indexOf(this.value, item);
        },


        contains: function (item) {
            return $Array.contains(this.value, item);
        },


        remove: function (target) {
            this.value = $Array.remove(this.value, target);
            return this;
        },


        removeAt: function (index) {
            this.value = $Array.removeAt(this.value, index);
            return this;
        },


        reverse: function () {
            this.value = $Array.reverse(this.value);
            return this;
        },


        merge: function () {

            //其实是想执行 MiniQuery.Array.merge(this.value, arguments[0], arguments[1], …);
            var args = $.concat([this.value], arguments);
            this.value = $Array.merge.apply(null, args);

            return this;
        },


        mergeUnique: function () {
            //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);

            var args = $.concat([this.value], arguments);
            this.value = $Array.mergeUnique.apply(null, args);

            return this;
        },


        unique: function () {

            this.value = $Array.unique(this.value);
            return this;
        },


        toggle: function (item) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.toggle.apply(null, args);

            return this;
        },


        find: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.find.apply(null, args);
        },


        findIndex: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.findIndex.apply(null, args);
        },


        findItem: function (fn, startIndex) {

            var args = $.concat([this.value], arguments);

            return $Array.findItem.apply(null, args);
        },


        random: function () {
            this.value = $Array.random(this.value);
            return this;
        },


        randomItem: function () {
            return $Array.randomItem(this.value);
        },


        get: function (index) {

            var args = $.concat([this.value], arguments);

            return $Array.get.apply(null, args);
        },


        trim: function () {

            this.value = $Array.trim(this.value);

            return this;
        },


        group: function (size, isPadRight) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.group.apply(null, args);

            return this;
        },


        slide: function (windowSize, stepSize) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.slide.apply(null, args);

            return this;
        },


        circleSlice: function (startIndex, size) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.circleSlice.apply(null, args);

            return this;
        },


        circleSlide: function (windowSize, stepSize) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.circleSlide.apply(null, args);

            return this;
        },


        sum: function (ignoreNaN, key) {

            var args = $.concat([this.value], arguments);

            return $Array.sum.apply(null, args);
        },


        max: function (ignoreNaN, key) {

            var args = $.concat([this.value], arguments);

            return $Array.max.apply(null, args);
        },


        hasItem: function () {
            return $Array.hasItem(this.value);
        },


        reduceDimension: function (count) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.reduceDimension.apply(null, args);

            return this;
        },

        //注意：
        //  $.Array(A).descartes(B, C) 并不等于
        //  $.Array(A).descartes(B).descartes(C) 中的结果

        descartes: function () {

            var args = $.concat([this.value], arguments);
            this.value = $Array.descartes.apply(null, args);

            return this;
        },


        divideDescartes: function (sizes) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.divideDescartes.apply(null, args);

            return this;
        },


        transpose: function () {

            this.value = $Array.transpose(this.value);

            return this;
        },



        //注意：
        // $.Array(a).intersection(b, c) 等于
        // $.Array(a).intersection(b).intersection(c)

        intersection: function () {

            var args = $.concat([this.value], arguments);
            this.value = $Array.intersection.apply(null, args);

            return this;
        },


        equals: function (array, fn) {

            var args = $.concat([this.value], arguments);

            return $Array.equals.apply(null, args);
        },


        isContained: function (B) {

            var args = $.concat([this.value], arguments);

            return $Array.isContained.apply(null, args);
        },


        padLeft: function (totalLength, paddingItem) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.padLeft.apply(null, args);

            return this;
        },


        padRight: function (totalLength, paddingItem) {

            var args = $.concat([this.value], arguments);
            this.value = $Array.padRight.apply(null, args);

            return this;
        },


        pad: function (start, end, step) {

            var args = $.toArray(arguments);
            this.value = $Array.pad.apply(null, args);

            return this;
        }
    };

});
