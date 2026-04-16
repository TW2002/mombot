:BOT~CHECKSTARTINGPROMPT
if ($PLAYER~CURRENT_PROMPT = 0)
  gosub :PLAYER~CURRENT_PROMPT
end
getwordpos " "&$BOT~VALIDPROMPTS&" " $BOT~POS $PLAYER~CURRENT_PROMPT
if ($BOT~POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$BOT~VALIDPROMPTS&"]*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :WAIT_FOR_COMMAND
end
return
:BOT~LOADVARS

loadvar $BOT~ALARM_LIST
loadvar $PLAYER~OFFENSECAPPING
loadvar $PLAYER~CAPPINGALIENS
loadvar $PLANET~PLANET
loadvar $GAME~ATOMIC_COST
loadvar $GAME~BEACON_COST
loadvar $GAME~CORBO_COST
loadvar $GAME~CLOAK_COST
loadvar $GAME~PROBE_COST
loadvar $GAME~PLANET_SCANNER_COST
loadvar $GAME~LIMPET_COST
loadvar $GAME~ARMID_COST
loadvar $GAME~PHOTON_COST
loadvar $GAME~HOLO_COST
loadvar $GAME~DENSITY_COST
loadvar $GAME~DISRUPTOR_COST
loadvar $GAME~GENESIS_COST
loadvar $GAME~TWARPI_COST
loadvar $GAME~TWARPII_COST
loadvar $GAME~PSYCHIC_COST
loadvar $GAME~PHOTONS_ENABLED
loadvar $GAME~PHOTON_DURATION
loadvar $GAME~MAX_COMMANDS
loadvar $GAME~GOLDENABLED
loadvar $GAME~MBBS
loadvar $GAME~MULTIPLE_PHOTONS
loadvar $GAME~COLONIST_REGEN
loadvar $GAME~PTRADESETTING
loadvar $GAME~STEAL_FACTOR
loadvar $GAME~ROB_FACTOR
loadvar $GAME~CLEAR_BUST_DAYS
loadvar $GAME~PORT_MAX
loadvar $GAME~PRODUCTION_RATE
loadvar $GAME~PRODUCTION_REGEN
loadvar $GAME~DEBRIS_LOSS
loadvar $GAME~RADIATION_LIFETIME
loadvar $GAME~LIMPET_REMOVAL_COST
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $BOT~SUBSPACE
loadvar $BOT~PASSWORD
loadvar $BOT~BOT_PASSWORD
loadvar $BOT~MODE
loadvar $BOT~MODE
loadvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY
loadvar $BOT~SURROUNDAUTOCAPTURE
loadvar $PLAYER~SURROUNDAVOIDALLPLANETS
loadvar $PLAYER~SURROUNDDONTAVOID
loadvar $MAP~STARDOCK
loadvar $MAP~BACKDOOR
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~HOME_SECTOR
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
loadvar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME
loadvar $PLAYER~SURROUNDOVERWRITE
loadvar $PLAYER~SURROUNDPASSIVE
loadvar $PLAYER~SURROUNDNORMAL
loadvar $BOT~USERNAME
loadvar $BOT~LETTER
loadvar $PLAYER~DEFENDERCAPPING
loadvar $BOT~BOT_TURN_LIMIT
loadvar $BOT~SAFE_SHIP
loadvar $BOT~SAFE_PLANET
loadvar $BOT~BOT_TEAM_NAME
loadvar $BOT~HISTORYSTRING
loadvar $BOT~DORELOG
loadvar $PLAYER~SURROUND_BEFORE_HKILL
loadvar $BOT~COMMAND_PROMPT_EXTRAS
loadvar $BOT~SILENT_RUNNING
loadvar $BOT~COMMAND
loadvar $PLANET~PLANET_FILE

loadvar $BOT~USER_COMMAND_LINE
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $BOT~PARM3
loadvar $BOT~PARM4
loadvar $BOT~PARM5
loadvar $BOT~PARM6
loadvar $BOT~PARM7
loadvar $BOT~PARM8
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $BOT~PARM3
loadvar $BOT~PARM4
loadvar $BOT~PARM5
loadvar $BOT~PARM6
loadvar $BOT~PARM7
loadvar $BOT~PARM8
loadvar $PLAYER~UNLIMITEDGAME
loadvar $BOT~ARMID_COUNT_FILE
loadvar $BOT~ARMID_COUNT_FILE
loadvar $BOT~ARMID_FILE
loadvar $BOT~ARMID_FILE
setvar $BOT~UNLIMITEDGAME $PLAYER~UNLIMITEDGAME
setarray $BOT~HELP 50
setvar $BOT~HELP 50
setvar $BOT~TAB "     "

return
:BOT~HELP_FILE

setvar $BOT~HELP_FILE "scripts\MOMBot\Help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE

if ($BOT~DOESHELPFILEEXIST)
  setvar $BOT~I 1
  read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  while ($BOT~HELP_LINE <> "EOF")

    if ($BOT~HELP[$BOT~I] <> $BOT~HELP_LINE)
      goto :WRITE_NEW_HELP_FILE
    end
    add $BOT~I 1
    read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  end
  if (($BOT~HELP[($BOT~I + 1)] <> 0) or ($BOT~HELP[($BOT~I + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  return
end
:BOT~WRITE_NEW_HELP_FILE
delete $BOT~HELP_FILE
setvar $BOT~I 1
getlength $BOT~COMMAND $BOT~LENGTH
setvar $BOT~SPACES "                                            "
setvar $BOT~STARS "---------------------------------------------"
setvar $BOT~POS $BOT~LENGTH
cuttext $BOT~STARS $BOT~BORDER 1 $BOT~POS
setvar $BOT~POS ((50 - ($BOT~LENGTH + 10)) / 2)
cuttext $BOT~SPACES $BOT~CENTER 1 $BOT~POS
write $BOT~HELP_FILE "                     "
write $BOT~HELP_FILE "   "
write $BOT~HELP_FILE $BOT~CENTER&"<<<< "&$BOT~COMMAND&" >>>>"
write $BOT~HELP_FILE "   "
while ($BOT~I <= $BOT~HELP)
  if ($BOT~HELP[$BOT~I] = 0)
    goto :DONE_HELP_FILE
  end
  write $BOT~HELP_FILE $BOT~HELP[$BOT~I]
  add $BOT~I 1
end
:BOT~DONE_HELP_FILE
setvar $SWITCHBOARD~MESSAGE "Writing text file for "&$BOT~COMMAND&" in help directory.*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:BOT~BANNER

setvar $SWITCHBOARD~MESSAGE $BOT~SCRIPT_TITLE&" starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:BOT~DISCONNECT_TRIGGERS

settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
:BOT~PAUSING

killalltriggers
echo ANSI_14 "*[["&ANSI_15&$BOT~SCRIPT_TITLE&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:BOT~RESTARTING
killalltriggers
echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
goto :RESTART
