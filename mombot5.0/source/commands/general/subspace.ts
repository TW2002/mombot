	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE


	setVar $HELP~HELP[1]  $HELP~TAB&"subspace [channel] "
	setVar $HELP~HELP[2]  $HELP~TAB&"  Changes subspace channel "
	gosub :HELP~HELPFILE

	

:subspace

setVar $BOT~validPrompts "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT

isNumber $isvalid $bot~parm1

if ($isvalid <> true)
	setVar $SWITCHBOARD~message "Subpace channel entered was not a number.*"
	gosub :SWITCHBOARD~switchboard	
else
	if ($bot~parm1 > 60000)
		setVar $SWITCHBOARD~message "Subspace channel can not be greater than 60000. *"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setvar $bot~subspace $bot~parm1
	savevar $bot~subspace
	setVar $SWITCHBOARD~message "Subpace channel changing... *"
	gosub :SWITCHBOARD~switchboard	
	send "cn4"
	settextlinetrigger 1 :bad "You cannot change the sub-space radio channel for another"
	settextlinetrigger 2 :good "Enter a number from 0 to "
	pause

	:bad
	setVar $SWITCHBOARD~message currentline&"*"
	gosub :SWITCHBOARD~switchboard	
	send "q q "
	halt
	:good
	send $BOT~subspace&"* q q "
end

halt


# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
