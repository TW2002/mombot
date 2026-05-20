gosub :loadvars~loadvars
gosub :help~initialize

loadvar $game~ptradesetting
loadvar $game~goldenabled
loadvar $game~mbbs
loadvar $game~port_max
loadvar $game~rob_factor
loadvar $game~production_rate
loadvar $bot~folder
setvar  $bot~no_credits_file $bot~folder&"/No_Credits.list"
savevar $bot~no_credits_file
loadvar $game~limpet_cost
loadvar $game~armid_cost
loadvar $game~limpet_removal_cost
loadvar $player~surroundfigs
loadvar $player~surroundmine
loadvar $player~surroundlimp
loadvar $player~surroundavoidallplanets
loadvar $player~surroundavoidshieldedonly
loadvar $player~surroundoverwrite

setvar $help~help[1]  $help~tab&"Visits all ports in grid and trades product."
setvar $help~help[2]  $help~tab&"Buys/sells organics and equipment; fuel is optional."
setvar $help~help[3]  $help~tab&" "
setvar $help~help[4]  $help~tab&"salesman [min port product] ({neg}otiate OR {hold}byhold)"
setvar $help~help[5]  $help~tab&"{docim} {skipcim} {upgradefuel} {buyfuel}"
setvar $help~help[6]  $help~tab&"         "
setvar $help~help[7]  $help~tab&"Options: "
setvar $help~help[8]  $help~tab&"   {neg/hold}    Determines planet negotiate or hold selling"
setvar $help~help[9]  $help~tab&"   {docim}       Does cim before starting route"
setvar $help~help[10] $help~tab&"   {upgradefuel} Upgrades fuel ports selling fuel"
setvar $help~help[11] $help~tab&"     {haggle}    Uses native haggle for trading"
setvar $help~help[12] $help~tab&"   {nohaggle}    Doesn't haggle when buying product"
setvar $help~help[13] $help~tab&"    {buyfuel}    Buys fuel during travels"
setvar $help~help[14] $help~tab&"   {sellfuel}    Sells fuel during travels"
setvar $help~help[15] $help~tab&"       {grid}    Surround grid as you go"
setvar $help~help[16] $help~tab&"        {rob}    Rob ports after buying down"
setvar $help~help[17] $help~tab&"    {upgrade}    Slowly upgrade each port as it goes"
setvar $help~help[18] $help~tab&"    {skipcim}    Trusts database port data; skips remote port checks"
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run Travelling Salesman command from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "docim"
if ($pos > 0)
	setvar $docim true
else
	setvar $docim false
end

getwordpos $bot~user_command_line $pos "skipcim"
if ($pos > 0)
	setvar $skipcim true
else
	setvar $skipcim false
end

getwordpos $bot~user_command_line $pos "grid"
if ($pos > 0)
	setvar $grid true
else
	setvar $grid false
end

getwordpos $bot~user_command_line $pos "nohaggle"
if ($pos > 0)
	setvar $nohaggle true
else
	setvar $nohaggle false
end
getwordpos " "&$bot~user_command_line&" " $pos " haggle "
if ($pos > 0)
	setvar $nativehagglemode true
else
	setvar $nativehagglemode false
end
getwordpos " "&$bot~user_command_line&" " $pos " upgrade "
if ($pos > 0)
	setvar $upgrade true
else
	setvar $upgrade false
end

getwordpos $bot~user_command_line $pos "hold"
if ($pos > 0)
	setvar $planet~planetnegotiate false
else
	setvar $planet~planetnegotiate true
end

getwordpos $bot~user_command_line $pos "upgradefuel"
if ($pos > 0)
	setvar $upgrade_fuel true
else
	setvar $upgrade_fuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " buyfuel "
if ($pos > 0)
	setvar $buyfuel true
else
	setvar $buyfuel false
end

getwordpos $bot~user_command_line $pos "sellfuel"
if ($pos > 0)
	setvar $sellfuel true
else
	setvar $sellfuel false
end

getwordpos " "&$bot~user_command_line&" " $pos "mines"
if ($pos > 0)
	setvar $mines true
else
	setvar $mines false
end

getwordpos $bot~user_command_line $pos "rob"
if ($pos > 0)
	setvar $do_rob true
else
	setvar $do_rob false
end

setvar $minimumfuel $bot~parm1
isnumber $number $minimumfuel
if ($number <> 1)
	setvar $switchboard~message " Minimum Port Product entered is not a number!*"
	gosub :switchboard~switchboard
	halt
end
if ($minimumfuel <= 0)
	setvar $switchboard~message "Minimum Port Product must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

setvar $player~surroundnormal false
setvar $player~surroundpassive true

killalltriggers
setarray $checkedports sectors
setarray $que sectors
setarray $checked sectors
send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"
if ($planet~citadel < 4)
	setvar $switchboard~message "You must run Travelling Salesman from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end
gosub :ship~getshipstats

:merchant
setvar $switchboard~message "Traveling Salesman starting up!*"
gosub :switchboard~switchboard

setvar $player~save true
setvar $sectorcount 10
setvar $totalholds 0
setvar $spentcredits 0
setvar $sellingorg true
setvar $sellingequip true

if ($docim = true)
	setvar $switchboard~message "Travelling Salesman Downloading Current Port CIM Data - Comms Off*"
	gosub :switchboard~switchboard
	send "^rq"
	waitfor ": ENDINTERROG"
	setvar $switchboard~message "Travelling Salesman CIM Port Data Complete - Comms Back On*"
	gosub :switchboard~switchboard
end

gosub :player~quikstats
setvar $startingsector $player~current_sector

send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
setvar $startingplanet $planet~planet
send "c"

gosub :configurenativehaggle

if (($player~limpets <= 3) and ($mines))
	gosub :attempt_refurb
end

while (true)
	if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
		setvar $switchboard~message "Turns too low to continue.*"
		gosub :switchboard~switchboard
		goto :donemerchant
	end
	setvar $bottom 1
	setvar $top 1
	setarray $checked sectors
	setvar $que[1] $player~current_sector
	setvar $checked[$player~current_sector] 1

	setvar $bestmcicsector 0
	setvar $bestmcicscore 49
	setvar $focus 1
	while ($focus <= sectors)
		gosub :checksalesmanport
		if (($salesmangoodport = true) and ($salesmanmcicscore > $bestmcicscore))
			setvar $bestmcicscore $salesmanmcicscore
			setvar $bestmcicsector $focus
		end
		add $focus 1
	end
	if ($bestmcicsector > 0)
		setvar $nearfig $bestmcicsector
		setvar $checkedports[$nearfig] true
		goto :continueon2
	end

	:tryagain2
	while ($bottom <= $top)
		# Now, pull out the next sector in the que, and make it our focus
		setvar $focus $que[$bottom]
		#if (($docim = FALSE) and ($skipcim = FALSE))
		#	if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (SECTOR.EXPLORED[$focus] = "YES"))
		#		send "cr"&$focus&"*"
		#		waiton "Computer command ["
		#		send "q "
		#		gosub :PLAYER~quikstats
		#	end
		#end
		getsectorparameter $focus "BUSTED" $isbusted
		# If this sector is our xxB, we're done!
		gosub :checksalesmanport
		if ($salesmangoodport = true)
			# fig found 0 hops
			setvar $nearfig $focus
			setvar $checkedports[$nearfig] true
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
	goto :donemerchant

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
		setvar $player~current_sector $nearfig
		send "q"
		waiton "Planet command (?"
		gosub :planet~getplanetinfo
		send "c"
		gosub :salesmanrefreshcurrentport
		if ($salesmanliveport <> true)
			setvar $switchboard~message "No valid live port at sector "&$nearfig&", skipping.*"
			gosub :switchboard~switchboard
			goto :salesmanpostport
		end
		if (($upgrade_fuel = true) and (port.buyfuel[$player~current_sector] = false) and ($planet~planetfuel < ($planet~planetfuelmax / 2)) and (port.fuel[$player~current_sector] < $game~port_max))
			setvar $total_creds_needed (300*100+50000)

			if (($total_creds_needed > $player~credits) and (($player~credits+$planet~citadel_credits) > $total_creds_needed))
				setvar $cashonhand $planet~citadel_credits
				add $cashonhand $player~credits
				if ($cashonhand > $total_creds_needed)
					send "T T " & $player~credits & "* "
					send "T F " & $total_creds_needed & "* "
					setvar $player~credits $total_creds_needed
				end
			end
			setvar $salesmanfuelupgradeamount ($game~port_max - port.fuel[$player~current_sector])
			if ($salesmanfuelupgradeamount > 100)
				setvar $salesmanfuelupgradeamount 100
			end
			send "q q *O 1 " & $salesmanfuelupgradeamount & "* *CR*Q"
			gosub :player~quikstats
			gosub :planet~landonplanetentercitadel
		end
		if (($upgrade = true) and (port.exists[$player~current_sector] = true))
			send "q"
			waiton "Planet command (?"
			gosub :planet~getplanetinfo
			send "c"
			gosub :player~quikstats

			setvar $total_creds_needed ((300*100) + (500*100) + (700*100) + 500000)

			if (($total_creds_needed > $player~credits) and (($player~credits+$planet~citadel_credits) > $total_creds_needed))
				setvar $cashonhand $planet~citadel_credits
				add $cashonhand $player~credits
				if ($cashonhand > $total_creds_needed)
					send "T T " & $player~credits & "* "
					send "T F " & $total_creds_needed & "* "
					setvar $player~credits $total_creds_needed
				end
			end
			send "q q *O 1 100*O 2 100*O 3 100** "
			gosub :player~quikstats
			gosub :planet~landonplanetentercitadel
			gosub :player~quikstats
		end
		if (($upgrade_fuel = true) or ($upgrade = true))
			gosub :salesmanrefreshcurrentport
			if ($salesmanliveport <> true)
				setvar $switchboard~message "No valid live port at sector "&$nearfig&" after upgrade, skipping.*"
				gosub :switchboard~switchboard
				goto :salesmanpostport
			end
		end

		if ($planet~planetnegotiate = true)
			killalltriggers
			setvar $salesmanattemptedsell false
			setvar $planethaggle~_ck_pnego_fueltosell "-1"
			if (($planet~planetfuel >= 100000) and ($sellfuel = true) and (port.buyfuel[$nearfig] = true) and (port.fuel[$nearfig] >= $minimumfuel))
				setvar $planethaggle~_ck_pnego_fueltosell "max"
				setvar $salesmanattemptedsell true
			else
				setvar $planethaggle~_ck_pnego_fueltosell "-1"
			end
			if (($planet~planetorg >= 500) and (port.buyorg[$nearfig] = true) and (port.org[$nearfig] >= $minimumfuel))
				setvar $planethaggle~_ck_pnego_orgtosell "max"
				setvar $salesmanattemptedsell true
			else
				setvar $planethaggle~_ck_pnego_orgtosell "-1"
			end
			if (($planet~planetequip >= 500) and (port.buyequip[$nearfig] = true) and (port.equip[$nearfig] >= $minimumfuel))
				setvar  $planethaggle~_ck_pnego_equiptosell "max"
				setvar $salesmanattemptedsell true
			else
				setvar  $planethaggle~_ck_pnego_equiptosell "-1"
			end
			if ($salesmanattemptedsell = true)
				gosub :planethaggle~planetneg
			end
			if (($salesmanattemptedsell = true) and ($planethaggle~sellhagglesucceeded <> true))
				setvar $switchboard~message "Planet negotiate failed at this port, skipping buy-down here.*"
				gosub :switchboard~switchboard
				goto :salesmanpostport
			end
		else
			killalltriggers
			gosub :player~quikstats
			send "q"
			waiton "Planet command (?"
			gosub :planet~getplanetinfo
			send "c"

			send "q q *cr*q"
			waiton "Fuel Ore"
			getword currentline $totalportfuel 4
			waiton "Organics"
			getword currentline $totalportorganics 3
			waiton "Equipment"
			getword currentline $totalportequipment 3

			waiton "<Computer deactivated>"
			if ((port.buyfuel[$nearfig] = true) and ($sellfuel = true) and ($planet~planetfuel >= 100000))
				if ($planet~planetfuel < $totalportfuel)
					setvar $player~turnssellingproduct (($planet~planetfuel/$player~total_holds)-1)
				else
					setvar $player~turnssellingproduct (($totalportfuel/$player~total_holds))
				end
				if (($player~unlimitedgame = false) and (($player~turns - $player~turnssellingproduct) <= $bot~bot_turn_limit))
					setvar $switchboard~message "Turns too low to continue.*"
					gosub :switchboard~switchboard
					send "l "&$planet~planet&"* c "
					goto :donemerchant
				end
				send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "

				while ($player~turnssellingproduct > 0)
					if ($nativehagglemode)
						setvar $salesmantradesellfuel 1
						setvar $salesmantradesellorg 0
						setvar $salesmantradesellequ 0
						setvar $salesmantradebuyfuel 0
						setvar $salesmantradebuyorg 0
						setvar $salesmantradebuyequ 0
						send "l " $planet~planet "*  t  *  * 2*  q "
						gosub :nativeporttrade
						gosub :player~quikstats
						if ($player~ore_holds > 0)
							setvar $switchboard~message "Unable to finish selling Fuel Ore before continuing.*"
							gosub :switchboard~switchboard
							goto :donesalesman
						end
						subtract $player~turnssellingproduct 1
						add $totalfuelholds $player~total_holds
					else
						send "l " $planet~planet "*  t  *  * 2*  q P**"
						gosub :haggle~starthaggle
						send "0 * 0 *  /"
						if ($player~ni <> true)
							subtract $player~turnssellingproduct 1
							add $totalfuelholds $player~total_holds
						end
						waiton "Turns"
					end
				end
			end
			getsectorparameter $nearfig "BUSTED" $isbusted
			if ((port.buyorg[$nearfig] = true) and ($sellingorg) and ($isbusted <> true))
				if ($planet~planetorg < $totalportorganics)
					setvar $player~turnssellingproduct (($planet~planetorg/$player~total_holds)-1)
				else
					setvar $player~turnssellingproduct (($totalportorganics/$player~total_holds))
				end
				if (($player~unlimitedgame = false) and (($player~turns - $player~turnssellingproduct) <= $bot~bot_turn_limit))
					setvar $switchboard~message "Turns too low to continue.*"
					gosub :switchboard~switchboard
					send "l "&$planet~planet&"* c "
					goto :donemerchant
				end
				send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "

				while ($player~turnssellingproduct > 0)
					if ($nativehagglemode)
						setvar $salesmantradesellfuel 0
						setvar $salesmantradesellorg 1
						setvar $salesmantradesellequ 0
						setvar $salesmantradebuyfuel 0
						setvar $salesmantradebuyorg 0
						setvar $salesmantradebuyequ 0
						send "l " $planet~planet "*  t  *  * 2*  q "
						gosub :nativeporttrade
						gosub :player~quikstats
						if ($player~organic_holds > 0)
							setvar $switchboard~message "Unable to finish selling Organics before continuing.*"
							gosub :switchboard~switchboard
							goto :donesalesman
						end
						subtract $player~turnssellingproduct 1
						add $totalorganicholds $player~total_holds
					else
						send "l " $planet~planet "*  t  *  * 2*  q P**"
						gosub :haggle~starthaggle
						send "0 * 0 *  /"
						if ($player~ni <> true)
							subtract $player~turnssellingproduct 1
							add $totalorganicholds $player~total_holds
						end
						waiton "Turns"
					end
				end
			end
			getsectorparameter $nearfig "BUSTED" $isbusted
			if ((port.buyequip[$nearfig] = true) and ($sellingequip) and ($isbusted <> true))
				if ($planet~planetequip < $totalportequipment)
					setvar $player~turnssellingproduct (($planet~planetequip/$player~total_holds)-1)
				else
					setvar $player~turnssellingproduct (($totalportequipment/$player~total_holds))
				end
				send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
				while ($player~turnssellingproduct > 0)
					if ($nativehagglemode)
						setvar $salesmantradesellfuel 0
						setvar $salesmantradesellorg 0
						setvar $salesmantradesellequ 1
						setvar $salesmantradebuyfuel 0
						setvar $salesmantradebuyorg 0
						setvar $salesmantradebuyequ 0
						send "l " $planet~planet "*  t  *  * 3*  q "
						gosub :nativeporttrade
						gosub :player~quikstats
						if ($player~equipment_holds > 0)
							setvar $switchboard~message "Unable to finish selling Equipment before continuing.*"
							gosub :switchboard~switchboard
							goto :donesalesman
						end
						subtract $player~turnssellingproduct 1
						add $totalequipmentholds $player~total_holds
					else
						send "l " $planet~planet "*  t  *  * 3*  q P**"
						gosub :haggle~starthaggle
						send "0 * 0 *  /"
						if ($player~ni <> true)
							subtract $player~turnssellingproduct 1
							add $totalequipmentholds $player~total_holds
						end
						waiton "Turns"
					end
				end
			end
			if ($planet~planetnegotiate <> true)
				gosub :planet~landonplanetentercitadel
			end
			gosub :player~quikstats
		end
		setvar $salesmanplanetroom ($planet~planetequipmax - $planet~planetequip)
		if (($salesmanequipselling >= $minimumfuel) and ($salesmanplanetroom >= $minimumfuel))
			setvar $salesmanbuyproduct "e"
			setvar $salesmanbuyavailable $salesmanequipselling
			gosub :salesmanbuyproduct
		end
		setvar $salesmanplanetroom ($planet~planetorgmax - $planet~planetorg)
		if (($salesmanorgselling >= $minimumfuel) and ($salesmanplanetroom >= $minimumfuel))
			setvar $salesmanbuyproduct "o"
			setvar $salesmanbuyavailable $salesmanorgselling
			gosub :salesmanbuyproduct
		end
		setvar $salesmanplanetroom ($planet~planetfuelmax - $planet~planetfuel)
		if (($salesmanfuelselling >= $minimumfuel) and ($buyfuel = true) and ($salesmanplanetroom >= $minimumfuel))
			setvar $salesmanbuyproduct "f"
			setvar $salesmanbuyavailable $salesmanfuelselling
			gosub :salesmanbuyproduct
		end

		:salesmanpostport
		send "#"
		waiton "                            Who's Playing"
		send "cr*"
		waiton "Computer command ["
		send "q "
		gosub :player~quikstats
		if ($grid)
			send "q m* * *  q "
			gosub :grid~surround
			gosub :player~quikstats
			gosub :planet~landonplanetentercitadel
		end
		gosub :player~quikstats
		if (((sector.limpets.quantity[$player~current_sector] <= 0) or (sector.mines.quantity[$player~current_sector] <= 0)) and (($player~limpets >= 3) and ($player~armids >= 3)) and ($mines = true))
			gosub :domines
		end
		if ($mines)
			send "s* "
			gosub :player~quikstats
			if ((sector.limpets.quantity[$player~current_sector] > 0) and (($player~limpets <= 5) or ($player~armids <= 5)))
				gosub :attempt_refurb
			end
		end
		if ($do_rob = true)
			gosub :rob
		end
	end
end

:donemerchant
send "p"&$startingsector&"*y"
setvar $switchboard~message "Travelling Salesman completed.*"
gosub :switchboard~switchboard
gosub :restoreautohaggle
halt

:nofigatlocation
setsectorparameter $nearfig "FIGSEC" false
goto :tryagain2

:donenofuel2
setvar $switchboard~message "Not enough fuel to continue.*"
gosub :switchboard~switchboard
goto :donemerchant

:checksalesmanport
setvar $salesmangoodport false
setvar $salesmanmcicscore 0
setvar $salesmanscore 0
setvar $salesmansellmciccutoff "-50"

getsectorparameter $focus "BUSTED" $isbusted
if (($checkedports[$focus] = true) or ($isbusted = true) or (port.exists[$focus] <> true) or (port.class[$focus] <= 0))
	return
end

if ((port.buyequip[$focus] = true) and ($planet~planetequip >= 500) and (port.equip[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "EQUMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp <= $salesmansellmciccutoff))
		setvar $salesmanscore (0 - $tmp)
		if ($salesmanscore > $salesmanmcicscore)
			setvar $salesmanmcicscore $salesmanscore
		end
	end
end
if ((port.buyorg[$focus] = true) and ($sellingorg = true) and ($planet~planetorg >= 500) and (port.org[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "ORGMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp <= $salesmansellmciccutoff))
		setvar $salesmanscore (0 - $tmp)
		if ($salesmanscore > $salesmanmcicscore)
			setvar $salesmanmcicscore $salesmanscore
		end
	end
end
if ((port.buyfuel[$focus] = true) and ($sellfuel = true) and ($planet~planetfuel >= 100000) and (port.fuel[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "OREMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp <= $salesmansellmciccutoff))
		setvar $salesmanscore (0 - $tmp)
		if ($salesmanscore > $salesmanmcicscore)
			setvar $salesmanmcicscore $salesmanscore
		end
	end
end

setvar $salesmanplanetroom ($planet~planetequipmax - $planet~planetequip)
if ((port.buyequip[$focus] = false) and ($salesmanplanetroom >= $minimumfuel) and (port.equip[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "EQUMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp >= 50))
		if ($tmp > $salesmanmcicscore)
			setvar $salesmanmcicscore $tmp
		end
	end
end
setvar $salesmanplanetroom ($planet~planetorgmax - $planet~planetorg)
if ((port.buyorg[$focus] = false) and ($salesmanplanetroom >= $minimumfuel) and (port.org[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "ORGMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp >= 50))
		if ($tmp > $salesmanmcicscore)
			setvar $salesmanmcicscore $tmp
		end
	end
end
setvar $salesmanplanetroom ($planet~planetfuelmax - $planet~planetfuel)
if ((port.buyfuel[$focus] = false) and ($buyfuel = true) and ($salesmanplanetroom >= $minimumfuel) and (port.fuel[$focus] >= $minimumfuel))
	setvar $salesmangoodport true
	getsectorparameter $focus "OREMCIC" $tmp
	isnumber $salesmanisnumber $tmp
	if (($salesmanisnumber = true) and ($tmp >= 50))
		if ($tmp > $salesmanmcicscore)
			setvar $salesmanmcicscore $tmp
		end
	end
end
return

:rob
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt

getsectorparameter $player~current_sector "BUSTED" $isbusted
if ($isbusted = true)
	return
end
cuttext $player~alignment $neg_ck 1 1

striptext $player~alignment "-"
if ($player~alignment < 100) and ($neg_ck = "-")
	return
elseif ($neg_ck <> "-")
	return
end
send "q q pr * r"
settextlinetrigger valid :rob_continue "<R> Rob this Port"
settextlinetrigger notvalid :rob_not_valid "<Q> Quit, nevermind"
pause

:rob_continue
killtrigger notvalid
settextlinetrigger fake :rob_fake "Busted!"
settextlinetrigger mega :rob_ok "port has in excess of"
pause

:rob_fake
killalltriggers
if ($startinglocation = "Citadel")
	gosub :planet~landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
setvar $switchboard~message "Fake Busted*"
gosub :switchboard~switchboard
return

:rob_ok
killalltriggers
#setvar $rob $player~experience
#multiply $rob 3
#multiply $game~rob_factor 100
setvar $rob ($game~rob_factor*$player~experience)
getword currentline $port_cash 11

striptext $port_cash ","
setvar $original_port_cash $port_cash
multiply $port_cash 10
divide $port_cash 9
#	if (($port_cash >= 3000000) AND ($game~mbbs = TRUE))
#		send "'{" $bot~bot_name "} - " $port_cash " credits on port.  Port is ready for Mega Rob**"
#		gosub :planet~landingSub
#		goto :wait_for_command
#	end
if ($port_cash < $minimumport)
	echo "*Port has less than "&$minimumport&" credits on it.*"
	send "0*"
	setvar $rob 0
elseif ($port_cash >= $rob)
	send $rob "*"
elseif ($port_cash < $rob)
	setvar $rob $port_cash
	send $rob "*"
end
if ($port_cash < $minimumport)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $bot~no_credits_file $player~current_sector
end
settextlinetrigger port_empty :rob_suc "Maybe some other day, eh?"
settextlinetrigger mega_suc :rob_suc "Success!"
settextlinetrigger mega_bust :rob_bust "Busted!"
pause

:rob_bust
killalltriggers
if ($startinglocation = "Citadel")
	gosub :planet~landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
send "'<"&$bot~subspace&">[Busted:"&$player~current_sector&"]<"&$bot~subspace&">* "
return

:rob_ready_to_mega
killalltriggers
send "0*  "
if ($startinglocation = "Citadel")
	gosub :planet~landingsub
end
return

:rob_not_valid
killalltriggers
setvar $checkedports[$player~current_sector] true
setvar $empty_grid[$player~current_sector] true
write $bot~no_credits_file $player~current_sector
setvar $rob 0
setvar $original_port_cash 0

:rob_suc
killalltriggers
if ($startinglocation = "Citadel")
	send "l " $planet~planet "* c t t " $rob "* "
end
if ($rob > $original_port_cash)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $bot~no_credits_file $player~current_sector
end
if ($rob > 0)
	setvar $laststeal $player~current_sector
	setvar $switchboard~message "Success! - "&$rob&" credits robbed*"
	gosub :switchboard~switchboard
end
return
# ============================== END ROB (ROB) SUB ==============================

:domines
setvar $bot~command "deploy"
setvar $bot~user_command_line " mines 3 silent "
setvar $bot~parm1 "mines"
setvar $bot~parm2 "2"

savevar $bot~command
savevar $bot~user_command_line
savevar $bot~parm1

load "scripts\"&$bot~mombot_directory&"\commands\grid\deploy.cts"
seteventtrigger        minesend        :minesend "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\grid\deploy.cts"
setdelaytrigger        minetime        :minetime  10000
pause

:minetime
killtrigger minesend
stop "scripts\"&$bot~mombot_directory&"\commands\grid\deploy.cts"
gosub :player~quikstats

:minesend
killtrigger minetime
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	send " q q q * l " $planet~planet " * n n * j m * * * j c  *  "
	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Not at correct prompt after mine deploy!  Maybe planet is gone?  Check please!*"
		gosub :switchboard~switchboard
		gosub :combat~callsaveme
	end
end

return

:attempt_refurb
send  "q t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* t nt 1* c "
gosub :player~quikstats
setvar $limpetcashneeded ((($ship~ship_mines_max-$player~limpets)*$game~limpet_cost)+$game~limpet_removal_cost)
setvar $armidcashneeded ((($ship~ship_mines_max-$player~armids)*$game~armid_cost))
setvar $cashneeded ($limpetcashneeded+$armidcashneeded)
setvar $furbing true
if ($cashneeded > $player~credits)
	send "D"
	waiton "Citadel treasury contains "
	getword currentline $planet~citadelcash 4
	striptext $planet~citadelcash ","
	if ($planet~citadelcash < $cashneeded)
		setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
		gosub :switchboard~switchboard
		goto :donesalesman
	end
	send "t f "&($cashneeded-$player~credits)&"* "
end
# check adj's for Dock.. if present, then we don't need a jump sector.
setvar $i 1
setvar $start_sector $player~current_sector
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $map~stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

if (($player~alignment < 1000) and ($weareadjdock = false))
	setvar $player~red_adj 0
	setvar $player~target $map~stardock
	gosub :move~findjumpsector
	if ($player~red_adj = 0)
		waitfor "Command [TL="
		send "l " & $startingplanet & "* c"
		waiton "Citadel command"
		setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
		gosub :switchboard~switchboard
		goto :donesalesman
	end
end

if ($player~alignment >= 1000)
	if ($weareadjdock)
		send "^F" & $map~stardock & "*" & $start_sector & "*Q/ "
	else
		send "^F" & $start_sector & "*" & $map~stardock & "*F" & $map~stardock & "*" & $start_sector & "*Q/ "
	end
else
	if ($weareadjdock)
		send "^F" & $map~stardock & "*" & $start_sector & "*Q/ "
	else
		send "^F" & $start_sector & "*" & $player~red_adj & "*F" & $map~stardock & "*" & $start_sector & "*Q/ "
	end
end
settextlinetrigger nojoy :nojoy "*** Error - No route within"
settexttrigger cont :cont "(?="
pause

:nojoy
killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
goto :donesalesman

:cont
killalltriggers
setdelaytrigger latency_delay		:latency_delay 500
pause

:latency_delay
echo "**" & ansi_14 & "Please Stand By" & ansi_15 & " - Calculating Distances...**"
if (($player~alignment >= 1000) or ($weareadjdock))
	getdistance $dist1 $start_sector $map~stardock
else
	getdistance $dist1 $start_sector $player~red_adj
end

if ($dist1 <= 0)
	setvar $switchboard~message $taglineb & " - Insufficient Warp Data Plotting Course to Dock**"
	gosub :switchboard~switchboard
	goto :donesalesman
end

getdistance $dist2 $map~stardock $start_sector
if ($dist2 <= 0)
	setvar $switchboard~message $taglineb & " - Insufficient Warp Data Plotting Return Course From Dock**"
	gosub :switchboard~switchboard
	goto :donesalesman
end

setvar $ore_req (($dist1 + $dist2) * 3)

if ($player~ore_holds < $ore_req)
	setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
	gosub :switchboard~switchboard
	goto :donesalesman
end

if ($player~twarp_type = "No")
	setvar $switchboard~message "Must Have Twarp 1 or 2**"
	gosub :switchboard~switchboard
	goto :donesalesman
end

if ($player~unlimitedgame = 0)
	gosub :turnsrequired
	if ($player~turnsrequired > $player~turns)
		setvar $switchboard~message "Not Enough Turns. " & ansi_12 & $player~turnsrequired & ansi_15 & ", Required**"
		gosub :switchboard~switchboard
		goto :donesalesman
	elseif ($player~turnsrequired <= $player~turns)
		setvar $tmp ($player~turns - $player~turnsrequired)
		if ($tmp <= $bot~bot_turn_limit)
			setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!**"
			gosub :switchboard~switchboard
			goto :donesalesman
		end
	end
end

send " C R " & $map~stardock & "*Q "
settextlinetrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
setvar $switchboard~message $taglineb & " - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
goto :donesalesman

:itsalive
killalltriggers
waitfor "(?="
setvar $msg ""
if (($player~alignment >= 1000) and ($weareadjdock = false))
	setvar $player~warpto $map~stardock
	gosub :dotwarp
elseif (($weareadjdock = false) and ($player~red_adj <> 0))
	setvar $player~warpto $player~red_adj
	gosub :dotwarp
else
	send " m " & $map~stardock & "*  *  P  S G Y G Q "
end
if ($msg = "")
	waitfor "You leave the Galactic Bank."
else
	setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
	gosub :switchboard~switchboard
	halt
end
gosub :player~quikstats

setvar $_limps "Max"
setvar $_mines "Max"
gosub :dopurchases
send "Q Q Q Q Z N M " & $start_sector & "* Y  Y  Y  * L Z" & #8 & $planet~planet & "* p  s  s * * c *"
gosub :player~quikstats
if ($player~current_sector = $map~stardock)
	setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
	gosub :switchboard~switchboard
	halt
end
send "q tnt1* c "

return

:dotwarp
setvar $msg ""
setvar $paused false
setvar $photoned false
if ($player~warpto > 0)
	send "q t * t 1*  q * * mz" & $player~warpto "*"
	settexttrigger there        :adj_warp "You are already in that sector!"
	settextlinetrigger adj_warp :adj_warp "Sector  : " & $player~warpto & " "
	settexttrigger locking      :locking "Do you want to engage the TransWarp drive?"
	settexttrigger igd          :twarpigd "An Interdictor Generator in this sector holds you fast!"
	settexttrigger noturns      :twarpphotoned "Your ship was hit by a Photon and has been disabled"
	settexttrigger noroute      :twarpnoroute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
	killalltriggers
	send "z*"
	goto :twarp_adj

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock 		:twarp_lock "TransWarp Locked"
	settextlinetrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
	settextlinetrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
	settextlinetrigger no_fuel 		:itwarpnofuel "You do not have enough Fuel Ore"
	pause

	:twarpnofuel
	killalltriggers
	setvar $msg "Not enough fuel for T-warp."
	goto :twarpdone

	:twarp_adj
	killalltriggers
	send " * p s"
	goto :twarpdone

	:twarpnoroute
	killalltriggers
	send "n* z* "
	setvar $msg "No route available!"
	goto :twarpdone

	:no_twarp_lock
	killalltriggers
	send "n*zn"
	send "l " & #8 & $planet~planet "*c"
	setsectorparameter $player~warpto "FIGSEC" false
	setvar $temp " "&$player~warpto&" "
	replacetext $database $temp " "
	subtract $database_count 1
	goto :select_boomsec

	:twarpigd
	killalltriggers
	setvar $msg "My ship is being held by Interdictor!"
	goto :twarpdone

	:twarpphotoned
	killalltriggers
	setvar $msg "I have been photoned and can not T-warp!"
	send "l " & #8 & $planet~planet "* j c *   "
	setvar $photoned true
	goto :twarpdone

	:itwarpnofuel
	killalltriggers
	setvar $msg "I have no fuel!"
	send "l " & #8 & $planet~planet "* j c *   "
	goto :twarpdone

	:twarp_lock
	killalltriggers
	if ($player~alignment >= 1000)
		if ($furbing)
			setvar $str "y * * p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	else
		if ($furbing)
			setvar $str "y  *  *  m " & $map~stardock & " *  *  p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	end

	:twarpdone
	if ($msg <> "")
		setvar $switchboard~message "Twarp Error - " & $msg & "**"
		gosub :switchboard~switchboard
		setvar $paused true
	end
end
return

:bwarp
killalltriggers
send "b" $player~warpto "*"
settexttrigger go :go5 "TransWarp Locked"
settexttrigger no :no5 "No locating beam found"
pause

:no5
killalltriggers
send "n "
waitfor "Transporter shutting down."
setvar $fighter_grid[$player~warpto] 0
goto :select_boomsec

:go5
killalltriggers
send "y z * "
return

:turnsrequired
send "i"
settextlinetrigger turnsrequired_tpw	:turnsrequired_tpw "Turns to Warp  : "
pause

:turnsrequired_tpw
killalltriggers
getword currentline $player~turnsrequired_tpw 5

if ($player~red_adj > 0)
	# twarp to jmp sector, then into SD sect, then twarp home
	setvar $player~turnsrequired_temp ($player~turnsrequired_tpw * 3)
	if ($_tow > 0)
		# 2 Turns for exporting into other ship and back again
		add $player~turnsrequired_temp 2
		# 3 Turns for initial Port then x into other ship, port & shop, then x and report
		#   b4 heading home
		add $player~turnsrequired_temp 3
	else
		add $player~turnsrequired_temp 1
	end
else
	setvar $player~turnsrequired_temp ($player~turnsrequired_tpw * 2)
	# 1 Turn to port at dock
	add $player~turnsrequired_temp 1
end

setvar $player~turnsrequired $player~turnsrequired_temp
return

:callsaveme
send "q q q q * "
gosub :combat~callsaveme
halt

:configurenativehaggle
setvar $restoreautohagglestate 0
if ($nativehagglemode)
	if (haggle = false)
		autohaggle on
		setvar $restoreautohagglestate 2
	end
else
	if (haggle)
		autohaggle off
		setvar $restoreautohagglestate 1
	end
end
return

:restoreautohaggle
if ($restoreautohagglestate = 1)
	autohaggle on
else
	if ($restoreautohagglestate = 2)
		autohaggle off
	end
end
setvar $restoreautohagglestate 0
return

:nativeporttrade
setvar $salesmantradeactive 0
send "PT"

:nativeporttradewait
settextlinetrigger salesmantradestart1 :nativeporttradeprogress "<Port>"
settextlinetrigger salesmantradestart2 :nativeporttradeprogress "Docking..."
settexttrigger salesmantradestart3 :nativeporttradeprogress "Your offer ["
settexttrigger salesmantradestart4 :nativeporttradeprogress "Our final offer"
settexttrigger salesmantradestart5 :nativeporttradeprogress "Agreed,"
settexttrigger salesmantradeqty :nativeporttradeqty "How many holds of "
if ($salesmantradeactive = 1)
	settexttrigger salesmantradedone :nativeporttradedone "Command [TL="
end
pause

:nativeporttradeprogress
killalltriggers
setvar $salesmantradeactive 1
goto :nativeporttradewait

:nativeporttradeqty
killalltriggers
setvar $salesmantradeactive 1
setvar $salesmantradeline currentline
gosub :handlenativeportqty
goto :nativeporttradewait

:nativeporttradedone
killalltriggers
return

:handlenativeportqty
setvar $salesmantradeproduct "None"
setvar $salesmantradeisbuy 0

getwordpos $salesmantradeline $salesmantradepos " do you want to buy "
if ($salesmantradepos > 0)
	setvar $salesmantradeisbuy 1
end

getwordpos $salesmantradeline $salesmantradepos "Fuel"
if ($salesmantradepos > 0)
	setvar $salesmantradeproduct "Fuel"
else
	getwordpos $salesmantradeline $salesmantradepos "Organics"
	if ($salesmantradepos > 0)
		setvar $salesmantradeproduct "Organics"
	else
		getwordpos $salesmantradeline $salesmantradepos "Equipment"
		if ($salesmantradepos > 0)
			setvar $salesmantradeproduct "Equipment"
		end
	end
end

if ($salesmantradeisbuy = 1)
	if (($salesmantradeproduct = "Fuel") and ($salesmantradebuyfuel > 0))
		send $salesmantradebuyfuel & "*"
		setvar $salesmantradebuyfuel 0
	elseif (($salesmantradeproduct = "Organics") and ($salesmantradebuyorg > 0))
		send $salesmantradebuyorg & "*"
		setvar $salesmantradebuyorg 0
	elseif (($salesmantradeproduct = "Equipment") and ($salesmantradebuyequ > 0))
		send $salesmantradebuyequ & "*"
		setvar $salesmantradebuyequ 0
	else
		send "0*"
	end
	return
end

if (($salesmantradeproduct = "Fuel") and ($salesmantradesellfuel > 0))
	send "*"
	setvar $salesmantradesellfuel 0
elseif (($salesmantradeproduct = "Organics") and ($salesmantradesellorg > 0))
	send "*"
	setvar $salesmantradesellorg 0
elseif (($salesmantradeproduct = "Equipment") and ($salesmantradesellequ > 0))
	send "*"
	setvar $salesmantradesellequ 0
else
	send "0*"
end
return

:salesmanbuyproduct
if (($salesmanbuyavailable <= 0) or ($salesmanplanetroom <= 0))
	return
end
if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
	setvar $switchboard~message "Turns too low to continue.*"
	gosub :switchboard~switchboard
	goto :donemerchant
end
if ($player~total_holds <= 0)
	return
end

setvar $salesmanbuyunits $salesmanbuyavailable
if ($salesmanbuyunits > $salesmanplanetroom)
	setvar $salesmanbuyunits $salesmanplanetroom
end
if ($salesmanbuyunits <= 0)
	return
end

setvar $player~buyobject $salesmanbuyproduct
if ($nohaggle)
	setvar $player~buytype "s"
elseif (($salesmanbuyproduct = "f") and ($nativehagglemode <> true))
	setvar $player~buytype "s"
else
	setvar $player~buytype "b"
end

setvar $player~buydownroundsfromparam $salesmanbuyunits
divide $player~buydownroundsfromparam $player~total_holds
if ($player~buydownroundsfromparam <= 0)
	setvar $player~buydownroundsfromparam 1
end

gosub :planethaggle~buy
gosub :player~quikstats
return

:dopurchases
send "h "
waitfor "<Hardware Emporium>"
#=============================================== PURCHASE LIMPS
if ($_limps  <> "")
	send "L "
	waitfor "How many mines do you want"
	if ($_limps  = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy & "* "
	else
		send $buy $_limps & "* "
	end
	waitfor "<Hardware Emporium>"
end
#=============================================== PURCHASE ARMIDS
if ($_mines  <> "")
	send "M "
	setvar $buy 0
	waitfor "How many mines do you"
	if ($_mines  = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy & "* "
	else
		send $_mines & "* "
	end
	waitfor "<Hardware Emporium>"
end
return

:select_boomsec
setvar $i 1
setvar $foundboomsec false
while ($i <= $database_count)
	if (getsectorparameter $i "FIGSEC" = true)
		setvar $foundboomsec true
		send "l " & #8 & $planet~planet & "* c"
		gosub :player~quikstats
		goto :tryagain2
	end
	add $i 1
end
if ($foundboomsec = false)
	setvar $switchboard~message "No FIGs found in database!**"
	gosub :switchboard~switchboard
	goto :donesalesman
end

:salesmanrefreshcurrentport
setvar $salesmanliveport false
setvar $salesmanfuelselling 0
setvar $salesmanorgselling 0
setvar $salesmanequipselling 0
setvar $port~startinglocation "Citadel"
gosub :port~getportinfo
if ($port~noport = 1)
	return
end
setvar $salesmanliveport true
setvar $salesmanfuelselling $port~fuelselling
setvar $salesmanorgselling $port~orgselling
setvar $salesmanequipselling $port~equipselling
return

#INCLUDES:
include "source\include\xenter"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\sector"
include "source\include\haggle"
include "source\include\combat"
include "source\include\help"
include "source\include\switchboard.ts"
