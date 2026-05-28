logging off

gosub :loadvars~loadvars
gosub :help~initialize
loadvar $map~stardock
loadvar $map~home_sector
loadvar $ship~cap_file
loadvar $game~internalaliens
loadvar $game~internalferrengi
loadvar $game~limpet_cost
loadvar $game~limpet_removal_cost
loadvar $game~armid_cost
loadvar $game~photon_cost
loadvar $game~disruptor_cost

setvar $help~help[1] $help~tab&"Searches database sectors by port, MCIC, figs, and warp count."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  list {port type} {mcic} {pair} {figged} {warp filter}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"Arguments:"
setvar $help~help[6] $help~tab&"   {port type}   sbb/bbs/xxx/xbb/xxb/etc. B buys, S sells, X is any."
setvar $help~help[7] $help~tab&"        {mcic}   positive or negative MCIC threshold."
setvar $help~help[8] $help~tab&"        {pair}   require a matching paired adjacent port."
setvar $help~help[9] $help~tab&"      {figged}   include figged sectors instead of unfigged sectors."
setvar $help~help[10] $help~tab&" {warp filter}   deadend, 2way, 3way, 4way, 5way, 6way, or 7way."
gosub :help~helpfile

setvar $switchboard~message "Lister starting up!*"
gosub :switchboard~switchboard

setvar $line $bot~user_command_line

################################################
## Strip out all parameters from command line ##
################################################

##Check for port type first - default is xxx

setvar $buy_fuel "both"
setvar $buy_org "both"
setvar $buy_equip "both"

setvar $i 1
setvar $isfound false
while (($i <= 70) and ($isfound <> true))
	getwordpos " "&$line&" " $pos " "&$i&" "
	if ($pos > 0)
		setvar $find_mcic_value $i
		setvar $isfound true
		setvar $find_port true
		setvar $find_good_mcic true
	end
	add $i 1
end

setvar $i 1
while (($i <= 70) and ($isfound <> true))
	getwordpos " "&$line&" " $pos " -"&$i&" "
	if ($pos > 0)
		setvar $find_mcic_value $i
		setvar $isfound true
		setvar $find_port true
		setvar $find_good_mcic true
	end
	add $i 1
end

getwordpos $line $pos "sss"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_org false
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "bss"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_org false
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "bbs"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_org true
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "bbb"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_org true
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "bsb"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_org false
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "sbs"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_org true
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "ssb"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_org false
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "sbb"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_org true
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "xbb"
if ($pos > 0)
	setvar $buy_org true
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "xxb"
if ($pos > 0)
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "xss"
if ($pos > 0)
	setvar $buy_org false
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "xxs"
if ($pos > 0)
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "bxb"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "bxx"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $find_port true
end
getwordpos $line $pos "bxs"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "sxs"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "xxs"
if ($pos > 0)
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "sxb"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_equip true
	setvar $find_port true
end
getwordpos $line $pos "sxs"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_equip false
	setvar $find_port true
end
getwordpos $line $pos "xxx"
if ($pos > 0)
	setvar $find_port true
end
getwordpos $line $pos "ssx"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $buy_org false
	setvar $find_port true
end
getwordpos $line $pos "sxx"
if ($pos > 0)
	setvar $buy_fuel false
	setvar $find_port true
end
getwordpos $line $pos "bbx"
if ($pos > 0)
	setvar $buy_fuel true
	setvar $buy_org true
	setvar $find_port true
end

getwordpos $line $pos "deadend"
if ($pos > 0)
	setvar $deadend true
end

getwordpos $line $pos "2way"
if ($pos > 0)
	setvar $2way true
end
getwordpos $line $pos "3way"
if ($pos > 0)
	setvar $3way true
end
getwordpos $line $pos "4way"
if ($pos > 0)
	setvar $4way true
end
getwordpos $line $pos "5way"
if ($pos > 0)
	setvar $5way true
end
getwordpos $line $pos "6way"
if ($pos > 0)
	setvar $6way true
end
getwordpos $line $pos "7way"
if ($pos > 0)
	setvar $7way true
end

getwordpos $line $pos "mcic"
if ($pos > 0)
	setvar $find_good_mcic true
	setvar $find_port true
end

getwordpos $line $pos "pair"
if ($pos > 0)
	setvar $find_port_pairs true
	setvar $find_port true
else
	setvar $find_port_pairs false
end

getwordpos $line $pos "figged"
if ($pos > 0)
	setvar $find_figged_sectors true
else
	setvar $find_figged_sectors false
end

setarray $results sectors 1 1 1
setvar $result_count 0

setvar $i 1
while ($i <= sectors)
	getsectorparameter $i "FIGSEC" $isfigged
	getsectorparameter $i "EQUIPMENT+" $mcic
	setsectorparameter $i "TARGET" ""
	if ((($find_figged_sectors = true) and ($isfigged = true)) or (($find_figged_sectors = false) and ($isfigged <> true)))
		if (($find_port = true) and (port.exists[$i] = true))
			if (((($buy_fuel = "both") or ($buy_fuel = true)) and port.buyfuel[$i] = true) or ((($buy_fuel = "both") or ($buy_fuel = false)) and port.buyfuel[$i] = false))
				if (((($buy_org = "both") or ($buy_org = true)) and port.buyorg[$i] = true) or ((($buy_org = "both") or ($buy_org = false)) and port.buyorg[$i] = false))
					if (((($buy_equip = "both") or ($buy_equip = true)) and port.buyequip[$i] = true) or ((($buy_equip = "both") or ($buy_equip = false)) and port.buyequip[$i] = false))
						if ($find_good_mcic = true)
							//check for mcic
							if ($mcic <> "")
								getwordpos $mcic $pos "-"
								getwordpos $find_mcic_value $pos2 "-"
								if (($pos > 0) and ($pos2 > 0))
									setvar $absolute_mcic $mcic
									striptext $absolute_mcic "-"
									setvar $absolute_find_mcic_value $find_mcic_value
									striptext $absolute_find_mcic_value "-"
									if ($absolute_mcic >= $absolute_find_mcic_value)
										goto :skip_sector
									end
								elseif ((($pos > 0) and ($pos2 <= 0)) or (($pos <= 0) and ($pos2 > 0)))
									goto :skip_sector
								else
									if ($mcic >= $find_mcic_value)
										goto :skip_sector
									end

								end
							else
								goto :skip_sector
							end
						end
						if ($find_port_pairs = true)
							//check for port pairs
							if (port.buyfuel[$i] = true)
								setvar $buy_fuel true
							else
								setvar $buy_fuel false
							end
							if (port.buyequip[$i] = true)
								setvar $buy_equip true
							else
								setvar $buy_equip false
							end
							if (port.buyorg[$i] = true)
								setvar $buy_org true
							else
								setvar $buy_org false
							end
							setvar $j 1
							setvar $found_port_pair 0
							setvar $isfound false
							while ((sector.warpsin[$i][$j] > 0) and ($isfound = false))
								setvar $test_sector sector.warpsin[$i][$j]
								if (port.exists[$test_sector] = true)
									if ((((port.buyorg[$test_sector] <> $buy_org) and (port.buyequip[$test_sector] <> $buy_equip)) and ($buy_org <> $buy_equip)) or (((port.buyfuel[$test_sector] <> $buy_fuel) and (port.buyequip[$test_sector] <> $buy_equip)) and ($buy_fuel <> $buy_equip)) or (((port.buyfuel[$test_sector] <> $buy_fuel) and (port.buyorg[$test_sector] <> $buy_org)) and ($buy_org <> $buy_fuel)))
										getdistance $distance $test_sector $i
										if ($distance <= 0)
											send "^f"&currentsector&"*"&$results[$i]&"*q"
											waiton "ENDINTERROG"
											getdistance $distance currentsector $results[$i]
										end
										if ($distance = 1)
											setvar $found_port_pair $test_sector
											setvar $isfound true
										end
									end
								end
								add $j 1
							end
							if ($isfound = false)
								goto :skip_sector
							end
						end
					else
						goto :skip_sector
					end
				else
					goto :skip_sector
				end
			else
				goto :skip_sector
			end
		else
			goto :skip_sector
		end
		if ($deadend = true)
			getsectorparameter $i "DEADEND" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($2way = true)
			getsectorparameter $i "2WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($3way = true)
			getsectorparameter $i "3WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($4way = true)
			getsectorparameter $i "4WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($5way = true)
			getsectorparameter $i "5WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($6way = true)
			getsectorparameter $i "6WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
		if ($7way = true)
			getsectorparameter $i "7WAY" $iscorrect
			if ($iscorrect <> true)
				goto :skip_sector
			end
		end
	else
		goto :skip_sector
	end

	#If it makes it through all the filtering, add it to the results to display
	add $result_count 1
	setvar $results[$result_count] $i
	setvar $results[$result_count][1][1] $found_port_pair
	setsectorparameter $i "TARGET" true

	:skip_sector
	add $i 1
end

:displaying_results
echo "Found "&$result_count&" results.*"
//calculating distance from current sector
setvar $i 1
while ($i <= $result_count)
	getdistance $distance currentsector $results[$i]
	if ($distance <= 0)
		send "^f"&currentsector&"*"&$results[$i]&"*q"
		waiton "ENDINTERROG"
		getdistance $distance currentsector $results[$i]
	end
	setvar $results[$i][1] $distance
	add $i 1
end

//sorting results based on distance
setarray $sorted_results $result_count 1 1
setvar $i 1
setvar $sorted_result_count 0
while ($i <= $result_count)
	setvar $biggest_distance 0
	setvar $j 1
	while ($j <= $result_count)
		setvar $test_distance $results[$j][1]
		if ($test_distance > $biggest_distance)
			setvar $biggest_distance $test_distance
			setvar $biggest_index $j
		end
		add $j 1
	end
	if ($biggest_distance > 0)
		add $sorted_result_count 1
		setvar $sorted_results[$sorted_result_count] $results[$biggest_index]
		setvar $sorted_results[$sorted_result_count][1] $results[$biggest_index][1]
		setvar $sorted_results[$sorted_result_count][1][1] $results[$biggest_index][1][1]
		setvar $results[$biggest_index][1] 0
	else
		goto :done_sorting
	end
	add $i 1
end

:done_sorting
setvar $i 1
setvar $switchboard~message "  *"
while ($i <= $sorted_result_count)
	setvar $result_sector $sorted_results[$i]
	gosub :get_port_status
	gosub :get_fighter_status

	if ($switchboard~self_command <> true)
		setvar $switchboard~self_command 2
	end
	if (($sorted_results[$i][1] <> "") and ($sorted_results[$i][1] <> "0"))
		#echo "*"&"Sector: "&$sorted_results[$i]&" ("&$sorted_results[$i][1]&" sectors away) Figged: "&$fighter_status&" Port: "&$port&" MCIC:"&$mcic&"*"
		setvar $switchboard~message $switchboard~message&"Sector: "&$sorted_results[$i]&" ("&$sorted_results[$i][1]&" sectors away) Figged: "&$fighter_status&", Port: "&$port&" MCIC: "&$mcic&"*"
		if ($find_port_pairs = true)
			setvar $port_pair $sorted_results[$i][1][1]
			if ($port_pair > 0)
				getsectorparameter $port_pair "FIGSEC" $isfigged
				gosub :get_fighter_status
				setvar $result_sector $port_pair
				gosub :get_port_status
				setvar $switchboard~message $switchboard~message&"   Port Pair --> Sector: "&$port_pair&" Figged: "&$fighter_status&", Port: "&$port&" MCIC: "&$mcic&"*"
			end
		end
	end
	add $i 1
end
gosub :switchboard~switchboard
halt

:killtriggers
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
killtrigger 5
killtrigger 6
killtrigger 7
killtrigger 8
killtrigger 9
killtrigger 10
killtrigger 11
return

:get_fighter_status
if ($isfigged)
	setvar $fighter_status "Yes"
else
	setvar $fighter_status "No"
end
return

:get_port_status
getsectorparameter $result_sector "EQUIPMENT+" $mcic
getsectorparameter $result_sector "EQUIPMENT-" $mcic_low
if ($mcic <> "")
	if ($mcic <> $mcic_low)
		setvar $mcic $mcic&" ("&$mcic_low&")"
	end
else
	setvar $mcic "N/A"
end
getsectorparameter $result_sector "FIGSEC" $isfigged
if (port.exists[$result_sector])
	if (port.buyfuel[$result_sector])
		setvar $port "B"
	else
		setvar $port "S"
	end
	if (port.buyorg[$result_sector])
		setvar $port $port&"B"
	else
		setvar $port $port&"S"
	end
	if (port.buyequip[$result_sector])
		setvar $port $port&"B"
	else
		setvar $port $port&"S"
	end
else
	setvar $port "N/A"
end
return

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard"
