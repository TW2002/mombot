:login
gosub  :player~currentprompt
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($player~startinglocation = "Command")
	send "t tLogin** q "
elseif ($player~startinglocation = "Citadel")
	send "x tLogin** q "
end

halt

#INCLUDES:

#INCLUDES:
include "source\include\player"
