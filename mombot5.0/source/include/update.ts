#============================= REFRESH FIGHTER SUBROUTINE =======================================
:update~fighters
setvar $switchboard~message "Loading current fighter locations. . .*"
gosub :switchboard~switchboard
getSectorParameter 2 "FIG_COUNTR" $previousCount
getSectorParameter 2 "FUEL_COUNT" $previousFuelCount
getSectorParameter 2 "ORG_COUNT" $previousOrgCount
getSectorParameter 2 "EQU_COUNT" $previousEquipCount
getSectorParameter 2 "EQS_COUNT" $previousEquipSellCount
getSectorParameter 2 "FB_COUNT" $previousFuelBuyCount

if ($previousCount = "")
	setVar $previousCount 0
end
if ($previousFuelCount = "")
	setVar $previousFuelCount 0
end
if ($previousOrgCount = "")
	setVar $previousOrgCount 0
end
if ($previousEquipCount = "")
	setVar $previousEquipCount 0
end
if ($previousEquipSellCount = "")
	setVar $previousEquipSellCount 0
end
if ($previousFuelBuyCount = "")
	setVar $previousFuelBuyCount 0
end

	:readFighterList
	setVar $count 0
	setVar $personalCount 0
	setVar $1sCount 0
	setVar $2sCount 0
	setVar $3sCount 0
	setVar $4sCount 0
	setVar $5sCount 0
	setVar $6sCount 0
	setVar $?sCount 0
	setVar $tollCount 0
	setVar $offCount 0
	setVar $defCount 0
	setVar $fuelCount 0
	setVar $orgCount 0
	setVar $equipCount 0
	setVar $equipSellCount 0
	setVar $upgradedEquipCount 0
	setVar $upgradedEquipSellCount 0
	setVar $upgradedFuelBuyCount 0
	setVar $upgradedOrgCount 0
	setVar $upgradedFuelCount 0

	send "g"
	setVar $i 1
	setVar $personalOutput " "
	setVar $output " "
	setVar $ckoutput " "
	:keepCounting
	setTextLineTrigger corporate 		:corpCount 	" Corp"
	setTextLineTrigger personal 		:personalCount	"Personal "
	setTextLineTrigger doneCountingFigs	:doneCounting 	"Total"
	setTextLineTrigger doneNoFigs 		:doneCounting 	"No fighters deployed"
	pause
	:personalCount
	add $count 1
	add $personalCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $type 4
	setVar $personalOutput $personalOutput&" "&$sector&"  "
	setTextLineTrigger personal 		:personalCount	"Personal "
	pause

	:corpCount
	add $count 1
	add $player~corpCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $type 4
	if ($type = "Toll")
		add $tollCount 1
	elseif ($type = "Offensive")
		add $offCount 1
	elseif ($Type = "Defensive")
		add $defCount 1
	end
	while ($i <= $sector)
		getWordPos $personalOutput $pos " "&$i&" "
		if (($sector = $i) OR ($pos > 0))
			setVar $output $output&$i&"*"
			setVar $ckoutput $ckoutput&$i&"  "
			setSectorParameter $i "FIGSEC" TRUE
			if ((PORT.EXISTS[$i] = TRUE))
				setVar $currentEquip (PORT.Equip[$i]*100)
				if (port.percentEquip[$i] <> 0)
					divide $currentEquip port.percentEquip[$i]
				end
				if (PORT.BUYEQUIP[$i] = FALSE)
					if ($currentEquip > 10000)
						add $upgradedEquipSellCount 1
					end
				else
					if ($currentEquip > 10000)
						add $upgradedEquipCount 1
					end
				end
				if (PORT.BUYORG[$i] = TRUE)
					setVar $currentOrg (PORT.Org[$i]*100)
					if (port.percentOrg[$i] <> 0)
						divide $currentOrg port.percentOrg[$i]
					end
					if ($currentOrg > 10000)
						add $upgradedOrgCount 1
					end
				end
				if (PORT.BUYFUEL[$i] = FALSE)
					setVar $currentFuel (PORT.Fuel[$i]*100)
					if (port.percentFuel[$i] <> 0)
						divide $currentFuel port.percentFuel[$i]
					end
					if ($currentFuel > 10000)
						add $upgradedFuelCount 1
					end
				else
					setVar $currentFuel (PORT.Fuel[$i]*100)
					if (port.percentFuel[$i] <> 0)
						divide $currentFuel port.percentFuel[$i]
					end
					if ($currentFuel > 10000)
						add $upgradedFuelBuyCount 1
					end

				end
			end
			setVar $tempWarpCount SECTOR.WARPINCOUNT[$i]
			setVar $tempWarpCountOut SECTOR.WARPCOUNT[$i]
			if ($tempWarpCount > 0) and ($tempWarpCountOut > 0)
				if ($tempWarpCount = 1)
					add $1sCount 1
				elseif ($tempWarpCount = 2)
					add $2sCount 1
				elseif ($tempWarpCount = 3)
					add $3sCount 1
				elseif ($tempWarpCount = 4)
					add $4sCount 1
				elseif ($tempWarpCount = 5)
					add $5sCount 1
				elseif ($tempWarpCount = 6)
					add $6sCount 1
				end
			else
				add $?scount 1
			end

		else
			setVar $output $output&"0*"
			setVar $ckoutput $ckoutput&"0  "
			setSectorParameter $i "FIGSEC" FALSE
		end
		add $i 1
	end
	setTextLineTrigger corporate 		:corpCount 	" Corp"
	pause		

	:doneCounting
	killalltriggers
	while ($i <= SECTORS)
		getWordPos $personalOutput $pos " "&$i&" "
		if ($pos > 0)
			setVar $ckoutput $ckoutput&$i&"  "
			setVar $output $output&$i&"*"
			setSectorParameter $i "FIGSEC" TRUE
		else
			setVar $ckoutput $ckoutput&"0  "
			setVar $output $output&"0*"
			setSectorParameter $i "FIGSEC" FALSE
		end
		add $i 1
	end

	setSectorParameter 2 "FIG_COUNT" $count
	setSectorParameter 2 "FIG_COUNTR" $count
	setSectorParameter 2 "FUEL_COUNT" $upgradedFuelCount
	setSectorParameter 2 "ORG_COUNT" $upgradedOrgCount
	setSectorParameter 2 "EQU_COUNT" $upgradedEquipCount
	setSectorParameter 2 "EQS_COUNT" $upgradedEquipSellCount
	setSectorParameter 2 "FB_COUNT" $upgradedFuelBuyCount

return
# ============================== END REFRESH FIGHTERS (FIGS) SUB ==============================

:update~report
if ($count <> 0)
	setVar $percent  (($count * 100) / SECTORS)
	setVar $1percent (($1scount * 100) / $count)
	setVar $2percent (($2scount * 100) / $count)
	setVar $3percent (($3scount * 100) / $count)
	setVar $4percent (($4scount * 100) / $count)
	setVar $5percent (($5scount * 100) / $count)
	setVar $6percent (($6scount * 100) / $count)
	setVar $?percent (($?scount * 100) / $count)
end
setVar $gridChange $count-$previousCount
if ($gridChange > 0)
	setVar $gridChange "+"&$gridChange
end
setVar $gridFuelChange $upgradedFuelCount-$previousFuelCount
if ($gridFuelChange > 0)
	setVar $gridFuelChange "+"&$gridFuelChange
end
setVar $gridOrgChange $upgradedOrgCount-$previousOrgCount
if ($gridOrgChange > 0)
	setVar $gridOrgChange "+"&$gridOrgChange
end
setVar $gridEquipChange $upgradedEquipCount-$previousEquipCount
if ($gridEquipChange > 0)
	setVar $gridEquipChange "+"&$gridEquipChange
end
setVar $gridEquipSellChange $upgradedEquipSellCount-$previousEquipSellCount
if ($gridEquipSellChange > 0)
	setVar $gridEquipSellChange "+"&$gridEquipSellChange
end
setVar $gridFuelBuyChange $upgradedFuelBuyCount-$previousFuelBuyCount
if ($gridFuelBuyChange > 0)
	setVar $gridFuelBuyChange "+"&$gridFuelBuyChange
end

setVar $inputVariable $1scount
gosub :player~formatNumberForSpaces
setVar $1scountformatted $outputVariable
setVar $inputVariable $2scount
gosub :player~formatNumberForSpaces
setVar $2scountformatted $outputVariable
setVar $inputVariable $3scount
gosub :player~formatNumberForSpaces
setVar $3scountformatted $outputVariable
setVar $inputVariable $4scount
gosub :player~formatNumberForSpaces
setVar $4scountformatted $outputVariable
setVar $inputVariable $5scount
gosub :player~formatNumberForSpaces
setVar $5scountformatted $outputVariable
setVar $inputVariable $6scount
gosub :player~formatNumberForSpaces
setVar $6scountformatted $outputVariable

setVar $inputVariable $1percent
gosub :player~formatPercentagesForSpaces
setVar $1percentformatted $outputVariable
setVar $inputVariable $2percent
gosub :player~formatPercentagesForSpaces
setVar $2percentformatted $outputVariable
setVar $inputVariable $3percent
gosub :player~formatPercentagesForSpaces
setVar $3percentformatted $outputVariable
setVar $inputVariable $4percent
gosub :player~formatPercentagesForSpaces
setVar $4percentformatted $outputVariable
setVar $inputVariable $5percent
gosub :player~formatPercentagesForSpaces
setVar $5percentformatted $outputVariable
setVar $inputVariable $6percent
gosub :player~formatPercentagesForSpaces
setVar $6percentformatted $outputVariable

setvar $switchboard~message $switchboard~message&"          - Fighter Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)*          - T: "&$tollCount&"  O: "&$offCount&"  D:"&$defCount&"*          - DE: "&$1sCountformatted&""&$1percentformatted&" 2S: "&$2sCountformatted&""&$2percentformatted&" 3S: "&$3sCountformatted&""&$3percentformatted&"*          - 4S: "&$4sCountformatted&""&$4percentformatted&" 5S: "&$5sCountformatted&""&$5percentformatted&" 6S: "&$6sCountformatted&""&$6percentformatted&"*          - Upgraded Sxx: "&$upgradedFuelCount&" ("&$gridFuelChange&" Change)*          - Upgraded xBx: "&$upgradedOrgCount&" ("&$gridOrgChange&" Change)*          - Upgraded xxB: "&$upgradedEquipCount&" ("&$gridEquipChange&" Change)*          - Upgraded xxS: "&$upgradedEquipSellCount&" ("&$gridEquipSellChange&" Change)*          - Upgraded Bxx: "&$upgradedFuelBuyCount&" ("&$gridFuelBuyChange&" Change)**"

return

:update~cim
loadVar $PLAYER~unlimitedGame
loadvar $GAME~ptradesetting
loadvar $bot~bot_turn_limit
loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $bot~MCIC_FILE

gosub :player~quikstats
setVar $startingLocation $player~current_prompt
isNumber $test $bot~parm1
if ($test)
	if ($bot~parm1 > 0)
		setVar $upgradeLimit $bot~parm1
	else
		setVar $upgradeLimit 10000
	end
else
	setVar $upgradeLimit 10000
end
setvar $switchboard~message "Stand By - CIMMING . . .*"
gosub :switchboard~switchboard
if (($bot~parm1 = "warps") OR ($bot~parm1 = "warp"))
	send "^iq"
	setvar $switchboard~message "Warp Data CIM Complete*"
	gosub :switchboard~switchboard
	return
else
	send "^rq"
end
waitFor ": ENDINTERROG"
setArray $mcic SECTORS
:mcic_looper
fileExists $mcic_ck $bot~mcic_file
if ($mcic_ck = 0)
	goto :done_mcic_read
end
	setVar $mcic_sec 0
	setVar $mcic_count 1

:mcic_read_loop
read $bot~mcic_file $mcicline $mcic_count
if ($mcicline = EOF)
	goto :done_mcic_read
end
if ($mcicline = "")
	add $mcic_count 1
	goto :mcic_read_loop
end
getWord $mcicline $mcic_word1 1
if ($mcic_word1 = "Sector")
	getWord $mcicline $mcic_sec 2
	add $mcic_count 1
	goto :mcic_read_loop
end
if ($mcic_sec <= 0)
	add $mcic_count 1
	goto :mcic_read_loop
end
getWord $mcicline $mcic_product 2
getWord $mcicline $mcic_line_ck 5
if ($mcic_line_ck = "cr")
	getWord $mcicline $actual_mcic 13
	stripText $actual_mcic "/-65"
	if ($actual_mcic = "-65") or  ($actual_mcic = "-64") or  ($actual_mcic = "-63") or  ($actual_mcic = "-62") or  ($actual_mcic = "-61") or  ($actual_mcic = "-60")
		setVar $mcic[$mcic_sec] $actual_mcic
		if ($mcic_product = "ore")
			setSectorParameter $mcic_sec "OREMCIC" $actual_mcic
		elseif ($mcic_product = "org")
			setSectorParameter $mcic_sec "ORGMCIC" $actual_mcic
		elseif ($mcic_product = "equ")
			setSectorParameter $mcic_sec "EQUMCIC" $actual_mcic
		end
	end
end
if ($mcic_product = "ore") or ($mcic_product = "org") or ($mcic_product = "equ")
	add $mcic_count 1
else
	add $mcic_count 1
end
goto :mcic_read_loop

:done_mcic_read
setVar $cim_count 1

:cim_looper
setVar $sectiona SECTORS
divide $sectiona 78
setVar $echo_count 1	
setVar $upped "  "
setvar $switchboard~message  "Processing CIM...*"
gosub :switchboard~switchboard
gosub :player~quikstats
While ($cim_count <= SECTORS)
	if (port.exists[$cim_count] = 1)
		setVar $isUpped FALSE
		setVar $currentfuel PORT.FUEL[$cim_count]
		multiply $currentfuel 100
		if (port.percentfuel[$cim_count] <> 0)
			divide $currentfuel port.percentfuel[$cim_count]
		end
		if ($currentfuel > $upgradeLimit)
			setVar $isUpped TRUE
		end
		setVar $currentorg port.org[$cim_count]
		multiply $currentorg 100
		if (port.percentorg[$cim_count] <> 0)
			divide $currentorg port.percentorg[$cim_count]
		end
		if ($currentorg > $upgradeLimit)
			setVar $isUpped TRUE
		end
		setVar $currentEquip port.equip[$cim_count]
		multiply $currentEquip 100
		if (port.percentequip[$cim_count] <> 0)
			divide $currentEquip port.percentequip[$cim_count]
		end
		if ($currentEquip > $upgradeLimit)
			setVar $isUpped TRUE
		end
		if ($isUpped = TRUE)
			setVar $upped $upped&" "&$cim_count&" " 
		end
	end
	add $cim_count 1
	if ($echo_count = $sectiona)
		echo ansi_13 #178
		setVar $echo_count 1
	else
		add $echo_count 1
	end
end

if ($startingLocation = "Command")
	send "tt"
elseif ($startingLocation = "Citadel")
	send "xt"
else 
	return
end
send "-----" $bot~bot_name "-----*"
send "Upped Ports: (At least "&$upgradeLimit&" product level)*"
setVar $cimout_count 1
while ($cimout_count <= SECTORS)
	getWordPos $upped $pos " "&$cimout_count&" "
	if ($pos > 0)
		setVar $cimTemp $cimout_count & "(" 
		
		if (PORT.BUYFUEL[$cimout_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		if (PORT.BUYORG[$cimout_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		if (PORT.BUYEQUIP[$cimout_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		setVar $cimTemp $cimTemp&") "
		send $cimTemp
	end
	add $cimout_count 1
end
send "***"
setVar $upped ""
if ($mcic_ck = 1)
	if ($startingLocation = "Command")
		send "tt"
	elseif ($startingLocation = "Citadel")
		send "xt"
	else
		return
	end
else
		return
	
end
send "Ports with MCIC at least -60/-65 :*"

:mcic_send_loop
setVar $mcic_send_count 1
while ($mcic_send_count <= SECTORS)
	if ($mcic[$mcic_send_count] <> 0)
		setVar $cimTemp $mcic_send_count & "(" 
		
		if (PORT.BUYFUEL[$mcic_send_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		if (PORT.BUYORG[$mcic_send_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		if (PORT.BUYEQUIP[$mcic_send_count] = 1)
			setVar $cimTemp $cimTemp&"B" 
		else
			setVar $cimTemp $cimTemp&"S" 
		end
		setVar $cimTemp $cimTemp&") "
		send $cimTemp & " MCIC = " & $mcic[$mcic_send_count] & "*"
	end
	add $mcic_send_count 1
end
send "***"
setvar $switchboard~message "CIM Processing Complete!*"
gosub :switchboard~switchboard
setArray $mcic 10
return

include "source\include\player"
