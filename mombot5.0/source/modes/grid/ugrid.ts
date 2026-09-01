logging "OFF"
reqrecording
goto :load_script
include "source\include\planet"

:load_script
loadvar $bot_name
loadvar $avoidedsectorsugrid
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $stardock
loadvar $home_sector
loadvar $backdoor
loadvar $limpet_cost
loadvar $armid_cost
loadvar $limpet_removal_cost
loadvar $password
setvar $grid_limpets 3
setvar $grid_armids 3
setvar $refurb true
loadvar $fig_file
loadvar $limp_file
loadvar $armid_file
loadvar $command
loadvar $bot~folder
setvar $gridder_file $bot~folder&"/_MOM"&gamename&"_GRIDDER_TARGETS.txt"
setvar $master_edge_file $bot~folder&"/_MOM_"&gamename&"_EdgeMasterList.sectors"
setvar $unexplored_file $bot~folder&"/_MOM_UNEXPLORED_"&gamename&".sectors"
setvar $imlimped false
setarray $move sectors
setvar $checkedforinfo ""
setvar $grid_figs 1
setvar $attack_retreat false

getsectorparameter sectors "FIGSEC" $isfigged
getsectorparameter sectors "MINESEC" $isarmided
getsectorparameter sectors "LIMPSEC" $islimped
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Ultimate gridder. Visits all targeted sectors."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage: ugrid [targeting] {figs} {armids} {limpets} {safety}"
setvar $help~help[4] $help~tab&"               {planets} {warp} {refurb} {scrub} {avoid}"
setvar $help~help[5] $help~tab&"               {aggressive} {passive} {clear}"
setvar $help~help[6] $help~tab&"       "
setvar $help~help[7] $help~tab&"Options:"
setvar $help~help[8] $help~tab&"   [targeting]  Filename to pull targets from or auto."
setvar $help~help[9] $help~tab&"   [figs]       Fighters to drop. Default: 1."
setvar $help~help[10] $help~tab&"   [armids]     Armid mines to drop. Default: 3."
setvar $help~help[11] $help~tab&"   [limps]      Limpet mines to drop. Default: 3."
setvar $help~help[12] $help~tab&"   [safety]     ultra, safe, or none. Default: ultra."
setvar $help~help[13] $help~tab&"   [planets]    all, shielded, or none. Default: all."
setvar $help~help[14] $help~tab&"   [warp]       twarp or bwarp. Default: twarp."
setvar $help~help[15] $help~tab&"   {norefurb}   Turns off auto-refurbing mines at Stardock."
setvar $help~help[16] $help~tab&"   {scrub}      Scrub at dock when catching a limpet."
setvar $help~help[17] $help~tab&"   {avoid}      Avoid sectors with enemy limpets."
setvar $help~help[18] $help~tab&"   {aggressive} Do not avoid big fighter groups."
setvar $help~help[19] $help~tab&"   {passive}    Avoid hitting player fighters or mines."
setvar $help~help[20] $help~tab&"   {clear}      Clears internal avoided-sector list."
gosub :help~helpfile

getword $user_command_line $parm1 1 "EMPTY"
if (($parm1 = "auto") or ($parm1 = "EMPTY"))

else
	setvar $gridtargets true
	setvar $targetfile $parm1
	fileexists $test $targetfile
	if ($test = false)
		setvar $switchboard~message "Grid target file: [" $targetfile "] does not exist, shutting down..*"
		gosub :switchboard~switchboard
		halt
	else
		readtoarray $targetfile $targetsectors
	end
end
getword $user_command_line $parm2 2 "EMPTY"
getword $user_command_line $parm3 3 "EMPTY"
getword $user_command_line $parm4 4 "EMPTY"
isnumber $test $parm2
if ($test)
	setvar $grid_figs $parm2
end
isnumber $test $parm3
if ($test)
	setvar $grid_armids $parm3
end
isnumber $test $parm4
if ($test)
	setvar $grid_limpets $parm4
end
getwordpos $user_command_line $pos "aggressive"
if ($pos > 0)
	setvar $attackretreat true
else
	setvar $attackretreat false
end

getwordpos $user_command_line $pos "avoid"
if ($pos > 0)
	setvar $grid_avoid true
else
	setvar $grid_avoid false
end
getwordpos $user_command_line $pos "scrub"
if ($pos > 0)
	setvar $autoclean true
else
	setvar $autoclean false
end
getwordpos $user_command_line $pos "norefurb"
if ($pos > 0)
	setvar $refurb false
else
	setvar $refurb true
end
getwordpos $user_command_line $pos "bwarp"
if ($pos > 0)
	setvar $grid_warp "bwarp"
else
	setvar $grid_warp "twarp"
end
getwordpos $user_command_line $pos "shield"
if ($pos > 0)
	setvar $avoidshieldedonly true
else
	setvar $avoidshieldedonly false
end
getwordpos $user_command_line $pos "exist"
if ($pos > 0)
	setvar $gridexistingonly true
else
	setvar $gridexistingonly false
end

getwordpos $user_command_line $pos "clear"
if ($pos > 0)
	setvar $avoidedsectorsugrid ""
end

getwordpos $user_command_line $pos "none"
if ($pos > 0)
	setvar $ultrasafelimpet false
	setvar $ultrasafearmid false
else
	getwordpos $user_command_line $pos "safe"
	if ($pos > 0)
		setvar $ultrasafelimpet true
		setvar $ultrasafearmid false
	else
		setvar $ultrasafelimpet true
		setvar $ultrasafearmid true
	end
end

getwordpos $user_command_line $pos "passive"
if ($pos > 0)
	setvar $passive true
	setvar $avoid true
else
	setvar $passive false
end

if (($stardock = 0) or ($stardock = ""))
	setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
	gosub :switchboard~switchboard
	halt
end
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end
if ($isarmided = "")
	setvar $switchboard~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
	gosub :switchboard~switchboard
	halt
end
if ($islimped = "")
	setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
	gosub :switchboard~switchboard
	halt
end
if ($player~photons > 0)
	send "'Can not run with photons on your ship.*"
	halt
end

gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must start gridder from citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

killalltriggers
gosub :checkavoidedsectors

:checkfortargets
send "q"
gosub :getplanetinfo
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
setvar $switchboard~message "Clearing messages for possible exit/enter later*"
gosub :switchboard~switchboard
gosub :xenter
gosub :xenter
gosub :xenter
gosub :landonplanetentercitadel
setvar $limpetbefore $player~limpets
setvar $limpetafter $limpetbefore
setvar $armidbefore $player~armids
setvar $armidafter $armidbefore

setvar $switchboard~message "M()M Unlimited Gridder Powering Up!*"
gosub :switchboard~switchboard
waitfor "(?="

setvar $homesec $player~current_sector

:checkship
killalltriggers
gosub :player~quikstats
send "c;q"
waitfor "Offensive Odds:"
getwordpos currentline $pos "Offensive"
cuttext currentline $oddline $pos 99
gettext $oddline $offodd "Odds:" ":1"
striptext $offodd " "
striptext $offodd "."
waitfor "Mine Max:"
gettext currentline $maxmines "Mine Max:" "B"
striptext $maxmines " "
waitfor "Figs Per Attack:"
getword currentline $figs 5
multiply $offodd $figs
divide $offodd 12
setvar $max_figs $player~fighters
gosub :player~quikstats

:restart
send "q"
gosub :getplanetinfo
send "c "
gosub :findalltargetsectors
gosub :assemble_mac
gosub :assemble_return_mac
gosub :assemble_attack_mac
gosub :assemble_land_mac

:select_boomsec
killalltriggers
gosub :player~quikstats
if ($player~fighters < $max_figs)
	echo ansi_12 "*Not enough fighters to safely continue.*" ansi_7
	halt
end
setvar $limpetafter $player~limpets
setvar $armidafter $player~armids
if ($boomsec > 0)
	if (($limpetbefore > $limpetafter) and ($islimped = false))
		setvar $limpetbefore $player~limpets
		setvar $limpetafter $limpetbefore
		setsectorparameter $player~current_sector "LIMPSEC" true
	elseif (($limpetbefore = $limpetafter) and ($islimped = false))
		setvar $imlimped true
	end
	if (($armidbefore > $armidafter) and ($isarmided = false))
		setvar $armidbefore $player~armids
		setvar $armidafter $armidbefore
		setsectorparameter $player~current_sector "MINESEC" true
	end
end
if ($twarp = "No")
	goto :callsaveme
end

if ($player~limpets < $grid_limpets) or ($player~armids < $grid_armids) or (($imlimped = true) and ($autoclean = true))
	if ($refurb)
		gosub :attempt_refurb
	else
		echo ansi_12 "*You must stock up on mines before continuing." ansi_7
		halt
	end
	gosub :player~quikstats
	setvar $limpetbefore $player~limpets
	setvar $limpetafter $limpetbefore
	setvar $armidbefore $player~armids
	setvar $armidafter $armidbefore
end

:continueon
getrnd $random 1 $databasecount
getword $database $warpto $random
if ($warpto = 0)
	setvar $switchboard~message "Database Cleared - Recalculating and Restarting...*"
	gosub :switchboard~switchboard
	waiton "Message sent on sub-space"
	goto :restart
else
	getdistance $distance $move[$warpto] $warpto
	if ($distance <= 0)
		send "^f"&$move[$warpto]&"*"&$warpto&"*q"
		waiton "ENDINTERROG"
		getdistance $distance $move[$warpto] $warpto
	end
end

:clearit
killalltriggers
replacetext $database " "&$warpto&" " " "
subtract $databasecount 1
setvar $furbing false
if ($grid_warp = "twarp")
	gosub :dotwarp
elseif ($grid_warp = "bwarp")
	gosub :bwarp
else
	halt
end

:hittingsec
killalltriggers
setvar $boomsec $move[$warpto]
getsectorparameter $boomsec "FIGSEC" $isfigged
getsectorparameter $boomsec "MINESEC" $isarmided
getsectorparameter $boomsec "LIMPSEC" $islimped
if ($isfigged = "")
	setvar $isfigged false
end
if ($islimped = "")
	setvar $islimped false
end
if ($isarmided = "")
	setvar $isarmided false
end
setvar $imlimped false
setvar $justcheckingifalive true
gosub :player~quikstats
if (($twarp = "No") or ($player~current_sector <> $warpto))
	goto :callsaveme
end
if ($gridexistingonly)
	send $mac&$return_mac
	setvar $justcheckingifalive true
	gosub :player~quikstats
	if (($twarp = "No") or ($player~current_sector <> $homesec))
		goto :callsaveme
	end
	send $land_mac
	goto :select_boomsec
end
send "sdszh*  "
waitfor "Relative Density Scan"
waitfor "Long Range Scan"
waitfor "["&$warpto&"]"
getdistance $distance $warpto $boomsec
getdistance $distanceback $boomsec $warpto
setvar $containsshieldedplanet false
setvar $i 1
while ($i <= sector.planetcount[$boomsec])
	getword sector.planets[$boomsec][$i] $test 1
	if ($test = "<<<<")
		setvar $containsshieldedplanet true
	end
	add $i 1
end
setvar $figowner sector.figs.owner[$boomsec]
setvar $figcount sector.figs.quantity[$boomsec]
getword $figowner $aliencheck 1
lowercase $aliencheck
setvar $mineowner sector.mines.owner[$boomsec]
setvar $minecount sector.mines.quantity[$boomsec]
if (((($avoidshieldedonly = true) and ($containsshieldedplanet = false)) or (sector.planetcount[$boomsec] <= 0)) and (((sector.tradercount[$boomsec] <= 0) and ((($distance = 1) and ((($boomsec > 10) and ((($boomsec <> stardock) and ((($attackretreat = true) and (($distanceback = 1) and (sector.figs.quantity[$boomsec] >= ($offodd * 2)))) or (sector.figs.quantity[$boomsec] < ($offodd * 2))))))))))))
	if ($passive)
		echo "**" ansi_14
		echo "[" ansi_15 "Target Sector: " $boomsec ansi_14 "]*"
		echo "[" ansi_15 "Mine Count: " $minecount ansi_14 "]*"
		echo "[" ansi_15 "Mine Owner: " $mineowner ansi_14 "]*"
		echo "[" ansi_15 "Fighter Count: " $figcount ansi_14 "]*"
		echo "[" ansi_15 "Fighter Owner: " $figowner ansi_14 "]*"
		echo "**" ansi_7
	end
	if (($passive = true) and (((($minecount <= 0) or (($minecount > 0) and (($mineowner <> "yours") and ($mineowner <> "belong to your Corp")))) and (($figowner <> "belong to your Corp") and (($figowner <> "yours") and (($figowner <> "Rogue Mercenaries") and (($aliencheck <> "the") and ($figowner <> ""))))))))
		echo "**" ansi_14
		echo "[" ansi_15 "Passive detection avoiding sector: " $boomsec "]*"
		echo "**" ansi_7
		send "m      " $homesec "* y   y    *  *  "
		gosub :player~quikstats
		if (($twarp = "No") or ($player~current_sector <> $homesec))
			goto :callsaveme
		end
		send $land_mac
		setvar $avoidedsectorsugrid $avoidedsectorsugrid&" "&$boomsec&" "
		savevar $avoidedsectorsugrid
		goto :select_boomsec
	end
	if ((sector.anomoly[$boomsec] = true) and (($islimped = false) and ($grid_avoid = true)))
		send "m      " $homesec "* y   y    *  *  "
		gosub :player~quikstats
		if (($twarp = "No") or ($player~current_sector <> $homesec))
			goto :callsaveme
		end
		send $land_mac
		setvar $avoidedsectorsugrid $avoidedsectorsugrid&" "&$boomsec&" "
		savevar $avoidedsectorsugrid
		setvar $switchboard~message "Probable Enemy Limpet Detected - Sector " $boomsec ".*"
		gosub :switchboard~switchboard
		goto :select_boomsec
	end
	if ((sector.anomoly[$boomsec] = true) and ($islimped = false))
		setvar $imlimped true
	end

	send "m"
	gosub :return_triggers
	if ((sector.mines.quantity[$boomsec] > 0) and (($mineowner <> "yours") and ($mineowner <> "belong to your Corp")))
		send $boomsec&$attack_mac&"* "&$mac&$return_mac
	else
		send $boomsec&$attack_mac&$mac&$return_mac
	end
	if (($grid_figs > 0) and (sector.figs.quantity[$boomsec] < ($offodd * 2)))
		setsectorparameter $boomsec "FIGSEC" true
	end
	gosub :player~quikstats
	if (($twarp = "No") or ($player~current_sector <> $homesec))
		goto :callsaveme
	end
	send $land_mac
	setvar $output ""
	if (sector.planetcount[$boomsec] > 0)
		setvar $i 1
		while ($i <= sector.planetcount[$boomsec])
			setvar $output $output&"    "&sector.planets[$boomsec][$i]&#13
			add $i 1
		end
		setvar $output "'"&#13&"WARNING - Planet(s) Detected, Not Avoided - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
		send $output
		write $gridder_file date&"    "&$output
	elseif (sector.shipcount[$boomsec] > 0)
		setvar $i 1
		while ($i <= sector.shipcount[$boomsec])
			setvar $output $output&"    "&sector.ships[$boomsec][$i]&#13
			add $i 1
		end
		setvar $output "'"&#13&"WARNING - Empty Ship(s) Detected, Not Avoided - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
		send $output
		write $gridder_file date&"    "&$output
	end
	goto :select_boomsec
else
	send "m"
	gosub :return_triggers
	send $homesec "* y y  *  "
	gosub :player~quikstats
	if (($twarp = "No") or ($player~current_sector <> $homesec))
		goto :callsaveme
	end
	send $land_mac
	setvar $avoidedsectorsugrid $avoidedsectorsugrid&" "&$boomsec&" "
	savevar $avoidedsectorsugrid
	setvar $output ""
	if (sector.planetcount[$boomsec] > 0)
		setvar $i 1
		while ($i <= sector.planetcount[$boomsec])
			setvar $output $output&"    "&sector.planets[$boomsec][$i]&#13
			add $i 1
		end
		setvar $i 1
		while ($i <= sector.tradercount[$boomsec])
			setvar $output $output&"    "&sector.traders[$boomsec][$i]&#13
			add $i 1
		end
		setvar $output $output&sector.figs.quantity[$boomsec]&" figs owned by: "&sector.figs.owner[$boomsec]&#13
		setvar $output "'"&#13&"WARNING - Planet(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
	elseif (sector.tradercount[$boomsec] > 0)
		setvar $i 1
		while ($i <= sector.tradercount[$boomsec])
			setvar $output $output&"    "&sector.traders[$boomsec][$i]&#13
			add $i 1
		end
		setvar $output $output&sector.figs.quantity[$boomsec]&" figs owned by: "&sector.figs.owner[$boomsec]&#13
		setvar $output "'"&#13&"WARNING - Trader(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
	elseif ($distance <> 1)
		setvar $output "'WARNING - Sector not Adj (Sector "&$boomsec&")"&#13
	elseif (($boomsec <= 10) or ($boomsec = stardock))
		setvar $output "'WARNING - Fed Sector Adj (Sector "&$boomsec&")"&#13
	elseif (sector.figs.quantity[$boomsec] >= ($offodd * 2))
		setvar $output "'WARNING - "&sector.figs.quantity[$boomsec]&" figs owned by: "&sector.figs.owner[$boomsec]&" - Sector "&$boomsec&#13
	else
		setvar $output "'WARNING - Unknown Error - "&$boomsec&#13
	end
	send $output
	write $gridder_file date&"    "&$output
	goto :select_boomsec
end

:findalltargetsectors
setvar $targetsectorcount 1
setvar $databasecount 0
setvar $database ""
setvar $adjacentdatabase ""

echo ansi_14 "* Loading target sectors..*" ansi_7
setvar $perc 0
if ($gridtargets)
	setvar $m 1
	send "^"
	while ($m < $targetsectors)
		setvar $destination $targetsectors[$m]
		getsectorparameter $destination "FIGSEC" $isfigged
		if ($isfigged = "")
			setvar $isfigged false
		end
		gosub :getcourses

		getwordpos $avoidedsectorsugrid $pos " "&$destination&" "
		striptext $destination " "
		if (($pos <= 0) and (($isfigged <= 0) or ($gridexistingonly = true)))
			setvar $i 1
			setvar $isfound false
			if ((sector.warpsin[$destination][$i] > 0) and ($isfound = false))
				setvar $adjinf sector.warpsin[$destination][$i]
				getsectorparameter $adjinf "FIGSEC" $isfigged
				getsectorparameter $adjinf "MINESEC" $isarmided
				getsectorparameter $adjinf "LIMPSEC" $islimped
				if ($isfigged = "")
					setvar $isfigged false
				end
				if ($islimped = "")
					setvar $islimped false
				end
				if ($isarmided = "")
					setvar $isarmided false
				end

				if (($ultrasafelimpet = true) and ($islimped = false))

				elseif (($ultrasafearmid = true) and ($isarmided = false))

				else

					getwordpos $adjacentdatabase $pos " "&$destination&" "
					getwordpos $database $pos2 " "&$adjinf&" "
					getwordpos $avoidedsectorsugrid $pos3 " "&$adjinf&" "
					if (($pos <= 0) and (($pos3 <= 0) and (($adjinf > 10) and (($adjinf <> stardock) and ($isfigged > 0)))))
						if (($adjinf <> $destination) and ($pos2 <= 0))
							setvar $database $database&" "&$adjinf&" "
							setvar $adjacentdatabase $adjacentdatabase&" "&$destination&" "
							setvar $move[$adjinf] $destination
							setvar $isfound true
							add $databasecount 1
						end
					end
				end

				add $i 1
			end
		end
		setvar $perctest (($m * 100) / sectors)
		if ($perctest > $perc)
			setvar $perc (($m * 100) / sectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ansi_14 "" ansi_15 " " $perc "%" #27&"[1A   "
		end
		add $m 1
	end

	send "q "

elseif ($gridexistingonly)
	while ($targetsectorcount < sectors)
		add $targetsectorcount 1
		getsectorparameter $targetsectorcount "FIGSEC" $isfigged
		getsectorparameter $targetsectorcount "MINESEC" $isarmided
		getsectorparameter $targetsectorcount "LIMPSEC" $islimped
		if ($isfigged = "")
			setvar $isfigged false
		end
		if ($islimped = "")
			setvar $islimped false
		end
		if ($isarmided = "")
			setvar $isarmided false
		end
		getwordpos $avoidedsectorsugrid $pos " "&$targetsectorcount&" "
		if (($pos <= 0) and ($isfigged >= 1))
			if ($grid_limpets > 0)
				if ($islimped = false)
					setvar $database $database&" "&$targetsectorcount&" "
					setvar $move[$targetsectorcount] $targetsectorcount
					add $databasecount 1
				end
			end
			if ($grid_armids > 0)
				getwordpos $database $pos2 " "&$targetsectorcount&" "
				if (($pos2 <= 0) and ($isarmided = false))
					setvar $database $database&" "&$targetsectorcount&" "
					setvar $move[$targetsectorcount] $targetsectorcount
					add $databasecount 1
				end
			end
			if (($grid_figs > 0) and (($grid_armids <= 0) and ($grid_limpets <= 0)))
				if ($isfigged >= 1)
					setvar $database $database&" "&$targetsectorcount&" "
					setvar $move[$targetsectorcount] $targetsectorcount
					add $databasecount 1
				end
			end
		end
		setvar $perctest (($targetsectorcount * 100) / sectors)
		if ($perctest > $perc)
			setvar $perc (($targetsectorcount * 100) / sectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ansi_14 "" ansi_15 " " $perc "%" #27&"[1A   "
		end
	end
else
	while ($targetsectorcount < sectors)
		getwordpos $avoidedsectorsugrid $pos " "&$targetsectorcount&" "
		getsectorparameter $targetsectorcount "FIGSEC" $isfigged
		getsectorparameter $targetsectorcount "MINESEC" $isarmided
		getsectorparameter $targetsectorcount "LIMPSEC" $islimped
		if ($isfigged = "")
			setvar $isfigged false
		end
		if ($islimped = "")
			setvar $islimped false
		end
		if ($isarmided = "")
			setvar $isarmided false
		end
		if (($pos <= 0) and ($isfigged >= 1))
			if (($ultrasafelimpet = true) and ($islimped = false))

			elseif (($ultrasafearmid = true) and ($isarmided = false))

			else
				setvar $i 1
				setvar $isfound false
				while ((sector.warps[$targetsectorcount][$i] > 0) and ($isfound = false))
					setvar $adjinf sector.warps[$targetsectorcount][$i]
					getsectorparameter $adjinf "FIGSEC" $isfigged
					if ($isfigged = "")
						setvar $isfigged false
					end
					getwordpos $adjacentdatabase $pos " "&$adjinf&" "
					getwordpos $database $pos2 " "&$targetsectorcount&" "
					getwordpos $avoidedsectorsugrid $pos3 " "&$adjinf&" "
					if (($pos <= 0) and (($pos3 <= 0) and (($adjinf > 10) and (($adjinf <> stardock) and ($isfigged = false)))))
						if (($adjinf <> $targetsectorcount) and ($pos2 <= 0))
							setvar $database $database&" "&$targetsectorcount&" "
							setvar $adjacentdatabase $adjacentdatabase&" "&$adjinf&" "
							setvar $move[$targetsectorcount] $adjinf
							setvar $isfound true
							add $databasecount 1
						end
					end
					add $i 1
				end
			end
		end

		setvar $perctest (($targetsectorcount * 100) / sectors)
		if ($perctest > $perc)
			setvar $perc (($targetsectorcount * 100) / sectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ansi_14 "" ansi_15 " " $perc "%" #27&"[1A   "
		end
		add $targetsectorcount 1

	end
end
setvar $switchboard~message ""&$databasecount&" target sectors found.*"
gosub :switchboard~switchboard
if ($databasecount <= 0)
	setvar $switchboard~message "Visited every sector possible. Refresh fighters and update warp data to verify..*"
	gosub :switchboard~switchboard
	if ($refurb)
		gosub :attempt_refurb
		gosub :player~quikstats
		send "p "&$home_sector&"* y "
		gosub :player~quikstats
		setvar $switchboard~message "Scrubbed at dock and pwarped home..*"
		gosub :switchboard~switchboard
	end

	halt
end
return

:assemble_mac
setvar $mac ""
if ($gridexistingonly)
	if ($grid_figs > 0)
		setvar $mac "f "&$grid_figs&"*cd"
	end
	if (($grid_armids > 0) and ($player~armids > 0))
		setvar $mac $mac&"h1 z"&$grid_armids&"*zc*"
	end
	if (($grid_limpets > 0) and ($player~limpets > 0))
		setvar $mac $mac&"h2 z"&$grid_limpets&"*zc*"
	end
else
	if ($grid_figs > 0)
		setvar $mac "f "&$grid_figs&"*cd"
	end
	if (($grid_armids > 0) and ($player~armids > 0))
		setvar $mac $mac&"h1 z"&$grid_armids&"*zc*"
	end
	if (($grid_limpets > 0) and ($player~limpets > 0))
		setvar $mac $mac&"h2 z"&$grid_limpets&"*zc*"
	end
end
return

:assemble_attack_mac
setvar $attack_mac "* za"&$figs&"* jr * "
return

:assemble_return_mac
setvar $return_mac $homesec&"* yy * * "
return

:assemble_land_mac
setvar $land_mac "l j"&#8&#8&#8&#8&#8&$planet&"*  * j m  * * *  t * t 1* c * "

return

:return_triggers
settexttrigger incit :incit "To which Sector"
settexttrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
settexttrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
gosub :delaytrigger
pause

:incit
killalltriggers
return

:igd
goto :callsaveme

:landonplanetentercitadel
send "l " $planet "* c"
waiton "<Enter Citadel>"
return

:leavecitadelandplanet
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return

:checkavoidedsectors
gosub :sector~getavoids
setvar $avoid_i 0
while ($avoid_i < $sector~avoidcount)
	add $avoid_i 1
	setvar $avoidedsectorsugrid $avoidedsectorsugrid&" "&$sector~avoids[$avoid_i]&" "
end
return

:delaytrigger
setdelaytrigger delayuntilsaveme :callsaveme 5000
return

:xenter
send "q y * t* * *" $password "*    *    *       za"&$figs&"*   z*   f z 1*  z c d *  "
return

:getcourses
killalltriggers
setvar $originaldestination $destination
setvar $player~starting_point $player~current_sector
setvar $player~destination $destination
gosub :player~getcourse
setvar $courselength $player~courselength
setvar $index 1
while ($index <= $courselength)
	if (($fighter_grid[$player~course[$index]] <= 0) and ($player~course[$index] <> $originaldestination))
		setvar $destination $player~course[$index]
	elseif ($player~course[$index] <> $originaldestination)
		setvar $destination $originaldestination
	end
	add $index 1
end

:nopath
killalltriggers
return

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
setvar $planet_fuel $planet~planet_fuel
setvar $planet_fuel_max $planet~planet_fuel_max
setvar $planet_organics $planet~planet_organics
setvar $planet_organics_max $planet~planet_organics_max
setvar $planet_equipment $planet~planet_equipment
setvar $planet_equipment_max $planet~planet_equipment_max
setvar $planet_fighters $planet~planet_fighters
setvar $planet_fighters_max $planet~planet_fighters_max
setvar $citadel $planet~citadel
setvar $citadel_credits $planet~citadel_credits
setvar $atmosphere_cannon $planet~atmosphere_cannon
setvar $sector_cannon $planet~sector_cannon
return
killtrigger citadelstart
killtrigger cannon

return

:attemptrefurb
:attempt_refurb
setvar $limpetcashneeded ((($maxmines - $player~limpets) * $limpet_cost) + $limpet_removal_cost)
setvar $armidcashneeded (($maxmines - $player~armids) * $armid_cost)
setvar $cashneeded ($limpetcashneeded + $armidcashneeded)
setvar $furbing true
if ($cashneeded > $player~credits)
	send "D"
	waiton "Citadel treasury contains "
	getword currentline $citadelcash 4
	striptext $citadelcash ","
	if ($citadelcash < $cashneeded)
		setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
		gosub :switchboard~switchboard
		halt
	end
	send "t f "&($cashneeded - $player~credits)&"* "
end

setvar $i 1
setvar $start_sector $player~current_sector
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

if (($player~alignment < 1000) and ($weareadjdock = false))
	setvar $red_adj 0
	gosub :findjumpsector
	if ($red_adj <> 0)
		setvar $switchboard~message "Jump Sector Found - Using Sector "&$red_adj&"**"
		gosub :switchboard~switchboard
	else
		waitfor "Command [TL="
		setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
		gosub :switchboard~switchboard
		halt
	end
end

if ($player~alignment >= 1000)
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$stardock&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
else
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$red_adj&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
end
settextlinetrigger nojoy :nojoy "*** Error - No route within"
settexttrigger cont :cont "(?="
pause

:nojoy
killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
halt

:cont
killalltriggers
setdelaytrigger latency_delay :latency_delay 500
pause

:latency_delay
echo "**"&ansi_14&"Please Stand By"&ansi_15&" - Calculating Distances...**"
if (($player~alignment >= 1000) or $weareadjdock)
	getdistance $dist1 $start_sector $stardock
else
	getdistance $dist1 $start_sector $red_adj
end

if ($dist1 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Course to Dock**"
	gosub :switchboard~switchboard
	halt
end

getdistance $dist2 $stardock $start_sector
if ($dist2 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Return Course From Dock**"
	gosub :switchboard~switchboard
	halt
end

setvar $ore_req (($dist1 + $dist2) * 3)

if ($player~ore_holds < $ore_req)
	setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
	gosub :switchboard~switchboard
	halt
end

if ($player~twarp_type = "No")
	setvar $switchboard~message "Must Have Twarp 1 or 2**"
	gosub :switchboard~switchboard
	halt
end

if ($unlimitedgame = 0)
	gosub :turnsrequired
	if ($turnsrequired > $player~turns)
		setvar $switchboard~message "Not Enough Turns. "&ansi_12&$turnsrequired&ansi_15&", Required**"
		gosub :switchboard~switchboard
		halt
	elseif ($turnsrequired <= $player~turns)
		setvar $tmp ($player~turns - $turnsrequired)
		if ($tmp <= $bot_turn_limit)
			setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$bot_turn_limit&" Turns!**"
			gosub :switchboard~switchboard
			halt
		end
	end
end

send " C R "&$stardock&"*Q "
settextlinetrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
setvar $switchboard~message $taglineb&" - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
halt

:itsalive
killalltriggers
waitfor "(?="
setvar $msg ""
if (($player~alignment >= 1000) and ($weareadjdock = false))
	setvar $warpto $stardock
	gosub :dotwarp
elseif (($weareadjdock = false) and ($red_adj <> 0))
	setvar $warpto $red_adj
	gosub :dotwarp
else
	send " m "&$stardock&"*  *  P  S G Y G Q "
end
if ($msg = "")
	waitfor "You leave the Galactic Bank."
else
	setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
	gosub :switchboard~switchboard
	halt
end
gosub :player~quikstats

setvar $_limps "Max"
setvar $_mines "Max"
gosub :dopurchases
send "Q Q Q Q Z N M "&$start_sector&"* Y  Y  Y  * L Z"&#8&$planet&"* p  s  s * * c *"
gosub :player~quikstats
if ($player~current_sector = $stardock)
	setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
	gosub :switchboard~switchboard
	halt
end
send "q tnt1* c "

return

:dotwarp
setvar $msg ""
if ($warpto > 0)
	send "q q ** mz"&$warpto " * "
	settexttrigger there :adj_warp "You are already in that sector!"
	settextlinetrigger adj_warp :adj_warp "Sector  : "&$warpto&" "
	setstrigger locking :locking "Do you want to engage the TransWarp drive?"
	settexttrigger igd :twarpigd "An Interdictor Generator in this sector holds you fast!"
	settexttrigger noturns :twarpphotoned "Your ship was hit by a Photon and has been disabled"
	setstrigger noroute :twarpnoroute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
	killalltriggers
	send "z*"
	goto :twarp_adj

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
	settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
	settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
	pause

	:twarpnofuel
	killalltriggers
	setvar $msg "Not enough fuel for T-warp."
	goto :twarpdone

	:twarp_adj
	killalltriggers
	send " * p s"
	goto :twarpdone

	:twarpnoroute
	killalltriggers
	send "n* z* "
	setvar $msg "No route available!"
	goto :twarpdone

	:no_twarp_lock
	killalltriggers
	send "n*zn"
	send "l "&#8&$planet "*c"
	setsectorparameter $warpto "FIGSEC" false
	setvar $temp " "&$warpto&" "
	replacetext $database $temp " "
	subtract $databasecount 1
	goto :select_boomsec

	:twarpigd
	killalltriggers
	setvar $msg "My ship is being held by Interdictor!"
	goto :twarpdone

	:twarpphotoned
	killalltriggers
	setvar $msg "I have been photoned and can not T-warp!"
	goto :twarpdone

	:twarp_lock
	killalltriggers
	if ($player~alignment >= 1000)
		if ($furbing)
			setvar $str "y * * p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	else
		if ($furbing)
			setvar $str "y  *  *  m "&$stardock&" *  *  p s g y g q "
		else
			setvar $str "y * *  "
		end
		send $str
	end

	:twarpdone
	if ($msg <> "")
		setvar $switchboard~message "Twarp Error - "&$msg&"**"
		gosub :switchboard~switchboard
	end
end
return

:bwarp
killalltriggers
send "b" $warpto "*"
settexttrigger go :go5 "TransWarp Locked"
settexttrigger no :no5 "No locating beam found"
gosub :delaytrigger
pause

:no5
killalltriggers
send "n "
waitfor "Transporter shutting down."
setvar $fighter_grid[$warpto] 0
goto :select_boomsec

:go5
killalltriggers
send "y z * "
return

:findjumpsector
setvar $i 1
setvar $red_adj 0
send "qq*"
while (sector.warpsin[$stardock][$i] > 0)
	setvar $red_adj sector.warpsin[$stardock][$i]
	send "m "&$red_adj&"* y"
	setstrigger twarpblind :twarpblind "Do you want to make this jump blind? "
	setstrigger twarplocked :twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided :twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpadj :twarpadj "<Set NavPoint>"
	pause

	:twarpadj
	killalltriggers
	send " * "
	return

	:twarpvoided
	killalltriggers
	send " N N "
	goto :tryingnextadj

	:twarplocked
	killalltriggers
	send " N "

	goto :sectorlocked

	:twarpblind
	killalltriggers
	send " N "

	:tryingnextadj
	add $i 1
end

:noadjsfound
setvar $red_adj 0
return

:sectorlocked
return

:turnsrequired
send "i"
settextlinetrigger turnsrequired_tpw :turnsrequired_tpw "Turns to Warp  : "
pause

:turnsrequired_tpw
killalltriggers
getword currentline $turnsrequired_tpw 5

if ($red_adj > 0)

	setvar $turnsrequired_temp ($turnsrequired_tpw * 3)
	if ($_tow > 0)

		add $turnsrequired_temp 2

		add $turnsrequired_temp 3
	else
		add $turnsrequired_temp 1
	end
else
	setvar $turnsrequired_temp ($turnsrequired_tpw * 2)

	add $turnsrequired_temp 1
end

setvar $turnsrequired $turnsrequired_temp
return

:callsaveme
send "q q q q * '"&$bot_name&" call*"
halt

:dopurchases
send "h "
waitfor "<Hardware Emporium>"

if ($_limps <> "")
	send "L "
	waitfor "How many mines do you want"
	if ($_limps = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $buy $_limps&"* "
	end
	waitfor "<Hardware Emporium>"
end

if ($_mines <> "")
	send "M "
	setvar $buy 0
	waitfor "How many mines do you"
	if ($_mines = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $_mines&"* "
	end
	waitfor "<Hardware Emporium>"
end
return
include "source\include\switchboard.ts"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\help"
