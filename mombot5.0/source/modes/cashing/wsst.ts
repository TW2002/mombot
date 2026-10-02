







gosub :loadvars~loadvars
loadvar $game~genesis_cost
loadvar $game~atomic_cost
loadvar $game~max_planets_per_sector
loadvar $game~steal_factor
loadvar $bot~bot_name
loadvar $bot~subspace
loadvar $bot~safe_ship

setvar $bot~command "wsst"

gosub :help~initialize
setvar $help~help[1] $help~tab&"World Sell-Steal-Transport "
setvar $help~help[2] $help~tab&" - wsst [ship2] {cash dropoff} {f} {s} {safe|passive} {furbpoint} "
setvar $help~help[3] $help~tab&"   Options: "
setvar $help~help[4] $help~tab&"     {cash dropoff} - if started from planet citadel  "
setvar $help~help[5] $help~tab&"     {f}            - buy fighters"
setvar $help~help[6] $help~tab&"     {s}            - buy shields "
setvar $help~help[7] $help~tab&"     {safe}         - Will not mow to locations, scans and moves"
setvar $help~help[8] $help~tab&"     {passive}      - Will be safe, as well as avoid any enemy fighters "
setvar $help~help[9] $help~tab&"     {furbpoint}    - Terra, Dock (default), Alpha, Rylos "
setvar $help~help[10] $help~tab&"     {limp}         - Will lay 3 limps/sector if Furbing at Dock. "
setvar $help~help[11] $help~tab&"     {armid}        - Will lay 3 armids/sector if Furbing at Dock. "
setvar $help~help[12] $help~tab&"     {quiet}        - Will not braodcast BUSTED msg's on SubSpace  "
setvar $help~help[13] $help~tab&"     {x100}         - Will Drop 100 Fighters per sector "
gosub :help~helpfile

setvar $player~save TRUE
setvar $CASH_TO_HOLD_ONTO 500000

gosub :player~quikstats

setvar $DROPLIMPS " "&$bot~user_command_line&" "
lowercase $DROPLIMPS
getwordpos $DROPLIMPS $POS " limp "
if ($POS = 0)
  setvar $DROPLIMPS FALSE
else
  setvar $DROPLIMPS TRUE
end

setvar $DROPARMIDS " "&$bot~user_command_line&" "
lowercase $DROPARMIDS
getwordpos $DROPARMIDS $POS " armid "
if ($POS = 0)
  setvar $DROPARMIDS FALSE
else
  setvar $DROPARMIDS TRUE
end

setvar $QUIET " "&$bot~user_command_line&" "
lowercase $QUIET
getwordpos $QUIET $POS " quiet "
if ($POS = 0)
  setvar $QUIET FALSE
else
  setvar $QUIET TRUE
end

setvar $X100 " "&$bot~user_command_line&" "
lowercase $X100
getwordpos $X100 $POS " x100 "
if ($POS = 0)
  setvar $X100 FALSE
else
  setvar $X100 TRUE
end

setvar $X1000 " "&$bot~user_command_line&" "
lowercase $X1000
getwordpos $X1000 $POS " x1000 "
if ($POS = 0)
  setvar $X1000 FALSE
else
  setvar $X1000 TRUE
  setvar $X100 FALSE
end

setvar $STARTINGLOCATION $player~current_prompt
isnumber $ISPARAMONENUMBER $bot~parm1
isnumber $ISPARAMTWONUMBER $bot~parm2
isnumber $ISPARAMTHREENUMBER $bot~parm3

if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  setvar $switchboard~message "World SST must be run from command or citadel prompt*"
  gosub :switchboard~switchboard
  halt
end
gosub :ship~getshipstats

lowercase $bot~parm1
if ($ISPARAMONENUMBER = TRUE)
  setvar $WSST_SHIP2 $bot~parm1
  if ($ISPARAMTWONUMBER = TRUE)
    setvar $DROPCASHLIMIT $bot~parm2
  end
else
  setvar $switchboard~message "Please use wsst [ship2#] format.*"
  gosub :switchboard~switchboard
  halt
end
if ($player~experience < 500)
  setvar $switchboard~message "You do not have enough experience to run WorldSST.*"
  gosub :switchboard~switchboard
  halt
end
if ($player~credits < 200000)
  setvar $switchboard~message "You must have at least 200,000 credits on hand to run WorldSST.*"
  gosub :switchboard~switchboard
  halt
end
cuttext $player~alignment $NEG_CK 1 1

striptext $player~alignment "-"
if (($player~alignment < 100) and ($NEG_CK = "-"))
  setvar $switchboard~message "Need -100 Alignment Minimum to run World SST.*"
  gosub :switchboard~switchboard
  halt
end
if ($NEG_CK <> "-")
  setvar $switchboard~message "Need -100 Alignment Minimum to run World SST.*"
  gosub :switchboard~switchboard
  halt
end
getwordpos " "&$bot~user_command_line&" " $POS " f "
if ($POS > 0)
  setvar $REFURBFIGHTERS TRUE
else
  setvar $REFURBFIGHTERS FALSE
end
getwordpos " "&$bot~user_command_line&" " $POS " s "
if ($POS > 0)
  setvar $REFURBSHIELDS TRUE
else
  setvar $REFURBSHIELDS FALSE
end
setvar $SAFEFIGHTERLEVEL 5000
getwordpos " "&$bot~user_command_line&" " $POS " safe "
if ($POS > 0)
  setvar $ULTRASAFE TRUE
  setvar $SAFEFIGHTERLEVEL 100
else
  setvar $ULTRASAFE FALSE
end

getwordpos " "&$bot~user_command_line&" " $POS " passive "
if ($POS > 0)
  setvar $PASSIVE TRUE
  setvar $SAFEFIGHTERLEVEL 0
else
  setvar $PASSIVE FALSE
end

setvar $FURBING $map~stardock

setvar $TEMP "  "&$bot~user_command_line&"  "
getwordpos $TEMP $POS " alpha "
if (($POS <> 0) and ($map~alpha_centauri <> 0))
  setvar $FURBING $map~alpha_centauri
end
getwordpos $TEMP $POS " rylos "
if (($POS <> 0) and ($map~rylos <> 0))
  setvar $FURBING $map~rylos
end
getwordpos $TEMP $POS " dock "
if (($POS <> 0) and ($map~stardock <> 0))
  setvar $FURBING $map~stardock
end

getwordpos $TEMP $POS " terra "
if (($POS <> 0) and ($map~stardock <> 0))
  setvar $FURBING 1
end

setvar $PORTAVERAGE 1
setvar $CASHDEPOSITED 0
gosub :player~quikstats
setvar $STARTCASH $player~credits
setvar $WSST_SHIP1 $player~ship_number
setvar $STARTINGLOCATION $player~current_prompt
if ($STARTINGLOCATION = "Citadel")
  send "q"
  gosub :planet~getplanetinfo
  send "q* "
  waitfor "Command [TL="
  send "j y * "
  waitfor "Command [TL="
  setvar $CASHDROPPLANET $planet~planet
  setvar $CASHDROPSECTOR $player~current_sector
else
  send "j y * "
  waitfor "Command [TL="
  setvar $CASHDROPPLANET 0
  setvar $CASHDROPSECTOR 0
end
if ($DROPCASHLIMIT <= 0)
  setvar $DROPCASHLIMIT 10000000
end
if (($CASHDROPSECTOR = 0) or ($CASHDROPPLANET = 0))
  setvar $DROPCASHATBASE FALSE
else
  setvar $DROPCASHATBASE TRUE
end

if ($WSST_SHIP2 <= 0)
  setvar $switchboard~message "Invalid ship number entered for second ship.*"
  gosub :switchboard~switchboard
  setvar $bot~mode "General"
  savevar $bot~mode
  halt
end

if ($game~steal_factor <= 0)
  setvar $switchboard~message "Missing steal factor setting, refresh mombot!*"
  setvar $bot~mode "General"
  savevar $bot~mode
  halt
end

setvar $ALARM_CHECK " "&$bot~user_command_line&" "
lowercase $ALARM_CHECK
getwordpos $ALARM_CHECK $POS " alarm "
if ($POS = 0)
  setvar $ALARM_ACTIVE FALSE
else
  setvar $ALARM_ACTIVE TRUE
  if ($bot~safe_ship <= 0)
    send "'You can't run alarm without safe ship variable set.*"
    halt
  end
  if (($bot~safe_ship = $WSST_SHIP1) or ($bot~safe_ship = $WSST_SHIP2))
    send "'You can't run alarm and use your safe ship to WSST.*"
    halt
  end
end

setvar $STARTINGSECTOR $player~current_sector
setvar $INSHIP1 TRUE
setvar $P1CHK 3
setvar $P2CHK 3

if ($map~rylos > 10)
  setvar $REFURBPORT $map~rylos
elseif ($map~alpha_centauri > 10)
  setvar $REFURBPORT $map~alpha_centauri
else
  setvar $REFURBPORT 1
end

gosub :CHECKSSTSHIPS

if ($FOUNDSHIP2 <> TRUE)
  setvar $switchboard~message "Ship #2 entered for Planet SST was not valid for this sector.*"
  gosub :switchboard~switchboard
  halt
end

setvar $switchboard~message "World SST Powering Up!*"
gosub :switchboard~switchboard

setvar $haggle~nativehagglemode FALSE
gosub :haggle~configurenativehaggle

gosub :SETUPSHIP
setvar $TRANSPORTRANGE1 $STARTUPTRANSPORTRANGE
setvar $MAXHOLDS1 $STARTUPMAXHOLDS
gosub :TRANSPORT
gosub :SETUPSHIP
setvar $TRANSPORTRANGE2 $STARTUPTRANSPORTRANGE
setvar $MAXHOLDS2 $STARTUPMAXHOLDS
gosub :TRANSPORT
if ($TRANSPORTRANGE1 <= $TRANSPORTRANGE2)
  setvar $TRANSPORTRANGE $TRANSPORTRANGE1
else
  setvar $TRANSPORTRANGE $TRANSPORTRANGE2
end

setvar $switchboard~message "Minimum transport range of these two ships is "&$TRANSPORTRANGE&".*"
gosub :switchboard~switchboard

setvar $SHIP1SECTOR $player~current_sector
setvar $SHIP2SECTOR $player~current_sector
setvar $SHIP1NEEDSPORT TRUE
setvar $SHIP2NEEDSPORT TRUE
setvar $I 1
setvar $YES TRUE
setvar $BUSTED FALSE
setarray $EQUIPATPORT SECTORS
setarray $FUELATPORT SECTORS
setarray $BUILDINGPORT SECTORS

window "CASH" 300 170 "World SST - "&GAMENAME "ONTOP"
gosub :DISPLAYCREDITS
:WSST



if (($player~unlimitedgame = FALSE) and ($player~turns <= $bot~bot_turn_limit))
  goto :ENDSST
end
gosub :FINDSSTPORTS

setvar $BUSTED FALSE
while ($BUSTED = FALSE)
  if (($player~unlimitedgame = FALSE) and ($player~turns <= $bot~bot_turn_limit))
    goto :ENDSST
  end
  getsectorparameter $SHIP1SECTOR "BUSTED" $ISBUSTED1
  getsectorparameter $SHIP2SECTOR "BUSTED" $ISBUSTED2
  if ($ISBUSTED1 = TRUE)
    setvar $SHIP1NEEDSPORT TRUE
  end
  if ($ISBUSTED2 = TRUE)
    setvar $SHIP2NEEDSPORT TRUE
  end
  if (($ISBUSTED1 = TRUE) or ($ISBUSTED2 = TRUE))
    goto :WSST
  end
  gosub :STEAL
end

send "#"
gosub :player~quikstats
loadvar $bot~alarm_list
if ($ALARM_ACTIVE and ($bot~alarm_list <> ""))
  loadvar $bot~who_is_online
  lowercase $bot~alarm_list
  lowercase $bot~who_is_online
  getwordpos $bot~alarm_list $POS ","
  if ($POS > 0)
    splittext $bot~alarm_list $ALARM ","
  else
    setarray $ALARM 1
    setvar $ALARM[1] $bot~alarm_list
    setvar $ALARM 1
  end
  setvar $I 1
  while ($I <= $ALARM)
    getwordpos $bot~who_is_online $POS " "&$ALARM[$I]&" "
    if ($POS > 0)
      send "'Alarm triggered by "&$ALARM[$I]&", contingency plan engaged.*"
      send "'"&$bot~bot_name&" x x*"
      halt
    end
    add $I 1
  end
end

setvar $SHIP1MINREFURB (($MAXHOLDS1 * 7) / 8)
setvar $SHIP2MINREFURB (($MAXHOLDS2 * 7) / 8)
if (($SHIP1TOTALHOLDS < $SHIP1MINREFURB) or ($SHIP2TOTALHOLDS < $SHIP2MINREFURB))
  gosub :REFURB
  gosub :player~quikstats
  if (($player~ore_holds > 0) or ($player~organic_holds > 0))
    setvar $switchboard~message "Unable to clear cargo holds after refurb; stopping before steal.*"
    gosub :switchboard~switchboard
    goto :ENDSST
  end
end

if (($DROPCASHATBASE = TRUE) and ($player~credits >= $DROPCASHLIMIT))
  gosub :DROPCASHATBASE
end

goto :WSST
:TRANSPORT

if ($TRANSPORTRANGE > 0)
  if ($INSHIP1)
    setvar $TRANSPORTTARGETSECTOR $SHIP2SECTOR
  else
    setvar $TRANSPORTTARGETSECTOR $SHIP1SECTOR
  end
  if ($TRANSPORTTARGETSECTOR > 0)
    getdistance $TRANSPORTDIST $player~current_sector $TRANSPORTTARGETSECTOR
    if (($TRANSPORTDIST < 0) or ($TRANSPORTDIST > $TRANSPORTRANGE))
      gosub :FINDSHIP
      if (($DIST1 < 0) or ($DIST1 > $TRANSPORTRANGE))
        setvar $switchboard~message "Other SST ship is not in transport range; stopping before xport.*"
        gosub :switchboard~switchboard
        halt
      end
    end
  end
end

if ($INSHIP1)
  send "x        "&$WSST_SHIP2&"* q * "
  setvar $player~ship_number $WSST_SHIP2
else
  send "x        "&$WSST_SHIP1&"* q * "
  setvar $player~ship_number $WSST_SHIP1
end
savevar $player~ship_number
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
:TRANSPORTED


killtrigger 1
killtrigger 2
killtrigger 3
if ($INSHIP1)
  setvar $INSHIP1 FALSE
else
  setvar $INSHIP1 TRUE
end
setvar $player~turns ($player~turns - 1)
savevar $player~turns
return
:SETUPSHIP



killalltriggers
send "j y * "
waitfor "Command [TL="
send "c;"
waiton "Transport Range:"
getword CURRENTLINE $STARTUPTRANSPORTRANGE 6
getword CURRENTLINE $STARTUPMAXHOLDS 3
send "q"
waitfor "Command [TL="
return
:CHECKSSTSHIPS



setvar $FOUNDSHIP2 FALSE
killalltriggers
send "wn*"
settextlinetrigger OTHER :SHIPLINE " "&$player~current_sector&" "
settextlinetrigger NOSHIPS :SHIPDONE_NO_PROMPT "You do not own any other ships in this sector!"
pause
:SHIPLINE

killalltriggers
add $SHIPCOUNT 1
getword CURRENTLINE $TEMPID 1
if ($TEMPID = $WSST_SHIP2)
  setvar $FOUNDSHIP2 TRUE
end
settextlinetrigger OTHER :SHIPLINE " "&$player~current_sector&" "
settextlinetrigger NOMORE :SHIPDONE "Choose which ship to tow "
pause
:SHIPDONE

killalltriggers
waitfor "Command [TL="
return
:SHIPDONE_NO_PROMPT

killalltriggers
return
:MOVEINTOSECTOR



setvar $RESULT ""
setvar $DROPFIGS TRUE
setvar $RESULT $RESULT&"m "&$MOVEINTOSECTOR&"*"
if (($MOVEINTOSECTOR > 10) and ($MOVEINTOSECTOR <> $map~stardock))
  if ($player~fighters > $ship~ship_max_attack)
    setvar $RESULT $RESULT&"za"&$ship~ship_max_attack&"* * "
  else
    setvar $RESULT $RESULT&"za"&$player~fighters&"* * "
  end
end
if (($DROPFIGS = TRUE) and (($MOVEINTOSECTOR > 10) and (($MOVEINTOSECTOR <> $map~stardock) and (($J > 2) or ($COURSEFROMDB and ($J > 1))))))
  setvar $FIG_DROP 1
  if ($X100)
    if ($player~fighters > 1000)
      setvar $FIG_DROP 100
      setvar $player~fighters ($player~fighters - 100)
    end
  elseif ($X1000)
    if ($player~fighters > 10000)
      setvar $FIG_DROP 1000
      setvar $player~fighters ($player~fighters - 1000)
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
    gosub :player~quikstats
    gosub :GETRANDOMCOURSE
  end
  if ($COURSEFROMDB)
    setvar $J 2
  else
    setvar $J 3
  end
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
    setvar $TESTSECTOR $MOVEINTOSECTOR
    gosub :ISUSABLESSTPORTCANDIDATE
    if (($CANDIDATEPORTVALID = TRUE) and (($ISBUSTED <> TRUE) and ($MOVEINTOSECTOR <> $SHIP2SECTOR)))
      gosub :player~quikstats
      setvar $SHIP1NEEDSPORT FALSE
      setvar $SHIP1SECTOR $COURSE[$J]
      setvar $TESTSECTOR $COURSE[$J]
      gosub :GETSSTPORTINFO
      if ($PORTINFOVALID)
        setvar $SHIP1TOTALHOLDS $player~total_holds
        setvar $SHIP1EQUIPMENT $player~equipment_holds
        gosub :DISPLAYCREDITS
      else
        setvar $SHIP1NEEDSPORT TRUE
        goto :TRYNEWROUTESHIP1
      end
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
        setvar $TESTSECTOR $CHECKINGNEIGHBOR
        gosub :ISUSABLESSTPORTCANDIDATE
        if (($CANDIDATEPORTVALID = TRUE) and ((($ISBUSTED <> TRUE) and ((($CHECKINGNEIGHBOR <> $SHIP2SECTOR) and ((($CONTAINSSHIELDEDPLANET = FALSE) and ((($FIGCOUNT <= $SAFEFIGHTERLEVEL) and (($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))))))
          setvar $MOVEINTOSECTOR $CHECKINGNEIGHBOR
          gosub :MOVEINTOSECTOR
          setvar $SHIP1NEEDSPORT FALSE
          setvar $SHIP1SECTOR $CHECKINGNEIGHBOR
          gosub :player~quikstats
          setvar $TESTSECTOR $CHECKINGNEIGHBOR
          gosub :GETSSTPORTINFO
          if ($PORTINFOVALID)
            setvar $SHIP1TOTALHOLDS $player~total_holds
            setvar $SHIP1EQUIPMENT $player~equipment_holds
            gosub :DISPLAYCREDITS
            setvar $ISFOUND TRUE
          else
            setvar $SHIP1NEEDSPORT TRUE
            goto :TRYNEWROUTESHIP1
          end
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
    gosub :player~quikstats
    gosub :GETRANDOMCOURSE
  end
  if ($COURSEFROMDB)
    setvar $J 2
  else
    setvar $J 3
  end
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
    setvar $TESTSECTOR $COURSE[$J]
    gosub :ISUSABLESSTPORTCANDIDATE
    if (($CANDIDATEPORTVALID = TRUE) and (($ISBUSTED <> TRUE) and ($COURSE[$J] <> $SHIP1SECTOR)))
      setvar $SHIP2NEEDSPORT FALSE
      setvar $SHIP2SECTOR $COURSE[$J]
      gosub :player~quikstats
      setvar $TESTSECTOR $COURSE[$J]
      gosub :GETSSTPORTINFO
      if ($PORTINFOVALID)
        setvar $SHIP2TOTALHOLDS $player~total_holds
        setvar $SHIP2EQUIPMENT $player~equipment_holds
        gosub :DISPLAYCREDITS
      else
        setvar $SHIP2NEEDSPORT TRUE
        goto :TRYNEWROUTESHIP2
      end
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
        setvar $TESTSECTOR $CHECKINGNEIGHBOR
        gosub :ISUSABLESSTPORTCANDIDATE
        if (($CANDIDATEPORTVALID = TRUE) and ((($ISBUSTED <> TRUE) and ((($CHECKINGNEIGHBOR <> $SHIP1SECTOR) and ((($CONTAINSSHIELDEDPLANET = FALSE) and ((($FIGCOUNT <= $SAFEFIGHTERLEVEL) and (($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))))))
          setvar $MOVEINTOSECTOR $CHECKINGNEIGHBOR
          gosub :MOVEINTOSECTOR
          setvar $SHIP2NEEDSPORT FALSE
          setvar $SHIP2SECTOR $CHECKINGNEIGHBOR
          gosub :player~quikstats
          setvar $TESTSECTOR $CHECKINGNEIGHBOR
          gosub :GETSSTPORTINFO
          if ($PORTINFOVALID)
            setvar $SHIP2TOTALHOLDS $player~total_holds
            setvar $SHIP2EQUIPMENT $player~equipment_holds
            gosub :DISPLAYCREDITS
            setvar $ISFOUND TRUE
          else
            setvar $SHIP2NEEDSPORT TRUE
            goto :TRYNEWROUTESHIP2
          end
        end
        add $K 1
      end
    end
    add $J 1
  end
  if ($SHIP2NEEDSPORT = TRUE)
    goto :TRYNEWROUTESHIP2
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
        setvar $RESULT $RESULT&" z a "&$ship~ship_max_attack&"* * "
      end
      if (($COURSE[$J] > 10) and (($COURSE[$J] <> STARDOCK) and ($J > 2)))
        setvar $RESULT $RESULT&" f 1 * c d "
        setsectorparameter $COURSE[$J] "FIGSEC" TRUE
      end

      add $J 1
    end
    send $RESULT&" ** "
    gosub :player~quikstats
    goto :FINDSSTPORTS
  end
end
  return
  :GETRANDOMCOURSE




  killalltriggers
  setarray $COURSE 80
  setvar $COURSELENGTH 0
  setvar $SECTORS ""
  setvar $COURSEFROMDB FALSE
  getrnd $DESTINATION 11 SECTORS
  getcourse $COURSE $player~current_sector $DESTINATION
  if ($COURSE > 0)
    setvar $COURSEFROMDB TRUE
    setvar $COURSELENGTH ($COURSE + 1)
    return
  end
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  send "^f*"&$DESTINATION&"**q"
  pause
  :GETCOURSE


  killalltriggers
  setvar $COURSELENGTH 0
  setarray $COURSE 80
  setvar $SECTORS ""
  getcourse $COURSE CURRENTSECTOR $DESTINATION
  if ($COURSE > 0)
    setvar $COURSELENGTH ($COURSE + 1)
    return
  end
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
  end
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$DESTINATION&" "
  settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$DESTINATION
  settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$DESTINATION&")"
  settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
  settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"

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
  if (($ISBUSTED1 = TRUE) or ($ISBUSTED2 = TRUE))
    return
  end
  if (($ISBUSTED1 <> TRUE) and ($ISBUSTED2 <> TRUE))
    setvar $MAXSTEAL (($player~experience / $game~steal_factor) - 1)
    setvar $SEND ""
    if ($INSHIP1)
      if ($SHIP1EQUIPMENT > 0)
        if (HAGGLE)
          setvar $WSSTSELLPRODUCT "Equipment"
          gosub :SELLCURRENTCARGO
          gosub :player~quikstats
          if ($player~equipment_holds > 0)
            setvar $switchboard~message "Unable to finish selling Equipment before next steal.*"
            gosub :switchboard~switchboard
            halt
          end
          setvar $SHIP1EQUIPMENT 0
        else

          setvar $SEND $SEND&"p t * * 0* 0* "
          setvar $SHIP1EQUIPMENT 0
          add $EQUIPATPORT[$SHIP1SECTOR] $SHIP1EQUIPMENT
        end
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
      setvar $SEND $SEND&"p r * s z 3 "&$STEAL&"* x       "
      setvar $SHIP1EQUIPMENT $STEAL
    else
      if ($SHIP2EQUIPMENT > 0)
        if (HAGGLE)
          setvar $WSSTSELLPRODUCT "Equipment"
          gosub :SELLCURRENTCARGO
          gosub :player~quikstats
          if ($player~equipment_holds > 0)
            setvar $switchboard~message "Unable to finish selling Equipment before next steal.*"
            gosub :switchboard~switchboard
            halt
          end
          setvar $SHIP2EQUIPMENT 0
        else

          setvar $SEND $SEND&"p t * * 0* 0* "
          setvar $SHIP2EQUIPMENT 0
          add $EQUIPATPORT[$SHIP2SECTOR] $SHIP2EQUIPMENT
        end
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
      setvar $SEND $SEND&"p r* s   z3  "&$STEAL&"*  x        "
      setvar $SHIP2EQUIPMENT $STEAL
    end

    if ($INSHIP1)
      send $SEND&$WSST_SHIP2&"*  * "
      setvar $INSHIP1 FALSE
    else
      send $SEND&$WSST_SHIP1&"*  * "
      setvar $INSHIP1 TRUE
    end
    setvar $player~turns ($player~turns - 2)
    savevar $player~turns

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
  killtrigger 5
  killtrigger 6
  settextlinetrigger 1 :SUCCESS "Success!"
  settextlinetrigger 2 :BUSTDETECTED "Suddenly you're Busted!"
  settextlinetrigger 3 :BUSTED "There aren't that many holds of Equipment at this port!"
  settextlinetrigger 4 :FAKEBUSTED "Do you want instructions (Y/N) [N]?"
  pause
  :SUCCESS

  add $player~experience $STAKE
  savevar $player~experience
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
  :BUSTDETECTED

  killalltriggers
  settextlinetrigger 5 :FAKEBUSTED "(You suddenly remember that you were caught stealing here before)"
  settextlinetrigger 6 :FAKEBUSTED "(You realize the guards saw you last time!)"
  settexttrigger 2 :BUSTED "Command [TL="
  pause
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
    send "'<"&$bot~subspace&">[Busted:"&$LASTBUSTSECTOR&"]<"&$bot~subspace&">* "
  end

  goto :CONTINUE
  :FAKEBUSTED

  killalltriggers
  setvar $LASTBUSTSECTOR $LASTSTEAL
  setsectorparameter $LASTBUSTSECTOR "BUSTED" TRUE
  setsectorparameter $LASTBUSTSECTOR "FAKEBUST" TRUE
  savevar $LASTBUSTSECTOR
  if ($INSHIP1)
    setvar $FAKEBUSTEDSHIP $WSST_SHIP2
    setvar $FAKEBUSTEDISSHIP1 FALSE
    setvar $SHIP2EQUIPMENT 0
  else
    setvar $FAKEBUSTEDSHIP $WSST_SHIP1
    setvar $FAKEBUSTEDISSHIP1 TRUE
    setvar $SHIP1EQUIPMENT 0
  end
  add $NUMBERBUSTED 1
  setvar $BUSTED 1
  gosub :SYNCAFTERSTEALTRANSPORT
  gosub :player~quikstats
  if ($player~ship_number = $WSST_SHIP1)
    setvar $INSHIP1 TRUE
  elseif ($player~ship_number = $WSST_SHIP2)
    setvar $INSHIP1 FALSE
  end
  if ($player~ship_number <> $FAKEBUSTEDSHIP)
    gosub :TRANSPORT
  end
  if ($FAKEBUSTEDISSHIP1)
    setvar $SHIP1NEEDSPORT TRUE
  else
    setvar $SHIP2NEEDSPORT TRUE
  end
  if ($QUIET = 0)
    send "'<"&$bot~subspace&">[Busted:"&$LASTBUSTSECTOR&"]<"&$bot~subspace&">* "
  end
  gosub :REFURB
  gosub :player~quikstats
  if ($INSHIP1)
    setvar $SHIP1TOTALHOLDS $player~total_holds
    setvar $SHIP1EQUIPMENT $player~equipment_holds
  else
    setvar $SHIP2TOTALHOLDS $player~total_holds
    setvar $SHIP2EQUIPMENT $player~equipment_holds
  end
  goto :CONTINUE
  :SYNCAFTERSTEALTRANSPORT

  killalltriggers
  settextlinetrigger SYNCACCEPTED :SYNCAFTERSTEALACCEPTED "Security code accepted"
  settextlinetrigger SYNCLIST :SYNCAFTERSTEALLIST "--<  Available Ships in Sector >--"
  settexttrigger SYNCCOMMAND :SYNCAFTERSTEALCOMMAND "Command [TL="
  setdelaytrigger SYNCTIMEOUT :SYNCAFTERSTEALDONE 3000
  pause
  :SYNCAFTERSTEALACCEPTED

  killalltriggers
  settexttrigger SYNCCOMMAND2 :SYNCAFTERSTEALDONE "Command [TL="
  setdelaytrigger SYNCTIMEOUT2 :SYNCAFTERSTEALDONE 3000
  pause
  :SYNCAFTERSTEALLIST

  killalltriggers
  send "q "
  waitfor "Command [TL="
  return
  :SYNCAFTERSTEALCOMMAND

  killalltriggers
  settextlinetrigger SYNCACCEPTED2 :SYNCAFTERSTEALACCEPTED "Security code accepted"
  settextlinetrigger SYNCLIST2 :SYNCAFTERSTEALLIST "--<  Available Ships in Sector >--"
  setdelaytrigger SYNCAFTERCOMMAND :SYNCAFTERSTEALDONE 750
  pause
  :SYNCAFTERSTEALDONE

  killalltriggers
  return
  :CONTINUE

  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  killtrigger 5
  killtrigger 6
  return
  :SELLCURRENTCARGO



  setvar $WSSTPORTACTIVE 0
  setvar $WSSTSOLDCARGO FALSE
  send "pt"
  :WSSTSELLWAIT

  settextlinetrigger WSSTSELLSTART1 :WSSTSELLPROGRESS "<Port>"
  settextlinetrigger WSSTSELLSTART2 :WSSTSELLPROGRESS "Docking..."
  settexttrigger WSSTSELLSTART3 :WSSTSELLPROGRESS "Your offer ["
  settexttrigger WSSTSELLSTART4 :WSSTSELLPROGRESS "Our final offer"
  settexttrigger WSSTSELLSTART5 :WSSTSELLPROGRESS "Agreed,"
  settexttrigger WSSTSELLQTY :WSSTSELLQTY "How many holds of "
  if ($WSSTPORTACTIVE = 1)
    settexttrigger WSSTSELLDONE1 :WSSTSELLDONE "Command [TL="
    settexttrigger WSSTSELLDONE2 :WSSTSELLDONE "Citadel command"
  end
  pause
  :WSSTSELLPROGRESS

  killalltriggers
  setvar $WSSTPORTACTIVE 1
  goto :WSSTSELLWAIT
  :WSSTSELLQTY

  killalltriggers
  setvar $WSSTPORTACTIVE 1
  setvar $WSSTLINE CURRENTLINE
  gosub :HANDLESELLCARGOQTY
  goto :WSSTSELLWAIT
  :WSSTSELLDONE

  killalltriggers
  return
  :HANDLESELLCARGOQTY

  setvar $WSSTTRADEPRODUCT "None"
  setvar $WSSTISBUY 0
  setvar $WSSTISSELL 0

  getwordpos $WSSTLINE $WSSTX " do you want to buy "
  if ($WSSTX > 0)
    setvar $WSSTISBUY 1
  else
    setvar $WSSTISSELL 1
  end

  getwordpos $WSSTLINE $WSSTX "Fuel"
  if ($WSSTX > 0)
    setvar $WSSTTRADEPRODUCT "Fuel"
  else
    getwordpos $WSSTLINE $WSSTX "Organics"
    if ($WSSTX > 0)
      setvar $WSSTTRADEPRODUCT "Organics"
    else
      getwordpos $WSSTLINE $WSSTX "Equipment"
      if ($WSSTX > 0)
        setvar $WSSTTRADEPRODUCT "Equipment"
      end
    end
  end

  if ($WSSTISSELL = 1)
    if (($WSSTTRADEPRODUCT = "None") and ($WSSTSELLPRODUCT <> "None"))
      setvar $WSSTTRADEPRODUCT $WSSTSELLPRODUCT
    end

    if ($WSSTTRADEPRODUCT = $WSSTSELLPRODUCT)
      send "*"
      setvar $WSSTSOLDCARGO TRUE
      setvar $WSSTSELLPRODUCT "None"
    else
      send "0*"
    end
    return
  end

  send "0*"
  return
  :GETSSTPORTINFO



  setvar $PORTINFOVALID TRUE
  gosub :ISUSABLESSTPORTCANDIDATE
  if ($CANDIDATEPORTVALID <> TRUE)
    setvar $PORTINFOVALID FALSE
    return
  end
  if ($player~current_sector = $TESTSECTOR)
    gosub :VERIFYCURRENTPORTREADY
    if ($CURRENTPORTREADY <> TRUE)
      setvar $PORTINFOVALID FALSE
      return
    end
  end
  send "* cr*q"
  waiton "What sector is the port in? ["
  :PORTINFO

  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  settextlinetrigger 1 :GETPORTEQUIP "Equipment  Buying"
  settextlinetrigger 2 :NOEQUIPHERE "I have no information about a port in that sector."
  settextlinetrigger 3 :NOEQUIPHERE "A  Cargo holds     :"
  settexttrigger 4 :NOEQUIPHERE "Command [TL="
  pause
  :NOEQUIPHERE

  killalltriggers
  setvar $EQUIPBUY 0
  setvar $EQUIPPERC 0
  setvar $PORTINFOVALID FALSE
  goto :GOTALLPORTINFO
  :GETPORTEQUIP

  killalltriggers
  getword CURRENTLINE $EQUIPBUY 3
  getword CURRENTLINE $EQUIPPERC 4
  striptext $EQUIPPERC "%"
  setvar $X 10000
  if (($EQUIPPERC = 0) or ($EQUIPBUY <= 0))
    setvar $PORTINFOVALID FALSE
    setvar $EQUIPATPORT[$TESTSECTOR] ($player~total_holds + 50)
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
  setvar $PORTNAME PORT.NAME[$TESTSECTOR]
  lowercase $PORTNAME
  if (($PORTNAME = "build") or (PORT.BUILDTIME[$TESTSECTOR] > 0) or (PORT.CLASS[$TESTSECTOR] = 9))
    setvar $PORTINFOVALID FALSE
    setvar $EQUIPATPORT[$TESTSECTOR] ($player~total_holds + 50)
  end
  :GOTALLPORTINFO

  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4

  return
  :ISUSABLESSTPORTCANDIDATE

  setvar $CANDIDATEPORTVALID TRUE
  if ($BUILDINGPORT[$TESTSECTOR] = TRUE)
    setvar $CANDIDATEPORTVALID FALSE
    return
  end
  if ((PORT.CLASS[$TESTSECTOR] <> 2) and ((PORT.CLASS[$TESTSECTOR] <> 3) and (PORT.CLASS[$TESTSECTOR] <> 4)))
    setvar $CANDIDATEPORTVALID FALSE
    return
  end
  if (PORT.BUYEQUIP[$TESTSECTOR] <> TRUE)
    setvar $CANDIDATEPORTVALID FALSE
    return
  end
  setvar $PORTNAME PORT.NAME[$TESTSECTOR]
  lowercase $PORTNAME
  if (($PORTNAME = "build") or (PORT.BUILDTIME[$TESTSECTOR] > 0) or (PORT.CLASS[$TESTSECTOR] = 9))
    setvar $CANDIDATEPORTVALID FALSE
  end
  return
  :VERIFYCURRENTPORTREADY

  setvar $CURRENTPORTREADY TRUE
  killalltriggers
  settextlinetrigger WSSTBUILDING :WSSTBUILDING "Under Construction"
  settexttrigger WSSTDISPLAYDONE :WSSTDISPLAYDONE "Command [TL="
  send "d"
  pause
  :WSSTBUILDING

  getword CURRENTLINE $PORTDISPLAYWORD 1
  if ($PORTDISPLAYWORD = "Ports")
    setvar $CURRENTPORTREADY FALSE
    setvar $BUILDINGPORT[$player~current_sector] TRUE
  end
  pause
  :WSSTDISPLAYDONE

  getwordpos CURRENTLINE $PORTPROMPTPOS "Command [TL="
  if ($PORTPROMPTPOS <> 1)
    settexttrigger WSSTDISPLAYDONE :WSSTDISPLAYDONE "Command [TL="
    pause
  end
  killalltriggers
  return
  :REFURB



  setvar $TWARP_REFURB_SUCCESS FALSE
  setvar $REFURBPORT $FURBING
  gosub :CHOOSENEARBYCLASS0REFURB
  if ($NEARCLASS0PORT > 0)
    setvar $REFURBPORT $NEARCLASS0PORT
  end
  if (($player~twarp_type <> "No") and ($REFURBPORT = $map~stardock))

    gosub :TWARPREFURB
    gosub :player~quikstats
  end

  if ($TWARP_REFURB_SUCCESS <> TRUE)
    if ($REFURBPORT <> 0)
      setvar $MOWINTOSECTOR $REFURBPORT
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
    gosub :player~quikstats
    if ($player~current_sector = $REFURBPORT)
      if ($REFURBPORT <> $map~stardock)
        send "p ty"
        waiton "A  Cargo holds     :"
        getword CURRENTLINE $HOLDSPRICE 5
        getword CURRENTLINE $HOLDSTOBUY 10
        setvar $BEFOREFURBCREDITS $player~credits
        setvar $player~credits ($player~credits - ($HOLDSPRICE * $HOLDSTOBUY))
        if ($player~credits > $CASH_TO_HOLD_ONTO)
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
            getword CURRENTLINE $player~shieldstobuy 9
          else
            setvar $player~shieldstobuy 0
          end
          if ($FIGSTOBUY > 0)
            if (($FIGPRICE * $FIGSTOBUY) > ($player~credits - $CASH_TO_HOLD_ONTO))
              setvar $FIGSTOBUY (($player~credits - $CASH_TO_HOLD_ONTO) / $FIGPRICE)
            end
            setvar $player~credits ($player~credits - ($FIGPRICE * $FIGSTOBUY))
          end
          if ($player~shieldstobuy > 0)
            if (($SHIELDPRICE * $player~shieldstobuy) > ($player~credits - $CASH_TO_HOLD_ONTO))
              setvar $player~shieldstobuy (($player~credits - $CASH_TO_HOLD_ONTO) / $SHIELDPRICE)
            end
            setvar $player~credits ($player~credits - ($SHIELDPRICE * $player~shieldstobuy))
          end
        else
          setvar $FIGSTOBUY 0
          setvar $player~shieldstobuy 0
        end
        send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$player~shieldstobuy&"* q q q z n * "
        return
      end
      send "p s g y g q "
    end
  end


  if ($player~current_sector = $REFURBPORT)
    killalltriggers
    send " s p"
    waiton "A  Cargo holds     :"
    getword CURRENTLINE $HOLDSPRICE 5
    getword CURRENTLINE $HOLDSTOBUY 10
    setvar $BEFOREFURBCREDITS $player~credits
    if ($player~credits > $CASH_TO_HOLD_ONTO)
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
        getword CURRENTLINE $player~shieldstobuy 9
      else
        setvar $player~shieldstobuy 0
      end
      if ($HOLDSTOBUY > 0)
        if (($HOLDSPRICE * $HOLDSTOBUY) > ($player~credits - $CASH_TO_HOLD_ONTO))
          setvar $HOLDSTOBUY (($player~credits - $CASH_TO_HOLD_ONTO) / $HOLDSPRICE)
        end
        setvar $player~credits ($player~credits - ($HOLDSPRICE * $HOLDSTOBUY))
      end
      if ($FIGSTOBUY > 0)
        if (($FIGPRICE * $FIGSTOBUY) > ($player~credits - $CASH_TO_HOLD_ONTO))
          setvar $FIGSTOBUY (($player~credits - $CASH_TO_HOLD_ONTO) / $FIGPRICE)
        end
        setvar $player~credits ($player~credits - ($FIGPRICE * $FIGSTOBUY))
      end
      if ($player~shieldstobuy > 0)
        if (($SHIELDPRICE * $player~shieldstobuy) > ($player~credits - $CASH_TO_HOLD_ONTO))
          setvar $player~shieldstobuy (($player~credits - $CASH_TO_HOLD_ONTO) / $SHIELDPRICE)
        end
        setvar $player~credits ($player~credits - ($SHIELDPRICE * $player~shieldstobuy))
      end
    else
      setvar $FIGSTOBUY 0
      setvar $player~shieldstobuy 0
      setvar $HOLDSTOBUY 0
    end
    send "a "&$HOLDSTOBUY&"* y b "&$FIGSTOBUY&"* c "&$player~shieldstobuy&"* q q h "
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
    gettext CURRENTLINE $player~credits #179&"Creds" #179&"Figs"
    striptext $player~credits " "
    striptext $player~credits ","

    setvar $SPENTCREDITS ($SPENTCREDITS + ($BEFOREFURBCREDITS - $player~credits))
    setvar $player~fighterspurchased ($player~fighterspurchased + $FIGSTOBUY)
    setvar $player~shieldspurchased ($player~shieldspurchased + $player~shieldstobuy)
  else
    send "'Something bad happened on refurb, I am probably in big trouble. [Temp error message until saveme implemented]*"
  end
  if ($TWARP_REFURB_SUCCESS = TRUE)
    send " q q * "
    waitfor "Command [TL="
    setvar $player~warpto $START_SECTOR
    gosub :move~twarp
    if ($player~twarpsuccess = FALSE)
      gosub :player~quikstats
      if ($player~current_sector = $map~stardock)
        gosub :RECOVERDOCKREFURB
        if ($DOCKREFURBRECOVERED <> TRUE)
          setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
          gosub :switchboard~switchboard
          send "*"
          halt
        end
        return
      end
    end
    send "j y * "
    waitfor "Command [TL="
  else
    :DONENORMALFURB
    setvar $TWARP_REFURB_SUCCESS FALSE
    send " Q Q "
  end
  return
  :RECOVERDOCKREFURB

  setvar $DOCKREFURBRECOVERED FALSE
  gosub :player~quikstats
  if ($player~current_sector <> $map~stardock)
    return
  end
  if ($INSHIP1)
    setvar $SHIP1SECTOR $map~stardock
  else
    setvar $SHIP2SECTOR $map~stardock
  end
  gosub :FINDSHIP
  if ($DESTINATION <= 0)
    return
  end
  setarray $DOCKREFURBCHECKED SECTORS
  setarray $DOCKREFURBQUEUE SECTORS
  setarray $DOCKREFURBHOP SECTORS
  setvar $DOCKREFURBBOTTOM 1
  setvar $DOCKREFURBTOP 1
  setvar $DOCKREFURBSECTOR 0
  setvar $DOCKREFURBQUEUE[1] $map~stardock
  setvar $dockrefurbchecked[$map~stardock] 1
  while (($DOCKREFURBBOTTOM <= $DOCKREFURBTOP) and ($DOCKREFURBSECTOR = 0))
    setvar $TESTSECTOR $DOCKREFURBQUEUE[$DOCKREFURBBOTTOM]
    if ($TESTSECTOR <> $map~stardock)
      gosub :DOCKREFURBCANDIDATE
    end
    if (($DOCKREFURBSECTOR = 0) and ($DOCKREFURBHOP[$TESTSECTOR] < $TRANSPORTRANGE))
      setvar $DOCKREFURBWARP 1
      while (SECTOR.WARPS[$TESTSECTOR][$DOCKREFURBWARP] > 0)
        setvar $DOCKREFURBNEXT SECTOR.WARPS[$TESTSECTOR][$DOCKREFURBWARP]
        if ($DOCKREFURBCHECKED[$DOCKREFURBNEXT] = 0)
          setvar $DOCKREFURBCHECKED[$DOCKREFURBNEXT] 1
          add $DOCKREFURBTOP 1
          setvar $DOCKREFURBQUEUE[$DOCKREFURBTOP] $DOCKREFURBNEXT
          setvar $DOCKREFURBHOP[$DOCKREFURBNEXT] ($DOCKREFURBHOP[$TESTSECTOR] + 1)
        end
        add $DOCKREFURBWARP 1
      end
    end
    add $DOCKREFURBBOTTOM 1
  end
  if ($DOCKREFURBSECTOR <= 0)
    return
  end
  setvar $CHECKSECTOR $DOCKREFURBSECTOR
  gosub :VERIFYSECTORADJDOCK
  if ($SECTORADJDOCK)
    setvar $MOWINTOSECTOR $DOCKREFURBSECTOR
    gosub :MOWINTOSECTOR
  else
    setvar $player~warpto $DOCKREFURBSECTOR
    gosub :move~twarp
    if ($player~twarpsuccess <> TRUE)
      return
    end
  end
  send "j y * "
  waitfor "Command [TL="
  gosub :player~quikstats
  if ($player~current_sector <> $DOCKREFURBSECTOR)
    return
  end
  setvar $TESTSECTOR $DOCKREFURBSECTOR
  gosub :GETSSTPORTINFO
  if ($PORTINFOVALID <> TRUE)
    return
  end
  if ($INSHIP1)
    setvar $SHIP1SECTOR $DOCKREFURBSECTOR
    setvar $SHIP1NEEDSPORT FALSE
    setvar $SHIP1TOTALHOLDS $player~total_holds
    setvar $SHIP1EQUIPMENT $player~equipment_holds
    setvar $SHIP2NEEDSPORT TRUE
  else
    setvar $SHIP2SECTOR $DOCKREFURBSECTOR
    setvar $SHIP2NEEDSPORT FALSE
    setvar $SHIP2TOTALHOLDS $player~total_holds
    setvar $SHIP2EQUIPMENT $player~equipment_holds
    setvar $SHIP1NEEDSPORT TRUE
  end
  setvar $DOCKREFURBRECOVERED TRUE
  setvar $switchboard~message "Recovered from dock refurb at sector "&$DOCKREFURBSECTOR&".*"
  gosub :switchboard~switchboard
  return
  :DOCKREFURBCANDIDATE

  setvar $CANDIDATEOK TRUE
  gosub :ISUSABLESSTPORTCANDIDATE
  if ($CANDIDATEPORTVALID <> TRUE)
    setvar $CANDIDATEOK FALSE
  end
  getsectorparameter $TESTSECTOR "BUSTED" $ISBUSTED
  if ($ISBUSTED = TRUE)
    setvar $CANDIDATEOK FALSE
  end
  if ($TESTSECTOR = $DESTINATION)
    setvar $CANDIDATEOK FALSE
  end
  setvar $CONTAINSSHIELDEDPLANET FALSE
  setvar $P 1
  while ($P <= SECTOR.PLANETCOUNT[$TESTSECTOR])
    getword SECTOR.PLANETS[$TESTSECTOR][$P] $TEST 1
    if ($TEST = "<<<<")
      setvar $CONTAINSSHIELDEDPLANET TRUE
    end
    add $P 1
  end
  if ($CONTAINSSHIELDEDPLANET)
    setvar $CANDIDATEOK FALSE
  end
  setvar $FIGOWNER SECTOR.FIGS.OWNER[$TESTSECTOR]
  setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$TESTSECTOR]
  if (($FIGCOUNT > $SAFEFIGHTERLEVEL) and (($FIGOWNER <> "belong to your Corp") and ($FIGOWNER <> "yours")))
    setvar $CANDIDATEOK FALSE
  end
  getsectorparameter $TESTSECTOR "FIGSEC" $ISFIGGED
  setvar $CHECKSECTOR $TESTSECTOR
  gosub :VERIFYSECTORADJDOCK
  if (($ISFIGGED <> TRUE) and ($SECTORADJDOCK <> TRUE))
    setvar $CANDIDATEOK FALSE
  end
  getdistance $DIST1 $TESTSECTOR $DESTINATION
  getdistance $DIST2 $DESTINATION $TESTSECTOR
  if (($DIST1 <= 0) or ($DIST2 <= 0) or ($DIST1 > $TRANSPORTRANGE) or ($DIST2 > $TRANSPORTRANGE))
    setvar $CANDIDATEOK FALSE
  end
  if ($CANDIDATEOK)
    setvar $DOCKREFURBSECTOR $TESTSECTOR
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
    setvar $planet~planetsafe (SECTOR.PLANETCOUNT[$NEXTSAFESECTOR] <= 0) or ($NEXTSAFESECTOR = $map~stardock) or ($NEXTSAFESECTOR <= 10)
    setvar $NAVHAZSAFE TRUE
    setvar $DENSITYSAFE TRUE
    setvar $player~limpetsafe TRUE
    if ($DENSITYSAFE or ($player~limpetssafe and ($FIGSSAFE and ($MINESSAFE and ($NAVHAZSAFE and $planet~planetsafe)))))
      setvar $RESULT $RESULT&"m "&$COURSE[$J]&"* "
      if (($COURSE[$J] > 10) and ($COURSE[$J] <> STARDOCK))
        setvar $RESULT $RESULT&"za"&$ship~ship_max_attack&"* * "
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
      setvar $RESULT $RESULT&"za"&$ship~ship_max_attack&"* * "
    end
    if (($DROPFIGS = TRUE) and (($COURSE[$J] > 10) and (($COURSE[$J] <> STARDOCK) and ($J > 2))))
      setvar $FIG_DROP 1
      if ($X100)
        if ($player~fighters > 1000)
          setvar $FIG_DROP 100
          setvar $player~fighters ($player~fighters - 100)
        end
      elseif ($X1000)
        if ($player~fighters > 10000)
          setvar $FIG_DROP 1000
          setvar $player~fighters ($player~fighters - 1000)
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



  if ($player~credits >= $DROPCASHLIMIT)
    setvar $CASHDROPAMOUNT $DROPCASHLIMIT
    if (($player~credits - $CASHDROPAMOUNT) < $CASH_TO_HOLD_ONTO)
      return
    end
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
    gosub :player~quikstats
    if ($player~current_sector = $CASHDROPSECTOR)
      send "l "&$CASHDROPPLANET&"* c t t "&$CASHDROPAMOUNT&"* qq* "

      add $CASHDEPOSITED $CASHDROPAMOUNT
      subtract $player~credits $CASHDROPAMOUNT
      gosub :DISPLAYCREDITS
      if ($INSHIP1)
        setvar $SHIP1SECTOR $player~current_sector
        setvar $SHIP1NEEDSPORT TRUE
      else
        setvar $SHIP2SECTOR $player~current_sector
        setvar $SHIP2NEEDSPORT TRUE
      end
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
  setvar $SPENTCREDITS2 $player~credits
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
  setvar $SPENTCREDITS2 $player~fighterspurchased
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDFIGHTERS ","&$SNIPPET&$FORMATTEDFIGHTERS
  end
  setvar $FORMATTEDFIGHTERS $SPENTCREDITS2&$FORMATTEDFIGHTERS

  setvar $FORMATTEDSHIELDS ""
  setvar $SPENTCREDITS2 $player~shieldspurchased
  getlength $SPENTCREDITS2 $LENGTH
  while ($LENGTH > 3)
    cuttext $SPENTCREDITS2 $SNIPPET ($LENGTH - 2) 9999
    cuttext $SPENTCREDITS2 $SPENTCREDITS2 1 ($LENGTH - 3)
    getlength $SPENTCREDITS2 $LENGTH
    setvar $FORMATTEDSHIELDS ","&$SNIPPET&$FORMATTEDSHIELDS
  end
  setvar $FORMATTEDSHIELDS $SPENTCREDITS2&$FORMATTEDSHIELDS

  add $PORTAVERAGE $CASHDEPOSITED
  add $PORTAVERAGE $player~credits
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
  gosub :haggle~restoreautohaggle
  setvar $switchboard~message "World SST has completed, make sure you pick up the bot and its ships.*"
  gosub :switchboard~switchboard
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
    if ($SHIPNUM = $WSST_SHIP2)
      setvar $FOUND2 CURRENTLINE
      replacetext $FOUND2 "+" " "
      getword $FOUND2 $FOUND2 2
    elseif ($SHIPNUM = $WSST_SHIP1)
      setvar $FOUND1 CURRENTLINE
      replacetext $FOUND1 "+" " "
      getword $FOUND1 $FOUND1 2
    end
    goto :NEXTSHIP
  end
  send "      "
  if ($INSHIP1)
    setvar $DESTINATION $FOUND2
  else
    setvar $DESTINATION $FOUND1
  end
  gosub :player~quikstats

  getdistance $DIST1 $player~current_sector $DESTINATION

  if ($DIST1 = "-1")
    send "cf"&$player~current_sector&"*"&$DESTINATION&"*q"
    waiton "What is the starting sector"
    waiton "Command [TL="
    getdistance $DIST1 $player~current_sector $DESTINATION
  end
  getdistance $DIST2 $DESTINATION $player~current_sector

  if ($DIST2 = "-1")
    send "cf"&$DESTINATION&"*"&$player~current_sector&"*q"
    waiton "What is the starting sector"
    waiton "Command [TL="
    getdistance $DIST2 $DESTINATION $player~current_sector
  end
  return
  :TWARPREFURB




  setvar $I 1
  setvar $START_SECTOR $player~current_sector
  setvar $WEAREADJDOCK FALSE
  while ($I <= SECTOR.WARPCOUNT[$START_SECTOR])
    setvar $ADJ_START SECTOR.WARPS[$START_SECTOR][$I]
    if ($ADJ_START = $map~stardock)
      setvar $WEAREADJDOCK TRUE
    end
    add $I 1
  end

  echo "**"&ANSI_14&"Please Stand By"&ANSI_15&" - Calculating Distances...**"
  getdistance $DIST1 $START_SECTOR $map~stardock

  if ($DIST1 <= 0)
    setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
    gosub :switchboard~switchboard
    send "*"
    halt
  end

  getdistance $DIST2 $map~stardock $START_SECTOR
  if ($DIST2 <= 0)
    setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
    gosub :switchboard~switchboard
    send "*"
    halt
  end

  setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

  if ($player~ore_holds < $ORE_REQ)


    send "*"
    gosub :GETSOMEFUEL
    gosub :player~quikstats
    setvar $I 1
    setvar $WEAREADJDOCK FALSE
    while ($I <= SECTOR.WARPCOUNT[$player~current_sector])
      setvar $ADJ_START SECTOR.WARPS[$player~current_sector][$I]
      if ($ADJ_START = $map~stardock)
        setvar $WEAREADJDOCK TRUE
      end
      add $I 1
    end
    getdistance $DIST1 $player~current_sector $map~stardock
    if ($DIST1 <= 0)
      setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
      gosub :switchboard~switchboard
      send "*"
      halt
    end
    setvar $ORE_REQ (($DIST1 + $DIST2) * 3)
    if ($player~ore_holds < $ORE_REQ)
      setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ORE_REQ&".*"
      gosub :switchboard~switchboard
      send "*"
      halt
    end
  end

  if (($player~alignment < 1000) and ($WEAREADJDOCK = FALSE))
    setvar $RED_ADJ 0
    gosub :FINDJUMPSECTOR
    if ($RED_ADJ = 0)
      gosub :CHOOSECLASS0FIGFALLBACK
      if ($CLASS0FALLBACKPORT > 0)
        setvar $REFURBPORT $CLASS0FALLBACKPORT
        return
      end
      waitfor "Command [TL="


      send "*"
      return
    end
  end

  if ($player~alignment >= 1000)
    if ($WEAREADJDOCK)
      send "^F"&$map~stardock&"*"&$START_SECTOR&"*Q/ "
    else
      send "^F"&$player~current_sector&"*"&$map~stardock&"*F"&$map~stardock&"*"&$START_SECTOR&"*Q/ "
    end
  else
    if ($WEAREADJDOCK)
      send "^F"&$map~stardock&"*"&$START_SECTOR&"*Q/ "
    else
      send "^F"&$player~current_sector&"*"&$RED_ADJ&"*F"&$map~stardock&"*"&$START_SECTOR&"*Q/ "
    end
  end
  settextlinetrigger NOJOY :NOJOY "*** Error - No route within"
  settextlinetrigger CONT :CONT ": ENDINTERROG"
  pause
  :NOJOY

  killalltriggers
  setvar $switchboard~message "Cannot Find Path to StarDock!*"
  gosub :switchboard~switchboard
  send "*"
  halt
  :CONT

  killalltriggers
  settexttrigger ROUTENAVPROMPT :ROUTENAVPROMPT "Choose NavPoint (?=Help)"
  settexttrigger ROUTECMDPROMPT :ROUTECMDPROMPT "Command [TL="
  setdelaytrigger ROUTEPROMPTDELAY :ROUTEPROMPTDELAY 1000
  pause
  :ROUTENAVPROMPT

  killalltriggers
  send "q"
  waitfor "Command [TL="
  goto :LATENCY_DELAY
  :ROUTECMDPROMPT

  killalltriggers
  goto :LATENCY_DELAY
  :ROUTEPROMPTDELAY

  killalltriggers
  waitfor "Command [TL="
  :LATENCY_DELAY

  if ($player~twarp_type = "No")
    setvar $switchboard~message "Must Have Twarp 1 or 2*"
    gosub :switchboard~switchboard
    send "*"
    halt
  end

  if ($player~unlimitedgame = 0)
    gosub :TURNSREQUIRED
    if ($TURNSREQUIRED > CURRENTTURNS)
      setvar $switchboard~message "Not Enough Turns. "&$TURNSREQUIRED&", Required*"
      gosub :switchboard~switchboard
      send "*"
      halt
    end
    if ($TURNSREQUIRED <= CURRENTTURNS)
      setvar $TMP (CURRENTTURNS - $TURNSREQUIRED)
      if ($TMP <= $bot~bot_turn_limit)
        setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$bot~bot_turn_limit&" Turns!*"
        gosub :switchboard~switchboard
        send "*"
        halt
      end
    end
  end
  send " C R "&$map~stardock&"*Q "
  settextlinetrigger ITSALIVE :ITSALIVE "Items     Status  Trading % of max OnBoard"
  settextlinetrigger NOSOUPFORME :NOSOUPFORME "I have no information about a port in that sector"
  pause
  :NOSOUPFORME

  killalltriggers
  setvar $switchboard~message "StarDock appears to have been Blown Up!*"
  gosub :switchboard~switchboard
  send "*"
  halt
  :ITSALIVE

  killalltriggers
  waitfor "(?="
  setvar $MSG ""
  if ((CURRENTALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
    setvar $WARPTO $map~stardock
    gosub :DOTWARP
  elseif (($WEAREADJDOCK = FALSE) and ($RED_ADJ <> 0))
    setvar $WARPTO $RED_ADJ
    gosub :DOTWARP
  else
    send "q q *  m "&$map~stardock&"*  *  P  S G Y G Q "
    setvar $TWARP_REFURB_SUCCESS TRUE
  end
  if ($MSG = "")
    waitfor "You leave the Galactic Bank."
  else
    setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
    gosub :switchboard~switchboard
    send "*"
    halt
  end
  gosub :player~quikstats

  return
  :GETSOMEFUEL



  gosub :player~quikstats
  setvar $FUELNEEDED ($ORE_REQ - $player~ore_holds)
  if ($FUELNEEDED < 1)
    return
  end
  setvar $BOTTOM 1
  setvar $TOP 1
  setarray $CHECKED SECTORS
  setvar $QUE[1] $player~current_sector
  setvar $checked[$player~current_sector] 1
  setvar $A 1
  :TRY_AGAIN

  while ($BOTTOM <= $TOP)

    setvar $FOCUS $QUE[$BOTTOM]
    getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
    getsectorparameter $FOCUS "BUSTED" $ISBUSTED

    getdistance $FUEL_DIST1 $FOCUS $map~stardock
    if ($FUEL_DIST1 <= 0)
      goto :QUEUEFUELADJACENTS
    end
    setvar $CANDIDATEFUELNEEDED (($FUEL_DIST1 + $DIST2) * 3)
    subtract $CANDIDATEFUELNEEDED $player~ore_holds
    if ($CANDIDATEFUELNEEDED < 1)
      setvar $CANDIDATEFUELNEEDED 1
    end

    if ((PORT.EXISTS[$FOCUS] = TRUE) and ((PORT.BUYFUEL[$FOCUS] <> TRUE) and (($ISBUSTED <> TRUE) and (PORT.BUILDTIME[$FOCUS] <= 0))))
      gosub :CHECKFUELCANDIDATE
      if (($FUELPORTVALID = TRUE) or ($FUELPORTUPGRADEABLE = TRUE))
        if ($player~current_sector <> $FOCUS)
          setvar $MOWINTOSECTOR $FOCUS
          gosub :MOWINTOSECTOR
          gosub :player~quikstats
          if ($player~current_sector <> $FOCUS)
            goto :QUEUEFUELADJACENTS
          end
          gosub :VERIFYCURRENTPORTREADY
          if ($CURRENTPORTREADY <> TRUE)
            setvar $FUELPORTVALID FALSE
            setvar $FUELPORTUPGRADEABLE FALSE
            goto :QUEUEFUELADJACENTS
          end
        end
        if ($FUELPORTVALID <> TRUE)
          gosub :UPGRADEFUELCANDIDATE
          gosub :CHECKFUELCANDIDATE
        end
      end
      if ($FUELPORTVALID = TRUE)
        if (PORT.BUYORG[$FOCUS] and ($player~organic_holds > 0)) or (PORT.BUYEQUIP[$FOCUS] and ($player~equipment_holds > 0))
          send "p t * * * * * * "
        else
          if (($player~ore_holds > 0) or ($player~organic_holds > 0) or ($player~equipment_holds > 0))
            send "j y "
          end
          send "p t * * 0 * 0 * "
        end
        return
      end
    end
    :QUEUEFUELADJACENTS


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
  setvar $switchboard~message "Can't find a route to fuel.  Halting*"
  gosub :switchboard~switchboard
  halt
  :CHECKFUELCANDIDATE





  killalltriggers
  setvar $FUELPORTVALID FALSE
  setvar $FUELPORTUPGRADEABLE FALSE
  setvar $FUELPORTAMOUNT 0
  setvar $FUELPORTPERCENT 0
  if ($BUILDINGPORT[$FOCUS] = TRUE)
    return
  end
  if ($player~current_sector = $FOCUS)
    gosub :VERIFYCURRENTPORTREADY
    if ($CURRENTPORTREADY <> TRUE)
      return
    end
  end
  send "c r"
  waiton "What sector is the port in?"
  settextlinetrigger WSSTFUELPORTLINE :WSSTFUELPORTLINE "Fuel Ore"
  settextlinetrigger WSSTNOFUELPORT1 :WSSTNOFUELPORT "I have no information about a port in that sector."
  settextlinetrigger WSSTNOFUELPORT2 :WSSTNOFUELPORT "You have never visted sector"
  settexttrigger WSSTFUELPORTDONE :WSSTFUELPORTDONE "Command [TL="
  send $FOCUS&"*q"
  pause
  :WSSTFUELPORTLINE

  getword CURRENTLINE $FUELPORTSTATUS 3
  getword CURRENTLINE $FUELPORTAMOUNT 4
  getword CURRENTLINE $FUELPORTPERCENT 5
  striptext $FUELPORTAMOUNT ","
  striptext $FUELPORTPERCENT "%"
  if (($FUELPORTSTATUS = "Selling") and ($FUELPORTAMOUNT >= $CANDIDATEFUELNEEDED))
    setvar $FUELPORTVALID TRUE
  end
  if (($FUELPORTSTATUS = "Selling") and (($FUELPORTAMOUNT < $CANDIDATEFUELNEEDED) and ($FUELPORTPERCENT < 100)))
    setvar $FUELPORTUPGRADEABLE TRUE
  end
  pause
  :WSSTNOFUELPORT

  setvar $FUELPORTVALID FALSE
  pause
  :WSSTFUELPORTDONE

  killalltriggers
  return
  :UPGRADEFUELCANDIDATE



  killalltriggers
  setvar $FUELUPGRADEFAILED FALSE
  send "o1100*q "
  settextlinetrigger WSSTFUELUPGRADEFAIL1 :WSSTFUELUPGRADEFAILED "There aren't that many"
  settextlinetrigger WSSTFUELUPGRADEFAIL2 :WSSTFUELUPGRADEFAILED "You don't have enough credits"
  settextlinetrigger WSSTFUELUPGRADEFAIL3 :WSSTFUELUPGRADEFAILED "Do you want to initiate construction"
  settexttrigger WSSTFUELUPGRADEDONE :WSSTFUELUPGRADEDONE "Command [TL="
  pause
  :WSSTFUELUPGRADEFAILED

  setvar $FUELUPGRADEFAILED TRUE
  pause
  :WSSTFUELUPGRADEDONE

  killalltriggers
  return
  :FINDJUMPSECTOR



  setvar $I 1
  setvar $RED_ADJ 0
  setvar $JUMP_START $player~current_sector
  send "qq*"
  while (SECTOR.WARPSIN[$map~stardock][$I] > 0)
    setvar $RED_ADJ SECTOR.WARPSIN[$map~stardock][$I]
    setvar $CHECKSECTOR $RED_ADJ
    gosub :VERIFYSECTORADJDOCK
    if ($SECTORADJDOCK = FALSE)
      goto :TRYINGNEXTADJ
    end
    getsectorparameter $RED_ADJ "FIGSEC" $REDADJFIGGED
    if ($REDADJFIGGED <> TRUE)
      goto :TRYINGNEXTADJ
    end
    send "m "&$RED_ADJ&"*"
    settexttrigger TWARPENGAGE :TWARPENGAGE "Do you want to engage the TransWarp drive? "
    settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
    settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
    settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
    settextlinetrigger TWARPMOVED :TWARPMOVED "Sector  : "&$RED_ADJ&" "
    settexttrigger TWARPALREADY :TWARPALREADY "You are already in that sector!"
    settextlinetrigger TWARPNAVPOINT :TWARPNAVPOINT "<Set NavPoint>"
    settextlinetrigger TWARPEMPTY :TWARPEMPTY "You do not have enough Fuel Ore to make the jump"
    pause
    :TWARPENGAGE

    killtrigger TWARPENGAGE
    send "y"
    pause
    :TWARPMOVED

    killalltriggers
    send " z* "
    setvar $player~current_sector $RED_ADJ
    return
    :TWARPALREADY

    killalltriggers
    setvar $player~current_sector $RED_ADJ
    return
    :TWARPNAVPOINT

    killalltriggers
    send "q*"
    waitfor "Command [TL="
    goto :TRYINGNEXTADJ
    :TWARPVOIDED

    killalltriggers
    send "nn"
    waitfor "Command [TL="
    goto :TRYINGNEXTADJ
    :TWARPLOCKED

    killalltriggers
    send "n"
    waitfor "Command [TL="
    goto :SECTORLOCKED
    :TWARPBLIND

    killalltriggers
    send "n"
    setsectorparameter $RED_ADJ "FIGSEC" FALSE
    waitfor "Command [TL="
    goto :TRYINGNEXTADJ
    :TWARPEMPTY

    killalltriggers
    waitfor "Command [TL="
    :TRYINGNEXTADJ

    add $I 1
  end
  :NOADJSFOUND

  setvar $RED_ADJ 0
  return
  :SECTORLOCKED

  return
  :CHOOSENEARBYCLASS0REFURB

  setvar $NEARCLASS0PORT 0
  setvar $NEARCLASS0DIST 100000
  setvar $CLASS0CANDIDATE 0
  setvar $CLASS0CANDIDATE $map~rylos
  gosub :CONSIDERNEARBYCLASS0
  setvar $CLASS0CANDIDATE $map~alpha_centauri
  gosub :CONSIDERNEARBYCLASS0
  setvar $CLASS0CANDIDATE 1
  gosub :CONSIDERNEARBYCLASS0
  return
  :CONSIDERNEARBYCLASS0

  if ($CLASS0CANDIDATE <= 0)
    return
  end
  getdistance $CLASS0DIST $player~current_sector $CLASS0CANDIDATE
  if (($CLASS0DIST > 0) and (($CLASS0DIST <= 3) and ($CLASS0DIST < $NEARCLASS0DIST)))
    setvar $NEARCLASS0PORT $CLASS0CANDIDATE
    setvar $NEARCLASS0DIST $CLASS0DIST
  end
  return
  :CHOOSECLASS0FIGFALLBACK

  setvar $CLASS0FALLBACKPORT 0
  setvar $CLASS0FALLBACKDIST 100000
  setvar $CLASS0CANDIDATE 0
  setvar $CLASS0CANDIDATE $map~rylos
  gosub :CONSIDERCLASS0FIGFALLBACK
  setvar $CLASS0CANDIDATE $map~alpha_centauri
  gosub :CONSIDERCLASS0FIGFALLBACK
  setvar $CLASS0CANDIDATE 1
  gosub :CONSIDERCLASS0FIGFALLBACK
  return
  :CONSIDERCLASS0FIGFALLBACK

  if ($CLASS0CANDIDATE <= 0)
    return
  end
  setvar $CLASS0HASFIGADJ FALSE
  setvar $CLASS0ADJIDX 1
  while (SECTOR.WARPSIN[$CLASS0CANDIDATE][$CLASS0ADJIDX] > 0)
    setvar $CLASS0ADJ SECTOR.WARPSIN[$CLASS0CANDIDATE][$CLASS0ADJIDX]
    getsectorparameter $CLASS0ADJ "FIGSEC" $CLASS0ISFIGGED
    if ($CLASS0ISFIGGED)
      setvar $CLASS0HASFIGADJ TRUE
    end
    add $CLASS0ADJIDX 1
  end
  if ($CLASS0HASFIGADJ)
    getdistance $CLASS0DIST $player~current_sector $CLASS0CANDIDATE
    if (($CLASS0DIST > 0) and ($CLASS0DIST < $CLASS0FALLBACKDIST))
      setvar $CLASS0FALLBACKPORT $CLASS0CANDIDATE
      setvar $CLASS0FALLBACKDIST $CLASS0DIST
    end
  end
  return
  :VERIFYSECTORADJDOCK

  setvar $SECTORADJDOCK FALSE
  if (($CHECKSECTOR <= 0) or ($map~stardock <= 0))
    return
  end
  setvar $CHECKWARPIDX 1
  while (SECTOR.WARPS[$CHECKSECTOR][$CHECKWARPIDX] > 0)
    if (SECTOR.WARPS[$CHECKSECTOR][$CHECKWARPIDX] = $map~stardock)
      setvar $SECTORADJDOCK TRUE
    end
    add $CHECKWARPIDX 1
  end
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
    waitfor "Command [TL="
    if ((CURRENTALIGNMENT < 1000) and ($WARPTO <> $map~stardock))
      send "m "&$map~stardock&"*"
      waitfor "Command [TL="
    end
    send "p s g y g q"
    setvar $TWARP_REFURB_SUCCESS TRUE
    goto :TWARPDONE
    :LOCKING

    killalltriggers
    send "y"
    settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
    settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
    settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
    settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
    pause
    :TWARPNOFUEL

    killalltriggers
    setvar $MSG "Not enough fuel for T-warp."
    goto :TWARPDONE
    :TWARP_ADJ

    killalltriggers
    send " q * "
    setvar $MSG "Twarp target opened navpoint instead of locking."
    goto :TWARPDONE
    :TWARPNOROUTE

    killalltriggers
    send "n* z* "
    setvar $MSG "No route available!"
    goto :TWARPDONE
    :NO_TWARP_LOCK

    killalltriggers
    send "n*zn"
    setsectorparameter $WARPTO "FIGSEC" FALSE
    setvar $MSG "no twarp lock"
    goto :TWARPDONE
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
      setvar $STR "y  *  *  m "&$map~stardock&" *  *  p s g y g q "
      send $STR
    end
    setvar $TWARP_REFURB_SUCCESS TRUE
    :TWARPDONE

    if ($MSG <> "")
      setvar $switchboard~message "Twarp Error - "&$MSG&"*"
      gosub :switchboard~switchboard
      send "*"
    end
  end
  return

# includes:
include "wsst_include/planet.ts"
include "wsst_include/player.ts"
include "wsst_include/switchboard.ts"
include "wsst_include/ship.ts"
include "wsst_include/move.ts"
include "wsst_include/loadvars.ts"
include "wsst_include/help.ts"
include "wsst_include/haggle.ts"
