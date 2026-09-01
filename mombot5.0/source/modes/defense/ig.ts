gosub :help~initialize
setvar $help~help[1] $help~tab&"Keeps an interdictor generator turned on after damage."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  ig [on | off]"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   [on] - enable auto IG reset mode."
setvar $help~help[6] $help~tab&"   [off] - disable auto IG reset mode."
setvar $help~help[7] $help~tab&"   Run from Command on a ship with an IG."
gosub :help~helpfile

loadvar $switchboard~bot_name
loadvar $bot~parm1
loadvar $bot~user_command_line
loadvar $bot~parm2

# ============================== IG ==============================
:auto_ig
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "Must start at Command prompt*"
	gosub :switchboard~switchboard
	halt
end
setvar $ig_mode 0
if ($bot~parm1 <> "on") and ($bot~parm1 <> "off")
	setvar $switchboard~message "Please use - IG [on/off]*"
	gosub :switchboard~switchboard
	halt
end
setvar $switchboard~message "Auto IG reset mode is now ON.*"
gosub :switchboard~switchboard
setvar $planet~planet 0
savevar $planet~planet
goto :ig_turn_it_on

:photon_ig_damage_trigger
halt

:ig_turn_it_on
killalltriggers
getword currentline $test 1
if ($test = "F") or ($test = "R") or ($test = "P")
	goto :photon_ig_damage_trigger
end
setvar $ig_mode 0
setdelaytrigger ig_timeout :photon_ig_damage_trigger 3000
settexttrigger no_ig_trigger :no_ig_available "is not equipped with an Interdictor Generator!"
settexttrigger no_ig_beam :no_ig_beam "Beam to what sector? (U=Upgrade Q=Quit)"
setstrigger no_ig_cby :no_ig_cby "ARE YOU SURE CAPTAIN? (Y/N)"
settexttrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
settexttrigger ig_fine :ig_was_on "Your Interdictor generator is now ON"
setstrigger do_ig :do_ig_thing "Do you wish to change it? (Y/N)"
send "q q q q* b"
pause

:no_ig_available
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_was_on
killtrigger do_ig_thing
setvar $switchboard~message "No IG available on this ship.*"
gosub :switchboard~switchboard
halt

:no_ig_beam
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_was_on
killtrigger do_ig_thing
send " Q "
halt

:no_ig_cby
killtrigger ig_timeout
killtrigger no_ig_trigger
killtrigger no_ig_beam
killtrigger no_ig_cby
killtrigger ig_was_on
killtrigger do_ig_thing
send " N "
halt

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
killtrigger ig_was_on
killtrigger do_ig_thing
if ($ig_mode = 0)
	send "Y"
	setvar $switchboard~message "IG on!*"
	gosub :switchboard~switchboard
else
	send "N"
	setvar $switchboard~message "IG was already on.*"
	gosub :switchboard~switchboard
end
goto :ig_triggers

:ig_triggers
settextlinetrigger turnigon :ig_turn_it_on " damaging your ship."
setvar $planet~planet 0
savevar $planet~planet
pause
return

# ============================== END IG SUB ==============================

include "source\include\player"
include "source\include\switchboard.ts"
include "source\include\help"
