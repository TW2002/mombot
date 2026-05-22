gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Reboot"
setvar $help~help[2] $help~tab&"  - Kill bot and restart it"
gosub :help~helpfile

if (isnativebot = true)
	setvar $switchboard~message "Rebooting native Mombot..*"
	gosub :switchboard~switchboard
	nativebot reboot
	halt
end

setvar $i 1
setvar $found false
setvar $rebooted false
setvar $switchboard~message "Rebooting Mombot..*"
gosub :switchboard~switchboard
setdelaytrigger waitforrebootlist :listokaynow 1500
pause

:listokaynow
listactivescripts $scripts
while ($i <= $scripts)
	getwordpos "<><><>"&$scripts[$i] $pos "<><><>mombot"
	if ($pos > 0)
		if ($found = false)
			setvar $boot_this $scripts[$i]
			setvar $found true
		end
		stop $scripts[$i]
	end
	add $i 1
end
if ($found = false)
	setvar $switchboard~message "No mombot script found to reboot.*"
	gosub :switchboard~switchboard
	halt
end
setdelaytrigger waitforreboot :okaynow 3000
pause

:okaynow
load "scripts\"&$bot~mombot_directory&"\"&$boot_this
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
