:ppt~ppt
gosub :playerinfo~infoquick

setvar $ppt~ore $playerinfo~ore
setvar $ppt~org $playerinfo~org
setvar $ppt~equip $playerinfo~equip
setvar $ppt~holds $playerinfo~holds
setvar $ppt~displayoff 0
setvar $ppt~aborted 0

if ($ppt~ore > 0)
  setvar $ppt~onhand "Fuel"
elseif ($ppt~org > 0)
  setvar $ppt~onhand "Organics"
elseif ($ppt~equip > 0)
  setvar $ppt~onhand "Equipment"
else
  setvar $ppt~onhand "None"
end

setvar $ppt~oneway 0

if ($ppt~batchmode = 0)
  setvar $ppt~batchmode 0
end

send "cr*r" $ppt~sectorb "*q"

settextlinetrigger PPTREPORTA :PPT~REPORTA "Commerce report for"
settextlinetrigger PPTNOPORTA :PPT~NOPORT "I have no information about a port in that sector."
pause
:ppt~reporta
killalltriggers
settextlinetrigger GETSELLPRODUCTA :PPT~GETSELLPRODUCTA $ppt~proda
settextlinetrigger GETBUYPRODUCTA :PPT~GETBUYPRODUCTA $ppt~prodb
settexttrigger GOTPRODUCTA :PPT~GOTPRODUCTA "Computer command"
pause
:ppt~getsellproducta
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamounta 3
pause
:ppt~getbuyproducta
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamounta 3
pause
:ppt~gotproducta
killalltriggers

settextlinetrigger PPTREPORTB :PPT~REPORTB "Commerce report for"
settextlinetrigger PPTNOPORTB :PPT~NOPORT "I have no information about a port in that sector."
pause
:ppt~reportb
killalltriggers
settextlinetrigger GETSELLPRODUCTB :PPT~GETSELLPRODUCTB $ppt~prodb
settextlinetrigger GETBUYPRODUCTB :PPT~GETBUYPRODUCTB $ppt~proda
settexttrigger GOTPRODUCTB :PPT~GOTPRODUCTB "Computer command"
pause
:ppt~getsellproductb
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamountb 3
pause
:ppt~getbuyproductb
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamountb 3
pause
:ppt~gotproductb
killalltriggers
goto :PPT~AFTERREPORTS

:ppt~noport
killalltriggers
setvar $ppt~sector $ppt~sectora
setvar $ppt~aborted 1
waiton "Command [TL="
return

:ppt~afterreports
setvar $ppt~trade 100
setvar $ppt~x 100
multiply $ppt~x $ppt~holds
subtract $ppt~trade $ppt~perctrade
multiply $ppt~sellamounta $ppt~trade
multiply $ppt~sellamountb $ppt~trade
multiply $ppt~buyamounta $ppt~trade
multiply $ppt~buyamountb $ppt~trade
divide $ppt~sellamounta $ppt~x
divide $ppt~sellamountb $ppt~x
divide $ppt~buyamounta $ppt~x
divide $ppt~buyamountb $ppt~x

if ($haggle~hagglefactor = 0)
  setvar $ppt~clock 4
else
  setvar $ppt~clock 0
end

if (($ppt~sellamounta <= 1) or ($ppt~sellamountb <= 1) or ($ppt~buyamounta <= 1) or ($ppt~buyamountb <= 1))
  setvar $ppt~sector $ppt~sectora
  setvar $ppt~aborted 1
  return
end

if (($ppt~sectora <> STARDOCK) and ($ppt~sectora > 10))
  if ($ppt~dropfigs = 1)
    send $move~extrasend
  end
  send "jy"
  setvar $ppt~onhand "None"
end

setvar $ppt~firstrun 1
:ppt~porta
if ($ppt~batchmode <> 1)
  if (($ppt~sellamounta <= 0) or ($ppt~buyamountb <= 0))
    setvar $ppt~native_buyproduct "None"
  else
    setvar $ppt~native_buyproduct $ppt~proda
  end
  gosub :PPT~NATIVEPORT
  goto :PPT~PORTA_AFTER
end

:ppt~porta_batch
send "pt"
if ($haggle~hagglefactor = 0)
  if ($ppt~onhand <> "None")
    send "*"
  end
  if (($ppt~sellamounta <= 0) or ($ppt~buyamountb <= 0))
    if (PORT.CLASS[$ppt~sectora] < 8)
      send "0*"
    end
    if (PORT.CLASS[$ppt~sectora] > 3)
      send "0*"
    end
  else
    if (PORT.BUYFUEL[$ppt~sectora] = 0)
      if ($ppt~proda = "Fuel")
        send "*"
      else
        send "0*"
      end
    end
    if (PORT.BUYORG[$ppt~sectora] = 0)
      if ($ppt~proda = "Organics")
        send "*"
      else
        send "0*"
      end
    end
    if (PORT.BUYEQUIP[$ppt~sectora] = 0)
      if ($ppt~proda = "Equipment")
        send "*"
      else
        send "0*"
      end
    end

    setvar $ppt~onhand $ppt~proda
  end

  if ($ppt~clock > 0)
    waitfor "<Port>"
    waitfor "Command [TL="
    subtract $ppt~clock 1
  end
else
  if (($ppt~sellamounta <= 0) or ($ppt~buyamountb <= 0))
    setvar $haggle~buyprod "none"
  else
    setvar $haggle~buyprod $ppt~proda
  end
  setvar $haggle~sector $ppt~sectora
  gosub :haggle~haggle
  setvar $ppt~credits $haggle~credits
  if ($haggle~abort = 1)
    goto :PPT~PORTA
  end
end
:ppt~porta_after
subtract $ppt~buyamounta 1
subtract $ppt~sellamounta 1

if (($ppt~sellamounta <= "-1") or ($ppt~buyamountb <= "-1"))
  setvar $ppt~sector $ppt~sectora
  if (($haggle~hagglefactor = 0) and ($ppt~batchmode = 1) and $ppt~displayoff)
    send "cn 9 qq"
  end
  return
end

if (($ppt~sectorb < 600) or (SECTORS > 5000))
  send $ppt~sectorb "*"
else
  send $ppt~sectorb
end

if ($ppt~firstrun = 1)
  setvar $ppt~firstrun 0

  if (($haggle~hagglefactor = 0) and ($ppt~batchmode = 1))
    setvar $ppt~displayoff 1
    send "cn 9 qq"
  end

  if (($ppt~sectorb <> STARDOCK) and (($ppt~sectorb > 10) and ($ppt~dropfigs = 1)))
    send $move~extrasend
  end

  waiton "Warping to Sector "&$ppt~sectorb
  waiton "Command [TL="

  getdistance $ppt~distance $ppt~sectorb $ppt~sectora
  if ($ppt~distance = 1)
    goto :PPT~PORTB
  else
    if (($haggle~hagglefactor = 0) and ($ppt~batchmode = 1) and $ppt~displayoff)
      send "cn 9 qq"
    end

    setvar $ppt~oneway 1
    setvar $ppt~sector $ppt~sectorb

    if (($ppt~sectorb > 10) and ($ppt~sectorb <> STARDOCK))
      send "jy"
    end
    return
  end
else
  waiton "Command [TL="
end
:ppt~portb
if ($ppt~batchmode <> 1)
  if (($ppt~sellamountb <= 0) or ($ppt~buyamounta <= 0))
    setvar $ppt~native_buyproduct "None"
  else
    setvar $ppt~native_buyproduct $ppt~prodb
  end
  gosub :PPT~NATIVEPORT
  goto :PPT~PORTB_AFTER
end

:ppt~portb_batch

send "pt"
if ($haggle~hagglefactor = 0)
  if ($ppt~onhand <> "None")
    send "*"
  end
  if (($ppt~sellamountb <= 0) or ($ppt~buyamounta <= 0))
    if (PORT.CLASS[$ppt~sectorb] < 8)
      send "0*"
    end
    if (PORT.CLASS[$ppt~sectorb] > 3)
      send "0*"
    end
  else
    if (PORT.BUYFUEL[$ppt~sectorb] = 0)
      if ($ppt~prodb = "Fuel")
        send "*"
      else
        send "0*"
      end
    end
    if (PORT.BUYORG[$ppt~sectorb] = 0)
      if ($ppt~prodb = "Organics")
        send "*"
      else
        send "0*"
      end
    end
    if (PORT.BUYEQUIP[$ppt~sectorb] = 0)
      if ($ppt~prodb = "Equipment")
        send "*"
      else
        send "0*"
      end
    end

    setvar $ppt~onhand $ppt~prodb
  end

  if ($ppt~clock > 0)
    waitfor "<Port>"
    waitfor "Command [TL="
    subtract $ppt~clock 1
  end
else
  if (($ppt~sellamountb <= 0) or ($ppt~buyamounta <= 0))
    setvar $haggle~buyprod "none"
  else
    setvar $haggle~buyprod $ppt~prodb
  end
  setvar $haggle~sector $ppt~sectorb
  gosub :haggle~haggle
  setvar $ppt~credits $haggle~credits
  if ($haggle~abort = 1)
    goto :PPT~PORTB
  end
end
:ppt~portb_after

subtract $ppt~buyamountb 1
subtract $ppt~sellamountb 1

if (($ppt~sellamountb <= "-1") or ($ppt~buyamounta <= "-1"))
  if (($haggle~hagglefactor = 0) and ($ppt~batchmode = 1) and $ppt~displayoff)
    send "cn 9 qq"
  end

  setvar $ppt~sector $ppt~sectorb
  return
end

if (($ppt~sectora < 600) or (SECTORS > 5000))
  send $ppt~sectora "*"
else
  send $ppt~sectora
end

waiton "Command [TL="

goto :PPT~PORTA

:ppt~nativeport
setvar $ppt~portactive 0
send "pt"
:ppt~nativeport_wait
settextlinetrigger PPTSTART1 :PPT~NATIVEPORT_PROGRESS "<Port>"
settextlinetrigger PPTSTART2 :PPT~NATIVEPORT_PROGRESS "Docking..."
settexttrigger PPTSTART3 :PPT~NATIVEPORT_PROGRESS "Your offer ["
settexttrigger PPTQTY :PPT~NATIVEPORT_QTY "How many holds of "
if ($ppt~portactive = 1)
  settexttrigger PPTDONE1 :PPT~NATIVEPORT_DONE "Command [TL="
  settexttrigger PPTDONE2 :PPT~NATIVEPORT_DONE "Citadel command"
end
pause

:ppt~nativeport_progress
killalltriggers
setvar $ppt~portactive 1
goto :PPT~NATIVEPORT_WAIT

:ppt~nativeport_qty
killalltriggers
setvar $ppt~portactive 1
setvar $ppt~line CURRENTLINE
gosub :PPT~HANDLENATIVEQTY
goto :PPT~NATIVEPORT_WAIT

:ppt~nativeport_done
killalltriggers
return

:ppt~handlenativeqty
setvar $ppt~tradeproduct "None"
setvar $ppt~isbuy 0
setvar $ppt~issell 0

getwordpos $ppt~line $ppt~x " do you want to buy "
if ($ppt~x > 0)
  setvar $ppt~isbuy 1
else
  setvar $ppt~issell 1
end

getwordpos $ppt~line $ppt~x "Fuel Ore"
if ($ppt~x > 0)
  setvar $ppt~tradeproduct "Fuel"
else
  getwordpos $ppt~line $ppt~x "Organics"
  if ($ppt~x > 0)
    setvar $ppt~tradeproduct "Organics"
  else
    getwordpos $ppt~line $ppt~x "Equipment"
    if ($ppt~x > 0)
      setvar $ppt~tradeproduct "Equipment"
    end
  end
end

if ($ppt~issell = 1)
  if (($ppt~onhand <> "None") and ($ppt~tradeproduct = $ppt~onhand))
    send "*"
    setvar $ppt~onhand "None"
  else
    send "0*"
  end
  return
end

if (($ppt~isbuy = 1) and ($ppt~tradeproduct = $ppt~native_buyproduct))
  send "*"
  setvar $ppt~onhand $ppt~tradeproduct
else
  send "0*"
end
return
