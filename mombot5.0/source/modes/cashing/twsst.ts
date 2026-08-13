#            WW      WW   SSSSSS   SSSSSS   TTTTTTTTTT
#            WW      WW  SS        SS            TT
#            WW      WW  SS        SS            TT
#            WW  WW  WW   SSSSS    SSSSS        TT
#            WW  WW  WW       SS       SS       TT
#            WWWWWWWWWW       SS       SS       TT
#             WWW  WWW   SSSSSS   SSSSSS       TT

gosub :loadvars~loadvars
loadvar $game~genesis_cost
loadvar $game~atomic_cost
loadvar $game~max_planets_per_sector
loadvar $game~steal_factor
loadvar $bot~bot_name
loadvar $bot~subspace
loadvar $bot~safe_ship

setvar $bot~command "wsst"

gosub :help~initialize
setvar $help~help[1]   $help~tab&"World Sell-Steal-Transport "
setvar $help~help[2]   $help~tab&" - wsst [ship2] {cash dropoff} {f} {s} {safe|passive} {furbpoint} "
setvar $help~help[3]   $help~tab&"   Options: "
setvar $help~help[4]   $help~tab&"     {cash dropoff} - if started from planet citadel  "
setvar $help~help[5]   $help~tab&"     {f}            - buy fighters"
setvar $help~help[6]   $help~tab&"     {s}            - buy shields "
setvar $help~help[7]   $help~tab&"     {safe}         - Will not mow to locations, scans and moves"
setvar $help~help[8]   $help~tab&"     {passive}      - Will be safe, as well as avoid any enemy fighters "
setvar $help~help[9]   $help~tab&"     {furbpoint}    - Terra, Dock (default), Alpha, Rylos "
setvar $help~help[10]  $help~tab&"     {limp}         - Will lay 3 limps/sector if Furbing at Dock. "
setvar $help~help[11]  $help~tab&"     {armid}        - Will lay 3 armids/sector if Furbing at Dock. "
setvar $help~help[12]  $help~tab&"     {quiet}        - Will not braodcast BUSTED msg's on SubSpace  "
setvar $help~help[13]  $help~tab&"     {x100}         - Will Drop 100 Fighters per sector "
gosub :help~helpfile

#gosub :refurb
#halt

setvar $player~save true
setvar $cash_to_hold_onto 1000000

gosub :player~quikstats

setvar $droplimps (" " & $bot~user_command_line & " ")
lowercase $droplimps
getwordpos $droplimps $pos " limp "
if ($pos = 0)
	setvar $droplimps false
else
	setvar $droplimps true
end

setvar $droparmids (" " & $bot~user_command_line & " ")
lowercase $droparmids
getwordpos $droparmids $pos " armid "
if ($pos = 0)
	setvar $droparmids false
else
	setvar $droparmids true
end

setvar $quiet (" " & $bot~user_command_line & " ")
lowercase $quiet
getwordpos $quiet $pos " quiet "
if ($pos = 0)
	setvar $quiet false
else
	setvar $quiet true
end

setvar $x100 (" " & $bot~user_command_line & " ")
lowercase $x100
getwordpos $x100 $pos " x100 "
if ($pos = 0)
	setvar $x100 false
else
	setvar $x100 true
end

setvar $x1000 (" " & $bot~user_command_line & " ")
lowercase $x1000
getwordpos $x1000 $pos " x1000 "
if ($pos = 0)
	setvar $x1000 false
else
	setvar $x1000 true
	setvar $x100 false
end

setvar $startinglocation $player~current_prompt
isnumber $isparamonenumber   $bot~parm1
isnumber $isparamtwonumber   $bot~parm2
isnumber $isparamthreenumber $bot~parm3

if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "World SST must be run from command or citadel prompt*"
	gosub :switchboard~switchboard
	halt
end
gosub :ship~getshipstats

lowercase $bot~parm1
if ($isparamonenumber = true)
	setvar $psst_ship2 $bot~parm1
	if ($isparamtwonumber = true)
		setvar $dropcashlimit $bot~parm2
	end
else
	setvar $switchboard~message "Please use wsst [ship2#] format.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~experience < 500)
	setvar $switchboard~message "You do not have enough experience to run WorldSST.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~credits < 200000)
	setvar $switchboard~message "You must have at least 200,000 credits on hand to run WorldSST.*"
	gosub :switchboard~switchboard
	halt
end
cuttext $player~alignment $neg_ck 1 1

striptext $player~alignment "-"
if ($player~alignment < 100) and ($neg_ck = "-")
	setvar $switchboard~message "Need -100 Alignment Minimum to run World SST.*"
	gosub :switchboard~switchboard
	halt
elseif ($neg_ck <> "-")
	setvar $switchboard~message "Need -100 Alignment Minimum to run World SST.*"
	gosub :switchboard~switchboard
	halt
end
getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $refurbfighters true
else
	setvar $refurbfighters false
end

getwordpos " "&$bot~user_command_line&" " $pos " s "
if ($pos > 0)
	setvar $refurbshields true
else
	setvar $refurbshields false
end
setvar $safefighterlevel 5000
getwordpos " "&$bot~user_command_line&" " $pos " safe "
if ($pos > 0)
	setvar $ultrasafe true
	setvar $safefighterlevel 100
else
	setvar $ultrasafe false
end

getwordpos " "&$bot~user_command_line&" " $pos " passive "
if ($pos > 0)
	setvar $passive true
	setvar $safefighterlevel 0
else
	setvar $passive false
end

setvar $furbing $map~stardock

setvar $temp ("  " & $bot~user_command_line & "  ")
getwordpos $temp $pos " alpha "
if (($pos <> 0) and ($map~alpha_centauri <> 0))
	setvar $furbing $map~alpha_centauri
end
getwordpos $temp $pos " rylos "
if (($pos <> 0) and ($map~rylos <> 0))
	setvar $furbing $map~rylos
end
getwordpos $temp $pos " dock "
if (($pos <> 0) and ($map~stardock <> 0))
	setvar $furbing $map~stardock
end

getwordpos $temp $pos " terra "
if (($pos <> 0) and ($map~stardock <> 0))
	setvar $furbing 1
end

setvar $portaverage 1
send "jy*"
setvar $cashdeposited 0
gosub :player~quikstats
setvar $startcash $player~credits
setvar $psst_ship1 $player~ship_number
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q* "
	setvar $cashdropplanet $planet~planet
	setvar $cashdropsector $player~current_sector
else
	setvar $cashdropplanet 0
	setvar $cashdropsector 0

end
if ($dropcashlimit <= 10000000)
	setvar $dropcashlimit 10000000
end
if (($cashdropsector = 0) or ($cashdropplanet = 0))
	setvar $dropcashatbase false
else
	setvar $dropcashatbase true
end

if (($psst_ship2 <= 0) or ($game~steal_factor <= 0))
	send "'This module should be run from the MOM Bot.*"
	setvar $bot~mode "General"
	savevar $bot~mode
	halt
end

setvar $alarm_check (" " & $bot~user_command_line & " ")
lowercase $alarm_check
getwordpos $alarm_check $pos " alarm "
if ($pos = 0)
	setvar $alarm_active false
else
	setvar $alarm_active true
	if ($bot~safe_ship <= 0)
		send "'You can't run alarm without safe ship variable set.*"
		halt
	end
	if (($bot~safe_ship = $psst_ship1) or ($bot~safe_ship = $psst_ship2))
		send "'You can't run alarm and use your safe ship to WSST.*"
		halt
	end
end

setvar $startingsector $player~current_sector
setvar $ship1sector $startingsector
setvar $ship2sector $startingsector
setvar $inship1 true
setvar $p1chk 3
setvar $p2chk 3

if ($map~rylos > 10)
	setvar $refurbport $map~rylos
elseif ($map~alpha_centauri > 10)
	setvar $refurbport $map~alpha_centauri
else
	setvar $refurbport 1
end

gosub :checksstships

if ($foundship2 <> true)
	setvar $switchboard~message "Ship #2 entered for Planet SST was not valid for this sector.*"
	gosub :switchboard~switchboard
	halt
end

setvar $switchboard~message "World SST Powering Up!*"
gosub :switchboard~switchboard

send "c;qjy "
waiton "Transport Range:"
getword currentline $transportrange1 6
getword currentline $maxholds1 3
gosub :transport
send "c;qjy "
waiton "Transport Range:"
getword currentline $transportrange2 6
getword currentline $maxholds2 3
gosub :transport
if ($transportrange1 <= $transportrange2)
	setvar $transportrange $transportrange1
else
	setvar $transportrange $transportrange2
end

setvar $switchboard~message "Minimum transport range of these two ships is "&$transportrange&".*"
gosub :switchboard~switchboard

setvar $ship1needsport true
setvar $ship2needsport true
setvar $i 1
setvar $yes true
setvar $busted false
setarray $equipatport sectors
setarray $fuelatport sectors

logging off
window cash 300 170 ("World SST - " & gamename) ontop
gosub :displaycredits

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:wsst
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
	goto :endsst
end
gosub :findsstports

setvar $busted false
while ($busted = false)
	if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
		goto :endsst
	end
	gosub :steal
end

send "#"
gosub :player~quikstats
loadvar $bot~alarm_list
if (($alarm_active) and ($bot~alarm_list <> ""))
	loadvar $bot~who_is_online
	lowercase $bot~alarm_list
	lowercase $bot~who_is_online
	getwordpos $bot~alarm_list $pos ","
	if ($pos > 0)
		splittext $bot~alarm_list $alarm ","
	else
		setarray $alarm 1
		setvar $alarm[1] $bot~alarm_list
		setvar $alarm 1
	end
	setvar $i 1
	while ($i <= $alarm)
		getwordpos $bot~who_is_online $pos " "&$alarm[$i]&" "
		if ($pos > 0)
			send "'Alarm triggered by "&$alarm[$i]&", contingency plan engaged.*"
			send "'"&$bot~bot_name&" x x*"
			halt
		end
		add $i 1
	end
end

setvar $minrefurb ($player~experience / $game~steal_factor - 1)
if ($minrefurb > 255)
	setvar $minrefurb 255
end

setvar $minrefurb (($minrefurb * 7) / 8)
if (($ship1totalholds < $minrefurb) or ($ship2totalholds < $minrefurb))
	gosub :refurb
end

if (($dropcashatbase = true) and ($player~credits > $dropcashlimit))
	gosub :dropcashatbase
end

goto :wsst

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:transport
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($inship1)
	send ("x     "&$psst_ship2&"* q * ")
	setvar $player~ship_number $psst_ship2
else
	send ("x     "&$psst_ship1&"* q * ")
	setvar $player~ship_number $psst_ship1
end
savevar $player~ship_number
killtrigger 1
killtrigger 2
killtrigger 3
settextlinetrigger 1 :transported "Security code accepted"
settextlinetrigger 2 :noneavailable "That is not an available ship."
settextlinetrigger 3 :outofrange "only has a transport range of"
pause

:outofrange
:noneavailable
killtrigger 1
killtrigger 2
killtrigger 3
halt
goto :transport

:transported
killtrigger 1
killtrigger 2
killtrigger 3
if ($inship1)
	setvar $inship1 false
	setvar $player~current_sector $ship2sector
else
	setvar $inship1 true
	setvar $player~current_sector $ship1sector
end
savevar $player~current_sector
setvar $player~turns ($player~turns-1)
savevar $player~turns
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checksstships
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
:moveintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $result ""
setvar $dropfigs true
gosub :isadjacentsector
if ($isadjacent <> true)
	setvar $switchboard~message "Non-adjacent WSST move refused from "&$player~current_sector&" to "&$moveintosector&".*"
	gosub :switchboard~switchboard
	halt
end
send "m "&$moveintosector&"* "

:wsstdirectmovewait
settexttrigger wsstdirectdanger :wsstdirectdanger "Do you really want to warp there? (Y/N)"
settexttrigger wsstdirecttwarp :wsstdirecttwarp "Do you want to engage the TransWarp drive?"
settexttrigger wsstdirectblind :wsstdirectblind "Do you want to make this jump blind?"
settexttrigger wsstdirectautopilot :wsstdirectautopilot "Engage the Autopilot?"
settexttrigger wsstdirectmined :wsstdirectmined "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
settexttrigger wsstdirectcmd :wsstdirectcmd "Command [TL="
pause

:wsstdirectdanger
killalltriggers
send "y "
goto :wsstdirectmovewait

:wsstdirecttwarp
killalltriggers
send "n"
gosub :waitwsstrefusedmove
setvar $switchboard~message "TransWarp prompt refused during direct WSST move.*"
gosub :switchboard~switchboard
halt

:wsstdirectblind
killalltriggers
send "n"
setvar $switchboard~message "Blind TransWarp refused during direct WSST move.*"
gosub :switchboard~switchboard
halt

:wsstdirectautopilot
killalltriggers
send "n"
setvar $switchboard~message "AutoPilot refused during direct WSST move.*"
gosub :switchboard~switchboard
halt

:wsstdirectmined
killalltriggers
send "*"
goto :wsstdirectmovewait

:wsstdirectcmd
killalltriggers
setvar $player~current_sector $moveintosector
if (($moveintosector > 10) and ($moveintosector <> $map~stardock))
	if ($player~fighters > $ship~ship_max_attack)
		setvar $result $result&"za"&$ship~ship_max_attack&"* * "
	else
		setvar $result $result&"za"&$player~fighters&"* * "
	end
end
if (($dropfigs = true) and ($moveintosector > 10) and ($moveintosector <> $map~stardock))
	setvar $fig_drop 1
	if ($x100)
		if ($player~fighters > 1000)
			setvar $fig_drop 100
			setvar $player~fighters ($player~fighters - 100)
		end
	elseif ($x1000)
		if ($player~fighters > 10000)
			setvar $fig_drop 1000
			setvar $player~fighters ($player~fighters - 1000)
		end
	end
	setvar $result $result&"f  z  "&$fig_drop&"* z  c  d  *  "
	setsectorparameter $moveintosector "FIGSEC" true
end
getsectorparameter $moveintosector "LIMPSEC" $islimped
getsectorparameter $moveintosector "MINESEC" $isarmided
if ($droplimps and ($player~limpets > 0) and ($islimped <> true) and (sector.limpets.quantity[$moveintosector] <= 0))
	setvar $result $result&"  H  2  Z  3*  Z C  *  "
	setsectorparameter $moveintosector "LIMPSEC" true
end
if ($droparmids and ($player~armids > 0) and ($isarmided <> true) and (sector.mines.quantity[$moveintosector] <= 0))
	setvar $result $result&"  H  1  Z  3*  Z C  *  "
	setsectorparameter $moveintosector "MINESEC" true
end
if ($result <> "")
	send $result
	gosub :waitwsstcommand
end
#waitOn "["&$moveIntoSector&"]"
#if (($dropFigs) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock) AND ($j > 2))
#	waitOn "<Drop/Take Fighters>"
#end
send "  sdsh"
waiton "Long Range Scan"
waiton "Warps to Sector(s) :"
return

:isadjacentsector
setvar $isadjacent false
setvar $adjindex 1
while ((sector.warps[$player~current_sector][$adjindex] > 0) and ($isadjacent <> true))
	if (sector.warps[$player~current_sector][$adjindex] = $moveintosector)
		setvar $isadjacent true
	end
	add $adjindex 1
end
return

:waitwsstrefusedmove
settexttrigger wsstrefusedautopilot :wsstrefusedautopilot "Engage the Autopilot?"
settexttrigger wsstrefusedcmd :wsstrefusedcmd "Command [TL="
pause

:wsstrefusedautopilot
killalltriggers
send "n"
waitfor "Command [TL="
return

:wsstrefusedcmd
killalltriggers
return

:waitwsstcommand
settexttrigger wsstwaitcmd :wsstwaitcmd "Command [TL="
settexttrigger wsstwaitnav :wsstwaitnav "Choose NavPoint (?=Help)"
settexttrigger wsstwaittwarp :wsstwaittwarp "Do you want to engage the TransWarp drive?"
settexttrigger wsstwaitblind :wsstwaitblind "Do you want to make this jump blind?"
settexttrigger wsstwaitautopilot :wsstwaitautopilot "Engage the Autopilot?"
settexttrigger wsstwaitmined :wsstwaitmined "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause

:wsstwaitcmd
killalltriggers
return

:wsstwaitnav
killalltriggers
send "q"
waitfor "Command [TL="
setvar $switchboard~message "Unexpected NavPoint prompt refused during WSST movement.*"
gosub :switchboard~switchboard
halt

:wsstwaittwarp
killalltriggers
send "n"
gosub :waitwsstrefusedmove
setvar $switchboard~message "Unexpected TransWarp prompt refused during WSST movement.*"
gosub :switchboard~switchboard
halt

:wsstwaitblind
killalltriggers
send "n"
setvar $switchboard~message "Unexpected blind-warp prompt refused during WSST movement.*"
gosub :switchboard~switchboard
halt

:wsstwaitautopilot
killalltriggers
send "n"
waitfor "Command [TL="
setvar $switchboard~message "Unexpected AutoPilot prompt refused during WSST movement.*"
gosub :switchboard~switchboard
halt

:wsstwaitmined
killalltriggers
send "*"
goto :waitwsstcommand

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findsstports
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	while ($ship1needsport = true)
		if ($inship1 <> true)
			gosub :transport
		end
		setvar $candidate_sector $ship1sector
		setvar $candidate_other_sector $ship2sector
		gosub :trynewroute
	setvar $ship1needsport $candidate_needsport
	setvar $ship1sector $candidate_sector
	if ($candidate_found = true)
		setvar $ship1totalholds $candidate_totalholds
		setvar $ship1equipment $candidate_equipment
	end
end

	while ($ship2needsport = true)
		if ($inship1)
			gosub :transport
		end
		setvar $candidate_sector $ship2sector
		setvar $candidate_other_sector $ship1sector
		gosub :trynewroute
	setvar $ship2needsport $candidate_needsport
	setvar $ship2sector $candidate_sector
	if ($candidate_found = true)
		setvar $ship2totalholds $candidate_totalholds
		setvar $ship2equipment $candidate_equipment
	end
end

gosub :findship

if (($dist1 > $transportrange) or ($dist2 > $transportrange))
	if ($inship1)
		setvar $ship1needsport true
	else
		setvar $ship2needsport true
		end
		gosub :getcourse
			setvar $j 2
				while ($j <= ($courselength - 1))
					setvar $moveintosector $course[$j]
					gosub :moveintosector
					add $j 1
				end
		gosub :player~quikstats
		goto :findsstports
	end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:trynewroute
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $candidate_found false
setvar $candidate_needsport true

:trynewroute_retry
setvar $destination 0
while ($destination = 0)
	gosub :getrandomcourse
end
setvar $j 2
while (($j <= $courselength) and ($candidate_needsport = true))
	setvar $moveintosector $course[$j]
	setvar $containsshieldedplanet false
	setvar $p 1
	#echo "**["&$moveintosector&"]**["&$sectors&"]*"
	while ($p <= sector.planetcount[$moveintosector])
		getword sector.planets[$moveintosector][$p] $test 1
		if ($test = "<<<<")
			setvar $containsshieldedplanet true
		end
		add $p 1
	end
	if ($containsshieldedplanet)
		echo "*Avoiding shielded planet*"
		goto :trynewroute_retry
	end
	setvar $figowner  sector.figs.owner[$moveintosector]
	setvar $mineowner sector.mines.owner[$moveintosector]
	setvar $limpowner sector.limpets.owner[$moveintosector]
	setvar $figcount  sector.figs.quantity[$moveintosector]
	if (($figcount > $safefighterlevel) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
			echo "*Avoiding too many enemy fighters*"
			goto :trynewroute_retry
			end
		getsectorparameter $moveintosector "BUSTED" $isbusted
		setvar $testsector $moveintosector
		gosub :isusablesstportcandidate
		if (($candidateportvalid = true) and ($isbusted <> true) and ($moveintosector <> $candidate_other_sector))
			setvar $mowintosector $moveintosector
			if ($ultrasafe)
				gosub :safemowintosector
			else
				gosub :mowintosector
			end
			gosub :player~quikstats
			setvar $candidate_needsport false
		setvar $candidate_sector $moveintosector
		setvar $testsector $moveintosector
		gosub :getsstportinfo
		if ($portinfovalid)
			setvar $candidate_totalholds $player~total_holds
			setvar $candidate_equipment $player~equipment_holds
			setvar $candidate_found true
			gosub :displaycredits
		else
			setvar $candidate_needsport true
			goto :trynewroute_retry
		end
	else
		setvar $k 1
		setvar $isfound false
		while ((sector.warps[$course[$j]][$k] > 0) and ($isfound = false))
			setvar $checkingneighbor sector.warps[$course[$j]][$k]
			getsectorparameter $checkingneighbor "BUSTED" $isbusted
			setvar $containsshieldedplanet false
			setvar $p 1
			while ($p <= sector.planetcount[$checkingneighbor])
				getword sector.planets[$checkingneighbor][$p] $test 1
				if ($test = "<<<<")
					setvar $containsshieldedplanet true
				end
				add $p 1
			end
			setvar $figowner  sector.figs.owner[$checkingneighbor]
			setvar $mineowner sector.mines.owner[$checkingneighbor]
			setvar $limpowner sector.limpets.owner[$checkingneighbor]
			setvar $figcount  sector.figs.quantity[$checkingneighbor]
			setvar $testsector $checkingneighbor
			gosub :isusablesstportcandidate
						if (($candidateportvalid = true) and ($isbusted <> true) and ($checkingneighbor <> $candidate_other_sector) and ($containsshieldedplanet = false) and (($figcount <= $safefighterlevel) and (($figowner = "belong to your Corp") or ($figowner = "yours"))))
							setvar $mowintosector $checkingneighbor
							if ($ultrasafe)
								gosub :safemowintosector
							else
								gosub :mowintosector
							end
							setvar $candidate_needsport false
				setvar $candidate_sector $checkingneighbor
				gosub :player~quikstats
				setvar $testsector $checkingneighbor
				gosub :getsstportinfo
				if ($portinfovalid)
					setvar $candidate_totalholds $player~total_holds
					setvar $candidate_equipment $player~equipment_holds
					setvar $candidate_found true
					gosub :displaycredits
					setvar $isfound true
				else
					setvar $candidate_needsport true
					goto :trynewroute_retry
				end
			end
			add $k 1
		end
	end
	add $j 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getrandomcourse
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
#Does Random Course Calculation
killalltriggers
setarray $course 80
setvar $courselength 0
setvar $sectors ""
getrnd $destination 11 sectors
setvar $player~starting_point $player~current_sector
setvar $player~destination $destination
gosub :player~getcourse
if ($player~courselength > 0)
	setvar $courselength $player~courselength
	setvar $index 1
	while ($index <= $courselength)
		setvar $course[$index] $player~course[$index]
		add $index 1
	end
	return
end
setvar $destination 0
return

:getcourse
#Does Specific Course Calculation
killalltriggers
setvar $courselength 0
setarray $course 80
setvar $player~starting_point $player~current_sector
setvar $player~destination $destination
gosub :player~getcourse
if ($player~courselength > 0)
	setvar $courselength $player~courselength
	setvar $index 1
	while ($index <= $courselength)
		setvar $course[$index] $player~course[$index]
		add $index 1
	end
	return
end
setvar $sectors ""
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"**q"
pause

:sectorsline
killalltriggers
setvar $line currentline
replacetext $line ">" " "
striptext $line "("
striptext $line ")"
setvar $line $line&" "
getwordpos $line $pos "So what's the point?"
getwordpos $line $pos2 ": ENDINTERROG"
getwordpos $line $pos3 "*** Error - No route within"
if (($pos > 0) or ($pos2 > 0) or ($pos3 > 0))
	goto :nopath
end
getwordpos $line $pos " sector "
getwordpos $line $pos2 "TO"
getwordpos $line $pos3 "FM"
if (($pos <= 0) and ($pos2 <= 0) and ($pos3 <= 0))
	setvar $sectors $sectors & " " & $line
end
getwordpos $line&" " $pos " "&$destination&" "
getwordpos $line $pos2 "("&$destination&")"
getwordpos $line $pos3 "TO"
if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	goto :gotsectors
else
	settextlinetrigger sectorlinetrig :sectorsline " > "
	settextlinetrigger sectorlinetrig2 :sectorsline " "&$destination&" "
	settextlinetrigger sectorlinetrig3 :sectorsline " "&$destination
	settextlinetrigger sectorlinetrig4 :sectorsline "("&$destination&")"
	settextlinetrigger donepath :sectorsline "So what's the point?"
	settextlinetrigger donepath2 :sectorsline ": ENDINTERROG"
end
pause

:gotsectors
killalltriggers
setvar $sectors $sectors&" :::"
setvar $courselength 0
setvar $index 1

:keepgoing
getword $sectors $course[$index] $index
while ($course[$index] <> ":::")
	add $courselength 1
	add $index 1
	getword $sectors $course[$index] $index
end

:nopath
if ($courselength <= 0)
	setvar $destination 0
end
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:steal
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
getsectorparameter $ship1sector "BUSTED" $isbusted1
getsectorparameter $ship2sector "BUSTED" $isbusted2
if (($isbusted1 <> true) and ($isbusted2 <> true))
	setvar $maxsteal ($player~experience / $game~steal_factor - 1)
	setvar $send ""
	if ($inship1)
		setvar $steal_sector $ship1sector
		setvar $ship_equipment $ship1equipment
		setvar $ship_total_holds $ship1totalholds
		setvar $steal_macro_prefix "p r * s z 3 "
		setvar $steal_macro_suffix "* x    "
		else
			setvar $steal_sector $ship2sector
			setvar $ship_equipment $ship2equipment
			setvar $ship_total_holds $ship2totalholds
			setvar $steal_macro_prefix "p r* s   z3  "
			setvar $steal_macro_suffix "*  x    "
		end
			if (($map~stardock > 0) and ($steal_sector = $map~stardock))
				setvar $switchboard~message "Refusing to SST at Stardock sector "&$steal_sector&".*"
				gosub :switchboard~switchboard
				halt
			end
				setvar $testsector $steal_sector
				gosub :isusablesstportcandidate
				if ($candidateportvalid <> true)
					if ($inship1)
						setvar $ship1needsport true
					else
					setvar $ship2needsport true
				end
				setvar $busted true
				return
			end
			if ($ship_equipment > 0)
			if (haggle)
				setvar $wsstsellproduct "Equipment"
			gosub :sellcurrentcargo
			gosub :player~quikstats
			if ($player~equipment_holds > 0)
				setvar $switchboard~message "Unable to finish selling Equipment before next steal.*"
				gosub :switchboard~switchboard
				halt
			end
			setvar $ship_equipment 0
			else
				# sell off existing equipment
				setvar $send $send & "p t * * 0* 0* "
				add $equipatport[$steal_sector] $ship_equipment
				setvar $ship_equipment 0
			end
	end
	# steal as much as we are able to on this ship
	if ($ship_total_holds < $maxsteal)
		setvar $steal $ship_total_holds
	else
		setvar $steal $maxsteal
	end

	while ($equipatport[$steal_sector] < ($steal + 20))
		setvar $upgrade ($steal - $equipatport[$steal_sector])
		divide $upgrade 10
		add $upgrade 4
		setvar $availablecredits ($player~credits-$cash_to_hold_onto)
		setvar $upgradecost ($upgrade * 900)
		if (($availablecredits <= 0) or ($upgradecost > $availablecredits))
			setvar $switchboard~message "Refusing Equipment upgrade at sector "&$steal_sector&"; upgrade would spend below "&$cash_to_hold_onto&" credit reserve.*"
			gosub :switchboard~switchboard
			halt
		end
		setvar $send $send & "o 3" & $upgrade & "* * "
		setvar $player~credits ($player~credits-$upgradecost)
		add $equipatport[$steal_sector] ($upgrade * 10)
	end
	setvar $send $send & $steal_macro_prefix & $steal & $steal_macro_suffix
	setvar $ship_equipment $steal
	if ($inship1)
		setvar $ship1equipment $ship_equipment
	else
		setvar $ship2equipment $ship_equipment
	end

	if ($inship1)
		send $send & $psst_ship2 & "*  * "
		setvar $inship1 false
	else
		send $send & $psst_ship1 & "*  * "
		setvar $inship1 true
	end
	setvar $player~turns ($player~turns-2)
	savevar $player~turns

	if ($inship1)
		setvar $laststeal $ship1sector
	else
		setvar $laststeal $ship2sector
	end
end

# calculate experience gain or hold loss
setvar $stake ($steal - 1) / 11

waiton "(R)ob this port, (S)teal product"
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
settextlinetrigger 1 :success "Success!"
settextlinetrigger 2 :busted "Suddenly you're Busted!"
settextlinetrigger 3 :busted "There aren't that many holds of Equipment at this port!"
settextlinetrigger 4 :busted "Do you want instructions (Y/N) [N]?"
pause

:success
add $player~experience $stake
savevar $player~experience
if ($inship1)
	setvar $ship2equipment 1
	setvar $laststealrobsector $ship2sector
	savevar $laststealrobsector
else
	setvar $ship1equipment 1
	setvar $laststealrobsector $ship1sector
	savevar $laststealrobsector
end
goto :continue

:busted
# calculate holds lost and flag this sector as busted
if ($inship1)
	subtract $ship2totalholds $stake
	setsectorparameter $ship2sector "BUSTED" true
	setvar $lastbustsector $ship2sector
	savevar $lastbustsector
	setvar $ship2equipment 0
else
	subtract $ship1totalholds $stake
	setsectorparameter $ship1sector "BUSTED" true
	setvar $lastbustsector $ship1sector
	savevar $lastbustsector
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
if ($quiet = 0)
	send "'<"&$bot~subspace&">[Busted:"&$lastbustsector&"]<"&$bot~subspace&">* "
end

:continue
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:sellcurrentcargo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $wsstportactive 0
setvar $wsstsoldcargo false
send "pt"

:wsstsellwait
settextlinetrigger wsstsellstart1 :wsstsellprogress "<Port>"
settextlinetrigger wsstsellstart2 :wsstsellprogress "Docking..."
settexttrigger wsstsellstart3 :wsstsellprogress "Your offer ["
settexttrigger wsstsellstart4 :wsstsellprogress "Our final offer"
settexttrigger wsstsellstart5 :wsstsellprogress "Agreed,"
settexttrigger wsstsellqty :wsstsellqty "How many holds of "
if ($wsstportactive = 1)
	settexttrigger wsstselldone1 :wsstselldone "Command [TL="
	settexttrigger wsstselldone2 :wsstselldone "Citadel command"
end
pause

:wsstsellprogress
killalltriggers
setvar $wsstportactive 1
goto :wsstsellwait

:wsstsellqty
killalltriggers
setvar $wsstportactive 1
setvar $wsstline currentline
gosub :handlesellcargoqty
goto :wsstsellwait

:wsstselldone
killalltriggers
return

:handlesellcargoqty
setvar $wssttradeproduct "None"
setvar $wsstisbuy 0
setvar $wsstissell 0

getwordpos $wsstline $wsstx " do you want to buy "
if ($wsstx > 0)
	setvar $wsstisbuy 1
else
	setvar $wsstissell 1
end

getwordpos $wsstline $wsstx "Fuel"
if ($wsstx > 0)
	setvar $wssttradeproduct "Fuel"
else
	getwordpos $wsstline $wsstx "Organics"
	if ($wsstx > 0)
		setvar $wssttradeproduct "Organics"
	else
		getwordpos $wsstline $wsstx "Equipment"
		if ($wsstx > 0)
			setvar $wssttradeproduct "Equipment"
		end
	end
end

if ($wsstissell = 1)
	if (($wssttradeproduct = "None") and ($wsstsellproduct <> "None"))
		setvar $wssttradeproduct $wsstsellproduct
	end

	if ($wssttradeproduct = $wsstsellproduct)
		send "*"
		setvar $wsstsoldcargo true
		setvar $wsstsellproduct "None"
	else
		send "0*"
	end
	return
end

send "0*"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getsstportinfo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $portinfovalid false
if (($testsector <= 10) or (($map~stardock > 0) and ($testsector = $map~stardock)))
	setvar $equipatport[$testsector] ($player~total_holds + 50)
	return
end
setvar $port~target $testsector
gosub :port~getportdbinfo
if (($port~foundport <> true) or ($port~equbuying <> "Buying") or ($port~equtrading <= 0) or ($port~equpercent <= 0))
	setvar $equipatport[$testsector] ($player~total_holds + 50)
	return
end
setvar $x 10000
divide $x $port~equpercent
multiply $x $port~equtrading
divide $x 100
subtract $x 1
subtract $x $port~equtrading
if ($x < 0)
	setvar $equipatport[$testsector] 0
else
	setvar $equipatport[$testsector] $x
end
setvar $portname port.name[$testsector]
lowercase $portname
if (($portname = "build") or (port.buildtime[$testsector] > 0) or (port.class[$testsector] = 9))
	setvar $equipatport[$testsector] ($player~total_holds + 50)
	return
end
setvar $portinfovalid true
return

:isusablesstportcandidate
setvar $candidateportvalid true
if (($testsector <= 10) or (($map~stardock > 0) and ($testsector = $map~stardock)))
	setvar $candidateportvalid false
	return
end
setvar $port~target $testsector
gosub :port~getportdbinfo
if (($port~foundport <> true) or ($port~equbuying <> "Buying") or ($port~equtrading <= 0) or ($port~equpercent <= 0))
	setvar $candidateportvalid false
	return
end
setvar $x 10000
divide $x $port~equpercent
multiply $x $port~equtrading
divide $x 100
subtract $x 1
subtract $x $port~equtrading
if ($x < 0)
	setvar $equipatport[$testsector] 0
else
	setvar $equipatport[$testsector] $x
end
setvar $portname port.name[$testsector]
lowercase $portname
if (($portname = "build") or (port.buildtime[$testsector] > 0) or (port.class[$testsector] = 9))
	setvar $candidateportvalid false
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:refurb
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
goto :skiplsd

if ($droparmids = "true")
	setvar $m "M@"
else
	setvar $m "0@"
end
if ($droplimps = "true")
	setvar $l "M@"
else
	setvar $l "0@"
end
if ($refurbfighters = "true")
	setvar $f "M@"
else
	setvar $f "0@"
end
if ($refurbshields = "true")
	setvar $s "M@"
else
	setvar $s "0@"
end

setvar $lsd~command "M@M@M@M@M@Y@"&$l&$m&"0@Y@0@0@Y@0@M@M"&$f&$s
gosub :lsd~lsd
halt

:skiplsd
setvar $return $player~current_sector
setvar $twarp_refurb_success false
setvar $refurbport $furbing
gosub :choosenearbyclass0refurb
if ($nearclass0port > 0)
	setvar $refurbport $nearclass0port
end
if (($player~twarp_type <> "No") and ($refurbport = $map~stardock))

	gosub :twarprefurb
	gosub :player~quikstats

end
if ($twarp_refurb_success <> true)
	if ($refurbport <> 0)
		setvar $mowintosector $refurbport
	else
		setvar $mowintosector $refurbport
	end
	if ($ultrasafe)

		:trysafemowagainrefurb
		gosub :safemowintosector
		if ($issafe = false)
			goto :trysafemowagainrefurb
		end
	else
		gosub :mowintosector
	end
	gosub :player~quikstats
	if ($player~current_sector = $refurbport)
		if ($refurbport <> $map~stardock)
			send "p ty"
			waiton "A  Cargo holds     :"
			getword currentline $holdsprice 5
			getword currentline $holdstobuy 10
			setvar $beforefurbcredits $player~credits
			setvar $player~credits ($player~credits-($holdsprice * $holdstobuy))
			if ($player~credits > $cash_to_hold_onto)
				if ($refurbfighters)
					waiton "B  Fighters        :"
					getword currentline $figprice 4
					getword currentline $figstobuy 8
				else
					setvar $figstobuy 0
				end
				if ($refurbshields)
					waiton "C  Shield Points   :"
					getword currentline $shieldprice 5
					getword currentline $player~shieldstobuy 9
				else
					setvar $player~shieldstobuy 0
				end
				if ($figstobuy > 0)
					if (($figprice * $figstobuy) > ($player~credits-$cash_to_hold_onto))
						setvar $figstobuy (($player~credits-$cash_to_hold_onto)/$figprice)
					end
					setvar $player~credits ($player~credits-($figprice * $figstobuy))
				end
				if ($player~shieldstobuy > 0)
					if (($shieldprice * $player~shieldstobuy) > ($player~credits-$cash_to_hold_onto))
						setvar $player~shieldstobuy (($player~credits-$cash_to_hold_onto)/$shieldprice)
					end
					setvar $player~credits ($player~credits-($shieldprice * $player~shieldstobuy))
				end
				else
					setvar $figstobuy 0
					setvar $player~shieldstobuy 0
					setvar $holdstobuy 0
				end
				setvar $furbmacro "a "&$holdstobuy&"* "
				if ($holdstobuy > 0)
					setvar $furbmacro $furbmacro&"y "
				end
				setvar $furbmacro $furbmacro&"b "&$figstobuy&"* c "&$player~shieldstobuy&"* q q q * "
				send $furbmacro
				waitfor "Command [TL="
				return
		else
			send "p s g y g q "
		end
	end
end

if ($player~current_sector = $refurbport)
	killalltriggers
	send " s p"
	waiton "A  Cargo holds     :"
	getword currentline $holdsprice 5
	getword currentline $holdstobuy 10
	setvar $beforefurbcredits $player~credits
	if ($player~credits > $cash_to_hold_onto)
		if ($refurbfighters)
			waiton "B  Fighters        :"
			getword currentline $figprice 4
			getword currentline $figstobuy 8
		else
			setvar $figstobuy 0
		end
		if ($refurbshields)
			waiton "C  Shield Points   :"
			getword currentline $shieldprice 5
			getword currentline $player~shieldstobuy 9
		else
			setvar $player~shieldstobuy 0
		end
		if ($holdstobuy > 0)
			if (($holdsprice * $holdstobuy) > ($player~credits-$cash_to_hold_onto))
				setvar $holdstobuy (($player~credits-$cash_to_hold_onto)/$holdsprice)
			end
			setvar $player~credits ($player~credits-($holdsprice * $holdstobuy))
		end
		if ($figstobuy > 0)
			if (($figprice * $figstobuy) > ($player~credits-$cash_to_hold_onto))
				setvar $figstobuy (($player~credits-$cash_to_hold_onto)/$figprice)
			end
			setvar $player~credits ($player~credits-($figprice * $figstobuy))
		end
		if ($player~shieldstobuy > 0)
			if (($shieldprice * $player~shieldstobuy) > ($player~credits-$cash_to_hold_onto))
				setvar $player~shieldstobuy (($player~credits-$cash_to_hold_onto)/$shieldprice)
			end
			setvar $player~credits ($player~credits-($shieldprice * $player~shieldstobuy))
		end
	else
		setvar $figstobuy 0
		setvar $player~shieldstobuy 0
		setvar $holdstobuy 0
	end
		setvar $furbmacro "a "&$holdstobuy&"* "
		if ($holdstobuy > 0)
			setvar $furbmacro $furbmacro&"y "
		end
		setvar $furbmacro $furbmacro&"b "&$figstobuy&"* c "&$player~shieldstobuy&"* q q h "
		send $furbmacro
		waitfor "<Hardware Emporium>"
		if ($droplimps)
			send "L"
			waitfor "How many mines do you want"
			gettext currentline $buy "(Max" ") ["
			striptext $buy " "
			setvar $availablecredits ($player~credits-$cash_to_hold_onto)
			if ($availablecredits <= 0)
				setvar $buy 0
			elseif (($buy * 10000) > $availablecredits)
				setvar $buy ($availablecredits/10000)
			end
			send $buy & "*"
			setvar $player~credits ($player~credits-($buy * 10000))
			waitfor "<Hardware Emporium>"
		end
		if ($droparmids)
			send "M"
			waitfor "How many mines do you want"
			gettext currentline $buy "(Max" ") ["
			striptext $buy " "
			setvar $availablecredits ($player~credits-$cash_to_hold_onto)
			if ($availablecredits <= 0)
				setvar $buy 0
			elseif (($buy * 1000) > $availablecredits)
				setvar $buy ($availablecredits/1000)
			end
			send $buy & "*"
			setvar $player~credits ($player~credits-($buy * 1000))
			waitfor "<Hardware Emporium>"
		end

	send "/"
	waitfor #179 & "Figs"
	gettext currentline $player~credits (#179 & "Creds") (#179 & "Figs")
	striptext $player~credits " "
	striptext $player~credits ","

	setvar $spentcredits ($spentcredits+($beforefurbcredits-$player~credits))
	setvar $player~fighterspurchased ($player~fighterspurchased+$figstobuy)
	setvar $player~shieldspurchased ($player~shieldspurchased+$player~shieldstobuy)
else
	send "'Something bad happened on refurb, I am probably in big trouble. [Temp error message until saveme implemented]*"
	end
		if ($twarp_refurb_success = true)
			send "q q "
			waitfor "Command [TL="
			setvar $player~startinglocation "Command"
			setvar $player~ondock 0
			setvar $player~fasttwarp true
			setvar $player~warpto $return
			gosub :move~twarp
		if ($player~twarpsuccess = false)
			setvar $switchboard~message "Twarp Error: " &$player~msg&"*"
			gosub :switchboard~switchboard
			halt
		end
		gosub :player~quikstats
		if (player~current_sector = $map~stardock)
			setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
		gosub :switchboard~switchboard
		send "*"
		halt
	end
	send "jy*"

else

	:donenormalfurb
	setvar $twarp_refurb_success false
	send " Q Q "
	end
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:safemowintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $issafe true
setvar $destination $mowintosector
gosub :getcourse
	setvar $j 2
	while (($j <= $courselength) and ($issafe))
		setvar $nextsafesector $course[$j]
		setvar $moveintosector $nextsafesector
		gosub :isadjacentsector
		if ($isadjacent <> true)
			setvar $switchboard~message "Non-adjacent safe WSST mow refused from "&$player~current_sector&" to "&$nextsafesector&".*"
			gosub :switchboard~switchboard
			halt
		end
		send "sdsh"
	waiton "Long Range Scan"
	waiton "Warps to Sector(s) :"
	#gosub :player~quikstats
	setvar $minesafe true
	setvar $figssafe  ((sector.figs.quantity[$nextsafesector] <= 0) or (((sector.figs.owner[$nextsafesector] = "yours") or (sector.figs.owner[$nextsafesector] = "belong to your Corp"))))
	setvar $planet~planetsafe ((sector.planetcount[$nextsafesector] <= 0) or (($nextsafesector = $map~stardock) or ($nextsafesector <= 10)))
	setvar $navhazsafe true
	setvar $densitysafe true
	setvar $player~limpetsafe true
	if ($densitysafe or ($player~limpetssafe and $figssafe and $minessafe and $navhazsafe and $planet~planetsafe))
		setvar $result "m "&$nextsafesector&"* "
		if (($course[$j] > 10) and ($course[$j] <> $map~stardock))
			setvar $result ($result & "za"&$ship~ship_max_attack&"* * ")
		end
		send $result

		:safemowwait
		settexttrigger safemowdanger :safemowdanger "Do you really want to warp there? (Y/N)"
		settexttrigger safemowtwarp :safemowtwarp "Do you want to engage the TransWarp drive?"
		settexttrigger safemowblind :safemowblind "Do you want to make this jump blind?"
		settexttrigger safemowautopilot :safemowautopilot "Engage the Autopilot?"
		settexttrigger safemowmined :safemowmined "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
		settexttrigger safemowcmd :safemowcmd "Command [TL="
		pause

		:safemowdanger
		killalltriggers
		send "n"
		setvar $switchboard~message "Unsafe warp confirmation refused during safe mow.*"
		gosub :switchboard~switchboard
		halt

:safemowtwarp
killalltriggers
send "n"
gosub :waitwsstrefusedmove
setvar $switchboard~message "TransWarp prompt refused during safe mow.*"
gosub :switchboard~switchboard
halt

		:safemowblind
		killalltriggers
		send "n"
		setvar $switchboard~message "Blind TransWarp refused during safe mow.*"
		gosub :switchboard~switchboard
		halt

		:safemowautopilot
		killalltriggers
		send "n"
		setvar $switchboard~message "AutoPilot refused during safe mow.*"
		gosub :switchboard~switchboard
		halt

		:safemowmined
		killalltriggers
		send "*"
		goto :safemowwait

		:safemowcmd
		killalltriggers
		setvar $player~current_sector $nextsafesector
	else
		setvar $result "c v"&$nextsafesector&"*q "
		setvar $issafe false
		send $result
		return
	end
	setvar $result ""
			if (($course[$j] > 10) and ($course[$j] <> $map~stardock))
			setvar $result ($result & "f z 1* z c d * ")
			setsectorparameter $course[$j] "FIGSEC" true
			getsectorparameter $course[$j] "LIMPSEC" $islimped
			getsectorparameter $course[$j] "MINESEC" $isarmided
			if ($droplimps and ($player~limpets > 0) and ($islimped <> true) and (sector.limpets.quantity[$course[$j]] <= 0))
				setvar $result $result&"  H  2  Z  3*  Z C  *  "
				setsectorparameter $course[$j] "LIMPSEC" true
			end
			if ($droparmids and ($player~armids > 0) and ($isarmided <> true) and (sector.mines.quantity[$course[$j]] <= 0))
				setvar $result $result&"  H  1  Z  3*  Z C  *  "
				setsectorparameter $course[$j] "MINESEC" true
			end
		end
	if ($result <> "")
		send $result
		gosub :waitwsstcommand
	end
	add $j 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:mowintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $destination $mowintosector
gosub :getcourse
	setvar $j 2
		while ($j <= $courselength)
			if ($course[$j] <> $player~current_sector)
				setvar $moveintosector $course[$j]
				gosub :isadjacentsector
				if ($isadjacent <> true)
					setvar $switchboard~message "Non-adjacent WSST mow refused from "&$player~current_sector&" to "&$course[$j]&".*"
					gosub :switchboard~switchboard
					halt
				end
				send "m"&$course[$j]&"* "

			:wsstmowwait
			settexttrigger wsstmowdanger :wsstmowdanger "Do you really want to warp there? (Y/N)"
			settexttrigger wsstmowtwarp :wsstmowtwarp "Do you want to engage the TransWarp drive?"
			settexttrigger wsstmowblind :wsstmowblind "Do you want to make this jump blind?"
			settexttrigger wsstmowautopilot :wsstmowautopilot "Engage the Autopilot?"
			settexttrigger wsstmowmined :wsstmowmined "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
			settexttrigger wsstmowcmd :wsstmowcmd "Command [TL="
			pause

		:wsstmowdanger
		killalltriggers
			send "y "
			goto :wsstmowwait

:wsstmowtwarp
killalltriggers
send "n"
gosub :waitwsstrefusedmove
setvar $switchboard~message "TransWarp prompt refused during WSST mow.*"
gosub :switchboard~switchboard
halt

			:wsstmowblind
			killalltriggers
			send "n"
			setvar $switchboard~message "Blind TransWarp refused during WSST mow.*"
			gosub :switchboard~switchboard
			halt

			:wsstmowautopilot
			killalltriggers
			send "n"
			setvar $switchboard~message "AutoPilot refused during WSST mow.*"
			gosub :switchboard~switchboard
			halt

			:wsstmowmined
			killalltriggers
			send "*"
			goto :wsstmowwait

			:wsstmowcmd
			killalltriggers
			setvar $player~current_sector $course[$j]
			setvar $result ""
		if (($course[$j] > 10) and ($course[$j] <> $map~stardock))
			setvar $result $result&"za"&$ship~ship_max_attack&"* * "
		end
			if (($dropfigs = true) and ($course[$j] > 10) and ($course[$j] <> $map~stardock))
				setvar $fig_drop 1
				if ($x100)
					if ($player~fighters > 1000)
					setvar $fig_drop 100
					setvar $player~fighters ($player~fighters - 100)
				end
			elseif ($x1000)
				if ($player~fighters > 10000)
					setvar $fig_drop 1000
					setvar $player~fighters ($player~fighters - 1000)
				end
			end
			setvar $result $result&"f  z  "&$fig_drop&"* z  c  d  *  "
			setsectorparameter $course[$j] "FIGSEC" true
		end

		getsectorparameter $course[$j] "LIMPSEC" $islimped
		getsectorparameter $course[$j] "MINESEC" $isarmided
		if ($droplimps and ($player~limpets > 0) and ($islimped <> true) and (sector.limpets.quantity[$course[$j]] <= 0))
			setvar $result $result&"  H  2  Z  3*  Z C  *  "
			setsectorparameter $course[$j] "LIMPSEC" true
		end
		if ($droparmids and ($player~armids > 0) and ($isarmided <> true) and (sector.mines.quantity[$course[$j]] <= 0))
			setvar $result $result&"  H  1  Z  3*  Z C  *  "
			setsectorparameter $course[$j] "MINESEC" true
		end
			if ($result <> "")
				send $result
				gosub :waitwsstcommand
			end
	end

	add $j 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:dropcashatbase
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($player~credits > $dropcashlimit)
	setvar $mowintosector $cashdropsector
	if ($ultrasafe)

		:trysafemowagain
		gosub :safemowintosector
		if ($issafe = false)
			goto :trysafemowagain
		end
	else
		gosub :mowintosector
	end
	gosub :player~quikstats
	if ($player~current_sector = $cashdropsector)
		send "l "&$cashdropplanet &"* c t t "&($player~credits-1000000)&"* qq* "
		#send "l "&$cashDropPlanet &"* m n l "&($player~fighters/2)&"*  c t t "&($player~credits-1000000)&"* qq* "
		add $cashdeposited ($player~credits-1000000)
		setvar $player~credits 1000000
		gosub :displaycredits
	else
		send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
	end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:displaycredits
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $formatteddepositedcredits ""
setvar $spentcredits2 $cashdeposited
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formatteddepositedcredits ","&$snippet&$formatteddepositedcredits
end
setvar $formatteddepositedcredits $spentcredits2&$formatteddepositedcredits

setvar $formattedonhandcredits ""
setvar $spentcredits2 $player~credits
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formattedonhandcredits ","&$snippet&$formattedonhandcredits
end
setvar $formattedonhandcredits $spentcredits2&$formattedonhandcredits

setvar $formattedspentcredits ""
setvar $spentcredits2 $spentcredits
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formattedspentcredits ","&$snippet&$formattedspentcredits
end
setvar $formattedspentcredits $spentcredits2&$formattedspentcredits

setvar $formattedfighters ""
setvar $spentcredits2 $player~fighterspurchased
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formattedfighters ","&$snippet&$formattedfighters
end
setvar $formattedfighters $spentcredits2&$formattedfighters

setvar $formattedshields ""
setvar $spentcredits2 $player~shieldspurchased
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formattedshields ","&$snippet&$formattedshields
end
setvar $formattedshields $spentcredits2&$formattedshields

add $portaverage $cashdeposited
add $portaverage $player~credits
add $portaverage $spentcredits
subtract $portaverage $startcash
if ($numberbusted = 0)
	setvar $numberbusted 1
end
divide $portaverage $numberbusted

setvar $formattedportaverage ""
setvar $spentcredits2 $portaverage
getlength $spentcredits2 $length
while ($length > 3)
	cuttext $spentcredits2 $snippet $length-2 9999
	cuttext $spentcredits2 $spentcredits2 1 $length-3
	getlength $spentcredits2 $length
	setvar $formattedportaverage ","&$snippet&$formattedportaverage
end
setvar $formattedportaverage $spentcredits2&$formattedportaverage

setvar $window_content "*    Cash Deposited: "&$formatteddepositedcredits&"*  Busted xxB Ports: "&$numberbusted&"*  Credits per Port: "&$formattedportaverage&"*   Fighters bought: "&$formattedfighters&"*    Shields bought: "&$formattedshields&"*"

setwindowcontents cash $window_content
replacetext $window_content "*" "[][]"
savevar $window_content

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:endsst
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
send "q q q q  * * * "
setvar $switchboard~message "World SST has completed, make sure you pick up the bot and its ships.*"
gosub :switchboard~switchboard
halt

:findship
setvar $found1 0
setvar $found2 0
send "czq"
waiton "---------------------------------"

:nextship
settextlinetrigger		ships	:ships
pause

:ships
getword currentline $shipnum 1
isnumber $tst $shipnum
if ($tst <> 0)
	if ($shipnum = $psst_ship2)
		setvar $found2 currentline
		replacetext $found2 "+" " "
		getword $found2 $found2 2
	elseif ($shipnum = $psst_ship1)
		setvar $found1 currentline
		replacetext $found1 "+" " "
		getword $found1 $found1 2
	end
	goto :nextship
end
if ($inship1)
	setvar $destination $found2
else
	setvar $destination $found1
end
gosub :player~quikstats

getdistance $dist1 $player~current_sector $destination
#if (($dist1 = "-1") or ($dist1 > $transportRange))
if ($dist1 = "-1")
	send "cf" & $player~current_sector & "*" & $destination & "*q"
	waiton "What is the starting sector"
	waiton "Command [TL="
	getdistance $dist1 $player~current_sector $destination
end
getdistance $dist2 $destination $player~current_sector
#if (($dist2 = "-1") or ($dist2 > $transportRange))
if ($dist2 = "-1")
	send "cf" & $destination & "*" & $player~current_sector & "*q"
	waiton "What is the starting sector"
	waiton "Command [TL="
	getdistance $dist2 $destination $player~current_sector
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:twarprefurb
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
# check adj's for Dock.. if present, then we don't need a jump sector.
setvar $i 1
setvar $start_sector $player~current_sector
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $map~stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

#	echo "**" & ansi_14 & "Please Stand By" & ansi_15 & " - Calculating Distances...**"
	getdistance $dist1 $start_sector $map~stardock

	if ($dist1 <= 0)
		setvar $plot_start $start_sector
		setvar $plot_dest $map~stardock
		gosub :plotrefurbcourse
		getdistance $dist1 $start_sector $map~stardock
	end
	if ($dist1 <= 0)
		setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
		gosub :switchboard~switchboard
		send "*"
		halt
	end

	getdistance $dist2 $map~stardock $start_sector
	if ($dist2 <= 0)
		setvar $plot_start $map~stardock
		setvar $plot_dest $start_sector
		gosub :plotrefurbcourse
		getdistance $dist2 $map~stardock $start_sector
	end
	if ($dist2 <= 0)
		setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
		gosub :switchboard~switchboard
		send "*"
	halt
end

setvar $ore_req (($dist1 + $dist2) * 3)

if ($player~ore_holds < $ore_req)
	#setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
	#gosub :switchboard~switchboard
	send "*"
	gosub :getsomefuel
	gosub :player~quikstats
	goto :twarprefurb
end

if (($player~alignment < 1000) and ($weareadjdock = false))
	setvar $red_adj 0
	gosub :findjumpsector
	if ($red_adj = 0)
		gosub :chooseclass0figfallback
		if ($class0fallbackport > 0)
			setvar $refurbport $class0fallbackport
			return
		end
		waitfor "Command [TL="
		#			setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock*"
		#			gosub :switchboard~switchboard
		send "*"
		return
	end
end

if ($player~alignment >= 1000)
	if ($weareadjdock)
		send "^F" & $map~stardock & "*" & $start_sector & "*Q/ "
	else
		send "^F" & $start_sector & "*" & $map~stardock & "*F" & $map~stardock & "*" & $start_sector & "*Q/ "
	end
else
	if ($weareadjdock)
		send "^F" & $map~stardock & "*" & $start_sector & "*Q/ "
	else
		send "^F" & $start_sector & "*" & $red_adj & "*F" & $map~stardock & "*" & $start_sector & "*Q/ "
	end
end
settextlinetrigger nojoy :nojoy "*** Error - No route within"
settextlinetrigger cont :cont ": ENDINTERROG"
pause

:nojoy
killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!*"
gosub :switchboard~switchboard
send "*"
halt

:cont
killalltriggers
settexttrigger routenavprompt       :routenavprompt "Choose NavPoint (?=Help)"
settexttrigger routecmdprompt       :routecmdprompt "Command [TL="
setdelaytrigger routepromptdelay    :routepromptdelay 1000
pause

:routenavprompt
killalltriggers
send "q"
waitfor "Command [TL="
goto :latency_delay

:routecmdprompt
killalltriggers
goto :latency_delay

:routepromptdelay
killalltriggers
waitfor "Command [TL="

:latency_delay
if ($player~twarp_type = "No")
	setvar $switchboard~message "Must Have Twarp 1 or 2*"
	gosub :switchboard~switchboard
	send "*"
	halt
end

if ($player~unlimitedgame = 0)
	gosub :turnsrequired
	if ($turnsrequired > currentturns)
		setvar $switchboard~message "Not Enough Turns. "&$turnsrequired&", Required*"
		gosub :switchboard~switchboard
		send "*"
		halt
	elseif ($turnsrequired <= currentturns)
		setvar $tmp (currentturns - $turnsrequired)
		if ($tmp <= $bot~bot_turn_limit)
			setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
	end
end

send " C R " & $map~stardock & "*Q "
settextlinetrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
setvar $switchboard~message "StarDock appears to have been Blown Up!*"
gosub :switchboard~switchboard
send "*"
halt

:itsalive
killalltriggers
waitfor "(?="
setvar $furb_twarp true
if ((currentalignment >= 1000) and ($weareadjdock = false))
	setvar $player~startinglocation "Command"
	setvar $player~ondock 0
	setvar $player~fasttwarp true
	setvar $player~warpto $map~stardock
	gosub :move~twarp
	if ($player~twarpsuccess = false)
		setvar $switchboard~message "Twarp Error: " &$player~msg&"*"
		gosub :switchboard~switchboard
		halt
	end
	send "p s g y g q "
elseif (($weareadjdock = false) and ($red_adj <> 0))
	setvar $player~startinglocation "Command"
	setvar $player~ondock 0
	setvar $player~fasttwarp true
	setvar $player~warpto $red_adj
	gosub :move~twarp
	if ($player~twarpsuccess = false)
		setvar $switchboard~message "Twarp Error: " &$player~msg&"*"
		gosub :switchboard~switchboard
		halt
	end
	send $map~stardock & "* p s g y g q "
else
	setvar $furb_twarp false
	send "q q * m " & $map~stardock & "* * p s g y g q "
end
waitfor "You leave the Galactic Bank."
gosub :player~quikstats
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:plotrefurbcourse
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "cf" & $plot_start & "*" & $plot_dest & "*q"
waiton "What is the starting sector"
waiton "Command [TL="
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getsomefuel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
setvar $bottom 1
setvar $top 1
setarray $checked sectors
setvar $que[1] $player~current_sector
setvar $checked[$player~current_sector] 1
setvar $a 1

:try_again
while ($bottom <= $top)
	# Now, pull out the next sector in the queue, and make it our focus
	setvar $focus $que[$bottom]
	getsectorparameter $focus "FIGSEC" $isfigged
	getsectorparameter $focus "BUSTED" $isbusted

	send " C R " & $focus & "*Q "
	gosub :player~quikstats
	if ((port.buyfuel[$focus] <> true) and (port.fuel[$focus] > $player~total_holds) and ($isbusted <> true))
		setvar $mowintosector $focus
		gosub :mowintosector
		if (((port.buyorg[$focus]) and ($player~organic_holds > 0)) or ((port.buyequip[$focus]) and ($player~equipment_holds > 0)))
			send "p t * * * * * * "
		else
			send "j y p t * * 0 * 0 * "
		end
		return
	end
	# That wasn't it, so let's add all the adjacents to the queue for future testing.
	setvar $a 1
	while (sector.warps[$focus][$a] > 0)
		setvar $adjacent sector.warps[$focus][$a]
		# But only add them if they haven't been added previously
		if ($checked[$adjacent] = 0)
			# Okay, this one hasn't been checked, so tag it and que it.
			setvar $checked[$adjacent] 1
			add $top 1
			setvar $que[$top] $adjacent
		end
		add $a 1
	end
	# The adjacents of $focus were all queued, now on to the next one.
	add $bottom 1
end
setvar $switchboard~message "Can't find a route to fuel.  Halting*"
gosub :switchboard~switchboard
halt

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findjumpsector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $i 1
setvar $red_adj 0
send "qq*"
while (sector.warpsin[$map~stardock][$i] > 0)
	setvar $red_adj sector.warpsin[$map~stardock][$i]
	setvar $checksector $red_adj
	gosub :verifysectoradjdock
	if ($sectoradjdock = false)
		goto :tryingnextadj
	end
	send "m " & $red_adj & "*"
	settexttrigger twarpengage 			:twarpengage "Do you want to engage the TransWarp drive?"
	settexttrigger twarpblind 			:twarpblind "Do you want to make this jump blind? "
	settexttrigger twarplocked			:twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided			:twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpadj			:twarpadj "<Set NavPoint>"
	settextlinetrigger twarpempty	:twarpempty "You do not have enough Fuel Ore to make the jump"
	settexttrigger twarpautopilot :twarpautopilot "Engage the Autopilot?"
	pause

	:twarpengage
	killalltriggers
	send "y"
	settexttrigger twarpblind 			:twarpblind "Do you want to make this jump blind? "
	settexttrigger twarplocked			:twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided			:twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpadj			:twarpadj "<Set NavPoint>"
	settextlinetrigger twarpempty	:twarpempty "You do not have enough Fuel Ore to make the jump"
	settexttrigger twarpautopilot :twarpautopilot "Engage the Autopilot?"
	pause

	:twarpadj
	killalltriggers
	send " * "
	return

	:twarpvoided
	killalltriggers
	send "N"
	goto :tryingnextadj

	:twarplocked
	killalltriggers
	send "N"

	goto :sectorlocked

	:twarpblind
	killalltriggers
	send "N"
	goto :tryingnextadj

	:twarpempty
	killalltriggers
	goto :tryingnextadj

	:twarpautopilot
	killalltriggers
	send "N"
	setvar $switchboard~message "AutoPilot refused while finding red jump sector.*"
	gosub :switchboard~switchboard
	halt

	:tryingnextadj
	add $i 1
end

:noadjsfound
setvar $red_adj 0
return

:sectorlocked
return

:choosenearbyclass0refurb
setvar $nearclass0port 0
setvar $nearclass0dist 100000
setvar $class0candidate 0
setvar $class0candidate $map~rylos
gosub :considernearbyclass0
setvar $class0candidate $map~alpha_centauri
gosub :considernearbyclass0
setvar $class0candidate 1
gosub :considernearbyclass0
return

:considernearbyclass0
if ($class0candidate <= 0)
	return
end
getdistance $class0dist $player~current_sector $class0candidate
if (($class0dist > 0) and ($class0dist <= 3) and ($class0dist < $nearclass0dist))
	setvar $nearclass0port $class0candidate
	setvar $nearclass0dist $class0dist
end
return

:chooseclass0figfallback
setvar $class0fallbackport 0
setvar $class0fallbackdist 100000
setvar $class0candidate 0
setvar $class0candidate $map~rylos
gosub :considerclass0figfallback
setvar $class0candidate $map~alpha_centauri
gosub :considerclass0figfallback
setvar $class0candidate 1
gosub :considerclass0figfallback
return

:considerclass0figfallback
if ($class0candidate <= 0)
	return
end
setvar $class0hasfigadj false
setvar $class0adjidx 1
while (sector.warpsin[$class0candidate][$class0adjidx] > 0)
	setvar $class0adj sector.warpsin[$class0candidate][$class0adjidx]
	getsectorparameter $class0adj "FIGSEC" $class0isfigged
	if ($class0isfigged)
		setvar $class0hasfigadj true
	end
	add $class0adjidx 1
end
if ($class0hasfigadj)
	getdistance $class0dist $player~current_sector $class0candidate
	if (($class0dist > 0) and ($class0dist < $class0fallbackdist))
		setvar $class0fallbackport $class0candidate
		setvar $class0fallbackdist $class0dist
	end
end
return

:verifysectoradjdock
setvar $sectoradjdock false
if (($checksector <= 0) or ($map~stardock <= 0))
	return
end
setvar $checkwarpidx 1
while (sector.warps[$checksector][$checkwarpidx] > 0)
	if (sector.warps[$checksector][$checkwarpidx] = $map~stardock)
		setvar $sectoradjdock true
	end
	add $checkwarpidx 1
end
return

:turnsrequired
send "i"
settextlinetrigger turnsrequired_tpw	:turnsrequired_tpw "Turns to Warp  : "
pause

:turnsrequired_tpw
killalltriggers
getword currentline $turnsrequired_tpw 5

if ($red_adj > 0)
	# twarp to jmp sector, then into SD sect, then twarp home
	setvar $turnsrequired_temp ($turnsrequired_tpw * 3)
	if ($_tow > 0)
		# 2 Turns for exporting into other ship and back again
		add $turnsrequired_temp_temp 2
		# 3 Turns for initial Port then x into other ship, port & shop, then x and report
		#   b4 heading home
		add $turnsrequired_temp 3
	else
		add $turnsrequired_temp 1
	end
else
	setvar $turnsrequired_temp ($turnsrequired_tpw * 2)
	# 1 Turn to port at dock
	add $turnsrequired_temp 1
end

setvar $turnsrequired $turnsrequired_temp
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:callsaveme
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "q q q q * '"&$switchboard~bot_name&" call*"
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:dotwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $msg ""
if ($warpto > 0)
	send "q q * * mz" & $warpto "*"
	settexttrigger there        :adj_warp "You are already in that sector!"
	settextlinetrigger adj_warp :adj_warp "Sector  : " & $warpto & " "
		settexttrigger locking      :locking "Do you want to engage the TransWarp drive?"
		settexttrigger igd          :twarpigd "An Interdictor Generator in this sector holds you fast!"
		settexttrigger noturns      :twarpphotoned "Your ship was hit by a Photon and has been disabled"
		settexttrigger noroute      :twarpnoroute "Do you really want to warp there? (Y/N)"
		settexttrigger dotwarpautopilot :dotwarpautopilot "Engage the Autopilot?"
		pause

	:adj_warp
	killalltriggers
	send "z*"
	goto :twarp_adj

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock 		:twarp_lock "TransWarp Locked"
	settexttrigger twarp_blind 		:dotwarpblind "Do you want to make this jump blind?"
	settextlinetrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
	settextlinetrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
	settextlinetrigger no_fuel 		:twarpnofuel "You do not have enough Fuel Ore"
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

		:dotwarpblind
		killalltriggers
		send "n"
		setvar $msg "Blind TransWarp refused."
		goto :twarpdone

		:dotwarpautopilot
		killalltriggers
		send "n"
		setvar $msg "AutoPilot refused."
		goto :twarpdone

		:no_twarp_lock
	killalltriggers
	send "n*zn"
	send "l " & #8 & $planet~planet "*c"
	setsectorparameter $warpto "FIGSEC" false
	setvar $msg "no twarp lock"
	return

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
	if (currentalignment >= 1000)
		setvar $str "y * * p s g y g q "
		send $str
	else
		setvar $str "y  *  *  m " & $map~stardock & " *  *  p s g y g q "
		send $str
	end
	setvar $twarp_refurb_success true

	:twarpdone
	if ($msg <> "")
		setvar $switchboard~message "Twarp Error - " & $msg & "*"
		gosub :switchboard~switchboard
		send "*"
	end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:bwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
send "b" $warpto "*"
settexttrigger go :go5 "TransWarp Locked"
settexttrigger no :no5 "No locating beam found"
#goSub :delayTrigger
pause

:no5
killalltriggers
send "n"
waitfor "Transporter shutting down."
return

:go5
killalltriggers
send "y z * "
return

#INCLUDES:
include "source\include\planet"
include "source\include\ship"
include "source\include\move"
include "source\include\port.ts"
include "source\include\lsd"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
