#		fixes
#				moved stuff around for speed
#				added the 'manual' trigger
#				successful plock msg is sent b4 actual lock is made as a
#				fix for when interactive subprompts are off.
#				fixed :plockFinished, sent " n s* ", if the planet is a
#				level 6, this would have no effect

gosub :loadvars~loadvars
gosub :help~initialize

loadvar $game~ptradesetting
loadvar $game~goldenabled
loadvar $game~mbbs
loadvar $game~port_max
loadvar $game~rob_factor
loadvar $game~production_rate
loadvar $bot~folder
setvar  $bot~no_credits_file $bot~folder&"/No_Credits.list"
savevar $bot~no_credits_file
loadvar $game~limpet_cost
loadvar $game~armid_cost
loadvar $game~limpet_removal_cost

setvar $help~help[1]  $help~tab&"plock {sector} {kill} {fastkill} {fastdrop}"
setvar $help~help[2]  $help~tab&"    "
setvar $help~help[3]  $help~tab&"   Pre-locks with planet onto a sector."
setvar $help~help[4]  $help~tab&"    "
setvar $help~help[5]  $help~tab&"    Options: "
setvar $help~help[6]  $help~tab&"      {kill} - attempts citkill after landing"
setvar $help~help[7]  $help~tab&"  {fastkill} - macro kill after landing"
setvar $help~help[8]  $help~tab&"  {fastdrop} - deploys fighters after landing"
gosub :help~helpfile

setvar $switchboard~message "Plock starting up!*"
gosub :switchboard~switchboard

goto :starting

:settriggers
killalltriggers
settextlinetrigger	1	:manual			("Planet is now in sector "&$target_sector)
settexttrigger 		2	:plockfinished	("Planetary TransWarp Drive shutting down.")
settexttrigger 		3	:gofighterplock 		("Report Sector "&$target_sector&": ")
settexttrigger 		4	:golimpetplock 		("Limpet mine in "&$target_sector&" ")
settexttrigger 		5	:goarmidplock 		("Your mines in "&$target_sector&" ")
settexttrigger 		6	:goplock 		("Locator beam lost.")
pause

:goarmidplock
cuttext currentline&"    " $ck 1 4
setvar $spoof false
if ($ck <> "Your")
	settexttrigger 		5	:goarmidplock 		("Your mines in "&$target_sector&" ")
	pause
end
if ($game~hasaliens = true)
	#[K[32mYour mines in [1;33m8174[0;32m did [1;33m14[0;32m damage to #[1;36m[33mFerrengi[36m Nik
	setvar $alien false
	gettext $bot~ansi_last_armid_attack&"[xx][xx][xx]" $alien_check " damage to " "[xx][xx][xx]"
	getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
		settexttrigger 		5	:goarmidplock 		("Your mines in "&$target_sector&" ")
		pause
	end
end
goto :goplock

:golimpetplock
cuttext currentline&"      " $ck 1 6
setvar $spoof false
if ($ck <> "Limpet")
	settexttrigger 		4	:golimpetplock 		("Limpet mine in "&$target_sector&" ")
	pause
end
goto :goplock

:gofighterplock
getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
setvar $spoof false
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	settexttrigger 		3	:gofighterplock 		("Report Sector "&$target_sector&": ")
	pause
end
if ($game~hasaliens = true)
	setvar $alien false
	gettext currentansiline $alien_check ": " "'s"
	getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
		settexttrigger 		3	:gofighterplock 		("Report Sector "&$target_sector&": ")
		pause
	end
end

:goplock
killalltriggers
if ($plock_delay > 0)
	setdelaytrigger plockdelay :continueplock $plock_delay
	pause
end

:continueplock
send "y '{" $switchboard~bot_name "} - PLOCK Launched*"
gosub :plockkill
if ($plockkill)
	goto :scanit_again
else
	send "s* "
	halt
end

:plockfinished
send "  s*   "
setvar $switchboard~message "PLOCK Sector Cleared*"
gosub :switchboard~switchboard
halt

:manual
killalltriggers
gosub :plockkill
if ($plockkill)
	goto :scanit_again
else
	send "s* "
end
halt

:starting
# ======================     START PRELOCK DROP (PLOCK) SUBROUTINE    ==========================
:start_plock
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run Plocker from Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
send "Q"
gosub :planet~getplanetinfo
send "C "
gosub :combat~init
gosub :ship~getshipstats
setvar $game~hasaliens false

send "#/"
waiton "Who's Playing"
settextlinetrigger	1	:alien	"are on the move!"
settexttrigger		2	:aliendone (#179 & "Turns")
pause

:alien
setvar $game~hasaliens true

:aliendone
killtrigger 1
killtrigger 2
savevar $game~hasaliens

getwordpos " "&$bot~user_command_line&" " $pos " kill "
if ($pos > 0)
	setvar $plockkill true
else
	setvar $plockkill false
end
getwordpos " "&$bot~user_command_line&" " $pos " fastkill "
if ($pos > 0)
	setvar $fastkill true
else
	setvar $fastkill false
end
getwordpos " "&$bot~user_command_line&" " $pos " fastdrop "
if ($pos > 0)
	setvar $fastdrop true
else
	setvar $fastdrop false
end
setvar $target_sector $bot~parm1
isnumber $isnum $target_sector
if ($isnum = 1)
	if (($target_sector > 10) and ($target_sector <= sectors) and ($target_sector <> stardock))
		goto :planetprelock
	elseif (($target_sector < 10) or ($target_sector >= sectors) or ($target_sector = stardock))
		setvar $switchboard~message "Not a Valid PLOCK Sector*"
		gosub :switchboard~switchboard
		halt
	end
elseif ($isnum <> 1)
	setvar $switchboard~message "PLOCK Sector must be a number*"
	gosub :switchboard~switchboard
	halt
end
isnumber $isnum $bot~parm2
if ($isnum)
	setvar $plock_delay $bot~parm2
else
	isnumber $isnum $bot~parm3
	if ($isnum = 1)
		setvar $plock_delay $bot~parm3
	end
end

:planetprelock
setvar $switchboard~message "PLOCK Ready to fire Sector: "&$target_sector
if ($plockkill)
	setvar $switchboard~message $switchboard~message&", auto kill enabled."
end
if ($fastkill)
	setvar $switchboard~message $switchboard~message&" -  fast kill enabled too."
end
setvar $switchboard~message $switchboard~message&"*"
gosub :switchboard~switchboard

send "p " $target_sector "*"
settextlinetrigger prelockno :plockno "You do not have any fighters in Sector " & $target_sector & "."
settextlinetrigger prelockyes :plockyes "Locating beam pinpointed, TransWarp Locked."
settextlinetrigger prelockalreadythere :plockfinished "You are already in that sector!"
pause

:plockno
setvar $switchboard~message "You do not have any fighters in that Sector*"
gosub :switchboard~switchboard
halt

:plockyes
goto :settriggers

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
settexttrigger 		pause 	:pausing 		"Planet command (?="
settexttrigger 		pause2 	:pausing 		"Computer command ["
settexttrigger 		pause3 	:pausing 		"Corporate command ["
pause

:pausing
killalltriggers
echo ansi_6 "*[" ansi_14 "Plock Citadel Killer paused. To restart, re-enter citadel prompt" ansi_6 "]*" ansi_7
settexttrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 "Plock Citadel Killer restarted" ansi_6 "]*" ansi_7
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

:plockkill
if ($fastdrop = true)
	setvar $send $send&"q q fz200000*z c d * l "&$planet~planet&"*  m  *** c  "
end
if ($fastkill = true)
	setvar $send $send&"q q a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
end
send $send
return
# ======================     END PLOCK (PLOCK) SUBROUTINE     ==========================
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
