
@rem 该批处理文件由 Grunt 工具生成

set name=node
set version={version}

set tmpl=msdn

cd ..
set root=..\..
set build=%root%\build
set bin=%root%\bin

set home=%build%\%name%\%version%
set doc=%home%\doc
set src=%home%\src

cd %bin%/jsdoc_toolkit-2.4.0

java -jar jsrun.jar app\run.js -a -D="noGlobal:true" -t=templates\%tmpl% -d=%doc% ^
%root%/src/core/Module.js ^
%root%/src/core/$.js ^
%root%/src/core/Array.js ^
%root%/src/core/Boolean.js ^
%root%/src/core/Date.js ^
%root%/src/core/Math.js ^
%root%/src/core/MiniQuery.js ^
%root%/src/core/Object.js ^
%root%/src/core/String.js ^
%root%/src/excore/Emitter/Helper.js ^
%root%/src/excore/Emitter/Tree.js ^
%root%/src/excore/Emitter.js ^
%root%/src/excore/Mapper.js ^
%root%/src/excore/Module.js ^
%root%/src/excore/Url.js


cd %home%
