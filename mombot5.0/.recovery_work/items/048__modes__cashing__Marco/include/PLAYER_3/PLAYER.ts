:PLAYER~TWARP

setvar $PLAYER~TWARPSUCCESS FALSE
setvar $PLAYER~ORIGINAL 9999999
setvar $PLAYER~TARGET 0
if ($PLAYER~CURRENT_SECTOR = $PLAYER~WARPTO)
  setvar $PLAYER~MSG "Already in that sector!"
  goto :TWARPDONE
elseif (($PLAYER~WARPTO <= 0) or ($PLAYER~WARPTO > SECTORS))
  setvar $PLAYER~MSG "Destination sector is out of range!"
  goto :TWARPDONE
end
if ($PLAYER~TWARP_TYPE = "No")
  setvar $PLAYER~MSG "No T-warp drive on this ship!"
  goto :TWARPDONE
end
if (($PLAYER~PHOTONS > 0) and ($SETTINGS~OVERRIDE <> TRUE))
  setvar $SWITCHBOARD~MESSAGE "You can't twarp with photons without override!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $PLAYER~MSG "You can't twarp with photons without override!"
  goto :TWARPDONE
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
  gosub :FINDJUMPSECTOR
  if ($PLAYER~RED_ADJ <> 0)
    setvar $PLAYER~ORIGINAL $PLAYER~WARPTO
    setvar $PLAYER~WARPTO $PLAYER~RED_ADJ
  else
    waitfor "Command [TL="
    setvar $PLAYER~MSG "Cannot Find Jump Sector Adjacent Sector "&$PLAYER~TARGET&"."
    goto :TWARPDONE
  end
end
if ($PLAYER~RED_ADJ <> 0)
  goto :TWARP_LOCK
end
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
elseif ($PLAYER~STARTINGLOCATION = "Planet")
  send "t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
else
  if ($PLAYER~FASTTWARP)
    send "mz" $PLAYER~WARPTO "*"
  else
    send "q q q n n 0 * c u y q mz" $PLAYER~WARPTO "*"
  end
end
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$PLAYER~WARPTO&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:PLAYER~ADJ_WARP
gosub :KILLTWARPTRIGGERS
send "z*"
goto :TWARP_ADJ
:PLAYER~LOCKING
gosub :KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:PLAYER~TWARPNOFUEL
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "Not enough fuel for T-warp."
goto :TWARPDONE
:PLAYER~TWARP_ADJ
gosub :KILLTWARPTRIGGERS
send "za  "&$SHIP~SHIP_MAX_ATTACK&"* * r * "
setvar $PLAYER~MSG "That sector is next door, just plain warping."
setvar $PLAYER~TWARPSUCCESS TRUE
goto :TWARPDONE
:PLAYER~TWARPNOROUTE
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~MSG "No route available to that sector!"
goto :TWARPDONE
:PLAYER~NO_TWARP_LOCK
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $PLAYER~MSG "No fighters at T-warp point!"
goto :TWARPDONE
:PLAYER~TWARPIGD
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "My ship is being held by Interdictor!"
goto :TWARPDONE
:PLAYER~TWARPPHOTONED
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "I have been photoned and can not T-warp!"
goto :TWARPDONE
:PLAYER~TWARP_LOCK
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
send "y   *     "
setvar $PLAYER~MSG "T-warp completed."
setvar $PLAYER~TWARPSUCCESS TRUE
:PLAYER~TWARPDONE
if (($PLAYER~TWARPSUCCESS = TRUE) and (($PLAYER~ORIGINAL = $MAP~STARDOCK) or ($PLAYER~ORIGINAL <= 10)))
  send "* m "&$PLAYER~ORIGINAL&"*  za"&$SHIP~SHIP_MAX_ATTACK&"* * "
end
if ($PLAYER~TWARPSUCCESS = TRUE)
  setvar $PLAYER~CURRENT_SECTOR $PLAYER~WARPTO
end
return
:PLAYER~KILLTWARPTRIGGERS

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
