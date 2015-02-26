
module.exports = require('MiniQuery');

})(
    global, // 在 Node 中，全局对象是 global；其他环境是 this
    module, // Node 中独有的
    Array,
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String
    /*, $ -> undefined */
    /*, undefined -> undefined */
);

