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
setvar $COMMAND_PROMPT "Command"
setvar $COMPUTER_PROMPT "Computer"
setvar $CITADEL_PROMPT "Citadel"
setvar $PLANET_PROMPT "Planet"
setvar $CORPORATE_PROMPT "Corporate"
setvar $STARDOCK_PROMPT "<Stardock>"
setvar $HARDWARE_PROMPT "<Hardware"
setvar $SHIPYARD_PROMPT "<Shipyard>"
setvar $TERRA_PROMPT "Terra"


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
