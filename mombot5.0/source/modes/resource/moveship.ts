gosub :loadvars~loadvars
gosub :help~initialize
loadvar $map~stardock

setvar $help~help[1]  $help~tab&"Moves empty ships from one sector to another."
setvar $help~help[2]  $help~tab&"                "
setvar $help~help[3]  $help~tab&"  moveship [sector] {back} {sell} {dep} {"&#34&"ship filter"&#34&"}"
setvar $help~help[4]  $help~tab&"                  "
setvar $help~help[5]  $help~tab&"   Options:            "
setvar $help~help[6]  $help~tab&"        [sector] - target sector"
setvar $help~help[7]  $help~tab&"          [back] - will grab ships from target sector and bring"
setvar $help~help[8]  $help~tab&"                   them back to current sector   "
setvar $help~help[9]  $help~tab&"          [sell] - if moving to stardock, attempt to sell ships"
setvar $help~help[10] $help~tab&" ["&#34&"ship filter"&#34&"] - move ships only matching this filter"
setvar $help~help[11] $help~tab&"                   "
setvar $help~help[12] $help~tab&"             -  Ship filter list can be comma delimited.    "
setvar $help~help[13] $help~tab&"             -  Can use either planet or SXX port in        "
setvar $help~help[14] $help~tab&"                starting sector for fuel."
gosub :help~helpfile

setvar $switchboard~message "Ship Mover starting up!*"
gosub :switchboard~switchboard

# ============================== START Move Ship (moveship) Sub ==============================
:moveship
:shipmove
killalltriggers
gosub :player~quikstats
if ($player~twarp_type = "No")
	setvar $switchboard~message "You need a Transwarp drive to run moveship.*"
	gosub :switchboard~switchboard
	halt
end
setvar $startsector $player~current_sector
setarray $theships 0
isnumber $test $bot~parm1
if ($test)
	if ($bot~parm1 > 0)
		setvar $movesector $bot~parm1
	else
		setvar $switchboard~message "Invalid move sector entered*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Invalid move sector entered*"
	gosub :switchboard~switchboard
	halt
end

if ($movesector = $player~current_sector)
	setvar $switchboard~message "Destination sector must be different than the current sector*"
	gosub :switchboard~switchboard
	halt
end

getdistance $distance $startsector $movesector
if ($distance = 1)
	setvar $use_move true
	setvar $use_twarp false
else
	setvar $use_move false
	setvar $use_twarp true
end

getwordpos $bot~user_command_line $pos "back"
if ($pos > 0)
	setvar $back true
else
	setvar $back false
end

getwordpos $bot~user_command_line $pos "silent"
if ($pos > 0)
	setvar $bot~silent_running true
else
	setvar $bot~silent_running false
end

getwordpos $bot~user_command_line $pos "sell"
if ($pos > 0)
	setvar $sellship true
else
	setvar $sellship false
end

getwordpos $bot~user_command_line $pos "dep"
if ($pos > 0)
	setvar $dep true
else
	setvar $dep false
end

getwordpos $bot~user_command_line $pos "silent"
if ($pos > 0)
	setvar $switchboard~self_command true
end
if ($bot~silent_running = true)
	setvar $switchboard~self_command true
end

setvar $filterships ""
getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext $bot~user_command_line $filterships #34 #34
	if ($filterships = false)
		setvar $switchboard~message "Invalid ship filter entered.*"
		gosub :switchboard~switchboard
		halt
	else
		splittext $filterships $shiptypes ","
		setvar $switchboard~message "Moving all ships matching: ["&$filterships&"].*"
		gosub :switchboard~switchboard
	end
end

setvar $startinglocation $player~current_prompt
send "** "
setvar $fuelinsector false
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	if ($startinglocation = "Command")
		if ($use_move = false)
			getsectorparameter $player~current_sector "BUSTED" $isbusted
			if ((port.exists[$player~current_sector] = true) and (port.buyfuel[$player~current_sector] = false) and ($isbusted <> true))
				if ($player~credits < 50000)
					setvar $switchboard~message "Need at least 50,000 credits to use port as fuel source*"
					gosub :switchboard~switchboard
				end
				setvar $fuelinsector true
			end
		else
			setvar $i 1
			setvar $isfound false
			while (sector.warps[$player~current_sector][$i] > 0)
				if (sector.warps[$player~current_sector][$i] = $movesector)
					setvar $isfound true
				end
				add $i 1
			end
			if ($isfound = false)
				setvar $switchboard~message "No fuel port in sector, cannot run from Command Prompt*"
				gosub :switchboard~switchboard
				halt
			end
		end
	else
		setvar $switchboard~message "Must be in Command, Citadel or Planet prompt to run*"
		gosub :switchboard~switchboard
		halt
	end
end

if ($startinglocation = "Citadel")
	send "s* q "
end

setvar $shipcount 0
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :planet~getplanetinfo
	send "t * l 1 * t * l 2 * t * l 3 * s * l 1 * s * l 2 * s * l 3 * t * t1*m* * * q "
end
send "*"
gosub :player~quikstats
setvar $starting_credits $player~credits
killtrigger player~getline2
setvar $figcnt sector.figs.quantity[$startsector]
setvar $figowner sector.figs.owner[$startsector]
if (sector.figs.quantity[$startsector] = 0) or ((sector.figs.owner[$startsector] <> "belong to your Corp") and (sector.figs.owner[$startsector] <> "yours"))
	setvar $isfigged false
else
	setvar $isfigged true
end
if ($startsector < 11) or ($startsector = $map~stardock)
	setvar $startfed true
else
	setvar $startfed false
end

if ($use_move = false)
	if ($isfigged = false) and ($startsector <> $map~stardock)
		if ($player~current_sector = $startsector)
			gosub :planet~landingsub
		end
		setvar $switchboard~message "No friendly fighters deployed in current sector!*"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $switchboard~message "Ship Mover starting up!  Starting ship scan..*"
gosub :switchboard~switchboard
if ($back = true)
	if ($startinglocation <> "Command")
		send "l "&$planet~planet&"* t * l 1 * t * l 2 * t * l 3 * s * l 1 * s * l 2 * s * l 3 * t * t1*m* * * q "
	else
		if ($fuelinsector)
			send " p t * * 0 * * 0 * * 0 * * "
		end
	end
	setvar $player~current_sector $startsector
	setvar $player~warpto $movesector
	gosub :setmovetype
	if ($use_direction_move = true)
		gosub :move
		if ($player~movesuccess = false)
			setvar $switchboard~message "Can not make it to move sector, shutting down*"
			gosub :switchboard~switchboard
			setvar $switchboard~message "Not all ships were moved*"
			gosub :switchboard~switchboard
			if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
				gosub :planet~landingsub
			end
			halt
		end
		else
			setvar $move~force_command true
			gosub :move~twarp
			if ($player~twarpsuccess = false)
			setvar $switchboard~message "Can not make it to move sector, shutting down*"
			gosub :switchboard~switchboard
			setvar $switchboard~message "Not all ships were moved*"
			gosub :switchboard~switchboard
			if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
				gosub :planet~landingsub
			end
			halt
		end
	end
end

:tryshipscan
gosub :player~msgs_off
settextlinetrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
settextlinetrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
settextlinetrigger enter :enter "[Pause]"
setstrigger enter2 :gotships "Choose which ship to tow (Q=Quit)"
settexttrigger enter3 :gotships "You do not own any other ships in this sector!"
send "w*"
pause

:continuetowon
killtrigger statlinetrig
killtrigger doneships
killtrigger enter
killtrigger enter2
killtrigger enter3
goto :tryshipscan

:enter
killtrigger statlinetrig
killtrigger doneships
killtrigger enter2
killtrigger enter3
send "*"
settextlinetrigger enter :enter "[Pause]"
pause

:shipline
killtrigger towalreadyon
setvar $line currentline
setvar $shiptype ""
getwordpos $line $pos "Choose which ship to tow (Q=Quit)"
getword $line $temp 1
getlength $line $length
if ($length > 54)
	cuttext $line $shiptype 54 999
end
lowercase $shiptype

isnumber $result $temp
if (($result = true))
	if ($temp > 0)

		if ($filterships <> "")
			setvar $i 1
			setvar $shipfound false
			while ($i <= $shiptypes)
				setvar $testship $shiptypes[$i]
				trim $testship
				getwordpos $shiptype $filterpos $testship
				if ($filterpos > 0)
					setvar $shipfound true
				end
				add $i 1
			end
			if ($shipfound = true)
				add $shipcount 1
				setvar $theships[$shipcount] $temp
			end
		else
			add $shipcount 1
			setvar $theships[$shipcount] $temp
		end
	end
end
if ($pos > 0)
	killtrigger getline
	goto :gotships
else
	settextlinetrigger getline :shipline
	pause
end

:gotships
send "*"
killtrigger statlinetrig
killtrigger towalreadyon
killtrigger doneships
killtrigger getline
killtrigger towalreadyon
killtrigger enter
killtrigger enter2
killtrigger enter3
gosub :player~msgs_on
	if ($back = true)
		gosub :player~quikstats
		setvar $player~warpto $startsector
		gosub :setmovetype
		if ($use_direction_move = true)
			gosub :move
			if ($player~movesuccess = false)
				setvar $switchboard~message "Can not make it to move sector, shutting down*"
			gosub :switchboard~switchboard
			setvar $switchboard~message "Not all ships were moved*"
			gosub :switchboard~switchboard
			if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
				gosub :planet~landingsub
			end
			halt
		else
			gosub :move~twarp
			if ($player~twarpsuccess = false)
				echo "*** startsector: "&$startsector&" movesector: "&$movesector&"**"
				setvar $switchboard~message "Can not make it back home, shutting down*"
				gosub :switchboard~switchboard
				if ($i >= $shipcount)
					setvar $switchboard~message "All ships were moved*"
					gosub :switchboard~switchboard
				else
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
				end
				gosub :planet~landingsub
				halt
			end
		end
	end
end
setvar $switchboard~message "Found "&$shipcount&" empty ships to move.*"
gosub :switchboard~switchboard
setvar $i 1
while ($i <= $shipcount)
	if ($theships[$i] > 0)
		gosub :player~quikstats
		if ($startinglocation <> "Command")
			send "l "&$planet~planet&"* t * t1*m* * * q "
		else
			if ($fuelinsector)
				send " p t * * 0 * * 0 * * 0 * * "
			end
		end
		if ($back = false)
			send "w n "&$theships[$i]&"*  "
			setvar $player~current_sector $startsector
			setvar $player~warpto $movesector
			gosub :setmovetype
			if ($use_direction_move = true)
				gosub :move
				#send $movesector&"*  "
				#waiton $movesector
				#setvar $player~movesuccess true
				if ($player~movesuccess = false)
					setvar $switchboard~message "Can not make it to move sector, shutting down*"
					gosub :switchboard~switchboard
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
					if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
						gosub :planet~landingsub
					end
					halt
				end
				else
					setvar $move~force_command true
					gosub :move~twarp
					if ($player~twarpsuccess = false)
					setvar $switchboard~message "Can not make it to move sector, shutting down*"
					gosub :switchboard~switchboard
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
					if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
						gosub :planet~landingsub
					end
					halt
				end
			end
			send "w"
			waiton "<Tow Control>"
			if (($movesector = $map~stardock) and ($sellship = true))
				gosub :player~quikstats
				gosub :port~shipsell
				send "q q q * * *"
			end
			setvar $player~current_sector $movesector
			setvar $player~warpto $startsector
			gosub :player~quikstats
			setvar $player~warpto $startsector
			gosub :setmovetype
			if ($use_direction_move = true)
				gosub :move
				#send $startsector&"*  "
				#waiton $startsector
				#setvar $player~movesuccess true
				if ($player~movesuccess = false)
					setvar $switchboard~message "Can not make it to move sector, shutting down*"
					gosub :switchboard~switchboard
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
					if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
						gosub :planet~landingsub
					end
					halt
				end
			else
				gosub :move~twarp
#				echo "*** startsector: "&$startsector&" movesector: "&$movesector&"**"
				if ($player~twarpsuccess = false)
					setvar $switchboard~message "Can not make it back home, shutting down*"
					gosub :switchboard~switchboard
					if ($i >= $shipcount)
						setvar $switchboard~message "All ships were moved*"
						gosub :switchboard~switchboard
					else
						setvar $switchboard~message "Not all ships were moved*"
						gosub :switchboard~switchboard
					end
					gosub :planet~landingsub
					halt
				end
			end
		else
			setvar $player~current_sector $startsector
			setvar $player~warpto $movesector
			gosub :setmovetype
			if ($use_direction_move = true)
				gosub :move
				if ($player~movesuccess = false)
					setvar $switchboard~message "Can not make it to move sector, shutting down*"
					gosub :switchboard~switchboard
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
					if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
						gosub :planet~landingsub
					end
					halt
				end
				else
					setvar $move~force_command true
					gosub :move~twarp
					if ($player~twarpsuccess = false)
					setvar $switchboard~message "Can not make it to move sector, shutting down*"
					gosub :switchboard~switchboard
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
					if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
						gosub :planet~landingsub
					end
					halt
				end
			end
				send "w n "&$theships[$i]&"* "
				setvar $player~current_sector $movesector
				setvar $player~warpto $startsector
				setvar $move~force_command true
				gosub :move~twarp
				if ($player~twarpsuccess = false)
				setvar $switchboard~message "Can not make it back home, shutting down*"
				gosub :switchboard~switchboard
				if ($i >= $shipcount)
					setvar $switchboard~message "All ships were moved*"
					gosub :switchboard~switchboard
				else
					setvar $switchboard~message "Not all ships were moved*"
					gosub :switchboard~switchboard
				end
				gosub :planet~landingsub
				halt
			end
			send "w  "
		end
	end
	add $i 1
end
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :planet~landingsub
	if ($dep = true)
		setvar $bot~command "dep"

		if ($bot~silent_running = true)
			setvar $bot~user_command_line " dep "&($player~credits-$starting_credits)&" silent"
		else
			setvar $bot~user_command_line " dep "&($player~credits-$starting_credits)
		end
		setvar $bot~parm1 ($player~credits-$starting_credits)
		savevar $bot~parm1
		savevar $bot~parm1
		savevar $bot~command
		savevar $bot~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
		seteventtrigger		depended		:depended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
		pause

		:depended
	end
end
setvar $switchboard~message "All ships moved successfully.*"
gosub :switchboard~switchboard
halt
# ============================== END Move Ship (moveship) Sub ==============================

:setmovetype
setvar $use_direction_move false
getdistance $direction_distance $player~current_sector $player~warpto
if ($direction_distance = 1)
	setvar $use_direction_move true
end
return

:move
setvar $player~movesuccess false
setvar $player~current_sector currentsector
if ($player~current_sector = $player~warpto) or ($player~warpto = 0)
	setvar $switchboard~message "Move failed!*"
	gosub :switchboard~switchboard
	halt
end
settexttrigger move_there :move_good "You are already in that sector!"
settextlinetrigger move_good :move_good "Sector  : "&$player~warpto&" "
setstrigger move_twarp :move_failed "Do you want to engage the TransWarp drive?"
settexttrigger move_igd :move_failed "An Interdictor Generator in this sector holds you fast!"
settexttrigger move_photon :move_failed "Your ship was hit by a Photon and has been disabled"
setstrigger move_noroute :move_failed "Do you really want to warp there? (Y/N)"
setstrigger move_autopilot :move_autopilot_failed "Engage the Autopilot?"
settextlinetrigger move_no_fuel :move_failed "You do not have enough Fuel Ore"
send "m "&$player~warpto&"*"
pause

:move_good
killalltriggers
setvar $player~movesuccess true
return

:move_failed
killalltriggers
send "n"
setstrigger move_autopilot :move_autopilot_failed "Engage the Autopilot?"
setstrigger move_command :move_failed_done "Command [TL="
pause

:move_autopilot_failed
killalltriggers
send "n"
setstrigger move_command :move_failed_done "Command [TL="
pause

:move_failed_done
killalltriggers
return

#INCLUDES:
include "source\include\loadvars"
include "source\include\port"
include "source\include\player"
include "source\include\move"
include "source\include\help"
include "source\include\switchboard.ts"
