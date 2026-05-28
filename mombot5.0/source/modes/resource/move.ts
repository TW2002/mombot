logging off
gosub :loadvars~loadvars

gosub :help~initialize
setvar $help~help[1]  $help~tab&"MOVE - Product Mover"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"    move [type] [planet] [rounds]"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"    [type] - use [f]uel, [o]rg, [e]quip, [fig]hters"
setvar $help~help[6]  $help~tab&"    [type] - use [fc] fuel colo, [oc] org colo, [ec] equip colo"
setvar $help~help[7]  $help~tab&"    [planet] planet to move to"
setvar $help~help[8]  $help~tab&"    [rounds] number of rounds to move product / colonists"
gosub :help~helpfile

killalltriggers
setvar $stuffmoved ""
setvar $rounds 0
setvar $moveextra 0
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
else
	setvar $switchboard~message "Please use move [f/o/e/fc/oc/ec/fig] [planet] {[rounds]|[amount]} format*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $parm2
if ($test = false)
	setvar $switchboard~message "Mover Planet Parameter in-valid*"
	gosub :switchboard~switchboard
	halt
end
setvar $moveall false
setvar $moveamount 0
isnumber $test $parm3
if ($test = false)
	if ($parm3 = "")
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
elseif ($stuffmoved = "Fighters")
	setvar $moveamount $parm3
	setvar $moveholds 0
	setvar $moveextra 0
	setvar $switchboard~message "Moving " & $parm3 & " total fighters.*"
	gosub :switchboard~switchboard
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
if ($startlocation = "Citadel")
	send "q"
end

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
	goto :movefighters
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
getwordpos $bot~user_command_line $pos "c"
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
elseif ($stuffmoved <> "Fighters")
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
goto :movedone

:movefighters
setvar $planet~planettofill $parm2
setvar $planet~moveholds $moveholds
setvar $planet~moveextra $moveextra
setvar $planet~moveamount $moveamount
setvar $planet~type "m"
setvar $planet~category 4
gosub :planet~moveproduct

#:movefighters
#if ($rounds < $parm3)
#	send "m  n  *  *  q  l  "&$parm2&"*  m  n  l  *  q  l  "&$planet&"*  "
#	add $rounds 1
#	goto :movefighters
#elseif ($rounds < 1)
#	goto :movedone
#end

:movedone
if ($startlocation = "Citadel")
	send "c"
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
