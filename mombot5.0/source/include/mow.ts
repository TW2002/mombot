:MOW~RUN
:MOW~MOW



if ($MOW~DEPLOY = 0)
  setvar $MOW~DEPLOY ""
end
setvar $BOT~COMMAND "mow"
setvar $BOT~USER_COMMAND_LINE " mow "&$MOW~DESTINATION&" "&$MOW~DEPLOY
setvar $BOT~PARM1 $MOW~DESTINATION
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
seteventtrigger MOWENDED :MOWENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
pause
:MOW~MOWENDED
return
