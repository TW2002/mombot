	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]    $HELP~TAB&"probe - based on Rammar's Ether Prober, adapted for MomBot by Shadow"
	setVar $HELP~HELP[2]    $HELP~TAB&"       "
	setVar $HELP~HELP[2]    $HELP~TAB&"    Sends repeated ether probes to map and discover sectors, ports, etc.
	setVar $HELP~HELP[2]    $HELP~TAB&"    Will buy additional probes at dock if specified and at dock."
	setVar $HELP~HELP[2]    $HELP~TAB&"       "
	setVar $HELP~HELP[3]    $HELP~TAB&"     {ewarp}  - Will refurb torps and atomics by ewarp "
	setVar $HELP~HELP[4]    $HELP~TAB&"                This is NOT safe."
	setVar $HELP~HELP[5]    $HELP~TAB&"       "
	setVar $HELP~HELP[6]    $HELP~TAB&"   {create:}  - List of planet types to make.  First word"
	setVar $HELP~HELP[7]    $HELP~TAB&"                of planet types separated by commas and no spaces."
	setVar $HELP~HELP[8]    $HELP~TAB&"                Default will use keeper planets in preferences."
	setVar $HELP~HELP[9]    $HELP~TAB&"                "
	setVar $HELP~HELP[10]   $HELP~TAB&"{custom name} - Name the planet will be.  Otherwise it's a random   "
	setVar $HELP~HELP[11]   $HELP~TAB&"                name from a database              "
	setVar $HELP~HELP[12]   $HELP~TAB&"                              "
	setVar $HELP~HELP[13]   $HELP~TAB&"      Examples:                   "
	setVar $HELP~HELP[14]   $HELP~TAB&"            >makeplanet create:earth,volcanic,oceanic "
	setVar $HELP~HELP[15]   $HELP~TAB&"            >makeplanet ewarp create:earth         "
	setVar $HELP~HELP[16]   $HELP~TAB&"            >makeplanet "&#34&"death"&#34&" create:volcanic "
	setVar $HELP~HELP[17]   $HELP~TAB&"                              "
	setVar $HELP~HELP[18]   $HELP~TAB&"               - Originally written by Xide"
	gosub :HELP~HELPFILE

# Checks to make sure you're at the command prompt.
	cutText CURRENTLINE $location 1 7
	if ($location <> "Command")
		clientMessage "This script must be run from the Command prompt!"
    	halt
	end
	getText CURRENTLINE $current_Sector "]:[" "] (?="
	loadVar $probe_cost
	loadVar $last_probe
	loadVar $last_Mode
	setVar $adj_Sector_Count SECTOR.WARPCOUNT[$current_sector]
	setVar $adj_avoid_count 0
#	setArray $adj_Avoids $adj_Sector_count
	setArray $sector_Reported SECTORS
	setArray $target_list SECTORS
	setVar $probes_used 0
	setVar $unreachable 0
	setVar $found_rpts 0

:Load_Settings
	loadVar $ProbeSettings
	
	if ($ProbeSettings)
		loadVar $verbose
		loadVar $restock_Probes
		loadVar $minimum_Credits
	else
		setVar $Verbose "YES"
		setVar $restock_Probes "YES"
		setVar $minimum_credits 50000

		saveVar $verbose
		saveVar $restock_Probes
		saveVar $minimum_Credits

		setVar $ProbeSettings 1
		saveVar $ProbeSettings
	end

	#if ($current_Sector <> STARDOCK)
	#	setVar $restock_probes "NO"
	#end
	
:Build_Menu
	addMenu "" "Prober" "*" "." "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" FALSE
#	addMenu "Prober" "StartProbing" ANSI_13&"Go!"&ANSI_10&" - "&ANSI_14&"Start Probing" "G" :Get_Initial_Info "" TRUE
	addMenu "Prober" "Verbose" ANSI_10&"Report Findings on SubSpace "&ANSI_13&"("&ANSI_14&"Traders"&ANSI_13&","&ANSI_14&"Planets"&ANSI_13&","&ANSI_14&"etc"&ANSI_13&")    " "1" :Menu_Verbose "" FALSE
	addMenu "Prober" "Restock" ANSI_10&"Restock Probes from Stardock "&ANSI_13&"("&ANSI_14&"Only if at Dock"&ANSI_13&")       " "2" :Menu_Restock_Probes "" FALSE
	addMenu "Prober" "MinCredits" ANSI_10&"Minimum Credit Level                                 " "3" :Menu_Minimum_Credits "" FALSE
	addMenu "Prober" "Deadend_Menu" ANSI_11&"MENU: "&ANSI_10&"Deadend Options "&ANSI_13&"("&ANSI_14&"All"&ANSI_13&", "&ANSI_14&"Unexplored"&ANSI_13&", "&ANSI_14&"Range"&ANSI_13&", "&ANSI_14&"Date"&ANSI_13&")" "4" "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" TRUE
	addMenu "Prober" "Random_Menu" ANSI_11&"MENU: "&ANSI_10&"Random Probing Options "&ANSI_13&"("&ANSI_14&"All"&ANSI_13&", "&ANSI_14&"Unexplored"&ANSI_13&")" "5" "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" TRUE
	addMenu "Prober" "Range_Menu" ANSI_11&"MENU: "&ANSI_10&"Terra Range Search "&ANSI_13&"("&ANSI_14&"X"&ANSI_13&" Hops with"&ANSI_14&" Y "&ANSI_13&"warps)" "6" "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" TRUE
	addMenu "Prober" "UseFile" ANSI_13&"RUN: "&ANSI_15&"Using a File for Input " "7" :Input_filename "" FALSE
	addMenu "Prober" "UnExplored" ANSI_13&"RUN: "&ANSI_15&"All UnExplored Sectors" "8" :Run_Unexplored "" FALSE
	addMenu "Prober" "Class0" ANSI_13&"RUN: "&ANSI_15&"Class 0 Search - "&ANSI_13&"("&ANSI_14&"Unexplored Only"&ANSI_13&")" "9" :Run_Class0 "" FALSE
	if ($last_probe > 0)
		addMenu "Prober" "Resume" ANSI_13&"RUN: "&ANSI_14&"Resume "&ANSI_10&"Last Probe List" "R" :Run_Resume "" FALSE
	end

	addMenu "" "Deadend_Menu" ANSI_10&"Dead End Probing Options" "." "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" FALSE
	addMenu "Deadend_Menu" "All_DEs" ANSI_13&"RUN: "&ANSI_14&"All Deadends" "1" :Run_All_DEs "" FALSE
	addMenu "Deadend_Menu" "Unexplored_DEs" ANSI_13&"RUN: "&ANSI_14&"Unexplored Deadends -"&ANSI_10&" In Sequential Order" "2" :Run_Unexplored_DEs_Numerical "" FALSE
	addMenu "Deadend_Menu" "Unexplored_DEs" ANSI_13&"RUN: "&ANSI_14&"Unexplored Deadends -"&ANSI_10&" Most Distant Sectors First" "3" :Run_Unexplored_DEs_Distant "" FALSE
	addMenu "Deadend_Menu" "TerraRange_DEs" ANSI_13&"RUN: "&ANSI_14&"Hops From Terra Deadends "&ANSI_10&"(All Matches)" "4" :Run_TerraRange_DEs "" FALSE
	addMenu "Deadend_Menu" "LastSeen_DEs" ANSI_13&"RUN: "&ANSI_14&"Last Seen More Than "&ANSI_10&"X"&ANSI_14&" Days Ago "&ANSI_10&"(All Matches)" "5" :Run_LastSeen_DEs "" FALSE



	addMenu "" "Random_Menu" ANSI_10&"Dead End Probing Options" "." "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" FALSE
	addMenu "Random_Menu" "All_Random" ANSI_13&"RUN: "&ANSI_14&"True Random"&ANSI_10&" ("&ANSI_13&"Explored"&ANSI_10&" and "&ANSI_13&"Unexplored"&ANSI_10&")" "1" :Run_True_Random "" FALSE
	addMenu "Random_Menu" "Unexplored_Random" ANSI_13&"RUN: "&ANSI_14&"Unexplored Random"&ANSI_10&" ("&ANSI_13&"Unexplored Only"&ANSI_10&")" "2" :Run_Unexplored_Random "" FALSE

	addMenu "" "Range_Menu" ANSI_10&"Terra Range Search Options" "." "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" FALSE
	addMenu "Range_Menu" "All_Range" ANSI_13&"RUN: "&ANSI_14&"All Range Matches"&ANSI_10&" ("&ANSI_13&"Explored"&ANSI_10&" and "&ANSI_13&"Unexplored"&ANSI_10&")" "1" :Run_True_Range "" FALSE
	addMenu "Range_Menu" "Unexplored_Range" ANSI_13&"RUN: "&ANSI_14&"Unexplored Range Matches"&ANSI_10&" ("&ANSI_13&"Unexplored Only"&ANSI_10&")" "2" :Run_Unexplored_Range "" FALSE
	addMenu "Range_Menu" "LastSeen_Range"  ANSI_13&"RUN: "&ANSI_14&"Last Seen More Than "&ANSI_10&"X"&ANSI_14&" Days Ago "&ANSI_10&"(All Matches)" "3" :Run_LastSeen_Range "" FALSE


	gosub :sub_setMenu

:Title
	echo ANSI_9 "** ======== " ANSI_10&" RammaR's " ANSI_14&"Ether Prober 1.2  " ANSI_9&"========*"
	openMenu "Prober"

:Menu_Verbose
	if ($verbose = "YES")
		setVar $verbose "NO"
	else
		setVar $verbose "YES"
	end
	saveVar $verbose
	goSub :sub_SetMenu
	goto :Title

:Menu_Restock_Probes
	#if ($current_Sector <> STARDOCK)
	#	echo ANSI_12&"**You MUST be at Stardock to restock probes!*"
	#	setVar $restock_probes "NO"
	#elseIf ($restock_Probes = "YES")
	#	setVar $restock_probes "NO"
	#else
		setVar $restock_probes "YES"
	#end
	saveVar $restock_probes
	goSub :sub_SetMenu
	goto :Title

:Menu_Minimum_Credits
	if ($current_Sector <> STARDOCK)
		echo ANSI_12&"**You MUST be at Stardock to restock probes!*"
	else
		getInput $minimum_Credits ANSI_10&"*Stop buying probes with how many credits remaining?"
		isNumber $number $minimum_Credits
		if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Menu_Minimum_Credits
	end
	saveVar $minimum_Credits
	gosub :sub_SetMenu
	goto :Title
	end
	goSub :sub_SetMenu
	goto :Title

:sub_setMenu
	setMenuValue "Verbose" $Verbose
	if ($current_Sector <> STARDOCK)
		setMenuValue "Restock" "N/A"
		setMenuValue "MinCredits" "N/A"
	else
		setMenuValue "Restock" $restock_Probes
		setMenuValue "MinCredits" $minimum_Credits
	end
	Return


:Input_filename
	goSub :Target_File_Maintenance
	echo ANSI_13&"**Note: " ANSI_14&"Enter the name of the file that lists your Targets " ANSI_13&"(ex. "  ANSI_15&"deadends.txt" ANSI_13&")*" 
	getConsoleInput $filename
	fileExists $exists $filename
	if ($exists = FALSE)
		echo ANSI_13&"** Cannot find that file - Try again.*"
		goto :Input_filename
	else
		goto :Read_File
	end

:Read_File
	setVar $Line 1
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
:Read_next_line
	read $filename $read_sector $line
	getWord $read_sector $read_sector 1
	if ($read_sector <> "EOF")
		write $TargetFile $read_sector
#		setVar $target_list[$line] $read_sector
		add $line 1
		goto :read_next_line
	else
		subtract $line 1
		setVar $target_Count $line
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
		goto :Get_Initial_Info
	end

:Run_Unexplored
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
:Ask_ZTM_Complete
	echo ANSI_10&"**Is your ZTM Complete? <" ANSI_14&"y" ANSI_10&"/" ANSI_14&"n"
     getConsoleInput $ztm_Complete SINGLEKEY
     lowercase $ztm_Complete
     if ($ztm_complete <> "y") AND ($ztm_complete <> "n")
          echo ANSI_12&"**Bad Input - Try again*"
          goto :Ask_ZTM_Complete
     end
     if ($ztm_complete = "n")
          echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
          setVar $target_Count 0
          setVar $index 1
          while ($index <= SECTORS)
              if (SECTOR.EXPLORED[$index] <> "YES")
                  write $TargetFile $index
                  add $target_Count 1
              end
              add $index 1
          end
     else
     	setVar $All_Range_File GAMENAME&"_Sorted_Sectors.txt"
	     fileExists $exists $All_Range_File
	     if ($exists = FALSE)
		    goSub :Build_All_Range_File
	     end
	     setVar $target_Count 0
	     setVar $read_line 1
	     setVar $max_All_range 0
	     echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"

:Read_Next_All_Range_Line
	    read $All_Range_File $Text_line $read_line
	    if ($text_line <> "EOF")
		   getWord $text_Line $sector_index 1
		   if (SECTOR.EXPLORED[$sector_Index] <> "YES")
			  write $TargetFile $sector_index
			  add $target_Count 1
			  if ($max_All_range = 0)
				 getWord $text_Line $max_All_range 2
		 	  end
		   end
		   add $read_line 1
		   goto :Read_Next_All_Range_Line
	    end
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" You have Explored all targets.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_Class0
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 6) AND (SECTOR.BACKDOORCOUNT[$sector_index] > 0) AND (SECTOR.EXPLORED[$sector_Index] <> "YES")
#		if (SECTOR.WARPCOUNT[$sector_index] = 6) AND (SECTOR.BACKDOORCOUNT[$sector_index] > 0)
			write $TargetFile $sector_index
			add $target_Count 1
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" You have Explored all Class 0 Type sectors.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_All_DEs
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 1) OR (SECTOR.WARPINCOUNT[$sector_index] = 1)
			write $TargetFile $sector_index
			add $target_Count 1
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" Possible ZTM Error - No Deadends.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_Unexplored_DEs_Numerical
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 1) OR (SECTOR.WARPINCOUNT[$sector_index] = 1)
			if (SECTOR.EXPLORED[$sector_Index] <> "YES")
				write $TargetFile $sector_index
				add $target_Count 1
			end
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" You have explored all deadend sectors.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_Unexplored_DEs_Distant
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $DE_Range_File GAMENAME&"_Sorted_Deadends.txt"
	fileExists $exists $DE_Range_File
	if ($exists = FALSE)
		goSub :Build_DE_Range_File
	end
	setVar $target_Count 0
	setVar $read_line 1
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
:Read_Next_DE_Range_Line
	read $DE_Range_File $Text_line $read_line
	if ($text_line <> "EOF")
		getWord $text_Line $sector_index 1
		if (SECTOR.EXPLORED[$sector_Index] <> "YES")
			write $TargetFile $sector_index
			add $target_Count 1
			if ($max_DE_range = 0)
				getWord $text_Line $max_DE_range 2
		 	end
		end
		add $read_line 1
		goto :Read_Next_DE_Range_Line
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" You have explored all deadend sectors.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets, Starting with DE's at: " ANSI_14&$max_DE_Range ANSI_10&" hops.*"
 		goto :Get_Initial_info
	end	


:Run_TerraRange_DEs
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_terra_hops
	getInput $Hops ANSI_10&"***Enter the number of "&ANSI_14&"Hops"&ANSI_10&" from Terra:"
	isNumber $number $hops
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_terra_hops
	end	
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 1) OR (SECTOR.WARPINCOUNT[$sector_index] = 1)
			getDistance $distance 1 $sector_index
			if ($distance = $hops)
				write $TargetFile $sector_index
				add $target_Count 1
			end
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" There are no DE's at " ANSI_10&$hops ANSI_14&" from Terra.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_LastSeen_DEs
	closeMenu
	getTime $Day "d"
	getTime $Month "m"
	getTime $year "yyyy"
	goSub :convert_date
	setVar $current_date $date

	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_LastSeen_DEs
	getInput $Last_Seen_Days ANSI_10&"***Only probe sectors last seen "&ANSI_14&"AT LEAST"&ANSI_10&" how many days ago:"
	isNumber $number $Last_Seen_Days
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_LastSeen_DEs
	end	
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 1) OR (SECTOR.WARPINCOUNT[$sector_index] = 1)
			getSector $sector_index $sector_info
           	setVar $value $sector_info.updated
            getWord $value $date 1
			replaceText $value "/" " "
			getWord $value $month 1
			getWord $value $day 2
			getWord $value $year 3
			gosub :convert_date
  			setVar $Last_seen $date
			if (($current_date - $Last_seen) >= $Last_Seen_Days)
				write $TargetFile $sector_index
				add $target_Count 1
			end
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" You have seen all the DE's within " ANSI_10&$Last_Seen_Days ANSI_14&"-days.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_True_Random	
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_All_Random
	getInput $random_Count ANSI_10&"***How many "&ANSI_14&"Random Sectors"&ANSI_10&" do you want to probe:"
	isNumber $number $random_Count
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_All_Random
	end	
	setArray $Rnd_Targets SECTORS
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= $random_count)
		getRnd $random 1 SECTORS
		if ($Rnd_Targets[$random] <> 1) AND ($random <> STARDOCK)
			setVar $Rnd_Targets[$random] 1
			write $TargetFile $random
			add $sector_index 1
			add $target_Count 1
		end
	end	
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" Could not generate " ANSI_10&"Random" ANSI_14&" sector list.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end
	
:Run_Unexplored_Random
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_Unexplored_Random
	getInput $random_Count ANSI_10&"***How many "&ANSI_14&"Random Sectors"&ANSI_10&" do you want to probe:"
	isNumber $number $random_Count
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_Unexplored_Random
	end	
	setArray $Rnd_Targets SECTORS
	setVar $unExplored_Count 0
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if (SECTOR.EXPLORED[$sector_index] <> "YES")
			add $unExplored_Count 1
		end
		add $sector_index 1
	end
	if ($unexplored_count < $random_count)
		echo ANSI_12&"***Warning: " ANSI_15&"You only have " ANSI_13&$unexplored_count ANSI_15&" unexplored sectors.*"
		echo ANSI_13&"         Auto-reducing the number of probe targets.*"
		setVar $random_count $unexplored_count
	end
	setVar $sector_index 1
	while ($sector_index <= $random_count)
		getRnd $random 1 SECTORS
		if ($Rnd_Targets[$random] <> 1) AND ($random <> STARDOCK) AND (SECTOR.EXPLORED[$random] <> "YES")
			setVar $Rnd_Targets[$random] 1
			write $TargetFile $random
			add $sector_index 1
			add $target_Count 1
		end
	end	
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" Could not generate " ANSI_10&"Random" ANSI_14&" sector list.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_True_Range
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_All_Range
	getInput $range_hops ANSI_10&"***What "&ANSI_14&"Range from Terra"&ANSI_10&" do you want to probe:"
	isNumber $number $range_hops
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_All_Range
	end	
:Re_enter_All_Range_Warps
	getInput $range_warps ANSI_10&"***Probe sectors with how many "&ANSI_14&"Warps?"&ANSI_10&" ("&ANSI_13&"0 for all"&ANSI_10&"): "
	isNumber $number $range_warps
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_All_Range_Warps
	end	
	if ($range_warps > 6)
		echo ANSI_12&"*Bad Input - Must be 6 warps or less!*"
		goto :Re_enter_All_Range_Warps
	end 
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if ((SECTOR.WARPCOUNT[$sector_index] = $range_warps) OR ($range_warps = 0))
			getDistance $distance 1 $sector_index
			if ($distance = $range_hops)
				write $TargetFile $sector_index
				add $target_Count 1
			end
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" There are no " ANSI_10&$range_warps ANSI_14&"-warp sectors at " ANSI_10&$range_hops ANSI_14&" hops from Terra.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_Unexplored_Range
	closeMenu
	goSub :Target_File_Maintenance
	setVar $mode "Unexplored"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_Unexplored_Range
	getInput $range_hops ANSI_10&"***What "&ANSI_14&"Range from Terra"&ANSI_10&" do you want to probe:"
	isNumber $number $range_hops
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_Unexplored_Range
	end	
:Re_enter_Unexplored_Range_Warps
	getInput $range_warps ANSI_10&"***Probe sectors with how many "&ANSI_14&"Warps?"&ANSI_10&" ("&ANSI_13&"0 for all"&ANSI_10&"): "
	isNumber $number $range_warps
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_Unexplored_Range_Warps
	end	
	if ($range_warps > 6)
		echo ANSI_12&"*Bad Input - Must be 6 warps or less!*"
		goto :Re_enter_Unexplored_Range_Warps
	end 
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if ((SECTOR.WARPCOUNT[$sector_index] = $range_warps) OR ($range_warps = 0)) AND (SECTOR.EXPLORED[$sector_index] <> "YES")
			getDistance $distance 1 $sector_index
			if ($distance = $range_hops)
				write $TargetFile $sector_index
				add $target_Count 1
			end
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!" ANSI_14&" There are no " ANSI_10&$range_warps ANSI_14&"-warp sectors at " ANSI_10&$range_hops ANSI_14&" hops from Terra.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end

:Run_LastSeen_Range
	closeMenu
	getTime $Day "d"
	getTime $Month "m"
	getTime $year "yyyy"
	goSub :convert_date
	setVar $current_date $date

	goSub :Target_File_Maintenance
	setVar $mode "All"
	setVar $last_mode $mode
	saveVar $last_mode
	setVar $sector_index 1
	setVar $target_Count 0
:Re_enter_LastSeen_Range
	getInput $range_hops ANSI_10&"***What "&ANSI_14&"Range from Terra"&ANSI_10&" do you want to probe:"
	isNumber $number $range_hops
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_LastSeen_Range
	end	
:Re_enter_LastSeen_Range_Warps
	getInput $range_warps ANSI_10&"***Probe sectors with how many "&ANSI_14&"Warps?"&ANSI_10&" ("&ANSI_13&"0 for all"&ANSI_10&"): "
	isNumber $number $range_warps
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_LastSeen_Range_Warps
	end	
	if ($range_warps > 6)
		echo ANSI_12&"*Bad Input - Must be 6 warps or less!*"
		goto :Re_enter_LastSeen_Range_Warps
	end 
:Re_enter_LastSeen_Range
	getInput $Last_Seen_Days ANSI_10&"***Only probe sectors last seen "&ANSI_14&"AT LEAST"&ANSI_10&" how many days ago:"
	isNumber $number $Last_Seen_Days
	if ($number = FALSE)
		echo ANSI_12&"*Bad Input - Try again*"
		goto :Re_enter_LastSeen_Range
	end	
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
	while ($sector_index <= SECTORS)
		if ((SECTOR.WARPCOUNT[$sector_index] = $range_warps) OR ($range_warps = 0))
			getDistance $distance 1 $sector_index
			if ($distance = $range_hops)
				getSector $sector_index $sector_info
           		setVar $value $sector_info.updated
            	getWord $value $date 1
				replaceText $value "/" " "
				getWord $value $month 1
				getWord $value $day 2
				getWord $value $year 3
				gosub :convert_date
  				setVar $Last_seen $date
				if (($current_date - $Last_seen) >= $Last_Seen_Days)
					write $TargetFile $sector_index
					add $target_Count 1
				end
			end
			
		end
		add $sector_index 1
	end
	if ($target_Count = 0)
		echo ANSI_12&"** No Matching Targets Found!*" ANSI_14&" You have seen all of the " ANSI_10&$range_warps ANSI_14&"-warp sectors at " ANSI_10&$range_hops ANSI_14&" hops within " ANSI_10&$Last_Seen_Days ANSI_14&"-days.*"
		halt
	else
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
 		goto :Get_Initial_info
	end


:Run_Resume
	closeMenu
	echo ANSI_10&"**Resuming your last probing list from Sector: " ANSI_14&$last_probe "*"
	setVar $TargetFile GAMENAME&"_Probe_Targets.txt"
	setVar $temp_file "Temp_Probe_List.txt"
	setVar $read_line 1
	setVar $found_resume "FALSE"
	setVar $mode $last_mode
	setVar $target_Count 0
	echo ANSI_13&"** Building Target List - " ANSI_14&"Please wait....*"
:Read_Resume_List
	read $TargetFile $sector_index $read_line
	if ($sector_index <> "EOF")
		if ($found_resume = "TRUE")
			write $temp_File $sector_index
			add $target_count 1
		elseIf ($sector_index = $last_probe)
			setVar $found_resume "TRUE"
		end
		add $read_line 1
		goto :Read_Resume_List
	else
		delete $TargetFile
		rename $temp_file $TargetFile
		echo ANSI_10&"**Found: " ANSI_14&$Target_Count ANSI_10&" Targets*"
		goto :Get_Initial_Info
	end 	

#########  Below starts the actual probing routine #################################################

:Get_Initial_Info
     setArray $voids SECTORS
	echo ANSI_13&"*Your filtered target list is saved as: " ANSI_14&$targetFile "**"
	echo ANSI_10&"Would you like to clear your avoids? - " ANSI_13&"(" ANSI_14&"Recommended" ANSI_13&")" ANSI_10&" - <" ANSI_14&"y" ANSI_10&"/" ANSI_14&"n"
	getConsoleInput $answer SINGLEKEY
	isNumber $number $answer
	if ($number)
		echo ANSI_12&"*Bad Input - Must be yes or no - Try again*"
		goto :Get_Initial_Info
	end	
	lowercase $answer
	if ($answer = "y")
		send "c v 0* y y q"
     elseIf ($answer = "n")
          goSub :Record_Voids   		
	elseIf ($answer <> "n")
		echo ANSI_12&"*Bad Input - Must be yes or no - Try again*"
		goto :Get_Initial_Info
	end
	send "I"
	setTextLineTrigger 1 :have_probes "Ether Probes   :"
	setTextLineTrigger 2 :have_credits "Credits        :"
	pause

:have_probes
	setVar $cut_line CURRENTLINE
	getWordPos $cut_line $position "Ether Probes   :"
	if ($position > 0)
		add $position 17
		getLength $cut_line $line_length
		cutText CURRENTLINE $cut_line $position $line_length
		getWord $cut_line $have_probes 1
	else
		getWord $cut_line $have_probes 4	
	end
	pause

:have_credits
	getWord CURRENTLINE $have_credits 3
	stripText $have_credits ","
	waitFor "Command "
	if ($have_probes <= 0)
		if ($restock_Probes = "YES") AND ($have_credits > ($minimum_Credits + $probe_cost))
			goSub :Buy_probes
		else
			echo ANSI_12&"** You don't have any probes and cannot buy any:"
			if ($current_sector <> STARDOCK)
				echo ANSI_14&" not at Stardock.*"
			else
				echo ANSI_14&" Minimum Credit Level*"
			end
			halt
		end
	end

:Filename
	gettime $date m:d:yy
	replaceText $date ":" "-"
	setVar $filename1 "Probe Unreachable Report - "&GAMENAME&" - "&$Date&".txt"
	setVar $filename2 "Probe Found Report - "&GAMENAME&" - "&$Date&".txt"
	fileExists $exists $filename1
	if ($exists = FALSE)
		write $filename1 "Target       Probe        "
        write $filename1 "Sector     Destroyed     Hops"
		write $filename1 "-----------------------------"
	end
	fileExists $exists $filename2
	if ($exists = FALSE)
		write $filename2 "Probing Found:"
	end

:Start_Probing
	setVar $probe_count 0
	setVar $read_line 1

:Next_Probe_Cycle
	setVar $last_probe $target
	saveVar $last_probe
	read $targetFile $target $read_line
	if ($target <> "EOF")
		if ($mode = "Unexplored")
			if (SECTOR.EXPLORED[$target] = "YES")
				add $read_line 1
				goto :Next_Probe_Cycle
			end
 		end
		add $probe_Count 1
		add $read_line 1
		setVar $closest_hit 0
		setVar $closest_hops 999
	else
		goto :End
	end
			
:Enter_probe_Sector
	setVar $count3 1
	setArray $path_report 200
	if ($have_probes <= 0)
		if ($restock_Probes = "YES") AND ($have_credits > ($minimum_Credits + $probe_cost))
			goSub :Buy_probes
		else
#			echo ANSI_12&"** You don't have any probes and cannot buy any - halting.*"
			echo ANSI_12&"** You ran out of Ether Probes and / or credits.*"
			echo ANSI_10&"**Probing Completed:*"
			echo ANSI_13&"Probes Used: " ANSI_14&$probes_used "*"
			echo ANSI_10&"*You found: " ANSI_14&$unreachable ANSI_10&" Unreachable Sectors *"
			echo ANSI_13&"Saved as: " ANSI_14&$filename1 "*"
			echo ANSI_10&"*You found: " ANSI_14&$found_rpts ANSI_10&" Sectors with Traders, Planets, Class 0's, Fed's, etc. *"
			echo ANSI_13&"Saved as: " ANSI_14&$filename2 "*"	
			halt
		end
	end
#	getInput $target "** What Sector do you want to probe: "
	

:Fire_probe
	if ($adj_avoid_count >= $adj_sector_count)
		echo ANSI_12&"**Warning: " ANSI_14&"It appears your sector is surrounded with " ANSI_12&"Enemy" ANSI_14&" figs.*"
		echo ANSI_13&"         Script Halting - use the " ANSI_14&"Resume" ANSI_13&" feature to continue later.**"
		echo ANSI_13&"Probes Used: " ANSI_14&$probes_used "*"
		echo ANSI_10&"*You found: " ANSI_14&$unreachable ANSI_10&" Unreachable Sectors *"
		echo ANSI_13&"Saved as: " ANSI_14&$filename1 "*"
		echo ANSI_10&"*You found: " ANSI_14&$found_rpts ANSI_10&" Sectors with Traders, Planets, Class 0's, Fed's, etc. *"
		echo ANSI_13&"Saved as: " ANSI_14&$filename2 "*"	
    	halt
	end
	if ($target = $current_Sector)
		goto :Next_Probe_Cycle
	end
     if ($voids[$target] = TRUE)
          write $filename1 $Target&"         None Recorded (Voided Target)"
          add $unreachable 1
          goto :Next_Probe_Cycle
     end
	send "e " $target "*"
	add $probes_used 1
	subtract $have_probes 1
#	echo ANSI_10&"* Have Probes : " $have_probes "*"

:Probe_Triggers
	killAllTriggers
	setTextTrigger 3 :Start_Probe_Recording "Probe entering sector :"
	setTextTrigger 4 :No_Route "Error - No route within"
	pause

:No_Route
	killAllTriggers
	send "N"
	goSub :Write_Unreachable
	add $have_probes 1
	subtract $probes_used 1
	goto :Next_Probe_Cycle

:Start_Probe_Recording
	getWordPos CURRENTLINE $probe_enters "Probe entering sector :"
	if ($probe_enters > 0)
		getWord CURRENTLINE $Last_Entering_Sector 5
	end
	killAllTriggers
	setVar $count1 1
	setVar $found_something "FALSE"
	setArray $record_text 100
	setTextLineTrigger read_line :Read_line 
	pause

:Read_line
	setVar $ProbeText CURRENTLINE
	getWordPos $ProbeText $probe_enters "Probe entering sector :"
	getWordPos $ProbeText $probe_Destructs "Probe Self Destructs"
	getWordPos $ProbeText $probe_destroyed "Probe Destroyed!"
	if ($probe_destructs > 0) OR ($probe_Destroyed > 0)
		if ($found_Something = "TRUE")
			goSub :Build_Path_Report
		end
		if ($path_report[2] <> 0)
			goSub :Send_Path_Report
		end
		if ($probe_Destroyed > 0)
#			echo "** The last entering sector was: " $Last_Entering_Sector "*"
			getDistance $hops $Last_Entering_Sector $target
			if ($hops < $closest_hops)
				setVar $closest_hops $hops
				setVar $closest_hit $Last_Entering_Sector
			end
			if ($Last_Entering_Sector <> $target)
				send "c v" $Last_Entering_Sector "* q "
				setVar $voids[$last_Entering_Sector] TRUE
				getDistance $chk_Adj $current_Sector $Last_Entering_Sector
				if ($chk_Adj = 1)
					add $adj_avoid_count 1
				end
#				waitFor "will now be avoided in"
				goto :Enter_probe_Sector
			else
				goSub :Write_Unreachable
				goto :Next_Probe_Cycle
			end
		else
			goto :Next_Probe_Cycle
		end
	end
	if ($probe_enters = 0)
		setVar $record_text[$count1] CURRENTLINE
		getWordPos $record_text[$count1] $traders "Traders :"
		getWordPos $record_text[$count1] $aliens "w/"
		getWordPos $record_text[$count1] $ships "Ships   :"
		getWordPos $record_text[$count1] $planets "Planets :"
		getWordPos $record_text[$count1] $class0 "Class 0 (Special)"
		getWordPos $record_text[$count1] $feds "Federals:"
		getWordPos $record_text[$count1] $sector_Rpt_Test "Sector  :"
		if ($sector_Rpt_Test > 0)
			getWord $record_text[$count1] $sector_ID 3
		end
		if ($traders > 0) OR ($aliens > 0) OR ($ships > 0) OR ($planets > 0) OR ($class0 > 0) OR ($feds > 0)
			if ($sector_Reported[$sector_ID] = 0)
				setVar $found_something "TRUE"
				setVar $sector_Reported[$sector_ID] 1
			end
		end
		add $count1 1
		setTextLineTrigger read_line :Read_line 
		pause
	else
		if ($probe_enters > 0)
			getWord CURRENTLINE $Last_Entering_Sector 5
		end
		if ($found_Something = "TRUE")
			goSub :Build_Path_Report
		end
		goto :Start_Probe_Recording
	end

	
#	subtract $have_probes 1
	goto :Enter_probe_sector


:Build_Path_Report
	add $found_rpts 1
     setVar $count2 1
	while ($count2 <= ($count1 - 2))
		setVar $path_report[$count3] $record_text[$count2]	
		add $count2 1
		add $count3 1
	end
	Return


:Send_Path_Report
	if ($verbose = "YES")
		setVar $count2 1
		send "'*Probing Sector " $target " Report:*"
		while ($count2 <= $count3)
			getLength $path_report[$count2] $length
			if ($path_report[$count2] = 0) OR ($length = 0)
				setVar $path_report[$count2] " "
			end
			send $path_report[$count2] "*"
			add $count2 1
		end
		send "*"
	end
	setVar $count2 1
	while ($count2 <= $count3)
		getLength $path_report[$count2] $length
		if ($path_report[$count2] = 0) OR ($length = 0)
			setVar $path_report[$count2] " "
		end
		write $filename2 $path_report[$count2]
		add $count2 1
	end
#	waitFor "Sub-space comm-link terminated"
	Return


:Buy_probes
	send "p s h "
	if ($probe_cost = 0)
		send "e"
		waitFor "We sell them for"
		getWord CURRENTLINE $probe_cost 5
		stripText $probe_cost ","
		saveVar $probe_cost
	else
		send "e "
	end
	waitFor "How many Probes do you want (Max"
	getWord CURRENTLINE $max_buy 8
	stripText $max_buy ")"
	setVar $buy_probes (($have_credits - $minimum_Credits) / $probe_cost)
	if ($buy_probes > $max_buy)
		setVar $buy_probes $max_buy
	end
	send $buy_probes "* q q"
	subtract $have_credits ($buy_probes * $probe_cost)
	add $have_probes $buy_probes
	Return

:Write_Unreachable
	if ($closest_hops = 999)
		write $filename1 $Target&"         None Recorded (Voided Route)"
	else
		setVar $write_line $target
          getLength $target $length1
		setVar $space_loop (14 - $length1)
		setVar $space_counter 1
		while ($space_Counter <= $space_loop)
			mergeText $write_line " " $write_line
			add $space_Counter 1
		end
		mergeText $write_line $closest_hit $write_line
		getLength $closest_hit $length2
		setVar $space_loop (27 - ($length1 + $length2 + $space_counter))
		setVar $space_counter 1
		while ($space_Counter <= $space_loop)
			mergeText $write_line " " $write_line
			add $space_Counter 1
		end
		if ($closest_hops >= 0)
		   mergeText $write_line $closest_hops $write_line
		else
             mergeText $write_line "(No ZTM Data)" $write_Line
          end
		write $filename1 $write_line
	end
	add $unreachable 1
	Return

:End
	setVar $last_probe 0
	saveVar $last_probe
	echo ANSI_10&"**Probing Completed:*"
	echo ANSI_13&"Probes used: " ANSI_14&$probes_used ANSI_13&" while trying to reach: " ANSI_14&$target_Count ANSI_13&" sectors.*"
	echo ANSI_10&"*You found: " ANSI_14&$unreachable ANSI_10&" Unreachable Sectors *"
	echo ANSI_13&"Saved as: " ANSI_14&$filename1 "*"
	echo ANSI_10&"*You found: " ANSI_14&$found_rpts ANSI_10&" Sectors with Traders, Aliens, Planets, Class 0's, Fed's, etc. *"
	echo ANSI_13&"Saved as: " ANSI_14&$filename2 "*"	
	halt
	

####################################################################################################
:Target_File_Maintenance
	setVar $last_probe 0
	saveVar $last_probe
	setVar $TargetFile GAMENAME&"_Probe_Targets.txt"
	fileExists $exists $TargetFile
	if ($exists = TRUE)
		delete $TargetFile
	end
	Return

####################################################################################################
:convert_date
   setVar $date ($year * 365)
  	if ($month = "1")
    	  add $date $day
  	elseif ($month = "2")
    	  add $date (31 + $day)
  	elseIf ($month = "3")
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
:Build_DE_Range_File
	setVar $DE_Count 0
	setArray $DE_Sort SECTORS
	setVar $max_range 0
	setVar $sector_index 1
	echo ANSI_10&"**Sorting Deadends by Range From StarDock:*"
	echo ANSI_13&"This may take few minutes to complete but it only has to run once.*" ANSI_14&"Please be patient.*"
	while ($sector_index <= SECTORS)
		if (SECTOR.WARPCOUNT[$sector_index] = 1) OR (SECTOR.WARPINCOUNT[$sector_index] = 1)
			getDistance $range STARDOCK $sector_index
			if ($range = 0)
				echo ANSI_12&"**ZTM Error: " ANSI_14&"Stardock Range cannot be a Zero.*"
				halt
			end
			setVar $DE_Sort[$sector_Index] $range
			if ($range > $max_range)
				setVar $max_range $range
			end
			add $DE_Count 1
		end
		add $sector_index 1
	end
	setVar $range_sort_number $max_range
	while ($range_sort_number > 0)
		setVar $sector_index 1
		while ($sector_index <= SECTORS)
			if ($DE_Sort[$sector_index] = $range_sort_number)
				write $DE_Range_File $sector_Index&"  "&$range_sort_number
			end
			add $sector_index 1
		end
		subtract $range_sort_Number 1
	end
	echo ANSI_10&"**Sorting Results: " ANSI_13&$DE_Count ANSI_10&" Deadends Found, Max Range is: " ANSI_14&$max_range ANSI_10&" hops from Dock.*"
	echo ANSI_10&"Complete results saved in file: " ANSI_14&$DE_Range_File "*"

Return

####################################################################################################
:Build_All_Range_File
	setArray $All_Sort SECTORS
	setVar $max_range 0
	setVar $sector_index 1
	echo ANSI_10&"**Sorting All Sectors by Range From StarDock:*"
	echo ANSI_13&"This may take few minutes to complete but it only has to run once.*" ANSI_14&"Please be patient.*"
	while ($sector_index <= SECTORS)
		getDistance $range STARDOCK $sector_index
		if ($range = 0) AND ($sector_index <> STARDOCK)
			echo ANSI_12&"**ZTM Error: " ANSI_14&"Terra Range cannot be a Zero.*"
			halt
		end
		setVar $All_Sort[$sector_Index] $range
		if ($range > $max_range)
			setVar $max_range $range
		end
		add $sector_index 1
#		echo "."
	end
	setVar $range_sort_number $max_range
	while ($range_sort_number > 0)
#		echo "."
		setVar $sector_index 1
		while ($sector_index <= SECTORS)
			if ($All_Sort[$sector_index] = $range_sort_number)
				write $All_Range_File $sector_Index&"  "&$range_sort_number
			end
			add $sector_index 1
		end
		subtract $range_sort_Number 1
	end
	echo ANSI_10&"*Sorting Completed, the maximum range is: " ANSI_14&$max_range ANSI_10&" hops from Dock.*"
	echo ANSI_10&"Complete results saved in file: " ANSI_14&$ALL_Range_File "*"
     Return
     
#########  Record Void List #############################################################
:Record_Voids
     setVar $voidCount 0
     send "c xq"
     waitFor "<List Avoided Sectors>"
	setTextLineTrigger readLine :Read_Void_Line
	pause

:Read_Void_Line
	setVar $wordCount 1
	setVar $line_Text CURRENTLINE
	while ($wordCount <= 11)
		getWord $line_text $sector $wordCount
          isNumber $number $sector
          if ($number = FALSE)
          	goto :Done_Voids
          elseIf ($sector > 0)
			setVar $voids[$sector] TRUE
			add $voidCount 1
		end
		add $wordCount 1
	end
:Void_Triggers
	setTextLineTrigger readLine :Read_Void_Line
	pause

:Done_Voids
     echo ANSI_10&"**You have a total of: " ANSI_14&$voidCount ANSI_10&" sectors voided.**"
     return

include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\switchboard.ts"
