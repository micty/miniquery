



define('MiniQuery', function (require, module, exports) {

    var $ = require('$');

    module.exports = {

        'Array': require('Array'),
        'Boolean': require('Boolean'),
        'Date': require('Date'),
        'Function': require('Function'),
        'Math': require('Math'),
        'Object': require('Object'),
        'String': require('String'),

        use: $.use,
        require: $.require,

    };



});