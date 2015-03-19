
@rem 该批处理文件由 Grunt 工具生成

set name={name}
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
{list}


cd %home%
