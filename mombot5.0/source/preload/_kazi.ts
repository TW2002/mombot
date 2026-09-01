gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]   $help~tab&"- kazi [planet] {shields} {defender} {zdy}"
setvar $help~help[2]   $help~tab&"    Automates planet invasion. "
setvar $help~help[3]   $help~tab&"                           "
setvar $help~help[4]   $help~tab&"    [planet]               "
setvar $help~help[5]   $help~tab&"       - Planet number to attack   "
setvar $help~help[6]   $help~tab&"    [shields]                      "
setvar $help~help[7]   $help~tab&"       - Will kill planetary shields. Stops when below 50. "
setvar $help~help[8]   $help~tab&"    [defender]                                        "
setvar $help~help[9]   $help~tab&"       - Will land defensively to take out military reaction."
setvar $help~help[10]  $help~tab&"    [zdy]                         "
setvar $help~help[11]  $help~tab&"       - Option to blow planet as soon as you land.   "

gosub :help~helpfile

# ======================     START KAMIKAZE (KAZI) SUBROUTINE    ==========================
:kamikaze
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Must start from Citadel or Command Prompt*"
	halt
end
setvar $message ""
setvar $planet~planettoattack $bot~parm1
getwordpos $bot~user_command_line $pos "zdy"
if ($pos > 0)
	setvar $zdy true
else
	setvar $zdy false
end
getwordpos $bot~user_command_line $pos "sh"
if ($pos > 0)
	setvar $player~shieldsonly true
else
	setvar $player~shieldsonly false
end
getwordpos $bot~user_command_line $pos "def"
if ($pos > 0)
	setvar $defender true
else
	setvar $defender false
end
if ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "m * * * c "
	gosub :ship~getshipstats
	send " q "
	setvar $refurbstring "l "&$planet~planet&"* m * * * "
	setvar $attackstring ""
	setvar $targetstring  "q l j"&#8&$planet~planettoattack&"*z *  @"
else
	gosub :ship~getshipstats
	gosub :grabfigs
	gosub :player~quikstats
	setvar $attackstring ""
	setvar $targetstring  "l j"&#8&$planet~planettoattack&"*z *  @"
end

:tryinvadeagain
gosub :player~quikstats
if (($zdy = true) and ($player~atomic < 1))
	setvar $switchboard~message "Cannot run zdy version of kamikaze without detonators!*"
	halt
end
while ($player~fighters = $ship~ship_fighters_max)
	setvar $attackstring ""
	send $targetstring
	settexttrigger 		invadeshields 		:keepinvading 		"You have to destroy the fighters defending the planet to land."
	settexttrigger 		invadecontinue 		:shieldinvade 		"You have to destroy the Planetary Shields defending the planet to land."
	settexttrigger 		invadedone     		:invaded 		"<Destroy Planet>"
	setstrigger  	blockedinvade		:blockedinvading 	"Do you want instructions (Y/N)"
	settextlinetrigger      noplanet                :noplanettoinvade       "Invalid registry number, landing aborted."
	settextlinetrigger	invadequick		:invaded		"  Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
	settextlinetrigger	noland			:doneinvading		"since it couldn't possibly stand the stress of landing."
	settextlinetrigger      invadepod               :destroyedwhile         "Average Interval Lag:"
	pause

	:destroyedwhile
	killalltriggers
	send "* * q q q q r * l j"&#8&$planet~planet&"* j c * "
	setvar $switchboard~message "Podded while being a kamikaze, what did you really expect? Calling saveme in case I am not safely back on the planet.*"
	send $message
	halt

	:noplanettoinvade
	killalltriggers
	setvar $switchboard~message "Planet number entered is not in this sector.*"
	goto :doneinvading

	:shieldinvade
	killalltriggers
	gosub :player~quikstats
	setvar $damagetaken ($ship~ship_fighters_max-$player~fighters)
	setvar $switchboard~message ""&$damagetaken&" points of damage taken from quasar cannon*"
	setvar $player~fighters ($player~fighters-$damagetaken)
	if ($player~fighters <= 0)
		goto :invaderefurb
	end
	if ($player~shieldsonly = true)
		send "*"
		waiton " / Shields "
		getword currentline $player~fighters 2
		getword currentline $planet~planet_shields 5
		if ($planet~planet_shields < 50)
			setvar $switchboard~message "Planet has less than 50 planetary shields.*"
			goto :doneinvading
		end
		while (($planet~planet_shields >= 50) and ($player~fighters > 0))
			setvar $temp (((($planet~planet_shields-45)*20)*10)/$ship~ship_offensive_odds)
			if ($temp >= $ship~ship_max_attack)
				if ($player~fighters >= $ship~ship_max_attack)
					setvar $amount $ship~ship_max_attack
					setvar $temp ($temp-$ship~ship_max_attack)
					setvar $player~fighters ($player~fighters-$ship~ship_max_attack)
				else
					setvar $amount $player~fighters
					setvar $temp ($temp-$player~fighters)
					setvar $player~fighters 0
				end
			else
				setvar $amount $temp
				setvar $temp 0
			end
			send "a"&$amount&"*"
			waiton " / Shields "
			getword currentline $planet~planet_shields 5

		end
		if ($planet~planet_shields < 50)
			setvar $switchboard~message "Planet has less than 50 planetary shields.*"
			goto :doneinvading
		end
	else
		while ($player~fighters > 0)
			if ($player~fighters >= $ship~ship_max_attack)
				setvar $attackstring $attackstring&"z a "&$ship~ship_max_attack&"* * "
				subtract $player~fighters $ship~ship_max_attack
			else
				setvar $attackstring $attackstring&"z a "&$player~fighters&"* * "
				setvar $player~fighters 0
			end
		end
		send $attackstring
	end
	goto :invaderefurb

	:keepinvading
	killalltriggers
	gosub :player~quikstats
	setvar $figstouse 9999
	setvar $attackstring ""
	if ($defender = true)
		if ($player~fighters = $ship~ship_fighters_max)
			setvar $switchboard~message "No damage being taken when landing defensively.*"
			goto :doneinvading
		end
	else
		while ($player~fighters > 0)
			if ($player~fighters >= $ship~ship_max_attack)
				setvar $attackstring $attackstring&"z a "&$ship~ship_max_attack&"* * "
				subtract $player~fighters $ship~ship_max_attack
			else
				setvar $attackstring $attackstring&"z a "&$player~fighters&"* * "
				setvar $player~fighters 0
			end
		end
		send $attackstring
		gosub :player~quikstats
		if ($player~fighters > 0)
			gosub :claimordestroyplanet
			goto :doneinvading
		end
	end

	:invaderefurb
	killalltriggers
	if ($startinglocation = "Citadel")
		send "z R * "&$refurbstring
	else
		send "z R * "
		gosub :grabfigs
		gosub :player~quikstats
		if ($player~fighters < 100)
			gosub :grabfigs
		end
	end
	gosub :player~quikstats
end
goto :doneinvading

:blockedinvading
killalltriggers
send "a y y "&$ship~ship_max_attack&"* "&$refurbstring
goto :tryinvadeagain

:invaded
killalltriggers
gosub :claimordestroyplanet

:doneinvading
killalltriggers
if ($startinglocation = "Citadel")
	send "q q q q * "&$refurbstring&"C "
else
	send "z R * q q q q * "
	gosub :grabfigs
end
setvar $switchboard~message "Kamikaze run ended.*"
gosub :switchboard~switchboard
halt

:claimordestroyplanet
if ($zdy)
	if ($player~fighters > 1000)
		send "z a y "&($player~fighters-1000)&"* * Z D Y"
	else
		send "z d y "
	end
	setvar $switchboard~message "Invaded and attempting to blow planet, check for pods!*"
else
	send "* * * o z c * c v y q q "
	setvar $switchboard~message "Invaded and claiming planet, attempting to evict all from citadel, check for people to kill!*"
end
return

:grabfigs
send " F"
waiton "Your ship can support up to"
getword currentline $ftrs_to_leave 10
striptext $ftrs_to_leave ","
striptext $ftrs_to_leave " "
if ($ftrs_to_leave < 1)
	setvar $ftrs_to_leave 1
end
send " " & $ftrs_to_leave & " * C D"
return
# ======================     END KAMIKAZE (KAZI) SUBROUTINE    ==========================

#INCLUDES:
include "source\include\ship"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
