gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~port_max

setvar $help~help[1]   $help~tab&"  port {build/create} {destroy/kill} {upgrade/max}                "
setvar $help~help[2]   $help~tab&"  Options:"
setvar $help~help[3]   $help~tab&"     port build {port name} "
setvar $help~help[4]   $help~tab&"       - create sbb port in sector if possible"
setvar $help~help[5]   $help~tab&"         {port name} - Name of port to create "
setvar $help~help[6]   $help~tab&"                   default: Mind ()ver Matter "
setvar $help~help[7]   $help~tab&"      "
setvar $help~help[8]   $help~tab&"     port destroy "
setvar $help~help[9]   $help~tab&"       - blow up port in sector if possible"
setvar $help~help[10]  $help~tab&"      "
setvar $help~help[11]  $help~tab&"     port upgrade {f} {o} {e} {a} {b} {noexp}"
setvar $help~help[12]  $help~tab&"       - upgrade port if possible, using treasury if available"
setvar $help~help[13]  $help~tab&"             {f} - upgrade fuel"
setvar $help~help[14]  $help~tab&"             {o} - upgrade organics"
setvar $help~help[15]  $help~tab&"             {e} - upgrade equipment"
setvar $help~help[16]  $help~tab&"             {a} - upgrade all products"
setvar $help~help[17]  $help~tab&"             {b} - upgrade products that port buys"
setvar $help~help[18]  $help~tab&"         {noexp} - upgrade without experience increase"
setvar $help~help[19]  $help~tab&"                   default: s/b/b upgraded"
gosub :help~helpfile

setvar $bot~bot_name $switchboard~bot_name

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "You must run port helper from command or citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
loadvar $planet~planet

setvar $i 1
setvar $line $bot~user_command_line
setvar $bot~user_command_line ""
setvar $nothing "<>!<>junk<>!<>!"
getword $line $word 1 $nothing

while ($word <> $nothing)
	getword $line $word $i $nothing
	if (($word = "?") or ($word = "help"))
		setvar $bot~parm1 "?"
		gosub :help~helpfile
		halt
	end
	if ($word <> $nothing)
		setvar $bot~user_command_line $bot~user_command_line&" "&$word
	end
	add $i 1
end

if (($bot~parm1 = "build") or ($bot~parm1 = "create"))
	gosub :port~buildport
	halt
elseif (($bot~parm1 = "destroy") or ($bot~parm1 = "kill"))
	gosub :port~destroyport
	halt
elseif (($bot~parm1 = "max") or ($bot~parm1 = "upgrade"))
	gosub :port~upgradeport
	halt
else
	setvar $switchboard~message "Option used for port helper not recognized.  Try build/create/destroy/kill/upgrade/max options.*"
	gosub :switchboard~switchboard
	halt
end

halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\port"
include "source\include\help"
include "source\include\switchboard.ts"
