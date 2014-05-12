



var MVCHelper = (function ($, Haf, Logger, Loader) {

    /**
    * 结构为：
    * {
    *      {actionName}:{
    *          fn :Function,
    *          scope: ThisObject
    *      }
    * }
    */
    var name$action = {};


    function load(appName, type, list, profile) {

        if (!list || !type || !appName) {
            return;
        }

        var prefix = appName + '.' + type + '.'; //如 DemoApp.view.

        if (profile) {
            prefix += profile.toLowerCase() + '.'; //如 DemoApp.view.phone.
        }

        var classNames = $.Array.map(list, function (item, index) {
            return prefix + item;  //如 DemoApp.view.phone.MainView
        });

        Loader.requires(classNames);
    }


    // MVCHelper = 
    return {
        

        loadViews: function (appName, views, profile) {
            load(appName, 'view', views, profile);
        },

        loadControllers: function (appName, controllers, profile) {
            load(appName, 'controller', controllers, profile);
        },

        loadProfiles: function (appName, profiles, profile) {
            load(appName, 'profile', profiles, profile);
        },


        initProfiles: function (application, list) {

            if (!list || !application) {
                return;
            }

            var appName = application.get('name');
            var prefix = appName + '.profile.';

            var profile;

            $.Array.each(list, function (item, index) {

                var className = prefix + item;

                profile = Haf.create(className, {
                    name: item,
                    application: application
                });

                if (profile.isActive()) {
                    return false; //break;
                }
                else {
                    profile = null;
                }

            });

            return profile;

        },

        /**
        * 初始化 controller，同时会将 controller 中定义的 action 登记在册
        *
        * @param appName
        * @param list
        * @return {*}
        */
        initControllers: function (application, list, profile) {
            if (!list || !application) {
                return;
            }

            var appName = application.get('name');
            var prefix = appName + '.controller.';

            if (profile) {
                prefix += profile.toLowerCase() + '.'
            }

            return $.Array.map(list, function (item, index) {

                var className = prefix + item; // controller 的完整类名

                return Haf.create(className, {

                    application: application,
                    profile: profile
                });
            });

        },


        registerActions: function (controller) {
            
            var actions = controller.get('actions');

            $.Object.each(actions, function (key, value) {

                if (name$action[key]) {
                    throw Haf.error('已存在名为 {0} 的 action', key);
                }

                var type = typeof value;

                var fn =
                    type == 'function' ? value : 
                    type == 'string' ? controller[value] :
                    null;

                if (typeof fn != 'function') {
                    throw Haf.error('action 定义错误');
                }

                name$action[key] = {
                    fn: fn,
                    scope: controller
                };

            });
        },


        fireAction: function (actionName, arg1 /*,...*/ ) {
            
            var action = name$action[actionName];

            if (!action) {
                throw Haf.error('不存在名为 {0} 的 action', actionName);
            }

            var args = Array.prototype.slice.call(arguments, 1);
            action.fn.apply(action.scope, args);
        }
    };


})(Haf, Haf, Logger, Loader);
