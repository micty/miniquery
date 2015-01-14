



/**
* Script 脚本工具
* @namespace
*/

define('Script', function (require, module, exports) {


    var defaults = {
        url: '',
        id: '',
        charset: 'utf-8',
        document: window.document,
        onload: null
    };



    /**
    * 加载单个
    * @inner
    */
    function loadSingle(url, charset, document, onload) {

        var id;

        if (typeof url == 'object') { //传入的是一个 {} 
            var config = url;

            id = config.id;
            url = config.url;
            charset = config.charset;
            document = config.document;
            onload = config.onload;
        }


        var script = document.createElement('script');
        script.type = 'text/javascript';

        if (id) {
            script.id = id;
        }

        if (charset) {
            script.charset = charset;
        }


        if (onload) { //指定了回调函数，则设置它

            if (script.readyState) { //IE

                script.onreadystatechange = function () {

                    var readyState = script.readyState;

                    if (readyState == 'loaded' || readyState == 'complete') {
                        script.onreadystatechange = null; //避免重复执行回调
                        onload();
                    }
                };
            }
            else { //标准
                script.onload = onload;
            }

        }


        script.src = url;
        document.head.appendChild(script);
    }

    /**
    * 顺序加载批量
    * @inner
    */
    function loadBatch(urls, charset, document, fn) {

        var index = 0;

        (function () {

            var next = arguments.callee;
            var url = urls[index];

            loadSingle(url, charset, document, function () {
                index++;

                if (index < urls.length) {
                    next();
                }
                else {
                    fn && fn();
                }
            });

        })();


    }


    /**
    * 单个写入
    * @inner
    */
    function document_write(url, charset, document) {

        var $String = require('String');

        var html = $.String.format('<script type="text/javascript" src="{src}" {charset} ><\/script>', {
            'src': url,
            'charset': charset ? $.String.format('charset="{0}"', charset) : ''
        });

        document.write(html);
    }



    
    module.exports = exports = { /**@lends MiniQuery.Script*/

        /**
        * 跨浏览器动态加载 JS 文件，并在加载完成后执行指定的回调函数。
        * @memberOf MiniQuery.Script
        * @param {string|Array} params.url 
            要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
        * @param {string} [params.charset="utf-8"] 
            要加载的 JS 文件的字符编码，默认为 utf-8。
        * @param {Document} [params.document=window.document] 
            要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
        * @param {function} [params.onload] 
            加载成功后的回调函数。
        * @example
            $.Script.load({
                url: 'a.js',
                charset: 'utf-8',
                document: document,
                id: 'myScript',
                onload: function (){ }
            });

            $.Script.load('a.js', 'utf-8', document, function(){});
            $.Script.load('a.js', 'utf-8', function(){});
            $.Script.load('a.js', document, function(){});
            $.Script.load('a.js', function(){});

            //批量加载
            $.Script.load(['a.js', 'b.js'], function(){});
        */
        load: function (params) {

            var obj = $.Object.extend({}, defaults); //复制一份

            //注意，params 有可能是个数组，不能用 typeof 为 'object'
            if ($.Object.isPlain(params)) { //纯对象 {}

                $.Object.extend(obj, params);
            }
            else {

                obj.url = params;

                switch (typeof arguments[1]) {
                    case 'string':
                        obj.charset = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                    case 'function':
                        obj.onload = arguments[1];
                        break;
                }

                switch (typeof arguments[2]) {
                    case 'object':
                        obj.document = arguments[2];
                        break;
                    case 'function':
                        obj.onload = arguments[2];
                        break;
                }

                if (arguments[3]) {
                    obj.onload = arguments[3];
                }
            }




            var url = obj.url;

            if (typeof url == 'string') {
                loadSingle(obj);
            }
            else if (url instanceof Array) {
                loadBatch(url, obj.charset, obj.document, obj.onload);
            }
            else {
                throw new Error('参数 params.url 必须为 string 或 string 的数组');
            }


        },

        /**
        * 创建一个 script 标签，并插入 JavaScript 代码。
        * @param {string} params.code 要插入的 JS 代码。
        * @param {string} [params.id] 创建的 script 标签中的 id。
        * @param {Document} [params.document=window.document] 
            创建的 script 标签的上下文环境的 document。默认为当前窗口的 document 对象。
        * @example
            $.Script.insert({
                code: 'alert(0);',
                id: 'myScript',
                document: document
            });
            $.Script.insert('alert(0);', 'myScript', document);
            $.Script.insert('alert(0);', 'myScript');
            $.Script.insert('alert(0);', document);
        */
        insert: function (params) {
            var obj = {
                code: '',
                id: '',
                document: window.document
            };

            if ($.Object.isPlain(params)) {
                $.Object.extend(obj, params);
            }
            else {
                obj.code = params;

                switch (typeof arguments[1]) {
                    case 'string':
                        obj.id = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                }

                if (arguments[2]) {
                    obj.document = arguments[2];
                }
            }

            var script = obj.document.createElement('script');
            script.type = 'text/javascript';

            if (obj.id) {
                script.id = obj.id;
            }

            try { // 标准，IE 除外
                script.appendChild(obj.document.createTextNode(obj.code));
            }
            catch (ex) { // IE，但不限于 IE
                script.text = obj.code;
            }

            obj.document.getElementsByTagName('head')[0].appendChild(script);
        },

        /**
        * 用 document.write 的方式加载 JS 文件。
        * @memberOf MiniQuery.Script
        * @param {string|Array} params.url 
            要加载的 JS 文件的 url 地址，如果要批量加载，则为一个地址数组。
        * @param {string} [params.charset="utf-8"] 
            要加载的 JS 文件的字符编码，默认为 utf-8。
        * @param {Document} [params.document=window.document] 
            要加载的 JS 文件的上下文环境的 document，默认为当前窗口的 document 对象。
        * @example
            $.Script.write({
                url: 'a.js',
                charset: 'utf-8',
                document: document
            });
            $.Script.write('a.js', 'utf-8', document);
            $.Script.write('a.js', 'utf-8');
            $.Script.write('a.js', document);
        */
        write: function (params) {
            var obj = {
                url: '',
                charset: '',
                document: window.document
            };

            if ($.Object.isPlain(params)) {
                $.Object.extend(obj, params);
            }
            else {
                obj.url = params;
                switch (typeof arguments[1]) {
                    case 'string':
                        obj.charset = arguments[1];
                        break;
                    case 'object':
                        obj.document = arguments[1];
                        break;
                }

                if (arguments[2]) {
                    obj.document = arguments[2];
                }

            }

            if ($.Object.isArray(obj.url)) {
                var urls = obj.url;
                for (var i = 0, len = urls.length; i < len; i++) {
                    document_write(urls[i], obj.charset, obj.document);
                }
            }
            else {
                document_write(obj.url, obj.charset, obj.document);
            }
        }
    };

});



