:SCRUB~RUN
:SCRUB~SCRUB


if ($SCRUB~SEEK)
  setvar $SCRUB~SEEK "seek"
end
setvar $BOT~COMMAND "scrub"
setvar $BOT~USER_COMMAND_LINE " scrub "&$SCRUB~SEEK&" silent"
setvar $BOT~PARM1 $SCRUB~SEEK
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\scrub.cts"
seteventtrigger HOLOEND1 :HOLOEND1 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\scrub.cts"
pause
:SCRUB~HOLOEND1
return
