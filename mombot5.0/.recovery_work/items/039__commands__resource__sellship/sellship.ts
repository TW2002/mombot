gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"  sellship   "
setvar $BOT~HELP[2] $BOT~TAB&"  "
setvar $BOT~HELP[3] $BOT~TAB&"     Sells all the ships at dock it can "
gosub :BOT~HELPFILE
:SELLSHIP
:SHIPSELL


killalltriggers
gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_SECTOR <> STARDOCK)
  setvar $SWITCHBOARD~MESSAGE "Must be at StarDock, Ported or in Sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $I 0
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
striptext $STARTINGLOCATION ">"
striptext $STARTINGLOCATION "<"
if (($STARTINGLOCATION <> "Command") and (($STARTINGLOCATION <> "StarDock") and ($STARTINGLOCATION <> "Shipyards")))
  setvar $SWITCHBOARD~MESSAGE "Ship Sell must be run from Command, Stardock or Shipyard prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD

  halt
end
if ($STARTINGLOCATION = "Command")
  send "p ss ys *"
elseif ($STARTINGLOCATION = "StarDock")
  send "s"
elseif ($STARTINGLOCATION = "Shipyard")
  goto :STARTSELL
end
:STARTSHIPSELL

setvar $CASH $PLAYER~CREDITS
setvar $INC 0
send "|S|"
waitfor "-------------------------------------------"
settextlinetrigger NOSHIP :SHIPSELLDONE "You do not own any other ships orbiting the Stardock!"
settexttrigger DONE :DONE "Choose which ship to sell (Q=Quit)"
settextlinetrigger LINE :LINE
pause
:LINE
getword CURRENTLINE $I 1
isnumber $TST $I
if ($TST)
  if ($I <> 0)
    add $INC 1
    setvar $SELLING[$INC] $I
  end
end
settextlinetrigger LINE :LINE
pause
:DONE
killalltriggers
send "  Q  "
setvar $I 1
if ($INC <> 0)
  while ($I <= $INC)
    send " S  "&$SELLING[$I]&"* Y  "
    waiton "You have "
    add $I 1
  end
end
:SHIPSELLDONE

killalltriggers
if ($INC > 0)
  gosub :PLAYER~QUIKSTATS
  setvar $CASHAMOUNT ($PLAYER~CREDITS - $CASH)
  gosub :COMMASIZE
  setvar $SWITCHBOARD~MESSAGE "You sold "&$INC&" ships. You made $"&$CASHAMOUNT&" credits.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
elseif ($INC < 1)
  setvar $SWITCHBOARD~MESSAGE "No Ships to Sell.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
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

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/PLAYER.ts"
