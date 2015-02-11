
/**
* 自定义多级事件类
* @class
*/
define('Emitter', function (require, module, exports) {

    var $ = require('$');
    var $Array = require('Array');
    var $Object = require('Object');
    var $String = require('String');
    var Mapper = require('Mapper');

    var Tree = require('/Tree'); //完整名称为 Emitter/Tree

    var mapper = new Mapper();



    //绑定事件。
    //实例的私有方法，必须用 bind.apply(this, []) 的方式来调用。
    function bind(isOneOff, name, fn) {

        var meta = mapper.get(this);
        var all = meta.all;

        // 单名称情况 on(name, fn)，专门成一个分支，为了优化
        if (typeof name == 'string' && typeof fn == 'function') {
            Tree.add(all, [name], {
                'fn': fn,
                'isOneOff': isOneOff,
            });
            return;
        }

        //多名称情况
        var args = $.toArray(arguments).slice(1);

        //重载 bind(isOneOff, name0, name1, ..., nameN, {...}) 的情况
        //先尝试找到 {} 所在的位置
        var index = $Array.findIndex(args, function (item, index) {
            return typeof item == 'object';
        });

        if (index >= 0) {
            var obj = args[index];
            var names = args.slice(0, index);
            var list = $Object.linearize(obj);

            $Array.each(list, function (item, index) {

                var keys = names.concat(item.keys);

                Tree.add(all, keys, {
                    'fn': item.value,
                    'isOneOff': isOneOff,
                });
            });
            return;
        }
 

        //重载 bind(isOneOff, name0, name1, ..., nameN, fn) 的情况
        //尝试找到回调函数 fn 所在的位置
        var index = $Array.findIndex(args, function (item, index) {
            return typeof item == 'function';
        });

        if (index < 0) {
            throw new Error('参数中必须指定一个回调函数');
        }

        fn = args[index]; //回调函数
        var names = args.slice(0, index); //前面的都当作是名称

        Tree.add(all, names, {
            'fn': fn,
            'isOneOff': isOneOff,
        });
    }





    /**
    * 构造器。
    * @param {Object} [context] 事件处理函数中的 this 上下文对象。
    * 如果不指定，则默认为 null。
    */
    function Emitter(context) {

        var id = 'Emitter-' + $String.random();
        Mapper.setGuid(this, id);

        var meta = {
            'context': context,
            'all': {},
        };

        mapper.set(this, meta);

    }

    //实例方法
    Emitter.prototype = {
        constructor: Emitter,

        /**
        * 绑定指定名称的事件处理函数。
        * @param {string} name 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向构造器参数 context 对象。
        * @example
        */
        on: function (name, fn) {

            var args = $.toArray(arguments);
            args = [false].concat(args);
            bind.apply(this, args);

        },

        /**
        * 绑定指定名称的一次性事件处理函数。
        * @param {string} name 要绑定的事件名称。
        * @param {function} fn 事件处理函数。 
            在处理函数内部， this 指向构造器参数 context 对象。
        * @example
        */
        one: function (name, fn) {
            var args = $.toArray(arguments);
            args = [true].concat(args);
            bind.apply(this, args);
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
            var all = meta.all;

            //未指定事件名，则移除所有的事件
            if (name === undefined) {
                meta.all = {};
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
            var node = Tree.getNode(all, names);
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
        * 触发指定名称的事件，并可向事件处理函数传递一些参数。
        * @param {string} name 要触发的事件名称。
        * @param {Array} [params] 要向事件处理函数传递的参数数组。
        * @return {Array} 返回所有事件处理函数的返回值所组成的一个数组。
        */
        fire: function (name, params) {

            var meta = mapper.get(this);
            var all = meta.all;
            var context = meta.context;

            //多名称情况: fire(name0, name1, name2, ..., nameN, params)
            var args = $.toArray(arguments);

            //找到回调函数所在的位置
            var index = $Array.findIndex(args, function (item, index) {
                return item instanceof Array;
            });

            if (index < 0) {
                index = args.length;
            }

            params = args[index] || [];

            var names = args.slice(0, index);
            var list = Tree.getList(all, names);
            var returns = [];

            if (!list || list.length == 0) {
                return returns;
            }

            //这里要特别注意，在执行回调的过程中，回调函数里有可能会去修改回调列表，
            //而此处又要去移除那些一次性的回调（即只执行一次的），
            //为了避免破坏回调函数里的修改结果，这里要边移除边执行回调，而且每次都要
            //以原来的回调列表为准去查询要移除的项的确切位置。

            var items = list.slice(0); //复制一份，因为回调列表可能会在执行回调过程发生变化。

            $Array.each(items, function (item, index) {

                if (item.isOneOff) { //只需执行一次的
                    var index = $Array.indexOf(list, item); //找到该项在回调列表中的索引位置
                    if (index >= 0) {
                        list.splice(index, 1); //直接从原数组删除
                    }
                }

                var value = item.fn.apply(context, params); //让 fn 内的 this 指向 obj
                returns.push(value);

            });

            return returns;

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
            var all = meta.all;

            if (arguments.length == 0) { //未指定名称，则判断是否包含了任意类型的事件
                return !$Object.isEmpty(all); 
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
            var list = Tree.getList(all, names);

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


    };


    module.exports = Emitter;


});








