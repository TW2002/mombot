loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $STARDOCK
loadvar $COMMAND
loadvar $PLANET
setvar $TOTAL 0
setvar $DESIRED 0
gosub :QUIKSTATS~QUIKSTATS
setvar $STARTINGLOCATION $QUIKSTATS~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  send "'{" $BOT_NAME "} - Must start at Citadel.*"
  halt
end
if ($PLANET <= 0)
  send "'{" $BOT_NAME "} - Unknown planet number. Display planet to bot so it can know the planet number.*"
  halt
end
isnumber $ISNUMBER $PARM1
if ($ISNUMBER)
  if ($PARM1 > 0)
    setvar $BUYLIMITED TRUE
    setvar $DESIRED $PARM1
  end
end
setvar $CONTINUE TRUE
while ($CONTINUE = TRUE)
  send "'"&$BOT_NAME&" w*"
  waiton " credits taken from citadel."
  gosub :QUIKSTATS~QUIKSTATS
  if ($QUIKSTATS~CREDITS < 1000)
    send "'{" $BOT_NAME "} - Credits are under 1000.*"
    setvar $CONTINUE FALSE
  else
    send "'"&$BOT_NAME&" buy fig "&($DESIRED - $TOTAL)&"*"
    waiton " Fighters added on planet "&$PLANET&"."
    getword CURRENTLINE $ADDED 3
    add $TOTAL $ADDED
    send "'"&$BOT_NAME&" movefig s*"
    waiton "'{"&$BOT_NAME&"} - fighters moved"
  end
  if (($BUYLIMITED = TRUE) and ($TOTAL >= $DESIRED))
    setvar $CONTINUE FALSE
  end
end
send "'"&$BOT_NAME&" d*"
waiton " credits deposited into citadel."
send "'{" $BOT_NAME "} - "&$TOTAL&" fighters purchased and added to sector.*"
halt

# includes:
include "source\include\QUIKSTATS"
include "source\include\VALIDATION"
include "source\include\PLANETINFO"
include "source\include\PWARP"
include "source\include\SHIPSTATS"
