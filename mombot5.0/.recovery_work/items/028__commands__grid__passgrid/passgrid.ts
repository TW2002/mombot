

loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $STARDOCK
loadvar $RYLOS
loadvar $ALPHA_CENTAURI
loadvar $HOME_SECTOR


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


getword $USER_COMMAND_LINE $PARM1 1
getword $USER_COMMAND_LINE $PARM2 2
getword $USER_COMMAND_LINE $PARM3 3
getword $USER_COMMAND_LINE $PARM4 4
getword $USER_COMMAND_LINE $PARM5 5
getword $USER_COMMAND_LINE $PARM6 6
getword $USER_COMMAND_LINE $PARM7 7
getword $USER_COMMAND_LINE $PARM8 8


if ($PARM1 = "help")
  send "'*{" $BOT_NAME "} passgrid - passgrid [limpets] [mines] **"
  halt
end

setarray $WARP 7
setarray $WARPCOUNT 7
setarray $DENSITY 7
setarray $WEIGHT 7
setarray $ANOM 7
setarray $EXPLORED 7

gosub :QUIKSTATS
setvar $STARTINGLOCATION $CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  send "'{" $BOT_NAME "} - Passive gridder must be run from Command or Citadel prompt.*"
  halt
end
if (($SCAN_TYPE <> "Holo") and ($SCAN_TYPE <> "Dens"))
  send "'{" $BOT_NAME "} - Must have at least Density scanner to run passive gridder.*"
  halt
end
getwordpos " "&$USER_COMMAND_LINE&" " $POS " f "
if ($POS > 0)
  setvar $DEPLOYFIGS TRUE
else
  setvar $DEPLOYFIGS FALSE
end
getwordpos " "&$USER_COMMAND_LINE&" " $POS " l "
if ($POS > 0)
  setvar $DEPLOYLIMPETS TRUE
else
  setvar $DEPLOYLIMPETS FALSE
end
getwordpos " "&$USER_COMMAND_LINE&" " $POS " m "
if ($POS > 0)
  setvar $DEPLOYMINES TRUE
else
  setvar $DEPLOYMINES FALSE
end
getwordpos " "&$USER_COMMAND_LINE&" " $POS " haggle "
if ($POS > 0)
  setvar $HAGGLETRACKER TRUE
else
  setvar $HAGGLETRACKER FALSE
end
send "qqq* "
:START
setvar $COUNTER 0
:SUB_SCAN

send "s"
setvar $LIMPS 2
setvar $MINES 1
waitfor "Long Range Scan"
send "d"

waitfor "Relative Density Scan"

setvar $I 1
while ($I <= 7)
  setvar $WARP[$I] 0
  setvar $WARPCOUNT[$I] 0
  setvar $DENSITY[$I] "-1"
  setvar $WEIGHT[$I] 9999
  setvar $ANOM[$I] "No"
  setvar $EXPLORED[$I] 1
  add $I 1
end
setvar $I 1
settextlinetrigger 1 :GETWARP "Sector "
settexttrigger 2 :GOTWARPS "Command [TL="
pause
:GETWARP
setvar $LINE CURRENTLINE
striptext $LINE "("
getword $LINE $WARP 2
getword $LINE $DENSITY 4
getword $LINE $WARPCOUNT 7
getword $LINE $ANOM 13
getlength $WARP $LENGTH
cuttext $WARP $EXPLORED $LENGTH 1
if ($EXPLORED = ")")
  setvar $EXPLORED 0
else
  setvar $EXPLORED 1
end
striptext $WARP ")"
striptext $DENSITY ","
setvar $WARP[$I] $WARP
setvar $DENSITY[$I] $DENSITY
setvar $WARPCOUNT[$I] $WARPCOUNT
setvar $ANOM[$I] $ANOM
setvar $EXPLORED[$I] $EXPLORED
add $I 1
settextlinetrigger 1 :GETWARP "Sector "
pause
:GOTWARPS
killtrigger 1
killtrigger 2

setvar $I 1
setvar $BESTWARP 1
setvar $HOLO 0
:WEIGHTWARP
while ($WARP[$I] > 0)
  setvar $WEIGHT[$I] 0
  if (($DENSITY[$I] <> 100) and ($DENSITY[$I] <> 0))
    add $WEIGHT[$I] 100
    add $WEIGHT[$I] $DENSITY[$I]
    setvar $HOLO 1
  end
  if ($ANOM[$I] <> "No")
    add $WEIGHT[$I] 100
  end
  if ($EXPLORED[$I] = 1)
    add $WEIGHT[$I] 20
  end
  if ($WARP[$I] = $LASTWARP)
    add $WEIGHT[$I] 5
  end

  setvar $X 6
  subtract $X $WARPCOUNT[$I]

  getrnd $RAND 1 10
  add $WEIGHT[$I] $RAND

  if ($WEIGHT[$BESTWARP] > $WEIGHT[$I])
    setvar $BESTWARP $I
  end
  add $I 1
end

if ($WEIGHT[$BESTWARP] > 100)
  goto :BACK
end

if (($SCANTYPE = "Holographic") and ($HOLO = 1))
  send "sh"
  waitfor "Command [TL="
end

setvar $ATTACK "m  z"&$WARP[$BESTWARP]&"* * za999923* jr * "
setvar $LASTWARP $THISWARP
setvar $THISWARP $WARP[$BESTWARP]

setvar $ATTACK $ATTACK&"f 1* zcd * "
if (($MINES > 0) and ($ARMIDS >= $MINES))
  setvar $ATTACK $ATTACK&"h1 z"&$MINES&"* c"
end

if (($LIMPS > 0) and ($LIMPETS >= $LIMPS))
  setvar $ATTACK $ATTACK&"h2 z"&$LIMPS&"* c"
end
send $ATTACK

gosub :QUIKSTATS
if ($CURRENT_SECTOR <> $WARP[$BESTWARP])
  send "'{" $BOT_NAME "} - Did not make it to target sector!*"
  halt
end

goto :SUB_SCAN
:BACK

setvar $CHECKWARP $THISWARP
if ($CHECKWARP = $THISWARP)
  add $COUNTER 1
end

if ($COUNTER = 2)
  send "'{" $BOT_NAME "} - Passive grid stopping. Either in dead end, or no safe options. *"
  halt
end
send "<"
goto :SUB_SCAN
:HAGGLETRACKER

settexttrigger NOPORT :NOPORT "Corp Menu"
send "p"
send "t"
waitfor "<Port>"
settexttrigger NOFUEL :NOFUEL "How many holds of Fuel Ore do you want to buy"
settexttrigger NOORG :NOORG "How many holds of Organics do you want to buy"
settexttrigger EQUP :EQUP "How many holds of Equipment do you want to sell ["
settexttrigger BUYEQUP :BUYEQUP "How many holds of Equipment do you want to buy"
settexttrigger NOSELL :NOSELL "You don't have anything they want"
settexttrigger FUELSELL :FUELSELL "How many holds of Fuel Ore do you want to sell"
settexttrigger ORGSELL :ORGSELL "How many holds of Organics do you want to sell"
goto :SUB_SCAN
:NOPORT

send "q"
killalltriggers
goto :SUB_SCAN
:NOFUEL

send "0*0*0*"
killalltriggers
goto :SUB_SCAN
:NOORG

send "0*0*0*"
killalltriggers
goto :SUB_SCAN
:EQUP

send "10**0*0*"
killalltriggers
goto :SUB_SCAN
:BUYEQUP

send "****"
killalltriggers
goto :SUB_SCAN
:NOSELL

killalltriggers
goto :SUB_SCAN
:FUELSELL

send "**0*0*"
killalltriggers
goto :HAGGLETRACKER
:ORGSELL

send "**0*0*"
killalltriggers
goto :HAGGLETRACKER
:QUIKSTATS




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
