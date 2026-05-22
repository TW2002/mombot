# ============================== START STORE SHIP ====================================
:storeship
:shipstore
gosub :loadvars~loadvars

gosub  :player~currentprompt
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel"
gosub :player~checkstartingprompt
gosub :ship~savetheship
# ================================== END STORE SHIP ==============================================

halt

#INCLUDES:
include "source\include\ship"
include "source\include\player"
include "source\include\loadvars"
