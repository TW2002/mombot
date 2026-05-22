reqrecording
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $map~backdoor

setvar $help~help[1] $help~tab&"PIMP - Makes planets and strips them of product "
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"pimp {"&#34&"planet name"&#34&"} {f} {o} {e}"
setvar $help~help[4] $help~tab&"      "
setvar $help~help[5] $help~tab&"[planet name] - creates planet with this name (default"
setvar $help~help[6] $help~tab&"                is random name)"
setvar $help~help[7] $help~tab&"          [f] - fuel"
setvar $help~help[8] $help~tab&"          [o] - organics"
setvar $help~help[9] $help~tab&"          [e] - equipment"
gosub :help~helpfile

setvar $switchboard~message "product pimp starting up!*"
gosub :switchboard~switchboard

:pimp
window prodpimp 400 150 "product pimp stats" ontop
gosub :player~quikstats
setvar $starting_location $player~current_prompt
getrnd $random 1 100000
if ($starting_location <> "Citadel") and ($starting_location <> "Planet")
	setvar $switchboard~message "You must run product pimp from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
setvar $bot~user_command_line $bot~user_command_line&" "
isnumber $test $bot~parm1

getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $targetplanet " "&#34 #34&" "
	if ($targetplanet <> "")
		setvar $pimp_planet_name $targetplanet
		striptext $bot~user_command_line " "&#34&$targetplanet&#34&" "
	else
		setvar $pimp_planet_name "M()M Pimp "&$random
	end
else
	setvar $pimp_planet_name "M()M Pimp "&$random
end

setvar $bot~user_command_line " "&$bot~user_command_line&" "
getwordpos $bot~user_command_line $pos " f "
if ($pos > 0)
	setvar $emptyfuel true
else
	setvar $emptyfuel false
end
getwordpos $bot~user_command_line $pos " o "
if ($pos > 0)
	setvar $emptyorganics true
else
	setvar $emptyorganics false
end
getwordpos $bot~user_command_line $pos " e "
if ($pos > 0)
	setvar $emptyequipment true
else
	setvar $emptyequipment false
end
if (($emptyorganics = false) and ($emptyequipment = false) and ($emptyfuel = false))
	setvar $switchboard~message "Please pick [f]uel, [o]rganics and/or [e]quipment to harvest.  pimp {"&#34&"planet name"&#34&"} {f} {o} {e} *"
	gosub :switchboard~switchboard
	halt
end

setvar $om_sdloc $map~stardock
setvar $totalplanets 0
setvar $stripables 0

gosub :player~quikstats
setvar $starting_location $player~current_prompt

if ($starting_location = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "c"
	waitfor "Citadel command"
elseif ($starting_location = "Planet")
	gosub :planet~getplanetinfo
	send " q l " $planet~planet "* "
end

setvar $target $planet~planet
setvar $target_cash $planet~citadelcredits
setvar $totalfuel $planet~planetfuel
setvar $totalorg $planet~planetorg
setvar $totalequ $planet~planetequip
setvar $totalfuelmax $planet~planetfuelmax
setvar $totalorgmax $planet~planetorgmax
setvar $totalequmax $planet~planetequipmax
setvar $om_redsector $map~backdoor

if ($player~photons > 0)
	setvar $switchboard~message "You can't have photons while running pimp.  That doesn't make any sense at all.*"
	gosub :switchboard~switchboard
	halt
end

:inac
killalltriggers

:myinfo
if ($player~unlimitedgame = false)
	if ($player~turns < $bot~bot_turn_limit)
		setvar $switchboard~message "I have too few turns to pimp product, script halting.*"
		gosub :switchboard~switchboard
		halt
	end
end
if (($player~credits + $target_cash) < 1000000)
	setvar $switchboard~message "I have too little cash on hand, script halting.*"
	gosub :switchboard~switchboard
	halt
end

:myplanetinfo
if ($starting_location = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "c"
	waitfor "Citadel command"
elseif ($starting_location = "Planet")
	gosub :planet~getplanetinfo
end

setvar $totalfuel $planet~planetfuel
setvar $totalorg $planet~planetorg
setvar $totalequ $planet~planetequip
if ($starting_location = "Citadel")
	send "q"
end

#Empty Holds to Planet
send "m * * * T * L 1*T*L2*T*L3*S*L1*Q j y"

seteventtrigger discod1 	:discod     	"CONNECTION LOST"
seteventtrigger	discod2		:discod     	"Connections have been temporarily disabled."
waitfor "Command [TL"

:makeplanet
killalltriggers
gosub :set_windows
gosub :player~quikstats
if (($player~credits < 1000000) and (($player~genesis <= 0) or ($player~atomic <= 0)))
	setvar $cashonhand $target_cash
	add $cashonhand $player~credits
	send "l j" #8 $target "* c "
	if ($cashonhand > 5000000)
		send "T T " $player~credits "* "
		send "T F " 5000000 "* "
		setvar $player~credits 5000000
	elseif ($cashonhand > 1000000)
		send "T T " $player~credits "* "
		send "T F " $cashonhand "* "
		setvar $player~credits $cashonhand
	else
		setvar $switchboard~message "I have too little cash on hand, script halting.*"
		gosub :switchboard~switchboard
		halt
	end
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	settextlinetrigger getcash :gotcash "credits, and the Treasury has "
	pause

	:gotcash
	getword currentline $target_cash 9
	striptext $target_cash ","
	send "qqq* * "
	gosub :player~quikstats
end
if ($player~fighters < 1000)
	setvar $switchboard~message "I have too few fighters on hand, less than 1000. Script halting.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~unlimitedgame = false)
	if ($player~turns < $bot~bot_turn_limit)
		setvar $switchboard~message "I have too few turns to pimp product. Script halting.*"
		gosub :switchboard~switchboard
		halt
	end
end
if (($player~genesis > 0) and ($player~atomic > 0))
	send "u y * " #8 #8 $pimp_planet_name "* p q * "
	gosub :set_windows
	add $totalplanets 1
	killalltriggers
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	settexttrigger builtplanet :findplanet "For building this planet"
	pause
else
	gosub :restock
	goto :makeplanet
end

:findplanet
killalltriggers
#Find the planet we just created
send "L"
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
settextlinetrigger getplanetnum :get_planet_num "> "&$pimp_planet_name
pause
pause

:get_planet_num
setvar $line currentline
striptext $line "<"
getword $line $planet~planetnum 1
striptext $planet~planetnum ">"
send $planet~planetnum "*"
#check ore

gosub :planet~getplanetinfo

if ((($planet~planetfuel < $player~total_holds) or ($emptyfuel = false)) and (($planet~planetorg < $player~total_holds) or ($emptyorganics = false)) and (($planet~planetequip< $player~total_holds) or ($emptyequipment = false)))
	#Blow it up :D
	if (($fuelcolos = "0") and ($orgcolos = "0") and ($equipcolos = "0"))
		killalltriggers
		send "z d y "
		seteventtrigger discod1 	:discod     	"CONNECTION LOST"
		seteventtrigger	discod2		:discod     	"Connections have been temporarily disabled."
		settexttrigger 6 :nodets "You do not have any Atomic Detonators!"
		settexttrigger 7 :makeplanet "Command [TL="
		pause
	end
end
add $stripables 1
send "* "
killalltriggers
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
waitfor "Planet command"

:tryfuel
killalltriggers
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
if ($emptyfuel)
	send "t*t1*q l j" #8 $target "* t*l1*q l j" #8 $planet~planetnum "* "
	settexttrigger fuelsuccess :fuelsuccess "You load the "
	settexttrigger fuelempty :fuelempty "There aren't that many "
	settexttrigger fuelfull :fullplanet "They don't have room for that many "
	pause
else
	goto :fuelempty
end

:fuelsuccess
add $totalfuel $player~total_holds
gosub :set_windows
goto :tryfuel

:fuelempty
killalltriggers

:tryorganics
killalltriggers
if ($emptyorganics)
	send "t*t2*q l j" #8 $target "* t*l2*q l j" #8 $planet~planetnum "* "
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	settexttrigger success :orgsuccess "You load the "
	settexttrigger orgempty :tryequipment "There aren't that many "
	settexttrigger fullfill :fullplanet "They don't have room for that many "
	pause
else
	goto :orgempty
end

:orgsuccess
add $totalorg $player~total_holds
gosub :set_windows
goto :tryorganics

:orgempty
killalltriggers

:tryequipment
killalltriggers
if ($emptyequipment)
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	send "t*t3*q l j" #8 $target "* t*l3*q l j" #8 $planet~planetnum "* "
	settexttrigger success :equsuccess "You load the "
	settexttrigger emptyempty :emptyplanet "There aren't that many "
	settexttrigger fullfill :fullplanet "They don't have room for that many "
	pause
else
	goto :equempty
end

:equsuccess
add $totalequ $player~total_holds
gosub :set_windows
goto :tryequipment

:equempty
killalltriggers
goto :emptyplanet

:fullplanet
killalltriggers
send "qqqqqq* l j"&#8&$target&"* "
if ($starting_location = "Citadel")
	send "c "
end
setvar $switchboard~message " Planet " & $target & " is full, stopping.*"
gosub :switchboard~switchboard
halt

:emptyplanet
killalltriggers
send "@"
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
waitfor "Average Interval Lag:"
send "Q"
waitfor "Command [TL"
goto :findplanet

:nodets
send "QQ"
if ($player~alignment < 1000)
	setvar $switchboard~message "Alignment less than 1000, can't refurb genesis torps and atomic dets*"
	gosub :switchboard~switchboard
	halt
end

gosub :restock
goto  :findplanet

:restock
killalltriggers
send "d"
settextlinetrigger 	figprompt 	:figprompt 		"Fighters:"
settextlinetrigger 	nofigprompt :nofigprompt	"Warps to Sector(s) :"
pause

:nofigprompt
killalltriggers
setvar $switchboard~message "No fighters here to twarp back to.*"
gosub :switchboard~switchboard
halt

:figprompt
killalltriggers
getword currentline $chkpers 3
if ($chkpers <> "(yours)")
	getword currentline $whichcorp 6
	if ($whichcorp <> "Corp)")
		setvar $switchboard~message "No fighters here to twarp back to.*"
		gosub :switchboard~switchboard
		halt
	end
end

seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
settextlinetrigger sdyes :sdyes "Commerce report for Stargate Alpha I:"
settextlinetrigger sdno1  :sdno  "You have never visted sector"
settextlinetrigger sdno2  :sdno  "I have no information about a port in that sector."
setdelaytrigger sdno3 :sdno 10000
#had to add waitfors b/c AllKeys was bypassing display
send "C"
waitfor "<Computer activated>"
send "R"
waitfor "What sector is the port"
send $om_sdloc "*"
pause
pause

:sdno
send "q"
setvar $switchboard~message "SD is not in that sector, or never been visited!! product pimp shutting down in starting sector.*"
gosub :switchboard~switchboard
halt

:sdyes
send "QL " & $target & "* T * T 1 * M * * * Q"
waitfor "Command [TL"
send "** "
gosub :player~quikstats
if (($player~ore_holds < $player~total_holds) and ((port.buyfuel[$player~current_sector] <> true) and (port.exists[$player~current_sector] = true)))
	send "P T * * * "
	setvar $switchboard~message "Didn't have full fuel for restocking pimp. Buying fuel from port and trying again!*"
	gosub :switchboard~switchboard
end
if ($om_redsector <> 0) and ($player~alignment < 1000)
	if ($player~unlimitedgame)
		setvar $switchboard~message "Running product pimp with unlimited turns and "&$player~credits&" credits left*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Running product pimp with "&$player~turns&" turns and "&$player~credits&" credits left*"
		gosub :switchboard~switchboard
	end
	killalltriggers
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	settexttrigger nofig :nofig "Do you want to make this jump blind?"
	settexttrigger ready1 :ready1 "Locating beam pinpointed,"
	settexttrigger nofuel2 :nofuel "You do not have enough Fuel Ore to make the jump"
	send "m" $om_redsector "*y"
	pause
	pause
end
setvar $switchboard~message "Running product pimp with "&$player~turns&" turns and "&$player~credits&" credits left*"
gosub :switchboard~switchboard
settexttrigger nofig :nofig "Do you want to make this jump blind?"
settexttrigger ready2 :ready2 "All Systems Ready, shall we engage?"
settexttrigger nofuel1 :nofuel "You do not have enough Fuel Ore to make the jump"
send "nsy"
pause
pause

:nofig
killalltriggers
send "n"
setvar $switchboard~message "No fig at target sector. Shutting Down*"
gosub :switchboard~switchboard
halt

:nofuel
killalltriggers
setvar $switchboard~message "No fuel for twarp. Shutting Down*"
gosub :switchboard~switchboard
halt

:ready1
killalltriggers
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
settexttrigger limpet :limpet "ort official runs up"
settexttrigger buytorps :buytorps "<StarDock> Where to?"
send "YNS P S"
pause
pause

:ready2
killalltriggers
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
settexttrigger limpet :limpet "ort official runs up"
settexttrigger buytorps :buytorps "<StarDock> Where to?"
send "Y PS"
pause
pause

:limpet
send "Y"
pause

:buytorps
killalltriggers
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
settexttrigger torps :torps "How many Genesis Torpedoes do you want"
settexttrigger dets  :dets  "How many Atomic Detonators do you want"
send "HT"
pause
pause

:torps
getword currentline $numtorps 9
striptext $numtorps ")"
send $numtorps & "*"
send "A"
pause

:dets
getword currentline $numdets 9
striptext $numdets ")"
send $numdets & "*"
send "Q Q M " & $player~current_sector & " * Y Y "
settexttrigger nofig :nofig "Do you want to make this jump blind?"
settexttrigger ready3 :ready3 "All Systems Ready, shall we engage?"
settexttrigger nofuel :nofuel "You do not have enough Fuel Ore to make the jump"
pause
pause

:ready3
waitfor "Command [TL"
send "l "&$target&"* t n l 1* q q * j y * "
return

:planetfull
setvar $switchboard~message "Planet is full. script halting.*"
gosub :switchboard~switchboard
send "QQ*"

:finish
halt

:set_windows
if ($player~unlimitedgame)
	setvar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalequ&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:     Unlimited*"&$stripables&" out of "&$totalplanets&" planets have had product on them.*"
else
	setvar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalequ&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:        "&$player~turns&"*"&$stripables&" out of "&$totalplanets&" planets have had product on them.*"
end
setwindowcontents prodpimp $window_content
replacetext $window_content "*" "[][]"
savevar $window_content
return

:discod
setvar $tagline				"[product pimp]"
setvar $taglineb			"[product pimp]"
killalltriggers
echo "**" & ansi_14 & $taglineb & ansi_15 & " Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger		emancipate_cpu		:emancipate_cpu 3000
	echo "**" & ansi_14 & $taglineb & ansi_15 & " Auto Land & Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger		waitingabit		:waitingabit	3000
echo "**" & ansi_14 & $taglineb & ansi_15 & " Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	send " L Z" & #8 & $target & "*  *  J  C  *  "
	settextlinetrigger	notlanded	:notlanded		"Are you sure you want to jettison all cargo?"
	settextlinetrigger	landed		:landed			"<Enter Citadel>"
	setdelaytrigger		testconn	:testconn		3000
	pause

	:testconn
	killalltriggers
	if (connected = false)
		goto :disco_test
	else
		setvar $switchboard~message "" & $taglineb & " Problem Detected Unable to Land!*"
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
elseif ($player~current_prompt = "Planet")
	send ("  q q q q q  * * '" & $taglineb & " Attempting to Reach Correct Prompt...*")
	settextlinetrigger	emq_complete		:emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger 	emq_delay		:emq_delay 3000
	pause
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
else
	send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $taglineb & " Attempting to Reach Correct Prompt...*")
	settextlinetrigger	emq_complete		:emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger 	emq_delay		:emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
