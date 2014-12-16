

(function ($, deepEqual, equal, ok) {



var callbacks = new $.Callbacks();

var fn = function (a, b) {
    console.log(this.value, a, b);
    return this.value;
};

var fn2 = function (a) {
    console.log(a);
    return a + 1;
};

var fn3 = function () {
    console.log('fn3');
    return false;
};

var fn4 = function () {
    console.log('fn4');
};

$.test('Callbacks#', {

    add: function () {
        callbacks.add(fn);
        callbacks.add(fn2);
        ok(callbacks.has(fn));
        ok(callbacks.has(fn2));

        var values = callbacks.fire('a', 'b');
        deepEqual(values, [undefined, 'a1']);

        var obj = {
            value: 100
        };

        var values = callbacks.fireWith(obj, 'AA', 'BB');

        deepEqual(values, [100, 'AA1']);
        deepEqual(obj, {
            value: 100
        });

        callbacks.add(fn3);
        callbacks.add(fn4);


        var values = callbacks.fireStop(false, 10);
        deepEqual(values, [undefined, 11, false]);
    }

});



})(MiniQuery, deepEqual, equal, ok);