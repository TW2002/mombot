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
