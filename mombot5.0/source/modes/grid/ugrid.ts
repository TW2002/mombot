logging "OFF"
reqrecording
goto :LOAD_SCRIPT
include "source\include\planet"
:LOAD_SCRIPT


loadvar $BOT_NAME
loadvar $AVOIDEDSECTORSUGRID
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $STARDOCK
loadvar $HOME_SECTOR
loadvar $BACKDOOR
loadvar $LIMPET_COST
loadvar $ARMID_COST
loadvar $LIMPET_REMOVAL_COST
loadvar $PASSWORD
setvar $GRID_LIMPETS 3
setvar $GRID_ARMIDS 3
setvar $REFURB TRUE
loadvar $FIG_FILE
loadvar $LIMP_FILE
loadvar $ARMID_FILE
loadvar $COMMAND
setvar $GRIDDER_FILE "_MOM"&GAMENAME&"_GRIDDER_TARGETS.txt"
setvar $MASTER_EDGE_FILE "_MOM_"&GAMENAME&"_EdgeMasterList.sectors"
setvar $UNEXPLORED_FILE "_MOM_UNEXPLORED_"&GAMENAME&".sectors"
setvar $IMLIMPED FALSE
setarray $MOVE SECTORS
setvar $CHECKEDFORINFO ""
setvar $GRID_FIGS 1
setvar $ATTACK_RETREAT FALSE

getsectorparameter SECTORS "FIGSEC" $ISFIGGED
getsectorparameter SECTORS "MINESEC" $ISARMIDED
getsectorparameter SECTORS "LIMPSEC" $ISLIMPED
fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- ugrid [targeting] {figs} {armids} {limpets} {safety} {planets} {warp} {refurb} {scrub} {avoid) {aggressive} {clear}"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "  Ultimate gridder. Visits all targeted sectors. "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [targeting]   = How target list is generated.  Must be either"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                     a filename to pull list from or 'auto' which "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                     will autogenerate list of targets.           "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                                  "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [figs]        = Number of fighters to drop                   "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: 1                             "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [armids]      = Number of armid mines to drop                "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: 3                             "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [limps]       = Number of limpet mines to drop               "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: 3                             "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [safety]      = 'ultra', 'safe', and 'none'                  "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "              none = Will land adjacent to all non-figged sectors "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "              safe = Only will land to sectors with friendly limps"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "             ultra = Like safe, but needs friendly armids too     "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: ultra                         "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [planets]     = 'all', 'shielded', 'none'                    "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "               all = Avoid all planets in target sectors          "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "          shielded = Avoid only shielded planets in target sectors"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: all                           "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [warp]        = 'twarp' or 'bwarp'                           "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                         - Default: twarp                         "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [norefurb]    = Turns off auto refurbing of mines at Stardock"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [scrub]       = Will scrub at dock when catching a limpet    "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [avoid]       = Avoid sectors with enemy limpets             "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [aggressive]  = Won't avoid big fighter groups               "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [passive]     = Avoids hitting player fighters or mines.     "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [clear]       = Clears internal list of avoided sectors.     "
  setvar $switchboard~message "Writing help file for this command in Help directory.*"
  gosub :switchboard~switchboard
end

getword $USER_COMMAND_LINE $PARM1 1 "EMPTY"
if (($PARM1 = "auto") or ($PARM1 = "EMPTY"))

else
  setvar $GRIDTARGETS TRUE
  setvar $TARGETFILE $PARM1
  fileexists $TEST $TARGETFILE
  if ($TEST = FALSE)
    setvar $switchboard~message "Grid target file: [" $TARGETFILE "] does not exist, shutting down..*"
    gosub :switchboard~switchboard
    halt
  else
    readtoarray $TARGETFILE $TARGETSECTORS
  end
end
getword $USER_COMMAND_LINE $PARM2 2 "EMPTY"
getword $USER_COMMAND_LINE $PARM3 3 "EMPTY"
getword $USER_COMMAND_LINE $PARM4 4 "EMPTY"
isnumber $TEST $PARM2
if ($TEST)
  setvar $GRID_FIGS $PARM2
end
isnumber $TEST $PARM3
if ($TEST)
  setvar $GRID_ARMIDS $PARM3
end
isnumber $TEST $PARM4
if ($TEST)
  setvar $GRID_LIMPETS $PARM4
end
getwordpos $USER_COMMAND_LINE $POS "aggressive"
if ($POS > 0)
  setvar $ATTACKRETREAT TRUE
else
  setvar $ATTACKRETREAT FALSE
end

getwordpos $USER_COMMAND_LINE $POS "avoid"
if ($POS > 0)
  setvar $GRID_AVOID TRUE
else
  setvar $GRID_AVOID FALSE
end
getwordpos $USER_COMMAND_LINE $POS "scrub"
if ($POS > 0)
  setvar $AUTOCLEAN TRUE
else
  setvar $AUTOCLEAN FALSE
end
getwordpos $USER_COMMAND_LINE $POS "norefurb"
if ($POS > 0)
  setvar $REFURB FALSE
else
  setvar $REFURB TRUE
end
getwordpos $USER_COMMAND_LINE $POS "bwarp"
if ($POS > 0)
  setvar $GRID_WARP "bwarp"
else
  setvar $GRID_WARP "twarp"
end
getwordpos $USER_COMMAND_LINE $POS "shield"
if ($POS > 0)
  setvar $AVOIDSHIELDEDONLY TRUE
else
  setvar $AVOIDSHIELDEDONLY FALSE
end
getwordpos $USER_COMMAND_LINE $POS "exist"
if ($POS > 0)
  setvar $GRIDEXISTINGONLY TRUE
else
  setvar $GRIDEXISTINGONLY FALSE
end

getwordpos $USER_COMMAND_LINE $POS "clear"
if ($POS > 0)
  setvar $AVOIDEDSECTORSUGRID ""
end

getwordpos $USER_COMMAND_LINE $POS "none"
if ($POS > 0)
  setvar $ULTRASAFELIMPET FALSE
  setvar $ULTRASAFEARMID FALSE
else
  getwordpos $USER_COMMAND_LINE $POS "safe"
  if ($POS > 0)
    setvar $ULTRASAFELIMPET TRUE
    setvar $ULTRASAFEARMID FALSE
  else
    setvar $ULTRASAFELIMPET TRUE
    setvar $ULTRASAFEARMID TRUE
  end
end

getwordpos $USER_COMMAND_LINE $POS "passive"
if ($POS > 0)
  setvar $PASSIVE TRUE
  setvar $AVOID TRUE
else
  setvar $PASSIVE FALSE
end


if (($STARDOCK = 0) or ($STARDOCK = ""))
  setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
  gosub :switchboard~switchboard
  halt
end
if ($ISFIGGED = "")
  setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  gosub :switchboard~switchboard
  halt
end
if ($ISARMIDED = "")
  setvar $switchboard~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
  gosub :switchboard~switchboard
  halt
end
if ($ISLIMPED = "")
  setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
  gosub :switchboard~switchboard
  halt
end
if ($PLAYER~PHOTONS > 0)
  send "'Can not run with photons on your ship.*"
  halt
end

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $switchboard~message "Must start gridder from citadel prompt.*"
  gosub :switchboard~switchboard
  halt
end

killalltriggers
gosub :CHECKAVOIDEDSECTORS
:CHECKFORTARGETS

send "q"
gosub :GETPLANETINFO
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
setvar $switchboard~message "Clearing messages for possible exit/enter later*"
gosub :switchboard~switchboard
gosub :XENTER
gosub :XENTER
gosub :XENTER
gosub :LANDONPLANETENTERCITADEL
setvar $LIMPETBEFORE $PLAYER~LIMPETS
setvar $LIMPETAFTER $LIMPETBEFORE
setvar $ARMIDBEFORE $PLAYER~ARMIDS
setvar $ARMIDAFTER $ARMIDBEFORE

setvar $switchboard~message "M()M Unlimited Gridder Powering Up!*"
gosub :switchboard~switchboard
waitfor "(?="

setvar $HOMESEC $PLAYER~CURRENT_SECTOR
:CHECKSHIP


killalltriggers
gosub :PLAYER~QUIKSTATS
send "c;q"
waitfor "Offensive Odds:"
getwordpos CURRENTLINE $POS "Offensive"
cuttext CURRENTLINE $ODDLINE $POS 99
gettext $ODDLINE $OFFODD "Odds:" ":1"
striptext $OFFODD " "
striptext $OFFODD "."
waitfor "Mine Max:"
gettext CURRENTLINE $MAXMINES "Mine Max:" "B"
striptext $MAXMINES " "
waitfor "Figs Per Attack:"
getword CURRENTLINE $FIGS 5
multiply $OFFODD $FIGS
divide $OFFODD 12
setvar $MAX_FIGS $PLAYER~FIGHTERS
gosub :PLAYER~QUIKSTATS
:RESTART
send "q"
gosub :GETPLANETINFO
send "c "
gosub :FINDALLTARGETSECTORS
gosub :ASSEMBLE_MAC
gosub :ASSEMBLE_RETURN_MAC
gosub :ASSEMBLE_ATTACK_MAC
gosub :ASSEMBLE_LAND_MAC
:SELECT_BOOMSEC
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~FIGHTERS < $MAX_FIGS)
  echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
  halt
end
setvar $LIMPETAFTER $PLAYER~LIMPETS
setvar $ARMIDAFTER $PLAYER~ARMIDS
if ($BOOMSEC > 0)
  if (($LIMPETBEFORE > $LIMPETAFTER) and ($ISLIMPED = FALSE))
    setvar $LIMPETBEFORE $PLAYER~LIMPETS
    setvar $LIMPETAFTER $LIMPETBEFORE
    setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
  elseif (($LIMPETBEFORE = $LIMPETAFTER) and ($ISLIMPED = FALSE))
    setvar $IMLIMPED TRUE
  end
  if (($ARMIDBEFORE > $ARMIDAFTER) and ($ISARMIDED = FALSE))
    setvar $ARMIDBEFORE $PLAYER~ARMIDS
    setvar $ARMIDAFTER $ARMIDBEFORE
    setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
  end
end
if ($TWARP = "No")
  goto :CALLSAVEME
end

if ($PLAYER~LIMPETS < $GRID_LIMPETS) or ($PLAYER~ARMIDS < $GRID_ARMIDS) or (($IMLIMPED = TRUE) and ($AUTOCLEAN = TRUE))
  if ($REFURB)
    gosub :ATTEMPT_REFURB
  else
    echo ANSI_12 "*You must stock up on mines before continuing." ANSI_7
    halt
  end
  gosub :PLAYER~QUIKSTATS
  setvar $LIMPETBEFORE $PLAYER~LIMPETS
  setvar $LIMPETAFTER $LIMPETBEFORE
  setvar $ARMIDBEFORE $PLAYER~ARMIDS
  setvar $ARMIDAFTER $ARMIDBEFORE
end
:CONTINUEON
getrnd $RANDOM 1 $DATABASECOUNT
getword $DATABASE $WARPTO $RANDOM
if ($WARPTO = 0)
  setvar $switchboard~message "Database Cleared - Recalculating and Restarting...*"
  gosub :switchboard~switchboard
  waiton "Message sent on sub-space"
  goto :RESTART
else
  getdistance $DISTANCE $MOVE[$WARPTO] $WARPTO
  if ($DISTANCE <= 0)
    send "^f"&$MOVE[$WARPTO]&"*"&$WARPTO&"*q"
    waiton "ENDINTERROG"
    getdistance $DISTANCE $MOVE[$WARPTO] $WARPTO
  end
end
:CLEARIT


killalltriggers
replacetext $DATABASE " "&$WARPTO&" " " "
subtract $DATABASECOUNT 1
setvar $FURBING FALSE
if ($GRID_WARP = "twarp")
  gosub :DOTWARP
elseif ($GRID_WARP = "bwarp")
  gosub :BWARP
else
  halt
end
:HITTINGSEC


killalltriggers
setvar $BOOMSEC $MOVE[$WARPTO]
getsectorparameter $BOOMSEC "FIGSEC" $ISFIGGED
getsectorparameter $BOOMSEC "MINESEC" $ISARMIDED
getsectorparameter $BOOMSEC "LIMPSEC" $ISLIMPED
if ($ISFIGGED = "")
  setvar $ISFIGGED FALSE
end
if ($ISLIMPED = "")
  setvar $ISLIMPED FALSE
end
if ($ISARMIDED = "")
  setvar $ISARMIDED FALSE
end
setvar $IMLIMPED FALSE
setvar $JUSTCHECKINGIFALIVE TRUE
gosub :PLAYER~QUIKSTATS
if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $WARPTO))
  goto :CALLSAVEME
end
if ($GRIDEXISTINGONLY)
  send $MAC&$RETURN_MAC
  setvar $JUSTCHECKINGIFALIVE TRUE
  gosub :PLAYER~QUIKSTATS
  if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
    goto :CALLSAVEME
  end
  send $LAND_MAC
  goto :SELECT_BOOMSEC
end
send "sdszh*  "
waitfor "Relative Density Scan"
waitfor "Long Range Scan"
waitfor "["&$WARPTO&"]"
getdistance $DISTANCE $WARPTO $BOOMSEC
getdistance $DISTANCEBACK $BOOMSEC $WARPTO
setvar $CONTAINSSHIELDEDPLANET FALSE
setvar $I 1
while ($I <= SECTOR.PLANETCOUNT[$BOOMSEC])
  getword SECTOR.PLANETS[$BOOMSEC][$I] $TEST 1
  if ($TEST = "<<<<")
    setvar $CONTAINSSHIELDEDPLANET TRUE
  end
  add $I 1
end
setvar $FIGOWNER SECTOR.FIGS.OWNER[$BOOMSEC]
setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[$BOOMSEC]
getword $FIGOWNER $ALIENCHECK 1
lowercase $ALIENCHECK
setvar $MINEOWNER SECTOR.MINES.OWNER[$BOOMSEC]
setvar $MINECOUNT SECTOR.MINES.QUANTITY[$BOOMSEC]
if (((($AVOIDSHIELDEDONLY = TRUE) and ($CONTAINSSHIELDEDPLANET = FALSE)) or (SECTOR.PLANETCOUNT[$BOOMSEC] <= 0)) and (((SECTOR.TRADERCOUNT[$BOOMSEC] <= 0) and ((($DISTANCE = 1) and ((($BOOMSEC > 10) and ((($BOOMSEC <> STARDOCK) and ((($ATTACKRETREAT = TRUE) and (($DISTANCEBACK = 1) and (SECTOR.FIGS.QUANTITY[$BOOMSEC] >= ($OFFODD * 2)))) or (SECTOR.FIGS.QUANTITY[$BOOMSEC] < ($OFFODD * 2))))))))))))
  if ($PASSIVE)
    echo "**" ANSI_14
    echo "[" ANSI_15 "Target Sector: " $BOOMSEC ANSI_14 "]*"
    echo "[" ANSI_15 "Mine Count: " $MINECOUNT ANSI_14 "]*"
    echo "[" ANSI_15 "Mine Owner: " $MINEOWNER ANSI_14 "]*"
    echo "[" ANSI_15 "Fighter Count: " $FIGCOUNT ANSI_14 "]*"
    echo "[" ANSI_15 "Fighter Owner: " $FIGOWNER ANSI_14 "]*"
    echo "**" ANSI_7
  end
  if (($PASSIVE = TRUE) and (((($MINECOUNT <= 0) or (($MINECOUNT > 0) and (($MINEOWNER <> "yours") and ($MINEOWNER <> "belong to your Corp")))) and (($FIGOWNER <> "belong to your Corp") and (($FIGOWNER <> "yours") and (($FIGOWNER <> "Rogue Mercenaries") and (($ALIENCHECK <> "the") and ($FIGOWNER <> ""))))))))
    echo "**" ANSI_14
    echo "[" ANSI_15 "Passive detection avoiding sector: " $BOOMSEC "]*"
    echo "**" ANSI_7
    send "m      " $HOMESEC "* y   y    *  *  "
    gosub :PLAYER~QUIKSTATS
    if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
      goto :CALLSAVEME
    end
    send $LAND_MAC
    setvar $AVOIDEDSECTORSUGRID $AVOIDEDSECTORSUGRID&" "&$BOOMSEC&" "
    savevar $AVOIDEDSECTORSUGRID
    goto :SELECT_BOOMSEC
  end
  if ((SECTOR.ANOMOLY[$BOOMSEC] = TRUE) and (($ISLIMPED = FALSE) and ($GRID_AVOID = TRUE)))
    send "m      " $HOMESEC "* y   y    *  *  "
    gosub :PLAYER~QUIKSTATS
    if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
      goto :CALLSAVEME
    end
    send $LAND_MAC
    setvar $AVOIDEDSECTORSUGRID $AVOIDEDSECTORSUGRID&" "&$BOOMSEC&" "
    savevar $AVOIDEDSECTORSUGRID
    setvar $switchboard~message "Probable Enemy Limpet Detected - Sector " $BOOMSEC ".*"
    gosub :switchboard~switchboard
    goto :SELECT_BOOMSEC
  end
  if ((SECTOR.ANOMOLY[$BOOMSEC] = TRUE) and ($ISLIMPED = FALSE))
    setvar $IMLIMPED TRUE
  end

  send "m"
  gosub :RETURN_TRIGGERS
  if ((SECTOR.MINES.QUANTITY[$BOOMSEC] > 0) and (($MINEOWNER <> "yours") and ($MINEOWNER <> "belong to your Corp")))
    send $BOOMSEC&$ATTACK_MAC&"* "&$MAC&$RETURN_MAC
  else
    send $BOOMSEC&$ATTACK_MAC&$MAC&$RETURN_MAC
  end
  if (($GRID_FIGS > 0) and (SECTOR.FIGS.QUANTITY[$BOOMSEC] < ($OFFODD * 2)))
    setsectorparameter $BOOMSEC "FIGSEC" TRUE
  end
  gosub :PLAYER~QUIKSTATS
  if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
    goto :CALLSAVEME
  end
  send $LAND_MAC
  setvar $OUTPUT ""
  if (SECTOR.PLANETCOUNT[$BOOMSEC] > 0)
    setvar $I 1
    while ($I <= SECTOR.PLANETCOUNT[$BOOMSEC])
      setvar $OUTPUT $OUTPUT&"    "&SECTOR.PLANETS[$BOOMSEC][$I]&#13
      add $I 1
    end
    setvar $OUTPUT "'"&#13&"WARNING - Planet(s) Detected, Not Avoided - Sector "&$BOOMSEC&#13&$OUTPUT&#13&" "&#13&" "
    send $OUTPUT
    write $GRIDDER_FILE DATE&"    "&$OUTPUT
  elseif (SECTOR.SHIPCOUNT[$BOOMSEC] > 0)
    setvar $I 1
    while ($I <= SECTOR.SHIPCOUNT[$BOOMSEC])
      setvar $OUTPUT $OUTPUT&"    "&SECTOR.SHIPS[$BOOMSEC][$I]&#13
      add $I 1
    end
    setvar $OUTPUT "'"&#13&"WARNING - Empty Ship(s) Detected, Not Avoided - Sector "&$BOOMSEC&#13&$OUTPUT&#13&" "&#13&" "
    send $OUTPUT
    write $GRIDDER_FILE DATE&"    "&$OUTPUT
  end
  goto :SELECT_BOOMSEC
else
  send "m"
  gosub :RETURN_TRIGGERS
  send $HOMESEC "* y y  *  "
  gosub :PLAYER~QUIKSTATS
  if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
    goto :CALLSAVEME
  end
  send $LAND_MAC
  setvar $AVOIDEDSECTORSUGRID $AVOIDEDSECTORSUGRID&" "&$BOOMSEC&" "
  savevar $AVOIDEDSECTORSUGRID
  setvar $OUTPUT ""
  if (SECTOR.PLANETCOUNT[$BOOMSEC] > 0)
    setvar $I 1
    while ($I <= SECTOR.PLANETCOUNT[$BOOMSEC])
      setvar $OUTPUT $OUTPUT&"    "&SECTOR.PLANETS[$BOOMSEC][$I]&#13
      add $I 1
    end
    setvar $I 1
    while ($I <= SECTOR.TRADERCOUNT[$BOOMSEC])
      setvar $OUTPUT $OUTPUT&"    "&SECTOR.TRADERS[$BOOMSEC][$I]&#13
      add $I 1
    end
    setvar $OUTPUT $OUTPUT&SECTOR.FIGS.QUANTITY[$BOOMSEC]&" figs owned by: "&SECTOR.FIGS.OWNER[$BOOMSEC]&#13
    setvar $OUTPUT "'"&#13&"WARNING - Planet(s) Detected - Sector "&$BOOMSEC&#13&$OUTPUT&#13&" "&#13&" "
  elseif (SECTOR.TRADERCOUNT[$BOOMSEC] > 0)
    setvar $I 1
    while ($I <= SECTOR.TRADERCOUNT[$BOOMSEC])
      setvar $OUTPUT $OUTPUT&"    "&SECTOR.TRADERS[$BOOMSEC][$I]&#13
      add $I 1
    end
    setvar $OUTPUT $OUTPUT&SECTOR.FIGS.QUANTITY[$BOOMSEC]&" figs owned by: "&SECTOR.FIGS.OWNER[$BOOMSEC]&#13
    setvar $OUTPUT "'"&#13&"WARNING - Trader(s) Detected - Sector "&$BOOMSEC&#13&$OUTPUT&#13&" "&#13&" "
  elseif ($DISTANCE <> 1)
    setvar $OUTPUT "'WARNING - Sector not Adj (Sector "&$BOOMSEC&")"&#13
  elseif (($BOOMSEC <= 10) or ($BOOMSEC = STARDOCK))
    setvar $OUTPUT "'WARNING - Fed Sector Adj (Sector "&$BOOMSEC&")"&#13
  elseif (SECTOR.FIGS.QUANTITY[$BOOMSEC] >= ($OFFODD * 2))
    setvar $OUTPUT "'WARNING - "&SECTOR.FIGS.QUANTITY[$BOOMSEC]&" figs owned by: "&SECTOR.FIGS.OWNER[$BOOMSEC]&" - Sector "&$BOOMSEC&#13
  else
    setvar $OUTPUT "'WARNING - Unknown Error - "&$BOOMSEC&#13
  end
  send $OUTPUT
  write $GRIDDER_FILE DATE&"    "&$OUTPUT
  goto :SELECT_BOOMSEC
end
:FINDALLTARGETSECTORS





setvar $TARGETSECTORCOUNT 1
setvar $DATABASECOUNT 0
setvar $DATABASE ""
setvar $ADJACENTDATABASE ""

echo ANSI_14 "* Loading target sectors..*" ANSI_7
setvar $PERC 0
if ($GRIDTARGETS)
  setvar $M 1
  send "^"
  while ($M < $TARGETSECTORS)
    setvar $DESTINATION $TARGETSECTORS[$M]
    getsectorparameter $DESTINATION "FIGSEC" $ISFIGGED
    if ($ISFIGGED = "")
      setvar $ISFIGGED FALSE
    end
    gosub :GETCOURSES

    getwordpos $AVOIDEDSECTORSUGRID $POS " "&$DESTINATION&" "
    striptext $DESTINATION " "
    if (($POS <= 0) and (($ISFIGGED <= 0) or ($GRIDEXISTINGONLY = TRUE)))
      setvar $I 1
      setvar $ISFOUND FALSE
      if ((SECTOR.WARPSIN[$DESTINATION][$I] > 0) and ($ISFOUND = FALSE))
        setvar $ADJINF SECTOR.WARPSIN[$DESTINATION][$I]
        getsectorparameter $ADJINF "FIGSEC" $ISFIGGED
        getsectorparameter $ADJINF "MINESEC" $ISARMIDED
        getsectorparameter $ADJINF "LIMPSEC" $ISLIMPED
        if ($ISFIGGED = "")
          setvar $ISFIGGED FALSE
        end
        if ($ISLIMPED = "")
          setvar $ISLIMPED FALSE
        end
        if ($ISARMIDED = "")
          setvar $ISARMIDED FALSE
        end


        if (($ULTRASAFELIMPET = TRUE) and ($ISLIMPED = FALSE))

        elseif (($ULTRASAFEARMID = TRUE) and ($ISARMIDED = FALSE))

        else

          getwordpos $ADJACENTDATABASE $POS " "&$DESTINATION&" "
          getwordpos $DATABASE $POS2 " "&$ADJINF&" "
          getwordpos $AVOIDEDSECTORSUGRID $POS3 " "&$ADJINF&" "
          if (($POS <= 0) and (($POS3 <= 0) and (($ADJINF > 10) and (($ADJINF <> STARDOCK) and ($ISFIGGED > 0)))))
            if (($ADJINF <> $DESTINATION) and ($POS2 <= 0))
              setvar $DATABASE $DATABASE&" "&$ADJINF&" "
              setvar $ADJACENTDATABASE $ADJACENTDATABASE&" "&$DESTINATION&" "
              setvar $MOVE[$ADJINF] $DESTINATION
              setvar $ISFOUND TRUE
              add $DATABASECOUNT 1
            end
          end
        end


        add $I 1
      end
    end
    setvar $PERCTEST (($M * 100) / SECTORS)
    if ($PERCTEST > $PERC)
      setvar $PERC (($M * 100) / SECTORS)
      echo "*"
      echo #27 "["&($PERC / 2)&"C"
      echo ANSI_14 "" ANSI_15 " " $PERC "%" #27&"[1A   "
    end
    add $M 1
  end

  send "q "

elseif ($GRIDEXISTINGONLY)
  while ($TARGETSECTORCOUNT < SECTORS)
    add $TARGETSECTORCOUNT 1
    getsectorparameter $TARGETSECTORCOUNT "FIGSEC" $ISFIGGED
    getsectorparameter $TARGETSECTORCOUNT "MINESEC" $ISARMIDED
    getsectorparameter $TARGETSECTORCOUNT "LIMPSEC" $ISLIMPED
    if ($ISFIGGED = "")
      setvar $ISFIGGED FALSE
    end
    if ($ISLIMPED = "")
      setvar $ISLIMPED FALSE
    end
    if ($ISARMIDED = "")
      setvar $ISARMIDED FALSE
    end
    getwordpos $AVOIDEDSECTORSUGRID $POS " "&$TARGETSECTORCOUNT&" "
    if (($POS <= 0) and ($ISFIGGED >= 1))
      if ($GRID_LIMPETS > 0)
        if ($ISLIMPED = FALSE)
          setvar $DATABASE $DATABASE&" "&$TARGETSECTORCOUNT&" "
          setvar $MOVE[$TARGETSECTORCOUNT] $TARGETSECTORCOUNT
          add $DATABASECOUNT 1
        end
      end
      if ($GRID_ARMIDS > 0)
        getwordpos $DATABASE $POS2 " "&$TARGETSECTORCOUNT&" "
        if (($POS2 <= 0) and ($ISARMIDED = FALSE))
          setvar $DATABASE $DATABASE&" "&$TARGETSECTORCOUNT&" "
          setvar $MOVE[$TARGETSECTORCOUNT] $TARGETSECTORCOUNT
          add $DATABASECOUNT 1
        end
      end
      if (($GRID_FIGS > 0) and (($GRID_ARMIDS <= 0) and ($GRID_LIMPETS <= 0)))
        if ($ISFIGGED >= 1)
          setvar $DATABASE $DATABASE&" "&$TARGETSECTORCOUNT&" "
          setvar $MOVE[$TARGETSECTORCOUNT] $TARGETSECTORCOUNT
          add $DATABASECOUNT 1
        end
      end
    end
    setvar $PERCTEST (($TARGETSECTORCOUNT * 100) / SECTORS)
    if ($PERCTEST > $PERC)
      setvar $PERC (($TARGETSECTORCOUNT * 100) / SECTORS)
      echo "*"
      echo #27 "["&($PERC / 2)&"C"
      echo ANSI_14 "" ANSI_15 " " $PERC "%" #27&"[1A   "
    end
  end
else
  while ($TARGETSECTORCOUNT < SECTORS)
    getwordpos $AVOIDEDSECTORSUGRID $POS " "&$TARGETSECTORCOUNT&" "
    getsectorparameter $TARGETSECTORCOUNT "FIGSEC" $ISFIGGED
    getsectorparameter $TARGETSECTORCOUNT "MINESEC" $ISARMIDED
    getsectorparameter $TARGETSECTORCOUNT "LIMPSEC" $ISLIMPED
    if ($ISFIGGED = "")
      setvar $ISFIGGED FALSE
    end
    if ($ISLIMPED = "")
      setvar $ISLIMPED FALSE
    end
    if ($ISARMIDED = "")
      setvar $ISARMIDED FALSE
    end
    if (($POS <= 0) and ($ISFIGGED >= 1))
      if (($ULTRASAFELIMPET = TRUE) and ($ISLIMPED = FALSE))

      elseif (($ULTRASAFEARMID = TRUE) and ($ISARMIDED = FALSE))

      else
        setvar $I 1
        setvar $ISFOUND FALSE
        while ((SECTOR.WARPS[$TARGETSECTORCOUNT][$I] > 0) and ($ISFOUND = FALSE))
          setvar $ADJINF SECTOR.WARPS[$TARGETSECTORCOUNT][$I]
          getsectorparameter $ADJINF "FIGSEC" $ISFIGGED
          if ($ISFIGGED = "")
            setvar $ISFIGGED FALSE
          end
          getwordpos $ADJACENTDATABASE $POS " "&$ADJINF&" "
          getwordpos $DATABASE $POS2 " "&$TARGETSECTORCOUNT&" "
          getwordpos $AVOIDEDSECTORSUGRID $POS3 " "&$ADJINF&" "
          if (($POS <= 0) and (($POS3 <= 0) and (($ADJINF > 10) and (($ADJINF <> STARDOCK) and ($ISFIGGED = FALSE)))))
            if (($ADJINF <> $TARGETSECTORCOUNT) and ($POS2 <= 0))
              setvar $DATABASE $DATABASE&" "&$TARGETSECTORCOUNT&" "
              setvar $ADJACENTDATABASE $ADJACENTDATABASE&" "&$ADJINF&" "
              setvar $MOVE[$TARGETSECTORCOUNT] $ADJINF
              setvar $ISFOUND TRUE
              add $DATABASECOUNT 1
            end
          end
          add $I 1
        end
      end
    end


    setvar $PERCTEST (($TARGETSECTORCOUNT * 100) / SECTORS)
    if ($PERCTEST > $PERC)
      setvar $PERC (($TARGETSECTORCOUNT * 100) / SECTORS)
      echo "*"
      echo #27 "["&($PERC / 2)&"C"
      echo ANSI_14 "" ANSI_15 " " $PERC "%" #27&"[1A   "
    end
    add $TARGETSECTORCOUNT 1

  end
end
setvar $switchboard~message ""&$DATABASECOUNT&" target sectors found.*"
gosub :switchboard~switchboard
if ($DATABASECOUNT <= 0)
  setvar $switchboard~message "Visited every sector possible. Refresh fighters and update warp data to verify..*"
  gosub :switchboard~switchboard
  if ($REFURB)
    gosub :ATTEMPT_REFURB
    gosub :PLAYER~QUIKSTATS
    send "p "&$HOME_SECTOR&"* y "
    gosub :PLAYER~QUIKSTATS
    setvar $switchboard~message "Scrubbed at dock and pwarped home..*"
    gosub :switchboard~switchboard
  end

  halt
end
return
:ASSEMBLE_MAC



setvar $MAC ""
if ($GRIDEXISTINGONLY)
  if ($GRID_FIGS > 0)
    setvar $MAC "f "&$GRID_FIGS&"*cd"
  end
  if (($GRID_ARMIDS > 0) and ($PLAYER~ARMIDS > 0))
    setvar $MAC $MAC&"h1 z"&$GRID_ARMIDS&"*zc*"
  end
  if (($GRID_LIMPETS > 0) and ($PLAYER~LIMPETS > 0))
    setvar $MAC $MAC&"h2 z"&$GRID_LIMPETS&"*zc*"
  end
else
  if ($GRID_FIGS > 0)
    setvar $MAC "f "&$GRID_FIGS&"*cd"
  end
  if (($GRID_ARMIDS > 0) and ($PLAYER~ARMIDS > 0))
    setvar $MAC $MAC&"h1 z"&$GRID_ARMIDS&"*zc*"
  end
  if (($GRID_LIMPETS > 0) and ($PLAYER~LIMPETS > 0))
    setvar $MAC $MAC&"h2 z"&$GRID_LIMPETS&"*zc*"
  end
end
return
:ASSEMBLE_ATTACK_MAC

setvar $ATTACK_MAC "* za"&$FIGS&"* jr * "
return
:ASSEMBLE_RETURN_MAC

setvar $RETURN_MAC $HOMESEC&"* yy * * "
return
:ASSEMBLE_LAND_MAC

setvar $LAND_MAC "l j"&#8&#8&#8&#8&#8&$PLANET&"*  * j m  * * *  t * t 1* c * "

return
:RETURN_TRIGGERS


settexttrigger INCIT :INCIT "To which Sector"
settexttrigger IGD :IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :IGD "Your ship was hit by a Photon and has been disabled"
gosub :DELAYTRIGGER
pause
:INCIT
killalltriggers
return
:IGD
goto :CALLSAVEME
:LANDONPLANETENTERCITADEL


send "l " $PLANET "* c"
waiton "<Enter Citadel>"
return
:LEAVECITADELANDPLANET
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return
:CHECKAVOIDEDSECTORS
gosub :SECTOR~GETAVOIDS
setvar $AVOID_I 0
while ($AVOID_I < $SECTOR~AVOIDCOUNT)
  add $AVOID_I 1
  setvar $AVOIDEDSECTORSUGRID $AVOIDEDSECTORSUGRID&" "&$SECTOR~AVOIDS[$AVOID_I]&" "
end
return
:DELAYTRIGGER


setdelaytrigger DELAYUNTILSAVEME :CALLSAVEME 5000
return
:XENTER

send "q y * t* * *" $PASSWORD "*    *    *       za"&$FIGS&"*   z*   f z 1*  z c d *  "
return
:GETCOURSES




killalltriggers
setvar $ORIGINALDESTINATION $DESTINATION
setvar $PLAYER~STARTING_POINT $PLAYER~CURRENT_SECTOR
setvar $PLAYER~DESTINATION $DESTINATION
gosub :PLAYER~GETCOURSE
setvar $COURSELENGTH $PLAYER~COURSELENGTH
setvar $INDEX 1
while ($INDEX <= $COURSELENGTH)
  if (($FIGHTER_GRID[$PLAYER~COURSE[$INDEX]] <= 0) and ($PLAYER~COURSE[$INDEX] <> $ORIGINALDESTINATION))
    setvar $DESTINATION $PLAYER~COURSE[$INDEX]
  elseif ($PLAYER~COURSE[$INDEX] <> $ORIGINALDESTINATION)
    setvar $DESTINATION $ORIGINALDESTINATION
  end
  add $INDEX 1
end
:NOPATH



killalltriggers
return
:GETPLANETINFO
gosub :PLANET~GETPLANETINFO
setvar $PLANET $PLANET~PLANET
setvar $PLAYER~CURRENT_SECTOR $PLANET~CURRENT_SECTOR
setvar $PLANET_FUEL $PLANET~PLANET_FUEL
setvar $PLANET_FUEL_MAX $PLANET~PLANET_FUEL_MAX
setvar $PLANET_ORGANICS $PLANET~PLANET_ORGANICS
setvar $PLANET_ORGANICS_MAX $PLANET~PLANET_ORGANICS_MAX
setvar $PLANET_EQUIPMENT $PLANET~PLANET_EQUIPMENT
setvar $PLANET_EQUIPMENT_MAX $PLANET~PLANET_EQUIPMENT_MAX
setvar $PLANET_FIGHTERS $PLANET~PLANET_FIGHTERS
setvar $PLANET_FIGHTERS_MAX $PLANET~PLANET_FIGHTERS_MAX
setvar $CITADEL $PLANET~CITADEL
setvar $CITADEL_CREDITS $PLANET~CITADEL_CREDITS
setvar $ATMOSPHERE_CANNON $PLANET~ATMOSPHERE_CANNON
setvar $SECTOR_CANNON $PLANET~SECTOR_CANNON
return
killtrigger CITADELSTART
killtrigger CANNON

return
:ATTEMPTREFURB
:ATTEMPT_REFURB



setvar $LIMPETCASHNEEDED ((($MAXMINES - $PLAYER~LIMPETS) * $LIMPET_COST) + $LIMPET_REMOVAL_COST)
setvar $ARMIDCASHNEEDED (($MAXMINES - $PLAYER~ARMIDS) * $ARMID_COST)
setvar $CASHNEEDED ($LIMPETCASHNEEDED + $ARMIDCASHNEEDED)
setvar $FURBING TRUE
if ($CASHNEEDED > $PLAYER~CREDITS)
  send "D"
  waiton "Citadel treasury contains "
  getword CURRENTLINE $CITADELCASH 4
  striptext $CITADELCASH ","
  if ($CITADELCASH < $CASHNEEDED)
    setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
    gosub :switchboard~switchboard
    halt
  end
  send "t f "&($CASHNEEDED - $PLAYER~CREDITS)&"* "
end

setvar $I 1
setvar $START_SECTOR $PLAYER~CURRENT_SECTOR
setvar $WEAREADJDOCK FALSE
while ($I <= SECTOR.WARPCOUNT[$START_SECTOR])
  setvar $ADJ_START SECTOR.WARPS[$START_SECTOR][$I]
  if ($ADJ_START = $STARDOCK)
    setvar $WEAREADJDOCK TRUE
  end
  add $I 1
end

if (($PLAYER~ALIGNMENT < 1000) and ($WEAREADJDOCK = FALSE))
  setvar $RED_ADJ 0
  gosub :FINDJUMPSECTOR
  if ($RED_ADJ <> 0)
    setvar $switchboard~message "Jump Sector Found - Using Sector "&$RED_ADJ&"**"
    gosub :switchboard~switchboard
  else
    waitfor "Command [TL="
    setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
    gosub :switchboard~switchboard
    halt
  end
end

if ($PLAYER~ALIGNMENT >= 1000)
  if ($WEAREADJDOCK)
    send "^F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  else
    send "^F"&$START_SECTOR&"*"&$STARDOCK&"*F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  end
else
  if ($WEAREADJDOCK)
    send "^F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  else
    send "^F"&$START_SECTOR&"*"&$RED_ADJ&"*F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  end
end
settextlinetrigger NOJOY :NOJOY "*** Error - No route within"
settexttrigger CONT :CONT "(?="
pause
:NOJOY

killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
halt
:CONT
killalltriggers
setdelaytrigger LATENCY_DELAY :LATENCY_DELAY 500
pause
:LATENCY_DELAY


echo "**"&ANSI_14&"Please Stand By"&ANSI_15&" - Calculating Distances...**"
if (($PLAYER~ALIGNMENT >= 1000) or $WEAREADJDOCK)
  getdistance $DIST1 $START_SECTOR $STARDOCK
else
  getdistance $DIST1 $START_SECTOR $RED_ADJ
end

if ($DIST1 <= 0)
  setvar $switchboard~message $TAGLINEB&" - Insufficient Warp Data Plotting Course to Dock**"
  gosub :switchboard~switchboard
  halt
end

getdistance $DIST2 $STARDOCK $START_SECTOR
if ($DIST2 <= 0)
  setvar $switchboard~message $TAGLINEB&" - Insufficient Warp Data Plotting Return Course From Dock**"
  gosub :switchboard~switchboard
  halt
end

setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

if ($PLAYER~ORE_HOLDS < $ORE_REQ)
  setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
  gosub :switchboard~switchboard
  halt
end

if ($PLAYER~TWARP_TYPE = "No")
  setvar $switchboard~message "Must Have Twarp 1 or 2**"
  gosub :switchboard~switchboard
  halt
end

if ($UNLIMITEDGAME = 0)
  gosub :TURNSREQUIRED
  if ($TURNSREQUIRED > $PLAYER~TURNS)
    setvar $switchboard~message "Not Enough Turns. "&ANSI_12&$TURNSREQUIRED&ANSI_15&", Required**"
    gosub :switchboard~switchboard
    halt
  elseif ($TURNSREQUIRED <= $PLAYER~TURNS)
    setvar $TMP ($PLAYER~TURNS - $TURNSREQUIRED)
    if ($TMP <= $BOT_TURN_LIMIT)
      setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$BOT_TURN_LIMIT&" Turns!**"
      gosub :switchboard~switchboard
      halt
    end
  end
end

send " C R "&$STARDOCK&"*Q "
settextlinetrigger ITSALIVE :ITSALIVE "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOSOUPFORME :NOSOUPFORME "I have no information about a port in that sector"
pause
:NOSOUPFORME
killalltriggers
setvar $switchboard~message $TAGLINEB&" - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
halt
:ITSALIVE
killalltriggers
waitfor "(?="
setvar $MSG ""
if (($PLAYER~ALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
  setvar $WARPTO $STARDOCK
  gosub :DOTWARP
elseif (($WEAREADJDOCK = FALSE) and ($RED_ADJ <> 0))
  setvar $WARPTO $RED_ADJ
  gosub :DOTWARP
else
  send " m "&$STARDOCK&"*  *  P  S G Y G Q "
end
if ($MSG = "")
  waitfor "You leave the Galactic Bank."
else
  setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
  gosub :switchboard~switchboard
  halt
end
gosub :PLAYER~QUIKSTATS

setvar $_LIMPS "Max"
setvar $_MINES "Max"
gosub :DOPURCHASES
send "Q Q Q Q Z N M "&$START_SECTOR&"* Y  Y  Y  * L Z"&#8&$PLANET&"* p  s  s * * c *"
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR = $STARDOCK)
  setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
  gosub :switchboard~switchboard
  halt
end
send "q tnt1* c "


return
:DOTWARP

setvar $MSG ""
if ($WARPTO > 0)
  send "q q ** mz"&$WARPTO " * "
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
  settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
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
  send "l "&#8&$PLANET "*c"
  setsectorparameter $WARPTO "FIGSEC" FALSE
  setvar $TEMP " "&$WARPTO&" "
  replacetext $DATABASE $TEMP " "
  subtract $DATABASECOUNT 1
  goto :SELECT_BOOMSEC
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
  if ($PLAYER~ALIGNMENT >= 1000)
    if ($FURBING)
      setvar $STR "y * * p s g y g q "
    else
      setvar $STR "y * *  "
    end
    send $STR
  else
    if ($FURBING)
      setvar $STR "y  *  *  m "&$STARDOCK&" *  *  p s g y g q "
    else
      setvar $STR "y * *  "
    end
    send $STR
  end
  :TWARPDONE
  if ($MSG <> "")
    setvar $switchboard~message "Twarp Error - "&$MSG&"**"
    gosub :switchboard~switchboard
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
setvar $FIGHTER_GRID[$WARPTO] 0
goto :SELECT_BOOMSEC
:GO5

killalltriggers
send "y z * "
return
:FINDJUMPSECTOR

setvar $I 1
setvar $RED_ADJ 0
send "qq*"
while (SECTOR.WARPSIN[$STARDOCK][$I] > 0)
  setvar $RED_ADJ SECTOR.WARPSIN[$STARDOCK][$I]
  send "m "&$RED_ADJ&"* y"
  settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
  settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
  settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
  settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
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

    add $TURNSREQUIRED_TEMP 2


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


send "q q q q * '"&$BOT_NAME&" call*"
halt
:DOPURCHASES

send "h "
waitfor "<Hardware Emporium>"

if ($_LIMPS <> "")
  send "L "
  waitfor "How many mines do you want"
  if ($_LIMPS = "Max")
    gettext CURRENTLINE $BUY "(Max" ")"
    send $BUY&"* "
  else
    send $BUY $_LIMPS&"* "
  end
  waitfor "<Hardware Emporium>"
end

if ($_MINES <> "")
  send "M "
  setvar $BUY 0
  waitfor "How many mines do you"
  if ($_MINES = "Max")
    gettext CURRENTLINE $BUY "(Max" ")"
    send $BUY&"* "
  else
    send $_MINES&"* "
  end
  waitfor "<Hardware Emporium>"
end
return
include "source\include\switchboard.ts"
include "source\include\sector"
