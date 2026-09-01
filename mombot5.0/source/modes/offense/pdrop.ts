reqrecording
# Mind Over Matter Planet Drop
# Author: Mind Dagger

gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "pdrop"
loadvar $bot~bot_turn_limit
loadvar $map~stardock
loadvar $bot~subspace
loadvar $switchboard~self_command
loadvar $ship~ship_max_attack

setvar $help~help[1]   $help~tab&"pdrop {delay:#} {d|a|s|da|de} {fm|f|m|uf} {return} {kill}     "
setvar $help~help[2]   $help~tab&"      {fastkill} {defender} {perfect} {density} {lock}        "
setvar $help~help[3]   $help~tab&"      {plockt:#} {figs:#} {offensive} {twohops} {retrigger}   "
setvar $help~help[4]   $help~tab&"      {densityx} {iglift}                                     "
setvar $help~help[5]   $help~tab&"        "
setvar $help~help[6]   $help~tab&"  {delay:#} - delay before dropping in milliseconds"
setvar $help~help[7]   $help~tab&"        {d} - direct drop"
setvar $help~help[8]   $help~tab&"        {a} - adjacent drop"
setvar $help~help[9]   $help~tab&"        {s} - surround drop"
setvar $help~help[10]  $help~tab&"       {da} - direct, then adjacent drop"
setvar $help~help[11]  $help~tab&"       {de} - dead end drop"
setvar $help~help[12]  $help~tab&"       {fm} - trigger on fighter and mine hits"
setvar $help~help[13]  $help~tab&"        {f} - trigger on fighter hits only"
setvar $help~help[14]  $help~tab&"        {m} - trigger on mines only"
setvar $help~help[15]  $help~tab&"       {uf} - trigger on mines with no fighters"
setvar $help~help[16]  $help~tab&"   {return} - will return planet home after 10 seconds"
setvar $help~help[17]  $help~tab&"     {kill} - checks for enemy, and kills if possible"
setvar $help~help[18]  $help~tab&" {fastkill} - does kill mac without checking"
setvar $help~help[19]  $help~tab&" {defender} - sets and lifts IG capable defender"
setvar $help~help[20]  $help~tab&"  {perfect} - Only drops adjacent when it is only option"
setvar $help~help[21]  $help~tab&"  {density} - Drops adjacent, runs density photon"
setvar $help~help[22]  $help~tab&"     {lock} - Locks on sector then halts"
setvar $help~help[23]  $help~tab&" {plockt:#} - Plock delay before retrigger. Default is no retrigger."
setvar $help~help[24]  $help~tab&"   {figs:#} - drop this many figs to sector on landing"
setvar $help~help[25]  $help~tab&"{offensive} - make figs offensive, default defense."
setvar $help~help[26]  $help~tab&"  {twohops} - deadend drop, make sure de 2 hops or more away"
setvar $help~help[27]  $help~tab&"{retrigger} - Keep hunting for targets"
setvar $help~help[28]  $help~tab&" {densityx} - Density < 40 for xport in and deploy"
setvar $help~help[29]  $help~tab&"   {iglift} - sets and lifts IG self"
setvar $help~help[30]  $help~tab&"    "
setvar $help~help[31]  $help~tab&"   Examples:"
setvar $help~help[32]  $help~tab&"      >pdrop delay:10000 d f return kill"
setvar $help~help[33]  $help~tab&"      >pdrop 1000 da fm "
setvar $help~help[34]  $help~tab&"      >pdrop a f kill"

gosub :help~helpfile

setvar $switchboard~message "Planet Dropper starting up!*"
gosub :switchboard~switchboard

setvar $player~save true
gosub :combat~init

getsectorparameter sectors "FIGSEC" $isfigged

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
setvar $startinglocation $player~current_prompt
setvar $script_ver "Mind Over Matter Bot P-drop"
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "This script must be run from the Citadel Prompt*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end

loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

gosub :ship~getshipstats

setvar $bot~user_command_line " "&$bot~user_command_line&" "

getwordpos $bot~user_command_line $pos " delay:"
if ($pos > 0)
	setvar $cline $bot~user_command_line & " "
	gettext $cline $dropdelay "delay:" " "
else
	isnumber $test $bot~parm1
	if ($test)
		setvar $dropdelay $bot~parm1
	else
		setvar $dropdelay 0
	end
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
					getwordpos $bot~user_command_line $pos " de "
					if ($pos > 0)
						setvar $dropdescription "Deadend Drop"
					else
						setvar $dropdescription "Direct"
					end
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
setvar $randomattack true

getwordpos $bot~user_command_line $pos "cap"
if ($pos > 0)
	setvar $capture true
	setvar $attackonsight true
else
	setvar $capture false
end

getwordpos $bot~user_command_line $pos "fastkill"
if ($pos > 0)
	setvar $fastkill true
else
	setvar $fastkill false
end

getwordpos $bot~user_command_line $pos "retrigger"
if ($pos > 0)
	setvar $retrigger true
else
	setvar $retrigger false
end

setvar $dropftrstype "d"
getwordpos $bot~user_command_line $pos "figs:"
if ($pos > 0)
	setvar $dropftrs true
	setvar $cline $bot~user_command_line & " "
	gettext $cline $dropfigquant "figs:" " "

	getwordpos $bot~user_command_line $pos "offensive"
	if ($pos > 0)
		setvar $dropftrstype "o"
	else
		setvar $dropftrstype "d"
	end
else
	setvar $dropftrs false
end

getwordpos $bot~user_command_line $pos "plockt:"
if ($pos > 0)

	setvar $cline $bot~user_command_line & " "
	gettext $cline $plocktimer "plockt:" " "
else
	setvar $plocktimer 0
end

getwordpos $bot~user_command_line $pos "defender"
if ($pos > 0)
	setvar $defender true
else
	setvar $defender false
end

getwordpos $bot~user_command_line $pos "perfect"
if ($pos > 0)
	setvar $perfect true
else
	setvar $perfect false
end
getwordpos $bot~user_command_line $pos "lock"
if ($pos > 0)
	setvar $lock true
else
	setvar $lock false
end

getwordpos $bot~user_command_line $pos "twohops"
if ($pos > 0)
	setvar $twohops true
else
	setvar $twohops false
end

getwordpos $bot~user_command_line $pos "density"
if ($pos > 0)
	setvar $density true
	if ($dropdescription = "Direct")
		setvar $dropdescription "Adjacent"
	end
	if ($player~photons < 1)
		setvar $switchboard~message "No Photons on Board!!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $density false
end

getwordpos $bot~user_command_line $pos "densityx"
if ($pos > 0)
	setvar $densityx true
else
	setvar $densityx false
end

getwordpos $bot~user_command_line $pos "iglift"
if ($pos > 0)
	setvar $iglift true
else
	setvar $iglift false
end

setvar $randomattack true

gosub :player~quikstats
if ($player~corporation > 0)
	gosub :getcorpies
end
gosub :getname
setvar $script_ver "Planet Drop"

setvar $dropsector 0
setvar $endline "_ENDLINE_"
setvar $startline "_STARTLINE_"
cuttext currentline $location 1 7
if ($location <> "Citadel")
	echo ansi_12 "**This script must be run from the Citadel Prompt"
	halt
end
send "c;q"
waitfor "Figs Per Attack:"
getword currentline $maxfigattack 5

gosub :planetstats

setvar $message "'*  {"&$bot~bot_name&"} - Planet Dropper Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$dropdescription&" On "&$triggerdescription
if ($targetingperson)
	setvar $message $message&"*        Targeting: (Player) "&$target
else
	setvar $message $message&"*        Targeting: Everyone"
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
if ($lock)
	setvar $message $message&"*       Plock Mode: Enabled"
end
if ($attackonsight)
	format $planet~planet_fighters $formatted_fighters number
	if ($capture)
		setvar $message $message&"*         Auto Cap: Enabled With "&$formatted_fighters&" Fighters"
	else
		setvar $message $message&"*        Auto Kill: Enabled With "&$formatted_fighters&" Fighters"
	end
end
if ($fastkill)
	setvar $message $message&"*        Fast Kill: Will attempt kill macro at every pdrop attempt"
end
if ($returnhome)
	setvar $message $message&"*      Return Home: Enabled With "&$returnhomedelay&" Second Delay"
end
if ($retrigger)
	setvar $message $message&"*        ReTrigger: We will keep firing whether we hit or miss."
end

if ($defender = 1)
	setvar $message $message&"*         Defender: Will set and reset IG enabled Corp Mate"
end
if ($perfect = 1)
	setvar $message $message&"*          Perfect: Will only drop adjacent on perfect firing solution."
end
if ($density = 1)
	setvar $message $message&"*          Density: Dropping in next door with density foton."
end
if ($density = 1) and ($densityx = 1)
	setvar $message $message&"*          Density: Only shooting from 1 to 39."
end
if ($iglift = 1)
	setvar $message $message&"*           IGLift: I will lift on landing and hold."
end

if ($randomattack)
	setvar $message $message&"*   Attack Pattern: Random"
elseif ($firstattack)
	setvar $message $message&"*   Attack Pattern: First Available Target"
elseif ($secondattack)
	setvar $message $message&"*   Attack Pattern: Second Available Target"
elseif ($thirdattack)
	setvar $message $message&"*   Attack Pattern: Third Available Target"
elseif ($fourthattack)
	setvar $message $message&"*   Attack Pattern: Fourth Available Target"
elseif ($fifthattack)
	setvar $message $message&"*   Attack Pattern: Fifth Available Target"
elseif ($sixthattack)
	setvar $message $message&"*   Attack Pattern: Sixth Available Target"
else
	setvar $message $message&"*   Attack Pattern: Last Available Target"
end
setvar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
send $message
if ($defender = 1)
	gosub :checkdefenders
	gosub :setdefender
end
if ($iglift = 1)
	gosub :liftandcheckig
end
gosub :player~quikstats
setvar $homesector $player~current_sector

:starttargeting
killalltriggers
if (($returnhome = true) and ($ismanual <> true) and ($player~current_sector <> $homesector))
	setvar $timeinmilli (($returnhomedelay * 1000)+100)
	echo ansi_6 "*    [" ansi_14 "Returning Home In " ansi_15 $returnhomedelay ansi_14 " Seconds" ansi_6 "]*" ansi_7
	setdelaytrigger homedelay :gohome $timeinmilli
end
settextlinetrigger manual :manualpwarp "Planetary TransWarp Drive Engaged!"
if (($triggerdescription = "Fighters and Mines") or ($triggerdescription = "Mines") or ($triggerdescription = "Unfigged Mines"))
	if ($targetingperson = false)
		settexttrigger limp :attacksectorlimpet "Limpet mine in "
	end
	settexttrigger armid :attacksectormine "Your mines in "
end
if (($triggerdescription = "Fighters and Mines") or ($triggerdescription = "Fighters"))
	settexttrigger fig :attacksectorfighter "Deployed Fighters "
end
settextlinetrigger warn :keepalive "INACTIVITY WARNING:"
setstrigger pause :pausing "Planet command (?="
setstrigger pause2 :pausing "Computer command ["
setstrigger pause3 :pausing "Corporate command ["
settexttrigger pause4 :pausing "Transfer To or From the Treasury (T/F)"
settexttrigger pause5 :pausing "Qcannon Control Type :"
settexttrigger pause6 :pausing "Beam to what sector? (U=Upgrade"
settextouttrigger redosettings :dosettings "%"
#setTextLineTrigger scriptcheck :answer "script?"
#setTextLineTrigger scriptcheck2 :answer "Script?"
setvar $ismanual false
if ($attackonsight)
	settextlinetrigger 	limp2 	:scan 	"Limpet mine in "&$player~current_sector
	settextlinetrigger 	warps 	:scan 	"warps into the sector."
	settextlinetrigger 	lifts 	:scan 	"lifts off from"
	settextlinetrigger 	deffig 	:scan 	"Deployed Fighters Report Sector "&$player~current_sector
	settextlinetrigger 	secgun 	:scan 	"Quasar Cannon on"
	settextlinetrigger 	ig		:scan 	"Shipboard Computers The Interdictor Generator on"
	settextlinetrigger 	power 	:scan 	"is powering up weapons systems!"
	settextlinetrigger  wave    :scan    " launches a wave of fighters at  "
	settextlinetrigger  planet  :scan	" launches a Genesis Torpedo into the sector!"
	settextlinetrigger  atomic  :scan    " appears from the planetary rubble."
	settextlinetrigger 	exits 	:scan 	"exits the game."
	settextlinetrigger 	enters 	:scan 	"enters the game."
	setdelaytrigger		delay	:scan	30000
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

:dosettings
killalltriggers
gosub :waitforrestart
goto :starttargeting

:pausing
killalltriggers
echo ansi_6 "*[" ansi_14 $script_ver " paused. To restart, re-enter Citadel Prompt" ansi_6 "]*" ansi_7
setstrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 $script_ver " restarted" ansi_6 "]*" ansi_7
gosub :getsectorlocation
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

if ($dropftrs)

	gosub :retrievefigs

end

send "p " $homesector "*y"

:manualpwarp
killalltriggers
if ($attackonsight)
	gosub :checkforvictims
end
setvar $ismanual true
gosub :getsectorlocation
goto :starttargeting

:attacksectormine
killtrigger fig
killtrigger limp
gosub :validateminehit
if ($isvalid <> true)
	goto :starttargeting
end
goto :getdropsector

:attacksectorlimpet
killtrigger armid
killtrigger fig
gosub :validatelimpethit
if ($isvalid <> true)
	goto :starttargeting
end
goto :getdropsector

:attacksectorfighter
killtrigger armid
killtrigger limp
gosub :validatefighterhit
if ($isvalid <> true)
	goto :starttargeting
end

:getdropsector
if ($dropdescription = "Direct")
	if ($lock = true)
		setvar $send "p "&$dropsector&"*"
		send $send
		goto :dolock
	else
		setvar $send "p "&$dropsector&"* y "
		if ($fastdrop = true)
			if ($ship~ship_fighters_max <= 100000)
				setvar $figstodrop ($ship~ship_fighters_max/2)
			else
				setvar $figstodrop ($ship~ship_fighters_max-100000)
			end
			setvar $send $send&"q q fz"&$figstodrop&"*z c d * l "&$planet~planet&"*  m  *** c  "
		end
		if ($fastkill = true)
			setvar $send $send&"q q a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
		end
		if ($iglift = 1)
			setvar $send $send&"q q * * "
		end
	end

	send $send

	if ($defender = 1)
		killalltriggers
		gosub :liftdefenders
	end

	if ($attackonsight)
		gosub :checkforvictims
	end
	gosub :getsectorlocation

	if ($player~current_sector <> $dropsector)
		setsectorparameter $dropsector "FIGSEC" false
		if ($dropftrs = true)
			gosub :retrievefigs
		end
	end
	if ($iglift = 1)
		if ($player~current_sector <> $dropsector)
			send "'Planet did not arrive, resetting*"
			gosub :resetiglift

		else
			send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
			waitfor "resetpdrop"
			gosub :waitforrestart
			gosub :resetiglift
		end
	end
	if ($defender = 1)
		if ($player~current_sector <> $dropsector)
			send "'Planet did not arrive, resetting*"
			gosub :resetdefender

		else
			send "'Defender Initiated! send reset command to re-enable PDROP*"
			gosub :waitforrestart
			gosub :setdefender
		end
	end
elseif ($dropdescription = "Adjacent")
	if ($density = 1)
		gosub :findadjacentdensity
	else
		gosub :findadjacent
	end
	gosub :attemptdrop
	if ($density = 1)
		if ($targetcount = 0)
			goto :starttargeting
		end
		gosub :densitydrop
	end
	if ($defender = 1)
		killalltriggers
		gosub :liftdefenders
	end

	gosub :getsectorlocation
	if ($attackonsight)
		gosub :checkforvictims
	end
	if ($player~current_sector <> $gotosector)
		send "'Planet did not arrive, resetting*"

	else
		if ($iglift = 1)
			send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
			waitfor "resetpdrop"
			gosub :waitforrestart
			gosub :resetiglift
		end
	end

	if ($defender = 1)
		send "'Defender Initiated! send reset command to re-enable PDROP*"
		gosub :waitforrestart
		gosub :setdefender
	end

	if ($dropftrs = true)
		gosub :retrievefigs

	end
elseif ($dropdescription = "Adjacent, then Direct")
	gosub :findadjacent
	gosub :attemptdrop
	send "p " $dropsector "* y "
	gosub :getsectorlocation
	if ($attackonsight)
		gosub :checkforvictims
	end
elseif ($dropdescription = "Surround")
	setvar $gotosector 0
	gosub :attemptsurrounddrop
	if ($gotosector > 0) and ($defender = 1)
		killalltriggers
		gosub :liftdefenders
	end
	gosub :getsectorlocation
	if ($attackonsight)
		gosub :checkforvictims
	end
	if ($iglift = 1) and ($gotosector > 0)
		send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
		waitfor "resetpdrop"
		gosub :waitforrestart
		gosub :resetiglift
	end

	if ($defender = 1) and ($gotosector > 0)
		send "'Defender Initiated! send reset command to re-enable PDROP*"
		gosub :waitforrestart
		gosub :setdefender
	end
	if ($dropftrs = true)
		gosub :retrievefigs
	end
elseif ($dropdescription = "Deadend Drop")
	gosub :finddeadend
	gosub :attemptdrop
	if ($density = 1)
		gosub :densitydrop
	end
	if ($defender = 1)
		killalltriggers
		gosub :liftdefenders
	end
	gosub :getsectorlocation
	if ($attackonsight)
		gosub :checkforvictims
	end
	if ($iglift = 1)
		send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
		waitfor "resetpdrop"
		gosub :waitforrestart
		gosub :resetiglift
	end
	if ($defender = 1)
		send "'Defender Initiated! send reset command to re-enable PDROP*"
		gosub :waitforrestart
		gosub :setdefender
	end
	if ($dropftrs = true)
		gosub :retrievefigs
	end
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
	if ($dropdelay > 0) and ($lock = false)
		killalltriggers
		setdelaytrigger delay :planetdrop $dropdelay
		pause
	end

	:planetdrop
	setvar $gotosector $targetsectors[$randomtarget]
	if ($lock = true)
		send "p "&$gotosector&"*"
		setvar $dropsector $gotosector
		goto :dolock
	else

		gosub :dopwarp
	end
end

return

:dopwarp
:planetdrop2
killalltriggers
setvar $send "p "&$gotosector&"*y"
if ($dropftrs = true)
	setvar $send $send & $movefigmacro
end
if ($iglift = 1)
	setvar $send $send&"q q * *"
elseif ($fastkill = true)
	setvar $send $send&"q q a y y "&$ship~ship_max_attack&"* * z n q z n a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
end
send $send
settextlinetrigger pwarpno :pwarpno "You do not have any fighters in Sector "
settextlinetrigger pwarpyes :pwarpyes " Planetary TransWarp Drive Engaged! "
settextlinetrigger pwarpalreadythere :pwarpfinished "You are already in that sector!"
pause

:pwarpno
killalltriggers
setvar $targetsectors[$randomtarget] 0
setsectorparameter $gotosector "FIGSEC" false
if ($iglift = 1)
	send "l" $planet~planet "* c "
	waitfor "<Enter Citadel>"
	gosub :player~quikstats
elseif ($dropftrs = true)
	# we can only try once and will retrieve figs once done
else
	setvar $i 1
	while ($i <= $targetcount)
		if ($targetsectors[$i] > 0)
			setvar $randomtarget $i
			setvar $gotosector $targetsectors[$randomtarget]
			goto :planetdrop2
		end
		add $i 1
	end
end
goto :pwarpfinished

:pwarpyes
killalltriggers

:pwarpfinished
gosub :getsectorlocation

return

:dolock
killalltriggers
settextlinetrigger dolockno :dolockno "You do not have any fighters in Sector "
settextlinetrigger dolockyes :dolockyes "Locating beam pinpointed, TransWarp Locked"
settextlinetrigger dolockyesalreadythere :dolockyesalreadythere "You are already in that sector!"
pause

:dolockno
killalltriggers
goto :starttargeting

:dolockyesalreadythere
goto :starttargeting
killalltriggers

:dolockyes
setvar $switchboard~message "We have a PLock on " & $dropsector & ", setting kill triggers!*"
gosub :switchboard~switchboard
killalltriggers
goto :setplocktriggers
killalltriggers
goto :starttargeting
halt
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
gosub :player~quikstats
send "q"
gosub :planet~getplanetinfo
setvar $planet~planetfighters $planet~planet_fighters

if ($dropftrs)

	if ($planet~planet_fighters < $dropfigquant)
		setvar $switchboard~message "There are only " & $planet~planet_fighters & " fighters on the planet.*"
		gosub :switchboard~switchboard
		halt
	end

	setvar $switchboard~message "Dropping " & $dropfigquant & " on landing; Cannons not changed.*"
	gosub :switchboard~switchboard

	setvar $movefigmacro ""
	setvar $moved 0

	while ($moved < $dropfigquant)

		setvar $tomove ($dropfigquant - $moved)

		if ($tomove >= $maxfigattack)
			setvar $thismove $maxfigattack
			setvar $moved ($moved + $thismove)
		else
			setvar $thismove $tomove
			setvar $moved $moved + $thismove
		end

		setvar $movefigmacro $movefigmacro & "q m n t* q fz " & $moved & "* * zc" & $dropftrstype & " * l" & $planet~planet & " *m* t * ccq"
	end

end
send "c "
return

:retrievefigs
gosub :player~quikstats
send " s*  "
setvar $figowner sector.figs.owner[$player~current_sector]
setvar $figquant sector.figs.quantity[$player~current_sector]

waitfor "<Scan Sector>"
waitfor "Citadel treasury contains"

if ($figquant <> 0) and (($figowner = "belong to your Corp") or ($figowner = "yours"))

	setvar $retfigmacro ""
	setvar $moved 0
	setvar $sectorquant $figquant
	if ($dropfigquant > $figquant)
		setvar $retquant $figquant
	else
		setvar $retquant $dropfigquant
	end
	while ($moved < $retquant)

		setvar $tomove ($retquant - $moved)

		if ($tomove >= $ship~ship_fighters_max)
			setvar $thismove $ship~ship_fighters_max
			setvar $moved ($moved + $thismove)
			setvar $sectorquant ($sectorquant - $thismove)
		else
			setvar $thismove $tomove
			setvar $moved $moved + $thismove
			setvar $sectorquant ($sectorquant - $thismove)

		end

		if ($sectorquant = 0)

			setvar $retfigmacro $retfigmacro & "q m n l* q fz 1* * zc" & $dropftrstype & " * l" & $planet~planet & " *m* t * ccq"

		else
			setvar $retfigmacro $retfigmacro & "q m n l* q fz " & $sectorquant & "* * zc" & $dropftrstype & " * l" & $planet~planet & " *m* t * ccq"
		end

	end

end

send $retfigmacro

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

:checkforvictims
gosub :player~quikstats
send " s*  "

:scanit_again
setvar $player~startinglocation $player~current_prompt
gosub :sector~getsectordata
if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))
	if ($capture)
		gosub :combat~fastcapture
	else
		gosub :combat~fastcitadelattack
	end
	goto :scanit_again
elseif (($sector~emptyshipcount > $sector~myshipcount))
	gosub :combat~fastcapture
	goto :scanit_again
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

:getsectorlocation
send "/"
waitfor "Sect "
getword currentline $temp 2
striptext $temp "Turns"
striptext $temp " "
replacetext $temp #179 ""
setvar $player~current_sector $temp
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
setstrigger getnamedone :getnamedone "Command [TL="
setstrigger getnamedone2 :getnamedone "Citadel command"
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
	if (($perfect =true) and (sector.warpcount[$dropsector] <> 2))
		echo "*Not a perfect firing solution"
		return
	end
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

:findadjacentdensity
# We actually want warps IN for density scan.

getsectorparameter $dropsector "FIGSEC" $isfigged

if (($perfect =true) and (sector.warpcount[$dropsector] <> 2))
	echo "*Not a perfect firing solution"
	return
end
setvar $i 1
setvar $checksector sector.warpsin[$dropsector][$i]
setarray $targetsectors 6
setvar $targetcount 0
while ($checksector > 0)
	getsectorparameter $checksector "FIGSEC" $isfigged
	if ($isfigged = true)
		add $targetcount 1
		setvar $targetsectors[$targetcount] $checksector
	end
	add $i 1
	setvar $checksector sector.warpsin[$dropsector][$i]
end
if ($targetcount <= 0)
	echo "No Targets..*"
	setvar $targetsectors[1] $current_location
end

return

:finddeadend
getsectorparameter $dropsector "FIGSEC" $isfigged
if (($triggerdescription = "Unfigged Mines") and ($isfigged = true))
	return
else

	getnearestwarps $nearest $dropsector
	setvar $i 1
	setvar $targetcount 1
	while ($i <= $nearest)
		setvar $focus $nearest[$i]
		getsectorparameter $focus "FIGSEC" $isfigged
		if ($twohops = true)
			getdistance $distance $dropsector $focus
			if ($distance <= 0)
				send "^f"&$dropsector&"*"&$focus&"*q"
				waiton "ENDINTERROG"
				getdistance $distance $dropsector $focus
			end
		end

		if (($isfigged = true) and (sector.warpcount[$focus] = 1)) and ((($twohops = true) and ($distance >= 2)) or ($twohops <> true))
			#found dead end with fighter!
			setvar $targetsectors[$targetcount] $focus
			return
		end
		add $i 1
	end
	echo "No Targets..*"
	setvar $targetsectors[1] $current_location
end
return

# ============================== DENSITY PHOTON =========================
:densitydrop_toslow
waitfor "Citadel command"

setvar $bot~command "foton"
setvar $bot~user_command_line " on d "
setvar $bot~parm1 "on"
setvar $bot~parm2 "d"
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\modes\offense\foton.cts"
seteventtrigger        densityended        :densityended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\offense\foton.cts"
pause

:densityended
killalltriggers
return

:densitydrop
waitfor "Citadel command"
send "q m * * * q  * * "
send "fz 3500* * zco * "
setvar $checks 0

:check_dens
setvar $mm 0
setvar $i 1
send "sz*"
waiton "Relative Density Scan"

:dtorp_start
killtrigger alldone
setvar $attack_sector_found false
settextlinetrigger getsec :getsec "Sector"
setstrigger alldone :alldone "Command [TL="
pause

:getsec
gettext currentline $temp "Sector" "==>"
striptext $temp "("
striptext $temp ")"
striptext $temp " "
setvar $adj[$i] $temp

gettext currentline $dens[$i] "==>" "Warps :"
striptext $dens[$i] ","
striptext $dens[$i] " "
add $i 1
settextlinetrigger getsec :getsec "Sector"
pause

:alldone
killtrigger getsec
if ($checks > 40)
	goto :manual_stop
end
gosub :firechk

:letslook
setvar $w 0

:sublooky
add $w 1
if ($w > $i)
	goto :alldone
elseif ($density[$w] <> $dens[$w])
	setvar $diff ($density[$w] - $dens[$w])
	if ($diff <> 0)
		if ($densityx = true)
			if ($diff > 1) and ($diff < 40)
				gosub :do_action
				goto :dtorp_end
			else
				goto :sublooky
			end
		else
			gosub :do_action
			goto :dtorp_end
		end
	else
		goto :sublooky
	end
else
	goto :sublooky
end

:firechk
setvar $y 1
send "sz*"
waiton "Relative Density Scan"
add $checks 1

:looky
killtrigger dtop_dtorp
killtrigger getsec
killtrigger alldone
killtrigger donelook
killtrigger manual_stop
settextlinetrigger dtop_dtorp :manual_stop $bot~bot_name & " foton off"
settextlinetrigger getsec :looksec "Sector"
setstrigger donelook :donelook "Command [TL="

pause

:looksec
gettext currentline $temp "Sector" "==>"
striptext $temp "("
striptext $temp ")"
striptext $temp " "

setvar $adjsec[$y] $temp
gettext currentline $density[$y] "==>" "Warps :"
striptext $density[$y] ","
striptext $density[$y] " "
add $y 1
settextlinetrigger getsec :looksec "Sector"
pause

:donelook
killtrigger getsec
return

:dtorp_end
killalltriggers
setvar $switchboard~message "Foton Missle Fired into sector => " & $adj[$w] & "*"
gosub :switchboard~switchboard
gosub :player~quikstats
if ($player~photons < 1)
	setvar $switchboard~message "No Photons on Board - Exiting!!*"
	gosub :switchboard~switchboard
	halt
end

return

:do_action
send " c  p  y  " $adj[$w] "**q   l " $planet~planet " * n n * j m * * * j c  *  "
return

:manual_stop
:densitywait
killalltriggers
send " l " $planet~planet " * n n * j m * * * j c  *  "
return

# ============================== DEFENDER ROUTINES ==============================
:waitforrestart
settextouttrigger restart :restart "-"
settexttrigger restart2 :restart2 "resetpdrop"
pause

:restart
:restart2
killtrigger restart
killtrigger restart2
return

:liftdefenders
# can't wait for this one, we just hope for the best!

send "'defender mac r ^M ^M ^M f 0^M *"

if ($defender_kill = 1)
	setdelaytrigger killwait :killwait 400
	pause

	:killwait
	send "'defender kill*"

end
settextlinetrigger wrongprompt :wrongprompt "Wrong prompt for auto kill"
setdelaytrigger promtpw :promtpw 500
pause

:wrongprompt
killtrigger wrongprompt
send "'defender kill*"
pause

:promtpw
return

:checkdefenders
setvar $defenders 0
send "'defender callout*"

setdelaytrigger defwait :defwait 3000

:defmore
settextlinetrigger deffound :deffound "Team: defender"
pause

:deffound
killtrigger deffound
add $defenders 1
goto :defmore

:defwait
killalltriggers

if ($defenders = 0)
	setvar $switchboard~message "We need at least one defender in this mode*"
	gosub :switchboard~switchboard
	halt
else
	send "'defender ig on*"
	waitfor "Auto IG reset"
	settextlinetrigger igone :igone "IG on!"
	settextlinetrigger igtwo :igtwo "IG was already on"
	pause

	:igone
	:igtwo
	killalltriggers

	send "s"
	setvar $secfigs 0
	waitfor "Sector  :"
	settextlinetrigger scanfigs :scanfigs "Fighters:"
	settextlinetrigger nofigs :nofigs "Warps to Sector(s) :"
	pause

	:scanfigs
	killalltriggers
	getword currentline $secfigs 2
	striptext $secfigs ","

	:nofigs
	add $secfigs 500
	send "'defender mac f" $secfigs "^Mcd*"
	waitfor "Macro Complete"

	setvar $switchboard~message "We have defenders.*"
	gosub :switchboard~switchboard

end

return

:resetdefender
setdelaytrigger quickpause :quickpause 500
pause

:quickpause
killtrigger quickpause
gosub :setdefender

return

:setdefender
gosub :disarmplanet
send "'defender mac l" & $planet~planet & "^M^M*"
setvar $defresp 0

setdelaytrigger defwaitland :defwaitland 3000

:deflandmore
settextlinetrigger deflanded :deflanded " - Macro Complete"
pause

:deflanded
killtrigger deflanded
add $defresp 1
goto :deflandmore

:defwaitland
killalltriggers
if ($defresp < $defenders)
	setvar $switchboard~message "We didn't get all defenders landing, aborting!*"
	gosub :switchboard~switchboard
	halt
end

gosub :armplanet
return

:disarmplanet
setvar $cannonatmos $planet~atmosphere_cannon
setvar $millevel $planet~militaryreaction
setvar $switchboard~message "Disarming planet from Atmos Cannon: "& $cannonatmos &" and MR:" & $millevel & "*"
gosub :switchboard~switchboard

send "la0*m0*qopc"
waitfor "hould this be a (C)orporate or (P)ersonal planet"

return

:armplanet
setvar $switchboard~message "Arming planet to Atmos Cannon: "& $cannonatmos &" and MR:" & $millevel & "*"
gosub :switchboard~switchboard

send "la" $cannonatmos "*m" $millevel "*qocc"
waitfor "<Enter Citadel>"

return

# ============================== END DEFENDER ROUTINES ==============================
# ================= LIFT PDROP ========== #
:resetiglift
send "l" $planet~planet "*c"
waitfor "<Enter Citadel>"
gosub :player~quikstats
return

:liftandcheckig
send "i"
settextlinetrigger igliftyes :igliftyes "Interdictor ON : Yes"
settextlinetrigger igliftno :igliftno "Interdictor ON : No"
settextlinetrigger igliftnoig :igliftnoig "Credits        :"
pause

:igliftnoig
setvar $switchboard~message "Ship does not have IG. Exiting.*"
gosub :switchboard~switchboard
halt

:igliftno
killalltriggers
send "q q q * b y l" $planet~planet "* c "
waitfor "Your Interdictor generator is now ON"
waitfor "<Enter Citadel>"

:igliftyes
killalltriggers

gosub :player~quikstats
return

# ================ END LIFT PDROP ======= #
:retrievefigs_old
gosub :player~quikstats

#send "'"&$SWITCHBOARD~bot_name&" movefig p*"
#setEventTrigger		movefigended		:movefigended "SCRIPT STOPPED" #"scripts\"&$bot~mombot_directory&"\Modes\Resource\movefig.cts"
#pause
#:movefigended

setvar $bot~command "movefig"
setvar $bot~user_command_line " movefig p "& $dropfigquant &" "
setvar $bot~parm1 "p"
setvar $bot~parm2 $dropfigquant
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
setvar $bot~parm7 ""
setvar $bot~parm8 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~parm7
savevar $bot~parm8
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
seteventtrigger        moveended        :moveended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
pause

:moveended
killalltriggers

return

##### PLOCK TEMP
:setplocktriggers
killalltriggers
settextlinetrigger	1	:manual			("Planet is now in sector "&$dropsector)
settexttrigger 		2	:plockfinished	("Planetary TransWarp Drive shutting down.")
settexttrigger 		3	:gofighterplock 		("Report Sector "&$dropsector&": ")
settexttrigger 		4	:golimpetplock 		("Limpet mine in "&$dropsector&" ")
settexttrigger 		5	:goarmidplock 		("Your mines in "&$dropsector&" ")
settexttrigger 		6	:goplock 		("Locator beam lost.")
if ($plocktimer > 0)
	setdelaytrigger 		7	:plocktimerexp 		$plocktimer
end
pause

:plocktimerexp
killalltriggers
send "n '{" $switchboard~bot_name "} - PLOCK Timed Out, Resetting*"
return

:goarmidplock
cuttext currentline&"    " $ck 1 4
setvar $spoof false
if ($ck <> "Your")
	settexttrigger 		5	:goarmidplock 		("Your mines in "&$dropsector&" ")
	pause
end
if ($game~hasaliens = true)
	#[K[32mYour mines in [1;33m8174[0;32m did [1;33m14[0;32m damage to #[1;36m[33mFerrengi[36m Nik
	setvar $alien false
	gettext $bot~ansi_last_armid_attack&"[xx][xx][xx]" $alien_check " damage to " "[xx][xx][xx]"
	getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
		settexttrigger 		5	:goarmidplock 		("Your mines in "&$dropsector&" ")
		pause
	end
end
goto :goplock

:golimpetplock
cuttext currentline&"      " $ck 1 6
setvar $spoof false
if ($ck <> "Limpet")
	settexttrigger 		4	:golimpetplock 		("Limpet mine in "&$dropsector&" ")
	pause
end
goto :goplock

:gofighterplock
getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
setvar $spoof false
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	settexttrigger 		3	:gofighterplock 		("Report Sector "&$dropsector&": ")
	pause
end
if ($game~hasaliens = true)
	setvar $alien false
	gettext currentansiline $alien_check ": " "'s"
	getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
		settexttrigger 		3	:gofighterplock 		("Report Sector "&$dropsector&": ")
		pause
	end
end

:goplock
:manual
killalltriggers
if ($dropdelay > 0)
	setdelaytrigger plockdelay :continueplock $dropdelay
	pause
end

:continueplock
send "y '{" $switchboard~bot_name "} - PLOCK Launched*"
if ($dropftrs = true)
	setvar $send $send & $movefigmacro
end
if ($fastkill = true)
	setvar $send "q q a y y "&$ship~ship_max_attack&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~ship_max_attack&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "
	send $send
end

if ($defender = 1)
	killalltriggers
	gosub :liftdefenders
end
gosub :getsectorlocation
if ($attackonsight)
	gosub :checkforvictims
end
if ($iglift = 1)
	send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
	waitfor "resetpdrop"
	gosub :waitforrestart
end
if ($defender = 1)
	send "'Defender Initiated! send reset command to re-enable PDROP*"
	gosub :waitforrestart
	gosub :setdefender
end
if ($dropftrs = true)
	gosub :retrievefigs
end
send "  s*   "
return

:plockfinished
send "  s*   "
setvar $switchboard~message "PLOCK Sector Cleared*"
gosub :switchboard~switchboard
return

#####
#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
