logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~limp_count_file
loadvar $bot~armid_count_file
loadvar $bot~limp_file
loadvar $bot~armid_file

setvar $help~help[1]  $help~tab&" update {figs} {limps} {armids} {cim}"
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"     Checks deployment lists and sets sector"
setvar $help~help[4]  $help~tab&"     parameters.  Shows differences since last"
setvar $help~help[5]  $help~tab&"     update"
setvar $help~help[6]  $help~tab&"     "
setvar $help~help[7]  $help~tab&"     {figs} - fighter refresh"
setvar $help~help[8]  $help~tab&"    {limps} - limpet refresh, including active"
setvar $help~help[9]  $help~tab&"   {armids} - armid refresh"
setvar $help~help[10] $help~tab&"      {cim} - will refresh port and warp info"
setvar $help~help[11] $help~tab&"             "
setvar $help~help[12] $help~tab&"    update {cim} {upgrade level} {warps}   "
setvar $help~help[13] $help~tab&"                             "
setvar $help~help[14] $help~tab&"     Options:"
setvar $help~help[15] $help~tab&"           {upgrade level} - Amount on port to  "
setvar $help~help[16] $help~tab&"                             be considered upgraded"
setvar $help~help[17] $help~tab&"                             (default 10,000)"
setvar $help~help[18] $help~tab&"                                            "
setvar $help~help[19] $help~tab&"                  {warps}  - Perform warp data  "
setvar $help~help[20] $help~tab&"                             instead of port CIM"
setvar $help~help[21] $help~tab&"                             "
setvar $help~help[22] $help~tab&"     Examples:            "
setvar $help~help[23] $help~tab&"            >update figs limps armids      "
setvar $help~help[24] $help~tab&"            >update                 "
setvar $help~help[25] $help~tab&"            >update cim warps     "
setvar $help~help[26] $help~tab&"            >figs             "
setvar $help~help[27] $help~tab&"            >limps            "
setvar $help~help[28] $help~tab&"            >cim 10000       "

gosub :help~helpfile

setvar $switchboard~message "Update starting up!*"
gosub :switchboard~switchboard

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

gosub  :player~currentprompt
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")

elseif ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
elseif ($startinglocation = "Planet")
	gosub :planet~getplanetinfo
	send "q"
else
	setvar $switchboard~message "Unknown Prompt*"
	gosub :switchboard~switchboard
	halt
end

if ($cim)
	gosub :update~cim
	if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
		gosub :planet~landingsub
	end
	gosub :player~quikstats
	if ($startinglocation = "Citadel") and ($player~current_prompt = "Planet")
		send "c"
	end
else
	gosub :player~turnoffansi
	if ($all or $fighter)
		gosub :update~fighters
	end
	if ($all or $armid)
		gosub :mines~updatearmids
	end
	if ($all or $limpet)
		gosub :mines~updatelimps
	end
	gosub :player~turnonansi
	if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
		gosub :planet~landingsub
		gosub :player~quikstats
		if ($startinglocation = "Citadel") and ($player~current_prompt = "Planet")
			send "c"
		end
	end

	setvar $switchboard~message ""
	if ($all or $fighter)
		gosub :update~report
	end
	if ($all or $armid)
		gosub :mines~reportarmids
	end
	if ($all or $limpet)
		gosub :mines~reportlimps
	end
	if ($switchboard~self_command = false)
		setvar $switchboard~self_command 2
	end

	gosub :switchboard~switchboard
end

halt
#===================================== END REFRESH LIMPS ========================================

#INCLUDES:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\update"
include "source\include\help"
include "source\include\switchboard.ts"
