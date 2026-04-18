:modules~clear






loadvar $game~game_menu_prompt
gosub :player~quikstats
setvar $modules~startinglocation $player~current_prompt
if ((CURRENTSECTOR = $map~stardock) or (CURRENTSECTOR <= 10))
  setvar $switchboard~message "Can't clear fedspace.*"
  gosub :switchboard~switchboard
  return
end
setvar $bot~validprompts "Command Citadel"
gosub :bot~checkstartingprompt

setvar $modules~bwarp FALSE
if ($modules~startinglocation = "Citadel")
  send "q"
  gosub :planet~getplanetinfo
  send "c  s*"
  if (($planet~planet_transport >= 1) and ($player~unlimitedgame = TRUE))
    setvar $modules~bwarp TRUE
  end
else
  send "*"
end
getwordpos " "&$bot~user_command_line&" " $modules~pos " bwarp "
if ($modules~pos > 0)
  setvar $modules~bwarp TRUE
end

setvar $modules~beforelimpets $player~limpets
setvar $modules~beforearmids $player~armids
setvar $modules~placedlimpet FALSE
setvar $modules~placedarmid FALSE
waiton "Warps to Sector(s) :"
gosub :REFRESH_CLEAR_SECTOR_STATE
if ($modules~sectorclear = TRUE)
  setvar $switchboard~message "Current Sector Already Clear of Enemy Mines!*"
  return
end
if (($player~limpets <= 0) and (($modules~limpetcount > 0) and (($modules~limpetowner <> "belong to your Corp") and ($modules~limpetowner <> "yours"))))
  setvar $switchboard~message "Need limpets to clear this sector*"
  return
end
if (($player~armids <= 0) and (($modules~armidcount > 0) and (($modules~armidowner <> "belong to your Corp") and ($modules~armidowner <> "yours"))))
  setvar $switchboard~message "Need armids to clear this sector*"
  return
end
gosub :ATTEMPTCLEARINGMINES
while (($modules~placedlimpet = FALSE) or ($modules~placedarmid = FALSE))
  gosub :ATTEMPTCLEARINGMINES
end
setsectorparameter $player~current_sector "LIMPSEC" TRUE
setsectorparameter $player~current_sector "MINESEC" TRUE
setvar $switchboard~message "Sector Cleared*"

return
:modules~attemptclearingmines


killtrigger LAID_LIMP
killtrigger LAID_ARMID
setvar $modules~laid_armid $modules~placedarmid
setvar $modules~laid_limp $modules~placedlimpet

if ($modules~bwarp = TRUE)
  setvar $modules~i 0
  setvar $modules~bwarp_move "b"&$player~current_sector&"*"
  setvar $modules~bwarp_clear "y   *  l j"&#8&#8&#8&#8&#8&$planet~planet&"*  j  c  *  "

  if ($modules~reckless <> TRUE)
    while ($modules~i <= 5)
      killtrigger 1
      killtrigger 2
      killtrigger 3
      killtrigger 4
      settexttrigger 1 :NO_BWARP_LOCK "Do you want to make this transport blind?"
      settexttrigger 2 :BWARP_LOCK "All Systems Ready, shall we engage?"
      settextlinetrigger 3 :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
      settexttrigger 4 :SWITCHTONONBWARP "Your ship was hit by a Photon and has been disabled."
      send $modules~bwarp_move
      pause
      :modules~no_bwarp_lock

      killalltriggers
      send "n "
      setvar $switchboard~message "Fighter is gone from sector!  Stopping, check for enemies!*"
      gosub :switchboard~switchboard
      halt
      :modules~bwarpnofuel

      killalltriggers
      setvar $switchboard~message "Not enough fuel on the planet! Stopping.*"
      gosub :switchboard~switchboard
      halt
      :modules~bwarp_lock
      send $modules~bwarp_clear

      add $modules~i 1
    end
  else
    send $modules~bwarp_move "  " $modules~bwarp_clear $modules~bwarp_move "  " $modules~bwarp_clear $modules~bwarp_move "  " $modules~bwarp_clear $modules~bwarp_move "  " $modules~bwarp_clear $modules~bwarp_move "  " $modules~bwarp_clear
  end

  killtrigger 1
  killtrigger 2
  killtrigger 3
  if ($player~surroundmine <= 0)
    setvar $player~surroundmine 3
  end
  if ($player~surroundlimp <= 0)
    setvar $player~surroundlimp 3
  end
  setvar $modules~grid_armids $player~surroundmine
  setvar $modules~grid_limpets $player~surroundlimp
  if ($modules~grid_armids = 0)
    setvar $modules~_armids_ " "
    setvar $modules~placedarmid TRUE
  else
    setvar $modules~_armids_ " h 1 z "&$modules~grid_armids&"* z c * "
    settextlinetrigger LAID_ARMID :LAID_ARMID "Armid mine(s) on board."
  end
  if ($modules~grid_limpets = 0)
    setvar $modules~_limps_ " "
    setvar $modules~placedlimpet TRUE
  else
    setvar $modules~_limps_ "h 2 z "&$modules~grid_limpets&"* z c * "
    settextlinetrigger LAID_LIMP :LAID_LIMP "Limpet mine(s) on board."
  end

  send "q  q  "&$modules~_armids_&$modules~_limps_&" l "&$planet~planet&"*  c  "

  gosub :player~quikstats
  waiton "Citadel command"

else
  :modules~switchtononbwarp
  setvar $modules~minestodeploy $modules~grid_armids
  setvar $modules~limpstodeploy $modules~grid_limpets
  gosub :player~quikstats
  if ($player~current_prompt = "Qcannon")
    send "s" $modules~percenttoset "* "
    gosub :player~quikstats
  end
  gosub :CLEAR_SECTOR_ATTEMPTCLEARINGMINES
  gosub :player~quikstats
  setsectorparameter $player~current_sector "MINESEC" TRUE
  setsectorparameter $player~current_sector "LIMPSEC" TRUE
  setvar $modules~laid_armid TRUE
  setvar $modules~laid_limp TRUE
  setvar $modules~placedlimpet TRUE
  setvar $modules~placedarmid TRUE
end
return
:modules~laid_armid
setvar $modules~laid_armid TRUE
setvar $modules~placedarmid TRUE
pause
:modules~laid_limp
setvar $modules~laid_limp TRUE
setvar $modules~placedlimpet TRUE
pause
:modules~refresh_clear_sector_state
setvar $modules~limpetowner SECTOR.LIMPETS.OWNER[$player~current_sector]
setvar $modules~armidowner SECTOR.MINES.OWNER[$player~current_sector]
setvar $modules~limpetcount SECTOR.LIMPETS.QUANTITY[$player~current_sector]
setvar $modules~armidcount SECTOR.MINES.QUANTITY[$player~current_sector]
setvar $modules~sectorclear FALSE
if ((($modules~limpetcount <= 0) or ($modules~limpetowner = "belong to your Corp") or ($modules~limpetowner = "yours")) and (($modules~armidcount <= 0) or ($modules~armidowner = "belong to your Corp") or ($modules~armidowner = "yours")))
  setvar $modules~sectorclear TRUE
end
return
:modules~clear_sector_attemptclearingmines

setvar $modules~i 0
gosub :REFRESH_CLEAR_SECTOR_STATE
while (($modules~i < 10) and ($modules~sectorclear <> TRUE))
  gosub :CLEAR_SECTOR_XENTER
  add $modules~i 1
  gosub :REFRESH_CLEAR_SECTOR_STATE
end
gosub :player~quikstats
gosub :CLEAR_SECTOR_DEPLOYEQUIPMENT
return
:modules~clear_sector_xenter
if ($modules~startinglocation = "Command")
  setvar $modules~exit_mac "q y n * "
  setvar $modules~exit_enter " t* * *"&$bot~password&"*    *    *       za9999*   z*   /"
else
  setvar $modules~exit_mac "r   y   * * "
  setvar $modules~exit_enter " t* * *"&$bot~password&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$planet~planet&"* c  /"
end
killtrigger 1
killtrigger 2
killtrigger 3
send $modules~exit_mac
settexttrigger 1 :PICKGAME "Selection (? for menu)"
settexttrigger 2 :ENTER_CHOICE "Enter your choice:"
settexttrigger 3 :PICKGAME $game~game_menu_prompt
pause
:modules~enter_choice

killtrigger 1
killtrigger 2
killtrigger 3
send $modules~exit_enter
waiton #179

return
:modules~clear_sector_deployequipment
if ($modules~startinglocation = "Citadel")
  send "q qq z n *  "
end
if ($player~surroundmine <= 0)
  setvar $player~surroundmine 3
end
if ($player~surroundlimp <= 0)
  setvar $player~surroundlimp 3
end
if ($modules~minestodeploy <= 0)
  if ($player~armids < $player~surroundmine)
    setvar $modules~minestodeploy $player~armids
  else
    setvar $modules~minestodeploy $player~surroundmine
  end
end
if ($modules~limpstodeploy <= 0)
  if ($player~limpets < $player~surroundlimp)
    setvar $modules~limpstodeploy $player~limpets
  else
    setvar $modules~limpstodeploy $player~surroundlimp
  end
end
setvar $modules~clearmac ""
if (($modules~armidowner <> "belong to your Corp") and ($modules~armidowner <> "yours"))
  setvar $modules~clearmac $modules~clearmac&"h  1  z "&$modules~minestodeploy&"*  z c  *  "
end
if (($modules~limpetowner <> "belong to your Corp") and ($modules~limpetowner <> "yours"))
  setvar $modules~clearmac $modules~clearmac&"h  2  z "&$modules~limpstodeploy&"*  z c  *   "
end
send $modules~clearmac
gosub :player~quikstats
if (($modules~beforelimpets > $player~limpets) or ($modules~limpetowner = "belong to your Corp") or ($modules~limpetowner = "yours"))
  setvar $modules~placedlimpet TRUE
end
if (($modules~beforearmids > $player~armids) or ($modules~armidowner = "belong to your Corp") or ($modules~armidowner = "yours"))
  setvar $modules~placedarmid TRUE
end
if ($modules~startinglocation = "Citadel")
  send "l j"&#8&$planet~planet&"* c  "
end
return
return
:modules~pickgame

killtrigger 2
killtrigger 3
send $bot~letter&"  *  "
waiton "[Pause]"
send " * "
goto :ENTER_CHOICE
:modules~xenter


gosub :player~quikstats
loadvar $game~game_menu_prompt
isnumber $modules~test $bot~parm1
if ($modules~test = FALSE)
  setvar $bot~parm1 1
else
  if ($bot~parm1 <= 0)
    setvar $bot~parm1 1
  end
end
getwordpos $bot~user_command_line $modules~pos "fill"
if ($modules~pos > 0)
  setvar $modules~refill TRUE
else
  setvar $modules~refill FALSE
end
setvar $modules~startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel"
gosub :bot~checkstartingprompt
if ($modules~startinglocation = "Citadel")
  send "q m n t *"
  gosub :planet~getplanetinfo
  send "c "
end
:modules~exit_xenter

setvar $modules~i 1
if ($modules~startinglocation = "Command")
  setvar $modules~exit_mac "q y * "
  setvar $modules~exit_enter " t* * *"&$bot~password&"*    *    *       za9999*   z*   /"
else
  setvar $modules~exit_mac "r   y   * * "
  setvar $modules~exit_enter " t* * *"&$bot~password&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$planet~planet&"* c  /"
end

while ($modules~i <= $bot~parm1)
  killtrigger 1
  killtrigger 2
  killtrigger 3
  send $modules~exit_mac
  settexttrigger 1 :PICKGAME "Selection (? for menu)"
  settexttrigger 2 :ENTER_CHOICE_XENTER "Enter your choice:"
  settexttrigger 3 :PICKGAME $game~game_menu_prompt
  pause
  :modules~enter_choice_xenter

  killtrigger 1
  killtrigger 2
  killtrigger 3
  send $modules~exit_enter
  waiton #179

  if ($modules~startinglocation = "Command")
    if (($player~current_sector > 10) and ($player~current_sector <> $map~stardock))
      if ($modules~refill = TRUE)
        gosub :player~topoff
      else
        if ($modules~i = $bot~parm1)
          if ($modules~startinglocation = "Command")
            send "f z1* z c d * "
          end
        end
      end
    end
  end
  add $modules~i 1
end
:modules~doneexitenter

gosub :player~quikstats
if ($bot~parm1 > 1)
  setvar $switchboard~message "Exit Enter - "&$bot~parm1&" times completed.*"
else
  setvar $switchboard~message "Exit Enter.*"
end
gosub :switchboard~switchboard

goto :bot~wait_for_command
:modules~pickgame
killtrigger 2
killtrigger 3
send $bot~letter&"  *  "
waiton "[Pause]"
send " * "
goto :ENTER_CHOICE_XENTER
goto :bot~wait_for_command
