:SECTOR~GETAUTOSECTORDATA









setvar $SECTOR~ENDLINE "_ENDLINE_"
setvar $SECTOR~STARTLINE "_STARTLINE_"

setarray $SECTOR~ADJACENT 7
setarray $SECTOR~ADJACENT_SECTOR 7
setvar $SECTOR~ADJCOUNT 1


killalltriggers
:SECTOR~STARTOVER
setvar $SECTOR~SECTORDATA ""
setvar $SECTOR~FIRST TRUE
:SECTOR~AUTO_SECTORSLINE_CIT_KILL
setvar $SECTOR~LINE CURRENTANSILINE
setvar $SECTOR~LINE $SECTOR~STARTLINE&$SECTOR~LINE&$SECTOR~ENDLINE
setvar $SECTOR~SECTORDATA $SECTOR~SECTORDATA&$SECTOR~LINE
getwordpos $SECTOR~LINE $SECTOR~POS "Sector  [33m: "
if ($SECTOR~POS > 0)
  if ($SECTOR~FIRST)
    setvar $SECTOR~FIRST FALSE
    gettext $SECTOR~LINE $SECTOR~TEMPSECTOR "Sector  [33m: [36m" " [0;32min"
  else
    setvar $SECTOR~ADJACENT[$SECTOR~ADJCOUNT] $SECTOR~SECTORDATA&$SECTOR~STARTLINE&"[0m[1;32mWarps to Sector(s) "&$SECTOR~ENDLINE
    setvar $SECTOR~ADJACENT_SECTOR[$SECTOR~ADJCOUNT] $SECTOR~TEMPSECTOR
    add $SECTOR~ADJCOUNT 1
    gettext $SECTOR~LINE $SECTOR~TEMPSECTOR "Sector  [33m: [36m" " [0;32min"
    setvar $SECTOR~SECTORDATA $SECTOR~LINE
  end
end
getwordpos $SECTOR~LINE $SECTOR~POS "Warps to Sector(s) "
getword CURRENTLINE $SECTOR~CHECK 1
if (($SECTOR~POS > 0) and ($SECTOR~CHECK = "Warps"))
  setvar $SECTOR~ADJACENT[$SECTOR~ADJCOUNT] $SECTOR~SECTORDATA
  setvar $SECTOR~ADJACENT_SECTOR[$SECTOR~ADJCOUNT] $SECTOR~TEMPSECTOR
  goto :GOTAUTOSECTORDATA
else
  settextlinetrigger GETLINE :AUTO_SECTORSLINE_CIT_KILL
end
pause
:SECTOR~GOTAUTOSECTORDATA
settexttrigger NOMINES :NOMINESAUTO "Citadel command (?=help)"
settexttrigger NOMINES2 :NOMINESAUTO "Command ["
settexttrigger MINES :MINESAUTO "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause
:SECTOR~MINESAUTO

send "* "
:SECTOR~NOMINESAUTO
killtrigger NOMINES
killtrigger NOMINES2
killtrigger MINES

setvar $SECTOR~SINDEX $SECTOR~ADJCOUNT
while ($SECTOR~SINDEX > 0)
  setvar $SECTOR~HOLOTARGETFOUND FALSE
  setvar $SECTOR~SECTORTARGETFOUND FALSE
  setvar $SECTOR~SECTORDATA $SECTOR~ADJACENT[$SECTOR~SINDEX]
  setvar $SECTOR~TARGETSECTOR $SECTOR~ADJACENT_SECTOR[$SECTOR~SINDEX]
  if (($SECTOR~SECTORDATA <> "") and ($SECTOR~SECTORDATA <> 0))
    getwordpos $SECTOR~SECTORDATA $SECTOR~BEACONPOS "[0m[35mBeacon  [1;33m:"
    if ($SECTOR~BEACONPOS > 0)
      setvar $SECTOR~CONTAINSBEACON TRUE
    else
      setvar $SECTOR~CONTAINSBEACON FALSE
    end
    setvar $PLAYER~CURRENT_SECTOR $SECTOR~TARGETSECTOR
    if ($SECTOR~SINDEX = $SECTOR~ADJCOUNT)
      setvar $SECTOR~STARTING_SECTOR $SECTOR~TARGETSECTOR
    end
    gosub :GETTRADERS
    gosub :GETEMPTYSHIPS
    gosub :GETFAKETRADERS
    setvar $SECTOR~C 1
    setvar $PLAYER~ISFOUND FALSE

    while (($SECTOR~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
      if ($PLAYER~TRADERS[$SECTOR~C][1] = $PLAYER~CORP)

      elseif ((($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK) or ($PLAYER~CURRENT_SECTOR = STARDOCK)) and ($PLAYER~TRADERS[$SECTOR~C][2] = TRUE))

      elseif (($PLAYER~TARGETINGSHIP <> FALSE) and ($PLAYER~TRADERS[$SECTOR~C][3] <> TRUE))

      else
        setvar $SECTOR~ENEMY_FIGHTERS $PLAYER~TRADERS[$SECTOR~C][4]
        setvar $SECTOR~ENEMY_NAME $PLAYER~TRADERS[$SECTOR~C]
        if ($SECTOR~SAFE_ATTACK_ONLY <> TRUE)
          setvar $PLAYER~ISFOUND TRUE
        else

          setvar $SECTOR~TOO_MANY_FIGHTERS (($SHIP~SHIP_OFFENSIVE_ODDS * $PLAYER~FIGHTERS) < (($SECTOR~ENEMY_FIGHTERS + $SECTOR~TARGET_SHIELDS) * $SECTOR~TARGET_DEFENSE_ODDS))
          if (($SECTOR~SAFE_ATTACK_ONLY = TRUE) and ($SECTOR~TOO_MANY_FIGHTERS <> TRUE))
            setvar $PLAYER~ISFOUND TRUE
          else
            echo "*Safe mode active - Too many fighters on " $SECTOR~ENEMY_NAME ".  Can't attack them and survive.*"
          end
        end
        setvar $SECTOR~TARGET_IN_DEFENDER_SHIP FALSE
        if ($PLAYER~TRADERS[$SECTOR~C][1] = 100000)
          setvar $SECTOR~TARGET_IN_DEFENDER_SHIP TRUE
        end
      end
      add $SECTOR~C 1
    end
    if ($PLAYER~ISFOUND)
      if (($SECTOR~ADJCOUNT = 1) or ($SECTOR~SINDEX = $SECTOR~ADJCOUNT))
        setvar $SECTOR~SECTORTARGETFOUND TRUE
      else
        setvar $SECTOR~HOLOTARGETFOUND TRUE
      end
      goto :DONE_SCANNING
    end
  end
  subtract $SECTOR~SINDEX 1
end
:SECTOR~DONE_SCANNING

return
:SECTOR~GETEMPTYSHIPS


getwordpos $SECTOR~SECTORDATA $SECTOR~POSSHIPS "[0m[33mShips   [1m:"
if ($SECTOR~POSSHIPS > 0)
  gettext $SECTOR~SECTORDATA $SECTOR~SHIPDATA "[0m[33mShips   [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
  setvar $SECTOR~SHIPDATA $SECTOR~STARTLINE&$SECTOR~SHIPDATA
  gettext $SECTOR~SHIPDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  setvar $SECTOR~EMPTYSHIPCOUNT 0
  setvar $SECTOR~MYSHIPCOUNT 0
  while ($SECTOR~TEMP <> "")
    getlength $SECTOR~STARTLINE&$SECTOR~TEMP&$SECTOR~ENDLINE $SECTOR~LENGTH
    cuttext $SECTOR~SHIPDATA $SECTOR~SHIPDATA ($SECTOR~LENGTH + 1) 9999
    striptext $SECTOR~TEMP $SECTOR~STARTLINE
    striptext $SECTOR~TEMP "  "
    striptext $SECTOR~TEMP $SECTOR~ENDLINE
    getwordpos $SECTOR~TEMP $SECTOR~POS2 "[0;35m[[31mOwned by[35m]"
    if ($SECTOR~POS2 > 0)
      cuttext $SECTOR~TEMP $SECTOR~TEMP $SECTOR~POS2 9999
      striptext $SECTOR~TEMP "[0;35m[[31mOwned by[35m] "
      getwordpos $SECTOR~TEMP $SECTOR~POS3 ",[0;32m w/"
      cuttext $SECTOR~TEMP $SECTOR~TEMP 0 $SECTOR~POS3
      getwordpos $SECTOR~TEMP $SECTOR~POS4 "[34m[[1;36m"
      striptext $SECTOR~TEMP "[1;33m,"
      if ($SECTOR~POS4 > 0)
        cuttext $SECTOR~TEMP $SECTOR~TEMP $SECTOR~POS4 9999
        striptext $SECTOR~TEMP "[34m[[1;36m"
        striptext $SECTOR~TEMP "[0;34m]"
      end
      setvar $PLAYER~EMPTYSHIPS[($SECTOR~EMPTYSHIPCOUNT + 1)] $SECTOR~TEMP
      if (($PLAYER~EMPTYSHIPS[($SECTOR~EMPTYSHIPCOUNT + 1)] = $PLAYER~CORP) or ($PLAYER~EMPTYSHIPS[($SECTOR~EMPTYSHIPCOUNT + 1)] = $PLAYER~TRADER_NAME))
        add $SECTOR~MYSHIPCOUNT 1
      end
      add $SECTOR~EMPTYSHIPCOUNT 1
    end
    gettext $SECTOR~SHIPDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  end
else
  setvar $SECTOR~EMPTYSHIPCOUNT 0
  setvar $SECTOR~MYSHIPCOUNT 0
end
return
:SECTOR~GETFAKETRADERS


setvar $SECTOR~FEDERALSINSECTOR FALSE
setvar $SECTOR~FEDERALCOUNT 0
getwordpos $SECTOR~SECTORDATA $SECTOR~POSSHIPS "[0m[33mShips   [1m:"
getwordpos $SECTOR~SECTORDATA $SECTOR~POSTRADERS "[0m[33mTraders [1m:"
getwordpos $SECTOR~SECTORDATA $SECTOR~POSFEDERALS "[0m[33mFederals[1m:"
if ($SECTOR~POSFEDERALS > 0)
  setvar $SECTOR~FEDERALSINSECTOR TRUE
end
if ($SECTOR~POSTRADERS > 0)
  gettext $SECTOR~SECTORDATA $SECTOR~FAKEDATA "[1;32mSector  [33m:" "[0m[33mTraders [1m:"
  gosub :GRABFAKEDATA
elseif ($SECTOR~POSSHIPS > 0)
  gettext $SECTOR~SECTORDATA $SECTOR~FAKEDATA "[1;32mSector  [33m:" "[0m[33mShips   [1m:"
  gosub :GRABFAKEDATA
else
  gettext $SECTOR~SECTORDATA $SECTOR~FAKEDATA "[1;32mSector  [33m:" "[0m[1;32mWarps to Sector(s) [33m:"
  gosub :GRABFAKEDATA
end
return
:SECTOR~GRABFAKEDATA

setvar $SECTOR~FAKEDATA $SECTOR~STARTLINE&$SECTOR~FAKEDATA
gettext $SECTOR~FAKEDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
setvar $SECTOR~FAKETRADERCOUNT 0
while ($SECTOR~TEMP <> "")
  getlength $SECTOR~STARTLINE&$SECTOR~TEMP&$SECTOR~ENDLINE $SECTOR~LENGTH
  cuttext $SECTOR~FAKEDATA $SECTOR~FAKEDATA ($SECTOR~LENGTH + 1) 9999
  striptext $SECTOR~TEMP $SECTOR~STARTLINE
  striptext $SECTOR~TEMP "  "
  striptext $SECTOR~TEMP $SECTOR~ENDLINE
  getwordpos $SECTOR~TEMP $SECTOR~POS "33m,[0;32m w/ "
  if ($SECTOR~POS <= 0)
    getwordpos $SECTOR~TEMP $SECTOR~POS "[0;32mw/ "
  end
  getwordpos $SECTOR~TEMP $SECTOR~POS2 "[33m, [0;32mwith"
  getwordpos $SECTOR~TEMP $SECTOR~POS3 "[0;35m[[31mOwned by[35m]"
  getwordpos $SECTOR~TEMP $SECTOR~POS4 "[0;32mw/ "&#27&"[1;33m"
  getwordpos $SECTOR~TEMP $SECTOR~POS5 "in[36m "
  if ((($SECTOR~POS4 > 0) or ($SECTOR~POS > 0) or ($SECTOR~POS2 > 0)) and ($SECTOR~POS3 <= 0))
    setvar $PLAYER~FAKETRADERS[($SECTOR~FAKETRADERCOUNT + 1)] $SECTOR~TEMP
    getwordpos $SECTOR~TEMP $SECTOR~POSA "Zyrain"
    getwordpos $SECTOR~TEMP $SECTOR~POSB "Clausewitz"
    getwordpos $SECTOR~TEMP $SECTOR~POSC "Nelson"
    getwordpos $SECTOR~TEMP $SECTOR~POSD "Wilson"
    if (($SECTOR~POSA > 0) or ($SECTOR~POSB > 0) or ($SECTOR~POSC > 0) or ($SECTOR~POSD > 0))
      add $SECTOR~FEDERALCOUNT 1
    end
    add $SECTOR~FAKETRADERCOUNT 1
  end

  if ($SECTOR~POS5 > 0)
    gettext $SECTOR~TEMP $SECTOR~SHIPNAME "[1;31m" ")"

    if ($SECTOR~SHIPNAME = "")
      gettext $SECTOR~TEMP $SECTOR~SHIPNAME "(" ")"&#13
      gettext $SECTOR~SHIPNAME&"ENDOFSHIP" $SECTOR~SHIPNAME "m"&#27&"[" "ENDOFSHIP"
    end
    gettext $SECTOR~SHIPNAME&"ENDOFSHIP" $SECTOR~SHIPNAME "m" "ENDOFSHIP"
  end

  gettext $SECTOR~FAKEDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
end
return
:SECTOR~GETSECTORDATA


setvar $SECTOR~ENDLINE "_ENDLINE_"
setvar $SECTOR~STARTLINE "_STARTLINE_"

killalltriggers

if ($SECTOR~PASSIVE)

else
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "s"
  else
    send "*"
  end
end
setvar $SECTOR~SECTORDATA ""
:SECTOR~SECTORSLINE_CIT_KILL
setvar $SECTOR~LINE CURRENTANSILINE
setvar $SECTOR~LINE $SECTOR~STARTLINE&$SECTOR~LINE&$SECTOR~ENDLINE
setvar $SECTOR~SECTORDATA $SECTOR~SECTORDATA&$SECTOR~LINE
getwordpos $SECTOR~LINE $SECTOR~POS "Sector  [33m: "
if ($SECTOR~POS > 0)
  gettext $SECTOR~LINE $SECTOR~TEMPSECTOR "Sector  [33m: [36m" " [0;32min"
  setvar $PLAYER~CURRENT_SECTOR $SECTOR~TEMPSECTOR
end
getwordpos $SECTOR~LINE $SECTOR~POS "Warps to Sector(s) "
getword CURRENTLINE $SECTOR~CHECK 1
if (($SECTOR~POS > 0) and ($SECTOR~CHECK = "Warps"))
  goto :GOTSECTORDATA
else
  settextlinetrigger GETLINE :SECTORSLINE_CIT_KILL
end
pause
:SECTOR~GOTSECTORDATA
killtrigger GETLINE
settexttrigger NOMINES :NOMINES "Citadel command (?=help)"
settexttrigger NOMINES2 :NOMINES "Command ["
settexttrigger MINES :MINES "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause
:SECTOR~MINES

send "* "
:SECTOR~NOMINES
killtrigger NOMINES
killtrigger NOMINES2
killtrigger MINES

getwordpos $SECTOR~SECTORDATA $SECTOR~BEACONPOS "[0m[35mBeacon  [1;33m:"
if ($SECTOR~BEACONPOS > 0)
  setvar $SECTOR~CONTAINSBEACON TRUE
else
  setvar $SECTOR~CONTAINSBEACON FALSE
end
setvar $PLAYER~CURRENT_SECTOR CURRENTSECTOR
gosub :GETTRADERS
gosub :GETEMPTYSHIPS
gosub :GETFAKETRADERS
return
:SECTOR~GETTRADERS


getwordpos $SECTOR~SECTORDATA $SECTOR~POSTRADER "[0m[33mTraders [1m:"
if ($SECTOR~POSTRADER > 0)
  gettext $SECTOR~SECTORDATA $SECTOR~TRADERDATA "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) "
  setvar $SECTOR~TRADERDATA $SECTOR~STARTLINE&$SECTOR~TRADERDATA
  gettext $SECTOR~TRADERDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  setvar $SECTOR~REALTRADERCOUNT 0
  setvar $SECTOR~CORPIECOUNT 0
  setvar $SECTOR~DEFENDERSHIPS 0
  while ($SECTOR~TEMP <> "")
    getlength $SECTOR~STARTLINE&$SECTOR~TEMP&$SECTOR~ENDLINE $SECTOR~LENGTH
    cuttext $SECTOR~TRADERDATA $SECTOR~TRADERDATA ($SECTOR~LENGTH + 1) 9999
    striptext $SECTOR~TEMP $SECTOR~STARTLINE
    striptext $SECTOR~TEMP $SECTOR~ENDLINE
    striptext $SECTOR~TEMP "[0m          "
    striptext $SECTOR~TEMP "[0m[33mTraders [1m:"
    setvar $SECTOR~J 1
    setvar $SECTOR~ISFOUND FALSE

    if (($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK) or ($PLAYER~CURRENT_SECTOR = STARDOCK))
      while (($SECTOR~J < $PLAYER~RANKSLENGTH) and ($SECTOR~ISFOUND = FALSE))
        getwordpos $SECTOR~TEMP $SECTOR~POS $PLAYER~RANKS[$SECTOR~J]
        if ($SECTOR~POS > 0)
          getlength $PLAYER~RANKS[$SECTOR~J] $SECTOR~LENGTH
          cuttext $SECTOR~TEMP $SECTOR~TEMP ($SECTOR~POS + ($SECTOR~LENGTH + 1)) 9999
          if ($SECTOR~J <= 10)
            setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] TRUE
          else
            setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] FALSE
          end
          setvar $SECTOR~ISFOUND TRUE
        end
        add $SECTOR~J 1
      end
    else
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] FALSE
    end
    getwordpos $SECTOR~TEMP $SECTOR~POS "[0;32m w/"
    getwordpos $SECTOR~TEMP $SECTOR~POS2 "[0;35m[[31mOwned by[35m]"
    getwordpos $SECTOR~TEMP $SECTOR~POS3 #27&"[0m      "&#27&"[32m     in "&#27

    if (($SECTOR~POS > 0) and ($SECTOR~POS2 <= 0))
      getwordpos $SECTOR~TEMP $SECTOR~POS "[[1;36m"
      if ($SECTOR~POS > 0)
        gettext $SECTOR~TEMP $SECTOR~TEMPCORP "[[1;36m" "[0;34m]"
        striptext $SECTOR~TEMPCORP ""
      else
        setvar $SECTOR~TEMPCORP 99999
      end
      gettext $SECTOR~TEMP $SECTOR~NUMBER_OF_FIGHTERS " w/ [1;33m" "[0;32m ftrs"
      striptext $SECTOR~NUMBER_OF_FIGHTERS ","
      replacetext $SECTOR~TEMP "[0;34m" "[34m"
      getwordpos $SECTOR~TEMP $SECTOR~POS "[34m"
      cuttext $SECTOR~TEMP $SECTOR~TEMP 1 $SECTOR~POS
      striptext $SECTOR~TEMP ""
      lowercase $SECTOR~TEMP
      striptext $SECTOR~TEMP "[36m"
      striptext $SECTOR~TEMP "[31m"
      striptext $SECTOR~TEMP "36m"
      striptext $SECTOR~TEMP "31m"
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)] $SECTOR~TEMP
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][1] $SECTOR~TEMPCORP
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][4] $SECTOR~NUMBER_OF_FIGHTERS
      if ($SECTOR~TEMPCORP = $PLAYER~CORP)
        add $SECTOR~CORPIECOUNT 1
      end
      add $SECTOR~REALTRADERCOUNT 1
    end

    if (($SECTOR~POS3 > 0) and (($SECTOR~TEMPCORP <> $PLAYER~CORP) and ($PLAYER~OVERRIDE <> TRUE)))
      gettext $SECTOR~TEMP $SECTOR~SHIPNAME "(" ")"

      if ($SECTOR~SHIPNAME = "")
        gettext $SECTOR~SHIPNAME $SECTOR~SHIPNAME "(" ")"
      end

      gettext $SECTOR~SHIPNAME&"ENDOFSHIP" $SECTOR~SHIPNAME "m" "ENDOFSHIP"
      setvar $SECTOR~ISFOUND FALSE
      setvar $SECTOR~S 1
      setvar $SECTOR~ISDEFENDER FALSE
      replacetext $SECTOR~SHIPNAME ";" "m"
      striptext $SECTOR~SHIPNAME "30m"
      striptext $SECTOR~SHIPNAME "31m"
      striptext $SECTOR~SHIPNAME "32m"
      striptext $SECTOR~SHIPNAME "33m"
      striptext $SECTOR~SHIPNAME "34m"
      striptext $SECTOR~SHIPNAME "35m"
      striptext $SECTOR~SHIPNAME "36m"
      striptext $SECTOR~SHIPNAME "37m"
      striptext $SECTOR~SHIPNAME "38m"
      striptext $SECTOR~SHIPNAME "39m"
      striptext $SECTOR~SHIPNAME "40m"
      striptext $SECTOR~SHIPNAME "41m"
      striptext $SECTOR~SHIPNAME "42m"
      striptext $SECTOR~SHIPNAME "43m"
      striptext $SECTOR~SHIPNAME "44m"
      striptext $SECTOR~SHIPNAME "45m"
      striptext $SECTOR~SHIPNAME "46m"
      striptext $SECTOR~SHIPNAME "47m"
      striptext $SECTOR~SHIPNAME "[0;30;47m"
      striptext $SECTOR~SHIPNAME "[32;40m"
      striptext $SECTOR~SHIPNAME "[0;"
      striptext $SECTOR~SHIPNAME "[1;"
      striptext $SECTOR~SHIPNAME "[0m"
      striptext $SECTOR~SHIPNAME "[1m"
      striptext $SECTOR~SHIPNAME #13
      striptext $SECTOR~SHIPNAME #27
      striptext $SECTOR~SHIPNAME ""
      striptext $SECTOR~SHIPNAME "["

      if ($SHIP~SHIPCOUNTER <= 0)
        gosub :SHIP~LOADSHIPINFO
      end
      while (($SECTOR~ISFOUND = FALSE) and ($SECTOR~S < $SHIP~SHIPCOUNTER))
        striptext $SHIP~SHIPLIST[$SECTOR~S] "["
        getwordpos $SECTOR~SHIPNAME $SECTOR~POS $SHIP~SHIPLIST[$SECTOR~S]

        if ($SECTOR~POS > 0)

          setvar $SECTOR~ISFOUND TRUE
          setvar $SECTOR~ISDEFENDER $SHIP~SHIPLIST[$SECTOR~S][8]
          setvar $SECTOR~TARGET_DEFENSE_ODDS $SHIP~SHIPLIST[$SECTOR~S][2]
          setvar $SECTOR~TARGET_SHIELDS $SHIP~SHIPLIST[$SECTOR~S][1]
        end
        add $SECTOR~S 1
      end
      setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][3] $SECTOR~SHIPNAME
      if ($SECTOR~ISDEFENDER = TRUE)
        setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][1] 100000

        add $SECTOR~DEFENDERSHIPS 1
      end
      getwordpos $SECTOR~SHIPNAME $SECTOR~ISTARGETEDSHIP $PLAYER~TARGETINGSHIP
      if ($SECTOR~ISTARGETEDSHIP > 0)
        setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][3] TRUE

        add $SECTOR~TARGETEDSHIPS 1
      end
    end
    gettext $SECTOR~TRADERDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  end
else
  setvar $SECTOR~REALTRADERCOUNT 0
  setvar $SECTOR~CORPIECOUNT 0
  setvar $SECTOR~DEFENDERSHIPS 0
end
return
