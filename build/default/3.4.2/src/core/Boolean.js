
/**
* Boolean 工具类
* @namespace
* @name Boolean
*/
define('Boolean', function (require, module, exports) {

    module.exports = exports = /**@lends Boolean */ {

        /**
        * 解析指定的参数为 bool 值。
        * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 false；
        * 其它的转成 true
        * @param {Object} arg 要进行进换的值，可以是任何类型。
        * @return {boolean} 返回一个 bool 值。
        * @example
            $Boolean.parse(null); //false;
            $Boolean.parse('null'); //false;
            $Boolean.parse(undefined); //false;
            $Boolean.parse('undefined'); //false;
            $Boolean.parse(0); //false;
            $Boolean.parse('0'); //false;
            $Boolean.parse(NaN); //false;
            $Boolean.parse('NaN'); //false;
            $Boolean.parse(false); //false;
            $Boolean.parse('false'); //false;
            $Boolean.parse(''); //false;
            $Boolean.parse(true); //true;
            $Boolean.parse({}); //true;
        */
        parse: function (arg) {
            if (!arg) {// null、undefined、0、NaN、false、''
                return false;
            }

            if (typeof arg == 'string' || arg instanceof String) {
                var reg = /^(false|null|undefined|0|NaN)$/g;
                return !reg.test(arg);
            }

            return true;
        },

        /**
        * 解析指定的参数为 int 值：0 或 1。
        * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 0；
        * 其它的转成 1
        * @param {Object} 要进行转换的值，可以是任何类型。
        * @return {int} 返回一个整型值 0 或 1。
        * @example
            $Boolean.toInt(null); //0;
            $Boolean.toInt('null'); //0;
            $Boolean.toInt(undefined); //0;
            $Boolean.toInt('undefined'); //0;
            $Boolean.toInt(0); //0;
            $Boolean.toInt('0'); //0;
            $Boolean.toInt(NaN); //0;
            $Boolean.toInt('NaN'); //0;
            $Boolean.toInt(false); //0;
            $Boolean.toInt('false'); //0;
            $Boolean.toInt(''); //0;
            $Boolean.toInt(true); //1;
            $Boolean.toInt({}); //1;
        */
        toInt: function (arg) {
            return exports.parse(arg) ? 1 : 0;
        },

        /**
        * 反转一个 boolean 值，即 true 变成 false；false 变成 true。
        * @param {Object} 要进行反转的值，可以是任何类型。
        * @return {int} 返回一个 bool 值。
        * @example
            $Boolean.reverse(null); //true;
            $Boolean.reverse('null'); //true;
            $Boolean.reverse(undefined); //true;
            $Boolean.reverse('undefined'); //true;
            $Boolean.reverse(0); //true;
            $Boolean.reverse('0'); //true;
            $Boolean.reverse(NaN); //true;
            $Boolean.reverse('NaN'); //true;
            $Boolean.reverse(false); //true;
            $Boolean.reverse('false'); //true;
            $Boolean.reverse(''); //true;
            $Boolean.reverse(true); //false;
            $Boolean.reverse({}); //false;
        */
        reverse: function (arg) {
            return !exports.parse(arg);
        },

        /**
        * 产生一个随机布尔值。
        * @return {boolean} 返回一个随机的 true 或 false。
        * @example
            $Boolean.random();
        */
        random: function () {
            return !!Math.floor(Math.random() * 2); //产生随机数 0 或 1
        }
    };

});

