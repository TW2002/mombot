logging "OFF"
loadvar $bot_name
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
goto :gridcheck_start
include "source\include\planet"

:gridcheck_start
getsectorparameter sectors "FIGSEC" $isfigged
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$user_command_line&" " $pos " b "
if ($pos > 0)
	setvar $bwarp true
else
	setvar $bwarp false
end

:get_info
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must must start grid check from citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
setvar $homesec $player~current_sector

:checkship
killalltriggers
send "c;q"
waitfor "Mine Max:"
getword currentline $maxlimpets 6

:start
gosub :randomizer

killalltriggers
send "qm***tnt1*"
gosub :player~quikstats
gosub :getplanetinfo
send "q"
gosub :assemble_mac

:select_boomsec
gosub :player~quikstats
if ($player~total_holds > $player~ore_holds)
	goto :no_ore
end
if ($player~twarp_type = "No")
	setvar $switchboard~message "Must have T-warp to run this script.*"
	gosub :switchboard~switchboard
	halt
end

:getsector
getrnd $random 1 $database_count
getword $database $warpto $random
if ($warpto = 0)

	setvar $switchboard~message "Entire Grid Checked.*"
	gosub :switchboard~switchboard
	halt
end

:clearit
killalltriggers
setvar $temp " "&$warpto&" "
replacetext $database $temp " "
subtract $database_count 1
if (sector.explored[$warpto] = "YES")
	setvar $temp " "&$warpto&" "
	replacetext $database $temp " "
	subtract $database_count 1
	goto :getsector
end
if ($bwarp = false)
	send "q q * "
	gosub :twarp
else
	gosub :bwarp
end

:hittingsec
killalltriggers
send $mac
goto :select_boomsec

:twarp
killalltriggers
send "m" $warpto "*"
settexttrigger there :adj_warp "You are already in that sector!"
settextlinetrigger adj_warp :adj_warp "Sector  : "&$warpto
settextlinetrigger locking :locking "That Warp Lane is not adjacent"
pause

:adj_warp
killalltriggers
send "zn"
goto :twarp_adj

:locking
killalltriggers
send "y"
settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
settextlinetrigger no_ore :no_ore "You do not have enough Fuel Ore"
pause

:no_ore
killalltriggers
setvar $switchboard~message "Planet is out of fuel.  Please refill before running again.*"
gosub :switchboard~switchboard
halt

:twarp_adj
killalltriggers
send "zn"
return

:twarp_lock
killalltriggers
send "y*zn"
return

:no_twarp_lock
killalltriggers
send "n*zn"
send "l "&#8&$planet "*c"
setsectorparameter $warpto "FIGSEC" false
setvar $temp " "&$warpto&" "
replacetext $database $temp " "
subtract $database_count 1
goto :select_boomsec

:bwarp
killalltriggers
send "b" $warpto "*"
settexttrigger go :go5 "TransWarp Locked"
settexttrigger no :no5 "No locating beam found"
settexttrigger outta_ore :no_ore "This planet does not have enough Fuel Ore to transport you."
pause

:no5
killalltriggers
send "n"
waitfor "Transporter shutting down."
setsectorparameter $warpto "FIGSEC" false
setvar $temp " "&$warpto&" "
replacetext $database $temp " "
subtract $database_count 1
goto :select_boomsec

:go5
killalltriggers
send "yzn"
return

:ending
halt

:randomizer
setvar $rnd_count 0
setvar $database_count 0
setvar $database ""

:rnd_loop
setvar $switchboard~message "Calculating unexplored sectors..*"
gosub :switchboard~switchboard
setvar $percfigs 0
while ($rnd_count < sectors)
	add $rnd_count 1
	getsectorparameter $rnd_count "FIGSEC" $isfigged
	if (($avoidedsectors[$rnd_count] = false) and (($isfigged = true) and (sector.explored[$rnd_count] <> "YES")))
		setvar $database $database&" "&$rnd_count
		add $database_count 1
	end
	setvar $perctest (($rnd_count * 100) / sectors)
	if ($perctest > $percfigs)
		setvar $percfigs (($rnd_count * 100) / sectors)
		echo "*"
		echo #27 "["&($percfigs / 2)&"C"
		echo ansi_15 "" ansi_9 " " $percfigs "%" #27&"[1A   "
	end
end
setvar $switchboard~message "" $database_count " sectors in current grid need exploring.  Starting now.*"
gosub :switchboard~switchboard

return

:assemble_mac
setvar $mac " *  z n  s z h* "
setvar $mac $mac&"m"&$homesec&"*yy*  l "&#8&$planet&"*  z  n  z  n  *  mnt*  tnt1**  cr*  "
return

:return_triggers
settexttrigger incit :incit "To which Sector"
settexttrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
settexttrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
pause

:incit
killalltriggers
return

:igd
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Citadel")
	halt
end
if (($player~current_prompt = "Computer") or ($player~current_prompt = "Corporate") or ($player~current_prompt = "NavPoint"))
	send "q"
	waitfor "Command [TL"
end
gosub :callsaveme
halt

:callsaveme
killalltriggers
send "q q q * * * * "
gosub :player~quikstats
setvar $figstodeploy 1
setvar $savetarget $player~current_sector
if ($savetarget < 10)
	setvar $savetarget 0000&$savetarget
elseif ($savetarget < 100)
	setvar $savetarget 000&$savetarget
elseif ($savetarget < 1000)
	setvar $savetarget 00&$savetarget
elseif ($savetarget < 10000)
	setvar $savetarget 0&$savetarget

end
gosub :deployfigs
send "'"&$savetarget&"=saveme*"
send "'pickup "&$player~current_sector&" ::*"

:waitforhelp
settextlinetrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
settextlinetrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
settextlinetrigger towlocked :towlocked "locks a tractor beam on your ship."
setdelaytrigger timeout :timeout 30000
pause

:timeout
killalltriggers
setvar $switchboard~message "30 seconds after save call, script halted.*"
gosub :switchboard~switchboard
goto :pausegridder

:friendlytwarp
killalltriggers
setvar $figstodeploy "ALL"
gosub :deployfigs
goto :waitforhelp

:friendlyplanet
killalltriggers
gettext currentline $planet_saveme "Saveme script activated - Planet " " to "
send "L "&#8&$planet_saveme&"* C 'I landed on planet "&$planet_saveme&"*"
goto :pausegridder

:towlocked
killalltriggers
setvar $figstodeploy 1
gosub :deployfigs
send "'Tow locked, get us out of here!*"
goto :pausegridder

:deployfigs
:pausegridder
halt

if ($figstodeploy = 0)
	setvar $figstodeploy 1
end
if (($player~current_sector < 11) or ($player~current_sector = stardock))
	send "'Can't deploy figs in fed*"
	return
end
send "a y y 9999* F"
settextlinetrigger nocontrol :nocontrol "These fighters are not under your control."
settextlinetrigger abletodeploy :abletodeploy "fighters available."
pause

:nocontrol
killalltriggers
setvar $switchboard~message "We don't control the figs in this sector!*"
gosub :switchboard~switchboard
return

:abletodeploy
killalltriggers
getword currentline $figsavailable 3
striptext $figsavailable ","
if ($figstodeploy = "ALL")
	setvar $figstodeploy $figsavailable
end
if ($figsavailable = 0)
	send "0* ZC D* '{"&$bot_name&"} - I have no figs to deploy!*"
else
	send $figstodeploy&"* ZC D* '"&$figstodeploy&" figs deployed*"
end
return

:getline
killtrigger done
add $cnt 1
setvar $culine currentline
replacetext $culine #179 " "&#179&" "
setvar $line[$cnt] $culine
getwordpos $culine $pos " Ship "
if ($pos > 0)
	goto :done_read
end
goto :chk

:chk
return

:done_read
return

:clearscreen
echo #27&"[2J"
return

:turnoffansi
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword currentline $ansistatus 5
waiton "(2) Animation display"
getword currentline $animationstatus 5
if ($animationstatus = "On")
	send 2
end
if ($ansistatus = "On")
	send "1 q q"
else
	send "q q"
end
waiton "<Computer deactivated>"
return

:turnonansi
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword currentline $ansistatus 5
if ($ansistatus = "Off")
	send "1 q q"
else
	send "q q"
end
waiton "<Computer deactivated>"
return

:landonplanetentercitadel
send "l "&#8&$planet "* c"
waiton "<Enter Citadel>"
return

:leavecitadelandplanet
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return

:header
return

:clearscreen
echo #27&"[2J"
return

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
setvar $planet_fuel $planet~planet_fuel
setvar $planet_fuel_max $planet~planet_fuel_max
setvar $planet_organics $planet~planet_organics
setvar $planet_organics_max $planet~planet_organics_max
setvar $planet_equipment $planet~planet_equipment
setvar $planet_equipment_max $planet~planet_equipment_max
setvar $planet_fighters $planet~planet_fighters
setvar $planet_fighters_max $planet~planet_fighters_max
setvar $citadel $planet~citadel
setvar $citadel_credits $planet~citadel_credits
setvar $atmosphere_cannon $planet~atmosphere_cannon
setvar $sector_cannon $planet~sector_cannon
return
killtrigger citadelstart
killtrigger cannon

return
include "source\include\switchboard.ts"
