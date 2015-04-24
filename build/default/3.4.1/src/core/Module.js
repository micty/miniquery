
/**
* 模块管理器类
* @class
*/
var Module = (function () {

    var guidKey = '__guid__';
    var guid$meta = {};



    /**
    * 构造器。
    * @inner
    */
    function Module(config) {

        var guid = Math.random().toString().slice(2);
        this[guidKey] = guid;

        config = config || {
            seperator: '/',
        };

        var meta = {
            'id$module': {},
            'seperator': config.seperator,
            'crossover': config.crossover,
        };

        guid$meta[guid] = meta;

    }

    //实例方法
    Module.prototype = /**@lends Module#*/ {
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
                module: null,       //用于检测在 define 中加载下级模块，即 require(module, id) 时用到
            };


        },

        /**
        * 加载指定的模块。
        * 已重载 require(moudle, id)，用于加载 module 的直接下级子模块。
        * @param {string} id 模块的名称。
        * @return 返回指定的模块。
        */
        require: function (id) {

            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;

            var module = null;

            if (typeof id == 'object') { // 重载 require(module, id)
                module = id; //此时 module 相对于 id 为父模块

                if (!module) {
                    throw new Error('当作为 require(module, id) 调用时，第一个参数 module 不能为空。');
                }

                var parentId = module.id;
                var parentMod = id$module[parentId];
                if (!parentMod) {
                    throw new Error('不存在 module.id 为 ' + parentId + ' 的父模块。');
                }

                //防止用户手动构造 module 对象以达到跨界调用的目的。
                //传进来的 module 必须是 define 函数中的 factory 函数中的第二个参数 module 原始对象。
                if (module !== parentMod.module) { 
                    throw new Error('当作为 require(module, id) 调用时，第一个参数 module 必须为 define 中的工厂函数第二个原始参数 module 对象。');
                }

                id = arguments[1];
            }


            var crossover = meta.crossover;
            var seperator = meta.seperator;

            //如 'List/API' 或 '/List/API'
            if (!crossover && id.lastIndexOf(seperator) > 0) { 
                throw new Error('配置已经设定了不允许跨级加载模块。');
            }

            if (module) {
                id = [parentId, id].join(seperator);
            }


            module = id$module[id];
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

            module.module = mod; //保存到元数据中

            exports = factory(require, mod, exports);
            if (exports === undefined) {    //没有通过 return 来返回值，
                exports = mod.exports;      //则要导出的值只能在 mod.exports 里
            }

            module.exports = exports;
            return exports;

        },

        
        /**
        * 设置或获取对外暴露的模块。
        * 已重载 get(id)、set(id, exposed) 三种方法。
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
            if (typeof id == 'object') { //重载 expose({...}); 批量 set
                var id$exposed = id;
                for (var id in id$exposed) {
                    var exposed = id$exposed[id];
                    set(id, exposed);
                }
                return;
            }

            var len = arguments.length;

            if (len == 2) { //重载 expose('', true|false); 单个 set
                set(id, exposed);
                return;
            }

            if (len == 1) { //重载 expose(id);
                return get(id); 
            }

            
        },

        /**
        * 获取所有设置为暴露的模块 id 列表。
        * @return {Array} 返回设置为暴露的模块 id 数组。
        */
        exposes: function () {

            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;

            var a = [];

            for (var id in id$module) {
                var module = id$module[id];
                if (module.exposed) {
                    a.push(id);
                }
            }

            return a;

        },

        /**
        * 获取所有的模块 id 列表。
        * @return {Array} 返回已经定义的模块 id 数组。
        */
        modules: function () {
            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;

            return Object.keys(id$module);
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

//内部模块管理器
var mod = new Module({
    seperator: '/',
    crossover: true,
});

//提供快捷方式
var define = mod.define.bind(mod);
var require = mod.require.bind(mod);
var expose = mod.expose.bind(mod);
