:PATP~RUN
:PATP~PATP




if ($PATP~MINIMUM = 0)
  setvar $PATP~MINIMUM 10000
end
if ($PATP~UPGRADE = TRUE)
  setvar $PATP~UPGRADE "upgrade"
end
if ($PATP~DOCIM = TRUE)
  setvar $PATP~DOCIM "docim"
end
setvar $BOT~COMMAND "patp"
setvar $BOT~USER_COMMAND_LINE " patp "&$PATP~MINIMUM&" "&$PATP~UPGRADE&" "&$PATP~DOCIM&" silent"

setvar $BOT~PARM1 $PATP~MINIMUM
savevar $BOT~PARM1
setvar $BOT~PARM2 $PATP~UPGRADE
savevar $BOT~PARM2
setvar $BOT~PARM3 $PATP~DOCIM
savevar $BOT~PARM3
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\patp.cts"
seteventtrigger PATPENDED :PATPENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\patp.cts"
pause
:PATP~PATPENDED
return
