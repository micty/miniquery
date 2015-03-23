
## MiniQuery JavaScript Library

MiniQuery 是一个 JavaScript 的通用库，扩展了 JavaScript 语言原有的功能，使编写 JavaScript 程序变得更加轻易。
MiniQuery 并非扩展 JavaScript 的原型对象，因为那样做会导致很多隐患。
MiniQuery 使用自己的命名空间和通用模块定义方式对模块进行管理。


###更新历史

#### 3.2.1 [2015.03.17]
- 1.给 Emitter 模块增加 destroy 方法。

#### 3.3.0  [2015.03.20]
- 1.把 Module 的 require 方法，由原来的以 require('/xxx') 加载短名称模块的方式改成 require(module, name) 的方式。
通过给 module 加一个随机的 token 字段以标识是 define 中的 module 对象。
- 2.给 begin.js 增加 Function.prototype.bind 的兼容性代码。

#### 3.3.1 [2015.03.23]
- 1.优化 require(module, name) 中识别参数 module 的方式，通过判断全等来识别。
- 2.把 Function.prototype.bind 的兼容性代码单独成一个文件。



