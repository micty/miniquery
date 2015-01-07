

/**
* 插件类工具
* @namespace
*/
define('Plugin', function (require, module, exports) {



    module.exports = exports = { /**@lends MiniQuery.Plugin*/

        /**
        * 判断浏览器是否包含指定名称的插件。
        * @param {string} name 要检测的插件的名称。
        * @return {boolean} 如果浏览器已安装该插件，则返回 true；否则返回 false。
        */
        has: function (name) {

            var has = false;

            name = name.toLowerCase();
            var plugins = navigator.plugins;

            for (var i = 0, len = plugins.length; i < len; i++) {

                if (plugins[i].name.toLowerCase().indexOf(name) >= 0) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                try {
                    new ActiveXObject(name);
                    has = true;
                }
                catch (ex) {
                    has = false;
                }
            }

            return has;
        },

        /**
        * 判断浏览器是否包 Flash 插件。
        * @return {boolean} 如果浏览器已安装该插件，则返回 true；否则返回 false。
        */
        hasFlash: function () {
            return exports.has('Flash') || exports.has('ShockwaveFlash.ShockwaveFlash');
        },

        /**
        * 判断浏览器是否包 QuickTime 插件。
        * @return {boolean} 如果浏览器已安装该插件，则返回 true；否则返回 false。
        */
        hasQuickTime: function () {
            return exports.has('QuickTime') || exports.has('QuickTime.QuickTime');

        }

    };


});

