# SECTOR.TS -- Gets data about the current sector and adjacent sectors, including traders, fake traders, empty ships, and beacons.
#
# External routines:
# :sector~getsectordata
# :sector~getautosectordata
# :sector~getavoids
# :sector~setavoids

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~GETAVOIDS
# Written by Shadow
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
if ($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $switchboard~message "You must be at the Citadel or Command prompt to get avoids.*"
  gosub :switchboard~switchboard
  halt
end
setvar $SECTOR~AVOIDCOUNT 0
setarray $SECTOR~AVOIDS SECTORS
send "cx"
waiton "<List Avoided Sectors>"
:avoidloop
settexttrigger endavoid :endavoid "Computer command"
settextlinetrigger endavoid2 :endavoid "No Sectors are currently"
settextlinetrigger gotavoids :gotavoids " "
pause
:gotavoids
killalltriggers
setvar $aline CURRENTLINE
:avoidloop2
getwordpos $aline $pos " "
#echo "aline: " $aline "*"
if ($pos < 1)
	goto :avoidlast
end
if ($pos = 1)
	cuttext $aline $aline2 2 999
	setvar $aline $aline2
	goto :avoidloop2
end
#echo "aline: " $aline "*"
getword $aline $sect 1
#echo "gotsect: " $sect "*"
add $SECTOR~AVOIDCOUNT 1
setvar $SECTOR~AVOIDS[$SECTOR~AVOIDCOUNT] $sect
getwordpos $aline $pos " "
if ($pos < 1)
	goto :avoidlast
end
cuttext $aline $aline2 $pos 999
setvar $aline $aline2
goto :avoidloop2
:avoidlast
add $SECTOR~AVOIDCOUNT 1
setvar $SECTOR~AVOIDS[$SECTOR~AVOIDCOUNT] $aline
goto :avoidloop
:endavoid
killalltriggers
send "q"
settexttrigger sector_avoids_command :SECTOR~AVOIDS_PROMPT "Command [TL"
settexttrigger sector_avoids_citadel :SECTOR~AVOIDS_PROMPT "Citadel command"
pause
:SECTOR~AVOIDS_PROMPT
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~SETAVOIDS
# Written by Shadow
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($SECTOR~AVOIDCOUNT = 0)
  return
end
if ($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $switchboard~message "You must be at the Citadel or Command prompt to set avoids.*"
  gosub :switchboard~switchboard
  halt
end
send "^"
waiton ": "
setvar $i 0
while ($i < $SECTOR~AVOIDCOUNT)
  add $i 1
  send "S" & $SECTOR~AVOIDS[$i] & "*"
end
send "Q"
setvar $SECTOR~AVOIDS 0
setvar $SECTOR~AVOIDCOUNT 0
waiton ": ENDINTERROG"
return

# Moved from :player and reworked by Shadow to be more user friendly and efficient
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~VOIDADJACENT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :SECTOR~GETAVOIDS
getsector $PLAYER~CURRENT_SECTOR $SECTORINFO
if ($SECTORINFO.WARP[1] = 0)
  setvar $switchboard~message "This sector has no warps, maybe you need to scan it first.*"
  gosub :switchboard~switchboard
  halt
else
  setvar $VOIDSECT 0
  send "^"
  waiton ": "
  :VOIDS
  add $VOIDSECT 1
  if ($VOIDSECT < 7)
    if ($SECTORINFO.WARP[$VOIDSECT] <> 0)
      send "S"&$SECTORINFO.WARP[$VOIDSECT]&"*"
    end
    goto :VOIDS
  end
  send "Q"
  waiton ": ENDINTERROG"
end
return

# Moved from :player and reworked by Shadow to be more user friendly and efficient
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~CLEARVOIDADJACENT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :player~quikstats
if ($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel")
	setvar $switchboard~message "You must be at the Citadel or Command prompt to clear avoids.*"
	gosub :switchboard~switchboard
	return
end
if ($SECTOR~AVOIDCOUNT > 0)
	send "cv0*yyq"
	waiton "<Computer deactivated>"
	gosub :SECTOR~SETAVOIDS
else
	getsector $PLAYER~CURRENT_SECTOR $SECTORINFO
	if ($SECTORINFO.WARP[1] = 0)
		setvar $switchboard~message "This sector has no warps, maybe you need to scan it first.*"
		gosub :switchboard~switchboard
		return
	end
	setvar $VOIDSECT 0
	send "^"
	waiton ": "
	while ($VOIDSECT < 7)
		add $VOIDSECT 1
		if ($SECTORINFO.WARP[$VOIDSECT] <> 0)
			send "C"&$SECTORINFO.WARP[$VOIDSECT]&"*"
		end
	end
	send "Q"
	waiton ": ENDINTERROG"
end
return

##################################################################################################################################
# GETBACKDOOR routine by Shadow
:SECTOR~GETBACKDOOR
##################################################################################################################################

loadvar $MAP~STARDOCK
setvar $ISDOCK FALSE
if ($SECTOR~DESTINATION = $MAP~STARDOCK)
  if ($MAP~STARDOCK > 10) and (SECTOR.WARPCOUNT[$MAP~STARDOCK] = 6)
    setvar $ISDOCK TRUE
  else
    setvar $SWITCHBOARD~MESSAGE "Unable to determine backdoor because stardock is not set correctly.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    return
  end
end

#setVar $validPrompts "Command Citadel"
#gosub :player~getcurrentprompt
#getWordPos " "&$validPrompts&" " $bot~pos $PLAYER~CURRENT_PROMPT
#if ($bot~pos <= 0)
#  setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$validPrompts&"]*"
#  gosub :SWITCHBOARD~switchboard
#  return
#end

if ($SECTOR~DESTINATION = 0)
  setvar $switchboard~message "Unable to determine backdoor because destination is not set.*"
  gosub :switchboard~switchboard
  return
else
  isnumber $tst $SECTOR~DESTINATION
  if ($tst = FALSE)
    setvar $switchboard~message "Unable to determine backdoor because destination is not a number.*"
    gosub :switchboard~switchboard
    return
  end
end

#setdeafclients TRUE

if (SECTOR.WARPCOUNT[$SECTOR~DESTINATION] = 0)
  send "^I"
  waiton ": "
  send "Q"
  waiton ": ENDINTERROG"
end

gosub :sector~getavoids

send "^"
setvar $i 1
while ($i <= SECTOR.WARPCOUNT[$SECTOR~DESTINATION])
  send "S" & SECTOR.WARPS[$SECTOR~DESTINATION][$i] & "*"
  add $i 1
end
send "Q"
waiton " ENDINTERROG"
setVar $SECTOR~BACKDOOR 0
if ($SECTOR~DESTINATION < 10)
  send "cf11*" & $SECTOR~destination & "*"
else
  send "cf1*" & $SECTOR~destination & "*"
end
setTextLineTrigger void1 :void1 "The shortest path" 
setTextLineTrigger nopath :nopath "Error - No route within "
pause

:nopath
killAllTriggers
send "y"
goto :ENDGETBACKDOOR

:void1
killAllTriggers
setTextTrigger voiddone :voiddone "Computer command [TL"
setTextLineTrigger void2 :void2 ">" 
pause
:void2
setvar $lastline CURRENTLINE
setTextLineTrigger void2 :void2 " > "
pause
:voiddone
killalltriggers
#echo "*lastline: [" $lastline "]*"
splittext $lastline $sects " > "
setvar $i ($sects - 1)
setvar $SECTOR~BACKDOOR $sects[$i]
striptext $SECTOR~BACKDOOR " "
striptext $SECTOR~BACKDOOR "("
striptext $SECTOR~BACKDOOR ")"
if ($ISDOCK = TRUE)
  setvar $MAP~BACKDOOR $SECTOR~BACKDOOR
  savevar $MAP~BACKDOOR
end
:ENDGETBACKDOOR
send "q"
if ($SECTOR~AVOIDCOUNT > 0)
  gosub :sector~setavoids
else
  send "cv0*yyq"
  waiton "Avoided sectors Cleared."
end
#setdeafclients FALSE
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~GETSECTORDATA
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SECTOR~ENDLINE "_ENDLINE_"
setvar $SECTOR~STARTLINE "_STARTLINE_"
killalltriggers

if ($SECTOR~PASSIVE = FALSE)
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "s"
  else
    send "*"
  end
end

setvar $SECTOR~SECTORDATA ""
:SECTORSLINE_CIT_KILL
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

:GOTSECTORDATA
killtrigger GETLINE
settexttrigger NOMINES :NOMINES "Citadel command (?=help)"
settexttrigger NOMINES2 :NOMINES "Command ["
settexttrigger MINES :MINES "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause

:MINES
send "* "
:NOMINES
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

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SECTOR~GETAUTOSECTORDATA
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SECTOR~ENDLINE "_ENDLINE_"
setvar $SECTOR~STARTLINE "_STARTLINE_"
setarray $SECTOR~ADJACENT 7
setarray $SECTOR~ADJACENT_SECTOR 7
setvar $SECTOR~ADJCOUNT 1
killalltriggers

:STARTOVER
setvar $SECTOR~SECTORDATA ""
setvar $SECTOR~FIRST TRUE

:AUTO_SECTORSLINE_CIT_KILL
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

:GOTAUTOSECTORDATA
settexttrigger NOMINES :NOMINESAUTO "Citadel command (?=help)"
settexttrigger NOMINES2 :NOMINESAUTO "Command ["
settexttrigger MINES :MINESAUTO "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause

:MINESAUTO
send "* "
:NOMINESAUTO
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

:DONE_SCANNING
return

:GETEMPTYSHIPS
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

:GETFAKETRADERS
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

:GRABFAKEDATA
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

:GETTRADERS
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

include "source\include\ship"
include "source\include\player"
