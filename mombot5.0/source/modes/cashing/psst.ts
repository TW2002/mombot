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
setvar $help~help[1] $help~tab&"Planet SST using two ships and two planets."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  psst [ship2#] [planet1#] [planet2#] {mcic}"
setvar $help~help[4] $help~tab&"        psst clear_busts"
setvar $help~help[5] $help~tab&"   "
setvar $help~help[6] $help~tab&"   [ship2#] - empty second ship in the starting sector."
setvar $help~help[7] $help~tab&"   [planet1#] [planet2#] - movable planets in the starting sector."
setvar $help~help[8] $help~tab&"   [clear_busts] - clears cached bust data."
setvar $help~help[9] $help~tab&"   Steals equipment from xxB ports, xports between ships, and refurbishes."
setvar $help~help[10] $help~tab&"   Run from Command."
gosub :help~helpfile

#gosub :rankports
#setvar $i 0
#while ($i < $portcount)
#	add $i 1
#	echo "port sector " &$ports[$i] & " mcic " &$mcic[$ports[$i]] & "*"
#end
#halt

lowercase $parm1
lowercase $parm2
lowercase $parm3
lowercase $parm4
setvar $mcicmode false
if ($parm1 = "mcic")
	setvar $mcicmode true
	setvar $parm1 $parm2
	setvar $parm2 $parm3
	setvar $parm3 $parm4
elseif ($parm4 = "mcic")
	setvar $mcicmode true
end
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
isnumber $isparamonenumber $parm1
isnumber $isparamtwonumber $parm2
isnumber $isparamthreenumber $parm3

if ($startinglocation <> "Command")
	setvar $switchboard~message "Planet SST must be run from command prompt*"
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
	setvar $psst_ship2 $parm1
	setvar $psst_planet1 $parm2
	setvar $psst_planet2 $parm3
else
	setvar $switchboard~message "Please use psst [ship2#] [planet1#] [planet2#] format.*"
	gosub :switchboard~switchboard
	halt

end
send "jy*"

setvar $portaverage 1
setvar $cashdeposited 0
gosub :player~quikstats
setvar $startcash $player~credits
setarray $planet1fuel 3
setarray $planet2fuel 3
setvar $psst_ship1 $player~ship_number

if (($psst_ship2 <= 0) or ($psst_planet1 <= 0) or ($psst_planet2 <= 0) or ($game~steal_factor <= 0))
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
	setvar $switchboard~message "This bot has no locations of Class 0 ports in its database.  Cannot continue with Planet SST.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if (sector.planetcount[$startingsector] <= 1)
	setvar $switchboard~message "Planet SST must be run with at least two movable planets in the sector*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if (sector.shipcount[$startingsector] < 1)
	setvar $switchboard~message "Planet SST must be run with at least one empty ship in the sector*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

gosub :checksstplanets
gosub :checksstships

if ($foundplanet1 <> true)
	setvar $switchboard~message "Planet #1 entered for Planet SST was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if ($foundplanet2 <> true)
	setvar $switchboard~message "Planet #2 entered for Planet SST was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

if ($foundship2 <> true)
	setvar $switchboard~message "Ship #2 entered for Planet SST was not valid for this sector.*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	savevar $mode
	halt
end

setvar $switchboard~message "Planet SST Powering Up!*"
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
if ($maxholds1 >= $maxholds2)
	setvar $minrefurb (($maxholds1 * 75) / 100)
else
	setvar $minrefurb (($maxholds2 * 75) / 100)
end

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
setarray $seededmaxedport sectors
setarray $fuelatport sectors
setarray $invalidsstport sectors
if ($mcicmode = true)
	gosub :rankports
end

window "CASH" 300 150 "Planet SST" "ONTOP"
gosub :displaycredits

:psst
gosub :findsstports

if (($ship1needsport = true) or ($ship2needsport = true))
	setvar $switchboard~message "No valid replacement Planet SST ports found.*"
	gosub :switchboard~switchboard
	goto :endsst
end

setvar $busted false
getsectorparameter $ship1sector "BUSTED" $isbusted1
getsectorparameter $ship2sector "BUSTED" $isbusted2

logging off
while ($busted = false)
	if (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
		goto :endsst
	end
	gosub :steal
end
logging on

if (($ship1totalholds < $minrefurb) or ($ship2totalholds < $minrefurb))
	gosub :refurb
end

if (($planet1fuel[1] < 100000) and (($planet1fuel[2] < 100000) and ($planet1fuel[3] < 100000)))
	goto :endsst
elseif (($planet2fuel[1] < 100000) and (($planet2fuel[2] < 100000) and ($planet2fuel[3] < 100000)))
	goto :endsst
end
goto :psst

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findsstports
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($ship1needsport)
	if ($inship1 <> true)
		gosub :transport
	end
	setvar $mcicselection false
	if (($mcicmode = true) and ($portcount > 0))
		setvar $mcicselection true
		setvar $nearest $portcount
	else
		getnearestwarps $nearest $ship1sector
	end
	setvar $i 1
	:ship1candidate_loop
		while ($i <= $nearest)
		if ($mcicselection = true)
			setvar $focus $ports[$i]
		else
			setvar $focus $nearest[$i]
			end
			getsectorparameter $focus "BUSTED" $isbusted
			getsectorparameter $focus "FIGSEC" $isfigged
			setvar $porthassteal false
			if ((port.equip[$focus] > 0) and (port.equip[$focus] < 65530))
				setvar $porthassteal true
			elseif ((port.equip[$focus] >= 65530) and ($ship1equipment > 0))
				setvar $porthassteal true
			end
				if (($isfigged = true) and (($isbusted <> true) and (((port.exists[$focus] = true) and (($porthassteal = true) and (port.buyequip[$focus] = true))) and (($focus <> $ship2sector) and (($focus <> $ship1sector) and ($invalidsstport[$focus] <> true))))))

			getdistance $distancethere $ship2sector $focus
			getdistance $distanceback $focus $ship2sector
			if ($distancethere < 0)
				send "^f"&$ship2sector&"*"&$focus&"*q"
				waiton "ENDINTERROG"
				getdistance $distancethere $ship2sector $focus
			end
			if ($distanceback < 0)
				send "^f"&$focus&"*"&$ship2sector&"*q"
				waiton "ENDINTERROG"
				getdistance $distanceback $focus $ship2sector
				end
				if ($distancethere > $transportrange)
					goto :canttransportship1
				elseif ($distanceback > $transportrange)
					goto :canttransportship1
				else
				killalltriggers
				send "l "&$psst_planet1&"* c*"
				settextlinetrigger onplanet1 :onplanet1 "Citadel treasury"
				settextlinetrigger noplanet1 :noplanet1 "That planet is not"
				pause

				:noplanet1
				setvar $switchboard~message "Planet "&$psst_planet1&" is not in this sector. Halting Script.*"
				gosub :switchboard~switchboard
				halt

				:onplanet1
				send "p "&$focus&"*y"
				settextlinetrigger pwarpnoship1 :pwarpnoship1 "You do not have any fighters in Sector "
				settextlinetrigger pwarpyesship1 :pwarpyesship1 " Planetary TransWarp Drive Engaged! "
				settextlinetrigger pwarpnofuel1 :pwarpnofuel1 "You do not have enough Fuel Ore on this planet to make the jump."
				pause

				:pwarpnofuel1
				setvar $switchboard~message "Not enough fuel on planet "&$psst_planet1&". Halting Script.*"
				gosub :switchboard~switchboard
				goto :endsst

				:pwarpyesship1
				killalltriggers
				gosub :player~quikstats
				setvar $ship1sector $focus
				gosub :getsstportinfo
				if ($sstportvalid <> true)
					setvar $ship1needsport true
					gosub :displaycredits
					send "q *q *"
					if ($p1chk = 1)
						setvar $p1chk 2
					elseif ($p1chk = 2)
						setvar $p1chk 3
					elseif ($p1chk = 3)
						setvar $p1chk 1
					end
					waiton "Fuel Ore"
					getword currentline $planet1fuel[$p1chk] 6
					striptext $planet1fuel[$p1chk] ","
					goto :canttransportship1
				end
				setvar $ship1needsport false
				setvar $ship1totalholds $player~total_holds
				setvar $ship1equipment $player~equipment_holds
				gosub :displaycredits
				send "q *q *"
				if ($p1chk = 1)
					setvar $p1chk 2
				elseif ($p1chk = 2)
					setvar $p1chk 3
				elseif ($p1chk = 3)
					setvar $p1chk 1
				end
				waiton "Fuel Ore"
				getword currentline $planet1fuel[$p1chk] 6
				striptext $planet1fuel[$p1chk] ","
				goto :donefindship1

				:pwarpnoship1
				killalltriggers
				gosub :displaycredits
				send "q q "
			end

			end

			:canttransportship1
			add $i 1
			:continueonship1
			end
		if ($mcicselection = true)
			setvar $mcicselection false
			getnearestwarps $nearest $ship1sector
			setvar $i 1
			goto :ship1candidate_loop
		end
		end

	:donefindship1
	if ($ship2needsport)
		if ($inship1)
			gosub :transport
		end
		setvar $mcicselection false
		if (($mcicmode = true) and ($portcount > 0))
			setvar $mcicselection true
			setvar $nearest $portcount
		else
			getnearestwarps $nearest $ship2sector
		end
		setvar $i 1
		:ship2candidate_loop
			while ($i <= $nearest)
			if ($mcicselection = true)
				setvar $focus $ports[$i]
			else
				setvar $focus $nearest[$i]
				end
				getsectorparameter $focus "BUSTED" $isbusted
				getsectorparameter $focus "FIGSEC" $isfigged
				setvar $porthassteal false
				if ((port.equip[$focus] > 0) and (port.equip[$focus] < 65530))
					setvar $porthassteal true
				elseif ((port.equip[$focus] >= 65530) and ($ship2equipment > 0))
					setvar $porthassteal true
				end
					if (($isfigged = true) and (($isbusted <> true) and (((port.exists[$focus] = true) and (($porthassteal = true) and (port.buyequip[$focus] = true))) and (($focus <> $ship1sector) and (($focus <> $ship2sector) and ($invalidsstport[$focus] <> true))))))
			getdistance $distancethere $ship1sector $focus
			getdistance $distanceback $focus $ship1sector
			if ($distancethere < 0)
				send "^f"&$ship1sector&"*"&$focus&"*q"
				waiton "ENDINTERROG"
				getdistance $distancethere $ship1sector $focus
			end
			if ($distanceback < 0)
				send "^f"&$focus&"*"&$ship1sector&"*q"
				waiton "ENDINTERROG"
				getdistance $distanceback $focus $ship1sector
				end
				if ($distancethere > $transportrange)
					goto :canttransport
				elseif ($distanceback > $transportrange)
					goto :canttransport
				else
				killalltriggers
				send "l "&$psst_planet2&"* c*"
				settextlinetrigger onplanet2 :onplanet2 "Citadel treasury"
				settextlinetrigger noplanet2 :noplanet2 "That planet is not"
				pause

				:noplanet2
				setvar $switchboard~message "Planet "&$psst_planet2&" is not in this sector. Halting Script.*"
				gosub :switchboard~switchboard
				halt

				:onplanet2
				send "p "&$focus&"*y"
				settextlinetrigger pwarpnoship2 :pwarpnoship2 "You do not have any fighters in Sector "
				settextlinetrigger pwarpyesship2 :pwarpyesship2 " Planetary TransWarp Drive Engaged! "
				settextlinetrigger pwarpnofuel2 :pwarpnofuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause

				:pwarpnofuel2
				setvar $switchboard~message "Not enough fuel on planet "&$psst_planet2&". Halting Script.*"
				gosub :switchboard~switchboard
				goto :endsst

				:pwarpyesship2
				killalltriggers
				gosub :player~quikstats
				setvar $ship2sector $focus
				gosub :getsstportinfo
				if ($sstportvalid <> true)
					setvar $ship2needsport true
					gosub :displaycredits
					send "q *q *"
					if ($p2chk = 1)
						setvar $p2chk 2
					elseif ($p2chk = 2)
						setvar $p2chk 3
					elseif ($p2chk = 3)
						setvar $p2chk 1
					end
					waiton "Fuel Ore"
					getword currentline $planet2fuel[$p2chk] 6
					striptext $planet2fuel[$p2chk] ","
					goto :canttransport
				end
				setvar $ship2needsport false
				setvar $ship2totalholds $player~total_holds
				setvar $ship2equipment $player~equipment_holds
				gosub :displaycredits
				send "q *q *"
				if ($p2chk = 1)
					setvar $p2chk 2
				elseif ($p2chk = 2)
					setvar $p2chk 3
				elseif ($p2chk = 3)
					setvar $p2chk 1
				end
				waiton "Fuel Ore"
				getword currentline $planet2fuel[$p2chk] 6
				striptext $planet2fuel[$p2chk] ","
				goto :donefindship2

				:pwarpnoship2
				killalltriggers
				gosub :displaycredits
				send "q q "
			end

			end

			:canttransport
			add $i 1
				:continueonship2
				end
			if ($mcicselection = true)
				setvar $mcicselection false
				getnearestwarps $nearest $ship2sector
				setvar $i 1
				goto :ship2candidate_loop
			end
			end

	:donefindship2
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:steal
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($isbusted1 <> true) and ($isbusted2 <> true))
		setvar $maxsteal (($player~experience / $game~steal_factor) - 1)
		setvar $send ""
		if ($inship1)
			if ($ship1totalholds < $maxsteal)
				setvar $steal $ship1totalholds
			else
				setvar $steal $maxsteal
			end
			if (($seededmaxedport[$ship1sector] = true) and (($ship1equipment > 0) and ($ship1equipment < $steal)))
				setvar $steal $ship1equipment
			end

			if ($ship1equipment > 0)

				setvar $send $send&"p t * * 0* 0* "
				add $equipatport[$ship1sector] $ship1equipment
				setvar $ship1equipment 0
			end

			while ($equipatport[$ship1sector] < ($steal + 20))
				if ($seededmaxedport[$ship1sector] = true)
					goto :doneupgradeship1
				end
				setvar $upgrade ($steal - $equipatport[$ship1sector])
				divide $upgrade 10
				add $upgrade 4
				setvar $send $send&"o 3"&$upgrade&"* * "
				add $equipatport[$ship1sector] ($upgrade * 10)
			end

			:doneupgradeship1
			setvar $send $send&"p r* s   z3  "&$steal&"*  x    "
			setvar $ship1equipment $steal
			send $send&$psst_ship2&"*  * "
			setvar $inship1 false
			setvar $laststeal $ship1sector
		else
			if ($ship2totalholds < $maxsteal)
				setvar $steal $ship2totalholds
			else
				setvar $steal $maxsteal
			end
			if (($seededmaxedport[$ship2sector] = true) and (($ship2equipment > 0) and ($ship2equipment < $steal)))
				setvar $steal $ship2equipment
			end

			if ($ship2equipment > 0)

				setvar $send $send&"p t * * 0* 0* "
				add $equipatport[$ship2sector] $ship2equipment
				setvar $ship2equipment 0
			end

			while ($equipatport[$ship2sector] < ($steal + 20))
				if ($seededmaxedport[$ship2sector] = true)
					goto :doneupgradeship2
				end
				setvar $upgrade ($steal - $equipatport[$ship2sector])
				divide $upgrade 10
				add $upgrade 4
				setvar $send $send&"o 3"&$upgrade&"* * "
				add $equipatport[$ship2sector] ($upgrade * 10)
			end
			:doneupgradeship2
			setvar $send $send&"p r* s   z3  "&$steal&"*  x    "
			setvar $ship2equipment $steal
			send $send&$psst_ship1&"*  * "
			setvar $inship1 true
			setvar $laststeal $ship2sector
	end
end

setvar $stake (($steal - 1) / 11)

waiton "(R)ob this port, (S)teal product"
settextlinetrigger success :success "Success!"
settextlinetrigger busted :busted "Suddenly you're Busted!"
settextlinetrigger portmaxxed :badstealport "There aren't that many holds of Equipment at this port!"
settextlinetrigger fakebust :badstealport "Do you want instructions (Y/N) [N]?"
pause

:badstealport
killalltriggers
setvar $invalidsstport[$laststeal] true
setvar $busted 1
if ($inship1)
	setvar $ship2equipment 0
else
	setvar $ship1equipment 0
end
gosub :transport
if ($inship1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
return

	:success
	add $player~experience $stake
	if ($inship1)
		setvar $ship2equipment $steal
	else
		setvar $ship1equipment $steal
	end
killalltriggers
return

:busted
if ($inship1)
	subtract $ship2totalholds $stake
	setvar $lastbustsector $ship2sector
	setvar $ship2equipment 0
else
	subtract $ship1totalholds $stake
	setvar $lastbustsector $ship1sector
	setvar $ship1equipment 0
end
add $numberbusted 1
setvar $busted 1
gosub :transport
if ($inship1)
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
if ($inship1)
	if (($bust_file <> "") and ($bust_file <> 0))
		write $bust_file $ship1sector&"  "&currentline
	end
else
	if (($bust_file <> "") and ($bust_file <> 0))
		write $bust_file $ship2sector&"  "&currentline
	end
end
waiton "<Computer deactivated>"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checksstplanets
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $foundplanet1 false
setvar $foundplanet2 false
killalltriggers

:numberingplanets
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
settextlinetrigger bedone :done "Land on which planet "
send "lq*"
pause

:planetline
killalltriggers
setvar $line currentline
replacetext $line "<" " "
replacetext $line ">" " "
striptext $line ","
getword $line $temp 1
if ($temp = $psst_planet1)
	setvar $foundplanet1 true
elseif ($temp = $psst_planet2)
	setvar $foundplanet2 true
end
settextlinetrigger getline2 :planetline "   <"
settextlinetrigger getend :done "Land on which planet "
pause

:done
return

:checksstships
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
if ($tempid = $psst_ship2)
	setvar $foundship2 true
end
settextlinetrigger other :shipline " "&$player~current_sector&" "
settextlinetrigger nomore :shipdone "Choose which ship to tow "
pause

:shipdone
killalltriggers

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getsstportinfo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sstportvalid false
send "s* cr*q"
waiton "What sector is the port in? ["

:portinfo
settextlinetrigger getportequip :getportequip "Equipment  Buying"
settextlinetrigger noportequip :noequiphere "I have no information about a port in that sector."
pause

:noequiphere
killalltriggers
setvar $equipbuy 0
setvar $equipperc 0
setvar $equipatport[$focus] 0
setvar $invalidsstport[$focus] true
goto :gotallportinfo

:getportequip
killalltriggers
	setvar $sstportvalid true
	setvar $seededmaxedport[$focus] false
	getword currentline $equipbuy 3
	getword currentline $equipperc 4
	striptext $equipperc "%"
		if ($equipbuy >= 65530)
			if ($player~equipment_holds > 0)
				setvar $seededmaxedport[$focus] true
				setvar $equipatport[$focus] ($player~equipment_holds + 20)
				goto :gotallportinfo
			end
			setvar $sstportvalid false
			setvar $equipatport[$focus] 0
			setvar $invalidsstport[$focus] true
		goto :gotallportinfo
	elseif ($equipperc = 0)
		setvar $equipatport[$focus] ($player~total_holds + 50)
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

:gotallportinfo
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:refurb
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($inship1)
	send "l "&$psst_planet1&"* c p "&$refurbport&"*y"
else
	send "l "&$psst_planet2&"* c p "&$refurbport&"*y"
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
goto :endsst

:pwarpyesrefurb
killalltriggers
send "q q p ty"
waiton "You have "
getword currentline $player~credits 3
striptext $player~credits ","
waiton "A  Cargo holds     :"
getword currentline $holdstobuy 10
send "a "&$holdstobuy&"* y q q q * "
if ($inship1)
	if ($player~credits > 5000000)
		send "l "&$psst_planet1&"* c t t "&($player~credits - 5000000)&"* p "&$ship1sector&"*y"
		add $cashdeposited ($player~credits - 5000000)
		setvar $player~credits 5000000
	else
		send "l "&$psst_planet1&"* c p "&$ship1sector&"*y"
	end
else
	if ($player~credits > 5000000)
		send "l "&$psst_planet2&"* c t t "&($player~credits - 5000000)&"* p "&$ship2sector&"*y"
		add $cashdeposited ($player~credits - 5000000)
		setvar $player~credits 5000000
	else
		send "l "&$psst_planet2&"* c p "&$ship2sector&"*y"
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
	setvar $invalidsstport[$ship1sector] true
	setvar $ship1needsport true
else
	setvar $invalidsstport[$ship2sector] true
	setvar $ship2needsport true
end
setvar $switchboard~message "No fighter down returning from refurb. Finding replacement Planet SST port.*"
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
	send "x     "&$psst_ship2&"* q * "
else
	send "x     "&$psst_ship1&"* q * "
end
killalltriggers
settextlinetrigger success :transported "Security code accepted"
settextlinetrigger noship :noneavailable "That is not an available ship."
settextlinetrigger range :outofrange "only has a transport range of"
pause

:noneavailable
if ($inship1)
	setvar $switchboard~message "Ship #"&$psst_ship2&" is in use or not owned by you.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Ship #"&$psst_ship1&" is in use or not owned by you.*"
	gosub :switchboard~switchboard
end
goto :endsst
halt

:outofrange
if ($inship1)
	setvar $switchboard~message "Ship #"&$psst_ship2&" is out of transporter range.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Ship #"&$psst_ship1&" is out of transporter range.*"
	gosub :switchboard~switchboard
end
goto :endsst
halt

:transported
if ($inship1)
	setvar $inship1 false
else
	setvar $inship1 true
end
killalltriggers

return

:endsst
send "q q q q  * * * "
if ($inship1)
	send "l "&$psst_planet1&"* c p "&$startingsector&"*y q q q *"
else
	send "l "&$psst_planet2&"* c p "&$startingsector&"*y q q q *"
end

gosub :transport

if ($inship1)
	send "l "&$psst_planet1&"* c p "&$startingsector&"*y"
else
	send "l "&$psst_planet2&"* c p "&$startingsector&"*y"
end

if (($planet1fuel[1] < 100000) and (($planet1fuel[2] < 100000) and ($planet1fuel[3] < 100000)))
	setvar $switchboard~message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
elseif (($planet2fuel[1] < 100000) and (($planet2fuel[2] < 100000) and ($planet2fuel[3] < 100000)))
	setvar $switchboard~message "Planet(s) low on fuel, stopping script.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
elseif (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
	setvar $switchboard~message "Too low turns to continue Planet SST.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "All known xxB ports in the grid are used up.  Put total of "&$formatteddepositedcredits&" credits in treasury.*"
	gosub :switchboard~switchboard
end
setvar $switchboard~message "Check to make sure both planets and ships made it back to safe sector.*"
gosub :switchboard~switchboard
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:rankports
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
