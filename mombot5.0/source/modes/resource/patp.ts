logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $player~unlimitedgame
loadvar $game~port_max

setvar $help~help[1]  $help~tab&"              PATP - Pay At The Pump               "
setvar $help~help[2]  $help~tab&"  patp [min port fuel] {turbo} {upgrade} {buyhalf}"
setvar $help~help[3]  $help~tab&"       {docim} {destroyports}"
setvar $help~help[4]  $help~tab&"       "
setvar $help~help[5]  $help~tab&"        "
setvar $help~help[6]  $help~tab&"Options:"
setvar $help~help[7]  $help~tab&"    [min port fuel]  minimum fuel a port must have to visit it"
setvar $help~help[8]  $help~tab&"    [turbo]          puts all buydowns in a burst"
setvar $help~help[9]  $help~tab&"    [upgrade]        upgrades fuel in each port"
setvar $help~help[10] $help~tab&"    [buyhalf]        empties ports halfway"
setvar $help~help[11] $help~tab&"    [docim]          does cim check before patp"
setvar $help~help[12] $help~tab&"    [destroyports]   destroys every port it drains if you "
setvar $help~help[13] $help~tab&"                     have enough fighters"
setvar $help~help[14] $help~tab&"    [bubble]         only visits bubble sectors  "
setvar $help~help[15] $help~tab&"    [all]            attempts to do all planets in sector  "
gosub :help~helpfile

setvar $switchboard~bot_name $switchboard~bot_name

lowercase $bot~parm1
setvar $minimumfuel $bot~parm1
isnumber $number $minimumfuel
if ($number <> 1)
	setvar $switchboard~message "Minimum Port Fuel entered is not a number!*"
	gosub :switchboard~switchboard
	halt
end
if ($minimumfuel <  0)
	setvar $switchboard~message "Minimum Port Fuel must be greater than or equal to 0.*"
	gosub :switchboard~switchboard
	halt
end
getwordpos $bot~user_command_line $pos "destroyports"
if ($pos > 0)
	setvar $destroyports true
else
	setvar $destroyports false
end
getwordpos $bot~user_command_line $pos "upgrade"
if ($pos > 0)
	setvar $upgrade true
else
	setvar $upgrade false
end
getwordpos $bot~user_command_line $pos "turbo"
if ($pos > 0)
	setvar $turbo true
else
	setvar $turbo false
end
getwordpos $bot~user_command_line $pos "half"
if ($pos > 0)
	setvar $buyhalf true
else
	setvar $buyhalf false
end
getwordpos $bot~user_command_line $pos "docim"
if ($pos > 0)
	setvar $docim true
else
	setvar $docim false
end
getwordpos $bot~user_command_line $pos "bubble"
if ($pos > 0)
	setvar $bubble true
else
	setvar $bubble false
end
getwordpos $bot~user_command_line $pos "all"
if ($pos > 0)
	setvar $allplanets true
else
	setvar $allplanets false
end

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run Pay At The Pump command from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

send "qsnl1*tnl1*tnl2*tnl3*"
waiton "Planet command (?"
gosub :planet~getplanetinfo
setvar $startingsector $player~current_sector

if ($planet~citadel < 4)
	setvar $switchboard~message "You must run Pay At The Pump from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end
if (($planet~citadel_credits + $player~credits) < 5000000)
	setvar $switchboard~message "You must have at least 5 million credits in the citadel or on hand for patp.*"
	gosub :switchboard~switchboard
	halt
end

window patp_script 560 170 ("PATP - " & gamename) ontop
gosub :setwindow

send "qjy l "&$planet~planet&"* c"

setvar $switchboard~message "Pay At The Pump starting on planet " & $planet~planet & "!*"
gosub :switchboard~switchboard

gosub :ship~getshipstats
setvar $totalholds 0
setvar $spentcredits 0
setarray $checkedports sectors
setarray $que sectors
setarray $checked sectors
setvar $restoreautohagglestate 0

gosub :ship~getshipstats

if ($turbo = true)
	setvar $haggle~nativehagglemode false
	gosub :haggle~configurenativehaggle
end

if ($docim = true)
	setvar $switchboard~message "PATP Downloading Current Port CIM Data - Comms Off*"
	gosub :switchboard~switchboard
	send "^rq"
	killalltriggers
	waitfor ": ENDINTERROG"
	setvar $switchboard~message "PATP CIM Port Data Complete - Comms Back On*"
	gosub :switchboard~switchboard
end

setvar $isdone false
setvar $player~turnstoolow false
killalltriggers

if ($allplanets = true)
	send "qqq*"
	gosub :planet~countplanets
	setvar $j 0
	while ($j < $planet~planetcount)
		add $j 1
		send "qqq* l "&$planet~planets[$j]&"*"
		gosub :planet~getplanetinfo
		send "c"
		gosub :patp
		send "p "&$startingsector&"*y"
		waiton "Planet is now in sector"
	end
	goto :donepatp
else
	gosub :patp
	goto :donepatp
end

:patp
loadvar $bot~botisdeaf
loadvar $bot~silent_running
if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
	setvar $switchboard~message "Turns too low to continue.*"
	gosub :switchboard~switchboard
	goto :donepatp
end
setvar $bottom 1
setvar $top 1
setarray $checked sectors
setvar $que[1] $player~current_sector
setvar $checked[$player~current_sector] 1

:tryagain2
while ($bottom <= $top)
	# Now, pull out the next sector in the que, and make it our focus
	setvar $focus $que[$bottom]
	getsectorparameter $focus "BUSTED" $isbusted
	# If this sector is our Sxx, we're done!
	if ($bubble)
		getsectorparameter $focus "BUBBLE" $isbubble
	else
		setvar $isbubble true
	end
	if ($docim = false)
		if (($checkedports[$focus] <> true) and (port.exists[$focus] = true) and (port.class[$focus] > 0) and (sector.explored[$focus] = "YES") and (((port.fuel[$focus] >= $minimumfuel) and (port.buyfuel[$focus] = false)) and ($isbusted <> true) and ($isbubble = true)))
			send "cr"&$focus&"*q"
			gosub :player~quikstats
		end
	end
	if (($checkedports[$focus] <> true) and (port.exists[$focus] = true) and (port.class[$focus] > 0) and (((port.fuel[$focus] >= $minimumfuel) and (port.buyfuel[$focus] = false)) and ($isbusted <> true) and ($isbubble = true)))
		# fig found 0 hops
		setvar $nearfig $focus
		setvar $checkedports[$nearfig] true
		setvar $totalportfuel port.fuel[$focus]
		goto :continueon2
	else
		setvar $nearfig 0
	end
	# That wasn't it, so let's add all the adjacents to the que for future testing.
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
setvar $switchboard~message "Can't find a route to any other ports.*"
gosub :switchboard~switchboard
goto :donepatp

:continueon2
if ($nearfig > 0)
	killalltriggers
	send "p"&$nearfig&"*"
	settextlinetrigger warped :emptyport2 "Locating beam pinpointed, TransWarp Locked."
	settextlinetrigger same :emptyport2 "You are already in that sector!"
	settextlinetrigger didnotwarp :nofigatlocation "Your own fighters must be in the destination to make a safe jump."
	settextlinetrigger notenoughfuel :donenofuel2 "You do not have enough Fuel Ore on this planet to make the jump."
	pause

	:emptyport2
	send "y "
	setsectorparameter $nearfig "FIGSEC" true

	killalltriggers

	if ($upgrade)
		gosub :player~quikstats
		send "q"
		waiton "Planet command (?"
		gosub :planet~getplanetinfo
		gosub :setwindow
		send "c"
		setvar $total_creds_needed (300*7000)
		if ($total_creds_needed > $player~credits)
			setvar $cashonhand $planet~citadel_credits
			add $cashonhand $player~credits
			if ($cashonhand > $total_creds_needed)
				send "T T " & $player~credits & "* "
				send "T F " & $total_creds_needed & "* "
				setvar $player~credits $total_creds_needed
			end
		end
		send "q q *O 1"
		waiton ", 0 to quit)"
		getword currentline $upgradeamount 9
		striptext $upgradeamount "("
		send $upgradeamount&"* * *CR*Q"
		waiton "What sector is the port in? ["&$player~current_sector&"]"
		settextlinetrigger getfuel2 :fuelduring "Fuel Ore"
		pause

		:fuelduring
		killalltriggers
		getword currentline $totalportfuel 4
		waiton "<Computer deactivated>"
		gosub :player~quikstats
		gosub :planet~landonplanetentercitadel
	end
	if ($buyhalf)
		divide $totalportfuel 2
	end
	if (($planet~planet_fuel_max-$planet~planet_fuel) < $totalportfuel)
		setvar $player~turnstoempty (($planet~planet_fuel_max-$planet~planet_fuel)/$player~total_holds)
		add $totalholds ($planet~planet_fuel_max-$planet~planet_fuel)
		setvar $isdone true
	else
		setvar $player~turnstoempty ($totalportfuel/$player~total_holds)
		add $totalholds $totalportfuel
	end
	setvar $player~buyobject "f"
	if ($turbo = true)
		setvar $player~buytype "s"
	else
		setvar $player~buytype "b"
	end
	setvar $player~buydownroundsfromparam $player~turnstoempty
	gosub :planethaggle~buy
	gosub :player~quikstats
	send "q"
	gosub :planet~getplanetinfo
	send "c"
	gosub :setwindow
	send "c r*"
	waiton "Computer command ["
	send "q "

	if ($player~exit_message <> "Normal Exit")
		setvar $switchboard~message $player~exit_message&"*"
		gosub :switchboard~switchboard
		goto :donepatp
	end
	if (($player~unlimitedgame = false) and (($player~turns-$player~turnstoempty) <= $bot~bot_turn_limit))
		setvar $player~turnstoolow true
		goto :donepatp
	end

	#if ($buyhalf)
	#	setvar $switchboard~message "Port half emptied in sector "&$nearfig&".*"
	#	gosub :switchboard~switchboard
	#else
	#	setvar $switchboard~message "Port emptied in sector "&$nearfig&".*"
	#	gosub :switchboard~switchboard
	#end
	gosub :player~quikstats
	if ((($player~turns < 50) and ($player~unlimitedgame = false)))
		goto :donepatp
	end
	add $spentcredits $player~credits_spent
	if ($destroyports)
		send "q q "

		:keepdestroying
		killalltriggers
		gosub :player~quikstats
		if ($player~fighters > $ship~maxfigattack)
			send "p"
			setstrigger portalreadygone :donedestroying "Captain! Are you sure you want to port here?"
			settexttrigger porthere :continuedestroy "<A> Attack this Port"
			pause

			:continuedestroy
			killalltriggers
			send " a y "&$ship~maxfigattack&"*l "&$planet~planet&"* m * * * q "
			settexttrigger notdestroyed :keepdestroying "Incoming laser barrage from"
			settexttrigger destoryedport :donedestroying "You destroyed the Star Port!"
			pause

			:donedestroying
			killalltriggers
			send "*"
			setvar $switchboard~message "Port destroyed in sector "&$sectorcount&".*"
			gosub :switchboard~switchboard
			gosub :player~quikstats
		end
		gosub :planet~getplanetinfo
		gosub :setwindow
		send "c r*"
		waiton "Computer command ["
		send "q "
		gosub :planet~landonplanetentercitadel
	end
end

:tryagain

if (($player~credits + $planet~citadel_credits) < 1000000)
	setvar $isdone true
end
if (($player~turns < 50) and ($player~unlimitedgame <> true))
	setvar $isdone true
end

if ($isdone = true)
	return
else
	goto :tryagain2
end

:donepatp
gosub :haggle~restoreautohaggle
gosub :player~msgs_on
send "p"&$startingsector&"*y"
setvar $formattedspentcredits ""
getlength $spentcredits $length
while ($length > 3)
	cuttext $spentcredits $snippet $length-2 9999
	cuttext $spentcredits $spentcredits 1 $length-3
	getlength $spentcredits $length
	setvar $formattedspentcredits ","&$snippet&$formattedspentcredits
end
setvar $formattedspentcredits $spentcredits&$formattedspentcredits

setvar $formattedholds ""
getlength $totalholds $length
while ($length > 3)
	cuttext $totalholds $snippet $length-2 9999
	cuttext $totalholds $totalholds 1 $length-3
	getlength $totalholds $length
	setvar $formattedholds ","&$snippet&$formattedholds
end
setvar $formattedholds $totalholds&$formattedholds

send "'*{" $switchboard~bot_name "} Pay At The Pump - Completion Report {" $switchboard~bot_name "}*  "&$formattedholds&" total holds of fuel ore purchased.*  Credits spent: "&$formattedspentcredits&" credits*"
if (($player~credits+$planet~citadel_credits) < 1000000)
	send "  Credits are below 1,000,000.*"
end
if ($player~turnstoolow)
	send "  Low on turns! (Turns: "&$player~turns&")*"
end
if ($planet~planet_fuel >= ($planet~planet_fuel_max-$game~port_max))
	send "  Planet "&$planet~planet&" is full.*"
end
send  "{" $switchboard~bot_name "} Pay At The Pump - Completion Report {" $switchboard~bot_name "}**"
halt

:getfuelcash
send "l " $planet~planet "*   c t f"&$total_creds_needed&"*qq"
gosub :player~quikstats
return

:nofigatlocation
setsectorparameter $nearfig "FIGSEC" false
goto :tryagain2

:donenofuel2
setvar $switchboard~message "Not enough fuel to continue.*"
gosub :switchboard~switchboard
goto :donepatp

:setwindow
setarray $window_lines 8
setvar $window_lines[1] "* PATP Planet: " & $planet~planet
setvar $window_lines[2] "* ---------------------------------------------------------------"
setvar $window_lines[3] "* Current Sector: " & $player~current_sector&"                            "
cuttext $window_lines[3] $window_lines[3] 1 30
if ($player~unlimitedgame = true)
	setvar $window_lines[4] "   Turns: Unlimited"
else
	format $player~turns $player~value number
	setvar $window_lines[4] "   Turns: " & $player~value
end
format $planet~planet_fuel $player~value number
setvar $window_lines[5] "*    Planet Fuel: " & $player~value&"                          "
cuttext $window_lines[5] $window_lines[5] 1 30
format $planet~planet_fighters $player~value number
setvar $window_lines[6] "   Planet Fighters: " & $player~value
format $planet~planet_shields $player~value number
setvar $window_lines[7] "* Planet Shields: " & $player~value&"                          "
cuttext $window_lines[7] $window_lines[7] 1 30
format $planet~citadel_credits $player~value number
setvar $window_lines[8] "   Citadel Credits: " & $player~value&"*"

setvar $i 1
setvar $msg ""
while ($i <= 8)
	setvar $msg $msg&$window_lines[$i]
	add $i 1
end
setwindowcontents patp_script $msg
setvar $window_content $msg
replacetext $window_content "*" "[][]"
savevar $window_content

return

#INCLUDES:
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\haggle"
include "source\include\sector"
include "source\include\help"
include "source\include\switchboard.ts"
