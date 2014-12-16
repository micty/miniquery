


module.exports = function (grunt) {


    'use strict';


    var Tasks = require('./lib/Tasks');
    var pkg = grunt.file.readJSON('package.json');

    Tasks.setConfig({
        pkg: pkg,
        dir: pkg.dir
    });


    

    Tasks.use('concat/default');
    Tasks.use('uglify/default');

   
    Tasks.use('concat/node');
    Tasks.use('uglify/node');

    Tasks.use('concat/core');
    Tasks.use('uglify/core');

    Tasks.use('concat/kisp');
    Tasks.use('uglify/kisp');

    Tasks.use('copy/default');


    

    Tasks.loadContrib([
        'concat',
        'uglify',
        'watch',
        'copy'
    ]);



    //在命令行调用 grunt 时，会直接执行该任务。
    //如果要执行其他任务，请指定任务名称，如 grunt test
    Tasks.register();


};