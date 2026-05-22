# MD Planet Stripper
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "strip"
loadvar $bot~bot_turn_limit

setvar $help~help[1]  $help~tab&"Strips planets of resources and places them on starting planet.  "
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"Options:"
setvar $help~help[4]  $help~tab&"[planet# | all]   - Planet number or all to strip all planets in sector."
setvar $help~help[5]  $help~tab&"            {f}   - Strip fuel ore"
setvar $help~help[6]  $help~tab&"            {o}   - Strip organics"
setvar $help~help[7]  $help~tab&"            {e}   - Strip equipment"
setvar $help~help[8]  $help~tab&"           {fc}   - Strip fuel ore colonists"
setvar $help~help[9]  $help~tab&"           {oc}   - Strip organic colonists"
setvar $help~help[10] $help~tab&"           {ec}   - Strip equipment colonists"
setvar $help~help[11] $help~tab&"          {fig}   - Strip fighters"
setvar $help~help[12] $help~tab&"     "
setvar $help~help[13] $help~tab&"          Originally written by Mind Dagger"
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	setvar $switchboard~message "Planet Stripper must be started from Citadel or Planet prompt*"
	gosub :switchboard~switchboard
	halt
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

getwordpos " "&$bot~user_command_line&" " $pos " fig "
if ($pos > 0)
	setvar $emptyfighters true
else
	setvar $emptyfighters false
end

getwordpos " "&$bot~user_command_line&" " $pos " figs "
if ($pos > 0)
	setvar $emptyfighters true
end

getwordpos " "&$bot~user_command_line&" " $pos " sh"
if ($pos > 0)
	setvar $emptyshields true
else
	setvar $emptyshields false
end

getwordpos " "&$bot~user_command_line&" " $pos " silent "
if ($pos > 0)
	setvar $switchboard~self_command true
end

if ($startinglocation = "Citadel")
	send "q "
end

gosub :planet~getplanetinfo
send "q ** jy "
gosub :player~quikstats

if (sector.planetcount[$player~current_sector] <= 1)
	setvar $switchboard~message "This script must be run with at least two planets in the sector*"
	gosub :switchboard~switchboard
	send "l "&$planet~planet&"* "
	if ($startinglocation = "Citadel")
		send "c "
	end
	halt
end
gosub :countplanets

setvar $planet~planettofill $planet~planet
if ($bot~parm1 <> "all")
	setvar $planet~planetcount 1
	setvar $planet~planets[1] $bot~parm1
end
setvar $switchboard~message "Planet Stripper Powering Up!  Filling Planet "&$planet~planettofill&"*"
gosub :switchboard~switchboard

setvar $i 1
setvar $countfuel 0
setvar $countorganics 0
setvar $countequipment 0
setvar $countcolonists 0

send "l "&$planet~planettofill&"*"
killtrigger wrongplanet
killtrigger badplanet
killtrigger goodplanet
settextlinetrigger wrongplanet :badplanet "That planet is not in this sector."
settextlinetrigger badplanet :badplanet "Invalid registry number, landing aborted."
settextlinetrigger goodplanet :goodplanet "Claimed by:"
pause

:badplanet
killtrigger wrongplanet
killtrigger badplanet
killtrigger goodplanet
send "q*"
setvar $switchboard~message "Planet #"&$planet~planettofill&" is not valid for this sector*"
gosub :switchboard~switchboard
halt

:goodplanet
killtrigger wrongplanet
killtrigger badplanet
if ($emptyfighters)
	send "m*l* "
end
send " q "

logging off
gosub :player~enter_menu_deaf

while ($i <= $planet~planetcount)
	if ($planet~planettofill <> $planet~planets[$i])
		echo "*Stripping Planet " &$planet~planets[$i]&"...*"
		send "l "&$planet~planets[$i]&"*   "
		gosub :planet~getplanetinfo
		send " q j y "

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

		:tryfighters
		if ($emptyfighters)
			killtrigger success
			killtrigger emptyempty
			killtrigger fullfill
			killtrigger empty
			send "l j"&#8&$planet~planets[$i]&"* jm ** *x q l j"&#8&$planet~planettofill&"* jm*jl*x q "
			settexttrigger success :tryfighters "The Fighters join your battle force."
			settexttrigger emptyempty :donewiththisplanet "There isn't room on the planet"
			settexttrigger fullfill :donewiththisplanet "They don't have room for that many "
			settexttrigger empty :donewiththisplanet "How many Fighters do you want to take (0 Max) [0]"
			pause
		end

		:donewiththisplanet
	end
	add $i 1
end

:lookupplanetstats2
gosub :player~quikstats
send "l "&$planet~planettofill&"*jm ** * "
killalltriggers
settextlinetrigger wrongplanet :badplanet2 "That planet is not in this sector."
settextlinetrigger badplanet :badplanet2 "Invalid registry number, landing aborted."
settextlinetrigger goodplanet :goodplanet2 "Claimed by:"
pause

:badplanet2
killalltriggers
send "q*"
setvar $switchboard~message "Planet #"&$planet~planettofill&" is not valid for this sector*"
gosub :switchboard~switchboard
halt

:goodplanet2
killalltriggers
send "q "
send "l "&$planet~planettofill&"*m* * * c * "
gosub :player~exit_menu_deaf
logging on
gosub :endreport
send "/"
waiton #179
setvar $switchboard~message "Planet Stripper Shutting Down*"
gosub :switchboard~switchboard
halt

:clearscreen
echo #27 & "[2J"
return

:stripcategory
setvar $player~turns ($player~turns-1)
setvar $count 0
gosub :player~quikstats

:again
setvar $loop 0
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

setvar $rounds ($amount_to_strip / $player~total_holds)
if ($rounds < 1)
	setvar $rounds 1
end
setvar $extra ($amount_to_strip - ($player~total_holds * $rounds))

setvar $macro "l j"&#8&$planet~planets[$i]&"* j"&$type&"* jt"&$category&$get&"* x q l j"&#8&$planet~planettofill&"* j"&$type&"* jl"&$category&"* x q "
#send $macro
setvar $loop 0
settexttrigger empty         :done     "There aren't that many "
settexttrigger full          :empty    "They don't have room for that many "
settexttrigger empty_colos   :switch    "There isn't room on the planet"

setvar $loop 0

:strip_loop
if ($loop >= $rounds)
	goto :move_extra
end
send $macro
add $loop 1
goto :strip_loop

:move_extra
if ($extra > 0)
	send $macro "l j"&#8&$planet~planets[$i]&"* j"&$type&"* jt"&$category&$extra&"* x q l j"&#8&$planet~planettofill&"* j"&$type&"* jl"&$category&"* x q "
end
goto :done

:switch
killalltriggers
add $category 1
if ($category >= 4)
	goto :again
else
	send $macro
end
goto :again

:empty
killalltriggers
send "q q * * j y "

:done
killalltriggers
return

:countplanets
setvar $planet~planetcount 0
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
settextlinetrigger bedone :done "Land on which planet "
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
settextlinetrigger getend :done "Land on which planet "
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

setvar $switchboard~message "Planet Stripper - Completion Report*"
if ($emptyfuel)
	setvar $switchboard~message $switchboard~message&"  Fuel Ore  Moved: "&$formattedcountfuel&" Holds*"
end
if ($emptyorganics)
	setvar $switchboard~message $switchboard~message&"  Organics  Moved: "&$formattedcountorganics&" Holds*"
end
if ($emptyequipment)
	setvar $switchboard~message $switchboard~message&"  Equipment Moved: "&$formattedcountequipment&" Holds*"
end
if ($emptyfuelcolonists or $emptyorganiccolonists or $emptyequipmentcolonists)
	setvar $switchboard~message $switchboard~message&"  Colonists Moved: "&$formattedcountcolonists&" Holds*"
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
include "source\include\player.ts"
