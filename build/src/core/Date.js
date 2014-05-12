
/**
* 日期时间工具
* @class
*/
MiniQuery.Date = function (date) {
    return new MiniQuery.Date.prototype.init(date);
};

; (function ($, This, $String) { /**@lends MiniQuery.Date */



/**
* 把指定的时间或当前时间转成一定格式的字符串。
* @param {Date} [datetime=new Date()] 要进行转换的日期时间。<br />
    如果不指定，则默认为当前时间。
* @param {string} formater 格式化字符串。详见 format 方法的说明。
* @return {string} 返回一个格式化后的日期时间字符串。
* @example
    //返回当前时间的格式字符串，类似 '2013-04-29 09:21:59 上午'
    $.Date.toString('yyyy-MM-dd HH:mm:ss TT'); 

    //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
    $.Date.toString(new Date(), 'yyyy年M月d日 h:m:s dddd')
*/
This.toString = function (datetime, formater) {
    if (typeof datetime == 'string') { //此时为 toString(formater)
        formater = datetime;
        datetime = new Date();
    }

    return This.format(datetime, formater);

};//这里不要弄到下面的 extend 中，因为它使用的是 for in，而在 IE6/IE8 中，是枚举不到重写的内置成员的


$.extend(This, { /**@lends MiniQuery.Date */
    /**
    * 获取当前系统时间。
    * @return 返回当前系统时间实例。
    * @example
        $.Date.now();
    */
    now: function () {
        return new Date();
    },

    /**
    * 把参数 value 解析成等价的日期时间实例。
    * 当无法解析时，会抛出异常。
    * @param {Date|string} value 要进行解析的参数，可接受的类型为：<br />
    *   1.Date 实例<br />
    *   2.string 字符串，包括调用 Date 实例的 toString 方法得到的字符串，也包括以下格式: 
        <pre>
            yyyy-MM-dd
            yyyy.MM.dd
            yyyy/MM/dd
            yyyy_MM_dd
                
            HH:mm:ss
                
            yyyy-MM-dd HH:mm:ss
            yyyy.MM.dd HH:mm:ss
            yyyy/MM/dd HH:mm:ss
            yyyy_MM_dd HH:mm:ss
        </pre>
    * @return 返回一个日期时间的实例。
    * @example
        $.Date.parse('2013-04-29 09:31:20');
    */
    parse: function (value) {
        if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                throw new Error('参数是非法的日期实例');
            }

            return value;
        }

        if (typeof value != 'string') {
            throw new Error('不支持该类型的参数：' + typeof value);
        }


        //标准方式
        var date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }

        /*
            自定义方式：
                yyyy-MM-dd
                yyyy.MM.dd
                yyyy/MM/dd
                yyyy_MM_dd
                
                HH:mm:ss
                
                yyyy-MM-dd HH:mm:ss
                yyyy.MM.dd HH:mm:ss
                yyyy/MM/dd HH:mm:ss
                yyyy_MM_dd HH:mm:ss
                
        */

        function GetDate(s) {
            var now = new Date();

            var separator =
                s.indexOf('.') > 0 ? '.' :
                s.indexOf('-') > 0 ? '-' :
                s.indexOf('/') > 0 ? '/' :
                s.indexOf('_') > 0 ? '_' : null;

            if (!separator) {
                throw new Error('无法识别的日期格式：' + s);
            }

            var ps = s.split(separator);

            return {
                yyyy: ps[0],
                MM: ps[1] || 0,
                dd: ps[2] || 1
            };
        }

        function GetTime(s) {
            var separator = s.indexOf(':') > 0 ? ':' : null;
            if (!separator) {
                throw new Error('无法识别的时间格式0：' + s);
            }

            var ps = s.split(separator);

            return {
                HH: ps[0] || 0,
                mm: ps[1] || 0,
                ss: ps[2] || 0
            };
        }


        var parts = value.split(' ');
        if (!parts[0]) {
            throw new Error('无法识别的格式1：' + value);
        }

        var date = parts[0].indexOf(':') > 0 ? null : parts[0];
        var time = parts[0].indexOf(':') > 0 ? parts[0] : (parts[1] || null);

        if (date || time) {
            if (date && time) {
                var d = GetDate(date);
                var t = GetTime(time);
                return new Date(d.yyyy, d.MM - 1, d.dd, t.HH, t.mm, t.ss);
            }

            if (date) {
                var d = GetDate(date);
                return new Date(d.yyyy, d.MM - 1, d.dd);
            }

            if (time) {
                var now = new Date();
                var t = GetTime(time);
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.HH, t.mm, t.ss);
            }
        }

        throw new Error('无法识别的格式2：' + value);



    },

    /**
    * 把日期时间格式化指定格式的字符串。
    * @param {Date} datetime 要进行格式化的日期时间。
    * @param {string} formater 格式化的字符串。<br />
        其中保留的占位符有：
    <pre>
        'yyyy': 4位数年份
        'yy': 2位数年份
        'MM': 2位数的月份(01-12)
        'M': 1位数的月份(1-12)
        'dddd': '星期日|一|二|三|四|五|六'
        'dd': 2位数的日份(01-31)
        'd': 1位数的日份(1-31)
        'HH': 24小时制的2位数小时数(00-23)
        'H': 24小时制的1位数小时数(0-23)
        'hh': 12小时制的2位数小时数(00-12)
        'h': 12小时制的1位数小时数(0-12)
        'mm': 2位数的分钟数(00-59)
        'm': 1位数的分钟数(0-59)
        'ss': 2位数的秒钟数(00-59)
        's': 1位数的秒数(0-59)
        'tt': 上午：'AM'；下午: 'PM'
        't': 上午：'A'；下午: 'P'
        'TT': 上午： '上午'； 下午: '下午'
        'T': 上午： '上'； 下午: '下'
    </pre>
    * @return {string} 返回一个格式化的字符串。
    * @example
        //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
        $.Date.format(new Date(), 'yyyy年M月d日 h:m:s dddd')
    */
    format: function (datetime, formater) {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1;
        var date = datetime.getDate();
        var hour = datetime.getHours();
        var minute = datetime.getMinutes();
        var second = datetime.getSeconds();

        var padLeft = function (value, length) {
            return $String.padLeft(value, length, '0');
        };


        var isAM = hour <= 12;

        var map = {
            'yyyy': padLeft(year, 4),
            'yy': String(year).substr(-2),
            'MM': padLeft(month, 2),
            'M': month,
            'dddd': '星期' + ('日一二三四五六'.charAt(datetime.getDay())),
            'dd': padLeft(date, 2),
            'd': date,
            'HH': padLeft(hour, 2),
            'H': hour,
            'hh': padLeft(isAM ? hour : hour - 12, 2),
            'h': isAM ? hour : hour - 12,
            'mm': padLeft(minute, 2),
            'm': minute,
            'ss': padLeft(second, 2),
            's': second,
            'tt': isAM ? 'AM' : 'PM',
            't': isAM ? 'A' : 'P',
            'TT': isAM ? '上午' : '下午',
            'T': isAM ? '上' : '下'
        };

        var s = formater;

        for (var key in map) {
            s = $String.replaceAll(s, key, map[key]);
        }

        return s;

    },

    /**
    * 将指定的年份数加到指定的 Date 实例上。
    * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的年份数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addYear(new Date(), 5); //假如当前时间是2013年，则返回的日期实例的年份为2018
        $.Date.addYear(-5);//假如当前时间是2013年，则返回的日期实例的年份为2008
    */
    addYears: function (datetime, value) {
        //重载 addYear( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }


        var dt = new Date(datetime); //新建一个副本，避免修改参数
        dt.setFullYear(datetime.getFullYear() + value);

        return dt;
    },

    /**
    * 将指定的月份数加到指定的 Date 实例上。
    * @param {Date} [datetime=new Date()] 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的月份数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addMonths(new Date(), 15); //给当前时间加上15个月
    */
    addMonths: function (datetime, value) {
        //重载 addMonths( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setMonth(datetime.getMonth() + value);

        return dt;
    },

    /**
    * 将指定的天数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的天数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addDays(new Date(), 35); //给当前时间加上35天
    */
    addDays: function (datetime, value) {
        //重载 addDays( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setDate(datetime.getDate() + value);

        return dt;
    },

    /**
    * 将指定的小时数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的小时数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addHours(new Date(), 35); //给当前时间加上35小时
    */
    addHours: function (datetime, value) {
        //重载 addHours( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setHours(datetime.getHours() + value);

        return dt;
    },

    /**
    * 将指定的分钟数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的分钟数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addMinutes(new Date(), 90); //给当前时间加上90分钟
    */
    addMinutes: function (datetime, value) {
        //重载 addMinutes( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setMinutes(datetime.getMinutes() + value);

        return dt;
    },

    /**
    * 将指定的秒数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的秒数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addSeconds(new Date(), 90); //给当前时间加上90秒
    */
    addSeconds: function (datetime, value) {
        //重载 addSeconds( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setSeconds(datetime.getSeconds() + value);

        return dt;
    },



    /**
    * 将指定的毫秒数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间，如果不指定则默认为当前时间。
    * @param {Number} value 要增加/减少的毫秒数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。<br />
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $.Date.addMilliseconds(new Date(), 2000); //给当前时间加上2000毫秒
    */
    addMilliseconds: function (datetime, value) {
        //重载 addMilliseconds( value )
        if (!(datetime instanceof Date)) {
            value = datetime;
            datetime = new Date(); //默认为当前时间
        }

        var dt = new Date(datetime);//新建一个副本，避免修改参数
        dt.setMilliseconds(datetime.getMilliseconds() + value);

        return dt;
    }

});


})(MiniQuery, MiniQuery.Date, MiniQuery.String);