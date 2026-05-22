loadvar $bot_name
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $self_command
loadvar $stardock
loadvar $player~unlimitedgame
loadvar $switchboard~bot_name
loadvar $switchboard~self_command

:qset
:q
getword $user_command_line $parm1 1
getword $user_command_line $parm2 2
gosub :doqsetprotections
gosub :player~currentprompt
setvar $startinglocation $player~current_prompt
setvar $bot~validprompts "Planet Citadel"
gosub :player~checkstartingprompt
setvar $totaldamage 0
setvar $cannontype $parm1
setvar $cannondamage $parm2
if ($startinglocation = "Citadel")
	send "q"
end
gosub :planet~getplanetinfo
if ($planet~citadel < 3)
	setvar $switchboard~message "Planet number " $planet~planet " does not have a quasar cannon.*"
	gosub :switchboard~switchboard
	if (($planet~citadel > 0) and ($startinglocation = "Citadel"))
		send "c "
	end
else
	send "c "
	if ($cannontype = "s")
		setvar $percenttoset (((3 * $cannondamage) * 100) / $planet~planet_fuel)
		if (((($planet~planet_fuel * $percenttoset) / 100) / 3) < $cannondamage)
			add $percenttoset 1
		end
		if ($percenttoset > 100)
			setvar $percenttoset 100
		end
		add $totaldamage ((($planet~planet_fuel * $percenttoset) / 100) / 3)
		send "l s "&$percenttoset&"* "
		setvar $damagetype "Sector"
	else
		if ($mbbs)
			setvar $percenttoset ((($cannondamage / 2) * 100) / $planet~planet_fuel)
			if (((($planet~planet_fuel * $percenttoset) / 100) * 2) < $cannondamage)
				add $percenttoset 1
			end
		else
			setvar $percenttoset (((2 * $cannondamage) * 100) / $planet~planet_fuel)
			if (((($planet~planet_fuel * $percenttoset) / 100) / 2) < $cannondamage)
				add $percenttoset 1
			end
		end
		if ($percenttoset > 100)
			setvar $percenttoset 100
		end
		if ($mbbs)
			add $totaldamage ((($planet~planet_fuel * $percenttoset) / 100) * 2)
		else
			add $totaldamage ((($planet~planet_fuel * $percenttoset) / 100) / 2)
		end
		send "l a "&$percenttoset&"* "
		setvar $damagetype "Atmosphere"
	end
	if ($startinglocation = "Planet")
		send "q "
	end
	setvar $switchboard~message "Quasar Cannon on planet "&$planet~planet&" is set to "&$totaldamage&". ("&$damagetype&")*"
	waiton "What level do you want"
	gosub :switchboard~switchboard
end
goto :wait_for_command

:doqsetprotections
isnumber $number $parm2
if ($number <> true)
	setvar $switchboard~message "Cannon Damage Entered is not a number!*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
if (($parm1 <> "a") and ($parm1 <> "s"))
	setvar $switchboard~message "Please use qset [a/s] [damage]!*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
return

:wait_for_command
halt

:killthetriggers
killalltriggers
return

# includes:

#INCLUDES:
include "source\include\planet"
include "source\include\switchboard.ts"
