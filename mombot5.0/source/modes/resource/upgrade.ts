gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Upgrades planets using products and colonists in sector."
setvar $help~help[2]  $help~tab&"Products and Colos must on a port or planet in sector"
setvar $help~help[3]  $help~tab&" "
setvar $help~help[4]  $help~tab&"   Usage:   "
setvar $help~help[5]  $help~tab&" "
setvar $help~help[6]  $help~tab&"   >upgrade   "
setvar $help~help[7]  $help~tab&"   >upgrade 4 6 10"
setvar $help~help[8]  $help~tab&"   >upgrade ignore 3 7 11"
setvar $help~help[9]  $help~tab&" "
setvar $help~help[10]  $help~tab&"   Upgrades all planets in sector by default. "
setvar $help~help[11]  $help~tab&"   {planets} will only upgrade the specified planets"
setvar $help~help[12]  $help~tab&"   {ignore [planets]} will skip the specified planets"
gosub :help~helpfile

gosub :player~quikstats
setvar $startingprompt $player~current_prompt
if ($startingprompt = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q"
elseif ($startingprompt = "Planet")
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q"
elseif ($startingprompt <> "Command")
	setvar $switchboard~message "Upgrade must be run from Command, Planet, or Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $user_command_line $pos "ignore"
if ($pos > 0)
	setvar $ignore 1
else
	setvar $ignore 0
end

if ($ignore = 1)
	setvar $startarg 1
else
	setvar $startarg 0
end

setarray $planetloop~ignorelist 8
setarray $upgrade~cacheplanet 2000
setarray $upgrade~cachesector 2000
setarray $upgrade~cacheamount 2000 3
setarray $upgrade~cachecolo 2000 3
setvar $upgrade~cachecount 0

setvar $index $startarg
while ($index < 8)
	add $index 1
	getword $user_command_line $tmp $index
	isnumber $isnumber $tmp
	if ($isnumber = 0)
		goto :end_ignoreloop
	end
	if ($tmp < 2)
		goto :end_ignoreloop
	end
	setvar $planetloop~ignorelist[$index] $tmp
	add $index 1
	setvar $isnumber 0
end
:end_ignoreloop
#loadvar $MASSUPGRADESAVED

send "@"
waiton "Average Interval Lag:"

setvar $gameprefs~bank "MassUpgrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
#setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

if ($sector = 0)
	send "d"
	settextlinetrigger getsector :getsector "Sector  : "
	pause

	:getsector
	getword currentline $sector 3
	waiton "Command [TL="
end

if (sector.planetcount[$sector] = 0)
	return
end

send "jy"
gosub :player~quikstats
setvar $holds $player~total_holds

setvar $planetloop~loopsub ":CHECKPLANET"
setvar $planetloop~ignorelist $ignorelist
setvar $planetupgrade~failed 0

logging off
gosub :sector~voidadjacent
gosub :planetloop
#setvar $gameprefs~abortdisplayall[$gameprefs~bank] "SPACE"
#gosub :gameprefs~setgameprefs
gosub :sector~clearvoidadjacent

logging on

if ($planetupgrade~failed = 0)
	setvar $switchboard~message "Successfully upgraded all planets in sector " $sector ".*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Unable to upgrade all planets in sector " $sector ".*"
	gosub :switchboard~switchboard
end
halt

:checkplanet
setvar $planetupgrade~planetid $planetloop~id
setvar $planetupgrade~sector $sector
setvar $planetupgrade~seek $seek
gosub :planetupgrade
return

:planetloop
setvar $planetloop~i 1
setvar $planetloop~ignorecount 0

:planetloop_i
getword $planetloop~ignorelist $planetloop~ignore[$planetloop~i] $planetloop~i
if ($planetloop~ignore[$planetloop~i] <> 0)
	add $planetloop~i 1
	add $planetloop~ignorecount 1
	goto :planetloop_i
end
setvar $planetloop~ignorelist ""

setvar $planetloop~found 0
send "l"

settextlinetrigger noplanet :planetloop_noplanet "There isn't a planet in this sector."
settextlinetrigger multipleplanets :planetloop_multipleplanets "Registry# and Planet Name"
settextlinetrigger singleplanet :planetloop_singleplanet "Landing sequence engaged..."
pause

:planetloop_noplanet
killtrigger multipleplanets
killtrigger singleplanet
return

:planetloop_multipleplanets
killtrigger singleplanet
killtrigger noplanet
setvar $planetloop~lastid 0

:planetloop_nextplanet
settexttrigger planetschecked :planetloop_planetschecked "Land on which planet <Q to abort>"
settextlinetrigger getid :planetloop_getid "<"
pause

:planetloop_getid
getword currentline $planetloop~word 1
if ($planetloop~word = "Owned")
	settextlinetrigger getid :planetloop_getid "<"
	pause
end

killtrigger planetschecked
setvar $planetloop~line currentline
striptext $planetloop~line "<"
striptext $planetloop~line ">"
getword $planetloop~line $planetloop~id 1
if ($planetloop~id = "Land")
	goto :planetloop_planetschecked
end

gosub :planetloop_sub_checkignore

if (($planetloop~id > $planetloop~lastid) and ($planetloop~ignore = 0))
	send $planetloop~id "*"
	setvar $planetloop~lastid $planetloop~id
	gosub :planetloop_sub_check

	if ($planetloop~found <> 0)
		return
	end

	send "ql"
	waitfor "Registry# and Planet Name"
end
goto :planetloop_nextplanet

:planetloop_planetschecked
killtrigger getid
send "q*"
return

:planetloop_singleplanet
killtrigger multipleplanets
killtrigger noplanet
gosub :planetloop_sub_check
if ($planetloop~found = 0)
	send "q"
end
return

:planetloop_sub_check
settextlinetrigger check_getplanet :planetloop_check_getplanet "Planet #"
settexttrigger check_planetprompt :planetloop_displayplanet "Planet command (?=help)"
pause

:planetloop_displayplanet
killtrigger check_getplanet
send "*"
settextlinetrigger check_getplanet :planetloop_check_getplanet "Planet #"
pause

:planetloop_check_getplanet
killtrigger check_planetprompt
getword currentline $planetloop~check_planet 2
striptext $planetloop~check_planet "#"

setvar $planetloop~id $planetloop~check_planet
gosub :planetloop_sub_checkignore

if ($planetloop~ignore = 0)
	gosub $planetloop~loopsub
end

return

:planetloop_sub_checkignore
setvar $planetloop~j 1
setvar $planetloop~ignore 0

:planetloop_j
if ($planetloop~j <= $planetloop~ignorecount)
	if ($planetloop~ignore[$planetloop~j] = $planetloop~id)
		setvar $planetloop~ignore 1
	else
		add $planetloop~j 1
		goto :planetloop_j
	end
end

return

:planetupgrade
setvar $planetupgrade~failed 0

setvar $planet~noheader 1
gosub :planet~planetinfo
setvar $upgrade~cacheplanetid $planetupgrade~planetid
setvar $upgrade~cachesectorid $planetupgrade~sector
gosub :upgrade_cacheplanet
setvar $planetupgrade~level $planet~citadel

setvar $best 0
setvar $bestscore 500000

if ($planet~planet_fuel_rate <> "N/A")
	if (($planet~planet_fuel_colonists / $planet~planet_fuel_rate) <= ($planet~planet_fuel_prod + 1))
		if ($planet~planet_fuel_rate < $bestscore)
			setvar $best 1
			setvar $bestscore $planet~planet_fuel_rate
		end
	end
end

if ($planet~planet_organics_rate <> "N/A")
	if (($planet~planet_organics_colonists / $planet~planet_organics_rate) <= ($planet~planet_organics_prod + 1))
		if ($planet~planet_organics_rate < $bestscore)
			setvar $best 2
			setvar $bestscore $planet~planet_organics_rate
		end
	end
end

if ($planet~planet_equipment_rate <> "N/A")
	if (($planet~planet_equipment_colonists / $planet~planet_equipment_rate) <= ($planet~planet_equipment_prod + 1))
		if ($planet~planet_equipment_rate < $bestscore)
			setvar $best 3
			setvar $bestscore $planet~planet_equipment_rate
		end
	end
end

if ($best = 0)
	setvar $dropcategory 1
else
	setvar $dropcategory $best
end

setvar $planetupgrade~destcategory $dropcategory

if (($planet~under_construction = true) or (($planet~buildtime > 0) or ($planetupgrade~level = 6)))
	return
end

if ($planetupgrade~level = 0)
	send "cy"
else
	send "cuyq"
end

settextlinetrigger cantupgrade :planetupgrade_cantupgrade "This Citadel cannot be upgraded further."
settextlinetrigger canupgrade :planetupgrade_canupgrade "the following:"
pause

:planetupgrade_cantupgrade
killtrigger canupgrade
return

:planetupgrade_canupgrade
killtrigger cantupgrade
settextlinetrigger getcolos :planetupgrade_getcolos "Colonists to support the construction,"
settextlinetrigger getfuel :planetupgrade_getfuel "units of Fuel Ore,"
settextlinetrigger getorg :planetupgrade_getorg "units of Organics,"
settextlinetrigger getequip :planetupgrade_getequip "units of Equipment and"
settextlinetrigger getdays :planetupgrade_getdays "days to construct."
pause

:planetupgrade_getcolos
getword currentline $planetupgrade~colosneeded 1
pause

:planetupgrade_getfuel
getword currentline $planetupgrade~fuelneeded 1
pause

:planetupgrade_getorg
getword currentline $planetupgrade~orgneeded 1
pause

:planetupgrade_getequip
getword currentline $planetupgrade~equipneeded 1
pause

:planetupgrade_getdays
getword currentline $planetupgrade~daysneeded 1
striptext $planetupgrade~colosneeded ","
striptext $planetupgrade~fuelneeded ","
striptext $planetupgrade~orgneeded ","
striptext $planetupgrade~equipneeded ","
divide $planetupgrade~colosneeded 1000

setvar $planetupgrade~totalcolos ($planet~colo[1] + ($planet~colo[2] + $planet~colo[3]))
subtract $planetupgrade~colosneeded $planetupgrade~totalcolos
subtract $planetupgrade~fuelneeded $planet~amount[1]
subtract $planetupgrade~orgneeded $planet~amount[2]
subtract $planetupgrade~equipneeded $planet~amount[3]

if (($planetupgrade~colosneeded <= 0) and (($planetupgrade~fuelneeded <= 0) and (($planetupgrade~orgneeded <= 0) and ($planetupgrade~equipneeded <= 0))))
	if ($planetupgrade~daysneeded = 0)
		setdelaytrigger upgradepause :planetupgrade_upgradepause 1000
		pause

		:planetupgrade_upgradepause
		send "d"
		goto :planetupgrade
	end

	return
end

send "q"

if ($planetupgrade~fuelneeded > 0)
	setvar $gather~sector $planetupgrade~sector
	setvar $gather~product 1
	setvar $gather~stayonplanet 0
	setvar $gather~ignorelist $planetupgrade~planetid
	setvar $gather~planetid $planetupgrade~planetid
	setvar $gather~quantity $planetupgrade~fuelneeded
	setvar $gather~seek $planetupgrade~seek
	gosub :gather

	if ($gather~failed)
		setvar $planetupgrade~failed 1
		return
	end
end

if ($planetupgrade~orgneeded > 0)
	setvar $gather~sector $planetupgrade~sector
	setvar $gather~product 2
	setvar $gather~stayonplanet 0
	setvar $gather~ignorelist $planetupgrade~planetid
	setvar $gather~planetid $planetupgrade~planetid
	setvar $gather~quantity $planetupgrade~orgneeded
	setvar $gather~seek $planetupgrade~seek
	gosub :gather

	if ($gather~failed)
		setvar $planetupgrade~failed 1
		return
	end
end

if ($planetupgrade~equipneeded > 0)
	setvar $gather~sector $planetupgrade~sector
	setvar $gather~product 3
	setvar $gather~stayonplanet 0
	setvar $gather~ignorelist $planetupgrade~planetid
	setvar $gather~planetid $planetupgrade~planetid
	setvar $gather~quantity $planetupgrade~equipneeded
	setvar $gather~seek $planetupgrade~seek
	gosub :gather

	if ($gather~failed)
		setvar $planetupgrade~failed 1
		return
	end
end

if ($planetupgrade~colosneeded > 0)
	setvar $gather~sector $planetupgrade~sector
	setvar $gather~product "C"
	setvar $gather~stayonplanet 0
	setvar $gather~ignorelist $planetupgrade~planetid
	setvar $gather~quantity $planetupgrade~colosneeded
	setvar $gather~planetid $planetupgrade~planetid
	setvar $gather~destcategory $planetupgrade~destcategory
	setvar $gather~seek $planetupgrade~seek
	gosub :gather

	if ($gather~failed)
		setvar $planetupgrade~failed 1
		return
	end
end

send "l " $planetupgrade~planetid "*"
goto :planetupgrade

:gather
setvar $gather~gathered 0
setvar $gather~failed 0

if ($gather~holds = 0)
	gosub :player~quikstats
	setvar $gather~holds $player~total_holds
end

:gather_gogather
if (($gather~quantity - $gather~gathered) < $gather~holds)
	setvar $gather~get ($gather~quantity - $gather~gathered)
else
	setvar $gather~get $gather~holds
end

if ($gather~seek)
	setvar $move~checksub ":GATHER_CHECKSECTOR"
	send "d"
	gosub :move~move
else
	gosub :upgrade_findcachedproduct

	if ($upgrade~cachefound <> 0)
		setvar $findproduct~location $upgrade~cachefound
		setvar $findproduct~category $upgrade~cachecategory
	else
		setvar $findproduct~quantity $gather~get
		setvar $findproduct~product $gather~product
		setvar $findproduct~ignorelist $gather~ignorelist
		setvar $findproduct~stayonplanet 1
		setvar $findproduct~sector $gather~sector

		gosub :findproduct~findproduct

		setvar $gather~ignorelist $findproduct~ignorelist

		if (($findproduct~location <> 0) and ($findproduct~location <> "P"))
			setvar $upgrade~cacheplanetid $findproduct~location
			setvar $upgrade~cachesectorid $gather~sector
			gosub :upgrade_cacheplanet
		end
	end

	if ($findproduct~location = 0)
		setvar $gather~failed 1
		send "t"
		return
	end

	setvar $gather~sourcesector $gather~sector
	setvar $gather~found $findproduct~location
end

if ($gather~product = "C")
	setvar $sourcecategory $findproduct~category
	setvar $destcategory $gather~destcategory
end

setvar $source $gather~found
setvar $sourcesector $gather~sourcesector
setvar $dest $gather~planetid
setvar $destsector $gather~sector
setvar $product $gather~product
setvar $quantity ($gather~quantity - $gather~gathered)
setvar $safe 0
gosub :moveproduct
gosub :upgrade_applycachedmove

add $gather~gathered $moved

if ($gather~gathered < $gather~quantity)
	send "q"
	waiton "Command [TL="
	goto :gather_gogather
end

if ($gather~stayonplanet = 0)
	send "q"
	waiton "Command [TL="
end
return

:gather_checksector
setvar $findproduct~quantity $gather~get
setvar $findproduct~product $gather~product
setvar $findproduct~ignorelist $gather~ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $gather~ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
	setvar $move~found 1
	setvar $gather~sourcesector $move~cursector
	setvar $gather~found $findproduct~location
	if ($findproduct~location <> "P")
		setvar $upgrade~cacheplanetid $findproduct~location
		setvar $upgrade~cachesectorid $move~cursector
		gosub :upgrade_cacheplanet
	end
end

return

:upgrade_cacheplanet
if ($planet~planet <= 0)
	setvar $planet~planet $upgrade~cacheplanetid
end
if ($planet~planet <= 0)
	return
end
if ($planet~current_sector <= 0)
	setvar $planet~current_sector $upgrade~cachesectorid
end
if ($planet~current_sector <= 0)
	setvar $planet~current_sector $player~current_sector
end
setvar $upgrade~cacheindex 0
setvar $upgrade~i 1
while ($upgrade~i <= $upgrade~cachecount)
	if ($upgrade~cacheplanet[$upgrade~i] = $planet~planet)
		setvar $upgrade~cacheindex $upgrade~i
		setvar $upgrade~i 2001
	else
		add $upgrade~i 1
	end
end
if ($upgrade~cacheindex = 0)
	add $upgrade~cachecount 1
	setvar $upgrade~cacheindex $upgrade~cachecount
	setvar $upgrade~cacheplanet[$upgrade~cacheindex] $planet~planet
end
setvar $upgrade~cachesector[$upgrade~cacheindex] $planet~current_sector
setvar $upgrade~cacheamount[$upgrade~cacheindex][1] $planet~amount[1]
setvar $upgrade~cacheamount[$upgrade~cacheindex][2] $planet~amount[2]
setvar $upgrade~cacheamount[$upgrade~cacheindex][3] $planet~amount[3]
setvar $upgrade~cachecolo[$upgrade~cacheindex][1] $planet~colo[1]
setvar $upgrade~cachecolo[$upgrade~cacheindex][2] $planet~colo[2]
setvar $upgrade~cachecolo[$upgrade~cacheindex][3] $planet~colo[3]
return

:upgrade_cacheignored
setvar $upgrade~cacheignore 0
setvar $upgrade~j 1
while ($upgrade~j <= 50)
	getword $gather~ignorelist $upgrade~ignoreplanet $upgrade~j
	if ($upgrade~ignoreplanet = 0)
		setvar $upgrade~j 51
	else
		if ($upgrade~ignoreplanet = $upgrade~cacheplanet[$upgrade~i])
			setvar $upgrade~cacheignore 1
			setvar $upgrade~j 51
		else
			add $upgrade~j 1
		end
	end
end
return

:upgrade_findcachedproduct
setvar $upgrade~cachefound 0
setvar $upgrade~cachecategory 0
setvar $upgrade~i 1
while ($upgrade~i <= $upgrade~cachecount)
	if ($upgrade~cachesector[$upgrade~i] = $gather~sector)
		gosub :upgrade_cacheignored
		if ($upgrade~cacheignore = 0)
			if ($gather~product = "C")
				setvar $upgrade~j 1
				while ($upgrade~j <= 3)
					if ($upgrade~cachecolo[$upgrade~i][$upgrade~j] >= $gather~get)
						setvar $upgrade~cachefound $upgrade~cacheplanet[$upgrade~i]
						setvar $upgrade~cachecategory $upgrade~j
						setvar $upgrade~i 2001
						setvar $upgrade~j 4
					else
						add $upgrade~j 1
					end
				end
			else
				if ($upgrade~cacheamount[$upgrade~i][$gather~product] >= $gather~get)
					setvar $upgrade~cachefound $upgrade~cacheplanet[$upgrade~i]
					setvar $upgrade~i 2001
				end
			end
		end
	end
	add $upgrade~i 1
end
if ($upgrade~cachefound <> 0)
	send "l " $upgrade~cachefound "*"
	waiton "Planet command (?=help)"
end
return

:upgrade_getcacheindex
setvar $upgrade~cacheindex 0
setvar $upgrade~i 1
while ($upgrade~i <= $upgrade~cachecount)
	if ($upgrade~cacheplanet[$upgrade~i] = $upgrade~queryplanet)
		setvar $upgrade~cacheindex $upgrade~i
		setvar $upgrade~i 2001
	else
		add $upgrade~i 1
	end
end
return

:upgrade_getsourceamount
setvar $upgrade~cachehit 0
setvar $upgrade~sourceamount 0
setvar $upgrade~queryplanet $source
gosub :upgrade_getcacheindex
if ($upgrade~cacheindex > 0)
	setvar $upgrade~cachehit 1
	if ($product = "C")
		setvar $upgrade~sourceamount $upgrade~cachecolo[$upgrade~cacheindex][$sourcecategory]
	else
		setvar $upgrade~sourceamount $upgrade~cacheamount[$upgrade~cacheindex][$product]
	end
end
return

:upgrade_applycachedmove
if ($moved <= 0)
	return
end
if ($source <> "P")
	setvar $upgrade~queryplanet $source
	gosub :upgrade_getcacheindex
	if ($upgrade~cacheindex > 0)
		if ($product = "C")
			subtract $upgrade~cachecolo[$upgrade~cacheindex][$sourcecategory] $moved
			if ($upgrade~cachecolo[$upgrade~cacheindex][$sourcecategory] < 0)
				setvar $upgrade~cachecolo[$upgrade~cacheindex][$sourcecategory] 0
			end
		else
			subtract $upgrade~cacheamount[$upgrade~cacheindex][$product] $moved
			if ($upgrade~cacheamount[$upgrade~cacheindex][$product] < 0)
				setvar $upgrade~cacheamount[$upgrade~cacheindex][$product] 0
			end
		end
	end
end
if ($dest <> "P")
	setvar $upgrade~queryplanet $dest
	gosub :upgrade_getcacheindex
	if ($upgrade~cacheindex = 0)
		add $upgrade~cachecount 1
		setvar $upgrade~cacheindex $upgrade~cachecount
		setvar $upgrade~cacheplanet[$upgrade~cacheindex] $dest
		setvar $upgrade~cachesector[$upgrade~cacheindex] $destsector
	end
	if ($product = "C")
		add $upgrade~cachecolo[$upgrade~cacheindex][$destcategory] $moved
	else
		add $upgrade~cacheamount[$upgrade~cacheindex][$product] $moved
	end
end
return

:seekproduct
if ($seek_holds = 0)
	gosub :player~quikstats
	setvar $seek_holds $player~total_holds
end

:seek_gogather
setvar $move~checksub ":seek_checksector"
send "d"
gosub :move~move

if ($seek_found = "P")

	:seek_buyproduct
	if ($seek_product = 1)
		setvar $haggle~buyprod "Fuel"
	elseif ($seek_product = 2)
		setvar $haggle~buyprod "Organics"
	else
		setvar $haggle~buyprod "Equipment"
	end

	setvar $haggle~quantity 0
	setvar $haggle~sector $seek_source_sector
	send "pt"
	gosub :haggle~haggle

	if ($haggle~abort)
		goto :seek_buyproduct
	end
else
	send "tnt"&$seek_product "*q"
end
return

:seek_checksector
setvar $findproduct~quantity $seek_holds
setvar $findproduct~product $seek_product
setvar $findproduct~ignorelist $seek_ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $seek_ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
	setvar $move~found 1
	setvar $seek_source_sector $move~cursector
	setvar $seek_found $findproduct~location
end

return

:moveproduct
gosub :player~quikstats

if ($player~planet_scanner = "Yes")
	setvar $pscan 1
else
	setvar $pscan 0
end
setvar $credits $player~credits
setvar $moved 0
setvar $restore_haggle 0

if (($source = "P") and haggle)
	setvar $restore_haggle 1
	autohaggle off
end

if ($product = 4)
	send "qc;ql " $source "* "
	settextlinetrigger getmaxfigs :getmaxfigs "Max Fighters:"
	pause

	:getmaxfigs
	cuttext currentline $product_holds 48 7
	striptext $product_holds ","
	striptext $product_holds " "
else
	setvar $product_holds $player~total_holds
end

if ($sourcesector <> $destsector)
	setvar $safe 1
end

if ($product = "C")
	setvar $pickuptext "snt"&$sourcecategory
	setvar $dropofftext "snl"&$destcategory
	setvar $waittext "Which production group are you changing?"
elseif ($product = 4)
	setvar $pickuptext "mnt"
	setvar $dropofftext "mnl"
	setvar $waittext "There are currently "
else
	setvar $pickuptext "tnt"&$product
	setvar $dropofftext "tnl"&$product
	setvar $waittext "Which product are you leaving?"
end

if (($source = "P") and ($portquantity = 0))
	send "cr*q"
	waiton "Commerce report for "

	if ($product = 1)
		settextlinetrigger getproduct :getproduct "Fuel Ore   "
	elseif ($product = 2)
		settextlinetrigger getproduct :getproduct "Organics   "
	else
		settextlinetrigger getproduct :getproduct "Equipment  "
	end
	pause

	:getproduct
	if ($product = 1)
		getword currentline $portquantity 4
	else
		getword currentline $portquantity 3
	end
end

if ($source = "P")
	if ($portquantity < $quantity)
		setvar $quantity $portquantity
	end
else
	gosub :upgrade_getsourceamount
	if ($upgrade~cachehit)
		if ($product = "C")
			setvar $planet~colo[$sourcecategory] $upgrade~sourceamount
		else
			setvar $planet~amount[$product] $upgrade~sourceamount
		end
		if ($upgrade~sourceamount < $quantity)
			setvar $quantity $upgrade~sourceamount
		end
	else
		send "d"
		setvar $planet~noheader 1
		gosub :planet~planetinfo
		setvar $upgrade~cacheplanetid $source
		setvar $upgrade~cachesectorid $sourcesector
		gosub :upgrade_cacheplanet

		if ($product = "C")
			if ($planet~colo[$sourcecategory] < $quantity)
				setvar $quantity $planet~colo[$sourcecategory]
			end
		else
			if ($planet~amount[$product] < $quantity)
				setvar $quantity $planet~amount[$product]
			end
		end
	end
end

if ($safe)
	setvar $firstrun 1
	setvar $finished 0

	if ($product = "C")
		setvar $planetamount $planet~colo[$sourcecategory]
	else
		setvar $planetamount $planet~amount[$product]
	end

	:safecycle
	if ($quantity < $product_holds)
		setvar $pickup $quantity
	else
		setvar $pickup $product_holds
	end

	if ($source = "P")
		if ($pickup = 0)
			gosub :sub_landdest
			waiton "Planet #"&$dest
			waiton "Planet command (?=help)"
			gosub :restorehaggle
			return
		end

		if ($product = 1)
			setvar $buyprod "Fuel"
		elseif ($product = 2)
			setvar $buyprod "Organics"
		else
			setvar $buyprod "Equipment"
		end

		:retryhaggle
		send "pt"
		setvar $trade_sector $sourcesector

		if ($pickup < $product_holds)
			setvar $quantity $pickup
		end

		waiton "Docking..."
		settextlinetrigger buy :buy "We are selling up to "
		settextlinetrigger sell :sell "We are buying up to "
		pause

		:buy
		killtrigger getcredits
		killtrigger done
		settexttrigger onhand :buyonhand "]?"
		pause

		:sell
		goto :buy

		:buyonhand
		getword currentline $product 5
		if ($product <> $buyprod)
			send "0*"
			settexttrigger getcredits :getcredits "empty cargo holds."
			pause
		end
		send "*"

		settexttrigger getcredits :getcredits "empty cargo holds."
		pause

		:getcredits
		killtrigger class0
		killtrigger buy
		killtrigger sell
		getword currentline $credits 3
		striptext $credits ","
		settextlinetrigger buy :buy "We are selling up to "
		settextlinetrigger sell :sell "We are buying up to "
		settexttrigger haggledone :haggledone "Command [TL="
		pause

		:haggledone
		killtrigger buy
		killtrigger sell

		if ($abort)
			goto :retryhaggle
		end

		if ($credits < 10000)
			setvar $finished 1
		end
	else
		if ($firstrun = 0)
			setvar $planet~noheader 1
			gosub :planet~planetinfo

			if ($product = "C")
				setvar $planetamount $planet~colo[$sourcecategory]
			else
				setvar $planetamount $planet~amount[$product]
			end
		end

		if ($planetamount < $pickup)
			setvar $pickup $planetamount
		end

		if ($pickup = 0)
			setvar $finished 1
			send "q"
		else
			if ($pickup = $product_holds)
				send $pickuptext "*q"
			else
				send $pickuptext $pickup "*q"
			end
		end
	end

	if ($sourcesector <> $destsector)
		setvar $warpdest $destsector
		gosub :warpto
	end

	if ($finished)
		gosub :sub_landdest
		waiton "<Preparing ship to land"
	else
		if ($pscan or (sector.planetcount[$destsector] > 1))
			send "l " $dest "*" $dropofftext "*"
		else
			send "l " $dropofftext "*"
		end
		waiton $waittext
	end

	waiton "Planet command (?=help)"
	subtract $quantity $pickup
	add $moved $pickup

	if (($quantity <= 0) or $finished)
		gosub :restorehaggle
		return
	end

	send "q"

	if ($sourcesector <> $destsector)
		setvar $warpdest $sourcesector
		gosub :warpto
	end

	if ($source <> "P")
		gosub :sub_landsource
	end

	setvar $firstrun 0
	goto :safecycle
else
	setvar $cycles ($quantity / $product_holds)
	setvar $remainder ($quantity - ($cycles * $product_holds))

	if ($remainder > 0)
		add $cycles 1
	end

	if ($source <> "P")
		send "q"
	end

	if ($cycles <= 0)
		gosub :sub_landdest
		gosub :restorehaggle
		return
	end

	setvar $gameprefs~bank "MOVEPRODUCT"
	setvar $gameprefs~ansi[$gameprefs~bank] "ON"
	gosub :gameprefs~setgameprefs

	setvar $clock 3

	:cycle
	setvar $send ""

	if ($source = "P")
		setvar $send "pt"

		if ((($product = 2) or ($product = 3)) and (port.buyfuel[$sourcesector] = 0))
			setvar $send $send&"0*"
		end
		if (($product = 3) and (port.buyorg[$sourcesector] = 0))
			setvar $send $send&"0*"
		end

		if (($cycles = 1) and ($remainder > 0))
			setvar $send $send&$remainder&"**"
		else
			setvar $send $send&"**"
		end

		if ((($product = 1) or ($product = 2)) and (port.buyequip[$sourcesector] = 0))
			setvar $send $send&"0*"
		end
		if (($product = 1) and (port.buyorg[$sourcesector] = 0))
			setvar $send $send&"0*"
		end
		else
			if ($pscan or (sector.planetcount[$sourcesector] > 1))
				setvar $send $send&"l  "&$source&"*"
			else
				setvar $send $send&"l  "
			end

		if (($cycles = 1) and ($remainder > 0))
			setvar $send $send&$pickuptext&$remainder&"*q"
		else
			setvar $send $send&$pickuptext&"*q"
		end
	end

	setvar $send $send&"l  "&$dest&"*"&$dropofftext&"*q"

	send $send
	subtract $cycles 1

	if (($cycles = 1) and ($remainder > 0))
		add $moved $remainder
	else
		add $moved $product_holds
	end

	if ($cycles <= 0)
		while ($clock < 4)
			waiton $waittext
			add $clock 1
		end

		setvar $gameprefs~bank "MOVEPRODUCT"
		gosub :gameprefs~setgameprefs

		send "l  " $dest "*"
		waiton "Planet command (?=help)"
		gosub :restorehaggle
		return
	end

	if ($clock > 0)
		subtract $clock 1
	else
		if ($source = "P")
			settextlinetrigger getcredits :cyclegetcredits "Your offer ["
			pause

			:cyclegetcredits
			getword currentline $offer 3
			striptext $offer ","
			striptext $offer "["
			striptext $offer "]"
			subtract $credits $offer

			if ($credits < 10000)
				setvar $cycles 0
			end
		end
		waiton $waittext
	end

	goto :cycle
end

:warpto
if ((sectors > 5000) or ($warpdest < 600))
	send $warpdest "*"
else
	send $warpdest
end

settextlinetrigger moveproduct_warp_arrived :warp_arrived "You are already in that sector!"
settextlinetrigger moveproduct_warp_begin :warp_begin "<Move>"
pause

:warp_begin
killtrigger moveproduct_warp_arrived
settexttrigger moveproduct_warp_start :warp_start "Engage the Autopilot?"
settexttrigger moveproduct_warp_twarp :warp_twarp "Do you want to engage"
settextlinetrigger moveproduct_warp_single :warp_single "Sector  :"
pause

:warp_twarp
send "n"

:warp_start
send "e"

:warp_single
killtrigger moveproduct_warp_start
killtrigger moveproduct_warp_twarp
killtrigger moveproduct_warp_single
killtrigger moveproduct_warp_abort

setvar $warp_stopprompt 1
setvar $warp_mineprompt 1

:warp_mid
killtrigger moveproduct_warp_tollfigs
killtrigger moveproduct_warp_figs
killtrigger moveproduct_warp_stopprompt
killtrigger moveproduct_warp_mines
killtrigger moveproduct_warp_nextsector
killtrigger moveproduct_warp_done

settextlinetrigger moveproduct_warp_nextsector :warp_nextsector "Sector  :"
settextlinetrigger moveproduct_warp_tollfigs :warp_tollfigs "You have to destroy the fighters or pay"
settextlinetrigger moveproduct_warp_figs :warp_figs "You have to destroy the fighters to remain"
settexttrigger moveproduct_warp_stopprompt :warp_stopprompt "Stop in this sector"
settexttrigger moveproduct_warp_mines :warp_minesprompt "Mined Sector:"
settexttrigger moveproduct_warp_done :warp_arrived "Command [TL="
pause

:warp_nextsector
setvar $warp_stopprompt 1
setvar $warp_mineprompt 1
goto :warp_mid

:warp_tollfigs
if ($move~attack = 3)
	send "py"
else
	send "a9999*"
end
goto :warp_mid

:warp_figs
send "a9999*"
goto :warp_mid

:warp_stopprompt
if ($warp_stopprompt)
	send "n"
	setvar $warp_stopprompt 0
end
goto :warp_mid

:warp_minesprompt
if ($warp_mineprompt)
	send "n"
	setvar $warp_mineprompt 0
end
goto :warp_mid

:warp_arrived
killtrigger moveproduct_warp_arrived
killtrigger moveproduct_warp_nextsector
killtrigger moveproduct_warp_tollfigs
killtrigger moveproduct_warp_figs
killtrigger moveproduct_warp_stopprompt
killtrigger moveproduct_warp_mines
killtrigger moveproduct_warp_begin
killtrigger moveproduct_warp_done
return

:restorehaggle
if ($restore_haggle = 1)
	autohaggle on
	setvar $restore_haggle 0
end
return

:sub_landdest
if ($pscan or (sector.planetcount[$destsector] > 1))
	send "l " $dest "*"
else
	send "l "
end
return

:sub_landsource
if ($pscan or (sector.planetcount[$sourcesector] > 1))
	send "l " $source "*"
else
	send "l"
end
return

# includes:
include "source\include\gameprefs"
include "source\include\findproduct"
include "source\include\haggle"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\move"
include "source\include\help"
include "source\include\switchboard.ts"
