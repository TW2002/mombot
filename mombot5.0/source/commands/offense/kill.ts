logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $ship~cap_file
gosub :combat~init

setvar $bot~command "kill"
setvar $help~help[1] $help~tab&"kill   "
setvar $help~help[2] $help~tab&"    Kills any enemy players.   "
gosub :help~helpfile

:kill
:autokill
loadvar $player~targetingperson
loadvar $player~targetingcorp
loadvar $player~cappingaliens
loadvar $player~target
loadvar $map~stardock
loadvar $in_kill_routine

if ($in_kill_routine = true)
	echo "[Kill routine already running.]*"
else
	if ($bot~parm1 = "furb")
		setvar $furb true
	end

	gosub :player~currentprompt
	setvar $player~startinglocation $player~current_prompt
	if ($player~startinglocation <> "Command")
		if ($player~startinglocation = "Citadel")
			loadvar $bot~mode
			if ($bot~mode <> "Citkill")
				setvar $bot~command "citkill"
				setvar $bot~user_command_line " citkill on "
				setvar $bot~parm1 "on"
				savevar $bot~parm1
				savevar $bot~command
				savevar $bot~user_command_line
				setvar $bot~mode "Citkill"
				savevar $bot~mode
				load "scripts\mombot\modes\offense\citkill.cts"
			else
				setvar $bot~mode "General"
				savevar $bot~mode
				stop "scripts\mombot\modes\offense\citkill.cts"
				setvar $switchboard~message "Citkill off.*"
				gosub :switchboard~switchboard
			end
			halt
		end
		setvar $switchboard~message "Wrong prompt for auto kill.*"
		gosub :switchboard~switchboard
		halt
	end
	loadvar $ship~ship_max_attack
	loadvar $ship~ship_fighters_max
	loadvar $ship~ship_offensive_odds
	if ($ship~ship_max_attack <= 0)
		gosub :ship~getshipstats
	end
	setvar $player~isfound false
	gosub :sector~getsectordata
	gosub :combat~fastattack
	if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
		if ($player~isfound)
			load "scripts\mombot\commands\resource\refurb.cts"
			seteventtrigger 1 :refurbended "SCRIPT STOPPED" "scripts\mombot\commands\resource\refurb.cts"
			pause

			:refurbended
			gosub :sector~getsectordata
			gosub :combat~fastattack
		end
	end
	setvar $in_kill_routine false
	savevar $in_kill_routine
end
gosub :player~quikstats
halt

# includes:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
