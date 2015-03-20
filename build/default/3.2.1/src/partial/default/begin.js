
;( function (
    global, 

    top,
    parent,
    window, 
    document,
    location,
    navigator,
    localStorage,
    sessionStorage,
    console,
    history,
    setTimeout,
    setInterval,

    JSON,

    Array, 
    Boolean,
    Date,
    Error,
    Function,
    Math,
    Number,
    Object,
    RegExp,
    String,
    
    //强制为 undefined，避免模块内因为没有显式地使用 require('$') 来加载而意外使用到外部的 $。
    //这样更容易发现错误，即发现模块内没有显式使用 var $ = require('$'); 的情况。
    $, 

    undefined
) {


//兼容
if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        // this 指向的是要绑定的函数。
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - 要绑定的对象只能是函数。");
        }

        var params = [].slice.call(arguments, 1);
        var self = this;

        return function () {
            var args = [].slice.call(arguments, 0);
            args = params.concat(args);
            return self.apply(thisArg, args);
        };
    };
}