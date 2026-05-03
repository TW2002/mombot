# ============================== START STORE SHIP ====================================
:storeship
:shipstore

gosub :LOADVARS~LOADVARS

		gosub  :player~currentPrompt
		setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
		setVar $BOT~validPrompts "Command Citadel"
		gosub :PLAYER~CHECKSTARTINGPROMPT
		gosub :ship~savetheship
# ================================== END STORE SHIP ==============================================

halt

#INCLUDES:
include "source\include\ship"
include "source\include\player"
include "source\include\loadvars"
