gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $player~unlimitedgame
loadvar $game~ptradesetting
loadvar $bot~bot_turn_limit
loadvar $bot~mcic_file

setvar $HELP~HELP[1] $HELP~TAB&"Used to gather port and sector information by scanning as you ride"
setvar $HELP~HELP[2] $HELP~TAB&"along in a citadel with another player moving a planet."
setvar $HELP~HELP[3] $HELP~TAB&"       "
setvar $HELP~HELP[4] $HELP~TAB&"  Usage: ridealong {holo}  "
setvar $HELP~HELP[5] $HELP~TAB&"       "
setvar $HELP~HELP[6] $HELP~TAB&"    {holo}   Will lift off and holo scan with each planet move"
setvar $HELP~HELP[7] $HELP~TAB&"             if there are adjacent unexplored sectors."
gosub :HELP~HELPFILE

getWordPos $bot~user_command_line $pos "holo"
if ($pos > 0)
	setVar $HOLO TRUE
else
	setVar $HOLO FALSE
end

gosub :player~currentprompt
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "You must run ridealong from a citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

send "qd"
waiton "Planet #"
getword CURRENTLINE $PLANET 2
striptext $PLANET "#"
send "c"
waiton "Citadel command"

# Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)
# Citadel treasury contains

:START
gosub :player~quikstats
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

waiton "Warps to Sector(s):"
setvar $LINE CURRENTLINE
striptext $LINE "Sector(s)"
getwordpos $LINE $pos "("
if ($player~unlimitedgame = FALSE) and ($player~turns <= $bot~bot_turn_limit)
	goto :start
end
if ($pos > 0) and ($HOLO = 1)
	send "Q Q S H L " & $PLANET & "* C"
	waiton "Warps to Sector(s):"
	waiton "Citadel command"
end

#setdelaytrigger TIMING :TIMING 25
#pause

#:TIMING
killalltriggers
goto :START

include "source/include/loadvars.ts"
include "source/include/help.ts"
include "source/include/player.ts"
include "source/include/switchboard.ts"
