gosub :BOT~loadVars
if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end
# ============================== START EXIT ENTER SUB ==============================    
goto :modules~xenter
halt

:wait_for_command
	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :bot~helpfile
halt

#INCLUDES:
include "source\include\bot"
include "source\include\modules"
