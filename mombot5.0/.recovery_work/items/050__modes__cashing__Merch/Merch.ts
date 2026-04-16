logging "OFF"
gosub :BOT~LOADVARS
loadvar $PLAYER~UNLIMITEDGAME
loadvar $GAME~PTRADESETTING
loadvar $BOT~BOT_TURN_LIMIT
loadvar $BOT~MCIC_FILE

setvar $BOT~HELP[1] $BOT~TAB&"           Visits all ports in grid and sells organics          "
setvar $BOT~HELP[2] $BOT~TAB&"           and/or equipment.       "
setvar $BOT~HELP[3] $BOT~TAB&"       "
setvar $BOT~HELP[4] $BOT~TAB&" merch {sector param} {min port product} [o | e] ({neg}otiate OR {hold}byhold)  "
setvar $BOT~HELP[5] $BOT~TAB&"       {buyfuel} {docim}  "
setvar $BOT~HELP[6] $BOT~TAB&"       "
setvar $BOT~HELP[7] $BOT~TAB&"Options:"
setvar $BOT~HELP[8] $BOT~TAB&"    {neg/hold}   Determines planet negotiate or hold "
setvar $BOT~HELP[9] $BOT~TAB&"                 selling approach"
setvar $BOT~HELP[10] $BOT~TAB&"     {skipcim}   Uses current cim data and skips searching"
setvar $BOT~HELP[11] $BOT~TAB&"       {docim}   Does cim check before starting and skips searching"
setvar $BOT~HELP[12] $BOT~TAB&"     {buyfuel}   Buys all the fuel in fuel selling ports "
setvar $BOT~HELP[13] $BOT~TAB&"                 on route  "
setvar $BOT~HELP[14] $BOT~TAB&"        {half}   sell half of port (neg only for now) "
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Planet Merchant"
gosub :BOT~BANNER
:MERCHANT


gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "You must run Planet Merchant command from a Citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $BOT~PARMAMETER ""
setvar $MINIMUMFUEL $BOT~PARM1
isnumber $NUMBER $MINIMUMFUEL
if ($NUMBER <> TRUE)
  setvar $BOT~PARMAMETER $BOT~PARM1
  uppercase $BOT~PARMAMETER
  setvar $MINIMUMFUEL $BOT~PARM2
  isnumber $NUMBER $MINIMUMFUEL
  if ($NUMBER <> TRUE)
    setvar $MINIMUMFUEL 1000
  end
end
if ($MINIMUMFUEL <= 0)
  setvar $SWITCHBOARD~MESSAGE "Minimum Port Product must be greater than 0.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

getwordpos $BOT~USER_COMMAND_LINE $POS "hold"
if ($POS > 0)
  setvar $PLANET~PLANETNEGOTIATE FALSE
else
  setvar $PLANET~PLANETNEGOTIATE TRUE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "half"
if ($POS > 0)
  setvar $SELLHALF TRUE
else
  setvar $SELLHALF FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " o "
if ($POS > 0)
  setvar $SELLINGORG TRUE
else
  setvar $SELLINGORG FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " e "
if ($POS > 0)
  setvar $SELLINGEQUIP TRUE
else
  setvar $SELLINGEQUIP FALSE
end

getwordpos $BOT~USER_COMMAND_LINE&" " $POS " buyfuel "
if ($POS > 0)
  setvar $BUYFUEL TRUE
else
  setvar $BUYFUEL FALSE
end

if (($SELLINGORG = FALSE) and ($SELLINGEQUIP = FALSE))
  setvar $SWITCHBOARD~MESSAGE "Please pick [o]rganics and/or [e]quipment to sell.  merch [min product] {o} {e} {docim} {skipcim} {negotiate/hold}*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos $BOT~USER_COMMAND_LINE $POS "docim"
if ($POS > 0)
  setvar $DOCIM TRUE
else
  setvar $DOCIM FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "skipcim"
if ($POS > 0)
  setvar $SKIPCIM TRUE
else
  setvar $SKIPCIM FALSE
end
:MERCHANT



killalltriggers
setarray $CHECKEDPORTS SECTORS
setarray $QUE SECTORS
setarray $CHECKED SECTORS
send "q"
waiton "Planet command (?"
gosub :PLANET~GETPLANETINFO
send "c"
if ($PLANET~CITADEL < 4)
  setvar $SWITCHBOARD~MESSAGE "You must run Planet Merchant from at least a level 4 planet.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
gosub :PLAYER~QUIKSTATS
setvar $SECTORCOUNT 10
setvar $TOTALHOLDS 0
setvar $SPENTCREDITS 0
setvar $STARTINGSECTOR $PLAYER~CURRENT_SECTOR

if ($DOCIM = TRUE)
  setvar $SWITCHBOARD~MESSAGE "Planet Merchant Downloading Current Port CIM Data - Comms Off*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "^rq"
  waitfor ": ENDINTERROG"
  setvar $SWITCHBOARD~MESSAGE "Planet Merchant CIM Port Data Complete - Comms Back On*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
loadvar $GAME~PORT_MAX
setvar $HALF_PORT_MAX $GAME~PORT_MAX
divide $HALF_PORT_MAX 2
while ($SELLINGORG and ($PLANET~PLANET_ORGANICS >= 500)) or ($SELLINGEQUIP and ($PLANET~PLANET_EQUIPMENT >= 500))
  :INAC
  if (($PLAYER~UNLIMITEDGAME = FALSE) and ($PLAYER~TURNS <= $BOT_TURN_LIMIT))
    setvar $SWITCHBOARD~MESSAGE "Turns too low to continue.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :DONEMERCHANT
  end
  setvar $BOTTOM 1
  setvar $TOP 1
  setarray $CHECKED SECTORS
  setvar $QUE[1] $PLAYER~CURRENT_SECTOR
  setvar $CHECKED[$PLAYER~CURRENT_SECTOR] 1
  :TRYAGAIN2

  while ($BOTTOM <= $TOP)

    setvar $FOCUS $QUE[$BOTTOM]
    if ($BOT~PARMAMETER <> "")
      getsectorparameter $FOCUS $BOT~PARMAMETER $ISGOODSECTOR
    end
    if (($BOT~PARMAMETER <> "") and ($ISGOODSECTOR <> TRUE))
      goto :NOTIT
    end
    if (($DOCIM = FALSE) and ($SKIPCIM = FALSE))
      if (($CHECKEDPORTS[$FOCUS] <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and (((PORT.CLASS[$FOCUS] > 0) and (((SECTOR.EXPLORED[$FOCUS] = "YES") and ((($SELLINGORG = TRUE) and (($PLANET~PLANET_ORGANICS > 500) and PORT.BUYORG[$FOCUS])) or (($SELLINGEQUIP = TRUE) and (($PLANET~PLANET_EQUIPMENT > 500) and PORT.BUYEQUIP[$FOCUS]))))))))))
        send "cr"&$FOCUS&"*q"
        gosub :PLAYER~QUIKSTATS
      end
    end

    getsectorparameter $FOCUS "BUSTED" $ISBUSTED
    if (($ISBUSTED <> TRUE) and ((($CHECKEDPORTS[$FOCUS] <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and (($SELLINGORG and ((($PLANET~PLANET_ORGANICS > 500) and ((PORT.BUYORG[$FOCUS] and (((((PORT.PERCENTORG[$FOCUS] > 50) and ((PORT.ORG[$FOCUS] > $HALF_PORT_MAX) and ($SELLHALF = TRUE))) or ($SELLHALF <> TRUE)) and (PORT.ORG[$FOCUS] >= $MINIMUMFUEL)))))))) or ($SELLINGEQUIP and ((($PLANET~PLANET_EQUIPMENT > 500) and ((PORT.BUYEQUIP[$FOCUS] and (((((PORT.PERCENTEQUIP[$FOCUS] > 50) and (($SELLHALF = TRUE) and (PORT.EQUIP[$FOCUS] > $HALF_PORT_MAX))) or ($SELLHALF <> TRUE)) and (PORT.EQUIP[$FOCUS] >= $MINIMUMFUEL))))))))))))))

      setvar $NEARFIG $FOCUS
      setvar $CHECKEDPORTS[$NEARFIG] TRUE
      goto :CONTINUEON2
    else
      :NOTIT
      setvar $NEARFIG 0
    end

    setvar $A 1
    while (SECTOR.WARPS[$FOCUS][$A] > 0)
      setvar $ADJACENT SECTOR.WARPS[$FOCUS][$A]

      if ($CHECKED[$ADJACENT] = 0)

        setvar $CHECKED[$ADJACENT] 1
        add $TOP 1
        setvar $QUE[$TOP] $ADJACENT
      end
      add $A 1
    end

    add $BOTTOM 1
  end
  setvar $SWITCHBOARD~MESSAGE "Can't find a route to any other ports.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :DONEMERCHANT
  :CONTINUEON2
  if ($NEARFIG > 0)
    killalltriggers
    send "p"&$NEARFIG&"*y"
    settextlinetrigger WARPED :EMPTYPORT2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
    settextlinetrigger SAME :EMPTYPORT2 "You are already in that sector!"
    settextlinetrigger DIDNOTWARP :NOFIGATLOCATION "Your own fighters must be in the destination to make a safe jump."
    settextlinetrigger NOTENOUGHFUEL :DONENOFUEL2 "You do not have enough Fuel Ore on this planet to make the jump."
    pause
    :EMPTYPORT2
    send "s*  "
    gosub :PLAYER~QUIKSTATS
    send "cr*q"
    gosub :PLAYER~QUIKSTATS
    setsectorparameter $NEARFIG "FIGSEC" TRUE
    if (PORT.EXISTS[$NEARFIG] <> TRUE)
      goto :TRYAGAIN2
    end
    if ($PLANET~PLANETNEGOTIATE = TRUE)
      killalltriggers
      setvar $PLANET~_CK_PNEGO_FUELTOSELL "-1"
      if ($SELLINGORG)
        if ($SELLHALF)
          setvar $ORG_TO_SELL (PORT.ORG[$NEARFIG] - $HALF_PORT_MAX)
          if ($ORG_TO_SELL <= 0)
            setvar $PLANET~_CK_PNEGO_ORGTOSELL "-1"
          else
            setvar $PLANET~_CK_PNEGO_ORGTOSELL $ORG_TO_SELL
          end
        else
          setvar $PLANET~_CK_PNEGO_ORGTOSELL "max"
        end
      else
        setvar $PLANET~_CK_PNEGO_ORGTOSELL "-1"
      end
      if ($SELLINGEQUIP)
        if ($SELLHALF)
          setvar $EQUIP_TO_SELL (PORT.EQUIP[$NEARFIG] - $HALF_PORT_MAX)
          if ($EQUIP_TO_SELL <= 0)
            setvar $PLANET~_CK_PNEGO_EQUIPTOSELL "-1"
          else
            setvar $PLANET~_CK_PNEGO_EQUIPTOSELL $EQUIP_TO_SELL
          end
        else
          setvar $PLANET~_CK_PNEGO_EQUIPTOSELL "max"
        end
      else
        setvar $PLANET~_CK_PNEGO_EQUIPTOSELL "-1"
      end
      gosub :PLANET~PLANETNEG
      send "cr*q"
      gosub :PLAYER~QUIKSTATS
      if ($SELLINGEQUIP and (PORT.EQUIP[$NEARFIG] > $MINIMUMFUEL))
        setvar $CHECKEDPORTS[$NEARFIG] FALSE
      end
      if ($SELLINGORG and (PORT.ORG[$NEARFIG] > $MINIMUMFUEL))
        setvar $CHECKEDPORTS[$NEARFIG] FALSE
      end
      if (($BUYFUEL = TRUE) and (PORT.BUYFUEL[$NEARFIG] = FALSE))
        setvar $PLAYER~BUYOBJECT "f"
        setvar $PLAYER~BUYTYPE "s"
        setvar $PLAYER~BUYDOWNROUNDSFROMPARAM $PLAYER~TURNSTOEMPTY
        gosub :PLAYER~BUY
        gosub :PLAYER~QUIKSTATS
      end
    else
      killalltriggers
      gosub :PLAYER~QUIKSTATS
      send "q"
      waiton "Planet command (?"
      gosub :PLANET~GETPLANETINFO
      send "c"

      send "q q *cr*q"
      waiton "Fuel Ore"
      getword CURRENTLINE $TOTALPORTFUEL 4
      waiton "Organics"
      getword CURRENTLINE $TOTALPORTORGANICS 3
      waiton "Equipment"
      getword CURRENTLINE $TOTALPORTEQUIPMENT 3

      waiton "<Computer deactivated>"
      if (($PLANET~PLANET_FUEL_MAX - $PLANET~PLANET_FUEL) < $TOTALPORTFUEL)
        setvar $PLAYER~TURNSTOEMPTYFUEL "(($PLANET~PLANET_FUEL_MAX-$PLANET~PLANET_FUEL)/$PLAYER~TOTAL_HOLDS-1"
      else
        setvar $PLAYER~TURNSTOEMPTYFUEL (($TOTALPORTFUEL / $PLAYER~TOTAL_HOLDS) - 1)
      end
      if ((PORT.BUYORG[$NEARFIG] = TRUE) and $SELLINGORG)
        if ($PLANET~PLANET_ORGANICS < $TOTALPORTORGANICS)
          setvar $PLAYER~TURNSSELLINGPRODUCT (($PLANET~PLANET_ORGANICS / $PLAYER~TOTAL_HOLDS) - 1)
        else
          setvar $PLAYER~TURNSSELLINGPRODUCT ($TOTALPORTORGANICS / $PLAYER~TOTAL_HOLDS)
        end
        if (($PLAYER~UNLIMITEDGAME = FALSE) and (($PLAYER~TURNS - $PLAYER~TURNSSELLINGPRODUCT) <= $BOT~BOT_TURN_LIMIT))
          setvar $SWITCHBOARD~MESSAGE "Turns too low to continue.*"
          gosub :SWITCHBOARD~SWITCHBOARD
          send "l "&$PLANET~PLANET&"* c "
          goto :DONEMERCHANT
        end
        if ((PORT.BUYFUEL[$NEARFIG] = FALSE) and ($BUYFUEL = TRUE))
          send "l "&$PLANET~PLANET&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
          gosub :PLAYER~QUIKSTATS
          while (($PLAYER~TURNSSELLINGPRODUCT > 0) and ($PLAYER~TURNSTOEMPTYFUEL > 1))
            send "l " $PLANET~PLANET "*   t  *  l 1* t  *  * 2*  q P * *"
            gosub :PLAYER~STARTHAGGLE
            send "*"
            gosub :PLAYER~STARTHAGGLE
            send " 0 *  /"
            if ($NI <> TRUE)
              subtract $PLAYER~TURNSSELLINGPRODUCT 1
            end
            subtract $PLAYER~TURNSTOEMPTYFUEL 1
            add $TOTALORGANICHOLDS $PLAYER~TOTAL_HOLDS
            waiton "Turns"
          end
        end
        send "l "&$PLANET~PLANET&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
        gosub :PLAYER~QUIKSTATS
        while ($PLAYER~TURNSSELLINGPRODUCT > 0)
          send "l " $PLANET~PLANET "*  t  *  * 2*  q P * *"
          gosub :PLAYER~STARTHAGGLE
          send "0 * 0 *  /"
          waiton "Turns"
          if ($NI <> TRUE)
            subtract $PLAYER~TURNSSELLINGPRODUCT 1
          end
          add $TOTALORGANICHOLDS $PLAYER~TOTAL_HOLDS
        end
      end
      if ((PORT.BUYEQUIP[$NEARFIG] = TRUE) and $SELLINGEQUIP)
        if ($PLANET~PLANET_EQUIPMENT < $TOTALPORTEQUIPMENT)
          setvar $PLAYER~TURNSSELLINGPRODUCT (($PLANET~PLANET_EQUIPMENT / $PLAYER~TOTAL_HOLDS) - 1)
        else
          setvar $PLAYER~TURNSSELLINGPRODUCT ($TOTALPORTEQUIPMENT / $PLAYER~TOTAL_HOLDS)
        end
        if ((PORT.BUYFUEL[$NEARFIG] = FALSE) and ($BUYFUEL = TRUE))
          send "l "&$PLANET~PLANET&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
          while (($PLAYER~TURNSSELLINGPRODUCT > 0) and ($PLAYER~TURNSTOEMPTYFUEL > 1))
            send "l " $PLANET~PLANET "*   t  *  l 1* t  *  * 3*  q P * *"
            gosub :PLAYER~STARTHAGGLE
            send "*"
            gosub :PLAYER~STARTHAGGLE
            send " 0 *  /"
            if ($NI <> TRUE)
              subtract $PLAYER~TURNSSELLINGPRODUCT 1
            end
            subtract $PLAYER~TURNSTOEMPTYFUEL 1
            add $TOTALEQUIPMENTHOLDS $PLAYER~TOTAL_HOLDS
            waiton "Turns"
          end
        end
        send "l "&$PLANET~PLANET&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
        while ($PLAYER~TURNSSELLINGPRODUCT > 0)
          send "l " $PLANET~PLANET "*  t  *  * 3*  q P * *"
          gosub :PLAYER~STARTHAGGLE
          send "0 * 0 *  /"
          if ($NI <> TRUE)
            subtract $PLAYER~TURNSSELLINGPRODUCT 1
          end
          add $TOTALEQUIPMENTHOLDS $PLAYER~TOTAL_HOLDS
          waiton "Turns"
        end
      end
    end

    send "#"
    waiton "                            Who's Playing"
    if ($PLANET~PLANETNEGOTIATE <> TRUE)
      gosub :PLANET~LANDONPLANETENTERCITADEL
    end
    send "cr*q"
    gosub :PLAYER~QUIKSTATS
  end
end
:DONEMERCHANT
send "p"&$STARTINGSECTOR&"*y"
setvar $SWITCHBOARD~MESSAGE "Planet Merchant completed.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:NOFIGATLOCATION

setsectorparameter $NEARFIG "FIGSEC" FALSE
goto :TRYAGAIN2

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
