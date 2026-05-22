# MD Planet Stripper
#Turn off logging to speed up script while running
logging off

###STEP 1 - LOAD any bot variables that your bot module will need.###
#User's bot name#
loadvar $bot_name

#TRUE/FALSE Whether bot is loaded in an unlimited turns game#
loadvar $unlimitedgame

#Number of turns that user has put turn limit to#
loadvar $bot_turn_limit

#The entire command line as entered by the user ex. "strip all f"#
loadvar $user_command_line

#The first parameter of the command line ex. "all"#
loadvar $parm1

#The second parameter of the command line#
loadvar $parm2

#and so on...#
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
###END STEP 1###

#QUIKSTATS grabs current prompt as well as all stats from the / key#
gosub :quikstats
setvar $startinglocation $current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	setvar $switchboard~message "Planet Stripper must be started from Citadel or Planet prompt*"
	gosub :switchboard~switchboard
	halt
end

###STEP 2 - REPLACE menu - Take out any menu code from old script, and replace with bot parameters.###

###PRE-BOT CODE###
#	:menu_info
#	loadVar $MDProductMoverSaved
#	if ($MDProductMoverSaved)
#		loadVar $emptyFuel
#		loadVar $emptyOrganics
#		loadVar $emptyEquipment
#		loadVar $emptyFuelColonists
#		loadVar $emptyOrganicColonists
#		loadVar $emptyEquipmentColonists
#	else
#		setVar $emptyFuel FALSE
#		setVar $emptyOrganics FALSE
#		setVar $emptyEquipment FALSE
#		setVar $emptyFuelColonists FALSE
#		setVar $emptyOrganicColonists FALSE
#		setVar $emptyEquipmentColonists FALSE
#
#		saveVar $emptyFuel
#		saveVar $emptyOrganics
#		saveVar $emptyEquipment
#		saveVar $emptyFuelColonists
#		saveVar $emptyOrganicColonists
#		saveVar $emptyEquipmentColonists
#
#		setVar $MDProductMoverSaved TRUE
#		saveVar $MDProductMoverSaved
#	end
#
#	addMenu "" "MDProductMover" ANSI_14&"MD Planet Stripper Options"&ANSI_7 "." "" "Main" FALSE
#	addMenu "MDProductMover" "Go" ANSI_15&"Start Mover" "G" :Menu_Go "" TRUE
#	addMenu "MDProductMover" "Fill" ANSI_15&"Planet to Fill             " "1" :Menu_Fill "" False
#	addMenu "MDProductMover" "Empty" ANSI_15&"Planet(s) to Empty         " "2" :Menu_Empty "" False
#	addMenu "MDProductMover" "Fuel" ANSI_15&"  Fuel                     " "3" :Menu_Fuel "" FALSE
#	addMenu "MDProductMover" "Organics" ANSI_15&"  Organics                 " "4" :Menu_Organics "" FALSE
#	addMenu "MDProductMover" "Equipment" ANSI_15&"  Equipment                " "5" :Menu_Equipment "" FALSE
#	addMenu "MDProductMover" "FuelColonists" ANSI_15&"  Fuel Colonists           " "6" :Menu_FuelColonists "" FALSE
#	addMenu "MDProductMover" "OrganicColonists" ANSI_15&"  Organic Colonists        " "7" :Menu_OrganicColonists "" FALSE
#	addMenu "MDProductMover" "EquipmentColonists" ANSI_15&"  Equipment Colonists      " "8" :Menu_EquipmentColonists "" FALSE
#
#	setMenuHelp "Go" "Starts the script."
#	setVar $fillIndex 1
#	setVar $emptyIndex 0
#	gosub :sub_setmenu
#	setMenuOptions "MDProductMover" FALSE FALSE FALSE
#	echo ANSI_13
#	openMenu "MDProductMover"
#
#	:Menu_Fill
#		gosub :clearScreen
#		if ($fillIndex < $planetCount)
#			add $fillIndex 1
#		else
#			setVar $fillIndex 1
#		end
#		if ($emptyIndex = $fillIndex)
#		add $fillIndex 1
#		if ($fillIndex > $planetCount)
#			setVar $fillIndex 1
#		end
#	end
#	gosub :sub_setmenu
#	gosub :clearScreen
#	openMenu "MDProductMover"
#
#  .....Etc.
#  Another 50 lines of old menu code would follow this.
#  I commented the old code out for illustrative purposes, feel free to delete it.
###END PRE-BOT CODE###

###BOT COMMAND LINE CODE###

#If planet number is not a number or the keyword 'all' then quit#
isnumber $test $parm1
if (($test = false) and ($parm1 <> "all"))
	setvar $switchboard~message "Invalid planet. Please enter a planet number or 'all'.*"
	gosub :switchboard~switchboard
	halt
end

#Determines if a keyword exists in a user command line#

getwordpos " "&$user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $emptyfuel true
else
	setvar $emptyfuel false
end

getwordpos " "&$user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $emptyorganics true
else
	setvar $emptyorganics false
end

getwordpos " "&$user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $emptyequipment true
else
	setvar $emptyequipment false
end

getwordpos " "&$user_command_line&" " $pos " c1 "
if ($pos > 0)
	setvar $emptyfuelcolonists true
else
	setvar $emptyfuelcolonists false
end

getwordpos " "&$user_command_line&" " $pos " c2 "
if ($pos > 0)
	setvar $emptyorganiccolonists true
else
	setvar $emptyorganiccolonists false
end

getwordpos " "&$user_command_line&" " $pos " c3 "
if ($pos > 0)
	setvar $emptyequipmentcolonists true
else
	setvar $emptyequipmentcolonists false
end
getwordpos " "&$user_command_line&" " $pos " fc "
if ($pos > 0)
	setvar $emptyfuelcolonists true
else
	setvar $emptyfuelcolonists false
end
getwordpos " "&$user_command_line&" " $pos " oc "
if ($pos > 0)
	setvar $emptyorganiccolonists true
else
	setvar $emptyorganiccolonists false
end
getwordpos " "&$user_command_line&" " $pos " ec "
if ($pos > 0)
	setvar $emptyequipmentcolonists true
else
	setvar $emptyequipmentcolonists false
end

###END BOT COMMAND LINE CODE###

### The rest of this script is essentially the same code as the standalone script.  I added the bot name ###
### to all the subspace messages just because I like the bot to be consistent.  It is by no means        ###
### necessary.                                                                                           ###

### All you need to do to make your script a bot module/command is compile it and name it whatever you want it's ###
### command to be.  ex.  strip.cts for the command to be strip. Then place it within whatever category folder    ###
### makes the most sense.  In this case I put it in MOMBot/Modes/Resource                                        ###

if ($startinglocation = "Citadel")
	send "q "
end
gosub :getplanetinfo
send "q ** "
gosub :quikstats

if (sector.planetcount[$current_sector] <= 1)
	setvar $switchboard~message "This script must be run with at least two planets in the sector*"
	gosub :switchboard~switchboard
	send "l "&$planet&"* "
	if ($startinglocation = "Citadel")
		send "c "
	end
	halt
end
gosub :countplanets

:startupmessage
setvar $planettofill $planet
if ($parm1 <> "all")
	setvar $planetcount 1
	setvar $planets[1] $parm1
end
setvar $switchboard~message "Planet Stripper Powering Up!  Filling Planet "&$planettofill&"*"
gosub :switchboard~switchboard

:startfilling
setvar $i 1
setvar $countfuel 0
setvar $countorganics 0
setvar $countequipment 0
setvar $countcolonists 0
setvar $colotype 1

:lookupplanetstats
send "l "&$planettofill&"*"
killalltriggers
settextlinetrigger wrongplanet :badplanet "That planet is not in this sector."
settextlinetrigger badplanet :badplanet "Invalid registry number, landing aborted."
settextlinetrigger goodplanet :goodplanet "Claimed by:"
pause

:badplanet
killalltriggers
send "q*"
setvar $switchboard~message "Planet #"&$planettofill&" is not valid for this sector*"
gosub :switchboard~switchboard
halt

:goodplanet
killalltriggers
waiton "Fuel Ore"
getword currentline $currentfuelcolos 3
striptext $currentfuelcolos ","
setvar $currentfuel $planet_fuel
waiton "Organics"
getword currentline $currentorganiccolos 2
striptext $currentorganiccolos ","
setvar $currentorganics $planet_organics
waiton "Equipment"
getword currentline $currentequipmentcolos 2
striptext $currentequipmentcolos ","
setvar $currentequipment $planet_equipment
send "q "

while ($i <= $planetcount)
	if ($planettofill <> $planets[$i])

		:tryfuel
		killalltriggers
		if ($emptyfuel)
			send "l j"&#8&$planets[$i]&"* jt*jt1* x q l j"&#8&$planettofill&"* jt*jl1* x q "
			settexttrigger fuelsuccess :tryfuel "You load the "
			settexttrigger fuelempty :tryorganics "There aren't that many "
			settexttrigger fuelfull :emptyfuel "They don't have room for that many "
			pause
		end

		:emptyfuel
		send "jy "

		:tryorganics
		killalltriggers
		if ($emptyorganics)
			send "l j"&#8&$planets[$i]&"* jt*jt2* x q l j"&#8&$planettofill&"* jt*jl2* x q "
			settexttrigger success :tryorganics "You load the "
			settexttrigger emptyempty :tryequipment "There aren't that many "
			settexttrigger fullfill :emptyorganics "They don't have room for that many "
			pause
		end

		:emptyorganics
		send "jy "

		:tryequipment
		killalltriggers
		if ($emptyequipment)
			send "l j"&#8&$planets[$i]&"* jt*jt3* x q l j"&#8&$planettofill&"* jt*jl3* x q "
			settexttrigger success :tryequipment "You load the "
			settexttrigger emptyempty :tryfuelcolonists "There aren't that many "
			settexttrigger fullfill :emptyequipment "They don't have room for that many "
			pause
		end

		:emptyequipment
		send "jy "

		:tryfuelcolonists
		killalltriggers
		if ($emptyfuelcolonists)
			send "l j"&#8&$planets[$i]&"* js*jt1* x q l j"&#8&$planettofill&"* js*jl"&$colotype&"* x q "
			settexttrigger success :tryfuelcolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchfuel "There isn't room on the planet"
			settexttrigger fullfill :tryorganiccolonists "They don't have room for that many "
			settexttrigger empty :emptyfcolonists  "There aren't that many on the planet!"
			pause

			:switchfuel
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryfuelcolonists
		end

		:emptyfcolonists
		send "jy "

		:tryorganiccolonists
		killalltriggers
		if ($emptyorganiccolonists)
			send "l j"&#8&$planets[$i]&"* js*jt2* x q l j"&#8&$planettofill&"* js*jl"&$colotype&"* x q "
			settexttrigger success :tryorganiccolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchorganics "There isn't room on the planet"
			settexttrigger fullfill :tryequipmentcolonists "They don't have room for that many "
			settexttrigger empty :emptyocolonists "There aren't that many on the planet!"
			pause

			:switchorganics
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryorganiccolonists
		end

		:emptyocolonists
		send "jy "

		:tryequipmentcolonists
		killalltriggers
		if ($emptyequipmentcolonists)
			send "l j"&#8&$planets[$i]&"* js*jt3* x q l j"&#8&$planettofill&"* js*jl"&$colotype&"* x q "
			settexttrigger success :tryequipmentcolonists "The Colonists disembark to "
			settexttrigger emptyempty :switchequipment "There isn't room on the planet"
			settexttrigger fullfill :donewiththisplanet "They don't have room for that many "
			settexttrigger empty :donewiththisplanet "There aren't that many on the planet!"
			pause

			:switchequipment
			killalltriggers
			add $colotype 1
			if ($colotype >= 4)
				goto :donewiththisplanet
			end
			goto :tryequipmentcolonists
		end

		:donewiththisplanet
	end

	add $i 1
end

:lookupplanetstats2
send "l "&$planettofill&"*"
killalltriggers
settextlinetrigger wrongplanet :badplanet2 "That planet is not in this sector."
settextlinetrigger badplanet :badplanet2 "Invalid registry number, landing aborted."
settextlinetrigger goodplanet :goodplanet2 "Claimed by:"
pause

:badplanet2
killalltriggers
send "q*"
setvar $switchboard~message "Planet #"&$planettofill&" is not valid for this sector*"
gosub :switchboard~switchboard
halt

:goodplanet2
killalltriggers
waiton "Fuel Ore"
getword currentline $newfuelcolos 3
striptext $newfuelcolos ","
getword currentline $newfuel 6
striptext $newfuel ","
waiton "Organics"
getword currentline $neworganiccolos 2
striptext $neworganiccolos ","
getword currentline $neworganics 5
striptext $neworganics ","
waiton "Equipment"
getword currentline $newequipmentcolos 2
striptext $newequipmentcolos ","
getword currentline $newequipment 5
striptext $newequipment ","

send "q "
gosub :endreport
send "/"
waiton #179
setvar $switchboard~message "Planet Stripper Shutting Down*"
gosub :switchboard~switchboard
halt

:clearscreen
echo #27 & "[2J"
return

:countplanets
setvar $planetcount 0
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
add $planetcount 1
getword $line $planets[$planetcount] 1
settextlinetrigger getline2 :planetline "   <"
settextlinetrigger getend :done "Land on which planet "
pause

:done
return

:quikstats
setvar $current_prompt 		"Undefined"
killtrigger noprompt
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getline2
settextlinetrigger 	prompt		:allprompts	 	#145 & #8
settextlinetrigger 	statlinetrig 	:statstart 		#179
send #145&"/"
pause

:allprompts
getword currentline $current_prompt 1
striptext $current_prompt #145
striptext $current_prompt #8
#getWord currentansiline $checkPrompt 1
#getWord currentline $tempPrompt 1
#getWordPos $checkPrompt $pos "[35m"
#if ($pos > 0)
#	setVar $CURRENT_PROMPT $tempPrompt
#end
settextlinetrigger 	prompt		:allprompts	 	#145 & #8
pause

:statstart
killtrigger prompt
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger noprompt
setvar $stats ""
setvar $wordy ""

:statsline
killtrigger statlinetrig
killtrigger getline2
setvar $line2 currentline
replacetext $line2 #179 " "
striptext $line2 ","
setvar $stats $stats & $line2
getwordpos $line2 $pos "Ship"
if ($pos > 0)
	goto :gotstats
else
	settextlinetrigger getline2 :statsline
	pause
end

:gotstats
setvar $stats $stats & " @@@"

setvar $current_word 0
while ($wordy <> "@@@")
	if ($wordy = "Sect")
		getword $stats $current_sector   	($current_word + 1)
	elseif ($wordy = "Turns")
		getword $stats $turns  			($current_word + 1)
	elseif ($wordy = "Creds")
		getword $stats $credits  		($current_word + 1)
	elseif ($wordy = "Figs")
		getword $stats $fighters   		($current_word + 1)
	elseif ($wordy = "Shlds")
		getword $stats $shields  		($current_word + 1)
	elseif ($wordy = "Hlds")
		getword $stats $total_holds   		($current_word + 1)
	elseif ($wordy = "Ore")
		getword $stats $ore_holds    		($current_word + 1)
	elseif ($wordy = "Org")
		getword $stats $organic_holds    	($current_word + 1)
	elseif ($wordy = "Equ")
		getword $stats $equipment_holds    	($current_word + 1)
	elseif ($wordy = "Col")
		getword $stats $colonist_holds    	($current_word + 1)
	elseif ($wordy = "Phot")
		getword $stats $photons   		($current_word + 1)
	elseif ($wordy = "Armd")
		getword $stats $armids   		($current_word + 1)
	elseif ($wordy = "Lmpt")
		getword $stats $limpets   		($current_word + 1)
	elseif ($wordy = "GTorp")
		getword $stats $genesis  		($current_word + 1)
	elseif ($wordy = "TWarp")
		getword $stats $twarp_type  		($current_word + 1)
	elseif ($wordy = "Clks")
		getword $stats $cloaks   		($current_word + 1)
	elseif ($wordy = "Beacns")
		getword $stats $beacons 		($current_word + 1)
	elseif ($wordy = "AtmDt")
		getword $stats $atomic  		($current_word + 1)
	elseif ($wordy = "Corbo")
		getword $stats $corbo   		($current_word + 1)
	elseif ($wordy = "EPrb")
		getword $stats $eprobes   		($current_word + 1)
	elseif ($wordy = "MDis")
		getword $stats $mine_disruptors   	($current_word + 1)
	elseif ($wordy = "PsPrb")
		getword $stats $psychic_probe  		($current_word + 1)
	elseif ($wordy = "PlScn")
		getword $stats $planet_scanner  	($current_word + 1)
	elseif ($wordy = "LRS")
		getword $stats $scan_type    		($current_word + 1)
	elseif ($wordy = "Aln")
		getword $stats $alignment    		($current_word + 1)
	elseif ($wordy = "Exp")
		getword $stats $experience    		($current_word + 1)
	elseif ($wordy = "Corp")
		getword $stats $corp   			($current_word + 1)
	elseif ($wordy = "Ship")
		getword $stats $ship_number   		($current_word + 1)
	end
	add $current_word 1
	getword $stats $wordy $current_word
end

:donequikstats
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getline2

return
# ============================== END QUICKSTATS SUB==============================
:endreport
setvar $formattedcountfuel ""
setvar $countfuel ($newfuel - $currentfuel)
getlength $countfuel $length
while ($length > 3)
	cuttext $countfuel $snippet $length-2 9999
	cuttext $countfuel $countfuel 1 $length-3
	getlength $countfuel $length
	setvar $formattedcountfuel ","&$snippet&$formattedcountfuel
end
setvar $formattedcountfuel $countfuel&$formattedcountfuel

setvar $formattedcountorganics ""
setvar $countorganics ($neworganics - $currentorganics)
getlength $countorganics $length
while ($length > 3)
	cuttext $countorganics $snippet $length-2 9999
	cuttext $countorganics $countorganics 1 $length-3
	getlength $countorganics $length
	setvar $formattedcountorganics ","&$snippet&$formattedcountorganics
end
setvar $formattedcountorganics $countorganics&$formattedcountorganics

setvar $formattedcountequipment ""
setvar $countequipment ($newequipment - $currentequipment)
getlength $countequipment $length
while ($length > 3)
	cuttext $countequipment $snippet $length-2 9999
	cuttext $countequipment $countequipment 1 $length-3
	getlength $countequipment $length
	setvar $formattedcountequipment ","&$snippet&$formattedcountequipment
end
setvar $formattedcountequipment $countequipment&$formattedcountequipment

setvar $formattedcountcolonists ""
setvar $countcolonists ($newfuelcolos - $currentfuelcolos)
add $countcolonists ($neworganiccolos - $currentorganiccolos)
add $countcolonists ($newequipmentcolos - $currentequipmentcolos)
getlength $countcolonists $length
while ($length > 3)
	cuttext $countcolonists $snippet $length-2 9999
	cuttext $countcolonists $countcolonists 1 $length-3
	getlength $countcolonists $length
	setvar $formattedcountcolonists ","&$snippet&$formattedcountcolonists
end
setvar $formattedcountcolonists $countcolonists&$formattedcountcolonists

send "'*{" $bot_name "} - Planet Stripper - Completion Report*"
if ($emptyfuel)
	send "  Fuel Ore  Moved: "&$formattedcountfuel&" Holds*"
end
if ($emptyorganics)
	send "  Organics  Moved: "&$formattedcountorganics&" Holds*"
end
if ($emptyequipment)
	send "  Equipment Moved: "&$formattedcountequipment&" Holds*"
end
if ($emptyfuelcolonists or $emptyorganiccolonists or $emptyequipmentcolonists)
	send "  Colonists Moved: "&$formattedcountcolonists&" Holds*"
end
send  "**"
return

:nextcolotype
killalltriggers
add $colotype 1
if ($colotype >= 4)
	halt
end
return

# ==============================  START PLANET INFO SUBROUTINE  =================
:getplanetinfo
# ============================ START PLANET VARIABLES ==========================
setvar $current_sector		0
setvar $planet			0
setvar $planet_fuel		0
setvar $planet_fuel_max		0
setvar $planet_organics		0
setvar $planet_organics_max	0
setvar $planet_equipment	0
setvar $planet_equipment_max	0
setvar $planet_fighters		0
setvar $planet_fighters_max	0
setvar $citadel			0
setvar $citadel_credits		0
setvar $atmosphere_cannon	0
setvar $sector_cannon		0
# ============================  END PLANET VARIABLES ==========================

send "*"
settextlinetrigger planetinfo2 :planetinfo2 "Planet #"
pause

:planetinfo2
setvar $citadel 0
setvar $sector_cannon 0
setvar $atmosphere_cannon 0
setvar $citadel_credits 0
getword currentline $planet 2
striptext $planet "#"
getword currentline $current_sector 5
striptext $current_sector ":"
waitfor "2 Build 1   Product    Amount     Amount     Maximum"

:getplanetstuff
settextlinetrigger fuelstart :fuelstart "Fuel Ore"
settextlinetrigger orgstart :orgstart "Organics"
settextlinetrigger equipstart :equipstart "Equipment"
settextlinetrigger figstart :figstart "Fighters        N/A"
settextlinetrigger citadelstart :citadelstart "Planet has a level"
settextlinetrigger cannon :cannonstart ", AtmosLvl="
settexttrigger planetinfodone :planetinfodone "Planet command (?=help)"
pause

:fuelstart
getword currentline $planet_fuel 6
getword currentline $planet_fuel_max 8
striptext $planet_fuel ","
striptext $planet_fuel_max ","
pause

:orgstart
getword currentline $planet_organics 5
getword currentline $planet_organics_max 7
striptext $planet_organics ","
striptext $planet_organics_max ","
pause

:equipstart
getword currentline $planet_equipment 5
getword currentline $planet_equipment_max 7
striptext $planet_equipment ","
striptext $planet_equipment_max ","
pause

:figstart
getword currentline $planet_fighters 5
getword currentline $planet_fighters_max 7
striptext $planet_fighters ","
striptext $planet_fighters_max ","
pause

:citadelstart
getword currentline $citadel 5
getword currentline $citadel_credits 9
striptext $citadel_credits ","
pause

:cannonstart
getword currentline $atmosphere_cannon 5
getword currentline $sector_cannon 6
striptext $sector_cannon "SectLvl="
striptext $sector_cannon "%"
striptext $atmosphere_cannon "AtmosLvl="
striptext $atmosphere_cannon "%"
striptext $atmosphere_cannon ","
pause

:planetinfodone
killtrigger citadelstart
killtrigger cannon

return
# ==============================  END PLANET INFO SUBROUTINE  =================
include "source\include\switchboard.ts"
