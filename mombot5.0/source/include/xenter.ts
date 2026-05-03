:XENTER~RUN
:XENTER~XENTER

gosub :PLAYER~QUIKSTATS
loadvar $GAME~GAME_MENU_PROMPT

setvar $XENTER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($XENTER~STARTINGLOCATION = "Citadel")
  send "q m n t *"
  gosub :PLANET~GETPLANETINFO
  send "c "
end

:XENTER~EXIT_XENTER
if ($XENTER~STARTINGLOCATION = "Command")
  setvar $XENTER~EXIT_MAC "q y * "
  setvar $XENTER~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *       za9999*   z*   /"
else
  setvar $XENTER~EXIT_MAC "r   y   * * "
  setvar $XENTER~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$PLANET~PLANET&"* c  /"
end

killtrigger 1
killtrigger 2
killtrigger 3
send $XENTER~EXIT_MAC
settexttrigger 1 :PICKGAME "Selection (? for menu)"
settexttrigger 2 :ENTER_CHOICE_XENTER "Enter your choice:"
settexttrigger 3 :PICKGAME $GAME~GAME_MENU_PROMPT
pause

:XENTER~ENTER_CHOICE_XENTER
killtrigger 1
killtrigger 2
killtrigger 3
send $XENTER~EXIT_ENTER
waiton #179

:PICKGAME
killtrigger 1
killtrigger 2
killtrigger 3
send $BOT~letter&"  *  "
waiton "[Pause]"
send " * "
goto :XENTER~ENTER_CHOICE_XENTER

:XENTER~XENTERENDED
return

include "source\include\player"
include "source\include\planet"
include "source\include\game"
