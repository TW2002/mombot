loadvar $USER_COMMAND_LINE
loadvar $BOT_NAME

gosub :QUIKSTATS
if (($CURRENT_PROMPT <> "Citadel") and ($CURRENT_PROMPT <> "Command"))
  send "'{" $BOT_NAME "} - Must start MEX From Citadel or Command Prompts!*"
  halt
end

setvar $STARTPROMPT $CURRENT_PROMPT

if ($STARTPROMPT = "Citadel")
  send "qdc"
  waiton "Planet #"
  getword CURRENTLINE $PLANET 2
  striptext $PLANET "#"
  isnumber $TST $PLANET
  if ($TST = 0)
    send "'{" $BOT_NAME "} - Unable To Obtain Planet Number*"
    halt
  end
  waiton "Citadel command"
  send "sz*"
  waiton "Warps to Sector(s) :"
  waiton "Citadel command"
else
  send "  **  "
  waiton "Warps to Sector(s) :"
  waiton "Command [TL="
end
setvar $NOJOY FALSE
getword $USER_COMMAND_LINE $PARM1 1
isnumber $TST $PARM1
if ($TST = 0)
  setvar $NOJOY TRUE
elseif ($PARM1 < 1)
  setvar $NOJOY TRUE
end
getword $USER_COMMAND_LINE $PARM2 2
isnumber $TST $PARM2
if ($TST = 0)
  setvar $NOJOY TRUE
elseif ($PARM2 < 1)
  setvar $NOJOY TRUE
end
getword $USER_COMMAND_LINE $PARM3 3
isnumber $TST $PARM3
if ($TST = 0)
  setvar $NOJOY TRUE
end

if ($NOJOY)
  send "'{" $BOT_NAME "} - Command Parameters Missing or Incorrect*"
  halt
end
if ($PARM2 = $PARM3)
  send "'{" $BOT_NAME "} - SAFE-Ship Number Cannot Be Same As Tow-Ship*"
  halt
end
setvar $IDX 1
while (SECTOR.WARPS[$CURRENT_SECTOR][$IDX] <> 0)
  if (SECTOR.WARPS[$CURRENT_SECTOR][$IDX] = $PARM1)
    goto :ADJ_FOUND
  end
  add $IDX 1
end
send "'{" $BOT_NAME "} - Not Adjacent To Target Sector*"
halt
:ADJ_FOUND

setvar $SAFE_GOOD FALSE
setvar $TOW_GOOD FALSE

if ($STARTPROMPT = "Citadel")
  send "cv*yn"&$PARM1&"*q  q  q  wn*l "&$PLANET&"*c "
else
  send "cv*yn"&$PARM1&"*q  wn*"
end

gosub :PAD
settextlinetrigger NADDA :NADDA "You do not own any other ships in this sector!"
settextlinetrigger SAFE :SAFE $PARM2&" "&$PAD&$CURRENT_SECTOR&" "
if ($PARM3 >= 1)
  gosub :PAD
  settextlinetrigger TOWN :TOWN $PARM3&" "&$PAD&$CURRENT_SECTOR&" "
end
settextlinetrigger DONE :DONE "Choose which ship to tow (Q=Quit)"
pause
:NADDA
killalltriggers
send "'{" $BOT_NAME "} - No empty ships in Current Sector*"
halt
:SAFE

setvar $SAFE_GOOD TRUE
pause
:TOWN
setvar $TOW_GOOD TRUE
pause
:DONE
killalltriggers

if ($STARTPROMPT = "Citadel")
  waiton "Citadel command"
else
  waiton "Command [TL="
end
if ($SAFE_GOOD = FALSE)
  send "'{" $BOT_NAME "} - SAFE ship doesn't appear to be in sector*"
  halt
end
if (($PARM3 >= 1) and ($TOW_GOOD = FALSE))
  send "'{" $BOT_NAME "} - Tow Ship doesn't appears to be in sector*"
  halt
end
gosub :STATUS


if ($STARTPROMPT = "Citadel")
  setvar $MAC "Q  Q   "
else
  setvar $MAC "  "
end

if ($PARM3 >= 1)
  setvar $MAC $MAC&"W N "&$PARM3&"*  "
end

setvar $MAC $MAC&"Mz "&$PARM1&"**             * R     *    "
if ($STARTPROMPT = "Citadel")
  setvar $MAC $MAC&"X    "&$PARM2&"*    *    *   L "&$PLANET&"* c @"
else
  setvar $MAC $MAC&"X    "&$PARM2&"*    *    *   @"
end
:RELOAD

settextlinetrigger GOGO :GOGO "just launched a Photon Torpedo!"
settextlinetrigger SCRIPT :SCRIPT "script?"
setdelaytrigger ABORT :ABORT 300000
pause
:ABORT
killalltriggers
send "'{" $BOT_NAME "} - 5mins Expired. Halting MEX!*"
halt
:SCRIPT
killalltriggers
gosub :STATUS
goto :RELOAD
:GOGO
killalltriggers
setvar $IDX 1
setarray $SCANARRAY 1000
setvar $TMP CURRENTANSILINE

getwordpos $TMP $POS "[0;32m just"
if ($POS = 0)
  goto :RELOAD
end
settextlinetrigger DAMAGE :COLLECT_DAMAGE "The console reports damages of "
settextlinetrigger DAMAGE_DONE :DAMAGE_DONE "Average Interval Lag:"
settextlinetrigger DAMAGE_POD :COLLECT_POD "You rush to an escape pod and abandon ship..."
send $MAC
pause
:COLLECT_DAMAGE
setvar $SCANARRAY[$IDX] CURRENTLINE
add $IDX 1
settextlinetrigger DAMAGE :COLLECT_DAMAGE "The console reports damages of "
pause
:COLLECT_POD
setvar $SCAN_ARRAY[$IDX] CURRENTLINE
add $IDX 1
:DAMAGE_DONE
killalltriggers
if ($IDX > 1)
  send "'*"
  waiton "Comm-link open on sub-space band"
  setvar $J 1
  while ($J < $IDX)
    send $SCANARRAY[$J]&"*"
    add $J 1
  end
  send "*"
  waiton "Sub-space comm-link terminated"
end
halt
:STATUS

send "'*"
waiton "Type sub-space message"
send "{" $BOT_NAME "} - MEX Attacking: "&$PARM1&", SAFE Ship: "&$PARM2
if ($PARM3 >= 1)
  send ", Towing Ship: "&$PARM3
end
send "**"
waiton "Sub-space comm-link terminated"
return
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
:PAD
setvar $PAD ""
getlength $CURRENT_SECTOR $LEN
if ($LEN = 1)
  setvar $PAD "    "
elseif ($LEN = 2)
  setvar $PAD "   "
elseif ($LEN = 3)
  setvar $PAD "  "
elseif ($LEN = 4)
  setvar $PAD " "
end
return
