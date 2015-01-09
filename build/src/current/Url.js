


/**
* 当前运行窗口的 Url 工具类
* @namespace
*/
MiniQuery.Url.Current = (function (Url, window, location) {



return {  /**@lends MiniQuery.Url.Current */

    /**
    * 获取当前窗口的 Url 的查询字符串中指定的键所对应的值。
    * @param {string} [key] 要检索的键。
    * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
        如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
        当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
    * @retun {string|Object|undefined} 返回一个查询字符串值。
        当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
        当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
    */
    getQueryString: function (key, ignoreCase) {

        var args = $.toArray(arguments);
        args = [window].concat(args);

        return Url.getQueryString.apply(null, args);
    },
    

    /**
    * 把当前窗口的 Url 和查询字符串组装成一个新的 Url。
    * @param {string|Object} key 要添加的查询字符串的键。
        当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
    * @param {string} [value] 要添加的查询字符串的值。
    * @retun {string} 返回组装后的新的 Url。
    */
    setQueryString: function (key, value) {

        var args = $.toArray(arguments);
        args = [window].concat(args);

        return Url.setQueryString.apply(null, args);
    },

    /**
    * 判断当前窗口的 Url 是否包含特定名称的查询字符串。
    * @param {string} [key] 要提取的查询字符串的键。
    * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
        如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
        当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
    * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
    */
    hasQueryString: function (key, ignoreCase) {

        var args = $.toArray(arguments);
        args = [window].concat(args);

        return Url.hasQueryString.apply(null, args);
    },


    /**
    * 监听当前窗口的 hash 变化，并触发一个回调函数。
    * @param {function} fn 当本窗口的 hash 发生变化时，要触发的回调函数。
    *   该回调函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
    *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
    *   如果 oldHash 不存在，则为 null。
    *   该回调函数内部的 this 指向当前窗口。
    * @example
        $.Url.Current.hashchange(function (newHash, oldHash) {
            console.log('new hash: ' + newHash);
            console.log('old hash: ' + oldHash);
            console.log(this === window); //true
        });
    */
    hashchange: function (fn) {

        var args = $.toArray(arguments);
        args = [window].concat(args);

        Url.hashchange.apply(null, args);
    },

    /**
    * 监听当前窗口 Url 的 Hash 变化，并触发相应的路由分支函数。
    * @param {Object} routes 路由分支函数。
    *   分支函数会接收到两个参数：newHash 和 oldHash，当前的 hash 值和旧的 hash 值。
    *   注意，newHash 和 oldHash 都去掉了 '#' 号而直接保留 hash 值。
    *   如果 oldHash 不存在，则为 null。
    *   分支函数内部的 this 指向监听的窗口。
    * @example
        $.Url.route({
            'abc': function () { },
            'user/': function(){},
            'user/1234': function () { }
        });
    */
    route: function (routes) {

        var args = $.toArray(arguments);
        args = [window].concat(args);

        Url.route.apply(null, args);
    }

};


})(MiniQuery.Url, window, window.location);






