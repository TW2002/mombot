







gosub :BOT~LOADVARS

loadvar $GAME~PTRADESETTING
loadvar $GAME~GOLDENABLED
loadvar $GAME~MBBS
loadvar $GAME~PORT_MAX
loadvar $GAME~ROB_FACTOR
loadvar $GAME~PRODUCTION_RATE
loadvar $BOT~FOLDER
setvar $BOT~NO_CREDITS_FILE $BOT~FOLDER&"/No_Credits.list"
savevar $BOT~NO_CREDITS_FILE
loadvar $GAME~LIMPET_COST
loadvar $GAME~ARMID_COST
loadvar $GAME~LIMPET_REMOVAL_COST


setvar $BOT~HELP[1] $BOT~TAB&"plock {sector} {kill} {fastkill} {fastdrop}"
setvar $BOT~HELP[2] $BOT~TAB&"    "
setvar $BOT~HELP[3] $BOT~TAB&"   Pre-locks with planet onto a sector."
setvar $BOT~HELP[4] $BOT~TAB&"    "
setvar $BOT~HELP[5] $BOT~TAB&"    Options: "
setvar $BOT~HELP[6] $BOT~TAB&"      {kill} - attempts citkill after landing"
setvar $BOT~HELP[7] $BOT~TAB&"  {fastkill} - macro kill after landing"
setvar $BOT~HELP[8] $BOT~TAB&"  {fastdrop} - deploys fighters after landing"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Plock"
gosub :BOT~BANNER


goto :STARTING
:SETTRIGGERS

killalltriggers
settextlinetrigger 1 :MANUAL "Planet is now in sector "&$TARGET_SECTOR
settexttrigger 2 :PLOCKFINISHED "Planetary TransWarp Drive shutting down."
settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$TARGET_SECTOR&": "
settexttrigger 4 :GOLIMPETPLOCK "Limpet mine in "&$TARGET_SECTOR&" "
settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$TARGET_SECTOR&" "
settexttrigger 6 :GOPLOCK "Locator beam lost."
pause
:GOARMIDPLOCK


cuttext CURRENTLINE&"    " $CK 1 4
setvar $SPOOF FALSE
if ($CK <> "Your")
  settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$TARGET_SECTOR&" "
  pause
end
if ($GAME~HASALIENS = TRUE)

  setvar $ALIEN FALSE
  gettext $BOT~ANSI_LAST_ARMID_ATTACK&"[xx][xx][xx]" $ALIEN_CHECK " damage to " "[xx][xx][xx]"
  getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
  if ($POS > 0)
    settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$TARGET_SECTOR&" "
    pause
  end
end
goto :GOPLOCK
:GOLIMPETPLOCK

cuttext CURRENTLINE&"      " $CK 1 6
setvar $SPOOF FALSE
if ($CK <> "Limpet")
  settexttrigger 4 :GOLIMPETPLOCK "Limpet mine in "&$TARGET_SECTOR&" "
  pause
end
goto :GOPLOCK
:GOFIGHTERPLOCK
getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
setvar $SPOOF FALSE
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$TARGET_SECTOR&": "
  pause
end
if ($GAME~HASALIENS = TRUE)
  setvar $ALIEN FALSE
  gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
  getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
  if ($POS > 0)
    settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$TARGET_SECTOR&": "
    pause
  end
end
:GOPLOCK


killalltriggers
if ($PLOCK_DELAY > 0)
  setdelaytrigger PLOCKDELAY :CONTINUEPLOCK $PLOCK_DELAY
  pause
end
:CONTINUEPLOCK
send "y '{" $SWITCHBOARD~BOT_NAME "} - PLOCK Launched*"
gosub :PLOCKKILL
if ($PLOCKKILL)
  goto :SCANIT_AGAIN
else
  send "s* "
  halt
end
:PLOCKFINISHED
send "  s*   "
setvar $SWITCHBOARD~MESSAGE "PLOCK Sector Cleared*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:MANUAL
killalltriggers
gosub :PLOCKKILL
if ($PLOCKKILL)
  goto :SCANIT_AGAIN
else
  send "s* "
end
halt
:STARTING
:START_PLOCK



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "You must run Plocker from Citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "Q"
gosub :PLANET~GETPLANETINFO
send "C "
setvar $TARGETING~PLANET $PLANET~PLANET
gosub :COMBAT~INIT
gosub :SHIP~GETSHIPSTATS
setvar $GAME~HASALIENS FALSE

send "#/"
waiton "Who's Playing"
settextlinetrigger 1 :ALIEN "are on the move!"
settexttrigger 2 :ALIENDONE #179&"Turns"
pause
:ALIEN
setvar $GAME~HASALIENS TRUE
:ALIENDONE
killtrigger 1
killtrigger 2
savevar $GAME~HASALIENS


getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " kill "
if ($POS > 0)
  setvar $PLOCKKILL TRUE
else
  setvar $PLOCKKILL FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " fastkill "
if ($POS > 0)
  setvar $FASTKILL TRUE
else
  setvar $FASTKILL FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " fastdrop "
if ($POS > 0)
  setvar $FASTDROP TRUE
else
  setvar $FASTDROP FALSE
end
setvar $TARGET_SECTOR $BOT~PARM1
isnumber $ISNUM $TARGET_SECTOR
if ($ISNUM = 1)
  if (($TARGET_SECTOR > 10) and (($TARGET_SECTOR <= SECTORS) and ($TARGET_SECTOR <> STARDOCK)))
    goto :PLANETPRELOCK
  elseif (($TARGET_SECTOR < 10) or ($TARGET_SECTOR >= SECTORS) or ($TARGET_SECTOR = STARDOCK))
    setvar $SWITCHBOARD~MESSAGE "Not a Valid PLOCK Sector*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
elseif ($ISNUM <> 1)
  setvar $SWITCHBOARD~MESSAGE "PLOCK Sector must be a number*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
isnumber $ISNUM $BOT~PARM2
if ($ISNUM)
  setvar $PLOCK_DELAY $BOT~PARM2
else
  isnumber $ISNUM $BOT~PARM3
  if ($ISNUM = 1)
    setvar $PLOCK_DELAY $BOT~PARM3
  end
end
:PLANETPRELOCK

setvar $SWITCHBOARD~MESSAGE "PLOCK Ready to fire Sector: "&$TARGET_SECTOR
if ($PLOCKKILL)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&", auto kill enabled."
end
if ($FASTKILL)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" -  fast kill enabled too."
end
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
gosub :SWITCHBOARD~SWITCHBOARD

send "p " $TARGET_SECTOR "*"
settextlinetrigger PRELOCKNO :PLOCKNO "You do not have any fighters in Sector "&$TARGET_SECTOR&"."
settextlinetrigger PRELOCKYES :PLOCKYES "Locating beam pinpointed, TransWarp Locked."
settextlinetrigger PRELOCKALREADYTHERE :PLOCKFINISHED "You are already in that sector!"
pause
:PLOCKNO

setvar $SWITCHBOARD~MESSAGE "You do not have any fighters in that Sector*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:PLOCKYES


goto :SETTRIGGERS
:MAIN



killalltriggers
gosub :PLAYER~QUIKSTATS
settextlinetrigger LIMP :SCANIT_CIT_KILL "Limpet mine in "&$PLAYER~CURRENT_SECTOR
settextlinetrigger WARPS :SCANIT_CIT_KILL "warps into the sector."
settextlinetrigger LIFTS :SCANIT_CIT_KILL "lifts off from"
settextlinetrigger DEFFIG :SCANIT_CIT_KILL "Deployed Fighters Report Sector "&$PLAYER~CURRENT_SECTOR
settextlinetrigger SECGUN :SCANIT_CIT_KILL "Quasar Cannon on"
settextlinetrigger IG :SCANIT_CIT_KILL "Shipboard Computers The Interdictor Generator on"
settextlinetrigger POWER :SCANIT_CIT_KILL "is powering up weapons systems!"
settextlinetrigger WAVE :SCANIT_CIT_KILL " launches a wave of fighters at  "
settextlinetrigger PLANET :SCANIT_CIT_KILL " launches a Genesis Torpedo into the sector!"
settextlinetrigger ATOMIC :SCANIT_CIT_KILL " appears from the planetary rubble."
settextlinetrigger EXITS :SCANIT_CIT_KILL "exits the game."
settextlinetrigger ENTERS :SCANIT_CIT_KILL "enters the game."
setdelaytrigger DELAY :SCANIT_CIT_KILL 30000
settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
pause
:PAUSING


killalltriggers
echo ANSI_6 "*[" ANSI_14 "Plock Citadel Killer paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:RESTARTING
killalltriggers
echo ANSI_6 "*[" ANSI_14 "Plock Citadel Killer restarted" ANSI_6 "]*" ANSI_7
goto :MAIN
:SCANIT_CIT_KILL

killalltriggers
getword CURRENTLINE $TEST 1
if (($TEST = "P") or ($TEST = "F") or ($TEST = "R") or ($TEST = ">"))
  echo ANSI_14 "*spoof attempt!*"
  goto :MAIN
end
:SCANIT_AGAIN
killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $PLANET~PLANET_COUNT SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
if (($PLANET~PLANET_COUNT = 1) and ($OVERIDE = FALSE))
  setvar $ONE_PLANET TRUE
  setvar $PLAYER~OVERRIDE TRUE
else
  setvar $PLAYER~OVERRIDE $OVERRIDE
end
gosub :SECTOR~GETSECTORDATA
if ($SECTOR~REALTRADERCOUNT > ($SECTOR~CORPIECOUNT + $SECTOR~DEFENDERSHIPS))
  gosub :COMBAT~FASTCITADELATTACK
  if ($PLAYER~FIGHTERS <= 0)
    setvar $SWITCHBOARD~MESSAGE "Fighters are gone - halting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  goto :SCANIT_AGAIN
elseif (($SECTOR~EMPTYSHIPCOUNT > $SECTOR~MYSHIPCOUNT) and ($CAPEMPTYSHIPS = TRUE))
  setvar $PLAYER~STARTINGLOCATION "Citadel"
  gosub :COMBAT~FASTCAPTURE
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_PROMPT = "Command")
    send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~FIGHTERS <= 0)
      setvar $SWITCHBOARD~MESSAGE "Fighters are gone - halting.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end
  goto :SCANIT_AGAIN
end
goto :HALT
:HALT
:FINAL

echo ANSI_12 "*NO Targets*"
if ($SECTOR~DEFENDERSHIPS > 0)
  setvar $SWITCHBOARD~MESSAGE "Enemy defender ship in sector!  Not attacking.  Override if you want to attempt to kill them.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
goto :MAIN
:PLOCKKILL


if ($FASTDROP = TRUE)
  setvar $SEND $SEND&"q q fz200000*z c d * l "&$PLANET~PLANET&"*  m  *** c  "
end
if ($FASTKILL = TRUE)
  setvar $SEND $SEND&"q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
end
send $SEND
return

# includes:
include "include/BOT.ts"
include "include/COMBAT.ts"
include "include/PLAYER.ts"
include "include/TARGETING.ts"
include "include/PLANET.ts"
include "include/SHIP.ts"
include "include/SECTOR.ts"
