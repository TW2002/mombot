:MAX~RUN
:MAX~MAX




if ($MAX~NOEXP)
  setvar $MAX~NOEXP "noexp"
end
if ($MAX~TYPE = 0)
  setvar $MAX~TYPE "f"
end
setvar $BOT~COMMAND "port"
setvar $BOT~USER_COMMAND_LINE " port upgrade "&$MAX~TYPE&" "&"NOEXP"&" silent "
setvar $BOT~PARM1 "upgrade"
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\grid\port.cts"
seteventtrigger PORTENDED :PORTENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\grid\port.cts"
pause
:MAX~PORTENDED
return
