systemscript


gosub :BOT~LOADVARS
setvar $BOT~HELP[1] $BOT~TAB&"Does bot command at certain time "
setvar $BOT~HELP[2] $BOT~TAB&"      "
setvar $BOT~HELP[3] $BOT~TAB&"  at [time] [bot command]"
setvar $BOT~HELP[4] $BOT~TAB&"         "
setvar $BOT~HELP[5] $BOT~TAB&"  Options: "
setvar $BOT~HELP[6] $BOT~TAB&"            {time} - time to do command each day"
setvar $BOT~HELP[7] $BOT~TAB&"     {bot command} - bot command to run, parameters and all"
setvar $BOT~HELP[8] $BOT~TAB&"           {clear} - clears all commands"
setvar $BOT~HELP[9] $BOT~TAB&"               "
setvar $BOT~HELP[10] $BOT~TAB&"                     example: 5:30:00 PM"
setvar $BOT~HELP[11] $BOT~TAB&"     The time is on your machine, not the game server"
gosub :BOT~HELPFILE


loadvar $BOT~BOT_NAME
loadvar $BOT~PARM1
loadvar $BOT~USER_COMMAND_LINE
loadvar $BOT~TIMER_FILE

if ($BOT~PARM1 = "clear")
  delete $BOT~TIMER_FILE
  setvar $SWITCHBOARD~MESSAGE "Timer file for this game has been cleared.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end





getlength $BOT~PARM1 $LENGTH
getwordpos $BOT~USER_COMMAND_LINE $POS $BOT~PARM1


if (($BOT~PARM2 <> "pm") and ($BOT~PARM2 <> "am"))
  send "'{"&$BOT~BOT_NAME&"} - Time must be entered in system format.*"
  goto :JUST_LOADED_TIMERS
end

fileexists $EXISTS $BOT~TIMER_FILE
if ($EXISTS)
  readtoarray $BOT~TIMER_FILE $TIMER_ARRAY
  setvar $I 1
  setvar $ISFOUND FALSE
  while (($I <= $TIMER_ARRAY) and ($ISFOUND <> TRUE))
    if ($BOT~USER_COMMAND_LINE = $TIMER_ARRAY[$I])
      setvar $ISFOUND TRUE
    end
    add $I 1
  end
end
if ($ISFOUND <> TRUE)
  uppercase $BOT~USER_COMMAND_LINE
  write $BOT~TIMER_FILE $BOT~USER_COMMAND_LINE
end
:JUST_LOADED_TIMERS



setvar $SAVED_TIMERS FALSE
fileexists $EXISTS $BOT~TIMER_FILE
if ($EXISTS)
  readtoarray $BOT~TIMER_FILE $TIMER_ARRAY
  if ($TIMER_ARRAY > 0)
    setvar $SAVED_TIMERS TRUE
  end
end
:SETTIMER

setvar $I 1
while ($I <= $TIMER_ARRAY)
  killtrigger $I&"timer"
  add $I 1
end
setvar $I 1
setvar $SWITCHBOARD~SELF_COMMAND 2
setvar $SWITCHBOARD~MESSAGE ""
while ($I <= $TIMER_ARRAY)
  gosub :STRIP_TIME_LINE
  seteventtrigger $I&"timer" :CONTINUE "TIME HIT" $TIME&" "&$AMPM
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"At "&$TIME&" "&$AMPM&", I will be running this command: "&$BOT_COMMAND&"*"
  add $I 1
end
gosub :SWITCHBOARD~SWITCHBOARD

pause
:CONTINUE


setvar $TIME_HIT TIME
setvar $I 1
setvar $ISFOUND FALSE
while (($I <= $TIMER_ARRAY) and ($ISFOUND <> TRUE))
  getwordpos $TIMER_ARRAY[$I] $POS $TIME_HIT

  if ($POS > 0)
    setvar $ISFOUND TRUE
    gosub :STRIP_TIME_LINE
    send "'"&$BOT~BOT_NAME&" "&$BOT_COMMAND&"*"
  end
  add $I 1
end
goto :SETTIMER

halt
:STRIP_TIME_LINE

getword $TIMER_ARRAY[$I] $TIME 1
getword $TIMER_ARRAY[$I] $AMPM 2
uppercase $AMPM
getlength $TIME $LENGTH
getwordpos $TIMER_ARRAY[$I] $POS $TIME
cuttext $TIMER_ARRAY[$I] $BOT_COMMAND ($POS + ($LENGTH + 3)) 9999
lowercase $BOT_COMMAND
return

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
