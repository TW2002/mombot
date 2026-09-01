gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"       Day 1 trader aimed at doing the best trade and testing MCIC "
setvar $help~help[2]  $help~tab&"       Keep equipment/empty holds so you always have ability to test ports."
setvar $help~help[3]  $help~tab&"       Script will attempt to haggle at any port for equip buy or sell."
setvar $help~help[4]  $help~tab&"       Best used with EP Haggle to get MCIC for buy/sell in megarob games."
setvar $help~help[5]  $help~tab&"        - Avoids trading small amounts of Fuel/Org to avoid experience."
setvar $help~help[6]  $help~tab&"       "
setvar $help~help[7]  $help~tab&"       trade {q} {mcic}"
setvar $help~help[8]  $help~tab&"       "
setvar $help~help[9]  $help~tab&" Options:"
setvar $help~help[10]  $help~tab&"    {q}       How much equipment to keep post trade. "
setvar $help~help[11]  $help~tab&"              - Default is 5"
setvar $help~help[12]  $help~tab&"    {mcic}    Will just test MCIC and keep fuel."
setvar $help~help[12]  $help~tab&"       EP haggle will be used if it is running in the bot. "

gosub :help~helpfile

setvar $switchboard~message "Trade starting up!*"
gosub :switchboard~switchboard

setvar $haggle "t"
setvar $keepequip 5

getword $bot~user_command_line $bot~parm1 1
getword $bot~user_command_line $bot~parm2 2

setvar $mciconly false

if ($bot~parm1 = "mcic")
	setvar $mciconly true
	setvar $keepequip 30
	setvar $switchboard~message "MCIC Only Mode.*"
	gosub :switchboard~switchboard
else
	if ($bot~parm1 <> "")
		isnumber $test $bot~parm1
		if ($test = false)
			setvar $switchboard~message "Pleae enter a number for the equip to keep.*"
			gosub :switchboard~switchboard
			halt
		else
			setvar $keepequip $bot~parm1
		end
	end
	if ($keepequip = 0)
		#setVar $keepEquip 5
	end
end

gosub :player~quikstats

setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "Trade Must start at command prompt.*"
	gosub :switchboard~switchboard
	halt

end

setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

if ($player~colonist_holds > 0)
	setvar $switchboard~message "Don't bore the tourists, offload the colonists.*"
	gosub :switchboard~switchboard
	halt
end

gosub :chkftr

setvar $virtfreeholds $empty_holds
setvar $sellore 0
setvar $sellorg 0
setvar $sellequip 0

setvar $buyore 0
setvar $buyorg 0
setvar $buyequip 0

if ($mciconly = false)
	if (($player~ore_holds > 0) and (port.buyfuel[currentsector] = 1))
		setvar $sellore $player~ore_holds
		setvar $virtfreeholds ($virtfreeholds + $sellore)
	end

	if (($player~organic_holds > 0) and (port.buyorg[currentsector] = 1))
		setvar $sellorg $player~organic_holds
		setvar $virtfreeholds ($virtfreeholds + $sellorg)
	end

	if (($player~equipment_holds > 0) and (port.buyequip[currentsector] = 1))
		if ($player~equipment_holds <= $keepequip)
			setvar $sellequip 1
			setvar $virtfreeholds ($virtfreeholds + 1)
		else
			setvar $sellequip ($player~equipment_holds - $keepequip)
			setvar $virtfreeholds ($virtfreeholds + $sellequip)
		end

	end

	if ($virtfreeholds > $keepequip)

		if (port.buyequip[currentsector] = 0)
			setvar $buyequip ($virtfreeholds - $keepequip)

		else
			if (port.buyorg[currentsector] = 0)
				setvar $buyorg ($virtfreeholds - $keepequip)
				if ($buyorg < $keepequip)
					setvar $buyorg 0
				end
			else
				if (port.buyfuel[currentsector] = 0)
					setvar $buyore ($virtfreeholds - $keepequip)
					if ($buyore < $keepequip)
						setvar $buyore 0
					end
				end
			end
		end
	else
		if (($virtfreeholds <= $keepequip) and ($virtfreeholds > 0))
			if (port.buyequip[currentsector] = 0)
				setvar $buyequip 1
			end
		end
	end

else
	# MCIC Testing
	#    We buy 5 or Sell 5 tops.
	#    Top ore where we can
	#    Always leave 30 holds for equipment management
	echo "TRADING: *"
	echo "$player~equipment_holds: " $$player~equipment_holds "*"
	echo "player~ore_holds: " $player~ore_holds "*"
	echo "sellEquip: " $sellequip "*"
	echo "buyOre: " $buyore "*"
	echo "buyOrg: " $buyorg "*"
	echo "buyEquip: " $buyequip "*"
	echo "virtFreeHolds: " $virtfreeholds "*"

	# They sell equipment - sell 5 max
	if (($player~equipment_holds > 0) and (port.buyequip[currentsector] = 1))
		if ($player~equipment_holds <= 5)
			setvar $sellequip $player~equipment_holds
			setvar $virtfreeholds ($virtfreeholds + $player~equipment_holds)
		else
			setvar $sellequip 5
			setvar $virtfreeholds ($virtfreeholds + 5)
		end
	end

	# they buy equipment, buy 5 max
	if (port.buyequip[currentsector] = 0)
		if ($virtfreeholds < 5)
			setvar $buyequip $virtfreeholds
		else
			setvar $buyequip 5
		end
		setvar $virtfreeholds ($virtfreeholds - $buyequip)
	end
	if (port.buyfuel[currentsector] = 0)
		if ($virtfreeholds > $keepequip)
			setvar $buyore ($virtfreeholds - $keepequip)
		end
		#if ($buyOre < $keepEquip)
		#	setVar $buyOre 0
		#end
	end

end
echo "TRADING: *"
echo "sellOre: " $sellore "*"
echo "sellOrg: " $sellorg "*"
echo "sellEquip: " $sellequip "*"
echo "buyOre: " $buyore "*"
echo "buyOrg: " $buyorg "*"
echo "buyEquip: " $buyequip "*"
echo "virtFreeHolds: " $virtfreeholds "*"

setvar $trading ($sellore + $sellorg + $sellequip + $buyore + $buyorg + $buyequip)
if ($trading > 0)
	gosub :voidadjacent
	gosub :portandtrade
	gosub :clearadjacent
else
	setvar $switchboard~message "Nothing to trade; have a nice day!*"
	gosub :switchboard~switchboard
	halt
end

halt

:portandtrade
//
setvar $report 0
send "p   t"
waitfor "Commerce report for"

settextlinetrigger checkcash :checkcash "empty cargo holds"
settextlinetrigger portfail :portfail "ou don't have anything they want, and they don't have anything you can b"
pause

:portfail
setvar $switchboard~message "Oops nothing to trade; script fail?*"
gosub :switchboard~switchboard
halt

:checkcash
killalltriggers

killalltriggers

:tradeloop
setstrigger sell1 :sell1 "How many holds of Fuel Ore do you want to sell"
setstrigger sell2 :sell2 "How many holds of Organics do you want to sell"
setstrigger sell3 :sell3 "How many holds of Equipment do you want to sell"
setstrigger buy1 :buy1 "How many holds of Fuel Ore do you want to buy"
setstrigger buy2 :buy2 "How many holds of Organics do you want to buy"
setstrigger buy3 :buy3 "How many holds of Equipment do you want to buy"
setstrigger tradeloopdone :tradeloopdone "Command ["
pause

:sell1
killalltriggers
setvar $player~multiplier 105
if ($sellore > 0)
	setvar $tradequant $sellore
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:sell2
killalltriggers
setvar $player~multiplier 105
if ($sellorg > 0)
	setvar $tradequant $sellorg
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:sell3
killalltriggers
setvar $player~multiplier 105
if ($sellequip > 0)
	setvar $tradequant $sellequip
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:buy1
killalltriggers
setvar $player~multiplier 95
if ($buyore > 0)
	setvar $tradequant $buyore
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:buy2
killalltriggers
setvar $player~multiplier 95
if ($buyorg > 0)
	setvar $tradequant $buyorg
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:buy3
killalltriggers
setvar $player~multiplier 95

if ($buyequip > 0)
	setvar $tradequant $buyequip
	gosub :dotrade
else
	gosub :notrade
end
goto :tradeloop

:tradeloopdone
killalltriggers
return

:notrade
send "0*"
waitfor "empty cargo holds."
return

:dotrade
setvar $promptmax ""
gettext currentline $promptmax "[" "]"
striptext $promptmax ","
striptext $promptmax "."
isnumber $promptmaxisnum $promptmax
if ($promptmaxisnum = true)
	if ($promptmax < $tradequant)
		setvar $tradequant $promptmax
	end
end

if ($tradequant <= 0)
	send "0*"
	waitfor "empty cargo holds."
	return
end

send $tradequant "*"

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

return

:chkftr
if (sector.figs.quantity[currentsector] = 0)
	if (currentsector > 10)
		send "f   1  *  c  d "

	end
end

return

:voidadjacent
setvar $player~current_sector currentsector
gosub :sector~voidadjacent
setvar $switchboard~message "Avoids set on adjacent sectors!*"
gosub :switchboard~switchboard
return

:clearadjacent
setvar $player~current_sector currentsector
gosub :sector~clearvoidadjacent
setvar $switchboard~message "Avoids cleared on adjacent sectors!*"
gosub :switchboard~switchboard
return

halt

#INCLUDES:
include "source\include\player"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
include "source\include\switchboard.ts"
