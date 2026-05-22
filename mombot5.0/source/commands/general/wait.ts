gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"  wait {ms:#}    "
setvar $help~help[2]  $help~tab&"                                                            "
setvar $help~help[3]  $help~tab&"    Waits for time specified.  This is a utility script  "
setvar $help~help[4]  $help~tab&"    created mostly for the multicommand functionality.     "
setvar $help~help[5]  $help~tab&"                                                             "
setvar $help~help[6]  $help~tab&"         {ms:#} - How many milliseconds to wait            "
setvar $help~help[7]  $help~tab&"                                                             "
setvar $help~help[8]  $help~tab&"        Examples:                                           "
setvar $help~help[9]  $help~tab&"              >wait 10000                             "
setvar $help~help[10] $help~tab&"              >mow 1|wait 5000|mow 25                   "
setvar $help~help[11] $help~tab&"              >wait     (waits default of 1 second)        "
gosub :help~helpfile

if ($bot~parm1 <> "")
	getwordpos $bot~user_command_line $pos "ms:"
	if ($pos > 0)
		gettext " "&$bot~user_command_line&" " $milliseconds "ms:" " "
		if ($milliseconds = false)
			setvar $switchboard~message "Invalid milliseconds entered.*"
			gosub :switchboard~switchboard
			halt
		end
	else
		setvar $milliseconds $bot~parm1
	end
else
	setvar $milliseconds 1000
end

killtrigger delay
setdelaytrigger delay :done_waiting $milliseconds
pause

:done_waiting
halt

#-=-=-=-=-includes-=-=-=-=-
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
