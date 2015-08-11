
/**
* 
* 
*/
define('Emitter/Helper', function (require, module, exports) {
    
    var $ = require('$');
    var $Array = require('Array');
    var $Object = require('Object');


    //绑定事件。
    function bind(meta, isOneOff, name, fn) {

        var tree = meta.tree;

        // 单名称情况 on(name, fn)，专门成一个分支，为了优化
        if (typeof name == 'string' && typeof fn == 'function') {
            tree.add([name], {
                'fn': fn,
                'isOneOff': isOneOff,
            });
            return;
        }

        //多名称情况
        var args = $.toArray(arguments).slice(2); //从 name 开始

        //重载 bind(meta, isOneOff, name0, name1, ..., nameN, {...}) 的情况
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

                tree.add(keys, {
                    'fn': item.value,
                    'isOneOff': isOneOff,
                });
            });
            return;
        }


        //重载 bind(meta, isOneOff, name0, name1, ..., nameN, fn) 的情况
        //尝试找到回调函数 fn 所在的位置
        var index = $Array.findIndex(args, function (item, index) {
            return typeof item == 'function';
        });

        if (index < 0) {
            throw new Error('参数中必须指定一个回调函数');
        }

        fn = args[index]; //回调函数
        var names = args.slice(0, index); //前面的都当作是名称

        tree.add(names, {
            'fn': fn,
            'isOneOff': isOneOff,
        });
    }


    //触发事件。
    function fire(meta, config) {

        config = config || {
            names: ['click', 'name'],
            args: [100, 200],
            stop: 100,
        };

        var names = config.names;
        if (!names || names.length == 0) {
            throw new Error('必须至少指定一个事件名称。');
        }

        var tree = meta.tree;

        var list = tree.getList(names);
        if (list.length == 0) {
            return [];
        }


        function stop(list) {

            if (!('stop' in config)) { //重写，提高后续调用效率
                stop = function () {
                    return false;
                };
                return false;
            }

            var fn = config.stop;
            if (typeof fn == 'function') {
                stop = fn;
                return fn(list) === true;
            }

            stop = function (list) {
                return list.slice(-1)[0] === fn; //取最后一个值进行判断
            };

            return list.slice(-1)[0] === fn;
        }


        //这里要特别注意，在执行回调的过程中，回调函数里有可能会去修改回调列表，
        //而此处又要去移除那些一次性的回调（即只执行一次的），
        //为了避免破坏回调函数里的修改结果，这里要边移除边执行回调，而且每次都要
        //以原来的回调列表为准去查询要移除的项的确切位置。

        var items = list.slice(0); //复制一份，因为回调列表可能会在执行回调过程发生变化。
        var returns = [];
        var len = items.length;
        var context = meta.context || null;
        var args = config.args || [];

        for (var i = 0; i < len; i++) {
            var item = items[i];

            if (item.isOneOff) { //只需执行一次的
                var index = $Array.indexOf(list, item); //找到该项在回调列表中的索引位置
                if (index >= 0) {
                    list.splice(index, 1); //直接从原数组删除。 list 数组发生了变化，但 items 数组不变
                }
            }

            var value = item.fn.apply(context, args); //让 fn 内的 this 指向 context
            returns.push(value);

            //返回值符合设定的停止值，则停止后续的调用
            if (stop(returns) === true) {
                break;
            }
        }

        return returns;

    }

    //设置事件树。
    function set(meta, $arguments, key, value) {

        var tree = meta.tree;
        var names = $.toArray($arguments);
        tree.set(names, key, value);
    }


    return {
        bind: bind,
        fire: fire,
        set: set,
    };

});








