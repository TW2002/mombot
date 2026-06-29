logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Exit/enter cycles to clear mines or fighters."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  xenter {count} {fill}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   {count} - number of exit/enter cycles. Defaults to 1."
setvar $help~help[6] $help~tab&"   {fill} - top off fighters after each cycle."
gosub :help~helpfile

:xenter~run
isnumber $xenter~test $bot~parm1
if ($xenter~test = false)
	setvar $bot~parm1 1
else
	if ($bot~parm1 <= 0)
		setvar $bot~parm1 1
	end
end
getwordpos $bot~user_command_line $xenter~pos "fill"
if ($xenter~pos > 0)
	setvar $xenter~refill true
else
	setvar $xenter~refill false
end

:xenter~runloop
setvar $xenter~i 1
while ($xenter~i <= $bot~parm1)
	gosub :xenter~xenter
		if (($xenter~startinglocation = "Command") and ($player~current_sector > 10) and ($player~current_sector <> $map~stardock))
		if ($xenter~refill = true)
			gosub :player~topoff
		else
			if ($xenter~i = $bot~parm1)
				send "f z1* z c d * "
			end
		end
	end
	add $xenter~i 1
end

:xenter~done
killalltriggers
gosub :player~quikstats
if ($bot~parm1 > 1)
	setvar $switchboard~message "Exit Enter - "&$bot~parm1&" times completed.*"
else
	setvar $switchboard~message "Exit Enter.*"
end
if ($bot~silent_running <> true)
	setvar $switchboard~self_command false
end
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\xenter"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard"
include "source\include\help"
