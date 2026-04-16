:LOAD_VARIABLES
loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $BOT_TURN_LIMIT
loadvar $PARM1
loadvar $PARM2
setvar $NAME[1] ".  n"
setvar $NAME[2] ".  n"
setvar $NAME[3] ".  n"
setvar $NAME[4] ".  n"
setvar $NAME[5] ".  n"
setvar $COUNT 0
setvar $BLOW_PLANET "No"
if (($PARM1 = "?") or ($PARM1 = "help"))
  send "'{" $BOT_NAME "} - bust [Experience Desired]*"
  halt
end
isnumber $TEST $PARM1
if ($TEST)

else
  send "'{" $BOT_NAME "} - Experience Must Be a Number.*"
  halt
end
:START
gosub :QUIKSTATS
setvar $START_PROMPT $CURRENT_PROMPT
if ($CREDITS < 1000000)
  send "'{" $BOT_NAME "} - Not Enough Cash on Hand*"
  halt
end
isnumber $TEST $PARM1
if ($TEST)
  setvar $EXPERIENCEAMOUNT $PARM1
else
  send "'{" $BOT_NAME "} - Invalid Experience Amount.*"
  halt
end
if ($EXPERIENCE > $EXPERIENCEAMOUNT)
  send "'{" $BOT_NAME "} - Desired Experience Reached.*"
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end

if (($CURRENT_PROMPT <> "Command") and ($CURRENT_PROMPT <> "<StarDock>"))
  send "'{" $BOT_NAME "} - Script must be run from Command or StarDock.*"
  halt
end
if ($CORP > 1)
  setvar $CORP "Yes"
else
  setvar $CORP "No"
end
setvar $SCANNER $PLANET_SCANNER
:RUN

killalltriggers
if ($EXPERIENCE > $EXPERIENCEAMOUNT)
  send "'{" $BOT_NAME "} - Desired Experience Reached.*"
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end
if ($CURRENT_PROMPT = "<StarDock>")
  send "q  "
end
add $COUNT 1
if ($BLOW_PLANET = "Yes")
  send "l " $PLANET "*  z  d  y  "
  setvar $BLOW_PLANET "No"
end
if ($COUNT > 5)
  setvar $COUNT 1
  goto :RUN
end
gosub :QUIKSTATS
if (($CREDITS < 1000000) and ($ATOMIC < 1)) or (($CREDITS < 1000000) and ($GENESIS < 1))
  if ($START_PROMPT = "<StarDock>")
    send "p  s"
  end
  halt
end
killalltriggers
send "u y  "
settexttrigger GENESIS :BUY_MORE "You don't have any Genesis Torpedoes"
settexttrigger CREATE :CREATE_PLANET "For building this planet you receive"
pause
:CREATE_PLANET

killtrigger GENESIS
send $NAME[$COUNT] "*  c  l"
if ($SCANNER = "Yes")
  settexttrigger 3 :LAND "None"
  pause
  :LAND
  gettext CURRENTLINE $PLANET "<" ">"
  send $PLANET "*  "
end
send " z  d  y  "
settexttrigger ATOMIC :BUY_ATOMIC "You do not have any Atomic Detonators"
settexttrigger BLOWN :SUB_RUN "For blowing up this planet you"
pause
:SUB_RUN
setvar $BLOW_PLANET "No"
goto :RUN
:BUY_ATOMIC
setvar $BLOW_PLANET "Yes"
send "qq"
:BUY_MORE

killtrigger CREATE
send "* * p s h a"
waitfor "How many Atomic Detonators do you want"
gettext CURRENTLINE $ATOMIC "(Max " ")"
send $ATOMIC "* t"
waitfor "How many Genesis Torpedoes do you want"
gettext CURRENTLINE $GENESIS "(Max " ")"
send $GENESIS "* q q "
goto :RUN
goto :QUIKSTATS_PLAYER_INCLUDE
include "source\include\player"
:QUIKSTATS_PLAYER_INCLUDE
:QUIKSTATS
gosub :PLAYER~QUIKSTATS
setvar $CURRENT_PROMPT $PLAYER~CURRENT_PROMPT
setvar $CURRENT_SECTOR $PLAYER~CURRENT_SECTOR
setvar $TURNS $PLAYER~TURNS
setvar $CREDITS $PLAYER~CREDITS
setvar $FIGHTERS $PLAYER~FIGHTERS
setvar $SHIELDS $PLAYER~SHIELDS
setvar $TOTAL_HOLDS $PLAYER~TOTAL_HOLDS
setvar $ORE_HOLDS $PLAYER~ORE_HOLDS
setvar $ORGANIC_HOLDS $PLAYER~ORGANIC_HOLDS
setvar $EQUIPMENT_HOLDS $PLAYER~EQUIPMENT_HOLDS
setvar $COLONIST_HOLDS $PLAYER~COLONIST_HOLDS
setvar $PHOTONS $PLAYER~PHOTONS
setvar $ARMIDS $PLAYER~ARMIDS
setvar $LIMPETS $PLAYER~LIMPETS
setvar $GENESIS $PLAYER~GENESIS
setvar $TWARP_TYPE $PLAYER~TWARP_TYPE
setvar $CLOAKS $PLAYER~CLOAKS
setvar $BEACONS $PLAYER~BEACONS
setvar $ATOMIC $PLAYER~ATOMIC
setvar $CORBO $PLAYER~CORBO
setvar $EPROBES $PLAYER~EPROBES
setvar $MINE_DISRUPTORS $PLAYER~MINE_DISRUPTORS
setvar $PSYCHIC_PROBE $PLAYER~PSYCHIC_PROBE
setvar $PLANET_SCANNER $PLAYER~PLANET_SCANNER
setvar $SCAN_TYPE $PLAYER~SCAN_TYPE
setvar $ALIGNMENT $PLAYER~ALIGNMENT
setvar $EXPERIENCE $PLAYER~EXPERIENCE
setvar $CORP $PLAYER~CORP
setvar $CORPNUMBER $PLAYER~CORPNUMBER
setvar $SHIP_NUMBER $PLAYER~SHIP_NUMBER
setvar $SHIP_TYPE $PLAYER~SHIP_TYPE
setvar $FULL_CURRENT_PROMPT $PLAYER~FULL_CURRENT_PROMPT
setvar $FEDSPACE $PLAYER~FEDSPACE
setvar $SELF_DESTRUCT_PROMPT $PLAYER~SELF_DESTRUCT_PROMPT
return
