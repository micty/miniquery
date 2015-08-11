/**
* 树形结构的存储类。
* @class
* @name Tree
*/
define('Tree', function (require, module, exports) {

    var $ = require('$');

    var $Array = require('Array');
    var $String = require('String');
    var $Object = require('Object');
    var Mapper = require('Mapper');

    var mapper = new Mapper();


    /**
    * 构造器。
    */
    function Tree() {

        var id = module.id + '-' + $String.random();
        Mapper.setGuid(this, id);

        var meta = {
            'key$node': {}, //顶级节点容器对象
            'count': 0,     //节点计数
        };

        mapper.set(this, meta);

    }



    function getNode(key$node, keys) {

        var lastIndex = keys.length - 1;

        for (var index = 0; index <= lastIndex; index++) {

            var key = keys[index];
            var node = key$node[key];

            if (!node || index == lastIndex) { //不存在了，或是最后一项了
                return node || null;
            }

            key$node = node.key$node; //准备下一轮迭代
        }
    }



    //实例方法
    Tree.prototype = /**@lends Tree.prototype */{
        constructor: Tree,

        /**
        * 设置指定节点上的值。
        * 如果不存在该节点，则先创建，然后存储值到上面；否则直接改写原来的值为指定的值。
        * 已重载 set(key0, key1, ..., keyN, value) 的情况。
        * @param {Array} keys 节点路径数组。
        * @param value 要设置的值。
        * @example
            cache.set(['path', 'to'], 123);
            cache.set('path', 'to', 123); //跟上面的等价
        */
        set: function (keys, value) {

            //重载 set(key0, key1, ..., keyN, value) 的情况。
            if (!(keys instanceof Array)) {
                var args = [].slice.call(arguments, 0);
                keys = args.slice(0, -1);
                value = args.slice(-1)[0]; //参数中的最后一个即为 value
            }

            var meta = mapper.get(this);
            var key$node = meta.key$node;
            var lastIndex = keys.length - 1;
            var node = null;

            $Array.each(keys, function (key, index) {

                node = key$node[key];

                if (!node) {
                    meta.count++;

                    node = key$node[key] = {
                        'key$node': {},         //子节点的容器对象
                        'parent': key$node,     //指向父节点，方便后续处理
                        'key': key,             //当前的 key，方便后续处理
                        //'value': undefined,   //会有一个这样的字段，但先不创建。
                    };
                }

                if (index < lastIndex) {
                    key$node = node.key$node; //准备下一轮迭代
                }
                else { //最后一项
                    node.value = value;
                }

            });

         
        },

        /**
        * 获取指定路径的节点上的值。
        * @return 返回该节点上的值。 如果不存在该节点，则返回 undefined。
        */
        get: function (keys) {

            //重载 get(key0, key1, ..., keyN) 的情况
            if (!(keys instanceof Array)) {
                keys = [].slice.call(arguments);
            }

            var meta = mapper.get(this);
            var key$node = meta.key$node;

            var node = getNode(key$node, keys);
            return node ? node.value : undefined;
        },


        /**
        * 清空全部数据。
        */
        clear: function () {
            var meta = mapper.get(this);
            meta.key$node = {};
            meta.count = 0;
        },

        /**
        * 删除指定节点上的值。
        */
        remove: function (keys) {

            //重载 remove(key0, key1, ..., keyN) 的情况
            if (!(keys instanceof Array)) {
                keys = [].slice.call(arguments);
            }

            var meta = mapper.get(this);
            var key$node = meta.key$node;

            var node = getNode(key$node, keys);

            if (!node) { //不存在该节点
                return;
            }


            var obj = node.key$node;        //子节点

            if (!obj || $Object.isEmpty(obj)) {    //不存在子节点

                meta.count--;
                delete node.parent[node.key];       //删除整个节点自身，节省内存
            }
            else {
                delete node.value; //删除值
            }

        },

        /**
        * 删除指定的节点及所有子节点。
        */
        removeAll: function (keys) {

            //重载 remove(key0, key1, ..., keyN) 的情况
            if (!(keys instanceof Array)) {
                keys = [].slice.call(arguments);
            }

            var meta = mapper.get(this);
            var key$node = meta.key$node;

            var node = getNode(key$node, keys);
            if (!node) { //不存在该节点
                return;
            }

            meta.count--;
            delete node.parent[node.key];   //删除整个节点自身
        },

        /**
        * 获取节点总数。
        * @return {number} 返回节点的总数目。
        */
        count: function () {
            var meta = mapper.get(this);
            return meta.count;
        },




    };


    return Tree;


});








