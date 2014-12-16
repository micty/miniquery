

(function ($, deepEqual, equal, ok) {





$.test('Url', {

    getQueryString: function (fn) {

        deepEqual(fn('http://www.demo.com?a=1&b=2#hash', 'a'), '1');
        deepEqual(fn('http://www.demo.com?a=1&b=2#hash', 'c'), undefined);
        equal(fn('http://www.demo.com?a=1&A=2#hash', 'A'), 2);
        equal(fn('http://www.demo.com?a=1&b=2#hash', 'A', true), 1);
        equal(fn('http://www.demo.com?a=1&b=2#hash', ''), 'a=1&b=2');
        deepEqual(fn('http://www.demo.com?a=1&b=2#hash'), { a: '1', b: '2' });
        deepEqual(fn('http://www.demo.com?a=&b='), { a: '', b: '' });
        deepEqual(fn('http://www.demo.com?a&b'), { a: '', b: '' });
        deepEqual(fn('http://www.demo.com?a', 'a'), '');

       
    },

    setQueryString: function (fn) {

        var s = fn('http://www.demo.com?a=1&b=2#hash', 'c', 3);
        equal(s, 'http://www.demo.com?a=1&b=2&c=3#hash');

        var s = fn('http://www.demo.com?a=1&b=2#hash', {
            a: 3,
            d: 4
        });
        equal(s, 'http://www.demo.com?a=3&b=2&d=4#hash');

        var s = fn('http://www.demo.com?a=1&b=2#hash', {
            a: 3,
            d: 4,
            E: {
                aa: 1111,
                bb: 2222
            }
        });
        equal(s, 'http://www.demo.com?a=3&b=2&d=4&E=aa%3D1111%26bb%3D2222#hash');
    },

    hasQueryString: function (fn) {

        ok(fn('http://www.demo.com?a=1&b=2#hash', 'a'));  //返回 true
        ok(fn('http://www.demo.com?a=1&b=2#hash', 'b'));  //返回 true
        ok(!fn('http://www.demo.com?a=1&b=2#hash', 'c'));  //返回 false
        ok(fn('http://www.demo.com?a=1&b=2#hash', 'A', true)); //返回 true
        ok(fn('http://www.demo.com?a=1&b=2#hash'));       //返回 true

        ok(!fn('http://www.demo.com?'));
        ok(fn('http://www.demo.com?a'));
        ok(fn('http://www.demo.com?a='));

    },

    hashchange: function (fn) {

        ok(true);

    }

});


$.Url.hashchange(window, function (newHash, oldHash) {
    console.log(newHash, oldHash);
});

$.Url.hashchange(window, function (newHash, oldHash) {
    console.log('2: ' + newHash, oldHash);
});


$.Url.Current.hashchange(function (newHash, oldHash) {
    console.log('Url.Current-1: ' + newHash, oldHash);
});

$.Url.Current.hashchange(function (newHash, oldHash) {
    console.log('Url.Current-2: ' + newHash, oldHash);
});


})(MiniQuery, deepEqual, equal, ok);