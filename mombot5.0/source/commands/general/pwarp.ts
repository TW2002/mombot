	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"pwarp {sector:#} {"&#34&"trader_name"&#34&"} "
	setVar $HELP~HELP[2]  $HELP~TAB&"      "
	setVar $HELP~HELP[3]  $HELP~TAB&"        planet warps to sector "
	setVar $HELP~HELP[4]  $HELP~TAB&"      "
	setVar $HELP~HELP[5]  $HELP~TAB&"    Options: "
	setVar $HELP~HELP[6]  $HELP~TAB&"           {sector:#} - sector to pwarp to "
	setVar $HELP~HELP[7]  $HELP~TAB&"      {"&#34&"trader_name"&#34&"} - trader to pwarp to"
	setVar $HELP~HELP[8]  $HELP~TAB&"         "
	setVar $HELP~HELP[9]  $HELP~TAB&"    Examples:"
	setVar $HELP~HELP[10] $HELP~TAB&"               >p 233 - normal pwarp"
	setVar $HELP~HELP[11] $HELP~TAB&"         >p planet 12 - pwarp to last known "
	setVar $HELP~HELP[12] $HELP~TAB&"                        location of planet 12 "
	setVar $HELP~HELP[13] $HELP~TAB&"              >p mind - pwarp to a corp member with mind"
	setVar $HELP~HELP[14] $HELP~TAB&"                        in their name"
	setVar $HELP~HELP[15] $HELP~TAB&"     >p "&#34&"mind dagger"&#34&" - pwarp to corp member"
	gosub :HELP~HELPFILE

	killalltriggers
	setvar $player~save true
	if ($bot~parm1 <> $PLAYER~CURRENT_SECTOR)
		gosub  :player~currentPrompt
	else
		gosub :PLAYER~quikstats
	end
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel"
	gosub :PLAYER~CHECKSTARTINGPROMPT

	gosub :player~checkfortravelname

	isNumber $test $bot~parm1
	if (($test = FALSE) OR ($bot~parm1 = ""))
		setVar $SWITCHBOARD~message "Sector must be entered as a number between 11-"&SECTORS&"*"
		gosub :SWITCHBOARD~switchboard
		halt
	else    
		if (($bot~parm1 > SECTORS) OR ($bot~parm1 < 11))    
			setVar $SWITCHBOARD~message "Sector must be entered as a number between 11-"&SECTORS&"*"  
			gosub :SWITCHBOARD~switchboard
			halt
		else
			setVar $PLANET~warpto $bot~parm1
			if ($PLAYER~CURRENT_SECTOR = $PLANET~warpto)
				setVar $SWITCHBOARD~message "Already in that sector!*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
	end
	
		getWordPos " "&$bot~user_command_line&" " $pos " scan "
		if ($pos > 0)
			setVar $PLANET~PWARP_SCAN TRUE
		else
			setVar $PLANET~PWARP_SCAN FALSE
		end

		gosub :planet~pwarp
	halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
