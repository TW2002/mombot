gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"fed - send subspace messages  "
	gosub :HELP~HELPFILE

	send "`"&$BOT~user_command_line&"*"
	halt
    
#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
