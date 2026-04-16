:CALL~RUN
:CALL~CALL
setvar $BOT~COMMAND "call"
setvar $BOT~PARM1 ""
setvar $BOT~USER_COMMAND_LINE " call  "
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
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\defense\call.cts"
seteventtrigger CALLEND1 :CALL~CALLEND1 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\defense\call.cts"
pause
:CALL~CALLEND1

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
	setvar $SWITCHBOARD~MESSAGE "Not on planet even after call saveme.  I'm in real trouble.  Will try again in 15 seconds.*"
	gosub :SWITCHBOARD~SWITCHBOARD

	killalltriggers
	setdelaytrigger CALLRETRY :CALL~CALL 15000
	pause
end

return
