loadvar $BOT_NAME

gosub :QUIKSTATS

if ($CURRENT_PROMPT <> "Command")
  send "'{" $BOT_NAME "} Start From Command Prompt!*"
  halt
end
if ($GENESIS < 10)
  send "'{" $BOT_NAME "} Not Enough Gen Torps!*"
  halt
end
if ($ATOMIC < 10)
  send "'{" $BOT_NAME "} Not Enough Atomic Dets!*"
  halt
end
if ($CURRENT_SECTOR = 1)
  send "'{" $BOT_NAME "} The intense traffic in sector 1 prohibits planetary construction.*"
  halt
end

if ($CURRENT_SECTOR <> STARDOCK)
  setvar $BUFFER ($SHIELDS + $FIGHTERS)
  if ($BUFFER < 5500)
    send "'{" $BOT_NAME "} Not Enough Shields/Fighters***"
    halt
  end
end

setvar $START_FIGS $FIGHTERS
setvar $START_SHIELDS $SHIELDS
setvar $I 1

getrnd $ID 1000 9999

setvar $ID "["&$ID&"] Planet Creation"

loadvar $HAZ_PMAX
isnumber $TST $HAZ_PMAX
if ($TST = 0)
  setvar $HAZ_PMAX 0
end

if ($HAZ_PMAX < 1)
  send "  **  V"
  waiton "Warps to Sector(s) :"
  waiton "The Maximum number of Planets per sector:"
  gettext CURRENTLINE $PMAX "sector:" ","
  striptext $PMAX " "
  setvar $HAZ_PMAX $PMAX
  savevar $HAZ_PMAX
else
  send "  **  "
  waiton "Warps to Sector(s) :"
  setvar $PMAX $HAZ_PMAX
end

setvar $PNUM SECTOR.PLANETCOUNT[$CURRENT_SECTOR]
setvar $STR ""

setvar $I 1
while ($I <= 10)
  if ($PNUM < $PMAX)
    setvar $STR $STR&" U  Y "&$ID&"*  J  C  * "
    add $PNUM 1
  else
    setvar $STR $STR&" U  Y  N "&$ID&"*  J  C  * "
  end
  add $I 1
end

send $STR&"  /"

waitfor #179&"Turns"

setarray $REGISTRY 10
setvar $I 1
send " L"
waitfor "--------------------------------------------------"
settexttrigger DONEDRAWING :DONEDRAWING "Land on which planet <Q to abort>"
:LOOP
waiton "> "&$ID
gettext CURRENTLINE $STR "<" ">"
striptext $STR " "
setvar $REGISTRY[$I] $STR
add $I 1
goto :LOOP
:DONEDRAWING
killalltriggers
setvar $STR ""
send "*   "
setvar $I 1
while ($I <= 10)
  setvar $STR $STR&"  L  Z"&#8&#8&#8&$REGISTRY[$I]&"*   z  d  y  *   "
  add $I 1
end

send $STR&"  **  "

gosub :QUIKSTATS

send "'{" $BOT_NAME "} "&SECTOR.NAVHAZ[$CURRENT_SECTOR]&"% Haz Created (Lost "&($START_FIGS - $FIGHTERS)&" Figs, "&($START_SHIELDS - $SHIELDS)&" Shields)*"
halt
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
