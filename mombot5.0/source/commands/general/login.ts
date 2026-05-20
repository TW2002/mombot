:login
gosub  :player~currentPrompt
setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
setVar $BOT~validPrompts "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($PLAYER~startingLocation = "Command")
	send "t tLogin** q "
elseif ($PLAYER~startingLocation = "Citadel")
	send "x tLogin** q "
end

halt

#INCLUDES:

#INCLUDES:
include "source\include\player"
