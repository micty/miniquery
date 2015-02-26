


//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法



define('Data.prototype', function (require, module, exports) {


    var $ = require('$');
    var Data = require('Data');


    function init(node) {
        this.node = node;
    }


    module.exports =
    init.prototype =
    Data.prototype = /**@inner*/ {

        constructor: Data,
        init: init,
        node: null,

        set: function (key, value) {
            Data.set(this.node, key, value);
            return this;
        },

        get: function (key) {
            return Data.get(this.node, key);
        },

        remove: function (key) {
            Data.remove(this.node, key);
            return this;
        },

        acceptData: function () {
            return Data.acceptData(this.node);
        }
      
    };


});


