
define('Date.prototype', function (require, module, exports) {

    var $Date = require('Date');


    function init(date) {

        // 注意 Date(xxx)只返回一个 string，而不是一个 Date 实例。
        this.value = date === undefined ?
            new Date() :        //未指定参数，则使用当前日期时间
            $Date.parse(date);  //把参数解析成日期时间
    }


    module.exports =
    init.prototype =
    $Date.prototype = { /**@inner*/

        constructor: $Date,
        init: init,

        value: new Date(),


        valueOf: function () {
            return this.value;
        },


        toString: function (formater) {
            return $Date.format(this.value, formater);
        },


        format: function (formater) {
            return $Date.format(this.value, formater);
        },


        addYears: function (value) {
            this.value = $Date.addYears(this.value, value);
            return this;
        },

        addMonths: function (value) {
            this.value = $Date.addMonths(this.value, value);
            return this;
        },

        addDays: function (value) {
            this.value = $Date.addDays(this.value, value);
            return this;
        },

        addHours: function (value) {
            this.value = $Date.addHours(this.value, value);
            return this;
        },

        addMinutes: function (value) {
            this.value = $Date.addMinutes(this.value, value);
            return this;
        },

        addSeconds: function (value) {
            this.value = $Date.addSeconds(this.value, value);
            return this;
        },

        addMilliseconds: function (value) {
            this.value = $Date.addMilliseconds(this.value, value);
            return this;
        }
    };


});

