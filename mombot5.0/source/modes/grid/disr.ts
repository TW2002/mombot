gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"DisR - Disrupt Mines in Adjacent Sectors"
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"Usage: >disr {burst} {nscan}"
setvar $help~help[7]  $help~tab&"       >disr [sector] {burst} {nscan}"
setvar $help~help[4]  $help~tab&"    "
setvar $help~help[4]  $help~tab&"If the first parameter is not a sector, all adjacents will be disrupted."
setvar $help~help[4]  $help~tab&"    "
setvar $help~help[5]  $help~tab&"Options: "
setvar $help~help[6]  $help~tab&"        {burst} - Sends only 1 Disruptor into each Sector"
setvar $help~help[7]  $help~tab&"        {nscan} - Do Not Perform Holo Scan"
gosub :help~helpfile

isnumber $tst $parm1
if ($tst = 0)
	setvar $target 0
else
	setvar $target $parm1
end

getwordpos $bot~user_command_line $pos "nscan"
if ($pos > 0)
	setvar $mines~scanit false
else
	setvar $mines~scanit true
end

getwordpos $bot~user_command_line $pos "burst"
if ($pos > 0)
	setvar $mines~bursting true
else
	setvar $mines~bursting false
end

if (($target < 11) and ($target <> 0)) or (($map~stardock > 11) and ($target = $map~stardock))
	setvar $switchboard~message "DisR - Invalid Target!"
	gosub :switchboard~switchboard
	halt
	setvar $target $parm1
end

gosub :player~quikstats

#if ($PLAYER~MINE_DISRUPTORS = 0)
#  setvar $switchboard~message "No Disruptors On Board!*"
#  gosub :switchboard~switchboard
#  return
#end

gosub :mines~disrupt
if ($mines~result <> "")
	setvar $switchboard~message $mines~result & "*"
	gosub :switchboard~switchboard
end
halt

include "source\include\player"
include "source\include\help"
include "source\include\mines"
include "source\include\loadvars"
include "source\include\switchboard"
