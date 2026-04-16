gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"ss - send subspace messages  "
	gosub :bot~helpfile

	send "'"&$BOT~user_command_line&"*"
	halt
    
#INCLUDES:
include "source\include\bot"
