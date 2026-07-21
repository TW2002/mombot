logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"Scans for targets and autokills in sector."
setvar $help~help[2]  $help~tab&"         "
setvar $help~help[3]  $help~tab&"  Options: "
setvar $help~help[4]  $help~tab&"      {off} - Turns off script "
setvar $help~help[5]  $help~tab&"      {pod} - Only shoots pods"
setvar $help~help[6]  $help~tab&"     {meat} - meatgrinder mode"
setvar $help~help[7]  $help~tab&"      {cap} - capture instead of kill"
setvar $help~help[8]  $help~tab&"       {dt} - doubletap mode"
setvar $help~help[9]  $help~tab&"       {sg} - shotgun mode"
setvar $help~help[10] $help~tab&" {defender} - pops a planet before attacking"
gosub :help~helpfile

setvar $switchboard~message "Dock Killer starting up!*"
gosub :switchboard~switchboard
gosub :combat~init
setvar $switchboard~self_command true

gosub :player~quikstats
setvar $startinglocation $player~current_prompt

getwordpos $bot~user_command_line $pos "pod"
if ($pos > 0)
	setvar $pods true
else
	setvar $pods false
end

getwordpos $bot~user_command_line $pos "cap"
if ($pos > 0)
	setvar $cap true
else
	setvar $cap false
end

getwordpos $bot~user_command_line $pos "meat"
if ($pos > 0)
	setvar $meatgrind true
else
	setvar $meatgrind false
end

getwordpos $bot~user_command_line $pos "def"
if ($pos > 0)
	setvar $combat~defender true
	if ($player~genesis <= 0)
		setvar $switchboard~message "You have to have genesis torps to run defender mode.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $combat~defender false
end

setvar $player~targetingperson false
if ($pods)
	setvar $player~targetingship "Escape Pod"
else
	setvar $player~targetingship false
end
setvar $player~targetingcorp false
setvar $player~target ""
loadvar $ship~ship_fighters_max
loadvar $ship~ship_max_attack
loadvar $ship~max_shields

loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

if ($bot~parm1 = "off")
	setvar $switchboard~message "Shutting down dockkill..*"
	gosub :switchboard~switchboard
	if ($player~current_sector = stardock)
		send "p ss ys *p"
		setvar $switchboard~message "Should be on dock.*"
		gosub :switchboard~switchboard
	end
	if ($player~current_sector = "1")
		send "p ty"
		setvar $switchboard~message "Should be on port.*"
		gosub :switchboard~switchboard
	end
	halt
else
	if ($startinglocation <> "Command") and ($startinglocation <> "<StarDock>")
		setvar $switchboard~message "Stardock Killer must be run from the Command or StarDock Prompt*"
		gosub :switchboard~switchboard
		halt
	end
	isnumber $test $bot~parm2
	if ($test)
		if ($bot~parm2 > 0)
			setvar $targetingcorp true
			setvar $target $bot~parm2
		end
	else
		getwordpos $bot~parm2 $pos #34
		if ($pos > 0)
			setvar $bot~user_command_line $bot~user_command_line&" "
			gettext $bot~user_command_line $player~target " "&#34 #34&" "
			if ($player~target <> "")
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
	getwordpos $bot~user_command_line $pos "sg"
	if ($pos > 0)
		setvar $player~shotgun true
	else
		setvar $player~shotgun false
	end
end

isnumber $shipstatsvalid $ship~ship_max_attack
if (($shipstatsvalid = false) or ($ship~ship_max_attack <= 0) or ($ship~ship_fighters_max <= 0))
	gosub :ship~getshipstats
	savevar $ship~ship_fighters_max
	savevar $ship~ship_max_attack
	savevar $ship~max_shields
end

if ($player~targetingperson)
	setvar $switchboard~message "StarDock Killer Targeting "&$player~target&" running in sector "&$player~current_sector&".*"
elseif ($player~targetingcorp)
	setvar $switchboard~message "StarDock Killer Targeting Corp "&$player~target&" running in sector "&$player~current_sector&".*"
else
	setvar $switchboard~message "StarDock Killer running in sector "&$player~current_sector&".*"
end
if ($player~shotgun)
	setvar $switchboard~message $switchboard~message&"    -  Shotgun mode enabled.*"
elseif ($player~doubletap)
	setvar $switchboard~message $switchboard~message&"    -  Doubletap mode enabled.*"
end
gosub :switchboard~switchboard

if (($player~current_sector = 1) or (port.class[$player~current_sector] = 0) or ($player~current_sector = $map~stardock))
	if ($player~current_sector = stardock)
		setvar $player~refurbstring "P  S G Y G Q s p  b  "&$ship~ship_max_attack&"*  b  "&$ship~ship_max_attack&"*  c  "&$ship~max_shields&"*  q q q "
		if ($startinglocation = "<StarDock>")
			send "s p"
		else
			send "P  S G Y G Q s p"
		end
	else
		setvar $player~refurbstring "p  t  b "&$ship~ship_max_attack&"* b "&$ship~ship_max_attack&"* c "&$ship~max_shields&"* q "
		send "p ty"
	end
	waiton "B  Fighters        :"
	getword currentline $figstobuy 8
	waiton "C  Shield Points   :"
	getword currentline $shieldstobuy 9
	if (($figstobuy > 0) or ($shieldstobuy > 0))
		send "b " $figstobuy "* c " $shieldstobuy "* "
	end
	if ($player~current_sector = stardock)
		send "q q q "
	else
		send "q "
	end
	gosub :player~quikstats
	goto :execute
end

:inac
gosub :player~quikstats

:execute
setdelaytrigger justwait :okaygo 50
pause

:okaygo
gosub :sector~getsectordata
if (($player~current_sector <= 10) or ($player~current_sector = $map~stardock))
	setvar $i 1
	while ($i <= $sector~realtradercount)
		setvar $enemy_fighters $player~traders[$i][4]
		setvar $enemy_corp $player~traders[$i][2]
		if (($player~traders[$i][2] = true) and (($player~experience > 1000) or ($player~alignment < 0)) and ($enemy_fighters > ($player~fighters/3)) and ($enemy_corp <> $player~corp))
			setvar $hide true
			setvar $switchboard~message "Hiding on port, because "&$player~traders[$i]&" is in sector, and I can't touch them. Halting.*"
		end
		add $i 1
	end
end
if ($player~fighters < $ship~ship_fighters_max)
	setvar $hide true
	setvar $switchboard~message "Can't refurb fighters, so I'm halting.*"
end
if ($hide = true)
	if ($player~current_sector = stardock)
		if ($player~current_prompt = "<StarDock>")
			send "s p q q q "
		else
			send "P  S G Y G Q s p q q q "
		end
	else
		send "p ty q "
	end
	gosub :switchboard~switchboard
	halt
end
#set player~refurbString to allow fast refurbing if you have a mac#
if ($cap)
	gosub :combat~fastcapture
else
	gosub :combat~fastattack
end
if (($player~isfound = true) and ($meatgrind = true))
	send $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* " $combat~attackstring "* "
end
goto :execute

:discod
setvar $tagline				"[Stardock Killer]"
setvar $taglineb			"[Stardock Killer]"
killalltriggers
echo "**" & ansi_14 & $taglineb & ansi_15 & " Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger		emancipate_cpu		:emancipate_cpu 3000
	echo "**" & ansi_14 & $taglineb & ansi_15 & " Auto Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger		waitingabit		:waitingabit	3000
echo "**" & ansi_14 & $taglineb & ansi_15 & " Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	send "qqqq**"
	goto :inac
else
	send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $taglineb & "Attempting to Reach Correct Prompt...*")
	settextlinetrigger	emq_complete		:emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger 	emq_delay		:emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

:player~setconnectiontriggers
killtrigger discod1
killtrigger discod2
seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."

return

#INCLUDES:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
