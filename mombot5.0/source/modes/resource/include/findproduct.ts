:findproduct~findproduct

if ($findproduct~sector = 0)
  send "d"
  settextlinetrigger GETSECTOR :GETSECTOR "Sector  : "
  pause
  :findproduct~getsector
  getword CURRENTLINE $findproduct~sector 3
end

setvar $findproduct~location 0

if (SECTOR.PLANETCOUNT[$findproduct~sector] > 0)

  setvar $planetcheck~ignorelist $findproduct~ignorelist
  setvar $planetcheck~planetchecksub ":FINDPRODUCT~CHECKPRODUCT"
  gosub :planetcheck~planetcheck

  if ($planetcheck~found > 0)
    setvar $findproduct~location $planetcheck~found

    if ($findproduct~stayonplanet = 0)
      send "q"
    end

    return
  end
end


if ((PORT.CLASS[$findproduct~sector] > 0) and (PORT.CLASS[$findproduct~sector] < 8))
  if ((PORT.BUYFUEL[$findproduct~sector] = 0) and ($findproduct~product = 1)) or ((PORT.BUYORG[$findproduct~sector] = 0) and ($findproduct~product = 2)) or ((PORT.BUYEQUIP[$findproduct~sector] = 0) and ($findproduct~product = 3))
    send "cr*q"

    waiton "Commerce report for "

    if ($findproduct~product = 1)
      settextlinetrigger GETPRODUCT :GETPRODUCT "Fuel Ore   "
    elseif ($findproduct~product = 2)
      settextlinetrigger GETPRODUCT :GETPRODUCT "Organics   "
    else
      settextlinetrigger GETPRODUCT :GETPRODUCT "Equipment  "
    end
    pause
    :findproduct~getproduct

    if ($findproduct~product = 1)
      getword CURRENTLINE $findproduct~prodamount 4
    else
      getword CURRENTLINE $findproduct~prodamount 3
    end

    if ($findproduct~prodamount >= $findproduct~quantity)
      setvar $findproduct~location "P"
    end
  end
end

return
:findproduct~checkproduct


setvar $planetinfo~noheader 1
gosub :planetinfo~planetinfo

if ($findproduct~product = "C")


  setvar $findproduct~i 1
  while ($findproduct~i <= 3)
    if ($planetinfo~colo[$findproduct~i] >= $findproduct~quantity)
      setvar $findproduct~category $findproduct~i
      setvar $planetcheck~found 1
      return
    end
    add $findproduct~i 1
  end
else
  if ($planetinfo~amount[$findproduct~product] >= $findproduct~quantity)
    setvar $planetcheck~found 1
  end
end

if ($planetcheck~found = 0)
  setvar $findproduct~ignorelist $findproduct~ignorelist&" "&$planetcheck~check_planet
end

return
