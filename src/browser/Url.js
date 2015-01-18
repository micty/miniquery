



define('browser/Url', function (require, module, exports) {



    var $String = require('String');
    var Mapper = require('Mapper');
    var Url = require('excore/Url');

    //用来记录 window 是否已绑定了 hashchange 事件 
    var window$hashchange = new Mapper();

    //避免意外绑定到 window 中同名的事件。 
    //也可阻止用户手动去触发该事件，因为外部无法得知该事件名。
    var hashchangeEventName = '__hashchange__' + $String.random();



    module.exports = exports = {  /**@lends MiniQuery.Url */


        /**
        * 获取指定窗口的查询字符串中指定的键所对应的值。
        * @param {Window|string} window 要进行获取 Window 窗口对象。
            当指定为 Window 窗口对象时，则从 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
        * @example
        */
        getQueryString: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.getQueryString.apply(null, args);

        },


        /**
        * 给指定的窗口设置查询字符串。
        * 注意：设置窗口的查询字符串，会导致页面刷新。
        * @param {Window|string} window 要设置的 Window 窗口对象。
            当指定为 Window 窗口对象时，则对其 location.href 进行设置，从而会导致窗口刷新；
            否则当作是一个指定的 Url 字符串。
        * @param {string|Object} key 要添加的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
        */
        setQueryString: function (window, key, value) {

            var args = $.toArray(arguments);

            if (typeof window == 'string') {
                return Url.setQueryString.apply(null, args);
            }


            var location = window.location;
            var url = location.href;
            args[0] = url;

            url = Url.setQueryString.apply(null, args);
            location.href = url; //设置整个 location.href 会刷新

            return url;

        },


        /**
        * 判断指定窗口的 Url 是否包含特定名称的查询字符串。
        * @param {Window|string} window 要检查的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
        */
        hasQueryString: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.hasQueryString.apply(null, args);

        },

        /**
        * 获取指定窗口的 Url 的哈希中的指定的键所对应的值。
        * @param {Window|string} window 要进行获取的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 
            默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部哈希值，对其进行 unescape 解码，
            然后返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部哈希(不解码)，返回一个 string 类型值。
        * @example
        */
        getHash: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.getHash.apply(null, args);

        },


        /**
        * 给指定窗口的 Url 设置哈希。
        * @param {Window|string} window 要设置的 Window 窗口对象。
            当指定为 Window 窗口对象时，则对其 location.href 进行设置，
            由于设置一个窗口的哈希不会导致窗口刷新，所以本方法不会刷新窗口；
            否则当作是一个指定的 Url 字符串。
        * @param {string|number|boolean|Object} key 要添加的哈希的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串，然后用 escape 进行编码来设置哈希。
            当传入的是一个 string|number|boolean 类型，并且不传入第三个参数， 则直接用 escape 进行编码来设置哈希。
        * @param {string} [value] 要添加的哈希的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
        */
        setHash: function (window, key, value) {

            var args = $.toArray(arguments);

            if (typeof window == 'string') {
                args[0] = window;
                return Url.setHash.apply(null, args);
            }


            var location = window.location;
            var url = location.href;
            args[0] = url;

            url = Url.setHash.apply(null, args);

            var hash = Url.getHash(url, ''); //获取所有的 hash 字符串
            hash = escape(hash);
            location.hash = hash; //不要设置整个 location.href，否则会刷新

            return location.href;

        },


        /**
        * 判断指定窗口的 Url 是否包含特定名称的哈希。
        * @param {Window|string} window 要检查的 Window 窗口对象。
            当指定为 Window 窗口对象时，则从其 location.href 中进行获取；
            否则当作是一个指定的 Url 字符串。
        * @param {string} [key] 要提取的哈希的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。
            默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的哈希，则返回 true；否则返回 false。
        * @example
        */
        hasHash: function (window, key, ignoreCase) {

            var url = typeof window == 'object' ? window.location.href : window;

            var args = $.toArray(arguments);
            args[0] = url;

            return Url.hasHash.apply(null, args);

        },





        /**
        * 监听指定窗口 Url 的 Hash 变化，并触发一个回调函数。
        * @param {Window} window 要监听的 window 窗口。
        * @param {function} fn 当监听窗口的 hash 发生变化时，要触发的回调函数。
        *   该回调函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
        *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
        *   如果 oldHash 不存在，则为 null。
        *   该回调函数内部的 this 指向监听的窗口。
        * @param {boolean} [immediate=false] 指示初始时当窗口中存在哈希时是否要立即执行回调函数。
            初始时当窗口中存在哈希时，如果要立即执行回调函数，请指定该参数为 true；
            否则不指定或指定为 false。
        * @example
            $.Url.hashchange(top, function (newHash, oldHash) {
                console.log('new hash: ' + newHash);
                console.log('old hash: ' + oldHash);
                console.log(this === top); //true
    
            });
        */
        hashchange: function (window, fn, immediate) {

            var Event = require('Event');

            Event.bind(window, hashchangeEventName, fn);

            var location = window.location;
            var hash = exports.getHash(window, '');


            if (hash && immediate) { //如果有 hash，并且指定了要立即触发，则立即触发
                fn.call(window, hash, null); //不要用 trigger，因为可能会影响之前绑定的
            }

            if (window$hashchange.get(window)) { // window 所对应的窗口已绑定 hashchange
                return;
            }

            // window 所对应的窗口首次绑定 hashchange
            if ('onhashchange' in window) {
                window.onhashchange = function () {
                    var oldHash = hash;
                    hash = exports.getHash(window, '');
                    Event.trigger(window, hashchangeEventName, [hash, oldHash]);
                };
            }
            else {
                setInterval(function () {
                    var oldHash = hash;
                    hash = exports.getHash(window, '');
                    if (hash != oldHash) {
                        Event.trigger(window, hashchangeEventName, [hash, oldHash]);
                    }
                }, 200);
            }

            window$hashchange.set(window, true);



        },

        /**
        * 监听指定窗口 Url 的 Hash 变化，并触发相应的路由分支函数。
        * @param {Window} window 要监听的 window 窗口。
        * @param {Object} routes 路由分支函数。
        *   分支函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
        *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
        *   如果 oldHash 不存在，则为 null。
        *   分支函数内部的 this 指向监听的窗口。
        * @example
            $.Url.route(window, {
                'abc': function (newHash, oldHash) { },
                'user/': function (newHash, oldHash){ },
                'user/1234': function (newHash, oldHash) { }
            });
    
            $.Url.route(window, 'abc', function (newHash, oldHash) {
    
            });
    
        */
        route: function (window, routes) {

            var $Object = require('Object');

            if (!$Object.isPlain(routes)) { //此时为 route(window, hash, fn) 的形式
                routes = $Object.make(routes, arguments[2]); //用 hash 和 fn 组成一个 {}
            }

            exports.hashchange(window, function (newHash, oldHash) {
                var fn = routes[newHash];
                if (fn) {
                    fn.call(window, newHash, oldHash);
                }
            });


        }


    };


});


//对外暴露的 Url 模块
define('Url', function (require, module, exports) {

    var excoreUrl = require('excore/Url');
    var browserUrl = require('browser/Url');

    module.exports = $.extend({}, excoreUrl, browserUrl);
});




