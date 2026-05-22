gosub :loadvars~loadvars

gosub :help~initialize
setvar $help~help[1] $help~tab&"           Visits all ports in grid and sells organics          "
setvar $help~help[2] $help~tab&"           and/or equipment.       "
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&" merch {sector param} {min port product} [o | e] {args}  "
setvar $help~help[5] $help~tab&"       "
setvar $help~help[6] $help~tab&"Arguments:"
setvar $help~help[7] $help~tab&"    {neg/hold}   Determines planet negotiate or hold "
setvar $help~help[8] $help~tab&"                 selling approach"
setvar $help~help[9] $help~tab&"     {skipcim}   Uses current cim data and skips searching"
setvar $help~help[10] $help~tab&"       {docim}   Does cim check before starting and skips searching"
setvar $help~help[11] $help~tab&"     {buyfuel}   Buys all the fuel in fuel selling ports on route"
setvar $help~help[12] $help~tab&"      {upfuel}   upgrade fuel ore ports (usually with buyfuel)"
setvar $help~help[13] $help~tab&"        {half}   sell half of port (neg only for now) "
setvar $help~help[14] $help~tab&"       {upequ}   upgrade good equipment ports"
setvar $help~help[15] $help~tab&"       {uporg}   upgrade good organics ports"
setvar $help~help[16] $help~tab&"   {checkmcic}   make small trades at non-upgraded ports missing mcic"
setvar $help~help[17] $help~tab&"    {upmcic #}   maximum mcic to upgrade (default: -60)"
setvar $help~help[18] $help~tab&"  {sellmcic #}   minimum mcic to sell product (default: none)"
setvar $help~help[19] $help~tab&"    {minpct #}   minimum percent to sell to a port (default: 50)"
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $startingsector $player~current_sector

if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run Planet Merchant command from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"

if ($planet~citadel < 4)
	setvar $switchboard~message "You must run Planet Merchant from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end

setvar $bot~parameter ""
setvar $merchant~minprod $bot~parm1
isnumber $number $merchant~minprod
if ($number <> true)
	setvar $bot~parameter $bot~parm1
	uppercase $bot~parameter
	setvar $merchant~minprod $bot~parm2
	isnumber $number $merchant~minprod
	if ($number <> true)
		setvar $merchant~minprod 1000
	end
end
if ($merchant~minprod <= 0)
	setvar $switchboard~message "Minimum Port Product must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "hold"
if ($pos > 0)
	setvar $planet~planetnegotiate false
else
	setvar $planet~planetnegotiate true
end

getwordpos $bot~user_command_line $pos "half"
if ($pos > 0)
	setvar $merchant~sellhalf true
else
	setvar $merchant~sellhalf false
end

getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $merchant~sellingorg true
else
	setvar $merchant~sellingorg false
end

getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $merchant~sellingequip true
else
	setvar $merchant~sellingequip false
end

getwordpos " "&$bot~user_command_line&" " $pos " buyfuel "
if ($pos > 0)
	setvar $merchant~buyfuel true
else
	setvar $merchant~buyfuel false
end

setvar $merchant~salesman false
setvar $merchant~sellingfuel false
setvar $merchant~nativehagglemode false

if (($merchant~sellingorg = false) and ($merchant~sellingequip = false))
	setvar $switchboard~message "Please pick [o]rganics and/or [e]quipment to sell.  merch [min product] {o} {e} {docim} {skipcim} {negotiate/hold}*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "docim"
if ($pos > 0)
	setvar $merchant~docim true
else
	setvar $merchant~docim false
end

getwordpos $bot~user_command_line $pos "skipcim"
if ($pos > 0)
	setvar $merchant~skipcim true
else
	setvar $merchant~skipcim false
end

getwordpos $bot~user_command_line $pos "checkmcic"
if ($pos > 0)
	setvar $merchant~checkmcic true
else
	setvar $merchant~checkmcic false
end

getwordpos $bot~user_command_line $pos "upfuel"
if ($pos > 0)
	setvar $merchant~upfuel true
else
	setvar $merchant~upfuel false
end

getwordpos $bot~user_command_line $pos "upequ"
if ($pos > 0)
	setvar $merchant~upequ true
else
	setvar $merchant~upequ false
end

getwordpos $bot~user_command_line $pos "uporg"
if ($pos > 0)
	setvar $merchant~uporg true
else
	setvar $merchant~uporg false
end

setvar $merchant~upmcic -60
getwordpos $bot~user_command_line $pos "upmcic"
if ($pos > 0)
	cuttext $bot~user_command_line $tmp_command_line $pos 999
	getword $tmp_command_line $tmpval 2
	isnumber $test $tmpval
	if ($test = true)
		if ($tmpval > 0)
			setvar $merchant~upmcic (0 - $tmpval)
		else
			setvar $merchant~upmcic $tmpval
		end
	else
		setvar $switchboard~message "Invalid mcic value for upmcic argument"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $merchant~sellmcic 0
getwordpos $bot~user_command_line $pos "sellmcic"
if ($pos > 0)
	cuttext $bot~user_command_line $tmp_command_line $pos 999
	getword $tmp_command_line $tmpval 2
	isnumber $test $tmpval
	if ($test = true)
		if ($tmpval > 0)
			setvar $merchant~sellmcic (0 - $tmpval)
		else
			setvar $merchant~sellmcic $tmpval
		end
	else
		setvar $switchboard~message "Invalid mcic value for sellmcic argument"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $merchant~minpct 50
getwordpos $bot~user_command_line $pos "minpct"
if ($pos > 0)
	cuttext $bot~user_command_line $tmp_command_line $pos 999
	getword $tmp_command_line $tmpval 2
	striptext $tmpval "%"
	isnumber $test $tmpval
	if ($test = true)
		if ($tmpval > 0)
			setvar $merchant~minpct $tmpval
		end
	else
		setvar $switchboard~message "Invalid value for minpct argument"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $switchboard~message "Planet Merchant starting up!*"
gosub :switchboard~switchboard

gosub :merchant~merchant
gosub :haggle~restoreautohaggle

gosub :player~quikstats
if ($startingsector <> $player~current_sector)
	send "p"&$startingsector&"*y"
end
setvar $switchboard~message "Planet Merchant completed.*"
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\planet"
include "source\include\player"
include "source\include\merchant"
include "source\include\switchboard.ts"
