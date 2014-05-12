

/**
* 元数据管理器，提供统一的方法来管理对象的中的私有数据。
* 内部使用的工具类。
* @namespace
*/
var Meta = (function ($) {

    var all = { };
    var name = '__guid__';

   

    /**
    * 获取指定对象中的 guid 值。
    */
    function getGuid(obj, autoAdd) {
        
        //优化 #1-0
        //if (!$.Object.isNonNull(obj)) { //空对象，即不能设置属性的对象
        //    return undefined;
        //}



        if (obj.hasOwnProperty(name)) { //只取自己的，不取继承下来的
            return obj[name];
        }

        if (autoAdd === true) {
            var guid = $.Guid.get(name, 'auto-guid_{0}');
            obj[name] = guid;
            return guid;
        }

        return undefined;
    }

    /**
    * 给指定对象设置 guid 值。
    */
    function setGuid(obj, guid) {
        obj[name] = guid;
    }


    /**
    * 给指定对象设置元数据。
    * @param {Object} obj 要设置元数据的目标对象。
    * @param {string} key 元数据的键名称。
    * @param value 元数据的值。
    * param {boolean} [isSafely=false] 是否安全的写入。
        默认为 false。 当指定为 true 时，采用不覆盖的方式进行写入。
        即只有目标对象不存在 key 所对应的元数据时，才会写入；否则忽略。
    */
    function set(obj, key, value, isSafely) {

        var guid = getGuid(obj, true);

        var list = all[guid];
        if (!list) {
            list = all[guid] = {};
        }

        if (typeof key == 'object') { //重载 key = { a:1, b:2 } 的情况，此时为 set(obj, maps, isSafely)

            //参数修正
            var maps = key;
            isSafely = value;

            if (isSafely) {
                $.Object.extendSafely(list, maps);
            }
            else {
                $.Object.extend(list, maps);
            }
        }
        else { // key 为字符串
            if (!isSafely || !(key in list)) {
                list[key] = value;
            }
        }

    }

    /**
    * 安全地设置(当不存在该元数据时，才会写入；否则忽略)
    */
    function setSafely(obj, key, value) {
        if ($.Object.isPlain(key)) {
            set(obj, key, true);
        }
        else {
            set(obj, key, value, true);
        }
    }


    /**
    * 获取指定对象的指定键所对应的值。
    * @param {Object|function} 要获取的关联对象。
    * @param {string} key 要获取的键。
    * @param [value] 如果指定，则表示当要获取的值不存在时，自动把该值添加进去。 
        如果已存在，则不覆盖。
    */
    function get(obj, key, value) {

        //如果指定了 value，则表示当不存在 key 对应的值时，自动把参数 value 添加进去
        var autoAdd = value !== undefined;

        var guid = getGuid(obj, autoAdd);
        if (!guid) {

            if (autoAdd) { //指定了要自动添加，但无法完成
                throw Haf.error('给参数 obj 分配 guid 失败，请确保 obj 为非空对象');
            }

            return undefined;
        }
        
        if (autoAdd) {
            setSafely(obj, key, value);
        }

        var list = all[guid];
        return list ? list[key] : undefined;

    }

    /**
    * 移除元数据。
    */
    function remove(obj, key) {

        var guid = getGuid(obj);
        if (!guid) { // obj 尚未有元数据
            return;
        }

        //未指定键，则移除全部
        if (key === undefined) {
            delete all[guid];
            return;
        }
        
        //否则只移除指定键的
        var list = all[guid];
        if (!list) {
            return;
        }

        delete list[key];
    }



    //静态方法
    return {
        get: get,
        set: set,
        setSafely: setSafely,

        getGuid: getGuid,
        setGuid: setGuid,
        remove: remove

        //for debug
        , _all: all
    };

})(Haf);

