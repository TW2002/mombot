gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setvar $bot~command "switch"
	setVar $HELP~HELP[1]  $HELP~TAB&"switch {"&#34&"trader_name"&#34&"} "
	setVar $HELP~HELP[2]  $HELP~TAB&"     "
	setVar $HELP~HELP[3]  $HELP~TAB&"   Switch ships with trader in citadel"
	setVar $HELP~HELP[4]  $HELP~TAB&"     "
	setVar $HELP~HELP[5]  $HELP~TAB&"   {"&#34&"trader_name"&#34&"} - trader's name to trade ships with"
	setVar $HELP~HELP[6]  $HELP~TAB&"     "
	setVar $HELP~HELP[7]  $HELP~TAB&"     Examples:"
	setVar $HELP~HELP[8]  $HELP~TAB&"         >switch "&#34&"mind dagger"&#34&"  "
	setVar $HELP~HELP[9]  $HELP~TAB&"         >switch mind"
	gosub :HELP~HELPFILE

	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $trader_name #34 #34
		if ($trader_name = false)
			setVar $SWITCHBOARD~message "Trader name entered wrong.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		end
	else
		setvar $trader_name $bot~parm1
	end

    gosub :switchships
    if ($foundSwitchShip = true)
        setvar $switchboard~message "Switched successfully!*"
    else
        setvar $switchboard~message "Could not find ship to switch with!*"
    end
    gosub :switchboard~switchboard
    halt
:switchships 
	setvar $switchto $trader_name
	:doswitch
	setvar $foundSwitchShip false
	killtrigger 1
	killtrigger 2
	setTextTrigger	1	:switchcheck	"Trade with "
	setTextTrigger	2	:switchdone 	"Citadel treasury contains "
	send " e"
	pause

	:switchcheck
		if ($foundSwitchShip = true)
			send "*"
		else
            setvar $current_line currentline
            lowercase $current_line
            lowercase $switchto
            trim $switchto
			getwordpos $current_line $pos "trade with "&$switchto
			if ($pos > 0)
				setvar $foundSwitchShip true
				send "y"
			else
				send "*"
			end		
		end
		setTextTrigger	1	:switchcheck	"Trade with "
		pause
	:switchdone
		killtrigger 1
		killtrigger 2	
return

#includes
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
