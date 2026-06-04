# Original script Copyright (C) 2005 Remco Mulder

gosub :loadvars~loadvars

gosub :help~initialize
setvar $help~help[1]    $help~tab&"makeplanet {ewarp} {create:} {"&#34&"custom planet name"&#34&"} "
setvar $help~help[2]    $help~tab&"       "
setvar $help~help[3]    $help~tab&"     {ewarp}  - Will refurb torps and atomics by ewarp "
setvar $help~help[4]    $help~tab&"                This is NOT safe."
setvar $help~help[5]    $help~tab&"       "
setvar $help~help[6]    $help~tab&"   {create:}  - List of planet types to make.  First word"
setvar $help~help[7]    $help~tab&"                of planet types separated by commas and no spaces."
setvar $help~help[8]    $help~tab&"                Default will use keeper planets in preferences."
setvar $help~help[9]    $help~tab&"                "
setvar $help~help[10]   $help~tab&"{custom name} - Name the planet will be.  Otherwise it's a random   "
setvar $help~help[11]   $help~tab&"                name from a database              "
setvar $help~help[12]   $help~tab&"                              "
setvar $help~help[13]   $help~tab&"      {strip} - Strip the made planets of products. Must start"
setvar $help~help[14]   $help~tab&"                on the planet to fill.               "
setvar $help~help[15]   $help~tab&"                              "
setvar $help~help[16]   $help~tab&"      Examples:                   "
setvar $help~help[17]   $help~tab&"            >makeplanet create:earth,volcanic,oceanic "
setvar $help~help[18]   $help~tab&"            >makeplanet ewarp strip create:earth         "
setvar $help~help[19]   $help~tab&"            >makeplanet "&#34&"death"&#34&" create:volcanic "
setvar $help~help[20]   $help~tab&"                              "
setvar $help~help[21]   $help~tab&"               - Originally written by Xide"
gosub :help~helpfile

loadvar $game~genesis_cost
loadvar $game~atomic_cost
loadvar $map~stardock
loadvar $bot~folder
loadvar $game~max_planets_per_sector
loadvar $planet~planet_file

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $startingplanet 0

if ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q"
elseif ($startinglocation = "Planet")
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q"
elseif ($startinglocation <> "Command")
	setvar $switchboard~message "Have to be on Command, Planet, or Citadel prompt to start makeplanet.*"
	gosub :switchboard~switchboard
	halt
end

gosub :planet~loadplanetinfo

getwordpos " "&$bot~user_command_line&" " $pos "ewarp"
setvar $warptype "T"
if ($pos > 0)
	setvar $warptype "E"
end

getwordpos " "&$bot~user_command_line&" " $pos "strip"
if ($pos > 0)
	if ($startingplanet = 0)
		setvar $switchboard~message "Must start on a planet to use strip option.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $strip true
	setvar $planet~planettofill $planet~planet
	setvar $startingplanet $planet~planet
	setvar $planet~emptyfuel true
	setvar $planet~emptyorganics true
	setvar $planet~emptyequipment true
else
	setvar $strip false
end

getwordpos " "&$bot~user_command_line&" " $pos "create:"
if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $create_list "create:" " "
	getwordpos $create_list $pos ","
	if ($pos > 0)
		splittext $create_list $wantedplanets  ","
	else
		setarray $wantedplanets 1
		setvar $wantedplanets[1] $create_list
		setvar $wantedplanets 1
	end
else
	setvar $i 1
	setvar $foundplanet false
	setvar $isakeeper false
	while (($i <= $planet~planetcounter) and ($foundplanet = false))
		if ($planet~planetlist[$i][7] = true)
			setvar $isakeeper true
		end
		add $i 1
	end
	if ($isakeeper <> true)
		setvar $switchboard~message "Create list not defined, and no keeper planets defined in preferences.*"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $custom_planet_name ""
getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	setvar $bot~user_command_line $bot~user_command_line&" "
	gettext " "&$bot~user_command_line&" " $custom_planet_name " "&#34 #34&" "
	if ($custom_planet_name <> "")
		striptext $bot~user_command_line " "&#34&$custom_planet_name&#34&" "
		cuttext $custom_planet_name $first_letter 1 1
		cuttext $custom_planet_name $rest_of_letters 2 9999
		uppercase $first_letter
		setvar $custom_planet_name $first_letter&$rest_of_letters
	end
end

gosub :planetnames~make_planet_array

gosub :makeplanet
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	setvar $planet~planet $startingplanet
	gosub :planet~landingsub
end
halt

:makeplanet
# sys_check

setvar $failed 0
gosub :player~quikstats

setvar $sector $player~current_sector
setvar $credits $player~credits
setvar $holds $player~total_holds
setvar $torps $player~genesis
setvar $dets $player~atomic
setvar $figs $player~fighters
setvar $shield $player~shields

# see if we really can twarp
if ((sector.figs.quantity[$sector] <= 0) or ((sector.figs.owner[$sector] <> "belong to your Corp") and (sector.figs.owner[$sector] = "yours")) or (($player~twarp_type = 0) or ($player~twarp_type = "No")) or ($player~alignment < 1000)) and ($warptype = "T")
	setvar $switchboard~message "Cannot twarp safely, so halting.  Check alignment and make sure fighter is in sector.*"
	gosub :switchboard~switchboard
	halt
end

setvar $announce_message ""

:bust
if ($torps <= 0) or ($dets <= 1)
	# resupply
	gosub :sub_resupply
end

if ($failed > 0)
	return
end

send "uy n " #8 #8
subtract $torps 1
settextlinetrigger 1 :bust_testplanet "What do you want to name"
pause

:bust_testplanet
getword currentline $type 11
striptext $type ")"
lowercase $type

if ($wantedplanets[1] = 0)
	setvar $planet~planet_type $type
	lowercase $planet~planet_type
	striptext $planet~planet_type ")"
	#echo $planet~planet_type&"*"

	setvar $i 1
	setvar $foundplanet false
	setvar $isakeeper false
	while (($i <= $planet~planetcounter) and ($foundplanet = false))
		lowercase $planet~planetlist[$i]
		lowercase $planet~planet_type
		getwordpos $planet~planetlist[$i] $pos $planet~planet_type
		if ($pos > 0)
			setvar $isakeeper $planet~planetlist[$i][7]
			setvar $foundplanet true
		end
		add $i 1
	end
	if ($isakeeper = true)
		goto :bust_wanted
	end
else

	if ($wantedplanets = 0)
		setvar $switchboard~message "Somehow no wanted planets are defined.  Halting.*"
		gosub :switchboard~switchboard
		halt
	end
	# see if we want it
	setvar $i 1
	while ($i <= $wantedplanets)
		if ($wantedplanets[$i] = $type)
			setvar $announce_message "Made "&$wantedplanets[$i]&" planet!.*"
			goto :bust_wanted
		else
			#setVar $SWITCHBOARD~message "Looking for "&$WantedPlanets[$i]&", but found "&$Type&" instead.*"
			#gosub :SWITCHBOARD~switchboard
		end
		add $i 1
	end
end

# we don't want it
getrnd $name 1000 99999
mergetext "Kill-" $name $longname
send $longname "*cl"
waitfor "Command [TL="

# get its ID
settextlinetrigger 1 :bust_landed "Landing sequence engaged..."
settextlinetrigger 2 :bust_getid $longname
pause

:bust_getid
setvar $line currentline
striptext $line "<"
striptext $line ">"
getword $line $planetid 1
send $planetid "* "
killtrigger 1

:bust_landed
killtrigger 2
if ($strip = true)
	setvar $planet~planettostrip $planetid
	gosub :planet~stripplanet
	gosub :player~currentprompt
	if ($player~current_prompt = "Citadel")
		send "q"
		elseif ($player~current_prompt = "Command")
			setvar $planet~planet $planetid
			gosub :planet~landingsub
		end
	gosub :planet~getplanetinfo
	if ($planet~planet <> $planetid)
		setvar $switchboard~message "Landed on wrong planet, halting strip.*"
		gosub :switchboard~switchboard
		halt
	end
end
# nuke it
send "zdy  "
subtract $dets 1
goto :bust

:bust_wanted
# give it a nice name

	if ($custom_planet_name = "")
		getrnd $planet~planet_pointer 1 1000
		setvar $first_part $planetnames~planet_names[$planet~planet_pointer]
		getword $first_part $first_half 1
		getrnd $planet~planet_pointer 1 1000
		setvar $second_part $planetnames~planet_names[$planet~planet_pointer]
	getrnd $flip_a_coin 1 2
	getword $second_part $last_half $flip_a_coin
	if (($last_half = "")  or ($last_half = "0"))
		getword $second_part $last_half 1
	end
	setvar $planet~planetlabel $first_half&" "&$last_half
	setvar $name $planet~planetlabel
else
	setvar $name $custom_planet_name
end
send $name "*cl"

# get its ID
waiton "Should this be a"
settextlinetrigger 1 :bust_landed2 "Landing sequence engaged..."
settextlinetrigger 2 :bust_getid2 $name
pause

:bust_getid2
setvar $line currentline
striptext $line "<"
striptext $line ">"
getword $line $planetid 1
send "q*"
killtrigger 1
if ($announce_message <> "")
	setvar $switchboard~message $announce_message
	gosub :switchboard~switchboard
	setvar $announce_message ""
end
return

:bust_landed2
settextlinetrigger 1 :bust_landed3 "Planet #"
pause

:bust_landed3
getword currentline $planetid 2
striptext $planetid "#"
killtrigger 2
send "q"
if ($announce_message <> "")
	setvar $switchboard~message $announce_message
	gosub :switchboard~switchboard
	setvar $announce_message ""
end
return

:sub_resupply
if ($credits < $creditlimit)
	# low on cash
	setvar $failed 1
	return
end

gosub :player~quikstats
setvar $buyfigs ($figs - $player~fighters)
setvar $buyshield ($shield - $player~shields)
setvar $credits $player~credits

loadvar $map~stardock

if ($warptype = "T")
	# TWarp to stardock
	gosub :calc_twarp_ore
	if ($ore_short > 0)
		if ($empty_holds <= 0)
			setvar $switchboard~message "Need more ore for the round trip to StarDock, but the ship has no empty holds.*"
			gosub :switchboard~switchboard
			setvar $failed 1
			return
		end

		if ($empty_holds < $ore_short)
			setvar $switchboard~message "Need "&$ore_short&" holds of ore for the round trip to StarDock, but only "&$empty_holds&" holds are free.*"
			gosub :switchboard~switchboard
			setvar $failed 1
			return
		end

		setvar $seekproduct~product 1
		setvar $seekproduct~holds $ore_short
		gosub :seekproduct
	end

	if ($map~stardock < 600) or (sectors > 5000)
		send $map~stardock "*yy"
	else
		send $map~stardock "yy"
	end
else
	setvar $warp~mode $warptype
	setvar $warp~dest $map~stardock
	gosub :warp
end

send "ps  g yg qh t"
waitfor "Planning on starting a colony eh?"

settexttrigger resupply_gettorps :resupply_gettorps ") [0] ?"
pause

:resupply_gettorps
getword currentline $resupply_torps 9
striptext $resupply_torps ")"
if ($torps >= 20)
	send "*a"
elseif ($resupply_torps < (20 - $torps))
	send $resupply_torps "*a"
else
	send (20 - $torps) "*a"
end
add $torps $resupply_torps

waitfor "We have the standard Nuerevy Atomic Detonator"
settexttrigger resupply_getdets :resupply_getdets ") [0] ?"
pause

:resupply_getdets
getword currentline $resupply_dets 9
striptext $resupply_dets ")"
send $resupply_dets "*"
add $dets $resupply_dets

if ($buyfigs > 0) or ($buyshield > 0)
	send "qs p "

	if ($buyfigs > 0)
		send "b" $buyfigs "*"
	end
	if ($buyshield > 0)
		send "c" $buyshield "*"
	end

	send "q"
end

send "qq"

if ($warptype = "T")
	if ($sector < 600) or (sectors > 5000)
		send $sector "*yy"
	else
		send $sector "yy"
	end
else
	setvar $warp~mode $warptype
	setvar $warp~dest $sector
	gosub :warp
end

return

:seekproduct
if ($seek_holds = 0)
	gosub :player~quikstats
	setvar $seek_holds $player~total_holds
end

:seek_gogather
setvar $move~checksub ":seek_checksector"
send "d"
gosub :move~move

if ($seek_found = "P")

	:seek_buyproduct
	if ($seek_product = 1)
		setvar $haggle~buyprod "Fuel"
	elseif ($seek_product = 2)
		setvar $haggle~buyprod "Organics"
	else
		setvar $haggle~buyprod "Equipment"
	end

	setvar $haggle~quantity 0
	setvar $haggle~sector $seek_source_sector
	send "pt"
	gosub :haggle~haggle

	if ($haggle~abort)
		goto :seek_buyproduct
	end
else
	send "tnt"&$seek_product "*q"
end
return

:seek_checksector
setvar $findproduct~quantity $seek_holds
setvar $findproduct~product $seek_product
setvar $findproduct~ignorelist $seek_ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $seek_ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
	setvar $move~found 1
	setvar $seek_source_sector $move~cursector
	setvar $seek_found $findproduct~location
end

return

:calc_twarp_ore
setvar $ore_required 0
setvar $ore_short 0
setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

getdistance $dist1 $player~current_sector $map~stardock
getdistance $dist2 $map~stardock $player~current_sector

if ($player~current_sector <> $map~stardock)
	if ($dist1 <= 0)
		setvar $switchboard~message "Insufficient warp data plotting course to StarDock for makeplanet.*"
		gosub :switchboard~switchboard
		setvar $failed 1
		return
	end

	if ($dist2 <= 0)
		setvar $switchboard~message "Insufficient warp data plotting return course from StarDock for makeplanet.*"
		gosub :switchboard~switchboard
		setvar $failed 1
		return
	end
end

setvar $ore_required (($dist1 + $dist2) * 3)
if ($player~ore_holds < $ore_required)
	setvar $ore_short ($ore_required - $player~ore_holds)
end

return

:warp
send $warp~dest "*"

settextlinetrigger makeplanet_warp_arrived :warp_arrived "You are already in that sector!"
settextlinetrigger makeplanet_warp_begin :warp_begin "<Move>"
pause

:warp_begin
killtrigger makeplanet_warp_arrived
settexttrigger makeplanet_warp_start :warp_start "Engage the Autopilot?"
settexttrigger makeplanet_warp_twarp :warp_twarp "Do you want to engage"
settextlinetrigger makeplanet_warp_single :warp_single "Sector  :"
pause

:warp_twarp
send "n"

:warp_start
send "e"

:warp_single
killtrigger makeplanet_warp_start
killtrigger makeplanet_warp_twarp
killtrigger makeplanet_warp_single

setvar $warp_stopprompt 1
setvar $warp_mineprompt 1

:warp_mid
killtrigger makeplanet_warp_tollfigs
killtrigger makeplanet_warp_figs
killtrigger makeplanet_warp_stopprompt
killtrigger makeplanet_warp_minesprompt
killtrigger makeplanet_warp_nextsector
killtrigger makeplanet_warp_arrived
settextlinetrigger makeplanet_warp_nextsector :warp_nextsector "Sector  :"
settextlinetrigger makeplanet_warp_tollfigs :warp_tollfigs "You have to destroy the fighters or pay"
settextlinetrigger makeplanet_warp_figs :warp_figs "You have to destroy the fighters to remain"
settexttrigger makeplanet_warp_stopprompt :warp_stopprompt "Stop in this sector"
settexttrigger makeplanet_warp_minesprompt :warp_minesprompt "Mined Sector:"
settexttrigger makeplanet_warp_arrived :warp_arrived "Command [TL="
pause

:warp_nextsector
setvar $warp_stopprompt 1
setvar $warp_mineprompt 1
goto :warp_mid

:warp_tollfigs
if ($move~attack = 3)
	send "py"
else
	send "a9999*"
end
goto :warp_mid

:warp_figs
send "a9999*"
goto :warp_mid

:warp_stopprompt
if ($warp_stopprompt)
	send "n"
	setvar $warp_stopprompt 0
end
goto :warp_mid

:warp_minesprompt
if ($warp_mineprompt)
	send "n"
	setvar $warp_mineprompt 0
end
goto :warp_mid

:warp_arrived
killtrigger makeplanet_warp_begin
killtrigger makeplanet_warp_start
killtrigger makeplanet_warp_twarp
killtrigger makeplanet_warp_single
killtrigger makeplanet_warp_nextsector
killtrigger makeplanet_warp_tollfigs
killtrigger makeplanet_warp_figs
killtrigger makeplanet_warp_stopprompt
killtrigger makeplanet_warp_minesprompt
killtrigger makeplanet_warp_arrived
return

# includes:

include "source\include\move"
include "source\include\loadvars"
include "source\include\findproduct"
include "source\include\haggle"
include "source\include\planetnames"
include "source\include\help"
include "source\include\switchboard.ts"
