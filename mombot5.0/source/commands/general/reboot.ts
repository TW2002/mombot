	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
		
	setVar $HELP~HELP[1] $HELP~TAB&"Reboot"
	setVar $HELP~HELP[2] $HELP~TAB&"  - Kill bot and restart it"
	gosub :HELP~HELPFILE

	if (ISNATIVEBOT = TRUE)
		setVar $SWITCHBOARD~message "Rebooting native Mombot..*"
		gosub :SWITCHBOARD~switchboard
		nativebot reboot
		halt
	end

	setVar $i 1
	setVar $found FALSE
	setVar $rebooted FALSE
	setVar $SWITCHBOARD~message "Rebooting Mombot..*"
	gosub :SWITCHBOARD~switchboard
	setdelaytrigger waitforrebootlist :listokaynow 1500
	pause
	:listokaynow
	listActiveScripts $scripts
	while ($i <= $scripts)
		getWordPos "<><><>"&$scripts[$i] $pos "<><><>mombot"
		if ($pos > 0)
			if ($found = FALSE)
				setVar $boot_this $scripts[$i]
				setVar $found TRUE
			end
			stop $scripts[$i]
		end
		add $i 1
	end
	if ($FOUND = FALSE)
		setVar $SWITCHBOARD~message "No mombot script found to reboot.*"
		gosub :SWITCHBOARD~switchboard
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
