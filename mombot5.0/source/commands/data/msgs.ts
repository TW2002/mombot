gosub :player~quikstats
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $bot_name

if (($player~current_prompt <> "Command") and ($player~current_prompt <> "Citadel"))
	setvar $switchboard~message "MSGS Must be run from Command or Citadel Prompts*"
	gosub :switchboard~switchboard
	halt
end

if ($parm1 = "d")
	send "c m a * q :y"
	waiton "Delete messages?"
	settextlinetrigger deleted :deleted "Deleted"
	settexttrigger nadda :nadda "elp)"
	pause

	:deleted
	killalltriggers
	setvar $temp currentline
	gettext $temp $one "Deleted" "of"
	striptext $one " "
	gettext $temp $two "of" "messages"
	striptext $two " "
	waiton "elp)"
	send "'"
	waiton "[<ENTER> for multiple lines]"
	send "{"&$bot_name&"} - Deleted "&$one&" of "&$two&" messages*"
	waiton "Message sent on sub-space channel"

	:nadda
	killalltriggers
	halt
else
	send "cm"
	waiton "<Read messages>"
	settexttrigger 1 :pause "[Pause]"
	settexttrigger 2 :pause "[Press Space or Enter to continue]"
	settexttrigger 3 :fini "Computer command ["
	pause

	:pause
	killtrigger 1
	killtrigger 2
	settexttrigger 1 :pause "[Pause]"
	settexttrigger 2 :pause "[Press Space or Enter to continue]"
	send "*"
	pause

	:fini
	killalltriggers
	send "q"
end
halt
include "source\include\player"
include "source\include\switchboard.ts"
