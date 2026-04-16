:login
	gosub  :player~currentPrompt
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $BOT~validPrompts "Citadel Command"
	gosub :BOT~checkStartingPrompt
	if ($PLAYER~startingLocation = "Command")
		send "t tLogin** q "
	elseif ($PLAYER~startingLocation = "Citadel")
		send "x tLogin** q "
	end

halt

#INCLUDES:
include "source\include\bot"
include "source\include\player"
