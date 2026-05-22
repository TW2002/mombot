logging "OFF"
gosub :loadvars~loadvars

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
	if (($player~current_sector > 10) and ($player~current_sector <> $map~stardock))
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
