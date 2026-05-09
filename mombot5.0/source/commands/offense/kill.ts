logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $SHIP~CAP_FILE
gosub :COMBAT~INIT



setvar $BOT~COMMAND "kill"
setvar $HELP~HELP[1] $HELP~TAB&"kill   "
setvar $HELP~HELP[2] $HELP~TAB&"    Kills any enemy players.   "
gosub :HELP~HELPFILE
:KILL
:AUTOKILL



loadvar $PLAYER~TARGETINGPERSON
loadvar $PLAYER~TARGETINGCORP
loadvar $PLAYER~CAPPINGALIENS
loadvar $PLAYER~TARGET
loadvar $MAP~STARDOCK
loadvar $IN_KILL_ROUTINE

if ($IN_KILL_ROUTINE = TRUE)
  echo "[Kill routine already running.]*"
else
  if ($BOT~PARM1 = "furb")
    setvar $FURB TRUE
  end

  gosub :PLAYER~CURRENTPROMPT
  setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  if ($PLAYER~STARTINGLOCATION <> "Command")
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      loadvar $BOT~MODE
      if ($BOT~MODE <> "Citkill")
        setvar $BOT~COMMAND "citkill"
        setvar $BOT~USER_COMMAND_LINE " citkill on "
        setvar $BOT~PARM1 "on"
        savevar $BOT~PARM1
        savevar $BOT~COMMAND
        savevar $BOT~USER_COMMAND_LINE
        setvar $BOT~MODE "Citkill"
        savevar $BOT~MODE
        load "scripts\mombot\modes\offense\citkill.cts"
      else
        setvar $BOT~MODE "General"
        savevar $BOT~MODE
        stop "scripts\mombot\modes\offense\citkill.cts"
        setvar $SWITCHBOARD~MESSAGE "Citkill off.*"
        gosub :SWITCHBOARD~SWITCHBOARD
      end
      halt
    end
    setvar $SWITCHBOARD~MESSAGE "Wrong prompt for auto kill.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  loadvar $SHIP~SHIP_MAX_ATTACK
  loadvar $SHIP~SHIP_FIGHTERS_MAX
  loadvar $SHIP~SHIP_OFFENSIVE_ODDS
  if ($SHIP~SHIP_MAX_ATTACK <= 0)
    gosub :SHIP~GETSHIPSTATS
  end
  setvar $PLAYER~ISFOUND FALSE
  gosub :SECTOR~GETSECTORDATA
  gosub :COMBAT~FASTATTACK
  if ((($PLAYER~CURRENT_SECTOR = 1) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)) and ($FURB = TRUE))
    if ($PLAYER~ISFOUND)
      load "scripts\mombot\commands\resource\refurb.cts"
      seteventtrigger 1 :REFURBENDED "SCRIPT STOPPED" "scripts\mombot\commands\resource\refurb.cts"
      pause
      :REFURBENDED
      gosub :SECTOR~GETSECTORDATA
      gosub :COMBAT~FASTATTACK
    end
  end
  setvar $IN_KILL_ROUTINE FALSE
  savevar $IN_KILL_ROUTINE
end
gosub :PLAYER~QUIKSTATS
halt

# includes:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
