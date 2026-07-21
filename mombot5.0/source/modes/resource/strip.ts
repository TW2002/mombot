# MD Planet Stripper
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "strip"
loadvar $bot~bot_turn_limit

setvar $help~help[1]  $help~tab&"Strips planets of resources and places them on starting planet.  "
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"Usage: strip [planet# | all]  {options}"
setvar $help~help[4]  $help~tab&"  "
setvar $help~help[5]  $help~tab&"       Options:"
setvar $help~help[6]  $help~tab&"            {f}   - Strip fuel ore"
setvar $help~help[7]  $help~tab&"            {o}   - Strip organics"
setvar $help~help[8]  $help~tab&"            {e}   - Strip equipment"
setvar $help~help[9]  $help~tab&"           {fc}   - Strip fuel ore colonists"
setvar $help~help[10] $help~tab&"           {oc}   - Strip organic colonists"
setvar $help~help[11] $help~tab&"           {ec}   - Strip equipment colonists"
setvar $help~help[12] $help~tab&"          {fig}   - Strip fighters"
setvar $help~help[13] $help~tab&"           {sh}   - Strip shields"
setvar $help~help[14] $help~tab&"          {all}   - Strip everything"
setvar $help~help[15] $help~tab&"       {silent}   - Silence comms"
setvar $help~help[16] $help~tab&"         {deaf}   - Hide display while moving products"
setvar $help~help[17] $help~tab&"     "
setvar $help~help[18] $help~tab&"          Originally written by Mind Dagger"
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

setvar $prodstostrip false

getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $planet~emptyfuel true
	setvar $prodstostrip true
else
	setvar $planet~emptyfuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $planet~emptyorganics true
	setvar $prodstostrip true
else
	setvar $planet~emptyorganics false
end

getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $planet~emptyequipment true
	setvar $prodstostrip true
else
	setvar $planet~emptyequipment false
end

getwordpos " "&$bot~user_command_line&" " $pos " c1 "
getwordpos " "&$bot~user_command_line&" " $pos2 " fc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfuelcolos true
	setvar $prodstostrip true
else
	setvar $planet~emptyfuelcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c2 "
getwordpos " "&$bot~user_command_line&" " $pos2 " oc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyorgcolos true
	setvar $prodstostrip true
else
	setvar $planet~emptyorgcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c3 "
getwordpos " "&$bot~user_command_line&" " $pos2 " ec "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyequcolos true
	setvar $prodstostrip true
else
	setvar $planet~emptyequcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " fig "
getwordpos " "&$bot~user_command_line&" " $pos2 " figs "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfigs true
	setvar $prodstostrip true
else
	setvar $planet~emptyfigs false
end

getwordpos " "&$bot~user_command_line&" " $pos " sh "
if ($pos > 0)
	setvar $planet~emptyshields true
	setvar $prodstostrip true
else
	setvar $planet~emptyshields false
end

if ($bot~parm2 = "all")
	setvar $planet~emptyfuel true
	setvar $planet~emptyorganics true
	setvar $planet~emptyequipment true
	setvar $planet~emptyfuelcolos true
	setvar $planet~emptyorgcolos true
	setvar $planet~emptyequcolos true
	setvar $planet~emptyfigs true
	setvar $planet~emptyshields true
	setvar $prodstostrip true
end

if ($prodstostrip = false)
	setvar $switchboard~message "Please select at least one item to strip.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " silent "
if ($pos > 0)
	setvar $switchboard~self_command true
end

getwordpos " "&$bot~user_command_line&" " $pos " deaf "
if ($pos > 0)
	setvar $deaf true
else
	setvar $deaf false
end

if ($startinglocation = "Citadel")
	send "q"
end

gosub :planet~getplanetinfo
setvar $startingplanet $planet~planet
send "q ** jy "
gosub :player~quikstats

setvar $planet~planettofill $planet~planet
if ($bot~parm1 <> "all")
	setvar $planet~planetcount 1
	setvar $planet~planets[1] $bot~parm1
else
	gosub :planet~countplanets
	if ($planet~planetcount < 2)
		setvar $switchboard~message "This script must be run with at least two planets in the sector*"
		gosub :switchboard~switchboard
		halt
	end
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

logging off
if ($deaf = true)
	gosub :player~enter_menu_deaf
end

send "q *"
gosub :sector~voidadjacent
send "l " &$planet~planettofill&"*"

while ($i <= $planet~planetcount)
	if ($planet~planettofill <> $planet~planets[$i])
		if ($deaf = true)
			echo "*Stripping Planet " &$planet~planets[$i]&"...*"
		end
		send "q * l "&$planet~planettofill&"*"
		#setvar $planet~noheader 1
		setvar $planet~planettostrip $planet~planets[$i]
		gosub :planet~stripplanet
		add $countfuel $planet~countfuel
		add $countorganics $planet~countorganics
		add $countequipment $planet~countequipment
		add $countcolonists $planet~countcolonists
	end
	add $i 1
end

:strip_done
logging on
if ($deaf = true)
	gosub :player~enter_menu_deaf
end
send "q q q * * "

gosub :sector~clearvoidadjacent

setvar $planet~planet $startingplanet
if ($startinglocation = "Citadel")
	gosub :planet~landonplanetentercitadel
else
	send "l "&$planet~planet&"*"
end
gosub :player~quikstats
gosub :endreport

setvar $switchboard~message "Planet Stripper Shutting Down*"
gosub :switchboard~switchboard
halt

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
if ($planet~emptyfuel)
	setvar $switchboard~message $switchboard~message&"  Fuel Ore  Moved: "&$formattedcountfuel&" Holds*"
end
if ($planet~emptyorganics)
	setvar $switchboard~message $switchboard~message&"  Organics  Moved: "&$formattedcountorganics&" Holds*"
end
if ($planet~emptyequipment)
	setvar $switchboard~message $switchboard~message&"  Equipment Moved: "&$formattedcountequipment&" Holds*"
end
if ($planet~emptyfuelcolonists or $planet~emptyorganiccolonists or $planet~emptyequipmentcolonists)
	setvar $switchboard~message $switchboard~message&"  Colonists Moved: "&$formattedcountcolonists&" Holds*"
end
if ($planet~emptyfighters)
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
include "source\include\sector.ts"
