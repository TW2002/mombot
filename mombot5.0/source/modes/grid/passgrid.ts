# Modified LoneStars Passive Gridder to suite MOMBOT
# All credits to the legend himself for this one!
#
#	Hammer - MOdifying to use EPHaggle and Sector Params
#            - Add filters for density
#            - Smarter filter on twarp/next sector
#		- paranoid/safe options - NextReport options
#   to do - remove aliens, enter sectors with level 4 planets (dangerous!)
#		- Store "explored" sectors for a while - option to clear it. so it can resume

#=--------                                                                       -------=#
#=---------------------      LoneStar's Passive Gridder      -------------------------=#
#=--------                                                                       -------=#
#		Incep Date	:	Circa August 2007
#		Author		:	LoneStar
#		TWX			:	For TWX 2.04 Final
#
#		Credits		:	Mind Daggers QUIKSTATS, and GETCOURSE routines
#
#		To Run		:	You will Need the following addressed
#                                   - Command Prompt
#                                   - Density Scanner (at least)
#									- More Than 10 Fighters
#									- More than 10,000 creds (for buying fuel)
#                                   - have _ck_callsaveme.cts in scripts
#									- ZTM not required, but CIM will need to be updated
#								      periodically.
#
#		Fixes       :	Initial Release (work in progress)
#
#		Description	:   Passive Gridder that doesnt' holo-scan, and uses twarp when boxed in.
#                       Will update fig/limps lists if desired to SectorParam's, but also updates
#                       the FIGSEC as it moves
#						It's a good idea to update your deployed limp data, as the the Gridder will report
#						if, for example, an adjacent possibly has someone cloaked.
#
#		Notes:          Modified quikstats to change CURRENTTURNS to 68536, if $UNLIM ='s TRUE
#                       Had to use two Arrays: $DENS and $ANOM for: Adj Warp Count, and
#                       Anomoly readings in adj sectors as TWX is more than a little retarded
#                       (SECTOR.ANOMOLY[idx] doesn't work, and SECTOR.WARPCOUNT isn't accurate)
#

reqrecording
clearallavoids
gosub :loadvars~loadvars
gosub :help~initialize

loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $bot~limp_file
loadvar $bot~armid_file
loadvar $bot~folder
setvar $log_fname $bot~folder&"/"&gamename&"_PassiveGrid.log"

setvar $help~help[1]  $help~tab&"       LS Passive Gridder - Still the best "
setvar $help~help[2]  $help~tab&"       "
setvar $help~help[3]  $help~tab&" lspassgrid [stopturns] {a1/a2/a3} {l1/l2/l3} {ports}"
setvar $help~help[4]  $help~tab&"            {holo} {trade} {restock} {filter} {ignore:}"
setvar $help~help[5]  $help~tab&" Options:"
setvar $help~help[6]  $help~tab&"    [stopturns]     Passive Grid Stops at here"
setvar $help~help[7]  $help~tab&"	   {a1/a2/a3}      Drop 1/2/3 Armid Mines"
setvar $help~help[8]  $help~tab&"	   {l1/l2/l3}      Drop 1/2/3 Limpet Mines"
setvar $help~help[9]  $help~tab&"    {ports}         Grabs port reports"
setvar $help~help[10]  $help~tab&"    {holo}         Holo Scans to ensure sectors safe"
setvar $help~help[11]  $help~tab&"    {trade}        Will trade ports looking for Equ MCIC"
setvar $help~help[12]  $help~tab&"                   Requires EP Haggle or equiv"
setvar $help~help[13]  $help~tab&"    {safe}         Twarps to Limpet sectors only"
setvar $help~help[14]  $help~tab&"    {paranoid}     Twarp to Limpet and Mines only"
setvar $help~help[15]  $help~tab&"    {nextreport}   Next sector requires an adj port report."
setvar $help~help[16]  $help~tab&"    {restock}      Buys more Limpets and Mines."
setvar $help~help[17]  $help~tab&"    {filter}       Filters mines/armids/planets to detect"
setvar $help~help[18]  $help~tab&"                   safe sectors. run >limps >armids 1st"
setvar $help~help[19]  $help~tab&"    {ignorea}      Uses holo scan to passive grid alien figs"
setvar $help~help[20]  $help~tab&"    {resume}       Roughly resumes last run"
setvar $help~help[21]  $help~tab&"    {ignore:}      Ignore corp or trader fighters"
setvar $help~help[22]  $help~tab&"    {skip:}        Skips sectors with this param !=0 !=''"
setvar $help~help[23]  $help~tab&"    {lock:PARAM=n} Lock grid to this param - WHICHBUB=2"
setvar $help~help[24]  $help~tab&"    {twenty}       Drop 20 fighters in density 0 sectors"
setvar $help~help[25]  $help~tab&"    Doesn't require ZTM but works better"
setvar $help~help[26]  $help~tab&"    Works best with T-Warp to reroute"

gosub :help~helpfile

setvar $switchboard~message "LoneStar's Passive Gridder starting up!*"
gosub :switchboard~switchboard

setvar $tagline     "LoneStar's Passive Gridder"
setvar $taglineb     $bot~bot_name
setvar $taglinec     $bot~bot_name

setvar $turn_limit 20
setarray $chkd	sectors
setarray $anom	10
setarray $dens	10
setarray $limps	sectors
setvar $update_limps		false
setvar $update_figs		false
setvar $update_port		false

setvar $droping_mines	0
setvar $drop_limp 0
setvar $drop_armid 0

setarray $log_entries 5
setvar $log_entries[1] ""
setvar $log_entries[2] ""
setvar $log_entries[3] ""
setvar $log_entries[4] ""
setvar $log_entries[5] ""

setvar $dep_figs	0
setvar $dep_limp	0
setvar $dep_new	0
setvar $log_event	0
setvar $holo		false
setvar $tracker	false
setvar $restorehaggle 0
setvar $equ_min 50
setvar $equ_min_buy 25
setvar $drop_twenty	0
setvar $filter_density 0

setvar $planet~planetsinsectors sectors

if ($map~rylos < 1)
	setvar $report_rylos 	true
end
if ($map~alpha_centauri < 1)
	setvar $report_alpha	true
end
setvar $player~save true

gosub :player~quikstats
setvar $unlim $player~unlimitedgame
if ($player~total_holds <= $equ_min)

end

setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "Must be started from Command prompt.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~scan_type = "None")
	setvar $switchboard~message "Must At Least Have a Density Scanner.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~fighters < 10)

	setvar $switchboard~message "Must At More than 10 Fighters.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~credits < 10000)

	setvar $switchboard~message "Must At Least Have 10,000 creds.*"
	gosub :switchboard~switchboard
	halt
end

setvar $update_figs false
setvar $update_limps false

setvar $turn_limit $bot~parm1
isnumber $number $turn_limit

if (($unlim = false) and (($number <> 1) or ($turn_limit = 0)))
	setvar $switchboard~message "Please select what turns to halt at.*"
	gosub :switchboard~switchboard
	halt

end

getwordpos $bot~user_command_line $pos "ignore:"
if ($pos > 0)
	gettext $bot~user_command_line $ignore "ignore:" " "

	if ($ignore = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $ignore "ignore:" " "
	end
	replacetext $bot~user_command_line " ignore:" & $ignore & " " " "
	replacetext $bot~user_command_line " ignore:" & $ignore " "
end

getwordpos $bot~user_command_line $pos "skip:"
if ($pos > 0)
	gettext $bot~user_command_line $skipparam "skip:" " "

	if ($skipparam = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $skipparam "skip:" " "
	end
	replacetext $bot~user_command_line " skip:" & $skipparam & " " " "
	replacetext $bot~user_command_line " skip:" & $skipparam " "
	uppercase $skipparam
end

getwordpos $bot~user_command_line $pos "lock:"
if ($pos > 0)
	gettext $bot~user_command_line $lockparamtemp "lock:" " "

	if ($lockparamtemp = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $lockparamtemp "lock:" " "

	end
	replacetext $bot~user_command_line " lock:" & $lockparamtemp & " " " "
	replacetext $bot~user_command_line " lock:" & $lockparamtemp " "

	setvar $temp $lockparamtemp

	replacetext $temp "=" " "
	getword $temp $lockparam 1
	getword $temp $lockvalue 2
	if ($lockparam = "") or ($lockvalue = "")
		setvar $switchboard~message "Issue with Lock syntax try LOCK:WHICHBUB=2*"
		gosub :switchboard~switchboard
		halt
	end
	uppercase $lockparam
end

getwordpos $bot~user_command_line $pos "a1"
if ($pos > 0)
	setvar $drop_armid 1
end
getwordpos $bot~user_command_line $pos "a2"
if ($pos > 0)
	setvar $drop_armid 2
end
getwordpos $bot~user_command_line $pos "a3"
if ($pos > 0)
	setvar $drop_armid 3
end

getwordpos $bot~user_command_line $pos "l1"
if ($pos > 0)
	setvar $drop_limp 1
end
getwordpos $bot~user_command_line $pos "l2"
if ($pos > 0)
	setvar $drop_limp 2
end
getwordpos $bot~user_command_line $pos "l3"
if ($pos > 0)
	setvar $drop_limp 3
end

setvar $lsdstring ""
if (($drop_armid > 0) and ($drop_limp > 0))
	setvar $droping_mines 3
	setvar $lsdstring "0@0@0@0@0@N@M@M@0@N@0@0@N@0@0@0@0@0@0@0"
elseif ($drop_armid > 0)

	setvar $droping_mines 2
	setvar $lsdstring "0@0@0@0@0@N@N@M@0@N@0@0@N@0@0@0@0@0@0@0"
elseif ($drop_limp > 0)

	setvar $droping_mines 1
	setvar $lsdstring "0@0@0@0@0@N@M@N@0@N@0@0@N@0@0@0@0@0@0@0"
else
	setvar $droping_mines 0
end

setvar $alllimps 0
setvar $allarmids 0

getwordpos $bot~user_command_line $pos "filter"
if ($pos > 0)
	setvar $filter_density 1
	readtoarray $bot~limp_file $alllimps
	readtoarray $bot~armid_file $allarmids
end

setvar $update_port false
getwordpos $bot~user_command_line $pos "ports"
if ($pos > 0)
	setvar $update_port true
end

setvar $holo false
getwordpos $bot~user_command_line $pos "holo"
if ($pos > 0)
	setvar $holo true
end

setvar $drop_twenty 0
getwordpos $bot~user_command_line $pos "twenty"
if ($pos > 0)
	setvar $drop_twenty 1
end

setvar $twarp_safety 0
getwordpos $bot~user_command_line $pos "safe"
if ($pos > 0)
	setvar $twarp_safety 1
end

getwordpos $bot~user_command_line $pos "paranoid"
if ($pos > 0)
	setvar $twarp_safety 2
end

setvar $tracker false
getwordpos $bot~user_command_line $pos "trade"
if ($pos > 0)
	setvar $tracker true
end

setvar $nextrequiresreport 0
getwordpos $bot~user_command_line $pos "nextreport"
if ($pos > 0)
	setvar $nextrequiresreport 1
end

setvar $restock 0
getwordpos $bot~user_command_line $pos "restock"
if ($pos > 0)
	setvar $restock 1
end

getwordpos $bot~user_command_line $pos "resume"
if ($pos > 0)
	setvar $r 11
	while ($r <= sectors)
		getsectorparameter $r "LSCHK" $lschk
		if ($lschk = true)
			setvar $chkd[$r] 1
		else
			setvar $chkd[$r] 0
		end
		add $r 1
	end

else
	setvar $r 11
	while ($r <= sectors)
		setsectorparameter $r "LSCHK" false
		add $r 1
	end

end

setvar $ignorea 0
getwordpos $bot~user_command_line $pos "ignorea"
if ($pos > 0)
	setvar $ignorea 1
end

if ($filter_density = 1)
	gosub :getpersonalplanets
end

goto :lets_get_it_on

:lets_get_it_on
gettime $stamp "t d/m/yy"
if ($tracker)
	setvar $mcicd	0
	setarray $mcic	sectors

	setvar $m 11
	while ($m <= sectors)
		getsectorparameter $m "EQUIPMENT-" $mtest
		isnumber $tst $mtest
		if ($tst)

			setvar $mcic[$m] true
			add $results 1
			add $mcicd 1
		end
		add $m 1
	end

else
	if ($player~equipment_holds > 0)
		send "   j   y   "
	end
end

write $log_fname "-------------------------{ " & $stamp & " }-------------------------"
echo "***"
if ($update_figs)
	#echo ($TAGLINEc & " " & ANSI_8&"<"&ANSI_15&"ReFreshing Deployed Fighter Data"&ANSI_8&">*")
	gosub :build_fig_list
end

#echo ($TAGLINEc & " " & ANSI_8&"<"&ANSI_15&"Reading Figs"&ANSI_8&">*")
setvar $idx 1
while ($idx <= sectors)
	getsectorparameter $idx "FIGSEC" $flag
	isnumber $tst $flag
	if ($tst <> 0)
		if ($flag <> 0)
			add $dep_figs 1
		end
	else
		setsectorparameter $idx "FIGSEC" false
	end
	add $idx 1
end

if ($dep_figs = 0)
	echo ($taglinec & " " & ansi_8&"<"&ansi_15&"No Deployed Fighter Data Found"&ansi_8&">*")
	halt
else
	echo ($taglinec & " " & ansi_8&"<"&ansi_15&"Deployed Fighters "&ansi_14&" : "&ansi_15&$dep_figs&ansi_8&">*")
end

if ($update_limps)
	echo ($taglinec & " " & ansi_8&"<"&ansi_15&"ReFreshing Limpet Data"&ansi_8&">*")
	gosub :build_limp_list
else
	echo ($taglinec & " " & ansi_8&"<"&ansi_15&"Reading Limps"&ansi_8&">*")
	setvar $idx 1
	while ($idx <= sectors)
		getsectorparameter $idx "LIMPSEC" $flag
		isnumber $tst $flag
		if ($tst <> 0)
			if ($flag > 0)
				setvar $limps[$idx] 1
				add $dep_limp 1
			end
		end
		add $idx 1
	end
end

window status 500 245 (" " & $tagline & " v" & $version)
#echo "**"
#echo ($TAGLINEc & " " & ANSI_8&"<"&ANSI_15&"Gridded Sectors: "&ANSI_14&$DEP_FIGS&ANSI_8&">*")
#echo ($TAGLINEc & " " & ANSI_8&"<"&ANSI_15&"Limp'd Sector  : "&ANSI_14&$DEP_LIMP&ANSI_8&">**")

send " C ;UYQ "
waitfor "Max Figs Per Attack:"
getword currentline $maxfigattack 5
striptext $maxfigattack ","
isnumber $tst $maxfigattack
if ($tst = 0)
	setvar $maxfigattack 9999
end

:passgrid_main_loop
gosub :player~quikstats
if ($unlim = false)
	if ($player~turns <= $turn_limit)
		goto :passgrid_main_done
	end
end

:to_the_top
gosub :restorehaggle
setvar $anon_ptr 1
settextlinetrigger	turnsgone	:turnsgone	"Do you want instructions (Y/N) [N]?"

send "SZND*"
waiton "Relative Density Scan"
killalltriggers
settextlinetrigger	1	:getwarp "Sector "
settexttrigger		2	:gotwarpinfo "Command [TL="
pause

:getwarp
getword currentline $anm 13
gettext currentline $temp "Warps :" "NavHaz :"
striptext $temp " "
striptext $temp ","

setvar $dens[$anon_ptr] $temp
setvar $anom[$anon_ptr] $anm
add $anon_ptr 1
settextlinetrigger	1	:getwarp "Sector "
pause

:gotwarpinfo
killalltriggers

if ($tracker)
	gosub :haggel_checker
elseif (($player~ore_holds < $player~total_holds) and ($player~twarp_type <> "No"))

	if ((port.class[$player~current_sector] = 3) or (port.class[$player~current_sector] = 4) or (port.class[$player~current_sector] = 5) or (port.class[$player~current_sector] = 7))
		#Echo "***Stupid Attmpt**"
		if (haggle)
			setvar $restorehaggle 1
			autohaggle off
		end
		send "P T ** 0* 0* "

	end
end
if ($restock = 1)
	if ($player~credits < 100000)
		send ("'["&$taglineb&"] Restocking halted as credits low*")
		setvar $restock 0
	end

	if (($player~ore_holds = $player~total_holds) and ($player~twarp_type <> "No"))

		setvar $dorestock 0
		if (($drop_armid > 0) and ($drop_limp > 0))
			if (($player~armids < 4) or ($player~limpets < 4))
				setvar $dorestock 1
			end
		elseif ($drop_armid > 0)
			if ($player~armids < 4)
				setvar $dorestock 1
			end
		elseif ($drop_limp > 0)
			if ($player~limpets < 4)
				setvar $dorestock 1
			end

		end
		if ($dorestock = 1)
			setvar $bot~command "lsd"
			setvar $bot~user_command_line $lsdstring
			setvar $bot~parm1 $lsdstring

			savevar $bot~parm1

			savevar $bot~command
			savevar $bot~user_command_line
			load "scripts\"&$bot~mombot_directory&"\modes\resource\lsd.cts"
			seteventtrigger        moveended        :moveended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\lsd.cts"
			pause

			:moveended
			killalltriggers
			gosub :player~quikstats
			gosub :resetminesafterrestock
		end
	end
end

setarray $adj_targets sector.warpcount[$player~current_sector]
setarray $filtered_density sector.warpcount[$player~current_sector]

setvar $holorequired 0
setvar $firstfilter 1

:refilter
setvar $i 1
while ($i <= sector.warpcount[$player~current_sector])
	setvar $adj sector.warps[$player~current_sector][$i]
	setvar $currentdensity sector.density[$adj]
	if ($filter_density = 1)
		if ($planet~planetsinsectors[$adj] > 0)
			subtract $currentdensity (500 * $planet~planetsinsectors[$adj])
		end
		if ($alllimps[$adj] > 0)
			subtract $currentdensity (2 * $alllimps[$adj])
			setvar $anom[$i] "No"
		end
		if ($allarmids[$adj] > 0)
			subtract $currentdensity (10 * $allarmids[$adj])
		end

	end
	if (($ignorea = 1) or (($ignore <> "") and ($ignore <> "0")))
		if ($firstfilter = 1)
			getsectorparameter $adj "FIGSEC" $flag
			isnumber $tst $flag
			if ($tst = 0)
				setvar $flag 0
				setsectorparameter $adj "FIGSEC" false
			end
			if (($flag = 0) and (($currentdensity <> 0) and $currentdensity <> 100))
				# not our fig there, and density not passive
				setvar $holorequired 1
			end
		else
			setvar $figsowner sector.figs.owner[$adj]
			lowercase $figsowner
			getwordpos $figsowner $whereowner "belong to"
			getwordpos $figsowner $whereownercorp "belong to corp#"&$ignore
			getwordpos $figsowner $whereownerplayer "belong to "&$ignore
			if ($whereowner = 0)
				if (sector.figs.quantity[$adj] < $player~fighters)
					subtract $currentdensity (sector.figs.quantity[$adj] * 5)
				end
			elseif (($whereownercorp > 0) or ($whereownerplayer > 0))
				if (sector.figs.quantity[$adj] < $player~fighters)
					subtract $currentdensity (sector.figs.quantity[$adj] * 5)
				end
			end

		end

	end

	setvar $filtered_density[$i] $currentdensity
	add $i 1
end

if ($holorequired = 1)
	setvar $firstfilter 0
	setvar $holorequired 0
	send "zn"
	waitfor "o you want instructions (Y/N) [N]?"
	gosub :do_holo

	goto :refilter

end

setvar $i 1
while ($i <= sector.warpcount[$player~current_sector])
	setvar $adj sector.warps[$player~current_sector][$i]
	setvar $adj_targets[$i] 10
	setvar $currentdensity $filtered_density[$i]

	if (sector.navhaz[$adj] <> 0)
		setvar $filter 0
		setvar $filter (sector.navhaz[$adj] * 21)
		setvar $filter ($currentdensity - $filter)
	else
		setvar $filter $currentdensity
	end

	if ($adj < 10)
		setvar $buff "    "
	elseif ($adj < 100)
		setvar $buff "   "
	elseif ($adj < 1000)
		setvar $buff "  "
	elseif ($adj < 10000)
		setvar $buff " "
	else
		setvar $buff ""
	end

	getsectorparameter $adj "FIGSEC" $flag
	isnumber $tst $flag

	if ($tst = 0)
		setvar $flag 0
		setsectorparameter $adj "FIGSEC" false
	end

	if ($skipparam <> "")
		getsectorparameter $adj $skipparam $skipchk
		if ($skipchk = "")
			setvar $skipchk 0
		end

		if ($skipchk <> 0)
			goto :next_adj_please

		end

	end

	if ($lockparam <> "")
		getsectorparameter $adj $lockparam $lockchk
		if ($lockchk = "")
			setvar $lockchk 0
		end

		if ($lockchk <> $lockvalue)
			goto :next_adj_please

		end

	end

	# Log anything interesting

	if (($currentdensity > 200) and ($flag = 0))
		setvar $strmsg ("Sect: " & $buff & $adj & " Den: " & $currentdensity & " Haz: " & sector.navhaz[$adj] & "% Filtered: " & $filter)
		write $log_fname $strmsg
		add $log_event 1
		setvar $log_text $strmsg
		gosub :move_down
		send ("'["&$taglineb&"] " & $strmsg & "*")
		waitfor "Message sent on sub-space channel"
	elseif (sector.navhaz[$adj] <> 0)
		setvar $strmsg ("NavHaz in Sect: " & $buff & $adj & " Den: " & $currentdensity & " Haz: " & sector.navhaz[$adj] & "% Filtered: " & $filter)
		write $log_fname $strmsg
		add $log_event 1
		setvar $log_text $strmsg
		gosub :move_down
		send ("'["&$taglineb&"] " & $strmsg & "*")
		waitfor "Message sent on sub-space channel"
	end
	if ((($currentdensity = 0) or ($currentdensity = 5)) and ($anom[$i] = "Yes"))
		setvar $strmsg ("Cloaked Ship, Sect: " & $buff & $adj & " Den: " & $currentdensity & " Haz: " & sector.navhaz[$adj] & "% Filtered: " & $filter)
		write $log_fname $strmsg
		add $log_event 1
		setvar $log_text $strmsg
		gosub :move_down
		send ("'["&$taglineb&"] " & $strmsg & "*")
		waitfor "Message sent on sub-space channel"
	end

	if (($currentdensity = 40) or ($currentdensity = 45) or ($currentdensity = 140) or ($currentdensity = 145))
		setvar $strmsg ("Possible Trader, Sect: " & $buff & $adj & " Den: " & $currentdensity & " Haz: " & sector.navhaz[$adj] & "% Filtered: " & $filter)
		write $log_fname $strmsg
		add $log_event 1
		setvar $log_text $strmsg
		gosub :move_down
		send ("'["&$taglineb&"] " & $strmsg & "*")
		waitfor "Message sent on sub-space channel"
	end

	# END LOG

	# Skip Limps
	if (($anom[$i] = "Yes") and ($limps[$adj] = 0))
		goto :next_adj_please
	end

	#prioritise sectors nextdoor
	if ($flag = 0)
		if (($currentdensity = 0) or ($currentdensity = 100))
			if (sector.navhaz[$adj] = 0)
				if (sector.explored[$adj] <> "YES")
					if ($dens[$i] > 1)
						setvar $adj_targets[$i] 1
						goto :next_adj_please
					end
				end
			end
		end

		if (($currentdensity = 0) or ($currentdensity = 100))
			if (sector.navhaz[$adj] = 0)
				if (sector.explored[$adj] = "YES")
					if ($dens[$i] > 1)
						setvar $adj_targets[$i] 2
						goto :next_adj_please
					end
				end
			end
		end
		if (($currentdensity = 0) or ($currentdensity = 100))
			if (sector.navhaz[$adj] = 0)
				if (sector.explored[$adj] <> "YES")
					if ($dens[$i] >= 1)
						setvar $adj_targets[$i] 3
						goto :next_adj_please
					end
				end
			end
		end
		if (($currentdensity = 0) or ($currentdensity = 100))
			if (sector.navhaz[$adj] = 0)
				if (sector.explored[$adj] = "YES")
					if ($dens[$i] >= 1)
						setvar $adj_targets[$i] 4
						goto :next_adj_please
					end
				end
			end
		end
	end

	if (($currentdensity = 105) or ($currentdensity = 5))
		if (sector.navhaz[$adj] = 0)
			if (sector.explored[$adj] <> "YES")
				if ($flag <> 0)
					if ($dens[$i] > 1)
						setvar $adj_targets[$i] 5
						goto :next_adj_please
					end
				end
			end
		end
	end

	# The next two seem illogical because there explored and figged.
	# However, I assume if you have no t-warp, it makes sense.
	# Hammer: Adding twarp filter

	if ($player~twarp_type = "No")
		# If density is 105 or 5, and 5+ warps, no hz, has fig, not checked - go there? but why
		if (($currentdensity = 105) or ($currentdensity = 5))
			#if (SECTOR.EXPLORED[$adj] <> "YES")
			if (sector.warpcount[$adj] >= 5)
				if (sector.navhaz[$adj] = 0)
					if ($flag = 1)
						if ($dens[$i] >= 1)
							if ($chkd[$adj] = 0)
								setvar $adj_targets[$i] 6
								goto :next_adj_please
							end
						end
					end
				end
			end
		end
		if (($currentdensity = 105) or ($currentdensity = 5))
			#if (SECTOR.EXPLORED[$adj] <> "YES")
			if (sector.warpcount[$adj] > 1)
				if (sector.navhaz[$adj] = 0)
					if ($flag = 1)
						if ($dens[$i] >= 1)
							if ($chkd[$adj] = 0)
								setvar $adj_targets[$i] 6
								goto :next_adj_please
							end
						end
					end
				end
			end
		end
	end

	:next_adj_please
	add $i 1
end

setvar $idx 1
setvar $target 10
setvar $target_idx 0

while ($idx <= sector.warpcount[$player~current_sector])
	if (($adj_targets[$idx] < $target) and ($target <> 0))
		setvar $target $adj_targets[$idx]
		setvar $target_idx $idx
	end
	add $idx 1
end

if ($target_idx <> 0)
	setvar $target sector.warps[$player~current_sector][$target_idx]
	if (sector.density[$target] >= 100)
		send " c r"&$target&"*q"
		settextlinetrigger	nodata1	:nodata		"You have never visted sector"
		settextlinetrigger	nodata2	:nodata		"I have no information about a port in that sector"
		settextlinetrigger	yadata1	:yadata		"Items     Status  Trading % of max OnBoard"
		settextlinetrigger	yadata2	:yadata		"A  Cargo holds     :"
		pause

		:nodata
		killalltriggers
		if ($holo)
			gosub :do_holo
			gosub :display_holo
			waiton	"Command [TL="
			if (sector.figs.quantity[$target] <> 0)
				if ((sector.figs.owner[$target] <> "belong to your Corp") and (sector.figs.owner[$target] <> "yours"))
					#Trying Again, but this time ignoring $Target
					setvar $ignore $target
					setvar $idx 1
					setvar $target 10
					setvar $target_idx 0
					while ($idx <= sector.warpcount[$player~current_sector])
						if ($adj_targets[$idx] < $target) and ($target <> 0) and (sector.warps[$player~current_sector][$idx] <> $ignore)
							setvar $target $adj_targets[$idx]
							setvar $target_idx $idx
						end
						add $idx 1
					end
					if ($target_idx <> 0)
						setvar $target sector.warps[$player~current_sector][$target_idx]
					else
						goto :no_target
					end
				end
			end
		end

		:yadata
		killalltriggers
	end
	goto :next_target
end

:no_target
if ($player~twarp_type <> "No")
	#Find A Place To Twarp To
	getnearestwarps $warparray $player~current_sector
	getrnd $w 5 10
	while ($w <= $warparray)
		setvar $focus $warparray[$w]
		if ($focus <> $player~current_sector)
			getsectorparameter $focus "FIGSEC" $flag
			isnumber $tst $flag
			if ($tst = 0)
				setvar $flag 0
				setsectorparameter $focus "FIGSEC" false
			end
			if ($flag <> false)
				if ($twarp_safety = 1)
					getsectorparameter $focus "LIMPSEC" $flag
					isnumber $tst $flag
					if ($tst = 0)
						setvar $flag 0
						setsectorparameter $focus "LIMPSEC" false
					end
				elseif ($twarp_safety = 2)

					getsectorparameter $focus "LIMPSEC" $flag1
					isnumber $tst1 $flag1
					if ($tst1 = 0)
						setvar $flag1 0
						setsectorparameter $focus "LIMPSEC" false
					end

					getsectorparameter $focus "MINESEC" $flag2
					isnumber $tst2 $flag2
					if ($tst2 = 0)
						setvar $flag2 0
						setsectorparameter $focus "MINESEC" false
					end

					if (($flag1 = 0) or ($flag2 = 0))
						setvar $flag 0
					else
						setvar $flag 1
					end

				end
			end
			if ($flag <> 0)
				if (sector.warpcount[$focus] > 1)
					setvar $w_i 1
					while ($w_i <= sector.warpcount[$focus])
						setvar $w_adj sector.warps[$focus][$w_i]
						getsectorparameter $w_adj "FIGSEC" $flag
						isnumber $tst $flag
						# check for a fig, if no fig it is a candidate
						if ($tst = 0)
							setvar $flag 0
							setsectorparameter $w_adj "FIGSEC" false
						end

						setvar $skipwarp 0
						if ($skipparam <> "")
							getsectorparameter $w_adj $skipparam $skipchk
							if ($skipchk = "")
								setvar $skipchk 0
							end
							if ($skipchk <> 0)
								setvar $skipwarp 1
							end
						end

						if ($lockparam <> "")
							getsectorparameter $adj $lockparam $lockchk
							if ($lockchk = "")
								setvar $lockchk 0
							end
							if ($lockchk <> $lockvalue)
								setvar $skipwarp 1
							end
						end

						if (($flag = 0) and ($chkd[$w_adj] <> 1) and ($skipwarp = 0))
							setvar $chkd[$w_adj] 1
							if ($nextrequiresreport = 1)

								setvar $portok 0
								if (port.exists[$w_adj] = 1)
									send "cr" $w_adj "*q"
									waitfor "Computer activate"
									settextlinetrigger portexists :portexists "Commerce report for"
									settextlinetrigger portexistsno :portexistsno "I have no information about a port in that sector"
									settextlinetrigger portexistsno2 :portexistsno2 "u have never visted sector"
									pause

									:portexists
									setvar $portok 1

									:portexistsno
									:portexistsno2
									killtrigger portexistsno
									killtrigger portexistsno2
									killtrigger portexists

								end
								# no port report; it's mark it as checked and try aain
								if ($portok = 1)
									goto :we_got_game
								end
							else

								goto :we_got_game
							end

						end
						add $w_i 1
					end
				end
			end
		end
		add $w 1
	end

	:we_done
	#get here, there's no hope
	echo "**" & $taglinec & " " & " No Target To Find. Try updating CIM***"
	halt

	:we_got_game
	#Echo "***Focus " & $FOCUS & "**"
	if ($holo)
		setvar $cx 1
		setvar $cn 0
		while (sector.warps[$player~current_sector][$cx] <> 0)
			setvar $adj sector.warps[$player~current_sector][$cx]
			if (sector.explored[$adj] = "NO") or (sector.explored[$adj] = "CALC")
				add $cn 1
			end
			add $cx 1
		end
		if ($cn > 2)
			gosub :do_holo
			gosub :display_holo
		end
	end
	setvar $engagestring "Y"
	send " M" & $focus & "*Y"
	settextlinetrigger		sector__good	:sector__good	"Locating beam pinpointed, TransWarp"
	settextlinetrigger		sector__here	:sector__goodnav	"<Set NavPoint>"
	settextlinetrigger		sector__bad		:sector__bad	"No locating beam found"
	settexttrigger				sector__far		:sector__far	"You do not have enough Fuel Ore to make the jump."
	pause

	:sector__bad
	killalltriggers
	goto :we_done

	:sector__far
	killalltriggers
	getnearestwarps $warparray $player~current_sector
	setvar $c 1
	while ($c <= $warparray)
		setvar $focus $warparray[$c]
		if ((port.class[$focus] = 3) or (port.class[$focus] = 4) or (port.class[$focus] = 5) or (port.class[$focus] = 7))
			getsectorparameter $focus "FIGSEC" $flag
			isnumber $tst $flag
			if ($tst = 0)
				setvar $flag 0
				setsectorparameter $focus "FIGSEC" false
			end
			if ($flag = 1)
				setvar $destination $focus
				gosub :getcourse
				if ($courselength <> 0)
					setvar $j 2
					setvar $result ""

					while ($j <= $courselength)
						getsectorparameter $course[$j] "FIGSEC" $flag
						isnumber $tst $flag
						if ($tst = 0)
							setvar $flag 0
							setsectorparameter $course[$j] "FIGSEC" false
						end
						if (($flag = 0) and ($course[$j] <> $player~current_sector))
							goto :next_sxx_port
						end
						setvar $result $result&"m"&$course[$j]&"* "
						if (($course[$j] > 10) and ($course[$j] <> stardock))
							setvar $result ($result&" Z  A  "&$maxfigattack&"*  *  ")
						end
						# If Not FED Space, Drop A Fig, if we haven't already
						if (($course[$j] > 10) and ($course[$j] <> stardock) and ($j > 2))
							getsectorparameter $course[$j] "FIGSEC" $flag
							isnumber $tst $flag
							if ($tst = 0)
								setvar $flag 0
								setsectorparameter $course[$j] "FIGSEC" false
							end
							if ($flag = 0)
								setvar $result ($result&" F  Z  1 * Z  C  D  *  ")
								setsectorparameter $course[$j] "FIGSEC" true
							end
						end
						add $j 1
					end
					waitfor "Command ["

					if ($tracker)
						send ($result&"  **  ")
						gosub :player~quikstats
						gosub :haggel_checker
					else
						send ($result&"  **    P   T   *   *   *   *   ")
					end

					gosub :player~quikstats
					if ($player~total_holds <> $player~ore_holds) and ($tracker = 0)
						if ($player~credits < 10000)
							echo "**" & $taglinec & " " & " Appear To Be Out of Funds for ORE purchase.**"
						elseif (($unlim = false) and (currentturns < 1))
							echo "**" & $taglinec & " " & " Appear To Be Out Turns. Photon'd Maybe??**"
						else
							echo "**" & $taglinec & " " & " Not Enough ORE to continue.**"
						end
						halt
					elseif ($tracker) and ($player~ore_holds < ($player~total_holds - $equ_min))
						if ($player~credits < 10000)
							echo "**" & $taglinec & " " & " Appear To Be Out of Funds for ORE purchase.**"
						elseif (($unlim = false) and (currentturns < 1))
							echo "**" & $taglinec & " " & " Appear To Be Out Turns. Photon'd Maybe??**"
						else
							echo "**" & $taglinec & " " & " Not Enough ORE to continue.**"
						end
						halt
					elseif ($player~credits < 10000)
						echo "**" & $taglinec & " " & " Too Few Credits to continue.**"
						halt
					end
					goto :to_the_top
				end
			end
		end

		:next_sxx_port
		add $c 1
	end
	goto :we_done

	:sector__goodnav
	send "*q"
	setvar $engagestring ""

	:sector__good
	killalltriggers
	#echo ("**" & $TAGLINEc & " " & ANSI_8&"<"&ANSI_15&"Twarping To Jump Point: "&ANSI_14&$Focus&ANSI_8&">*")

	setvar $drop_str ""
	if ($droping_mines <> 0)
		if (sector.warpincount[$focus] >= 3)
			if (($droping_mines = 1) or ($droping_mines = 3))
				if ($player~limpets > $drop_limp)
					setvar $drop_str ($drop_str & "H 2 Z "&$drop_limp&"* C * ")
				else
					if ($droping_mines = 1)
						setvar $droping_mines 0
					else
						setvar $droping_mines 2
					end
				end
			end

			if (($droping_mines = 2) or ($droping_mines = 3))
				if ($player~armids > $drop_armid)
					setvar $drop_str ($drop_str & "H 1 Z "&$drop_armid&"* C * ")
				else
					if ($droping_mines = 2)
						setvar $droping_mines 0
					else
						setvar $droping_mines 1
					end
				end
			end
		end
	end
	send $engagestring "  *  A Z " & $maxfigattack & "998877665544332211 n  *  **   " & $drop_str
	gosub :player~quikstats
	goto :to_the_top
else
	echo "**" & $taglinec & " " & " Walled In (No Twarp Available)***"
	halt
end

:next_target
setvar $figstodrop 1
setvar $density_trick false
if (sector.density[$target] = 0)
	if ($drop_twenty = 1)
		setvar $density_trick true
		setvar $figstodrop 20
	end
end
send "  m " & $target & " *  z  a  " & $maxfigattack & "99887766554433221100  n  *  dz  n  f  z  " $figstodrop "*  z  c  d  *  "
settextlinetrigger u_torped :help_me "Your ship was hit by a Photon and has been disabled."
settextlinetrigger no_turns :help_me "You don't have enough turns left."
settextlinetrigger ig_hold1 :help_me "You attempt to retreat but are held fast by an Interdictor Generator."
settextlinetrigger ig_hold2 :help_me "An Interdictor Generator in this sector holds you fast!"
settextlinetrigger quasar_b :help_me "Quasar Blast!"
waiton ":[" & $target & "] (?=Help)"
goto :help_me_jmp

:help_me
killalltriggers
getword currentline $spoofy 1
if ($spoofy <> "Your") and ($spoofy <> "You") and ($spoofy <> "An") and ($spoofy <> "Quasar")
	goto :help_me_jmp
end
stop _ck_callsaveme
stop _ck_callsaveme
send "   N   Y  *  N   *   R   *   Q   Q   Q   Z   N   *   R   *   "
waitfor "Command [TL="
load _ck_callsaveme
waitfor "Message sent on sub-space channel"
halt

:help_me_jmp
add $dep_figs 1
add $dep_new 1
setsectorparameter $target "FIGSEC" true
setvar $chkd[$target] 1

setvar $drop_str ""

if ($density_trick <> true)
	if ($droping_mines <> 0)
		if (sector.warpincount[$target] >= 3)
			if (($droping_mines = 1) or ($droping_mines = 3))
				if ($player~limpets > $drop_limp)
					setvar $drop_str ($drop_str & "H 2 Z "&$drop_limp&"* C * ")
				else
					if ($droping_mines = 1)
						setvar $droping_mines 0
					else
						setvar $droping_mines 2
					end
				end
			end

			if (($droping_mines = 2) or ($droping_mines = 3))
				if ($player~armids > $drop_armid)
					setvar $drop_str ($drop_str & "H 1 Z "&$drop_armid&"* C * ")
				else
					if ($droping_mines = 2)
						setvar $droping_mines 0
					else
						setvar $droping_mines 1
					end
				end
			end
		end
	end
end
if  ($drop_str <> "")
	send $drop_str & "  j  *"
	waiton "Are you sure you want to jettison all cargo?"
end
gosub :player~quikstats

if ($player~current_prompt <> "Command")
	echo "**" & $taglinec & " " & "Wrong Prompt After Sector Hit.***"
	halt
end

if ($tracker)
	gosub :haggel_checker
end

if ($player~current_prompt <> "Command")
	send " r *  *  p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * "
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		load "_ck_callsaveme.cts"
		halt
	else
		echo "**" & $taglinec & " " & "Hmmm..  I seem to be stuck.***"
		halt
	end
end

gosub :updatestatus_window

if (($report_rylos) and (rylos > 1))
	send "'["&$taglineb&"] Class 0 RYLOS Spotted In Sector: " & rylos &"*"
	waitfor "Message sent on sub-space channel"
	setvar $report_rylos	false
end
if (($report_alpha) and (alphacentauri > 1))
	send "'["&$taglineb&"] Class 0 ALPHACENTAURI Spotted In Sector: " & alphacentauri &"*"
	waitfor "Message sent on sub-space channel"
	setvar $report_alpha	false
end

if (($update_port) and (port.exists[$target]))
	send "CR*Q"
	waitfor "<Computer deactivated>"
end

if ($player~fighters <= 10)
	echo "**" & $taglinec & " " & "Fighter Level is Critically Low (Less Than 10)**"
	halt
end
goto :passgrid_main_loop

:passgrid_main_done
gosub :restorehaggle

if ($unlim = 0)
	if (currentturns <= $turn_limit)
		send "'["&$taglineb&"] Turn Limit Reached, Halting*"
	end
else
	send "'["&$taglineb&"] Nothing To Do*"
end

halt

:turnsgone
gosub :restorehaggle
killalltriggers
send "   *   *    *   /"
waiton #179 & "Turns"
gettext currentline $local "Sect" (#179 & "Turns")
striptext $local " "
send "'"
waitfor "Sub-space radio ("
send $local & "=saveme*"
waitfor "Message sent on sub-space channel"
send "F  Z  1*  Z  C  D  *  "
setdelaytrigger		nohelpcomming	:nohelpcomming	4000
settextlinetrigger	helpcame		:helpcame		"Saveme script activated - "
pause

:nohelpcomming
killalltriggers
send "'["&$taglineb&"] No Help Came.*"
halt

:helpcame
killalltriggers
gettext currentline $planet~planet "Planet" "to"
striptext $planet~planet " "
send "L Z" & #8 & $planet~planet & "*  J  C  *  "
halt

:build_fig_list
killalltriggers
send "'Scanning Deployed Fighters...*G"
setvar $idx 1
while ($idx <= sectors)
	setsectorparameter $idx "FIGSEC"	false
	add $idx 1
end
killalltriggers
waitfor "==========================================================="
settextlinetrigger figline1		:addinfigc	" Corp "
settextlinetrigger figline2		:addinfigp	" Personal "
settextlinetrigger lstbottom	:lstbottom	" Total "
settextlinetrigger lstnone		:lstbottom	"No fighters deployed"
pause

:addinfigp
getword currentline $sector 1
setsectorparameter $sector "FIGSEC" true
add $dep_figs 1
settextlinetrigger figline2		:addinfigp	" Personal "
pause

:addinfigc
getword currentline $sector 1
setsectorparameter $sector "FIGSEC" true
add $dep_figs 1
settextlinetrigger figline1		:addinfigc	" Corp "
pause

:lstbottom
killalltriggers

return

:build_limp_list
killalltriggers
setarray $limps	sectors

setvar $idx		1
while ($idx <= sectors)
	setsectorparameter $idx "LIMPSEC"	0
	add $idx 1
end

send "'Scanning Deployed Limpets...*k2"
waitfor "===================================="
settextlinetrigger limpline1		:addinlimpc	" Corporate"
settextlinetrigger limpline2		:addinlimpp	" Personal "
settextlinetrigger lstbottom		:limplstbottom	"Activated  Limpet  Scan"
settextlinetrigger lstnone			:limplstbottom	"No Limpet mines deployed"
pause

:addinlimpc
getword currentline $sector 1
setsectorparameter $sector "LIMPSEC" true
add $dep_limp 1
setvar $limps[$sector] true
settextlinetrigger limpline1		:addinlimpc	" Corporate"
pause

:addinlimpp
getword currentline $sector 1
setsectorparameter $sector "LIMPSEC" true
add $dep_limp 1
setvar $limps[$sector] true
settextlinetrigger limpline2		:addinlimpp	" Personal "
pause

:limplstbottom
killalltriggers

return

:updatestatus_window
setvar $window_txt ""

setvar $window_txt ($window_txt & " Sector    : " & $player~current_sector & "*")
if ($unlim)
	setvar $window_txt ($window_txt & " Turns     : Unlimited*")
else
	setvar $cashamount currentturns
	gosub :commasize
	setvar $window_txt ($window_txt & " Turns     : " & $cashamount)
	setvar $cashamount $turn_limit
	gosub :commasize
	setvar $window_txt ($window_txt & " (Turn Limit " & $cashamount & ")*")
end

setvar $cashamount $player~credits
gosub :commasize
setvar $window_txt ($window_txt & " Credits   : $" & $cashamount & "*")

setvar $cashamount $player~fighters
gosub :commasize
setvar $window_txt ($window_txt & " Fighters  : " & $cashamount & "*")

setvar $cashamount $dep_figs
gosub :commasize
setvar $cashamount1 $cashamount
setvar $cashamount sectors
gosub :commasize
setvar $window_txt ($window_txt & " Grid      : " & $cashamount1 & " of " & $cashamount & "*")

setvar $cashamount $dep_new
gosub :commasize
setvar $window_txt ($window_txt & " Gridded   : " & $cashamount & "*")
if ($tracker)
	setvar $cashamount $mcicd
	gosub :commasize
	setvar $window_txt ($window_txt & " MCIC'd    : " & $cashamount & " ("&$track_file&")*")
end

setvar $window_txt ($window_txt & "    ----------------: Log Entries :----------------*")
setvar $ii 1

while ($ii <= 5)
	if ($log_entries[$ii] <> "")
		setvar $window_txt ($window_txt & " " & $log_entries[$ii] & "*")
	end
	add $ii 1
end
setwindowcontents status ("*" & $window_txt)
setvar $window_content $window_txt
replacetext $window_content "*" "[][]"
savevar $window_content
return

:commasize
if ($cashamount < 1000)
	#do nothing
elseif ($cashamount < 1000000)
	getlength $cashamount $len
	setvar $len ($len - 3)
	cuttext $cashamount $tmp 1 $len
	cuttext $cashamount $tmp1 ($len + 1) 999
	setvar $tmp $tmp & "," & $tmp1
	setvar $cashamount $tmp
elseif ($cashamount <= 999999999)
	getlength $cashamount $len
	setvar $len ($len - 6)
	cuttext $cashamount $tmp 1 $len
	setvar $tmp $tmp & ","
	cuttext $cashamount $tmp1 ($len + 1) 3
	setvar $tmp $tmp & $tmp1 & ","
	cuttext $cashamount $tmp1 ($len + 4) 999
	setvar $tmp $tmp & $tmp1
	setvar $cashamount $tmp
end
return

:move_down
setvar $log_entries[5] $log_entries[4]
setvar $log_entries[4] $log_entries[3]
setvar $log_entries[3] $log_entries[2]
setvar $log_entries[2] $log_entries[1]
setvar $log_entries[1] ($log_event & " " & $log_text)
return

:getcourse
killalltriggers
setvar $sectors ""
settextlinetrigger sectorlinetrig :sectorsline " > "
send "^f*"&$destination&"*nq"
pause

:sectorsline
killalltriggers
setvar $line currentline
replacetext $line ">" " "
striptext $line "("
striptext $line ")"
setvar $line $line&" "
getwordpos $line $pos "So what's the point?"
getwordpos $line $pos2 ": ENDINTERROG"
getwordpos $line $pos3 "*** Error"

if (($pos > 0) or ($pos2 > 0))
	setvar $courselength 0
	return
end
getwordpos $line $pos " sector "
getwordpos $line $pos2 "TO"
if (($pos <= 0) and ($pos2 <= 0))
	setvar $sectors $sectors & " " & $line
end
getwordpos $line $pos " "&$destination&" "
getwordpos $line $pos2 "("&$destination&")"
getwordpos $line $pos3 "TO"
if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	goto :gotsectors
end

:waitfornextcourseline
settextlinetrigger sectorlinetrig :sectorsline " > "
settextlinetrigger sectorlinetrig2 :sectorsline " "&$destination&" "
settextlinetrigger sectorlinetrig3 :sectorsline " "&$destination
settextlinetrigger sectorlinetrig4 :sectorsline "("&$destination&")"
settextlinetrigger donepath :sectorsline "So what's the point?"
settextlinetrigger donepath2 :sectorsline ": ENDINTERROG"
pause

:gotsectors
killalltriggers
setvar $sectors $sectors&" :::"
setvar $courselength 0
setvar $index 1

:keepgoing
if ($sectors = " FM     :::")
	return
end
getword $sectors $course[$index] $index
while ($course[$index] <> ":::")
	add $courselength 1
	add $index 1
	getword $sectors $course[$index] $index
end
return

:haggel_checker
killalltriggers
#
#	Been a few double ups so making some changes!
#		We need to trade on one of three conditions
#		- Low Ore and they sell ore
#		- Low Equip and they sell Equip
#		- Buy Equip and no MCIC

setvar $dotrade 0
if (($player~ore_holds < 75) and (port.buyfuel[$player~current_sector] = 0))
	setvar $dotrade 1
elseif (($player~equipment_holds < $equ_min_buy) and (port.buyequip[$player~current_sector] = 0))
	setvar $dotrade 1
elseif ((port.buyequip[$player~current_sector] = 1) and ($mcic[$player~current_sector] = false))
	setvar $dotrade 1
end
if ($dotrade = 0)
	return
end
# End addition

setvar $restorehaggle 0
if (haggle)
	setvar $restorehaggle 1
	autohaggle off
end

setvar $equ_need2buy ($equ_min - $player~equipment_holds)
setvar $ore_need2buy (($player~total_holds - $equ_min) - $player~ore_holds)
if (port.class[$player~current_sector] = 1) or (port.class[$player~current_sector] = 5) or (port.class[$player~current_sector] = 6) or (port.class[$player~current_sector] = 7) or (port.class[$player~current_sector] = 3) or (port.class[$player~current_sector] = 4) or (port.class[$player~current_sector] = 2)
	#send "CR*Q"
	#waiton "<Computer deactivated>"
	#if (PORT.EQUIP[$player~CURRENT_SECTOR] >= $EQU_NEED2BUY) AND ($EQU_NEED2BUY <> 0)
	setvar $tradestarted 0
	settexttrigger noport :noport "Corp Menu"
	send "pt"
	waiton "<Port>"
	settexttrigger	nofuel		:nofuel		"How many holds of Fuel Ore do you want to buy"
	settexttrigger	noorg		:noorg		"How many holds of Organics do you want to buy"
	settexttrigger	equp		:equp		"How many holds of Equipment do you want to sell ["
	settexttrigger	buyequp		:buyequp	"How many holds of Equipment do you want to buy"
	settexttrigger	nosell		:nosell		"You don't have anything they want"
	settexttrigger	fuelsell 	:fuelsell	"How many holds of Fuel Ore do you want to sell"
	settexttrigger	orgsell 	:orgsell	"How many holds of Organics do you want to sell"
	settexttrigger	offer		:offer		"Your offer ["
	settexttrigger	finaloffer	:offer		"Our final offer"
	settexttrigger	done		:done		"Command [TL"
	pause

	:noport
	killalltriggers
	gosub :restorehaggle
	echo "***Hmmm.. where'd the port go?!?**"
	halt

	:done
	if ($tradestarted = 0)
		settexttrigger	done		:done		"Command [TL"
		pause
	end
	killalltriggers
	gosub :restorehaggle
	return

	:nofuel
	setvar $tradestarted 1
	if ($ore_need2buy >= 1)
		#send $ORE_NEED2BUY & "**"
		send $ore_need2buy & "*"
	else
		send "0*"
	end
	pause

	:noorg
	setvar $tradestarted 1
	send "0*"
	pause

	:equp
	setvar $tradestarted 1
	if ($mcic[$player~current_sector] = 0)
		setvar $mcic[$player~current_sector] true
		if ($player~equipment_holds > $equ_min)
			#send ($player~equipment_holds - $EQU_MIN) & "**"
			send ($player~equipment_holds - $equ_min) & "*"
		else
			add $mcicd 1
			#send "5**"
			send "5*"
		end
	else
		send "0*"
	end
	pause

	:buyequp
	setvar $tradestarted 1
	if ($equ_need2buy >= 1)
		#send $EQU_NEED2BUY & "**"
		send $equ_need2buy & "*"
	else
		send "0*"
	end
	pause

	:nosell
	setvar $tradestarted 1
	killalltriggers
	gosub :restorehaggle
	return

	:offer
	setvar $tradestarted 1
	send "*"
	pause

	:fuelsell
	setvar $tradestarted 1
	if ($player~ore_holds > ($player~total_holds - $equ_min))
		#send $player~ore_holds - ($player~total_holds - $EQU_MIN)& "**"
		send $player~ore_holds - ($player~total_holds - $equ_min)& "*"
	else
		send "0*"
	end
	pause

	:orgsell
	setvar $tradestarted 1
	#send "**"
	send "*"
	pause
end
gosub :restorehaggle
return

:restorehaggle
if ($restorehaggle = 1)
	autohaggle on
	setvar $restorehaggle 0
end
return

:do_holo
setarray $holooutput 2000
setvar $line_pointer 1
send "SzH*  "
settextlinetrigger	turnsgone		:turnsgone		"Do you want instructions (Y/N) [N]?"
settextlinetrigger	donescan		:donescan		"Warps to Sector(s) :"

waiton "Long Range Scan"

:reset_trigger
settextlinetrigger holo_line :holo_line
pause

:holo_line
setvar $holooutput[$line_pointer] currentline
if ($line_pointer <= 2000)
	add $line_pointer 1
end
goto :reset_trigger

:donescan
killalltriggers
setvar $holooutput[$line_pointer] "ENDENDENDENDENDENDEND"
return

:display_holo
setvar $holo_i 1
setvar $holo_ptr 1
setvar $holo_s ""
setvar $avoidflag ""
while (sector.warps[$player~current_sector][$holo_i] > 0)
	setvar $holo_adj sector.warps[$player~current_sector][$holo_i]
	if ((sector.planetcount[$holo_adj] > 0) or (sector.tradercount[$holo_adj] > 0) or (sector.shipcount[$holo_adj] > 0))
		setvar $figowner sector.figs.owner[$holo_adj]
		if ((sector.figs.quantity[$holo_adj] >= 100) and (($figowner <> "belong to your Corp") or ($figowner <> "yours")))
			while ($holo_ptr <= $line_pointer)
				getwordpos $holooutput[$holo_ptr] $holo_pos ("Sector  : " & $holo_adj)
				setvar $avoidflag ($avoidflag & " " & $holo_adj)
				if ($holo_pos <> 0)
					setvar $holo_s ($holo_s & $holooutput[$holo_ptr] & "*")

					:lets_go_again
					add $holo_ptr 1
					getwordpos $holooutput[$holo_ptr] $pos "Warps to Sector(s) :"
					if (($holooutput[$holo_ptr] <> "") and ($pos = 0))
						setvar $holo_s ($holo_s & $holooutput[$holo_ptr] & "*")
					else
						setvar $holo_s ($holo_s & "         *")
						goto :done_scan
					end
					goto :lets_go_again
				end
				add $holo_ptr 1
			end
		end
	end

	:done_scan
	add $holo_i 1
end

setvar	$holo_targets	$bot~folder&"/LSHRED_" & gamename & ".log"
if ($holo_s <> "")
	send "'*["&$taglineb&"] SCAN RESULTS----------------------[ADJ SECTOR: " & currentsector & "*"
	send $holo_s & "* "
	waitfor "Sub-space comm-link terminated"
end
return

:resetminesafterrestock
if (($drop_armid > 0) and ($drop_limp > 0))
	setvar $droping_mines 3
elseif ($drop_armid > 0)

	setvar $droping_mines 2
elseif ($drop_limp > 0)

	setvar $droping_mines 1
else
	setvar $droping_mines 0
end
return

:getpersonalplanets
# Planet list from personal planets - relies on no shields being present
setvar $planet~planetsinsectors sectors

send "cyq"
waitfor "<Computer activated>"
waitfor "Sector  Planet Name"

:pread
settextlinetrigger pread1 :pread1 "#"
settextlinetrigger preaddone :preaddone "======   ============  ==== ==== ==== ===== ===== "
settextlinetrigger preaddone2 :preaddone "No Planets claimed"
pause

:pread1
killalltriggers
getword currentline $sector 1
add $planet~planetsinsectors[$sector] 1
goto :pread

:preaddone
killalltriggers
return

include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
