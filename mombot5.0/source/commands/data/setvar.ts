gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"setvar"
setvar $help~help[2]  $help~tab&"  Sets bot variables"
setvar $help~help[3]  $help~tab&"    s - stardock"
setvar $help~help[4]  $help~tab&"    r - rylos"
setvar $help~help[5]  $help~tab&"    a - alpha centauri"
setvar $help~help[6]  $help~tab&"    b - backdoor"
setvar $help~help[7]  $help~tab&"    x - safe ship"
setvar $help~help[8]  $help~tab&"   tl - turn limit"
setvar $help~help[9]  $help~tab&"    h - home sector"
gosub :help~helpfile

getword $bot~user_command_line $bot~parm1 1
isnumber $test $bot~parm2
if (($bot~parm1 = "h") or ($bot~parm1 = "home"))
	if ($test)
		if (($bot~parm2 <= sectors) and ($bot~parm2 >= 1))
			setvar $map~home_sector $bot~parm2
			savevar $map~home_sector
			setvar $switchboard~message "Home Sector variable set to: "&$map~home_sector&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "s") or ($bot~parm1 = "stardock"))
	if ($test)
		if (($bot~parm2 <= sectors) and ($bot~parm2 >= 1))
			setvar $map~stardock $bot~parm2
			savevar $map~stardock
			setvar $switchboard~message "Stardock variable set to: "&$map~stardock&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "r") or ($bot~parm1 = "rylos"))
	if ($test)
		if (($bot~parm2 <= sectors) and ($bot~parm2 >= 1))
			setvar $map~rylos $bot~parm2
			savevar $map~rylos
			setvar $switchboard~message "Rylos variable set to: "&$map~rylos&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "a") or ($bot~parm1 = "alpha"))
	if ($test)
		if (($bot~parm2 <= sectors) and ($bot~parm2 >= 1))
			setvar $map~alpha_centauri $bot~parm2
			savevar $map~alpha_centauri
			setvar $switchboard~message "Alpha Centauri variable set to: "&$map~alpha_centauri&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "b") or ($bot~parm1 = "backdoor"))
	if ($test)
		if (($bot~parm2 <= sectors) and ($bot~parm2 >= 1))
			setvar $map~backdoor $bot~parm2
			savevar $map~backdoor
			setvar $switchboard~message "Backdoor Sector variable set to: "&$map~backdoor&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "x") or ($bot~parm1 = "safeship"))
	if ($test)
		if ($bot~parm2 >= 1)
			setvar $bot~safe_ship $bot~parm2
			savevar $bot~safe_ship
			setvar $switchboard~message "Safe Ship variable set to: "&$bot~safe_ship&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "tl") or ($bot~parm1 = "turnlimit"))
	if ($test)
		if ($bot~parm2 >= 0)
			setvar $bot~bot_turn_limit $bot~parm2
			savevar $bot~bot_turn_limit
			setvar $switchboard~message "Turn Limit variable set to: "&$bot~bot_turn_limit&".*"
		else
			setvar $switchboard~message "Variable entered not valid, keeping old value.*"
		end
	end
elseif (($bot~parm1 = "pgridbot") or ($bot~parm1 = "pbot"))
	if ($bot~parm2 <> 0)
		setvar $bot~pgrid_bot $bot~parm2
		savevar $bot~pgrid_bot
		setvar $switchboard~message "PGrid Bot has been set.*"
	else
		setvar $bot~pgrid_bot ""
		savevar $bot~pgrid_bot
		setvar $switchboard~message "PGrid Bot has been cleared.*"
	end
else
	setvar $switchboard~message "Unknown variable name entered.*"
end
if (($switchboard~message = "0") or ($switchboard~message = ""))
	setvar $switchboard~message "Setvar must have a valid value to set.*"
end
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
