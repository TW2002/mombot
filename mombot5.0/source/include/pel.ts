# requires $pel~destination to be defined #

:PEL~RUN
:PEL~PEL
if ($PEL_PLANET = 0)
	setvar $PEL_PLANET ""
end
setvar $BOT~COMMAND "pel"
setvar $BOT~USER_COMMAND_LINE " pel "&$DESTINATION&" "&$PEL_PLANET
setvar $BOT~PARM1 $DESTINATION
setvar $BOT~PARM2 $PEL_PLANET
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\offense\pel.cts"
seteventtrigger PELENDED :PEL~PELENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\offense\pel.cts"
pause
:PEL~PELENDED
return
