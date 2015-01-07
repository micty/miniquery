


//----------------------------------------------------------------------------------------------------------------
//MiniQuery.Boolean 包装类的实例方法


define('Boolean.prototype', function (require, module, exports) {


    var $ = require('$');
    var $Boolean = require('Boolean');


    function init(b) {
        this.value = $Boolean.parse(b);
    }

    
    module.exports =
    init.prototype =
    $Boolean.prototype = { /**@inner*/

        constructor: $Boolean,
        init: init,

        value: false,

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
            this.value = $Boolean.random();
            return;
        }
    };


});
