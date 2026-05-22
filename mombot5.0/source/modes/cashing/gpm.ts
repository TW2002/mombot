#
# GPM 5.00 by Mayhem Corp
#
# Primary authors: rider and Shadow
#
# CREDITS:
# - Many code snippets from scripts by LoneStar, Cherokee and JheReg
#
# - Initial release (3.08) authored by Rider, LoneStar and Tracker
# - Testing by Mayhem Corp (Shadow, Rider, LoneStar, Tracker, Zip, Zep, Doomed) in ICE 2019
#
# CHANGELOG:
# 4.00	Shadow	Integrated Cherokee's planet neg routine; optimized many functions for speed; replaced
#		lsd with internal function; added routine to mow to backdoor; preference set to twarp
#		to backdoor
#
# 5.00 Shadow  Significant bug fixes
#
#########################################################################################################################
#
# TODO:
#
# explored adjacents for unexplored (done)
# Store MCICs
# New navigation routine: if no port, find nearest unexplored and warp/mow there
# Scan planets
# Minimum cash at dock
# rcvcash script & dock cash transfer
# selloff existing planets when entering sector
# don't try to move into avoided sectors
# reset avoids after clearing them (dock/backdoor code)
# auto ship buy
# communication with other traders - figs, traded ports, MCIC
# receiver script for comms, etc -- also add to chaser to receive fig data

setvar $version "5.00"
setvar $tagline "Mayhem Corp GPM " & $version

#setvar $DEBUG TRUE
setvar $debug false

gosub :loadvars~loadvars
loadvar $player~unlimitedgame

gosub :help~initialize

loadvar $map~stardock
loadvar $map~home_sector
loadvar $ship~cap_file
loadvar $planet~planet_file
loadvar $game~port_max

setvar $help~help[1]  $help~tab&"GPM (GoPop Moo) version 5.0 for TWX Proxy 3.0"
setvar $help~help[2]  $help~tab&"Designed by Rider for Mayhem Corp in ICE 2019"
setvar $help~help[3]  $help~tab&"Authors: Rider, Shadow and LoneStar    "
setvar $help~help[4]  $help~tab&"    "
setvar $help~help[5]  $help~tab&"Walks the universe, creates (pops) planets and sells off product for cash.  "
setvar $help~help[6]  $help~tab&"    "
setvar $help~help[7]  $help~tab&"Options: "
setvar $help~help[8]  $help~tab&"         {corp} - Pop corporate planets instead of personal"
setvar $help~help[9]  $help~tab&"      {skipore} - Doesn't keep popping planets until ore is gone"
setvar $help~help[10] $help~tab&"      {skiporg} - Doesn't keep popping planets until organics are gone"
setvar $help~help[11] $help~tab&"      {skipequ} - Doesn't keep popping planets until equipment is gone"
setvar $help~help[12] $help~tab&"        {upequ} - Upgrade equipment port if MCIC is good"
setvar $help~help[13] $help~tab&"        {probe} - Buy and use ether probes to find ports while cashing"
setvar $help~help[14] $help~tab&"     {noaliens} - Avoid sectors with aliens in them"
setvar $help~help[15] $help~tab&"      {buyfigs} - Buy fighters at dock if we have extra cash after furbing"
setvar $help~help[16] $help~tab&"   {buyshields} - Buy shields at dock if we have extra cash after furbing"
setvar $help~help[17] $help~tab&"    {twarponly} - Only use twarp to move, don't move to adjacent sectors"
setvar $help~help[18] $help~tab&"       {window} - Open status window for dashboard summary"
gosub :help~helpfile

#gosub :combat~init
#for auto kill on surround
#setvar $grid~kill true

setvar $switchboard~message $tagline & " starting with " & $player~turns & " turns.*"
gosub :switchboard~switchboard

getsectorparameter sectors "FIGSEC" $isfigged
if ($map~stardock = 0)
	if (stardock > 0)
		setvar $map~stardock stardock
		savevar $map~stardock
	else
		setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

#if ($isFigged = 0)
#	setVar $SWITCHBOARD~message "It appears no grid data is available.  Run >figs and restart"
#	gosub :SWITCHBOARD~switchboard
#	goto :gpm_shutdown
#end

gosub :player~quikstats
setvar $startinglocation $player~current_prompt

getwordpos $bot~user_command_line $pos "corp"
if ($pos > 0)
	setvar $gopop_planettype "Corp"
	setvar $plantype "c"
else
	setvar $gopop_planettype "Pers"
	setvar $plantype "p"
end

getwordpos $bot~user_command_line $pos "skipore"
if ($pos > 0)
	setvar $gopop_sellore "no"
	setvar $sell_ore 0
else
	setvar $gopop_sellore "yes"
	setvar $sell_ore 1
end

getwordpos $bot~user_command_line $pos "skiporg"
if ($pos > 0)
	setvar $gopop_sellorg "no"
	setvar $sell_org 0
else
	setvar $gopop_sellorg "yes"
	setvar $sell_org 1
end

getwordpos $bot~user_command_line $pos "skipequ"
if ($pos > 0)
	setvar $gopop_sellequ "no"
	setvar $sell_equ 0
else
	setvar $gopop_sellequ "yes"
	setvar $sell_equ 1
end

getwordpos $bot~user_command_line $pos "upequ"
if ($pos > 0)
	setvar $gopop_upgradeequ "yes"
	setvar $gopop_upgrademcic "-55"
else
	setvar $gopop_upgradeequ "no"
end

getwordpos $bot~user_command_line $pos "probe"
if ($pos > 0)
	setvar $gopop_useprobes "yes"
else
	setvar $gopop_useprobes "no"
end

getwordpos $bot~user_command_line $pos "noaliens"
if ($pos > 0)
	setvar $gopop_avoidaliens "yes"
else
	setvar $gopop_avoidaliens "no"
end

getwordpos $bot~user_command_line $pos "window"
if ($pos > 0)
	setvar $gopop_monitor "yes"
	setvar $window true
else
	setvar $gopop_monitor "no"
	setvar $window false
end

getwordpos $bot~user_command_line $pos "buyfigs"
if ($pos > 0)
	setvar $gopop_buyfigs true
else
	setvar $gopop_buyfigs false
end

getwordpos $bot~user_command_line $pos "buyshields"
if ($pos > 0)
	setvar $gopop_buyshields true
else
	setvar $gopop_buyshields false
end

setvar $navmode 1
getwordpos $bot~user_command_line $pos "explore"
if ($pos > 0)
	setvar $navmode 2
end
getwordpos $bot~user_command_line $pos "twarponly"
if ($pos > 0)
	setvar $navmode 3
end

if ($player~photons > 0)
	setvar $switchboard~message "Please pick a ship with no photons*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
end

if ($window = true)
	window status 500 275 $tagline & " [" & gamename & "]"  ontop
	gosub :updatemonitor
end

gosub :setup
gosub :ship~getshipstats

setvar $lastwarp $player~current_sector
setvar $thiswarp $lastwarp

:main
gosub :player~quikstats

if (($player~unlimitedgame = false) and ($player~turns <= ($bot~bot_turn_limit + 20)))
	setvar $switchboard~message "Out of turns, halting!*"
	gosub :switchboard~switchboard
	goto :wrapup
end

if ($player~credits > 900000000)
	setvar $switchboard~message "I have too much cash on hand, exiting.*"
	gosub :switchboard~switchboard
	goto :wrapup
end

if ($player~genesis = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :player~quikstats

	if ($player~genesis = 0)
		setvar $switchboard~message "Unable to furb! Halting.*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

if (($navmode = 1) or ($navmode = 2))
	# scan adjacent sectors
	gosub :scan

	# Probe unexplored sectors for more data
	if ($gopop_alwaysprobe = "yes") and ($player~eprobes > 0)
		if ($debug = true)
			echo "Probe them bitches*"
		end

		setvar $probemove 0
		gosub :tryprobes
	end

	if ($debug = true)
		echo "Best weight adjacent for sector " $thiswarp " = " $warp[$bestwarp] " (" $weight[$bestwarp] ")*"
	end

	if ($bestport > 0)
		if ($debug = true)
			echo "Best port for sector " $thiswarp " = " $warp[$bestport] " (" $portvalue[$warp[$bestport]] ")*"
			echo "Choosing best port over best warp*"
		end
		setvar $nextsec 0
		setvar $msec $warp[$bestport]
		goto :movetoadj
	end
end

# in explore mode, skip the twarp stuff
if ($navmode = 2)
	goto :nav2
end

# If we don't have an adjacent port, see if we have a good twarpable port

if ($player~twarp_type <> "No")
	if ($debug = true)
		echo "No good adjacent ports for " $thiswarp ", checking for good twarpable ports*"
	end

	gosub :trywarpport
	if ($warpgood = 1)
		if ($debug = true)
			echo "Succesfully twarped to port " $port "*"
		end

		setvar $lastwarp $thiswarp
		setvar $thiswarp $port
		goto :dothissector
	end
end

# See if we have a twarpable adjacent to a good port

if ($player~twarp_type <> "No")
	if ($debug = true)
		echo "Checking for twarpable sectors adjacent to good ports*"
	end

	gosub :tryadjwarp
	if ($warpgood = 1)
		setvar $lastwarp $thiswarp
		goto :main
	end
end

# Everything below here for 'move' mode only

if ($navmode > 2)
	setvar $switchboard~message "No more warps found, halting.*"
	gosub :switchboard~switchboard
	goto :wrapup
end

:nav2
# Probe unexplored sectors for more data

if ($gopop_useprobes = "yes") and ($player~eprobes > 0)
	if ($debug = true)
		echo "Probe them bitches*"
	end

	setvar $probemove 1
	gosub :tryprobes

	if ($nextsec > 0)
		goto :movetoadj
	end
end

# If no ports, and our best warp is explored, see if we can twarp somewhere unexplored

#if (SECTOR.EXPLORED($warp[$bestWarp]) = "YES") and ($PLAYER~TWARP_TYPE <> "No")
#	if ($debug = TRUE)
#		echo "No good twarp ports found, checking for nearest unexplored twarp*"
#	end
#
#	gosub :findunexwarp
#	if ($bestadj > 0)
#		setvar $lastWarp $thisWarp
#		setvar $thisWarp $port
#		goto :dothissector
#	end
#end

# Let's move toward the nearest unexplored, if possible
#if ($explored[$bestWarp] = 1)
#	if ($debug = TRUE)
#		echo "No good twarp ports found, checking for nearest unexplored sector*"
#	end
#
#	gosub :findunexplored
#
#	if ($bestadj > 0)
#		setvar $msec $adjnext
#		goto :movetoadj
#	end
#end

# No good ports, explored adjacents, nowhere to twarp. Let's hope for the best!

if ($weight[$bestwarp] > 999)
	clientmessage "Script walled in!  Halted."
	goto :gpm_shutdown
else
	setvar $msec $warp[$bestwarp]
end

#if ($debug = TRUE)
#	echo "Moving to best adjacent sector " $warp[$bestWarp] " (weight " $weight[$bestWarp] ")*"
#end

# lets move
:movetoadj
add $movesinceport 1

if ($navmode = 2)
	setvar $maxmoves 40
else
	setvar $maxmoves 20
end

if ($nextsec > 0)
	#echo "nextsec " $nextsec " destsec " $destsec "*"
	setvar $msec $nextsec
	if ($nextsec = $destsec)
		setvar $nextsec 0
		setvar $msec $destsec
	else
		add $coursenum 1
		setvar $nextsec $course[$coursenum]
	end
	getdistance $dist $player~current_sector $msec
	if ($dist > 1)
		setvar $nextsec 0
		setvar $msec 0
		goto :main
	end
end

if ($movesinceport = $maxmoves)
	echo "**WARNING: Failed to port after " $maxmoves " moves, I am probably stuck!  Halting.*"
	goto :gpm_shutdown
end

if ($gopop_disrmines = "yes") and (sector.mines.quantity[$msec] > 0) and (sector.mines.owner[$msec] <> "yours") and (sector.mines.owner[$msec] <> "belong to your Corp") and ($player~mine_disruptors >= 3)
	setvar $mines~target $msec
	setvar $mines~scanit false
	gosub :mines~disrupt
end

getdistance $dist $player~current_sector $msec
if ($dist < 1)
	goto :main
	#halt
end

gosub :trymove
if ($movegood = 0)
	setvar $switchboard~message "Failed to move to sector, something bad happened!*"
	gosub :switchboard~switchboard
	setvar $blocked[$msec] 1
	setvar $nextsec 0
	goto :main
else
	subtract $turncount ($tpw * 1)
	setvar $lastwarp $thiswarp
	setvar $player~current_sector $msec
	setvar $thiswarp $msec
	add $visits[$msec] 1
end

if ($nextsec > 0)
	goto :main
end

# we got here, either by twarp or move, let's try to sell it off
:dothissector
setvar $sector $thiswarp
setvar $port $thiswarp

# added by shadow - avoid unnecessary refigs
if ($figs[$thiswarp] < 1) and ($thiswarp > 10) and ($thiswarp <> $map~stardock)

	if ($player~fighters > 1)
		if (($gopop_dropfigs * 10) < $player~fighters)
			setvar $figstodrop $gopop_dropfigs
		elseif ($player~fighters > 20)
			setvar $figstodrop 1
		else
			setvar $figstodrop 0
		end
	end
	send "fz" & $figstodrop & "*cqd *"
	#waitfor "<Re-Display>"
	waitfor "Command [TL="
end
setvar $figs[$thiswarp] 1
setsectorparameter $thiswarp "FIGSEC" 1

gosub :minesector

if (port.exists[$thiswarp] = 0) or ($thiswarp < 11) or ($thiswarp = $map~stardock) or (port.class[$thiswarp] = 0)
	if ($debug = true)
		echo "No port in sector, looking for new warps.*"
	end
	goto :main
end

if ($portvalue[$thiswarp] < 1)
	setvar $port $thiswarp
	gosub :getportinfo
	gosub :setportval
	if ($debug = true)
		echo "*SECTOR " $thiswarp " SCANNED PORT, value = " $portvalue[$thiswarp] "*"
	end
end

if ($debug = true)
	echo "Found port in sector, value = " $portvalue[$thiswarp] "*"
end

# added by Shadow - make sure we gain align
if ($player~alignment = 0) and ($player~credits > 25000)
	killalltriggers
	send "o1"
	waiton "Upgrade Starport"
	send "20*q"
	waiton "Command [TL"
	setvar $player~alignment 1
end

if ($gopop_sellallexisting = "yes") and (sector.planetcount[$port] > 0)
	gosub :selloff_planets
	add $portscashed 1
	setvar $movesinceport 0
end

# we have a port, run dopop
if ($portvalue[$thiswarp] > $min_portval)
	setvar $movesinceport 0
	gosub :dopop
	#setarray $visits SECTORS
	add $portscashed 1
end

add $pcount 1
gosub :stats
gosub :updatemonitor
goto :main

:wrapup
gosub :stats
setvar $infostr $infostr & "*'Explored " & $exploredsectors & " sectors and upgraded " & $upgradedports & " ports.*"
setvar $switchboard~message "Cashed " & $infostr
gosub :switchboard~switchboard

:end
goto :gpm_shutdown

:gpm_shutdown
killalltriggers
setvar $bot~mode "General"
savevar $bot~mode
halt

#########################################################################################################################
:scan
# clear all the old warp info
setvar $i 0
while ($i < 6)
	add $i 1
	setvar $warp[$i] 0
	setvar $warpcount[$i] 0
	setvar $density[$i] "-1"
	setvar $weight[$i] 9999
	setvar $anom[$i] "No"
	#setVar $explored[$i] 1
end

# scan this sector
#setvar $line CURRENTLINE
#gettext $line $sector ":[" "]"

send "s"
if ($player~scan_type = "Holo")
	send "d"
end

waitfor "Relative Density Scan"

# now we retrieve new warp info
setvar $i 1
settextlinetrigger 1 :getwarp "Sector "
settexttrigger 2 :gotwarps "Command [TL="
pause

:getwarp
setvar $line currentline
striptext $line "("
getword $line $warp 2
getword $line $density 4
getword $line $warpcount 7
getword $line $anom 13
getlength $warp $length

cuttext $warp $explored $length 1
if ($explored = ")")
	setvar $exploredsec 0
else
	setvar $exploredsec 1
end

striptext $warp ")"
striptext $density ","

setvar $warp[$i] $warp
setvar $density[$i] $density
setvar $warpcount[$i] $warpcount
setvar $anom[$i] $anom
#setVar $explored[$i] $explored

add $i 1
settextlinetrigger 1 :getwarp "Sector "
pause

:gotwarps
killtrigger 1
killtrigger 2

# ok - now that we've got all our warp info, we need to use a weighting system with the sectors
# to determine which would be the best to warp into

setvar $i 1
setvar $bestwarp 1
setvar $bestport 0
setvar $bestportval 0
setvar $holo 0
setvar $incomputer 0
setvar $enemyfig 0
getdistance $currentdockdist $map~stardock $player~current_sector

while ($warp[$i] > 0)
	setvar $weight[$i] 0
	setvar $sector $warp[$i]
	setvar $port $warp[$i]

	getdistance $dist $map~stardock $warp[$i]
	if ($warp[$i] = $map~stardock) or ($warp[$i] = $map~backdoor)
		if ($debug = true)
			echo "S" $sector ": too close to stardock, avoiding*"
		end
		setvar $weight[$i] 1000
	elseif (($player~current_sector <> $map~stardock) and ($player~current_sector <> $map~backdoor)) and (($dist = 1) or ($dist = 2))
		# If we're already sitting on Dock's outer ring, allow moves that increase
		# our distance from Dock instead of falsely treating the sector as walled in.
		if ($currentdockdist = "-1") or ($currentdockdist > 2) or ($dist <= $currentdockdist)
			if ($debug = true)
				echo "S" $sector ": too close to stardock, avoiding*"
			end
			setvar $weight[$i] 1000
		end
	end

	if ($visits[$sector] = 5)
		if ($debug = true)
			echo "S" $sector ": visited 5 previous times (+100)*"
		end
		add $weight[$i] 100
		goto :nextwarp
	end

	if ($blocked[$sector] = 1)
		if ($debug = true)
			echo "S" $sector ": marked as blocked previously, avoiding*"
		end
		add $weight[$i] 1000
		goto :nextwarp
	end

	# Avoid fedspace and dock
	if ($sector < 11) or ($sector = $map~stardock) or ($sector = $map~alphacentauri) or ($sector = $map~rylos)
		if ($debug = true)
			echo "S" $sector ": sector is in fedspace or special port, avoiding*"
		end
		add $weight[$i] 1000
		goto :nextwarp
	end

	if ($density[$i] = 0)
		# We really want ports, not empty sectors.
		add $weight[$i] 5
		if ($debug = true)
			echo "S" $sector ": density of 0, skipping port checks*"
		end
		goto :endportcheck
	elseif ($player~scan_type <> "Holo")
		# If we have no holo scanner, only go to sectors with density 100 or where we have figs.
		if ($density[$i] <> 100) and ($figs[$i] = 0)
			if ($debug = true)
				echo "S" $sector ": density > 0 and not 100, avoiding*"
			end
			add $weight[$i] 1000
			goto :nextwarp
		end
	else
		# We have a holo scanner, let's use it.
		if ($holo = 0)
			gosub :tryholo
			setvar $holo 1
			setvar $explored[$i] 1
			add $exploredsectors 1
			if ($gopop_avoidaliens = "yes")
				if ($holoaliens > 0)
					setvar $a 0
					while ($a < $holoaliens)
						add $a 1
						if ($debug = true)
							echo "S" $holo_aliensect[$a] ": alien traders present, avoiding*"
						end
						add $weight[$holo_aliensect[$a]] 1000
					end
				end
			end
		end

		# avoid enemy fighters
		if (sector.figs.quantity[$sector] <> 0)
			if (sector.figs.owner[$sector] <> "yours") and (sector.figs.owner[$sector] <> "belong to your Corp")
				if (sector.figs.quantity[$sector] > $max_enemy_figs) or ($player~fighters < (sector.figs.quantity[$sector] * 2))
					if ($debug = true)
						echo "S" $sector ": enemy figs present, avoiding*"
					end
					add $weight[$i] 1000
					goto :nextwarp
				else
					if ($debug = true)
						echo "S" $sector ": enemy figs present (+3)*"
					end
					add $weight[$i] 3
				end
			else
				# prefer unfigged sectors
				#if ($debug = TRUE)
				#	echo "S" $sector ": our figs present, probably visited (+5)*"
				#end
				#add $weight[$i] 5
			end
		end

		# avoid navhaz above limit
		if (sector.navhaz[$sector] > $gopop_maxhaz)
			if ($debug = true)
				echo "S" $sector ": navhaz over limit, avoiding*"
			end
			add $weight[$i] 1000
			goto :nextwarp
		end

		# avoid enemy limps
		if ($gopop_avoidlimps = "yes")
			if (sector.limpets.quantity[$sector] > 0) and (sector.limpets.owner[$sector] <> "yours") and (sector.limpets.owner[$sector] <> "belong to your Corp")
				if ($debug = true)
					echo "S" $sector ": enemy limpets present, avoiding*"
				end
				add $weight[$i] 1000
				goto :nextwarp
			end
		end

		# avoid enemy mines
		if ($gopop_avoidmines = "yes")
			if (sector.mines.quantity[$sector] > 0) and (sector.mines.owner[$sector] <> "yours") and (sector.mines.owner[$sector] <> "belong to your Corp")
				if ($debug = true)
					echo "S" $sector ": enemy mines present, avoiding*"
				end
				add $weight[$i] 1000
				goto :nextwarp
			end
		end

		# avoid traders
		if (sector.tradercount[$sector] > 0)
			if ($debug = true)
				echo "S" $sector ": traders in sector, avoiding*"
			end
			add $weight[$i] 1000
			goto :nextwarp
		end
	end

	# port check
	if (port.exists[$sector])
		setvar $port $sector
		gosub :checkportclass

		# Avoid class 0s (but tell my corpies about them)

		if ($pclass = 0)
			send "'GPM CLASS 0 " $port.name[$port] " SECTOR " $port "*"
			add $weight[$i] 1000
			goto :nextwarp
		end

		if ($goodport = 0)
			if ($debug = true)
				echo "S" $sector ": undesirable port class (+5)*"
			end
			add $weight[$i] 5
			goto :endportcheck
		else
			if ($portscore > 20)
				if ($debug = true)
					echo "S" $sector ": good port class (-" $portscore ")*"
				end
				subtract $weight[$i] $portscore
			end
		end

		if (sector.explored[$sector] = "YES")
			# calculate port value
			if ($portvalue[$sector] < 1)
				if (sector.figs.quantity[$sector] <> 0) and (sector.figs.owner[$sector] <> "yours") and (sector.figs.owner[$sector] <> "belong to your Corp")
					goto :endportcheck
				else
					if ($incomputer = 0)
						send "c"
						setvar $incomputer 1
					end
					setvar $port $sector
					gosub :getrportinfo
					gosub :setportval
				end
			end

			#echo "portval " $portvalue[$sector] " min_portval " $min_portval " bestportval " $bestportval "*"
			# check for high value port
			if ($portvalue[$sector] > 0) and ($portvalue[$sector] > $min_portval)
				if ($portvalue[$sector] > $bestportval)
					if ($debug = true)
						echo "S" $sector ": new best portval = " $portvalue[$sector] "*"
					end
					setvar $bestportval $portvalue[$sector]
					setvar $bestport $i
				else
					# avoid low value ports
					if ($debug = true)
						echo "S" $sector ": low value port, possibly already cashed (+5)*"
					end
					add $weight[$i] 5
				end
			end
		end
	else
		# reduce the value of sectors with no port
		if ($debug = true)
			echo "S" $sector ": no port in sector (+10)*"
		end
		add $weight[$i] 10
	end

	:endportcheck
	# weigh sectors with multiple explored adjacents, and unexplored adjacents lower
	setvar $warp_cnt 0

	if ($navmode = 2)
		setvar $expfactor 5
	else
		setvar $expfactor 3
	end

	if ($exploredsec = 1)
		setvar $escore ($expfactor * 5)
		setvar $exp_score $escore
		add $exp_score $escore
	end

	# high amount of warps = higher chance of us going there!
	setvar $warpscore 0
	if ($warpcount[$i] > 2)
		setvar $warpscore ($warpcount[$i] * 3)
	end
	subtract $exp_score $warpscore
	if ($debug = true)
		echo "S" $sector ": sector has " $warpcount[$i] " warps (-" $warpscore ")*"
	end

	while ($warp_cnt < sector.warpcount[$sector])
		add $warp_cnt 1
		setvar $nwarp sector.warps[$sector][$warp_cnt]
		if (sector.explored[$nwarp] <> "YES")
			setvar $escore 2
			multiply $escore $expfactor
			subtract $exp_score $escore
		end
	end

	if ($visits[$sector] > 0)
		setvar $visitscore $visits[$sector]
		multiply $visitscore 5
		add $exp_score $visitscore
	end

	add $weight[$i] $exp_score

	if ($debug = true)
		echo "S" $sector ": exploration weight = " $exp_score "*"
	end

	if ($sector = $lastwarp)
		# avoid going backwards, unless dead end
		if (sector.warpcount[$lastwarp] > 1)
			add $weight[$i] 100
			if ($debug = true)
				echo "S" $sector ": previously entered sector (+100)*"
			end
		end
	end

	# avoid dead ends
	if ($warpcount[$i] = 1)
		if ($debug = true)
			echo "S" $sector ": dead end (+5)*"
		end
		add $weight[$i] 25
	end

	# make sure we have some random in there to stop it from
	# getting stuck
	getrnd $rand 1 5
	add $weight[$i] $rand

	if ($port > 0)
		if ($portvalue[$port] > 1) and ($debug = true)
			echo "S" $sector ": port value = " $portvalue[$port] "*"
		end
	end

	# Show decisions
	if ($debug = true)
		echo "S" $sector ": final weight = " $weight[$i] "*"
	end

	# find the best warp
	if ($weight[$i] < $weight[$bestwarp])
		if ($debug = true)
			echo "S" $sector ": new lowest weight warp!*"
		end
		setvar $bestwarp $i
	end

	:nextwarp
	add $i 1
end

if ($incomputer = 1)
	send "q"
	setvar $incomputer 0
end

return

##################################################################################################################################
:selloff_planets
gosub :getportinfo
setvar $selloff_count 0

send "L"

:selloff_loop
killalltriggers
settexttrigger  	selloff_landed  :selloff_landed "Landing sequence engaged..."
settexttrigger		selloff_pdone	:selloff_pdone	"Land on which planet"
settexttrigger		selloff_pdone2	:selloff_none	"There isn't a planet in this sector"
settextlinetrigger	selloff_planet	:selloff_planet	"   <"
pause

:selloff_none
killalltriggers
return

:selloff_planet
killalltriggers
setvar $temp currentline
gettext $temp $planet "<" ">"
striptext $planet " "
getwordpos $temp $pos ">"
cuttext $temp $pinfo ($pos + 2) 999
getwordpos $pinfo $plvl "        None"
if ($plvl > 0)
	add $selloff_count 1
	setvar $selloff_list[$selloff_count] $planet
end
goto :selloff_loop

:selloff_landed
killalltriggers
waiton "Planet #"
getword currentline $planet 2
striptext $planet "#"
add $selloff_count 1
setvar $selloff_list[$selloff_count] $planet

:selloff_pdone
killalltriggers
send "Q*"

if ($selloff_count < 1)
	return
end

if ($debug = true)
	echo "selloff_count: " $selloff_count "*"
end

setvar $i 0
while ($i < $selloff_count)
	add $i 1
	setvar $planet $selloff_list[$i]
	send "l " $planet "*"
	waiton "Created by"
	gosub :getplaninfo
	setvar $pmacro ""
	if ($claimedby <> $my_name)
		setvar $pmacro "  O  P"
	end
	if ($holds_ore < $holds_total) and ($fueltosell > 50)
		setvar $pmacro "  T  N  T  1  *  "
	end
	setvar $pmacro $pmacro & "q"
	#send "o p t n t 1* q"
	send $pmacro
	waiton "Command [TL"

	if ($debug = true)
		echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
		echo "orebuying " $buysell[fuel] " oretrading " $portqty[fuel] "*"
		echo "orgbuying " $buysell[organics] " orgtrading " $portqty[organics] "*"
		echo "equbuying " $buysell[equipment] " equtrading " $portqty[equipment] "*"
	end

	if ($sell_ore <> 1) or ($buysell[fuel] <> "BUYING") or ($percent[fuel] < 15)
		setvar $fueltosell 0
	end

	if ($sell_org <> 1) or ($buysell[organics] <> "BUYING") or ($percent[organics] < 15)
		setvar $orgtosell 0
	end

	if ($sell_equ <> 1) or ($buysell[equipment] <> "BUYING") or ($percent[equipment] < 15)
		setvar $equiptosell 0
	end

	if ($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0)
		if ($debug = true)
			echo "Nothing to sell on planet " $planet ", skipping*"
			return
		end
	end

	if ($fueltosell > 0) or ($orgtosell > 0) or ($equiptosell > 0)
		if ($debug = true)
			echo "Attempting to negotiate planet " $planet "*"
		end
		gosub :planetneg
		if ($neg_success = 1)
			gosub :getportinfo
			gosub :setpostportval
		end
	end
end

#add $portscashed 1
#gosub :stats
#gosub :updatemonitor

return

##################################################################################################################################
:findunexwarp
# if twarp, find fig adj to unexplored
setvar $i 11
setvar $neartwarp 0
getnearestwarps $nearfig $thiswarp

while ($i < $nearfig)
	add $i 1
	if ($figs[$i] > 0) and ($distance[$i] < $gopop_maxtwarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpincount[$i])
			add $warp_cnt 1
			setvar $figadj sector.warps[$i][$warp_cnt]
			if (sector.explored[$figadj] = "NO") and ($blocked[$figadj] < 1)
				setvar $warpto $i
				getdistance $dist $thiswarp $warpto
				setvar $oreneeded ($dist * 3)
				if ($player~ore_holds > $oreneeded)
					setvar $player~warpto $warpto
					gosub :move~twarp
					if ($player~twarpsuccess = true)
						setvar $thiswarp $i
						goto :main
						#else
						setvar $figs[$figadj] 0
					end
				end
			end
		end
	end
end
return

##################################################################################################################################
:checkportclass
# class 1 BBS	class 2 BSB	class 3 SBB	class 4 SSB
# class 5 SBS	class 6 BSS	class 7 SSS	class 8 BBB

setvar $goodport 0
setvar $portscore 0
setvar $pclass port.class[$port]

setvar $equ $gopop_equvalue
setvar $org $gopop_orgvalue
setvar $ore $gopop_orevalue

if ($sell_equ = 1)
	if ($pclass = 2) or ($pclass = 3) or ($pclass = 4) or ($pclass = 8)
		add $portscore $equ
	end
end

if ($sell_org = 1)
	if ($pclass = 1) or ($pclass = 3) or ($pclass = 5) or ($pclass = 8)
		add $portscore $org
	end
end

if ($sell_ore = 1)
	if ($pclass = 1) or ($pclass = 2) or ($pclass = 6) or ($pclass = 8)
		add $portscore $ore
	end
end

if ($portscore > 1)
	setvar $goodport 1
end

divide $portscore 10
return

##################################################################################################################################
:tryholo
#Sector  : 13893 in Triskelion Spur.
#Beacon  : foo
#Planets : (M) .
#          (K) .
#Federals: Fleet Admiral Clausewitz, w/ 50,000 ftrs,
#           in The U.S.S. Valiant (Martin Ind Federation StarShip)
#Jem'Hada: Smuggler 2nd Class Gogu Jueceth, w/ 1,875 ftrs,
#           in Oshaev Wushoshat (Martel Matra Merchant Cruiser)
#Traders : Civilian rider, w/ 399,990 ftrs,
#           in poof (Dominion Shipyards Attack Ship)
#Fighters: 1 (belong to your Corp) [Defensive]
#Mines   : 3 (Type 1 Armid) (belong to your Corp)
#        : 3 (Type 2 Limpet) (belong to your Corp)
#Warps to Sector(s) :  951 - 1530 - 1987 - 3550 - 8202 - 9986

killalltriggers
setvar $hologood 0
setvar $holoaliens 0
setarray $holo_aliensect 6
setvar $holo_enemies 0

settextlinetrigger holo_none		:holo_fail	"You don't have a long range scanner."
settextlinetrigger holo_dens		:holo_fail	"Relative Density Scan"
settexttrigger holo_good		:holo_good	"Select (H)olo Scan"
send "s"
pause

:holo_fail
killalltriggers
waiton "Command [TL"
return

:holo_good
setvar $hologood 1
setvar $holo_first 0
send "h"

:holo_newsect
setvar $holo_aliens_this 0
killalltriggers

:holo_sectloop
settextlinetrigger holo_sector		:holo_sector 	"Sector  :"
settextlinetrigger holo_beacon 		:holo_beacon	"Beacon  :"
settextlinetrigger holo_ports 		:holo_ports 	"Ports   :"
settextlinetrigger holo_planets	 	:holo_planets 	"Planets :"
settextlinetrigger holo_traders		:holo_traders	"Traders :"
settextlinetrigger holo_ships 		:holo_ships 	"Ships   :"
settextlinetrigger holo_fighters	:holo_fighters 	"Fighters: "
settextlinetrigger holo_mines		:holo_mines	"Mines   :"
settextlinetrigger holo_navhaz 		:holo_navhaz	"NavHaz  :"
settexttrigger holo_warps 		:holo_done	"Warps to Sector(s) : "
settexttrigger holo_command 		:holo_done	"Command [TL"
settexttrigger holo_aliens 		:holo_aliens	": "
pause

:holo_sector
getword currentline $holo_sect 3
if ($holo_first = 0)
	setvar $holo_first 1
	settextlinetrigger holo_sector	:holo_sector "Sector  :"
	pause
else
	killalltriggers
	goto :holo_newsect
end

:holo_beacon
:holo_ports
setvar $temp currentline
replacetext $temp "," " "
getword currentline $holo_portname 3
pause

:holo_planets
pause

:holo_traders
killalltriggers
if ($holo_sect <> $player~current_sector)
	setvar $temp currentline
	getwordpos $temp $pos " : "
	if ($pos > 1)
		cuttext $temp $temp ($pos + 3) 999
		gosub :holo_gottrader
	end
	settexttrigger inship :inship "           in "
	settexttrigger newtrader :newtrader "          "
	settexttrigger endtraders  :endtraders ": "
	pause

	:newtrader
	setvar $temp currentline
	striptext $temp "          "
	gosub :holo_gottrader
	settexttrigger newtrader :newtrader "          "
	pause

	:inship
	settexttrigger inship :inship "           in "
	pause

	:endtraders
	killalltriggers
end
goto :holo_sectloop

:holo_ships
:holo_fighters
:holo_mines
:holo_navhaz
:holo_warps
pause

:holo_aliens
#if ($holo_aliens_this = 0)
#	setvar $holo_aliens_this 1
#	add $holoaliens 1
#	setvar $holo_aliensect[$holoaliens] $holo_sect
#end
pause

:holo_gottrader
gettext $temp $holo_corp " [" "], w"
isnumber $tn $holo_corp
if ($tn)
	if ($holo_corp <> $corp_num)
		setvar $holo_enemies 1
		goto :holo_foundenemy
		return
	else
		echo "Corpie adjacent to sector*"
		setvar $holo_corpies 1
		return
	end
end

:holo_foundenemy
getwordpos $temp $pos ", w/"
if ($pos > 2)
	cuttext $temp $temp 1 ($pos - 1)
end
send "'Enemy traders in sector " $holo_sect ": " $temp "*"
setvar $holo_enemies 1
return

:holo_done
killalltriggers
if ($holo_enemies = 1) and ($holo_corpies = 0)
	if ($gopop_foton = "yes") and ($player~photons > 0) and ($holo_sect <> $map~stardock) and ($holo_sect > 10)
		send "c p y " $holo_sect "* q"
		subtract $player~photons 1
		send "'Fired photon at enemy in sector " $holo_sect ": " $temp "*"
	end
end
return

##################################################################################################################################
:findunexplored
setvar $adjdist 0
setvar $adjwarps 0
setvar $bestadj 0
setvar $adjnext 0

setvar $i 11
while ($i < sectors)
	add $i 1
	setvar $dist $courses[$i]
	if ($dist > $adjdist)
		return
	end

	if ($blocked[$i] < 1) and ($i <> $lastwarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpcount[$i])
			add $warp_cnt 1
			setvar $test sector.warps[$i][$warp_cnt]
			if ($sector.explored[$test] <> "YES") and ($blocked[$test] < 1)
				add $testwarps 1
			end
		end
		if ($testwarps < $adjwarps)
			setvar $bestadj $i
			setvar $adjdist $dist
			setvar $adjwarps $testwarps
			setvar $adjnext $courses[$i][2]
		end
	end
end

if ($debug = true)
	echo "Found sector " $bestadj " with " $adjwarps " warps " $dist " hops away.*"
end

return

##################################################################################################################################
:trywarpport
#gosub :PLAYER~QUIKSTATS
#waiton "Command [TL"

setvar $warpgood 0
setvar $tries 0

getallcourses $courses $thiswarp
setvar $range ($player~ore_holds / 3)

:wp_findportloop
setvar $bestport 0
setvar $bestportval 0
setvar $exp_score 0
add $tries 1
if ($tries > 5)
	setvar $warpgood 0
	return
end

# hunt for upgraded ports first

if ($debug = true)
	echo "Attempting to locate upgraded ports in twarp range*"
end
setvar $i 11
while ($i < sectors)
	add $i 1
	setvar $dist $courses[$i]
	setvar $port $i

	if ($figs[$i] > 0) and ($upgraded[$i] = 1) and ($blocked[$i] < 1)
		if ($debug = true)
			echo "Found upgraded port " $port " with portval " $portvalue[$port] ", warping there*"
		end
		setvar $port $i
		setvar $thiswarp $i
		setvar $upgraded[$i] 0
		goto :wp_trybestport
	end
end

if ($nearplanport > 0) and ($blocked[$nearplanport] < 1)
	setvar $port $nearplanport
	setvar $planprodval[$nearplanport] 0
	subtract $planprodcnt 1
	setvar $nearplanport 0
	goto :wp_trybestport
elseif ($nearplanport > 0)
	setvar $nearplanport 0
end

# try known good ports (ports we have data for)
# this is the fastest method

if ($debug = true)
	echo "Attempting to locate twarpable sector with good port*"
end

setvar $bestport 0

setvar $i 11
while ($i < sectors)
	add $i 1
	setvar $dist $courses[$i]
	setvar $port $i

	if ($figs[$port] = 1) and ($dist < $range)
		if ($blocked[$port] < 1) and ($port <> $lastwarp) and ($port <> $player~current_sector) and ($port <> $thiswarp)
			if ($portvalue[$port] < 1)
				if ($debug = true)
					#echo "*Found port: " $port " value " $value "*"
				end
				gosub :setportval
				if ($portvalue[$port] < 1)
					setvar $portvalue[$port] 1
				end
			end
			if ($portvalue[$port] > $min_portval)
				setvar $bestport $port
				goto :wp_trybestport
			end
		end
	end
end

if ($incomputer = 1)
	send "q"
end

if ($bestport > 0)
	setvar $port $bestport
	if ($debug = true)
		echo "*Selected best warp port " $bestport " portvalue " $portvalue[$bestport] "**"
	end
	goto :wp_trybestport
else
	return
end

# ok, lets do this
:wp_trybestport
# avoid navhaz above limit
if (sector.navhaz[$port] > $gopop_maxhaz)
	if ($debug = true)
		echo "S" $bestport ": navhaz over limit, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end
# avoid enemy limps
if ($gopop_avoidlimps = "yes") and (sector.limpets.quantity[$port] > 0) and (sector.limpets.owner[$port] <> "yours") and (sector.limpets.owner[$port] <> "belong to your Corp")
	if ($debug = true)
		echo "S" $bestport ": enemy limpets present, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end
# avoid enemy mines
if ($gopop_avoidmines = "yes") and (sector.mines.quantity[$port] > 0) and (sector.mines.owner[$port] <> "yours") and (sector.mines.owner[$port] <> "belong to your Corp")
	if ($debug = true)
		echo "S" $bestport ": enemy mines present, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end

if ($debug = true)
	echo "Attempting twarp to " $port " with portval = " $portvalue[$port] "*"
end

gosub :warptoport

if ($warpgood = 1)
	return
else
	setvar $target $port
	gosub :removefigfromdata
	goto :wp_findportloop
end

##################################################################################################################################
:tryadjwarp
setvar $warpgood 0
setvar $tries 0

getallcourses $courses $player~current_sector
setvar $range ($player~ore_holds / 3)
setarray $blockedadj sectors

:adj_findportloop
setvar $bestport 0
setvar $bestportval 0
setvar $adjsec 0
setvar $bestadjsec 0
add $tries 1
if ($tries > 1)
	setvar $warpgood 0
	return
end

# look for adjacent twarp sector to port
setvar $i 0
setvar $incomputer 0

#if ($debug = TRUE)
#	echo "*trying adjacent ports*"
#end

setvar $i 0
while ($i < sectors)
	add $i 1
	setvar $dist $courses[$i]
	setvar $adjwarp $i

	if ($dist > 1) and ($figs[$adjwarp] > 0) and ($blocked[$adjwarp] = 0) and ($dist < $range) and ($adjwarp <> $lastwarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpcount[$adjwarp])
			add $warp_cnt 1
			setvar $test sector.warps[$adjwarp][$warp_cnt]
			if (port.exists[$test]) and ($test > 10) and ($test <> $map~stardock) and (port.class[$test] <> 0) and ($test <> $lastwarp)
				if ($portvalue[$test] > $min_portval)
					#or ($portvalue[$test] = 0)
					setvar $bestport $test
					setvar $bestportval $portvalue[$test]
					setvar $port $bestport
					setvar $bestadjsec $adjwarp
					goto :findloop_send
				end
			end
		end
	end
end

return

:findloop_send
if ($bestport > 0)
	setvar $port $bestport

	if ($port < 11) or ($port = stardock) or (port.class[$port] = 0)
		if ($debug = true)
			echo "S" $port ": skipping, fedspace or special port*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end

	# avoid navhaz above limit
	if (sector.navhaz[$port] > $gopop_maxhaz)
		if ($debug = true)
			echo "S" $port ": skipping, navhaz present exceeds limit*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end
	# avoid enemy limps
	if ($gopop_avoidlimps = "yes") and (sector.limpets.quantity[$port] > 0) and (sector.limpets.owner[$port] <> "yours") and (sector.limpets.owner[$port] <> "belong to your Corp")
		if ($debug = true)
			echo "S" $port ": skipping, enemy limpets present*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end
	# avoid enemy mines
	if ($gopop_avoidmines = "yes") and (sector.mines.quantity[$port] > 0) and (sector.mines.owner[$port] <> "yours") and (sector.mines.owner[$port] <> "belong to your Corp")
		if ($debug = true)
			echo "S" $port ": skipping, enemy mines present*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end

	if ($debug = true)
		echo "Attempting twarp to " $bestadjsec " with adjacent portval = " $portvalue[$bestport] "*"
	end

	setvar $port $bestadjsec
	gosub :warptoport

	if ($warpgood = 1)
		return
	else
		setvar $target $port
		gosub :removefigfromdata
		goto :adj_findportloop
		#else
		#setvar $blocked[$port] 1
	end
end
return

# try again up to the max tries
#goto :adj_findportloop

##################################################################################################################################
:tryprobes
setvar $warpgood 0
setvar $tries 0
setvar $incomputer 0

setvar $range ($player~ore_holds / 3)
setarray $probetested sectors

getnearestwarps $nearest $player~current_sector

:tryprobeloop
setvar $bestsec 0
setvar $bestdist 0
setvar $adjsec 0
setvar $bestadj 0
setvar $moved 0

add $tries 1
if ($tries > 5)
	setvar $warpgood 0
	return
elseif ($player~eprobes < 1)
	setvar $warpgood 0
	return
end

# lets probe some shizznit
:algo2
setvar $randmaxtries 1000
setvar $randtries 0
while ($randtries < $randmaxtries)
	add $randtries 1
	getrnd $bestsec 12 sectors
	if ($bestsec <> $player~current_sector) and (sector.explored[$bestsec] <> "YES")
		goto :trythisadj
	end
end

:trythisadj
#echo "*bestsec  " $bestsec "*"
if ($bestsec > 0)
	setarray $probesec_ports 20
	setvar $probesec_pc 0
	if ($incomputer = 1)
		send "q"
		setvar $incomputer 0
	end
	send "e"
	subtract $player~eprobes 1
	waiton "SubSpace Ether Probe loaded"
	send $bestsec & "*"

	:probeloop
	settexttrigger probedead :probedead "Probe Destroyed"
	settexttrigger probeend :probeend "Probe Self Destructs"
	settexttrigger probesec :probesec "Probe entering sector : "
	settexttrigger probeend2 :probeend "Command [TL"
	pause

	:probedead
	killalltriggers
	#getword CURRENTLINE $probesec 5
	if ($max_enemy_figs = 0)
		setvar $blocked[$probesec] 1
	end
	gosub :probescanports
	return

	:probeend
	killalltriggers
	gosub :probescanports
	return

	:probesec
	killalltriggers
	getword currentline $probesec 5
	setvar $explored[$probesec] 1
	add $exploredsectors 1
	gosub :probe_sectordata
	if ($moved = 1)
		killalltriggers
		return
	end
	goto :probeloop

	:probescanports
	setvar $i 0
	setvar $destsec 0
	setvar $bestunexval 0
	if ($probesec_pc > 0)
		setvar $incomputer 0
		while ($i < $probesec_pc)
			add $i 1
			setvar $port $probesec_ports[$i]
			if ($portscanned[$port] < 1) and ($port > 10) and ($port <> $map~stardock) and (port.class[$port] > 0)
				if ($incomputer = 0)
					send "c"
					setvar $incomputer 1
				end
				gosub :getrportinfo
				gosub :setportval
				if ($portvalue[$port] > $min_portval) and ($portvalue[$port] > $bestunexval)
					setvar $destsec $port
					setvar $bestunexval $portvalue[$port]
				end
			end
			if ($debug = true)
				echo "Found port " $port ", calculated value: " $portvalue[$port] "*"
			end
		end
		if ($destsec > 0) and ($probemove > 0)
			getcourse $course $player~current_sector $port
			setvar $nextsec $course[2]
			setvar $coursenum 2
			if ($incomputer = 1)
				send "q"
				setvar $incomputer 0
			end
			if ($nextsec > 0)
				echo "nextsec " $nextsec " destsec " $destsec " port " $port "*"
				goto :movetoadj
			end
		end
		if ($incomputer = 1)
			send "q"
			setvar $incomputer 0
		end
	end
	return
else
	return
end

:probe_sectordata
settextlinetrigger probe_beacon 	:probe_beacon		"Beacon  :"
#settextlinetrigger probe_ports 	:probe_ports 		"Ports   :"
settextlinetrigger probe_ports 		:port2 			"Ports   :"
settextlinetrigger probe_planets	:probe_planets	 	"Planets :"
settextlinetrigger probe_traders	:probe_traders		"Traders :"
settextlinetrigger probe_ships 		:probe_ships 		"Ships   :"
settextlinetrigger probe_fighters	:probe_fighters 	"Fighters: "
settextlinetrigger probe_mines		:probe_mines		"Mines   :"
settextlinetrigger probe_navhaz 	:probe_navhaz		"NavHaz  :"
settextlinetrigger probe_warps 		:probesector_done	"Probe entering sector :"
settexttrigger probesecdead		:probedead 		"Probe Destroyed!"
settexttrigger probesecend 		:probeend 		"Probe Self Destructs"
pause

:port2
add $probesec_pc 1
setvar $probesec_ports[$probesec_pc] $probesec
pause

:probe_beacon
:probe_planets
:probe_traders
:probe_ships
:probe_fighters
:probe_mines
:probe_navhaz
:probe_warps
:probe_aliens
pause

:probesector_done
killalltriggers
return

goto :tryprobeloop

##################################################################################################################################
:figsector
if ($sector < 1)
	return
end

if ($figs[$sector] = 0) and ($sector > 10) and ($sector <> $map~stardock)
	send "fz1*cqd *"
	#waitfor "<Re-Display>"
	waitfor "Command [TL="
end

setvar $figs[$sector] 1
setsectorparameter $sector "FIGSEC" 1
return

##################################################################################################################################
:minesector
if ($corp_num = 0)
	setvar $corp_planets 0
end

setvar $enemy_mines 0
setvar $enemy_limps 0

if (sector.mines.quantity[$port] > 0)
	if (sector.mines.owner[$port] <> "yours") and (sector.mines.owner[$port] <> "belong to your Corp")
		setvar $enemy_mines 1
	end
end

if (sector.limpets.quantity[$port] > 0)
	if (sector.limpets.owner[$port] <> "yours") and (sector.limpets.owner[$port] <> "belong to your Corp")
		setvar $enemy_limps 1
	end
end

if ($place_limps > 0) and ($player~limpets >= $place_limps)
	echo "got here 2*"
	setvar $sector_limped 0
	if ($enemy_limps = 1)
		gosub :minesector_clear
		if ($sector_clear = 0)
			goto :minesector_mines
		end
	end
	send "h 2"
	settextlinetrigger nolimp :nolimp "These mines are not under your control"
	settexttrigger limpok :limpok "How many Limpet mines"
	pause

	:nolimp
	killalltriggers
	goto :minesector_mines

	:limpok
	killalltriggers
	send $place_limps & "* " & $oncorp
	settextlinetrigger badlimp :badlimp "You don't have that many mines"
	settextlinetrigger goodlimp :goodlimp "Done. You have"

	:goodlimp
	setvar $sector_limped 1

	:badlimp
	killalltriggers
	waiton "Command [TL"
end

:minesector_mines
if (($player~surroundmine > 0) or ($player~surroundlimp > 0))
	gosub :mines~deploy
end
return

##################################################################################################################################
:minesector_clear
setvar $sector_clear 0
if ($gopop_clearsector = "yes")
	gosub :mines~clear
	gosub :mines~refresh_clear_sector_state
	if ($mines~sectorclear = true)
		setvar $sector_clear 1
	end
end
return

##################################################################################################################################
#
# try to move to an adjacent sector
#
# arguments:
# $msec	: Sector to move to
#
# returns:
# $movegood	: Move status (0=bad, 1=good)
# $movefotoned	: Fotoned on move (0=no, 1=yes)
#
:trymove
killalltriggers
setvar $movegood 0
setvar $movefotoned 0

# get ship info
if ($max_attack < 1)
	send "c;"
	waiton "Max Figs Per"
	getword currentline $max_attack 5
	send "q"
	waiton "Command [TL"
end

if ($msec < 1)
	return
end

#gosub :PLAYER~QUIKSTATS
#waiton "Command [TL"

send $msec & "*"
add $turncount 1
settextlinetrigger moveavoid :moveavoid "You have marked sector"
settextlinetrigger movefotoned1 :movefotoned "One of your Photon Missiles was detonated"
settextlinetrigger movefotoned2 :movefotoned "damaging your ship"
settexttrigger movegood :movegood #91&$msec&#93
settexttrigger movemined :movemined "Mined Sector: Do you wish"
settexttrigger moveig :moveig "An Interdictor Generator"
settexttrigger movestuck :movestuck "Option?"
pause

:movemined
send "n"
pause

:movefotoned
setvar $movefotoned 1
pause

:moveig
killalltriggers
return

:moveavoid
killalltriggers
send "n"
return

:movestuck
if (($player~fighters * $ship_offodds) > sector.figs.quantity[$msec])
	if ($player~fighters >= $max_attack)
		send "a" $max_attack "*"
	else
		send "a" $player~fighters "*"
	end
	waiton "You lost"
	getword currentline $figloss 3
	striptext $figloss ","
	subtract $player~fighters $figloss
	settexttrigger movestuck :movestuck "Option?"
	pause
else
	killalltriggers
	send "r"
	return
end

:movegood
killalltriggers
add $gopop_moves 1
setvar $movegood 1
gosub :figsector

:movebad
send #145
return

##################################################################################################################################
:timecalc
gettime $endtimehh "h"
gettime $endtimemm "n"
gettime $endtimess "s"

if ($endtimehh <> $currenthh)
	add $currenthh 1
	# correct turns used for top of hour
	if ($player~unlimitedgame = false) and ($game_turns > 0)
		setvar $turnadd ($game_turns / 24)
		add $start_turns $turnadd
	end
end

if ($endtimess < $sttimess)
	subtract $endtimemm 1
	add $endtimess 60
end

if ($endtimess < $sttimess)
	subtract $endtimemm 1
	add $endtimess 60
end

if ($endtimemm < $sttimemm)
	subtract $endtimehh 1
	add $endtimemm 60
end

setvar $elapsedmm ($endtimemm - $sttimemm)
setvar $elapsedss ($endtimess - $sttimess)
setvar $elapsedseconds ($elapsedss + ($elapsedmm * 60))
setvar $elapsedminutes ($elapsedmm + ($elapsedhh * 60))
setvar $elapsedhours $elapsedhh

if ($elapsedseconds = 0)
	setvar $elapsedseconds 1
end

if ($elapsedminutes = 0)
	setvar $elapsedminutes 1
end

getlength $elapsedhh $len
if ($len < 2)
	setvar $elapsedhours "0"&$elapsedhh
else
	setvar $elapsedhours $elapsedhh
end

getlength $elapsedmm $len
if ($len < 2)
	setvar $elapsedminutes "0"&$elapsedmm
else
	setvar $elapsedminutes $elapsedmm
end

getlength $elapsedss $len
if ($len < 2)
	setvar $elapsedseconds ":0" & $elapsedss
else
	setvar $elapsedseconds $elapsedss
end

return

##################################################################################################################################
:nearxxb
if ($sectorfinder_minfigdistance = 0)
	return
end

:breadth_search_fig
setvar $database[1] $index
setvar $array_size 1
setvar $array_pos 0
setvar $num_sectors sectors
setarray $checked $num_sectors
setvar $checked[$index] 1
setarray $path $num_sectors
setvar $path[$index] ""
setarray $distance $num_sectors
setvar $distance[$index] 0
setvar $done[$index] 1

:sectorloop_fig
add $array_pos 1
setvar $player~current_sector $database[$array_pos]
setvar $warpnum 0

:checkwarps_fig
add $warpnum 1
setvar $target sector.warps[$player~current_sector][$warpnum]
if ($checked[$target] = 0)
	setvar $checked[$target] 1
	add $array_size 1
	setvar $database[$array_size] $target
	setvar $path[$target] $target & " " & $path[$player~current_sector]
	setvar $distance[$target] $distance[$player~current_sector]
	add $distance[$target] 1
	if ($figlist[$target] > 0) and (port.exists[$target] = 1) and ($done[$target] < 1) and (port.buyequip = true)
		if ($distance[$target] >= $sectorfinder_minfigdistance)
			setvar $reason $reason & "Nearest port is sector " & $target & " - "& $distance[$target] & " hops"
			send  "'Nearest port to " & $index & " is " & $target & " - "& $distance[$target] & " hops*"
			setvar $done[$target] 1
		else
			setvar $valid 0
		end
		return
	end
end
if ($array_size = $num_sectors)
	setvar $reason $reason & "No Near port Found"
	return
end
if ($warpnum < sector.warpcount[$player~current_sector])
	# goto :checkwarps_Fig
end
#goto :SectorLoop_Fig

##################################################################################################################################
:setup
loadvar $map~backdoor
loadvar $map~stardock
loadvar $player~surroundmine
loadvar $player~surroundlimp
loadvar $game~max_planets_per_sector
loadvar $game~max_planets_in_game

gosub :player~quikstats
waiton "Command [TL"

setvar $min_portval "175000"

if ($player~surroundmine > 0)
	setvar $gopop_buymines "yes"
else
	setvar $gopop_buymines "no"
end
if ($player~surroundlimp > 0)
	setvar $gopop_buylimps "yes"
else
	setvar $gopop_buylimps "no"
end

# dock menu
setvar $gopop_buyfigs "yes"
setvar $gopop_maxfigs "10000"
setvar $gopop_dropfigs 1
setvar $gopop_buyshields "yes"
setvar $gopop_buydisr "no"
setvar $gopop_buycommish "yes"
setvar $gopop_cashdrop "no"
setvar $gopop_menucorpie "0"
setvar $gopop_xferpct "50"
setvar $gopop_buyship "no"
setvar $gopop_menuship "0"
setvar $gopop_shipcommish "yes"
setvar $default_minportval "175000"
setvar $gopop_minportval $default_minportval
setvar $min_portval "175000"
setvar $gopop_blowfigs "2000"
setvar $gopop_blowmax "yes"
setvar $gopop_secmax $game~max_planets_per_sector
setvar $gopop_cleanup "no"
setvar $gopop_maxblowtries 3
setvar $gopop_maxoverloads 3
setvar $gopop_navmode "Standard"
setvar $gopop_cleanall "no"
setvar $gopop_maxenemyfigs "no"
setvar $gopop_alwaysprobe "no"
setvar $gopop_maxtwarp "45"
setvar $gopop_maxhaz "10"
setvar $gopop_disrmines "no"
setvar $gopop_avoidmines "yes"
setvar $gopop_avoidlimps "yes"
setvar $gopop_avoidaliens "yes"
setvar $gopop_placemines "0"
setvar $gopop_placelimps "0"
setvar $gopop_clearsector "no"

if ($player~current_prompt <> "Command")
	clientmessage "This script must be run from the game command menu"
	goto :gpm_shutdown
end

if ($ptradesetting = 0)
	echo "*Warning: planet trade percent not set / mombot not running - defaulting to 100%*"
	setvar $ptradesetting 100
end

if ($game~max_planets_per_sector < 1) or ($game~max_planets_in_game < 1)
	gosub :game~gamestats
end

if ($map~stardock < 11)
	gosub :map~getstardock
	if ($map~stardock < 11)
		setvar $switchboard~message "Unable to retrieve stardock sector , cannot continue*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

gosub :player~getinfo
setvar $corp_num $player~corp
gosub :loadshipinfo
gosub :ansicolors

# Shadow's telemetry variables
setvar $start_credits $player~credits
setvar $start_turns $player~turns
setvar $portscashed 0
setvar $upgradedports 0
setvar $portcash 0
setvar $pcounter 0
setvar $max_planetnum 0
setvar $exploredsectors 0
setvar $buyfotons 0
setvar $gopop_moves 0
setvar $turnsused 0

if ($debug = true)
	setvar $oremcicnum 0
	setvar $oremcic 0
	setvar $orgmcicnum 0
	setvar $orgmcic 0
	setvar $equmcicnum 0
	setvar $equmcic 0
end

# weights
setvar $gopop_orevalue "45"
setvar $gopop_orgvalue "85"
setvar $gopop_equvalue "125"

# disable fedcom
gosub :fedcomoff

# set up planet catalog
loadvar $bot~folder
if ($planet_catalog_file = "") or ($planet_catalog_file = 0)
	setvar $planet_catalog_file $bot~folder&"/planetprods.cfg"
end
gosub :planet~loadplanetprods

# set up sector arrays
gosub :doarrays

# capture avoids at start
gosub :sector~getavoids
setvar $i 0
while ($i < $avoids)
	add $i 1
	setvar $blocked[$avoids[$i]] 1
end

if ($gopop_avoidaliens = "yes")
	gosub :getaliens
end

if ($player~photons > 0)
	setvar $switchboard~message "Cannot run gpm run with photons on ship!*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
end

# make sure we have backdoor to dock
isnumber $tn $map~backdoor
if ($tn < 1) or ($map~backdoor < 1)
	setvar $sector~destination $map~stardock
	gosub :sector~getbackdoor
end

# make up a random name for planets
getrnd $rnd1 100000 999999
setvar $planetname "GPM_" & $rnd1

setvar $movesinceport 0

# keep track of whether I have these locations
if ($map~rylos < 1)
	setvar $found_rylos 0
end
if ($map~alphacentauri < 1)
	setvar $found_alpha 0
end

# grab start time
gettime $currenthh "h"
gettime $sttimemm "n"
gettime $sttimess "s"
setvar $elapsedhh 0

if ($player~unlimitedgame = 1)
	setvar $tnum "unlimited"
else
	setvar $tnum $player~turns
end

return

##################################################################################################################################
:loadshipinfo
gosub :ship~loadshipinfo
return

##################################################################################################################################
:savecashingdefaults
setvar $gopop_minprod "500"
savevar $gopop_minprod
setvar $gopop_minportval $default_minportval
savevar $gopop_minportval
setvar $gopop_planetname "GPM"
savevar $gopop_planetname
setvar $gopop_planettype "Corp"
savevar $gopop_planettype
setvar $gopop_sellexisting "yes"
savevar $gopop_sellexisting
setvar $gopop_sellallexisting "yes"
savevar $gopop_sellallexisting
setvar $gopop_upgradeore "no"
savevar $gopop_upgradeore
setvar $gopop_upgradeequ "no"
savevar $gopop_upgradeequ
setvar $gopop_upgrademcic "-60"
savevar $gopop_upgrademcic
return

##################################################################################################################################
:ansicolors
setvar $cls #27 & "[2J"
setvar $black ansi_8
setvar $red ansi_12
setvar $green ansi_10
setvar $yellow ansi_14
setvar $blue ansi_9
setvar $magenta ansi_13
setvar $cyan ansi_11
setvar $white ansi_15
setvar $blackwhite #27 & "[0;30;47m"
setvar $whitered #27 & "[1;37;41m"
setvar $redwhite #27 & "[1;31;47m"
setvar $yellowred #27 & "[1;33;41m"
setvar $resetblack #27 & "[1;37;40m"
return

##################################################################################################################################
:getaliens
killalltriggers
setvar $alien_races 0
send "#"
waiton "Who's Playing"
settexttrigger endalien :endalien "(?="

:getaliensloop
settexttrigger gotrace :gotrace "are on the move!"
pause

:gotrace
gettext currentline $race "The " " "
add $alien_races 1
setvar $alien_race[$alien_races] $race
goto :getaliensloop

:endalien
killtrigger gotrace
setvar $gotalienraces 1
return

##################################################################################################################################
:warptoport
setvar $warpgood 0

getdistance $dist $map~stardock $port

if ($port < 11) or ($port = $map~stardock) or (port.class[$port] = 0)
	echo "S " $port ": fedspace or special port, blocking*"
	setvar $blocked[$port] 1
	return
end

if ($dist <> "-1") and ($dist < 3)
	echo "S " $port ": too close to stardock, avoiding*"
	#setvar $blocked[$port] 1
	return
end

getdistance $dist $player~current_sector $port
if ($dist = "-1")
	echo "Cannot calculate distance to port " $port ", blocking.*"
	setvar $figs[$port] 0
	setvar $blocked[$port] 1
end

if ($dist = 0)
	if ($debug = true)
		echo "Already at target port " $port ", using current sector*"
	end
	setvar $warpgood 1
	return
end

setvar $oreneeded ($dist * 3)

if ($debug = true)
	echo "*distance from sector " $player~current_sector " to port " $port " = " $dist "*"
end

# if it's only one hop, lets just move
if ($dist = 1)
	if ($debug = true)
		echo "attempting adjacent move into sector*"
	end
	setvar $msec $port
	gosub :checksafe
	if ($movesafe = 1)
		gosub :trymove
		if ($movegood = 1)
			setvar $warpgood 1
			return
		end
	end
end

# try to twarp direct if possible
if ($dist > 1) and ($figs[$port] > 0) and ($player~ore_holds > $oreneeded)
	if ($debug = true)
		echo "Attempting twarp directly to sector*"
	end
	setvar $warpto $port
	setvar $player~warpto $warpto
	gosub :move~twarp
	if ($player~twarpsuccess = true)
		setvar $warpgood 1
		return
	end
	setvar $target $warpto
	gosub :removefigfromdata
end

if ($debug = true)
	echo "attempting to twarp to adjacent and move to port*"
end

# try to find an adjacent to twarp to
setvar $warp_cnt 0
while ($warp_cnt < sector.warpincount[$port])
	add $warp_cnt 1
	setvar $adj sector.warpsin[$port][$warp_cnt]
	if ($figs[$adj] > 0)
		getdistance $dist $player~current_sector $adj
		setvar $oreneeded ($dist * 3)
		if ($dist > 1) and ($player~ore_holds > $oreneeded)
			setvar $warpto $adj
			setvar $player~warpto $warpto
			gosub :move~twarp
			#echo "twarpgood " $player~twarpsuccess "*"
			if ($player~twarpsuccess = true)
				setvar $msec $port
				gosub :checksafe
				if ($movesafe = 1)
					gosub :trymove
					if ($movegood = 1)
						setvar $warpgood 1
						return
					end
				end
			else
				setvar $target $warpto
				gosub :removefigfromdata
			end
		end
	end
end

# no joy, go back where we started
return

##################################################################################################################################
#
# Attempt to determine if a sector is safe to move into (warp adjacent)
# Specify $msec = sector to move to
# Returns $checksafe = 0 (bad) or $checksafe = 1 (good)
#
:checksafe
setvar $movesafe 0

# nothing is safe in the absence of a holoscanner
if ($player~scan_type <> "Holo")
	return
end

if (sector.explored[$msec] <> "No")
	setvar $old_dens sector.density[$msec]

	send "s"
	if ($player~scan_type = "Holo")
		send "d"
	end
	waitfor "Relative Density Scan"

	# if density hasn't changed, skip the holo
	if (sector.density[$msec] = $old_dens)
		goto :checksafe_skipholo
	end
end

# let's holo scan to be sure
gosub :tryholo
if ($holoaliens > 0)
	return
end

:checksafe_skipholo
# avoid enemy fighters
if (sector.figs.quantity[$msec] <> 0)
	if (sector.figs.owner[$msec] <> "yours") and (sector.figs.owner[$msec] <> "belong to your Corp")
		if (sector.figs.quantity[$msec] > $max_enemy_figs) or (($player~fighters * $ship_offods) < (sector.figs.quantity[$msec] + 100))
			return
		end
	end
end

# avoid navhaz above limit
echo "navhaz: " sector.navhaz[$msec] "*"
if (sector.navhaz[$msec] > $gopop_maxhaz)
	return
end

# avoid enemy limps
if ($gopop_avoidlimps = "yes")
	if (sector.limpets.quantity[$msec] > 0) and (sector.limpets.owner[$msec] <> "yours") and (sector.limpets.owner[$msec] <> "belong to your Corp")
		return
	end
end

# avoid enemy mines
if ($gopop_avoidmines = "yes")
	if (sector.mines.quantity[$msec] > 0) and (sector.mines.owner[$msec] <> "yours") and (sector.mines.owner[$msec] <> "belong to your Corp")
		return
	end
end

# avoid traders
if (sector.tradercount[$msec] > 0)
	return
end

# if we made it this far, congratulations!
setvar $movesafe 1
return

##################################################################################################################################
:doarrays
setarray $figs sectors
setarray $limps sectors
setarray $mines sectors
setarray $adj sectors
setarray $portvalue sectors
setarray $avoids sectors
setarray $planprodval sectors
setarray $blocked sectors
setarray $visits sectors
setarray $twarpports sectors
setarray $upgraded sectors
setarray $explored sectors
setarray $portscanned sectors
setvar $goodports 0
setvar $ports_scanned 0
setvar $twarpports_cnt 0
setvar $exploredstart 0

echo "**Creating Arrays, this may take a moment..."

setvar $idx 10
while ($idx < sectors)
	add $idx 1
	getsectorparameter $idx "FIGSEC" $isfigged
	getsectorparameter $idx "LIMPSEC" $islimped
	getsectorparameter $idx "MINESEC" $ismined

	setvar $visits[$idx] 0
	setvar $blocked[$idx] 0
	setvar $avoids[$idx] 0
	setvar $adj[$idx] 0

	isnumber $tn $isfigged
	if ($tn)
		if ($isfigged <> 0)
			setvar $figs[$idx] 1
			#else
			#	setvar $figs[$idx] 0
		end
	end

	isnumber $tn $islimped
	if ($tn)
		if ($islimped <> 0)
			setvar $limps[$idx] 1
			#else
			#	setvar $limps[$idx] 0
		end
	end

	isnumber $tn $ismined
	if ($tn)
		if ($ismined <> 0)
			setvar $mines[$idx] 1
			#else
			#	setvar $mines[$idx] 0
		end
	end

	setvar $warp_cnt 0
	#setvar $adj[$idx] 0
	while ($warp_cnt < sector.warpincount[$idx])
		add $warp_cnt 1
		if ($figs[sector.warpsin[$idx][$warp_cnt]] > 0)
			setvar $adj[$idx] sector.warpsin[$idx][$warp_cnt]
			goto :adjdone
		end
	end

	:adjdone
	if (sector.explored[$idx] = "YES")
		setvar $explored[$idx] 1
		add $exploredstart 1
	end

	if (port.exists[$idx]) and ($explored[$idx] = 1)
		setvar $port $idx
		gosub :setportval
		add $ports_scanned 1
		if ($portvalue[$idx] > $min_portval)
			#setvar $portmax_ore ((PORT.FUEL[$idx] * 100) / PORT.PERCENTFUEL[$idx])
			#setvar $portmax_org ((PORT.ORG[$idx] * 100) / PORT.PERCENTORG[$idx])
			#setvar $portmax_equ ((PORT.EQUIP[$idx] * 100) / PORT.PERCENTEQUIP[$idx])
			add $goodports 1
			if ($figs[$idx] > 0)
				add $twarpports_cnt 1
				setvar $twarpports[$twarpports_cnt] $idx
			end
			if ($portvalue[$idx] > 2000000)
				setvar $upgraded[$idx] 1
			end
		end
	end
end

#if ($debug = TRUE)
echo "*scanned " $ports_scanned " ports at startup, found " $goodports " good ports*"
#end
return

##################################################################################################################################
:getportinfo
setvar $buysell[fuel] ""
setvar $buysell[organics] ""
setvar $buysell[equipment] ""
setvar $portqty[fuel] 0
setvar $portqty[organics] 0
setvar $portqty[equipment] 0
setvar $percent[fuel] 0
setvar $percent[organics] 0
setvar $percent[equipment] 0

send "*CR" & $port & "*Q"
settextlinetrigger gpm_port_ore :gpm_port_ore "Fuel Ore"
settextlinetrigger gpm_port_org :gpm_port_org "Organics"
settextlinetrigger gpm_port_equ :gpm_port_equ "Equipment"
settextlinetrigger gpm_port_done :gpm_port_done "<Computer deactivated>"
settextlinetrigger gpm_port_none :gpm_port_none "I have no information about a port in that sector."
settextlinetrigger gpm_port_never :gpm_port_none "You have never visted sector"
pause

:gpm_port_ore
getword currentline $tmpbuy 3
uppercase $tmpbuy
getword currentline $tmpqty 4
getword currentline $tmppct 5
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[fuel] $tmpbuy
	setvar $portqty[fuel] $tmpqty
	setvar $percent[fuel] $tmppct
end
pause

:gpm_port_org
getword currentline $tmpbuy 2
uppercase $tmpbuy
getword currentline $tmpqty 3
getword currentline $tmppct 4
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[organics] $tmpbuy
	setvar $portqty[organics] $tmpqty
	setvar $percent[organics] $tmppct
end
pause

:gpm_port_equ
getword currentline $tmpbuy 2
uppercase $tmpbuy
getword currentline $tmpqty 3
getword currentline $tmppct 4
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[equipment] $tmpbuy
	setvar $portqty[equipment] $tmpqty
	setvar $percent[equipment] $tmppct
end
pause

:gpm_port_none
killtrigger gpm_port_ore
killtrigger gpm_port_org
killtrigger gpm_port_equ
killtrigger gpm_port_done
killtrigger gpm_port_none
killtrigger gpm_port_never
send "Q"
waiton "Command [TL"
return

:gpm_port_done
killtrigger gpm_port_ore
killtrigger gpm_port_org
killtrigger gpm_port_equ
killtrigger gpm_port_done
killtrigger gpm_port_none
killtrigger gpm_port_never
waiton "Command [TL"
return

##################################################################################################################################
:getrportinfo
setvar $buysell[fuel] ""
setvar $buysell[organics] ""
setvar $buysell[equipment] ""
setvar $portqty[fuel] 0
setvar $portqty[organics] 0
setvar $portqty[equipment] 0
setvar $percent[fuel] 0
setvar $percent[organics] 0
setvar $percent[equipment] 0

settextlinetrigger gpm_rport_ore :gpm_rport_ore "Fuel Ore"
settextlinetrigger gpm_rport_org :gpm_rport_org "Organics"
settextlinetrigger gpm_rport_equ :gpm_rport_equ "Equipment"
settextlinetrigger gpm_rport_done :gpm_rport_done "Computer command [TL="
settextlinetrigger gpm_rport_none :gpm_rport_none "I have no information about a port in that sector."
settextlinetrigger gpm_rport_never :gpm_rport_none "You have never visted sector"
send "R" & $port & "*"
pause

:gpm_rport_ore
getword currentline $tmpbuy 3
uppercase $tmpbuy
getword currentline $tmpqty 4
getword currentline $tmppct 5
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[fuel] $tmpbuy
	setvar $portqty[fuel] $tmpqty
	setvar $percent[fuel] $tmppct
end
pause

:gpm_rport_org
getword currentline $tmpbuy 2
uppercase $tmpbuy
getword currentline $tmpqty 3
getword currentline $tmppct 4
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[organics] $tmpbuy
	setvar $portqty[organics] $tmpqty
	setvar $percent[organics] $tmppct
end
pause

:gpm_rport_equ
getword currentline $tmpbuy 2
uppercase $tmpbuy
getword currentline $tmpqty 3
getword currentline $tmppct 4
striptext $tmpqty ","
striptext $tmppct "%"
isnumber $tmpqtyok $tmpqty
isnumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setvar $buysell[equipment] $tmpbuy
	setvar $portqty[equipment] $tmpqty
	setvar $percent[equipment] $tmppct
end
pause

:gpm_rport_none
:gpm_rport_done
killtrigger gpm_rport_ore
killtrigger gpm_rport_org
killtrigger gpm_rport_equ
killtrigger gpm_rport_done
killtrigger gpm_rport_none
killtrigger gpm_rport_never
return

##################################################################################################################################
:setportval
setvar $portval 0

if ($sell_equ = 1) and (port.buyequip[$port] = true) and (port.percentequip[$port] >= 15)
	add $cnt 1
	setvar $tmpval port.equip[$port]
	multiply $tmpval $gopop_equvalue
	add $portval $tmpval
end
if ($sell_org = 1) and (port.buyorg[$port] = true) and (port.percentorg[$port] >= 15)
	add $cnt 1
	setvar $tmpval port.org[$port]
	multiply $tmpval $gopop_orgvalue
	add $portval $tmpval
end
if ($sell_ore = 1) and (port.buyfuel[$port] = true) and (port.percentfuel[$port] >= 15)
	add $cnt 1
	setvar $tmpval port.fuel[$port]
	multiply $tmpval $gopop_orevalue
	add $portval $tmpval
end

if ($portval = 0)
	setvar $portval 1
end

setvar $portvalue[$port] $portval
setvar $portscanned[$port] 1
return

##################################################################################################################################
:dopop
setvar $gopop_maxblowtries 3
setvar $gopop_maxoverloads 3

setvar $popcount 0
setvar $made_sale false

if ($plantype = "")
	setvar $plantype "p"
end

if ($debug = true)
	echo "*Attempting dopop for port " $port "*"
end

send "d"

# dock at a port if theres one here
if (port.exists[$port] = 0) or ($port < 11) or (port.class[$port] = 0) or ($port = $map~stardock)
	echo "*Failed to find a port here - returning*"
	return
end

setvar $actualval 0
gosub :getportinfo
gosub :setpostportval
if ($portvalue[$port] <= $min_portval)
	if ($debug = true)
		echo "*Port " $port " below minimum after live report: " $portvalue[$port] " <= " $min_portval "*"
	end
	goto :endpop
end
setvar $madeone 0
setvar $overloadsdone 1
setvar $overloadtries 1

setvar $psec sector.planetcount[$port]
if ($psec <= $gopop_secmax)
	setvar $planetmax $gopop_secmax
else
	setvar $planetmax $psec
end

:popit
killalltriggers

if ($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit)
	setvar $switchboard~message "Out of turns, halting!*"
	gosub :switchboard~switchboard
	goto :wrapup
end

gosub :port_has_sellable_product
if ($moretodo = 0)
	goto :endpop
end

if ($player~genesis = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :player~quikstats
	if ($player~genesis = 0)
		setvar $switchboard~message "Failed to furb! Halting.*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

if ($madeone = 1)
	if ($debug = true)
		echo "*psec: " $psec " MAX " $gopop_secmax "*"
	end
	echo "blowmax " $gopop_blowmax " psec " $psec " planetmax " $planetmax " fighters " $player~fighters " blowfigs " $gopop_blowfigs "*"
	#halt
	if ($psec > $planetmax) and ($player~fighters > $gopop_blowfigs)
		echo "overloadtries " $overloadtries " overloadsdone " $overloadsdone "*"
		add $overloadtries 1
		if ($overloadtries > $gopop_maxblowtries)
			if ($overloadsdone >= $gopop_maxoverloads)
				setvar $switchboard~message "Too many overload attempts in sector " & $port & ", skipping*"
				gosub :switchboard~switchboard
				return
			end
			add $planetmax 1
			add $overloadsdone 1
			setvar $overloadtries 1
		else
			send "l " $planet & "*"
			waiton "Planet command"
			gosub :blowplanet
		end
	end
	setvar $madeone 0
end

setvar $fueltosell 0
setvar $orgtosell 0
setvar $equiptosell 0
setvar $ptr 1

gosub :pop_planet
setvar $madeone 1
add $psec 1
#Gosub :LAND_ON_PLANET
gosub :getpnum

if ($planet > $max_planetnum)
	setvar $max_planetnum $planet
	setvar $game_planets $game~max_planets_in_game
	subtract $game_planets $max_planetnum
end

while ($planet~planetprods[$ptr] <> "0")
	if ($planet~planetprods[$ptr] = $lookingfor)
		setvar $fueltosell $planet~planetprods[$ptr][1]
		setvar $orgtosell $planet~planetprods[$ptr][2]
		setvar $equiptosell $planet~planetprods[$ptr][3]
		if ($player~ore_holds < $player~total_holds) and ($fueltosell > 100)
			send "l " $planet "* t n t1* q "
			add $turncount 1
		end
		if ($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0)
			goto :noselloff
		else
			goto :selloff
		end
	end
	add $ptr 1
end

setvar $hagglefailed 0

# New Planet not in Catalog is Scanned and Saved
send "l " $planet "*"
gosub :getplaninfo

setvar $planet~planetprods[$ptr] $lookingfor
setvar $planet~planetprods[$ptr][1] $fueltosell
setvar $planet~planetprods[$ptr][2] $orgtosell
setvar $planet~planetprods[$ptr][3] $equiptosell
#SetVar $LINE $PLANET~PLANETPRODS[$PTR] & #9 & $PLANET~PLANETPRODS[$PTR][1] & " " & $PLANET~PLANETPRODS[$PTR][2] & " " & $PLANET~PLANETPRODS[$PTR][3]
setvar $line $planet~planetprods[$ptr][1] & " " & $planet~planetprods[$ptr][2] & " " & $planet~planetprods[$ptr][3] & " " & $planet~planetprods[$ptr]
write $planet~planet_prods_file $line
setvar $nextptr $ptr
add $nextptr 1
setvar $planet~planetprods[$nextptr] "0"

if ($player~ore_holds < $player~total_holds) and ($fueltosell > 100)
	send "l " $planet "* t n t1* q "
	add $turncount 1
else
	send "q "
end

:selloff
if ($debug = true)
	echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
	echo "orebuying " $buysell[fuel] " oretrading " $portqty[fuel] "*"
	echo "orgbuying " $buysell[organics] " orgtrading " $portqty[organics] "*"
	echo "equbuying " $buysell[equipment] " equtrading " $portqty[equipment] "*"
end

if ($sell_ore <> 1) or ($buysell[fuel] <> "BUYING") or ($percent[fuel] < 15)
	setvar $fueltosell 0
end

if ($sell_org <> 1) or ($buysell[organics] <> "BUYING") or ($percent[organics] < 15)
	setvar $orgtosell 0
end

if ($sell_equ <> 1) or ($buysell[equipment] <> "BUYING") or ($percent[equipment] < 15)
	setvar $equiptosell 0
end

if ($debug = true)
	echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
	echo "orebuying " $buysell[fuel] " oretrading " $portqty[fuel] "*"
	echo "orgbuying " $buysell[organics] " orgtrading " $portqty[organics] "*"
	echo "equbuying " $buysell[equipment] " equtrading " $portqty[equipment] "*"
end

if ($fueltosell > 0) or ($orgtosell > 0) or ($equiptosell > 0)
	if ($player~unlimitedgame = false) and ($player~turns <= $bot~bot_turn_limit)
		setvar $switchboard~message "Out of turns, halting!*"
		gosub :switchboard~switchboard
		goto :wrapup
	end

	setvar $oldcreds $player~credits
	gosub :planetneg
	gosub :getportinfo
	gosub :setpostportval

	if ($planethaggle~sellhagglesucceeded = true)
		setvar $made_sale true
		add $portcash $planethaggle~profit
		gosub :updatemonitor
	end

	gosub :port_has_sellable_product
	if ($moretodo = 0)
		if ($debug = true)
			echo "*Port " $port " has no enabled product above 15% after selloff*"
		end
		goto :endpop
	end
	if ($debug = true) and ($portvalue[$port] <= $min_portval)
		echo "*Port " $port " below minimum after selloff but still has enabled product above 15%, continuing*"
	end
	goto :popit
end

:noselloff
gosub :getportinfo
gosub :setpostportval
gosub :port_has_sellable_product
if ($moretodo = 0)
	if ($debug = true)
		echo "*Port " $port " has no enabled product above 15% after no-sell check*"
	end
	goto :endpop
end
if ($debug = true) and ($portvalue[$port] <= $min_portval)
	echo "*Port " $port " below minimum after no-sell check but still has enabled product above 15%, continuing*"
end
goto :popit

##################################################################################################################################
:setpostportval
setvar $portval 0

isnumber $tmpqtyok $portqty[equipment]
isnumber $tmppctok $percent[equipment]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_equ = 1) and ($buysell[equipment] = "BUYING") and ($percent[equipment] >= 15)
		setvar $tmpval $portqty[equipment]
		multiply $tmpval $gopop_equvalue
		add $portval $tmpval
	end
end
isnumber $tmpqtyok $portqty[organics]
isnumber $tmppctok $percent[organics]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_org = 1) and ($buysell[organics] = "BUYING") and ($percent[organics] >= 15)
		setvar $tmpval $portqty[organics]
		multiply $tmpval $gopop_orgvalue
		add $portval $tmpval
	end
end
isnumber $tmpqtyok $portqty[fuel]
isnumber $tmppctok $percent[fuel]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_ore = 1) and ($buysell[fuel] = "BUYING") and ($percent[fuel] >= 15)
		setvar $tmpval $portqty[fuel]
		multiply $tmpval $gopop_orevalue
		add $portval $tmpval
	end
end

setvar $portvalue[$port] $portval
return

##################################################################################################################################
:port_has_sellable_product
setvar $moretodo 0
if ($sell_equ = 1) and ($buysell[equipment] = "BUYING") and ($percent[equipment] >= 15)
	setvar $moretodo 1
elseif ($sell_org = 1) and ($buysell[organics] = "BUYING") and ($percent[organics] >= 15)
	setvar $moretodo 1
elseif ($sell_ore = 1) and ($buysell[fuel] = "BUYING") and ($percent[fuel] >= 15)
	setvar $moretodo 1
end
return

##################################################################################################################################
:endpop
if ($gopop_cleanup = "yes") or ($gopop_cleanall = "yes")
	gosub :cleanup
end

if ($made_sale = true)
	#add $pcounter 1
	#add $portscashed 1
	gosub :stats
	gosub :updatemonitor
	if ($debug = true)
		#send "'Port value " $actualval " estimated value " $portvalue[$port] "*"
	end
end
return

##################################################################################################################################
:blowplanet
#send #145
gosub :current_prompt
if ($player~current_prompt = "Command")
	send "l " $planet "* "
	waiton "Planet command"
	#elseif ($PLAYER~CURRENT_PROMPT <> "Planet")
	#	echo "**Unexpected prompt for blowPlanet: " $PLAYER~CURRENT_PROMPT "*"
	#	halt
end

if ($player~atomic = 0)
	goto :nodets
	killalltriggers
end

add $turncount 1
if ($holds_ore < $holds_total) and ($fueltosell > 50)
	send "  T  N  T  1  *  "
end
send "  Z  D  Y  *  "
settextlinetrigger nodets	:nodets "You do not have any Atomic Detonators!"
settexttrigger kaboom		:kaboom "For blowing up this planet you receive"
pause

:nodets
killalltriggers
send "  Q  "
setvar $furb_return 1
gosub :furb
gosub :player~quikstats
if ($player~atomic = 0)
	send "'Atomic Furb Failed*"
	halt
else
	goto :blowplanet
end

:kaboom
killalltriggers
subtract $psec 1
subtract $player~atomic 1
return

##################################################################################################################################
:cleanup
killalltriggers
getword currentline $player~current_prompt 1
if ($player~current_prompt = "Planet")
	send "q "
	waiton "Command [TL"
end

if ($planet_scanner <> "Yes")
	gosub :checkplanetsafety
	if ($shielded = 1) or ($notours = 1)
		setvar $switchboard~message "Need planet scanner to clean up with shielded or non-GPM planets.*"
		gosub :switchboard~switchboard
		return
	end
end

:cleanup2
if ($player~atomic = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :player~quikstats

	if ($player~atomic = 0)
		send "'Atomic Furb Failed*"
		halt
	end
end

send "L"

:cleanuploop
settexttrigger  	cleanup_landed     	:cleanup_landed 	"Landing sequence engaged..."
settextlinetrigger	cleanup_done		:cleanup_done		"There isn't a planet"
settexttrigger		cleanup_done2		:cleanup_end		"Land on which planet"
settextlinetrigger	cleanup_planet		:cleanup_planet		"   <"
setdelaytrigger		cleanup_fail		:cleanup_fail     	5000
pause

:cleanup_fail
killalltriggers
send "        **   "
echo "**" & $taglineb & ansi_15 & "GoSub :SCAN_PLANET Timed Out**"
halt

:cleanup_end
killalltriggers
send "Q*"
goto :cleanup_done

:cleanup_planet
killalltriggers
setvar $temp currentline
gettext $temp $planet "<" ">"
striptext $planet " "
getwordpos $temp $pos ">"
cuttext $temp $pinfo ($pos + 2) 999
getword $pinfo $cpname 1
getlength $pname $plen
cuttext $cpname $cptest 1 $plen
if ($cptest = $pname)
	send $planet & "*"
	goto :cleanup_landed
elseif ($planet_scanner = "Yes") and ($gopop_cleanall = "yes")
	getwordpos $temp $pos ">"
	cuttext $temp $pinfo ($pos + 2) 999
	getwordpos $pinfo $plvl "        None"
	if ($plvl > 0)
		send $planet & "*"
		goto :cleanup_landed
	end
end
goto :cleanuploop

:cleanup_landed
killalltriggers
gosub :getplaninfo

if ($player~fighters > $gopop_blowfigs)
	if ($planetfuelcolos > 0) or ($planetorgcolos > 0) or ($planetequipcolos > 0)
		if ($debug = true)
			echo "*Planet has colos, leavin that shit alone!*"
		end
		send "q"
	else
		if ($debug = true)
			echo "*No colos, blowin that shit*"
		end
		gosub :blowplanet
	end
end
goto :cleanup2

:cleanup_done
return

:checkplanetsafety
setvar $shielded 0
setvar $notours 0
send "d"
waiton "Planets : "
setvar $cnum 4
goto :gotplanet2

:cplanetloop
settextlinetrigger gotshielded :gotshielded "<<<<"
settextlinetrigger gotplanet :gotplanet "          ("
settextlinetrigger endplanets :endplanets "Ships   : "
settextlinetrigger endplanets2 :endplanets "Traders : "
settexttrigger endplanets3 :endplanets "Fighters: "
pause

:gotshielded
killalltriggers
setvar $shielded 1
goto :cplanetloop

:gotplanet
setvar $cnum 2

:gotplanet2
killalltriggers
getword currentline $gpname $cnum
getwordpos $gpname $pos $pname
if ($pos < 1)
	setvar $notours 1
end
goto :cplanetloop

:endplanets
killalltriggers
waiton "Command [TL"

if ($debug = true)
	echo "*gotshielded " $shielded " notours " $notours "*"
end
return

##################################################################################################################################
:stats
if ($player~unlimitedgame = false)
	setvar $turnsused $start_turns
	subtract $turnsused $player~turns
end
if ($portcash = 0) or ($portscashed = 0) or ($turnsused = 0)
	setvar $cashperturn 0
	setvar $cashperport 0
else
	setvar $cashperturn $portcash
	divide $cashperturn $turnsused
	setvar $cashperport $portcash
	divide $cashperport $portscashed
end
if ($debug = true)
	if ($oremcic > 0)
		setvar $oremcicavg $oremcic
		divide $oremcicavg $oremcicnum
	end
	if ($orgmcic > 0)
		setvar $orgmcicavg $orgmcic
		divide $orgmcicavg $orgmcicnum
	end
	if ($equmcic > 0)
		setvar $equmcicavg $equmcic
		divide $equmcicavg $equmcicnum
	end
end
gosub :timecalc
if ($elapsedmm > 0)
	setvar $totalsec ($elapsedmm * 60)
end
add $totalsec $elapsedss
setprecision 2
if ($portscashed = 0) or ($totalsec = 0)
	setvar $portspersec 0
else
	setvar $portspersec ($portscashed / $totalsec)
end
setprecision 0
if ($portcash = 0) or ($totalsec = 0)
	setvar $cashpersec 0
else
	setvar $cashpersec ($portcash / $totalsec)
end
if ($hagglestotal > 0)
	setprecision 2
	setvar $hagglepct (($hagglesuccesses / $hagglestotal) * 100)
	setprecision 0
else
	setvar $hagglepct 0
end
setvar $runtime $elapsedhours & ":" & $elapsedminutes & ":" & $elapsedseconds
#setVar $runtime $elapsedMM & ":" & $elapsedSS
#setvar $infostr $portscashed & " ports for " & $portcash & " credits in " & $turnsused
#setvar $infostr $infostr & " turns (" & $cashperturn & "/turn) (" & $cashperport & "/port)"
setvar $infostr $portscashed & " ports for " & $portcash & " credits in "
setvar $infostr $infostr & $runtime & "*'Used " & $turnsused & " turns"
setvar $infostr $infostr & " (" & $cashperturn & "/turn) (" & $cashperport & "/port)"
setvar $infostr $infostr & " (" & $cashpersec & "/second)"

return

##################################################################################################################################
:updatemonitor
if ($gopop_monitor = "yes")
	if ($player~unlimitedgame = 1)
		setvar $player~turnsout "unlimited"
	else
		setvar $player~turnsout $player~turns
	end
	if ($gopop_moves > 0) and ($portscashed > 0)
		setprecision 2
		setvar $movesperport ($gopop_moves / $portscashed)
		setprecision 0
	end
	setvar $exploredtotal ($exploredsectors + $exploredstart)
	if ($exploredsectors > 0)
		setprecision 2
		setvar $exploredpct (($exploredtotal / sectors) * 100)
		setprecision 0
	end
	setvar $val $portcash
	gosub :formatnumber
	setvar $d_portcash $num
	setvar $val $cashperport
	gosub :formatnumber
	setvar $d_cashperport $val
	setvar $val $cashperturn
	gosub :formatnumber
	setvar $d_cashperturn $val
	setvar $val $cashpersec
	gosub :formatnumber
	setvar $d_cashpersec $val
	setvar $val $exploredsectors
	gosub :formatnumber
	setvar $d_exploredsectors $val

	setvar $gpm~msg "Cashed " & $portscashed & " ports for " & $d_portcash
	setvar $gpm~msg $gpm~msg & " credits**"
	setvar $gpm~msg $gpm~msg & "Turns Remaining     : " & $player~turnsout & "*"
	setvar $gpm~msg $gpm~msg & "Planets Left (est)  : " & $game_planets & "*"
	if ($navmode = 3)
		setvar $gpm~msg $gpm~msg & "Twarp Only Targets	  : " & $twarpports_cnt & "*"
	end
	setvar $gpm~msg $gpm~msg & "------------------------------------------------------------*"
	setvar $gpm~msg $gpm~msg & "Runtime             : " & $runtime & "*"
	setvar $gpm~msg $gpm~msg & "Turns Used          : " & $turnsused & "*"
	setvar $gpm~msg $gpm~msg & "Moves per Port      : " & $movesperport & "*"
	setvar $gpm~msg $gpm~msg & "Cash per Port       : " & $d_cashperport & "*"
	setvar $gpm~msg $gpm~msg & "Cash per Turn       : " & $d_cashperturn & "*"
	setvar $gpm~msg $gpm~msg & "Cash per Second     : " & $d_cashpersec & "*"
	setvar $gpm~msg $gpm~msg & "Haggles             : " & $hagglestotal & "*"
	setvar $gpm~msg $gpm~msg & "Haggle Pct          : " & $hagglepct & "%*"
	setvar $gpm~msg $gpm~msg & "------------------------------------------------------------*"
	setvar $gpm~msg $gpm~msg & "Explored Sectors    : " & $d_exploredsectors & " (" & $exploredpct & "%)*"
	setvar $gpm~msg $gpm~msg & "Upgraded Ports      : " & $upgradedports & "*"
	setvar $gpm~msg $gpm~msg & "Enemies Fotoned     : " & $fotonsfired & "*"
	setwindowcontents status $gpm~msg
end
return

:formatnumber
isnumber $test $val
if ($test < 1)
	return
end
if ($val < 1000)
	return
end
setvar $num ""
getlength $val $len
setvar $div ($len / 3)
setvar $rem ($len - ($div * 3))
if ($rem > 0)
	cuttext $val $num 1 $rem
	setvar $num $num & ","
end
cuttext $val $val ($rem + 1) 999
getlength $val $len
while ($len > 3)
	cuttext $val $tmp 1 3
	setvar $num $num & $tmp & ","
	cuttext $val $val 4 999
	getlength $val $len
end
setvar $num $num & $val
setvar $val $num
return

##################################################################################################################################
:upgradeport
gosub :player~quikstats
if ($player~credits < 2500000)
	return
end

send "o3"
settexttrigger upgradeunits :upgradeunits "How many units"
pause

:upgradeunits
getword currentline $units 9
striptext $units "("
if ($units = 0)
	send "0*"
	waiton "Command [TL"
	return
end

setvar $unitcost ($units * 900)

if (($player~credits - $unitcost) < 1000000)
	send "0*"
	waiton "Command [TL"
else
	send $units "*"
	waiton "For upgrading this StarPort"
	getword currentline $expup 7
	add $player~experience $expup
	send "q"
	waiton "Command [TL"
	add $upgradedports 1
end

return

##################################################################################################################################
:furb
gosub :player~quikstats
setvar $lastwarp $player~current_sector

killalltriggers
send "c"
waiton "Computer command [TL="
settextlinetrigger dockgood :dockgood "Commerce report for Stargate"
settextlinetrigger dockbad :dockbad "I have no information"
send "r" & $map~stardock & "*"
pause

:dockbad
killalltriggers
send "q"
waiton "Command [TL"
echo "Those fucknuts blew up stardock! Halting.*"
goto :gpm_shutdown

:dockgood
killalltriggers
send "q"
waiton "Command [TL"
#send "z*"
#waiton "Do you want"

if ($player~current_sector = $map~stardock)
	goto :indock
end

#send "q q * "

setvar $furbmode 1
getdistance $dist $player~current_sector $map~stardock

if ($dist = 1)
	setvar $msec $map~stardock
	gosub :trymove
	if ($movegood = 0)
		gosub :cleardockavoid
		gosub :trymove
		if ($movegood = 0)
			setvar $switchboard~message "Unable to furb, halting!*"
			gosub :switchboard~switchboard
			goto :gpm_shutdown
		end
	end
	goto :indock
elseif ($player~twarp_type = "No")
	if ($gopop_mowbd = "yes")
		gosub :setavoidbd
		setvar $msec $map~backdoor
		setvar $fails 0
		gosub :trymow
		gosub :unavoidbd
	end

	:mowdock
	setvar $msec $map~stardock
	gosub :trymow
	if ($mowgood = 0)
		setvar $switchboard~message "Unable to furb, halting!*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
	goto :indock
else
	if ($player~alignment > 1000)
		setvar $warpto $map~stardock
		setvar $player~warpto $warpto
		gosub :move~twarp
		if ($player~twarpsuccess = true)
			goto :indock
		else
			gosub :cleardockavoid
			setvar $player~warpto $warpto
			gosub :move~twarp
			if ($player~twarpsuccess = true)
				goto :indock
			else
				setvar $switchboard~message "Unable to furb, halting!*"
				gosub :switchboard~switchboard
				goto :gpm_shutdown
			end
		end
	else
		if ($gopop_twarpbd = "yes")
			setvar $warpto $map~backdoor
			setvar $player~warpto $warpto
			gosub :move~twarp
			if ($player~twarpsuccess = true)
				setvar $msec $map~stardock
				gosub :trymove
				if ($movegood = 1)
					goto :indock
				end
			end
		end
		if ($gopop_mowbd = "yes")
			gosub :setavoidbd
			setvar $msec $map~backdoor
			gosub :trymow
			gosub :unavoidbd
			if ($mowgood = 1)
				setvar $msec $map~stardock
				gosub :trymove
				if ($movegood = 1)
					goto :indock
				else
					setvar $switchboard~message "Unable to furb, halting!*"
					gosub :switchboard~switchboard
				end
			end
		end
		setvar $warpto $map~stardock
		setvar $player~warpto $warpto
		gosub :move~twarp
		if ($player~twarpsuccess = true)
			goto :indock
		else
			setvar $switchboard~message "Unable to furb, halting!*"
			gosub :switchboard~switchboard
			goto :gpm_shutdown
		end
	end
end

# We made it to Stardock!
:indock
send "ps"

:ondock
killalltriggers
settextlinetrigger dock_haslimp :dock_haslimp "Do you want to pay the"
settexttrigger dock_nolimp :dock_nolimp "All systems secured"
pause

:dock_haslimp
killalltriggers
getword currentline $lrcost 9
striptext $lrcost ","
if ($lrcost < ($player~credits + $gopop_mincreds))
	subtract $player~credits $lrcost
	send "y"
end
waiton "Where to?"

:dock_nolimp
killalltriggers
#send "h"
waitfor "Where to?"

setvar $furbmode 0

# Make sure we end up with the minimum credits
subtract $player~credits $gopop_mincreds
setvar $freecreds $player~credits

if ($debug = true)
	echo "*initial credits: " $player~credits "*"
end

setvar $item_max 0

send "h"

# get price of scanners, if we don't have them

if ($cost_density_scanner < 1) or ($cost_holo_scanner < 1)
	send "r"
	waiton "The Holographic costs"
	getword currentline $cost_holo_scanner 4
	striptext $cost_holo_scanner ","
	savevar $cost_holo_scanner
	waiton "and the Density costs"
	getword currentline $cost_dens_scanner 5
	striptext $cost_dens_scanner ","
	savevar $cost_dens_scanner
	send "q"
	waiton "what are you looking for"
end

setvar $freecreds ($player~credits - $cost_holo_scanner)

:buytorps
# buy torps, saving enough for holo scanner
if ($player~genesis < $ship_max_genesis)
	setvar $item "t"
	gosub :buyitem
	add $player~genesis $buycount
end

# if we didn't get enough gentorps to run, try saving for dens scanner
if ($player~genesis < $game~max_planets_per_sector)
	setvar $freecreds ($player~credits - $cost_dens_scanner)
	setvar $item "t"
	gosub :buyitem
	add $player~genesis $buycount
end

# if we can't afford any torps, exit
if ($player~genesis < 1)
	setvar $switchboard~message "Unable to buy torps, halting!*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
end

# try to buy a holo scanner, if we can afford it
if ($player~scan_type = "None")
	settexttrigger holocost2 :holocost2 "The Holographic costs"
	settexttrigger haveholo :alreadygotholo "You don't need two!"
	settexttrigger canthaveholo :dontgotholo "Sorry, your ship can only carry"
	settexttrigger youtoopoorholo :dontgotholo "Sigh, another poor trader."
	settexttrigger gotholo :gotholo "We'll get that sent over"
	send "rh"
	pause

	:holocost2
	getword currentline $cost_holo_scanner 4
	striptext $cost_holo_scanner ","
	savevar $cost_holo_scanner
	pause

	:gotholo
	add $freecreds $cost_holo_scanner
	setvar $player~scan_type "Holo"
	waiton "You have"
	getword currentline $player~credits 3
	striptext $player~credits ","

	:dontgotholo
	:alreadygotholo
	killalltriggers
	waiton "So what are you"
end

# if no holo, we need at least a density scanner
if ($player~scan_type = "None")
	settexttrigger holocost :holocost "The Holographic costs"
	settexttrigger denscost :denscost "and the Density costs"
	settexttrigger havedens :alreadygotdens "You don't need two!"
	settexttrigger canthavedens :dontgotdens "Sorry, your ship is not equipped"
	settexttrigger yousuperpoor :dontgotdens "Sigh, another poor trader."
	settexttrigger gotdens :gotdens "We'll get that sent over"
	send "rd"
	pause

	:holocost
	getword currentline $cost_probe_scanner 4
	striptext $cost_holo_scanner ","
	savevar $cost_holo_scanner
	pause

	:denscost
	getword currentline $cost_dens_scanner 5
	striptext $cost_dens_scanner ","
	savevar $cost_dens_scanner
	pause

	:dontgotdens
	killalltriggers
	setvar $switchboard~message "Can't buy density scanner, halting.*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown

	:gotdens
	add $freecreds $cost_dens_scanner
	setvar $player~scan_type "Dens"
	waiton "You have"
	getword currentline $player~credits 3
	striptext $player~credits ","

	:alreadygotdens
	waiton "So what are you"
end

if ($player~twarp_type = "No")
	send "w"
	settexttrigger canthavetw :dontgotone "Sorry, your ship is not equipped"
	settexttrigger maybetw :maybetw "just bring back the unused portion"
	pause

	:maybetw
	killalltriggers
	waiton "TransWarp a single ship"
	getword currentline $twcost 8
	striptext $twcost ","
	settexttrigger haveit :gotone "You don't need two!"
	settexttrigger canthaveit :dontgotone "Sorry, your ship is not equipped"
	settexttrigger youpoor :dontgotone "Sigh, another poor trader."
	settexttrigger gotone :gotone "you'll need lots of"
	send "1"
	pause

	:gotone
	setvar $player~twarp_type 1
	waiton "You have"
	getword currentline $player~credits 3
	striptext $player~credits ","

	:dontgotone
	:alreadygottw
	killalltriggers
end

if ($player~alignment >= 500) and ($player~alignment < 1000)
	send "Q P A    Q H"
end

# buy atomics
if ($gopop_blowmax = "yes") or ($gopop_cleanup = "yes")
	setvar $item "a"
	gosub :buyitem
end

# buy probes
if ($gopop_useprobes = "yes")
	setvar $item "e"
	gosub :buyitem
end

# buy planet scanner
if ($player~planet_scanner <> "Yes")
	send "f"
	settexttrigger canthaveps :dontgotps "Sorry, your ship is not equipped"
	settexttrigger maybeps :maybeps "I can let you have one"
	pause

	:maybeps
	getword currentline $pscost 8
	striptext $pscost ","
	killalltriggers
	settexttrigger haveps :haveps "You don't need two!"
	settexttrigger youtoopoorps :dontgotps "Sigh, another poor trader."
	settexttrigger gotps :gotps "We'll get that installed"
	send "y"
	pause

	:gotps
	setvar $planet_scanner "Yes"
	waiton "You have"
	getword currentline $player~credits 3
	striptext $player~credits ","

	:haveps
	:dontgotps
	killalltriggers
end

setvar $inshipyards 0
setvar $player~shieldsbought 0

if ($player~total_holds < $ship_max_holds) and ($player~twarp_type <> "No")
	send "q s p"
	waiton "Cargo holds"
	getword currentline $item_cost 5
	getword currentline $canbuy 10

	:priceholds
	waiton "Which item do you"
	send "a"
	waiton "How many Cargo Holds"
	setvar $i 1
	setvar $lastprice $item_cost
	setvar $totalprice $item_cost
	while ($i < $canbuy)
		add $i 1
		multiply $lastprice "1.015"
		add $totalprice $lastprice
		if ($totalprice >= $player~credits)
			goto :finalbuycount
		end
	end

	:finalbuycount
	setvar $buycount $i
	send $buycount & "*"
	if ($buycount > 0)
		waiton "The cost for"
		getword currentline $costfor $8
		if (($player~credits - $costfor) < 1)
			subtract $canbuy 1
			send "n"
			goto :priceholds
		end
		send "y"
	end
	waiton "You have"
	getword currentline $player~credits 3
	striptext $player~credits ","
	setvar $inshipyards 1
end

# keep track of credits for transfer at dock
if ($cashdrop <> "no") and ($gopop_xferpct > 0)
	setvar $freecreds $player~credits
	setprecision 2
	setvar $pct "0." & $gopop_xferpct
	multiply $freecreds $pct
	setprecision 0
	getwordpos $freecreds $pos "."
	if ($pos > 0)
		cuttext $freecreds $freecreds 1 ($pos - 1)
	end

	if ($debug = true)
		echo "*Done buying mandatory items, remaining free credits = " $freecreds " credits = " $player~credits "*"
		echo "Cash drop percentage = " $gopop_xferpct "*"
	end
else
	setvar $freecreds $player~credits
end

if ($inshipyards = 1)
	send "q q h "
	setvar $inshipyards 0
end

# buy mines
if ($gopop_buymines = "yes") and ($player~armids < $ship~ship_mines_max)
	setvar $item "m"
	gosub :buyitem
end

# buy limps
if ($gopop_buylimps = "yes")
	setvar $item "l"
	gosub :buyitem
end

# buy disruptors
if ($gopop_buydisr = "yes")
	setvar $item "s"
	gosub :buyitem
end

# buy figs
if ($gopop_buyfigs = "yes") and ($player~fighters < $ship~ship_fighters_max)
	if ($inshipyards = 0)
		send "q s p"
		setvar $inshipyards 1
	end
	send "?"
	waiton "Fighters"
	setvar $temp currentline
	getword $temp $item_cost 4
	getword $temp $canbuy 8
	setvar $item "b"
	gosub :buy_shipyards
end

# buy shields
if ($gopop_buyshields = "yes") and ($player~shields < $ship~ship_shield_max)
	if ($inshipyards = 0)
		send "q s p"
		setvar $inshipyards 1
	end
	send "?"
	waiton "Shield Points"
	getword currentline $item_cost 5
	getword currentline $canbuy 9
	setvar $item "c"
	gosub :buy_shipyards
end

if ($inshipyards = 1)
	send "q "
	setvar $inshipyards 0
end

send "q"
waitfor "<StarDock>"

#if ($debug = TRUE) and ($Gopop_CashDrop <> "no")
#	echo "*Done buying optional items, free credits remaining = " $freecreds "*"
#	echo "Cash drop amount = " $PLAYER~CREDITS "*"
#end

setvar $player~ondock 1

#
# return logic:
# if we started on dock, do nothing
# if we have a twarp drive, try to twarp back
# if no twarp, get 3 hops away, near an adjacent if possible
#
if ($lastwarp = $map~stardock)
	send "q"
	goto :main
elseif ($player~twarp_type <> "No")
	#if ($furb_return = 1)
	setvar $warpto $lastwarp
	setvar $player~warpto $warpto
	gosub :move~twarp
	if ($player~twarpsuccess = true)
		goto :returndone
	end
	setvar $target $lastwarp
	gosub :removefigfromdata
	gosub :player~quikstats
	setvar $thiswarp $player~current_sector
	gosub :trywarpport
	if ($warpgood = 1)
		setvar $lastwarp $thiswarp
		setvar $thiswarp $port
		goto :dothissector
	end
	if ($navmode < 3)
		gosub :tryadjwarp
		if ($warpgood = 1)
			setvar $lastwarp $thiswarp
			goto :main
		end
	end
else
	setvar $i 0
	getnearestwarps $getnear $map~stardock

	setvar $bestmove 0
	setvar $bestweight 0
	setvar $moveweight 0

	# try to get at least three hops out
	while ($i < $getnear)
		add $i 1
		setvar $msec $getnear[$i]
		getdistance $dist stardock $msec
		setvar $moveweight 5
		if ($dist >= 3)
			setvar $warp_cnt 0
			if ($tries = 99999)

				add $warp_cnt 1
				setvar $nwarp sector.warps[$getnear[$i]][$warp_cnt]
				if (sector.explored[$getnear[$i]] = "YES")
					add $moveweight 2
				else
					subtract $moveweight 1
				end
			end
			if ($dist > 3)
				add $moveweight $dist
			end
			if ($bestweight = 0) or ($moveweight < $bestweight)
				setvar $bestmove $getnear[$i]
				setvar $bestweight $moveweight
			end
		end
	end

	if ($bestmove > 0)
		setvar $msec $bestmove
		gosub :trymow
		if ($mowgood = 1)
			goto :main
		end
	end
end

setvar $switchboard~message "Failed to return after furbing!*"
gosub :switchboard~switchboard
gosub :current_prompt
if ($player~current_prompt = "Command")
	send "ps"
end
goto :wrapup

:returndone
gosub :player~quikstats
#send "z*"
#waiton "Do you want"
waiton "Command [TL"

return

##################################################################################################################################
:buyship
send "sbny"
waiton "Which ship are you interested in"
send $buyship_letter
settextlinetrigger bs_cantafford :bs_cantafford "You can not afford it!"
settexttrigger bs_wantit :bs_wantit "Want to buy it?"
pause

:bs_cantafford
return

:bs_wantit
send "yc"
waiton "What do you want to name this ship?"
getrnd $rnd_ship 10000 99999
setvar $ship_name "Mayhem" & $rnd_ship
send $ship_name "*n*"
waiton "Your option"
goto :gpm_shutdown

##################################################################################################################################
:fedcomoff
send "cn"
waiton "Federation comm-link"
getword currentline $fedon 5
if ($fedon = "On")
	send "5"
end
send "qq"
waiton "Command [TL"
return

##################################################################################################################################
:xfermacro
if ($corp_num = 0)
	setvar $corp_num $player~corp
end
setvar $target_name " " & $gopop_cashdrop & " [" & $corp_num & "], w/"
setvar $firstskip 0
setvar $skip ""
setvar $gpm~dockmacro ""

send "qd"
waiton "Sector  :"
waiton "Traders :"
setvar $temp currentline
getwordpos $temp $pos $target_name
if ($pos > 0)
	setvar $skip ""
	goto :xfercash_send
else
	setvar $skip " n"
end

setvar $corp_trigger "[" & $corp_num & "], w/"

settextlinetrigger dscan_ships :dscan_done "Ships   :"
settextlinetrigger dscan_fighters :dscan_done "Fighters: "
settextlinetrigger dscan_mines :dscan_done "Mines   :"
settextlinetrigger dscan_navhaz :dscan_done "NavHaz  :"
settexttrigger dscan_warps :dscan_done "Warps to Sector(s) : "
settexttrigger dscan_corp :dscan_corp $corp_trigger
pause

:dscan_corp
setvar $temp currentline
if ($firstskip)
	setvar $skip $skip & " n"
else
	setvar $firstskip 1
end
getwordpos $temp $pos $target_name
if ($pos > 0)
	goto :xfercash_send
end
settexttrigger dscan_corp :dscan_corp $corp_trigger
pause

:dscan_done
killalltriggers
setvar $gpm~dockmacro "q "
send "ps"
return

:xfercash_send
killalltriggers
setvar $gpm~dockmacro "q t c " & $skip & " y q z t " & $cash & "* q"
send "ps"
return

##################################################################################################################################
:cleardockavoid
send "^C" & $map~stardock & "*q"
waiton "ENDINTERROG"
return

##################################################################################################################################
:setavoidbd
send "^"
setvar $i 0
while ($i < sector.warpcount[$map~stardock])
	add $i 1
	if (sector.warps[$map~stardock][$i] <> $map~backdoor)
		send "S" & sector.warps[$map~stardock][$i] & "*"
	end
end
send "q"
waiton "ENDINTERROG"
return

##################################################################################################################################
:unavoidbd
send "^"
setvar $i 0
while ($i < sector.warpcount[$map~stardock])
	add $i 1
	send "C" & sector.warps[$map~stardock][$i] & "*"
end
send "q"
waiton "ENDINTERROG"
return

##################################################################################################################################
:buyitem
settexttrigger buycost :buycost "credits"
settexttrigger buyprompt :buyprompt "How many"
settexttrigger notequipped :notequipped "your ship is not equipped"
send $item
pause

:buycost
gettext currentline $temp " " " credits"
getlength $temp $len
setvar $l 3

:buyitem_findstart
cuttext $temp $test ($len - $l) 1
if ($test = " ")
	subtract $l 1
	cuttext $temp $item_cost ($len - $l) 999
else
	add $l 1
	goto :buyitem_findstart
end
striptext $item_cost ","
pause

:buyprompt
killalltriggers
setvar $line currentline
gettext $line $max "(Max " ")"
striptext $max ","
if ($item_max > 0) and ($max > $item_max)
	setvar $max $item_max
end
if ($freecreds > 0)
	setvar $myfreecreds $freecreds
else
	send "0*"
	return
end
setvar $buycount ($myfreecreds / $item_cost)
if ($buycount > $max)
	setvar $buycount $max
end
send $buycount & "*"
waiton "You have"
getword currentline $player~credits 3
striptext $player~credits ","
waitfor "?)"
if ($buycount > 0)
	if ($freecreds > 0)
		subtract $freecreds ($max * $item_cost)
	end
end

:notequipped
return

##################################################################################################################################
:buy_shipyards
send "p"

waiton "Which item do you"
send $item
waiton "How many"
setvar $line currentline
gettext $line $canbuy "(Max " ")"
striptext $canbuy ","
if ($item_max > 0) and ($canbuy > $item_max)
	setvar $canbuy $item_max
end
if ($freecreds > 0)
	setvar $myfreecreds $freecreds
else
	send "0*"
	return
	#setvar $myfreecreds $PLAYER~CREDITS
end
setvar $buycount ($myfreecreds / $item_cost)
if ($buycount > $canbuy)
	setvar $buycount $canbuy
end
send $buycount & "*"
waiton "You have"
getword currentline $temp 3
striptext $temp ","
setvar $prodcost ($player~credits - $temp)
if ($freecreds > 0)
	subtract $freecreds $prodcost
end
setvar $player~credits $temp
#echo "*post buy credits " $PLAYER~CREDITS " freecreds " $freecreds " prodcost " $prodcost "*"
waitfor "?)"
if ($buycount > 0)
	if ($freecreds > 0)
		subtract $freecreds ($canbuy * $item_cost)
	end
end
return

##################################################################################################################################
:getplaninfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $planetfuel $planet~planetfuel
setvar $planetorg $planet~planetorg
setvar $planetequip $planet~planetequip
setvar $planetfig $planet~planetfig
setvar $citadel $planet~citadel
setvar $citadelcredits $planet~citadel_credits
setvar $fueltosell $planet~planetfuel
setvar $orgtosell $planet~planetorg
setvar $equiptosell $planet~planetequip
return

##################################################################################################################################
:planetneg
setvar $neg_success 0
setvar $fuelsold 0
setvar $orgsold 0
setvar $equsold 0

setvar $planethaggle~_ck_pnego_fueltosell $fueltosell
setvar $planethaggle~_ck_pnego_orgtosell $orgtosell
setvar $planethaggle~_ck_pnego_equiptosell $equiptosell

setvar $planet~planet $planet
setvar $planethaggle~oreprofit 0
setvar $planethaggle~orgprofit 0
setvar $planethaggle~equprofit 0

send "l " & $planet & "*"
waiton "Planet command"
setvar $player~current_prompt "Planet"
gosub :planethaggle~planetneg

if ($planethaggle~oreprofit > 0)
	setvar $neg_success 1
	setvar $fuelsold $planethaggle~_ck_pnego_fueltosell
end
if ($planethaggle~orgprofit > 0)
	setvar $neg_success 1
	setvar $orgsold $planethaggle~_ck_pnego_orgtosell
end
if ($planethaggle~equprofit > 0)
	setvar $neg_success 1
	setvar $equsold $planethaggle~_ck_pnego_equiptosell
end

gosub :player~currentprompt
if ($player~current_prompt = "Planet")
	send "q "
	waiton "Command [TL"
	setvar $player~current_prompt "Command"
end

if ($buysell[equipment] = "BUYING")
	getsectorparameter $port "EQUMCIC" $mcic
	if ($gopop_upgradeequ = "yes") and ($mcic <= $gopop_upgrademcic)
		gosub :upgradeport
	end
end

return

##################################################################################################################################
:current_prompt
gosub :player~currentprompt
setvar $current_prompt $player~current_prompt
return

##################################################################################################################################
:checkstartingprompt
setvar $bot~validprompts $validprompts
gosub :player~checkstartingprompt
return

##################################################################################################################################
:getshipstats
gosub :ship~getshipstats
setvar $ship_max_attack $ship~ship_max_attack
return

##################################################################################################################################
:pop_planet
getrnd $rnd3 10000 99999

subtract $player~turns 1
add $turnsused 1
send "u"
waiton "Do you wish to launch"
send "y "
settextlinetrigger nooverload	:nooverload 	"What do you want to name this planet?"
#setTExtLineTrigger NeedGenTs	:NeedGenTs 	"You don't have any Genesis Torpedoes to launch!"
settexttrigger overload 	:overload 	"Do you wish to abort?"
settextlinetrigger yikes	:yikes 		"I'm sorry, but not enough free matter exists."
settexttrigger yikes2		:yikes 		"Command [TL"
pause

:needgents
killalltriggers
waiton "shouldn't stop here"

:yikes
killalltriggers
echo "**Bad News - Game Maximum Planets Reached.**"
goto :gpm_shutdown

:overload
killtrigger overload
send "n "
pause

:nooverload
killalltriggers
subtract $player~genesis 1

setvar $temp (currentline & "!!@@##")
gettext $temp $lookingfor "(Class " ")!!@@##"
setvar $currentplanet ($planetname & $rnd3)

send $currentplanet "*"
settexttrigger makingitcorp		:makingitcorp	"Should this be a (C)orporate planet or (P)ersonal planet? "
settexttrigger letsgo			:letsgo 	"Command [TL="
pause

:makingitcorp
killalltriggers
send $plantype
return

:letsgo
killalltriggers
#send "cr*q *"
#waitfor "<Re-Display>"
#waitfor "Command [TL="
return

##################################################################################################################################
:getpnum
send "L"
settexttrigger  	scanning_landed     	:scanning_landed	"Landing sequence engaged..."
settextlinetrigger	scanning_for		:scanning_for		$currentplanet
setdelaytrigger		scanning_done		:scanning_done     	5000
pause

:scanning_done
killalltriggers
send "        **   "
echo "**" & $taglineb & ansi_15 & "GoSub :SCAN_PLANET Timed Out**"
halt

:scanning_for
killalltriggers
setvar $temp currentline
gettext $temp $planet "<" ">"
striptext $planet " "
waiton " <Q to abort> ?"
#Send $planet & "*   "
send "q* "
return

:scanning_landed
killalltriggers
waiton "Planet #"
getword currentline $planet 2
striptext $planet "#"
waiton "Planet command"
send "q "
#SetVar $PLAYER~CURRENT_PROMPT "Planet"
return

##################################################################################################################################
:land_on_planet
send "L"
settexttrigger  	scanning_landed    	:scanning_landed	"Landing sequence engaged..."
settextlinetrigger	scanning_for		:scanning_for		$currentplanet
setdelaytrigger		scanning_done		:scanning_done      5000
pause

:scanning_done
killalltriggers
send "        **   "
echo "**" & $taglineb & ansi_15 & "GoSub :SCAN_PLANET Timed Out**"
halt

:scanning_for
killalltriggers
setvar $temp currentline
gettext $temp $planet "<" ">"
striptext $planet " "
waiton " <Q to abort> ?"
send $planet & "*  "

:scanning_landed
killalltriggers
#WaitOn "Planet command"
setvar $player~current_prompt "Planet"
return

##################################################################################################################################
#:check_planets
#setvar $pcount 0

#Send "L"
#SetTextTrigger  	check_landed	:check_landed	"Landing sequence engaged..."
#SetTextLineTrigger	check_pnum	:check_pnum	"   <"
#settextlinetrigger	check_done	:check_done	"Land on which planet"
#pause

#:check_landed
#gettext CURRENTLINE $pnum "<" ">"
#striptext $pnum " "

#:check_pnum

#:check_done
#return
:removefigfromdata
setvar $player~target $target
if ($target > 0) and ($target <= sectors)
	setvar $figs[$target] 0
	setvar $blocked[$target] 1
	setvar $upgraded[$target] 0
end
gosub :player~removefigfromdata
return

##################################################################################################################################
:addfigtodata
setvar $player~target $target
gosub :player~addfigtodata
return

##################################################################################################################################
:killthetriggers
killalltriggers
return

# ======================     START MOMBOT TWARP SUBROUTINES      =================
:trytwarp
gosub :player~quikstats

if ($player~twarp_type = "No")
	return
end

setvar $startinglocation $player~current_prompt

isnumber $test $warpto
if ($test = false)
	setvar $gpm~msg "Sector must be entered as a number*"
	goto :twarpdone
end

if ($player~current_sector = $warpto)
	setvar $gpm~msg "Already in that sector!*"
	goto :twarpdone
elseif (($warpto <= 0) or ($warpto > sectors))
	setvar $gpm~msg "Destination sector is out of range!*"
	goto :twarpdone
end

setvar $lastwarp $player~current_sector
setvar $player~twarpsuccess false
setvar $original 0
setvar $target 0

if ($player~current_sector = $warpto)
	setvar $gpm~msg "Already in that sector!"
	goto :twarpdone
elseif (($warpto <= 0) or ($warpto > sectors))
	setvar $gpm~msg "Destination sector is out of range!"
	goto :twarpdone
end

# this is a kludge, check should be elsewhere but we'll use it for now
getdistance $dist $map~stardock $warpto
if ($dist <> "-1") and ($dist < 2) and ($furbmode = 0)
	setvar $gpm~msg "Too close to stardock!"
	setvar $blocked[$warpto] 1
	goto :twarpdone
end

setvar $furbmode 0

if ($player~twarp_type = "No")
	setvar $gpm~msg "No T-warp drive on this ship!"
	goto :twarpdone
end

# check adj's for Dock.. if present, then we don't need a jump sector.

if ($player~alignment < 1000)
	if (($warpto = $map~stardock) or ($warpto <= 10))
		setvar $weareadjdock false
		setvar $target $warpto
		setvar $a 1
		setvar $start_sector $player~current_sector
		while ($a <= sector.warpcount[$start_sector])
			setvar $adj_start sector.warps[$start_sector][$a]
			if ($adj_start = $target)
				setvar $weareadjdock true
			end
			add $a 1
		end
		setvar $red_adj 0
		if ($weareadjdock = false)
			gosub :findjumpsector
			if ($red_adj <> 0)
				setvar $original $warpto
				setvar $warpto $red_adj
			else
				waitfor "Command [TL="
				setvar $gpm~msg "Cannot Find Jump Sector Adjacent Sector " & $target & "."
				goto :twarpdone
			end
		end
	end
end

if ($red_adj <> 0)
	goto :twarp_lock
end

getlength $gpm~dockmacro $len
if ($len < 2)
	setvar $gpm~dockmacro "q "
end

#echo "**startinglocation** " $startinglocation "*"
if ($startinglocation = "Citadel")
	send "q t*t1* q q * c u y q mz" $warpto "*"
elseif ($startinglocation = "Planet")
	send "t*t1* q q * c u y q mz" $warpto "*"
elseif ($startinglocation = "<StarDock>") or ($ondock = 1)
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send $gpm~dockmacro & " mz" $warpto "*"
elseif ($player~current_sector = $map~stardock)
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send "mz" $warpto "*"
else
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send "c u y q mz" $warpto "*"
end
settexttrigger     there       :adj_warp       "You are already in that sector!"
settextlinetrigger adj_warp    :adj_warp       "Sector  : "&$warpto&" "
settexttrigger     locking     :locking        "Do you want to engage the TransWarp drive?"
settexttrigger     igd         :twarpigd       "An Interdictor Generator in this sector holds you fast!"
settexttrigger     noturns     :twarpphotoned  "Your ship was hit by a Photon and has been disabled"
settexttrigger     noroute     :twarpnoroute   "Do you really want to warp there? (Y/N)"
pause

:adj_warp
gosub :move~killtwarptriggers
send "z*"
goto :twarp_adj

:locking
gosub :move~killtwarptriggers
send "y"
settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
pause

:twarpnofuel
gosub :move~killtwarptriggers
setvar $gpm~msg "Not enough fuel for T-warp."
goto :twarpdone

:twarp_adj
gosub :move~killtwarptriggers
send "z* "
setvar $gpm~msg "That sector is next door, just plain warping."
setvar $player~twarpsuccess true
goto :twarpdone

:twarpnoroute
gosub :move~killtwarptriggers
send "n* z* "
setvar $gpm~msg "No route available to that sector!"
goto :twarpdone

:no_twarp_lock
gosub :move~killtwarptriggers
send "n* z* "
setvar $target $warpto
gosub :removefigfromdata
setvar $gpm~msg "No fighters at T-warp point!"
goto :twarpdone

:twarpigd
gosub :move~killtwarptriggers
setvar $gpm~msg "My ship is being held by Interdictor!"
goto :twarpdone

:twarpphotoned
gosub :move~killtwarptriggers
setvar $gpm~msg "I have been photoned and can not T-warp!"
goto :twarpdone

:twarp_lock
gosub :move~killtwarptriggers
setvar $target $warpto
gosub :addfigtodata
if ($warpto = $map~stardock)
	send "y ps"
else
	send "y "
end
setvar $gpm~msg "T-warp completed."
setvar $player~twarpsuccess true

:twarpdone
killalltriggers
add $gopop_moves 1
settexttrigger trytwarp_mined :trytwarp_mined "Mined Sector: Do you wish"
settexttrigger trytwarp_ok :trytwarp_ok "Command [TL"
pause

:trytwarp_mined
send "*"
pause

:trytwarp_ok
setvar $ondock 0
return

#if (($player~twarpsuccess = TRUE) AND (($original = $MAP~STARDOCK) OR ($original <= 10)))
#	send "* m "&$original&"*  za9999* * "
#end
#setvar $ondock 0
#if ($debug = TRUE)
setvar $switchboard~message $gpm~msg
gosub :switchboard~switchboard
#end
#return
:findjumpsector
setvar $i 1
setvar $red_adj 0
if ($onplanet = 1)
	send "q t*t1* q*"
end
while (sector.warpsin[$target][$i] > 0)
	setvar $red_adj sector.warpsin[$target][$i]
	if ($red_adj > 10)
		send "m " & $red_adj & "* y"
		settexttrigger twarpblind 			:twarpblind "Do you want to make this jump blind? "
		settexttrigger twarplocked			:twarplocked "All Systems Ready, shall we engage? "
		settextlinetrigger twarpvoided		:twarpvoided "Danger Warning Overridden"
		settextlinetrigger twarpadj			:twarpadj "<Set NavPoint>"
		pause

		:twarpadj
		gosub :killthetriggers
		send " * "
		return

		:twarpvoided
		gosub :killthetriggers
		send " N N "
		goto :tryingnextadj

		:twarplocked
		gosub :killthetriggers
		goto :sectorlocked

		:twarpblind
		gosub :killthetriggers
		send " N "
	end

	:tryingnextadj
	add $i 1
end

:noadjsfound
setvar $red_adj 0
return

:sectorlocked
return

# ======================    END MOMBOT TWARP SUBROUTINE     ==========================

#=================================== START MOW (MOW) ============================================
:trymow
setvar $mowgood false
setvar $figstodrop 1

setarray $mowcourse 80
gosub :player~quikstats
setvar $startinglocation $player~current_prompt

if ($startinglocation = "Citadel")
	send "q q "
elseif ($startinglocation = "Planet")
	send "q "
elseif ($startinglocation = "<StarDock>")
	send "q "
elseif ($startinglocation <> "Command")
	setvar $switchboard~message "Bad starting prompt, cannot mow!*"
	gosub :switchboard~switchboard
	return
end

if ($ship_max_attack <= 0)
	setvar $ship_max_attack 99991111
end

isnumber $number $msec
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	return
elseif (($msec <= 0) or ($msec > sectors))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	return
end

isnumber $number $figstodrop
if ($number <> true)
	setvar $figstodrop 1
else
	if ($figstodrop > 50000)
		setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
		gosub :switchboard~switchboard
		return
	elseif ($figstodrop > $player~fighters)
		setvar $switchboard~message "Fighters to drop cannot exceed total ship fighters.*"
		gosub :switchboard~switchboard
		return
	end
end

if ($ship_max_attack > $player~fighters)
	setvar $ship_max_attack 9999
end

gosub :getcourse
setvar $j 2
setvar $result "q q q * "

while ($j <= $courselength)
	add $gopop_moves 1
	subtract $player~turns $tpw
	setvar $result $result&"m  "&$mowcourse[$j]&"*   "
	if (($mowcourse[$j] > 10) and ($mowcourse[$j] <> $map~stardock))
		setvar $result $result&"za  "&$ship_max_attack&"* *  "
	end
	echo "figstodrop " $figstodrop " j " $j " mowcourse[$j] " $mowcourse[$j] "*"
	if (($figstodrop > 0) and ($mowcourse[$j] > 10) and ($mowcourse[$j] <> $map~stardock) and ($j > 2))
		setvar $result $result&"f "&$figstodrop&" * c d "
		setvar $target $mowcourse[$j]
		gosub :addfigtodata
	end
	if (($j >= $courselength) and ($mow_saveme = true) and ($figstodrop = 0))
		setvar $result $result&"f 1 * c d "
		setvar $target $mowcourse[$j]
		gosub :addfigtodata
	end
	if (($called = false) and ($mow_saveme = true) and ($j >= ($courselength-2)))
		setvar $result $result&"'"&$msec&"=saveme*  "
		setvar $called true
	end
	add $j 1
end

send $result

killalltriggers
gosub :player~quikstats

if ($player~current_prompt = "Planet")
	send "m * * * c s* "
end

if (($player~current_prompt = "<StarDock>") or ($player~current_prompt = "<Hardware"))
	setvar $switchboard~message "Safely on Stardock*"
	gosub :switchboard~switchboard
	setvar $mowgood true
end

if ($player~current_sector <> $msec)
	setvar $switchboard~message "Mow did not reach destination!*"
	gosub :switchboard~switchboard
	return
else
	setvar $switchboard~message "Mow completed.*"
	gosub :switchboard~switchboard
	setvar $mowgood true
end

return

:getcourse
setvar $sectors ""
settextlinetrigger sectorsnogo :sectorsnogo "Error - No route within"
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$msec&"*q"
pause

:sectorsnogo
killtrigger sectorlinetrig
send "n * q"
send "'Clear Voids and try again!*"
goto :nopath
pause

:sectorsline
killtrigger sectorlinetrig
killtrigger sectorlinetrig2
killtrigger sectorlinetrig3
killtrigger sectorlinetrig4
killtrigger donepath
killtrigger donepath2
setvar $line currentline
replacetext $line ">" " "
striptext $line "("
striptext $line ")"
setvar $line $line&" "
getwordpos $line $pos "So what's the point?"
getwordpos $line $pos2 ": ENDINTERROG"
if (($pos > 0) or ($pos2 > 0))
	goto :nopath
end
getwordpos $line $pos " sector "
getwordpos $line $pos2 "TO"
if (($pos <= 0) and ($pos2 <= 0))
	setvar $sectors $sectors & " " & $line
end
getwordpos $line $pos " "&$msec&" "
getwordpos $line $pos2 "("&$msec&")"
getwordpos $line $pos3 "TO"
if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	goto :gotsectors
else
	settextlinetrigger sectorlinetrig :sectorsline " > "
	settextlinetrigger sectorlinetrig2 :sectorsline " "&$msec&" "
	settextlinetrigger sectorlinetrig3 :sectorsline " "&$msec
	settextlinetrigger sectorlinetrig4 :sectorsline "("&$msec&")"
	settextlinetrigger donepath :sectorsline "So what's the point?"
	settextlinetrigger donepath2 :sectorsline ": ENDINTERROG"
end
pause

:gotsectors
setvar $sectors $sectors&" :::"
setvar $courselength 0
setvar $index 1

:keepgoing
getword $sectors $mowcourse[$index] $index
while ($mowcourse[$index] <> ":::")
	add $courselength 1
	add $index 1
	getword $sectors $mowcourse[$index] $index
end
return

:nopath
setvar $switchboard~message "No path to that sector, cannot mow!*"
gosub :switchboard~switchboard
return

# ======================     END MOW SUBROUTINES     ==========================
:safemow
:smow
gosub :killthetriggers
gosub :player~quikstats
if ($player~scan_type = "None")
	setvar $switchboard~message "Safe Mow can only be run when you have a long range scanner.*"
	gosub :switchboard~switchboard
	return
end
setvar $startinglocation $player~current_prompt
setvar $validprompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
gosub :checkstartingprompt
if ($startinglocation = "Command")
	gosub :getshipstats
elseif ($ship_max_attack <= 0)
	setvar $ship_max_attack 99991111
end
setvar $msec $parm1
isnumber $number $msec
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	return
elseif (($msec <= 0) or ($msec > sectors))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	return
end
if ($parm2 = "p")
	setvar $are_we_docking true
else
	if ($parm3 = "p")
		setvar $are_we_docking true
	else
		setvar $are_we_docking false
	end
end
setvar $figstodrop $parm2
isnumber $number $figstodrop
if ($number <> 1)
	if ($parm2 <> "p")
		setvar $switchboard~message "Fighters to drop entered is not a number, cannot mow!*"
		gosub :switchboard~switchboard
		return
	end
	setvar $figstodrop 0
elseif ($figstodrop > 50000)
	setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
	gosub :switchboard~switchboard
	return
end
if ($ship_max_attack > $player~fighters)
	setvar $ship_max_attack 9999
end
gosub :getcourse
setvar $j 3
setvar $result "q q q * "
setvar $issafe true
while (($j <= $courselength) and ($issafe))
	setvar $nextsafesector $mowcourse[$j]
	if ($player~scan_type = "Holo")
		send "sdsh"
	elseif ($player~scan_type = "Dens")
		send "sd"
	end
	gosub :player~quikstats
	setvar $minessafe ((sector.mines.quantity[$nextsafesector] <= 0) or (((sector.mines.owner[$nextsafesector] = "yours") or (sector.mines.owner[$nextsafesector] = "belong to your Corp"))))
	setvar $figssafe  ((sector.figs.quantity[$nextsafesector] <= 0) or (((sector.figs.owner[$nextsafesector] = "yours") or (sector.figs.owner[$nextsafesector] = "belong to your Corp"))))
	setvar $planetsafe ((sector.planetcount[$nextsafesector] <= 0) or (($nextsafesector = $map~stardock) or ($nextsafesector <= 10)))
	setvar $navhazsafe (sector.navhaz[$nextsafesector] <= 0)
	setvar $densitysafe (sector.density[$nextsafesector] <= 0)
	setvar $limpetssafe (sector.anomoly[$nextsafesector] = false) or ((((sector.limpets.owner[$nextsafesector] = "yours") or (sector.limpets.owner[$nextsafesector] = "belong to your Corp"))))
	if ($densitysafe or ($limpetssafe and $figssafe and $minessafe and $navhazsafe and $planetsafe))
		send "m "&$mowcourse[$j]&"* "
	else
		setvar $switchboard~message "Cannot safely move into sector " & $nextsafesector & "*"
		gosub :switchboard~switchboard
		return
	end
	if (($figstodrop > 0) and ($mowcourse[$j] > 10) and ($mowcourse[$j] <> $map~stardock) and ($j > 2))
		send "f "&$figstodrop&" * c d "
		setvar $target $mowcourse[$j]
		gosub :addfigtodata
	end
	add $j 1
end
setvar $docking_instructions ""
if ($are_we_docking)
	setvar $docking_instructions " p z t *"
	if ($msec = $map~stardock)
		setvar $docking_instructions " p z s g y g q h *"
	end
	send $docking_instructions
end
gosub :player~quikstats
if ($player~current_sector <> $msec)
	setvar $switchboard~message "Safe mow did not reach destination!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Safe mow completed.*"
	gosub :switchboard~switchboard
end
return
# ======================     END SAFE MOW SUBROUTINES     ==========================

# Includes
include "source\include\player.ts"
include "source\include\move.ts"
include "source\include\ship.ts"
include "source\include\planet.ts"
include "source\include\planethaggle.ts"
include "source\include\loadvars.ts"
include "source\include\help.ts"
include "source\include\switchboard.ts"
include "source\include\game.ts"
include "source\include\map.ts"
include "source\include\sector.ts"
include "source\include\mines.ts"
include "source\include\xenter.ts"
