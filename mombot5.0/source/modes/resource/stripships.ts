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
loadvar $stardock
loadvar $backdoor
loadvar $rylos
loadvar $alpha_centauri
loadvar $command
goto :stripships_start
include "source\include\planet"

:stripships_start
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Strips fighters from all empty ships and deploys them into the sector."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage: stripships"
gosub :help~helpfile

:emptyships
killalltriggers
gosub :player~quikstats
setvar $startship $player~ship_number
setvar $startinglocation $player~current_prompt
setvar $total_figs 0
send "** "
setvar $fuelinsector false
if (($startinglocation <> "Citadel") and (($startingsector <> "Planet") and ($startinglocation <> "Command")))
	setvar $switchboard~message "Must be in Command, Citadel or Planet prompt to run*"
	gosub :switchboard~switchboard
	halt
end

if ($startinglocation = "Citadel")
	send "q "
end
setvar $shipcount 0
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :getplanetinfo
	send "q "
end
setvar $switchboard~message "Ship Stripper starting up!  Starting ship scan..*"
gosub :switchboard~switchboard

:tryshipscan
send "wnq*@"
settextlinetrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
settextlinetrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
pause

:continuetowon
killtrigger statlinetrig
goto :tryshipscan

:shipline
killtrigger towalreadyon
setvar $line currentline
getwordpos $line $pos "Average Interval Lag:"
getword $line $temp 1
isnumber $result $temp
if ($result = true)
	if ($temp > 0)
		add $shipcount 1
		setvar $theships[$shipcount] $temp
	end
end
if ($pos > 0)
	goto :gotships
else
	settextlinetrigger getline :shipline
	pause
end

:gotships
setvar $switchboard~message "Found "&$shipcount&" empty ships to strip.*"
gosub :switchboard~switchboard
setvar $i 1
while ($i <= $shipcount)
	if ($theships[$i] > 0)
		send "x "&$theships[$i]&"*   *   "
		gosub :player~quikstats
		send " F"
		waiton " fighters available."
		getword currentline $ftrs_to_leave 3
		striptext $ftrs_to_leave ","
		striptext $ftrs_to_leave " "
		if ($ftrs_to_leave > 0)
			send " "&$ftrs_to_leave&" * C D"
			add $total_figs $ftrs_to_leave
		end
	end
	add $i 1
end
send "x "&$startship&"*  *   "
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :landingsub
end
setvar $switchboard~message "Done stripping empty ships.*"
gosub :switchboard~switchboard

halt

:landingsub
send "l" $planet "*z  n  z  n  *  "
setvar $sucessfulcitadel false
setvar $sucessfulplanet false
settextlinetrigger noplanet :noplanet "There isn't a planet in this sector."
settextlinetrigger no_land :no_land "since it couldn't possibly stand"
settextlinetrigger planet :planet "Planet #"
settextlinetrigger wrongone :wrong_num "That planet is not in this sector."
pause

:noplanet
killtrigger no_land
killtrigger planet
killtrigger wrongone
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return

:no_land
killtrigger noplanet
killtrigger planet
killtrigger wrongone
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return

:planet
getword currentline $pnum_ck 2
striptext $pnum_ck "#"
if ($pnum_ck <> $planet)
	killtrigger no_land
	killtrigger wrongone
	killtrigger no_planet
	send "q"
	goto :wrong_num
end
killtrigger noplanet
killtrigger no_land
killtrigger wrongone
settexttrigger wrong_num :wrong_num "That planet is not in this sector."
setstrigger planet :planet_prompt "Planet command"
pause

:wrong_num
killtrigger planet
send "**'{" $bot_name "} - Incorrect Planet Number*"
return

:planet_prompt
killtrigger wrong_num
setvar $currentbotplanet $planet
savevar $currentbotplanet
send "c"
setstrigger build_cit :build_cit "Do you wish to construct one?"
setstrigger in_cit :in_cit "Citadel command"
settexttrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
settexttrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
pause

:build_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulplanet true
send "n*"
setvar $startinglocation "Planet"
return

:in_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulcitadel true
setvar $startinglocation "Citadel"
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

:twarpto
setvar $twarpsuccess false
setvar $original 1
if ($player~current_sector = $warpto)
	setvar $msg "Already in that sector!"
	goto :twarpdone
elseif (($warpto <= 0) or ($warpto > sectors))
	setvar $msg "Destination sector is out of range!"
	goto :twarpdone
end
if (($player~alignment < 1000) and (($warpto = $stardock) and (($backdoor > 10) and ($backdoor <> $player~current_sector))))
	setvar $original $warpto
	setvar $warpto $backdoor
end
if ($player~twarp_type = "No")
	setvar $msg "No T-warp drive on this ship!"
	goto :twarpdone
end
if ($startinglocation = "Citadel")
	send "q t*t1* q q * c u y q mz" $warpto "*"
elseif ($startinglocation = "Planet")
	send "t*t1* q q * c u y q mz" $warpto "*"
else
	send "q q q * c u y q mz" $warpto "*"
end
settexttrigger there :adj_warp "You are already in that sector!"
settextlinetrigger adj_warp :adj_warp "Sector  : "&$warpto&" "
setstrigger locking :locking "Do you want to engage the TransWarp drive?"
settexttrigger igd :twarpigd "An Interdictor Generator in this sector holds you fast!"
settexttrigger noturns :twarpphotoned "Your ship was hit by a Photon and has been disabled"
setstrigger noroute :twarpnoroute "Do you really want to warp there? (Y/N)"
pause

:adj_warp
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
send "z*"
goto :twarp_adj

:locking
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
send "y"
settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
pause

:twarpnofuel
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
setvar $msg "Not enough fuel for T-warp."
goto :twarpdone

:twarp_adj
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
send "z* "
setvar $msg "That sector is next door, just plain warping."
setvar $twarpsuccess true
goto :twarpdone

:twarpnoroute
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
send "n* z* "
setvar $msg "No route available to that sector!"
goto :twarpdone

:no_twarp_lock
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
send "n* z* "
setsectorparameter $warpto "FIGSEC" false
setvar $msg "No fighters at T-warp point!"
goto :twarpdone

:twarpigd
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
setvar $msg "My ship is being held by Interdictor!"
goto :twarpdone

:twarpphotoned
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
setvar $msg "I have been photoned and can not T-warp!"
goto :twarpdone

:twarp_lock
killtrigger there
killtrigger adj_warp
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
setsectorparameter $warpto "FIGSEC" true
send "y* "

setvar $msg "T-warp completed."
setvar $twarpsuccess true

:twarpdone
if (($twarpsuccess = true) and (($warpto = $backdoor) and ($original = $stardock)))
	send "* m "&$stardock&"*  za9999* * "
end

return
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
