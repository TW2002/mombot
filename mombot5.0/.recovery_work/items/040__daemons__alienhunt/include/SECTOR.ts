:SECTOR~GETSECTORDATA




setvar $SECTOR~ENDLINE "_ENDLINE_"
setvar $SECTOR~STARTLINE "_STARTLINE_"

killalltriggers

if ($SECTOR~PASSIVE)

else
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "s"
  else
    if ($PLAYER~FEDSPACE = TRUE)
      send "*"
    else
      send "*"
    end
  end
end
:SECTOR~STARTOVER
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
