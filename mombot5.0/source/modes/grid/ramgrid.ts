gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"    Rammars Legendary gridder converted to mombot"
setvar $help~help[2]  $help~tab&"    No more sectors have been gridded than with this... "
setvar $help~help[3]  $help~tab&"    No more players have died using it... "
setvar $help~help[4]  $help~tab&"    REFRESH FIG LIST!"
setvar $help~help[5]  $help~tab&"    "
setvar $help~help[6]  $help~tab&"    ramgrid [stop_turns] [stop_fighters] {saveme} {quiet}"
setvar $help~help[7]  $help~tab&"       "
setvar $help~help[8]  $help~tab&" Options:"
setvar $help~help[9]  $help~tab&"    "
setvar $help~help[10]  $help~tab&"   [stop_turns]     stop when you get to these turns "
setvar $help~help[11]  $help~tab&"   [stop_fighters]  stop when you get to these fighters"
setvar $help~help[12]  $help~tab&"   {saveme}  when gridder is stuck it will call saveme to be safe"
setvar $help~help[13]  $help~tab&"   {quiet}   suppress running Total Gridded / Efficiency messages"
setvar $help~help[14] $help~tab&"                   "

gosub :help~helpfile

setvar $switchboard~message "Rammar's Unfigged Gridder starting up!*"
gosub :switchboard~switchboard

gosub :player~quikstats
setvar $unlim $player~unlimitedgame

if ($player~photons > 0)
	setvar $switchboard~message "Yeah Nah, we don't do this with photons.*"
	gosub :switchboard~switchboard
	halt
end
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "Must start at command prompt.*"
	gosub :switchboard~switchboard
	halt

end

gosub :load_fig_array

:build_initial_density_report_data
loadvar $bot~folder
setvar $density_file $bot~folder&"/"&gamename&"-Density_Reports.txt"
getdate $date
gettime $time "h:nn:ss am/pm"
fileexists $exists $density_file
if ($exists = false)
	write $density_file "Sector   Density   NavHaz   Filtered    Time         Date"
end
setvar $final_density_report ansi_12&"Ram Unfigged Gridder Density Report:*"
setvar $final_density_found_count 0

:load_settings
killalltriggers
setvar $minimum_turns 0
setvar $minimum_figs 0
setvar $saveme 0
setvar $quiet 0
setarray $numeric 3
setvar $numericcount 0

getword $bot~user_command_line $bot~parm1 1
getword $bot~user_command_line $bot~parm2 2
getword $bot~user_command_line $bot~parm3 3

getwordpos " "&$bot~user_command_line&" " $pos " saveme "
if ($pos > 0)
	setvar $saveme 1
end
getwordpos " "&$bot~user_command_line&" " $pos " quiet "
if ($pos > 0)
	setvar $quiet 1
end

isnumber $test $bot~parm1
if ($test)
	add $numericcount 1
	setvar $numeric[$numericcount] $bot~parm1
end
isnumber $test $bot~parm2
if ($test)
	add $numericcount 1
	setvar $numeric[$numericcount] $bot~parm2
end
isnumber $test $bot~parm3
if ($test)
	add $numericcount 1
	setvar $numeric[$numericcount] $bot~parm3
end

if ($unlim = true)
	if ($numericcount >= 1)
		setvar $minimum_figs $numeric[1]
	else
		setvar $switchboard~message "Stop Fighters must be a number greater than 49!.*"
		gosub :switchboard~switchboard
		halt
	end
else
	if ($numericcount >= 1)
		setvar $minimum_turns $numeric[1]
	else
		setvar $switchboard~message "Stop Turns must be a number greater than zero!.*"
		gosub :switchboard~switchboard
		halt
	end
end

if ($minimum_figs = 0)
	if ($numericcount >= 2)
		setvar $minimum_figs $numeric[2]
	else
		setvar $switchboard~message "Stop Fighters must be a number greater than 49!.*"
		gosub :switchboard~switchboard
		halt
	end
elseif ($minimum_figs < 50)
	setvar $switchboard~message "Stop Fighters must be a number greater than 49!.*"
	gosub :switchboard~switchboard
	halt
end
if (stardock = 0)
	send "V"
	waitfor "The StarDock is located in sector "
	getword currentline $map~stardock 7
	striptext $map~stardock "."
	savevar $map~stardock
	waitfor "Command [TL="
end

:get_initial_info
gosub :player~quikstats

setvar $have_turns  $player~turns
setvar $have_figs $player~fighters
if ($have_turns = 0)
	send "I"
	waitfor "Turns left     :"
	getword currentline $unlim 4
	if ($unlim = "Unlimited")
		setvar $unlim true
		setvar $have_turns 65520
		#               echo "**Unlim game detected! *"
	end
end
send "C;q"
settextlinetrigger 1 :read_turns_per_warp "Turns Per Warp:"
settextlinetrigger 2 :read_max_attack_figs "Max Figs Per Attack:"
pause

:read_turns_per_warp
gettext currentline $ship_tpw "Turns Per Warp:" "Defensive Odds:"
getword $ship_tpw $ship_tpw 1
pause

:read_max_attack_figs
getword currentline $max_attack_figs 5
striptext $max_attack_figs ","
#     echo ANSI_10&"**Ship TPW: " ANSI_14&$ship_TPW "*" ANSI_10&"Max Attack Figs: " ANSI_14&$max_attack_figs "*"
waitfor "Command [TL="

:warn_gridding
setvar $switchboard~message "Ram Nearest Unfigged Gridder starting in a few seconds...*"
gosub :switchboard~switchboard
if ($unlim = true)
	setvar $switchboard~message "Unlimited turn game detected. Stopping at " & $minimum_figs & " fighters.*"
else
	setvar $switchboard~message "Stopping at "& $minimum_turns & " turns and " & $minimum_figs & " fighters.*"
end
gosub :switchboard~switchboard
if ($saveme = 1)
	setvar $switchboard~message "I will call SAVE ME when stuck!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "SAVEME NOT IN USE!!!*"
	gosub :switchboard~switchboard
end

setdelaytrigger delay :wait 5000
pause

:wait
killalltriggers

:start_gridding
if ($unlim = true)
	send "'Ram Nearest Unfigged Gridder Starting in unlimited mode*"
else
	send "'Ram Nearest Unfigged Gridder Starting for " ($have_turns - $minimum_turns) " turns*"
end
setvar $total_targets 0
setvar $total_hops 0

:outer_gridding_loop
while ($have_figs > $minimum_figs) and ($hit_turn_limit = false)
	setvar $no_more_targets false
	gosub :build_array
	if ($no_more_targets = true)
		goto :end
	end
	gosub :send_macros
	gosub :verify_end_of_run
	gosub :update_density_scan_report
end
goto :end

:ended_early
gosub :player~quikstats
setvar $focus_sector $player~current_sector
send "r * * "
if ($saveme = 1)
	gosub :callsaveme
	halt
end

send "'Ram-Grid: Gridder Podded / Stuck in sector: " $focus_sector "*"
waitfor "Message sent on sub-space channel"
echo ansi_12&"***WARNING:" ansi_14&" PODDED / STUCK *"

:ended_early_cant_find_ztm
:end
gosub :echo_final_density_report
send "'*Gridding Complete, Fig'd: " $total_targets " new sectors at: " $efficiency "% efficiency.*I have: " $have_turns " turns and " $have_figs " figs remaining.**"
halt

:build_array
#     gosub :player~quikstats

setarray $target_sector 10
setarray $result_distance 10
setarray $macro 10
setarray $path_sectors 0
setvar $path_sector_count 0
setvar $macro_hops 0
setvar $count1 1
setvar $built_macros 0
setvar $hit_turn_limit false
setvar $focus_sector $player~current_sector
setvar $previous_sector $player~current_sector
setvar $final_sector $player~current_sector
setvar $projected_turns  $player~turns
if ($player~unlimitedgame = true)
	setvar $projected_turns 65520
end
while ($count1 <= 10) and ($projected_turns > $minimum_turns)
	setvar $attempted_ztm_fix false
	gosub :breadth_unfigged_search
	if ($target_sector[$count1] <= 0)
		if ($built_macros = 0)
			setvar $switchboard~message "No more reachable unfigged sectors from: " & $player~current_sector & "*"
			gosub :switchboard~switchboard
			setvar $no_more_targets true
		end
		return
	end
	#          send "'target #" $count1 " is: " $target_sector[$count1] "*"
	setvar $focus_sector $target_sector[$count1]
	setvar $fig_grid[$focus_sector] 1

	add $macro_hops $result_distance[$count1]
	setvar $projected_turns ($projected_turns - ($ship_tpw * $result_distance[$count1]))
	if ($projected_turns > $minimum_turns)
		getcourse $path $previous_sector $focus_sector
		setvar $previous_sector $focus_sector
		setvar $final_sector $focus_sector
		setarray $gridded_sectors $path
		setvar $step_count 2
		setvar $last_step false
		setvar $macro[$count1] ""
		while ($step_count <= ($result_distance[$count1] + 1))
			setvar $next_sector $path[$step_count]
			if ($step_count = ($result_distance[$count1] + 1))
				setvar $last_step true
			end
			gosub :build_move_macro_routine
			setvar $macro[$count1] $macro[$count1]&$macro_text
			add $step_count 1
		end
		add $built_macros 1
		add $total_targets 1
		add $total_hops $result_distance[$count1]
		#		     echo ANSI_10&"*Macro #" $count1 ": " $macro[$count1] "*"
	else
		setvar $hit_turn_limit true
	end
	add $count1 1
end
return

:send_macros
setvar $count2 1
while ($count2 <= $built_macros)
	send $macro[$count2]
	add $count2 1
end
gosub :display_window_contents
return

:verify_end_of_run
gosub :player~quikstats
if ($unlim = true)
	setvar $have_turns 65520
else
	setvar $have_turns  $player~turns
end
setvar $have_figs $player~fighters
setvar $focus_sector $player~current_sector
if ($focus_sector <> $final_sector)
	if ($focus_sector > 10)
		if ($player~current_prompt = "Citadel")
			send "q q "
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
		elseif ($player~current_prompt = "Planet")
			send "q "
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
		elseif ($player~current_prompt = "Computer")
			send "q"
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
		end
	end
	if ($focus_sector > 10)
		setvar $switchboard~message "Route ended in " & $focus_sector & " instead of " & $final_sector & ". Resuming from current sector.*"
		gosub :switchboard~switchboard
		return
	end
	goto :ended_early
end
return

#### UPDATE TO LOAD FIG LSIT FROM MOMBOT - HAMMER #####
:load_fig_array
setvar $sector_count 0
setarray $fig_grid sectors

setvar $fig_indexer 1
while ($fig_indexer <= sectors)

	getsectorparameter $fig_indexer "FIGSEC" $isfigged
	if ($isfigged = true)
		setvar $fig_grid[$fig_indexer] 1
		add $sector_count 1
	else
		setvar $fig_grid[$fig_indexer] 0
	end

	add $fig_indexer 1
end
return

###############################################################################
:breadth_unfigged_search
setarray $search_que 0
setarray $search_flagged 0
setarray $distance 0
setvar $search_start $focus_sector
setvar $search_bottom 1
setvar $search_top 1
setvar $search_que[1] $search_start
setvar $search_flagged[$search_start] 1
setvar $distance[$search_start] 0

while ($search_bottom <= $search_top)
	#          echo ANSI_10&"*Search Top: " $search_top "  Search Bottom: " $search_bottom "*"
	setvar $search_focus $search_que[$search_bottom]
	setvar $a 1
	while ($a <= sector.warpcount[$search_focus])
		setvar $adj_search_test sector.warps[$search_focus][$a]
		if ($search_flagged[$adj_search_test] = 0)
			setvar $distance[$adj_search_test] ($distance[$search_focus] + 1)
			#                   echo ANSI_10&"*Now testing: " $adj_search_test "*"
			if ($fig_grid[$adj_search_test] = 0) and ($adj_search_test <> stardock) and ($adj_search_test > 10) and (sector.warpcount[$adj_search_test] > 0) and (sector.warpincount[$adj_search_test] > 0)
				setvar $target_sector[$count1] $adj_search_test
				setvar $result_distance[$count1] $distance[$adj_search_test]
				#                         echo ANSI_10&"*Target sector: " ANSI_14&$target_sector[$count1] ANSI_10&"  Distance: " ANSI_14&$result_distance[$count1] "*"
				return
			end
			setvar $search_flagged[$adj_search_test] 1
			add $search_top 1
			setvar $search_que[$search_top] $adj_search_test
		end
		add $a 1
	end
	add $search_bottom 1
end

setvar $target_sector[$count1] "0"
setvar $result_distance[$count1] "0"
return

#########  BUILD MACRO ROUTINE ################################################
:build_move_macro_routine
setvar $macro_text "m "&$path[$step_count]
setvar $last_mode "Charge"
if ($path[$step_count] > 10) and ($path[$step_count] <> stardock) and ($path[$step_count] <> $stardock)
	mergetext $macro_text "* z a 9999 * *" $macro_text
	#          setVar $DE_check $path[$step_Count]
	#		if (SECTOR.WARPCOUNT[$DE_check] = 1) AND (SECTOR.WARPINCOUNT[$DE_check] = 1)
	#			mergeText $macro_Text "f z 3 * z c z d * " $macro_Text
	#		else
	mergetext $macro_text "f z 1 * z c z d * " $macro_text
	#		end
	if ($player~scan_type = "Dens")
		mergetext $macro_text "s" $macro_text
	elseif ($player~scan_type = "Holo")
		mergetext $macro_text "s d" $macro_text
	end
else
	mergetext $macro_text "* * " $macro_text
	if ($player~scan_type = "Dens")
		mergetext $macro_text "s" $macro_text
	elseif ($player~scan_type = "Holo")
		mergetext $macro_text "s d" $macro_text
	end
	if ($path[$step_count] <= 10)
		setvar $passesfed "TRUE"
	else
		setvar $passesdock "TRUE"
	end
end

add $path_sector_count 1
setvar $path_sectors[$path_sector_count] $path[$step_count]
return

###############################################################################
:display_window_contents
setprecision 10
setvar $efficiency (($total_targets / $total_hops) * 100)
round $efficiency 2
setprecision 0

setvar $window_text "Total Gridded: "&$total_targets&" Efficiency: "&$efficiency&"%*  "
setvar $count3 1
while ($count3 <= $built_macros)
	# setVar $window_text $window_text&" "&$target_sector[$count3]&" "
	add $count3 1
end

if ($quiet <> 1)
	send "'" $window_text "* "
end
return

####################################################################################################
:update_density_scan_report
#     echo "**Checking Density Loop**"
setvar $count6 1
setvar $density_found_count 0
while ($count6 <= $path_sector_count)
	setvar $path_sector $path_sectors[$count6]
	#          echo "Path Sector is: " $path_sector "*"
	setvar $density_loops sector.warpcount[$path_sector]
	setvar $count7 1
	while ($count7 <= $density_loops)
		setvar $test_sector sector.warps[$path_sector][$count7]
		#		     echo "Examining Sector: " $test_sector "*"
		if ($test_sector > 10) and ($test_sector <> stardock) and ($density_checked[$test_sector] = 0)
			if (sector.density[$test_sector] = 38) or (sector.density[$test_sector] = 40) or (sector.density[$test_sector] = 43) or (sector.density[$test_sector] = 45) or (sector.density[$test_sector] = 78) or (sector.density[$test_sector] = 80) or (sector.density[$test_sector] = 85) or (sector.density[$test_sector] = 138) or (sector.density[$test_sector] = 140) or (sector.density[$test_sector] = 143) or (sector.density[$test_sector] = 145) or (sector.density[$test_sector] = 178) or (sector.density[$test_sector] = 180) or (sector.density[$test_sector] = 185) or (sector.density[$test_sector] > 200)
				send "'Unusual Density Sector: "&$test_sector&"  Density: "&sector.density[$test_sector]&"  Nav Haz: "&sector.navhaz[$test_sector]&"%  Filtered: "&(sector.density[$test_sector] - (21 * sector.navhaz[$test_sector]))&"*"
				mergetext $final_density_report ansi_10&"Sector: "&ansi_14&$test_sector&ansi_10&"  Density: "&ansi_14&sector.density[$test_sector]&ansi_10&"  NavHaz: "&ansi_12&sector.navhaz[$test_sector]&ansi_10&"%  Filtered: "&ansi_14&(sector.density[$test_sector] - (21 * sector.navhaz[$test_sector]))&"*" $final_density_report
				write $density_file $test_sector & "        " & sector.density[$test_sector] & "       " & sector.navhaz[$test_sector] & "        " & (sector.density[$test_sector] - (21 * sector.navhaz[$test_sector])) & "     " & $time & "    " & $date
				add $density_found_count 1
				add $final_density_found_count 1
			end
			setvar $density_checked[$test_sector] 1
		end
		add $count7 1
	end
	add $count6 1
end
#	echo "Found Density's: " $density_found_Count "**"
return

:echo_final_density_report
if ($final_density_found_count > 0)
	echo "**" $final_density_report "*"
	echo ansi_13&"Report logged in: " ansi_14&$density_file "*"
else
	send "'Ram-Grid: No Strange Density's to Report.*"
	waitfor "Message sent on sub-space channel"
	echo ansi_10&"**No Strange Density's to Report.*"
end
return

:callsaveme
send "q q q q * '"&$switchboard~bot_name&" call*"

return

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
