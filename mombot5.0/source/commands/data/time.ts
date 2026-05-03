	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	setVar $HELP~HELP[1]  $HELP~TAB&"Displays system's local time "
	setVar $HELP~HELP[2]  $HELP~TAB&"      "
	setVar $HELP~HELP[3]  $HELP~TAB&"  time "
	setVar $HELP~HELP[4]  $HELP~TAB&"         "
	gosub :HELP~HELPFILE


	loadVar $bot~bot_name
	loadVar $bot~parm1
	loadVar $bot~user_command_line
	loadvar $bot~timer_file





	setvar $switchboard~message "Current system time - "&TIME&"*"
	gosub :switchboard~switchboard
	halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
