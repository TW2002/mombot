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

setvar $VERSION "5.00"
setvar $TAGLINE "Mayhem Corp GPM " & $VERSION

#setvar $DEBUG TRUE
setvar $DEBUG FALSE

gosub :LOADVARS~LOADVARS
loadvar $PLAYER~UNLIMITEDGAME

gosub :HELP~INITIALIZE

loadVar $MAP~STARDOCK
loadVar $MAP~home_sector
loadvar $ship~cap_file
loadvar $planet~planet_file
loadvar $game~port_max

setVar $HELP~HELP[1]  $HELP~TAB&"GPM (GoPop Moo) version 5.0 for TWX Proxy 3.0"
setVar $HELP~HELP[2]  $HELP~TAB&"Designed by Rider for Mayhem Corp in ICE 2019"
setVar $HELP~HELP[3]  $HELP~TAB&"Authors: Rider, Shadow and LoneStar    "
setVar $HELP~HELP[4]  $HELP~TAB&"    "
setVar $HELP~HELP[5]  $HELP~TAB&"Walks the universe, creates (pops) planets and sells off product for cash.  "
setVar $HELP~HELP[6]  $HELP~TAB&"    "
setVar $HELP~HELP[7]  $HELP~TAB&"Options: "
setVar $HELP~HELP[8]  $HELP~TAB&"         {corp} - Pop corporate planets instead of personal"
setVar $HELP~HELP[9]  $HELP~TAB&"      {skipore} - Doesn't keep popping planets until ore is gone"
setVar $HELP~HELP[10] $HELP~TAB&"      {skiporg} - Doesn't keep popping planets until organics are gone"
setVar $HELP~HELP[11] $HELP~TAB&"      {skipequ} - Doesn't keep popping planets until equipment is gone"
setVar $HELP~HELP[12] $HELP~TAB&"        {upequ} - Upgrade equipment port if MCIC is good"
setVar $HELP~HELP[13] $HELP~TAB&"        {probe} - Buy and use ether probes to find ports while cashing"
setVar $HELP~HELP[14] $HELP~TAB&"     {noaliens} - Avoid sectors with aliens in them"
setVar $HELP~HELP[15] $HELP~TAB&"      {buyfigs} - Buy fighters at dock if we have extra cash after furbing"
setVar $HELP~HELP[16] $HELP~TAB&"   {buyshields} - Buy shields at dock if we have extra cash after furbing"
setVar $HELP~HELP[17] $HELP~TAB&"    {twarponly} - Only use twarp to move, don't move to adjacent sectors"
setVar $HELP~HELP[18] $HELP~TAB&"       {window} - Open status window for dashboard summary"
gosub :HELP~HELPFILE

#gosub :combat~init 
#for auto kill on surround
#setvar $grid~kill true

setvar $switchboard~message $TAGLINE & " starting with " & $player~turns & " turns.*"
gosub :switchboard~switchboard

getSectorParameter SECTORS "FIGSEC" $isFigged
if ($MAP~STARDOCK = 0)
	if (STARDOCK > 0)
		setvar $MAP~STARDOCK STARDOCK
		savevar $MAP~STARDOCK
	else
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		goto :gpm_shutdown
	end
end

#if ($isFigged = 0)
#	setVar $SWITCHBOARD~message "It appears no grid data is available.  Run >figs and restart"
#	gosub :SWITCHBOARD~switchboard
#	goto :gpm_shutdown
#end

gosub :PLAYER~quikstats
setVar $startingLocation $PLAYER~CURRENT_PROMPT

getwordpos $bot~user_command_line $pos "corp"
if ($pos > 0)
	setVar $Gopop_PlanetType "Corp"
	setvar $plantype "c"
else
	setVar $Gopop_PlanetType "Pers"
	setvar $plantype "p"
end

getwordpos $bot~user_command_line $pos "skipore"
if ($pos > 0)
	setVar $Gopop_SellOre "no"
	setvar $sell_ore 0
else
	setVar $Gopop_SellOre "yes"
	setvar $sell_ore 1
end

getwordpos $bot~user_command_line $pos "skiporg"
if ($pos > 0)
	setVar $Gopop_SellOrg "no"
	setvar $sell_org 0
else
	setVar $Gopop_SellOrg "yes"
	setvar $sell_org 1
end

getwordpos $bot~user_command_line $pos "skipequ"
if ($pos > 0)
	setVar $Gopop_SellEqu "no"
	setvar $sell_equ 0
else
	setVar $Gopop_SellEqu "yes"
	setvar $sell_equ 1
end

getwordpos $bot~user_command_line $pos "upequ"
if ($pos > 0)
	setVar $Gopop_UpgradeEqu "yes"
	setvar $Gopop_UpgradeMCIC "-55"
else
	setVar $Gopop_UpgradeEqu "no"
end

getwordpos $bot~user_command_line $pos "probe"
if ($pos > 0)
	setVar $Gopop_UseProbes "yes"
else
	setVar $Gopop_UseProbes "no"
end

getwordpos $bot~user_command_line $pos "noaliens"
if ($pos > 0)
	setVar $Gopop_AvoidAliens "yes"
else
	setVar $Gopop_AvoidAliens "no"
end

getwordpos $bot~user_command_line $pos "window"
if ($pos > 0)
	setvar $Gopop_Monitor "yes"
	setvar $window true
else
	setvar $Gopop_Monitor "no"
	setvar $window false
end

getwordpos $bot~user_command_line $pos "buyfigs"
if ($pos > 0)
	setvar $Gopop_Buyfigs true
else
	setvar $Gopop_Buyfigs false
end

getwordpos $bot~user_command_line $pos "buyshields"
if ($pos > 0)
	setvar $Gopop_Buyshields true
else
	setvar $Gopop_Buyshields false
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
	setVar $SWITCHBOARD~message "Please pick a ship with no photons*"
	gosub :SWITCHBOARD~switchboard
	goto :gpm_shutdown
end

if ($window = TRUE)
	window status 500 275 $TAGLINE & " [" & GAMENAME & "]"  ONTOP
	gosub :updatemonitor
end

gosub :setup
gosub :ship~getshipstats

setvar $lastWarp $PLAYER~CURRENT_SECTOR
setvar $thisWarp $lastWarp

:main

gosub :PLAYER~QUIKSTATS

if (($PLAYER~UNLIMITEDGAME = FALSE) and ($player~turns <= ($BOT~BOT_TURN_LIMIT + 20)))
	setvar $switchboard~message "Out of turns, halting!*"
	gosub :switchboard~switchboard
	goto :wrapup
end

if ($PLAYER~CREDITS > 900000000)
  setvar $switchboard~message "I have too much cash on hand, exiting.*"
  gosub :switchboard~switchboard
  goto :wrapup
end

if ($PLAYER~GENESIS = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :PLAYER~QUIKSTATS
	
	If ($PLAYER~GENESIS = 0)
		setvar $switchboard~message "Unable to furb! Halting.*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

if (($navmode = 1) or ($navmode = 2))
	# scan adjacent sectors
	gosub :scan

	# Probe unexplored sectors for more data
	if ($Gopop_AlwaysProbe = "yes") and ($PLAYER~EPROBES > 0)
		if ($debug = TRUE)
			echo "Probe them bitches*"
		end

		setvar $probemove 0
		gosub :tryprobes
	end

	if ($debug = TRUE)
		echo "Best weight adjacent for sector " $thiswarp " = " $warp[$bestWarp] " (" $weight[$bestWarp] ")*"
	end

	if ($bestPort > 0)
		if ($debug = TRUE)
			echo "Best port for sector " $thiswarp " = " $warp[$bestPort] " (" $portvalue[$warp[$bestPort]] ")*"
			echo "Choosing best port over best warp*"
		end
		setvar $nextsec 0
		setvar $msec $warp[$bestPort]
		goto :movetoadj
	end
end

# in explore mode, skip the twarp stuff
if ($navmode = 2)
	goto :nav2
end

# If we don't have an adjacent port, see if we have a good twarpable port

if ($PLAYER~TWARP_TYPE <> "No")
	if ($debug = TRUE)
		echo "No good adjacent ports for " $thiswarp ", checking for good twarpable ports*"
	end

	gosub :trywarpport
	if ($warpgood = 1)
		if ($debug = TRUE)
			echo "Succesfully twarped to port " $port "*"
		end

		setvar $lastWarp $thisWarp
		setvar $thisWarp $port
		goto :dothissector
	end
end

# See if we have a twarpable adjacent to a good port

if ($PLAYER~TWARP_TYPE <> "No")
	if ($debug = TRUE)
		echo "Checking for twarpable sectors adjacent to good ports*"
	end

	gosub :tryadjwarp
	if ($warpgood = 1)
		setvar $lastWarp $thisWarp
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

if ($Gopop_UseProbes = "yes") and ($PLAYER~EPROBES > 0)
	if ($debug = TRUE)
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

if ($weight[$bestWarp] > 999)
	clientMessage "Script walled in!  Halted."
	goto :gpm_shutdown
else
	setvar $msec $warp[$bestWarp]
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
	getdistance $dist $PLAYER~CURRENT_SECTOR $msec
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

if ($Gopop_DisrMines = "yes") and (SECTOR.MINES.QUANTITY[$msec] > 0) and (SECTOR.MINES.OWNER[$msec] <> "yours") and (SECTOR.MINES.OWNER[$msec] <> "belong to your Corp") and ($PLAYER~MINE_DISRUPTORS >= 3)
	setvar $MINES~TARGET $msec
	setvar $MINES~SCANIT FALSE
	gosub :MINES~DISRUPT
end

getdistance $dist $PLAYER~CURRENT_SECTOR $msec
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
	subtract $turncount ($TPW * 1)
	setVar $lastWarp $thisWarp
	setvar $PLAYER~CURRENT_SECTOR $msec
	setVar $thisWarp $msec
	add $visits[$msec] 1
end

if ($nextsec > 0)
	goto :main
end

# we got here, either by twarp or move, let's try to sell it off
:dothissector

setvar $sector $thisWarp
setvar $port $thisWarp

# added by shadow - avoid unnecessary refigs
if ($figs[$thisWarp] < 1) and ($thiswarp > 10) and ($thiswarp <> $MAP~STARDOCK)

  if ($PLAYER~FIGHTERS > 1)
  	if (($Gopop_DropFigs * 10) < $PLAYER~FIGHTERS)
  		setvar $figstodrop $Gopop_DropFigs
  	elseif ($PLAYER~FIGHTERS > 20)
  		setvar $figstodrop 1
  	else
  		setvar $figstodrop 0
  	end
  end
  send "fz" & $figstodrop & "*cqd *"
  #waitfor "<Re-Display>"
  waitfor "Command [TL="
end
setvar $figs[$thisWarp] 1
setSectorParameter $thisWarp "FIGSEC" 1

gosub :minesector

if (PORT.EXISTS[$thisWarp] = 0) or ($thisWarp < 11) or ($thisWarp = $MAP~STARDOCK) or (PORT.CLASS[$thisWarp] = 0)
	if ($debug = TRUE)
		echo "No port in sector, looking for new warps.*"
	end
	goto :main
end

if ($portvalue[$thisWarp] < 1)
	setvar $port $thisWarp
	gosub :getportinfo
	gosub :setportval
	if ($debug = TRUE)
		echo "*SECTOR " $thisWarp " SCANNED PORT, value = " $portvalue[$thisWarp] "*"
	end
end

if ($debug = TRUE)
	echo "Found port in sector, value = " $portvalue[$thisWarp] "*"
end
	
# added by Shadow - make sure we gain align
if ($PLAYER~ALIGNMENT = 0) and ($PLAYER~CREDITS > 25000)
	killalltriggers
	send "o1"
	waiton "Upgrade Starport"
	send "20*q"
	waiton "Command [TL"
	setvar $PLAYER~ALIGNMENT 1
end

if ($Gopop_SellAllExisting = "yes") and (SECTOR.PLANETCOUNT[$port] > 0)
	gosub :selloff_planets
	add $portscashed 1
	setvar $movesinceport 0
end

# we have a port, run dopop
if ($portvalue[$thisWarp] > $min_portval)
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
setVar $i 0
while ($i < 6)
  add $i 1
  setVar $warp[$i] 0
  setVar $warpCount[$i] 0
  setVar $density[$i] "-1"
  setVar $weight[$i] 9999
  setVar $anom[$i] "No"
  #setVar $explored[$i] 1
end

# scan this sector
#setvar $line CURRENTLINE
#gettext $line $sector ":[" "]"

send "s"
if ($PLAYER~SCAN_TYPE = "Holo")
  send "d"
end

waitFor "Relative Density Scan"

# now we retrieve new warp info
setVar $i 1
setTextLineTrigger 1 :getWarp "Sector "
setTextTrigger 2 :gotWarps "Command [TL="
pause

:getWarp
setVar $line CURRENTLINE
stripText $line "("
getWord $line $warp 2
getWord $line $density 4
getWord $line $warpCount 7
getWord $line $anom 13
getLength $warp $length

cutText $warp $explored $length 1
if ($explored = ")")
  setVar $exploredsec 0
else
  setVar $exploredsec 1
end

stripText $warp ")"
stripText $density ","

setVar $warp[$i] $warp
setVar $density[$i] $density
setVar $warpCount[$i] $warpCount
setVar $anom[$i] $anom
#setVar $explored[$i] $explored

add $i 1
setTextLineTrigger 1 :getWarp "Sector "
pause

:gotWarps
killTrigger 1
killTrigger 2

# ok - now that we've got all our warp info, we need to use a weighting system with the sectors
# to determine which would be the best to warp into

setVar $i 1
setVar $bestWarp 1
setVar $bestPort 0
setvar $bestPortval 0
setVar $holo 0
setVar $incomputer 0
setVar $enemyfig 0
getdistance $currentDockDist $MAP~STARDOCK $PLAYER~CURRENT_SECTOR

while ($warp[$i] > 0)
	setVar $weight[$i] 0
	setVar $sector $warp[$i]
	setVar $port $warp[$i]
	
	getdistance $dist $MAP~STARDOCK $warp[$i]
	if ($warp[$i] = $MAP~STARDOCK) or ($warp[$i] = $MAP~BACKDOOR)
		if ($debug = TRUE)
			echo "S" $sector ": too close to stardock, avoiding*"
		end
		setvar $weight[$i] 1000
	elseif (($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK) and ($PLAYER~CURRENT_SECTOR <> $MAP~BACKDOOR)) and (($dist = 1) or ($dist = 2))
		# If we're already sitting on Dock's outer ring, allow moves that increase
		# our distance from Dock instead of falsely treating the sector as walled in.
		if ($currentDockDist = "-1") or ($currentDockDist > 2) or ($dist <= $currentDockDist)
			if ($debug = TRUE)
				echo "S" $sector ": too close to stardock, avoiding*"
			end
			setvar $weight[$i] 1000
		end
	end
		
	if ($visits[$sector] = 5)
		if ($debug = TRUE)
			echo "S" $sector ": visited 5 previous times (+100)*"
		end
		add $weight[$i] 100
		goto :nextwarp
	end
	
	if ($blocked[$sector] = 1)
		if ($debug = TRUE)
			echo "S" $sector ": marked as blocked previously, avoiding*"
		end
		add $weight[$i] 1000
		goto :nextwarp
	end
	
	# Avoid fedspace and dock
	if ($sector < 11) or ($sector = $MAP~STARDOCK) or ($sector = $MAP~ALPHACENTAURI) or ($sector = $MAP~RYLOS)
		if ($debug = TRUE)
			echo "S" $sector ": sector is in fedspace or special port, avoiding*"
		end
		add $weight[$i] 1000
		goto :nextwarp
	end
	
	if ($density[$i] = 0)
		# We really want ports, not empty sectors.
		add $weight[$i] 5
		if ($debug = TRUE)
			echo "S" $sector ": density of 0, skipping port checks*"
		end
		goto :endportcheck
	elseif ($PLAYER~SCAN_TYPE <> "Holo")
		# If we have no holo scanner, only go to sectors with density 100 or where we have figs.
		if ($density[$i] <> 100) and ($figs[$i] = 0)
			if ($debug = TRUE)
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
			if ($Gopop_AvoidAliens = "yes")
				if ($holoaliens > 0)
					setvar $a 0
					while ($a < $holoaliens)
						add $a 1
						if ($debug = TRUE)
							echo "S" $holo_aliensect[$a] ": alien traders present, avoiding*"
						end
						add $weight[$holo_aliensect[$a]] 1000
					end
				end
			end
		end
		
		# avoid enemy fighters
		if (SECTOR.FIGS.QUANTITY[$sector] <> 0)
			if (SECTOR.FIGS.OWNER[$sector] <> "yours") and (SECTOR.FIGS.OWNER[$sector] <> "belong to your Corp")	
				if (SECTOR.FIGS.QUANTITY[$sector] > $max_enemy_figs) or ($PLAYER~FIGHTERS < (SECTOR.FIGS.QUANTITY[$sector] * 2))
					if ($debug = TRUE)
						echo "S" $sector ": enemy figs present, avoiding*"
					end
					add $weight[$i] 1000
					goto :nextwarp
				else
					if ($debug = TRUE)
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
		if (SECTOR.NAVHAZ[$sector] > $Gopop_MaxHaz)
			if ($debug = TRUE)
				echo "S" $sector ": navhaz over limit, avoiding*"
			end
			add $weight[$i] 1000
			goto :nextwarp
		end
		
		# avoid enemy limps
		if ($Gopop_AvoidLimps = "yes")
			if (SECTOR.LIMPETS.QUANTITY[$sector] > 0) and (SECTOR.LIMPETS.OWNER[$sector] <> "yours") and (SECTOR.LIMPETS.OWNER[$sector] <> "belong to your Corp")
				if ($debug = TRUE)
					echo "S" $sector ": enemy limpets present, avoiding*"
				end
				add $weight[$i] 1000
				goto :nextwarp
			end
		end

		# avoid enemy mines
		if ($Gopop_AvoidMines = "yes")
			if (SECTOR.MINES.QUANTITY[$sector] > 0) and (SECTOR.MINES.OWNER[$sector] <> "yours") and (SECTOR.MINES.OWNER[$sector] <> "belong to your Corp")
				if ($debug = TRUE)
					echo "S" $sector ": enemy mines present, avoiding*"
				end
				add $weight[$i] 1000
				goto :nextwarp
			end
		end

		# avoid traders
		if (SECTOR.TRADERCOUNT[$sector] > 0)	
			if ($debug = TRUE)
				echo "S" $sector ": traders in sector, avoiding*"
			end
			add $weight[$i] 1000
			goto :nextwarp
		end
	end
	
	# port check
	if (PORT.EXISTS[$sector])
		setvar $port $sector
		gosub :checkportclass
		
		# Avoid class 0s (but tell my corpies about them)
		
		if ($pclass = 0)
			send "'GPM CLASS 0 " $PORT.NAME[$port] " SECTOR " $port "*"
			add $weight[$i] 1000
			goto :nextwarp
		end
		
		if ($goodport = 0)
			if ($debug = TRUE)
				echo "S" $sector ": undesirable port class (+5)*"
			end
			add $weight[$i] 5
			goto :endportcheck
		else
			if ($portscore > 20)
				if ($debug = TRUE)
					echo "S" $sector ": good port class (-" $portscore ")*"
				end
				subtract $weight[$i] $portscore
			end
		end
		
		if (SECTOR.EXPLORED[$sector] = "YES")
			# calculate port value
			if ($portvalue[$sector] < 1)
				if (SECTOR.FIGS.QUANTITY[$sector] <> 0) and (SECTOR.FIGS.OWNER[$sector] <> "yours") and (SECTOR.FIGS.OWNER[$sector] <> "belong to your Corp")
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
				if ($portvalue[$sector] > $bestPortval)
					if ($debug = TRUE)
						echo "S" $sector ": new best portval = " $portvalue[$sector] "*"
					end
					setvar $bestPortval $portvalue[$sector]
					setvar $bestPort $i
				else
					# avoid low value ports
					if ($debug = TRUE)
						echo "S" $sector ": low value port, possibly already cashed (+5)*"
					end
					add $weight[$i] 5
				end
			end
		end
	else
		# reduce the value of sectors with no port
		if ($debug = TRUE)
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
	if ($warpCount[$i] > 2)
		setvar $warpscore ($warpCount[$i] * 3)
	end
	subtract $exp_score $warpscore
	if ($debug = TRUE)
		echo "S" $sector ": sector has " $warpCount[$i] " warps (-" $warpscore ")*"
	end
	
	while ($warp_cnt < sector.warpcount[$sector])
		add $warp_cnt 1
		setvar $nwarp sector.warps[$sector][$warp_cnt]
		if (SECTOR.EXPLORED[$nwarp] <> "YES")
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
	
	if ($debug = TRUE)
		echo "S" $sector ": exploration weight = " $exp_score "*"
	end
	
	if ($sector = $lastWarp)
		# avoid going backwards, unless dead end
		if (SECTOR.WARPCOUNT[$lastWarp] > 1)
			add $weight[$i] 100
			if ($debug = TRUE)
				echo "S" $sector ": previously entered sector (+100)*"
			end
		end
	end
	
	# avoid dead ends
	if ($warpCount[$i] = 1)
		if ($debug = TRUE)
			echo "S" $sector ": dead end (+5)*"
		end
		add $weight[$i] 25
	end
	

	# make sure we have some random in there to stop it from
	# getting stuck
	getRnd $rand 1 5
	add $weight[$i] $rand
	
	if ($port > 0)
		if ($portvalue[$port] > 1) and ($debug = TRUE)
			echo "S" $sector ": port value = " $portvalue[$port] "*"
		end
	end
	
	# Show decisions
	if ($debug = TRUE)
		echo "S" $sector ": final weight = " $weight[$i] "*"
	end

	# find the best warp
	if ($weight[$i] < $weight[$bestWarp])
		if ($debug = TRUE)
			echo "S" $sector ": new lowest weight warp!*"
		end
		setVar $bestWarp $i
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

Send "L"
:selloff_loop
killalltriggers
SetTextTrigger  	selloff_landed  :selloff_landed "Landing sequence engaged..."
SetTextTrigger		selloff_pdone	:selloff_pdone	"Land on which planet"
SetTextTrigger		selloff_pdone2	:selloff_none	"There isn't a planet in this sector"
SetTextLineTrigger	selloff_planet	:selloff_planet	"   <"
Pause

:selloff_none
killalltriggers
return

:selloff_planet
KillAllTriggers
setvar $TEMP CURRENTLINE
gettext $TEMP $planet "<" ">"
striptext $planet " "
getwordpos $TEMP $pos ">"
cuttext $TEMP $pinfo ($pos + 2) 999
getwordpos $pinfo $plvl "        None"
if ($plvl > 0)
	add $selloff_count 1
	setvar $selloff_list[$selloff_count] $planet
end
goto :selloff_loop

:selloff_landed
KillAllTriggers
waiton "Planet #"
getword CURRENTLINE $planet 2
striptext $planet "#"
add $selloff_count 1
setvar $selloff_list[$selloff_count] $planet

:selloff_pdone
killalltriggers
send "Q*"

if ($selloff_count < 1)
	return
end

if ($debug = TRUE)
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
	if ($HOLDS_ORE < $HOLDS_TOTAL) and ($fueltosell > 50)
		setvar $pmacro "  T  N  T  1  *  "
	end
	setvar $pmacro $pmacro & "q"
	#send "o p t n t 1* q"
	send $pmacro
	waiton "Command [TL"
	
	if ($debug = TRUE)
		echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
		echo "orebuying " $BUYSELL[FUEL] " oretrading " $PORTQTY[FUEL] "*"
		echo "orgbuying " $BUYSELL[ORGANICS] " orgtrading " $PORTQTY[ORGANICS] "*"
		echo "equbuying " $BUYSELL[EQUIPMENT] " equtrading " $PORTQTY[EQUIPMENT] "*"
	end
	
	if ($sell_ore <> 1) or ($BUYSELL[FUEL] <> "BUYING") or ($PERCENT[FUEL] < 15)
		setVar $fueltosell 0
	end

	if ($sell_org <> 1) or ($BUYSELL[ORGANICS] <> "BUYING") or ($PERCENT[ORGANICS] < 15)
		setVar $orgtosell 0
	end

	if ($sell_equ <> 1) or ($BUYSELL[EQUIPMENT] <> "BUYING") or ($PERCENT[EQUIPMENT] < 15)
		setVar $equiptosell 0
	end

	if ($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0)
		if ($debug = TRUE)
			echo "Nothing to sell on planet " $planet ", skipping*"
			return
		end
	end

	if ($fueltosell > 0) or ($orgtosell > 0) or ($equiptosell > 0)
		if ($debug = TRUE)
			echo "Attempting to negotiate planet " $planet "*"
		end
		gosub :PlanetNeg
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
setvar $nearTwarp 0
getnearestwarps $nearfig $thisWarp
		
while ($i < $nearfig)
	add $i 1
	if ($figs[$i] > 0) and ($distance[$i] < $Gopop_MaxTwarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpincount[$i])
			add $warp_cnt 1
			setvar $figadj sector.warps[$i][$warp_cnt]
			if (SECTOR.EXPLORED[$figadj] = "NO") and ($blocked[$figadj] < 1)
				setvar $warpto $i
				getdistance $dist $thisWarp $warpto
				setvar $oreneeded ($dist * 3)
				if ($PLAYER~ORE_HOLDS > $oreneeded)
					setvar $player~warpto $warpto
					gosub :move~twarp
					if ($player~twarpsuccess = TRUE)
						setvar $thisWarp $i
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
setvar $pclass PORT.CLASS[$port]

setvar $equ $Gopop_EquValue
setvar $org $Gopop_OrgValue
setvar $ore $Gopop_OreValue

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
getword CURRENTLINE $holo_sect 3
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
setvar $TEMP CURRENTLINE
replacetext $TEMP "," " "
getword CURRENTLINE $holo_portname 3
pause

:holo_planets
pause

:holo_traders
killalltriggers
if ($holo_sect <> $PLAYER~CURRENT_SECTOR)
	setvar $TEMP CURRENTLINE
	getwordpos $TEMP $pos " : "
	if ($pos > 1)
		cuttext $TEMP $TEMP ($pos + 3) 999
		gosub :holo_gottrader
	end
	settexttrigger inship :inship "           in "
	settexttrigger newtrader :newtrader "          "
	settexttrigger endtraders  :endtraders ": "
	pause
	:newtrader
	setvar $TEMP CURRENTLINE
	striptext $TEMP "          "
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
gettext $TEMP $holo_corp " [" "], w"
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
getwordpos $TEMP $pos ", w/"
if ($pos > 2)
	cuttext $TEMP $TEMP 1 ($pos - 1)
end
send "'Enemy traders in sector " $holo_sect ": " $TEMP "*"
setvar $holo_enemies 1
return

:holo_done
killalltriggers
if ($holo_enemies = 1) and ($holo_corpies = 0)
	if ($Gopop_Foton = "yes") and ($PLAYER~PHOTONS > 0) and ($holo_sect <> $MAP~STARDOCK) and ($holo_sect > 10)
		send "c p y " $holo_sect "* q"
		subtract $PLAYER~PHOTONS 1
		send "'Fired photon at enemy in sector " $holo_sect ": " $TEMP "*"
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
while ($i < SECTORS)
	add $i 1
	setvar $dist $courses[$i]
	if ($dist > $adjdist)
		return
	end
	
	if ($blocked[$i] < 1) and ($i <> $lastWarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpcount[$i])
			add $warp_cnt 1
			setvar $test sector.warps[$i][$warp_cnt]
			if ($SECTOR.EXPLORED[$test] <> "YES") and ($blocked[$test] < 1)
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

if ($debug = TRUE)
	echo "Found sector " $bestadj " with " $adjwarps " warps " $dist " hops away.*"
end

return

##################################################################################################################################
:trywarpport

#gosub :PLAYER~QUIKSTATS
#waiton "Command [TL"

setvar $warpgood 0
setvar $tries 0

getAllCourses $courses $thisWarp
setvar $range ($PLAYER~ORE_HOLDS / 3)

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

if ($debug = TRUE)
	echo "Attempting to locate upgraded ports in twarp range*"
end
setvar $i 11
while ($i < SECTORS)
	add $i 1
	setvar $dist $courses[$i]
	setvar $port $i

	if ($figs[$i] > 0) and ($upgraded[$i] = 1) and ($blocked[$i] < 1)
		if ($debug = TRUE)
			echo "Found upgraded port " $port " with portval " $portvalue[$port] ", warping there*"
		end
		setvar $port $i
		setvar $thisWarp $i
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

if ($debug = TRUE)
	echo "Attempting to locate twarpable sector with good port*"
end

setvar $bestport 0

setvar $i 11
while ($i < SECTORS)
	add $i 1
	setvar $dist $courses[$i]
	setvar $port $i
	
		if ($figs[$port] = 1) and ($dist < $range)
			if ($blocked[$port] < 1) and ($port <> $lastWarp) and ($port <> $PLAYER~CURRENT_SECTOR) and ($port <> $thisWarp)
			if ($portvalue[$port] < 1)
				if ($debug = TRUE)
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
	if ($debug = TRUE)
		echo "*Selected best warp port " $bestport " portvalue " $portvalue[$bestport] "**"
	end
	goto :wp_trybestport
else
	return
end

# ok, lets do this

:wp_trybestport

# avoid navhaz above limit
if (SECTOR.NAVHAZ[$port] > $Gopop_MaxHaz)
	if ($debug = TRUE)
		echo "S" $bestport ": navhaz over limit, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end
# avoid enemy limps
if ($Gopop_AvoidLimps = "yes") and (SECTOR.LIMPETS.QUANTITY[$port] > 0) and (SECTOR.LIMPETS.OWNER[$port] <> "yours") and (SECTOR.LIMPETS.OWNER[$port] <> "belong to your Corp")
	if ($debug = TRUE)
		echo "S" $bestport ": enemy limpets present, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end
# avoid enemy mines
if ($Gopop_AvoidMines = "yes") and (SECTOR.MINES.QUANTITY[$port] > 0) and (SECTOR.MINES.OWNER[$port] <> "yours") and (SECTOR.MINES.OWNER[$port] <> "belong to your Corp")
	if ($debug = TRUE)
		echo "S" $bestport ": enemy mines present, avoiding*"
	end
	setvar $blocked[$port] 1
	goto :wp_findportloop
end

if ($debug = TRUE)
	echo "Attempting twarp to " $port " with portval = " $portvalue[$port] "*"
end

gosub :warptoport

if ($warpgood = 1)
	return
else
	setvar $target $port
	gosub :removeFigFromData
	goto :wp_findportloop
end

##################################################################################################################################
:tryadjwarp

setvar $warpgood 0
setvar $tries 0

getAllCourses $courses $PLAYER~CURRENT_SECTOR
setvar $range ($PLAYER~ORE_HOLDS / 3)
setarray $blockedadj SECTORS

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
while ($i < SECTORS)
	add $i 1
	setvar $dist $courses[$i]
	setvar $adjwarp $i
	
	if ($dist > 1) and ($figs[$adjwarp] > 0) and ($blocked[$adjwarp] = 0) and ($dist < $range) and ($adjwarp <> $lastWarp)
		setvar $warp_cnt 0
		while ($warp_cnt < sector.warpcount[$adjwarp])
			add $warp_cnt 1
			setvar $test sector.warps[$adjwarp][$warp_cnt]
			if (PORT.EXISTS[$test]) and ($test > 10) and ($test <> $MAP~STARDOCK) and (PORT.CLASS[$test] <> 0) and ($test <> $lastWarp)
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

	if ($port < 11) or ($port = STARDOCK) or (PORT.CLASS[$port] = 0)
		if ($debug = TRUE)
			echo "S" $port ": skipping, fedspace or special port*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end
	
	# avoid navhaz above limit
	if (SECTOR.NAVHAZ[$port] > $Gopop_MaxHaz)
		if ($debug = TRUE)
			echo "S" $port ": skipping, navhaz present exceeds limit*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end
	# avoid enemy limps
	if ($Gopop_AvoidLimps = "yes") and (SECTOR.LIMPETS.QUANTITY[$port] > 0) and (SECTOR.LIMPETS.OWNER[$port] <> "yours") and (SECTOR.LIMPETS.OWNER[$port] <> "belong to your Corp")
		if ($debug = TRUE)
			echo "S" $port ": skipping, enemy limpets present*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end
	# avoid enemy mines
	if ($Gopop_AvoidMines = "yes") and (SECTOR.MINES.QUANTITY[$port] > 0) and (SECTOR.MINES.OWNER[$port] <> "yours") and (SECTOR.MINES.OWNER[$port] <> "belong to your Corp")
		if ($debug = TRUE)
			echo "S" $port ": skipping, enemy mines present*"
		end
		setvar $blocked[$port] 1
		goto :adj_findportloop
	end

	if ($debug = TRUE)
		echo "Attempting twarp to " $bestadjsec " with adjacent portval = " $portvalue[$bestport] "*"
	end

	setvar $port $bestadjsec
	gosub :warptoport
	
	if ($warpgood = 1)
		return
	else
		setvar $target $port
		gosub :removeFigFromData
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

setvar $range ($PLAYER~ORE_HOLDS / 3)
setarray $probetested SECTORS

getnearestwarps $nearest $PLAYER~CURRENT_SECTOR

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
elseif ($PLAYER~EPROBES < 1)
	setvar $warpgood 0
	return
end

# lets probe some shizznit

:algo2
setvar $randmaxtries 1000
setvar $randtries 0
while ($randtries < $randmaxtries)
	add $randtries 1
	getrnd $bestsec 12 SECTORS
	if ($bestsec <> $PLAYER~CURRENT_SECTOR) and (SECTOR.EXPLORED[$bestsec] <> "YES")
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
	subtract $PLAYER~EPROBES 1
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
	getword CURRENTLINE $probesec 5
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
			if ($portscanned[$port] < 1) and ($port > 10) and ($port <> $MAP~STARDOCK) and (PORT.CLASS[$port] > 0)
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
			if ($debug = TRUE)
				echo "Found port " $port ", calculated value: " $portvalue[$port] "*"
			end
		end
		if ($destsec > 0) and ($probemove > 0)
			getcourse $course $PLAYER~CURRENT_SECTOR $port
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

if ($figs[$sector] = 0) and ($sector > 10) and ($sector <> $MAP~STARDOCK)
  send "fz1*cqd *"
  #waitfor "<Re-Display>"
  waitfor "Command [TL="
end

setvar $figs[$sector] 1
setSectorParameter $sector "FIGSEC" 1
return

##################################################################################################################################
:minesector

if ($corp_num = 0)
	setvar $corp_planets 0
end

setvar $enemy_mines 0
setvar $enemy_limps 0

if (SECTOR.MINES.QUANTITY[$port] > 0)
	if (SECTOR.MINES.OWNER[$port] <> "yours") and (SECTOR.MINES.OWNER[$port] <> "belong to your Corp")
		setvar $enemy_mines 1
	end
end

if (SECTOR.LIMPETS.QUANTITY[$port] > 0)
	if (SECTOR.LIMPETS.OWNER[$port] <> "yours") and (SECTOR.LIMPETS.OWNER[$port] <> "belong to your Corp")
		setvar $enemy_limps 1
	end
end

if ($place_limps > 0) and ($PLAYER~LIMPETS >= $place_limps)
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
	send $place_limps & "* " & $ONCORP
	settextlinetrigger badlimp :badlimp "You don't have that many mines"
	settextlinetrigger goodlimp :goodlimp "Done. You have"
	:goodlimp
	setvar $sector_limped 1
	:badlimp
	killalltriggers
	waiton "Command [TL"
end

:minesector_mines
if (($PLAYER~SURROUNDMINE > 0) or ($PLAYER~SURROUNDLIMP > 0))
	gosub :mines~deploy
end
return

##################################################################################################################################
:minesector_clear
setvar $sector_clear 0
if ($GoPop_ClearSector = "yes")
	gosub :MINES~CLEAR
	gosub :MINES~REFRESH_CLEAR_SECTOR_STATE
	if ($MINES~SECTORCLEAR = TRUE)
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
if ($MAX_ATTACK < 1)
  send "c;"
  waiton "Max Figs Per"
  getword CURRENTLINE $MAX_ATTACK 5
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
if (($PLAYER~FIGHTERS * $ship_offodds) > SECTOR.FIGS.QUANTITY[$msec])
  if ($PLAYER~FIGHTERS >= $MAX_ATTACK)
  	send "a" $MAX_ATTACK "*"
  else
  	send "a" $PLAYER~FIGHTERS "*"
  end
  waiton "You lost"
  getword CURRENTLINE $figloss 3
  striptext $figloss ","
  subtract $PLAYER~FIGHTERS $figloss
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
getTime $endTimeHH "h"
getTime $endTimeMM "n"
getTime $endTimeSS "s"

if ($endtimeHH <> $currentHH)
	add $currentHH 1
	# correct turns used for top of hour
	if ($PLAYER~UNLIMITEDGAME = FALSE) and ($game_turns > 0)
		setvar $turnadd ($game_turns / 24)
		add $START_TURNS $turnadd
	end
end

if ($endtimeSS < $stTimeSS)
	subtract $endTimeMM 1
	add $endTimeSS 60
end

if ($endtimeSS < $stTimeSS)
	subtract $endTimeMM 1
	add $endTimeSS 60
end

if ($endtimeMM < $stTimeMM)
	subtract $endTimeHH 1
	add $endTimeMM 60
end

setVar $elapsedMM ($endtimeMM - $stTimeMM)
setVar $elapsedSS ($endtimeSS - $stTimeSS)
setVar $elapsedSeconds ($elapsedSS + ($elapsedMM * 60))
setVar $elapsedMinutes ($elapsedMM + ($elapsedHH * 60))
setvar $elapsedHours $elapsedHH

if ($elapsedSeconds = 0)
	setVar $elapsedSeconds 1
end

if ($elapsedMinutes = 0)
	setVar $elapsedMinutes 1
end

getlength $elapsedHH $len
if ($len < 2)
	setvar $elapsedHours "0"&$elapsedHH
else
	setvar $elapsedHours $elapsedHH
end

getlength $elapsedMM $len
if ($len < 2)
	setvar $elapsedMinutes "0"&$elapsedMM
else
	setvar $elapsedMinutes $elapsedMM
end

getlength $elapsedSS $len
if ($len < 2)
	setvar $elapsedSeconds ":0" & $elapsedSS
else
	setvar $elapsedSeconds $elapsedSS
end

return

##################################################################################################################################
:nearXXB
if ($SectorFinder_MinFigDistance = 0)
 return
end

:breadth_search_Fig

setVar $database[1] $Index
setVar $array_size 1
setVar $array_pos 0
setVar $num_sectors SECTORS
setArray $checked $num_sectors
setVar $checked[$Index] 1
setArray $path $num_sectors
setVar $path[$Index] ""
setArray $distance $num_sectors
setVar $distance[$Index] 0
setVar $done[$Index] 1

:SectorLoop_Fig
add $array_pos 1
setVar $PLAYER~CURRENT_SECTOR $database[$array_pos]
setVar $warpnum 0

:checkwarps_Fig
add $warpnum 1
setVar $target SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$warpnum]
if ($checked[$target] = 0)
 setVar $checked[$target] 1
 add $array_size 1
  setVar $database[$array_size] $target
  setVar $path[$target] $target & " " & $path[$PLAYER~CURRENT_SECTOR]
  setVar $distance[$target] $distance[$PLAYER~CURRENT_SECTOR]
  add $distance[$target] 1
  if ($figList[$target] > 0) and (PORT.EXISTS[$target] = 1) and ($done[$target] < 1) and (PORT.BUYEQUIP = TRUE)
   if ($distance[$target] >= $SectorFinder_MinFigDistance)
     SetVar $Reason $Reason & "Nearest port is sector " & $Target & " - "& $distance[$target] & " hops"
     send  "'Nearest port to " & $Index & " is " & $Target & " - "& $distance[$target] & " hops*" 
  setVar $done[$target] 1
    else
     SetVar $Valid 0
  end                
  return
  end
end
if ($array_size = $num_sectors)
 SetVar $Reason $Reason & "No Near port Found"
 return
end
if ($warpnum < SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
# goto :checkwarps_Fig
end
#goto :SectorLoop_Fig

##################################################################################################################################
:setup

loadvar $MAP~BACKDOOR
loadvar $MAP~STARDOCK
loadvar $PLAYER~SURROUNDMINE
loadvar $PLAYER~SURROUNDLIMP
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $GAME~MAX_PLANETS_IN_GAME

gosub :PLAYER~QUIKSTATS
waiton "Command [TL"

setvar $min_portval "175000"

if ($PLAYER~SURROUNDMINE > 0)
	setvar $GoPop_BuyMines "yes"
else
	setvar $GoPop_BuyMines "no"
end
if ($PLAYER~SURROUNDLIMP > 0)
	setvar $GoPop_BuyLimps "yes"
else
	setvar $GoPop_BuyLimps "no"
end

# dock menu
setvar $GoPop_BuyFigs "yes"
setvar $GoPop_MaxFigs "10000"
setvar $GoPop_DropFigs 1
setvar $GoPop_BuyShields "yes"
setvar $GoPop_BuyDisr "no"
setvar $GoPop_BuyCommish "yes"
setvar $GoPop_CashDrop "no"
setvar $GoPop_MenuCorpie "0"
setvar $GoPop_XferPct "50"
setvar $GoPop_BuyShip "no"
setvar $GoPop_MenuShip "0"
setvar $GoPop_ShipCommish "yes"
setvar $Default_MinPortval "175000"
setvar $GoPop_MinPortval $Default_MinPortval
setvar $min_portval "175000"
setvar $GoPop_BlowFigs "2000"
setvar $GoPop_BlowMax "yes"
setvar $GoPop_SecMax $GAME~MAX_PLANETS_PER_SECTOR
setvar $GoPop_CleanUp "no"
setvar $GoPop_MaxBlowTries 3
setvar $GoPop_MaxOverloads 3
setvar $GoPop_NavMode "Standard"
setvar $GoPop_CleanAll "no"
setvar $GoPop_MaxEnemyFigs "no"
setvar $Gopop_AlwaysProbe "no"
setvar $Gopop_MaxTwarp "45"
setvar $GoPop_MaxHaz "10"
setvar $GoPop_DisrMines "no"
setvar $GoPop_AvoidMines "yes"
setvar $GoPop_AvoidLimps "yes"
setvar $GoPop_AvoidAliens "yes"
setvar $GoPop_PlaceMines "0"
setvar $GoPop_PlaceLimps "0"
setvar $GoPop_ClearSector "no"

if ($PLAYER~CURRENT_PROMPT <> "Command")
    clientMessage "This script must be run from the game command menu"
    goto :gpm_shutdown
end

If ($PTRADESETTING = 0)
	echo "*Warning: planet trade percent not set / mombot not running - defaulting to 100%*"
	setvar $PTRADESETTING 100
End

if ($GAME~MAX_PLANETS_PER_SECTOR < 1) or ($GAME~MAX_PLANETS_IN_GAME < 1)
	gosub :game~gamestats
end

if ($MAP~STARDOCK < 11)
	gosub :map~getstardock
	if ($MAP~STARDOCK < 11)
		setvar $switchboard~message "Unable to retrieve stardock sector , cannot continue*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

gosub :PLAYER~GETINFO
setvar $corp_num $PLAYER~CORP
gosub :loadshipinfo
gosub :ansicolors

# Shadow's telemetry variables
setvar $start_credits $PLAYER~CREDITS
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

if ($debug = TRUE)
  setvar $oremcicnum 0
  setvar $oremcic 0
  setvar $orgmcicnum 0
  setvar $orgmcic 0
  setvar $equmcicnum 0
  setvar $equmcic 0
end

# weights
setvar $Gopop_OreValue "45"
setvar $Gopop_OrgValue "85"
setvar $Gopop_EquValue "125"

# disable fedcom
gosub :fedcomoff

# set up planet catalog
if ($PLANET_CATALOG_FILE = "") or ($PLANET_CATALOG_FILE = 0)
	setvar $PLANET_CATALOG_FILE "games\" & GAMENAME & "\planetprods.cfg"
end
gosub :planet~loadplanetprods

# set up sector arrays
gosub :doarrays

# capture avoids at start
gosub :sector~getavoids
setvar $i 0
while ($i < $AVOIDS)
	add $i 1
	setvar $blocked[$AVOIDS[$i]] 1
end

if ($Gopop_AvoidAliens = "yes")
	gosub :getaliens
end

if ($PLAYER~PHOTONS > 0)
	setvar $switchboard~message "Cannot run gpm run with photons on ship!*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
end

# make sure we have backdoor to dock
isnumber $tn $MAP~BACKDOOR
if ($tn < 1) or ($MAP~BACKDOOR < 1)
	setvar $SECTOR~DESTINATION $MAP~STARDOCK
	gosub :SECTOR~GETBACKDOOR
end

# make up a random name for planets
getrnd $rnd1 100000 999999
setvar $planetname "GPM_" & $rnd1

setvar $movesinceport 0

# keep track of whether I have these locations
if ($MAP~RYLOS < 1)
	setvar $found_rylos 0
end
if ($MAP~ALPHACENTAURI < 1)
	setvar $found_alpha 0
end

# grab start time
getTime $currentHH "h"
getTime $stTimeMM "n"
getTime $stTimeSS "s"
setvar $elapsedHH 0

if ($PLAYER~UNLIMITEDGAME = 1)
	setvar $tnum "unlimited"
else
	setvar $tnum $player~turns
end

return

##################################################################################################################################
:loadshipinfo
gosub :SHIP~LOADSHIPINFO
return

##################################################################################################################################
:savecashingdefaults
setvar $GoPop_MinProd "500"
savevar $GoPop_MinProd
setvar $GoPop_MinPortval $Default_MinPortval
savevar $GoPop_MinPortval
setvar $Gopop_PlanetName "GPM"
savevar $GoPop_PlanetName
setvar $Gopop_PlanetType "Corp"
savevar $GoPop_PlanetType
setvar $Gopop_SellExisting "yes"
savevar $GoPop_SellExisting
setvar $Gopop_SellAllExisting "yes"
savevar $GoPop_SellAllExisting
setvar $Gopop_UpgradeOre "no"
savevar $GoPop_UpgradeOre
setvar $Gopop_UpgradeEqu "no"
savevar $GoPop_UpgradeEqu
setvar $Gopop_UpgradeMCIC "-60"
savevar $GoPop_UpgradeMCIC
return




##################################################################################################################################
:ansiColors
  setVar $cls #27 & "[2J"
  setVar $black #27 & "[1;30m"
  setVar $red #27 & "[1;31m"
  setVar $green #27 & "[1;32m"
  setVar $yellow #27 & "[1;33m"
  setVar $blue #27 & "[1;34m"
  setVar $magenta #27 & "[1;35m"
  setVar $cyan #27 & "[1;36m"
  setVar $white #27 & "[1;37m"
  setVar $blackWhite #27 & "[0;30;47m"
  setVar $whiteRed #27 & "[1;37;41m"
  setVar $redWhite #27 & "[1;31;47m"
  setVar $yellowRed #27 & "[1;33;41m"
  setVar $resetBlack #27 & "[1;37;40m"
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
gettext CURRENTLINE $race "The " " "
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

getdistance $dist $MAP~STARDOCK $port

if ($port < 11) or ($port = $MAP~STARDOCK) or (PORT.CLASS[$port] = 0)
	echo "S " $port ": fedspace or special port, blocking*"
	setvar $blocked[$port] 1
	return
end

if ($dist <> "-1") and ($dist < 3)
	echo "S " $port ": too close to stardock, avoiding*"
	#setvar $blocked[$port] 1
	return
end

getdistance $dist $PLAYER~CURRENT_SECTOR $port
if ($dist = "-1")
	echo "Cannot calculate distance to port " $port ", blocking.*"
	setvar $figs[$port] 0
	setvar $blocked[$port] 1
end

setvar $oreneeded ($dist * 3)

if ($debug = TRUE)
	echo "*distance from sector " $PLAYER~CURRENT_SECTOR " to port " $port " = " $dist "*"
end

# if it's only one hop, lets just move
if ($dist = 1)
	if ($debug = TRUE)
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
if ($figs[$port] > 0) and ($PLAYER~ORE_HOLDS > $oreneeded)
	if ($debug = TRUE)
		echo "Attempting twarp directly to sector*"
	end
	setvar $warpto $port
	setvar $player~warpto $warpto
	gosub :move~twarp
	if ($player~twarpsuccess = TRUE)
		setvar $warpgood 1
		return
	end
	setvar $target $warpto
	gosub :removeFigFromData
end

if ($debug = TRUE)
	echo "attempting to twarp to adjacent and move to port*"
end

# try to find an adjacent to twarp to
setvar $warp_cnt 0
while ($warp_cnt < sector.warpincount[$port])
	add $warp_cnt 1
	setvar $adj sector.warpsin[$port][$warp_cnt]
	if ($figs[$adj] > 0)
		getdistance $dist $PLAYER~CURRENT_SECTOR $adj
		setvar $oreneeded ($dist * 3)
		if ($dist > 0) and ($PLAYER~ORE_HOLDS > $oreneeded)
			setvar $warpto $adj
			setvar $player~warpto $warpto
			gosub :move~twarp
			#echo "twarpgood " $player~twarpsuccess "*"
			if ($player~twarpsuccess = TRUE)
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
				gosub :removeFigFromData
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
if ($PLAYER~SCAN_TYPE <> "Holo")
	return
end

if (SECTOR.EXPLORED[$msec] <> "No")
	setvar $old_dens SECTOR.DENSITY[$msec]
	
	send "s"
	if ($PLAYER~SCAN_TYPE = "Holo")
		send "d"
	end
	waitFor "Relative Density Scan"

	# if density hasn't changed, skip the holo
	if (SECTOR.DENSITY[$msec] = $old_dens)
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
if (SECTOR.FIGS.QUANTITY[$msec] <> 0)
	if (SECTOR.FIGS.OWNER[$msec] <> "yours") and (SECTOR.FIGS.OWNER[$msec] <> "belong to your Corp")	
		if (SECTOR.FIGS.QUANTITY[$msec] > $max_enemy_figs) or (($PLAYER~FIGHTERS * $ship_offods) < (SECTOR.FIGS.QUANTITY[$msec] + 100))
			return
		end
	end
end

# avoid navhaz above limit
echo "navhaz: " SECTOR.NAVHAZ[$msec] "*"
if (SECTOR.NAVHAZ[$msec] > $Gopop_MaxHaz)
	return
end

# avoid enemy limps
if ($Gopop_AvoidLimps = "yes")
	if (SECTOR.LIMPETS.QUANTITY[$msec] > 0) and (SECTOR.LIMPETS.OWNER[$msec] <> "yours") and (SECTOR.LIMPETS.OWNER[$msec] <> "belong to your Corp")
		return
	end
end

# avoid enemy mines
if ($Gopop_AvoidMines = "yes")
	if (SECTOR.MINES.QUANTITY[$msec] > 0) and (SECTOR.MINES.OWNER[$msec] <> "yours") and (SECTOR.MINES.OWNER[$msec] <> "belong to your Corp")
		return
	end
end

# avoid traders
if (SECTOR.TRADERCOUNT[$msec] > 0)	
	return
end

# if we made it this far, congratulations!
setvar $movesafe 1
return

##################################################################################################################################
:doarrays
setArray $figs SECTORS
setArray $limps SECTORS
setArray $mines SECTORS
setArray $adj SECTORS
setArray $portvalue SECTORS
setArray $avoids SECTORS
setarray $planprodval SECTORS
setarray $blocked SECTORS
setarray $visits SECTORS
setarray $twarpports SECTORS
setarray $upgraded SECTORS
setarray $explored SECTORS
setarray $portscanned SECTORS
setvar $goodports 0
setvar $ports_scanned 0
setvar $twarpports_cnt 0
setvar $exploredstart 0

echo "**Creating Arrays, this may take a moment..."

setVar $idx 10
while ($idx < SECTORS)
	add $idx 1
	getSectorParameter $idx "FIGSEC" $isfigged
	getSectorParameter $idx "LIMPSEC" $islimped
	getSectorParameter $idx "MINESEC" $ismined
	
	setvar $visits[$idx] 0
	setvar $blocked[$idx] 0
	setvar $avoids[$idx] 0
	setvar $adj[$idx] 0
	
	isNumber $tn $isfigged
	if ($tn)
		if ($isfigged <> 0)
			setvar $figs[$idx] 1
		#else
		#	setvar $figs[$idx] 0
		end
	end
	
	isNumber $tn $islimped
	if ($tn)
		if ($islimped <> 0)
			setvar $limps[$idx] 1
		#else
		#	setvar $limps[$idx] 0
		end
	end
	
	isNumber $tn $ismined
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
	
	if (SECTOR.EXPLORED[$idx] = "YES")
		setvar $explored[$idx] 1
		add $exploredstart 1
	end
	
	if (PORT.EXISTS[$idx]) and ($explored[$idx] = 1)
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
setvar $BUYSELL[FUEL] ""
setvar $BUYSELL[ORGANICS] ""
setvar $BUYSELL[EQUIPMENT] ""
setvar $PORTQTY[FUEL] 0
setvar $PORTQTY[ORGANICS] 0
setvar $PORTQTY[EQUIPMENT] 0
setvar $PERCENT[FUEL] 0
setvar $PERCENT[ORGANICS] 0
setvar $PERCENT[EQUIPMENT] 0

send "*CR" & $port & "*Q"
setTextLineTrigger gpm_port_ore :gpm_port_ore "Fuel Ore"
setTextLineTrigger gpm_port_org :gpm_port_org "Organics"
setTextLineTrigger gpm_port_equ :gpm_port_equ "Equipment"
setTextLineTrigger gpm_port_done :gpm_port_done "<Computer deactivated>"
setTextLineTrigger gpm_port_none :gpm_port_none "I have no information about a port in that sector."
setTextLineTrigger gpm_port_never :gpm_port_none "You have never visted sector"
pause

:gpm_port_ore
getWord CURRENTLINE $tmpbuy 3
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 4
getWord CURRENTLINE $tmppct 5
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[FUEL] $tmpbuy
	setVar $PORTQTY[FUEL] $tmpqty
	setVar $PERCENT[FUEL] $tmppct
end
pause

:gpm_port_org
getWord CURRENTLINE $tmpbuy 2
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 3
getWord CURRENTLINE $tmppct 4
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[ORGANICS] $tmpbuy
	setVar $PORTQTY[ORGANICS] $tmpqty
	setVar $PERCENT[ORGANICS] $tmppct
end
pause

:gpm_port_equ
getWord CURRENTLINE $tmpbuy 2
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 3
getWord CURRENTLINE $tmppct 4
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[EQUIPMENT] $tmpbuy
	setVar $PORTQTY[EQUIPMENT] $tmpqty
	setVar $PERCENT[EQUIPMENT] $tmppct
end
pause

:gpm_port_none
killTrigger gpm_port_ore
killTrigger gpm_port_org
killTrigger gpm_port_equ
killTrigger gpm_port_done
killTrigger gpm_port_none
killTrigger gpm_port_never
send "Q"
waitOn "Command [TL"
return

:gpm_port_done
killTrigger gpm_port_ore
killTrigger gpm_port_org
killTrigger gpm_port_equ
killTrigger gpm_port_done
killTrigger gpm_port_none
killTrigger gpm_port_never
waitOn "Command [TL"
return

##################################################################################################################################
:getrportinfo
setvar $BUYSELL[FUEL] ""
setvar $BUYSELL[ORGANICS] ""
setvar $BUYSELL[EQUIPMENT] ""
setvar $PORTQTY[FUEL] 0
setvar $PORTQTY[ORGANICS] 0
setvar $PORTQTY[EQUIPMENT] 0
setvar $PERCENT[FUEL] 0
setvar $PERCENT[ORGANICS] 0
setvar $PERCENT[EQUIPMENT] 0

setTextLineTrigger gpm_rport_ore :gpm_rport_ore "Fuel Ore"
setTextLineTrigger gpm_rport_org :gpm_rport_org "Organics"
setTextLineTrigger gpm_rport_equ :gpm_rport_equ "Equipment"
setTextLineTrigger gpm_rport_done :gpm_rport_done "Computer command [TL="
setTextLineTrigger gpm_rport_none :gpm_rport_none "I have no information about a port in that sector."
setTextLineTrigger gpm_rport_never :gpm_rport_none "You have never visted sector"
send "R" & $port & "*"
pause

:gpm_rport_ore
getWord CURRENTLINE $tmpbuy 3
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 4
getWord CURRENTLINE $tmppct 5
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[FUEL] $tmpbuy
	setVar $PORTQTY[FUEL] $tmpqty
	setVar $PERCENT[FUEL] $tmppct
end
pause

:gpm_rport_org
getWord CURRENTLINE $tmpbuy 2
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 3
getWord CURRENTLINE $tmppct 4
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[ORGANICS] $tmpbuy
	setVar $PORTQTY[ORGANICS] $tmpqty
	setVar $PERCENT[ORGANICS] $tmppct
end
pause

:gpm_rport_equ
getWord CURRENTLINE $tmpbuy 2
uppercase $tmpbuy
getWord CURRENTLINE $tmpqty 3
getWord CURRENTLINE $tmppct 4
stripText $tmpqty ","
stripText $tmppct "%"
isNumber $tmpqtyok $tmpqty
isNumber $tmppctok $tmppct
if (($tmpbuy = "BUYING") or ($tmpbuy = "SELLING")) and ($tmpqtyok) and ($tmppctok)
	setVar $BUYSELL[EQUIPMENT] $tmpbuy
	setVar $PORTQTY[EQUIPMENT] $tmpqty
	setVar $PERCENT[EQUIPMENT] $tmppct
end
pause

:gpm_rport_none
:gpm_rport_done
killTrigger gpm_rport_ore
killTrigger gpm_rport_org
killTrigger gpm_rport_equ
killTrigger gpm_rport_done
killTrigger gpm_rport_none
killTrigger gpm_rport_never
return

##################################################################################################################################
:setportval
setvar $portval 0

if ($sell_equ = 1) and (PORT.BUYEQUIP[$port] = TRUE) and (PORT.PERCENTEQUIP[$port] >= 15)
	add $cnt 1
	setvar $tmpval PORT.EQUIP[$port]
	multiply $tmpval $Gopop_EquValue
	add $portval $tmpval
end
if ($sell_org = 1) and (PORT.BUYORG[$port] = TRUE) and (PORT.PERCENTORG[$port] >= 15)
	add $cnt 1
	setvar $tmpval PORT.ORG[$port]
	multiply $tmpval $Gopop_OrgValue
	add $portval $tmpval
end
if ($sell_ore = 1) and (PORT.BUYFUEL[$port] = TRUE) and (PORT.PERCENTFUEL[$port] >= 15)
	add $cnt 1
	setvar $tmpval PORT.FUEL[$port]
	multiply $tmpval $Gopop_OreValue
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

setvar $Gopop_MaxBlowTries 3
setvar $Gopop_MaxOverloads 3

setvar $popcount 0
setvar $MADE_SALE FALSE

if ($plantype = "")
	setvar $plantype "p"
end

if ($debug = TRUE)
	echo "*Attempting dopop for port " $port "*"
end

send "d"

# dock at a port if theres one here
if (PORT.EXISTS[$port] = 0) or ($port < 11) or (PORT.CLASS[$port] = 0) or ($port = $MAP~STARDOCK)
  echo "*Failed to find a port here - returning*"
  return
end

setvar $actualval 0
gosub :getportinfo
gosub :setpostportval
if ($portvalue[$port] <= $min_portval)
	if ($debug = TRUE)
		echo "*Port " $port " below minimum after live report: " $portvalue[$port] " <= " $min_portval "*"
	end
	goto :endpop
end
setvar $madeone 0
setvar $overloadsdone 1
setvar $overloadtries 1

setvar $psec sector.planetcount[$port]
if ($psec <= $Gopop_SecMax)
	setvar $planetmax $Gopop_SecMax
else
	setvar $planetmax $psec
end

:popit
killalltriggers

if ($PLAYER~UNLIMITEDGAME = FALSE) and ($player~turns <= $BOT~BOT_TURN_LIMIT)
	setvar $switchboard~message "Out of turns, halting!*"
	gosub :switchboard~switchboard
	goto :wrapup
end

setvar $moretodo 0

if ($sell_equ = 1) and ($BUYSELL[EQUIPMENT] = "BUYING") and ($PERCENT[EQUIPMENT] >= 15)
  setvar $moretodo 1
elseif ($sell_org = 1) and ($BUYSELL[ORGANICS] = "BUYING") and ($PERCENT[ORGANICS] >= 15)
  setvar $moretodo 1
elseif ($sell_ore = 1) and ($BUYSELL[FUEL] = "BUYING") and ($PERCENT[FUEL] >= 15)
  setvar $moretodo 1
end

if ($moretodo = 0)
	goto :endpop
end

if ($PLAYER~GENESIS = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :PLAYER~QUIKSTATS
	If ($PLAYER~GENESIS = 0)
		setvar $switchboard~message "Failed to furb! Halting.*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
end

if ($madeone = 1)
	if ($debug = TRUE)
		echo "*psec: " $psec " MAX " $Gopop_SecMax "*"
	end
	echo "blowmax " $gopop_blowmax " psec " $psec " planetmax " $planetmax " fighters " $PLAYER~FIGHTERS " blowfigs " $gopop_blowfigs "*"
	#halt
	If ($psec > $planetmax) and ($PLAYER~FIGHTERS > $Gopop_BlowFigs)
		echo "overloadtries " $overloadtries " overloadsdone " $overloadsdone "*"
		add $overloadtries 1
		if ($overloadtries > $Gopop_MaxBlowTries)
			if ($overloadsdone >= $Gopop_MaxOverloads)
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
			gosub :blowPlanet
		end
	end
	setvar $madeone 0
end

SetVar $fueltosell 0
SetVar $orgtosell 0
SetVar $equiptosell 0
SetVar $PTR 1

gosub :POP_PLANET
setvar $madeone 1
add $psec 1
#Gosub :LAND_ON_PLANET
gosub :getpnum

if ($planet > $max_planetnum)
	setvar $max_planetnum $planet
	setvar $game_planets $GAME~MAX_PLANETS_IN_GAME
	subtract $game_planets $max_planetnum
end

While ($PLANET~PLANETPRODS[$PTR] <> "0")
    If ($PLANET~PLANETPRODS[$PTR] = $LOOKINGFOR)
	SetVar $fueltosell $PLANET~PLANETPRODS[$PTR][1]
	SetVar $orgtosell $PLANET~PLANETPRODS[$PTR][2]
	SetVar $equiptosell $PLANET~PLANETPRODS[$PTR][3]
	if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS) and ($fueltosell > 100)
		send "l " $planet "* t n t1* q "
		add $turncount 1
	end
	if ($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0)
		goto :noselloff
	else
		goto :selloff
	end
    End
    Add $PTR 1
End

setvar $hagglefailed 0

# New Planet not in Catalog is Scanned and Saved
send "l " $planet "*"
gosub :getplaninfo

SetVar $PLANET~PLANETPRODS[$PTR] $LOOKINGFOR
SetVar $PLANET~PLANETPRODS[$PTR][1] $fueltosell
SetVar $PLANET~PLANETPRODS[$PTR][2] $orgtosell
SetVar $PLANET~PLANETPRODS[$PTR][3] $equiptosell
#SetVar $LINE $PLANET~PLANETPRODS[$PTR] & #9 & $PLANET~PLANETPRODS[$PTR][1] & " " & $PLANET~PLANETPRODS[$PTR][2] & " " & $PLANET~PLANETPRODS[$PTR][3]
SetVar $LINE $PLANET~PLANETPRODS[$PTR][1] & " " & $PLANET~PLANETPRODS[$PTR][2] & " " & $PLANET~PLANETPRODS[$PTR][3] & " " & $PLANET~PLANETPRODS[$PTR]
Write $PLANET~PLANET_PRODS_FILE $LINE

if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS) and ($fueltosell > 100)
	send "l " $planet "* t n t1* q "
	add $turncount 1
else
	send "q "
end

:SELLOFF

if ($debug = TRUE)
		echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
		echo "orebuying " $BUYSELL[FUEL] " oretrading " $PORTQTY[FUEL] "*"
		echo "orgbuying " $BUYSELL[ORGANICS] " orgtrading " $PORTQTY[ORGANICS] "*"
		echo "equbuying " $BUYSELL[EQUIPMENT] " equtrading " $PORTQTY[EQUIPMENT] "*"
end
	
if ($sell_ore <> 1) or ($BUYSELL[FUEL] <> "BUYING") or ($PERCENT[FUEL] < 15)
	setVar $fueltosell 0
end
	
if ($sell_org <> 1) or ($BUYSELL[ORGANICS] <> "BUYING") or ($PERCENT[ORGANICS] < 15)
	setVar $orgtosell 0
end
	
if ($sell_equ <> 1) or ($BUYSELL[EQUIPMENT] <> "BUYING") or ($PERCENT[EQUIPMENT] < 15)
	setVar $equiptosell 0
end

if ($debug = TRUE)
		echo "fueltosell " $fueltosell " orgtosell " $orgtosell " equiptosell " $equiptosell "*"
		echo "orebuying " $BUYSELL[FUEL] " oretrading " $PORTQTY[FUEL] "*"
		echo "orgbuying " $BUYSELL[ORGANICS] " orgtrading " $PORTQTY[ORGANICS] "*"
		echo "equbuying " $BUYSELL[EQUIPMENT] " equtrading " $PORTQTY[EQUIPMENT] "*"
end

if ($fueltosell > 0) or ($orgtosell > 0) or ($equiptosell > 0)
	if ($PLAYER~UNLIMITEDGAME = FALSE) and ($player~turns <= $BOT~BOT_TURN_LIMIT)
		setvar $switchboard~message "Out of turns, halting!*"
		gosub :switchboard~switchboard
		goto :wrapup
	end

	setvar $oldcreds $PLAYER~CREDITS
	Gosub :PlanetNeg
	gosub :getportinfo
	gosub :setpostportval

	if ($PLANETHAGGLE~SELLHAGGLESUCCEEDED = TRUE)
		setvar $MADE_SALE TRUE
		add $portcash $PLANETHAGGLE~PROFIT
		gosub :updatemonitor
	end

	if ($portvalue[$port] <= $min_portval)
		if ($debug = TRUE)
			echo "*Port " $port " below minimum after selloff: " $portvalue[$port] " <= " $min_portval "*"
		end
		goto :endpop
	end
	goto :popit
end

:noselloff
gosub :getportinfo
gosub :setpostportval
if ($portvalue[$port] <= $min_portval)
	if ($debug = TRUE)
		echo "*Port " $port " below minimum after no-sell check: " $portvalue[$port] " <= " $min_portval "*"
	end
	goto :endpop
end
goto :popit

##################################################################################################################################
:setpostportval

setvar $portval 0

isNumber $tmpqtyok $PORTQTY[EQUIPMENT]
isNumber $tmppctok $PERCENT[EQUIPMENT]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_equ = 1) and ($BUYSELL[EQUIPMENT] = "BUYING") and ($PERCENT[EQUIPMENT] >= 15)
		setvar $tmpval $PORTQTY[EQUIPMENT]
		multiply $tmpval $Gopop_EquValue
		add $portval $tmpval
	end
end
isNumber $tmpqtyok $PORTQTY[ORGANICS]
isNumber $tmppctok $PERCENT[ORGANICS]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_org = 1) and ($BUYSELL[ORGANICS] = "BUYING") and ($PERCENT[ORGANICS] >= 15)
		setvar $tmpval $PORTQTY[ORGANICS]
		multiply $tmpval $Gopop_OrgValue
		add $portval $tmpval
	end
end
isNumber $tmpqtyok $PORTQTY[FUEL]
isNumber $tmppctok $PERCENT[FUEL]
if ($tmpqtyok) and ($tmppctok)
	if ($sell_ore = 1) and ($BUYSELL[FUEL] = "BUYING") and ($PERCENT[FUEL] >= 15)
		setvar $tmpval $PORTQTY[FUEL]
		multiply $tmpval $Gopop_OreValue
		add $portval $tmpval
	end
end

setvar $portvalue[$port] $portval
return

##################################################################################################################################
:endpop
if ($Gopop_CleanUp = "yes") or ($Gopop_CleanAll = "yes")
  gosub :cleanup
end

if ($MADE_SALE = TRUE)
	#add $pcounter 1
	#add $portscashed 1
	gosub :stats
	gosub :updatemonitor
	if ($debug = TRUE)
		#send "'Port value " $actualval " estimated value " $portvalue[$port] "*"
	end
end
return

##################################################################################################################################
:blowPlanet

#send #145
gosub :current_prompt
If ($PLAYER~CURRENT_PROMPT = "Command")
	send "l " $planet "* "
	waiton "Planet command"
#elseif ($PLAYER~CURRENT_PROMPT <> "Planet")
#	echo "**Unexpected prompt for blowPlanet: " $PLAYER~CURRENT_PROMPT "*"
#	halt
end

If ($PLAYER~ATOMIC = 0)
	goto :NoDets
	killalltriggers
End

add $turncount 1
if ($HOLDS_ORE < $HOLDS_TOTAL) and ($fueltosell > 50)
	send "  T  N  T  1  *  "
end
send "  Z  D  Y  *  "
setTextLineTrigger NoDets	:NoDets "You do not have any Atomic Detonators!"
setTextTrigger KaBoom		:KaBoom "For blowing up this planet you receive"
pause

:NoDets
killalltriggers
Send "  Q  "
setvar $furb_return 1
gosub :furb
gosub :PLAYER~QUIKSTATS
If ($PLAYER~ATOMIC = 0)
	Send "'Atomic Furb Failed*"
	HAlt
Else
	goto :blowPlanet
End

:Kaboom
killAllTriggers
subtract $psec 1
subtract $PLAYER~ATOMIC 1
return

##################################################################################################################################
:cleanup
killalltriggers
getword CURRENTLINE $PLAYER~CURRENT_PROMPT 1
If ($PLAYER~CURRENT_PROMPT = "Planet")
	send "q "
	waiton "Command [TL"
End

if ($PLANET_SCANNER <> "Yes")
	gosub :checkplanetsafety
	if ($shielded = 1) or ($notours = 1)
		setvar $switchboard~message "Need planet scanner to clean up with shielded or non-GPM planets.*"
		gosub :switchboard~switchboard
		return
	end
end

:cleanup2
If ($PLAYER~ATOMIC = 0)
	setvar $furb_return 1
	gosub :furb
	gosub :PLAYER~QUIKSTATS
	
	if ($PLAYER~ATOMIC = 0)
		Send "'Atomic Furb Failed*"
		HAlt
	end
end

Send "L"
:cleanuploop
SetTextTrigger  	cleanup_landed     	:cleanup_landed 	"Landing sequence engaged..."
SetTextLineTrigger	cleanup_done		:cleanup_done		"There isn't a planet"
SetTextTrigger		cleanup_done2		:cleanup_end		"Land on which planet"
SetTextLineTrigger	cleanup_planet		:cleanup_planet		"   <"
SetDelayTrigger		cleanup_fail		:cleanup_fail     	5000
Pause

:cleanup_fail
KillAllTriggers
Send "        **   "
Echo "**" & $TagLineB & ANSI_15 & "GoSub :SCAN_PLANET Timed Out**"
Halt

:cleanup_end
killalltriggers
send "Q*"
goto :cleanup_done

:cleanup_planet
KillAllTriggers
setvar $TEMP CURRENTLINE
gettext $TEMP $planet "<" ">"
striptext $planet " "
getwordpos $TEMP $pos ">"
cuttext $TEMP $pinfo ($pos + 2) 999
getword $pinfo $cpname 1
getlength $pname $plen
cuttext $cpname $cptest 1 $plen
if ($cptest = $pname)
	send $planet & "*"
	goto :cleanup_landed
elseif ($PLANET_SCANNER = "Yes") and ($GoPop_CleanAll = "yes")
	getwordpos $TEMP $pos ">"
	cuttext $TEMP $pinfo ($pos + 2) 999
	getwordpos $pinfo $plvl "        None"
	if ($plvl > 0)
		send $planet & "*"
		goto :cleanup_landed
	end
end
goto :cleanuploop

:cleanup_landed
KillAllTriggers
gosub :getplaninfo

if ($PLAYER~FIGHTERS > $Gopop_BlowFigs)
	if ($planetfuelcolos > 0) or ($planetorgcolos > 0) or ($planetequipcolos > 0)
		if ($debug = TRUE)
			echo "*Planet has colos, leavin that shit alone!*"
		end
		send "q"
	else
		if ($debug = TRUE)
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
getword CURRENTLINE $gpname $cnum
getwordpos $gpname $pos $pname
if ($pos < 1)
	setvar $notours 1
end
goto :cplanetloop

:endplanets
killalltriggers
waiton "Command [TL"

if ($debug = TRUE)
	echo "*gotshielded " $shielded " notours " $notours "*"
end
return

##################################################################################################################################
:stats

if ($PLAYER~UNLIMITEDGAME = FALSE)
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
if ($debug = TRUE)
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
if ($elapsedMM > 0)
	setvar $totalsec ($elapsedMM * 60)
end
add $totalsec $elapsedSS
setprecision 2
if ($portscashed = 0) or ($totalsec = 0)
	setvar $portspersec 0
else
	setVar $portspersec ($portscashed / $totalsec)
end
setprecision 0
if ($portcash = 0) or ($totalsec = 0)
	setvar $cashpersec 0
else
	setVar $cashpersec ($portcash / $totalsec)
end
if ($hagglestotal > 0)
	setprecision 2
	setvar $hagglepct (($hagglesuccesses / $hagglestotal) * 100)
	setprecision 0
else
	setvar $hagglepct 0
end
setvar $runtime $elapsedHours & ":" & $elapsedMinutes & ":" & $elapsedSeconds
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

if ($Gopop_Monitor = "yes")
	if ($PLAYER~UNLIMITEDGAME = 1)
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
		setvar $exploredpct (($exploredtotal / SECTORS) * 100)
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

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CREDITS < 2500000)
	return
end

send "o3"
settexttrigger upgradeunits :upgradeunits "How many units"
pause

:upgradeunits
getword CURRENTLINE $units 9
striptext $units "("
if ($units = 0)
	send "0*"
	waiton "Command [TL"
	return
end

setvar $unitcost ($units * 900)

if (($PLAYER~CREDITS - $unitcost) < 1000000)
	send "0*"
	waiton "Command [TL"
else
	send $units "*"
	waiton "For upgrading this StarPort"
	getword CURRENTLINE $expup 7
	add $PLAYER~EXPERIENCE $expup
	send "q"
	waiton "Command [TL"
	add $upgradedports 1
end

return

##################################################################################################################################
:furb

gosub :PLAYER~QUIKSTATS
setvar $lastWarp $PLAYER~CURRENT_SECTOR

killalltriggers
send "c"
waiton "Computer command [TL="
settextlinetrigger dockgood :dockgood "Commerce report for Stargate"
settextlinetrigger dockbad :dockbad "I have no information"
send "r" & $MAP~STARDOCK & "*"
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

if ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
	goto :indock
end

#send "q q * "

setvar $furbmode 1
getdistance $dist $PLAYER~CURRENT_SECTOR $MAP~STARDOCK

if ($dist = 1)
	setvar $msec $MAP~STARDOCK
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
elseif ($PLAYER~TWARP_TYPE = "No")
	if ($Gopop_MowBD = "yes")
		gosub :setavoidbd
		setvar $msec $MAP~BACKDOOR
		setvar $fails 0
		gosub :trymow
		gosub :unavoidbd
	end
	:mowdock
	setvar $msec $MAP~STARDOCK
	gosub :trymow
	if ($mowgood = 0)
		setvar $switchboard~message "Unable to furb, halting!*"
		gosub :switchboard~switchboard
		goto :gpm_shutdown
	end
	goto :indock
else
	if ($PLAYER~ALIGNMENT > 1000)
		setvar $warpto $MAP~STARDOCK
		setvar $player~warpto $warpto
		gosub :move~twarp
		if ($player~twarpsuccess = TRUE)
			goto :indock
		else
			gosub :cleardockavoid
			setvar $player~warpto $warpto
			gosub :move~twarp
			if ($player~twarpsuccess = TRUE)
				goto :indock
			else
				setvar $switchboard~message "Unable to furb, halting!*"
				gosub :switchboard~switchboard
				goto :gpm_shutdown
			end
		end
	else
		if ($Gopop_TwarpBD = "yes")
			setvar $warpto $MAP~BACKDOOR
			setvar $player~warpto $warpto
gosub :move~twarp
			if ($player~twarpsuccess = TRUE)
				setvar $msec $MAP~STARDOCK
				gosub :trymove
				if ($movegood = 1)
					goto :indock
				end
			end
		end
		if ($Gopop_MowBD = "yes")
			gosub :setavoidbd
			setvar $msec $MAP~BACKDOOR
			gosub :trymow
			gosub :unavoidbd
			if ($mowgood = 1)
				setvar $msec $MAP~STARDOCK
				gosub :trymove
				if ($movegood = 1)
					goto :indock
				else
					setvar $switchboard~message "Unable to furb, halting!*"
					gosub :switchboard~switchboard
				end
			end
		end
		setvar $warpto $MAP~STARDOCK
		setvar $player~warpto $warpto
		gosub :move~twarp
		if ($player~twarpsuccess = TRUE)
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
getword CURRENTLINE $lrcost 9
striptext $lrcost ","
if ($lrcost < ($PLAYER~CREDITS + $Gopop_MinCreds))
	subtract $PLAYER~CREDITS $lrcost
	send "y"
end
waiton "Where to?"

:dock_nolimp
killalltriggers
#send "h"
waitfor "Where to?"

setvar $furbmode 0

# Make sure we end up with the minimum credits
subtract $PLAYER~CREDITS $Gopop_MinCreds
setvar $freecreds $PLAYER~CREDITS

if ($debug = TRUE)
	echo "*initial credits: " $PLAYER~CREDITS "*"
end

setvar $item_max 0

send "h"

# get price of scanners, if we don't have them

if ($COST_DENSITY_SCANNER < 1) or ($COST_HOLO_SCANNER < 1)
	send "r"
	waiton "The Holographic costs"
	getword CURRENTLINE $COST_HOLO_SCANNER 4
	striptext $COST_HOLO_SCANNER ","
	savevar $COST_HOLO_SCANNER
	waiton "and the Density costs"
	getword CURRENTLINE $COST_DENS_SCANNER 5
	striptext $COST_DENS_SCANNER ","
	savevar $COST_DENS_SCANNER
	send "q"
	waiton "what are you looking for"
end

setvar $freecreds ($PLAYER~CREDITS - $COST_HOLO_SCANNER)

:buytorps
# buy torps, saving enough for holo scanner
if ($PLAYER~GENESIS < $ship_max_genesis)
	setvar $item "t"
	gosub :buyitem
	add $PLAYER~GENESIS $buycount
end

# if we didn't get enough gentorps to run, try saving for dens scanner
if ($PLAYER~GENESIS < $GAME~MAX_PLANETS_PER_SECTOR)
	setvar $freecreds ($PLAYER~CREDITS - $COST_DENS_SCANNER)
	setvar $item "t"
	gosub :buyitem
	add $PLAYER~GENESIS $buycount
end

# if we can't afford any torps, exit
if ($PLAYER~GENESIS < 1)
	setvar $switchboard~message "Unable to buy torps, halting!*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
end

# try to buy a holo scanner, if we can afford it
if ($PLAYER~SCAN_TYPE = "None")
	settexttrigger holocost2 :holocost2 "The Holographic costs"
	settexttrigger haveholo :alreadygotholo "You don't need two!"
	settexttrigger canthaveholo :dontgotholo "Sorry, your ship can only carry"
	settexttrigger youtoopoorholo :dontgotholo "Sigh, another poor trader."
	settexttrigger gotholo :gotholo "We'll get that sent over"
	send "rh"
	pause
	:holocost2
	getword CURRENTLINE $COST_HOLO_SCANNER 4
	striptext $COST_HOLO_SCANNER ","
	savevar $COST_HOLO_SCANNER
	pause
	:gotholo
	add $freecreds $COST_HOLO_SCANNER
	setvar $PLAYER~SCAN_TYPE "Holo"
	waiton "You have"
	getword CURRENTLINE $PLAYER~CREDITS 3
	striptext $PLAYER~CREDITS ","
	:dontgotholo
	:alreadygotholo
	killalltriggers
	waiton "So what are you"
end

# if no holo, we need at least a density scanner
if ($PLAYER~SCAN_TYPE = "None")
	settexttrigger holocost :holocost "The Holographic costs"
	settexttrigger denscost :denscost "and the Density costs"
	settexttrigger havedens :alreadygotdens "You don't need two!"
	settexttrigger canthavedens :dontgotdens "Sorry, your ship is not equipped"
	settexttrigger yousuperpoor :dontgotdens "Sigh, another poor trader."
	settexttrigger gotdens :gotdens "We'll get that sent over"
	send "rd"
	pause
	:holocost
	getword CURRENTLINE $COST_probe_SCANNER 4
	striptext $COST_HOLO_SCANNER ","
	savevar $COST_HOLO_SCANNER
	pause
	:denscost
	getword CURRENTLINE $COST_DENS_SCANNER 5
	striptext $COST_DENS_SCANNER ","
	savevar $COST_DENS_SCANNER
	pause
	:dontgotdens
	killalltriggers
	setvar $switchboard~message "Can't buy density scanner, halting.*"
	gosub :switchboard~switchboard
	goto :gpm_shutdown
	:gotdens
	add $freecreds $COST_DENS_SCANNER
	setvar $PLAYER~SCAN_TYPE "Dens"
	waiton "You have"
	getword CURRENTLINE $PLAYER~CREDITS 3
	striptext $PLAYER~CREDITS ","
	:alreadygotdens
	waiton "So what are you"
end

if ($PLAYER~TWARP_TYPE = "No")
	send "w"
	settexttrigger canthavetw :dontgotone "Sorry, your ship is not equipped"
	settexttrigger maybetw :maybetw "just bring back the unused portion"
	pause
	:maybetw
	killalltriggers
	waiton "TransWarp a single ship"
	getword CURRENTLINE $twcost 8
	striptext $twcost ","
	settexttrigger haveit :gotone "You don't need two!"
	settexttrigger canthaveit :dontgotone "Sorry, your ship is not equipped"
	settexttrigger youpoor :dontgotone "Sigh, another poor trader."
	settexttrigger gotone :gotone "you'll need lots of"
	send "1"
	pause
	:gotone
	setvar $PLAYER~TWARP_TYPE 1
	waiton "You have"
	getword CURRENTLINE $PLAYER~CREDITS 3
	striptext $PLAYER~CREDITS ","
	:dontgotone
	:alreadygottw
	killalltriggers
end

If ($PLAYER~ALIGNMENT >= 500) AND ($PLAYER~ALIGNMENT < 1000)
	Send "Q P A    Q H"
end

# buy atomics
if ($Gopop_BlowMax = "yes") or ($Gopop_CleanUp = "yes")
	setvar $item "a"
	gosub :buyitem
end

# buy probes
if ($Gopop_UseProbes = "yes")
	setvar $item "e"
	gosub :buyitem
end

# buy planet scanner
if ($PLAYER~PLANET_SCANNER <> "Yes")
	send "f"
	settexttrigger canthaveps :dontgotps "Sorry, your ship is not equipped"
	settexttrigger maybeps :maybeps "I can let you have one"
	pause
	:maybeps
	getword CURRENTLINE $pscost 8
	striptext $pscost ","
	killalltriggers
	settexttrigger haveps :haveps "You don't need two!"
	settexttrigger youtoopoorps :dontgotps "Sigh, another poor trader."
	settexttrigger gotps :gotps "We'll get that installed"
	send "y"
	pause
	:gotps
	setvar $PLANET_SCANNER "Yes"
	waiton "You have"
	getword CURRENTLINE $PLAYER~CREDITS 3
	striptext $PLAYER~CREDITS ","
	:haveps
	:dontgotps
	killalltriggers
end

setvar $inshipyards 0
setvar $PLAYER~SHIELDSbought 0

if ($PLAYER~TOTAL_HOLDS < $ship_max_holds) and ($PLAYER~TWARP_TYPE <> "No")
	send "q s p"
	waiton "Cargo holds"
	getword CURRENTLINE $item_cost 5
	getword CURRENTLINE $canbuy 10
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
		if ($totalprice >= $PLAYER~CREDITS)
			goto :finalbuycount
		end
	end
	:finalbuycount
	setvar $buycount $i
	send $buycount & "*"
	if ($buycount > 0)
		waiton "The cost for"
		getword CURRENTLINE $costfor $8
		if (($PLAYER~CREDITS - $costfor) < 1)
			subtract $canbuy 1
			send "n"
			goto :priceholds
		end
		send "y"
	end
	waiton "You have"
	getword CURRENTLINE $PLAYER~CREDITS 3
	striptext $PLAYER~CREDITS ","
	setvar $inshipyards 1
end

# keep track of credits for transfer at dock
if ($CashDrop <> "no") and ($Gopop_XferPct > 0)
	setvar $freecreds $PLAYER~CREDITS
	setprecision 2
	setvar $pct "0." & $Gopop_XferPct
	multiply $freecreds $pct
	setprecision 0
	getwordpos $freecreds $pos "."
	if ($pos > 0)
		cuttext $freecreds $freecreds 1 ($pos - 1)
	end
	
	if ($debug = TRUE)
		echo "*Done buying mandatory items, remaining free credits = " $freecreds " credits = " $PLAYER~CREDITS "*"
		echo "Cash drop percentage = " $Gopop_XferPct "*"
	end
else
	setvar $freecreds $PLAYER~CREDITS
end

if ($inshipyards = 1)
	send "q q h "
	setvar $inshipyards 0
end

# buy mines
if ($Gopop_BuyMines = "yes") and ($PLAYER~ARMIDS < $ship~ship_mines_max)
	setvar $item "m"
	gosub :buyitem
end

# buy limps
if ($Gopop_BuyLimps = "yes")
	setvar $item "l"
	gosub :buyitem
end

# buy disruptors
if ($Gopop_BuyDisr = "yes")
	setvar $item "s"
	gosub :buyitem
end

# buy figs
if ($Gopop_BuyFigs = "yes") and ($PLAYER~FIGHTERS < $ship~ship_fighters_max)
	if ($inshipyards = 0)
		send "q s p"
		setvar $inshipyards 1
	end
	send "?"
	waiton "Fighters"
	setvar $TEMP CURRENTLINE
	getword $TEMP $item_cost 4
	getword $TEMP $canbuy 8
	setvar $item "b"
	gosub :buy_shipyards
end

# buy shields
if ($Gopop_BuyShields = "yes") and ($PLAYER~SHIELDS < $ship~ship_shield_max)
	if ($inshipyards = 0)
		send "q s p"
		setvar $inshipyards 1
	end
	send "?"
	waiton "Shield Points"
	getword CURRENTLINE $item_cost 5
	getword CURRENTLINE $canbuy 9
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

setvar $PLAYER~ONDOCK 1

#
# return logic:
# if we started on dock, do nothing
# if we have a twarp drive, try to twarp back
# if no twarp, get 3 hops away, near an adjacent if possible
#
if ($lastWarp = $MAP~STARDOCK)
	send "q"
	goto :main
elseif ($PLAYER~TWARP_TYPE <> "No")
	#if ($furb_return = 1)
	setvar $warpto $lastWarp
	setvar $player~warpto $warpto
	gosub :move~twarp
	if ($player~twarpsuccess = TRUE)
		goto :returndone
	end
	setvar $target $lastWarp
	gosub :removeFigFromData
	gosub :PLAYER~QUIKSTATS
	setvar $thisWarp $PLAYER~CURRENT_SECTOR
	gosub :trywarpport
	if ($warpgood = 1)
		setvar $lastWarp $thisWarp
		setvar $thisWarp $port
		goto :dothissector
	end
	if ($navmode < 3)
		gosub :tryadjwarp
		if ($warpgood = 1)
			setvar $lastWarp $thisWarp
			goto :main
		end
	end
	else
	setvar $i 0
	getnearestwarps $getnear $MAP~STARDOCK
	
	setvar $bestmove 0
	setvar $bestweight 0
	setvar $moveweight 0
	
	# try to get at least three hops out
	while ($i < $getnear)
		add $i 1
		setvar $msec $getnear[$i]
		getdistance $dist STARDOCK $msec
		setvar $moveweight 5
		if ($dist >= 3)
			setvar $warp_cnt 0
			if ($TRIES = 99999)
				
				add $warp_cnt 1
				setvar $nwarp sector.warps[$getnear[$i]][$warp_cnt]
				if (SECTOR.EXPLORED[$getnear[$i]] = "YES")
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
if ($PLAYER~CURRENT_PROMPT = "Command")
	send "ps"
end
goto :wrapup

:returndone
gosub :PLAYER~QUIKSTATS
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
getword CURRENTLINE $fedon 5
if ($fedon = "On")
	send "5"
end
send "qq"
waiton "Command [TL"
return

##################################################################################################################################
:xfermacro
if ($corp_num = 0)
	setvar $corp_num $PLAYER~CORP
end
setvar $target_name " " & $Gopop_CashDrop & " [" & $corp_num & "], w/"
setvar $firstskip 0
setvar $skip ""
setvar $gpm~dockmacro ""

send "qd"
waiton "Sector  :"
waiton "Traders :"
setvar $TEMP CURRENTLINE
getwordpos $TEMP $pos $target_name
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
setvar $TEMP CURRENTLINE
if ($firstskip)
	setvar $skip $skip & " n"
else
	setvar $firstskip 1
end
getwordpos $TEMP $pos $target_name
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
send "^C" & $MAP~STARDOCK & "*q"
waiton "ENDINTERROG"
return

##################################################################################################################################
:setavoidbd
send "^"
setvar $i 0
while ($i < SECTOR.WARPCOUNT[$MAP~STARDOCK])
	add $i 1
	if (SECTOR.WARPS[$MAP~STARDOCK][$i] <> $MAP~BACKDOOR)
		send "S" & SECTOR.WARPS[$MAP~STARDOCK][$i] & "*"
	end
end
send "q"
waiton "ENDINTERROG"
return

##################################################################################################################################
:unavoidbd
send "^"
setvar $i 0
while ($i < SECTOR.WARPCOUNT[$MAP~STARDOCK])
	add $i 1
	send "C" & SECTOR.WARPS[$MAP~STARDOCK][$i] & "*"
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
gettext CURRENTLINE $TEMP " " " credits"
getlength $TEMP $len
setvar $l 3
:buyitem_findstart
cuttext $TEMP $test ($len - $l) 1
if ($test = " ")
	subtract $l 1
	cuttext $TEMP $item_cost ($len - $l) 999
else
	add $l 1
	goto :buyitem_findstart
end
striptext $item_cost ","
pause
:buyprompt
killalltriggers
setvar $line CURRENTLINE
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
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
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
setvar $line CURRENTLINE
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
getword CURRENTLINE $TEMP 3
striptext $TEMP ","
setvar $prodcost ($PLAYER~CREDITS - $TEMP)
if ($freecreds > 0)
	subtract $freecreds $prodcost
end
setvar $PLAYER~CREDITS $TEMP
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
gosub :PLANET~GETPLANETINFO
setvar $planet $PLANET~PLANET
setvar $planetfuel $PLANET~PLANETFUEL
setvar $planetorg $PLANET~PLANETORG
setvar $planetequip $PLANET~PLANETEQUIP
setvar $planetfig $PLANET~PLANETFIG
setvar $citadel $PLANET~CITADEL
setvar $citadelcredits $PLANET~CITADEL_CREDITS
setvar $fueltosell $PLANET~PLANETFUEL
setvar $orgtosell $PLANET~PLANETORG
setvar $equiptosell $PLANET~PLANETEQUIP
return

##################################################################################################################################
:PlanetNeg
setvar $neg_success 0
setvar $fuelsold 0
setvar $orgsold 0
setvar $equsold 0

setvar $PLANETHAGGLE~_CK_PNEGO_FUELTOSELL $fueltosell
setvar $PLANETHAGGLE~_CK_PNEGO_ORGTOSELL $orgtosell
setvar $PLANETHAGGLE~_CK_PNEGO_EQUIPTOSELL $equiptosell

setvar $PLANET~PLANET $planet
setvar $PLANETHAGGLE~OREPROFIT 0
setvar $PLANETHAGGLE~ORGPROFIT 0
setvar $PLANETHAGGLE~EQUPROFIT 0

send "l " & $planet & "*"
waitOn "Planet command"
setvar $PLAYER~CURRENT_PROMPT "Planet"
gosub :PLANETHAGGLE~PLANETNEG

if ($PLANETHAGGLE~OREPROFIT > 0)
	setvar $neg_success 1
	setvar $fuelsold $PLANETHAGGLE~_CK_PNEGO_FUELTOSELL
end
if ($PLANETHAGGLE~ORGPROFIT > 0)
	setvar $neg_success 1
	setvar $orgsold $PLANETHAGGLE~_CK_PNEGO_ORGTOSELL
end
if ($PLANETHAGGLE~EQUPROFIT > 0)
	setvar $neg_success 1
	setvar $equsold $PLANETHAGGLE~_CK_PNEGO_EQUIPTOSELL
end

gosub :PLAYER~CURRENTPROMPT
if ($PLAYER~CURRENT_PROMPT = "Planet")
	send "q "
	waitOn "Command [TL"
	setvar $PLAYER~CURRENT_PROMPT "Command"
end

if ($BUYSELL[EQUIPMENT] = "BUYING")
	getsectorparameter $port "EQUMCIC" $MCIC
	if ($Gopop_UpgradeEqu = "yes") and ($MCIC <= $GoPop_UpgradeMCIC)
		gosub :upgradeport
	end
end

return

##################################################################################################################################
:current_prompt
gosub :PLAYER~CURRENTPROMPT
setvar $CURRENT_PROMPT $PLAYER~CURRENT_PROMPT
return

##################################################################################################################################
:checkStartingPrompt
setvar $BOT~VALIDPROMPTS $validPrompts
gosub :PLAYER~CHECKSTARTINGPROMPT
return

##################################################################################################################################
:getShipStats
gosub :SHIP~GETSHIPSTATS
setvar $SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
return

##################################################################################################################################
:POP_PLANET

getrnd $rnd3 10000 99999

subtract $player~turns 1
add $turnsused 1
send "u"
waiton "Do you wish to launch"
send "y "
setTextLineTrigger NoOverLoad	:NoOverload 	"What do you want to name this planet?"
#setTExtLineTrigger NeedGenTs	:NeedGenTs 	"You don't have any Genesis Torpedoes to launch!"
setTextTrigger OverLoad 	:Overload 	"Do you wish to abort?"
setTextLineTrigger Yikes	:Yikes 		"I'm sorry, but not enough free matter exists."
setTextTrigger Yikes2		:Yikes 		"Command [TL"
pause

:NeedGenTs
killAllTriggers
Waiton "shouldn't stop here"
:Yikes
killAllTriggers
Echo "**Bad News - Game Maximum Planets Reached.**"
goto :gpm_shutdown
:Overload
killTrigger Overload
send "n "
pause
:NoOverload
killAllTriggers
SubTract $PLAYER~GENESIS 1

SetVar $TEMP (CURRENTLINE & "!!@@##")
GetText $TEMP $LOOKINGFOR "(Class " ")!!@@##"
SetVar $currentPlanet ($planetname & $rnd3)

send $currentPlanet "*"
setTextTrigger MakingItCorp		:MakingItCorp	"Should this be a (C)orporate planet or (P)ersonal planet? "
setTextTrigger LetsGo			:LetsGo 	"Command [TL="
pause

:MakingItCorp
KillAllTriggers
send $plantype
Return

:LetsGo
killAllTriggers
#send "cr*q *"
#waitfor "<Re-Display>"
#waitfor "Command [TL="
return

##################################################################################################################################
:getpnum

Send "L"
SetTextTrigger  	SCANNING_LANDED     	:SCANNING_LANDED	"Landing sequence engaged..."
SetTextLineTrigger	SCANNING_FOR		:SCANNING_FOR		$currentPlanet
SetDelayTrigger		SCANNING_DONE		:SCANNING_DONE     	5000
Pause

:SCANNING_DONE
KillAllTriggers
Send "        **   "
Echo "**" & $TagLineB & ANSI_15 & "GoSub :SCAN_PLANET Timed Out**"
Halt

:SCANNING_FOR
KillAllTriggers
SetVar $TEMP currentline
GetText $TEMP $planet "<" ">"
StripText $planet " "
WaitOn " <Q to abort> ?"
#Send $planet & "*   "
send "q* "
return

:SCANNING_LANDED
KillAllTriggers
WaitOn "Planet #"
getword CURRENTLINE $planet 2
striptext $planet "#"
WaitOn "Planet command"
send "q "
#SetVar $PLAYER~CURRENT_PROMPT "Planet"
Return

##################################################################################################################################
:LAND_ON_PLANET

Send "L"
SetTextTrigger  	SCANNING_LANDED    	:SCANNING_LANDED	"Landing sequence engaged..."
SetTextLineTrigger	SCANNING_FOR		:SCANNING_FOR		$currentPlanet
SetDelayTrigger		SCANNING_DONE		:SCANNING_DONE      5000
Pause

:SCANNING_DONE
KillAllTriggers
Send "        **   "
Echo "**" & $TagLineB & ANSI_15 & "GoSub :SCAN_PLANET Timed Out**"
Halt

:SCANNING_FOR
KillAllTriggers
SetVar $TEMP currentline
GetText $TEMP $planet "<" ">"
StripText $planet " "
WaitOn " <Q to abort> ?"
Send $planet & "*  "

:SCANNING_LANDED
KillAllTriggers
#WaitOn "Planet command"
SetVar $PLAYER~CURRENT_PROMPT "Planet"
Return

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

:removeFigFromData
setvar $PLAYER~TARGET $target
if ($target > 0) and ($target <= SECTORS)
	setvar $figs[$target] 0
	setvar $blocked[$target] 1
	setvar $upgraded[$target] 0
end
gosub :PLAYER~REMOVEFIGFROMDATA
return

##################################################################################################################################
:addFigToData
setvar $PLAYER~TARGET $target
gosub :PLAYER~ADDFIGTODATA
return

##################################################################################################################################
:killthetriggers
killalltriggers
return

# ======================     START MOMBOT TWARP SUBROUTINES      =================
:trytwarp
gosub :player~quikstats

if ($PLAYER~TWARP_TYPE = "No")
	return
end

setvar $startingLocation $PLAYER~CURRENT_PROMPT

isNumber $test $warpto
if ($test = FALSE)
	setVar $gpm~msg "Sector must be entered as a number*"
	goto :twarpDone
end

if ($PLAYER~CURRENT_SECTOR = $warpto)
	setVar $gpm~msg "Already in that sector!*"
	goto :twarpDone
elseif (($warpto <= 0) OR ($warpto > SECTORS))
	setVar $gpm~msg "Destination sector is out of range!*"
	goto :twarpDone
end

setvar $lastWarp $PLAYER~CURRENT_SECTOR
setVar $player~twarpsuccess FALSE
setVar $original 0
setVar $target 0

if ($PLAYER~CURRENT_SECTOR = $warpto)
	setVar $gpm~msg "Already in that sector!"
	goto :twarpDone
elseif (($warpto <= 0) OR ($warpto > SECTORS))
	setVar $gpm~msg "Destination sector is out of range!"
	goto :twarpDone
end

# this is a kludge, check should be elsewhere but we'll use it for now
getdistance $dist $MAP~STARDOCK $warpto
if ($dist <> "-1") and ($dist < 2) and ($furbmode = 0)
	setVar $gpm~msg "Too close to stardock!"
	setvar $blocked[$warpto] 1
	goto :twarpDone
end

setvar $furbmode 0

if ($PLAYER~TWARP_TYPE = "No")
	setVar $gpm~msg "No T-warp drive on this ship!"
	goto :twarpDone
end

# check adj's for Dock.. if present, then we don't need a jump sector.

if ($PLAYER~ALIGNMENT < 1000)
	if (($warpto = $MAP~STARDOCK) OR ($warpto <= 10))
		setVar $WeAreAdjDock FALSE
		setVar $target $warpto
		setVar $a 1
		setVar $START_SECTOR $PLAYER~CURRENT_SECTOR
		while ($a <= SECTOR.WARPCOUNT[$START_SECTOR])
			setVar $adj_start SECTOR.WARPS[$START_SECTOR][$a]
			if ($adj_start = $target)
				setVar $WeAreAdjDock TRUE
			end
			add $a 1
		end
		setVar $RED_adj 0
		if ($WeAreAdjDock = FALSE)
			gosub :FindJumpSector
			if ($RED_adj <> 0)
				setVar $original $warpto
				setVar $WARPTO $RED_adj
			else
				waitfor "Command [TL="
				setVar $gpm~msg "Cannot Find Jump Sector Adjacent Sector " & $target & "."
				goto :twarpDone
			end
		end
	end
end

if ($RED_adj <> 0)
	goto :twarp_lock
end

getlength $gpm~dockmacro $len
if ($len < 2)
	setvar $gpm~dockmacro "q "
end

#echo "**startinglocation** " $startinglocation "*"
if ($startingLocation = "Citadel")
	send "q t*t1* q q * c u y q mz" $warpto "*"
elseif ($startingLocation = "Planet")
	send "t*t1* q q * c u y q mz" $warpto "*"
elseif ($startingLocation = "<StarDock>") or ($ondock = 1)
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send $gpm~dockmacro & " mz" $warpto "*"
elseif ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send "mz" $warpto "*"
else
	#send "q q q n n 0 * c u y q mz" $warpto "*"
	send "c u y q mz" $warpto "*"
end
setTextTrigger     there       :adj_warp       "You are already in that sector!"
setTextLineTrigger adj_warp    :adj_warp       "Sector  : "&$warpto&" "
setTextTrigger     locking     :locking        "Do you want to engage the TransWarp drive?"
setTextTrigger     igd         :twarpIgd       "An Interdictor Generator in this sector holds you fast!"
setTextTrigger     noturns     :twarpPhotoned  "Your ship was hit by a Photon and has been disabled"
setTextTrigger     noroute     :twarpNoRoute   "Do you really want to warp there? (Y/N)"
pause
:adj_warp	
	gosub :MOVE~KILLTWARPTRIGGERS
	send "z*"
	goto :twarp_adj
:locking
	gosub :MOVE~KILLTWARPTRIGGERS
	send "y"
	setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
	setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
	setTextLineTrigger no_fuel :twarpNoFuel "You do not have enough Fuel Ore"
	pause
:twarpNoFuel
	gosub :MOVE~KILLTWARPTRIGGERS
	setVar $gpm~msg "Not enough fuel for T-warp."
	goto :twarpDone
:twarp_adj
	gosub :MOVE~KILLTWARPTRIGGERS
	send "z* "
	setVar $gpm~msg "That sector is next door, just plain warping."
	setVar $player~twarpsuccess TRUE
	goto :twarpDone
:twarpNoRoute
	gosub :MOVE~KILLTWARPTRIGGERS
	send "n* z* "
	setVar $gpm~msg "No route available to that sector!"
	goto :twarpDone
:no_twarp_lock
	gosub :MOVE~KILLTWARPTRIGGERS
	send "n* z* "
	setVar $target $warpto
	gosub :removeFigFromData
	setVar $gpm~msg "No fighters at T-warp point!"
	goto :twarpDone
:twarpIgd
	gosub :MOVE~KILLTWARPTRIGGERS
	setVar $gpm~msg "My ship is being held by Interdictor!"
	goto :twarpDone
:twarpPhotoned
	gosub :MOVE~KILLTWARPTRIGGERS
	setVar $gpm~msg "I have been photoned and can not T-warp!"
	goto :twarpDone
:twarp_lock
	gosub :MOVE~KILLTWARPTRIGGERS
	setVar $target $warpto
	gosub :addFigToData
	if ($warpto = $MAP~STARDOCK)
		send "y ps"
	else
		send "y "
	end
	setVar $gpm~msg "T-warp completed."
	setVar $player~twarpsuccess TRUE

:twarpDone
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

:FindJumpSector
setVar $i 1
setVar $RED_adj 0
if ($onplanet = 1)
	send "q t*t1* q*"
end
while (SECTOR.WARPSIN[$target][$i] > 0)
	setVar $RED_adj SECTOR.WARPSIN[$target][$i]
	if ($RED_adj > 10)
		send "m " & $RED_adj & "* y"
		setTextTrigger TwarpBlind 			:TwarpBlind "Do you want to make this jump blind? "
		setTextTrigger TwarpLocked			:TwarpLocked "All Systems Ready, shall we engage? "
		setTextLineTrigger TwarpVoided		:TwarpVoided "Danger Warning Overridden"
		setTextLineTrigger TwarpAdj			:TwarpAdj "<Set NavPoint>"
		pause
		:TwarpAdj
			gosub :killthetriggers
			send " * "
			return

		:TwarpVoided
			gosub :killthetriggers
			send " N N "
			goto :TryingNextAdj

		:TwarpLocked
			gosub :killthetriggers
			goto :SectorLocked

		:TwarpBlind
			gosub :killthetriggers
			send " N "
	end
	:TryingNextAdj
	add $i 1
end

:NoAdjsFound
setVar $RED_adj 0
return

:SectorLocked
return

# ======================    END MOMBOT TWARP SUBROUTINE     ==========================

#=================================== START MOW (MOW) ============================================
:trymow
setvar $mowgood FALSE
setvar $figsToDrop 1

setArray $mowCourse 80
gosub :PLAYER~QUIKSTATS
setVar $startingLocation $PLAYER~CURRENT_PROMPT

if ($startingLocation = "Citadel")
	send "q q "
elseif ($startingLocation = "Planet")
	send "q "
elseif ($startingLocation = "<StarDock>")
	send "q "
elseif ($startingLocation <> "Command")
	setvar $switchboard~message "Bad starting prompt, cannot mow!*"
	gosub :switchboard~switchboard
	return
end

if ($SHIP_MAX_ATTACK <= 0)
	setVar $SHIP_MAX_ATTACK 99991111
end

isNumber $number $msec
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	return
elseif (($msec <= 0) OR ($msec > SECTORS))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	return
end

isNumber $number $figsToDrop
if ($number <> TRUE)
	setVar $figsToDrop 1
else
	if ($figsToDrop > 50000)
		setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
		gosub :switchboard~switchboard
		return
	elseif ($figsToDrop > $PLAYER~FIGHTERS)
		setvar $switchboard~message "Fighters to drop cannot exceed total ship fighters.*"
		gosub :switchboard~switchboard
		return
	end
end

if ($SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
	setVar $SHIP_MAX_ATTACK 9999
end

gosub :getCourse
setVar $j 2
setVar $result "q q q * "

while ($j <= $courseLength)
	add $gopop_moves 1
	subtract $player~turns $TPW
	setVar $result $result&"m  "&$mowCourse[$j]&"*   "
	if (($mowCourse[$j] > 10) AND ($mowCourse[$j] <> $MAP~STARDOCK))
		setVar $result $result&"za  "&$SHIP_MAX_ATTACK&"* *  "
	end
	echo "figstodrop " $figstodrop " j " $j " mowcourse[$j] " $mowcourse[$j] "*"
	if (($figsToDrop > 0) AND ($mowCourse[$j] > 10) AND ($mowCourse[$j] <> $MAP~STARDOCK) AND ($j > 2))
		setVar $result $result&"f "&$figsToDrop&" * c d "
		setVar $target $mowCourse[$j]
		gosub :addFigToData
	end
	if (($j >= $courselength) AND ($mow_saveme = TRUE) AND ($figstoDrop = 0))
		setVar $result $result&"f 1 * c d "
		setVar $target $mowCourse[$j]
		gosub :addFigToData
	end
	if (($called = FALSE) AND ($mow_saveme = TRUE) AND ($j >= ($courseLength-2)))
		setVar $result $result&"'"&$msec&"=saveme*  "
		setVar $called TRUE
	end
	add $j 1
end

send $result

killalltriggers
gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT = "Planet")
	send "m * * * c s* "
end

if (($PLAYER~CURRENT_PROMPT = "<StarDock>") OR ($PLAYER~CURRENT_PROMPT = "<Hardware"))
	setvar $switchboard~message "Safely on Stardock*"
	gosub :switchboard~switchboard
	setvar $mowgood TRUE
end

if ($PLAYER~CURRENT_SECTOR <> $msec)
	setvar $switchboard~message "Mow did not reach destination!*"
	gosub :switchboard~switchboard
	return
else
	setvar $switchboard~message "Mow completed.*"
	gosub :switchboard~switchboard
	setvar $mowgood TRUE
end

return

:getCourse
setVar $sectors ""
settextlinetrigger sectorsnogo :sectorsnogo "Error - No route within"
setTextLineTrigger sectorlinetrig :sectorsline " > "
send "^f*"&$msec&"*q"
pause

:sectorsnogo
killtrigger sectorlinetrig
send "n * q"
send "'Clear Voids and try again!*"
goto :noPath
pause

:sectorsline
killtrigger sectorlinetrig
killtrigger sectorlinetrig2
killtrigger sectorlinetrig3
killtrigger sectorlinetrig4
killtrigger donePath
killtrigger donePath2
setVar $line CURRENTLINE
replacetext $line ">" " "
striptext $line "("
striptext $line ")"
setVar $line $line&" "
getWordPos $line $pos "So what's the point?"
getWordPos $line $pos2 ": ENDINTERROG"
if (($pos > 0) OR ($pos2 > 0))
	goto :noPath
end
getWordPos $line $pos " sector "
getWordPos $line $pos2 "TO"
if (($pos <= 0) AND ($pos2 <= 0))
	setVar $sectors $sectors & " " & $line
end
getWordPos $line $pos " "&$msec&" "
getWordPos $line $pos2 "("&$msec&")"
getWordPos $line $pos3 "TO"
if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
	goto :gotSectors
else
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	setTextLineTrigger sectorlinetrig2 :sectorsline " "&$msec&" "
	setTextLineTrigger sectorlinetrig3 :sectorsline " "&$msec
	setTextLineTrigger sectorlinetrig4 :sectorsline "("&$msec&")"
	setTextLineTrigger donePath :sectorsline "So what's the point?"
	setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
end
pause

:gotSectors
setVar $sectors $sectors&" :::"
setVar $courseLength 0
setVar $index 1

:keepGoing
getWord $sectors $mowCourse[$index] $index
while ($mowCourse[$index] <> ":::")
	add $courseLength 1
	add $index 1
	getWord $sectors $mowCourse[$index] $index
end
return

:noPath
setvar $switchboard~message "No path to that sector, cannot mow!*"
gosub :switchboard~switchboard
return

# ======================     END MOW SUBROUTINES     ==========================
:safemow
:smow
	gosub :killthetriggers
	gosub :PLAYER~QUIKSTATS
	if ($PLAYER~SCAN_TYPE = "None")
		setvar $switchboard~message "Safe Mow can only be run when you have a long range scanner.*"
		gosub :switchboard~switchboard
	        return
	end
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
	gosub :checkStartingPrompt
	if ($startingLocation = "Command")
		gosub :getShipStats
	elseif ($SHIP_MAX_ATTACK <= 0)
		setVar $SHIP_MAX_ATTACK 99991111
	end
	setVar $msec $parm1
	isNumber $number $msec
	if ($number <> 1)
		setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
		gosub :switchboard~switchboard
		return
	elseif (($msec <= 0) OR ($msec > SECTORS))
		setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
		gosub :switchboard~switchboard
		return
	end
	if ($parm2 = "p")
		setVar $are_we_docking TRUE
	else
		if ($parm3 = "p")
			setVar $are_we_docking TRUE
		else
			setVar $are_we_docking FALSE
		end
	end
	setVar $figsToDrop $parm2
	isNumber $number $figsToDrop
	if ($number <> 1)
		if ($parm2 <> "p")
			setvar $switchboard~message "Fighters to drop entered is not a number, cannot mow!*"
			gosub :switchboard~switchboard
			return
		end
		setVar $figsToDrop 0
	elseif ($figsToDrop > 50000)
		setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
		gosub :switchboard~switchboard
		return
	end
	if ($SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
		setVar $SHIP_MAX_ATTACK 9999
	end
	gosub :getCourse
	setVar $j 3
	setVar $result "q q q * "
	setVar $isSafe TRUE
	while (($j <= $courseLength) AND ($isSafe))
		setVar $nextSafeSector $mowCourse[$j]
		if ($PLAYER~SCAN_TYPE = "Holo")
			send "sdsh"
		elseif ($PLAYER~SCAN_TYPE = "Dens")
			send "sd"
		end
                gosub :PLAYER~QUIKSTATS
		setVar $minesSafe ((SECTOR.MINES.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp"))))
                setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                setVar $planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $MAP~STARDOCK) OR ($nextSafeSector <= 10)))
                setVar $navHazSafe (SECTOR.NAVHAZ[$nextSafeSector] <= 0)
                setVar $densitySafe (SECTOR.DENSITY[$nextSafeSector] <= 0)
                setVar $limpetsSafe (SECTOR.ANOMOLY[$nextSafeSector] = FALSE) OR ((((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                if ($densitySafe OR ($limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planetSafe))
                        send "m "&$mowCourse[$j]&"* "
                else
                        setvar $switchboard~message "Cannot safely move into sector " & $nextSafeSector & "*"
                        gosub :switchboard~switchboard
                        return
                end
		if (($figsToDrop > 0) AND ($mowCourse[$j] > 10) AND ($mowCourse[$j] <> $MAP~STARDOCK) AND ($j > 2))
			send "f "&$figsToDrop&" * c d "
			setVar $target $mowCourse[$j]
			gosub :addFigToData
		end
		add $j 1
	end
	setVar $docking_instructions ""
	if ($are_we_docking)
		setVar $docking_instructions " p z t *"
		if ($msec = $MAP~STARDOCK)
			setVar $docking_instructions " p z s g y g q h *"
		end
		send $docking_instructions
	end
	gosub :PLAYER~QUIKSTATS
	if ($PLAYER~CURRENT_SECTOR <> $msec)
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
