gosub :loadvars~loadvars
gosub :help~initialize

loadvar $map~stardock
loadvar $map~home_sector
loadvar $ship~cap_file
loadvar $planet~planet_file
loadvar $game~port_max

gosub :combat~init
#for auto kill on surround
setvar $grid~kill true

setvar $help~help[1]  $help~tab&"alienhunt {corp} {sell} {refuel} {upgrade} {cannon} {return}"
setvar $help~help[2]  $help~tab&"          {passive} {buyfig} {buyshield} {patp} {home} "
setvar $help~help[3]  $help~tab&"          {"&#34&"ship_filter"&#34&"} {"&#34&"alien_filter"&#34&"} "
setvar $help~help[4]  $help~tab&"           "
setvar $help~help[5]  $help~tab&"Hunts down aliens and captures their ships.  "
setvar $help~help[6]  $help~tab&"Will automatically turn ships and planet personal."
setvar $help~help[7]  $help~tab&"Will use shields on planet as well."
setvar $help~help[8]  $help~tab&"Best to use with a defender ship."
setvar $help~help[9]  $help~tab&"         "
setvar $help~help[10] $help~tab&"Options: "
setvar $help~help[11] $help~tab&"          {off} - Turns off script and sets planet and ship corporate."
setvar $help~help[12] $help~tab&"         {corp} - Doesn't turn everything personal."
setvar $help~help[13] $help~tab&"         {sell} - Sell everyship you capture at dock and deposit the cash."
setvar $help~help[14] $help~tab&"       {refuel} - Refuel planet if possible."
setvar $help~help[15] $help~tab&"      {upgrade} - Upgrade fuel port if possible."
setvar $help~help[16] $help~tab&"       {cannon} - Will reset cannon levels after hunting alien."
setvar $help~help[17] $help~tab&"       {return} - Return to starting sector after each hunt."
setvar $help~help[18] $help~tab&"      {passive} - Surround passively when hunting."
setvar $help~help[19] $help~tab&"       {buyfig} - Auto buy figs when low.  Withdraws from citadel."
setvar $help~help[20] $help~tab&"    {buyshield} - Auto buy shields when low.  Withdraws from citadel."
setvar $help~help[21] $help~tab&"         {patp} - When planet is less than 10% of fuel, run patp."
setvar $help~help[22] $help~tab&"         {home} - Move ships to starting sector instead of stardock."
setvar $help~help[23] $help~tab&"{"&#34&"ship_filter"&#34&"} - move ships matching this home, stardock for the others"
setvar $help~help[24] $help~tab&"{"&#34&"alien_filter"&#34&"} - ignore aliens matching this text"
gosub :help~helpfile

:restart
setvar $switchboard~message "Alien Hunter starting up!*"
gosub :switchboard~switchboard

setvar $player~save true

setvar $start_fig_hit "Deployed Fighters Report Sector "
setvar $end_fig_hit   ":"
setvar $alien_ansi    #27 & "[1;36m" & #27 & "["
setvar $start_fig_hit_owner ":"
setvar $end_fig_hit_owner "'s"

window alienhunt_script 560 170 ("Alienhunt - " & gamename) ontop

getsectorparameter sectors "FIGSEC" $isfigged
if (($map~stardock = 0) or ($map~stardock = ""))
	setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
	gosub :switchboard~switchboard
	halt
end
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must run alien hunter commands from citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm1 = "off")
	send "qoccco*cq"
	waiton "<Computer deactivated>"
	setvar $switchboard~message "Alien hunter shutting down.  Making ship and planet corporate again.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~photons > 0)
	setvar $switchboard~message "Please pick a ship with no photons.*"
	gosub :switchboard~switchboard
	halt
end
getwordpos $bot~user_command_line $pos "corp"
if ($pos > 0)
	setvar $corp true
else
	setvar $corp false
end

getwordpos $bot~user_command_line $pos "patp"
if ($pos > 0)
	setvar $patp true
else
	setvar $patp false
end

getwordpos $bot~user_command_line $pos "buyfig"
if ($pos > 0)
	setvar $buyfig true
else
	setvar $buyfig false
end

getwordpos $bot~user_command_line $pos "buyshield"
if ($pos > 0)
	setvar $buyshield true
else
	setvar $buyshield false
end

getwordpos $bot~user_command_line $pos "fuel"
if ($pos > 0)
	setvar $refuel true
else
	setvar $refuel false
end

getwordpos $bot~user_command_line $pos "upgrade"
if ($pos > 0)
	setvar $upgrade true
else
	setvar $upgrade false
end

getwordpos $bot~user_command_line $pos "sell"
if ($pos > 0)
	setvar $sell true
else
	setvar $sell false
end

getwordpos $bot~user_command_line $pos "cannon"
if ($pos > 0)
	setvar $cannon true
else
	setvar $cannon false
end

getwordpos $bot~user_command_line $pos "passive"
if ($pos > 0)
	setvar $passive true
else
	setvar $passive false
end

getwordpos $bot~user_command_line $pos "return"
if ($pos > 0)
	setvar $return true
else
	setvar $return false
end

getwordpos $bot~user_command_line $pos "home"
if ($pos > 0)
	setvar $home true
else
	setvar $home false
end
setvar $filterships ""
getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext $bot~user_command_line $filterships #34 #34
	replacetext $bot~user_command_line #34&$filterships&#34 " "
	if ($filterships = false)
		setvar $switchboard~message "Invalid ship filter entered.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Moving all ships matching: ["&$filterships&"], and bringing them home.*"
		gosub :switchboard~switchboard
	end
end

setvar $filteraliens ""
getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext $bot~user_command_line $filteraliens #34 #34
	replacetext $bot~user_command_line #34&$filteraliens&#34 " "
	if ($filteraliens = false)
		setvar $switchboard~message "Invalid alien filter entered.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Ignoring aliens matching: ["&$filteraliens&"].*"
		gosub :switchboard~switchboard
	end
end

gosub :player~getinfo
setvar $homesector $player~current_sector

killalltriggers
send "q"
gosub :planet~getplanetinfo
gosub :setwindow
setvar $starting_sector_cannon $planet~sector_cannon
setvar $starting_atmos_cannon $planet~atmosphere_cannon
setvar $sector_total ((($planet~planet_fuel * $starting_sector_cannon) / 100)/3)

settexttrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
settexttrigger skip_ig :skipig "is not equipped with an Interdictor Generator"
send "q q q q* b"
waiton "Do you wish to change it? (Y/N)"
send "*"
goto :skipig

:ig_was_off
send "y"
setvar $switchboard~message "Turning on ship IG.*"
gosub :switchboard~switchboard

:skipig
killalltriggers
send "l"&$planet~planet&"*"
waiton "Planet command"
if ($corp <> true)
	send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
else
	send "**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*"
end

if ($cannon = false)
	send "*ls0*la0*"
	setvar $switchboard~message "Turning off quasar cannons.*"
	gosub :switchboard~switchboard
end
gosub :player~quikstats
if ($player~current_prompt = "Citadel")
	if ($corp <> true)
		setvar $switchboard~message "Made ship and planet personal for convenience. Turning off military reaction.*"
	else
		setvar $switchboard~message "Keeping planet and ship corporate for safety. Might be annoying. Turning off military reaction.*"
	end
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Something went wrong during startup. Ship and planet should be personal now, so be careful.*"
	gosub :switchboard~switchboard
end

#setTextTrigger need_ig :planet_ig_was_off "Your Interdictor Generator is now ACTIVE"
#setTextTrigger skip_ig :skipplanetig "This Citadel does not have an Interdictor Generator."
#send "n"
#waitOn "Do you want to change this setting? (Y/N)"
goto :skipplanetig

:planet_ig_was_off
send "y"
setvar $switchboard~message "Turning off planet IG.*"
gosub :switchboard~switchboard

:skipplanetig
killalltriggers

if ($sell = true)
	setvar $switchboard~message "Selling every ship after capture.  Will deposit money in the citadel.*"
	gosub :switchboard~switchboard
end

gosub :player~quikstats

loadvar $player~surroundfigs
if ($player~surroundfigs <= 0)
	setvar $player~surroundfigs 1
end
if ($passive = true)
	setvar $player~surroundpassive true
end
setvar $player~onlyaliens true
setvar $player~cappingaliens true
setvar $player~defendercapping true
setvar $player~surroundavoidshieldedonly true

loadvar $ship~cap_file
fileexists $cap_file_chk $ship~cap_file
if ($cap_file_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getshipcapstats
	gosub :ship~loadshipinfo
end

if ($ship~ship_offensive_odds <= 0)
	gosub :ship~getshipstats
end

while (true)
	#gosub :PLAYER~quikstats
	if (($player~unlimitedgame = false) and (($player~turns-$player~turnstoempty) <= $bot~bot_turn_limit))
		setvar $switchboard~message "Turns too low to continue.*"
		gosub :switchboard~switchboard
		gosub :gohome
	end
	if (currentfighters < $ship~ship_fighters_max)
		if ($buyfig = true)
			gosub :alienhunt_with_run
			gosub :alienhunt_buyfig_run
			gosub :alienhunt_dep_run
		end
		if (currentfighters < $ship~ship_fighters_max)
			setvar $switchboard~message "Not enough fighters to continue the hunt.*"
			gosub :switchboard~switchboard
			gosub :gohome
		end
	end
	if ($return = true)
		send "p"&$homesector&"*y"
	end
	if ($cannon = true)
		setvar $percenttoset (((3*$sector_total)*100)/$planet~planet_fuel)
		if (((($planet~planet_fuel * $percenttoset) / 100)/3) < $cannondamage)
			add $percenttoset 1
		end
		if ($percenttoset > 100)
			setvar $percenttoset 100
		end

		send " *ls"&$percenttoset&"* la"&$starting_atmos_cannon&"*"

	end
	setvar $lasttarget ""
	setvar $thistarget ""

	gosub :attackandmoveship

	#loadvar $bot~last_alien_hit_sector
	#if (($lastSectorAttacked > 0) and ($bot~last_alien_hit_sector > 0) and ($bot~last_alien_hit_sector <> $lastSectorAttacked))
	#	setvar $dropSector $bot~last_alien_hit_sector
	#	gosub :go_to_drop_sector
	#end
	setvar $switchboard~message "* Waiting for something to hunt..*"
	gosub :echo

	:restart
	gosub :validatefighterhit
	gosub :attackandmoveship
	if ($targetsfound = true)
		gosub :dosurround
		gosub :attackandmoveship
	end
end
halt

:validatefighterhit
send "q "
gosub :planet~getplanetinfo
gosub :setwindow
gosub :ensurecitadelforpwarp
if ($planet~planet_fighters < ($planet~planet_fighters_max/10))
	if ($buyfig = true)
		gosub :alienhunt_with_run
		gosub :alienhunt_buyfig_run
		gosub :alienhunt_dep_run
	else
		setvar $switchboard~message "Alien hunter shutting down.  Making ship and planet corporate again.  Check to make sure I made it home.*"
		gosub :switchboard~switchboard
		gosub :gohome
	end
end
loadvar $planet~planet_shields
if (($planet~planet_shields <= 300) and ($buyshield = true))
	gosub :alienhunt_with_run
	gosub :alienhunt_buyshield_run
	gosub :alienhunt_dep_run
end
settextlinetrigger fig :checkfighter "Deployed Fighters Report Sector"
settexttrigger armid :attacksectormine "Your mines in "
settextlinetrigger liftsoff :pwarpconfirmed " lifts off from "
settextlinetrigger 	warps 	:pwarpconfirmed 	"warps into the sector."
settextlinetrigger 	power 	:pwarpconfirmed 	"is powering up weapons systems!"
settextlinetrigger  wave    :pwarpconfirmed    " launches a wave of fighters at the "

gosub :disconnecttriggers
pause

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:disconnecttriggers
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
settexttrigger pause :pausing "Planet command (?="
settexttrigger pause2 :pausing "Computer command ["
settexttrigger pause3 :pausing "Corporate command ["
return

:pausing
killalltriggers
echo ansi_14 "*[["&ansi_15&$bot~script_title&" paused. To restart, re-enter citadel prompt"&ansi_14&"]]*"&ansi_7
settexttrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_14 "*[[" ansi_15 "Alien Hunter restarted" ansi_14 "]]*" ansi_7
goto :restart

:attacksectormine
gosub :validateminehit
if ($isvalid = true)
	goto :go_to_drop_sector
else
	settexttrigger armid :attacksectormine "Your mines in "
	pause
end
pause

:checkfighter
cuttext currentline&" " $radio 1 1
gettext currentline $dropsector $start_fig_hit $end_fig_hit
isnumber $isdropsectornumeric $dropsector
if ($isdropsectornumeric <> true)
	settextlinetrigger fig :checkfighter "Deployed Fighters Report Sector"
	pause
end
gettext currentansiline $alien_check $start_fig_hit_owner $end_fig_hit_owner
getwordpos $alien_check $apos $alien_ansi
setvar $fighter_line currentline
lowercase $fighter_line
lowercase $filteraliens
setvar $alien_type_match 0
if ($filteraliens <> "")
	getwordpos $fighter_line $alien_type_match $filteraliens
end
if ((($apos <= 0) or ($radio <> "D")) or (($filteraliens <> "") and ($alien_type_match > 0)))
	settextlinetrigger fig :checkfighter "Deployed Fighters Report Sector"
	pause
end

:go_to_drop_sector
killalltriggers
isnumber $isdropsectornumeric $dropsector
if ($isdropsectornumeric <> true)
	return
end
if ($dropsector <> $player~current_sector)
	if ($cannon = true)
		send "*ls0* la0*  "
	end
	send "p " $dropsector "*y"
	settextlinetrigger pwarpnotok :pwarptryadjacent "You do not have any fighters in Sector "
	settextlinetrigger pwarpok :pwarpconfirmed " Planetary TransWarp Drive Engaged! "
	settextlinetrigger pwarpok2 :pwarpconfirmed "You are already in that sector!"
	pause

	:pwarpdone
	killalltriggers
end

:pwarptryadjacent
killalltriggers
setsectorparameter $dropsector "FIGSEC" false
gosub :findadjacent
gosub :attemptdrop
gosub :dosurround
setvar $planet~warpto $dropsector
gosub :ensurecitadelforpwarp
gosub :planet~pwarp
setvar $index 1
setvar $checksector sector.warps[$dropsector][$index]
while ($checksector > 0)
	setvar $planet~warpto $checksector
	gosub :ensurecitadelforpwarp
	gosub :planet~pwarp
	gosub :attackandmoveship
	add $index 1
	setvar $checksector sector.warps[$dropsector][$index]
end
return

:pwarpconfirmed
killalltriggers
gosub :player~quikstats
gosub :attackandmoveship
if ($targetsfound = true)
	gosub :dosurround
	gosub :attackandmoveship
end
isnumber $isdropsectornumeric $dropsector
if (($isdropsectornumeric <> true) or ($dropsector <= 0))
	setvar $dropsector $player~current_sector
end
setvar $index 1
setvar $checksector sector.warps[$dropsector][$index]
while ($checksector > 0)
	setvar $planet~warpto $checksector
	gosub :ensurecitadelforpwarp
	gosub :planet~pwarp
	gosub :attackandmoveship
	add $index 1
	setvar $checksector sector.warps[$dropsector][$index]
end

return

:findadjacent
getsectorparameter $dropsector "FIGSEC" $isfigged
setvar $i 1
setvar $checksector sector.warps[$dropsector][$i]
setarray $targetsectors 6
setvar $targetcount 0
while ($checksector > 0)
	#		getSectorParameter $checkSector "FIGSEC" $isFigged
	#		if ($isFigged = TRUE)
	add $targetcount 1
	setvar $targetsectors[$targetcount] $checksector
	#		end
	add $i 1
	setvar $checksector sector.warps[$dropsector][$i]
end
if ($targetcount <= 0)
	setvar $switchboard~message " No Targets..*"
	gosub :echo
	setvar $targetsectors[1] $dropsector
end

return

:attemptdrop
if ($targetcount > 0)
	getrnd $randomtarget 1 $targetcount
	setvar $gotosector $targetsectors[$randomtarget]
	setvar $planet~warpto $gotosector
	gosub :ensurecitadelforpwarp
	gosub :planet~pwarp
end

return

:ensurecitadelforpwarp
gosub :player~quikstats
if ($player~current_prompt = "Computer")
	send "q"
	gosub :player~quikstats
end
if ($player~current_prompt = "Command")
	gosub :planet~landingsub
	gosub :player~quikstats
end
if ($player~current_prompt = "Planet")
	send "c "
	settexttrigger alienhunt_citadel_ready :alienhunt_citadel_ready "Citadel command (?=help)"
	settexttrigger alienhunt_citadel_misroute :alienhunt_citadel_misroute "Computer command [TL="
	pause

	:alienhunt_citadel_ready
	killalltriggers
	gosub :player~quikstats
	return

	:alienhunt_citadel_misroute
	killalltriggers
	send "q"
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		gosub :planet~landingsub
		gosub :player~quikstats
	end
	if ($player~current_prompt = "Planet")
		send "c "
		waiton "Citadel command (?=help)"
		gosub :player~quikstats
	end
end
setvar $planet~pwarp_scan false
return

:dosurround
if ($player~surroundpassive = true)
	setvar $bot~command "dscan"
	setvar $bot~user_command_line " dscan silent"
	setvar $bot~parm1 "silent"
	setvar $bot~parm2 ""
	setvar $bot~parm3 ""
	setvar $bot~parm4 ""
	setvar $bot~parm5 ""
	setvar $bot~parm6 ""
	savevar $bot~parm1
	savevar $bot~parm2
	savevar $bot~parm3
	savevar $bot~parm4
	savevar $bot~parm5
	savevar $bot~parm6
	savevar $bot~command
	savevar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\dscan.cts"
	seteventtrigger dscandone :alienhunt_dscandone "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\dscan.cts"
	pause

	:alienhunt_dscandone
end
send "q "
gosub :planet~getplanetinfo
gosub :setwindow
send "q "
gosub :grid~surround
setvar $switchboard~message "Surrounded sector "&$player~current_sector&".*"
gosub :switchboard~switchboard
send "l "&$planet~planet&"* m*** c "
setvar $switchboard~message "* " & ansi_14 & $player~surroundoutput & "*" & ansi_7
gosub :echo

return

:attackandmoveship
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($player~current_prompt = "Command")
	gosub :planet~landingsub
	gosub :player~currentprompt
end
setvar $sector~federalcount 0
setvar $sector~faketradercount 1
setvar $targetsfound false
while ($sector~faketradercount > $sector~federalcount)
	gosub :player~quikstats
	setvar $player~startinglocation $player~current_prompt
	if ($player~current_prompt = "Command")
		gosub :planet~landingsub
		gosub :player~currentprompt
		setvar $player~startinglocation $player~current_prompt
	end
	gosub :sector~getsectordata
	if ($sector~realtradercount > $sector~corpiecount)
		setvar $targetsfound true
		gosub :combat~fastcitadelattack
		send "'Just attacked (and hopefully killed) a trader in my sector! Sector "&$player~current_sector&".*"
	end
	if ($sector~faketradercount > $sector~federalcount)
		setvar $targetsfound true
		setvar $lastsectorattacked $player~current_sector
		gosub :combat~fastcapture
	end
end
gosub :player~quikstats
if ($player~current_prompt = "Command")
	gosub :planet~landingsub
end
if ($targetsfound = true)
	send "q m*** c "
	gosub :player~quikstats
	setvar $startingsector $player~current_sector
	setvar $player~shields_needed ($ship~ship_shield_max - $player~shields)
	setvar $planet~planet_shields_to_take ($player~shields_needed/10)

	if (($planet~planet_shields_to_take > 0) and ($planet~planet_shields > 360))
		send "gf"&$planet~planet_shields_to_take&"*"
	end
else
	setvar $startingsector currentsector
end

if ($targetsfound = true)

	send "s*  "
	waiton "Warps to Sector(s) : "
	setvar $figowner sector.figs.owner[currentsector]
	setvar $figcount sector.figs.quantity[currentsector]

	if ($figcount <= 0)
		if ((currentsector > 10) and (currentsector <> stardock))
			setvar $bot~startinglocation $player~current_prompt
			setvar $fighters~amount 1
			gosub :fighters~deploy
			gosub :player~quikstats
			if ($player~current_prompt = "Planet")
				gosub :ensurecitadelforpwarp
			end
		end
	elseif (($figowner <> "belong to your Corp") and ($figowner <> "yours"))
		gosub :xenter~run
	end
	setvar $emptyships sector.shipcount[currentsector]
	if ($emptyships > 0)
		loadvar $map~stardock
		if ($filterships <> "")
			setvar $bot~user_command_line " moveship h silent "&#34&$filterships&#34
			setvar $bot~parm1 $map~home_sector
			gosub :runmoveshipscript
			send "s*  "
			gosub :player~quikstats
			setvar $emptyships sector.shipcount[currentsector]
		end
		if ($emptyships > 0)
			if ($sell)
				if ($home = true)
					setvar $bot~user_command_line " moveship "&$homesector&" silent"
					setvar $bot~parm1 $homesector
				else
					setvar $bot~user_command_line " moveship "&$map~stardock&" sell dep silent"
					setvar $bot~parm1 $map~stardock
				end
			else
				setvar $bot~user_command_line " moveship "&$map~stardock&" silent"
				setvar $bot~parm1 $map~stardock
			end
			gosub :runmoveshipscript
			if ($startingsector <> currentsector)
				setvar $alienhuntmowdestination $startingsector
				setvar $alienhuntmowdeploy "1"
				gosub :runmowscript
				gosub :planet~landingsub
			end
		end
		gosub :player~quikstats
		if ($player~current_prompt = "Command")
			gosub :planet~landingsub
		end
	end

	killalltriggers
	setvar $is_fuel_buyer port.buyfuel[currentsector]
	setvar $is_port port.exists[currentsector]
	setvar $class port.class[currentsector]
	setvar $under_construction (port.buildtime[currentsector] > 0)
	getsectorparameter currentsector "BUSTED" $isbusted
	getsectorparameter currentsector "UPGRADEF" $isupgradedfuel
	loadvar $planet~planet_fuel_max
	loadvar $planet~planet_fuel
	if (($refuel = true) and ($is_fuel_buyer <> true) and ($is_port = true) and ($class > 0) and ($isbusted <> true) and ($under_construction <> true) and ($planet~planet_fuel < ($planet~planet_fuel_max-$game~port_max)))
		if (($upgrade = true) and ($isupgradedfuel <> true))
			gosub :runportupgradescript
			gosub :setwindow
		else
			gosub :player~quikstats
			if ($player~current_prompt = "Citadel")
				send "q q "
				gosub :player~quikstats
			elseif ($player~current_prompt = "Planet")
				send "q "
				gosub :player~quikstats
			end
		end
	end
	setvar $fuel port.fuel[currentsector]
	if ((($upgrade = true) and ($fuel > 10000)) or (($upgrade <> true) and ($fuel > 1000)))
		gosub :alienhunt_buyfuel_run
	end
end
if (($patp = true) and ($planet~planet_fuel < ($planet~planet_fuel_max/10)))
	setvar $patp_minimum 1000
	setvar $patp_upgrade true
	setvar $patp_docim ""
	if ($patp_minimum = 0)
		setvar $patp_minimum 10000
	end
	if ($patp_upgrade = true)
		setvar $patp_upgrade "upgrade"
	end
	if ($patp_docim = true)
		setvar $patp_docim "docim"
	end
	setvar $bot~command "patp"
	setvar $bot~user_command_line " patp "&$patp_minimum&" "&$patp_upgrade&" "&$patp_docim&" silent"
	setvar $bot~parm1 $patp_minimum
	savevar $bot~parm1
	setvar $bot~parm2 $patp_upgrade
	savevar $bot~parm2
	setvar $bot~parm3 $patp_docim
	savevar $bot~parm3
	savevar $bot~command
	savevar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\patp.cts"
	seteventtrigger patpended :alienhunt_patpended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\patp.cts"
	pause

	:alienhunt_patpended
end
killalltriggers
return

:validateminehit
setvar $isvalid false
cuttext currentline&"    " $ck 1 1
if ($ck <> "Y")
	return
end
gettext currentline $dropsector "Your mines in " " did"
isnumber $isdropsectornumeric $dropsector
if ($isdropsectornumeric <> true)
	return
end
gettext currentansiline&"[][][]" $alien_check "Your mines in" "[][][]"
getwordpos currentline $pos " damage to "
getwordpos $alien_check $apos $alien_ansi
if (($apos > 0) or ($pos = 0))
	return
end
setvar $isvalid true
return

:setwindow
setvar $msg "*   Current Sector: " & currentsector &"                            "
cuttext $msg $msg 1 30
if ($player~unlimitedgame = true)
	setvar $msg $msg & "   Turns: Unlimited"
else
	setvar $msg $msg & "   Turns: " & currentturns
end
setarray $window_lines 7
setvar $window_lines[1] "* Alienhunt Planet: " & $planet~planet
setvar $window_lines[2] "* ---------------------------------------------------------------"
loadvar $planet~planet_fuel
format $planet~planet_fuel $formatted_value number
setvar $window_lines[3] "*      Planet Fuel: " & $formatted_value&"                          "
cuttext $window_lines[3] $window_lines[3] 1 30
loadvar $planet~planet_fighters
format $planet~planet_fighters $formatted_value number
setvar $window_lines[4] "   Planet Fighters: " & $formatted_value
loadvar $planet~planet_shields
format $planet~planet_shields $formatted_value number
setvar $window_lines[5] "*   Planet Shields: " & $formatted_value&"                          "
cuttext $window_lines[5] $window_lines[5] 1 30
loadvar $planet~citadel_credits
format $planet~citadel_credits $formatted_value number
setvar $window_lines[6] "   Citadel Credits: " & $formatted_value
format $player~fighters $formatted_value number
setvar $window_lines[7] "*    Ship Fighters: " & $formatted_value&"*"

setvar $i 1
while ($i <= 7)
	setvar $msg $msg&$window_lines[$i]
	add $i 1
end
setwindowcontents alienhunt_script $msg
setvar $window_content $msg
replacetext $window_content "*" "[][]"
savevar $window_content
return

:runmoveshipscript
setvar $bot~command "moveship"
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\modes\resource\moveship.cts"
seteventtrigger moveshipended :alienhunt_moveship_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\moveship.cts"
pause

:alienhunt_moveship_ended
return

:runportupgradescript
setvar $port_upgrade_type "f"
setvar $bot~command "port"
setvar $bot~user_command_line " port upgrade "&$port_upgrade_type&" NOEXP silent "
setvar $bot~parm1 "upgrade"
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\grid\port.cts"
seteventtrigger portended :alienhunt_port_upgrade_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\grid\port.cts"
pause

:alienhunt_port_upgrade_ended
return

:runmowscript
setvar $bot~command "mow"
setvar $bot~user_command_line " mow "&$alienhuntmowdestination&" "&$alienhuntmowdeploy
setvar $bot~parm1 $alienhuntmowdestination
setvar $bot~parm2 $alienhuntmowdeploy
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
seteventtrigger alienhunt_mowended :alienhunt_mowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
pause

:alienhunt_mowended
return

:gohome
gosub :player~quikstats
if (currentsector <> $homesector)
	setvar $planet~warpto $homesector
	gosub :ensurecitadelforpwarp
	gosub :planet~pwarp
end
gosub :player~quikstats
if ($player~current_prompt = "Command")
	gosub :planet~landingsub
	gosub :player~quikstats
end
if ($player~current_prompt = "Planet")
	gosub :ensurecitadelforpwarp
end
if ($cannon = true)
	send " *ls"&$percenttoset&"* la"&$starting_atmos_cannon&"*"
end
send "qoccco*cq"
waiton "<Computer deactivated>"

halt
return

:alienhunt_dep_run
:alienhunt_dep
if ($dep_amount = 0)
	setvar $dep_amount ""
end
setvar $bot~command "dep"
setvar $bot~user_command_line " dep silent"
setvar $bot~parm1 $dep_amount
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
seteventtrigger depended :alienhunt_dep_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
pause

:alienhunt_dep_ended
return

:alienhunt_with_run
:alienhunt_with
if ($with_amount = 0)
	setvar $with_amount ""
end
setvar $bot~command "with"
setvar $bot~user_command_line " with silent"
setvar $bot~parm1 $with_amount
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\general\with.cts"
seteventtrigger withended :alienhunt_with_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\with.cts"
pause

:alienhunt_with_ended
return

:alienhunt_buyfig_run
:alienhunt_buyfig
setvar $bot~command "buy"
setvar $bot~user_command_line " buy fig silent"
setvar $bot~parm1 "fig"
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
seteventtrigger buyfigended :alienhunt_buyfig_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
pause

:alienhunt_buyfig_ended
return

:alienhunt_buyfuel_run
:alienhunt_buyfuel
setvar $bot~command "buy"
setvar $bot~user_command_line " buy f s silent override"
setvar $bot~parm1 "f"
setvar $bot~parm2 "s"
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
seteventtrigger buyfuelended :alienhunt_buyfuel_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
pause

:alienhunt_buyfuel_ended
return

:alienhunt_buyshield_run
:alienhunt_buyshield
setvar $bot~command "buy"
setvar $bot~user_command_line " buy sh silent"
setvar $bot~parm1 "sh"
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
seteventtrigger buyshieldended :alienhunt_buyshield_ended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
pause

:alienhunt_buyshield_ended
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:echo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $bot~botisdeaf
getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
	setvar $bot~silent_running true
	setvar $silent_running true
	savevar $silent_running
	savevar $bot~silent_running
	gosub :switchboard~switchboard
else
	echo $switchboard~message
end

#INCLUDES:
include "source\include\fighters"
include "source\include\xenter"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard"
