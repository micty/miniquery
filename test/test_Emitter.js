
var emitter = new Emitter(null, {

});


emitter.on({

    'click': {
        'delete': {
            'by-id': function () {
                debugger;
            },
            'by-name': function () {
                debugger;
            },

            'by-tag': function () {
                debugger;
            },
        },

        'update': {
            'by-id': function () {
                debugger;
            },
            'by-name': function () {
                debugger;
            },

            'by-tag': function () {
                debugger;
            },
        },
    },

    'dblclick': {},
    'hover': {},

});




emitter.on('click', 'delete', function () {
    debugger;
});

emitter.on('click', function () {
    debugger;
});

//线性化
emitter.fire('click', 'delete', 'by-id', [1000]);
emitter.fire('click', 'delete');
emitter.fire('click');