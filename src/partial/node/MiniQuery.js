
/**
* MiniQuery
* @namespace
* @name MiniQuery
*/
define('MiniQuery', function (require, module, exports) {

    var $ = require('$');

    module.exports = exports =/**@lends MiniQuery*/ {

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

    };
});