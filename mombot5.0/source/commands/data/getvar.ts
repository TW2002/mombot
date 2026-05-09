	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE


	setVar $HELP~HELP[1]  $HELP~TAB&"getvar"
	setVar $HELP~HELP[2]  $HELP~TAB&"  Displays bot variables"
	setVar $HELP~HELP[3]  $HELP~TAB&"    s - stardock"
	setVar $HELP~HELP[4]  $HELP~TAB&"    r - rylos"
	setVar $HELP~HELP[5]  $HELP~TAB&"    a - alpha centauri"
	setVar $HELP~HELP[6]  $HELP~TAB&"    b - backdoor"
	setVar $HELP~HELP[7]  $HELP~TAB&"    x - safe ship"
	setVar $HELP~HELP[8]  $HELP~TAB&"   tl - turn limit"
	gosub :HELP~HELPFILE
	
	loadvar $map~rylos
	loadvar $map~stardock
	loadvar $map~alpha_centauri
	loadvar $map~backdoor
	loadvar $map~home_sector

	getWord $BOT~user_command_line $BOT~parm1 1
	setVar $SWITCHBOARD~message ""
	if (($BOT~parm1 = "h") OR ($BOT~parm1 = "home") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Home Sector: "&$MAP~home_sector&"*"
	end
	if (($BOT~parm1 = "s") OR ($BOT~parm1 = "stardock") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Stardock: "&$MAP~stardock&"*"
	end
	if (($BOT~parm1 = "r") OR ($BOT~parm1 = "rylos") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Rylos: "&$MAP~rylos&"*"
	end
	if (($BOT~parm1 = "a") OR ($BOT~parm1 = "alpha") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Alpha Centauri: "&$MAP~alpha_centauri&"*"
	end
	if (($BOT~parm1 = "b") OR ($BOT~parm1 = "backdoor") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Backdoor: "&$MAP~backdoor&"*"
	end
	if (($BOT~parm1 = "x") OR ($BOT~parm1 = "safeship") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Safe Ship: "&$BOT~safe_ship&"*"
	end
	if (($BOT~parm1 = "tl") OR ($BOT~parm1 = "turnlimit") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Turn Limit: "&$BOT~bot_turn_limit&"*"
	end
	if (($BOT~parm1 = "pgridbot") OR ($BOT~parm1 = "pbot") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"PGrid Bot: "&$BOT~pgrid_bot&"*"
	end
	if ($SWITCHBOARD~message = "")
		setVar $SWITCHBOARD~message "Unknown variable name entered.*"
	end
	if ($SWITCHBOARD~self_command <> TRUE)
		setVar $SWITCHBOARD~self_command 2
	end
	gosub :SWITCHBOARD~switchboard
	halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
