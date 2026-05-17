	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadvar $GAME~ptradesetting


	setVar $HELP~HELP[1]  $HELP~TAB&"           Planet Negotiate Trade Agrement          "
	setVar $HELP~HELP[2]  $HELP~TAB&"           "
	setVar $HELP~HELP[3]  $HELP~TAB&"    neg {f | o | e} {half}    "
	setVar $HELP~HELP[4]  $HELP~TAB&"                             "
	setVar $HELP~HELP[5]  $HELP~TAB&"Options:"
	setVar $HELP~HELP[6]  $HELP~TAB&"         {f}   sells as much fuel as possible"
	setVar $HELP~HELP[7]  $HELP~TAB&"         {o}   sells as much organics as possible"
	setVar $HELP~HELP[8]  $HELP~TAB&"         {e}   sells as much equipment as possible"
	setVar $HELP~HELP[9]  $HELP~TAB&"                                                    "
	setVar $HELP~HELP[10] $HELP~TAB&"      {half}   sell only half of port amount      "
	setVar $HELP~HELP[11] $HELP~TAB&"                                                    "
	setVar $HELP~HELP[12] $HELP~TAB&"          default is to sell all org and equip"
	setVar $HELP~HELP[13] $HELP~TAB&"          "
	setVar $HELP~HELP[14] $HELP~TAB&"           - Originally written by Cherokee"
	gosub :HELP~HELPFILE

	setvar $SWITCHBOARD~MESSAGE "Planet Negotiate starting up!*"
	gosub :SWITCHBOARD~SWITCHBOARD

	loadVar $game~port_max
	loadVar $game~ptradesetting
	loadvar $bot~$MCIC_FILE

# ============================== START HAGGLE VARIABLES ============================
	setVar $overhagglemultiple 	147
	setVar $cyclebuffer 		1
	setVar $cyclebufferlimit 	20
# ============================== END HAGGLE VARIABLES ============================

#==================================   START PLANET NEGOTIATE (NEG) SUB  ========================================
:neg
	killtrigger 1
	killtrigger 2


	setVar $BOT~validPrompts "Citadel Planet"
	gosub :PLAYER~CHECKSTARTINGPROMPT
	setVar $startingLocation $player~CURRENT_PROMPT
	
	if (($startingLocation = 0) or ($startingLocation = ""))
		gosub :player~quikstats
		setVar $startingLocation $player~CURRENT_PROMPT
	end

	getwordpos " "&$bot~user_command_line&" " $pos " half "
	if ($pos > 0)
		setvar $half true
	else
		setvar $half false
	end

	if ($bot~parm1 = "")
		setVar $planethaggle~_ck_pnego_fueltosell "-1"
		setVar $planethaggle~_ck_pnego_orgtosell "max"
		setVar $planethaggle~_ck_pnego_equiptosell "max"
	else
		setvar $amount "max"
		if ($half = true)
			loadvar $game~port_max
			setvar $half_port_max $game~port_max
			divide $half_port_max 2
			setvar $amount $half_port_max
		end
		getwordpos " "&$bot~user_command_line&" " $pos " f "
		if ($pos > 0)
			setVar $planethaggle~_ck_pnego_fueltosell $amount
		else
			setVar $planethaggle~_ck_pnego_fueltosell "-1"
		end

		getwordpos " "&$bot~user_command_line&" " $pos " o "
		if ($pos > 0)
			setVar $planethaggle~_ck_pnego_orgtosell $amount
		else
			setVar $planethaggle~_ck_pnego_orgtosell "-1"
		end
		getwordpos " "&$bot~user_command_line&" " $pos " e "
		if ($pos > 0)
			setVar $planethaggle~_ck_pnego_equiptosell $amount
		else
			setVar $planethaggle~_ck_pnego_equiptosell "-1"
		end
	end

	if (($planethaggle~_ck_pnego_fueltosell = "-1") and ($planethaggle~_ck_pnego_orgtosell = "-1") and ($planethaggle~_ck_pnego_equiptosell = "-1"))
		setvar $switchboard~message "Please use - neg [item] format*"
		gosub :switchboard~switchboard
		halt
	end


	gosub :planethaggle~planetNeg

	setvar $switchboard~message $planethaggle~exit_message&"*"
	gosub :switchboard~switchboard
	halt
#==================================   END PLANET NEGOTIATE (NEG) SUB  ========================================

#INCLUDES:
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\sector"
include "source\include\help"
include "source\include\switchboard.ts"
