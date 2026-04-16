:BUYFIG~RUN
:BUYFIG~BUYFIG
setvar $BOT~COMMAND "buy"
setvar $BOT~USER_COMMAND_LINE " buy fig silent"
setvar $BOT~PARM1 "fig"
setvar $BOT~PARM2 ""
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\resource\buy.cts"
seteventtrigger BUYENDED :BUYENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\resource\buy.cts"
pause
:BUYFIG~BUYENDED
return
