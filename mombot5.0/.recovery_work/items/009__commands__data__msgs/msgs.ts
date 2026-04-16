gosub :QUIKSTATS
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

if (($CURRENT_PROMPT <> "Command") and ($CURRENT_PROMPT <> "Citadel"))
  send "'{" $BOT_NAME "} - MSGS Must be run from Command or Citadel Prompts*"
  halt
end

if ($PARM1 = "d")
  send "c m a * q :y"
  waiton "Delete messages?"
  settextlinetrigger DELETED :DELETED "Deleted"
  settexttrigger NADDA :NADDA "elp)"
  pause
  :DELETED

  killalltriggers
  setvar $TEMP CURRENTLINE
  gettext $TEMP $ONE "Deleted" "of"
  striptext $ONE " "
  gettext $TEMP $TWO "of" "messages"
  striptext $TWO " "
  waiton "elp)"
  send "'"
  waiton "[<ENTER> for multiple lines]"
  send "{"&$BOT_NAME&"} - Deleted "&$ONE&" of "&$TWO&" messages*"
  waiton "Message sent on sub-space channel"
  :NADDA
  killalltriggers
  halt
else
  send "cm"
  waiton "<Read messages>"
  settexttrigger 1 :PAUSE "[Pause]"
  settexttrigger 2 :PAUSE "[Press Space or Enter to continue]"
  settexttrigger 3 :FINI "Computer command ["
  pause
  :PAUSE
  killtrigger 1
  killtrigger 2
  settexttrigger 1 :PAUSE "[Pause]"
  settexttrigger 2 :PAUSE "[Press Space or Enter to continue]"
  send "*"
  pause
  :FINI
  killalltriggers
  send "q"
end
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
