gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setvar $HELP~HELP[1] $HELP~TAB&"Used to gather port and sector information by scanning as you ride"
setvar $HELP~HELP[2] $HELP~TAB&"along in a citadel with another player moving a planet."
setvar $HELP~HELP[3] $HELP~TAB&"       "
setvar $HELP~HELP[4] $HELP~TAB&"  Usage: ridealong   "
gosub :HELP~HELPFILE

gosub :player~currentprompt
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "You must run ridealong from a citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

# Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)

:START
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
goto :START

include "source/include/loadvars.ts"
include "source/include/player.ts"
include "source/include/help.ts"
include "source/include/switchboard.ts"
