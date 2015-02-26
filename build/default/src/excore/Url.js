
/**
* Url 工具类
* @namespace
* @name Url
*/
define('excore/Url', function (require, module, exports) {

    module.exports = exports = /**@lends Url */ {

        /**
        * 获取指定 Url 的查询字符串中指定的键所对应的值。
        * @param {string} url 要进行获取的 url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部查询字符串，返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部查询字符串，返回一个 string 类型值。
        * @example
            Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 '1'
            Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 undefined
            Url.getQueryString('http://www.demo.com?a=1&A=2#hash', 'A');  //返回 2
            Url.getQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true);//返回 1
            Url.getQueryString('http://www.demo.com?a=1&b=2#hash', '');   //返回 'a=1&b=2'
            Url.getQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 {a: '1', b: '2'}
            Url.getQueryString('http://www.demo.com?a=&b=');              //返回 {a: '', b: ''}
            Url.getQueryString('http://www.demo.com?a&b');                //返回 {a: '', b: ''}
            Url.getQueryString('http://www.demo.com?a', 'a');             //返回 ''
        */
        getQueryString: function (url, key, ignoreCase) {

            var beginIndex = url.indexOf('?');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }

            var endIndex = url.indexOf('#');
            if (endIndex < 0) {
                endIndex = url.length;
            }

            var qs = url.slice(beginIndex + 1, endIndex);
            if (key === '') { //获取全部查询字符串的 string 类型
                return decodeURIComponent(qs);
            }

            var $Object = require('Object');
            var obj = $Object.parseQueryString(qs);

            if (key === undefined) { //未指定键，获取整个 Object 对象
                return obj;
            }

            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                return obj[key];
            }

            //以下是不区分大小写
            key = key.toString().toLowerCase();

            for (var name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }

        },



        /**
        * 给指定的 Url 添加一个查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且覆盖同名的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要添加的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回 'http://www.demo.com?a=1&b=2&c=3#hash'
            Url.setQueryString('http://www.demo.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://www.demo.com?a=3&b=2&d=4#hash'
            Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        addQueryString: function (url, key, value) {

            var $Object = require('Object');

            var qs = exports.getQueryString(url) || {}; //先取出原来的

            if (typeof key == 'object') {
                $Object.extend(qs, key);
            }
            else {
                qs[key] = value;
            }


            //过滤掉值为 null 的项
            var obj = {};

            for (var key in qs) {
                var value = qs[key];

                if (value === null) {
                    continue;
                }
                else {
                    obj[key] = value;
                }

            }

            return exports.setQueryString(url, obj);


        },


        /**
        * 给指定的 Url 添加一个随机查询字符串。
        * 注意，该方法会保留之前的查询字符串，并且添加一个键名为随机字符串而值为空字符串的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {number} [len] 随机键的长度。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回值类似 'http://www.demo.com?a=1&b=2&7A8CEBAFC6B4=#hash'
            Url.randomQueryString('http://www.demo.com?a=1&b=2#hash');  
            
            //返回值类似 'http://www.demo.com?a=1&b=2&7A8CE=#hash' 
            Url.randomQueryString('http://www.demo.com?a=1&b=2#hash', 5); //随机键的长度为 5
    
        */
        randomQueryString: function (url, len) {
            var $String = require('String');
            var key = $String.random(len);
            return exports.addQueryString(url, key, '');
        },



        /**
        * 把指定的 Url 和查询字符串组装成一个新的 Url。
        * 注意，该方法会删除之前的查询字符串。
        * @param {string} url 组装前的 url。
        * @param {string|Object} key 要设置的查询字符串的键。
            当传入一个 Object 对象时，会对键值对进行递归组合编码成查询字符串。
        * @param {string} [value] 要添加的查询字符串的值。
        * @retun {string} 返回组装后的新的 Url。
        * @example
            //返回 'http://www.demo.com?c=3#hash'
            Url.setQueryString('http://www.demo.com?a=1&b=2#hash', 'c', 3);  
            
            //返回 'http://www.demo.com?a=3&d=4#hash'
            Url.setQueryString('http://www.demo.com?a=1&b=2#hash', {a: 3, d: 4});  
        */
        setQueryString: function (url, key, value) {

            var $Object = require('Object');

            var type = typeof key;
            var isValueType = (/^(string|number|boolean)$/).test(type);

            var qs = '';

            if (arguments.length == 2 && isValueType) { //setQueryString(url, qs);
                qs = encodeURIComponent(key);
            }
            else {
                var obj = type == 'object' ? key : $Object.make(key, value);
                qs = $Object.toQueryString(obj);
            }



            var hasQuery = url.indexOf('?') > -1;
            var hasHash = url.indexOf('#') > -1;
            var a;

            if (hasQuery && hasHash) {
                a = url.split(/\?|#/g);
                return a[0] + '?' + qs + '#' + a[2];
            }

            if (hasQuery) {
                a = url.split('?');
                return a[0] + '?' + qs;
            }

            if (hasHash) {
                a = url.split('#');
                return a[0] + '?' + qs + '#' + a[1];
            }

            return url + '?' + qs;


        },

        /**
        * 判断指定的 Url 是否包含特定名称的查询字符串。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'b');  //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 false
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true); //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 true
        */
        hasQueryString: function (url, key, ignoreCase) {


            var obj = exports.getQueryString(url); //获取全部查询字符串的 Object 形式

            if (!obj) {
                return false;
            }

            var $Object = require('Object');
            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }

            if (key in obj) { //找到完全匹配的
                return true;
            }

            if (ignoreCase) { //明确指定了忽略大小写

                key = key.toString().toLowerCase();
                for (var name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }

            //区分大小写，但没找到
            return false;

        },


        /**
        * 获取指定 Url 的哈希中指定的键所对应的值。
        * @param {string} url 要进行获取的 Url 字符串。
        * @param {string} [key] 要检索的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写。 默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {string|Object|undefined} 返回一个查询字符串值。
            当不指定参数 key 时，则获取全部哈希值，对其进行 unescape 解码，
            然后返回一个等价的 Object 对象。
            当指定参数 key 为一个空字符串，则获取全部哈希(不解码)，返回一个 string 类型值。
        * @example
            Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'a');  //返回 '1'
            Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'c');  //返回 undefined
            Url.getHash('http://www.demo.com?query#a%3D1%26A%3D2', 'A');  //返回 2
            Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', 'A', true);//返回 1
            Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2', '');   //返回 'a%3D1%26b%3D2'
            Url.getHash('http://www.demo.com?query#a%3D1%26b%3D2');       //返回 {a: '1', b: '2'}
            Url.getHash('http://www.demo.com?query#a%3D%26b%3D');         //返回 {a: '', b: ''}
            Url.getHash('http://www.demo.com??query#a%26b');              //返回 {a: '', b: ''}
            Url.getHash('http://www.demo.com?query#a', 'a');              //返回 ''
        */
        getHash: function (url, key, ignoreCase) {

            var beginIndex = url.indexOf('#');
            if (beginIndex < 0) { //不存在查询字符串
                return;
            }

            var endIndex = url.length;

            var hash = url.slice(beginIndex + 1, endIndex);
            hash = unescape(hash); //解码

            if (key === '') { //获取全部 hash 的 string 类型
                return hash;
            }

            
            var $Object = require('Object');

            var obj = $Object.parseQueryString(hash);

            if (key === undefined) { //未指定键，获取整个 Object 对象
                return obj;
            }

            if (!ignoreCase || key in obj) { //区分大小写或有完全匹配的键
                return obj[key];
            }


            //以下是不区分大小写
            key = key.toString().toLowerCase();

            for (var name in obj) {
                if (name.toLowerCase() == key) {
                    return obj[name];
                }
            }
        },
        /**
        * 把指定的哈希设置到指定的 Url 上。
        * 该方法会对哈希进行 escape 编码，再设置到 Url 上，以避免哈希破坏原有的 Url。
        * 同时原有的哈希会移除掉而替换成新的。
        * @param {string} url 要设置的 url 字符串。
        * @param {string|number|boolean|Object} key 要设置的哈希的键。
            当传入一个 Object 对象时，会对键值对进行递归编码成查询字符串， 然后用 escape 编码来设置哈希。
            当传入的是一个 string|number|boolean 类型，并且不传入第三个参数， 则直接用 escape 编码来设置哈希。
        * @param {string} [value] 要添加的哈希的值。
        * @retun {string} 返回组装后的新的 Url 字符串。
        * @example
            //返回 'http://www.demo.com?#a%3D1'
            Url.setHash('http://www.demo.com', 'a', 1);  
            
            //返回 'http://www.demo.com?query#a%3D3%26d%3D4'
            Url.setHash('http://www.demo.com?query#a%3D1%26b%3D2', {a: 3, d: 4});  
    
            //返回 'http://www.demo.com?query#a%3D3%26d%3D4'
            Url.setHash('http://www.demo.com?query#a%3D1%26b%3D2', 'a=3&b=4'); 
            
        */
        setHash: function (url, key, value) {

            var $Object = require('Object');

            var type = typeof key;
            var isValueType = (/^(string|number|boolean)$/).test(type);


            var hash = '';

            if (arguments.length == 2 && isValueType) {
                hash = String(key);
            }
            else {
                var obj = type == 'object' ? key : $Object.make(key, value);
                hash = $Object.toQueryString(obj);
            }


            hash = escape(hash); //要进行编码，避免破坏原有的 Url

            var index = url.lastIndexOf('#');
            if (index > -1) {
                url = url.slice(0, index);
            }

            return url + '#' + hash;

        },



        /**
        * 判断指定的 Url 是否包含特定名称的查询字符串。
        * @param {string} url 要检查的 url。
        * @param {string} [key] 要提取的查询字符串的键。
        * @param {boolean} [ignoreCase=false] 是否忽略参数 key 的大小写，默认区分大小写。
            如果要忽略 key 的大小写，请指定为 true；否则不指定或指定为 false。
            当指定为 true 时，将优先检索完全匹配的键所对应的项；若没找到然后再忽略大小写去检索。
        * @retun {boolean} 如果 url 中包含该名称的查询字符串，则返回 true；否则返回 false。
        * @example
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'a');  //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'b');  //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'c');  //返回 false
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash', 'A', true); //返回 true
            Url.hasQueryString('http://www.demo.com?a=1&b=2#hash');       //返回 true
        */
        hasHash: function (url, key, ignoreCase) {
            
            var obj = exports.getHash(url); //获取全部哈希字符串的 Object 形式

            if (!obj) {
                return false;
            }

            var $Object = require('Object');

            if (!key) { //不指定名称，
                return !$Object.isEmpty(obj); //只要有数据，就为 true
            }

            if (key in obj) { //找到完全匹配的
                return true;
            }


            if (ignoreCase) { //明确指定了忽略大小写

                key = key.toString().toLowerCase();

                for (var name in obj) {
                    if (name.toLowerCase() == key) {
                        return true;
                    }
                }
            }

            //区分大小写，但没找到
            return false;

        }


    };

});


define('Url', function (require, module, exports) {
    return require('excore/Url');
});


