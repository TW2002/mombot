
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
loadvar $MBBS

if ($PARM1 = "help")
  send "'{" $BOT_NAME "} - qreport [planet1] [planet2] ... [planet x]  - gives first 5 shots of sector quasar of all planets entered*"
  halt
end
:CANNONCALCULATOR

gosub :QUIKSTATS~QUIKSTATS
setvar $STARTINGLOCATION $QUIKSTATS~CURRENT_PROMPT
echo "STARTING LOCATION: "&$STARTINGLOCATION&"8392*"
if ($STARTINGLOCATION <> "Command")
  send "'{" $BOT_NAME "} - Cannon Calculator must be run from command prompt*"
  halt
end
setarray $CANNONPLANET 100
setarray $CANNONFUEL 100
setarray $CANNONPERCENT 100
setvar $CANNONPLANETCOUNT 0
getword $USER_COMMAND_LINE $TEMP 1
while ($TEMP <> 0)
  add $CANNONPLANETCOUNT 1
  setvar $CANNONPLANET[$CANNONPLANETCOUNT] $TEMP
  getword $USER_COMMAND_LINE $TEMP ($CANNONPLANETCOUNT + 1)
end
if ($CANNONPLANETCOUNT <= 0)
  send "'{" $BOT_NAME "} - No planet numbers entered*"
  halt
end
setvar $PLANETMEMORY " "
setvar $I 1
while ($I <= $CANNONPLANETCOUNT)
  getwordpos $PLANETMEMORY $POS " "&$CANNONPLANET[$I]&" "
  if ($POS > 0)

  else
    setvar $PLANETMEMORY $PLANETMEMORY&" "&$CANNONPLANET[$I]&" "
    send "l "&$CANNONPLANET[$I]&"** "
    settextlinetrigger WRONGPLANET :BADPLANET "That planet is not in this sector."
    settextlinetrigger BADPLANET :BADPLANET "Invalid registry number, landing aborted."
    settextlinetrigger GOODPLANET :GOODPLANET "Claimed by:"
    pause
    :BADPLANET
    send "'{" $BOT_NAME "} - Planet number " $CANNONPLANET[$I] " entered not valid. *"
    halt
    :GOODPLANET
    killtrigger WRONGPLANET
    killtrigger BADPLANET
    gosub :PLANETINFO~GETPLANETINFO
    send "q "
    setvar $CANNONFUEL[$I] $PLANETINFO~PLANET_FUEL
    setvar $CANNONPERCENT[$I] $PLANETINFO~SECTOR_CANNON
  end



  add $I 1
end
setvar $COUNT 1
setvar $QUASAROUTPUT "'*"
setvar $QUASAROUTPUT $QUASAROUTPUT&"{"&$BOT_NAME&"}    Sector Quasar Report    {"&$BOT_NAME&"}*  (Planet "
setvar $I 1
if ($I <= $CANNONPLANETCOUNT)
  if (($I = $CANNONPLANETCOUNT) and ($I > 1))
    setvar $QUASAROUTPUT $QUASAROUTPUT&" and "&$CANNONPLANET[$I]&")*"
  elseif ($I = $CANNONPLANETCOUNT)
    setvar $QUASAROUTPUT $QUASAROUTPUT&$CANNONPLANET[$I]&")*"
  elseif ($I = 1)
    setvar $QUASAROUTPUT $QUASAROUTPUT&$CANNONPLANET[$I]
  else
    setvar $QUASAROUTPUT $QUASAROUTPUT&", "&$CANNONPLANET[$I]
  end
  add $I 1
end
if ($COUNT <= 5)
  setvar $CANNONDAMAGE 0
  setvar $I 1
  while ($I <= $CANNONPLANETCOUNT)
    if ($MBBS)
      add $CANNONDAMAGE ((($CANNONFUEL[$I] * $CANNONPERCENT[$I]) / 100) / 2)
    else
      add $CANNONDAMAGE ((($CANNONFUEL[$I] * $CANNONPERCENT[$I]) / 100) / 3)
    end
    subtract $CANNONFUEL[$I] (($CANNONFUEL[$I] * $CANNONPERCENT[$I]) / 100)
    if ($CANNONFUEL[$I] < 0)
      setvar $CANNONFUEL[$I] 0
    end
    add $I 1
  end

  setvar $FORMATTEDCANNONDAMAGE ""
  getlength $CANNONDAMAGE $LENGTH
  while ($LENGTH > 3)
    cuttext $CANNONDAMAGE $SNIPPET ($LENGTH - 2) 9999
    cuttext $CANNONDAMAGE $CANNONDAMAGE 1 ($LENGTH - 3)
    getlength $CANNONDAMAGE $LENGTH
    setvar $FORMATTEDCANNONDAMAGE ","&$SNIPPET&$FORMATTEDCANNONDAMAGE
  end
  setvar $FORMATTEDCANNONDAMAGE $CANNONDAMAGE&$FORMATTEDCANNONDAMAGE
  setvar $QUASAROUTPUT $QUASAROUTPUT&"  Shot "&$COUNT&": "&$FORMATTEDCANNONDAMAGE&" points of damage.*"
  add $COUNT 1
else
  setvar $QUASAROUTPUT $QUASAROUTPUT&"{"&$BOT_NAME&"}    Sector Quasar Report    {"&$BOT_NAME&"}**"
  send $QUASAROUTPUT
  halt
end

# includes:
include "source\include\QUIKSTATS"
include "source\include\VALIDATION"
include "source\include\PLANETINFO"
