:MODULES~CLEAR






loadvar $GAME~GAME_MENU_PROMPT
gosub :PLAYER~QUIKSTATS
setvar $MODULES~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ((CURRENTSECTOR = $MAP~STARDOCK) or (CURRENTSECTOR <= 10))
  setvar $SWITCHBOARD~MESSAGE "Can't clear fedspace.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
end
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT

setvar $MODULES~BWARP FALSE
if ($MODULES~STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c  s*"
  if (($PLANET~PLANET_TRANSPORT >= 1) and ($PLAYER~UNLIMITEDGAME = TRUE))
    setvar $MODULES~BWARP TRUE
  end
else
  send "*"
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $MODULES~POS " bwarp "
if ($MODULES~POS > 0)
  setvar $MODULES~BWARP TRUE
end

setvar $MODULES~BEFORELIMPETS $PLAYER~LIMPETS
setvar $MODULES~BEFOREARMIDS $PLAYER~ARMIDS
setvar $MODULES~PLACEDLIMPET FALSE
setvar $MODULES~PLACEDARMID FALSE
waiton "Warps to Sector(s) :"
gosub :REFRESH_CLEAR_SECTOR_STATE
if ($MODULES~SECTORCLEAR = TRUE)
  setvar $SWITCHBOARD~MESSAGE "Current Sector Already Clear of Enemy Mines!*"
  return
end
if (($PLAYER~LIMPETS <= 0) and ($MODULES~LIMPETCOUNT > 0) and (($MODULES~LIMPETOWNER <> "belong to your Corp") and ($MODULES~LIMPETOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Need limpets to clear this sector*"
  return
end
if (($PLAYER~ARMIDS <= 0) and ($MODULES~ARMIDCOUNT > 0) and (($MODULES~ARMIDOWNER <> "belong to your Corp") and ($MODULES~ARMIDOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Need armids to clear this sector*"
  return
end
gosub :ATTEMPTCLEARINGMINES
while (($MODULES~PLACEDLIMPET = FALSE) or ($MODULES~PLACEDARMID = FALSE))
  gosub :ATTEMPTCLEARINGMINES
end
setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
setvar $SWITCHBOARD~MESSAGE "Sector Cleared*"

return
:MODULES~ATTEMPTCLEARINGMINES


killtrigger LAID_LIMP
killtrigger LAID_ARMID
setvar $MODULES~LAID_ARMID $MODULES~PLACEDARMID
setvar $MODULES~LAID_LIMP $MODULES~PLACEDLIMPET

if ($MODULES~BWARP = TRUE)
  setvar $MODULES~I 0
  setvar $MODULES~BWARP_MOVE "b"&$PLAYER~CURRENT_SECTOR&"*"
  setvar $MODULES~BWARP_CLEAR "y   *  l j"&#8&#8&#8&#8&#8&$PLANET~PLANET&"*  j  c  *  "

  if ($MODULES~RECKLESS <> TRUE)
    while ($MODULES~I <= 5)
      killtrigger 1
      killtrigger 2
      killtrigger 3
      killtrigger 4
      settexttrigger 1 :NO_BWARP_LOCK "Do you want to make this transport blind?"
      settexttrigger 2 :BWARP_LOCK "All Systems Ready, shall we engage?"
      settextlinetrigger 3 :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
      settexttrigger 4 :SWITCHTONONBWARP "Your ship was hit by a Photon and has been disabled."
      send $MODULES~BWARP_MOVE
      pause
      :MODULES~NO_BWARP_LOCK

      killalltriggers
      send "n "
      setvar $SWITCHBOARD~MESSAGE "Fighter is gone from sector!  Stopping, check for enemies!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
      :MODULES~BWARPNOFUEL

      killalltriggers
      setvar $SWITCHBOARD~MESSAGE "Not enough fuel on the planet! Stopping.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
      :MODULES~BWARP_LOCK
      send $MODULES~BWARP_CLEAR

      add $MODULES~I 1
    end
  else
    send $MODULES~BWARP_MOVE "  " $MODULES~BWARP_CLEAR $MODULES~BWARP_MOVE "  " $MODULES~BWARP_CLEAR $MODULES~BWARP_MOVE "  " $MODULES~BWARP_CLEAR $MODULES~BWARP_MOVE "  " $MODULES~BWARP_CLEAR $MODULES~BWARP_MOVE "  " $MODULES~BWARP_CLEAR
  end

  killtrigger 1
  killtrigger 2
  killtrigger 3
  if ($PLAYER~SURROUNDMINE <= 0)
    setvar $PLAYER~SURROUNDMINE 3
  end
  if ($PLAYER~SURROUNDLIMP <= 0)
    setvar $PLAYER~SURROUNDLIMP 3
  end
  setvar $MODULES~GRID_ARMIDS $PLAYER~SURROUNDMINE
  setvar $MODULES~GRID_LIMPETS $PLAYER~SURROUNDLIMP
  if ($MODULES~GRID_ARMIDS = 0)
    setvar $MODULES~_ARMIDS_ " "
    setvar $MODULES~PLACEDARMID TRUE
  else
    setvar $MODULES~_ARMIDS_ " h 1 z "&$MODULES~GRID_ARMIDS&"* z c * "
    settextlinetrigger LAID_ARMID :LAID_ARMID "Armid mine(s) on board."
  end
  if ($MODULES~GRID_LIMPETS = 0)
    setvar $MODULES~_LIMPS_ " "
    setvar $MODULES~PLACEDLIMPET TRUE
  else
    setvar $MODULES~_LIMPS_ "h 2 z "&$MODULES~GRID_LIMPETS&"* z c * "
    settextlinetrigger LAID_LIMP :LAID_LIMP "Limpet mine(s) on board."
  end

  send "q  q  "&$MODULES~_ARMIDS_&$MODULES~_LIMPS_&" l "&$PLANET~PLANET&"*  c  "

  gosub :PLAYER~QUIKSTATS
  waiton "Citadel command"

else
  :MODULES~SWITCHTONONBWARP
  setvar $MODULES~MINESTODEPLOY $MODULES~GRID_ARMIDS
  setvar $MODULES~LIMPSTODEPLOY $MODULES~GRID_LIMPETS
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_PROMPT = "Qcannon")
    send "s" $MODULES~PERCENTTOSET "* "
    gosub :PLAYER~QUIKSTATS
  end
  gosub :CLEAR_SECTOR_ATTEMPTCLEARINGMINES
  gosub :PLAYER~QUIKSTATS
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
  setvar $MODULES~LAID_ARMID TRUE
  setvar $MODULES~LAID_LIMP TRUE
  setvar $MODULES~PLACEDLIMPET TRUE
  setvar $MODULES~PLACEDARMID TRUE
end
return
:MODULES~LAID_ARMID
setvar $MODULES~LAID_ARMID TRUE
setvar $MODULES~PLACEDARMID TRUE
pause
:MODULES~LAID_LIMP
setvar $MODULES~LAID_LIMP TRUE
setvar $MODULES~PLACEDLIMPET TRUE
pause
:MODULES~REFRESH_CLEAR_SECTOR_STATE
setvar $MODULES~LIMPETOWNER SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $MODULES~ARMIDOWNER SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $MODULES~LIMPETCOUNT SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR]
setvar $MODULES~ARMIDCOUNT SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR]
setvar $MODULES~SECTORCLEAR FALSE
if ((($MODULES~LIMPETCOUNT <= 0) or (($MODULES~LIMPETOWNER = "belong to your Corp") or ($MODULES~LIMPETOWNER = "yours"))) and ((($MODULES~ARMIDCOUNT <= 0) or (($MODULES~ARMIDOWNER = "belong to your Corp") or ($MODULES~ARMIDOWNER = "yours")))))
  setvar $MODULES~SECTORCLEAR TRUE
end
return
:MODULES~CLEAR_SECTOR_ATTEMPTCLEARINGMINES

setvar $MODULES~I 0
gosub :REFRESH_CLEAR_SECTOR_STATE
while (($MODULES~I < 10) and ($MODULES~SECTORCLEAR <> TRUE))
  gosub :CLEAR_SECTOR_XENTER
  add $MODULES~I 1
  gosub :REFRESH_CLEAR_SECTOR_STATE
end
gosub :PLAYER~QUIKSTATS
gosub :CLEAR_SECTOR_DEPLOYEQUIPMENT
return
:MODULES~CLEAR_SECTOR_XENTER
if ($MODULES~STARTINGLOCATION = "Command")
  setvar $MODULES~EXIT_MAC "q y n * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *       za9999*   z*   /"
else
  setvar $MODULES~EXIT_MAC "r   y   * * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$PLANET~PLANET&"* c  /"
end
killtrigger 1
killtrigger 2
killtrigger 3
send $MODULES~EXIT_MAC
settexttrigger 1 :PICKGAME "Selection (? for menu)"
settexttrigger 2 :ENTER_CHOICE "Enter your choice:"
settexttrigger 3 :PICKGAME $GAME~GAME_MENU_PROMPT
pause
:MODULES~ENTER_CHOICE

killtrigger 1
killtrigger 2
killtrigger 3
send $MODULES~EXIT_ENTER
waiton #179

return
:MODULES~CLEAR_SECTOR_DEPLOYEQUIPMENT
if ($MODULES~STARTINGLOCATION = "Citadel")
  send "q qq z n *  "
end
if ($PLAYER~SURROUNDMINE <= 0)
  setvar $PLAYER~SURROUNDMINE 3
end
if ($PLAYER~SURROUNDLIMP <= 0)
  setvar $PLAYER~SURROUNDLIMP 3
end
if ($MODULES~MINESTODEPLOY <= 0)
  if ($PLAYER~ARMIDS < $PLAYER~SURROUNDMINE)
    setvar $MODULES~MINESTODEPLOY $PLAYER~ARMIDS
  else
    setvar $MODULES~MINESTODEPLOY $PLAYER~SURROUNDMINE
  end
end
if ($MODULES~LIMPSTODEPLOY <= 0)
  if ($PLAYER~LIMPETS < $PLAYER~SURROUNDLIMP)
    setvar $MODULES~LIMPSTODEPLOY $PLAYER~LIMPETS
  else
    setvar $MODULES~LIMPSTODEPLOY $PLAYER~SURROUNDLIMP
  end
end
setvar $MODULES~CLEARMAC ""
if (($MODULES~ARMIDOWNER <> "belong to your Corp") and ($MODULES~ARMIDOWNER <> "yours"))
  setvar $MODULES~CLEARMAC $MODULES~CLEARMAC&"h  1  z "&$MODULES~MINESTODEPLOY&"*  z c  *  "
end
if (($MODULES~LIMPETOWNER <> "belong to your Corp") and ($MODULES~LIMPETOWNER <> "yours"))
  setvar $MODULES~CLEARMAC $MODULES~CLEARMAC&"h  2  z "&$MODULES~LIMPSTODEPLOY&"*  z c  *   "
end
send $MODULES~CLEARMAC
gosub :PLAYER~QUIKSTATS
if (($MODULES~BEFORELIMPETS > $PLAYER~LIMPETS) or ($MODULES~LIMPETOWNER = "belong to your Corp") or ($MODULES~LIMPETOWNER = "yours"))
  setvar $MODULES~PLACEDLIMPET TRUE
end
if (($MODULES~BEFOREARMIDS > $PLAYER~ARMIDS) or ($MODULES~ARMIDOWNER = "belong to your Corp") or ($MODULES~ARMIDOWNER = "yours"))
  setvar $MODULES~PLACEDARMID TRUE
end
if ($MODULES~STARTINGLOCATION = "Citadel")
  send "l j"&#8&$PLANET~PLANET&"* c  "
end
return
return
:MODULES~PICKGAME

killtrigger 2
killtrigger 3
send $BOT~LETTER&"  *  "
waiton "[Pause]"
send " * "
goto :ENTER_CHOICE
:MODULES~XENTER


gosub :PLAYER~QUIKSTATS
loadvar $GAME~GAME_MENU_PROMPT
isnumber $MODULES~TEST $BOT~PARM1
if ($MODULES~TEST = FALSE)
  setvar $BOT~PARM1 1
else
  if ($BOT~PARM1 <= 0)
    setvar $BOT~PARM1 1
  end
end
getwordpos $BOT~USER_COMMAND_LINE $MODULES~POS "fill"
if ($MODULES~POS > 0)
  setvar $MODULES~REFILL TRUE
else
  setvar $MODULES~REFILL FALSE
end
setvar $MODULES~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
if ($MODULES~STARTINGLOCATION = "Citadel")
  send "q m n t *"
  gosub :PLANET~GETPLANETINFO
  send "c "
end
:MODULES~EXIT_XENTER

setvar $MODULES~I 1
if ($MODULES~STARTINGLOCATION = "Command")
  setvar $MODULES~EXIT_MAC "q y * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *       za9999*   z*   /"
else
  setvar $MODULES~EXIT_MAC "r   y   * * "
  setvar $MODULES~EXIT_ENTER " t* * *"&$BOT~PASSWORD&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$PLANET~PLANET&"* c  /"
end

while ($MODULES~I <= $BOT~PARM1)
  killtrigger 1
  killtrigger 2
  killtrigger 3
  send $MODULES~EXIT_MAC
  settexttrigger 1 :PICKGAME "Selection (? for menu)"
  settexttrigger 2 :ENTER_CHOICE_XENTER "Enter your choice:"
  settexttrigger 3 :PICKGAME $GAME~GAME_MENU_PROMPT
  pause
  :MODULES~ENTER_CHOICE_XENTER

  killtrigger 1
  killtrigger 2
  killtrigger 3
  send $MODULES~EXIT_ENTER
  waiton #179

  if ($MODULES~STARTINGLOCATION = "Command")
    if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
      if ($MODULES~REFILL = TRUE)
        gosub :PLAYER~TOPOFF
      else
        if ($MODULES~I = $BOT~PARM1)
          if ($MODULES~STARTINGLOCATION = "Command")
            send "f z1* z c d * "
          end
        end
      end
    end
  end
  add $MODULES~I 1
end
:MODULES~DONEEXITENTER

gosub :PLAYER~QUIKSTATS
if ($BOT~PARM1 > 1)
  setvar $SWITCHBOARD~MESSAGE "Exit Enter - "&$BOT~PARM1&" times completed.*"
else
  setvar $SWITCHBOARD~MESSAGE "Exit Enter.*"
end
gosub :SWITCHBOARD~SWITCHBOARD

goto :BOT~WAIT_FOR_COMMAND
:MODULES~PICKGAME
killtrigger 2
killtrigger 3
send $BOT~LETTER&"  *  "
waiton "[Pause]"
send " * "
goto :ENTER_CHOICE_XENTER
goto :BOT~WAIT_FOR_COMMAND
