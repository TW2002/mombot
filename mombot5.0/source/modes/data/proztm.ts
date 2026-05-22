###############################################################################
#     Please leave this header intact.  This script is released for the players
#     and scripters to use.

#     proZTM Originally written by Promethius
#     Release Date:   Aug 2005
#     Updated:  v.6   Oct 2005
#     Updated:  v1.0  Aug 2006
#     Updated:  v1.4  Nov 2006
#     Updated:  v1.4A Jan 2007
#     Updated:  v2.0  Apr 2008
#     Updated:  v3.0  Nov 2008
#     Updated:  v4.0  Dec 2008
#     Updated:  v4.11 Jun 2009
#     Source Released Dec 25, 2009
###############################################################################

setvar $game gamename
setvar $version "ProZTM 4.11"
setvar $computerint "n"
setvar $usewatch "Yes"
setvar $cim "Yes"
setvar $ztmmode "Interrogation"
setvar $7WarpsList "No"
setvar $deadendlist "No"
setvar $swathdata "No"
setvar $trafficanalysis "No"
setvar $ztmrange "No"
setvar $ztmvarrefresh "No"
setvar $7WarpsInMonitor "Yes"
setvar $showwarpsfound "Yes"
setvar $1stPassWarpSpec "No"
setvar $endpasswarps false
setvar $warpsplotted 0
setvar $reconn 0
loadvar $ztmmin
loadvar $ztmmax
loadvar $bot~folder
setvar $warpspecfile $bot~folder&"/"&gamename&"warpSpec.txt"
if ($ztmmin = 0) or ($ztmmax = 0)
	setvar $ztmmin 1
	setvar $ztmmax sectors
	savevar $ztmmin
	savevar $ztmmax
end
setvar $ztmstart $ztmmin
setvar $ztmsend "No"

setvar $bot~command "proztm"
gosub :help~initialize
setvar $help~help[1]   $help~tab&"ProZTM by Promethius "
setvar $help~help[2]   $help~tab&" - proztm {reset} {nowindow} "
setvar $help~help[3]   $help~tab&"   Options: "
setvar $help~help[4]   $help~tab&"     {reset}        - reset ztmStart/ztmMin/ztmMax for clean start  "
setvar $help~help[5]   $help~tab&"     {nowindow}     - don't pop up a status window"
gosub :help~helpfile

getwordpos " "&$bot~user_command_line&" " $pos " reset"
if ($pos > 0)
	setvar $ztmvarrefresh "Yes"
	setvar $ztmmin 1
	savevar $ztmmin
	setvar $ztmmax sectors
	savevar $ztmmax
	setvar $ztmstart 0
	savevar $ztmstart
	setvar $ztmend sectors
	savevar $ztmend
	setvar $verifystart 0
	savevar $verifystart
	setvar $verifyend 0
	savevar $verifyend
	setvar $firstpassverified 0
	savevar $firstpassverified
	setvar $spassztmstart $ztmmin
	savevar $spassztmstart
	setvar $spassztmend $ztmend
	savevar $spassztmend
end

getwordpos " "&$bot~user_command_line&" " $pos " nowindow"
if ($pos > 0)
	setvar $nowindow true
else
	setvar $nowindow false
end

:begin
seteventtrigger connlost :connlost "CONNECTION LOST"
settexttrigger connlost2 :connlost "Connection lost"
getword currentline $prompt 1

# plotDisplay setting
setvar $plotdisplay (($ztmmax - $ztmmin + 1) / 100)
if ($plotdisplay < 100)
	setvar $plotdisplay 100
end

if ($nowindow = false)
	gosub :windowsetup

	:windowmessages
	setvar $windowmessagepass0 "*  Game:    "& $game & "*  Sectors: " & sectors  & "*"
	setvar $windowmessagepasscim "*  CIM "
	setvar $windowmessagepass1 "*  Pass 1:  Mapping @ 0%*"
	setvar $windowmessagepass2 "*  Pass 2: *"
	setvar $windowmessagepass3 "*  Pass 3: *"
	setvar $windowmessagepass4 "*  Pass 4: *"
	setvar $windowmessagepass5 "*  Pass 5: *"
	gosub :ztmwindowupdate
end

:intmode
if ($cim = "Yes")
	if ($recon = 1)
		send "^"
	else
		send "^iq"
		waitfor ": ENDINTERROG"
		send "^"
	end
	setvar $cimmed 1
else
	send "^"
end

:firstpass
gosub :totalwarps
setvar $prevwarpcnt $totalwarps
if ($nowindow = false) and ($cimmed = 1)
	setvar $windowmessagepasscim "*  CIM found: " & $totalwarps & " Warps*"
	gosub :ztmwindowupdate
end
loadvar $ztmstart
loadvar $ztmend
setvar $plots 0
setvar $burstcnt 0
setvar $burst ""
setvar $forwardplot false
# was 0
setvar $2ndIn 0
if ($ztmstart = 0)
	setvar $ztmstart $ztmmin
end
if ($ztmend = 0)
	setvar $ztmend $ztmmax
end
while ($ztmstart <= $ztmmax)

	:ztmfirstsector
	if ($ztmstart > $ztmmax)
		goto :secondpass
	end
	# changed from = 0 to <=2
	if (sector.warpcount[$ztmstart] = 0) and ($ztmstart <= $ztmmax) and (sector.explored[$ztmstart] <> yes)
		goto :ztmsecondsector
	else
		add $ztmstart 1
		if ($ztmstart > $ztmmax)
			goto :secondpass
		end
		goto :ztmfirstsector
	end

	:ztmsecondsector
	# was < 2
	if (sector.warpincount[$ztmend] <= $2ndIn) and ($ztmend <> $ztmstart) and ($ztmend > ($ztmmin-1)) and (sector.explored[$ztmend] <> yes)
		setvar $burst $burst & "f" & $ztmstart & "*" & $ztmend & "*y"
		if ($forwardplot = false)
			setvar $burst $burst & "f" & $ztmend & "*" & $ztmstart & "*y"
			add $plots 2
			add $warpsplotted 2
		else
			add $plots 1
			add $warpsplotted 1
		end
		add $burstcnt 1
		if ($burstcnt > 5)
			goto :firstpassplot
		else
			subtract $ztmend 1
		end
		if ($ztmend < $ztmmin)
			setvar $ztmend $ztmmax
			add $2ndIn 1
		end
		add $ztmstart 1
		if ($ztmstart = $ztmend)
			subtract $ztmend 1
			if ($ztmend < $ztmmin)
				setvar $ztmmin $ztmend
				add $2ndIn 1
			end
		end
		add $burstcnt 1
		goto :ztmfirstsector

	else
		subtract $ztmend 1
		if ($ztmend < $ztmmin)
			setvar $ztmend $ztmmax
			add $2ndIn 1
		end
		goto :ztmsecondsector
	end

	:firstpassplot
	if ($ztmmode = "Interrogation")
		send $burst
		setvar $burst ""
		setvar $burstcnt 0
		if ($forwardplot = true)
			waitfor "FM > " & $ztmstart
		else
			waitfor "FM > " & $ztmend
		end
	else
		send $burst
		setvar $burst ""
		setvar $burstcnt 0
		setvar $chksector $ztmstart
		gosub :checkcomp
	end
	savevar $ztmstart
	savevar $ztmend
	add $ztmstart 1
	subtract $ztmend 1
	setvar $tot_sectors $ztmstart
	multiply $tot_sectors 100
	divide $tot_sectors ($ztmmax - $ztmmin)
	if ($nowindow=false)
		if ($ckupdate <> $tot_sectors) and ($plots >= $plotdisplay)
			gosub :totalwarps
			if ($warpsplotted > 0)
				setprecision 3
				setvar $plotefficiency  (($totalwarps - $prevwarpcnt) / $warpsplotted)
				setprecision 0
			end
			if ($plotefficiency < 6.5)
				setvar $forwardplot true
			end
			setvar $windowmessagepass1 "*  Pass 1:  Mapping @ " & $tot_sectors & "%" & " Warps: " & $totalwarps & ", Warps:Plot " & $plotefficiency & "*"
		else
			setvar $windowmessagepass1 "*  Pass 1:  Mapping @ " & $tot_sectors & "%*"
		end
		gosub :ztmwindowupdate
		setvar $ckupdate $tot_sectors
		setvar $plots 0
	end
end

#-----------------
:secondpass
send $burst
loadvar $2ndvStart
loadvar $2ndvEnd
setvar $burstcnt 0
setvar $warpsplotted 0
setvar $windowmessagepass2 ""
setvar $plots 0
setvar $burst ""
setvar $plots 0
gettime $1PassEndTime "hh:nn:ss"
setvar $ckupdate 0
setvar $tot_sectors 0
gosub :totalwarps
setvar $prevwarpcnt $totalwarps
setvar $windowmessagepass1 "*  Pass 1:  Completed @ " & $1PassEndTime & ", " & $totalwarps & " warps found*"
if ($nowindow = false) and ($1stPassWarpSpec = "Yes")
	setvar $windowmessagepass2 "*  Writing " & $warpspecfile & "*"
	gosub :ztmwindowupdate
	gosub :writewarpspec
	setvar $windowmessagepass2 "*  WarpSpec Written to " & $warpspecfile & "*"
end
if ($nowindow = false)
	setvar $windowmessagepass2 $windowmessagepass2 & "*  Pass 2:  Mapping @ " & $tot_sectors & "%" & " Warps: " & $totalwarps & "*"
	gosub :ztmwindowupdate
end

if ($2ndvStart = 0)
	setvar $2ndvStart $ztmmin
	setvar $2ndvEnd $ztmmax
end
while ($2ndvStart <= $ztmmax)
	if (sector.warpcount[$2ndvStart] = 1) and (sector.explored[$2ndvStart] <> yes)
		setvar $voidclear "c" & sector.warps[$2ndvStart][1] & "*"
		setvar $burst $burst & "s" & sector.warps[$2ndvStart][1] & "*f" & $2ndvStart & "*"
	elseif (sector.warpcount[$2ndvStart] = 0)
		setvar $burst $burst & "f" & $2ndvStart & "*"
		setvar $voidclear ""
	else
		goto :endsecondvpass
	end

	:get2ndvend
	if (sector.warpincount[$2ndvEnd] < 2)
		setvar $burst $burst & $2ndvEnd & "*Y" & $voidclear
		add $plots 1
		add $burstcnt 1
		add $warpsplotted 1
	else
		subtract $2ndvEnd 1
		if ($2ndvEnd = $2ndvStart)
			subtract $2ndvEnd 1
		end
		if ($2ndvEnd < $ztmmin)
			setvar $2ndvEnd $ztmmax
		end
		goto :get2ndvend
	end
	if ($burstcnt > 5)
		send $burst
		savevar $2ndvStart
		savevar $2ndvEnd
		if ($ztmmode = "Interrogation")
			waitfor "FM > " & $2ndvStart
		else
			setvar $chksector $2ndvStart
			gosub :checkcomp
		end
		setvar $burst ""
		setvar $burstcnt 0
	end
	subtract $2ndvEnd 1
	if ($2ndvEnd < $ztmmin)
		setvar $2ndvEnd $ztmmax
	end

	:endsecondvpass
	add $2ndvStart 1
	if ($2ndvStart = $2ndvEnd)
		subtract $2ndvEnd 1
		if ($2ndvEnd < $ztmmin)
			setvar $2ndvEnd $2ndvMax
		end
	end
	if ($nowindow = false)
		setvar $tot_sectors $2ndvStart
		multiply $tot_sectors 100
		divide $tot_sectors ($ztmmax - $ztmmin)
		if ($ckupdate <> $tot_sectors) and ($plots >= $plotdisplay)
			setvar $plots 1
			gosub :totalwarps
			setprecision 3
			setvar $plotefficiency (($totalwarps - $prevwarpcnt) / $warpsplotted)
			setprecision 0
			if ($showwarpsfound = "Yes")
				setvar $windowmessagepass2 "*  Pass 2:  Mapping @ " & $tot_sectors & "%" & " Warps: " & $totalwarps & " Warps:Plot: " & $plotefficiency & "*"
			else
				setvar $windowmessagepass2 "*  Pass 2:  Mapping @ " & $tot_sectors & "%*"
			end
			gosub :ztmwindowupdate
			setvar $ckupdate $tot_sectors
		end
	end
end
send $burst

#--------------------
:thirdpass
setvar $plots 0
setvar $firstpassverified 1
savevar $firstpassverified
gettime $1PassEndTime "hh:nn:ss"
setvar $ckupdate 0
setvar $tot_sectors 0
setvar $endpasswarps true
gosub :totalwarps
if ($nowindow = false)
	if ($warpsplotted > 0)
		setprecision 3
		setvar $plotefficiency  ($totalwarps - $prevwarpcnt) / $warpsplotted
		setprecision 0
	end
	setvar $endpasswarps false
	setvar $windowmessagepass2 "*  Pass 2:  Completed @ " & $1PassEndTime & ", " & $totalwarps & " warps*"
	setvar $windowmessagepass3 "*  Pass 3:  Mapping @ " & $tot_sectors & "%*"
	gosub :ztmwindowupdate
end

loadvar $spassztmstart
loadvar $spassztmend
setvar $ckupdate 0
if ($spassztmstart = 0)
	setvar $spassztmstart $ztmmin
end
if ($spassztmend = 0)
	setvar $spassztmend $ztmmax
end
while ($spassztmstart <= $ztmmax)

	:spassplotfrom
	# added sector.warpcount = 1
	if (sector.warpcount[$spassztmstart] = 6) or (sector.explored[$spassztmstart] = yes) or (sector.warpcount[$spassztmstart] = 1)
		add $spassztmstart 1
		if ($spassztmstart > $ztmmax)
			goto :data
		end
		goto :spassplotfrom
	end

	:getavoids
	setvar $sendburst ""
	setvar $i 1
	while ($i <= sector.warpcount[$spassztmstart])
		if (sector.warps[$spassztmstart][$i] > 0)
			if ($computerint = "n")
				setvar $sendburst $sendburst & "s" & sector.warps[$spassztmstart][$i] & "*"
			else
				setvar $sendburst $sendburst & "v" & sector.warps[$spassztmstart][$i] & "*"
			end
		end
		add $i 1
	end

	:burstit
	if ($spassztmstart = $spassztmend)
		subtract $spassztmend 1
		if ($spassztmend < $ztmmin)
			setvar $spassztmend $ztmmax
		end
	end
	send $sendburst "f" $spassztmstart "*" $spassztmend "*y"
	settextlinetrigger sect :addvoid $spassztmstart & " > "
	settexttrigger compclear :clearvoids "Clear Avoids"
	pause

	:addvoid
	killtrigger compclear
	getword currentline $nvoid 3
	striptext $nvoid ")"
	striptext $nvoid "("
	if ($nvoid = $spassztmend)
		subtract $spassztmend 1
		goto :burstit
	end
	# catch sectors that are next door
	if ($ztmmode = "Interrogation")
		setvar $sendburst "s" & $nvoid & "*"
	else
		setvar $sendburst "v" & $nvoid & "*"
	end
	goto :burstit

	:clearvoids
	killtrigger sect
	savevar $spassztmstart
	savevar $spassztmend
	add $plots 1
	add $spassztmstart 1
	subtract $spassztmend 1
	if ($nowindow = false)
		setvar $tot_sectors $spassztmstart
		multiply $tot_sectors 100
		divide $tot_sectors ($ztmmax - $ztmmin)
		if ($ckupdate <> $tot_sectors) and ($plots >= $plotdisplay)
			gosub :totalwarps
			setvar $windowmessagepass3 "*  Pass 3:  Mapping @ " & $tot_sectors & "%" & " Warps: " & $totalwarps & "*"
		else
			setvar $windowmessagepass3 "*  Pass 3:  Mapping @ " & $tot_sectors & "%*"
		end
		gosub :ztmwindowupdate
		setvar $ckupdate $tot_sectors
		setvar $plots 0
	end
end

:data
if ($nowindow = false)
	gettime $thirdpassendtime "hh:nn:ss"
	setvar $endpasswarps true
	gosub :totalwarps
	setvar $endpasswarps false
	setvar $windowmessagepass3 "*  Pass 3:  Completed @ " & $thirdpassendtime & ", " & $totalwarps & " warps found.*"
	gosub :ztmwindowupdate
end

:fourthpass
loadvar $backdoorcomplete
if ($backdoorcomplete = 1)
	goto :donebackdoorcheck
end
if ($nowindow = false)
	setvar $windowmessagepass4 "*  Pass 4:  Running*"
	gosub :ztmwindowupdate
end
setvar $i $ztmmin
setvar $burstcnt 0
setvar $burst ""
while ($i <= sectors)
	if (sector.backdoorcount[$i] > 0)
		setvar $backdoorcnt 0

		:backdoor
		if ($backdoorcnt < sector.backdoorcount[$i])
			add $backdoorcnt 1
			setvar $burst $burst & "f" & $i & "*" & sector.backdoors[$i][$backdoorcnt] & "*y"
			add $burstcnt 1
			goto :backdoor
		end
	end
	if ($burstcnt > 5)
		send $burst
		setvar $burstcnt 0
		setvar $burst ""
		if ($ztmmode = "Interrogation")
			waitfor "FM > " & $i
		else
			setvar $chksector $i
			gosub :checkcomp
		end
	end
	add $i 1
end
send $burst

:donebackdoorcheck
gettime $4PassEndTime "hh:nn:ss"
setvar $endpasswarps true
gosub :totalwarps
setvar $endpasswarps false
setvar $windowmessagepass4 "*  Pass 4:  Completed @ " & $4PassEndTime & ", " & $totalwarps & " warps found.*"
gosub :ztmwindowupdate
setvar $backdoorcomplete 1
savevar $backdoorcomplete
send "q"
setvar $switchboard~message "ZTM Completed at " & $4PassEndTime & "*"
gosub :switchboard~switchboard
halt

# our padding routine
:padlen
setvar $padit ""
while ($len < 6)
	setvar $padit $padit & " "
	add $len 1
end
return

:padleftlen
setvar $padit ""
while ($len < 7)
	setvar $padit " " & $padit
	add $len 1
end
return

# goSubs
:writewarpspec
setvar $i 1
delete $warpspecfile
while ($i <= sectors)
	getlength $i $len
	gosub :padlen
	setvar $warpstring $i & $padit
	setvar $warpcounter 1
	if (sector.warpcount[$i] > 0)
		while ($warpcounter <= sector.warpcount[$i])
			getlength sector.warps[$i][$warpcounter] $len
			gosub :padlen
			setvar $warpstring $warpstring & sector.warps[$i][$warpcounter] & $padit
			add $warpcounter 1
		end
		write $warpspecfile $warpstring
	end
	add $i 1
end
return

:windowsetup
gettime $sttime "'Start time:  ' h:nn:ss"
setvar $window 1
window ztm 475 375 "      " & $version & "  by Promethius    " & $sttime  ontop
setvar $window "*     Public Release*"
setvar $window $window & "     Release Date:   Aug 2005*"
setvar $window $window & "     Updated:  v.6   Oct 2005*"
setvar $window $window & "     Updated:  v1.0  Aug 2006*"
setvar $window $window & "     Updated:  v1.4  Nov 2006*"
setvar $window $window & "     Updated:  v1.4A Jan 2007*"
setvar $window $window & "     Updated:  v2.0  Apr 2008*"
setvar $window $window & "     Updated:  v3.0  Nov 2008*"
setvar $window $window & "     Updated:  v4.0  Dec 2008*"
setvar $window $window & "     Updated:  v4.11 Jun 2009"
setvar $window $window & " Please let me know of any issues on classicTW.com.*"
setwindowcontents ztm $window
setdelaytrigger windowsplash :windowsplash 3000
pause

:windowsplash
return

:ztmwindowupdate
setvar $window $windowmessagepass0 & $windowmessagepasscim & $windowmessagepass1 & $windowmessagepass2
setvar $window $window & $windowmessagepass3 & $windowmessagepass4 & $windowmessagepass5
setwindowcontents ztm $window
return

:connlost
killalltriggers
waitfor "Command [TL"
loadvar $ztmmin
loadvar $ztmmax
loadvar $ztmstart
loadvar $ztmend
loadvar $verifystart
loadvar $verifyend
loadvar $firstpassverified
loadvar $spassztmstart
loadvar $spassztmend
echo ansi_12 "*" & $version & " resuming in " ansi_14 "10 " ansi_12 "seconds."
setdelaytrigger relogdelay :begin 10000
setvar $reconn 1
pause
goto :begin
halt

:totalwarps
setvar $totalwarps 0
setvar $ttlwrps 0
setvar $7Ins ""
if ($showwarpsfound = "Yes") or ($7WarpsInMonitor = "Yes") or ($endpasswarps = true)
	while ($ttlwrps < sectors)
		add $ttlwrps 1
		add $totalwarps sector.warpcount[$ttlwrps]
		if (sector.warpincount[$ttlwrps] = 7) and ($7WarpsInMonitor = "Yes")
			if (sector.explored[$ttlwrps] = yes)
				setvar $padit " -e- "
			else
				setvar $padit " -u- "
			end

			if ($ttlwrps < 10)
				setvar $padit $padit & "     BD = "
			elseif ($ttlwrps < 100)
				setvar $padit $padit & "    BD = "
			elseif ($ttlwrps < 1000)
				setvar $padit $padit & "   BD = "
			elseif ($ttlwrps < 10000)
				setvar $padit $padit & "  BD = "
			elseif ($ttlwrps > 9999)
				setvar $padit $padit & " BD = "
			end
			setvar $update7in 1
			setvar $7Ins $7Ins & "*" & $ttlwrps & $padit & sector.backdoors[$ttlwrps][1]
		end
	end
end
return

:checkcomp
settexttrigger intgood2 :computerdone2 $chksector & " > "
settexttrigger compclear2 :clearvoids2 "Clear Avoids"
pause

:clearvoids2
killtrigger intgood2
send "y"

:computerdone2
killtrigger compclear2
return

include "source\include\help"
include "source\include\switchboard.ts"
