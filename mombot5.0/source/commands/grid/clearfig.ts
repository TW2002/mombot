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
  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end
:ADJFIG



gosub :QUIKSTATS~QUIKSTATS
setvar $STARTINGLOCATION $QUIKSTATS~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  send "'{" $BOT_NAME "} - Must start at Citadel or Command Prompt.*"
  halt
end
setvar $PGRIDSECTOR $PARM1
isnumber $TEST $PGRIDSECTOR
if ($TEST = 0)
  send "'{" $BOT_NAME "} - Invalid FIGCLEAR number.*"
  halt
end

if ($PGRIDSECTOR = 0)
  send "'{" $BOT_NAME "} - Invalid FIGCLEAR number.*"
  halt
end
if ($PGRIDSECTOR < 11)
  send "'{" $BOT_NAME "} - Cannot FIGCLEAR into FedSpace!*"
  halt
elseif ($PGRIDSECTOR = $STARDOCK)
  send "'{" $BOT_NAME "} - Cannot FIGCLEAR into STARDOCK!*"
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANETINFO~GETPLANETINFO
  send "m * * * c "
end
if ($SHIPSTATS~SHIP_MAX_ATTACK <= 0)
  gosub :SHIPSTATS~GETSHIPSTATS
end

getwordpos $USER_COMMAND_LINE $POS "def"
if ($POS > 0)
  setvar $DEFEND TRUE
else
  setvar $DEFEND FALSE
end

setvar $I 1
setvar $ISFOUND FALSE
while (SECTOR.WARPS[$QUIKSTATS~CURRENT_SECTOR][$I] > 0)
  if (SECTOR.WARPS[$QUIKSTATS~CURRENT_SECTOR][$I] = $PGRIDSECTOR)
    setvar $ISFOUND TRUE
  end
  add $I 1
end
if ($ISFOUND = FALSE)
  send "'{" $BOT_NAME "} - Cannot FIGCLEAR.  Sector not Adjacent, aborting..*"
  halt
end
send "'{" $BOT_NAME "} - Fig Clearing sector "&$PGRIDSECTOR&"* c v* y* "&$PGRIDSECTOR&"* q "
setvar $MAC "     * "
setvar $I 1
if ($DEFEND = FALSE)
  while ($QUIKSTATS~FIGHTERS >= $SHIPSTATS~SHIP_MAX_ATTACK)
    setvar $MAC $MAC&"a z "&($SHIPSTATS~SHIP_MAX_ATTACK - 1)&"* * "
    add $I 1
    subtract $QUIKSTATS~FIGHTERS ($SHIPSTATS~SHIP_MAX_ATTACK - 1)
  end
end
setvar $MAC $MAC&"j r * f  z  1  * z  c  d  * "
:ATTACKADJSECTOR

gosub :QUIKSTATS~QUIKSTATS
if ($QUIKSTATS~FIGHTERS < $SHIPSTATS~SHIP_FIGHTERS_MAX)
  send "'{" $BOT_NAME "} - Unable to proceed, not enough fighters.*"
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "Q Q * "
end
send "m " $PGRIDSECTOR&$MAC
gosub :QUIKSTATS~QUIKSTATS

if ($QUIKSTATS~CURRENT_SECTOR = $PGRIDSECTOR)
  send "'"&$PGRIDSECTOR&"=saveme*"
  if ($STARTINGLOCATION = "Citadel")
    setvar $I 0
    while ($I < 15)
      add $I 1
      send "l j"&#8&$PLANETINFO~PLANET&"*  *  "
    end
  end
  send "'{" $BOT_NAME "} - Successfully Fig Cleared sector "&$PGRIDSECTOR&"*"
else
  if ($STARTINGLOCATION = "Citadel")
    send "l j"&#8&$PLANETINFO~PLANET&"*  *  "
    gosub :CURRENT_PROMPT
    if ($CURRENT_PROMPT = "Planet")
      send "m* * *"
    else
      send "'{" $BOT_NAME "} - Had to stop, planet appears to be gone.*"
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
include "source\include\quikstats"
include "source\include\validation"
include "source\include\planetinfo"
include "source\include\pwarp"
include "source\include\shipstats"
