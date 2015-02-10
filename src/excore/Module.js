
/**
* 模块管理器类。
* 主要提供给页面定义页面级别的私有模块。
*/
define('Module', function (require, module, exports) {

    var $ = require('$');
    var $String = require('String');
    var $Object = require('Object');
    var Mapper = require('Mapper');

    var guidKey = Mapper.getGuidKey();
    var mapper = new Mapper();



    //根据工厂函数反向查找对应的模块 id。
    function getId(id$module, factory) {

        return $Object.findKey(id$module, function (id, module) {
            return module.factory === factory;
        });
    }


    /**
    * 构造器。
    */
    function Module() {

        this[guidKey] = $String.random();

        var meta = {
            id$module: {},
        };

        mapper.set(this, meta);

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

            var meta = mapper.get(this);
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

            var meta = mapper.get(this);
            var id$module = meta.id$module;

            if (id.indexOf('/') == 0) { //以 '/' 开头，如　'/API'
                var parentId = getId(id$module, arguments.callee.caller); //如 'List'
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
    };


    var mod = new Module(); //默认的、静态的

    module.exports = $.extend(Module, { //提供静态的调用方式
        'define': mod.define.bind(mod),
        'require': mod.require.bind(mod),
    });



});

