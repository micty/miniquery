
/**
* MiniQuery
* @namespace
* @name MiniQuery
*/
define('MiniQuery', function (require, module, exports) {

    var $ = require('$');

    module.exports = exports = { /**@lends MiniQuery*/

        'Array': require('Array'),
        'Boolean': require('Boolean'),
        'Date': require('Date'),
        'Math': require('Math'),
        'Object': require('Object'),
        'String': require('String'),

        /**
        * 加载内部公开的模块。
        * @function
        * @param {string} id 模块的名称(id)
        * @return {Object} 返回模块的导出对象。
        * @example
        *   var Mapper = MiniQuery.require('Mapper');    
        */
        require: $.require,

        /**
        * 以安全的方式给 MiniQuery 使用一个新的命名空间。
        * 比如 MiniQuery.use('$')，则 global.$ 基本上等同于 global.MiniQuery；
        * 当 global 中未存在指定的命名空间或参数中指定了要全量覆盖时，则使用全量覆盖的方式，
        * 该方式会覆盖原来的命名空间，可能会造成成一些错误，不推荐使用；
        * 当 global 中已存在指定的命名空间时，则只拷贝不冲突的部分到该命名空间，
        * 该方式是最安全的方式，也是默认和推荐的方式。
        */
        use: function (namespace, overwrite) {

            if (!(namespace in global) || overwrite) { //未存在或明确指定了覆盖
                global[namespace] = exports; //全量覆盖
                return;
            }

            //已经存在，则拷贝不冲突的成员部分
            var obj = global[namespace];

            for (var key in exports) {

                if (!(key in obj)) { //只拷贝不冲突的部分
                    obj[key] = exports[key];
                }
            }

        },

    };
});