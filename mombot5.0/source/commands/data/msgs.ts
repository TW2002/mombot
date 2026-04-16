gosub :QUIKSTATS
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $BOT_NAME

if (($CURRENT_PROMPT <> "Command") and ($CURRENT_PROMPT <> "Citadel"))
  send "'{" $BOT_NAME "} - MSGS Must be run from Command or Citadel Prompts*"
  halt
end

if ($PARM1 = "d")
  send "c m a * q :y"
  waiton "Delete messages?"
  settextlinetrigger DELETED :DELETED "Deleted"
  settexttrigger NADDA :NADDA "elp)"
  pause
  :DELETED

  killalltriggers
  setvar $TEMP CURRENTLINE
  gettext $TEMP $ONE "Deleted" "of"
  striptext $ONE " "
  gettext $TEMP $TWO "of" "messages"
  striptext $TWO " "
  waiton "elp)"
  send "'"
  waiton "[<ENTER> for multiple lines]"
  send "{"&$BOT_NAME&"} - Deleted "&$ONE&" of "&$TWO&" messages*"
  waiton "Message sent on sub-space channel"
  :NADDA
  killalltriggers
  halt
else
  send "cm"
  waiton "<Read messages>"
  settexttrigger 1 :PAUSE "[Pause]"
  settexttrigger 2 :PAUSE "[Press Space or Enter to continue]"
  settexttrigger 3 :FINI "Computer command ["
  pause
  :PAUSE
  killtrigger 1
  killtrigger 2
  settexttrigger 1 :PAUSE "[Pause]"
  settexttrigger 2 :PAUSE "[Press Space or Enter to continue]"
  send "*"
  pause
  :FINI
  killalltriggers
  send "q"
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
