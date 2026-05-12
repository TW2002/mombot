loadVar $bot~command
loadVar $MAP~stardock
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadVar $PLAYER~unlimitedGame        
loadvar $SWITCHBOARD~bot_name 
loadvar $SWITCHBOARD~self_command 

setVar $HELP~HELP[1]  $HELP~TAB&"find - Search TWX-DBase for Fighter/Port data"
setVar $HELP~HELP[2]  $HELP~TAB&"  "
setVar $HELP~HELP[3]  $HELP~TAB&"   find [f/nf/fp/p/de/ufde] [type] {sector} [port type]"
setVar $HELP~HELP[4]  $HELP~TAB&"     - [type] :       [de]ad-end or"
setVar $HELP~HELP[5]  $HELP~TAB&"                      [f]igged or  "
setVar $HELP~HELP[6]  $HELP~TAB&"                      [nf] no-fig or  "
setVar $HELP~HELP[7]  $HELP~TAB&"                      [fp] figged port or "
setVar $HELP~HELP[8]  $HELP~TAB&"                      [p]ort or  "
setVar $HELP~HELP[9]  $HELP~TAB&"                      [ufde] un-figged dead end"
setVar $HELP~HELP[10] $HELP~TAB&"     - {sector}       sector number that you need finder data on,  "
setVar $HELP~HELP[11] $HELP~TAB&"                      (default is current sector)"
setVar $HELP~HELP[12] $HELP~TAB&"     - [port type]    port type (s)ell , (b)uy, or (x) either"
setVar $HELP~HELP[13] $HELP~TAB&"                      (ex: s, b, sxb, bxb, sxx, etc.)"             
setVar $HELP~HELP[14] $HELP~TAB&"     - [upgraded]     only list upgraded ports"
setVar $HELP~HELP[15] $HELP~TAB&"     - [write {file}] write output to specified file on local disk"
gosub :HELP~HELPFILE

gosub :search~find
halt

# includes:
include "source\include\search"
include "source\include\loadvars"
include "source\include\help"
