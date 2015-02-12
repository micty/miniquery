
/**
* 模块管理器类。
* 主要提供给页面定义页面级别的私有模块。
* @class
* @name Module
*/
define('Module', function (require, module, exports) {

    var $ = require('$');

    var mod = new Module(); //默认的、静态的

    //提供静态的调用方式
    module.exports = $.extend(Module, { /**@lends Module*/
        /**@static*/
        'define': mod.define.bind(mod),
        'require': mod.require.bind(mod),
    });

});

