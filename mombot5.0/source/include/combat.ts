:COMBAT~FASTATTACK












setvar $COMBAT~TARGETSTRING "a"
setvar $PLAYER~ISFOUND FALSE
setvar $COMBAT~TARGETSHOTGUN "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP~SHIP_MAX_ATTACK&"* * "

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $COMBAT~FEDSPACE FALSE
if (($PLAYER~CURRENT_SECTOR = STARDOCK) or ($PLAYER~CURRENT_SECTOR <= 10))
  setvar $COMBAT~FEDSPACE TRUE
elseif ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)
  setvar $COMBAT~FEDSPACE TRUE
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
    getword CURRENTLINE $COMBAT~FIGSTOBUY 8
    waiton "C  Shield Points   :"
    getword CURRENTLINE $COMBAT~SHIELDSTOBUY 9

    send "b " $COMBAT~FIGSTOBUY "* c " $COMBAT~SHIELDSTOBUY "* "

    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~FIGHTERS <= 0)
      setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no fighters even after refurb.  Hiding out on dock.*"&ANSI_7
      gosub :BOT~ECHO
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
      gosub :BOT~ECHO
      return
    end
  end
end
if ($COMBAT~FEDSPACE <> TRUE)
  getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
  if ($COMBAT~BEACONPOS > 0)
    setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
  end
end
if (($SECTOR~EMPTYSHIPCOUNT + ($SECTOR~FAKETRADERCOUNT + $SECTOR~REALTRADERCOUNT)) > 0)
  setvar $COMBAT~I 0
  while ($COMBAT~I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    add $COMBAT~I 1
  end
  setvar $COMBAT~C 1
  while (($COMBAT~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))

    if ($PLAYER~TRADERS[$COMBAT~C][1] = $PLAYER~CORP)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($COMBAT~FEDSPACE = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][2] = TRUE))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGSHIP <> FALSE) and ($PLAYER~TRADERS[$COMBAT~C][3] <> TRUE))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    else
      setvar $COMBAT~ENEMY_FIGHTERS $PLAYER~TRADERS[$COMBAT~C][4]
      setvar $COMBAT~ENEMY_NAME $PLAYER~TRADERS[$COMBAT~C]
      if ($SECTOR~SAFE_ATTACK_ONLY <> TRUE)
        setvar $PLAYER~ISFOUND TRUE
      else

        setvar $COMBAT~TOO_MANY_FIGHTERS (($SHIP~SHIP_OFFENSIVE_ODDS * $PLAYER~FIGHTERS) < (($COMBAT~ENEMY_FIGHTERS + $COMBAT~TARGET_SHIELDS) * $COMBAT~TARGET_DEFENSE_ODDS))
        if (($SECTOR~SAFE_ATTACK_ONLY = TRUE) and ($COMBAT~TOO_MANY_FIGHTERS <> TRUE))
          setvar $PLAYER~ISFOUND TRUE
        else
          echo "*Safe mode active - Too many fighters on " $COMBAT~ENEMY_NAME ".  Can't attack them and survive.*"
        end
      end
      if ($PLAYER~ISFOUND = TRUE)
        setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"zy z"
      end
    end
    add $COMBAT~C 1
  end
else

  setvar $SWITCHBOARD~MESSAGE "*You have no targets.*"
  gosub :BOT~ECHO

  goto :STOPPINGPOINT
end
if ($PLAYER~ISFOUND = TRUE)
  setvar $COMBAT~ATTACKSTRING ""
  if (($PLAYER~GENESIS > 0) and ($COMBAT~DEFENDER = TRUE))
    setvar $COMBAT~ATTACKSTRING "u y n.* c "
    setvar $PLAYER~GENESIS ($PLAYER~GENESIS - 1)
  end

  setvar $COMBAT~STARTING_FIGHTERS $PLAYER~FIGHTERS
  while ($PLAYER~FIGHTERS > 0)
    if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSHOTGUN&$PLAYER~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$COMBAT~TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$PLAYER~REFURBSTRING
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSTRING&$PLAYER~FIGHTERS&"* * "&$PLAYER~REFURBSTRING
        end
      end
      setvar $PLAYER~FIGHTERS 0
    else
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSHOTGUN&$PLAYER~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$PLAYER~REFURBSTRING
          setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $SHIP~SHIP_MAX_ATTACK)
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$PLAYER~REFURBSTRING
        end
      end
      setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $SHIP~SHIP_MAX_ATTACK)
    end
  end
else

  setvar $SWITCHBOARD~MESSAGE "*You have no valid targets.*"
  gosub :BOT~ECHO

  goto :STOPPINGPOINT
end
if (($SECTOR~PASSIVE = TRUE) and ($COMBAT~STARTING_FIGHTERS < $COMBAT~ENEMY_FIGHTERS))
  setvar $PLAYER~FIGHTERS $COMBAT~STARTING_FIGHTERS
  setvar $SWITCHBOARD~MESSAGE "*Enemy has too many fighters to attack auto ("&$COMBAT~ENEMY_FIGHTERS&").*"
  gosub :BOT~ECHO
else
  send $COMBAT~ATTACKSTRING&"* "
end
:COMBAT~STOPPINGPOINT

return
:COMBAT~FASTCAPTURE


setvar $PLAYER~ISFOUND FALSE
setvar $COMBAT~TARGETISALIEN FALSE
setvar $COMBAT~STILLSHIELDS FALSE
setvar $COMBAT~SHIP_FIGHTERS 0

loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~SHIP_OFFENSIVE_ODDS

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

setvar $COMBAT~FEDSPACE FALSE
if ((CURRENTSECTOR = STARDOCK) or (CURRENTSECTOR <= 10))
  setvar $COMBAT~FEDSPACE TRUE
elseif (CURRENTSECTOR = $MAP~STARDOCK)
  setvar $COMBAT~FEDSPACE TRUE
end
if (($PLAYER~ONETAP = TRUE) or ($PLAYER~SLOWMO = TRUE))
  setvar $COMBAT~REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * j * c "
else
  setvar $COMBAT~REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * j q * "
end
:COMBAT~CHECKINGFIGS
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
setvar $COMBAT~TARGETSTRING "a "

if (($SECTOR~REALTRADERCOUNT > $SECTOR~CORPIECOUNT) and (($PLAYER~ONLYALIENS <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  if ($COMBAT~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
  setvar $COMBAT~I 0
  while ($COMBAT~I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    add $COMBAT~I 1
  end
  setvar $COMBAT~C 1
  while (($COMBAT~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))

    if (($COMBAT~FEDSPACE = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][2] = TRUE))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TRADERS[$COMBAT~C][1] = $PLAYER~CORP) or ($PLAYER~TRADERS[$COMBAT~C][1] = 100000))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGCORP = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][1] <> $COMBAT~TARGET))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGPERSON = TRUE) and ($PLAYER~TRADERS[$COMBAT~C] <> $COMBAT~TARGET))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"zy z"
    end
    add $COMBAT~C 1

  end
end
if ((($SECTOR~FAKETRADERCOUNT > 0) and ($PLAYER~CAPPINGALIENS = TRUE)) and (($PLAYER~ISFOUND <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  setvar $COMBAT~TARGETSTRING "a "
  if ($COMBAT~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
  setvar $COMBAT~A 1
  while (($COMBAT~A <= $SECTOR~FAKETRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    getwordpos $PLAYER~FAKETRADERS[$COMBAT~A] $COMBAT~POS "Zyrain"
    getwordpos $PLAYER~FAKETRADERS[$COMBAT~A] $COMBAT~POS2 "Clausewitz"
    getwordpos $PLAYER~FAKETRADERS[$COMBAT~A] $COMBAT~POS3 "Nelson"
    getwordpos $PLAYER~FAKETRADERS[$COMBAT~A] $COMBAT~POS4 "Wilson"
    if (($COMBAT~POS <= 0) and (($COMBAT~POS2 <= 0) and (($COMBAT~POS3 <= 0) and ($COMBAT~POS4 <= 0))))
      setvar $COMBAT~I 0
      setvar $PLAYER~ISFOUND TRUE
      setvar $COMBAT~TARGETISALIEN TRUE
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"zy z"
    else
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    end
    add $COMBAT~A 1
  end
end


if (($PLAYER~ISFOUND = FALSE) and (($SECTOR~EMPTYSHIPCOUNT > 0) and ($COMBAT~FEDSPACE <> TRUE)))





  setvar $COMBAT~TARGETSTRING "a "
  if ($COMBAT~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
  if ($COMBAT~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
  setvar $COMBAT~C 1
  setvar $PLAYER~ISFOUND FALSE
  while (($COMBAT~C <= $SECTOR~EMPTYSHIPCOUNT) and (($PLAYER~ISFOUND = FALSE) and ($COMBAT~FEDSPACE <> TRUE)))
    if (($PLAYER~EMPTYSHIPS[$COMBAT~C] = $PLAYER~CORP) or ($PLAYER~EMPTYSHIPS[$COMBAT~C] = $PLAYER~TRADER_NAME))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"zy z"
    end
    add $COMBAT~C 1
  end
end
if ($PLAYER~ISFOUND = FALSE)
  if ($PLAYER~ONETAP = TRUE)
    setvar $SWITCHBOARD~MESSAGE "No Targets - One Tap Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE "*You have no targets.*"
  gosub :BOT~ECHO
  goto :CAPSTOPPINGPOINT
else
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "q q * "
  end
  setvar $COMBAT~ATTACKSTRING ""
  :COMBAT~CAP_SHIP

  setvar $COMBAT~UNMANNED FALSE
  setvar $COMBAT~OWN_ODDS $SHIP~SHIP_OFFENSIVE_ODDS
  setvar $COMBAT~CAP_POINTS 0
  setvar $COMBAT~MAX_FIGS 0
  setvar $COMBAT~CAP_SHIELD_POINTS 0
  setvar $COMBAT~SHIP_FIGHTERS 0
  setvar $PLAYER~LASTTARGET ""
  setvar $COMBAT~FIRSTLOOP TRUE
  while ($PLAYER~FIGHTERS > 0)
    killalltriggers
    setvar $COMBAT~STILLSHIELDS FALSE
    setvar $COMBAT~ISSAMETARGET FALSE
    :COMBAT~CGOAHEAD
    killtrigger CHECKCAPTARGET
    settexttrigger FOUNDCAPTARGET :FOUNDCAPTARGET "(Y/N) [N]? Y"
    settexttrigger CHECKCAPTARGET :CHECKCAPTARGET "Yes"
    settextlinetrigger NOCTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"

    send $COMBAT~TARGETSTRING
    pause
    pause
    :COMBAT~CHECKCAPTARGET
    getwordpos CURRENTANSILINE $COMBAT~POS "36mYes"
    if ($COMBAT~POS > 0)
      goto :FOUNDCAPTARGET

    else
      settexttrigger CHECKCAPTARGET :CHECKCAPTARGET "Yes"
      pause
      pause
    end
    :COMBAT~FOUNDCAPTARGET

    killtrigger NOCTARGET
    killtrigger FOUNDCAPTARGET
    killtrigger CHECKCAPTARGET
    killtrigger WRONGTARGET
    setvar $COMBAT~CAP_SHIP_INFO CURRENTLINE
    getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~TARGETPOS " ["&$PLAYER~CORP&"]'s unmanned "
    if ($COMBAT~TARGETPOS > 0)
      goto :NOCAPPINGTARGETS
    end
    setvar $COMBAT~THISTARGET CURRENTANSILINE
    getword $COMBAT~CAP_SHIP_INFO $COMBAT~ATTACK_PROMPT 1

    if ($COMBAT~ATTACK_PROMPT <> "Attack")
      killalltriggers
      return
    end
    getwordpos $COMBAT~THISTARGET $COMBAT~POS "[0;33m([1;36m"
    cuttext $COMBAT~THISTARGET $COMBAT~THISTARGET 1 $COMBAT~POS
    if ($COMBAT~POS > 0)
      setvar $COMBAT~THISTARGET $COMBAT~CAP_SHIP_INFO
      setvar $COMBAT~TEMP $COMBAT~THISTARGET
      getwordpos $COMBAT~TEMP $COMBAT~POS " ("

      setvar $COMBAT~END_OF_LINE_POS 0
      while ($COMBAT~POS > 0)
        setvar $COMBAT~TARGETPOS $COMBAT~POS
        cuttext $COMBAT~TEMP $COMBAT~POSSIBLETARGET 1 $COMBAT~POS
        replacetext $COMBAT~TEMP $COMBAT~POSSIBLETARGET ""
        getwordpos $COMBAT~TEMP $COMBAT~POS " ("
        if ($COMBAT~POS > 0)
          add $COMBAT~END_OF_LINE_POS ($COMBAT~TARGETPOS + 1)
        end
      end
      if ($COMBAT~END_OF_LINE_POS <= 0)

        getwordpos $COMBAT~THISTARGET $COMBAT~END_OF_LINE_POS " (Y"
      end


      cuttext $COMBAT~THISTARGET $COMBAT~THISTARGET 1 $COMBAT~END_OF_LINE_POS
    end



    if (($COMBAT~THISTARGET = $PLAYER~LASTTARGET) and ($COMBAT~FIRSTLOOP <> TRUE))
      setvar $COMBAT~ISSAMETARGET TRUE
      getwordpos $COMBAT~THISTARGET $COMBAT~OURSHIPPOS " ["&$PLAYER~CORP&"]'s unmanned "
      if ($COMBAT~OURSHIPPOS > 0)

        setvar $COMBAT~ISSAMETARGET FALSE
      end
    elseif ($PLAYER~LASTTARGET = "")
      setvar $PLAYER~LASTTARGET $COMBAT~THISTARGET
      setvar $COMBAT~FIRSTLOOP FALSE
    else
      goto :NOCAPPINGTARGETS
    end
    if ($COMBAT~ISSAMETARGET)
      goto :SEND_ATTACK
    end
    :COMBAT~SHIP_TYPE
    setvar $COMBAT~TYPE_COUNT 0
    setvar $COMBAT~IS_SHIP 0
    if ($SHIP~SHIPCOUNTER <= 0)
      setvar $SWITCHBOARD~MESSAGE "ERROR with capture.  No ship data loaded.  Look into loadshipinfo not being called.*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
    while ($COMBAT~TYPE_COUNT < $SHIP~SHIPCOUNTER)
      add $COMBAT~TYPE_COUNT 1


      getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~IS_SHIP $SHIP~SHIPLIST[$COMBAT~TYPE_COUNT]
      getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~UNMAN "'s unmanned "
      getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~UNMAN2 "s' unmanned "
      if (($COMBAT~UNMAN > 0) or ($COMBAT~UNMAN2 > 0))
        setvar $COMBAT~UNMANNED TRUE

      else

        setvar $COMBAT~UNMANNED FALSE
      end
      if (($COMBAT~IS_SHIP > 0) and ($SHIP~SHIPLIST[$COMBAT~TYPE_COUNT] <> 0))
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$COMBAT~TYPE_COUNT]] $PLAYER~SHIELDS 1
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$COMBAT~TYPE_COUNT]] $COMBAT~DEFODDS 2
        goto :SEND_ATTACK
      end
    end


    echo "*Unknown ship type, cannot calculate attack.  I'm going to guess. ["&$COMBAT~CAP_SHIP_INFO&"]"
    setvar $COMBAT~SHIELDPOINTS 16000
    setvar $COMBAT~DEFODDS 5
    :COMBAT~SEND_ATTACK
    killtrigger FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger COMBAT
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger NOTARGET2
    killtrigger NOCOMBAT
    killtrigger THEYATTACKED
    killtrigger WRONGTARGET

    gettext $COMBAT~CAP_SHIP_INFO $COMBAT~CAP_INFO $SHIP~SHIPLIST[$COMBAT~TYPE_COUNT] "(Y/N)"

    if ($COMBAT~CAP_INFO <> "")

      gettext $COMBAT~CAP_INFO $COMBAT~SHIP_FIGHTERS " (" ")"
    else
      gettext $COMBAT~CAP_SHIP_INFO $COMBAT~SHIP_FIGHTERS " (" ") (Y/N)"
    end
    gettext $COMBAT~SHIP_FIGHTERS&"ENDOFLINE" $COMBAT~SHIP_FIGHTERS "-" "ENDOFLINE"
    striptext $COMBAT~SHIP_FIGHTERS ","




    setvar $COMBAT~SHIP_SHIELD_PERCENT 0
    setvar $COMBAT~SHIELDPOINTS 0
    settextlinetrigger COMBAT :COMBAT_SCAN "Combat scanners show enemy shields at"
    settexttrigger NOCOMBAT :CAP_IT "How many fighters do you wish to use"
    settextlinetrigger NOTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    settextlinetrigger NOTARGET2 :NOCAPPINGTARGETS "'s unmanned"



    pause
    pause
    :COMBAT~COMBAT_SCAN

    getword CURRENTLINE $COMBAT~SHIELDPERC 7
    striptext $COMBAT~SHIELDPERC "%"
    setvar $COMBAT~SHIELDPOINTS (($PLAYER~SHIELDS * $COMBAT~SHIELDPERC) / 100)
    setvar $COMBAT~STILLSHIELDS TRUE
    pause
    pause
    :COMBAT~THEYATTACKED
    getwordpos CURRENTLINE $COMBAT~POS " The Interdictor Generator on "
    if ($COMBAT~POS > 0)
      settextlinetrigger THEYATTACKED :THEYATTACKED "Shipboard Computers "
      pause
    end
    setvar $SWITCHBOARD~MESSAGE "*They attacked me, switching to 1 fighter attacks.*"
    gosub :BOT~ECHO
    setvar $COMBAT~SHIP_FIGHTERS 1
    :COMBAT~CAP_IT
    killtrigger COMBAT_SCAN
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger THEYATTACKED
    getword CURRENTLINE $COMBAT~MAX_FIGS 11 $SHIP~SHIP_MAX_ATTACK
    striptext $COMBAT~MAX_FIGS ","
    striptext $COMBAT~MAX_FIGS ")"
    if ($COMBAT~SHIP_FIGHTERS = "")
      setvar $COMBAT~SHIP_FIGHTERS 1
    end


    setvar $COMBAT~CAP_POINTS (($COMBAT~SHIELDPOINTS + $COMBAT~SHIP_FIGHTERS) * $COMBAT~DEFODDS)

    if ((($PLAYER~DEFENDERCAPPING = TRUE) and ($COMBAT~UNMANNED <> TRUE)) and ($COMBAT~TARGETISALIEN = TRUE))
      if ($COMBAT~STILLSHIELDS = TRUE)
        if ($COMBAT~SHIP_FIGHTERS > 750)
          setvar $COMBAT~CAP_POINTS (($COMBAT~SHIELDPOINTS / $COMBAT~OWN_ODDS) + ($COMBAT~CAP_POINTS / 100))
        else
          setvar $COMBAT~CAP_POINTS ($COMBAT~SHIELDPOINTS + 1)
        end
      else
        if ($COMBAT~SHIP_FIGHTERS > 750)
          setvar $COMBAT~CAP_POINTS (($COMBAT~CAP_POINTS / $COMBAT~OWN_ODDS) - ($COMBAT~CAP_POINTS / 70))
        else
          setvar $COMBAT~CAP_POINTS 1
        end
      end
    else

      setvar $COMBAT~CAP_POINTS ($COMBAT~CAP_POINTS / $COMBAT~OWN_ODDS)
    end
    if ($COMBAT~UNMANNED = TRUE)
      setvar $COMBAT~CAP_POINTS ($COMBAT~CAP_POINTS / 2)
    end
    setvar $COMBAT~CAP_POINTS (($COMBAT~CAP_POINTS * 70) / 100)
    if ($COMBAT~CAP_POINTS <= 0)
      setvar $COMBAT~CAP_POINTS 1
    elseif ($COMBAT~CAP_POINTS > $COMBAT~MAX_FIGS)
      setvar $COMBAT~CAP_POINTS $COMBAT~MAX_FIGS
    end
    setvar $COMBAT~SENDATTACK "z"&$COMBAT~CAP_POINTS&"*  "
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      setvar $COMBAT~SENDATTACK $COMBAT~SENDATTACK&$COMBAT~REFURBSTRING
    elseif (($PLAYER~REFURBSTRING <> "") and ($PLAYER~REFURBSTRING <> 0))
      setvar $COMBAT~SENDATTACK $COMBAT~SENDATTACK&$PLAYER~REFURBSTRING
    end
    send $COMBAT~SENDATTACK
    if ($PLAYER~ONETAP = TRUE)

      setvar $SWITCHBOARD~MESSAGE "One tap complete.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    if ($PLAYER~SLOWMO = TRUE)
      getrnd $COMBAT~SLOWRND 10 25
      setvar $COMBAT~SLOWBREAK (($COMBAT~SLOWRND * $GAME~LATENCY) + 1000)
      setdelaytrigger CITCAPBREAK :CITCAPBREAK $COMBAT~SLOWBREAK
      pause
      :COMBAT~CITCAPBREAK
      killtrigger CITCAPBREAK
      return
    end
    if ($COMBAT~CAP_POINTS = 1)
      setvar $COMBAT~I 1
      setvar $COMBAT~BURST ""
      while ($COMBAT~I <= 3)
        setvar $COMBAT~BURST $COMBAT~BURST&" "&$COMBAT~TARGETSTRING&$COMBAT~SENDATTACK
        setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $COMBAT~CAP_POINTS)
        add $COMBAT~I 1
      end
      send $COMBAT~BURST
      setdelaytrigger LITTLESLOWER :DONELITTLESLOWER 10
      pause
      :COMBAT~DONELITTLESLOWER
      gosub :PLAYER~QUIKSTATS
    end
    :COMBAT~KEEPCAPPING
  end

end
goto :CAPSTOPPINGPOINT
:COMBAT~NOCAPPINGTARGETS
killtrigger NOCTARGET
killtrigger WRONGTARGET
killtrigger FOUNDCAPTARGET
killtrigger COMBAT_SCAN
killtrigger CAP_IT
killtrigger NOTARGET
killtrigger NOTARGET2
killtrigger THEYATTACKED
send "* "
:COMBAT~CAPSTOPPINGPOINT
killalltriggers
return
:COMBAT~FASTCITADELATTACK


if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end
setvar $COMBAT~REFURBSTRING " l "&$PLANET~PLANET&" * n n * j m * * * "
setvar $COMBAT~ATTACKSTRING ""
setvar $COMBAT~TARGETSTRING "a z "
setvar $COMBAT~TARGETSHOTGUN "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$COMBAT~SHIP_MAX_ATTACK&"* * "
setvar $PLAYER~ISFOUND FALSE
if ($PLAYER~FIGHTERS > 0)
  if ($PLAYER~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
else
  send "q m***c "
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~FIGHTERS <= 0)
    send "'{" $SWITCHBOARD~BOT_NAME "} - Out of fighters, shutting down "&$BOT~COMMAND&".*"
    setvar $KILLING~ERROR TRUE
    return
  end
end

if (($SECTOR~EMPTYSHIPCOUNT + ($SECTOR~FAKETRADERCOUNT + $SECTOR~REALTRADERCOUNT)) > 0)
  setvar $COMBAT~I 0
  while ($COMBAT~I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    add $COMBAT~I 1
  end
  setvar $COMBAT~C 1
  while (($COMBAT~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if (($PLAYER~FEDSPACE = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][2] = TRUE))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TRADERS[$COMBAT~C][1] = $PLAYER~CORP) or ($PLAYER~TRADERS[$COMBAT~C][1] = 100000))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGCORP = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][1] <> $COMBAT~TARGET))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGPERSON = TRUE) and ($PLAYER~TRADERS[$COMBAT~C] <> $COMBAT~TARGET))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"z y z"

    end
    add $COMBAT~C 1

  end
else
  if ($PLAYER~ONETAP = TRUE)
    setvar $SWITCHBOARD~MESSAGE "No Targets - One Tap Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE ANSI_12&"*You have no targets.*"&ANSI_7
  gosub :BOT~ECHO
  return
end
if ($PLAYER~ISFOUND = TRUE)
  setvar $PLAYER~THISKILLTARGET ""
  setvar $PLAYER~LASTKILLTARGET ""
  if ($PLAYER~SMART)
    setvar $COMBAT~ATTACKSTRING ""
    send "q "
    setvar $COMBAT~COUNT 8
    while ($COMBAT~COUNT > 0)
      if ($PLAYER~SHOTGUN)
        send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSHOTGUN&$COMBAT~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~REFURBSTRING
        else
          send $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~REFURBSTRING
        end
      end
      settexttrigger FOUNDKILLTARGET :FOUNDKILLTARGET "(Y/N) [N]? Y"
      settextlinetrigger NOKTARGET :NOKILLTARGETS "Do you want instructions (Y/N) [N]?"
      pause
      :COMBAT~FOUNDKILLTARGET
      killalltriggers
      setvar $COMBAT~KILL_SHIP_INFO CURRENTLINE
      setvar $PLAYER~THISKILLTARGET CURRENTANSILINE
      getwordpos $PLAYER~THISKILLTARGET $COMBAT~POS "[0;33m([1;36m"
      cuttext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET 1 $COMBAT~POS
      getwordpos $PLAYER~THISKILLTARGET $COMBAT~POS "'s "
      while ($COMBAT~POS > 0)
        cuttext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET ($COMBAT~POS + 3) 9999
        getwordpos $PLAYER~THISKILLTARGET $COMBAT~POS "'s "
      end
      gettext $PLAYER~THISKILLTARGET $PLAYER~THISKILLTARGET #27&"[0m"&#27 #27&"["
      gettext $PLAYER~THISKILLTARGET&"/\ENDOFSHIPTAG/\" $PLAYER~THISKILLTARGET "m" "/\ENDOFSHIPTAG/\"
      getwordpos $PLAYER~TRADERS[($COMBAT~C - 1)][1] $COMBAT~POS $PLAYER~THISKILLTARGET
      if (($PLAYER~LASTKILLTARGET <> "") and ($PLAYER~THISKILLTARGET <> $PLAYER~LASTKILLTARGET))
        setvar $SWITCHBOARD~MESSAGE "*Target has changed, time to rescan..*"
        gosub :BOT~ECHO
        send " c "
        goto :DONEKILL
      end
      setvar $PLAYER~LASTKILLTARGET $PLAYER~THISKILLTARGET
      :COMBAT~NOKILLTARGETS
      killalltriggers

      subtract $COMBAT~COUNT 1
    end
    send " c "
  else
    setvar $COMBAT~ATTACKSTRING ""
    if ($PLAYER~ONETAP = TRUE)
      setvar $COMBAT~COUNT 1
    elseif ($PLAYER~SLOWMO = TRUE)
      setvar $COMBAT~COUNT 2
    else
      setvar $COMBAT~COUNT 8
    end
    while ($COMBAT~COUNT > 0)
      if ($PLAYER~SHOTGUN)
        setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSHOTGUN&$COMBAT~REFURBSTRING
      else
        if ($PLAYER~DOUBLETAP)
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~REFURBSTRING
        else
          setvar $COMBAT~ATTACKSTRING $COMBAT~ATTACKSTRING&"q "&$COMBAT~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "&$COMBAT~REFURBSTRING
        end
      end
      subtract $COMBAT~COUNT 1
    end
    send " q "&$COMBAT~ATTACKSTRING&" c "
    if ($PLAYER~ONETAP = TRUE)
      setvar $SWITCHBOARD~MESSAGE "One Tap Complete.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    if ($PLAYER~SLOWMO = TRUE)
      getrnd $COMBAT~SLOWRND 10 25
      setvar $COMBAT~SLOWBREAK (($COMBAT~SLOWRND * $GAME~LATENCY) + 1000)
      setdelaytrigger CITKILLBREAK :CITKILLBREAK $COMBAT~SLOWBREAK
      pause
      :COMBAT~CITKILLBREAK
      killtrigger CITKILLBREAK
      return
    end
    if ($PLAYER~UNLOADER = TRUE)
      settextlinetrigger UNLOADERWAIT :UNLOADERWAIT "@unloaddone"
      pause
      :COMBAT~UNLOADERWAIT
      killtrigger UNLOADERWAIT

      setvar $COMBAT~SLOWBREAK 400
      setdelaytrigger UNLOADERBREAK :UNLOADERBREAK $COMBAT~SLOWBREAK
      pause
      :COMBAT~UNLOADERBREAK
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
  gosub :BOT~ECHO
  return
end
:COMBAT~DONEKILL
return
:COMBAT~HOLOCAP


setvar $COMBAT~HOLOCAPTURE TRUE
:COMBAT~HOLOKILL
:COMBAT~HOLO_KILL
:COMBAT~HOLO_KILL_KILL_CHECK



setvar $COMBAT~ERROR FALSE
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end


setvar $COMBAT~TOO_MANY_FIGHTERS ($SHIP~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK)
divide $COMBAT~TOO_MANY_FIGHTERS 12

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
:COMBAT~HOLO_KILL_NOSCANNER

killalltriggers
setvar $SWITCHBOARD~MESSAGE "You don't have a HoloScanner!*"
if ($PLAYER~CIT)
  send "*  l "&$PLANET~PLANET&"* j c * "
else
  send "* "
end
setvar $COMBAT~ERROR TRUE
return
:COMBAT~HOLO_KILL_SCANDONE

getword CURRENTLINE $COMBAT~CHECK 1
if ($PLAYER~CIT)
  send "*  l "&$PLANET~PLANET&"* j c * "
else
  send "* "
end
:COMBAT~HOLO_KILL_GET_PROMPT
:COMBAT~HOLO_KILL_GET_CURRENT_SECTOR


setvar $COMBAT~HKILL_START_SECTOR $SECTOR~STARTING_SECTOR
setvar $PLAYER~CURRENT_SECTOR $COMBAT~STARTING_SECTOR
setvar $COMBAT~KILLSECTOR 0

setvar $COMBAT~TEST_SECTOR $SECTOR~TARGETSECTOR
setvar $COMBAT~SAFEPLANETS TRUE
setvar $COMBAT~CONTAINSSHIELDEDPLANET FALSE
setvar $COMBAT~CONTAINSENEMYTRADER FALSE
if ($SECTOR~HOLOTARGETFOUND)
  gosub :PLAYER~QUIKSTATS
  if (($PLAYER~PHOTONS > 0) and (($COMBAT~PHOTON_ONLY = TRUE) or ($COMBAT~PHOTON_AND_KILL = TRUE)))
    send "c  p  y  " $COMBAT~TEST_SECTOR "* * q "
    if ($COMBAT~PHOTON_ONLY = TRUE)
      setvar $SWITCHBOARD~MESSAGE "Photoned "&$SECTOR~ENEMY_NAME&" in sector "&$COMBAT~TEST_SECTOR&"!  In photon only mode right now.*"
      return
    end
  end
  if (SECTOR.PLANETCOUNT[$COMBAT~TEST_SECTOR] > 0)
    setvar $COMBAT~P 1
    while ($COMBAT~P <= SECTOR.PLANETCOUNT[$COMBAT~TEST_SECTOR])
      getword SECTOR.PLANETS[$COMBAT~TEST_SECTOR][$COMBAT~P] $COMBAT~TEST 1
      if ($COMBAT~TEST = "<<<<")
        setvar $COMBAT~CONTAINSSHIELDEDPLANET TRUE
      end
      add $COMBAT~P 1
    end
    if ($SECTOR~TARGET_IN_DEFENDER_SHIP = TRUE)

      setvar $COMBAT~SAFEPLANETS FALSE
    end
    if ($PLAYER~SURROUNDAVOIDALLPLANETS)
      setvar $COMBAT~SAFEPLANETS FALSE
    elseif ($COMBAT~CONTAINSSHIELDEDPLANET and $PLAYER~SURROUNDAVOIDSHIELDEDONLY)
      setvar $COMBAT~SAFEPLANETS FALSE
    end
  end
  setvar $COMBAT~FIGOWNER SECTOR.FIGS.OWNER[$COMBAT~TEST_SECTOR]
  if (($COMBAT~TEST_SECTOR <> $MAP~STARDOCK) and ((($COMBAT~TEST_SECTOR > 10) and ((($COMBAT~SAFEPLANETS = TRUE) and ((SECTOR.FIGS.QUANTITY[$COMBAT~TEST_SECTOR] < ($COMBAT~TOO_MANY_FIGHTERS * 2)) or ($COMBAT~FIGOWNER = "belong to your Corp") or ($COMBAT~FIGOWNER = "yours")))))))
    setvar $COMBAT~KILLSECTOR $COMBAT~TEST_SECTOR
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
:COMBAT~HOLO_KILL_KILLEM

add $COMBAT~HOLOKILL_COUNT 1
if ($COMBAT~SLINGSHOT)
  setvar $COMBAT~TITLE "Slingshot Holokill"
else
  setvar $COMBAT~TITLE "Holokill"
end
if ($COMBAT~NOAVOID <> TRUE)
  send "c v 0 * y n " $COMBAT~TEST_SECTOR " *  q  "
end
if ($COMBAT~SLINGSHOT)
  if ($PLAYER~CIT = TRUE)
    if ($COMBAT~SWITCH)
      send " e y q m * * * q  m z " $COMBAT~TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $COMBAT~TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
    else
      send " q m * * * q  m z " $COMBAT~TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $COMBAT~TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
    end
  else
    send " m z " $COMBAT~TEST_SECTOR "*     *   *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  '" $COMBAT~TEST_SECTOR "=saveme* f  z  1  *  z  c  d  *   "
  end
  setvar $COMBAT~I 0
  while ($COMBAT~I < 15)
    add $COMBAT~I 1
    send "l j" #8 #8 $PLANET~PLANET "* "
  end

  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $COMBAT~TEST_SECTOR)
    setvar $SWITCHBOARD~MESSAGE "Possible splatter on a planet, check for pod.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    return
  end
  if ($PLAYER~CURRENT_PROMPT = "Planet")
    send "m * * * c "
    setvar $PLAYER~STARTINGLOCATION "Citadel"
    setvar $PLAYER~CURRENT_PROMPT "Citadel"
    if ($COMBAT~HOLOCAPTURE)
      gosub :FASTCAPTURE
      send "l j" #8 #8 $PLANET~PLANET "* j m * * * j c  *  "

      gosub :PLAYER~QUIKSTATS
    else
      gosub :FASTCITADELATTACK
    end
    send "p " $COMBAT~HKILL_START_SECTOR "* y "
    gosub :PLAYER~QUIKSTATS
  end
  if ($PLAYER~CURRENT_SECTOR <> $COMBAT~HKILL_START_SECTOR)
    gosub :CALLSAVEME
    setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
  else
    setvar $SWITCHBOARD~MESSAGE $COMBAT~TITLE&" - Attacking sector "&$COMBAT~TEST_SECTOR&".*"
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
  end
else
  if ($PLAYER~CIT = TRUE)
    if ($COMBAT~SWITCH)
      send " e y q m * * * q  m z " $COMBAT~TEST_SECTOR "*     *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  "
    else
      send " q m * * * q  m z " $COMBAT~TEST_SECTOR "*     *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *   "
    end
  else
    send " m z " $COMBAT~TEST_SECTOR " *      *     *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *   "
  end
  if (($PLAYER~GENESIS > 0) and ($COMBAT~DEFENDER = TRUE))
    send "u y n.* c "
  end
  if ($PLAYER~SURROUND_BEFORE_HKILL = TRUE)
    gosub :PLAYER~QUIKSTATS
    gosub :GRID~SURROUND
    setvar $COMBAT~INSURROUND_BEFORE_HKILL FALSE
    gosub :PLAYER~QUIKSTATS
  end


  setvar $PLAYER~STARTINGLOCATION "Command"
  setvar $PLAYER~CURRENT_PROMPT "Command"
  if ($COMBAT~HOLOCAPTURE)
    gosub :FASTCAPTURE
  else
    gosub :FASTATTACK
  end
  if ($PLAYER~CIT = TRUE)
    if ($COMBAT~SWITCH)
      send "  f  z  1  *  z  c  d  *   m " $COMBAT~HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *    l " $PLANET~PLANET " * n n * j m * * * j c  *   e y "
    else
      send "  f  z  1  *  z  c  d  *   m " $COMBAT~HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *    l " $PLANET~PLANET " * n n * j m * * * j c  *  "
    end
  else
    send "  f  z  1  *  z  c  d  *   m " $COMBAT~HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *   "
  end
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $COMBAT~HKILL_START_SECTOR)
    gosub :CALLSAVEME
    gosub :PLAYER~QUIKSTATS
    setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
  else
    setvar $SWITCHBOARD~MESSAGE "Holokill attacked "&$SECTOR~ENEMY_NAME&" in sector "&$COMBAT~TEST_SECTOR&".*"
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
  end
end

return
:COMBAT~CALLSAVEME

setvar $BOT~COMMAND "call"
setvar $BOT~PARM1 ""
setvar $BOT~USER_COMMAND_LINE " call  "
setvar $BOT~PARM2 ""
setvar $BOT~PARM3 ""
setvar $BOT~PARM4 ""
setvar $BOT~PARM5 ""
setvar $BOT~PARM6 ""
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3
savevar $BOT~PARM4
savevar $BOT~PARM5
savevar $BOT~PARM6
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\defense\call.cts"
seteventtrigger CALLEND1 :CALLEND1 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\defense\call.cts"
pause
:COMBAT~CALLEND1
return
:COMBAT~HOLOSCAN



setvar $SECTOR~SAFE_ATTACK_ONLY TRUE

setvar $COMBAT~BEFORE_HOLO_KILL_SECTOR $PLAYER~CURRENT_SECTOR
gosub :HOLOKILL
killalltriggers
if (($SECTOR~HOLOTARGETFOUND = TRUE) and ($PLAYER~CURRENT_SECTOR <> $COMBAT~BEFORE_HOLO_KILL_SECTOR))
  setvar $PLAYER~WARPTO $COMBAT~BEFORE_HOLO_KILL_SECTOR
  gosub :PLAYER~TWARP
  if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
    setvar $SWITCHBOARD~MESSAGE "Could not make it back to starting sector after holokill. - ["&$PLAYER~MSG&"]*"
  end
end
if ($SWITCHBOARD~MESSAGE <> "No targets found adjacent.*")
  gosub :SWITCHBOARD~SWITCHBOARD
end
return
:COMBAT~INIT



setvar $PLAYER~REALTRADERCOUNT 0
setvar $PLAYER~FAKETRADERCOUNT 0
setvar $PLAYER~CORPIECOUNT 0
setvar $PLAYER~EMPTYSHIPCOUNT 0
setvar $PLAYER~CONTAINSBEACON FALSE
setarray $PLAYER~TRADERS 200
setarray $PLAYER~FAKETRADERS 100
setarray $PLAYER~EMPTYSHIPS 100
setvar $PLAYER~RANKSLENGTH 46
setarray $PLAYER~RANKS $PLAYER~RANKSLENGTH
setvar $PLAYER~RANKS[1] "36mCivilian"
setvar $PLAYER~RANKS[2] "36mPrivate 1st Class"
setvar $PLAYER~RANKS[3] "36mPrivate"
setvar $PLAYER~RANKS[4] "36mLance Corporal"
setvar $PLAYER~RANKS[5] "36mCorporal"
setvar $PLAYER~RANKS[6] "36mStaff Sergeant"
setvar $PLAYER~RANKS[7] "36mGunnery Sergeant"
setvar $PLAYER~RANKS[8] "36m1st Sergeant"
setvar $PLAYER~RANKS[9] "36mSergeant Major"
setvar $PLAYER~RANKS[10] "36mSergeant"
setvar $PLAYER~RANKS[11] "31mAnnoyance"
setvar $PLAYER~RANKS[12] "31mNuisance 3rd Class"
setvar $PLAYER~RANKS[13] "31mNuisance 2nd Class"
setvar $PLAYER~RANKS[14] "31mNuisance 1st Class"
setvar $PLAYER~RANKS[15] "31mMenace 3rd Class"
setvar $PLAYER~RANKS[16] "31mMenace 2nd Class"
setvar $PLAYER~RANKS[17] "31mMenace 1st Class"
setvar $PLAYER~RANKS[18] "31mSmuggler 3rd Class"
setvar $PLAYER~RANKS[19] "31mSmuggler 2nd Class"
setvar $PLAYER~RANKS[20] "31mSmuggler 1st Class"
setvar $PLAYER~RANKS[21] "31mSmuggler Savant"
setvar $PLAYER~RANKS[22] "31mRobber"
setvar $PLAYER~RANKS[23] "31mTerrorist"
setvar $PLAYER~RANKS[24] "31mInfamous Pirate"
setvar $PLAYER~RANKS[25] "31mNotorious Pirate"
setvar $PLAYER~RANKS[26] "31mDread Pirate"
setvar $PLAYER~RANKS[27] "31mPirate"
setvar $PLAYER~RANKS[28] "31mGalactic Scourge"
setvar $PLAYER~RANKS[29] "31mEnemy of the State"
setvar $PLAYER~RANKS[30] "31mEnemy of the People"
setvar $PLAYER~RANKS[31] "31mEnemy of Humankind"
setvar $PLAYER~RANKS[32] "31mHeinous Overlord"
setvar $PLAYER~RANKS[33] "31mPrime Evil"
setvar $PLAYER~RANKS[34] "36mChief Warrant Officer"
setvar $PLAYER~RANKS[35] "36mWarrant Officer"
setvar $PLAYER~RANKS[36] "36mEnsign"
setvar $PLAYER~RANKS[37] "36mLieutenant J.G."
setvar $PLAYER~RANKS[38] "36mLieutenant Commander"
setvar $PLAYER~RANKS[39] "36mLieutenant"
setvar $PLAYER~RANKS[40] "36mCommander"
setvar $PLAYER~RANKS[41] "36mCaptain"
setvar $PLAYER~RANKS[42] "36mCommodore"
setvar $PLAYER~RANKS[43] "36mRear Admiral"
setvar $PLAYER~RANKS[44] "36mVice Admiral"
setvar $PLAYER~RANKS[45] "36mFleet Admiral"
setvar $PLAYER~RANKS[46] "36mAdmiral"
setvar $PLAYER~LASTTARGET ""


return
:COMBAT~PASSIVEHOLOCAP


setvar $COMBAT~HOLOCAPTURE TRUE
:COMBAT~PASSIVEHOLOKILL

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end


setvar $COMBAT~TOO_MANY_FIGHTERS ($SHIP~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK)
divide $COMBAT~TOO_MANY_FIGHTERS 12

setvar $COMBAT~HKILL_START_SECTOR $SECTOR~STARTING_SECTOR
setvar $COMBAT~KILLSECTOR 0
setvar $COMBAT~TEST_SECTOR $SECTOR~TARGETSECTOR
setvar $COMBAT~SAFEPLANETS TRUE
setvar $COMBAT~CONTAINSSHIELDEDPLANET FALSE
setvar $COMBAT~CONTAINSENEMYTRADER FALSE
if (SECTOR.PLANETCOUNT[$COMBAT~TEST_SECTOR] > 0)
  setvar $COMBAT~P 1
  while ($COMBAT~P <= SECTOR.PLANETCOUNT[$COMBAT~TEST_SECTOR])
    getword SECTOR.PLANETS[$COMBAT~TEST_SECTOR][$COMBAT~P] $COMBAT~TEST 1
    if ($COMBAT~TEST = "<<<<")
      setvar $COMBAT~CONTAINSSHIELDEDPLANET TRUE
    end
    add $COMBAT~P 1
  end
  if ($PLAYER~SURROUNDAVOIDALLPLANETS)
    setvar $COMBAT~SAFEPLANETS FALSE
  elseif ($COMBAT~CONTAINSSHIELDEDPLANET and $PLAYER~SURROUNDAVOIDSHIELDEDONLY)
    setvar $COMBAT~SAFEPLANETS FALSE
  end
end
setvar $COMBAT~FIGOWNER SECTOR.FIGS.OWNER[$COMBAT~TEST_SECTOR]
if (($COMBAT~TEST_SECTOR <> $MAP~STARDOCK) and ((($COMBAT~TEST_SECTOR > 10) and ((($COMBAT~SAFEPLANETS = TRUE) and ((SECTOR.FIGS.QUANTITY[$COMBAT~TEST_SECTOR] < ($COMBAT~TOO_MANY_FIGHTERS * 2)) or ($COMBAT~FIGOWNER = "belong to your Corp") or ($COMBAT~FIGOWNER = "yours")))))))
  setvar $COMBAT~KILLSECTOR $COMBAT~TEST_SECTOR
else
  setvar $SWITCHBOARD~MESSAGE "Cannot holokill - check for planets or too many figs?*"
  return
end
send "c v 0 * y n " $COMBAT~TEST_SECTOR " *  q  m z " $COMBAT~TEST_SECTOR " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  * "
if ($PLAYER~SURROUND_BEFORE_HKILL = TRUE)
  gosub :PLAYER~QUIKSTATS
  gosub :GRID~SURROUND
  setvar $COMBAT~INSURROUND_BEFORE_HKILL FALSE
  gosub :PLAYER~QUIKSTATS
end





setvar $PLAYER~STARTINGLOCATION "Command"
if ($COMBAT~HOLOCAPTURE)
  gosub :FASTCAPTURE
else
  gosub :FASTATTACK
end
if (($COMBAT~HKILL_START_SECTOR <= 10) or ($COMBAT~HKILL_START_SECTOR = $MAP~STARDOCK) or ($COMBAT~HKILL_START_SECTOR = STARDOCK))
  send "  f  z  1  *  z  c  d  *   m " $COMBAT~HKILL_START_SECTOR " *   "
else
  send "  f  z  1  *  z  c  d  *   m " $COMBAT~HKILL_START_SECTOR " *  *  z  a  99999  *  z  a  99999  *  R  *   "
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $COMBAT~HKILL_START_SECTOR)
  gosub :CALLSAVEME
  gosub :PLAYER~QUIKSTATS
  setvar $SWITCHBOARD~MESSAGE "After save me, resetting.*"
else
  setvar $SWITCHBOARD~MESSAGE "Auto holokill attacked "&$SECTOR~ENEMY_NAME&" in sector "&$COMBAT~TEST_SECTOR&".*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Attack made and back in original sector!*"
end
return
