
/**
* Emitter/Tree 模块。
* @class
*/
define('Emitter/Tree', function (require, module, exports) {

    var $Array = require('Array');


    module.exports = exports = {

        add: function (name$node, names, item) {

            var lastIndex = names.length - 1;

            $Array.each(names, function (name, index) {

                var node = name$node[name];
                if (!node) {
                    node = name$node[name] = {
                        'list': [],
                        'tree': {}
                    };
                }

                if (index < lastIndex) {
                    name$node = node.tree;
                }
                else { //最后一项
                    node.list.push(item);
                }

            });

        },

        getNode: function (name$node, names) {

            var lastIndex = names.length - 1;

            for (var i = 0; i <= lastIndex; i++) {
                var name = names[i];
                var node = name$node[name];

                if (!node || i == lastIndex) { //最后一项
                    return node;
                }

                name$node = node.tree;
            }

        },

        getList: function (name$node, names) {
            var node = exports.getNode(name$node, names);
            return node ? node.list : null;
        }

    };


});








