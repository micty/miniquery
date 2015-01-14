
//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

define('CssClass.prototype', function (require, module, exports) {


    var $ = require('$');
    var CssClass = require('CssClass');


    function init(node) {
        this.value = node;
    }


    module.exports =
    init.prototype =
    CssClass.prototype = { /**@inner*/

        constructor: CssClass,
        init: init,
        value: null,

        toString: function () {
            return this.get().join(' ');
        },


        valueOf: function () {
            return this.get(); //返回一个数组
        },


        get: function () {
            return CssClass.get(this.value);
        },


        contains: function (name) {
            return CssClass.contains(this.value, name);
        },


        add: function (names) {
            CssClass.add(this.value, names);
            return this;
        },


        remove: function (names) {
            CssClass.remove(this.value, names);
            return this;
        },


        toggle: function (names) {
            CssClass.toggle(this.value, names);
            return this;
        }
        
    };


});


