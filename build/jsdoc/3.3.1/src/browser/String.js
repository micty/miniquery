
/**
* 字符串工具类
* @namespace
* @name String
*/
define('browser/String', function (require, module, exports) {

    module.exports = exports = /**@lends String*/ {
        /**
        * 用做过滤直接放到HTML里的
        * @return {String}
        */
        escapeHtml: function (string) {
            var s = String(string);

            var reg = /[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g;
            s = s.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"
            });
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\r\n/g, "<br />");
            s = s.replace(/\n/g, "<br />");
            s = s.replace(/\r/g, "<br />");

            return s;
        },

        /**
        * 用做过滤HTML标签里面的东东 比如这个例子里的<input value="XXX"> XXX就是要过滤的
        * @return {String}
        */
        escapeElementAttribute: function (string) {
            var s = String(string);
            var reg = /[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g;

            return s.replace(reg, function (r) {
                return "&#" + r.charCodeAt(0) + ";"
            });
        },

        /**
        * 用做过滤直接放到HTML里js中的
        * @return {String}
        */
        escapeScript: function (string) {
            var s = String(string);
            var reg = /[\\"']/g;

            s = s.replace(reg, function (r) {
                return "\\" + r;
            });

            s = s.replace(/%/g, "\\x25");
            s = s.replace(/\n/g, "\\n");
            s = s.replace(/\r/g, "\\r");
            s = s.replace(/\x01/g, "\\x01");

            return s;
        },

        /**
        * 用做过滤直接 Url 参数里的 比如 http://www.baidu.com/?a=XXX XXX就是要过滤的
        * @return {String}
        */
        escapeQueryString: function (string) {
            var s = String(string);
            return escape(s).replace(/\+/g, "%2B");
        },

        /**
        * 用做过滤直接放到<a href="javascript:alert('XXX')">中的XXX
        * @return {String}
        */
        escapeHrefScript: function (string) {
            var s = exports.escapeScript(string);
            s = s.replace(/%/g, "%25"); //escMiniUrl
            s = exports.escapeElementAttribute(s);
            return s;

        },

        /**
        * 用做过滤直接放到正则表达式中的
        * @return {String}
        */
        escapeRegExp: function (string) {
            var s = String(string);
            var reg = /[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g;
            return s.replace(reg, function (a, b) {
                return "\\" + a;
            });
        }
    };


});


define('String', function (require, module, exports) {
    var $ = require('$');
    var coreString = require('core/String');
    var browserString = require('browser/String');
    module.exports = $.extend({}, coreString, browserString);

});




