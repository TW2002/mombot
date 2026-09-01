logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Upgrades a port product as much as possible.  "
setvar $help~help[2] $help~tab&"         "
setvar $help~help[3] $help~tab&"Options: "
setvar $help~help[4] $help~tab&"{noexp} - Upgrades port without experience increase."
gosub :help~helpfile

:maxport
:max
killalltriggers
gosub :player~quikstats
setvar $bot~startinglocation $player~current_prompt
setvar $startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command Planet"
gosub :player~checkstartingprompt
if (($bot~parm1 <> "f") and (($bot~parm1 <> "o") and ($bot~parm1 <> "e")))
	setvar $switchboard~message "maxport [f / o / e] noexp*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $dofuel true
end
getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $doorg true
end
getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $doequ true
end
getwordpos " "&$bot~user_command_line&" " $pos " noexp "
if ($pos > 0)
	setvar $no_exp true
else
	setvar $no_exp false
end
setvar $total_creds_needed 0
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	if ($startinglocation = "Citadel")
		send "q"
	end
	gosub :planet~getplanetinfo
	if ($planet~citadel > 0)
		send "cs* "
		waiton "<Enter Citadel>"
		waiton "Warps to Sector(s)"
		if (port.exists[$player~current_sector])
			send "cr*q"
			waiton "Fuel Ore"
			getword currentline $portfuel 4
			getword currentline $portfuelpercent 5
			striptext $portfuelpercent "%"
			waiton "Organics"
			getword currentline $portorg 3
			getword currentline $portorgpercent 4
			striptext $portorgpercent "%"
			waiton "Equipment"
			getword currentline $portequip 3
			getword currentline $portequippercent 4
			striptext $portequippercent "%"
			if ($portequippercent <= 0)
				setvar $portequippercent 1
			end
			if ($portorgpercent <= 0)
				setvar $portorgpercent 1
			end
			if ($portfuelpercent <= 0)
				setvar $portfuelpercent 1
			end
			setvar $totalfuelupgradeneeded ((($port_max - (($portfuel * 100) / $portfuelpercent)) / 10) + 1)
			setvar $totalorgupgradeneeded ((($port_max - (($portorg * 100) / $portorgpercent)) / 10) + 1)
			setvar $totalequipupgradeneeded ((($port_max - (($portequip * 100) / $portequippercent)) / 10) + 1)
			setvar $total_creds_needed 0
			if ($dofuel = "f")
				add $total_creds_needed (300 * $totalfuelupgradeneeded)
			elseif ($doorg = "o")
				add $total_creds_needed (500 * $totalorgupgradeneeded)
			else
				add $total_creds_needed (1000 * $totalequipupgradeneeded)
			end
			if ($total_creds_needed > $player~credits)
				setvar $cashonhand $planet~citadel_credits
				add $cashonhand $player~credits
				if ($cashonhand > $total_creds_needed)
					if ($startinglocation = "Planet")
						send "C"
					end
					send "T T "&$player~credits&"* "
					send "T F "&$total_creds_needed&"* "
					setvar $player~credits $total_creds_needed
					setvar $switchboard~message "Withdrew funds from the Treasury to complete the port max*"
					gosub :switchboard~switchboard
				end
			end
		end
		send "q q"
	else
		send "q"
	end
end
setvar $wrong false
if ($dofuel)
	setvar $product 1
	setvar $noexpamount 9
	gosub :domaxport
end
if ($doorg)
	setvar $product 2
	setvar $noexpamount 4
	gosub :domaxport
end
if ($doequ)
	setvar $product 3
	setvar $noexpamount 3
	gosub :domaxport
end
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~landingsub
end
if ($wrong)
	setvar $switchboard~message "No valid port here.*"
	gosub :switchboard~switchboard
end
setvar $switchboard~message "Port upgrade complete.*"
gosub :switchboard~switchboard
halt

:domaxport
send "o z" $product "z0* "
setslinetrigger norealporthere :wrongporttype "Do you want to initiate construction on this port?"
setslinetrigger construction :wrongporttype "Do you want instructions (Y/N)"
waiton ", 0 to quit)"
killalltriggers
getword currentline $upgradeamount 9
striptext $upgradeamount "("
send "o "
if ($no_exp)
	while ($upgradeamount > 0)
		if ($upgradeamount > 3)
			send $product " " $noexpamount "* "
			subtract $upgradeamount $noexpamount
		else
			send $product " " $upgradeamount "* "
			subtract $upgradeamount $upgradeamount
		end
	end
	send "* * "
else
	send $product " " $upgradeamount "* * "
end
send "CR*Q"
waiton "<Computer deactivated>"

:donemaxport
killalltriggers
return

:wrongporttype
setvar $wrong true
goto :donemaxport

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
