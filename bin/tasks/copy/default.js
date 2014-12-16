

var Paths = require('../../lib/Paths.js');

module.exports = {

    name: 'copy',
    target: 'default',
    config: {
        files: Paths.pair({

            src: '<%=dir.src%>',
            dest: '<%=dir.build%>/src',
            files: [
                {
                    dir: 'core',
                    files: [
                        'Miniquery.js',
                        'Object.js',
                        'Object.prototype.js',
                        'Array.js',
                        'Array.prototype.js',
                        'String.js',
                        'String.prototype.js',
                        'Boolean.js',
                        'Boolean.prototype.js',
                        'Date.js',
                        'Date.prototype.js',
                        'Math.js'
                    ]
                },
                {
                    dir: 'excore',
                    files: [
                        'Url.js',
                        'Guid.js',
                        'Mapper.js',
                        'Event.js',
                        'Event.prototype.js',
                        'Callbacks.js',
                        'States.js'
                    ]
                },
                {
                    dir: 'browser',
                    files: [
                        'SessionStorage.js',
                        'LocalStorage.js',
                        'Url.js',
                        'Cookie.js',
                        'Script.js',
                        'Xhr.js',
                        'Xml.js',
                    ]
                },
                {
                    dir: 'current',
                    files: [
                        'Url.js'
                    ]
                },

                'MiniQuery.js'
            ]
        })
    }
};