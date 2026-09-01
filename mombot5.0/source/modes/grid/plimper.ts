gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Keeps personal limpets loaded in the current sector."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  plimper {limit} {saveme} {credits:xxxxxxx}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"    {limit} - minimum limpets in sector (default: 250)."
setvar $help~help[6] $help~tab&"   {saveme} - run saveme while keeping limps current."
setvar $help~help[7] $help~tab&"  {credits} - minimum credits to furb (default: 5000000)"
setvar $help~help[8] $help~tab&"   "
setvar $help~help[9] $help~tab&"   Run from Citadel, blue alignment, with T-warp and Stardock known."
setvar $help~help[10] $help~tab&"   Refurbs limpets at Stardock and reloads the sector after limp hits."
gosub :help~helpfile

gosub :player~quikstats
setvar $startingsector $player~current_sector

if ($map~stardock = 0) or ($map~stardock = "")
	setvar $switchboard~message "Stardock not known, cannot run plimper!*"
	gosub :switchboard~switchboard
	halt
end

if ($player~alignment < 1000)
	setvar $switchboard~message "Blue alignment required to run plimper!*"
	gosub :switchboard~switchboard
	halt
end

if ($player~twarp_type = "No")
	setvar $switchboard~message "T-warp required to run plimper!*"
	gosub :switchboard~switchboard
	halt
end

if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Plimper must be started from Citadel prompt!*"
	gosub :switchboard~switchboard
	halt
end

if ($player~alignment < 1000)
	setvar $switchboard~message "Blue check failed, this script loads limps from sd.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $USER_COMMAND_LINE $POS "saveme"
if ($POS > 0)
	setvar $saveme 1
else
	setvar $saveme 0
end

isnumber $test $bot~parm1
if ($test = true)
	setvar $limit $bot~parm1
else
	setvar $limit 250
end

getwordpos $user_command_line $pos "credits:"
if ($pos > 0)
	getword $user_command_line $pos $test
	gettext $test $creds "credits:" " "
	striptext $test ","
	isnumber $test2 $test
	if ($test2 = true)
		setvar $cashtofurb $test
	else
		setvar $switchboard~message "Invalid credits argument, type " & $command & " help for instructions.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $cashtofurb 5000000
end

if ($limit >= 100)
	setvar $reload ($limit / 2)
else
	setvar $reload 50
end

setvar $switchboard~message "Trader Vics Limpet Tracker Avoidance Script Powering Up!*"
gosub :switchboard~switchboard

send "q"
gosub :planet~getplanetinfo
send "c"
waiton "Citadel treasury contains"

:start
gosub :player~quikstats
if ($player~limpets < $limit)
	gosub :furb
end

send "s"
waiton "<Scan Sector>"
waiton "Citadel treasury contains"

setvar $figowner sector.figs.owner[$player~current_sector]
if (($figowner <> "belong to your Corp") and ($figowner <> "yours"))
	setvar $switchboard~message "*No Fighter Present In Current Sector*"
	gosub :switchboard~switchboard
	halt
end

setvar $seclimps sector.limpets.quantity[$startingsector]
setvar $plimps $player~limpets

if (($seclimps + $plimps) >= $limit)
	setvar $dlimps $limit
else
	setvar $dlimps ($seclimps + $plimps)
end

#echo "*Sector limps: "&$seclimps&"  Player limps: "&$plimps&"  Total limps: "&($seclimps + $plimps)&"  Deploy: "&$deploy&"*"
if ($seclimps < $reload)
#	if ($plimps < $limit)
#		gosub :furb
#	end
	send "q t * * 1* m * * * q h 2 z " & $dlimps & "* z p * dl " & $planet~planet & "* C @"
	waiton "Average Interval Lag"
	if (sector.limpets.owner[$startingsector] <> "yours") or (sector.limpets.quantity[$startingsector] < 1)
		setvar $switchboard~message "Unable To Drop Personal Limps!*"
		gosub :switchboard~switchboard
		halt
	end
	gosub :player~quikstats
	if ($player~total_holds <> $player~ore_holds)
		setvar $switchboard~message "Planet Short On Gas! Halting.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $switchboard~message $dlimps&" mines deployed personal*"
	gosub :switchboard~switchboard
end

killalltriggers
echo ansi_15 & "***                    "&ansi_14&"!!"&ansi_15&" WAITING FOR LIMP/SAVEME HIT "&ansi_14&"!!"&"*"
echo ansi_7 & "                       Press "&ansi_14&"@"&ansi_7&" To Force A Furb**"
settextlinetrigger	hit		:hit	"Limpet mine in " & $player~current_sector & " activated"
settextouttrigger	furbme	:furbme	"@"
if ($saveme)
	settextlinetrigger s1 :announce "script?"
	settextlinetrigger s2 :announce "Script?"
	settextlinetrigger s3 :savecall "=saveme"
end
setstrigger 		p1 		:paused "Planet command (?=help) [D]"
settexttrigger 		p2 		:paused "] (?=Help)?"
settexttrigger 		p3 		:paused "Beam to what sector? (U=Upgrade Q=Quit)"
settexttrigger 		p4 		:paused "Transfer To or From the Planetary Shield System (T/F) [T]?"
settexttrigger 		p5 		:paused "Qcannon Control Type :"
settexttrigger 		p6 		:paused "What level do you want (0-100) ?"
settexttrigger 		p7 		:paused "Do you want to change this setting? (Y/N)"
settexttrigger 		p8 		:paused "What sector do you want to warp this planet to? (Q to Abort)"
settexttrigger 		p9 		:paused "Transfer To or From the Treasury (T/F) [F]?"
settexttrigger 		p10 	:paused "[Pause]"
setstrigger 		p11 	:paused "Sub-space radio"
settexttrigger 		p12 	:paused "Federation comm-link:"
pause

:paused
killalltriggers
echo "**" ansi_11 "Paused. Return to Cidadel Prompt to Restart.**"
settextlinetrigger	hit2		:hit2	"Limpet mine in " & $player~current_sector & " activated"
setdelaytrigger		reminder	:paused 180000
waiton "Citadel command (?="
goto :start

:hit2
#this tracks limp hits while script is paused
killalltriggers
subtract $player~limpets 1
if (sector.limpets.quantity[$player~current_sector] < $limit) or ($player~limpets < ($limit + 10))
	echo "***"& ansi_12 & "                     !!!"&ansi_15&" LIMPET LIMIT REACHED " &ansi_12&"!!!***"
end
goto :paused

:hit
killalltriggers
subtract $player~limpets 1
goto :start

:furbme
killalltriggers
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	send $tagline & "Wrong Prompt. Halting*"
	halt
end
gosub :furb
goto :start

:msgs_on
:on_again
settexttrigger onmsgs_on :onmsgs_on "Displaying all messages."
settexttrigger onmsgs_off :onmsgs_off "Silencing all messages."
send "|"
pause

:onmsgs_off
killalltriggers
goto :on_again

:onmsgs_on
killalltriggers
setvar $msgs_on true
return

:msgs_off
:off_again
settexttrigger offmsgs_off :offmsgs_off "Silencing all messages."
settexttrigger offmsgs_on :offmsgs_on "Displaying all messages."
send "|"
pause

:offmsgs_on
killalltriggers
goto :off_again

:offmsgs_off
setvar $msgs_on false
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:furb
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
setvar $cashtofurb 5000000

if ($player~credits < $cashtofurb)
	setvar $cashtotransfer ($cashtofurb-$player~credits)
	send "qdc"
	waiton "Citadel treasury contains "
	getword currentline $citcash 4
	striptext $citcash ","
	striptext $citcash "."
	if ($citcash < $cashtotransfer)
        setvar $cashtotransfer $citcash
		setvar $switchboard~message "Warning: not enough cash to fully furb, please check citadel.*"
		gosub :switchboard~switchboard
	end
	send "t f "&$cashtotransfer&"*"
	waiton "credits, and the Treasury"
	setvar $switchboard~message $cashtotransfer &" credits taken from citadel.*"
	gosub :switchboard~switchboard
end

send "'" & $bot_name & " LSD 0@0@0@0@0@N@M@0@0@N@0@0@N@0@0@0@0@0@0@0*"
waiton "LSDv4.0 Completed"
gosub :player~quikstats
if ($player~current_prompt = "Planet")
	send "c"
elseif ($player~current_prompt = "Command")
	send "l " & $planet~planet & "* c"
end
if ($player~limpets >= $reload)
	setvar $switchboard~message "Refurb successful.*"
else
	setvar $switchboard~message "Furb failed! Halting.*"
end
gosub :switchboard~switchboard
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:announce
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
setvar $subline currentline
cuttext $subline $spoof 1 1
if ($spoof <> "R")
	goto :start
end
setvar $switchboard~message "*Save Me - Running from planet " & $planet & "*"
gosub :switchboard~switchboard
goto :start

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:savecall
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
setvar $line currentline
gosub :authenticate
if ($auth_result = "true")
	cuttext $line $target_sector 9 13
elseif ($auth_result = "self")
	cuttext $line $target_sector 2 12
else
	goto :start
end
setvar $target_sector " " & $target_sector
striptext $target_sector " 000"
striptext $target_sector " 00"
striptext $target_sector " 0"
striptext $target_sector " "
striptext $target_sector "=saveme"
isnumber $isnum $target_sector
setvar $mac  "P" & $target_sector & "*Y"
setvar $saveme_mac $mac&$mac&$mac&$mac&$mac&$mac&$mac&$mac&$mac&$mac
if ($isnum = 1)
	if (($target_sector > 0) and ($target_sector <= sectors))
		settextlinetrigger abort :abort "abort saveme"
		settextlinetrigger there :there "You are already in that sector!"
		setvar $i 0
		setvar $j 0
		send $saveme_mac

		:pwarp1
		add $i 1
		add $j 1
		if ($j = 100)
			send "'no fig down yet, 100 attempts, aborting*"
			goto :start
		elseif ($i = 10)
			send "'no fig down yet*"
			setvar $i 0
		end
		send "P" & $target_sector & "*Y"
		settextlinetrigger nofig :nofig "You do not have any fighters"
		pause

		:nofig
		goto :pwarp1

		:there
		killtrigger abort
		killtrigger nofig
		send "'Saveme script activated - Planet " & $planet~planet & " to " & $target_sector & " on attempt " & $j & ".*"
		send "IS*"
		setdelaytrigger savemereturn :returnsaveme 10000
		pause

		:returnsaveme
		send "P" & $startingsector & "*Y"
		goto :start

		:abort
		killtrigger nofig
		killtrigger abort
		setvar $switchboard~message "Save Aborted*"
		gosub :switchboard~switchboard
		goto :returnsaveme
	else
		send "'Invalid save call (out of range)*"
		goto :returnsaveme
	end
else
	send "'Invalid save call (non-numeric)*"
	goto :returnsaveme
end

:end
killalltriggers
send "P" & $startingsector & "*Y"
goto :start

:authenticate
killalltriggers
setvar $subline $line
setvar $subline $subline & "             "
getword $subline $spoof 1
cuttext $subline $subsender 3 6
setvar $auth_result "false"
if ($spoof = "'")
	setvar $auth_result "self"
elseif ($spoof = "R")
	setvar $auth_result "true"
end
return

# includes

include "include/loadvars.ts"
include "include/help.ts"
include "include/player.ts"
include "include/planet.ts"
include "include/ship.ts"
include "include/switchboard.ts"
