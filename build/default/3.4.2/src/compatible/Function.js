
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