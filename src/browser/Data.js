

/**
* 数据缓存类工具
* @class
* @param {DOMElement} node 要进行缓存数据的 DOM 节点
*/
MiniQuery.Data = function () {
    return new MiniQuery.Data.prototype.init(node);
};


; (function ($, This, $Object) {



var cache = {};
var uuid = 0;
var expando = $.expando;

var noData = {
    "embed": true,

    // Ban all objects except for Flash (which handle expandos)
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
    "applet": true
};




//静态成员
$.extend(This, { /**@lends MiniQuery.Data*/

    /**
    * 给某个节点设置指定键值的数据。
    * 当键不是 string、number、boolean 类型时，则用该键覆盖该节点的全部数据。
    */
    set: function (node, key, value) {
        if (!acceptData(node)) {
            throw new Error('无法在该节点上缓存数据!');
        }

        var id = node[expando];

        if (!id) { //不存在id，说明是第一次给该节点设置数据
            id = ++uuid;
            node[expando] = id; //分配唯一的 id
        }

        if (!cache[id]) { //不存在该节点关联的数据
            cache[id] = {};
        }

        if ($Object.isValueType(key)) {
            cache[id][String(key)] = value;
        }
        else { // object、function、...
            cache[id] = key; //此时忽略 value，直接把 key 当成 value
        }
    },

    /**
    * 获取某个节点指定键的数据。
    * 当不指定键时，则获取该节点关联的全部数据，返回一个 Object 对象。
    */
    get: function (node, key) {
        var id = node[expando];

        return key === undefined ? cache[id] || null :
            cache[id] ? cache[id][key] : null;
    },

    /**
    * 移除某个节点指定键的数据。
    * 当不指定键时，则移除该节点关联的全部数据
    */
    remove: function (node, key) {
        var id = node[expando];
        if (cache[id]) {
            if (key === undefined) {
                cache[id] = null;
            }
            else {
                delete cache[id][key];
            }
        }
    },

    /**
    * 判断指定的节点能否缓存数据。
    * @param {NodeElement} node 要进行判断的 DOM 节点
    * @return {boolean} 如果节点能缓存数据，则返回 true；否则，返回 false。
    * @example
        $.Data.acceptData(document.body);
    */
    acceptData: function (node) {
        if (!node || !node.nodeName) {
            return false;
        }

        var match = noData[node.nodeName.toLowerCase()];
        if (match) {
            return !(match === true || node.getAttribute("classid") !== match);
        }

        return true;
    }

});



})(MiniQuery, MiniQuery.Data, MiniQuery.Object); //结束  MiniQuery.Data 模块的定义
