gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"getvar"
setvar $help~help[2]  $help~tab&"  Displays bot variables"
setvar $help~help[3]  $help~tab&"    s - stardock"
setvar $help~help[4]  $help~tab&"    r - rylos"
setvar $help~help[5]  $help~tab&"    a - alpha centauri"
setvar $help~help[6]  $help~tab&"    b - backdoor"
setvar $help~help[7]  $help~tab&"    x - safe ship"
setvar $help~help[8]  $help~tab&"   tl - turn limit"
gosub :help~helpfile

loadvar $map~rylos
loadvar $map~stardock
loadvar $map~alpha_centauri
loadvar $map~backdoor
loadvar $map~home_sector

getword $bot~user_command_line $bot~parm1 1
setvar $switchboard~message ""
if (($bot~parm1 = "h") or ($bot~parm1 = "home") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Home Sector: "&$map~home_sector&"*"
end
if (($bot~parm1 = "s") or ($bot~parm1 = "stardock") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Stardock: "&$map~stardock&"*"
end
if (($bot~parm1 = "r") or ($bot~parm1 = "rylos") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Rylos: "&$map~rylos&"*"
end
if (($bot~parm1 = "a") or ($bot~parm1 = "alpha") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Alpha Centauri: "&$map~alpha_centauri&"*"
end
if (($bot~parm1 = "b") or ($bot~parm1 = "backdoor") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Backdoor: "&$map~backdoor&"*"
end
if (($bot~parm1 = "x") or ($bot~parm1 = "safeship") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Safe Ship: "&$bot~safe_ship&"*"
end
if (($bot~parm1 = "tl") or ($bot~parm1 = "turnlimit") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"Turn Limit: "&$bot~bot_turn_limit&"*"
end
if (($bot~parm1 = "pgridbot") or ($bot~parm1 = "pbot") or ($bot~parm1 = $switchboard~bot_name))
	setvar $switchboard~message $switchboard~message&"PGrid Bot: "&$bot~pgrid_bot&"*"
end
if ($switchboard~message = "")
	setvar $switchboard~message "Unknown variable name entered.*"
end
if ($switchboard~self_command <> true)
	setvar $switchboard~self_command 2
end
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
