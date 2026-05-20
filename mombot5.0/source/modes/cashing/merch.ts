logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $player~unlimitedgame
loadvar $game~ptradesetting
loadvar $bot~bot_turn_limit
loadvar $bot~mcic_file

setvar $HELP~HELP[1] $HELP~TAB&"           Visits all ports in grid and sells organics          "
setvar $HELP~HELP[2] $HELP~TAB&"           and/or equipment.       "
setvar $HELP~HELP[3] $HELP~TAB&"       "
setvar $HELP~HELP[4] $HELP~TAB&" merch {sector param} {min port product} [o | e] {args}  "
setvar $HELP~HELP[5] $HELP~TAB&"       "
setvar $HELP~HELP[6] $HELP~TAB&"Arguments:"
setvar $HELP~HELP[7] $HELP~TAB&"    {neg/hold}   Determines planet negotiate or hold "
setvar $HELP~HELP[8] $HELP~TAB&"                 selling approach"
setvar $HELP~HELP[9] $HELP~TAB&"     {skipcim}   Uses current cim data and skips searching"
setvar $HELP~HELP[10] $HELP~TAB&"       {docim}   Does cim check before starting and skips searching"
setvar $HELP~HELP[11] $HELP~TAB&"     {buyfuel}   Buys all the fuel in fuel selling ports on route"
setvar $HELP~HELP[12] $HELP~TAB&"      {upfuel}   upgrade fuel ore ports (usually with buyfuel)"
setvar $HELP~HELP[13] $HELP~TAB&"        {half}   sell half of port (neg only for now) "
setvar $HELP~HELP[14] $HELP~TAB&"       {upequ}   upgrade good equipment ports"
setvar $HELP~HELP[15] $HELP~TAB&"       {uporg}   upgrade good organics ports"
setvar $HELP~HELP[16] $HELP~TAB&"   {checkmcic}   make small trades at non-upgraded ports missing mcic"
setvar $HELP~HELP[17] $HELP~TAB&"    {upmcic #}   maximum mcic to upgrade (default: -60)"
setvar $HELP~HELP[18] $HELP~TAB&"  {sellmcic #}   minimum mcic to sell product (default: none)"
setvar $HELP~HELP[18] $HELP~TAB&"    {minpct #}   minimum percent to sell to a port (default: 50)"
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "Planet Merchant starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

:MERCHANT
gosub :player~quikstats
setvar $STARTINGLOCATION $player~current_prompt
if ($STARTINGLOCATION <> "Citadel")
  setvar $switchboard~message "You must run Planet Merchant command from a Citadel prompt.*"
  gosub :switchboard~switchboard
  halt
end
setvar $bot~parameter ""
setvar $MINIMUMFUEL $bot~parm1
isnumber $NUMBER $MINIMUMFUEL
if ($NUMBER <> TRUE)
  setvar $bot~parameter $bot~parm1
  uppercase $bot~parameter
  setvar $MINIMUMFUEL $bot~parm2
  isnumber $NUMBER $MINIMUMFUEL
  if ($NUMBER <> TRUE)
    setvar $MINIMUMFUEL 1000
  end
end
if ($MINIMUMFUEL <= 0)
  setvar $switchboard~message "Minimum Port Product must be greater than 0.*"
  gosub :switchboard~switchboard
  halt
end

getwordpos $bot~user_command_line $POS "hold"
if ($POS > 0)
  setvar $planet~planetnegotiate FALSE
else
  setvar $planet~planetnegotiate TRUE
end
getwordpos $bot~user_command_line $POS "half"
if ($POS > 0)
  setvar $SELLHALF TRUE
else
  setvar $SELLHALF FALSE
end
getwordpos " "&$bot~user_command_line&" " $POS " o "
if ($POS > 0)
  setvar $SELLINGORG TRUE
else
  setvar $SELLINGORG FALSE
end
getwordpos " "&$bot~user_command_line&" " $POS " e "
if ($POS > 0)
  setvar $SELLINGEQUIP TRUE
else
  setvar $SELLINGEQUIP FALSE
end

getwordpos $bot~user_command_line&" " $POS " buyfuel "
if ($POS > 0)
  setvar $BUYFUEL TRUE
else
  setvar $BUYFUEL FALSE
end

if (($SELLINGORG = FALSE) and ($SELLINGEQUIP = FALSE))
  setvar $switchboard~message "Please pick [o]rganics and/or [e]quipment to sell.  merch [min product] {o} {e} {docim} {skipcim} {negotiate/hold}*"
  gosub :switchboard~switchboard
  halt
end
getwordpos $bot~user_command_line $POS "docim"
if ($POS > 0)
  setvar $DOCIM TRUE
else
  setvar $DOCIM FALSE
end

getwordpos $bot~user_command_line $POS "skipcim"
if ($POS > 0)
  setvar $SKIPCIM TRUE
else
  setvar $SKIPCIM FALSE
end

getwordpos $bot~user_command_line $POS "checkmcic"
if ($POS > 0)
  setvar $CHECKMCIC TRUE
else
  setvar $CHECKMCIC FALSE
end

getwordpos $bot~user_command_line $POS "upfuel"
if ($POS > 0)
  setvar $UPFUEL TRUE
else
  setvar $UPFUEL FALSE
end

getwordpos $bot~user_command_line $POS "upequ"
if ($POS > 0)
  setvar $UPEQU TRUE
else
  setvar $UPEQU FALSE
end

getwordpos $bot~user_command_line $POS "uporg"
if ($POS > 0)
  setvar $UPORG TRUE
else
  setvar $UPORG FALSE
end

setvar $UPMCIC -60
getwordpos $bot~user_command_line $POS "upmcic"
if ($POS > 0)
  cuttext $bot~user_command_line $TMP_COMMAND_LINE $POS 999
  getword $TMP_COMMAND_LINE $TMPVAL 2
  isnumber $TEST $TMPVAL
  if ($TEST = TRUE)
    if ($TMPVAL > 0)
      setvar $UPMCIC (0 - $TMPVAL)
    else
      setvar $UPMCIC $TMPVAL
    end
  else
    setvar $switchboard~message "Invalid mcic value for upmcic argument"
    gosub :switchboard~switchboard
    halt
  end
end

setvar $SELLMCIC 0
getwordpos $bot~user_command_line $POS "sellmcic"
if ($POS > 0)
  cuttext $bot~user_command_line $TMP_COMMAND_LINE $POS 999
  getword $TMP_COMMAND_LINE $TMPVAL 2
  isnumber $TEST $TMPVAL
  if ($TEST = TRUE)
    if ($TMPVAL > 0)
      setvar $SELLMCIC (0 - $TMPVAL)
    else
      setvar $SELLMCIC $TMPVAL
    end
  else
    setvar $switchboard~message "Invalid mcic value for sellmcic argument"
    gosub :switchboard~switchboard
    halt
  end
end

setvar $minpct 50
getwordpos $bot~user_command_line $POS "minpct"
if ($POS > 0)
  cuttext $bot~user_command_line $TMP_COMMAND_LINE $POS 999
  getword $TMP_COMMAND_LINE $TMPVAL 2
  striptext $TMPVAL "%"
  isnumber $TEST $TMPVAL
  if ($TEST = TRUE)
    if ($TMPVAL > 0)
      setvar $minpct $tmpval
    end
  else
    setvar $switchboard~message "Invalid value for minpct argument"
    gosub :switchboard~switchboard
    halt
  end
end

:MERCHANT
killalltriggers
setarray $CHECKEDPORTS SECTORS
setarray $QUE SECTORS
setarray $CHECKED SECTORS
send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"
if ($planet~citadel < 4)
  setvar $switchboard~message "You must run Planet Merchant from at least a level 4 planet.*"
  gosub :switchboard~switchboard
  halt
end
gosub :player~quikstats
setvar $SECTORCOUNT 10
setvar $TOTALHOLDS 0
setvar $SPENTCREDITS 0
setvar $STARTINGSECTOR $player~current_sector

if ($DOCIM = TRUE)
  setvar $switchboard~message "Planet Merchant Downloading Current Port CIM Data - Comms Off*"
  gosub :switchboard~switchboard
  send "^rq"
  waitfor ": ENDINTERROG"
  setvar $switchboard~message "Planet Merchant CIM Port Data Complete - Comms Back On*"
  gosub :switchboard~switchboard
end
loadvar $game~port_max
setvar $HALF_PORT_MAX $game~port_max
divide $HALF_PORT_MAX 2
setvar $MERCH_MIN_PRODUCT $MINIMUMFUEL
setvar $MERCH_SAMPLE_AMOUNT $player~total_holds
if ($MERCH_SAMPLE_AMOUNT <= 0)
  setvar $MERCH_SAMPLE_AMOUNT 255
end
setvar $MERCH_NEG_SAMPLE_AMOUNT $MERCH_SAMPLE_AMOUNT
if ($MERCH_NEG_SAMPLE_AMOUNT > 255)
  setvar $MERCH_NEG_SAMPLE_AMOUNT 255
end
if ($CHECKMCIC = TRUE)
  if ($planet~planetnegotiate = TRUE)
    setvar $MERCH_MIN_PRODUCT $MERCH_NEG_SAMPLE_AMOUNT
  else
    setvar $MERCH_MIN_PRODUCT $MERCH_SAMPLE_AMOUNT
  end
end
while ($SELLINGORG and ($planet~planet_organics >= $MERCH_MIN_PRODUCT)) or ($SELLINGEQUIP and ($planet~planet_equipment >= $MERCH_MIN_PRODUCT))
  :INAC
  if (($player~unlimitedgame = FALSE) and ($player~turns <= $BOT_TURN_LIMIT))
    setvar $switchboard~message "Turns too low to continue.*"
    gosub :switchboard~switchboard
    goto :DONEMERCHANT
  end
  :TRYAGAIN2
  if ($CHECKMCIC <> TRUE)
    setvar $BESTMCICSECTOR 0
    setvar $BESTMCICSCORE 49
    setvar $FOCUS 1
    setvar $MERCHCHECKREMOTE FALSE
    while ($FOCUS <= SECTORS)
      gosub :CHECKMERCHPORT
      if (($MERCHGOODPORT = TRUE) and ($MERCHMCICSCORE > $BESTMCICSCORE))
        setvar $BESTMCICSCORE $MERCHMCICSCORE
        setvar $BESTMCICSECTOR $FOCUS
      end
      add $FOCUS 1
    end
    if ($BESTMCICSECTOR > 0)
      setvar $NEARFIG $BESTMCICSECTOR
      setvar $CHECKEDPORTS[$NEARFIG] TRUE
      goto :CONTINUEON2
    end
  end
  setvar $BOTTOM 1
  setvar $TOP 1
  setarray $CHECKED SECTORS
  setvar $QUE[1] $player~current_sector
  setvar $checked[$player~current_sector] 1

  while ($BOTTOM <= $TOP)

    setvar $FOCUS $QUE[$BOTTOM]
    setvar $MERCHCHECKREMOTE TRUE
    gosub :CHECKMERCHPORT
    if ($MERCHGOODPORT = TRUE)
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

  setvar $switchboard~message "Can't find a route to any other ports.*"
  gosub :switchboard~switchboard
  goto :DONEMERCHANT

  :CONTINUEON2
  if ($NEARFIG > 0)
    killalltriggers
    if ($NEARFIG <> $player~current_sector)
      send "p"&$NEARFIG&"*y"
      settextlinetrigger WARPED :EMPTYPORT2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
      settextlinetrigger DIDNOTWARP :NOFIGATLOCATION "Your own fighters must be in the destination to make a safe jump."
      settextlinetrigger NOTENOUGHFUEL :DONENOFUEL2 "You do not have enough Fuel Ore on this planet to make the jump."
      pause
    end
    :EMPTYPORT2
    send "s*  "
    #gosub :player~quikstats
    send "cr"&$NEARFIG&"*q"

    setsectorparameter $NEARFIG "FIGSEC" TRUE
    if (PORT.EXISTS[$NEARFIG] <> TRUE)
      goto :TRYAGAIN2
    end
    setvar $CANSELLORGHERE FALSE
    if ($SELLINGORG and PORT.BUYORG[$NEARFIG] and (PORT.ORG[$NEARFIG] >= $MERCH_MIN_PRODUCT) and ($planet~planet_organics >= $MERCH_MIN_PRODUCT))
      setvar $CANSELLORGHERE TRUE
    end
    setvar $CANSELLEQUIPHERE FALSE
    if ($SELLINGEQUIP and PORT.BUYEQUIP[$NEARFIG] and (PORT.EQUIP[$NEARFIG] >= $MERCH_MIN_PRODUCT) and ($planet~planet_equipment >= $MERCH_MIN_PRODUCT))
      setvar $CANSELLEQUIPHERE TRUE
    end
    if ($planet~planetnegotiate = TRUE)
      killalltriggers
      setvar $planethaggle~_ck_pnego_fueltosell "-1"
      if ($CANSELLORGHERE)
        if ($CHECKMCIC = TRUE)
          setvar $planethaggle~_ck_pnego_orgtosell $MERCH_NEG_SAMPLE_AMOUNT
        elseif ($SELLHALF)
          setvar $ORG_TO_SELL (PORT.ORG[$NEARFIG] - $HALF_PORT_MAX)
          if ($ORG_TO_SELL <= 0)
            setvar $planethaggle~_ck_pnego_orgtosell "-1"
          else
            setvar $planethaggle~_ck_pnego_orgtosell $ORG_TO_SELL
          end
        else
          setvar $planethaggle~_ck_pnego_orgtosell "max"
        end
      else
        setvar $planethaggle~_ck_pnego_orgtosell "-1"
      end
      if ($CANSELLEQUIPHERE)
        if ($CHECKMCIC = TRUE)
          setvar $planethaggle~_ck_pnego_equiptosell $MERCH_NEG_SAMPLE_AMOUNT
        elseif ($SELLHALF)
          setvar $EQUIP_TO_SELL (PORT.EQUIP[$NEARFIG] - $HALF_PORT_MAX)
          if ($EQUIP_TO_SELL <= 0)
            setvar $planethaggle~_ck_pnego_equiptosell "-1"
          else
            setvar $planethaggle~_ck_pnego_equiptosell $EQUIP_TO_SELL
          end
        else
          setvar $planethaggle~_ck_pnego_equiptosell "max"
        end
      else
        setvar $planethaggle~_ck_pnego_equiptosell "-1"
      end
      gosub :player~quikstats
      #gosub :planethaggle~planetneg
      gosub :planet~getplanetprods
      setvar $planethaggle~hasprods 1
      gosub :planethaggle~planetneg
      setvar $planethaggle~hasprods 0

      if ($planethaggle~sellhagglesucceeded = TRUE)
        send "cr"&$NEARFIG&"*q"
        waiton "<Computer deactivated>"
        if ($CHECKMCIC <> TRUE)
          if ($CANSELLEQUIPHERE and (PORT.EQUIP[$NEARFIG] >= $MINIMUMFUEL))
            setvar $CHECKEDPORTS[$NEARFIG] FALSE
          end
          if ($CANSELLORGHERE and (PORT.ORG[$NEARFIG] >= $MINIMUMFUEL))
            setvar $CHECKEDPORTS[$NEARFIG] FALSE
          end
        end
      end
      if (($BUYFUEL = TRUE) and (PORT.BUYFUEL[$NEARFIG] = FALSE))
        setvar $player~buyobject "f"
        setvar $player~buytype "s"
        setvar $player~buydownroundsfromparam $player~turnstoempty
        gosub :planethaggle~buy
        #gosub :player~quikstats
      end
    else
      killalltriggers
      #gosub :player~quikstats
      send "q"
      waiton "Planet command (?"
      gosub :planet~getplanetinfo
      send "c"
      gosub :planet~getplanetprods

      if (($planet~planet_fuel_max - $planet~planet_fuel) < $PLAYER~CURRENT_SECTOR.ORETRADING)
        setvar $player~turnstoemptyfuel "(($PLANET~PLANET_FUEL_MAX-$PLANET~PLANET_FUEL)/$PLAYER~TOTAL_HOLDS-1"
      else
        setvar $player~turnstoemptyfuel (($PLAYER~CURRENT_SECTOR.ORETRADING / $player~total_holds) - 1)
      end
      if ($CANSELLORGHERE)
        if ($CHECKMCIC = TRUE)
          setvar $player~turnssellingproduct 1
        elseif ($planet~planet_organics < $PLAYER~CURRENT_SECTOR.ORGTRADING)
          setvar $player~turnssellingproduct (($planet~planet_organics / $player~total_holds) - 1)
        else
          setvar $player~turnssellingproduct ($PLAYER~CURRENT_SECTOR.ORGTRADING / $player~total_holds)
        end
        if (($player~unlimitedgame = FALSE) and (($player~turns - $player~turnssellingproduct) <= $bot~bot_turn_limit))
          setvar $switchboard~message "Turns too low to continue.*"
          gosub :switchboard~switchboard
          send "l "&$planet~planet&"* c "
          goto :DONEMERCHANT
        end
        send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
        gosub :player~quikstats
        while ($player~turnssellingproduct > 0)
          send "l " $planet~planet "*  t  *  * 2*  q P * *"
          send "0 * 0 *  /"
          waiton "Turns"
          if ($NI <> TRUE)
            subtract $player~turnssellingproduct 1
          end
          add $TOTALORGANICHOLDS $player~total_holds
        end
      end
      if ($CANSELLEQUIPHERE)
        if ($CHECKMCIC = TRUE)
          setvar $player~turnssellingproduct 1
        elseif ($planet~planet_equipment < $PLAYER~CURRENT_SECTOR.EQUTRADING)
          setvar $player~turnssellingproduct (($planet~planet_equipment / $player~total_holds) - 1)
        else
          setvar $player~turnssellingproduct ($PLAYER~CURRENT_SECTOR.EQUTRADING / $player~total_holds)
        end
        if ((PORT.BUYFUEL[$NEARFIG] = FALSE) and ($BUYFUEL = TRUE))
          send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
          while (($player~turnssellingproduct > 0) and ($player~turnstoemptyfuel > 1))
            send "l " $planet~planet "*   t  *  l 1* t  *  * 3*  q P * *"
            send "*"
            send " 0 *  /"
            if ($NI <> TRUE)
              subtract $player~turnssellingproduct 1
            end
            subtract $player~turnstoemptyfuel 1
            add $TOTALEQUIPMENTHOLDS $player~total_holds
            waiton "Turns"
          end
        end
        send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
        while ($player~turnssellingproduct > 0)
          send "l " $planet~planet "*  t  *  * 3*  q P * *"
          send "0 * 0 *  /"
          if ($NI <> TRUE)
            subtract $player~turnssellingproduct 1
          end
          add $TOTALEQUIPMENTHOLDS $player~total_holds
          waiton "Turns"
        end
      end
      if ($UPFUEL = TRUE)
        if ($player~credits < 5000000)
          gosub :player~quikstats
          if ($player~current_prompt <> "Citadel")
            gosub :planet~landonplanetentercitadel
          end
          send "tf"
          waiton "and the Treasury has"
         getword CURRENTLINE $CREDITS 3
         striptext $CREDITS ","
         if ($CREDITS > 5000000)
           send "5000000*"
			     waitfor "Citadel command (?=help)"
         else
           send "0*"
			     waitfor "Citadel command (?=help)"
           goto :ENDUPFUEL
        end
      end
      send "q q q z a 999* * * * "
      setvar $port~product 1
      gosub :port~domaxport
      gosub :planet~landonplanetentercitadel
      end
      
      :ENDUPFUEL
      if ((PORT.BUYFUEL[$NEARFIG] = FALSE) and ($BUYFUEL = TRUE))
        send "l "&$planet~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
        gosub :player~quikstats
        while (($player~turnssellingproduct > 0) and ($player~turnstoemptyfuel > 1))
          send "l " $planet~planet "*   t  *  l 1* t  *  * 2*  q P * *"
          send "*"
          send " 0 *  /"
          if ($NI <> TRUE)
            subtract $player~turnssellingproduct 1
          end
          subtract $player~turnstoemptyfuel 1
        #add $TOTALORGANICHOLDS $player~total_holds
          waiton "Turns"
        end
      end
    end

    if ($UPORG = TRUE)
      getsectorparameter $NEARFIG "ORGMCIC" $TMP
      if ($TMP <= $UPMCIC)
        if ($player~credits < 5000000)
          gosub :player~quikstats
          if ($player~current_prompt <> "Citadel")
            gosub :planet~landonplanetentercitadel
          end
          send "tf"
          waiton "and the Treasury has"
          getword CURRENTLINE $CREDITS 3
          striptext $CREDITS ","
          if ($CREDITS > 5000000)
            send "5000000*"
			      waitfor "Citadel command (?=help)"
          else
            send "0*"
			      waitfor "Citadel command (?=help)"
            goto :ENDUPORG
          end
        end
        send "q q q z a 999* * * * "
        setvar $port~product 2
        gosub :port~domaxport
        gosub :planet~landonplanetentercitadel
      end
    end
    :ENDUPORG

    if ($UPEQU = TRUE)
      getsectorparameter $NEARFIG "EQUMCIC" $TMP
      if ($TMP <= $UPMCIC)
        if ($player~credits < 5000000)
          gosub :player~quikstats
          if ($player~current_prompt <> "Citadel")
            gosub :planet~landonplanetentercitadel
          end
          send "tf"
          waiton "and the Treasury has"
          getword CURRENTLINE $CREDITS 3
          striptext $CREDITS ","
          if ($CREDITS > 5000000)
            send "5000000*"
			waitfor "Citadel command (?=help)"
          else
            send "0*"
			waitfor "Citadel command (?=help)"
            goto :ENDUPEQU
          end
        end
        send "q q q z a 999* * * * "
        setvar $port~product 3
        gosub :port~domaxport
        gosub :planet~landonplanetentercitadel
      end
    end
    :ENDUPEQU

    send "#"
    waiton "                            Who's Playing"
    gosub :player~quikstats
    if ($player~current_prompt <> "Citadel")
      gosub :planet~landonplanetentercitadel
    end
    send "cr*q"
    gosub :player~quikstats
  end
end

goto :DONEMERCHANT

:CHECKMERCHPORT
setvar $MERCHGOODPORT FALSE
setvar $MERCHMCICSCORE 0
setvar $MERCH_CANSELLORG FALSE
setvar $MERCH_CANSELLEQUIP FALSE

if ($bot~parameter <> "")
  getsectorparameter $FOCUS $bot~parameter $ISGOODSECTOR
  if ($ISGOODSECTOR <> TRUE)
    return
  end
end
getsectorparameter $FOCUS "FIGSEC" $HASFIGATFOCUS
if (($FOCUS <> $player~current_sector) and ($HASFIGATFOCUS <> TRUE))
  return
end
if (($MERCHCHECKREMOTE = TRUE) and (($DOCIM = FALSE) and ($SKIPCIM = FALSE)))
  if (($CHECKEDPORTS[$FOCUS] <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and (((PORT.CLASS[$FOCUS] > 0) and (((SECTOR.EXPLORED[$FOCUS] = "YES") and ((($SELLINGORG = TRUE) and (($planet~planet_organics >= $MERCH_MIN_PRODUCT) and PORT.BUYORG[$FOCUS])) or (($SELLINGEQUIP = TRUE) and (($planet~planet_equipment >= $MERCH_MIN_PRODUCT) and PORT.BUYEQUIP[$FOCUS]))))))))))
    send "cr"&$FOCUS&"*q"
  end
end
getsectorparameter $FOCUS "BUSTED" $ISBUSTED
if (($ISBUSTED = TRUE) or ($CHECKEDPORTS[$FOCUS] = TRUE) or (PORT.EXISTS[$FOCUS] <> TRUE))
  return
end
if ($CHECKMCIC = TRUE)
  gosub :MERCHUPGRADEDPORT
  if ($MERCHUPGRADED = TRUE)
    return
  end
end
if (($SELLINGORG = TRUE) and ($planet~planet_organics >= $MERCH_MIN_PRODUCT) and (PORT.BUYORG[$FOCUS] = TRUE) and (PORT.ORG[$FOCUS] >= $MERCH_MIN_PRODUCT))
  if (($CHECKMCIC = TRUE) or (($SELLHALF <> TRUE) or ((PORT.PERCENTORG[$FOCUS] > $minpct) and (PORT.ORG[$FOCUS] > $HALF_PORT_MAX))))
    setvar $MERCH_CANSELLORG TRUE
  end
end
if (($SELLINGEQUIP = TRUE) and ($planet~planet_equipment >= $MERCH_MIN_PRODUCT) and (PORT.BUYEQUIP[$FOCUS] = TRUE) and (PORT.EQUIP[$FOCUS] >= $MERCH_MIN_PRODUCT))
  if (($CHECKMCIC = TRUE) or (($SELLHALF <> TRUE) or ((PORT.PERCENTEQUIP[$FOCUS] > $minpct) and (PORT.EQUIP[$FOCUS] > $HALF_PORT_MAX))))
    setvar $MERCH_CANSELLEQUIP TRUE
  end
end
if (($MERCH_CANSELLORG <> TRUE) and ($MERCH_CANSELLEQUIP <> TRUE))
  return
end
if (($MERCH_CANSELLORG = TRUE) and ($CHECKMCIC = TRUE))
  getsectorparameter $FOCUS "ORGMCIC" $TMP
  if (($TMP <> "") and ($TMP <> 0))
    setvar $MERCH_CANSELLORG FALSE
  end
end
if (($MERCH_CANSELLEQUIP = TRUE) and ($CHECKMCIC = TRUE))
  getsectorparameter $FOCUS "EQUMCIC" $TMP
  if (($TMP <> "") and ($TMP <> 0))
    setvar $MERCH_CANSELLEQUIP FALSE
  end
end
if (($MERCH_CANSELLORG <> TRUE) and ($MERCH_CANSELLEQUIP <> TRUE))
  return
end
if ($CHECKMCIC <> TRUE)
  if (($MERCH_CANSELLORG = TRUE) and ($SELLMCIC <> 0))
    getsectorparameter $FOCUS "ORGMCIC" $TMP
    if (($TMP <> 0) and ($TMP > $SELLMCIC))
      setvar $MERCH_CANSELLORG FALSE
    end
  end
  if (($MERCH_CANSELLEQUIP = TRUE) and ($SELLMCIC <> 0))
    getsectorparameter $FOCUS "EQUMCIC" $TMP
    if (($TMP <> 0) and ($TMP > $SELLMCIC))
      setvar $MERCH_CANSELLEQUIP FALSE
    end
  end
  if (($MERCH_CANSELLORG <> TRUE) and ($MERCH_CANSELLEQUIP <> TRUE))
    return
  end
  if ($MERCH_CANSELLORG = TRUE)
    getsectorparameter $FOCUS "ORGMCIC" $TMP
    setvar $MERCHSCORE $TMP
    if ($TMP < 0)
      setvar $MERCHSCORE (0 - $TMP)
    end
    if ($MERCHSCORE > $MERCHMCICSCORE)
      setvar $MERCHMCICSCORE $MERCHSCORE
    end
  end
  if ($MERCH_CANSELLEQUIP = TRUE)
    getsectorparameter $FOCUS "EQUMCIC" $TMP
    setvar $MERCHSCORE $TMP
    if ($TMP < 0)
      setvar $MERCHSCORE (0 - $TMP)
    end
    if ($MERCHSCORE > $MERCHMCICSCORE)
      setvar $MERCHMCICSCORE $MERCHSCORE
    end
  end
end
setvar $MERCHGOODPORT TRUE
return

:MERCHUPGRADEDPORT
setvar $MERCHUPGRADED FALSE
if (PORT.PERCENTFUEL[$FOCUS] > 0)
  setvar $MERCHPORTTOTAL (PORT.FUEL[$FOCUS] * 100)
  divide $MERCHPORTTOTAL PORT.PERCENTFUEL[$FOCUS]
  if ($MERCHPORTTOTAL > $game~port_max)
    setvar $MERCHUPGRADED TRUE
  end
elseif (PORT.FUEL[$FOCUS] > $game~port_max)
  setvar $MERCHUPGRADED TRUE
end
if (PORT.PERCENTORG[$FOCUS] > 0)
  setvar $MERCHPORTTOTAL (PORT.ORG[$FOCUS] * 100)
  divide $MERCHPORTTOTAL PORT.PERCENTORG[$FOCUS]
  if ($MERCHPORTTOTAL > $game~port_max)
    setvar $MERCHUPGRADED TRUE
  end
elseif (PORT.ORG[$FOCUS] > $game~port_max)
  setvar $MERCHUPGRADED TRUE
end
if (PORT.PERCENTEQUIP[$FOCUS] > 0)
  setvar $MERCHPORTTOTAL (PORT.EQUIP[$FOCUS] * 100)
  divide $MERCHPORTTOTAL PORT.PERCENTEQUIP[$FOCUS]
  if ($MERCHPORTTOTAL > $game~port_max)
    setvar $MERCHUPGRADED TRUE
  end
elseif (PORT.EQUIP[$FOCUS] > $game~port_max)
  setvar $MERCHUPGRADED TRUE
end
return

:DONEMERCHANT
if ($STARTINGSECTOR <> $player~current_sector)
  send "p"&$STARTINGSECTOR&"*y"
end
setvar $switchboard~message "Planet Merchant completed.*"
gosub :switchboard~switchboard
halt

:DONENOFUEL2
setvar $switchboard~message "Not enough fuel to continue.*"
gosub :switchboard~switchboard
goto :DONEMERCHANT

:NOFIGATLOCATION
setsectorparameter $NEARFIG "FIGSEC" FALSE
goto :TRYAGAIN2

# includes:
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\sector"
include "source\include\help"
include "source\include\switchboard.ts"
