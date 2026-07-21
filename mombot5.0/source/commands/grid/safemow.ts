gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Safe Mow - Move to a sector safely"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"   Usage: safemow {sector} {figs to drop} {p}"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"   {p} = port at destination"
gosub :help~helpfile

killalltriggers
gosub :player~quikstats

if ($player~scan_type = "None")
	setvar $switchboard~message "Safe Mow can only be run when you have a long range scanner.*"
	gosub :switchboard~switchboard
	halt
end

setVar $startingLocation $player~current_prompt
setVar $validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
gosub :player~checkStartingPrompt
if ($startingLocation = "Command")
	gosub :ship~getShipStats
elseif ($ship~SHIP_MAX_ATTACK <= 0)
	setVar $ship~SHIP_MAX_ATTACK 99991111
end

setVar $destination $bot~parm1
isNumber $number $destination
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	halt
elseif (($destination <= 0) OR ($destination > SECTORS))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm2 = "p")
	setVar $are_we_docking TRUE
else
	if ($bot~parm3 = "p")
		setVar $are_we_docking TRUE
	else
		setVar $are_we_docking FALSE
	end
end

setVar $figsToDrop $bot~parm2
isNumber $number $figsToDrop
if ($number <> 1)
	if ($bot~parm2 <> "p")
		setvar $switchboard~message "Fighters to drop entered is not a number, cannot mow!*"
		gosub :switchboard~switchboard
		halt
	end
	setVar $figsToDrop 0
elseif ($figsToDrop > 50000)
	setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
	gosub :switchboard~switchboard
	halt
end

if ($ship~SHIP_MAX_ATTACK > $player~fighters)
	setVar $ship~SHIP_MAX_ATTACK 9999
end

:tryroute
getcourse $mowCourse $currentsector $destination
if ($mowCourse[1] = 0)
	gosub :getcourse
end

setVar $j 3
setVar $result "q q q * "
setVar $isSafe TRUE

while (($j <= $courseLength) AND ($isSafe))
	setVar $nextSafeSector $mowCourse[$j]
	if ($player~scan_type = "Holo")
		send "sdsh"
	elseif ($player~scan_type = "Dens")
		send "sd"
	end
	gosub :player~quikstats
	setVar $minesSafe ((SECTOR.MINES.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp"))))
	setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
	setVar $planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $stardock) OR ($nextSafeSector <= 10)))
	setVar $navHazSafe (SECTOR.NAVHAZ[$nextSafeSector] <= 0)
	setVar $densitySafe (SECTOR.DENSITY[$nextSafeSector] <= 0)
	setVar $limpetsSafe (SECTOR.ANOMOLY[$nextSafeSector] = FALSE) OR ((((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp"))))
	if ($densitySafe OR ($limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planetSafe))
		send "m "&$mowCourse[$j]&"* "
	else
		setavoid $mowCourse[$j]
		goto :tryroute
	end
	if (($figsToDrop > 0) AND ($mowCourse[$j] > 10) AND ($mowCourse[$j] <> STARDOCK) AND ($j > 2))
		send "f "&$figsToDrop&" * c d "
		setVar $target $mowCourse[$j]
		#gosub :addFigToData
	end
	add $j 1
end

setVar $docking_instructions ""
if ($are_we_docking)
	setVar $docking_instructions " p z t *"
	if ($destination = $stardock)
		setVar $docking_instructions " p z s g y g q h *"
	end
	send $docking_instructions
end

gosub :player~quikstats
if ($player~current_sector <> $destination)
	setvar $switchboard~message "Safe mow did not reach destination!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Safe mow completed.*"
	gosub :switchboard~switchboard
end
halt

:getCourse
setVar $sectors ""
settextlinetrigger sectorsnogo :sectorsnogo "Error - No route within"
setTextLineTrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"*q"
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
getWordPos $line $pos " "&$destination&" "
getWordPos $line $pos2 "("&$destination&")"
getWordPos $line $pos3 "TO"
if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
	goto :gotSectors
else
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
	setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
	setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
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
halt

# includes:
include "source\include\loadvars"
include "source\include\move"
include "source\include\help"
include "source\include\switchboard.ts"
