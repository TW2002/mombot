:planetupgrade~planetupgrade

setvar $planetupgrade~failed 0


setvar $planetinfo~noheader 1
gosub :planetinfo~planetinfo
setvar $planetupgrade~level $planetinfo~citadellevel
setvar $planetupgrade~destcategory $planetinfo~dropcategory

if (($planetinfo~buildtime > 0) or ($planetupgrade~level = 6))

  return
end


if ($planetupgrade~level = 0)
  send "cy"
else
  send "cuyq"
end


settextlinetrigger CANTUPGRADE :CANTUPGRADE "This Citadel cannot be upgraded further."
settextlinetrigger CANUPGRADE :CANUPGRADE "the following:"
pause
:planetupgrade~cantupgrade


killtrigger CANUPGRADE
return
:planetupgrade~canupgrade

killtrigger CANTUPGRADE
settextlinetrigger GETCOLOS :GETCOLOS "Colonists to support the construction,"
settextlinetrigger GETFUEL :GETFUEL "units of Fuel Ore,"
settextlinetrigger GETORG :GETORG "units of Organics,"
settextlinetrigger GETEQUIP :GETEQUIP "units of Equipment and"
settextlinetrigger GETDAYS :GETDAYS "days to construct."
pause
:planetupgrade~getcolos

getword CURRENTLINE $planetupgrade~colosneeded 1
pause
:planetupgrade~getfuel

getword CURRENTLINE $planetupgrade~fuelneeded 1
pause
:planetupgrade~getorg

getword CURRENTLINE $planetupgrade~orgneeded 1
pause
:planetupgrade~getequip

getword CURRENTLINE $planetupgrade~equipneeded 1
pause
:planetupgrade~getdays

getword CURRENTLINE $planetupgrade~daysneeded 1
striptext $planetupgrade~colosneeded ","
striptext $planetupgrade~fuelneeded ","
striptext $planetupgrade~orgneeded ","
striptext $planetupgrade~equipneeded ","
divide $planetupgrade~colosneeded 1000


setvar $planetupgrade~totalcolos ($planetinfo~colo[1] + ($planetinfo~colo[2] + $planetinfo~colo[3]))
subtract $planetupgrade~colosneeded $planetupgrade~totalcolos
subtract $planetupgrade~fuelneeded $planetinfo~amount[1]
subtract $planetupgrade~orgneeded $planetinfo~amount[2]
subtract $planetupgrade~equipneeded $planetinfo~amount[3]

if (($planetupgrade~colosneeded <= 0) and (($planetupgrade~fuelneeded <= 0) and (($planetupgrade~orgneeded <= 0) and ($planetupgrade~equipneeded <= 0))))

  if ($planetupgrade~daysneeded = 0)



    setdelaytrigger UPGRADEPAUSE :UPGRADEPAUSE 1000
    pause
    :planetupgrade~upgradepause

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
  gosub :gather~gather

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
  gosub :gather~gather

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
  gosub :gather~gather

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
  gosub :gather~gather

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end


send "l" $planetupgrade~planetid "*"
goto :PLANETUPGRADE
