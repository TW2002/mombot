gosub :loadvars~loadvars
gosub :help~initialize
setvar $buydown_restore_haggle 0

setvar $help~help[1] $help~tab&"BUY - Buy Product from port in Sector or Fighters and/or"
setvar $help~help[2] $help~tab&"      shields from Rylos or Alpha"
setvar $help~help[3] $help~tab&"      "
setvar $help~help[4] $help~tab&"  - buy [product] {mode} {cycles}"
setvar $help~help[5] $help~tab&"  - [product] = [f]uel or [o]rg or [e]quip"
setvar $help~help[6] $help~tab&"  - [mode]    = [b]est or [s]peed or [w]orst - default is speed"
setvar $help~help[7] $help~tab&"  - [cycles]  = number of cycles             - default is max"
setvar $help~help[8] $help~tab&"  - [override] = allows product buydowns with less than 200 holds"
setvar $help~help[9] $help~tab&"     "
setvar $help~help[10] $help~tab&"  - buy [hardware] {amount|dump}"
setvar $help~help[11] $help~tab&"  - [hardware]= [fig]hters or [sh]ields"
setvar $help~help[12] $help~tab&"  - [amount]  = number to purchase, default is maximum "
setvar $help~help[13] $help~tab&"  -             (use dump to buy down figs and dump to sector) "
setvar $help~help[14] $help~tab&"     "
setvar $help~help[15] $help~tab&"  - Originally written by Cherokee.     "
gosub :help~helpfile

loadvar $game~port_max
setvar $overhagglemultiple 147
setvar $cyclebuffer 1
setvar $cyclebufferlimit 20

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Planet"))
	setvar $switchboard~message "Must start at Citadel or Planet Prompt for Buy Down*"
	gosub :switchboard~switchboard
	halt
end

if ($bot~parm1 = "sh")
	if ($startinglocation <> "Citadel")
		setvar $switchboard~message "Shield Buyer must be run from the Citadel"
		gosub :switchboard~switchboard
		halt
	end
	goto :shield_start
end
if ($bot~parm1 = "fig")
	if ($startinglocation <> "Citadel")
		setvar $switchboard~message "Fighter Buyer must be run from the Citadel"
		gosub :switchboard~switchboard
		halt
	end
	goto :fighter_start
end

if ($player~total_holds < 200)
	getwordpos $bot~user_command_line $pos "override"
	if ($pos = 0)
		setvar $exit_message "This ship has less than 200 holds, cannot buydown without override.*"
		goto :buydownexit
	end
end

setvar $output ""
setvar $equiprounds 0
setvar $orgrounds 0
setvar $fuelrounds 0
isnumber $isnumber2 $bot~parm2
isnumber $isnumber3 $bot~parm3
if ($isnumber2)
	if ($bot~parm2 > 0)
		setvar $buydownroundsfromparam $bot~parm2
	else
		setvar $buydownroundsfromparam 999999
	end
elseif ($isnumber3)
	if ($bot~parm3 > 0)
		setvar $buydownroundsfromparam $bot~parm3
	else
		setvar $buydownroundsfromparam 999999
	end
else
	setvar $buydownroundsfromparam 999999
end
getwordpos " "&$bot~user_command_line&" " $isworst " w "
getwordpos " "&$bot~user_command_line&" " $isbest " b "
if ($isworst > 0)
	setvar $buydown_mode 3
elseif ($isbest > 0)
	setvar $buydown_mode 2
else
	setvar $buydown_mode 1
end
if ($bot~parm1 = "e")
	setvar $buydown_equiprounds $buydownroundsfromparam
	setvar $buydown_orgrounds 0
	setvar $buydown_fuelrounds 0
elseif ($bot~parm1 = "o")
	setvar $buydown_equiprounds 0
	setvar $buydown_orgrounds $buydownroundsfromparam
	setvar $buydown_fuelrounds 0
elseif ($bot~parm1 = "f")
	setvar $buydown_equiprounds 0
	setvar $buydown_orgrounds 0
	setvar $buydown_fuelrounds $buydownroundsfromparam
else
	setvar $switchboard~message "Please use format buy [type] {speed} {#cycles} {override}*"
	gosub :switchboard~switchboard
	halt

end

if ($startinglocation = "Citadel")
	send "Q  "
end

if (($player~ore_holds + ($player~organic_holds + ($player~equipment_holds + $player~colonist_holds))) <> 0)
	setvar $mac ""
	if ($player~ore_holds <> 0)
		setvar $mac "  T N L 1* "
	end
	if ($player~organic_holds <> 0)
		setvar $mac $mac&" T N L 2* "
	end
	if ($player~equipment_holds <> 0)
		setvar $mac $mac&" T N L 3* "
	end
	if ($player~colonist_holds <> 0)
		setvar $mac $mac&" S N L 1* "
	end
	if ($mac <> "")
		send $mac
		gosub :player~quikstats
		if (($player~ore_holds + ($player~organic_holds + ($player~equipment_holds + $player~colonist_holds))) <> 0)
			setvar $switchboard~message "Holds Not Empty*"
			gosub :switchboard~switchboard
			halt
		end
	end
end

gosub :planet~getplanetinfo

if ($startinglocation = "Citadel")
	send "C"
	waiton "Citadel command (?=help)"
	send "S* "
else
	send "Q D"
end

waiton "Warps to Sector(s) :"
gosub :player~getinfo

gosub :sector~voidadjacent

setvar $port~startinglocation $startinglocation
gosub :port~getportinfo

if ($port~noport = 0)
	setvar $validportfound true
else
	setvar $validportfound false
end

if ($validportfound <> true)
	setvar $exit_message "No valid port found"
	if ($startinglocation <> "Citadel")
		gosub :planet~landingsub
	end
	gosub :sector~clearvoidadjacent
	goto :buydownexit
end

if ($startinglocation = "Citadel")
	send "Q"
else
	send "L "&$planet~planet&"* "
end

waiton "Planet command (?="
if (haggle)
	setvar $buydown_restore_haggle 1
	autohaggle off
end

setvar $player~turns_needed 0
setvar $player~turns_allowed $player~turns
subtract $player~turns_allowed 1

if ($buydown_fuelrounds > 0)
	setvar $fuelrounds 0
	setvar $planet~planetfuelroom $planet~planet_fuel_max
	subtract $planet~planetfuelroom $planet~planet_fuel
	setvar $maxfueltobuy 0
	if ($port~orebuying = "Selling")
		setvar $maxfueltobuy $port~oretrading
		if ($maxfueltobuy > $planet~planetfuelroom)
			setvar $maxfueltobuy $planet~planetfuelroom
		end
	end
	setvar $maxfuelrounds $maxfueltobuy
	divide $maxfuelrounds $player~total_holds
	if ($maxfuelrounds > $player~turns_allowed)
		setvar $maxfuelrounds $player~turns_allowed
	end
	if ($maxfuelrounds > $buydown_fuelrounds)
		setvar $maxfuelrounds $buydown_fuelrounds
	end
	if ($maxfuelrounds > 0)
		setvar $fuelrounds $maxfuelrounds
	end
	add $player~turns_needed $fuelrounds
	subtract $player~turns_allowed $fuelrounds
end

if ($buydown_orgrounds > 0)
	setvar $orgrounds 0
	setvar $planet~planetorgroom $planet~planet_organics_max
	subtract $planet~planetorgroom $planet~planet_organics
	setvar $maxorgtobuy 0
	if ($port~orgbuying = "Selling")
		setvar $maxorgtobuy $port~orgtrading
		if ($maxorgtobuy > $planet~planetorgroom)
			setvar $maxorgtobuy $planet~planetorgroom
		end
	end
	setvar $maxorgrounds $maxorgtobuy
	divide $maxorgrounds $player~total_holds
	if ($maxorgrounds > $player~turns_allowed)
		setvar $maxorgrounds $player~turns_allowed
	end
	if ($maxorgrounds > $buydown_orgrounds)
		setvar $maxorgrounds $buydown_orgrounds
	end
	if ($maxorgrounds > 0)
		setvar $orgrounds $maxorgrounds
	end
	add $player~turns_needed $orgrounds
	subtract $player~turns_allowed $orgrounds
end

if ($buydown_equiprounds > 0)
	setvar $equiprounds 0
	setvar $planet~planetequiproom $planet~planet_equipment_max
	subtract $planet~planetequiproom $planet~planet_equipment
	setvar $maxequiptobuy 0
	if ($port~equbuying = "Selling")
		setvar $maxequiptobuy $port~equtrading
		if ($maxequiptobuy > $planet~planetequiproom)
			setvar $maxequiptobuy $planet~planetequiproom
		end
	end
	setvar $maxequiprounds $maxequiptobuy
	divide $maxequiprounds $player~total_holds
	if ($maxequiprounds > $player~turns_allowed)
		setvar $maxequiprounds $player~turns_allowed
	end
	if ($maxequiprounds > $buydown_equiprounds)
		setvar $maxequiprounds $buydown_equiprounds
	end
	if ($maxequiprounds > 0)
		setvar $equiprounds $maxequiprounds
	end
	add $player~turns_needed $equiprounds
	subtract $player~turns_allowed $equiprounds
end

if (($fuelrounds = 0) and (($orgrounds = 0) and ($equiprounds = 0)))
	if ($startinglocation = "Citadel")
		send "C "
	else
		send "q "
	end
	setvar $exit_message "Nothing to buy"
	gosub :sector~clearvoidadjacent
	goto :buydownexit
end

:getmode
if ($buydown_mode = 1)
	setvar $buydown_mode "Speedbuy"
elseif ($buydown_mode = 2)
	setvar $buydown_mode "Best Price"
	setvar $bot~worstprice false
	savevar $bot~worstprice
elseif ($buydown_mode = 3)
	setvar $buydown_mode "Worst Price"
end
send "'*{" $bot~bot_name "}*Buying down using "&$buydown_mode&"*" $fuelrounds&" rounds of fuel*" $orgrounds&" rounds of org*" $equiprounds&" rounds of equip**"
setvar $fuelroundsleft $fuelrounds
setvar $orgroundsleft $orgrounds
setvar $equiproundsleft $equiprounds
setvar $fuel_creds_needed 0
setvar $org_creds_needed 0
setvar $equip_creds_needed 0

if ($fuelrounds > 0)
	setvar $fuel_creds_needed $fuelrounds
	multiply $fuel_creds_needed $player~total_holds
	multiply $fuel_creds_needed 30
	if ($buydown_mode = "Worst Price")
		multiply $fuel_creds_needed 3
		divide $fuel_creds_needed 2
	end
end
if ($orgrounds > 0)
	setvar $org_creds_needed $orgrounds
	multiply $org_creds_needed $player~total_holds
	multiply $org_creds_needed 60
	if ($buydown_mode = "Worst Price")
		multiply $org_creds_needed 3
		divide $org_creds_needed 2
	end
end
if ($equiprounds > 0)
	setvar $equip_creds_needed $equiprounds
	multiply $equip_creds_needed $player~total_holds
	multiply $equip_creds_needed 100
	if ($buydown_mode = "Worst Price")
		multiply $equip_creds_needed 3
		divide $equip_creds_needed 2
	end
end
setvar $total_creds_needed 0
add $total_creds_needed $fuel_creds_needed
add $total_creds_needed $org_creds_needed
add $total_creds_needed $equip_creds_needed
setvar $startingcredits $player~credits
if ($total_creds_needed > $player~credits)
	setvar $cashonhand $planet~citadel_credits
	add $cashonhand $player~credits
	if ($cashonhand > $total_creds_needed)
		send "C"
		send "T T "&$player~credits&"* "
		send "T F "&$total_creds_needed&"* "
		setvar $player~credits $total_creds_needed
		setvar $switchboard~message "Withdrew funds from the Treasury to complete the buydown*"
		gosub :switchboard~switchboard
		send "Q"
	else
		if ($startinglocation = "Citadel")
			send "C "
		else
			send "q "
		end
		setvar $exit_message "Not enough cash onhand"
		gosub :sector~clearvoidadjacent
		goto :buydownexit
	end
end
setvar $init_credits $player~credits

:buydownequip
if ($equiproundsleft > 0)
	if ($buydown_mode = "Speedbuy")
		send "Q P T  "
	else
		send "Q P T"
	end
	if ($port~orebuying = "Selling")
		send "0* "
	end
	if ($port~orgbuying = "Selling")
		send "0*"
	end
	gosub :choosehaggle
	send "L "&$planet~planet&"* t n l 3* "
	subtract $equiproundsleft 1
	goto :buydownequip
end
if ($equiprounds > 0)
	if ($buydown_mode = "Worst Price")
		setvar $output $output&" - Equipment overhaggled at "&$overhagglemultiple&"*"
	end
end

:buydownorg
if ($orgroundsleft > 0)
	if ($buydown_mode = "Speedbuy")
		send "Q P T  "
	else
		send "Q P T"
	end
	if ($port~orebuying = "Selling")
		send "0*"
	end
	gosub :choosehaggle
	send "0* L "&$planet~planet&"* t n l 2* "
	subtract $orgroundsleft 1
	goto :buydownorg
end
if ($orgrounds > 0)
	if ($buydown_mode = "Worst Price")
		setvar $output $output&" - Organics overhaggled at "&$overhagglemultiple&"*"
	end
end

:buydownfuel
if ($fuelroundsleft > 0)
	if ($buydown_mode = "Speedbuy")
		send "Q P T  "
	else
		send "Q P T"
	end
	gosub :choosehaggle
	send "0* 0* L "&$planet~planet&"* t n l 1* "
	subtract $fuelroundsleft 1
	goto :buydownfuel
end
if ($fuelrounds > 0)
	if ($buydown_mode = "Worst Price")
		setvar $output $output&" - Fuel Ore overhaggled at "&$overhagglemultiple&"*"
	end
end

:buydownfinish
if ($startinglocation = "Citadel")
	send "C "
	waitfor "<Enter Citadel>"
else
	send "Q "
	waitfor "Command [TL="
end

gosub :player~quikstats
setvar $player~credits_spent ($init_credits - $player~credits)

gosub :sector~clearvoidadjacent

if ($startinglocation = "Planet")
	send "L  Z"&#8&#8&$planet~planet&"*  "
end

if (($player~credits > $startingcredits) and ($startinglocation = "Citadel"))
	send "T T "&($player~credits - $startingcredits)&"* "
	setvar $switchboard~message "I put back extra funds taken for buydown.*"
	gosub :switchboard~switchboard
end

setvar $switchboard~message $output&"   *"
if ($player~unlimitedgame)
	setvar $switchboard~message $switchboard~message&" - spent "&$player~credits_spent&" credits - unlimited turns left.*"
else
	setvar $switchboard~message $switchboard~message&" - spent "&$player~credits_spent&" credits - "&$player~turns&" turns left.*"
end
if ($switchboard~self_command <> true)
	setvar $switchboard~self_command 2
end
gosub :switchboard~switchboard
setvar $exit_message "Normal Exit"

setvar $bot~worstprice $original_worstprice_value
savevar $bot~worstprice

:buydownexit
if ($buydown_restore_haggle = 1)
	autohaggle on
end
setvar $switchboard~message "Buy down exiting --- "&$exit_message&"*"
gosub :switchboard~switchboard
halt

:choosehaggle
setvar $player~buydown_return_on_abort true
setvar $player~buydown_aborted false
setvar $player~buydown_mode $buydown_mode
setvar $player~overhagglemultiple $overhagglemultiple
setvar $player~startinglocation $startinglocation
setvar $player~cyclebuffer $cyclebuffer
setvar $player~cyclebufferlimit $cyclebufferlimit
setvar $player~jetbonus $jetbonus

if ($buydown_mode = "Speedbuy")
	gosub :planethaggle~buynohaggle
else
	gosub :planethaggle~buyhaggle
end

setvar $cyclebuffer $player~cyclebuffer
setvar $jetbonus $player~jetbonus
setvar $buyhaggle $player~buyhaggle
setvar $player~buydown_return_on_abort false

if ($player~buydown_aborted = true)
	setvar $player~buydown_aborted false
	setvar $exit_message $player~exit_message
	goto :buydownexit
end
return

:fighter_start
setvar $buys false
setvar $canbuy 0
setvar $fightercreditsstaged false
if ($bot~parm2 = "")
	setvar $bot~parm2 0
end
if ($bot~parm2 = "dump")
	setvar $dumpfigs true
	setvar $amounttobuy 0
end
setvar $amounttobuy $bot~parm2
setvar $buyall false
setvar $totalfigspurchased 0
isnumber $test $amounttobuy
if ($test <> true)
	setvar $buyall true
	setvar $amounttobuy 0
else
	if ($amounttobuy <= 0)
		setvar $buyall true
	end
end
send " q "
gosub :planet~getplanetinfo
send " c "
gosub :ship~getshipstats
setvar $home $player~current_sector

:fighter_rewarp
if (($player~current_sector = $map~alpha_centauri) or ($player~current_sector = $map~rylos))
	if (port.class[$player~current_sector] = 0)
		goto :fighter_already
	end
end

:fighter_sub_fighterbuy
if ($map~alpha_centauri > 0)
	setvar $switchboard~message "Warping Planet to Alpha Centauri*"
	gosub :switchboard~switchboard
	send "p"&$map~alpha_centauri&"*y"
	settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
	settextlinetrigger nowarp :fighter_nowarp "You do not have any fighters in Sector"
	settextlinetrigger nowarp2 :fighter_already "You are already in that sector!"
	pause
else
	setvar $switchboard~message "Alpha Centauri is not defined for this bot*"
	gosub :switchboard~switchboard
	goto :fighter_nowarp
end

:fighter_warpit
send "y "

:fighter_already
killalltriggers
send " s* "
gosub :player~quikstats
if (port.class[$player~current_sector] = 0)
	setvar $buys true
#	send "q m*l* q z* "
	send "q m*l* "
	goto :fighter_arrived
else
	goto :fighter_nowarp
end

:fighter_nofig
:fighter_nowarp
if ($map~alpha_centauri > 0)
	setsectorparameter $map~alpha_centauri "FIGSEC" false
end
killalltriggers

if ($map~rylos > 0)
	send "p"&$map~rylos&"*y"
	settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
	settextlinetrigger nowarp :fighter_nowarp2 "You do not have any fighters in Sector"
	settextlinetrigger nowarp2 :fighter_already "You are already in that sector!"
	pause
else
	setvar $switchboard~message "Rylos is not defined for this bot.*"
	gosub :switchboard~switchboard
	goto :fighter_end
end

:fighter_checkit
killalltriggers
send "s* "
gosub :player~quikstats
if (port.class[$player~current_sector] = 0)
	goto :fighter_arrived
else
	setvar $switchboard~message "No fighter/port at either class 0!*"
	gosub :switchboard~switchboard
	goto :fighter_end
end

:fighter_nowarp2
killalltriggers
if ($map~rylos > 0)
	setsectorparameter $map~rylos "FIGSEC" false
end
setvar $switchboard~message "No fighter at either class 0!*"
gosub :switchboard~switchboard
setvar $buys false
goto :fighter_end

:fighter_arrived
killalltriggers
send "c"
waiton "Citadel treasury contains"
getword currentline $citcreds 4
striptext $citcreds ","
gosub :player~quikstats
setvar $startingcredits $player~credits
send "tt "&$player~credits&"* "
waiton "How much to transfer?"
waiton "Citadel command"
add $citcreds $player~credits
setvar $player~credits 0
setvar $fightercreditsstaged true
send "q m*l*"

:fighter_loop
send "c"
gosub :fighter_gettreasury
setvar $credstoget (999999999 - $fightercurrentcredits)
if ($credstoget < 0)
	setvar $credstoget 0
end
if ($credstoget > $fightertreasury)
	setvar $credstoget $fightertreasury
end
send $credstoget&"*"
setvar $player~credits $fightercurrentcredits
add $player~credits $credstoget
setvar $citcreds $fightertreasury
subtract $citcreds $credstoget

send "q q p t"
settexttrigger buyfiglimp :removelimp "removal? : (Y/N)"
settexttrigger buyfignolimp :buythefigs "credits per fighter"
pause

:removelimp
send "y"
pause

:buythefigs
killtrigger buyfiglimp
getword currentline $canbuy 8
if (($canbuy > 0) and ((($buyall = false) and ($amounttobuy > 0)) or ($buyall = true)))
	setvar $buys true
	if (($buyall = false) and ($amounttobuy < $canbuy))
		send "b "&$amounttobuy&"* q"
		add $totalfigspurchased $amounttobuy
		setvar $amounttobuy 0
	else
		send "b "&$canbuy&"* q"
		add $totalfigspurchased $canbuy
		setvar $amounttobuy ($amounttobuy - $canbuy)
	end
else
	send "q  z* * l "&$planet~planet&"* c"
	setvar $switchboard~message ""&$totalfigspurchased&" Fighters added on planet "&$planet~planet&".*"
	gosub :switchboard~switchboard
	goto :fighter_end
end

:fighter_arrived2
send "l " $planet~planet "*  mnl*"
settexttrigger maxpfighters :fighter_maxpfighters "You can't put more than"
settexttrigger fightersuccess :fighter_loop "Done!"
pause

:fighter_maxpfighters
killalltriggers
send "c"
setvar $buys true
if ($dumpfigs = false)
	goto :fighter_end
end
send "p " $home "*y q"
waiton "You leave the citadel"
send "mnl*"
gosub :planet~getplanetinfo
send "qd"
waiton "Fighters: "
getword currentline $sector_figs 2
striptext $sector_figs ","
setvar $move $planet~planet_fighters
setvar $total_moved 0
setvar $end_figs $sector_figs
add $end_figs $move
send "l " $planet~planet "* "
while ($total_moved < $move)
	add $sector_figs $ship~ship_fighters_max
	if ($sector_figs > $end_figs)
		setvar $sector_figs $end_figs
	end
	send "m  n  t  *  q  f z " &$sector_figs& "*  z c d  *  l " &$planet~planet& "*  "
	add $total_moved $ship~ship_fighters_max
end
send "c"
goto :fighter_rewarp

:fighter_gettreasury
send "tf"
waiton "credits, and the Treasury has"
getword currentline $fightercurrentcredits 3
striptext $fightercurrentcredits ","
getword currentline $fightertreasury 9
striptext $fightertreasury ","
return

:fighter_end
if ($fightercreditsstaged = true)
	gosub :fighter_gettreasury
	setvar $creditrestore ($startingcredits - $fightercurrentcredits)
	if ($creditrestore > $fightertreasury)
		setvar $creditrestore $fightertreasury
	end
	if ($creditrestore < 0)
		setvar $creditrestore 0
	end
	send $creditrestore&"* "
end
if ($buys = false)
	setvar $switchboard~message "No fighters able to be purchased*"
	gosub :switchboard~switchboard
else
	if ($fightercreditsstaged <> true)
		gosub :player~quikstats
	end
	if ($home <> $player~current_sector)
		setvar $switchboard~message "Buy down exiting.  Heading Back to Start Sector*"
		gosub :switchboard~switchboard
		send "p " $home "* y q m * * * c "
	else
		send "q m* * * c '{" $bot~bot_name "} - Buy down exiting.*"
	end
end
halt

:shield_start
setvar $buys false
send "gt"
waiton "and the Shield System"
getword currentline $current_shields 3
divide $current_shields 10
send $current_shields&"*"
send "q"
gosub :planet~getplanetinfo
send "c"
setvar $home $player~current_sector
if ($player~current_sector = $map~alpha_centauri)
	if (port.class[$player~current_sector] = 0)
		goto :shield_arrived
	else
		setvar $switchboard~message "Sector "&$map~alpha_centauri&" has no class 0 port in it!*"
		gosub :switchboard~switchboard
		goto :shield_nowarp
	end
end
killalltriggers

:shield_sub_shieldbuy
if ($player~current_sector = $map~alpha_centauri)
	if (port.class[$player~current_sector] = 0)
		goto :shield_arrived
	end
elseif ($map~alpha_centauri > 0)
	setvar $switchboard~message "Warping Planet to ALPHA*"
	gosub :switchboard~switchboard
	send "p"&$map~alpha_centauri&"*y"
	settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
	settextlinetrigger nowarp :shield_nofig "You do not have any fighters in Sector"
	pause
else
	setvar $switchboard~message "Alpha Centauri is not defined for this bot*"
	gosub :switchboard~switchboard
	goto :shield_nowarp
end

:shield_warpit
killalltriggers
send "y  s*"
gosub :player~quikstats
if (port.class[$player~current_sector] = 0)
	setvar $buys true
	send "q q* "
	goto :shield_arrived
else
	setvar $switchboard~message "Sector "&$map~alpha_centauri&" has no class 0 port in it!*"
	gosub :switchboard~switchboard
end

:shield_nofig
killalltriggers
if ($map~alpha_centauri > 0)
	setsectorparameter $map~alpha_centauri "FIGSEC" false
end
setvar $switchboard~message "No Fighter at Alpha Centauri*"
gosub :switchboard~switchboard

:shield_nowarp
killtrigger warpit
setvar $switchboard~message "Trying Rylos*"
gosub :switchboard~switchboard
if ($map~rylos > 0)
	send "p"&$map~rylos&"*y"
	settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
	settextlinetrigger nowarp :shield_nowarp2 "You do not have any fighters in Sector"
	settextlinetrigger nowarp2 :shield_checkit "You are already in that sector!"
	pause
else
	setvar $switchboard~message "Rylos is not defined for this bot*"
	gosub :switchboard~switchboard
	goto :shield_end
end

:shield_checkit
killalltriggers
send "s* "
gosub :player~quikstats
if (port.class[$player~current_sector] = 0)
	goto :shield_arrived
else
	setvar $switchboard~message "Sector "&$map~rylos&" has no class 0 port in it!*"
	gosub :switchboard~switchboard
	goto :shield_end
end

:shield_nowarp2
killalltriggers
if ($map~rylos > 0)
	setsectorparameter $map~rylos "FIGSEC" false
end
setvar $switchboard~message "No Fighter at either Class 0!*"
gosub :switchboard~switchboard
setvar $buys false
goto :shield_end

:shield_arrived
killalltriggers
send "q  q  z  n  p  t  y"
waiton "C  Shield Points   :"
getword currentline $canbuy 9
if ($canbuy > 0)
	send "c "&$canbuy&"*  q"
elseif ($canbuy = 0)
	setvar $buys true
	send "q l "&$planet~planet&"* c"
	setvar $switchboard~message "Shields maxxed out on planet "&$planet~planet&".*"
	gosub :switchboard~switchboard
	goto :shield_end
end

:shield_arrived2
send "L " $planet~planet "*  cgt"
waiton "and the Shield System"
getword currentline $current_shields 3
divide $current_shields 10
send $current_shields "*"
settexttrigger maxpshields :shield_maxpshields "The planet is limited to"
settexttrigger shieldsuccess :shield_arrived "Citadel command"
pause

:shield_maxpshields
killalltriggers
getword currentline $maxpshields 6
subtract $maxpshields $curpshields
send "gt" $maxpshields "*"
setvar $buys true
setvar $switchboard~message "Shields maxxed out on planet "&$planet~planet&".*"
gosub :switchboard~switchboard
goto :shield_end

:shield_end
if ($buys = false)
	setvar $switchboard~message "No shields able to be purchased*"
	gosub :switchboard~switchboard
else
	gosub :player~quikstats
	if ($home <> $player~current_sector)
		setvar $switchboard~message "Buy down exiting.  Heading Back to Start Sector*"
		gosub :switchboard~switchboard
		send "p " $home "*  y"
	else
		setvar $switchboard~message "Buy down exiting.*"
		gosub :switchboard~switchboard
	end
end
halt

# includes:
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\sector"
include "source\include\help"
include "source\include\switchboard.ts"
