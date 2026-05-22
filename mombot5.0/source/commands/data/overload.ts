gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"overload  {under} {bubble}"
setvar $help~help[2] $help~tab&"        "
setvar $help~help[3] $help~tab&"  Tells you when you have sectors overloaded "
setvar $help~help[4] $help~tab&"  with planets        "
setvar $help~help[5] $help~tab&"    "
setvar $help~help[6] $help~tab&"     under - tells you which sectors "
setvar $help~help[7] $help~tab&"             have less than max planets"
gosub :help~helpfile

# =============================== START OVERLOAD =====================================
:overload
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Command") and ($startinglocation <> "Citadel"))
	setvar $switchboard~message "Must start at Citadel or Command Prompt for overload check*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 = "under")
	setvar $showunderload true
else
	setvar $showunderload false
end

getwordpos " "&$bot~user_command_line&" " $pos " bubble "
setvar $bubble false
if ($pos > 0)
	setvar $bubble true
end

:start_overload
if ($game~max_planets_per_sector <= 0)
	if ($startinglocation = "Citadel")
		send "q"
		gosub :planet~getplanetinfo
		send "q"
	end

	:getpps
	send "V"
	settextlinetrigger pps :pps "The Maximum number of Planets per sector:"
	pause

	:pps
	getword currentline $pps 8
	striptext $pps ","
	striptext $pps "."

	:grabplanets
	setvar $sector_list " "
	setvar $sector_list_length 0
	if ($startinglocation = "Citadel")
		send "L " & $planet~planet & "* C XLQCYQ"
	else
		send "TLQCYQ"
	end
else
	setvar $pps $game~max_planets_per_sector

	:grabplanetsnov
	setvar $sector_list " "
	setvar $sector_list_length 0
	if ($startinglocation = "Citadel")
		send "XLQCYQ"
	else
		send "TLQCYQ"
	end
end

waiton "Corporate Planet Scan"

:getcorpplanetlist
settextlinetrigger getcorpplanet :getcorpplanet "Class"
settextlinetrigger corpplanetsdone :corpplanetsdone "======   ============  ==== ==== ==== ===== ===== ===== ========== =========="
settextlinetrigger corpplanetsdone2 :corpplanetsdone "No Planets claimed"
pause

:getcorpplanet
gosub :getthisplanet
settextlinetrigger getcorpplanet :getcorpplanet "Class"
pause

:corpplanetsdone
killtrigger getcorpplanet
killtrigger corpplanetsdone
killtrigger corpplanetsdone2
waiton "Personal Planet Scan"

:getpersplanetlist
settextlinetrigger getpersplanet :getpersplanet "Class"
settextlinetrigger persplanetsdone :persplanetsdone "======   ============  ==== ==== ==== ===== ===== ===== ========== =========="
settextlinetrigger persplanetsdone2 :persplanetsdone "No Planets claimed"
pause

:getpersplanet
gosub :getthisplanet
settextlinetrigger getpersplanet :getpersplanet "Class"
pause

:persplanetsdone
killtrigger getpersplanet
killtrigger persplanetsdone
killtrigger persplanetsdone2

:calculate
setvar $overloads 0

:compareouterloop
if ($sector_list_length > 0)
	getword $sector_list $currentdatasector 1
	setvar $planet~planets_this_sector 1
	setvar $compare_index 1

	:compareinnerloop
	if ($compare_index < $sector_list_length)
		add $compare_index 1
		getword $sector_list $compare_sector $compare_index
		if ($currentdatasector = $compare_sector)
			add $planet~planets_this_sector 1
		end
		goto :compareinnerloop
	else
		if ($planet~planets_this_sector > $pps)
			getsectorparameter $currentdatasector "BUBBLE" $isbubble
			getsectorparameter $currentdatasector "FARM" $isfarm

			if (($bubble <> true) or (($bubble = true) and (($isbubble = true) or ($isfarm = true))))
				setvar $switchboard~message "OVERLOAD: " & $planet~planets_this_sector & " planets found in sector " & $currentdatasector & "*"
				gosub :switchboard~switchboard
				add $overloads 1
			end
		elseif ((($planet~planets_this_sector > 1) or ($pps <= 1)) and ($planet~planets_this_sector < $pps) and ($showunderload = true))
			setvar $switchboard~message  ""&$planet~planets_this_sector & " planets found in sector " & $currentdatasector & ". Sector needs " &($pps-$planet~planets_this_sector)&" planets to be full.*"
			gosub :switchboard~switchboard
		end
		setvar $replace_sector " " & $currentdatasector & " "
		replacetext $sector_list $replace_sector " "
		subtract $sector_list_length $planet~planets_this_sector
		goto :compareouterloop
	end
else
	setvar $switchboard~message ""&$overloads & " Overloads Found*"
	gosub :switchboard~switchboard
	halt
end

:getthisplanet
setvar $line currentline
cuttext $line $goodline 41 5
if ($goodline = "Class")
	getword $line $sector 1
	setvar $sector_list $sector_list & $sector & " "
	add $sector_list_length 1
end
return
# ======================================= END OVERLOAD =========================================

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
