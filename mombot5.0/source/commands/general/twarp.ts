gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"twarp {sector:#} {"&#34&"trader_name"&#34&"} {p} "
	setVar $HELP~HELP[2]  $HELP~TAB&"      "
	setVar $HELP~HELP[3]  $HELP~TAB&"        transwarps to sector as quickly "
	setVar $HELP~HELP[4]  $HELP~TAB&"        and safely as possible.   "
	setVar $HELP~HELP[5]  $HELP~TAB&"      "
	setVar $HELP~HELP[6]  $HELP~TAB&"    Options: "
	setVar $HELP~HELP[7]  $HELP~TAB&"           {sector:#} - sector to twarp to "
	setVar $HELP~HELP[8]  $HELP~TAB&"      {"&#34&"trader_name"&#34&"} - trader to twarp to"
	setVar $HELP~HELP[9]  $HELP~TAB&"                  {p} - attempt to port after twarp"
	setVar $HELP~HELP[10] $HELP~TAB&"         "
	setVar $HELP~HELP[11] $HELP~TAB&"    Examples:"
	setVar $HELP~HELP[12] $HELP~TAB&"            >t 233    - normal twarp"
	setVar $HELP~HELP[13] $HELP~TAB&"            >t 233 12 - twarp, then land on planet 12"
	setVar $HELP~HELP[14] $HELP~TAB&"            >t 233 p  - twarp, then port"
	setVar $HELP~HELP[15] $HELP~TAB&"         >t planet 12 - twarp to last known "
	setVar $HELP~HELP[16] $HELP~TAB&"                        location of planet 12 and land"
	setVar $HELP~HELP[17] $HELP~TAB&"              >t mind - twarp to a corp member with mind"
	setVar $HELP~HELP[18] $HELP~TAB&"                        in their name"
	setVar $HELP~HELP[19] $HELP~TAB&"     >t "&#34&"mind dagger"&#34&" - twarp to corp member"
	gosub :HELP~HELPFILE


# ======================     START TWARP SUBROUTINES     =================
:twarp
:t
setVar $player~warpto_p ""
setvar $player~save true
gosub :PLAYER~quikstats
setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
gosub :PLAYER~CHECKSTARTINGPROMPT
gosub :player~checkfortravelname
if ($PLAYER~TWARP_TYPE = "No")
	setVar $SWITCHBOARD~message "This ship does not have a transwarp drive!*"
	gosub :SWITCHBOARD~switchboard
	goto :wait_for_command
end
gosub :travelProtections
gosub :move~twarp
if ($PLAYER~twarpSuccess = FALSE)
	if (($PLAYER~startingLocation = "Citadel") OR ($PLAYER~startingLocation = "Planet"))
		if ($planet~planet <> 0)
			gosub  :player~currentPrompt
			if ($PLAYER~CURRENT_PROMPT = "Command")
				gosub :PLANET~landingSub
			end
		end
		goto :wait_for_command
	end
	if (($PLAYER~startingLocation = "<StarDock>") OR ($PLAYER~startingLocation = "<FedPolice") OR ($PLAYER~startingLocation = "<Tavern>") OR ($PLAYER~startingLocation = "<Libram") OR ($PLAYER~startingLocation = "<Galact") OR ($PLAYER~startingLocation = "<Hardware") OR ($PLAYER~startingLocation = "<Shipyards>"))
		send "p z s h *"
		goto :wait_for_command
	end
	if ($PLAYER~msg <> "You can't twarp with photons without override!")
		setVar $SWITCHBOARD~message $PLAYER~msg&"*"
		gosub :SWITCHBOARD~switchboard
	end
else
	if ($bot~parm2 = "p")
		send $player~warpto_p
	elseif (($player~warpto_p <> 0) AND ($player~warpto_p <> ""))
		setVar $planet~planet $player~warpto_p
		gosub :PLANET~landingSub
	end
	setVar $bot~target $PLAYER~warpto
	setVar $PLAYER~target $bot~target
	gosub :player~addfigtodata
	setVar $SWITCHBOARD~message $PLAYER~msg&"*"
	gosub :SWITCHBOARD~switchboard
end
goto :wait_for_command
# ======================     END TWARP SUBROUTINES     ==========================
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
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
