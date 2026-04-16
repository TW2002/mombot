logging "OFF"
gosub :BOT~LOADVARS
:EXIT
:XENTER




killalltriggers
gosub :PLAYER~QUIKSTATS
isnumber $TEST $BOT~PARM1
if ($TEST = FALSE)
  setvar $BOT~PARM1 1
else
  if ($BOT~PARM1 <= 0)
    setvar $BOT~PARM1 1
  end
end
getwordpos $BOT~USER_COMMAND_LINE $POS "fill"
if ($POS > 0)
  setvar $REFILL TRUE
else
  setvar $REFILL FALSE
end
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
if ($STARTINGLOCATION = "Citadel")
  send "q m n t *"
  gosub :PLANET~GETPLANETINFO
  send "q "
end
:EXIT_XENTER
setvar $I 1
while ($I <= $BOT~PARM1)
  send "q y * t* * *" $BOT~PASSWORD "*    *    *       za9999*   z*   /"
  waiton #179
  if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
    if ($REFILL = TRUE)
      gosub :PLAYER~TOPOFF
    else
      if ($I = $BOT~PARM1)
        send "f z1* z c d * "
      end
    end
  end
  add $I 1
end
:DONEEXITENTER
if ($STARTINGLOCATION = "Citadel")
  send "l j"&#8&$PLANET~PLANET&"*  m * * * c "
end
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($BOT~PARM1 > 1)
  setvar $SWITCHBOARD~MESSAGE "Exit Enter - "&$BOT~PARM1&" times completed.*"
else
  setvar $SWITCHBOARD~MESSAGE "Exit Enter.*"
end
if ($BOT~SILENT_RUNNING <> TRUE)
  setvar $SWITCHBOARD~SELF_COMMAND FALSE
end
gosub :SWITCHBOARD~SWITCHBOARD
halt

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/VALIDATION.ts"
include "include/SWITCHBOARD.ts"
include "include/PLANET.ts"
include "include/MAP.ts"
