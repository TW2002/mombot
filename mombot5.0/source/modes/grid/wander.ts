reqrecording
logging off
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "wander"
loadvar $bot~bot_turn_limit
loadvar $map~stardock
loadvar $bot~subspace

setvar $help~help[1]   $help~tab&"wander {file | sector param | auto} {share}"
setvar $help~help[2]   $help~tab&"     Warps around the universe, attempting to be turn efficient."
setvar $help~help[3]   $help~tab&"     Turn efficiency goes away when it's an unlimited turn game."
setvar $help~help[4]   $help~tab&"     Requires twarp.                "
setvar $help~help[5]   $help~tab&"                     "
setvar $help~help[6]   $help~tab&"             file - path to target file"
setvar $help~help[7]   $help~tab&"     sector param - Will target sector marked with sector param."
setvar $help~help[8]   $help~tab&"                     "
setvar $help~help[9]   $help~tab&"                    Using UNFIGGED as param will target all"
setvar $help~help[10]  $help~tab&"                    sectors where FIGSEC is not true. "
setvar $help~help[11]  $help~tab&"          {share} - reports figged sectors over subspace"
setvar $help~help[12]  $help~tab&"        {nearest} - does nearest fig calc when possible"
setvar $help~help[13]  $help~tab&"          "
setvar $help~help[14]  $help~tab&"          Planet avoid options can be set in the bot menu"

gosub :help~helpfile

setvar $switchboard~message "Wanderer starting up!*"
gosub :switchboard~switchboard

setvar $player~save true

gosub :player~quikstats
gosub :player~getinfo

gosub :ship~getshipstats
gosub :combat~init

getsectorparameter sectors "FIGSEC" $isfigged

setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Wanderer must be started from command, planet, or citadel prompt.*"
	gosub :switchboard~switchboard
end
if ($startinglocation = "Citadel")
	send "q "
end
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	send "m*** t*l2*t*l3*s*l1*s*l2*s*l3*t*t1* q q * * "
end

loadvar $player~surroundavoidshieldedonly
loadvar $player~surroundavoidallplanets

send "c;q"
waitfor "Offensive Odds:"
getwordpos currentline $pos "Offensive"
cuttext currentline $oddline $pos 99
gettext $oddline $offodd "Odds:" ":1"
striptext $offodd " "
striptext $offodd "."
waitfor "Mine Max:"
gettext currentline $maxmines "Mine Max:" "B"
striptext $maxmines " "
waitfor "Figs Per Attack:"
getword currentline $maxfigattack 5
multiply $offodd $maxfigattack
divide $offodd 12
gosub :player~quikstats

setvar $total_turns 0
setvar $total_gridded 0
setvar $archived ""
setvar $adjacenttarget 0

if (($player~ore_holds < $player~total_holds) and ($player~ore_holds < 100))
	setvar $switchboard~message "You need to fill all your holds with fuel. This is going to be a long drive.*"
	gosub :switchboard~switchboard
end
if ($player~$player~twarp_type = "No")
	setvar $switchboard~message "You really should use a twarp capable ship for wandering.*"
	gosub :switchboard~switchboard
	halt
end
if (($map~stardock = 0) or ($map~stardock = ""))
	setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
	gosub :switchboard~switchboard
	halt
end
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end
if ($player~photons > 0)
	setvar $switchboard~message "Can not run with photons on your ship.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " share "
if ($pos > 0)
	setvar $share true
else
	setvar $share false
end

getwordpos " "&$bot~user_command_line&" " $pos " near "
if ($pos > 0)
	setvar $nearest true
else
	setvar $nearest false
end

getword $bot~user_command_line $bot~parm1 1 "EMPTY"
if (($bot~parm1 = "auto") or ($bot~parm1 = "EMPTY"))

else
	setvar $gridtargets true
	setvar $target $bot~parm1
	uppercase $target
	fileexists $test $target
	if ($test = false)
		setvar $i 1
		setvar $targetsectors 0
		setarray $targetsectors sectors
		if ($target = "UNFIGGED")
			setvar $unfigged true
			setvar $target "FIGSEC"
		end
		while ($i <= sectors)
			getsectorparameter $i $target $istarget
			if ($unfigged = true)
				if ($istarget <> true)
					add $targetsectors 1
					setvar $targetsectors[$targetsectors] $i
				end
			else
				if ($istarget = true)
					add $targetsectors 1
					setvar $targetsectors[$targetsectors] $i
				end
			end
			add $i 1
		end
		if ($targetsectors <= 0)
			setvar $switchboard~message " Grid target file or sector parameter: ["&$target&"] does not exist, shutting down..*"
			gosub :switchboard~switchboard
			halt
		end
	else
		readtoarray $target $targetsectors
	end
end

gosub :findalltargetsectors

while (true)
	setvar $tried_paths " "

	:try_again
	setvar $tried 0
	setvar $loop_limit 100
	setvar $loop 0

	:get_new_random_path
	replacetext $database "  " " "
	if ($nearest = true)
		getnearestwarps $neararray $player~current_sector
		setvar $i 1
		setvar $destination 0
		while ($i <= $neararray)
			setvar $focus $neararray[$i]
			getsectorparameter $focus "FIGSEC" $isfigged
			getwordpos $database $pos " "&$focus&" "
			if (($isfigged <> true) and ($pos > 0))
				getdistance $distancethere $player~current_sector $focus
				getdistance $distanceback $focus $player~current_sector
				if ($distancethere < 0)
					send "^f"&$player~current_sector&"*"&$focus&"*q"
					waiton "ENDINTERROG"
					getdistance $distancethere $player~current_sector $focus
				end
				if ($distanceback < 0)
					send "^f"&$focus&"*"&$player~current_sector&"*q"
					waiton "ENDINTERROG"
					getdistance $distanceback $focus $player~current_sector
				end
				setvar $destination $focus
				goto :check_answer
			end
			add $i 1
		end
	else
		getrnd $random 1 $databasecount
		getword $database $destination $random
		getwordpos $tried_paths $pos " "&$destination&" "
		if (($destination <> 0) and ($pos > 0))
			add $loop 1
			if ($loop > $loop_limit)
				goto :stop_gridder
			end
			goto :get_new_random_path
		end
	end

	:check_answer
	setvar $stripped_database $database
	replacetext $stripped_database " " ""
	if (($destination = 0) and ($stripped_database <> ""))
		goto :get_new_random_path
	end
	loadvar $player~surroundavoidshieldedonly
	loadvar $player~surroundavoidallplanets
	if ($gridtargets = true)
		#if gridding targets, check to see if someone already gridded the target
		if ($destination <> "0")
			getsectorparameter $destination "FIGSEC" $isfigged
			if ($isfigged = true)
				setvar $temp " "&$destination&" "
				replacetext $database $temp " "
				subtract $databasecount 1
				goto :get_new_random_path
			end
		end
	end
	if (($stripped_database = "") or ($destination = "0"))
		if ($gridtargets = true)
			gosub :findalltargetsectors
		else

			:stop_gridder
			setvar $switchboard~message " Database Cleared - Wandered everywhere I could go...*"
			gosub :switchboard~switchboard
			halt
		end
	else

		:try_to_skip_ahead
		gosub :getcourses
		if ($valid)
			setvar $closestfiggedsector 0
			if (($gridtargets = true) and ($unfigged <> true))
				setvar $j $courselength
				while ($j >= 3)
					getsectorparameter $course[$j] "FIGSEC" $isfigged
					if (($course[$j] <= 10) or ($course[$j] = $map~stardock))
						setvar $isfigged true
					end
					if ($isfigged = true)
						setvar $closestfiggedsector $course[$j]
						setvar $index $j
						#if ($j = $courseLength)
						setvar $player~warpto $closestfiggedsector
						gosub :move~twarp
						gosub  :player~currentprompt
						if ($player~twarpsuccess = true)
							setvar $j $index
							add $total_turns $player~turns_per_warp
						else
							setsectorparameter $closestfiggedsector "FIGSEC" false
							setvar $j 3
						end
						goto :mowfromhere
						#end
					else
						if ($j = 3)
							goto :mowfromhere
						end
						if ($closestfiggedsector > 0)
							setvar $player~warpto $closestfiggedsector
							gosub :move~twarp
							gosub  :player~currentprompt
							if ($player~twarpsuccess = true)
								setvar $j ($index + 1)
								add $total_turns $player~turns_per_warp
								setvar $twarp_from $player~current_sector
								setvar $twarp_to $closestfiggedsector
								gosub :window
							else
								setsectorparameter $closestfiggedsector "FIGSEC" false
								setvar $j 3
							end
							goto :mowfromhere
						end
					end
					subtract $j 1
				end
			else
				setvar $j 3
				while ($j <= $courselength)
					getsectorparameter $course[$j] "FIGSEC" $isfigged
					if (($course[$j] <= 10) or ($course[$j] = $map~stardock))
						setvar $isfigged true
					end
					if ($isfigged = true)
						setvar $closestfiggedsector $course[$j]
						setvar $index $j
						if ($j = $courselength)
							setvar $player~warpto $closestfiggedsector
							gosub :move~twarp
							gosub  :player~currentprompt
							if ($player~twarpsuccess = true)
								setvar $j $index
								add $total_turns $player~turns_per_warp
							else
								setsectorparameter $closestfiggedsector "FIGSEC" false
								setvar $j 3
							end
							goto :mowfromhere
						end
					else
						if ($j = 3)
							goto :mowfromhere
						end
						if ($closestfiggedsector > 0)
							setvar $player~warpto $closestfiggedsector
							gosub :move~twarp
							gosub  :player~currentprompt
							if ($player~twarpsuccess = true)
								setvar $j ($index + 1)
								add $total_turns $player~turns_per_warp
								setvar $twarp_from $player~current_sector
								setvar $twarp_to $closestfiggedsector
								gosub :window
							else
								setsectorparameter $closestfiggedsector "FIGSEC" false
								setvar $j 3
							end
							goto :mowfromhere
						end
					end
					add $j 1
				end
			end
			setvar $j 3

			:mowfromhere
			setvar $figged_sectors " "
			while ($j <= $courselength)
				getsectorparameter $course[$j] "FIGSEC" $isfigged
				if (($isfigged = true) and (($tried <= 5) or ($player~ore_holds > 100)))
					add $tried 1
					if ($share = true) and ($figged_sectors <> " ")
						send "'<"&$bot~subspace&">[Figged:"&$figged_sectors&"]<"&$bot~subspace&">* "
					end
					goto :try_to_skip_ahead
				end
				send "za"&$maxfigattack&"* z * "
				setvar $old_density sector.density[$course[$j]]
				send "s*"
				waitfor "Relative Density Scan"
				waitfor "Command ["
				if ((sector.density[$course[$j]] > $old_density) and (sector.density[$course[$j]] >= 505) and (($player~unlimitedgame <> true) or (($player~unlimitedgame = true) and (sector.explored[$course[$j]] <> "YES"))))
					send "szh*  "
					waitfor "Long Range Scan"
					add $total_turns 1
				end

				if ($player~surroundavoidallplanets = true)
					if ((sector.density[$course[$j]] >= 500) and (sector.planetcount[$course[$j]] > 0) and ($course[$j] > 10) and ($course[$j] <> $map~stardock))
						setvar $switchboard~message "Planet in my path in sector "&$course[$j]&".  Wandering somewhere else..*"
						gosub :switchboard~switchboard
						send "cv"&$course[$j]&"*q"
						waiton "will now be avoided in future navigation calculation"
						goto :abort
					end
				else
					if ($player~surroundavoidshieldedonly = true)
						if ((sector.density[$course[$j]] >= 500) and (sector.planetcount[$course[$j]] > 0) and ($course[$j] > 10) and ($course[$j] <> $map~stardock))
							setvar $containsshieldedplanet false
							setvar $test_sector $course[$j]
							if (sector.planetcount[$test_sector] > 0)
								setvar $p 1
								while ($p <= sector.planetcount[$test_sector])
									getword sector.planets[$test_sector][$p] $test 1
									if ($test = "<<<<")
										setvar $containsshieldedplanet true
									end
									add $p 1
								end
							end

							if (containsshieldedplanet = true)
								setvar $switchboard~message "Shielded Planet in my path in sector "&$course[$j]&".  Wandering somewhere else..*"
								gosub :switchboard~switchboard
								send "cv"&$course[$j]&"*q"
								waiton "will now be avoided in future navigation calculation"
								goto :abort
							end
						end
					end
				end

				if (sector.figs.quantity[$course[$j]] >= ($offodd*2))
					setvar $switchboard~message "Too many fighters for me to take on in sector "&$course[$j]&". Wandering somewhere else..*"
					gosub :switchboard~switchboard
					send "cv"&$course[$j]&"*q"
					waiton "will now be avoided in future navigation calculation"
					goto :abort
				end
				setvar $result "m  "&$course[$j]&"* "
				setvar $player~current_sector $course[$j]
				savevar $player~current_sector
				setvar $figstodrop 1
				add $total_turns $player~turns_per_warp
				if (($course[$j] > 10) and ($course[$j] <> $map~stardock))
					setvar $result $result&"za"&$maxfigattack&"* z * "
				end
				if (($course[$j] > 10) and ($course[$j] <> $map~stardock) and ($j > 2))
					setvar $result $result&"f "&$figstodrop&"* c d *"
					getsectorparameter $course[$j] "FIGSEC" $isfigged
					if ($isfigged <> true)
						add $total_gridded 1
						setsectorparameter $course[$j] "FIGSEC" true
						setvar $figged_sectors $figged_sectors&" "&$course[$j]&" "

						gosub :window
					end
					setvar $temp " "&$course[$j]&" "
					getwordpos $database $pos $temp
					if ($pos > 0)
						replacetext $database $temp " "
						subtract $databasecount 1
					end
				end
				setvar $result $result&"**   "
				send $result

				setarray $old_density 6
				setvar $old_density[1] 0
				setvar $old_density[2] 0
				setvar $old_density[3] 0
				setvar $old_density[4] 0
				setvar $old_density[5] 0
				setvar $old_density[6] 0

				setvar $i 1
				while (sector.warps[$player~current_sector][$i] > 0)
					setvar $old_density[$i] sector.density[sector.warps[$player~current_sector][$i]]
					add $i 1
				end

				send "s*"
				waitfor "Relative Density Scan"
				gosub :player~quikstats

				if ($player~unlimitedgame <> true)
					if ($player~turns <= $bot~bot_turn_limit)
						setvar $switchboard~message "Reached the bot's turn limit.  Stopping my wandering for now.*"
						gosub :switchboard~switchboard
						setvar $switchboard~message "Total sectors gridded: "&$total_gridded&"   Total turns used: "&$total_turns&"*"
						gosub :switchboard~switchboard
						gosub :window
						halt
					end
				end
				if ($player~$player~twarp_type = "No")
					goto :callsaveme
				end
				if (($player~total_holds <> $player~ore_holds) and (($player~ore_holds < 100) or ($player~unlimited_game = true)) and ((port.exists[$player~current_sector] = true) and (port.buyfuel[$player~current_sector] = false) and (port.class[$player~current_sector] > 0) and (port.class[$player~current_sector] < 9)))
					if (haggle)
						send "pt*"
						waitfor "<Port>"
						waitfor "How many holds of Fuel Ore do you want to buy ["
						waitfor "Your offer ["
						waitfor "Command [TL="
					else
						send "pt*"
						gosub :haggle~starthaggle
					end
					add $total_turns 1
					gosub :player~quikstats
				end
				setvar $i 1
				setvar $holo false
				while (sector.warps[$player~current_sector][$i] > 0)
					if ((sector.density[sector.warps[$player~current_sector][$i]] > $old_density[$i]) and (sector.density[sector.warps[$player~current_sector][$i]] >= 505))
						setvar $holo true
					end
					add $i 1
				end
				if ($holo = true)
					setvar $before_holo_kill_sector $player~current_sector
					gosub :combat~holokill
					if (($sector~holotargetfound = true) and ($player~current_sector <> $before_holo_kill_sector))
						setvar $player~warpto $before_holo_kill_sector
						gosub :move~twarp
						if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
							setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
						end
					end
					if ($switchboard~message <> "No targets found adjacent.*")
						gosub :switchboard~switchboard
					end
					add $total_turns 1
				end
				add $j 1
			end
			//check for adjacent non-figged sectors without twarping away first.

			:checkforadjacent
			gosub :player~quikstats
			setvar $i 1
			setvar $isfigged false
			setvar $adjacenttarget 0
			while ((sector.warps[$player~current_sector][$i] > 0) and ($isfigged <> true))
				getsectorparameter sector.warps[$player~current_sector][$i] "FIGSEC" $isfigged
				if (($isfigged <> true) and (sector.warps[$player~current_sector][$i] > 10) and (sector.warps[$player~current_sector][$i] <> $map~stardock))
					setvar $adjacenttarget sector.warps[$player~current_sector][$i]
				end
				add $i 1
			end
			if ($adjacenttarget > 0)
				setvar $result "m  "&$adjacenttarget&"* "
				setvar $player~current_sector $adjacenttarget
				savevar $player~current_sector
				setvar $figstodrop 1
				add $total_turns $player~turns_per_warp
				if (($adjacenttarget > 10) and ($adjacenttarget <> $map~stardock))
					setvar $result $result&"za"&$maxfigattack&"* z * "
				end
				if (($adjacenttarget > 10) and ($adjacenttarget <> $map~stardock))
					setvar $result $result&"f "&$figstodrop&"* c d *"
					getsectorparameter $adjacenttarget "FIGSEC" $isfigged
					if ($isfigged <> true)
						add $total_gridded 1
						setsectorparameter $adjacenttarget "FIGSEC" true
						setvar $figged_sectors $figged_sectors&" "&$adjacenttarget&" "

						gosub :window
					end
					setvar $temp " "&$adjacenttarget&" "
					getwordpos $database $pos $temp
					if ($pos > 0)
						replacetext $database $temp " "
						subtract $databasecount 1
					end
				end
				setvar $result $result&"**   "
				send $result
				goto :checkforadjacent
			else

			end

		else

			setvar $tried_paths $tried_paths&" "&$destination&" "
			goto :try_again
		end

		:abort
		if ($share = true) and ($figged_sectors <> " ")
			send "'<"&$bot~subspace&">[Figged:"&$figged_sectors&"]<"&$bot~subspace&">* "
		end
		setvar $temp " "&$destination&" "
		replacetext $database $temp " "
		subtract $databasecount 1
	end
end

halt

:findalltargetsectors
setvar $targetsectorcount 11
setvar $databasecount 0
setvar $database ""
setvar $adjacentdatabase ""

echo ansi_14 "* Loading target sectors..*" ansi_7
setvar $perc 0
if ($gridtargets)
	setvar $m 1
	while ($m <= $targetsectors)
		setvar $destination $targetsectors[$m]
		getsectorparameter $destination "FIGSEC"  $isfigged
		if ($isfigged = "")
			setvar $isfigged false
		end
		#gosub :getCourses

		striptext $destination " "
		if (($isfigged <= 0) and ($destination > 10) and ($destination <> $map~stardock))
			setvar $database $database&" "&$destination&" "
			setvar $isfound true
			add $databasecount 1
		end
		setvar $perctest (($m * 100) / $targetsectors)
		if ($perctest > $perc)
			setvar $perc (($m * 100) / $targetsectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ansi_14 "°" ansi_15 " " $perc "%" #27 & "[1A   "
		end
		add $m 1
	end

else
	while ($targetsectorcount <= sectors)
		getsectorparameter $targetsectorcount "FIGSEC"  $isfigged
		if ($isfigged = "")
			setvar $isfigged false
		end
		if (($isfigged <= 0) and ($targetsectorcount <> $map~stardock))
			setvar $database $database&" "&$targetsectorcount&" "
			setvar $isfound true
			add $databasecount 1
		end
		setvar $perctest (($targetsectorcount * 100) / sectors)
		if ($perctest > $perc)
			setvar $perc (($targetsectorcount * 100) / sectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ansi_14 "°" ansi_15 " " $perc "%" #27 & "[1A   "
		end
		add $targetsectorcount 1

	end
end
setvar $switchboard~message " "&$databasecount&" target sectors without fighters found.*"
gosub :switchboard~switchboard
if ($databasecount <= 0)
	setvar $switchboard~message " Wandered everywhere I could go... Refresh fighters and update warp data to verify..*"
	gosub :switchboard~switchboard
	halt
end
return

:callsaveme
send "'"&currentsector&"=saveme*q q q q * '"&$switchboard~bot_name&" call*"
halt

:getcourses
killalltriggers
setarray $course 80
setvar $courselength 0
setvar $sectors ""
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"**q"
pause

:sectorsline
killalltriggers
setvar $line currentline
replacetext $line ">" " "
striptext $line "("
striptext $line ")"
setvar $line $line&" "
getwordpos $line $pos "So what's the point?"
getwordpos $line $pos2 ": ENDINTERROG"
if (($pos > 0) or ($pos2 > 0))
	goto :nopath
end
getwordpos $line $pos " sector "
getwordpos $line $pos2 "TO"
if (($pos <= 0) and ($pos2 <= 0))
	setvar $sectors $sectors & " " & $line
end
getwordpos $line $pos " "&$destination&" "
getwordpos $line $pos2 "("&$destination&")"
getwordpos $line $pos3 "TO"
if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	goto :gotsectors
else
	settextlinetrigger sectorlinetrig :sectorsline " > "
	settextlinetrigger sectorlinetrig2 :sectorsline " "&$destination&" "
	settextlinetrigger sectorlinetrig3 :sectorsline " "&$destination
	settextlinetrigger sectorlinetrig4 :sectorsline "("&$destination&")"
	settextlinetrigger donepath :sectorsline "So what's the point?"
	settextlinetrigger donepath2 :sectorsline ": ENDINTERROG"
end
pause

:gotsectors
killalltriggers
setvar $sectors $sectors&" :::"
setvar $courselength 0
setvar $coursefighters 0
setvar $index 1
setvar $valid false
setvar $course_print ""

:keepgoing
getword $sectors $course[$index] $index
while ($course[$index] <> ":::")
	add $courselength 1
	add $index 1
	getword $sectors $course[$index] $index

	if ($course[$index] <> ":::")
		getsectorparameter $course[$index] "FIGSEC"  $isfigged
		if ($isfigged)
			setvar $course_print $course_print&" ["&$course[$index]&"]"
			add $coursefighters 1
		else
			if (($course[$index] <= 10) or ($course[$index] = $map~stardock))
				setvar $course_print $course_print&" <"&$course[$index]&">"
				add $coursefighters 1
			else
				setvar $course_print $course_print&" "&$course[$index]
			end
		end
		setvar $valid true
	end
end

:nopath
killalltriggers

if (($gridtargets <> true) and ($player~unlimitedgame <> true) and ($tried <= 0) and ($nearest <> true))
	if (($courselength <= 10) and (($courselength - $coursefighters) <= 0)) or (($courselength > 10) and ($player~fuel_ore < 150) and (($courselength - $coursefighters) <= 3))
		setvar $valid false
	end
end
if (($valid = true) and ($tried <= 0))
	setvar $window_content $course_print&"[][]Total turns: "&$total_turns&"[][]Total gridded: "&$total_gridded&"[][]"
	savevar $window_content
end
return

:window
setvar $c 2
setvar $course_print ""
while ($c <= $courselength)
	getsectorparameter $course[$c] "FIGSEC"  $isfigged
	if ($isfigged)
		if ($twarp_to = $course[$c])
			setvar $course_print $course_print&" ->["&$course[$c]&"]<-"
		else
			if ($twarp_from = $course[$c])
				setvar $course_print $course_print&" ["&$course[$c]&"]-->"
			else
				setvar $course_print $course_print&" ["&$course[$c]&"]"
			end
		end
	else
		setvar $course_print $course_print&" "&$course[$c]
	end
	add $c 1
end
setvar $window_content $course_print&"[][]Total turns: "&$total_turns&"[][]Total gridded: "&$total_gridded&"[][]"
if ($nearest = true)
	setvar $window_content $window_content&"Nearest unfigged: "&$destination&" ("&$distancethere&" hop(s))[][]"
end
#if ($adjacentTarget > 0)
#	setVar $window_content $window_content&"Adjacent Sector: "&$adjacentTarget&"[][]"
#else
#	setVar $window_content $window_content&"No Adjacent Sector Found [][] [][]"
#end

setvar $i 1
setvar $isfigged false
setarray $displayarray 6
setvar $displayarray[1] "     "
setvar $displayarray[2] "     "
setvar $displayarray[3] "     "
setvar $displayarray[4] "     "
setvar $displayarray[5] "     "
setvar $displayarray[6] "     "

while ((sector.warps[$player~current_sector][$i] > 0) and ($isfigged <> true))
	getsectorparameter sector.warps[$player~current_sector][$i] "FIGSEC" $isfigged
	if ($isfigged <> true)
		setvar $displayarray[$i] sector.warps[$player~current_sector][$i]
	else
		setvar $displayarray[$i] "["&sector.warps[$player~current_sector][$i]&"]"
	end
	add $i 1
end

getsectorparameter $player~current_sector "FIGSEC" $isfigged
if ($isfigged = true)
	setvar $displaycenter "["&$player~current_sector&"]"
else
	setvar $displaycenter $player~current_sector
end

setvar $window_content $window_content&$displayarray[1]&"  "&$displayarray[5]&"  "&$displayarray[2]&"[][]"
setvar $window_content $window_content&"        "
if ($displayarray[1] <> "     ")
	setvar $window_content $window_content&"\"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"   "
if ($displayarray[5] <> "     ")
	setvar $window_content $window_content&"|"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"  "
if ($displayarray[2] <> "     ")
	setvar $window_content $window_content&"/"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"[][]"

setvar $window_content $window_content&"         "&$displaycenter&"  [][]"

setvar $window_content $window_content&"        "
if ($displayarray[3] <> "     ")
	setvar $window_content $window_content&"/"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"   "
if ($displayarray[6] <> "     ")
	setvar $window_content $window_content&"|"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"  "
if ($displayarray[4] <> "     ")
	setvar $window_content $window_content&"\"
else
	setvar $window_content $window_content&" "
end
setvar $window_content $window_content&"[][]"

setvar $window_content $window_content&$displayarray[3]&"  "&$displayarray[6]&"  "&$displayarray[4]&"[][]"

savevar $window_content
return

#INCLUDES:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
include "source\include\switchboard.ts"
