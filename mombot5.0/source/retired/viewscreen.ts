systemscript
gosub :bot~loadvars
loadvar $map~home_sector
setvar $bot~help[1] $bot~tab&"Information screen for self use only.  "
gosub :bot~helpfile
setvar $bot~command "viewscreen"

setvar $bot~script_title "Viewscreen"
gosub :bot~banner
setvar $active_viewscreen false

:setup
gosub :gettime
loadvar $bot~folder
setvar $startdate $year & $month & $day
setvar $logfilename $bot~folder&"/"&$year & $month & $day & ".comms"

setvar $count 1
setvar $comstring ""
setvar $comsize 1000
setvar $figsize 5
setvar $comm_line_length 68
setvar $comm_window_size 25
setvar $comm_window_start_index 1
setarray $coms $comsize
setarray $figs $figsize
setarray $stats 26
setvar $isodd false
setvar $window_content ""
savevar $window_content
setvar $switchboard~window_content ""
savevar $switchboard~window_content
setvar $old_output ""

if ($logfilename <> "")
	fileexists $exists $logfilename
	if ($exists)
		readtoarray $logfilename $chatlog
		setvar $i ($comsize-1)
		setvar $index $chatlog
		while (($i >= 1) and ($index >= 1))
			setvar $line $chatlog[$index]
			getlength $line $length
			if ($length > 15)
				cuttext $line $line 14 9999
				getlength $line $length
				setvar $line_length $comm_line_length
				if ($length > $comm_line_length)
					cuttext $line $line1 1 $line_length
					cuttext $line $line2 ($line_length+1) ($line_length*2)
					subtract $i 1
					setvar $line $line1
					getlength $line $length
					setvar $ignore true
					gosub :formatline
					setvar $coms[($comsize-$i)] $line
					if ($line2 <> "")
						if ($i >= 1)
							setvar $line "+         "&$line2
							getlength $line $length
							setvar $ignore true
							gosub :formatline
							setvar $coms[($comsize-$i+1)] $line
						end
					end
				else
					setvar $ignore true
					getlength $line $length
					gosub :formatline
					setvar $coms[($comsize-$i)] $line
				end
			end
			subtract $i 1
			subtract $index 1
		end
	end
end
setarray $chatlog 1

#setVar $i $comsize
#while ($i > 0)
#    setvar $coms[$i][1] 1
#    subtract $i 1
#end
# ======================     START PREFERENCES MENU SUBROUTINE    ==========================
:chatmenu
setvar $bot~botisdeaf false
savevar $bot~botisdeaf
gosub :buildcomstring

setvar $i 1
while ($i <= $figsize)
	setvar $figs[$i] ""
	add $i 1
end

:start
getdeafclients $bot~botisdeaf
if (($bot~botisdeaf = true) and ($active_viewscreen = true))
	gosub :refreshchatmenu
end

:start_no_refresh
setvar $comtype ""
gosub :killchattriggers
settextlinetrigger lookforp :lookforcom "P "
settextlinetrigger lookforr :lookforcom "R "
settextlinetrigger lookforf :lookforcom "F "
settextlinetrigger lookforselfr :lookforcom "'"
settextlinetrigger lookforselff :lookforcom "`"
settextlinetrigger lookforselfmul :lookforcom "S: "
settextlinetrigger fighit :fighitprocess "of your fighters in sector"
settextlinetrigger offfighit :fighitprocess "Your fighters in sector"
#settextlinetrigger entered :figHitProcess "Deployed Fighters Report Sector"

#setdelaytrigger    silentdelay :checksilent 900000
#settextlinetrigger limpet :limpetProcess "Limpet mine in "

getdeafclients $bot~botisdeaf
if ($bot~botisdeaf = true)
	setdelaytrigger delay :refresh 500
end
settextouttrigger open :process_command "_"
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf = true)
	settextouttrigger talk2 :process_down "d"
	settextouttrigger talk3 :process_down "D"
	settextouttrigger talk4 :process_up "u"
	settextouttrigger talk5 :process_up "U"
	settextouttrigger ignore :process_chat "'"
	settextouttrigger ignore2 :process_chat "`"

	settextouttrigger talk7 :toggle_mute_me "+"
	settextouttrigger talk6 :start_no_refresh ""
end
pause

:process_chat
gosub :killchattriggers
getouttext $chat_symbol
processout $chat_symbol

:wait_for_chat
settextouttrigger chat :processchatstring ""
pause

:processchatstring
getouttext $character
processout $character
getwordpos $character $pos #13
setvar $found_enter_key false
if ($pos > 0)
	setvar $found_enter_key true
end
if ($found_enter_key = true)
	goto :start
else
	goto :wait_for_chat
end

:process_up
gosub :killchattriggers
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
	if ($comm_window_start_index < ($comsize-$comm_window_size))
		add $comm_window_start_index $comm_window_size
		if ($comm_window_start_index > ($comsize-$comm_window_size))
			setvar $comm_window_start_index ($comsize-$comm_window_size)
		end
	end
end
goto :start

:process_down
gosub :killchattriggers
if ($bot~botisdeaf)
	if ($comm_window_start_index > 1)
		subtract $comm_window_start_index $comm_window_size
		if ($comm_window_start_index < 1)
			setvar $comm_window_start_index 1
		end
	end
end
goto :start

:process_command
gosub :killchattriggers
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
	setvar $active_viewscreen false
	setdeafclients false
	echo #27&"[255D"&#27&"[255B"&#27&"[K"
	echo "*"&ansi_5&"Viewscreen shutting down..*"&ansi_15&currentansiline
else
	setvar $active_viewscreen true
	setdeafclients true
	setvar $comm_window_start_index 1
	setvar $old_output ""
	gosub :refreshchatmenu
end
getdeafclients $bot~botisdeaf
savevar $bot~botisdeaf
goto :start

:toggle_battle_screen
gosub :killchattriggers
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
	if ($battle_screen = true)
		setvar $battle_screen false
	else
		setvar $battle_screen true
	end
	goto :start
end

:toggle_mute_me
gosub :killchattriggers
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
	if ($ignoreme = true)
		setvar $ignoreme false
	else
		setvar $ignoreme true
	end
	goto :start
end

:refresh
getdeafclients $bot~botisdeaf
if (($bot~botisdeaf) and ($active_viewscreen = true))
	gosub :refreshchatmenu
	setdelaytrigger delay :refresh 500
end
pause

:lookforcom
gosub :killchattriggers
setvar $line currentline
cuttext $line $checkcom 1 2
cuttext $line $firstchar 1 1
getword $checkcom $checkcom 1
if ($firstchar = "'") or ($firstchar = "`") or ($checkcom = "P") or ($checkcom = "R") or ($checkcom = "F") or ($checkcom = "S:")
	if ($checkcom = "P")
		getword $line $checkcorpscan 2
		if ($checkcorpscan = "indicates")
			goto :start
		end
	end
	getlength $line $length
	setvar $isme false
	if ($length > 4)
		if ($firstchar = "'")
			cuttext $line $line 2 9999
			setvar $line "R ME     "&$line
			setvar $isme true
		end
		if ($firstchar = "`")
			cuttext $line $line 2 9999
			setvar $line "F ME     "&$line
			setvar $isme true
		end
		if ($checkcom = "S:")
			cuttext $line $line 4 9999
			setvar $line "R ME     "&$line
			setvar $isme true
		end
		gosub :addcom2window
	end
	goto :start
else
	goto :start
end

:fighitprocess
gosub :killchattriggers
setvar $line currentline
getword $line $spoofcheck 1
if ($spoofcheck = "P") or ($spoofcheck = "F") or ($spoofcheck = "R") or ($spoofcheck = ">")
	goto :start
else
	gosub :addfig2window
	goto :start
end

:limpetprocess
gosub :killchattriggers
setvar $line currentline
getword $line $spoofcheck 1
if ($spoofcheck = "P") or ($spoofcheck = "F") or ($spoofcheck = "R") or ($spoofcheck = ">")
	goto :start
else
	#getword CURRENTLINE $sector 4
	#getdistance $distance $sector CURRENTSECTOR
	#setvar $line " Hops: " & $distance & " " & $line
	gosub :addfig2window
	goto :start
end

:addcom2window
gosub :gettime
if ($startdate <> $year & $month & $day)
	setvar $startdate $year & $month & $day
	setvar $logfilename $bot~folder&"/"&$year & $month & $day & ".comms"
end
write $logfilename $hour & ":" & $minute & ":" & $second & ":" & $msec & "  " &$line
getlength $line $length
setvar $numline 1
setvar $line2 ""
setvar $line " " & $line
if (($isme = true) and ($ignoreme = true))
	# ignore self chat if ignore me is set. #
else
	if ($length > ($comm_line_length+1))
		cuttext $line $line1 1 ($comm_line_length)
		cuttext $line $line2 ($comm_line_length+1) 200
		setvar $line $line1&"* "&$line2
		setvar $numline 2

		setvar $line $line1
		getlength $line $length
		gosub :formatline
		if ($line2 <> "")
			setvar $line "+         "&$line2
			getlength $line $length
			gosub :formatline
		end
	else
		gosub :formatline
	end
end
return

:addfig2window
gosub :gettime
setvar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
if ($isodd)
	setvar $isodd false
	setvar $time ansi_4&$time&ansi_11
else
	setvar $isodd true
	setvar $time ansi_12&$time&ansi_11
end
gettext " "&$line $attacker " " " destroyed "
gettext " "&$line $howmany " destroyed " " of your fighters in sector "
gettext $line&"[end][end]" $attacked " in sector " "[end][end]"
replacetext $line $attacker&" " ansi_11&$attacker&" "&ansi_2
replacetext $line " "&$howmany&" " ansi_6&" "&$howmany&" "&ansi_2
replacetext $line $attacked ansi_6&$attacked&ansi_2
isnumber $isnumber $attacked
if ($isnumber)
	if (($attacked > 10)  and ($attacked <= sectors))
		getdistance $distance $attacked currentsector
		if ($map~home_sector > 0)
			getdistance $distance_home $attacked $map~home_sector
		end
		setvar $hops ""
		if ($distance > 0)
			setvar $hops ansi_2&" ("&ansi_15&$distance & " hops away"&ansi_2&")"
			if ($map~home_sector > 0)
				setvar $hops $hops&" ("&ansi_15&$distance_home & " from home"&ansi_2&")"
			end
		end
		setvar $line  $time&$line&$hops
		gosub :buildfigstring
	end
end
return

:addentry2window
gosub :gettime
setvar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
if ($isodd)
	setvar $isodd false
	setvar $time ansi_4&$time&ansi_11
else
	setvar $isodd true
	setvar $time ansi_12&$time&ansi_11
end
getword currentline $attacked 5
replacetext $attacked ":" ""
replacetext $line $attacked ansi_6&$attacked&ansi_2
replacetext $line "Deployed Fighters Report Sector" ansi_2&"Deployed Fighters Report Sector"&ansi_2
#    isNumber $isNumber $attacked
#    if ($isNumber)
#        if (($attacked > 10)  AND ($attacked <= SECTORS))
#			getdistance $distance $attacked CURRENTSECTOR
#			if ($MAP~home_sector > 0)
#				getdistance $distance_home $attacked $MAP~home_sector
#			end
#			setVar $hops ""
#			if ($distance > 0)
#				setvar $hops ANSI_2&" ("&ANSI_15&$distance & " hops away"&ANSI_2&")"
#				if ($MAP~home_sector > 0)
#					setVar $hops $hops&" ("&ANSI_15&$distance_home & " from home"&ANSI_2&")"
#				end
#			end
setvar $line  $time&$line&$hops
gosub :buildfigstring
#    	end
#    end
return

:formatline
if ($length > 11)
	cuttext $line $commchar 1 2
	cuttext $line $thename 3 8
	cuttext $line $therest 10 9999
	setvar $line ansi_3&$commchar&ansi_11&$thename&ansi_14&$therest
	if ($ignore <> true)
		gosub :buildcomstring
	end
	setvar $ignore false
end
return

:buildfigstring
setvar $figstring ""
setvar $windowstring ""
setvar $i $figsize
while ($i > 0)
	if ($i = 1)
		setvar $figs[1] $line
		#setvar $figs[1][1] $numline
	else
		setvar $figs[$i] $figs[($i-1)]
		#setvar $figs[$i][1] $figs[($i-1)][1]
	end
	subtract $i 1
end

#setvar $count 2
#while (($numline < ($figsize-1)) AND ($count < $figsize))
#    setvar $numline ($numline + $figs[$count][1])
#    add $count 1
#end
while ($count >=1)
	if ($figs[$count] = 0)
		setvar $figs[$count] ""
	end
	setvar $figstring $figstring & $figs[$count] & "*"
	subtract $count 1
end
return

:buildcomstring
setvar $comstring ""
setvar $windowstring ""
setvar $i $comsize
while ($i > 0)
	if ($i = 1)
		setvar $coms[1] $line
		#setvar $coms[1][1] $numline
	else
		setvar $coms[$i] $coms[($i-1)]
		#setvar $coms[$i][1] $coms[($i-1)][1]
	end
	subtract $i 1
end

#setvar $count 2
#while (($numline < ($comsize-1)) AND ($count < $comsize))
#    setvar $numline ($numline + $coms[$count][1])
#    add $count 1
#end
while ($count >=1)
	if ($coms[$count] = 0)
		setvar $coms[$count] ""
	end
	setvar $comstring $comstring & $coms[$count] & "*"
	subtract $count 1
end
return

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

:getstats
gosub :loadvars

if ($player~current_sector = 0)
	setvar $stats[1] "    Sector: "&currentsector&"*"
else
	setvar $stats[1] "    Sector: "&$player~current_sector&"*"
end
if ($planet~planet <> 0)
	setvar $stats[2] "    Planet: "&$planet~planet&"*"
else
	setvar $stats[2] "    Planet: None*"
end
if ($player~unlimitedgame)
	setvar $stats[3] "     Turns: Unlimited*"
else
	setvar $stats[3] "     Turns: "&currentturns&"*"
end
setvar $player~value currentexperience
gosub :player~commasize
setvar $stats[4]  "       Exp: "&$player~value&"*"
setvar $player~value currentalignment
gosub :player~commasize
setvar $stats[5]  "     Align: "&$player~value&"*"
setvar $player~value currentcredits
gosub :player~commasize
setvar $stats[6]  "   Credits: "&$player~value&"*"
setvar $stats[7]  "Holds Info: "&currenttotalholds&"*"
setvar $stats[8] "  Fuel Ore: "&currentoreholds&"*"
setvar $stats[9] "  Organics: "&currentorgholds&"*"
setvar $stats[10] " Equipment: "&currentequholds&"*"
setvar $stats[11] " Colonists: "&currentcolholds&"*"
setvar $empty_holds (currenttotalholds - currentoreholds)
setvar $empty_holds ($empty_holds - currentorgholds)
setvar $empty_holds ($empty_holds - currentequholds)
setvar $empty_holds ($empty_holds - currentcolholds)

setvar $stats[12] "     Empty: "&currentemptyholds&"*"
setvar $stats[13] "    Ship #: "&currentshipnumber&"*"
setvar $player~value currentfighters
gosub :player~commasize
setvar $stats[14] "  Fighters: "&$player~value&"*"
setvar $player~value currentshields
gosub :player~commasize
setvar $stats[15] "   Shields: "&$player~value&"*"
setvar $player~value $ship~ship_fighters_max
gosub :player~commasize
setvar $stats[16] "  Max Figs: "&$player~value&"*"
setvar $player~value $ship~ship_max_attack
gosub :player~commasize
setvar $stats[17] "  Max Wave: "&$player~value&"*"
setvar $stats[18] "Turns/Warp: "&$player~turns_per_warp&"*"

cuttext currentarmids&"    " $player~armids 0 3
cuttext currentcloaks&"    " $player~cloaks 0 3
cuttext currentgentorps&"    " $player~genesis 0 3
cuttext currentminedisr&"    " $player~mine_disruptors 0 3
cuttext currenteprobes&"    " $player~eprobes 0 3
cuttext currenttwarptype&"    " $player~twarp_type 0 3
cuttext currentscantype&"    " $player~scan_type 0 3

setvar $stats[19] "   EProbes: "&currenteprobes&ansi_5&"   Beacons: "&currentbeacons&"*"
setvar $stats[20] "   Disrupt: "&currentminedisr&ansi_5&"   Photons: "&currentphotons&"*"
setvar $stats[21] "    Armids: "&currentarmids&ansi_5&"   Limpets: "&currentlimpets&"*"
setvar $stats[22] "   Genesis: "&currentgentorps&ansi_5&"   AtmDets: "&currentatomics&"*"
setvar $player~value currentcorbomite
gosub :player~commasize
setvar $stats[23] "    Cloaks: "&currentcloaks&ansi_5&"    Corbos: "&$player~value&"*"
setvar $stats[24] "     Twarp: "&currenttwarptype&ansi_5&"   PlnScan: "&currentplanetscanner&"*"
setvar $stats[25] "   Scanner: "&currentscantype&ansi_5&"   PsiProb: "&currentpsychicprobe&"*"
setvar $stats[26] "     *"
return

:loadvars
loadvar $planet~planet
loadvar $player~unlimitedgame
loadvar $player~trader_name
loadvar $map~stardock
loadvar $map~alpha_centauri
loadvar $map~rylos
loadvar $map~backdoor
loadvar $ship~ship_fighters_max
loadvar $ship~ship_max_attack
loadvar $player~turns_per_warp
return

:refreshchatmenu
loadvar $bot~who_is_online
loadvar $window_content
loadvar $switchboard~window_content
if ($switchboard~window_content <> "")
	setvar $window_content $window_content&"** "&$switchboard~window_content
end
replacetext $bot~who_is_online "," "*"
replacetext $window_content "[][]" "*"

gosub :getstats
setvar $output #27 & "[2J"
setvar $output $output&"**"
if (($bot~who_is_online <> "0") and ($bot~who_is_online <> ""))
	setvar $i 1
	listactivescripts $scripts
	setvar $found false
	while ($i <= $scripts)
		getwordpos $scripts[$i] $pos "online.cts"
		if ($pos > 0)
			setvar $found true
		end
		add $i 1
	end
	if ($found = true)
		setvar $output $output&ansi_15&"---------------------------------------"&ansi_13&" Who's Online? "&ansi_15&"---------------------------------------------*"
		setvar $output $output&ansi_10&""&ansi_7&$bot~who_is_online
	else
		setvar $bot~who_is_online ""
		savevar $bot~who_is_online
	end
else
	if ($bot~who_is_online = "0")
		setvar $bot~who_is_online ""
		savevar $bot~who_is_online
	end
end
if ($battle_screen = true)
	setvar $output $output&ansi_15&"---------------------------------------------------------------------------------------------------*"
	gosub :map~displaynavigation
	setvar $output $output&$map~map&"*"
else

	if (($window_content <> "") and ($window_content <> "0"))
		if ($window_content = $previous_window_content)
			add $window_content_time 500
		else
			setvar $window_content_time 0
		end
		if ($window_content_time < 120000)
			setvar $output $output&ansi_15&"------------------------------------"&ansi_13&" Script Status Window "&ansi_15&"-----------------------------------------*"
			setvar $output $output&ansi_10&""&ansi_15&$window_content&"*"
			setvar $previous_window_content $window_content
		else
			setvar $window_content ""
			savevar $window_content
			setvar $switchboard~window_content ""
			savevar $switchboard~window_content
			setvar $window_content_time 0
		end
	else
		if ($window_content = "0")
			setvar $window_content ""
			savevar $window_content
		end
	end
	setvar $output $output&ansi_15&"---------------------------------"&ansi_13&" Communications "&ansi_15&"--------------------------------"&ansi_13&" Stats "&ansi_15&"-----------*"

	splittext $window_content $window_linecount "*"
	splittext $bot~who_is_online $who_linecount "*"

	setvar $i $figsize
	setvar $j 1
	setvar $fighter_output ""
	setvar $figlines 0
	while ($i >= 1)
		setvar $line $figs[$i]
		if ($line <> "")
			setvar $fighter_output $fighter_output&$line&"*"
			add $figlines 1
		end
		subtract $i 1
	end

	setvar $subtract_com_lines 0
	if ($bot~who_is_online <> "")
		add $subtract_com_lines $who_linecount
	end
	if ($window_content <> "")
		add $subtract_com_lines $window_linecount
	end
	add $subtract_com_lines $figlines

	setvar $i ($comm_window_size - $subtract_com_lines)
	setvar $j 1
	while ($i >= 0)
		setvar $line $coms[($comm_window_start_index+$i)]
		getwordpos $line $posf "F"
		getwordpos $line $posr "R"
		getwordpos $line $posp "P"
		getwordpos $line $posplus "+"

		#if (($posF = 1) OR ($posR = 1) OR ($posP = 1) OR ($posPlus = 1))
		setvar $line_length ($comm_line_length+24)
		#else
		#	setVar $line_length $comm_line_length
		#end
		getlength $line $length
		while ($length <= $line_length)
			setvar $line $line&" "
			getlength $line $length
		end
		replacetext $stats[$j] ":" ansi_14&":"&ansi_11
		replacetext $stats[$j] "|" ansi_5&":"&ansi_11
		setvar $output $output&$line&" "&ansi_5&$stats[$j]
		subtract $i 1
		add $j 1
	end
end
if ($fighter_output <> "")
	setvar $output $output&ansi_15&"-----------------------------------------"&ansi_2&" Fighter Hits "&ansi_15&"--------------------------------------------*"&$fighter_output
else
	setvar $output $output&"*"
end
setvar $output $output&ansi_15&"--------"&ansi_12&" "&ansi_5&"["&ansi_2&"'"&ansi_5&"]"&ansi_15&"Sub ("&$bot~subspace&") "&ansi_15&"----- "&ansi_5&"["&ansi_2&"`"&ansi_5&"]"&ansi_15&"Fed "&ansi_15&"---- "&ansi_5&"Page ["&ansi_2&"U"&ansi_5&"]p Chat "&ansi_15&"--"&ansi_5&" Page "&ansi_5&"["&ansi_2&"D"&ansi_5&"]own Chat "&ansi_15&"---- "
loadvar $bot~subspace

if ($ignoreme = true)
	setvar $output $output&ansi_5&"["&ansi_2&"+"&ansi_5&"]Show Me"&ansi_15&" ---------*"
else
	setvar $output $output&ansi_5&"["&ansi_2&"+"&ansi_5&"]Ignore Me"&ansi_15&" -------*"
end

if ($output <> $old_output)
	echo $output
	setvar $old_output $output
end
return

:checksilent
:msgs_on_again
killtrigger onmsgs_on
killtrigger onmsgs_off
killtrigger silentdelay
settexttrigger onmsgs_on  :onmsgs_on "Displaying all messages."
settexttrigger onmsgs_off :onmsgs_off "Silencing all messages."
send "|"
pause

:onmsgs_off
killtrigger onmsgs_on
setvar $was_silent false
goto :msgs_on_again

:onmsgs_on
killtrigger onmsgs_off
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf = true)
	gosub :menus~doneprefer
end
killtrigger silentdelay
setdelaytrigger    silentdelay :checksilent 900000
pause

:killchattriggers
killtrigger lookforp
killtrigger lookforr
killtrigger lookforf
killtrigger lookforf2
killtrigger lookforr2
killtrigger lookforselfr
killtrigger lookforselff
killtrigger open
killtrigger talk
killtrigger talk2
killtrigger talk3
killtrigger talk4
killtrigger talk5
killtrigger talk6
killtrigger talk7
killtrigger talk8
killtrigger silentdelay
killtrigger fighit
killtrigger offfighit
killtrigger limpet
killtrigger lookforselfmul
killtrigger enter
killtrigger delay
killtrigger lookforp
killtrigger ignore
killtrigger ignore2
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\map\displaynavigation\map"
include "source\bot_includes\player\commasize\player"
