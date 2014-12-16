


//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法
; (function (This) {


This.prototype = { /**@inner*/

    constructor: This,
    node: null,

    init: function (node) {
        this.node = node;
    },

    set: function (key, value) {
        This.set(this.node, key, value);
        return this;
    },

    get: function (key) {
        return This.get(this.node, key);
    },

    remove: function (key) {
        This.remove(this.node, key);
        return this;
    },

    acceptData: function () {
        return This.acceptData(this.node);
    }

};

This.prototype.init.prototype = This.prototype;




})(MiniQuery.Data);