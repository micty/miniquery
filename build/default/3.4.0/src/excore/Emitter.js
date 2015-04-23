
/**
* 自定义多级事件类
* @class
* @name Emitter
*/
define('Emitter', function (require, module, exports) {

    var $ = require('$');
    var $Array = require('Array');
    var $Object = require('Object');
    var $String = require('String');
    var Mapper = require('Mapper');

    var Tree = require(module, 'Tree');
    var Helper = require(module, 'Helper');

    var mapper = new Mapper();




    /**
    * 构造器。
    * @param {Object} [context=null] 事件处理函数中的 this 上下文对象。
    *   如果不指定，则默认为 null。
    */
    function Emitter(context) {

        var id = 'Emitter-' + $String.random();
        Mapper.setGuid(this, id);

        var meta = {
            'context': context,
            'tree': new Tree(),
        };

        mapper.set(this, meta);

    }

    //实例方法
    Emitter.prototype = /**@lends Emitter.prototype */ {
        constructor: Emitter,

        /**
        * 绑定指定名称的事件处理函数。
        * @param {string} name 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向构造器参数 context 对象。
        * @example
            var emitter = new Emitter();
            emitter.on('click', function () {

            });
        */
        on: function (name, fn) {

            var meta = mapper.get(this);

            var args = $.toArray(arguments);
            args = [meta, false].concat(args);

            Helper.bind.apply(null, args);
        },

        /**
        * 绑定指定名称的一次性事件处理函数。
        * @param {string} name 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向构造器参数 context 对象。
        */
        one: function (name, fn) {

            var meta = mapper.get(this);

            var args = $.toArray(arguments);
            args = [meta, true].concat(args);

            Helper.bind.apply(null, args);
        },


        /**
        * 解除绑定指定名称的事件处理函数。
        * @param {string} [name] 要解除绑定的事件名称。
            如果不指定该参数，则移除所有的事件。
            如果指定了该参数，其类型必须为 string，否则会抛出异常。
        * @param {function} [fn] 要解除绑定事件处理函数。
            如果不指定，则移除 name 所关联的所有事件。
        */
        off: function (name, fn) {

            var meta = mapper.get(this);
            var tree = meta.tree;


            //未指定事件名，则移除所有的事件
            if (name === undefined) {
                tree.clear();
                return;
            }

            //多名称情况: fire(name0, name1, name2, ..., nameN, fn)
            var args = $.toArray(arguments);

            //找到回调函数所在的位置
            var index = $Array.findIndex(args, function (item, index) {
                return typeof item == 'function';
            });

            if (index < 0) {
                index = args.length;
            }

            fn = args[index];

            var names = args.slice(0, index);
            var node = tree.getNode(names);
            if (!node) { //尚未存在该名称所对应的节点
                return;
            }

            var list = node.list;
            if (list.length == 0) {
                return;
            }

            if (fn) {
                node.list = $Array.grep(list, function (item, index) {
                    return item.fn !== fn;
                });
            }
            else { //未指定处理函数，则清空列表
                list.length = 0;
            }

        },

        /**
        * 已重载。
        * 触发指定名称的事件，并可向事件处理函数传递一些参数。
        * 如果指定了 stop 字段，则当事件处理函数返回指定的值时将停止调用后面的处理函数。
        * @param {Object} config 配置对象。
        * @param {Array} config.names 事件名称列表。
        * @param {Array} config.args 要传递给事件处理函数的参数数据。
        * @param config.stop 当事件处理函数的返回值满足一定时，将停止调用后面的处理函数。
            当 stop 为函数时，则需要在 stop 函数内明确返回 true 才停止。
            否则，事件处理的返回值跟 stop 完全相等时才停步。
        * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
        * @example
            var emitter = new Emitter();
            emitter.on('click', 'name', function (a, b) {
                console.log(a, b);
            });
            emitter.fire('click', 'name', [100, 200]);

            emitter.fire({
                names: ['click', 'name'],
                args: [100, 200],
                stop: 100,
            });
        */
        fire: function (config) {

            var meta = mapper.get(this);

            if (typeof config == 'object') { //重载 fire({...})
                return Helper.fire(meta, config);
            }

            //多名称情况: fire(name0, name1, name2, ..., nameN, params)
            var args = $.toArray(arguments);

            //找到参数数组所在的位置
            var index = $Array.findIndex(args, function (item, index) {
                return item instanceof Array;
            });

            if (index < 0) {
                index = args.length;
            }
           
            return Helper.fire(meta, {
                'names': args.slice(0, index),
                'args': args[index]
            });

        },

        /**
        * 检测是否包含指定名称的事件。
        * @param {string} [name] 要检测的事件名称。
            当不指定时，则判断是否包含了任意类型的事件。
        * @param {function} [fn] 要检测的事件处理函数。
        * @return {boolean} 返回一个布尔值，该布尔值指示目标对象上是否包含指否类型的事件以及指定的处理函数。
            如果是则返回 true；否则返回 false。
        */
        has: function (name, fn) {

            var meta = mapper.get(this);
            var tree = meta.tree;

            if (arguments.length == 0) { //未指定名称，则判断是否包含了任意类型的事件
                return tree.checkEmpty();
            }

            //多名称情况: fire(name0, name1, name2, ..., nameN, fn)
            var args = $.toArray(arguments);

            //找到回调函数所在的位置
            var index = $Array.findIndex(args, function (item, index) {
                return typeof item == 'function';
            });

            if (index < 0) {
                index = args.length;
            }

            fn = args[index];

            var names = args.slice(0, index);
            var list = tree.getList(names);

            if (!list || list.length == 0) { //尚未存在该名称所对应的节点
                return false;
            }

            if (!fn) {
                return true;
            }

            //指定了回调函数
            return $Array.find(list, function (item, index) {
                return item.fn === fn;
            });


        },

        enable: function (name) {
            var meta = mapper.get(this);
            Helper.set(meta, arguments, 'enabled', true);
        },

        disable: function (name) {
            var meta = mapper.get(this);
            Helper.set(meta, arguments, 'enabled', false);
        },

        enableSpread: function (name) {
            var meta = mapper.get(this);
            Helper.set(meta, arguments, 'spreaded', true);
        },

        disableSpread: function (name) {
            var meta = mapper.get(this);
            Helper.set(meta, arguments, 'spreaded', false);
        },
       

        /**
        * 销毁本实例对象。
        */
        destroy: function () {
            this.off();
            mapper.remove(this);
        },


    };

    
    module.exports = Emitter;

});