:load_variables
loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $player~unlimitedgame
loadvar $bot~subspace
loadvar $bot~bot_turn_limit

gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~subspace

loadvar $bot~bot_turn_limit
loadvar $game~steal_factor

setvar $help~help[1] $help~tab&" sst {resetlra} [ship1] [ship2] {jet} {resetlra}"
setvar $help~help[2] $help~tab&"  - Do NOT need to start in Ship 1 or Ship 2."
setvar $help~help[3] $help~tab&"  - First Steal will be from Ship 1."
setvar $help~help[4] $help~tab&"  - Checks last rob and busts from Sec Params"
setvar $help~help[5] $help~tab&"  - {jet} will mega jet product for extra experience "
setvar $help~help[6] $help~tab&"          but will stop at mulitplier of 300 holds. "
setvar $help~help[7] $help~tab&"  - {resetlra} will reset last rob sector and exit"
setvar $help~help[8] $help~tab&"  - Will use EP Haggle if running in bot"
setvar $help~help[9] $help~tab&"  - Created by Cherokee"
gosub :help~helpfile

setvar $switchboard~message "SST and JET starting up!*"
gosub :switchboard~switchboard

if ($bot~parm1 = "resetlra")
	setsectorparameter 1 "LRA" 1
	send "'Last rob sector reset*"
	halt
end

isnumber $test $bot~parm1
if ($test)
else
	setvar $switchboard~message "Ship 1 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm2
if ($test)
else
	setvar $switchboard~message "Ship 2 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end
setvar $ship_1 $bot~parm1
setvar $ship_2 $bot~parm2
setvar $steal_divisor $game~steal_factor

if ($bot~parm3 = "jet")
	setvar $jet "y"
end

if ($bot~parm4 = "jet")
	setvar $jet "y"
end

if ($steal_divisor = 0)
	setvar $steal_divisor 21
	send "'No Steal divisor, assuming 21. Bot needs to refresh perhaps?*"
end

getsectorparameter 1 "LRA" $last_rob_attempt

:verifyprompt
gosub :player~quikstats

setvar $location $player~current_prompt
if ($location <> "Command")
	setvar $switchboard~message "Must start at Command Prompt for SST*"
	gosub :switchboard~switchboard
	halt
end

send "czq"
waiton "-----------------------------------------------------------------------------"
settextlinetrigger shipnumber :getshipnumber "Corp"
setslinetrigger doneships :doneships "Computer command ["
pause

:getshipnumber
getword currentline $shiptest 1
getword currentline $shiplocation 2
isnumber $is_a_number $shiplocation
if ($is_a_number)
	if ($ship_1 = $shiptest)
		if ($shiplocation = $last_rob_attempt)
			setvar $temp $ship_1
			setvar $ship_1 $ship_2
			setvar $ship_2 $temp
			goto :doneships
		end
	end
end
settextlinetrigger shipnumber :getshipnumber "Corp"
pause

:doneships
killalltriggers

:verifyship
if ($player~ship_number <> $ship_1)
	send "x " $ship_1 "* q z n"
end
gosub :player~quikstats
if ($player~ship_number <> $ship_1)
	setvar $switchboard~message "Cannot Xport to Ship 1.  Check Xport Range.  Halting.*"
	gosub :switchboard~switchboard
	halt
end
logging "OFF"

gosub :startcnsettings

send "CZQ"
waitfor "Command [TL="
setdelaytrigger shipdispwait :shipdispwait 750
pause
pause

:shipdispwait
setvar $jetholds 10
setvar $jetholdsore 10
setvar $jetholdsorg 5
setvar $jetbonus 0
setvar $jetcost 0
setvar $current_ship $ship_1
setvar $low_turns "NO"
setvar $skip_ships "NO"

setvar $debugdelay 0
setvar $sec1void 0
setvar $sec2void 0

:init
gosub :getinfo
setvar $init_credits $player~credits
setvar $init_exp $exp
setvar $init_turns $player~turns
setvar $switchboard~message "Starting SST"
gosub :switchboard~switchboard

if ($jet = "y")
	send "+JET"
end
send " with "&$init_credits&" credits and "&$init_exp&" experience.*"
gosub :player~quikstats

setvar $switchboard~message "last rob attempt: "&$last_rob_attempt&"*"
gosub :switchboard~switchboard
if ($last_rob_attempt = $player~current_sector)
	setvar $switchboard~message "last rob attempt is this sector! HAlting*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
end
gosub :sector~voidadjacent

getsectorparameter $player~current_sector "BUSTED" $bustthissec
if ($bustthissec = true)
	setvar $switchboard~message "According to my data i've busted here - ending*"
	gosub :switchboard~switchboard
	gosub :sector~clearvoidadjacent
	gosub :endcnsettings
	halt
end

gosub :checkport
gosub :cleanship
gosub :steal
gosub :xport

gosub :getinfo
gosub :sector~voidadjacent
setvar $sec2void 1
getsectorparameter $player~current_sector "BUSTED" $bustthissec
if ($bustthissec = true)
	setvar $switchboard~message "According to my data i've busted here - ending*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
end

gosub :checkport
gosub :cleanship
gosub :steal
gosub :xport

setvar $skip_ships "YES"

:sstloop
gosub :sell
gosub :steal
gosub :xport
if (($player~unlimitedgame) or ($player~turns > $bot~bot_turn_limit))
	goto :sstloop
else
	setvar $switchboard~message "Low Turns, Halting Script*"
	gosub :switchboard~switchboard
	setvar $low_turns "YES"
	goto :finish
end

:finish
gosub :sector~clearvoidadjacent

setvar $player~turns_used $init_turns
subtract $player~turns_used $player~turns
gosub :player~quikstats

setvar $cash_made ($player~credits - $init_credits)
setvar $exp_made $player~experience
subtract $exp_made $init_exp
gosub :endcnsettings
send "'*{" $switchboard~bot_name "} -*"
if ($player~unlimitedgame)
	send "I made "&$cash_made&" credits and "&$exp_made&" experience.*"
else
	send "I made "&$cash_made&" credits and "&$exp_made&" experience.*"
end
if ($jet = "y")
	send "I made an extra "&$jetbonus&" experience at a cost of "&$jetcost&" credits.*"
end
send "Ship "&$ship_1&"'s equip multiple was "&$port.multiple[$ship_1]&".*"
send "Ship "&$ship_2&"'s equip multiple was "&$port.multiple[$ship_2]&".*"
gosub :player~quikstats
if ($low_turns <> "YES")

	send "Busted in ship "&$current_ship&", FURB please, I still have "&$player~turns&" turns to run.**"
end

halt

:getinfo
send "I"
waitfor "<Info>"

:waitforinfo
settextlinetrigger getexpandalign :getexpandalign "Rank and Exp"
settextlinetrigger getturns :getturns "Turns left"
settextlinetrigger getholds :getholds "Total Holds"
settextlinetrigger getcredits :getcredits "Credits"
setstrigger getinfodone :getinfodone "Command [TL="
pause
pause

:getexpandalign
killalltriggers
getword currentline $exp 5
getword currentline $align 7
striptext $exp ","
striptext $align ","
striptext $align "Alignment="
goto :waitforinfo

:getturns
killalltriggers
getword currentline $player~turns 4
if ($player~turns = "Unlimited")
	setvar $player~turns 65535
end
goto :waitforinfo

:getholds
killalltriggers
setvar $line currentline
getword $line $holds[$current_ship] 4
getwordpos $line $textpos "Ore="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $ore[$current_ship] 1
	striptext $ore[$current_ship] "Ore="
else
	setvar $ore[$current_ship] 0
end
getwordpos $line $textpos "Organics="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $org[$current_ship] 1
	striptext $org[$current_ship] "Organics="
else
	setvar $org[$current_ship] 0
end
getwordpos $line $textpos "Equipment="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $equ[$current_ship] 1
	striptext $equ[$current_ship] "Equipment="
else
	setvar $equ[$current_ship] 0
end
getwordpos $line $textpos "Colonists="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $col[$current_ship] 1
	striptext $col[$current_ship] "Colonists="
else
	setvar $col[$current_ship] 0
end
getwordpos $line $textpos "Empty="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $emp[$current_ship] 1
	striptext $emp[$current_ship] "Empty="
else
	setvar $emp[$current_ship] 0
end
goto :waitforinfo

:getcredits
killalltriggers
getword currentline $player~credits 3
striptext $player~credits ","
goto :waitforinfo

:getinfodone
killalltriggers
return

:checkport
send "D"
waitfor "<Re-Display>"
settextlinetrigger getport :getport "Ports   :"
setslinetrigger noport :noport "Command [TL="
pause
pause

:getport
killalltriggers
gettext currentline $port[$current_ship] ", Class " " ("
if (($port[$current_ship] <> 2) and (($port[$current_ship] <> 3) and (($port[$current_ship] <> 4) and ($port[$current_ship] <> 8))))
	setvar $bad_port_name port.name[$player~current_sector]
	setvar $switchboard~message "Ship " $current_ship " is in sector " $player~current_sector " at " $bad_port_name ", class " $port[$current_ship] ". SST needs an equipment-buying port (class 2, 3, 4, or 8). Halting.*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
else
	setvar $port.multiple[$current_ship] 110
	setvar $port.maxmultiple[$current_ship] 0
	send "CR*Q"

	:getselling
	if (($port[$current_ship] = 3) or ($port[$current_ship] = 4))
		settextlinetrigger getoreselling :getoreselling "Fuel Ore   Selling"
	else
		setvar $port.ore_selling[$current_ship] 0
	end

	if (($port[$current_ship] = 2) or ($port[$current_ship] = 4))
		settextlinetrigger getorgselling :getorgselling "Organics   Selling"
	else
		setvar $port.org_selling[$current_ship] 0
	end

	settextlinetrigger getequonport :getequonport "Equipment  Buying"
	pause
	pause

	:getoreselling
	killalltriggers
	getword currentline $port.ore_selling[$current_ship] 4
	if ($port.ore_selling[$current_ship] = 0)
		send "o 1 1 * q"
		setvar $port.ore_selling[$current_ship] 10
	end
	goto :getselling

	:getorgselling
	killalltriggers
	getword currentline $port.org_selling[$current_ship] 3
	if ($port.org_selling[$current_ship] = 0)
		send "o 2 1 * q"
		setvar $port.org_selling[$current_ship] 10
	end
	goto :getselling

	:getequonport
	killalltriggers
	getword currentline $port.equ_amount[$current_ship] 3
	getword currentline $port.equ_pct[$current_ship] 4
	striptext $port.equ_pct[$current_ship] "%"
	setvar $port.equ_max[$current_ship] $port.equ_amount[$current_ship]
	multiply $port.equ_max[$current_ship] 100
	divide $port.equ_max[$current_ship] $port.equ_pct[$current_ship]
	setvar $port.equ_on_dock[$current_ship] $port.equ_max[$current_ship]
	subtract $port.equ_on_dock[$current_ship] $port.equ_amount[$current_ship]

	setvar $steal_holds $exp
	divide $steal_holds $steal_divisor
	if ($steal_holds < 10)
		setvar $switchboard~message "You need more experience to SST!!!*"
		gosub :switchboard~switchboard
		gosub :endcnsettings
		gosub :sector~clearvoidadjacent
		halt
	elseif ($holds[$current_ship] < 10)
		setvar $switchboard~message "You need more cargo holds to SST!!!*"
		gosub :switchboard~switchboard
		gosub :endcnsettings
		gosub :sector~clearvoidadjacent
		halt
	end
	if ($steal_holds > $holds[$current_ship])
		setvar $steal_holds $holds[$current_ship]
	end

	setvar $temp $equ["CURRENT_SHIP"]
	add $temp $port.equ_on_dock[$current_ship]
	if ($steal_holds > $temp)
		setvar $upgrade_amount $steal_holds
		subtract $upgrade_amount $port.equ_on_dock[$current_ship]
		subtract $upgrade_amount $equ[$current_ship]
		divide $upgrade_amount 10
		add $upgrade_amount 1
		setvar $cash_needed $upgrade_amount
		multiply $cash_needed 900
		if ($player~credits >= $cash_needed)
			send "o  3"&$upgrade_amount&"**"
		else
			setvar $switchboard~message "Not enough credits on hand to upgrade the port.*"
			gosub :switchboard~switchboard
			gosub :endcnsettings
			gosub :sector~clearvoidadjacent
			halt
		end
		setvar $upgrade_amount 0
	end

	return
end

:noport
killalltriggers
setvar $switchboard~message "There is no port, you can't SST here!*"
gosub :switchboard~switchboard
gosub :endcnsettings
gosub :sector~clearvoidadjacent
halt

:cleanship
if ($port[$current_ship] = 2)
	if (($ore[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
		subtract $player~turns 1
		if (haggle)
			setvar $nativesellore $ore[$current_ship]
			setvar $nativesellorg 0
			setvar $nativesellequ $equ[$current_ship]
			setvar $nativebuyore 0
			setvar $nativebuyorg 0
			setvar $nativebuyequ 0
			gosub :nativeporttrade
			gosub :getinfo
			if (($ore[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
				setvar $switchboard~message "I couldn't clean the ship cargo with native haggle on. Script Halting*"
				gosub :switchboard~switchboard
				gosub :endcnsettings
				gosub :sector~clearvoidadjacent
				halt
			end
		else
			send "PT"
			if ($ore[$current_ship] <> 0)
				gosub :cleansell
			end
			if ($equ[$current_ship] <> 0)
				gosub :cleansell
			end
			send "0*"
		end
	else
		echo "**no need to port**"
	end

elseif ($port[$current_ship] = 3)
	if (($org[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
		subtract $player~turns 1
		if (haggle)
			setvar $nativesellore 0
			setvar $nativesellorg $org[$current_ship]
			setvar $nativesellequ $equ[$current_ship]
			setvar $nativebuyore 0
			setvar $nativebuyorg 0
			setvar $nativebuyequ 0
			gosub :nativeporttrade
			gosub :getinfo
			if (($org[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
				setvar $switchboard~message "I couldn't clean the ship cargo with native haggle on. Script Halting*"
				gosub :switchboard~switchboard
				gosub :endcnsettings
				gosub :sector~clearvoidadjacent
				halt
			end
		else
			send "PT"
			if ($org[$current_ship] <> 0)
				gosub :cleansell
			end
			if ($equ[$current_ship] <> 0)
				gosub :cleansell
			end
			send "0*"
		end
	end

elseif ($port[$current_ship] = 4)
	if ($equ[$current_ship] <> 0)
		subtract $player~turns 1
		if (haggle)
			setvar $nativesellore 0
			setvar $nativesellorg 0
			setvar $nativesellequ $equ[$current_ship]
			setvar $nativebuyore 0
			setvar $nativebuyorg 0
			setvar $nativebuyequ 0
			gosub :nativeporttrade
			gosub :getinfo
			if ($equ[$current_ship] <> 0)
				setvar $switchboard~message "I couldn't clean the ship cargo with native haggle on. Script Halting*"
				gosub :switchboard~switchboard
				gosub :endcnsettings
				gosub :sector~clearvoidadjacent
				halt
			end
		else
			send "PT"
			if ($equ[$current_ship] <> 0)
				gosub :cleansell
			end
			send "0*0*"
		end
	end

elseif ($port[$current_ship] = 8)
	if (($ore[$current_ship] <> 0) or ($org[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
		subtract $player~turns 1
		if (haggle)
			setvar $nativesellore $ore[$current_ship]
			setvar $nativesellorg $org[$current_ship]
			setvar $nativesellequ $equ[$current_ship]
			setvar $nativebuyore 0
			setvar $nativebuyorg 0
			setvar $nativebuyequ 0
			gosub :nativeporttrade
			gosub :getinfo
			if (($ore[$current_ship] <> 0) or ($org[$current_ship] <> 0) or ($equ[$current_ship] <> 0))
				setvar $switchboard~message "I couldn't clean the ship cargo with native haggle on. Script Halting*"
				gosub :switchboard~switchboard
				gosub :endcnsettings
				gosub :sector~clearvoidadjacent
				halt
			end
		else
			send "PT"
			if ($ore[$current_ship] <> 0)
				gosub :cleansell
			end
			if ($org[$current_ship] <> 0)
				gosub :cleansell
			end
			if ($equ[$current_ship] <> 0)
				gosub :cleansell
			end
		end
	end

else
	echo "**badport**"
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
end

send "JY"
setvar $emp[$current_ship] $holds[$current_ship]
setvar $ore[$current_ship] 0
setvar $org[$current_ship] 0
setvar $equ[$current_ship] 0
setvar $col[$current_ship] 0
setvar $sell_failures[$current_ship] 0
waitfor "Are you sure you want to jettison"
return

:cleansell
send "**"
return

:sell
if ($equ[$current_ship] > 0)
	subtract $player~turns 1

	if (haggle)
		setvar $nativesellore 0
		setvar $nativesellorg 0
		setvar $nativesellequ $equ[$current_ship]
		setvar $nativebuyore 0
		setvar $nativebuyorg 0
		setvar $nativebuyequ 0
		gosub :nativeporttrade
		gosub :getinfo
		if ($equ[$current_ship] > 0)
			setvar $switchboard~message "I'm having problems selling my equipment to the port with native haggle. Script Halting*"
			gosub :switchboard~switchboard
			gosub :endcnsettings
			gosub :sector~clearvoidadjacent
			halt
		end
		goto :aftersellsuccess
	end

	killalltriggers
	send "PT"

	:sellhaggle
	send "*"
	settextlinetrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
	pause
	pause

	:sellfirstoffer
	killalltriggers
	getword currentline $offer 5
	striptext $offer ","
	setvar $counter $offer
	multiply $counter $port.multiple[$current_ship]
	divide $counter 100
	send $counter&"*"

	:sellofferloop
	settextlinetrigger sellprice :sellprice "We'll buy them for"
	settextlinetrigger sellfinaloffer :sellfinaloffer "Our final offer"
	settextlinetrigger sellnotinterested :sellnotinterested "We're not interested."
	settextlinetrigger sellexperience :sellexperience "experience point(s)"
	settextlinetrigger sellempty :sellempty "empty cargo holds"

	settextlinetrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
	settextlinetrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
	settextlinetrigger sellscrewup3 :sellscrewup "My patience grows short with you."
	settextlinetrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
	settextlinetrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
	settextlinetrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
	settextlinetrigger sellscrewup7 :sellscrewup "Make a real offer or get the h*ll out of here!"
	settextlinetrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
	settextlinetrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
	settextlinetrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
	pause
	pause

	:sellscrewup
	killalltriggers
	multiply $counter 98
	divide $counter 100
	send $counter&"*"
	goto :sellofferloop

	:sellprice
	killalltriggers
	setvar $old_offer $offer
	setvar $old_counter $counter
	getword currentline $offer 5
	striptext $offer ","
	setvar $offer_pct $offer
	multiply $offer_pct 1000
	divide $offer_pct $old_offer
	if ($offer_pct < 1003)
		setvar $offer_pct 1003
	end
	multiply $counter 1000
	divide $counter $offer_pct
	if ($counter >= $old_counter)
		subtract $counter 1
	end
	send $counter&"*"
	goto :sellofferloop

	:sellfinaloffer
	killalltriggers
	setvar $old_offer $offer
	setvar $old_counter $counter
	getword currentline $offer 5
	striptext $offer ","
	setvar $offer_change $offer
	subtract $offer_change $old_offer
	multiply $offer_change 25
	divide $offer_change 10
	subtract $counter $offer_change
	subtract $counter 3
	send $counter&"*"
	goto :sellofferloop

	:sellnotinterested
	killalltriggers
	goto :sellhagglefailed

	:sellexperience
	killalltriggers
	getword currentline $exp_bonus 7
	add $exp $exp_bonus
	goto :sellofferloop

	:sellempty
	killalltriggers
	getword currentline $player~credits 3
	striptext $player~credits ","
	setvar $oldemp[$current_ship] $emp[$current_ship]
	getword currentline $emp[$current_ship] 6
	if ($oldemp[$current_ship] = $emp[$current_ship])
		goto :sellhagglefailed
	else
		goto :sellhagglesucceeded
	end

	:sellhagglefailed
	if (($port[$current_ship] = 2) or ($port[$current_ship] = 3))
		send "0*"
	elseif ($port[$current_ship] = 4)
		send "0*0*"
	end

	add $sell_failures[$current_ship] 1
	subtract $port.multiple[$current_ship] 1
	setvar $port.maxmultiple[$current_ship] $port.multiple[$current_ship]

	if ($sell_failures[$current_ship] > 5)
		setvar $switchboard~message "I'm having problems selling my equipment to the port. Script Halting*"
		gosub :switchboard~switchboard
		gosub :endcnsettings
		gosub :sector~clearvoidadjacent
		halt
	end
	goto :sell

	:sellhagglesucceeded
	if ($port.maxmultiple[$current_ship] = 0)
		add $port.multiple[$current_ship] 2
	end

	:aftersellsuccess
	if ($jet = "y")
		setvar $dooreupgrade 0
		setvar $doorgupgrade 0

		if (($port[$current_ship] = 3) or ($port[$current_ship] = 4))
			if ($port.ore_selling[$current_ship] > $jetholdsore)
				if ($emp[$current_ship] >= $jetholdsore)

					send $jetholdsore
					gosub :buyhaggle
					if ($buyhaggle = 1)
						subtract $port.ore_selling[$current_ship] $jetholdsore
					end
				else
					send "0*"
				end
			elseif ($port.ore_selling[$current_ship] > 0)
				setvar $switchboard~message "This port is selling little ore, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				add $port.ore_selling[$current_ship] 500
				setvar $dooreupgrade 1
				send "0*"
			else
				setvar $switchboard~message "This port is selling 0 ore, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				add $port.ore_selling[$current_ship] 500
				setvar $dooreupgrade 1
			end
		end

		if (($port[$current_ship] = 2) or ($port[$current_ship] = 4))
			if ($port.org_selling[$current_ship] > $jetholdsorg)
				if ($emp[$current_ship] >= $jetholdsorg)
					send $jetholdsorg
					gosub :buyhaggle
					if ($buyhaggle = 1)
						subtract $port.org_selling[$current_ship] $jetholdsorg
					end
				else
					send "0*"
				end
			elseif ($port.org_selling[$current_ship] > 0)
				setvar $switchboard~message "This port is selling little org, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				add $port.org_selling[$current_ship] 500
				setvar $doorgupgrade 1
				send "0*"
			else
				setvar $switchboard~message "This port is selling 0 org, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				add $port.org_selling[$current_ship] 500
				setvar $doorgupgrade 1
			end
		end
		if ($dooreupgrade = 1)
			setvar $dooreupgrade 0
			send "o 1 10 *  1 10 *  1 10 *  1 10 *  1 10 * q"
		end
		if ($doorgupgrade = 1)
			setvar $doorgupgrade 0
			send "o 2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 * q"
		end
		send "JY"
		setvar $emp[$current_ship] $holds[$current_ship]
		setvar $ore[$current_ship] 0
		setvar $org[$current_ship] 0
		setvar $equ[$current_ship] 0
		setvar $col[$current_ship] 0
	else

		if (($port[$current_ship] = 3) or ($port[$current_ship] = 4))
			if ($port.ore_selling[$current_ship] > 0)
				send "0*"
			else
				setvar $switchboard~message "This port is selling 0 ore, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				setvar $dooreupgrade 1
				add $port.ore_selling[$current_ship] 10
			end
		end
		if (($port[$current_ship] = 2) or ($port[$current_ship] = 4))
			if ($port.org_selling[$current_ship] > 0)
				send "0*"
			else
				setvar $switchboard~message "This port is selling 0 org, I will upgrade a small amount.*"
				gosub :switchboard~switchboard
				setvar $doorgupgrade 1
				add $port.org_selling[$current_ship] 10
			end
		end
		if ($dooreupgrade = 1)
			setvar $dooreupgrade 0
			send "o 1 1 * q"
		end
		if ($doorgupgrade = 1)
			setvar $doorgupgrade 0
			send "o 2 1 * q"
		end
		send "JY"
		setvar $emp[$current_ship] $holds[$current_ship]
		setvar $ore[$current_ship] 0
		setvar $org[$current_ship] 0
		setvar $equ[$current_ship] 0
		setvar $col[$current_ship] 0
	end
	return
else
	setvar $switchboard~message "There is no equ to sell, something is wrong*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
end

:nativeporttrade
setvar $nativeportactive 0
send "PT"

:nativeporttradewait
settextlinetrigger nativeportstart1 :nativeporttradeprogress "<Port>"
settextlinetrigger nativeportstart2 :nativeporttradeprogress "Docking..."
settexttrigger nativeportstart3 :nativeporttradeprogress "Your offer ["
settexttrigger nativeportstart4 :nativeporttradeprogress "Our final offer"
settexttrigger nativeportstart5 :nativeporttradeprogress "Agreed,"
setstrigger nativeportqty :nativeporttradeqty "How many holds of "
if ($nativeportactive = 1)
	setstrigger nativeportdone1 :nativeporttradedone "Command [TL="
	setstrigger nativeportdone2 :nativeporttradedone "Citadel command"
end
pause

:nativeporttradeprogress
killalltriggers
setvar $nativeportactive 1
goto :nativeporttradewait

:nativeporttradeqty
killalltriggers
setvar $nativeportactive 1
setvar $nativeline currentline
gosub :handlenativeportqty
goto :nativeporttradewait

:nativeporttradedone
killalltriggers
return

:handlenativeportqty
setvar $nativetradeproduct "None"
setvar $nativeisbuy 0
setvar $nativeissell 0

getwordpos $nativeline $nativex " do you want to buy "
if ($nativex > 0)
	setvar $nativeisbuy 1
else
	setvar $nativeissell 1
end

getwordpos $nativeline $nativex "Fuel"
if ($nativex > 0)
	setvar $nativetradeproduct "Fuel"
else
	getwordpos $nativeline $nativex "Organics"
	if ($nativex > 0)
		setvar $nativetradeproduct "Organics"
	else
		getwordpos $nativeline $nativex "Equipment"
		if ($nativex > 0)
			setvar $nativetradeproduct "Equipment"
		end
	end
end

if ($nativeissell = 1)
	if (($nativetradeproduct = "Fuel") and ($nativesellore > 0))
		send "*"
		setvar $nativesellore 0
	elseif (($nativetradeproduct = "Organics") and ($nativesellorg > 0))
		send "*"
		setvar $nativesellorg 0
	elseif (($nativetradeproduct = "Equipment") and ($nativesellequ > 0))
		send "*"
		setvar $nativesellequ 0
	else
		send "0*"
	end
	return
end

if (($nativetradeproduct = "Fuel") and ($nativebuyore > 0))
	send $nativebuyore & "*"
	setvar $nativebuyore 0
elseif (($nativetradeproduct = "Organics") and ($nativebuyorg > 0))
	send $nativebuyorg & "*"
	setvar $nativebuyorg 0
elseif (($nativetradeproduct = "Equipment") and ($nativebuyequ > 0))
	send $nativebuyequ & "*"
	setvar $nativebuyequ 0
else
	send "0*"
end
return

:buyhaggle
send "*"
settextlinetrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
pause
pause

:buyfirstoffer
killalltriggers
getword currentline $offer 5
striptext $offer ","
setvar $counter $offer
multiply $counter 92
divide $counter 100
send $counter&"*"

:buyofferloop
settextlinetrigger buyprice :buyprice "We'll sell them for"
settextlinetrigger buyfinaloffer :buyfinaloffer "Our final offer"
settextlinetrigger buynotinterested :buynotinterested "We're not interested."
settextlinetrigger buyexperience :buyexperience "experience point(s)"
settextlinetrigger buyempty :buyempty "empty cargo holds"
settextlinetrigger buyscrewup1 :buyscrewup "Get real ion-brain, make me a real offer."
settextlinetrigger buyscrewup2 :buyscrewup "This is the big leagues Jr.  Make a real offer."
settextlinetrigger buyscrewup3 :buyscrewup "My patience grows short with you."
settextlinetrigger buyscrewup4 :buyscrewup "I have much better things to do than waste my time.  Try again."
settextlinetrigger buyscrewup5 :buyscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
settextlinetrigger buyscrewup6 :buyscrewup "Quit playing around, you're wasting my time!"
settextlinetrigger buyscrewup7 :buyscrewup "Make a real offer or get the h*ll out of here!"
settextlinetrigger buyscrewup8 :buyscrewup "WHAT?!@!? you must be crazy!"
settextlinetrigger buyscrewup9 :buyscrewup "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger buyscrewup10 :buyscrewup "What do you take me for, a fool?  Make a real offer!"
pause
pause

:buyscrewup
killalltriggers

multiply $counter 102
divide $counter 100
send $counter&"*"
goto :buyofferloop

:buyprice
killalltriggers
setvar $old_offer $offer
setvar $old_counter $counter
getword currentline $offer 5
striptext $offer ","
setvar $offer_pct $offer
multiply $offer_pct 1000
divide $offer_pct $old_offer
if ($offer_pct > 990)
	setvar $offer_pct 990
end
multiply $counter 1000
divide $counter $offer_pct
if ($counter <= $old_counter)
	add $counter 1
end
send $counter&"*"
goto :buyofferloop

:buyfinaloffer
killalltriggers
setvar $old_offer $offer
setvar $old_counter $counter
getword currentline $offer 5
striptext $offer ","
setvar $offer_change $offer
subtract $offer_change $old_offer
multiply $offer_change 25
divide $offer_change 10
subtract $counter $offer_change
if ($counter = $old_counter)
	add $counter 1
end
add $counter 1
send $counter&"*"
goto :buyofferloop

:buynotinterested
killalltriggers
goto :buyhagglefailed

:buyexperience
killalltriggers
getword currentline $exp_bonus 7
add $exp $exp_bonus
add $jetbonus $exp_bonus

goto :buyofferloop

:buyempty
killalltriggers
getword currentline $player~credits 3
striptext $player~credits ","
setvar $oldemp[$current_ship] $emp[$current_ship]
getword currentline $emp[$current_ship] 6
if ($oldemp[$current_ship] = $emp[$current_ship])
	goto :buyhagglefailed
else
	goto :buyhagglesucceeded
end

:buyhagglefailed
setvar $buyhaggle 0
return

:buyhagglesucceeded
add $jetcost $counter
setvar $buyhaggle 1
return

:steal
setvar $steal_holds $exp
divide $steal_holds $steal_divisor
if ($steal_holds < 10)
	setvar $switchboard~message "You need more experience to SST!!!*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
elseif ($holds[$current_ship] < 10)
	setvar $switchboard~message "You need more cargo holds to SST!!!*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
end
if (($steal_holds > 300) and ($jet = "y"))
	setvar $switchboard~message "We are at " $steal_holds " holds of experience, stopping JET*"
	gosub :switchboard~switchboard
	setvar $jet ""
end
if ($steal_holds > $emp[$current_ship])
	setvar $steal_holds $emp[$current_ship]
end

setvar $desired_holds_on_port $steal_holds
add $desired_holds_on_port 2

subtract $player~turns 1
send "PR*SZ3"
waitfor "furtively about"
settextlinetrigger equonport :equonport "Equipment  Buying"
settextlinetrigger fake :fake "Suddenly you're Busted!"
pause
pause

:equonport
killalltriggers
getword currentline $holds_on_port 4
if ($holds_on_port < $desired_holds_on_port)
	setvar $upgrade_amount $desired_holds_on_port
	subtract $upgrade_amount $holds_on_port
	divide $upgrade_amount 10
	add $upgrade_amount 1
else
	setvar $upgrade_amount 0
end
if ($holds_on_port < 10)
	setvar $steal_holds 0
	goto :dothedeed
elseif ($holds_on_port < $steal_holds)
	setvar $temp $steal_holds
	multiply $temp 10
	divide $temp $holds_on_port
	if ($temp <= 20)
		setvar $steal_holds $holds_on_port
	else
		setvar $steal_holds 0
	end
end

:dothedeed
if ($debugdelay <> 0)
	setdelaytrigger testing :testing $debugdelay
	pause
	pause
end

:testing
send $steal_holds&"*"
settextlinetrigger bust :bust "For getting caught"
settextlinetrigger nosteal :nosteal "You leave the port"
settextlinetrigger good :good "and you receive"
pause
pause

:bust
killalltriggers

setsectorparameter 1 "LRA" currentsector
setvar $cklra currentsector
savevar $cklra
setsectorparameter currentsector "BUSTED" true
send "'<"&$bot~subspace&">[Busted:"&currentsector "]<"&$bot~subspace&">*"
gosub :getinfo
goto :finish

:fake
killalltriggers
gosub :player~quikstats
setsectorparameter $player~current_sector "FAKEBUST" true
send "  "
send "N  N  *  *"
setvar $switchboard~message "FAKE Busted in Ship "&$current_ship&", need a super furb*"
gosub :switchboard~switchboard
gosub :endcnsettings
gosub :sector~clearvoidadjacent
halt

:good
killalltriggers

getword currentline $exp_bonus 4
add $exp $exp_bonus
add $equ[$current_ship] $steal_holds
subtract $emp[$current_ship] $steal_holds
if ($upgrade_amount <> 0)
	send "o  3"&$upgrade_amount&"**"
end
setsectorparameter 1 "LRA" currentsector
setvar $cklra currentsector
savevar $cklra

return

:nosteal
killalltriggers
if ($upgrade_amount <> 0)
	send "o  3"&$upgrade_amount&"**"
end
goto :steal

:xport
if ($ship_1 = $current_ship)
	setvar $current_ship $ship_2
else
	setvar $current_ship $ship_1
end
subtract $player~turns 1
if ($skip_ships = "YES")
	setvar $xportstring "X  "&$current_ship&"*  Q"
	send $xportstring
	return
else
	setvar $xportstring "X  "&$current_ship&"*Q"
	send $xportstring
	settextlinetrigger noxportship :noxportship "That is not an available ship"
	settextlinetrigger noxportrange :noxportrange "only has a transport range"
	setslinetrigger noxportpassword :noxportpassword "Enter the password for"
	settextlinetrigger xportsuccess :xportsuccess "Security code accepted"
	pause
	pause

	:noxportship
	killalltriggers
	setvar $switchboard~message "That is not an available ship, Script Halting.*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt

	:noxportrange
	killalltriggers
	setvar $switchboard~message "Not enough transport range, Script Halting.*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt

	:noxportpassword
	killalltriggers
	setvar $switchboard~message "Transport ship requires a password, Script Halting.*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt

	:xportsuccess
	killalltriggers
	return
end

:startcnsettings
send "CN"

settextlinetrigger ansi0 :ansi0 "(1) ANSI graphics            - Off"
settextlinetrigger ansi1 :ansi1 "(1) ANSI graphics            - On"
pause

:ansi0
killalltriggers
setvar $cn1 0
goto :cn1done

:ansi1
killalltriggers
setvar $cn1 1

:cn1done
settextlinetrigger anim0 :anim0 "(2) Animation display        - Off"
settextlinetrigger anim1 :anim1 "(2) Animation display        - On"
pause

:anim0
killalltriggers
setvar $cn2 0
goto :cn2done

:anim1
killalltriggers
setvar $cn2 1

:cn2done
settextlinetrigger page0 :page0 "(3) Page on messages         - Off"
settextlinetrigger page1 :page1 "(3) Page on messages         - On"
pause

:page0
killalltriggers
setvar $cn3 0
goto :cn3done

:page1
killalltriggers
setvar $cn3 1

:cn3done
settextlinetrigger silence0 :silence0 "(7) Silence ALL messages     - No"
settextlinetrigger silence1 :silence1 "(7) Silence ALL messages     - Yes"
pause

:silence0
killalltriggers
setvar $cn7 0
goto :cn7done

:silence1
killalltriggers
setvar $cn7 1

:cn7done
settextlinetrigger abortdisplay0 :abortdisplay0 "(9) Abort display on keys    - SPACE"
settextlinetrigger abortdisplay1 :abortdisplay1 "(9) Abort display on keys    - ALL KEYS"
pause

:abortdisplay0
killalltriggers
setvar $cn9 0
goto :cn9done

:abortdisplay1
killalltriggers
setvar $cn9 1

:cn9done
settextlinetrigger messagedisplay0 :messagedisplay0 "(A) Message Display Mode     - Compact"
settextlinetrigger messagedisplay1 :messagedisplay1 "(A) Message Display Mode     - Long"
pause

:messagedisplay0
killalltriggers
setvar $cna 0
goto :cnadone

:messagedisplay1
killalltriggers
setvar $cna 1

:cnadone
settextlinetrigger screenpauses0 :screenpauses0 "(B) Screen Pauses            - No"
settextlinetrigger screenpauses1 :screenpauses1 "(B) Screen Pauses            - Yes"
pause

:screenpauses0
killalltriggers
setvar $cnb 0
goto :cnbdone

:screenpauses1
killalltriggers
setvar $cnb 1

:cnbdone
waitfor "Settings command (?=Help)"
gosub :sendcnstring
send "?"
waitfor "Settings command (?=Help)"
send "QQ"
setstrigger substartcncontinue1 :substartcncontinue "Command [TL="
setstrigger substartcncontinue2 :substartcncontinue "Citadel command (?=help)"
pause

:substartcncontinue
killalltriggers
return

:endcnsettings
send "CN"
waitfor "Settings command (?=Help)"
gosub :sendcnstring
send "?"
waitfor "Settings command (?=Help)"
send "QQ"
setstrigger subendcncontinue1 :subendcncontinue "Command [TL="
setstrigger subendcncontinue2 :subendcncontinue "Citadel command (?=help)"
pause

:subendcncontinue
killalltriggers
return

:sendcnstring
if ($cn1 = 0)
	send "1  "
end
if ($cn2 = 1)
	send "2  "
end
if ($cn3 = 1)
	send "3  "
end
if ($cn7 = 1)
	send "7  "
end
if ($cn9 = 1)
	send "9  "
end
if ($cna = 1)
	send "A  "
end
if ($cnb = 1)
	send "B  "
end
return

:sector~voidadjacent
send "*"
gosub :player~quikstats

if ($sec1void = 0)
	setvar $sec1void $player~current_sector
else
	setvar $sec2void $player~current_sector
end
if (sector.warps[$player~current_sector][1] = 0)
	setvar $switchboard~message "This sector has no warps, maybe you need to scan it first*"
	gosub :switchboard~switchboard
	gosub :endcnsettings
	gosub :sector~clearvoidadjacent
	halt
else
	setvar $voidsect 0

	:voids
	add $voidsect 1
	if ($voidsect < 7)
		if (sector.warps[$player~current_sector][$voidsect] <> 0)
			send "CV"&sector.warps[$player~current_sector][$voidsect]&"*Q"
		end
		goto :voids
	end

	setvar $switchboard~message "Avoids set on all adjacent sectors*"
	gosub :switchboard~switchboard
	send "/"
	waitfor " Sect "
	return
end

:sector~clearvoidadjacent
setvar $voidsect 0

:clearvoids
if ($sec1void > 0)
	add $voidsect 1
	if ($voidsect < 7)
		if (sector.warps[$sec1void][$voidsect] <> 0)
			send "CV0*YN"&sector.warps[$sec1void][$voidsect]&"*Q"
		end
		goto :clearvoids
	end
end

setvar $switchboard~message "Avoids cleared on all adjacent sectors*"
gosub :switchboard~switchboard
send "/"
waitfor " Sect "

if ($sec2void > 0)
	setvar $voidsect 0

	:clearvoids2
	add $voidsect 1
	if ($voidsect < 7)
		if (sector.warps[$sec2void][$voidsect] <> 0)
			send "CV0*YN"&sector.warps[$sec2void][$voidsect]&"*Q"
		end
		goto :clearvoids2
	end

	setvar $switchboard~message "Avoids cleared on all adjacent sectors*"
	gosub :switchboard~switchboard
	send "/"
	waitfor " Sect "
end

return

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\sector"
include "source\include\switchboard.ts"
