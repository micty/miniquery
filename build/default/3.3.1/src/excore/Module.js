
/**
* 对外提供的模块管理器类。
* 主要提供给上层框架/业务进一步定义属于自己的命名空间的模块。
*/
define('Module', function (require, module, exports) {

    var $ = require('$');
    var mod = new Module({
        seperator: '/',
        crossover: true,
        shortcut: true,
    });


    $.extend(Module, /**@lends Module*/ {

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


    module.exports = exports = Module;

});

