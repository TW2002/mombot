#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MODULES~XENTER
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :PLAYER~QUIKSTATS
loadvar $GAME~GAME_MENU_PROMPT

setvar $MODULES~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
if ($MODULES~STARTINGLOCATION = "Citadel")
  send "q m n t *"
  gosub :PLANET~GETPLANETINFO
  send "c "
end

:MODULES~EXIT_XENTER
if ($MODULES~STARTINGLOCATION = "Command")
  setvar $MODULES~EXIT_MAC "q y * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *       za9999*   z*   /"
else
  setvar $MODULES~EXIT_MAC "r   y   * * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$PLANET~PLANET&"* c  /"
end

killtrigger 1
killtrigger 2
killtrigger 3
send $MODULES~EXIT_MAC
settexttrigger 1 :PICKGAME "Selection (? for menu)"
settexttrigger 2 :ENTER_CHOICE_XENTER "Enter your choice:"
settexttrigger 3 :PICKGAME $GAME~GAME_MENU_PROMPT
pause

:MODULES~ENTER_CHOICE_XENTER
killtrigger 1
killtrigger 2
killtrigger 3
send $MODULES~EXIT_ENTER
waiton #179
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MODULES~PICKGAME
# Possibly deprecated, not currently called
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger 2
killtrigger 3
send $BOT~LETTER&"  *  "
waiton "[Pause]"
send " * "
goto :ENTER_CHOICE_XENTER
goto :BOT~WAIT_FOR_COMMAND
