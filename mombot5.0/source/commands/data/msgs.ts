gosub :PLAYER~QUIKSTATS
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

if (($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel"))
  setvar $switchboard~message "MSGS Must be run from Command or Citadel Prompts*"
  gosub :switchboard~switchboard
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
include "source\include\player"
include "source\include\switchboard.ts"
