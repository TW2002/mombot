logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Uses ecolo {all}"
setvar $help~help[2] $help~tab&"Uses E-warp to colonize.  For red or non-twarp ships."
setvar $help~help[3] $help~tab&"   Options:"
setvar $help~help[4] $help~tab&"   Will attempt to fill all planets in sector owned by you."
gosub :help~helpfile

setvar $switchboard~message "E-Colonizer starting up!*"
gosub :switchboard~switchboard

# ======================     START COLO (COLO) SUBROUTINE    ==========================
goto :start_up_routines

:colo_next
setvar $player~destination 1
gosub :player~getcourse
setvar $j 2
setvar $result "q * "
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

setvar $player~starting_point 1
setvar $player~destination $player~current_sector
gosub :player~getcourse
setvar $j 2
setvar $result ""
while ($j <= $player~courselength)
	if ($player~course[$j] <> $player~starting_point)
		setvar $result $result&"m    "&$player~course[$j]&"*             "
		if (($player~course[$j] > 10) and ($player~course[$j] <> $map~stardock))
			setvar $result $result&"za  "&$ship~ship_max_attack&"* *           "
		end
	end
	add $j 1
end
setvar $from_mow $result

setvar $i 1
while ($i <= $planet~planetcount)
	setvar $colo_prod 1
	while ($colo_prod < 4)
		setvar $planet~planet $planet~planets[$i]
		if ($player~planet_scanner = "No")
			setvar $coloburst $to_mow&"    l * * "&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"*"
		else
			setvar $coloburst $to_mow&"    l 1* * * "&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"*"
		end
		send $coloburst
		settextlinetrigger 33 :morespeed "The Colonists disembark"
		settextlinetrigger 34 :next_item_speed "There isn't room on the planet"
		settextlinetrigger 35 :donespeed "There aren't that many on Terra!"
		pause

		:donespeed
		killtrigger 33
		killtrigger 34
		setvar $switchboard~message "Terra is empty. Colonizer shutting down.*"
		gosub :switchboard~switchboard
		if ($startinglocation = "Citadel")
			send "c "
		end
		halt

		:next_item_speed
		killtrigger 33
		killtrigger 35
		#CHANGE ITEM TO NEXT
		add $colo_prod 1
		if ($colo_prod >= 4)
			setvar $switchboard~message "Planet "&$planet~planet&" is full of colonists, no more can be added.*"
			gosub :switchboard~switchboard
		end

		:morespeed
		killtrigger 33
		killtrigger 34
		killtrigger 35

	end
	add $i 1
end
halt

:start_up_routines
loadvar $player~unlimitedgame
loadvar $bot_turn_limit
loadvar $bot~user_command_line
loadvar $bot~parm1
loadvar $bot~parm2
loadvar $bot~parm3
loadvar $bot~parm4
loadvar $bot~parm5
loadvar $bot~parm6
loadvar $bot~parm7
loadvar $bot~parm8
loadvar $switchboard~bot_name

# ======================     START COLO  (COLO) SUBROUTINE    ==========================
:colo_setup
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	setvar $switchboard~message "Colo must be run from Planet or Citadel prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "Q"
end
gosub :planet~getplanetinfo
send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* q c u y q "

if ($bot~parm1 = "all")
	gosub :planet~countplanets
else
	setvar $planet~planets[1] $planet~planet
	setvar $planet~planetcount 1
end
gosub :player~getinfo
gosub :ship~getshipstats
goto :colo_next

#INCLUDES:
include "source\include\ship"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
