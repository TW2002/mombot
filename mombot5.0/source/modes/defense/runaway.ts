gosub :help~initialize
setvar $help~help[1] $help~tab&"Pwarps to random safe flee sectors after fighter hits."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  runaway [on | off] {first sector} {evac}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   [on] - enable runaway mode."
setvar $help~help[6] $help~tab&"   [off] - disable runaway mode."
setvar $help~help[7] $help~tab&"   {first sector} - optional first flee sector to use."
setvar $help~help[8] $help~tab&"   {evac} - move all planets to the flee sector instead of just pwarping."
setvar $help~help[9] $help~tab&"   Run from Citadel. Builds a flee-sector list and reacts to fig hits."
gosub :help~helpfile

loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $bot~parm1
loadvar $bot~parm2
loadvar $bot~parm3
loadvar $bot~parm4
loadvar $bot~parm5
loadvar $bot~parm6
loadvar $bot~parm7
loadvar $bot~parm8

setvar $start_fig_hit "Deployed Fighters Report Sector "
setvar $end_fig_hit   ":"
setvar $alien_ansi    #27 & "[1;36m" & #27 & "["
setvar $start_fig_hit_owner ":"
setvar $end_fig_hit_owner "'s"

#============================== RUNAWAY (RUNAWAY) ==============================
:runaway
setvar $fig_file 		"_MOM_" & gamename & ".figs"

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($bot~parm1 <> "on") and ($bot~parm1 <> "off")
	setvar $switchboard~message "Please use - Runaway [on/off] format*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm1 = "on")
	if ($startinglocation <> "Citadel")
		setvar $switchboard~message "Runaway must start at Citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $switchboard~message "Activating Runaway*"
	gosub :switchboard~switchboard
	goto :load_runaway
else
	setvar $switchboard~message "Please use - Runaway [on/off] format**"
	gosub :switchboard~switchboard
	halt
end

:load_runaway
isnumber $test $bot~parm2
if ($test)
	setvar $firstrun $bot~parm2
else
	setvar $firstrun 0
end
getwordpos $bot~user_command_line $pos "evac"
if ($pos > 0)
	setvar $doevacuate true
else
	setvar $doevacuate false
end

send "s*"
waitfor "<Scan Sector>"
waitfor "(?="
setvar $runsec $player~current_sector

:set_flee_data
setvar $switchboard~message "Runaway initiated - Mapping...*"
gosub :switchboard~switchboard
setvar $run_count 1
setvar $run_database_count 0
setvar $sectiona sectors
divide $sectiona 78
setvar $echo_count 1
setarray $run_database sectors
echo "** Plotting Primary Flee Sectors...**"

:start_run_count
while ($run_count <= sectors)
	if (sector.warpcount[$run_count] <> 2)
		if ($echo_count = $sectiona)
			echo ansi_13 #178
			setvar $echo_count 1
		else
			add $echo_count 1
		end
	else
		getsectorparameter $run_count "FIGSEC" $isfigged
		getdistance $rundist $runsec $run_count
		if (($rundist < 4) or ($rundist > 12) or ($isfigged < 1))
			if ($echo_count = $sectiona)
				echo ansi_13 #178
				setvar $echo_count 1
			else
				add $echo_count 1
			end
		else
			setvar $adjrunsec1 sector.warps[$run_count][1]
			setvar $adjrunsec2 sector.warps[$run_count][2]
			getsectorparameter $adjrunsec1 "FIGSEC" $isfiggedadj1
			getsectorparameter $adjrunsec2 "FIGSEC" $isfiggedadj2
			if ((sector.warpcount[$adjrunsec1] = 1) or (sector.warpcount[$adjrunsec2] = 1) or ($isfiggedadj1 < 1) or ($isfiggedadj2 < 1))
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setvar $echo_count 1
				else
					add $echo_count 1
				end
			end
			add $run_database_count 1
			if ($echo_count = $sectiona)
				echo ansi_13 #178
				setvar $echo_count 1
			else
				add $echo_count 1
			end
			setvar $run_database[$run_database_count]  $run_count

		end
	end
	add $run_count 1
end
if ($run_database_count < 20)
	setvar $switchboard~message "Runaway list too short - ReMapping...*"
	gosub :switchboard~switchboard
	waitfor "Message sent on"
else
	goto :end_map
end
setvar $run_count 1

echo "** Plotting Secondary Flee Sectors...**"
setvar $echo_count 1

:second_run_count
while ($run_count <= sectors)

	if (sector.warpcount[$run_count] <> 1]
		if ($echo_count = $sectiona)
			echo ansi_13 #178
			setvar $echo_count 1
		else
			add $echo_count 1
		end

	else
		getdistance $rundist $runsec $run_count
		getsectorparameter $run_count "FIGSEC" $isfigged

		if ($rundist < 4)
			if ($echo_count = $sectiona)
				echo ansi_13 #178
				setvar $echo_count 1
			else
				add $echo_count 1
			end
		elseif ($rundist > 12)
			if ($echo_count = $sectiona)
				echo ansi_13 #178
				setvar $echo_count 1
			else
				add $echo_count 1
			end
		elseif ($isfigged < 1)
			if ($echo_count = $sectiona)
				echo ansi_13 #178
				setvar $echo_count 1
			else
				add $echo_count 1
			end
		else
			setvar $adjrunsec1 sector.warps[$run_count][1]
			getsectorparameter $run_count "FIGSEC" $isfiggedadj1
			if ($isfiggedadj1 < 1)
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setvar $echo_count 1
				else
					add $echo_count 1
				end
			else
				add $run_database_count 1
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setvar $echo_count 1
				else
					add $echo_count 1
				end
				setvar $run_database[$run_database_count]  $run_count

			end
		end
	end
	add $run_count 1
end

:end_map
if ($doevacuate)
	setvar $switchboard~message "Runaway/Evacuate Multiple Planets Mode - " $run_database_count " flee sectors plotted.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Runaway - " $run_database_count " flee sectors plotted.*"
	gosub :switchboard~switchboard
end
goto :getsettings

:run_pwarp
if ($firstrun <> 0)
	setvar $planet~warpto $firstrun
	setvar $firstrun 0
else
	gosub :getnewrunawaysector
end
if ($doevacuate)
	setvar $bot~parm1 $planet~warpto
	goto :evac_start
end
setvar $planet~pwarp_scan false
setvar $player~bot_name $switchboard~bot_name
gosub :planet~pwarp
gosub :player~quikstats
if ($player~current_sector <> $planet~warpto)
	goto :run_pwarp
end
setvar $runsec $player~current_sector
goto :getsettings

:getnewrunawaysector
setvar $planet~warpto 0
while ($planet~warpto <= 0)
	getrnd $random 1 $run_database_count
	setvar $planet~warpto $run_database[$random]
end
return
#============================== END RUNAWAY (RUNAWAY) SUB ==============================
:getsettings
killalltriggers
settextlinetrigger 1 :findfig "Deployed Fighters Report Sector"
pause

:findfig
killalltriggers
gosub :validatefighterhit
if ($isvalid <> true)
	goto :getsettings
end
#getWord CURRENTLINE $fighit 5
#stripText $fighit ":"
#isNumber $test $fighit
getdistance $dist $dropsector $player~current_sector
echo "[" $dist "]*"
if ($dist <= 2)
	goto :run_pwarp
end
goto :getsettings

# ======================     START PLANET MOVER (EVAC) SUBROUTINE    ==========================
:evac_start
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Must start from Citadel or Command Prompt*"
	gosub :switchboard~switchboard
	halt
end
if (($bot~parm1 = "s") and ($stardock <> 0))
	setvar $bot~parm1 $stardock
end
if (($bot~parm1 = "r") and ($rylos <> 0))
	setvar $bot~parm1 $rylos
end
if (($bot~parm1 = "a") and ($alpha_centauri <> 0))
	setvar $bot~parm1 $alpha_centauri
end
if (($bot~parm1 = "h") and ($home_sector <> 0))
	setvar $bot~parm1 $home_sector
end
setvar $target_sector $bot~parm1

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
add $planet~planetcount 1
getword $line $planet~planet[$planet~planetcount] 1
settextlinetrigger getline2 :evac_planetline "   <"
settextlinetrigger getend :evac_done "Land on which planet "
pause

:evac_no_scanner
goto :evac_move

:evac_done
killtrigger getline2
setvar $evac_total $planet~planetcount
setvar $planet~planetcount 1

:evac_move
send "l " $planet~planet[$planet~planetcount] "* "
gosub :planet~getplanetinfo
if ($planet~citadel < 4)
	add $planet~planetskip 1
	goto :evac_twarp
elseif ($planet~citadel > 3)
	send "m * * * t n t 1 * c p " $target_sector "*"
	settextlinetrigger warp :evac_pwarp "Locating beam pinpointed, TransWarp"
	settextlinetrigger no_warp :evac_no_fig "You do not have any fighters in Sector"
	pause
end

:evac_pwarp
killtrigger no_warp
send "y*"
if ($planet~planetcount = $evac_total)
	subtract $planet~planetcount $planet~planetskip
	setvar $switchboard~message "Evac Complete. Moved: "&$planet~planetcount&" Skipped: "&$planet~planetskip&". *"
	gosub :switchboard~switchboard
	goto :evac_end
end
send "qq  z  n  *  m" $evac_home "*y"
settexttrigger warp :evac_twarp "All Systems Ready, shall we engage?"
settexttrigger no_warp :evac_no_warp_back "Do you want to make"
pause

:evac_twarp
killtrigger no_warp
add $planet~planetcount 1
send "y  *  *  *  q  z  n  *"
goto :evac_move

:evac_no_warp_back
killtrigger warp
setvar $switchboard~message "No Fighter at Home Sector.  Shutting down Evac.*"
gosub :switchboard~switchboard
goto :evac_end

:evac_no_fig
killtrigger warp
if ($mode = "Runaway")
	send "qqq* "
	gosub :getnewrunawaysector
	setvar $target_sector $planet~warpto
	goto :evac_move
end
setvar $switchboard~message "No Fighter at Target Sector.  Shutting down Evac.*"
gosub :switchboard~switchboard

:evac_end
goto :getsettings

# ======================     END PLANET MOVER (EVAC) SUBROUTINE    ==========================
:validatefighterhit
setvar $isvalid false
cuttext currentline&" " $radio 1 1
gettext currentline $dropsector $start_fig_hit $end_fig_hit
if ($radio <> "D")
	return
end
gettext currentansiline $alien_check $start_fig_hit_owner $end_fig_hit_owner
getwordpos currentline $pos $start_fig_hit_owner
getwordpos $alien_check $apos $alien_ansi
if (($apos > 0) or ($pos = 0))
	return
end
if ($targetingperson)
	getwordpos currentline $pos " "&$target&"'s "
	if ($pos <= 0)
		return
	end
end
setvar $isvalid true
return

include "source\include\planet"
include "source\include\switchboard.ts"
include "source\include\help"
