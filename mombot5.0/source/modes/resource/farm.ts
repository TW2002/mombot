gosub :loadvars~loadvars
loadvar $bot~bot_name
loadvar $farmsectors

gosub :help~initialize
setvar $help~help[1] $help~tab&"Visits sectors in list and farms the planets there."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage:  farm set {sector1} {sector2} {...}"
setvar $help~help[4] $help~tab&"  Usage:  farm list"
setvar $help~help[5] $help~tab&"  Usage:  farm clear"
setvar $help~help[6] $help~tab&"  Usage:  farm balance"
setvar $help~help[7] $help~tab&"  Usage:  farm fill {planets}/{all} {options}"
setvar $help~help[8] $help~tab&"  Usage:  farm "
setvar $help~help[9] $help~tab&"       "
setvar $help~help[10] $help~tab&"Examples:"
setvar $help~help[11] $help~tab&"       "
setvar $help~help[12] $help~tab&"  >farm set 1224 1925 3176     "
setvar $help~help[13] $help~tab&"  >farm     "
setvar $help~help[14] $help~tab&"  >farm fill 12 13 14     "
setvar $help~help[15] $help~tab&"  >farm fill all     "
setvar $help~help[16] $help~tab&"       "
setvar $help~help[17] $help~tab&"Modes:"
setvar $help~help[18] $help~tab&"       "
setvar $help~help[19] $help~tab&"   set - Adds sectors in the order entered into the farm set."
setvar $help~help[20] $help~tab&"   list - Lists all sectors in the farm set."
setvar $help~help[21] $help~tab&"   clear - Removes all sectors from the farm set."
setvar $help~help[22] $help~tab&"   balance - Attempts to balance colos on farm planets."
setvar $help~help[23] $help~tab&"      "
setvar $help~help[24] $help~tab&"   Running farm with no options attempts to farm all products."
setvar $help~help[25] $help~tab&"   If you specify one or more options, only those will be farmed."
setvar $help~help[26] $help~tab&"   Planet numbers or 'all' specify planets to be filled."
setvar $help~help[27] $help~tab&"       "
setvar $help~help[28] $help~tab&"       Product Options:"
setvar $help~help[29] $help~tab&"            {f}   - Farm fuel ore"
setvar $help~help[30] $help~tab&"            {o}   - Farm organics"
setvar $help~help[31] $help~tab&"            {e}   - Farm equipment"
setvar $help~help[32] $help~tab&"           {fc}   - Farm fuel ore colonists"
setvar $help~help[33] $help~tab&"           {oc}   - Farm organic colonists"
setvar $help~help[34] $help~tab&"           {ec}   - Farm equipment colonists"
setvar $help~help[35] $help~tab&"          {fig}   - Farm fighters"
setvar $help~help[36] $help~tab&"           {sh}   - Farm shields"
gosub :help~helpfile

getwordpos $bot~user_command_line $pos "silent"
if ($pos > 0)
	setvar $silent true
else
	setvar $silent false
end

getwordpos $bot~parm1 $pos "clear"
if ($pos > 0)
	setvar $farmsectors ""
	savevar $farmsectors
	setvar $switchboard~message "Bot Farming Configuration has been cleared.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~parm1 $pos "list"
if ($pos > 0)
	if ($farmsectors = "") or ($farmsectors = 0)
		setvar $switchboard~message "No sectors in farming list.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Farming List (In traveling order) *"&$farmsectors&"*"
		gosub :switchboard~switchboard
		halt
	end
end

getwordpos $bot~parm1 $pos "set"
if ($pos > 0)
	goto :farm_set
end

gosub :player~quikstats
setvar $startinglocation $player~current_sector
setvar $startingprompt $player~current_prompt

if ($player~current_prompt = "Citadel")
	send "q"
elseif ($player~current_prompt <> "Planet")
	setvar $switchboard~message "Planet Farmer must be run from on a planet.*"
	gosub :switchboard~switchboard
	halt
end
gosub :planet~getplanetinfo
setvar $startingplanet $planet~planet
send "q"
gosub :ship~getshipstats
send "l " & $startingplanet & "* c"

getwordpos $bot~parm1 $pos "balance"
if ($pos > 0)
	if ($farmsectors = "") or ($farmsectors = 0)
		setvar $switchboard~message "No sectors in farming list.*"
		gosub :switchboard~switchboard
		halt
	else
		goto :balanceplanets
	end
end

if ($farmsectors = "") or ($farmsectors = 0)
	setvar $switchboard~message "No Farming Configuration, Please specify list.*"
	gosub :switchboard~switchboard
	halt
end

setvar $prodstofarm false

getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $planet~emptyfuel true
	setvar $prodstofarm true
else
	setvar $planet~emptyfuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $planet~emptyorganics true
	setvar $prodstofarm true
else
	setvar $planet~emptyorganics false
end

getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $planet~emptyequipment true
	setvar $prodstofarm true
else
	setvar $planet~emptyequipment false
end

getwordpos " "&$bot~user_command_line&" " $pos " c1 "
getwordpos " "&$bot~user_command_line&" " $pos2 " fc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfuelcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyfuelcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c2 "
getwordpos " "&$bot~user_command_line&" " $pos2 " oc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyorgcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyorgcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c3 "
getwordpos " "&$bot~user_command_line&" " $pos2 " ec "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyequcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyequcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " fig "
getwordpos " "&$bot~user_command_line&" " $pos2 " figs "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfigs true
	setvar $prodstofarm true
	getwordpos " "&$bot~user_command_line&" " $pos " dump "
	if ($pos > 0)
		setvar $planet~dumpfigs true
	end
else
	setvar $planet~emptyfigs false
end

getwordpos " "&$bot~user_command_line&" " $pos " sh "
if ($pos > 0)
	setvar $planet~emptyshields true
	setvar $prodstofarm true
else
	setvar $planet~emptyshields false
end

if ($prodstofarm = false)
	setvar $planet~emptyfuel true
	setvar $planet~emptyorganics true
	setvar $planet~emptyequipment true
	setvar $planet~emptyfuelcolos false
	setvar $planet~emptyorgcolos false
	setvar $planet~emptyequcolos false
	setvar $planet~emptyfigs true
	setvar $planet~emptyshields false
	setvar $prodstofarm true
end

logging off

if ($player~planet_scanner = "No")
	setvar $switchboard~message "Planet Farmer must be run with a planet scanner.*"
	gosub :switchboard~switchboard
	halt
end

setarray $planetlist 200
setvar $planetlist_count 0

getword $bot~user_command_line $isfill 1
if ($isfill = "fill")
	getword $bot~user_command_line $check 2
	if ($check = "all")
		send "qqq*"
		gosub :planet~countplanets
		setvar $j 0
		while ($j < $planet~planetcount)
			add $j 1
			add $planetlist_count 1
			setvar $planetlist[$planetlist_count] $planet~planets[$j]
		end
		setvar $planet~planet $startingplanet
		gosub :planet~landonplanetentercitadel
	else
		setvar $i 2
		:planetlist_loop
		getword $bot~user_command_line $check $i
		if ($check <> "") and ($check > 0)
			add $planetlist_count 1
			setvar $planetlist[$planetlist_count] $check
			add $i 1
			goto :planetlist_loop
		end
	end
else
	setvar $planetlist[1] $startingplanet
	setvar $planetlist_count 1
end
:postplanetlist

gosub :loadfarmsectorlist

setvar $relog_nocitadel 1
savevar $relog_nocitadel
setvar $p 0
while ($p < $planetlist_count)
	add $p 1
	setvar $planet~planettofill $planetlist[$p]
	setvar $planet~skip_over_99 true
	send "qqq*"
	setvar $planet~planet $planet~planettofill
	setvar $planet~nocit true
	gosub :planet~landingsub
	if ($planet~successfulplanet = true)
		setvar $switchboard~message "Farm is filling planet " $planet~planettofill ".*"
		gosub :switchboard~switchboard
		gosub :farmplanet
	end
end
goto :endfarmer

:farmplanet
killalltriggers
setvar $farmplanetdone false
setvar $i 0

:tryagain
add $i 1
while ($i <= $farmlistcount)
	gosub :landstartingplanet
	send "c"
	setvar $planet~warpto $sector[$i]
	gosub :planet~pwarp
	if ($planet~pwarpsuccess = false)
		goto :tryagain
	end
	send "qqq**"

	gosub :planet~countplanets
	if ($planet~planetcount < 2)
		goto :tryagain
	end

	gosub :landstartingplanet

	setvar $dothissector false
	setvar $c 0
	:farmcountloop
	add $c 1
	while ($c <= $planet~planetcount)
		if ($planet~planets[$c] = $planet~planettofill)
			goto :farmcountloop
		end
		if ($planet~planets[$c][3] > ($ship~ship_fighters_max / 10))
			setvar $dothissector true
		end
		add $c 1
	end

	if ($dothissector = false)
		goto :tryagain
	end

	gosub :player~currentprompt
	if ($player~current_prompt = "Citadel")
		send "q"
	end
	send "mnl*"

	setvar $j 0
	:tryagain2
	add $j 1
	while ($j <= $planet~planetcount)
		setvar $planet~planettostrip $planet~planets[$j]
		:restrip
		if ($planet~planettostrip <> $planet~planettofill)
			gosub :planet~stripplanet
		end
		gosub :landstartingplanet
		gosub :checkfull
		if ($farmplanetdone = true)
			goto :finishfarmplanet
		end
		add $j 1
	end
	add $i 1
end

:finishfarmplanet
gosub :player~currentprompt
if ($player~current_prompt = "Command")
	setvar $planet~planet $planet~planettofill			
	gosub :planet~landonplanetentercitadel
	if ($planet~successfulplanet = false)
		goto :endfarmer
	end
	gosub :player~currentprompt
elseif ($player~current_prompt = "Planet")
	send "c"
end
send "p "&$startinglocation&"  *y"
return

:landstartingplanet
gosub :player~currentprompt
if ($player~current_prompt = "Command")
	setvar $planet~planet $planet~planettofill
	setvar $planet~nocit true
	gosub :planet~landingsub
elseif ($player~current_prompt = "Citadel")
	send "q"
elseif ($player~current_prompt <> "Planet")
	setvar $switchboard~message "Unknown Prompt: "&$player~current_prompt&"*"
	gosub :switchboard~switchboard
	halt
end

gosub :planet~getplanetinfo
if ($planet~planet = $planet~planettofill)
	return
end

if ($lspfailed = false)
	setvar $lspfailed true
	send "qqq**"
	goto :landstartingplanet
else
	setvar $switchboard~message "Could not land on starting planet; halting farm run.*"
	gosub :switchboard~switchboard
	halt
end

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:endfarmer
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
logging on
setvar $relog_nocitadel 0
savevar $relog_nocitadel
gosub :player~currentprompt
if ($player~current_prompt = "Planet")
	send "c"
end
send "p "&$startinglocation&"  *ys* "
if ($planetisfull)
	setvar $switchboard~message "Farming Planet is full.  Ready to sell off the product!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Farming run is complete.*"
	gosub :switchboard~switchboard
end
gosub :player~quikstats
if ($player~current_sector <> $startinglocation)
	setvar $switchboard~message "Could not make it back to starting sector!*"
	gosub :switchboard~switchboard
end
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:balanceplanets
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :planet~loadplanetcolos
gosub :loadfarmsectorlist
if ($farmlistcount <= 0)
	setvar $switchboard~message "No sectors in farming list.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~planet_scanner = "No")
	setvar $switchboard~message "Farm balance must be run with a planet scanner.*"
	gosub :switchboard~switchboard
	halt
end
send "q"
waiton "Planet command"
gosub :planet~getplanetinfo
setvar $class $planet~planet_class
gosub :getplanetcolos
if ($f1 > 0) or ($o1 > 0) or ($e1 > 0)
	setvar $switchboard~message "Starting planet is overloaded; farm balance needs room on the starting planet.*"
	gosub :switchboard~switchboard
	halt
end
send "c"
waiton "Citadel command"
logging off
setvar $relog_nocitadel 1
savevar $relog_nocitadel
setvar $balance_total_moved 0
setvar $balance_sector_index 0
while ($balance_sector_index < $farmlistcount)
	add $balance_sector_index 1
	gosub :balance_land_start_citadel
	setvar $planet~warpto $sector[$balance_sector_index]
	gosub :planet~pwarp
	if ($planet~pwarpsuccess = true)
		send "qqq**"
		gosub :planet~countplanets
		if ($planet~planetcount > 1)
			gosub :balance_scan_sector
			gosub :balance_process_sector
		end
	else
		setvar $switchboard~message "Farm balance could not pwarp to sector "&$sector[$balance_sector_index]&"; skipping.*"
		gosub :switchboard~switchboard
	end
end
gosub :balance_land_start_citadel
setvar $planet~warpto $startinglocation
gosub :planet~pwarp
gosub :balance_finish
setvar $switchboard~message "Farm balance complete. Moved "&$balance_total_moved&" colonists.*"
gosub :switchboard~switchboard
halt

:loadfarmsectorlist
setvar $sector sectors
setarray $sector sectors
setvar $farmlistcount 0
setvar $i 1
while ($i <= sectors)
	getword $farmsectors $check $i
	if ($check = "")
		return
	end
	isnumber $test $check
	if ($test)
		if ($check > 0) and ($check <= sectors)
			if ($check <> $startinglocation)
				add $farmlistcount 1
				setvar $sector[$farmlistcount] $check
			end
		end
	end
	add $i 1
end
return

:balance_land_start_citadel
setvar $balance_land_id $startingplanet
gosub :balance_land_planet
if ($planet~successfulplanet <> true)
	setvar $switchboard~message "Unable to land on starting planet; halting farm balance.*"
	gosub :switchboard~switchboard
	halt
end
send "c"
waiton "Citadel command"
return

:balance_land_planet
gosub :player~currentprompt
if ($player~current_prompt = "Citadel")
	send "q"
	waiton "Planet command"
	send "q"
	waiton "Command ["
elseif ($player~current_prompt = "Planet")
	send "q"
	waiton "Command ["
end
setvar $planet~planet $balance_land_id
setvar $planet~nocit true
gosub :planet~landingsub
return

:balance_scan_sector
setvar $balance_planet_count 0
setvar $balance_start_index 0
setarray $balance_planet 200
setarray $balance_over 200 3
setarray $balance_room 200 3
setarray $balance_buffer_room 200 3
setarray $balance_target 200 3
setarray $balance_max 200 3
setvar $j 0
while ($j < $planet~planetcount)
	add $j 1
	setvar $balance_land_id $planet~planets[$j]
	gosub :balance_land_planet
	if ($planet~successfulplanet = true)
		gosub :planet~getplanetinfo
		add $balance_planet_count 1
		setvar $balance_current_index $balance_planet_count
		gosub :balance_record_current_planet
		send "q"
		waiton "Command ["
	end
end
return

:balance_record_current_planet
setvar $balance_planet[$balance_current_index] $planet~planet
if ($planet~planet = $startingplanet)
	setvar $balance_start_index $balance_current_index
end
setvar $class $planet~planet_class
gosub :getcolosfromfile
gosub :getplanetcolos
gosub :balance_apply_computed_targets
gosub :balance_remember_current_class
setvar $balance_target[$balance_current_index][1] $fuelcolos
setvar $balance_target[$balance_current_index][2] $orgcolos
setvar $balance_target[$balance_current_index][3] $equcolos
setvar $balance_max[$balance_current_index][1] $fuelcolosmax
setvar $balance_max[$balance_current_index][2] $orgcolosmax
setvar $balance_max[$balance_current_index][3] $equcolosmax
setvar $balance_over[$balance_current_index][1] $f1
setvar $balance_over[$balance_current_index][2] $o1
setvar $balance_over[$balance_current_index][3] $e1
setvar $balance_cat 0
while ($balance_cat < 3)
	add $balance_cat 1
	if ($balance_target[$balance_current_index][$balance_cat] > 0) and ($planet~colo[$balance_cat] > $balance_target[$balance_current_index][$balance_cat])
		setvar $balance_target_over ($planet~colo[$balance_cat] - $balance_target[$balance_current_index][$balance_cat])
		if ($balance_target_over > $balance_over[$balance_current_index][$balance_cat])
			setvar $balance_over[$balance_current_index][$balance_cat] $balance_target_over
		end
	end
	setvar $balance_room[$balance_current_index][$balance_cat] ($balance_target[$balance_current_index][$balance_cat] - $planet~colo[$balance_cat])
	if ($balance_room[$balance_current_index][$balance_cat] < 0)
		setvar $balance_room[$balance_current_index][$balance_cat] 0
	end
	if ($planet~planet = $startingplanet)
		setvar $balance_buffer_room[$balance_current_index][$balance_cat] ($balance_max[$balance_current_index][$balance_cat] - $planet~colo[$balance_cat])
		if ($balance_buffer_room[$balance_current_index][$balance_cat] < 0)
			setvar $balance_buffer_room[$balance_current_index][$balance_cat] 0
		end
	else
		setvar $balance_buffer_room[$balance_current_index][$balance_cat] 0
	end
end
return

:balance_apply_computed_targets
if ($planet~fuelcolos > 0)
	setvar $fuelcolosmax $planet~fuelcolos
	setvar $colo_max $fuelcolosmax
	gosub :targetfrommax
	setvar $fuelcolos $colo_target
end
if ($planet~orgcolos > 0)
	setvar $orgcolosmax $planet~orgcolos
	setvar $colo_max $orgcolosmax
	gosub :targetfrommax
	setvar $orgcolos $colo_target
end
if ($planet~equcolos > 0)
	setvar $equcolosmax $planet~equcolos
	setvar $colo_max $equcolosmax
	gosub :targetfrommax
	setvar $equcolos $colo_target
end
return

:balance_remember_current_class
if ($fuelcolosmax <= 0) and ($orgcolosmax <= 0) and ($equcolosmax <= 0)
	return
end
setvar $remember_index 0
setvar $remember_i 0
while ($remember_i < $planet~planet_colos_count)
	add $remember_i 1
	if ($planet~planet_colos[$remember_i] = $class)
		setvar $remember_index $remember_i
	end
end
if ($remember_index = 0)
	add $planet~planet_colos_count 1
	setvar $remember_index $planet~planet_colos_count
	setvar $planet~planet_colos[$remember_index] $class
end
if ($fuelcolosmax > 0)
	setvar $planet~planet_colos[$remember_index][1] $fuelcolosmax
end
if ($orgcolosmax > 0)
	setvar $planet~planet_colos[$remember_index][2] $orgcolosmax
end
if ($equcolosmax > 0)
	setvar $planet~planet_colos[$remember_index][3] $equcolosmax
end
return

:balance_process_sector
if ($balance_start_index > 0)
	setvar $balance_source_index $balance_start_index
	gosub :balance_move_source_to_sector_room
end
setvar $balance_source_index 0
while ($balance_source_index < $balance_planet_count)
	add $balance_source_index 1
	if ($balance_source_index <> $balance_start_index)
		gosub :balance_move_source_to_sector_room
	end
end
if ($balance_start_index > 0)
	setvar $balance_source_index 0
	while ($balance_source_index < $balance_planet_count)
		add $balance_source_index 1
		if ($balance_source_index <> $balance_start_index)
			gosub :balance_move_source_to_start
		end
	end
end
return

:balance_move_source_to_sector_room
setvar $balance_source_category 0
while ($balance_source_category < 3)
	add $balance_source_category 1
	setvar $balance_remaining $balance_over[$balance_source_index][$balance_source_category]
	while ($balance_remaining > 0)
		gosub :balance_find_sector_room
		if ($balance_dest_index <= 0)
			setvar $balance_remaining 0
		else
			setvar $balance_dest_is_buffer false
			gosub :balance_move_found_amount
			setvar $balance_remaining $balance_over[$balance_source_index][$balance_source_category]
		end
	end
end
return

:balance_move_source_to_start
setvar $balance_source_category 0
while ($balance_source_category < 3)
	add $balance_source_category 1
	setvar $balance_remaining $balance_over[$balance_source_index][$balance_source_category]
	while ($balance_remaining > 0)
		gosub :balance_find_start_room
		if ($balance_dest_index <= 0)
			setvar $balance_remaining 0
		else
			setvar $balance_dest_is_buffer true
			gosub :balance_move_found_amount
			setvar $balance_remaining $balance_over[$balance_source_index][$balance_source_category]
		end
	end
end
return

:balance_find_sector_room
setvar $balance_dest_index 0
setvar $balance_dest_category 0
setvar $balance_dest_room 0
setvar $balance_find_index 0
while ($balance_find_index < $balance_planet_count)
	add $balance_find_index 1
	if ($balance_find_index <> $balance_start_index)
		setvar $balance_find_cat 0
		while ($balance_find_cat < 3)
			add $balance_find_cat 1
			if ($balance_room[$balance_find_index][$balance_find_cat] > 0)
				if ($balance_find_index <> $balance_source_index) or ($balance_find_cat <> $balance_source_category)
					setvar $balance_dest_index $balance_find_index
					setvar $balance_dest_category $balance_find_cat
					setvar $balance_dest_room $balance_room[$balance_find_index][$balance_find_cat]
					return
				end
			end
		end
	end
end
return

:balance_find_start_room
setvar $balance_dest_index 0
setvar $balance_dest_category 0
setvar $balance_dest_room 0
if ($balance_start_index <= 0)
	return
end
setvar $balance_find_cat 0
while ($balance_find_cat < 3)
	add $balance_find_cat 1
	if ($balance_buffer_room[$balance_start_index][$balance_find_cat] > 0)
		setvar $balance_dest_index $balance_start_index
		setvar $balance_dest_category $balance_find_cat
		setvar $balance_dest_room $balance_buffer_room[$balance_start_index][$balance_find_cat]
		return
	end
end
return

:balance_move_found_amount
setvar $balance_move_amount $balance_over[$balance_source_index][$balance_source_category]
if ($balance_move_amount > $balance_dest_room)
	setvar $balance_move_amount $balance_dest_room
end
if ($balance_move_amount <= 0)
	return
end
setvar $balance_source_planet $balance_planet[$balance_source_index]
setvar $balance_dest_planet $balance_planet[$balance_dest_index]
gosub :balance_move_colos
if ($balance_move_success = true)
	subtract $balance_over[$balance_source_index][$balance_source_category] $balance_move_amount
	if ($balance_over[$balance_source_index][$balance_source_category] < 0)
		setvar $balance_over[$balance_source_index][$balance_source_category] 0
	end
	if ($balance_dest_is_buffer = true)
		subtract $balance_buffer_room[$balance_dest_index][$balance_dest_category] $balance_move_amount
		if ($balance_buffer_room[$balance_dest_index][$balance_dest_category] < 0)
			setvar $balance_buffer_room[$balance_dest_index][$balance_dest_category] 0
		end
		if ($balance_room[$balance_dest_index][$balance_dest_category] > 0)
			subtract $balance_room[$balance_dest_index][$balance_dest_category] $balance_move_amount
			if ($balance_room[$balance_dest_index][$balance_dest_category] < 0)
				setvar $balance_room[$balance_dest_index][$balance_dest_category] 0
			end
		end
	else
		subtract $balance_room[$balance_dest_index][$balance_dest_category] $balance_move_amount
		if ($balance_room[$balance_dest_index][$balance_dest_category] < 0)
			setvar $balance_room[$balance_dest_index][$balance_dest_category] 0
		end
	end
	if ($balance_source_index = $balance_start_index)
		add $balance_buffer_room[$balance_source_index][$balance_source_category] $balance_move_amount
	end
	add $balance_total_moved $balance_move_amount
else
	setvar $balance_over[$balance_source_index][$balance_source_category] 0
end
return

:balance_move_colos
setvar $balance_move_success false
if ($balance_source_planet = $balance_dest_planet) and ($balance_source_category = $balance_dest_category)
	return
end
if ($balance_move_amount <= 0)
	return
end
setvar $balance_land_id $balance_source_planet
gosub :balance_land_planet
if ($planet~successfulplanet <> true)
	return
end
if ($balance_source_planet = $balance_dest_planet)
	gosub :balance_move_colos_same_planet
	return
end
gosub :balance_move_colos_between_planets
return

:balance_move_colos_same_planet
killalltriggers
settextlinetrigger balance_same_success :balance_same_success "The Colonists drop what they were doing"
settextlinetrigger balance_same_failed :balance_same_failed "You don't have that many"
settexttrigger balance_same_prompt :balance_same_failed "Planet command"
send "pn"&$balance_source_category&$balance_move_amount&"*"&$balance_dest_category
pause

:balance_same_success
killalltriggers
waiton "Planet command"
setvar $balance_move_success true
return

:balance_same_failed
killalltriggers
setvar $balance_move_success false
return

:balance_move_colos_between_planets
gosub :player~quikstats
gosub :balance_check_empty_holds
if ($balance_empty_holds <= 0)
	gosub :balance_empty_ship_holds
end
if ($balance_empty_holds <= 0)
	return
end
gosub :balance_leave_to_command
setvar $balance_move_left $balance_move_amount
setvar $balance_burst_count 0
while ($balance_move_left > 0)
	setvar $balance_get $balance_empty_holds
	if ($balance_get > $balance_move_left)
		setvar $balance_get $balance_move_left
	end
	send "l"&$balance_source_planet&"*snt"&$balance_source_category&$balance_get&"*q l"&$balance_dest_planet&"*snl"&$balance_dest_category&$balance_get&"*q "
	subtract $balance_move_left $balance_get
	add $balance_burst_count 1
	if ($balance_burst_count >= 100)
		send "@"
		waiton "Average Interval Lag"
		setvar $balance_burst_count 0
	end
end
send "@"
waiton "Average Interval Lag"
setvar $balance_move_success true
return

:balance_check_empty_holds
setvar $balance_empty_holds ($player~total_holds - $player~ore_holds - $player~organic_holds - $player~equipment_holds - $player~colonist_holds)
if ($balance_empty_holds < 0)
	setvar $balance_empty_holds 0
end
return

:balance_empty_ship_holds
gosub :player~currentprompt
if ($player~current_prompt = "Command")
	send "jy"
	waiton "Command ["
elseif ($player~current_prompt = "Citadel")
	send "q"
	waiton "Planet command"
	gosub :balance_unload_holds_to_planet
elseif ($player~current_prompt = "Planet")
	gosub :balance_unload_holds_to_planet
else
	setvar $balance_land_id $balance_source_planet
	gosub :balance_land_planet
	if ($planet~successfulplanet <> true)
		return
	end
	gosub :balance_unload_holds_to_planet
end
gosub :player~quikstats
gosub :balance_check_empty_holds
return

:balance_unload_holds_to_planet
send "tnl1*"
waiton "Planet command"
send "tnl2*"
waiton "Planet command"
send "tnl3*"
waiton "Planet command"
return

:balance_leave_to_command
gosub :player~currentprompt
if ($player~current_prompt = "Citadel")
	send "q"
	waiton "Planet command"
	send "q"
	waiton "Command ["
elseif ($player~current_prompt = "Planet")
	send "q"
	waiton "Command ["
end
return

:balance_finish
killalltriggers
logging on
setvar $relog_nocitadel 0
savevar $relog_nocitadel
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getcolosfromfile
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $i 0
setvar $fuelcolos 0
setvar $orgcolos 0
setvar $equcolos 0
setvar $fuelcolosmax 0
setvar $orgcolosmax 0
setvar $equcolosmax 0
while ($i < $planet~planet_colos_count)
	add $i 1
	setvar $tmpclass $planet~planet_colos[$i]
	if ($tmpclass = $class)
		if ($planet~planet_colos[$i][1] > 0)
			setvar $fuelcolosmax $planet~planet_colos[$i][1]
			setvar $colo_max $fuelcolosmax
			gosub :targetfrommax
			setvar $fuelcolos $colo_target
		end
		if ($planet~planet_colos[$i][2] > 0)
			setvar $orgcolosmax $planet~planet_colos[$i][2]
			setvar $colo_max $orgcolosmax
			gosub :targetfrommax
			setvar $orgcolos $colo_target
		end
		if ($planet~planet_colos[$i][3] > 0)
			setvar $equcolosmax $planet~planet_colos[$i][3]
			setvar $colo_max $equcolosmax
			gosub :targetfrommax
			setvar $equcolos $colo_target
		end
		#echo "*Class: "&$class&"  Fuel Colos: "&$fuelcolos&"  Org Colos: "&$orgcolos&"  Equ Colos: "&$equcolos&"*"
	end
end
return

:targetfrommax
setvar $colo_target 0
if ($colo_max > 0)
	setprecision 0
	if ($colo_max < 250000)
		setvar $colo_target ($colo_max * 0.8)
	else
		setvar $colo_target ($colo_max * 0.9)
	end
	round $colo_target 0
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:getplanetcolos
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
if (($planet~prod[1] * $planet~rate[1]) < $planet~colo[1])
	setprecision 5
	setvar $fuelmax (($planet~prod[1] + ($planet~colo[1] / $planet~rate[1])) / 2)
	setvar $planet~fuelcolos (($planet~colo[1] + ($planet~prod[1] * $planet~rate[1])) / 2)
	setvar $colo_target $planet~fuelcolos
	gosub :snapcolotarget
	setvar $planet~fuelcolos $colo_target
	if ($planet~fuelcolos < 250000)
		setvar $f1 ($planet~colo[1] - ($planet~fuelcolos * 0.8))
	else
		setvar $f1 ($planet~colo[1] - ($planet~fuelcolos * 0.9))
	end
else
	setvar $fuelmax 0
	setvar $planet~fuelcolos 0
	setvar $f1 0
end
if (($planet~prod[2] * $planet~rate[2]) < $planet~colo[2])
	setprecision 5
	setvar $orgmax (($planet~prod[2] + ($planet~colo[2] / $planet~rate[2])) / 2)
	setvar $planet~orgcolos (($planet~colo[2] + ($planet~prod[2] * $planet~rate[2])) / 2)
	setvar $colo_target $planet~orgcolos
	gosub :snapcolotarget
	setvar $planet~orgcolos $colo_target
	if ($planet~orgcolos < 250000)
		setvar $o1 ($planet~colo[2] - ($planet~orgcolos * 0.8))
	else
		setvar $o1 ($planet~colo[2] - ($planet~orgcolos * 0.9))
	end
else
	setvar $orgmax 0
	setvar $planet~orgcolos 0
	setvar $o1 0
end
if (($planet~prod[3] * $planet~rate[3]) < $planet~colo[3])
	setprecision 5
	setvar $equmax (($planet~prod[3] + ($planet~colo[3] / $planet~rate[3])) / 2)
	setvar $planet~equcolos (($planet~colo[3] + ($planet~prod[3] * $planet~rate[3])) / 2)
	setvar $colo_target $planet~equcolos
	gosub :snapcolotarget
	setvar $planet~equcolos $colo_target
	if ($planet~equcolos < 250000)
		setvar $e1 ($planet~colo[3] - ($planet~equcolos * 0.8))
	else
		setvar $e1 ($planet~colo[3] - ($planet~equcolos * 0.9))
	end
else
	setvar $equmax 0
	setvar $planet~equcolos 0
	setvar $e1 0
end
setprecision 0
gosub :planet~updateplanetcolos
#echo "**fuelmax: "&$fuelmax&"(remove: "&$f1&")  orgmax: "&$orgmax&"(remove: "&$o1&")  equmax: "&$equmax&"(remove: "&$e1&")	**"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:snapcolotarget
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setprecision 0
round $colo_target 0
if ($colo_target > 0)
	add $colo_target 500
	setvar $colo_target ($colo_target / 1000)
	setvar $colo_target ($colo_target * 1000)
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:farm_set
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $i 2
setvar $newfarmlist ""
setvar $sectorsadded 0
setvar $check ""
while ($check <> "%%%")
	getword $bot~user_command_line $check $i "%%%"
	if ($check <> "%%%")
		isnumber $test $check
		if ($test)
			if (($check > 0) and ($check <= sectors))
				if ($newfarmlist = "")
					setvar $newfarmlist $check
				else
					setvar $newfarmlist $newfarmlist&" "&$check
				end
				add $sectorsadded 1
			end
		end
	end
	add $i 1
end
if ($farmsectors = "") or ($farmsectors = 0)
	setvar $farmsectors $newfarmlist
else
	setvar $farmsectors $farmsectors&" "&$newfarmlist
end
savevar $farmsectors
setvar $switchboard~message ""&$sectorsadded&" Sectors added to Bot Farming Configuration.*"
gosub :switchboard~switchboard
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:checkfull
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $skipsector false
if ($planet~emptyfuel > 0)
	setvar $oretofill ($planet~planet_fuel_max - $planet~planet_fuel)
	if ($planet~planet_fuel_max > 0) and (($planet~planet_fuel * 100) > ($planet~planet_fuel_max * 99))
		setvar $oretofill 0
	elseif ($oretofill < $player~total_holds)
		setvar $oretofill 0
	end
else
	setvar $oretofill 0
end
if ($planet~emptyorganics > 0)
	setvar $orgtofill ($planet~planet_organics_max - $planet~planet_organics)
	if ($planet~planet_organics_max > 0) and (($planet~planet_organics * 100) > ($planet~planet_organics_max * 99))
		setvar $orgtofill 0
	elseif ($orgtofill < $player~total_holds)
		setvar $orgtofill 0
	end
else
	setvar $orgtofill 0
end
if ($planet~emptyequipment > 0)
	setvar $equtofill ($planet~planet_equipment_max - $planet~planet_equipment)
	if ($planet~planet_equipment_max > 0) and (($planet~planet_equipment * 100) > ($planet~planet_equipment_max * 99))
		setvar $equtofill 0
	elseif ($equtofill < $player~total_holds)
		setvar $equtofill 0
	end
else
	setvar $equtofill 0
end
if ($planet~emptyfigs > 0)
	setvar $figstofill ($planet~planet_fighters_max - $planet~planet_fighters)
	if ($planet~planet_fighters_max > 0) and (($planet~planet_fighters * 100) > ($planet~planet_fighters_max * 99))
		setvar $figstofill 0
	elseif ($figstofill < $ship~ship_fighters_max)
		setvar $figstofill 0
	end
	if ($figstofill = 0) and ($planet~dumpfigs > 0)
		setvar $planet~warpto $startinglocation
		gosub :ensurecitadelforpwarp
		gosub :planet~pwarp
		if ($planet~pwarpsuccess = false)
			setvar $switchboard~message "Unable to pwarp to sector "&$startinglocation&"*"
			gosub :switchboard~switchboard
			halt
		end

		send "'" & $bot~bot_name & " movefig s*"
		waiton "{" & $bot~bot_name & "} - fighters moved"
		setvar $figstofill $planet~planet_fighters_max

		setvar $planet~warpto $sector[$i]
		gosub :ensurecitadelforpwarp
		gosub :planet~pwarp
		if ($planet~pwarpsuccess = false)
			setvar $switchboard~message "Unable to pwarp to sector "&$sector[$i]&"*"
			gosub :switchboard~switchboard
			halt
		end

		gosub :player~currentprompt
		if ($player~current_prompt = "Citadel")
			send "q"
			waiton "Planet command"
		end
		goto :restrip
	end
else
	setvar $figstofill 0
end
if ($planet~emptyfuelcolos > 0)
	setvar $fuelcolstofill ($planet~planet_fuel_colonists_max - $planet~planet_fuel_colonists)
	if ($planet~planet_fuel_colonists_max > 0) and (($planet~planet_fuel_colonists * 100) > ($planet~planet_fuel_colonists_max * 99))
		setvar $fuelcolstofill 0
	elseif ($fuelcolstofill < $player~total_holds)
		setvar $fuelcolstofill 0
	end
else
	setvar $fuelcolstofill 0
end
if ($planet~emptyorgcolos > 0)
	setvar $orgcolstofill ($planet~planet_organics_colonists_max - $planet~planet_organics_colonists)
	if ($planet~planet_organics_colonists_max > 0) and (($planet~planet_organics_colonists * 100) > ($planet~planet_organics_colonists_max * 99))
		setvar $orgcolstofill 0
	elseif ($orgcolstofill < $player~total_holds)
		setvar $orgcolstofill 0
	end
else
	setvar $orgcolstofill 0
end
if ($planet~emptyequcolos > 0)
	setvar $equcolstofill ($planet~planet_equipment_colonists_max - $planet~planet_equipment_colonists)
	if ($planet~planet_equipment_colonists_max > 0) and (($planet~planet_equipment_colonists * 100) > ($planet~planet_equipment_colonists_max * 99))
		setvar $equcolstofill 0
	elseif ($equcolstofill < $player~total_holds)
		setvar $equcolstofill 0
	end
else
	setvar $equcolstofill 0
end
if ($oretofill <= 0) and ($orgtofill <= 0) and ($equtofill <= 0) and ($fuelcolstofill <= 0) and ($orgcolstofill <= 0) and ($equcolstofill <= 0)
	if ($figstofill <= 0)
		setvar $farmplanetdone true
		return
	end
	if ($j <= $planet~planetcount) and ($planet~planets[$j][3] < ($ship~ship_fighters_max / 10))
		setvar $skipsector true
	end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:ensurecitadelforpwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
if ($player~current_prompt = "Computer")
	send "q"
	gosub :player~quikstats
end
if ($player~current_prompt = "Command")
	setvar $planet~nocit true
	gosub :planet~landingsub
	gosub :player~quikstats
end
if ($player~current_prompt = "Planet")
	send "c "
	settexttrigger farm_citadel_ready :farm_citadel_ready "Citadel command (?=help)"
	settexttrigger farm_citadel_misroute :farm_citadel_misroute "Computer command [TL="
	pause

	:farm_citadel_ready
	killalltriggers
	gosub :player~quikstats
	return

	:farm_citadel_misroute
	killalltriggers
	send "q"
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		setvar $planet~nocit true
		gosub :planet~landingsub
		gosub :player~quikstats
	end
	if ($player~current_prompt = "Planet")
		send "c "
		waiton "Citadel command (?=help)"
		gosub :player~quikstats
	end
end
setvar $planet~pwarp_scan false
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:discod
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $tagline "[Farmer]"
setvar $taglineb "[Farmer]"
killalltriggers
echo "**"&ansi_14&$taglineb&ansi_15&" Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger emancipate_cpu :emancipate_cpu 3000
	echo "**"&ansi_14&$taglineb&ansi_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger waitingabit :waitingabit 3000
echo "**"&ansi_14&$taglineb&ansi_15&" Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	send " L Z"&#8&$planet~planet&"*  *  J  C  *  "
	settextlinetrigger notlanded :notlanded "Are you sure you want to jettison all cargo?"
	settextlinetrigger landed :landed "<Enter Citadel>"
	setdelaytrigger testconn :testconn 3000
	pause

	:testconn
	killalltriggers
	if (connected = false)
		goto :disco_test
	else
		setvar $switchboard~message ""&$taglineb&" Problem Detected Unable to Land!*"
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
	goto :farmplanet
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :farmplanet
else
	send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$taglineb&"Attempting to Reach Correct Prompt...*"
	settextlinetrigger emq_complete :emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger emq_delay :emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

:setconnectiontriggers
killtrigger discod1
killtrigger discod2
seteventtrigger discod1 :discod "CONNECTION LOST"
seteventtrigger discod2 :discod "Connections have been temporarily disabled."
return

include "source\include\loadvars"
include "source\include\help"
include "source\include\ship"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard.ts"
