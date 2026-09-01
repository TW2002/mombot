gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"MEX - Mass Enter Export"
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Triggers off a photon fired from current sector.   "
setvar $help~help[4] $help~tab&"Moves you into attack sector, then exports to  "
setvar $help~help[5] $help~tab&"the safe ship.   "
setvar $help~help[6] $help~tab&"   "
setvar $help~help[7] $help~tab&"Usage:  mex [target sector] [safe ship] {tow ship}"
setvar $help~help[8] $help~tab&"   "
setvar $help~help[9] $help~tab&"   [target sector] - adjacent sector to attack."
setvar $help~help[10] $help~tab&"   [safe ship] - ship to xport into after attack."
setvar $help~help[11] $help~tab&"   {tow ship} - optional ship to tow."
setvar $help~help[12] $help~tab&"   "
setvar $help~help[13] $help~tab&"Once set, triggers will timeout after 5 minutes."
gosub :help~helpfile

gosub :player~quikstats
if (($player~current_prompt <> "Citadel") and ($player~current_prompt <> "Command"))
	setvar $switchboard~message "Must start MEX From Citadel or Command Prompts!*"
	gosub :switchboard~switchboard
	halt
end

setvar $startprompt $player~current_prompt

if ($startprompt = "Citadel")
	send "qdc"
	waiton "Planet #"
	getword currentline $planet 2
	striptext $planet "#"
	isnumber $tst $planet
	if ($tst = 0)
		setvar $switchboard~message "Unable To Obtain Planet Number*"
		gosub :switchboard~switchboard
		halt
	end
	waiton "Citadel command"
	send "sz*"
	waiton "Warps to Sector(s) :"
	waiton "Citadel command"
else
	send "  **  "
	waiton "Warps to Sector(s) :"
	waiton "Command [TL="
end
setvar $nojoy false
getword $bot~user_command_line $parm1 1
isnumber $tst $parm1
if ($tst = 0)
	setvar $nojoy true
elseif ($parm1 < 1)
	setvar $nojoy true
end
getword $bot~user_command_line $parm2 2
isnumber $tst $parm2
if ($tst = 0)
	setvar $nojoy true
elseif ($parm2 < 1)
	setvar $nojoy true
end
getword $bot~user_command_line $parm3 3
isnumber $tst $parm3
if ($tst = 0)
	setvar $nojoy true
end

if ($nojoy)
	setvar $switchboard~message "Command Parameters Missing or Incorrect*"
	gosub :switchboard~switchboard
	halt
end
if ($parm2 = $parm3)
	setvar $switchboard~message "SAFE-Ship Number Cannot Be Same As Tow-Ship*"
	gosub :switchboard~switchboard
	halt
end
setvar $idx 1
while (sector.warps[$player~current_sector][$idx] <> 0)
	if (sector.warps[$player~current_sector][$idx] = $parm1)
		goto :adj_found
	end
	add $idx 1
end
setvar $switchboard~message "Not Adjacent To Target Sector*"
gosub :switchboard~switchboard
halt

:adj_found
setvar $safe_good false
setvar $tow_good false

if ($startprompt = "Citadel")
	send "cv*yn"&$parm1&"*q  q  q  wn*l "&$planet&"*c "
else
	send "cv*yn"&$parm1&"*q  wn*"
end

gosub :pad
settextlinetrigger nadda :nadda "You do not own any other ships in this sector!"
settextlinetrigger safe :safe $parm2&" "&$pad&$player~current_sector&" "
if ($parm3 >= 1)
	gosub :pad
	settextlinetrigger town :town $parm3&" "&$pad&$player~current_sector&" "
end
setslinetrigger done :done "Choose which ship to tow (Q=Quit)"
pause

:nadda
killalltriggers
setvar $switchboard~message "No empty ships in Current Sector*"
gosub :switchboard~switchboard
halt

:safe
setvar $safe_good true
pause

:town
setvar $tow_good true
pause

:done
killalltriggers

if ($startprompt = "Citadel")
	waiton "Citadel command"
else
	waiton "Command [TL="
end
if ($safe_good = false)
	setvar $switchboard~message "SAFE ship doesn't appear to be in sector*"
	gosub :switchboard~switchboard
	halt
end
if (($parm3 >= 1) and ($tow_good = false))
	setvar $switchboard~message "Tow Ship doesn't appears to be in sector*"
	gosub :switchboard~switchboard
	halt
end
gosub :status

if ($startprompt = "Citadel")
	setvar $mac "Q  Q   "
else
	setvar $mac "  "
end

if ($parm3 >= 1)
	setvar $mac $mac&"W N "&$parm3&"*  "
end

setvar $mac $mac&"Mz "&$parm1&"**             * R     *    "
if ($startprompt = "Citadel")
	setvar $mac $mac&"X    "&$parm2&"*    *    *   L "&$planet&"* c @"
else
	setvar $mac $mac&"X    "&$parm2&"*    *    *   @"
end

:reload
settextlinetrigger gogo :gogo "just launched a Photon Torpedo!"
settextlinetrigger script :script "script?"
setdelaytrigger abort :abort 300000
pause

:abort
killalltriggers
setvar $switchboard~message "5mins Expired. Halting MEX!*"
gosub :switchboard~switchboard
halt

:script
killalltriggers
gosub :status
goto :reload

:gogo
killalltriggers
setvar $idx 1
setarray $scanarray 1000
setvar $tmp currentansiline

getwordpos $tmp $pos #27&"[0;32m just"
if ($pos = 0)
	goto :reload
end
settextlinetrigger damage :collect_damage "The console reports damages of "
settextlinetrigger damage_done :damage_done "Average Interval Lag:"
settextlinetrigger damage_pod :collect_pod "You rush to an escape pod and abandon ship..."
send $mac
pause

:collect_damage
setvar $scanarray[$idx] currentline
add $idx 1
settextlinetrigger damage :collect_damage "The console reports damages of "
pause

:collect_pod
setvar $scanarray[$idx] currentline
add $idx 1

:damage_done
killalltriggers
if ($idx > 1)
	setvar $switchboard~message ""
	setvar $j 1
	while ($j < $idx)
		setvar $switchboard~message $switchboard~message&$scanarray[$j]&"*"
		add $j 1
	end
	gosub :switchboard~switchboard
end
halt

:status
setvar $switchboard~message "MEX Attacking: "&$parm1&", SAFE Ship: "&$parm2
if ($parm3 >= 1)
	setvar $switchboard~message $switchboard~message&", Towing Ship: "&$parm3
end
setvar $switchboard~message $switchboard~message&"*"
gosub :switchboard~switchboard
return

:pad
setvar $pad ""
getlength $player~current_sector $len
if ($len = 1)
	setvar $pad "    "
elseif ($len = 2)
	setvar $pad "   "
elseif ($len = 3)
	setvar $pad "  "
elseif ($len = 4)
	setvar $pad " "
end
return

# includes:
include "source\include\loadvars"
include "source\include\player"
include "source\include\help"
include "source\include\switchboard.ts"
