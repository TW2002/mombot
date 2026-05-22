gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"   Lands on a planet.          "
setvar $help~help[2]  $help~tab&"               "
setvar $help~help[3]  $help~tab&"    land {planet#}  "
setvar $help~help[4]  $help~tab&"        "
gosub :help~helpfile

# ============================== LAND (LAND) ==============================

gosub :player~quikstats
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel Planet"
gosub :player~checkstartingprompt
loadvar $planet~planet
if ($planet~planet <> "0")
	setvar $last_planet_landed $planet~planet
end
if ($bot~parm1 = "")
	setvar $bot~parm1 $last_planet_landed
end
isnumber $number $bot~parm1
if ($number = true)
	if (($bot~parm1 = 0) and ($planet~planet = 0))
		setvar $switchboard~message "Incorrect Planet number*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	elseif ($bot~parm1 > 0)
		setvar $planet~planet $bot~parm1
	else
	end
else
	setvar $switchboard~message "Planet number entered is not a number*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
if ($player~current_prompt <> "Command")
	send "q q * "
end
gosub :planet~landingsub
if ($planet~sucessfulcitadel = true)
	setvar $switchboard~message "In Cit - Planet "&$planet~planet&"*"
	gosub :switchboard~switchboard
elseif ($planet~sucessfulplanet = true)
	setvar $switchboard~message "At Planet Prompt - No Cit*"
	gosub :switchboard~switchboard
else
	if (($last_planet_landed <> "0") and ($last_planet_landed <> $planet~planet))
		setvar $planet~planet $last_planet_landed
		gosub :planet~landingsub
		if ($planet~sucessfulcitadel)
			setvar $switchboard~message "In Cit - Relanded on planet "&$planet~planet&"*"
			gosub :switchboard~switchboard
		elseif ($planet~sucessfulplanet)
			setvar $switchboard~message "Relanded to planet prompt on planet "&$planet~planet&"- No Cit*"
			gosub :switchboard~switchboard
		end
	end
end
goto :wait_for_command
# ============================== END LAND (LAND) SUB ==============================
:wait_for_command
halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
