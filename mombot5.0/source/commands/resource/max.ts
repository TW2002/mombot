
logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE


setvar $HELP~HELP[1] $HELP~TAB&"Upgrades a port product as much as possible.  "
setvar $HELP~HELP[2] $HELP~TAB&"         "
setvar $HELP~HELP[3] $HELP~TAB&"Options: "
setvar $HELP~HELP[4] $HELP~TAB&"{noexp} - Upgrades port without experience increase."
gosub :HELP~HELPFILE
:MAXPORT
:MAX




killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command Planet"
gosub :PLAYER~CHECKSTARTINGPROMPT
if (($BOT~PARM1 <> "f") and (($BOT~PARM1 <> "o") and ($BOT~PARM1 <> "e")))
  send "'{" $SWITCHBOARD~BOT_NAME "} - maxport [f / o / e] noexp*"
  halt
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " f "
if ($POS > 0)
  setvar $DOFUEL TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " o "
if ($POS > 0)
  setvar $DOORG TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " e "
if ($POS > 0)
  setvar $DOEQU TRUE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " noexp "
if ($POS > 0)
  setvar $NO_EXP TRUE
else
  setvar $NO_EXP FALSE
end
setvar $TOTAL_CREDS_NEEDED 0
if (($STARTINGLOCATION = "Planet") or ($STARTINGLOCATION = "Citadel"))
  if ($STARTINGLOCATION = "Citadel")
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
      getword CURRENTLINE $PORTFUEL 4
      getword CURRENTLINE $PORTFUELPERCENT 5
      striptext $PORTFUELPERCENT "%"
      waiton "Organics"
      getword CURRENTLINE $PORTORG 3
      getword CURRENTLINE $PORTORGPERCENT 4
      striptext $PORTORGPERCENT "%"
      waiton "Equipment"
      getword CURRENTLINE $PORTEQUIP 3
      getword CURRENTLINE $PORTEQUIPPERCENT 4
      striptext $PORTEQUIPPERCENT "%"
      if ($PORTEQUIPPERCENT <= 0)
        setvar $PORTEQUIPPERCENT 1
      end
      if ($PORTORGPERCENT <= 0)
        setvar $PORTORGPERCENT 1
      end
      if ($PORTFUELPERCENT <= 0)
        setvar $PORTFUELPERCENT 1
      end
      setvar $TOTALFUELUPGRADENEEDED ((($PORT_MAX - (($PORTFUEL * 100) / $PORTFUELPERCENT)) / 10) + 1)
      setvar $TOTALORGUPGRADENEEDED ((($PORT_MAX - (($PORTORG * 100) / $PORTORGPERCENT)) / 10) + 1)
      setvar $TOTALEQUIPUPGRADENEEDED ((($PORT_MAX - (($PORTEQUIP * 100) / $PORTEQUIPPERCENT)) / 10) + 1)
      setvar $TOTAL_CREDS_NEEDED 0
      if ($DOFUEL = "f")
        add $TOTAL_CREDS_NEEDED (300 * $TOTALFUELUPGRADENEEDED)
      elseif ($DOORG = "o")
        add $TOTAL_CREDS_NEEDED (500 * $TOTALORGUPGRADENEEDED)
      else
        add $TOTAL_CREDS_NEEDED (1000 * $TOTALEQUIPUPGRADENEEDED)
      end
      if ($TOTAL_CREDS_NEEDED > $PLAYER~CREDITS)
        setvar $CASHONHAND $PLANET~CITADEL_CREDITS
        add $CASHONHAND $PLAYER~CREDITS
        if ($CASHONHAND > $TOTAL_CREDS_NEEDED)
          if ($STARTINGLOCATION = "Planet")
            send "C"
          end
          send "T T "&$PLAYER~CREDITS&"* "
          send "T F "&$TOTAL_CREDS_NEEDED&"* "
          setvar $PLAYER~CREDITS $TOTAL_CREDS_NEEDED
          send "'{" $SWITCHBOARD~BOT_NAME "} - Withdrew funds from the Treasury to complete the port max*"
        end
      end
    end
    send "q q"
  else
    send "q"
  end
end
setvar $WRONG FALSE
if ($DOFUEL)
  setvar $PRODUCT 1
  setvar $NOEXPAMOUNT 9
  gosub :DOMAXPORT
end
if ($DOORG)
  setvar $PRODUCT 2
  setvar $NOEXPAMOUNT 4
  gosub :DOMAXPORT
end
if ($DOEQU)
  setvar $PRODUCT 3
  setvar $NOEXPAMOUNT 3
  gosub :DOMAXPORT
end
if (($STARTINGLOCATION = "Citadel") or ($STARTINGLOCATION = "Planet"))
  gosub :PLANET~LANDINGSUB
end
if ($WRONG)
  send "'{" $SWITCHBOARD~BOT_NAME "} - No valid port here.*"
end
send "'{" $SWITCHBOARD~BOT_NAME "} - Port upgrade complete.*"
halt
:DOMAXPORT

send "o z" $PRODUCT "z0* "
settextlinetrigger NOREALPORTHERE :WRONGPORTTYPE "Do you want to initiate construction on this port?"
settextlinetrigger CONSTRUCTION :WRONGPORTTYPE "Do you want instructions (Y/N)"
waiton ", 0 to quit)"
killalltriggers
getword CURRENTLINE $UPGRADEAMOUNT 9
striptext $UPGRADEAMOUNT "("
send "o "
if ($NO_EXP)
  while ($UPGRADEAMOUNT > 0)
    if ($UPGRADEAMOUNT > 3)
      send $PRODUCT " " $NOEXPAMOUNT "* "
      subtract $UPGRADEAMOUNT $NOEXPAMOUNT
    else
      send $PRODUCT " " $UPGRADEAMOUNT "* "
      subtract $UPGRADEAMOUNT $UPGRADEAMOUNT
    end
  end
  send "* * "
else
  send $PRODUCT " " $UPGRADEAMOUNT "* * "
end
send "CR*Q"
waiton "<Computer deactivated>"
:DONEMAXPORT
killalltriggers
return
:WRONGPORTTYPE


setvar $WRONG TRUE
goto :DONEMAXPORT

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
