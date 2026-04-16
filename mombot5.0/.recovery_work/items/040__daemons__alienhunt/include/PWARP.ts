:PWARP~RUN
:PWARP~PWARP


setvar $BOT~COMMAND "pwarp"
setvar $BOT~USER_COMMAND_LINE " pwarp "&$PWARP~DESTINATION&" silent"
setvar $BOT~PARM1 $PWARP~DESTINATION
setvar $BOT~PARM2 $MOW~DEPLOY
setvar $BOT~PARM3 ""
setvar $BOT~PARM4 ""
setvar $BOT~PARM5 ""
setvar $BOT~PARM6 ""
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3
savevar $BOT~PARM4
savevar $BOT~PARM5
savevar $BOT~PARM6
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\pwarp.cts"
seteventtrigger MOWENDED :MOWENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\pwarp.cts"
pause
:PWARP~MOWENDED
return
