


module.exports = function (grunt) {

    'use strict';

    var Paths = require('../lib/Paths');
    var Tasks = require('../lib/Tasks');


    /*
    * 运行 grunt kiserp 即可调用本任务
    */
    grunt.registerTask('kiserp', function (level) {

        var files = Paths.linear({
            dir: '<%=dir.build%>kiserp',
            files: [
                'miniquery.debug.js',
                'miniquery.min.js',
                'miniquery.min.js.map'
            ]
        });

        Tasks.run('clean', 'kiserp', {
            src: files,
            options: {
                force: true //允许删除当前工作目录外的其他文件
            }
        });

        var list = 

        Tasks.run('concat', 'kiserp', {
            dest: files[0],

            options: {
                banner: '\n' +
                    '/*!\n' +
                    '* <%=pkg.description%> for kiserp\n' +
                    '* version: <%=pkg.version%>\n' +
                    '*/'
            },

            src: Paths.linear({
                dir: '<%=dir.src%>',
                files: [
                    'partial/kiserp/begin.js',
                    {
                        dir: 'core',
                        files: [
                            'Module.js',
                            '$.js',
                            'Array.js',
                            'Array.prototype.js',
                            'Boolean.js',
                            'Boolean.prototype.js',
                            'Date.js',
                            'Date.prototype.js',
                            'Function.js',
                            'Math.js',
                            'Object.js',
                            'Object.prototype.js',
                            'String.js',
                            'String.prototype.js',
                        ]
                    },
                    {
                        dir: 'excore',
                        files: [
                            'Event.js',
                            'Event.prototype.js',
                            'Mapper.js',
                            'Url.js',
                        ]
                    },
                    {
                        dir: 'browser',
                        files: [
                            'Cookie.js',
                            'LocalStorage.js',
                            'SessionStorage.js',
                            'Script.js',
                            'Url.js',
                        ]
                    },
                    {
                        dir: 'partial/kiserp',
                        files: [
                            'MiniQuery.js',
                            'expose.js',
                            'end.js',
                        ]
                    },
                ]
            }),


        });


        Tasks.run('uglify', 'kiserp', {
            src: files[0],
            dest: files[1],
            options: {
                sourceMap: level > 0
            }
        });



    });


};