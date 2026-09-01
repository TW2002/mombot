#            PPPPPP    SSSSSS   SSSSSS   TTTTTTTTTT
#            PP   PP  SS        SS            TT          Planet Steal-Steal-Transport
#            PP   PP  SS        SS            TT          Original author unknown
#            PPPPPP    SSSSS    SSSSS        TT
#            PP            SS       SS       TT           Version 5.0.1 by Shadow
#            PP            SS       SS       TT           Released with MomBot 5.0
#            PP       SSSSSS   SSSSSS       TT

gosub :loadvars~loadvars
loadvar $bot~folder
loadvar $game~steal_factor
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
loadvar $bot_name
loadvar $rylos
loadvar $alpha_centauri
loadvar $stardock
loadvar $subspace
loadvar $game~steal_factor

gosub :help~initialize
setvar $help~help[1] $help~tab&"Planet SDT using two ships and two planets."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Steals equipment from xxB ports, xports between ships, and refurbishes."
setvar $help~help[4] $help~tab&"Run from Command."
setvar $help~help[5] $help~tab&"   "
setvar $help~help[6] $help~tab&"Usage:  psdt [ship2#] [planet1#] [planet2#] {mcic} {buyfuel}"
setvar $help~help[7] $help~tab&"        psdt clear_busts"
setvar $help~help[8] $help~tab&"   "
setvar $help~help[9] $help~tab&"   [ship2#] - empty second ship in the starting sector."
setvar $help~help[10] $help~tab&"   [planet1#] [planet2#] - movable planets in the starting sector."
setvar $help~help[11] $help~tab&"   [clear_busts] - clears cached bust data."
setvar $help~help[12] $help~tab&"   [mcic] - select ports by MCIC value."
setvar $help~help[13] $help~tab&"   [buyfuel] - buy fuel for the planets when needed."
gosub :help~helpfile

lowercase $parm1
lowercase $parm2
lowercase $parm3
lowercase $parm4
lowercase $parm5
lowercase $parm6
lowercase $parm7
lowercase $parm8

getWordPos $user_command_line $pos "mcic"
if ($pos > 0)
	setVar $mcicmode TRUE
else
	setVar $mcicmode FALSE
end

getWordPos $user_command_line $pos "buyfuel"
if ($pos > 0)
	setVar $buyfuel TRUE
else
	setVar $buyfuel FALSE
end
getWordPos $bot~user_command_line $pos "buyfuel"
if ($pos > 0)
	setVar $buyfuel TRUE
end
if (($parm1 = "buyfuel") or ($parm2 = "buyfuel") or ($parm3 = "buyfuel") or ($parm4 = "buyfuel") or ($parm5 = "buyfuel") or ($parm6 = "buyfuel") or ($parm7 = "buyfuel") or ($parm8 = "buyfuel"))
	setVar $buyfuel TRUE
end
if (($bot~parm1 = "buyfuel") or ($bot~parm2 = "buyfuel") or ($bot~parm3 = "buyfuel") or ($bot~parm4 = "buyfuel") or ($bot~parm5 = "buyfuel") or ($bot~parm6 = "buyfuel") or ($bot~parm7 = "buyfuel") or ($bot~parm8 = "buyfuel"))
	setVar $buyfuel TRUE
end

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
isnumber $isparamonenumber $parm1
isnumber $isparamtwonumber $parm2
isnumber $isparamthreenumber $parm3

if ($player~alignment > 0)
	setvar $switchboard~message "You gotta be blue to run sdt, bro.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~experience < 1000)
	setvar $switchboard~message "You need at least 1000 experience to run Planet sdt.*"
	gosub :switchboard~switchboard
	halt
end

if ($startinglocation <> "Command")
	setvar $switchboard~message "Planet sdt must be run from command prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($parm1 = "clear_busts")
	#delete $bust_file
	setvar $i 1
	while ($i <= sectors)
		setsectorparameter $i "BUSTED" false
		add $i 1
	end
	setvar $switchboard~message "Busts for this bot have been cleared.*"
	gosub :switchboard~switchboard
	halt
elseif (($isparamonenumber = true) and (($isparamtwonumber = true) and ($isparamthreenumber = true)))
	setvar $psdt_ship2 $parm1
	setvar $psdt_planet1 $parm2
	setvar $psdt_planet2 $parm3
else
	setvar $switchboard~message "Please use psdt [ship2#] [planet1#] [planet2#] format.*"
	gosub :switchboard~switchboard
	halt

end
send "jy*"

setvar $portaverage 1
setvar $cashdeposited 0
setvar $refurbcash 5000000
gosub :player~quikstats
setvar $startcash $player~credits
setarray $planet1fuel 3
setarray $planet2fuel 3
setvar $psdt_ship1 $player~ship_number

if (($psdt_ship2 <= 0) or ($psdt_planet1 <= 0) or ($psdt_planet2 <= 0) or ($game~steal_factor <= 0))
	send "'This module should be run from the MOM Bot.*"
	setvar $mode "General"
	savevar $mode
	halt
end
setvar $startingsector $player~current_sector
setvar $inship1 true
setvar $p1chk 3
setvar $p2chk 3

if ($rylos > 10)
	setvar $refurbport $rylos
elseif ($alpha_centauri > 10)
	setvar $refurbport $alpha_centauri
else
	setvar $switchboard~message "This bot has no locations of Class 0 ports in its database.  Cannot continue with Planet sdt.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if (sector.planetcount[$startingsector] <= 1)
	setvar $switchboard~message "Planet sdt must be run with at least two movable planets in the sector*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if (sector.shipcount[$startingsector] < 1)
	setvar $switchboard~message "Planet sdt must be run with at least one empty ship in the sector*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

gosub :checksdtplanets
gosub :checksdtships

if ($foundplanet1 <> true)
	setvar $switchboard~message "Planet #1 entered for Planet sdt was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if ($foundplanet2 <> true)
	setvar $switchboard~message "Planet #2 entered for Planet sdt was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if ($foundship2 <> true)
	setvar $switchboard~message "Ship #2 entered for Planet sdt was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

setvar $switchboard~message "Planet sdt Powering Up!*"
gosub :switchboard~switchboard

send "c;q"
waiton "Transport Range:"
getword currentline $transportrange1 6
getword currentline $maxholds1 3
gosub :transport

send "c;q"
waiton "Transport Range:"
getword currentline $transportrange2 6
getword currentline $maxholds2 3
gosub :transport

if ($transportrange1 <= $transportrange2)
	setvar $transportrange $transportrange1
else
	setvar $transportrange $transportrange2
end

setvar $ship1minrefurb (($maxholds1 * 90) / 100)
setvar $ship2minrefurb (($maxholds2 * 90) / 100)

setvar $switchboard~message "Minimum transport range of these two ships is "&$transportrange&".*"
gosub :switchboard~switchboard

setvar $ship1sector $player~current_sector
setvar $ship2sector $player~current_sector
setvar $ship1needsport true
setvar $ship2needsport true
setvar $i 1
setvar $yes true
setvar $busted false
setarray $equipatport sectors
setarray $equipbuyingpct sectors
setarray $equipbuyingamount sectors
setarray $seededmaxedport sectors
setarray $nearfullsdtport sectors
setarray $fuelatport sectors
setarray $invalidsdtport sectors
setvar $psdt_exit_message ""
setvar $psdt_exit_announced false

if ($mcicmode = true)
	gosub :rankports
end

window "CASH" 300 150 "Planet sdt" "ONTOP"
gosub :displaycredits

:psdt
gosub :findsdtports
if (($ship1needsport = true) or ($ship2needsport = true))
	setvar $switchboard~message "No valid replacement Planet sdt ports found.*"
	gosub :switchboard~switchboard
	setvar $psdt_exit_message "No valid replacement Planet sdt ports found.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	setvar $psdt_exit_announced true
	goto :endsdt
end

setvar $busted false
getsectorparameter $ship1sector "BUSTED" $isbusted1
getsectorparameter $ship2sector "BUSTED" $isbusted2

logging off
while ($busted = false)
	if (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
		setvar $psdt_exit_message "Too low turns to continue Planet sdt.*"
		goto :endsdt
	end
	gosub :steal
end
logging on

if ($ship1totalholds < $ship1minrefurb)
	if ($inship1 <> true)
		gosub :transport
	end
	gosub :refurb
end
if ($ship2totalholds < $ship2minrefurb)
	if ($inship1)
		gosub :transport
	end
	gosub :refurb
end

if (($planet1fuel[1] > 0) and (($planet1fuel[2] > 0) and ($planet1fuel[3] > 0)) and (($planet1fuel[1] < 100000) and (($planet1fuel[2] < 100000) and ($planet1fuel[3] < 100000))))
	setvar $psdt_exit_message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	goto :endsdt
elseif (($planet2fuel[1] > 0) and (($planet2fuel[2] > 0) and ($planet2fuel[3] > 0)) and (($planet2fuel[1] < 100000) and (($planet2fuel[2] < 100000) and ($planet2fuel[3] < 100000))))
	setvar $psdt_exit_message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	goto :endsdt
end
goto :psdt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findsdtports
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($ship1needsport)
	if ($inship1 <> true)
		gosub :transport
	end
	setvar $candidate_ship 1
	setvar $candidate_sector $ship1sector
	setvar $candidate_other_sector $ship2sector
	setvar $candidate_equipment $ship1equipment
	setvar $candidate_planet $psdt_planet1
	setvar $candidate_pchk $p1chk
	gosub :findsdtcandidate
	setvar $ship1sector $candidate_sector
	setvar $ship1needsport $candidate_needsport
	setvar $p1chk $candidate_pchk
	if ($candidate_found = true)
		setvar $ship1totalholds $candidate_totalholds
		setvar $ship1equipment $candidate_equipment
	end
end

if ($ship2needsport)
	if ($inship1)
		gosub :transport
	end
	setvar $candidate_ship 2
	setvar $candidate_sector $ship2sector
	setvar $candidate_other_sector $ship1sector
	setvar $candidate_equipment $ship2equipment
	setvar $candidate_planet $psdt_planet2
	setvar $candidate_pchk $p2chk
	gosub :findsdtcandidate
	setvar $ship2sector $candidate_sector
	setvar $ship2needsport $candidate_needsport
	setvar $p2chk $candidate_pchk
	if ($candidate_found = true)
		setvar $ship2totalholds $candidate_totalholds
		setvar $ship2equipment $candidate_equipment
	end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findsdtcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $candidate_found false
setvar $candidate_needsport true
setvar $mcicselection false
setvar $allsdtselection false
if (($mcicmode = true) and ($portcount > 0))
	setvar $mcicselection true
	setvar $nearest $portcount
else
	getnearestwarps $nearest $candidate_sector
end
setvar $i 1
setvar $allowmaxedbuyer false

:sdtcandidate_loop
while ($i <= $nearest)
	if ($mcicselection = true)
		setvar $focus $ports[$i]
	elseif ($allsdtselection = true)
		setvar $focus $i
	else
		setvar $focus $nearest[$i]
	end
	getsectorparameter $focus "BUSTED" $isbusted
	getsectorparameter $focus "FIGSEC" $isfigged
	setvar $porthasdteal false
	if (port.percentequip[$focus] < 100)
		setvar $porthasdteal true
	elseif (($allowmaxedbuyer = true) and ($candidate_equipment > 0))
		setvar $porthasdteal true
	end
	if (($isfigged = true) and (($isbusted <> true) and (((port.exists[$focus] = true) and (($porthasdteal = true) and (port.buyequip[$focus] = true))) and (($focus <> $candidate_other_sector) and (($focus <> $candidate_sector) and ($invalidsdtport[$focus] <> true))))))
		getdistance $distancethere $candidate_other_sector $focus
		getdistance $distanceback $focus $candidate_other_sector
		if ($distancethere < 0)
			send "^f"&$candidate_other_sector&"*"&$focus&"*q"
			waiton "ENDINTERROG"
			getdistance $distancethere $candidate_other_sector $focus
		end
		if ($distanceback < 0)
			send "^f"&$focus&"*"&$candidate_other_sector&"*q"
			waiton "ENDINTERROG"
			getdistance $distanceback $focus $candidate_other_sector
		end
		if ($distancethere > $transportrange)
			goto :sdtcandidate_next
		elseif ($distanceback > $transportrange)
			goto :sdtcandidate_next
		else
			killalltriggers
			send "l "&$candidate_planet&"* m n t * c*"
			settextlinetrigger onplanetcandidate :onplanetcandidate "Citadel treasury"
			settextlinetrigger noplanetcandidate :noplanetcandidate "That planet is not"
			pause

			:noplanetcandidate
			setvar $switchboard~message "Planet "&$candidate_planet&" is not in this sector. Halting Script.*"
			gosub :switchboard~switchboard
			halt

			:onplanetcandidate
			send "p "&$focus&"*y"
			settextlinetrigger pwarpnoshipcandidate :pwarpnoshipcandidate "You do not have any fighters in Sector "
			settextlinetrigger pwarpyescandidate :pwarpyescandidate " Planetary TransWarp Drive Engaged! "
			settextlinetrigger pwarpnofuelcandidate :pwarpnofuelcandidate "You do not have enough Fuel Ore on this planet to make the jump."
			pause

				:pwarpnofuelcandidate
				setvar $switchboard~message "Not enough fuel on planet "&$candidate_planet&". Halting Script.*"
				gosub :switchboard~switchboard
				setvar $psdt_exit_message "Not enough fuel on planet "&$candidate_planet&". Halting Script.*"
				setvar $psdt_exit_announced true
				goto :endsdt

				:pwarpyescandidate
				killalltriggers
				gosub :player~quikstats
				setvar $candidate_sector $focus
					gosub :updatesdtcandidateequipment
					gosub :getsdtportinfo
					if ($sdtportvalid <> true)
						setvar $candidate_needsport true
						gosub :displaycredits
						send "q *q *"
						gosub :readcandidatefuel
						goto :sdtcandidate_next
					end
					setvar $candidate_minsteal (($player~experience / $game~steal_factor) - 1)
						if ($player~total_holds < $candidate_minsteal)
							setvar $candidate_minsteal $player~total_holds
						end
						if (($seededmaxedport[$focus] <> true) and ($equipatport[$focus] <= 0))
							setvar $invalidsdtport[$focus] true
							setvar $candidate_needsport true
							gosub :displaycredits
							send "q *q *"
						gosub :readcandidatefuel
						goto :sdtcandidate_next
					end
					getsectorparameter $candidate_sector "BUSTED" $isbusted
					if ($buyfuel = true) and ($isbusted <> true)
						gosub :player~currentprompt
						gosub :clearcandidatecargo
					setvar $merchant~buyfuel_minimum 10000
					setvar $merchant~buyfuel_min_room_pct 10
					gosub :merchant~buyfuel
						if (($merchant~buyfuel_message = "Unable to reach Planet prompt while refreshing port.") or ($merchant~buyfuel_message = "Unable to reach Citadel prompt while refreshing port.") or ($merchant~buyfuel_message = "Prompt timed out while refreshing port."))
							setvar $switchboard~message $merchant~buyfuel_message&" Halting Script.*"
							gosub :switchboard~switchboard
							setvar $psdt_exit_message $merchant~buyfuel_message&" Halting Script.*"
							setvar $psdt_exit_announced true
							goto :endsdt
						end
					if ($merchant~buyfuel_bought = true)
						send "q q jy l "&$candidate_planet&"* c*"
						waiton "Citadel treasury contains"
					end
					gosub :player~quikstats
					end
					gosub :clearcandidatecargo
					if (($equipbuyingpct[$candidate_sector] = 100) and ($candidate_equipment > 0))
						gosub :sellcandidateplanetgear
						setvar $focus $candidate_sector
						gosub :getsdtportinfo
					end
					if ($player~empty_holds <= 0)
						setvar $invalidsdtport[$candidate_sector] true
						setvar $candidate_needsport true
					gosub :displaycredits
					send "q *q *"
					gosub :readcandidatefuel
					goto :sdtcandidate_next
				end
				setvar $candidate_needsport false
				setvar $candidate_totalholds $player~total_holds
				gosub :displaycredits
				send "q *q *"
			gosub :readcandidatefuel
			setvar $candidate_found true
			return

			:pwarpnoshipcandidate
			killalltriggers
			gosub :displaycredits
			send "q q "
		end
	end
	:sdtcandidate_next
	add $i 1
end
	if ($mcicselection = true)
		setvar $mcicselection false
		getnearestwarps $nearest $candidate_sector
		setvar $i 1
		goto :sdtcandidate_loop
	end
	if ($allsdtselection <> true)
		setvar $allsdtselection true
		setvar $nearest sectors
		setvar $i 11
		goto :sdtcandidate_loop
	end
	if (($allowmaxedbuyer <> true) and ($candidate_equipment > 0))
		setvar $allowmaxedbuyer true
		setvar $allsdtselection false
		if (($mcicmode = true) and ($portcount > 0))
			setvar $mcicselection true
			setvar $nearest $portcount
	else
		getnearestwarps $nearest $candidate_sector
	end
	setvar $i 1
	goto :sdtcandidate_loop
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:updatesdtcandidateequipment
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "q "
gosub :planet~getplanetinfo
send "c "
waiton "Citadel treasury contains"
if ($candidate_ship = 1)
	setvar $ship1equipment $planet~planetequip
	setvar $candidate_equipment $ship1equipment
else
	setvar $ship2equipment $planet~planetequip
	setvar $candidate_equipment $ship2equipment
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:readcandidatefuel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($candidate_pchk = 1)
	setvar $candidate_pchk 2
elseif ($candidate_pchk = 2)
	setvar $candidate_pchk 3
elseif ($candidate_pchk = 3)
	setvar $candidate_pchk 1
end
waiton "Fuel Ore"
	if ($candidate_ship = 1)
		getword currentline $planet1fuel[$candidate_pchk] 6
		striptext $planet1fuel[$candidate_pchk] ","
	else
		getword currentline $planet2fuel[$candidate_pchk] 6
		striptext $planet2fuel[$candidate_pchk] ","
	end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:clearcandidatecargo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $candidate_ship_equipment $player~equipment_holds
if ($player~empty_holds < $player~total_holds)
	send "q t n l 1* t n l 2* t n l 3* c*"
	waiton "Citadel treasury contains"
	add $candidate_equipment $candidate_ship_equipment
	if ($candidate_ship = 1)
		setvar $ship1equipment $candidate_equipment
	else
		setvar $ship2equipment $candidate_equipment
	end
	gosub :player~quikstats
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:sellcandidateplanetgear
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $active_ship $candidate_ship
setvar $active_sector $candidate_sector
setvar $active_planet $candidate_planet
setvar $active_equipment $candidate_equipment
send "q q "
waiton "Command [TL"
gosub :sellsdtplanetgear
setvar $candidate_equipment $active_equipment
if ($candidate_ship = 1)
	setvar $ship1equipment $candidate_equipment
else
	setvar $ship2equipment $candidate_equipment
end
send "l "&$candidate_planet&"* c*"
waiton "Citadel treasury contains"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:steal
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($isbusted1 <> true) and ($isbusted2 <> true))
	setvar $maxsteal (($player~experience / $game~steal_factor) - 1)
	if ($inship1)
		setvar $active_ship 1
		setvar $active_sector $ship1sector
		setvar $active_planet $psdt_planet1
		setvar $active_equipment $ship1equipment
		if ($ship1totalholds < $maxsteal)
			setvar $steal $ship1totalholds
		else
			setvar $steal $maxsteal
		end
	else
		setvar $active_ship 2
		setvar $active_sector $ship2sector
		setvar $active_planet $psdt_planet2
		setvar $active_equipment $ship2equipment
		if ($ship2totalholds < $maxsteal)
			setvar $steal $ship2totalholds
		else
			setvar $steal $maxsteal
		end
	end

	if ($equipatport[$active_sector] < $steal)
		setvar $focus $active_sector
		setvar $candidate_equipment $active_equipment
		gosub :getsdtportinfo
		if (($equipbuyingpct[$active_sector] = 100) and ($active_equipment > 0))
			setvar $sdtseededstock $equipbuyingamount[$active_sector]
			if ($sdtseededstock > $active_equipment)
				setvar $sdtseededstock $active_equipment
			end
			gosub :sellsdtplanetgear
			setvar $focus $active_sector
			setvar $candidate_equipment $active_equipment
			gosub :getsdtportinfo
			if ($sdtplanetgearsold = true)
				setvar $equipatport[$active_sector] $sdtseededstock
				setvar $equipbuyingpct[$active_sector] 0
				setvar $equipbuyingamount[$active_sector] 0
			end
		end
		if (($equipatport[$active_sector] > 0) and ($equipatport[$active_sector] < $steal))
			setvar $steal $equipatport[$active_sector]
		elseif ($equipatport[$active_sector] <= 0)
			setvar $invalidsdtport[$active_sector] true
			setvar $busted 1
			gosub :transport
			if ($active_ship = 1)
				setvar $ship1needsport true
			else
				setvar $ship2needsport true
			end
			return
		end
	end
	if (($equipbuyingpct[$active_sector] > 0) and (($equipbuyingpct[$active_sector] < 100) and ($equipatport[$active_sector] > 0)))
		setvar $estimatedsteal (($equipatport[$active_sector] * 75) / 100)
		if ($nearfullsdtport[$active_sector] = true)
			setvar $estimatedsteal 1
		end
		if ($estimatedsteal <= 0)
			setvar $estimatedsteal 1
		end
		if ($estimatedsteal < $steal)
			setvar $steal $estimatedsteal
		end
	end

	if ($steal <= 0)
		setvar $invalidsdtport[$active_sector] true
		setvar $busted 1
		gosub :transport
		if ($active_ship = 1)
			setvar $ship1needsport true
		else
			setvar $ship2needsport true
		end
		return
	end

	setvar $laststeal $active_sector
	setvar $stake (($steal - 1) / 11)
else
	setvar $busted 1
	return
end

settextlinetrigger success :success "Success!"
settextlinetrigger busted :busted "Suddenly you're Busted!"
settextlinetrigger portmaxxed :notenoughsteal "There aren't that many holds of Equipment at this port!"
setslinetrigger fakebust :badstealport "Do you want instructions (Y/N) [N]?"
send "p r* s   z3  "&$steal&"* "
pause

:notenoughsteal
killalltriggers
setvar $invalidsdtport[$laststeal] true
setvar $busted 1
gosub :transport
if ($active_ship = 1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
return

:badstealport
killalltriggers
setvar $invalidsdtport[$laststeal] true
setvar $busted 1
gosub :transport
if ($active_ship = 1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
return

:success
killalltriggers
add $player~experience $stake
	subtract $equipatport[$active_sector] $steal
	if ($equipatport[$active_sector] < 0)
		setvar $equipatport[$active_sector] 0
	end
	if ($nearfullsdtport[$active_sector] = true)
		setvar $equipatport[$active_sector] 0
	end
	gosub :dumpsdtstolenequipment
	gosub :transport
killalltriggers
return

:busted
killalltriggers
if ($active_ship = 1)
	subtract $ship1totalholds $stake
	setvar $lastbustsector $ship1sector
else
	subtract $ship2totalholds $stake
	setvar $lastbustsector $ship2sector
end
add $numberbusted 1
setvar $busted 1
gosub :transport
if ($active_ship = 1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
send "'<"&$subspace&">[Busted:"&$lastbustsector&"]<"&$subspace&">* c"
setsectorparameter $lastbustsector "BUSTED" true
savevar $lastbustsector
waiton "<Computer activated>"
send "tq"
settextlinetrigger am :getbuststamp " AM "
settextlinetrigger pm :getbuststamp " PM "
pause

:getbuststamp
killalltriggers
if (($bust_file <> "") and ($bust_file <> 0))
	write $bust_file $lastbustsector&"  "&currentline
end
waiton "<Computer deactivated>"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:sellsdtplanetgear
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sdtplanetgearsold false
if (($equipbuyingpct[$active_sector] <> 100) or ($active_equipment <= 0))
	return
end

send "l "&$active_planet&"* c"
waiton "Citadel treasury contains"
setvar $port~orebuying "Selling"
setvar $port~orgbuying "Selling"
setvar $port~equbuying "Buying"
setvar $port~oretrading 0
setvar $port~orgtrading 0
setvar $port~equtrading $equipbuyingamount[$active_sector]
setvar $port~orepercent 0
setvar $port~orgpercent 0
setvar $port~equpercent 100
setvar $planethaggle~_ck_pnego_fueltosell "-1"
setvar $planethaggle~_ck_pnego_orgtosell "-1"
setvar $planethaggle~_ck_pnego_equiptosell "max"
setvar $planethaggle~hasprods 1
gosub :player~quikstats
gosub :planethaggle~planetneg
setvar $planethaggle~hasprods 0
if ($planethaggle~sellhagglesucceeded = true)
	add $cashdeposited $planethaggle~equprofit
	setvar $sdtplanetgearsold true
end
if ($active_ship = 1)
	setvar $ship1equipment $planet~planetequip
	setvar $active_equipment $ship1equipment
else
	setvar $ship2equipment $planet~planetequip
	setvar $active_equipment $ship2equipment
end
send "q q "
waiton "Command [TL"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:dumpsdtstolenequipment
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
settextlinetrigger dumpfull :sdtplanetfull "There isn't room on the planet"
settextlinetrigger dumpfull2 :sdtplanetfull "They don't have room for that many"
setstrigger dumpdone :sdtdumpdone "Command [TL"
send "l "&$active_planet&"* t n l 3* q "
pause

	:sdtplanetfull
	killalltriggers
	setvar $switchboard~message "Planet "&$active_planet&" is full while dumping stolen equipment. Halting Script.*"
	gosub :switchboard~switchboard
	setvar $psdt_exit_message "Planet "&$active_planet&" is full while dumping stolen equipment. Halting Script.*"
	setvar $psdt_exit_announced true
	goto :endsdt

:sdtdumpdone
killalltriggers
if ($active_ship = 1)
	add $ship1equipment $steal
	setvar $active_equipment $ship1equipment
else
	add $ship2equipment $steal
	setvar $active_equipment $ship2equipment
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checksdtplanets
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $foundplanet1 false
setvar $foundplanet2 false
killalltriggers

:numberingplanets
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
setslinetrigger bedone :done "Land on which planet "
send "lq*"
pause

:planetline
killalltriggers
setvar $line currentline
replacetext $line "<" " "
replacetext $line ">" " "
striptext $line ","
getword $line $temp 1
if ($temp = $psdt_planet1)
	setvar $foundplanet1 true
elseif ($temp = $psdt_planet2)
	setvar $foundplanet2 true
end
settextlinetrigger getline2 :planetline "   <"
setslinetrigger getend :done "Land on which planet "
pause

:done
return

:checksdtships
setvar $foundship2 false
killalltriggers
send "wn*"
settextlinetrigger other :shipline " "&$player~current_sector&" "
settextlinetrigger noships :shipdone "You do not own any other ships in this sector!"
pause

:shipline
killalltriggers
add $shipcount 1
getword currentline $tempid 1
if ($tempid = $psdt_ship2)
	setvar $foundship2 true
end
settextlinetrigger other :shipline " "&$player~current_sector&" "
setslinetrigger nomore :shipdone "Choose which ship to tow "
pause

:shipdone
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getsdtportinfo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sdtportvalid false
setvar $equipbuy 0
setvar $equipperc 0
setvar $equipatport[$focus] 0
setvar $equipbuyingpct[$focus] 0
setvar $equipbuyingamount[$focus] 0
setvar $nearfullsdtport[$focus] false
killalltriggers
settextlinetrigger getportequip :getportequip "Equipment  Buying"
settextlinetrigger noportequip :noequiphere "I have no information about a port in that sector."
settextlinetrigger noportequip2 :noequiphere "Equipment  Selling"
settextlinetrigger portinfodone :gotallportinfo "<Computer deactivated>"
setdelaytrigger portinfotimeout :gotallportinfo 10000
send "cr*q"
pause

:noequiphere
killtrigger getportequip
killtrigger noportequip
killtrigger noportequip2
setvar $equipbuy 0
setvar $equipperc 0
setvar $equipatport[$focus] 0
setvar $equipbuyingpct[$focus] 0
setvar $equipbuyingamount[$focus] 0
setvar $invalidsdtport[$focus] true
goto :waitportinfodone

:getportequip
killtrigger getportequip
killtrigger noportequip
killtrigger noportequip2
setvar $sdtportvalid true
setvar $seededmaxedport[$focus] false
getword currentline $equipbuy 3
getword currentline $equipperc 4
striptext $equipperc "%"
setvar $equipbuyingpct[$focus] $equipperc
setvar $equipbuyingamount[$focus] $equipbuy
setvar $nearfullsdtport[$focus] false
if ($equipperc >= 100)
	if ($candidate_equipment > 0)
		setvar $seededmaxedport[$focus] true
		setvar $equipatport[$focus] 0
		goto :waitportinfodone
	end
	setvar $sdtportvalid false
	setvar $equipatport[$focus] 0
	setvar $invalidsdtport[$focus] true
	goto :waitportinfodone
elseif ($equipperc = 0)
	setvar $equipatport[$focus] ($player~total_holds + 50)
elseif ($equipperc >= 98)
	setvar $nearfullsdtport[$focus] true
	setvar $equipatport[$focus] 1
else
	setvar $x 10000
	divide $x $equipperc
	multiply $x $equipbuy
	divide $x 100
	subtract $x 1
	subtract $x $equipbuy

	if ($x < 0)
		setvar $equipatport[$focus] 0
	else
		setvar $equipatport[$focus] $x
	end
end

:waitportinfodone
pause

:gotallportinfo
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:refurb
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($inship1)
	send "l "&$psdt_planet1&"* m n t * c t f "&$refurbcash&"* p "&$refurbport&"*y"
else
	send "l "&$psdt_planet2&"* m n t * c t f "&$refurbcash&"* p "&$refurbport&"*y"
end
settextlinetrigger pwarpnorefurb :pwarpnorefurbfig "You do not have any fighters in Sector "
settextlinetrigger pwarpyesrefurb :pwarpyesrefurb " Planetary TransWarp Drive Engaged! "
settextlinetrigger pwarpnorefurbfuel :pwarpnorefurb "You do not have enough Fuel Ore on this planet to make the jump."
pause

:pwarpnorefurb
killalltriggers
setvar $switchboard~message "Not enough fuel on planet. Halting Script.*"
gosub :switchboard~switchboard
setvar $mode "General"
savevar $mode
halt

:pwarpnorefurbfig
killalltriggers
setvar $switchboard~message "No fighter down at refurb port in sector "&$refurbport&".*"
gosub :switchboard~switchboard
	if ($refurbport = $rylos)
		if ($alpha_centauri > 10)
			setvar $refurbport $alpha_centauri
			send "qq"
			goto :refurb
		end
	end
	setvar $psdt_exit_message "No fighter down at refurb port in sector "&$refurbport&".*"
	setvar $psdt_exit_announced true
	goto :endsdt

:pwarpyesrefurb
killalltriggers
send "q q p ty"
waiton "You have "
getword currentline $player~credits 3
striptext $player~credits ","
waiton "A  Cargo holds     :"
getword currentline $holdstobuy 10
isnumber $isrefurbholdnumber $holdstobuy
	if (($isrefurbholdnumber <> true) or ($holdstobuy <= 0))
		setvar $switchboard~message "Unable to buy cargo holds at refurb port. Halting Script.*"
		gosub :switchboard~switchboard
		setvar $psdt_exit_message "Unable to buy cargo holds at refurb port. Halting Script.*"
		setvar $psdt_exit_announced true
		send "q q q * "
		goto :endsdt
	end
send "a "&$holdstobuy&"* y q q q * "
if ($inship1)
	add $ship1totalholds $holdstobuy
	if ($ship1totalholds > $maxholds1)
		setvar $ship1totalholds $maxholds1
	end
		if ($ship1totalholds < $ship1minrefurb)
			setvar $switchboard~message "Unable to refurb ship #1 above minimum holds. Halting Script.*"
			gosub :switchboard~switchboard
			setvar $psdt_exit_message "Unable to refurb ship #1 above minimum holds. Halting Script.*"
			setvar $psdt_exit_announced true
			send "q q q * "
			goto :endsdt
		end
	if ($player~credits > 5000000)
		send "l "&$psdt_planet1&"* c t t "&($player~credits - 5000000)&"* p "&$ship1sector&"*y"
		add $cashdeposited ($player~credits - 5000000)
		setvar $player~credits 5000000
	else
		send "l "&$psdt_planet1&"* c p "&$ship1sector&"*y"
	end
else
	add $ship2totalholds $holdstobuy
	if ($ship2totalholds > $maxholds2)
		setvar $ship2totalholds $maxholds2
	end
		if ($ship2totalholds < $ship2minrefurb)
			setvar $switchboard~message "Unable to refurb ship #2 above minimum holds. Halting Script.*"
			gosub :switchboard~switchboard
			setvar $psdt_exit_message "Unable to refurb ship #2 above minimum holds. Halting Script.*"
			setvar $psdt_exit_announced true
			send "q q q * "
			goto :endsdt
		end
	if ($player~credits > 5000000)
		send "l "&$psdt_planet2&"* c t t "&($player~credits - 5000000)&"* p "&$ship2sector&"*y"
		add $cashdeposited ($player~credits - 5000000)
		setvar $player~credits 5000000
	else
		send "l "&$psdt_planet2&"* c p "&$ship2sector&"*y"
	end
end
gosub :displaycredits
settextlinetrigger pwarpnorefurb :pwarpbacknorefurbfig "You do not have any fighters in Sector "
settextlinetrigger pwarpyesback :pwarpyesback " Planetary TransWarp Drive Engaged! "
settextlinetrigger pwarpnorefurbfuel :pwarpbacknorefurbfuel "You do not have enough Fuel Ore on this planet to make the jump."
pause

:pwarpbacknorefurbfuel
killalltriggers
setvar $switchboard~message "Not enough fuel on planet. Can't make it back home. Resuming bot control.*"
gosub :switchboard~switchboard
setvar $mode "General"
savevar $mode
halt

:pwarpbacknorefurbfig
killalltriggers
if ($inship1)
	setvar $invalidsdtport[$ship1sector] true
	setvar $ship1needsport true
else
	setvar $invalidsdtport[$ship2sector] true
	setvar $ship2needsport true
end
setvar $switchboard~message "No fighter down returning from refurb. Finding replacement Planet sdt port.*"
gosub :switchboard~switchboard
send "q q "
return

:pwarpyesback
killalltriggers
send "q q "
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:displaycredits
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $formatteddepositedcredits ""
setvar $spentcredits $cashdeposited
getlength $spentcredits $length
while ($length > 3)
	cuttext $spentcredits $snippet ($length - 2) 9999
	cuttext $spentcredits $spentcredits 1 ($length - 3)
	getlength $spentcredits $length
	setvar $formatteddepositedcredits ","&$snippet&$formatteddepositedcredits
end
setvar $formatteddepositedcredits $spentcredits&$formatteddepositedcredits

setvar $formattedonhandcredits ""
setvar $spentcredits $player~credits
getlength $spentcredits $length
while ($length > 3)
	cuttext $spentcredits $snippet ($length - 2) 9999
	cuttext $spentcredits $spentcredits 1 ($length - 3)
	getlength $spentcredits $length
	setvar $formattedonhandcredits ","&$snippet&$formattedonhandcredits
end
setvar $formattedonhandcredits $spentcredits&$formattedonhandcredits
add $portaverage $cashdeposited
add $portaverage $player~credits
subtract $portaverage $startcash
if ($numberbusted = 0)
	setvar $numberbusted 1
end
divide $portaverage $numberbusted
setwindowcontents "CASH" "    Cash Deposited: "&$formatteddepositedcredits&"*      Cash On Hand: "&$formattedonhandcredits&"*  Busted xxB Ports: "&$numberbusted&"*     Planet 1 Fuel: "&$planet1fuel[1]&"*     Planet 2 Fuel: "&$planet2fuel[1]&"*  Credits per Port: "&$portaverage&"*        Experience: "&$player~experience&"*"

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:transport
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($inship1)
	send "x     "&$psdt_ship2&"* q * "
else
	send "x     "&$psdt_ship1&"* q * "
end
killalltriggers
settextlinetrigger success :transported "Security code accepted"
settextlinetrigger noship :noneavailable "That is not an available ship."
settextlinetrigger range :outofrange "only has a transport range of"
pause

	:noneavailable
	if ($inship1)
		setvar $switchboard~message "Ship #"&$psdt_ship2&" is in use or not owned by you.*"
		gosub :switchboard~switchboard
		setvar $psdt_exit_message "Ship #"&$psdt_ship2&" is in use or not owned by you.*"
	else
		setvar $switchboard~message "Ship #"&$psdt_ship1&" is in use or not owned by you.*"
		gosub :switchboard~switchboard
		setvar $psdt_exit_message "Ship #"&$psdt_ship1&" is in use or not owned by you.*"
	end
	setvar $psdt_exit_announced true
	goto :endsdt
halt

:outofrange
	if ($inship1)
		setvar $switchboard~message "Ship #"&$psdt_ship2&" is out of transporter range.*"
		gosub :switchboard~switchboard
		setvar $psdt_exit_message "Ship #"&$psdt_ship2&" is out of transporter range.*"
	else
		setvar $switchboard~message "Ship #"&$psdt_ship1&" is out of transporter range.*"
		gosub :switchboard~switchboard
		setvar $psdt_exit_message "Ship #"&$psdt_ship1&" is out of transporter range.*"
	end
	setvar $psdt_exit_announced true
	goto :endsdt
halt

:transported
if ($inship1)
	setvar $inship1 false
else
	setvar $inship1 true
end
killalltriggers

return

:endsdt
send "q q q q  * * * "
if ($inship1)
	send "l "&$psdt_planet1&"* c p "&$startingsector&"*y q q q *"
else
	send "l "&$psdt_planet2&"* c p "&$startingsector&"*y q q q *"
end

gosub :transport

if ($inship1)
	send "l "&$psdt_planet1&"* c p "&$startingsector&"*y"
else
	send "l "&$psdt_planet2&"* c p "&$startingsector&"*y"
end

if ($psdt_exit_message <> "")
	if ($psdt_exit_announced <> true)
		setvar $switchboard~message $psdt_exit_message
		gosub :switchboard~switchboard
	end
elseif (($planet1fuel[1] > 0) and (($planet1fuel[2] > 0) and ($planet1fuel[3] > 0)) and (($planet1fuel[1] < 100000) and (($planet1fuel[2] < 100000) and ($planet1fuel[3] < 100000))))
	setvar $switchboard~message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
elseif (($planet2fuel[1] > 0) and (($planet2fuel[2] > 0) and ($planet2fuel[3] > 0)) and (($planet2fuel[1] < 100000) and (($planet2fuel[2] < 100000) and ($planet2fuel[3] < 100000))))
	setvar $switchboard~message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
elseif (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
	setvar $switchboard~message "Too low turns to continue Planet sdt.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "All known xxB ports in the grid are used up.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
end
setvar $switchboard~message "Check to make sure both planets and ships made it back to safe sector.*"
gosub :switchboard~switchboard
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
# Added by Shadow for v5.0.1
# Rank ports by MCIC value, highest to lowest
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:rankports
setvar $sector 11
setarray $mcic sectors
setarray $tmpports sectors
setvar $portcount 0

while ($sector <= sectors)
	if (port.exists[$sector] = true) and (port.buyequip[$sector] = true)
		getsectorparameter $sector "EQUMCIC" $mcic
		striptext $mcic "-"
		isnumber $isnum $mcic
			if (($isnum = true) and ($mcic > 0))
				setvar $mcic[$sector] $mcic
				add $portcount 1
				setvar $tmpports[$portcount] $sector
		end
	end
	add $sector 1
end

setarray $ports $portcount
setarray $mcic_values $portcount
setvar $mcic_count 0
setvar $focus 1

while ($focus <= $portcount)
	setvar $sector $tmpports[$focus]
	setvar $port_mcic $mcic[$sector]
	add $mcic_count 1
	setvar $insert $mcic_count
	while ($insert > 1)
		setvar $prev ($insert - 1)
		if ($mcic_values[$prev] >= $port_mcic)
			goto :insert_mcic_here
		end
		setvar $ports[$insert] $ports[$prev]
		setvar $mcic_values[$insert] $mcic_values[$prev]
		subtract $insert 1
	end
	:insert_mcic_here
	setvar $ports[$insert] $sector
	setvar $mcic_values[$insert] $port_mcic
	add $focus 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checkport
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $goodport false
setvar $cansellfuelhere false
setvar $cansellorghere false
setvar $cansellequiphere false
setvar $canbuyfuelhere false

getsectorparameter $focus "FIGSEC" $hasfigatfocus
if (($focus <> $player~current_sector) and ($hasfigatfocus <> true))
	return
end

getsectorparameter $focus "BUSTED" $isbusted
if (($isbusted = true) or ($checkedports[$focus] = true) or (port.exists[$focus] <> true))
	return
end

setvar $port~target $focus
gosub :port~getportdbinfo

if ($planet~planet_fuel >= 100000) and ($port~orebuying = "Buying") and ($port~oretrading >= $minprod) and ($port~orepercent >= $minpct)
	setvar $cansellfuelhere true
end

if ($planet~planet_organics >= $minprod) and ($port~orgbuying = "Buying") and ($port~orgtrading >= $minprod) and ($port~orgpercent >= $minpct)
	setvar $cansellorghere true
end

if ($planet~planet_equipment >= $minprod) and ($port~equbuying = "Buying") and ($port~equtrading >= $minprod) and ($port~equpercent >= $minpct)
	setvar $cansellequiphere true
end

if ($buyfuel = true)
	setvar $planetroom ($planet~planet_fuel_max - $planet~planet_fuel)
	if ($port~orebuying = "Selling") and ($planetroom >= $minprod) and ($port~oretrading >= $minprod)
		setvar $canbuyfuelhere true
	end
end

return

# includes

include "source\include\switchboard.ts"
include "source\include\loadvars.ts"
include "source\include\help"
include "source\include\port.ts"
include "source\include\player"
include "source\include\merchant.ts"
