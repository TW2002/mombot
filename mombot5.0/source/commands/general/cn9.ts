gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~username
loadvar $bot~letter
loadvar $bot~password
loadvar $bot~subspace

setvar $help~help[1] $help~tab&"cn9"
setvar $help~help[2] $help~tab&"  - Resets the cn settings in the game to bot desirable settings."
gosub :help~helpfile

gosub :player~currentprompt
setvar $bot~validprompts "Citadel Command Computer"
gosub :player~checkstartingprompt
if ($player~startinglocation = "Computer")
	send "q"
end
gosub :player~startcnsettings
setvar $switchboard~message "CN Settings are reset for this bot.*"
gosub :switchboard~switchboard
halt

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
