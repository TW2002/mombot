logging off
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1] $HELP~TAB&"clearbusts"
setVar $HELP~HELP[2] $HELP~TAB&"  - Will clear all busts in database."
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "Bust Clearer starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

:clearbusts
setVar $i 11
while ($i <= SECTORS)
	setSectorParameter $i "BUSTED" ""
	setSectorParameter $i "FAKEBUST" ""
	add $i 1
end
setVar $SWITCHBOARD~message "Bust data for this bot has been cleared.*"
gosub :SWITCHBOARD~switchboard
halt

#INCLUDES:
include "source\include\help"
include "source\include\switchboard.ts"
