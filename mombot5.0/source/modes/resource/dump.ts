# MD Planet Dumper
reqrecording
logging off
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "dump"
loadvar $bot~bot_turn_limit

setvar $help~help[1]  $help~tab&"Dump resources from planet quickly and jettisons them  "
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"Options:"
setvar $help~help[4]  $help~tab&"[planet# | all]   - Planet number or all to strip all planets in sector."
setvar $help~help[5]  $help~tab&"            {f}   - Dump fuel ore"
setvar $help~help[6]  $help~tab&"            {o}   - Dump organics"
setvar $help~help[7]  $help~tab&"            {e}   - Dump equipment"
setvar $help~help[8]  $help~tab&"           {fc}   - Dump fuel ore colonists"
setvar $help~help[9]  $help~tab&"           {oc}   - Dump organic colonists"
setvar $help~help[10] $help~tab&"           {ec}   - Dump equipment colonists"
setvar $help~help[11] $help~tab&"          {fig}   - Dump fighters"
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Planet") and ($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Planet Dumper must be started from Command, Planet, or Citadel prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "q "
end
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q "
end

isnumber $test $bot~parm1
if (($test = false) and ($bot~parm1 <> "all"))
	setvar $switchboard~message "Invalid planet. Please enter a planet number or 'all'.*"
	gosub :switchboard~switchboard
	halt
end
getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $emptyfuel true
else
	setvar $emptyfuel false
end
getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $emptyorganics true
else
	setvar $emptyorganics false
end
getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $emptyequipment true
else
	setvar $emptyequipment false
end

getwordpos " "&$bot~user_command_line&" " $pos " c1 "
if ($pos > 0)
	setvar $emptyfuelcolonists true
end
getwordpos " "&$bot~user_command_line&" " $pos " c2 "
if ($pos > 0)
	setvar $emptyorganiccolonists true
end
getwordpos " "&$bot~user_command_line&" " $pos " c3 "
if ($pos > 0)
	setvar $emptyequipmentcolonists true
end
getwordpos " "&$bot~user_command_line&" " $pos " fc "
if ($pos > 0)
	setvar $emptyfuelcolonists true
end
getwordpos " "&$bot~user_command_line&" " $pos " oc "
if ($pos > 0)
	setvar $emptyorganiccolonists true
end
getwordpos " "&$bot~user_command_line&" " $pos " ec "
if ($pos > 0)
	setvar $emptyequipmentcolonists true
end

getwordpos " "&$bot~user_command_line&" " $pos " silent "
if ($pos > 0)
	setvar $switchboard~self_command true
end

send "jy* * "
gosub :player~quikstats

setvar $player~total_holds $player~total_holds

if (sector.planetcount[$player~current_sector] <= 0)
	setvar $switchboard~message "This script must be run with at least one planets in the sector*"
	gosub :switchboard~switchboard
	if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
		send "l "&$startingplanet&"* "
	end
	if ($startinglocation = "Citadel")
		send "c "
	end
	halt
end
gosub :countplanets

:startupmessage
if ($bot~parm1 <> "all")
	setvar $planet~planetcount 1
	setvar $planet~planets[1] $bot~parm1
end
setvar $switchboard~message "Planet Dumper Powering Up!*"
gosub :switchboard~switchboard

:startfilling
setvar $i 1
setvar $countfuel 0
setvar $countorganics 0
setvar $countequipment 0
setvar $countcolonists 0

while ($i <= $planet~planetcount)
	gosub :player~quikstats
	send "l "&$planet~planets[$i]&"*   "
	gosub :planet~getplanetinfo
	send " q "

	if ($emptyfuel)
		setvar $amount_to_strip $planet~planet_fuel
		setvar $category 1
		setvar $type "t"
		gosub :stripcategory
		add $countfuel $count
	end
	if ($emptyorganics)
		setvar $amount_to_strip $planet~planet_organics
		setvar $category 2
		setvar $type "t"
		gosub :stripcategory
		add $countorganics $count
	end
	if ($emptyequipment)
		setvar $amount_to_strip $planet~planet_equipment
		setvar $category 3
		setvar $type "t"
		gosub :stripcategory
		add $countequipment $count
	end
	if ($emptyfuelcolonists)
		setvar $amount_to_strip $planet~planet_fuel_colonists
		setvar $category 1
		setvar $type "s"
		gosub :stripcategory
		add $countcolonists $count
	end
	if ($emptyorganiccolonists)
		setvar $amount_to_strip $planet~planet_organics_colonists
		setvar $category 2
		setvar $type "s"
		gosub :stripcategory
		add $countcolonists $count
	end
	if ($emptyequipmentcolonists)
		setvar $amount_to_strip $planet~planet_equipment_colonists
		setvar $category 3
		setvar $type "s"
		gosub :stripcategory
		add $countcolonists $count
	end

	:donewiththisplanet
	add $i 1
end

:lookupplanetstats2
gosub :player~quikstats
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	send "l "&$startingplanet&"* "
end
if ($startinglocation = "Citadel")
	send "c "
end
gosub :endreport
send "/"
waiton #179
setvar $switchboard~message "Planet Dumper Shutting Down*"
gosub :switchboard~switchboard
halt

:clearscreen
echo #27 & "[2J"
return

:stripcategory
setvar $player~turns ($player~turns-1)
setvar $count 0
setvar $loop 0

:again
killtrigger success
killtrigger empty
killtrigger full
killtrigger success_colos
killtrigger empty_colos

if ($player~turns <= $bot~bot_turn_limit)
	goto :lookupplanetstats2
end
if (($player~total_holds > $amount_to_strip) and ($amount_to_strip > 0))
	setvar $get $amount_to_strip
else
	if ($amount_to_strip <= 0)
		setvar $get 0
	else
		setvar $get $player~total_holds
	end
end
add $count $get
setvar $amount_to_strip ($amount_to_strip - $get)
if ($get <= 0)
	goto :done
end
setvar $macro "l j"&#8&$planet~planets[$i]&"* j"&$type&"* jt"&$category&$get&"* x q jy"
settexttrigger empty         :done     "There aren't that many "
send $macro
add $loop 1
goto :again

:empty
send "jy "

:done
killtrigger success
killtrigger empty
killtrigger full
killtrigger success_colos
killtrigger empty_colos
return

:countplanets
setvar $planet~planetcount 0
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
setslinetrigger bedone :done "Land on which planet "
send "lq*"
pause

:planetline
killalltriggers
getwordpos currentline $pos "<<<< SHIELDED"
if ($pos <= 0)
	setvar $line currentline
	replacetext $line "<" " "
	replacetext $line ">" " "
	striptext $line ","
	add $planet~planetcount 1
	getword $line $planet~planets[$planet~planetcount] 1
end
settextlinetrigger getline2 :planetline "   <"
setslinetrigger getend :done "Land on which planet "
pause

:done
return

:endreport
setvar $formattedcountfuel ""
getlength $countfuel $length
while ($length > 3)
	cuttext $countfuel $snippet $length-2 9999
	cuttext $countfuel $countfuel 1 $length-3
	getlength $countfuel $length
	setvar $formattedcountfuel ","&$snippet&$formattedcountfuel
end
setvar $formattedcountfuel $countfuel&$formattedcountfuel

setvar $formattedcountorganics ""
getlength $countorganics $length
while ($length > 3)
	cuttext $countorganics $snippet $length-2 9999
	cuttext $countorganics $countorganics 1 $length-3
	getlength $countorganics $length
	setvar $formattedcountorganics ","&$snippet&$formattedcountorganics
end
setvar $formattedcountorganics $countorganics&$formattedcountorganics

setvar $formattedcountequipment ""
getlength $countequipment $length
while ($length > 3)
	cuttext $countequipment $snippet $length-2 9999
	cuttext $countequipment $countequipment 1 $length-3
	getlength $countequipment $length
	setvar $formattedcountequipment ","&$snippet&$formattedcountequipment
end
setvar $formattedcountequipment $countequipment&$formattedcountequipment

setvar $formattedcountcolonists ""
getlength $countcolonists $length
while ($length > 3)
	cuttext $countcolonists $snippet $length-2 9999
	cuttext $countcolonists $countcolonists 1 $length-3
	getlength $countcolonists $length
	setvar $formattedcountcolonists ","&$snippet&$formattedcountcolonists
end
setvar $formattedcountcolonists $countcolonists&$formattedcountcolonists

setvar $switchboard~message "Planet Dumper - Completion Report*"
if ($emptyfuel)
	setvar $switchboard~message $switchboard~message&"  Fuel Ore Jettisoned: "&$formattedcountfuel&" Holds*"
end
if ($emptyorganics)
	setvar $switchboard~message $switchboard~message&"  Organics Jettisoned: "&$formattedcountorganics&" Holds*"
end
if ($emptyequipment)
	setvar $switchboard~message $switchboard~message&"  Equipment Jettisoned: "&$formattedcountequipment&" Holds*"
end
if ($emptyfuelcolonists or $emptyorganiccolonists or $emptyequipmentcolonists)
	setvar $switchboard~message $switchboard~message&"  Colonists Jettisoned: "&$formattedcountcolonists&" Holds*"
end
if ($emptyfighters)
	setvar $switchboard~message $switchboard~message&"  All possible fighters stripped and placed on planet*"
end
if ($player~unlimitedgame <> true)
	if ($player~turns <= $bot~bot_turn_limit)
		setvar $switchboard~message $switchboard~message&"  Turns too low to continue. (Turn limit: "&$bot~bot_turn_limit&"*"
	end
end
if ($switchboard~self_command <> true)
	setvar $switchboard~self_command 2
end
gosub :switchboard~switchboard
return

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
