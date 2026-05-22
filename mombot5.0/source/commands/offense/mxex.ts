loadvar $user_command_line
loadvar $bot_name

gosub :player~quikstats
if (($player~current_prompt <> "Citadel") and ($player~current_prompt <> "Command"))
	setvar $switchboard~message "Must start MXEX From Citadel or Command Prompts!*"
	gosub :switchboard~switchboard
	halt
end

setvar $startprompt $player~current_prompt
setvar $start_ship $player~ship_number

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
getword $user_command_line $parm1 1
isnumber $tst $parm1
if ($tst = 0)
	setvar $nojoy true
elseif ($parm1 < 1)
	setvar $nojoy true
end
getword $user_command_line $parm2 2
isnumber $tst $parm2
if ($tst = 0)
	setvar $nojoy true
elseif ($parm2 < 1)
	setvar $nojoy true
end
getword $user_command_line $parm3 3
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
	setvar $switchboard~message "Moth-Ship Number Cannot Be Same As Tow-Ship*"
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
setvar $moth_good false
setvar $tow_good false

if ($startprompt = "Citadel")
	send "cv*yn"&$parm1&"*q  q  q  wn*l "&$planet&"*c "
else
	send "cv*yn"&$parm1&"*q  wn*"
end

gosub :pad
settextlinetrigger nadda :nadda "You do not own any other ships in this sector!"
settextlinetrigger moth :moth $parm2&" "&$pad&$player~current_sector&" "
if ($parm3 >= 1)
	gosub :pad
	settextlinetrigger town :town $parm3&" "&$pad&$player~current_sector&" "
end
settextlinetrigger done :done "Choose which ship to tow (Q=Quit)"
pause

:nadda
killalltriggers
setvar $switchboard~message "No empty ships in Current Sector*"
gosub :switchboard~switchboard
halt

:moth
setvar $moth_good true
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
if ($moth_good = false)
	setvar $switchboard~message "Moth ship doesn't appear to be in sector*"
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
	setvar $mac "Q  Q  X   "&$parm2&"*    *    "
else
	setvar $mac "X   "&$parm2&"*    *    "
end

if ($parm3 >= 1)
	setvar $mac $mac&"W N "&$parm3&"*  "
end

setvar $mac $mac&"Mz "&$parm1&"**             * R     *    "
if ($startprompt = "Citadel")
	setvar $mac $mac&"X    "&$start_ship&"*    *    *   L "&$planet&"* c @"
else
	setvar $mac $mac&"X    "&$start_ship&"*    *    *   @"
end

:reload
settextlinetrigger gogo :gogo "just launched a Photon Torpedo!"
settextlinetrigger script :script "script?"
setdelaytrigger abort :abort 300000
pause

:abort
killalltriggers
setvar $switchboard~message "5mins Expired. Halting MXEX!*"
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

getwordpos $tmp $pos "[0;32m just"
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
setvar $scan_array[$idx] currentline
add $idx 1

:damage_done
killalltriggers
if ($idx > 1)
	send "'*"
	waiton "Comm-link open on sub-space band"
	setvar $j 1
	while ($j < $idx)
		send $scanarray[$j]&"*"
		add $j 1
	end
	send "*"
	waiton "Sub-space comm-link terminated"
end
halt

:status
send "'*"
waiton "Type sub-space message"
send "{" $bot_name "} - MXEX Attacking: "&$parm1&", Moth Ship: "&$parm2
if ($parm3 >= 1)
	send ", Towing Ship: "&$parm3
end
send "**"
waiton "Sub-space comm-link terminated"
return
include "source\include\player"

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
include "source\include\switchboard.ts"
