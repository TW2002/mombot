	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
		goto :wait_for_command
	end

# ============================== LAND (LAND) ==============================

	gosub :PLAYER~quikstats
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Command Citadel Planet"
	gosub :PLAYER~CHECKSTARTINGPROMPT
	loadVar $planet~planet
	if ($planet~planet <> "0")
		setvar $last_planet_landed $planet~planet
	end
	if ($bot~parm1 = "")
		setvar $bot~parm1 $last_planet_landed
	end
	isNumber $number $bot~parm1
	if ($number = TRUE)
		if (($bot~parm1 = 0) AND ($planet~planet = 0))
			setvar $switchboard~message "Incorrect Planet number*"
			gosub :switchboard~switchboard
			goto :wait_for_command
		elseif ($bot~parm1 > 0)
			setVar $planet~planet $bot~parm1
		else
		end
	else
		setVar $SWITCHBOARD~message "Planet number entered is not a number*"
		gosub :SWITCHBOARD~switchboard
		goto :wait_for_command
	end
		if ($player~current_prompt <> "Command")
			send "q q * "
		end
		gosub :PLANET~landingSub
	if ($planet~sucessfulCitadel = true)
		setVar $SWITCHBOARD~message "In Cit - Planet "&$planet~planet&"*"
		gosub :SWITCHBOARD~switchboard
	elseif ($planet~sucessfulPlanet = true)
		setVar $SWITCHBOARD~message "At Planet Prompt - No Cit*"
		gosub :SWITCHBOARD~switchboard
	else
		if (($last_planet_landed <> "0") and ($last_planet_landed <> $planet~planet))
			setvar $planet~planet $last_planet_landed
			gosub :planet~landingsub
			if ($planet~sucessfulCitadel)
				setVar $SWITCHBOARD~message "In Cit - Relanded on planet "&$planet~planet&"*"
				gosub :SWITCHBOARD~switchboard
			elseif ($planet~sucessfulPlanet)
				setVar $SWITCHBOARD~message "Relanded to planet prompt on planet "&$planet~planet&"- No Cit*"
				gosub :SWITCHBOARD~switchboard
			end
		end
	end
	goto :wait_for_command
# ============================== END LAND (LAND) SUB ==============================






:wait_for_command
	setVar $HELP~HELP[1]  $HELP~TAB&"   Lands on a planet.          "
	setVar $HELP~HELP[2]  $HELP~TAB&"               "
	setVar $HELP~HELP[3]  $HELP~TAB&"    land {planet#}  "
	setVar $HELP~HELP[4]  $HELP~TAB&"        "
	gosub :HELP~HELPFILE
halt


# includes:
include "source\include\planet"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
