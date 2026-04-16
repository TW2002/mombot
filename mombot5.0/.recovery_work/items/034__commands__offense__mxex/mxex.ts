loadvar $USER_COMMAND_LINE
loadvar $BOT_NAME

gosub :QUIKSTATS
if (($CURRENT_PROMPT <> "Citadel") and ($CURRENT_PROMPT <> "Command"))
  send "'{" $BOT_NAME "} - Must start MXEX From Citadel or Command Prompts!*"
  halt
end

setvar $STARTPROMPT $CURRENT_PROMPT
setvar $START_SHIP $SHIP_NUMBER

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
  send "'{" $BOT_NAME "} - Moth-Ship Number Cannot Be Same As Tow-Ship*"
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

setvar $MOTH_GOOD FALSE
setvar $TOW_GOOD FALSE

if ($STARTPROMPT = "Citadel")
  send "cv*yn"&$PARM1&"*q  q  q  wn*l "&$PLANET&"*c "
else
  send "cv*yn"&$PARM1&"*q  wn*"
end

gosub :PAD
settextlinetrigger NADDA :NADDA "You do not own any other ships in this sector!"
settextlinetrigger MOTH :MOTH $PARM2&" "&$PAD&$CURRENT_SECTOR&" "
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
:MOTH

setvar $MOTH_GOOD TRUE
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
if ($MOTH_GOOD = FALSE)
  send "'{" $BOT_NAME "} - Moth ship doesn't appear to be in sector*"
  halt
end
if (($PARM3 >= 1) and ($TOW_GOOD = FALSE))
  send "'{" $BOT_NAME "} - Tow Ship doesn't appears to be in sector*"
  halt
end
gosub :STATUS



if ($STARTPROMPT = "Citadel")
  setvar $MAC "Q  Q  X   "&$PARM2&"*    *    "
else
  setvar $MAC "X   "&$PARM2&"*    *    "
end

if ($PARM3 >= 1)
  setvar $MAC $MAC&"W N "&$PARM3&"*  "
end

setvar $MAC $MAC&"Mz "&$PARM1&"**             * R     *    "
if ($STARTPROMPT = "Citadel")
  setvar $MAC $MAC&"X    "&$START_SHIP&"*    *    *   L "&$PLANET&"* c @"
else
  setvar $MAC $MAC&"X    "&$START_SHIP&"*    *    *   @"
end
:RELOAD

settextlinetrigger GOGO :GOGO "just launched a Photon Torpedo!"
settextlinetrigger SCRIPT :SCRIPT "script?"
setdelaytrigger ABORT :ABORT 300000
pause
:ABORT
killalltriggers
send "'{" $BOT_NAME "} - 5mins Expired. Halting MXEX!*"
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
send "{" $BOT_NAME "} - MXEX Attacking: "&$PARM1&", Moth Ship: "&$PARM2
if ($PARM3 >= 1)
  send ", Towing Ship: "&$PARM3
end
send "**"
waiton "Sub-space comm-link terminated"
return
:QUIKSTATS


setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settexttrigger PROMPT1 :ALLPROMPTS "(?="
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
settextlinetrigger STATLINETRIG :STATSTART #179
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
send "^Q/"
pause
:ALLPROMPTS

getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT1 :ALLPROMPTS "(?="
pause
:SECONDARYPROMPTS
getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
pause
:TERRAPROMPTS
killtrigger PROMPT3
killtrigger PROMPT4
getword CURRENTANSILINE $CHECKPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT "Terra"
end
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
pause
:STATSTART
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger NOPROMPT
setvar $STATS ""
setvar $WORDY ""
:STATSLINE
killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $LINE2 CURRENTLINE
replacetext $LINE2 #179 " "
striptext $LINE2 ","
setvar $STATS $STATS&$LINE2
getwordpos $LINE2 $POS "Ship"
if ($POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:GOTSTATS

setvar $STATS $STATS&" @@@"

setvar $CURRENT_WORD 0
if ($WORDY <> "@@@")
  if ($WORDY = "Sect")
    getword $STATS $CURRENT_SECTOR ($CURRENT_WORD + 1)
  elseif ($WORDY = "Turns")
    getword $STATS $TURNS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Creds")
    getword $STATS $CREDITS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Figs")
    getword $STATS $FIGHTERS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Shlds")
    getword $STATS $SHIELDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Hlds")
    getword $STATS $TOTAL_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ore")
    getword $STATS $ORE_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Org")
    getword $STATS $ORGANIC_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Equ")
    getword $STATS $EQUIPMENT_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Col")
    getword $STATS $COLONIST_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Phot")
    getword $STATS $PHOTONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Armd")
    getword $STATS $ARMIDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Lmpt")
    getword $STATS $LIMPETS ($CURRENT_WORD + 1)
  elseif ($WORDY = "GTorp")
    getword $STATS $GENESIS ($CURRENT_WORD + 1)
  elseif ($WORDY = "TWarp")
    getword $STATS $TWARP_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Clks")
    getword $STATS $CLOAKS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Beacns")
    getword $STATS $BEACONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "AtmDt")
    getword $STATS $ATOMIC ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corbo")
    getword $STATS $CORBO ($CURRENT_WORD + 1)
  elseif ($WORDY = "EPrb")
    getword $STATS $EPROBES ($CURRENT_WORD + 1)
  elseif ($WORDY = "MDis")
    getword $STATS $MINE_DISRUPTORS ($CURRENT_WORD + 1)
  elseif ($WORDY = "PsPrb")
    getword $STATS $PSYCHIC_PROBE ($CURRENT_WORD + 1)
  elseif ($WORDY = "PlScn")
    getword $STATS $PLANET_SCANNER ($CURRENT_WORD + 1)
  elseif ($WORDY = "LRS")
    getword $STATS $SCAN_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Aln")
    getword $STATS $ALIGNMENT ($CURRENT_WORD + 1)
  elseif ($WORDY = "Exp")
    getword $STATS $EXPERIENCE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corp")
    getword $STATS $CORP ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ship")
    getword $STATS $SHIP_NUMBER ($CURRENT_WORD + 1)
  end
  add $CURRENT_WORD 1
  getword $STATS $WORDY $CURRENT_WORD
end
:DONEQUIKSTATS
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
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
