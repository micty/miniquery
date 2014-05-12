

//
; (function (global, Haf, $, ClassManager, ClassEvent) {



/**
* HAF: Hybrid Application Framework
* 混合应用框架，一个基于手机端 App 开发的纯 JavaScript 框架，提供一整套功能丰富的 API。
* 
*/

//创建快捷方式，并且把所有要暴露出去的集中这里。
$.Object.extend(Haf, { /**@lends Haf*/

    define: Class.define,
    create: Class.create,

    //ondefine: ClassEvent.ondefine,
    //ondefinextype: ClassEvent.ondefinextype,

    error: Exception.error,
    load: Loader.load,

    Device: Device,
    Loader: Loader,
    Logger: Logger,

    Timer: Timer,
    
    getClassTree: ClassManager.getClassTree,
    getXtypeTree: ClassManager.getXtypeTree,

    /**
    * 一个可复用的空函数和透传函数。
    */
    noop: function (value) {
        return value;
    }

    
});




})(global, Haf, Haf, ClassManager, ClassEvent);

