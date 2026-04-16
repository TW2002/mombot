:COMBAT~FASTCAPTURE

setvar $PLAYER~ISFOUND FALSE
setvar $COMBAT~TARGETISALIEN FALSE
setvar $COMBAT~STILLSHIELDS FALSE

loadvar $SHIP~SHIP_MAX_ATTACK

setvar $COMBAT~REFURBSTRING "l "&$PLANET~PLANET&"* m * * * q "
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
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q q * "
end
setvar $COMBAT~TARGETSTRING "a "

if ((($SECTOR~FAKETRADERCOUNT > 0) and ($PLAYER~CAPPINGALIENS = TRUE)) and (($PLAYER~ISFOUND <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  if ($PLAYER~FEDSPACE <> TRUE)
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
    if (($COMBAT~POS <= 0) and (($COMBAT~POS2 <= 0) and ($COMBAT~POS3 <= 0)))
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

if (($PLAYER~ISFOUND = FALSE) and ($SECTOR~EMPTYSHIPCOUNT > 0))
  if ($PLAYER~FEDSPACE <> TRUE)
    getwordpos $SECTOR~SECTORDATA $COMBAT~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($COMBAT~BEACONPOS > 0)
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"*"
    end
  end
  setvar $COMBAT~C 1
  setvar $PLAYER~ISFOUND FALSE
  while (($COMBAT~C <= $SECTOR~EMPTYSHIPCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if (($PLAYER~EMPTYSHIPS[$COMBAT~C] = $PLAYER~CORP) or ($PLAYER~EMPTYSHIPS[$COMBAT~C] = $PLAYER~TRADER_NAME))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"zy z"
    end
    add $COMBAT~C 1
  end
end
if (($SECTOR~REALTRADERCOUNT > $SECTOR~CORPIECOUNT) and (($PLAYER~ONLYALIENS <> TRUE) and ($PLAYER~EMPTY_SHIPS_ONLY <> TRUE)))
  if ($PLAYER~FEDSPACE <> TRUE)
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
  if (($COMBAT~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if (($PLAYER~FEDSPACE = TRUE) and ($PLAYER~TRADERS[$COMBAT~C][2] = TRUE))
      setvar $COMBAT~TARGETSTRING $COMBAT~TARGETSTRING&"* "
    elseif ($PLAYER~TRADERS[$COMBAT~C][1] = $PLAYER~CORP)
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
if ($PLAYER~ISFOUND = FALSE)
  echo "*You have no targets.*"

  goto :CAPSTOPPINGPOINT
else
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
  if ($PLAYER~FIGHTERS > 0)
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
    setvar $COMBAT~CAP_SHIP_INFO CURRENTLINE
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
    while ($COMBAT~TYPE_COUNT < $SHIP~SHIPCOUNTER)
      add $COMBAT~TYPE_COUNT 1


      getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~IS_SHIP $SHIP~SHIPLIST[$COMBAT~TYPE_COUNT]
      getwordpos $COMBAT~CAP_SHIP_INFO $COMBAT~UNMAN "'s unmanned"
      if ($COMBAT~UNMAN > 0)
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
    setvar $PLAYER~SHIELDS 16000
    setvar $COMBAT~DEFODDS 5
    goto :SEND_ATTACK
    setvar $SWITCHBOARD~MESSAGE "Unknown ship type, cannot calculate attack, you must do it manually.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "* "
    return
    :COMBAT~SEND_ATTACK
    killtrigger FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger COMBAT
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger NOTARGET2
    killtrigger NOCOMBAT
    killtrigger THEYATTACKED

    gettext $COMBAT~CAP_SHIP_INFO $COMBAT~SHIP_FIGHTERS $SHIP~SHIPLIST[$COMBAT~TYPE_COUNT] "(Y/N)"
    if ($COMBAT~SHIP_FIGHTERS = "")
      gettext $COMBAT~CAP_SHIP_INFO $COMBAT~SHIP_FIGHTERS " (" ") (Y/N)"
    end
    gettext $COMBAT~SHIP_FIGHTERS $COMBAT~SHIP_FIGHTERS "-" ")"
    striptext $COMBAT~SHIP_FIGHTERS ","
    setvar $COMBAT~SHIP_SHIELD_PERCENT 0
    setvar $COMBAT~SHIELDPOINTS 0
    settextlinetrigger COMBAT :COMBAT_SCAN "Combat scanners show enemy shields at"
    settexttrigger NOCOMBAT :CAP_IT "How many fighters do you wish to use"
    settextlinetrigger NOTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    settextlinetrigger NOTARGET2 :NOCAPPINGTARGETS "'s unmanned"
    settextlinetrigger THEYATTACKED :THEYATTACKED "Shipboard Computers "
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
    echo "*They attacked me, switching to 1 fighter attacks.*"
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
        if ($COMBAT~SHIP_FIGHTERS > 1000)
          setvar $COMBAT~CAP_POINTS (($COMBAT~SHIELDPOINTS / $COMBAT~OWN_ODDS) + ($COMBAT~CAP_POINTS / 100))
        else
          setvar $COMBAT~CAP_POINTS ($COMBAT~SHIELDPOINTS + 1)
        end
      else
        setvar $COMBAT~CAP_POINTS 1
      end
    else
      setvar $COMBAT~CAP_POINTS ($COMBAT~CAP_POINTS / $COMBAT~OWN_ODDS)
    end
    if ($COMBAT~UNMANNED = TRUE)
      divide $COMBAT~CAP_POINTS 2
    end
    setvar $COMBAT~CAP_POINTS (($COMBAT~CAP_POINTS * 78) / 100)
    if ($COMBAT~CAP_POINTS <= 0)
      setvar $COMBAT~CAP_POINTS 1
    elseif ($COMBAT~CAP_POINTS > $COMBAT~MAX_FIGS)
      setvar $COMBAT~CAP_POINTS $COMBAT~MAX_FIGS
    end
    setvar $COMBAT~SENDATTACK "z"&$COMBAT~CAP_POINTS&"*  "
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      setvar $COMBAT~SENDATTACK $COMBAT~SENDATTACK&$COMBAT~REFURBSTRING
    end
    send $COMBAT~SENDATTACK
    if ($COMBAT~CAP_POINTS = 1)
      setvar $COMBAT~I 1
      setvar $COMBAT~BURST ""
      while ($COMBAT~I <= 10)
        setvar $COMBAT~BURST $COMBAT~BURST&" "&$COMBAT~TARGETSTRING&$COMBAT~SENDATTACK
        setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $COMBAT~CAP_POINTS)
        add $COMBAT~I 1
      end
      send $COMBAT~BURST
      gosub :PLAYER~QUIKSTATS
    end
    :COMBAT~KEEPCAPPING
  end
end
goto :CAPSTOPPINGPOINT
:COMBAT~NOCAPPINGTARGETS
killtrigger NOCTARGET
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
