# ============================== START STORE SHIP ====================================
:storeship
:shipstore

gosub :BOT~loadVars

		gosub  :player~currentPrompt
		setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
		setVar $BOT~validPrompts "Command Citadel"
		gosub :BOT~checkStartingPrompt
		gosub :ship~savetheship
# ================================== END STORE SHIP ==============================================

halt

#INCLUDES:
include "source\include\bot"
include "source\include\player"
include "source\include\ship"
