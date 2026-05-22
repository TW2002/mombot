# Beam File

loadvar $switchboard~bot_name
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"   Beam Data to Corp Mate"
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"   beam [file/param] [filename.txt/param] [botname] "
setvar $help~help[4]  $help~tab&"                                 {override} {delete}"
setvar $help~help[5]  $help~tab&"   File should be in mombot game directory"
setvar $help~help[6]  $help~tab&"   "
setvar $help~help[7]  $help~tab&"   {override} - copy over their existing file "
setvar $help~help[8]  $help~tab&"   {delete}   - delete their existing params "
setvar $help~help[9]  $help~tab&"   "
setvar $help~help[10]  $help~tab&"   >beam file ports.txt ham"
setvar $help~help[11]  $help~tab&"   "
setvar $help~help[12]  $help~tab&"   >beam param targets ham"

gosub :help~helpfile

setvar $recbot ""
if ($bot~parm1 = "receive")
	setvar $filerec $bot~parm2
	setvar $fullfile $bot~folder&"/"&$bot~parm2
	if (($filerec <> "0") and ($filerec <> ""))
		setvar $testfile $filerec

		gosub :testtxtfile
		fileexists $exists $fullfile
		if (($exists) and ($bot~parm3 <> "override"))
			setvar $switchboard~message "File Exists " & $filerec & ", please include override.*"
			gosub :switchboard~switchboard
			halt
		elseif ($exists)
			delete $fullfile
		end
		setvar $switchboard~message "Ready to Receive " & $filerec & ". BEAMFILE*"
		gosub :switchboard~switchboard

		goto :receivefile
		halt
	end
elseif ($bot~parm1 = "setparam")
	setvar $paramname $bot~parm2
	if ($bot~parm3 = "delete")
		setvar $scrubparams 1
	end
	uppercase $paramname
	if (($paramname <> "0") and ($paramname <> ""))

		setvar $switchboard~message "Ready to Receive " & $paramname & ". BEAMPARAM*"
		gosub :switchboard~switchboard

		goto :receiveparam
		halt
	end
elseif ($bot~parm1 = "file")
	if ($bot~parm2 = "0")
		setvar $switchboard~message "Please specify file to send.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $sendfile $bot~folder&"/"&$bot~parm2
		setvar $sendname $bot~parm2
		setvar $testfile $bot~parm2
		gosub :testtxtfile
		fileexists $exists $sendfile
		if ($exists)
			if ($bot~parm3 <> "")
				gosub :checkotherbot
			else
				setvar $switchboard~message "Please specify the bot name receiving file.*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $switchboard~message "Can not find file: " & $sendfile & "*"
			gosub :switchboard~switchboard
			halt
		end
	end
	goto :dofilebeam
elseif ($bot~parm1 = "param")

	if ($bot~parm2 = "0")
		setvar $switchboard~message "Please specify param to send.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $paramname $bot~parm2
		uppercase $paramname
		setvar $parampairs 0
		setvar $numparams 0

		gosub :getparampairs

		if ($numparams = 0)
			setvar $switchboard~message "You have nothing matching this parameter: " & $paramname & ".*"
			gosub :switchboard~switchboard
			halt
		else
			setvar $switchboard~message "Found " & $numparams &" sectors Param: " & $paramname & ".*"
			gosub :switchboard~switchboard
		end
		if ($bot~parm3 <> "")
			gosub :checkotherbot
		else
			setvar $switchboard~message "Please specify the bot name receiving params.*"
			gosub :switchboard~switchboard
			halt
		end

	end
	if ($bot~parm4 = "delete")
		setvar $scrubparams 1
	end
	goto :doparambeam
end

halt

:checkotherbot
send "'" $bot~parm3 " qss*"
settextlinetrigger botfound :botfound "[General] {" & $bot~parm3 & "}"
setdelaytrigger     timeout1 :timeout1 		8000
pause

:timeout1
killalltriggers
setvar $switchboard~message "Receive Bot Not Found.*"
gosub :switchboard~switchboard
halt

:botfound
killalltriggers
settextlinetrigger genfound :genfound "Bot Mode :General"
setdelaytrigger     timeout2 :timeout2 		8000
pause

:timeout2
killalltriggers
setvar $switchboard~message "Receive Bot Needs to be in General Mode.*"
gosub :switchboard~switchboard
halt

:genfound
killalltriggers
setvar $recbot $bot~parm3
return

:doparambeam
if ($scrubparams = 1)
	send "'" $recbot " beam setparam " $paramname " delete*"
else
	send "'" $recbot " beam setparam " $paramname " *"
end
settextlinetrigger beamready1 :beamready1 "BEAMPARAM"
setdelaytrigger timeoutbeam1 :timeoutbeam1 8000
pause

:timeoutbeam1
killalltriggers
setvar $switchboard~message "Failed to get beam start response.*"
gosub :switchboard~switchboard
halt

:beamready1
killalltriggers
gosub :sendparams
setvar $switchboard~message "Param Transfer Complete.*"
gosub :switchboard~switchboard

halt
return

:dofilebeam
if ($bot~parm4 = "override")
	send "'" $recbot " beam receive " $sendname " override*"
else
	send "'" $recbot " beam receive " $sendname " *"
end

settextlinetrigger beamready :beamready "BEAMFILE"
setdelaytrigger timeoutbeam :timeoutbeam 8000
pause

:timeoutbeam
killalltriggers
setvar $switchboard~message "Failed to get beam start response.*"
gosub :switchboard~switchboard
halt

:beamready
killalltriggers
gosub :sendfile
setvar $switchboard~message "File Transfer Complete.*"
gosub :switchboard~switchboard

halt
return

:sendparams
setvar $maxrow 10
setvar $beamendneeded 0
setvar $rowc 1
setvar $i 1

while ($i <= $numparams)
	setvar $line $parampairs[$i]
	setvar $beamendneeded 1
	if ($rowc = 1)
		send "'*[BEAMSTART]*"
	end
	if ($line <> "")
		send "[BSOL]" $line "[BEOL]*"
		add $rowc 1
	end

	if ($rowc = $maxrow)
		send "[BEAMEND]**"
		setvar $rowc 1

		settextlinetrigger beammore2 :beammore2 "[BEAMMORE]"
		setdelaytrigger     timeout5 :timeout5 		8000
		pause

		:timeout5
		killalltriggers
		setvar $switchboard~message "Timed out beaming? uh oh.*"
		gosub :switchboard~switchboard
		halt

		:beammore2
		killalltriggers
		setvar $beamendneeded 0
	end
	add $i 1
end

if ($beamendneeded = 1)
	send "[BEAMEND]**"
end

send "'[BEAMOVER]*"

return

:sendfile
setvar $maxrow 10
setvar $beamendneeded 0
setvar $rowc 1
setvar $i 1

read $sendfile $line $i
while ($line <> eof)
	setvar $beamendneeded 1
	if ($rowc = 1)
		send "'*[BEAMSTART]*"
	end
	if ($line <> "")
		send "[BSOL]" $line "[BEOL]*"
		add $rowc 1
	end
	add $i 1
	if ($rowc = $maxrow)
		send "[BEAMEND]**"
		setvar $rowc 1

		settextlinetrigger beammore :beammore "[BEAMMORE]"
		setdelaytrigger     timeout3 :timeout3 		8000
		pause

		:timeout3
		killalltriggers
		setvar $switchboard~message "Timed out beaming? uh oh.*"
		gosub :switchboard~switchboard
		halt

		:beammore
		killalltriggers
		setvar $beamendneeded 0
	end
	read $sendfile $line $i
end
if ($beamendneeded = 1)
	send "[BEAMEND]**"
end

send "'[BEAMOVER]*"

return

:receiveparam
setvar $paramstore 0
setvar $parami 0

:keepbeaming2
settextlinetrigger beamstart2 :beamstart2 "[BEAMSTART]"
settextlinetrigger beameol2 :beameol2 "[BEOL]"
settextlinetrigger beamend2 :beamend2 "[BEAMEND]"
settextlinetrigger beamover2 :beamover2 "[BEAMOVER]"
setdelaytrigger     timeout6 :timeout6 	8000
pause

:beamstart2
killalltriggers
goto :keepbeaming2

:beameol2
killalltriggers
gettext currentline $stuff "[BSOL]" "[BEOL]"
add $parami 1
setvar $paramstore[$parami] $stuff

goto :keepbeaming2

:beamend2
killalltriggers
send "'[BEAMMORE]*"
goto :keepbeaming2

:beamover2
killalltriggers
setvar $switchboard~message "Processing Params...*"
gosub :switchboard~switchboard

if ($scrubparams = 1)
	setvar $i 1
	while ($i <= sectors)
		setsectorparameter $i $paramname ""
		add $i 1
	end
end
setvar $i 1
while ($i <= $parami)
	setvar $w $paramstore[$i]

	replacetext $w ":" " "
	getword $w $sec 1
	getword $w $p 2

	setsectorparameter $sec $paramname $p
	add $i 1
end
setvar $switchboard~message "You've left me beaming! Thanks for the params.*"
gosub :switchboard~switchboard
halt

:timeout6
killalltriggers
setvar $switchboard~message "Timed out beaming? uh oh.*"
gosub :switchboard~switchboard
halt

return

:receivefile
:keepbeaming
settextlinetrigger beamstart :beamstart "[BEAMSTART]"
settextlinetrigger beameol :beameol "[BEOL]"
settextlinetrigger beamend :beamend "[BEAMEND]"
settextlinetrigger beamover :beamover "[BEAMOVER]"
setdelaytrigger     timeout4 :timeout4 	8000
pause

:beamstart
killalltriggers
goto :keepbeaming

:beameol
killalltriggers
gettext currentline $stuff "[BSOL]" "[BEOL]"
write $fullfile $stuff & "*"
goto :keepbeaming

:beamend
killalltriggers
send "'[BEAMMORE]*"
goto :keepbeaming

:beamover
killalltriggers
setvar $switchboard~message "You've left me beaming! Thanks for the file.*"
gosub :switchboard~switchboard
halt

:timeout4
killalltriggers
setvar $switchboard~message "Timed out beaming? uh oh.*"
gosub :switchboard~switchboard
halt

return

:testtxtfile
replacetext $testfile "." " "
getword $testfile $testword 2
if ($testword <> "txt")
	setvar $switchboard~message "Please only send .txt files.*"
	gosub :switchboard~switchboard
	halt
end

return

:getparampairs
setvar $i 1
setvar $parampairs 0
setvar $numparams 0
while ($i <= sectors)
	getsectorparameter $i $paramname $p
	if ($p <> "")
		add $numparams 1
		setvar $parampairs[$numparams] $i &":" & $p
	end
	add $i 1
end

return
# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
