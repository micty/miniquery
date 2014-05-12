


; (function ($, Haf, MVCHelper) {




Haf.define('Haf.app.Controller', {

    config: {
        profile: null,     // profile name
        appliaction: null, // appliaction 实例
        views: [],         // controller 所依赖的 view

        /**
        * 控制器通过 actions 来控制界面跳转。
        * 界面完成自己的处理后，调用 Haf.action(actionName, target, ...) 触发 action，
        * Controller 中统一监听所有的 action 的，并处理。
        * 注意: actionName 是全局唯一的，如果重复定义，先前的会被覆盖掉
        *
        * 系统内部添加 action 处理的顺序依次为：
        * 1.逐个添加 Haf.application() 中声明的 controller
        * 2.逐个添加 profile 中声明的 controller
        *
        * 结构为:
        * {
        *     actionName: 'MethodName of This Controller' //方法名, this 指向 controller 实例本身
        *     actionName: function(){   //直接定义函数，this 指向 controller 实例本身
        *          //this pointer to This Controller
        *     }
        * }
        */
        actions: null
    },

    initialize: function (config) {

        this.callSuper(arguments, config);

        var app = this.get('application');

        var appName = app.get('name');
        var views = this.get('views');
        var profile = this.get('profile');
        MVCHelper.loadViews(appName, views, profile);


        MVCHelper.registerActions(this);
    }


});


})(Haf, Haf, MVCHelper);
