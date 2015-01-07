
/**
* 函数工具
* @namespace
*/
define('Function', function (require, module, exports) {


    module.exports = exports = { /**@lends MiniQuery.Function*/

        /**
        * 定义一个通用的空函数。
        * 实际使用中应该把它当成只读的，而不应该对它进行赋值。
        * @return 返回一个空函数，不执行任何操作。
        */
        empty: function () {
        },

        /**
        * 把函数绑定到指定的对象上，从而该函数内部的 this 指向该对象。
        * @param {Object} obj 要绑定的对象，即 this 要指向的对象
        * @param {function} fn 要绑定的函数，内部的 this 指向 obj
        * @return {function} 返回一个新的函数。
        * @example
            var p = { msg: 'hi js' };
            var obj = {
                msg: 'hello',
                hi: function(a, b, c) {
                    console.log(this.msg); // 'hi js'
                    console.log(a, b, c);
                }
            };
            $.Function.bind(p, obj.hi, 1, 2)(3); //传递附加参数
            $.Function.bind(p, obj.hi)(4, 5, 6); //传递附加参数
        */
        bind: function (obj, fn) {

            var args = Array.prototype.slice.call(arguments, 2); //通过 bind 传进来的参数(除了 obj 和 fn)

            return function () {
                var list = Array.prototype.slice.call(arguments, 0); //return 的这个函数传进来的参数
                list = args.concat(list); //合并外层的，即 bind 传进来的参数
                fn.apply(obj, list);
            }
        },

        /**
        * 间隔执行函数。
        * 该方法用 setTimeout 的方式实现间隔执行，可以指定要执行的次数。
        * 在回调函数中，会接收到当次执行次数。
        * @param {function} fn 要执行的函数。该函数的参数中会接收到当前的执行次数
        * @param {number|int} delay 时间间隔，单位为毫秒。
        * @param {number|int} [count] 要执行的次数，如果指定了，则在执行到该次数后自动停止。
        * @example
            //每隔 500ms执行一次，最多执行 23 次
            $.Function.setInterval(function(index) {
                console.log('A: ', index);
            }, 500, 23);
                
            //每隔 200ms 执行一次，当次数达到 15 以上时，停止
            $.Function.setInterval(function(index) {
                console.log('B: ', index);
                if(index >=15) {
                    return null; //返回 null 以停止
                }
                    
            }, 200);
        */
        setInterval: function (fn, delay, count) {

            //把每个传进来的函数当作一个 cache，而不是缓存在 arguments.callee，
            //因为是静态的，这样可以避免多个并发调用作产生混乱。
            var cache = fn;
            var next = arguments.callee;
            var key = '__MiniQuery.Funcion.setInterval.count__'; //一个私有的变量，尽可能不干扰原有的 fn
            cache[key] = (cache[key] || 0) + 1;

            var id = setTimeout(function () {

                var value = fn(cache[key]);

                if (value === null) {
                    clearTimeout(id);
                    return;
                }

                if (count === undefined || cache[key] < count) { //未传入 count 或 未达到指定次数
                    next(fn, delay, count);
                }

            }, delay);

        },

        debounce: function (fn, delay) {

            var timeoutId = null;

            return function () {

                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn, delay);
            }

        }


    };


});

