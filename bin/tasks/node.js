


module.exports = function (grunt) {

    'use strict';

    var $ = require('../lib/MiniQuery');
    var LinearPath = require('../lib/LinearPath');
    var Tasks = require('../lib/Tasks');

    var name = 'node';

    var list = LinearPath.linearize({
        dir: '<%=dir.src%>',
        files: [
            'partial/' + name + '/begin.js',
            {
                dir: 'core',
                files: [
                    'Module.js',
                    '$.js',
                    'Array.js',
                    'Boolean.js',
                    'Date.js',
                    'Math.js',
                    'MiniQuery.js',
                    'Object.js',
                    'String.js',
                ]
            },
            {
                dir: 'excore',
                files: [
                    {
                        dir: 'Emitter',
                        files: [
                            'Helper.js',
                            'Tree.js',
                        ],
                    },
                    'Emitter.js',
                    'Mapper.js',
                    'Module.js',
                    'Url.js',
                ]
            },
            {
                dir: 'partial/' + name,
                files: [
                    'expose.js',
                    'end.js',
                ]
            },
        ]
    });

    /*
    * 运行 grunt node 即可调用本任务
    */
    grunt.registerTask(name, function (level) {

        var home = '<%=dir.build%>' + name;

        var files = LinearPath.linearize({
            dir: home,
            files: [
                'miniquery.debug.js',
                'miniquery.min.js',
                'miniquery.min.js.map'
            ]
        });

        Tasks.run('clean', name, {
            src: files,
            options: {
                force: true //允许删除当前工作目录外的其他文件
            }
        });


        Tasks.run('concat', name, {
            dest: files[0],
            src: list,
            options: {
                banner: '\n' +
                    '/*!\n' +
                    '* <%=pkg.description%> for ' + name + '\n' +
                    '* version: <%=pkg.version%>\n' +
                    '*/'
            },
        });

        Tasks.run('uglify', name, {
            src: files[0],
            dest: files[1],
            options: {
                sourceMap: level > 0
            }
        });

        //生成 jsdoc.bat 到 build/{home} 目录
        Tasks.run('copy', name, {
            src: './jsdoc.bat',
            dest: home + '/jsdoc.bat',
            options: {
                process: function (s) {
                    return $.String.format(s, {
                        'name': name,
                        'list': $.Array.keep(list.slice(1, -2), function (item, index) {
                            item = item.replace('<%=dir.src%>', '%root%/src');
                            return item;
                        }).join(' ^\r\n'),
                    });
                },
            }
        });



    });


};