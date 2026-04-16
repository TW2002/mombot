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
