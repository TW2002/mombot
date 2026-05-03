#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~MOVE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
settextlinetrigger 1 :GETSECTOR "Sector  : "
pause

:move~getsector
getword CURRENTLINE $move~cursector 3

setvar $move~history[9] $move~history[8]
setvar $move~history[8] $move~history[7]
setvar $move~history[7] $move~history[6]
setvar $move~history[6] $move~history[5]
setvar $move~history[5] $move~history[4]
setvar $move~history[4] $move~history[3]
setvar $move~history[3] $move~history[2]
setvar $move~history[2] $move~history[1]
setvar $move~history[1] $move~cursector

if ($move~extrasendall = "")
  setvar $move~extrasendall 0
end

if ($move~confirmsector = 1)

  settextlinetrigger TOLLFIGS :TOLLFIGS "You have to destroy the fighters or pay"
  settextlinetrigger FIGS :FIGS "You have to destroy the fighters to remain"
  settexttrigger MINES :MINEPROMPT "Mined Sector:"
  settexttrigger ARRIVED :ARRIVED "Command [TL="
  pause
  
  :move~tollfigs
  setvar $move~paidtoll FALSE
  if ($move~attack = 3)

    send "py"
    setvar $move~paidtoll TRUE
  else

    send "a9999*"
  end
  pause
  
  :move~figs
  send "a9999*"
  pause
  
  :move~mineprompt
  send "*"
  pause
  
  :move~arrived
  killtrigger TOLLFIGS
  killtrigger FIGS
  killtrigger MINES
else
  waiton "Command [TL="
end

getsector $move~cursector $move~cursector
setvar $move~confirmsector 0
setvar $move~found 0
setvar $move~noscan 0

gosub $move~checksub

if ($move~found = 1)
  return
end

if (($move~scanholo = 2) and ($move~noscan < 2))
  setvar $move~scannedholo 1
  send "shsd"
  waiton "Relative Density Scan"
  waiton "Command [TL="
elseif ($move~noscan = 0)
  setvar $move~scannedholo 0
  send "sd"
  waiton "Relative Density Scan"
  waiton "Command [TL="
end

getsector $move~cursector $move~cursector

:move~assess
setvar $move~i 1
setvar $move~bestscore 1000
setvar $move~bestwarp 0
setvar $move~bestattack 0
setvar $move~willholo 0

:move~testwarp
if ($move~cursector.warp[$move~i] > 0)
  setvar $move~score 0
  setvar $move~safe 1

  getsector $move~cursector.warp[$move~i] $move~thissector

  if ($move~evasion <> 2)
    if ($move~scannedholo = 0)


      if (($move~thissector.density <> 0) and ($move~thissector.density <> 100))
        if (($move~thissector.density = 5) or ($move~thissector.density = 105))
          setvar $move~safe 2
        else
          setvar $move~safe 0
        end
      end
    end
    if ($move~scannedholo = 1)


      if ($move~thissector.anomoly = "YES")

        setvar $move~safe 0
      end
      if (($move~thissector.figs.owner <> "belong to your Corp") and (($move~thissector.figs.owner <> "yours") and ($move~thissector.figs.quantity > 0)))
        if ($move~evasion = 1)
          setvar $move~safe 0
        else


          setvar $move~safe 2

          if ($move~thissector.figs.quantity > 20)
            setvar $move~safe 0
          end
        end
      end
      if ($move~thissector.density > 0)
        setvar $move~density $move~thissector.density

        if ($move~thissector.figs.quantity > 0)
          setvar $move~x $move~thissector.figs.quantity
          multiply $move~x 5
          subtract $move~density $move~x
        end

        if ((($move~density <> 100) or ($move~thissector.port.exists = 0)) and ($move~density > 0))
          setvar $move~safe 0
        end
      end
    end
  end


  if (($move~safe = 2) and ($move~evasion = 1))
    add $move~score 500
  end

  if ($move~safe = 0)
    add $move~score 500
    setvar $move~willholo 1
  end

  setvar $move~x 1
 
  :move~checkhistory
  if ($move~x <= 10)
    if ($move~history[$move~x] = $move~cursector.warp[$move~i])
      setvar $move~m 10
      subtract $move~m $move~x
      multiply $move~m 10
      add $move~score $move~m
    end
    add $move~x 1
    goto :move~checkhistory
  end

  if ($move~portpriority = 1)

    if (($move~scannedholo = 1) and ($move~thissector.port.exists = 1)) or (($move~scannedholo = 0) and ($move~thissector.density = 100))
      subtract $move~score 3
    end
  end

  if ($move~dedpriority = 1)

    if ($move~thissector.warps = 1)
      subtract $move~score 3
    end
  end

  getrnd $move~random 1 5
  add $move~score $move~random

  if ($move~score < $move~bestscore)
    setvar $move~bestscore $move~score
    setvar $move~bestwarp $move~cursector.warp[$move~i]
    setvar $move~bestsafe $move~safe
  end

  add $move~i 1
  goto :move~testwarp
end

if ($move~bestscore > 400)
  setvar $move~willholo 1
end

if (($move~willholo = 1) and (($move~scannedholo = 0) and ($move~scanholo = 1)))
  send "sh"
  waitfor "Sector  : "
  waitfor "Command [TL="
  setvar $move~scannedholo 1
  goto :move~assess
end

if (($move~bestscore > 400) and ($move~evasion = 1))
  clientmessage "No safe options!"
  halt
end

setvar $move~figcount SECTOR.FIGS.QUANTITY[$move~cursector]

if (($move~paidtoll <> TRUE) and ($move~extrasend <> ""))
  if (($move~extrasendall = 1) and (($move~cursector > 10) and ($move~cursector <> STARDOCK)))
    send $move~extrasend
  elseif (($move~figcount <= 0) and (($move~cursector > 10) and (PORT.CLASS[$move~cursector] < 9)))
    send $move~extrasend
  end
end

if ((SECTORS > 5000) or ($move~bestwarp < 600))
  setvar $move~warpsuffix "*"
else
  setvar $move~warpsuffix "."
end

if (($move~bestsafe = 2) and ($move~attack = 1)) or ($move~attack = 2)
  send $move~bestwarp $move~warpsuffix "*na9999**"
else
  send $move~bestwarp $move~warpsuffix
  setvar $move~confirmsector 1
end

goto :MOVE~MOVE

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~MOVEINTOSECTOR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $MOVE~RESULT ""
setvar $MOVE~DROPFIGS TRUE
setvar $MOVE~RESULT $MOVE~RESULT&"m "&$MOVE~MOVEINTOSECTOR&"*"
if (($MOVE~MOVEINTOSECTOR > 10) and ($MOVE~MOVEINTOSECTOR <> $MAP~STARDOCK))
  if ($PLAYER~FIGHTERS > $SHIP~SHIP_MAX_ATTACK)
    setvar $MOVE~RESULT $MOVE~RESULT&"za"&$SHIP~SHIP_MAX_ATTACK&"* * "
  else
    setvar $MOVE~RESULT $MOVE~RESULT&"za"&$PLAYER~FIGHTERS&"* * "
  end
end
if ($PLAYER~SURROUNDFIGS <= 0)
  setvar $PLAYER~SURROUNDFIGS 1
end
if (($MOVE~MOVEINTOSECTOR > 10) and ($MOVE~MOVEINTOSECTOR <> $MAP~STARDOCK))
  if ($PLAYER~SURROUNDFIGS > 0)
    setvar $MOVE~RESULT $MOVE~RESULT&"f  z  "&$PLAYER~SURROUNDFIGS&"* z  c  d  *  "
  end
  if ($PLAYER~SURROUNDLIMP > 0)
    setvar $MOVE~RESULT $MOVE~RESULT&"  H  2  Z  "&$PLAYER~SURROUNDLIMP&"*  Z C  *  "
  end
  if ($PLAYER~SURROUNDMINE > 0)
    setvar $MOVE~RESULT $MOVE~RESULT&"  H  1  Z  "&$PLAYER~SURROUNDMINE&"*  Z C  *  "
  end
end
send $MOVE~RESULT
setvar $PLAYER~CURRENT_SECTOR $MOVE~MOVEINTOSECTOR
return
