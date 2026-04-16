:MOVESHIP~RUN
:MOVESHIP~MOVESHIP


setvar $BOT~COMMAND "moveship"
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\moveship.cts"
seteventtrigger MOVESHIPENDED :MOVEHOMESHIPENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\moveship.cts"
pause
:MOVESHIP~MOVEHOMESHIPENDED
return
