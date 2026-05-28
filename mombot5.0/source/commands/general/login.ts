gosub :help~initialize
setvar $help~help[1] $help~tab&"Sets the ship or citadel overnight message to Login."
gosub :help~helpfile

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
include "source\include\help"
