gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"Set sector parameters"
setvar $help~help[2]  $help~tab&"      setparam [parameter] [value] {sector} "
setvar $help~help[3]  $help~tab&"       "
setvar $help~help[4]  $help~tab&"Usage: "
setvar $help~help[5]  $help~tab&"       >setparam BUSTED 1 45"
setvar $help~help[6]  $help~tab&"       >setparam FIGSEC 1 "
setvar $help~help[7]  $help~tab&"        "
setvar $help~help[8]  $help~tab&"       Note: assumes current sector if sector isn't entered"
setvar $help~help[9]  $help~tab&"       "
setvar $help~help[10] $help~tab&"       Original Author: Deign"
gosub :help~helpfile

setvar $name $bot~parm1
uppercase $name
if ($name = "")
	setvar $switchboard~message "The name of the parameter to set must be defined.*"
	gosub :switchboard~switchboard
	halt
end

setvar $value $bot~parm2
uppercase $value
if ($value = "TRUE")
	setvar $value true
end
if ($value = "FALSE")
	setvar $value false
end

if ($bot~parm3 <> "")
	setvar $hub $bot~parm3
else
	setvar $hub currentsector
end

setsectorparameter $hub $name $value
setvar $switchboard~message "Parameter "&$name&" has been set to "&$value&" in sector "&$hub&".*"
gosub :switchboard~switchboard

halt
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
