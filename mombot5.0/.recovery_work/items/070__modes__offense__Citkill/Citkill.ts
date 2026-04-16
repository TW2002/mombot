logging "OFF"
gosub :BOT~LOADVARS
loadvar $GAME~LATENCY
setvar $BOT~HELP[1] $BOT~TAB&"citkill {"&#34&"player name"&#34&"|corp#} {sg} {dt}"
setvar $BOT~HELP[2] $BOT~TAB&"        {empty} {smart} {override}"
setvar $BOT~HELP[3] $BOT~TAB&"Citadel Killer destroys enemy ships from planet citadel."
setvar $BOT~HELP[4] $BOT~TAB&"  "
setvar $BOT~HELP[5] $BOT~TAB&"{"&#34&"player name"&#34&"}   - Player to target, name must be"
setvar $BOT~HELP[6] $BOT~TAB&"                    surrounded by double quotes"
setvar $BOT~HELP[7] $BOT~TAB&"{corp#}           - Corporation number to target"
setvar $BOT~HELP[8] $BOT~TAB&"{sg}              - Shotgun mode, fires waves at"
setvar $BOT~HELP[9] $BOT~TAB&"                    first three possible targets"
setvar $BOT~HELP[10] $BOT~TAB&"{dt}              - Doubletap mode, fires two waves"
setvar $BOT~HELP[11] $BOT~TAB&"                    before refurbing"
setvar $BOT~HELP[12] $BOT~TAB&"{empty}           - Will capture empty ships in sector"
setvar $BOT~HELP[13] $BOT~TAB&"{smart}           - Notices changes in ship type/target"
setvar $BOT~HELP[14] $BOT~TAB&"{override}        - Overrides safety on attacking defender bonus ships"
setvar $BOT~HELP[15] $BOT~TAB&"{photon} (NA)     - Will fire photon to adjacent fig hits"
setvar $BOT~HELP[16] $BOT~TAB&"{onetap}          - fire once only"
setvar $BOT~HELP[17] $BOT~TAB&"{slowmo}          - Adds random pause between waves."

gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Citadel Killer"
gosub :BOT~BANNER
:CIT_KILL


gosub :COMBAT~INIT
gosub :PLAYER~QUIKSTATS
gosub :PLAYER~GETINFO
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $PLAYER~TARGETINGPERSON FALSE
setvar $PLAYER~TARGETINGCORP FALSE
setvar $PLAYER~TARGET ""
setvar $BOT~MODE "Citkill"
savevar $BOT~MODE

if ($PLAYER~STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Citadel Killer must be run from the Citadel Prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $BOT~MODE "General"
  savevar $BOT~MODE
  halt
end
isnumber $TEST $BOT~PARM1
if ($TEST)
  if ($BOT~PARM1 > 0)
    setvar $PLAYER~TARGETINGCORP TRUE
    setvar $PLAYER~TARGET $BOT~PARM1
  end
else
  getwordpos $BOT~USER_COMMAND_LINE $POS #34
  if ($POS > 0)
    setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "
    gettext $BOT~USER_COMMAND_LINE $TARGET " "&#34 #34&" "
    if ($TARGET <> "")
      setvar $PLAYER~TARGETINGPERSON TRUE
      lowercase $PLAYER~TARGET
      striptext $BOT~USER_COMMAND_LINE " "&#34&$PLAYER~TARGET&#34&" "
    else
      setvar $PLAYER~TARGETINGPERSON FALSE
    end
  end
end
getwordpos $BOT~USER_COMMAND_LINE $POS "dt"
if ($POS > 0)
  setvar $PLAYER~DOUBLETAP TRUE
else
  setvar $PLAYER~DOUBLETAP FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "empty"
if ($POS > 0)
  setvar $CAPEMPTYSHIPS TRUE
  setvar $PLAYER~EMPTY_SHIPS_ONLY TRUE
else
  setvar $CAPEMPTYSHIPS FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "override"
if ($POS > 0)
  setvar $OVERRIDE TRUE
else
  setvar $OVERRIDE FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "smart"
if ($POS > 0)
  setvar $PLAYER~SMART TRUE
else
  setvar $PLAYER~SMART FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "sg"
if ($POS > 0)
  setvar $PLAYER~SHOTGUN TRUE
else
  setvar $PLAYER~SHOTGUN FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "onetap"
if ($POS > 0)
  setvar $PLAYER~ONETAP TRUE
else
  setvar $PLAYER~ONETAP FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "slowmo"
if ($POS > 0)
  setvar $PLAYER~SLOWMO TRUE
else
  setvar $PLAYER~SLOWMO FALSE
end

loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end
:START_CIT_KILL


gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Must start at the citadel prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :SHIP~GETSHIPSTATS
:WARNING

send "q m * * * "
gosub :PLAYER~QUIKSTATS
gosub :PLANET~GETPLANETINFO
format $PLANET~PLANET_FIGHTERS $FORMATTED_FIGHTERS "NUMBER"

if ($PLAYER~TARGETINGPERSON)
  setvar $SWITCHBOARD~MESSAGE "Citadel Killer Targeting "&$TARGET&" :: Running on Planet "&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"
  gosub :SWITCHBOARD~SWITCHBOARD
elseif ($PLAYER~TARGETINGCORP)
  setvar $SWITCHBOARD~MESSAGE "Citadel Killer Targeting Corp "&$TARGET&" :: Running on Planet "&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $SWITCHBOARD~MESSAGE "Citadel Killer :: Running on Planet "&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
if ($PLAYER~SHOTGUN)
  setvar $SWITCHBOARD~MESSAGE "Shotgun mode enabled.*"
  gosub :SWITCHBOARD~SWITCHBOARD
elseif ($PLAYER~DOUBLETAP)
  setvar $SWITCHBOARD~MESSAGE "Doubletap mode enabled.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
send "c  "

goto :SCANIT_CIT_KILL
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
echo ANSI_6 "*[" ANSI_14 "Citadel Killer paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:RESTARTING
killalltriggers
echo ANSI_6 "*[" ANSI_14 "Citadel Killer restarted" ANSI_6 "]*" ANSI_7
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

halt

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
include "include/COMBAT.ts"
include "include/SECTOR.ts"
include "include/SHIP.ts"
