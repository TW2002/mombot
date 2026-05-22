gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Used to gather port and sector information by scanning as you ride"
setvar $help~help[2] $help~tab&"along in a citadel with another player moving a planet."
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&"  Usage: ridealong [on/off]  "
gosub :help~helpfile

gosub :player~currentprompt
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "You must run ridealong from a citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

send "qdc"
settextlinetrigger planetnum :planetnum "Planet #"
settextlinetrigger incit :incit "Citadel treasury contains"
pause

:planetnum
killtrigger planetnum
getword currentline $planet 2
striptext $planet "#"
pause

:incit
killalltriggers

setvar $switchboard~message "Ridealong active on planet " & $planet & ".*"
gosub :switchboard~switchboard

# Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)
:start
waiton "lifts off from"
settexttrigger ismined :mined "Mined Sector:"
settexttrigger notmined :notmined "Citadel treasury contains"
send "S"
pause

:mined
send "N"
pause

:notmined
killtrigger ismined
killtrigger notmined
goto :start

include "source/include/loadvars.ts"
include "source/include/player.ts"
include "source/include/help.ts"
include "source/include/switchboard.ts"
