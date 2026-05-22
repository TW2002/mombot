gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"pwarp {sector:#} {"&#34&"trader_name"&#34&"} "
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"        planet warps to sector "
setvar $help~help[4]  $help~tab&"      "
setvar $help~help[5]  $help~tab&"    Options: "
setvar $help~help[6]  $help~tab&"           {sector:#} - sector to pwarp to "
setvar $help~help[7]  $help~tab&"      {"&#34&"trader_name"&#34&"} - trader to pwarp to"
setvar $help~help[8]  $help~tab&"         "
setvar $help~help[9]  $help~tab&"    Examples:"
setvar $help~help[10] $help~tab&"               >p 233 - normal pwarp"
setvar $help~help[11] $help~tab&"         >p planet 12 - pwarp to last known "
setvar $help~help[12] $help~tab&"                        location of planet 12 "
setvar $help~help[13] $help~tab&"              >p mind - pwarp to a corp member with mind"
setvar $help~help[14] $help~tab&"                        in their name"
setvar $help~help[15] $help~tab&"     >p "&#34&"mind dagger"&#34&" - pwarp to corp member"
gosub :help~helpfile

killalltriggers
setvar $player~save true
if ($bot~parm1 <> $player~current_sector)
	gosub  :player~currentprompt
else
	gosub :player~quikstats
end
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel"
gosub :player~checkstartingprompt

gosub :player~checkfortravelname

isnumber $test $bot~parm1
if (($test = false) or ($bot~parm1 = ""))
	setvar $switchboard~message "Sector must be entered as a number between 11-"&sectors&"*"
	gosub :switchboard~switchboard
	halt
else
	if (($bot~parm1 > sectors) or ($bot~parm1 < 11))
		setvar $switchboard~message "Sector must be entered as a number between 11-"&sectors&"*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $planet~warpto $bot~parm1
		if ($player~current_sector = $planet~warpto)
			setvar $switchboard~message "Already in that sector!*"
			gosub :switchboard~switchboard
			halt
		end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " scan "
if ($pos > 0)
	setvar $planet~pwarp_scan true
else
	setvar $planet~pwarp_scan false
end

gosub :planet~pwarp
halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
