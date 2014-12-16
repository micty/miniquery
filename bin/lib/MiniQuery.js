


module.exports = {

    Object: {

        /**
        * 用指定的值去扩展指定的目标对象，返回目标对象。
        */
        extend: function (target, obj1, obj2) {

            //针对最常用的情况作优化
            if (obj1 && typeof obj1 == 'object') {
                for (var key in obj1) {
                    target[key] = obj1[key];
                }
            }

            if (obj2 && typeof obj2 == 'object') {
                for (var key in obj2) {
                    target[key] = obj2[key];
                }
            }

            var startIndex = 3;
            var len = arguments.length;
            if (startIndex >= len) { //已处理完所有参数
                return target;
            }

            //更多的情况
            for (var i = startIndex; i < len; i++) {
                var obj = arguments[i];
                for (var name in obj) {
                    target[name] = obj[name];
                }
            }

            return target;
        }
    },


    Array: {
        /**
        * 把一个数组中的元素转换到另一个数组中，返回一个新的数组。
        * @param {Array} 要进行转换的数组。
        * @param {function} 转换函数。
            该转换函数会为每个数组元素调用，它会接收到两个参数：当前迭代的数组元素和该元素的索引。
        * 转换函数可以返回转换后的值，有两个特殊值影响到迭代行为：
        *   null：忽略当前数组元素，即该元素在新的数组中不存在对应的项（相当于 continue）；
        *   undefined：忽略当前数组元素到最后一个元素（相当于break）；
        * @return {Array} 返回一个转换后的新数组。
        */
        map: function (array, fn) {

            var a = [];

            for (var i = 0, len = array.length; i < len; i++) {
                var value = fn(array[i], i);

                if (value === null) {
                    continue;
                }

                if (value === undefined) { //注意，当回调函数 fn 不返回值时，迭代会给停止掉
                    break;
                }

                a.push(value);
            }

            return a;
        },

        /**
        * 将一个数组中的元素转换到另一个数组中，并且保留所有的元素，返回一个新数组。
        * 作为参数的转换函数会为每个数组元素调用，并把当前元素和索引作为参数传给转换函数。
        * 该方法与 map 的区别在于本方法会保留所有的元素，而不管它的返回是什么。
        */
        keep: function (array, fn) {

            var a = [];

            for (var i = 0, len = array.length; i < len; i++) {
                var value = fn(array[i], i);
                a.push(value);
            }

            return a;
        },

        /**
        * 对数组进行迭代，即对数组中的每个元素执行指定的操作。
        * @param {Array} array 要进行迭代的数组。
        * @param {function} fn 要执行处理的回调函数，会接受到当前元素和其索引作为参数。<br />
        *   只有在 fn 中明确返回 false 才停止循环(相当于 break)。
        * @param {boolean} [isReversed=false] 指定是否使用倒序进行迭代。
            如果要使用倒序来进行迭代，请指定 true；否则默认按正序。
        * @return {Array} 返回当前数组。
        * @example
            $.Array.each([0, 1, 2, 3], function(item, index) {
                if(index == 2) {
                    return false;
                }
                console.log(index, ': ', item);
            });
        */
        each: function (array, fn, isReversed) {
            var len = array.length;

            if (isReversed === true) { //使用反序。 根据<<高性能 JavaScript>>的论述，这种循环性能可以比 else 中的提高 50% 以上
                for (var i = len; i--;) { //这里只能用后减减，而不能用前减减，因为这里是测试条件，先测试，再减减
                    //如果用 callback.call(array[i], i)，
                    //则在 callback 中的 this 就指参数中的 array[i]，但类型全部为 object
                    if (fn(array[i], i) === false) { // 只有在 fn 中明确返回 false 才停止循环
                        break;
                    }
                }
            }
            else {
                for (var i = 0; i < len; i++) {
                    if (fn(array[i], i) === false) {
                        break;
                    }
                }
            }

            return array;
        },

        /**
        * 给数组降维，返回一个新数组。
        * 可以指定降维次数，当不指定次数，默认为 1 次。
        */
        reduceDimension: function (array, count) {
            count = count || 1;

            var a = array;
            var concat = Array.prototype.concat; //缓存一下方法引用，以提高循环中的性能

            for (var i = 0; i < count; i++) {
                a = concat.apply([], a);
            }

            return a;
        }
    }

};