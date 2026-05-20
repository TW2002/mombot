#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:GRID~SURROUND
:GRID~STARTSURROUND
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($PLAYER~SURROUNDPASSIVE)
  send "szd"
  settextlinetrigger SURROUNDSCANDEN :DONESURROUNDSCANDEN "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] D"
  settexttrigger SURROUNDSCANFAILDEN :DONESURROUNDSCAN "Do you want instructions (Y/N) [N]?"
  pause
  :GRID~DONESURROUNDSCANDEN
  killtrigger SURROUNDSCANDEN
  killtrigger SURROUNDSCANFAILDEN
  send "szh"
  waiton "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
  send "* "
else
  send "szh"
  settextlinetrigger SURROUNDSCAN :DONESURROUNDSCAN "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
  settexttrigger SURROUNDSCANFAIL :DONESURROUNDSCAN "Do you want instructions (Y/N) [N]?"
  pause
  :GRID~DONESURROUNDSCAN
  killtrigger SURROUNDSCAN
  killtrigger SURROUNDSCANFAIL
  send "* "
end
killtrigger SURROUNDSECTOR
settexttrigger SURROUNDSECTOR :CONTINUESURROUNDSECTOR "["&$PLAYER~CURRENT_SECTOR&"]"
pause
:GRID~CONTINUESURROUNDSECTOR
if ($GRID~ALREADY_CHECKED_SHIP <> TRUE)
  gosub :SHIP~GETSHIPSTATS
end
if ($SHIP~SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
  setvar $SHIP~SHIP_MAX_ATTACK ($PLAYER~FIGHTERS / 2)
end

setvar $GRID~I 1
setvar $GRID~SURROUNDSTRING "c v 0* y* "&$PLAYER~CURRENT_SECTOR&"* q "
setvar $PLAYER~SURROUNDOUTPUT ""
setvar $GRID~YOUROWNCOUNT 0
if ($PLAYER~DROPOFFENSIVE = TRUE)
  setvar $GRID~DEPLOYFIG "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setvar $GRID~DEPLOYFIG "t"
else
  setvar $GRID~DEPLOYFIG "d"
end
setvar $GRID~TOTALWARPS SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR]
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$GRID~I] > 0)
  setvar $GRID~ADJ_SEC SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$GRID~I]
  getdistance $GRID~DISTANCE $GRID~ADJ_SEC $PLAYER~CURRENT_SECTOR
  if ($GRID~DISTANCE <= 0)
    send "^f"&$GRID~ADJ_SEC&"*"&$PLAYER~CURRENT_SECTOR&"*q"
    waiton "ENDINTERROG"
    getdistance $GRID~DISTANCE $GRID~ADJ_SEC $PLAYER~CURRENT_SECTOR
  end
  setvar $GRID~CONTAINSSHIELDEDPLANET FALSE
  setvar $GRID~P 1
  while ($GRID~P <= SECTOR.PLANETCOUNT[$GRID~ADJ_SEC])
    getword SECTOR.PLANETS[$GRID~ADJ_SEC][$GRID~P] $GRID~TEST 1
    if ($GRID~TEST = "<<<<")
      setvar $GRID~CONTAINSSHIELDEDPLANET TRUE
    end
    add $GRID~P 1
  end
  setvar $GRID~TEMPOFFODD $SHIP~SHIP_OFFENSIVE_ODDS
  multiply $GRID~TEMPOFFODD $SHIP~SHIP_MAX_ATTACK
  divide $GRID~TEMPOFFODD 12
  setvar $GRID~FIGOWNER SECTOR.FIGS.OWNER[$GRID~ADJ_SEC]
  setvar $GRID~MINEOWNER SECTOR.MINES.OWNER[$GRID~ADJ_SEC]
  setvar $GRID~LIMPOWNER SECTOR.LIMPETS.OWNER[$GRID~ADJ_SEC]
  getword $GRID~FIGOWNER $GRID~ALIENCHECK 1
  lowercase $GRID~ALIENCHECK

  if (($PLAYER~SURROUNDOVERWRITE = FALSE) and (($GRID~FIGOWNER = "belong to your Corp") or ($GRID~FIGOWNER = "yours")))
    add $GRID~YOUROWNCOUNT 1
    if ($GRID~YOUROWNCOUNT = $GRID~TOTALWARPS)
      setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) All sectors around are friendly fighters.*"
      return
    end
  elseif (SECTOR.FIGS.QUANTITY[$GRID~ADJ_SEC] >= $GRID~TEMPOFFODD)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Too many fighters in sector "&$GRID~ADJ_SEC&".*"
  elseif (($GRID~ADJ_SEC <= 10) or ($GRID~ADJ_SEC = $MAP~STARDOCK))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided Fed Space, sector "&$GRID~ADJ_SEC&".*"
  elseif ((SECTOR.PLANETCOUNT[$GRID~ADJ_SEC] > 0) and $PLAYER~SURROUNDAVOIDALLPLANETS)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided planet in sector "&$GRID~ADJ_SEC&".*"
  elseif (($GRID~CONTAINSSHIELDEDPLANET = TRUE) and ($PLAYER~SURROUNDAVOIDSHIELDEDONLY = TRUE))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided shielded planet in sector "&$GRID~ADJ_SEC&".*"
  elseif ($GRID~DISTANCE > 1)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided one way in sector "&$GRID~ADJ_SEC&".*"
  elseif (($PLAYER~SURROUNDPASSIVE = TRUE) and (((SECTOR.ANOMALY[$GRID~ADJ_SEC] = TRUE) and (($GRID~LIMPOWNER <> "belong to your Corp") and ($GRID~LIMPOWNER <> "yours"))) or ((SECTOR.FIGS.QUANTITY[$GRID~ADJ_SEC] > 0) and ($GRID~ALIENCHECK <> "the")) or ((SECTOR.MINES.QUANTITY[$GRID~ADJ_SEC] > 0) and (($GRID~MINEOWNER <> "belong to your Corp") and ($GRID~MINEOWNER <> "yours")))))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided non-passive situation in sector "&$GRID~ADJ_SEC&".*"
  else
    setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&" m z "&$GRID~ADJ_SEC&"* z a "&$SHIP~SHIP_MAX_ATTACK&"* * "
    if (($PLAYER~SURROUNDFIGS > 0) and ($PLAYER~FIGHTERS > $PLAYER~SURROUNDFIGS))
      setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"f z"&$PLAYER~SURROUNDFIGS&"*zc"&$GRID~DEPLOYFIG&"*  "
      subtract $PLAYER~FIGHTERS $PLAYER~SURROUNDFIGS
      setvar $GRID~TARGET $GRID~ADJ_SEC
      setsectorparameter $GRID~TARGET "FIGSEC" TRUE
    end
    if (($PLAYER~SURROUNDLIMP > 0) and (($PLAYER~LIMPETS > $PLAYER~SURROUNDLIMP) and ($PLAYER~LIMPETS > 0)))
      setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"h2 z"&$PLAYER~SURROUNDLIMP&"*zc* "
      subtract $PLAYER~LIMPETS $PLAYER~SURROUNDLIMP
    end

    if (($PLAYER~SURROUNDMINE > 0) and (($PLAYER~ARMIDS > $PLAYER~SURROUNDMINE) and ($PLAYER~ARMIDS > 0)))
      setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"h1 z"&$PLAYER~SURROUNDMINE&"*zc* "
      subtract $PLAYER~ARMIDS $PLAYER~SURROUNDMINE
    end

    setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"< "
    if (($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK) and ($PLAYER~CURRENT_SECTOR > 10))
      setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"za z "&$SHIP~SHIP_MAX_ATTACK&"* * "
    end
  end
  add $GRID~I 1
end
if ((($PLAYER~SURROUNDFIGS > 0) and ($PLAYER~FIGHTERS > $PLAYER~SURROUNDFIGS)) and (($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK) and ($PLAYER~CURRENT_SECTOR > 10)))
  setvar $GRID~SURROUNDSTRING $GRID~SURROUNDSTRING&"f z"&$PLAYER~SURROUNDFIGS&"*zc"&$GRID~DEPLOYFIG&"*  "
  subtract $PLAYER~FIGHTERS $PLAYER~SURROUNDFIGS
  setvar $GRID~TARGET $PLAYER~CURRENT_SECTOR
  setsectorparameter $GRID~TARGET "FIGSEC" TRUE
end
send $GRID~SURROUNDSTRING
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:grid~pgrid
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
# Required:
# $grid~pgridSector
#
# Optional:
# $grid~xporting
# $grid~pgrid_xportship
# $grid~pgrid_scan
# $grid~pgrid_wave
# $grid~pgrid_fighterDrop
# $grid~pgrid_surrender
# $grid~pgrid_waves

loadvar $map~stardock
loadvar $SHIP~SHIP_MAX_ATTACK

if ($pgridSector = 0)
	setVar $SWITCHBOARD~message "Invalid sector number.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
if ($pgridSector < 11)
	setVar $SWITCHBOARD~message "Cannot PGRID into FedSpace!*"
	gosub :SWITCHBOARD~switchboard
	halt
elseif ($pgridSector = $map~stardock)
	setVar $SWITCHBOARD~message "Cannot PGRID into STARDOCK!*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if ($grid~incitadel = 0)
  setVar $grid~incitadel ""
end

if ($grid~pgrid_fighterDrop = 0)
  setVar $grid~pgrid_fighterDrop 1
end

if ($grid~pgrid_waves = 0)
  setVar $grid~pgrid_waves 1
end

# yes, true is the default, unless explicitly false
if ($grid~pgrid_surrender = 0)
  setvar $grid~pgrid_surrender TRUE
end

gosub :PLAYER~QUIKSTATS
setVar $startingLocation $PLAYER~CURRENT_PROMPT
setVar $startingsector $PLAYER~CURRENT_SECTOR
setVar $startingship $PLAYER~SHIP_NUMBER
setVar $bot~validPrompts "Command Citadel"
gosub :PLAYER~CHECKSTARTINGPROMPT

if ($startingLocation = "Citadel")
	setVar $inCitadel "Q Q "
else
	setVar $inCitadel ""
end

if ($grid~pgrid_xporting = "")
  setVar $grid~pgrid_xporting FALSE
end

setvar $pgrid_xportshipFound FALSE

if ($grid~pgrid_xporting = TRUE)
	send "czq"
	waitfor "-----------------------------------------------------------------------------"
	:shipsagain
	setTextTrigger shipsDone :shipsDone "Computer command ["
	setTextLineTrigger shipFound :shipFound ""
	pause

	:shipFound
	killalltriggers
	getWord CURRENTLINE $maybeship 1
	isNumber $test $maybeship
	if ($test)
		if ($maybeship = $pgrid_xportship)
			getWord CURRENTLINE $xportshipsector 2
			setVar $pgrid_xportshipFound true
			goto :shipsDone
    end
  else
    if ($maybeship = "Computer")
      goto :shipsdone
    end
  end
  goto :shipsagain

	:shipsDone
	killalltriggers
	if ($pgrid_xportshipFound = FALSE)
		setVar $SWITCHBOARD~message "Could not find xport ship in shipscan*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
  if ($pgrid_xportshipFound = TRUE)
	if ($SHIP~SHIP_XPORT_RANGE <= 0)
		gosub :SHIP~getShipStats
	end
	send "cf" $pgridSector "*" $xportshipsector "*q"
	setTextLineTrigger shortestPath1 :shortestPath1 "The shortest path"
	setTextLineTrigger noRouteToSec1 :noRouteToSec1 "No route within "
	settextLineTrigger whatsThePoint1 :whatsThePoint1 "So what's the point?"
	pause
		:noRouteToSec1
		killalltriggers
		setVar $SWITCHBOARD~message "Error determining path, ship out of range or avoids blocking path.*"
		gosub :SWITCHBOARD~switchboard
		halt
		:shortestPath1
		killalltriggers
		getWord CURRENTLINE $dist1 4
		stripText $dist1 "("
		if ($dist1 > $SHIP~SHIP_XPORT_RANGE)
			setVar $SWITCHBOARD~message "Return XPort will be out of range.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		:whatsThePoint1
		killalltriggers

	send "cf" $xportshipsector "*" $pgridSector "*q"
	setTextLineTrigger shortestPath2 :shortestPath2 "The shortest path"
	setTextLineTrigger noRouteToSec2 :noRouteToSec2 "No route within "
	settextLineTrigger whatsThePoint2 :whatsThePoint2 "So what's the point?"
	pause
		:noRouteToSec2
		killalltriggers
		setVar $SWITCHBOARD~message "Error determining path, ship out of range or avoids blocking path.*"
		gosub :SWITCHBOARD~switchboard
		halt
		:shortestPath2
		killalltriggers
		getWord CURRENTLINE $dist2 4
		stripText $dist2 "("
		if ($dist2 > $SHIP~SHIP_XPORT_RANGE)
			setVar $SWITCHBOARD~message "First XPort will be out of range.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		:whatsThePoint2
		killalltriggers
  else
    setVar $SWITCHBOARD~message "Invalid xport ship entered*"
	  gosub :SWITCHBOARD~switchboard
	  halt
  end
end

if ($startingLocation = "Citadel")
	send "q"
	gosub :PLANET~getPlanetInfo
	send "c "
end

if ($SHIP~SHIP_MAX_ATTACK <= 0)
	gosub :SHIP~getShipStats
end

setVar $i 1
setVar $isFound false
while (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] > 0)
	if (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] = $pgridSector)
		setVar $isFound TRUE
	end
	add $i 1
end
if ($isFound = FALSE)
	setVar $SWITCHBOARD~message "Cannot PGRID.  Sector " & $pgridsector & " not Adjacent, aborting..*"
	gosub :SWITCHBOARD~switchboard
	halt
end 
setvar $switchboard~message "Planet gridding into sector " & $pgridSector & "* c v* y* " & $pgridSector & "* q "

setVar $mac " * "
if ($pgrid_waves <= 0)
	setVar $pgrid_waves 1
end
if ($wave > 0)
	setVar $mac $mac & "a z"&$wave&"* * r * "
else
	if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
		setVar $mac $mac & "a z " & ($PLAYER~FIGHTERS-1) & "9999" & "* * "
	else
		setVar $i 1
		while (($i <= $pgrid_waves) AND ($PLAYER~FIGHTERS >= $SHIP~SHIP_MAX_ATTACK))
			setVar $mac $mac & "a z " & ($SHIP~SHIP_MAX_ATTACK-1) & "9999" & "* * "
			add $i 1
			subtract $PLAYER~FIGHTERS ($SHIP~SHIP_MAX_ATTACK-1)
		end
	end
end
if ($unsafe = true)
	setVar $mac $mac & "f z "&$fighterDrop&" * z c d l j" & #8 & $planet~planet & "* l j" & #8 & $planet~planet & "*  "
elseif ($xporting = false)
	setVar $mac $mac & "j r * f z "&$fighterDrop&" * z c d * "
else
	# still testing - but not adding anything - not even the reteat
end
setVar $previousPlanetsInSector SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
if ($pgrid_scan = TRUE)
	send "s* "
end
if (($player~scan_type <> "None") AND ($pgrid_scan = TRUE))
		:density_scanning

	if ($pgrid_density > 0)
		setVar $tempDensity $pgrid_maxdensity
	else
		setVar $tempDensity SECTOR.DENSITY[$pgridsector]
	end

	   # setVar $tempDensity SECTOR.DENSITY[$pgridsector]
		setVar $pgridDensity "-99"
		send "q q sdz* l " & $planet~planet & "* c  "
		waitOn "Relative Density Scan"
		setTextLineTrigger denscheck  :getDensityPgrid " " & $pgridSector & "  ==>"
		setTextLineTrigger denscheck2 :getDensityPgrid2 " " & $pgridSector & ") ==>"
		setTextLineTrigger denscheck3 :getDensityPgrid "(" & $pgridSector & ") ==>"
		setTextLineTrigger denscheckdone :doneDensityCheck "<Enter Citadel>"
		pause
		:getDensityPgrid
		killtrigger denscheck
		killtrigger denscheck3
		killtrigger denscheck2
		getWord CURRENTLINE $pgridDensity 4
		stripText $pgridDensity ","
		stripText $pgridDensity "."
		pause
		:getDensityPgrid2
		killtrigger denscheck
		killtrigger denscheck3
		killtrigger denscheck2
		getWord CURRENTLINE $pgridDensity 5
		stripText $pgridDensity ","
		stripText $pgridDensity "."
		pause
		:doneDensityCheck
		killalltriggers
		if ($tempDensity <> "-1")
			if ($pgridDensity = "-99")
				setVar $SWITCHBOARD~message "Last Density Scan was not correctly grabbed, cannot safely continue.*"
				gosub :SWITCHBOARD~switchboard
				halt
			elseif ($pgridDensity > $tempDensity)
				setVar $SWITCHBOARD~message "Density increased since last scan in sector "&$pgridsector&". ("&$pgridDensity&")*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message "You must density scan sector "&$pgridsector&" at least once before pgridding.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
end 
setVar $newPlanetsInSector SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
if (($previousPlanetsInSector < $newPlanetsInSector) AND ($newPlanetsInSector > 1))
	setVar $SWITCHBOARD~message "Planet number increased since last scan in this sector. Try again to override.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
if ($pgrid_retreat)
	send $incitadel & "m " & $pgridSector & $mac & "< n n n * "

	if ($pgrid_surrender = TRUE)
		send " h s y * "
	end
	if ($planet~planet > 0)
		send "l j" & #8 & $planet~planet & "*  *  "
	end
	gosub :PLAYER~QUIKSTATS
	if (($PLAYER~CURRENT_SECTOR <> $grid~startingsector))
		send "'" & $pgridSector & "=saveme* "
		gosub :emergencyLanding
		setvar $switchboard~message "Unsuccessful retreat from sector " & $pgridSector & ". Attempted saveme call.*"
	else
		if ($PLAYER~CURRENT_PROMPT = "Planet")
			send "m * * * c p " & $pgridsector & "* y s* "
		end
		gosub :PLAYER~QUIKSTATS
		if ($PLAYER~CURRENT_SECTOR = $pgridsector)
			setVar $SWITCHBOARD~message "Successfully P-gridded into sector " & $pgridSector & "*"
			setVar $target $pgridSector
			setSectorParameter $target "FIGSEC" TRUE
		else
			setVar $SWITCHBOARD~message "No fighter deployed in sector " & $pgridSector & "*"
			gosub :SWITCHBOARD~switchboard
		end
	end
else

	if ($xporting = false)
		setVar $pgridString "'" & $pgridSector & "=saveme* " & $incitadel & "m " & $pgridSector & $mac
	else
		# Xporting - we will grid in > Xport out > wait > xport in and drop fig/saveme
		setVar $pgridString $incitadel & "m " & $pgridSector & $mac

	end	

	if ($xporting)
		setVar $pgridString $pgridString & "x   " & $pgrid_xportship & "* * "
	else 
		if ($pgrid_surrender = TRUE)
			setVar $pgridString $pgridString & " h s y * "
		end
	end
	send $pgridString
	if ($xporting)
		gosub :PLAYER~QUIKSTATS
		if ($PLAYER~SHIP_NUMBER = $startingship)
			gosub :emergencyLanding
			setVar $SWITCHBOARD~message "Unsuccessful xport out of sector " & $pgridSector & ". Ship too far away or I was photoned.*"  
			gosub :SWITCHBOARD~switchboard
			send " f 1* c d  * * "
			send "'" & $player~Current_sector & "=saveme* "
			gosub :emergencyLanding
		else
			getRND $theDelay 150 450
			setDelayTrigger waitPgridXport :goPgridXport $theDelay
			pause
				:goPgridXport
				
				send "'" & $pgridSector & "=saveme* x   " & $startingship & "* * f "&$fighterDrop&" * c d "
				gosub :emergencyLanding
				gosub :PLAYER~QUIKSTATS
				if ($PLAYER~CURRENT_PROMPT = "Planet")
					send "m * * * c s* "
				end
				if ($PLAYER~SHIP_NUMBER <> $startingship)
					setVar $SWITCHBOARD~message "Gridding ship not available for re-export.  Bot is in safe ship.*" 
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Successfully P-gridded w/xport into sector " & $pgridSector & "*"
					gosub :SWITCHBOARD~switchboard
				end
			
		end
	else
		gosub :emergencyLanding
		gosub :PLAYER~QUIKSTATS
		if (($PLAYER~CURRENT_SECTOR <> $pgridSector))
			setVar $SWITCHBOARD~message "Unsuccessful P-grid into sector " & $pgridSector & ". Someone make sure bot is picked up.*"
			gosub :SWITCHBOARD~switchboard
		else
			setVar $SWITCHBOARD~message "Successfully P-gridded into sector " & $pgridSector & "*"
			gosub :SWITCHBOARD~switchboard
			setVar $target $pgridSector
			setSectorParameter $target "FIGSEC" TRUE
		end
	end
end
halt
:emergencyLanding
setVar $i 0
while ($i < 15)
	add $i 1
	send "l j" & #8 & $planet~planet & "*  *  "
end
gosub  :player~currentPrompt
if ($PLAYER~current_prompt = "Planet")
	send "m * * * c s* "
end
return
# ======================     END PGRID (PGRID) SUBROUTINE     ==========================

include "source\include\ship"
include "source\include\planet"
include "source\include\player"
