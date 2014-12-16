

/**
* Style 样式类工具
* @namespace
*/
MiniQuery.Style = (function ($, This) {

    var iframe;
    var iframeDoc;



    var defaults = {
        url: '',
        id: '',
        charset: 'utf-8',
        document: window.document,
        onload: null
    };



    /**
    * 加载单个文件。 
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


        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';

        if (id) {
            link.id = id;
        }

        if (charset) {
            link.charset = charset;
        }


        if (onload) { //指定了回调函数，则设置它

            if (link.readyState) { //IE

                link.onreadystatechange = function () {

                    var readyState = link.readyState;

                    if (readyState == 'loaded' || readyState == 'complete') {
                        link.onreadystatechange = null; //避免重复执行回调
                        onload();
                    }
                };
            }
            else { //标准
                link.onload = onload;
            }

        }


        link.href = url;
        document.head.appendChild(link);
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




    return $.extend(This, { /**@exports as MiniQuery.Style */

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
            $.Style.load({
                url: 'a.css',
                charset: 'utf-8',
                document: document,
                id: 'myScript',
                onload: function (){ }
            });

            $.Style.load('a.css', 'utf-8', document, function(){});
            $.Style.load('a.css', 'utf-8', function(){});
            $.Style.load('a.css', document, function(){});
            $.Style.load('a.css', function(){});

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

        getComputed: function (node, propertyName) {

            var name = $.String.toCamelCase(propertyName);
            var style = node.currentStyle || document.defaultView.getComputedStyle(node, null);
            return style ? style[name] : null;
        },

        getDefault: function (nodeName, propertyName) {

            var cache = arguments.callee;
            if (!cache[nodeName]) {
                cache[nodeName] = {};
            }

            if (!cache[nodeName][propertyName]) {

                if (!iframe) { //尚未存在 iframe，先创建它
                    iframe = document.createElement("iframe");
                    iframe.frameBorder = iframe.width = iframe.height = 0;
                }

                document.body.appendChild(iframe);

                /*
                    首次运行时，创建一个可缓存的版本。
                    IE 和 Opera 允许在没有重写假 HTML 到它的情况下重用 iframeDoc；
                    WebKit 和 Firefox 不允许重用 iframe document
                */
                if (!iframeDoc || !iframe.createElement) {
                    iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                    iframeDoc.write((document.compatMode === 'CSS1Compat' ?
                        '<!doctype html>' : '') + '<html><body>');
                    iframeDoc.close();
                }

                var node = iframeDoc.createElement(nodeName);
                iframeDoc.body.appendChild(node);

                cache[nodeName][propertyName] = This.getComputed(node, propertyName);

                document.body.removeChild(iframe);
            }

            return cache[nodeName][propertyName];

        },



        insert: function (css, id) {
            var style = document.createElement('style');
            style.type = 'text/css';

            if (id !== undefined) {
                style.id = id;
            }

            try { //标准
                style.appendChild(document.createTextNode(css));
            }
            catch (ex) { //IE
                style.styleSheet.cssText = css;
            }

            document.getElementsByTagName('head')[0].appendChild(style);
        },

        write: function (href) {
            document.write('<link rel="stylesheet" rev="stylesheet" href="' + href + '" type="text/css" media="screen" />');
        },

        addRule: function (sheet, selectorText, cssText, index) {
            if (sheet.insertRule) { //标准
                sheet.inertRule(selectorText + '{' + cssText + '}', index);
            }
            else if (sheet.addRule) { //IE
                sheet.addRule(selectorText, cssText, index);
            }
            else {
                throw new Error('无法插入样式规则!');
            }
        },

        removeRule: function (sheet, index) {
            if (sheet.deleteRule) {
                sheet.deleteRule(index);
            }
            else if (sheet.romveRule) {
                sheet.removeRule(index);
            }
            else {
                throw new Error('无法删除样式规则!');
            }
        }
    });



})(MiniQuery, {});

