:warp~warp

setvar $warp~abort 0

if ($warp~pay = 0)

  if ($move~attack = 3)
    setvar $warp~pay "Y"
  end
end

if ($warp~mode = "S")
  goto :SCAN
elseif ($warp~mode = "F")
  goto :FIGWARP
end

if ($warp~mode = "T")
  :warp~testtwarp

  send "cf*" $warp~dest "*q"
  settextlinetrigger GETDIST :GETDIST "The shortest path ("
  pause
  :warp~getdist
  getword CURRENTLINE $warp~dist 4
  striptext $warp~dist "("
  multiply $warp~dist 3


  gosub :playerinfo~infoquick

  if ($playerinfo~holds < $warp~dist)


    if ($warp~usenearfig = 2)
      setvar $warp~abort 1
      return
    else
      setvar $warp~mode "E"
      goto :WARP
    end
  end

  if ($playerinfo~ore >= $warp~dist)
    if ((SECTORS > 5000) or ($warp~dest < 600))
      send $warp~dest "*"
    else
      send $warp~dest ""
    end

    if ($warp~dist = 3)
      goto :ARRIVED
    end

    send "y"

    settextlinetrigger CANTWARP :CANTWARP "Locating beam pinpointed, TransWarp Locked."
    settextlinetrigger CANNOTTWARP :CANNOTTWARP " No locating beam found"
    pause
    :warp~cantwarp

    killtrigger CANNOTTWARP
    send "y*"
    goto :ARRIVED
    :warp~cannottwarp

    killtrigger CANTWARP
    send "n"

    if ($warp~usenearfig = 1)

      setvar $nearfig~sector $warp~dest
      gosub :nearfig~nearfig

      if ((SECTORS > 5000) or ($nearfig~nearfig < 600))
        send $nearfig~nearfig "*y"
      else
        send $nearfig~nearfig "y"
      end

      settextlinetrigger CANTWARP2 :CANTWARP2 "Locating beam pinpointed, TransWarp Locked."
      settextlinetrigger CANNOTTWARP2 :CANNOTTWARP2 " No locating beam found"
      pause
      :warp~cantwarp2

      killtrigger CANNOTTWARP2
      send "y*"
      setvar $warp~mode "E"
      goto :WARP
      :warp~cannottwarp2

      killtrigger CANTWARP2
      send "n"
      setvar $warp~mode "E"
      goto :WARP

    elseif ($warp~usenearfig = 2)

      setvar $warp~abort 1
      return
    else

      setvar $warp~mode "E"
      goto :WARP
    end
  else

    if ($warp~dist > $playerinfo~holds)
      setvar $warp~dist $playerinfo~holds
    end

    setvar $seekproduct~product 1
    setvar $seekproduct~ignorelist ""
    setvar $move~scanholo 2
    setvar $move~evasion 1
    setvar $move~portpriority 1
    gosub :seekproduct~seekproduct

    goto :TESTTWARP
  end

end
if ((SECTORS > 5000) or ($warp~dest < 600))
  send $warp~dest "*"
else
  send $warp~dest
end

settextlinetrigger ARRIVED :ARRIVED "You are already in that sector!"
settextlinetrigger BEGIN :BEGIN "<Move>"
pause
:warp~begin

killtrigger ARRIVED
settexttrigger START :START "Engage the Autopilot?"
settexttrigger TWARP :TWARP "Do you want to engage"
settextlinetrigger SINGLE :SINGLE "Sector  :"
pause
:warp~twarp

if ($warp~mode = "T")
  goto :SMARTTWARP
end
send "n"
:warp~start
send "e"
:warp~single
killtrigger START
killtrigger TWARP
killtrigger ABORT
killtrigger SINGLE

setvar $warp~stopprompt 1
setvar $warp~mineprompt 1
:warp~midwarp


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
:warp~nextsector

setvar $warp~stopprompt 1
setvar $warp~mineprompt 1
goto :MIDWARP
:warp~tollfigs

if ($warp~pay = "Y")
  send "py"
else
  send "a9999*"
end

goto :MIDWARP
:warp~figs

send "a9999*"
goto :MIDWARP
:warp~stopprompt

if ($warp~stopprompt)
  send "n"
  setvar $warp~stopprompt 0
end
goto :MIDWARP
:warp~mineprompt

if ($warp~mineprompt)
  send "n"
  setvar $warp~mineprompt 0
end
goto :MIDWARP
:warp~arrived

killtrigger ARRIVED
killtrigger NEXTSECTOR
killtrigger TOLLFIGS
killtrigger FIGS
killtrigger STOPPROMPT
killtrigger MINES
killtrigger BEGIN

setvar $warp~noavoid 0
return
:warp~scan

send "cf*" $warp~dest "*q"
waitfor "<Computer activated>"
setvar $warp~arraycount 1
:warp~nextcalcline

killtrigger GETLANE
killtrigger GOTLANE
killtrigger NOLANE
settextlinetrigger GETLANE :GETLANE " > "
settextlinetrigger GOTLANE :GOTLANE "<Computer deactivated>"
settextlinetrigger NOLANE :NOLANE "No route within"
pause
:warp~nolane


killtrigger GOTLANE
setvar $warp~noavoid 1
send "yq"
goto :SCAN
:warp~getlane

setvar $warp~count 1
killtrigger NOLANE
:warp~nextcalcsector

getword CURRENTLINE $warp~testword $warp~count
if ($warp~testword = 0)
  goto :NEXTCALCLINE
end
if ($warp~testword <> ">")
  striptext $warp~testword "("
  striptext $warp~testword ")"
  setvar $warp~sector[$warp~arraycount] $warp~testword
  add $warp~arraycount 1
end

add $warp~count 1
goto :NEXTCALCSECTOR
:warp~gotlane

setvar $warp~count $warp~arraycount
killtrigger GETLANE
killtrigger NOLANE
subtract $warp~count 1
if ($warp~sector[$warp~count] <> $warp~dest)
  add $warp~count 1
  setvar $warp~sector[$warp~count] $warp~dest
end

setvar $warp~count 1
:warp~warp
if ($warp~sector[$warp~count] = $warp~dest)
  goto :ARRIVED
end


getsector $warp~sector[$warp~count] $warp~sector

if (($warp~sector.beacon = "FedSpace, FedLaw Enforced") or ($warp~dropfig = "") or ($warp~dropfig = "N"))

  send "sd"
else
  send "f1*c" $warp~dropfig "h 2 z 3 * zc * q z * sd"
end

waitfor "Relative Density"
waitfor "Command [TL="
add $warp~count 1
if ($warp~sector[$warp~count] <> 0)
  getsector $warp~sector[$warp~count] $warp~nextsect
  if (($warp~nextsect.density <> 0) and (($warp~nextsect.density <> 5) and (($warp~nextsect.density <> 100) and (($warp~nextsect.density <> 105) and (($warp~noavoid <> 1) and (($warp~nextsect.index <> $warp~class0) and (($warp~nextsect.density <> 1) and (($warp~nextsect.density <> 101) and (($warp~nextsect.density <> 6) and (($warp~nextsect.density <> 106) and (($warp~nextsect.density <> 50) and ($warp~nextsect.index <> $warp~dest))))))))))))

    send "cv" $warp~nextsect.index "*q"
    waitfor "<Computer deactivated>"
    goto :SCAN
  end
else
  waitfor "Command [TL="
  goto :ARRIVED
end


send $warp~sector[$warp~count] "*"
waitfor "<Move>"

if (($warp~nextsect.density <> 100) and (($warp~nextsect.density <> 0) and (($warp~nextsect.density <> 1) and ($warp~nextsect.density <> 101))))

  send "za9999*"
end

setvar $warp~noavoid 0
waitfor "Command [TL="

goto :WARP
:warp~figwarp


send "cf*" $warp~dest "*q"
waiton "What is the starting sector"


settextlinetrigger GETCURSECTOR :GETCURSECTOR "Computer command [TL="
pause
:warp~getcursector
gettext CURRENTLINE $warp~cursector "]:[" "] (?="

getcourse $warp~course $warp~cursector $warp~dest

if ($warp~course = 0)

  return
end

setvar $warp~send ""
add $warp~course 1
setvar $warp~i 2

while ($warp~i <= $warp~course)
  setvar $warp~send $warp~send&$warp~course[$warp~i]

  if (($warp~course[$warp~i] < 600) or (SECTORS > 5000))
    setvar $warp~send $warp~send&"*za9999**"
  else
    setvar $warp~send $warp~send&"za9999**"
  end


  if (($warp~dropfig <> "") and (($warp~dropfig <> "N") and (($warp~course[$warp~i] <> STARDOCK) and ($warp~course[$warp~i] > 10))))
    setvar $warp~send ($warp~send and "f1*c"&$warp~dropfig&"h 2 z 3 * zc * q z *")
  end

  add $warp~i 1
end

subtract $warp~course 1
send $warp~send


waiton "Sector  : "&$warp~dest&" in "
waiton "Command [TL="

return
