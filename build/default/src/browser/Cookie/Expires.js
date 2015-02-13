
/**
* Cookie/Expires 工具
* @namespace
*/
define('Cookie/Expires', function (require, module, exports) {

    var $Date = require('Date');

    var reg = /^\d+([y|M|w|d|h|m|s]|ms)$/; //这里不要使用 /g

    var fns = {
        y: 'Year',
        M: 'Month',
        w: 'Week',
        d: 'Day',
        h: 'Hour',
        m: 'Minute',
        s: 'Second',
        ms: 'Millisecond'
    };

    module.exports = exports = { 

        /**
        * 解析字符串描述的 expires 字段
        * @inner
        */
        parse: function (s) {

            var now = new Date();

            if (typeof s == 'number') {
                return $Date.addMilliseconds(now, s);
            }

            if (reg.test(s)) {
                var value = parseInt(s);
                var unit = s.replace(/^\d+/g, '');
                return $Date['add' + fns[unit] + 's'](now, value);
            }

            return $Date.parse(s);
        }
    };



});



