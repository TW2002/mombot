:HOLO~RUN
:HOLO~HOLO
setvar $BOT~COMMAND "holo"
setvar $BOT~USER_COMMAND_LINE " holo"
setvar $BOT~PARM1 ""
setvar $BOT~PARM2 ""
setvar $BOT~PARM3 ""
setvar $BOT~PARM4 ""
setvar $BOT~PARM5 ""
setvar $BOT~PARM6 ""
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3
savevar $BOT~PARM4
savevar $BOT~PARM5
savevar $BOT~PARM6
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\holo.cts"
seteventtrigger HOLOEND1 :HOLO~HOLOEND1 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\holo.cts"
pause
:HOLO~HOLOEND1
return
