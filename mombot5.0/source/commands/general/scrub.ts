gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setvar $BOT~COMMAND "scrub"
setVar $HELP~HELP[1]  $HELP~TAB&"scrub {seek} "
setVar $HELP~HELP[2]  $HELP~TAB&"     "
setVar $HELP~HELP[3]  $HELP~TAB&"   Gets rid of limpets off of your hull"
setVar $HELP~HELP[4]  $HELP~TAB&"     "
setVar $HELP~HELP[5]  $HELP~TAB&"   {seek} - twarp to class 9 or 0 port and back"
gosub :HELP~HELPFILE

:SCRUB
setVar $MESSAGE ""
setVar $BOT~VALIDPROMPTS "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
setVar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ((CURRENTSECTOR = 1) OR (PORT.CLASS[CURRENTSECTOR] = 0) or (CURRENTSECTOR = $MAP~RYLOS) or (CURRENTSECTOR = $MAP~ALPHA_CENTAURI))
  if ($STARTINGLOCATION = "Citadel")
    send "q t*t1* "
    gosub :PLANET~GETPLANETINFO
    send "q "
  end
  send "p ty"
elseif (CURRENTSECTOR = $MAP~STARDOCK)
  send "p ss ys *p"
else
  if ($BOT~PARM1 = "seek")
    if ($STARTINGLOCATION = "Citadel")
      send "q t*t1* "
      gosub :PLANET~GETPLANETINFO
      send "c "
    end
    gosub :PLAYER~QUIKSTATS
    setVar $BACK $PLAYER~CURRENT_SECTOR
    setVar $PLAYER~WARPTO 1
    gosub :MOVE~TWARP
    gosub :PLAYER~CURRENTPROMPT
    if ($PLAYER~TWARPSUCCESS = TRUE)
      send "p ty"
    else
      send " C R " & $MAP~STARDOCK & "*"
      setTextLineTrigger 1 :ITSALIVE "Items     Status  Trading % of max OnBoard"
      setTextLineTrigger 2 :NOSOUPFORME "I have no information about a port in that sector"
      pause
      :NOSOUPFORME
      killtrigger 1
      setvar $SWITCHBOARD~MESSAGE "StarDock appears to have been Blown Up!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      goto :WAIT_FOR_COMMAND
      :ITSALIVE
      killtrigger 2
      send "q "
      setVar $PLAYER~WARPTO $MAP~STARDOCK
      gosub :MOVE~TWARP
      gosub :PLAYER~CURRENTPROMPT
      if ($PLAYER~TWARPSUCCESS = TRUE)
        send "P  S G YG Q s p"
      else
        setVar $SWITCHBOARD~MESSAGE $PLAYER~MSG&"*"
        gosub :SWITCHBOARD~SWITCHBOARD
        goto :WAIT_FOR_COMMAND
      end
    end
  else
    setVar $SWITCHBOARD~MESSAGE "Not currently at a class 0 or 9 port. Use the seek option to twarp to a known class 0 or 9 port and back.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :WAIT_FOR_COMMAND
  end
end
setVar $MESSAGE "No limpet on my ship.*"
setTextLineTrigger LIMPET   :MARKLIMPET   "After an intensive scanning search, they find and remove the Limpet"
setTextLineTrigger LIMPETNO :MARKLIMPETNO "The port official frowns at you (you haven't the funds!) and storms"
setTextLineTrigger FIGHTER  :BUYFIGHTERS  "B  Fighters        :"
pause
:MARKLIMPET
setVar $MESSAGE "Limpet scrubbed off of hull.*"
pause
:MARKLIMPETNO
setVar $MESSAGE "Limpet exists, but not enough cash to get scrubbed.*"
pause
:BUYFIGHTERS
killalltriggers
send "b 0* c 0* q q q * "
if ($BOT~PARM1 = "seek")
  gosub :PLAYER~QUIKSTATS
  setVar $PLAYER~WARPTO $BACK
  gosub :MOVE~TWARP
  if ($PLAYER~TWARPSUCCESS <> TRUE)
    setVar $SWITCHBOARD~MESSAGE $PLAYER~MSG&"*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :WAIT_FOR_COMMAND
  end
end
if ($STARTINGLOCATION = "Citadel")
  gosub :PLANET~LANDINGSUB
end
gosub :PLAYER~QUIKSTATS
if ($MESSAGE <> "")
  setVar $SWITCHBOARD~MESSAGE $MESSAGE
  gosub :SWITCHBOARD~SWITCHBOARD
end

:WAIT_FOR_COMMAND
halt


# includes:
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
