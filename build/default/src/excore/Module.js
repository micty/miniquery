
/**
* 模块管理器类。
* 主要提供给页面定义页面级别的私有模块。
*/
define('ModuleA', function (require, module, exports) {

    var $ = require('$');
    var mod = new Module();


    module.exports = $.extend(Module, /**@lends Module*/ {
        /**
        * 静态方法。
        * @function
        * @memberOf Module
        */
        define: mod.define.bind(mod),

        /**
        * 静态方法。
        * @function
        * @memberOf Module
        */
        require: mod.require.bind(mod)
    });

});

