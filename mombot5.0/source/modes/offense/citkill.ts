logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~latency
setvar $help~help[1]  $help~tab&"citkill {"&#34&"player name"&#34&"|corp#} {sg} {dt}"
setvar $help~help[2]  $help~tab&"        {empty} {smart} {override}"
setvar $help~help[3]  $help~tab&"Citadel Killer destroys enemy ships from planet citadel."
setvar $help~help[4]  $help~tab&"  "
setvar $help~help[5]  $help~tab&"{"&#34&"player name"&#34&"}   - Player to target, name must be"
setvar $help~help[6]  $help~tab&"                    surrounded by double quotes"
setvar $help~help[7]  $help~tab&"{corp#}           - Corporation number to target"
setvar $help~help[8]  $help~tab&"{sg}              - Shotgun mode, fires waves at"
setvar $help~help[9]  $help~tab&"                    first three possible targets"
setvar $help~help[10] $help~tab&"{dt}              - Doubletap mode, fires two waves"
setvar $help~help[11] $help~tab&"                    before refurbing"
setvar $help~help[12] $help~tab&"{empty}           - Will capture empty ships in sector"
setvar $help~help[13] $help~tab&"{smart}           - Notices changes in ship type/target"
setvar $help~help[14] $help~tab&"{override}        - Overrides safety on attacking defender bonus ships"
setvar $help~help[15] $help~tab&"{photon} (NA)     - Will fire photon to adjacent fig hits"
setvar $help~help[16] $help~tab&"{onetap}          - fire once only"
setvar $help~help[17] $help~tab&"{slowmo}          - Adds random pause between waves."

gosub :help~helpfile

setvar $switchboard~message "Citadel Killer starting up!*"
gosub :switchboard~switchboard

:cit_kill
gosub :combat~init
gosub :player~quikstats
gosub :player~getinfo
setvar $player~startinglocation $player~current_prompt
setvar $player~targetingperson false
setvar $player~targetingcorp false
setvar $player~target ""
setvar $bot~mode "Citkill"
savevar $bot~mode

if ($player~startinglocation <> "Citadel")
	setvar $switchboard~message "Citadel Killer must be run from the Citadel Prompt*"
	gosub :switchboard~switchboard
	setvar $bot~mode "General"
	savevar $bot~mode
	halt
end
isnumber $test $bot~parm1
if ($test)
	if ($bot~parm1 > 0)
		setvar $player~targetingcorp true
		setvar $player~target $bot~parm1
	end
else
	getwordpos $bot~user_command_line $pos #34
	if ($pos > 0)
		setvar $bot~user_command_line $bot~user_command_line&" "
		gettext $bot~user_command_line $target " "&#34 #34&" "
		if ($target <> "")
			setvar $player~targetingperson true
			lowercase $player~target
			striptext $bot~user_command_line " "&#34&$player~target&#34&" "
		else
			setvar $player~targetingperson false
		end
	end
end
getwordpos $bot~user_command_line $pos "dt"
if ($pos > 0)
	setvar $player~doubletap true
else
	setvar $player~doubletap false
end
getwordpos $bot~user_command_line $pos "empty"
if ($pos > 0)
	setvar $capemptyships true
	setvar $player~empty_ships_only true
else
	setvar $capemptyships false
end
getwordpos $bot~user_command_line $pos "override"
if ($pos > 0)
	setvar $override true
else
	setvar $override false
end
getwordpos $bot~user_command_line $pos "smart"
if ($pos > 0)
	setvar $player~smart true
else
	setvar $player~smart false
end
getwordpos $bot~user_command_line $pos "sg"
if ($pos > 0)
	setvar $player~shotgun true
else
	setvar $player~shotgun false
end
getwordpos $bot~user_command_line $pos "onetap"
if ($pos > 0)
	setvar $player~onetap true
else
	setvar $player~onetap false
end

getwordpos $bot~user_command_line $pos "slowmo"
if ($pos > 0)
	setvar $player~slowmo true
else
	setvar $player~slowmo false
end

loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

:start_cit_kill
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must start at the citadel prompt*"
	gosub :switchboard~switchboard
	halt
end

gosub :ship~getshipstats

:warning
send "q m * * * "
gosub :player~quikstats
gosub :planet~getplanetinfo
format $planet~planet_fighters $formatted_fighters number

if ($player~targetingperson)
	setvar $switchboard~message "Citadel Killer Targeting "&$target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
	gosub :switchboard~switchboard
elseif ($player~targetingcorp)
	setvar $switchboard~message "Citadel Killer Targeting Corp "&$target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Citadel Killer :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
	gosub :switchboard~switchboard
end
if ($player~shotgun)
	setvar $switchboard~message "Shotgun mode enabled.*"
	gosub :switchboard~switchboard
elseif ($player~doubletap)
	setvar $switchboard~message "Doubletap mode enabled.*"
	gosub :switchboard~switchboard
end
send "c  "

goto :scanit_cit_kill

:main
killalltriggers
gosub :player~quikstats
settextlinetrigger 	limp 	:scanit_cit_kill 	"Limpet mine in "&$player~current_sector
settextlinetrigger 	warps 	:scanit_cit_kill 	"warps into the sector."
settextlinetrigger 	lifts 	:scanit_cit_kill 	"lifts off from"
settextlinetrigger 	deffig 	:scanit_cit_kill 	"Deployed Fighters Report Sector "&$player~current_sector
settextlinetrigger 	secgun 	:scanit_cit_kill 	"Quasar Cannon on"
settextlinetrigger 	ig		:scanit_cit_kill 	"Shipboard Computers The Interdictor Generator on"
settextlinetrigger 	power 	:scanit_cit_kill 	"is powering up weapons systems!"
settextlinetrigger  wave    :scanit_cit_kill    " launches a wave of fighters at  "
settextlinetrigger  planet  :scanit_cit_kill	" launches a Genesis Torpedo into the sector!"
settextlinetrigger  atomic  :scanit_cit_kill    " appears from the planetary rubble."
settextlinetrigger 	exits 	:scanit_cit_kill 	"exits the game."
settextlinetrigger 	enters 	:scanit_cit_kill 	"enters the game."
setdelaytrigger		delay	:scanit_cit_kill	30000
setstrigger 		pause 	:pausing 		"Planet command (?="
setstrigger 		pause2 	:pausing 		"Computer command ["
setstrigger 		pause3 	:pausing 		"Corporate command ["
pause

:pausing
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Killer paused. To restart, re-enter citadel prompt" ansi_6 "]*" ansi_7
setstrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Killer restarted" ansi_6 "]*" ansi_7
goto :main

:scanit_cit_kill
killalltriggers
getword currentline $test 1
if (($test = "P") or ($test = "F") or ($test = "R") or ($test = ">"))
	echo ansi_14 "*spoof attempt!*"
	goto :main
end

:scanit_again
killalltriggers
gosub :player~quikstats
setvar $planet~planet_count sector.planetcount[$player~current_sector]
if (($planet~planet_count = 1) and ($overide = false))
	setvar $one_planet true
	setvar $player~override true
else
	setvar $player~override $override
end

gosub :sector~getsectordata

if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))

	gosub :combat~fastcitadelattack

	if ($player~fighters <= 0)
		setvar $switchboard~message "Fighters are gone - halting.*"
		gosub :switchboard~switchboard
		halt
	end
	goto :scanit_again
elseif (($sector~emptyshipcount > $sector~myshipcount) and ($capemptyships = true))

	setvar $player~startinglocation "Citadel"
	gosub :combat~fastcapture
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		send " l " $planet~planet " * n n * j m * * * j c  *  "
		gosub :player~quikstats
		if ($player~fighters <= 0)
			setvar $switchboard~message "Fighters are gone - halting.*"
			gosub :switchboard~switchboard
			halt
		end
	end
	goto :scanit_again
end
goto :halt

:halt
:final
echo ansi_12 "*NO Targets*"
if ($sector~defenderships > 0)
	setvar $switchboard~message "Enemy defender ship in sector!  Not attacking.  Override if you want to attempt to kill them.*"
	gosub :switchboard~switchboard
end
goto :main

halt

#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
