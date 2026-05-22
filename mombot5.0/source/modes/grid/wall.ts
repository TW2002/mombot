#Look at making mow holo more efficent
#turn limit or reporting?
loadvar $switchboard~bot_name
gosub :loadvars~loadvars
gosub :help~initialize
clearallavoids
#HELP FILE
setvar $help~help[1]  $help~tab&"   The Wall"
setvar $help~help[2]  $help~tab&"  "
setvar $help~help[3]  $help~tab&"   wall [Origin] [Distance] {holo} {limit:n}"
setvar $help~help[4]  $help~tab&"         "
setvar $help~help[5]  $help~tab&"   Plots courses to find all sectors Distance from Origin"
setvar $help~help[6]  $help~tab&"         "
setvar $help~help[7]  $help~tab&"   holo - Will holo all unexplored sectors."
setvar $help~help[8]  $help~tab&"   limit:n - will only mow N plots"
setvar $help~help[9]  $help~tab&"  designed for day 1 use with no ZTM."

gosub :help~helpfile

gosub :player~quikstats
setvar $location $player~current_prompt

setvar $doholo 0
setvar $origin 0
setvar $distance 0

setvar $minfigs 100
setvar $restockterra 0
setvar $endfigsonly 0

# do the first block - to set WALLBLOCK
setvar $block 0
# use the block
setvar $useblock 0

setarray $blocks sectors

if ($bot~parm1 = 0)
	setvar $bot~parm1 ""
end

isnumber $test $bot~parm1
if ($test)
	if ($bot~parm1 <= sectors)
		setvar $switchboard~message "Using Origin Sector: " & $bot~parm1 & "*"
		gosub :switchboard~switchboard
		setvar $origin $bot~parm1
	else
		setvar $switchboard~message "Origin should be from 1 to  " & sectors & "*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Origin should be from 1 to  " & sectors & "*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm2 = 0)
	setvar $bot~parm2 ""
end

isnumber $test $bot~parm2
if ($test)
	if ($bot~parm2 <= 12) and ($bot~parm2 >= 2)
		setvar $switchboard~message "Putting up fig wall " & $bot~parm2 & " warps from origin.*"
		gosub :switchboard~switchboard
		setvar $distance $bot~parm2
	else
		setvar $switchboard~message "Distance should be 2 to 12 warps from origin.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Distance should be 2 to 12 warps from origin.*"
	gosub :switchboard~switchboard
	halt
end

send "v"
settextlinetrigger getbackdockcrazy :getbackdockcrazy "The StarDock is located in sector"
pause

:getbackdockcrazy
killalltriggers
getword currentline $stardock 7
striptext $stardock "."

if (($player~current_sector = $origin) or ($player~current_sector < 11) or ($player~current_sector = $stardock))
	setvar $switchboard~message "Can not start from origin or fed space.*"
	gosub :switchboard~switchboard
	halt

end

getwordpos $bot~user_command_line $pos "limit:"
if ($pos > 0)
	setvar $cline $bot~user_command_line & " "
	gettext $cline $limitresults "limit:" " "
	setvar $switchboard~message "Limiting to " & $limitresults & " results.*"
	gosub :switchboard~switchboard
end

if ($location <> "Command")
	setvar $switchboard~message "Please start from the command prompt"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "holo"
if ($pos > 0)
	setvar $doholo 1
end

# do the first block - to set WALLBLOCK
setvar $block 0
# use the block
setvar $useblock 0

getwordpos $bot~user_command_line $pos "useblock"
if ($pos > 0)
	setvar $useblock 1
	send "'Using useblock routine in wall*"
else
	getwordpos $bot~user_command_line $pos "block"
	if ($pos > 0)
		setvar $block 1
		send "'Using block routine in wall*"
	end
end

send "cv0*yyq"
setarray $destsectors 10
setarray $destsectorsok 10
setvar $i 1
while ($i <= 10)
	setvar $destsectorsok[$i] 1
	add $i 1
end

if ($useblock = 1)
	setvar $i 11
	while ($i <= sectors)
		getsectorparameter $i "WALLBLOCK" $res
		if ($res = 1)
			echo "Adding " $i "*"
			setvar $blocks[$i] 1
		end
		add $i 1
	end
end
setvar $targetsectors 0
setvar $targetsectorsi 0
setvar $badcourse 0
setvar $badcoursereq 0
setarray $sectorused sectors

gosub :setdestsectors
echo "DEST DESCTORS*"
setvar $i 1
while ($i <= 10)
	echo "DestSEctor:" $i " " $destsectors[$i] "*"
	if ($destsectors[$i] = 0)
		setvar $destsectorsok[$i] 0
	else
		add $badcoursereq 1
	end
	add $i 1
end

gosub :addexistingknowledge
if ($limitresults > 0)
	if ($targetsectorsi >= $limitresults)
		setvar $badcourse 99
	end
end
echo "BAD COURSES REQUIRED:" $badcoursereq "*"
echo "BAD COURSES REQUIRED:" $badcoursereq "*"
echo "BAD COURSES REQUIRED:" $badcoursereq "*"

while ($badcourse < $badcoursereq)
	gosub :sendplots
	if ($limitresults > 0)
		if ($targetsectorsi >= $limitresults)
			setvar $badcourse 99
		end
	end
end

send "cv0*yyq"
if ($block = 1)
	setvar $i 11
	while ($i <= sectors)
		setsectorparameter $i "WALLBLOCK" ""
		add $i 1
	end

	setvar $i 1
	while ($i <= $targetsectorsi)
		setsectorparameter $targetsectors[$i] "WALLBLOCK" "1"
		add $i 1
	end
	setvar $switchboard~message "Wall Completed Block Routine*"
	gosub :switchboard~switchboard
	halt
	halt
end

if ($useblock = 1)
	setvar $sectorlisti 0
	setvar $sectorlist 0
	echo "BLOCKING WALLBLOCK SECTORS*"
	echo "BLOCKING WALLBLOCK SECTORS*"

	send "c"
	waitfor "<Computer activated>"
	setvar $i 11
	while ($i <= sectors)

		if ($blocks[$i] = 1)
			send "v" $i "*"
		end
		add $i 1
	end
	send "q"
	waitfor "<Computer deactivated>"
	send "c"
	setvar $i 1
	while ($i <= $targetsectorsi)
		send "f" $stardock "*" $targetsectors[$i] "**"
		add $i 1
	end
	send "^q"
	send "q"

	:checkdockagain
	settextlinetrigger checkdockcheckpath :checkdockcheckpath "The shortest path"
	settextlinetrigger checkdocknocheckpath :checkdocknocheckpath "Error - No route within"
	settextlinetrigger checkdockcheckpathint :checkdockcheckpathint ": ENDINTERROG"
	pause

	:checkdockcheckpath
	killalltriggers
	goto :checkdockagain

	:checkdocknocheckpath
	killalltriggers
	getword currentline $gsec 14
	add $sectorlisti 1
	setvar $sectorlist[$sectorlisti] $gsec
	echo "Confirmed SD OK PAth:" $gsec "*"
	goto :checkdockagain

	:checkdockcheckpathint
	killalltriggers

	echo "**Unsorted Sectors " $sectorlisti " targets*"

else

	echo "**Unsorted Sector List " $targetsectorsi " targets*"
	setvar $sectorlisti $targetsectorsi
	setvar $sectorlist 0
	setvar $i 1
	while ($i <= $targetsectorsi)
		echo $i " " $targetsectors[$i] "*"
		setvar $sectorlist[$i] $targetsectors[$i]
		add $i 1
	end

end

#SORTING BROKE
#   goSub :sortSectors
#  setVar $SWITCHBOARD~message "Courses plotted, " & $targetSectorsi & " targets, covering approximately " & $temp_TotalDist & " moves*"
#  gosub :switchboard~switchboard
#setVar $i 1

#   while ($i <= $sectorListi)
#      echo $i " " $sectorCourse[$i] "*"
#     add $i 1
# end
#echo "now sectorListi " $sectorListi "*"
#halt
setvar $donevoids 0
gosub :checkdovoids

setvar $i 1
while ($i <= $sectorlisti)
	setvar $target $sectorlist[$i]
	echo $target " xxx *"

	getsectorparameter $target "FIGSEC" $hasfig
	if ($hasfig = 0) and ($player~current_sector <> $target)

		gosub :player~quikstats
		if ($player~fighters < $minfigs)
			setvar $switchboard~message "Fighters are low, stopping...*"
			gosub :switchboard~switchboard
			halt
		end
		setvar $bot~command "mow"
		if ($endfigsonly = 0)
			setvar $bot~user_command_line " mow "& $target & " 1 "
		else
			setvar $bot~user_command_line " mow "& $target & " 0 "
		end
		setvar $bot~parm1 $target

		if ($endfigsonly = 0)
			setvar $bot~parm2 1
		else
			setvar $bot~parm2 0
		end
		if ($doholo)
			setvar $bot~user_command_line  $bot~user_command_line & " holo "
			setvar $bot~parm3 "holo"
		else
			setvar $bot~parm3 ""
		end

		savevar $bot~parm1
		savevar $bot~parm2
		savevar $bot~parm3
		savevar $bot~command
		savevar $bot~user_command_line
		load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
		seteventtrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
		pause

		:mowended
		if ($doholo)
			setvar $holook 0
			setvar $y 1
			while ($y <= sector.warpcount[$target])
				if (sector.explored[sector.warps[$target][$y]] <> "YES")
					setvar $holook 1
				end
				add $y 1
			end
			if ($holook = 1)
				send "sh*"
				waitfor "Long Range Scan"
				waitfor "Command ["
			end
		end
		send "f1*cd"
		setsectorparameter  $target "FIGSEC" true
		gosub :checkdovoids
	end
	add $i 1
end
send "cv0*yyq"

setvar $switchboard~message "Unvoiding sectors and finishing up.. Done!*"
gosub :switchboard~switchboard
halt
halt

:sendplots
setvar $desti 1
send "c"
waitfor "<Computer activated>"
while ($desti <= 10)
	if ($destsectorsok[$desti] = 1)
		if ($destsectors[$desti] > 0)
			echo $destsectors[$desti] "*"
			send "f" $origin "*" $destsectors[$desti] "**"
		end

	end
	add $desti 1
end
send "^q"
gosub :checkcourse
send "q"
return

halt

:checkcourse
killalltriggers

:checkcoursemorepaths
setvar $course ""
settextlinetrigger checkpath :checkpath "The shortest path"
settextlinetrigger nocheckpath :nocheckpath "Error - No route within"
settextlinetrigger checkpathint :checkpathint ": ENDINTERROG"
pause

:checkpathint
killalltriggers
return

:nocheckpath
killalltriggers
getword currentline $destfail 14
echo "Fail Dest: " $destfail "*"

setvar $d 1
while ($d <=10)
	if ($destsectors[$d] = $destfail)
		setvar $destsectorsok[$d] 0
		setvar $d 99
	end
	add $d 1
end
add $badcourse 1
goto :checkcoursemorepaths

:checkpath
killalltriggers
getword currentline $courselen 4
striptext $courselen "("
if ($courselen <= $distance)
	echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
	echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
	echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
	echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
	#if this occurs, void it and move on
	halt
end

:keepadding2
settextlinetrigger addcourse2 :addcourse2 ">"
settexttrigger endcourse2 :endcourse2 "Computer command ["
pause

:addcourse2
killalltriggers
setvar $course $course & " " & currentline
goto :keepadding2

:endcourse2
killalltriggers
#5749 > (2496) > (7072) > (322) > (799) > (6950) > (5933) > 7113 > 609 > 1
setvar $prevwarp ""
setvar $y 1
setvar $countc 0
setvar $go 1
echo "$Course: " $course  "*"
while ($go = 1)

	getword $course $warp $y
	if ($warp <> ">")
		add $countc 1
		if ($countc = ($distance + 1))
			striptext $warp "("
			striptext $warp ")"
			if ($sectorused[$warp] = 0)
				if ($useblock = 1)
					if ($blocks[$warp] = 1)
						echo "Found $warp" $warp " But skipped as target it's a blocked target!!"
					else
						add $targetsectorsi 1
						setvar $targetsectors[$targetsectorsi] $warp
						setvar $sectorused[$warp] 1
						echo "Found $warp: " $warp " To list " & $targetsectorsi "*"
					end
				else
					add $targetsectorsi 1
					setvar $targetsectors[$targetsectorsi] $warp
					setvar $sectorused[$warp] 1
					echo "Found $warp: " $warp " To list " & $targetsectorsi "*"
				end

			end
			send "v" $warp "*"

		end

	end
	add $y 1
	if ($y > 50)
		setvar $go 0
	end
end
killalltriggers
goto :checkcoursemorepaths
return

:addexistingknowledge
getallcourses $allcourses $origin
send "c"
setvar $i 1
while ($i <= sectors)
	if ($allcourses[$i] = $distance)
		echo $i " "  $useblock " " $blocks[$i] "*"
		send "v" $i "*"
		if ($useblock = 1)
			if ($blocks[$i] = 1)
				echo "Found $warp" $warp " But skipped as target it's a blocked target!!"
			else
				add $targetsectorsi 1
				setvar $targetsectors[$targetsectorsi] $i
				setvar $sectorused[$i] 1
			end
		else
			add $targetsectorsi 1
			setvar $targetsectors[$targetsectorsi] $i
			setvar $sectorused[$i] 1
		end
		if ($limitresults > 0)
			if ($targetsectorsi >= $limitresults)
				setvar $i 99999
			end
		end
	end
	add $i 1
end
send "q"
waitfor "<Computer deactivated>"
return

:setdestsectors
setvar $successsectors 0
setvar $successattemp 11
# are goingt o stop at 10 Success Plots where we add them or not.
# if we are plotting out of a dead end or low warp area, we may not have 10
# and we dont' want double ups.

setvar $successplots 0
send "c"
while ($successplots < 10)

	setvar $i 1
	while ($i < 18)

		if ($successattemp = $origin)
			add $successattemp 1
		end
		send "f" $origin "*" $successattemp "**"
		add $successattemp 1
		add $i 1
	end
	send "^Q"

	:setdestwaitformore
	setvar $course ""
	settextlinetrigger destpath :destpath "The shortest path"
	settextlinetrigger nopath :nopath "Error - No route within"
	settextlinetrigger setdestplotsdone :setdestplotsdone ": ENDINTERROG"
	pause

	:nopath
	killalltriggers
	goto :setdestwaitformore

	:destpath
	killalltriggers
	getword currentline $courselen 4
	striptext $courselen "("
	if ($courselen <= $distance)
		goto :setdestwaitformore
	end

	:keepadding
	settextlinetrigger addcourse :addcourse ">"
	settexttrigger endcourse :endcourse "Computer command ["
	pause

	:addcourse
	killalltriggers
	setvar $course $course & " " & currentline
	goto :keepadding

	:endcourse
	killalltriggers
	#5749 > (2496) > (7072) > (322) > (799) > (6950) > (5933) > 7113 > 609 > 1
	setvar $prevwarp ""
	setvar $y 1
	setvar $countc 0
	setvar $go 1
	while ($go = 1)

		getword $course $warp $y
		if ($warp <> ">")
			add $countc 1
			if ($countc = ($distance + 2))
				striptext $warp "("
				striptext $warp ")"
				echo "Found $warp: " $warp " checking not in list and adding*"

				setvar $c 1
				setvar $oktoadd 1
				while ($c <= $successsectors)
					if ($destsectors[$c] = $warp)
						setvar $oktoadd 0
					end
					add $c 1
				end

				if ($oktoadd = 1)
					echo "Added $warp: " $warp " To list*"
					add $successsectors 1
					setvar $destsectors[$successsectors] $warp
				end
				add $successplots 1
				if ($successplots = 10)
					send "q"
					waitfor ": ENDINTERROG"
					return
				end

			end

		end
		add $y 1
		if ($y > 50)
			setvar $go 0
		end
	end
	goto :setdestwaitformore

	:setdestplotsdone
	killalltriggers

end
send "q"
return

:checkdovoids
# just void the origin and adjacent sectors

if ($donevoids = 1)
	return
end

gosub :player~quikstats
if ($player~current_sector = $origin)
	return
end

setvar $i 1
while ($i <= sector.warpcount[$origin])
	if ($player~current_sector = sector.warps[$origin][$i])
		return
	end
	add $i 1
end

if ($origin <> $stardock)
	send "cv" $stardock "*"
	setvar $i 1
	while ($i <= sector.warpincount[$stardock])
		send "v" sector.warpsin[$stardock][$i] "*"
		add $i 1
	end

	setvar $i 1
	while ($i <= sector.warpcount[$stardock])
		send "v" sector.warps[$stardock][$i] "*"
		add $i 1
	end
	send "q"
	waitfor "<Computer deactivated>"

end
send "cv" $origin "*"
setvar $i 1
while ($i <= sector.warpincount[$origin])
	send "v" sector.warpsin[$origin][$i] "*"
	add $i 1
end

setvar $i 1
while ($i <= sector.warpcount[$origin])
	send "v" sector.warps[$origin][$i] "*"
	add $i 1
end
send "q"
waitfor "<Computer deactivated>"

send "c"
setvar $i 1
while ($i <= 10)
	send "v" $i "*"
	add $i 1
end

send "q"
waitfor "<Computer deactivated>"

setvar $donevoids 1
return

############ SORTING MOVE TO INCLUDE ONE DAY

# Takes $sectorList - Array of sectors
# Takes $sectorListi - Length of that array
# Returns $sectorCourse
#  Future: add a param option, which would find sectors with param, then call this function
:sortsectors
setvar $searchsectors 0
setvar $sectorsleft 0
setvar $totalsectors $sectorlisti
setvar $sectorcourse 0
setvar $nextdistance 0
setvar $nextindex 2
setvar $sectorcourse[1] $sectorlist[1]
setvar $nextdistance[1] $sectorlist[1]

setvar $temp_totaldist 0

setvar $i 1
while ($i <= $sectorlisti)
	setvar $searchsectors[$i] $sectorlist[$i]
	setvar $sectorsleft[$i] $sectorlist[$i]
	add $i 1
end

setvar $x 1
setvar $sectorsleft[1] "-1"
setvar $fromsector $searchsectors[1]

setvar $baddist 0
setvar $baddistlog ""

while ($x < $totalsectors)

	setvar $y 1
	setvar $closestsector 99999
	setvar $closestdistance 99
	setvar $baddist 0
	while ($y <= $totalsectors)
		setvar $tosector $sectorsleft[$y]
		if ($tosector <> "-1")
			#echo " from:"  $fromSector " to: " $toSector "*"
			getdistance $dist $fromsector $tosector
			if ($dist = "-1")

				setvar $dist 25
				setvar $baddist 1

			end
			if ($dist <> "-1")
				if ($dist < $closestdistance)
					setvar $closestsector $tosector
					setvar $closestdistance $dist
				end
			end
		end
		add $y 1
	end
	if ($baddist = 1)
		setvar $baddistlog $baddistlog & " " & $fromsector

	end

	setvar $sectorcourse[$nextindex] $closestsector
	setvar $nextdistance[$nextindex] $closestdistance
	add $temp_totaldist $closestdistance

	setvar $y 1
	while ($y < $totalsectors)
		if ($sectorsleft[$y] = $closestsector)
			setvar $sectorsleft[$y] "-1"
		end
		add $y 1
	end

	if ($closestsector < 30001)
		setvar $fromsector $closestsector
	end

	gosub :sleep
	add $nextindex 1
	add $x 1
end
if ($baddislog <> "")
	setvar $switchboard~message $baddistlog & "*"
	gosub :switchboard~switchboard
end
return

:sleep
# This subroutine prevents twx from locking up, and allows you to
# use the $SX twx command to halt if necessary.
setdelaytrigger wake :wake 10
pause

:wake
killalltriggers
return

##########
#INCLUDES:
include "source\include\player"
include "source\include\loadvars"

include "source\include\help"
include "source\include\switchboard.ts"
