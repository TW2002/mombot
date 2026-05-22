gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"unlock - unlock ship in citadel to it can be traded"
gosub :help~helpfile

# ============================== START UNLOCK (unlock) Sub ==============================
:unlock
setvar $unlock_attempt 0
gosub  :player~currentprompt
setvar $bot~validprompts "Citadel"
gosub :player~checkstartingprompt
setvar $switchboard~message "Unlock ship initiated*"
gosub :switchboard~switchboard
send "ryy"
settextlinetrigger unlock_menu :unlock_menu "Game Server"
settextlinetrigger enter_game :enter_game "==-- Trade Wars 2002 --=="

:unlock_tryagain
setdelaytrigger unlock_ansimenu :unlock_ansimenu 2000
pause

:unlock_ansimenu
if ($unlock_attempt < 10)
	add $unlock_attempt 1
	send "#"
	goto :unlock_tryagain
end
disconnect
halt

:unlock_menu
killalltriggers
send $bot~letter & "*"
waiton "module now loading."
send "**"
waiton "Enter your choice:"

:enter_game
killalltriggers
send "t***"
waiton "Password?"
send $bot~password & "* * * c"
waiton "Citadel command (?=help)"
setvar $switchboard~message "Ship has been unlocked!*"
gosub :switchboard~switchboard
halt
# ============================== END UNLOCK (UNLOCK) Sub ==============================

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
