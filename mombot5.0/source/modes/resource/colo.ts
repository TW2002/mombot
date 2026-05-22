logging off
gosub :loadvars~loadvars
gosub :help~initialize

#HELP FILE
setvar $help~help[1]  $help~tab&"Gets colos from Terra  "
setvar $help~help[2]  $help~tab&"  "
setvar $help~help[3]  $help~tab&"colo [r/s/m/t/p] {misc} {t/b} {f} {c:x}  "
setvar $help~help[4]  $help~tab&"         "
setvar $help~help[5]  $help~tab&"Options: "
setvar $help~help[6]  $help~tab&"   - [r/s/m/t/p] = [r]ed/[s]peed/[m]ilk/[t]imed/speed [p]ort"
setvar $help~help[7]  $help~tab&"     speed = cycles - cycles to grab colos (default max)"
setvar $help~help[8]  $help~tab&"     milk  = min colos - min colos before grab (default 0)"
setvar $help~help[9]  $help~tab&"     timed = delay  - time to wait each cycle (default 15 seconds)"
setvar $help~help[10]  $help~tab&"    red   = jump sector - sector next to terra (can place planet there too)"
setvar $help~help[11]  $help~tab&"     speed port   = same as speed but uses port for ore"
setvar $help~help[12] $help~tab&"   - [misc]  = cycles/min colos/delay"
setvar $help~help[13] $help~tab&"   - [t/b]   = [t]warp/[b]warp  (default is [t]warp)"
setvar $help~help[14] $help~tab&"   - [f]   = Bwarp [S] Mode Only - Pick up fuel every 2nd trip"
setvar $help~help[15] $help~tab&"   - [c:x]   = [c]amo holds (example: c:3 adds 3 holds extra fuel)"
gosub :help~helpfile

setvar $switchboard~message "Colonizer starting up!*"
gosub :switchboard~switchboard

# ======================     START COLO (COLO) SUBROUTINE    ==========================
goto :start_up_routines

:colo_next
setvar $colo_sector $player~current_sector
setvar $mcol_holds $player~total_holds

if ($colo_type = "r")
	if ($bot~parm2 <= 0)
		setvar $switchboard~message "No jump sector defined for red colo. Halting.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $player~starting_point $bot~parm2
	setvar $player~destination 1
	gosub :player~getcourse
	setvar $j 2
	setvar $result ""
	while ($j <= $player~courselength)
		if ($player~course[$j] <> $player~current_sector)
			setvar $result $result&"m    "&$player~course[$j]&"*               "
			if (($player~course[$j] > 10) and ($player~course[$j] <> $map~stardock))
				setvar $result $result&"za  "&$ship~ship_max_attack&"* *             "
			end
		end
		add $j 1
	end
	setvar $to_mow $result
	setvar $no_twarp false
	if ($colo_sector <> $bot~parm2)
		send "cf" $colo_sector "*"&$bot~parm2&"*q"
		waitfor "The shortest path"
		getword currentline $colo_hops1 4
		striptext $colo_hops1 "("
		setvar $colo_fuel1 ($colo_hops1 * 3)
	else
		#already as close to terra as possible
		setvar $colo_fuel1 0
		setvar $colo_hops1 0
		setvar $no_twarp true
	end
else
	send "cf" $colo_sector "*1*q"
	waitfor "The shortest path"
	getword currentline $colo_hops1 4
	striptext $colo_hops1 "("
	setvar $colo_fuel1 ($colo_hops1 * 3)
end
send "cf1*" $colo_sector "*q"
waitfor "The shortest path"
getword currentline $colo_hops2 4
striptext $colo_hops2 "("
setvar $colo_fuel2 ($colo_hops2 * 3)
if ($bwarp)
	if ($colo_hops1 > $planet~planet_transport)
		setvar $switchboard~message "B-Warp on planet not upgraded enough for B-warp Colo*"
		gosub :switchboard~switchboard
		halt
	end
	#ham setvar $colo_fuel $colo_fuel2
	if ($doubleore = true)

		setvar $colo_fuel ($colo_fuel2 * 2)
	else
		setvar $colo_fuel $colo_fuel2
	end
	setvar $colo_get ($mcol_holds - $colo_fuel1)
	setvar $player~turnspercycle (1+$player~turns_per_warp+1+1)
else
	setvar $colo_fuel ($colo_fuel1 + $colo_fuel2)
	setvar $colo_get ($mcol_holds - $colo_fuel1)
	setvar $player~turnspercycle ($player~turns_per_warp+$player~turns_per_warp+1+1)
end

### Speed Port - Work out max cycles
# ASsumption is that even with bwarp we are just using fuel from port.
# else why else do it?

if ($colo_type = "p")
	if ($bwarp)
		# Fuel THere
		setvar $fuel_req ($colo_hops1 * 10)

		# plus back
		add $fuel_req $colo_fuel2
	else
		setvar $fuel_req ($colo_fuel1 + $colo_fuel2)
	end
	send "cr*q"
	waitfor "Commerce report for"
	waitfor "Fuel Ore"
	getword currentline $fuel_avail 4
	if ($allore = true)
		# buying a full load each trip
		setvar $max_trips ($fuel_avail/$mcol_holds)
		setvar $portbuy $mcol_holds
	else
		# buying just what is required
		setvar $max_trips ($fuel_avail/$fuel_req)
		setvar $portbuy $fuel_req
	end

	# BWARP Only
	setvar $leave_ore ($portbuy - $colo_fuel2)
	# user has chosen a max trips
	if ($colo_misc > 0)
		# just bring it down to max trips
		if ($colo_misc > $max_trips)
			setvar $colo_misc $max_trips
		end
	else
		#user did not choose but we will choose for them to not run out of fuel
		setvar $colo_misc $max_trips
	end

	setvar $portburst "p  t  "&$portbuy&"  *  * "

	if ($allore = false)
		if (port.buyorg[currentsector] = 0)
			setvar $portburst $portburst&"0*  "
		end
		if (port.buyequip[currentsector] = 0)
			setvar $portburst $portburst&"0*  "
		end
	end
end

###
:colo_land
if ($camoholds = true)
	if (($camo_holds + $colo_fuel) >= $player~total_holds)
		setvar $switchboard~message "Too many camo holds for this ship.*"
		gosub :switchboard~switchboard
		halt
	end
	send " j y l " $planet~planet "*  t * t 1 " ($colo_fuel+$camo_holds) "*  "
else
	if ($doubleore = true)

		send " j y l " $planet~planet "*  "
		if ($doubleoreget = true)
			setvar $doubleoreget false
			send "t * t 1 " $colo_fuel "*  "
		else
			setvar $doubleoreget true

		end
	else
		if ($colo_type = "p")
			send " j y " $portburst " l " $planet~planet "*  "
			if ($bwarp)
				send " t  n   l   1   " $leave_ore " *  "
			end
		else
			send " j y l " $planet~planet "*  t * t 1 " $colo_fuel "*  "
		end
	end
end
if ($bwarp = true)
	send "c "
else
	send "q "
end

if ($player~planet_scanner = "No")
	setvar $land_mac "  L  T  " & $bot~parm2 & "*   "
else
	setvar $land_mac "  L  1*  T  " & $bot~parm2 & "*   "
end
if ($colo_type = "m")
	if ($bot~parm2 < 1)
		setvar $bot~parm2 1
	end
	setvar $colo_min $colo_misc
	while (true)
		if (($player~unlimitedgame = false) and ($player~turns < ($bot~bot_turn_limit+$player~turnspercycle)))
			if ($bwarp = false)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			setvar $switchboard~message "Too low on turns to continue. Turn limit set to: "&($bot~bot_turn_limit)&" turns.*"
			gosub :switchboard~switchboard
			halt
		end
		if ($bwarp)
			send "b 1*y "
			settextlinetrigger 36 :nofuel2 "This planet does not have enough Fuel Ore to transport you."
		else
			send "m 1* y y "
			settextlinetrigger 36 :nofuel2 "<Set NavPoint>"
		end
		settextlinetrigger 37 :colo_wait "All Systems Ready, shall we engage?"
		pause

		:nofuel2
		killalltriggers
		if ($bwarp = false)
			send "* * l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		setvar $switchboard~message "Colonizer needs more fuel on planet "&$planet~planet&"."
		gosub :switchboard~switchboard
		halt

		:colo_wait
		gosub :player~quikstats
		setvar $empty_holds ($player~total_holds - ($player~colonist_holds + $player~ore_holds))
		#There are currently 3417042 colonists ready to leave Terra.
		if ($empty_holds <= 0)
			goto :grabbed
		end

		:check_colos
		if ($player~planet_scanner = "No")
			send "  l q "
		else
			send "  l  1*q "
		end
		waiton " colonists ready to leave Terra."
		getword currentline $scam_check 1
		if ($scam_check <> "There")
			goto :check_colos
		end
		getword currentline $colos_on_terra 4
		if ($colos_on_terra < $colo_min)
			goto :check_colos
		end
		if ($colos_on_terra > $empty_holds)
			setvar $amount_to_grab $empty_holds
		else
			setvar $amount_to_grab $colos_on_terra
		end
		if ($player~planet_scanner = "No")
			setvar $land_mac "  L  T"&$amount_to_grab&"*   "
		else
			setvar $land_mac "  L  1*  T"&$amount_to_grab&"*   "
		end

		send $land_mac
		settextlinetrigger	done	:done		"The Colonists file aboard your ship"
		settextlinetrigger	none	:done		"There aren't that many on Terra!"
		settextlinetrigger  none2   :done       "You return to your ship and leave the planet."
		settexttrigger		grabbed	:grabbed	"([0] empty holds)"
		pause

		:done
		killalltriggers
		goto :colo_wait

		:grabbed
		killalltriggers

		send " M"& $colo_sector & "* Y "
		settextlinetrigger	whoops			:whoops			"You don't have enough turns left"
		settexttrigger 		twarp_lock		:twarp_lock 	"All Systems Ready, shall we engage"
		settexttrigger 		no_twrp_lock	:no_twarp_lock	"Do you want to make this jump blind"
		pause

		:whoops
		killalltriggers
		send "  **  "
		setvar $switchboard~message "Out Of Turns. At Terra!*"
		gosub :switchboard~switchboard
		halt

		:no_twarp_lock
		killalltriggers
		send " N "
		setvar $switchboard~message "Unable To Return Twarp, No Fighter Lock!*"
		gosub :switchboard~switchboard
		halt

		:twarp_lock
		killalltriggers
		send " y * l "&$planet~planet&"* s**"&$colo_prod&"* "

		settextlinetrigger	33 				:more			"The Colonists disembark"
		settextlinetrigger	34				:next_item		"There isn't room on the planet"
		pause

		:next_item
		killalltriggers
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		#IF PLANET FULL, HALT SCRIPT
		if ($colo_prod >= 4)
			setvar $switchboard~message "Planet is full of colonists, no more can be added. Colonizer shutting down.**"
			gosub :switchboard~switchboard
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
			halt
		end
		send "s**"&$colo_prod&"* "

		:more
		#KEEP RUNNING

		if ($bwarp)
			send "t * t 1"&$colo_fuel&"* c "
		else
			send "t * t 1"&$colo_fuel&"* q "
		end
		gosub :player~quikstats
		killalltriggers
	end
elseif ($colo_type = "p")
	setvar $colo_cycles $colo_misc
	setvar $i 0
	if ($colo_cycles = 0)
		setvar $keepgoing true
	else
		setvar $keepgoing false
	end
	while (($i < $colo_cycles) or ($keepgoing))
		if (($player~unlimitedgame = false) and ($player~turns < ($bot~bot_turn_limit+$player~turnspercycle)))
			if ($bwarp = false)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			setvar $switchboard~message "Too low on turns to continue. Turn limit set to: "&($bot~bot_turn_limit)&" turns.*"
			gosub :switchboard~switchboard
			halt
		end

		:colo_speed_port
		killalltriggers

		if ($bwarp = true)
			if ($player~planet_scanner = "No")
				setvar $coloburst "b 1*y    l * * "
			else
				setvar $coloburst "b 1*y    l 1* * * "
			end
		else
			if ($player~planet_scanner = "No")
				setvar $coloburst "m 1* y y    l * * "
			else
				setvar $coloburst "m 1* y y    l 1* * * "
			end

		end
		setvar $coloburst $coloburst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"

		if ($bwarp = true)
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* "
			else
				setvar $coloburst $coloburst&""
			end

			#setVar $coloBurst $coloBurst&"  t * t 1"&$colo_fuel&"* c "
			setvar $coloburst $coloburst& "   q   "&$portburst&"l "&$planet~planet&"*  t  n   l   1   "&$leave_ore&" *  c "
		else
			if ($colo_prod < 3)
				#setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* q * "&$portburst
			else
				#setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* q "
				setvar $coloburst $coloburst&" q * " &$portburst
			end
		end
		send $coloburst
		if ($bwarp = true)
			settextlinetrigger 136 :nofuelport "This planet does not have enough Fuel Ore to transport you."
		else
			settextlinetrigger 136 :nofuelport "<Set NavPoint>"
		end
		settextlinetrigger 137 :fuelport "All Systems Ready, shall we engage?"
		pause

		:fuelport
		killalltriggers
		waitfor "There are currently"
		getword currentline $colo_colos 4

		settextlinetrigger 133 :moreport "The Colonists disembark"
		settextlinetrigger 134 :next_item_port "There isn't room on the planet"
		settextlinetrigger 135 :doneport "There aren't that many on Terra!"
		pause

		:nofuelport
		killalltriggers
		if ($bwarp <> true)
			send "* * l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		setvar $switchboard~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		halt

		:doneport
		killalltriggers
		setvar $switchboard~message "Terra is empty. Colonizer shutting down.*"
		gosub :switchboard~switchboard
		if ($bwarp <> true)
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		halt

		:next_item_port
		killalltriggers
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		#IF PLANET FULL, HALT SCRIPT
		if ($colo_prod >= 4)
			setvar $mode "General"
			savevar $mode
			setvar $switchboard~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
			gosub :switchboard~switchboard
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
			halt
		end

		:moreport
		killalltriggers
		add $i 1
		if ($player~unlimitedgame = false)
			setvar $player~turns ($player~turns-$player~turnspercycle)
		end
	end
elseif ($colo_type = "s")
	setvar $colo_cycles $colo_misc
	setvar $i 0
	if ($colo_cycles = 0)
		setvar $keepgoing true
	else
		setvar $keepgoing false
	end
	while (($i < $colo_cycles) or ($keepgoing))
		if (($player~unlimitedgame = false) and ($player~turns < ($bot~bot_turn_limit+$player~turnspercycle)))
			if ($bwarp = false)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			setvar $switchboard~message "Too low on turns to continue. Turn limit set to: "&($bot~bot_turn_limit)&" turns.*"
			gosub :switchboard~switchboard
			halt
		end

		:colo_speed
		killalltriggers

		if ($bwarp = true)
			if ($player~planet_scanner = "No")
				setvar $coloburst "b 1*y    l * * "
			else
				setvar $coloburst "b 1*y    l 1* * * "
			end
		else
			if ($player~planet_scanner = "No")
				setvar $coloburst "m 1* y y    l * * "
			else
				setvar $coloburst "m 1* y y    l 1* * * "
			end

		end
		setvar $coloburst $coloburst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
		if ($bwarp = true)
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* "
			else
				setvar $coloburst $coloburst&""
			end
			if ($doubleore = true)
				if ($doubleoreget = true)
					setvar $doubleoreget false
					setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* c "
				else
					setvar $doubleoreget true
					setvar $coloburst $coloburst&" c "
				end

			else
				setvar $coloburst $coloburst&"  t * t 1"&$colo_fuel&"* c "
			end

		else
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
			else
				setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* q "
			end
		end
		send $coloburst
		if ($bwarp = true)
			settextlinetrigger 36 :nofuel "This planet does not have enough Fuel Ore to transport you."
		else
			settextlinetrigger 36 :nofuel "<Set NavPoint>"
		end
		settextlinetrigger 37 :fuel "All Systems Ready, shall we engage?"
		pause

		:fuel
		killalltriggers
		waitfor "There are currently"
		getword currentline $colo_colos 4

		settextlinetrigger 33 :morespeed "The Colonists disembark"
		settextlinetrigger 34 :next_item_speed "There isn't room on the planet"
		settextlinetrigger 35 :donespeed "There aren't that many on Terra!"
		pause

		:nofuel
		killalltriggers
		if ($bwarp <> true)
			send "* * l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		setvar $switchboard~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		halt

		:donespeed
		killalltriggers
		setvar $switchboard~message "Terra is empty. Colonizer shutting down.*"
		gosub :switchboard~switchboard
		if ($bwarp <> true)
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		halt

		:next_item_speed
		killalltriggers
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		#IF PLANET FULL, HALT SCRIPT
		if ($colo_prod >= 4)
			setvar $mode "General"
			savevar $mode
			setvar $switchboard~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
			gosub :switchboard~switchboard
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
			halt
		end

		:morespeed
		killalltriggers
		add $i 1
		if ($player~unlimitedgame = false)
			setvar $player~turns ($player~turns-$player~turnspercycle)
		end
	end
elseif ($colo_type = "t")
	setvar $colo_delay $colo_misc
	setvar $i 0
	setvar $colo_got 0
	setvar $colo_gotten 0
	setvar $colo_trips 0
	if ($colo_delay = 0)
		setvar $colo_delay 15
	end
	while ($colo_prod < 4)

		:colo_timed
		killalltriggers
		gosub :player~quikstats
		if (($player~unlimitedgame = false) and ($player~turns < ($bot~bot_turn_limit+$player~turnspercycle)))
			if ($bwarp = false)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			setvar $switchboard~message "Too low on turns to continue. Turn limit set to: "&($bot_turn_limit)&" turns.*"
			gosub :switchboard~switchboard
			halt
		end

		if ($bwarp)
			if ($player~planet_scanner = "No")
				setvar $coloburst "b 1*y    l * "
			else
				setvar $coloburst "b 1*y    l 1* * "
			end
		else
			if ($player~planet_scanner = "No")
				setvar $coloburst "m 1* y y    l * "
			else
				setvar $coloburst "m 1* y y    l 1* * "
			end
		end
		send $coloburst
		waitfor "There are currently"
		getword currentline $colo_colos 4
		if ($colo_colos > $colo_get)
			send $colo_get&"* "
			setvar $colo_got $colo_get
		else
			send $colo_colos&"* "
			setvar $colo_got $colo_colos
		end
		setvar $coloburst "m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
		if ($bwarp)
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* c "
			else
				setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* c "
			end
		else
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
			else
				setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* q "
			end
		end
		send $coloburst
		if ($bwarp)
			settextlinetrigger 36 :nofueltimed "This planet does not have enough Fuel Ore to transport you."
		else
			settextlinetrigger 36 :nofueltimed "<Set NavPoint>"
		end
		settextlinetrigger 37 :fueltimed "All Systems Ready, shall we engage?"
		pause

		:fueltimed
		killalltriggers

		settextlinetrigger 33 :moretimed "The Colonists disembark"
		settextlinetrigger 34 :next_item_timed "There isn't room on the planet"
		pause

		:nofueltimed
		killalltriggers
		if ($bwarp <> true)
			send "* * l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		setvar $switchboard~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		halt

		:next_item_timed
		killalltriggers
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		#IF PLANET FULL, HALT SCRIPT
		if ($colo_prod >= 4)
			setvar $switchboard~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
			gosub :switchboard~switchboard
			if ($bwarp <> true)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			halt
		end

		:moretimed
		killalltriggers
		if ($colo_colos < $colo_get)
			add $colo_gotten $colo_got
			add $colo_trips 1
			setvar $switchboard~message "Cols Grabbed: " & $colo_got & " (" & $colo_trips & " Trips, Total: " & $colo_gotten & ")*"
			gosub :switchboard~switchboard
			setdelaytrigger 40 :colo_timed ($colo_delay*1000)
			pause
		end
	end
elseif ($colo_type = "r")
	setvar $jump_sector $colo_misc
	setvar $colo_prod 1
	while (true)
		if (($player~unlimitedgame = false) and ($player~turns < ($bot~bot_turn_limit+$player~turnspercycle)))
			if ($bwarp = false)
				send "l "&$planet~planet&"* "
				if ($startinglocation = "Citadel")
					send "c "
				end
			end
			setvar $switchboard~message "Too low on turns to continue. Turn limit set to: "&($bot~bot_turn_limit)&" turns.*"
			gosub :switchboard~switchboard
			halt
		end

		:colo_red
		killalltriggers
		if ($no_twarp = true)
			if ($player~planet_scanner = "No")
				setvar $coloburst $to_mow&"          l * * "
			else
				setvar $coloburst $to_mow&"          l 1* * * "
			end
		else
			if ($bwarp = true)
				if ($player~planet_scanner = "No")
					setvar $coloburst "b "&$jump_sector&"*y      "&$to_mow&"          l * * "
				else
					setvar $coloburst "b "&$jump_sector&"*y       "&$to_mow&"          l 1* * * "
				end
			else
				if ($player~planet_scanner = "No")
					setvar $coloburst "m "&$jump_sector&"* y y       "&$to_mow&"        l * * "
				else
					setvar $coloburst "m "&$jump_sector&"* y y       "&$to_mow&"        l 1* * * "
				end

			end
		end
		setvar $coloburst $coloburst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
		if ($bwarp = true)
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* c "
			else
				setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* c "
			end
		else
			if ($colo_prod < 3)
				setvar $coloburst $coloburst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
			else
				setvar $coloburst $coloburst&" t * t 1"&$colo_fuel&"* q "
			end
		end
		send $coloburst
		if ($bwarp = true)
			settextlinetrigger 36 :nofuelred "This planet does not have enough Fuel Ore to transport you."
		else
			settextlinetrigger 36 :nofuelred "<Set NavPoint>"
		end
		settextlinetrigger 37 :fuelred "All Systems Ready, shall we engage?"
		pause

		:fuelred
		#			killalltriggers
		#			waitfor "There are currently"
		#			getword CURRENTLINE $colo_colos 4

		settextlinetrigger 33 :morered "The Colonists disembark"
		settextlinetrigger 34 :next_item_red "There isn't room on the planet"
		settextlinetrigger 35 :donered "There aren't that many on Terra!"
		pause

		:nofuelred
		killalltriggers
		if ($bwarp <> true)
			send "* * l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		setvar $switchboard~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		halt

		:donered
		killalltriggers
		setvar $switchboard~message "Terra is empty. Colonizer shutting down.*"
		gosub :switchboard~switchboard
		if ($bwarp <> true)
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
		end
		halt

		:next_item_red
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		#IF PLANET FULL, HALT SCRIPT
		if ($colo_prod >= 4)
			setvar $mode "General"
			savevar $mode
			setvar $switchboard~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
			gosub :switchboard~switchboard
			send "l "&$planet~planet&"* "
			if ($startinglocation = "Citadel")
				send "c "
			end
			halt
		end

		:morered
		killalltriggers
		if ($player~unlimitedgame = false)
			setvar $player~turns ($player~turns-$player~turnspercycle)
		end
	end
end

# ======================     END COLO MILKER (colo) SUBROUTINE     ==========================
halt

:start_up_routines
getwordpos " "&$bot~user_command_line&" " $pos " b "
if ($pos > 0)
	setvar $bwarp true
	getwordpos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setvar $doubleore true
		setvar $doubleoreget true
	else
		setvar $doubleore false
	end
else
	setvar $bwarp false
end

getwordpos " "&$bot~user_command_line&" " $pos " allore "
if ($pos > 0)
	setvar $allore true
else
	setvar $allore false
end

getwordpos " "&$bot~user_command_line&" " $pos " c:"
if ($pos > 0)
	gettext " "&$bot~user_command_line&" " $camo_holds "c:" " "
	isnumber $test $camo_holds
	if ($test)
		setvar $camoholds true
	else
		setvar $switchboard~message "Invalid camo holds entered*"
		gosub :switchboard~switchboard
	end

else
	setvar $camoholds false
end

# ======================     START COLO  (COLO) SUBROUTINE    ==========================
:colo_setup
gosub :player~quikstats
getword $bot~user_command_line $bot~parm1 1
getword $bot~user_command_line $bot~parm2 2
getword $bot~user_command_line $bot~parm3 3
getword $bot~user_command_line $bot~parm4 4
getword $bot~user_command_line $bot~parm5 5
getword $bot~user_command_line $bot~parm6 6

setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	setvar $switchboard~message "Colo must be run from Planet or Citadel prompt*"
	gosub :switchboard~switchboard
	halt
end

if (($bot~parm1 <> "s") and ($bot~parm1 <> "m") and ($bot~parm1 <> "t") and ($bot~parm1 <> "r") and ($bot~parm1 <> "p"))
	setvar $switchboard~message "Please use colo [s]peed, [m]ilk, [r]ed, [t]imed*, or speed [p]ort*"
	gosub :switchboard~switchboard
	halt
end

setvar $colo_type $bot~parm1
if (($colo_type = "p") and (port.exists[currentsector] = 0))
	setvar $switchboard~message "No port here to buy fuel ore.*"
	gosub :switchboard~switchboard
	halt
end
if (($colo_type = "p") and (port.buyfuel[currentsector] = 1))
	setvar $switchboard~message "Port must sell fuel to use speed port colo.*"
	gosub :switchboard~switchboard
	halt
end
if (($player~alignment < 1000) and ($colo_type <> "r"))
	setvar $switchboard~message "Alignment is to low to colo for blue colo. Try colo r for red colo.*"
	gosub :switchboard~switchboard
	halt
elseif ($player~twarp_type <> "1") and ($player~twarp_type <> "2")
	setvar $switchboard~message "Must have Type 1 or 2 Twarp for Colo*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm2
if ($test <> true)
	setvar $bot~parm2 0
end
setvar $colo_misc $bot~parm2
# ======================     END COLO (COLO) SUBROUTINE     ==========================
setvar $colo_prod 1
setvar $colo_delay 1000
if ($startinglocation = "Citadel")
	send "Q"
end
gosub :planet~getplanetinfo
send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* q c u y q f 1* cd "
gosub :player~getinfo
goto :colo_next

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
