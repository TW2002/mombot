logging "OFF"
goto :start_script

:findsstports
if ($ship1needsport)
	if ($inship1 <> true)
		gosub :transport
	end
	getnearestwarps $nearest $ship1sector
	setvar $i 1
	if ($i <= $nearest)
		setvar $focus $nearest[$i]
		getsectorparameter $focus "BUSTED" $isbusted
		getsectorparameter $focus "FIGSEC" $isfigged
		if (($isfigged = true) and (($isbusted <> true) and (((port.exists[$focus] = true) and ((port.equip[$focus] > 0) and (port.buyequip[$focus] = true))) and (($focus <> $ship2sector) and ($focus <> $ship1sector)))))

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
				setvar $nearfig 0
				echo ansi_15 "*No Ports Within Transport Range" ansi_7
				goto :continueonship1
			elseif ($distanceback > $transportrange)
				goto :canttransportship1
			else
				killalltriggers
				send "l "&$psst_planet1&"* c p "&$focus&"*y"
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
				setvar $ship1needsport false
				setvar $ship1sector $focus
				gosub :getsstportinfo
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
				goto :continueonship1

				:pwarpnoship1
				killalltriggers
				gosub :displaycredits
				send "q q "
			end

			:canttransportship1
			add $i 1
		end

		:continueonship1
	end
end
if ($ship2needsport)
	if ($inship1)
		gosub :transport
	end
	getnearestwarps $nearest $ship2sector
	setvar $i 1
	if ($i <= $nearest)
		setvar $focus $nearest[$i]
		getsectorparameter $focus "BUSTED" $isbusted
		getsectorparameter $focus "FIGSEC" $isfigged
		if (($isfigged = true) and (($isbusted <> true) and (((port.exists[$focus] = true) and ((port.equip[$focus] > 0) and (port.buyequip[$focus] = true))) and (($focus <> $ship1sector) and ($focus <> $ship2sector)))))
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
				setvar $nearfig 0
				setvar $switchboard~message "No Ports Within Transport Range*"
				gosub :switchboard~switchboard
				goto :endsst
			elseif ($distanceback > $transportrange)
				goto :canttransport
			else
				killalltriggers
				send "l "&$psst_planet2&"* c p "&$focus&"*y"
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
				setvar $ship2needsport false
				setvar $ship2sector $focus
				gosub :getsstportinfo
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
				goto :continueonship2

				:pwarpnoship2
				killalltriggers
				gosub :displaycredits
				send "q q "
			end

			:canttransport
			add $i 1
		end

		:continueonship2
	end
end
return

:steal
if (($isbusted1 <> true) and ($isbusted2 <> true))
	setvar $maxsteal (($player~experience / $steal_factor) - 1)
	setvar $send ""
	if ($inship1)
		if ($ship1equipment > 0)

			setvar $send $send&"p t * * 0* 0* "
			setvar $ship1equipment 0
			add $equipatport[$ship1sector] $ship1equipment
		end

		if ($ship1totalholds < $maxsteal)
			setvar $steal $ship1totalholds
		else
			setvar $steal $maxsteal
		end

		while ($equipatport[$ship1sector] < ($steal + 20))
			setvar $upgrade ($steal - $equipatport[$ship1sector])
			divide $upgrade 10
			add $upgrade 4
			setvar $send $send&"o 3"&$upgrade&"* * "
			add $equipatport[$ship1sector] ($upgrade * 10)
		end

		setvar $send $send&"p r* s   z3  "&$steal&"*  x    "
		setvar $ship1equipment $steal
		send $send&$psst_ship2&"*  * "
		setvar $inship1 false
		setvar $laststeal $ship1sector
	else
		if ($ship2equipment > 0)

			setvar $send $send&"p t * * 0* 0* "
			setvar $ship2equipment 0
			add $equipatport[$ship2sector] $ship2equipment
		end

		if ($ship2totalholds < $maxsteal)
			setvar $steal $ship2totalholds
		else
			setvar $steal $maxsteal
		end

		while ($equipatport[$ship2sector] < ($steal + 20))
			setvar $upgrade ($steal - $equipatport[$ship2sector])
			divide $upgrade 10
			add $upgrade 4
			setvar $send $send&"o 3"&$upgrade&"* * "
			add $equipatport[$ship2sector] ($upgrade * 10)
		end
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
settextlinetrigger portmaxxed :busted "There aren't that many holds of Equipment at this port!"
settextlinetrigger fakebust :busted "Do you want instructions (Y/N) [N]?"
pause

:success
add $player~experience $stake
if ($inship1)
	setvar $ship2equipment 1
else
	setvar $ship1equipment 1
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
include "source\include\player"

:start_script
loadvar $bot~folder
setvar $bust_file $bot~folder&"/MOM_"&gamename&"_Busts.txt"
setvar $fig_file $bot~folder&"/MOM_"&gamename&"_Fighter_Grid.txt"
setvar $fig_count_file $bot~folder&"/MOM_"&gamename&"_Fighter_Grid_Count.cnt"
loadvar $steal_factor
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
lowercase $parm1
if ($parm1 = "clear_busts")
	delete $bust_file
	setvar $i 1
	while ($i <= sectors)
		setsectorparameter $i "BUSTED" false
		add $i 1
	end
	setvar $switchboard~message "Bust file for this bot has been cleared.*"
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
setvar $portaverage 1
send "jy*"
setvar $cashdeposited 0
gosub :player~quikstats
setvar $startcash $player~credits
setarray $planet1fuel 3
setarray $planet2fuel 3
setvar $psst_ship1 $player~ship_number

if (($psst_ship2 <= 0) or ($psst_planet1 <= 0) or ($psst_planet2 <= 0) or ($steal_factor <= 0))
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
setarray $fuelatport sectors
window "CASH" 300 150 "Planet SST" "ONTOP"
gosub :displaycredits
while (true)
	gosub :findsstports
	setvar $busted false
	getsectorparameter $ship1sector "BUSTED" $isbusted1
	getsectorparameter $ship2sector "BUSTED" $isbusted2
	while ($busted = false)
		if (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
			goto :endsst
		end
		gosub :steal
	end
	if (($ship1totalholds < $minrefurb) or ($ship2totalholds < $minrefurb))
		gosub :refurb
	end
	if (($planet1fuel[1] < 100000) and (($planet1fuel[2] < 100000) and ($planet1fuel[3] < 100000)))
		goto :endsst
	elseif (($planet2fuel[1] < 100000) and (($planet2fuel[2] < 100000) and ($planet2fuel[3] < 100000)))
		goto :endsst
	end
end
goto :endsst

:checksstplanets
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

:getsstportinfo
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
goto :gotallportinfo

:getportequip
killalltriggers
getword currentline $equipbuy 3
getword currentline $equipperc 4
striptext $equipperc "%"
setvar $x 10000
if ($equipperc = 0)
	setvar $equipatport[$focus] ($player~total_holds + 50)
else
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

:refurb
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
setvar $switchboard~message "No fighter down coming back from refurb port, halting.*"
gosub :switchboard~switchboard
goto :endsst

:pwarpyesback
killalltriggers
send "q q "
return

:displaycredits
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

:transport
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
include "source\include\switchboard.ts"
