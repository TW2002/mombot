logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~armid_count_file

setvar $help~help[1] $help~tab&"Refreshes Deployed Armid List"
setvar $help~help[2] $help~tab&"  - Will show difference since last command was run."
gosub :help~helpfile

setvar $switchboard~message "Armid Report starting up!*"
gosub :switchboard~switchboard

loadvar $armid_count_file
loadvar $bot~armid_file

:armids
gosub :player~currentprompt
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")
	goto :start_armids
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

:start_armids
gosub :player~turnoffansi
setvar $switchboard~message "Loading current armid locations. . .*"
gosub :switchboard~switchboard
fileexists $gfile_chk $bot~armid_count_file
if ($gfile_chk = 1)
	read $bot~armid_count_file $previouscount 1
else
	setvar $previouscount 0
end
gosub :refresharmids
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
setvar $switchboard~message "          - Armid Grid Report -*          - "&$count&" sectors, "&$personalcount&" personal. ("&$percent&"%) ("&$gridchange&" Change)**"
gosub :switchboard~switchboard

halt

:refresharmids
gosub :mines~readarmidlist
setvar $count $mines~count
setvar $personalcount $mines~personalcount
return

# includes:
include "source\include\mines"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
