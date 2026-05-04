	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"PSCAN - Sends Planet Data Over SubSpace. "
	setVar $HELP~HELP[2]  $HELP~TAB&"      "
	setVar $HELP~HELP[3]  $HELP~TAB&"   pscan {Planet #}"
	setVar $HELP~HELP[4]  $HELP~TAB&"       "
	setVar $HELP~HELP[5]  $HELP~TAB&"   [Planet #] - Is optional. However if left out you must "
	setVar $HELP~HELP[6]  $HELP~TAB&"                start it from Citadel,  or Planet command "
	setVar $HELP~HELP[7]  $HELP~TAB&"                and current planet will be displayed.  If "
	setVar $HELP~HELP[8]  $HELP~TAB&"                a Planet Number is specified, that planet "
	setVar $HELP~HELP[9]  $HELP~TAB&"                will be  displayed assuming  it's in the  "
	setVar $HELP~HELP[10] $HELP~TAB&"                current sector.   "
	setVar $HELP~HELP[11] $HELP~TAB&"             "
	setVar $HELP~HELP[12] $HELP~TAB&"              - Written by Lonestar "
	gosub :HELP~HELPFILE


	gosub :player~quikstats
	setVar $Location $player~current_prompt
	setVar $array_cnt 0
	setVar $planet~planet 0

	if ($player~current_prompt = "Citadel")
		if ($bot~parm1 <> "")
			#get current planet number
			send "Q"
			gosub :planet~getplanetinfo
			send "  Q  "
			setVar $LandOn $bot~parm1
			gosub :Land_OnPlanet
			if ($LANDED)
				send " D"
				gosub :start
			else
				send " Q  Q  Q  Z  N  *  L Z"&#8&$planet~planet&"*  *  J  C  *  "
				setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
				gosub :switchboard~switchboard
				halt
			end
			send " Q  Q  Q  Z  N  *  "
			setVar $LandOn $planet~planet
			gosub :Land_OnPlanet
			if ($LANDED = 0)
				setvar $switchboard~message "Problem relanding on starting Planet #"&$planet~planet&".*"
				gosub :switchboard~switchboard
				halt
			else
				gosub :SpitItOut
				send " C "
				setvar $switchboard~message "Back In Citadel on Planet #"&$planet~planet&".*"
				gosub :switchboard~switchboard
				halt
			end
		else
			send " Q D"
			waitfor "Planet command"
			gosub :start
			gosub :SpitItOut
			send " C  "
			setvar $switchboard~message "Back In Citadel.*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~current_prompt = "Planet")
		if ($bot~parm1 <> "")
			#get currnet planet number
			gosub :planet~getplanetinfo
			send "  Q  "
			setVar $LandOn $bot~parm1
			gosub :Land_OnPlanet
			if ($LANDED)
				send " D"
				gosub :start
			else
				send " Q  Q  Q  Z  N  *  L Z"&#8&$planet~planet&"*  *  J  C  *  "
				setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
				gosub :switchboard~switchboard
				halt
			end
			send " Q  Q  Q  Z  N  *  "
			setVar $LandOn $planet~planet
			gosub :Land_OnPlanet
			if ($LANDED = 0)
				setvar $switchboard~message "Problem relanding on starting Planet #"&$planet~planet&".*"
				gosub :switchboard~switchboard
				halt
			else
				gosub :SpitItOut
				setvar $switchboard~message "Back on Planet #"&$planet~planet&" (Planet Command Prompt).*"
				gosub :switchboard~switchboard
				halt
			end
		else
			send "D"
			waitfor "Planet command"
			gosub :start
			gosub :SpitItOut
			setvar $switchboard~message "At Planet Prompt.*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~current_prompt = "Command")
		if ($bot~parm1 = "")
			setvar $switchboard~message "If Starting From Sector Please Specify Planet Number.*"
			gosub :switchboard~switchboard
			halt
		end
		setVar $LandOn $bot~parm1
		gosub :Land_OnPlanet
		if ($LANDED)
			send " D"
			gosub :start
		else
			send " Q  Q  Q  Z  N  * "
			setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
			gosub :switchboard~switchboard
			halt
		end
		send " Q  Q  Q  Z  N  *  "
		gosub :SpitItOut
		setvar $switchboard~message "Back At Command Prompt.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Please Start from Command, Citadel, or Planet Prompt*"
		gosub :switchboard~switchboard
	end
	halt

:start
		setArray $scan_array 30
		setVar $idx 0
		:continuescan
		setTextTrigger done :done "Planet command"
		setTextLineTrigger line_trig :parse_scan_line
		pause
	:parse_scan_line
		killTrigger line_trig
		setVar $s CURRENTLINE
		if (($s = "") OR ($s = 0))
			setVar $s "          "
		end

		getWordPos $s $pos "Fuel Ore"
		if ($pos <> 0)
			getWord $s $t 8
			cuttext $s $first_half 1 54
			setvar $s $first_half&$t
		end
		getWordPos $s $pos "Organics"
		if ($pos <> 0)
			getWord $s $t 7
			cuttext $s $first_half 1 54
			setvar $s $first_half&$t
		end
		getWordPos $s $pos "Equipment"
		if ($pos <> 0)
			getWord $s $t 7
			cuttext $s $first_half 1 54
			setvar $s $first_half&$t
		end
		getWordPos $s $pos "Fighters "
		if ($pos <> 0)
			getWord $s $t 7
			cuttext $s $first_half 1 54
			setvar $s $first_half&$t
		end
		replacetext $s "  Item    Colonists  Colonists    Daily     Planet      Ship      Planet" "Item  Colonists Colonists    Daily     Planet    Planet"
		replaceText $s "           (1000s)   2 Build 1   Product    Amount     Amount     Maximum"  "       (1000s)  2 Build 1   Product    Amount    Maximum"
		replaceText $s " -------  ---------  ---------  ---------  ---------  ---------  ---------" "---  ---------  ---------  ---------  ---------  ---------"
		replaceText $s "Fuel Ore" "Ore"
		replaceText $s "Organics" "Org"
		replaceText $s "Equipment" "Equ "
		replaceText $s "Fighters " "Figs"
		replaceText $s "Military reaction" "Mil-React"

		add $idx 1
		setVar $scan_array[$idx] $s
		killAllTriggers
		goto :continuescan
	:done
		killAllTriggers
	return

:SpitItOut
	setvar $switchboard~message ""
	setvar $i 1
	while ($i <= $idx)
		if ($scan_array[$i] <> "0")
				setvar $switchboard~message $switchboard~message & $scan_array[$i] & "*"
		end
		add $i 1
	end
	gosub :switchboard~switchboard
	:continuecommpscan2
return

:Land_OnPlanet
	setVar $LANDED FALSE
	send ("L"&$LandOn&"*Z  N  Z  N  *  ")
	setTextLineTrigger NoPlanet1	:NoPlanet	"There isn't a planet in this sector."
	setTextLineTrigger NoPlanet2	:NoPlanet	"That planet is not in this sector."
	setTextLineTrigger NotLanded 	:NotLanded	"since it couldn't possibly stand"
	setTextLineTrigger Landed		:Landed		"Planet #"
	pause
	:NoPlanet
		killAllTriggers
		setvar $switchboard~message "Planet #" & $LandOn & ", not in Sector!*"
		gosub :switchboard~switchboard
		return
	:NotLanded
		killAllTriggers
		setvar $switchboard~message "This ship cannot land!*"
		gosub :switchboard~switchboard
		return
	:Landed
		killAllTriggers
		setVar $LANDED TRUE
		waitfor "<Destroy Planet>"
		waitfor "Planet command"
		return




#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
