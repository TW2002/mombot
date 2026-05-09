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

loadvar $UNLIMITEDGAME
loadvar $PTRADESETTING
loadvar $BOT_TURN_LIMIT
loadvar $COMMAND

fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- "&$COMMAND&" [sector] {defend}                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "     clears adjacent fighters and calls saveme              "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "     - [defend] for offensive fighters,just enters/retreats "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "     - From Citadel prompt grabs fighters from planet       "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "     - From Command prompt grabs fighters from the sector   "
  setvar $switchboard~message "Writing help file for this command in Help directory.*"
  gosub :switchboard~switchboard
end
:ADJFIG



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  setvar $switchboard~message "Must start at Citadel or Command Prompt.*"
  gosub :switchboard~switchboard
  halt
end
setvar $PGRIDSECTOR $PARM1
isnumber $TEST $PGRIDSECTOR
if ($TEST = 0)
  setvar $switchboard~message "Invalid FIGCLEAR number.*"
  gosub :switchboard~switchboard
  halt
end

if ($PGRIDSECTOR = 0)
  setvar $switchboard~message "Invalid FIGCLEAR number.*"
  gosub :switchboard~switchboard
  halt
end
if ($PGRIDSECTOR < 11)
  setvar $switchboard~message "Cannot FIGCLEAR into FedSpace!*"
  gosub :switchboard~switchboard
  halt
elseif ($PGRIDSECTOR = $STARDOCK)
  setvar $switchboard~message "Cannot FIGCLEAR into STARDOCK!*"
  gosub :switchboard~switchboard
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "m * * * c "
end
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

getwordpos $USER_COMMAND_LINE $POS "def"
if ($POS > 0)
  setvar $DEFEND TRUE
else
  setvar $DEFEND FALSE
end

setvar $I 1
setvar $ISFOUND FALSE
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] > 0)
  if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] = $PGRIDSECTOR)
    setvar $ISFOUND TRUE
  end
  add $I 1
end
if ($ISFOUND = FALSE)
  setvar $switchboard~message "Cannot FIGCLEAR.  Sector not Adjacent, aborting..*"
  gosub :switchboard~switchboard
  halt
end
send "'{" $BOT_NAME "} - Fig Clearing sector "&$PGRIDSECTOR&"* c v* y* "&$PGRIDSECTOR&"* q "
setvar $MAC "     * "
setvar $I 1
if ($DEFEND = FALSE)
  setvar $FIGHTERS_AVAILABLE $PLAYER~FIGHTERS
  while ($FIGHTERS_AVAILABLE >= $SHIP~SHIP_MAX_ATTACK)
    setvar $MAC $MAC&"a z "&($SHIP~SHIP_MAX_ATTACK - 1)&"* * "
    add $I 1
    subtract $FIGHTERS_AVAILABLE ($SHIP~SHIP_MAX_ATTACK - 1)
  end
end
setvar $MAC $MAC&"j r * f  z  1  * z  c  d  * "
:ATTACKADJSECTOR

gosub :PLAYER~QUIKSTATS
if ($PLAYER~FIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
  setvar $switchboard~message "Unable to proceed, not enough fighters.*"
  gosub :switchboard~switchboard
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "Q Q * "
end
send "m " $PGRIDSECTOR&$MAC
gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_SECTOR = $PGRIDSECTOR)
  send "'"&$PGRIDSECTOR&"=saveme*"
  if ($STARTINGLOCATION = "Citadel")
    setvar $I 0
    while ($I < 15)
      add $I 1
      send "l j"&#8&$PLANET~PLANET&"*  *  "
    end
  end
  setvar $switchboard~message "Successfully Fig Cleared sector "&$PGRIDSECTOR&"*"
  gosub :switchboard~switchboard
else
  if ($STARTINGLOCATION = "Citadel")
    send "l j"&#8&$PLANET~PLANET&"*  *  "
    gosub :CURRENT_PROMPT
    if ($CURRENT_PROMPT = "Planet")
      send "m* * *"
    else
      setvar $switchboard~message "Had to stop, planet appears to be gone.*"
      gosub :switchboard~switchboard
      halt
    end
  else
    send " F"
    waiton "Your ship can support up to"
    getword CURRENTLINE $FTRS_TO_LEAVE 10
    striptext $FTRS_TO_LEAVE ","
    striptext $FTRS_TO_LEAVE " "
    if ($FTRS_TO_LEAVE < 1)
      setvar $FTRS_TO_LEAVE 1
    end
    send " "&$FTRS_TO_LEAVE&" * C D "
  end
  goto :ATTACKADJSECTOR
end
halt
:CURRENT_PROMPT


settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
send #145
pause
:ALLPROMPTSCATCH

getword CURRENTLINE $CURRENT_PROMPT 1
if ($CURRENT_PROMPT = 0)
  getword CURRENTANSILINE $CURRENT_PROMPT 1
end
striptext $CURRENT_PROMPT #145
striptext $CURRENT_PROMPT #8
return

# includes:
include "source\include\planet"
include "source\include\ship"
include "source\include\switchboard.ts"
