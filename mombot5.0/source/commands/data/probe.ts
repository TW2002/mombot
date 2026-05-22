gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]    $help~tab&"probe - based on Rammar's Ether Prober, adapted for MomBot by Shadow"
setvar $help~help[2]    $help~tab&"       "
setvar $help~help[2]    $help~tab&"    Sends repeated ether probes to map and discover sectors, ports, etc."
setvar $help~help[2]    $help~tab&"    Will buy additional probes at dock if specified and at dock."
setvar $help~help[2]    $help~tab&"       "
setvar $help~help[3]    $help~tab&"     {ewarp}  - Will refurb torps and atomics by ewarp "
setvar $help~help[4]    $help~tab&"                This is NOT safe."
setvar $help~help[5]    $help~tab&"       "
setvar $help~help[6]    $help~tab&"   {create:}  - List of planet types to make.  First word"
setvar $help~help[7]    $help~tab&"                of planet types separated by commas and no spaces."
setvar $help~help[8]    $help~tab&"                Default will use keeper planets in preferences."
setvar $help~help[9]    $help~tab&"                "
setvar $help~help[10]   $help~tab&"{custom name} - Name the planet will be.  Otherwise it's a random   "
setvar $help~help[11]   $help~tab&"                name from a database              "
setvar $help~help[12]   $help~tab&"                              "
setvar $help~help[13]   $help~tab&"      Examples:                   "
setvar $help~help[14]   $help~tab&"            >makeplanet create:earth,volcanic,oceanic "
setvar $help~help[15]   $help~tab&"            >makeplanet ewarp create:earth         "
setvar $help~help[16]   $help~tab&"            >makeplanet "&#34&"death"&#34&" create:volcanic "
setvar $help~help[17]   $help~tab&"                              "
setvar $help~help[18]   $help~tab&"               - Originally written by Xide"
gosub :help~helpfile

# Checks to make sure you're at the command prompt.
cuttext currentline $location 1 7
if ($location <> "Command")
	clientmessage "This script must be run from the Command prompt!"
	halt
end
gettext currentline $current_sector "]:[" "] (?="
loadvar $probe_cost
loadvar $last_probe
loadvar $last_mode
loadvar $bot~folder
setvar $adj_sector_count sector.warpcount[$current_sector]
setvar $adj_avoid_count 0
#	setArray $adj_Avoids $adj_Sector_count
setarray $sector_reported sectors
setarray $target_list sectors
setvar $probes_used 0
setvar $unreachable 0
setvar $found_rpts 0

:load_settings
loadvar $probesettings

if ($probesettings)
	loadvar $verbose
	loadvar $restock_probes
	loadvar $minimum_credits
else
	setvar $verbose "YES"
	setvar $restock_probes "YES"
	setvar $minimum_credits 50000

	savevar $verbose
	savevar $restock_probes
	savevar $minimum_credits

	setvar $probesettings 1
	savevar $probesettings
end

#if ($current_Sector <> STARDOCK)
#	setVar $restock_probes "NO"
#end
:build_menu
addmenu "" "Prober" "*" "." "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" false
#	addMenu "Prober" "StartProbing" ANSI_13&"Go!"&ANSI_10&" - "&ANSI_14&"Start Probing" "G" :Get_Initial_Info "" TRUE
addmenu "Prober" "Verbose" ansi_10&"Report Findings on SubSpace "&ansi_13&"("&ansi_14&"Traders"&ansi_13&","&ansi_14&"Planets"&ansi_13&","&ansi_14&"etc"&ansi_13&")    " "1" :menu_verbose "" false
addmenu "Prober" "Restock" ansi_10&"Restock Probes from Stardock "&ansi_13&"("&ansi_14&"Only if at Dock"&ansi_13&")       " "2" :menu_restock_probes "" false
addmenu "Prober" "MinCredits" ansi_10&"Minimum Credit Level                                 " "3" :menu_minimum_credits "" false
addmenu "Prober" "Deadend_Menu" ansi_11&"MENU: "&ansi_10&"Deadend Options "&ansi_13&"("&ansi_14&"All"&ansi_13&", "&ansi_14&"Unexplored"&ansi_13&", "&ansi_14&"Range"&ansi_13&", "&ansi_14&"Date"&ansi_13&")" "4" "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" true
addmenu "Prober" "Random_Menu" ansi_11&"MENU: "&ansi_10&"Random Probing Options "&ansi_13&"("&ansi_14&"All"&ansi_13&", "&ansi_14&"Unexplored"&ansi_13&")" "5" "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" true
addmenu "Prober" "Range_Menu" ansi_11&"MENU: "&ansi_10&"Terra Range Search "&ansi_13&"("&ansi_14&"X"&ansi_13&" Hops with"&ansi_14&" Y "&ansi_13&"warps)" "6" "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" true
addmenu "Prober" "UseFile" ansi_13&"RUN: "&ansi_15&"Using a File for Input " "7" :input_filename "" false
addmenu "Prober" "UnExplored" ansi_13&"RUN: "&ansi_15&"All UnExplored Sectors" "8" :run_unexplored "" false
addmenu "Prober" "Class0" ansi_13&"RUN: "&ansi_15&"Class 0 Search - "&ansi_13&"("&ansi_14&"Unexplored Only"&ansi_13&")" "9" :run_class0 "" false
if ($last_probe > 0)
	addmenu "Prober" "Resume" ansi_13&"RUN: "&ansi_14&"Resume "&ansi_10&"Last Probe List" "R" :run_resume "" false
end

addmenu "" "Deadend_Menu" ansi_10&"Dead End Probing Options" "." "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" false
addmenu "Deadend_Menu" "All_DEs" ansi_13&"RUN: "&ansi_14&"All Deadends" "1" :run_all_des "" false
addmenu "Deadend_Menu" "Unexplored_DEs" ansi_13&"RUN: "&ansi_14&"Unexplored Deadends -"&ansi_10&" In Sequential Order" "2" :run_unexplored_des_numerical "" false
addmenu "Deadend_Menu" "Unexplored_DEs" ansi_13&"RUN: "&ansi_14&"Unexplored Deadends -"&ansi_10&" Most Distant Sectors First" "3" :run_unexplored_des_distant "" false
addmenu "Deadend_Menu" "TerraRange_DEs" ansi_13&"RUN: "&ansi_14&"Hops From Terra Deadends "&ansi_10&"(All Matches)" "4" :run_terrarange_des "" false
addmenu "Deadend_Menu" "LastSeen_DEs" ansi_13&"RUN: "&ansi_14&"Last Seen More Than "&ansi_10&"X"&ansi_14&" Days Ago "&ansi_10&"(All Matches)" "5" :run_lastseen_des "" false

addmenu "" "Random_Menu" ansi_10&"Dead End Probing Options" "." "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" false
addmenu "Random_Menu" "All_Random" ansi_13&"RUN: "&ansi_14&"True Random"&ansi_10&" ("&ansi_13&"Explored"&ansi_10&" and "&ansi_13&"Unexplored"&ansi_10&")" "1" :run_true_random "" false
addmenu "Random_Menu" "Unexplored_Random" ansi_13&"RUN: "&ansi_14&"Unexplored Random"&ansi_10&" ("&ansi_13&"Unexplored Only"&ansi_10&")" "2" :run_unexplored_random "" false

addmenu "" "Range_Menu" ansi_10&"Terra Range Search Options" "." "" ansi_10&"Your Choice? "&ansi_10&"<"&ansi_14&"?"&ansi_10&" for "&ansi_14&"Help" false
addmenu "Range_Menu" "All_Range" ansi_13&"RUN: "&ansi_14&"All Range Matches"&ansi_10&" ("&ansi_13&"Explored"&ansi_10&" and "&ansi_13&"Unexplored"&ansi_10&")" "1" :run_true_range "" false
addmenu "Range_Menu" "Unexplored_Range" ansi_13&"RUN: "&ansi_14&"Unexplored Range Matches"&ansi_10&" ("&ansi_13&"Unexplored Only"&ansi_10&")" "2" :run_unexplored_range "" false
addmenu "Range_Menu" "LastSeen_Range"  ansi_13&"RUN: "&ansi_14&"Last Seen More Than "&ansi_10&"X"&ansi_14&" Days Ago "&ansi_10&"(All Matches)" "3" :run_lastseen_range "" false

gosub :sub_setmenu

:title
echo ansi_9 "** ======== " ansi_10&" RammaR's " ansi_14&"Ether Prober 1.2  " ansi_9&"========*"
openmenu "Prober"

:menu_verbose
if ($verbose = "YES")
	setvar $verbose "NO"
else
	setvar $verbose "YES"
end
savevar $verbose
gosub :sub_setmenu
goto :title

:menu_restock_probes
#if ($current_Sector <> STARDOCK)
#	echo ANSI_12&"**You MUST be at Stardock to restock probes!*"
#	setVar $restock_probes "NO"
#elseIf ($restock_Probes = "YES")
#	setVar $restock_probes "NO"
#else
setvar $restock_probes "YES"
#end
savevar $restock_probes
gosub :sub_setmenu
goto :title

:menu_minimum_credits
if ($current_sector <> stardock)
	echo ansi_12&"**You MUST be at Stardock to restock probes!*"
else
	getinput $minimum_credits ansi_10&"*Stop buying probes with how many credits remaining?"
	isnumber $number $minimum_credits
	if ($number = false)
		echo ansi_12&"*Bad Input - Try again*"
		goto :menu_minimum_credits
	end
	savevar $minimum_credits
	gosub :sub_setmenu
	goto :title
end
gosub :sub_setmenu
goto :title

:sub_setmenu
setmenuvalue "Verbose" $verbose
if ($current_sector <> stardock)
	setmenuvalue "Restock" "N/A"
	setmenuvalue "MinCredits" "N/A"
else
	setmenuvalue "Restock" $restock_probes
	setmenuvalue "MinCredits" $minimum_credits
end
return

:input_filename
gosub :target_file_maintenance
echo ansi_13&"**Note: " ansi_14&"Enter the name of the file that lists your Targets " ansi_13&"(ex. "  ansi_15&"deadends.txt" ansi_13&")*"
getconsoleinput $filename
fileexists $exists $filename
if ($exists = false)
	echo ansi_13&"** Cannot find that file - Try again.*"
	goto :input_filename
else
	goto :read_file
end

:read_file
setvar $line 1
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"

:read_next_line
read $filename $read_sector $line
getword $read_sector $read_sector 1
if ($read_sector <> "EOF")
	write $targetfile $read_sector
	#		setVar $target_list[$line] $read_sector
	add $line 1
	goto :read_next_line
else
	subtract $line 1
	setvar $target_count $line
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_unexplored
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode

:ask_ztm_complete
echo ansi_10&"**Is your ZTM Complete? <" ansi_14&"y" ansi_10&"/" ansi_14&"n"
getconsoleinput $ztm_complete singlekey
lowercase $ztm_complete
if ($ztm_complete <> "y") and ($ztm_complete <> "n")
	echo ansi_12&"**Bad Input - Try again*"
	goto :ask_ztm_complete
end
if ($ztm_complete = "n")
	echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
	setvar $target_count 0
	setvar $index 1
	while ($index <= sectors)
		if (sector.explored[$index] <> "YES")
			write $targetfile $index
			add $target_count 1
		end
		add $index 1
	end
else
	setvar $all_range_file $bot~folder&"/"&gamename&"_Sorted_Sectors.txt"
	fileexists $exists $all_range_file
	if ($exists = false)
		gosub :build_all_range_file
	end
	setvar $target_count 0
	setvar $read_line 1
	setvar $max_all_range 0
	echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"

	:read_next_all_range_line
	read $all_range_file $text_line $read_line
	if ($text_line <> "EOF")
		getword $text_line $sector_index 1
		if (sector.explored[$sector_index] <> "YES")
			write $targetfile $sector_index
			add $target_count 1
			if ($max_all_range = 0)
				getword $text_line $max_all_range 2
			end
		end
		add $read_line 1
		goto :read_next_all_range_line
	end
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" You have Explored all targets.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_class0
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 6) and (sector.backdoorcount[$sector_index] > 0) and (sector.explored[$sector_index] <> "YES")
		#		if (SECTOR.WARPCOUNT[$sector_index] = 6) AND (SECTOR.BACKDOORCOUNT[$sector_index] > 0)
		write $targetfile $sector_index
		add $target_count 1
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" You have Explored all Class 0 Type sectors.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_all_des
closemenu
gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 1) or (sector.warpincount[$sector_index] = 1)
		write $targetfile $sector_index
		add $target_count 1
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" Possible ZTM Error - No Deadends.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_unexplored_des_numerical
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 1) or (sector.warpincount[$sector_index] = 1)
		if (sector.explored[$sector_index] <> "YES")
			write $targetfile $sector_index
			add $target_count 1
		end
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" You have explored all deadend sectors.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_unexplored_des_distant
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode
setvar $de_range_file $bot~folder&"/"&gamename&"_Sorted_Deadends.txt"
fileexists $exists $de_range_file
if ($exists = false)
	gosub :build_de_range_file
end
setvar $target_count 0
setvar $read_line 1
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"

:read_next_de_range_line
read $de_range_file $text_line $read_line
if ($text_line <> "EOF")
	getword $text_line $sector_index 1
	if (sector.explored[$sector_index] <> "YES")
		write $targetfile $sector_index
		add $target_count 1
		if ($max_de_range = 0)
			getword $text_line $max_de_range 2
		end
	end
	add $read_line 1
	goto :read_next_de_range_line
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" You have explored all deadend sectors.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets, Starting with DE's at: " ansi_14&$max_de_range ansi_10&" hops.*"
	goto :get_initial_info
end

:run_terrarange_des
closemenu
gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_terra_hops
getinput $hops ansi_10&"***Enter the number of "&ansi_14&"Hops"&ansi_10&" from Terra:"
isnumber $number $hops
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_terra_hops
end
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 1) or (sector.warpincount[$sector_index] = 1)
		getdistance $distance 1 $sector_index
		if ($distance = $hops)
			write $targetfile $sector_index
			add $target_count 1
		end
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" There are no DE's at " ansi_10&$hops ansi_14&" from Terra.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_lastseen_des
closemenu
gettime $day "d"
gettime $month "m"
gettime $year "yyyy"
gosub :convert_date
setvar $current_date $date

gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_lastseen_des
getinput $last_seen_days ansi_10&"***Only probe sectors last seen "&ansi_14&"AT LEAST"&ansi_10&" how many days ago:"
isnumber $number $last_seen_days
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_lastseen_des
end
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 1) or (sector.warpincount[$sector_index] = 1)
		getsector $sector_index $sector_info
		setvar $value $sector_info.updated
		getword $value $date 1
		replacetext $value "/" " "
		getword $value $month 1
		getword $value $day 2
		getword $value $year 3
		gosub :convert_date
		setvar $last_seen $date
		if (($current_date - $last_seen) >= $last_seen_days)
			write $targetfile $sector_index
			add $target_count 1
		end
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" You have seen all the DE's within " ansi_10&$last_seen_days ansi_14&"-days.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_true_random
closemenu
gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_all_random
getinput $random_count ansi_10&"***How many "&ansi_14&"Random Sectors"&ansi_10&" do you want to probe:"
isnumber $number $random_count
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_all_random
end
setarray $rnd_targets sectors
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= $random_count)
	getrnd $random 1 sectors
	if ($rnd_targets[$random] <> 1) and ($random <> stardock)
		setvar $rnd_targets[$random] 1
		write $targetfile $random
		add $sector_index 1
		add $target_count 1
	end
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" Could not generate " ansi_10&"Random" ansi_14&" sector list.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_unexplored_random
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_unexplored_random
getinput $random_count ansi_10&"***How many "&ansi_14&"Random Sectors"&ansi_10&" do you want to probe:"
isnumber $number $random_count
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_unexplored_random
end
setarray $rnd_targets sectors
setvar $unexplored_count 0
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if (sector.explored[$sector_index] <> "YES")
		add $unexplored_count 1
	end
	add $sector_index 1
end
if ($unexplored_count < $random_count)
	echo ansi_12&"***Warning: " ansi_15&"You only have " ansi_13&$unexplored_count ansi_15&" unexplored sectors.*"
	echo ansi_13&"         Auto-reducing the number of probe targets.*"
	setvar $random_count $unexplored_count
end
setvar $sector_index 1
while ($sector_index <= $random_count)
	getrnd $random 1 sectors
	if ($rnd_targets[$random] <> 1) and ($random <> stardock) and (sector.explored[$random] <> "YES")
		setvar $rnd_targets[$random] 1
		write $targetfile $random
		add $sector_index 1
		add $target_count 1
	end
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" Could not generate " ansi_10&"Random" ansi_14&" sector list.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_true_range
closemenu
gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_all_range
getinput $range_hops ansi_10&"***What "&ansi_14&"Range from Terra"&ansi_10&" do you want to probe:"
isnumber $number $range_hops
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_all_range
end

:re_enter_all_range_warps
getinput $range_warps ansi_10&"***Probe sectors with how many "&ansi_14&"Warps?"&ansi_10&" ("&ansi_13&"0 for all"&ansi_10&"): "
isnumber $number $range_warps
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_all_range_warps
end
if ($range_warps > 6)
	echo ansi_12&"*Bad Input - Must be 6 warps or less!*"
	goto :re_enter_all_range_warps
end
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if ((sector.warpcount[$sector_index] = $range_warps) or ($range_warps = 0))
		getdistance $distance 1 $sector_index
		if ($distance = $range_hops)
			write $targetfile $sector_index
			add $target_count 1
		end
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" There are no " ansi_10&$range_warps ansi_14&"-warp sectors at " ansi_10&$range_hops ansi_14&" hops from Terra.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_unexplored_range
closemenu
gosub :target_file_maintenance
setvar $mode "Unexplored"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_unexplored_range
getinput $range_hops ansi_10&"***What "&ansi_14&"Range from Terra"&ansi_10&" do you want to probe:"
isnumber $number $range_hops
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_unexplored_range
end

:re_enter_unexplored_range_warps
getinput $range_warps ansi_10&"***Probe sectors with how many "&ansi_14&"Warps?"&ansi_10&" ("&ansi_13&"0 for all"&ansi_10&"): "
isnumber $number $range_warps
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_unexplored_range_warps
end
if ($range_warps > 6)
	echo ansi_12&"*Bad Input - Must be 6 warps or less!*"
	goto :re_enter_unexplored_range_warps
end
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if ((sector.warpcount[$sector_index] = $range_warps) or ($range_warps = 0)) and (sector.explored[$sector_index] <> "YES")
		getdistance $distance 1 $sector_index
		if ($distance = $range_hops)
			write $targetfile $sector_index
			add $target_count 1
		end
	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!" ansi_14&" There are no " ansi_10&$range_warps ansi_14&"-warp sectors at " ansi_10&$range_hops ansi_14&" hops from Terra.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_lastseen_range
closemenu
gettime $day "d"
gettime $month "m"
gettime $year "yyyy"
gosub :convert_date
setvar $current_date $date

gosub :target_file_maintenance
setvar $mode "All"
setvar $last_mode $mode
savevar $last_mode
setvar $sector_index 1
setvar $target_count 0

:re_enter_lastseen_range
getinput $range_hops ansi_10&"***What "&ansi_14&"Range from Terra"&ansi_10&" do you want to probe:"
isnumber $number $range_hops
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_lastseen_range
end

:re_enter_lastseen_range_warps
getinput $range_warps ansi_10&"***Probe sectors with how many "&ansi_14&"Warps?"&ansi_10&" ("&ansi_13&"0 for all"&ansi_10&"): "
isnumber $number $range_warps
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_lastseen_range_warps
end
if ($range_warps > 6)
	echo ansi_12&"*Bad Input - Must be 6 warps or less!*"
	goto :re_enter_lastseen_range_warps
end

:re_enter_lastseen_range
getinput $last_seen_days ansi_10&"***Only probe sectors last seen "&ansi_14&"AT LEAST"&ansi_10&" how many days ago:"
isnumber $number $last_seen_days
if ($number = false)
	echo ansi_12&"*Bad Input - Try again*"
	goto :re_enter_lastseen_range
end
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"
while ($sector_index <= sectors)
	if ((sector.warpcount[$sector_index] = $range_warps) or ($range_warps = 0))
		getdistance $distance 1 $sector_index
		if ($distance = $range_hops)
			getsector $sector_index $sector_info
			setvar $value $sector_info.updated
			getword $value $date 1
			replacetext $value "/" " "
			getword $value $month 1
			getword $value $day 2
			getword $value $year 3
			gosub :convert_date
			setvar $last_seen $date
			if (($current_date - $last_seen) >= $last_seen_days)
				write $targetfile $sector_index
				add $target_count 1
			end
		end

	end
	add $sector_index 1
end
if ($target_count = 0)
	echo ansi_12&"** No Matching Targets Found!*" ansi_14&" You have seen all of the " ansi_10&$range_warps ansi_14&"-warp sectors at " ansi_10&$range_hops ansi_14&" hops within " ansi_10&$last_seen_days ansi_14&"-days.*"
	halt
else
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

:run_resume
closemenu
echo ansi_10&"**Resuming your last probing list from Sector: " ansi_14&$last_probe "*"
setvar $targetfile $bot~folder&"/"&gamename&"_Probe_Targets.txt"
setvar $temp_file $bot~folder&"/Temp_Probe_List.txt"
setvar $read_line 1
setvar $found_resume "FALSE"
setvar $mode $last_mode
setvar $target_count 0
echo ansi_13&"** Building Target List - " ansi_14&"Please wait....*"

:read_resume_list
read $targetfile $sector_index $read_line
if ($sector_index <> "EOF")
	if ($found_resume = "TRUE")
		write $temp_file $sector_index
		add $target_count 1
	elseif ($sector_index = $last_probe)
		setvar $found_resume "TRUE"
	end
	add $read_line 1
	goto :read_resume_list
else
	delete $targetfile
	rename $temp_file $targetfile
	echo ansi_10&"**Found: " ansi_14&$target_count ansi_10&" Targets*"
	goto :get_initial_info
end

#########  Below starts the actual probing routine #################################################
:get_initial_info
setarray $voids sectors
echo ansi_13&"*Your filtered target list is saved as: " ansi_14&$targetfile "**"
echo ansi_10&"Would you like to clear your avoids? - " ansi_13&"(" ansi_14&"Recommended" ansi_13&")" ansi_10&" - <" ansi_14&"y" ansi_10&"/" ansi_14&"n"
getconsoleinput $answer singlekey
isnumber $number $answer
if ($number)
	echo ansi_12&"*Bad Input - Must be yes or no - Try again*"
	goto :get_initial_info
end
lowercase $answer
if ($answer = "y")
	send "c v 0* y y q"
elseif ($answer = "n")
	gosub :record_voids
elseif ($answer <> "n")
	echo ansi_12&"*Bad Input - Must be yes or no - Try again*"
	goto :get_initial_info
end
send "I"
settextlinetrigger 1 :have_probes "Ether Probes   :"
settextlinetrigger 2 :have_credits "Credits        :"
pause

:have_probes
setvar $cut_line currentline
getwordpos $cut_line $position "Ether Probes   :"
if ($position > 0)
	add $position 17
	getlength $cut_line $line_length
	cuttext currentline $cut_line $position $line_length
	getword $cut_line $have_probes 1
else
	getword $cut_line $have_probes 4
end
pause

:have_credits
getword currentline $have_credits 3
striptext $have_credits ","
waitfor "Command "
if ($have_probes <= 0)
	if ($restock_probes = "YES") and ($have_credits > ($minimum_credits + $probe_cost))
		gosub :buy_probes
	else
		echo ansi_12&"** You don't have any probes and cannot buy any:"
		if ($current_sector <> stardock)
			echo ansi_14&" not at Stardock.*"
		else
			echo ansi_14&" Minimum Credit Level*"
		end
		halt
	end
end

:filename
gettime $date m:d:yy
replacetext $date ":" "-"
setvar $filename1 $bot~folder&"/Probe Unreachable Report - "&gamename&" - "&$date&".txt"
setvar $filename2 $bot~folder&"/Probe Found Report - "&gamename&" - "&$date&".txt"
fileexists $exists $filename1
if ($exists = false)
	write $filename1 "Target       Probe        "
	write $filename1 "Sector     Destroyed     Hops"
	write $filename1 "-----------------------------"
end
fileexists $exists $filename2
if ($exists = false)
	write $filename2 "Probing Found:"
end

:start_probing
setvar $probe_count 0
setvar $read_line 1

:next_probe_cycle
setvar $last_probe $target
savevar $last_probe
read $targetfile $target $read_line
if ($target <> "EOF")
	if ($mode = "Unexplored")
		if (sector.explored[$target] = "YES")
			add $read_line 1
			goto :next_probe_cycle
		end
	end
	add $probe_count 1
	add $read_line 1
	setvar $closest_hit 0
	setvar $closest_hops 999
else
	goto :end
end

:enter_probe_sector
setvar $count3 1
setarray $path_report 200
if ($have_probes <= 0)
	if ($restock_probes = "YES") and ($have_credits > ($minimum_credits + $probe_cost))
		gosub :buy_probes
	else
		#			echo ANSI_12&"** You don't have any probes and cannot buy any - halting.*"
		echo ansi_12&"** You ran out of Ether Probes and / or credits.*"
		echo ansi_10&"**Probing Completed:*"
		echo ansi_13&"Probes Used: " ansi_14&$probes_used "*"
		echo ansi_10&"*You found: " ansi_14&$unreachable ansi_10&" Unreachable Sectors *"
		echo ansi_13&"Saved as: " ansi_14&$filename1 "*"
		echo ansi_10&"*You found: " ansi_14&$found_rpts ansi_10&" Sectors with Traders, Planets, Class 0's, Fed's, etc. *"
		echo ansi_13&"Saved as: " ansi_14&$filename2 "*"
		halt
	end
end
#	getInput $target "** What Sector do you want to probe: "
:fire_probe
if ($adj_avoid_count >= $adj_sector_count)
	echo ansi_12&"**Warning: " ansi_14&"It appears your sector is surrounded with " ansi_12&"Enemy" ansi_14&" figs.*"
	echo ansi_13&"         Script Halting - use the " ansi_14&"Resume" ansi_13&" feature to continue later.**"
	echo ansi_13&"Probes Used: " ansi_14&$probes_used "*"
	echo ansi_10&"*You found: " ansi_14&$unreachable ansi_10&" Unreachable Sectors *"
	echo ansi_13&"Saved as: " ansi_14&$filename1 "*"
	echo ansi_10&"*You found: " ansi_14&$found_rpts ansi_10&" Sectors with Traders, Planets, Class 0's, Fed's, etc. *"
	echo ansi_13&"Saved as: " ansi_14&$filename2 "*"
	halt
end
if ($target = $current_sector)
	goto :next_probe_cycle
end
if ($voids[$target] = true)
	write $filename1 $target&"         None Recorded (Voided Target)"
	add $unreachable 1
	goto :next_probe_cycle
end
send "e " $target "*"
add $probes_used 1
subtract $have_probes 1
#	echo ANSI_10&"* Have Probes : " $have_probes "*"
:probe_triggers
killalltriggers
settexttrigger 3 :start_probe_recording "Probe entering sector :"
settexttrigger 4 :no_route "Error - No route within"
pause

:no_route
killalltriggers
send "N"
gosub :write_unreachable
add $have_probes 1
subtract $probes_used 1
goto :next_probe_cycle

:start_probe_recording
getwordpos currentline $probe_enters "Probe entering sector :"
if ($probe_enters > 0)
	getword currentline $last_entering_sector 5
end
killalltriggers
setvar $count1 1
setvar $found_something "FALSE"
setarray $record_text 100
settextlinetrigger read_line :read_line
pause

:read_line
setvar $probetext currentline
getwordpos $probetext $probe_enters "Probe entering sector :"
getwordpos $probetext $probe_destructs "Probe Self Destructs"
getwordpos $probetext $probe_destroyed "Probe Destroyed!"
if ($probe_destructs > 0) or ($probe_destroyed > 0)
	if ($found_something = "TRUE")
		gosub :build_path_report
	end
	if ($path_report[2] <> 0)
		gosub :send_path_report
	end
	if ($probe_destroyed > 0)
		#			echo "** The last entering sector was: " $Last_Entering_Sector "*"
		getdistance $hops $last_entering_sector $target
		if ($hops < $closest_hops)
			setvar $closest_hops $hops
			setvar $closest_hit $last_entering_sector
		end
		if ($last_entering_sector <> $target)
			send "c v" $last_entering_sector "* q "
			setvar $voids[$last_entering_sector] true
			getdistance $chk_adj $current_sector $last_entering_sector
			if ($chk_adj = 1)
				add $adj_avoid_count 1
			end
			#				waitFor "will now be avoided in"
			goto :enter_probe_sector
		else
			gosub :write_unreachable
			goto :next_probe_cycle
		end
	else
		goto :next_probe_cycle
	end
end
if ($probe_enters = 0)
	setvar $record_text[$count1] currentline
	getwordpos $record_text[$count1] $traders "Traders :"
	getwordpos $record_text[$count1] $aliens "w/"
	getwordpos $record_text[$count1] $ships "Ships   :"
	getwordpos $record_text[$count1] $planets "Planets :"
	getwordpos $record_text[$count1] $class0 "Class 0 (Special)"
	getwordpos $record_text[$count1] $feds "Federals:"
	getwordpos $record_text[$count1] $sector_rpt_test "Sector  :"
	if ($sector_rpt_test > 0)
		getword $record_text[$count1] $sector_id 3
	end
	if ($traders > 0) or ($aliens > 0) or ($ships > 0) or ($planets > 0) or ($class0 > 0) or ($feds > 0)
		if ($sector_reported[$sector_id] = 0)
			setvar $found_something "TRUE"
			setvar $sector_reported[$sector_id] 1
		end
	end
	add $count1 1
	settextlinetrigger read_line :read_line
	pause
else
	if ($probe_enters > 0)
		getword currentline $last_entering_sector 5
	end
	if ($found_something = "TRUE")
		gosub :build_path_report
	end
	goto :start_probe_recording
end

#	subtract $have_probes 1
goto :enter_probe_sector

:build_path_report
add $found_rpts 1
setvar $count2 1
while ($count2 <= ($count1 - 2))
	setvar $path_report[$count3] $record_text[$count2]
	add $count2 1
	add $count3 1
end
return

:send_path_report
if ($verbose = "YES")
	setvar $count2 1
	send "'*Probing Sector " $target " Report:*"
	while ($count2 <= $count3)
		getlength $path_report[$count2] $length
		if ($path_report[$count2] = 0) or ($length = 0)
			setvar $path_report[$count2] " "
		end
		send $path_report[$count2] "*"
		add $count2 1
	end
	send "*"
end
setvar $count2 1
while ($count2 <= $count3)
	getlength $path_report[$count2] $length
	if ($path_report[$count2] = 0) or ($length = 0)
		setvar $path_report[$count2] " "
	end
	write $filename2 $path_report[$count2]
	add $count2 1
end
#	waitFor "Sub-space comm-link terminated"
return

:buy_probes
send "p s h "
if ($probe_cost = 0)
	send "e"
	waitfor "We sell them for"
	getword currentline $probe_cost 5
	striptext $probe_cost ","
	savevar $probe_cost
else
	send "e "
end
waitfor "How many Probes do you want (Max"
getword currentline $max_buy 8
striptext $max_buy ")"
setvar $buy_probes (($have_credits - $minimum_credits) / $probe_cost)
if ($buy_probes > $max_buy)
	setvar $buy_probes $max_buy
end
send $buy_probes "* q q"
subtract $have_credits ($buy_probes * $probe_cost)
add $have_probes $buy_probes
return

:write_unreachable
if ($closest_hops = 999)
	write $filename1 $target&"         None Recorded (Voided Route)"
else
	setvar $write_line $target
	getlength $target $length1
	setvar $space_loop (14 - $length1)
	setvar $space_counter 1
	while ($space_counter <= $space_loop)
		mergetext $write_line " " $write_line
		add $space_counter 1
	end
	mergetext $write_line $closest_hit $write_line
	getlength $closest_hit $length2
	setvar $space_loop (27 - ($length1 + $length2 + $space_counter))
	setvar $space_counter 1
	while ($space_counter <= $space_loop)
		mergetext $write_line " " $write_line
		add $space_counter 1
	end
	if ($closest_hops >= 0)
		mergetext $write_line $closest_hops $write_line
	else
		mergetext $write_line "(No ZTM Data)" $write_line
	end
	write $filename1 $write_line
end
add $unreachable 1
return

:end
setvar $last_probe 0
savevar $last_probe
echo ansi_10&"**Probing Completed:*"
echo ansi_13&"Probes used: " ansi_14&$probes_used ansi_13&" while trying to reach: " ansi_14&$target_count ansi_13&" sectors.*"
echo ansi_10&"*You found: " ansi_14&$unreachable ansi_10&" Unreachable Sectors *"
echo ansi_13&"Saved as: " ansi_14&$filename1 "*"
echo ansi_10&"*You found: " ansi_14&$found_rpts ansi_10&" Sectors with Traders, Aliens, Planets, Class 0's, Fed's, etc. *"
echo ansi_13&"Saved as: " ansi_14&$filename2 "*"
halt

####################################################################################################
:target_file_maintenance
setvar $last_probe 0
savevar $last_probe
setvar $targetfile $bot~folder&"/"&gamename&"_Probe_Targets.txt"
fileexists $exists $targetfile
if ($exists = true)
	delete $targetfile
end
return

####################################################################################################
:convert_date
setvar $date ($year * 365)
if ($month = "1")
	add $date $day
elseif ($month = "2")
	add $date (31 + $day)
elseif ($month = "3")
	add $date (59 + $day)
elseif ($month = "4")
	add $date (90 + $day)
elseif ($month = "5")
	add $date (121 + $day)
elseif ($month = "6")
	add $date (152 + $day)
elseif ($month = "7")
	add $date (182 + $day)
elseif ($month = "8")
	add $date (213 + $day)
elseif ($month = "9")
	add $date (244 + $day)
elseif ($month = "10")
	add $date (274 + $day)
elseif ($month = "11")
	add $date (305 + $day)
elseif ($month = "12")
	add $date (335 + $day)
end
return

####################################################################################################
:build_de_range_file
setvar $de_count 0
setarray $de_sort sectors
setvar $max_range 0
setvar $sector_index 1
echo ansi_10&"**Sorting Deadends by Range From StarDock:*"
echo ansi_13&"This may take few minutes to complete but it only has to run once.*" ansi_14&"Please be patient.*"
while ($sector_index <= sectors)
	if (sector.warpcount[$sector_index] = 1) or (sector.warpincount[$sector_index] = 1)
		getdistance $range stardock $sector_index
		if ($range = 0)
			echo ansi_12&"**ZTM Error: " ansi_14&"Stardock Range cannot be a Zero.*"
			halt
		end
		setvar $de_sort[$sector_index] $range
		if ($range > $max_range)
			setvar $max_range $range
		end
		add $de_count 1
	end
	add $sector_index 1
end
setvar $range_sort_number $max_range
while ($range_sort_number > 0)
	setvar $sector_index 1
	while ($sector_index <= sectors)
		if ($de_sort[$sector_index] = $range_sort_number)
			write $de_range_file $sector_index&"  "&$range_sort_number
		end
		add $sector_index 1
	end
	subtract $range_sort_number 1
end
echo ansi_10&"**Sorting Results: " ansi_13&$de_count ansi_10&" Deadends Found, Max Range is: " ansi_14&$max_range ansi_10&" hops from Dock.*"
echo ansi_10&"Complete results saved in file: " ansi_14&$de_range_file "*"

return

####################################################################################################
:build_all_range_file
setarray $all_sort sectors
setvar $max_range 0
setvar $sector_index 1
echo ansi_10&"**Sorting All Sectors by Range From StarDock:*"
echo ansi_13&"This may take few minutes to complete but it only has to run once.*" ansi_14&"Please be patient.*"
while ($sector_index <= sectors)
	getdistance $range stardock $sector_index
	if ($range = 0) and ($sector_index <> stardock)
		echo ansi_12&"**ZTM Error: " ansi_14&"Terra Range cannot be a Zero.*"
		halt
	end
	setvar $all_sort[$sector_index] $range
	if ($range > $max_range)
		setvar $max_range $range
	end
	add $sector_index 1
	#		echo "."
end
setvar $range_sort_number $max_range
while ($range_sort_number > 0)
	#		echo "."
	setvar $sector_index 1
	while ($sector_index <= sectors)
		if ($all_sort[$sector_index] = $range_sort_number)
			write $all_range_file $sector_index&"  "&$range_sort_number
		end
		add $sector_index 1
	end
	subtract $range_sort_number 1
end
echo ansi_10&"*Sorting Completed, the maximum range is: " ansi_14&$max_range ansi_10&" hops from Dock.*"
echo ansi_10&"Complete results saved in file: " ansi_14&$all_range_file "*"
return

#########  Record Void List #############################################################
:record_voids
setvar $voidcount 0
send "c xq"
waitfor "<List Avoided Sectors>"
settextlinetrigger readline :read_void_line
pause

:read_void_line
setvar $wordcount 1
setvar $line_text currentline
while ($wordcount <= 11)
	getword $line_text $sector $wordcount
	isnumber $number $sector
	if ($number = false)
		goto :done_voids
	elseif ($sector > 0)
		setvar $voids[$sector] true
		add $voidcount 1
	end
	add $wordcount 1
end

:void_triggers
settextlinetrigger readline :read_void_line
pause

:done_voids
echo ansi_10&"**You have a total of: " ansi_14&$voidcount ansi_10&" sectors voided.**"
return

include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\switchboard.ts"
