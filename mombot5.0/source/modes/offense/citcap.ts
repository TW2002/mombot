gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&" citcap {"&#34&"player name"&#34&" | corp#}"
setvar $help~help[2]  $help~tab&" Citadel Capper captures enemy ships from planet citadel"
setvar $help~help[3]  $help~tab&"  "
setvar $help~help[4]  $help~tab&" {"&#34&"player name"&#34&"} - Player to target, name must be"
setvar $help~help[5]  $help~tab&"                   surrounded by double quotes"
setvar $help~help[6]  $help~tab&"         {corp#} - Corporation number to target"
setvar $help~help[7]  $help~tab&"      {override} - Override to cap defender ships"
setvar $help~help[8]  $help~tab&"         {empty} - Empty ships only"
setvar $help~help[9]  $help~tab&"        {onetap} - Fire once only"
setvar $help~help[10] $help~tab&"        {slowmo} - Adds random pause between waves."
setvar $help~help[11] $help~tab&"      {unloader} - Waits for unloader to finish b4 next attack."
setvar $help~help[12]  $help~tab&"         "
setvar $help~help[13]  $help~tab&"         Examples:"
setvar $help~help[14] $help~tab&"              >citcap "
setvar $help~help[15] $help~tab&"              >citcap "&#34&"player name"&#34&" "
setvar $help~help[16] $help~tab&"              >citcap 3"
gosub :help~helpfile

setvar $switchboard~message "Citadel Capper starting up!*"
gosub :switchboard~switchboard

loadvar $game~latency

setarray $shiplist 	200
gosub :player~quikstats
gosub :player~getinfo
setvar $startinglocation $player~current_prompt
setvar $player~targetingperson false
setvar $player~targetingcorp false
setvar $player~cappingaliens true
setvar $player~target ""
setvar $capemptyships true

setvar $bot~mode "Citcap"
savevar $bot~mode

if ($startinglocation <> "Citadel")
	setvar $switchboard~message "Citadel Capper must be run from the Citadel Prompt*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
isnumber $test $bot~parm1
if ($test)
	if ($bot~parm1 > 0)
		setvar $targetingcorp true
		setvar $player~target $bot~parm1
	end
else
	getwordpos $bot~user_command_line $pos #34
	if ($pos > 0)
		setvar $bot~user_command_line $bot~user_command_line&" "
		gettext $bot~user_command_line $player~target " "&#34 #34&" "
		if ($player~target <> "")
			setvar $targetingperson true
			striptext $player~target #34
			lowercase $player~target
		else
			setvar $targetingperson false
		end
	end
end

getwordpos $bot~user_command_line $pos "override"
if ($pos > 0)
	setvar $override true
else
	setvar $override false
end
getwordpos $bot~user_command_line $pos "empty"
if ($pos > 0)
	setvar $player~empty_ships_only true
else
	setvar $player~empty_ships_only false
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
	setvar $player~onetap false
else
	setvar $player~slowmo false
end

getwordpos $bot~user_command_line $pos "unloader"
if ($pos > 0)
	setvar $player~unloader true
else
	setvar $player~unloader false
end

gosub :player~quikstats
setvar $player~startinglocation $player~current_prompt

if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must start at the citadel prompt*"
	gosub :switchboard~switchboard
	halt
end
loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

:start_cit_cap
setvar $switchboard~message "Citadel Capper :: Powering Up!*"
gosub :switchboard~switchboard

:stats_cit_cap
gosub :ship~getshipstats

:warning_cit_kill
send "q m * * * "
gosub :planet~getplanetinfo
format $planet~planet_fighters $formatted_fighters number
if ($targetingperson)
	setvar $switchboard~message "Citadel Capper Targeting "&$player~target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
elseif ($targetingcorp)
	setvar $switchboard~message "Citadel Capper Targeting Corp "&$player~target&" :: Running on Planet"&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
else
	setvar $switchboard~message "Citadel Capper :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
end

if ($player~onetap = true)
	setvar $switchboard~message  $switchboard~message & "*One Tap Preparing to fire*"
end
gosub :switchboard~switchboard
send "c  "

goto :scanit_cit_cap

:main
killalltriggers
gosub :player~quikstats
settextlinetrigger 	limp 	:scanit_cit_cap 	"Limpet mine in "&$player~current_sector
settextlinetrigger 	warps 	:scanit_cit_cap 	"warps into the sector."
settextlinetrigger 	lifts 	:scanit_cit_cap 	"lifts off from"
settextlinetrigger 	deffig 	:scanit_cit_cap 	"Deployed Fighters Report Sector "&$player~current_sector
settextlinetrigger 	secgun 	:scanit_cit_cap 	"Quasar Cannon on"
settextlinetrigger 	ig		:scanit_cit_cap 	"Shipboard Computers The Interdictor Generator on"
settextlinetrigger 	power 	:scanit_cit_cap 	"is powering up weapons systems!"
settextlinetrigger  wave    :scanit_cit_cap    	" launches a wave of fighters at  "
settextlinetrigger  planet  :scanit_cit_cap		" launches a Genesis Torpedo into the sector!"
settextlinetrigger  atomic  :scanit_cit_cap    	" appears from the planetary rubble."
settextlinetrigger 	exits 	:scanit_cit_cap 	"exits the game."
settextlinetrigger 	enters 	:scanit_cit_cap 	"enters the game."
setdelaytrigger		delay	:scanit_cit_cap		30000
settexttrigger 		pause 	:pausing 			"Planet command (?="
settexttrigger 		pause2 	:pausing 			"Computer command ["
settexttrigger 		pause3 	:pausing 			"Corporate command ["
pause

:pausing
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Capture paused. To restart, re-enter citadel prompt" ansi_6 "]*" ansi_7
settexttrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Capture restarted" ansi_6 "]*" ansi_7
goto :main

:scanit_cit_cap
killalltriggers
getword currentline $test 1
if (($test = "P") or ($test = "F") or ($test = "R") or ($test = ">"))
	echo ansi_14 "*spoof attempt!*"
	goto :main
end
gosub :checkforcappingvictimsfromcitadel
goto :main

:checkforcappingvictimsfromcitadel
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
setvar $player~startinglocation "Citadel"
if (($sector~realtradercount > ($sector~corpiecount + $sector~defenderships)) or ((($sector~emptyshipcount > $sector~myshipcount) and ($capemptyships = true))) or (($sector~faketradercount > $sector~federalcount) and ($player~cappingaliens = true)))
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
echo ansi_12 "*NO Targets*"
if ($sector~defenderships > 0)
	setvar $switchboard~message "Enemy defender ship in sector!  Not attacking.  Override if you want to attempt to kill them.*"
	gosub :switchboard~switchboard
end
if ($player~onetap = true)
	setvar $switchboard~message "One Tap mode was on, so exiting Citcap.*"
	gosub :switchboard~switchboard
	halt
end
return

#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
