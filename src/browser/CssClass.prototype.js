
//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法


; (function (This) {



This.prototype = { /**@inner*/
    
    constructor: This,
    value: null,

    init: function (node) {
        this.value = node;
    },


    toString: function () {
        return this.get().join(' ');
    },


    valueOf: function () {
        return this.get(); //返回一个数组
    },


    get: function () {
        return This.get(this.value);
    },


    contains: function (name) {
        return This.contains(this.value, name);
    },


    add: function (names) {
        This.add(this.value, names);
        return this;
    },


    remove: function (names) {
        This.remove(this.value, names);
        return this;
    },


    toggle: function (names) {
        This.toggle(this.value, names);
        return this;
    }
};


This.prototype.init.prototype = This.prototype;



})(MiniQuery.CssClass);