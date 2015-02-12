
/**
* 内部的模块管理器
* @inner
*/
var Module = (function () {

    var guidKey = '__guid__';
    var guid$meta = {};


    //根据工厂函数反向查找对应的模块 id。
    function findId(id$module, factory) {
        for (var id in id$module) {
            if (id$module[id].factory === factory) {
                return id;
            }
        }
    }



    /**
    * 构造器。
    */
    function Module() {

        var guid = Math.random().toString().slice(2);
        this[guidKey] = guid;

        var meta = {
            id$module: {},
        };

        guid$meta[guid] = meta;

    }


    //实例方法
    Module.prototype = {
        constructor: Module,

        /**
        * 定义指定名称的模块。
        * @param {string} id 模块的名称。
        * @param {Object|function} factory 模块的导出函数或对象。
        */
        define: function define(id, factory) {

            var guid = this[guidKey];
            var meta = guid$meta[guid];

            var id$module = meta.id$module;

            id$module[id] = {
                factory: factory,
                exports: null,      //这个值在 require 后可能会给改写
                required: false,    //指示是否已经 require 过
                exposed: false,     //默认对外不可见
            };

        },


        /**
        * 加载指定的模块。
        * @param {string} id 模块的名称。
        * @return 返回指定的模块。
        */
        require: function (id) {

            var guid = this[guidKey];
            var meta = guid$meta[guid];

            var id$module = meta.id$module;

            if (id.indexOf('/') == 0) { //以 '/' 开头，如　'/API'
                var parentId = findId(id$module, arguments.callee.caller); //如 'List'
                if (!parentId) {
                    throw new Error('require 时如果指定了以 "/" 开头的短名称，则必须用在 define 的函数体内');
                }

                id = parentId + id; //完整名称，如 'List/API'
            }


            var module = id$module[id];
            if (!module) { //不存在该模块
                return;
            }

            if (module.required) { //已经 require 过了
                return module.exports;
            }


            //首次 require

            module.required = true; //更改标志，指示已经 require 过一次

            var factory = module.factory;

            if (typeof factory != 'function') { //非工厂函数，则直接导出
                module.exports = factory;
                return factory;
            }

            //factory 是个工厂函数
            var require = arguments.callee.bind(this); //引用自身，并且作为静态方法调用
            var exports = {};
            var mod = {
                id: id,
                exports: exports,
            };

            exports = factory(require, mod, exports);
            if (exports === undefined) {    //没有通过 return 来返回值，
                exports = mod.exports;      //则要导出的值只能在 mod.exports 里
            }

            module.exports = exports;
            return exports;

        },

        
        /**
        * 设置或获取对外暴露的模块。
        * 通过此方法，可以控制指定的模块是否可以通过 MiniQuery.require(id) 来加载到。
        * @param {string|Object} id 模块的名称。
            当指定为一个 {} 时，则表示批量设置。
            当指定为一个字符串时，则单个设置。
        * @param {boolean} [exposed] 模块是否对外暴露。
            当参数 id 为字符串时，且不指定该参数时，表示获取操作，
            即获取指定 id 的模块是否对外暴露。
        * @return {boolean}
        */
        expose: function (id, exposed) {

            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;

            //内部方法: get 操作
            function get(id) {
                var module = id$module[id];
                if (!module) {
                    return;
                }

                return module.exposed;
            }

            //内部方法: set 操作
            function set(id, exposed) {
                var module = id$module[id];
                if (module) {
                    module.exposed = !!exposed;
                }
            }

            //set 操作
            if (typeof id == 'object') { // expose({ })，批量 set
                var id$exposed = id;
                for (var id in id$exposed) {
                    var exposed = id$exposed[id];
                    set(id, exposed);
                }
                return;
            }

            if (arguments.length == 2) { // expose('', true|false)，单个 set
                set(id, exposed);
                return;
            }

            //get 操作
            return get(id);
        },

        /**
        * 销毁本实例。
        */
        destroy: function () {
            var guid = this[guidKey];
            delete this[guidKey];
            delete guid$meta[guid];
        },
    };



    return Module;


})();

//提供快捷方式
var mod = new Module();
var define = mod.define.bind(mod);
var require = mod.require.bind(mod);
var expose = mod.expose.bind(mod);
