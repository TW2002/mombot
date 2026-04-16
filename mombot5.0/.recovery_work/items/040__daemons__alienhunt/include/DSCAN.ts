:DSCAN~RUN
:DSCAN~DSCAN
setvar $BOT~COMMAND "dscan"
setvar $BOT~USER_COMMAND_LINE " dscan silent"
setvar $BOT~PARM1 "silent"
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\dscan.cts"
seteventtrigger DSCANDONE :DSCANDONE "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\dscan.cts"
pause
:DSCAN~DSCANDONE
return
