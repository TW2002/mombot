logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"reloader [on/off] [fig minimum] {ig} {topoff} {fig}"
setvar $help~help[2]  $help~tab&"  - Sector Reloader Mode"
setvar $help~help[3]  $help~tab&"    Sits above planet and lands/reloads fighters when hit."
setvar $help~help[4]  $help~tab&"  "
setvar $help~help[5]  $help~tab&"    Options: "
setvar $help~help[6]  $help~tab&"           [on/off]   Turns Reloader On or Off"
setvar $help~help[7]  $help~tab&"      [fig minimum]   Number of ship fighters to lose before "
setvar $help~help[8]  $help~tab&"                      landing and refilling"
setvar $help~help[9]  $help~tab&"               [ig]   Reset IG if photoned "
setvar $help~help[10] $help~tab&"           [topoff]   Uses fighters in sector first "
setvar $help~help[11] $help~tab&"              [fig]   Place fighter if sector figs attacked "
setvar $help~help[11] $help~tab&"           [noland]   Do not land - should be running citfill "
gosub :help~helpfile

setvar $switchboard~message "Reloader starting up!*"
gosub :switchboard~switchboard

gosub :player~quikstats
loadvar $planet~planet

if ($bot~parm1 = "on")

else
	setvar $bot~parm2 $bot~parm1
end

getwordpos " "&$bot~user_command_line&" " $pos " ig "
if ($pos > 0)
	setvar $ig true
else
	setvar $ig false
end

getwordpos " "&$bot~user_command_line&" " $pos " topoff "
if ($pos > 0)
	setvar $topoff true
else
	setvar $topoff false
end

getwordpos " "&$bot~user_command_line&" " $pos " fig "
if ($pos > 0)
	setvar $replace_fig true
else
	setvar $replace_fig false
end

send "\"
settextlinetrigger flee_off :flee_off "Online Auto Flee is disabled."
settextlinetrigger flee_on :flee_on "Online Auto Flee is enabled."
pause

:flee_on
killtrigger flee_off
send "\"

:flee_off
killtrigger flee_on
isnumber $number $bot~parm2
if ($number = 0) or ($bot~parm2 = 0)
	setvar $threshold $player~fighters
	divide $threshold 2
else
	setvar $threshold $bot~parm2
end

setvar $version "1.7"
goto :_start_

:settriggers
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
settextlinetrigger 1 :sub_reload "Shipboard Computers"
settextlinetrigger 2 :landed		"{"&$bot~bot_name&"} - In Cit - Planet"
if ($ig = true)
	settextlinetrigger 3 :ig_turn_it_on " damaging your ship."
end
if ($replace_fig)
	settextlinetrigger 4 :replace_fig " of your fighters in sector "&$player~current_sector
end
pause

:replace_fig
setvar $line currentline
getword $line $test 1
getwordpos " "&$line&" " $pos " "&$player~current_sector&" "
if (($test = "F") or ($test = "R") or ($test = "P") or ($pos <= 0))
	settextlinetrigger 4 :replace_fig " of your fighters in sector "&$player~current_sector
	pause
end
killtrigger 1
killtrigger 2
killtrigger 3
gosub :topoff
add $loss 1
goto :settriggers

:landed
killtrigger 1
killtrigger 3
killtrigger 4
send " q  q  q  q  q  z  n  ** "
waiton "Warps to Sector(s) :"
waiton "Command [TL"
gosub :player~quikstats
if ($player~current_prompt <> "Command")
	setvar $switchboard~message "Unable to get to Command Prompt. Halting!*"
	gosub :switchboard~switchboard
	halt
end
goto :settriggers

:sub_reload
getword currentansiline $ck 1
getword currentline $ck2 4
getword currentline $ck3 5
getword currentline $ck4 6
getword currentline $ck5 7
if ($ck <> "[K[1A[1;33mShipboard")
	echo "spoof"
	settextlinetrigger 1 :sub_reload "Shipboard Computers"
	pause
end
setvar $reloaderline currentline
getwordpos $reloaderline $reloadercheck "destroyed"
if ($reloadercheck = 0)
	echo "Found no damage*"
	settextlinetrigger 1 :sub_reload "Shipboard Computers"
	pause
end
killtrigger 2
killtrigger 3
killtrigger 4
while ($reloadercheck <> 0)
	setvar $previousreloaderline $reloaderline
	cuttext $previousreloaderline $reloaderline ($reloadercheck + 10) 999
	getwordpos $reloaderline $reloadercheck "destroyed"
end
getwordpos $previousreloaderline $reloadercheck "destroyed"
cuttext $previousreloaderline $previousreloaderline $reloadercheck 9999
gettext $previousreloaderline $figdamage "destroyed" "fighters."
striptext $figdamage "shield points and"
getword $figdamage $shield_pnts 1
getword $figdamage $fig_pnts 2
if ($shield_pnts > 0)
	add $loss $shield_pnts
end
if ($fig_pnts > 0)
	add $loss $fig_pnts
end
if ($loss >= $threshold)
	goto :reload
else
	goto :settriggers
end

:reload
if ($topoff = true)
	gosub :topoff
else
	send "l " $planet~planet "*  m  *  *  *  q "
end
setvar $loss 0
gosub :player~quikstats
if ($player~fighters < $ship~ship_fighters_max)
	if ($topoff = true)
		gosub :topoff
		gosub :player~quikstats
		if ($player~fighters < $ship~ship_fighters_max)
			setvar $topoff false
			goto :reload
		end
	end
	setvar $switchboard~message "Planet Too Low On Fighters. Reloader Shutting Down*"
	gosub :switchboard~switchboard
	halt
end
goto :settriggers

:_start_
# ============================== RELOADER (RELOAD) ==============================
:reloader
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel") and ($startinglocation <> "Planet")
	if ($planet~planet = 0)
		setvar $switchboard~message "Must start at planet or cit prompt*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Attempting to use planet "&$planet~planet&".*"
		setvar $planet~land_and_lift true
		gosub :planet~landingsub
		if ($planet~sucessfulplanet <> true)
			setvar $switchboard~message "Planet does not appear to be available.  Stopping.*"
			gosub :switchboard~switchboard
			halt
		else
			setvar $startinglocation "Planet"
			if ($planet~sucessfulcitadel = true)
				setvar $startinglocation "Citadel"
			end
		end
	end
else
	send "q "
	gosub :planet~getplanetinfo
	send "q"
end
gosub :ship~getshipstats

if ($planet~planet_fighters > 0)
	setvar $switchboard~message "Reloader "&$version&" Active - Using Planet "&$planet~planet&" with "&$planet~planet_fighters&" fighters.*"
else
	setvar $switchboard~message "Reloader "&$version&" Active - Using Planet "&$planet~planet&".*"
end
gosub :switchboard~switchboard
setvar $switchboard~message "Will reload when I get below "&$threshold&" ship fighters.*"
gosub :switchboard~switchboard
if ($topoff = true)
	setvar $switchboard~message "Will topoff from sector figs before using planet.*"
	gosub :switchboard~switchboard
end
if ($ig = true)
	goto :ig_turn_it_on
end
goto :settriggers

# ============================== RELOADER (RELOAD) ==============================

halt

:photon_ig_damage_trigger
halt

:ig_turn_it_on
getword currentline $test 1
if ($test = "F") or ($test = "R") or ($test = "P")
	settextlinetrigger 3 :ig_turn_it_on " damaging your ship."
	pause
end
killtrigger 1
killtrigger 2
killtrigger 3
setvar $ig_mode 0
setdelaytrigger ig_timeout :photon_ig_damage_trigger 3000
settexttrigger no_ig_trigger :no_ig_available "is not equipped with an Interdictor Generator!"
settexttrigger no_ig_beam :no_ig_beam "Beam to what sector? (U=Upgrade Q=Quit)"
setstrigger no_ig_cby :no_ig_cby "ARE YOU SURE CAPTAIN? (Y/N)"
settexttrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
settexttrigger ig_fine :ig_was_on "Your Interdictor generator is now ON"
setstrigger do_ig :do_ig_thing "Do you wish to change it? (Y/N)"
send "q q* b"
pause

:no_ig_available
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_fine
killtrigger do_ig
setvar $switchboard~message "No IG available on this ship.*"
gosub :switchboard~switchboard
setvar $ig false
goto :settriggers

:no_ig_beam
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_fine
killtrigger do_ig
send " Q "
goto :settriggers

:no_ig_cby
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_fine
killtrigger do_ig
send " N "
goto :settriggers

:ig_was_on
setvar $ig_mode 1
pause

:ig_was_off
setvar $ig_mode 0
pause

:do_ig_thing
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_fine
killtrigger do_ig
killtrigger need_ig
if ($ig_mode = 0)
	send "Y"
	setvar $switchboard~message "IG turned on!*"
	gosub :switchboard~switchboard
else
	send "N"
	setvar $switchboard~message "IG was already on.*"
	gosub :switchboard~switchboard
end
goto :settriggers

:topoff
:do_topoff_again
killtrigger topoff_success
killtrigger topoff_failure1
killtrigger topoff_failure2
send "f"
waiton "Your ship can support up to"
getword currentline $ftrs_to_leave 10
striptext $ftrs_to_leave ","
striptext $ftrs_to_leave " "
if ($ftrs_to_leave < 1)
	setvar $ftrs_to_leave 1
end
send $ftrs_to_leave & "* c d "
return

#INCLUDES:
include "source\include\ship"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
