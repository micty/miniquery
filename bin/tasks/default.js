


module.exports = function (grunt) {

    'use strict';

    var $ = require('../lib/MiniQuery');
    var LinearPath = require('../lib/LinearPath');
    var Tasks = require('../lib/Tasks');
    var Banner = require('../lib/Banner');

    var name = 'default';

    var list = LinearPath.linearize({
        dir: '<%=dir.src%>',
        files: [
            'partial/' + name + '/begin.js',
            {
                dir: 'compatible',
                files: [
                    'Date.js',
                    'Function.js',
                    'Object.js',
                ],
            },
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
                dir: 'browser',
                files: [
                    {
                        dir: 'Cookie',
                        files: [
                            'Expires.js'
                        ],
                    },
                    'Cookie.js',
                    'LocalStorage.js',
                    'SessionStorage.js',
                    'Script.js',
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
    * 运行 grunt default 即可调用本任务
    */
    grunt.registerTask(name, function (level) {

        var home = '<%=dir.build%>' + name + '/<%=pkg.version%>';

        var files = LinearPath.linearize({
            dir: home,
            files: [
                'miniquery.debug.js',
                'miniquery.min.js',
                'miniquery.min.js.map'
            ]
        });

        //Tasks.run('jsdoc', name, {
        //    src: list.slice(1, -2),
        //    options: {
        //        destination: 'doc'
        //    }
        //});

        //return;

        Tasks.run('clean', name, {
            src: home,
            options: {
                force: true //允许删除当前工作目录外的其他文件
            }
        });

        Tasks.run('copy', name, {
            dest: home + '/src/',
            src: list
        });

        Tasks.run('concat', name, {
            dest: files[0],
            src: list,
            options: {
                banner: Banner.get(name, list),
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
        Tasks.run('copy', name + '/jsdoc', {
            src: './jsdoc.bat',
            dest: home + '/jsdoc.bat',
            options: {
                process: function (s) {
                    var pkg = grunt.file.readJSON('package.json');

                    return $.String.format(s, {
                        'name': name,
                        'version': pkg.version,
                        'list': $.Array.keep(list.slice(1, -2), function (item, index) {
                            item = item.replace('<%=dir.src%>', '%src%');
                            return item;

                        }).join(' ^\r\n'),
                    });
                },
            }
        });

        //for test
        //生成 approve-cmd 目录
        Tasks.run('copy', name + '/approve-cmd', {
            files: LinearPath.pair(home, 'E:/Kingdee/approve-cmd/htdocs/f', [
                'miniquery.debug.js',
                'miniquery.min.js',
            ]),

        });


        //生成到 vCRM 目录
        Tasks.run('copy', name + '/vCRM', {
            files: LinearPath.pair(home, 'E:/Kingdee/vCRM/htdocs/f', [
                'miniquery.debug.js',
                'miniquery.min.js',
            ]),

        });
        



    });


};