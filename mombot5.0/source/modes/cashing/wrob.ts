logging "OFF"
loadvar $bot_name
loadvar $unlimitedgame
loadvar $ptradesetting
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $atomic_cost
loadvar $beacon_cost
loadvar $corbo_cost
loadvar $cloak_cost
loadvar $probe_cost
loadvar $planet_scanner_cost
loadvar $limpet_cost
loadvar $armid_cost
loadvar $photon_cost
loadvar $holo_cost
loadvar $density_cost
loadvar $disruptor_cost
loadvar $genesis_cost
loadvar $twarpi_cost
loadvar $twarpii_cost
loadvar $psychic_cost
loadvar $photons_enabled
loadvar $photon_duration
loadvar $max_commands
loadvar $goldenabled
loadvar $mbbs
loadvar $multiple_photons
loadvar $colonist_regen
loadvar $ptradesetting
loadvar $steal_factor
loadvar $rob_factor
loadvar $clear_bust_days
loadvar $game~steal_factor
loadvar $game~rob_factor
loadvar $game~clear_bust_days
loadvar $port_max
loadvar $game~port_max
loadvar $production_rate
loadvar $production_regen
loadvar $debris_loss
loadvar $radiation_lifetime
loadvar $limpet_removal_cost
loadvar $max_planets_per_sector
loadvar $bot~folder
if (($port_max = 0) and ($game~port_max > 0))
	setvar $port_max $game~port_max
	savevar $port_max
end
if (($steal_factor = 0) and ($game~steal_factor > 0))
	setvar $steal_factor $game~steal_factor
	savevar $steal_factor
end
if (($rob_factor = 0) and ($game~rob_factor > 0))
	setvar $rob_factor $game~rob_factor
	savevar $rob_factor
end
if (($clear_bust_days = 0) and ($game~clear_bust_days > 0))
	setvar $clear_bust_days $game~clear_bust_days
	savevar $clear_bust_days
end
setvar $no_credits_file $bot~folder&"/MOM_"&gamename&"_No_Credits.txt"

loadvar $password
loadvar $newprompt
loadvar $surroundavoidshieldedonly
loadvar $surroundautocapture
loadvar $surroundavoidallplanets
loadvar $surrounddontavoid
loadvar $stardock
loadvar $backdoor
loadvar $rylos
loadvar $alpha_centauri
loadvar $home_sector
loadvar $surroundfigs
loadvar $surroundlimp
loadvar $surroundmine
loadvar $surroundoverwrite
loadvar $surroundpassive
loadvar $surroundnormal
loadvar $username
loadvar $letter
loadvar $defendercapping
loadvar $bot_turn_limit
loadvar $safe_ship
loadvar $bot_team_name
loadvar $subspace
loadvar $command
goto :wrob_start
include "source\include\planethaggle"
include "source\include\sector"

:wrob_start
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Travels universe robbing ports."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage: wrob [minimum rob amount] {upgraded} {skipcim} {clear_empty}"
setvar $help~help[4] $help~tab&"       "
setvar $help~help[5] $help~tab&"Options:"
setvar $help~help[6] $help~tab&"   [minimum rob amount]  Amount that must be on port before robbing."
setvar $help~help[7] $help~tab&"   {upgraded}            Only visit upgraded ports."
setvar $help~help[8] $help~tab&"   {skipcim}             Skip CIM port report before running."
setvar $help~help[9] $help~tab&"   {clear_empty}         Delete the empty port file."
gosub :help~helpfile

:merchant
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run World Rob command from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

setvar $minimumport $parm1
isnumber $number $minimumport
if ($number <> 1)
	setvar $switchboard~message "Minimum rob amount entered is not a number!*"
	gosub :switchboard~switchboard
	halt
end
if ($minimumport <= 0)
	setvar $switchboard~message "Minimum rob amount must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $user_command_line $pos "cim"
if ($pos > 0)
	setvar $skipcim true
else
	setvar $skipcim false
end

getwordpos $user_command_line $pos "upgrade"
if ($pos > 0)
	setvar $visitupgraded true
else
	setvar $visitupgraded false
end

:merchant
killalltriggers
setarray $checkedports sectors
setarray $que sectors
setarray $checked sectors
send "q"
waiton "Planet command (?"
gosub :getplanetinfo
send "c"
if ($citadel < 4)
	setvar $switchboard~message "You must run World Rob from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end
gosub :player~quikstats
setvar $sectorcount 10
setvar $totalholds 0
setvar $spentcredits 0
setvar $startingsector $player~current_sector

if ($skipcim = false)
	setvar $switchboard~message "World Rob Downloading Current Port CIM Data - Comms Off*"
	gosub :switchboard~switchboard
	send "^rq"
	waitfor ": ENDINTERROG"
	setvar $switchboard~message "World Rob CIM Port Data Complete - Comms Back On*"
	gosub :switchboard~switchboard
end
lowercase $parm1
if ($parm1 = "clear_empty")
	delete $no_credits_file
	setvar $switchboard~message "'No Money' file for this bot has been cleared.*"
	gosub :switchboard~switchboard
	halt
end
setarray $empty_grid sectors
fileexists $exists $no_credits_file
if ($exists)
	setvar $switchboard~message "Reading 'No Money' Ports from file..*"
	gosub :switchboard~switchboard
	setvar $read_count 1
	read $no_credits_file $temp $read_count
	while ($temp <> "EOF")
		getword $temp $bustlocation 1
		setvar $empty_grid[$bustlocation] true
		add $read_count 1
		read $no_credits_file $temp $read_count
	end
else
	setvar $switchboard~message "No 'No Money' file, starting clean..*"
	gosub :switchboard~switchboard
end

setvar $infinity 1000
while (1 < $infinity)
	if (($unlimitedgame = false) and ($player~turns <= $bot_turn_limit))
		setvar $switchboard~message "Turns too low to continue.*"
		gosub :switchboard~switchboard
		goto :doneworldrob
	end
	setvar $isfigged false
	while ($isfigged <> true)
		gosub :findnearestrobport
		gosub :checkport
		if ($foundport = true)
			gosub :pwarp
			getsectorparameter $nearfig "FIGSEC" $isfigged
		end
	end
	gosub :rob
	gosub :player~quikstats
end

:doneworldrob
send "p"&$startingsector&"*y"
setvar $switchboard~message "World Rob completed.*"
gosub :switchboard~switchboard
halt

:checkport
setvar $foundport false
send "c r "&$nearfig&"*q "
waiton "What sector is the port in? ["&$player~current_sector&"] "&$nearfig
killalltriggers
settextlinetrigger crchecknothere :checkporttryagain "I have no information about a port in that sector."
settextlinetrigger crneverbeenthere :checkport2 "You have never visted sector"
settextlinetrigger crclass0 :checkporttryagain "A  Cargo holds     :"
waiton " Items     Status  Trading % of max OnBoard"

:checkport2
killalltriggers
setvar $foundport true

:checkporttryagain
killalltriggers
if ($foundport <> true)
	setvar $checkedports[$nearfig] true
end
return

:pwarp
killalltriggers
send "p"&$nearfig&"*y"
settextlinetrigger warped :emptyport2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
settextlinetrigger same :emptyport2 "You are already in that sector!"
settextlinetrigger didnotwarp :nofigatlocation "Your own fighters must be in the destination to make a safe jump."
settextlinetrigger notenoughfuel :donenofuel2 "You do not have enough Fuel Ore on this planet to make the jump."
pause

:emptyport2
setsectorparameter $nearfig "FIGSEC" true
return

:nofigatlocation
setvar $checkedports[$nearfig] true
setsectorparameter $nearfig "FIGSEC" false
return

:donenofuel2
halt

:findnearestrobport
setvar $bottom 1
setvar $top 1
setarray $checked sectors
if ($laststeal > 0)
	setvar $que[1] $laststeal
	setvar $checked[$laststeal] 1
else
	setvar $que[1] $player~current_sector
	setvar $checked[$player~current_sector] 1
end

:tryagain2
while ($bottom <= $top)

	setvar $focus $que[$bottom]

	getsectorparameter $focus "BUSTED" $isbusted
	if ($visitupgraded)
		setvar $isupped false
		setvar $upgradelimit 10000
		if (port.buyfuel[$focus] = false)
			if (port.percentfuel[$focus] <> 0)
				divide $currentfuel port.percentfuel[$focus]
			end
			if ($currentfuel > $upgradelimit)
				setvar $isupped true
			end
		end
		if (port.buyorg[$focus] = false)
			setvar $currentorg port.org[$focus]
			multiply $currentorg 100
			if (port.percentorg[$focus] <> 0)
				divide $currentorg port.percentorg[$focus]
			end
			if ($currentorg > $upgradelimit)
				setvar $isupped true
			end
		end

		if (port.buyequip[$focus] = false)
			setvar $currentequip port.equip[$focus]
			multiply $currentequip 100
			if (port.percentequip[$focus] <> 0)
				divide $currentequip port.percentequip[$focus]
			end
			if ($currentequip > $upgradelimit)
				setvar $isupped true
			end
		end
	end
	getsectorparameter $focus "FIGSEC" $isfigged
	if (($isfigged = true) and ((($empty_grid[$focus] <> true) and ((($checkedports[$focus] <> true) and (((port.exists[$focus] = true) and ((($isbusted <> true) and ((($focus <> $player~current_sector) and ((($focus <> $laststeal) and (((port.class[$focus] <> 0) and (((port.class[$focus] <> 8) and ((($visitupgraded = true) and ($isupped = true)) or ($visitupgraded = false)))))))))))))))))))

		setvar $nearfig $focus
		return
	else
		setvar $checked[$focus] 1
		setvar $nearfig 0
	end

	setvar $a 1
	while (sector.warps[$focus][$a] > 0)
		setvar $adjacent sector.warps[$focus][$a]

		if ($checked[$adjacent] = 0)

			setvar $checked[$adjacent] 1
			add $top 1
			setvar $que[$top] $adjacent
		end
		add $a 1
	end

	add $bottom 1
end
setvar $switchboard~message "Can't find a route to any other ports.*"
gosub :switchboard~switchboard
halt
return

:rob
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt

cuttext $player~alignment $neg_ck 1 1

striptext $player~alignment "-"
if (($player~alignment < 100) and ($neg_ck = "-"))
	setvar $switchboard~message "Need -100 Alignment Minimum*"
	gosub :switchboard~switchboard
	halt
elseif ($neg_ck <> "-")
	setvar $switchboard~message "Need -100 Alignment Minimum*"
	gosub :switchboard~switchboard
	halt
end
send "q q pr * r"
settextlinetrigger valid :rob_continue "<R> Rob this Port"
settextlinetrigger notvalid :rob_not_valid "<Q> Quit, nevermind"
pause

:rob_continue
killtrigger notvalid
settextlinetrigger fake :rob_fake "Busted!"
settextlinetrigger mega :rob_ok "port has in excess of"
pause

:rob_fake
killalltriggers
if ($startinglocation = "Citadel")
	gosub :landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
setvar $switchboard~message "Fake Busted*"
gosub :switchboard~switchboard
return

:rob_ok
killalltriggers

setvar $rob ($rob_factor * $player~experience)
getword currentline $port_cash 11
striptext $port_cash ","
setvar $original_port_cash $port_cash
multiply $port_cash 10
divide $port_cash 9

if ($port_cash < $minimumport)
	echo "*Port has less than "&$minimumport&" credits on it.*"
	send "0*"
	setvar $rob 0
elseif ($port_cash >= $rob)
	send $rob "*"
elseif ($port_cash < $rob)
	setvar $rob $port_cash
	send $rob "*"
end
if ($port_cash < $minimumport)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $no_credits_file $player~current_sector
end
settextlinetrigger port_empty :rob_suc "Maybe some other day, eh?"
settextlinetrigger mega_suc :rob_suc "Success!"
settextlinetrigger mega_bust :rob_bust "Busted!"
pause

:rob_bust
killalltriggers
if ($startinglocation = "Citadel")
	gosub :landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
send "'<"&$subspace&">[Busted:"&$player~current_sector&"]<"&$subspace&">* "
return

:rob_ready_to_mega
killalltriggers
send "0*  "
if ($startinglocation = "Citadel")
	gosub :landingsub
end
return

:rob_not_valid
killalltriggers
setvar $checkedports[$player~current_sector] true
setvar $empty_grid[$player~current_sector] true
write $no_credits_file $player~current_sector
setvar $rob 0
setvar $original_port_cash 0

:rob_suc
killalltriggers
if ($startinglocation = "Citadel")
	send "l " $planet "* c t t " $rob "* "
end
if ($rob > $original_port_cash)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $no_credits_file $player~current_sector
end
if ($rob > 0)
	setvar $laststeal $player~current_sector
	setvar $switchboard~message "Success! - " $rob " credits robbed*"
	gosub :switchboard~switchboard
end
return

:landingsub
send "l" $planet "*z  n  z  n  *  "
setvar $sucessfulcitadel false
setvar $sucessfulplanet false
settextlinetrigger noplanet :noplanet "There isn't a planet in this sector."
settextlinetrigger no_land :no_land "since it couldn't possibly stand"
settextlinetrigger planet :planet "Planet #"
settextlinetrigger wrongone :wrong_num "That planet is not in this sector."
pause

:noplanet
killtrigger no_land
killtrigger planet
killtrigger wrongone
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return

:no_land
killtrigger noplanet
killtrigger planet
killtrigger wrongone
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return

:planet
getword currentline $pnum_ck 2
striptext $pnum_ck "#"
if ($pnum_ck <> $planet)
	killtrigger no_land
	killtrigger wrongone
	killtrigger no_planet
	send "q"
	goto :wrong_num
end
killtrigger noplanet
killtrigger no_land
killtrigger wrongone
settexttrigger wrong_num :wrong_num "That planet is not in this sector."
settexttrigger planet :planet_prompt "Planet command"
pause

:wrong_num
killtrigger planet
send "**'{" $bot_name "} - Incorrect Planet Number*"
return

:planet_prompt
killtrigger wrong_num
setvar $currentbotplanet $planet
savevar $currentbotplanet
send "c"
settexttrigger build_cit :build_cit "Do you wish to construct one?"
settexttrigger in_cit :in_cit "Citadel command"
settexttrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
settexttrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
pause

:build_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulplanet true
send "n*"
setvar $startinglocation "Planet"
return

:in_cit
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
setvar $sucessfulcitadel true
setvar $startinglocation "Citadel"
return

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
setvar $planetfuel $planet~planet_fuel
setvar $planetfuelmax $planet~planet_fuel_max
setvar $planetorg $planet~planet_organics
setvar $planetorgmax $planet~planet_organics_max
setvar $planetequip $planet~planet_equipment
setvar $planetequipmax $planet~planet_equipment_max
setvar $planetfig $planet~planet_fighters
setvar $planetfigmax $planet~planet_fighters_max
setvar $citadel $planet~citadel
setvar $citadelcredits $planet~citadel_credits
setvar $acannon $planet~atmosphere_cannon
setvar $scannon $planet~sector_cannon
return

:planetneg
setvar $output_file ""
setvar $selldelay 0
setvar $oremcic "-90"
setvar $orgmcic "-75"
setvar $equmcic "-65"
setvar $version "3.0.0"

:verifyprompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet "))
	setvar $exit_message "Must start at Citadel or Planet Prompt for Planet Nego"
	goto :exitneg
end

setvar $_ck_ptradesetting $ptradesetting

if ($startinglocation = "Citadel")
	send "Q"
elseif ($startinglocation = "Planet ")
	setvar $startinglocation "Planet"
end
gosub :getplanetinfo
send "Q"
gosub :getinfo
send "*"

send "|CR"&$player~current_sector&"*Q|"

settextlinetrigger foundport :foundport "Items     Status  Trading % of max OnBoard"
settextlinetrigger noport :noport "I have no information about a port in that sector."
settextlinetrigger noport2 :noport "You have never visted sector"
settextlinetrigger noport3 :noport "credits / next hold"
pause

:noport
killalltriggers
gosub :negotiateland
setvar $exit_message "No port to sell to"
goto :exitneg

:foundport
killalltriggers
settextlinetrigger portinfo1 :portinfo1 "Fuel Ore "
settextlinetrigger portinfo2 :portinfo2 "Organics"
settextlinetrigger portinfo3 :portinfo3 "Equipment"
settextlinetrigger gotcr :gotcr "Computer command [TL="
pause

:portinfo1
killalltriggers
getword currentline $player~current_sector.orebuying 3
getword currentline $player~current_sector.oretrading 4
getword currentline $player~current_sector.orepercent 5
striptext $player~current_sector.orepercent "%"
goto :foundport

:portinfo2
killalltriggers
getword currentline $player~current_sector.orgbuying 2
getword currentline $player~current_sector.orgtrading 3
getword currentline $player~current_sector.orgpercent 4
striptext $player~current_sector.orgpercent "%"
goto :foundport

:portinfo3
killalltriggers
getword currentline $player~current_sector.equbuying 2
getword currentline $player~current_sector.equtrading 3
getword currentline $player~current_sector.equpercent 4
striptext $player~current_sector.equpercent "%"
goto :foundport

:gotcr
setdelaytrigger justasec :justasec 500
pause

:justasec
:initinfo
if ($player~turns <= 0)
	gosub :negotiateland
	setvar $exit_message "I have no turns to negotiate this planet"
	goto :exitneg
end
if ($player~credits > 900000000)
	gosub :negotiateland
	setvar $exit_message "I have too much cash on hand"
	goto :exitneg
end

setvar $fueltosell $planetfuel
if ($fueltosell > $planetfuel)
	setvar $fueltosell $planetfuel
end

if ($_ck_pnego_fueltosell = "-1")
	setvar $fueltosell 0
end

setvar $orgtosell $planetorg
if ($orgtosell > $planetorg)
	setvar $orgtosell $planetorg
end

if ($_ck_pnego_orgtosell = "-1")
	setvar $orgtosell 0
end

setvar $equiptosell $planetequip
if ($equiptosell > $planetequip)
	setvar $equiptosell $planetequip
end

if ($_ck_pnego_equiptosell = "-1")
	setvar $equiptosell 0
end

killalltriggers

if (($player~current_sector.orebuying <> "Buying") or ($player~current_sector.orepercent < 15))
	setvar $fueltosell 0
end
if (($player~current_sector.orgbuying <> "Buying") or ($player~current_sector.orgpercent < 15))
	setvar $orgtosell 0
end
if (($player~current_sector.equbuying <> "Buying") or ($player~current_sector.equpercent < 15))
	setvar $equiptosell 0
end

:selloff
if (($fueltosell <> 0) or ($orgtosell <> 0) or ($equiptosell <> 0))
	setvar $ore_sell_failures 0
	setvar $org_sell_failures 0
	setvar $equ_sell_failures 0
	setvar $oreselloutput ""
	setvar $orgselloutput ""
	setvar $equselloutput ""
	setvar $oreprofit 0
	setvar $orgprofit 0
	setvar $equprofit 0

	send "|"
	gosub :sell
	gosub :negotiateland
	if ($startinglocation = "Citadel")

		if ($oreprofit <> 0)
			send "TT"&$oreprofit&"*"
			subtract $player~credits $oreprofit
		end
		if ($orgprofit <> 0)
			send "TT"&$orgprofit&"*"
			subtract $player~credits $orgprofit
		end
		if ($equprofit <> 0)
			send "TT"&$equprofit&"*"
			subtract $player~credits $equprofit
		end
	end

	send "|"

	setvar $generaloutput "*Sector "&$player~current_sector&"*"
	if ($output_file <> "")
		write $output_file $generaloutput
	end

	if ($oreselloutput <> "")
		send $oreselloutput
		if ($output_file <> "")
			write $output_file $oreselloutput
		end
	end
	if ($orgselloutput <> "")
		send $orgselloutput
		if ($output_file <> "")
			write $output_file $orgselloutput
		end
	end
	if ($equselloutput <> "")
		send $equselloutput
		if ($output_file <> "")
			write $output_file $equselloutput
		end
	end
	setvar $exit_message "Done with port"
	goto :exitneg
else
	gosub :negotiateland
	setvar $exit_message "Nothing to sell"
	goto :exitneg
end

:sell
:resell
if ($player~turns <= 0)
	send "'I'm out of turns*"
	return
end
setvar $thisorefailed 0
setvar $thisorgfailed 0
setvar $thisequfailed 0
send "PN"&$planet&"*"
subtract $player~turns 1

:getpercts
gosub :planethaggle~getpercts

:sellproduct
settexttrigger sellfuel :sellfuel "How many units of Fuel Ore"
settexttrigger sellorg :sellorg "How many units of Organics"
settexttrigger sellequ :sellequ "How many units of Equipment"
settexttrigger donewithport :donewithport "Command [TL="
pause

:sellfuel
killalltriggers
if (($player~current_sector.orepercent >= 15) and ($fueltosell > 0))
	if ($fueltosell > $player~current_sector.oretrading)
		setvar $fueltosell $player~current_sector.oretrading
	end
	setvar $prodtosell "ore"
	setvar $portbuying $fueltosell
	gosub :sellhaggle
	if ($currenthaggle = "succeeded")
		setvar $orehaggle "succeeded"
		setvar $fueltosell 0
		subtract $oremcic 1
	else
		setvar $orehaggle "failed"
	end
else
	send "0*"
end
goto :sellproduct

:sellorg
killalltriggers
if (($player~current_sector.orgpercent >= 15) and ($orgtosell > 0))
	if ($orgtosell > $player~current_sector.orgtrading)
		setvar $orgtosell $player~current_sector.orgtrading
	end
	setvar $prodtosell "org"
	setvar $portbuying $orgtosell
	gosub :sellhaggle
	if ($currenthaggle = "succeeded")
		setvar $orghaggle "succeeded"
		setvar $orgtosell 0
		subtract $orgmcic 1
	else
		setvar $orghaggle "failed"
	end
else
	send "0*"
end
goto :sellproduct

:sellequ
killalltriggers
if (($player~current_sector.equpercent >= 15) and ($equiptosell > 0))
	if ($equiptosell > $player~current_sector.equtrading)
		setvar $equiptosell $player~current_sector.equtrading
	end
	setvar $prodtosell "equ"
	setvar $portbuying $equiptosell
	gosub :sellhaggle
	if ($currenthaggle = "succeeded")
		setvar $equhaggle "succeeded"
		setvar $equiptosell 0
		subtract $equmcic 1
	else
		setvar $equhaggle "failed"
	end
else
	send "0*"
end
goto :sellproduct

:donewithport
killalltriggers
if (($ore_sell_failures > 4) or ($org_sell_failures > 4) or ($equ_sell_failures > 4))
	setvar $selloutput $selloutput&"Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
	return
elseif (($fueltosell = 0) and (($orgtosell = 0) and ($equiptosell = 0)))
	return
else
	goto :resell
end

:sellhaggle
settextlinetrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
send $portbuying&"*"
pause

:sellfirstoffer
killalltriggers
getword currentline $offer 5
striptext $offer ","

gosub :swathoff
if ($swathoff = false)
	gosub :negotiateland
	setvar $exit_message $swathoffmessage
	goto :exitneg
end

setvar $perunitinitoffer $offer

multiply $perunitinitoffer 100
divide $perunitinitoffer $_ck_ptradesetting

multiply $perunitinitoffer 100

divide $perunitinitoffer $portbuying

setvar $portmaxinit $perunitinitoffer

divide $perunitinitoffer 10

if ($prodtosell = "ore")

	setvar $basevalue 256055800
	setvar $basepercent 11725
	setvar $basepercentinverse 88275
	setvar $percentfrombase $player~current_sector.orepercent
elseif ($prodtosell = "org")

	setvar $basevalue 506276400
	setvar $basepercent 11287
	setvar $basepercentinverse 88713
	setvar $percentfrombase $player~current_sector.orgpercent
elseif ($prodtosell = "equ")

	setvar $basevalue 906281000
	setvar $basepercent 10989
	setvar $basepercentinverse 89010
	setvar $percentfrombase $player~current_sector.equpercent

end
if ($percentfrombase = 100)
	echo "* 100% port*"

	divide $portmaxinit 10

elseif ($percentfrombase >= 15)

	multiply $portmaxinit 100000

	subtract $portmaxinit $basevalue

	multiply $percentfrombase 1000

	subtract $percentfrombase $basepercent

	divide $portmaxinit $percentfrombase

	multiply $portmaxinit $basepercentinverse

	add $portmaxinit $basevalue

	divide $portmaxinit 1000000

elseif ($prodtosell = "ore")
	setvar $portmaxinit 340

elseif ($prodtosell = "org")
	setvar $portmaxinit 635

elseif ($prodtosell = "equ")
	setvar $portmaxinit 1063

end
if ($prodtosell = "ore")
	if ($portmaxinit >= 436)
		setvar $mcic "-90"
		setvar $multiple 1494

	elseif ($portmaxinit >= 434)
		setvar $mcic "-89"
		setvar $multiple 1488

	elseif ($portmaxinit >= 433)
		setvar $mcic "-88"
		setvar $multiple 1482

	elseif ($portmaxinit >= 431)
		setvar $mcic "-87"
		setvar $multiple 1476

	elseif ($portmaxinit >= 429)
		setvar $mcic "-86"
		setvar $multiple 1470

	elseif ($portmaxinit >= 427)
		setvar $mcic "-85"
		setvar $multiple 1464

	elseif ($portmaxinit >= 425)
		setvar $mcic "-84"
		setvar $multiple 1458

	elseif ($portmaxinit >= 424)
		setvar $mcic "-83"
		setvar $multiple 1452

	elseif ($portmaxinit >= 422)
		setvar $mcic "-82"
		setvar $multiple 1446

	elseif ($portmaxinit >= 420)
		setvar $mcic "-81"
		setvar $multiple 1440

	elseif ($portmaxinit >= 418)
		setvar $mcic "-80"
		setvar $multiple 1434

	elseif ($portmaxinit >= 416)
		setvar $mcic "-79"
		setvar $multiple 1429

	elseif ($portmaxinit >= 414)
		setvar $mcic "-78"
		setvar $multiple 1423

	elseif ($portmaxinit >= 412)
		setvar $mcic "-77"
		setvar $multiple 1417

	elseif ($portmaxinit >= 411)
		setvar $mcic "-76"
		setvar $multiple 1411

	elseif ($portmaxinit >= 409)
		setvar $mcic "-75"
		setvar $multiple 1405

	elseif ($portmaxinit >= 407)
		setvar $mcic "-74"
		setvar $multiple 1399

	elseif ($portmaxinit >= 405)
		setvar $mcic "-73"
		setvar $multiple 1393

	elseif ($portmaxinit >= 403)
		setvar $mcic "-72"
		setvar $multiple 1387

	elseif ($portmaxinit >= 401)
		setvar $mcic "-71"
		setvar $multiple 1381

	elseif ($portmaxinit >= 399)
		setvar $mcic "-70"
		setvar $multiple 1375

	elseif ($portmaxinit >= 397)
		setvar $mcic "-69"
		setvar $multiple 1369

	elseif ($portmaxinit >= 396)
		setvar $mcic "-68"
		setvar $multiple 1363

	elseif ($portmaxinit >= 394)
		setvar $mcic "-67"
		setvar $multiple 1357

	elseif ($portmaxinit >= 392)
		setvar $mcic "-66"
		setvar $multiple 1351

	elseif ($portmaxinit >= 390)
		setvar $mcic "-65"
		setvar $multiple 1345

	elseif ($portmaxinit >= 388)
		setvar $mcic "-64"
		setvar $multiple 1342

	elseif ($portmaxinit >= 386)
		setvar $mcic "-63"
		setvar $multiple 1336

	elseif ($portmaxinit >= 384)
		setvar $mcic "-62"
		setvar $multiple 1330

	elseif ($portmaxinit >= 382)
		setvar $mcic "-61"
		setvar $multiple 1324

	elseif ($portmaxinit >= 380)
		setvar $mcic "-60"
		setvar $multiple 1318

	elseif ($portmaxinit >= 378)
		setvar $mcic "-59"
		setvar $multiple 1312

	elseif ($portmaxinit >= 376)
		setvar $mcic "-58"
		setvar $multiple 1306

	elseif ($portmaxinit >= 374)
		setvar $mcic "-57"
		setvar $multiple 1300

	elseif ($portmaxinit >= 372)
		setvar $mcic "-56"
		setvar $multiple 1294

	elseif ($portmaxinit >= 370)
		setvar $mcic "-55"
		setvar $multiple 1291

	elseif ($portmaxinit >= 368)
		setvar $mcic "-54"
		setvar $multiple 1285

	elseif ($portmaxinit >= 366)
		setvar $mcic "-53"
		setvar $multiple 1279

	elseif ($portmaxinit >= 364)
		setvar $mcic "-52"
		setvar $multiple 1273

	elseif ($portmaxinit >= 362)
		setvar $mcic "-51"
		setvar $multiple 1267

	elseif ($portmaxinit >= 360)
		setvar $mcic "-50"
		setvar $multiple 1261

	elseif ($portmaxinit >= 358)
		setvar $mcic "-49"
		setvar $multiple 1255

	elseif ($portmaxinit >= 356)
		setvar $mcic "-48"
		setvar $multiple 1249

	elseif ($portmaxinit >= 354)
		setvar $mcic "-46"
		setvar $multiple 1246

	elseif ($portmaxinit >= 352)
		setvar $mcic "-46"
		setvar $multiple 1240

	elseif ($portmaxinit >= 350)
		setvar $mcic "-45"
		setvar $multiple 1234

	elseif ($portmaxinit >= 348)
		setvar $mcic "-44"
		setvar $multiple 1228

	elseif ($portmaxinit >= 346)
		setvar $mcic "-43"
		setvar $multiple 1222

	elseif ($portmaxinit >= 344)
		setvar $mcic "-42"
		setvar $multiple 1219

	elseif ($portmaxinit >= 342)
		setvar $mcic "-41"
		setvar $multiple 1209

	elseif ($portmaxinit >= 340)
		setvar $mcic "-40"
		setvar $multiple 1208

	else
		setvar $mcic 0
		setvar $multiple 1208

	end
elseif ($prodtosell = "org")
	if ($portmaxinit >= 813)
		setvar $mcic "-75"
		setvar $multiple 1405

	elseif ($portmaxinit >= 810)
		setvar $mcic "-74"
		setvar $multiple 1399

	elseif ($portmaxinit >= 806)
		setvar $mcic "-73"
		setvar $multiple 1393

	elseif ($portmaxinit >= 802)
		setvar $mcic "-72"
		setvar $multiple 1387

	elseif ($portmaxinit >= 798)
		setvar $mcic "-71"
		setvar $multiple 1381

	elseif ($portmaxinit >= 795)
		setvar $mcic "-70"
		setvar $multiple 1375

	elseif ($portmaxinit >= 791)
		setvar $mcic "-69"
		setvar $multiple 1369

	elseif ($portmaxinit >= 787)
		setvar $mcic "-68"
		setvar $multiple 1363

	elseif ($portmaxinit >= 783)
		setvar $mcic "-67"
		setvar $multiple 1357

	elseif ($portmaxinit >= 779)
		setvar $mcic "-66"
		setvar $multiple 1351

	elseif ($portmaxinit >= 775)
		setvar $mcic "-65"
		setvar $multiple 1345

	elseif ($portmaxinit >= 772)
		setvar $mcic "-64"
		setvar $multiple 1339

	elseif ($portmaxinit >= 768)
		setvar $mcic "-63"
		setvar $multiple 1336

	elseif ($portmaxinit >= 764)
		setvar $mcic "-62"
		setvar $multiple 1330

	elseif ($portmaxinit >= 760)
		setvar $mcic "-61"
		setvar $multiple 1324

	elseif ($portmaxinit >= 756)
		setvar $mcic "-60"
		setvar $multiple 1318

	elseif ($portmaxinit >= 752)
		setvar $mcic "-59"
		setvar $multiple 1312

	elseif ($portmaxinit >= 748)
		setvar $mcic "-58"
		setvar $multiple 1306

	elseif ($portmaxinit >= 744)
		setvar $mcic "-57"
		setvar $multiple 1300

	elseif ($portmaxinit >= 740)
		setvar $mcic "-56"
		setvar $multiple 1294

	elseif ($portmaxinit >= 737)
		setvar $mcic "-55"
		setvar $multiple 1291

	elseif ($portmaxinit >= 733)
		setvar $mcic "-54"
		setvar $multiple 1285

	elseif ($portmaxinit >= 729)
		setvar $mcic "-53"
		setvar $multiple 1279

	elseif ($portmaxinit >= 725)
		setvar $mcic "-52"
		setvar $multiple 1273

	elseif ($portmaxinit >= 721)
		setvar $mcic "-51"
		setvar $multiple 1267

	elseif ($portmaxinit >= 717)
		setvar $mcic "-50"
		setvar $multiple 1261

	elseif ($portmaxinit >= 713)
		setvar $mcic "-49"
		setvar $multiple 1255

	elseif ($portmaxinit >= 709)
		setvar $mcic "-48"
		setvar $multiple 1252

	elseif ($portmaxinit >= 705)
		setvar $mcic "-47"
		setvar $multiple 1246

	elseif ($portmaxinit >= 701)
		setvar $mcic "-46"
		setvar $multiple 1236

	elseif ($portmaxinit >= 697)
		setvar $mcic "-45"
		setvar $multiple 1233

	elseif ($portmaxinit >= 693)
		setvar $mcic "-44"
		setvar $multiple 1227

	elseif ($portmaxinit >= 688)
		setvar $mcic "-43"
		setvar $multiple 1224

	elseif ($portmaxinit >= 684)
		setvar $mcic "-42"
		setvar $multiple 1214

	elseif ($portmaxinit >= 680)
		setvar $mcic "-41"
		setvar $multiple 1213

	elseif ($portmaxinit >= 676)
		setvar $mcic "-40"
		setvar $multiple 1203

	elseif ($portmaxinit >= 672)
		setvar $mcic "-39"
		setvar $multiple 1200

	elseif ($portmaxinit >= 668)
		setvar $mcic "-38"
		setvar $multiple 1194

	elseif ($portmaxinit >= 664)
		setvar $mcic "-37"
		setvar $multiple 1191

	elseif ($portmaxinit >= 660)
		setvar $mcic "-36"
		setvar $multiple 1181

	elseif ($portmaxinit >= 656)
		setvar $mcic "-35"
		setvar $multiple 1178

	elseif ($portmaxinit >= 651)
		setvar $mcic "-34"
		setvar $multiple 1172

	elseif ($portmaxinit >= 647)
		setvar $mcic "-33"
		setvar $multiple 1166

	elseif ($portmaxinit >= 643)
		setvar $mcic "-32"
		setvar $multiple 1160

	elseif ($portmaxinit >= 639)
		setvar $mcic "-31"
		setvar $multiple 1157

	elseif ($portmaxinit >= 635)
		setvar $mcic "-30"
		setvar $multiple 1154

	else
		setvar $mcic 0
		setvar $multiple 1154

	end
elseif ($prodtosell = "equ")
	if ($portmaxinit >= 1393)
		setvar $mcic "-65"
		setvar $multiple 1347

	elseif ($portmaxinit >= 1386)
		setvar $mcic "-64"
		setvar $multiple 1341

	elseif ($portmaxinit >= 1379)
		setvar $mcic "-63"
		setvar $multiple 1336

	elseif ($portmaxinit >= 1372)
		setvar $mcic "-62"
		setvar $multiple 1330

	elseif ($portmaxinit >= 1365)
		setvar $mcic "-61"
		setvar $multiple 1324

	elseif ($portmaxinit >= 1358)
		setvar $mcic "-60"
		setvar $multiple 1319

	elseif ($portmaxinit >= 1351)
		setvar $mcic "-59"
		setvar $multiple 1313

	elseif ($portmaxinit >= 1344)
		setvar $mcic "-58"
		setvar $multiple 1307

	elseif ($portmaxinit >= 1337)
		setvar $mcic "-57"
		setvar $multiple 1302

	elseif ($portmaxinit >= 1329)
		setvar $mcic "-56"
		setvar $multiple 1296

	elseif ($portmaxinit >= 1323)
		setvar $mcic "-55"
		setvar $multiple 1291

	elseif ($portmaxinit >= 1315)
		setvar $mcic "-54"
		setvar $multiple 1285

	elseif ($portmaxinit >= 1308)
		setvar $mcic "-53"
		setvar $multiple 1279

	elseif ($portmaxinit >= 1301)
		setvar $mcic "-52"
		setvar $multiple 1274

	elseif ($portmaxinit >= 1294)
		setvar $mcic "-51"
		setvar $multiple 1268

	elseif ($portmaxinit >= 1287)
		setvar $mcic "-50"
		setvar $multiple 1262

	elseif ($portmaxinit >= 1279)
		setvar $mcic "-49"
		setvar $multiple 1254

	elseif ($portmaxinit >= 1272)
		setvar $mcic "-48"
		setvar $multiple 1247

	elseif ($portmaxinit >= 1265)
		setvar $mcic "-47"
		setvar $multiple 1246

	elseif ($portmaxinit >= 1258)
		setvar $mcic "-46"
		setvar $multiple 1241

	elseif ($portmaxinit >= 1251)
		setvar $mcic "-45"
		setvar $multiple 1235

	elseif ($portmaxinit >= 1243)
		setvar $mcic "-44"
		setvar $multiple 1229

	elseif ($portmaxinit >= 1236)
		setvar $mcic "-43"
		setvar $multiple 1224

	elseif ($portmaxinit >= 1229)
		setvar $mcic "-42"
		setvar $multiple 1218

	elseif ($portmaxinit >= 1221)
		setvar $mcic "-41"
		setvar $multiple 1213

	elseif ($portmaxinit >= 1214)
		setvar $mcic "-40"
		setvar $multiple 1208

	elseif ($portmaxinit >= 1206)
		setvar $mcic "-39"
		setvar $multiple 1201

	elseif ($portmaxinit >= 1199)
		setvar $mcic "-38"
		setvar $multiple 1196

	elseif ($portmaxinit >= 1192)
		setvar $mcic "-37"
		setvar $multiple 1190

	elseif ($portmaxinit >= 1184)
		setvar $mcic "-36"
		setvar $multiple 1185

	elseif ($portmaxinit >= 1177)
		setvar $mcic "-35"
		setvar $multiple 1180

	elseif ($portmaxinit >= 1169)
		setvar $mcic "-34"
		setvar $multiple 1174

	elseif ($portmaxinit >= 1162)
		setvar $mcic "-33"
		setvar $multiple 1169

	elseif ($portmaxinit >= 1154)
		setvar $mcic "-32"
		setvar $multiple 1164

	elseif ($portmaxinit >= 1147)
		setvar $mcic "-31"
		setvar $multiple 1158

	elseif ($portmaxinit >= 1139)
		setvar $mcic "-30"
		setvar $multiple 1152

	elseif ($portmaxinit >= 1132)
		setvar $mcic "-29"
		setvar $multiple 1149

	elseif ($portmaxinit >= 1124)
		setvar $mcic "-28"
		setvar $multiple 1144

	elseif ($portmaxinit >= 1116)
		setvar $mcic "-27"
		setvar $multiple 1136

	elseif ($portmaxinit >= 1109)
		setvar $mcic "-26"
		setvar $multiple 1132

	elseif ($portmaxinit >= 1101)
		setvar $mcic "-25"
		setvar $multiple 1126

	elseif ($portmaxinit >= 1093)
		setvar $mcic "-24"
		setvar $multiple 1122

	elseif ($portmaxinit >= 1086)
		setvar $mcic "-23"
		setvar $multiple 1117

	elseif ($portmaxinit >= 1078)
		setvar $mcic "-22"
		setvar $multiple 1110

	elseif ($portmaxinit >= 1071)
		setvar $mcic "-21"
		setvar $multiple 1105

	elseif ($portmaxinit >= 1063)
		setvar $mcic "-20"
		setvar $multiple 1102

	else
		setvar $mcic 0
		setvar $multiple 1102

	end
end
setvar $counter $offer
divide $counter 10
multiply $counter $multiple
divide $counter 100
send $counter&"*"
setvar $midhaggles 0

:sellofferloop
settextlinetrigger sellprice :sellprice "We'll buy them for"
settextlinetrigger sellfinaloffer :sellfinaloffer "Our final offer"

settextlinetrigger sellexperience :sellexperience "experience point(s)"
settextlinetrigger sellyouhave :sellyouhave "You have"

settextlinetrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
settextlinetrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
settextlinetrigger sellscrewup3 :sellscrewup "My patience grows short with you."
settextlinetrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
settextlinetrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
settextlinetrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
settextlinetrigger sellscrewup7 :sellscrewup "Make a real offer or get the h"
settextlinetrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
settextlinetrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
pause
pause

:sellscrewup
killalltriggers
multiply $counter 98
divide $counter 100
send $counter&"*"
goto :sellofferloop

:sellprice
killalltriggers
add $midhaggles 1
setvar $old_offer $offer
setvar $old_counter $counter
getword currentline $offer 5
striptext $offer ","

setvar $offer_change $offer
subtract $offer_change $old_offer
if ($mcic > "-35")
	multiply $offer_change 75
	divide $offer_change 100
	subtract $counter $offer_change
	subtract $counter 25
elseif ($mcic > "-55")
	multiply $offer_change 65
	divide $offer_change 100
	subtract $counter $offer_change
	subtract $counter 25
else
	multiply $offer_change 60
	divide $offer_change 100
	subtract $counter $offer_change
	subtract $counter 10
end
send $counter&"*"
goto :sellofferloop

:sellfinaloffer
killalltriggers

if (($prodtosell = "ore") and (($mcic <= "-75") and (($portbuying >= 25000) and (($midhaggles < 1) and ($ore_sell_failures < 2)))))
	setvar $forcefail 1
	setvar $thisorefailed 1
elseif (($prodtosell = "org") and ((($mcic <= "-60") and ((($portbuying >= 25000) and ((($midhaggles < 2) and (($thisorefailed = 1) or ($org_sell_failures < 4)))))))))
	setvar $forcefail 1
	setvar $thisorgfailed 1
elseif (($prodtosell = "org") and ((($mcic <= "-60") and ((($portbuying >= 15000) and ((($midhaggles < 1) and (($thisorefailed = 1) or ($org_sell_failures < 2)))))))))
	setvar $forcefail 1
	setvar $thisorgfailed 1
elseif (($prodtosell = "equ") and ((($mcic <= "-55") and ((($portbuying >= 20000) and ((($midhaggles < 2) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 4)))))))))
	setvar $forcefail 1
	setvar $thisequfailed 1
elseif (($prodtosell = "equ") and ((($mcic <= "-55") and ((($portbuying >= 12000) and ((($midhaggles < 1) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 2)))))))))
	setvar $forcefail 1
	setvar $thisequfailed 1
else
	setvar $forcefail 0

end
if ($forcefail = 0)
	setvar $old_offer $offer
	setvar $old_counter $counter
	getword currentline $offer 5
	striptext $offer ","
	setvar $offer_change $offer
	subtract $offer_change $old_offer
	if ($prodtosell = "ore")
		multiply $offer_change 30
	elseif ($prodtosell = "org")
		multiply $offer_change 27
	elseif ($prodtosell = "equ")
		multiply $offer_change 25
	end
	divide $offer_change 10
	subtract $counter $offer_change
	subtract $counter 10
	send $counter&"*"
else

	send $counter&"*"
end
goto :sellofferloop

:sellnotinterested
killalltriggers
goto :sellhagglefailed

:sellexperience
killalltriggers
getword currentline $exp_bonus 7
add $player~experience $exp_bonus
goto :sellofferloop

:sellyouhave
killalltriggers
setvar $oldcredits $player~credits
getword currentline $player~credits 3
striptext $player~credits ","
if ($oldcredits = $player~credits)
	setvar $currenthaggle "failed"
	goto :sellhagglefailed
else
	setvar $currenthaggle "succeeded"
	goto :sellhagglesucceeded
end

:sellhagglefailed
if ($prodtosell = "ore")
	add $ore_sell_failures 1
elseif ($prodtosell = "org")
	add $org_sell_failures 1
elseif ($prodtosell = "equ")
	add $equ_sell_failures 1
end
if ($selldelay > 99)
	setdelaytrigger selldelay :selldelay $selldelay
	pause

	:selldelay
end
return

:sellhagglesucceeded
setvar $perunit $counter
divide $perunit $portbuying

setvar $selloutput "'"
setvar $selloutput $selloutput&$portbuying&" "&$prodtosell&" for "&$counter&" cr"
setvar $selloutput $selloutput&" - "
if ($prodtosell = "ore")
	setvar $selloutput $selloutput&$ore_sell_failures
elseif ($prodtosell = "org")
	setvar $selloutput $selloutput&$org_sell_failures
elseif ($prodtosell = "equ")
	setvar $selloutput $selloutput&$equ_sell_failures
end
setvar $selloutput $selloutput&" fails"
setvar $selloutput $selloutput&" - "&$perunit&"/unit"

setvar $selloutput $selloutput&" - MCIC "&$mcic
if ($prodtosell = "ore")
	setvar $selloutput $selloutput&"/-90*"
	setvar $oreselloutput $selloutput
	setvar $oreprofit $counter
elseif ($prodtosell = "org")
	setvar $selloutput $selloutput&"/-75*"
	setvar $orgselloutput $selloutput
	setvar $orgprofit $counter
elseif ($prodtosell = "equ")
	setvar $selloutput $selloutput&"/-65*"
	setvar $equselloutput $selloutput
	setvar $equprofit $counter

end
if ($selldelay > 99)
	setdelaytrigger selldelay :selldelay2 $selldelay
	pause
	pause

	:selldelay2
end
return

:negotiateland
if ($startinglocation = "Citadel")
	send "L "&$planet&"* "
	gosub :getplanetinfo
	send "c "
elseif ($startinglocation = "Planet")
	send "L "&$planet&"* "
	gosub :getplanetinfo
end
return

:exitneg
send "'Planet Negotiation exiting --- "&$exit_message&"*"
return

:getinfo
gosub :player~getinfo
setvar $trader_name $player~trader_name
setvar $corpstring $player~corpstring
setvar $turns_per_warp $player~turns_per_warp
setvar $twarp_1_range $player~twarp_1_range
setvar $twarp_2_range $player~twarp_2_range
setvar $empty_holds $player~empty_holds
return

:swathoff
if ($swathoff = false)
	settexttrigger swathison :swathison "Command [TL="
	setdelaytrigger swathisoff :swathisoff 2000
	pause

	:swathison
	killalltriggers
	setvar $swathoffmessage "Detected SWATH Autohaggle"
	setvar $swathoff false
	return

	:swathisoff
	killalltriggers
	setvar $swathoff true
end
return

:nofigatlocation
setsectorparameter $nearfig "FIGSEC" false
goto :tryagain2

:buydownfuel
setvar $upgrade false
killalltriggers
gosub :player~quikstats
send "q"
waiton "Planet command (?"
gosub :getplanetinfo
send "c"
if ($upgrade)
	setvar $total_creds_needed (300 * 7000)
	if ($total_creds_needed > $player~credits)
		setvar $cashonhand $citadelcredits
		add $cashonhand $player~credits
		if ($cashonhand > $total_creds_needed)
			send "T T "&$player~credits&"* "
			send "T F "&$total_creds_needed&"* "
			setvar $player~credits $total_creds_needed
		end
	end
	send "q q *O 1"
	waiton ", 0 to quit)"
	getword currentline $upgradeamount 9
	striptext $upgradeamount "("
	send $upgradeamount&"* * *CR*Q"
	waiton "What sector is the port in? ["&$player~current_sector&"]"
	settextlinetrigger getfuel2 :fuelduring "Fuel Ore"
	pause

	:fuelduring
	killalltriggers
	getword currentline $totalportfuel 4
	waiton "<Computer deactivated>"
	gosub :player~quikstats
else
	send "q q *cr*q"
	waiton "Fuel Ore"
	getword currentline $totalportfuel 4
end
if (($planetfuelmax - $planetfuel) < $totalportfuel)
	setvar $turnstoempty (($planetfuelmax - $planetfuel) / $player~total_holds)
	setvar $isdone true
else
	setvar $turnstoempty ($totalportfuel / $player~total_holds)
end
setvar $total_creds_needed ($turnstoempty * ($player~total_holds * 35))
if ($player~credits < $total_creds_needed)
	gosub :getfuelcash
end
if ($player~credits < $total_creds_needed)
	gosub :landonplanetentercitadel
	return
end
setvar $creditsbefore $player~credits
if (($unlimitedgame = false) and (($player~turns - $turnstoempty) <= $bot_turn_limit))
	setvar $turnstoolow true
	gosub :landonplanetentercitadel
	return
end
while ($turnstoempty > 1)
	setvar $creditsbefore $player~credits
	if ($turbo)
		send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * "
	else
		send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * /"
	end
	subtract $turnstoempty 1
	add $totalholds $player~total_holds
	if ($turbo <> true)
		waiton "Creds"
	end
end
gosub :player~quikstats
if (($player~turns < $bot_turn_limit) and ($unlimitedgame = false))
	gosub :landonplanetentercitadel
	return
end
add $spentcredits ($creditsbefore - $player~credits)
gosub :landonplanetentercitadel
return

:landonplanetentercitadel
setvar $planet~planet $planet
gosub :planet~landonplanetentercitadel
setvar $planetfuel $planet~planetfuel
return

:getfuelcash
send "l " $planet "*   c t f"&$total_creds_needed&"*qq"
gosub :player~quikstats
return
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
