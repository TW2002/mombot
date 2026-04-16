:WITH~RUN
:WITH~WITH



if ($WITH~AMOUNT = 0)
  setvar $WITH~AMOUNT ""
end
setvar $BOT~COMMAND "with"
setvar $BOT~USER_COMMAND_LINE " with silent"
setvar $BOT~PARM1 $WITH~AMOUNT
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\with.cts"
seteventtrigger WITHENDED :WITHENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\with.cts"
pause
:WITH~WITHENDED
return
