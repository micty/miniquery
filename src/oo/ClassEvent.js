//

/**
* 针对创建类的事件通知
* @namespace
*/
var ClassEvent = (function ($, ClassManager) {

    var guid = 'ClassEvent.eventTarget.' + $.String.random();

    //为了提高事件绑定速度，共用一个事件目标对象。
    var eventTarget = {
        toString: function () {
            return guid;
        }
    };


    function ondefine(className, fn) {

        var eventName = 'defineClass:';

        var type = typeof className;
        if (type == 'function') { //此时为 ondefine(fn)
            fn = className;
            className = undefined;
        }
        else if (type == 'string') {
            eventName += className;
        }
        else {
            throw Haf.error('无法识别参数 className 的类型');
        }

        $.Event.bind(eventTarget, eventName, fn);


        if (className) { //此时为 ondefine(className, fn)
            var F = ClassManager.getClass(className, false); //这里不要自动去加载类

            if (F) { //已经定义了该类，立即触发
                var data = ClassManager.getData(className);
                fn(data, className); //这里不用 trigger(className)，因为这样会把别的 handler 也触发

                trigger(); //触发总事件
            }
        }

    }

    //仅供 define 方法内部调用
    function trigger(className) {

        var args;

        if (className) {

            var F = ClassManager.getClass(className, false);
            if (!F) {
                throw Haf.error('不存在 className 为 {0} 的类', className);
            }

            var data = ClassManager.getData(className);
            args = [data, className];
            $.Event.trigger(eventTarget, 'defineClass:' + className, args);
        }

        //最后触发总事件
        $.Event.trigger(eventTarget, 'defineClass:', args);

    }



    function ondefinextype(xtype, fn) {

        var eventName = 'defineXtype:';

        var type = typeof xtype;
        if (type == 'function') { //此时为 ondefinextype( fn )
            fn = xtype;
            xtype = undefined;
        }
        else if (type == 'string') {
            eventName += xtype;
        }
        else {
            throw Haf.error('无法识别参数 xtype 的类型');
        }

        $.Event.bind(eventTarget, eventName, fn);

        if (xtype) { //此时为 ondefinextype(xtype, fn)

            var className = ClassManager.getClassNameByXtype(xtype);
            if (className) { //已经定义了该 xtype，立即触发
                var data = ClassManager.getData(className);
                fn(data, className); //这里不用 triggerXtype(xtype)，因为这样会把别的 handler 也触发
                triggerXtype(); //触发总事件
            }
        }
    }

    //仅供 define 方法内部调用
    function triggerXtype(xtype) {

        var args;

        if (xtype) {

            var className = ClassManager.getClassNameByXtype(xtype);
            if (!className) {
                throw Haf.error('不在存在 xtype 为 {0} 的类', xtype);
            }

            var data = ClassManager.getData(className);
            args = [data, className];

            $.Event.trigger(eventTarget, 'defineXtype:' + xtype, args);
        }

        //最后触发总事件
        $.Event.trigger(eventTarget, 'defineXtype:', args);

    }

    return {
        trigger: trigger,
        ondefine: ondefine,
        triggerXtype: triggerXtype,
        ondefinextype: ondefinextype
    };




})(Haf, ClassManager);