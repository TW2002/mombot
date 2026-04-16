






















loadvar $MODE
loadvar $BOT_NAME
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
setvar $TAGLINE "{"&$BOT_NAME&"} DisR"
setvar $ERRMSG "'{"&$BOT_NAME&"} - DisR Syntax Error"
setvar $PLANET 0
setvar $SCANIT TRUE
setvar $BURSTING FALSE
setvar $START_PROMPT ""
setvar $TOTAL_MINES_POOFED 0
setarray $ADJ2HIT 6 1


if ($PARM1 = "help")
  send "'*"&$TAGLINE&" {Sector} {NScan} {Burst}*"
  send "   *"
  send "      {Sector}  Disrupt Mines in Adj Sector*"
  send "      {Burst}   Sends only 1 Disruptor into each Sector*"
  send "      {NScan}   Do Not Perform Holo Scan --otherwise it*"
  send "                Auto Detect enemy Armids*"
  send "   *"
  send "         Start Prompts:*"
  send "                         Command Prompt*"
  send "                         Planet/Citadel Prompt(S)*"
  send "                         Computer Prompt*"
  send "                         StarDock Prompt*"
  send "                         Port Prompt*"
  send "   *"
  send "      Default Action: Disrupt All Adjs, With Holo Scan.**"
  halt
end

isnumber $TST $MODE
if ($TST = 0)
  lowercase $MODE
  if ($MODE <> "general")
    send "'"&$TAGLINE&" - M()MBot Must Be In General Mode!*"
    halt
  end
end

isnumber $TST $PARM1
if ($TST = 0)
  lowercase $PARM1
  if ($PARM1 = "nscan")
    setvar $SCANIT FALSE
    setvar $PARM1 0
  elseif ($PARM1 = "burst")
    setvar $PARM1 0
    setvar $BURSTING TRUE
  else
    send $ERRMSG&"*"
    halt
  end

end
if (($PARM1 < 11) and ($PARM1 <> 0)) or ($PARM1 = STARDOCK)
  send $ERRMSG&" - Invalid Target!*"
  halt
elseif (($PARM1 = 0) and ($SCANIT = 0))
  setvar $IDX 1
  while (SECTOR.WARPS[CURRENTSECTOR][$IDX] > 0)
    setvar $ADJ SECTOR.WARPS[CURRENTSECTOR][$IDX]
    setvar $ADJ2HIT[$IDX] $ADJ
    setvar $ADJ2HIT[$IDX][1] 1
    add $IDX 1
  end
elseif ($PARM1 > 0)
  setvar $ADJ2HIT[1] $PARM1
  setvar $ADJ2HIT[1][1] 1
  setvar $SCANIT FALSE

end
isnumber $TST $PARM2
if ($TST = 0)
  lowercase $PARM2
  if ($PARM2 = "nscan")
    setvar $SCANIT FALSE
  elseif ($PARM2 = "burst")
    setvar $SCANIT FALSE
    setvar $BURSTING TRUE
  end
end

isnumber $TST $PARM3
if ($TST = 0)
  lowercase $PARM3
  if ($PARM3 = "nscan")
    setvar $SCANIT FALSE
  elseif ($PARM3 = "burst")
    setvar $SCANIT FALSE
    setvar $BURSTING TRUE
  end
end
:PROMPT_CHECKING

gosub :QUIKSTATS
if ($SCANIT and ($SCAN_TYPE <> "Holo"))
  send "'"&$TAGLINE&" - Ship Does Not Have A Long Range Scanner!*"
  halt
end
if ($MINE_DISRUPTORS = 0)
  send "'"&$TAGLINE&" - No Disruptors On Board!*"
  halt
end

if ($CURRENT_PROMPT = "Planet")
  gosub :PLANET_INFO
  if ($PLANET = 0)
    send "'"&$TAGLINE&" - Unable To Obtain Planet Number!*"
    halt
  end
  send "  Q  "
elseif ($CURRENT_PROMPT = "Citadel")
  send "  Q  "
  gosub :PLANET_INFO
  send "  Q  "
  if ($PLANET = 0)
    send "'"&$TAGLINE&" - Unable To Obtain Planet Number!*"
    halt
  end
elseif ($CURRENT_PROMPT = "Command")

elseif ($CURRENT_PROMPT = "Computer")
  send "  Q  "
  goto :PROMPT_CHECKING
elseif ($CURRENT_PROMPT = "StarDock")
  send "Q  "
elseif ($CURRENT_PROMPT = "Port")
  send " 0*  0*  0*  0*  "
else
  send "'"&$TAGLINE&" - At Unkown Prompt!*"
  halt

end
setvar $START_PROMPT $CURRENT_PROMPT

if ($SCANIT)
  gosub :DO_SCAN
  setvar $IDX 1


  while (SECTOR.WARPS[CURRENTSECTOR][$IDX] > 0)
    setvar $ADJ SECTOR.WARPS[CURRENTSECTOR][$IDX]
    if (SECTOR.MINES.QUANTITY[$ADJ] <> 0)
      if ((SECTOR.MINES.OWNER[$ADJ] <> "belong to your Corp") and (SECTOR.MINES.OWNER[$ADJ] <> "yours"))
        setvar $ADJ2HIT[$IDX] $ADJ
        setvar $ADJ2HIT[$IDX][1] SECTOR.MINES.QUANTITY[$ADJ]
      else
        setvar $ADJ2HIT[$IDX][1] 0
      end
    end
    add $IDX 1
  end
end


gosub :STAR_BURST


if ($PLANET <> 0)
  if ($START_PROMPT = "Citadel")
    send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  J  C  *  * "
  else
    send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  "
  end
elseif ($START_PROMPT = "StarDock")
  settextlinetrigger LIMPET_FOUND :LIMPET_FOUND "A port official runs up to you as you dock and informs you that"
  settexttrigger ON_DOCK :ON_DOCK "<StarDock> Where to?"
  send " P  S"
  pause
  :LIMPET_FOUND
  send " Y "
  pause
  :ON_DOCK
  killalltriggers
elseif ($START_PROMPT = "Port")
  send " P  T  "

end
setvar $IDX 1
setvar $STR ""
while ($IDX <= 6)
  if ($ADJ2HIT[$IDX][1] <> 0)
    setvar $STR $STR&"        Sector "&$ADJ2HIT[$IDX]&", "&$ADJ2HIT[$IDX][1]&" Mines Remain*"
  end
  add $IDX 1
end

if ($STR = "")
  send "'"&$TAGLINE&" - Disrupted "&$TOTAL_MINES_POOFED&" Mines!*"
else
  send "'*"&$TAGLINE&" - Status Report:*"
  send " *"&$STR
  send "        Disrupted: "&$TOTAL_MINES_POOFED&"**"
end

halt
:DO_SCAN















setdelaytrigger WHOA_WUZUP :WHOA_WUZUP 4000
settextlinetrigger SCAN_COMPLETE :SCAN_COMPLETE "Warps to Sector(s)"
if ($START_PROMPT = "Citadel")
  send " S  H"
elseif ($START_PROMPT = "Planet")
  send " S  H"
elseif ($START_PROMPT = "StarDock")
  send "  S  H"
elseif ($START_PROMPT = "Command")
  send "  S  H"
elseif ($START_PROMPT = "Port")
  send " S   H"
else
  gosub :QUIKSTAT
  send "'"&$TAGLINE&" - Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*"
  halt
end
pause
:WHOA_WUZUP
killalltriggers
send "'"&$TAGLINE&" - Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q"
waitfor ": ENDINTERROG"
gosub :QUIKSTATS
send "'"&$TAGLINE&" - Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*"
halt
:SCAN_COMPLETE
killalltriggers
return
:PLANET_INFO

settextlinetrigger PLANET :PLANET "Planet #"
send "D"
pause
:PLANET
killtrigger PLANET
getword CURRENTLINE $PLANET 2
striptext $PLANET "#"
isnumber $TST $PLANET
if ($TST = 0)
  setvar $PLANET 0
end
return
:QUIKSTATS

setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger PROMPT5
killtrigger STATLINETRIG
killtrigger GETLINE2
settexttrigger PROMPT1 :ALLPROMPTS "(?="
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
settextlinetrigger STATLINETRIG :STATSTART #179
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
settexttrigger PROMPT5 :PORTPROMPT "How many holds of"
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
:PORTPROMPT
getword CURRENTANSILINE $CHECKPROMPT 1
setvar $PORT_PROMPT_TYPE CURRENTLINE
getword $PORT_PROMPT_TYPE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35mHow"
if ($POS > 0)
  setvar $CURRENT_PROMPT "Port"
end
settexttrigger PROMPT5 :PORTPROMPT "How many holds of"
pause
:STATSTART

killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger PROMPT5
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
killtrigger PROMPT5
killtrigger STATLINETRIG
killtrigger GETLINE2

striptext $CURRENT_PROMPT "<"
striptext $CURRENT_PROMPT ">"
return
:GLOBAL_GROVER

setvar $CURRENT_PROMPT "Undefined"
setvar $PSYCHIC_PROBE "NO"
setvar $PLANET_SCANNER "NO"
setvar $SCAN_TYPE "NONE"
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
setvar $STARDOCK_PROMPT "Stardock"
setvar $HARDWARE_PROMPT "Hardware"
setvar $SHIPYARD_PROMPT "Shipyard"
setvar $TERRA_PROMPT "Terra"
setvar $PORT_PROMPT "Port"
setvar $PORT_PROMPT_TYPE ""
return
:STAR_BURST


setvar $DISRUPTORS $MINE_DISRUPTORS
send " C "
:LETS_GO_AGAIN
setvar $IDX 1
setvar $ADJ_HITS 0
while ($IDX <= 6)
  if ($ADJ2HIT[$IDX][1] <> 0)
    settextlinetrigger NOMINES :NOMINES "There were no mines in sector "&$ADJ2HIT[$IDX]
    settextlinetrigger MINESGONE :MINESGONE "of the mines in sector "&$ADJ2HIT[$IDX]&"!"
    settextlinetrigger NOTADJ :NOTADJ "That is not an adjacent sector"
    send " W Y "&$ADJ2HIT[$IDX]&"*"
    pause
    :NOMINES
    killalltriggers
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :NOTADJ
    killalltriggers
    send " Q"
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :MINESGONE
    killalltriggers
    setvar $TEMP CURRENTLINE
    getwordpos $TEMP $POS "remain)"
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    if ($POS = 0)
      getword $TEMP $TEMP 4
      isnumber $TST $TEMP
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP)
      end
      setvar $ADJ2HIT[$IDX][1] 0
    else
      getword $TEMP $TEMP2 3
      isnumber $TST $TEMP2
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP2)
      end
      gettext $TEMP $TEMP $ADJ2HIT[$IDX]&"! (" " remain)"
      isnumber $TST $TEMP
      if ($TST = 0)
        setvar $TEMP 0
      end
      setvar $ADJ2HIT[$IDX][1] $TEMP
      setvar $ADJ_HITS ($ADJ_HITS + 1)
    end
    :LOOP_D_LOU
    if ($DISRUPTORS < 1)
      setvar $IDX 6
    end
  end
  add $IDX 1
end
if (($ADJ_HITS <> 0) and (($DISRUPTORS > 0) and ($BURSTING = 0)))
  goto :LETS_GO_AGAIN
end
send " Q "
return
