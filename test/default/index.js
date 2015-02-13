


var Emitter = MiniQuery.require('Emitter');


var emitter = new Emitter();


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

    //'dblclick': {},
    //'hover': {},

});




emitter.on('click', 'delete', function () {
    debugger;
});

emitter.on('click', function () {
    debugger;
});

emitter.on('click', function () {
    debugger;
    return 100;
});

emitter.on('click', function () {
    debugger;
});

emitter.on('click', 'delete', 'by-id', function () {
    debugger;
});

emitter.on('dblclick', 'add', {
    'test': {
        id: function () {
            debugger;
        },
        src: function () {
            debugger;
        },
    },
    'pub': function () {
        debugger;
    },
});

emitter.on('dblclick', 'add', function () {
    debugger;
});



//线性化
emitter.fire('click', 'delete', 'by-id', [1000]);
emitter.fire('click', 'delete');
emitter.fire({
    names: ['click'],
    stop: 100
});

emitter.fire('dblclick', 'add', 'test', 'id', [123]);
emitter.fire('dblclick', 'add', [123]);
