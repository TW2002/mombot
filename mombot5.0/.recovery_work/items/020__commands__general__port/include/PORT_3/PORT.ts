:PORT~UPGRADEPORT
:PORT~MAX

killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $PORT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :BOT~CHECKSTARTINGPROMPT

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PORT~POS " f "
if ($PORT~POS > 0)
  setvar $PORT~DOFUEL TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PORT~POS " o "
if ($PORT~POS > 0)
  setvar $PORT~DOORG TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PORT~POS " e "
if ($PORT~POS > 0)
  setvar $PORT~DOEQU TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PORT~POS " noexp "
if ($PORT~POS > 0)
  setvar $PORT~NO_EXP TRUE
else
  setvar $PORT~NO_EXP FALSE
end
if ($PORT~STARTINGLOCATION = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  send "s* "
  waiton "Warps to Sector(s)"
end
if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> TRUE)
  setvar $SWITCHBOARD~MESSAGE "No port in sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if (($PORT~DOFUEL <> TRUE) and (($PORT~DOORG <> TRUE) and ($PORT~DOEQU <> TRUE)))
  if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = FALSE)
    setvar $PORT~DOFUEL TRUE
  end
  if (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = TRUE)
    setvar $PORT~DOORG TRUE
  end
  if (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = TRUE)
    setvar $PORT~DOEQU TRUE
  end
end

setvar $PORT~TOTAL_CREDS_NEEDED 0
if (($PORT~STARTINGLOCATION = "Planet") or ($PORT~STARTINGLOCATION = "Citadel"))
  if ($PORT~STARTINGLOCATION = "Citadel")
    send "q"
  end
  gosub :PLANET~GETPLANETINFO
  if ($PLANET~CITADEL > 0)
    send "cs* "
    waiton "<Enter Citadel>"
    waiton "Warps to Sector(s)"
    if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR])
      send "cr*q"
      waiton "Fuel Ore"
      getword CURRENTLINE $PORT~PORTFUEL 4
      getword CURRENTLINE $PORT~PORTFUELPERCENT 5
      striptext $PORT~PORTFUELPERCENT "%"
      waiton "Organics"
      getword CURRENTLINE $PORT~PORTORG 3
      getword CURRENTLINE $PORT~PORTORGPERCENT 4
      striptext $PORT~PORTORGPERCENT "%"
      waiton "Equipment"
      getword CURRENTLINE $PORT~PORTEQUIP 3
      getword CURRENTLINE $PORT~PORTEQUIPPERCENT 4
      striptext $PORT~PORTEQUIPPERCENT "%"
      if ($PORT~PORTEQUIPPERCENT <= 0)
        setvar $PORT~PORTEQUIPPERCENT 1
      end
      if ($PORT~PORTORGPERCENT <= 0)
        setvar $PORT~PORTORGPERCENT 1
      end
      if ($PORT~PORTFUELPERCENT <= 0)
        setvar $PORT~PORTFUELPERCENT 1
      end
      setvar $PORT~TOTALFUELUPGRADENEEDED ((($PORT~PORT_MAX - (($PORT~PORTFUEL * 100) / $PORT~PORTFUELPERCENT)) / 10) + 1)
      setvar $PORT~TOTALORGUPGRADENEEDED ((($PORT~PORT_MAX - (($PORT~PORTORG * 100) / $PORT~PORTORGPERCENT)) / 10) + 1)
      setvar $PORT~TOTALEQUIPUPGRADENEEDED ((($PORT~PORT_MAX - (($PORT~PORTEQUIP * 100) / $PORT~PORTEQUIPPERCENT)) / 10) + 1)
      setvar $PORT~TOTAL_CREDS_NEEDED 0
      if ($PORT~DOFUEL = "f")
        add $PORT~TOTAL_CREDS_NEEDED (300 * $PORT~TOTALFUELUPGRADENEEDED)
      elseif ($PORT~DOORG = "o")
        add $PORT~TOTAL_CREDS_NEEDED (500 * $PORT~TOTALORGUPGRADENEEDED)
      else
        add $PORT~TOTAL_CREDS_NEEDED (1000 * $PORT~TOTALEQUIPUPGRADENEEDED)
      end
      if ($PORT~TOTAL_CREDS_NEEDED > $PLAYER~CREDITS)
        setvar $PORT~CASHONHAND $PLANET~CITADEL_CREDITS
        add $PORT~CASHONHAND $PLAYER~CREDITS
        if ($PORT~CASHONHAND > $PORT~TOTAL_CREDS_NEEDED)
          if ($PORT~STARTINGLOCATION = "Planet")
            send "C"
          end
          send "T T "&$PLAYER~CREDITS&"* "
          send "T F "&$PORT~TOTAL_CREDS_NEEDED&"* "
          setvar $PLAYER~CREDITS $PORT~TOTAL_CREDS_NEEDED
          setvar $SWITCHBOARD~MESSAGE "Withdrew funds from the Treasury to complete the port max*"
          gosub :SWITCHBOARD~SWITCHBOARD
        end
      end
    end
    send "q q"
  else
    send "q"
  end
end
setvar $PORT~WRONG FALSE
if ($PORT~DOFUEL)
  setvar $PORT~PRODUCT 1
  setvar $PORT~NOEXPAMOUNT 9
  gosub :DOMAXPORT
end
if ($PORT~DOORG)
  setvar $PORT~PRODUCT 2
  setvar $PORT~NOEXPAMOUNT 4
  gosub :DOMAXPORT
end
if ($PORT~DOEQU)
  setvar $PORT~PRODUCT 3
  setvar $PORT~NOEXPAMOUNT 3
  gosub :DOMAXPORT
end
if (($PORT~STARTINGLOCATION = "Citadel") or ($PORT~STARTINGLOCATION = "Planet"))
  gosub :PLANET~LANDINGSUB
end
if ($PORT~WRONG)
  setvar $SWITCHBOARD~MESSAGE "No valid port here.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
setvar $SWITCHBOARD~MESSAGE "Port upgrade complete.*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PORT~DOMAXPORT


send "o z" $PORT~PRODUCT "z0* "
settextlinetrigger NOREALPORTHERE :WRONGPORTTYPE "Do you want to initiate construction on this port?"
settextlinetrigger CONSTRUCTION :WRONGPORTTYPE "Do you want instructions (Y/N)"
waiton ", 0 to quit)"
killalltriggers
getword CURRENTLINE $PORT~UPGRADEAMOUNT 9
striptext $PORT~UPGRADEAMOUNT "("
send "o "
if ($PORT~NO_EXP)
  while ($PORT~UPGRADEAMOUNT > 0)
    if ($PORT~UPGRADEAMOUNT > 3)
      send $PORT~PRODUCT " " $PORT~NOEXPAMOUNT "* "
      subtract $PORT~UPGRADEAMOUNT $PORT~NOEXPAMOUNT
    else
      send $PORT~PRODUCT " " $PORT~UPGRADEAMOUNT "* "
      subtract $PORT~UPGRADEAMOUNT $PORT~UPGRADEAMOUNT
    end
  end
  send "* * "
else
  send $PORT~PRODUCT " " $PORT~UPGRADEAMOUNT "* * "
end
send "CR*Q"
waiton "<Computer deactivated>"
:PORT~DONEMAXPORT
killalltriggers
return
:PORT~WRONGPORTTYPE


setvar $PORT~WRONG TRUE
goto :DONEMAXPORT
