gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"subspace [channel] "
setvar $help~help[2]  $help~tab&"  Changes subspace channel "
gosub :help~helpfile

:subspace
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt

isnumber $isvalid $bot~parm1

if ($isvalid <> true)
	setvar $switchboard~message "Subpace channel entered was not a number.*"
	gosub :switchboard~switchboard
else
	if ($bot~parm1 > 60000)
		setvar $switchboard~message "Subspace channel can not be greater than 60000. *"
		gosub :switchboard~switchboard
		halt
	end
	setvar $bot~subspace $bot~parm1
	savevar $bot~subspace
	setvar $switchboard~message "Subpace channel changing... *"
	gosub :switchboard~switchboard
	send "cn4"
	settextlinetrigger 1 :bad "You cannot change the sub-space radio channel for another"
	settextlinetrigger 2 :good "Enter a number from 0 to "
	pause

	:bad
	setvar $switchboard~message currentline&"*"
	gosub :switchboard~switchboard
	send "q q "
	halt

	:good
	send $bot~subspace&"* q q "
end

halt

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
