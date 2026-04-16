gosub :BOT~LOADVARS
loadvar $MAP~STARDOCK
loadvar $MAP~HOME_SECTOR
loadvar $SHIP~CAP_FILE
loadvar $PLANET~PLANET_FILE
loadvar $GAME~PORT_MAX

gosub :COMBAT~INIT


setvar $BOT~HELP[1] $BOT~TAB&"Hunts down aliens and captures their ships.  "
setvar $BOT~HELP[2] $BOT~TAB&"Will automatically turn ships and planet personal."
setvar $BOT~HELP[3] $BOT~TAB&"Will use shields on planet as well."
setvar $BOT~HELP[4] $BOT~TAB&"Best to use with a defender ship."
setvar $BOT~HELP[5] $BOT~TAB&"         "
setvar $BOT~HELP[6] $BOT~TAB&"Options: "
setvar $BOT~HELP[7] $BOT~TAB&"          {off} - Turns off script and sets planet and ship corporate."
setvar $BOT~HELP[8] $BOT~TAB&"         {corp} - Doesn't turn everything personal."
setvar $BOT~HELP[9] $BOT~TAB&"         {sell} - Sell everyship you capture at dock and deposit the cash."
setvar $BOT~HELP[10] $BOT~TAB&"       {refuel} - Refuel planet if possible."
setvar $BOT~HELP[11] $BOT~TAB&"      {upgrade} - Upgrade fuel port if possible."
setvar $BOT~HELP[12] $BOT~TAB&"       {cannon} - Will reset cannon levels after hunting alien."
setvar $BOT~HELP[13] $BOT~TAB&"       {return} - Return to starting sector after each hunt."
setvar $BOT~HELP[14] $BOT~TAB&"      {passive} - Surround passively when hunting."
setvar $BOT~HELP[15] $BOT~TAB&"       {buyfig} - Auto buy figs when low.  Withdraws from citadel."
setvar $BOT~HELP[16] $BOT~TAB&"    {buyshield} - Auto buy shields when low.  Withdraws from citadel."
setvar $BOT~HELP[17] $BOT~TAB&"         {patp} - When planet is less than 10% of fuel, run patp."
setvar $BOT~HELP[18] $BOT~TAB&"         {home} - Move ships to starting sector instead of stardock."
setvar $BOT~HELP[19] $BOT~TAB&"{"&#34&"ship filter"&#34&"} - move ships matching this home, stardock for the others"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Alien Hunter"
gosub :BOT~BANNER

setvar $PLAYER~SAVE TRUE

setvar $START_FIG_HIT "Deployed Fighters Report Sector "
setvar $END_FIG_HIT ":"
setvar $ALIEN_ANSI #27&"[1;36m"&#27&"["
setvar $START_FIG_HIT_OWNER ":"
setvar $END_FIG_HIT_OWNER "'s"

window "ALIENHUNT_SCRIPT" 560 170 "Alienhunt - "&GAMENAME "ONTOP"


getsectorparameter SECTORS "FIGSEC" $ISFIGGED
if (($MAP~STARDOCK = 0) or ($MAP~STARDOCK = ""))
  setvar $SWITCHBOARD~MESSAGE "Stardock is not defined.  Please define stardock variable in the bot.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($ISFIGGED = "")
  setvar $SWITCHBOARD~MESSAGE "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Must run alien hunter commands from citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($BOT~PARM1 = "off")
  send "qoccco*cq"
  waiton "<Computer deactivated>"
  setvar $SWITCHBOARD~MESSAGE "Alien hunter shutting down.  Making ship and planet corporate again.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($PLAYER~PHOTONS > 0)
  setvar $SWITCHBOARD~MESSAGE "Please pick a ship with no photons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos $BOT~USER_COMMAND_LINE $POS "corp"
if ($POS > 0)
  setvar $CORP TRUE
else
  setvar $CORP FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "patp"
if ($POS > 0)
  setvar $PATP TRUE
else
  setvar $PATP FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "buyfig"
if ($POS > 0)
  setvar $BUYFIG TRUE
else
  setvar $BUYFIG FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "buyshield"
if ($POS > 0)
  setvar $BUYSHIELD TRUE
else
  setvar $BUYSHIELD FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "fuel"
if ($POS > 0)
  setvar $REFUEL TRUE
else
  setvar $REFUEL FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "upgrade"
if ($POS > 0)
  setvar $UPGRADE TRUE
else
  setvar $UPGRADE FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "sell"
if ($POS > 0)
  setvar $SELL TRUE
else
  setvar $SELL FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "cannon"
if ($POS > 0)
  setvar $CANNON TRUE
else
  setvar $CANNON FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "passive"
if ($POS > 0)
  setvar $PASSIVE TRUE
else
  setvar $PASSIVE FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "return"
if ($POS > 0)
  setvar $RETURN TRUE
else
  setvar $RETURN FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "home"
if ($POS > 0)
  setvar $HOME TRUE
else
  setvar $HOME FALSE
end
setvar $FILTERSHIPS ""
getwordpos $BOT~USER_COMMAND_LINE $POS #34
if ($POS > 0)
  gettext $BOT~USER_COMMAND_LINE $FILTERSHIPS #34 #34
  if ($FILTERSHIPS = FALSE)
    setvar $SWITCHBOARD~MESSAGE "Invalid ship filter entered.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  else
    setvar $SWITCHBOARD~MESSAGE "Moving all ships matching: ["&$FILTERSHIPS&"], and bringing them home.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
end





gosub :PLAYER~GETINFO
setvar $HOMESECTOR $PLAYER~CURRENT_SECTOR

killalltriggers
send "q"
gosub :PLANET~GETPLANETINFO
gosub :SETWINDOW
setvar $STARTING_SECTOR_CANNON $PLANET~SECTOR_CANNON
setvar $STARTING_ATMOS_CANNON $PLANET~ATMOSPHERE_CANNON
setvar $SECTOR_TOTAL ((($PLANET~PLANET_FUEL * $STARTING_SECTOR_CANNON) / 100) / 3)

settexttrigger NEED_IG :IG_WAS_OFF "Your Interdictor generator is now OFF"
settexttrigger SKIP_IG :SKIPIG "is not equipped with an Interdictor Generator"
send "q q q q* b"
waiton "Do you wish to change it? (Y/N)"
send "*"
goto :SKIPIG
:IG_WAS_OFF

send "y"
setvar $SWITCHBOARD~MESSAGE "Turning on ship IG.*"
gosub :SWITCHBOARD~SWITCHBOARD
:SKIPIG

killalltriggers
send "l"&$PLANET~PLANET&"*"
waiton "Planet command"
if ($CORP <> TRUE)
  send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
else
  send "**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*"
end

if ($CANNON = FALSE)
  send "*ls0*la0*"
  setvar $SWITCHBOARD~MESSAGE "Turning off quasar cannons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
gosub :PLAYER~CURRENTPROMPT
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  if ($CORP <> TRUE)
    setvar $SWITCHBOARD~MESSAGE "Made ship and planet personal for convenience. Turning off military reaction.*"
  else
    setvar $SWITCHBOARD~MESSAGE "Keeping planet and ship corporate for safety. Might be annoying. Turning off military reaction.*"
  end
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $SWITCHBOARD~MESSAGE "Something went wrong during startup. Ship and planet should be personal now, so be careful.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end





goto :SKIPPLANETIG
:PLANET_IG_WAS_OFF

send "y"
setvar $SWITCHBOARD~MESSAGE "Turning off planet IG.*"
gosub :SWITCHBOARD~SWITCHBOARD
:SKIPPLANETIG

killalltriggers


if ($SELL = TRUE)
  setvar $SWITCHBOARD~MESSAGE "Selling every ship after capture.  Will deposit money in the citadel.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end

gosub :PLAYER~QUIKSTATS

loadvar $PLAYER~SURROUNDFIGS
if ($PLAYER~SURROUNDFIGS <= 0)
  setvar $PLAYER~SURROUNDFIGS 1
end
if ($PASSIVE = TRUE)
  setvar $PLAYER~SURROUNDPASSIVE TRUE
end
setvar $PLAYER~ONLYALIENS TRUE
setvar $PLAYER~CAPPINGALIENS TRUE
setvar $PLAYER~DEFENDERCAPPING TRUE
setvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY TRUE

loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end

if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
  gosub :SHIP~GETSHIPSTATS
end

while (TRUE)

  if (($PLAYER~UNLIMITEDGAME = FALSE) and (($PLAYER~TURNS - $PLAYER~TURNSTOEMPTY) <= $BOT~BOT_TURN_LIMIT))
    setvar $SWITCHBOARD~MESSAGE "Turns too low to continue.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    gosub :GOHOME
  end
  if (FIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
    if ($BUYFIG = TRUE)
      gosub :WITH~RUN
      gosub :BUYFIG~RUN
      gosub :DEP~RUN
    else
      setvar $SWITCHBOARD~MESSAGE "Not enough fighters to continue the hunt.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      gosub :GOHOME
    end
  end
  if ($RETURN = TRUE)
    send "p"&$HOMESECTOR&"*y"
  end
  if ($CANNON = TRUE)
    setvar $PERCENTTOSET (((3 * $SECTOR_TOTAL) * 100) / $PLANET~PLANET_FUEL)
    if (((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) / 3) < $CANNONDAMAGE)
      add $PERCENTTOSET 1
    end
    if ($PERCENTTOSET > 100)
      setvar $PERCENTTOSET 100
    end

    send " *ls"&$PERCENTTOSET&"* la"&$STARTING_ATMOS_CANNON&"*"
  end

  setvar $LASTTARGET ""
  setvar $THISTARGET ""

  gosub :ATTACKANDMOVESHIP

  setvar $SWITCHBOARD~MESSAGE "* Waiting for something to hunt..*"
  gosub :BOT~ECHO


  gosub :VALIDATEFIGHTERHIT
  gosub :ATTACKANDMOVESHIP
  gosub :DOSURROUND
  gosub :ATTACKANDMOVESHIP
end
halt
:VALIDATEFIGHTERHIT

send "q "
gosub :PLANET~GETPLANETINFO
gosub :SETWINDOW
send "c "
if ($PLANET~PLANET_FIGHTERS < ($PLANET~PLANET_FIGHTERS_MAX / 10))
  if ($BUYFIG = TRUE)
    gosub :WITH~RUN
    gosub :BUYFIG~RUN
    gosub :DEP~RUN
  else
    setvar $SWITCHBOARD~MESSAGE "Alien hunter shutting down.  Making ship and planet corporate again.  Check to make sure I made it home.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    gosub :GOHOME
  end
end
loadvar $PLANET~PLANET_SHIELDS
if (($PLANET~PLANET_SHIELDS <= 300) and ($BUYSHIELD = TRUE))
  gosub :WITH~RUN
  gosub :BUYSHIELD~RUN
  gosub :DEP~RUN
end
settextlinetrigger FIG :CHECKFIGHTER "Deployed Fighters Report Sector"
settexttrigger ARMID :ATTACKSECTORMINE "Your mines in "
settextlinetrigger LIFTSOFF :PWARPCONFIRMED " lifts off from "
settextlinetrigger WARPS :PWARPCONFIRMED "warps into the sector."
settextlinetrigger POWER :PWARPCONFIRMED "is powering up weapons systems!"
settextlinetrigger WAVE :PWARPCONFIRMED " launches a wave of fighters at the "

gosub :BOT~DISCONNECTTRIGGERS
pause
:ATTACKSECTORMINE

gosub :VALIDATEMINEHIT
if ($ISVALID = TRUE)
  goto :GO_TO_DROP_SECTOR
else
  settexttrigger ARMID :ATTACKSECTORMINE "Your mines in "
  pause
end
pause
:CHECKFIGHTER
cuttext CURRENTLINE&" " $RADIO 1 1
gettext CURRENTLINE $DROPSECTOR $START_FIG_HIT $END_FIG_HIT
gettext CURRENTANSILINE $ALIEN_CHECK $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
getwordpos $ALIEN_CHECK $APOS $ALIEN_ANSI
if (($APOS <= 0) or ($RADIO <> "D"))
  settextlinetrigger FIG :CHECKFIGHTER "Deployed Fighters Report Sector"
  pause
end
:GO_TO_DROP_SECTOR
killalltriggers
if ($DROPSECTOR <> $PLAYER~CURRENT_SECTOR)
  send "*ls0* la0*  p " $DROPSECTOR "*y"
  settextlinetrigger PWARPNOTOK :PWARPTRYADJACENT "You do not have any fighters in Sector "
  settextlinetrigger PWARPOK :PWARPCONFIRMED " Planetary TransWarp Drive Engaged! "
  settextlinetrigger PWARPOK2 :PWARPCONFIRMED "You are already in that sector!"
  pause
  :PWARPDONE

  killalltriggers
end
:PWARPTRYADJACENT
killalltriggers
setsectorparameter $DROPSECTOR "FIGSEC" FALSE
gosub :FINDADJACENT
gosub :ATTEMPTDROP
gosub :DOSURROUND
setvar $PWARP~DESTINATION $DROPSECTOR
gosub :PWARP~RUN
setvar $INDEX 1
setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$INDEX]
while ($CHECKSECTOR > 0)
  setvar $PWARP~DESTINATION $CHECKSECTOR
  gosub :PWARP~RUN
  gosub :ATTACKANDMOVESHIP
  add $INDEX 1
  setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$INDEX]
end
return
:PWARPCONFIRMED
killalltriggers
gosub :PLAYER~QUIKSTATS
gosub :DOSURROUND
gosub :ATTACKANDMOVESHIP
if ($DROPSECTOR <= 0)
  setvar $DROPSECTOR $PLAYER~CURRENT_SECTOR
end
setvar $INDEX 1
setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$INDEX]
while ($CHECKSECTOR > 0)
  setvar $PWARP~DESTINATION $CHECKSECTOR
  gosub :PWARP~RUN
  gosub :ATTACKANDMOVESHIP
  add $INDEX 1
  setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$INDEX]
end

return
:FINDADJACENT
getsectorparameter $DROPSECTOR "FIGSEC" $ISFIGGED
setvar $I 1
setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
setarray $TARGETSECTORS 6
setvar $TARGETCOUNT 0
while ($CHECKSECTOR > 0)


  add $TARGETCOUNT 1
  setvar $TARGETSECTORS[$TARGETCOUNT] $CHECKSECTOR

  add $I 1
  setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
end
if ($TARGETCOUNT <= 0)
  setvar $SWITCHBOARD~MESSAGE " No Targets..*"
  gosub :BOT~ECHO
  setvar $TARGETSECTORS[1] $CURRENT_LOCATION
end

return
:ATTEMPTDROP

if ($TARGETCOUNT > 0)
  getrnd $RANDOMTARGET 1 $TARGETCOUNT
  setvar $GOTOSECTOR $TARGETSECTORS[$RANDOMTARGET]
  setvar $PWARP~DESTINATION $GOTOSECTOR
  gosub :PWARP~RUN
end

return
:DOSURROUND


if ($PLAYER~SURROUNDPASSIVE = TRUE)
  gosub :DSCAN~RUN
end
send "q "
gosub :PLANET~GETPLANETINFO
gosub :SETWINDOW
send "q "
gosub :GRID~SURROUND
send "l "&$PLANET~PLANET&"* m*** c "
setvar $SWITCHBOARD~MESSAGE "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $SWITCHBOARD~MESSAGE "* "&ANSI_14&$PLAYER~SURROUNDOUTPUT&"*"&ANSI_7
gosub :BOT~ECHO

return
:ATTACKANDMOVESHIP

gosub :PLAYER~CURRENTPROMPT
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($PLAYER~CURRENT_PROMPT = "Command")
  gosub :PLANET~LANDINGSUB
  gosub :PLAYER~CURRENTPROMPT
end
setvar $SECTOR~FEDERALCOUNT 0
setvar $SECTOR~FAKETRADERCOUNT 1
setvar $TARGETSFOUND FALSE
while ($SECTOR~FAKETRADERCOUNT > $SECTOR~FEDERALCOUNT)
  gosub :PLAYER~CURRENTPROMPT
  setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  if ($PLAYER~CURRENT_PROMPT = "Command")
    gosub :PLANET~LANDINGSUB
    gosub :PLAYER~CURRENTPROMPT
    setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  end
  gosub :SECTOR~GETSECTORDATA
  if ($SECTOR~REALTRADERCOUNT > $SECTOR~CORPIECOUNT)
    setvar $TARGETSFOUND TRUE
    gosub :COMBAT~FASTCITADELATTACK
    send "'Just attacked (and hopefully killed) a trader in my sector! Sector "&$PLAYER~CURRENT_SECTOR&".*"
  end
  if ($SECTOR~FAKETRADERCOUNT > $SECTOR~FEDERALCOUNT)
    setvar $TARGETSFOUND TRUE
    gosub :COMBAT~FASTCAPTURE
  end
end
gosub :PLAYER~CURRENTPROMPT
if ($PLAYER~CURRENT_PROMPT = "Command")
  gosub :PLANET~LANDINGSUB
end
send "q m*** c "
gosub :PLAYER~QUIKSTATS
setvar $STARTINGSECTOR $PLAYER~CURRENT_SECTOR
if (($PLAYER~SHIELDS < $SHIP~SHIP_SHIELD_MAX) and ($PLANET~PLANET_SHIELDS > 360))
  setvar $PLAYER~SHIELDS_NEEDED ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
  setvar $PLANET~PLANET_SHIELDS_TO_TAKE ($PLAYER~SHIELDS_NEEDED / 10)
  send "gf"&$PLANET~PLANET_SHIELDS_TO_TAKE&"*"
end

if ($TARGETSFOUND = TRUE)

  send "s*  "
  waiton "Warps to Sector(s) : "
  setvar $FIGOWNER SECTOR.FIGS.OWNER[CURRENTSECTOR]
  setvar $FIGCOUNT SECTOR.FIGS.QUANTITY[CURRENTSECTOR]

  if ($FIGCOUNT <= 0) or (($FIGOWNER <> "belong to your Corp") and ($FIGOWNER <> "yours"))
    gosub :XENTER~RUN
  end
  setvar $EMPTYSHIPS SECTOR.SHIPCOUNT[CURRENTSECTOR]
  if ($EMPTYSHIPS > 0)
    loadvar $MAP~STARDOCK
    if ($FILTERSHIPS <> "")
      setvar $BOT~USER_COMMAND_LINE " moveship h silent "&#34&$FILTERSHIPS&#34
      setvar $BOT~PARM1 $MAP~HOME_SECTOR
      gosub :MOVESHIP~RUN
      send "s*  "
      gosub :PLAYER~QUIKSTATS
      setvar $EMPTYSHIPS SECTOR.SHIPCOUNT[CURRENTSECTOR]
    end
    if ($EMPTYSHIPS > 0)
      if ($SELL)
        if ($HOME = TRUE)
          setvar $BOT~USER_COMMAND_LINE " moveship "&$HOMESECTOR&" silent"
          setvar $BOT~PARM1 $HOMESECTOR
        else
          setvar $BOT~USER_COMMAND_LINE " moveship "&$MAP~STARDOCK&" sell dep silent"
          setvar $BOT~PARM1 $MAP~STARDOCK
        end
      else
        setvar $BOT~USER_COMMAND_LINE " moveship "&$MAP~STARDOCK&" silent"
        setvar $BOT~PARM1 $MAP~STARDOCK
      end
      gosub :MOVESHIP~RUN
      if ($STARTINGSECTOR <> CURRENTSECTOR)
        setvar $MOW~DESTINATION $STARTINGSECTOR
        setvar $MOW~DEPLOY 1
        gosub :MOW~RUN
        gosub :PLANET~LANDINGSUB
      end
    end
    gosub :PLAYER~CURRENTPROMPT
    if ($PLAYER~CURRENT_PROMPT = "Command")
      gosub :PLANET~LANDINGSUB
    end
  end
end

killalltriggers
setvar $IS_FUEL_BUYER PORT.BUYFUEL[CURRENTSECTOR]
setvar $IS_PORT PORT.EXISTS[CURRENTSECTOR]
setvar $CLASS PORT.CLASS[CURRENTSECTOR]
setvar $UNDER_CONSTRUCTION (PORT.BUILDTIME[CURRENTSECTOR] > 0)
getsectorparameter CURRENTSECTOR "BUSTED" $ISBUSTED
getsectorparameter CURRENTSECTOR "UPGRADEF" $ISUPGRADEDFUEL
loadvar $PLANET~PLANET_FUEL_MAX
loadvar $PLANET~PLANET_FUEL
if (($REFUEL = TRUE) and (($IS_FUEL_BUYER <> TRUE) and (($IS_PORT = TRUE) and (($CLASS > 0) and (($ISBUSTED <> TRUE) and (($UNDER_CONSTRUCTION <> TRUE) and ($PLANET~PLANET_FUEL < ($PLANET~PLANET_FUEL_MAX - $GAME~PORT_MAX))))))))
  if (($UPGRADE = TRUE) and ($ISUPGRADEDFUEL <> TRUE))
    gosub :MAX~RUN
    gosub :SETWINDOW
  else
    send "c r*q "
  end
  setvar $FUEL PORT.FUEL[CURRENTSECTOR]
  if (($UPGRADE = TRUE) and ($FUEL > 10000)) or (($UPGRADE <> TRUE) and ($FUEL > 1000))
    gosub :BUYFUEL~RUN
  end
end
if (($PATP = TRUE) and ($PLANET~PLANET_FUEL < ($PLANET~PLANET_FUEL_MAX / 10)))
  setvar $PATP~MINIMUM 1000
  setvar $PATP~UPGRADE TRUE
  gosub :PATP~RUN
end
killalltriggers
return
:VALIDATEMINEHIT

setvar $ISVALID FALSE
cuttext CURRENTLINE&"    " $CK 1 1
if ($CK <> "Y")
  return
end
gettext CURRENTLINE $DROPSECTOR "Your mines in " " did"
gettext CURRENTANSILINE&"[][][]" $ALIEN_CHECK "Your mines in" "[][][]"
getwordpos CURRENTLINE $POS " damage to "
getwordpos $ALIEN_CHECK $APOS $ALIEN_ANSI
if (($APOS > 0) or ($POS = 0))
  return
end
setvar $ISVALID TRUE
return
:SETWINDOW


setvar $MSG "*   Current Sector: "&CURRENTSECTOR&"                            "
cuttext $MSG $MSG 1 30
if ($PLAYER~UNLIMITEDGAME = TRUE)
  setvar $MSG $MSG&"   Turns: Unlimited"
else
  setvar $MSG $MSG&"   Turns: "&TURNS
end
setarray $WINDOW_LINES 7
setvar $WINDOW_LINES[1] "* Alienhunt Planet: "&$PLANET~PLANET
setvar $WINDOW_LINES[2] "* ---------------------------------------------------------------"
loadvar $PLANET~PLANET_FUEL
format $PLANET~PLANET_FUEL $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[3] "*      Planet Fuel: "&$PLAYER~VALUE&"                          "
cuttext $WINDOW_LINES[3] $WINDOW_LINES[3] 1 30
loadvar $PLANET~PLANET_FIGHTERS
format $PLANET~PLANET_FIGHTERS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[4] "   Planet Fighters: "&$PLAYER~VALUE
loadvar $PLANET~PLANET_SHIELDS
format $PLANET~PLANET_SHIELDS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[5] "*   Planet Shields: "&$PLAYER~VALUE&"                          "
cuttext $WINDOW_LINES[5] $WINDOW_LINES[5] 1 30
loadvar $PLANET~CITADEL_CREDITS
format $PLANET~CITADEL_CREDITS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[6] "   Citadel Credits: "&$PLAYER~VALUE
format $PLAYER~FIGHTERS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[7] "*    Ship Fighters: "&$PLAYER~VALUE&"*"

setvar $I 1
while ($I <= 7)
  setvar $MSG $MSG&$WINDOW_LINES[$I]
  add $I 1
end
setwindowcontents "ALIENHUNT_SCRIPT" $MSG
setvar $WINDOW_CONTENT $MSG
replacetext $WINDOW_CONTENT "*" "[][]"
savevar $WINDOW_CONTENT
return
:GOHOME

setvar $PWARP~DESTINATION $HOMESECTOR
gosub :PWARP~RUN
setvar $SCRUB~SEEK TRUE
gosub :SCRUB~RUN
if ($CANNON = TRUE)
  send " *ls"&$PERCENTTOSET&"* la"&$STARTING_ATMOS_CANNON&"*"
end
send "qoccco*cq"
waiton "<Computer deactivated>"

halt
return

# includes:
include "include/BOT.ts"
include "include/COMBAT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/PLANET.ts"
include "include/SHIP.ts"
include "include/SHIP_2/SHIP.ts"
include "include/SHIP_3/SHIP.ts"
include "include/BOT_7/BOT.ts"
include "include/GRID.ts"
include "include/SHIP_2/SHIP.ts"
include "include/PLANET_2/PLANET.ts"
include "include/SECTOR.ts"
include "include/SECTOR_2/SECTOR.ts"
include "include/SECTOR_3/SECTOR.ts"
include "include/SECTOR_4/SECTOR.ts"
include "include/SHIP_3/SHIP.ts"
include "include/COMBAT_2/COMBAT.ts"
include "include/COMBAT_3/COMBAT.ts"
include "include/PLANET_3/PLANET.ts"
include "include/PLAYER_4/PLAYER.ts"
include "include/PLAYER_5/PLAYER.ts"
include "include/PLAYER_6/PLAYER.ts"
include "include/PLAYER_7/PLAYER.ts"
include "include/PLAYER_8/PLAYER.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/PLANET_2/PLANET.ts"
include "include/BUYFIG.ts"
include "include/BUYSHIELD.ts"
include "include/DEP.ts"
include "include/WITH.ts"
include "include/DSCAN.ts"
include "include/MOVESHIP.ts"
include "include/XENTER.ts"
include "include/MOW.ts"
include "include/MAX.ts"
include "include/PWARP.ts"
include "include/BUYFUEL.ts"
include "include/SCRUB.ts"
include "include/PATP.ts"
