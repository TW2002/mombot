logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~limp_count_file

setvar $help~help[1] $help~tab&"Refreshes Deployed Limpet List"
setvar $help~help[2] $help~tab&"  - Will show difference since last command was run."
gosub :help~helpfile

setvar $switchboard~message "Limpet Report starting up!*"
gosub :switchboard~switchboard

loadvar $limp_count_file
loadvar $bot~limp_file

:limps
gosub :player~currentprompt
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")
	goto :start_limps
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

:start_limps
gosub :player~turnoffansi
setvar $switchboard~message "Loading current limpet locations. . .*"
gosub :switchboard~switchboard
fileexists $gfile_chk $bot~limp_count_file
if ($gfile_chk = 1)
	read $bot~limp_count_file $previouscount 1
else
	setvar $previouscount 0
end
gosub :refreshlimps
gosub :player~turnonansi
setvar $percent (($count * 100) / sectors)
setvar $gridchange ($count - $previouscount)
if ($gridchange > 0)
	setvar $gridchange "+"&$gridchange
end

setvar $player~limpetsgridded true
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~landingsub
end
if ($switchboard~self_command = false)
	setvar $switchboard~self_command 2
end
setvar $switchboard~message "          - Limpet Grid Report -*          - "&$count&" sectors, "&$personalcount&" personal. ("&$percent&"%) ("&$gridchange&" Change)*          - Activated  Limpet  Scan*            *             Sector    Personal/Corp*            ========================*"&$limpetoutput&"*"
gosub :switchboard~switchboard

halt

:refreshlimps
gosub :mines~readlimplist
setvar $count $mines~count
setvar $personalcount $mines~personalcount
setvar $limpetoutput $mines~limpetoutput
return

# includes:
include "source\include\mines"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
