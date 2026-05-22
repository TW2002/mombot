gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "refurb"

setvar $help~help[1]  $help~tab&"refurb {holds} {fighters} {shields} {seek} "
setvar $help~help[2]  $help~tab&"     "
setvar $help~help[3]  $help~tab&"   Auto buys fighters and shields"
setvar $help~help[4]  $help~tab&"     "
setvar $help~help[5]  $help~tab&"       {seek} - twarp to class 9 or 0 port and back"
setvar $help~help[6]  $help~tab&"      {holds} - buy holds"
setvar $help~help[7]  $help~tab&"   {fighters} - buy fighters"
setvar $help~help[8]  $help~tab&"    {shields} - buy shields"
gosub :help~helpfile

setvar $message ""
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
setvar $startinglocation $player~current_prompt

getwordpos " "&$bot~user_command_line&" " $pos " seek "
setvar $seek false
if ($pos > 0)
	setvar $seek true
end

getwordpos " "&$bot~user_command_line&" " $pos " h"
setvar $holds false
if ($pos > 0)
	setvar $holds true
end

getwordpos " "&$bot~user_command_line&" " $pos " f"
setvar $fighters false
if ($pos > 0)
	setvar $fighters true
end

getwordpos " "&$bot~user_command_line&" " $pos " sh"
setvar $shields false
if ($pos > 0)
	setvar $shields true
end

if (($shields <> true) and ($fighters <> true) and ($holds <> true))
	# default is all are true #
	setvar $holds true
	setvar $fighters true
	setvar $shields true
end

if ((currentsector = 1) or (port.class[currentsector] = 0) or (currentsector = $map~rylos) or (currentsector = $map~alpha_centauri))
	if ($startinglocation = "Citadel")
		send "q t*t1* "
		gosub :planet~getplanetinfo
		send "q "
	end
	send "p ty"
elseif (currentsector = $map~stardock)
	send "p ss ys *p"
else
	if ($seek = true)
		if ($startinglocation = "Citadel")
			send "q t*t1* "
			gosub :planet~getplanetinfo
			send "c "
		end
		gosub :player~quikstats
		setvar $back $player~current_sector
		setvar $player~warpto 1
		gosub :move~twarp
		gosub  :player~currentprompt
		if ($player~twarpsuccess = true)
			send "p ty"
		else
			send " C R " & $map~stardock & "*"
			settextlinetrigger 1 :itsalive "Items     Status  Trading % of max OnBoard"
			settextlinetrigger 2 :nosoupforme "I have no information about a port in that sector"
			pause

			:nosoupforme
			killtrigger 1
			setvar $switchboard~message "StarDock appears to have been Blown Up!*"
			gosub :switchboard~switchboard
			goto :wait_for_command

			:itsalive
			killtrigger 2
			send "q "
			setvar $player~warpto $map~stardock
			gosub :move~twarp
			gosub  :player~currentprompt
			if ($player~twarpsuccess = true)
				send "P  S G YG Q s p"
			else
				setvar $switchboard~message $player~msg&"*"
				gosub :switchboard~switchboard
				goto :wait_for_command
			end
		end
	else
		setvar $switchboard~message "Not currently at a class 0 or 9 port. Use the seek option to twarp to a known class 0 or 9 port and back.*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
end
setvar $message "No limpet on my ship.*"
settextlinetrigger limpet   :marklimpet	 "After an intensive scanning search, they find and remove the Limpet"
settextlinetrigger limpetno	 :marklimpetno   "The port official frowns at you (you haven't the funds!) and storms"
settextlinetrigger fighter  :buyfighters	"A  Cargo holds     :"
pause

:marklimpet
setvar $message "Limpet scrubbed off of hull.*"
pause

:marklimpetno
setvar $message "Limpet exists, but not enough cash to get scrubbed.*"
pause

:buyfighters
killalltriggers
if ($scrubonly <> true)
	getword currentline $holdstobuy 10
	waiton " credits per fighter "
	getword currentline $figstobuy 8
	waiton " credits per point "
	getword currentline $shieldstobuy 9
	if (($holds = true) and ($holdstobuy > 0))
		send "a "&$holdstobuy&"* y "
	end
	if (($fighters = true) and ($figstobuy > 0))
		send "b "&$figstobuy&"* "
	end
	if (($shields = true) and ($shieldstobuy > 0))
		send "c "&$shieldstobuy&"* "
	end
	send "q q q * "
else
	send "b 0* c 0* q q q * "
end
if ($seek = true)
	gosub :player~quikstats
	setvar $player~warpto $back
	gosub :move~twarp
	if ($player~twarpsuccess <> true)
		setvar $switchboard~message $player~msg&"*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
end
if ($startinglocation = "Citadel")
	gosub :planet~landingsub
end
gosub :player~quikstats
if (($holdstobuy > 0) and ($holds = true))
	format $holdstobuy $holdstobuy number
	setvar $message $message&"   - "&$holdstobuy&" holds purchased.*"
end
if (($figstobuy > 0) and ($holds = true))
	format $figstobuy $figstobuy number
	setvar $message $message&"   - "&$figstobuy&" fighters purchased.*"
end
if (($shieldstobuy > 0) and ($holds = true))
	format $shieldstobuy $shieldstobuy number
	setvar $message $message&"   - "&$shieldstobuy&" shields purchased.*"
end
if ($message <> "")
	setvar $switchboard~message $message
	gosub :switchboard~switchboard
end

:wait_for_command
halt

# includes:
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
