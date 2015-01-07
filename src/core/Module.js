
/**
* 内部的模块管理器
*/
var Module = (function () {

    var id$module = {};

    /**
    * 定义指定名称的模块。
    * @param {string} id 模块的名称。
    * @param {Object|function} exports 模块的导出函数。
    */
    function define(id, exports) {
        id$module[id] = {
            required: false,
            exports: exports,
            exposed: false      //默认对外不可见
        };
    }

    /**
    * 加载指定的模块。
    * @param {string} id 模块的名称。
    * @return 返回指定的模块。
    */
    function require(id) {

        var module = id$module[id];
        if (!module) { //不存在该模块
            return;
        }

        var exports = module.exports;

        if (module.required) { //已经 require 过了
            return exports;
        }

        //首次 require
        if (typeof exports == 'function') {

            var fn = exports;
            exports = {};

            var mod = {
                id: id,
                exports: exports,
            };

            var value = fn(require, mod, exports);

            //没有通过 return 来返回值，则要导出的值在 mod.exports 里
            exports = value === undefined ? mod.exports : value;
            module.exports = exports;
        }

        module.required = true; //指示已经 require 过一次

        return exports;

    }

    /**
    * 异步加载指定的模块，并在加载完成后执行指定的回调函数。
    * @param {string} id 模块的名称。
    * @param {function} fn 模块加载完成后要执行的回调函数。
        该函数会接收到模块作为参数。
    */
    function async(id, fn) {

     

    }


    /**
    * 设置或获取对外暴露的模块。
    * 通过此方法，可以控制指定的模块是否可以通过 KERP.require(id) 来加载到。
    * @param {string|Object} id 模块的名称。
        当指定为一个 {} 时，则表示批量设置。
        当指定为一个字符串时，则单个设置。
    * @param {boolean} [exposed] 模块是否对外暴露。
        当参数 id 为字符串时，且不指定该参数时，表示获取操作，
        即获取指定 id 的模块是否对外暴露。
    * @return {boolean}
    */
    function expose(id, exposed) {

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

        //get
        return get(id);


        //内部方法
        function get(id) {
            var module = id$module[id];
            if (!module) {
                return false;
            }

            return module.exposed;
        }

        function set(id, exposed) {
            var module = id$module[id];
            if (module) {
                module.exposed = !!exposed;
            }
        }
    }



    return {
        define: define,
        require: require,
        async: async,
        expose: expose
    };


})();


//提供快捷方式
var define = Module.define;
var require = Module.require;
