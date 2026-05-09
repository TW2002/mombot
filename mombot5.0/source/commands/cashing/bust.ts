:LOAD_VARIABLES
loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $BOT_TURN_LIMIT
loadvar $PARM1
loadvar $PARM2
setvar $NAME[1] ".  n"
setvar $NAME[2] ".  n"
setvar $NAME[3] ".  n"
setvar $NAME[4] ".  n"
setvar $NAME[5] ".  n"
setvar $COUNT 0
setvar $BLOW_PLANET "No"
if (($PARM1 = "?") or ($PARM1 = "help"))
  setvar $switchboard~message "bust [Experience Desired]*"
  gosub :switchboard~switchboard
  halt
end
isnumber $TEST $PARM1
if ($TEST)

else
  setvar $switchboard~message "Experience Must Be a Number.*"
  gosub :switchboard~switchboard
  halt
end
:START
gosub :PLAYER~QUIKSTATS
setvar $START_PROMPT $PLAYER~CURRENT_PROMPT
if ($PLAYER~CREDITS < 1000000)
  setvar $switchboard~message "Not Enough Cash on Hand*"
  gosub :switchboard~switchboard
  halt
end
isnumber $TEST $PARM1
if ($TEST)
  setvar $EXPERIENCEAMOUNT $PARM1
else
  setvar $switchboard~message "Invalid Experience Amount.*"
  gosub :switchboard~switchboard
  halt
end
if ($PLAYER~EXPERIENCE > $EXPERIENCEAMOUNT)
  setvar $switchboard~message "Desired Experience Reached.*"
  gosub :switchboard~switchboard
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end

if (($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "<StarDock>"))
  setvar $switchboard~message "Script must be run from Command or StarDock.*"
  gosub :switchboard~switchboard
  halt
end
if ($PLAYER~CORP > 1)
  setvar $PLAYER~CORP "Yes"
else
  setvar $PLAYER~CORP "No"
end
setvar $SCANNER $PLAYER~PLANET_SCANNER
:RUN

killalltriggers
if ($PLAYER~EXPERIENCE > $EXPERIENCEAMOUNT)
  setvar $switchboard~message "Desired Experience Reached.*"
  gosub :switchboard~switchboard
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end
if ($PLAYER~CURRENT_PROMPT = "<StarDock>")
  send "q  "
end
add $COUNT 1
if ($BLOW_PLANET = "Yes")
  send "l " $PLANET "*  z  d  y  "
  setvar $BLOW_PLANET "No"
end
if ($COUNT > 5)
  setvar $COUNT 1
  goto :RUN
end
gosub :PLAYER~QUIKSTATS
if (($PLAYER~CREDITS < 1000000) and ($PLAYER~ATOMIC < 1)) or (($PLAYER~CREDITS < 1000000) and ($PLAYER~GENESIS < 1))
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end
killalltriggers
send "u y  "
settexttrigger GENESIS :BUY_MORE "You don't have any Genesis Torpedoes"
settexttrigger CREATE :CREATE_PLANET "For building this planet you receive"
pause
:CREATE_PLANET

killtrigger GENESIS
send $NAME[$COUNT] "*  c  l"
if ($SCANNER = "Yes")
  settexttrigger 3 :LAND "None"
  pause
  :LAND
  gettext CURRENTLINE $PLANET "<" ">"
  send $PLANET "*  "
end
send " z  d  y  "
settexttrigger ATOMIC :BUY_ATOMIC "You do not have any Atomic Detonators"
settexttrigger BLOWN :SUB_RUN "For blowing up this planet you"
pause
:SUB_RUN
setvar $BLOW_PLANET "No"
goto :RUN
:BUY_ATOMIC
setvar $BLOW_PLANET "Yes"
send "qq"
:BUY_MORE

killtrigger CREATE
send "* * p s h a"
waitfor "How many Atomic Detonators do you want"
gettext CURRENTLINE $PLAYER~ATOMIC "(Max " ")"
send $PLAYER~ATOMIC "* t"
waitfor "How many Genesis Torpedoes do you want"
gettext CURRENTLINE $PLAYER~GENESIS "(Max " ")"
send $PLAYER~GENESIS "* q q "
goto :RUN
include "source\include\player"
include "source\include\switchboard.ts"
