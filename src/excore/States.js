

/**
* 有限状态机类
* @class
* 有限状态机是一个非常有用的模型，可以模拟世界上大部分事物。
* 简单说，它有三个特征：
*   1.状态总数（state）是有限的。
*   2.任一时刻，只处在一种状态之中。
*   3.状态转换规则是确定的。
* 它对 JavaScript 的意义在于，很多对象可以写成有限状态机。
* 当对象的状态发生变化时，可以触发特定事件进行回调函数的调用。
* 有限状态机的写法，逻辑清晰，表达力强，有利于封装事件。
* 一个对象的状态越多、发生的事件越多，就越适合采用有限状态机的写法。
*/

define('States', function (require, module, exports) {

    var $ = require('$');
    var Mapper = require('Mapper');


    var guidKey = Mapper.getGuidKey();
    var mapper = new Mapper();


    /**
    * @inner
    * 构造函数
    */
    function States(current, list) {

        var $String = require('String');
        var $Array = require('Array');
        var Event = require('Event');

        this[guidKey] = $String.random();


        var states = {};//状态集合
        var paths = {}; //路径集合

        mapper.set(this, {
            states: states,
            paths: paths,
            histories: [current] //经历过的状态
        });

        var self = this;
        var bind = Event.bind;
        list = normalize(list);

        $Array.each(list, function (item, index) {

            var from = item.from;
            var to = item.to;
            var fn = item.fn;

            if (from && to) {
                bind(self, from + '->' + to, fn);
                paths[from + '->' + to] = true;
                states[from] = true;
                states[to] = true;
            }
            else if (from) {
                bind(self, from + '->', fn);
                states[from] = true;
            }
            else if (to) {
                bind(self, '->' + to, fn);
                states[to] = true;
            }
            else {
                bind(self, '->', fn);
            }

        });

    }


    /**
    * @inner 
    * 静态方法
    * 标准化参数 states，以获得统一的描述格式
    */
    function normalize(states) {

        var $Object = require('Object');
        var $Array = require('Array');


        var list = [];

        if ($Object.isPlain(states)) { //此时为 { ... }

            $Object.each(states, function (key, fn) {

                var pair = key.split('->');
                var from = pair[0];
                var to = pair[1];

                if (from.indexOf('|') > 0 || to.indexOf('|') > 0) { // from 和 to 中至少有一个含有 '|'
                    from = from.split('|');
                    to = to.split('|');
                    var a = combine(from, to, fn);
                    list = list.concat(a);
                }
                else {
                    list.push({
                        from: from,
                        to: to,
                        fn: fn
                    });
                }

            });
        }
        else if ($Object.isArray(states)) { // 此时为 [ ... ]

            $Array.each(states, function (item, index) {

                var from = item.from;
                var to = item.to;
                var fn = item.fn;

                var from_isArray = from instanceof Array;
                var to_isArray = to instanceof Array;

                if (from_isArray || to_isArray) { // from 和 to 中至少有一个为数组

                    if (!from_isArray) { //此时 to 必为 []
                        from = [from];
                    }
                    else if (!to_isArray) { //此时 from 必为 []
                        to = [to];
                    }

                    var a = combine(from, to, fn);
                    list = list.concat(a);
                }
                else {
                    list.push(item);
                }

            });
        }

        return list;
    }


    /**
    * @inner
    */
    function combine(A, B, fn) {

        var $Array = require('Array');

        var groups = $Array.descartes(A, B);

        return $Array.keep(groups, function (item, index) {
            return {
                from: item[0],
                to: item[1],
                fn: fn
            };
        });
    }





    $.extend(States.prototype, { /**@lends MiniQuery.States#*/

        /**
        * 把当前状态转换到指定的状态。
        * @param {string} name 要转换到的目标状态。
        * @param {Array} [args] 要向状态转换时触发的处理函数传递的参数数组。
        * @example
        *
        */
        to: function (name, args) {

            var $String = require('String');
            var Event = require('Event');

            var current = this.current();

            if (!this.has(current, name)) {
                throw new Error($String.format('不存在从状态 {0} 到状态 {1} 的路径', current, name));
            }

            mapper.get(this).histories.push(name); //先改变状态，再触发事件

            Event.trigger(this, current + '->', args);
            Event.trigger(this, current + '->' + name, args);
            Event.trigger(this, '->' + name, args);
            Event.trigger(this, '->', args);


        },

        backward: function (args) {
            var histories = mapper.get(this).histories;
            var index = histories.length - 2;
            if (index >= 0) {
                this.to(histories[index], args);
            }
        },

        current: function () {
            var histories = mapper.get(this).histories;
            return histories[histories.length - 1];
        },

        has: function (from, to) {

            var states = mapper.get(this).states;
            if (to === undefined) { //此时为 has(from) 即确定是否包含某个状态
                return !!states[from];

            }

            //此时为 has(from, to) 即是否存在从 from 到 to 的路径
            var paths = mapper.get(this).paths;
            return !!paths[from + '->' + to];
        },

        states: function () {
            var $Object = require('Object');

            var states = mapper.get(this).states;
            return $Object.getKeys(states);
        },

        paths: function () {
            var $Object = require('Object');
            var paths = mapper.get(this).paths;
            return $Object.getKeys(paths);
        },

        histories: function () {
            var histories = mapper.get(this).histories;
            return histories.slice(0);
        },

        length: function () {
            return this.states().length;
        }

    });

    //for test
    //States.mapper = mapper;

    return States;

});


