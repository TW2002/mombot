:port~buildport
killalltriggers
gosub :player~quikstats
setvar $bot~startinglocation $player~current_prompt
setvar $port~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :bot~checkstartingprompt

if ($port~startinglocation = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  send "q"
  gosub :planet~getplanetinfo
  send "m*** cs* "
  gosub :player~quikstats
end
if (PORT.EXISTS[$player~current_sector] = TRUE)
  setvar $switchboard~message "Already a port in sector!*"
  gosub :switchboard~switchboard
  halt
end


if (($bot~user_command_line = "") or ($bot~user_command_line = 0))
  setvar $port~port_name "Mind ()ver Matter"
else
  setvar $port~port_name $bot~user_command_line
end
killalltriggers

if ($port~startinglocation = "Citadel")
  if ($player~credits < 50000)
    send "T F 50000*"
  end
end
gosub :player~quikstats
if ($player~credits < 50000)
  setvar $switchboard~message "Not Enough Credits to Make Ports*"
  gosub :switchboard~switchboard
  halt
end
send "q q q z n * o3y" $port~port_name "*"
killtrigger 1
killtrigger 2
setvar $port~fail FALSE
settextlinetrigger 1 :TOO_MANY "Sorry... All of the StarPort Licenses have been granted."
settextlinetrigger 2 :BUILD_SUCCESS "For building this Starport, you receive"
pause
:port~too_many
setvar $switchboard~message "Too many ports in the universe!*"
gosub :switchboard~switchboard
setvar $port~fail TRUE
:port~build_success
if ($port~fail = FALSE)
  setvar $switchboard~message "Port successfully created!*"
  gosub :switchboard~switchboard
end
killtrigger 1
killtrigger 2
if ($port~startinglocation = "Citadel")
  send "l "&#8&$planet~planet&"*  c  s* "
end

return
:port~destroyport

gosub :player~quikstats
setvar $bot~startinglocation $player~current_prompt
setvar $port~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :bot~checkstartingprompt

if ($port~startinglocation = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  if ($planet~planet = 0)
    send "q"
    gosub :planet~getplanetinfo
    send "m*** cs* "
    gosub :player~quikstats
  end
end
if (PORT.EXISTS[$player~current_sector] <> TRUE)
  setvar $switchboard~message "No port in sector!*"
  gosub :switchboard~switchboard
  halt
end
gosub :ship~getshipstats

if (PORT.EXISTS[$player~current_sector] = TRUE)
  :port~keepdestroying
  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  gosub :player~quikstats
  if ($player~fighters >= $ship~ship_max_attack)
    if ($port~startinglocation = "Citadel")
      send "q q q * *  "
    end
    send "p"
    settexttrigger 1 :PORTALREADYGONE "Captain! Are you sure you want to port here?"
    settexttrigger 2 :CONTINUEDESTROY "<A> Attack this Port"
    pause
    :port~continuedestroy
    killtrigger 1
    killtrigger 2
    killtrigger 3
    killtrigger 4
    send " a y "&$ship~ship_max_attack&"** "
    if ($port~startinglocation = "Citadel")
      send "l "&$planet~planet&"* m * * * q "
    end
    settexttrigger 1 :KEEPDESTROYING "Incoming laser barrage from"
    settexttrigger 2 :DONEDESTROYING "You destroyed the Star Port!"
    pause
    :port~donedestroying
    :port~portalreadygone
    send "*   "
    if ($port~startinglocation = "Citadel")
      send "l "&$planet~planet&"* c s*  "
    end
    killtrigger 1
    killtrigger 2
    killtrigger 3
    killtrigger 4

    setvar $switchboard~message "Port Destroyed.*"
    gosub :switchboard~switchboard

  else
    setvar $switchboard~message "Not enough fighters.  Better reload before the you blow up this port.*"
    gosub :switchboard~switchboard
    halt
  end
end
halt
:port~domaxport




send "o z" $port~product "z0* "
settextlinetrigger NOREALPORTHERE :WRONGPORTTYPE "Do you want to initiate construction on this port?"
settextlinetrigger CONSTRUCTION :WRONGPORTTYPE "Do you want instructions (Y/N)"
waiton ", 0 to quit)"
killalltriggers
getword CURRENTLINE $port~upgradeamount 9
striptext $port~upgradeamount "("
send "o "
if ($port~no_exp)
  while ($port~upgradeamount > 0)
    if ($port~upgradeamount > 3)
      send $port~product " " $port~noexpamount "* "
      subtract $port~upgradeamount $port~noexpamount
    else
      send $port~product " " $port~upgradeamount "* "
      subtract $port~upgradeamount $port~upgradeamount
    end
  end
  send "* * "
else
  send $port~product " " $port~upgradeamount "* * "
end
send "CR*Q"
waiton "<Computer deactivated>"
:port~donemaxport


killalltriggers
return
:port~max



killalltriggers
gosub :player~quikstats
setvar $bot~startinglocation $player~current_prompt
setvar $port~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :bot~checkstartingprompt

getwordpos " "&$bot~user_command_line&" " $port~pos " f "
if ($port~pos > 0)
  setvar $port~dofuel TRUE
end
getwordpos " "&$bot~user_command_line&" " $port~pos " o "
if ($port~pos > 0)
  setvar $port~doorg TRUE
end
getwordpos " "&$bot~user_command_line&" " $port~pos " e "
if ($port~pos > 0)
  setvar $port~doequ TRUE
end
getwordpos " "&$bot~user_command_line&" " $port~pos " noexp "
if ($port~pos > 0)
  setvar $port~no_exp TRUE
else
  setvar $port~no_exp FALSE
end
if ($port~startinglocation = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  send "s* "
  waiton "Warps to Sector(s)"
end
if (PORT.EXISTS[$player~current_sector] <> TRUE)
  setvar $switchboard~message "No port in sector!*"
  gosub :switchboard~switchboard
  halt
end


if (($port~dofuel <> TRUE) and (($port~doorg <> TRUE) and ($port~doequ <> TRUE)))
  if (PORT.BUYFUEL[$player~current_sector] = FALSE)
    setvar $port~dofuel TRUE
  end
  if (PORT.BUYORG[$player~current_sector] = TRUE)
    setvar $port~doorg TRUE
  end
  if (PORT.BUYEQUIP[$player~current_sector] = TRUE)
    setvar $port~doequ TRUE
  end
end

setvar $port~total_creds_needed 0
if (($port~startinglocation = "Planet") or ($port~startinglocation = "Citadel"))
  if ($port~startinglocation = "Citadel")
    send "q"
  end
  gosub :planet~getplanetinfo
  if ($planet~citadel > 0)
    send "cs* "
    waiton "<Enter Citadel>"
    waiton "Warps to Sector(s)"
    if (PORT.EXISTS[$player~current_sector])
      send "cr*q"
      waiton "Fuel Ore"
      getword CURRENTLINE $port~portfuel 4
      getword CURRENTLINE $port~portfuelpercent 5
      striptext $port~portfuelpercent "%"
      waiton "Organics"
      getword CURRENTLINE $port~portorg 3
      getword CURRENTLINE $port~portorgpercent 4
      striptext $port~portorgpercent "%"
      waiton "Equipment"
      getword CURRENTLINE $port~portequip 3
      getword CURRENTLINE $port~portequippercent 4
      striptext $port~portequippercent "%"
      if ($port~portequippercent <= 0)
        setvar $port~portequippercent 1
      end
      if ($port~portorgpercent <= 0)
        setvar $port~portorgpercent 1
      end
      if ($port~portfuelpercent <= 0)
        setvar $port~portfuelpercent 1
      end
      setvar $port~totalfuelupgradeneeded ((($port~port_max - (($port~portfuel * 100) / $port~portfuelpercent)) / 10) + 1)
      setvar $port~totalorgupgradeneeded ((($port~port_max - (($port~portorg * 100) / $port~portorgpercent)) / 10) + 1)
      setvar $port~totalequipupgradeneeded ((($port~port_max - (($port~portequip * 100) / $port~portequippercent)) / 10) + 1)
      setvar $port~total_creds_needed 0
      if ($port~dofuel = "f")
        add $port~total_creds_needed (300 * $port~totalfuelupgradeneeded)
      elseif ($port~doorg = "o")
        add $port~total_creds_needed (500 * $port~totalorgupgradeneeded)
      else
        add $port~total_creds_needed (1000 * $port~totalequipupgradeneeded)
      end
      if ($port~total_creds_needed > $player~credits)
        setvar $port~cashonhand $planet~citadel_credits
        add $port~cashonhand $player~credits
        if ($port~cashonhand > $port~total_creds_needed)
          if ($port~startinglocation = "Planet")
            send "C"
          end
          send "T T "&$player~credits&"* "
          send "T F "&$port~total_creds_needed&"* "
          setvar $player~credits $port~total_creds_needed
          setvar $switchboard~message "Withdrew funds from the Treasury to complete the port max*"
          gosub :switchboard~switchboard
        end
      end
    end
    send "q q"
  else
    send "q"
  end
end
setvar $port~wrong FALSE
if ($port~dofuel)
  setvar $port~product 1
  setvar $port~noexpamount 9
  gosub :DOMAXPORT
end
if ($port~doorg)
  setvar $port~product 2
  setvar $port~noexpamount 4
  gosub :DOMAXPORT
end
if ($port~doequ)
  setvar $port~product 3
  setvar $port~noexpamount 3
  gosub :DOMAXPORT
end
if (($port~startinglocation = "Citadel") or ($port~startinglocation = "Planet"))
  gosub :planet~landingsub
end
if ($port~wrong)
  setvar $switchboard~message "No valid port here.*"
  gosub :switchboard~switchboard
end
setvar $switchboard~message "Port upgrade complete.*"
gosub :switchboard~switchboard
return
:port~upgradeport


goto :MAX
:port~wrongporttype



setvar $port~wrong TRUE
goto :DONEMAXPORT
:port~shipsell




if ($player~current_sector <> STARDOCK)
  setvar $switchboard~message "Must be at StarDock, Ported or in Sector!*"
  gosub :switchboard~switchboard
  halt
end

setvar $port~i 0
setvar $port~startinglocation $player~current_prompt
striptext $port~startinglocation ">"
striptext $port~startinglocation "<"
if (($port~startinglocation <> "Command") and (($port~startinglocation <> "StarDock") and ($port~startinglocation <> "Shipyards")))
  setvar $switchboard~message "Ship Sell must be run from Command, Stardock or Shipyard prompt.*"
  gosub :switchboard~switchboard
  halt
end
if ($port~startinglocation = "Command")
  send "p ss ys *"
elseif ($port~startinglocation = "StarDock")
  send "s"
elseif ($port~startinglocation = "Shipyard")
  goto :STARTSELL
end
:port~startshipsell

setvar $port~cash $player~credits
setvar $port~inc 0
send "|S|"
waitfor "-------------------------------------------"
settextlinetrigger NOSHIP :SHIPSELLDONE "You do not own any other ships orbiting the Stardock!"
settexttrigger DONE :DONE "Choose which ship to sell (Q=Quit)"
settextlinetrigger LIBMULTILINE :LINE
pause
:port~line
getword CURRENTLINE $port~i 1
isnumber $port~tst $port~i
if ($port~tst)
  if ($port~i <> 0)
    add $port~inc 1
    setvar $port~selling[$port~inc] $port~i
  end
end
settextlinetrigger LIBMULTILINE :LINE
pause
:port~done
killalltriggers
send "  Q  "
setvar $port~i 1
if ($port~inc <> 0)
  while ($port~i <= $port~inc)
    send " S  "&$port~selling[$port~i]&"* Y  "
    waiton "You have "
    add $port~i 1
  end
end
:port~shipselldone

killalltriggers
if ($port~inc > 0)
  gosub :player~quikstats
  setvar $port~cashamount ($player~credits - $port~cash)
  gosub :COMMASIZE
  setvar $switchboard~message "You sold "&$port~inc&" ships. You made $"&$port~cashamount&" credits.*"
  gosub :switchboard~switchboard

elseif ($port~inc < 1)
  setvar $switchboard~message " No Ships to Sell.*"
  gosub :switchboard~switchboard
end
return
:port~commasize

if ($port~cashamount < 1000)

elseif ($port~cashamount < 1000000)
  getlength $port~cashamount $port~len
  setvar $port~len ($port~len - 3)
  cuttext $port~cashamount $port~tmp 1 $port~len
  cuttext $port~cashamount $port~tmp1 ($port~len + 1) 999
  setvar $port~tmp $port~tmp&","&$port~tmp1
  setvar $port~cashamount $port~tmp
elseif ($port~cashamount <= 999999999)
  getlength $port~cashamount $port~len
  setvar $port~len ($port~len - 6)
  cuttext $port~cashamount $port~tmp 1 $port~len
  setvar $port~tmp $port~tmp&","
  cuttext $port~cashamount $port~tmp1 ($port~len + 1) 3
  setvar $port~tmp $port~tmp&$port~tmp1&","
  cuttext $port~cashamount $port~tmp1 ($port~len + 4) 999
  setvar $port~tmp $port~tmp&$port~tmp1
  setvar $port~cashamount $port~tmp
end
return

halt
