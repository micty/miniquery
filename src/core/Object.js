

/**
* @fileOverview 对象工具
*/



/**
* 对象工具
* @class
* @param {Object} obj 要进行包装的对象
* @return {MiniQuery.Object} 返回一个经过包装后的 MiniQuery.Object 对象
* @example
    $.Object( {a:1, b:2} );
或  new $.Object( {a:1, b:2} );
*/
MiniQuery.Object = function (obj) {
    return new MiniQuery.Object.prototype.init(obj);
};



; (function ($, This) {





$.extend(This, { /**@lends MiniQuery.Object */


    /**
    * 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
    * @function
    * @param {Object} arguments[0] 要进行扩展的对象 
    * @param {Object} arguments[1] 要进行复制的第1个对象
    * @param {Object} arguments[n] 要进行复制的第n个对象，依次类推
    * @return {Object} 返回被扩展的对象，即第一个参数。
        如果参数为空，则返回 {}。
        如果只有一个参数，则直接返回该参数。
        否则：把第二个参数到最后一个参数的成员拷贝到第一个参数对应中去，并返回第一个参数。
    * @example 
        var obj = {
            a: 1, 
            b: 2
        };
        var obj2 = $.Object.extend(obj, {b:3}, {c:4});
        //结果：
        obj = {a:1, b:3, c:4}; 
        //并且 
        obj === obj2 //为 true
    */
    extend: $.extend,

    /**
    * 用一种安全的方式来扩展对象。
    * 当目标对象不存在指定的成员时，才给该目标对象添加(扩展)该成员。
    */
    extendSafely: function () {
        var len = arguments.length;
        if (len == 0) {
            return null;
        }

        var target = arguments[0];
        if (len == 1) {
            return target;
        }

        for (var i = 1; i < len; i++) {
            var obj = arguments[i];

            for (var key in obj) {
                if (key in target) //目标对象中已含有该成员，略过
                {
                    continue;
                }

                //否则，添加
                target[key] = obj[key];
            }
        }

        return target;
    },

    /**
    * 用多个对象深度扩展一个对象。
    */
    extendDeeply: function (target, obj1, obj2) {

        function fn(A, B) {
            A = A || {};

            for (var key in B) {
                var value = B[key];

                if (This.isPlain(value)) {
                    value = fn(A[key], value);
                }

                A[key] = value;
            }

            return A;
        }


        //针对最常用的情况作优化
        if (obj1 && typeof obj1 == 'object') {
            target = fn(target, obj1);
        }

        if (obj2 && typeof obj2 == 'object') {
            target = fn(target, obj2);
        }

        var startIndex = 3;
        var len = arguments.length;
        if (startIndex >= len) { //已处理完所有参数
            return target;
        }

        //更多的情况
        for (var i = startIndex; i < len; i++) {
            var objI = arguments[i];
            target = fn(target, objI);
        }

        return target;

    },


    /**
    * 深度克隆一个纯对象或数组。
    * @param {Object|Array} obj 要进行克隆的对象或数组。
        如果 obj 是数组，则返回一个拷贝数组，并且会对数组中的每项调用 clone 。
        如果 obj 不是纯对象，则直接返回该对象，不进行克隆。
    * @return {Object|Array} 克隆后的对象或数组。
    * @example
        var obj = {a: 1, b: 2, c: {a: 10, b: 20} };
        var obj2 = $.Object.clone( obj );
        console.dir( obj2 );          //与 obj 一致
        console.log( obj2 === obj );  //false
    */
    clone: function (obj) {

        var clone = arguments.callee;

        var $ = MiniQuery;

        if (This.isArray(obj)) {
            return $.Array.keep(obj, function (item, index) {
                //优化，避免再次进入 clone 方法
                if (!item || This.isValueType(item) || !This.isPlain(item)) {
                    return item;
                }

                return clone(item);
            });
        }

        // null、undefined、0、NaN、false、''
        // 值类型：string、number、boolean
        // 非纯对象
        if (!obj || This.isValueType(obj) || !This.isPlain(obj)) {
            return obj;
        }


        var target = {};

        for (var key in obj) {

            var value = obj[key];

            switch (typeof value) {
                case 'string':
                case 'number':
                case 'boolean':
                case 'function':
                case 'undefined':
                    target[key] = value;
                    break;

                case 'object':
                    target[key] = clone(value);   //递归调用
                    break;
                
            }
        }

        return target;
    },

    /**
    * 对一个对象进行迭代。
    * 该方法可以代替 for in 的语句。
    * 只有在回调函数中明确返回 false 才停止循环。
    * @param {Object} obj 要进行迭代处理的对象
    * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
    * @param {boolean} [isDeep=false] 
        指示是否要进行深层次的迭代，如果是，请指定 true；
        否则请指定 false 或不指定。默认为 false，即浅迭代
    * @example
        var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
        $.Object.each(obj, function(key, value) {
            console.log(key, ': ', value);
        }, true);
    输出：
        a: 1,
        b: 2,
        A: 11,
        B: 22
    */
    each: function (obj, fn, isDeep) {

        var each = arguments.callee;

        for (var key in obj) {
            var value = obj[key];

            //指定了深迭代，并且当前 value 为非 null 的对象
            if (isDeep === true && value && typeof value == 'object') {
                each(value, fn, true); //递归
            }
            else {
                // 只有在 fn 中明确返回 false 才停止循环
                if (fn(key, value) === false) {
                    break;
                }
            }
        }
    },

    /**
    * 获取一个对象的真实类型的字符串描述。
    * @param obj 要检测的对象，可以是任何类型。
    * @return {String} 返回该对象的类型的字符串描述。
        当参数为 null、undefined 时，返回 null、undefined；<br />
        当参数为 string、number、boolean 的值类型时，返回 string、number、boolean；<br />
        否则返回参数的实际类型的字符串描述(构造函数的名称)：<br />
        如 Array、String、Number、Boolean、Object、Function、RegExp、Date 等
    * @example
        $.Object.getType();         //'undefined'
        $.Object.getType(null);     //'null'
        $.Object.getType('hello');  //'string'
        $.Object.getType(100);      //'number'
        $.Object.getType(false);    //'boolean'
        $.Object.getType({});       //'Object'
        $.Object.getType(function(){});//'Function'
        $.Object.getType([0, 1, 2]);   //'Array'
    */
    getType: function (obj) {
        return obj === null ? 'null' :
            obj === undefined ? 'undefined' :

            //处理值类型
            typeof obj == 'string' ? 'string' :
            typeof obj == 'number' ? 'number' :
            typeof obj == 'boolean' ? 'boolean' :

            //处理对象类型、包装类型
            Object.prototype.toString.call(obj).slice(8, -1); //去掉 "[object" 和 "]"
    },

    /**
    * 判断一个对象是否为数组类型。<br />
    * 注意：如果是跨窗口取得的数组，请使用非严格判断。<br />
    * 由于 IE 的兼容性问题，对于跨窗口取得的数组，请在使用其实例方法之前把它转成真正的数组，否则会报错。
    * @param {Object} obj 要进行判断的对象，可以是任何类型
    * @param {boolean} [useStrict] 指定是否要进行严格判断，如果是请传入 true；否则当成非严格判断
    * @return {boolean} 一个判断结果，如果为数组则返回 true；否则返回 false
    * @example
        $.Object.isArray([]) //true
        $.Object.isArray({}) //false
    */
    isArray: function (obj, useStrict) {
        if (useStrict === true) { //指定了要严格判断
            return obj instanceof Array;
        }

        //高端浏览器，如 IE9+、Firefox 4+、Safari 5+、Opera 10.5+ 和 Chrome
        if (typeof Array.isArray == 'function') { //优先使用原生的
            return Array.isArray(obj);
        }

        //加上 obj instanceof Array 并且优先检测，是为了优化，也是为了安全起见。
        return (obj instanceof Array) ||
            (This.getType(obj) == 'Array');
    },

    /**
    * 判断一个对象是否为字符串字类型。
    * @param {Object} obj 要进行判断的对象，可以是任何类型。
    * @return {boolean} 一个判断结果，如果为字符串则返回 true；否则返回 false。
    * @example
        $.Object.isString( new String(100) ) //false
        $.Object.isString( '100' ) //true
    */
    isString: function (obj) {
        return typeof obj == 'string';
    },

    /**
    * 判断一个对象是否为数字类型。
    * @param {Object} obj 要进行判断的对象，可以是任何类型。
    * @return {boolean} 一个判断结果，如果为数字则返回 true；否则返回 false。
    * @example
        $.Object.isNumber( new Number(100) ) //false
        $.Object.isNumber( 100 ) //true
    */
    isNumber: function (obj) {
        return typeof obj == 'number';
    },

    /**
    * 判断一个对象是否为函数类型。
    * @param {Object} obj 要进行判断的对象，可以是任何类型。
    * @return {boolean} 一个判断结果，如果为函数则返回 true；否则返回 false。
    * @example
        $.Object.isFunction([]) //false
        $.Object.isFunction(function(){}) //true
    */
    isFunction: function (obj) {
        return typeof obj == 'function';
    },


    /**
    * 判断一个对象是否为内置类型。<br />
    * 内置类型是指 String, Number, Boolean, Array, Date, RegExp, Function。
    * @param {Object} obj 要进行判断的对象，可以是任何类型
    * @return {boolean} 一个判断结果，如果为内置类型则返回 true；否则返回 false
    * @example
        $.Object.isBuiltinType( 100 );   //false
        $.Object.isBuiltinType( new Number(100) ); //true
        $.Object.isBuiltinType( {} );    //false
        $.Object.isBuiltinType( [] );    //true
    */
    isBuiltinType: function (obj) {
        var types = [String, Number, Boolean, Array, Date, RegExp, Function];

        for (var i = 0, len = types.length; i < len; i++) {
            if (obj instanceof types[i]) {
                return true;
            }
        }

        return false;
    },


    /**
    * 检测对象是否是空对象(不包含任何属性)。<br />
    * 该方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用 hasOwnProperty )。<br />
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为空对象则返回 true；否则返回 false
    * @example
        $.Object.isEmpty( {} );      //true
        
        function Person(){ }
        Person.prototype.name = 'abc';
        var p = new Person();
        $.Object.isEmpty( p );   //false
    */
    isEmpty: function (obj) {
        for (var name in obj) {
            return false;
        }

        return true;
    },



    /**
    * 检测一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为纯粹的对象则返回 true；否则返回 false
    * @example
        $.Object.isPlain( {} );             //true
        $.Object.isPlain( {a: 1, b: {} } );  //true
        
        function Person(){ }
        var p = new Person();
        $.Object.isPlain( p );   //false
    */
    isPlain: function (obj) {
        if (!obj || typeof obj != 'object' /*|| obj.nodeType || This.isWindow(obj) */ ) {
            return false;
        }

        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var constructor = obj.constructor;

        try {
            // Not own constructor property must be Object
            if (constructor &&
                !hasOwnProperty.call(obj, "constructor") &&
                !hasOwnProperty.call(constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        }
        catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {
        }

        return key === undefined || hasOwnProperty.call(obj, key);
    },

    /**
    * 判断一个对象是否为值类型。<br />
    * 即 typeof 的结果是否为 string、number、boolean 中的一个。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为 值类型则返回 true；否则返回 false
    * @example
        $.Object.isValueType(100);              //true
        $.Object.isValueType( new Number(100) );//false
    */
    isValueType: function (obj) {
        //不要用这种，否则在 rhino 的 js 引擎中会不稳定
        //return (/^(string|number|boolean)$/g).test(typeof obj); 
        var type = typeof obj;
        return type == 'string' || type == 'number' || type == 'boolean';
    },




    /**
    * 判断一个对象是否为包装类型。<br />
    * 包装类型是指 String, Number, Boolean 的 new 的实例。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果包装类型则返回 true；否则返回 false
    * @example
        console.log( $.Object.isWrappedType(100) ); //false
        console.log( $.Object.isWrappedType( new Number(100) ) );  //true
        console.log( $.Object.isWrappedType('abc') );  //false
        console.log( $.Object.isWrappedType( new String('abc') ) );  //true
        console.log( $.Object.isWrappedType(true) );  //false
        console.log( $.Object.isWrappedType( new Boolean(true) ) );  //true
    */
    isWrappedType: function (obj) {
        var types = [String, Number, Boolean];
        for (var i = 0, len = types.length; i < len; i++) {
            if (obj instanceof types[i]) {
                return true;
            }
        }

        return false;
    },

    /**
    * 判断一个对象是否为非空的对象。
    * 非空对象是指 typeof 结果为 object 或 function，并且不是 null。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果是非空的对象则返回 true；否则返回 false。
    * @example
        console.log( $.Object.isNonNull( null ) );  //false
        console.log( $.Object.isNonNull( {} ) );  //true
        console.log( $.Object.isNonNull(100) ); //false
        console.log( $.Object.isNonNull( new Number(100) ) );  //true
        console.log( $.Object.isNonNull('abc') );  //false
        console.log( $.Object.isNonNull( new String('abc') ) );  //true
        console.log( $.Object.isNonNull(true) );  //false
        console.log( $.Object.isNonNull( new Boolean(true) ) );  //true
    */
    isNonNull: function (obj) {
        if (!obj) { //false、null、undefined、''、NaN、0
            return false;
        }

        var type = typeof obj;
        return type == 'object' || type == 'function';
    },


    /**
    * 一个简单的方法来判断一个对象是否为 window 窗口。
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为 window 窗口则返回 true；否则返回 false
    * @example
        $.Object.isWindow( {} ); //false
        $.Object.isWindow(top);  //true
    */
    isWindow: function (obj) {
        return obj &&
            typeof obj == 'object' &&
            'setInterval' in obj;
    },

    /**
    * 一个简单的方法来判断一个对象是否为 document 对象。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为  document 对象则返回 true；否则返回 false
    * @example
        $.Object.isDocument( {} );      //false
        $.Object.isDocument(document);  //true
    */
    isDocument: function (obj) {
        return obj &&
            typeof obj == 'object' &&
            'getElementById' in obj;
    },
    


    /**
    * 对象映射转换器，返回一个新的对象。
    * @param {Object} obj 要进行迭代处理的对象
    * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
    * @param {boolean} [isDeep=false] 指示是否要进行深层次的迭代。
        如果是，请指定 true；
        否则请指定 false 或不指定。
        默认为 false，即浅迭代
    * @return {Object} 返回一个新的对象，key 仍为原来的 key，value 由回调函数得到
    * @example
        var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
        var obj2 = $.Object.map(obj, function(key, value) {
            return value * 100;
        }, true);
        console.dir(obj2);
    结果：
        obj2 = {a: 100, b: 200, c: {A: 1100, B: 2200}};
    */
    map: function (obj, fn, isDeep) {
        var map = arguments.callee; //引用自身，用于递归
        var target = {};

        for (var key in obj) {
            var value = obj[key];

            if (isDeep && This.isPlain(value)) { //指定了深迭代，并且当前 value 为纯对象
                target[key] = map(value, fn, isDeep); //递归
            }
            else {
                target[key] = fn(key, value);
            }
        }

        return target;
    },


    /**
    * 给指定的对象快速创建多层次的命名空间，返回创建后的最内层的命名空间所指的对象。
    * @param {Object} [arg0=global] 
        要在其上面创建命名空间的对象容器。当不指定时，则默认为当前的 global 对象。
    * @param {string} arg1 命名空间，以点号进行分隔
    * @param {Object} arg2 命名空间最终指向的对象
    * @return {Object} 返回创建后的最内层的命名空间所指的对象
    * @example
        //给 obj 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
        $.Object.namespace(obj, 'A.B.C', {a:1, b:2});
        console.dir( obj.A.B.C ); //结果为 {a:1, b:2}
        
        //给当前的 global 对象创建一个 A.B.C 的命名空间，其值为 {a:1, b:2}
        $.Object.namespace('A.B.C', {a:1, b:2});
        console.dir( A.B.C ); //结果为 {a:1, b:2}
        
        //给当前的 global 象分别创建一个 $.AA 和 $.BB 的命名空间，其值为分别 source.A 和 source.B
        $.Object.namespace(source, {
            'A': '$.AA', //source.AA -> $.A
            'B': '$.BB'  //source.BB -> $.B
        });
        
        //给 obj 对象分别创建 obj.A 和 obj.B 命名空间，其值分别为  source.A 和 source.B
        $.Object.namespace(obj, source, ['A', 'B']);
    * 
    */
    namespace: function (arg0, arg1, arg2) {

        //这个是最原始的方式：This.namespace(obj, 'A.B.C', {a:1, b:2});
        function fn(container, path, value) {
            var list = path.split('.'); //路径
            var obj = container;

            var len = list.length;      //路径长度
            var lastIndex = len - 1;    //路径中最后一项的索引

            var isGet = value === undefined; //指示是否为取值操作，当不指定 value 时，则认为是取值操作

            for (var i = 0; i < len; i++) //迭代路径
            {
                var key = list[i];

                //是获取操作，但不存在该级别
                if (isGet && !(key in obj) ) {
                    return; //退出，避免产生副作用(创建对象)
                }

                if (i < lastIndex) {
                    obj[key] = obj[key] || {};
                    obj = obj[key]; //为下一轮做准备
                }
                else //最后一项
                {
                    if (value === undefined) //不指定值时，则为获取
                    {
                        return obj[key];
                    }

                    //指定了值
                    obj[key] = value; //全量赋值

                }
            }

            return value;
        }

        //此时为最原始的
        //This.namespace(container, 'A.B.C', value );
        if (typeof arg1 == 'string') {
            var container = arg0;
            var path = arg1;
            var value = arg2;

            return fn(container, path, value);
        }

        //此时为
        //This.namespace('A.B.C', value)
        if (typeof arg0 == 'string') {
            var container = global;
            var path = arg0;
            var value = arg1;

            return fn(container, path, value);
        }


        /*
        此时为：
            This.namespace(source, {
                'Object': '$.Object',   //source.Object -> $.Object
                'Array': '$.Array'      //source.Array -> $.Array
            });
        要实现的功能：
            $.Object = source.Object;
            $.Array = source.Array;
        */
        if (This.isPlain(arg1) && arg2 === undefined) {
            //换个名称更容易理解
            var source = arg0;      //此时第一个参数为要被遍历拷贝的对象 source
            var maps = arg1;        //此时第二个参数为键值对映射表 maps
            var container = global; //此时目标容器为当前的 global

            //遍历映射表
            This.each(maps, function (key, path) {
                if (typeof path != 'string') {
                    throw new Error('当指定第二个参数为键值对映射表时，值必须为 string 类型');
                }

                var value = source[key];
                fn(container, path, value);
            });

            return container;
        }

        //
        /*
        此时为： 
            This.namespace(container, source, ['Object', 'Array']);
        要实现的功能：
            container.Object = source.Object;
            container.Array = source.Array;    
        */
        if (This.isArray(arg2)) {
            //换个名称更容易理解
            var container = arg0;   //此时第一个参数为目标容器 container
            var source = arg1;      //此时第二个参数为要被遍历拷贝的对象 source
            var keys = arg2;        //此时第三个参数是要拷贝的键列表

            //遍历键列表
            $.Array.each(keys, function (key) {
                container[key] = source[key];
            });

            return container;
        }
    },

    /**
    * 把 JSON 字符串解析成一个 Object 对象。
    * 该方法是 jQuery 的实现。
    * @param {String} data 要进行解析的 JSON 字符串
    * @return {Object} 返回一个等价的对象
    */
    parseJson: function (data) {
        if (typeof data !== "string" || !data) {
            return null;
        }

        data = $.String.trim(data);

        if (global.JSON && global.JSON.parse) //标准方法
        {
            return global.JSON.parse(data);
        }

        var rvalidchars = /^[\],:{}\s]*$/,
            rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

        data = data.replace(rvalidescape, '@')
                   .replace(rvalidtokens, ']')
                   .replace(rvalidbraces, '');

        if (!rvalidchars.test(data)) {
            throw new Error('非法的 JSON 数据: ' + data);
        }

        return (new Function('return ' + data))();
    },


    /**
    * 把 Url 中的查询字符串解析为等价结构的 Object 对象。
    * @param {string} url 要进行解析的查询字符串。
    * @param {boolean} [isShallow=false] 指示是否使用浅层次进行解析。
        当显式指定 isShallow 参数为 true 时，则使用浅层次来解析(只解析一层，不进行递归解析)；
        否则(默认)使用深层次解析。
    * @param {boolean} [isCompatible=false] 指示是否使用兼容模式进行解码。
        当指定 isCompatible 参数为 true 时，将使用 unescape 来编码；
        否则(默认)使用 decodeURIComponent。
    * @return {Object} 返回一个包含键值对的 Object 对象。
        当参数 url 非法时，返回空对象 {}。
    * @example
        var url = 'a=1&b=2&c=A%3D100%26B%3D200';
        var obj = $.Object.parseQueryString(url);
    得到 obj = {a: 1, b:2, c: {A: 100, B: 200}};
    */
    parseQueryString: function (url, isShallow, isCompatible) {

        if (!url || typeof url != 'string') {
            return {}; //这里不要返回 null，免得外部调用出错
        }

        var fn = arguments.callee;
        var decode = isCompatible ? unescape : decodeURIComponent;  //解码方法，默认用后者
        var isDeep = !isShallow;    //深层次解析，为了语义上更好理解，换个名称
        var toValue = $.String.toValue; //缓存一下方法，以提高循环中的性能


        var obj = {};

        var pairs = url.split('&');

        for (var i = 0, len = pairs.length; i < len; i++) {

            var name_value = pairs[i].split('=');

            var name = decode(name_value[0]);
            var value = name_value.length > 1 ? decode(name_value[1]) : ''; //后者针对没有'='号的情况

            //深层次解析
            if (isDeep && value.indexOf('=') > 0) { //还出现=号，说明还需要进一层次解码
                value = fn(value); //递归调用
            }
            else { //处理一下字符串类型的 0|1|true|false|null|undefined|NaN
                value = toValue(value); //还原常用的数据类型
            }

            if (name in obj) {
                var a = obj[name];
                if (a instanceof Array) {
                    a.push(value);
                }
                else {
                    obj[name] = [a, value];
                }
            }
            else {
                obj[name] = value;
            }
        }

        return obj;
    },


    /**
    * 删除对象中指定的成员，返回一个新对象。
    * 指定的成员可以以单个的方式指定，也可以以数组的方式指定(批量)。
    * @param {Object} obj 要进行处理的对象。
    * @param {String|Array|Object} keys 要删除的成员名称，可以是单个，也可以是批量。
    * @return {Object} 返回一个被删除相应成员后的新对象。
    * @example
        var obj = {
            a: 1, 
            b: 2, 
            c: 3
        };

        var o = $.Object.remove(obj, ['a', 'c']); //移除成员 a 和 c 
        console.dir(o); //得到 o = { b: 2 };

        o = $.Object.remove(obj, {a: 1, b: 2});
        console.dir(o); //得到 o = { c: 3 };
    */
    remove: function (obj, keys) {
        var target = This.extend({}, obj); //浅拷贝一份

        if (typeof keys == 'string') {
            delete target[keys];
        }
        else if (This.isArray(keys)) {
            for (var i = 0, len = keys.length; i < len; i++) {
                delete target[keys[i]];
            }
        }
        else {
            for (var key in keys) {
                delete target[key];
            }
        }

        return target;
    },


    /**
    * 用一组指定的名称-值对中的值去替换指定名称对应的值。
    * 当指定第三个参数为 true 时，将进行第一层次的搜索与替换，否则替换所有同名的成员为指定的值
    */
    replaceValues: function (target, nameValues, isShallow) {
        for (var key in target) {
            var val = target[key];
            switch (typeof val) {
                case 'string':
                case 'number':
                case 'boolean':
                    for (var name in nameValues) {
                        if (key == name) {
                            target[key] = nameValues[name];
                            break;
                        }
                    }
                    break;
                case 'object':
                    !isShallow && arguments.callee(val, nameValues);
                    break;
            }
        }
        return target;
    },




    /**
    * 把一个 Object 对象转成一个数组。
    * @param {Object} obj 要进行转换的对象
    * @param {Array|boolean|function} [rule=undefined] 转换映射规则。<br />
    *   当未指定参数 rule 时，则使用 for in 迭代收集 obj 中的值，返回一个一维的值数组；<br />
    *   当指定参数 rule 为一个数组时，则按 rule 中的顺序迭代收集 obj 中的值，返回一个一维的值的数组；<br />
    *   当指定参数 rule 为 true 时，则使用 for in 迭代收集 obj 中的名称和值，返回一个[key, value] 的二维数组，<br />
    *       即该数组中的每一项的第0个元素为名称，第1个元素为值。<br />
    *   当指定参数 rule 为一个处理函数时，将使用该处理函数的返回值作为收集到数组的值，<br />
    *       处理函数会接收到两个参数：该对象迭代的 key 和 value。<br />
    *       当返回值为 null 时，将忽略它（相当于 continue）；<br />
    *       当返回值为 undefined 时，将停止迭代（相当于 break）；<br />
    * @param {boolean} [isDeep=false] 指定是否递归处理。
        若要递归转换，请指定 true；否则请指定 false 或不指定
    * @return 返回一个数组
    * @example
        var obj = { 
            a: 1, 
            b: 2, 
            c: {
                A: 100, 
                B: 200, 
                C: {
                    aa: 'a', 
                    bb: 'b'
                } 
            } 
        };
        
        var a = $.Object.toArray(obj, null, true);
        console.dir(a);
        
        var b = $.Object.toArray(obj, ['b', 'c', 'a']);
        console.dir(b);
        
        var c = $.Object.toArray(obj, true, true);
        console.dir(c);
        
        var d = $.Object.toArray(obj, function(key, value) {
            return value + 1000;
        }, true);
        
        console.dir(d);
    * 
    */
    toArray: function (obj, rule, isDeep) {

        var toArray = arguments.callee; //引用自身，用于递归

        if (!rule) //未指定 rule: undefined|null|false
        {
            return This.getValues(obj, isDeep);
        }

        //否则，指定了 rule 转换规则。

        // 传进来的是一个 key 数组
        if (rule instanceof Array) {
            //注意，这里不要用 $.Array.map 来过滤，
            //因为 map 会忽略掉 null 和 undefined 的值，这是不合适的

            var keys = rule; //换个名称更好理解
            var a = [];

            for (var i = 0, len = keys.length; i < len; i++) //此时没有深迭代，因为 keys 只用于第一层
            {
                var value = obj[keys[i]]; //取得当前 key 所对应的 value
                a.push(value); // keys[i] -> key -> value
            }

            return a;
        }

        //指定了保留 key，则返回一个二维数组
        if (rule === true) {
            var a = [];
            for (var key in obj) {
                var value = obj[key];
                if (isDeep === true && value && typeof value == 'object') {
                    value = toArray(value, rule, isDeep);
                }
                a.push([key, value]);
            }

            return a; //此时为 [ [key, value], [key, value], ... ]
        }

        //传进来的是处理函数
        if (typeof rule == 'function') {
            var fn = rule;
            var a = [];

            for (var key in obj) {
                var value = obj[key];

                if (isDeep === true && value && typeof value == 'object') {
                    value = toArray(value, rule, isDeep);
                }
                else {
                    value = fn(key, value); //调用处理函数以取得返回值
                }

                if (value === null) {
                    continue;
                }

                if (value === undefined) {
                    break;
                }

                a.push(value);
            }

            return a;
        }
    },

    /**
    * 把一个对象转成 JSON 字符串
    * @param {Object} obj 要进行转换的对象
    * @return {String} 返回一个 JSON 字符串
    */
    toJson: function (obj) {

        if (global.JSON) {
            var fn = function (obj) {
                return global.JSON.stringify(obj);
            };

            This.toJson = fn; //重写
            return fn(obj);
        }



        if (obj == null) { // null 或 undefined
        
            return String(obj);
        }

        switch (typeof obj) {
            case 'string':
                return '"' + obj + '"';
            case 'number':
            case 'boolean':
                return obj;
            case 'function':
                return obj.toString();
        }

        //处理包装类和日期
        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
            return arguments.callee(obj.valueOf());
        }

        //处理正则表达式
        if (obj instanceof RegExp) {
            return arguments.callee(obj.toString());
        }

        //处理数组
        if (This.isArray(obj)) {
            var list = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                list.push(arguments.callee(obj[i]));
            }

            return '[' + list.join(', ') + ']';
        }

        var pairs = [];
        for (var name in obj) {
            pairs.push('"' + name + '": ' + arguments.callee(obj[name]));
        }
        return '{ ' + pairs.join(', ') + ' }';
    },


    /**
    * 把一个对象编码成等价结构的 Url 查询字符串。
    * @param {Object} obj 要进行编码的对象
    * @param {boolean} [isCompatible=false] 
        指定是否要使用兼容模式进行编码。<br />
        当需要使用 escape 进行编码时，请指定 true；<br />
        否则要使用 encodeURIComponent 进行编码，请指定 false 或不指定。
    * @return {string} 返回一个经过编码的 Url 查询字符串
    * @example
        var obj = {
            a: 1,
            b: 2,
            c: { A: 100, B: 200 },
            d: null,
            e: undefined,
            f: ['a', 'b', 'c']
        };
        var s = $.Object.toQueryString(obj);
        console.log(s); 
        //结果 a=1&b=2&c=A%3D100%26B%3D200&d=null&e=undefined&f=%5Ba%2C%20b%5D
    */
    toQueryString: function (obj, isCompatible) {

        if (obj == null) {     // null 或 undefined
            return String(obj);
        }

        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return obj;
        }

        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date) {
            return obj.valueOf();
        }

        if (This.isArray(obj)) {
            return '[' + obj.join(', ') + ']';
        }

        var fn = arguments.callee;
        var encode = isCompatible ? escape : encodeURIComponent;

        var pairs = [];
        for (var name in obj) {
            pairs.push(encode(name) + '=' + encode(fn(obj[name])));
        }

        return pairs.join('&');

    },



    /**
    * 删除对象的成员中值为指定的值列表中的成员，返回一个新对象。
    * @param {Object} obj 要进行处理的对象
    * @param {Array} [values=[undefined, null]] 要进行删除的值的列表。
        只要成员中包含该列表中的值，就会给删除。
        默认会删除值为 undefined 和 null 的成员。
    * @param {boolean} [isDeep=false] 指定是否深层次(递归)搜索。
        如果要深层次搜索，请指定 true；
        否则，请指定 false 或不指定。
    * @return {Object} 返回一个经过删除成员的新对象。
        该对象中不包含值为指定的值列表中的项的成员。
    * @example
        var d = {
            A: 11, 
            B: null, 
            C: undefined,
            D: '0'
        };
        var obj = {
            a: 1, 
            b: null, 
            c: undefined, 
            d: d
        };
        var obj2 = $.Object.trim(obj, [null, undefined, '0'], true );
        
        console.dir(obj);   //结果没变
        console.dir(obj2);  //结果为 {a: 1, d: {AA: 11}}
        console.dir(d);     //结果没变
        console.log(obj.d === d); //true
    */
    trim: function (obj, values, isDeep) {

        if (!values && !isDeep) { //针对最常用的情况 trim(obj) 作优化
            var target = {};

            for (var key in obj) {
                var value = obj[key];
                if (value == null) { // undefined、null
                    continue;
                }

                target[key] = value;
            }

            return target;
        }


        var trim = arguments.callee; //引用自身，递归要用到
        var contains = $.Array.contains;  //缓存一下，提高循环中的性能
        var extend = This.extend;     //缓存一下，提高循环中的性能

        if (typeof values == 'boolean') { //重载 trim(obj, isDeep);
            isDeep = values;
            values = undefined;
        }

        if (!values) {
            values = [null, undefined];
        }

        var target = extend({}, obj); //浅拷贝一份

        for (var key in target) {
            var value = target[key];

            if (contains(values, value)) {
                delete target[key]; //注意，这里不能用 delete value
                continue;
            }

            if (isDeep === true && typeof value == 'object' && value) {
                value = extend({}, value);          //浅拷贝一份
                target[key] = trim(value, values, true);  //递归
            }
        }

        return target;
    },

    /**
    * 跨浏览器的 Object.create 方法。
    * 该方法会优化使用原生的 Object.create 方法，当不存在时，才使用自己的实现。
    * @example
        var obj = $.Object.create({
            name: 'micty',
            sayHi: function() {
                console.log( this.name );
            }
        });
    
        obj.sayHi();
    */
    create: function (obj) {
        //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
        var fn = typeof Object.create === 'function' ? Object.create : function (obj) {
            function F() {
            }

            F.prototype = obj;
            F.prototype.constructor = F;

            return new F();
        }

        This.create = fn;

        return fn(obj);
    },

    /**
    * 对一个对象进行成员过滤，返回一个过滤后的新对象。
    * 该方法可以以某个模板对指定对象进行成员拷贝。
    * @param {Object} src 要进行拷贝的对象，即数据来源。
    * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
    * @return {Object} 返回一个过滤后的新对象。
    * @example
        var src = {
            a: 100,
            b: 200,
            c: 300,
            d: 400
        };

        var samples = {
            a: 1,
            b: 2
        };

        //或 samples = ['a', 'b'];

        var obj = $.Object.filter(src, samples);
        console.dir(obj); //得到 obj = { a: 100, b: 200 }; 只保留 samples 中指定的成员，其他的去掉.
    */
    filter: function (src, samples) {

        var obj = {};

        if (This.isArray(samples)) {
            $.Array.each(samples, function (key, index) {

                if (key in src) {
                    obj[key] = src[key];
                }
            });
        }
        else if (This.isPlain(samples)) {
            This.each(samples, function (key, value) {

                if (key in src) {
                    obj[key] = src[key];
                }
            });
        }
        else if (typeof samples == 'string') {
            var key = samples;
            if (key in src) {
                obj[key] = src[key];
            }

        }
        else {
            throw new Error('无法识别参数 samples 的类型');
        }

        
        return obj;
    },


    /**
    * 对一个源对象进行成员过滤，并把过滤后的结果扩展到目标对象上。
    * 该方法可以从指定的对象上拷贝指定的成员到目标对象上。
    * @param {Object} target 接收成员的目标对象。
    * @param {Object} src 要进行拷贝的对象，即数据来源。
    * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
    * @return {Object} 返回一个过滤后的新对象。
    * @example
        var target = {
            myName: 'micty'
        };

        var src = {
            a: 100,
            b: 200,
            c: 300,
            d: 400
        };

        var samples = {
            a: 1,
            b: 2
        };

        //或 samples = ['a', 'b'];

        $.Object.filterTo(target, src, samples);
        console.dir(target); //得到 target = { myName: 'micty', a: 100, b: 200 };
    */
    filterTo: function (target, src, samples) {
        var obj = This.filter(src, samples);
        return This.extend(target, obj);
    },

    /**
    * 使用过滤函数对指定的对象进行过滤数，返回一个新对象。
    * @param {Object} target 要进行过滤的对象。
    * @param {function} fn 过滤函数。
    *   过滤函数会接收到两个参数：当前对象中迭代中的 key 和 value。
    *   过滤函数必须明确返回 true 以保留该成员，其它值则删除该成员。
    * @return {Object} 返回一个过滤后的纯对象。
    */
    grep: function (target, fn) {

        var obj = {};

        for (var key in target) {
            var value = target[key];
            if (fn(key, value) === true) { //只有回调函数中明确返回 true 才保留该成员
                obj[key] = value;
            }
        }

        return obj;
    },

    /**
    * 判断符合条件的元素是否存在。 
    * 只有在回调函数中明确返回 true，才算找到，此时本方法停止迭代，并返回 true 以指示找到； 
    * 否则迭代继续直至完成，并返回 false 以指示不存在符合条件的元素。
    * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
    * @param {function} fn 自定义查找的函数。
        只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
    * @param {boolean} isDeep 指示是否深层次迭代查找。
    * @return {boolean} 如果找到符合条件的元素，则返回 true；否则返回 false。
    * @example
        var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 1,
                b: 1,
                c: 2
            }
        };

        var found = $.Object.find(obj, function (key, value) {
            if (key == 'b' && value == 1) {
                return true;
            }
        }, true);
        console.log(found); //true
    */
    find: function (obj, fn, isDeep) {

        var found = false;

        This.each(obj, function (key, value) {
            if (fn(key, value) === true) {
                found = true;
                return false;  // break
            }
        }, isDeep);

        return found;
    },

    /**
    * 查找符合条件的元素，返回一个键值的二元组[key, value]。
    * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
    * @param {function} fn 自定义查找的函数。
        只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
    * @param {boolean} isDeep 指示是否深层次迭代查找。
    * @return {boolean} 如果找到符合条件的元素，则返回该项的键值二元组[key, value]。
    * @example
        var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                c: 20
            }
        };

        var item = $.Object.findItem(obj, function (key, value) {
            return value == 20;
        }, true);
        console.log(item); //['c', 20]
    */
    findItem: function (obj, fn, isDeep) {

        var item = [];

        This.each(obj, function (key, value) {

            if (fn(key, value) === true) {
                item = [key, value];
                return false;  // break
            }

        }, isDeep);

        return item;
    },

    /**
    * 查找符合条件的元素，返回该元素的键。
    * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
    * @param {function} fn 自定义查找的函数。
        只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
    * @param {boolean} isDeep 指示是否深层次迭代查找。
    * @return {boolean} 如果找到符合条件的元素，则返回该项的键；否则返回 undefined。
    * @example
        var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                c: 20
            }
        };

        var key = $.Object.findKey(obj, function (key, value) {
            return value == 20;
        }, true);
        console.log(key); // 'c'
    */
    findKey: function (obj, fn, isDeep) {
        var item = This.findItem(obj, fn, isDeep);
        return item[0];
    },

    /**
    * 查找符合条件的元素，返回该元素的值。
    * @param {Object} obj 要进行查找的对象，将在其成员中进行迭代。
    * @param {function} fn 自定义查找的函数。
        只有在回调函数中明确返回 true 才算找到，此时本方法停止迭代。
    * @param {boolean} isDeep 指示是否深层次迭代查找。
    * @return {boolean} 如果找到符合条件的元素，则返回该元素的值；否则返回 undefined。
    * @example
        var obj = {
            a: 1,
            b: 2,
            c: 2,
            d: {
                a: 10,
                b: 10,
                cc: 20
            }
        };

        var value = $.Object.findValue(obj, function (key, value) {
            return key == 'cc';
        }, true);
        console.log(value); //20
    */
    findValue: function (obj, fn, isDeep) {
        var item = This.findItem(obj, fn, isDeep);
        return item[1];
    },

    /**
    * 获取指定的对象指定成员所对应的值。
    * 当对象中不存在该成员时，返回一个备用值。
    * @param {Object} obj 要获取值的对象。
    * @param key 要获取值的成员。
    * @param backupValue 备用值。。
    * @return 如果对象中存在该成员，则返回该成员所对应的值；否则，返回备用值。
    * @example
        var value = $.Object.get({}, 'a', 2);
        console.log(value); //得到 2;

        var value = $.Object.get({a: 1 }, 'a', 2);
        console.log(value); //得到 1;

        var value = $.Object.get(null, 'a', 1);
        console.log(value); //得到 1;
    */
    get: function (obj, key, backupValue) {

        if (!obj) {
            return backupValue;
        }

        if (key in obj) {
            return obj[key];
        }

        return backupValue;
    },

    /**
    * 给指定的对象设置一个键和一个值。
    * @param {Object} obj 要设置的对象。
    * @param key 设置对象所用的键。
    * @param value 设置对象所用的值。
    * @return {Object} 返回第一个参数 obj，即设置的对象。
    * @example
        var obj = $.Object.set({}, 'a', 1);
        console.dir(obj); //得到 obj = { a: 1 };
    */
    set: function (obj, key, value) {
        obj[key] = value;
        return obj;
    },

    /**
    * 用指定的键和值组合生成一个对象，支持批量操作。
    * @param {string|number|boolean|Array} key 生成对象所用的键。
        当是数组时，表示批量操作，格式必须是二元组。
    * @param value 生成对象所用的值。
    * @return {Object} 返回一个生成后的对象。
    * @example

        //单个操作
        var obj = $.Object.make('a', 1);
        console.dir(obj); //得到 obj = { a: 1 };

        //批量操作
        var obj = $.Object.make( 
            ['a', 1], 
            ['b', 2], 
            ['c', 3]
        );
        console.dir(obj); //得到 obj = { a: 1, b: 2, c: 3};
    */
    make: function (key, value) {

        var $ = MiniQuery;
        var obj = {};

        if (This.isArray(key)) {
            $.Array(arguments).each(function (pair, index) {
                obj[pair[0]] = pair[1];
            });
        }
        else {
            obj[key] = value;
        }

        return obj;
    },


    /**
    * 获取指定对象的所有成员中的键，返回一个数组。
    * @param {Object} obj 要进行获取值的对象。
    * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
        如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
        否则指定为 false，此时为返回一个一维数组。
    * @return 返回一个由值组成的一维或多维数组。
    */
    getKeys: function (obj, isDeep) {

        var fn = arguments.callee;

        var a = [];

        for (var key in obj) {

            var value = obj[key];

            if (isDeep === true &&
                typeof value == 'object' &&
                value !== null) {

                key = fn(value, isDeep);
            }

            a.push(key);
        }

        return a;
    },

    /**
    * 获取指定对象的所有成员中的值，返回一个数组。
    * @param {Object} obj 要进行获取值的对象。
    * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
        如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
        否则指定为 false，此时为返回一个一维数组。
    * @return 返回一个由值组成的一维或多维数组。
    */
    getValues: function (obj, isDeep) {

        var fn = arguments.callee;

        var a = [];

        for (var key in obj) {
            var value = obj[key];

            if (isDeep === true &&
                typeof value == 'object' && 
                value !== null) {

                value = fn(value, isDeep);
            }

            a.push(value);
        }

        return a;
    },

    /**
    * 获取指定对象的所有成员中的键和值，返回一个二元组 [key, value] 的数组。
    * @param {Object} obj 要进行获取值的对象。
    * @param {boolean} [isDeep=false] 指示是否要进行递归获取。
        如果要对成员中值类型为 object 的非 null 值递归处理，请指定 true，此时返回一个多维数组；
        否则指定为 false，此时为返回一个一维数组。
    * @return 返回一个由二元组 [key, value] 组成的数组。
    */
    getItems: function (obj, isDeep) {

        return This.toArray(obj, true, isDeep);
    },

    /**
    * 把一个对象的名称-值对转成用指定分隔符连起来的字符串。
    * @param {Object} nameValues 键值表 
    * @param {String} [nameValueSeparator='='] name_value 的分隔符。 
        如果不指定则默认为 "=" 号
    * @param {String} [pairSeparator='&'] 键值对的分隔符。
        如果不指定则默认为 "&" 号
    * @return {String} 用分隔符进行连接的字符串。
    * @example 
        var a = $.Object.join( {a:1, b:2, c:3}, '=', '&' ); //得到 'a=1&b=2&c=3'
        var b = $.Object.join( {a:1, b:2, c:3} );   //得到 'a=1&b=2&c=3'
    */
    join: function (nameValues, nameValueSeparator, pairSeparator) {
        nameValueSeparator = nameValueSeparator || '=';
        pairSeparator = pairSeparator || '&';

        var pairs = [];
        for (var name in nameValues) {
            pairs.push(name + nameValueSeparator + nameValues[name]);
        }

        return pairs.join(pairSeparator);
    },

    /**
    * 重写一个对象。
    * 该方法会清空被重写的对象，然后把目标对象的成员拷贝到被重写的对象。
    * @param {Object} src 被重写的对象。 
    * @param {Object} dest 目标对象。 
    * @return {Object} 返回被重写的那个对象。
    * @example 
        var a = { a: 1, b: 2, c: 3 };
        var b = { d: 4, e: 5 };
        var c = $.Object.overwrite(a, b);

        console.log(a === b); //false
        console.log(a === c); //true
        console.dir(a); // { d: 4, e: 5 }
        console.dir(c); // { d: 4, e: 5 }

    */
    overwrite: function (src, dest) {

        for (var key in src) {
            delete src[key];
        }

        return This.extend(src, dest);
    }



});




})(MiniQuery, MiniQuery.Object);
