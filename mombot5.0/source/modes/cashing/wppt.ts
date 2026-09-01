gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]   $help~tab&"- wppt {holoscan} {evade} {pay}"
setvar $help~help[2]   $help~tab&"  World PPT using the legacy worldtrade engine                     "
setvar $help~help[3]   $help~tab&"                                                                  "
setvar $help~help[4]   $help~tab&"     {holoscan}      0 - doesn't holoscan                         "
setvar $help~help[5]   $help~tab&"                     1 - holoscans on odd densities               "
setvar $help~help[6]   $help~tab&"                     2 - always holoscans (default)               "
setvar $help~help[7]   $help~tab&"                                                                  "
setvar $help~help[8]   $help~tab&"     {evade}         0 - normal (default)                         "
setvar $help~help[9]   $help~tab&"                     1 - paranoid                                 "
setvar $help~help[10]  $help~tab&"                     2 - avoids nothing                           "
setvar $help~help[11]  $help~tab&"                                                                  "
setvar $help~help[12]  $help~tab&"     {pay}             - pays tolls                               "
setvar $help~help[13]  $help~tab&"                                                                  "
setvar $help~help[14]  $help~tab&"     {fast}            - go fast, turn left :)                    "
setvar $help~help[15]  $help~tab&"                                                                  "
setvar $help~help[16]  $help~tab&"     Fig type/count come from your Mombot tab-~ preferences      "

gosub :help~helpfile

setvar $switchboard~message "World PPT starting up!*"
gosub :switchboard~switchboard

settextlinetrigger prompt :allprompts #145 & #8
send #145&"/"
pause

:allprompts
getword currentline $current_prompt 1
striptext $current_prompt #145
striptext $current_prompt #8
killalltriggers

if ($current_prompt <> "Command")
	clientmessage "This script must be run from the command menu"
	halt
end

reqrecording
logging off

if (($bot~parm1 = 0) or ($bot~parm1 = 1) or ($bot~parm1 = 2))
	setvar $move~scanholo $bot~parm1
else
	setvar $move~scanholo 2
end

if (($bot~parm2 = 0) or ($bot~parm2 = 1) or ($bot~parm2 = 2))
	setvar $move~evasion $bot~parm2
else
	setvar $move~evasion 0
end

getwordpos " "&$bot~user_command_line&" " $pos " fast "
if ($pos > 0)
	setvar $batch 1
	if (haggle)
		setvar $haggle_switch 1
		autohaggle off
	end
else
	setvar $batch 0
end

getwordpos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
	setvar $move~attack 3
else
	setvar $move~attack 2
end
setvar $move~portpriority 1

if ($player~dropoffensive = true)
	setvar $wppt_deployfig "o"
elseif ($player~droptoll = true)
	setvar $wppt_deployfig "t"
else
	setvar $wppt_deployfig "d"
end

if ($player~surroundfigs > 0)
	setvar $move~extrasend "f z" & $player~surroundfigs & "*zc" & $wppt_deployfig & "*  "
	setvar $move~extrasendall 1
	setvar $ppt_dropfigs 1
else
	setvar $move~extrasend ""
	setvar $move~extrasendall 0
	setvar $ppt_dropfigs 0
end

loadvar $ppt_saved
if ($ppt_saved)
	loadvar $ppt_perctrade
else
	setvar $ppt_perctrade 20
	savevar $ppt_perctrade
	setvar $ppt_saved 1
	savevar $ppt_saved
end

setvar $portcheck~danger 1
setvar $portcheck~fuelorganics 1
setvar $portcheck~porttype 1

:menu_go
setvar $worldtrade~quota 0
seteventtrigger disconnect :disconnected "Connection lost"
gosub :worldtrade
goto :shutdown

:disconnected
killalltriggers
waitfor "Command [TL="
goto :menu_go

:shutdown
halt

:ppt
gosub :player~quikstats

setvar $ppt~ore $player~ore_holds
setvar $ppt~org $player~organic_holds
setvar $ppt~equip $player~equipment_holds
setvar $ppt~holds $player~total_holds
setvar $ppt~displayoff 0
setvar $ppt~aborted 0

if ($ppt~ore > 0)
	setvar $ppt~onhand "Fuel"
elseif ($ppt~org > 0)
	setvar $ppt~onhand "Organics"
elseif ($ppt~equip > 0)
	setvar $ppt~onhand "Equipment"
else
	setvar $ppt~onhand "None"
end

setvar $ppt~oneway 0

send "cr*r" $ppt~sectorb "*q"

settextlinetrigger pptreporta :ppt_reporta "Commerce report for"
settextlinetrigger pptnoporta :ppt_noport "I have no information about a port in that sector."
pause

:ppt_reporta
killalltriggers
settextlinetrigger getsellproducta :ppt_getsellproducta $ppt~proda
settextlinetrigger getbuyproducta :ppt_getbuyproducta $ppt~prodb
setstrigger gotproducta :ppt_gotproducta "Computer command"
pause

:ppt_getsellproducta
setvar $ppt~line currentline
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamounta 3
pause

:ppt_getbuyproducta
setvar $ppt~line currentline
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamounta 3
pause

:ppt_gotproducta
killalltriggers

settextlinetrigger pptreportb :ppt_reportb "Commerce report for"
settextlinetrigger pptnoportb :ppt_noport "I have no information about a port in that sector."
pause

:ppt_reportb
killalltriggers
settextlinetrigger getsellproductb :ppt_getsellproductb $ppt~prodb
settextlinetrigger getbuyproductb :ppt_getbuyproductb $ppt~proda
setstrigger gotproductb :ppt_gotproductb "Computer command"
pause

:ppt_getsellproductb
setvar $ppt~line currentline
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamountb 3
pause

:ppt_getbuyproductb
setvar $ppt~line currentline
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamountb 3
pause

:ppt_gotproductb
killalltriggers
goto :ppt_afterreports

:ppt_noport
killalltriggers
setvar $ppt~sector $ppt~sectora
setvar $ppt~aborted 1
waiton "Command [TL="
return

:ppt_afterreports
setvar $ppt~trade 100
setvar $ppt~x 100
multiply $ppt~x $ppt~holds
subtract $ppt~trade $ppt~perctrade
multiply $ppt~sellamounta $ppt~trade
multiply $ppt~sellamountb $ppt~trade
multiply $ppt~buyamounta $ppt~trade
multiply $ppt~buyamountb $ppt~trade
divide $ppt~sellamounta $ppt~x
divide $ppt~sellamountb $ppt~x
divide $ppt~buyamounta $ppt~x
divide $ppt~buyamountb $ppt~x

if ($batch)
	setvar $ppt~clock 4
else
	setvar $ppt~clock 0
end

if (($ppt~sellamounta <= 1) or ($ppt~sellamountb <= 1) or ($ppt~buyamounta <= 1) or ($ppt~buyamountb <= 1))
	setvar $ppt~sector $ppt~sectora
	setvar $ppt~aborted 1
	return
end

if (($ppt~sectora <> stardock) and ($ppt~sectora > 10))
	if ($ppt~dropfigs = 1)
		send $move~extrasend
	end
	send "jy"
	setvar $ppt~onhand "None"
end

setvar $ppt~firstrun 1

:ppt_porta
send "pt"
if ($batch)
	if ($ppt~onhand <> "None")
		send "**"
	end
	if (($ppt~sellamounta <= 0) or ($ppt~buyamountb <= 0))
		if (port.class[$ppt~sectora] < 8)
			send "0*"
		end
		if (port.class[$ppt~sectora] > 3)
			send "0*"
		end
	else
		if (port.buyfuel[$ppt~sectora] = 0)
			if ($ppt~proda = "Fuel")
				send "**"
			else
				send "0*"
			end
		end
		if (port.buyorg[$ppt~sectora] = 0)
			if ($ppt~proda = "Organics")
				send "**"
			else
				send "0*"
			end
		end
		if (port.buyequip[$ppt~sectora] = 0)
			if ($ppt~proda = "Equipment")
				send "**"
			else
				send "0*"
			end
		end

		setvar $ppt~onhand $ppt~proda
	end

	if ($ppt~clock > 0)
		waitfor "<Port>"
		waitfor "Command [TL="
		subtract $ppt~clock 1
	end
else
	if (($ppt~sellamounta <= 0) or ($ppt~buyamountb <= 0))
		setvar $haggle~buyprod "none"
	else
		setvar $haggle~buyprod $ppt~proda
	end
	setvar $haggle~sector $ppt~sectora
	gosub :haggle~haggle
	setvar $ppt~credits $haggle~credits
	if ($haggle~abort = 1)
		goto :ppt_porta
	end
end
subtract $ppt~buyamounta 1
subtract $ppt~sellamounta 1

if (($ppt~sellamounta <= "-1") or ($ppt~buyamountb <= "-1"))
	setvar $ppt~sector $ppt~sectora
	if (($batch) and $ppt~displayoff)
		send "cn 9 qq"
	end
	return
end

getdistance $ppt~distance $ppt~sectora $ppt~sectorb
if ($ppt~distance <> 1)
	setvar $ppt~sector $ppt~sectora
	setvar $ppt~aborted 1
	return
end

if (($ppt~sectorb < 600) or (sectors > 5000))
	send $ppt~sectorb "*"
else
	send $ppt~sectorb
end

if ($ppt~firstrun = 1)
	setvar $ppt~firstrun 0

	if ($batch)
		setvar $ppt~displayoff 1
		send "cn 9 qq"
	end

	if (($ppt~sectorb <> stardock) and (($ppt~sectorb > 10) and ($ppt~dropfigs = 1)))
		send "f1*ct"
	end

	waiton "Warping to Sector "&$ppt~sectorb
	waiton "Command [TL="

	getdistance $ppt~distance $ppt~sectorb $ppt~sectora
	if ($ppt~distance = 1)
		goto :ppt_portb
	else
		if (($batch) and $ppt~displayoff)
			send "cn 9 qq"
		end

		setvar $ppt~oneway 1
		setvar $ppt~sector $ppt~sectorb

		if (($ppt~sectorb > 10) and ($ppt~sectorb <> stardock))
			send "jy"
		end
		return
	end
end

:ppt_portb
send "pt"

if ($batch)
	if ($ppt~onhand <> "None")
		send "**"
	end
	if (($ppt~sellamountb <= 0) or ($ppt~buyamounta <= 0))
		if (port.class[$ppt~sectorb] < 8)
			send "0*"
		end
		if (port.class[$ppt~sectorb] > 3)
			send "0*"
		end
	else
		if (port.buyfuel[$ppt~sectorb] = 0)
			if ($ppt~prodb = "Fuel")
				send "**"
			else
				send "0*"
			end
		end
		if (port.buyorg[$ppt~sectorb] = 0)
			if ($ppt~prodb = "Organics")
				send "**"
			else
				send "0*"
			end
		end
		if (port.buyequip[$ppt~sectorb] = 0)
			if ($ppt~prodb = "Equipment")
				send "**"
			else
				send "0*"
			end
		end
		setvar $ppt~onhand $ppt~prodb
	end
	if ($ppt~clock > 0)
		waitfor "<Port>"
		waitfor "Command [TL="
		subtract $ppt~clock 1
	end
else
	if (($ppt~sellamountb <= 0) or ($ppt~buyamounta <= 0))
		setvar $haggle~buyprod "none"
	else
		setvar $haggle~buyprod $ppt~prodb
	end
	setvar $haggle~sector $ppt~sectorb
	gosub :haggle~haggle
	setvar $ppt~credits $haggle~credits
	if ($haggle~abort = 1)
		goto :ppt_portb
	end
end

subtract $ppt~buyamountb 1
subtract $ppt~sellamountb 1

if (($ppt~sellamountb <= "-1") or ($ppt~buyamounta <= "-1"))
	if (($batch) and $ppt~displayoff)
		send "cn 9 qq"
	end

	setvar $ppt~sector $ppt~sectorb
	return
end

getdistance $ppt~distance $ppt~sectorb $ppt~sectora
if ($ppt~distance <> 1)
	setvar $ppt~sector $ppt~sectorb
	setvar $ppt~aborted 1
	return
end

if (($ppt~sectora < 600) or (sectors > 5000))
	send $ppt~sectora "*"
else
	send $ppt~sectora
end

goto :ppt_porta

:worldtrade
setvar $worldtrade~credits 0
setvar $worldtrade~checked 0

setvar $gameprefs~bank "WorldTrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

:worldtrade_start
if (($worldtrade~credits >= $worldtrade~quota) and ($worldtrade~quota > 0))
	return
end

if (($bot~bot_turn_limit > 0) and ($player~unlimitedgame <> true))
	gosub :player~quikstats
	if ($player~turns <= $bot~bot_turn_limit)
		setvar $switchboard~message "Turns too low to continue.*"
		gosub :switchboard~switchboard
		return
	end
end

setvar $move~checksub ":~movecheck"
gosub :move~move
goto :worldtrade_start

:movecheck
if ($worldtrade~checked)
	setvar $worldtrade~checked 0
elseif ((sector.figs.owner[$move~cursector] = "yours") or (sector.figs.owner[$move~cursector] = "belong to your Corp") or (sector.figs.quantity[$move~cursector] = 0))
	setvar $portcheck~sector $move~cursector
	setvar $portcheck~scanned 0
	setvar $portcheck~porttype 1
	gosub :portcheck
	setvar $move~noscan $portcheck~scanned

	if ($portcheck~pair > 0)
		setvar $ppt~sectora $move~cursector
		setvar $ppt~sectorb $portcheck~pair
		setvar $ppt~proda $portcheck~tradeproda
		setvar $ppt~prodb $portcheck~tradeprodb
		gosub :ppt

		if ($ppt~aborted = 0)
			if ($batch)
				gosub :player~quikstats
				setvar $worldtrade~credits $player~credits
			else
				setvar $worldtrade~credits $haggle~credits
			end

			setvar $move~found 1
		end

		setvar $worldtrade~checked 1
	end
end
return

:portcheck
setvar $portcheck~pair 0
setvar $portcheck~figged 0

if ($portcheck~porttype = 1)
	if ((port.class[$portcheck~sector] < 1) or (port.class[$portcheck~sector] > 8))
		setvar $portcheck~ignore 0
		return
	end
else
	if (port.buyequip[$portcheck~sector] = 0)
		setvar $portcheck~ignore 0
		return
	end
end

if ($portcheck~scanned = 0)
	send "sd"
	waiton "Relative Density Scan"
	waiton "Command [TL="
	setvar $portcheck~scanned 1
end

if ($portcheck~scanned = 1)
	setvar $portcheck~holoscan 0
	setvar $portcheck~i 1
	getsector $portcheck~sector $portcheck~sectorinfo

	while ($portcheck~i <= $portcheck~sectorinfo.warps)
		setvar $portcheck~sect $portcheck~sectorinfo.warp[$portcheck~i]

		if ((port.class[$portcheck~sect] > 0) or (sector.density[$portcheck~sect] >= 100))
			setvar $portcheck~holoscan 1
		end

		add $portcheck~i 1
	end

	if ($portcheck~holoscan)
		send "sh"
		waiton "Long Range Scan"
		waiton "Command [TL="
		setvar $portcheck~scanned 2
	end
end

if ($portcheck~scanned = 2)
	setvar $portcheck~i 1
	setvar $portcheck~class port.class[$portcheck~sector]
	setvar $portcheck~tradeproda ""
	setvar $portcheck~tradeprodb ""
	getsector $portcheck~sector $portcheck~sectorinfo

	while (($portcheck~i <= $portcheck~sectorinfo.warps) and ($portcheck~tradeproda = ""))
		setvar $portcheck~sect $portcheck~sectorinfo.warp[$portcheck~i]
		setvar $portcheck~pairclass port.class[$portcheck~sect]
		if ($portcheck~sect = $portcheck~sector)
			setvar $portcheck~pairclass 0
		end

		if (($portcheck~pairclass > 0) and ((($portcheck~pairclass < 9) and ((((sector.figs.quantity[$portcheck~sect] = 0) or (sector.figs.owner[$portcheck~sect] = "yours") or (sector.figs.owner[$portcheck~sect] = "belong to your Corp") or ((($portcheck~danger = 1) and (sector.figs.owner[$portcheck~sect] <> "Rogue Mercenaries")) and (sector.figs.quantity[$portcheck~sect] <= 20)) or ($portcheck~danger = 2)) and ((((sector.mines.quantity[$portcheck~sect] = 0) or (sector.mines.owner[$portcheck~sect] = "yours") or (sector.mines.owner[$portcheck~sect] = "belong to your Corp") or (($portcheck~danger = 1) and (sector.mines.quantity[$portcheck~sect] <= 5)) or ($portcheck~danger = 2)) and ((((sector.navhaz[$portcheck~sect] = 0) or ((sector.navhaz[$portcheck~sect] <= 3) and ($portcheck~danger = 1)) or ($portcheck~danger = 2)) and ((((sector.planetcount[$portcheck~sect] = 0) or ($portcheck~danger = 2)) and ((sector.tradercount[$portcheck~sect] = 0) or ($portcheck~danger = 2)))))))))))))
			if ($portcheck~porttype = 1)
				gosub :pptcheck
			else
				if (port.buyequip[$portcheck~sect])
					setvar $portcheck~tradeproda "Equipment"
				end
			end
		end

		if ($portcheck~tradeproda <> "")
			subtract $portcheck~ignore 1

			if ($portcheck~ignore >= 0)
				setvar $portcheck~tradeproda ""
				setvar $portcheck~tradeprodb ""
			else
				setvar $portcheck~pair $portcheck~sect
			end
		end

		add $portcheck~i 1
	end
end

setvar $portcheck~ignore 0
return

:pptcheck
if (($portcheck~class = 1) and ($portcheck~pairclass = 2))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 1) and ($portcheck~pairclass = 3))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 1) and ($portcheck~pairclass = 4))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 2) and ($portcheck~pairclass = 1))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 2) and (($portcheck~pairclass = 3) and $portcheck~fuelorganics))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 2) and ($portcheck~pairclass = 5))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 3) and ($portcheck~pairclass = 1))
	setvar $portcheck~tradeproda "Fuel"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 3) and (($portcheck~pairclass = 2) and $portcheck~fuelorganics))
	setvar $portcheck~tradeproda "Fuel"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 3) and ($portcheck~pairclass = 6))
	setvar $portcheck~tradeproda "Fuel"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 1))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 5))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 6))
	setvar $portcheck~tradeproda "Fuel"
	setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 5) and ($portcheck~pairclass = 2))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 5) and ($portcheck~pairclass = 4))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 5) and (($portcheck~pairclass = 6) and $portcheck~fuelorganics))
	setvar $portcheck~tradeproda "Fuel"
	setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 6) and ($portcheck~pairclass = 3))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 6) and ($portcheck~pairclass = 4))
	setvar $portcheck~tradeproda "Equipment"
	setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 6) and (($portcheck~pairclass = 5) and $portcheck~fuelorganics))
	setvar $portcheck~tradeproda "Organics"
	setvar $portcheck~tradeprodb "Fuel"
end
return

# includes:
include "source\include\gameprefs"
include "source\include\player"
include "source\include\move"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
include "source\include\switchboard.ts"
