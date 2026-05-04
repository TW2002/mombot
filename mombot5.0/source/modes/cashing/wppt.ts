gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setVar $HELP~HELP[1]   $HELP~TAB&"- wppt {holoscan} {evade} {pay}"
setVar $HELP~HELP[2]   $HELP~TAB&"  World PPT using the legacy worldtrade engine                     "
setVar $HELP~HELP[3]   $HELP~TAB&"                                                                  "
setVar $HELP~HELP[4]   $HELP~TAB&"     {holoscan}      0 - doesn't holoscan                         "
setVar $HELP~HELP[5]   $HELP~TAB&"                     1 - holoscans on odd densities               "
setVar $HELP~HELP[6]   $HELP~TAB&"                     2 - always holoscans (default)               "
setVar $HELP~HELP[7]   $HELP~TAB&"                                                                  "
setVar $HELP~HELP[8]   $HELP~TAB&"     {evade}         0 - normal (default)                         "
setVar $HELP~HELP[9]   $HELP~TAB&"                     1 - paranoid                                 "
setVar $HELP~HELP[10]  $HELP~TAB&"                     2 - avoids nothing                           "
setVar $HELP~HELP[11]  $HELP~TAB&"                                                                  "
setVar $HELP~HELP[12]  $HELP~TAB&"     {pay}             - pays tolls                               "
setVar $HELP~HELP[13]  $HELP~TAB&"                                                                  "
setVar $HELP~HELP[14]  $HELP~TAB&"     {fast}            - go fast, turn left :)                    "
setVar $HELP~HELP[15]  $HELP~TAB&"                                                                  "
setVar $HELP~HELP[16]  $HELP~TAB&"     Fig type/count come from your Mombot tab-~ preferences      "

gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "World PPT starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

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

getWordPos " "&$bot~user_command_line&" " $pos " fast "
if ($pos > 0)
  setVar $batch 1
  if (HAGGLE)
    setvar $haggle_switch 1
    autohaggle off
  end
else
  setVar $batch 0
end

getWordPos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
  setVar $Move~Attack 3
else
  setVar $Move~Attack 2
end
setVar $Move~PortPriority 1

if ($PLAYER~DROPOFFENSIVE = TRUE)
  setVar $WPPT_DEPLOYFIG "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setVar $WPPT_DEPLOYFIG "t"
else
  setVar $WPPT_DEPLOYFIG "d"
end

if ($PLAYER~SURROUNDFIGS > 0)
  setVar $Move~ExtraSend "f z" & $PLAYER~SURROUNDFIGS & "*zc" & $WPPT_DEPLOYFIG & "*  "
  setVar $Move~ExtraSendAll 1
  setVar $PPT_DROPFIGS 1
else
  setVar $Move~ExtraSend ""
  setVar $Move~ExtraSendAll 0
  setVar $PPT_DROPFIGS 0
end

loadVar $PPT_SAVED
if ($PPT_SAVED)
  loadVar $PPT_PERCTRADE
else
  setVar $PPT_PERCTRADE 20
  saveVar $PPT_PERCTRADE
  setVar $PPT_SAVED 1
  saveVar $PPT_SAVED
end

setVar $PortCheck~Danger 1
setVar $PortCheck~FuelOrganics 1
setVar $PortCheck~PortType 1

:Menu_Go
setVar $WorldTrade~Quota 0
setEventTrigger disconnect :disconnected "Connection lost"
gosub :worldtrade
goto :shutdown

:disconnected
killAllTriggers
waitFor "Command [TL="
goto :Menu_Go

:shutdown
halt

:ppt
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

send "cr*r" $ppt~sectorb "*q"

settextlinetrigger PPTREPORTA :ppt_reporta "Commerce report for"
settextlinetrigger PPTNOPORTA :ppt_noport "I have no information about a port in that sector."
pause
:ppt_reporta
killalltriggers
settextlinetrigger GETSELLPRODUCTA :ppt_getsellproducta $ppt~proda
settextlinetrigger GETBUYPRODUCTA :ppt_getbuyproducta $ppt~prodb
settexttrigger GOTPRODUCTA :ppt_gotproducta "Computer command"
pause
:ppt_getsellproducta
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamounta 3
pause
:ppt_getbuyproducta
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamounta 3
pause
:ppt_gotproducta
killalltriggers

settextlinetrigger PPTREPORTB :ppt_reportb "Commerce report for"
settextlinetrigger PPTNOPORTB :ppt_noport "I have no information about a port in that sector."
pause
:ppt_reportb
killalltriggers
settextlinetrigger GETSELLPRODUCTB :ppt_getsellproductb $ppt~prodb
settextlinetrigger GETBUYPRODUCTB :ppt_getbuyproductb $ppt~proda
settexttrigger GOTPRODUCTB :ppt_gotproductb "Computer command"
pause
:ppt_getsellproductb
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~sellamountb 3
pause
:ppt_getbuyproductb
setvar $ppt~line CURRENTLINE
striptext $ppt~line "Ore"
getword $ppt~line $ppt~buyamountb 3
pause
:ppt_gotproductb
killalltriggers
goto :ppt_afterreports

:ppt_noport
killalltriggers
setvar $ppt~sector $ppt~sectora
setvar $ppt~aborted 1
waiton "Command [TL="
return

:ppt_afterreports
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

if ($batch)
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

:ppt_porta
send "pt"
if ($batch)
  if ($ppt~onhand <> "None")
    send "**"
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
        send "**"
      else
        send "0*"
      end
    end
    if (PORT.BUYORG[$ppt~sectora] = 0)
      if ($ppt~proda = "Organics")
        send "**"
      else
        send "0*"
      end
    end
    if (PORT.BUYEQUIP[$ppt~sectora] = 0)
      if ($ppt~proda = "Equipment")
        send "**"
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
    goto :ppt_porta
  end
end
subtract $ppt~buyamounta 1
subtract $ppt~sellamounta 1

if (($ppt~sellamounta <= "-1") or ($ppt~buyamountb <= "-1"))
  setvar $ppt~sector $ppt~sectora
  if (($batch) and $ppt~displayoff)
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

  if ($batch)
    setvar $ppt~displayoff 1
    send "cn 9 qq"
  end

  if (($ppt~sectorb <> STARDOCK) and (($ppt~sectorb > 10) and ($ppt~dropfigs = 1)))
    send "f1*ct"
  end

  waiton "Warping to Sector "&$ppt~sectorb
  waiton "Command [TL="

  getdistance $ppt~distance $ppt~sectorb $ppt~sectora
  if ($ppt~distance = 1)
    goto :ppt_portb
  else
    if (($batch) and $ppt~displayoff)
      send "cn 9 qq"
    end

    setvar $ppt~oneway 1
    setvar $ppt~sector $ppt~sectorb

    if (($ppt~sectorb > 10) and ($ppt~sectorb <> STARDOCK))
      send "jy"
    end
    return
  end
end

:ppt_portb
send "pt"

if ($batch)
  if ($ppt~onhand <> "None")
    send "**"
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
        send "**"
      else
        send "0*"
      end
    end
    if (PORT.BUYORG[$ppt~sectorb] = 0)
      if ($ppt~prodb = "Organics")
        send "**"
      else
        send "0*"
      end
    end
    if (PORT.BUYEQUIP[$ppt~sectorb] = 0)
      if ($ppt~prodb = "Equipment")
        send "**"
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
    goto :ppt_portb
  end
end

subtract $ppt~buyamountb 1
subtract $ppt~sellamountb 1

if (($ppt~sellamountb <= "-1") or ($ppt~buyamounta <= "-1"))
  if (($batch) and $ppt~displayoff)
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

goto :ppt_porta

:worldtrade
setvar $worldtrade~credits 0
setvar $worldtrade~checked 0

setvar $gameprefs~bank "WorldTrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

:worldtrade_start
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
gosub :move
goto :worldtrade_start

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
settextlinetrigger 1 :GETSECTOR "Sector  : "
pause

:getsector
getword CURRENTLINE $move~cursector 3

setvar $move~history[9] $move~history[8]
setvar $move~history[8] $move~history[7]
setvar $move~history[7] $move~history[6]
setvar $move~history[6] $move~history[5]
setvar $move~history[5] $move~history[4]
setvar $move~history[4] $move~history[3]
setvar $move~history[3] $move~history[2]
setvar $move~history[2] $move~history[1]
setvar $move~history[1] $move~cursector

if ($move~extrasendall = "")
  setvar $move~extrasendall 0
end

if ($move~confirmsector = 1)

  settextlinetrigger TOLLFIGS :TOLLFIGS "You have to destroy the fighters or pay"
  settextlinetrigger FIGS :FIGS "You have to destroy the fighters to remain"
  settexttrigger MINES :MINEPROMPT "Mined Sector:"
  settexttrigger ARRIVED :ARRIVED "Command [TL="
  pause

  :tollfigs
  setvar $move~paidtoll FALSE
  if ($move~attack = 3)

    send "py"
    setvar $move~paidtoll TRUE
  else

    send "a9999*"
  end
  pause

  :figs
  send "a9999*"
  pause

  :mineprompt
  send "*"
  pause

  :arrived
  killtrigger TOLLFIGS
  killtrigger FIGS
  killtrigger MINES
else
  waiton "Command [TL="
end

getsector $move~cursector $move~cursector
setvar $move~confirmsector 0
setvar $move~found 0
setvar $move~noscan 0

gosub :movecheck

if ($move~found = 1)
  return
end

if (($move~scanholo = 2) and ($move~noscan < 2))
  setvar $move~scannedholo 1
  send "shsd"
  waiton "Relative Density Scan"
  waiton "Command [TL="
elseif ($move~noscan = 0)
  setvar $move~scannedholo 0
  send "sd"
  waiton "Relative Density Scan"
  waiton "Command [TL="
end

getsector $move~cursector $move~cursector

:assess
setvar $move~i 1
setvar $move~bestscore 1000
setvar $move~bestwarp 0
setvar $move~bestattack 0
setvar $move~willholo 0

:testwarp
if ($move~cursector.warp[$move~i] > 0)
  setvar $move~score 0
  setvar $move~safe 1

  getsector $move~cursector.warp[$move~i] $move~thissector

  if ($move~evasion <> 2)
    if ($move~scannedholo = 0)


      if (($move~thissector.density <> 0) and ($move~thissector.density <> 100))
        if (($move~thissector.density = 5) or ($move~thissector.density = 105))
          setvar $move~safe 2
        else
          setvar $move~safe 0
        end
      end
    end
    if ($move~scannedholo = 1)


      if ($move~thissector.anomoly = "YES")

        setvar $move~safe 0
      end
      if (($move~thissector.figs.owner <> "belong to your Corp") and (($move~thissector.figs.owner <> "yours") and ($move~thissector.figs.quantity > 0)))
        if ($move~evasion = 1)
          setvar $move~safe 0
        else


          setvar $move~safe 2

          if ($move~thissector.figs.quantity > 20)
            setvar $move~safe 0
          end
        end
      end
      if ($move~thissector.density > 0)
        setvar $move~density $move~thissector.density

        if ($move~thissector.figs.quantity > 0)
          setvar $move~x $move~thissector.figs.quantity
          multiply $move~x 5
          subtract $move~density $move~x
        end

        if ((($move~density <> 100) or ($move~thissector.port.exists = 0)) and ($move~density > 0))
          setvar $move~safe 0
        end
      end
    end
  end


  if (($move~safe = 2) and ($move~evasion = 1))
    add $move~score 500
  end

  if ($move~safe = 0)
    add $move~score 500
    setvar $move~willholo 1
  end

  setvar $move~x 1

  :checkhistory
  if ($move~x <= 10)
    if ($move~history[$move~x] = $move~cursector.warp[$move~i])
      setvar $move~m 10
      subtract $move~m $move~x
      multiply $move~m 10
      add $move~score $move~m
    end
    add $move~x 1
    goto :checkhistory
  end

  if ($move~portpriority = 1)

    if (($move~scannedholo = 1) and ($move~thissector.port.exists = 1)) or (($move~scannedholo = 0) and ($move~thissector.density = 100))
      subtract $move~score 3
    end
  end

  if ($move~dedpriority = 1)

    if ($move~thissector.warps = 1)
      subtract $move~score 3
    end
  end

  getrnd $move~random 1 5
  add $move~score $move~random

  if ($move~score < $move~bestscore)
    setvar $move~bestscore $move~score
    setvar $move~bestwarp $move~cursector.warp[$move~i]
    setvar $move~bestsafe $move~safe
  end

  add $move~i 1
  goto :testwarp
end

if ($move~bestscore > 400)
  setvar $move~willholo 1
end

if (($move~willholo = 1) and (($move~scannedholo = 0) and ($move~scanholo = 1)))
  send "sh"
  waitfor "Sector  : "
  waitfor "Command [TL="
  setvar $move~scannedholo 1
  goto :assess
end

if (($move~bestscore > 400) and ($move~evasion = 1))
  clientmessage "No safe options!"
  halt
end

setvar $move~figcount SECTOR.FIGS.QUANTITY[$move~cursector]

if (($move~paidtoll <> TRUE) and ($move~extrasend <> ""))
  if (($move~extrasendall = 1) and (($move~cursector > 10) and ($move~cursector <> STARDOCK)))
    send $move~extrasend
  elseif (($move~figcount <= 0) and (($move~cursector > 10) and (PORT.CLASS[$move~cursector] < 9)))
    send $move~extrasend
  end
end

if ((SECTORS > 5000) or ($move~bestwarp < 600))
  setvar $move~warpsuffix "*"
else
  setvar $move~warpsuffix "."
end

if (($move~bestsafe = 2) and ($move~attack = 1)) or ($move~attack = 2)
  send $move~bestwarp $move~warpsuffix "*na9999**"
else
  send $move~bestwarp $move~warpsuffix
  setvar $move~confirmsector 1
end

goto :MOVE

:movecheck
if ($worldtrade~checked)
  setvar $worldtrade~checked 0
elseif ((SECTOR.FIGS.OWNER[$move~cursector] = "yours") or (SECTOR.FIGS.OWNER[$move~cursector] = "belong to your Corp") or (SECTOR.FIGS.QUANTITY[$move~cursector] = 0))
  setvar $portcheck~sector $move~cursector
  setvar $portcheck~scanned 0
  setvar $portcheck~porttype 1
  gosub :portcheck
  setvar $move~noscan $portcheck~scanned

  if ($portcheck~pair > 0)
    setvar $ppt~sectora $move~cursector
    setvar $ppt~sectorb $portcheck~pair
    setvar $ppt~proda $portcheck~tradeproda
    setvar $ppt~prodb $portcheck~tradeprodb
    gosub :ppt

    if ($ppt~aborted = 0)
      if ($batch)
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

:portcheck
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
        gosub :pptcheck
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

:pptcheck
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
include "source\include\gameprefs"
include "source\include\player"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
