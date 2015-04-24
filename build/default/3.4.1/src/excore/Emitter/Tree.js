
/**
* 用于管理树形结构的事件。
* @class
*/
define('Emitter/Tree', function (require, module, exports) {

    var $Array = require('Array');
    var $String = require('String');
    var Mapper = require('Mapper');

    var mapper = new Mapper();



    function Tree() {

        var id = module.id + '-' + $String.random();
        Mapper.setGuid(this, id);

        var meta = {
            'name$node': {}, //顶级节点容器对象
        };

        mapper.set(this, meta);

    }



    Tree.prototype = {
        constructor: Tree,

        /**
        * 添加一项对指定的路径节点的列表中。
        * @param {Array} names 路径节点的名称数组。
        * @param [item] 要添加的项， 可以是任何类型。
        * 当不指定此参数，则只参加相应的节点树，但并不添加任何项到列表中。
        * @return {Object} 返回被创建的最后一个节点对象。
        */
        add: function (names, item) {

            var meta = mapper.get(this);
            var name$node = meta.name$node;

            var lastIndex = names.length - 1;
            var hasItem = arguments.length == 2; //重载 add(names)
            var node = null;

            $Array.each(names, function (name, index) {

                node = name$node[name];
                if (!node) {
                    node = name$node[name] = {
                        'list': [],         //本节点的回调列表
                        'name$node': {},    //子节点的容器对象
                        'enabled': true,    //当为 false 时，表示本节点的回调被禁用
                        'spreaded': true,   //当为 false 时，表示子节点的回调被禁用
                    };
                }

                if (index < lastIndex) {
                    name$node = node.name$node; //准备下一轮迭代
                    return;
                }

                //最后一项
                if (hasItem) { // add(names, item)
                    node.list.push(item);
                }

            });

            return node;

        },

     

        /**
        * 清空全部数据。
        */
        clear: function () {
            var meta = mapper.get(this);
            meta.name$node = {};
        },

        /**
        * 检查是否包含任意的节点。
        */
        checkEmpty: function () {
            var meta = mapper.get(this);
            var name$node = meta.name$node;
            return $Object.isEmpty(name$node);
        },

        /**
        * 获取指定的路径数组所对应节点。
        * @param {Array} names 节点名称对应的路径数组。
        * @return 返回所对应的项。
        */
        getNode: function (names) {

            var meta = mapper.get(this);
            var name$node = meta.name$node;

            var lastIndex = names.length - 1;

            for (var i = 0; i <= lastIndex; i++) {
                var name = names[i];
                var node = name$node[name];

                if (!node || i == lastIndex) { //不存在或最后一项
                    return node;
                }

                //准备下一轮迭代
                name$node = node.name$node;
            }

        },

        get: function (names, key) {
            var node = this.getNode(names);
            return node ? node[key] : undefined;
        },


        set: function (names, key, value) {
            var node = this.add(names);
            node[key] = value;
        },


        getList: function (names) {
    
            var meta = mapper.get(this);
            var name$node = meta.name$node;

            var lastIndex = names.length - 1;

            for (var i = 0; i <= lastIndex; i++) {
                var name = names[i];
                var node = name$node[name];

                if (!node) { //不存在该节点
                    return [];
                }

                if (i == lastIndex) { //最后一个，即目标节点
                    return node.enabled ? node.list : [];
                }

                if (!node.spreaded) {
                    return [];
                }

                //准备下一轮迭代
                name$node = node.name$node;
            }


        },


      

    };

    
    return Tree;


});








