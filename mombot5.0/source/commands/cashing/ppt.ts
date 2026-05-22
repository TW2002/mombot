gosub :loadvars~loadvars
gosub :help~initialize

#ppt explore

#prioritise good ports - i.e. those selling ore
# make decision where to go
#   check surround and grid other priorites: SSB SBS
#   check surround grid sub priorities - i.e. BSB BBS - we probably have ecess of those anyway - maybe if more than X warps, go in, density, see if worth holodin, holo, and com back

# check for pairs - if BXX BXX - Trade? - trading these should be a priority
# or - trade to point

#trade individuals when can/test MCIC

#swhen stuck, find nearest 5-6 warp?

setvar $help~help[1]  $help~tab&"       Scans and offers available PPT trades to adj sectors "
setvar $help~help[2]  $help~tab&"       Aimed at Day 1 use - the only time to use PPT!"
setvar $help~help[3]  $help~tab&"        "
setvar $help~help[4]  $help~tab&"       ppt [sector/?] {h/t/n) {p:x} {k:x} {ore:x}"
setvar $help~help[5]  $help~tab&"           {twarp}"
setvar $help~help[6]  $help~tab&" Options:"
setvar $help~help[7]  $help~tab&"    [sector/?]     Sector to trade or ? to scan and choose."
setvar $help~help[8]  $help~tab&"    {h/t/n}        h  - internal haggle; "
setvar $help~help[9]  $help~tab&"                   n  - no haggle, just accepts the price"
setvar $help~help[10] $help~tab&"                   t  - 3rd party haggle like EP - DEFAULT."
setvar $help~help[11] $help~tab&"    {p:x}         When either product hits this % it will stop "
setvar $help~help[12] $help~tab&"                   - Defaults to 30% (p:30)"
setvar $help~help[13] $help~tab&"    {k:x}         k:5 - Keep this many holds of equipment at end of run. "
setvar $help~help[14] $help~tab&"                   Used so we can test port MCICs as we travel."
setvar $help~help[15] $help~tab&"    ore:x          Keep this amount of ore to keep post trade."
setvar $help~help[16] $help~tab&"    twarp          Indicate we are PPTing between isolated ports."

gosub :help~helpfile

setvar $switchboard~message "Paired Port Trade starting up!*"
gosub :switchboard~switchboard

# We need min percentages
# We need haggle option
# PPT hag 50

#setVar $PLAYER~moveIntoSector SECTOR.WARPS[CURRENTSECTOR][$sector]
#gosub :PLAYER~moveIntoSector

# 0 means we keep none
setvar $keepequip 0
setvar $tradingminper 50
setvar $haggle "t"

getword $bot~user_command_line $parm1 1
getword $bot~user_command_line $parm2 2
getword $bot~user_command_line $parm3 3

if ($parm2 <> "")
	if ($parm2 = "h")
		setvar $haggle "h"
	elseif ($parm2 = "n")
		setvar $haggle "n"
	elseif ($parm2 = "t")
		setvar $haggle "t"

	end
end
if ($parm3 <> "")
	if ($parm3 = "h")
		setvar $haggle "h"
	elseif ($parm3 = "n")
		setvar $haggle "n"
	elseif ($parm3 = "t")
		setvar $haggle "t"

	end
end
getwordpos " "&$bot~user_command_line&" " $pos " p:"
if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $tradingminper "p:" " "
	isnumber $test $tradingminper
	if ($test)

	else
		setvar $switchboard~message "Trading min should be a number.*"
		gosub :switchboard~switchboard
		halt
	end

else
	setvar $tradingminper 50
end

if ($tradingminper > 90)
	setvar $tradingminper 90
end

getwordpos " "&$bot~user_command_line&" " $pos " k:"

if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $keepequip "k:" " "

	isnumber $test $keepequip
	if ($test)

	else
		setvar $switchboard~message "Equipment holds to keep should be a number.*"
		gosub :switchboard~switchboard
		halt
	end

else
	setvar $keepequip 0
end

gosub :player~quikstats

getwordpos $bot~user_command_line $pos "twarp"
if ($pos > 0)
	setvar $twarp 1

	if (($player~twarp_type = 0) or ($player~twarp_type = "No"))
		setvar $switchboard~message "Your going to need a TWarp Drive to TWARP.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $twarp 0
end

getwordpos " "&$bot~user_command_line&" " $pos " ore:"

if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $finishore "ore:" " "

	isnumber $test $finishore
	if ($test)

	else
		setvar $switchboard~message "Equipment holds to keep should be a number.*"
		gosub :switchboard~switchboard
		halt
	end

else
	setvar $finishore 0
end

setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "PPT Must start at command prompt.*"
	gosub :switchboard~switchboard
	halt

end

if ($parm1 = "0")
	setvar $parm1 "?"
end

isnumber $test $parm1
if (($test = false) and ($parm1 <> "?"))

	setvar $switchboard~message "Invalid sector. Please enter a sector number or '?'.*"
	gosub :switchboard~switchboard
	halt
end

if ($parm1 = "h")
	setvar $haggle "h"
elseif ($parm1 = "n")
	setvar $haggle "n"
elseif ($parm1 = "t")
	setvar $haggle "t"
end

setvar $tradingsector1 0
setvar $tradingtype 0

:pptupdatedata
if ($parm1 = "?")
	setvar $i 1
	send "c"
	waitfor "<Computer activated>"
	send "r" currentsector "*"
	while ($i <= sector.warpcount[currentsector])

		send "f" sector.warps[currentsector][$i] "*" currentsector "*"
		send "r" sector.warps[currentsector][$i] "*"

		add $i 1
	end
	send "q"
	waitfor "<Computer deactivated>"
	gosub :displayportreport
	setvar $tradingsector2 currentsector
	setvar $porttest1 $tradingsector1
	setvar $porttest2 $tradingsector2
	gosub :istradingport
else
	setvar $tradingsector1 $parm1
	setvar $tradingsector2 currentsector
	isnumber $res $tradingsector1
	if ($res = 0)
		setvar $switchboard~message "Invalid sector. Please enter a sector number or '?'.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($twarp = 0)
		setvar $i 1
		setvar $sectorfound 0
		while ($i <= sector.warpcount[currentsector])
			if ($tradingsector1 = sector.warps[currentsector][$i])
				setvar $sectorfound 1
			end
			add $i 1
		end
		if ($sectorfound = 0)
			setvar $switchboard~message "Sector not adjacent.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	send "cr" $tradingsector1 "*f" $tradingsector1 "*" currentsector "*q"
	settextlinetrigger shortest1 :shortest1 "The shortest path "
	pause

	:shortest1
	killtrigger shortest1
	getword currentline $distanceto2 4
	striptext $distanceto2 "("
	setvar $fuelto2 ($distanceto2 * 3)

	waitfor "<Computer deactivated>"

	if ($twarp = 0)
		if ($distanceto2 > 1)
			setvar $switchboard~message "The trade sector is not a two way warp.*"
			gosub :switchboard~switchboard
			halt
		end
	else
		send "cf" $tradingsector2 "*" $tradingsector1 "*q"
		settextlinetrigger shortest2 :shortest2 "The shortest path "
		pause

		:shortest2
		killtrigger shortest2
		getword currentline $distanceto1 4
		striptext $distanceto1 "("
		setvar $fuelto1 ($distanceto1 * 3)
		waitfor "<Computer deactivated>"

	end
	setvar $porttest1 $tradingsector1
	setvar $porttest2 $tradingsector2
	gosub :istradingport
	if ($portcantrade = 0)
		gosub :buildnotrademessage
		gosub :switchboard~switchboard
		halt
	end

	send "cr" currentsector "*q"
	waitfor "<Computer deactivated>"

end

gosub :player~quikstats
if ($player~colonist_holds > 0)
	setvar $switchboard~message "Don't bore the tourists, offload the colonists.*"
	gosub :switchboard~switchboard
	halt
end

if ($twarp = 1)
	if (($player~organic_holds > 0) and (port.buyorg[$player~current_sector] = 0))
		setvar $switchboard~message "This port sells organics and we have orgs in hold.*"
		gosub :switchboard~switchboard
		halt
	end
	if (($player~equipment_holds > 0) and (port.buyequip[$player~current_sector] = 0))
		setvar $switchboard~message "This port sells equipment and we have equipment in hold.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $buyfuel1 0
	setvar $buyfuel2 0

	if ((port.buyfuel[$tradingsector1] = 0) and (port.buyfuel[$tradingsector2] = 0))
		setvar $buyfuel1 $fuelto2
		setvar $buyfuel2 $fuelto1

	elseif (port.buyfuel[$tradingsector1] = 0)
		setvar $buyfuel1 ($fuelto2 + $fuelto1)
	elseif (port.buyfuel[$tradingsector2] = 0)
		setvar $buyfuel2 ($fuelto2 + $fuelto1)
	else
		setvar $switchboard~message "Neither of the ports have a fuel supply.*"
		gosub :switchboard~switchboard
		halt
	end

	if (port.buyfuel[$tradingsector2] = 1)
		if ($player~ore_holds < $fuelto1)
			setvar $switchboard~message "We won't be able to get to the other port; not enough fuel in holds or at port.*"
			gosub :switchboard~switchboard
			halt
		end
	else
		if ($player~ore_holds > 0)
			send "jy"
		end
	end
end

if ($finishore > 0)
	if ((port.buyfuel[$tradingsector1] = 1) and (port.buyfuel[$tradingsector2] = 1))
		setvar $switchboard~message "You've request ore at end of trade - Neither port sells it.*"
		gosub :switchboard~switchboard
		halt
	end
end

# gosub :voidadjacent

setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

setvar $firstmove 1

getsector $tradingsector1 $sec2
getsector $tradingsector2 $sec1

setvar $sec1_maxfuel 0
setvar $sec1_maxorg 0
setvar $sec1_maxequip 0
setvar $sec2_maxfuel 0
setvar $sec2_maxorg 0
setvar $sec2_maxequip 0

setvar $skip_first 0
setprecision 2
if ($tradefuel = 1)
	setvar $sec1_maxfuel (port.fuel[$sec1.index] * (100/port.percentfuel[$sec1.index]))
	setvar $sec2_maxfuel (port.fuel[$sec2.index] * (100/port.percentfuel[$sec2.index]))
end
if ($tradeorg = 1)
	setvar $sec1_maxorg ($sec1.port.org * (100/port.percentorg[$sec1.index]))
	setvar $sec2_maxorg ($sec2.port.org * (100/port.percentorg[$sec2.index]))
end
if ($tradeequip = 1)
	setvar $sec1_maxequip ($sec1.port.equip * (100/port.percentequip[$sec1.index]))
	setvar $sec2_maxequip ($sec2.port.equip * (100/port.percentequip[$sec2.index]))
end
setprecision 0

if (($tradefuel = 0) and ($player~ore_holds > 0) and (port.buyfuel[$sec1.index] = 0))
	send "jy"
	waitfor "ettison Cargo"
	waitfor "Command ["
	gosub :player~quikstats
	setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
end
if (($tradeorg = 0) and ($player~organic_holds > 0) and ($sec1.port.buy_org = "NO"))
	send "jy"
	waitfor "ettison Cargo"
	waitfor "Command ["
	gosub :player~quikstats
	setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
end
if (($tradeequip = 0) and ($player~equipment_holds > 0) and ($sec1.port.buy_equip = "NO"))
	send "jy"
	waitfor "ettison Cargo"
	waitfor "Command ["
	gosub :player~quikstats
	setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
end

setvar $sellableactiveholds 0
if (($tradefuel = 1) and (port.buyfuel[$sec1.index] = 1))
	add $sellableactiveholds $player~ore_holds
end
if (($tradeorg = 1) and ($sec1.port.buy_org = "YES"))
	add $sellableactiveholds $player~organic_holds
end
if (($tradeequip = 1) and ($sec1.port.buy_equip = "YES"))
	if ($player~equipment_holds > $keepequip)
		setvar $equipsellable ($player~equipment_holds - $keepequip)
		add $sellableactiveholds $equipsellable
	end
end

if (($sellableactiveholds = 0) and ($empty_holds = 0))
	setvar $skip_first 1
end

gosub :player~quikstats

setvar $currentlocation 2
setvar $test 1

setvar $prod1 0
setvar $prod2 0
setvar $report 0
setvar $reportfuelcheck $player~ore_holds
setvar $port1ok 1
setvar $port2ok 1

if ($skip_first = 0)
	# Trade first sector
	# Skipore - if we buy ore, and re-trade, we don't want tobuy again
	setvar $skipore 0

	:firsttradestart
	gosub :portandtrade
	if ($report)
		setvar $report 0
		gosub :checkreportfuel
		goto :firsttradestart
	end
	gosub :player~quikstats
end

# check we have a fig here
setvar $chkftrsector $sec1.index
gosub :chkftr

#move to second sector and begin
setvar $moveto $sec2.index
gosub :movetosector

gosub :chkftr
setvar $currentlocation 1

setvar $c 0

while ($test = 1)
	setvar $skipore 0

	:looptrade2
	if (($finishore > 0) and (($port1ok = 0) and ($port2ok = 0)))
		setvar $buyore $finishore
		gosub :player~quikstats
		setvar $reportfuelcheck $player~ore_holds
	end

	gosub :portandtrade
	if ($report)
		setvar $report 0
		gosub :checkreportfuel
		goto :looptrade2
	end
	gosub :player~quikstats

	if (($port2ok = 0) and ($port1ok = 0))
		if (($finishore > 0) and ($player~ore_holds < $finishore))
			# one more time - due to setup next port must have the ore
		else
			# we done, move on!
			setvar $test 0
			goto :finishandexit
		end
	end
	if (($port1ok = 1) and ($port2ok = 0))
		# Force Fail Other port but let it do one more trade
		setvar $port1ok 0
	end

	setvar $moveto $sec1.index
	gosub :movetosector

	setvar $currentlocation 2
	setvar $skipore 0

	:looptrade1
	if (($finishore > 0) and (($port1ok = 0) and ($port2ok = 0)))
		setvar $buyore $finishore
		gosub :player~quikstats
		setvar $reportfuelcheck $player~ore_holds
	end
	gosub :portandtrade
	if ($report)
		setvar $report 0
		gosub :checkreportfuel
		goto :looptrade1
	end
	gosub :player~quikstats

	if (($port2ok = 0) and ($port1ok = 0))
		# we done, move on!
		if (($finishore > 0) and ($player~ore_holds < $finishore))
			# one more time
		else
			setvar $test 0
			goto :finishandexit
		end
	end
	if (($port2ok = 1) and ($port1ok = 0))
		# Force Fail Other port but let it do one more trade
		setvar $port2ok 0
	end

	setvar $moveto $sec2.index
	gosub :movetosector
	setvar $currentlocation 1

	:finishandexit
	#Safety/Testing check
	add $c 1
	#if ($c > 20)
	#	setVar $test 0
	#end

end

#gosub :clearadjacent
setvar $switchboard~message "PPT Complete.*"
gosub :switchboard~switchboard
halt

:movetosector
if ($twarp = 1)
	setvar $player~warpto $moveto
	gosub :move~twarp
	if ($player~twarpsuccess = false)
		setvar $switchboard~message "Failed to TWARP to: " & $player~warpto &  " - POTENIAL ISSUE!.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $move~moveintosector $moveto
	gosub :move~moveintosector
end
return

:portandtrade
//
setvar $report 0
setvar $tradegood 0
send "p   t"
waitfor "Commerce report for"
gosub :getcommercereport
settextlinetrigger checkcash :checkcash "empty cargo holds"
settextlinetrigger portfail :portfail "ou don't have anything they want, and they don't have anything you can b"
pause

:portfail
setvar $switchboard~message "Oops nothing to trade; script fail?*"
gosub :switchboard~switchboard
halt

:checkcash
killalltriggers
getword currentline $ccredits 3
striptext $ccredits ","
striptext $ccredits "."

killalltriggers

:tradeloop
settexttrigger sell1 :sell1 "How many holds of Fuel Ore do you want to sell"
settexttrigger sell2 :sell2 "How many holds of Organics do you want to sell"
settexttrigger sell3 :sell3 "How many holds of Equipment do you want to sell"
settexttrigger buy1 :buy1 "How many holds of Fuel Ore do you want to buy"
settexttrigger buy2 :buy2 "How many holds of Organics do you want to buy"
settexttrigger buy3 :buy3 "How many holds of Equipment do you want to buy"
settexttrigger tradeloopdone :tradeloopdone "Command ["
pause

:sell1
setvar $player~multiplier 105
killalltriggers
setvar $tradegood 1
gosub :dotrade
goto :tradeloop

:sell2
setvar $player~multiplier 105
killalltriggers
setvar $tradegood 2
gosub :dotrade
goto :tradeloop

:sell3
setvar $player~multiplier 105
killalltriggers
setvar $tradegood 3
gosub :dotrade
goto :tradeloop

:buy1
killalltriggers
setvar $player~multiplier 95
setvar $tradegood 4
# $skipore = 1 - means we traded it previously and we are retrading and need to skip
if ($skipore = 0)
	if (($tradefuel = 1) or ($twarp = 1) or ($buyore > 0))

		gosub :dotrade
	else
		gosub :notrade
	end
else
	gosub :notrade
end
goto :tradeloop

:buy2
killalltriggers
setvar $player~multiplier 95
setvar $tradegood 5

if ($skiprest = 1)
	gosub :notrade
elseif ($tradeorg = 1)
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:buy3
killalltriggers
setvar $player~multiplier 95
setvar $tradegood 6
if ($skiprest = 1)
	gosub :notrade
elseif ($tradeequip = 1)
	gosub :dotrade
else
	gosub :notrade
end

:tradeloopdone
killalltriggers
return

:getcommercereport
setvar $cfuel 0
setvar $corg 0
setvar $cequip 0

//get it
waitfor "Docking Log"

:dockinglog
settextlinetrigger cr1 :cr1 "Fuel Ore"
settextlinetrigger cr2 :cr2 "Organics"
settextlinetrigger cr3 :cr3 "Equipment"
pause

:cr1
killalltriggers
if ($tradefuel = 1)
	getword currentline $cfuel 4
end
goto :dockinglog

:cr2
killalltriggers
if ($tradeorg = 1)
	getword currentline $corg 3
end
goto :dockinglog

:cr3
killalltriggers
if ($tradeequip = 1)
	getword currentline $cequip 3
end

if ($tradefuel = 1)
	setvar $cfuel ($cfuel - $player~total_holds)
end
if ($tradeorg = 1)
	setvar $corg ($corg - $player~total_holds)
end
if ($tradeequip = 1)
	setvar $cequip ($cequip - $player~total_holds)
end

setprecision 2
if (currentsector = $sec1.index)
	setvar $portgoodok 1
	if ($tradefuel = 1)
		setvar $cpercfuel (($cfuel/$sec1_maxfuel) * 100)
		if ($cpercfuel < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($tradeorg = 1)
		setvar $cpercorg (($corg/$sec1_maxorg) * 100)
		if ($cpercorg < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($tradeequip = 1)
		setvar $cpercequip (($cequip/$sec1_maxequip) * 100)
		if ($cpercequip < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($portgoodok = 0)
		setvar $port1ok 0
	end
else
	setvar $portgoodok 1
	if ($tradefuel = 1)
		setvar $cpercfuel (($cfuel/$sec2_maxfuel) * 100)
		if ($cpercfuel < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($tradeorg = 1)
		setvar $cpercorg (($corg/$sec2_maxorg) * 100)
		if ($cpercorg < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($tradeequip = 1)
		setvar $cpercequip (($cequip/$sec2_maxequip) * 100)
		if ($cpercequip < $tradingminper)
			setvar $portgoodok 0
		end
	end
	if ($portgoodok = 0)
		setvar $port2ok 0
	end
end

setprecision 0
return

:notrade
send "0*"
waitfor "empty cargo holds."
return

:dotrade
if ((($tradegood = 1) or ($tradegood = 4)) and ($twarp = 1))
	# selling or buying ore - and doing twarp

	if ($tradegood = 4)
		# Port is selling ore
		if ($buyore > 0)
			# we are buying ore at end of cycle - we should buy ore and exit out.
			send $buyore "*"
			setvar $skiprest 1
		elseif (($currentlocation = 2) and ($buyfuel2 > 0))
			if ($tradefuel = 1)
				# Trade is SXB to BXS - buy all ore
				send "*"
			else
				send $buyfuel2 "*"
			end
		elseif ($currentlocation = 2)
			gosub :notrade
			return
		elseif (($currentlocation = 1) and ($buyfuel1 > 0))
			if ($tradefuel = 1)
				# Trade is SXB to BXS - buy all ore
				send "*"
			else
				send $buyfuel1 "*"
			end
		else
			gosub :notrade
			return
		end
	else
		// port is buying ore
		if ($tradefuel = 0)
			# port wants to buy ore - we are in a Equip-Org cycle
			# this must be for driving home
			gosub :notrade
			return
		else
			# We need to sell some ore - but how much.
			if ($currentlocation = 1)
				# we only need to keep enought to get to port 2
				# one port MUST sell ore, and it's the other.
				setvar $sellamount ($player~ore_holds - $fuelto2)
				send $sellamount "*"
			else
				# we only need to keep enought to get to port 1
				# one port MUST sell ore, and it's the other.
				setvar $sellamount ($player~ore_holds - $fuelto1)
				send $sellamount "*"
			end

		end
	end
else
	if (($port1ok = 0) and ($port2ok = 0))

		if (($tradegood = 4) and ($buyore > 0))
			send $buyore "*"
			setvar $skiprest 1
		else
			# one of the ports is at min % so we are onto last two trades
			# we want to keep the min equip holds
			if (($keepequip > 0) and (port.buyequip[currentsector]))
				setvar $h ($player~total_holds - $keepequip)
				send $h "*"
			else
				send "*"
			end
		end

	else
		send "*"
	end
end
if (($haggle = "t") or ($haggle = "h"))

	if ($haggle = "t")
		waitfor "Agreed,"
		settextlinetrigger tradefin :tradefin "empty cargo holds"
		pause

		:tradefin
		killalltriggers
		getword currentline $ncredits 3
		striptext $ncredits ","
		striptext $ncredits "."

		if ($ncredits = $ccredits)
			setvar $report 1
		else
			setvar $ccredits $ncredits
		end
	elseif ($haggle = "h")
		gosub :haggle~starthaggle
	end
else
	send "  *  "
end
return

:checkreportfuel
if ($buyore > 0)
	gosub :player~quikstats
	echo "ReportFuelCheck: " $reportfuelcheck " $playerholds " $player~ore_holds " *"
	if ($reportfuelcheck <> $player~ore_holds)
		setvar $buyore 0
		setvar $skipore 1
	end
end
return

:chkftr
if (sector.figs.quantity[$chkftrsector] = 0)
	if ($chkftrsector > 10)
		send "f   1  *  c  d "

	end
end

return

:istradingport
# $portTest1 / $portTest2
# $portCanTrade  - result

setvar $port1 port.class[$porttest1]
setvar $port2 port.class[$porttest2]
setvar $tradefuel 0
setvar $tradeorg 0
setvar $tradeequip 0
setvar $portcantrade 0
setvar $tradingtype 0

if (port.buyfuel[$porttest1] <> port.buyfuel[$porttest2])
	setvar $tradefuel 1
	add $portcantrade 1
end
if (port.buyorg[$porttest1] <> port.buyorg[$porttest2])
	setvar $tradeorg 1
	add $portcantrade 1
end
if (port.buyequip[$porttest1] <> port.buyequip[$porttest2])
	setvar $tradeequip 1
	add $portcantrade 1
end

if (($tradeorg = 1) and ($tradeequip = 1) and ($tradefuel = 0))
	setvar $tradingtype 1
elseif (($tradefuel = 1) and ($tradeequip = 1) and ($tradeorg = 0))
	setvar $tradingtype 2
elseif (($tradefuel = 1) and ($tradeorg = 1) and ($tradeequip = 0))
	setvar $tradingtype 3
end
gosub :settradesummary

return

:displayportreport
# 0 - zzz
# 1 - BBS
# 2 - BSB
# 3 - SBB
# 4 - SSB
# 5 - SBS
# 6 - BSS
# 7 - SSS
# 8 - BBB
# $tradingPorts - sectors you can trade with
# $tradingPortsDetails - details for the port report
# $tpi - number of prts you can trade with
setvar $tradingports 0
setvar $tradingportsdetails 0
setvar $tpi 0

setvar $i 1

while ($i <= sector.warpcount[currentsector])

	# check it has warps back
	setvar $w 1
	setvar $warpback 0

	while ($w <= sector.warpcount[sector.warps[currentsector][$i]])
		if (currentsector = sector.warps[sector.warps[currentsector][$i]][$w])
			setvar $warpback 1
		end
		add $w 1
	end

	if ($warpback = 1)
		setvar $porttest1 sector.warps[currentsector][$i]
		setvar $porttest2 currentsector
		gosub :istradingport
		if ($portcantrade > 0)
			add $tpi 1
			setvar $tradingports[$tpi] sector.warps[currentsector][$i]
			setvar $portreport $tradingports[$tpi]
			setvar $portreportline ""
			gosub :portreportline
			setvar $tradingportsdetails[$tpi] $portreportline
		end
	else
		echo "*############*# Sector " sector.warps[currentsector][$i]  " does not warp back "
	end
	add $i 1
end

:getport
if ($tpi = 0)
	setvar $switchboard~message "No adjacent two-way ports have any PPT lanes from here.*"
	gosub :switchboard~switchboard
	halt

end
setvar $i 1
echo "*####################################"
echo "*  Select a port to trade with"
echo "*  (q) to quit"
echo "*"

while ($i <= $tpi)

	echo $tradingportsdetails[$i]
	add $i 1
end
echo "*"

getconsoleinput $portoption singlekey
if ($portoption = "q")
	halt
end
isnumber $res $portoption
if ($res = 0)
	echo "**Must be a number or (q) to quit"
	goto :getport
end
if ($portoption > $tpi)
	echo "*That isn't an option!! try agian numbbat"
	goto :getport
end

setvar $tradingsector1 $tradingports[$portoption]

return

:portreportline
setvar $outputlen 6
setvar $outputtext $portreport
gosub :padoutputlen
setvar $portreportline "*" & ansi_11 & "      Pair(" & $tpi & "): " & ansi_11 & $outputtext & ansi_10 & " " & $tradesummary
if ($tradefuel = 1)
	setvar $reportgoodlabel "F"
	setvar $reportgoodqty port.fuel[$portreport]
	setvar $reportgoodpct port.percentfuel[$portreport]
	gosub :appendportreportgood
end
if ($tradeorg = 1)
	setvar $reportgoodlabel "O"
	setvar $reportgoodqty port.org[$portreport]
	setvar $reportgoodpct port.percentorg[$portreport]
	gosub :appendportreportgood
end
if ($tradeequip = 1)
	setvar $reportgoodlabel "E"
	setvar $reportgoodqty port.equip[$portreport]
	setvar $reportgoodpct port.percentequip[$portreport]
	gosub :appendportreportgood
end

return

:appendportreportgood
setvar $portreportline $portreportline & ansi_11 & "  " & $reportgoodlabel & ":"
setvar $outputlen 8
setvar $outputtext $reportgoodqty
gosub :padoutputlen
setvar $portreportline $portreportline & ansi_10 & $outputtext

setvar $outputlen 3
setvar $outputtext $reportgoodpct
gosub :padoutputlen
setvar $portreportline $portreportline & ansi_11 & "(" & $outputtext & "%)"

return

:settradesummary
setvar $tradesummary ""
if ($tradefuel = 1)
	setvar $tradesummary "FUEL"
end
if ($tradeorg = 1)
	if ($tradesummary <> "")
		setvar $tradesummary $tradesummary & "/"
	end
	setvar $tradesummary $tradesummary & "ORG"
end
if ($tradeequip = 1)
	if ($tradesummary <> "")
		setvar $tradesummary $tradesummary & "/"
	end
	setvar $tradesummary $tradesummary & "EQU"
end

return

:buildnotrademessage
setvar $portclassvalue port.class[$tradingsector2]
gosub :portclasscode
setvar $portclassname1 $portclasscode
setvar $portclassvalue port.class[$tradingsector1]
gosub :portclasscode
setvar $portclassname2 $portclasscode

setvar $switchboard~message "No PPT lanes between sector " & $tradingsector2 & " Class " & port.class[$tradingsector2] & " (" & $portclassname1 & ") and sector " & $tradingsector1 & " Class " & port.class[$tradingsector1] & " (" & $portclassname2 & ").*"

return

:portclasscode
setvar $portclasscode "ZZZ"
if ($portclassvalue = 1)
	setvar $portclasscode "BBS"
elseif ($portclassvalue = 2)
	setvar $portclasscode "BSB"
elseif ($portclassvalue = 3)
	setvar $portclasscode "SBB"
elseif ($portclassvalue = 4)
	setvar $portclasscode "SSB"
elseif ($portclassvalue = 5)
	setvar $portclasscode "SBS"
elseif ($portclassvalue = 6)
	setvar $portclasscode "BSS"
elseif ($portclassvalue = 7)
	setvar $portclasscode "SSS"
elseif ($portclassvalue = 8)
	setvar $portclasscode "BBB"
end

return

:padoutputlen
getlength $outputtext $len

if ($len < $outputlen)
	subtract $outputlen $len
	setvar $padi 1
	while ($padi <= $outputlen)
		setvar $outputtext   " " & $outputtext
		add $padi 1
	end
end

return

:voidadjacent
setvar $voidsector $tradingsector1
setvar $othersect $tradingsector2

gosub :voidadjacentppt
setvar $voidsector $tradingsector2
setvar $othersect $tradingsector1
gosub :voidadjacentppt

return

:clearadjacent
setvar $voidsector $tradingsector1
setvar $othersect $tradingsector2
gosub :clearadjacentppt
setvar $voidsector $tradingsector2
setvar $othersect $tradingsector1
gosub :clearadjacentppt

return

:voidadjacentppt
getsector $voidsector $sectorinfo
if ($sectorinfo.warp[1] = 0)
	send "'This sector has no warps, maybe you need to scan it first*"
	halt
else
	setvar $voidsect 0

	:voids
	add $voidsect 1
	if ($voidsect < 7)
		if ($sectorinfo.warp[$voidsect] <> 0)
			if ($sectorinfo.warp[$voidsect] <> $othersect)
				send "CV" & $sectorinfo.warp[$voidsect] & "*Q"
			end
		end
		goto :voids
	end

	setvar $switchboard~message "Avoids set on adjacent sectors!*"
	gosub :switchboard~switchboard
	send "/"
	waitfor " Sect "
end
return

:clearadjacentppt
getsector $voidsector $sectorinfo
if ($sectorinfo.warp[1] = 0)
	setvar $switchboard~message "This sector has no warps, try to scan it first!*"
	gosub :switchboard~switchboard
	halt
else
	setvar $voidsect 0

	:clearvoids
	add $voidsect 1
	if ($voidsect < 7)
		if ($sectorinfo.warp[$voidsect] <> 0)
			if ($sectorinfo.warp[$voidsect] <> $othersect)
				send "CV0*YN" & $sectorinfo.warp[$voidsect] & "*Q"
			end
		end
		goto :clearvoids
	end

	setvar $switchboard~message "Avoids cleared on adjacent sectors!*"
	gosub :switchboard~switchboard
	send "/"
	waitfor " Sect "
end
return

halt

#INCLUDES:

include "source\include\move"
include "source\include\player"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
include "source\include\switchboard.ts"
