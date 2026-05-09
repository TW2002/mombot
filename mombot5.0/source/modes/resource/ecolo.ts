logging off
	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
									

setVar $HELP~HELP[1] $HELP~TAB&"Uses ecolo {all}"
setVar $HELP~HELP[2] $HELP~TAB&"Uses E-warp to colonize.  For red or non-twarp ships."
setVar $HELP~HELP[3] $HELP~TAB&"   Options:"
setVar $HELP~HELP[4] $HELP~TAB&"   Will attempt to fill all planets in sector owned by you."
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "E-Colonizer starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD


# ======================     START COLO (COLO) SUBROUTINE    ==========================
goto :Start_Up_Routines
:colo_next
	setVar $PLAYER~destination 1
	gosub :player~getCourse
    setVar $j 2
    setVar $result "q * "
    while ($j <= $PLAYER~courseLength)
        if ($PLAYER~course[$j] <> $PLAYER~CURRENT_SECTOR)
            setVar $result $result&"m    "&$PLAYER~course[$j]&"*               "
            if (($PLAYER~course[$j] > 10) AND ($PLAYER~course[$j] <> $MAP~stardock))
                setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *             "
            end
        end
        add $j 1
    end
    setVar $to_mow $result

    setVar $PLAYER~starting_point 1
	setVar $PLAYER~destination $PLAYER~CURRENT_SECTOR
	gosub :player~getCourse
    setVar $j 2
    setVar $result ""
    while ($j <= $PLAYER~courseLength)
        if ($PLAYER~course[$j] <> $PLAYER~starting_point)
            setVar $result $result&"m    "&$PLAYER~course[$j]&"*             "
            if (($PLAYER~course[$j] > 10) AND ($PLAYER~course[$j] <> $MAP~stardock))
                setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *           "
            end
        end
        add $j 1
    end
    setVar $from_mow $result

	setVar $i 1
	while ($i <= $planet~planetCount)
		setVar $colo_prod 1
		while ($colo_prod < 4)
			setVar $planet~planet $planet~planets[$i]
			if ($PLAYER~PLANET_SCANNER = "No")
				setVar $coloBurst $to_mow&"    l * * "&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"*"
			else
				setVar $coloBurst $to_mow&"    l 1* * * "&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"*"
			end
			send $coloBurst
			setTextLineTrigger 33 :morespeed "The Colonists disembark"
			setTextLineTrigger 34 :next_item_speed "There isn't room on the planet"
			setTextLineTrigger 35 :donespeed "There aren't that many on Terra!"
			pause

			:donespeed
				killtrigger 33
				killtrigger 34
				setvar $switchboard~message "Terra is empty. Colonizer shutting down.*"
				gosub :switchboard~switchboard
				if ($startingLocation = "Citadel")
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

:Start_Up_Routines
	loadVar $player~unlimitedGame
	loadVar $bot_turn_limit
	loadVar $bot~user_command_line
	loadVar $bot~parm1
	loadVar $bot~parm2
	loadVar $bot~parm3
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $switchboard~bot_name


# ======================     START COLO  (COLO) SUBROUTINE    ==========================
:colo_setup
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet"))
		setvar $switchboard~message "Colo must be run from Planet or Citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end
	if ($startingLocation = "Citadel")
		send "Q"
	end
	gosub :PLANET~getPlanetInfo
	send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* q c u y q "

	if ($bot~parm1 = "all")
		gosub :PLANET~countPlanets
	else
		setVar $planet~planets[1] $planet~planet
		setVar $planet~planetCount 1
	end
	gosub :PLAYER~getInfo
	gosub :SHIP~getShipStats
	goto :colo_next

	#INCLUDES:
include "source\include\ship"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
