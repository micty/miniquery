﻿

var Paths = require('../../lib/Paths.js');


module.exports = {

    name: 'concat',
    target: 'default',
    config: {
        options: {
            banner: '\n' +
                '/*!\n' +
                '* <%=pkg.description%>\n' +
                '* 版本: <%=pkg.version%>\n' +
                '* for default\n' +
                '*/'
        },

        src: Paths.linear({
            dir: '<%=dir.src%>',
            files: [
                'browser.begin.js',
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

                'MiniQuery.js',
                'browser.end.js',
            ]
        }),

        dest: '<%=dir.sdk%>default/miniquery.debug.js'
    }
};