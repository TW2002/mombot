reqrecording
gosub :loadvars~loadvars
gosub :help~initialize

loadvar $game~genesis_cost
loadvar $game~atomic_cost
loadvar $map~stardock
loadvar $bot~folder
loadvar $game~max_planets_per_sector
loadvar $planet~planet_file
loadvar $bot~botisdeaf
loadvar $bot~silent_running

setvar $bubble_list $bot~folder&"/bubble.list"
setvar $bot~command "unstack"

setvar $help~help[1]  $help~tab&"  Moves overloaded planets automatically"
setvar $help~help[2]  $help~tab&"  into FARM or BUBBLE sectors."
setvar $help~help[3]  $help~tab&"       "
setvar $help~help[4]  $help~tab&" unstack {planet#1} {planet#2} ... {planet#x} {restack}"
setvar $help~help[5]  $help~tab&"       "
setvar $help~help[6]  $help~tab&"      Options: "
setvar $help~help[7]  $help~tab&"        {planet#} - will not move listed planets"
setvar $help~help[8]  $help~tab&"        {restack} - restacks last unstacked planets"
gosub :help~helpfile

setarray $planet~planets 10000
gosub :player~quikstats
setvar $home $player~current_sector
setvar $startinglocation $player~current_prompt

if ($player~planet_scanner = "No")
	setvar $switchboard~message "Unstacker must be run with a planet scanner.*"
	gosub :switchboard~switchboard
	halt
elseif (($player~current_prompt <> "Citadel") and ($player~current_prompt <> "Command"))
	setvar $switchboard~message "Unstacker must be run from the Citadel or Command Prompt.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " restack "
if ($pos > 0)
	setvar $restack true
else
	setvar $restack false
end

if ($restack = true)
	loadvar $restack_location
	loadvar $restack_id
	setarray $id 10000
	setvar $j 1
	setvar $temp_id ""
	setvar $skip " "
	while ($temp_id <> "[][][]")
		getword $restack_id $temp_id $j "[][][]"
		getword $restack_location $temp_location $j
		if ($temp_id <> "[][][]")
			isnumber $test $temp_id
			if ($test = true)
				if ($temp_id <> "0")
					setvar $id[$temp_id] $temp_location
				end
			end
		end
		add $j 1
	end
else
	setvar $restack_id ""
	setvar $restack_location ""
	setvar $j 1
	setvar $temp ""
	setvar $skip " "
	while ($temp <> "[][][]")
		getword $bot~user_command_line $temp $j "[][][]"
		if ($temp <> "[][][]")
			isnumber $test $temp
			if ($test = true)
				if ($temp <> "0")
					setvar $skip $skip&" "&$temp&" "
				end
			end
		end
		add $j 1
	end
end

#gosub :PLANET~loadplanetInfo

if (($startinglocation = "Citadel") and ($restack <> true))
	send "q"
	gosub :planet~getplanetinfo
	send "c"
	setvar $startingplanet $planet~planet
	savevar $startingplanet
end
gosub :ship~getshipstats

gosub :get_tl_list
setvar $bot~parmameter "FARM"
if ($restack = true)
	gosub :restack
	setvar $switchboard~message "I restacked every planet the best I could.  I would double check though.*"
	gosub :switchboard~switchboard
	gosub :player~quikstats
	if (($player~current_prompt = "Citadel") or ($player~current_prompt = "Command"))
		send "q q * "
		loadvar $startingplanet
		setvar $planet~planet $startingplanet
		gosub :planet~landingsub
	end

	halt
end

:unstack
gosub :count_planets
if ($planet~citadels[$player~current_sector] > $game~max_planets_per_sector)
	setvar $j 1
	setvar $planet~planets_to_move ($planet~citadels[$player~current_sector] - $game~max_planets_per_sector)
	setvar $planet~planets_moved 0

	while ($j <= $planet~planetcount)
		getwordpos $skip $pos " "&$planet~planets[$j]&" "
		if ($pos <= 0)
			send "l " & #8 & $planet~planets[$j] & "* "
			gosub :planet~getplanetinfo
			if (($planet~planet_fuel >= 5000) and ($planet~citadel >= 4))

				setvar $bottom 1
				setvar $top 1
				setarray $checked sectors
				setvar $que[1] $player~current_sector
				setvar $checked[$player~current_sector] 1

				:tryagain2
				while ($bottom <= $top)
					# Now, pull out the next sector in the que, and make it our focus
					setvar $focus $que[$bottom]
					getsectorparameter $focus "FARM" $isfarmsector
					getsectorparameter $focus "BUBBLE" $isbubblesector
					setvar $istargettedsector false
					if (($isfarmsector <> true) and ($isbubblesector <> true))
						goto :notit
					else
						setvar $istargettedsector true
					end
					if (($istargettedsector = true) and ($planet~citadels[$focus] < $game~max_planets_per_sector))
						killtrigger 1
						killtrigger 2
						killtrigger 3
						send "c p "& $focus &"  *ys* "
						settextlinetrigger 1 :warp_it_balance "All Systems Ready, shall we engage?"
						settextlinetrigger 2 :no_warp_balance "You do not have any fighters in Sector"
						settextlinetrigger 3 :warp_it_balance "You are already in that sector!"
						pause

						:warp_it_balance
						setvar $planet~citadels[$focus] ($planet~citadels[$focus] + 1)
						setvar $planet~citadels[$player~current_sector] ($planet~citadels[$player~current_sector] - 1)
						setvar $player~startinglocation "Citadel"
						setvar $player~warpto $player~current_sector
						gosub :player~quikstats
						gosub :move~twarp
						gosub  :player~currentprompt
						if ($player~twarpsuccess <> true)
							setvar $switchboard~message "Twarp failed during planet balancing. "&$player~msg&" Halting!*"
							gosub :switchboard~switchboard
							halt
						end
						setvar $restack_id $restack_id&" "&$planet~planets[$j]&" "
						setvar $restack_location $restack_location&" "&$focus&" "
						savevar $restack_id
						savevar $restack_location
						add $planet~planets_moved 1
						if ($planet~planets_moved >= $planet~planets_to_move)
							goto :done_moving_planets
						end

						:no_warp_balance
						killtrigger 1
						killtrigger 2
						killtrigger 3
						goto :done_moving_this_planet

					else

						:notit
						setvar $nearfig 0
					end
					# That wasn't it, so let's add all the adjacents to the que for future testing.
					setvar $a 1
					while (sector.warps[$focus][$a] > 0)
						setvar $adjacent sector.warps[$focus][$a]
						# But only add them if they haven't been added previously
						if ($checked[$adjacent] = 0)
							# Okay, this one hasn't been checked, so tag it and que it.
							setvar $checked[$adjacent] 1
							add $top 1
							setvar $que[$top] $adjacent
						end
						add $a 1
					end
					# The adjacents of $focus were all queued, now on to the next one.
					add $bottom 1
				end
			end

			:done_moving_this_planet
			send "qq* "
		end
		add $j 1
	end
end

:done_moving_planets
setvar $switchboard~message "I unstacked every planet I could.  Check to make sure!*"
gosub :switchboard~switchboard

halt

:count_planets
send "qq*"
gosub :player~msgs_off
send "l"
waiton "Registry# and Planet Name"
setvar $planet~planetcount 0
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
settextlinetrigger bedone :done "Land on which planet "
settextlinetrigger noplanets :done "You can create one with a Genesis Torpedo."
send "*"
pause

:planetline
killalltriggers
getwordpos currentline $pos "<<<< SHIELDED"
if ($pos <= 0)
	setvar $line currentline
	replacetext $line "<" " "
	replacetext $line ">" " "
	striptext $line ","
	add $planet~planetcount 1
	getword $line $planet~planets[$planet~planetcount] 1
end
settextlinetrigger getline2 :planetline "   <"
settextlinetrigger getend :done "Land on which planet "
pause

:done
killalltriggers
gosub :player~msgs_on
return

:get_tl_list
setvar $sectorcount 0
setarray $planet~citadels sectors
killalltriggers
settextlinetrigger sectorgrabber :sector_planet_line "Class "
settextlinetrigger sectorbedone :sector_done "======   ============"
setvar $tl_planets " "
if ($personal = true)
	send "cyq"
else
	if ($startinglocation = "Citadel")
		send "xlq"
	else
		send "tlq"
	end
end
pause

:sector_planet_line
killalltriggers
getword currentline $testsector 1
setvar $planet~citadel_count $planet~citadels[$testsector]
setvar $planet~citadels[$testsector] ($planet~citadel_count + 1)
setvar $tl_planets $tl_planets&" "&$testsector
settextlinetrigger getline2 :sector_planet_line "Class"
settextlinetrigger getend :sector_done "======   ============"
pause

:sector_done
killalltriggers
send "@"
waiton "Average Interval Lag:"

return

:restack
loadvar $starting_sector
if ($starting_sector <= 10)
	setvar $starting_sector $player~current_sector
end
setvar $i 1
while ($i <= 10000)
	if ($id[$i] <= 0)
		goto :next_sector
	end

	setvar $player~startinglocation "Citadel"
	setvar $player~warpto $id[$i]
	gosub :player~quikstats
	gosub :move~twarp
	gosub  :player~currentprompt
	if ($player~twarpsuccess <> true)
		setvar $switchboard~message "Twarp failed during planet balancing. "&$player~msg&" Halting!*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $planet~planet $i
	gosub :planet~landingsub
	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Planet "&$i&" has been moved.  Cannot restack. Halting!*"
		gosub :switchboard~switchboard
		setvar $player~startinglocation "Command"
		setvar $player~warpto $starting_sector
		gosub :player~quikstats
		gosub :move~twarp
		gosub  :player~currentprompt
		if ($player~twarpsuccess <> true)
			setvar $switchboard~message "Twarp failed during planet balancing. "&$player~msg&" Halting!*"
			gosub :switchboard~switchboard
			halt
		end
		loadvar $startingplanet
		setvar $planet~planet $startingplanet
		gosub :planet~landingsub
		goto :next_sector
	end
	send "q "
	gosub :planet~getplanetinfo
	if (($planet~planet_fuel >= 5000) and ($planet~citadel >= 4))
		killtrigger 1
		killtrigger 2
		killtrigger 3
		send "c p "& $starting_sector &"  *ys* "
		settextlinetrigger 1 :warp_it_unbalance "All Systems Ready, shall we engage?"
		settextlinetrigger 2 :no_warp_unbalance "You do not have any fighters in Sector"
		settextlinetrigger 3 :warp_it_unbalance "You are already in that sector!"
		pause
	end

	:warp_it_unbalance
	:next_sector
	add $i 1
end

return

:no_warp_unbalance
:no_warp_balance
setvar $switchboard~message "Fighter lost in starting sector!  Halting, but you better check it out.*"
gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\include\ship"
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
