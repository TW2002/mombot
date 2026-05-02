gosub :BOT~LOADVARS
loadvar $BOT~USERNAME
loadvar $BOT~LETTER
loadvar $BOT~PASSWORD
loadvar $BOT~SUBSPACE

setvar $BOT~HELP[1] $BOT~TAB&"cn9"
setvar $BOT~HELP[2] $BOT~TAB&"  - Resets the cn settings in the game to bot desirable settings."
gosub :BOT~HELPFILE


gosub :PLAYER~CURRENTPROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command Computer"
gosub :BOT~CHECKSTARTINGPROMPT
if ($PLAYER~STARTINGLOCATION = "Computer")
  send "q"
end
gosub :PLAYER~STARTCNSETTINGS
setvar $SWITCHBOARD~MESSAGE "CN Settings are reset for this bot.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

# includes:
include "source\include\bot"
