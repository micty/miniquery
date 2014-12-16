


/**
* 硬件信息。
* @namespace
*/
var Device = (function ($, Device, ViewPort) {

    /**
    * HAE 需要返回的 Native 的硬件信息 Device，包括:
    * {
    *    cpu:800,          //单位Mhz
    *    mem:1024,         //单位M,
    *    os:'Android',     //操作系统:Android/iOS
    *    osVersion:'4.0',  //操作系统版本
    *    vendor:'sumsang', //设备厂商
    *    model:'galaxy s3',//设备型号
    *    density:1,        //屏幕密度，Android下取值0.75,1,1.5,2,iOS取值1,2
    *    screenInch:3.5,   //屏幕尺寸(对角线)，单位英寸
    *    getRotation:function(){}  //屏幕旋转角度，0~3,分别代表逆时针旋转的0,90,180,270度
    *    setRotation:function(rotation){}
    * },
    *
    * Viewport 为程序可以显示的区域
    * {
    *    absoluteWidth:320, //viewport的绝对宽度,单位px,iphone4s上按照640*960来算
    *    absoluteHeight:460,//viewport的绝对高度,单位px,和app.xml是否设置了状态栏有关
    * }
    */

    /**@inner*/
    var dpis = {
        "0.75": 'ldpi',
        "1": 'mdpi',
        "1.5": 'hdpi',
        "2": 'xhdpi'
    };

    return {

        /**
        * 获取设备的dpi，分四种:ldpi,mdpi,hdpi,xhdpi,分别和Android对应
        * 对于iOS，非视网膜屏对应mdpi，视网膜屏对应xhdpi
        */
        dpi: dpis[Device.density],

        /**
        * 设备的cpu频率，单位Mhz
        */
        cpu: Device.cpu,

        /**
        * 获取设备的物理内存
        */
        mem: Device.mem,

        /**
        * phone/pad
        */
        profile: Device.screenInch > 4.5 ? 'pad' : 'phone',

        /**
        * Android/iOS
        */
        os: Device.os,

        /**
        * 操作系统版本
        */
        osVersion: Device.osVersion,

        /**
        * 获取设备厂商信息
        */
        vendor: Device.vendor,

        /**
        * 返回设备型号，类似.iPhone4/S3等信息
        */
        model: Device.model,

        /**
        * 获取viewport的宽度,这里的单位为程序坐标！
        */
        viewportWidth: ViewPort.absoluteWidth / Device.density,

        /**
        * 获取viewport的高度,这里的单位为程序坐标！
        */
        viewportHeight: ViewPort.absoluteHeight / Device.density,

        /**
        * 将包含适配信息的路径替换为实际的路径
        * @image的写法时参照android的
        * res/@image/abc.png==>res/image-hdpi/abc.png
        * @param path
        */
        adapterPath: function (path) {
            return path.replace(/@(\w*)/g, function (m) {
                var v = m.replace('@', '');
                return v + '-' + dpis[Device.density];
            });
        }
    };


})(Haf, Hae.Device, Hae.ViewPort);
