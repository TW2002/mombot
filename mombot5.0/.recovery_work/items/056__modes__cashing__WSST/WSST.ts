reqrecording

gosub :BOT~LOADVARS

loadvar $GAME~GENESIS_COST
loadvar $GAME~ATOMIC_COST
loadvar $MAP~STARDOCK
loadvar $BOT~FOLDER
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $PLANET~PLANET_FILE
loadvar $BOT~BOTISDEAF
loadvar $BOT~SILENT_RUNNING
loadvar $GAME~STEAL_FACTOR

setvar $BOT~COMMAND "wsst"

setvar $BOT~HELP[1] $BOT~TAB&"World Sell-Steal-Transport "
setvar $BOT~HELP[2] $BOT~TAB&" - wsst [ship2] {cash dropoff} {f} {s} {safe|passive} {furbpoint} "
setvar $BOT~HELP[3] $BOT~TAB&"   Options: "
setvar $BOT~HELP[4] $BOT~TAB&"     {cash dropoff} - if started from planet citadel  "
setvar $BOT~HELP[5] $BOT~TAB&"     {f}            - buy fighters"
setvar $BOT~HELP[6] $BOT~TAB&"     {s}            - buy shields "
setvar $BOT~HELP[7] $BOT~TAB&"     {safe}         - Will not mow to locations, scans and moves"
setvar $BOT~HELP[8] $BOT~TAB&"     {passive}      - Will be safe, as well as avoid any enemy fighters "
setvar $BOT~HELP[9] $BOT~TAB&"     {furbpoint}    - Terra, Dock (default), Alpha, Rylos "
setvar $BOT~HELP[10] $BOT~TAB&"     {limp}         - Will lay 3 limps/sector if Furbing at Dock. "
setvar $BOT~HELP[11] $BOT~TAB&"     {armid}        - Will lay 3 armids/sector if Furbing at Dock. "
setvar $BOT~HELP[12] $BOT~TAB&"     {quiet}        - Will not braodcast BUSTED msg's on SubSpace  "
setvar $BOT~HELP[13] $BOT~TAB&"     {x100}         - Will Drop 100 Fighters per sector "

gosub :BOT~HELPFILE

setvar $PLAYER~SAVE TRUE

goto :STARTING
:TRANSPORT

if ($INSHIP1)
  send "x     "&$PSST_SHIP2&"* q * "
  setvar $PLAYER~SHIP_NUMBER $PSST_SHIP2
else
  send "x     "&$PSST_SHIP1&"* q * "
  setvar $PLAYER~SHIP_NUMBER $PSST_SHIP1
end
savevar $PLAYER~SHIP_NUMBER
killtrigger 1
killtrigger 2
killtrigger 3
settextlinetrigger 1 :TRANSPORTED "Security code accepted"
settextlinetrigger 2 :NONEAVAILABLE "That is not an available ship."
settextlinetrigger 3 :OUTOFRANGE "only has a transport range of"
pause
:OUTOFRANGE
:NONEAVAILABLE
killtrigger 1
killtrigger 2
killtrigger 3
halt
goto :TRANSPORT
:TRANSPORTED
killtrigger 1
killtrigger 2
killtrigger 3
if ($INSHIP1)
  setvar $INSHIP1 FALSE
else
  setvar $INSHIP1 TRUE
end
setvar $PLAYER~TURNS ($PLAYER~TURNS - 1)
savevar $PLAYER~TURNS
return
:GOGO

window "CASH" 300 170 "World SST - "&GAMENAME "ONTOP"
gosub :DISPLAYCREDITS
while (TRUE)
  if (($PLAYER~UNLIMITEDGAME = FALSE) and ($PLAYER~TURNS <= $BOT~BOT_TURN_LIMIT))
    goto :ENDSST
  end
  gosub :FINDSSTPORTS
  setvar $BUSTED FALSE
  while ($BUSTED = FALSE)
    if (($PLAYER~UNLIMITEDGAME = FALSE) and ($PLAYER~TURNS <= $BOT~BOT_TURN_LIMIT))
      goto :ENDSST
    end
    gosub :STEAL
  end
  send "#"
  gosub :PLAYER~QUIKSTATS
  loadvar $BOT~ALARM_LIST
  if ($ALARM_ACTIVE and ($BOT~ALARM_LIST <> ""))
    loadvar $BOT~WHO_IS_ONLINE
    lowercase $BOT~ALARM_LIST
    lowercase $BOT~WHO_IS_ONLINE
    getwordpos $BOT~ALARM_LIST $POS ","
    if ($POS > 0)
      splittext $BOT~ALARM_LIST $ALARM ","
    else
      setarray $ALARM 1
      setvar $ALARM[1] $BOT~ALARM_LIST
      setvar $ALARM 1
    end
    setvar $I 1
    while ($I <= $ALARM)
      getwordpos $BOT~WHO_IS_ONLINE $POS " "&$ALARM[$I]&" "
      if ($POS > 0)
        send "'Alarm triggered by "&$ALARM[$I]&", contingency plan engaged.*"
        send "'"&$BOT~BOT_NAME&" x x*"
        halt
      end
      add $I 1
    end
  end
  setvar $MINREFURB (($PLAYER~EXPERIENCE / $GAME~STEAL_FACTOR) - 1)
  if ($MINREFURB > 255)
    setvar $MINREFURB 255
  end
  setvar $MINREFURB (($MINREFURB * 7) / 8)
  if (($SHIP1TOTALHOLDS < $MINREFURB) or ($SHIP2TOTALHOLDS < $MINREFURB))
    gosub :REFURB
  end
  if (($DROPCASHATBASE = TRUE) and ($PLAYER~CREDITS > $DROPCASHLIMIT))
    gosub :DROPCASHATBASE
  end
end
goto :ENDSST
:CHECKSSTSHIPS


setvar $FOUNDSHIP2 FALSE
killalltriggers
send "wn*"
settextlinetrigger OTHER :SHIPLINE " "&$PLAYER~CURRENT_SECTOR&" "
settextlinetrigger NOSHIPS :SHIPDONE "You do not own any other ships in this sector!"
pause
:SHIPLINE

killalltriggers
add $SHIPCOUNT 1
getword CURRENTLINE $TEMPID 1
if ($TEMPID = $PSST_SHIP2)
  setvar $FOUNDSHIP2 TRUE
end
settextlinetrigger OTHER :SHIPLINE " "&$PLAYER~CURRENT_SECTOR&" "
settextlinetrigger NOMORE :SHIPDONE "Choose which ship to tow "
pause
:SHIPDONE
killalltriggers
return
:MOVEINTOSECTOR

setvar $RESULT ""
setvar $DROPFIGS TRUE
setvar $RESULT $RESULT&"m "&$MOVEINTOSECTOR&"*"
if (($MOVEINTOSECTOR > 10) and ($MOVEINTOSECTOR <> $MAP~STARDOCK))
  if ($PLAYER~FIGHTERS > $SHIP~SHIP_MAX_ATTACK)
    setvar $RESULT $RESULT&"za"&$SHIP~SHIP_MAX_ATTACK&"* * "
  else
    setvar $RESULT $RESULT&"za"&$PLAYER~FIGHTERS&"* * "
  end
end
if (($DROPFIGS = TRUE) and (($MOVEINTOSECTOR > 10) and (($MOVEINTOSECTOR <> $MAP~STARDOCK) and ($J > 2))))
  setvar $FIG_DROP 1
  if ($X100)
    if ($PLAYER~FIGHTERS > 1000)
      setvar $FIG_DROP 100
      setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - 100)
    end
  elseif ($X1000)
    if ($PLAYER~FIGHTERS > 10000)
      setvar $FIG_DROP 1000
      setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - 1000)
    end
  end
  setvar $RESULT $RESULT&"f  z  "&$FIG_DROP&"* z  c  d  *  "
end
if ($DROPLIMPS)
  setvar $RESULT $RESULT&"  H  2  Z  3*  Z C  *  "
end
if ($DROPARMIDS)
  setvar $RESULT $RESULT&"  H  1  Z  3*  Z C  *  "
end
send $RESULT




send "  sdsh"
waiton "Long Range Scan"
waiton "Warps to Sector(s) :"
return
:FINDSSTPORTS


while ($SHIP1NEEDSPORT = TRUE)
  if ($INSHIP1 <> TRUE)
    gosub :TRANSPORT
  end
  :TRYNEWROUTESHIP1
  setvar $DESTINATION 0
  while ($DESTINATION = 0)
    gosub :GETRANDOMCOURSE
    gosub :PLAYER~QUIKSTATS
  end
  setvar $J 3
  while (($J <= $COURSELENGTH) and ($SHIP1NEEDSPORT = TRUE))
    setvar $MOVEINTOSECTOR $COURSE[$J]
    setvar $CONTAINSSHIELDEDPLANET FALSE
    setvar $P 1

    while ($P <= SECTOR.PLANETCOUNT[$MOVEINTOSECTOR])
      getword SECTOR.PLANETS[$MOVEINTOSECTOR][$P] $TEST 1
      if ($TEST = "<<<<")
        setvar $CONTAINSSHIELDEDPLANET TRUE
      end
      add $P 1
    end
    if ($CONTAINSSHIELDEDPLANET)
      echo "*Avoiding shielded planet*"
      goto :TRYNEWROUTESHIP1
    end
    setvar $FIGOWNER SECTOR.FIGS.OWNER[$MOVEINTOSECTOR]
    setvar $MINEOWNER SECTOR.MINES.OWNER[$MOVEINTOSECTOR]
    setvar $LIMPOWNER SECTOR.LIMPETS.OWNER[$MOVEINTOSECTOR]
    setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$MOVEINTOSECTOR]
    if (($FIGCOUNT > $SAFEFIGHTERLEVEL) and (($FIGOWNER <> "belong to your Corp") and ($FIGOWNER <> "yours")))
      echo "*Avoiding too many enemy fighters*"
      goto :TRYNEWROUTESHIP1
    end
    gosub :MOVEINTOSECTOR
    getsectorparameter $MOVEINTOSECTOR "BUSTED" $ISBUSTED
    if ((PORT.BUYEQUIP[$MOVEINTOSECTOR] = TRUE) and (($ISBUSTED <> TRUE) and ($MOVEINTOSECTOR <> $SHIP2SECTOR)))
      gosub :PLAYER~QUIKSTATS
      setvar $SHIP1NEEDSPORT FALSE
      setvar $SHIP1SECTOR $COURSE[$J]
      setvar $TESTSECTOR $COURSE[$J]
      gosub :GETSSTPORTINFO
      setvar $SHIP1TOTALHOLDS $PLAYER~TOTAL_HOLDS
      setvar $SHIP1EQUIPMENT $PLAYER~EQUIPMENT_HOLDS
      gosub :DISPLAYCREDITS
    else
      setvar $K 1
      setvar $ISFOUND FALSE
      while ((SECTOR.WARPS[$COURSE[$J]][$K] > 0) and ($ISFOUND = FALSE))
        setvar $CHECKINGNEIGHBOR SECTOR.WARPS[$COURSE[$J]][$K]
        getsectorparameter $CHECKINGNEIGHBOR "BUSTED" $ISBUSTED
        setvar $CONTAINSSHIELDEDPLANET FALSE
        setvar $P 1
        while ($P <= SECTOR.PLANETCOUNT[$CHECKINGNEIGHBOR])
          getword SECTOR.PLANETS[$CHECKINGNEIGHBOR][$P] $TEST 1
          if ($TEST = "<<<<")
            setvar $CONTAINSSHIELDEDPLANET TRUE
          end
          add $P 1
        end
        setvar $FIGOWNER SECTOR.FIGS.OWNER[$CHECKINGNEIGHBOR]
        setvar $MINEOWNER SECTOR.MINES.OWNER[$CHECKINGNEIGHBOR]
        setvar $LIMPOWNER SECTOR.LIMPETS.OWNER[$CHECKINGNEIGHBOR]
        setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$CHECKINGNEIGHBOR]
        if ((PORT.BUYEQUIP[$CHECKINGNEIGHBOR] = TRUE) and ((($ISBUSTED <> TRUE) and ((($CHECKINGNEIGHBOR <> $SHIP2SECTOR) and ((($CONTAINSSHIELDEDPLANET = FALSE) and ((($FIGCOUNT <= $SAFEFIGHTERLEVEL) and (($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))))))
          setvar $MOVEINTOSECTOR $CHECKINGNEIGHBOR
          gosub :MOVEINTOSECTOR
          setvar $SHIP1NEEDSPORT FALSE
          setvar $SHIP1SECTOR $CHECKINGNEIGHBOR
          gosub :PLAYER~QUIKSTATS
          setvar $TESTSECTOR $CHECKINGNEIGHBOR
          gosub :GETSSTPORTINFO
          setvar $SHIP1TOTALHOLDS $PLAYER~TOTAL_HOLDS
          setvar $SHIP1EQUIPMENT $PLAYER~EQUIPMENT_HOLDS
          gosub :DISPLAYCREDITS
          setvar $ISFOUND TRUE
        end
        add $K 1
      end
    end
    add $J 1
  end
end

if ($SHIP2NEEDSPORT = TRUE)
  if ($INSHIP1)
    gosub :TRANSPORT
  end
  :TRYNEWROUTESHIP2
  setvar $DESTINATION 0
  while ($DESTINATION = 0)
    gosub :GETRANDOMCOURSE
    gosub :PLAYER~QUIKSTATS
  end
  setvar $J 3
  while (($J <= $COURSELENGTH) and ($SHIP2NEEDSPORT = TRUE))
    setvar $MOVEINTOSECTOR $COURSE[$J]
    setvar $CONTAINSSHIELDEDPLANET FALSE
    setvar $P 1

    while ($P <= SECTOR.PLANETCOUNT[$MOVEINTOSECTOR])
      getword SECTOR.PLANETS[$MOVEINTOSECTOR][$P] $TEST 1
      if ($TEST = "<<<<")
        setvar $CONTAINSSHIELDEDPLANET TRUE
      end
      add $P 1
    end
    if ($CONTAINSSHIELDEDPLANET)
      goto :TRYNEWROUTESHIP2
    end
    setvar $FIGOWNER SECTOR.FIGS.OWNER[$MOVEINTOSECTOR]
    setvar $MINEOWNER SECTOR.MINES.OWNER[$MOVEINTOSECTOR]
    setvar $LIMPOWNER SECTOR.LIMPETS.OWNER[$MOVEINTOSECTOR]
    setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$MOVEINTOSECTOR]
    if (($FIGCOUNT > $SAFEFIGHTERLEVEL) and (($FIGOWNER <> "belong to your Corp") and ($FIGOWNER <> "yours")))
      echo "*Avoiding too many enemy fighters*"
      goto :TRYNEWROUTESHIP2
    end
    gosub :MOVEINTOSECTOR
    getsectorparameter $COURSE[$J] "BUSTED" $ISBUSTED
    if ((PORT.BUYEQUIP[$COURSE[$J]] = TRUE) and (($ISBUSTED <> TRUE) and ($COURSE[$J] <> $SHIP1SECTOR)))
      setvar $SHIP2NEEDSPORT FALSE
      setvar $SHIP2SECTOR $COURSE[$J]
      gosub :PLAYER~QUIKSTATS
      setvar $TESTSECTOR $COURSE[$J]
      gosub :GETSSTPORTINFO
      setvar $SHIP2TOTALHOLDS $PLAYER~TOTAL_HOLDS
      setvar $SHIP2EQUIPMENT $PLAYER~EQUIPMENT_HOLDS
      gosub :DISPLAYCREDITS
    else
      setvar $K 1
      setvar $ISFOUND FALSE
      while ((SECTOR.WARPS[$COURSE[$J]][$K] > 0) and ($ISFOUND = FALSE))
        setvar $CHECKINGNEIGHBOR SECTOR.WARPS[$COURSE[$J]][$K]
        setvar $CONTAINSSHIELDEDPLANET FALSE
        setvar $P 1
        while ($P <= SECTOR.PLANETCOUNT[$CHECKINGNEIGHBOR])
          getword SECTOR.PLANETS[$CHECKINGNEIGHBOR][$P] $TEST 1
          if ($TEST = "<<<<")
            setvar $CONTAINSSHIELDEDPLANET TRUE
          end
          add $P 1
        end
        setvar $FIGOWNER SECTOR.FIGS.OWNER[$CHECKINGNEIGHBOR]
        setvar $MINEOWNER SECTOR.MINES.OWNER[$CHECKINGNEIGHBOR]
        setvar $LIMPOWNER SECTOR.LIMPETS.OWNER[$CHECKINGNEIGHBOR]
        setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$CHECKINGNEIGHBOR]
        getsectorparameter $CHECKINGNEIGHBOR "BUSTED" $ISBUSTED
        if ((PORT.BUYEQUIP[$CHECKINGNEIGHBOR] = TRUE) and ((($ISBUSTED <> TRUE) and ((($CHECKINGNEIGHBOR <> $SHIP1SECTOR) and ((($CONTAINSSHIELDEDPLANET = FALSE) and ((($FIGCOUNT <= $SAFEFIGHTERLEVEL) and (($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))))))
          setvar $MOVEINTOSECTOR $CHECKINGNEIGHBOR
          gosub :MOVEINTOSECTOR
          setvar $SHIP2NEEDSPORT FALSE
          setvar $SHIP2SECTOR $CHECKINGNEIGHBOR
          gosub :PLAYER~QUIKSTATS
          setvar $TESTSECTOR $CHECKINGNEIGHBOR
          gosub :GETSSTPORTINFO
          setvar $SHIP2TOTALHOLDS $PLAYER~TOTAL_HOLDS
          setvar $SHIP2EQUIPMENT $PLAYER~EQUIPMENT_HOLDS
          gosub :DISPLAYCREDITS
          setvar $ISFOUND TRUE
        end
        add $K 1
      end
    end
    add $J 1
  end
else

  gosub :FINDSHIP

  if (($DIST1 > $TRANSPORTRANGE) or ($DIST2 > $TRANSPORTRANGE))
    if ($INSHIP1)
      setvar $SHIP1NEEDSPORT TRUE
    else
      setvar $SHIP2NEEDSPORT TRUE
    end
    gosub :GETCOURSE
    setvar $J 2
    setvar $RESULT ""
    while ($J <= ($COURSELENGTH - 1))
      setvar $RESULT $RESULT&" m "&$COURSE[$J]&"* "
      if (($COURSE[$J] > 10) and ($COURSE[$J] <> STARDOCK))
        setvar $RESULT $RESULT&" z a "&$SHIP~SHIP_MAX_ATTACK&"* * "
      end
      if (($COURSE[$J] > 10) and (($COURSE[$J] <> STARDOCK) and ($J > 2)))
        setvar $RESULT $RESULT&" f 1 * c d "
        setsectorparameter $COURSE[$J] "FIGSEC" TRUE
      end

      add $J 1
    end
    send $RESULT&" ** "
    gosub :PLAYER~QUIKSTATS
    goto :FINDSSTPORTS
  end
  return
  :GETRANDOMCOURSE


  killalltriggers
  setarray $COURSE 80
  setvar $COURSELENGTH 0
  setvar $SECTORS ""
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  getrnd $DESTINATION 11 SECTORS
  send "^f*"&$DESTINATION&"**q"
  pause
  :GETCOURSE


  killalltriggers
  setvar $COURSELENGTH 0
  setarray $COURSE 80
  setvar $SECTORS ""
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  send "^f*"&$DESTINATION&"**q"
  pause
  :SECTORSLINE


  killalltriggers
  setvar $LINE CURRENTLINE
  replacetext $LINE ">" " "
  striptext $LINE "("
  striptext $LINE ")"
  setvar $LINE $LINE&" "
  getwordpos $LINE $POS "So what's the point?"
  getwordpos $LINE $POS2 ": ENDINTERROG"
  getwordpos $LINE $POS3 "*** Error - No route within"
  if (($POS > 0) or ($POS2 > 0) or ($POS3 > 0))
    goto :NOPATH
  end
  getwordpos $LINE $POS " sector "
  getwordpos $LINE $POS2 "TO"
  if (($POS <= 0) and ($POS2 <= 0))
    setvar $SECTORS $SECTORS&" "&$LINE
  end
  getwordpos $LINE&" " $POS " "&$DESTINATION&" "
  getwordpos $LINE $POS2 "("&$DESTINATION&")"
  getwordpos $LINE $POS3 "TO"
  if ((($POS > 0) or ($POS2 > 0)) and ($POS3 <= 0))
    goto :GOTSECTORS
  else
    settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
    settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$DESTINATION&" "
    settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$DESTINATION
    settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$DESTINATION&")"
    settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
    settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"
  end
  pause
  :GOTSECTORS

  killalltriggers
  setvar $SECTORS $SECTORS&" :::"
  setvar $COURSELENGTH 0
  setvar $INDEX 1
  :KEEPGOING
  getword $SECTORS $COURSE[$INDEX] $INDEX
  while ($COURSE[$INDEX] <> ":::")
    add $COURSELENGTH 1
    add $INDEX 1
    getword $SECTORS $COURSE[$INDEX] $INDEX
  end
  :NOPATH

  if ($COURSELENGTH <= 0)
    setvar $DESTINATION 0
  end
  killalltriggers
  return
  :STEAL


  getsectorparameter $SHIP1SECTOR "BUSTED" $ISBUSTED1
  getsectorparameter $SHIP2SECTOR "BUSTED" $ISBUSTED2
  if (($ISBUSTED1 <> TRUE) and ($ISBUSTED2 <> TRUE))
    setvar $MAXSTEAL (($PLAYER~EXPERIENCE / $GAME~STEAL_FACTOR) - 1)
    setvar $SEND ""
    if ($INSHIP1)
      if ($SHIP1EQUIPMENT > 0)

        setvar $SEND $SEND&"p t * * 0* 0* "
        setvar $SHIP1EQUIPMENT 0
        add $EQUIPATPORT[$SHIP1SECTOR] $SHIP1EQUIPMENT
      end

      if ($SHIP1TOTALHOLDS < $MAXSTEAL)
        setvar $STEAL $SHIP1TOTALHOLDS
      else
        setvar $STEAL $MAXSTEAL
      end

      while ($EQUIPATPORT[$SHIP1SECTOR] < ($STEAL + 20))
        setvar $UPGRADE ($STEAL - $EQUIPATPORT[$SHIP1SECTOR])
        divide $UPGRADE 10
        add $UPGRADE 4
        setvar $SEND $SEND&"o 3"&$UPGRADE&"* * "
        add $EQUIPATPORT[$SHIP1SECTOR] ($UPGRADE * 10)
      end
      setvar $SEND $SEND&"p r * s z 3 "&$STEAL&"* x    "
      setvar $SHIP1EQUIPMENT $STEAL
    else
      if ($SHIP2EQUIPMENT > 0)

        setvar $SEND $SEND&"p t * * 0* 0* "
        setvar $SHIP2EQUIPMENT 0
        add $EQUIPATPORT[$SHIP2SECTOR] $SHIP2EQUIPMENT
      end

      if ($SHIP2TOTALHOLDS < $MAXSTEAL)
        setvar $STEAL $SHIP2TOTALHOLDS
      else
        setvar $STEAL $MAXSTEAL
      end

      while ($EQUIPATPORT[$SHIP2SECTOR] < ($STEAL + 20))
        setvar $UPGRADE ($STEAL - $EQUIPATPORT[$SHIP2SECTOR])
        divide $UPGRADE 10
        add $UPGRADE 4
        setvar $SEND $SEND&"o 3"&$UPGRADE&"* * "
        add $EQUIPATPORT[$SHIP2SECTOR] ($UPGRADE * 10)
      end
      setvar $SEND $SEND&"p r* s   z3  "&$STEAL&"*  x    "
      setvar $SHIP2EQUIPMENT $STEAL
    end

    if ($INSHIP1)
      send $SEND&$PSST_SHIP2&"*  * "
      setvar $INSHIP1 FALSE
    else
      send $SEND&$PSST_SHIP1&"*  * "
      setvar $INSHIP1 TRUE
    end
    setvar $PLAYER~TURNS ($PLAYER~TURNS - 2)
    savevar $PLAYER~TURNS

    if ($INSHIP1)
      setvar $LASTSTEAL $SHIP1SECTOR
    else
      setvar $LASTSTEAL $SHIP2SECTOR
    end
  end


  setvar $STAKE (($STEAL - 1) / 11)

  waiton "(R)ob this port, (S)teal product"
  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  settextlinetrigger 1 :SUCCESS "Success!"
  settextlinetrigger 2 :BUSTED "Suddenly you're Busted!"
  settextlinetrigger 3 :BUSTED "There aren't that many holds of Equipment at this port!"
  settextlinetrigger 4 :BUSTED "Do you want instructions (Y/N) [N]?"
  pause
  :SUCCESS

  add $PLAYER~EXPERIENCE $STAKE
  savevar $PLAYER~EXPERIENCE
  if ($INSHIP1)
    setvar $SHIP2EQUIPMENT 1
    setvar $LASTSTEALROBSECTOR $SHIP2SECTOR
    savevar $LASTSTEALROBSECTOR
  else
    setvar $SHIP1EQUIPMENT 1
    setvar $LASTSTEALROBSECTOR $SHIP1SECTOR
    savevar $LASTSTEALROBSECTOR
  end
  goto :CONTINUE
  :BUSTED


  if ($INSHIP1)
    subtract $SHIP2TOTALHOLDS $STAKE
    setsectorparameter $SHIP2SECTOR "BUSTED" TRUE
    setvar $LASTBUSTSECTOR $SHIP2SECTOR
    savevar $LASTBUSTSECTOR
    setvar $SHIP2EQUIPMENT 0
  else
    subtract $SHIP1TOTALHOLDS $STAKE
    setsectorparameter $SHIP1SECTOR "BUSTED" TRUE
    setvar $LASTBUSTSECTOR $SHIP1SECTOR
    savevar $LASTBUSTSECTOR
    setvar $SHIP1EQUIPMENT 0
  end
  add $NUMBERBUSTED 1
  setvar $BUSTED 1
  gosub :TRANSPORT
  if ($INSHIP1)
    setvar $SHIP1NEEDSPORT TRUE
  else
    setvar $SHIP2NEEDSPORT TRUE
  end
  if ($QUIET = 0)
    send "'<"&$BOT~SUBSPACE&">[Busted:"&$LASTBUSTSECTOR&"]<"&$BOT~SUBSPACE&">* "
  end
  :CONTINUE

  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  return
  :GETSSTPORTINFO


  send "* cr*q"
  waiton "What sector is the port in? ["
  :PORTINFO
  killtrigger 1
  killtrigger 2
  settextlinetrigger 1 :GETPORTEQUIP "Equipment  Buying"
  settextlinetrigger 2 :NOEQUIPHERE "I have no information about a port in that sector."
  pause
  :NOEQUIPHERE

  killalltriggers
  setvar $EQUIPBUY 0
  setvar $EQUIPPERC 0
  goto :GOTALLPORTINFO
  :GETPORTEQUIP

  killalltriggers
  getword CURRENTLINE $EQUIPBUY 3
  getword CURRENTLINE $EQUIPPERC 4
  striptext $EQUIPPERC "%"
  setvar $X 10000
  if ($EQUIPPERC = 0)
    setvar $EQUIPATPORT[$TESTSECTOR] ($PLAYER~TOTAL_HOLDS + 50)
  else
    divide $X $EQUIPPERC
    multiply $X $EQUIPBUY
    divide $X 100
    subtract $X 1
    subtract $X $EQUIPBUY

    if ($X < 0)
      setvar $EQUIPATPORT[$TESTSECTOR] 0
    else
      setvar $EQUIPATPORT[$TESTSECTOR] $X
    end
  end
  :GOTALLPORTINFO
  killtrigger 1
  killtrigger 2

  return
  :REFURB

  setvar $TWARP_REFURB_SUCCESS FALSE
  setvar $REFURBPORT $FURBING
  if (($PLAYER~TWARP_TYPE <> "No") and ($REFURBPORT = $MAP~STARDOCK))

    gosub :TWARPREFURB
    gosub :PLAYER~QUIKSTATS
  end

  if ($TWARP_REFURB_SUCCESS <> TRUE)
    if ($FURBING <> 0)
      setvar $MOWINTOSECTOR $FURBING
      setvar $REFURBPORT $FURBING
    else
      setvar $MOWINTOSECTOR $REFURBPORT
    end
    if ($ULTRASAFE)
      :TRYSAFEMOWAGAINREFURB
      gosub :SAFEMOWINTOSECTOR
      if ($ISSAFE = FALSE)
        goto :TRYSAFEMOWAGAINREFURB
      end
    else
      gosub :MOWINTOSECTOR
    end
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_SECTOR = $REFURBPORT)
      if ($FURBING <> $MAP~STARDOCK)
        send "p ty"
        waiton "A  Cargo holds     :"
        getword CURRENTLINE $HOLDSPRICE 5
        getword CURRENTLINE $HOLDSTOBUY 10
        setvar $BEFOREFURBCREDITS $PLAYER~CREDITS
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($HOLDSPRICE * $HOLDSTOBUY))
        if ($PLAYER~CREDITS > $CASH_TO_HOLD_ONTO)
          if ($REFURBFIGHTERS)
            waiton "B  Fighters        :"
            getword CURRENTLINE $FIGPRICE 4
            getword CURRENTLINE $FIGSTOBUY 8
          else
            setvar $FIGSTOBUY 0
          end
          if ($REFURBSHIELDS)
            waiton "C  Shield Points   :"
            getword CURRENTLINE $SHIELDPRICE 5
            getword CURRENTLINE $PLAYER~SHIELDSTOBUY 9
          else
            setvar $PLAYER~SHIELDSTOBUY 0
          end
          if ($FIGSTOBUY > 0)
            if (($FIGPRICE * $FIGSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
              setvar $FIGSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $FIGPRICE)
            end
            setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($FIGPRICE * $FIGSTOBUY))
          end
          if ($PLAYER~SHIELDSTOBUY > 0)
            if (($SHIELDPRICE * $PLAYER~SHIELDSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
              setvar $PLAYER~SHIELDSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $SHIELDPRICE)
            end
            setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($SHIELDPRICE * $PLAYER~SHIELDSTOBUY))
          end
        else
          setvar $FIGSTOBUY 0
          setvar $PLAYER~SHIELDSTOBUY 0
        end
        send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$PLAYER~SHIELDSTOBUY&"* q q q z n * "
        return
      else
        send "p s g y g q "
      end
    end
  end

  if ($PLAYER~CURRENT_SECTOR = $REFURBPORT)
    killalltriggers
    send " s p"
    waiton "A  Cargo holds     :"
    getword CURRENTLINE $HOLDSPRICE 5
    getword CURRENTLINE $HOLDSTOBUY 10
    setvar $BEFOREFURBCREDITS $PLAYER~CREDITS
    if ($PLAYER~CREDITS > $CASH_TO_HOLD_ONTO)
      if ($REFURBFIGHTERS)
        waiton "B  Fighters        :"
        getword CURRENTLINE $FIGPRICE 4
        getword CURRENTLINE $FIGSTOBUY 8
      else
        setvar $FIGSTOBUY 0
      end
      if ($REFURBSHIELDS)
        waiton "C  Shield Points   :"
        getword CURRENTLINE $SHIELDPRICE 5
        getword CURRENTLINE $PLAYER~SHIELDSTOBUY 9
      else
        setvar $PLAYER~SHIELDSTOBUY 0
      end
      if ($HOLDSTOBUY > 0)
        if (($HOLDSPRICE * $HOLDSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
          setvar $HOLDSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $HOLDSPRICE)
        end
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($HOLDSPRICE * $HOLDSTOBUY))
      end
      if ($FIGSTOBUY > 0)
        if (($FIGPRICE * $FIGSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
          setvar $FIGSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $FIGPRICE)
        end
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($FIGPRICE * $FIGSTOBUY))
      end
      if ($PLAYER~SHIELDSTOBUY > 0)
        if (($SHIELDPRICE * $PLAYER~SHIELDSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
          setvar $PLAYER~SHIELDSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $SHIELDPRICE)
        end
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($SHIELDPRICE * $PLAYER~SHIELDSTOBUY))
      end
    else
      setvar $FIGSTOBUY 0
      setvar $PLAYER~SHIELDSTOBUY 0
      setvar $HOLDSTOBUY 0
    end
    send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$PLAYER~SHIELDSTOBUY&"* q q h "
    waitfor "<Hardware Emporium>"
    if ($DROPLIMPS)
      send "L"
      waitfor "How many mines do you want"
      gettext CURRENTLINE $BUY "(Max" ") ["
      striptext $BUY " "
      send $BUY&"*"
      waitfor "<Hardware Emporium>"
    end
    if ($DROPARMIDS)
      send "M"
      waitfor "How many mines do you want"
      gettext CURRENTLINE $BUY "(Max" ") ["
      striptext $BUY " "
      send $BUY&"*"
      waitfor "<Hardware Emporium>"
    end

    send "/"
    waitfor #179&"Figs"
    gettext CURRENTLINE $PLAYER~CREDITS #179&"Creds" #179&"Figs"
    striptext $PLAYER~CREDITS " "
    striptext $PLAYER~CREDITS ","

    setvar $SPENTCREDITS ($SPENTCREDITS + ($BEFOREFURBCREDITS - $PLAYER~CREDITS))
    setvar $PLAYER~FIGHTERSPURCHASED ($PLAYER~FIGHTERSPURCHASED + $FIGSTOBUY)
    setvar $PLAYER~SHIELDSPURCHASED ($PLAYER~SHIELDSPURCHASED + $PLAYER~SHIELDSTOBUY)
  else
    send "'Something bad happened on refurb, I am probably in big trouble. [Temp error message until saveme implemented]*"
  end
  if ($TWARP_REFURB_SUCCESS = TRUE)
    send "Q Q Q Q Z N M "&$START_SECTOR&"* Y  Y  Y  * *"
    gosub :PLAYER~QUIKSTATS
    if ("PLAYER~CURRENT_SECTOR" = $MAP~STARDOCK)
      setvar $SWITCHBOARD~MESSAGE "Twarp Error, Should be Hiding on Dock!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      send "*"
      halt
    end
    send "jy*"

  else
    :DONENORMALFURB
    setvar $TWARP_REFURB_SUCCESS FALSE
    send " Q Q "
  end
  return
  :OLD_REFURB


  if ($FURBING <> 0)
    setvar $MOWINTOSECTOR $FURBING
    setvar $REFURBPORT $FURBING
  else
    setvar $MOWINTOSECTOR $REFURBPORT
  end
  if ($ULTRASAFE)
    :TRYSAFEMOWAGAINREFURB
    gosub :SAFEMOWINTOSECTOR
    if ($ISSAFE = FALSE)
      goto :TRYSAFEMOWAGAINREFURB
    end
  else
    gosub :MOWINTOSECTOR
  end
  gosub :PLAYER~QUIKSTATS

  if ($PLAYER~CURRENT_SECTOR = $REFURBPORT)
    killalltriggers
    if ($FURBING <> $MAP~STARDOCK)
      send "p ty"
    else
      send "p s g y g q s p"
    end
    waiton "A  Cargo holds     :"
    getword CURRENTLINE $HOLDSPRICE 5
    getword CURRENTLINE $HOLDSTOBUY 10
    setvar $BEFOREFURBCREDITS $PLAYER~CREDITS
    setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($HOLDSPRICE * $HOLDSTOBUY))
    if ($PLAYER~CREDITS > $CASH_TO_HOLD_ONTO)
      if ($REFURBFIGHTERS)
        waiton "B  Fighters        :"
        getword CURRENTLINE $FIGPRICE 4
        getword CURRENTLINE $FIGSTOBUY 8
      else
        setvar $FIGSTOBUY 0
      end
      if ($REFURBSHIELDS)
        waiton "C  Shield Points   :"
        getword CURRENTLINE $SHIELDPRICE 5
        getword CURRENTLINE $PLAYER~SHIELDSTOBUY 9
      else
        setvar $PLAYER~SHIELDSTOBUY 0
      end
      if ($FIGSTOBUY > 0)
        if (($FIGPRICE * $FIGSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
          setvar $FIGSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $FIGPRICE)
        end
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($FIGPRICE * $FIGSTOBUY))
      end
      if ($PLAYER~SHIELDSTOBUY > 0)
        if (($SHIELDPRICE * $PLAYER~SHIELDSTOBUY) > ($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO))
          setvar $PLAYER~SHIELDSTOBUY (($PLAYER~CREDITS - $CASH_TO_HOLD_ONTO) / $SHIELDPRICE)
        end
        setvar $PLAYER~CREDITS ($PLAYER~CREDITS - ($SHIELDPRICE * $PLAYER~SHIELDSTOBUY))
      end
    else
      setvar $FIGSTOBUY 0
      setvar $PLAYER~SHIELDSTOBUY 0
    end
    if ($FURBING <> $MAP~STARDOCK)
      send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$PLAYER~SHIELDSTOBUY&"* q q q z n * "
    elseif (($FURBING = $MAP~STARDOCK) and ((($DROPLIMPS or $DROPARMIDS) and ($PLAYER~CREDITS > ($CASH_TO_HOLD_ONTO + 2000000)))))
      send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$PLAYER~SHIELDSTOBUY&"* q q h "
      waitfor "<Hardware Emporium>"
      if ($DROPLIMPS)
        send "L"
        waitfor "How many mines do you want"
        gettext CURRENTLINE $BUY "(Max" ") ["
        striptext $BUY " "
        send $BUY&"*"
        waitfor "<Hardware Emporium>"
      end
      if ($DROPARMIDS)
        send "M"
        waitfor "How many mines do you want"
        gettext CURRENTLINE $BUY "(Max" ") ["
        striptext $BUY " "
        send $BUY&"*"
        waitfor "<Hardware Emporium>"
      end
      send "/"
      waitfor #179&"Figs"
      gettext CURRENTLINE $PLAYER~CREDITS #179&"Creds" #179&"Figs"
      striptext $PLAYER~CREDITS " "
      striptext $PLAYER~CREDITS ","
      send " Q Q "
    else
      send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$PLAYER~SHIELDSTOBUY&"* q q q z n * "
    end

    setvar $SPENTCREDITS ($SPENTCREDITS + ($BEFOREFURBCREDITS - $PLAYER~CREDITS))
    setvar $PLAYER~FIGHTERSPURCHASED ($PLAYER~FIGHTERSPURCHASED + $FIGSTOBUY)
    setvar $PLAYER~SHIELDSPURCHASED ($PLAYER~SHIELDSPURCHASED + $PLAYER~SHIELDSTOBUY)
  else
    send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"

  end
  return
  :SAFEMOWINTOSECTOR

  setvar $ISSAFE TRUE
  setvar $DESTINATION $MOWINTOSECTOR
  gosub :GETCOURSE
  setvar $J 2
  setvar $RESULT ""
  while (($J <= $COURSELENGTH) and $ISSAFE)
    setvar $NEXTSAFESECTOR $COURSE[$J]
    send "sdsh"
    waiton "Long Range Scan"
    waiton "Warps to Sector(s) :"

    setvar $MINESAFE TRUE
    setvar $FIGSSAFE (SECTOR.FIGS.QUANTITY[$NEXTSAFESECTOR] <= 0) or (SECTOR.FIGS.OWNER[$NEXTSAFESECTOR] = "yours") or (SECTOR.FIGS.OWNER[$NEXTSAFESECTOR] = "belong to your Corp")
    setvar $PLANET~PLANETSAFE (SECTOR.PLANETCOUNT[$NEXTSAFESECTOR] <= 0) or ($NEXTSAFESECTOR = $MAP~STARDOCK) or ($NEXTSAFESECTOR <= 10)
    setvar $NAVHAZSAFE TRUE
    setvar $DENSITYSAFE TRUE
    setvar $PLAYER~LIMPETSAFE TRUE
    if ($DENSITYSAFE or ($PLAYER~LIMPETSSAFE and ($FIGSSAFE and ($MINESSAFE and ($NAVHAZSAFE and $PLANET~PLANETSAFE)))))
      setvar $RESULT $RESULT&"m "&$COURSE[$J]&"* "
      if (($COURSE[$J] > 10) and ($COURSE[$J] <> STARDOCK))
        setvar $RESULT $RESULT&"za"&$SHIP~SHIP_MAX_ATTACK&"* * "
      end
    else
      setvar $RESULT $RESULT&"c v"&$NEXTSAFESECTOR&"*q "
      setvar $ISSAFE FALSE
      send $RESULT
      return
    end
    if (($COURSE[$J] > 10) and (($COURSE[$J] <> STARDOCK) and ($J > 2)))
      setvar $RESULT $RESULT&"f z 1* z c d * "
      setsectorparameter $COURSE[$J] "FIGSEC" TRUE
      if ($DROPLIMPS)
        setvar $RESULT $RESULT&"  H  2  Z  3*  Z C  *  "
      end
      if ($DROPARMIDS)
        setvar $RESULT $RESULT&"  H  1  Z  3*  Z C  *  "
      end
    end
    setvar $RESULT $RESULT&"  /"
    send $RESULT
    waitfor #179&"Turns"
    add $J 1
  end
  return
  :MOWINTOSECTOR

  setvar $DESTINATION $MOWINTOSECTOR
  gosub :GETCOURSE
  setvar $J 2
  setvar $RESULT ""
  while ($J <= $COURSELENGTH)
    setvar $RESULT $RESULT&"m"&$COURSE[$J]&"* "
    if (($COURSE[$J] > 10) and ($COURSE[$J] <> STARDOCK))
      setvar $RESULT $RESULT&"za"&$SHIP~SHIP_MAX_ATTACK&"* * "
    end
    if (($DROPFIGS = TRUE) and (($COURSE[$J] > 10) and (($COURSE[$J] <> STARDOCK) and ($J > 2))))
      setvar $FIG_DROP 1
      if ($X100)
        if ($PLAYER~FIGHTERS > 1000)
          setvar $FIG_DROP 100
          setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - 100)
        end
      elseif ($X1000)
        if ($PLAYER~FIGHTERS > 10000)
          setvar $FIG_DROP 1000
          setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - 1000)
        end
      end
      setvar $RESULT $RESULT&"f  z  "&$FIG_DROP&"* z  c  d  *  "
      setsectorparameter $COURSE[$J] "FIGSEC" TRUE
    end

    if ($DROPLIMPS)
      setvar $RESULT $RESULT&"  H  2  Z  3*  Z C  *  "
      setsectorparameter $COURSE[$J] "LIMPSEC" TRUE
    end
    if ($DROPARMIDS)
      setvar $RESULT $RESULT&"  H  1  Z  3*  Z C  *  "
      setsectorparameter $COURSE[$J] "MINESEC" TRUE
    end

    add $J 1
  end
  send $RESULT
  return
  :DROPCASHATBASE
  if ($PLAYER~CREDITS > $DROPCASHLIMIT)
    setvar $MOWINTOSECTOR $CASHDROPSECTOR
    if ($ULTRASAFE)
      :TRYSAFEMOWAGAIN
      gosub :SAFEMOWINTOSECTOR
      if ($ISSAFE = FALSE)
        goto :TRYSAFEMOWAGAIN
      end
    else
      gosub :MOWINTOSECTOR
    end
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_SECTOR = $CASHDROPSECTOR)
      send "l "&$CASHDROPPLANET&"* c t t "&($PLAYER~CREDITS - 1000000)&"* qq* "

      add $CASHDEPOSITED ($PLAYER~CREDITS - 1000000)
      setvar $PLAYER~CREDITS 1000000
      gosub :DISPLAYCREDITS
    else
      send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
    end
  end
  return
  :DISPLAYCREDITS

  setvar $FORMATTEDDEPOSITEDCREDITS ""
  setvar $SPENTCREDITS2 $CASHDEPOSITED
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDDEPOSITEDCREDITS ","&$SNIPPET&$FORMATTEDDEPOSITEDCREDITS
  end
  setvar $FORMATTEDDEPOSITEDCREDITS $SPENTCREDITS2&$FORMATTEDDEPOSITEDCREDITS

  setvar $FORMATTEDONHANDCREDITS ""
  setvar $SPENTCREDITS2 $PLAYER~CREDITS
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDONHANDCREDITS ","&$SNIPPET&$FORMATTEDONHANDCREDITS
  end
  setvar $FORMATTEDONHANDCREDITS $SPENTCREDITS2&$FORMATTEDONHANDCREDITS

  setvar $FORMATTEDSPENTCREDITS ""
  setvar $SPENTCREDITS2 $SPENTCREDITS
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDSPENTCREDITS ","&$SNIPPET&$FORMATTEDSPENTCREDITS
  end
  setvar $FORMATTEDSPENTCREDITS $SPENTCREDITS2&$FORMATTEDSPENTCREDITS

  setvar $FORMATTEDFIGHTERS ""
  setvar $SPENTCREDITS2 $PLAYER~FIGHTERSPURCHASED
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDFIGHTERS ","&$SNIPPET&$FORMATTEDFIGHTERS
  end
  setvar $FORMATTEDFIGHTERS $SPENTCREDITS2&$FORMATTEDFIGHTERS

  setvar $FORMATTEDSHIELDS ""
  setvar $SPENTCREDITS2 $PLAYER~SHIELDSPURCHASED
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDSHIELDS ","&$SNIPPET&$FORMATTEDSHIELDS
  end
  setvar $FORMATTEDSHIELDS $SPENTCREDITS2&$FORMATTEDSHIELDS

  add $PORTAVERAGE $CASHDEPOSITED
  add $PORTAVERAGE $PLAYER~CREDITS
  add $PORTAVERAGE $SPENTCREDITS
  subtract $PORTAVERAGE $STARTCASH
  if ($NUMBERBUSTED = 0)
    setvar $NUMBERBUSTED 1
  end
  divide $PORTAVERAGE $NUMBERBUSTED

  setvar $FORMATTEDPORTAVERAGE ""
  setvar $SPENTCREDITS2 $PORTAVERAGE
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDPORTAVERAGE ","&$SNIPPET&$FORMATTEDPORTAVERAGE
  end
  setvar $FORMATTEDPORTAVERAGE $SPENTCREDITS2&$FORMATTEDPORTAVERAGE

  setvar $WINDOW_CONTENT "*    Cash Deposited: "&$FORMATTEDDEPOSITEDCREDITS&"*  Busted xxB Ports: "&$NUMBERBUSTED&"*  Credits per Port: "&$FORMATTEDPORTAVERAGE&"*   Fighters bought: "&$FORMATTEDFIGHTERS&"*    Shields bought: "&$FORMATTEDSHIELDS&"*"

  setwindowcontents "CASH" $WINDOW_CONTENT
  replacetext $WINDOW_CONTENT "*" "[][]"
  savevar $WINDOW_CONTENT

  return
  :ENDSST

  killalltriggers
  send "q q q q  * * * "
  setvar $SWITCHBOARD~MESSAGE "World SST has completed, make sure you pick up the bot and its ships.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :FINDSHIP




  setvar $FOUND1 0
  setvar $FOUND2 0
  send "czq"
  waiton "---------------------------------"
  :NEXTSHIP
  settextlinetrigger SHIPS :SHIPS
  pause
  :SHIPS
  getword CURRENTLINE $SHIPNUM 1
  isnumber $TST $SHIPNUM
  if ($TST <> 0)
    if ($SHIPNUM = $PSST_SHIP2)
      setvar $FOUND2 CURRENTLINE
      replacetext $FOUND2 "+" " "
      getword $FOUND2 $FOUND2 2
    elseif ($SHIPNUM = $PSST_SHIP1)
      setvar $FOUND1 CURRENTLINE
      replacetext $FOUND1 "+" " "
      getword $FOUND1 $FOUND1 2
    end
    goto :NEXTSHIP
  end
  if ($INSHIP1)
    setvar $DESTINATION $FOUND2
  else
    setvar $DESTINATION $FOUND1
  end
  gosub :PLAYER~QUIKSTATS

  getdistance $DIST1 $PLAYER~CURRENT_SECTOR $DESTINATION

  if ($DIST1 = "-1")
    send "cf"&$PLAYER~CURRENT_SECTOR&"*"&$DESTINATION&"*q"
    waiton "What is the starting sector"
    waiton "Command [TL="
    getdistance $DIST1 $PLAYER~CURRENT_SECTOR $DESTINATION
  end
  getdistance $DIST2 $DESTINATION $PLAYER~CURRENT_SECTOR

  if ($DIST2 = "-1")
    send "cf"&$DESTINATION&"*"&$PLAYER~CURRENT_SECTOR&"*q"
    waiton "What is the starting sector"
    waiton "Command [TL="
    getdistance $DIST2 $DESTINATION $PLAYER~CURRENT_SECTOR
  end
  return
  :STARTING

  loadvar $GAME~STEAL_FACTOR
  loadvar $PLAYER~UNLIMITEDGAME
  loadvar $BOT~BOT_TURN_LIMIT
  loadvar $BOT~USER_COMMAND_LINE
  loadvar $BOT~PARM1
  loadvar $BOT~PARM2
  loadvar $BOT~PARM3
  loadvar $BOT~PARM4
  loadvar $BOT~PARM5
  loadvar $BOT~PARM6
  loadvar $BOT~PARM7
  loadvar $BOT~PARM8
  loadvar $BOT~BOT_NAME
  loadvar $MAP~STARDOCK
  loadvar $MAP~RYLOS
  loadvar $MAP~ALPHA_CENTAURI
  loadvar $BOT~SUBSPACE
  loadvar $BOT~SAFE_SHIP
  setvar $CASH_TO_HOLD_ONTO 1000000




  gosub :PLAYER~QUIKSTATS

  setvar $DROPLIMPS " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $DROPLIMPS
  getwordpos $DROPLIMPS $POS " limp "
  if ($POS = 0)
    setvar $DROPLIMPS FALSE
  else
    setvar $DROPLIMPS TRUE
  end

  setvar $DROPARMIDS " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $DROPARMIDS
  getwordpos $DROPARMIDS $POS " armid "
  if ($POS = 0)
    setvar $DROPARMIDS FALSE
  else
    setvar $DROPARMIDS TRUE
  end

  setvar $QUIET " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $QUIET
  getwordpos $QUIET $POS " quiet "
  if ($POS = 0)
    setvar $QUIET FALSE
  else
    setvar $QUIET TRUE
  end

  setvar $X100 " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $X100
  getwordpos $X100 $POS " x100 "
  if ($POS = 0)
    setvar $X100 FALSE
  else
    setvar $X100 TRUE
  end

  setvar $X1000 " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $X1000
  getwordpos $X1000 $POS " x1000 "
  if ($POS = 0)
    setvar $X1000 FALSE
  else
    setvar $X1000 TRUE
    setvar $X100 FALSE
  end


  setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  isnumber $ISPARAMONENUMBER $BOT~PARM1
  isnumber $ISPARAMTWONUMBER $BOT~PARM2
  isnumber $ISPARAMTHREENUMBER $BOT~PARM3

  if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
    setvar $SWITCHBOARD~MESSAGE "World SST must be run from command or citadel prompt*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  gosub :SHIP~GETSHIPSTATS

  lowercase $BOT~PARM1
  if ($ISPARAMONENUMBER = TRUE)
    setvar $PSST_SHIP2 $BOT~PARM1
    if ($ISPARAMTWONUMBER = TRUE)
      setvar $DROPCASHLIMIT $BOT~PARM2
    end
  else
    setvar $SWITCHBOARD~MESSAGE "Please use wsst [ship2#] format.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~EXPERIENCE < 500)
    setvar $SWITCHBOARD~MESSAGE "You do not have enough experience to run WorldSST.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~CREDITS < 200000)
    setvar $SWITCHBOARD~MESSAGE "You must have at least 200,000 credits on hand to run WorldSST.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  cuttext $PLAYER~ALIGNMENT $NEG_CK 1 1

  striptext $PLAYER~ALIGNMENT "-"
  if (($PLAYER~ALIGNMENT < 100) and ($NEG_CK = "-"))
    setvar $SWITCHBOARD~MESSAGE "Need -100 Alignment Minimum to run World SST.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  elseif ($NEG_CK <> "-")
    setvar $SWITCHBOARD~MESSAGE "Need -100 Alignment Minimum to run World SST.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " f "
  if ($POS > 0)
    setvar $REFURBFIGHTERS TRUE
  else
    setvar $REFURBFIGHTERS FALSE
  end

  getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " s "
  if ($POS > 0)
    setvar $REFURBSHIELDS TRUE
  else
    setvar $REFURBSHIELDS FALSE
  end
  setvar $SAFEFIGHTERLEVEL 5000
  getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " safe "
  if ($POS > 0)
    setvar $ULTRASAFE TRUE
    setvar $SAFEFIGHTERLEVEL 100
  else
    setvar $ULTRASAFE FALSE
  end

  getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " passive "
  if ($POS > 0)
    setvar $PASSIVE TRUE
    setvar $SAFEFIGHTERLEVEL 0
  else
    setvar $PASSIVE FALSE
  end

  setvar $FURBING $MAP~STARDOCK

  setvar $TEMP "  "&$BOT~USER_COMMAND_LINE&"  "
  getwordpos $TEMP $POS " alpha "
  if (($POS <> 0) and ($MAP~ALPHA_CENTAURI <> 0))
    setvar $FURBING $MAP~ALPHA_CENTAURI
  end
  getwordpos $TEMP $POS " rylos "
  if (($POS <> 0) and ($MAP~RYLOS <> 0))
    setvar $FURBING $MAP~RYLOS
  end
  getwordpos $TEMP $POS " dock "
  if (($POS <> 0) and ($MAP~STARDOCK <> 0))
    setvar $FURBING $MAP~STARDOCK
  end

  getwordpos $TEMP $POS " terra "
  if (($POS <> 0) and ($MAP~STARDOCK <> 0))
    setvar $FURBING 1
  end

  setvar $PORTAVERAGE 1
  send "jy*"
  setvar $CASHDEPOSITED 0
  gosub :PLAYER~QUIKSTATS
  setvar $STARTCASH $PLAYER~CREDITS
  setvar $PSST_SHIP1 $PLAYER~SHIP_NUMBER
  setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  if ($STARTINGLOCATION = "Citadel")
    send "q"
    gosub :PLANET~GETPLANETINFO
    send "q* "
    setvar $CASHDROPPLANET $PLANET~PLANET
    setvar $CASHDROPSECTOR $PLAYER~CURRENT_SECTOR
  else
    setvar $CASHDROPPLANET 0
    setvar $CASHDROPSECTOR 0
  end

  if ($DROPCASHLIMIT <= 10000000)
    setvar $DROPCASHLIMIT 10000000
  end
  if (($CASHDROPSECTOR = 0) or ($CASHDROPPLANET = 0))
    setvar $DROPCASHATBASE FALSE
  else
    setvar $DROPCASHATBASE TRUE
  end

  if (($PSST_SHIP2 <= 0) or ($GAME~STEAL_FACTOR <= 0))
    send "'This module should be run from the MOM Bot.*"
    setvar $BOT~MODE "General"
    savevar $BOT~MODE
    halt
  end

  setvar $ALARM_CHECK " "&$BOT~USER_COMMAND_LINE&" "
  lowercase $ALARM_CHECK
  getwordpos $ALARM_CHECK $POS " alarm "
  if ($POS = 0)
    setvar $ALARM_ACTIVE FALSE
  else
    setvar $ALARM_ACTIVE TRUE
    if ($BOT~SAFE_SHIP <= 0)
      send "'You can't run alarm without safe ship variable set.*"
      halt
    end
    if (($BOT~SAFE_SHIP = $PSST_SHIP1) or ($BOT~SAFE_SHIP = $PSST_SHIP2))
      send "'You can't run alarm and use your safe ship to WSST.*"
      halt
    end
  end

  setvar $STARTINGSECTOR $PLAYER~CURRENT_SECTOR
  setvar $INSHIP1 TRUE
  setvar $P1CHK 3
  setvar $P2CHK 3
  if ($MAP~RYLOS > 10)
    setvar $REFURBPORT $MAP~RYLOS
  elseif ($MAP~ALPHA_CENTAURI > 10)
    setvar $REFURBPORT $MAP~ALPHA_CENTAURI
  else
    setvar $REFURBPORT 1

  end
  gosub :CHECKSSTSHIPS

  if ($FOUNDSHIP2 <> TRUE)
    setvar $SWITCHBOARD~MESSAGE "Ship #2 entered for Planet SST was not valid for this sector.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE "World SST Powering Up!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "c;qjy "
  waiton "Transport Range:"
  getword CURRENTLINE $TRANSPORTRANGE1 6
  getword CURRENTLINE $MAXHOLDS1 3
  gosub :TRANSPORT
  send "c;qjy "
  waiton "Transport Range:"
  getword CURRENTLINE $TRANSPORTRANGE2 6
  getword CURRENTLINE $MAXHOLDS2 3
  gosub :TRANSPORT
  if ($TRANSPORTRANGE1 <= $TRANSPORTRANGE2)
    setvar $TRANSPORTRANGE $TRANSPORTRANGE1
  else
    setvar $TRANSPORTRANGE $TRANSPORTRANGE2
  end
  setvar $SWITCHBOARD~MESSAGE "Minimum transport range of these two ships is "&$TRANSPORTRANGE&".*"
  gosub :SWITCHBOARD~SWITCHBOARD

  setvar $SHIP1SECTOR $PLAYER~CURRENT_SECTOR
  setvar $SHIP2SECTOR $PLAYER~CURRENT_SECTOR
  setvar $SHIP1NEEDSPORT TRUE
  setvar $SHIP2NEEDSPORT TRUE
  setvar $I 1
  setvar $YES TRUE
  setvar $BUSTED FALSE
  setarray $EQUIPATPORT SECTORS
  setarray $FUELATPORT SECTORS
  goto :GOGO
  :TWARPREFURB




  setvar $I 1
  setvar $START_SECTOR $PLAYER~CURRENT_SECTOR
  setvar $WEAREADJDOCK FALSE
  while ($I <= SECTOR.WARPCOUNT[$START_SECTOR])
    setvar $ADJ_START SECTOR.WARPS[$START_SECTOR][$I]
    if ($ADJ_START = $MAP~STARDOCK)
      setvar $WEAREADJDOCK TRUE
    end
    add $I 1
  end

  echo "**"&ANSI_14&"Please Stand By"&ANSI_15&" - Calculating Distances...**"
  getdistance $DIST1 $START_SECTOR $MAP~STARDOCK

  if ($DIST1 <= 0)
    setvar $SWITCHBOARD~MESSAGE "Insufficient Warp Data Plotting Course to Dock*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "*"
    halt
  end

  getdistance $DIST2 $MAP~STARDOCK $START_SECTOR
  if ($DIST2 <= 0)
    setvar $SWITCHBOARD~MESSAGE "Insufficient Warp Data Plotting Return Course From Dock*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "*"
    halt
  end

  setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

  if ($PLAYER~ORE_HOLDS < $ORE_REQ)


    send "*"
    gosub :GETSOMEFUEL
  end


  if (($PLAYER~ALIGNMENT < 1000) and ($WEAREADJDOCK = FALSE))
    setvar $RED_ADJ 0
    gosub :FINDJUMPSECTOR
    if ($RED_ADJ = 0)
      waitfor "Command [TL="


      send "*"
      return
    end
  end

  if ($PLAYER~ALIGNMENT >= 1000)
    if ($WEAREADJDOCK)
      send "^F"&$MAP~STARDOCK&"*"&$START_SECTOR&"*Q/ "
    else
      send "^F"&$START_SECTOR&"*"&$MAP~STARDOCK&"*F"&$MAP~STARDOCK&"*"&$START_SECTOR&"*Q/ "
    end
  else
    if ($WEAREADJDOCK)
      send "^F"&$MAP~STARDOCK&"*"&$START_SECTOR&"*Q/ "
    else
      send "^F"&$START_SECTOR&"*"&$RED_ADJ&"*F"&$MAP~STARDOCK&"*"&$START_SECTOR&"*Q/ "
    end
  end
  settextlinetrigger NOJOY :NOJOY "*** Error - No route within"
  settexttrigger CONT :CONT "(?="
  pause
  :NOJOY

  killalltriggers
  setvar $SWITCHBOARD~MESSAGE "Cannot Find Path to StarDock!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "*"
  halt
  :CONT
  killalltriggers
  setdelaytrigger LATENCY_DELAY :LATENCY_DELAY 500
  pause
  :LATENCY_DELAY



  if ($PLAYER~TWARP_TYPE = "No")
    setvar $SWITCHBOARD~MESSAGE "Must Have Twarp 1 or 2*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "*"
    halt
  end

  if ($PLAYER~UNLIMITEDGAME = 0)
    gosub :TURNSREQUIRED
    if ($TURNSREQUIRED > CURRENTTURNS)
      setvar $SWITCHBOARD~MESSAGE "Not Enough Turns. "&$TURNSREQUIRED&", Required*"
      gosub :SWITCHBOARD~SWITCHBOARD
      send "*"
      halt
    elseif ($TURNSREQUIRED <= CURRENTTURNS)
      setvar $TMP (CURRENTTURNS - $TURNSREQUIRED)
      if ($TMP <= $BOT~BOT_TURN_LIMIT)
        setvar $SWITCHBOARD~MESSAGE "Proceeding Will Leave Fewer Than "&$BOT~BOT_TURN_LIMIT&" Turns!*"
        gosub :SWITCHBOARD~SWITCHBOARD
        send "*"
        halt
      end
    end
  end

  send " C R "&$MAP~STARDOCK&"*Q "
  settextlinetrigger ITSALIVE :ITSALIVE "Items     Status  Trading % of max OnBoard"
  settextlinetrigger NOSOUPFORME :NOSOUPFORME "I have no information about a port in that sector"
  pause
  :NOSOUPFORME
  killalltriggers
  setvar $SWITCHBOARD~MESSAGE "StarDock appears to have been Blown Up!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "*"
  halt
  :ITSALIVE
  killalltriggers
  waitfor "(?="
  setvar $MSG ""
  if ((CURRENTALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
    setvar $WARPTO $MAP~STARDOCK
    gosub :DOTWARP
  elseif (($WEAREADJDOCK = FALSE) and ($RED_ADJ <> 0))
    setvar $WARPTO $RED_ADJ
    gosub :DOTWARP
  else
    send "q q *  m "&$MAP~STARDOCK&"*  *  P  S G Y G Q "
  end
  if ($MSG = "")
    waitfor "You leave the Galactic Bank."
  else
    setvar $SWITCHBOARD~MESSAGE "Unknown Problem Detected. Check TA!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "*"
    halt
  end
  gosub :PLAYER~QUIKSTATS


  return
  :GETSOMEFUEL


  gosub :PLAYER~QUIKSTATS
  setvar $BOTTOM 1
  setvar $TOP 1
  setarray $CHECKED SECTORS
  setvar $QUE[1] $PLAYER~CURRENT_SECTOR
  setvar $CHECKED[$PLAYER~CURRENT_SECTOR] 1
  setvar $A 1
  :TRY_AGAIN
  while ($BOTTOM <= $TOP)

    setvar $FOCUS $QUE[$BOTTOM]
    getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
    getsectorparameter $FOCUS "BUSTED" $ISBUSTED

    send " C R "&$FOCUS&"*Q "
    gosub :PLAYER~QUIKSTATS
    if ((PORT.BUYFUEL[$FOCUS] <> TRUE) and ((PORT.FUEL[$FOCUS] > $PLAYER~TOTAL_HOLDS) and ($ISBUSTED <> TRUE)))
      setvar $MOWINTOSECTOR $FOCUS
      gosub :MOWINTOSECTOR
      if (PORT.BUYORG[$FOCUS] and ($PLAYER~ORGANIC_HOLDS > 0)) or (PORT.BUYEQUIP[$FOCUS] and ($PLAYER~EQUIPMENT_HOLDS > 0))
        send "p t * * * * * * "
      else
        send "j y p t * * 0 * 0 * "
      end
      return
    end

    setvar $A 1
    while (SECTOR.WARPS[$FOCUS][$A] > 0)
      setvar $ADJACENT SECTOR.WARPS[$FOCUS][$A]

      if ($CHECKED[$ADJACENT] = 0)

        setvar $CHECKED[$ADJACENT] 1
        add $TOP 1
        setvar $QUE[$TOP] $ADJACENT
      end
      add $A 1
    end

    add $BOTTOM 1
  end
  setvar $SWITCHBOARD~MESSAGE "Can't find a route to fuel.  Halting*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt

  return
  :FINDJUMPSECTOR


  setvar $I 1
  setvar $RED_ADJ 0
  send "qq*"
  while (SECTOR.WARPSIN[$MAP~STARDOCK][$I] > 0)
    setvar $RED_ADJ SECTOR.WARPSIN[$MAP~STARDOCK][$I]
    send "m "&$RED_ADJ&"* y"
    settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
    settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
    settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
    settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
    settextlinetrigger TWARPEMPTY :TWARPEMPTY "You do not have enough Fuel Ore to make the jump"
    pause
    :TWARPADJ
    killalltriggers
    send " * "
    return
    :TWARPVOIDED

    killalltriggers
    send " N N "
    goto :TRYINGNEXTADJ
    :TWARPLOCKED

    killalltriggers
    send " N "

    goto :SECTORLOCKED
    :TWARPBLIND

    killalltriggers
    send " N "
    :TWARPEMPTY

    killalltriggers
    :TRYINGNEXTADJ

    add $I 1
  end
  :NOADJSFOUND

  setvar $RED_ADJ 0
  return
  :SECTORLOCKED

  return
  :TURNSREQUIRED


  send "i"
  settextlinetrigger TURNSREQUIRED_TPW :TURNSREQUIRED_TPW "Turns to Warp  : "
  pause
  :TURNSREQUIRED_TPW

  killalltriggers
  getword CURRENTLINE $TURNSREQUIRED_TPW 5

  if ($RED_ADJ > 0)

    setvar $TURNSREQUIRED_TEMP ($TURNSREQUIRED_TPW * 3)
    if ($_TOW > 0)

      add $TURNSREQUIRED_TEMP_TEMP 2


      add $TURNSREQUIRED_TEMP 3
    else
      add $TURNSREQUIRED_TEMP 1
    end
  else
    setvar $TURNSREQUIRED_TEMP ($TURNSREQUIRED_TPW * 2)

    add $TURNSREQUIRED_TEMP 1
  end

  setvar $TURNSREQUIRED $TURNSREQUIRED_TEMP
  return
  :CALLSAVEME


  send "q q q q * '"&$SWITCHBOARD~BOT_NAME&" call*"
  halt
  :DOTWARP

  setvar $MSG ""
  if ($WARPTO > 0)
    send "q q * * mz"&$WARPTO "*"
    settexttrigger THERE :ADJ_WARP "You are already in that sector!"
    settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$WARPTO&" "
    settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
    settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
    settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
    settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
    pause
    :ADJ_WARP
    killalltriggers
    send "z*"
    goto :TWARP_ADJ
    :LOCKING
    killalltriggers
    send "y"
    settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
    settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
    settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
    settextlinetrigger NO_FUEL :ITWARPNOFUEL "You do not have enough Fuel Ore"
    pause
    :TWARPNOFUEL
    killalltriggers
    setvar $MSG "Not enough fuel for T-warp."
    goto :TWARPDONE
    :TWARP_ADJ

    killalltriggers
    send " * p s"
    goto :TWARPDONE
    :TWARPNOROUTE

    killalltriggers
    send "n* z* "
    setvar $MSG "No route available!"
    goto :TWARPDONE
    :NO_TWARP_LOCK

    killalltriggers
    send "n*zn"
    send "l "&#8&$PLANET~PLANET "*c"
    setsectorparameter $WARPTO "FIGSEC" FALSE
    setvar $MSG "no twarp lock"
    return
    :TWARPIGD

    killalltriggers
    setvar $MSG "My ship is being held by Interdictor!"
    goto :TWARPDONE
    :TWARPPHOTONED

    killalltriggers
    setvar $MSG "I have been photoned and can not T-warp!"
    goto :TWARPDONE
    :TWARP_LOCK

    killalltriggers
    if (CURRENTALIGNMENT >= 1000)
      setvar $STR "y * * p s g y g q "
      send $STR
    else
      setvar $STR "y  *  *  m "&$MAP~STARDOCK&" *  *  p s g y g q "
      send $STR
    end
    setvar $TWARP_REFURB_SUCCESS TRUE
    :TWARPDONE
    if ($MSG <> "")
      setvar $SWITCHBOARD~MESSAGE "Twarp Error - "&$MSG&"*"
      gosub :SWITCHBOARD~SWITCHBOARD
      send "*"
    end
  end
  return
  :BWARP


  killalltriggers
  send "b" $WARPTO "*"
  settexttrigger GO :GO5 "TransWarp Locked"
  settexttrigger NO :NO5 "No locating beam found"
  gosub :DELAYTRIGGER
  pause
  :NO5

  killalltriggers
  send "n "
  waitfor "Transporter shutting down."
  return
  :GO5

  killalltriggers
  send "y z * "
  return

end
# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/SHIP.ts"
include "include/PLANET.ts"
