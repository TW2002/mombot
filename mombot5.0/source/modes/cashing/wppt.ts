gosub :BOT~loadVars

setVar $BOT~help[1]   $BOT~tab&"- wppt {holoscan} {evade} {pay}"
setVar $BOT~help[2]   $BOT~tab&"  World PPT using the legacy worldtrade engine                     "
setVar $BOT~help[3]   $BOT~tab&"                                                                  "
setVar $BOT~help[4]   $BOT~tab&"     {holoscan}      0 - doesn't holoscan                         "
setVar $BOT~help[5]   $BOT~tab&"                     1 - holoscans on odd densities               "
setVar $BOT~help[6]   $BOT~tab&"                     2 - always holoscans (default)               "
setVar $BOT~help[7]   $BOT~tab&"                                                                  "
setVar $BOT~help[8]   $BOT~tab&"     {evade}         0 - normal (default)                         "
setVar $BOT~help[9]   $BOT~tab&"                     1 - paranoid                                 "
setVar $BOT~help[10]  $BOT~tab&"                     2 - avoids nothing                           "
setVar $BOT~help[11]  $BOT~tab&"                                                                  "
setVar $BOT~help[12]  $BOT~tab&"     {pay}             - pays tolls                               "
setVar $BOT~help[13]  $BOT~tab&"                                                                  "
setVar $BOT~help[14]  $BOT~tab&"     Fig type/count come from your Mombot tab-~ preferences      "

gosub :BOT~helpfile

setVar $BOT~script_title "World PPT"
gosub :BOT~banner

setTextLineTrigger prompt :allPrompts #145 & #8
send #145&"/"
pause
:allPrompts
getWord CURRENTLINE $CURRENT_PROMPT 1
stripText $CURRENT_PROMPT #145
stripText $CURRENT_PROMPT #8
killalltriggers

if ($CURRENT_PROMPT <> "Command")
  clientMessage "This script must be run from the command menu"
  halt
end

reqRecording
logging off

# Native haggle owns the offer flow for wppt.
setVar $haggle~hagglefactor 0
setVar $PPT~BATCHMODE 0

if (($bot~parm1 = 0) OR ($bot~parm1 = 1) OR ($bot~parm1 = 2))
  setVar $Move~ScanHolo $bot~parm1
else
  setVar $Move~ScanHolo 2
end

if (($bot~parm2 = 0) OR ($bot~parm2 = 1) OR ($bot~parm2 = 2))
  setVar $Move~Evasion $bot~parm2
else
  setVar $Move~Evasion 0
end

getWordPos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
  setVar $Move~Attack 3
else
  setVar $Move~Attack 2
end
setVar $Move~PortPriority 1

if ($PLAYER~DROPOFFENSIVE = TRUE)
  setVar $WPPT~DEPLOYFIG "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setVar $WPPT~DEPLOYFIG "t"
else
  setVar $WPPT~DEPLOYFIG "d"
end

if ($PLAYER~SURROUNDFIGS > 0)
  setVar $Move~ExtraSend "f z" & $PLAYER~SURROUNDFIGS & "*zc" & $WPPT~DEPLOYFIG & "*  "
  setVar $Move~ExtraSendAll 1
  setVar $PPT~DropFigs 1
else
  setVar $Move~ExtraSend ""
  setVar $Move~ExtraSendAll 0
  setVar $PPT~DropFigs 0
end

loadVar $PPT~SAVED
if ($PPT~SAVED)
  loadVar $PPT~PERCTRADE
else
  setVar $PPT~PERCTRADE 20
  saveVar $PPT~PERCTRADE
  setVar $PPT~SAVED 1
  saveVar $PPT~SAVED
end

setVar $PortCheck~Danger 1
setVar $PortCheck~FuelOrganics 1
setVar $PortCheck~PortType 1

:Menu_Go
setVar $WorldTrade~Quota 0
setEventTrigger disconnect :disconnected "Connection lost"
gosub :WorldTrade~WorldTrade
goto :shutdown

:disconnected
killAllTriggers
waitFor "Command [TL="
goto :Menu_Go

:shutdown
halt

:ppt~ppt
gosub :PLAYER~QUIKSTATS

setvar $ppt~ore $PLAYER~ORE_HOLDS
setvar $ppt~org $PLAYER~ORGANIC_HOLDS
setvar $ppt~equip $PLAYER~EQUIPMENT_HOLDS
setvar $ppt~holds $PLAYER~TOTAL_HOLDS
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

getwordpos $ppt~line $ppt~x "Fuel"
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
  if (($ppt~tradeproduct = "None") and ($ppt~onhand <> "None"))
    setvar $ppt~tradeproduct $ppt~onhand
  end

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

:worldtrade~worldtrade
setvar $move~checksub ":WORLDTRADE~SUB_MOVECHECK"
setvar $worldtrade~credits 0
setvar $worldtrade~checked 0

setvar $gameprefs~bank "WorldTrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs
:worldtrade~start
if (($worldtrade~credits >= $worldtrade~quota) and ($worldtrade~quota > 0))
  return
end

if (($BOT~BOT_TURN_LIMIT > 0) and ($PLAYER~UNLIMITEDGAME <> TRUE))
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~TURNS <= $BOT~BOT_TURN_LIMIT)
    send "'{" $BOT~BOT_NAME "} - Turns too low to continue.*"
    return
  end
end

send "d"
gosub :move~move

goto :WORLDTRADE~START
:worldtrade~sub_movecheck
if ($worldtrade~checked)
  setvar $worldtrade~checked 0
elseif ((SECTOR.FIGS.OWNER[$move~cursector] = "yours") or (SECTOR.FIGS.OWNER[$move~cursector] = "belong to your Corp") or (SECTOR.FIGS.QUANTITY[$move~cursector] = 0))
  setvar $portcheck~sector $move~cursector
  setvar $portcheck~scanned 0
  setvar $portcheck~porttype 1
  gosub :WORLDTRADE~PORTCHECK
  setvar $move~noscan $portcheck~scanned

  if ($portcheck~pair > 0)
    setvar $ppt~sectora $move~cursector
    setvar $ppt~sectorb $portcheck~pair
    setvar $ppt~proda $portcheck~tradeproda
    setvar $ppt~prodb $portcheck~tradeprodb
    gosub :ppt~ppt

    if ($ppt~aborted = 0)
      if ($haggle~hagglefactor = 0)
        gosub :PLAYER~QUIKSTATS
        setvar $worldtrade~credits $PLAYER~CREDITS
      else
        setvar $worldtrade~credits $haggle~credits
      end

      setvar $move~found 1
    end

    setvar $worldtrade~checked 1
  end
end

return

:WORLDTRADE~PORTCHECK
setvar $portcheck~pair 0
setvar $portcheck~figged 0

if ($portcheck~porttype = 1)
  if ((PORT.CLASS[$portcheck~sector] < 1) or (PORT.CLASS[$portcheck~sector] > 8))
    setvar $portcheck~ignore 0
    return
  end
else
  if (PORT.BUYEQUIP[$portcheck~sector] = 0)
    setvar $portcheck~ignore 0
    return
  end
end

if ($portcheck~scanned = 0)
  send "sd"
  waiton "Relative Density Scan"
  waiton "Command [TL="
  setvar $portcheck~scanned 1
end

if ($portcheck~scanned = 1)
  setvar $portcheck~holoscan 0
  setvar $portcheck~i 1

  while ($portcheck~i <= SECTOR.WARPCOUNT[$portcheck~sector])
    setvar $portcheck~sect SECTOR.WARPS[$portcheck~sector][$portcheck~i]

    if ((PORT.CLASS[$portcheck~sect] > 0) or (SECTOR.DENSITY[$portcheck~sect] >= 100))
      setvar $portcheck~holoscan 1
    end

    add $portcheck~i 1
  end

  if ($portcheck~holoscan)
    send "sh"
    waiton "Long Range Scan"
    waiton "Command [TL="
    setvar $portcheck~scanned 2
  end
end

if ($portcheck~scanned = 2)
  setvar $portcheck~i 1
  setvar $portcheck~class PORT.CLASS[$portcheck~sector]
  setvar $portcheck~tradeproda ""
  setvar $portcheck~tradeprodb ""

  while (($portcheck~i <= SECTOR.WARPCOUNT[$portcheck~sector]) and ($portcheck~tradeproda = ""))
    setvar $portcheck~sect SECTOR.WARPS[$portcheck~sector][$portcheck~i]
    setvar $portcheck~pairclass PORT.CLASS[$portcheck~sect]

    if (($portcheck~pairclass > 0) and ((($portcheck~pairclass < 9) and ((((SECTOR.FIGS.QUANTITY[$portcheck~sect] = 0) or (SECTOR.FIGS.OWNER[$portcheck~sect] = "yours") or (SECTOR.FIGS.OWNER[$portcheck~sect] = "belong to your Corp") or ((($portcheck~danger = 1) and (SECTOR.FIGS.OWNER[$portcheck~sect] <> "Rogue Mercenaries")) and (SECTOR.FIGS.QUANTITY[$portcheck~sect] <= 20)) or ($portcheck~danger = 2)) and ((((SECTOR.MINES.QUANTITY[$portcheck~sect] = 0) or (SECTOR.MINES.OWNER[$portcheck~sect] = "yours") or (SECTOR.MINES.OWNER[$portcheck~sect] = "belong to your Corp") or (($portcheck~danger = 1) and (SECTOR.MINES.QUANTITY[$portcheck~sect] <= 5)) or ($portcheck~danger = 2)) and ((((SECTOR.NAVHAZ[$portcheck~sect] = 0) or ((SECTOR.NAVHAZ[$portcheck~sect] <= 3) and ($portcheck~danger = 1)) or ($portcheck~danger = 2)) and ((((SECTOR.PLANETCOUNT[$portcheck~sect] = 0) or ($portcheck~danger = 2)) and ((SECTOR.TRADERCOUNT[$portcheck~sect] = 0) or ($portcheck~danger = 2)))))))))))))
      if ($portcheck~porttype = 1)
        gosub :WORLDTRADE~SUB_PPTCHECK
      else
        if (PORT.BUYEQUIP[$portcheck~sect])
          setvar $portcheck~tradeproda "Equipment"
        end
      end

      if ($portcheck~tradeproda <> "")
        subtract $portcheck~ignore 1

        if ($portcheck~ignore >= 0)
          setvar $portcheck~tradeproda ""
          setvar $portcheck~tradeprodb ""
        else
          setvar $portcheck~pair $portcheck~sect
        end
      end
    end

    add $portcheck~i 1
  end
end

setvar $portcheck~ignore 0
return

:WORLDTRADE~SUB_PPTCHECK
if (($portcheck~class = 1) and ($portcheck~pairclass = 2))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 1) and ($portcheck~pairclass = 3))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 1) and ($portcheck~pairclass = 4))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 2) and ($portcheck~pairclass = 1))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 2) and (($portcheck~pairclass = 3) and $portcheck~fuelorganics))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 2) and ($portcheck~pairclass = 5))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 3) and ($portcheck~pairclass = 1))
  setvar $portcheck~tradeproda "Fuel"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 3) and (($portcheck~pairclass = 2) and $portcheck~fuelorganics))
  setvar $portcheck~tradeproda "Fuel"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 3) and ($portcheck~pairclass = 6))
  setvar $portcheck~tradeproda "Fuel"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 1))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 5))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 4) and ($portcheck~pairclass = 6))
  setvar $portcheck~tradeproda "Fuel"
  setvar $portcheck~tradeprodb "Equipment"
end
if (($portcheck~class = 5) and ($portcheck~pairclass = 2))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 5) and ($portcheck~pairclass = 4))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 5) and (($portcheck~pairclass = 6) and $portcheck~fuelorganics))
  setvar $portcheck~tradeproda "Fuel"
  setvar $portcheck~tradeprodb "Organics"
end
if (($portcheck~class = 6) and ($portcheck~pairclass = 3))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 6) and ($portcheck~pairclass = 4))
  setvar $portcheck~tradeproda "Equipment"
  setvar $portcheck~tradeprodb "Fuel"
end
if (($portcheck~class = 6) and (($portcheck~pairclass = 5) and $portcheck~fuelorganics))
  setvar $portcheck~tradeproda "Organics"
  setvar $portcheck~tradeprodb "Fuel"
end
return

# includes:
include "source\include\bot"
include "source\include\haggle"
include "source\include\move"
include "source\include\player"
include "source\include\gameprefs"
