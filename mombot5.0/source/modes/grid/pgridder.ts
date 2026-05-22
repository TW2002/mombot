gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Pgrids automatically until stopped. pgrid {fighterToDrop} "
setvar $help~help[2] $help~tab&"          "
setvar $help~help[3] $help~tab&"Requires corpie running saveme"
setvar $help~help[4] $help~tab&" "
setvar $help~help[5] $help~tab&"   Options:"
setvar $help~help[6] $help~tab&"          {fightersToDrop} - how many figs to drop in sector"
setvar $help~help[6] $help~tab&"                    {near} - moves using near fighter"
gosub :help~helpfile

setvar $switchboard~message "Planet Gridder starting up!*"
gosub :switchboard~switchboard

if ($bot~parm1 > 0)
	setvar $fighterdrop $bot~parm1
else
	setvar $fighterdrop 1
end

getwordpos $bot~user_command_line $pos "near"
if ($pos > 0)
	setvar $near true
else
	setvar $near false
end

gosub :player~quikstats

setvar $location $player~current_prompt
setvar $homesector $player~current_sector
setvar $lastdestination 1

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

setvar $avoided_sectors " "

:getplanetnum
send "qD"
waiton "Planet #"
getword currentline $planet~planet 2
striptext $planet~planet "#"
savevar $planet~planet
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*c "

:inac
if (($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit))
	setvar $switchboard~message "Turns too low to continue.*"
	gosub :switchboard~switchboard
	goto :done
end

:tryagain
setarray $checked sectors
if ($boomsec > 0)
	setvar $checked[$boomsec] true
end
killtrigger again
killtrigger done
setvar $bottom 1
setvar $top 1
if ($near = true)
	gosub :player~quikstats
	setvar $randomsector $player~current_sector
else
	getrnd $randomsector 11 sectors
end
setvar $que[1] $randomsector
setvar $checked[$randomsector] 1
while ($bottom <= $top)
	# Now, pull out the next sector in the que, and make it our focus
	setvar $focus $que[$bottom]
	getsectorparameter $focus "FIGSEC" $isfigged
	setvar $checked[$focus] true
	getwordpos $avoided_sectors $pos " "&$focus&" "
	if (($focus <> $player~current_sector) and ($pos <= 0))
		if ($isfigged <> true)
			setvar $a 1
			while (sector.warps[$focus][$a] > 0)
				setvar $adjacent sector.warps[$focus][$a]
				getsectorparameter $adjacent "FIGSEC" $isfigged
				if (($isfigged = true))
					setvar $travelto $focus
					setvar $nearfig $adjacent
					setvar $checked[$nearfig] true
					goto :continue
				end
				add $a 1
			end
		end
	end
	setvar $nearfig 0
	# That wasn't it, so let's add all the adjacents to the que for future testing.
	setvar $a 1
	while (sector.warps[$focus][$a] > 0)
		setvar $adjacent sector.warps[$focus][$a]
		# But only add them if they haven't been added previously
		if ($adjacent > 0)
			if ($checked[$adjacent] = 0)
				# Okay, this one hasn't been checked, so tag it and que it.
				setvar $checked[$adjacent] 1
				add $top 1
				setvar $que[$top] $adjacent
			end
		end
		add $a 1
	end
	# The adjacents of $focus were all queued, now on to the next one.
	add $bottom 1
end
setvar $switchboard~message "Can't find a route to any other gridding sectors.*"
gosub :switchboard~switchboard
goto :done

:continue
setvar $output ""
if ($nearfig > 0)
	killtrigger warped
	killtrigger same
	killtrigger didnotwarp
	killtrigger notenoughfuel
	send "p"&$nearfig&"*y"
	settextlinetrigger warped :emptyport "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
	settextlinetrigger same :emptyport "You are already in that sector!"
	settextlinetrigger didnotwarp :nofigatlocation "Your own fighters must be in the destination to make a safe jump."
	settextlinetrigger notenoughfuel :done "You do not have enough Fuel Ore on this planet to make the jump."
	pause

	:emptyport
	killtrigger warped
	killtrigger same
	killtrigger didnotwarp
	killtrigger notenoughfuel
	setsectorparameter $nearfig "FIGSEC" true

	send "q q sdsh* l "&$planet~planet&"* m * * * c  "
	waitfor "Relative Density Scan"
	waitfor "Long Range Scan"
	waitfor "[" & $nearfig & "]"
	setvar $boomsec $travelto
	getdistance $distance $nearfig $boomsec
	getdistance $distanceback $boomsec $nearfig
	gosub :player~quikstats
	setvar $containsshieldedplanet false
	setvar $i 1
	while ($i <= sector.planetcount[$boomsec])
		getword sector.planets[$boomsec][$i] $test 1
		if ($test = "<<<<")
			setvar $containsshieldedplanet true
		end
		add $i 1
	end

	setvar $containsshieldedplanetwithus false
	setvar $i 1
	if (sector.planetcount[$player~current_sector] > 1)
		while ($i <= sector.planetcount[$player~current_sector])
			getword sector.planets[$player~current_sector][$i] $test 1
			if ($test = "<<<<")
				setvar $containsshieldedplanetwithus true
			end
			add $i 1
		end
	end

	if ($containsshieldedplanetwithus = true)
		setvar $switchboard~message "There is a shielded planet in sector with us!  Either take it or get out of here!*"
		gosub :switchboard~switchboard
		halt
	end

	setvar $figowner sector.figs.owner[$boomsec]
	setvar $figcount sector.figs.quantity[$boomsec]
	getword $figowner $aliencheck 1
	lowercase $aliencheck
	setvar $mineowner sector.mines.owner[$boomsec]
	setvar $minecount sector.mines.quantity[$boomsec]
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
	elseif ($boomsec <= 10) or ($boomsec = stardock)
		setvar $output "'WARNING - Fed Sector Adj (Sector "&$boomsec&")"&#13
	elseif (sector.figs.quantity[$boomsec] >= ($offodd*2))
		setvar $output "'WARNING - "&sector.figs.quantity[$boomsec]&" figs owned by: "&sector.figs.owner[$boomsec]&" - Sector "&$boomsec&#13
	else
		setvar $output ""
	end

	if (((($avoidshieldedonly = true) and ($containsshieldedplanet = false)) or (sector.planetcount[$boomsec] <= 0)) and (sector.tradercount[$boomsec] <= 0) and ($distance = 1) and ($boomsec > 10) and ($boomsec <> stardock) and ((($attackretreat = true) and ($distanceback = 1) and (sector.figs.quantity[$boomsec] >= ($offodd*2))) or (sector.figs.quantity[$boomsec] < ($offodd*2))))
		if ((sector.anomaly[$boomsec] = true) and ($islimped = false))
			setvar $imlimped true
		end
		if ($figcount <= 10)
			setvar $wave 99
		elseif ($figcount <= 100)
			setvar $wave 999
		elseif ($figcount <= 1000)
			setvar $wave 9999
		else
			setvar $wave $figs
		end
		send "'"&$switchboard~bot_name&" pgrid "&$travelto&" f:"&$fighterdrop&" wave:"&$wave&" scan unsafe*"
		settextlinetrigger done :done "Unsuccessful P-grid into sector " & $travelto & ". Someone make sure bot is picked up."
		settextlinetrigger again :success "Successfully P-gridded into sector " & $travelto
		pause

		:nofigatlocation
		killtrigger warped
		killtrigger same
		killtrigger didnotwarp
		killtrigger notenoughfuel
		setsectorparameter $nearfig "FIGSEC" false
		goto :report

		:success
		killtrigger done
		setsectorparameter $travelto "FIGSEC" true
		goto :report

		:done
		killalltriggers
		setvar $switchboard~message "Planet Gridder halting*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $avoided_sectors $avoided_sectors&" "&$boomsec&" "
	end

	:report
	if ($output <> "")
		send $output
	else
		setvar $boomsec 0
	end
	goto :tryagain
end

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
