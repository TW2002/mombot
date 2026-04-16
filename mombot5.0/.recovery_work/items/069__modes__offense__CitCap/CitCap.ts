gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&" citcap {"&#34&"player name"&#34&" | corp#}"
setvar $BOT~HELP[2] $BOT~TAB&" Citadel Capper captures enemy ships from planet citadel"
setvar $BOT~HELP[3] $BOT~TAB&"  "
setvar $BOT~HELP[4] $BOT~TAB&" {"&#34&"player name"&#34&"} - Player to target, name must be"
setvar $BOT~HELP[5] $BOT~TAB&"                   surrounded by double quotes"
setvar $BOT~HELP[6] $BOT~TAB&"         {corp#} - Corporation number to target"
setvar $BOT~HELP[7] $BOT~TAB&"      {override} - Override to cap defender ships"
setvar $BOT~HELP[8] $BOT~TAB&"         {empty} - Empty ships only"
setvar $BOT~HELP[9] $BOT~TAB&"        {onetap} - Fire once only"
setvar $BOT~HELP[10] $BOT~TAB&"        {slowmo} - Adds random pause between waves."
setvar $BOT~HELP[11] $BOT~TAB&"      {unloader} - Waits for unloader to finish b4 next attack."
setvar $BOT~HELP[12] $BOT~TAB&"         "
setvar $BOT~HELP[13] $BOT~TAB&"         Examples:"
setvar $BOT~HELP[14] $BOT~TAB&"              >citcap "
setvar $BOT~HELP[15] $BOT~TAB&"              >citcap "&#34&"player name"&#34&" "
setvar $BOT~HELP[16] $BOT~TAB&"              >citcap 3"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Citadel Capper"
gosub :BOT~BANNER

loadvar $GAME~LATENCY

setarray $SHIPLIST 200
gosub :PLAYER~QUIKSTATS
gosub :PLAYER~GETINFO
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $PLAYER~TARGETINGPERSON FALSE
setvar $PLAYER~TARGETINGCORP FALSE
setvar $PLAYER~CAPPINGALIENS TRUE
setvar $PLAYER~TARGET ""
setvar $CAPEMPTYSHIPS TRUE

setvar $BOT~MODE "Citcap"
savevar $BOT~MODE

if ($STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Citadel Capper must be run from the Citadel Prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $MODE "General"
  halt
end
isnumber $TEST $BOT~PARM1
if ($TEST)
  if ($BOT~PARM1 > 0)
    setvar $TARGETINGCORP TRUE
    setvar $PLAYER~TARGET $BOT~PARM1
  end
else
  getwordpos $BOT~USER_COMMAND_LINE $POS #34
  if ($POS > 0)
    setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "
    gettext $BOT~USER_COMMAND_LINE $PLAYER~TARGET " "&#34 #34&" "
    if ($PLAYER~TARGET <> "")
      setvar $TARGETINGPERSON TRUE
      striptext $PLAYER~TARGET #34
      lowercase $PLAYER~TARGET
    else
      setvar $TARGETINGPERSON FALSE
    end
  end
end

getwordpos $BOT~USER_COMMAND_LINE $POS "override"
if ($POS > 0)
  setvar $OVERRIDE TRUE
else
  setvar $OVERRIDE FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "empty"
if ($POS > 0)
  setvar $PLAYER~EMPTY_SHIPS_ONLY TRUE
else
  setvar $PLAYER~EMPTY_SHIPS_ONLY FALSE
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
  setvar $PLAYER~ONETAP FALSE
else
  setvar $PLAYER~SLOWMO FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "unloader"
if ($POS > 0)
  setvar $PLAYER~UNLOADER TRUE
else
  setvar $PLAYER~UNLOADER FALSE
end

gosub :PLAYER~QUIKSTATS
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT


if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Must start at the citadel prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end
:START_CIT_CAP



setvar $SWITCHBOARD~MESSAGE "Citadel Capper :: Powering Up!*"
gosub :SWITCHBOARD~SWITCHBOARD
:STATS_CIT_CAP
gosub :SHIP~GETSHIPSTATS
:WARNING_CIT_KILL
send "q m * * * "
gosub :PLANET~GETPLANETINFO
format $PLANET~PLANET_FIGHTERS $FORMATTED_FIGHTERS "NUMBER"
if ($TARGETINGPERSON)
  setvar $SWITCHBOARD~MESSAGE "Citadel Capper Targeting "&$PLAYER~TARGET&" :: Running on Planet "&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"
elseif ($TARGETINGCORP)
  setvar $SWITCHBOARD~MESSAGE "Citadel Capper Targeting Corp "&$PLAYER~TARGET&" :: Running on Planet"&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"
else
  setvar $SWITCHBOARD~MESSAGE "Citadel Capper :: Running on Planet "&$PLANET~PLANET&" :: "&$FORMATTED_FIGHTERS&" Fighters available on surface.*"


end
if ($PLAYER~ONETAP = TRUE)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*One Tap Preparing to fire*"
end
gosub :SWITCHBOARD~SWITCHBOARD
send "c  "

goto :SCANIT_CIT_CAP
:MAIN


killalltriggers
gosub :PLAYER~QUIKSTATS
settextlinetrigger LIMP :SCANIT_CIT_CAP "Limpet mine in "&$PLAYER~CURRENT_SECTOR
settextlinetrigger WARPS :SCANIT_CIT_CAP "warps into the sector."
settextlinetrigger LIFTS :SCANIT_CIT_CAP "lifts off from"
settextlinetrigger DEFFIG :SCANIT_CIT_CAP "Deployed Fighters Report Sector "&$PLAYER~CURRENT_SECTOR
settextlinetrigger SECGUN :SCANIT_CIT_CAP "Quasar Cannon on"
settextlinetrigger IG :SCANIT_CIT_CAP "Shipboard Computers The Interdictor Generator on"
settextlinetrigger POWER :SCANIT_CIT_CAP "is powering up weapons systems!"
settextlinetrigger WAVE :SCANIT_CIT_CAP " launches a wave of fighters at  "
settextlinetrigger PLANET :SCANIT_CIT_CAP " launches a Genesis Torpedo into the sector!"
settextlinetrigger ATOMIC :SCANIT_CIT_CAP " appears from the planetary rubble."
settextlinetrigger EXITS :SCANIT_CIT_CAP "exits the game."
settextlinetrigger ENTERS :SCANIT_CIT_CAP "enters the game."
setdelaytrigger DELAY :SCANIT_CIT_CAP 30000
settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
pause
:PAUSING


killalltriggers
echo ANSI_6 "*[" ANSI_14 "Citadel Capture paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:RESTARTING
killalltriggers
echo ANSI_6 "*[" ANSI_14 "Citadel Capture restarted" ANSI_6 "]*" ANSI_7
goto :MAIN
:SCANIT_CIT_CAP


killalltriggers
getword CURRENTLINE $TEST 1
if (($TEST = "P") or ($TEST = "F") or ($TEST = "R") or ($TEST = ">"))
  echo ANSI_14 "*spoof attempt!*"
  goto :MAIN
end
gosub :CHECKFORCAPPINGVICTIMSFROMCITADEL
goto :MAIN
:CHECKFORCAPPINGVICTIMSFROMCITADEL
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
setvar $PLAYER~STARTINGLOCATION "Citadel"
if ($SECTOR~REALTRADERCOUNT > ($SECTOR~CORPIECOUNT + $SECTOR~DEFENDERSHIPS)) or (($SECTOR~EMPTYSHIPCOUNT > $SECTOR~MYSHIPCOUNT) and ($CAPEMPTYSHIPS = TRUE)) or (($SECTOR~FAKETRADERCOUNT > $SECTOR~FEDERALCOUNT) and ($PLAYER~CAPPINGALIENS = TRUE))
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
echo ANSI_12 "*NO Targets*"
if ($SECTOR~DEFENDERSHIPS > 0)
  setvar $SWITCHBOARD~MESSAGE "Enemy defender ship in sector!  Not attacking.  Override if you want to attempt to kill them.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
if ($PLAYER~ONETAP = TRUE)
  setvar $SWITCHBOARD~MESSAGE "One Tap mode was on, so exiting Citcap.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/COMBAT.ts"
include "include/SHIP.ts"
include "include/PLANET.ts"
include "include/SECTOR.ts"
