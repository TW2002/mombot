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
setvar $help~help[4]   $help~tab&"     {cash dropoff} - chunk to deposit if started from planet citadel  "
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

setvar $player~save true
setvar $cash_to_hold_onto 1000000
setvar $minimumsteal 50

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
	setvar $wsst_ship2 $bot~parm1
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
setvar $cashdeposited 0
gosub :player~quikstats
setvar $startcash $player~credits
setvar $wsst_ship1 $player~ship_number
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q* "
	waitfor "Command [TL="
	send "j y * "
	waitfor "Command [TL="
	setvar $cashdropplanet $planet~planet
	setvar $cashdropsector $player~current_sector
else
	send "j y * "
	waitfor "Command [TL="
	setvar $cashdropplanet 0
	setvar $cashdropsector 0
end
if ($dropcashlimit <= 0)
	setvar $dropcashlimit 10000000
end
if (($cashdropsector = 0) or ($cashdropplanet = 0))
	setvar $dropcashatbase false
else
	setvar $dropcashatbase true
end

if ($wsst_ship2 <= 0)
	setvar $switchboard~message "Invalid ship number entered for second ship.*"
	gosub :switchboard~switchboard
	setvar $bot~mode "General"
	savevar $bot~mode
	halt
end

if ($game~steal_factor <= 0)
	setvar $switchboard~message "Missing steal factor setting, refresh mombot!*"
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
	if (($bot~safe_ship = $wsst_ship1) or ($bot~safe_ship = $wsst_ship2))
		send "'You can't run alarm and use your safe ship to WSST.*"
		halt
	end
end

setvar $startingsector $player~current_sector
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

setvar $haggle~nativehagglemode false
gosub :haggle~configurenativehaggle

gosub :setupship
setvar $transportrange1 $startuptransportrange
setvar $maxholds1 $startupmaxholds
gosub :transport
gosub :setupship
setvar $transportrange2 $startuptransportrange
setvar $maxholds2 $startupmaxholds
gosub :transport
if ($transportrange1 <= $transportrange2)
	setvar $transportrange $transportrange1
else
	setvar $transportrange $transportrange2
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
setvar $refurbreturnsector 0
setvar $preservefuelcashdrop false
setvar $ship1searchstarted false
setvar $ship2searchstarted false
setvar $sstsearchroutelimit 75

gosub :setarrays

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
	getsectorparameter $ship1sector "BUSTED" $isbusted1
	getsectorparameter $ship2sector "BUSTED" $isbusted2
	if ($isbusted1 = true)
		setvar $ship1needsport true
	end
	if ($isbusted2 = true)
		setvar $ship2needsport true
	end
	if (($isbusted1 = true) or ($isbusted2 = true))
		goto :wsst
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
	setvar $preservefuelcashdrop false
	if (($dropcashatbase = true) and ($player~credits >= $dropcashlimit))
		setvar $preservefuelcashdrop true
	end
	gosub :preparebustrefurbreturn
	gosub :refurb
	setvar $refurbreturnsector 0
	gosub :player~quikstats
	if ((($player~ore_holds > 0) or ($player~organic_holds > 0)) and ($player~current_sector = $map~stardock))
		gosub :recoverdockrefurb
		gosub :player~quikstats
	end
	if (($player~organic_holds > 0) or (($player~equipment_holds > 0) or (($player~ore_holds > 0) and ($preservefuelcashdrop <> true))))
		setvar $switchboard~message "Unable to clear cargo holds after refurb; stopping before steal.*"
		gosub :switchboard~switchboard
		goto :endsst
	end
end

if (($dropcashatbase = true) and ($player~credits >= $dropcashlimit))
	gosub :dropcashatbase
else
	setvar $preservefuelcashdrop false
end

goto :wsst

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:transport
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($inship1)
	send ("x        "&$wsst_ship2&"* q * ")
	setvar $player~ship_number $wsst_ship2
else
	send ("x        "&$wsst_ship1&"* q * ")
	setvar $player~ship_number $wsst_ship1
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
else
	setvar $inship1 true
end
setvar $player~turns ($player~turns-1)
savevar $player~turns
waitfor "Command [TL="
gosub :player~quikstats
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:setupship
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
send "j y * "
waitfor "Command [TL="
send "c;"
waiton "Transport Range:"
getword currentline $startuptransportrange 6
getword currentline $startupmaxholds 3
send "q"
waitfor "Command [TL="
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checksstships
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $foundship2 false
killalltriggers
send "wn*"
settextlinetrigger other :shipline " "&$player~current_sector&" "
settextlinetrigger noships :shipdone_no_prompt "You do not own any other ships in this sector!"
pause

:shipline
killalltriggers
add $shipcount 1
getword currentline $tempid 1
if ($tempid = $wsst_ship2)
	setvar $foundship2 true
end
settextlinetrigger other :shipline " "&$player~current_sector&" "
settextlinetrigger nomore :shipdone "Choose which ship to tow "
pause

:shipdone
killalltriggers
waitfor "Command [TL="
return

:shipdone_no_prompt
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:iswsstmovementhopallowed
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $wssthopallowed false
isnumber $wssthopvalid $wssthop
if ($wssthopvalid <> true)
	return
end
if (($wssthop <= 0) or ($wssthop > sectors))
	return
end
if ($blocked[$wssthop] = true)
	return
end
if (($wsstallowrestrictedhop = true) or ($sstsearchallowrestricted = true))
	setvar $wssthopallowed true
	return
end
if ($wssthop <= 10)
	return
end
getsectorparameter $wssthop "MSLSEC" $wssthopmslsec
if ($wssthopmslsec = true)
	return
end
setvar $wssthopallowed true
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:validatewsstcourse
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $wsstcoursevalid true
setvar $wsstcoursesavedrestrictedhop $wsstallowrestrictedhop
setvar $wsstallowrestrictedhop false
setvar $routebuildsector $player~current_sector
setvar $coursechecki 1
while (($coursechecki <= $player~courselength) and ($wsstcoursevalid = true))
	setvar $routehop $player~course[$coursechecki]
	isnumber $routehopvalid $routehop
	if ($routehopvalid <> true)
		setvar $wsstcoursevalid false
	elseif (($routehop > 0) and ($routehop <> $routebuildsector))
		setvar $wssthop $routehop
		gosub :iswsstmovementhopallowed
		if ($wssthopallowed <> true)
			setvar $wsstcoursevalid false
		else
			setvar $routeisadjacent false
			setvar $routeadjindex 1
			while (sector.warps[$routebuildsector][$routeadjindex] > 0)
				if (sector.warps[$routebuildsector][$routeadjindex] = $routehop)
					setvar $routeisadjacent true
				end
				add $routeadjindex 1
			end
			if ($routeisadjacent = true)
				setvar $routebuildsector $routehop
			else
				setvar $wsstcoursevalid false
			end
		end
	end
	add $coursechecki 1
end
setvar $wsstallowrestrictedhop $wsstcoursesavedrestrictedhop
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:moveintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $moveintosectorsuccess false
setvar $wssthop $moveintosector
gosub :iswsstmovementhopallowed
if ($wssthopallowed <> true)
	return
end
if ($moveintosector = $player~current_sector)
	setvar $moveintosectorsuccess true
	return
end
setvar $moveisadjacent false
setvar $moveadjindex 1
while (sector.warps[$player~current_sector][$moveadjindex] > 0)
	if (sector.warps[$player~current_sector][$moveadjindex] = $moveintosector)
		setvar $moveisadjacent true
	end
	add $moveadjindex 1
end
if ($moveisadjacent <> true)
	return
end
if ($j < 3)
	setvar $move~dropfigs false
else
	setvar $move~dropfigs true
end
setvar $tmpsurroundfigs "-1"
if ($x100) and ($player~fighters > 1000)
	setvar $tmpsurroundfigs $player~surroundfigs
	setvar $player~surroundfigs 100
elseif ($x1000) and ($player~fighters > 10000)
	setvar $tmpsurroundfigs $player~surroundfigs
	setvar $player~surroundfigs 1000
end
setvar $move~moveintosector $moveintosector
setvar $savedmoveskipstats $move~skipstats
setvar $move~skipstats true
gosub :move~moveintosector
setvar $move~skipstats $savedmoveskipstats
if ($tmpsurroundfigs > 0)
	setvar $player~surroundfigs $tmpsurroundfigs
end
setvar $moveintosectorsuccess true
return

### old local function (no longer reachable)
setvar $result ""
setvar $dropfigs true
setvar $result $result&"m "&$moveintosector&"*"
if (($moveintosector > 10) and ($moveintosector <> $map~stardock))
	if ($player~fighters > $ship~ship_max_attack)
		setvar $result $result&"za"&$ship~ship_max_attack&"* * "
	else
		setvar $result $result&"za"&$player~fighters&"* * "
	end
end
if (($dropfigs = true) and ($moveintosector > 10) and ($moveintosector <> $map~stardock) and ($j > 2))
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
end
if ($droplimps)
	setvar $result $result&"  H  2  Z  3*  Z C  *  "
end
if ($droparmids)
	setvar $result $result&"  H  1  Z  3*  Z C  *  "
end
send $result
#waitOn "["&$moveIntoSector&"]"
#if (($dropFigs) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock) AND ($j > 2))
#	waitOn "<Drop/Take Fighters>"
#end
send "  sh"
waiton "Long Range Scan"
waiton "Warps to Sector(s) :"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findsstports
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $wsstallowrestrictedhop false
while ($ship1needsport = true)
	if ($inship1 <> true)
		gosub :transport
	end
	if ($ship1searchstarted <> true)
		setvar $sstsearchship 1
		gosub :resetsstsearchguard
		setvar $ship1searchstarted true
	end

		:trynewrouteship1
		:tryknownrouteship1
		setvar $knownsstothersector $ship2sector
		gosub :findknownsstcandidate
		if ($knownsstsector > 0)
			setvar $moveintosector $knownsstsector
			gosub :movetoknownsstcandidate
				if ($knownsstmoved = true)
					gosub :player~quikstats
					gosub :clearpostrefurbcargo
					setvar $ship1needsport false
					setvar $ship1searchstarted false
					setvar $ship1sector $knownsstsector
				setvar $testsector $knownsstsector
				gosub :getsstportinfo
				if ($portinfovalid)
					setvar $ship1totalholds $player~total_holds
					setvar $ship1equipment $player~equipment_holds
					gosub :displaycredits
				else
					setvar $blocked[$knownsstsector] true
					setvar $ship1needsport true
					goto :tryknownrouteship1
				end
			else
				setvar $blocked[$knownsstsector] true
				goto :tryknownrouteship1
			end
		end
		if ($ship1needsport = false)
			goto :ship1sstportdone
		end
		setvar $destination 0
		while ($destination = 0)
			gosub :getrandomcourse
			gosub :checksstsearchroute
			if ($sstsearchfailed = true)
				goto :endsst
			end
		if ($sstsearchroutechecked = true)
			setvar $destination 0
		end
	end
		setvar $j 2
	while (($j <= $courselength) and ($ship1needsport = true))
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
			goto :trynewrouteship1
		end
		setvar $figowner  sector.figs.owner[$moveintosector]
		setvar $mineowner sector.mines.owner[$moveintosector]
		setvar $limpowner sector.limpets.owner[$moveintosector]
		setvar $figcount  sector.figs.quantity[$moveintosector]
		if (($figcount > $safefighterlevel) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
			echo "*Avoiding too many enemy fighters*"
			goto :trynewrouteship1
			end
			gosub :moveintosector
			if ($moveintosectorsuccess <> true)
				setvar $blocked[$moveintosector] true
				setvar $ship1needsport true
				goto :trynewrouteship1
			end
			setvar $testsector $moveintosector
			gosub :iswsstbustrisky
		gosub :isusablesstportcandidate
			if (($candidateportvalid = true) and ($wsstbustrisky <> true) and ($moveintosector <> $ship2sector))
				gosub :player~quikstats
				setvar $ship1needsport false
				setvar $ship1searchstarted false
				setvar $ship1sector $course[$j]
				setvar $testsector $course[$j]
			gosub :getsstportinfo
				if ($portinfovalid)
					setvar $ship1totalholds $player~total_holds
					setvar $ship1equipment $player~equipment_holds
					gosub :displaycredits
				else
					setvar $blocked[$moveintosector] true
					setvar $ship1needsport true
					goto :trynewrouteship1
				end
		else
			setvar $k 1
			setvar $isfound false
			while ((sector.warps[$course[$j]][$k] > 0) and ($isfound = false))
				setvar $checkingneighbor sector.warps[$course[$j]][$k]
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
					gosub :iswsstbustrisky
					gosub :isusablesstportcandidate
					if (($candidateportvalid = true) and ($wsstbustrisky <> true) and ($checkingneighbor <> $ship2sector) and ($containsshieldedplanet = false) and (($figcount <= $safefighterlevel) and (($figowner = "belong to your Corp") or ($figowner = "yours"))))
					setvar $moveintosector $checkingneighbor
					gosub :moveintosector
					if ($moveintosectorsuccess <> true)
						setvar $blocked[$checkingneighbor] true
						setvar $ship1needsport true
						goto :trynewrouteship1
						end
						setvar $ship1needsport false
						setvar $ship1searchstarted false
						setvar $ship1sector $checkingneighbor
						gosub :player~quikstats
					setvar $testsector $checkingneighbor
					gosub :getsstportinfo
						if ($portinfovalid)
							setvar $ship1totalholds $player~total_holds
							setvar $ship1equipment $player~equipment_holds
							gosub :displaycredits
							setvar $isfound true
						else
							setvar $blocked[$checkingneighbor] true
							setvar $ship1needsport true
							goto :trynewrouteship1
						end
				end
				add $k 1
			end
			end
			add $j 1
		end
		:ship1sstportdone
	end

	while ($ship2needsport = true)
	if ($inship1)
		gosub :transport
	end
	if ($ship2searchstarted <> true)
		setvar $sstsearchship 2
		gosub :resetsstsearchguard
		setvar $ship2searchstarted true
	end

		:trynewrouteship2
		:tryknownrouteship2
		setvar $knownsstothersector $ship1sector
		gosub :findknownsstcandidate
		if ($knownsstsector > 0)
			setvar $moveintosector $knownsstsector
			gosub :movetoknownsstcandidate
				if ($knownsstmoved = true)
					setvar $ship2needsport false
					setvar $ship2searchstarted false
					setvar $ship2sector $knownsstsector
					gosub :player~quikstats
					gosub :clearpostrefurbcargo
					setvar $testsector $knownsstsector
					gosub :getsstportinfo
				if ($portinfovalid)
					setvar $ship2totalholds $player~total_holds
					setvar $ship2equipment $player~equipment_holds
					gosub :displaycredits
				else
					setvar $blocked[$knownsstsector] true
					setvar $ship2needsport true
					goto :tryknownrouteship2
				end
			else
				setvar $blocked[$knownsstsector] true
				goto :tryknownrouteship2
			end
		end
		if ($ship2needsport = false)
			goto :ship2sstportdone
		end
		setvar $destination 0
		while ($destination = 0)
			gosub :getrandomcourse
			gosub :checksstsearchroute
			if ($sstsearchfailed = true)
				goto :endsst
			end
		if ($sstsearchroutechecked = true)
			setvar $destination 0
		end
	end
		setvar $j 2
	while (($j <= $courselength) and ($ship2needsport = true))
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
			goto :trynewrouteship2
		end
		setvar $figowner  sector.figs.owner[$moveintosector]
		setvar $mineowner sector.mines.owner[$moveintosector]
		setvar $limpowner sector.limpets.owner[$moveintosector]
		setvar $figcount  sector.figs.quantity[$moveintosector]
		if (($figcount > $safefighterlevel) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
			echo "*Avoiding too many enemy fighters*"
			goto :trynewrouteship2
			end
			gosub :moveintosector
			if ($moveintosectorsuccess <> true)
				setvar $blocked[$moveintosector] true
				setvar $ship2needsport true
				goto :trynewrouteship2
			end
			setvar $testsector $course[$j]
			gosub :iswsstbustrisky
		gosub :isusablesstportcandidate
			if (($candidateportvalid = true) and ($wsstbustrisky <> true) and ($course[$j] <> $ship1sector))
				setvar $ship2needsport false
				setvar $ship2searchstarted false
				setvar $ship2sector $course[$j]
				gosub :player~quikstats
			setvar $testsector $course[$j]
			gosub :getsstportinfo
				if ($portinfovalid)
					setvar $ship2totalholds $player~total_holds
					setvar $ship2equipment $player~equipment_holds
					gosub :displaycredits
				else
					setvar $blocked[$course[$j]] true
					setvar $ship2needsport true
					goto :trynewrouteship2
				end
		else
			setvar $k 1
			setvar $isfound false
			while ((sector.warps[$course[$j]][$k] > 0) and ($isfound = false))
				setvar $checkingneighbor sector.warps[$course[$j]][$k]
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
				gosub :iswsstbustrisky
				gosub :isusablesstportcandidate
				if (($candidateportvalid = true) and ($wsstbustrisky <> true) and ($checkingneighbor <> $ship1sector) and ($containsshieldedplanet = false) and (($figcount <= $safefighterlevel) and (($figowner = "belong to your Corp") or ($figowner = "yours"))))
					setvar $moveintosector $checkingneighbor
					gosub :moveintosector
					if ($moveintosectorsuccess <> true)
						setvar $blocked[$checkingneighbor] true
						setvar $ship2needsport true
						goto :trynewrouteship2
						end
						setvar $ship2needsport false
						setvar $ship2searchstarted false
						setvar $ship2sector $checkingneighbor
						gosub :player~quikstats
					setvar $testsector $checkingneighbor
					gosub :getsstportinfo
						if ($portinfovalid)
							setvar $ship2totalholds $player~total_holds
							setvar $ship2equipment $player~equipment_holds
							gosub :displaycredits
							setvar $isfound true
						else
							setvar $blocked[$checkingneighbor] true
							setvar $ship2needsport true
							goto :trynewrouteship2
						end
				end
				add $k 1
			end
			end
			add $j 1
		end
		:ship2sstportdone
	end

setvar $sstsearchallowrestricted false

gosub :checkcachedshipdistance
if ($cachedshipdistancevalid <> true)
	gosub :findship
end

if (($dist1 > $transportrange) or ($dist2 > $transportrange))
	if ($inship1)
		setvar $ship1needsport true
	else
		setvar $ship2needsport true
		end
		gosub :getcourse
		setvar $j 1
		setvar $result ""
		setvar $routebuildsector $player~current_sector
		setvar $routesafe true
		while (($j <= ($courselength - 1)) and ($routesafe = true))
			setvar $routehop $course[$j]
			isnumber $routehopvalid $routehop
			if ($routehopvalid <> true)
				setvar $routesafe false
			elseif (($routehop > 0) and ($routehop <> $routebuildsector))
				setvar $wssthop $routehop
				gosub :iswsstmovementhopallowed
				if ($wssthopallowed <> true)
					setvar $routesafe false
				end
				setvar $routeisadjacent false
				setvar $routeadjindex 1
				if ($routesafe = true)
					while (sector.warps[$routebuildsector][$routeadjindex] > 0)
						if (sector.warps[$routebuildsector][$routeadjindex] = $routehop)
							setvar $routeisadjacent true
						end
						add $routeadjindex 1
					end
				end
				if (($routesafe = true) and ($routeisadjacent = true))
					setvar $result $result&" m "&$routehop&"* "
					if (($routehop > 10) and ($routehop <> $map~stardock))
						setvar $result $result & " z a " & $ship~ship_max_attack & "* * "
					end
					if (($routehop > 10) and ($routehop <> $map~stardock) and ($j > 2))
						setvar $result $result&" f 1 * c d "
						setsectorparameter $routehop "FIGSEC" true
					end
					setvar $routebuildsector $routehop
				elseif ($routesafe = true)
					setvar $routesafe false
				end
			end
			add $j 1
		end
		if (($routesafe = true) and ($result <> ""))
			send $result & " ** "
			gosub :player~quikstats
		end
		goto :findsstports
	end
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:resetsstsearchguard
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sstsearchroutes ""
setvar $sstsearchroutecount 0
setvar $sstsearchmanualfallback false
setvar $sstsearchallowrestricted false
setvar $sstsearchfailed false
setvar $sstsearchlegacyfallback false
setvar $sstsearchhardlimit ($sstsearchroutelimit * 2)
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checksstsearchroute
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sstsearchroutechecked false
if ($sstsearchfailed = true)
	return
end
add $sstsearchroutecount 1
if ($sstsearchroutecount > $sstsearchhardlimit)
	setvar $switchboard~message "Unable to find reachable replacement SST port for ship "&$sstsearchship&" after "&$sstsearchhardlimit&" route attempts; falling back to legacy random mow/search.*"
	gosub :switchboard~switchboard
	setvar $sstsearchmanualfallback true
	setvar $sstsearchallowrestricted true
	setvar $sstsearchlegacyfallback true
	setvar $sstsearchroutes ""
	setvar $sstsearchroutecount 0
	return
end
if (($sstsearchroutecount > $sstsearchroutelimit) and ($sstsearchallowrestricted <> true))
	setvar $switchboard~message "Unable to find normal replacement SST route for ship "&$sstsearchship&" after "&$sstsearchroutelimit&" attempts; allowing restricted escape hops.*"
	gosub :switchboard~switchboard
	setvar $sstsearchmanualfallback true
	setvar $sstsearchallowrestricted true
	setvar $sstsearchroutes ""
	return
end
if ($sstsearchlegacyfallback <> true)
	if ($sectors = "")
		setvar $sstsearchsig "{"&$player~current_sector&":"&$destination&"}"
	else
		setvar $sstsearchsig "{"&$sectors&"}"
	end
	getwordpos $sstsearchroutes $pos $sstsearchsig
	if ($pos > 0)
		setvar $sstsearchroutechecked true
	else
		setvar $sstsearchroutes $sstsearchroutes&$sstsearchsig
	end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findknownsstcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $knownsstsector 0
setvar $testsector $player~current_sector
gosub :isvalidknownsstcandidate
if ($knownsstvalid = true)
	setvar $knownsstsector $testsector
	return
end
getnearestwarps $knownsstnearest $player~current_sector
setvar $knownssti 1
while (($knownssti <= $knownsstnearest) and ($knownsstsector = 0))
	setvar $testsector $knownsstnearest[$knownssti]
	gosub :isvalidknownsstcandidate
	if ($knownsstvalid = true)
		setvar $knownsstsector $testsector
	end
	add $knownssti 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:isvalidknownsstcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $knownsstvalid false
if (($testsector <= 10) or ($testsector > sectors))
	return
end
setvar $wsstsavedrestrictedhop $wsstallowrestrictedhop
setvar $wsstallowrestrictedhop false
setvar $wssthop $testsector
gosub :iswsstmovementhopallowed
setvar $wsstallowrestrictedhop $wsstsavedrestrictedhop
if ($wssthopallowed <> true)
	return
end
if ($testsector = $knownsstothersector) or ($blocked[$testsector] = true)
	return
end
gosub :isusablesstportcandidate
if ($candidateportvalid <> true)
	return
end
	gosub :iswsstbustrisky
	if ($wsstbustrisky = true)
		return
	end
	if (($knownsstothersector > 10) and ($knownsstothersector <= sectors))
		getdistance $knownsstdist1 $testsector $knownsstothersector
		getdistance $knownsstdist2 $knownsstothersector $testsector
		if (($knownsstdist1 <= 0) or (($knownsstdist2 <= 0) or (($knownsstdist1 > $transportrange) or ($knownsstdist2 > $transportrange))))
			return
		end
	end
setvar $containsshieldedplanet false
setvar $p 1
while ($p <= sector.planetcount[$testsector])
	getword sector.planets[$testsector][$p] $test 1
	if ($test = "<<<<")
		setvar $containsshieldedplanet true
	end
	add $p 1
end
if ($containsshieldedplanet = true)
	return
end
setvar $figowner sector.figs.owner[$testsector]
setvar $figcount sector.figs.quantity[$testsector]
if (($figcount > $safefighterlevel) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
	return
end
	setvar $knownsstvalid true
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:iswsstbustrisky
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $wsstbustrisky false
getsectorparameter $testsector "BUSTED" $isbusted
if (($isbusted = true) or ($testsector = $laststealrobsector))
	setvar $wsstbustrisky true
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:validatesstportsbeforesteal
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $sstportsready true
if (($ship1sector <= 10) or ($ship1sector > sectors))
	setvar $ship1needsport true
	setvar $ship1searchstarted false
	setvar $sstportsready false
else
	setvar $testsector $ship1sector
	gosub :isusablesstportcandidate
	getsectorparameter $ship1sector "BUSTED" $ship1prebusted
	if (($candidateportvalid <> true) or ($ship1prebusted = true))
		setvar $ship1needsport true
		setvar $ship1searchstarted false
		setvar $sstportsready false
	end
end
if (($ship2sector <= 10) or ($ship2sector > sectors))
	setvar $ship2needsport true
	setvar $ship2searchstarted false
	setvar $sstportsready false
else
	setvar $testsector $ship2sector
	gosub :isusablesstportcandidate
	getsectorparameter $ship2sector "BUSTED" $ship2prebusted
	if (($candidateportvalid <> true) or ($ship2prebusted = true))
		setvar $ship2needsport true
		setvar $ship2searchstarted false
		setvar $sstportsready false
	end
end
if ($ship1sector = $ship2sector)
	setvar $ship1needsport true
	setvar $ship2needsport true
	setvar $ship1searchstarted false
	setvar $ship2searchstarted false
	setvar $sstportsready false
end
if (($inship1 = true) and ($ship1sector = $laststealrobsector))
	setvar $ship1needsport true
	setvar $ship1searchstarted false
	setvar $sstportsready false
end
if (($inship1 <> true) and ($ship2sector = $laststealrobsector))
	setvar $ship2needsport true
	setvar $ship2searchstarted false
	setvar $sstportsready false
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:movetoknownsstcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $knownsstmoved false
if ($player~current_sector = $knownsstsector)
	setvar $knownsstmoved true
	return
end
setvar $adjacencysector $knownsstsector
gosub :iscurrentsectoradjacentto
if ($iscurrentsectoradjacent = true)
	setvar $moveintosector $knownsstsector
	gosub :moveintosector
	if ($moveintosectorsuccess = true)
		setvar $knownsstmoved true
	end
	return
end
if ($player~twarp_type <> "No")
	setvar $knownsstfigowner sector.figs.owner[$knownsstsector]
	setvar $knownsstfigcount sector.figs.quantity[$knownsstsector]
	if (($knownsstfigcount > 0) and (($knownsstfigowner = "belong to your Corp") or ($knownsstfigowner = "yours")))
		setvar $knownssttwarptarget $knownsstsector
		gosub :tryknownssttwarp
		if ($knownssttwarpsuccess = true)
			setvar $knownsstmoved true
			return
		end
	end
	setvar $knownsstadjindex 1
	while ((sector.warpsin[$knownsstsector][$knownsstadjindex] > 0) and ($knownsstmoved <> true))
		setvar $knownsstadjsector sector.warpsin[$knownsstsector][$knownsstadjindex]
		setvar $knownsstfigowner sector.figs.owner[$knownsstadjsector]
		setvar $knownsstfigcount sector.figs.quantity[$knownsstadjsector]
		if (($knownsstadjsector > 10) and (($knownsstfigcount > 0) and (($knownsstfigowner = "belong to your Corp") or ($knownsstfigowner = "yours"))))
			setvar $knownssttwarptarget $knownsstadjsector
			gosub :tryknownssttwarp
			if ($knownssttwarpsuccess = true)
				setvar $moveintosector $knownsstsector
				gosub :moveintosector
				if ($moveintosectorsuccess = true)
					setvar $knownsstmoved true
					return
				end
			end
		end
		add $knownsstadjindex 1
	end
end
setvar $player~starting_point $player~current_sector
setvar $player~destination $knownsstsector
gosub :player~getcourse
if ($player~courselength <= 1)
	return
end
gosub :validatewsstcourse
if ($wsstcoursevalid <> true)
	return
end
setvar $j 1
while ($j <= $player~courselength)
	setvar $playercoursehop $player~course[$j]
	isnumber $playercoursehopvalid $playercoursehop
	if (($playercoursehopvalid = true) and (($playercoursehop > 0) and ($playercoursehop <> $player~current_sector)))
		setvar $moveintosector $playercoursehop
		gosub :moveintosector
		if ($moveintosectorsuccess <> true)
			return
		end
	end
	add $j 1
end
setvar $knownsstmoved true
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:warptoknownsstcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $knownsstmoved false
if ($player~current_sector = $knownsstsector)
	setvar $knownsstmoved true
	return
end
setvar $adjacencysector $knownsstsector
gosub :iscurrentsectoradjacentto
if ($iscurrentsectoradjacent = true)
	setvar $moveintosector $knownsstsector
	gosub :moveintosector
	if ($moveintosectorsuccess = true)
		setvar $knownsstmoved true
	end
	return
end
if ($player~twarp_type = "No")
	return
end
setvar $knownsstfigowner sector.figs.owner[$knownsstsector]
setvar $knownsstfigcount sector.figs.quantity[$knownsstsector]
if (($knownsstfigcount > 0) and (($knownsstfigowner = "belong to your Corp") or ($knownsstfigowner = "yours")))
	setvar $knownssttwarptarget $knownsstsector
	gosub :tryknownssttwarp
	if ($knownssttwarpsuccess = true)
		setvar $knownsstmoved true
		return
	end
end
setvar $knownsstadjindex 1
while ((sector.warpsin[$knownsstsector][$knownsstadjindex] > 0) and ($knownsstmoved <> true))
	setvar $knownsstadjsector sector.warpsin[$knownsstsector][$knownsstadjindex]
	setvar $knownsstfigowner sector.figs.owner[$knownsstadjsector]
	setvar $knownsstfigcount sector.figs.quantity[$knownsstadjsector]
	if (($knownsstadjsector > 10) and (($knownsstfigcount > 0) and (($knownsstfigowner = "belong to your Corp") or ($knownsstfigowner = "yours"))))
		setvar $knownssttwarptarget $knownsstadjsector
		gosub :tryknownssttwarp
		if ($knownssttwarpsuccess = true)
			setvar $moveintosector $knownsstsector
			gosub :moveintosector
			if ($moveintosectorsuccess = true)
				setvar $knownsstmoved true
				return
			end
		end
	end
	add $knownsstadjindex 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:tryknownssttwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $knownssttwarpsuccess false
if (($knownssttwarptarget <= 10) or ($knownssttwarptarget > sectors))
	return
end
if ($player~current_sector = $knownssttwarptarget)
	setvar $knownssttwarpsuccess true
	return
end
setvar $adjacencysector $knownssttwarptarget
gosub :iscurrentsectoradjacentto
if ($iscurrentsectoradjacent = true)
	setvar $moveintosector $knownssttwarptarget
	gosub :moveintosector
	if ($moveintosectorsuccess = true)
		setvar $knownssttwarpsuccess true
	end
	return
end
getdistance $knownssttwarpdist $player~current_sector $knownssttwarptarget
if (($knownssttwarpdist <= 1) or ($knownssttwarpdist = "-1"))
	return
end
setvar $knownsstfuelneeded ($knownssttwarpdist * 3)
if ($player~ore_holds < $knownsstfuelneeded)
	gosub :getlocalknownsstfuel
	if ($localfuelsuccess <> true)
		return
	end
	setvar $adjacencysector $knownssttwarptarget
	gosub :iscurrentsectoradjacentto
	if ($iscurrentsectoradjacent = true)
		setvar $moveintosector $knownssttwarptarget
		gosub :moveintosector
		if ($moveintosectorsuccess = true)
			setvar $knownssttwarpsuccess true
		end
		return
	end
	getdistance $knownssttwarpdist $player~current_sector $knownssttwarptarget
	if (($knownssttwarpdist <= 1) or ($knownssttwarpdist = "-1"))
		return
	end
	setvar $knownsstfuelneeded ($knownssttwarpdist * 3)
	if ($player~ore_holds < $knownsstfuelneeded)
		return
	end
end
setvar $player~warpto $knownssttwarptarget
gosub :move~twarp
if ($player~twarpsuccess = true)
	setvar $knownssttwarpsuccess true
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:movetargetpreferingtwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $twarpmovemoved false
if (($mowintosector <= 0) or ($mowintosector > sectors))
	return
end
if ($player~current_sector = $mowintosector)
	setvar $twarpmovemoved true
	return
end
setvar $adjacencysector $mowintosector
gosub :iscurrentsectoradjacentto
if ($iscurrentsectoradjacent = true)
	setvar $moveintosector $mowintosector
	gosub :moveintosector
	if ($moveintosectorsuccess = true)
		gosub :player~quikstats
		setvar $twarpmovemoved true
	end
	return
end
if ($player~twarp_type <> "No")
	getdistance $twarpmovedist $player~current_sector $mowintosector
	if (($twarpmovedist > 1) and ($twarpmovedist <> "-1"))
		setvar $twarpmovefuelneeded ($twarpmovedist * 3)
		getsectorparameter $mowintosector "FIGSEC" $twarpmovefigged
		setvar $twarpmovefigowner sector.figs.owner[$mowintosector]
		setvar $twarpmovefigcount sector.figs.quantity[$mowintosector]
		if (($player~ore_holds >= $twarpmovefuelneeded) and (($twarpmovefigged = true) or (($twarpmovefigcount > 0) and (($twarpmovefigowner = "belong to your Corp") or ($twarpmovefigowner = "yours")))))
			setvar $player~warpto $mowintosector
			gosub :move~twarp
			if ($player~twarpsuccess = true)
				gosub :player~quikstats
				setvar $twarpmovemoved true
				return
			end
			gosub :player~quikstats
		end
	end
end
if ($ultrasafe)
	gosub :safemowintosector
else
	gosub :mowintosector
end
gosub :player~quikstats
if ($player~current_sector = $mowintosector)
	setvar $twarpmovemoved true
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getlocalknownsstfuel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $localfuelsuccess false
setarray $localfuelchecked sectors
setarray $localfuelqueue sectors
setarray $localfuelhop sectors
setvar $localfuelbottom 1
setvar $localfueltop 1
setvar $localfuelqueue[1] $player~current_sector
setvar $localfuelchecked[$player~current_sector] 1
setvar $localfuelhop[$player~current_sector] 0
while (($localfuelbottom <= $localfueltop) and ($localfuelsuccess <> true))
	setvar $focus $localfuelqueue[$localfuelbottom]
	getsectorparameter $focus "BUSTED" $isbusted
	getdistance $localfueldist $focus $knownssttwarptarget
	if (($localfueldist > 1) and ($localfueldist <> "-1"))
		setvar $localfueloretarget ($localfueldist * 3)
		setvar $candidatefuelneeded $localfueloretarget
		subtract $candidatefuelneeded $player~ore_holds
		if ($candidatefuelneeded < 1)
			setvar $candidatefuelneeded 1
		end
		if (($focus > 1) and (($focus <> $map~stardock) and ((port.exists[$focus] = true) and (port.buyfuel[$focus] <> true))))
			gosub :checkfuelcandidate
				if (($fuelportvalid = true) or ($fuelportupgradeable = true))
					if ($player~current_sector <> $focus)
						setvar $savedwsstallowrestrictedhop $wsstallowrestrictedhop
						setvar $wsstallowrestrictedhop true
						setvar $mowintosector $focus
						gosub :movetargetpreferingtwarp
						setvar $wsstallowrestrictedhop $savedwsstallowrestrictedhop
						if ($twarpmovemoved <> true)
							return
					end
				end
				if ($fuelportvalid <> true)
					if ($focus > 10)
						gosub :upgradefuelcandidate
						gosub :checkfuelcandidate
					end
				end
				if ($fuelportvalid = true)
					if ((($player~ore_holds > 0) or ($player~organic_holds > 0)) or ($player~equipment_holds > 0))
						send "j y "
					end
					send "p t * * 0 * 0 * "
					gosub :player~quikstats
					if ($player~ore_holds >= $localfueloretarget)
						setvar $localfuelsuccess true
						return
					end
				end
			end
		end
	end
	if ($localfuelhop[$focus] < 3)
		setvar $localfueladjindex 1
		while (sector.warps[$focus][$localfueladjindex] > 0)
			setvar $localfueladjacent sector.warps[$focus][$localfueladjindex]
			if ($localfuelchecked[$localfueladjacent] = 0)
				setvar $localfuelchecked[$localfueladjacent] 1
				add $localfueltop 1
				setvar $localfuelqueue[$localfueltop] $localfueladjacent
				setvar $localfuelhop[$localfueladjacent] ($localfuelhop[$focus] + 1)
			end
			add $localfueladjindex 1
		end
	end
	add $localfuelbottom 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:iscurrentsectoradjacentto
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $iscurrentsectoradjacent false
setvar $adjacencyindex 1
while (sector.warps[$player~current_sector][$adjacencyindex] > 0)
	if (sector.warps[$player~current_sector][$adjacencyindex] = $adjacencysector)
		setvar $iscurrentsectoradjacent true
		return
	end
	add $adjacencyindex 1
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
getcourse $course currentsector $destination
if ($course > 0)
	setvar $courselength ($course + 1)
	return
end
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"**q"
pause

:getcourse
#Does Specific Course Calculation
killalltriggers
setvar $courselength 0
setarray $course 80
setvar $sectors ""
getcourse $course currentsector $destination
if ($course > 0)
	setvar $courselength ($course + 1)
	return
end
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
getword $line $firstword 1
isnumber $coursewordvalid $firstword
if (($pos <= 0) and ($pos2 <= 0) and ($coursewordvalid = true))
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
getword $sectors $courseword $index
while ($courseword <> ":::")
	isnumber $coursewordvalid $courseword
	if (($coursewordvalid = true) and ($courseword > 0) and ($courseword <= sectors))
		add $courselength 1
		setvar $course[$courselength] $courseword
	end
	add $index 1
	getword $sectors $courseword $index
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
if (($isbusted1 = true) or ($isbusted2 = true))
	return
end
gosub :validatesstportsbeforesteal
if ($sstportsready <> true)
	setvar $busted true
	return
end
if (($isbusted1 <> true) and ($isbusted2 <> true))
		setvar $maxsteal ($player~experience / $game~steal_factor - 1)
	setvar $send ""
		if ($inship1)
			setvar $laststeal $ship1sector
			setvar $laststealship $wsst_ship1
			setvar $laststealisship1 true
			if ($ship1equipment > 0)
				if (haggle)
					setvar $wsstsellproduct "Equipment"
					gosub :sellcurrentcargo
				gosub :player~quikstats
				if ($player~equipment_holds > 0)
					setvar $switchboard~message "Unable to finish selling Equipment before next steal.*"
					gosub :switchboard~switchboard
					halt
				end
				setvar $ship1equipment 0
			else
				# sell off existing equipment
				setvar $send $send & "p t * * 0* 0* "
				setvar $ship1equipment 0
				add $equipatport[$ship1sector] $ship1equipment
			end
		end
			# steal as much as we are able to on this ship
			if ($ship1totalholds < $maxsteal)
				setvar $steal $ship1totalholds
				else
					setvar $steal $maxsteal
				end
			if ($steal <= 0)
				setvar $busted true
				return
			end

			while ($equipatport[$ship1sector] < ($steal + 20))
				setvar $upgrade ($steal - $equipatport[$ship1sector])
			divide $upgrade 10
			add $upgrade 4
			setvar $send $send & "o 3" & $upgrade & "* * "
			add $equipatport[$ship1sector] ($upgrade * 10)
		end
			setvar $send $send & "p r * s z 3 " & $steal & "* x       "
			setvar $ship1equipment $steal
		else
			setvar $laststeal $ship2sector
			setvar $laststealship $wsst_ship2
			setvar $laststealisship1 false
			if ($ship2equipment > 0)
				if (haggle)
					setvar $wsstsellproduct "Equipment"
					gosub :sellcurrentcargo
				gosub :player~quikstats
				if ($player~equipment_holds > 0)
					setvar $switchboard~message "Unable to finish selling Equipment before next steal.*"
					gosub :switchboard~switchboard
					halt
				end
				setvar $ship2equipment 0
			else
				# sell off existing equipment
				setvar $send $send & "p t * * 0* 0* "
				setvar $ship2equipment 0
				add $equipatport[$ship2sector] $ship2equipment
			end
		end
		# steal as much as we are able to on this ship
		if ($ship2totalholds < $maxsteal)
			setvar $steal $ship2totalholds
			else
				setvar $steal $maxsteal
			end
			if ($steal <= 0)
				setvar $busted true
				return
			end

			while ($equipatport[$ship2sector] < ($steal + 20))
				setvar $upgrade ($steal - $equipatport[$ship2sector])
			divide $upgrade 10
			add $upgrade 4
			setvar $send $send & "o 3" & $upgrade & "* * "
			add $equipatport[$ship2sector] ($upgrade * 10)
		end
			setvar $send $send & "p r* s   z3  " & $steal & "*  x        "
			setvar $ship2equipment $steal
		end

		if ($maxsteal < $minimumsteal)
			setvar $switchboard~message "Maximum steal has fallen below "&$minimumsteal&" holds; stopping before WSST becomes unprofitable.*"
			gosub :switchboard~switchboard
			goto :endsst
		end
		if ($steal < $minimumsteal)
			setvar $blocked[$laststeal] true
			if ($laststealisship1)
				setvar $ship1needsport true
			else
				setvar $ship2needsport true
			end
			setvar $busted true
			return
		end

		if ($inship1)
			send $send & $wsst_ship2 & "*  * "
			setvar $inship1 false
		else
		send $send & $wsst_ship1 & "*  * "
		setvar $inship1 true
		end
		setvar $player~turns ($player~turns-2)
		savevar $player~turns
	end

# calculate experience gain or hold loss
setvar $stake ($steal - 1) / 11

waiton "(R)ob this port, (S)teal product"
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
killtrigger 5
killtrigger 6
killtrigger 7
settextlinetrigger 1 :success "Success!"
settextlinetrigger 2 :bustdetected "Suddenly you're Busted!"
settextlinetrigger 3 :busted "There aren't that many holds of Equipment at this port!"
settextlinetrigger 4 :fakebusted "Do you want instructions (Y/N) [N]?"
settextlinetrigger 7 :stealleftport "You leave the port."
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

:bustdetected
killalltriggers
settextlinetrigger 5 :fakebusted "(You suddenly remember that you were caught stealing here before)"
settextlinetrigger 6 :fakebusted "(You realize the guards saw you last time!)"
settexttrigger 2 :busted "Command [TL="
pause

:stealleftport
killalltriggers
setvar $busted true
gosub :player~quikstats
gosub :clearpostrefurbcargo
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

goto :continue

:fakebusted
killalltriggers
setvar $lastbustsector $laststeal
setsectorparameter $lastbustsector "BUSTED" true
setvar $blocked[$lastbustsector] true
savevar $lastbustsector
setvar $fakebustedship $laststealship
setvar $fakebustedisship1 $laststealisship1
if ($fakebustedisship1)
	setvar $fakebustedship $wsst_ship1
	setvar $ship1equipment 0
else
	setvar $fakebustedship $wsst_ship2
	setvar $ship2equipment 0
end
add $numberbusted 1
setvar $busted 1
gosub :syncafterstealtransport
gosub :player~quikstats
if ($player~ship_number = $wsst_ship1)
	setvar $inship1 true
elseif ($player~ship_number = $wsst_ship2)
	setvar $inship1 false
end
if ($player~ship_number <> $fakebustedship)
	gosub :transport
end
if ($fakebustedisship1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
if ($quiet = 0)
	send "'<"&$bot~subspace&">[Busted:"&$lastbustsector&"]<"&$bot~subspace&">* "
end
gosub :refurb
gosub :player~quikstats
if ($inship1)
	setvar $ship1totalholds $player~total_holds
	setvar $ship1equipment $player~equipment_holds
else
	setvar $ship2totalholds $player~total_holds
	setvar $ship2equipment $player~equipment_holds
end
goto :continue

:syncafterstealtransport
killalltriggers
settextlinetrigger syncaccepted :syncafterstealaccepted "Security code accepted"
settextlinetrigger synclist :syncaftersteallist "--<  Available Ships in Sector >--"
settexttrigger synccommand :syncafterstealcommand "Command [TL="
setdelaytrigger synctimeout :syncafterstealdone 3000
pause

:syncafterstealaccepted
killalltriggers
settexttrigger synccommand2 :syncafterstealdone "Command [TL="
setdelaytrigger synctimeout2 :syncafterstealdone 3000
pause

:syncaftersteallist
killalltriggers
send "q "
waitfor "Command [TL="
return

:syncafterstealcommand
killalltriggers
settextlinetrigger syncaccepted2 :syncafterstealaccepted "Security code accepted"
settextlinetrigger synclist2 :syncaftersteallist "--<  Available Ships in Sector >--"
setdelaytrigger syncaftercommand :syncafterstealdone 750
pause

:syncafterstealdone
killalltriggers
return

:continue
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
killtrigger 5
killtrigger 6
killtrigger 7
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:preparebustrefurbreturn
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $refurbreturnsector 0
if ($busted <> true)
	return
end
if (($inship1 = true) and ($ship1needsport = true))
	setvar $knownsstothersector $ship2sector
	gosub :findknownsstcandidate
	if ($knownsstsector > 0)
		gosub :setrefurbreturniffigged
	end
elseif (($inship1 <> true) and ($ship2needsport = true))
	setvar $knownsstothersector $ship1sector
	gosub :findknownsstcandidate
	if ($knownsstsector > 0)
		gosub :setrefurbreturniffigged
	end
end
return

:setrefurbreturniffigged
getsectorparameter $knownsstsector "FIGSEC" $knownsstisfigged
setvar $knownsstfigowner sector.figs.owner[$knownsstsector]
setvar $knownsstfigcount sector.figs.quantity[$knownsstsector]
if (($knownsstfigcount > 0) and (($knownsstfigowner = "belong to your Corp") or ($knownsstfigowner = "yours")))
	setvar $refurbreturnsector $knownsstsector
elseif ($knownsstisfigged = true)
	setsectorparameter $knownsstsector "FIGSEC" false
end
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
setvar $portinfovalid true
gosub :isusablesstportcandidate
if ($candidateportvalid <> true)
	setvar $portinfovalid false
	return
end
send "* cr*q"
waiton "What sector is the port in? ["

:portinfo
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
settextlinetrigger 1 :getportequip "Equipment  Buying"
settextlinetrigger 2  :noequiphere "I have no information about a port in that sector."
settextlinetrigger 3  :noequiphere "A  Cargo holds     :"
settexttrigger 4 :noequiphere "Command [TL="
pause

:noequiphere
killalltriggers
setvar $equipbuy 0
setvar $equipperc 0
setvar $portinfovalid false
goto :gotallportinfo

:getportequip
killalltriggers
getword currentline $equipbuy 3
getword currentline $equipperc 4
striptext $equipperc "%"
setvar $x 10000
if (($equipperc = 0) or ($equipbuy <= 0))
	setvar $portinfovalid false
	setvar $equipatport[$testsector] ($player~total_holds + 50)
else
	divide $x $equipperc
	multiply $x $equipbuy
	divide $x 100
	subtract $x 1
	subtract $x $equipbuy

	if ($x < 0)
		setvar $equipatport[$testsector] 0
	else
		setvar $equipatport[$testsector] $x
	end
end
setvar $portname port.name[$testsector]
lowercase $portname
if (($portname = "build") or (port.buildtime[$testsector] > 0) or (port.class[$testsector] = 9))
	setvar $portinfovalid false
	setvar $equipatport[$testsector] ($player~total_holds + 50)
end

:gotallportinfo
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4

return

:isusablesstportcandidate
setvar $candidateportvalid true
if ((port.class[$testsector] <> 2) and ((port.class[$testsector] <> 3) and (port.class[$testsector] <> 4)))
	setvar $candidateportvalid false
	return
end
if (port.buyequip[$testsector] <> true)
	setvar $candidateportvalid false
	return
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
setvar $twarp_refurb_success false
setvar $refurbfailed false
setvar $refurballowrestrictedmovement false
setvar $refurbport $furbing
gosub :choosenearbyclass0refurb
if ($nearclass0port > 0)
	setvar $refurbport $nearclass0port
	setvar $refurballowrestrictedmovement true
end
if ($refurbport = $map~stardock)
	setvar $refurballowrestrictedmovement true
end
if (($player~twarp_type <> "No") and ($refurbport = $map~stardock))

	gosub :twarprefurb

end
	if ($twarp_refurb_success <> true)
		if ($refurbport <> 0)
			setvar $mowintosector $refurbport
		else
			setvar $mowintosector $refurbport
			end
			:trysafemowagainrefurb
			setvar $wsstallowrestrictedhop $refurballowrestrictedmovement
			gosub :movetargetpreferingtwarp
			setvar $wsstallowrestrictedhop false
			if (($ultrasafe) and ($issafe = false))
				goto :trysafemowagainrefurb
			end
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
			end
			send "a "&$holdstobuy&"* y b "&$figstobuy&"* c "&$player~shieldstobuy&"* q q q z n * "
			return
		else
			setvar $refurbfailed true
		end
	end
end

if ($player~current_sector = $refurbport)
	killalltriggers
		if ($refurbport = $map~stardock)
			send "p s g y g q s p"
		else
			send "p ty"
		end
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
	send "a "&$holdstobuy&"* y b "&$figstobuy&"* c "&$player~shieldstobuy&"* q q h "
	waitfor "<Hardware Emporium>"
	if ($droplimps)
		send "L"
		waitfor "How many mines do you want"
		gettext currentline $buy "(Max" ") ["
		striptext $buy " "
		send $buy & "*"
		waitfor "<Hardware Emporium>"
	end
	if ($droparmids)
		send "M"
		waitfor "How many mines do you want"
		gettext currentline $buy "(Max" ") ["
		striptext $buy " "
		send $buy & "*"
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
		setvar $refurbfailed true
		send "'Something bad happened on refurb, I am probably in big trouble. [Temp error message until saveme implemented]*"
	end
	if ($refurbfailed = true)
		halt
	end
	if ($twarp_refurb_success = true)
		send " q q * "
		waitfor "Command [TL="
		setvar $player~warpto $return_sector
		gosub :move~twarp
		if ($player~twarpsuccess = false)
			gosub :player~quikstats
			if ($player~current_sector = $map~stardock)
				gosub :recoverfailedrefurbreturn
				if ($dockrefurbrecovered <> true)
					gosub :recoverdockrefurb
				end
				if ($dockrefurbrecovered <> true)
					if ($player~current_sector = $map~stardock)
						setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
					else
						setvar $switchboard~message "Twarp Error, failed refurb-return recovery at sector "&$player~current_sector&".*"
					end
					gosub :switchboard~switchboard
					send "*"
					halt
				end
				return
			end
		end
		gosub :postdockrefurbsettle
	else
		:donenormalfurb
		setvar $twarp_refurb_success false
		send " Q Q "
	end
return

:postdockrefurbsettle
gosub :player~quikstats
getsectorparameter $player~current_sector "BUSTED" $currentrefurbbusted
if (($busted = true) and ($currentrefurbbusted = true))
	setvar $knownsstothersector 0
	if ($inship1)
		setvar $knownsstothersector $ship2sector
	else
		setvar $knownsstothersector $ship1sector
	end
	gosub :findknownsstcandidate
	if ($knownsstsector > 0)
		setvar $moveintosector $knownsstsector
		gosub :movetoknownsstcandidate
			if ($knownsstmoved = true)
				gosub :player~quikstats
			end
		end
	end
	gosub :clearpostrefurbcargo
return

:clearpostrefurbcargo
if ((($player~ore_holds <= 0) and ($player~organic_holds <= 0)) and ($player~equipment_holds <= 0))
	return
end
	if ($player~current_sector = $map~stardock)
		return
	end
	if (($preservefuelcashdrop = true) and (($player~ore_holds > 0) and (($player~organic_holds <= 0) and ($player~equipment_holds <= 0))))
		return
	end
	setvar $clearsector $player~current_sector
	if (($player~ore_holds > 0) and ((port.exists[$clearsector] = true) and (port.buyfuel[$clearsector] = true)))
		send "p t * * 0 * 0 * "
	waitfor "Command [TL="
	gosub :player~quikstats
end
	if ((($player~ore_holds > 0) or ($player~organic_holds > 0)) or ($player~equipment_holds > 0))
		send "j y * "
		waitfor "Command [TL="
		setvar $player~ore_holds 0
		setvar $player~organic_holds 0
		setvar $player~equipment_holds 0
	end
	return

:recoverfailedrefurbreturn
setvar $dockrefurbrecovered false
gosub :player~quikstats
if ($player~current_sector <> $map~stardock)
	return
end
if (($return_sector > 10) and ($return_sector <= sectors))
	setvar $blocked[$return_sector] true
end
if ($inship1)
	setvar $ship1sector $map~stardock
	setvar $knownsstothersector $ship2sector
else
	setvar $ship2sector $map~stardock
	setvar $knownsstothersector $ship1sector
end
setvar $failedreturnattempts 0
:tryrecoverfailedreturn
add $failedreturnattempts 1
if ($failedreturnattempts > 20)
	return
end
gosub :findknownsstcandidate
if ($knownsstsector <= 0)
	return
end
gosub :warptoknownsstcandidate
if ($knownsstmoved <> true)
	setvar $blocked[$knownsstsector] true
	goto :tryrecoverfailedreturn
end
gosub :player~quikstats
if ($player~current_sector <> $knownsstsector)
	setvar $blocked[$knownsstsector] true
	goto :tryrecoverfailedreturn
end
gosub :clearpostrefurbcargo
gosub :player~quikstats
if (($player~organic_holds > 0) or (($player~equipment_holds > 0) or (($player~ore_holds > 0) and ($preservefuelcashdrop <> true))))
	setvar $blocked[$knownsstsector] true
	goto :tryrecoverfailedreturn
end
setvar $testsector $knownsstsector
gosub :getsstportinfo
if ($portinfovalid <> true)
	setvar $blocked[$knownsstsector] true
	goto :tryrecoverfailedreturn
end
if ($inship1)
	setvar $ship1sector $knownsstsector
	setvar $ship1needsport false
	setvar $ship1searchstarted false
	setvar $ship1totalholds $player~total_holds
	setvar $ship1equipment $player~equipment_holds
	setvar $ship2needsport true
else
	setvar $ship2sector $knownsstsector
	setvar $ship2needsport false
	setvar $ship2searchstarted false
	setvar $ship2totalholds $player~total_holds
	setvar $ship2equipment $player~equipment_holds
	setvar $ship1needsport true
end
setvar $dockrefurbrecovered true
setvar $switchboard~message "Recovered from failed refurb return at sector "&$knownsstsector&".*"
gosub :switchboard~switchboard
return

:recoverdockrefurb
setvar $dockrefurbrecovered false
gosub :player~quikstats
if ($player~current_sector <> $map~stardock)
	return
end
if ($inship1)
	setvar $ship1sector $map~stardock
else
	setvar $ship2sector $map~stardock
end
gosub :checkcachedshipdistance
if ($cachedshipdistancevalid <> true)
	gosub :findship
end
if ($destination <= 0)
	return
end
setarray $dockrefurbchecked sectors
setarray $dockrefurbqueue sectors
setarray $dockrefurbhop sectors
setvar $dockrefurbbottom 1
setvar $dockrefurbtop 1
setvar $dockrefurbsector 0
setvar $dockrefurbqueue[1] $map~stardock
setvar $dockrefurbchecked[$map~stardock] 1
while (($dockrefurbbottom <= $dockrefurbtop) and ($dockrefurbsector = 0))
	setvar $testsector $dockrefurbqueue[$dockrefurbbottom]
	if ($testsector <> $map~stardock)
		gosub :dockrefurbcandidate
	end
	if (($dockrefurbsector = 0) and ($dockrefurbhop[$testsector] < $transportrange))
		setvar $dockrefurbwarp 1
		while (sector.warps[$testsector][$dockrefurbwarp] > 0)
			setvar $dockrefurbnext sector.warps[$testsector][$dockrefurbwarp]
			if ($dockrefurbchecked[$dockrefurbnext] = 0)
				setvar $dockrefurbchecked[$dockrefurbnext] 1
				add $dockrefurbtop 1
				setvar $dockrefurbqueue[$dockrefurbtop] $dockrefurbnext
				setvar $dockrefurbhop[$dockrefurbnext] ($dockrefurbhop[$testsector] + 1)
			end
			add $dockrefurbwarp 1
		end
	end
	add $dockrefurbbottom 1
end
if ($dockrefurbsector <= 0)
	return
end
setvar $checksector $dockrefurbsector
	gosub :verifysectoradjdock
	if ($sectoradjdock)
		setvar $mowintosector $dockrefurbsector
		gosub :movetargetpreferingtwarp
		if ($twarpmovemoved <> true)
			return
		end
	else
		setvar $player~warpto $dockrefurbsector
		gosub :move~twarp
	if ($player~twarpsuccess <> true)
		return
	end
end
	send "j y * "
	waitfor "Command [TL="
	gosub :player~quikstats
	if (($player~ore_holds > 0) or (($player~organic_holds > 0) or ($player~equipment_holds > 0)))
		return
	end
	if ($player~current_sector <> $dockrefurbsector)
		return
	end
setvar $testsector $dockrefurbsector
gosub :getsstportinfo
if ($portinfovalid <> true)
	return
end
if ($inship1)
	setvar $ship1sector $dockrefurbsector
	setvar $ship1needsport false
	setvar $ship1totalholds $player~total_holds
	setvar $ship1equipment $player~equipment_holds
	setvar $ship2needsport true
else
	setvar $ship2sector $dockrefurbsector
	setvar $ship2needsport false
	setvar $ship2totalholds $player~total_holds
	setvar $ship2equipment $player~equipment_holds
	setvar $ship1needsport true
end
setvar $dockrefurbrecovered true
setvar $switchboard~message "Recovered from dock refurb at sector "&$dockrefurbsector&".*"
gosub :switchboard~switchboard
return

:dockrefurbcandidate
setvar $candidateok true
gosub :isusablesstportcandidate
if ($candidateportvalid <> true)
	setvar $candidateok false
end
	gosub :iswsstbustrisky
	if ($wsstbustrisky = true)
		setvar $candidateok false
	end
if ($testsector = $destination)
	setvar $candidateok false
end
setvar $containsshieldedplanet false
setvar $p 1
while ($p <= sector.planetcount[$testsector])
	getword sector.planets[$testsector][$p] $test 1
	if ($test = "<<<<")
		setvar $containsshieldedplanet true
	end
	add $p 1
end
if ($containsshieldedplanet)
	setvar $candidateok false
end
setvar $figowner  sector.figs.owner[$testsector]
setvar $figcount  sector.figs.quantity[$testsector]
if (($figcount > $safefighterlevel) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
	setvar $candidateok false
end
getsectorparameter $testsector "FIGSEC" $isfigged
setvar $checksector $testsector
gosub :verifysectoradjdock
if (($isfigged <> true) and ($sectoradjdock <> true))
	setvar $candidateok false
end
getdistance $dist1 $testsector $destination
getdistance $dist2 $destination $testsector
if (($dist1 <= 0) or (($dist2 <= 0) or (($dist1 > $transportrange) or ($dist2 > $transportrange))))
	setvar $candidateok false
end
if ($candidateok)
	setvar $dockrefurbsector $testsector
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:safemowintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $issafe true
setvar $destination $mowintosector
gosub :getcourse
setvar $j 2
setvar $result ""
setvar $routebuildsector $player~current_sector
while (($j <= $courselength) and ($issafe))
	setvar $nextsafesector $course[$j]
	isnumber $routehopvalid $nextsafesector
		if ($routehopvalid <> true)
			setvar $issafe false
			return
		end
		setvar $wssthop $nextsafesector
		gosub :iswsstmovementhopallowed
		if ($wssthopallowed <> true)
			setvar $issafe false
			return
		end
		setvar $routeisadjacent false
		setvar $routeadjindex 1
		while (sector.warps[$routebuildsector][$routeadjindex] > 0)
			if (sector.warps[$routebuildsector][$routeadjindex] = $nextsafesector)
				setvar $routeisadjacent true
		end
		add $routeadjindex 1
	end
	if ($routeisadjacent <> true)
		setvar $issafe false
		return
	end
	send "sh"
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
		setvar $result ($result & "m "&$course[$j]&"* ")
			if (($course[$j] > 10) and ($course[$j] <> $map~stardock))
			setvar $result ($result & "za"&$ship~ship_max_attack&"* * ")
		end
	else
		setvar $result ($result & "c v"&$nextsafesector&"*q ")
		setvar $issafe false
		send $result
		return
	end
		if (($course[$j] > 10) and ($course[$j] <> $map~stardock) and ($j > 2))
		setvar $result ($result & "f z 1* z c d * ")
		setsectorparameter $course[$j] "FIGSEC" true
		if ($droplimps)
			setvar $result $result&"  H  2  Z  3*  Z C  *  "
		end
		if ($droparmids)
			setvar $result $result&"  H  1  Z  3*  Z C  *  "
		end
	end
	setvar $routebuildsector $nextsafesector
	setvar $result ($result & "  /")
	send $result
	waitfor (#179 & "Turns")
	add $j 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:mowintosector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $destination $mowintosector
gosub :getcourse
setvar $j 2
setvar $result ""
setvar $routebuildsector $player~current_sector
while ($j <= $courselength)
	setvar $routehop $course[$j]
	isnumber $routehopvalid $routehop
		if ($routehopvalid <> true)
			return
		end
		setvar $wssthop $routehop
		gosub :iswsstmovementhopallowed
		if ($wssthopallowed <> true)
			return
		end
		setvar $routeisadjacent false
		setvar $routeadjindex 1
		while (sector.warps[$routebuildsector][$routeadjindex] > 0)
			if (sector.warps[$routebuildsector][$routeadjindex] = $routehop)
				setvar $routeisadjacent true
		end
		add $routeadjindex 1
	end
	if ($routeisadjacent <> true)
		return
	end
	setvar $result $result&"m"&$routehop&"* "
		if (($routehop > 10) and ($routehop <> $map~stardock))
		setvar $result $result&"za"&$ship~ship_max_attack&"* * "
	end
		if (($dropfigs = true) and ($routehop > 10) and ($routehop <> $map~stardock) and ($j > 2))
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
		setsectorparameter $routehop "FIGSEC" true
	end

	if ($droplimps)
		setvar $result $result&"  H  2  Z  3*  Z C  *  "
		setsectorparameter $routehop "LIMPSEC" true
	end
	if ($droparmids)
		setvar $result $result&"  H  1  Z  3*  Z C  *  "
		setsectorparameter $routehop "MINESEC" true
	end

	setvar $routebuildsector $routehop
	add $j 1
end
send $result
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:dropcashatbase
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
		if ($player~credits >= $dropcashlimit)
			setvar $cashdropamount $dropcashlimit
			setvar $cashafterdrop $player~credits
			subtract $cashafterdrop $cashdropamount
			if ($cashafterdrop < $cash_to_hold_onto)
				return
			end
			setvar $mowintosector $cashdropsector
		if (($player~twarp_type <> "No") and (($cashdropsector > 10) and ($cashdropsector <= sectors)))
			getdistance $dropcashdist $player~current_sector $cashdropsector
			if (($dropcashdist > 1) and ($dropcashdist <> "-1"))
				setvar $dropcashfuelneeded ($dropcashdist * 3)
				if ($player~ore_holds < $dropcashfuelneeded)
					setvar $knownssttwarptarget $cashdropsector
					gosub :getlocalknownsstfuel
				end
			end
		end
		:trysafemowagain
		gosub :movetargetpreferingtwarp
		if (($ultrasafe) and ($issafe = false))
			goto :trysafemowagain
			end
			if ($player~current_sector = $cashdropsector)
				send "l "&$cashdropplanet &"* c t t "&$cashdropamount&"* qq* "
		#send "l "&$cashDropPlanet &"* m n l "&($player~fighters/2)&"*  c t t "&$cashdropamount&"* qq* "
			add $cashdeposited $cashdropamount
			subtract $player~credits $cashdropamount
			gosub :displaycredits
			if ($inship1)
				setvar $ship1sector $player~current_sector
				setvar $ship1needsport true
				setvar $ship1searchstarted false
			else
				setvar $ship2sector $player~current_sector
				setvar $ship2needsport true
				setvar $ship2searchstarted false
			end
			setvar $preservefuelcashdrop false
		else
			send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
			setvar $preservefuelcashdrop false
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
gosub :haggle~restoreautohaggle
setvar $switchboard~message "World SST has completed, make sure you pick up the bot and its ships.*"
gosub :switchboard~switchboard
halt

:checkcachedshipdistance
setvar $cachedshipdistancevalid false
gosub :player~quikstats
if ($inship1)
	setvar $cachedcurrentsector $ship1sector
	setvar $destination $ship2sector
else
	setvar $cachedcurrentsector $ship2sector
	setvar $destination $ship1sector
end
if ($cachedcurrentsector <> $player~current_sector)
	return
end
if (($destination <= 0) or ($destination > sectors))
	return
end
setvar $dist1 "-1"
setvar $dist2 "-1"
getdistance $dist1 $player~current_sector $destination
if ($dist1 = "-1")
	send "cf" & $player~current_sector & "*" & $destination & "*q"
	waiton "What is the starting sector"
	waiton "Command [TL="
	getdistance $dist1 $player~current_sector $destination
end
getdistance $dist2 $destination $player~current_sector
if ($dist2 = "-1")
	send "cf" & $destination & "*" & $player~current_sector & "*q"
	waiton "What is the starting sector"
	waiton "Command [TL="
	getdistance $dist2 $destination $player~current_sector
end
if (($dist1 <> "-1") and ($dist2 <> "-1"))
	setvar $cachedshipdistancevalid true
end
return

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
	if ($shipnum = $wsst_ship2)
		setvar $found2 currentline
		replacetext $found2 "+" " "
		getword $found2 $found2 2
		if ($inship1)
			goto :finishshipscan
		end
	elseif ($shipnum = $wsst_ship1)
		setvar $found1 currentline
		replacetext $found1 "+" " "
		getword $found1 $found1 2
		if ($inship1 <> true)
			goto :finishshipscan
		end
	end
	goto :nextship
end

:finishshipscan
killalltriggers
send "                                                  "
waiton "Command [TL="
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
setvar $return_sector $start_sector
if (($refurbreturnsector > 10) and ($refurbreturnsector <= sectors))
	setvar $return_sector $refurbreturnsector
end
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $map~stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

echo "**" & ansi_14 & "Please Stand By" & ansi_15 & " - Calculating Distances...**"
getdistance $dist1 $start_sector $map~stardock

if ($dist1 <= 0)
	setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
	gosub :switchboard~switchboard
	send "*"
	halt
end

getdistance $dist2 $map~stardock $return_sector
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
		if ($player~current_sector = $map~stardock)
			if ($player~ore_holds >= $ore_req)
				setvar $twarp_refurb_success true
				return
			end
			setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
	setvar $i 1
	setvar $weareadjdock false
	while ($i <= sector.warpcount[$player~current_sector])
		setvar $adj_start sector.warps[$player~current_sector][$i]
		if ($adj_start = $map~stardock)
			setvar $weareadjdock true
		end
		add $i 1
	end
	getdistance $dist1 $player~current_sector $map~stardock
	if ($dist1 <= 0)
		setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
		gosub :switchboard~switchboard
		send "*"
		halt
	end
	setvar $ore_req (($dist1 + $dist2) * 3)
	if ($player~ore_holds < $ore_req)
		setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
		gosub :switchboard~switchboard
		send "*"
		halt
	end
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
		send "^F" & $map~stardock & "*" & $return_sector & "*Q/ "
	else
		send "^F" & $player~current_sector & "*" & $map~stardock & "*F" & $map~stardock & "*" & $return_sector & "*Q/ "
	end
else
	if ($weareadjdock)
		send "^F" & $map~stardock & "*" & $return_sector & "*Q/ "
	else
		send "^F" & $player~current_sector & "*" & $red_adj & "*F" & $map~stardock & "*" & $return_sector & "*Q/ "
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
setvar $msg ""
if ((currentalignment >= 1000) and ($weareadjdock = false))
	setvar $warpto $map~stardock
	gosub :dotwarp
elseif (($weareadjdock = false) and ($red_adj <> 0))
	setvar $warpto $red_adj
	gosub :dotwarp
	else
		send "q q *  m " & $map~stardock & "*  *  P  S G Y G Q "
		setvar $twarp_refurb_success true
	end
if ($msg = "")
	waitfor "You leave the Galactic Bank."
else
	setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
	gosub :switchboard~switchboard
	send "*"
	halt
end
gosub :player~quikstats

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getsomefuel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
setvar $fuelneeded ($ore_req - $player~ore_holds)
if ($fuelneeded < 1)
	return
end
	setvar $bottom 1
	setvar $top 1
	setarray $checked sectors
	setarray $fuelhop sectors
	setvar $que[1] $player~current_sector
	setvar $checked[$player~current_sector] 1
	setvar $fuelhop[$player~current_sector] 0
	setvar $a 1

	:try_again
	while ($bottom <= $top)
		# Now, pull out the next sector in the queue, and make it our focus
			setvar $focus $que[$bottom]
		getsectorparameter $focus "FIGSEC" $isfigged
		getsectorparameter $focus "BUSTED" $isbusted

		getdistance $fuel_dist1 $focus $map~stardock
	if ($fuel_dist1 <= 0)
		goto :queuefueladjacents
	end
	setvar $fueloretarget (($fuel_dist1 + $dist2) * 3)
	setvar $candidatefuelneeded $fueloretarget
	subtract $candidatefuelneeded $player~ore_holds
	if ($candidatefuelneeded < 1)
		setvar $candidatefuelneeded 1
	end

			if (($fuelhop[$focus] <= 3) and (($focus > 1) and ((port.exists[$focus] = true) and (port.buyfuel[$focus] <> true))))
				gosub :checkfuelcandidate
				if (($fuelportvalid = true) or ($fuelportupgradeable = true))
					if ($player~current_sector <> $focus)
						setvar $savedwsstallowrestrictedhop $wsstallowrestrictedhop
						setvar $wsstallowrestrictedhop true
						setvar $mowintosector $focus
						gosub :movetargetpreferingtwarp
						setvar $wsstallowrestrictedhop $savedwsstallowrestrictedhop
						if ($twarpmovemoved <> true)
							goto :queuefueladjacents
					end
				end
				if ($fuelportvalid <> true)
					if ($focus > 10)
						gosub :upgradefuelcandidate
						gosub :checkfuelcandidate
					end
				end
			end
			if ($fuelportvalid = true)
				if (($focus > 10) and (((port.buyorg[$focus]) and ($player~organic_holds > 0)) or ((port.buyequip[$focus]) and ($player~equipment_holds > 0))))
					send "p t * * * * * * "
				else
					if (($player~ore_holds > 0) or ($player~organic_holds > 0) or ($player~equipment_holds > 0))
						send "j y "
					end
					send "p t * * 0 * 0 * "
				end
				gosub :player~quikstats
				if ($player~ore_holds >= $fueloretarget)
					return
				end
			end
		end

		:queuefueladjacents
		# That wasn't it, so let's add all the adjacents to the queue for future testing.
		setvar $a 1
		while ((sector.warps[$focus][$a] > 0) and ($fuelhop[$focus] < 3))
			setvar $adjacent sector.warps[$focus][$a]
			# But only add them if they haven't been added previously
			if ($checked[$adjacent] = 0)
				# Okay, this one hasn't been checked, so tag it and que it.
				setvar $checked[$adjacent] 1
				add $top 1
				setvar $que[$top] $adjacent
				setvar $fuelhop[$adjacent] ($fuelhop[$focus] + 1)
			end
			add $a 1
		end
	# The adjacents of $focus were all queued, now on to the next one.
	add $bottom 1
	end
	gosub :mowtostardockforrefurbfuel
	gosub :player~quikstats
	if (($dockfuelmowsuccess = true) and ($player~ore_holds >= $ore_req))
		setvar $twarp_refurb_success true
		return
	end
setvar $switchboard~message "Can't find a route to fuel.  Halting*"
gosub :switchboard~switchboard
halt

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:setarrays
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setarray $equipatport sectors
setarray $fuelatport sectors
#setarray $invalidsstport sectors
setarray $blocked sectors

gosub :sector~getavoids
setvar $i 0
while ($i < $sector~avoidcount)
	add $i 1
	setvar $blocked[$sector~avoids[$i]] 1
end

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:mowtostardockforrefurbfuel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $dockfuelmowsuccess false
if (($map~stardock <= 0) or ($map~stardock > sectors))
	return
end
if ($player~current_sector = $map~stardock)
	setvar $dockfuelmowsuccess true
	return
end
setvar $savedwsstallowrestrictedhop $wsstallowrestrictedhop
setvar $wsstallowrestrictedhop true
setvar $mowintosector $map~stardock
gosub :movetargetpreferingtwarp
setvar $wsstallowrestrictedhop $savedwsstallowrestrictedhop
if (($twarpmovemoved = true) and ($player~current_sector = $map~stardock))
	setvar $dockfuelmowsuccess true
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checkfuelcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
setvar $fuelportvalid false
setvar $fuelportupgradeable false
setvar $fuelportamount 0
setvar $fuelportpercent 0
getsectorparameter $focus "BUSTED" $fuelisbusted
if ($fuelisbusted = true)
	return
end
send "c r"
waiton "What sector is the port in?"
settextlinetrigger wsstfuelportline :wsstfuelportline "Fuel Ore"
settextlinetrigger wsstnofuelport1 :wsstnofuelport "I have no information about a port in that sector."
settextlinetrigger wsstnofuelport2 :wsstnofuelport "You have never visted sector"
settexttrigger wsstfuelportdone :wsstfuelportdone "Command [TL="
send $focus & "*q"
pause

:wsstfuelportline
getword currentline $fuelportstatus 3
getword currentline $fuelportamount 4
getword currentline $fuelportpercent 5
striptext $fuelportamount ","
striptext $fuelportpercent "%"
if (($fuelportstatus = "Selling") and ($fuelportamount >= $candidatefuelneeded))
	setvar $fuelportvalid true
end
if (($fuelportstatus = "Selling") and (($fuelportamount < $candidatefuelneeded) and ($fuelportpercent < 100)))
	setvar $fuelportupgradeable true
end
pause

:wsstnofuelport
setvar $fuelportvalid false
pause

:wsstfuelportdone
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:upgradefuelcandidate
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
setvar $fuelupgradefailed false
send "o1"
waiton ", 0 to quit)"
getword currentline $fuelupgradeamount 9
striptext $fuelupgradeamount "("
if ($fuelupgradeamount <= 0)
	setvar $fuelupgradefailed true
	send "0*"
	waiton "Command [TL="
	return
end
if ($fuelupgradeamount > 100)
	setvar $fuelupgradeamount 100
end
send $fuelupgradeamount "*"
waiton "Choice ?"
send "q"
waiton "Command [TL="
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:findjumpsector
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $i 1
setvar $red_adj 0
setvar $jump_start $player~current_sector
send "qq*"
while (sector.warpsin[$map~stardock][$i] > 0)
	setvar $red_adj sector.warpsin[$map~stardock][$i]
	setvar $checksector $red_adj
	gosub :verifysectoradjdock
	if ($sectoradjdock = false)
		goto :tryingnextadj
	end
	getsectorparameter $red_adj "FIGSEC" $redadjfigged
	if ($redadjfigged <> true)
		goto :tryingnextadj
	end
	send "m " & $red_adj & "*"
	settexttrigger twarpengage 		:twarpengage "Do you want to engage the TransWarp drive? "
	settexttrigger twarpblind 		:twarpblind "Do you want to make this jump blind? "
	settexttrigger twarplocked		:twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided			:twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpmoved			:twarpmoved "Sector  : " & $red_adj & " "
	settexttrigger twarpalready			:twarpalready "You are already in that sector!"
	settextlinetrigger twarpnavpoint		:twarpnavpoint "<Set NavPoint>"
	settextlinetrigger twarpempty	:twarpempty "You do not have enough Fuel Ore to make the jump"
	pause

	:twarpengage
	killtrigger twarpengage
	send "y"
	pause

	:twarpmoved
	killalltriggers
	send " z* "
	setvar $player~current_sector $red_adj
	return

	:twarpalready
	killalltriggers
	setvar $player~current_sector $red_adj
	return

	:twarpnavpoint
	killalltriggers
	send "q*"
	waitfor "Command [TL="
	goto :tryingnextadj

	:twarpvoided
	killalltriggers
	send "nn"
	waitfor "Command [TL="
	goto :tryingnextadj

	:twarplocked
	killalltriggers
	send "n"
	waitfor "Command [TL="
	goto :sectorlocked

	:twarpblind
	killalltriggers
	send "n"
	setsectorparameter $red_adj "FIGSEC" false
	waitfor "Command [TL="
	goto :tryingnextadj

	:twarpempty
	killalltriggers
	waitfor "Command [TL="

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
if ($class0candidate <= 10)
	return
end
getdistance $class0dist $player~current_sector $class0candidate
if (($class0dist > 0) and ($class0dist <= 3) and ($class0dist < $nearclass0dist))
	gosub :class0refurbrouteallowed
	if ($class0refurbrouteallowed = true)
		setvar $nearclass0port $class0candidate
		setvar $nearclass0dist $class0dist
	end
end
return

:class0refurbrouteallowed
setvar $class0refurbrouteallowed false
setvar $class0saveddestination $destination
setvar $destination $class0candidate
gosub :getcourse
setvar $destination $class0saveddestination
if ($courselength <= 1)
	return
end
setvar $class0refurbrouteallowed true
setvar $class0routebuildsector $player~current_sector
setvar $class0routeidx 2
while (($class0routeidx <= $courselength) and ($class0refurbrouteallowed = true))
	setvar $class0routehop $course[$class0routeidx]
	isnumber $class0routehopvalid $class0routehop
	if ($class0routehopvalid <> true)
		setvar $class0refurbrouteallowed false
	elseif (($class0routehop <= 0) or ($class0routehop > sectors))
		setvar $class0refurbrouteallowed false
	elseif ($blocked[$class0routehop] = true)
		setvar $class0refurbrouteallowed false
	else
		setvar $class0routeisadjacent false
		setvar $class0routeadjindex 1
		while (sector.warps[$class0routebuildsector][$class0routeadjindex] > 0)
			if (sector.warps[$class0routebuildsector][$class0routeadjindex] = $class0routehop)
				setvar $class0routeisadjacent true
			end
			add $class0routeadjindex 1
		end
		if ($class0routeisadjacent <> true)
			setvar $class0refurbrouteallowed false
		elseif (($class0routehop <> $class0candidate) and ($class0routehop > 10))
			getsectorparameter $class0routehop "FIGSEC" $class0hopfigged
			setvar $class0hopfigowner sector.figs.owner[$class0routehop]
			setvar $class0hopfigcount sector.figs.quantity[$class0routehop]
			if (($class0hopfigged <> true) and (($class0hopfigcount <= 0) or (($class0hopfigowner <> "belong to your Corp") and ($class0hopfigowner <> "yours"))))
				setvar $class0refurbrouteallowed false
			end
		end
		if ($class0refurbrouteallowed = true)
			setvar $class0routebuildsector $class0routehop
		end
	end
	add $class0routeidx 1
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
if ($class0candidate <= 10)
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
	pause

	:adj_warp
	killalltriggers
	send "z*"
	if ((currentalignment < 1000) and ($warpto <> $map~stardock))
		send " m " & $map~stardock & " *  *  p s g y g q "
	else
		send " p s g y g q "
	end
	setvar $twarp_refurb_success true
	goto :twarpdone

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock 		:twarp_lock "TransWarp Locked"
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
	send " q * "
	setvar $msg "Twarp target opened navpoint instead of locking."
	goto :twarpdone

	:twarpnoroute
	killalltriggers
	send "n* z* "
	setvar $msg "No route available!"
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
send "n "
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
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
include "source\include\haggle"
include "source\include\sector"
