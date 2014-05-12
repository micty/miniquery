


; (function ($, Haf, Logger, MVCHelper) {




Haf.define('Haf.app.Application', {

    config: {

        /**
        * 应用的名称，应用内的类的包名一般都用 name 打头
        */
        name: '',

        /**
        * 应用内使用的 view，写在这里表示需要预先加载类文件
        */
        views: [],

        /**
        * 应用内使用的 controller，写在这里表示需要预先加载类文件，并实例化
        */
        controllers: [],

        /**
        * 应用内使用的 profile，写在这里表示需要预先加载类文件，并实例化
        */
        profiles: [],

        /**
        * 应用初始化好后的调用的方法，在初始化时，如果有 profile，也会执行 profile 的 launch 方法
        */
        launch: Haf.noop
    },

    initialize: function (config) {

        this.callSuper(arguments, config);

        var appName = this.get('name');
        var views = this.get('views');
        var controllers = this.get('controllers');
        var profiles = this.get('profiles');

        MVCHelper.loadViews(appName, views);
        MVCHelper.loadControllers(appName, controllers);
        MVCHelper.loadProfiles(appName, profiles);

        //创建所需要的 controller
        MVCHelper.initControllers(this, controllers);

        // currentProfile 保留当前的 profile
        var currentProfile = MVCHelper.initProfiles(this, profiles);
        if (!currentProfile) {
            Logger.info('no profile is active!');
        }
        else {
            currentProfile.launch();
        }

        this._currentProfile = currentProfile;
    }

});



})(Haf, Haf, Logger, MVCHelper);

