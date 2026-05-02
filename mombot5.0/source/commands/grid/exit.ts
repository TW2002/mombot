gosub :BOT~loadVars

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :bot~helpfile
    halt
end

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

setvar $I 1

while ($I <= $BOT~PARM1)
  gosub :XENTER~XENTER

  if ($XENTER~STARTINGLOCATION = "Command")
    if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
      if ($XENTER~REFILL = TRUE)
        gosub :PLAYER~TOPOFF
      else
        if ($I = $BOT~PARM1)
          if ($XENTER~STARTINGLOCATION = "Command")
            send "f z1* z c d * "
          end
        end
      end
    end
  end
  add $I 1
end

gosub :PLAYER~QUIKSTATS
if ($BOT~PARM1 > 1)
  setvar $SWITCHBOARD~MESSAGE "Exit Enter - "&$BOT~PARM1&" times completed.*"
else
  setvar $SWITCHBOARD~MESSAGE "Exit Enter.*"
end
gosub :SWITCHBOARD~SWITCHBOARD
halt

#INCLUDES:
include "source\include\xenter"
