



var MiniQuery = {

    'Array': require('Array'),
    'Boolean': require('Boolean'),
    'Date': require('Date'),
    'Function': require('Function'),
    'Math': require('Math'),
    'Object': require('Object'),
    'String': require('String'),

    require: function (id) {
       return Module.expose(id) ? require(id) : null;
    },

};
