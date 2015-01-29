
/**
* 字符串工具类
* @class
*/
define('browser/String', function (require, module, exports) {

    var $ = require('$');


    module.exports = exports = {
        /**
        * 用做过滤直接放到HTML里的
        * @return {String}
        */
        escapeHtml: function (string) {
            string = String(string);

            var reg = /[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g;
            string = string.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"

            });

            string = string.replace(/ /g, "&nbsp;");
            string = string.replace(/\r\n/g, "<br />");
            string = string.replace(/\n/g, "<br />");
            string = string.replace(/\r/g, "<br />");

            return string;

        },

        /**
        * 用做过滤HTML标签里面的东东 比如这个例子里的<input value="XXX"> XXX就是要过滤的
        * @return {String}
        */
        escapeElementAttribute: function (string) {
            string = String(string);
            var reg = /[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g;

            return string.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"
            });

        },

        /**
        * 用做过滤直接放到HTML里js中的
        * @return {String}
        */
        escapeScript: function (string) {
            string = String(string);
            var reg = /[\\"']/g;

            string = string.replace(reg, function (r) {
                return "\\" + r;
            })

            string = string.replace(/%/g, "\\x25");
            string = string.replace(/\n/g, "\\n");
            string = string.replace(/\r/g, "\\r");
            string = string.replace(/\x01/g, "\\x01");

            return string;
        },

        /**
        * 用做过滤直接 Url 参数里的 比如 http://www.baidu.com/?a=XXX XXX就是要过滤的
        * @return {String}
        */
        escapeQueryString: function (string) {
            string = String(string);
            return escape(string).replace(/\+/g, "%2B");
        },

        /**
        * 用做过滤直接放到<a href="javascript:alert('XXX')">中的XXX
        * @return {String}
        */
        escapeHrefScript: function (string) {
            string = exports.escapeScript(string);
            string = string.replace(/%/g, "%25"); //escMiniUrl
            string = exports.escapeElementAttribute(string);
            return string;

        },

        /**
        * 用做过滤直接放到正则表达式中的
        * @return {String}
        */
        escapeRegExp: function (string) {
            string = String(string);

            var reg = /[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g;

            return string.replace(reg, function (a, b) {
                return "\\" + a;
            });
        }
    };


});


define('String', function (require, module, exports) {
    var $ = require('$');
    var coreString = require('core/String');
    var browserString = require('browser/String');
    module.exports = $.extend(coreString, browserString); //这里要覆盖回去，因为 $String.prototype 的原因

});




