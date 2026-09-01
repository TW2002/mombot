logging off
gosub :loadvars~loadvars

gosub :help~initialize
setvar $help~help[1]  $help~tab&"MOVE - Product Mover"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"    move [type] [planet|all] [rounds|amount]"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"    [type] - use [f]uel, [o]rg, [e]quip, [fig]hters, [cr]eds"
setvar $help~help[6]  $help~tab&"    [type] - use [fc] fuel colo, [oc] org colo, [ec] equip colo"
setvar $help~help[7]  $help~tab&"    [planet] planet to move to, or [all] for every planet in sector"
setvar $help~help[8]  $help~tab&"    [rounds] number of rounds to move product / colonists"
gosub :help~helpfile

killalltriggers
setvar $stuffmoved ""
setvar $rounds 0
setvar $moveextra 0
setvar $movealldestinations false
gosub :player~quikstats
setvar $startlocation $player~current_prompt
if (($startlocation <> "Citadel") and ($startlocation <> "Planet"))
	setvar $switchboard~message "Mover must be run from Citadel or Planet prompt.*"
	gosub :switchboard~switchboard
	halt
end
if ($parm1 = "f")
	setvar $stuffmoved "Fuel"
elseif ($parm1 = "o")
	setvar $stuffmoved "Organics"
elseif ($parm1 = "e")
	setvar $stuffmoved "Equipment"
elseif ($parm1 = "fc")
	setvar $stuffmoved "Fuel Colonists"
elseif ($parm1 = "oc")
	setvar $stuffmoved "Organic Colonists"
elseif ($parm1 = "ec")
	setvar $stuffmoved "Equipment Colonists"
elseif ($parm1 = "fig") or ($parm1 = "figs")
	setvar $stuffmoved "Fighters"
elseif ($parm1 = "cr") or ($parm1 = "creds")
	setvar $stuffmoved "Creds"
else
	setvar $switchboard~message "Please use move [f/o/e/fc/oc/ec/fig] [planet] {[rounds]|[amount]} format*"
	gosub :switchboard~switchboard
	halt
end
if ($parm2 = "all")
	setvar $movealldestinations true
else
	isnumber $test $parm2
	if ($test = false)
		setvar $switchboard~message "Mover Planet Parameter in-valid*"
		gosub :switchboard~switchboard
		halt
	end
end
setvar $moveall false
setvar $moveamount 0
isnumber $test $parm3
if ($test = false)
	if (($parm3 = "") and ($movealldestinations = false))
		setvar $moveall true
	else
		setvar $switchboard~message "Mover Rounds Parameter in-valid*"
		gosub :switchboard~switchboard
		halt
	end
elseif ($parm3 <= 0)
	setvar $switchboard~message "Must choose more than 0 rounds to move*"
	gosub :switchboard~switchboard
	halt
elseif ($movealldestinations = true)
	setvar $moveamount $parm3
	setvar $moveholds 0
	setvar $moveextra 0
elseif ($stuffmoved = "Fighters") or ($stuffmoved = "Creds")
	setvar $moveamount $parm3
	setvar $moveholds 0
	setvar $moveextra 0
elseif ($parm3 > 1000)
	gosub :player~quikstats
	if ($player~total_holds <= 0)
		setvar $switchboard~message "Unable to determine ship holds from stats.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $moveholds ($parm3 / $player~total_holds)
	setvar $moveextra ($parm3 - ($player~total_holds * $moveholds))
	setvar $movetrips $moveholds
	if ($moveextra > 0)
		add $movetrips 1
	end
	setvar $switchboard~message "Moving " & $movetrips & " holds (" & $parm3 & " total).*"
	gosub :switchboard~switchboard
else
	setvar $moveholds $parm3
	setvar $moveextra 0
end
if (($movealldestinations = true) and (($stuffmoved = "Fighters") or ($stuffmoved = "Creds") or ($stuffmoved = "Fuel Colonists") or ($stuffmoved = "Organic Colonists") or ($stuffmoved = "Equipment Colonists")))
	setvar $switchboard~message "Mover [all] destination is only supported for fuel, organics, or equipment.*"
	gosub :switchboard~switchboard
	halt
end
if ($startlocation = "Citadel")
	send "q"
end

#send "q  j  y l "&$parm2&" *  "

:startmover
gosub :getplanetinfo
if (($moveall = true) and (($stuffmoved = "Fuel Colonists") or ($stuffmoved = "Organic Colonists") or ($stuffmoved = "Equipment Colonists")))
	gosub :getplanetcolonistinfo
end
if ($stuffmoved = "Fighters")
	loadvar $ship~ship_fighters_max
	isnumber $test $ship~ship_fighters_max
	if (($test = false) or ($ship~ship_fighters_max <= 0))
		if ($citadel > 0)
			send "c"
			waiton "Citadel command"
			gosub :ship~getshipstats
			send "q"
			waiton "Planet command"
		end
		isnumber $test $ship~ship_fighters_max
		if (($test = false) or ($ship~ship_fighters_max <= 0))
			setvar $switchboard~message "Unable to determine ship fighter capacity.*"
			gosub :switchboard~switchboard
			halt
		end
	end
	if ($moveall = true)
		setvar $parm3 0
		setvar $fighterstomove $planet_fighters
		if ($player~fighters > 0)
			add $parm3 1
			if ($ship~ship_fighters_max > $player~fighters)
				setvar $freeshipfighters $ship~ship_fighters_max - $player~fighters
				if ($freeshipfighters >= $fighterstomove)
					setvar $fighterstomove 0
				else
					subtract $fighterstomove $freeshipfighters
				end
			end
		end
		if ($ship~ship_fighters_max > 0)
			setvar $moveholds ($fighterstomove / $ship~ship_fighters_max)
			setvar $moveextra $fighterstomove - ($moveholds * $ship~ship_fighters_max)
			add $parm3 $moveholds
			if ($moveextra > 0)
				add $parm3 1
			end
		elseif ($fighterstomove > 0)
			add $parm3 1
		end
	end
#	goto :movefighters
elseif (($stuffmoved = "Fuel") or ($stuffmoved = "Fuel Colonists"))
	setvar $stuff 1
	if ($moveall = true)
		if ($stuffmoved = "Fuel Colonists")
			setvar $moveholds ($planet_fuel_colonists / $player~total_holds)
			setvar $moveextra $planet_fuel_colonists - ($moveholds * $player~total_holds)
		else
			setvar $moveholds ($planet_fuel / $player~total_holds)
			setvar $moveextra $planet_fuel - ($moveholds * $player~total_holds)
		end
	end
elseif (($stuffmoved = "Organics") or ($stuffmoved = "Organic Colonists"))
	setvar $stuff 2
	if ($moveall = true)
		if ($stuffmoved = "Organic Colonists")
			setvar $moveholds ($planet_organics_colonists / $player~total_holds)
			setvar $moveextra $planet_organics_colonists - ($moveholds * $player~total_holds)
		else
			setvar $moveholds ($planet_organics / $player~total_holds)
			setvar $moveextra $planet_organics - ($moveholds * $player~total_holds)
		end
	end
elseif (($stuffmoved = "Equipment") or ($stuffmoved = "Equipment Colonists"))
	setvar $stuff 3
	if ($moveall = true)
		if ($stuffmoved = "Equipment Colonists")
			setvar $moveholds ($planet_equipment_colonists / $player~total_holds)
			setvar $moveextra $planet_equipment_colonists - ($moveholds * $player~total_holds)
		else
			setvar $moveholds ($planet_equipment / $player~total_holds)
			setvar $moveextra $planet_equipment - ($moveholds * $player~total_holds)
		end
	end
end
if ($movealldestinations = true)
	gosub :moveallplanets
	halt
end
getwordpos $stuffmoved $pos "Colonists"
if ($pos > 0)
	#send "q  j  y l "&$planet&" *  "
	#goto :movecolonists
	setvar $planet~planettofill $parm2
	setvar $planet~moveholds $moveholds
	setvar $planet~moveextra $moveextra
	setvar $planet~moveamount 0
	setvar $planet~type "s"
	setvar $planet~category $stuff
	gosub :planet~moveproduct
elseif ($stuffmoved = "Fighters")
	setvar $planet~planettofill $parm2
	setvar $planet~moveholds $moveholds
	setvar $planet~moveextra $moveextra
	setvar $planet~moveamount $moveamount
	setvar $planet~type "m"
	setvar $planet~category 4
	gosub :planet~moveproduct
elseif ($stuffmoved = "Creds")
	setvar $planet~planettofill $parm2
	setvar $planet~moveamount $moveamount
	setvar $planet~category 6
	gosub :planet~moveproduct
else
	#send "q  j  y l "&$planet&" *  "
	#goto :moveproduct
	setvar $planet~planettofill $parm2
	setvar $planet~moveholds $moveholds
	setvar $planet~moveextra $moveextra
	setvar $planet~moveamount 0
	setvar $planet~type "t"
	setvar $planet~category $stuff
	gosub :planet~moveproduct
end

if ($startlocation = "Citadel")
	send "c"
end
if ($planet~movesuccess = false)
	setvar $switchboard~message "Move failed: "&$planet~moveerror&"*"
	gosub :switchboard~switchboard
	halt
end
if ($moveall = true)
	setvar $switchboard~message "Moved all "&$stuffmoved&" from "&$planet&" to "&$parm2&".*"
	gosub :switchboard~switchboard
elseif ($parm3 > 1000)
	setvar $switchboard~message "Moved "&$parm3&" total "&$stuffmoved&" from "&$planet&" to "&$parm2&".*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Moved "&$parm3&" loads of "&$stuffmoved&" from "&$planet&" to "&$parm2&".*"
	gosub :switchboard~switchboard
end
halt

:moveallplanets
setvar $moveall_startingplanet $planet
setvar $moveall_sector $player~current_sector
setvar $moveall_amount $parm3
setvar $moveall_totalmoved 0
setvar $moveall_movedplanets 0
setarray $moveall_target 2000
setvar $moveall_targetcount 0
gosub :planet~getplanets
setvar $moveall_i 1
while ($moveall_i <= $planet~planetlistcount)
	if (($planet~planetlist[$moveall_i][1] = $moveall_sector) and ($planet~planetlist[$moveall_i] <> $moveall_startingplanet))
		add $moveall_targetcount 1
		setvar $moveall_target[$moveall_targetcount] $planet~planetlist[$moveall_i]
	end
	add $moveall_i 1
end
if ($moveall_targetcount <= 0)
	if ($startlocation = "Citadel")
		send "c"
		waiton "Citadel command"
	end
	setvar $switchboard~message "No destination planets found in sector "&$moveall_sector&".*"
	gosub :switchboard~switchboard
	return
end
gosub :getplanetinfo
gosub :moveall_sourceamount
setvar $moveall_i 1
while (($moveall_i <= $moveall_targetcount) and ($moveall_sourceamount > 0))
	setvar $moveall_before $moveall_sourceamount
	setvar $planet~planettofill $moveall_target[$moveall_i]
	setvar $planet~moveholds 0
	setvar $planet~moveextra 0
	setvar $planet~moveamount $moveall_amount
	setvar $planet~type "t"
	setvar $planet~category $stuff
	gosub :planet~moveproduct
	#if ($planet~movesuccess = false)
		#if ($startlocation = "Citadel")
		#	send "c"
		#	waiton "Citadel command"
		#end
		#setvar $switchboard~message "Move all failed at planet "&$moveall_target[$moveall_i]&": "&$planet~moveerror&"*"
		#gosub :switchboard~switchboard
		#return
	#end
	gosub :getplanetinfo
	gosub :moveall_sourceamount
	add $moveall_movedplanets 1
	setvar $moveall_moved ($moveall_before - $moveall_sourceamount)
	if ($moveall_moved > 0)
		add $moveall_totalmoved $moveall_moved
	end
	add $moveall_i 1
end
if ($startlocation = "Citadel")
	send "c"
	waiton "Citadel command"
end
if ($moveall_sourceamount <= 0)
	setvar $switchboard~message "Moved "&$moveall_totalmoved&" total "&$stuffmoved&" to "&$moveall_movedplanets&" planets; starting planet is out.*"
else
	setvar $switchboard~message "Moved "&$moveall_amount&" "&$stuffmoved&" to "&$moveall_movedplanets&" planets ("&$moveall_totalmoved&" total).*"
end
gosub :switchboard~switchboard
return

:moveall_sourceamount
if ($stuffmoved = "Fuel")
	setvar $moveall_sourceamount $planet_fuel
elseif ($stuffmoved = "Organics")
	setvar $moveall_sourceamount $planet_organics
elseif ($stuffmoved = "Equipment")
	setvar $moveall_sourceamount $planet_equipment
else
	setvar $moveall_sourceamount 0
end
return

:getinfo
gosub :player~getinfo
setvar $trader_name $player~trader_name
setvar $corpstring $player~corpstring
setvar $igstat $player~igstat
setvar $turns_per_warp $player~turns_per_warp
setvar $twarp_1_range $player~twarp_1_range
setvar $twarp_2_range $player~twarp_2_range
setvar $empty_holds $player~empty_holds
return

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
setvar $planet_fuel $planet~planet_fuel
setvar $planet_fuel_max $planet~planet_fuel_max
setvar $planet_organics $planet~planet_organics
setvar $planet_organics_max $planet~planet_organics_max
setvar $planet_equipment $planet~planet_equipment
setvar $planet_equipment_max $planet~planet_equipment_max
setvar $planet_fighters $planet~planet_fighters
setvar $planet_fighters_max $planet~planet_fighters_max
setvar $citadel $planet~citadel
setvar $citadel_credits $planet~citadel_credits
setvar $atmosphere_cannon $planet~atmosphere_cannon
setvar $sector_cannon $planet~sector_cannon
return

:getplanetcolonistinfo
gosub :planet~getplanetinfo
setvar $planet_fuel_colonists $planet~planet_fuel_colonists
setvar $planet_organics_colonists $planet~planet_organics_colonists
setvar $planet_equipment_colonists $planet~planet_equipment_colonists
return

:setplanetnumber
getwordpos rawpacket $pos "Planet "&#27&"[1;33m#"&#27&"[36m"
if ($pos > 0)
	gettext rawpacket $planet "Planet "&#27&"[1;33m#"&#27&"[36m" #27&"[0;32m in sector "
end
settextlinetrigger getplanetnumber :setplanetnumber " in sector "
pause

:setshipoffensiveodds
getwordpos currentansiline $pos "[0;31m:[1;36m1"
if ($pos > 0)
	gettext currentansiline $ship_offensive_odds "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
	striptext $ship_offensive_odds "."
	striptext $ship_offensive_odds " "
	gettext currentansiline $ship_fighters_max "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
	striptext $ship_fighters_max ","
	striptext $ship_fighters_max " "
end
settextlinetrigger getshipstats :setshipoffensiveodds "Offensive Odds: "
pause

:setshipmaxfigattack
getwordpos currentansiline $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($pos > 0)
	gettext currentansiline $ship_max_attack "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
	striptext $ship_max_attack " "
end
settextlinetrigger getshipmaxfighters :setshipmaxfigattack " TransWarp Drive:   "
pause

include "source\include\planet"
include "source\include\ship"
include "source\include\loadvars.ts"
include "source\include\help.ts"
include "source\include\switchboard.ts"
