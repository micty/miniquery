


/**
* Cookie 工具
* @namespace
*/

define('Cookie', function (require, module, exports) {


    //缓存 toObject 中的结果
    var cookie$object = {
        'true': {},
        'false': {}
    };


    /**
    * 解析字符串描述的 expires 字段
    * @inner
    */
    var parseExpires = (function () {

        var $Date = require('Date');

        var reg = /^\d+([y|M|w|d|h|m|s]|ms)$/; //这里不要使用 /g

        var fns = {
            y: 'Year',
            M: 'Month',
            w: 'Week',
            d: 'Day',
            h: 'Hour',
            m: 'Minute',
            s: 'Second',
            ms: 'Millisecond'
        };

        //parseExpires = 
        return function (s) {

            var now = new Date();

            if (typeof s == 'number') {
                return $Date.addMilliseconds(now, s);
            }


            if (reg.test(s)) {
                var value = parseInt(s);
                var unit = s.replace(/^\d+/g, '');
                return $Date['add' + fns[unit] + 's'](now, value);
            }

            return $Date.parse(s);
        };


    })();



    module.exports = exports = { /**@lends MiniQuery.Cookie*/

        /**
        * 把一个 cookie 字符串解析成等价的 Object 对象。
        * @param {String} cookie 要进行解析的 cookie 字符串。
        * @param {boolean} [deep=false] 指定是否要进行深层次解析。
            如果要对 cookie 中的值进行查询字符串方式的深层次解析，请指定 true；
            否则请指定 false 或不指定。
        * @return {Object} 返回一个解析后的等价的 Object 对象。
        * @example 
            var obj = $.Cookie.toObject('A=1; B=2; C=a=100&b=200', true); //深层次解析
            //得到
            obj = {
                A: 1,
                B: 2,
                C: {
                    a: 100,
                    b: 200
                }
            };
    
            var obj = $.Cookie.toObject('A=1; B=2; C=a=100&b=200'); //浅解析
            //得到
            obj = {
                A: 1,
                B: 2,
                C: 'a=100&b=200'
            };
    
            $.Cookie.toObject('a=1; b=2');
            $.Cookie.toObject('a=1; b=2', true);
            $.Cookie.toObject();
            $.Cookie.toObject(true);
    
        */
        toObject: function (cookie, deep) {

            if (typeof cookie != 'string') { //此时为 toObject(true|false) 或 toObject()
                deep = cookie;
                cookie = document.cookie;
            }

            if (!cookie) {
                return {};
            }

            deep = !!deep; //转成 true|false，因为有以它为键的存储

            var obj = cookie$object[deep][cookie];
            if (obj) { //缓存中找到
                return obj;
            }


            obj = {};

            var $Object = require('Object');
            var $Array = require('Array');

            var parseQueryString = $Object.parseQueryString;

            $Array.each(cookie.split('; '), function (item, index) {

                var pos = item.indexOf('=');

                var name = item.slice(0, pos);
                name = decodeURIComponent(name);


                var value = item.slice(pos + 1);

                if (deep && value.indexOf('=') > -1) { //指定了深层次解析，并且还包含 '=' 号
                    value = parseQueryString(value); //深层次解析复合值
                }
                else {
                    value = decodeURIComponent(value);
                }


                if (name in obj) {
                    var a = obj[name];
                    if (a instanceof Array) {
                        a.push(value);
                    }
                    else {
                        obj[name] = [a, value]
                    }
                }
                else {
                    obj[name] = value;
                }

            });

            cookie$object[deep][cookie] = obj; //缓存起来

            return obj;
        },


        /**
        * 从当前 document.cookie 中获取指定名称和键所对应的值。
        * @param {boolean} [name] 要获取的项的名称。
            当不指定该参数时，全量返回 document.cookie 字符串。
        * @param {String} [key] 要获取的项的键。
            当不指定该参数时，返回参数 name 对应的项。
        * @return 返回指定项的值。
        * @example 
            $.Cookie.get();
            $.Cookie.get(true);
            $.Cookie.get('A');
            $.Cookie.get('A', true);
            $.Cookie.get('A', 'b');
        */
        get: function (name, key) {


            if (name === undefined) { //此时为 get()
                return exports.toObject(); //返回一个浅解析的全量 Object
            }

            if (name === true) { //此时为 get(true)
                return exports.toObject(true); //返回一个深解析的全量 Object
            }



            //下面的 name 为一个具体的值


            if (key === undefined) { //此时为 get(name)
                var obj = exports.toObject(); //浅解析
                return obj[name];
            }


            //下面的指定了 key

            var obj = exports.toObject(true); //深解析
            var value = obj[name];

            if (key === true) {
                return value;
            }

            //下面的 key 为一个具体的值

            if (value instanceof Array) { //同一个 name 得到多个值，主要是由于 path 不同导致的

                var $Array = require('Array');

                //过滤出含有 key 的 object 项
                var items = $Array.grep(value, function (item, index) {
                    return item &&
                        typeof item == 'object' &&
                        key in item;
                });

                if (items.length == 0) {
                    return;
                }

                if (items.length == 1) { //只有一个
                    return items[0][key];
                }

                return $Array.keep(items, function (item, index) {
                    return item[key];
                });
            }


            if (value && typeof value == 'object') {
                return value[key];
            }

        },


        /**
        * 给当前的 document.cookie 设置一个 Cookie。
        * @param {Document} document 要进行操作的 Document 对象。
        * @param {String} name 要设置的 Cookie 名称。
        * @param {String|Object} value 要设置的 Cookie 值。
            当传入一个 Object 对象时，会对它进行查询字符串的编码以获取一个 String 类型值。
        * @param {String|Number|Date} [expires] 过期时间。
            参数 expires 接受以下格式的字符串：
                y: 年
                M: 月
                w: 周
                d: 天
                h: 小时
                m: 分钟
                s: 秒
                ms: 毫秒
            或传入一个 $.Date.parse 识别的格式字符串，并会被解析成一个实际的日期实例。
        * @example 
            //设置一个 A=100 的 Cookie，过期时间为12天后
            $.Cookie.set('A', 100, '12d'); 
    
            //设置一个 B=200 的 Cookie，过期时间为2周后
            $.Cookie.set('B', 200, '2w'); 
    
            //设置一个 C=300 的 Cookie，过期时间为 '2014-9-10'
            $.Cookie.set('C', 300, '2014-9-10'); 
    
            $.Cookie.set({
                name: 'A',
                value: 100,
                expires: '2w',
                path: '/',
                domain: 'localhost',
                secure: true
            });
        */
        set: function (name, value, expires, path, domain, secure) {

            var $Object = require('Object');


            if ($Object.isPlain(name)) { // 此时为 set({ ... });
                var config = name;
                name = config.name;
                value = config.value;
                expires = config.expires;
                path = config.path;
                domain = config.domain;
                secure = config.secure;
            }

            name = encodeURIComponent(name);
            if (!name) { // 空字符串
                throw new Error('参数 name 不能为空字符串');
            }


            if ($Object.isPlain(value)) {
                value = $Object.toQueryString(value);
            }
            else {
                value = encodeURIComponent(value);
            }

            var cookie = name + '=' + value + '; ';

            if (expires) {
                expires = parseExpires(expires);
                cookie += 'expires=' + expires.toGMTString() + '; '; //不推荐使用 toGMTString 方法
            }

            if (path) {
                cookie += 'path=' + path + '; ';
            }

            if (domain) {
                cookie += 'domain=' + domain + '; ';
            }

            if (secure) {
                cookie += 'secure';
            }

            document.cookie = cookie;
        },


        /**
        * 从当前的 document.cookie 中移除指定名称的 Cookie。
        * @param {String} [name] 要移除的 Cookie 的名称。
            当不指定参数 name 时，则会把所有的 Cookie 都移除。
        * @example 
            //给 document 名称为 A 的 Cookie 移除
            $.Cookie.remove(document, 'A'); 
    
            //把 document 的所有 Cookie 都移除
            $.Cookie.remove(document); 
        */
        remove: function (name, path, domain, secure) {

            var $Object = require('Object');

            var config = $Object.isPlain(name) ? name : {
                name: name,
                path: path,
                domain: domain,
                secure: secure
            };

            config.expires = new Date(0);

            name = config.name;

            if (name === undefined) { //未指定名称，则全部移除
                var obj = exports.toObject();
                $Object.each(obj, function (name, value) {
                    config.name = name;
                    exports.set(config);
                });

                return;
            }

            exports.set(config);

        }


    };

});



