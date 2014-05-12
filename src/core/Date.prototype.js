


;(function(This){


This.prototype = { /**@inner*/

    constructor: This,
    value: new Date(),


    init: function (date) {
        // 注意 Date(xxx)只返回一个 string，而不是一个 Date 实例。
        this.value = date === undefined ?
            new Date() :                    //未指定参数，则使用当前日期时间
            This.parse(date);   //把参数解析成日期时间
    },


    valueOf: function () {
        return this.value;
    },


    toString: function (formater) {
        return This.format(this.value, formater);
    },


    format: function (formater) {
        return This.format(this.value, formater);
    },


    addYears: function (value) {
        this.value = This.addYears(this.value, value);
        return this;
    },

    addMonths: function (value) {
        this.value = This.addMonths(this.value, value);
        return this;
    },

    addDays: function (value) {
        this.value = This.addDays(this.value, value);
        return this;
    },

    addHours: function (value) {
        this.value = This.addHours(this.value, value);
        return this;
    },

    addMinutes: function (value) {
        this.value = This.addMinutes(this.value, value);
        return this;
    },

    addSeconds: function (value) {
        this.value = This.addSeconds(this.value, value);
        return this;
    },

    addMilliseconds: function (value) {
        this.value = This.addMilliseconds(this.value, value);
        return this;
    }

};

This.prototype.init.prototype = This.prototype;

})(MiniQuery.Date);
