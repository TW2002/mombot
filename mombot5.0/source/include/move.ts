# MOVE.TS -- Movement related functions and subroutines.
#
# Exposed routines:
#
# :move~move - Automated adjacent movement.
# :move~moveintosector - Build and send a direct move/deploy macro.
# :move~twarp - Warp to a sector, with checking for range, fighter lock, and fuel.
# :move~findjumpsector - Find a legal adjacent jump sector for red Stardock/fedspace movement.
# :move~test_red_sector - Probe whether a red-adjacent sector can be t-warped to.
#
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

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~MOW
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

loadvar $PLAYER~FIGHTER_DEPLOY_TYPE
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
setvar $MOVE~SUCCESS FALSE

gosub :PLAYER~QUIKSTATS
gosub :ship~getshipstats
setVar $player~startinglocation $PLAYER~CURRENT_PROMPT

# uses $bot~startinglocation in mow.ts command

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

# uses $player~startingsector as starting sector
# uses $player~destination as destination sector
# $figsToDrop
# $doholo
# $backdoormow

if ($SHIP~SHIP_MAX_ATTACK <= 0)
	setVar $SHIP~SHIP_MAX_ATTACK 99991111
end

isNumber $number $MOVE~TARGET
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	return
elseif (($MOVE~TARGET <= 0) OR ($MOVE~TARGET > SECTORS))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	return
end

if ($SHIP~SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
	setVar $SHIP~SHIP_MAX_ATTACK 9999
end

gosub :player~getcourse
gosub :player~quikstats
setvar $player~starting_point $player~current_sector
setvar $player~destination $move~target
gosub :player~getcourse
setVar $j 2
setVar $macro "q q q * "

while ($j <= $player~courseLength)
	subtract $player~turns $TPW
	setVar $macro $macro&"m  "&$player~course[$j]&"*   "
	if (($player~course[$j] > 10) AND ($player~course[$j] <> $MAP~STARDOCK))
		setVar $macro $macro&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *  "
	end
	if (($player~course[$j] > 10) AND ($player~course[$j] <> $MAP~STARDOCK) AND ($j > 2))
		if ($PLAYER~SURROUNDFIGS > 0) and ($PLAYER~FIGHTERS > 50)
      setVar $macro $macro&"f "&$PLAYER~SURROUNDFIGS&" * c d "
		  setVar $player~target $player~course[$j]
		  gosub :player~addFigToData
    end
    if ($PLAYER~SURROUNDMINE > 0) and ($PLAYER~ARMIDS > 0)
      setVar $macro $macro&"  H  1  Z  "&$PLAYER~SURROUNDMINE&"*  Z C  *  "
      setVar $player~target $player~course[$j]
      #gosub :player~addArmidToData
    end
    if ($PLAYER~SURROUNDLIMP > 0) and ($PLAYER~LIMPETS > 0)
      setVar $macro $macro&"  H  2  Z  "&$PLAYER~SURROUNDLIMP&"*  Z C  *  "
      setVar $player~target $player~course[$j]
      #gosub :player~addLimpetToData
    end
  end
	if (($called = FALSE) AND ($move~saveme = TRUE) AND ($j >= ($player~courseLength-2)))
		setVar $macro $macro&"'"&$msec&"=saveme*  "
		setVar $move~called TRUE
	end
	add $j 1
end

send $macro

killalltriggers
gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT = "Planet")
	send "m * * * c s* "
end

if (($PLAYER~CURRENT_PROMPT = "<StarDock>") OR ($PLAYER~CURRENT_PROMPT = "<Hardware"))
	setvar $switchboard~message "Safely on Stardock*"
	gosub :switchboard~switchboard
	setvar $MOVE~SUCCESS TRUE
end

if ($PLAYER~CURRENT_SECTOR <> $move~target)
	setvar $switchboard~message "Mow did not reach destination!*"
	gosub :switchboard~switchboard
	return
else
	setvar $switchboard~message "Mow completed.*"
	gosub :switchboard~switchboard
	setvar $MOVE~SUCCESS TRUE
end

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~TWARP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~TWARPSUCCESS FALSE
setvar $PLAYER~ORIGINAL 9999999
setvar $PLAYER~TARGET 0

if ($PLAYER~CURRENT_SECTOR = $PLAYER~WARPTO)
  setvar $PLAYER~MSG "Already in that sector!"
  goto :MOVE~TWARPDONE
elseif (($PLAYER~WARPTO <= 0) or ($PLAYER~WARPTO > SECTORS))
  setvar $PLAYER~MSG "Destination sector is out of range!"
  goto :MOVE~TWARPDONE
end
if ($PLAYER~TWARP_TYPE = "No")
  setvar $PLAYER~MSG "No T-warp drive on this ship!"
  goto :MOVE~TWARPDONE
end
if (($PLAYER~PHOTONS > 0) and ($PLAYER~OVERRIDE <> TRUE))
  setvar $SWITCHBOARD~MESSAGE "You can't twarp with photons without override!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $PLAYER~MSG "You can't twarp with photons without override!"
  goto :MOVE~TWARPDONE
end
loadvar $SHIP~SHIP_MAX_ATTACK
if ($SHIP~SHIP_MAX_ATTACK = 0)
  setvar $SHIP~SHIP_MAX_ATTACK 9999
end
if (($PLAYER~FIGHTERS > 0) and ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK))
  setvar $SHIP~SHIP_MAX_ATTACK $PLAYER~FIGHTERS
end

setvar $PLAYER~WEAREADJDOCK FALSE
if (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  setvar $PLAYER~A 1
  setvar $PLAYER~START_SECTOR $PLAYER~CURRENT_SECTOR
  while ($PLAYER~A <= SECTOR.WARPCOUNT[$PLAYER~START_SECTOR])
    setvar $PLAYER~ADJ_START SECTOR.WARPS[$PLAYER~START_SECTOR][$PLAYER~A]
    if ($PLAYER~ADJ_START = $PLAYER~TARGET)
      setvar $PLAYER~WEAREADJDOCK TRUE
    end
    add $PLAYER~A 1
  end
end
setvar $PLAYER~RED_ADJ 0
if (($PLAYER~ALIGNMENT < 1000) and ((($PLAYER~WEAREADJDOCK = FALSE) and (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10)))))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  gosub :MOVE~FINDJUMPSECTOR
  if ($PLAYER~RED_ADJ <> 0)
    setvar $PLAYER~ORIGINAL $PLAYER~WARPTO
    setvar $PLAYER~WARPTO $PLAYER~RED_ADJ
  else
    waitfor "Command [TL="
    setvar $PLAYER~MSG "Cannot Find Jump Sector Adjacent Sector "&$PLAYER~TARGET&"."
    goto :MOVE~TWARPDONE
  end
end
if ($PLAYER~RED_ADJ <> 0)
  send "* mz" $PLAYER~WARPTO "*"
else
  if ($PLAYER~ONDOCK = 1)
#    send "q q * c u y q mz" $PLAYER~WARPTO "*"
    send "q q * mz" $PLAYER~WARPTO "*"
    setvar $PLAYER~ONDOCK 0
  elseif ($PLAYER~STARTINGLOCATION = "Citadel")
#    send "q t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
    send "q t*t1* q q * mz" $PLAYER~WARPTO "*"
  elseif ($PLAYER~STARTINGLOCATION = "Planet")
#    send "t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
     send "t*t1* q q * mz" $PLAYER~WARPTO "*"
  else
    if ($PLAYER~FASTTWARP)
      send "mz" $PLAYER~WARPTO "*"
    else
      send "q q q n n 0 * c u y q mz" $PLAYER~WARPTO "*"
    end
  end
end

# Added by Shadow 5/13/24
settextlinetrigger TWARPSTART :TWARPSTART "That Warp Lane is not adjacent."
pause

:TWARPSTART
settexttrigger THERE :MOVE~ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :MOVE~ADJ_WARP "Sector  : "&$PLAYER~WARPTO&" "
settexttrigger LOCKING :MOVE~LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :MOVE~TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :MOVE~TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :MOVE~TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :MOVE~TWARPNOFUEL "You do not have enough Fuel Ore"
pause

:MOVE~ADJ_WARP
gosub :MOVE~KILLTWARPTRIGGERS
send "z*"
goto :MOVE~TWARP_ADJ

:MOVE~LOCKING
gosub :MOVE~KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :MOVE~TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :MOVE~NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :MOVE~TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :MOVE~TWARPNOFUEL "You do not have enough Fuel Ore"
pause

:MOVE~TWARPNOFUEL
gosub :MOVE~KILLTWARPTRIGGERS
setvar $PLAYER~MSG "Not enough fuel for T-warp."
goto :MOVE~TWARPDONE

:MOVE~TWARP_ADJ
gosub :MOVE~KILLTWARPTRIGGERS
send "za  "&$SHIP~SHIP_MAX_ATTACK&"* * r * "
setvar $PLAYER~MSG "That sector is next door, just plain warping."
setvar $PLAYER~TWARPSUCCESS TRUE
goto :MOVE~TWARPDONE

:MOVE~TWARPNOROUTE
gosub :MOVE~KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~MSG "No route available to that sector!"
goto :MOVE~TWARPDONE

:MOVE~NO_TWARP_LOCK
gosub :MOVE~KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $PLAYER~MSG "No fighters at T-warp point!"
goto :MOVE~TWARPDONE

:MOVE~TWARPIGD
gosub :MOVE~KILLTWARPTRIGGERS
setvar $PLAYER~MSG "My ship is being held by Interdictor!"
goto :MOVE~TWARPDONE

:MOVE~TWARPPHOTONED
gosub :MOVE~KILLTWARPTRIGGERS
setvar $PLAYER~MSG "I have been photoned and can not T-warp!"
goto :MOVE~TWARPDONE

:MOVE~TWARP_LOCK
gosub :MOVE~KILLTWARPTRIGGERS
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
send "y   *     "
setvar $PLAYER~MSG "T-warp completed."
setvar $PLAYER~TWARPSUCCESS TRUE

:MOVE~TWARPDONE
if (($PLAYER~TWARPSUCCESS = TRUE) and (($PLAYER~ORIGINAL = $MAP~STARDOCK) or ($PLAYER~ORIGINAL <= 10)))
  send "* m "&$PLAYER~ORIGINAL&"*  za"&$SHIP~SHIP_MAX_ATTACK&"* * "
end
if ($PLAYER~TWARPSUCCESS = TRUE)
  setvar $PLAYER~CURRENT_SECTOR $PLAYER~WARPTO
end
return

:MOVE~KILLTWARPTRIGGERS
killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~FINDJUMPSECTOR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~RED_ADJ 0
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "qt*t1*q* "
else
  send "qq* "
end

setvar $PLAYER~K 1
while (SECTOR.BACKDOORS[$PLAYER~TARGET][$PLAYER~K] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.BACKDOORS[$PLAYER~TARGET][$PLAYER~K]
  gosub :MOVE~TEST_RED_SECTOR
  if ($PLAYER~FOUNDSECTOR = TRUE)
    goto :MOVE~SECTORLOCKED
  end
  add $PLAYER~K 1
end

setvar $PLAYER~I 1
while (SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I]
  gosub :MOVE~TEST_RED_SECTOR
  if ($PLAYER~FOUNDSECTOR = TRUE)
    goto :MOVE~SECTORLOCKED
  end
  add $PLAYER~I 1
end

:MOVE~NOADJSFOUND
setvar $PLAYER~RED_ADJ 0
return

:MOVE~SECTORLOCKED
if ($PLAYER~TARGET = $MAP~STARDOCK)
  setvar $MAP~BACKDOOR $PLAYER~RED_ADJ
  savevar $MAP~BACKDOOR
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MOVE~TEST_RED_SECTOR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

setvar $PLAYER~FOUNDSECTOR FALSE
send "m "&$PLAYER~RED_ADJ&"* y"
settexttrigger TWARPBLIND :MOVE~TWARPBLIND "Do you want to make this jump blind? "
settexttrigger TWARPLOCKED :MOVE~TWARPLOCKED "All Systems Ready, shall we engage? "
settextlinetrigger TWARPVOIDED :MOVE~TWARPVOIDED "Danger Warning Overridden"
settextlinetrigger TWARPADJ :MOVE~TWARPADJ "<Set NavPoint>"
pause

:MOVE~TWARPADJ
gosub :MOVE~KILLFINDJUMPSECTORS
send " * "
return

:MOVE~TWARPVOIDED
gosub :MOVE~KILLFINDJUMPSECTORS
send " N N "
return

:MOVE~TWARPLOCKED
gosub :MOVE~KILLFINDJUMPSECTORS
send " * "
setvar $PLAYER~FOUNDSECTOR TRUE
return

:MOVE~TWARPBLIND
gosub :MOVE~KILLFINDJUMPSECTORS
send " N "
return

:MOVE~KILLFINDJUMPSECTORS
killtrigger TWARPBLIND
killtrigger TWARPLOCKED
killtrigger TWARPVOIDED
killtrigger TWARPADJ
return

include "source\include\switchboard"
include "source\include\player"
include "source\include\ship"
