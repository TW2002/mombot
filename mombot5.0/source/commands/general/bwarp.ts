gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"bwarp {sector:#} {"&#34&"trader_name"&#34&"} {p}"
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"        planet transports to sector"
setvar $help~help[4]  $help~tab&"       "
setvar $help~help[5]  $help~tab&"    Options: "
setvar $help~help[6]  $help~tab&"           {sector:#} - sector to bwarp to "
setvar $help~help[7]  $help~tab&"      {"&#34&"trader_name"&#34&"} - trader to bwarp to"
setvar $help~help[8]  $help~tab&"                  {p} - port after bwarping in "
setvar $help~help[9]  $help~tab&"         "
setvar $help~help[10] $help~tab&"    Examples:"
setvar $help~help[11] $help~tab&"               >b 233 - normal bwarp"
setvar $help~help[12] $help~tab&"             >b 233 p - bwarp to sector, and port "
setvar $help~help[13] $help~tab&"         >b planet 12 - bwarp to last known "
setvar $help~help[14] $help~tab&"                        location of planet 12 "
setvar $help~help[15] $help~tab&"              >b mind - bwarp to a corp member with mind"
setvar $help~help[16] $help~tab&"                        in their name"
setvar $help~help[17] $help~tab&"     >b "&#34&"mind dagger"&#34&" - bwarp to corp member"
gosub :help~helpfile

# ======================     START BWARP SUBROUTINES     =================
:bwarp
:b
killalltriggers
if ($bot~parm1 <> $player~current_sector)
	gosub  :player~currentprompt
else
	gosub :player~quikstats
end

setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel"
gosub :player~checkstartingprompt
gosub :player~checkfortravelname
gosub :travelprotections
gosub :move~bwarp
goto :wait_for_command
# ======================     END BWARP SUBROUTINES     ==========================
:travelprotections
isnumber $test $bot~parm1
if ($test = false)
	setvar $switchboard~message "Sector must be entered as a number*"
	gosub :switchboard~switchboard
	goto :wait_for_command
else
	if ($bot~parm2 = "p")
		setvar $player~warpto_p "p z t *"
		if ($bot~parm1 = $map~stardock)
			setvar $player~warpto_p "p z s h *"
		end
	else
		isnumber $test $bot~parm2
		if ($test = false)
			setvar $player~warpto_p ""
		else
			setvar $player~warpto_p $bot~parm2
		end
	end
	setvar $player~warpto $bot~parm1
	if ($player~current_sector = $player~warpto)
		setvar $switchboard~message "Already in that sector!*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	elseif (($player~warpto <= 0) or ($player~warpto > sectors))
		setvar $switchboard~message "Destination sector is out of range!*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
end
return

:wait_for_command
halt

# includes:
include "source\include\player"
include "source\include\move"
include "source\include\loadvars"

include "source\include\help"
include "source\include\switchboard.ts"
