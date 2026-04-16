gosub :QUIKSTATS
setvar $MAX 100
setarray $SHIPS $MAX
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
setvar $MY_SHIP $SHIP_NUMBER
setvar $MY_CRED $CREDITS

if ($CURRENT_PROMPT = "<StarDock>")
  setvar $IDX 0
  send "ss"
  waiton "-----------------------------------------------------"
  settextlinetrigger NOSHIP :NOSHIP "You do not own any other ships orbiting the Stardock!"
  settexttrigger DONE :DONE "Choose which ship to sell (Q=Quit)"
  settextlinetrigger LINE :LINE
  pause
  :NOSHIP
  killalltriggers
  send "'{" $BOT_NAME "} - No Empty Ships Found. Nothing To Scrub!*"
  halt
  :LINE
  setvar $TEMP CURRENTLINE
  getword $TEMP $I 1
  isnumber $TST $I
  if ($TST)
    if ($I <> 0)
      if ($IDX <= $MAX)
        add $IDX 1
        cuttext $TEMP $TEMP 56 23
        setvar $SHIPS[$IDX] $I&" "&$TEMP
      end
    end
  end
  settextlinetrigger LINE :LINE
  pause
  :DONE
  killalltriggers
  send "qq"
  waiton "You leave the shipyards."
else
  send "'{"&$BOT_NAME&"} - Must Start From StarDock Prompt!*"
  halt
end
if ($IDX <> 0)
  setvar $REQ (($IDX * 2) + 2)
  if (($UNLIMITEDGAME = 0) and ($TURNS < $REQ))
    send "'{"&$BOT_NAME&"} - Not Enough Turns to Scrub ("&$REQ&" Turns Required)*"
    halt
  end
  setvar $STR ""
  setvar $SCRUBBED 0
  setvar $FAILURE 0
  setvar $I 1
  while ($I <= $IDX)
    setvar $TOPOOR FALSE
    getword $SHIPS[$I] $SHIP 1
    send "Q  X    "&$SHIP&"*   * P S G YG Q "
    settextlinetrigger LIMP_NOT :LIMP_NOT "The port official frowns at you"
    settextlinetrigger LIMP_YEP :LIMP_YEP "After an intensive scanning search"
    settextlinetrigger LIMP_DON :LIMP_DON "You leave the Galactic Bank."
    pause
    :LIMP_NOT
    setvar $TOPOOR TRUE
    add $FAILURE 1
    pause
    :LIMP_YEP
    setvar $TOPOOR FALSE
    add $SCRUBBED 1
    pause
    :LIMP_DON
    killalltriggers
    if ($TOPOOR)
      setvar $TEMP $SHIPS[$I]
      striptext $TEMP $SHIP&" "
      setvar $STR $STR&"                        "&$SHIP&" "&$TEMP&"*"
    end
    add $I 1
  end
  send "Q  X    "&$MY_SHIP&"*    * P S G YG Q"
  waiton "You leave the Galactic Bank."
  gosub :QUIKSTATS
  send "'*"
  waiton "Type sub-space message"
  send "{"&$BOT_NAME&"} - Scrub-A-Dub-Dub*"
  send "          Ships Found : "&$IDX&"*"
  send "             Scrubbed : "&$SCRUBBED&"*"
  if ($SCRUBBED <> 0)
    setvar $CASHAMOUNT ($MY_CRED - $CREDITS)
    gosub :COMMASIZE
    send "                Spent : $"&$CASHAMOUNT&"*"
  end
  send "               Failed : "&$FAILURE&"*"
  if ($FAILURE <> 0)
    send $STR
  end
  send "*"
  waiton "Sub-space comm-link terminated"
end

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
:COMMASIZE

if ($CASHAMOUNT < 1000)

elseif ($CASHAMOUNT < 1000000)
  getlength $CASHAMOUNT $LEN
  setvar $LEN ($LEN - 3)
  cuttext $CASHAMOUNT $TMP 1 $LEN
  cuttext $CASHAMOUNT $TMP1 ($LEN + 1) 999
  setvar $TMP $TMP&","&$TMP1
  setvar $CASHAMOUNT $TMP
elseif ($CASHAMOUNT <= 999999999)
  getlength $CASHAMOUNT $LEN
  setvar $LEN ($LEN - 6)
  cuttext $CASHAMOUNT $TMP 1 $LEN
  setvar $TMP $TMP&","
  cuttext $CASHAMOUNT $TMP1 ($LEN + 1) 3
  setvar $TMP $TMP&$TMP1&","
  cuttext $CASHAMOUNT $TMP1 ($LEN + 4) 999
  setvar $TMP $TMP&$TMP1
  setvar $CASHAMOUNT $TMP
end
return
