


/**
* 加载器
* @namespace
*/
var Loader = (function ($, Logger, App) {



    /**
    * 动态加载一个 js 文件，js文件的相对路径是 App 的根目录
    * @param jsFile
    */
    function load(jsFile) {

        Logger.debug('加载文件: {0}', jsFile);
        App.loadJS(jsFile); // native的加载方法
    }


    /**
    * 动态加载一个 className 指定的 js 文件
    * MyApp.view.Main==>app/view/Main.js
    * @param className
    */
    function loadClass(className) {

        var F = $.Object.namespace(global, className); //get
        if (F) { //已存在该类
            return;
        }

        var paths = className.split('.');
        paths[0] = 'app';

        var jsFile = paths.join('/') + '.js';

        App.loadJS(jsFile);
    }


    /**
    * 动态加载一个或多个class
    * @param className
    */
    function requires(className) {

        if (!className) {
            return;
        }

        if ($.Object.isArray(className)) {

            $.Array.each(className, function (item, index) {
                Logger.debug('require class: ' +  item);
                loadClass(item);
            });
        }
        else {
            loadClass(className);
        }
    }

    //Loader = 
    return {

        load: load,
        loadClass: loadClass,
        requires: requires
    };

})(Haf, Logger, Hae.App);
