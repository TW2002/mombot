logging "OFF"
loadvar $bot_name
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
loadvar $backdoor
loadvar $rylos
loadvar $alpha_centauri
loadvar $command
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Mows to unfigged upgraded fuel ports in grid."
setvar $help~help[2] $help~tab&"Does not do so safely."
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&"  Usage: mowfuel"
gosub :help~helpfile
window "MOWWINDOW" 250 80 "Sectors Gridded" "ONTOP"
setarray $course 80
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "You must run this script from the Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
setvar $location $player~current_prompt
setvar $homesector $player~current_sector
setvar $lastdestination 1
send "c;q"
waiton "Max Figs Per Attack:"
getword currentline $maxfigattack2 5

:getplanetnum
send "qD"
waiton "Planet #"
getword currentline $planet 2
striptext $planet "#"
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*qjy"

setwindowcontents "MOWWINDOW" "Sectors Figged: "&$count&" out of "&sectors&"*"
gosub :landonplanetentercitadel
gosub :gettargets

:doagain
getrnd $random 1 $databasecount
getword $randomsectors $destination $random
if ($destination = 0)
	setvar $switchboard~message " Database Cleared - Refresh Figs and Restart.*"
	gosub :switchboard~switchboard
	halt
end
if ($destination <> $homesector)
	gosub :getcourses
	if ($valid)
		getdistance $distancethere $destination $lastdestination
		if ($distancethere < 0)
			send "/"
			waiton #179
			echo ansi_14 "Updating database...*" ansi_7
			send "^f"&$destination&"*"&$lastdestination&"*q"
			waiton "ENDINTERROG"
			getdistance $distancethere $destination $lastdestination
		end
		getdistance $distanceback $lastdestination $destination
		if ($distanceback < 0)
			send "/"
			waiton #179
			echo ansi_14 "Updating database...*" ansi_7
			send "^f"&$lastdestination&"*"&$destination&"*q"
			waiton "ENDINTERROG"
			getdistance $distanceback $lastdestination $destination
		end
		if (($distancethere >= 5) and ($distanceback >= 5))
			setvar $temp " "&$destination&" "
			replacetext $randomsectors $temp " "
			subtract $databasecount 1
			send "qm***t n t 1* q"
			gosub :mow
			setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: Attempting To Mow*"&$databasecount&" sectors left in database*"
			setwindowcontents "MOWWINDOW" $windowdata
			setvar $lastdestination $destination
		else
			setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: Sector Too Close To Last Target*"&$databasecount&" sectors left in database*"
			setwindowcontents "MOWWINDOW" $windowdata
		end

	else
		setvar $temp " "&$destination&" "
		replacetext $randomsectors $temp " "
		subtract $databasecount 1
	end
end
goto :doagain

:mow
gosub :player~quikstats
if ($maxfigattack2 > $player~fighters)
	setvar $maxfigattack2 9999
end
setvar $j 2
setvar $result ""
while ($j <= $courselength)
	setvar $result $result&"m  "&$course[$j]&"* "
	if (($course[$j] > 10) and ($course[$j] <> stardock))
		setvar $result $result&"za"&$maxfigattack2&"* z * "
	end
	if (($course[$j] > 10) and (($course[$j] <> $stardock) and ($j > 2)))
		setvar $result $result&"f 1 * c d "
	end
	add $j 1
end
send $result&"zr* "
gosub :player~quikstats
if ($player~current_sector <> $destination)
	setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: DANGER - Call Save Me Activated!"
	setwindowcontents "MOWWINDOW" $windowdata
	gosub :callsaveme

else
	send "f 1* c d  mz "&$homesector&"*y  y    *    "
	gosub :player~quikstats
	if ($player~current_sector <> $homesector)
		gosub :callsaveme
	end
	setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: Returned Home Safely*"&$databasecount&" sectors left in database*"
	setwindowcontents "MOWWINDOW" $windowdata
	gosub :landonplanetentercitadel
end
return

:getcourses
killalltriggers
setarray $course 80
setvar $sectors ""
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"*q"
pause

:sectorsline
killalltriggers
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
	setvar $sectors $sectors&" "&$line
end
getwordpos $line $pos " "&$destination&" "
getwordpos $line $pos2 "("&$destination&")"
getwordpos $line $pos3 "TO"
if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	goto :gotsectors
else
	settextlinetrigger sectorlinetrig :sectorsline " > "
	settextlinetrigger sectorlinetrig2 :sectorsline " "&$destination&" "
	settextlinetrigger sectorlinetrig3 :sectorsline " "&$destination
	settextlinetrigger sectorlinetrig4 :sectorsline "("&$destination&")"
	settextlinetrigger donepath :sectorsline "So what's the point?"
	settextlinetrigger donepath2 :sectorsline ": ENDINTERROG"
end
pause

:gotsectors
killalltriggers
setvar $sectors $sectors&" :::"
setvar $courselength 0
setvar $index 1
setvar $valid false

:keepgoing
getword $sectors $course[$index] $index
while ($course[$index] <> ":::")
	add $courselength 1
	add $index 1
	getword $sectors $course[$index] $index
	if ($course[$index] <> ":::")
		setvar $valid true
	end
end
if ($valid)
	setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: Attempting To Mow*"&$databasecount&" sectors left in database*"
else
	setvar $windowdata "Sectors Figged: "&$count&" out of "&sectors&"*Current Target: "&$destination&"*Target Status: Path Already Figged*"&$databasecount&" sectors left in database*"
end

setwindowcontents "MOWWINDOW" $windowdata

:nopath
killalltriggers
return

:gettargets
setvar $databasecount 0
setvar $randomsectors "  "
setvar $i 11
while ($i <= sectors)
	getsectorparameter $i "FIGSEC" $isfigged
	if (($i > 10) and ((port.buyfuel[$i] = false) and ((port.exists[$i] = true) and ($isfigged <> true))))
		setvar $currentfuel port.fuel[$i]
		multiply $currentfuel 100
		if (port.percentfuel[$i] <> 0)
			divide $currentfuel port.percentfuel[$i]
		end
		if ($currentfuel > 5000)
			setvar $randomsectors $randomsectors&$i&"  "
			add $databasecount 1
		end
	end
	add $i 1
end
return
include "source\include\player"

:callsaveme
killalltriggers
send "*"
waitfor "(?="
getword currentline $prompt 1
if ($prompt = "Citadel")
	echo "**Had to halt script, check ship to see if it is valid.**"
	halt
end
if (($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint"))
	send "q"
	waitfor "Command [TL"
end
gosub :player~quikstats
setvar $figstodeploy 1
gosub :deployfigs
setvar $savetarget $player~current_sector
if ($savetarget < 10)
	setvar $savetarget 0000&$savetarget
elseif ($savetarget < 100)
	setvar $savetarget 000&$savetarget
elseif ($savetarget < 1000)
	setvar $savetarget 00&$savetarget
elseif ($savetarget < 10000)
	setvar $savetarget 0&$savetarget

end
send "'"&$savetarget&"=saveme*"
send "'pickup "&$player~current_sector&" ::*"

:waitforhelp
settextlinetrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
settextlinetrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
settextlinetrigger towlocked :towlocked "locks a tractor beam on your ship."
setdelaytrigger timeout :timeout 30000
pause

:timeout
killalltriggers
send "'30 seconds after save call, script halted.*"
halt

:friendlytwarp
killalltriggers
setvar $figstodeploy "ALL"
gosub :deployfigs
goto :waitforhelp

:friendlyplanet
killalltriggers
gettext currentline $planet "Saveme script activated - Planet " " to "
send "L "&$planet&"* C 'I landed on planet "&$planet&"*"
halt

:towlocked
killalltriggers
setvar $figstodeploy 1
gosub :deployfigs
send "'Tow locked, get us out of here!*"
halt

:deployfigs
if ($figstodeploy = 0)
	setvar $figstodeploy 1
end
if (($player~current_sector < 11) or ($player~current_sector = stardock))
	send "'Can't deploy figs in fed*"
	return
end
send "F"
settextlinetrigger nocontrol :nocontrol "These fighters are not under your control."
settextlinetrigger abletodeploy :abletodeploy "fighters available."
pause

:nocontrol
killalltriggers
send "'We don't control the figs in this sector!*"
halt

:abletodeploy
killalltriggers
getword currentline $figsavailable 3
striptext $figsavailable ","
if ($figstodeploy = "ALL")
	setvar $figstodeploy $figsavailable
end
if ($figsavailable = 0)
	send "0* ZC D* 'I have no figs to deploy!*"
else
	send $figstodeploy&"* ZC D* '"&$figstodeploy&" figs deployed*"
end
return

:landonplanetentercitadel
send "l " $planet "* c"
waiton "<Enter Citadel>"
return

:leavecitadelandplanet
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
