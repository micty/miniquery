

(function ($, deepEqual, equal, ok) {




$.test('Guid', {

    next: function (fn) {

        equal($.Guid.next('group1'), 1); //1
        equal($.Guid.next('group2'), 1); //1
        equal($.Guid.next('group2'), 2); //2
        equal($.Guid.next('group1'), 2); //2
        equal($.Guid.next(), 1); //1
        equal($.Guid.next(), 2); //2
    },

    reset: function (fn) {
        $.Guid.reset('group1');
        equal($.Guid.next('group1'), 1); //1

        $.Guid.reset();
        equal($.Guid.next(), 1); //1
    },

    get: function (fn) {

        

        $.Guid.reset('group1');
        var s = $.Guid.get('group1', 'label_{0}_{1}'); // 'label_1_2'
        equal(s, 'label_1_2');

        var s = $.Guid.get('group1', 'label_{0}_{1}'); // 'label_3_4'
        equal(s, 'label_3_4');


        $.Guid.reset('group2');
        var s = $.Guid.get('group2', 'button_{0}_{1}'); // 'button_1_2'
        equal(s, 'button_1_2');

        var s = $.Guid.get('group2', 'button_{0}_{0}'); // 'button_3_3'
        equal(s, 'button_3_3');

        $.Guid.reset('my');
        equal($.Guid.get('my'), 1);
        equal($.Guid.get('my'), 2);



    }
});




})(MiniQuery, deepEqual, equal, ok);