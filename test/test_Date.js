

(function ($, deepEqual, equal, ok) {



$.test('Date', {

    format: function (fn) {

        var dt = $.Date.parse('2014-5-16 14:18:30');
        equal(fn(dt, 'yyyy年MM月dd日 HH点mm分ss秒 dddd'), '2014年05月16日 14点18分30秒 星期五');
        equal(fn(dt, 'yyyy.MM.dd HH:mm:ss tt dddd'), '2014.05.16 14:18:30 PM 星期五');
        equal(fn(dt, 'yyyy.M.d H:m:s tt dddd'), '2014.5.16 14:18:30 PM 星期五');
    }
});




})(MiniQuery, deepEqual, equal, ok);