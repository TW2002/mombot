:PWARP~PWARP
send "p" $PWARP~WARPTO "*y"
settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
pause
:PWARP~NO_PWARP_LOCK

killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
killtrigger NO_PWARP_LOCK


send "'{" $PWARP~BOT_NAME "} - No fighter down at that location!*"
return
:PWARP~NO_ORE

killtrigger PWARP_LOCK
killtrigger NO_ORE
killtrigger ALREADY
killtrigger NO_PWARP_LOCK
send "'{" $PWARP~BOT_NAME "} - Not enough fuel for that pwarp.*"
return
:PWARP~PWARP_LOCK


killtrigger NO_PWARP_LOCK
killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
waitfor "Planet is now in sector"
send "'{" $PWARP~BOT_NAME "} - Planet moved to sector "&$PWARP~WARPTO&".*"
return
:PWARP~ALREADY

killtrigger NO_PWARP_LOCK
killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
send "'{" $PWARP~BOT_NAME "} - Planet already in that sector!.*"

return

:PWARP~MOWENDED
return


:PWARP~RUN
setVar $BOT~COMMAND "pwarp"
setVar $BOT~USER_COMMAND_LINE " pwarp " & $PWARP~DESTINATION & " silent"
setVar $BOT~PARM1 $PWARP~DESTINATION
setVar $BOT~PARM2 $MOW~DEPLOY
setVar $BOT~PARM3 ""
setVar $BOT~PARM4 ""
setVar $BOT~PARM5 ""
setVar $BOT~PARM6 ""
saveVar $BOT~PARM1
saveVar $BOT~PARM2
saveVar $BOT~PARM3
saveVar $BOT~PARM4
saveVar $BOT~PARM5
saveVar $BOT~PARM6
saveVar $BOT~COMMAND
saveVar $BOT~USER_COMMAND_LINE
load "scripts\" & $BOT~MOMBOT_DIRECTORY & "\commands\general\pwarp.cts"
setEventTrigger PWARPENDED :PWARP~MOWENDED "SCRIPT STOPPED" "scripts\" & $BOT~MOMBOT_DIRECTORY & "\commands\general\pwarp.cts"
pause
