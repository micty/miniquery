



/**
* @description 提供类的定义和创建实例的工具类。
* @namespace
*/
var Class = (function ($, Haf, ClassManager, ClassEvent, Loader, Logger, Meta) {


    /**
    * 定义一个类。
    * @memberOf Class
    * @param {string} className 类的名称，可以包括命名空间。
    * @param {Object} data 配置数据。 保留的字段名：
        'abstract': true/false，表示是否为抽象类，只能用字符串引起来；
        config: {}，字段成员，实例化后可以通过 set/get 进行存取，并会触发相应的 onbeforechange 和 onchange 事件；
        configListeners: {}，针对 config 中的成员的 onbeforechange 和 onchange 事件处理函数；
        extend: string，要继承的父类完全名称；
        listeners: {}，自定义事件处理函数，实例化可以通过 trigger(eventName) 来触发；
        requires: string|[]，依赖的类，会先加载依赖项；
        singleton: true/false，表示是否为单实例，如果为 true，则在定义好类之后立即创建一个实例覆盖类变量；
        statics: {}，类的静态成员；
        xtype: string，类的简短别名，具有唯一性，即一个 xtype 只能用于一个类；

    * @return {function} 返回类的构造函数。
    */
    function define(className, data) {


        if (data.extend) { //先加载父类(如果有)
            Loader.loadClass(data.extend);
        }
        else { //未指定父类，则默认为 Haf.Base(不需要加载)
            data.extend = 'Haf.Base'; //这里修改了原始数据，但影响不大。
        }

        if (data.requires) { //先加载依赖的类(如果有)
            Loader.requires(data.requires);
        }


        //必须先让父类加载进来，因为当前类的 config 会用到父类的 config
        ClassManager.setData(className, data);  //把原始数据维护起来


        var listeners = ClassManager.getFamilyListeners(className); //得到一个数组
        var configListeners = ClassManager.getFamilyConfigListeners(className);
        var isAbstract = data['abstract'] === true;
        var rebinds = data.rebinds;
        
        // isInnerCall: 
        //  undefined: 创建普通实例时当前类的调用，即通过 Haf.create() 的调用;
        //  true: 创建原型实例时的调用，即通过 ClassManager.createPrototype(data) 的调用;

        //当前类的构造器
        var F = ClassManager.setClass(className, function (config, isInnerCall) {

            //只针对当前类，忽略原型和父类。 abstract 是关键字，在 hae 中会引起错误
            if (isAbstract && !isInnerCall) {
                throw Haf.error('{0} 是一个抽象类，不能创建它的实例。', className);
            }

            //分配 guid
            var guid = className + ':' + $.Guid.next(className) + '/' + $.Guid.next('totalInstance');
            Meta.setGuid(this, guid);
            Meta.set(this, 'className', className);
            

            //实例字段
            this.config = ClassManager.getConfig(className); //获取当前类的 config (已与父类的 config 合并)
            this.xtype = data.xtype; // xtype 只属于实例自己的，不在原型上，不具有继承特性


            //创建普通实例时
            if (!isInnerCall) { //创建原型实例时，不需要绑定实例事件和字段事件

                var self = this;

                if (listeners) { //类的事件
                    $.Array.each(listeners, function (item, index) {
                        self.on(item);
                    });
                }

                if (configListeners) { //字段事件
                    $.Array.each(configListeners, function (item, index) {
                        ClassManager.bindConfigListeners(self, item);
                    });
                }

                
                this.initialize(config);
                this.initialize = ClassManager.noInitialize; //重写，不允许再调用 initialize

                if (rebinds) { //把方法重绑定到新的对象

                    var origins = {};
                    Meta.set(self, 'originalMethods', origins);

                    $.Array.each(rebinds.names, function (name, index) {

                        var fn = self[name];
                        origins[name] = fn;

                        self[name] = function () {
                            var target = rebinds.target;
                            if (typeof target == 'function') {
                                target = target.call(self);
                            }

                            var args = $.Array.parse(arguments);
                            return fn.apply(target, args);
                        };
                    });
                }


            }

            //Logger.debug('创建实例: {0}', guid);

        });

        var prototype = ClassManager.createPrototype(data); //创建原型，会动态加载父类
        prototype.constructor = F; //修正构造器

        //链接原型
        F.prototype = prototype;

        //静态成员
        var statics = data.statics;
        if (statics) {
            $.Object.extend(F, statics);
        }

        Meta.setGuid(F, className);

        //通知外部 define 完成
        ClassEvent.trigger(className);

        if (data.xtype) { //外部请不要同时绑定 className 和 xtype 的，否则都会触发
            ClassEvent.triggerXtype(data.xtype);
        }

        //Logger.debug('定义类: {0}', className);


        //单实例，用创建出来的实例覆盖类名。
        if (data.singleton === true) {
            return $.Object.namespace(className, new F(data.config));
        }

        return F; //返回创建出来的类构造器
    }


    /**
    * 创建指定类的实例。
    * @param {string} [className] 要创建的类名。
        如果不指定类名，则使用参数 config 中的 xtype 或 xclass 来创建。
    * @param {Object} config 实例的数据成员。
    * @return {Object} 返回指定类的实例。
    */
    function create(className, config) {

        if (typeof className == 'object') { //此时为 { xtype: '' }
            config = className;

            var xtype = config.xtype;
            var xclass = config.xclass;

            if (xclass) {
                className = xclass;
            }
            else if (xtype) {
                className = ClassManager.getClassNameByXtype(xtype);
                if (!className) {
                    throw new Haf.error('不存在 xtype 为 {0} 的类', xtype);
                }
            }
            else {
                throw new Haf.error('通过 config 对象创建实例时，必须指定 xtype 或 xclass');
            }
        }

        if (ClassManager.isSingleton(className)) {
            throw Haf.error('{0} 是一个单实例的类，无法创建它的实例。', className);
        }

        var F = ClassManager.getClass(className); //
        var obj = new F(config || {});
        return obj;
    }


    //Class = 
    return {

        define: define,
        create: create
    };

})(Haf, Haf, ClassManager, ClassEvent, Loader, Logger, Meta);
