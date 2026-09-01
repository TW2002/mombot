logging "OFF"
gosub :help~initialize
setvar $help~help[1] $help~tab&"Moves fighters between planet(s) and sector."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  movefig [p | s] [amount | all] {all}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   [p] - move sector fighters to the planet."
setvar $help~help[6] $help~tab&"   [s] - move planet fighters to the sector."
setvar $help~help[7] $help~tab&"   [amount | all] - fighter amount to move."
setvar $help~help[8] $help~tab&"   {all} with s - pull fighters from all planets in sector."
setvar $help~help[9] $help~tab&"   Default/all with s leaves one shipload onboard."
setvar $help~help[10] $help~tab&"   Run from Planet or Citadel."
gosub :help~helpfile

loadvar $bot_name
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $stardock
loadvar $command
goto :figmove
include "source\include\planet"
include "source\include\ship"

:figmove
:movefig
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $total_moved 0
getword $user_command_line $parm1 1
getword $user_command_line $parm2 2

if (($parm2 = "p") or ($parm2 = "s"))
	setvar $movetosector $parm2
	isnumber $test $parm1
	if ($test or ($parm1 = "all"))
		if ($test)
			setvar $move $parm1
		end
	else
		setvar $switchboard~message "Please use movefig [p/s] [fighter amount]*"
		gosub :switchboard~switchboard
		halt
	end
elseif (($parm1 = "p") or ($parm1 = "s"))
	setvar $movetosector $parm1
	isnumber $test $parm2
	if ($test or ($parm2 = "all"))
		if ($test)
			setvar $move $parm2
		end
	else
		setvar $switchboard~message "Please use movefig [p/s] [fighter amount]*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Please use movefig [p/s] [fighter amount]*"
	gosub :switchboard~switchboard
	halt
end
getwordpos $user_command_line $pos " all"
setvar $allplanets false
if (($pos > 0) and ($movetosector = "s"))
	setvar $allplanets true
end
if ($startinglocation = "Citadel")
	send "q"
elseif ($startinglocation <> "Planet")
	setvar $switchboard~message "You must start this script from a planet!* "
	gosub :switchboard~switchboard
	halt
end
send "mnl*"
gosub :player~quikstats
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $sector_figs 0
send "q  q  z  n  **   "
waiton "Warps to Sector(s) :"
waiton "Command [TL"
gosub :player~quikstats

if ($allplanets)
	gosub :countplanets
else
	setvar $planetcount 1
	setvar $planets[1] $planet
end
setvar $figowner sector.figs.owner[$player~current_sector]
setvar $figquant sector.figs.quantity[$player~current_sector]

setvar $sector_figs $figquant
setvar $starting_planet $planet

if (($figquant <> 0) and (($figowner <> "belong to your Corp") and ($figowner <> "yours")))
	send "l "&$planet&"*"
	waiton "Planet command (?=help) [D]"
	if ($startinglocation = "Citadel")
		send "c"
		waiton "Citadel command"
	end
	setvar $switchboard~message "Friendly Fighters Not Present!*"
	gosub :switchboard~switchboard
	halt
end

setvar $planet_figs_room $planet~planet_fighters_max
subtract $planet_figs_room $planet~planet_fighters

gosub :getshipstats

setvar $i 1
while ($i <= $planetcount)

	if ($allplanets)
		setvar $move 0
	end
	send "l " $planets[$i] "*"
	waiton "Planet command (?=help) [D]"
	gosub :planet~getplanetinfo
	setvar $planet $planet~planet

	:start
	killalltriggers
	if ($movetosector = "s")
		setvar $reserve_ship_fighters false
		setvar $reserve_ship_figs_taken 0
		if ($move = 0)
			setvar $reserve_ship_fighters true
			setvar $ship_figs_room $ship_fighters_max
			subtract $ship_figs_room $player~fighters
			if ($ship_figs_room < 0)
				setvar $ship_figs_room 0
			end
			setvar $reserve_ship_figs_taken $ship_figs_room
			if ($reserve_ship_figs_taken > $planet~planet_fighters)
				setvar $reserve_ship_figs_taken $planet~planet_fighters
			end
			setvar $move $planet~planet_fighters
			subtract $move $reserve_ship_figs_taken
			if ($move < 0)
				setvar $move 0
			end
			setvar $total_moved 0
		end
		setvar $end_figs $sector_figs
		add $end_figs $move
		if ($move > $planet~planet_fighters)
			setvar $switchboard~message "Not Enough Figs on Planet*"
			gosub :switchboard~switchboard
			if ($startinglocation = "Citadel")
				send "c "
			end
			halt
		end
		while ($total_moved < $move)
			add $sector_figs $ship_fighters_max
			if ($sector_figs > $end_figs)
				setvar $sector_figs $end_figs
			end
			send "m  n  t  *  q  f z " $sector_figs "*  z c d  *  l " $planets[$i] "*  "
			add $total_moved $ship_fighters_max
		end
		if ($reserve_ship_fighters)
			send "m  n  t  *  "
			add $player~fighters $reserve_ship_figs_taken
			if ($player~fighters > $ship_fighters_max)
				setvar $player~fighters $ship_fighters_max
			end
		end
		send "q q * "
	end
	if ($movetosector = "p")
		if ($move = 0)
			setvar $move $sector_figs
			subtract $move 500
		end
		setvar $end_figs $move
		if ($planet_figs_room < $move)
			setvar $move $planet_figs_room
		end
		send "m n l * "
		while ($move > $ship_fighters_max)
			subtract $sector_figs $ship_fighters_max
			send "q f z " $sector_figs "* z c d  *  l " $planets[$i] "* m n l * "
			subtract $move $ship_fighters_max
		end
		subtract $sector_figs $move
		if ($sector_figs <> 0)
			send "q  f  z " $sector_figs "*  z  c  d  * l " $planets[$i] "*  m  n  l  * "
		else
			send "q  f  z * l " $planets[$i] "*  m  n  l * "
		end
	end

	add $i 1
end
gosub :player~quikstats
if ($player~current_prompt = "Planet")
	send "m*  *  **  q q * * "
end
setvar $planet $starting_planet
gosub :landingsub

setvar $switchboard~message "fighters moved*"
gosub :switchboard~switchboard
halt

:landingsub
send "l" $planet "*"
setvar $sucessfulcitadel false
setvar $sucessfulplanet false
settextlinetrigger noplanet :noplanet "There isn't a planet in this sector."
settextlinetrigger no_land :no_land "since it couldn't possibly stand"
settextlinetrigger planet :planet "Planet #"
settextlinetrigger wrongone :wrong_num "That planet is not in this sector."
setstrigger planetprompt :displayplanet "Planet command (?=help)"
pause

:displayplanet
killtrigger planet
killtrigger planetprompt
send "*"
settextlinetrigger planet :planet "Planet #"
pause

:noplanet
killtrigger no_land
killtrigger planet
killtrigger wrongone
killtrigger planetprompt
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return

:no_land
killtrigger noplanet
killtrigger planet
killtrigger wrongone
killtrigger planetprompt
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return

:planet
killtrigger planetprompt
getword currentline $pnum_ck 2
striptext $pnum_ck "#"
if ($pnum_ck <> $planet)
	killtrigger no_land
	killtrigger wrongone
	killtrigger no_planet
	send "q"
	goto :wrong_num
end
killtrigger noplanet
killtrigger no_land
killtrigger wrongone
settexttrigger wrong_num :wrong_num "That planet is not in this sector."
setstrigger planet :planet_prompt "Planet command"
pause

:wrong_num
killtrigger planet
send "**'{" $bot_name "} - Incorrect Planet Number*"
return

:planet_prompt
killtrigger wrong_num
setvar $currentbotplanet $planet
savevar $currentbotplanet
send "m* * * c"
setstrigger build_cit :build_cit "Do you wish to construct one?"
setstrigger in_cit :in_cit "Citadel command"
settexttrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
settexttrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
pause

:build_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulplanet true
send "n*"
setvar $startinglocation "Planet"
return

:in_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulcitadel true
setvar $startinglocation "Citadel"
return

:countplanets
setvar $planetcount 0
killalltriggers
settextlinetrigger planetgrabber :planetline "   <"
setslinetrigger bedone :done "Land on which planet "
send "lq*"
pause

:planetline
killalltriggers
getwordpos currentline $pos "<<<< ("
if ($pos <= 0)
	setvar $line currentline
	replacetext $line "<" " "
	replacetext $line ">" " "
	striptext $line ","
	add $planetcount 1
	getword $line $planets[$planetcount] 1
end
settextlinetrigger getline2 :planetline "   <"
setslinetrigger getend :done "Land on which planet "
pause

:done
return

:getshipstats
gosub :ship~getshipstats
setvar $ship_offensive_odds $ship~ship_offensive_odds
setvar $ship_fighters_max $ship~ship_fighters_max
setvar $ship_mines_max $ship~ship_mines_max
setvar $ship_max_attack $ship~ship_max_attack
return
include "source\include\switchboard.ts"
include "source\include\help"
