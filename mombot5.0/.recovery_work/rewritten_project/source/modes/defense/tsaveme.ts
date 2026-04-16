loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $BOT_NAME
:START


gosub :QUIKSTATS
setvar $LOCATION $CURRENT_PROMPT
if (($LOCATION <> "Command") and ($LOCATION <> "Citadel"))
  send "'{" $BOT_NAME "} - T-warp Saveme must be run from the Command or Citadel Prompt*"
  halt
end
:TYPE
if ($LOCATION = "Command")
  setvar $TYPE "TWarp"
  setvar $SECTOR $CURRENT_SECTOR
elseif ($LOCATION = "Citadel")
  setvar $TYPE "BWarp"
  send "qd"
  waitfor "Planet #"
  getword CURRENTLINE $PLANET 2
  striptext $PLANET "#"
  send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
  setvar $SECTOR $CURRENT_SECTOR
end


setvar $TSAVEME_SCRUB $PARM1


isnumber $NUMBER $TSAVEME_SCRUB
if (($NUMBER < 1) or ($TSAVEME_SCRUB = "") or ($TSAVEME_SCRUB = 0))
  setvar $SCRUB $SECTOR
else
  setvar $SCRUB $TSAVEME_SCRUB
end

send "'{" $BOT_NAME "} - " $TYPE " Saveme Active - Awaiting Distress Call. Returns to: "&$SCRUB&"*"
:MAIN

settextlinetrigger TRIGGER :TRIGGER "=saveme"
pause
:TRIGGER

cuttext CURRENTLINE $SPOOF 1 1
if ($SPOOF <> "R")
  goto :MAIN
end
gettext CURRENTLINE $LINE "R" "=saveme"
cuttext $LINE $CORPY 2 6
striptext $LINE $CORPY
striptext $LINE "R"
striptext $LINE "=saveme"
striptext $LINE " "
setvar $SAVESEC $LINE
setvar $POS1 5
:POS_LOOP
cuttext $CORPY $BLANK_CK $POS1 1
if ($BLANK_CK = " ")
  cuttext $CORPY $CORPY 1 $POS1
  subtract $POS1 1
  setvar $CHECK2 1
  goto :POS_LOOP
end
if ($CHECK2 = 1)
  cuttext $CORPY $CORPY 1 $POS1
end
:CUT_ZERO

striptext $SAVESEC " "
cuttext $SAVESEC $ZERO_CK 1 1
if ($ZERO_CK = 0)
  cuttext $SAVESEC $SAVESEC 2 5
  goto :CUT_ZERO
end
:SAVE_EM

if ($TYPE = "TWarp")
  setvar $TWARP_SECTOR $SAVESEC
  setvar $GO 1
  goto :TWARP
elseif ($TYPE = "BWarp")
  setvar $BWARP_SECTOR $SAVESEC
  setvar $GO 1
  goto :BWARP
end
:GO1
send "f"
settextlinetrigger TOTAL_FIGS :TOTAL_FIGS "fighters available."
settextlinetrigger SEC_FIGS :SEC_FIGS "Your ship can support up to"
pause
:TOTAL_FIGS

getword CURRENTLINE $TOTAL_FIGS 3
striptext $TOTAL_FIGS ","
pause
:SEC_FIGS

getword CURRENTLINE $SEC_FIGS 10
striptext $SEC_FIGS ","
if ($TOTAL_FIGS <= 50000)
  send $TOTAL_FIGS "*cdzn"
else
  send "50000*cd*"
end
send "tfyf"
settextlinetrigger CORPY_FIGS :CORPY_FIGS "fighters, and"
pause
:CORPY_FIGS

setvar $CURRENT_LINE CURRENTLINE

setvar $KEY_IDX 1
while ($KEY_IDX <= 20)
  getword $CURRENT_LINE $WORDY $KEY_IDX
  if ($WORDY = "has")
    setvar $FTR_WORD ($KEY_IDX + 1)
    goto :GOT_WORD_NUM
  end
  add $KEY_IDX 1
end
:GOT_WORD_NUM

getword $CURRENT_LINE $CORPY_FIGS $FTR_WORD
striptext $CORPY_FIGS "."
striptext $CORPY_FIGS ","

send $CORPY_FIGS "*qzn"
send "wy" $CORPY "*y*zn"
send "tfyt" $CORPY_FIGS "*qzn"
send "f"
if ($SEC_FIGS > 1)
  send $SEC_FIGS
else
  send 1
end
send "*c d z n "
:GO_SCRUB

setvar $TWARP_SECTOR $SCRUB
setvar $GO 2
goto :TWARP
:TWARP



send "m" $TWARP_SECTOR "*y"
waitfor "To which Sector"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
pause
:NO_ORE


send "'OZ " $TYPE " Saveme - No ore!!*"
halt
:TWARP_ADJ


send "**"
killalltriggers
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:TWARP_LOCK

killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:NO_TWARP_LOCK

killalltriggers
send "n*"
send "'OZ " $TYPE " Saveme - Can't Get Lock! - Fig and Call Save!*"
goto :MAIN
:BWARP


send "b" $BWARP_SECTOR "*"
settextlinetrigger BEAM_LOCK :BEAM_LOCK "TransWarp Locked"
settextlinetrigger NO_BEAM_LOCK :NO_BEAM_LOCK "No locating beam found"
pause
:BEAM_LOCK
killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:NO_BEAM_LOCK

killalltriggers
send "n*"
send "'{" $BOT_NAME "} - " $TYPE " Saveme - Can't Get Lock! - Fig and Call Save!*"
goto :MAIN
:GO2


send " w * * z q n z q n "
gosub :QUIKSTATS
if ($TYPE = "BWarp")
  settextlinetrigger NOT_AT_HOME :EXIT_COMPLETELY "That planet is not in this sector."
  send " l "&$PLANET&"*"
  waitfor "Landing sequence engaged..."
  send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
  if ($CURRENT_SECTOR = $SECTOR)
    send "'{" $BOT_NAME "} - " $TYPE " Saveme - Arrived at Return Sector. Ready for another save.*"
  end
  goto :MAIN
else
  if ($TSAVEME_SCRUB = $CURRENT_SECTOR)
    send "'{" $BOT_NAME "} - " $TYPE " Saveme - Arrived at Scrub Sector.*"
    send "'{" $BOT_NAME "} - " $TYPE " Saveme - Please Exit/Enter to Remove Limpet.*"
  end
  send "'{" $BOT_NAME "} - " $TYPE " Saveme - Powering Down...*"
  send "**"
  halt
end
halt
:EXIT_COMPLETELY

send "'{" $BOT_NAME "} - " $TYPE " Saveme - Arrived at Scrub Sector.*"
send "'{" $BOT_NAME "} - " $TYPE " Saveme - Please Exit/Enter to Remove Limpet.*"
send "'{" $BOT_NAME "} - Saveme - Powering Down...*"
send "**"
halt
:QUIKSTATS




setvar $CURRENT_PROMPT "Undefined"
setvar $PSYCHIC_PROBE "No"
setvar $PLANET_SCANNER "No"
setvar $SCAN_TYPE "None"
setvar $CURRENT_SECTOR 0
setvar $TURNS 0
setvar $CREDITS 0
setvar $FIGHTERS 0
setvar $SHIELDS 0
setvar $TOTAL_HOLDS 0
setvar $ORE_HOLDS 0
setvar $ORGANIC_HOLDS 0
setvar $EQUIPMENT_HOLDS 0
setvar $COLONIST_HOLDS 0
setvar $PHOTONS 0
setvar $ARMIDS 0
setvar $LIMPETS 0
setvar $GENESIS 0
setvar $TWARP_TYPE 0
setvar $CLOAKS 0
setvar $BEACONS 0
setvar $ATOMIC 0
setvar $CORBO 0
setvar $EPROBES 0
setvar $MINE_DISRUPTORS 0
setvar $ALIGNMENT 0
setvar $EXPERIENCE 0
setvar $CORP 0
setvar $SHIP_NUMBER 0
setvar $TURNS_PER_WARP 0


setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
send #145&"/"
pause
:ALLPROMPTS

getword CURRENTLINE $CURRENT_PROMPT 1
striptext $CURRENT_PROMPT #145
striptext $CURRENT_PROMPT #8






settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:STATSTART

killtrigger PROMPT
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
