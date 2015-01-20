



define('MiniQuery', function (require, module, exports) {

    var $ = require('$');

    module.exports = exports = {

        'Array': require('Array'),
        'Boolean': require('Boolean'),
        'Date': require('Date'),
        'Function': require('Function'),
        'Math': require('Math'),
        'Object': require('Object'),
        'String': require('String'),

        'Event': require('Event'),
        'Mapper': require('Mapper'),
        'Url': require('Url'),

        require: $.require,

    };



});