logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Refreshes Deployed Fighter List"
setvar $help~help[2] $help~tab&"  - Will show difference since last command was run."
gosub :help~helpfile

setvar $switchboard~message "Fighter Report starting up!*"
gosub :switchboard~switchboard

:figs
gosub :player~currentprompt
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")
	goto :start_figs
elseif ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
elseif ($startinglocation = "Planet")
	send "d"
	gosub :planet~getplanetinfo
	send "q"
else
	setvar $switchboard~message "Unknown Prompt*"
	halt
end

:start_figs
gosub :player~turnoffansi
setvar $switchboard~message "Loading current fighter locations. . .*"
gosub :switchboard~switchboard
getsectorparameter 2 "FIG_COUNTR" $previouscount
getsectorparameter 2 "FUEL_COUNT" $previousfuelcount
getsectorparameter 2 "ORG_COUNT" $previousorgcount
getsectorparameter 2 "EQU_COUNT" $previousequipcount
getsectorparameter 2 "EQS_COUNT" $previousequipsellcount
getsectorparameter 2 "FB_COUNT" $previousfuelbuycount

if ($previouscount = "")
	setvar $previouscount 0
end
if ($previousfuelcount = "")
	setvar $previousfuelcount 0
end
if ($previousorgcount = "")
	setvar $previousorgcount 0
end
if ($previousequipcount = "")
	setvar $previousequipcount 0
end
if ($previousequipsellcount = "")
	setvar $previousequipsellcount 0
end
if ($previousfuelbuycount = "")
	setvar $previousfuelbuycount 0
end
gosub :refreshfighters
gosub :player~turnonansi
if ($count <> 0)
	setvar $percent (($count * 100) / sectors)
	setvar $1PERCENT (($1SCOUNT * 100) / $count)
	setvar $2PERCENT (($2SCOUNT * 100) / $count)
	setvar $3PERCENT (($3SCOUNT * 100) / $count)
	setvar $4PERCENT (($4SCOUNT * 100) / $count)
	setvar $5PERCENT (($5SCOUNT * 100) / $count)
	setvar $6PERCENT (($6SCOUNT * 100) / $count)
	setvar $?percent (($?scount * 100) / $count)
end
setvar $gridchange ($count - $previouscount)
if ($gridchange > 0)
	setvar $gridchange "+"&$gridchange
end
setvar $gridfuelchange ($upgradedfuelcount - $previousfuelcount)
if ($gridfuelchange > 0)
	setvar $gridfuelchange "+"&$gridfuelchange
end
setvar $gridorgchange ($upgradedorgcount - $previousorgcount)
if ($gridorgchange > 0)
	setvar $gridorgchange "+"&$gridorgchange
end
setvar $gridequipchange ($upgradedequipcount - $previousequipcount)
if ($gridequipchange > 0)
	setvar $gridequipchange "+"&$gridequipchange
end
setvar $gridequipsellchange ($upgradedequipsellcount - $previousequipsellcount)
if ($gridequipsellchange > 0)
	setvar $gridequipsellchange "+"&$gridequipsellchange
end
setvar $gridfuelbuychange ($upgradedfuelbuycount - $previousfuelbuycount)
if ($gridfuelbuychange > 0)
	setvar $gridfuelbuychange "+"&$gridfuelbuychange
end

setvar $inputvariable $1SCOUNT
gosub :player~formatnumberforspaces
setvar $1SCOUNTFORMATTED $outputvariable
setvar $inputvariable $2SCOUNT
gosub :player~formatnumberforspaces
setvar $2SCOUNTFORMATTED $outputvariable
setvar $inputvariable $3SCOUNT
gosub :player~formatnumberforspaces
setvar $3SCOUNTFORMATTED $outputvariable
setvar $inputvariable $4SCOUNT
gosub :player~formatnumberforspaces
setvar $4SCOUNTFORMATTED $outputvariable
setvar $inputvariable $5SCOUNT
gosub :player~formatnumberforspaces
setvar $5SCOUNTFORMATTED $outputvariable
setvar $inputvariable $6SCOUNT
gosub :player~formatnumberforspaces
setvar $6SCOUNTFORMATTED $outputvariable

setvar $inputvariable $1PERCENT
gosub :player~formatpercentagesforspaces
setvar $1PERCENTFORMATTED $outputvariable
setvar $inputvariable $2PERCENT
gosub :player~formatpercentagesforspaces
setvar $2PERCENTFORMATTED $outputvariable
setvar $inputvariable $3PERCENT
gosub :player~formatpercentagesforspaces
setvar $3PERCENTFORMATTED $outputvariable
setvar $inputvariable $4PERCENT
gosub :player~formatpercentagesforspaces
setvar $4PERCENTFORMATTED $outputvariable
setvar $inputvariable $5PERCENT
gosub :player~formatpercentagesforspaces
setvar $5PERCENTFORMATTED $outputvariable
setvar $inputvariable $6PERCENT
gosub :player~formatpercentagesforspaces
setvar $6PERCENTFORMATTED $outputvariable

setvar $figsgridded true
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~landingsub
end

send "'*{"&$switchboard~bot_name&"}*          - Fighter Grid Report -*          - "&$count&" sectors, "&$personalcount&" personal. ("&$percent&"%) ("&$gridchange&" Change)*          - T: "&$tollcount&"  O: "&$offcount&"  D:"&$defcount&"*          - DE: "&$1SCOUNTFORMATTED&""&$1PERCENTFORMATTED&" 2S: "&$2SCOUNTFORMATTED&""&$2PERCENTFORMATTED&" 3S: "&$3SCOUNTFORMATTED&""&$3PERCENTFORMATTED&"*          - 4S: "&$4SCOUNTFORMATTED&""&$4PERCENTFORMATTED&" 5S: "&$5SCOUNTFORMATTED&""&$5PERCENTFORMATTED&" 6S: "&$6SCOUNTFORMATTED&""&$6PERCENTFORMATTED&"*          - Upgraded Sxx: "&$upgradedfuelcount&" ("&$gridfuelchange&" Change)*          - Upgraded xBx: "&$upgradedorgcount&" ("&$gridorgchange&" Change)*          - Upgraded xxB: "&$upgradedequipcount&" ("&$gridequipchange&" Change)*          - Upgraded xxS: "&$upgradedequipsellcount&" ("&$gridequipsellchange&" Change)*          - Upgraded Bxx: "&$upgradedfuelbuycount&" ("&$gridfuelbuychange&" Change)**"
halt

:refreshfighters
:readfighterlist
gosub :update~readfighterlist
setvar $count $update~count
setvar $personalcount $update~personalcount
setvar $1SCOUNT $update~1scount
setvar $2SCOUNT $update~2scount
setvar $3SCOUNT $update~3scount
setvar $4SCOUNT $update~4scount
setvar $5SCOUNT $update~5scount
setvar $6SCOUNT $update~6scount
setvar $?scount $update~?scount
setvar $tollcount $update~tollcount
setvar $offcount $update~offcount
setvar $defcount $update~defcount
setvar $upgradedequipcount $update~upgradedequipcount
setvar $upgradedequipsellcount $update~upgradedequipsellcount
setvar $upgradedfuelbuycount $update~upgradedfuelbuycount
setvar $upgradedorgcount $update~upgradedorgcount
setvar $upgradedfuelcount $update~upgradedfuelcount
return

# includes:
include "source\include\planet"
include "source\include\update"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
