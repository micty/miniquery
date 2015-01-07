


module.exports = function (grunt) {


    'use strict';

    var Paths = require('./lib/Paths');
    var Tasks = require('./lib/Tasks');
    var pkg = grunt.file.readJSON('package.json');

    Tasks.setConfig({
        pkg: pkg,
        dir: pkg.dir
    });

   

    Tasks.load(grunt);
    Tasks.register();
    /*
    * 运行 grunt node 即可调用本任务
    */
    grunt.registerTask('node', function (level) {

        Tasks.run('concat', 'node', {
            dest: '<%=dir.build%>miniquery.node.debug.js',

            options: {
                banner: '\n' +
                    '/*!\n' +
                    '* <%=pkg.description%> for Node.js\n' +
                    '* version: <%=pkg.version%>\n' +
                    '*/'
            },

            src: Paths.linear({
                dir: '<%=dir.src%>',
                files: [
                    'partial/node/begin.js',
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
                    'partial/node/expose.js',
                    'MiniQuery.js',
                    'partial/node/end.js'
                ]
            }),

            
        });


        Tasks.run('uglify', 'node', {
            src: '<%=dir.build%>miniquery.node.debug.js',
            dest: '<%=dir.build%>miniquery.node.min.js',
            options: {
                //sourceMap: true
            }
        });



    });








};