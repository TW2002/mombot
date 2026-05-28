# ============================== START STORE SHIP ====================================
:storeship
:shipstore
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"storeship   "
setvar $help~help[2] $help~tab&"      Records information about the current ship.  "
gosub :help~helpfile

gosub  :player~currentprompt
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel"
gosub :player~checkstartingprompt
gosub :ship~savetheship
# ================================== END STORE SHIP ==============================================

halt

#INCLUDES:
include "source\include\ship"
include "source\include\help"
include "source\include\player"
include "source\include\loadvars"
