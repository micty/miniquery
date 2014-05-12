//








/**
* 维护由 Haf.define 创建的类的列表。
* 内部使用的工具类。
* @namespace
*/
var ClassManager = (function ($, Haf, Loader, Meta) {

    var baseName = 'Haf.Base';
    var baseXtype = 'base';

    //Haf.define(className, data) 中的 data 中的具有特殊作用的保留字段。 
    var reservedFields = [ //为方便维护，请按升序存放。
        'abstract',
        'config',
        'configListeners',
        'extend',
        'listeners',
        'requires',
        'singleton',
        'statics',
        'xtype'
    ];

    //一对一的关系
    var name$data = {};         //维护 { className: data } 这样的原始集合
    var name$superName = {};    //维护 { className: 直接父类 className } 的关系
    var xtype$superXtype = {};  //维护 { xtype: 直接父类 xtype } 的关系
    var xtype$name = {};        //维护 { xtype: className } 的关系
    var name$class = {};        //维护 { className: constructor} 的关系，对 singleton 的特别有用
    var name$config = {};       //维护 { className: 自上而下合并后的 config } 的关系，实现字段继承

    //采用预先计算的技术，避免在需要时再去实时计算取结果。
    //因为 y = f(x)，当 x 确定时，y 也随之确定，可以先计算出结果放在 { x: y } 映射关系里维护起来。
    var name$familyDatas = {};  //维护 { className: [父类A.data, ... 当前类.data] } 的关系，其中 A 是 N 的父类
    var name$familyNames = {};  //维护 { className: [父类A.className, ... 当前类.className] } 的关系
    var xtype$familyXtypes = {};//维护 { xtype: [父类A.xtype, ... 当前类.xtype] } 的关系


    //一对多的关系
    var name$childNames = {};   //维护 { clasName: [直接子类className] } 的关系
    var xtype$childXtypes = {}; //维护 { xtype: [直接子类xtype] } 的关系


    


    /**
    * 建立起各种映射关系。
    * @param {string} className 类的名称
    * @param {Object} data 类的配置数据
    */
    function setData(className, data) {

        //维护 {xtype: className} 的关系
        var xtype = data.xtype;
        if (xtype) {
            if (xtype in xtype$name) {
                throw Haf.error('xtype: {0} 已给 {1} 类占用', xtype, xtype$name[xtype]);
            }

            xtype$name[xtype] = className;
        }


        var superName = data.extend || baseName;

        //维护 {className: data} 这样的原始集合
        data.extend = superName;
        name$data[className] = data;

        //维护 {className: config} 的集合。
        //父类的 config 与当前类的 config 进行合并，从而实现 config 字段的继承
        name$config[className] = $.Object.extend({}, name$config[superName], data.config);


        //维护 {className: superClassName} 的关系
        name$superName[className] = superName;



        name$familyDatas[className] = $.Array.add(name$familyDatas[superName], data);
        name$familyNames[className] = $.Array.add(name$familyNames[superName], className);


        //把当前类的 className 存入 name$childNames 对应的父类数组中
        name$childNames[superName] = $.Array.add(name$childNames[superName], className);


        if (xtype) { //创建类时指定了 xtype

            //找到父类的 xtype
            var superXtype = superName == baseName ?
                    baseXtype :
                    name$data[superName].xtype;

            xtype$superXtype[xtype] = superXtype;

            xtype$familyXtypes[xtype] = $.Array.add(xtype$familyXtypes[superXtype], xtype);


            //找到父类所关联的子 xtype 数组，并把当前的 xtype 添加进去。
            xtype$childXtypes[superXtype] = $.Array.add(xtype$childXtypes[superXtype], xtype);
            
        }

        //给每个方法分配一个 guid 和元数据。
        //这会对方法产生一个字段的污染，但不影响使用。
        $.Object.each(data, function (key, fn) {
            if (typeof fn != 'function') {
                return;
            }

            var guid = $.String.format('{0}.{1}', className, key);

            Meta.setGuid(fn, guid);

            //设置元数据
            Meta.set(fn, {
                'className': className,
                'methodName': key
            }); 
        });
    }

    /**
    * 获取指定类的类定义数据。
    * 该方法可以获取 Haf.define(className, data) 中的 data 对象。
    * @param {string} className 要获取的类的名称。
    * @param {number} [upLevel=0] 相对于 className 所在的类(当前类)，沿着继承层次向上的层数。
        当前类为 0；当前类的父类为 1；当前类的父类的父类为 2；依次类推。
    * @return {Object} 返回类定义时的数据对象。
        如果不存在该类对应的定义数据，则返回一个默认的对象。
    */
    function getData(className, upLevel) {

        //传进来的是一个实例，则默认取其 className 元数据
        if (typeof className == 'object') {
            className = Meta.get(className, 'className');
        }


        upLevel = upLevel || 0; //向上追着

        while (upLevel > 0) { //向上追溯的层次
            className = name$superName[className];
            upLevel--;
        }

        return name$data[className] || {
            extend: baseName,
            requires: [],
            config: {},
            statics: {}
        };
    }

    /**
    * 获取指定 xtype 所对应的类定义数据。
    * 该方法可以获取 Haf.define(className, data) 中的 data 对象。
    * @param {string} xtype 要获取的类的 xtype。
    * @param {number} [upLevel=0] 相对于 xtype 所在的类(当前类)，沿着继承层次向上的层数。
        当前类为 0；当前类的父类为 1；当前类的父类的父类为 2；依次类推。
    * @return {Object} 返回类定义时的数据对象。
        如果不存在该类对应的定义数据，则返回一个默认的对象。
    */
    function getDataByXtype(xtype, upLevel) {

        var className = xtype$name[xtype]; //xtype -> className

        if (!className) {
            throw Haf.error('不存在 xtype 为 {0} 的类', xtype);
        }

        return getData(className, upLevel);
    }

    /**
    * 关联一个类名和构造函数。
    */
    function setClass(className, constructor) {

        name$class[className] = constructor; //内部维护一份关系: 类名 -> 构造器
        $.Object.namespace(global, className, constructor); //set
        return constructor;
    }

    /**
    * 通过类名获取该类的构造器。
    * 该类必须是通过 Haf.define 的方式定义实现的。
    * 当不存在该类，则尝试用同步方式动态加载并返回该类的构造器。
    * @param {string} className 要加载的类的完全名称。
    * @param {int} [upLevel=0] 向上追溯的层次。
        0: 表示当前类; 
        1: 表示父类;
        2: 表示父类的父类;
        依次类推
    * @return {Function} 返回该类的构造器。
    */
    function getClass(className, upLevel, autoLoad) {

        switch (typeof upLevel) {

            case 'undefined': //此时为  getClass(className)
                upLevel = 0; //向上追溯
                autoLoad = true;
                break;

            case 'number':  //此时为 getClass(className, upLevel) 或 getClass(className, upLevel, autoLoad)
                if (autoLoad === undefined) { //此时为 getClass(className, upLevel)
                    autoLoad = true;
                }
                break;

            case 'boolean': //此时为 getClass(className, autoLoad)
                autoLoad = upLevel;
                upLevel = 0;
                break;

            default:
                throw Haf.error('无法识别参数 upLevel 的类型');
        }

        while (upLevel > 0) { //向上追溯的层次
            className = name$superName[className];
            upLevel--;
        }

        // 这里用原始的，可以获取到 singleton 的构造器。
        // 而 $.Object.namespace(global, className) 会获取到 singleton 的实例，而不是构造器。
        // 另外，Haf.Base 不在 name$class 的列表中，而 $.Object.namespace(global, className) 是可以获取到 Haf.Base 的。
        var F = name$class[className] || $.Object.namespace(global, className);
        if (!F && autoLoad) {

            Loader.loadClass(className);
            F = name$class[className] || $.Object.namespace(global, className);
        }

        return F;
    }

    


    /**
    * 根据配置数据去创建当前类的 prototype 实例
    */
    function createPrototype($data) {

        var className = $data.extend;   //父类的类名称

        var prototype;
        if (className == 'Haf.Base') {
            prototype = new Haf.Base();
        }
        else {
            var data = getData(className);  //父类的配置数据
            var F = getClass(className);    //父类的构造器，会去同步地动态加载(如果还没有)
            prototype = new F(data.config, true);
        }

        //移除保留的成员，只保留用户自定义的成员。
        var props = $.Object.remove($data, reservedFields);

        //把当前类的其他成员拷到原型对象上，从而实现继续和重写(同名的覆盖)
        $.Object.extend(prototype, props);

        return prototype;
    }

   
    /**
    * 给指定实例的 config 中的成员绑定事件处理函数。
    */
    function bindConfigListeners(self, listeners) {
        
        //这里只对 listeners 作迭代，而不是去迭代 config。
        //因为 listeners 包含的成员是 config 的成员的一个子集，从而可以减少迭代次数。
        $.Object.each(listeners, function (key, item) {

            if ($.Object.isArray(item)) { //优化 #3-0
                $.Array.each(item, function (item, index) {
                    bind(item);
                });
            }
            else {
                bind(item);
            }

            //内部的公用函数
            function bind(item) {

                if (typeof item == 'function') {

                    self.onchange(key, item);
                }
                else if ($.Object.isPlain(item)) {

                    var when = item.when;
                    if (when == 'before') {
                        self.onbeforechange(key, item.fn);
                    }
                    else if (when == 'after') {
                        self.onchange(key, item.fn);
                    }
                    else {
                        throw new Error('未识别的 when 字段: ' + when);
                    }
                }
                else {
                    throw new Error('未识别的配置成员值: ', +key);
                }
            }
            
        });
    }



    /**
    * 判断指定的对象是否为指定类的实例。
    * 该方法会检测指定类及原型链上的类。
    * @param {Object} obj 要进行检测的对象。
    */
    function isInstanceOf(obj, className) {

        if ( !obj || typeof obj != 'object' ) {
            return false;
        }

        var type = typeof className;

        //构造器
        var F = type == 'string' ? getClass(className) :
            type == 'function' ? className : null;

        if (!F) {
            return false;
        }

        return obj instanceof F;
    }



    
    

    //ClassManager = 
    return {


        /**
        * 获取指定 className 的所有父类的 className，返回一个数组(包括自己)。
        * 该方法从继承层次上向上搜索所有父类的 className，但不包括根类 Haf.Base。
        */
        getFamilyNames: function (className) {
            return name$familyNames[className];
        },

        /**
        * 获取指定 xtype 的所有父类的 xtype，返回一个数组
        * 该方法从继承层次上向上搜索所有父类的 xtype，但不包括根类 Haf.Base。
        */
        getFamilyXtypes: function (xtype) {
            return xtype$familyXtypes[xtype];
        },


        getChildXtypes: function(xtype) {
            return xtype$childXtypes[xtype];
        },

        setData: setData,
        getData: getData,

        getDataByXtype: getDataByXtype,

        getClassNameByXtype: function (xtype) {
            return xtype$name[xtype];
        },

        getConfig: function (className) {
            var config =  name$config[className];
            return $.Object.extendDeeply({}, config); //拷贝一份，因为类的 config 是共用的，不能直接暴露出去
        },

        getFamilyListeners: function (className) {
            var datas = name$familyDatas[className];
            var a = $.Array.map(datas, function (data, index) {
                return data.listeners || null;
            });

            return a.length > 0 ? a : null;
        },

        getFamilyConfigListeners: function (className) {
            var datas = name$familyDatas[className];
            var a = $.Array.map(datas, function (data, index) {
                return data.configListeners || null;
            });
            return a.length > 0 ? a : null;
        },

        setClass: setClass,
        getClass: getClass,

        /**
        * 判断指定的类是否为单实例的类。
        */
        isSingleton: function (className) {

            var data = name$data[className];
            if (!data) {
                return false;
            }

            return data.singleton === true;
        },


        createPrototype: createPrototype,
        bindConfigListeners: bindConfigListeners,

        isInstanceOf: isInstanceOf,

        noInitialize: function() {
            throw Haf.error('initialize 方法仅允许在类的定义中给调用，且只允许调用一次。');
        },

        getXtypeTree: function () {
            return $.Object.map(xtype$childXtypes, function (key, item) {
                return item.slice(0);
            });
        },

        getClassTree: function () {
            return $.Object.map(name$childNames, function (key, item) {
                return item.slice(0);
            });
        }
    };



})(Haf, Haf, Loader, Meta); //结束内部使用的 ClassManager


