# COMBAT.TS -- Combat related functions and subroutines.
#
# Exposed routines:
#
# :combat~fastattack - The routine that will calculate and send an attack string for the current combat situation.
# :combat~fastcapture - The routine that will calculate and send an attack string for the current capture situation.
# :combat~fastcitadelattack - The routine that will calculate and send an attack string for attacking a citadel.
# :combat~holokill - The routine that will calculate and send an attack string for a holocapture kill.
# :combat~holocapture - The routine that will calculate and send an attack string for a holocapture.
# :combat~passiveholocap - The routine that will calculate and send an attack string for a passive holocapture.
# :combat~passiveholokill - The routine that will calculate and send an attack string for a passive holocapture kill.
# :combat~callsaveme - Call saveme to get picked up by a corpie.
#
# Exposed variables:
#
# $combat~attackstring - The string that will be sent to attack.
# $combat~defender - Set to TRUE if the bot is attacking a defender.  Used for capture calculations.

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~FASTATTACK
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $TARGETSTRING "a"
setvar $PLAYER~ISFOUND FALSE
setvar $TARGETSHOTGUN "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP~SHIP_MAX_ATTACK&"* * "

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $FEDSPACE FALSE
if (($PLAYER~CURRENT_SECTOR = STARDOCK) or ($PLAYER~CURRENT_SECTOR <= 10))
  setvar $FEDSPACE TRUE
elseif ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
  setvar $FEDSPACE TRUE
end
if ($PLAYER~FIGHTERS <= 0)
  gosub :PLAYER~QUIKSTATS
  if (($PLAYER~CURRENT_SECTOR = 1) or (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK))
    if ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
      send "P  S G Y G Q s p"
    else
      send "p ty"
    end
    waiton "B  Fighters        :"
    getword CURRENTLINE $FIGSTOBUY 8
    waiton "C  Shield Points   :"
    getword CURRENTLINE $SHIELDSTOBUY 9

    send "b " $FIGSTOBUY "* c " $SHIELDSTOBUY "* "

    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~FIGHTERS <= 0)
      setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no fighters even after refurb.  Hiding out on dock.*"&ANSI_7
      gosub :PLAYER~ECHO
    end
    if ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
      send " q q q "
    else
      send " q "
    end
    return
  else
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~FIGHTERS <= 0)
      setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no fighters.*"&ANSI_7
      gosub :PLAYER~ECHO
      return
    end
  end
end
if ($FEDSPACE <> TRUE)
  getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
  if ($BEACONPOS > 0)
    setvar $TARGETSTRING $TARGETSTRING&"*"
  end
end
if (($SECTOR~EMPTYSHIPCOUNT + ($SECTOR~FAKETRADERCOUNT + $SECTOR~REALTRADERCOUNT)) > 0)
  setvar $I 0
  while ($I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $TARGETSTRING $TARGETSTRING&"* "
    add $I 1
  end
  setvar $C 1
  while (($C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))

    if ($PLAYER~TRADERS[$C][1] = $PLAYER~CORP)
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($FEDSPACE = TRUE) and ($PLAYER~TRADERS[$C][2] = TRUE))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGSHIP <> FALSE) and ($PLAYER~TRADERS[$C][3] <> TRUE))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    else
      setvar $ENEMY_FIGHTERS $PLAYER~TRADERS[$C][4]
      setvar $ENEMY_NAME $PLAYER~TRADERS[$C]
      if ($SECTOR~SAFE_ATTACK_ONLY <> TRUE)
        setvar $PLAYER~ISFOUND TRUE
      else

        setvar $TOO_MANY_FIGHTERS (($SHIP~SHIP_OFFENSIVE_ODDS * $PLAYER~FIGHTERS) < (($ENEMY_FIGHTERS + $TARGET_SHIELDS) * $TARGET_DEFENSE_ODDS))
        if (($SECTOR~SAFE_ATTACK_ONLY = TRUE) and ($TOO_MANY_FIGHTERS <> TRUE))
          setvar $PLAYER~ISFOUND TRUE
        else
          echo "*Safe mode active - Too many fighters on " $ENEMY_NAME ".  Can't attack them and survive.*"
        end
      end
      if ($PLAYER~ISFOUND = TRUE)
        setvar $TARGETSTRING $TARGETSTRING&"zy z"
      end
    end
    add $C 1
  end
else

  setvar $SWITCHBOARD~MESSAGE "*You have no targets.*"
  gosub :PLAYER~ECHO

  goto :STOPPINGPOINT
end
if ($PLAYER~ISFOUND = TRUE)
  setvar $COMBAT~ATTACKSTRING ""
  if (($PLAYER~GENESIS > 0) and ($COMBAT~DEFENDER = TRUE))
    setvar $COMBAT~ATTACKSTRING "u y n.* c "
    setvar $PLAYER~GENESIS ($PLAYER~GENESIS - 1)
  end

  setvar $STARTING_FIGHTERS $PLAYER~FIGHTERS
  while ($PLAYER~FIGHTERS > 0)
    if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSHOTGUN&$PLAYER~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$PLAYER~REFURBSTRING
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$PLAYER~REFURBSTRING
        end
      end
      setvar $PLAYER~FIGHTERS 0
    else
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSHOTGUN&$PLAYER~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$PLAYER~REFURBSTRING
          setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $SHIP~SHIP_MAX_ATTACK)
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$PLAYER~REFURBSTRING
        end
      end
      setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $SHIP~SHIP_MAX_ATTACK)
    end
  end
else

  setvar $SWITCHBOARD~MESSAGE "*You have no valid targets.*"
  gosub :PLAYER~ECHO

  goto :STOPPINGPOINT
end
if (($SECTOR~PASSIVE = TRUE) and ($STARTING_FIGHTERS < $ENEMY_FIGHTERS))
  setvar $PLAYER~FIGHTERS $STARTING_FIGHTERS
  setvar $SWITCHBOARD~MESSAGE "*Enemy has too many fighters to attack auto ("&$ENEMY_FIGHTERS&").*"
  gosub :PLAYER~ECHO
else
  send $COMBAT~ATTACKSTRING&"* "
end
:STOPPINGPOINT
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~FASTCAPTURE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~ISFOUND FALSE
setvar $TARGETISALIEN FALSE
setvar $STILLSHIELDS FALSE
setvar $SHIP_FIGHTERS 0

loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~SHIP_OFFENSIVE_ODDS

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $FEDSPACE FALSE
if ((CURRENTSECTOR = STARDOCK) or (CURRENTSECTOR <= 10))
  setvar $FEDSPACE TRUE
elseif (CURRENTSECTOR = $MAP~STARDOCK)
  setvar $FEDSPACE TRUE
end
if (($PLAYER~ONETAP = TRUE) or ($PLAYER~SLOWMO = TRUE))
  setvar $REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * j * c "
else
  setvar $REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * j q * "
end
:CHECKINGFIGS
if ($PLAYER~FIGHTERS <= 0)
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~FIGHTERS <= 0)
    setvar $SWITCHBOARD~MESSAGE "No fighters on ship.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :CAPSTOPPINGPOINT
  else
    goto :CHECKINGFIGS
  end
end
setvar $TARGETSTRING "a "

if (($SECTOR~REALTRADERCOUNT > $SECTOR~CORPIECOUNT) and (($PLAYER~ONLYALIENS <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  if ($FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($BEACONPOS > 0)
      setvar $TARGETSTRING $TARGETSTRING&"*"
    end
  end
  setvar $I 0
  while ($I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $TARGETSTRING $TARGETSTRING&"* "
    add $I 1
  end
  setvar $C 1
  while (($C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))

    if (($FEDSPACE = TRUE) and ($PLAYER~TRADERS[$C][2] = TRUE))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TRADERS[$C][1] = $PLAYER~CORP) or ($PLAYER~TRADERS[$C][1] = 100000))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGCORP = TRUE) and ($PLAYER~TRADERS[$C][1] <> $TARGET))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGPERSON = TRUE) and ($PLAYER~TRADERS[$C] <> $TARGET))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $TARGETSTRING $TARGETSTRING&"zy z"
    end
    add $C 1

  end
end
if ((($SECTOR~FAKETRADERCOUNT > 0) and ($PLAYER~CAPPINGALIENS = TRUE)) and (($PLAYER~ISFOUND <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  setvar $TARGETSTRING "a "
  if ($FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($BEACONPOS > 0)
      setvar $TARGETSTRING $TARGETSTRING&"*"
    end
  end
  setvar $A 1
  while (($A <= $SECTOR~FAKETRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    getwordpos $PLAYER~FAKETRADERS[$A] $POS "Zyrain"
    getwordpos $PLAYER~FAKETRADERS[$A] $POS2 "Clausewitz"
    getwordpos $PLAYER~FAKETRADERS[$A] $POS3 "Nelson"
    getwordpos $PLAYER~FAKETRADERS[$A] $POS4 "Wilson"
    if (($POS <= 0) and (($POS2 <= 0) and (($POS3 <= 0) and ($POS4 <= 0))))
      setvar $I 0
      setvar $PLAYER~ISFOUND TRUE
      setvar $TARGETISALIEN TRUE
      setvar $TARGETSTRING $TARGETSTRING&"zy z"
    else
      setvar $TARGETSTRING $TARGETSTRING&"* "
    end
    add $A 1
  end
end


if (($PLAYER~ISFOUND = FALSE) and (($SECTOR~EMPTYSHIPCOUNT > 0) and ($FEDSPACE <> TRUE)))





  setvar $TARGETSTRING "a "
  if ($FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($BEACONPOS > 0)
      setvar $TARGETSTRING $TARGETSTRING&"*"
    end
  end
  if ($FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($BEACONPOS > 0)
      setvar $TARGETSTRING $TARGETSTRING&"*"
    end
  end
  setvar $C 1
  setvar $PLAYER~ISFOUND FALSE
  while (($C <= $SECTOR~EMPTYSHIPCOUNT) and (($PLAYER~ISFOUND = FALSE) and ($FEDSPACE <> TRUE)))
    if (($PLAYER~EMPTYSHIPS[$C] = $PLAYER~CORP) or ($PLAYER~EMPTYSHIPS[$C] = $PLAYER~TRADER_NAME))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $TARGETSTRING $TARGETSTRING&"zy z"
    end
    add $C 1
  end
end
if ($PLAYER~ISFOUND = FALSE)
  if ($PLAYER~ONETAP = TRUE)
    setvar $SWITCHBOARD~MESSAGE "No Targets - One Tap Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE "*You have no targets.*"
  gosub :PLAYER~ECHO
  goto :CAPSTOPPINGPOINT
else
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "q q * "
  end
  setvar $COMBAT~ATTACKSTRING ""
  :COMBAT~CAP_SHIP

  setvar $UNMANNED FALSE
  setvar $OWN_ODDS $SHIP~SHIP_OFFENSIVE_ODDS
  setvar $CAP_POINTS 0
  setvar $MAX_FIGS 0
  setvar $CAP_SHIELD_POINTS 0
  setvar $SHIP_FIGHTERS 0
  setvar $PLAYER~LASTTARGET ""
  setvar $FIRSTLOOP TRUE
  while ($PLAYER~FIGHTERS > 0)
    killalltriggers
    setvar $STILLSHIELDS FALSE
    setvar $ISSAMETARGET FALSE
    :CGOAHEAD
    killtrigger CHECKCAPTARGET
    settexttrigger FOUNDCAPTARGET :FOUNDCAPTARGET "(Y/N) [N]? Y"
    settexttrigger CHECKCAPTARGET :CHECKCAPTARGET "Yes"
    settextlinetrigger NOCTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    send $TARGETSTRING
    pause
    pause
    :CHECKCAPTARGET
    getwordpos CURRENTANSILINE $POS "36mYes"
    if ($POS > 0)
      goto :FOUNDCAPTARGET

    else
      settexttrigger CHECKCAPTARGET :CHECKCAPTARGET "Yes"
      pause
      pause
    end
    :FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger FOUNDCAPTARGET
    killtrigger CHECKCAPTARGET
    killtrigger WRONGTARGET
    setvar $CAP_SHIP_INFO CURRENTLINE
    getwordpos $CAP_SHIP_INFO $TARGETPOS " ["&$PLAYER~CORP&"]'s unmanned "
    if ($TARGETPOS > 0)
      goto :NOCAPPINGTARGETS
    end
    setvar $THISTARGET CURRENTANSILINE
    getword $CAP_SHIP_INFO $ATTACK_PROMPT 1

    if ($ATTACK_PROMPT <> "Attack")
      killalltriggers
      return
    end
    getwordpos $THISTARGET $POS "[0;33m([1;36m"
    cuttext $THISTARGET $THISTARGET 1 $POS
    if ($POS > 0)
      setvar $THISTARGET $CAP_SHIP_INFO
      setvar $TEMP $THISTARGET
      getwordpos $TEMP $POS " ("

      setvar $END_OF_LINE_POS 0
      while ($POS > 0)
        setvar $TARGETPOS $POS
        cuttext $TEMP $POSSIBLETARGET 1 $POS
        replacetext $TEMP $POSSIBLETARGET ""
        getwordpos $TEMP $POS " ("
        if ($POS > 0)
          add $END_OF_LINE_POS ($TARGETPOS + 1)
        end
      end
      if ($END_OF_LINE_POS <= 0)

        getwordpos $THISTARGET $END_OF_LINE_POS " (Y"
      end


      cuttext $THISTARGET $THISTARGET 1 $END_OF_LINE_POS
    end



    if (($THISTARGET = $PLAYER~LASTTARGET) and ($FIRSTLOOP <> TRUE))
      setvar $ISSAMETARGET TRUE
      getwordpos $THISTARGET $OURSHIPPOS " ["&$PLAYER~CORP&"]'s unmanned "
      if ($OURSHIPPOS > 0)

        setvar $ISSAMETARGET FALSE
      end
    elseif ($PLAYER~LASTTARGET = "")
      setvar $PLAYER~LASTTARGET $THISTARGET
      setvar $FIRSTLOOP FALSE
    else
      goto :NOCAPPINGTARGETS
    end
    if ($ISSAMETARGET)
      goto :SEND_ATTACK
    end
    :SHIP_TYPE
    setvar $TYPE_COUNT 0
    setvar $IS_SHIP 0
    if ($SHIP~SHIPCOUNTER <= 0)
      setvar $SWITCHBOARD~MESSAGE "ERROR with capture.  No ship data loaded.  Look into loadshipinfo not being called.*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
    while ($TYPE_COUNT < $SHIP~SHIPCOUNTER)
      add $TYPE_COUNT 1
      getwordpos $CAP_SHIP_INFO $IS_SHIP $SHIP~SHIPLIST[$TYPE_COUNT]
      getwordpos $CAP_SHIP_INFO $UNMAN "'s unmanned "
      getwordpos $CAP_SHIP_INFO $UNMAN2 "s' unmanned "
      if (($UNMAN > 0) or ($UNMAN2 > 0))
        setvar $UNMANNED TRUE

      else

        setvar $UNMANNED FALSE
      end
      if (($IS_SHIP > 0) and ($SHIP~SHIPLIST[$TYPE_COUNT] <> 0))
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$TYPE_COUNT]] $PLAYER~SHIELDS 1
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$TYPE_COUNT]] $DEFODDS 2
        goto :SEND_ATTACK
      end
    end

    echo "*Unknown ship type, cannot calculate attack.  I'm going to guess. ["&$CAP_SHIP_INFO&"]"
    setvar $SHIELDPOINTS 16000
    setvar $DEFODDS 5
    :SEND_ATTACK
    killtrigger FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger COMBAT
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger NOTARGET2
    killtrigger NOCOMBAT
    killtrigger THEYATTACKED
    killtrigger WRONGTARGET
    gettext $CAP_SHIP_INFO $CAP_INFO $SHIP~SHIPLIST[$TYPE_COUNT] "(Y/N)"

    if ($CAP_INFO <> "")

      gettext $CAP_INFO $SHIP_FIGHTERS " (" ")"
    else
      gettext $CAP_SHIP_INFO $SHIP_FIGHTERS " (" ") (Y/N)"
    end
    gettext $SHIP_FIGHTERS&"ENDOFLINE" $SHIP_FIGHTERS "-" "ENDOFLINE"
    striptext $SHIP_FIGHTERS ","
    setvar $STILLSHIELDS FALSE
    setvar $SHIP_SHIELD_PERCENT 0
    setvar $SHIELDPOINTS 0
    setvar $SHIELDPERC 0
    settextlinetrigger COMBAT :COMBAT_SCAN "Combat scanners show enemy shields at"
    settexttrigger NOCOMBAT :CAP_IT "How many fighters do you wish to use"
    settextlinetrigger NOTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    settextlinetrigger NOTARGET2 :NOCAPPINGTARGETS "'s unmanned"
    pause
    pause
    
    :COMBAT_SCAN
    getword CURRENTLINE $SHIELDPERC 7
    striptext $SHIELDPERC "%"
    setvar $SHIELDPOINTS (($PLAYER~SHIELDS * $SHIELDPERC) / 100)
    setvar $STILLSHIELDS TRUE
    pause
    pause
    :THEYATTACKED
    getwordpos CURRENTLINE $POS " The Interdictor Generator on "
    if ($POS > 0)
      settextlinetrigger THEYATTACKED :THEYATTACKED "Shipboard Computers "
      pause
    end
    setvar $SWITCHBOARD~MESSAGE "*They attacked me, switching to 1 fighter attacks.*"
    gosub :PLAYER~ECHO
    setvar $SHIP_FIGHTERS 1
    
    :COMBAT~CAP_IT
    killtrigger COMBAT_SCAN
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger THEYATTACKED
    getword CURRENTLINE $MAX_FIGS 11 $SHIP~SHIP_MAX_ATTACK
    striptext $MAX_FIGS ","
    striptext $MAX_FIGS ")"
    if ($SHIP_FIGHTERS = "")
      setvar $SHIP_FIGHTERS 1
    end

    setvar $CAP_POINTS (($SHIELDPOINTS + $SHIP_FIGHTERS) * $DEFODDS)

    if ((($PLAYER~DEFENDERCAPPING = TRUE) and ($UNMANNED <> TRUE)) and ($TARGETISALIEN = TRUE))
      if ($STILLSHIELDS = TRUE)
        if ($SHIP_FIGHTERS > 3500)
          setvar $CAP_POINTS (($SHIELDPOINTS / $OWN_ODDS) + ($CAP_POINTS / 100))
        else
          setvar $CAP_POINTS (($shieldPoints / $own_odds) + 1)
        end
      else
      # Changes imported from TBH version
        #if ($SHIP_FIGHTERS > 750)
        #  setvar $CAP_POINTS (($CAP_POINTS / $OWN_ODDS) - ($CAP_POINTS / 70))
        #else
          setvar $CAP_POINTS 1
        #end
      end
    else
      setvar $CAP_POINTS ($CAP_POINTS / $OWN_ODDS)
    end
    if ($UNMANNED = TRUE)
      setvar $CAP_POINTS ($CAP_POINTS / 2)
    end
    setvar $CAP_POINTS (($CAP_POINTS * 70) / 100)
    if ($CAP_POINTS <= 0)
      setvar $CAP_POINTS 1
    elseif ($CAP_POINTS > $MAX_FIGS)
      setvar $CAP_POINTS $MAX_FIGS
    end
  #echo ANSI_15&"sendattack: z"&$cap_points&"*  "
  #echo "shieldperc:["&$shieldperc&"]*"
# added from TBH version
    if ((($last_shield_percentage = $shieldperc) and ($shieldperc > 0)))
		  setvar $cap_points $cap_points+$added_attack
      setvar $added_attack $added_attack+2
      setvar $cummulative_added_attack $cummulative_added_attack+$cap_points
    else
      if (($last_shield_percentage > 0) and ($shieldperc > 0))
        setvar $shield_difference ($last_shield_percentage - $shieldperc)
        if ($shieldperc > 1)
          setvar $a_little_extra (($cummulative_added_attack/$shield_difference)/2)
          setvar $cap_points ((($cummulative_added_attack/$shield_difference) * $shieldperc)-$a_little_extra)
          setvar $cummulative_added_attack 0
        end
      else
        setvar $added_attack 2
      end
    end
    setvar $last_shield_percentage $shieldperc
    setvar $SENDATTACK "z"&$CAP_POINTS&"*  "
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      setvar $SENDATTACK $SENDATTACK&$REFURBSTRING
    elseif (($PLAYER~REFURBSTRING <> "") and ($PLAYER~REFURBSTRING <> 0))
      setvar $SENDATTACK $SENDATTACK&$PLAYER~REFURBSTRING
    end
    #echo ANSI_15&"sendattack: "&$sendAttack&"*"
    send $SENDATTACK
    if ($PLAYER~ONETAP = TRUE)
      setvar $SWITCHBOARD~MESSAGE "One tap complete.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    if ($PLAYER~SLOWMO = TRUE)
      getrnd $SLOWRND 10 25
      setvar $SLOWBREAK (($SLOWRND * $GAME~LATENCY) + 1000)
      setdelaytrigger CITCAPBREAK :CITCAPBREAK $SLOWBREAK
      pause
      :CITCAPBREAK
      killtrigger CITCAPBREAK
      return
    end
    #echo ANSI_15&"sendattack: z"&$cap_points&"*  "
    #echo "shieldperc:["&$shieldperc&"]*"
    if ($CAP_POINTS = 1)
      setvar $I 1
      setvar $BURST ""
      while ($I <= 3)
        setvar $BURST $BURST&" "&$TARGETSTRING&$SENDATTACK
        setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $CAP_POINTS)
        add $I 1
      end
      #echo ANSI_15&"burst: " & $COMBAT_BURST
      send $BURST
      setdelaytrigger LITTLESLOWER :DONELITTLESLOWER 10
      pause
      :DONELITTLESLOWER
      gosub :PLAYER~QUIKSTATS
    end
    :KEEPCAPPING
  end

end
goto :CAPSTOPPINGPOINT
:NOCAPPINGTARGETS
killtrigger NOCTARGET
killtrigger WRONGTARGET
killtrigger FOUNDCAPTARGET
killtrigger COMBAT_SCAN
killtrigger CAP_IT
killtrigger NOTARGET
killtrigger NOTARGET2
killtrigger THEYATTACKED
send "* "
:CAPSTOPPINGPOINT
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~FASTCITADELATTACK
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end
setvar $REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * "
setvar $COMBAT~ATTACKSTRING ""
setvar $TARGETSTRING "a z "
setvar $TARGETSHOTGUN "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP_MAX_ATTACK&"* * "
setvar $PLAYER~ISFOUND FALSE
if ($PLAYER~FIGHTERS > 0)
  if ($PLAYER~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($BEACONPOS > 0)
      setvar $TARGETSTRING $TARGETSTRING&"*"
    end
  end
else
  send "q m***c "
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~FIGHTERS <= 0)
    setvar $switchboard~message "Out of fighters, shutting down "&$command&".*"
    gosub :switchboard~switchboard
    setvar $ERROR TRUE
    return
  end
end

if (($SECTOR~EMPTYSHIPCOUNT + ($SECTOR~FAKETRADERCOUNT + $SECTOR~REALTRADERCOUNT)) > 0)
  setvar $I 0
  while ($I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $TARGETSTRING $TARGETSTRING&"* "
    add $I 1
  end
  setvar $C 1
  while (($C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if (($PLAYER~FEDSPACE = TRUE) and ($PLAYER~TRADERS[$C][2] = TRUE))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TRADERS[$C][1] = $PLAYER~CORP) or ($PLAYER~TRADERS[$C][1] = 100000))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGCORP = TRUE) and ($PLAYER~TRADERS[$C][1] <> $TARGET))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGPERSON = TRUE) and ($PLAYER~TRADERS[$C] <> $TARGET))
      setvar $TARGETSTRING $TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $TARGETSTRING $TARGETSTRING&"z y z"

    end
    add $C 1

  end
else
  if ($PLAYER~ONETAP = TRUE)
    setvar $SWITCHBOARD~MESSAGE "No Targets - One Tap Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no targets.*"&ANSI_7
  gosub :PLAYER~ECHO
  return
end
if ($PLAYER~ISFOUND = TRUE)
  setvar $PLAYER~THISKILLTARGET ""
  setvar $PLAYER~LASTKILLTARGET ""
  if ($PLAYER~SMART)
    setvar $COMBAT~ATTACKSTRING ""
    send "q "
    setvar $COUNT 8
    while ($COUNT > 0)
      if ($PLAYER~SHOTGUN)
        send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSHOTGUN&$REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$REFURBSTRING
        else
          send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$REFURBSTRING
        end
      end
      settexttrigger FOUNDKILLTARGET :FOUNDKILLTARGET "(Y/N) [N]? Y"
      settextlinetrigger NOKTARGET :NOKILLTARGETS "Do you want instructions (Y/N) [N]?"
      pause

      :FOUNDKILLTARGET
      killalltriggers
      setvar $KILL_SHIP_INFO CURRENTLINE
      setvar $PLAYER~THISKILLTARGET CURRENTANSILINE
      getwordpos $PLAYER~THISKILLTARGET $POS "[0;33m([1;36m"
      cuttext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET 1 $POS
      getwordpos $PLAYER~THISKILLTARGET $POS "'s "
      while ($POS > 0)
        cuttext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET ($POS + 3) 9999
        getwordpos $PLAYER~THISKILLTARGET $POS "'s "
      end
      gettext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET #27&"[0m"&#27 #27&"["
      gettext $PLAYER~THISKILLTARGET&"/\ENDOFSHIPTAG/\" $PLAYER~THISKILLTARGET "m" "/\ENDOFSHIPTAG/\"
      getwordpos $PLAYER~TRADERS[($C - 1)][1] $POS $PLAYER~THISKILLTARGET
      if (($PLAYER~LASTKILLTARGET <> "") and ($PLAYER~THISKILLTARGET <> $PLAYER~LASTKILLTARGET))
        setvar $SWITCHBOARD~MESSAGE "*Target has changed, time to rescan..*"
        gosub :PLAYER~ECHO
        send " c "
        goto :DONEKILL
      end
      setvar $PLAYER~LASTKILLTARGET $PLAYER~THISKILLTARGET

      :NOKILLTARGETS
      killalltriggers
      subtract $COUNT 1
    end
    send " c "
  else
    setvar $COMBAT~ATTACKSTRING ""
    if ($PLAYER~ONETAP = TRUE)
      setvar $COUNT 1
    elseif ($PLAYER~SLOWMO = TRUE)
      setvar $COUNT 2
    else
      setvar $COUNT 8
    end
    while ($COUNT > 0)
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSHOTGUN&$REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$REFURBSTRING
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$REFURBSTRING
        end
      end
      subtract $COUNT 1
    end
    send " q "&$COMBAT~ATTACKSTRING&" c "
    if ($PLAYER~ONETAP = TRUE)
      setvar $SWITCHBOARD~MESSAGE "One Tap Complete.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    if ($PLAYER~SLOWMO = TRUE)
      getrnd $SLOWRND 10 25
      setvar $SLOWBREAK (($SLOWRND * $GAME~LATENCY) + 1000)
      setdelaytrigger CITKILLBREAK :CITKILLBREAK $SLOWBREAK
      pause
      :CITKILLBREAK
      killtrigger CITKILLBREAK
      return
    end
    if ($PLAYER~UNLOADER = TRUE)
      settextlinetrigger UNLOADERWAIT :UNLOADERWAIT "@unloaddone"
      pause
      :UNLOADERWAIT
      killtrigger UNLOADERWAIT

      setvar $SLOWBREAK 400
      setdelaytrigger UNLOADERBREAK :UNLOADERBREAK $SLOWBREAK
      pause
      :UNLOADERBREAK
      killtrigger UNLOADERBREAK
      return
    end
  end
else
  if ($PLAYER~ONETAP = TRUE)
    setvar $SWITCHBOARD~MESSAGE "No Targets - One Tap Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no valid targets.*"&ANSI_7
  gosub :PLAYER~ECHO
  return
end
:DONEKILL
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~HOLOCAP
setvar $HOLOCAPTURE TRUE
:COMBAT~HOLOKILL
:COMBAT~HOLO_KILL
:COMBAT~HOLO_KILL_KILL_CHECK
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $ERROR FALSE
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $TOO_MANY_FIGHTERS ($SHIP~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK)
divide $TOO_MANY_FIGHTERS 12
settexttrigger NOSCAN1 :HOLO_KILL_NOSCANNER "Handle which mine type, 1 Armid or 2 Limpet"
settextlinetrigger NOSCAN2 :HOLO_KILL_NOSCANNER "You don't have a long range scanner."
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send " q q * sh"
  setvar $PLAYER~CIT TRUE
else
  send " sh"
end
waiton "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
gosub :SECTOR~GETAUTOSECTORDATA
goto :HOLO_KILL_SCANDONE

:HOLO_KILL_NOSCANNER
killalltriggers
setvar $SWITCHBOARD~MESSAGE "You don't have a HoloScanner!*"
if ($PLAYER~CIT)
  send "*  l "&$PLANET~PLANET&"* j c * "
else
  send "* "
end
setvar $ERROR TRUE
return

:HOLO_KILL_SCANDONE
getword CURRENTLINE $CHECK 1
if ($PLAYER~CIT)
  send "*  l "&$PLANET~PLANET&"* j c * "
else
  send "* "
end

:HOLO_KILL_GET_PROMPT
:HOLO_KILL_GET_CURRENT_SECTOR
setvar $HKILL_START_SECTOR $SECTOR~STARTING_SECTOR
setvar $PLAYER~CURRENT_SECTOR $STARTING_SECTOR
setvar $KILLSECTOR 0
setvar $TEST_SECTOR $SECTOR~TARGETSECTOR
setvar $SAFEPLANETS TRUE
setvar $CONTAINSSHIELDEDPLANET FALSE
setvar $CONTAINSENEMYTRADER FALSE
if ($SECTOR~HOLOTARGETFOUND)
  gosub :PLAYER~QUIKSTATS
  if (($PLAYER~PHOTONS > 0) and (($PHOTON_ONLY = TRUE) or ($PHOTON_AND_KILL = TRUE)))
    send "c  p  y  " $TEST_SECTOR "* * q "
    if ($PHOTON_ONLY = TRUE)
      setvar $SWITCHBOARD~MESSAGE "Photoned "&$SECTOR~ENEMY_NAME&" in sector "&$TEST_SECTOR&"!  In photon only mode right now.*"
      return
    end
  end
  if (SECTOR.PLANETCOUNT[$TEST_SECTOR] > 0)
    setvar $P 1
    while ($P <= SECTOR.PLANETCOUNT[$TEST_SECTOR])
      getword SECTOR.PLANETS[$TEST_SECTOR][$P] $TEST 1
      if ($TEST = "<<<<")
        setvar $CONTAINSSHIELDEDPLANET TRUE
      end
      add $P 1
    end
    if ($SECTOR~TARGET_IN_DEFENDER_SHIP = TRUE)

      setvar $SAFEPLANETS FALSE
    end
    if ($PLAYER~SURROUNDAVOIDALLPLANETS)
      setvar $SAFEPLANETS FALSE
    elseif ($CONTAINSSHIELDEDPLANET and $PLAYER~SURROUNDAVOIDSHIELDEDONLY)
      setvar $SAFEPLANETS FALSE
    end
  end
  setvar $FIGOWNER SECTOR.FIGS.OWNER[$TEST_SECTOR]
  if (($TEST_SECTOR <> $MAP~STARDOCK) and ((($TEST_SECTOR > 10) and ((($SAFEPLANETS = TRUE) and ((SECTOR.FIGS.QUANTITY[$TEST_SECTOR] < ($TOO_MANY_FIGHTERS * 2)) or ($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))
    setvar $KILLSECTOR $TEST_SECTOR
  else
    if ($SECTOR~TARGET_IN_DEFENDER_SHIP = TRUE)
      setvar $SWITCHBOARD~MESSAGE "Cannot holokill - "&$SECTOR~ENEMY_NAME&" is in a defender ship with planets under them.*"
      return
    else
      setvar $SWITCHBOARD~MESSAGE "Cannot holokill - check for planets or too many figs?*"
      return
    end
  end
else
  if ($SECTOR~SECTORTARGETFOUND = TRUE)
    if ($PLAYER~CIT = TRUE)
      gosub :FASTCITADELATTACK
    else
      gosub :FASTATTACK
    end
    setvar $SWITCHBOARD~MESSAGE "Found "&$SECTOR~ENEMY_NAME&" in MY sector!  Attacked them.*"
  else
    setvar $SWITCHBOARD~MESSAGE "No targets found adjacent.*"
  end
  return
end

:HOLO_KILL_KILLEM
add $HOLOKILL_COUNT 1
if ($SLINGSHOT)
  setvar $TITLE "Slingshot Holokill"
else
  setvar $TITLE "Holokill"
end
if ($NOAVOID <> TRUE)
  send "c v 0 * y n " $TEST_SECTOR " *  q  "
end
if ($SLINGSHOT)
  if ($PLAYER~CIT = TRUE)
    if ($SWITCH)
      send " e y q m * * * q  m z " $TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
    else
      send " q m * * * q  m z " $TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
    end
  else
    send " m z " $TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
  end
  setvar $I 0
  while ($I < 15)
    add $I 1
    send "l j" #8 #8 $PLANET~PLANET "* "
  end

  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $TEST_SECTOR)
    setvar $SWITCHBOARD~MESSAGE "Possible splatter on a planet, check for pod.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    return
  end
  if ($PLAYER~CURRENT_PROMPT = "Planet")
    send "m * * * c "
    setvar $PLAYER~STARTINGLOCATION "Citadel"
    setvar $PLAYER~CURRENT_PROMPT "Citadel"
    if ($HOLOCAPTURE)
      gosub :FASTCAPTURE
      send "l j" #8 #8 $PLANET~PLANET "* j m * * * j c  *  "

      gosub :PLAYER~QUIKSTATS
    else
      gosub :FASTCITADELATTACK
    end
    send "p " $HKILL_START_SECTOR "* y "
    gosub :PLAYER~QUIKSTATS
  end
  if ($PLAYER~CURRENT_SECTOR <> $HKILL_START_SECTOR)
    gosub :CALLSAVEME
    setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
  else
    setvar $SWITCHBOARD~MESSAGE $TITLE&" - Attacking sector "&$TEST_SECTOR&".*"
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
  end
else
  if ($PLAYER~CIT = TRUE)
    if ($SWITCH)
      send " e y q m * * * q  m z " $TEST_SECTOR "*     *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  "
    else
      send " q m * * * q  m z " $TEST_SECTOR "*     *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *   "
    end
  else
    send " m z " $TEST_SECTOR " *      *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *   "
  end
  if (($PLAYER~GENESIS > 0) and ($COMBAT~DEFENDER = TRUE))
    send "u y n.* c "
  end
  if ($PLAYER~SURROUND_BEFORE_HKILL = TRUE)
    gosub :PLAYER~QUIKSTATS
    gosub :GRID~SURROUND
    setvar $INSURROUND_BEFORE_HKILL FALSE
    gosub :PLAYER~QUIKSTATS
  end


  setvar $PLAYER~STARTINGLOCATION "Command"
  setvar $PLAYER~CURRENT_PROMPT "Command"
  if ($HOLOCAPTURE)
    gosub :FASTCAPTURE
  else
    gosub :FASTATTACK
  end
  if ($PLAYER~CIT = TRUE)
    if ($SWITCH)
      send "  f  z  1  *  z  c  d  *   m " $HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *    l " $PLANET~PLANET " * n n * j m * * * j c  *   e y "
    else
      send "  f  z  1  *  z  c  d  *   m " $HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *    l " $PLANET~PLANET " * n n * j m * * * j c  *  "
    end
  else
    send "  f  z  1  *  z  c  d  *   m " $HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *   "
  end
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $HKILL_START_SECTOR)
    gosub :CALLSAVEME
    gosub :PLAYER~QUIKSTATS
    setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
  else
    setvar $SWITCHBOARD~MESSAGE "Holokill attacked "&$SECTOR~ENEMY_NAME&" in sector "&$TEST_SECTOR&".*"
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
  end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~CALLSAVEME
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $command "call"
setvar $parm1 ""
setvar $user_command_line " call  "
setvar $parm2 ""
setvar $parm3 ""
setvar $parm4 ""
setvar $parm5 ""
setvar $parm6 ""
savevar $command
savevar $user_command_line
savevar $parm1
savevar $parm2
savevar $parm3
savevar $parm4
savevar $parm5
savevar $parm6
load "scripts\"&$mombot_directory&"\commands\defense\call.cts"
seteventtrigger CALLEND1 :CALLEND1 "SCRIPT STOPPED" "scripts\"&$mombot_directory&"\commands\defense\call.cts"
pause
:CALLEND1
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~HOLOSCAN
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SECTOR~SAFE_ATTACK_ONLY TRUE
setvar $BEFORE_HOLO_KILL_SECTOR $PLAYER~CURRENT_SECTOR
gosub :HOLOKILL
killalltriggers
if (($SECTOR~HOLOTARGETFOUND = TRUE) and ($PLAYER~CURRENT_SECTOR <> $BEFORE_HOLO_KILL_SECTOR))
  setvar $PLAYER~WARPTO $BEFORE_HOLO_KILL_SECTOR
  gosub :MOVE~TWARP
  if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
    setvar $SWITCHBOARD~MESSAGE "Could not make it back to starting sector after holokill. - ["&$PLAYER~MSG&"]*"
  end
end
if ($SWITCHBOARD~MESSAGE <> "No targets found adjacent.*")
  gosub :SWITCHBOARD~SWITCHBOARD
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~INIT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~REALTRADERCOUNT 0
setvar $PLAYER~FAKETRADERCOUNT 0
setvar $PLAYER~CORPIECOUNT 0
setvar $PLAYER~EMPTYSHIPCOUNT 0
setvar $PLAYER~CONTAINSBEACON FALSE
setarray $PLAYER~TRADERS 200
setarray $PLAYER~FAKETRADERS 100
setarray $PLAYER~EMPTYSHIPS 100
gosub :PLAYER~INITRANKS
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:COMBAT~PASSIVEHOLOCAP
setvar $HOLOCAPTURE TRUE
:COMBAT~PASSIVEHOLOKILL
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $TOO_MANY_FIGHTERS ($SHIP~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK)
divide $TOO_MANY_FIGHTERS 12

setvar $HKILL_START_SECTOR $SECTOR~STARTING_SECTOR
setvar $KILLSECTOR 0
setvar $TEST_SECTOR $SECTOR~TARGETSECTOR
setvar $SAFEPLANETS TRUE
setvar $CONTAINSSHIELDEDPLANET FALSE
setvar $CONTAINSENEMYTRADER FALSE

if (SECTOR.PLANETCOUNT[$TEST_SECTOR] > 0)
  setvar $P 1
  while ($P <= SECTOR.PLANETCOUNT[$TEST_SECTOR])
    getword SECTOR.PLANETS[$TEST_SECTOR][$P] $TEST 1
    if ($TEST = "<<<<")
      setvar $CONTAINSSHIELDEDPLANET TRUE
    end
    add $P 1
  end
  if ($PLAYER~SURROUNDAVOIDALLPLANETS)
    setvar $SAFEPLANETS FALSE
  elseif ($CONTAINSSHIELDEDPLANET and $PLAYER~SURROUNDAVOIDSHIELDEDONLY)
    setvar $SAFEPLANETS FALSE
  end
end
setvar $FIGOWNER SECTOR.FIGS.OWNER[$TEST_SECTOR]
if (($TEST_SECTOR <> $MAP~STARDOCK) and ((($TEST_SECTOR > 10) and ((($SAFEPLANETS = TRUE) and ((SECTOR.FIGS.QUANTITY[$TEST_SECTOR] < ($TOO_MANY_FIGHTERS * 2)) or ($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))))))
  setvar $KILLSECTOR $TEST_SECTOR
else
  setvar $SWITCHBOARD~MESSAGE "Cannot holokill - check for planets or too many figs?*"
  return
end
send "c v 0 * y n " $TEST_SECTOR " *  q  m z " $TEST_SECTOR " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  * "
if ($PLAYER~SURROUND_BEFORE_HKILL = TRUE)
  gosub :PLAYER~QUIKSTATS
  gosub :GRID~SURROUND
  setvar $INSURROUND_BEFORE_HKILL FALSE
  gosub :PLAYER~QUIKSTATS
end

setvar $PLAYER~STARTINGLOCATION "Command"
if ($HOLOCAPTURE)
  gosub :FASTCAPTURE
else
  gosub :FASTATTACK
end
if (($HKILL_START_SECTOR <= 10) or ($HKILL_START_SECTOR = $MAP~STARDOCK) or ($HKILL_START_SECTOR = STARDOCK))
  send "  f  z  1  *  z  c  d  *   m " $HKILL_START_SECTOR " *   "
else
  send "  f  z  1  *  z  c  d  *   m " $HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *   "
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $HKILL_START_SECTOR)
  gosub :CALLSAVEME
  gosub :PLAYER~QUIKSTATS
  setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
else
  setvar $SWITCHBOARD~MESSAGE "Auto holokill attacked "&$SECTOR~ENEMY_NAME&" in sector "&$TEST_SECTOR&".*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
end
return

include "source\include\grid"
include "source\include\sector"
include "source\include\move"
include "source\include\player"
