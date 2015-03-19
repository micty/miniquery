
@rem 该批处理文件由 Grunt 工具生成

set name=default
set version=3.2.1

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
%src%/core/Module.js ^
%src%/core/$.js ^
%src%/core/Array.js ^
%src%/core/Boolean.js ^
%src%/core/Date.js ^
%src%/core/Math.js ^
%src%/core/Object.js ^
%src%/core/String.js ^
%src%/excore/Emitter/Tree.js ^
%src%/excore/Emitter.js ^
%src%/excore/Mapper.js ^
%src%/excore/Module.js ^
%src%/excore/Url.js ^
%src%/browser/Cookie/Expires.js ^
%src%/browser/Cookie.js ^
%src%/browser/LocalStorage.js ^
%src%/browser/SessionStorage.js ^
%src%/browser/Script.js ^
%src%/browser/Url.js ^
%src%/partial/default/MiniQuery.js


cd %home%
