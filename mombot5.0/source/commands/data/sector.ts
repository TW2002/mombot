gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Displays sector data and saved sector parameters."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  sector {sector}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   {sector} - sector to display. Defaults to current sector."
setvar $help~help[6] $help~tab&"   Shows map output plus all sector parameters stored for that sector."
gosub :help~helpfile

setvar $i $bot~parm1
isnumber $test $i
if ($test <> true)
	setvar $i currentsector
end
if (($i > sectors) or ($i < 1))
	setvar $i currentsector
end
setvar $map~displaysector $i
gosub :map~displaysector
setvar $switchboard~message $map~output
listsectorparameters $i $bot~parms
setvar $j 1
setvar $switchboard~message $switchboard~message&"     *  "
while ($j <= $bot~parms)
	getsectorparameter $i $bot~parms[$j] $check
	setvar $switchboard~message $switchboard~message&"    "&$bot~parms[$j]&": "&$check&"*"
	add $j 1
end

gosub :switchboard~switchboard
halt

# includes:
include "source\include\map"
include "source\include\loadvars"
include "source\include\switchboard.ts"
include "source\include\help"
