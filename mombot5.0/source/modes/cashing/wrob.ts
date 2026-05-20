logging "OFF"
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $PTRADESETTING
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $ATOMIC_COST
loadvar $BEACON_COST
loadvar $CORBO_COST
loadvar $CLOAK_COST
loadvar $PROBE_COST
loadvar $PLANET_SCANNER_COST
loadvar $LIMPET_COST
loadvar $ARMID_COST
loadvar $PHOTON_COST
loadvar $HOLO_COST
loadvar $DENSITY_COST
loadvar $DISRUPTOR_COST
loadvar $GENESIS_COST
loadvar $TWARPI_COST
loadvar $TWARPII_COST
loadvar $PSYCHIC_COST
loadvar $PHOTONS_ENABLED
loadvar $PHOTON_DURATION
loadvar $MAX_COMMANDS
loadvar $GOLDENABLED
loadvar $MBBS
loadvar $MULTIPLE_PHOTONS
loadvar $COLONIST_REGEN
loadvar $PTRADESETTING
loadvar $STEAL_FACTOR
loadvar $ROB_FACTOR
loadvar $CLEAR_BUST_DAYS
loadvar $GAME~STEAL_FACTOR
loadvar $GAME~ROB_FACTOR
loadvar $GAME~CLEAR_BUST_DAYS
loadvar $PORT_MAX
loadvar $GAME~PORT_MAX
loadvar $PRODUCTION_RATE
loadvar $PRODUCTION_REGEN
loadvar $DEBRIS_LOSS
loadvar $RADIATION_LIFETIME
loadvar $LIMPET_REMOVAL_COST
loadvar $MAX_PLANETS_PER_SECTOR
loadvar $bot~folder
if (($PORT_MAX = 0) and ($GAME~PORT_MAX > 0))
  setvar $PORT_MAX $GAME~PORT_MAX
  savevar $PORT_MAX
end
if (($STEAL_FACTOR = 0) and ($GAME~STEAL_FACTOR > 0))
  setvar $STEAL_FACTOR $GAME~STEAL_FACTOR
  savevar $STEAL_FACTOR
end
if (($ROB_FACTOR = 0) and ($GAME~ROB_FACTOR > 0))
  setvar $ROB_FACTOR $GAME~ROB_FACTOR
  savevar $ROB_FACTOR
end
if (($CLEAR_BUST_DAYS = 0) and ($GAME~CLEAR_BUST_DAYS > 0))
  setvar $CLEAR_BUST_DAYS $GAME~CLEAR_BUST_DAYS
  savevar $CLEAR_BUST_DAYS
end
setvar $NO_CREDITS_FILE $bot~folder&"/MOM_"&GAMENAME&"_No_Credits.txt"


loadvar $PASSWORD
loadvar $NEWPROMPT
loadvar $SURROUNDAVOIDSHIELDEDONLY
loadvar $SURROUNDAUTOCAPTURE
loadvar $SURROUNDAVOIDALLPLANETS
loadvar $SURROUNDDONTAVOID
loadvar $STARDOCK
loadvar $BACKDOOR
loadvar $RYLOS
loadvar $ALPHA_CENTAURI
loadvar $HOME_SECTOR
loadvar $SURROUNDFIGS
loadvar $SURROUNDLIMP
loadvar $SURROUNDMINE
loadvar $SURROUNDOVERWRITE
loadvar $SURROUNDPASSIVE
loadvar $SURROUNDNORMAL
loadvar $USERNAME
loadvar $LETTER
loadvar $DEFENDERCAPPING
loadvar $BOT_TURN_LIMIT
loadvar $SAFE_SHIP
loadvar $BOT_TEAM_NAME
loadvar $SUBSPACE
loadvar $COMMAND
goto :WROB_START
include "source\include\planethaggle"
include "source\include\sector"
:WROB_START

fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- wrob [minimum rob amount] {upgraded} {skipcim}            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    Travels universe robbing ports                          "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [minimum rob amount]                                    "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - Amount that must be on port before attempting rob  "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [upgraded]                                              "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - Will only visit upgraded ports                     "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [skipcim]                                               "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - Will skip running CIM port report before running   "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [CLEAR_EMPTY]                                           "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - Will delete the empty port file                    "
  setvar $switchboard~message "Writing help file for this command in Help directory.*"
  gosub :switchboard~switchboard
end
:MERCHANT

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  setvar $switchboard~message "You must run World Rob command from a Citadel prompt.*"
  gosub :switchboard~switchboard
  halt
end

setvar $MINIMUMPORT $PARM1
isnumber $NUMBER $MINIMUMPORT
if ($NUMBER <> 1)
  setvar $switchboard~message "Minimum rob amount entered is not a number!*"
  gosub :switchboard~switchboard
  halt
end
if ($MINIMUMPORT <= 0)
  setvar $switchboard~message "Minimum rob amount must be greater than 0.*"
  gosub :switchboard~switchboard
  halt
end

getwordpos $USER_COMMAND_LINE $POS "cim"
if ($POS > 0)
  setvar $SKIPCIM TRUE
else
  setvar $SKIPCIM FALSE
end

getwordpos $USER_COMMAND_LINE $POS "upgrade"
if ($POS > 0)
  setvar $VISITUPGRADED TRUE
else
  setvar $VISITUPGRADED FALSE
end
:MERCHANT

killalltriggers
setarray $CHECKEDPORTS SECTORS
setarray $QUE SECTORS
setarray $CHECKED SECTORS
send "q"
waiton "Planet command (?"
gosub :GETPLANETINFO
send "c"
if ($CITADEL < 4)
  setvar $switchboard~message "You must run World Rob from at least a level 4 planet.*"
  gosub :switchboard~switchboard
  halt
end
gosub :PLAYER~QUIKSTATS
setvar $SECTORCOUNT 10
setvar $TOTALHOLDS 0
setvar $SPENTCREDITS 0
setvar $STARTINGSECTOR $PLAYER~CURRENT_SECTOR

if ($SKIPCIM = FALSE)
  setvar $switchboard~message "World Rob Downloading Current Port CIM Data - Comms Off*"
  gosub :switchboard~switchboard
  send "^rq"
  waitfor ": ENDINTERROG"
  setvar $switchboard~message "World Rob CIM Port Data Complete - Comms Back On*"
  gosub :switchboard~switchboard
end
lowercase $PARM1
if ($PARM1 = "clear_empty")
  delete $NO_CREDITS_FILE
  setvar $switchboard~message "'No Money' file for this bot has been cleared.*"
  gosub :switchboard~switchboard
  halt
end
setarray $EMPTY_GRID SECTORS
fileexists $EXISTS $NO_CREDITS_FILE
if ($EXISTS)
  setvar $switchboard~message "Reading 'No Money' Ports from file..*"
  gosub :switchboard~switchboard
  setvar $READ_COUNT 1
  read $NO_CREDITS_FILE $TEMP $READ_COUNT
  while ($TEMP <> "EOF")
    getword $TEMP $BUSTLOCATION 1
    setvar $EMPTY_GRID[$BUSTLOCATION] TRUE
    add $READ_COUNT 1
    read $NO_CREDITS_FILE $TEMP $READ_COUNT
  end
else
  setvar $switchboard~message "No 'No Money' file, starting clean..*"
  gosub :switchboard~switchboard
end

setvar $INFINITY 1000
while (1 < $INFINITY)
  if (($UNLIMITEDGAME = FALSE) and ($PLAYER~TURNS <= $BOT_TURN_LIMIT))
    setvar $switchboard~message "Turns too low to continue.*"
    gosub :switchboard~switchboard
    goto :DONEWORLDROB
  end
  setvar $ISFIGGED FALSE
  while ($ISFIGGED <> TRUE)
    gosub :FINDNEARESTROBPORT
    gosub :CHECKPORT
    if ($FOUNDPORT = TRUE)
      gosub :PWARP
      getsectorparameter $NEARFIG "FIGSEC" $ISFIGGED
    end
  end
  gosub :ROB
  gosub :PLAYER~QUIKSTATS
end
:DONEWORLDROB

send "p"&$STARTINGSECTOR&"*y"
setvar $switchboard~message "World Rob completed.*"
gosub :switchboard~switchboard
halt
:CHECKPORT

setvar $FOUNDPORT FALSE
send "c r "&$NEARFIG&"*q "
waiton "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"] "&$NEARFIG
killalltriggers
settextlinetrigger CRCHECKNOTHERE :CHECKPORTTRYAGAIN "I have no information about a port in that sector."
settextlinetrigger CRNEVERBEENTHERE :CHECKPORT2 "You have never visted sector"
settextlinetrigger CRCLASS0 :CHECKPORTTRYAGAIN "A  Cargo holds     :"
waiton " Items     Status  Trading % of max OnBoard"
:CHECKPORT2
killalltriggers
setvar $FOUNDPORT TRUE
:CHECKPORTTRYAGAIN

killalltriggers
if ($FOUNDPORT <> TRUE)
  setvar $CHECKEDPORTS[$NEARFIG] TRUE
end
return
:PWARP

killalltriggers
send "p"&$NEARFIG&"*y"
settextlinetrigger WARPED :EMPTYPORT2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
settextlinetrigger SAME :EMPTYPORT2 "You are already in that sector!"
settextlinetrigger DIDNOTWARP :NOFIGATLOCATION "Your own fighters must be in the destination to make a safe jump."
settextlinetrigger NOTENOUGHFUEL :DONENOFUEL2 "You do not have enough Fuel Ore on this planet to make the jump."
pause
:EMPTYPORT2
setsectorparameter $NEARFIG "FIGSEC" TRUE
return
:NOFIGATLOCATION
setvar $CHECKEDPORTS[$NEARFIG] TRUE
setsectorparameter $NEARFIG "FIGSEC" FALSE
return
:DONENOFUEL2
halt
:FINDNEARESTROBPORT


setvar $BOTTOM 1
setvar $TOP 1
setarray $CHECKED SECTORS
if ($LASTSTEAL > 0)
  setvar $QUE[1] $LASTSTEAL
  setvar $CHECKED[$LASTSTEAL] 1
else
  setvar $QUE[1] $PLAYER~CURRENT_SECTOR
  setvar $CHECKED[$PLAYER~CURRENT_SECTOR] 1
end
:TRYAGAIN2
while ($BOTTOM <= $TOP)

  setvar $FOCUS $QUE[$BOTTOM]

  getsectorparameter $FOCUS "BUSTED" $ISBUSTED
  if ($VISITUPGRADED)
    setvar $ISUPPED FALSE
    setvar $UPGRADELIMIT 10000
    if (PORT.BUYFUEL[$FOCUS] = FALSE)
      if (PORT.PERCENTFUEL[$FOCUS] <> 0)
        divide $CURRENTFUEL PORT.PERCENTFUEL[$FOCUS]
      end
      if ($CURRENTFUEL > $UPGRADELIMIT)
        setvar $ISUPPED TRUE
      end
    end
    if (PORT.BUYORG[$FOCUS] = FALSE)
      setvar $CURRENTORG PORT.ORG[$FOCUS]
      multiply $CURRENTORG 100
      if (PORT.PERCENTORG[$FOCUS] <> 0)
        divide $CURRENTORG PORT.PERCENTORG[$FOCUS]
      end
      if ($CURRENTORG > $UPGRADELIMIT)
        setvar $ISUPPED TRUE
      end
    end

    if (PORT.BUYEQUIP[$FOCUS] = FALSE)
      setvar $CURRENTEQUIP PORT.EQUIP[$FOCUS]
      multiply $CURRENTEQUIP 100
      if (PORT.PERCENTEQUIP[$FOCUS] <> 0)
        divide $CURRENTEQUIP PORT.PERCENTEQUIP[$FOCUS]
      end
      if ($CURRENTEQUIP > $UPGRADELIMIT)
        setvar $ISUPPED TRUE
      end
    end
  end
  getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
  if (($ISFIGGED = TRUE) and ((($EMPTY_GRID[$FOCUS] <> TRUE) and ((($CHECKEDPORTS[$FOCUS] <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and ((($ISBUSTED <> TRUE) and ((($FOCUS <> $PLAYER~CURRENT_SECTOR) and ((($FOCUS <> $LASTSTEAL) and (((PORT.CLASS[$FOCUS] <> 0) and (((PORT.CLASS[$FOCUS] <> 8) and ((($VISITUPGRADED = TRUE) and ($ISUPPED = TRUE)) or ($VISITUPGRADED = FALSE)))))))))))))))))))

    setvar $NEARFIG $FOCUS
    return
  else
    setvar $CHECKED[$FOCUS] 1
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
halt
return
:ROB


killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT

cuttext $PLAYER~ALIGNMENT $NEG_CK 1 1

striptext $PLAYER~ALIGNMENT "-"
if (($PLAYER~ALIGNMENT < 100) and ($NEG_CK = "-"))
  setvar $switchboard~message "Need -100 Alignment Minimum*"
  gosub :switchboard~switchboard
  halt
elseif ($NEG_CK <> "-")
  setvar $switchboard~message "Need -100 Alignment Minimum*"
  gosub :switchboard~switchboard
  halt
end
send "q q pr * r"
settextlinetrigger VALID :ROB_CONTINUE "<R> Rob this Port"
settextlinetrigger NOTVALID :ROB_NOT_VALID "<Q> Quit, nevermind"
pause
:ROB_CONTINUE
killtrigger NOTVALID
settextlinetrigger FAKE :ROB_FAKE "Busted!"
settextlinetrigger MEGA :ROB_OK "port has in excess of"
pause
:ROB_FAKE

killalltriggers
if ($STARTINGLOCATION = "Citadel")
  gosub :LANDINGSUB
end
setsectorparameter $PLAYER~CURRENT_SECTOR "BUSTED" TRUE
setvar $switchboard~message "Fake Busted*"
gosub :switchboard~switchboard
return
:ROB_OK

killalltriggers



setvar $ROB ($ROB_FACTOR * $PLAYER~EXPERIENCE)
getword CURRENTLINE $PORT_CASH 11
striptext $PORT_CASH ","
setvar $ORIGINAL_PORT_CASH $PORT_CASH
multiply $PORT_CASH 10
divide $PORT_CASH 9





if ($PORT_CASH < $MINIMUMPORT)
  echo "*Port has less than "&$MINIMUMPORT&" credits on it.*"
  send "0*"
  setvar $ROB 0
elseif ($PORT_CASH >= $ROB)
  send $ROB "*"
elseif ($PORT_CASH < $ROB)
  setvar $ROB $PORT_CASH
  send $ROB "*"
end
if ($PORT_CASH < $MINIMUMPORT)
  setvar $CHECKEDPORTS[$PLAYER~CURRENT_SECTOR] TRUE
  setvar $EMPTY_GRID[$PLAYER~CURRENT_SECTOR] TRUE
  write $NO_CREDITS_FILE $PLAYER~CURRENT_SECTOR
end
settextlinetrigger PORT_EMPTY :ROB_SUC "Maybe some other day, eh?"
settextlinetrigger MEGA_SUC :ROB_SUC "Success!"
settextlinetrigger MEGA_BUST :ROB_BUST "Busted!"
pause
:ROB_BUST

killalltriggers
if ($STARTINGLOCATION = "Citadel")
  gosub :LANDINGSUB
end
setsectorparameter $PLAYER~CURRENT_SECTOR "BUSTED" TRUE
send "'<"&$SUBSPACE&">[Busted:"&$PLAYER~CURRENT_SECTOR&"]<"&$SUBSPACE&">* "
return
:ROB_READY_TO_MEGA

killalltriggers
send "0*  "
if ($STARTINGLOCATION = "Citadel")
  gosub :LANDINGSUB
end
return
:ROB_NOT_VALID

killalltriggers
setvar $CHECKEDPORTS[$PLAYER~CURRENT_SECTOR] TRUE
setvar $EMPTY_GRID[$PLAYER~CURRENT_SECTOR] TRUE
write $NO_CREDITS_FILE $PLAYER~CURRENT_SECTOR
setvar $ROB 0
setvar $ORIGINAL_PORT_CASH 0
:ROB_SUC
killalltriggers
if ($STARTINGLOCATION = "Citadel")
  send "l " $PLANET "* c t t " $ROB "* "
end
if ($ROB > $ORIGINAL_PORT_CASH)
  setvar $CHECKEDPORTS[$PLAYER~CURRENT_SECTOR] TRUE
  setvar $EMPTY_GRID[$PLAYER~CURRENT_SECTOR] TRUE
  write $NO_CREDITS_FILE $PLAYER~CURRENT_SECTOR
end
if ($ROB > 0)
  setvar $LASTSTEAL $PLAYER~CURRENT_SECTOR
  setvar $switchboard~message "Success! - " $ROB " credits robbed*"
  gosub :switchboard~switchboard
end
return
:LANDINGSUB



send "l" $PLANET "*z  n  z  n  *  "
setvar $SUCESSFULCITADEL FALSE
setvar $SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
pause
:NOPLANET

killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return
:NO_LAND

killtrigger NOPLANET
killtrigger PLANET
killtrigger WRONGONE
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return
:PLANET

getword CURRENTLINE $PNUM_CK 2
striptext $PNUM_CK "#"
if ($PNUM_CK <> $PLANET)
  killtrigger NO_LAND
  killtrigger WRONGONE
  killtrigger NO_PLANET
  send "q"
  goto :WRONG_NUM
end
killtrigger NOPLANET
killtrigger NO_LAND
killtrigger WRONGONE
settexttrigger WRONG_NUM :WRONG_NUM "That planet is not in this sector."
settexttrigger PLANET :PLANET_PROMPT "Planet command"
pause
:WRONG_NUM

killtrigger PLANET
send "**'{" $BOT_NAME "} - Incorrect Planet Number*"
return
:PLANET_PROMPT

killtrigger WRONG_NUM
setvar $CURRENTBOTPLANET $PLANET
savevar $CURRENTBOTPLANET
send "c"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:BUILD_CIT

killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $SUCESSFULPLANET TRUE
send "n*"
setvar $STARTINGLOCATION "Planet"
return
:IN_CIT

killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $SUCESSFULCITADEL TRUE
setvar $STARTINGLOCATION "Citadel"
return
:GETPLANETINFO
gosub :PLANET~GETPLANETINFO
setvar $PLANET $PLANET~PLANET
setvar $PLAYER~CURRENT_SECTOR $PLANET~CURRENT_SECTOR
setvar $PLANETFUEL $PLANET~PLANET_FUEL
setvar $PLANETFUELMAX $PLANET~PLANET_FUEL_MAX
setvar $PLANETORG $PLANET~PLANET_ORGANICS
setvar $PLANETORGMAX $PLANET~PLANET_ORGANICS_MAX
setvar $PLANETEQUIP $PLANET~PLANET_EQUIPMENT
setvar $PLANETEQUIPMAX $PLANET~PLANET_EQUIPMENT_MAX
setvar $PLANETFIG $PLANET~PLANET_FIGHTERS
setvar $PLANETFIGMAX $PLANET~PLANET_FIGHTERS_MAX
setvar $CITADEL $PLANET~CITADEL
setvar $CITADELCREDITS $PLANET~CITADEL_CREDITS
setvar $ACANNON $PLANET~ATMOSPHERE_CANNON
setvar $SCANNON $PLANET~SECTOR_CANNON
return
:PLANETNEG









setvar $OUTPUT_FILE ""
setvar $SELLDELAY 0
setvar $OREMCIC "-90"
setvar $ORGMCIC "-75"
setvar $EQUMCIC "-65"
setvar $VERSION "3.0.0"
:VERIFYPROMPT

if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Planet "))
  setvar $EXIT_MESSAGE "Must start at Citadel or Planet Prompt for Planet Nego"
  goto :EXITNEG
end



setvar $_CK_PTRADESETTING $PTRADESETTING

if ($STARTINGLOCATION = "Citadel")
  send "Q"
elseif ($STARTINGLOCATION = "Planet ")
  setvar $STARTINGLOCATION "Planet"
end
gosub :GETPLANETINFO
send "Q"
gosub :GETINFO
send "*"


send "|CR"&$PLAYER~CURRENT_SECTOR&"*Q|"

settextlinetrigger FOUNDPORT :FOUNDPORT "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT "credits / next hold"
pause
:NOPORT

killalltriggers
gosub :NEGOTIATELAND
setvar $EXIT_MESSAGE "No port to sell to"
goto :EXITNEG
:FOUNDPORT

killalltriggers
settextlinetrigger PORTINFO1 :PORTINFO1 "Fuel Ore "
settextlinetrigger PORTINFO2 :PORTINFO2 "Organics"
settextlinetrigger PORTINFO3 :PORTINFO3 "Equipment"
settextlinetrigger GOTCR :GOTCR "Computer command [TL="
pause
:PORTINFO1

killalltriggers
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREBUYING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORETRADING 4
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREPERCENT 5
striptext $PLAYER~CURRENT_SECTOR.OREPERCENT "%"
goto :FOUNDPORT
:PORTINFO2
killalltriggers
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.ORGPERCENT "%"
goto :FOUNDPORT
:PORTINFO3
killalltriggers
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.EQUPERCENT "%"
goto :FOUNDPORT
:GOTCR


setdelaytrigger JUSTASEC :JUSTASEC 500
pause
:JUSTASEC
:INITINFO


if ($PLAYER~TURNS <= 0)
  gosub :NEGOTIATELAND
  setvar $EXIT_MESSAGE "I have no turns to negotiate this planet"
  goto :EXITNEG
end
if ($PLAYER~CREDITS > 900000000)
  gosub :NEGOTIATELAND
  setvar $EXIT_MESSAGE "I have too much cash on hand"
  goto :EXITNEG
end

setvar $FUELTOSELL $PLANETFUEL
if ($FUELTOSELL > $PLANETFUEL)
  setvar $FUELTOSELL $PLANETFUEL
end

if ($_CK_PNEGO_FUELTOSELL = "-1")
  setvar $FUELTOSELL 0
end

setvar $ORGTOSELL $PLANETORG
if ($ORGTOSELL > $PLANETORG)
  setvar $ORGTOSELL $PLANETORG
end

if ($_CK_PNEGO_ORGTOSELL = "-1")
  setvar $ORGTOSELL 0
end

setvar $EQUIPTOSELL $PLANETEQUIP
if ($EQUIPTOSELL > $PLANETEQUIP)
  setvar $EQUIPTOSELL $PLANETEQUIP
end

if ($_CK_PNEGO_EQUIPTOSELL = "-1")
  setvar $EQUIPTOSELL 0
end

killalltriggers

if (($PLAYER~CURRENT_SECTOR.OREBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.OREPERCENT < 15))
  setvar $FUELTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.ORGBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.ORGPERCENT < 15))
  setvar $ORGTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.EQUBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.EQUPERCENT < 15))
  setvar $EQUIPTOSELL 0
end
:SELLOFF


if (($FUELTOSELL <> 0) or ($ORGTOSELL <> 0) or ($EQUIPTOSELL <> 0))
  setvar $ORE_SELL_FAILURES 0
  setvar $ORG_SELL_FAILURES 0
  setvar $EQU_SELL_FAILURES 0
  setvar $ORESELLOUTPUT ""
  setvar $ORGSELLOUTPUT ""
  setvar $EQUSELLOUTPUT ""
  setvar $OREPROFIT 0
  setvar $ORGPROFIT 0
  setvar $EQUPROFIT 0

  send "|"
  gosub :SELL
  gosub :NEGOTIATELAND
  if ($STARTINGLOCATION = "Citadel")

    if ($OREPROFIT <> 0)
      send "TT"&$OREPROFIT&"*"
      subtract $PLAYER~CREDITS $OREPROFIT
    end
    if ($ORGPROFIT <> 0)
      send "TT"&$ORGPROFIT&"*"
      subtract $PLAYER~CREDITS $ORGPROFIT
    end
    if ($EQUPROFIT <> 0)
      send "TT"&$EQUPROFIT&"*"
      subtract $PLAYER~CREDITS $EQUPROFIT
    end
  end


  send "|"




  setvar $GENERALOUTPUT "*Sector "&$PLAYER~CURRENT_SECTOR&"*"
  if ($OUTPUT_FILE <> "")
    write $OUTPUT_FILE $GENERALOUTPUT
  end

  if ($ORESELLOUTPUT <> "")
    send $ORESELLOUTPUT
    if ($OUTPUT_FILE <> "")
      write $OUTPUT_FILE $ORESELLOUTPUT
    end
  end
  if ($ORGSELLOUTPUT <> "")
    send $ORGSELLOUTPUT
    if ($OUTPUT_FILE <> "")
      write $OUTPUT_FILE $ORGSELLOUTPUT
    end
  end
  if ($EQUSELLOUTPUT <> "")
    send $EQUSELLOUTPUT
    if ($OUTPUT_FILE <> "")
      write $OUTPUT_FILE $EQUSELLOUTPUT
    end
  end
  setvar $EXIT_MESSAGE "Done with port"
  goto :EXITNEG
else
  gosub :NEGOTIATELAND
  setvar $EXIT_MESSAGE "Nothing to sell"
  goto :EXITNEG
end
:SELL
:RESELL





if ($PLAYER~TURNS <= 0)
  send "'I'm out of turns*"
  return
end
setvar $THISOREFAILED 0
setvar $THISORGFAILED 0
setvar $THISEQUFAILED 0
send "PN"&$PLANET&"*"
subtract $PLAYER~TURNS 1
:GETPERCTS
gosub :PLANETHAGGLE~GETPERCTS
:SELLPRODUCT


settexttrigger SELLFUEL :SELLFUEL "How many units of Fuel Ore"
settexttrigger SELLORG :SELLORG "How many units of Organics"
settexttrigger SELLEQU :SELLEQU "How many units of Equipment"
settexttrigger DONEWITHPORT :DONEWITHPORT "Command [TL="
pause
:SELLFUEL

killalltriggers
if (($PLAYER~CURRENT_SECTOR.OREPERCENT >= 15) and ($FUELTOSELL > 0))
  if ($FUELTOSELL > $PLAYER~CURRENT_SECTOR.ORETRADING)
    setvar $FUELTOSELL $PLAYER~CURRENT_SECTOR.ORETRADING
  end
  setvar $PRODTOSELL "ore"
  setvar $PORTBUYING $FUELTOSELL
  gosub :SELLHAGGLE
  if ($CURRENTHAGGLE = "succeeded")
    setvar $OREHAGGLE "succeeded"
    setvar $FUELTOSELL 0
    subtract $OREMCIC 1
  else
    setvar $OREHAGGLE "failed"
  end
else
  send "0*"
end
goto :SELLPRODUCT
:SELLORG

killalltriggers
if (($PLAYER~CURRENT_SECTOR.ORGPERCENT >= 15) and ($ORGTOSELL > 0))
  if ($ORGTOSELL > $PLAYER~CURRENT_SECTOR.ORGTRADING)
    setvar $ORGTOSELL $PLAYER~CURRENT_SECTOR.ORGTRADING
  end
  setvar $PRODTOSELL "org"
  setvar $PORTBUYING $ORGTOSELL
  gosub :SELLHAGGLE
  if ($CURRENTHAGGLE = "succeeded")
    setvar $ORGHAGGLE "succeeded"
    setvar $ORGTOSELL 0
    subtract $ORGMCIC 1
  else
    setvar $ORGHAGGLE "failed"
  end
else
  send "0*"
end
goto :SELLPRODUCT
:SELLEQU

killalltriggers
if (($PLAYER~CURRENT_SECTOR.EQUPERCENT >= 15) and ($EQUIPTOSELL > 0))
  if ($EQUIPTOSELL > $PLAYER~CURRENT_SECTOR.EQUTRADING)
    setvar $EQUIPTOSELL $PLAYER~CURRENT_SECTOR.EQUTRADING
  end
  setvar $PRODTOSELL "equ"
  setvar $PORTBUYING $EQUIPTOSELL
  gosub :SELLHAGGLE
  if ($CURRENTHAGGLE = "succeeded")
    setvar $EQUHAGGLE "succeeded"
    setvar $EQUIPTOSELL 0
    subtract $EQUMCIC 1
  else
    setvar $EQUHAGGLE "failed"
  end
else
  send "0*"
end
goto :SELLPRODUCT
:DONEWITHPORT

killalltriggers
if (($ORE_SELL_FAILURES > 4) or ($ORG_SELL_FAILURES > 4) or ($EQU_SELL_FAILURES > 4))
  setvar $SELLOUTPUT $SELLOUTPUT&"Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
  return
elseif (($FUELTOSELL = 0) and (($ORGTOSELL = 0) and ($EQUIPTOSELL = 0)))
  return
else
  goto :RESELL
end
:SELLHAGGLE




settextlinetrigger SELLFIRSTOFFER :SELLFIRSTOFFER "We'll buy them for"
send $PORTBUYING&"*"
pause
:SELLFIRSTOFFER

killalltriggers
getword CURRENTLINE $OFFER 5
striptext $OFFER ","

gosub :SWATHOFF
if ($SWATHOFF = FALSE)
  gosub :NEGOTIATELAND
  setvar $EXIT_MESSAGE $SWATHOFFMESSAGE
  goto :EXITNEG
end



setvar $PERUNITINITOFFER $OFFER


multiply $PERUNITINITOFFER 100
divide $PERUNITINITOFFER $_CK_PTRADESETTING


multiply $PERUNITINITOFFER 100


divide $PERUNITINITOFFER $PORTBUYING


setvar $PORTMAXINIT $PERUNITINITOFFER


divide $PERUNITINITOFFER 10

if ($PRODTOSELL = "ore")

  setvar $BASEVALUE 256055800
  setvar $BASEPERCENT 11725
  setvar $BASEPERCENTINVERSE 88275
  setvar $PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.OREPERCENT
elseif ($PRODTOSELL = "org")

  setvar $BASEVALUE 506276400
  setvar $BASEPERCENT 11287
  setvar $BASEPERCENTINVERSE 88713
  setvar $PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.ORGPERCENT
elseif ($PRODTOSELL = "equ")

  setvar $BASEVALUE 906281000
  setvar $BASEPERCENT 10989
  setvar $BASEPERCENTINVERSE 89010
  setvar $PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.EQUPERCENT

end
if ($PERCENTFROMBASE = 100)
  echo "* 100% port*"

  divide $PORTMAXINIT 10

elseif ($PERCENTFROMBASE >= 15)

  multiply $PORTMAXINIT 100000


  subtract $PORTMAXINIT $BASEVALUE


  multiply $PERCENTFROMBASE 1000


  subtract $PERCENTFROMBASE $BASEPERCENT


  divide $PORTMAXINIT $PERCENTFROMBASE


  multiply $PORTMAXINIT $BASEPERCENTINVERSE


  add $PORTMAXINIT $BASEVALUE


  divide $PORTMAXINIT 1000000

elseif ($PRODTOSELL = "ore")
  setvar $PORTMAXINIT 340

elseif ($PRODTOSELL = "org")
  setvar $PORTMAXINIT 635

elseif ($PRODTOSELL = "equ")
  setvar $PORTMAXINIT 1063





end
if ($PRODTOSELL = "ore")
  if ($PORTMAXINIT >= 436)
    setvar $MCIC "-90"
    setvar $MULTIPLE 1494

  elseif ($PORTMAXINIT >= 434)
    setvar $MCIC "-89"
    setvar $MULTIPLE 1488

  elseif ($PORTMAXINIT >= 433)
    setvar $MCIC "-88"
    setvar $MULTIPLE 1482

  elseif ($PORTMAXINIT >= 431)
    setvar $MCIC "-87"
    setvar $MULTIPLE 1476

  elseif ($PORTMAXINIT >= 429)
    setvar $MCIC "-86"
    setvar $MULTIPLE 1470

  elseif ($PORTMAXINIT >= 427)
    setvar $MCIC "-85"
    setvar $MULTIPLE 1464

  elseif ($PORTMAXINIT >= 425)
    setvar $MCIC "-84"
    setvar $MULTIPLE 1458

  elseif ($PORTMAXINIT >= 424)
    setvar $MCIC "-83"
    setvar $MULTIPLE 1452

  elseif ($PORTMAXINIT >= 422)
    setvar $MCIC "-82"
    setvar $MULTIPLE 1446

  elseif ($PORTMAXINIT >= 420)
    setvar $MCIC "-81"
    setvar $MULTIPLE 1440

  elseif ($PORTMAXINIT >= 418)
    setvar $MCIC "-80"
    setvar $MULTIPLE 1434

  elseif ($PORTMAXINIT >= 416)
    setvar $MCIC "-79"
    setvar $MULTIPLE 1429

  elseif ($PORTMAXINIT >= 414)
    setvar $MCIC "-78"
    setvar $MULTIPLE 1423

  elseif ($PORTMAXINIT >= 412)
    setvar $MCIC "-77"
    setvar $MULTIPLE 1417

  elseif ($PORTMAXINIT >= 411)
    setvar $MCIC "-76"
    setvar $MULTIPLE 1411

  elseif ($PORTMAXINIT >= 409)
    setvar $MCIC "-75"
    setvar $MULTIPLE 1405

  elseif ($PORTMAXINIT >= 407)
    setvar $MCIC "-74"
    setvar $MULTIPLE 1399

  elseif ($PORTMAXINIT >= 405)
    setvar $MCIC "-73"
    setvar $MULTIPLE 1393

  elseif ($PORTMAXINIT >= 403)
    setvar $MCIC "-72"
    setvar $MULTIPLE 1387

  elseif ($PORTMAXINIT >= 401)
    setvar $MCIC "-71"
    setvar $MULTIPLE 1381

  elseif ($PORTMAXINIT >= 399)
    setvar $MCIC "-70"
    setvar $MULTIPLE 1375

  elseif ($PORTMAXINIT >= 397)
    setvar $MCIC "-69"
    setvar $MULTIPLE 1369

  elseif ($PORTMAXINIT >= 396)
    setvar $MCIC "-68"
    setvar $MULTIPLE 1363

  elseif ($PORTMAXINIT >= 394)
    setvar $MCIC "-67"
    setvar $MULTIPLE 1357

  elseif ($PORTMAXINIT >= 392)
    setvar $MCIC "-66"
    setvar $MULTIPLE 1351

  elseif ($PORTMAXINIT >= 390)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1345

  elseif ($PORTMAXINIT >= 388)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1342

  elseif ($PORTMAXINIT >= 386)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336

  elseif ($PORTMAXINIT >= 384)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330

  elseif ($PORTMAXINIT >= 382)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324

  elseif ($PORTMAXINIT >= 380)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1318

  elseif ($PORTMAXINIT >= 378)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1312

  elseif ($PORTMAXINIT >= 376)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1306

  elseif ($PORTMAXINIT >= 374)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1300

  elseif ($PORTMAXINIT >= 372)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1294

  elseif ($PORTMAXINIT >= 370)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291

  elseif ($PORTMAXINIT >= 368)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285

  elseif ($PORTMAXINIT >= 366)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279

  elseif ($PORTMAXINIT >= 364)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1273

  elseif ($PORTMAXINIT >= 362)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1267

  elseif ($PORTMAXINIT >= 360)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1261

  elseif ($PORTMAXINIT >= 358)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1255

  elseif ($PORTMAXINIT >= 356)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1249

  elseif ($PORTMAXINIT >= 354)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1246

  elseif ($PORTMAXINIT >= 352)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1240

  elseif ($PORTMAXINIT >= 350)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1234

  elseif ($PORTMAXINIT >= 348)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1228

  elseif ($PORTMAXINIT >= 346)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1222

  elseif ($PORTMAXINIT >= 344)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1219

  elseif ($PORTMAXINIT >= 342)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1209

  elseif ($PORTMAXINIT >= 340)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1208

  else
    setvar $MCIC 0
    setvar $MULTIPLE 1208


  end
elseif ($PRODTOSELL = "org")
  if ($PORTMAXINIT >= 813)
    setvar $MCIC "-75"
    setvar $MULTIPLE 1405

  elseif ($PORTMAXINIT >= 810)
    setvar $MCIC "-74"
    setvar $MULTIPLE 1399

  elseif ($PORTMAXINIT >= 806)
    setvar $MCIC "-73"
    setvar $MULTIPLE 1393

  elseif ($PORTMAXINIT >= 802)
    setvar $MCIC "-72"
    setvar $MULTIPLE 1387

  elseif ($PORTMAXINIT >= 798)
    setvar $MCIC "-71"
    setvar $MULTIPLE 1381

  elseif ($PORTMAXINIT >= 795)
    setvar $MCIC "-70"
    setvar $MULTIPLE 1375

  elseif ($PORTMAXINIT >= 791)
    setvar $MCIC "-69"
    setvar $MULTIPLE 1369

  elseif ($PORTMAXINIT >= 787)
    setvar $MCIC "-68"
    setvar $MULTIPLE 1363

  elseif ($PORTMAXINIT >= 783)
    setvar $MCIC "-67"
    setvar $MULTIPLE 1357

  elseif ($PORTMAXINIT >= 779)
    setvar $MCIC "-66"
    setvar $MULTIPLE 1351

  elseif ($PORTMAXINIT >= 775)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1345

  elseif ($PORTMAXINIT >= 772)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1339

  elseif ($PORTMAXINIT >= 768)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336

  elseif ($PORTMAXINIT >= 764)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330

  elseif ($PORTMAXINIT >= 760)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324

  elseif ($PORTMAXINIT >= 756)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1318

  elseif ($PORTMAXINIT >= 752)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1312

  elseif ($PORTMAXINIT >= 748)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1306

  elseif ($PORTMAXINIT >= 744)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1300

  elseif ($PORTMAXINIT >= 740)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1294

  elseif ($PORTMAXINIT >= 737)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291

  elseif ($PORTMAXINIT >= 733)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285

  elseif ($PORTMAXINIT >= 729)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279

  elseif ($PORTMAXINIT >= 725)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1273

  elseif ($PORTMAXINIT >= 721)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1267

  elseif ($PORTMAXINIT >= 717)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1261

  elseif ($PORTMAXINIT >= 713)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1255

  elseif ($PORTMAXINIT >= 709)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1252

  elseif ($PORTMAXINIT >= 705)
    setvar $MCIC "-47"
    setvar $MULTIPLE 1246

  elseif ($PORTMAXINIT >= 701)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1236

  elseif ($PORTMAXINIT >= 697)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1233

  elseif ($PORTMAXINIT >= 693)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1227

  elseif ($PORTMAXINIT >= 688)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1224

  elseif ($PORTMAXINIT >= 684)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1214

  elseif ($PORTMAXINIT >= 680)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1213

  elseif ($PORTMAXINIT >= 676)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1203

  elseif ($PORTMAXINIT >= 672)
    setvar $MCIC "-39"
    setvar $MULTIPLE 1200

  elseif ($PORTMAXINIT >= 668)
    setvar $MCIC "-38"
    setvar $MULTIPLE 1194

  elseif ($PORTMAXINIT >= 664)
    setvar $MCIC "-37"
    setvar $MULTIPLE 1191

  elseif ($PORTMAXINIT >= 660)
    setvar $MCIC "-36"
    setvar $MULTIPLE 1181

  elseif ($PORTMAXINIT >= 656)
    setvar $MCIC "-35"
    setvar $MULTIPLE 1178

  elseif ($PORTMAXINIT >= 651)
    setvar $MCIC "-34"
    setvar $MULTIPLE 1172

  elseif ($PORTMAXINIT >= 647)
    setvar $MCIC "-33"
    setvar $MULTIPLE 1166

  elseif ($PORTMAXINIT >= 643)
    setvar $MCIC "-32"
    setvar $MULTIPLE 1160

  elseif ($PORTMAXINIT >= 639)
    setvar $MCIC "-31"
    setvar $MULTIPLE 1157

  elseif ($PORTMAXINIT >= 635)
    setvar $MCIC "-30"
    setvar $MULTIPLE 1154

  else
    setvar $MCIC 0
    setvar $MULTIPLE 1154

  end
elseif ($PRODTOSELL = "equ")
  if ($PORTMAXINIT >= 1393)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1347

  elseif ($PORTMAXINIT >= 1386)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1341

  elseif ($PORTMAXINIT >= 1379)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336

  elseif ($PORTMAXINIT >= 1372)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330

  elseif ($PORTMAXINIT >= 1365)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324

  elseif ($PORTMAXINIT >= 1358)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1319

  elseif ($PORTMAXINIT >= 1351)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1313

  elseif ($PORTMAXINIT >= 1344)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1307

  elseif ($PORTMAXINIT >= 1337)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1302

  elseif ($PORTMAXINIT >= 1329)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1296

  elseif ($PORTMAXINIT >= 1323)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291

  elseif ($PORTMAXINIT >= 1315)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285

  elseif ($PORTMAXINIT >= 1308)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279

  elseif ($PORTMAXINIT >= 1301)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1274

  elseif ($PORTMAXINIT >= 1294)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1268

  elseif ($PORTMAXINIT >= 1287)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1262

  elseif ($PORTMAXINIT >= 1279)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1254

  elseif ($PORTMAXINIT >= 1272)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1247

  elseif ($PORTMAXINIT >= 1265)
    setvar $MCIC "-47"
    setvar $MULTIPLE 1246

  elseif ($PORTMAXINIT >= 1258)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1241

  elseif ($PORTMAXINIT >= 1251)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1235

  elseif ($PORTMAXINIT >= 1243)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1229

  elseif ($PORTMAXINIT >= 1236)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1224

  elseif ($PORTMAXINIT >= 1229)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1218

  elseif ($PORTMAXINIT >= 1221)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1213

  elseif ($PORTMAXINIT >= 1214)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1208

  elseif ($PORTMAXINIT >= 1206)
    setvar $MCIC "-39"
    setvar $MULTIPLE 1201

  elseif ($PORTMAXINIT >= 1199)
    setvar $MCIC "-38"
    setvar $MULTIPLE 1196

  elseif ($PORTMAXINIT >= 1192)
    setvar $MCIC "-37"
    setvar $MULTIPLE 1190

  elseif ($PORTMAXINIT >= 1184)
    setvar $MCIC "-36"
    setvar $MULTIPLE 1185

  elseif ($PORTMAXINIT >= 1177)
    setvar $MCIC "-35"
    setvar $MULTIPLE 1180

  elseif ($PORTMAXINIT >= 1169)
    setvar $MCIC "-34"
    setvar $MULTIPLE 1174

  elseif ($PORTMAXINIT >= 1162)
    setvar $MCIC "-33"
    setvar $MULTIPLE 1169

  elseif ($PORTMAXINIT >= 1154)
    setvar $MCIC "-32"
    setvar $MULTIPLE 1164

  elseif ($PORTMAXINIT >= 1147)
    setvar $MCIC "-31"
    setvar $MULTIPLE 1158

  elseif ($PORTMAXINIT >= 1139)
    setvar $MCIC "-30"
    setvar $MULTIPLE 1152

  elseif ($PORTMAXINIT >= 1132)
    setvar $MCIC "-29"
    setvar $MULTIPLE 1149

  elseif ($PORTMAXINIT >= 1124)
    setvar $MCIC "-28"
    setvar $MULTIPLE 1144

  elseif ($PORTMAXINIT >= 1116)
    setvar $MCIC "-27"
    setvar $MULTIPLE 1136

  elseif ($PORTMAXINIT >= 1109)
    setvar $MCIC "-26"
    setvar $MULTIPLE 1132

  elseif ($PORTMAXINIT >= 1101)
    setvar $MCIC "-25"
    setvar $MULTIPLE 1126

  elseif ($PORTMAXINIT >= 1093)
    setvar $MCIC "-24"
    setvar $MULTIPLE 1122

  elseif ($PORTMAXINIT >= 1086)
    setvar $MCIC "-23"
    setvar $MULTIPLE 1117

  elseif ($PORTMAXINIT >= 1078)
    setvar $MCIC "-22"
    setvar $MULTIPLE 1110

  elseif ($PORTMAXINIT >= 1071)
    setvar $MCIC "-21"
    setvar $MULTIPLE 1105

  elseif ($PORTMAXINIT >= 1063)
    setvar $MCIC "-20"
    setvar $MULTIPLE 1102

  else
    setvar $MCIC 0
    setvar $MULTIPLE 1102



  end
end
setvar $COUNTER $OFFER
divide $COUNTER 10
multiply $COUNTER $MULTIPLE
divide $COUNTER 100
send $COUNTER&"*"
setvar $MIDHAGGLES 0
:SELLOFFERLOOP
settextlinetrigger SELLPRICE :SELLPRICE "We'll buy them for"
settextlinetrigger SELLFINALOFFER :SELLFINALOFFER "Our final offer"

settextlinetrigger SELLEXPERIENCE :SELLEXPERIENCE "experience point(s)"
settextlinetrigger SELLYOUHAVE :SELLYOUHAVE "You have"

settextlinetrigger SELLSCREWUP1 :SELLSCREWUP "Get real ion-brain, make me a real offer."
settextlinetrigger SELLSCREWUP2 :SELLSCREWUP "This is the big leagues Jr.  Make a real offer."
settextlinetrigger SELLSCREWUP3 :SELLSCREWUP "My patience grows short with you."
settextlinetrigger SELLSCREWUP4 :SELLSCREWUP "I have much better things to do than waste my time.  Try again."
settextlinetrigger SELLSCREWUP5 :SELLSCREWUP "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
settextlinetrigger SELLSCREWUP6 :SELLSCREWUP "Quit playing around, you're wasting my time!"
settextlinetrigger SELLSCREWUP7 :SELLSCREWUP "Make a real offer or get the h"
settextlinetrigger SELLSCREWUP8 :SELLSCREWUP "WHAT?!@!? you must be crazy!"
settextlinetrigger SELLSCREWUP9 :SELLSCREWUP "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger SELLSCREWUP10 :SELLSCREWUP "What do you take me for, a fool?  Make a real offer!"
pause
pause
:SELLSCREWUP
killalltriggers
multiply $COUNTER 98
divide $COUNTER 100
send $COUNTER&"*"
goto :SELLOFFERLOOP
:SELLPRICE
killalltriggers
add $MIDHAGGLES 1
setvar $OLD_OFFER $OFFER
setvar $OLD_COUNTER $COUNTER
getword CURRENTLINE $OFFER 5
striptext $OFFER ","


setvar $OFFER_CHANGE $OFFER
subtract $OFFER_CHANGE $OLD_OFFER
if ($MCIC > "-35")
  multiply $OFFER_CHANGE 75
  divide $OFFER_CHANGE 100
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 25
elseif ($MCIC > "-55")
  multiply $OFFER_CHANGE 65
  divide $OFFER_CHANGE 100
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 25
else
  multiply $OFFER_CHANGE 60
  divide $OFFER_CHANGE 100
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 10
end
send $COUNTER&"*"
goto :SELLOFFERLOOP
:SELLFINALOFFER
killalltriggers



if (($PRODTOSELL = "ore") and (($MCIC <= "-75") and (($PORTBUYING >= 25000) and (($MIDHAGGLES < 1) and ($ORE_SELL_FAILURES < 2)))))
  setvar $FORCEFAIL 1
  setvar $THISOREFAILED 1
elseif (($PRODTOSELL = "org") and ((($MCIC <= "-60") and ((($PORTBUYING >= 25000) and ((($MIDHAGGLES < 2) and (($THISOREFAILED = 1) or ($ORG_SELL_FAILURES < 4)))))))))
  setvar $FORCEFAIL 1
  setvar $THISORGFAILED 1
elseif (($PRODTOSELL = "org") and ((($MCIC <= "-60") and ((($PORTBUYING >= 15000) and ((($MIDHAGGLES < 1) and (($THISOREFAILED = 1) or ($ORG_SELL_FAILURES < 2)))))))))
  setvar $FORCEFAIL 1
  setvar $THISORGFAILED 1
elseif (($PRODTOSELL = "equ") and ((($MCIC <= "-55") and ((($PORTBUYING >= 20000) and ((($MIDHAGGLES < 2) and (($THISOREFAILED = 1) or ($THISORGFAILED = 1) or ($EQU_SELL_FAILURES < 4)))))))))
  setvar $FORCEFAIL 1
  setvar $THISEQUFAILED 1
elseif (($PRODTOSELL = "equ") and ((($MCIC <= "-55") and ((($PORTBUYING >= 12000) and ((($MIDHAGGLES < 1) and (($THISOREFAILED = 1) or ($THISORGFAILED = 1) or ($EQU_SELL_FAILURES < 2)))))))))
  setvar $FORCEFAIL 1
  setvar $THISEQUFAILED 1
else
  setvar $FORCEFAIL 0

end
if ($FORCEFAIL = 0)
  setvar $OLD_OFFER $OFFER
  setvar $OLD_COUNTER $COUNTER
  getword CURRENTLINE $OFFER 5
  striptext $OFFER ","
  setvar $OFFER_CHANGE $OFFER
  subtract $OFFER_CHANGE $OLD_OFFER
  if ($PRODTOSELL = "ore")
    multiply $OFFER_CHANGE 30
  elseif ($PRODTOSELL = "org")
    multiply $OFFER_CHANGE 27
  elseif ($PRODTOSELL = "equ")
    multiply $OFFER_CHANGE 25
  end
  divide $OFFER_CHANGE 10
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 10
  send $COUNTER&"*"
else

  send $COUNTER&"*"
end
goto :SELLOFFERLOOP
:SELLNOTINTERESTED
killalltriggers
goto :SELLHAGGLEFAILED
:SELLEXPERIENCE
killalltriggers
getword CURRENTLINE $EXP_BONUS 7
add $PLAYER~EXPERIENCE $EXP_BONUS
goto :SELLOFFERLOOP
:SELLYOUHAVE
killalltriggers
setvar $OLDCREDITS $PLAYER~CREDITS
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
if ($OLDCREDITS = $PLAYER~CREDITS)
  setvar $CURRENTHAGGLE "failed"
  goto :SELLHAGGLEFAILED
else
  setvar $CURRENTHAGGLE "succeeded"
  goto :SELLHAGGLESUCCEEDED
end
:SELLHAGGLEFAILED
if ($PRODTOSELL = "ore")
  add $ORE_SELL_FAILURES 1
elseif ($PRODTOSELL = "org")
  add $ORG_SELL_FAILURES 1
elseif ($PRODTOSELL = "equ")
  add $EQU_SELL_FAILURES 1
end
if ($SELLDELAY > 99)
  setdelaytrigger SELLDELAY :SELLDELAY $SELLDELAY
  pause
  :SELLDELAY
end
return
:SELLHAGGLESUCCEEDED

setvar $PERUNIT $COUNTER
divide $PERUNIT $PORTBUYING

setvar $SELLOUTPUT "'"
setvar $SELLOUTPUT $SELLOUTPUT&$PORTBUYING&" "&$PRODTOSELL&" for "&$COUNTER&" cr"
setvar $SELLOUTPUT $SELLOUTPUT&" - "
if ($PRODTOSELL = "ore")
  setvar $SELLOUTPUT $SELLOUTPUT&$ORE_SELL_FAILURES
elseif ($PRODTOSELL = "org")
  setvar $SELLOUTPUT $SELLOUTPUT&$ORG_SELL_FAILURES
elseif ($PRODTOSELL = "equ")
  setvar $SELLOUTPUT $SELLOUTPUT&$EQU_SELL_FAILURES
end
setvar $SELLOUTPUT $SELLOUTPUT&" fails"
setvar $SELLOUTPUT $SELLOUTPUT&" - "&$PERUNIT&"/unit"


setvar $SELLOUTPUT $SELLOUTPUT&" - MCIC "&$MCIC
if ($PRODTOSELL = "ore")
  setvar $SELLOUTPUT $SELLOUTPUT&"/-90*"
  setvar $ORESELLOUTPUT $SELLOUTPUT
  setvar $OREPROFIT $COUNTER
elseif ($PRODTOSELL = "org")
  setvar $SELLOUTPUT $SELLOUTPUT&"/-75*"
  setvar $ORGSELLOUTPUT $SELLOUTPUT
  setvar $ORGPROFIT $COUNTER
elseif ($PRODTOSELL = "equ")
  setvar $SELLOUTPUT $SELLOUTPUT&"/-65*"
  setvar $EQUSELLOUTPUT $SELLOUTPUT
  setvar $EQUPROFIT $COUNTER

end
if ($SELLDELAY > 99)
  setdelaytrigger SELLDELAY :SELLDELAY2 $SELLDELAY
  pause
  pause
  :SELLDELAY2
end
return
:NEGOTIATELAND



if ($STARTINGLOCATION = "Citadel")
  send "L "&$PLANET&"* "
  gosub :GETPLANETINFO
  send "c "
elseif ($STARTINGLOCATION = "Planet")
  send "L "&$PLANET&"* "
  gosub :GETPLANETINFO
end
return
:EXITNEG


send "'Planet Negotiation exiting --- "&$EXIT_MESSAGE&"*"
return
:GETINFO
gosub :PLAYER~GETINFO
setvar $TRADER_NAME $PLAYER~TRADER_NAME
setvar $CORPSTRING $PLAYER~CORPSTRING
setvar $TURNS_PER_WARP $PLAYER~TURNS_PER_WARP
setvar $TWARP_1_RANGE $PLAYER~TWARP_1_RANGE
setvar $TWARP_2_RANGE $PLAYER~TWARP_2_RANGE
setvar $EMPTY_HOLDS $PLAYER~EMPTY_HOLDS
return
:SWATHOFF



if ($SWATHOFF = FALSE)
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  :SWATHISON

  killalltriggers
  setvar $SWATHOFFMESSAGE "Detected SWATH Autohaggle"
  setvar $SWATHOFF FALSE
  return
  :SWATHISOFF

  killalltriggers
  setvar $SWATHOFF TRUE
end
return
:NOFIGATLOCATION


setsectorparameter $NEARFIG "FIGSEC" FALSE
goto :TRYAGAIN2
:BUYDOWNFUEL

setvar $UPGRADE FALSE
killalltriggers
gosub :PLAYER~QUIKSTATS
send "q"
waiton "Planet command (?"
gosub :GETPLANETINFO
send "c"
if ($UPGRADE)
  setvar $TOTAL_CREDS_NEEDED (300 * 7000)
  if ($TOTAL_CREDS_NEEDED > $PLAYER~CREDITS)
    setvar $CASHONHAND $CITADELCREDITS
    add $CASHONHAND $PLAYER~CREDITS
    if ($CASHONHAND > $TOTAL_CREDS_NEEDED)
      send "T T "&$PLAYER~CREDITS&"* "
      send "T F "&$TOTAL_CREDS_NEEDED&"* "
      setvar $PLAYER~CREDITS $TOTAL_CREDS_NEEDED
    end
  end
  send "q q *O 1"
  waiton ", 0 to quit)"
  getword CURRENTLINE $UPGRADEAMOUNT 9
  striptext $UPGRADEAMOUNT "("
  send $UPGRADEAMOUNT&"* * *CR*Q"
  waiton "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
  settextlinetrigger GETFUEL2 :FUELDURING "Fuel Ore"
  pause
  :FUELDURING
  killalltriggers
  getword CURRENTLINE $TOTALPORTFUEL 4
  waiton "<Computer deactivated>"
  gosub :PLAYER~QUIKSTATS
else
  send "q q *cr*q"
  waiton "Fuel Ore"
  getword CURRENTLINE $TOTALPORTFUEL 4
end
if (($PLANETFUELMAX - $PLANETFUEL) < $TOTALPORTFUEL)
  setvar $TURNSTOEMPTY (($PLANETFUELMAX - $PLANETFUEL) / $PLAYER~TOTAL_HOLDS)
  setvar $ISDONE TRUE
else
  setvar $TURNSTOEMPTY ($TOTALPORTFUEL / $PLAYER~TOTAL_HOLDS)
end
setvar $TOTAL_CREDS_NEEDED ($TURNSTOEMPTY * ($PLAYER~TOTAL_HOLDS * 35))
if ($PLAYER~CREDITS < $TOTAL_CREDS_NEEDED)
  gosub :GETFUELCASH
end
if ($PLAYER~CREDITS < $TOTAL_CREDS_NEEDED)
  gosub :LANDONPLANETENTERCITADEL
  return
end
setvar $CREDITSBEFORE $PLAYER~CREDITS
if (($UNLIMITEDGAME = FALSE) and (($PLAYER~TURNS - $TURNSTOEMPTY) <= $BOT_TURN_LIMIT))
  setvar $TURNSTOOLOW TRUE
  gosub :LANDONPLANETENTERCITADEL
  return
end
while ($TURNSTOEMPTY > 1)
  setvar $CREDITSBEFORE $PLAYER~CREDITS
  if ($TURBO)
    send "P T * * l j"&#8&$PLANET&"*   t  n  l 1*  q * "
  else
    send "P T * * l j"&#8&$PLANET&"*   t  n  l 1*  q * /"
  end
  subtract $TURNSTOEMPTY 1
  add $TOTALHOLDS $PLAYER~TOTAL_HOLDS
  if ($TURBO <> TRUE)
    waiton "Creds"
  end
end
gosub :PLAYER~QUIKSTATS
if (($PLAYER~TURNS < $BOT_TURN_LIMIT) and ($UNLIMITEDGAME = FALSE))
  gosub :LANDONPLANETENTERCITADEL
  return
end
add $SPENTCREDITS ($CREDITSBEFORE - $PLAYER~CREDITS)
gosub :LANDONPLANETENTERCITADEL
return
:LANDONPLANETENTERCITADEL
setvar $PLANET~PLANET $PLANET
gosub :PLANET~LANDONPLANETENTERCITADEL
setvar $PLANETFUEL $PLANET~PLANETFUEL
return
:GETFUELCASH

send "l " $PLANET "*   c t f"&$TOTAL_CREDS_NEEDED&"*qq"
gosub :PLAYER~QUIKSTATS
return
include "source\include\switchboard.ts"
