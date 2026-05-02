	gosub :BOT~loadVars
	loadvar $GAME~ptradesetting


	setVar $BOT~help[1]  $BOT~tab&"           Planet Negotiate Trade Agrement          "
	setVar $BOT~help[2]  $BOT~tab&"           "
	setVar $BOT~help[3]  $BOT~tab&"    neg {f | o | e} {half}    "
	setVar $BOT~help[4]  $BOT~tab&"                             "
	setVar $BOT~help[5]  $BOT~tab&"Options:"
	setVar $BOT~help[6]  $BOT~tab&"         {f}   sells as much fuel as possible"
	setVar $BOT~help[7]  $BOT~tab&"         {o}   sells as much organics as possible"
	setVar $BOT~help[8]  $BOT~tab&"         {e}   sells as much equipment as possible"
	setVar $BOT~help[9]  $BOT~tab&"                                                    "
	setVar $BOT~help[10] $BOT~tab&"      {half}   sell only half of port amount      "
	setVar $BOT~help[11] $BOT~tab&"                                                    "
	setVar $BOT~help[12] $BOT~tab&"          default is to sell all org and equip"
	setVar $BOT~help[13] $BOT~tab&"          "
	setVar $BOT~help[14] $BOT~tab&"           - Originally written by Cherokee"
	gosub :bot~helpfile

	setVar $BOT~script_title "Planet Negotiate"
	gosub :BOT~banner

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
	gosub :BOT~checkStartingPrompt
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

	if ($bot~parm1 = 0)
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
include "source\include\planethaggle"
