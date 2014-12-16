


module.exports = (function (grunt, $, This) {

    'use strict';


    var list = [];
    var name$config = {};


    function add(name, key, config) {

        if (typeof key != 'string') { //add(name, config)
            config = key;
            key = undefined;
        }


        if (key) {
            var obj = name$config[name];
            if (!obj) {
                obj = name$config[name] = {};
            }
            obj[key] = config;
        }
        else {
            name$config[name] = config;
        }

        if (key) {
            name += ':' + key;
        }
        list.push(name);

    }


    function setConfig(name, key, config) {

        if (typeof name == 'object') { //setConfig(config)
            config = name;
            $.Object.extend(name$config, config);
            return;
        }

        if (typeof key == 'object') {//setConfig(name, config)
            config = key;
            var obj = name$config[name];
            if (!obj) {
                name$config[name] = config;
            }
            else {
                $.Object.extend(obj, config);
            }

            return;
        }

        var obj = name$config[name];
        if (!obj) {
            obj = name$config[name] = {};
            obj[key] = config;
        }
        else {
            $.Object.extend(obj, config);
        }
    }


    var isConfigInited = false;

    function register(name, tasks) {
        if (!isConfigInited) {
            grunt.initConfig(name$config);
            isConfigInited = true;
        }

        if (name instanceof Array) { //register(tasks)
            tasks = name;
            name = 'default';
        }

        grunt.registerTask(name || 'default', tasks || list);
    }

    function load(names) {

        if (names instanceof Array) {
            for (var i = 0; i < names.length; i++) {
                grunt.loadNpmTasks(names[i]);
            }
        }
        else if (typeof names == 'string') {
            grunt.loadNpmTasks(names);
        }
        else {
            //自动分析 package.json 文件，并加载所找到的 grunt 模块
            require('load-grunt-tasks')(names || grunt);
        }
    }

    function loadContrib(names) {

        if (names instanceof Array) {

            var a = $.Array.keep(names, function (item, index) {
                return 'grunt-contrib-' + item;
            });

            load(a);
        }
        else {
            load('grunt-contrib-' + names);
        }
    }


    //当 noAddTask 为 true 时，表示只设置 config，但不添加任务
    function use(name, noAddTask) {


        var obj = require('../tasks/' + name + '.js');

        if (!obj || typeof obj != 'object') {
            console.log('../tasks/' + name + '.js 的返回值不是一个有效的 Object ');
            return;
        }

        if (noAddTask === true) {
            if (obj.target) {
                This.setConfig(obj.name, obj.target, obj.config);
            }
            else {
                This.setConfig(obj.name, obj.config);
            }
        }
        else {
            if (obj.target) {
                This.add(obj.name, obj.target, obj.config);
            }
            else {
                This.add(obj.name, obj.config);
            }
        }


    }



    return $.Object.extend(This, {
        add: add,
        setConfig: setConfig,
        register: register,
        load: load,
        loadContrib: loadContrib,
        use: use
    });


})(require('grunt'), require('./MiniQuery'), {});

