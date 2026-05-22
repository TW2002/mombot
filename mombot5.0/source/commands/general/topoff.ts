gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"topoff - fill up ship with fighters from sector "
gosub :help~helpfile

:topoff
killalltriggers
gosub :player~currentprompt
setvar $bot~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($bot~startinglocation = "Citadel")
	send " q "
	gosub :planet~getplanetinfo
	send " q "
end
if (($bot~parm1 <> "o") and (($bot~parm1 <> "t") and ($bot~parm1 <> "d")))
	setvar $type "d"
	isnumber $test currentsector
	if ($test = true)
		if ((currentsector > 0) and (currentsector <= sectors))
			setvar $type sector.figs.type[currentsector]
			if ($type = "Offensive")
				setvar $type "o"
			elseif ($type = "Defensive")
				setvar $type "d"
			elseif ($type = "Toll")
				setvar $type "t"
			else
				setvar $type "d"
			end
		end
	end
	setvar $bot~parm1 $type
end
setvar $to_drop $bot~parm1
gosub :do_topoff
if ($bot~startinglocation = "Citadel")
	gosub :planet~landingsub
end
setvar $switchboard~message "TopOff complete Left "&$ftrs_to_leave&" fighters.*"
gosub :switchboard~switchboard
goto :wait_for_command

:do_topoff
:do_topoff_again
killalltriggers
send " F"
waiton "Your ship can support up to"
getword currentline $ftrs_to_leave 10
striptext $ftrs_to_leave ","
striptext $ftrs_to_leave " "
if ($ftrs_to_leave < 1)
	setvar $ftrs_to_leave 1
end
send " "&$ftrs_to_leave&" * C "&$to_drop
settextlinetrigger topoff_success :topoff_success "Done. You have "
settextlinetrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
settextlinetrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
pause

:topoff_success
return

:wait_for_command
halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
