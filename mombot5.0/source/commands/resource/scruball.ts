gosub :PLAYER~QUIKSTATS
setvar $MAX 100
setarray $SHIPS $MAX
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
setvar $MY_SHIP $PLAYER~SHIP_NUMBER
setvar $MY_CRED $PLAYER~CREDITS

if ($PLAYER~CURRENT_PROMPT = "<StarDock>")
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
  if (($UNLIMITEDGAME = 0) and ($PLAYER~TURNS < $REQ))
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
  gosub :PLAYER~QUIKSTATS
  send "'*"
  waiton "Type sub-space message"
  send "{"&$BOT_NAME&"} - Scrub-A-Dub-Dub*"
  send "          Ships Found : "&$IDX&"*"
  send "             Scrubbed : "&$SCRUBBED&"*"
  if ($SCRUBBED <> 0)
    setvar $CASHAMOUNT ($MY_CRED - $PLAYER~CREDITS)
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
include "source\include\player"
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
