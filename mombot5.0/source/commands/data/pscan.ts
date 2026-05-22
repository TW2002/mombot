gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"PSCAN - Sends Planet Data Over SubSpace. "
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"   pscan {Planet #}"
setvar $help~help[4]  $help~tab&"       "
setvar $help~help[5]  $help~tab&"   [Planet #] - Is optional. However if left out you must "
setvar $help~help[6]  $help~tab&"                start it from Citadel,  or Planet command "
setvar $help~help[7]  $help~tab&"                and current planet will be displayed.  If "
setvar $help~help[8]  $help~tab&"                a Planet Number is specified, that planet "
setvar $help~help[9]  $help~tab&"                will be  displayed assuming  it's in the  "
setvar $help~help[10] $help~tab&"                current sector.   "
setvar $help~help[11] $help~tab&"             "
setvar $help~help[12] $help~tab&"              - Written by Lonestar "
gosub :help~helpfile

gosub :player~quikstats
setvar $location $player~current_prompt
setvar $array_cnt 0
setvar $planet~planet 0

if ($player~current_prompt = "Citadel")
	if ($bot~parm1 <> "")
		#get current planet number
		send "Q"
		gosub :planet~getplanetinfo
		send "  Q  "
		setvar $landon $bot~parm1
		gosub :land_onplanet
		if ($landed)
			send " D"
			gosub :start
		else
			send " Q  Q  Q  Z  N  *  L Z"&#8&$planet~planet&"*  *  J  C  *  "
			setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
			gosub :switchboard~switchboard
			halt
		end
		send " Q  Q  Q  Z  N  *  "
		setvar $landon $planet~planet
		gosub :land_onplanet
		if ($landed = 0)
			setvar $switchboard~message "Problem relanding on starting Planet #"&$planet~planet&".*"
			gosub :switchboard~switchboard
			halt
		else
			gosub :spititout
			send " C "
			setvar $switchboard~message "Back In Citadel on Planet #"&$planet~planet&".*"
			gosub :switchboard~switchboard
			halt
		end
	else
		send " Q D"
		waitfor "Planet command"
		gosub :start
		gosub :spititout
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
		setvar $landon $bot~parm1
		gosub :land_onplanet
		if ($landed)
			send " D"
			gosub :start
		else
			send " Q  Q  Q  Z  N  *  L Z"&#8&$planet~planet&"*  *  J  C  *  "
			setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
			gosub :switchboard~switchboard
			halt
		end
		send " Q  Q  Q  Z  N  *  "
		setvar $landon $planet~planet
		gosub :land_onplanet
		if ($landed = 0)
			setvar $switchboard~message "Problem relanding on starting Planet #"&$planet~planet&".*"
			gosub :switchboard~switchboard
			halt
		else
			gosub :spititout
			setvar $switchboard~message "Back on Planet #"&$planet~planet&" (Planet Command Prompt).*"
			gosub :switchboard~switchboard
			halt
		end
	else
		send "D"
		waitfor "Planet command"
		gosub :start
		gosub :spititout
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
	setvar $landon $bot~parm1
	gosub :land_onplanet
	if ($landed)
		send " D"
		gosub :start
	else
		send " Q  Q  Q  Z  N  * "
		setvar $switchboard~message "Problem landing on Planet #"&$bot~parm1&".*"
		gosub :switchboard~switchboard
		halt
	end
	send " Q  Q  Q  Z  N  *  "
	gosub :spititout
	setvar $switchboard~message "Back At Command Prompt.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Please Start from Command, Citadel, or Planet Prompt*"
	gosub :switchboard~switchboard
end
halt

:start
setarray $scan_array 30
setvar $idx 0

:continuescan
settexttrigger done :done "Planet command"
settextlinetrigger line_trig :parse_scan_line
pause

:parse_scan_line
killtrigger line_trig
setvar $s currentline
if (($s = "") or ($s = 0))
	setvar $s "          "
end

getwordpos $s $pos "Fuel Ore"
if ($pos <> 0)
	getword $s $t 8
	cuttext $s $first_half 1 54
	setvar $s $first_half&$t
end
getwordpos $s $pos "Organics"
if ($pos <> 0)
	getword $s $t 7
	cuttext $s $first_half 1 54
	setvar $s $first_half&$t
end
getwordpos $s $pos "Equipment"
if ($pos <> 0)
	getword $s $t 7
	cuttext $s $first_half 1 54
	setvar $s $first_half&$t
end
getwordpos $s $pos "Fighters "
if ($pos <> 0)
	getword $s $t 7
	cuttext $s $first_half 1 54
	setvar $s $first_half&$t
end
replacetext $s "  Item    Colonists  Colonists    Daily     Planet      Ship      Planet" "Item  Colonists Colonists    Daily     Planet    Planet"
replacetext $s "           (1000s)   2 Build 1   Product    Amount     Amount     Maximum"  "       (1000s)  2 Build 1   Product    Amount    Maximum"
replacetext $s " -------  ---------  ---------  ---------  ---------  ---------  ---------" "---  ---------  ---------  ---------  ---------  ---------"
replacetext $s "Fuel Ore" "Ore"
replacetext $s "Organics" "Org"
replacetext $s "Equipment" "Equ "
replacetext $s "Fighters " "Figs"
replacetext $s "Military reaction" "Mil-React"

add $idx 1
setvar $scan_array[$idx] $s
killalltriggers
goto :continuescan

:done
killalltriggers
return

:spititout
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

:land_onplanet
setvar $landed false
send ("L"&$landon&"*Z  N  Z  N  *  ")
settextlinetrigger noplanet1	:noplanet	"There isn't a planet in this sector."
settextlinetrigger noplanet2	:noplanet	"That planet is not in this sector."
settextlinetrigger notlanded 	:notlanded	"since it couldn't possibly stand"
settextlinetrigger landed		:landed		"Planet #"
pause

:noplanet
killalltriggers
setvar $switchboard~message "Planet #" & $landon & ", not in Sector!*"
gosub :switchboard~switchboard
return

:notlanded
killalltriggers
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return

:landed
killalltriggers
setvar $landed true
waitfor "<Destroy Planet>"
waitfor "Planet command"
return

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
