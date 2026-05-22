logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~port_max
loadvar $game~mbbs

setvar $max_bots 15
setvar $min_red_exp 0
setvar $min_red_alignment "-100"

########################################################################################
# Bots array structure - $bots[bot id][is bot potential robber][bot name][trader name] #
########################################################################################
setarray $bots $max_bots 4
setarray $current_ship $max_bots
setarray $original_ship $max_bots

setvar $help~help[1]  $help~tab&" teammega {minproduct:#} {stopturns:#} {half}"
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&" Buydown and mega with multiple bots"
setvar $help~help[4]  $help~tab&"   "
setvar $help~help[5]  $help~tab&" {minproduct:#} - Port Min Prod Req (def:30,000)"
setvar $help~help[6]  $help~tab&"  {stopturns:#} - Turns to stop at (def: 100)"
setvar $help~help[7]  $help~tab&"         {half} - Sells only half to port."
setvar $help~help[8]  $help~tab&"         "
setvar $help~help[9]  $help~tab&"     Bots: callin mega1, mega2, etc."
setvar $help~help[10] $help~tab&"           script will find potential robbers"

gosub :help~helpfile

# for trader names #
gosub :combat~init

gosub :player~quikstats
gosub :player~getinfo
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "Team Mega must be run from Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

setvar $switchboard~message "Team Mega starting up!*"
gosub :switchboard~switchboard

getwordpos $bot~user_command_line $pos "minproduct:"
if ($pos > 0)
	setvar $cline $bot~user_command_line & " "
	gettext $cline $minimumproduct "minproduct:" " "
else
	setvar $minimumproduct 0
end

getwordpos $bot~user_command_line $pos "stopturns:"
if ($pos > 0)
	setvar $cline $bot~user_command_line & " "
	gettext $cline $stopturns "stopturns:" " "
else
	setvar $stopturns 0
end

if ($minimumproduct <= 0)
	isnumber $test $bot~parm1
	if ($test)
		if ($test > 0)
			setvar $minimumproduct $bot~parm1
		else
			setvar $minimumproduct 30000
		end
	else
		setvar $minimumproduct 30000
	end
	isnumber $test $bot~parm2
	if ($test)
		if ($test > 0)
			setvar $stopturns $bot~parm2
		else
			setvar $stopturns 100
		end
	else
		setvar $stopturns 100
	end
end

getwordpos $bot~user_command_line $pos "half"
if ($pos > 0)
	setvar $sellhalf true
else
	setvar $sellhalf false
end

setvar $switchboard~message "Using ports with minimum " & $minimumproduct & " and stopping at roughly " & $stopturns & " turns.*"
gosub :switchboard~switchboard

send "'"&$switchboard~bot_name&" login*"
waiton "Corporate command "

setvar $switchboard~message "This script assumes all bots are placed correctly before this script is run.*"
gosub :switchboard~switchboard

setdelaytrigger    3 :waitforunlock 3000
pause

:waitforunlock
send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"
if ($planet~citadel < 4)
	setvar $switchboard~message "You must run Team Mega from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end
if (($planet~citadel_credits + $player~credits) < 5000000)
	setvar $switchboard~message "WARNING - You should have at least 5 million credits in the citadel or on hand for Team Mega.*"
	gosub :switchboard~switchboard
	#halt
end

setvar $switchboard~message "Logging into all bots.*"
gosub :switchboard~switchboard
send "xtlogin**q "

setvar $switchboard~message "Doing roll call.*"
gosub :switchboard~switchboard

setvar $i 1
setvar $roll_call_done false
setvar $blue_count 0
setvar $current_robber 0
setvar $backup_robber 0
while (($i <= $max_bots) and ($roll_call_done = false))
	send "'mega"&$i&" callout*"
	setdelaytrigger    3 :done 3000
	settextlinetrigger 2 :found "Team: mega"&$i&" "
	pause

	:toomany
	setvar $switchboard~message "Too many bots responding to mega"&$i&".  Please fix bot teams so each mega bot is unique.*"
	gosub :switchboard~switchboard
	halt

	:found
	getwordpos currentline $pos "Team: "
	cuttext currentline $line $pos 9999
	getword $line $sector 4
	getword $line $exp 6
	getword $line $align 8
	getword $line $credits 10
	getword $line $ship 12
	getword $line $turns 14

	if (($turns < $stopturns) and ($player~unlimited_game <> true))
		setvar $switchboard~message "mega"&$i&" does not have enough turns for buydowns.  Replace them with someone with turns.*"
		gosub :switchboard~switchboard
		halt
	end
	getwordpos $align $pos "-"
	setvar $bots[$i] $i
	if ($pos > 0)
		if ($align > $min_red_alignment)
			add $blue_count 1
			setvar $switchboard~message "mega"&$i&" needs alignment lower then " & $min_red_alignment & ".  Treating as a blue mega.*"
			gosub :switchboard~switchboard
		else
			add $red_count 1
			#mark as potential robber#
			setvar $bots[$i][2] true
			if ($current_robber <> 0)
				setvar $backup_robber $current_robber
			end
			setvar $current_robber $bots[$i]
			setvar $switchboard~message "Found potential megarob robber!*"
			gosub :switchboard~switchboard
		end
	else
		add $blue_count 1
	end
	setvar $bots[$i][1] $turns
	setvar $current_ship[$i] $ship
	setvar $original_ship[$i] $ship
	killtrigger 1
	settextlinetrigger 1 :toomany "} - Team: mega"&$i&" "
	pause

	:done
	killtrigger 1
	if ($bots[$i] = 0)
		setvar $roll_call_done true
	else
		send "'mega"&$i&"*"
		waiton "} - You are logged into this bot. "
		# bot name #
		setvar $current_line currentline
		gettext currentline $bots[$i][3] "{" "} - You are logged into this bot."
		getword $current_line $isthisme 1
		if ($isthisme = "R")
			gettext $current_line $bots[$i][4] "R " "["
		else
			setvar $bots[$i][4] $player~trader_name
		end

		send "'" $bots[$i][3] " unlock*"
		waiton "{"&$bots[$i][3]&"} - Ship has been unlocked!"

		setvar $switchboard~message "Bot name captured as: "&$bots[$i][3]&" for "&$bots[$i][4]&"*"
		gosub :switchboard~switchboard

		if ($bots[$i][2] <> true)
			# mark this person as a swappable ship #
			setvar $swapwithme $bots[$i][4]
		end
	end
	add $i 1
end

gosub :killthetriggers

if ($red_count < 1)
	setvar $switchboard~message "Found "&$red_count&" reds. Need at least one red.  Make sure all bots callin as mega1, mega2, etc.*"
	gosub :switchboard~switchboard
	halt
end

if (($blue_count+$red_count) < 1)
	setvar $switchboard~message "Found "&($blue_count+$red_count)&" mega bots. Need at least two mega bots.  Make sure all bots callin as mega1, mega2, etc.*"
	gosub :switchboard~switchboard
	halt
end

if ($red_count > 1)
	setvar $switchboard~message "Found "&$red_count&" red bots.*"
else
	setvar $switchboard~message "Found "&$red_count&" red bot.*"
end
gosub :switchboard~switchboard

if ($blue_count > 1)
	setvar $switchboard~message "Found "&$blue_count&" blue bots.*"
else
	setvar $switchboard~message "Found "&$blue_count&" blue bot.*"
end
gosub :switchboard~switchboard

setarray $checkedports sectors
setarray $que sectors

while (true)
	gosub :player~quikstats
	gosub :grabplanetstats
	gosub :findports
	gosub :pwarptoport
	if ($go_to_next_port = false)
		if ($isgoodbuyer = true)
			gosub :findbestcandidates
			gosub :selloffproduct
			setvar $check $current_trader
			gosub :checkin

			if (port.buyfuel[$player~current_sector] = 0)
				gosub :findbestcandidates
				if ($current_robber = $current_trader)
					gosub :switchships
				end
				gosub :startbuydownfuel
				setvar $check $current_trader
				gosub :checkin
				if ($current_robber = $current_trader)
					gosub :switchships
				end
			end
		end
		if ($isgoodseller = true)
			gosub :findbestcandidates
			if ($current_robber = $current_trader)
				gosub :switchships
			end
			gosub :startbuydownequip
			setvar $check $current_trader
			gosub :checkin
			if ($current_robber = $current_trader)
				gosub :switchships
			end

			gosub :findbestcandidates
			if ($current_robber = $current_trader)
				gosub :switchships
			end
			if (port.buyfuel[$player~current_sector] = 0)
				gosub :startbuydownfuel
			end
			setvar $check $current_trader
			gosub :checkin
			if ($current_robber = $current_trader)
				gosub :switchships
			end

			gosub :findbestcandidates
			gosub :domega
			if (($do_backup_robber = true) and ($backup_robber <> "0"))
				setvar $save_current_robber $current_robber
				setvar $current_robber $backup_robber
				gosub :switchrobberships
				gosub :domega
				gosub :switchrobberships
				setvar $current_robber $save_current_robber
			end
			setvar $check $current_robber
			gosub :checkin
		end
	end
end

halt

:checkin
killtrigger 1
send "'mega"&$check&" callout*"
settextlinetrigger 1 :foundtrader "Team: mega"&$check&" "
pause

:foundtrader
getwordpos currentline $pos "Team: "
cuttext currentline $line $pos 9999
getword $line $sector 4
getword $line $exp 6
getword $line $align 8
getword $line $credits 10
getword $line $ship 12
getword $line $turns 14

setvar $bots[$check][1] $turns
return

:domega
setvar $once 0
setvar $do_backup_robber false

:megaagain
setvar $evilbot $bots[$current_robber][3]
if ($game~mbbs = true)
	send "'"&$evilbot&" mega*"
else
	send "'"&$evilbot&" rob*"
end
settextlinetrigger 1 :mrbusted "[Busted"
settextlinetrigger 2 :mrbusted2 "Fake Busted"
settextlinetrigger 3 :mrshort "Port is short"
settextlinetrigger 4 :mrrobbed "] {"&$evilbot&"} - Success! - "
settextlinetrigger 5 :mrsecond "credits left for a second mega"
pause

:mrshort
return

:mrrobbed
gosub :killthetriggers
settextlinetrigger 1 :mrsecond "credits left for a second mega"
setdelaytrigger    2 :mrdelayover 2000
pause

:mrdelayover
gosub :killthetriggers
return

:mrsecond
setvar $do_backup_robber true
gosub :killthetriggers
return

:mrbusted
:mrbusted2
setvar $do_backup_robber true
gosub :killthetriggers
return

return

:waitfor200e
:againe
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword currentline $eonhand 3
if ($eonhand > $buydownholds)
	return

else
	goto :againe
end

return

:startbuydownequip
setvar $nextbot $bots[$current_trader][3]
send "'" & $nextbot & " buy e w *"

settextlinetrigger 1 :startdock1 " docks at"
settextlinetrigger 2 :startdock2 "Commerce report for"
setdelaytrigger    3 :startdockdelay 5000
pause

:startdockdelay
gosub :killthetriggers
send "'" $nextbot " stopall*"
waitfor " non-system scripts and modules killed, and mode"

send "'" $nextbot " land*"
waitfor "] {"&$nextbot&"} - In Cit - Plane"
send "'" $nextbot " cn*"
waitfor "] {"&$nextbot&"} - CN Settings are reset for this bo"
send "'" & $nextbot & " buy e w *"

:startdock1
:startdock2
:bdagain1
gosub :killthetriggers

settextlinetrigger 1 :bdcomplete1 "] {"&$nextbot&"} - Buy down exiting --- Nothing to buy"
settextlinetrigger 2 :bdcomplete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
settextlinetrigger 3 :bdcash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

pause

:bdcash1
gosub :killthetriggers
send "'" $nextbot " w 4000000*"
waitfor "] {"&$nextbot&"} - 4,000,000 credits taken from citadel."
goto :bdagain1

:bdcomplete1
gosub :killthetriggers
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword currentline $eonhand 3
return

:startbuydownfuel
setvar $nextbot $bots[$current_trader][3]
send "'" & $nextbot & " buy f s *"

settextlinetrigger 1 :startdock3 " docks at"
settextlinetrigger 2 :startdock4 "Commerce report for"
setdelaytrigger    3 :startdockdelay2 5000
pause

:startdockdelay2
gosub :killthetriggers
send "'" $nextbot " stopall*"
waitfor " non-system scripts and modules killed, and mode"

send "'" $nextbot " land*"
waitfor "] {"&$nextbot&"} - In Cit - Plane"
send "'" $nextbot " cn*"
waitfor "] {"&$nextbot&"} - CN Settings are reset for this bo"
send "'" & $nextbot & " buy f s *"

:startdock3
:startdock4
gosub :killthetriggers

settextlinetrigger 1 :complete1 "] {"&$nextbot&"} - Buy down exiting --- Nothing to buy"
settextlinetrigger 2 :complete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
settextlinetrigger 3 :cash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

pause

:cash1
gosub :killthetriggers
send "'" $nextbot " w 4000000*"
waitfor "] {"&$nextbot&"} - 4,000,000 credits taken from citadel."
goto :bdagain1

:complete1
gosub :killthetriggers
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword currentline $eonhand 3
return

:selloffproduct
:startsell
if ($sellhalf = true)
	send "'"&$bots[$current_trader][3]&" neg o e half*"
else
	send "'"&$bots[$current_trader][3]&" neg o e*"
end
settextlinetrigger 1 :good "] {"&$bots[$current_trader][3]&"} - Done with port"
settextlinetrigger 2 :bad  "] {"&$bots[$current_trader][3]&"} - Nothing to sell"
pause

:good
killtrigger 2
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword currentline $eonhand 3
if ($eonhand > 20000)
	setvar $switchboard~message "Neg fail detected! trying again*"
	gosub :switchboard~switchboard
	goto :startsell
end

:bad
killtrigger 1
return

:findbestcandidates
setvar $i 1
setvar $highest_turns 0
setvar $current_trader 0
while ($i <= $max_bots)
	# pick the bot with highest turn who is not the designated robber/a robber and has more than
	# stop turns  stop_turns - minus half a port
	if (($bots[$i][1] > $highest_turns) and (($bots[$i][1] -65) > $stopturns))
		setvar $current_trader $bots[$i]
		setvar $highest_turns $bots[$i][1]
	end
	add $i 1
end
if ($current_trader = "0")
	setvar $switchboard~message "Well, that shouldn't have happened.  I can't find a trader to go next!  Halting.*"
	gosub :switchboard~switchboard
	halt
end
return

:switchrobberships
setvar $switchto $bots[$save_current_robber][4]
goto :doswitch

:switchships
setvar $switchto $swapwithme

:doswitch
send "'" $bots[$current_trader][3] " switch " $switchto "*"
waiton "} - Switched successfully!"
return

:grabplanetstats
send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"
return

:findports
setvar $bottom 1
setvar $top 1
setvar $nearfig 0
setvar $que[1] $player~current_sector
setarray $checked sectors
setvar $checked[$player~current_sector] 1

:tryagain2
while ($bottom <= $top)
	# Now, pull out the next sector in the que, and make it our focus
	setvar $focus $que[$bottom]

	getsectorparameter $focus "MEGABUY" $isgoodbuyer
	getsectorparameter $focus "MEGASELL" $isgoodseller
	getsectorparameter $focus "FIGSEC" $isfigged

	# Check to see if planet has equipment to sell, or if planet is too full to go to next seller.  #
	# Hopefully it will pick the closest, best option based on this. #

	if ($checkedports[$focus] <> true)
		if (sector.explored[$focus] = "YES")
			if ((((port.exists[$focus] = true) and (port.class[$focus] > 0))) and ((($isgoodbuyer = true) and ($planet~planet_equipment > $minimumproduct)) or (($isgoodseller = true) and (($planet~planet_equipment_max - $planet~planet_equipment) >= $game~port_max))))
				send "cr"&$focus&"*q"
				gosub :player~quikstats
				if (port.equip[$focus] >= $minimumproduct)
					# fig found 0 hops
					setvar $nearfig $focus
					setvar $checkedports[$nearfig] true
					setvar $totalportfuel port.fuel[$focus]
					return
				else
					setvar $nearfig 0
				end
			else
				setvar $nearfig 0
			end
		else
			if ((($isgoodbuyer = true) and ($planet~planet_equipment > $minimumproduct)) or (($isgoodseller = true) and (($planet~planet_equipment_max - $planet~planet_equipment) > $game~port_max)))
				# fig found 0 hops
				setvar $nearfig $focus
				setvar $checkedports[$nearfig] true
				setvar $totalportfuel port.fuel[$focus]
				return
			else
				setvar $nearfig 0
			end
		end
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
setvar $switchboard~message "Can't find a route to any other MEGABUY OR MEGASELL ports.*"
gosub :switchboard~switchboard
halt
return

:pwarptoport
if ($nearfig > 0)
	gosub :killthetriggers
	send "p"&$nearfig&"*ys** "
	settextlinetrigger 1 :emptyport "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
	settextlinetrigger 2 :emptyport "You are already in that sector!"
	settextlinetrigger 3 :nofigatlocation "Your own fighters must be in the destination to make a safe jump."
	settextlinetrigger 4 :donenofuel "You do not have enough Fuel Ore on this planet to make the jump."
	pause

	:emptyport
	gosub :killthetriggers
	send "cr"&$nearfig&"*q"
	gosub :player~quikstats
	setsectorparameter $nearfig "FIGSEC" true
	if ((port.exists[$nearfig] = true) and (port.class[$nearfig] > 0) and (sector.explored[$nearfig] = "YES") and (port.equip[$nearfig] >= $minimumproduct))
		setvar $go_to_next_port false
	else
		setvar $go_to_next_port true
	end

	return

	:nofigatlocation
	gosub :killthetriggers
	setsectorparameter $nearfig "FIGSEC" false
	setvar $go_to_next_port true
	return

	:donenofuel
	gosub :killthetriggers
	setvar $switchboard~message "Your planet doesn't have enough fuel to jump to the next closest port.  Halting.*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "Couldn't find a way to another port.  Weird.*"
	gosub :switchboard~switchboard
	halt
end

:killthetriggers
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
killtrigger 5
killtrigger 6
return

#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
