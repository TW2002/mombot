logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~colonist_regen

setvar $help~help[1] $help~tab&"Milks Terra colonists with bwarp and adaptive polling."
setvar $help~help[2] $help~tab&""
setvar $help~help[3] $help~tab&"Usage: milk on {grab-at-level} {drop-group}"
setvar $help~help[4] $help~tab&"Usage: milk help"
setvar $help~help[5] $help~tab&""
setvar $help~help[6] $help~tab&"The current bot planet is used for fuel and colo dropoff."
setvar $help~help[7] $help~tab&"Use milk return to force a return home."
setvar $help~help[8] $help~tab&"Use milk adjust timing|collect|min|current {value} while running."
gosub :help~helpfile

if ($bot~parm1 <> "on")
	gosub :help~displayhelp
	halt
end

isnumber $test $bot~parm2
if ($test < 1)
	setvar $switchboard~message "Grab-at-level must be a number greater than zero.*"
	gosub :switchboard~switchboard
	gosub :help~displayhelp
	halt
end
setvar $grab_at_level $bot~parm2

isnumber $test $bot~parm3
if ($test < 1)
	setvar $switchboard~message "Drop group must be a number greater than zero.*"
	gosub :switchboard~switchboard
	gosub :help~displayhelp
	halt
end
setvar $drop_group $bot~parm3

setvar $colo_planet_num $planet~planet
setvar $fuel_planet_num $planet~planet
if ($colo_planet_num <= 0)
	setvar $switchboard~message "Current bot planet is not known. Land on or set the planet before starting milk2.*"
	gosub :switchboard~switchboard
	halt
end

setvar $colonist_regen $game~colonist_regen
isnumber $test $colonist_regen
if ($test < 1)
	setvar $colonist_regen 30000
end

setvar $auto_adjust 1
setvar $fuel_stagger 0
setvar $poll_timing 1000
setvar $minimum_adjust $grab_at_level
setvar $warp_home_now 0
setvar $grab_count 0

setvar $switchboard~message "Tiny Terra milker activated.*"
gosub :switchboard~switchboard

send " q q q z n * "
waitfor "Command [TL="
setvar $line currentline
gettext $line $return_sector ":[" "] (?="

if ($return_sector = 1)
	setvar $switchboard~message "Cannot start at Terra. Bring me home first. Halting.*"
	gosub :switchboard~switchboard
	goto :out_of_loop
end

gosub :initstartseconds

:loop_top
setvar $grab_count 0
send " q q q z n "

send "c"
killalltriggers
settextlinetrigger path_error :no_to_terra "*** Error - No route within"
settextlinetrigger path_done :path_to_terra "The shortest path"
send "f"&$return_sector&"*1*"
pause

:next_path
killalltriggers
settextlinetrigger path_error :no_from_terra "*** Error - No route within"
settextlinetrigger path_done :path_from_terra "The shortest path"
send "f1*"&$return_sector&"*"
pause

:compute_fuel
send "q"
killalltriggers
setvar $fuel ((3 * ($path_to + $path_from)) + $fuel_stagger)
gosub :get_safety_info

if ($holds < $fuel)
	setvar $switchboard~message "Not enough holds on this ship. Halting.*"
	gosub :switchboard~switchboard
	goto :out_of_loop
end

if ($twarp < 1)
	setvar $switchboard~message "This ship does not have T-warp. Halting.*"
	gosub :switchboard~switchboard
	goto :out_of_loop
end

killalltriggers
settexttrigger no_blind :no_blind "Do you want to make this jump blind?"
settexttrigger no_ore :no_ore "You do not have enough Fuel Ore to make the jump."
settexttrigger no_range :no_range "This planetary transporter does not have the range."

setvar $current_free 999
setvar $max_holds 999

if ($fuel_planet_num = 0)
	setvar $fuel_planet_num $colo_planet_num
end

settexttrigger cannot_land_1 :planet_not_found "That planet is not in this sector."
settexttrigger cannot_land_2 :planet_not_found "Invalid registry number, landing aborted."
setvar $land_planet $fuel_planet_num
send " l "
waitfor "Land on which planet <Q to abort>"
send $fuel_planet_num&"*"
waitfor "Landing sequence engaged..."
send " s n l 1* s n l 2* s n l 3* t n l 1* t n l 2* t n l 3* t n t 1 "&$fuel&" * q "
send " m1* y"
waitfor "All Systems Ready, shall we engage?"
send " y "

:terra_loop_start
killalltriggers
setvar $land_planet 1
settexttrigger planet_scanner :planet_scanner "Land on which planet <Q to abort>"
settexttrigger handle_terra :handle_terra "colonists ready to leave Terra."
settexttrigger cannot_land_1 :planet_not_found "That planet is not in this sector."
settexttrigger cannot_land_2 :planet_not_found "Invalid registry number, landing aborted."
send " q 0 * q z n l "
pause

:planet_scanner
send " 1* "
pause

:handle_terra
killalltriggers
settextlinetrigger return_trigger :warp_safety_trig "tmilk return"
settextlinetrigger return_trigger2 :warp_safety_trig "milk2 return"
settextlinetrigger adjust_trigger :adjust_trig "tmilk adjust"
settextlinetrigger adjust_trigger2 :adjust_trig "milk2 adjust"

getword currentline $current_colonists 4
setvar $got_num 0

if ($current_colonists >= $grab_at_level)
	send " T"
	waitfor "How many groups of Colonists do you want to take"
	gettext currentline $max_holds "([" "] empty"

	setvar $return_level (($holds * 50) / 1000)
	if ($max_holds < $return_level)
		send "*"
		goto :warp_home
	end

	if ($max_holds >= $current_colonists)
		send $current_colonists&" * "
		setvar $got_num $current_colonists
	else
		send "*"
		setvar $got_num $max_holds
	end

	subtract $max_holds $got_num
	if ($max_holds < 1)
		setvar $max_holds 0
	end

	add $grab_count 1
	if ($auto_adjust = 1)
		add $grab_at_level 1
	end
	gosub :initstartseconds
	goto :terra_loop_start
end

setvar $return_level (($holds * 50) / 1000)
setvar $current_free $max_holds
if ($current_free < $return_level)
	goto :warp_home
else
	gosub :updateelapsed
	setvar $been_at_terra_for_scaled $been_at_terra_for
	multiply $been_at_terra_for_scaled 100000000
	setvar $percent_of_daily ($been_at_terra_for_scaled / 86400)
	setvar $regen_thus_far ($percent_of_daily * $colonist_regen)
	setvar $perc_regen_thus_far ($regen_thus_far / 125000000)
	setvar $regen_thus_far ($regen_thus_far / 100000000)

	if (($perc_regen_thus_far > $current_colonists) and ($auto_adjust = 1))
		gosub :initstartseconds
		if ($poll_timing >= 1240)
			subtract $poll_timing 500
			#setvar $switchboard~message "Auto-adjust - Terra timing adjusted to "&$poll_timing&" ms.*"
			#gosub :switchboard~switchboard
		else
			setvar $reduce_by ($grab_at_level * 100000)
			setvar $reduce_by (($reduce_by / 1000000) + 1)
			setvar $test_grab_at_level ($grab_at_level - $reduce_by)
			if ($grab_at_level > $minimum_adjust)
				if ($test_grab_at_level >= $minimum_adjust)
					setvar $grab_at_level $test_grab_at_level
					#setvar $switchboard~message "Auto-adjust - Collection level adjusted to "&$grab_at_level&" colos.*"
					#gosub :switchboard~switchboard
				else
					setvar $grab_at_level $minimum_adjust
					#setvar $switchboard~message "Auto-adjust - Collection level adjusted to "&$grab_at_level&" colos.*"
					#gosub :switchboard~switchboard
				end
			end
		end
	end

	setdelaytrigger reloop_delay :terra_loop_start $poll_timing
	pause
end
halt

:warp_home
killalltriggers
settexttrigger no_blind :no_blind "Do you want to make this jump blind?"
settexttrigger no_ore :no_ore "You do not have enough Fuel Ore to make the jump."
settexttrigger no_range :no_range "This planetary transporter does not have the range."
send " q 0 * q z n "
waitfor "Command [TL="
send " m"&$return_sector&"* y"
waitfor "All Systems Ready, shall we engage?"
send " y l"

setvar $land_planet $colo_planet_num
settexttrigger cannot_land_1 :planet_not_found "That planet is not in this sector."
settexttrigger cannot_land_2 :planet_not_found "Invalid registry number, landing aborted."
waitfor "Land on which planet <Q to abort>"
send $colo_planet_num&"* t n l 1* t n l 2* t n l 3* s n l "&$drop_group
waitfor "How many groups of Colonists do you want to leave"
setvar $line currentline
gettext $line $got_num "([" "] on"
send "/* c * "

gosub :player~quikstats
setvar $turns_left $player~turns
setvar $switchboard~message "Returned with "&$got_num&" colos. "&$turns_left&" turns left.*"
gosub :switchboard~switchboard

if ($warp_home_now = 1)
	setvar $warp_home_now 0
	setdelaytrigger delay :loop_top 30000
else
	setvar $from_fuel ((3 * $path_from) + $fuel_stagger)
	setvar $holds_test ($holds - $from_fuel)
	multiply $holds_test 100000
	divide $holds_test 111111

	if (($grab_at_level <= $holds_test) and ($auto_adjust = 1))
		setvar $increase_by ($grab_at_level * 500000)
		setvar $increase_by (($increase_by / 1000000) + 1)
		setvar $test_grab_at_level ($grab_at_level + $increase_by)
		if ($test_grab_at_level <= $holds_test)
			setvar $grab_at_level $test_grab_at_level
			#setvar $switchboard~message "Auto-adjust - Collection level adjusted to "&$grab_at_level&" colos.*"
			#gosub :switchboard~switchboard
		end
	end

	setvar $warp_home_now 0
	setdelaytrigger delay :loop_top 500
end
pause

:out_of_loop
halt

:no_blind
setvar $switchboard~message "Blind warp detected. Aborting script.*"
gosub :switchboard~switchboard
goto :out_of_loop

:no_ore
setvar $switchboard~message "Ran out of ore. Aborting script.*"
gosub :switchboard~switchboard
goto :out_of_loop

:no_range
setvar $switchboard~message "T-pad cannot reach Terra. Aborting script.*"
gosub :switchboard~switchboard
goto :out_of_loop

:planet_not_found
send " q z n * * "
waitfor "(?="
setvar $switchboard~message "Could not land on planet #"&$land_planet&".*"
gosub :switchboard~switchboard
goto :out_of_loop

:no_to_terra
setvar $switchboard~message "No path to Terra found. Check avoids. Halting.*"
gosub :switchboard~switchboard
goto :out_of_loop

:path_to_terra
setvar $path_to 0
setvar $line currentline
gettext $line $path_test "(" " hops,"
isnumber $test $path_test
if ($test > 0)
	setvar $path_to $path_test
else
	setvar $switchboard~message "Error computing path to Terra. Halting.*"
	gosub :switchboard~switchboard
	halt
end
goto :next_path

:no_from_terra
setvar $switchboard~message "No path from Terra found. Check avoids. Halting.*"
gosub :switchboard~switchboard
goto :out_of_loop

:path_from_terra
setvar $path_from 0
setvar $line currentline
gettext $line $path_test "(" " hops,"
isnumber $test $path_test
if ($test > 0)
	setvar $path_from $path_test
else
	setvar $switchboard~message "Error computing path from Terra. Halting.*"
	gosub :switchboard~switchboard
	halt
end
goto :compute_fuel

:get_safety_info
gosub :player~getinfo
setvar $tpw $player~turns_per_warp
setvar $holds $player~ore_holds
add $holds $player~organic_holds
add $holds $player~equipment_holds
add $holds $player~colonist_holds
add $holds $player~empty_holds
setvar $twarp $player~twarp_type
return

:warp_safety_trig
setvar $line currentline
uppercase $line
getword $line $routing 1
cuttext $line $firstchar 1 1
if (($routing = "R") or ($firstchar = "'"))
	setvar $warp_home_now 1
	goto :warp_home
end
goto :terra_loop_start

:adjust_trig
setvar $line currentline
uppercase $line
getword $line $routing 1
cuttext $line $firstchar 1 1
if (($routing = "R") or ($firstchar = "'"))
	if ($firstchar = "'")
		getword $line $adjust_command 3
		getword $line $param 4
	else
		getwordpos $line $pos "MILK2"
		if ($pos <= 0)
			getwordpos $line $pos "TMILK"
		end
		cuttext $line $cmd_string $pos 999
		getword $cmd_string $adjust_command 3
		getword $cmd_string $param 4
	end

	isnumber $test $param
	if ($test < 1)
		setvar $switchboard~message "milk2 adjust timing|collect|min|current {value}*"
		gosub :switchboard~switchboard
		goto :terra_loop_start
	end

	if ($adjust_command = "TIMING")
		setvar $poll_timing $param
		setvar $switchboard~message "Terra timing adjusted to "&$param&" ms.*"
		gosub :switchboard~switchboard
	elseif ($adjust_command = "COLLECT")
		setvar $grab_at_level $param
		setvar $switchboard~message "Collection level adjusted to "&$param&" colos.*"
		gosub :switchboard~switchboard
	elseif ($adjust_command = "MIN")
		setvar $minimum_adjust $param
		setvar $switchboard~message "Minimum collection level adjusted to "&$param&" colos.*"
		gosub :switchboard~switchboard
	elseif ($adjust_command = "CURRENT")
		setvar $switchboard~message "Current collection level: "&$grab_at_level&" colos. Minimum: "&$minimum_adjust&". Timing: "&$poll_timing&" ms.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "milk2 adjust timing|collect|min|current {value}*"
		gosub :switchboard~switchboard
	end
end
goto :terra_loop_start

:initstartseconds
gettime $current_time
getdate $current_date
setvar $timestamp $current_date&" "&$current_time
gosub :convert_timestamp
setvar $starting_seconds $timestamp_result
return

:updateelapsed
gettime $current_time
getdate $current_date
setvar $timestamp $current_date&" "&$current_time
gosub :convert_timestamp
setvar $current_seconds $timestamp_result
setvar $been_at_terra_for ($current_seconds - $starting_seconds)
return

:convert_timestamp
setvar $timestamp_result 0
getword $timestamp $date 1
getword $timestamp $time 2
getword $timestamp $ampm 3
replacetext $date "/" " "
replacetext $time ":" " "
getword $date $date_month 1
getword $date $date_day 2
getword $date $date_year 3
getword $time $time_hour 1
getword $time $time_min 2
getword $time $time_sec 3

if ($ampm = "PM")
	add $time_hour 12
end

setvar $these_seconds (($time_hour * 3600) + (($time_min * 60) + $time_sec))
if ($date_month = 1)
	setvar $days_offset 0
elseif ($date_month = 2)
	setvar $days_offset 31
elseif ($date_month = 3)
	setvar $days_offset 59
elseif ($date_month = 4)
	setvar $days_offset 90
elseif ($date_month = 5)
	setvar $days_offset 120
elseif ($date_month = 6)
	setvar $days_offset 151
elseif ($date_month = 7)
	setvar $days_offset 181
elseif ($date_month = 8)
	setvar $days_offset 212
elseif ($date_month = 9)
	setvar $days_offset 243
elseif ($date_month = 10)
	setvar $days_offset 273
elseif ($date_month = 11)
	setvar $days_offset 304
elseif ($date_month = 12)
	setvar $days_offset 334
end
setvar $days_offset (($days_offset + $date_day) - 1)

setvar $leapyear_test ($date_year / 4)
setvar $leapy ($leapyear_test * 4)
if ($leapy = $date_year)
	setvar $leapyear_test ($date_year / 100)
	setvar $leapy ($leapyear_test * 100)
	if ($leapy <> $date_year)
		if ($date_month >= 3)
			add $days_offset 1
		end
	end
end

subtract $date_year 2002
setvar $year_offset ($date_year - 1)
setvar $year_offset ($year_offset * 36525)
setvar $year_offset ($year_offset / 100)
setvar $total_days ($year_offset + $days_offset)
setvar $total_seconds (($total_days * 86400) + $these_seconds)
if ($total_seconds < 1)
	setvar $total_seconds 0
end
setvar $timestamp_result $total_seconds
return

#includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\switchboard.ts"
