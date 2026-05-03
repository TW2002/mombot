logging "OFF"
gosub :LOADVARS~LOADVARS
:XENTER~RUN




isnumber $XENTER~TEST $BOT~PARM1
if ($XENTER~TEST = FALSE)
  setvar $BOT~PARM1 1
else
  if ($BOT~PARM1 <= 0)
    setvar $BOT~PARM1 1
  end
end
getwordpos $BOT~USER_COMMAND_LINE $XENTER~POS "fill"
if ($XENTER~POS > 0)
  setvar $XENTER~REFILL TRUE
else
  setvar $XENTER~REFILL FALSE
end
:XENTER~RUNLOOP
setvar $XENTER~I 1
while ($XENTER~I <= $BOT~PARM1)
  gosub :XENTER~XENTER
  if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
    if ($XENTER~REFILL = TRUE)
      gosub :PLAYER~TOPOFF
    else
      if ($XENTER~I = $BOT~PARM1)
        send "f z1* z c d * "
      end
    end
  end
  add $XENTER~I 1
end
:XENTER~DONE
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
include "source\include\loadvars"
include "source\include\xenter"
