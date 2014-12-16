


//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Boolean 包装类的实例方法

; (function (This) {


This.prototype = { /**@inner*/

    constructor: This,
    value: false,


    init: function (b) {
        this.value = This.parse(b);
    },


    valueOf: function () {
        return this.value;
    },


    toString: function () {
        return this.value.toString();
    },


    toInt: function () {
        return this.value ? 1 : 0;
    },


    reverse: function () {
        this.value = !this.value;
        return this;
    },

    random: function () {
        this.value = This.random();
        return;
    }
};


This.prototype.init.prototype = This.prototype;

})(MiniQuery.Boolean);