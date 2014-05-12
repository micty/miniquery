

; (function ($, This) {


This.extend(This, { /**@lends MiniQuery.Object */


    /**
    * 一个简单的方法来判断一个对象是否为 window 窗口。
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为 window 窗口则返回 true；否则返回 false
    * @example
        $.Object.isWindow( {} ); //false
        $.Object.isWindow(top);  //true
    */
    isWindow: function (obj) {
        return obj &&
            typeof obj == 'object' &&
            'setInterval' in obj;
    },

    /**
    * 一个简单的方法来判断一个对象是否为 document 对象。
    * @param {Object} obj 要进行检测的对象，可以是任何类型
    * @return {boolean} 一个检测结果，如果为  document 对象则返回 true；否则返回 false
    * @example
        $.Object.isDocument( {} );      //false
        $.Object.isDocument(document);  //true
    */
    isDocument: function (obj) {
        return obj &&
            typeof obj == 'object' &&
            'getElementById' in obj;
    }
    


});




})(MiniQuery, MiniQuery.Object);
