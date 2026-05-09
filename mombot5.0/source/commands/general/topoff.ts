gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
if (($BOT~PARM1 = "?") or ($BOT~PARM1 = "help"))
  goto :WAIT_FOR_COMMAND
end
:TOPOFF


killalltriggers
gosub :PLAYER~CURRENTPROMPT
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($BOT~STARTINGLOCATION = "Citadel")
  send " q "
  gosub :PLANET~GETPLANETINFO
  send " q "
end
if (($BOT~PARM1 <> "o") and (($BOT~PARM1 <> "t") and ($BOT~PARM1 <> "d")))
  setvar $TYPE "d"
  isnumber $TEST CURRENTSECTOR
  if ($TEST = TRUE)
    if ((CURRENTSECTOR > 0) and (CURRENTSECTOR <= SECTORS))
      setvar $TYPE SECTOR.FIGS.TYPE[CURRENTSECTOR]
      if ($TYPE = "Offensive")
        setvar $TYPE "o"
      elseif ($TYPE = "Defensive")
        setvar $TYPE "d"
      elseif ($TYPE = "Toll")
        setvar $TYPE "t"
      else
        setvar $TYPE "d"
      end
    end
  end
  setvar $BOT~PARM1 $TYPE
end
setvar $TO_DROP $BOT~PARM1
gosub :DO_TOPOFF
if ($BOT~STARTINGLOCATION = "Citadel")
  gosub :PLANET~LANDINGSUB
end
setvar $SWITCHBOARD~MESSAGE "TopOff complete Left "&$FTRS_TO_LEAVE&" fighters.*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :WAIT_FOR_COMMAND
:DO_TOPOFF
:DO_TOPOFF_AGAIN
killalltriggers
send " F"
waiton "Your ship can support up to"
getword CURRENTLINE $FTRS_TO_LEAVE 10
striptext $FTRS_TO_LEAVE ","
striptext $FTRS_TO_LEAVE " "
if ($FTRS_TO_LEAVE < 1)
  setvar $FTRS_TO_LEAVE 1
end
send " "&$FTRS_TO_LEAVE&" * C "&$TO_DROP
settextlinetrigger TOPOFF_SUCCESS :TOPOFF_SUCCESS "Done. You have "
settextlinetrigger TOPOFF_FAILURE1 :DO_TOPOFF_AGAIN "You don't have that many fighters available."
settextlinetrigger TOPOFF_FAILURE2 :DO_TOPOFF_AGAIN "Too many fighters in your fleet!  You are limited to"
pause
:TOPOFF_SUCCESS
return
:WAIT_FOR_COMMAND


setvar $HELP~HELP[1] $HELP~TAB&"topoff - fill up ship with fighters from sector "
gosub :HELP~HELPFILE
halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
