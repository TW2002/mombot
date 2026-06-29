:xenter~run
:xenter~xenter
gosub :player~quikstats
loadvar $game~game_menu_prompt

setvar $xenter~startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel"
gosub :player~checkstartingprompt
if ($xenter~startinglocation = "Citadel")
	send "q m n t *"
	gosub :planet~getplanetinfo
	send "c "
end

:xenter~exit_xenter
if ($xenter~startinglocation = "Command")
	setvar $xenter~exit_mac "q y * "
	setvar $xenter~exit_enter " t* * *"&$bot~password&"*    *    *       za9999*   z*   /"
else
	setvar $xenter~exit_mac "r   y   * * "
	setvar $xenter~exit_enter " t* * *"&$bot~password&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$planet~planet&"* c  /"
end

killtrigger 1
killtrigger 2
killtrigger 3
send $xenter~exit_mac
settexttrigger 1 :pickgame "Selection (? for menu)"
settexttrigger 2 :enter_choice_xenter "Enter your choice:"
settexttrigger 3 :pickgame $game~game_menu_prompt
pause

:xenter~enter_choice_xenter
killtrigger 1
killtrigger 2
killtrigger 3
send $xenter~exit_enter
waiton #179
return

:pickgame
killtrigger 1
killtrigger 2
killtrigger 3
send $bot~letter&"  *  "
waiton "[Pause]"
send " * "
goto :xenter~enter_choice_xenter

:xenter~xenterended
return

include "source\include\player"
include "source\include\planet"
include "source\include\game"
