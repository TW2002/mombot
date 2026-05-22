gosub :loadvars~loadvars
gosub :help~initialize

setvar $bot~command "scrub"
setvar $help~help[1]  $help~tab&"scrub {seek} "
setvar $help~help[2]  $help~tab&"     "
setvar $help~help[3]  $help~tab&"   Gets rid of limpets off of your hull"
setvar $help~help[4]  $help~tab&"     "
setvar $help~help[5]  $help~tab&"   {seek} - twarp to class 9 or 0 port and back"
gosub :help~helpfile

:scrub
setvar $message ""
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
setvar $startinglocation $player~current_prompt
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
	if ($bot~parm1 = "seek")
		if ($startinglocation = "Citadel")
			send "q t*t1* "
			gosub :planet~getplanetinfo
			send "c "
		end
		gosub :player~quikstats
		setvar $back $player~current_sector
		setvar $player~warpto 1
		gosub :move~twarp
		gosub :player~currentprompt
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
			gosub :player~currentprompt
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
settextlinetrigger limpet   :marklimpet   "After an intensive scanning search, they find and remove the Limpet"
settextlinetrigger limpetno :marklimpetno "The port official frowns at you (you haven't the funds!) and storms"
settextlinetrigger fighter  :buyfighters  "B  Fighters        :"
pause

:marklimpet
setvar $message "Limpet scrubbed off of hull.*"
pause

:marklimpetno
setvar $message "Limpet exists, but not enough cash to get scrubbed.*"
pause

:buyfighters
killalltriggers
send "b 0* c 0* q q q * "
if ($bot~parm1 = "seek")
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
