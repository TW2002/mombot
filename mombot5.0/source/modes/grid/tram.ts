gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"    Ram gridder for mombot based on LoneStar's chains algorithm"
setvar $help~help[2]  $help~tab&"    Uses chain selection first, then falls back to single sectors."
setvar $help~help[3]  $help~tab&"    Best when there are clusters of adjacent unfigged sectors."
setvar $help~help[4]  $help~tab&"    REFRESH FIG LIST!"
setvar $help~help[5]  $help~tab&"    "
setvar $help~help[6]  $help~tab&"    tram [stop_turns] [stop_fighters] {saveme} {quiet} {burst:n}"
setvar $help~help[7]  $help~tab&"       "
setvar $help~help[8]  $help~tab&" Options:"
setvar $help~help[9]  $help~tab&"    "
setvar $help~help[10]  $help~tab&"   [stop_turns]     stop when you get to these turns "
setvar $help~help[11]  $help~tab&"   [stop_fighters]  stop when you get to these fighters"
setvar $help~help[12]  $help~tab&"   {saveme}  when gridder is stuck it will call saveme to be safe"
setvar $help~help[13]  $help~tab&"   {quiet}   suppress running Total Gridded / Efficiency messages"
setvar $help~help[14] $help~tab&"   {burst:n} number of macros to burst at once, default 4"
setvar $help~help[15] $help~tab&"                   "

gosub :help~helpfile

setvar $switchboard~message "Train Ram Gridder - Jump Aboard the Choo Choo! starting up!*"
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
setvar $final_density_report ansi_12&"Tram Chain Gridder Density Report:*"
setvar $final_density_found_count 0

:load_settings
killalltriggers
setvar $minimum_turns 0
setvar $minimum_figs 0
setvar $saveme 0
setvar $quiet 0
setvar $burst_size 4
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

setvar $token_index 1
getword $bot~user_command_line $token $token_index
while ($token <> 0)
	if ($token = "burst")
		getword $bot~user_command_line $burst_value ($token_index + 1)
		isnumber $test $burst_value
		if ($test)
			setvar $burst_size $burst_value
		end
	else
		getwordpos $token $pos "burst:"
		if ($pos = 1)
			setvar $burst_value $token
			replacetext $burst_value "burst:" ""
			isnumber $test $burst_value
			if ($test)
				setvar $burst_size $burst_value
			end
		end
	end
	add $token_index 1
	getword $bot~user_command_line $token $token_index
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
if ($burst_size < 1)
	setvar $switchboard~message "Burst size must be a number from 1 to 10.*"
	gosub :switchboard~switchboard
	halt
elseif ($burst_size > 10)
	setvar $burst_size 10
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
setvar $switchboard~message "Tram Chain Gridder starting in a few seconds...*"
gosub :switchboard~switchboard
if ($unlim = true)
	setvar $switchboard~message "Unlimited turn game detected. Stopping at " & $minimum_figs & " fighters.*"
else
	setvar $switchboard~message "Stopping at "& $minimum_turns & " turns and " & $minimum_figs & " fighters.*"
end
gosub :switchboard~switchboard
setvar $switchboard~message "Burst size set to " & $burst_size & " macros per batch.*"
gosub :switchboard~switchboard
if ($saveme = 1)
	setvar $switchboard~message "I will call SAVE ME when stuck!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "SAVEME NOT IN USE!!!*"
	gosub :switchboard~switchboard
end

#setDelayTrigger delay :wait 500
#pause
#:wait
#killalltriggers
:start_gridding
if ($unlim = true)
	send "'Tram Chain Gridder starting in unlimited mode*"
else
	send "'Tram Chain Gridder starting for " ($have_turns - $minimum_turns) " turns*"
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

send "'Tram: Gridder podded / stuck in sector: " $focus_sector "*"
waitfor "Message sent on sub-space channel"
echo ansi_12&"***WARNING:" ansi_14&" PODDED / STUCK *"

:ended_early_cant_find_ztm
:end
gosub :echo_final_density_report
send "'*Gridding Complete, Fig'd: " $total_targets " new sectors at: " $efficiency "% efficiency.*I have: " $have_turns " turns and " $have_figs " figs remaining.**"
halt

:build_array
setarray $target_sector 10
setarray $result_distance 10
setarray $macro $burst_size
setarray $macro_path sectors
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
while ($count1 <= $burst_size) and ($projected_turns > $minimum_turns)
	setvar $using_chain false
	setvar $focus_sector 0
	gosub :get_near_chain
	if ($chain_found = true)
		setvar $using_chain true
		setvar $focus_sector $chain_target
		setvar $target_sector[$count1] $chain_target
		setvar $result_distance[$count1] $path_length
	else
		gosub :breadth_unfigged_search
		if ($target_sector[$count1] > 0)
			setvar $focus_sector $target_sector[$count1]
		end
	end

	if ($focus_sector <= 0)
		if ($built_macros = 0)
			setvar $switchboard~message "No more reachable unfigged sectors from: " & $player~current_sector & "*"
			gosub :switchboard~switchboard
			setvar $no_more_targets true
		end
		return
	end
	add $macro_hops $result_distance[$count1]
	setvar $projected_turns ($projected_turns - ($ship_tpw * $result_distance[$count1]))
	if ($projected_turns > $minimum_turns)
		setvar $final_sector $focus_sector
		setvar $macro[$count1] ""
		if ($using_chain = true)
			setvar $step_count 1
			setvar $last_step false
			while ($step_count <= $path_length)
				setvar $next_sector $macro_path[$step_count]
				if ($step_count = $path_length)
					setvar $last_step true
				end
				gosub :build_move_macro_routine
				setvar $macro[$count1] $macro[$count1]&$macro_text
				add $step_count 1
			end
			setvar $previous_sector $focus_sector
			add $built_macros 1
			add $total_targets $newgrid
			add $total_hops $result_distance[$count1]
		else
			getcourse $route $previous_sector $focus_sector
			if ($route <= 0)
				setvar $hit_turn_limit true
				return
			end
			setvar $result_distance[$count1] $route
			setarray $gridded_sectors $route
			setvar $step_count 2
			setvar $last_step false
			while ($step_count <= ($route + 1))
				setvar $next_sector $route[$step_count]
				if ($step_count = ($route + 1))
					setvar $last_step true
				end
				gosub :build_move_macro_routine
				setvar $macro[$count1] $macro[$count1]&$macro_text
				add $step_count 1
			end
			setvar $previous_sector $focus_sector
			add $built_macros 1
			add $total_targets 1
			add $total_hops $route
		end
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
gosub :get_current_prompt_sector
if ($prompt_sector > 0)
	setvar $focus_sector $prompt_sector
	setvar $player~current_sector $prompt_sector
end
if ($focus_sector <> $final_sector)
	if ($focus_sector > 10)
		if ($player~current_prompt = "Citadel")
			send "q q "
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
			gosub :get_current_prompt_sector
			if ($prompt_sector > 0)
				setvar $focus_sector $prompt_sector
				setvar $player~current_sector $prompt_sector
			end
		elseif ($player~current_prompt = "Planet")
			send "q "
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
			gosub :get_current_prompt_sector
			if ($prompt_sector > 0)
				setvar $focus_sector $prompt_sector
				setvar $player~current_sector $prompt_sector
			end
		elseif ($player~current_prompt = "Computer")
			send "q"
			gosub :player~quikstats
			setvar $focus_sector $player~current_sector
			gosub :get_current_prompt_sector
			if ($prompt_sector > 0)
				setvar $focus_sector $prompt_sector
				setvar $player~current_sector $prompt_sector
			end
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
:get_near_chain
setvar $chain_found false
setvar $newgrid 0
setvar $path_length 0
setvar $sizeof_chain 4
setarray $nearest 0
getnearestwarps $nearest $previous_sector
setvar $nearest_limit $nearest
if ($nearest_limit > 600)
	setvar $nearest_limit 600
end

while ($sizeof_chain > 0) and ($chain_found = false)
	gosub :scan_near_chain_size
	if ($chain_found = false)
		subtract $sizeof_chain 1
	end
end
return

:scan_near_chain_size
setvar $newgrid 0
setvar $path_length 0

setvar $n 0
while ($n < $nearest_limit) and ($chain_found = false)
	add $n 1
	setvar $ptr $nearest[$n]
	if ($ptr <= 10) or ($ptr = stardock) or ($ptr = $previous_sector) or ($fig_grid[$ptr] > 0)
		# Skip non-griddable or already-figged sectors.
	else
		setvar $chain $ptr
		setvar $links 0
		setvar $temp $ptr
		while ($temp <> 0)
			setvar $adj 1
			while ($adj <= sector.warpcount[$temp])
				setvar $test sector.warps[$temp][$adj]
				getwordpos (" " & $chain & " ") $pos (" " & $test & " ")
				if ($fig_grid[$test] = 0) and ($pos = 0) and ($test > 10) and ($test <> stardock) and (sector.warpcount[$test] > 0) and (sector.warpincount[$test] > 0)
					setvar $temp $test
					goto :scan_near_chain_got_link
				end
				add $adj 1
			end
			setvar $temp 0

			:scan_near_chain_got_link
			if ($temp <> 0)
				setvar $chain ($chain & " " & $temp)
				add $links 1
			end
		end

		if ($links >= $sizeof_chain)
			setvar $chain_start $ptr
			getword $chain $chain_target ($links + 1)
			setvar $score $links
			setvar $newgrid $links
			setvar $path_length 0

			getcourse $course $previous_sector $chain_start
			if ($course > 0)
				setvar $j 1
				while ($j <= $course)
					add $j 1
					add $path_length 1
					setvar $macro_path[$path_length] $course[$j]
					if ($fig_grid[$course[$j]] > 0)
						subtract $score 1
					else
						add $newgrid 1
					end
				end

				setvar $chain_path_overlap false
				setvar $j 2
				while ($j <= ($links + 1)) and ($chain_path_overlap = false)
					getword $chain $path_test_sector $j
					gosub :path_contains_sector
					if ($path_contains = true)
						setvar $chain_path_overlap true
					end
					add $j 1
				end

				if ($score >= $sizeof_chain) and ($chain_path_overlap = false)
					setvar $j 2
					while ($j <= ($links + 1))
						add $path_length 1
						getword $chain $var $j
						setvar $macro_path[$path_length] $var
						add $j 1
					end
					if ($path_length > 0)
						setvar $chain_found true
					end
				end
			end
		end
	end
end
return

###############################################################################
:get_current_prompt_sector
setvar $prompt_sector 0
getwordpos $player~full_current_prompt $pos "]:["
if ($pos > 0)
	gettext $player~full_current_prompt $prompt_sector "]:[" "]"
	isnumber $test $prompt_sector
	if ($test = 0)
		setvar $prompt_sector 0
	end
end
return

:path_contains_sector
setvar $path_contains false
setvar $path_scan 1
while ($path_scan <= $path_length)
	if ($macro_path[$path_scan] = $path_test_sector)
		setvar $path_contains true
		return
	end
	add $path_scan 1
end
return

###############################################################################
:breadth_unfigged_search
setvar $search_require_warpin true
gosub :breadth_unfigged_search_pass
if ($target_sector[$count1] <= 0)
	# If warp-in data is incomplete, allow a second pass that still
	# grids reachable sectors instead of stopping immediately.
	setvar $search_require_warpin false
	gosub :breadth_unfigged_search_pass
end
return

:breadth_unfigged_search_pass
setarray $search_que 0
setarray $search_flagged 0
setarray $distance 0
setvar $search_start $previous_sector
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
			if ($fig_grid[$adj_search_test] = 0) and ($adj_search_test <> stardock) and ($adj_search_test > 10) and (sector.warpcount[$adj_search_test] > 0)
				if ($search_require_warpin = false) or (sector.warpincount[$adj_search_test] > 0)
					setvar $target_sector[$count1] $adj_search_test
					setvar $result_distance[$count1] $distance[$adj_search_test]
					#                             echo ANSI_10&"*Target sector: " ANSI_14&$target_sector[$count1] ANSI_10&"  Distance: " ANSI_14&$result_distance[$count1] "*"
					return
				end
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
setvar $macro_text "m "&$next_sector
setvar $last_mode "Charge"
if ($next_sector > 10) and ($next_sector <> stardock) and ($next_sector <> $stardock)
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
	if ($next_sector <= 10)
		setvar $passesfed "TRUE"
	else
		setvar $passesdock "TRUE"
	end
end

add $path_sector_count 1
setvar $path_sectors[$path_sector_count] $next_sector
if ($next_sector > 0)
	setvar $fig_grid[$next_sector] 1
end
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
	send "'Tram: No Strange Density's to Report.*"
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
