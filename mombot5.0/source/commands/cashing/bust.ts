gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"bust [Experience Desired]"
setvar $help~help[2] $help~tab&"Creates and busts planets until the desired experience is reached."
gosub :help~helpfile

setvar $blow_planet "No"
isnumber $test $parm1
if ($test)

else
	setvar $switchboard~message "Experience Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end

:start
gosub :player~quikstats
setvar $start_prompt $player~current_prompt
#if ($player~credits < 1000000)
#	setvar $switchboard~message "Not Enough Cash on Hand*"
#	gosub :switchboard~switchboard
#	halt
#end
isnumber $test $parm1
if ($test)
	setvar $experienceamount $parm1
else
	setvar $switchboard~message "Invalid Experience Amount.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~experience > $experienceamount)
	setvar $switchboard~message "Desired Experience Reached.*"
	gosub :switchboard~switchboard
	if ($start_prompt = "<StarDock>")
		send "p  s"
	end
	halt
end

if (($player~current_prompt <> "Command") and ($player~current_prompt <> "<StarDock>"))
	setvar $switchboard~message "Script must be run from Command or StarDock.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~corp > 1)
	setvar $player~corp "Yes"
else
	setvar $player~corp "No"
end
setvar $scanner $player~planet_scanner

:run
killalltriggers
if ($player~experience > $experienceamount)
	setvar $switchboard~message "Desired Experience Reached.*"
	gosub :switchboard~switchboard
	if ($start_prompt = "<StarDock>")
		send "p  s"
	end
	halt
end
if ($player~current_prompt = "<StarDock>")
	send "q  "
end
add $count 1
if ($blow_planet = "Yes")
	send "l " $planet "*  z  d  y  "
	setvar $blow_planet "No"
end
if ($count > 5)
	setvar $count 1
	goto :run
end
gosub :player~quikstats
#if (($player~credits < 1000000) and ($player~atomic < 1)) or (($player~credits < 1000000) and ($player~genesis < 1))
#	if ($start_prompt = "<StarDock>")
#		send "p  s"
##	end
##	halt
#end
killalltriggers
send "u y  "
settexttrigger genesis :buy_more "You don't have any Genesis Torpedoes"
settexttrigger create :create_planet "For building this planet you receive"
pause

:create_planet
killtrigger genesis
getrnd $rnd 10000 99999
setvar $name "bust" & $rnd
send $name "*  c q * l"
#waiton "Should this be"
waiton "<Preparing"
settextlinetrigger planet :planet $name
setstrigger noplanet :noplanet "Land on which"
pause

:noplanet
killalltriggers
setvar $switchboard~message "Planet Creation Failed.  Halting.*"
gosub :switchboard~switchboard
halt

:planet
killalltriggers
gettext currentline $planet "<" ">"
send $planet "*  z  d  y  "
settexttrigger atomic :buy_atomic "You do not have any Atomic Detonators"
settexttrigger blown :sub_run "For blowing up this planet you"
pause

:sub_run
setvar $blow_planet "No"
goto :run

:buy_atomic
setvar $blow_planet "Yes"
send "qq"

:buy_more
killtrigger create
send "* * p s h a"
waitfor "How many Atomic Detonators do you want"
gettext currentline $player~atomic "(Max " ")"
send $player~atomic "* t"
waitfor "How many Genesis Torpedoes do you want"
gettext currentline $player~genesis "(Max " ")"
send $player~genesis "* q q "
goto :run
include "source\include\player"
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
