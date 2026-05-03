	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE


	setVar $HELP~HELP[1]  $HELP~TAB&"  wait {ms:#}    "
	setVar $HELP~HELP[2]  $HELP~TAB&"                                                            "
	setVar $HELP~HELP[3]  $HELP~TAB&"    Waits for time specified.  This is a utility script  "
	setVar $HELP~HELP[4]  $HELP~TAB&"    created mostly for the multicommand functionality.     "
	setVar $HELP~HELP[5]  $HELP~TAB&"                                                             "
	setVar $HELP~HELP[6]  $HELP~TAB&"         {ms:#} - How many milliseconds to wait            "
	setVar $HELP~HELP[7]  $HELP~TAB&"                                                             "
	setVar $HELP~HELP[8]  $HELP~TAB&"        Examples:                                           "
	setVar $HELP~HELP[9]  $HELP~TAB&"              >wait 10000                             "
	setVar $HELP~HELP[10] $HELP~TAB&"              >mow 1|wait 5000|mow 25                   "
	setVar $HELP~HELP[11] $HELP~TAB&"              >wait     (waits default of 1 second)        "
	gosub :HELP~HELPFILE

	if ($bot~parm1 <> "")
        getWordPos $bot~user_command_line $pos "ms:"
        if ($pos > 0)
            getText " "&$bot~user_command_line&" " $milliseconds "ms:" " "
            if ($milliseconds = false)
                setVar $SWITCHBOARD~message "Invalid milliseconds entered.*"
                gosub :SWITCHBOARD~switchboard
                halt
            end
        else
            setvar $milliseconds $bot~parm1
        end
	else
        setvar $milliseconds 1000
    end



killtrigger delay
setDelayTrigger delay :done_waiting $milliseconds
pause
:done_waiting
halt



#-=-=-=-=-includes-=-=-=-=-
include "source\include\loadvars"
include "source\include\help"
