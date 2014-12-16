

(function ($, deepEqual, equal, ok) {




$.test('Cookie', {

    toObject: function (fn) {
        var cookie = 'a=1; b=2; c=aa=11&bb=22';
        var obj = fn(cookie, true);
        deepEqual(obj, {
            a: '1',
            b: '2',
            c: {
                aa: '11',
                bb: '22'
            }
        });

        deepEqual(fn('a=1; b=2; c=aa=1&bb=22'), {
            a: '1',
            b: '2',
            c: 'aa=1&bb=22'
        });
    },

    //get: function (fn) {

    //    var value = $.Cookie.get('A=1; B=2; C=a=100&b=200', 'C'); //浅解析
    //    equal(value, 'a=100&b=200');

    //    var value = $.Cookie.get('A=1; B=2; C=a=100&b=200', 'C', 'b'); //深层次解析
    //    equal(value, '200');

    //    var obj = $.Cookie.get('A=1; B=2; C=a=100&b=200');
    //    deepEqual(obj, {
    //        A: '1',
    //        B: '2',
    //        C: 'a=100&b=200'
    //    });

    //    $.Cookie.set();

    //},

    set: function (fn) {

        //$.Cookie.remove();
        //$.Cookie.set('A', 100, '12d'); //设置一个 A=100 的 Cookie，过期时间为12天后
        //$.Cookie.set('B', 200, '2w');  //设置一个 B=200 的 Cookie，过期时间为2周后
        //$.Cookie.set('C', 300, '2024-9-10'); //设置一个 C=300 的 Cookie，过期时间为 '2024-9-10'
        //equal(document.cookie, 'A=100; B=200; C=300');

        //$.Cookie.set({
        //    name: 'A',
        //    value: 400,
        //    path: '/'
        //});

        //$.Cookie.remove({
        //    path: '/'
        //});


        //equal(document.cookie, 'A=100; B=200; C=300; A=400');

        ok(true);


    }
});




})(MiniQuery, deepEqual, equal, ok);