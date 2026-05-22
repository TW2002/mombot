logging off
gosub :help~initialize
setvar $help~help[1] $help~tab&"clearbusts"
setvar $help~help[2] $help~tab&"  - Will clear all busts in database."
gosub :help~helpfile

setvar $switchboard~message "Bust Clearer starting up!*"
gosub :switchboard~switchboard

:clearbusts
setvar $i 11
while ($i <= sectors)
	setsectorparameter $i "BUSTED" ""
	setsectorparameter $i "FAKEBUST" ""
	add $i 1
end
setvar $switchboard~message "Bust data for this bot has been cleared.*"
gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\include\help"
include "source\include\switchboard.ts"
