


; (function ($, Haf, MVCHelper) {



Haf.define('Haf.app.Profile', {

    config: {

        name: null,         // profile 的名称
        appliaction: null,  //
        views: [],          //

        /**
        * profile 使用的 controller，例如
        * controllers: ['MainController'],
        * 则会实际加载 {AppName}.app.{profileName}.MainController 类文件并实例化
        */
        controllers: []
    },

    initialize: function (config) {

        this.callSuper(arguments, config);

        var app = config.application;

        var appName = app.get('name');
        var name = config.name;

        var views = this.get('views');
        MVCHelper.loadViews(appName, views, name);

        var controllers = this.get('controllers');
        MVCHelper.loadControllers(appName, controllers, name);

        //在 profile 是 active 时才初始化其中的控制器
        if (this.isActive()) {
            MVCHelper.initControllers(app, controllers, name);
        }
    },

    launch: Haf.noop,

    isActive: function () {
        return false;
    }

});


})(Haf, Haf, MVCHelper);