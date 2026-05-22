logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $ship~cap_file
loadvar $player~onlyaliens
loadvar $player~cappingaliens
loadvar $player~empty_ships_only
loadvar $player~defendercapping

setvar $help~help[1] $help~tab&"cap   "
setvar $help~help[2] $help~tab&"    Captures enemy ships and attempts to not destroy them.   "
gosub :help~helpfile

gosub :combat~init

loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

:autocap
:cap
gosub :player~quikstats
setvar $player~startinglocation $player~current_prompt
if ($player~startinglocation <> "Command")
	if ($player~startinglocation = "Citadel")
		loadvar $bot~mode
		if ($bot~mode <> "Citcap")
			setvar $bot~command "citcap"
			setvar $bot~user_command_line " citcap on "
			setvar $bot~parm1 "on"
			savevar $bot~parm1
			savevar $bot~command
			savevar $bot~user_command_line
			setvar $bot~mode "Citcap"
			savevar $bot~mode
			load "scripts\mombot\modes\offense\citcap.cts"
		else
			setvar $bot~mode "General"
			savevar $bot~mode
			stop "scripts\mombot\modes\offense\citcap.cts"
			setvar $switchboard~message "Citcap off.*"
			gosub :switchboard~switchboard
		end
		halt
	end
	setvar $switchboard~message "Wrong prompt for auto capture.*"
	gosub :switchboard~switchboard
	halt
end
getwordpos $bot~user_command_line $pos "alien"
if ($pos > 0)
	setvar $player~onlyaliens true
else
	setvar $player~onlyaliens false
end
fileexists $ship~cap_file_chk $ship~cap_file
if ($ship~cap_file_chk <> true)
	gosub :ship~getshipcapstats
end
loadvar $ship~ship_max_attack
loadvar $ship~ship_fighters_max
loadvar $ship~ship_offensive_odds
if ($ship~ship_offensive_odds <= 0)
	gosub :ship~getshipstats
end
setvar $lasttarget ""
setvar $thistarget ""
gosub :sector~getsectordata
gosub :combat~fastcapture
halt

# includes:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
