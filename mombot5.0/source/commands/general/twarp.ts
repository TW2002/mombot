gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"twarp {sector:#} {"&#34&"trader_name"&#34&"} {p} "
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"        transwarps to sector as quickly "
setvar $help~help[4]  $help~tab&"        and safely as possible.   "
setvar $help~help[5]  $help~tab&"      "
setvar $help~help[6]  $help~tab&"    Options: "
setvar $help~help[7]  $help~tab&"           {sector:#} - sector to twarp to "
setvar $help~help[8]  $help~tab&"      {"&#34&"trader_name"&#34&"} - trader to twarp to"
setvar $help~help[9]  $help~tab&"                  {p} - attempt to port after twarp"
setvar $help~help[10] $help~tab&"         "
setvar $help~help[11] $help~tab&"    Examples:"
setvar $help~help[12] $help~tab&"            >t 233    - normal twarp"
setvar $help~help[13] $help~tab&"            >t 233 12 - twarp, then land on planet 12"
setvar $help~help[14] $help~tab&"            >t 233 p  - twarp, then port"
setvar $help~help[15] $help~tab&"         >t planet 12 - twarp to last known "
setvar $help~help[16] $help~tab&"                        location of planet 12 and land"
setvar $help~help[17] $help~tab&"              >t mind - twarp to a corp member with mind"
setvar $help~help[18] $help~tab&"                        in their name"
setvar $help~help[19] $help~tab&"     >t "&#34&"mind dagger"&#34&" - twarp to corp member"
gosub :help~helpfile

# ======================     START TWARP SUBROUTINES     =================
:twarp
:t
setvar $player~warpto_p ""
setvar $player~save true
gosub :player~quikstats
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
gosub :player~checkstartingprompt
gosub :player~checkfortravelname
if ($player~twarp_type = "No")
	setvar $switchboard~message "This ship does not have a transwarp drive!*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
gosub :travelprotections
gosub :move~twarp
if ($player~twarpsuccess = false)
	if (($player~startinglocation = "Citadel") or ($player~startinglocation = "Planet"))
		if ($planet~planet <> 0)
			gosub  :player~currentprompt
			if ($player~current_prompt = "Command")
				gosub :planet~landingsub
			end
		end
		goto :wait_for_command
	end
	if (($player~startinglocation = "<StarDock>") or ($player~startinglocation = "<FedPolice") or ($player~startinglocation = "<Tavern>") or ($player~startinglocation = "<Libram") or ($player~startinglocation = "<Galact") or ($player~startinglocation = "<Hardware") or ($player~startinglocation = "<Shipyards>"))
		send "p z s h *"
		goto :wait_for_command
	end
	if ($player~msg <> "You can't twarp with photons without override!")
		setvar $switchboard~message $player~msg&"*"
		gosub :switchboard~switchboard
	end
else
	if ($bot~parm2 = "p")
		send $player~warpto_p
	elseif (($player~warpto_p <> 0) and ($player~warpto_p <> ""))
		setvar $planet~planet $player~warpto_p
		gosub :planet~landingsub
	end
	setvar $bot~target $player~warpto
	setvar $player~target $bot~target
	gosub :player~addfigtodata
	setvar $switchboard~message $player~msg&"*"
	gosub :switchboard~switchboard
end
goto :wait_for_command
# ======================     END TWARP SUBROUTINES     ==========================
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
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
