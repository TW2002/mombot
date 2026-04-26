loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8

:SCRIPTCHECK
listactivescripts $SCRIPTS
listactivescripts $SCRIPTSX
:DUPLICATES
setvar $A 1
:DUPLICATES0
while ($A <= $SCRIPTS)
  setvar $B 1
  lowercase $SCRIPTS[$A]
  lowercase $SCRIPTSX[$A]
  while ($B <= $SCRIPTS)
    if (($A <> $B) and ($SCRIPTS[$A] = $SCRIPTSX[$B]))
      stop $SCRIPTS[$A]
      goto :SCRIPTCHECK
    end
    add $B 1
  end
  add $A 1
end

if ($PARM1 = "help")
  :HELP
  send "'*"
  send "  - upgrade {off/help} {planets to ignores} syntax*"
  send "                                              *"
  send "  - (ex) upgrade on 11 14 15*"
  send "  - Products and Colos must be in sector**"
  waitfor "Sub-space comm-link terminated"
  halt
end
:OFF

if ($PARM1 = "off")
  send "'Upgrade OFF!*"
  halt
end
setdelaytrigger OFF :OFF 1000
send " q q q q r*"
waiton "Command"



cuttext CURRENTLINE $LOCATION 1 12
if ($LOCATION <> "Command [TL=")
  send "'Run Upgrade from Command Prompt!*"
  halt
end

reqrecording
logging "OFF"
loadvar $MASSUPGRADESAVED

setvar $ignorelist $PARM1&$PARM2&" "&$PARM3&" "&$PARM4&" "&$PARM5&" "&$PARM6&" "&$PARM7&" "&$PARM8
setvar $seek 0
gosub :VOIDADJ

setvar $gameprefs~bank "MassUpgrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

if ($sector = 0)
  send "d"
  settextlinetrigger GETSECTOR :GETSECTOR "Sector  : "
  pause
  :getsector
  getword CURRENTLINE $sector 3
  waiton "Command [TL="
end

if (SECTOR.PLANETCOUNT[$sector] = 0)
  return
end

send "jy"
gosub :PLAYER~QUIKSTATS
setvar $holds $PLAYER~TOTAL_HOLDS

setvar $planetloop~loopsub ":CHECKPLANET"
setvar $planetloop~ignorelist $ignorelist
setvar $planetupgrade~failed 0
gosub :PLANETLOOP
gosub :VOIDADJUN
if ($planetupgrade~failed = 0)
  setvar $switchboard~message "Successfully upgraded all planets in sector " $sector ".*"
  gosub :switchboard~switchboard
else
  setvar $switchboard~message "Unable to upgrade all planets in sector " $sector ".*"
  gosub :switchboard~switchboard
end
halt

:CHECKPLANET
setvar $planetupgrade~planetid $planetloop~id
setvar $planetupgrade~sector $sector
setvar $planetupgrade~seek $seek
gosub :PLANETUPGRADE
return

:PLANETLOOP

setvar $planetloop~i 1
setvar $planetloop~ignorecount 0

:PLANETLOOP_I
getword $planetloop~ignorelist $planetloop~ignore[$planetloop~i] $planetloop~i
if ($planetloop~ignore[$planetloop~i] <> 0)
  add $planetloop~i 1
  add $planetloop~ignorecount 1
  goto :PLANETLOOP_I
end
setvar $planetloop~ignorelist ""

setvar $planetloop~found 0
send "l"

settextlinetrigger NOPLANET :PLANETLOOP_NOPLANET "There isn't a planet in this sector."
settextlinetrigger MULTIPLEPLANETS :PLANETLOOP_MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger SINGLEPLANET :PLANETLOOP_SINGLEPLANET "Landing sequence engaged..."
pause

:PLANETLOOP_NOPLANET
killtrigger MULTIPLEPLANETS
killtrigger SINGLEPLANET
return

:PLANETLOOP_MULTIPLEPLANETS
killtrigger SINGLEPLANET
killtrigger NOPLANET
setvar $planetloop~lastid 0

:PLANETLOOP_NEXTPLANET
settexttrigger PLANETSCHECKED :PLANETLOOP_PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger GETID :PLANETLOOP_GETID "<"
pause

:PLANETLOOP_GETID
getword CURRENTLINE $planetloop~word 1
if ($planetloop~word = "Owned")
  settextlinetrigger GETID :PLANETLOOP_GETID "<"
  pause
end

killtrigger PLANETSCHECKED
setvar $planetloop~line CURRENTLINE
striptext $planetloop~line "<"
striptext $planetloop~line ">"
getword $planetloop~line $planetloop~id 1
if ($planetloop~id = "Land")
  goto :PLANETLOOP_PLANETSCHECKED
end

gosub :PLANETLOOP_SUB_CHECKIGNORE

if (($planetloop~id > $planetloop~lastid) and ($planetloop~ignore = 0))
  send $planetloop~id "*"
  setvar $planetloop~lastid $planetloop~id
  gosub :PLANETLOOP_SUB_CHECK

  if ($planetloop~found <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :PLANETLOOP_NEXTPLANET

:PLANETLOOP_PLANETSCHECKED
killtrigger GETID
send "q*"
return

:PLANETLOOP_SINGLEPLANET
killtrigger MULTIPLEPLANETS
killtrigger NOPLANET
gosub :PLANETLOOP_SUB_CHECK
if ($planetloop~found = 0)
  send "q"
end
return

:PLANETLOOP_SUB_CHECK
settextlinetrigger CHECK_GETPLANET :PLANETLOOP_CHECK_GETPLANET "Planet #"
pause

:PLANETLOOP_CHECK_GETPLANET
getword CURRENTLINE $planetloop~check_planet 2
striptext $planetloop~check_planet "#"

setvar $planetloop~id $planetloop~check_planet
gosub :PLANETLOOP_SUB_CHECKIGNORE

if ($planetloop~ignore = 0)
  gosub $planetloop~loopsub
end

return

:PLANETLOOP_SUB_CHECKIGNORE
setvar $planetloop~j 1
setvar $planetloop~ignore 0

:PLANETLOOP_J
if ($planetloop~j <= $planetloop~ignorecount)
  if ($planetloop~ignore[$planetloop~j] = $planetloop~id)
    setvar $planetloop~ignore 1
  else
    add $planetloop~j 1
    goto :PLANETLOOP_J
  end
end

return

:PLANETUPGRADE

setvar $planetupgrade~failed 0

setvar $planet~noheader 1
gosub :planet~planetinfo
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

if (($planet~buildtime > 0) or ($planetupgrade~level = 6))
  return
end

if ($planetupgrade~level = 0)
  send "cy"
else
  send "cuyq"
end

settextlinetrigger CANTUPGRADE :PLANETUPGRADE_CANTUPGRADE "This Citadel cannot be upgraded further."
settextlinetrigger CANUPGRADE :PLANETUPGRADE_CANUPGRADE "the following:"
pause

:PLANETUPGRADE_CANTUPGRADE
killtrigger CANUPGRADE
return

:PLANETUPGRADE_CANUPGRADE
killtrigger CANTUPGRADE
settextlinetrigger GETCOLOS :PLANETUPGRADE_GETCOLOS "Colonists to support the construction,"
settextlinetrigger GETFUEL :PLANETUPGRADE_GETFUEL "units of Fuel Ore,"
settextlinetrigger GETORG :PLANETUPGRADE_GETORG "units of Organics,"
settextlinetrigger GETEQUIP :PLANETUPGRADE_GETEQUIP "units of Equipment and"
settextlinetrigger GETDAYS :PLANETUPGRADE_GETDAYS "days to construct."
pause

:PLANETUPGRADE_GETCOLOS
getword CURRENTLINE $planetupgrade~colosneeded 1
pause

:PLANETUPGRADE_GETFUEL
getword CURRENTLINE $planetupgrade~fuelneeded 1
pause

:PLANETUPGRADE_GETORG
getword CURRENTLINE $planetupgrade~orgneeded 1
pause

:PLANETUPGRADE_GETEQUIP
getword CURRENTLINE $planetupgrade~equipneeded 1
pause

:PLANETUPGRADE_GETDAYS
getword CURRENTLINE $planetupgrade~daysneeded 1
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
    setdelaytrigger UPGRADEPAUSE :PLANETUPGRADE_UPGRADEPAUSE 1000
    pause

    :PLANETUPGRADE_UPGRADEPAUSE
    send "d"
    goto :PLANETUPGRADE
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
  gosub :GATHER

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
  gosub :GATHER

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
  gosub :GATHER

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
  gosub :GATHER

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end

send "l" $planetupgrade~planetid "*"
goto :PLANETUPGRADE

:GATHER

setvar $gather~gathered 0
setvar $gather~failed 0

if ($gather~holds = 0)
  gosub :PLAYER~QUIKSTATS
  setvar $gather~holds $PLAYER~TOTAL_HOLDS
end

:GATHER_GOGATHER
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
  setvar $findproduct~quantity $gather~get
  setvar $findproduct~product $gather~product
  setvar $findproduct~ignorelist $gather~ignorelist
  setvar $findproduct~stayonplanet 1
  setvar $findproduct~sector $gather~sector

  gosub :findproduct~findproduct

  setvar $gather~ignorelist $findproduct~ignorelist

  if ($findproduct~location = 0)
    setvar $gather~failed 1
    send "t"
    return
  end

  setvar $gather~sourcesector $gather~sector
  setvar $gather~found $findproduct~location
end

if ($gather~product = "C")
  setvar $moveproduct~sourcecategory $findproduct~category
  setvar $moveproduct~destcategory $gather~destcategory
end

setvar $moveproduct~source $gather~found
setvar $moveproduct~sourcesector $gather~sourcesector
setvar $moveproduct~dest $gather~planetid
setvar $moveproduct~destsector $gather~sector
setvar $moveproduct~product $gather~product
setvar $moveproduct~quantity ($gather~quantity - $gather~gathered)
setvar $moveproduct~safe 0
gosub :moveproduct~moveproduct

add $gather~gathered $moveproduct~moved

if ($gather~gathered < $gather~quantity)
  send "q"
  goto :GATHER_GOGATHER
end

if ($gather~stayonplanet = 0)
  send "q"
end
return

:GATHER_CHECKSECTOR
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
end

return

:SEEKPRODUCT~SEEKPRODUCT
if ($SEEKPRODUCT~HOLDS = 0)
  gosub :PLAYER~QUIKSTATS
  setvar $SEEKPRODUCT~HOLDS $PLAYER~TOTAL_HOLDS
end

:SEEKPRODUCT~GOGATHER
setvar $MOVE~CHECKSUB ":SEEKPRODUCT~CHECKSECTOR"
send "d"
gosub :MOVE~MOVE

if ($SEEKPRODUCT~FOUND = "P")
:SEEKPRODUCT~BUYPRODUCT
  if ($SEEKPRODUCT~PRODUCT = 1)
    setvar $HAGGLE~BUYPROD "Fuel"
  elseif ($SEEKPRODUCT~PRODUCT = 2)
    setvar $HAGGLE~BUYPROD "Organics"
  else
    setvar $HAGGLE~BUYPROD "Equipment"
  end

  setvar $HAGGLE~QUANTITY 0
  setvar $HAGGLE~SECTOR $SEEKPRODUCT~SOURCESECTOR
  send "pt"
  gosub :HAGGLE~HAGGLE

  if ($HAGGLE~ABORT)
    goto :SEEKPRODUCT~BUYPRODUCT
  end
else
  send "tnt"&$SEEKPRODUCT~PRODUCT "*q"
end
return

:SEEKPRODUCT~CHECKSECTOR
setvar $FINDPRODUCT~QUANTITY $SEEKPRODUCT~HOLDS
setvar $FINDPRODUCT~PRODUCT $SEEKPRODUCT~PRODUCT
setvar $FINDPRODUCT~IGNORELIST $SEEKPRODUCT~IGNORELIST
setvar $FINDPRODUCT~STAYONPLANET 1
setvar $FINDPRODUCT~SECTOR $MOVE~CURSECTOR

gosub :FINDPRODUCT~FINDPRODUCT

setvar $SEEKPRODUCT~IGNORELIST $FINDPRODUCT~IGNORELIST

if ($FINDPRODUCT~LOCATION <> 0)
  setvar $MOVE~FOUND 1
  setvar $SEEKPRODUCT~SOURCESECTOR $MOVE~CURSECTOR
  setvar $SEEKPRODUCT~FOUND $FINDPRODUCT~LOCATION
end

return

:MOVEPRODUCT~MOVEPRODUCT
gosub :PLAYER~QUIKSTATS

if ($PLAYER~PLANET_SCANNER = "Yes")
  setvar $MOVEPRODUCT~PSCAN 1
else
  setvar $MOVEPRODUCT~PSCAN 0
end
setvar $MOVEPRODUCT~CREDITS $PLAYER~CREDITS
setvar $MOVEPRODUCT~MOVED 0
setvar $MOVEPRODUCT~RESTORE_HAGGLE 0

if (($MOVEPRODUCT~SOURCE = "P") and HAGGLE)
  setvar $MOVEPRODUCT~RESTORE_HAGGLE 1
  autohaggle off
end

if ($MOVEPRODUCT~PRODUCT = 4)
  send "qc;ql " $MOVEPRODUCT~SOURCE "* "
  settextlinetrigger GETMAXFIGS :MOVEPRODUCT~GETMAXFIGS "Max Fighters:"
  pause

:MOVEPRODUCT~GETMAXFIGS
  cuttext CURRENTLINE $MOVEPRODUCT~HOLDS 48 7
  striptext $MOVEPRODUCT~HOLDS ","
  striptext $MOVEPRODUCT~HOLDS " "
else
  setvar $MOVEPRODUCT~HOLDS $PLAYER~TOTAL_HOLDS
end

if ($MOVEPRODUCT~SOURCESECTOR <> $MOVEPRODUCT~DESTSECTOR)
  setvar $MOVEPRODUCT~SAFE 1
end

if ($MOVEPRODUCT~PRODUCT = "C")
  setvar $MOVEPRODUCT~PICKUPTEXT "snt"&$MOVEPRODUCT~SOURCECATEGORY
  setvar $MOVEPRODUCT~DROPOFFTEXT "snl"&$MOVEPRODUCT~DESTCATEGORY
  setvar $MOVEPRODUCT~WAITTEXT "Which production group are you changing?"
elseif ($MOVEPRODUCT~PRODUCT = 4)
  setvar $MOVEPRODUCT~PICKUPTEXT "mnt"
  setvar $MOVEPRODUCT~DROPOFFTEXT "mnl"
  setvar $MOVEPRODUCT~WAITTEXT "There are currently "
else
  setvar $MOVEPRODUCT~PICKUPTEXT "tnt"&$MOVEPRODUCT~PRODUCT
  setvar $MOVEPRODUCT~DROPOFFTEXT "tnl"&$MOVEPRODUCT~PRODUCT
  setvar $MOVEPRODUCT~WAITTEXT "Which product are you leaving?"
end

if (($MOVEPRODUCT~SOURCE = "P") and ($MOVEPRODUCT~PORTQUANTITY = 0))
  send "cr*q"
  waiton "Commerce report for "

  if ($MOVEPRODUCT~PRODUCT = 1)
    settextlinetrigger GETPRODUCT :MOVEPRODUCT~GETPRODUCT "Fuel Ore   "
  elseif ($MOVEPRODUCT~PRODUCT = 2)
    settextlinetrigger GETPRODUCT :MOVEPRODUCT~GETPRODUCT "Organics   "
  else
    settextlinetrigger GETPRODUCT :MOVEPRODUCT~GETPRODUCT "Equipment  "
  end
  pause

:MOVEPRODUCT~GETPRODUCT
  if ($MOVEPRODUCT~PRODUCT = 1)
    getword CURRENTLINE $MOVEPRODUCT~PORTQUANTITY 4
  else
    getword CURRENTLINE $MOVEPRODUCT~PORTQUANTITY 3
  end
end

if ($MOVEPRODUCT~SOURCE = "P")
  if ($MOVEPRODUCT~PORTQUANTITY < $MOVEPRODUCT~QUANTITY)
    setvar $MOVEPRODUCT~QUANTITY $MOVEPRODUCT~PORTQUANTITY
  end
else
  send "d"
  setvar $PLANET~NOHEADER 1
  gosub :PLANET~PLANETINFO

  if ($MOVEPRODUCT~PRODUCT = "C")
    if ($PLANET~COLO[$MOVEPRODUCT~SOURCECATEGORY] < $MOVEPRODUCT~QUANTITY)
      setvar $MOVEPRODUCT~QUANTITY $PLANET~COLO[$MOVEPRODUCT~SOURCECATEGORY]
    end
  else
    if ($PLANET~AMOUNT[$MOVEPRODUCT~PRODUCT] < $MOVEPRODUCT~QUANTITY)
      setvar $MOVEPRODUCT~QUANTITY $PLANET~AMOUNT[$MOVEPRODUCT~PRODUCT]
    end
  end
end

if ($MOVEPRODUCT~SAFE)
  setvar $MOVEPRODUCT~FIRSTRUN 1
  setvar $MOVEPRODUCT~FINISHED 0

  if ($MOVEPRODUCT~PRODUCT = "C")
    setvar $MOVEPRODUCT~PLANETAMOUNT $PLANET~COLO[$MOVEPRODUCT~SOURCECATEGORY]
  else
    setvar $MOVEPRODUCT~PLANETAMOUNT $PLANET~AMOUNT[$MOVEPRODUCT~PRODUCT]
  end

:MOVEPRODUCT~SAFECYCLE
  if ($MOVEPRODUCT~QUANTITY < $MOVEPRODUCT~HOLDS)
    setvar $MOVEPRODUCT~PICKUP $MOVEPRODUCT~QUANTITY
  else
    setvar $MOVEPRODUCT~PICKUP $MOVEPRODUCT~HOLDS
  end

  if ($MOVEPRODUCT~SOURCE = "P")
    if ($MOVEPRODUCT~PICKUP = 0)
      gosub :MOVEPRODUCT~SUB_LANDDEST
      waiton "Planet #"&$MOVEPRODUCT~DEST
      waiton "Planet command (?=help)"
      gosub :MOVEPRODUCT~RESTOREHAGGLE
      return
    end

    if ($MOVEPRODUCT~PRODUCT = 1)
      setvar $MOVEPRODUCT~BUYPROD "Fuel"
    elseif ($MOVEPRODUCT~PRODUCT = 2)
      setvar $MOVEPRODUCT~BUYPROD "Organics"
    else
      setvar $MOVEPRODUCT~BUYPROD "Equipment"
    end

:MOVEPRODUCT~RETRYHAGGLE
    send "pt"
    setvar $MOVEPRODUCT~SECTOR $MOVEPRODUCT~SOURCESECTOR

    if ($MOVEPRODUCT~PICKUP < $MOVEPRODUCT~HOLDS)
      setvar $MOVEPRODUCT~QUANTITY $MOVEPRODUCT~PICKUP
    end

    waiton "Docking..."
    settextlinetrigger BUY :MOVEPRODUCT~BUY "We are selling up to "
    settextlinetrigger SELL :MOVEPRODUCT~SELL "We are buying up to "
    pause

:MOVEPRODUCT~BUY
    killtrigger GETCREDITS
    killtrigger DONE
    settexttrigger ONHAND :MOVEPRODUCT~BUYONHAND "]?"
    pause

:MOVEPRODUCT~SELL
    goto :MOVEPRODUCT~BUY

:MOVEPRODUCT~BUYONHAND
    getword CURRENTLINE $MOVEPRODUCT~PRODUCT 5
    if ($MOVEPRODUCT~PRODUCT <> $MOVEPRODUCT~BUYPROD)
      send "0*"
      settexttrigger GETCREDITS :MOVEPRODUCT~GETCREDITS "empty cargo holds."
      pause
    end
    send "*"

    settexttrigger GETCREDITS :MOVEPRODUCT~GETCREDITS "empty cargo holds."
    pause

:MOVEPRODUCT~GETCREDITS
    killtrigger CLASS0
    killtrigger BUY
    killtrigger SELL
    getword CURRENTLINE $MOVEPRODUCT~CREDITS 3
    striptext $MOVEPRODUCT~CREDITS ","
    settextlinetrigger BUY :MOVEPRODUCT~BUY "We are selling up to "
    settextlinetrigger SELL :MOVEPRODUCT~SELL "We are buying up to "
    settexttrigger HAGGLEDONE :MOVEPRODUCT~HAGGLEDONE "Command [TL="
    pause

:MOVEPRODUCT~HAGGLEDONE
    killtrigger BUY
    killtrigger SELL

    if ($MOVEPRODUCT~ABORT)
      goto :MOVEPRODUCT~RETRYHAGGLE
    end

    if ($MOVEPRODUCT~CREDITS < 10000)
      setvar $MOVEPRODUCT~FINISHED 1
    end
  else
    if ($MOVEPRODUCT~FIRSTRUN = 0)
      setvar $PLANET~NOHEADER 1
      gosub :PLANET~PLANETINFO

      if ($MOVEPRODUCT~PRODUCT = "C")
        setvar $MOVEPRODUCT~PLANETAMOUNT $PLANET~COLO[$MOVEPRODUCT~SOURCECATEGORY]
      else
        setvar $MOVEPRODUCT~PLANETAMOUNT $PLANET~AMOUNT[$MOVEPRODUCT~PRODUCT]
      end
    end

    if ($MOVEPRODUCT~PLANETAMOUNT < $MOVEPRODUCT~PICKUP)
      setvar $MOVEPRODUCT~PICKUP $MOVEPRODUCT~PLANETAMOUNT
    end

    if ($MOVEPRODUCT~PICKUP = 0)
      setvar $MOVEPRODUCT~FINISHED 1
      send "q"
    else
      if ($MOVEPRODUCT~PICKUP = $MOVEPRODUCT~HOLDS)
        send $MOVEPRODUCT~PICKUPTEXT "*q"
      else
        send $MOVEPRODUCT~PICKUPTEXT $MOVEPRODUCT~PICKUP "*q"
      end
    end
  end

  if ($MOVEPRODUCT~SOURCESECTOR <> $MOVEPRODUCT~DESTSECTOR)
    setvar $MOVEPRODUCT~WARPDEST $MOVEPRODUCT~DESTSECTOR
    gosub :MOVEPRODUCT~WARPTO
  end

  if ($MOVEPRODUCT~FINISHED)
    gosub :MOVEPRODUCT~SUB_LANDDEST
    waiton "<Preparing ship to land"
  else
    if ($MOVEPRODUCT~PSCAN or (SECTOR.PLANETCOUNT[$MOVEPRODUCT~DESTSECTOR] > 1))
      send "l " $MOVEPRODUCT~DEST "*" $MOVEPRODUCT~DROPOFFTEXT "*"
    else
      send "l " $MOVEPRODUCT~DROPOFFTEXT "*"
    end
    waiton $MOVEPRODUCT~WAITTEXT
  end

  waiton "Planet command (?=help)"
  subtract $MOVEPRODUCT~QUANTITY $MOVEPRODUCT~PICKUP
  add $MOVEPRODUCT~MOVED $MOVEPRODUCT~PICKUP

  if (($MOVEPRODUCT~QUANTITY <= 0) or $MOVEPRODUCT~FINISHED)
    gosub :MOVEPRODUCT~RESTOREHAGGLE
    return
  end

  send "q"

  if ($MOVEPRODUCT~SOURCESECTOR <> $MOVEPRODUCT~DESTSECTOR)
    setvar $MOVEPRODUCT~WARPDEST $MOVEPRODUCT~SOURCESECTOR
    gosub :MOVEPRODUCT~WARPTO
  end

  if ($MOVEPRODUCT~SOURCE <> "P")
    gosub :MOVEPRODUCT~SUB_LANDSOURCE
  end

  setvar $MOVEPRODUCT~FIRSTRUN 0
  goto :MOVEPRODUCT~SAFECYCLE
else
  setvar $MOVEPRODUCT~CYCLES ($MOVEPRODUCT~QUANTITY / $MOVEPRODUCT~HOLDS)
  setvar $MOVEPRODUCT~REMAINDER ($MOVEPRODUCT~QUANTITY - ($MOVEPRODUCT~CYCLES * $MOVEPRODUCT~HOLDS))

  if ($MOVEPRODUCT~REMAINDER > 0)
    add $MOVEPRODUCT~CYCLES 1
  end

  if ($MOVEPRODUCT~SOURCE <> "P")
    send "q"
  end

  if ($MOVEPRODUCT~CYCLES <= 0)
    gosub :MOVEPRODUCT~SUB_LANDDEST
    gosub :MOVEPRODUCT~RESTOREHAGGLE
    return
  end

  setvar $GAMEPREFS~BANK "MOVEPRODUCT"
  setvar $GAMEPREFS~ABORTDISPLAYALL[$GAMEPREFS~BANK] "ON"
  setvar $GAMEPREFS~ANSI[$GAMEPREFS~BANK] "ON"
  gosub :GAMEPREFS~SETGAMEPREFS

  setvar $MOVEPRODUCT~CLOCK 3

:MOVEPRODUCT~CYCLE
  setvar $MOVEPRODUCT~SEND ""

  if ($MOVEPRODUCT~SOURCE = "P")
    setvar $MOVEPRODUCT~SEND "pt"

    if ((($MOVEPRODUCT~PRODUCT = 2) or ($MOVEPRODUCT~PRODUCT = 3)) and (PORT.BUYFUEL[$MOVEPRODUCT~SOURCESECTOR] = 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"0*"
    end
    if (($MOVEPRODUCT~PRODUCT = 3) and (PORT.BUYORG[$MOVEPRODUCT~SOURCESECTOR] = 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"0*"
    end

    if (($MOVEPRODUCT~CYCLES = 1) and ($MOVEPRODUCT~REMAINDER > 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&$MOVEPRODUCT~REMAINDER&"**"
    else
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"**"
    end

    if ((($MOVEPRODUCT~PRODUCT = 1) or ($MOVEPRODUCT~PRODUCT = 2)) and (PORT.BUYEQUIP[$MOVEPRODUCT~SOURCESECTOR] = 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"0*"
    end
    if (($MOVEPRODUCT~PRODUCT = 1) and (PORT.BUYORG[$MOVEPRODUCT~SOURCESECTOR] = 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"0*"
    end
  else
    if ($MOVEPRODUCT~PSCAN or (SECTOR.PLANETCOUNT[$MOVEPRODUCT~SOURCESECTOR] > 1))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"l"&$MOVEPRODUCT~SOURCE&"*"
    else
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"l"
    end

    if (($MOVEPRODUCT~CYCLES = 1) and ($MOVEPRODUCT~REMAINDER > 0))
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&$MOVEPRODUCT~PICKUPTEXT&$MOVEPRODUCT~REMAINDER&"*q"
    else
      setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&$MOVEPRODUCT~PICKUPTEXT&"*q"
    end
  end

  setvar $MOVEPRODUCT~SEND $MOVEPRODUCT~SEND&"l"&$MOVEPRODUCT~DEST&"*"&$MOVEPRODUCT~DROPOFFTEXT&"*q"

  send $MOVEPRODUCT~SEND
  subtract $MOVEPRODUCT~CYCLES 1

  if (($MOVEPRODUCT~CYCLES = 1) and ($MOVEPRODUCT~REMAINDER > 0))
    add $MOVEPRODUCT~MOVED $MOVEPRODUCT~REMAINDER
  else
    add $MOVEPRODUCT~MOVED $MOVEPRODUCT~HOLDS
  end

  if ($MOVEPRODUCT~CYCLES <= 0)
    while ($MOVEPRODUCT~CLOCK < 4)
      waiton $MOVEPRODUCT~WAITTEXT
      add $MOVEPRODUCT~CLOCK 1
    end

    setvar $GAMEPREFS~BANK "MOVEPRODUCT"
    gosub :GAMEPREFS~SETGAMEPREFS

    send "l" $MOVEPRODUCT~DEST "*"
    waiton "Planet command (?=help)"
    gosub :MOVEPRODUCT~RESTOREHAGGLE
    return
  end

  if ($MOVEPRODUCT~CLOCK > 0)
    subtract $MOVEPRODUCT~CLOCK 1
  else
    if ($MOVEPRODUCT~SOURCE = "P")
      settextlinetrigger GETCREDITS :MOVEPRODUCT~CYCLEGETCREDITS "Your offer ["
      pause

:MOVEPRODUCT~CYCLEGETCREDITS
      getword CURRENTLINE $MOVEPRODUCT~OFFER 3
      striptext $MOVEPRODUCT~OFFER ","
      striptext $MOVEPRODUCT~OFFER "["
      striptext $MOVEPRODUCT~OFFER "]"
      subtract $MOVEPRODUCT~CREDITS $MOVEPRODUCT~OFFER

      if ($MOVEPRODUCT~CREDITS < 10000)
        setvar $MOVEPRODUCT~CYCLES 0
      end
    end
    waiton $MOVEPRODUCT~WAITTEXT
  end

  goto :MOVEPRODUCT~CYCLE
end

:MOVEPRODUCT~WARPTO
if ((SECTORS > 5000) or ($MOVEPRODUCT~WARPDEST < 600))
  send $MOVEPRODUCT~WARPDEST "*"
else
  send $MOVEPRODUCT~WARPDEST
end

settextlinetrigger MOVEPRODUCT_WARP_ARRIVED :MOVEPRODUCT~WARP_ARRIVED "You are already in that sector!"
settextlinetrigger MOVEPRODUCT_WARP_BEGIN :MOVEPRODUCT~WARP_BEGIN "<Move>"
pause

:MOVEPRODUCT~WARP_BEGIN
killtrigger MOVEPRODUCT_WARP_ARRIVED
settexttrigger MOVEPRODUCT_WARP_START :MOVEPRODUCT~WARP_START "Engage the Autopilot?"
settexttrigger MOVEPRODUCT_WARP_TWARP :MOVEPRODUCT~WARP_TWARP "Do you want to engage"
settextlinetrigger MOVEPRODUCT_WARP_SINGLE :MOVEPRODUCT~WARP_SINGLE "Sector  :"
pause

:MOVEPRODUCT~WARP_TWARP
send "n"

:MOVEPRODUCT~WARP_START
send "e"

:MOVEPRODUCT~WARP_SINGLE
killtrigger MOVEPRODUCT_WARP_START
killtrigger MOVEPRODUCT_WARP_TWARP
killtrigger MOVEPRODUCT_WARP_SINGLE
killtrigger MOVEPRODUCT_WARP_ABORT

setvar $MOVEPRODUCT~WARP_STOPPROMPT 1
setvar $MOVEPRODUCT~WARP_MINEPROMPT 1

:MOVEPRODUCT~WARP_MID
killtrigger MOVEPRODUCT_WARP_TOLLFIGS
killtrigger MOVEPRODUCT_WARP_FIGS
killtrigger MOVEPRODUCT_WARP_STOPPROMPT
killtrigger MOVEPRODUCT_WARP_MINES
killtrigger MOVEPRODUCT_WARP_NEXTSECTOR
killtrigger MOVEPRODUCT_WARP_DONE

settextlinetrigger MOVEPRODUCT_WARP_NEXTSECTOR :MOVEPRODUCT~WARP_NEXTSECTOR "Sector  :"
settextlinetrigger MOVEPRODUCT_WARP_TOLLFIGS :MOVEPRODUCT~WARP_TOLLFIGS "You have to destroy the fighters or pay"
settextlinetrigger MOVEPRODUCT_WARP_FIGS :MOVEPRODUCT~WARP_FIGS "You have to destroy the fighters to remain"
settexttrigger MOVEPRODUCT_WARP_STOPPROMPT :MOVEPRODUCT~WARP_STOPPROMPT "Stop in this sector"
settexttrigger MOVEPRODUCT_WARP_MINES :MOVEPRODUCT~WARP_MINESPROMPT "Mined Sector:"
settexttrigger MOVEPRODUCT_WARP_DONE :MOVEPRODUCT~WARP_ARRIVED "Command [TL="
pause

:MOVEPRODUCT~WARP_NEXTSECTOR
setvar $MOVEPRODUCT~WARP_STOPPROMPT 1
setvar $MOVEPRODUCT~WARP_MINEPROMPT 1
goto :MOVEPRODUCT~WARP_MID

:MOVEPRODUCT~WARP_TOLLFIGS
if ($MOVE~ATTACK = 3)
  send "py"
else
  send "a9999*"
end
goto :MOVEPRODUCT~WARP_MID

:MOVEPRODUCT~WARP_FIGS
send "a9999*"
goto :MOVEPRODUCT~WARP_MID

:MOVEPRODUCT~WARP_STOPPROMPT
if ($MOVEPRODUCT~WARP_STOPPROMPT)
  send "n"
  setvar $MOVEPRODUCT~WARP_STOPPROMPT 0
end
goto :MOVEPRODUCT~WARP_MID

:MOVEPRODUCT~WARP_MINESPROMPT
if ($MOVEPRODUCT~WARP_MINEPROMPT)
  send "n"
  setvar $MOVEPRODUCT~WARP_MINEPROMPT 0
end
goto :MOVEPRODUCT~WARP_MID

:MOVEPRODUCT~WARP_ARRIVED
killtrigger MOVEPRODUCT_WARP_ARRIVED
killtrigger MOVEPRODUCT_WARP_NEXTSECTOR
killtrigger MOVEPRODUCT_WARP_TOLLFIGS
killtrigger MOVEPRODUCT_WARP_FIGS
killtrigger MOVEPRODUCT_WARP_STOPPROMPT
killtrigger MOVEPRODUCT_WARP_MINES
killtrigger MOVEPRODUCT_WARP_BEGIN
killtrigger MOVEPRODUCT_WARP_DONE
return

:MOVEPRODUCT~RESTOREHAGGLE
if ($MOVEPRODUCT~RESTORE_HAGGLE = 1)
  autohaggle on
  setvar $MOVEPRODUCT~RESTORE_HAGGLE 0
end
return

:MOVEPRODUCT~SUB_LANDDEST
if ($MOVEPRODUCT~PSCAN or (SECTOR.PLANETCOUNT[$MOVEPRODUCT~DESTSECTOR] > 1))
  send "l " $MOVEPRODUCT~DEST "*"
else
  send "l "
end
return

:MOVEPRODUCT~SUB_LANDSOURCE
if ($MOVEPRODUCT~PSCAN or (SECTOR.PLANETCOUNT[$MOVEPRODUCT~SOURCESECTOR] > 1))
  send "l " $MOVEPRODUCT~SOURCE "*"
else
  send "l"
end
return

:VOIDADJ

killalltriggers
setvar $I 1
setvar $WARPS SECTOR.WARPCOUNT[CURRENTSECTOR]
isnumber $NUM $WARPS
if ($NUM = 1)
  send "^"
  waitfor ":"
  while ($I <= $WARPS)
    send "s "&SECTOR.WARPS[CURRENTSECTOR][$I]&"* "
    add $I 1
  end
  send "q"
  waitfor ": ENDINTERROG"
end
return

:VOIDADJUN

setvar $I 1
setvar $WARPS SECTOR.WARPCOUNT[CURRENTSECTOR]
isnumber $NUM $WARPS
if ($NUM = 1)
  send "^"
  waitfor ":"
  while ($I <= $WARPS)
    send "c "&SECTOR.WARPS[CURRENTSECTOR][$I]&"* "
    add $I 1
  end
  send "q"
  waitfor ": ENDINTERROG"
end
return

# includes:
include "source\include\planet"
include "source\include\move"
include "source\include\findproduct"
include "source\include\haggle"
include "source\include\player"
include "source\include\gameprefs"
include "source\include\switchboard"
include "source\include\bot"
