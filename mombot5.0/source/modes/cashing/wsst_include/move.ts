:move~move












settextlinetrigger 1 :GETSECTOR "Sector  : "
send "d"
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
    goto :CHECKHISTORY
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
  goto :TESTWARP
end

if ($move~bestscore > 400)
  setvar $move~willholo 1
end

if (($move~willholo = 1) and (($move~scannedholo = 0) and ($move~scanholo = 1)))
  send "sh"
  waitfor "Sector  : "
  waitfor "Command [TL="
  setvar $move~scannedholo 1
  goto :ASSESS
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
goto :MOVE
:move~moveintosector



setvar $move~result ""
setvar $move~dropfigs TRUE
setvar $move~result $move~result&"m "&$move~moveintosector&"*"
if (($move~moveintosector > 10) and ($move~moveintosector <> $map~stardock))
  if ($player~fighters > $ship~ship_max_attack)
    setvar $move~result $move~result&"za"&$ship~ship_max_attack&"* * "
  else
    setvar $move~result $move~result&"za"&$player~fighters&"* * "
  end
end
if ($player~surroundfigs <= 0)
  setvar $player~surroundfigs 1
end
if (($move~moveintosector > 10) and ($move~moveintosector <> $map~stardock))
  if ($player~surroundfigs > 0)
    setvar $move~result $move~result&"f  z  "&$player~surroundfigs&"* z  c  d  *  "
  end
  if ($player~surroundlimp > 0)
    setvar $move~result $move~result&"  H  2  Z  "&$player~surroundlimp&"*  Z C  *  "
  end
  if ($player~surroundmine > 0)
    setvar $move~result $move~result&"  H  1  Z  "&$player~surroundmine&"*  Z C  *  "
  end
end
send $move~result
setvar $player~current_sector $move~moveintosector
return
:move~mow




loadvar $player~fighter_deploy_type
loadvar $player~surroundfigs
loadvar $player~surroundlimp
loadvar $player~surroundmine
setvar $move~success FALSE

gosub :player~quikstats
gosub :ship~getshipstats
setvar $player~startinglocation $player~current_prompt
if ($player~startinglocation = "Command")
  setvar $player~ondock 0
end



if ($player~startinglocation = "Citadel")
  send "q q "
elseif ($player~startinglocation = "Planet")
  send "q "
elseif ($player~startinglocation = "<StarDock>")
  send "q "
elseif ($player~startinglocation <> "Command")
  setvar $switchboard~message "Bad starting prompt, cannot mow!*"
  gosub :switchboard~switchboard
  return
end







if ($ship~ship_max_attack <= 0)
  setvar $ship~ship_max_attack 99991111
end

isnumber $move~number $move~target
if ($move~number <> 1)
  setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
  gosub :switchboard~switchboard
  return
end
if (($move~target <= 0) or ($move~target > SECTORS))
  setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
  gosub :switchboard~switchboard
  return
end
if ($ship~ship_max_attack > $player~fighters)
  setvar $ship~ship_max_attack 9999
end

gosub :player~getcourse
gosub :player~quikstats
setvar $player~starting_point $player~current_sector
setvar $player~destination $move~target
gosub :player~getcourse
setvar $move~j 2
setvar $move~macro "q q q * "

while ($move~j <= $player~courselength)
  subtract $player~turns $move~tpw
  setvar $move~macro $move~macro&"m  "&$player~course[$move~j]&"*   "
  if (($player~course[$move~j] > 10) and ($player~course[$move~j] <> $map~stardock))
    setvar $move~macro $move~macro&"za  "&$ship~ship_max_attack&"* *  "
  end
  if (($player~course[$move~j] > 10) and (($player~course[$move~j] <> $map~stardock) and ($move~j > 1)))
    if (($player~surroundfigs > 0) and ($player~fighters > 50))
      setvar $move~macro $move~macro&"f "&$player~surroundfigs&" * c d "
      setvar $player~target $player~course[$move~j]
      gosub :player~addfigtodata
    end
    if (($player~surroundmine > 0) and ($player~armids > 0))
      setvar $move~macro $move~macro&"  H  1  Z  "&$player~surroundmine&"*  Z C  *  "
      setvar $player~target $player~course[$move~j]
    end

    if (($player~surroundlimp > 0) and ($player~limpets > 0))
      setvar $move~macro $move~macro&"  H  2  Z  "&$player~surroundlimp&"*  Z C  *  "
      setvar $player~target $player~course[$move~j]
    end
  end

  if (($move~called = FALSE) and (($move~saveme = TRUE) and ($move~j >= ($player~courselength - 2))))
    setvar $move~macro $move~macro&"'"&$move~msec&"=saveme*  "
    setvar $move~called TRUE
  end
  add $move~j 1
end

send $move~macro

killalltriggers
gosub :player~quikstats

if ($player~current_prompt = "Planet")
  send "m * * * c s* "
end

if (($player~current_prompt = "<StarDock>") or ($player~current_prompt = "<Hardware"))
  setvar $switchboard~message "Safely on Stardock*"
  gosub :switchboard~switchboard
  setvar $move~success TRUE
end

if ($player~current_sector <> $move~target)
  setvar $switchboard~message "Mow did not reach destination!*"
  gosub :switchboard~switchboard
  return
end
setvar $switchboard~message "Mow completed.*"
gosub :switchboard~switchboard
setvar $move~success TRUE


return
:move~twarp



setvar $player~twarpsuccess FALSE
setvar $player~original 9999999
setvar $player~target 0

while ($player~current_sector = $player~warpto)
  setvar $player~msg "Already in that sector!"
  goto :TWARPDONE
end
if (($player~warpto <= 0) or ($player~warpto > SECTORS))
  setvar $player~msg "Destination sector is out of range!"
  goto :TWARPDONE
end
if ($player~twarp_type = "No")
  setvar $player~msg "No T-warp drive on this ship!"
  goto :TWARPDONE
end
if (($player~photons > 0) and ($player~override <> TRUE))
  setvar $switchboard~message "You can't twarp with photons without override!*"
  gosub :switchboard~switchboard
  setvar $player~msg "You can't twarp with photons without override!"
  goto :TWARPDONE
end
loadvar $ship~ship_max_attack
if ($ship~ship_max_attack = 0)
  setvar $ship~ship_max_attack 9999
end
if (($player~fighters > 0) and ($player~fighters < $ship~ship_max_attack))
  setvar $ship~ship_max_attack $player~fighters
end
getdistance $move~dist $player~current_sector $player~warpto
if ($move~dist = 1)
  setvar $move~moveintosector $player~warpto
  gosub :move~moveintosector
  gosub :player~quikstats
  if ($player~current_sector = $player~warpto)
    setvar $player~msg "Adjacent warp completed."
    setvar $player~twarpsuccess TRUE
  else
    setvar $player~msg "Adjacent warp did not reach destination."
  end
  goto :TWARPDONE
elseif ($move~dist <= 0)
  setvar $player~msg "No known route to destination."
  goto :TWARPDONE
end

setvar $player~weareadjdock FALSE
if (($player~warpto = $map~stardock) or ($player~warpto <= 10))
  setvar $player~target $player~warpto
  setvar $player~a 1
  setvar $player~start_sector $player~current_sector
  while ($player~a <= SECTOR.WARPCOUNT[$player~start_sector])
    setvar $player~adj_start SECTOR.WARPS[$player~start_sector][$player~a]
    if ($player~adj_start = $player~target)
      setvar $player~weareadjdock TRUE
    end
    add $player~a 1
  end
end
setvar $player~red_adj 0
if (($player~alignment < 1000) and ((($player~weareadjdock = FALSE) and (($player~warpto = $map~stardock) or ($player~warpto <= 10)))))
  setvar $player~target $player~warpto
  gosub :FINDJUMPSECTOR
  if ($player~red_adj <> 0)
    setvar $player~original $player~warpto
    setvar $player~warpto $player~red_adj
  else
    waitfor "Command [TL="
    setvar $player~msg "Cannot Find Jump Sector Adjacent Sector "&$player~target&"."
    goto :TWARPDONE
  end
end
gosub :player~currentprompt
gosub :KILLTWARPTRIGGERS
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$player~warpto&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
settexttrigger AUTOPILOT :TWARPAUTOPILOT "Engage the Autopilot?"

if ($player~red_adj <> 0)
  send "* mz" $player~warpto "*"
else
  if ($player~ondock = 1)

    send "q q * mz" $player~warpto "*"
    setvar $player~ondock 0
  elseif ($player~current_prompt = "Citadel")

    send "q t*t1* q q * mz" $player~warpto "*"
  elseif ($player~current_prompt = "Planet")

    send "t*t1* q q * mz" $player~warpto "*"
  else
    if ($player~fasttwarp)
      send "mz" $player~warpto "*"
    else
      send "* mz" $player~warpto "*"
    end
  end
end
pause
:move~adj_warp

gosub :KILLTWARPTRIGGERS
send "z*"
goto :TWARP_ADJ
:move~locking

gosub :KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
settexttrigger AUTOPILOT :TWARPAUTOPILOT "Engage the Autopilot?"
pause
:move~twarpnofuel

gosub :KILLTWARPTRIGGERS
setvar $player~msg "Not enough fuel for T-warp."
goto :TWARPDONE
:move~twarp_adj

gosub :KILLTWARPTRIGGERS
send "za  "&$ship~ship_max_attack&"* * r * "
setvar $player~msg "That sector is next door, just plain warping."
setvar $player~twarpsuccess TRUE
goto :TWARPDONE
:move~twarpnoroute

gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $player~msg "No route available to that sector!"
goto :TWARPDONE
:move~twarpautopilot

gosub :KILLTWARPTRIGGERS
send "n"
setvar $player~msg "AutoPilot refused during T-warp."
goto :TWARPDONE
:move~no_twarp_lock

gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" FALSE
setvar $player~msg "No fighters at T-warp point!"
goto :TWARPDONE
:move~twarpigd

gosub :KILLTWARPTRIGGERS
setvar $player~msg "My ship is being held by Interdictor!"
goto :TWARPDONE
:move~twarpphotoned

gosub :KILLTWARPTRIGGERS
setvar $player~msg "I have been photoned and can not T-warp!"
goto :TWARPDONE
:move~twarp_lock

gosub :KILLTWARPTRIGGERS
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" TRUE
send "y   *     "
setvar $player~msg "T-warp completed."
setvar $player~twarpsuccess TRUE
:move~twarpdone

if (($player~twarpsuccess = TRUE) and (($player~original = $map~stardock) or ($player~original <= 10)))
  send "* m "&$player~original&"*  za"&$ship~ship_max_attack&"* * "
end
if ($player~twarpsuccess = TRUE)
  setvar $player~current_sector $player~warpto
end
return
:move~killtwarptriggers

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger AUTOPILOT
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
return
:move~bwarp



setvar $player~bwarpsuccess FALSE

send "b"
settexttrigger NOBWARP :NOBWARP "Would you like to place a subspace order for one? "
settexttrigger YESBWARP :YESBWARP "Beam to what sector? (U="
settexttrigger IGBWARP :BWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
pause
:move~nobwarp

gosub :KILLBWARPTRIGGERS
send "*"
setvar $player~msg "No Bwarp installed on this planet*"

return
:move~yesbwarp

gosub :KILLBWARPTRIGGERS
send $player~warpto&"*"
settexttrigger BWARP_LOCK :BWARP_NO_RANGE "This planetary transporter does not have the range."
settexttrigger NO_BWRP_LOCK :NO_BWARP_LOCK "Do you want to make this transport blind?"
settexttrigger BWARP_READY :BWARP_LOCK "All Systems Ready, shall we engage?"
settexttrigger BWARP_AVOID :BWARP_AVOID "Do you really want to transport there?"
settextlinetrigger NO_BWARPFUEL :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
pause
:move~bwarp_no_range

gosub :KILLBWARPTRIGGERS
setvar $player~msg "Not enough range on this planet's transporter.*"

return
:move~no_bwarp_lock

gosub :KILLBWARPTRIGGERS
send "* "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" FALSE
setvar $player~msg "No fighter down at that destination, aborting*"

return
:move~bwarp_avoid

gosub :KILLBWARPTRIGGERS
send "* "
setvar $player~target $player~warpto

setvar $player~msg "Sector is avoided, aborting*"

return
:move~bwarp_lock

gosub :KILLBWARPTRIGGERS
send "y     * "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" TRUE


setvar $player~bwarpsuccess TRUE
return
:move~bwarpnofuel

gosub :KILLBWARPTRIGGERS
setvar $player~msg "Not enough fuel on the planet to make the transport!*"

return
:move~bwarpphotoned

gosub :KILLBWARPTRIGGERS
setvar $player~msg "I have been photoned and can not B-warp!*"

return
:move~killbwarptriggers

killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
return
:move~findjumpsector



setvar $player~red_adj 0
if ($player~startinglocation = "Citadel")
  send "qt*t1*q* "
else
  send "qq* "
end

setvar $player~k 1
while (SECTOR.BACKDOORS[$player~target][$player~k] > 0)
  setvar $player~red_adj SECTOR.BACKDOORS[$player~target][$player~k]

  if (($player~red_adj > 11) and (((SECTOR.FIGS.QUANTITY[$player~red_adj] > 0) and ((SECTOR.FIGS.OWNER[$player~red_adj] = "belong to your Corp") or (SECTOR.FIGS.OWNER[$player~red_adj] = "yours")))))
    gosub :TEST_RED_SECTOR
    if ($player~foundsector = TRUE)
      goto :SECTORLOCKED
    end
  end
  add $player~k 1
end

setvar $player~i 1
while (SECTOR.WARPSIN[$player~target][$player~i] > 0)
  setvar $player~red_adj SECTOR.WARPSIN[$player~target][$player~i]
  gosub :TEST_RED_SECTOR
  if ($player~foundsector = TRUE)
    goto :SECTORLOCKED
  end
  add $player~i 1
end
:move~noadjsfound

setvar $player~red_adj 0
return
:move~sectorlocked

if ($player~target = $map~stardock)
  setvar $map~backdoor $player~red_adj
  savevar $map~backdoor
end
return
:move~test_red_sector




setvar $player~foundsector FALSE
send "m "&$player~red_adj&"* y"
settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
settexttrigger TWARPAUTOPILOT :TWARPFINDAUTOPILOT "Engage the Autopilot?"
pause
:move~twarpadj

gosub :KILLFINDJUMPSECTORS
send " * "
waitfor "Command [TL="
return
:move~twarpvoided

gosub :KILLFINDJUMPSECTORS
send " N N "
waitfor "Command [TL="
return
:move~twarplocked

gosub :KILLFINDJUMPSECTORS
send " * "
waitfor "Command [TL="
setvar $player~foundsector TRUE
return
:move~twarpblind

gosub :KILLFINDJUMPSECTORS
send " N "
waitfor "Command [TL="
return
:move~twarpfindautopilot

gosub :KILLFINDJUMPSECTORS
send " N "
waitfor "Command [TL="
return
:move~killfindjumpsectors

killtrigger TWARPBLIND
killtrigger TWARPLOCKED
killtrigger TWARPVOIDED
killtrigger TWARPADJ
killtrigger TWARPAUTOPILOT
return
