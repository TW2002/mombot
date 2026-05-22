gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~ptradesetting

setvar $help~help[1]  $help~tab&"           Planet Negotiate Trade Agrement          "
setvar $help~help[2]  $help~tab&"           "
setvar $help~help[3]  $help~tab&"    neg {f | o | e} {half}    "
setvar $help~help[4]  $help~tab&"                             "
setvar $help~help[5]  $help~tab&"Options:"
setvar $help~help[6]  $help~tab&"         {f}   sells as much fuel as possible"
setvar $help~help[7]  $help~tab&"         {o}   sells as much organics as possible"
setvar $help~help[8]  $help~tab&"         {e}   sells as much equipment as possible"
setvar $help~help[9]  $help~tab&"                                                    "
setvar $help~help[10] $help~tab&"      {half}   sell only half of port amount      "
setvar $help~help[11] $help~tab&"                                                    "
setvar $help~help[12] $help~tab&"          default is to sell all org and equip"
setvar $help~help[13] $help~tab&"          "
setvar $help~help[14] $help~tab&"           - Originally written by Cherokee"
gosub :help~helpfile

setvar $switchboard~message "Planet Negotiate starting up!*"
gosub :switchboard~switchboard

loadvar $game~port_max
loadvar $game~ptradesetting
loadvar $bot~$mcic_file

# ============================== START HAGGLE VARIABLES ============================
setvar $overhagglemultiple 	147
setvar $cyclebuffer 		1
setvar $cyclebufferlimit 	20
# ============================== END HAGGLE VARIABLES ============================

#==================================   START PLANET NEGOTIATE (NEG) SUB  ========================================
:neg
killtrigger 1
killtrigger 2

setvar $bot~validprompts "Citadel Planet"
gosub :player~checkstartingprompt
setvar $startinglocation $player~current_prompt

if (($startinglocation = 0) or ($startinglocation = ""))
	gosub :player~quikstats
	setvar $startinglocation $player~current_prompt
end

getwordpos " "&$bot~user_command_line&" " $pos " half "
if ($pos > 0)
	setvar $half true
else
	setvar $half false
end

if ($bot~parm1 = "")
	setvar $planethaggle~_ck_pnego_fueltosell "-1"
	setvar $planethaggle~_ck_pnego_orgtosell "max"
	setvar $planethaggle~_ck_pnego_equiptosell "max"
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
		setvar $planethaggle~_ck_pnego_fueltosell $amount
	else
		setvar $planethaggle~_ck_pnego_fueltosell "-1"
	end

	getwordpos " "&$bot~user_command_line&" " $pos " o "
	if ($pos > 0)
		setvar $planethaggle~_ck_pnego_orgtosell $amount
	else
		setvar $planethaggle~_ck_pnego_orgtosell "-1"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
		setvar $planethaggle~_ck_pnego_equiptosell $amount
	else
		setvar $planethaggle~_ck_pnego_equiptosell "-1"
	end
end

if (($planethaggle~_ck_pnego_fueltosell = "-1") and ($planethaggle~_ck_pnego_orgtosell = "-1") and ($planethaggle~_ck_pnego_equiptosell = "-1"))
	setvar $switchboard~message "Please use - neg [item] format*"
	gosub :switchboard~switchboard
	halt
end

gosub :planethaggle~planetneg

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
