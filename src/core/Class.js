
/**
* 提供创建类的工厂方法
* @namespace
*/
MiniQuery.Class = {

    /**
    * 用工厂模式创建一个类。
    * @param {Object} instances 类中的实例成员，即 prototype 的中成员。
    * @param {function} [instances.constructor] 构造函数，要创建的类的真正的构造函数；
        如果不提供，则使用一个默认的空函数实现。
    * @param {Object} [statics] 类中的静态成员。
        如果想给类提供一些静态成员，则可指定此参数。
    * @return {function} 返回一个类的构造器。
    * @example
        var Person = $.Class.create( { //实例成员
            //构造函数
            constructor: function(name, age) {
                this.name = name;
                this.age = age;
                this.type = Person.getType();
            },
            
            sayHi: function() {
                console.log(' hi, my type is ' + this.type );
                console.log(' and my name is ' + this.name );
                console.log(' and I am ' + this.age + ' years old');
            }

        }, { //静态成员
            getType: function() {
                return 'Person';
            }
        });
        
        var man = new Person('micty', 29);
        man.sayHi();
        console.log( Person.getType() );
    */
    create: function (instances, statics) {
        var prototype = instances;

        //如果未提供构造函数，则使用一个默认的实现
        prototype.constructor = prototype.constructor || function () { };
        prototype.constructor.prototype = prototype;

        MiniQuery.extend(prototype.constructor, statics); //静态成员

        return prototype.constructor;
    },

    /**
    * 用继续一个类的方式去创建一个新的类。
    * @param {function} SuperClass 要继续的超类，即父类。
    * @param {Object} instances 类中的实例成员，即 prototype 的中成员。
    * @param {function} [instances.constructor] 构造函数，要创建的类的真正的构造函数；
        如果不提供，则使用一个默认的空函数实现。
    * @param {Object} [statics] 类中的静态成员。
        如果想给类提供一些静态成员，则可指定此参数。
    * @return {function} 返回一个类的构造器。
    * @example
        var Person = $.Class.create( { //实例成员
            //构造函数
            constructor: function(name, age) {
                this.name = name;
                this.age = age;
                this.type = Person.getType();
            },
            
            sayHi: function() {
                console.log(' hi, my type is ' + this.type );
                console.log(' and my name is ' + this.name );
                console.log(' and I am ' + this.age + ' years old');
            }
        }, { //静态成员
            getType: function() {
                return 'Person';
            }
        });
        
        var Student = $.Class.inherit(Person, {
            constructor: function(name, age, school) {
                Person.call(this, name, age);
                this.school = school;
                this.type = Student.getType();
            },
            
            sayHi: function() {
                Person.prototype.sayHi.call(this);
                console.log(' and I am at ' + this.school + ' school' );
            }
        }, {
        
            getType: function() {
                return 'Student';
            }
        });
        
        var pp = new Person('abc', 31);
        pp.sayHi();
        console.log(Person.getType());
        
        var st = new Student('micty', 29, 'SZU');
        st.sayHi();
        console.log( Student.getType() );
        console.log( st instanceof Student );   //true
        console.log( st instanceof Person );    //true
        console.log( st instanceof Object );    //true
        
    */
    inherit: function (SuperClass, instances, statics) {
        instances = MiniQuery.extend(new SuperClass(), instances);
        statics = MiniQuery.extend({}, SuperClass, statics);

        return MiniQuery.Class.create(instances, statics);
    }

};

