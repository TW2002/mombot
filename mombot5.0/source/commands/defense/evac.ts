gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"EVAC - Evacuate Planet(s)"
setvar $help~help[2] $help~tab&"       Moves all movable planets in Current-Sector to target sector."
setvar $help~help[3] $help~tab&"                  "
setvar $help~help[4] $help~tab&"      evac [sector]"
gosub :help~helpfile

loadvar $map~stardock
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $map~home_sector

# ======================     START PLANET MOVER (EVAC) SUBROUTINE    ==========================
:evac_start
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Must start from Citadel or Command Prompt*"
	gosub :switchboard~switchboard
	halt
end
if (($bot~parm1 = "s") and ($map~stardock <> 0))
	setvar $bot~parm1 $map~stardock
end
if (($bot~parm1 = "r") and ($map~rylos <> 0))
	setvar $bot~parm1 $map~rylos
end
if (($bot~parm1 = "a") and ($map~alpha_centauri <> 0))
	setvar $bot~parm1 $map~alpha_centauri
end
if (($bot~parm1 = "h") and ($map~home_sector <> 0))
	setvar $bot~parm1 $map~home_sector
end
setvar $target_sector $bot~parm1

if ($target_sector = $player~current_sector)
	setvar $switchboard~message "Already in that sector!*"
	gosub :switchboard~switchboard
	halt
end

:evac_run
setvar $switchboard~message "Starting Planet Evacuation to sector: "&$target_sector&".*"
gosub :switchboard~switchboard
setvar $evac_home $player~current_sector
if ($startinglocation = "Citadel")
	send "qq"
end
send "j  y  lq*"

:evac_get_planets
waiton "Registry# and Planet Name"
setvar $planet~planetcount 0
setvar $planet~planetskip 0
settexttrigger planetgrabber :evac_planetline "   <"
settexttrigger bedone :evac_done "Land on which planet "
settexttrigger no_scanner :evac_no_scanner "Planet command (?=help)"
pause

:evac_planetline
killtrigger planetgrabber
killtrigger bedone
killtrigger no_scanner
killtrigger getline2
killtrigger getend
setvar $line currentline
replacetext $line "<" " "
replacetext $line ">" " "
striptext $line ","

getword $line $temp 1
if ($temp > 0)
	add $planet~planetcount 1
	setvar $planet~planet[$planet~planetcount] $temp
end
settextlinetrigger getline2 :evac_planetline "   <"
settextlinetrigger getend :evac_done "Land on which planet "
pause

:evac_no_scanner
setvar $planet~planetcount 1
goto :evac_move

:evac_done
killtrigger getline2
setvar $evac_total $planet~planetcount
setvar $i 1

:evac_move
while ($i <= $evac_total)
	send "l " $planet~planet[$i] "* "
	gosub :planet~getplanetinfo
	if ($planet~citadel <= 3)
		add $planet~planetskip 1
		send "q q * "
	elseif ($planet~citadel >= 4)
		send "m * * * t n t 1 * c p " $target_sector "*"
		settextlinetrigger warp :evac_pwarp "Locating beam pinpointed, TransWarp"
		settextlinetrigger no_warp :evac_no_fig "You do not have any fighters in Sector"
		pause

		:evac_pwarp
		killtrigger no_warp
		send "y*"
		if ($i < $evac_total)
			settexttrigger twarp_engage :evac_twarp_engage "Do you want to engage the TransWarp drive?"
			settextlinetrigger adj_warp :evac_adj_warp_back "Sector  : "&$evac_home&" "
			send "qq  z  n  *  m" $evac_home "*"
			pause

			:evac_twarp_engage
			killtrigger twarp_engage
			send "y"
			settexttrigger warp :evac_twarp "All Systems Ready, shall we engage?"
			settexttrigger no_warp :evac_no_warp_back "Do you want to make this jump blind?"
			pause

			:evac_twarp
			gosub :evac_kill_return_warp_triggers
			send "y  *  *  *  q  z  n  *"
			waiton "Command [TL="
			goto :evac_return_done

			:evac_adj_warp_back
			gosub :evac_kill_return_warp_triggers
			waiton "Command [TL="

			:evac_return_done
		end
	end

	add $i 1

end

subtract $planet~planetcount $planet~planetskip
setvar $switchboard~message "Evac Complete. Moved: "&$planet~planetcount&" Skipped: "&$planet~planetskip&". *"
gosub :switchboard~switchboard
halt

:evac_no_warp_back
gosub :evac_kill_return_warp_triggers
send "n*"
setvar $switchboard~message "Unable to safely T-warp back to the home sector.  Shutting down Evac.*"
gosub :switchboard~switchboard
halt

:evac_kill_return_warp_triggers
killtrigger twarp_engage
killtrigger warp
killtrigger no_warp
killtrigger adj_warp
return

:evac_no_fig
killtrigger warp
setvar $switchboard~message "No Fighter at Target Sector.  Shutting down Evac.*"
gosub :switchboard~switchboard
halt

:evac_end
halt

# ======================     END PLANET MOVER (EVAC) SUBROUTINE    ==========================
#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
