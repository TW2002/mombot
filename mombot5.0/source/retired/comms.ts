setvar $version "2.0.1 12/09/05"

:setup
gosub :gettime
loadvar $mh_loginname
if ($mh_loginname = 0) or ($mh_loginname = "")
	if (loginname = "")
		setvar $mh_loginname "ME"
	else
		setvar $mh_loginname loginname
		savevar $mh_loginname
	end
end
setvar $startdate $year & $month & $day
setvar $logfilename "data\" & gamename & "-comlog-" & $year & $month & $day & ".txt"
setvar $count 1
setvar $comstring ""
setarray $coms 10
setvar $coms[10][1] 1
setvar $coms[9][1] 1
setvar $coms[8][1] 1
setvar $coms[7][1] 1
setvar $coms[6][1] 1
setvar $coms[5][1] 1
setvar $coms[4][1] 1
setvar $coms[3][1] 1
setvar $coms[2][1] 1
setvar $coms[1][1] 1
setvar $distance 1
# setvar $currsec 1
setvar $sector 1
window coms 750 230 "Com Window" ontop
setvar $windowstring " Traitor's PUBLIC Comm Monitor Loaded!* Waiting for incoming transmissions.*"
setvar $windowstring $windowstring & " Press '_' to review transmission log.*"
setwindowcontents coms $windowstring

:start
setvar $comtype ""
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger lookforf2
killtrigger lookforr2
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
settextlinetrigger lookforp :lookforcom "P "
settextlinetrigger lookforr :lookforcom "R "
settextlinetrigger lookforr2 :lookforcom "'"
settextlinetrigger lookforf :lookforcom "F "
settextlinetrigger lookforf2 :lookforcom "`"
settextlinetrigger fedcom :fedcom "Federation comm-link: [<ENTER> for multiple lines]"
settextlinetrigger sschan :sschan "Sub-space radio ("
settextlinetrigger corpmemo :corpmemo "Type corporate message"
settextlinetrigger compmail :compmail "Type M.A.I.L. message ["
settextouttrigger replay :replay "_"
#settextlinetrigger figHit :figHit "of your fighters in sector"
#settextlinetrigger offFigHit :offFigHit "Your fighters in sector"
settextlinetrigger limpet :limpet "Limpet mine in "
pause

:fighit
gosub :fighitprocess
goto :start

:offfighit
gosub :fighitprocess
goto :start

:limpet
gosub :limpetprocess
goto :start

:fedcom
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $comtype "F"
goto :comtriggers

:sschan
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $comtype "S"
goto :comtriggers

:corpmemo
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $comtype "C"
goto :comtriggers

:compmail
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $comtype "M"
goto :comtriggers

:comtriggers
setvar $line ""
settextouttrigger comtext :comtext
settextlinetrigger endfedcomtext :endcomtext "Federation comm-link terminated."
settextlinetrigger endfedcomtext1 :endcomtext "Message sent on Federation comm-link."
settextlinetrigger endsscomtext :endcomtext "Message sent on sub-space channel"
settextlinetrigger endsscomtext1 :endcomtext "Sub-space comm-link terminated"
settextlinetrigger endcorpmemotext :endcomtext "CMS link terminated."
settextlinetrigger endcompmailtext :endcomtext "GMS link terminated."
settexttrigger extrafedcomline :extracomline "F:"
#settexttrigger extraPComLine :extraComLine "P:"
settexttrigger extrasscomline :extracomline "S:"
settexttrigger extracorpmemoline :extracomline "C:"
settexttrigger extracompmailline :extracomline "M:"
settextlinetrigger fighitcom :fighitcom "of your fighters in sector"
settextlinetrigger offfighitcom :offfighitcom "Your fighters in sector"
settextlinetrigger limpetcom :limpetcom "Limpet mine in "
pause

:comtext
getouttext $letter
if ($letter = #13)
	if ($line = "")
		processout $letter
		pause
	else
		processout $letter
		setvar $line $comtype & " " & $mh_loginname & " " & $line
		gosub :addcom2window
		setvar $line ""
		pause
	end
elseif ($letter = #8)
	getlength $line $length
	cuttext $line $line 0 ($length - 1)
	processout $letter
	settextouttrigger comtext :comtext
	pause
end
setvar $line $line & $letter
processout $letter
settextouttrigger comtext :comtext
pause

:extracomline
killtrigger comtext
killtrigger extrafedcomline
killtrigger extrasscomline
killtrigger extracorpmemoline
killtrigger extracompmailline
# gosub :addCom2Window
setvar $line ""
settexttrigger extrafedcomline :extracomline "F:"
settexttrigger extrasscomline :extracomline "S:"
settexttrigger extracorpmemoline :extracomline "C:"
settexttrigger extracompmailline :extracomline "M:"
settextouttrigger comtext :comtext
pause

:endcomtext
killtrigger comtext
killtrigger extrafedcomline
killtrigger extrasscomline
killtrigger extracorpmemoline
killtrigger extracompmailline
killtrigger endfedcomtext
killtrigger endfedcomtext1
killtrigger endsscomtext
killtrigger endsscomtext1
killtrigger endcorpmemotext
killtrigger endcompmailtext
killtrigger fighitcom
killtrigger offfighitcom
killtrigger limpetcom
# striptext $line #13
# gosub :addCom2Window
goto :start

:fighitcom
setvar $templine $line
gosub :fighitprocess
settextlinetrigger fighitcom :fighitcom "of your fighters in sector"
setvar $line $templine
pause

:offfighitcom
setvar $templine $line
gosub :offfighitprocess
settextlinetrigger offfighitcom :offfighitcom "Your fighters in sector"
setvar $line $templine
pause

:limpetcom
setvar $templine $line
gosub :limpetprocess
settextlinetrigger limpetcom :limpetcom "Limpet mine in "
setvar $line $templine
pause

:lookforcom
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger lookforf2
killtrigger lookforr2
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $line currentline
getword $line $checkcom 1
if ($checkcom = "'") or ($checkcom = "`") or ($checkcom = "P") or ($checkcom = "R") or ($checkcom = "F")
	if ($checkcom = "P")
		getword $line $checkcorpscan 2
		if ($checkcorpscan = "indicates")
			goto :start
		end
	end
	gosub :addcom2window
	goto :start
else
	goto :start
end

:addcom2window
gosub :gettime
if ($startdate <> $year & $month & $day)
	setvar $startdate $year & $month & $day
	setvar $logfilename "data\" & gamename & "-comlog-" & $year & $month & $day & ".txt"
end
write $logfilename $hour & ":" & $minute & ":" & $second & ":" & $msec & "  " &$line
getlength $line $length
setvar $numline 1
setvar $line " " & $line
if ($length > 86)
	cuttext $line $line1 1 86
	cuttext $line $line2 87 200
	setvar $line $line1 & "* " & $line2
	setvar $numline 2
end
gosub :buildcomstring
return

:buildcomstring
setvar $comstring ""
setvar $windowstring ""
setvar $coms[10] $coms[9]
setvar $coms[9] $coms[8]
setvar $coms[8] $coms[7]
setvar $coms[7] $coms[6]
setvar $coms[6] $coms[5]
setvar $coms[5] $coms[4]
setvar $coms[4] $coms[3]
setvar $coms[3] $coms[2]
setvar $coms[2] $coms[1]
setvar $coms[1] $line
setvar $coms[10][1] $coms[9][1]
setvar $coms[9][1] $coms[8][1]
setvar $coms[8][1] $coms[7][1]
setvar $coms[7][1] $coms[6][1]
setvar $coms[6][1] $coms[5][1]
setvar $coms[5][1] $coms[4][1]
setvar $coms[4][1] $coms[3][1]
setvar $coms[3][1] $coms[2][1]
setvar $coms[2][1] $coms[1][1]
setvar $coms[1][1] $numline
setvar $count 2
while ($numline < 9) and ($count < 10)
	#	echo ansi_10 "*" $numline " " $count
	setvar $numline ($numline + $coms[$count][1])
	add $count 1
end
# echo ansi_10 "****"
while ($count >=1)
	if ($coms[$count] = 0)
		setvar $coms[$count] ""
	end
	setvar $comstring $comstring & $coms[$count] & "*"
	subtract $count 1
end

setvar $windowstring $comstring
setwindowcontents coms $windowstring
return

:fighitprocess
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $line currentline
getword $line $spoofcheck 1
if ($spoofcheck = "P") or ($spoofcheck = "F") or ($spoofcheck = "R") or ($spoofcheck = ">")
	return
else
	#gettext CURRENTLINE $sector "sector " ""
	#striptext $sector ":"
	#getdistance $distance $sector CURRENTSECTOR
	#setvar $line " Hops: " & $distance & " " & $line
	gosub :addcom2window
	return
end

:offfighitprocess
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $line currentline
getword $line $spoofcheck 1
if ($spoofcheck = "P") or ($spoofcheck = "F") or ($spoofcheck = "R") or ($spoofcheck = ">")
	return
else
	#getword CURRENTLINE $sector 5
	#striptext $sector ":"
	#getdistance $distance $sector CURRENTSECTOR
	#setvar $line " Hops: " & $distance & " " & $line
	gosub :addcom2window
	return
end

:limpetprocess
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
setvar $line currentline
getword $line $spoofcheck 1
if ($spoofcheck = "P") or ($spoofcheck = "F") or ($spoofcheck = "R") or ($spoofcheck = ">")
	return
else
	#getword CURRENTLINE $sector 4
	#getdistance $distance $sector CURRENTSECTOR
	#setvar $line " Hops: " & $distance & " " & $line
	gosub :addcom2window
	return
end

:replay
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger replay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger fedcom
killtrigger sschan
killtrigger corpmemo
killtrigger compmail
fileexists $yn $logfilename
if ($yn = false)
	echo ansi_12 "**No Comm Log File Exists. As soon as a message is recieved, it will be created.**"
	goto :start
end
echo ansi_10 "**Show last 20 entries (2), last 50 (5), last 100 (1), or show all (a)? " ansi_11 "(1,2,5,a)*"
getconsoleinput $showlast singlekey
if ($showlast = 2) or ($showlast = 5) or ($showlast = "a") or ($showlast = "1")
	goto :buildlogdisplay
else
	goto :start
end

:buildlogdisplay
setvar $fileline ""
setvar $loglength 1
while ($fileline <> eof)
	read $logfilename $fileline $loglength
	add $loglength 1
end
if ($loglength < 20) or ($showlast = "a")
	setvar $count 1
	goto :displaylog
elseif ($loglength < 50) and ($showlast = 5)
	setvar $count 1
	goto :displaylog
elseif ($loglength < 100) and ($showlast = 1)
	setvar $count 1
	goto :displaylog
elseif ($showlast = 1)
	setvar $count ($loglength - 101)
	goto :displaylog
elseif ($showlast = 5)
	setvar $count ($loglength - 51)
	goto :displaylog
else
	setvar $count ($loglength - 21)
	goto :displaylog
end

:displaylog
setvar $fileline ""
echo ansi_10 "*Comm Log:*"
while ($fileline <> eof)
	read $logfilename $fileline $count
	getword $fileline $commtype 2
	if ($commtype = "P")
		echo ansi_10 $fileline "*"
	elseif ($commtype = "R")
		echo ansi_11 $fileline "*"
	elseif ($commtype = "Hops:")
		echo ansi_12 $fileline "*"
	else
		echo ansi_14 $fileline "*"
	end
	add $count 1
end
goto :start

# ----====[Get the date and time ]====----
# creates a unique number timestamp
# if time/date is 10:50:00am 9/15/05 then output = 20050915105000
# if time/date is 5:33:22pm 9/15/05 then output = 20050915173322
:gettime
gettime $datetime "yyyymmddhhnnsszzz am/pm"
getword $datetime $ampmcheck 2
getword $datetime $finaltime 1
cuttext $finaltime $12check 9 2
if ($ampmcheck = "pm")
	if ($12check <> 12)
		add $finaltime 120000000
	end
end
cuttext $finaltime $year 1 4
cuttext $finaltime $month 5 2
cuttext $finaltime $day 7 2
cuttext $finaltime $hour 9 2
cuttext $finaltime $minute 11 2
cuttext $finaltime $second 13 2
cuttext $finaltime $msec 15 3
# echo ANSI_10 "*" $finalTime
# echo ANSI_10 "**" $month "/" $day "/" $year " - " $hour ":" $minute ":" $second
# echo ANSI_10 "*Date: " DATE " Time: " TIME "*"
return

#-----------------------------------
# ----====[ BANNER SECTION ]====----
#-----------------------------------
:egobanner
echo ansi_14 "***"
echo ansi_14 "                                 /\         *"
echo ansi_14 "                                /  \        *"
echo ansi_14 "                               /    \       *"
echo ansi_14 "                              / ____ \      *"
echo ansi_14 "                             / /\   \_\     *"
echo ansi_14 "                            /   " #17 #42 & #16 "-   \    *"
echo ansi_14 "                           /    " #245 "\_     \   *"
echo ansi_14 "                          /______________\  *"
echo ansi_14 "                          www.tw-cabal.com"
return

halt
