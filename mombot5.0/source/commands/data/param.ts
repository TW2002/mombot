gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"   PARAM - Displays sector parameters saved in game."
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"   - param [sector]  "
setvar $help~help[4]  $help~tab&"        Displays all bot sector parameters "
setvar $help~help[5]  $help~tab&"          (FIGSEC, MINESEC, LIMPSEC, MSLSEC, BUSTED, PSECTOR)"
setvar $help~help[6]  $help~tab&"   "
setvar $help~help[7]  $help~tab&"   - param [param]"
setvar $help~help[8]  $help~tab&"        Displays all sectors where that param is non-zero/non-blank"
setvar $help~help[9]  $help~tab&"   "
gosub :help~helpfile

setvar $getallparamsfromsectors false
if ($bot~parm1 = "")
	setvar $bot~parm1 currentsector
end
isnumber $test $bot~parm1
if ($test = true)
	if (($bot~parm1 <= 0) or ($bot~parm1 > sectors))
		setvar $bot~parm1 currentsector
	end
	if ($switchboard~self_command <> true) or ($bot~silent_running <> true)
		setvar $switchboard~self_command 2
	end
	listsectorparameters $bot~parm1 $bot~parms
	setvar $i 1
	setvar $switchboard~message "  *Displaying sector parameters for sector "&$bot~parm1&": *"

	# HAMMER - 23/10 - Added this because EP HAGGLE creates so many prams
	# that the BUST / FAKE Bust params weren't showing
	# So probably a bug in TWX...

	getsectorparameter $bot~parm1 "BUSTED" $bustthissec
	if ($bustthissec = true)
		setvar $switchboard~message $switchboard~message&"  BUSTED: 1*"
	end
	getsectorparameter $bot~parm1 "FAKEBUST" $fakebust
	if ($fakebust = true)
		setvar $switchboard~message $switchboard~message&"  FAKEBUST: 1*"
	end
	while ($i <= $bot~parms)
		getsectorparameter $bot~parm1 $bot~parms[$i] $check
		if ($bot~parms[$i] = "BUSTED")
		elseif ($bot~parms[$i] = "FAKEBUST")
		else
			setvar $switchboard~message $switchboard~message&"  "&$bot~parms[$i]&": "&$check&"*"
		end
		add $i 1
	end
	gosub :switchboard~switchboard
	goto :wait_for_command

else
	setvar $i 1
	setvar $count 0
	uppercase $bot~parm1
	setvar $output "Displaying sectors for "&$bot~parm1&": *"
	if ($bot~parm1 <> "PSECTOR")
		while ($i <= sectors)
			getsectorparameter $i $bot~parm1 $check
			getsectorparameter $i "FIGSEC" $isfigged
			if (($check <> "") and ($check <> "0"))
				if ($isfigged = true)
					setvar $output $output&"["&$i&"] "
				else
					setvar $output $output&$i&" "
				end
				add $count 1
			end
			add $i 1
		end
	else
		while ($i <= 2000)
			getsectorparameter $i "PSECTOR" $check
			if (($check <> "") and ($check <> "0"))
				setvar $output $output&" Planet #"&$i&"==>["&$check&"]*"
				add $count 1
			end
			add $i 1
		end
	end

	if ($switchboard~self_command <> true) or ($bot~silent_running <> true)
		setvar $switchboard~self_command 2
	end

	setvar $switchboard~message $output&"*Total Count: "&$count&"*"
	gosub :switchboard~switchboard
	goto :wait_for_command

end

:wait_for_command
halt

:killthetriggers
killalltriggers
return

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
