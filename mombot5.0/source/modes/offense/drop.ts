reqrecording
# Mind Over Matter Planet Drop
# Author: Mind Dagger

gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "drop"
loadvar $bot~bot_turn_limit
loadvar $map~stardock
loadvar $bot~subspace
loadvar $switchboard~self_command
loadvar $ship~ship_max_attack

setvar $help~help[1]   $help~tab&"drop [on | off]{delay}{drop type}{trigger}{return}{kill} "
setvar $help~help[2]   $help~tab&"       "
setvar $help~help[3]   $help~tab&"     If started from command prompt, will be a ship dropper. "
setvar $help~help[4]   $help~tab&"       "
setvar $help~help[5]   $help~tab&"     - [delay]     = delay before dropping in milliseconds   "
setvar $help~help[6]   $help~tab&"     - [drop type] = [d]irect, [a]djacent, [s]urround, "
setvar $help~help[7]   $help~tab&"                     or [da] direct, then adjacent"
setvar $help~help[8]   $help~tab&"     - [delay]     = delay before dropping in milliseconds "
setvar $help~help[9]   $help~tab&"     - [trigger]   = [f]igs, [fm] figs or mines,  "
setvar $help~help[10]  $help~tab&"                     [m]ines, [uf] No-Fig Mines"
setvar $help~help[11]  $help~tab&"     - [return]    = return planet/ship home after 10 seconds"
setvar $help~help[12]  $help~tab&"     - [kill]      = checks for enemy, and kills if possible"
setvar $help~help[13]  $help~tab&"     - [fastkill]  = does kill mac without checking"
setvar $help~help[14]  $help~tab&"     - [holotorp]  = does holotorp command after drop"
setvar $help~help[15]  $help~tab&"     - [holokill]  = does holokill after drop"
setvar $help~help[16]  $help~tab&"         "
setvar $help~help[17]  $help~tab&"     All of these options can be run at the same time."
setvar $help~help[18]  $help~tab&"     - Order of operations are:"
setvar $help~help[19]  $help~tab&"             delay, drop, fastkill, kill,"
setvar $help~help[20]  $help~tab&"             holotorp, holokill, return"

gosub :help~helpfile

setvar $switchboard~message "Dropper starting up!*"
gosub :switchboard~switchboard

setvar $player~save true
gosub :combat~init

getsectorparameter sectors "FIGSEC" $isfigged
setvar $player~fasttwarp true

setvar $start_fig_hit "Deployed Fighters Report Sector "
setvar $end_fig_hit   ":"
setvar $alien_ansi    #27 & "[1;36m" & #27 & "["
setvar $start_fig_hit_owner ":"
setvar $end_fig_hit_owner "'s"
loadvar $map~stardock
loadvar $map~backdoor
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $bot~command
getword $bot~user_command_line $bot~parm1 1
getword $bot~user_command_line $bot~parm2 2
getword $bot~user_command_line $bot~parm3 3
getword $bot~user_command_line $bot~parm4 4
getword $bot~user_command_line $bot~parm5 5
getword $bot~user_command_line $bot~parm6 6
getword $bot~user_command_line $bot~parm7 7
getword $bot~user_command_line $bot~parm8 8
getsectorparameter sectors "FIGSEC" $isfigged
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~quikstats
gosub :player~getinfo
setvar $startinglocation $player~current_prompt
setvar $isplanetdrop false
if ($startinglocation = "Citadel")
	setvar $script_ver "Mind Over Matter Planet Dropper"
	setvar $isplanetdrop true
elseif ($startinglocation = "Command")
	setvar $script_ver "Mind Over Matter Ship Dropper"
	if ($player~twarp_type = "No")
		setvar $switchboard~message "No twarp available.  Ship dropper is no good without transwarp drive.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "This script must be run from the Citadel or Command Prompt*"
	gosub :switchboard~switchboard
	setvar $bot~mode "General"
	savevar $bot~mode
	halt
end
if ($bot~parm1 <> "on")
	setvar $switchboard~message "Please use [on/off] {delay} {drop type} {trigger type} {kill} {return}*"
	gosub :switchboard~switchboard
	halt
end
setvar $bot~user_command_line $bot~user_command_line&" "
isnumber $test $bot~parm2
if ($test)
	setvar $dropdelay $bot~parm2
else
	setvar $dropdelay 0
end
getwordpos $bot~user_command_line $pos " d "
if ($pos > 0)
	setvar $dropdescription "Direct"
else
	getwordpos $bot~user_command_line $pos " a "
	if ($pos > 0)
		setvar $dropdescription "Adjacent"
	else
		getwordpos $bot~user_command_line $pos " da "
		if ($pos > 0)
			setvar $dropdescription "Direct, then Adjacent"
		else
			getwordpos $bot~user_command_line $pos " s "
			if ($pos > 0)
				setvar $dropdescription "Surround"
			else
				getwordpos $bot~user_command_line $pos " ad "
				if ($pos > 0)
					setvar $dropdescription "Adjacent, then Direct"
				else
					setvar $dropdescription "Direct"
				end
			end
		end
	end
end
getwordpos $bot~user_command_line $pos " f "
if ($pos > 0)
	setvar $triggerdescription "Fighters"
else
	getwordpos $bot~user_command_line $pos " fm "
	if ($pos > 0)
		setvar $triggerdescription "Fighters and Mines"
	else
		getwordpos $bot~user_command_line $pos " m "
		if ($pos > 0)
			setvar $triggerdescription "Mines"
		else
			getwordpos $bot~user_command_line $pos " uf "
			if ($pos > 0)
				setvar $triggerdescription "Unfigged Mines"
			else
				setvar $triggerdescription "Fighters and Mines"
			end
		end
	end
end
getwordpos $bot~user_command_line $pos "return"
if ($pos > 0)
	setvar $returnhome true
	setvar $returnhomedelay 10
else
	setvar $returnhome false
	setvar $returnhomedelay 0
end

getwordpos $bot~user_command_line $pos "kill"
if ($pos > 0)
	setvar $attackonsight true
else
	setvar $attackonsight false
end

getwordpos " "&$bot~user_command_line&" " $pos " fastkill "
if ($pos > 0)
	setvar $fastkill true
else
	setvar $fastkill false
end
getwordpos " "&$bot~user_command_line&" " $pos " holokill "
getwordpos " "&$bot~user_command_line&" " $pos2 " hkill "
if (($pos > 0) or ($pos2 > 0))
	setvar $holokill true
else
	setvar $holokill false
end
getwordpos " "&$bot~user_command_line&" " $pos " holotorp "
getwordpos " "&$bot~user_command_line&" " $pos2 " htorp "
if (($pos > 0) or ($pos2 > 0))
	setvar $holotorp true
	if ($player~photons <= 0)
		setvar $switchboard~message "You can't run holotorp option without photons on your ship.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $holotorp false
end

if (($holokill = true) or ($holotorp = true))
	if (($player~scan_type = "None") or ($player~scan_type = "Density"))
		setvar $switchboard~message "You need holoscanner to run the options you've chosen.*"
		gosub :switchboard~switchboard
		halt
	end
end
if (($attackonsight = true) or ($fastkill = true) or ($holokill = true))
	if ($player~fighters < 100)
		setvar $switchboard~message "Fighters are waayyy too low for kill option.  You should refill first.*"
		gosub :switchboard~switchboard
		halt
	end
end

gosub :player~quikstats
setvar $homesector $player~current_sector

if ($player~corporation > 0)
	gosub :getcorpies
end
gosub :getname

setvar $dropsector 0
setvar $endline "_ENDLINE_"
setvar $startline "_STARTLINE_"
gosub :ship~getshipstats

if ($isplanetdrop)
	gosub :planetstats
	setvar $message "Planet Dropper Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$dropdescription&" On "&$triggerdescription
else
	setvar $message "Ship Dropper Currently Running On Ship "&$player~ship_number&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$dropdescription&" On "&$triggerdescription
end

if ($targetingperson)
	setvar $message $message&"*        Targeting: (Player) "&$target
else
	setvar $message $message&"*        Targeting: Everyone"
end
if (($isplanetdrop <> true) and ($player~towed <> ""))
	setvar $message $message&"*           Towing: "&$player~towed
end
if ($prelockactive)
	if ($prelockreleasetime > 0)
		setvar $message $message&"*         Pre-Lock: Enabled With "&$prelockreleasetime&" Second Release"
	else
		setvar $message $message&"*         Pre-Lock: Enabled With Manual Release Only"
	end
end
if ($dropdelay > 0)
	setvar $message $message&"*       Drop Delay: "&$dropdelay&" ms"
end
if ($attackonsight)
	if ($isplanetdrop)
		setvar $message $message&"*        Auto Kill: Enabled With "&$planet~planetfighters&" Fighters"
	else
		setvar $message $message&"*        Auto Kill: Enabled With "&$player~fighters&" Fighters"
	end
end
if ($fastkill)
	setvar $message $message&"*        Fast Kill: Will attempt kill macro at every pdrop attempt"
end
if ($holotorp)
	setvar $message $message&"*         Holotorp: Will attempt photoning any adjacent enemies"
end
if ($holokill)
	setvar $message $message&"*         Holokill: Will attempt to kill any adjacent enemies"
end
if ($returnhome)
	setvar $message $message&"*      Return Home: Enabled With "&$returnhomedelay&" Second Delay"
end
setvar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
setvar $switchboard~message $message
gosub :switchboard~switchboard

:starttargeting
gosub :player~quikstats
if ($isplanetdrop <> true)
	if ($player~twarp_type = "No")
		setvar $switchboard~message "No twarp available.  Possible pod?*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~fighters <= 0)
		setvar $switchboard~message "No more fighters available.  Fill up before running.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~ore_holds <= 10)
		setvar $switchboard~message "Fuel too low.  Fill back up before running again.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~ore_holds < $player~total_holds)
		setvar $switchboard~message "WARNING: You have "&$player~ore_holds&" out of "&$player~total_holds&" holds of fuel.  Make sure that's enough!*"
		gosub :switchboard~switchboard
	end
end
killalltriggers
if (($returnhome = true) and ($ismanual <> true) and ($player~current_sector <> $homesector))
	setvar $timeinmilli (($returnhomedelay * 1000)+100)
	echo ansi_6 "*    [" ansi_14 "Returning Home In " ansi_15 $returnhomedelay ansi_14 " Seconds" ansi_6 "]*" ansi_7
	setdelaytrigger homedelay :gohome $timeinmilli
end
settextlinetrigger manual :manualpwarp "Planetary TransWarp Drive Engaged!"
settextlinetrigger manual2 :manualtwarp "All Systems Ready, shall we engage? Yes"
if (($triggerdescription = "Fighters and Mines") or ($triggerdescription = "Mines") or ($triggerdescription = "Unfigged Mines"))
	if ($targetingperson = false)
		settexttrigger limp :attacksectorlimpet "Limpet mine in "
	end
	settexttrigger armid :attacksectormine "Your mines in "
end
if (($triggerdescription = "Fighters and Mines") or ($triggerdescription = "Fighters"))
	settexttrigger fig :attacksectorfighter "Deployed Fighters "
end
#setTextLineTrigger save :saveCall "=saveme"

settextlinetrigger warn :keepalive "INACTIVITY WARNING:"
settexttrigger pause :pausing "Planet command (?="
settexttrigger pause2 :pausing "Computer command ["
settexttrigger pause3 :pausing "Corporate command ["
settexttrigger pause4 :pausing "Transfer To or From the Treasury (T/F)"
settexttrigger pause5 :pausing "Qcannon Control Type :"
settexttrigger pause6 :pausing "Beam to what sector? (U=Upgrade"
setvar $ismanual false
if ($attackonsight)
	settextlinetrigger warps :scan "warps into the sector."
	settextlinetrigger lifts :scan "lifts off from"
end
pause

:scan
killalltriggers
gosub :checkforvictims
goto :starttargeting

:keepalive
killalltriggers
gosub :warning
goto :starttargeting

:pausing
killalltriggers
if ($isplanetdrop)
	echo ansi_6 "*[" ansi_14 $script_ver " paused. To restart, re-enter Citadel Prompt" ansi_6 "]*" ansi_7
	settexttrigger restart :restarting "Citadel command ("
else
	echo ansi_6 "*[" ansi_14 $script_ver " paused. To restart, re-enter Command Prompt" ansi_6 "]*" ansi_7
	settexttrigger restart :restarting "Command [TL="
end
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 $script_ver " restarted" ansi_6 "]*" ansi_7
goto :starttargeting

:answer
killalltriggers
gosub :authenticate
if ($auth_result = "true")
	killalltriggers
	send $message
	waiton "Sub-space comm-link terminated"
end
goto :starttargeting

:gohome
killalltriggers
if ($isplanetdrop)
	send "p " $homesector "*y"
else
	killalltriggers
	setvar $player~warpto $homesector
	gosub :move~twarp
	if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
		setvar $switchboard~message "Could not make it back home with twarp. - ["&$player~msg&"]*"
		gosub :switchboard~switchboard
		halt
	end
end
goto :starttargeting

:manualpwarp
killalltriggers
if ($attackonsight)
	gosub :checkforvictims
end
setvar $ismanual true
goto :starttargeting

:manualtwarp
killalltriggers
if ($attackonsight)
	gosub :checkforvictims
end
setvar $ismanual true
goto :starttargeting

:attacksectormine
gosub :validateminehit
if ($isvalid <> true)
	goto :starttargeting
end
goto :getdropsector

:attacksectorlimpet
gosub :validatelimpethit
if ($isvalid <> true)
	goto :starttargeting
end
goto :getdropsector

:attacksectorfighter
gosub :validatefighterhit
if ($isvalid <> true)
	goto :starttargeting
end

:getdropsector
if ($dropdescription = "Direct")
	if ($isplanetdrop)
		setvar $send "p "&$dropsector&"* y "
		if ($fastkill = true)
			setvar $send $send&"q q a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
		end
		send $send
	else
		killalltriggers
		setvar $player~warpto $dropsector
		gosub :move~twarp
		if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it to attack sector - ["&$player~msg&"]*"
			gosub :switchboard~switchboard
			goto :starttargeting
		end
		if ($fastkill = true)
			send "a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n * * "
		end
	end
	gosub :player~quikstats
	if ($player~current_sector = $dropsector)
		if ($attackonsight)
			gosub :checkforvictims
		end
	else
		if ($isplanetdrop)
			setsectorparameter $dropsector "FIGSEC" false
		end
	end
elseif ($dropdescription = "Adjacent")
	gosub :findadjacent
	gosub :attemptdrop
	if ($attackonsight)
		gosub :checkforvictims
	end
	gosub :player~quikstats
elseif ($dropdescription = "Adjacent, then Direct")
	gosub :findadjacent
	gosub :attemptdrop
	if ($isplanetdrop)
		send "p " $dropsector "* y "
	else
		setvar $player~warpto $dropsector
		gosub :move~twarp
		if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
			goto :pwarpno
		else
			if ($fastkill = true)
				send "a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n * * "
			end
		end
	end
	if ($attackonsight)
		gosub :checkforvictims
	end
	gosub :player~quikstats
elseif ($dropdescription = "Direct, then Adjacent")
	if ($isplanetdrop)
		setvar $gotosector $dropsector
		send "p " $dropsector "* y "
	else
		setvar $gotosector $dropsector
		setvar $player~warpto $dropsector
		gosub :move~twarp
		if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
			goto :pwarpno
		else
			if ($fastkill = true)
				send "a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n * * "
			end
		end
	end
	gosub :findadjacent
	gosub :attemptdrop
	if ($attackonsight)
		gosub :checkforvictims
	end
	gosub :player~quikstats
elseif ($dropdescription = "Surround")
	gosub :attemptsurrounddrop
	if ($attackonsight)
		gosub :checkforvictims
	end
	gosub :player~quikstats
else
	if ($dropsector <> $player~current_sector)
		send "p " $dropsector "*y"
		settexttrigger pwarpnotok :pwarptryadjacent "You do not have any fighters in Sector "
		settexttrigger pwarpok :pwarpdone " Planetary TransWarp Drive Engaged! "
		pause

		:pwarpdone
		killalltriggers
		setvar $player~current_sector $dropsector
		if ($attackonsight)
			gosub :checkforvictims
		end
		goto :starttargeting
	else
		if ($attackonsight)
			gosub :checkforvictims
		end
		goto :starttargeting
	end

	:pwarptryadjacent
	killalltriggers
	setsectorparameter $dropsector "FIGSEC" false
	gosub :findadjacent
	gosub :attemptdrop
	goto :starttargeting

end
goto :starttargeting

:end
killalltriggers
echo ansi_6 "*[" ansi_14 $script_ver " Shutting Down" ansi_6 "]*" ansi_7
halt

:attemptsurrounddrop
setvar $i 1
setvar $checksector sector.warps[$dropsector][$i]
setvar $isfound false
while (($checksector > 0) and ($isfound = false))
	getsectorparameter $checksector "FIGSEC" $isfigged
	if ($isfigged <> true)
		setvar $retreatsector $checksector
		setvar $isfound true
	else
		add $i 1
		setvar $checksector sector.warps[$dropsector][$i]
	end
end

if ($isfound)
	setvar $i 2
	setvar $checksector sector.warps[$retreatsector][$i]
	setvar $isfound false
	setvar $targets ""
	setvar $targetcount 0
	while (($checksector > 0) and ($targetcount <= 0))
		getsectorparameter $checksector "FIGSEC" $isfigged
		if (($isfigged = true) and ($checksector <> $dropsector))
			setvar $targets $targets&" "&$checksector&" "
			add $targetcount 1
		end
		setvar $checksector sector.warps[$retreatsector][$i]
		add $i 1
	end
	if ($targetcount > 0)
		setvar $gotosector $targets
		gosub :dopwarp
	else
		echo "** No Adjacent Fig Next To Possible Retreat Sector **"
	end
else
	echo "** No Possible Retreat Sector **"
end
return

:attemptdrop
if ($targetcount > 0)
	getrnd $randomtarget 1 $targetcount
	if ($dropdelay > 0)
		killalltriggers
		setdelaytrigger delay :planetdrop $dropdelay
		pause
	end

	:planetdrop
	setvar $gotosector $targetsectors[$randomtarget]
	gosub :dopwarp
end

return

:dopwarp
killalltriggers
if ($isplanetdrop)
	setvar $send "p "&$gotosector&"*y"
	if ($fastkill = true)
		setvar $send $send&"q q a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
	end
	send $send
	settextlinetrigger pwarpno :pwarpno "You do not have any fighters in Sector "
	settextlinetrigger pwarpyes :pwarpyes " Planetary TransWarp Drive Engaged! "
	settextlinetrigger pwarpalreadythere :pwarpfinished "You are already in that sector!"
	pause
else
	killalltriggers
	setvar $player~warpto $gotosector
	gosub :move~twarp
	if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
		goto :pwarpno
	end
	if ($fastkill = true)
		send "a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n a y y "&$ship~ship_max_attack&"* * z n * * "
	end
	goto :pwarpyes
end

:pwarpno
killalltriggers
setvar $targetsectors[$randomtarget] 0
setsectorparameter $gotosector "FIGSEC" false
setvar $i 1
while ($i <= $targetcount)
	if ($targetsectors[$i] > 0)
		setvar $randomtarget $i
		goto :planetdrop
	end
	add $i 1
end
goto :pwarpfinished

:pwarpyes
killalltriggers

:pwarpfinished
gosub :player~quikstats

return

:clearscreen
echo #27 & "[2J"
return

:turnoffansi
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword currentline $ansistatus 5
waiton "(2) Animation display"
getword currentline $animationstatus 5
if ($animationstatus = "On")
	send "2"
end
if ($ansistatus = "On")
	send "1 q q"
else
	send "q q"
end
waiton "<Computer deactivated>"
return

:turnonansi
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword currentline $ansistatus 5
if ($ansistatus = "Off")
	send "1 q q"
else
	send "q q"
end
waiton "<Computer deactivated>"
return

:planetstats
send "q "
gosub :player~quikstats
send "*"
waiton "Planet #"
getword currentline $planet~planet 2
waiton "Fighters"
getword currentline $planet~planetfighters 5
striptext $planet~planet "#"
send "c"
return

:warning
send "#"
return

:landonplanetentercitadel
send "l " $planet~planet "* c"
waiton "<Enter Citadel>"
return

:leavecitadelandplanet
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return

:showprelockoptions
echo ansi_6 "*[" ansi_14 $script_ver " Pre-locked onto sector " $gotosector ansi_6 "]*" ansi_7
echo ansi_6 "  [" ansi_14 "%" ansi_6 "]" ansi_15 " Let Go of Pre-Lock*"  ansi_7
if ($prelockreleasetime > 0)
	echo ansi_6 "[" ansi_14 "Script will release pre-lock automatically in "&$prelockreleasetime&" seconds.." ansi_6 "]*" ansi_7
end
return

:showoptions
echo ansi_6 "*[" ansi_14 $script_ver " Options" ansi_6 "]*" ansi_7
echo ansi_6 "  [" ansi_14 "%" ansi_6 "]" ansi_15 " Change Drop Settings*"
echo ansi_6 "[" ansi_14 $script_ver " waiting for targets.." ansi_6 "]*" ansi_7
return

:scanit_again
killalltriggers
gosub :sector~getsectordata
if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))
	if ($isplanetdrop)
		gosub :combat~fastcitadelattack
	else
		gosub :combat~fastattack
	end
	goto :scanit_again
elseif (($sector~emptyshipcount > $sector~myshipcount) and ($capemptyships = true))
	gosub :combat~fastcapture
	goto :scanit_again
end
goto :starttargeting

:checkforvictims
gosub :player~quikstats
if ($player~fighters <= 0)
	goto :gohome
end

:scanit_again
setvar $player~startinglocation $player~current_prompt
gosub :sector~getsectordata
if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))
	if ($isplanetdrop)
		gosub :combat~fastcitadelattack
	else
		gosub :combat~fastattack
	end
	goto :scanit_again
elseif (($sector~emptyshipcount > $sector~myshipcount))
	gosub :combat~fastcapture
	goto :scanit_again
end
if ($holotorp)
	setvar $bot~command "htorp"
	setvar $bot~user_command_line " htorp "
	setvar $bot~parm1 ""
	savevar $bot~parm1
	savevar $bot~command
	savevar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\offense\htorp.cts"
	seteventtrigger		htorpdone		:htorpdone "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\offense\htorp.cts"
	pause

	:htorpdone
end
if ($holokill)
	setvar $before_holo_kill_sector $player~current_sector
	gosub :combat~holokill
	if ($player~current_sector <> $before_holo_kill_sector)
		setvar $player~warpto $before_holo_kill_sector
		gosub :move~twarp
		if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector before holokill. - ["&$player~msg&"]*"
			gosub :switchboard~switchboard
			halt
		end
	end

end
return

:getdropperstats
send "c;q"
waitfor "Figs Per Attack:"
getword currentline $ship~ship_max_attack 5

send "q m****c "
waiton "Planet #"
getword currentline $planet~planet 2
waiton "Fighters        N/A"
getword currentline $planet~planetfighters 5
waiton "<Enter Citadel>"

striptext $planet~planet "#"
setvar $ismanual false
gosub :player~quikstats
return

:authenticate
killalltriggers
setvar $subline currentline
setvar $subline $subline & "             "
getword $subline $spoof 1
cuttext $subline $subsender 3 6
setvar $auth_result "false"
if ($spoof = "'")
	setvar $auth_result "self"
elseif ($spoof = "R")
	setvar $thiscorpie 0

	:corpiesubloop
	add $thiscorpie 1
	if ($thiscorpie <= $player~corpies)
		if (($subsender = $player~corpie[$thiscorpie]))
			setvar $auth_result "true"
			goto :authdone
		end
		goto :corpiesubloop
	end
end

:authdone
return

:getname
send "I"
waitfor "<Info>"

:waitforname
settextlinetrigger getname :gettradername "Trader Name    :"
settexttrigger getnamedone :getnamedone "Command [TL="
settexttrigger getnamedone2 :getnamedone "Citadel command"
pause

:gettradername
killalltriggers
setvar $name currentline
striptext $name "Trader Name    : "
striptext $name "3rd Class "
striptext $name "2nd Class "
striptext $name "1st Class "
striptext $name "Annoyance "
striptext $name "Nuisance "
striptext $name "Menace "
striptext $name "Smuggler Savant "
striptext $name "Smuggler "
striptext $name "Robber "
striptext $name "Private "
striptext $name "Lance Corporal "
striptext $name "Corporal "
striptext $name "Staff Sergeant "
striptext $name "Gunnery Sergeant "
striptext $name "1st Sergeant "
striptext $name "Sergeant Major "
striptext $name "Sergeant "
striptext $name "Chief Warrant Officer "
striptext $name "Warrant Officer "
striptext $name "Terrorist "
striptext $name "Infamous Pirate "
striptext $name "Notorious Pirate "
striptext $name "Dread Pirate "
striptext $name "Pirate "
striptext $name "Galactic Scourge "
striptext $name "Enemy of the State "
striptext $name "Enemy of the People "
striptext $name "Enemy of Humankind "
striptext $name "Heinous Overlord "
striptext $name "Prime Evil "
striptext $name "Ensign "
striptext $name "Lieutenant J.G. "
striptext $name "Lieutenant Commander "
striptext $name "Lieutenant "
striptext $name "Commander "
striptext $name "Captain "
striptext $name "Commodore "
striptext $name "Rear Admiral "
striptext $name "Vice Admiral "
striptext $name "Fleet Admiral"
striptext $name "Admiral "
striptext $name "Civilian "
goto :waitforname

:getnamedone
killalltriggers
return

# ----- SUB :getCorpies
:getcorpies
setvar $player~corpies 0
send "XAQ"
waitfor " Corp Member Name                   Sector  Fighters Shields Mines  Credits"
waitfor "------------------------------------------------------------------------------"

:waitforcorpiename
settextlinetrigger getcorpiename :getcorpiename
pause

:getcorpiename
killalltriggers
if (currentline = "P indicates Trader is on a planet in that sector")
	goto :getcorpienamedone
end
add $player~corpies 1
setvar $player~corpieline currentline
setvar $player~corpieline $player~corpieline & "          "
cuttext $player~corpieline $player~corpie[$player~corpies] 1 6
goto :waitforcorpiename

:getcorpienamedone
killalltriggers
return

:validateminehit
setvar $isvalid false
cuttext currentline&"    " $ck 1 1
if ($ck <> "Y")
	return
end
gettext currentline $dropsector "Your mines in " " did"
gettext currentansiline $alien_check $start_fig_hit_owner $end_fig_hit_owner
getwordpos currentline $pos $start_fig_hit_owner
getwordpos $alien_check $apos $alien_ansi
if (($apos > 0) or ($pos = 0))
	return
end
if ($targetingperson)
	getwordpos currentline&" " $pos " "&$target&" "
	if ($pos = 0)
		return
	end
end
setvar $isvalid true
return

:validatelimpethit
setvar $isvalid false
cuttext currentline&" " $radio 1 1
if ($radio <> "L")
	return
end
setvar $isvalid true
gettext currentline $dropsector "Limpet mine in " " a"
return

:validatefighterhit
setvar $isvalid false
cuttext currentline&" " $radio 1 1
gettext currentline $dropsector $start_fig_hit $end_fig_hit
if ($radio <> "D")
	return
end
gettext currentansiline $alien_check $start_fig_hit_owner $end_fig_hit_owner
getwordpos currentline $pos $start_fig_hit_owner
getwordpos $alien_check $apos $alien_ansi
if (($apos > 0) or ($pos = 0))
	return
end
if ($targetingperson)
	getwordpos currentline $pos " "&$target&"'s "
	if ($pos <= 0)
		return
	end
end
setvar $isvalid true
return

:findadjacent
getsectorparameter $dropsector "FIGSEC" $isfigged
if (($triggerdescription = "Unfigged Mines") and ($isfigged = true))
	return
else
	setvar $i 1
	setvar $checksector sector.warps[$dropsector][$i]
	setarray $targetsectors 6
	setvar $targetcount 0
	while ($checksector > 0)
		getsectorparameter $checksector "FIGSEC" $isfigged
		if ($isfigged = true)
			add $targetcount 1
			setvar $targetsectors[$targetcount] $checksector
		end
		add $i 1
		setvar $checksector sector.warps[$dropsector][$i]
	end
	if ($targetcount <= 0)
		echo "No Targets..*"
		setvar $targetsectors[1] $current_location
	end
end

return

#INCLUDES:
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
