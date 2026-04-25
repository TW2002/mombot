loadvar $BOT_NAME

gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT <> "Command")
  send "'{" $BOT_NAME "} Start From Command Prompt!*"
  halt
end
if ($PLAYER~GENESIS < 10)
  send "'{" $BOT_NAME "} Not Enough Gen Torps!*"
  halt
end
if ($PLAYER~ATOMIC < 10)
  send "'{" $BOT_NAME "} Not Enough Atomic Dets!*"
  halt
end
if ($PLAYER~CURRENT_SECTOR = 1)
  send "'{" $BOT_NAME "} The intense traffic in sector 1 prohibits planetary construction.*"
  halt
end

if ($PLAYER~CURRENT_SECTOR <> STARDOCK)
  setvar $BUFFER ($PLAYER~SHIELDS + $PLAYER~FIGHTERS)
  if ($BUFFER < 5500)
    send "'{" $BOT_NAME "} Not Enough Shields/Fighters***"
    halt
  end
end

setvar $START_FIGS $PLAYER~FIGHTERS
setvar $START_SHIELDS $PLAYER~SHIELDS
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

setvar $PNUM SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
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

gosub :PLAYER~QUIKSTATS

send "'{" $BOT_NAME "} "&SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]&"% Haz Created (Lost "&($START_FIGS - $PLAYER~FIGHTERS)&" Figs, "&($START_SHIELDS - $PLAYER~SHIELDS)&" Shields)*"
halt
include "source\include\player"
