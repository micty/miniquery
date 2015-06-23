
/**
* 模块管理器类
* @class
*/
var Module = (function () {

    var guidKey = '__guid__';
    var guid$meta = {};


    function getType(obj) {
        if (!obj) { //NaN|false|null|undefined|0|''
            return obj;
        }

        var type = typeof obj;
        if (type == 'string' || type == 'number' || type == 'boolean') {
            return obj;
        }

        return ({}).toString.call(obj);
    }


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
            'repeated': config.repeated, //是否允许重复定义
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
            var repeated = meta.repeated;

            if (!repeated && id$module[id]) {
                throw new Error('配置设定了不允许定义重复的模块: 已存在名为 "' + id + '" 的模块');
            }


            id$module[id] = {
                'factory': factory, //工厂函数或导出对象
                'exports': null,    //这个值在 require 后可能会给改写
                'required': false,  //指示是否已经 require 过
                'exposed': false,   //默认对外不可见
                'module': null,     //用于检测在 define 中加载下级模块，即 require(module, id) 时用到
                'count': 0,         // require 的次数统计
                'mod': null,        //用来存放 require 时产生的中间结果
            };

            return this;
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


            // 重载 require(module, id);
            if (typeof id == 'object') { 
                module = id; //此时 module 相对于 id 为父模块

                if (!module) {
                    throw new Error('当作为 require(module, id) 调用时，第一个参数 module 不能为空。');
                }

                var parentId = module.id;
                var parentModule = id$module[parentId];
                if (!parentModule) {
                    throw new Error('不存在 module.id 为 ' + parentId + ' 的父模块。');
                }

                //防止用户手动构造 module 对象以达到跨界调用的目的。
                //传进来的 module 必须是 define 函数中的 factory 函数中的第二个参数 module 原始对象。
                if (module !== parentModule.module) { 
                    throw new Error('当作为 require(module, id) 调用时，第一个参数 module 必须为 define 中的工厂函数第二个原始参数 module 对象。');
                }

                id = arguments[1];
            }

            if (typeof id != 'string') {
                throw new Error('参数 id 的类型必须为 string');
            }

            var crossover = meta.crossover;
            var seperator = meta.seperator;

            //如 'List/API' 或 '/List/API'
            if (!crossover && id.indexOf(seperator) >= 0) { 
                throw new Error('配置已经设定了不允许跨级加载模块。');
            }

            if (module) {
                id = [parentId, id].join(seperator);
            }


            module = id$module[id];
            if (!module) { //不存在该模块
                return;
            }

            module.count++;

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
            var mod = module.mod = { //传递一些额外的信息给 factory 函数，可能会用得到。
                'id': id,
                'exports': exports,
                'parent': parentModule ? parentModule.mod : null,
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
        * 获取所有的模块描述信息。
        * @return {Object} 返回已经定义的模块描述信息对象。
        */
        modules: function () {
            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;
            var seperator = meta.seperator;

            var obj = {};

            for (var id in id$module) {
                var module = id$module[id];

                var ids = id.split(seperator).slice(0, -1);
                var parentId = ids.length > 0 ? ids.join(seperator) : null;

                obj[id] = {
                    'id': id,
                    'required': module.required,
                    'exposed': module.exposed,
                    'count': module.count,
                    'factory': getType(module.factory),
                    'exports': getType(module.exports),
                    'parentId': parentId,
                };
            }

            return obj;
        },

        /**
        * 获取所有的模块树形结构描述对象。
        * @param [leafValue=""] 叶子结点所需要表示成的值。 默认为空字符串。
        * @return {Object} 返回已经定义的模块的树形结构。
        */
        tree: function (leafValue) {

            if (arguments.length == 0) {
                leafValue = '';
            }

            var guid = this[guidKey];
            var meta = guid$meta[guid];
            var id$module = meta.id$module;
            var seperator = meta.seperator;

            var tree = {};

            for (var id in id$module) {

                var ids = id.split(seperator);
                var len = ids.length;

                if (len == 1 && !(id in tree)) { //不含有 seperator，顶级模块
                    tree[id] = leafValue;
                    continue;
                }

                var node = tree;

                for (var i = 0; i < len; i++) {

                    var key = ids[i];

                    var obj = node[key];
                    if (!obj) {
                        if (i == len - 1) { //叶子结点
                            node[key] = leafValue;
                        }
                        else {
                            obj = node[key] = {};
                        }
                    }

                    node = obj;
                }
            }


            return tree;
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
    repeated: true,
});

//提供快捷方式
var define = mod.define.bind(mod);
var require = mod.require.bind(mod);
var expose = mod.expose.bind(mod);
