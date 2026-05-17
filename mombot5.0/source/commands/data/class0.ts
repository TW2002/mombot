gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"Reports both Class 0 sectors if known."
setVar $HELP~HELP[2]  $HELP~TAB&" "
setVar $HELP~HELP[3]  $HELP~TAB&"class0 (sector)"
gosub :HELP~HELPFILE

loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
:TEST




send "'*"
send "Zarkahn's Class 0 Report*"
send "Rylos is Sector: " RYLOS "*"
send "Alpha Centauri is Sector: " ALPHACENTAURI "*"
send "Class 0 Report Complete*"
send "*"
halt
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
