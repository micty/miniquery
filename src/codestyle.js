

function demo(foo){

    //推荐
    if (foo) {
        
    }

    //不推荐，首花括号不需要换行
    if (foo)
    {

    }

    //不推荐，首花括号不需要换行
    var obj =
    {

    };

    //推荐
    if (foo) {
        return;
    }

    //不推荐，没有换行缩进，结构不明朗
    if (foo) return;

    //不推荐，有换行与缩进，但没有块效果，不方便以后增加语句并且容易出错
    if (foo)
        return;


    var x;
    var y;
    var z;

    //推荐
    var x = y + z;

    //不推荐，太密集
    var x=y+z;

    //推荐
    var obj = {
        a: 1,
        longname: 2
    };

    //不推荐
    var obj = {
        a:1,            //太密集，冒号后需要一个空格
        b : 2,          //太松散，冒号前不需要空格
        c       : 3,    //不需要刻意去对齐，因为在未来不可控
        longname: 4 
    };


    //推荐
    var fn = function (a, b, c) {

    };

    //推荐
    function fn(a, b, c) {

    }

    //不推荐，原因：
    //1.左圆括号不能紧跟 function 关键字；
    //2.右圆括号跟函数体开始的花括号需空一格；
    //3.参数间的逗号需要空一格，不然太密集
    var fn = function(a,b,c){

    };

    //不推荐
    //具名函数名后面的左圆括号不需要空一格，并且参数前后空格太多。
    function fn ( a, b, c ) {

    }

    //推荐
    fn(0, 1, 2);

    //不推荐，参数间太密集，需要空格
    fn(0,1,2);

    //不推荐，函数调用的函数名称后面不需要空格
    fn (0, 1, 2);


    //推荐
    var obj = {
        
    };

    //推荐
    var array = [

    ];

    //推荐
    var fn = function () {

    }; //通过这种方式定义函数，结束处的分号不能少


    //不推荐
    var fn = function () {

    } // <--缺少分号

    //不推荐
    function fn() {

    }; //不是通过 var 定义的函数结束处，不需要分号
    

    //不推荐
    function fn() {
        
        var count = 10,
            name = "Nicholas",
            found = false,
            map = {},
            list = [],
            get = function () {
                //...
                //这个函数可能很长很长
            },
            //...
            //这里可能还会有很多个变量，占据很多行
            empty;
        
        //do something...

    }

    //推荐。 按需声明变量，变量声明的位置与使用的位置尽量靠近
    function fn() {

        //不推荐
        var cache, event, all, list, i, len, rest = [], args;

        var count = 10;
        var name = 'Nicholas';
        console.log(name + '=' + count);

        var map = {};
        var list = [];
        var found = name in map;
        if (found) {
            list.push(name);
        }

        var get = function () {
            //...
            //这个函数可能很长很长
        };

        var empty;

        //do something...

    }


    //推荐
    var userName = 'Nicholas';
    function addYears() {

    }

    //不推荐
    var user_name = 'Nicholas';
    function add_years() {

    }


    //不推荐
    function fn() {
        var _age = 20;          //不需要下划线
        var name_ = 'Nicholas'; //不需要下划线
    }


    //推荐
    function fn() {
        var age = 20;
        var name = 'Nicholas';

        return {
            name: name, //公共成员，正常暴露
            _age: age   //不得不暴露私有成员时，必须以下划线开头
        };
    }


    //推荐
    //后台程序生成的 JS 数据文件格式
    //增加一个全局变量，是一个数据，分别以两个下划线开头和结束
    var __data__ = [ 

        //...

    ];

    //推荐
    var __data__ = {

        //...

    };

    //推荐
    //后台接口返回的 JSON-P 格式
    __callback__({ //业务代码必须已定义一个名为 __callback__ 的函数

        //...
    });


    //推荐使用的 key-value 集合表示法
    var id$user = {
        1000: { name: 'Micty', age: 30 },
        1001: { name: 'Nicholas', age: 30 },
        1002: { name: 'Bill', age: 30 }
        //...
    };

    //取出 id 为 1001 的值
    var id = 1001;
    var user = id$user[id];

    //推荐的复数命名方式
    var ids = [];   //表示 id 的集合
    var events = [];//表示事件的集合

    var list = [];  //表示一个列表集合，用在语义很明确的环境里
    var a = [];     //表示一个数组，用在代码逻辑足够简单的环境里


    //推荐。 模块的命名，以大写字母开头
    var ClassManager = (function () {

        //some code...

        //ClassManager = 
        return {

            //...
        };
    })();

    //推荐。 函数作为简单的参数时的命名
    function doSomthing(fn) {
        //...
        fn(); //回调
    }

    //推荐。 函数引用自身时的命名
    function doSomthing() {
        var fn = arguments.callee; //引用自身
        //...
    }

    var self = this;


    //推荐
    try{
        //do something that may cause an error
    }
    catch (ex) {
        handleError(ex); //委托给处理器方法
    }

    

    //推荐。 
    //用局部变量对数组的长度进行缓存，在进行 DOM 集合时尤其重要。
    var divs = document.getElementsByTagName('divs');
    for (var i = 0, len = divs.length; i < len; i++) {
        //do something...
    }


    //不推荐。 
    //在循环体中重复创建函数。
    for (var i = 0, len = list.length; i < len; i++) {
        handleItem(list[i], function () {
            //do something callback
        });
    }

    //推荐。 
    //把函数提到循环体外创建
    function callback () {
        //do something callback
    }
    for (var i = 0, len = list.length; i < len; i++) {
        handleItem(list[i], callback);
    }

    var items = [];

    //基于函数的迭代。
    items.forEach(function (item, index, items) {
        //do something...
    });

    //jQuery中基于函数的迭代
    jQuery.each(items, function (index, item) {
        //do something
    });

    //推荐。 判断条件较少时，优先使用 if-else 结构。
    if (found) {
        //do something
    }
    else {
        //do something else
    }

    //不推荐。 判断条件较少时，不适合用 switch 结构。
    switch (found) {
        case true:
            //do something
            break;
        default:
            //do something else
            break;
    }


    var color;

    //不推荐。 判断条件较多时，不适合用 if-else 结构。
    if (color == 'red') {
        //...
    }
    else if (color == 'blue') {
        //...
    }
    else if (color == 'yellow') {
        //...
    }
    else if (color == 'black') {
        //...
    }
    else {
        //...
    }

    //推荐。 判断条件较多时，优先使用 switch 结构。
    switch (color) {
        case 'red':
            //...
            break;
        case 'blue':
            //...
            break;
        case 'yellow':
            //...
            break;
        case 'black':
            //...
            break;
        default:
            //...
            break;
    }

    //定义一系列离散值对应的处理函数
    var handlers = {
        'red': function () {
            //处理 case 为 'red' 的分支
        },
        'blue': function () {
            //处理 case 为 'blue' 的分支
        },
        'yellow': function () {
            //处理 case 为 'yellow' 的分支
        },
        'black': function () {
            //处理 case 为 'black' 的分支
        }
    };
    //1.命名模式： 对每个函数进行命名。会产生两个中间的局部变量。
    var fn = handlers[color] || function () {
        //处理 default 的分支
    };
    fn();
    //2.混合模式：立即函数 + 声明即调用混合模式。 产生一个中间局部变量。
    (handlers[color] || function () {
        //处理 default 的分支
    })();
    //3.完全的声明即调用模式：追求极致的，不产生任何中间的局部变量。
    (({
        'red': function () {
            //处理 case 为 'red' 的分支
        },
        'blue': function () {
            //处理 case 为 'blue' 的分支
        },
        'yellow': function () {
            //处理 case 为 'yellow' 的分支
        },
        'black': function () {
            //处理 case 为 'black' 的分支
        }
    })[color] || function () {
        //处理 default 的分支
    })();



    var name = 'Nichlas says, "Hi"';
}




// Simple function for logging results
var log = function (value) {
    console.log(value);
};

// Two sample functions to be added to a callbacks list
var foo = function (value) {
    log("foo: " + value);
};
var bar = function (value) {
    log("bar: " + value);
};

// Create the callbacks object with the "memory" flag
var callbacks = $.Callbacks("memory");

// Add the foo logging function to the callback list
callbacks.add(foo);

// Fire the items on the list, passing an argument
callbacks.fire("hello");
// Outputs "foo: hello"

// Lock the callbacks list
callbacks.lock();

// Try firing the items again
callbacks.fire("world");
// As the list was locked, no items were called,
// so "foo: world" isn't logged

// Add the foo function to the callback list again
callbacks.add(foo);

// Try firing the items again
callbacks.fire("silentArgument");
// Outputs "foo: hello" because the argument value was stored in memory

// Add the bar function to the callback list
callbacks.add(bar);

callbacks.fire("youHadMeAtHello");
// Outputs "bar: hello" because the list is still locked,
// and the argument value is still stored in memory
