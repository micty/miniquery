

(function ($, deepEqual, equal, ok) {



$.test('Boolean', {

});


$.test('Event', {
    bind: function (fn) {
        var obj = { value: 100 };
        $.Event.bind(obj, 'show', function () {
            return this.value; // this 指向 obj
        });

        $.Event.bind(obj, {
            myEvent: function () {
                return this.value;
            },

            add: function (value1, value2) {
                this.value += (value1 * value2);
            }
        });

        equal($.Event.trigger(obj, 'show'), 100); //输出 100
        $.Event.trigger(obj, 'add', [2, 3]);
        equal($.Event.trigger(obj, 'myEvent'), 106); //输出 106


    }
});


$.test('Mapper', {

});

$.test('Math', {

});

$.test('Object', {

    getValues: function (fn) {

        var obj = {
            a: 1,
            b: 2,
            c: {
                aa: 11,
                bb: 22,
                cc: {
                    aaa: 111,
                    bbb: 222,
                    ccc: 333
                }
            }
        };

        var values = fn(obj, true);
        deepEqual(values,
        [
            1,
            2,
            [
                11,
                22,
                [
                    111,
                    222,
                    333
                ]
            ]
        ]);

        values = fn(obj);
        deepEqual(values, [1, 2, {
            aa: 11,
            bb: 22,
            cc: {
                aaa: 111,
                bbb: 222,
                ccc: 333
            }
        }]);
    },

    getKeys: function (fn) {

        var obj = {
            a: 1,
            b: 2,
            c: {
                aa: 11,
                bb: 22,
                cc: {
                    aaa: 111,
                    bbb: 222,
                    ccc: 333
                }
            }
        };

        var values = fn(obj, true);
        deepEqual(values,
        [
            'a',
            'b',
            [
                'aa',
                'bb',
                [
                    'aaa',
                    'bbb',
                    'ccc'
                ]
            ]
        ]);
    }
});

$.test('String', {

    getTemplates: function (fn) {

        var s = document.getElementById('txtTemplates').value;

        var headSamples = fn(s, [
            {
                name: 'table',
                begin: '#--detail.headTable.begin--#',
                end: '#--detail.headTable.end--#'
            },
            {
                name: 'tr',
                begin: '#--tr.begin--#',
                end: '#--tr.end--#',
                outer: '{trs}'
            },
            {
                name: 'li',
                begin: '#--li.begin--#',
                end: '#--li.end--#',
                outer: '{lis}'
            }
        ]);

        var bodySamples = fn(s, [
            {
                name: 'table',
                begin: '#--detail.bodyTable.begin--#',
                end: '#--detail.bodyTable.end--#'
            },
            {
                name: 'tr',
                begin: '#--tr.begin--#',
                end: '#--tr.end--#',
                outer: '{trs}'
            },
            {
                name: 'li',
                begin: '#--li.begin--#',
                end: '#--li.end--#',
                outer: '{lis}'
            }
        ]);

        ok(true);
        //console.dir(headSamples);
        //console.dir(bodySamples);

    }
});



})(MiniQuery, deepEqual, equal, ok);