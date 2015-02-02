
/**
* 对外提供模块管理器。
* 主要提供给页面定义页面级别的私有模块。
*/
define('Module', function (require, module, exports) {


    var id$module = {};
    var id$factory = {}; //辅助用的，针对页面级别的多级目录的以 '/' 开头的模块 id


    //根据工厂函数反向查找对应的模块 id。
    function getId(factory) {
        var $Object = require('Object');

        return $Object.findKey(id$factory, function (key, value) {
            return value === factory;
        });
    }


    module.exports = {

        /**
        * 定义指定名称的模块。
        * @param {string} id 模块的名称。
        * @param {Object|function} factory 模块的导出函数或对象。
        */
        define: function define(id, factory) {

            id$module[id] = {
                required: false,
                exports: factory,   //这个值在 require 后可能会给改写
                exposed: false      //默认对外不可见
            };

            id$factory[id] = factory;
        },


        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @return 返回指定的模块。
        */
        require: function (id) {

            if (id.indexOf('/') == 0) { //以 '/' 开头，如　'/API'
                var parentId = getId(arguments.callee.caller); //如 'List'
                if (!parentId) {
                    throw new Error('require 时如果指定了以 "/" 开头的短名称，则必须用在 define 的函数体内');
                }

                id = parentId + id; //完整名称，如 'List/API'
            }


            var module = id$module[id];
            if (!module) { //不存在该模块
                return;
            }

            var require = arguments.callee; //引用自身
            var exports = module.exports;

            if (module.required) { //已经 require 过了
                return exports;
            }

            //首次 require
            if (typeof exports == 'function') {

                var fn = exports;
                exports = {};

                var mod = {
                    id: id,
                    exports: exports,
                };

                var value = fn(require, mod, exports);

                //没有通过 return 来返回值，则要导出的值在 mod.exports 里
                exports = value === undefined ? mod.exports : value;
                module.exports = exports;
            }

            module.required = true; //指示已经 require 过一次

            return exports;

        },
    };

});

