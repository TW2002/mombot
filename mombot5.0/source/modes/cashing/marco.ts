gosub :loadvars~loadvars
gosub :help~initialize

loadvar $game~port_max
loadvar $game~ptradesetting
loadvar $game~max_planets_in_game
loadvar $bot~folder
loadvar $player~surroundfigs
loadvar $player~surroundlimp;
loadvar $player~surroundmine
loadvar $map~stardock
loadvar $bot~limp_file
loadvar $bot~armid_file
loadvar $bot~bot_turn_limit
loadvar $bot~bot_name

setvar $help~help[1] $help~tab&"       Marco Polo - Trade Route for PPTing"
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&" macro [trade/report] {turns} {filename.txt} "
setvar $help~help[4] $help~tab&"                      "
setvar $help~help[5] $help~tab&" trade  - indicates bot will trade the route"
setvar $help~help[6] $help~tab&" report - indicates bot will write route to file"
setvar $help~help[7] $help~tab&" "
setvar $help~help[8] $help~tab&" {filename.txt} - can either be used as a source"
setvar $help~help[9] $help~tab&"                  route or for writing to share."
setvar $help~help[10] $help~tab&"  "
setvar $help~help[11] $help~tab&" {turns}       - Compulsary when trade option used "
setvar $help~help[12] $help~tab&"                 stops trading when reaching turns"
setvar $help~help[13] $help~tab&"  "
setvar $help~help[14] $help~tab&"  Marco requires pairs to have one ore seller."
setvar $help~help[15] $help~tab&"  Please update CIM Ports/Warps and Figs."

gosub :help~helpfile

gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns
setvar $stat_pairs_traded 0
setvar $cash_made 0
setvar $turns_taken 0

setvar $mode ""

setvar $trademode ""
setvar $cashpause 0
setarray $portsused sectors

setvar $portpairs 0
setvar $portpairsi 0

setvar $totaldist 0
setvar $oneoretotaldist 12
setvar $twooretotaldist 20

setvar $ports[1] "BBS"
setvar $ports[2] "BSB"
setvar $ports[3] "SBB"
setvar $ports[4] "SSB"
setvar $ports[5] "SBS"
setvar $ports[6] "BSS"
setvar $ports[7] "SSS"
setvar $ports[8] "BBB"

if (($bot~parm1 <> "trade") and ($bot~parm1 <> "report"))
	setvar $switchboard~message "First parameter should be trade or report.*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm2 = 0)
	setvar $bot~parm2 ""
end

if ($bot~parm3 = 0)
	setvar $bot~parm3 ""
end

if ($bot~parm1 = "trade")
	setvar $mode "trade"
	isnumber $test $bot~parm2
	if ($test)
		setvar $switchboard~message "We will stop when we reach "&$bot~parm2&" turns.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Halt turns must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end

	setvar $halt_turns $bot~parm2

	setvar $startinglocation $player~current_prompt
	if ($startinglocation <> "Command")
		setvar $switchboard~message "must be started from Command prompt.*"
		gosub :switchboard~switchboard
		halt
	end

	if (($player~twarp_type <> 1) and ($player~twarp_type <> 2))
		setvar $switchboard~message "Requires T-Warp as we warp around.*"
		gosub :switchboard~switchboard
		halt
	end

	if (($player~ore_holds = 0) or ($player~organic_holds > 0) or ($player~equipment_holds > 0) or ($player~colonist_holds > 0))
		setvar $switchboard~message "Fuel in holds only please.*"
		gosub :switchboard~switchboard
		halt
	end

	if ($player~fighters < 100)
		setvar $switchboard~message "Less than 100 figs - are you mad?*"
		gosub :switchboard~switchboard
		halt
	end
	send "cuyq"
	if ($player~total_holds > 200)
		if ($player~credits < 25000)
			setvar $switchboard~message "We have 200+ holds and less than 25k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~total_holds > 150)
		if ($player~credits < 20000)
			setvar $switchboard~message "We have 150+ holds and less than 20k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~total_holds > 100)
		if ($player~credits < 15000)
			setvar $switchboard~message "We have 100+ holds and less than 15k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	else
		if ($player~credits < 10000)
			setvar $switchboard~message "We need at least 10k Creds please!*"
			gosub :switchboard~switchboard
			halt
		end

	end
	setdelaytrigger delay :startpause 1000
	pause

	:startpause
	if ($bot~parm3 <> "")
		setvar $trademode "file"
		setvar $fread $bot~folder&"/"&$bot~parm3
		fileexists $exists $fread
		if ($exists)
			setarray $pairlist sectors
			setvar $i 1
			setvar $pairi 1
			read $fread $pair $i
			while ($pair <> "EOF")

				if ($pair <> "")
					setvar $pairlist[$pairi] $pair
					add $pairi 1
				end
				add $i 1
				read $fread $pair $i
			end
			setvar $totalpairs ($pairi - 1)
		end
		setvar $i 1
		setvar $portpairsi 0
		while ($i <= $totalpairs)
			add $portpairsi 1
			getword $pairlist[$portpairsi] $portpairs[$i][1] 1
			getword $pairlist[$portpairsi] $portpairs[$i][2] 2
			getword $pairlist[$portpairsi] $portpairs[$i][3] 3
			getword $pairlist[$portpairsi] $portpairs[$i][4] 4
			echo $pairlist[$portpairsi] "*"
			add $i 1
		end
		echo "total pairs: " $totalpairs "*"

	else
		setvar $trademode "self"
		gosub :getpairs
	end
else

	if ($bot~parm2 = "")
		setvar $switchboard~message "Filename not specified.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $switchboard~message "Writig to file: "&$bot~parm2&".*"
	gosub :switchboard~switchboard

	gosub :getpairs
	setvar $fwrite $bot~folder&"/"&$bot~parm2
	delete $fwrite
	setvar $i 1
	while ($i <= $portpairsi)
		write $fwrite $portpairs[$i][1]&" "&$portpairs[$i][2]&" "&$portpairs[$i][3]&" "&$portpairs[$i][4]&"*"
		add $i 1
	end

	setvar $switchboard~message "Written "&$portpairsi&" to file*"
	gosub :switchboard~switchboard
	halt

end
setvar $loopi 1
while ($loopi <= $portpairsi)
	setvar $sec $portpairs[$loopi][1]
	setvar $pairsec $portpairs[$loopi][2]
	setvar $skip false
	if (port.exists[$sec] = 1)
		if (port.percentequip[$sec] < 85)
			setvar $skip true
		end
	end
	if (port.exists[$pairsec] = 1)
		if (port.percentequip[$pairsec] < 85)
			setvar $skip true
		end
	end
	if ($skip = true)
		goto :nextloop
	end

	if ($player~turns < $halt_turns)
		stop "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
		setvar $switchboard~message "Turns are low, halting!*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~current_sector <> $pairsec)

		send "m" $sec "*yn"
		settextlinetrigger checkpair2lockyes :checkpair2lockyes "Locating beam pinpointed, TransWarp"
		settextlinetrigger checkpair2lockno :checkpair2lockno "No locating beam found for sector"
		pause

		:checkpair2lockno
		killalltriggers
		setvar $switchboard~message "Sector missing fig, moving onto next.*"
		gosub :switchboard~switchboard
		goto :nextloop

		:checkpair2lockyes
		killalltriggers

		setvar $player~warpto $pairsec
		gosub :move~twarp
		if ($player~twarpsuccess = false)
			setvar $switchboard~message "Sector missing fig, moving onto next.*"
			gosub :switchboard~switchboard
			goto :nextloop
		end
		gosub :player~quikstats
	end

	gosub :checkdist
	send "d"
	waitfor "Warps to Sect"
	if ($cashpause = 1)
		if (port.exists[currentsector] = true)
			if (port.buyfuel[currentsector] = false)
				send "'[atm:" $switchboard~bot_name "=" currentsector "]*"
				waitfor "[atmdone]"
				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setvar $cashpause 0
			end
		end
	end
	if (port.buyfuel[$pairsec] = 1)

		gosub :balancetrade
		if ($portpairs[$loopi][4] = 1)
			setvar $move~moveintosector $sec
			gosub :move~moveintosector
		else
			setvar $player~warpto $sec
			gosub :move~twarp
			if ($player~twarpsuccess = false)
				setvar $switchboard~message "Sector missing fig, moving onto next.*"
				gosub :switchboard~switchboard
				goto :nextloop
			end
		end
		gosub :player~quikstats
		send "d"
		waitfor "Warps to Sect"
		if ($cashpause = 1)
			if (port.exists[currentsector] = true)
				if (port.buyfuel[currentsector] = false)
					send "'[atm:" $switchboard~bot_name "=" currentsector "]*"
					waitfor "[atmdone]"
					send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
					setvar $cashpause 0
				end
			end
		end
	end

	setvar $beforetradecash $player~credits
	gosub :tradepair
	gosub :player~quikstats
	if ($beforetradecash = $player~credits)
		setvar $switchboard~message "Something went wrong with that trade; didn't make any money.*"
		gosub :switchboard~switchboard
	end

	add $stat_pairs_traded 1
	setvar $cash_made ($player~credits - $startcredits)
	setvar $turns_taken ($startturns - $player~turns)

	setvar $switchboard~message "Pairs Traded: "&$stat_pairs_traded&" Cash Made: "&$cash_made&" Turns Taken: "&$turns_taken&".*"
	gosub :switchboard~switchboard

	:nextloop
	add $loopi 1
end

halt

:balancetrade
if ($portpairs[$loopi][4] > 1)
	setvar $orereq ($portpairs[$loopi][4] * 3)
else
	setvar $orereq 0
end

if ($orereq > $player~ore_holds)
	setvar $switchboard~message "Not enough fuel to keep trading.*"
	gosub :switchboard~switchboard
end

if (port.buyorg[$sec] = 1)
	setvar $producttobuy "org"
else
	setvar $producttobuy "equip"
end
setvar $sellorequant ($player~ore_holds - $orereq)

send "p   t"
waitfor "Commerce report for"

settextlinetrigger checkcash :checkcash "empty cargo holds"
settextlinetrigger portfail :portfail "ou don't have anything they want, and they don't have anything you can b"
pause

:portfail
setvar $switchboard~message "Oops nothing to trade; script fail*"
gosub :switchboard~switchboard
halt

:checkcash
killalltriggers

killalltriggers

:tradeloop
settexttrigger sell1 :sell1 "How many holds of Fuel Ore do you want to sell"
settexttrigger sell2 :sell2 "How many holds of Organics do you want to sell"
settexttrigger sell3 :sell3 "How many holds of Equipment do you want to sell"
settexttrigger buy1 :buy1 "How many holds of Fuel Ore do you want to buy"
settexttrigger buy2 :buy2 "How many holds of Organics do you want to buy"
settexttrigger buy3 :buy3 "How many holds of Equipment do you want to buy"
settexttrigger tradeloopdone :tradeloopdone "Command ["
pause

:sell1
killalltriggers
send $sellorequant "*"
gosub :dotrade
goto :tradeloop

:sell2
killalltriggers
send "*"
gosub :dotrade
goto :tradeloop

:sell3
killalltriggers
send "*"
gosub :dotrade
goto :tradeloop

:buy1
killalltriggers
gosub :notrade
goto :tradeloop

:buy2
killalltriggers
if ($producttobuy = "org")
	send "*"
else
	gosub :notrade
end
goto :tradeloop

:buy3
killalltriggers
if ($producttobuy = "equip")
	send "*"
else
	gosub :notrade
end
goto :tradeloop

:tradeloopdone
killalltriggers

return

:dotrade
waitfor "Agreed,"
settextlinetrigger tradefin :tradefin "empty cargo holds"
pause

:tradefin
return

:notrade
send "0*"
waitfor "empty cargo holds."
return

:tradepair
if ($player~current_sector = $portpairs[$loopi][1])
	setvar $tradesec $portpairs[$loopi][2]
elseif ($player~current_sector = $portpairs[$loopi][2])
	setvar $tradesec $portpairs[$loopi][1]
else
	setvar $switchboard~message "We should be at one of the ports here, fail.*"
	gosub :switchboard~switchboard
	halt

end
if (($portpairs[$loopi][3] = 1) and ($portpairs[$loopi][4] = 1))
	setvar $bot~parm1 $tradesec
	setvar $bot~parm2 "ore:"&$player~total_holds
	setvar $bot~parm3 ""
else
	setvar $bot~parm1 $tradesec
	setvar $bot~parm2 "twarp"
	setvar $bot~parm3 "ore:"&$player~total_holds
end
setvar $bot~command "ppt"
setvar $bot~user_command_line $tradesec&" "&$bot~parm2&" "&$bot~parm3

savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3

savevar $bot~command
savevar $bot~user_command_line

load "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"

:backpptwait
settextlinetrigger pptpauseforcash :pptpauseforcash "[atm:"&$switchboard~bot_name&"]"
settextlinetrigger pptmove :pptmove "<Move>"
seteventtrigger pptended :pptended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
pause

:pptpauseforcash
killalltriggers
setvar $cashpause 1
send "'[atm:ack] Will pause at next SXB post trading.*"
goto :backpptwait

:pptmove
killalltriggers
if ($player~turns < $halt_turns)
	stop "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
	setvar $switchboard~message "Turns are low, halting!*"
	gosub :switchboard~switchboard
	halt
end
goto :backpptwait

:pptended
killalltriggers
gosub :player~quikstats

return

:checkdist
:tryagainplot1
send "cf" $pairsec "*" $sec "*q"
settextlinetrigger pathgood1 :pathgood1 "he shortest path"
settextlinetrigger pathbad1 :pathbad1 "No route within"
pause

:pathbad1
killalltriggers
send "yq"
setvar $plot 0
goto :tryagainplot1

:pathgood1
killalltriggers

getword currentline $dist2 4
striptext $dist2 "("

send "cf" $sec "*" $pairsec "*q"
settextlinetrigger pathgood2 :pathgood2 "he shortest path"
settextlinetrigger pathbad2 :pathbad2 "No route within"
pause

:pathbad2
killalltriggers
send "yq"
setvar $plot 0
goto :tryagainplot1

:pathgood2
killalltriggers

getword currentline $dist1 4
striptext $dist1 "("

setvar $portpairs[$loopi][3] $dist1
setvar $portpairs[$loopi][4] $dist2

return

:getpairs
setvar $switchboard~message "Finding Pairs..*"
gosub :switchboard~switchboard

setvar $totaldist $oneoretotaldist

setvar $sec 11
while ($sec < sectors)

	if ($portsused[$sec] = 0)
		setvar $cport port.class[$sec]
		getsectorparameter $sec "FIGSEC" $hasfig

		if (($hasfig = 1) and (port.percentequip[$sec] > 80))
			if ($cport = 5)
				setvar $targeta 2
				gosub :checkpairdist
			elseif ($cport = 4)
				setvar $targeta 1
				gosub :checkpairdist
			end
		end
	end
	add $sec 1
end

echo "Two Ore Port " $twooretotaldist " total warps apart*"

setvar $totaldist $twooretotaldist
setvar $sec 11
while ($sec < sectors)

	if ($portsused[$sec] = 0)
		setvar $cport port.class[$sec]
		getsectorparameter $sec "FIGSEC" $hasfig
		if (($hasfig = 1) and (port.percentequip[$sec] > 80))
			if ($cport = 5)
				setvar $targeta 4

				gosub :checkpairdist
			elseif ($cport = 5)
				setvar $targeta 4

				gosub :checkpairdist
			end
		end
	end
	add $sec 1
end

return

:checkpairdist
setvar $fr1 "[] "
setvar $fr2 "[] "
getnearestwarps $neararray $sec
setvar $y 1
while ($y <= $neararray)
	setvar $focus $neararray[$y]

	if ((port.class[$focus] = $targeta) and ($portsused[$focus] = 0))
		getsectorparameter $focus "FIGSEC" $hasfig2
		if ($hasfig2 = 1)
			getdistance $to $focus $sec
			getdistance $from $sec $focus
			if (($to > 0) and ($from > 0))
				setvar $accum $to
				add $accum $from
				if ($accum <= $totaldist)
					setvar $pairsec $focus
					setvar $pairclass port.class[$focus]
					if (port.percentequip[$pairsec] > 80)
						setvar $portsused[$focus] 1
						setvar $portsused[$sec] 1
						add $portpairsi 1
						setvar $portpairs[$portpairsi][1] $sec
						setvar $portpairs[$portpairsi][2] $pairsec
						setvar $portpairs[$portpairsi][3] $from
						setvar $portpairs[$portpairsi][4] $to

						echo "Pair Found (" $portpairsi "):" $fr1 $sec "(" $ports[$cport] ") (" $from ") <> (" $to ") " $fr2 $pairsec "(" $ports[$pairclass] ")*"

						return
					end
				end
			end
		end
	end

	add $y 1
end

return

:checkpair
setvar $fr1 "[] "
setvar $fr2 "[] "
setvar $y 1
while ($y <= sector.warpcount[$sec])
	if ($portsused[sector.warps[$sec][$y]] = 0)
		if ((port.class[sector.warps[$sec][$y]] = $targeta) or (port.class[sector.warps[$sec][$y]] = $targetb))
			setvar $pairsec sector.warps[$sec][$y]
			setvar $pairclass port.class[sector.warps[$sec][$y]]
			getsectorparameter $pairsec "FIGSEC" $hasfig2
			if ($hasfig2 = 1)
				gosub :checkadj
				if ($adj = 1)
					setvar $portsused[sector.warps[$sec][$y]] 1
					setvar $portsused[$sec] 1
					getsectorparameter $sec "FIGSEC" $hasfig1
					if ($hasfig1)
						setvar $fr1 "[x] "
					end
					getsectorparameter $pairsec "FIGSEC" $hasfig2
					if ($hasfig2)
						setvar $fr2 "[x] "
					end
					echo "Pair Found:" $fr1 $sec "(" $ports[$cport] ") <> " $fr2 $pairsec "(" $ports[$pairclass] ")*"
					return
				else
					setvar $pairsec 0
					setvar $pairclass 0
				end
			end
		end
	end
	add $y 1
end

return

:checkadj
setvar $adj 0
setvar $x 1
while ($x <= sector.warpcount[$pairsec])
	if (sector.warps[$pairsec][$x] = $sec)
		setvar $adj 1
		return
	end
	add $x 1
end
return

:portreport
setvar $i 11
setarray $reportports 10
setarray $reportportsused 10

while ($i <= sectors)

	if (port.class[$i] > 0)
		add $reportports[port.class[$i]] 1
		if ($portsused[$i] = 1)
			add $reportportsused[port.class[$i]] 1
		end
	end
	add $i 1
end

echo "Port Status and Usage *"
echo "Ports BBS: " $reportportsused[1] "/" $reportports[1] "*"
echo "Ports BSB: " $reportportsused[2] "/" $reportports[2] "*"
echo "Ports SBB: " $reportportsused[3] "/" $reportports[3] "*"
echo "Ports SSB: " $reportportsused[4] "/" $reportports[4] "*"
echo "Ports SBS: " $reportportsused[5] "/" $reportports[5] "*"
echo "Ports BSS: " $reportportsused[6] "/" $reportports[6] "*"
echo "Ports SSS: " $reportportsused[7] "/" $reportports[7] "*"
echo "Ports BBB: " $reportportsused[8] "/" $reportports[8] "*"
echo "**"
return

# includes:
include "source\include\move"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
