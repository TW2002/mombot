	logging off
	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadvar $bot~LIMP_COUNT_FILE
	loadVar $bot~ARMID_COUNT_FILE
	loadVar $bot~LIMP_FILE
	loadVar $bot~ARMID_FILE

	setVar $HELP~HELP[1]  $HELP~TAB&" update {figs} {limps} {armids} {cim}"
	setVar $HELP~HELP[2]  $HELP~TAB&"   "
	setVar $HELP~HELP[3]  $HELP~TAB&"     Checks deployment lists and sets sector"
	setVar $HELP~HELP[4]  $HELP~TAB&"     parameters.  Shows differences since last"
	setVar $HELP~HELP[5]  $HELP~TAB&"     update"
	setVar $HELP~HELP[6]  $HELP~TAB&"     "
	setVar $HELP~HELP[7]  $HELP~TAB&"     {figs} - fighter refresh"
	setVar $HELP~HELP[8]  $HELP~TAB&"    {limps} - limpet refresh, including active"
	setVar $HELP~HELP[9]  $HELP~TAB&"   {armids} - armid refresh"
	setVar $HELP~HELP[10] $HELP~TAB&"      {cim} - will refresh port and warp info"
	setVar $HELP~HELP[11] $HELP~TAB&"             "
	setVar $HELP~HELP[12] $HELP~TAB&"    update {cim} {upgrade level} {warps}   "
	setVar $HELP~HELP[13] $HELP~TAB&"                             "
	setVar $HELP~HELP[14] $HELP~TAB&"     Options:"
	setVar $HELP~HELP[15] $HELP~TAB&"           {upgrade level} - Amount on port to  "
	setVar $HELP~HELP[16] $HELP~TAB&"                             be considered upgraded"
	setVar $HELP~HELP[17] $HELP~TAB&"                             (default 10,000)"
	setVar $HELP~HELP[18] $HELP~TAB&"                                            "
	setVar $HELP~HELP[19] $HELP~TAB&"                  {warps}  - Perform warp data  "
	setVar $HELP~HELP[20] $HELP~TAB&"                             instead of port CIM"
	setVar $HELP~HELP[21] $HELP~TAB&"                             "
	setVar $HELP~HELP[22] $HELP~TAB&"     Examples:            "
	setVar $HELP~HELP[23] $HELP~TAB&"            >update figs limps armids      "
	setVar $HELP~HELP[24] $HELP~TAB&"            >update                 "
	setVar $HELP~HELP[25] $HELP~TAB&"            >update cim warps     "
	setVar $HELP~HELP[26] $HELP~TAB&"            >figs             "
	setVar $HELP~HELP[27] $HELP~TAB&"            >limps            "
	setVar $HELP~HELP[28] $HELP~TAB&"            >cim 10000       "

	gosub :HELP~HELPFILE

	setvar $SWITCHBOARD~MESSAGE "Update starting up!*"
	gosub :SWITCHBOARD~SWITCHBOARD

	
# ============================== START REFRESH LIMPETS (LIMPS) ==============================
	

	getwordpos " "&$bot~user_command_line&" " $pos " f"
	if ($pos > 0)
		setvar $fighter true
	else
		setvar $fighter false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " l"
	if ($pos > 0)
		setvar $limpet true
	else
		setvar $limpet false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " ar"
	getwordpos " "&$bot~user_command_line&" " $pos2 "mine"
	if (($pos > 0) or ($pos2 > 0))
		setvar $armid true
	else
		setvar $armid false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " cim "
	if ($pos > 0)
		setvar $cim true
	else
		setvar $cim false
	end

	if (($fighter <> true) and ($armid <> true) and ($limpet <> true))
		setvar $all true
	end

	gosub  :player~currentPrompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation = "Command")

	elseif ($startingLocation = "Citadel")
		send "q"
		gosub :PLANET~getPlanetInfo
		send "q"
	elseif ($startingLocation = "Planet")
		gosub :PLANET~getPlanetInfo
		send "q"
	else
		setVar $SWITCHBOARD~message "Unknown Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	
	if ($cim)
		gosub :update~cim
		if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
			gosub :PLANET~landingsub
		end
	else
		gosub :PLAYER~turnOffAnsi
		if ($all or $fighter)
			gosub :update~fighters
		end
		if ($all or $armid)
			gosub :mines~updateArmids
		end
		if ($all or $limpet)
			gosub :mines~updateLimps
		end
		gosub :PLAYER~turnOnAnsi
		if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
			gosub :PLANET~landingsub
		end

		setvar $switchboard~message ""
		if ($all or $fighter)
			gosub :update~report
		end
		if ($all or $armid)
			gosub :mines~reportArmids
		end
		if ($all or $limpet)
			gosub :mines~reportLimps
		end
		if ($SWITCHBOARD~self_command = FALSE)
			setVar $SWITCHBOARD~self_command 2
		end

		gosub :SWITCHBOARD~switchboard
	end



halt
#===================================== END REFRESH LIMPS ========================================



#INCLUDES:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\update"
include "source\include\help"
include "source\include\switchboard.ts"
