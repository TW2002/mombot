gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadVar $BOT~ARMID_COUNT_FILE

setVar $HELP~HELP[1] $HELP~TAB&"CALL - Call SaveMe Command"
setVar $HELP~HELP[2] $HELP~TAB&"       Used to trigger a SaveMe Script"
setVar $HELP~HELP[3] $HELP~TAB&"     "
setVar $HELP~HELP[4] $HELP~TAB&"       - Originally written by Cherokee"
gosub :HELP~HELPFILE

getwordpos " "&$bot~user_command_line&" " $pos " kill "
if ($pos > 0)
	setvar $combat~kill true
else
	setvar $combat~kill false
end

getwordpos " "&$bot~user_command_line&" " $pos " cap "
if ($pos > 0)
	setvar $combat~cap true
else
	setvar $combat~cap false
end

gosub :combat~callsaveme
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\xenter"
include "source\include\player"
include "source\include\planet"
include "source\include\combat"
include "source\include\help"
