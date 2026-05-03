gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"bwarp {sector:#} {"&#34&"trader_name"&#34&"} {p}"
	setVar $HELP~HELP[2]  $HELP~TAB&"      "
	setVar $HELP~HELP[3]  $HELP~TAB&"        planet transports to sector"
	setVar $HELP~HELP[4]  $HELP~TAB&"       "
	setVar $HELP~HELP[5]  $HELP~TAB&"    Options: "
	setVar $HELP~HELP[6]  $HELP~TAB&"           {sector:#} - sector to bwarp to "
	setVar $HELP~HELP[7]  $HELP~TAB&"      {"&#34&"trader_name"&#34&"} - trader to bwarp to"
	setVar $HELP~HELP[8]  $HELP~TAB&"                  {p} - port after bwarping in "
	setVar $HELP~HELP[9]  $HELP~TAB&"         "
	setVar $HELP~HELP[10] $HELP~TAB&"    Examples:"
	setVar $HELP~HELP[11] $HELP~TAB&"               >b 233 - normal bwarp"
	setVar $HELP~HELP[12] $HELP~TAB&"             >b 233 p - bwarp to sector, and port "
	setVar $HELP~HELP[13] $HELP~TAB&"         >b planet 12 - bwarp to last known "
	setVar $HELP~HELP[14] $HELP~TAB&"                        location of planet 12 "
	setVar $HELP~HELP[15] $HELP~TAB&"              >b mind - bwarp to a corp member with mind"
	setVar $HELP~HELP[16] $HELP~TAB&"                        in their name"
	setVar $HELP~HELP[17] $HELP~TAB&"     >b "&#34&"mind dagger"&#34&" - bwarp to corp member"
	gosub :HELP~HELPFILE


# ======================     START BWARP SUBROUTINES     =================
:Bwarp
:b

	killalltriggers
	if ($bot~parm1 <> $PLAYER~CURRENT_SECTOR)
		gosub  :player~currentPrompt
	else
		gosub :PLAYER~quikstats
	end

	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel"
	gosub :PLAYER~CHECKSTARTINGPROMPT
	gosub :player~checkfortravelname
	gosub :travelProtections
	gosub :player~bwarp
	goto :wait_for_command
# ======================     END BWARP SUBROUTINES     ==========================


:travelProtections
	isNumber $test $bot~parm1
	if ($test = FALSE)
		setVar $SWITCHBOARD~message "Sector must be entered as a number*"
		gosub :SWITCHBOARD~switchboard
		goto :wait_for_command
	else
		if ($bot~parm2 = "p")
			setVar $player~warpto_p "p z t *"
			if ($bot~parm1 = $MAP~stardock)
				setVar $player~warpto_p "p z s h *"
			end
		else
			isNumber $test $bot~parm2
			if ($test = FALSE)
				setVar $player~warpto_p ""
			else
				setVar $player~warpto_p $bot~parm2
			end
		end
		setVar $PLAYER~warpto $bot~parm1
		if ($PLAYER~CURRENT_SECTOR = $PLAYER~warpto)
			setVar $SWITCHBOARD~message "Already in that sector!*"
			gosub :SWITCHBOARD~switchboard
			goto :wait_for_command
		elseif (($PLAYER~warpto <= 0) OR ($PLAYER~warpto > SECTORS))
			setVar $SWITCHBOARD~message "Destination sector is out of range!*"
			gosub :SWITCHBOARD~switchboard
			goto :wait_for_command
		end
	end
return




:wait_for_command
halt




# includes:
include "source\include\player"
include "source\include\loadvars"

include "source\include\help"
