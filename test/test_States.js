

(function ($, deepEqual, equal, ok) {


$.test('States#', {


    to: function () {

        var states = new $.States('A', {

            'A->': function () {
                console.log('A->');
            },

            'A->B': function () {
                console.log('A->B');
            },

            'A->C': function () {
                console.log('A->C');
            },

            'B->C': function () {
                console.log('B->C');
            },

            'B->D': function () {
                console.log('B->D');
            },

            'C->D': function () {
                console.log('C->D');
            },

            'D->C': function () {
                console.log('D->C');
            },
            'D->B': function () {
                console.log('D->B');
            },

            '->C': function () {
                console.log('->C');
            },

            '->': function () {
                console.log('->');
            }

        });

        ok(states.has('A', 'C'));
        ok(!states.has('A', 'D'));
        ok(!states.has('E'));

        states.to('C');
        equal(states.current(), 'C');

        states.to('D');
        equal(states.current(), 'D');

        states.to('B');
        equal(states.current(), 'B');


        states.to('C');
        equal(states.current(), 'C');

        console.dir(states);
        console.dir(states.states());
        console.dir(states.paths());
        console.dir(states.histories());
    }

});

    


})(MiniQuery, deepEqual, equal, ok);