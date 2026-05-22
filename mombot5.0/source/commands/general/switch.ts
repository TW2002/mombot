gosub :loadvars~loadvars
gosub :help~initialize

setvar $bot~command "switch"
setvar $help~help[1]  $help~tab&"switch {"&#34&"trader_name"&#34&"} "
setvar $help~help[2]  $help~tab&"     "
setvar $help~help[3]  $help~tab&"   Switch ships with trader in citadel"
setvar $help~help[4]  $help~tab&"     "
setvar $help~help[5]  $help~tab&"   {"&#34&"trader_name"&#34&"} - trader's name to trade ships with"
setvar $help~help[6]  $help~tab&"     "
setvar $help~help[7]  $help~tab&"     Examples:"
setvar $help~help[8]  $help~tab&"         >switch "&#34&"mind dagger"&#34&"  "
setvar $help~help[9]  $help~tab&"         >switch mind"
gosub :help~helpfile

getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext $bot~user_command_line $trader_name #34 #34
	if ($trader_name = false)
		setvar $switchboard~message "Trader name entered wrong.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $trader_name $bot~parm1
end

gosub :switchships
if ($foundswitchship = true)
	setvar $switchboard~message "Switched successfully!*"
else
	setvar $switchboard~message "Could not find ship to switch with!*"
end
gosub :switchboard~switchboard
halt

:switchships
setvar $switchto $trader_name

:doswitch
setvar $foundswitchship false
killtrigger 1
killtrigger 2
settexttrigger	1	:switchcheck	"Trade with "
settexttrigger	2	:switchdone 	"Citadel treasury contains "
send " e"
pause

:switchcheck
if ($foundswitchship = true)
	send "*"
else
	setvar $current_line currentline
	lowercase $current_line
	lowercase $switchto
	trim $switchto
	getwordpos $current_line $pos "trade with "&$switchto
	if ($pos > 0)
		setvar $foundswitchship true
		send "y"
	else
		send "*"
	end
end
settexttrigger	1	:switchcheck	"Trade with "
pause

:switchdone
killtrigger 1
killtrigger 2
return

#includes
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
