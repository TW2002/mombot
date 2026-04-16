logging "OFF"
gosub :BOT~LOADVARS
loadvar $SHIP~CAP_FILE
loadvar $PLAYER~ONLYALIENS
loadvar $PLAYER~CAPPINGALIENS
loadvar $PLAYER~EMPTY_SHIPS_ONLY
loadvar $PLAYER~DEFENDERCAPPING



setvar $BOT~HELP[1] $BOT~TAB&"cap   "
setvar $BOT~HELP[2] $BOT~TAB&"    Captures enemy ships and attempts to not destroy them.   "
gosub :BOT~HELPFILE

gosub :COMBAT~INIT

loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end
:AUTOCAP
:CAP


gosub :PLAYER~QUIKSTATS
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($PLAYER~STARTINGLOCATION <> "Command")
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    loadvar $BOT~MODE
    if ($BOT~MODE <> "Citcap")
      setvar $BOT~COMMAND "citcap"
      setvar $BOT~USER_COMMAND_LINE " citcap on "
      setvar $BOT~PARM1 "on"
      savevar $BOT~PARM1
      savevar $BOT~COMMAND
      savevar $BOT~USER_COMMAND_LINE
      setvar $BOT~MODE "Citcap"
      savevar $BOT~MODE
      load "scripts\mombot\modes\offense\citcap.cts"
    else
      setvar $BOT~MODE "General"
      savevar $BOT~MODE
      stop "scripts\mombot\modes\offense\citcap.cts"
      setvar $SWITCHBOARD~MESSAGE "Citcap off.*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
    halt
  end
  setvar $SWITCHBOARD~MESSAGE "Wrong prompt for auto capture.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos $BOT~USER_COMMAND_LINE $POS "alien"
if ($POS > 0)
  setvar $PLAYER~ONLYALIENS TRUE
else
  setvar $PLAYER~ONLYALIENS FALSE
end
fileexists $SHIP~CAP_FILE_CHK $SHIP~CAP_FILE
if ($SHIP~CAP_FILE_CHK <> TRUE)
  gosub :SHIP~GETSHIPCAPSTATS
end
loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~SHIP_FIGHTERS_MAX
loadvar $SHIP~SHIP_OFFENSIVE_ODDS
if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
  gosub :SHIP~GETSHIPSTATS
end
setvar $LASTTARGET ""
setvar $THISTARGET ""
gosub :SECTOR~GETSECTORDATA
gosub :COMBAT~FASTCAPTURE
halt

# includes:
include "source\include\bot"
include "source\include\combat"
include "source\include\ship"
include "source\include\player"
include "source\include\sector"
