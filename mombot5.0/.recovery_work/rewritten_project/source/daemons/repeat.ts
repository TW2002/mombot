gosub :BOT~LOADVARS


setvar $BOT~HELP[1] $BOT~TAB&"Repeats bot commands "
setvar $BOT~HELP[2] $BOT~TAB&"      "
setvar $BOT~HELP[3] $BOT~TAB&"repeat [delay in seconds] [bot command]"
setvar $BOT~HELP[4] $BOT~TAB&"         "
setvar $BOT~HELP[5] $BOT~TAB&"Options: "
setvar $BOT~HELP[6] $BOT~TAB&"{delay in seconds} - seconds to delay before calling bot command again"
setvar $BOT~HELP[7] $BOT~TAB&"     {bot command} - bot command to run, parameters and all"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Repeater"
gosub :BOT~BANNER
loadvar $BOT~BOT_NAME
loadvar $BOT~PARM1
loadvar $BOT~USER_COMMAND_LINE

getlength $BOT~PARM1 $LENGTH
getwordpos $BOT~USER_COMMAND_LINE $POS $BOT~PARM1

cuttext $BOT~USER_COMMAND_LINE $BOT_COMMAND ($POS + $LENGTH) 9999

isnumber $TEST $BOT~PARM1
if ($TEST <> TRUE)
  send "'{"&$BOT~BOT_NAME&"} - Must enter time of delay in seconds."
  halt
end

setvar $DELAY ($BOT~PARM1 * 1000)
:CONTINUE
send "'"&$BOT~BOT_NAME&" "&$BOT_COMMAND&"*"
setdelaytrigger DELAY :CONTINUE $DELAY
pause

# includes:
include "source\include\BOT"
include "source\include\SWITCHBOARD"
