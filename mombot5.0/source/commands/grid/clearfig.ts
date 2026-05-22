loadvar $bot_name
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $stardock

loadvar $unlimitedgame
loadvar $ptradesetting
loadvar $bot_turn_limit
loadvar $command

gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Clears adjacent fighters and calls saveme."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage: clearfig [sector] {defend}"
setvar $help~help[4] $help~tab&"       "
setvar $help~help[5] $help~tab&"Options:"
setvar $help~help[6] $help~tab&"   {defend}  For offensive fighters, just enters and retreats."
setvar $help~help[7] $help~tab&"       "
setvar $help~help[8] $help~tab&"From Citadel prompt grabs fighters from planet."
setvar $help~help[9] $help~tab&"From Command prompt grabs fighters from the sector."
gosub :help~helpfile

:adjfig
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Must start at Citadel or Command Prompt.*"
	gosub :switchboard~switchboard
	halt
end
setvar $pgridsector $parm1
isnumber $test $pgridsector
if ($test = 0)
	setvar $switchboard~message "Invalid FIGCLEAR number.*"
	gosub :switchboard~switchboard
	halt
end

if ($pgridsector = 0)
	setvar $switchboard~message "Invalid FIGCLEAR number.*"
	gosub :switchboard~switchboard
	halt
end
if ($pgridsector < 11)
	setvar $switchboard~message "Cannot FIGCLEAR into FedSpace!*"
	gosub :switchboard~switchboard
	halt
elseif ($pgridsector = $stardock)
	setvar $switchboard~message "Cannot FIGCLEAR into STARDOCK!*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "m * * * c "
end
if ($ship~ship_max_attack <= 0)
	gosub :ship~getshipstats
end

getwordpos $user_command_line $pos "def"
if ($pos > 0)
	setvar $defend true
else
	setvar $defend false
end

setvar $i 1
setvar $isfound false
while (sector.warps[$player~current_sector][$i] > 0)
	if (sector.warps[$player~current_sector][$i] = $pgridsector)
		setvar $isfound true
	end
	add $i 1
end
if ($isfound = false)
	setvar $switchboard~message "Cannot FIGCLEAR.  Sector not Adjacent, aborting..*"
	gosub :switchboard~switchboard
	halt
end
send "'{" $bot_name "} - Fig Clearing sector "&$pgridsector&"* c v* y* "&$pgridsector&"* q "
setvar $mac "     * "
setvar $i 1
if ($defend = false)
	setvar $fighters_available $player~fighters
	while ($fighters_available >= $ship~ship_max_attack)
		setvar $mac $mac&"a z "&($ship~ship_max_attack - 1)&"* * "
		add $i 1
		subtract $fighters_available ($ship~ship_max_attack - 1)
	end
end
setvar $mac $mac&"j r * f  z  1  * z  c  d  * "

:attackadjsector
gosub :player~quikstats
if ($player~fighters < $ship~ship_fighters_max)
	setvar $switchboard~message "Unable to proceed, not enough fighters.*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "Q Q * "
end
send "m " $pgridsector&$mac
gosub :player~quikstats

if ($player~current_sector = $pgridsector)
	send "'"&$pgridsector&"=saveme*"
	if ($startinglocation = "Citadel")
		setvar $i 0
		while ($i < 15)
			add $i 1
			send "l j"&#8&$planet~planet&"*  *  "
		end
	end
	setvar $switchboard~message "Successfully Fig Cleared sector "&$pgridsector&"*"
	gosub :switchboard~switchboard
else
	if ($startinglocation = "Citadel")
		send "l j"&#8&$planet~planet&"*  *  "
		gosub :current_prompt
		if ($current_prompt = "Planet")
			send "m* * *"
		else
			setvar $switchboard~message "Had to stop, planet appears to be gone.*"
			gosub :switchboard~switchboard
			halt
		end
	else
		send " F"
		waiton "Your ship can support up to"
		getword currentline $ftrs_to_leave 10
		striptext $ftrs_to_leave ","
		striptext $ftrs_to_leave " "
		if ($ftrs_to_leave < 1)
			setvar $ftrs_to_leave 1
		end
		send " "&$ftrs_to_leave&" * C D "
	end
	goto :attackadjsector
end
halt

:current_prompt
settexttrigger prompt :allpromptscatch #145&#8
send #145
pause

:allpromptscatch
getword currentline $current_prompt 1
if ($current_prompt = 0)
	getword currentansiline $current_prompt 1
end
striptext $current_prompt #145
striptext $current_prompt #8
return

# includes:
include "source\include\planet"
include "source\include\ship"
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
