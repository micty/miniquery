
/**
* XML 工具类
* @namespace
*/
MiniQuery.Xml = (function ($, This) {

    
/**
* 针对 IE 创建最优版本的 XMLDocument 对象。
* @inner
*/
function createDocument() {
    var cache = arguments.callee;

    if (!cache['version']) { //首次创建
        var versions = [
            'MSXML2.DOMDocument.6.0',
            'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument'
        ];

        for (var i = 0, len = versions.length; i < len; i++) {
            try {
                var xmldoc = new ActiveXObject(versions[i]);
                cache['version'] = versions[i]; //缓存起来
                return xmldoc;
            }
            catch (ex) { //跳过

            }
        }
    }

    return new ActiveXObject(cache['version']);
}


/**
* 解析一个 XML 节点的属性集合成一个键/值形式的 Object 对象。
* 可以指定第二个参数是否为深层解析，即属性值中包含查询字符串编码时，可以进一步解析成对象。
* @inner
*/
function parseAttributes(node, deep) {

    var obj = {};
    var parseQueryString = $.Object.parseQueryString;

    //把类数组对象转成真正的数组
    $.Array(node.attributes).each(function (item, index) {

        if (item.specified) { //兼容性写法，过滤出自定义特性，可用于 HTML 节点的 attributes

            var value = item.value;

            if (deep && value.indexOf('=') > 0) { //深层次解码
                obj[item.name] = parseQueryString(value);
            }
            else {
                obj[item.name] = value;
            }
        }

    });

    return obj;
}

/**
* 跨浏览器解析 XML 数据(字符串)，返回一个 XMLDocument 对象。
* @inner
*/
function parseString(data) {
    var xmldoc = null;
    var impl = document.implementation;

    if (window.DOMParser) { //标准

        xmldoc = (new DOMParser()).parseFromString(data, 'text/xml');
        var errors = xmldoc.getElementsByTagName('parsererror');
        if (errors.length > 0) {
            throw new Error('XML 解析错误: ' + errors[0].textContent);
        }
    }
    else if (impl.hasFeature('LS', '3.0')) { // DOM3
    
        var parser = impl.createLSParser(impl.MODE_SYNCHRONOUS, null);
        var input = impl.createInput();
        input.stringData = data;
        xmldoc = parser.parse(input); //如果解析错误，则抛出异常
    }
    else { // IE
    
        xmldoc = createDocument();
        xmldoc.loadXML(data);
        if (xmldoc.parseError.errorCode != 0) {
            throw new Error('XML 解析错误: ' + xmldoc.parseError.reason);
        }
    }

    if (!xmldoc) {
        throw new Error('没有可用的 XML 解析器');
    }

    return xmldoc;
}

/**
* 把一个 Object 对象转成等价的 XML 字符串。
*
* 注意：传入的 Object 对象中，简单属性表示该节点自身的属性；
        数组表示该节点的子节点集合；
*       属性值只能是 string、number、boolean 三种值类型。
* @inner
*/
function Object_to_String(obj, name) {
    var fn = arguments.callee;

    if (!name) { //处理(重载) Object_to_String(obj) 的情况
    
        for (name in obj) {
            return fn(obj[name], name);
        }

        throw new Error('参数 obj 中不包含任何成员');
    }


    //正常情况 Object_to_String(obj, name)

    var attributes = [];
    var children = [];

    for (var key in obj) {
        if ($.Object.isArray(obj[key])) { //处理子节点
        
            $.Array.each(obj[key], function (child, index) {
                children.push(fn(child, key));
            });
            continue;
        }

        //处理属性
        var type = typeof obj[key];
        if (type == 'string' || type == 'number' || type == 'boolean') {
            var value = String(obj[key]).replace(/"/g, '\\"');
            attributes.push($.String.format('{0}="{1}"', key, value));
        }
        else {
            throw new Error('非法数据类型的属性值: ' + key);
        }
    }

    return $.String.format('<{name} {attributes}>{children}</{name}>', {
        name: name,
        attributes: attributes.join(' '),
        children: children.join(' \r\n')
    });
}











//MiniQuery.Xml = 
return $.extend(This, { /**@lends MiniQuery.Xml*/

    /**
    * 跨浏览器解析 XML 数据(字符串)或者一个等价结构的 Object 对象成一个 XMLDocument 对象。
    * @param {string|Object} data 要进行解析的 XML 数据，可以为字符串或等价结构的对象。
    * @return {XMLDocument} 返回一个 XMLDocument 对象。
    * @example
        <xmp>
        var data =
            '<Person num="2" code="0"> \
                <user id="1" name="micty" age="28"> \
                    <book id="1" name="C++" price="100"></book> \
                    <book id="2" name="C#.NET" price="256"></book> \
                    <book id="3" name="JavaScript" price="218"></book> \
                </user> \
                <user id="2" name="solomon" age="25"> \
                    <book id="1" name="CPP" price="100"></book> \
                    <book id="2" name="Linux" price="156"></book> \
                </user> \
            </Person>';
        var xmldoc = $.XML.parse(data);
        console.dir(xmldoc);
        </xmp>
    */
    parse: function (data) {
        var string = '';
        if (typeof data == 'string') {
            string = data;
        }
        else if (typeof data == 'object' && data) {
            string = Object_to_String(data);
        }

        if (!string) {
            throw new Error('非法的参数 data');
        }

        return parseString(string);
    },


    /**
    * 把一个 XMLDocument 对象或一个 XML 节点或一个 Object 对象解析成等价的 XML 字符串。
    * @param {Object} obj 要进行解析的对象。<br />
    * 注意：<br />
    *   传入的 Object 对象中，简单属性表示该节点自身的属性；<br />
    *   数组表示该节点的子节点集合；<br />
    *   属性值只能是 string、number、boolean 三种值类型。
    * @return 返回一个 XML 字符串。
    * @example
        var obj = {
            Person: {
                num: "2", code: "0",
                user: [
                    {
                        id: "1", name: "micty", age: "28",
                        book: [
                            { id: "1", name: "C++", price: "100" },
                            { id: "2", name: "C#.NET", price: "256" },
                            { id: "3", name: "JavaScript", price: "218" }
                        ]
                    },
                    {
                        id: "2", name: "solomon", age: "25",
                        book: [
                            { id: "1", name: "CPP", price: "100" },
                            { id: "2", name: "Linux", price: "156" }
                        ]
                    }
                ]
            }
        };
        var xml = $.XML.toString(obj);
        console.log(xml);
    得到：<xmp>
        xml = '
            <Person num="2" code="0"> \
                <user id="1" name="micty" age="28"> \
                    <book id="1" name="C++" price="100"></book> \
                    <book id="2" name="C#.NET" price="256"></book> \
                    <book id="3" name="JavaScript" price="218"></book> \
                </user> \
                    <user id="2" name="solomon" age="25"> \
                    <book id="1" name="CPP" price="100"></book> \
                    <book id="2" name="Linux" price="156"></book> \
                </user> \
            </Person>'     </xmp>
    */
    toString: function (obj) {
        if (!obj || typeof obj != 'object') {
            return '';
        }

        if (obj.nodeName) { //传入的是 node 节点( XMLDocument 对象 或 XML 节点)
        
            var node = obj; //换个名称更容易理解

            if (window.XMLSerializer) { //标准
                return (new XMLSerializer()).serializeToString(node);
            }

            if (document.implementation.hasFeature('LS', '3.0')) { // DOM3
                return document.implementation.createLSSerializer().writeToString(node);
            }

            //IE
            return node.xml;
        }

        //否则，使用标准的
        return Object_to_String(obj);

    },


    /**
    * 把一个 XML 字符串或 XMLDocument 对象或 XML 节点解析成等价结构的 Object 对象
    * @param {string|XMLDocument|XMLNode} node 
        要进行解析的 XML 字符串或 XMLDocument 对象或 XML 节点。<br />
        注意：表示 XML 节点中的属性名不能跟直接子节点中的任何一个节点名相同。
    * @param {boolean} deep 
        指示是否对节点值中进一步按查询字符串的解析成等价的对象。<br />
        如 "a=1&b=2&c=A%3D100%26B%3D200" 会被解析成对象 {a:1, b:2, c:{A:100, B:200}}
    * @return {Object} 返回一个等价的对象。<br />
        返回的 Object 对象中，属性表示该节点自身的属性；数组表示该节点的子节点集合。
    *@example
    <xmp>
        var xml = '
            <Person num="2" code="0"> \
                <user id="1" name="micty" age="28"> \
                    <book id="1" name="C++" price="100"></book> \
                    <book id="2" name="C#.NET" price="256"></book> \
                    <book id="3" name="JavaScript" price="218"></book> \
                </user> \
                    <user id="2" name="solomon" age="25"> \
                    <book id="1" name="CPP" price="100"></book> \
                    <book id="2" name="Linux" price="156"></book> \
                </user> \
            </Person>';
    </xmp>
        var obj = $.XML.toObject(xml); 
    得到：
        obj = {
            Person: {
                num: "2", code: "0",
                user: [
                {
                    id: "1", name: "micty", age: "28",
                    book: [
                        { id: "1", name: "C++", price: "100" },
                        { id: "2", name: "C#.NET", price: "256" },
                        { id: "3", name: "JavaScript", price: "218" }
                    ]
                },
                {
                    id: "2", name: "solomon", age: "25",
                    book: [
                        { id: "1", name: "CPP", price: "100" },
                        { id: "2", name: "Linux", price: "156" }
                    ]
                }]
            }
        };
    */
    toObject: function (node, deep) {

        var fn = arguments.callee;  //引用自身，递归用到

        if (typeof node == 'string') { //传入的是 XML 的字符串
            var data = node;
            var xmlDoc = parseString(data); //把字符串解析成 XMLDocument 对象
            return fn(xmlDoc, deep);
        }

        if (node && node.documentElement) { //传入的是 XMLDocument 对象
            var xmlDoc = node;
            var obj = {};
            obj[xmlDoc.documentElement.nodeName] = fn(xmlDoc.documentElement, deep); //取根节点进行解析
            return obj;
        }


        //以下处理的是 XML 节点的情况

        if (!node || !node.nodeName) {
            throw new Error('参数 node 错误：非法的 XML 节点');
        }


        var obj = parseAttributes(node, deep); //把节点属性转成键值对 obj

        var childNodes = $.Array.parse(node.childNodes); //把类数组的子节点列表转成真正的数组

        //处理 <abc ...>xxx</abc> 这样的情况：obj.value = xxx;
        if (childNodes.length == 1) { //只有一个子节点
            var leaf = childNodes[0];
            if (leaf.nodeType == 3) { // TextNode 文本节点
                obj['value'] = leaf.nodeValue; //增加一个默认字段 value
                return obj;
            }
        }

        //过虑出真正的元素节点。IE 中 node 节点 没有 children 属性，因此用 childNodes 是兼容的写法
        $.Array(childNodes).grep(function (item, index) {
            return item.nodeType === 1; //元素节点

        }).each(function (child, index) {
            var name = child.nodeName; //标签名，如 div

            if (!obj[name]) { //同类标签名，汇合到同一个数组中
                obj[name] = [];
            }

            obj[name].push(fn(child));
        });

        return obj;

    }

}); //结束 return



})(MiniQuery, {}); //结束 MiniQuery.Xml 模块的定义




