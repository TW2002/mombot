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

  setvar $planet~planetcheck_ignorelist $findproduct~ignorelist
  setvar $planet~planetchecksub ":FINDPRODUCT~CHECKPRODUCT"
  gosub :planet~planetcheck

  if ($planet~planetcheck_found > 0)
    setvar $findproduct~location $planet~planetcheck_found

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


setvar $planet~noheader 1
gosub :planet~planetinfo

if ($findproduct~product = "C")


  setvar $findproduct~i 1
  while ($findproduct~i <= 3)
    if ($planet~colo[$findproduct~i] >= $findproduct~quantity)
      setvar $findproduct~category $findproduct~i
      setvar $planet~planetcheck_found 1
      return
    end
    add $findproduct~i 1
  end
else
  if ($planet~amount[$findproduct~product] >= $findproduct~quantity)
    setvar $planet~planetcheck_found 1
  end
end

if ($planet~planetcheck_found = 0)
  setvar $findproduct~ignorelist $findproduct~ignorelist&" "&$planet~planetcheck_check_planet
end

return

include "source\include\planet"
