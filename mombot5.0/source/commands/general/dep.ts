gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end

setVar $PLAYER_CASH_MAX     999999999
setVar $planet~citadel_CASH_MAX    999999999999999

# ============================== START DEPOSIT (DEP) ==============================
:dep
:d
	replaceText $bot~parm1 "m" "000000"
	replaceText $bot~parm1 "M" "000000"
	replaceText $bot~parm1 "k" "000"
	replaceText $bot~parm1 "K" "000"

	gosub :bankProtections
	if ($bot~parm1 = "")
		setVar $cashToTransfer $PLAYER~CREDITS
	else
		setVar $cashToTransfer $bot~parm1
	end
	send "D"
	waitOn "Citadel treasury contains "
	getWord CURRENTLINE $planet~citadelCash 4
	stripText $planet~citadelCash ","
	stripText $planet~citadelCash "."
	if (($cashToTranfer+$planet~citadelCash) >= $planet~citadel_CASH_MAX)
		setVar $SWITCHBOARD~message "Citadel has too much cash to do transfer (how sad for you)*"
		gosub :SWITCHBOARD~switchboard
		goto :wait_for_command
	end
	send "t t "&$cashToTransfer&"* "
	waiton "credits, and the Treasury"
	setvar $map~value $cashtotransfer
	gosub :map~commas
	setvar $cashtotransfer $map~value
	setVar $SWITCHBOARD~message $cashToTransfer &" credits deposited into citadel.*"
	gosub :SWITCHBOARD~switchboard
	goto :wait_for_command
# ============================== END DEPOSIT (DEP) ==============================


:bankProtections
	gosub :PLAYER~quikstats
	setVar $bot~validPrompts "Citadel"
	gosub :PLAYER~CHECKSTARTINGPROMPT
	if ($bot~parm1 = "ss")
		setVar $bot~parm1 ""
	end
	isNumber $test $bot~parm1 
	if (($test = FALSE) and ($bot~parm1 <> ""))
		setVar $SWITCHBOARD~message "Cash entered is not a number, try again.*" 
		gosub :SWITCHBOARD~switchboard
		goto :wait_for_command  
	end
return


:wait_for_command
	setVar $HELP~HELP[1]  $HELP~TAB&"dep {cash to deposit} "
	setVar $HELP~HELP[2]  $HELP~TAB&"  Deposits cash into citadel treasury."
	setVar $HELP~HELP[3]  $HELP~TAB&"        default is max credits possible"
	gosub :HELP~HELPFILE
halt


# includes:
include "source\include\map"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
