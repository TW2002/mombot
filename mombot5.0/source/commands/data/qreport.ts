
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
  setvar $switchboard~message "qreport [planet1] [planet2] ... [planet x]  - gives first 5 shots of sector quasar of all planets entered*"
  gosub :switchboard~switchboard
  halt
end
:CANNONCALCULATOR

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Command")
  setvar $switchboard~message "Cannon Calculator must be run from command prompt*"
  gosub :switchboard~switchboard
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
  setvar $switchboard~message "No planet numbers entered*"
  gosub :switchboard~switchboard
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
    setvar $switchboard~message "Planet number " $CANNONPLANET[$I] " entered not valid. *"
    gosub :switchboard~switchboard
    halt
    :GOODPLANET
    killtrigger WRONGPLANET
    killtrigger BADPLANET
    gosub :PLANET~GETPLANETINFO
    send "q "
    setvar $CANNONFUEL[$I] $PLANET~PLANET_FUEL
    setvar $CANNONPERCENT[$I] $PLANET~SECTOR_CANNON
  end



  add $I 1
end
setvar $COUNT 1
setvar $QUASAROUTPUT "'*"
setvar $QUASAROUTPUT $QUASAROUTPUT&"{"&$BOT_NAME&"}    Sector Quasar Report    {"&$BOT_NAME&"}*  (Planet "
setvar $I 1
while ($I <= $CANNONPLANETCOUNT)
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
while ($COUNT <= 5)
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
end
setvar $QUASAROUTPUT $QUASAROUTPUT&"{"&$BOT_NAME&"}    Sector Quasar Report    {"&$BOT_NAME&"}**"
send $QUASAROUTPUT
halt

# includes:
include "source\include\planet"
include "source\include\switchboard.ts"
