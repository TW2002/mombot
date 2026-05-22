gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Visits sectors in list and farms the planets there."
setvar $help~help[2] $help~tab&"Default will visit all planets on the tl list."
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&"  Usage: farm {set} {clear} {list}"
setvar $help~help[5] $help~tab&"       "
setvar $help~help[6] $help~tab&"Options:"
setvar $help~help[7] $help~tab&"   {set} {sector1} {sector2} {...} {sectorx}"
setvar $help~help[8] $help~tab&"       Puts sectors in the order entered into the farm file."
setvar $help~help[9] $help~tab&"   {clear}"
setvar $help~help[10] $help~tab&"       Deletes the farm file."
setvar $help~help[11] $help~tab&"   {list}"
setvar $help~help[12] $help~tab&"       Shows all sectors in the farm file in order."
gosub :help~helpfile

setvar $farmer_file $bot~folder&"/_"&gamename&"_FARMER.list"

getwordpos $bot~user_command_line $pos "silent"
if ($pos > 0)
	setvar $silent true
else
	setvar $silent false
end

getwordpos $bot~parm1 $pos "clear"
if ($pos > 0)
	delete $farmer_file
	setvar $switchboard~message "Bot Farming File has been deleted.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~parm1 $pos "list"
if ($pos > 0)
	fileexists $test $farmer_file
	if ($test)
		readtoarray $farmer_file $sector
		setvar $i 1
		setvar $list_output ""
		while ($i < $sector)
			setvar $list_output $list_output&$sector[$i]&","
			add $i 1
		end
		setvar $list_output $list_output&$sector[$i]
		setvar $switchboard~message "Farming List (In traveling order) *"&$list_output&"**"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "No Farming File to list from.*"
		gosub :switchboard~switchboard
	end
	halt
end

getwordpos $bot~parm1 $pos "set"
if ($pos > 0)
	setvar $i 2
	getword $bot~user_command_line $check $i "%%%"
	while ($check <> "%%%")
		isnumber $test $check
		if ($test)
			if (($check > 0) and ($check <= sectors))
				write $farmer_file $check
			end
		end
		add $i 1
		getword $bot~user_command_line $check $i "%%%"
	end
	setvar $switchboard~message ""&($i - 2)&" Sectors added to Bot Farming File.*"
	gosub :switchboard~switchboard
	halt
end

setvar $i 1
setarray $planets 3000
gosub :player~quikstats

if ($player~planet_scanner = "No")
	setvar $switchboard~message "Planet Farmer must be run with a planet scanner.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Planet Farmer must be run from the Citadel Prompt.*"
	gosub :switchboard~switchboard
	halt
end

fileexists $test $farmer_file
if ($test)
	setvar $switchboard~message "Loading Planet List From Farming File...*"
	gosub :switchboard~switchboard
	readtoarray $farmer_file $sector
else
	setvar $sector sectors
	setarray $sector sectors
	setvar $switchboard~message "No Farming File, Loading Planet List...*"
	gosub :switchboard~switchboard
	gosub :get_tl_list
end

setvar $switchboard~message "Planet List Loaded, starting the farming!*"
gosub :switchboard~switchboard

logging off
setvar $startinglocation $player~current_sector
gosub :planet_info

:start
killalltriggers
goto :move_the_planet

:get_tl_list
setvar $sectorcount 0
killalltriggers
gosub :setconnectiontriggers
settextlinetrigger sectorgrabber :sector_planet_line "Class "
settextlinetrigger sectorbedone :sector_done "======   ============"
send "xlq"
pause

:sector_planet_line
killalltriggers
add $sectorcount 1
getword currentline $testsector 1
setvar $sector[$sectorcount] $testsector
gosub :setconnectiontriggers
settextlinetrigger getline2 :sector_planet_line "Class"
settextlinetrigger getend :sector_done "======   ============"
pause

:sector_done
send "@"
setvar $sector $sectorcount
gosub :setconnectiontriggers
waiton "Average Interval Lag:"

return

:planet_info
send "qd"
gosub :setconnectiontriggers
waiton "Planet #"
getword currentline $planet~planet 2
striptext $planet~planet "#"
send "snl1*snl2*snl3*tnl1*tnl2*tnl3*  q  j  y  l " $planet~planet "*  c"
return

:move_the_planet
setvar $i 1

:inac
:tryagain
while ($i <= $sector)
	while (($sector[$i] <= 0) and ($i <= $sector))
		add $i 1
		if ($i > $sector)
			goto :end
		end
	end

	send "p "&$sector[$i]&"  *ys* "
	gosub :setconnectiontriggers
	settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
	settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
	settextlinetrigger alreadythere :warp_it "You are already in that sector!"
	pause

	:no_warp
	killalltriggers
	add $i 1
	goto :tryagain

	:warp_it
	killalltriggers
	gosub :count_planets
	gosub :stripallplanets
	if ($silent <> true)
		setvar $switchboard~message "Done farming sector " $sector[$i] ".*"
		gosub :switchboard~switchboard
	end
	send "q"
	gosub :planet~getplanetinfo
	send "c"
	add $i 1
	if (($planet~planet_organics > ($planet~planet_organics_max - 1000)) and ($planet~planet_equipment > ($planet~planet_equipment_max - 1000)))
		setvar $planetisfull true
		goto :end
	end
end
goto :end

:count_planets
send "q  q  q  z  n  *|l"
gosub :setconnectiontriggers
waiton "Registry# and Planet Name"
setvar $planetcount 0
killalltriggers
gosub :setconnectiontriggers
settextlinetrigger planetgrabber :planetline "   <"
settextlinetrigger bedone :done "Land on which planet "
settextlinetrigger noplanets :done "You can create one with a Genesis Torpedo."
send "q* |"
pause

:planetline
killalltriggers
setvar $line currentline
replacetext $line "<" " "
replacetext $line ">" " "
striptext $line ","
add $planetcount 1
getword $line $planets[$planetcount] 1
gosub :setconnectiontriggers
settextlinetrigger getline2 :planetline "   <"
settextlinetrigger getend :done "Land on which planet "
pause

:done
killalltriggers
return

:stripallplanets
setvar $j 1
send "q q * * jy * "
while ($j <= $planetcount)
	if ($planet~planet <> $planets[$j])

		:tryfuel
		killalltriggers

		send "l j "&#8&#8&$planets[$j]&"* * "
		settexttrigger noplanet :donewiththisplanet "That planet is not in this sector."
		settexttrigger planethere :continuefuel "Planet command (?=help)"
		pause

		:continuefuel
		killalltriggers
		send "tnt1*q l "&$planet~planet&"* tnl1*q "
		gosub :setconnectiontriggers
		settexttrigger fuelsuccess :tryfuel "You load the "
		settexttrigger fuelempty :emptyfuel "There aren't that many "
		settexttrigger fuelfull :emptyfuel "They don't have room for that many "
		pause

		:emptyfuel
		send "l "&$planets[$j]&"* tnl1*q jy "
		send "@"
		waiton "Average Interval Lag:"

		:tryorganics
		killalltriggers

		send "l "&$planets[$j]&"* tnt2*q l "&$planet~planet&"* tnl2*q "
		gosub :setconnectiontriggers
		settexttrigger success :tryorganics "You load the "
		settexttrigger emptyempty :emptyorganics "There aren't that many "
		settexttrigger fullfill :emptyorganics "They don't have room for that many "
		pause

		:emptyorganics
		send "l "&$planets[$j]&"* tnl2*q jy "
		send "@"
		waiton "Average Interval Lag:"

		:tryequipment
		killalltriggers

		send "l "&$planets[$j]&"* tnt3*q l "&$planet~planet&"* tnl3*q "
		gosub :setconnectiontriggers
		settexttrigger success :tryequipment "You load the "
		settexttrigger emptyempty :emptyequipment "There aren't that many "
		settexttrigger fullfill :emptyequipment "They don't have room for that many "
		pause

		:emptyequipment
		send "l "&$planets[$j]&"* tnl3*q jy "
		send "@"
		waiton "Average Interval Lag:"

		:tryfuelcolonists
		killalltriggers
		if ($emptyfuelcolonists)
			send "l "&$planets[$j]&"* snt1*q l "&$planet~planet&"* snl"&$colotype&"*q "
			gosub :setconnectiontriggers
			settexttrigger success :tryfuelcolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchfuel "There isn't room on the planet"
			settexttrigger fullfill :tryorganiccolonists "They don't have room for that many "
			settexttrigger empty :tryorganiccolonists "There aren't that many on the planet!"
			pause

			:switchfuel
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryfuelcolonists
		end

		:tryorganiccolonists
		killalltriggers
		if ($emptyorganiccolonists)
			send "l "&$planets[$j]&"* snt2*q l "&$planet~planet&"* snl"&$colotype&"*q "
			gosub :setconnectiontriggers
			settexttrigger success :tryorganiccolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchorganics "There isn't room on the planet"
			settexttrigger fullfill :tryequipmentcolonists "They don't have room for that many "
			settexttrigger empty :tryequipmentcolonists "There aren't that many on the planet!"
			pause

			:switchorganics
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryorganiccolonists
		end

		:tryequipmentcolonists
		killalltriggers
		if ($emptyequipmentcolonists)
			send "l "&$planets[$j]&"* snt3*q l "&$planet~planet&"* snl"&$colotype&"*q "
			gosub :setconnectiontriggers
			settexttrigger success :tryequipmentcolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchequipment "There isn't room on the planet"
			settexttrigger fullfill :tryfighters "They don't have room for that many "
			settexttrigger empty :tryfighters "There aren't that many on the planet!"
			pause

			:switchequipment
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryfighters
		end

		:tryfighters
		killalltriggers
		send "l "&$planets[$j]&"* m***q l "&$planet~planet&"* m*l* q "
		gosub :setconnectiontriggers
		waiton "Do you wish to (L)eave or (T)ake Fighters? [T]"
		waiton " Max) ["
		getword currentline $figstograb 9
		striptext $figstograb "("
		if ($figstograb < 100)
			goto :donewiththisplanet
		end
		goto :tryfighters

		:donewiththisplanet
		killalltriggers
	end

	add $j 1
end
send "l "&$planet~planet&"* c"
return

:end
killalltriggers
send "p "&$startinglocation&"  *ys* "
if ($planetisfull)
	setvar $switchboard~message "Farming Planet is full.  Ready to sell off the product!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Farming run is complete.*"
	gosub :switchboard~switchboard
end
gosub :player~quikstats
if ($player~current_sector <> $startinglocation)
	setvar $switchboard~message "Could not make it back to starting sector!*"
	gosub :switchboard~switchboard
end
halt

:discod
setvar $tagline "[Farmer]"
setvar $taglineb "[Farmer]"
killalltriggers
echo "**"&ansi_14&$taglineb&ansi_15&" Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger emancipate_cpu :emancipate_cpu 3000
	echo "**"&ansi_14&$taglineb&ansi_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger waitingabit :waitingabit 3000
echo "**"&ansi_14&$taglineb&ansi_15&" Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	send " L Z"&#8&$planet~planet&"*  *  J  C  *  "
	settextlinetrigger notlanded :notlanded "Are you sure you want to jettison all cargo?"
	settextlinetrigger landed :landed "<Enter Citadel>"
	setdelaytrigger testconn :testconn 3000
	pause

	:testconn
	killalltriggers
	if (connected = false)
		goto :disco_test
	else
		setvar $switchboard~message ""&$taglineb&" Problem Detected Unable to Land!*"
		gosub :switchboard~switchboard
		halt
	end

	:notlanded
	killalltriggers
	setvar $switchboard~message "Boton Unable To Land, Check my TA.*"
	gosub :switchboard~switchboard
	setvar $switchboard~message $taglineb&" - Unable To Land After Reconnect,Check My TA!**"
	gosub :switchboard~switchboard
	halt

	:landed
	killalltriggers
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
else
	send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$taglineb&"Attempting to Reach Correct Prompt...*"
	settextlinetrigger emq_complete :emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger emq_delay :emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

:setconnectiontriggers
killtrigger discod1
killtrigger discod2
seteventtrigger discod1 :discod "CONNECTION LOST"
seteventtrigger discod2 :discod "Connections have been temporarily disabled."

return

include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard.ts"
