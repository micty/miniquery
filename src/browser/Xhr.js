
/**
* XMLHttpRequest 类工具
* @namespace
* @name Xhr
*/
define('Xhr', function (require, module, exports) {



    module.exports = exports = /**@lends Xhr*/ {

        /**
        * 跨浏览器创建一个 XMLHttpRequest 对象。
        * 由于内存原因，不建议重用创建出来的 xhr 对象。
        */
        create: function () {

            //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
            var fn = window.XMLHttpRequest ? function () { //标准方法

                return new XMLHttpRequest();

            } : window.ActiveXObject ? function () { //IE

                var cache = arguments.callee;
                var key = 'version';

                if (!cache[key]) { //首次创建

                    var versions = [
                        'MSXML2.XMLHttp.6.0',
                        'MSXML2.XMLHttp.3.0',
                        'MSXML2.XMLHttp'
                    ];

                    for (var i = 0, len = versions.length; i < len; i++) {
                        try {
                            var xhr = new ActiveXObject(versions[i]);
                            cache[key] = versions[i];
                            return xhr;
                        }
                        catch (ex) { //跳过

                        }
                    }
                }

                return new ActiveXObject(cache[key]);

            } : function () {
                throw new Error('没有可用的 XHR 对象');
            };


            exports.create = fn;

            return fn();
        }
    };


});
