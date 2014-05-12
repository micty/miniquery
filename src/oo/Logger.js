


/**
* 日志类
* @namespace
*/
var Logger = (function ($, console) {

    if (!console) {
        console = {
            log: function (s) {

            }
        };
    }


    var DEBUG = 1,
        INFO = 2,
        ERROR = 4,
        logLevel = 1;

    /**
    * @inner
    */
    function log($arguments) {

        var formater = $arguments[0];
        var args = Array.prototype.slice.call($arguments, 1);
        var msg = $.String.format(formater, args);

        console.log(msg);
    }

    return {

        /**
        * debug用于记录最详细的日志，主要用于开发期调试，是给开发人员看的。一般在产品发布时，不会输出
        * 调用前，需要首先调用isDebug判断一下
        * @param msg
        */
        debug: function (msg) {
            if (logLevel <= DEBUG) {
                log(arguments);
            }
        },

        /**
        * info用于记录程序逻辑的大致走向，带有一定的业务含义，产品发布后，需要输出
        * @param msg
        */
        info: function (msg) {
            if (logLevel <= INFO) {
                log(arguments);
            }
        },

        /**
        * error记录发生异常时的信息，必须记录
        * @param msg
        */
        error: function (msg) {

            log(arguments);
        },


        /**
        * 设置日志级别
        * @param level
        * 1:输出debug,info,error三个方法的日志
        * 2:输入info,error的日志
        * 4:只输入error日志
        */
        setLevel: function (level) {
            logLevel = level;
        },

        /**
        * 是否需要输出debug日志，增加此方法的目的是减少debug(msg)中msg的计算
        * @return {Boolean}
        */
        isDebug: function () {
            return logLevel <= DEBUG;
        }
    };


})(Haf, global.console);