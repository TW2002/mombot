:WARP~WARP






































setvar $WARP~ABORT 0

if ($WARP~PAY = 0)

  if ($MOVE~ATTACK = 3)
    setvar $WARP~PAY "Y"
  end
end

if ($WARP~MODE = "S")
  goto :SCAN
elseif ($WARP~MODE = "F")
  goto :FIGWARP
end

if ($WARP~MODE = "T")
  :WARP~TESTTWARP

  send "cf*" $WARP~DEST "*q"
  settextlinetrigger GETDIST :GETDIST "The shortest path ("
  pause
  :WARP~GETDIST
  getword CURRENTLINE $WARP~DIST 4
  striptext $WARP~DIST "("
  multiply $WARP~DIST 3


  gosub :PLAYERINFO~INFOQUICK

  if ($PLAYERINFO~HOLDS < $WARP~DIST)


    if ($WARP~USENEARFIG = 2)
      setvar $WARP~ABORT 1
      return
    else
      setvar $WARP~MODE "E"
      goto :WARP
    end
  end

  if ($PLAYERINFO~ORE >= $WARP~DIST)
    if ((SECTORS > 5000) or ($WARP~DEST < 600))
      send $WARP~DEST "*"
    else
      send $WARP~DEST ""
    end

    if ($WARP~DIST = 3)
      goto :ARRIVED
    end

    send "y"

    settextlinetrigger CANTWARP :CANTWARP "Locating beam pinpointed, TransWarp Locked."
    settextlinetrigger CANNOTTWARP :CANNOTTWARP " No locating beam found"
    pause
    :WARP~CANTWARP

    killtrigger CANNOTTWARP
    send "y*"
    goto :ARRIVED
    :WARP~CANNOTTWARP

    killtrigger CANTWARP
    send "n"

    if ($WARP~USENEARFIG = 1)

      setvar $NEARFIG~SECTOR $WARP~DEST
      gosub :NEARFIG~NEARFIG

      if ((SECTORS > 5000) or ($NEARFIG~NEARFIG < 600))
        send $NEARFIG~NEARFIG "*y"
      else
        send $NEARFIG~NEARFIG "y"
      end

      settextlinetrigger CANTWARP2 :CANTWARP2 "Locating beam pinpointed, TransWarp Locked."
      settextlinetrigger CANNOTTWARP2 :CANNOTTWARP2 " No locating beam found"
      pause
      :WARP~CANTWARP2

      killtrigger CANNOTTWARP2
      send "y*"
      setvar $WARP~MODE "E"
      goto :WARP
      :WARP~CANNOTTWARP2

      killtrigger CANTWARP2
      send "n"
      setvar $WARP~MODE "E"
      goto :WARP

    elseif ($WARP~USENEARFIG = 2)

      setvar $WARP~ABORT 1
      return
    else

      setvar $WARP~MODE "E"
      goto :WARP
    end
  else

    if ($WARP~DIST > $PLAYERINFO~HOLDS)
      setvar $WARP~DIST $PLAYERINFO~HOLDS
    end

    setvar $SEEKPRODUCT~PRODUCT 1
    setvar $SEEKPRODUCT~IGNORELIST ""
    setvar $MOVE~SCANHOLO 2
    setvar $MOVE~EVASION 1
    setvar $MOVE~PORTPRIORITY 1
    gosub :SEEKPRODUCT~SEEKPRODUCT

    goto :TESTTWARP
  end

end
if ((SECTORS > 5000) or ($WARP~DEST < 600))
  send $WARP~DEST "*"
else
  send $WARP~DEST
end

settextlinetrigger ARRIVED :ARRIVED "You are already in that sector!"
settextlinetrigger BEGIN :BEGIN "<Move>"
pause
:WARP~BEGIN

killtrigger ARRIVED
settexttrigger START :START "Engage the Autopilot?"
settexttrigger TWARP :TWARP "Do you want to engage"
settextlinetrigger SINGLE :SINGLE "Sector  :"
pause
:WARP~TWARP

if ($WARP~MODE = "T")
  goto :SMARTTWARP
end
send "n"
:WARP~START
send "e"
:WARP~SINGLE
killtrigger START
killtrigger TWARP
killtrigger ABORT
killtrigger SINGLE

setvar $WARP~STOPPROMPT 1
setvar $WARP~MINEPROMPT 1
:WARP~MIDWARP


killtrigger TOLLFIGS
killtrigger FIGS
killtrigger STOPPROMPT
killtrigger MINES
killtrigger NEXTSECTOR
killtrigger ARRIVED
settextlinetrigger NEXTSECTOR :NEXTSECTOR "Sector  :"
settextlinetrigger TOLLFIGS :TOLLFIGS "You have to destroy the fighters or pay"
settextlinetrigger FIGS :FIGS "You have to destroy the fighters to remain"
settexttrigger STOPPROMPT :STOPPROMPT "Stop in this sector"
settexttrigger MINES :MINEPROMPT "Mined Sector:"
settexttrigger ARRIVED :ARRIVED "Command [TL="
pause
:WARP~NEXTSECTOR

setvar $WARP~STOPPROMPT 1
setvar $WARP~MINEPROMPT 1
goto :MIDWARP
:WARP~TOLLFIGS

if ($WARP~PAY = "Y")
  send "py"
else
  send "a9999*"
end

goto :MIDWARP
:WARP~FIGS

send "a9999*"
goto :MIDWARP
:WARP~STOPPROMPT

if ($WARP~STOPPROMPT)
  send "n"
  setvar $WARP~STOPPROMPT 0
end
goto :MIDWARP
:WARP~MINEPROMPT

if ($WARP~MINEPROMPT)
  send "n"
  setvar $WARP~MINEPROMPT 0
end
goto :MIDWARP
:WARP~ARRIVED

killtrigger ARRIVED
killtrigger NEXTSECTOR
killtrigger TOLLFIGS
killtrigger FIGS
killtrigger STOPPROMPT
killtrigger MINES
killtrigger BEGIN

setvar $WARP~NOAVOID 0
return
:WARP~SCAN

send "cf*" $WARP~DEST "*q"
waitfor "<Computer activated>"
setvar $WARP~ARRAYCOUNT 1
:WARP~NEXTCALCLINE

killtrigger GETLANE
killtrigger GOTLANE
killtrigger NOLANE
settextlinetrigger GETLANE :GETLANE " > "
settextlinetrigger GOTLANE :GOTLANE "<Computer deactivated>"
settextlinetrigger NOLANE :NOLANE "No route within"
pause
:WARP~NOLANE


killtrigger GOTLANE
setvar $WARP~NOAVOID 1
send "yq"
goto :SCAN
:WARP~GETLANE

setvar $WARP~COUNT 1
killtrigger NOLANE
:WARP~NEXTCALCSECTOR

getword CURRENTLINE $WARP~TESTWORD $WARP~COUNT
if ($WARP~TESTWORD = 0)
  goto :NEXTCALCLINE
end
if ($WARP~TESTWORD <> ">")
  striptext $WARP~TESTWORD "("
  striptext $WARP~TESTWORD ")"
  setvar $WARP~SECTOR[$WARP~ARRAYCOUNT] $WARP~TESTWORD
  add $WARP~ARRAYCOUNT 1
end

add $WARP~COUNT 1
goto :NEXTCALCSECTOR
:WARP~GOTLANE

setvar $WARP~COUNT $WARP~ARRAYCOUNT
killtrigger GETLANE
killtrigger NOLANE
subtract $WARP~COUNT 1
if ($WARP~SECTOR[$WARP~COUNT] <> $WARP~DEST)
  add $WARP~COUNT 1
  setvar $WARP~SECTOR[$WARP~COUNT] $WARP~DEST
end

setvar $WARP~COUNT 1
:WARP~WARP
if ($WARP~SECTOR[$WARP~COUNT] = $WARP~DEST)
  goto :ARRIVED
end


getsector $WARP~SECTOR[$WARP~COUNT] $WARP~SECTOR

if (($WARP~SECTOR.BEACON = "FedSpace, FedLaw Enforced") or ($WARP~DROPFIG = "") or ($WARP~DROPFIG = "N"))

  send "sd"
else
  send "f1*c" $WARP~DROPFIG "sd"
end

waitfor "Relative Density"
waitfor "Command [TL="
add $WARP~COUNT 1
if ($WARP~SECTOR[$WARP~COUNT] <> 0)
  getsector $WARP~SECTOR[$WARP~COUNT] $WARP~NEXTSECT
  if (($WARP~NEXTSECT.DENSITY <> 0) and (($WARP~NEXTSECT.DENSITY <> 5) and (($WARP~NEXTSECT.DENSITY <> 100) and (($WARP~NEXTSECT.DENSITY <> 105) and (($WARP~NOAVOID <> 1) and (($WARP~NEXTSECT.INDEX <> $WARP~CLASS0) and (($WARP~NEXTSECT.DENSITY <> 1) and (($WARP~NEXTSECT.DENSITY <> 101) and (($WARP~NEXTSECT.DENSITY <> 6) and (($WARP~NEXTSECT.DENSITY <> 106) and (($WARP~NEXTSECT.DENSITY <> 50) and ($WARP~NEXTSECT.INDEX <> $WARP~DEST))))))))))))

    send "cv" $WARP~NEXTSECT.INDEX "*q"
    waitfor "<Computer deactivated>"
    goto :SCAN
  end
else
  waitfor "Command [TL="
  goto :ARRIVED
end


send $WARP~SECTOR[$WARP~COUNT] "*"
waitfor "<Move>"

if (($WARP~NEXTSECT.DENSITY <> 100) and (($WARP~NEXTSECT.DENSITY <> 0) and (($WARP~NEXTSECT.DENSITY <> 1) and ($WARP~NEXTSECT.DENSITY <> 101))))

  send "za9999*"
end

setvar $WARP~NOAVOID 0
waitfor "Command [TL="

goto :WARP
:WARP~FIGWARP


send "cf*" $WARP~DEST "*q"
waiton "What is the starting sector"


settextlinetrigger GETCURSECTOR :GETCURSECTOR "Computer command [TL="
pause
:WARP~GETCURSECTOR
gettext CURRENTLINE $WARP~CURSECTOR "]:[" "] (?=Help)?"

getcourse $WARP~COURSE $WARP~CURSECTOR $WARP~DEST

if ($WARP~COURSE = 0)

  return
end

setvar $WARP~SEND ""
add $WARP~COURSE 1
setvar $WARP~I 2

while ($WARP~I <= $WARP~COURSE)
  setvar $WARP~SEND $WARP~SEND&$WARP~COURSE[$WARP~I]

  if (($WARP~COURSE[$WARP~I] < 600) or (SECTORS > 5000))
    setvar $WARP~SEND $WARP~SEND&"*za9999**"
  else
    setvar $WARP~SEND $WARP~SEND&"za9999**"
  end


  if (($WARP~DROPFIG <> "") and (($WARP~DROPFIG <> "N") and (($WARP~COURSE[$WARP~I] <> STARDOCK) and ($WARP~COURSE[$WARP~I] > 10))))
    setvar $WARP~SEND $WARP~SEND&"f1*c"&$WARP~DROPFIG
  end

  add $WARP~I 1
end

subtract $WARP~COURSE 1
send $WARP~SEND


waiton "Sector  : "&$WARP~DEST&" in "
waiton "Command [TL="

return
