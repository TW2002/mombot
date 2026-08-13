logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~colonist_regen

setvar $help~help[1] $help~tab&"Saarducci's T-Milker, updated by Shadow"
setvar $help~help[2] $help~tab&"Milks Terra colonists with B-warp from the current planet."
setvar $help~help[3] $help~tab&""
setvar $help~help[4] $help~tab&"Usage: tmilk on"
setvar $help~help[5] $help~tab&""
setvar $help~help[6] $help~tab&"Must start in Citadel on the source planet."
setvar $help~help[7] $help~tab&"Planet must have fuel and B-warp. Ship must have T-warp."
setvar $help~help[8] $help~tab&"Use "&$switchboard~bot_name&" return to land back on the source planet,"
setvar $help~help[9] $help~tab&"unload colonists, and terminate the run."
gosub :help~helpfile

if ($bot~parm1 <> "on")
	gosub :help~displayhelp
	halt
end

if ($game~colonist_regen > 0)
	setvar $dprod $game~colonist_regen
	setvar $sprod $dprod
else
	setvar $dprod 0
	setvar $sprod $dprod
end

if ($sprod > 0)
	setprecision 4
	divide $sprod 86400
	setprecision 0
end

setvar $bf 0
setvar $bs 0
setvar $famt 100000
setvar $samt 1250
setvar $samt1 $samt
multiply $samt1 10
setvar $min 9
setvar $mt 1
setvar $tu 0
setvar $intvl 10000
setvar $bb 0
setvar $have_terra_sample false
setvar $last_terra_count 0
setvar $last_terra_time 0
setvar $observed_regen_scaled 0
setvar $regen_display "unknown"
setvar $have_production_baseline false
setvar $production_base_colos 0
setvar $production_base_time 0
setvar $min 15
setvar $colo_prod 1

addmenu "" "Saar Colograb" "Saar Colograb" "." "" "Main" false
setmenuoptions "Saar Colograb" 0 0 0
addmenu "Saar Colograb" "Figs" "Buy Figs (1=yes 0=no)" "F" ":MENU_FIGS" "" false
addmenu "Saar Colograb" "MaxThresh" "Maximum Threshold" "L" ":MENU_MAXTHRES" "" false
addmenu "Saar Colograb" "Cmin" "Minimum" "M" ":MENU_MIN" "" false
addmenu "Saar Colograb" "shlds" "Buy shields (1=yes 0=no)" "S" ":MENU_SHLDS" "" false
addmenu "Saar Colograb" "Thresh" "Threshold" "T" ":MENU_THRES" "" false

gosub :player~currentprompt
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must start in Citadel*"
	gosub :switchboard~switchboard
	halt
end

setdelaytrigger failed :failed 300000
gosub :player~getinfo
setvar $tpw $player~turns_per_warp
setvar $sect $player~current_sector
setvar $unlimited $player~unlimitedgame
setvar $holds $player~ore_holds
add $holds $player~organic_holds
add $holds $player~equipment_holds
add $holds $player~colonist_holds
add $holds $player~empty_holds

send "q"
gosub :planet~getplanetinfo
setvar $pl $planet~planet
setvar $tprng $planet~planet_transport
setvar $pscan $player~planet_scanner

if ($tprng <= 0)
	setvar $switchboard~message "Planet has no transporter. Halting.*"
	gosub :switchboard~switchboard
	halt
end

gosub :getctime
setvar $sttm $dd
setvar $cc 0
getdistance $rngnd $sect 1

if ($tprng < $rngnd)
	setvar $switchboard~message "Transporter has insufficient range. Halting.*"
	gosub :switchboard~switchboard
	halt
end

setvar $switchboard~message "Saarducci's Tmilker starting run.*"
gosub :switchboard~switchboard
getdistance $fr 1 $sect
multiply $fr 3
setvar $max $holds
subtract $max $fr

if ($max <= 0)
	setvar $switchboard~message "Fuel reserve is greater than ship cargo capacity. Holds="&$holds&", reserve="&$fr&". Halting.*"
	gosub :switchboard~switchboard
	halt
end

setvar $ab $max
subtract $ab 1
divide $ab 2
setarray $t 13
setvar $t[1] $max
subtract $t[1] 1
setvar $t[2] $max
divide $t[2] 2
setvar $t[3] $max
divide $t[3] 3
setvar $t[4] $max
divide $t[4] 4
setvar $t[5] $max
divide $t[5] 5
setvar $t[6] $max
divide $t[6] 6
setvar $t[7] $max
divide $t[7] 7
setvar $t[8] $max
divide $t[8] 8
setvar $t[9] $max
divide $t[9] 9
setvar $t[10] $max
divide $t[10] 11
setvar $t[11] $max
divide $t[11] 15
setvar $t[12] $max
divide $t[12] 35
setvar $t[13] 2

:grabcolos
add $tu 2
settextlinetrigger hwmany :hmy "There are currently"
send "tnt1"&$fr&"* "
if ($bf = 1)
	send "m n l "&$famt&"* "
end
send "c "
if ($bs = 1)
	send "gt"&$samt&"* "
end
send "b1*y "
waiton "]:[1]"
if ($bf = 1)
	send "p*b "&$famt&"* q"
end
if ($bs = 1)
	send "p*c"&$samt1&"* q"
end
if ($pscan = "Yes")
	send "l 1* "
else
	send "l "
end
pause

:hmy
getword currentline $avbl 4
gosub :updateregen
if ($avbl < $bb)
	setvar $xx 0
	if ($ab > $min)
		add $t[13] 1
		if ($t[13] > 12)
			setvar $t[13] 12
		end
		setvar $ab $t[$t[13]]
	end
	if ($ab < $min)
		setvar $ab $min
	end
end
setvar $bb $avbl
if (($avbl > $ab) or ($avbl >= $max))
	setvar $bb 0
	add $xx 1
	settexttrigger hwmany :toget "empty holds"
	send "t"
	pause

	:toget
	getword currentline $tog 11
	striptext $tog "(["
	striptext $tog "]"
	if ($tog > $avbl)
		killalltriggers
		setdelaytrigger failed :failed 300000
		settexttrigger conf1 :goodget1 "file aboard"
		settexttrigger deny1 :badget "There aren't"
		setdelaytrigger gamebug :badget 2000
		send $avbl "*"
		pause

			:goodget1
			killalltriggers
			add $cc $avbl
			setvar $last_terra_count 0
			gosub :markterrasample
			subtract $tog $avbl
			if ($tog < 10)
				goto :fred
			end
			add $tu 1
			goto :bob
	else
		killalltriggers
		setdelaytrigger failed :failed 300000
		settexttrigger conf :goodget "file aboard"
		settexttrigger deny :badget "There aren't"
		setdelaytrigger gamebug :badget 2000
		send "*"
		pause

		:goodget
		killalltriggers
		add $cc $tog
		setvar $last_terra_count $avbl
		subtract $last_terra_count $tog
		gosub :markterrasample

		:fred
		add $tu 1
		add $tu $tpw

		killalltriggers
		setdelaytrigger failed :failed 300000
		settexttrigger lok :lock "Locked"
		settexttrigger nolok :nlock "No loc"
		send $sect&"*y"
		pause

		:lock
			killalltriggers
			send "y l"&$pl&"*"
			waiton "Planet command"
			gosub :leavecolos
			#setvar $switchboard~message "Saarducci's Tmilker running from planet "&$pl&". Please don't move planet.*"
			#gosub :switchboard~switchboard
		if ($verbose = true)
			setvar $switchboard~message "Delivered "&$cc&" colos to planet "&$pl&".*"
			gosub :switchboard~switchboard
		end
		gosub :updatestats
		if ($verbose = true)
			if ($dprod > 0)
				setvar $switchboard~message $cpt&" colos/turn in "&$et_seconds&" seconds ("&$et_hours&" hours). "&$ef&"% of Terran production.*"
			else
				setvar $switchboard~message $cpt&" colos/turn in "&$et_seconds&" seconds. Terran production rate unknown.*"
			end
			gosub :switchboard~switchboard
		end

		if ($unlimited <> true)
			gosub :player~quikstats
			setvar $actualturns $player~turns
			if ($actualturns <= 25)
				setvar $switchboard~message "Low on turns, "&$actualturns&" turns left. Shutting down.*"
				gosub :switchboard~switchboard
				halt
			else
				setvar $switchboard~message "Returned with "&$actualturns&" turns left.*"
				gosub :switchboard~switchboard
			end
		end
		goto :grabcolos
	end
	else
		send "q "

		:badget
		killalltriggers

		:bob
		if ($xx > 4)
			if ($ab < $t[$mt])
				if ($t[13] > 1)
					subtract $t[13] 1
					setvar $ab $t[$t[13]]
					setvar $xx 0
				end
			end
		end
		gosub :calcregendelay
		gosub :wait

		setdelaytrigger failed :failed 300000
		settextlinetrigger hwmany :hmy "There are currently"
	if ($pscan = "Yes")
		send "l 1* "
	else
		send "l "
	end
	pause
end

:nlock
send "nn"
setvar $switchboard~message "Fighter missing from base. Halting script.*"
gosub :switchboard~switchboard
halt

:wait
gosub :updatestats
if ($dprod > 0)
	echo ansi_14&"*delay:"&$intvl&" threshold:"&$t[13]&"/"&$ab&" streak:"&$xx&" time:"&time&" colos:"&$cc&" turns:"&$tu&" cpt:"&$cpt&" elapsed:"&$et_seconds&"s regen:"&$regen_display&"/s prod:"&$ef&"%*" ansi_0
else
	echo ansi_14&"*delay:"&$intvl&" threshold:"&$t[13]&"/"&$ab&" streak:"&$xx&" time:"&time&" colos:"&$cc&" turns:"&$tu&" cpt:"&$cpt&" elapsed:"&$et_seconds&"s regen:"&$regen_display&"/s prod:unknown*" ansi_0
end
if ($intvl <= 0)
	setvar $switchboard~message "Invalid milk delay calculated ("&$intvl&"). Halting before SETDELAYTRIGGER.*"
	gosub :switchboard~switchboard
	halt
end
setdelaytrigger resetdelay :delay $intvl

:backatit
setdelaytrigger failed :failed 300000
settextouttrigger menu :menu "+"
settexttrigger terminate :terminate $switchboard~bot_name&" return"
settextouttrigger self_terminate :killit "'"&$switchboard~bot_name&" return"
pause

:delay
killalltriggers
return

:failed
killalltriggers
send " q z n q r z n * * "
setvar $switchboard~message "Script error. Terminating Tmilker!*"
gosub :switchboard~switchboard
halt

:terminate
getword currentline $firstword 1
if ($firstword = "R")
	goto :killit
end
killtrigger failed
killtrigger menu
killtrigger terminate
killtrigger self_terminate
goto :backatit

:killit
killalltriggers
send " * q q n * "
setdelaytrigger failed :failed 300000
settexttrigger lokd :lockd "Locked"
settexttrigger nolokd :nlockd "No loc"
send $sect&"*y"
pause

:lockd
send "y l"&$pl&"*"
waiton "Planet command"
gosub :leavecolos
send "c * "
waiton "treasury contains"
waiton "ommand ("
setvar $switchboard~message "Saarducci's T-Milker terminating run.*"
gosub :switchboard~switchboard
halt

:leavecolos
if ($colo_prod > 3)
	setvar $switchboard~message "Planet is full of colonists, no more can be added. Tmilker shutting down.*"
	gosub :switchboard~switchboard
	halt
end
killalltriggers
settextlinetrigger colosleft :leavecolos_left "The Colonists disembark"
settextlinetrigger colosfull :leavecolos_full "There isn't room on the planet"
settexttrigger colosprompt :leavecolos_done "Planet command (?=help)"
send "s n l "&$colo_prod&"*"
pause

:leavecolos_full
killalltriggers
waiton "Planet command"
add $colo_prod 1
goto :leavecolos

:leavecolos_left
killalltriggers
waiton "Planet command"
return

:leavecolos_done
killalltriggers
return

:nlockd
killalltriggers
send "nn"
setvar $switchboard~message "Fighter missing from base. Halting script.*"
gosub :switchboard~switchboard
halt

:menu
killalltriggers
echo "*This is where the menu goes**"
openmenu "Saar Colograb"

:ctime
gosub :getctime
setvar $et $dd
subtract $et $sttm
return

:updatestats
setvar $cpt $cc
if ($tu > 0)
	divide $cpt $tu
end
gosub :ctime
setvar $et_seconds $et
setvar $et_hours $et_seconds
setprecision 2
divide $et_hours 3600
setvar $ef 0
if ($observed_regen_scaled > 0)
	if ($have_production_baseline = true)
		setvar $prod_elapsed $dd
		subtract $prod_elapsed $production_base_time
		setvar $prod_colos $cc
		subtract $prod_colos $production_base_colos
		if ($prod_elapsed > 0)
			setvar $et1 $observed_regen_scaled
			multiply $et1 $prod_elapsed
			if ($et1 > 0)
				setprecision 2
				setvar $ef $prod_colos
				multiply $ef 100000
				divide $ef $et1
			end
		end
	end
elseif ($dprod > 0)
	if ($et_seconds > 0)
		setprecision 4
		setvar $et1 $et_seconds
		multiply $et1 $sprod
		if ($et1 > 0)
			setprecision 2
			setvar $ef $cc
			multiply $ef 100
			divide $ef $et1
		end
	end
end
setprecision 0
return

:markterrasample
gosub :getctime
setvar $last_terra_time $dd
setvar $have_terra_sample true
if ($have_production_baseline <> true)
	setvar $production_base_colos $cc
	setvar $production_base_time $dd
	setvar $have_production_baseline true
end
return

:updateregen
if ($have_terra_sample = true)
	gosub :getctime
	setvar $regen_elapsed $dd
	subtract $regen_elapsed $last_terra_time
	setvar $regen_delta $avbl
	subtract $regen_delta $last_terra_count
	if ($regen_elapsed > 0)
		if ($regen_delta > 0)
			setvar $observed_regen_scaled $regen_delta
			multiply $observed_regen_scaled 1000
			divide $observed_regen_scaled $regen_elapsed
		end
	end
end
if ($observed_regen_scaled > 0)
	setprecision 2
	setvar $regen_display $observed_regen_scaled
	divide $regen_display 1000
	setprecision 0
else
	setvar $regen_display "unknown"
end
return

:calcregendelay
if ($observed_regen_scaled > 0)
	setvar $needed $ab
	subtract $needed $avbl
	if ($needed < 1)
		setvar $intvl 500
	else
		setvar $intvl $needed
		multiply $intvl 1000000
		divide $intvl $observed_regen_scaled
		if ($intvl < 500)
			setvar $intvl 500
		end
	end
else
	setvar $intvl 10000
end
if ($intvl > 290000)
	setvar $intvl 290000
end
return

:menu_thres
echo ansi_11 "*Current Threshold: "&$t[13]&" / " $t[$t[13]]&"*" ansi_0
echo ansi_11 "New Threshold: " ansi_0
getconsoleinput $t[13]
if ($t[13] < 1)
	echo ansi_11 "*Must be a number from 1 to 12**" ansi_0
	goto :menu_thres
end
if ($t[13] > 12)
	echo ansi_11 "*Must be a number from 1 to 12**" ansi_0
	goto :menu_thres
end
setvar $ab $t[$t[13]]
goto :delay

:menu_min
echo ansi_11 "*Current Minimum: "&$min&"*" ansi_0
echo ansi_11 "New Minimum: " ansi_0
getconsoleinput $min
goto :delay

:menu_maxthres
echo ansi_11 "*Current Maximum: "&$mt&"*" ansi_0
echo ansi_11 "New Maximum: " ansi_0
getconsoleinput $mt
if ($mt < 1)
	echo ansi_11 "*Must be a number from 1 to 12**" ansi_0
	goto :menu_maxthres
end
if ($mt > 12)
	echo ansi_11 "*Must be a number from 1 to 12**" ansi_0
	goto :menu_maxthres
end
goto :delay

:menu_figs
getconsoleinput $bf
goto :delay

:menu_shlds
getconsoleinput $bs
goto :delay

:getctime
gettime $ttm "DD:HH:MM:SS"
replacetext $ttm ":" " "
getword $ttm $dd 1
multiply $dd 86400
getword $ttm $hh 2
multiply $hh 3600
add $dd $hh
getword $ttm $mm 3
multiply $mm 60
add $dd $mm
getword $ttm $ss 4
add $dd $ss
return

#includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard.ts"
