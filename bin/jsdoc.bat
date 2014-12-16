


set tmpl=msdn

cd jsdoc_toolkit-2.4.0



set root=..\..
set build=%root%\build
set doc=%root%\doc
set src=%build%\src

set A=%src%\core\*.js
set B=%src%\excore\*.js
set C=%src%\browser\*.js
set D=%src%\current\*.js
set Z=%src%\MiniQuery.js

java -jar jsrun.jar app\run.js -a -D="noGlobal:true" -t=templates\%tmpl% %A% %B% %C% %D% %Z% -d=%doc%

cd ..








