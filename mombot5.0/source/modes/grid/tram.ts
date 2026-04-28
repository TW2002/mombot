gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"    Ram gridder for mombot based on LoneStar's chains algorithm"
	setVar $BOT~help[2]  $BOT~tab&"    Uses chain selection first, then falls back to single sectors."
	setVar $BOT~help[3]  $BOT~tab&"    Best when there are clusters of adjacent unfigged sectors."
	setVar $BOT~help[4]  $BOT~tab&"    REFRESH FIG LIST!"
	setVar $BOT~help[5]  $BOT~tab&"    "
		setVar $BOT~help[6]  $BOT~tab&"    tram [stop_turns] [stop_fighters] {saveme} {quiet}"
	setVar $BOT~help[7]  $BOT~tab&"       "
	setVar $BOT~help[8]  $BOT~tab&" Options:"
	setVar $BOT~help[9]  $BOT~tab&"    "
	setVar $BOT~help[10]  $BOT~tab&"   [stop_turns]     stop when you get to these turns "
	setVar $BOT~help[11]  $BOT~tab&"   [stop_fighters]  stop when you get to these fighters"
		setVar $BOT~help[12]  $BOT~tab&"   {saveme}  when gridder is stuck it will call saveme to be safe"
		setVar $BOT~help[13]  $BOT~tab&"   {quiet}   suppress running Total Gridded / Efficiency messages"
		setVar $BOT~help[14] $BOT~tab&"                   "
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Tram Chain Gridder"
	gosub :BOT~banner

	gosub :player~quikstats
	setVar $UNLIM $PLAYER~UNLIMITEDGAME

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must start at command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt

	end	

	goSub :load_Fig_Array
	
:Build_Initial_Density_Report_Data
     setVar $Density_File GAMENAME&"-Density_Reports.txt"
	getDate $date
	getTime $time "h:nn:ss am/pm"
	fileExists $exists $Density_File
	if ($exists = FALSE)
		write $Density_File "Sector   Density   NavHaz   Filtered    Time         Date"
	end
	setVar $final_Density_Report ANSI_12&"Tram Chain Gridder Density Report:*"
	setVar $final_Density_Found_Count 0

	:Load_Settings
		killAllTriggers
			setVar $minimum_turns 0
			setVar $minimum_figs 0
			setVar $saveme 0
			setVar $quiet 0
			setArray $numeric 3
			setVar $numericCount 0

		getWord $bot~user_command_line $bot~parm1 1
		getWord $bot~user_command_line $bot~parm2 2
		getWord $bot~user_command_line $bot~parm3 3

		getwordpos " "&$bot~user_command_line&" " $pos " saveme "
		if ($pos > 0)
			setVar $saveme 1
		end
		getwordpos " "&$bot~user_command_line&" " $pos " quiet "
		if ($pos > 0)
			setVar $quiet 1
		end

		isNumber $test $bot~parm1
		if ($test)
			add $numericCount 1
			setVar $numeric[$numericCount] $bot~parm1
		end
		isNumber $test $bot~parm2
		if ($test)
			add $numericCount 1
			setVar $numeric[$numericCount] $bot~parm2
		end
		isNumber $test $bot~parm3
		if ($test)
			add $numericCount 1
			setVar $numeric[$numericCount] $bot~parm3
		end

		if ($UNLIM = TRUE)
			if ($numericCount >= 1)
				setVar $minimum_figs $numeric[1]
			else
				setVar $SWITCHBOARD~message "Stop Fighters must be a number greater than 49!.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			if ($numericCount >= 1)
				setVar $minimum_turns $numeric[1]
			else
				setVar $SWITCHBOARD~message "Stop Turns must be a number greater than zero!.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end

		if ($minimum_figs = 0)
			if ($numericCount >= 2)
				setVar $minimum_figs $numeric[2]
			else
				setVar $SWITCHBOARD~message "Stop Fighters must be a number greater than 49!.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
	elseif ($minimum_figs < 50)
		setVar $SWITCHBOARD~message "Stop Fighters must be a number greater than 49!.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
		if (STARDOCK = 0)
		send "V"
		waitFor "The StarDock is located in sector "
		getWord CURRENTLINE $map~stardock 7
		stripText $map~stardock "."
		savevar $map~stardock
		waitFor "Command [TL="
	end

:Get_Initial_Info
     gosub :player~quikstats
    
     setVar $have_turns  $player~TURNS
     setVar $have_figs $player~FIGHTERS
     if ($have_turns = 0)
          send "I"
          waitFor "Turns left     :"
          getWord CURRENTLINE $Unlim 4
          if ($Unlim = "Unlimited")
               setVar $Unlim TRUE
               setVar $have_turns 65520
#               echo "**Unlim game detected! *"
          end
     end
     send "C;q"
     setTextLineTrigger 1 :Read_Turns_Per_Warp "Turns Per Warp:"
     setTextLineTrigger 2 :Read_Max_Attack_Figs "Max Figs Per Attack:"
     pause

:Read_Turns_Per_Warp
     getText CURRENTLINE $ship_TPW "Turns Per Warp:" "Defensive Odds:"
     getWord $ship_TPW $ship_TPW 1
     pause

:Read_Max_Attack_Figs
     getWord CURRENTLINE $max_attack_figs 5
     stripText $max_attack_figs ","
#     echo ANSI_10&"**Ship TPW: " ANSI_14&$ship_TPW "*" ANSI_10&"Max Attack Figs: " ANSI_14&$max_attack_figs "*"
     waitFor "Command [TL="

:Warn_Gridding
	setVar $SWITCHBOARD~message "Tram Chain Gridder starting in a few seconds...*"
	gosub :SWITCHBOARD~switchboard
	if ($UNLIM = TRUE)
		setVar $SWITCHBOARD~message "Unlimited turn game detected. Stopping at " & $minimum_figs & " fighters.*"
	else
		setVar $SWITCHBOARD~message "Stopping at "& $minimum_turns & " turns and " & $minimum_figs & " fighters.*"
	end
	gosub :SWITCHBOARD~switchboard
	if ($saveme = 1)
		setVar $SWITCHBOARD~message "I will call SAVE ME when stuck!*"
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "SAVEME NOT IN USE!!!*"
		gosub :SWITCHBOARD~switchboard
	end
	
	setDelayTrigger delay :wait 5000
	pause
	:wait
	killalltriggers

:Start_Gridding

     if ($UNLIM = TRUE)
          send "'Tram Chain Gridder starting in unlimited mode*"
     else
          send "'Tram Chain Gridder starting for " ($have_turns - $minimum_turns) " turns*"
     end
     setVar $total_targets 0
     setVar $total_hops 0

:Outer_Gridding_Loop
     while ($have_figs > $minimum_figs) AND ($hit_turn_limit = FALSE)
          setVar $no_more_targets FALSE
          goSub :Build_Array
          if ($no_more_targets = TRUE)
               goto :End
          end
          goSub :Send_Macros
          goSub :Verify_End_Of_Run
          goSub :Update_Density_Scan_Report
     end
     goto :End

:Ended_Early
	     gosub :player~quikstats
	     setVar $focus_sector $player~CURRENT_SECTOR
	     send "r * * "
		if ($saveme = 1)
			gosub :callSaveMe
			halt
	end
 
        send "'Tram: Gridder podded / stuck in sector: " $focus_sector "*"
	waitFor "Message sent on sub-space channel"
	echo ANSI_12&"***WARNING:" ANSI_14&" PODDED / STUCK *"
:Ended_Early_Cant_Find_ZTM
	
:End
     goSub :Echo_Final_Density_Report
     send "'*Gridding Complete, Fig'd: " $total_targets " new sectors at: " $efficiency "% efficiency.*I have: " $have_turns " turns and " $have_figs " figs remaining.**"
     halt


:Build_Array
     setArray $target_sector 10
     setArray $result_distance 10
     setArray $macro 10
     setArray $Path_sectors 0
     setVar $path_sector_count 0
     setVar $macro_hops 0
     setVar $count1 1
     setVar $built_macros 0
     setVar $hit_turn_limit FALSE
     setVar $focus_sector $player~CURRENT_SECTOR
     setVar $previous_sector $player~CURRENT_SECTOR
     setVar $final_sector $player~CURRENT_SECTOR
     setVar $projected_Turns  $player~TURNS
     if ($player~unlimitedGame = TRUE)
          setVar $projected_Turns 65520
     end
     while ($count1 <= 10) AND ($projected_Turns > $minimum_turns)
          setVar $using_chain FALSE
          setVar $focus_sector 0
          goSub :Get_Near_Chain
          if ($chain_found = TRUE)
               setVar $using_chain TRUE
               setVar $focus_sector $chain_target
               setVar $target_sector[$count1] $chain_target
               setVar $result_distance[$count1] $path_length
          else
               goSub :Breadth_UnFigged_Search
               if ($target_sector[$count1] > 0)
                    setVar $focus_sector $target_sector[$count1]
               end
          end

          if ($focus_sector <= 0)
               if ($built_macros = 0)
                    setVar $SWITCHBOARD~message "No more reachable unfigged sectors from: " & $player~CURRENT_SECTOR & "*"
                    gosub :SWITCHBOARD~switchboard
                    setVar $no_more_targets TRUE
               end
               return
          end
          add $macro_hops $result_distance[$count1]
          setVar $projected_Turns ($projected_turns - ($ship_TPW * $result_Distance[$count1]))
          if ($projected_Turns > $minimum_turns)
               setVar $final_sector $focus_sector
               setVar $macro[$count1] ""
               if ($using_chain = TRUE)
                    setVar $step_Count 1
                    setVar $last_step FALSE
                    while ($step_Count <= $path_length)
                         setVar $next_Sector $path[$step_Count]
                         if ($step_Count = $path_length)
                              setVar $last_step TRUE
                         end
                         goSub :Build_Move_Macro_Routine
                         setVar $macro[$count1] $macro[$count1]&$macro_text
                         add $step_Count 1
                    end
                    setVar $previous_sector $focus_sector
                    add $built_macros 1
                    add $total_targets $newgrid
                    add $total_hops $result_Distance[$count1]
               else
                    getCourse $path $previous_sector $focus_sector
                    setArray $gridded_sectors $path
		          setVar $step_Count 2
		          setVar $last_step FALSE
		          while ($step_Count <= ($result_distance[$count1] + 1))
			          setVar $next_Sector $path[$step_Count]
                         if ($step_Count = ($result_distance[$count1] + 1))
                              setVar $last_step TRUE
			          end
			          goSub :Build_Move_Macro_Routine
			          setVar $macro[$count1] $macro[$count1]&$macro_text
			          add $step_Count 1
		          end
                    setVar $previous_sector $focus_sector
                    add $built_macros 1
                    add $total_targets 1
                    add $total_hops $result_Distance[$count1]
               end
          else
                setVar $hit_turn_limit TRUE
          end
          add $count1 1
     end
     Return

:Send_Macros
     setVar $count2 1
     while ($count2 <= $built_macros)
          send $macro[$count2]
          add $count2 1
     end
     goSub :Display_Window_Contents
     Return

:Verify_End_Of_Run
	     gosub :player~quikstats
	     if ($unlim = TRUE)
	          setVar $have_turns 65520
	     else
          setVar $have_turns  $player~TURNS
	     end
	     setVar $have_figs $player~FIGHTERS
	     setVar $focus_sector $player~CURRENT_SECTOR
	     gosub :Get_Current_Prompt_Sector
	     if ($prompt_sector > 0)
	          setVar $focus_sector $prompt_sector
	     end
	     if ($focus_sector <> $final_sector)
	          if ($focus_sector > 10)
	               if ($PLAYER~CURRENT_PROMPT = "Citadel")
	                    send "q q "
	                    gosub :player~quikstats
	                    setVar $focus_sector $player~CURRENT_SECTOR
	                    gosub :Get_Current_Prompt_Sector
	                    if ($prompt_sector > 0)
	                         setVar $focus_sector $prompt_sector
	                    end
	               elseif ($PLAYER~CURRENT_PROMPT = "Planet")
	                    send "q "
	                    gosub :player~quikstats
	                    setVar $focus_sector $player~CURRENT_SECTOR
	                    gosub :Get_Current_Prompt_Sector
	                    if ($prompt_sector > 0)
	                         setVar $focus_sector $prompt_sector
	                    end
	               elseif ($PLAYER~CURRENT_PROMPT = "Computer")
	                    send "q"
	                    gosub :player~quikstats
	                    setVar $focus_sector $player~CURRENT_SECTOR
	                    gosub :Get_Current_Prompt_Sector
	                    if ($prompt_sector > 0)
	                         setVar $focus_sector $prompt_sector
	                    end
	               end
	          end
	          if ($focus_sector > 10)
	               setVar $SWITCHBOARD~message "Route ended in " & $focus_sector & " instead of " & $final_sector & ". Resuming from current sector.*"
	               gosub :SWITCHBOARD~switchboard
	               return
	          end
	          goto :Ended_Early
	     end
	     Return



#### UPDATE TO LOAD FIG LSIT FROM MOMBOT - HAMMER #####

:load_Fig_Array
	setVar $Sector_Count 0
	setArray $fig_Grid SECTORS

	setVar $fig_indexer 1
	while ($fig_indexer <= SECTORS)
		
		getSectorParameter $fig_indexer "FIGSEC" $isFigged
		if ($isFigged = true)
			setVar $fig_grid[$fig_indexer] 1
			add $sector_count 1
		else
			setVar $fig_grid[$fig_indexer] 0
		end
		
		add $fig_indexer 1
	end
	Return
	


###############################################################################

:Get_Near_Chain
     setVar $chain_found FALSE
     setVar $newgrid 0
     setVar $path_length 0
     setVar $SIZEOF_CHAIN 4

     while ($SIZEOF_CHAIN > 0) AND ($chain_found = FALSE)
          goSub :Scan_Near_Chain_Size
          if ($chain_found = FALSE)
               subtract $SIZEOF_CHAIN 1
          end
     end
     return

:Scan_Near_Chain_Size
     setArray $nearest 0
     setVar $newgrid 0
     setVar $path_length 0

     getnearestwarps $nearest $previous_sector

     setVar $n 0
     while ($n < $nearest) AND ($chain_found = FALSE)
          add $n 1
          setVar $PTR $nearest[$n]
          if ($PTR <= 10) OR ($PTR = STARDOCK) OR ($PTR = $previous_sector) OR ($fig_grid[$PTR] > 0)
               # Skip non-griddable or already-figged sectors.
          else
               setVar $CHAIN $PTR
               setVar $LINKS 0
               setVar $TEMP $PTR
               while ($TEMP <> 0)
                    setVar $ADJ 1
                    while ($ADJ <= SECTOR.WARPCOUNT[$TEMP])
                         setVar $test SECTOR.WARPS[$TEMP][$ADJ]
                         getWordPos (" " & $CHAIN & " ") $POS (" " & $test & " ")
                         if ($fig_grid[$test] = 0) AND ($POS = 0) AND ($test > 10) AND ($test <> STARDOCK) AND (SECTOR.WARPCOUNT[$test] > 0) AND (SECTOR.WARPINCOUNT[$test] > 0)
                              setVar $TEMP $test
                              goto :Scan_Near_Chain_Got_Link
                         end
                         add $ADJ 1
                    end
                    setVar $TEMP 0
                    :Scan_Near_Chain_Got_Link
                    if ($TEMP <> 0)
                         setVar $CHAIN ($CHAIN & " " & $TEMP)
                         add $LINKS 1
                    end
               end

               if ($LINKS >= $SIZEOF_CHAIN)
                    setVar $chain_start $PTR
                    getWord $CHAIN $chain_target ($LINKS + 1)
                    setVar $score $LINKS
                    setVar $newgrid $LINKS
                    setVar $path_length 0

                    getCourse $course $previous_sector $chain_start
                    setVar $j 1
                    while ($j <= $course)
                         add $j 1
                         add $path_length 1
                         setVar $path[$path_length] $course[$j]
                         if ($fig_grid[$course[$j]] > 0)
                              subtract $score 1
                         else
                              add $newgrid 1
                         end
                    end

                    setVar $chain_path_overlap FALSE
                    setVar $j 2
                    while ($j <= ($LINKS + 1)) AND ($chain_path_overlap = FALSE)
                         getWord $CHAIN $path_test_sector $j
                         gosub :Path_Contains_Sector
                         if ($path_contains = TRUE)
                              setVar $chain_path_overlap TRUE
                         end
                         add $j 1
                    end

                    if ($score >= $SIZEOF_CHAIN) AND ($chain_path_overlap = FALSE)
                         setVar $j 2
                         while ($j <= ($LINKS + 1))
                              add $path_length 1
                              getWord $CHAIN $var $j
                              setVar $path[$path_length] $var
                              add $j 1
                         end
                         if ($path_length > 0)
                              setVar $chain_found TRUE
                         end
                    end
               end
          end
     end
     return
	



###############################################################################

:Get_Current_Prompt_Sector
     setVar $prompt_sector 0
     getWordPos $PLAYER~FULL_CURRENT_PROMPT $pos "]:["
     if ($pos > 0)
          getText $PLAYER~FULL_CURRENT_PROMPT $prompt_sector "]:[" "]"
          isNumber $test $prompt_sector
          if ($test = 0)
               setVar $prompt_sector 0
          end
     end
     return

:Path_Contains_Sector
     setVar $path_contains FALSE
     setVar $path_scan 1
     while ($path_scan <= $path_length)
          if ($path[$path_scan] = $path_test_sector)
               setVar $path_contains TRUE
               return
          end
          add $path_scan 1
     end
     return


###############################################################################

:Breadth_UnFigged_Search
     
     setArray $search_que 0
     setArray $search_Flagged 0
     setArray $distance 0
	setVar $search_start $focus_sector
	setVar $search_bottom 1
	setVar $search_top 1
	setVar $search_que[1] $search_start
	setVar $search_flagged[$search_start] 1
	setVar $distance[$search_start] 0

     while ($search_bottom <= $search_top)
#          echo ANSI_10&"*Search Top: " $search_top "  Search Bottom: " $search_bottom "*"
          setVar $search_focus $search_que[$search_bottom]
          setVar $a 1
          while ($a <= SECTOR.WARPCOUNT[$search_focus])
               setVar $adj_search_test SECTOR.WARPS[$search_Focus][$a]
               if ($search_flagged[$adj_search_test] = 0)
                    setVar $distance[$adj_search_test] ($distance[$search_focus] + 1)
#                   echo ANSI_10&"*Now testing: " $adj_search_test "*"
                    if ($fig_grid[$adj_search_test] = 0) AND ($adj_search_test <> STARDOCK) AND ($adj_search_test > 10) AND (SECTOR.WARPCOUNT[$adj_search_test] > 0) AND (SECTOR.WARPINCOUNT[$adj_search_test] > 0)
                         setVar $target_sector[$count1] $adj_search_test
                         setVar $result_distance[$count1] $distance[$adj_search_test]
#                         echo ANSI_10&"*Target sector: " ANSI_14&$target_sector[$count1] ANSI_10&"  Distance: " ANSI_14&$result_distance[$count1] "*"
                         return
                    end
                    setVar $search_flagged[$adj_search_test] 1
                    add $search_top 1
                    setVar $search_que[$search_top] $adj_search_test
               end
               add $a 1
          end
          add $search_bottom 1
     end

     setVar $target_sector[$count1] "0"
     setVar $result_distance[$count1] "0"
     return
     
#########  BUILD MACRO ROUTINE ################################################
:Build_Move_Macro_Routine
     setVar $macro_Text "m "&$next_sector
	setVar $last_mode "Charge"
	if ($next_sector > 10) AND ($next_sector <> STARDOCK) AND ($next_sector <> $stardock)
		mergeText $macro_Text "* z a 9999 * *" $macro_Text
#          setVar $DE_check $path[$step_Count]
#		if (SECTOR.WARPCOUNT[$DE_check] = 1) AND (SECTOR.WARPINCOUNT[$DE_check] = 1)
#			mergeText $macro_Text "f z 3 * z c z d * " $macro_Text
#		else
		mergeText $macro_Text "f z 1 * z c z d * " $macro_Text
#		end
		if ($player~SCAN_TYPE = "Dens")
              mergeText $macro_Text "s" $macro_Text
          elseIf ($player~SCAN_TYPE = "Holo")
			mergeText $macro_Text "s d" $macro_Text
		end
	else
		mergeText $macro_Text "* * " $macro_Text
		if ($player~SCAN_TYPE = "Dens")
              mergeText $macro_Text "s" $macro_Text
          elseIf ($player~SCAN_TYPE = "Holo")
			mergeText $macro_Text "s d" $macro_Text
		end
		if ($next_sector <= 10)
			setVar $passesFed "TRUE"
		else
			setVar $passesDock "TRUE"
		end
	end

     add $path_sector_count 1
     setVar $Path_sectors[$path_sector_count] $next_sector
     if ($next_sector > 0)
          setVar $fig_grid[$next_sector] 1
     end
	Return
	
###############################################################################
:Display_Window_Contents
     setPrecision 10
     setVar $efficiency (($total_targets / $total_hops) * 100)
     round $efficiency 2
     setPrecision 0
    
     setVar $window_text "Total Gridded: "&$total_targets&" Efficiency: "&$efficiency&"%*  "
      setVar $count3 1
     while ($count3 <= $built_macros)
         # setVar $window_text $window_text&" "&$target_sector[$count3]&" "
          add $count3 1
     end

	     if ($quiet <> 1)
	          send "'" $window_text "* "
	     end
	     return


	
####################################################################################################
	:Update_Density_Scan_Report
	#     echo "**Checking Density Loop**"
	     setVar $count6 1
	     setVar $density_found_Count 0
	     while ($count6 <= $path_sector_count)
          setVar $path_Sector $Path_sectors[$count6]
#          echo "Path Sector is: " $path_sector "*"
		setVar $density_loops SECTOR.WARPCOUNT[$path_Sector]
          setVar $count7 1
		while ($count7 <= $density_loops)
		     setVar $test_sector SECTOR.WARPS[$path_Sector][$count7]
#		     echo "Examining Sector: " $test_sector "*"
		     if ($test_sector > 10) AND ($test_sector <> STARDOCK) AND ($density_checked[$test_sector] = 0)
	                    if (SECTOR.DENSITY[$test_sector] = 38) OR (SECTOR.DENSITY[$test_sector] = 40) OR (SECTOR.DENSITY[$test_sector] = 43) OR (SECTOR.DENSITY[$test_sector] = 45) OR (SECTOR.DENSITY[$test_sector] = 78) OR (SECTOR.DENSITY[$test_sector] = 80) OR (SECTOR.DENSITY[$test_sector] = 85) OR (SECTOR.DENSITY[$test_sector] = 138) OR (SECTOR.DENSITY[$test_sector] = 140) OR (SECTOR.DENSITY[$test_sector] = 143) OR (SECTOR.DENSITY[$test_sector] = 145) OR (SECTOR.DENSITY[$test_sector] = 178) OR (SECTOR.DENSITY[$test_sector] = 180) OR (SECTOR.DENSITY[$test_sector] = 185) OR (SECTOR.DENSITY[$test_sector] > 200)
	                          send "'Unusual Density Sector: "&$test_sector&"  Density: "&SECTOR.DENSITY[$test_sector]&"  Nav Haz: "&SECTOR.NAVHAZ[$test_sector]&"%  Filtered: "&(SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector]))&"*"
	                          mergeText $Final_Density_Report ANSI_10&"Sector: "&ANSI_14&$test_sector&ANSI_10&"  Density: "&ANSI_14&SECTOR.DENSITY[$test_sector]&ANSI_10&"  NavHaz: "&ANSI_12&SECTOR.NAVHAZ[$test_sector]&ANSI_10&"%  Filtered: "&ANSI_14&(SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector]))&"*" $Final_Density_Report
					      write $Density_File $test_sector & "        " & SECTOR.DENSITY[$test_sector] & "       " & SECTOR.NAVHAZ[$test_sector] & "        " & (SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector])) & "     " & $time & "    " & $date
					      add $density_found_Count 1
					      add $final_density_found_count 1
			       end
			       setVar $density_checked[$test_sector] 1
		     end
               add $count7 1
          end
		add $count6 1
	end
	#	echo "Found Density's: " $density_found_Count "**"
	 	Return

:Echo_Final_Density_Report
     if ($final_Density_found_count > 0)
          echo "**" $final_density_report "*"
          echo ANSI_13&"Report logged in: " ANSI_14&$Density_File "*"
     else
          send "'Tram: No Strange Density's to Report.*"
          waitFor "Message sent on sub-space channel"
          echo ANSI_10&"**No Strange Density's to Report.*"
     end
     return
     

:callSaveMe
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
	
	return


#INCLUDES:
include "source\include\bot"
include "source\include\player"
