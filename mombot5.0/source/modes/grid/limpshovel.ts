logging "OFF"
reqrecording
goto :load_script
include "source\include\planet"

:load_script
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
loadvar $stardock
loadvar $home_sector
loadvar $backdoor
loadvar $limpet_cost
loadvar $armid_cost
loadvar $limpet_removal_cost
loadvar $password
setvar $grid_limpets 3
setvar $grid_armids 3
setvar $refurb true
loadvar $fig_file
loadvar $limp_file
loadvar $armid_file
loadvar $command
loadvar $bot~folder
setvar $gridder_file $bot~folder&"/_MOM"&gamename&"_GRIDDER_TARGETS.txt"
setvar $master_edge_file $bot~folder&"/_MOM_"&gamename&"_EdgeMasterList.sectors"
setvar $unexplored_file $bot~folder&"/_MOM_UNEXPLORED_"&gamename&".sectors"
setvar $imlimped false
setvar $avoidedsectors ""
setarray $move sectors
setvar $checkedforinfo ""
setvar $grid_figs 1
setvar $attack_retreat false

getsectorparameter sectors "FIGSEC" $isfigged
getsectorparameter sectors "MINESEC" $isarmided
getsectorparameter sectors "LIMPSEC" $islimped
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Limpet reorganizer."
setvar $help~help[2] $help~tab&"Dumps limpets to borders of grid or near base if no border is available."
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&"  Usage: limpshovel {bwarp}"
setvar $help~help[5] $help~tab&"       "
setvar $help~help[6] $help~tab&"Options:"
setvar $help~help[7] $help~tab&"   {bwarp}  Use planetary transporter to hit sectors."
setvar $help~help[8] $help~tab&"            Default is twarp."
gosub :help~helpfile

setvar $max_sectors $parm1
isnumber $number $max_sectors
if ($number <> 1)
	setvar $switchboard~message "Amount of sectors to shovel not a number!*"
	gosub :switchboard~switchboard
	halt
end
if ($max_sectors <= 0)
	setvar $switchboard~message "Amount of sectors to shovel must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $user_command_line $pos "norefurb"
getwordpos $user_command_line $pos "bwarp"
if ($pos > 0)
	setvar $grid_warp "bwarp"
else
	setvar $grid_warp "twarp"
end

if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end
if ($islimped = "")
	setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
	gosub :switchboard~switchboard
	halt
end
if ($player~photons > 0)
	send "'Can not run with photons on your ship.*"
	halt
end

gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must start limpet shovel from citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

killalltriggers
setvar $homesec $player~current_sector
gosub :checkavoidedsectors

:checkfortargets
send "q"
gosub :getplanetinfo
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
gosub :landonplanetentercitadel
setvar $switchboard~message "M()M Limpet Shovel Powering Up!*"
gosub :switchboard~switchboard
waitfor "(?="

:checkship
killalltriggers
gosub :player~quikstats
send "c;q"
waitfor "Offensive Odds:"
getwordpos currentline $pos "Offensive"
cuttext currentline $oddline $pos 99
gettext $oddline $offodd "Odds:" ":1"
striptext $offodd " "
striptext $offodd "."
waitfor "Mine Max:"
gettext currentline $maxmines "Mine Max:" "B"
striptext $maxmines " "
waitfor "Figs Per Attack:"
getword currentline $figs 5
multiply $offodd $figs
divide $offodd 12
gosub :player~quikstats

:restart
send "q"
gosub :getplanetinfo
send "c "
gosub :findalltargetsectors
gosub :assemble_mac
gosub :assemble_return_mac
gosub :assemble_attack_mac
gosub :assemble_land_mac

:select_boomsec
killalltriggers
gosub :player~quikstats
if ($player~fighters < ($figs + 5))
	echo ansi_12 "*Not enough fighters to safely continue.*" ansi_7
	halt
end
if ($player~limpets >= ($maxmines - 20))

	getword $unload_sectors $warpto 1
	replacetext $unload_sectors " "&$warpto&" " " "
	if ($warpto = 0)
		getnearestwarps $nearest $homesec
		setvar $i 1
		while (($i <= $nearest) and ($warpto = 0))
			setvar $focus $nearest[$i]
			getwordpos $avoidedsectors $pos " "&$focus&" "
			getsectorparameter $focus "FIGSEC" $isfigged
			getsectorparameter $focus "LIMPSEC" $islimped
			if ($isfigged = "")
				setvar $isfigged false
			end
			if ($islimped = "")
				setvar $islimped false
			end
			if (($islimped = true) and (($isfigged = true) and ($pos <= 0)))
				setvar $warpto $focus
				setvar $avoidedsectors $avoidedsectors&" "&$focus&" "
			end
			add $i 1
		end
		if ($warpto = 0)
			echo ansi_12 "*No Limpet Dump Sectors Able to be Found.*" ansi_7
			halt
		end
	end

	if ($grid_warp = "twarp")
		gosub :dotwarp
	elseif ($grid_warp = "bwarp")
		gosub :bwarp
	else
		halt
	end
	killalltriggers
	setvar $justcheckingifalive false
	gosub :player~quikstats
	if (($twarp = "No") or ($player~current_sector <> $warpto))
		goto :callsaveme
	end
	send "h2 z"&$player~limpets&"*zc*"&$return_mac
	setvar $justcheckingifalive true
	gosub :player~quikstats
	if (($twarp = "No") or ($player~current_sector <> $homesec))
		goto :callsaveme
	end
	send $land_mac
	goto :select_boomsec
end
if ($twarp = "No")
	goto :callsaveme
end

:continueon
getrnd $random 1 $databasecount
getword $database $warpto $random
if ($warpto = 0)
	setvar $switchboard~message "Reorganized limpets in all sectors possible.*"
	gosub :switchboard~switchboard
	halt
end
getdistance $distance $homesec $warpto
if ($distance <= 0)
	send "^f"&$homesec&"*"&$warpto&"*q"
	waiton "ENDINTERROG"
	getdistance $distance $homesec $warpto
end

:clearit
killalltriggers
replacetext $database " "&$warpto&" " " "
subtract $databasecount 1
if ($distance <= 2)
	goto :select_boomsec
end
if ($grid_warp = "twarp")
	gosub :dotwarp
elseif ($grid_warp = "bwarp")
	gosub :bwarp
else
	halt
end

:hittingsec
killalltriggers
setvar $justcheckingifalive false
gosub :player~quikstats
if (($twarp = "No") or ($player~current_sector <> $warpto))
	goto :callsaveme
end
send $mac&$return_mac
setvar $justcheckingifalive true
gosub :player~quikstats
if (($twarp = "No") or ($player~current_sector <> $homesec))
	goto :callsaveme
end
send $land_mac
goto :select_boomsec

:findalltargetsectors
setvar $targetsectorcount 1
setvar $databasecount 0
setvar $database ""
setvar $adjacentdatabase ""
setvar $unload_sectors " "

echo ansi_14 "* Loading target sectors..*" ansi_7
setvar $perc 0

getnearestwarps $nearest $player~current_sector
setvar $i 1
if ($nearest < $max_sectors)
	setvar $max_sectors $nearest
end
while (($i <= $nearest) and ($databasecount < $max_sectors))
	setvar $focus $nearest[$i]
	getwordpos $avoidedsectors $pos " "&$focus&" "
	getsectorparameter $focus "FIGSEC" $isfigged
	getsectorparameter $focus "MINESEC" $isarmided
	getsectorparameter $focus "LIMPSEC" $islimped
	if ($isfigged = "")
		setvar $isfigged false
	end
	if ($islimped = "")
		setvar $islimped false
	end
	if ($isarmided = "")
		setvar $isarmided false
	end
	setvar $isfound false
	setvar $isfigadjacent false
	setvar $p 1
	while (sector.warps[$focus][$p] > 0)
		setvar $temp sector.warps[$focus][$p]
		getsectorparameter $temp "FIGSEC" $isfigadjacent
		if ($isfigadjacent <> true)
			if (($islimped = true) and (($isfigged = true) and ($pos <= 0)))
				setvar $unload_sectors $unload_sectors&"  "&$focus&"  "
				setvar $isfound true
			end
		end
		add $p 1
	end
	if ($isfound = false)
		if (($islimped = true) and (($isfigged = true) and ($pos <= 0)))
			setvar $database $database&" "&$focus&" "
			add $databasecount 1
		end
	end
	add $i 1

	setvar $perctest (($i * 100) / $max_sectors)
	if ($perctest > $perc)
		setvar $perc (($i * 100) / $max_sectors)
		echo "*"
		echo #27 "["&($perc / 2)&"C"
		echo ansi_14 "" ansi_15 " " $perc "%" #27&"[1A   "
	end
end

setvar $switchboard~message ""&$databasecount&" limpet sectors found.*"
gosub :switchboard~switchboard
return

:assemble_mac
setvar $mac ""

setvar $mac $mac&"h2 z0*zc*"

return

:assemble_attack_mac
setvar $attack_mac "* za"&$figs&"* jr * "
return

:assemble_return_mac
setvar $return_mac $homesec&"* yy * * "
return

:assemble_land_mac
setvar $land_mac "l j"&#8&#8&#8&#8&#8&$planet&"*  * j m  * * *  t * t 1* c * "

return

:return_triggers
settexttrigger incit :incit "To which Sector"
settexttrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
settexttrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
gosub :delaytrigger
pause

:incit
killalltriggers
return

:igd
goto :callsaveme

:landonplanetentercitadel
send "l " $planet "* c"
waiton "<Enter Citadel>"
return

:leavecitadelandplanet
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return

:checkavoidedsectors
setvar $avoidedsectors ""
gosub :sector~getavoids
setvar $avoid_i 0
while ($avoid_i < $sector~avoidcount)
	add $avoid_i 1
	setvar $avoidedsectors $avoidedsectors&" "&$sector~avoids[$avoid_i]&" "
end

setvar $avoidedsectors $avoidedsectors&" "&$homesec&" "
setvar $p 1
while (sector.warps[$homesec][$p] > 0)
	setvar $avoidedsectors $avoidedsectors&" "&sector.warps[$homesec][$p]&" "
	add $p 1
end
return

:delaytrigger
setdelaytrigger delayuntilsaveme :callsaveme 5000
return

:xenter
send "q y * t* * *" $password "*    *    *       za"&$figs&"*   z*   f z 1*  z c d *  "
return

:getcourses
killalltriggers
setvar $originaldestination $destination
setvar $player~starting_point $player~current_sector
setvar $player~destination $destination
gosub :player~getcourse
setvar $courselength $player~courselength
setvar $index 1
while ($index <= $courselength)
	if (($fighter_grid[$player~course[$index]] <= 0) and ($player~course[$index] <> $originaldestination))
		setvar $destination $player~course[$index]
	elseif ($player~course[$index] <> $originaldestination)
		setvar $destination $originaldestination
	end
	add $index 1
end

:nopath
killalltriggers
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

:attemptrefurb
:attempt_refurb
setvar $limpetcashneeded ((($maxmines - $player~limpets) * $limpet_cost) + $limpet_removal_cost)
setvar $armidcashneeded (($maxmines - $player~armids) * $armid_cost)
setvar $cashneeded ($limpetcashneeded + $armidcashneeded)
setvar $furbing true
if ($cashneeded > $player~credits)
	send "D"
	waiton "Citadel treasury contains "
	getword currentline $citadelcash 4
	striptext $citadelcash ","
	if ($citadelcash < $cashneeded)
		setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
		gosub :switchboard~switchboard
		halt
	end
	send "t f "&($cashneeded - $player~credits)&"* "
end

setvar $i 1
setvar $start_sector $player~current_sector
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

if (($player~alignment < 1000) and ($weareadjdock = false))
	setvar $red_adj 0
	gosub :findjumpsector
	if ($red_adj <> 0)
		setvar $switchboard~message "Jump Sector Found - Using Sector "&$red_adj&"**"
		gosub :switchboard~switchboard
	else
		waitfor "Command [TL="
		setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
		gosub :switchboard~switchboard
		halt
	end
end

if ($player~alignment >= 1000)
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$stardock&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
else
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$red_adj&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
end
settextlinetrigger nojoy :nojoy "*** Error - No route within"
settexttrigger cont :cont "(?="
pause

:nojoy
killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
halt

:cont
killalltriggers
setdelaytrigger latency_delay :latency_delay 500
pause

:latency_delay
echo "**"&ansi_14&"Please Stand By"&ansi_15&" - Calculating Distances...**"
if (($player~alignment >= 1000) or $weareadjdock)
	getdistance $dist1 $start_sector $stardock
else
	getdistance $dist1 $start_sector $red_adj
end

if ($dist1 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Course to Dock**"
	gosub :switchboard~switchboard
	halt
end

getdistance $dist2 $stardock $start_sector
if ($dist2 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Return Course From Dock**"
	gosub :switchboard~switchboard
	halt
end

setvar $ore_req (($dist1 + $dist2) * 3)

if ($player~ore_holds < $ore_req)
	setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
	gosub :switchboard~switchboard
	halt
end

if ($player~twarp_type = "No")
	setvar $switchboard~message "Must Have Twarp 1 or 2**"
	gosub :switchboard~switchboard
	halt
end

if ($unlimitedgame = 0)
	gosub :turnsrequired
	if ($turnsrequired > $player~turns)
		setvar $switchboard~message "Not Enough Turns. "&ansi_12&$turnsrequired&ansi_15&", Required**"
		gosub :switchboard~switchboard
		halt
	elseif ($turnsrequired <= $player~turns)
		setvar $tmp ($player~turns - $turnsrequired)
		if ($tmp <= $bot_turn_limit)
			setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$bot_turn_limit&" Turns!**"
			gosub :switchboard~switchboard
			halt
		end
	end
end

send " C R "&$stardock&"*Q "
settextlinetrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
setvar $switchboard~message $taglineb&" - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
halt

:itsalive
killalltriggers
waitfor "(?="
setvar $msg ""
if (($player~alignment >= 1000) and ($weareadjdock = false))
	setvar $warpto $stardock
	gosub :dotwarp
elseif (($weareadjdock = false) and ($red_adj <> 0))
	setvar $warpto $red_adj
	gosub :dotwarp
else
	send " m "&$stardock&"*  *  P  S G Y G Q "
end
if ($msg = "")
	waitfor "You leave the Galactic Bank."
else
	setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
	gosub :switchboard~switchboard
	halt
end
gosub :player~quikstats

setvar $_limps "Max"
setvar $_mines "Max"
gosub :dopurchases
send "Q Q Q Q Z N M "&$start_sector&"* Y  Y  Y  * L Z"&#8&$planet&"* p  s  s * * c *"
gosub :player~quikstats
if ($player~current_sector = $stardock)
	setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
	gosub :switchboard~switchboard
	halt
end
send "q tnt1* c "

return

:dotwarp
setvar $msg ""
if ($warpto > 0)
	send "q q mz"&$warpto " * "
	settexttrigger there :adj_warp "You are already in that sector!"
	settextlinetrigger adj_warp :adj_warp "Sector  : "&$warpto&" "
	settexttrigger locking :locking "Do you want to engage the TransWarp drive?"
	settexttrigger igd :twarpigd "An Interdictor Generator in this sector holds you fast!"
	settexttrigger noturns :twarpphotoned "Your ship was hit by a Photon and has been disabled"
	settexttrigger noroute :twarpnoroute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
	killalltriggers
	send "z*"
	goto :twarp_adj

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
	settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
	settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
	pause

	:twarpnofuel
	killalltriggers
	setvar $msg "Not enough fuel for T-warp."
	goto :twarpdone

	:twarp_adj
	killalltriggers
	send " * p s"
	goto :twarpdone

	:twarpnoroute
	killalltriggers
	send "n* z* "
	setvar $msg "No route available!"
	goto :twarpdone

	:no_twarp_lock
	killalltriggers
	send "n*zn"
	send "l "&#8&$planet "*c"
	setsectorparameter $warpto "FIGSEC" false
	setvar $temp " "&$warpto&" "
	replacetext $database $temp " "
	subtract $database_count 1
	goto :select_boomsec

	:twarpigd
	killalltriggers
	setvar $msg "My ship is being held by Interdictor!"
	goto :twarpdone

	:twarpphotoned
	killalltriggers
	setvar $msg "I have been photoned and can not T-warp!"
	goto :twarpdone

	:twarp_lock
	killalltriggers
	if ($player~alignment >= 1000)
		if ($furbing)
			setvar $str "y * * p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	else
		if ($furbing)
			setvar $str "y  *  *  m "&$stardock&" *  *  p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	end

	:twarpdone
	if ($msg <> "")
		setvar $switchboard~message "Twarp Error - "&$msg&"**"
		gosub :switchboard~switchboard
	end
end
return

:bwarp
killalltriggers
send "b" $warpto "*"
settexttrigger go :go5 "TransWarp Locked"
settexttrigger no :no5 "No locating beam found"
gosub :delaytrigger
pause

:no5
killalltriggers
send "n "
waitfor "Transporter shutting down."
setvar $fighter_grid[$warpto] 0
goto :select_boomsec

:go5
killalltriggers
send "y z * "
return

:findjumpsector
setvar $i 1
setvar $red_adj 0
send "qq*"
while (sector.warpsin[$stardock][$i] > 0)
	setvar $red_adj sector.warpsin[$stardock][$i]
	send "m "&$red_adj&"* y"
	settexttrigger twarpblind :twarpblind "Do you want to make this jump blind? "
	settexttrigger twarplocked :twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided :twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpadj :twarpadj "<Set NavPoint>"
	pause

	:twarpadj
	killalltriggers
	send " * "
	return

	:twarpvoided
	killalltriggers
	send " N N "
	goto :tryingnextadj

	:twarplocked
	killalltriggers
	send " N "

	goto :sectorlocked

	:twarpblind
	killalltriggers
	send " N "

	:tryingnextadj
	add $i 1
end

:noadjsfound
setvar $red_adj 0
return

:sectorlocked
return

:turnsrequired
send "i"
settextlinetrigger turnsrequired_tpw :turnsrequired_tpw "Turns to Warp  : "
pause

:turnsrequired_tpw
killalltriggers
getword currentline $turnsrequired_tpw 5

if ($red_adj > 0)

	setvar $turnsrequired_temp ($turnsrequired_tpw * 3)
	if ($_tow > 0)

		add $turnsrequired_temp 2

		add $turnsrequired_temp 3
	else
		add $turnsrequired_temp 1
	end
else
	setvar $turnsrequired_temp ($turnsrequired_tpw * 2)

	add $turnsrequired_temp 1
end

setvar $turnsrequired $turnsrequired_temp
return

:callsaveme
send "q q q q * '"&$bot_name&" call*"
halt

:dopurchases
send "h "
waitfor "<Hardware Emporium>"

if ($_limps <> "")
	send "L "
	waitfor "How many mines do you want"
	if ($_limps = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $buy $_limps&"* "
	end
	waitfor "<Hardware Emporium>"
end

if ($_mines <> "")
	send "M "
	setvar $buy 0
	waitfor "How many mines do you"
	if ($_mines = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $_mines&"* "
	end
	waitfor "<Hardware Emporium>"
end
return
include "source\include\switchboard.ts"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\help"
