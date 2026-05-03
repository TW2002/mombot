gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $BOT~USERNAME
loadvar $BOT~LETTER
loadvar $BOT~PASSWORD
loadvar $BOT~SUBSPACE

setvar $HELP~HELP[1] $HELP~TAB&"cn9"
setvar $HELP~HELP[2] $HELP~TAB&"  - Resets the cn settings in the game to bot desirable settings."
gosub :HELP~HELPFILE


gosub :PLAYER~CURRENTPROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command Computer"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($PLAYER~STARTINGLOCATION = "Computer")
  send "q"
end
gosub :PLAYER~STARTCNSETTINGS
setvar $SWITCHBOARD~MESSAGE "CN Settings are reset for this bot.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
