
## MiniQuery JavaScript Library

MiniQuery 是一个 JavaScript 的通用库，扩展了 JavaScript 语言原有的功能，使编写 JavaScript 程序变得更加轻易。
MiniQuery 并非扩展 JavaScript 的原型对象，因为那样做会导致很多隐患。
MiniQuery 使用自己的命名空间和通用模块定义方式对模块进行管理。


####目录结构

-1.构建工具
    bin 目录包含了构建工具和脚本。直接运行 bin\build.bat 即可进行构建。
    
-2.构建的输出目录
    build
        release 存放构建生成的库文件，包含 debug 和 min 两个版本
        src 构建过程中产生的临时目录，用于存放要构建的 js 文件
    sdk 构建最终生成的库文件，包含 debug 和 min 两个版本
    doc 文档目录
    
-3.构建需要的运行环境
    1.需要安装 Java 运行环境
    2.需要设置环境变量
    
-4.测试用例
    test 目录包含测试用例，直接打开 index.html 即可看到测试结果。
    test\index.html 依赖 sdk\miniquery.debug.js 文件