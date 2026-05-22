reqrecording
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "saveme"
loadvar $bot~bot_turn_limit
loadvar $map~stardock
loadvar $bot~subspace
loadvar $switchboard~self_command

setvar $help~help[1]    $help~tab&"saveme [on/off] {delay} {"&#34&"target name"&#34&"} "
setvar $help~help[2]    $help~tab&"       "
setvar $help~help[3]    $help~tab&"      {delay} - number of seconds to wait before "
setvar $help~help[4]    $help~tab&"                moving planet back to starting sector"
setvar $help~help[5]    $help~tab&"{target name} - saveme for only one player "
setvar $help~help[6]    $help~tab&"   {defender} - Let's corp mates ride shields"
setvar $help~help[7]    $help~tab&"                and lift. "
setvar $help~help[8]    $help~tab&"       {kill} - Kill option to attack."
setvar $help~help[9]    $help~tab&"                              "
setvar $help~help[10]   $help~tab&"    While running saveme, you can say: "
setvar $help~help[11]   $help~tab&"         bot_name personal limp - drop personal limp "
setvar $help~help[12]   $help~tab&"         bot_name deploy mines - drop corporate mines"
setvar $help~help[13]   $help~tab&"         abort saveme - cancel saveme call"
setvar $help~help[14]   $help~tab&"         "
setvar $help~help[15]   $help~tab&"               - Originally written by Cherokee"
gosub :help~helpfile

setvar $player~save true

getsectorparameter sectors "FIGSEC" $isfigged

# Defender Vars
setvar $defender 0
setvar $defender_kill 0
setvar $defenders 0
setvar $cannonatmos 0
setvar $millevel 0

# ============================== START ACTIVATE SAVEME (SAVEME) ==============================
:saveme
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($bot~parm1 <> "on") and ($bot~parm1 <> "off")
	setvar $switchboard~message "Please use - saveme [on/off] format*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm1 = "on")
	if ($startinglocation <> "Citadel")
		setvar $switchboard~message "Must start at Citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end
	isnumber $isnum $bot~parm2
	if ($isnum = 1)
		if ($bot~parm2 > 0)
			setvar $returnhome true
			setvar $savemedelay $bot~parm2
		else
			setvar $returnhome false
			setvar $savemedelay 0
		end
		setvar $home_sector2 $player~current_sector

	else
		setvar $returnhome false
		setvar $savemedelay 0

	end
	if ($returnhome)
		setvar $switchboard~message "Activating SaveMe, Return Home enabled*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Activating SaveMe*"
		gosub :switchboard~switchboard
	end
	send "q"
	gosub :planet~getplanetinfo
	send "c "
	setvar $targetingperson false
	getwordpos $bot~user_command_line $pos #34
	if ($pos > 0)
		setvar $bot~user_command_line $bot~user_command_line&" "
		gettext " "&$bot~user_command_line&" " $target " "&#34 #34&" "
		if ($target <> "")
			setvar $targetingperson true
			lowercase $target
			cuttext $target $subtarget 1 6
			striptext $bot~user_command_line " "&#34&$target&#34&" "
		else
			setvar $targetingperson false
		end
	end
	getwordpos $bot~user_command_line $pos " defender"
	if ($pos > 0)
		setvar $defmsg "Running with Defender*"
		setvar $defender 1
		getwordpos $bot~user_command_line $pos " kill"
		if ($pos > 0)
			setvar $defender_kill 1
			setvar $defmsg "Running with Defender and Kill.*"
			setvar $switchboard~message $defmsg
			gosub :switchboard~switchboard
		end
		gosub :checkdefenders
		gosub :setdefender
	end
	if ($returnhome)
		if ($targetingperson)
			setvar $switchboard~message "Saveme - Running from planet " & $planet~planet & " for "&$target&", " & $savemedelay & " second return home delay.*"
			gosub :switchboard~switchboard
		else
			setvar $switchboard~message "Saveme - Running from planet " & $planet~planet & ", " & $savemedelay & " second return home delay.*"
			gosub :switchboard~switchboard
		end

	else
		if ($targetingperson)
			setvar $switchboard~message "Saveme - Running from planet " & $planet~planet & " for "&$target&".*"
			gosub :switchboard~switchboard
		else
			setvar $switchboard~message "Saveme - Running from planet " & $planet~planet & ".*"
			gosub :switchboard~switchboard
		end
	end
	gosub :ship~getshipstats
	goto :settriggers
else
	setvar $switchboard~message "Please use - saveme [on/off] format**"
	gosub :switchboard~switchboard
	halt
end
# ============================== END ACTIVATE SAVEME (SAVEME) SUB ==============================

# ============================== ACTIVATE SAVEME ON CORPIE CALL ==============================
:savecall
killalltriggers
setvar $line currentline
gosub :authenticate
if ($auth_result = "true")
	cuttext $line $target_sector 9 13
elseif ($auth_result = "self")
	cuttext $line $target_sector 2 12
else
	goto :settriggers
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
			goto :settriggers
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
		if ($defender = 1)
			gosub :liftdefenders
		end
		if ($returnhome)
			setdelaytrigger savemereturn :returnsaveme ($savemedelay*1000)
			pause

			:returnsaveme
			send "P" & $home_sector2 & "*Y"
		end
		goto :settriggers

		:abort
		killtrigger nofig
		killtrigger abort
		setvar $switchboard~message "Save Aborted*"
		gosub :switchboard~switchboard
		if ($returnhome)
			setdelaytrigger savemereturn :returnsaveme1 ($savemedelay*1000)
			pause

			:returnsaveme1
			send "P" & $home_sector2 & "*Y"
		end
		goto :settriggers

	else
		send "'Invalid save call (out of range)*"
		if ($returnhome)
			setdelaytrigger savemereturn :returnsaveme2 ($savemedelay*1000)
			pause

			:returnsaveme2
			send "P" & $home_sector2 & "*Y"
		end
		goto :settriggers
	end

else
	send "'Invalid save call (non-numeric)*"
	if ($returnhome)
		setdelaytrigger savemereturn :returnsaveme3 ($savemedelay*1000)
		pause

		:returnsaveme3
		send "P" & $home_sector2 & "*Y"
	end
	goto :settriggers
end

:end
killalltriggers
send "P" & $home_sector2 & "*Y"
goto :settriggers

:authenticate
killalltriggers
setvar $subline $line
setvar $subline $subline & "             "
getword $subline $spoof 1
cuttext $subline $subsender 3 6
setvar $auth_result "false"
if ($targetingperson = true)
	lowercase $subsender
	trim $subsender
	trim $subtarget
	if ($spoof = "'")
		setvar $auth_result "self"
	elseif ($spoof = "R")
		if ($subsender = $subtarget)
			setvar $auth_result "true"
		end
	end
else
	if ($spoof = "'")
		setvar $auth_result "self"
	elseif ($spoof = "R")
		setvar $auth_result "true"
	end
end
return

:settriggers
killalltriggers
settextlinetrigger 1 :announce "script?"
settextlinetrigger 2 :announce "Script?"
settextlinetrigger 3 :savecall "=saveme"
settextlinetrigger 4 :savemedeploymines $bot~bot_name & " Deploy Mines"
settextlinetrigger 5 :savemepersonallimpet $bot~bot_name & " Personal Limp"
settextlinetrigger 6 :savemedeploymines $bot~bot_name & " deploy mines"
settextlinetrigger 7 :savemepersonallimpet $bot~bot_name & " personal limp"
settexttrigger     8 :attackpod "'s ship just exploded into a brilliant fireball!"
pause

:attackpod
killalltriggers
send "q q z n a y y " $ship~ship_max_attack "* * z n q z n  l " $planet~planet "* n n * j m  * * * c  s*  @"
waiton "Average Interval Lag:"
setvar $switchboard~message "Attempted to blow up pod in sector.  Not sure if it worked!*"
gosub :switchboard~switchboard
goto :settriggers

:announce
killalltriggers
gosub :authenticateannounce
if ($auth_result)
	setvar $switchboard~message "*Save Me - Running from planet " & $planet~planet & "*---Command List---*" & $bot~bot_name & " Deploy Mines*" & $bot~bot_name & " Personal Limp*----End of List---** "
	gosub :switchboard~switchboard
end
goto :settriggers

:authenticateannounce
killalltriggers
setvar $subline currentline
cuttext $subline $spoof 1 1
setvar $auth_result false
if ($spoof = "R")
	setvar $auth_result true
end
return

# ============================== DEFENDER ROUTINES ==============================
:liftdefenders
# can't wait for this one, we just hope for the best!

send "'defender mac r ^M ^M *"

if ($defender_kill = 1)
	setdelaytrigger killwait :killwait 400
	pause

	:killwait
	send "'defender kill*"

end
settextlinetrigger wrongprompt :wrongprompt "Wrong prompt for auto kill"
settextlinetrigger resetsaveme :resetsaveme "resetsaveme"
pause

:wrongprompt
killtrigger wrongprompt
send "'defender kill*"
pause

:resetsaveme
gosub :setdefender
return

:checkdefenders
setvar $defenders 0
send "'defender callout*"

setdelaytrigger defwait :defwait 3000

:defmore
settextlinetrigger deffound :deffound "Team: defender"
pause

:deffound
killtrigger deffound
add $defenders 1
goto :defmore

:defwait
killalltriggers

if ($defenders = 0)
	setvar $switchboard~message "We need at least one defender in this mode*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "We have defenders.*"
	gosub :switchboard~switchboard

end

return

:setdefender
gosub :disarmplanet

send "'defender mac l" & $planet~planet & "^M^M*"

setvar $defresp 0

setdelaytrigger defwaitland :defwaitland 3000

:deflandmore
settextlinetrigger deflanded :deflanded " - Macro Complete"
pause

:deflanded
killtrigger deflanded
add $defresp 1
goto :deflandmore

:defwaitland
killalltriggers

if ($defenders <> $defresp)
	setvar $switchboard~message "We didn't get all defenders landing, aborting!*"
	gosub :switchboard~switchboard
	halt
end

gosub :armplanet
return

:disarmplanet
setvar $cannonatmos $planet~atmosphere_cannon
setvar $millevel $planet~militaryreaction
setvar $switchboard~message "Disarming planet from Atmos Cannon: "& $cannonatmos &" and MR:" & $millevel & "*"
gosub :switchboard~switchboard

send "la0*m0*qopc"
waitfor "<Enter Citadel>"

return

:armplanet
setvar $switchboard~message "Arming planet to Atmos Cannon: "& $cannonatmos &" and MR:" & $millevel & "*"
gosub :switchboard~switchboard

send "la" $cannonatmos "*m" $millevel "*qocc"
waitfor "<Enter Citadel>"

return

# ============================== END DEFENDER ROUTINES ==============================

# ============================== END ACTIVATE SAVEME ON CORPIE CALL SUB ==============================

# ============================== START PERSONAL LIMP (LIMP) SUB ==============================
:savemepersonallimpet
setvar $personal true
setvar $amount 1
setvar $bot~parm1 1
gosub :mines~deploylimp
goto :settriggers
# ============================== END PERSONAL LIMP SUB ==============================

# ============================== MINES (ARMID AND LIMP) SUB ==============================
:savemedeploymines
setvar $personal false
setvar $amount 3
setvar $bot~parm1 3
gosub :mines~deploy
goto :settriggers

# ============================== END MINES (ARMID AND LIMP) SUB ==============================

#INCLUDES:
include "source\include\ship"
include "source\include\loadvars"
include "source\include\mines"
include "source\include\help"
include "source\include\switchboard.ts"
