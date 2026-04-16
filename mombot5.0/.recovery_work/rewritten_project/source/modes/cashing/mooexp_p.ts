gosub :BOT~LOADVARS

loadvar $GAME~PORT_MAX
loadvar $GAME~PTRADESETTING
loadvar $GAME~MAX_PLANETS_IN_GAME
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $BOT~FOLDER
loadvar $BOT~LIMP_FILE
loadvar $BOT~ARMID_FILE



setvar $BOT~HELP[1] $BOT~TAB&"       Explores the universe looking for Moo Ports "
setvar $BOT~HELP[2] $BOT~TAB&"       "
setvar $BOT~HELP[3] $BOT~TAB&" mooexp_p [turnsstop/cashstop] [maxplanets] {primary} {bad/all} "
setvar $BOT~HELP[4] $BOT~TAB&"                      "
setvar $BOT~HELP[5] $BOT~TAB&" Options:"
setvar $BOT~HELP[6] $BOT~TAB&" [turnsstop]    <= 60000 stop at these turns"
setvar $BOT~HELP[7] $BOT~TAB&"  [cashstop]    > 60000 stop at this cash amount"
setvar $BOT~HELP[8] $BOT~TAB&"[maxplanets]    Max planets b4 blasting and replacing."
setvar $BOT~HELP[9] $BOT~TAB&"\t    {f/o/e}    Highest value product available defaults"
setvar $BOT~HELP[10] $BOT~TAB&"                to equipment"
setvar $BOT~HELP[11] $BOT~TAB&"   {bad/all}    Clean bad/all planets post trading. default none."
setvar $BOT~HELP[12] $BOT~TAB&"     {guard}    Ensures corp planet at SD to invoke Guardian"
setvar $BOT~HELP[13] $BOT~TAB&"     {ephag}    Default is NEG but set to use EP Haggle"
setvar $BOT~HELP[14] $BOT~TAB&"      {furb}    Safe Furb - Corpy runs >moofurb tfurb Ship"
setvar $BOT~HELP[15] $BOT~TAB&"    {secure}    Drop/furb mines/limpets"
setvar $BOT~HELP[16] $BOT~TAB&"    {figs:n}    Buy figs to this amount n"
setvar $BOT~HELP[17] $BOT~TAB&" {efurb:bot}    Exchange furb with {bot} waiting on right planet."
setvar $BOT~HELP[18] $BOT~TAB&"    "
setvar $BOT~HELP[19] $BOT~TAB&"    Auto refurbs - requires fed safe if not using moofurb"
setvar $BOT~HELP[20] $BOT~TAB&"    Stores sectors to go back to when script reruns."
setvar $BOT~HELP[21] $BOT~TAB&"    AUTOCLEANUP if planets above 90% game max"
setvar $BOT~HELP[22] $BOT~TAB&"    Start from citadel to auto cash dump"
setvar $BOT~HELP[23] $BOT~TAB&"    "
setvar $BOT~HELP[24] $BOT~TAB&"    mooexp_p 500 10 e"
setvar $BOT~HELP[25] $BOT~TAB&"    Make sure >update"

gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Moo Explorer"
gosub :BOT~BANNER

gosub :PLAYER~QUIKSTATS


setarray $NEG_PLANETNAMES 20
setarray $NEG_PLANETNAMESTAKEN 20
setvar $I 1
while ($I <= 20)
  getrnd $RAN1 10000 999999
  getrnd $RAN2 10000 999999
  setvar $RANNAME "m"&$RAN1&$RAN2
  setvar $NEG_PLANETNAMES[$I] $RANNAME
  add $I 1
end


setvar $STARTCREDITS $PLAYER~CREDITS
setvar $STARTTURNS $PLAYER~TURNS
setvar $MINORE $PLAYER~TOTAL_HOLDS


if ($PLAYER~PHOTONS > 0)
  setvar $SWITCHBOARD~MESSAGE "Yeah Nah, we don't do this with photons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if (($GAME~PTRADESETTING = 0) or ($GAME~MAX_PLANETS_IN_GAME = 0) or ($GAME~MAX_PLANETS_PER_SECTOR = 0))
  setvar $SWITCHBOARD~MESSAGE "No planet trade/planets in game settings >refresh >update.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $DROPCASHCIT FALSE
setvar $DROPCASHSECTOR 0
setvar $DROPCASHPLANET 0
setvar $DROPCASHTOTAL 0


setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Citadel")
  send "qtnt1*"
  gosub :PLANET~GETPLANETINFO
  send "c"
  setvar $DROPCASHCIT TRUE
  setvar $DROPCASHSECTOR $PLAYER~CURRENT_SECTOR
  setvar $DROPCASHPLANET $PLANET~PLANET
  if ($PLANET~CITADEL = 0)
    setvar $SWITCHBOARD~MESSAGE "Planet must have at least a level 1 citadel.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  gosub :PLAYER~QUIKSTATS
  send "q q "
elseif ($STARTINGLOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "must be started from Command prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($PLAYER~PLANET_SCANNER <> "Yes")
  setvar $SWITCHBOARD~MESSAGE "Ship needs planet scanners*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end



if (($PLAYER~TWARP_TYPE <> 1) and ($PLAYER~TWARP_TYPE <> 2))

  setvar $SWITCHBOARD~MESSAGE "MooExp_p - Twarp = good, No Twarp = bad.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if ($PLAYER~FIGHTERS < 301)
  setvar $SWITCHBOARD~MESSAGE "MooExp_p - Need more than 300 figs, you'll hit debree and die!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if ($PLAYER~ORE_HOLDS < $MINORE)
  setvar $SWITCHBOARD~MESSAGE "MooExp_p - We need ore in our holds.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


setvar $HALT_TURNS $BOT~PARM1
isnumber $NUMBER $HALT_TURNS

if ($NUMBER <> 1)
  setvar $SWITCHBOARD~MESSAGE "First parm should be stop turns or stop credits.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if ($HALT_TURNS <= 0)
  setvar $SWITCHBOARD~MESSAGE "First parm should be greater than zero.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  if ($HALT_TURNS <= 60000)
    setvar $SWITCHBOARD~MESSAGE "We will stop when we reach "&$HALT_TURNS&" turns.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    setvar $CASHTARGET 0
  else
    setvar $CASHTARGET $HALT_TURNS
    setvar $HALT_TURNS 50
    setvar $SWITCHBOARD~MESSAGE "We will stop when we reach "&$HALT_TURNS&" turns or "&$CASHTARGET&" credits.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
end






setvar $PREFERREDPLANETSLOT $BOT~PARM2
isnumber $NUMBER $PREFERREDPLANETSLOT

if ($NUMBER <> 1)
  setvar $SWITCHBOARD~MESSAGE "Please select how many planets required.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if (($PREFERREDPLANETSLOT <= 0) or ($PREFERREDPLANETSLOT > 10))
  setvar $SWITCHBOARD~MESSAGE "Preferred planet should be from 1 to 10*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  setvar $SWITCHBOARD~MESSAGE "We will create a max of "&$PREFERREDPLANETSLOT&" planets.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end

setvar $FURBFIGSQUANT 0

getwordpos $BOT~USER_COMMAND_LINE $POS "figs:"
if ($POS > 0)
  setvar $FURBFIGS TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $FURBFIGSQUANT "figs:" " "
  setvar $SWITCHBOARD~MESSAGE "We are restocking fighters up "&$FURBFIGSQUANT&".*"
else
  getwordpos $BOT~USER_COMMAND_LINE $POS "figs"
  if ($POS > 0)
    setvar $FURBFIGS TRUE
    setvar $SWITCHBOARD~MESSAGE "We are restocking fighters.*"
  end
end


getwordpos $BOT~USER_COMMAND_LINE $POS "bank:"
if ($POS > 0)
  setvar $BANKCASH TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $BANKTOO "bank:" " "
  setvar $SWITCHBOARD~MESSAGE "We are sending our cash to "&$BANKTOO&".*"
end


setvar $USERCLEANUP 0
gosub :SWITCHBOARD~SWITCHBOARD
getwordpos $BOT~USER_COMMAND_LINE $POS "all"
if ($POS > 0)
  setvar $USERCLEANUP 2
  setvar $SWITCHBOARD~MESSAGE "We are blowing ALL planets post trade.*"
else
  getwordpos $BOT~USER_COMMAND_LINE $POS "bad"
  if ($POS > 0)
    setvar $USERCLEANUP 1
    setvar $SWITCHBOARD~MESSAGE "We are just blowing dud planets.*"
  end
end
setvar $CLEANUP $USERCLEANUP
gosub :SWITCHBOARD~SWITCHBOARD

getwordpos $BOT~USER_COMMAND_LINE $POS "guard"
if ($POS > 0)
  setvar $USEGUARD TRUE
  setvar $SWITCHBOARD~MESSAGE "Creating a corp planet at SD.*"
else
  setvar $USEGUARD FALSE
  setvar $SWITCHBOARD~MESSAGE "Not Creating Guardian Planets.*"
end
gosub :SWITCHBOARD~SWITCHBOARD

getwordpos $BOT~USER_COMMAND_LINE $POS "ephag"
if ($POS > 0)
  setvar $USEEP TRUE
  setvar $SWITCHBOARD~MESSAGE "Using Ep Haggle*"
else
  setvar $USEEP FALSE
  setvar $SWITCHBOARD~MESSAGE "Using internal NEG for haggle.*"
end
gosub :SWITCHBOARD~SWITCHBOARD



getwordpos $BOT~USER_COMMAND_LINE $POS "furb"
if ($POS > 0)
  setvar $PLAYER~CORPFURB TRUE
  setvar $SWITCHBOARD~MESSAGE "Using Corp Furbing.*"
  setvar $USEGUARD FALSE
  setvar $FURBFIGS FALSE
  setvar $PLAYER~CORPCASHDUMP FALSE

else
  setvar $PLAYER~CORPFURB FALSE
  setvar $PLAYER~CORPCASHDUMP FALSE
  setvar $SWITCHBOARD~MESSAGE "We will furb ourselves.*"
  if ($PLAYER~ALIGNMENT < 1000)
    setvar $SWITCHBOARD~MESSAGE "You're just not good enough for this script (alignment).*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end


gosub :SWITCHBOARD~SWITCHBOARD


setvar $EFURB 0
setvar $EFURBBOT 0
setvar $EFURBPLANET 0
setvar $EFURBSECTOR 0


getwordpos $BOT~USER_COMMAND_LINE $POS "efurb:"
if ($POS > 0)
  setvar $EFURB TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $EFURBBOT "efurb:" " "

  setvar $PLAYER~CORPFURB TRUE
  setvar $SWITCHBOARD~MESSAGE "We are exchange furbing with bot: "&$EFURBBOT&"*"
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $XFURB FALSE
end


getwordpos $BOT~USER_COMMAND_LINE $POS "deldata"
if ($POS > 0)
  setvar $DELETEDATA TRUE
else
  setvar $DELETEDATA FALSE
end


setvar $SECURE FALSE
getwordpos $BOT~USER_COMMAND_LINE $POS "secure"
if ($POS > 0)
  setvar $SECURE TRUE
  setvar $SWITCHBOARD~MESSAGE "Securing sectors with limps and armids.*"
  loadvar $GAME~ARMID_COST
  loadvar $GAME~LIMPET_COST
end
gosub :SWITCHBOARD~SWITCHBOARD




setvar $SWITCHBOARD~MESSAGE "Primary product will be equipment.*"
setvar $PRIMARYPRODUCT 3
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " f "
if ($POS > 0)
  setvar $PRIMARYPRODUCT 1
  setvar $SWITCHBOARD~MESSAGE "Primary product will be fuel ore.*"
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " o "
if ($POS > 0)
  setvar $SWITCHBOARD~MESSAGE "Primary product will be Organics.*"
  setvar $PRIMARYPRODUCT 2
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " e "
if ($POS > 0)
  setvar $PRIMARYPRODUCT 3
end


gosub :SWITCHBOARD~SWITCHBOARD

setvar $ALLLIMPS 0
setvar $ALLARMIDS 0

gosub :CHECKCORP

fileexists $LIMPFILECHK $BOT~LIMP_FILE
fileexists $ARMIDFILECHK $BOT~ARMID_FILE
if (($LIMPFILECHK = 1) and ($ARMIDFILECHK = 1))
  readtoarray $BOT~LIMP_FILE $ALLLIMPS
  readtoarray $BOT~ARMID_FILE $ALLARMIDS


else

  setvar $BOT~COMMAND "update"
  setvar $BOT~USER_COMMAND_LINE ""
  setvar $BOT~PARM1 ""
  savevar $BOT~PARM1
  savevar $BOT~COMMAND
  savevar $BOT~USER_COMMAND_LINE
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\update.cts"
  seteventtrigger LIMPCHKEND :LIMPCHKEND "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\update.cts"
  pause
  :LIMPCHKEND
  killalltriggers

  readtoarray $BOT~LIMP_FILE $ALLLIMPS
  readtoarray $BOT~ARMID_FILE $ALLARMIDS
end

gosub :SHIP~GETSHIPSTATS

setvar $STAT_TURNSUSED 0
setvar $STAT_FIGSDOWN 0
setvar $STAT_MOVES 0
setvar $STAT_TRADES 0
setvar $STAT_REFURBS 0
setvar $STAT_TORPS 0
setvar $STAT_ATOMICS 0
setvar $STAT_DOLLARSGROSS 0
setvar $STAT_DOLLARSNET 0
setvar $STAT_DOLLARSSPENT 0

window "MOO" 300 300 "Explore and Trade"

setvar $STUFF "Turns: "&$STAT_TURNSUSED&"*Figs Down: "&$STAT_FIGSDOWN&"*Ports Traded: "&$STAT_TRADES&"*Moves Made: "&$STAT_MOVES&"**Gross Cash:"&$STAT_DOLLARSGROSS&"*Expense:"&$STAT_DOLLARSSPENT&"*Net Cash:"&$STAT_DOLLARSNET
setvar $STUFF $STUFF&"**Refurbs: "&$STAT_REFURBS&"**Gen Torps: "&$STAT_TORPS&"*Atomics: "&$STAT_ATOMICS
setwindowcontents "MOO" $STUFF






loadvar $SWITCHBOARD~BOT_NAME
loadvar $PLAYER~UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $BOT~USER_COMMAND_LINE
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $DROPOFFENSIVE
loadvar $DROPTOLL
loadvar $SURROUNDFIGS
loadvar $SURROUNDLIMP
loadvar $SURROUNDMINE
loadvar $STARDOCK



setvar $MOOEXPLOREDFILE "moo_explored_"&GAMENAME&".txt"
setvar $MOOGOODPORTSFILE "moo_goodports_"&GAMENAME&".txt"
setvar $DANGEROUSSECTORLOGFILE "Grid_Warnings_"&GAMENAME&"_"&$DATE&".txt"
setvar $MOO_SETTING_FILE $BOT~FOLDER&"/moo_settings.cfg"

setvar $TOTALGAMEPLANETS 0
setvar $GETPLANETSETTINGSREQ 0



setvar $MOO_FUEL 1
setvar $MOO_ORGANICS 1
setvar $MOO_EQUIPMENT 1
setvar $FUEL_MIN_MOO 750
setvar $ORGANICS_MIN_MOO 500
setvar $EQUIPMENT_MIN_MOO 250

setvar $PLANET~PLANETSINSECTOR 0
setvar $PLANET~PLANETS 0
setvar $PLANET~PLANETI 1



setvar $TRADINGMINPRODUCT 40



setvar $PLANET~PLANETSALLOWEDINGAME $GAME~MAX_PLANETS_IN_GAME
setvar $PLANET~PLANETSALLOWED (($PLANET~PLANETSALLOWEDINGAME * 90) / 100)


fileexists $MOOFILECHK $MOO_SETTING_FILE
if ($MOOFILECHK = 1)

  setvar $I 1
  readtoarray $MOO_SETTING_FILE $MOO_SETTINGS
  setarray $PLANET~PLANETLIST $MOO_SETTINGS 5
  while ($I <= $MOO_SETTINGS)
    setvar $PLANET~PLANETINF $MOO_SETTINGS[$I]
    gosub :PROCESS_PLANET_LINE
    setvar $PLANET~PLANETLIST[$I] $PLANET~PLANETNAME

    setvar $PLANET~PLANETLIST[$I][1] $PLANET~PLANET_CHECKED
    setvar $PLANET~PLANETLIST[$I][2] $PLANET~PLANET_START_FUEL
    setvar $PLANET~PLANETLIST[$I][3] $PLANET~PLANET_START_ORG
    setvar $PLANET~PLANETLIST[$I][4] $PLANET~PLANET_START_EQUIP
    setvar $PLANET~PLANETLIST[$I][5] $PLANET~PLANET_TRADE_PLANET

    add $I 1
  end
  setvar $TOTALGAMEPLANETS $MOO_SETTINGS


else

  loadvar $PLANET~PLANET_FILE
  gosub :PLANET~LOADPLANETINFO
  setvar $I 1


  while ($I <= $PLANET~PLANETCOUNTER)


    setvar $P $PLANET~PLANETLIST[$I]
    getwordpos $P $LOC "Class"

    cuttext $P $PLANET~PLANETNAME $LOC 99
    write $MOO_SETTING_FILE "0 0 0 0 0 "&$PLANET~PLANETNAME
    setvar $PLANET~PLANETLIST[$I] $PLANET~PLANETNAME
    setvar $PLANET~PLANETLIST[$I][1] 0
    setvar $PLANET~PLANETLIST[$I][2] 0
    setvar $PLANET~PLANETLIST[$I][3] 0
    setvar $PLANET~PLANETLIST[$I][4] 0
    setvar $PLANET~PLANETLIST[$I][5] 0
    add $I 1
  end
  setvar $TOTALGAMEPLANETS $PLANET~PLANETCOUNTER
end




setarray $EXPLORED SECTORS
setarray $PORTREPORTED SECTORS
setarray $PORTBLOCKED SECTORS
setarray $FUTUREDESTINATIONS SECTORS
setvar $FUTUREDESTSADDED 0
setvar $FUTUREPORTSADDED 0


fileexists $FIGLCHK $MOOEXPLOREDFILE
if ($FIGLCHK = 1)

  if ($DELETEDATA = TRUE)
    echo "*###########"
    echo "*# DELETED #"
    echo "*###########"
    setvar $SWITCHBOARD~MESSAGE "Deleting Previous Data.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    delete $MOOEXPLOREDFILE
    delete $MOOGOODPORTSFILE
  else
    if ($FIGLCHK = 1)

      readtoarray $MOOEXPLOREDFILE $VOIDSLIST
      setvar $I 1
      while ($I <= $VOIDSLIST)
        setvar $EXPLORED[$VOIDSLIST[$I]] 1

        add $I 1
      end
    end
  end
end


fileexists $FIGLCHK $MOOGOODPORTSFILE
if ($FIGLCHK = 1)
  readtoarray $MOOGOODPORTSFILE $GOODLIST
  setvar $I 1
  while ($I <= $GOODLIST)

    getword $GOODLIST[$I] $SEC 1
    getword $GOODLIST[$I] $GOODPORT 2
    getword $GOODLIST[$I] $DEN 3
    getword $GOODLIST[$I] $WARPS 4

    if ($EXPLORED[$SEC] <> 1)
      add $FUTUREDESTSADDED 1
      add $FUTUREPORTSADDED 1
      setvar $FUTUREDESTINATIONS[$SEC] 1
      setvar $FUTUREDESTINATIONS[$SEC][0] $GOODPORT
      setvar $FUTUREDESTINATIONS[$SEC][1] $DEN
      setvar $FUTUREDESTINATIONS[$SEC][2] $WARPS
      setvar $FUTUREDESTINATIONS[$SEC][3] 1
    end

    add $I 1
  end
end



if ($EFURB = TRUE)
  gosub :GETEFURBDETAILS

  send "'" $EFURBBOT " stopall*"
  waitfor " All non-system scripts and modules killed, and modes reset"

  send "'" $EFURBBOT " unlock*"
  waitfor "Ship has been unlocked!"

  send "'" $EFURBBOT " moofurb efurb*"
  waitfor "Exchange Furb Active"
end




setvar $SWITCHBOARD~MESSAGE "Pause for effect....*"
gosub :SWITCHBOARD~SWITCHBOARD
if ($USEEP = 1)
  send "'" $BOT~BOT_NAME " ephaggle planet*"
end

setdelaytrigger DELAY :STARTPAUSE 3000
pause
:STARTPAUSE


setvar $SWITCHBOARD~MESSAGE "... and we are off!*"
gosub :SWITCHBOARD~SWITCHBOARD

gosub :PLAYER~QUIKSTATS

gosub :SETVOIDSECTORS









setvar $SKIPPORT 0
setvar $ISAYSO 1
while ($ISAYSO)
  :TOPOFTHEGRIDLOOP
  setvar $FRESHSECTORS 0
  setvar $FRESHSECTORSI 0

  setvar $FIRSTNEXT 1

  gosub :PLAYER~QUIKSTATS

  setvar $PLAYER~TURNSNOW $PLAYER~TURNS

  if ($PLAYER~TURNSNOW < $HALT_TURNS)
    setvar $SWITCHBOARD~MESSAGE "Turn Limit Reached*"
    gosub :SWITCHBOARD~SWITCHBOARD
    gosub :SUBREPORT
    halt
  end
  if ($PLAYER~FIGHTERS < 301)
    setvar $SWITCHBOARD~MESSAGE "Need more than 300 figs, you'll hit debree and die!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  gosub :UPDATESTATS

  if ($SKIPPORT = 0)
    gosub :CHECKTRADE
  end
  setvar $SKIPPORT 0


  setvar $EXPLORED[CURRENTSECTOR] 1
  write $MOOEXPLOREDFILE CURRENTSECTOR

  setvar $FRESHSECTORS 0
  setvar $FRESHSECTORSI 0

  setvar $FIRSTNEXT 0
  setvar $TRYTWARPAGAINATTEMP 0
  :CHECK_AGAIN_FOR_NEXT_SECTOR
  gosub :GETNEXTSECTOR

  if ($GRIDSECTORPOSTTWARP > 0)
    :TRYTWARPAGAIN
    setvar $PLAYER~WARPTO $GRIDSECTOR
    gosub :PLAYER~TWARP
    add $STAT_MOVES 1

    setvar $GRIDSECTORPOSTTWARP 0


    setvar $SKIPPORT 1
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_SECTOR <> $GRIDSECTOR)
      if ($PLAYER~ORE_HOLDS > 100)
        setvar $GRIDSECTORPOSTTWARP 0
        goto :CHECK_AGAIN_FOR_NEXT_SECTOR
      else
        if ((PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = 1) and ((PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0) and ($TRYTWARPAGAINATTEMP = 0)))
          send "P T * * * "
          setvar $TRYTWARPAGAINATTEMP 1
          setvar $SWITCHBOARD~MESSAGE "Didn't make it to sector, buying fuel and trying again!*"
          gosub :SWITCHBOARD~SWITCHBOARD
          goto :TRYTWARPAGAIN
        end
      end
      setvar $SWITCHBOARD~MESSAGE "We didn't make it to: "&$GRIDSECTOR&" - manually refuel and type 'go go !' minus spaces once you have fuel and I'll twarp there.!*"
      gosub :SWITCHBOARD~SWITCHBOARD

      waitfor "gogo!"
      killalltriggers
      setvar $PLAYER~WARPTO $GRIDSECTOR
      gosub :PLAYER~TWARP
    end

  else
    gosub :GRIDNEXTSECTOR
  end
end







halt
:CHECKTRADE


setvar $DIDTRADE 0
setvar $TRADINGSECTOR1 0

setvar $PORTTOCHECK CURRENTSECTOR
setvar $PORTCHECKEDOK 0
gosub :SEARCHFORTRADINGPORT
if ($PORTCHECKEDOK = 1)
  setvar $TRADINGSECTOR1 $PORTTOCHECK
end
if ($TRADINGSECTOR1 > 0)
  setvar $TRADINGSECTOR2 CURRENTSECTOR
  add $STAT_TRADES 1
  gosub :CREATEANDSELL
end


return
:XPORTSHIP



setvar $XPORTSTRING "X  "&$XPORTSHIP&"*Q"
send $XPORTSTRING
settextlinetrigger NOXPORTSHIP :NOXPORTSHIP "That is not an available ship"
settextlinetrigger NOXPORTRANGE :NOXPORTRANGE "only has a transport range"
settextlinetrigger NOXPORTPASSWORD :NOXPORTPASSWORD "Enter the password for"
settextlinetrigger XPORTSUCCESS :XPORTSUCCESS "Security code accepted"
pause
pause
:NOXPORTSHIP
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Ship not available for Xport, could be under attack!!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:NOXPORTRANGE
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Not enough transport range, Script Halting.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:NOXPORTPASSWORD
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Transport ship requires a password, Script Halting.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:XPORTSUCCESS
killalltriggers
return

return
:SEARCHFORTRADINGPORT













setvar $CPORT PORT.CLASS[$PORTTOCHECK]
if ($PRIMARYPRODUCT = 1)
  setvar $PRODPERC PORT.PERCENTFUEL[$PORTTOCHECK]
  if ($PRODPERC >= $TRADINGMINPRODUCT)
    if (PORT.BUYFUEL[$PORTTOCHECK] = 1)
      setvar $PORTCHECKEDOK 1
    end
  end
elseif ($PRIMARYPRODUCT = 2)
  setvar $PRODPERC PORT.PERCENTORG[$PORTTOCHECK]
  if ($PRODPERC >= $TRADINGMINPRODUCT)
    if (PORT.BUYORG[$PORTTOCHECK] = 1)
      setvar $PORTCHECKEDOK 1
    end
  end
elseif ($PRIMARYPRODUCT = 3)
  setvar $PRODPERC PORT.PERCENTEQUIP[$PORTTOCHECK]
  if ($PRODPERC >= $TRADINGMINPRODUCT)
    if ($CPORT = 4)
      if (PORT.EQUIP[$PORTTOCHECK] > 1800)
        setvar $PORTCHECKEDOK 1
      end
    elseif (PORT.BUYEQUIP[$PORTTOCHECK] = 1)
      setvar $PORTCHECKEDOK 1
    end
  end



end
return
:SEARCHFORTRADINGPORT_OLD













setvar $CPORT PORT.CLASS[$PORTTOCHECK]

if ($PRIMARYPRODUCT = 1)
  if (($CPORT = 1) or ($CPORT = 2) or ($CPORT = 6) or ($CPORT = 8))
    setvar $PRODPERC PORT.PERCENTFUEL[$PORTTOCHECK]
    if ($PRODPERC >= $TRADINGMINPRODUCT)
      setvar $PORTCHECKEDOK 1
    end
  end

elseif ($PRIMARYPRODUCT = 2)
  if (($CPORT = 1) or ($CPORT = 3) or ($CPORT = 5) or ($CPORT = 8))
    setvar $PRODPERC PORT.PERCENTORG[$PORTTOCHECK]
    if ($PRODPERC >= $TRADINGMINPRODUCT)
      setvar $PORTCHECKEDOK 1
    end
  end

elseif ($PRIMARYPRODUCT = 3)
  if (($CPORT = 2) or ($CPORT = 3) or ($CPORT = 4) or ($CPORT = 8))
    setvar $PRODPERC PORT.PERCENTEQUIP[$PORTTOCHECK]
    if ($PRODPERC >= $TRADINGMINPRODUCT)
      setvar $PORTCHECKEDOK 1
    end
  end

end
return
:HEADHOMEANDDUMP


setvar $PLAYER~WARPTO $DROPCASHSECTOR
gosub :PLAYER~TWARP
send "l" $DROPCASHPLANET "*c"
gosub :PLAYER~QUIKSTATS
send "tt" ($PLAYER~CREDITS - 500000) "*"
setvar $DROPCASHTOTAL ($DROPCASHTOTAL + ($PLAYER~CREDITS - 500000))
send "q q "
waitfor "Command [TL"
gosub :PLAYER~QUIKSTATS
return
:RESTOCK



if ($PLAYER~CORPFURB = TRUE)

  if ($EFURB = TRUE)
    gosub :RESTOCKEFURB
  else
    gosub :RESTOCKCORP
  end
else
  gosub :PLAYER~QUIKSTATS

  if ($CASHTARGET > 0)
    if (($PLAYER~CREDITS + $DROPCASHTOTAL) > $CASHTARGET)

      setvar $SWITCHBOARD~MESSAGE "Cash target has been reached.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      if ($DROPCASHCIT = TRUE)
        gosub :HEADHOMEANDDUMP
      end
      gosub :UPDATESTATS
      halt
    end
  end

  setvar $DROPCASHTHISTRIP 0
  setvar $PRESTOCKCREDITS $PLAYER~CREDITS
  striptext $PRECREDITS ","

  gosub :RESTOCKSELF

  gosub :PLAYER~QUIKSTATS
  setvar $POSTSTOCKCREDITS $PLAYER~CREDITS
  striptext $POSTSTOCKCREDITS ","
  setvar $STAT_DOLLARSSPENT ($PRECREDITS - ($POSTSTOCKCREDITS + $DROPCASHTHISTRIP))
end


return
:RESTOCKEFURB


setvar $RETURNSPOT $PLAYER~CURRENT_SECTOR

setvar $PLAYER~WARPTO $EFURBSECTOR
gosub :PLAYER~TWARP

setvar $PLAYERSHIP $PLAYER~SHIP_NUMBER
send "l"&$EFURBPLANET&"* t n t 1 * m * * * C"
send "TT"
waitfor "credits, and the Treasury"
setvar $LINE CURRENTLINE
getword $LINE $CREDSMADE 3
striptext $CREDSMADE ","
subtract $CREDSMADE 1000000
if ($CREDSMADE >= 1)
  send $CREDSMADE&"*"
else
  send "*"
end
send "^q"
waitfor ": ENDINTERROG"
setvar $TRADERCOUNT 0
gosub :VERIFYONETRADER
if ($TRADERCOUNT <> 1)
  setvar $SWITCHBOARD~MESSAGE "Needs to be one other trader in this citadel and it should be the person you are swapping with.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "ey n n n * * "

gosub :PLAYER~QUIKSTATS

if ($PLAYER~SHIP_NUMBER = $PLAYERSHIP)
  setvar $SWITCHBOARD~MESSAGE "Exchange Furb Fail - still in same ship; where's my bot!!!*"
  gosub :SWITCHBOARD~SWITCHBOARD

  halt
end
if ($PLAYER~GENESIS < 5)
  setvar $SWITCHBOARD~MESSAGE "Exchange Furb Fail - New ship has les than 5 torps*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "QQ"
waitfor "Blasting off from"

setvar $PLAYER~WARPTO $RETURNSPOT
gosub :PLAYER~TWARP
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $RETURNSPOT)

  setvar $SWITCHBOARD~MESSAGE "We didn't make it back post exchange furb*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return
:RESTOCKCORP



gosub :PLAYER~QUIKSTATS
:PICKUPTRYAGAIN2

send "'MooTime@ " $SWITCHBOARD~BOT_NAME " " $PLAYER~SHIP_NUMBER " " CURRENTSECTOR "*"


settextlinetrigger PICKUPOK2 :PICKUPOK2 "Roger, gifts on route"
setdelaytrigger PICKUPTIMEOUT2 :PICKUPTIMEOUT2 4000
pause
:PICKUPTIMEOUT2
killalltriggers
goto :PICKUPTRYAGAIN2
:PICKUPOK2

killalltriggers

waitfor "Xport complete."
gosub :PLAYER~QUIKSTATS

return
:RESTOCKSELF

add $STAT_REFURBS 1
send "d"
setvar $RETURNSPOT CURRENTSECTOR

setvar $RESTOCKMAKEPLANET 0
if ($USEGUARD = TRUE)

  setvar $PLANET~PLANETFOUND 0
  gosub :CHECKCORPPLANET
  if ($PLANET~PLANETFOUND = 0)
    setvar $RESTOCKMAKEPLANET 1
  else
    setvar $RESTOCKMAKEPLANET 0
  end
end


if ($PLAYER~CORPCASHDUMP = TRUE)

  setvar $DODOCKCASHDUMP FALSE
  if ($PLAYER~CREDITS > 1100000)
    setvar $PLAYER~CORPNOTATDOCK TRUE
    gosub :CHECKCORPATDOCK
    if ($PLAYER~CORPNOTATDOCK = FALSE)
      setvar $DODOCKCASHDUMP TRUE
    end
  end
end


send "nq"
settextlinetrigger STARGATECHECK :STARGATECHECK "Class 9 (Special) (StarDock)"
setdelaytrigger NOSTARGATECHECK :NOSTARGATECHECK 3000
pause
:NOSTARGATECHECK
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Stardock is gone!! Halting..*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:STARGATECHECK
killalltriggers


setvar $I 1
setvar $NEXTDOOR 0
while ($I <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
  if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] = $STARDOCK)
    setvar $NEXTDOOR 1
  end
  add $I 1
end


getsectorparameter $CSEC "FIGSEC" $HASFIG
if ($NEXTDOOR = 0)
  send "m" $STARDOCK "*y"
  waitfor "Locating beam pinpointed, TransWarp"
  send "y  p   sh"
else
  send "m" $STARDOCK "* p   sh"
end


if ($PLAYER~CREDITS > 1500000)
  send "a"
  settexttrigger SHIPCHECKBUYATOMICS :SHIPCHECKBUYATOMICS "How many Atomic Detonators do you want"
  pause
  :SHIPCHECKBUYATOMICS
  killalltriggers
  getword CURRENTLINE $PLAYER~ATOMICSSAVAIL 9
  striptext $PLAYER~ATOMICSSAVAIL ")"
  if ($PLAYER~ATOMICSSAVAIL = 0)
    echo "*### we have a problem, no Atomics purchasable waiting for next"

    send "*"
  else
    send "*a" $PLAYER~ATOMICSSAVAIL "*"
  end
end

send "t"
settexttrigger SHIPCHECKBUYTORPS :SHIPCHECKBUYTORPS "How many Genesis Torpedoes do you want"
pause
:SHIPCHECKBUYTORPS
killalltriggers
getword CURRENTLINE $TORPSSAVAIL 9
striptext $TORPSSAVAIL ")"
if (($TORPSSAVAIL = 0) and ($PLAYER~GENESIS = 0))
  echo "*### we have a problem, no Torps purchasable waiting for next"
  waitfor "next@"
end
send $TORPSSAVAIL "*"

if ($SECURE)




  settextlinetrigger CASHLEFT :CASHLEFT "You have "
  pause
  :CASHLEFT
  killalltriggers
  getword CURRENTLINE $CASHONHAND 3
  striptext $CASHONHAND ","
  if ($CASHONHAND > 1000000)
    setvar $CASHONHAND ($CASHONHAND - 1000000)
    setprecision 1
    setvar $LIMPCASH ($CASHONHAND * "0.8")
    setvar $ARMIDCASH ($CASHONHAND * "0.2")
    setprecision 0
    if ($GAME~ARMID_COST = 0)
      send "m0*"
      settextlinetrigger ARMIDCOST :ARMIDCOST "damage.  These cost"
      pause
      :ARMIDCOST
      killalltriggers
      getword CURRENTLINE $ACOST 4
      striptext $ACOST ","
      setvar $GAME~ARMID_COST $ACOST

      send "l0*"
      settextlinetrigger LIMPCOST :LIMPCOST "credits each."
      pause
      :LIMPCOST
      killalltriggers
      getword CURRENTLINE $LCOST 3
      striptext $LCOST ","
      setvar $GAME~LIMPET_COST $LCOST
    end

    if ($PLAYER~LIMPETS < 50)
      setvar $LIMPSNEEDED (100 - $PLAYER~LIMPETS)
      setvar $BUYLIMPQUANT (($LIMPCASH / $GAME~LIMPET_COST) - 1)
      if ($BUYLIMPQUANT > $LIMPSNEEDED)
        setvar $BUYLIMPQUANT $LIMPSNEEDED
      end
      send "l" $BUYLIMPQUANT "*"
    end

    if ($PLAYER~ARMIDS < 50)
      setvar $MINESNEEDED (100 - $PLAYER~ARMIDS)
      setvar $BUYMINEQUANT (($ARMIDCASH / $GAME~ARMID_COST) - 1)
      if ($BUYMINEQUANT > $MINESNEEDED)
        setvar $BUYMINEQUANT $MINESNEEDED
      end
      send "m" $BUYMINEQUANT "*"
    end
  end
end


gosub :PLAYER~QUIKSTATS

send "qsp"
setvar $CHECKQUIK FALSE

if ($PLAYER~TOTAL_HOLDS < $SHIP~SHIP_MAX_HOLDS)
  settextlinetrigger REFURBHOLDPRICE :REFURBHOLDPRICE "credits / next hold"
end
:MOREREFURBING
settexttrigger REFURBFIGPRICET :REFURBFIGPRICET "credits per fighter"
settexttrigger REFURBSHIELDS :REFURBSHIELDS "Shield Points"
pause
:REFURBHOLDPRICE
killalltriggers
if ($PLAYER~CREDITS > 500000)
  getword CURRENTLINE $HOLDSFORSALE 10
  send "a" $HOLDSFORSALE "*"
  settextlinetrigger HOLDSCOST :HOLDSCOST "more holds is"
  pause
  :HOLDSCOST
  killalltriggers
  getword CURRENTLINE $HOLDSCOST 8
  striptext $HOLDSCOST ","
  setvar $AFTERBUY ($PLAYER~CREDITS - $HOLDSCOST)
  if ($AFTERBUY < 200000)
    setvar $HOLDSFORSALE ($HOLDSFORSALE / 2)
    send "na" $HOLDSFORSALE "*y"
  else
    send "y"
  end
  send "q"

  gosub :PLAYER~QUIKSTATS
  setvar $MINORE $PLAYER~TOTAL_HOLDS
  send "p"
end

goto :MOREREFURBING
:REFURBFIGPRICET
killalltriggers
if ($FURBFIGS = TRUE)
  getword CURRENTLINE $FIGPRICE 4
  getword CURRENTLINE $CANBUY 8
  setvar $FIGSTOBUY $PLAYER~CREDITS
  subtract $FIGSTOBUY 250000
  divide $FIGSTOBUY $FIGPRICE

  if ($FIGSTOBUY > $CANBUY)
    setvar $FIGSTOBUY $CANBUY
  end
  if ($FURBFIGSQUANT > 0)
    if ($PLAYER~FIGHTERS < $FURBFIGSQUANT)
      setvar $MAXREQUIRED ($FURBFIGSQUANT - $PLAYER~FIGHTERS)
      if ($MAXREQUIRED < $FIGSTOBUY)
        setvar $FIGSTOBUY $MAXREQUIRED
      end
      if ($FIGSTOBUY > 0)
        send "b" $FIGSTOBUY "*"
      end
    end
  else
    send "b" $FIGSTOBUY "*"
  end
  setvar $CHECKQUIK TRUE
end
goto :MOREREFURBING
:REFURBSHIELDS
killalltriggers
getword CURRENTLINE $SHIELDPRICE 5
getword CURRENTLINE $CANBUY 9
setvar $PLAYER~SHIELDSTOBUY $PLAYER~CREDITS
subtract $PLAYER~SHIELDSTOBUY 250000
divide $PLAYER~SHIELDSTOBUY $SHIELDPRICE

if ($PLAYER~SHIELDSTOBUY > $CANBUY)
  setvar $PLAYER~SHIELDSTOBUY $CANBUY
end
send "c" $PLAYER~SHIELDSTOBUY "*"

if ($CHECKQUIK = TRUE)
  gosub :PLAYER~QUIKSTATS
  setvar $CHECKQUIK FALSE
end
if (($PLAYER~CREDITS > 2000000) and ($BANKCASH = TRUE))
  gosub :PLAYER~QUIKSTATS
  send "q q g d "
  settexttrigger BANKDEPOSIT :BANKDEPOSIT "How many credits do you want to deposit? ("
  pause
  :BANKDEPOSIT
  killalltriggers
  getword CURRENTLINE $DEPMAX 9
  striptext $DEPMAX "("
  striptext $DEPMAX ")"
  striptext $DEPMAX ","

  if ($DEPMAX = $PLAYER~CREDITS)
    setvar $DEPAMOUNT ($DEPMAX - 500000)
  else
    setvar $DEPAMOUNT $DEPMAX
  end

  if ($DEPAMOUNT > 0)
    send $DEPAMOUNT "*"
  else
    send "0*"
  end
  send "t" $BANKTOO "*"
  settextlinetrigger BANKUNKNOWN :BANKUNKNOWN "Unknown Trader!"
  settexttrigger BANKUNSURE :BANKUNSURE "Do you mean"
  settexttrigger BANKPERSONFOUND :BANKPERSONFOUND "How many credits do you want to transfer?"
  pause
  :BANKUNKNOWN
  killalltriggers
  setvar $SWITCHBOARD~MESSAGE "Trader to send bank transfer cash not found. I will not try again.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $BANKCASH FALSE
  goto :BANKDONE
  :BANKUNSURE
  killalltriggers
  :BANKUNSUREAGAIN
  gettext CURRENTLINE $TESTNAME "Do you mean " "?"
  if ($TESTNAME <> $PREVIOUSNAME)
    setvar $PREVIOUSNAME $TESTNAME
    setvar $SWITCHBOARD~MESSAGE "Attempting Bank Transfer, Unsure of name, Did you mean: "&$TESTNAME&"? (10 secs to answer)*"
    gosub :SWITCHBOARD~SWITCHBOARD
    :GIVEUPAGAIN
    setdelaytrigger GETNAMEGIVEUP :GETNAMEGIVEUP 10000
    settexttrigger BANKUNSUREAGAIN :BANKUNSUREAGAIN "Do you mean"
    settexttrigger BANKUNKNOWN :BANKUNKNOWN "Unknown Trader!"
    settexttrigger BANKPERSONFOUND :BANKPERSONFOUND "How many credits do you want to transfer?"
    pause
  else
    settexttrigger BANKUNSUREAGAIN :BANKUNSUREAGAIN "Do you mean"
    pause
  end
  :GETNAMEGIVEUP
  killalltriggers
  send "n"
  goto :GIVEUPAGAIN

  goto :BANKDONE
  :BANKPERSONFOUND

  killalltriggers
  getword CURRENTLINE $TRANSAMOUNT 9
  striptext $TRANSAMOUNT "("
  striptext $TRANSAMOUNT ")"
  striptext $TRANSAMOUNT ","
  send $TRANSAMOUNT "*q s p"
  :BANKDONE

  killalltriggers
end
if ($PLAYER~CORPCASHDUMP = TRUE)

  if ($DODOCKCASHDUMP = TRUE)
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CREDITS > 1100000)
      setvar $DUMPCASH ($PLAYER~CREDITS - 150000)
    else
      setvar $DODOCKCASHDUMP FALSE
    end
  end
end

setvar $EXITMACRO ""


setvar $EXITMACRO $EXITMACRO&"qqq    *   "
if ($RESTOCKMAKEPLANET = 1)
  setvar $EXITMACRO $EXITMACRO&"u   y  n  .  n  *  c * *  "
end

if ($PLAYER~CORPCASHDUMP = TRUE)
  if ($DODOCKCASHDUMP = TRUE)
    setvar $EXITMACRO $EXITMACRO&"t  c  y  q   z   t"&$DUMPCASH&"*  *  *  "
  end
end

setvar $DOINGCITDROP FALSE
if (($DROPCASHCIT = TRUE) and ($PLAYER~CREDITS > 5000000))
  getsectorparameter $DROPCASHSECTOR "FIGSEC" $HASFIG
  if ($HASFIG = 1)
    setvar $EXITMACRO $EXITMACRO&"m  "&$DROPCASHSECTOR&"*   y   y  "
    setvar $DOINGCITDROP TRUE
  else
    send "'Drop Cash Sector Fig GonE?!?*"
    setvar $EXITMACRO $EXITMACRO&"m  "&$RETURNSPOT&"*   y   y  "
  end
else
  setvar $EXITMACRO $EXITMACRO&"m  "&$RETURNSPOT&"*   y   y  "
end
send $EXITMACRO
settextlinetrigger RESTOCKBACK1 :RESTOCKBACK1 "<Set NavPoint>"
settextlinetrigger RESTOCKBACK2 :RESTOCKBACK2 "Systems Ready, shall we engag"
pause
:RESTOCKBACK1
killalltriggers
send "q * q * * pss"
setvar $SWITCHBOARD~MESSAGE "Failed to leave dock!! Hopefully on dock..*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:RESTOCKBACK2

killalltriggers
if ($DOINGCITDROP = TRUE)
  setvar $DOINGCITDROP FALSE
  send "l" $DROPCASHPLANET "*c"
  gosub :PLAYER~QUIKSTATS
  send "tt" ($PLAYER~CREDITS - 500000) "*"
  setvar $DROPCASHTHISTRIP ($PLAYER~CREDITS - 500000)
  setvar $DROPCASHTOTAL ($DROPCASHTOTAL + ($PLAYER~CREDITS - 500000))
  send "q q "
  waitfor "Command [TL"
  gosub :PLAYER~QUIKSTATS
  setvar $PLAYER~WARPTO $RETURNSPOT
  gosub :PLAYER~TWARP
  gosub :PLAYER~QUIKSTATS
end
return
:CHECKCORPATDOCK


send "taq"
waitfor "-----------------------------------------------------------------------------"
:CORPATDOCKLOOKAGAIN

settextlinetrigger CORPATDOCK :CORPATDOCK ""
pause
:CORPNOTATDOCK1
killalltriggers
:CORPATDOCK


killalltriggers
getword CURRENTLINE $CHK 1
if ($CHK = "Corporate")
  goto :DONEATDOCK
end
getlength CURRENTLINE $CLEN
if ($CLEN > 48)

  cuttext CURRENTLINE $SECTOR 40 5
  striptext $SECTOR " "

  if ($SECTOR = $STARDOCK)
    setvar $PLAYER~CORPNOTATDOCK FALSE
  end
end
goto :CORPATDOCKLOOKAGAIN
:DONEATDOCK



return
:CHECKCORPPLANET


send "tlq"
waitfor "Corporate Planet Scan"
waitfor "======================================="
:CHECKCORPPLANETSLIST

settextlinetrigger CHECKCORPPLANETSLISTPLANET :CHECKCORPPLANETSLISTPLANET "#"
settextlinetrigger CHECKCORPPLANETSLISTNOPLANETS :CHECKCORPPLANETSLISTNOPLANETS "No Planets claimed"
settextlinetrigger CHECKCORPPLANETSLISTNOPLANETS2 :CHECKCORPPLANETSLISTNOPLANETS2 "You're not on a team!"
settextlinetrigger CHECKCORPPLANETSLISTENDPLANETS :CHECKCORPPLANETSLISTENDPLANETS "===   ============  ==== ==== ==== ===== ===== ===== ========== ====="
pause
:CHECKCORPPLANETSLISTPLANET
killalltriggers
getword CURRENTLINE $CHECKPLANET 1
if ($CHECKPLANET = $STARDOCK)
  setvar $PLANET~PLANETFOUND 1
  return
end
goto :CHECKCORPPLANETSLIST
:CHECKCORPPLANETSLISTNOPLANETS
:CHECKCORPPLANETSLISTNOPLANETS2
:CHECKCORPPLANETSLISTENDPLANETS
killalltriggers
return

return
:GETNEXTSECTOR









setvar $NDENSITY 0
setvar $NSECTOR 0
setvar $NWARPS 0
setvar $NHAZ 0
setvar $NANOM 0
setvar $NDANGER 0
setvar $DENI 0

setvar $NOKTOEXPLORE 0
setvar $NOKTOTRADE 0

gosub :SCANSECTORS

setvar $MAXWARPS 0
setvar $MAXWARPSSECTOR 0
setvar $MAXWARPSGOODPORT 0
setvar $MAXWARPSGOODPORTSECTOR 0
setvar $MAXPRODAMOUNT 0
setvar $MAXPRODAMOUNTSECTOR 0

setvar $I 1

while ($I <= $DENI)

  setvar $DANGER 0
  setvar $DSECTOR $NSECTOR[$I]
  setvar $DINDEX $I
  gosub :CHECKDANGER
  setvar $NDANGER[$I] $DANGER
  setvar $NOKTOEXPLORE[$I] 0
  setvar $NOKTOTRADE[$I] 0



  if (($EXPLORED[$NSECTOR[$I]] = 0) and ($DANGER = 0))


    setvar $NOKTOEXPLORE[$I] 1

    if ($NWARPS[$I] > $MAXWARPS)
      setvar $MAXWARPS $NWARPS[$I]
      setvar $MAXWARPSSECTOR $NSECTOR[$I]
    end


    setvar $PORTTOCHECK $NSECTOR[$I]
    setvar $PORTCHECKEDOK 0
    gosub :SEARCHFORTRADINGPORT

    if ($PORTCHECKEDOK = 1)
      gosub :GETPORTQUANTS

      if ($PRODPERC >= $TRADINGMINPRODUCT)
        setvar $NOKTOTRADE[$I] 1

        if ($NWARPS[$I] > $MAXWARPSGOODPORT)

          setvar $MAXWARPSGOODPORT $NWARPS[$I]
          setvar $MAXWARPSGOODPORTSECTOR $NSECTOR[$I]
        end
        if ($PRODAMOUNT > $MAXPRODAMOUNT)
          setvar $MAXPRODAMOUNT $PRODAMOUNT
          setvar $MAXPRODAMOUNTSECTOR $NSECTOR[$I]
        end
      else
      end
    end
  end


  add $I 1
end


setvar $ADDSECTORS 0
setvar $GRIDSECTORPOSTTWARP 0
setvar $GETFUTUREPORTONLY 0
setvar $GRIDSECTOR 0

if ($MAXPRODAMOUNTSECTOR <> 0)
  setvar $GRIDSECTOR $MAXPRODAMOUNTSECTOR
  setvar $ADDSECTORS 1

  gosub :REMOVEFUTURE
elseif ($MAXWARPSSECTOR <> 0)
  setvar $ADDSECTORS 1

  if ($FUTUREPORTSADDED > 0)
    setvar $TEMPGRIDSECTOR $MAXWARPSSECTOR
    setvar $GETFUTUREPORTONLY 1
    gosub :GETFUTUREDEST

    if ($GRIDSECTOR = 0)
      setvar $GRIDSECTOR $TEMPGRIDSECTOR
    else
    end
    gosub :REMOVEFUTURE
  else
    setvar $GRIDSECTOR $MAXWARPSSECTOR


    gosub :REMOVEFUTURE
  end

else
  setvar $GRIDSECTOR 0
  if ($FUTUREDESTSADDED > 0)

    gosub :GETFUTUREDEST

    if ($GRIDSECTOR = 0)
      gosub :HOLOSCAN
      setvar $SWITCHBOARD~MESSAGE "Out of options, try figs and CIM Warps update*"
      gosub :SWITCHBOARD~SWITCHBOARD

      halt
    end

  else
    gosub :HOLOSCAN
    setvar $SWITCHBOARD~MESSAGE "Out of options, try figs and CIM Warps update*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end


end
if ($ADDSECTORS = 1)


  setvar $I 1
  while ($I <= $DENI)
    if (($NOKTOEXPLORE[$I] = 1) and ($GRIDSECTOR <> $NSECTOR[$I]))



      if (($NWARPS[$I] = 1) and ($NOKTOTRADE[$I] = 1)) or ($NWARPS[$I] > 1)
        setvar $FUTUREDESTINATIONS[$NSECTOR[$I]] 1
        add $FUTUREDESTSADDED 1


        setvar $FUTUREDESTINATIONS[$NSECTOR[$I]][0] CURRENTSECTOR

        setvar $FUTUREDESTINATIONS[$NSECTOR[$I]][1] $NDENSITY[$I]

        setvar $FUTUREDESTINATIONS[$NSECTOR[$I]][2] $NWARPS[$I]


        if ($NOKTOTRADE[$I] = 1)
          setvar $FUTUREDESTINATIONS[$NSECTOR[$I]][3] 1
          add $FUTUREPORTSADDED 1
          setvar $WRITESTUFF $NSECTOR[$I]&" "&CURRENTSECTOR&" "&$NDENSITY[$I]&" "&$NWARPS[$I]
          write $MOOGOODPORTSFILE $WRITESTUFF
        else
          setvar $FUTUREDESTINATIONS[$NSECTOR[$I]][3] 0
        end
      end
    end
    add $I 1
  end
end

return
:GETPORTQUANTS




if ($PRIMARYPRODUCT = 1)
  setvar $PRODPERC PORT.PERCENTFUEL[$NSECTOR[$I]]
  setvar $PRODAMOUNT PORT.FUEL[$NSECTOR[$I]]
elseif ($PRIMARYPRODUCT = 2)
  setvar $PRODPERC PORT.PERCENTORG[$NSECTOR[$I]]
  setvar $PRODAMOUNT PORT.ORG[$NSECTOR[$I]]
elseif ($PRIMARYPRODUCT = 3)
  setvar $PRODPERC PORT.PERCENTEQUIP[$NSECTOR[$I]]
  setvar $PRODAMOUNT PORT.EQUIP[$NSECTOR[$I]]

end
return
:REMOVEFUTURE


setvar $FUTUREDESTINATIONS[$GRIDSECTOR] 0
return
:GETFUTUREDEST




setvar $MAXWARPS 0
setvar $MAXWARPSSECTOR 0
setvar $MAXWARPSGOODPORT 0
setvar $MAXWARPSGOODPORTSECTOR 0
setvar $GRIDSECTORPOSTTWARP 0

setvar $I 1
while ($I <= SECTORS)

  if ($FUTUREDESTINATIONS[$I] = 1)
    if ($FUTUREDESTINATIONS[$I][2] > $MAXWARPS)
      setvar $MAXWARPS $FUTUREDESTINATIONS[$I][2]
      setvar $MAXWARPSSECTOR $I
    end

    if ($FUTUREDESTINATIONS[$I][3] = 1)
      if ($FUTUREDESTINATIONS[$I][2] > $MAXWARPSGOODPORT)
        setvar $MAXWARPSGOODPORT $FUTUREDESTINATIONS[$I][2]
        setvar $MAXWARPSGOODPORTSECTOR $I
      end
    end
  end
  add $I 1
end

subtract $FUTUREDESTSADDED 1

if ($MAXWARPSGOODPORTSECTOR > 0)
  subtract $FUTUREPORTSADDED 1

  setvar $CHECKSECTOR $FUTUREDESTINATIONS[$MAXWARPSGOODPORTSECTOR][0]
  getsectorparameter $CHECKSECTOR "FIGSEC" $HASFIG

  setvar $PORTEXISTS 0
  setvar $CHECKPORTSECTOR $MAXWARPSGOODPORTSECTOR
  gosub :CHECKPORTEXITS
  if (($HASFIG = 1) and ($PORTEXISTS = 1))
    setvar $GRIDSECTOR $FUTUREDESTINATIONS[$MAXWARPSGOODPORTSECTOR][0]
    setvar $FUTUREDESTINATIONS[$MAXWARPSGOODPORTSECTOR] 0
    setvar $GRIDSECTORPOSTTWARP $MAXWARPSGOODPORTSECTOR

  else
    setvar $FUTUREDESTINATIONS[$MAXWARPSGOODPORTSECTOR] 0
    if ($FUTUREDESTSADDED = 0)
      return
    else
      gosub :GETFUTUREDEST
    end
  end
elseif (($GETFUTUREPORTONLY = 0) and ($MAXWARPSSECTOR <> 0))


  setvar $CHECKSECTOR $FUTUREDESTINATIONS[$MAXWARPSSECTOR][0]
  getsectorparameter $CHECKSECTOR "FIGSEC" $HASFIG
  setvar $PORTEXISTS 0
  setvar $CHECKPORTSECTOR $MAXWARPSSECTOR
  gosub :CHECKPORTEXITS

  if (($HASFIG = 1) and ($PORTEXISTS = 1))
    setvar $GRIDSECTOR $FUTUREDESTINATIONS[$MAXWARPSSECTOR][0]
    setvar $FUTUREDESTINATIONS[$MAXWARPSSECTOR] 0
    setvar $GRIDSECTORPOSTTWARP $MAXWARPSSECTOR
  else
    setvar $FUTUREDESTINATIONS[$MAXWARPSSECTOR] 0
    if ($FUTUREDESTSADDED = 0)
      return
    else
      gosub :GETFUTUREDEST
    end
  end
end


return
:CHECKPORTEXITS

send "cr" $CHECKPORTSECTOR "*q"
waitfor "Computer activate"
settextlinetrigger PORTEXISTSY :PORTEXISTSY "Commerce report for"
settextlinetrigger PORTEXISTSNO :PORTEXISTSNO "I have no information about a port in that sector"
settextlinetrigger PORTEXISTSNO2 :PORTEXISTSNO2 "u have never visted sector"
pause
:PORTEXISTSY
setvar $PORTEXISTS 1
:PORTEXISTSNO
:PORTEXISTSNO2

killtrigger PORTEXISTSNO
killtrigger PORTEXISTSNO2
killtrigger PORTEXISTSY
return
:SETVOIDSECTORS





setvar $EXPLORED[$STARDOCK] 1
setvar $A 1
while ($A <= SECTOR.WARPCOUNT[$STARDOCK])

  setvar $EXPLORED[SECTOR.WARPS[$STARDOCK][$A]] 1
  add $A 1
end

setvar $A 1
while ($A <= 10)
  setvar $EXPLORED[$A] 1
  setvar $Y 1
  while ($Y <= SECTOR.WARPCOUNT[$A])

    setvar $EXPLORED[SECTOR.WARPS[$A][$Y]] 1
    add $Y 1
  end
  add $A 1
end



return
:SUBREPORT


setvar $STUFF ""
gosub :CALCSTATS
setvar $SWITCHBOARD~MESSAGE $STUFF&"**"
gosub :SWITCHBOARD~SWITCHBOARD
return
:UPDATESTATS


setvar $STUFF ""
gosub :CALCSTATS

setwindowcontents "MOO" $STUFF
add $UPDATECOUNT 1
if ($UPDATECOUNT > 20)
  setvar $UPDATECOUNT 1
  send "'Moo Update - Planets: " $STAT_TORPS " Turns: " $STAT_TURNSUSED_FORMATTED " Net Profit: " $STAT_DOLLARSNET_FORMATTED "*"
end
return
:CALCSTATS


setvar $STAT_DOLLARSNET ($STAT_DOLLARSGROSS - $STAT_DOLLARSSPENT)

setvar $STAT_TURNSUSED ($STARTTURNS - $PLAYER~TURNS)


format $STAT_DOLLARSGROSS $STAT_DOLLARSGROSS_FORMATTED "NUMBER"
format $STAT_DOLLARSNET $STAT_DOLLARSNET_FORMATTED "NUMBER"
format $STAT_TURNSUSED $STAT_TURNSUSED_FORMATTED "NUMBER"
format $STAT_DOLLARSSPENT $STAT_DOLLARSSPENT_FORMATTED "NUMBER"

setvar $STUFF "Turns Used: "&$STAT_TURNSUSED_FORMATTED&"*Figs Down: "&$STAT_FIGSDOWN&"*Ports Traded: "&$STAT_TRADES&"*Moves Made: "&$STAT_MOVES&"*Gross Cash:"&$STAT_DOLLARSGROSS_FORMATTED&"*Expense:"&$STAT_DOLLARSSPENT_FORMATTED&"*Net Cash:"&$STAT_DOLLARSNET_FORMATTED
setvar $STUFF $STUFF&"*Refurbs: "&$STAT_REFURBS&"*Gen Torps: "&$STAT_TORPS&"*Atomics: "&$STAT_ATOMICS
return
:CHECKDANGER



if ($ALLLIMPS[$DSECTOR] > 0)
  subtract $NDENSITY[$DINDEX] (2 * $ALLLIMPS[$DSECTOR])
  setvar $NANOM[$DINDEX] 0
end

if ($ALLARMIDS[$DSECTOR] > 0)
  subtract $NDENSITY[$DINDEX] (10 * $ALLARMIDS[$DSECTOR])
end

if ($NDENSITY[$DINDEX] = 0) or (($NDENSITY[$DINDEX] = 100) and (PORT.EXISTS[$DSECTOR] = 1))
  setvar $DANGER 0

else
  if (($NDENSITY[$DINDEX] = 5) or ($NDENSITY[$DINDEX] = 105))
    getsectorparameter $DSECTOR "FIGSEC" $HASFIG
    if ($HASFIG = 1)

      setvar $DANGER 0
    else

      setvar $DANGER 1
    end

  else
    if ($DSECTOR < 11)
      setvar $DANGER 0

    else

      setvar $DANGER 1
    end
  end
end

if ($DANGER = 0)
  if ($NHAZ[$DINDEX] = 0)
    if ($NANOM[$DINDEX] = 0)

      setvar $DANGER 0
    elseif ($DSECTOR < 11)

      setvar $DANGER 0
    else

      setvar $DANGER 1
    end
  else

    setvar $DANGER 1
  end
end
if ($DANGER = 1)





  write $DANGEROUSSECTORLOGFILE $DSECTOR&" N:"&CURRENTSECTOR&" D: "&$NDENSITY[$DINDEX]&" A: "&$NANOM[$DINDEX]
  setvar $A 1
  while ($A <= SECTOR.WARPCOUNT[CURRENTSECTOR])

    if (SECTOR.WARPS[CURRENTSECTOR][$A] = $DSECTOR)
      write $DANGEROUSSECTORLOGFILE $HOLODATA[$A]
    end
    add $A 1
  end
end

return
:SCANSECTORS



gosub :DENSITYSCAN

if ($FRESHSECTORSI > 0)

  gosub :HOLOSCAN
  setvar $DI 1
  send "c"
  waitfor "<Computer activated>"

  while ($DI <= $FRESHSECTORSI)

    send "r" $FRESHSECTORS[$DI] "*"
    add $DI 1
  end
  setvar $DI 0
  :REPORTING

  settextlinetrigger GETNEXTSECTORREPORT :GETNEXTSECTORREPORT "Commerce report for"
  settextlinetrigger GETNEXTSECTORNOREPORT :GETNEXTSECTORNOREPORT "have no information about a port in that se"
  pause
  :GETNEXTSECTORREPORT
  killalltriggers
  add $DI 1
  setvar $PORTREPORTED[$FRESHSECTORS[$DI]] 1
  if ($DI >= $FRESHSECTORSI)
    goto :FINISHREPORTING
  else
    goto :REPORTING
  end
  :GETNEXTSECTORNOREPORT

  killalltriggers
  add $DI 1
  setvar $PORTREPORTED[$FRESHSECTORS[$DI]] 1
  setvar $PORTBLOCKED[$FRESHSECTORS[$DI]] 1
  if ($DI >= $FRESHSECTORSI)
    goto :FINISHREPORTING
  else
    goto :REPORTING
  end
  :FINISHREPORTING


  send "q"
  waitfor "<Computer deactivated>"
end






setvar $REPORTSGATHEREDI 0
setvar $REPORTSGATHERED 0


setvar $DI 1

send "c"
while ($DI <= $DENI)

  if ($PORTREPORTED[$NSECTOR[$DI]] = 0)
    send "r" $NSECTOR[$DI] "*"
    add $REPORTSGATHEREDI 1
    setvar $REPORTSGATHERED[$DI] $NSECTOR[$DI]
  end

  add $DI 1
end
send "q"

if ($REPORTSGATHEREDI > 0)
  setvar $DI 0
  :STARTREPORT2

  add $DI 1
  settextlinetrigger GETNEXTSECTORREPORT2 :GETNEXTSECTORREPORT2 "Commerce report for"
  settextlinetrigger GETNEXTSECTORNOREPORT2 :GETNEXTSECTORNOREPORT2 "have no information about a port in that se"
  pause
  :GETNEXTSECTORREPORT2

  killalltriggers
  setvar $PORTREPORTED[$NSECTOR[$DI]] 1

  if ($DI >= $REPORTSGATHEREDI)
    goto :ENDREPORT2
  else
    goto :STARTREPORT2
  end
  :GETNEXTSECTORNOREPORT2
  killalltriggers
  setvar $PORTREPORTED[$NSECTOR[$DI]] 1
  setvar $PORTBLOCKED[$NSECTOR[$DI]] 1

  if ($DI >= $REPORTSGATHEREDI)
    goto :ENDREPORT2
  else
    goto :STARTREPORT2
  end
  :ENDREPORT2

  waitfor "<Computer deactivated>"
end



return
:GRIDNEXTSECTOR






if (($GRIDSECTOR < 11) or ($GRIDSECTOR = $STARDOCK))
  send "m" $GRIDSECTOR "**"
  add $STAT_MOVES 1
else

  setvar $PLAYER~MOVEINTOSECTOR $GRIDSECTOR
  gosub :PLAYER~MOVEINTOSECTOR
end
if ($SECURE)

  if ($PLAYER~ARMIDS >= 3)
    send "h 13*c "
    setvar $ALLARMIDS[$GRIDSECTOR] 3
    setsectorparameter $GRIDSECTOR "MINESEC" 1
  end

  if ($PLAYER~LIMPETS >= 2)
    send "h 22* c "
    setvar $ALLLIMPS[$GRIDSECTOR] 2
    setsectorparameter $GRIDSECTOR "LIMPSEC" 1
  end
end


add $STAT_FIGSDOWN 1
add $STAT_MOVES 1
return
:HOLOSCAN


send "sh"
waitfor "Long Range Scan"
setvar $HINDEX 1
setvar $HDATA ""
:HOLOSECTORSTART
settextlinetrigger HOLOSCANFIRSTSECTOR :HOLOSCANFIRSTSECTOR "Sector  :"
pause
:HOLOSCANFIRSTSECTOR
killtrigger HOLOSCANFIRSTSECTOR
getword CURRENTLINE $HSECTOR 3
setvar $HDATA "     "&CURRENTLINE
:HOLOSCANCONTINUE


settextlinetrigger HOLOSCANDETAILS :HOLOSCANDETAILS ""
pause
:HOLOSCANDETAILS

killtrigger HOLOSCANDETAILS
getword CURRENTLINE $FIRSTWORD 1
if ($FIRSTWORD = "Warps")
  return
elseif ($FIRSTWORD = "Sector")
  setvar $HOLODATA[$HINDEX] $HDATA
  add $HINDEX 1
  setvar $HDATA "     "&CURRENTLINE
  goto :HOLOSCANCONTINUE
else
  setvar $HDATA "     "&$HDATA&"*"&CURRENTLINE
  goto :HOLOSCANCONTINUE


end
return
:DENSITYSCAN




send "sd"
waitfor "Relative Density Scan"

setvar $DENI 0
setvar $NDENSITY 0
setvar $NSECTOR 0
setvar $NWARPS 0
setvar $NHAZ 0
setvar $NANOM 0

setvar $FRESHSECTORS 0
setvar $FRESHSECTORSI 0
:DENSITYSCANNING



settextlinetrigger DENSITYSCANLINE :DENSITYSCANLINE "Sector"
settexttrigger DENSITYSCANEND :DENSITYSCANEND "Help)?"
pause
:DENSITYSCANLINE


killtrigger DENSITYSCANLINE
killtrigger DENSITYSCANEND

getword CURRENTLINE $SCANSECTOR 2
if ($SCANSECTOR = "(")
  getword CURRENTLINE $SCANSECTOR 3
  getword CURRENTLINE $SECDENSITY 5
  getword CURRENTLINE $SECWARPS 8
  getword CURRENTLINE $NHAZ 11
  getword CURRENTLINE $SCANANOM 14
else
  getword CURRENTLINE $SECDENSITY 4
  getword CURRENTLINE $SECWARPS 7
  getword CURRENTLINE $NHAZ 10
  getword CURRENTLINE $SCANANOM 13
end

striptext $NHAZ "%"

getlength $SCANSECTOR $LEN

striptext $SCANSECTOR ")"
striptext $SCANSECTOR "("
getlength $SCANSECTOR $LEN2
if ($LEN2 < $LEN)
  add $FRESHSECTORSI 1
  setvar $FRESHSECTORS[$FRESHSECTORSI] $SCANSECTOR
end
striptext $SECDENSITY ","

add $DENI 1
setvar $NDENSITY[$DENI] $SECDENSITY
setvar $NSECTOR[$DENI] $SCANSECTOR
setvar $NWARPS[$DENI] $SECWARPS
setvar $NHAZ[$DENI] $NHAZ
setvar $NANOM[$DENI] 0
if ($SCANANOM = "Yes")
  setvar $ANOMOLY[$SCANSECTOR] 1
  setvar $NANOM[$DENI] 1
end

goto :DENSITYSCANNING
:DENSITYSCANEND

killtrigger DENSITYSCANLINE
killtrigger DENSITYSCANEND
return



halt
:CHECKSAFETOBLOW


send "lq*"
:CHECKSAFETOBLOWSTART


settextlinetrigger CHECKSAFETOBLOWNOPLANET :CHECKSAFETOBLOWNOPLANET "There isn't a planet in this sector."
settextlinetrigger CHECKSAFETOBLOWCIT1 :CHECKSAFETOBLOWCIT1 "Level 1"
settextlinetrigger CHECKSAFETOBLOWCIT2 :CHECKSAFETOBLOWCIT2 "Level 2"
settextlinetrigger CHECKSAFETOBLOWCIT3 :CHECKSAFETOBLOWCIT3 "Level 3"
settextlinetrigger CHECKSAFETOBLOWCIT4 :CHECKSAFETOBLOWCIT4 "Level 4"
settextlinetrigger CHECKSAFETOBLOWCIT5 :CHECKSAFETOBLOWCIT5 "Level 5"
settextlinetrigger CHECKSAFETOBLOWCIT6 :CHECKSAFETOBLOWCIT6 "Level 6"
settextlinetrigger CHECKSAFETOBLOWCIT7 :CHECKSAFETOBLOWCIT7 "<<<< SHIELDED PLANET >>>>"
settexttrigger CHECKSAFETOBLOWFINISH :CHECKSAFETOBLOWFINISH "Land on which planet"
pause
:CHECKSAFETOBLOWCIT1
:CHECKSAFETOBLOWCIT2
:CHECKSAFETOBLOWCIT3
:CHECKSAFETOBLOWCIT4
:CHECKSAFETOBLOWCIT5
:CHECKSAFETOBLOWCIT6


killalltriggers
setvar $SAFETOBLOW 0
setvar $NOPLANETSINSECTOR 0
return
:CHECKSAFETOBLOWCIT7
killalltriggers
setvar $SAFETOBLOW 0
return
:CHECKSAFETOBLOWFINISH
setvar $NOPLANETSINSECTOR 0
:CHECKSAFETOBLOWNOPLANET
killalltriggers
return
waitfor "Command ["


return
:CREATEANDSELL



gosub :RESETPLANETSUSED

setvar $PLANET~PLANETSINSECTOR 0
setvar $PLANET~PLANETS 0
setvar $PLANET~PLANETNAMES 0
setvar $PLANET~PLANETI 1

setvar $SAFETOBLOW 1
setvar $NOPLANETSINSECTOR 1
gosub :CHECKSAFETOBLOW
if ($SAFETOBLOW = 0)
  echo "*#########################################"
  echo "* ### CITADELS DETECTED SKIPPING BOOMS ###"
  echo "*#########################################"
  setvar $SWITCHBOARD~MESSAGE "Warning: Citadel in sector, skipping.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
end

setvar $CHECKNEWPLANET 0

if ($NOPLANETSINSECTOR = 0)
  gosub :RECHECKPLANETS
  gosub :CHECKPLANETNAMES
end


setvar $GO 1
setvar $PLANET~PLANETSINSECTORCHK $PLANET~PLANETSINSECTOR

while ($GO = 1)



  if ($PLANET~PLANETSINSECTORCHK >= $PREFERREDPLANETSLOT)

    setvar $CHECKNEWPLANET 0
    gosub :RECHECKPLANETS
    setvar $REMOVEPLANETNAME $PLANET~PLANETNAMES[$PREFERREDPLANETSLOT]
    gosub :REMOVEPLANET
    setvar $SHIPBLASTPLANET $PLANET~PLANETS[$PREFERREDPLANETSLOT]
    gosub :BLASTPLANET
    setvar $CHECKNEWPLANET 0
    gosub :RECHECKPLANETS
    setvar $PLANET~PLANETSINSECTORCHK $PLANET~PLANETSINSECTOR
  end


  setvar $GETPLANETSETTINGSREQ 0
  setvar $GOODPLANET 0
  gosub :MAKEAPLANET

  if ($GETPLANETSETTINGSREQ > 0)
    setvar $CHECKNEWPLANET 1
    gosub :RECHECKPLANETS
    setvar $CHECKNEWPLANET 0
    setvar $CHECKPLANET $NEWPLANETMADE
    gosub :UPDATEMOOPLANET
    if ($GOODPLANET = 1)

      setvar $TRADEPLANET $NEWPLANETMADE
    end
  end



  if ($GOODPLANET = 1)


    if ($GETPLANETSETTINGSREQ = 0)
      setvar $CHECKNEWPLANET 0
      setvar $NEWPLANETMADE 0
      setvar $TRADEPLANET $NEWPLANETNAME
    end


    setvar $TRADEORE 0
    setvar $TRADEORG 0
    setvar $TRADEEQUIP 0
    gosub :PLANETTRADE
    :SELLDONEPORT


    send "cr*q"
    waitfor "<Computer deactivated>"
    if ($PRIMARYPRODUCT = 1)
      setvar $PRODPERC PORT.PERCENTFUEL[CURRENTSECTOR]
    elseif ($PRIMARYPRODUCT = 2)
      setvar $PRODPERC PORT.PERCENTORG[CURRENTSECTOR]
    elseif ($PRIMARYPRODUCT = 3)
      setvar $PRODPERC PORT.PERCENTEQUIP[CURRENTSECTOR]
    end
    if ($PRODPERC < $TRADINGMINPRODUCT)
      setvar $GO 0
    end
  end







end
if ($TRADEPLANET > $PLANET~PLANETSALLOWED)
  setvar $CLEANUP 2
else
  setvar $CLEANUP $USERCLEANUP
end

if ($CLEANUP > 0)

  if ($PLANET~PLANETSINSECTOR = 0)
    setvar $CHECKNEWPLANET 0
    gosub :RECHECKPLANETS
  end
  setvar $PLANET~PLANETSTOBLOW 0
  setvar $FIGSREQUIRED 0
  setvar $I 1
  while ($I <= $PLANET~PLANETSINSECTOR)


    if ($PLANET~PLANETS[$I] <> $TRADEPLANET)
      add $PLANET~PLANETSTOBLOW 1
      add $FIGSREQUIRED (100 * $PLANET~PLANETSTOBLOW)
    elseif ($CLEANUP = 2)
      add $PLANET~PLANETSTOBLOW 1
      add $FIGSREQUIRED ($FIGSREQUIRED + (100 * $PLANET~PLANETSTOBLOW))
    end


    add $I 1
  end

  add $FIGSREQUIRED ($FIGSREQUIRED + 101)
  if ($FIGSREQUIRED > $PLAYER~FIGHTERS)
    gosub :PLAYER~QUIKSTATS
    if ($FIGSREQUIRED > $PLAYER~FIGHTERS)
      echo "*#########################################"
      echo "* ### Not enough figs For Clean up, theoritically you could go boom! ###"
      echo "*#########################################"
      setvar $SWITCHBOARD~MESSAGE "Warning: Fighters low, can not do cleanup. Need "&$FIGSREQUIRED&" fighters.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end
  echo "planet~planetsInSector " $PLANET~PLANETSINSECTOR "*"

  setvar $I 1
  while ($I <= $PLANET~PLANETSINSECTOR)


    if ($PLANET~PLANETS[$I] <> $TRADEPLANET)

      setvar $SHIPBLASTPLANET $PLANET~PLANETS[$I]
      gosub :BLASTPLANET
    elseif ($CLEANUP = 2)
      setvar $SHIPBLASTPLANET $TRADEPLANET
      gosub :BLASTPLANET
    end


    add $I 1
  end
end


return
:UPDATEMOOPLANET



send "l" $CHECKPLANET "*"
gosub :PLANET~GETPLANETINFO
send "q"
setvar $MOOTHEPLANET 0



setvar $PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][1] 1
setvar $PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][2] $PLANET~PLANET_FUEL
setvar $PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][3] $PLANET~PLANET_ORGANICS
setvar $PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][4] $PLANET~PLANET_EQUIPMENT

if (($PLANET~PLANET_FUEL >= $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
  setvar $MOOTHEPLANET 1
end
if (($PLANET~PLANET_ORGANICS >= $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
  setvar $MOOTHEPLANET 1
end
if (($PLANET~PLANET_EQUIPMENT >= $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
  setvar $MOOTHEPLANET 1
end
setvar $PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][5] $MOOTHEPLANET

if ($MOOTHEPLANET = 1)
  gosub :CHECKGOODPLANET
end
gosub :REWRITEMOOSETTINGS


return
:CHECKGOODPLANET



if (($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][2] > $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
  if ((PORT.BUYFUEL[CURRENTSECTOR] = 1) and (PORT.PERCENTFUEL[CURRENTSECTOR] >= $TRADINGMINPRODUCT))
    setvar $GOODPLANET 1
  end
end
if (($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][3] > $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
  if ((PORT.BUYORG[CURRENTSECTOR] = 1) and (PORT.PERCENTORG[CURRENTSECTOR] >= $TRADINGMINPRODUCT))
    setvar $GOODPLANET 1
  end
end
if (($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][4] > $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
  if ((PORT.BUYEQUIP[CURRENTSECTOR] = 1) and (PORT.PERCENTEQUIP[CURRENTSECTOR] >= $TRADINGMINPRODUCT))
    setvar $GOODPLANET 1
  end
end
return
:MAKEAPLANET


gosub :GETPLANETNAME

if ($PLAYER~GENESIS = 0)
  goto :BUILDPLANET1
end
:UPDATEPLANETSFINISHWAIT
setvar $GOODPLANET 0
if ($PLANET~PLANETSINSECTORCHK >= $GAME~MAX_PLANETS_PER_SECTOR)
  send "u y n " $NEWPLANETNAME "* z p * "
else
  send "u y " $NEWPLANETNAME "* z p * "
end
:BUILDPLANET
settextlinetrigger BUILDPLANET1 :BUILDPLANET1 "You don't have any Genesis Torpedoes to launch!"
settextlinetrigger BUILDPLANET2 :BUILDPLANET2 "For building this planet you receive"
pause
:BUILDPLANET1
killalltriggers

gosub :RESTOCK
goto :UPDATEPLANETSFINISHWAIT
:BUILDPLANET2

killalltriggers
subtract $PLAYER~GENESIS 1
add $STAT_TORPS 1
add $PLANET~PLANETSINSECTORCHK 1


setvar $PLANET~PLANETINDEXFOUND 0
setvar $T 1
while ($T <= $TOTALGAMEPLANETS)
  settextlinetrigger $T :":MAKEPLANETLBL"&$T $PLANET~PLANETLIST[$T]
  add $T 1
end
pause
:MAKEPLANETLBL1
setvar $PLANET~PLANETINDEXFOUND 1
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL2
setvar $PLANET~PLANETINDEXFOUND 2
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL3
setvar $PLANET~PLANETINDEXFOUND 3
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL4
setvar $PLANET~PLANETINDEXFOUND 4
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL5
setvar $PLANET~PLANETINDEXFOUND 5
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL6
setvar $PLANET~PLANETINDEXFOUND 6
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL7
setvar $PLANET~PLANETINDEXFOUND 7
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL8
setvar $PLANET~PLANETINDEXFOUND 8
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL9
setvar $PLANET~PLANETINDEXFOUND 9
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL10
setvar $PLANET~PLANETINDEXFOUND 10
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL11
setvar $PLANET~PLANETINDEXFOUND 11
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL12
setvar $PLANET~PLANETINDEXFOUND 12
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL13
setvar $PLANET~PLANETINDEXFOUND 13
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL14
setvar $PLANET~PLANETINDEXFOUND 14
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL15
setvar $PLANET~PLANETINDEXFOUND 15
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL16
setvar $PLANET~PLANETINDEXFOUND 16
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL17
setvar $PLANET~PLANETINDEXFOUND 17
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL18
setvar $PLANET~PLANETINDEXFOUND 18
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL19
setvar $PLANET~PLANETINDEXFOUND 19
goto :ENDMAKEPLANETLBLS
:MAKEPLANETLBL20
setvar $PLANET~PLANETINDEXFOUND 20
goto :ENDMAKEPLANETLBLS
:ENDMAKEPLANETLBLS


if ($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][1] = 0)
  setvar $GETPLANETSETTINGSREQ $PLANET~PLANETINDEXFOUND
else
  if ($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][5] = 1)
    gosub :CHECKGOODPLANET
  end
end



return
:BLASTPLANET
:BLASTBLASTBLAST



send "l " $SHIPBLASTPLANET "* z d y * "
:BLOWPLANET

settextlinetrigger BLOWPLANET1 :BLOWPLANET1 "You do not have any Atomic Detonators!"
settextlinetrigger BLOWPLANET2 :BLOWPLANET2 "For blowing up this planet you receive"
settextlinetrigger BLOWPLANET3 :BLOWPLANET3 "Invalid registry number, landing aborted."
settextlinetrigger NOPLANET :BLOWPLANET3 "TransWarp Drive shutting down."
pause
:BLOWPLANET3
killalltriggers


echo "**############################################"
echo "*############################################"
echo "*#####  BLAST PLANET NOT FOUND - BUG BUG ####"
echo "*###### LET HAMMER KNOW - GENTLY!       #####"
echo "*############################################"
echo "*############################################"

setdelaytrigger DELAY :BLASTFAIL 5000
pause
:BLASTFAIL
return
:BLOWPLANET1

killalltriggers
send "q"
waitfor "Blasting off from"
waitfor "(?=Help)?"
gosub :PLAYER~QUIKSTATS

gosub :RESTOCK


goto :BLASTBLASTBLAST
:BLOWPLANET2
killalltriggers
setvar $GOODPLANET 0
waitfor "(?=Help)?"
add $STAT_ATOMICS 1

setvar $GOODPLANET 0

return
:RECHECKPLANETS


if ($CHECKNEWPLANET = 1)

  setvar $PREVPLANETSINSECTOR 0
  setvar $PREVPLANETS 0
  setvar $PREVPLANETI 1
  while ($PREVPLANETI <= $PLANET~PLANETSINSECTOR)

    setvar $PREVPLANETS[$PREVPLANETI] $PLANET~PLANETS[$PREVPLANETI]
    add $PREVPLANETSINSECTOR 1
    add $PREVPLANETI 1
  end
end

setvar $PLANET~PLANETSINSECTOR 0
setvar $PLANET~PLANETS 0
setvar $PLANET~PLANETI 1
send "l*"
setvar $STARTLOGGING 0
:RECHECKPLANETST
settextlinetrigger RECHECKPLANETST1 :RECHECKPLANETST1 "There isn't a planet in this sector."
settextlinetrigger RECHECKPLANETSSTART :RECHECKPLANETSSTART "------------------------------------------------------------------------------"
settextlinetrigger RECHECKPLANETST2 :RECHECKPLANETST2 "<"
settexttrigger RECHECKPLANETST3 :RECHECKPLANETST3 "Land on which planet"
pause
:RECHECKPLANETSSTART
killalltriggers
setvar $STARTLOGGING 1
goto :RECHECKPLANETST
:RECHECKPLANETST1
killalltriggers

waitfor "Command ["
return
:RECHECKPLANETST2
killalltriggers
if ($STARTLOGGING = 1)


  getword CURRENTLINE $CPLANETNUM 1
  if ($CPLANETNUM = "Land")
    goto :RECHECKPLANETST3
  elseif ($CPLANETNUM = "<")
    getword CURRENTLINE $CPLANETNUM 2
    striptext $CPLANETNUM ">"
  else
    striptext $CPLANETNUM ">"
    striptext $CPLANETNUM "<"
  end
  cuttext CURRENTLINE $PLANETNAME 11 37

  trim $PLANETNAME
  if ($PLANETNAME = $NEWPLANETNAME)
    setvar $NEWPLANETMADE $CPLANETNUM
  end
  add $PLANET~PLANETSINSECTOR 1
  setvar $PLANET~PLANETS[$PLANET~PLANETI] $CPLANETNUM
  setvar $PLANET~PLANETNAMES[$PLANET~PLANETI] $PLANETNAME

  add $PLANET~PLANETI 1
end
goto :RECHECKPLANETST
:RECHECKPLANETST3

killalltriggers
waitfor "Command ["

if ($CHECKNEWPLANET = 11)
  setvar $PLANET~PLANETI 1
  while ($PLANET~PLANETI <= $PLANET~PLANETSINSECTOR)
    setvar $SEARCHPLANET $PLANET~PLANETS[$PLANET~PLANETI]
    setvar $SEARCHI 1
    setvar $FOUND 0

    while ($SEARCHI <= $PREVPLANETSINSECTOR)
      if ($PREVPLANETS[$SEARCHI] = $SEARCHPLANET)
        setvar $FOUND 1
      end
      add $SEARCHI 1
    end
    if ($FOUND = 0)
      setvar $NEWPLANETMADE $SEARCHPLANET
    end
    add $PLANET~PLANETI 1
  end
end

return
:GOTODOCK

send "y1*q"
send "m" $STARDOCK "*y"
waitfor "All Systems Ready, shall we engage?"
send "y"
waitfor "TransWarp Drive Engaged!"
send "ps"
gosub :LIMPETCHECK

return
:LIMPETCHECK

settexttrigger LIMPETCHECKY :LIMPETCHECKY "A port official runs"
settexttrigger LIMPETCHECKN :LIMPETCHECKN "StarDock> Where to?"
pause
:LIMPETCHECKY
killalltriggers
send "y"
return
:LIMPETCHECKN
killalltriggers
return

return
:PLANETTRADE




gosub :PLAYER~QUIKSTATS
setvar $PRECREDITS $PLAYER~CREDITS
striptext $PRECREDITS ","

if ($USEEP = TRUE)
  gosub :PLANETTRADE_EP
else
  gosub :PLANETTRADE_CK
end

gosub :PLAYER~QUIKSTATS
striptext $PLAYER~CREDITS ","
setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS

subtract $PLAYER~CREDITSNOW $PRECREDITS
add $STAT_DOLLARSGROSS $PLAYER~CREDITSNOW

if (($PLAYER~ORE_HOLDS < $MINORE) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
  send "pt * * * "
  waitfor "How many holds of Fuel Ore"
end


return
:PLANETTRADE_CK

setvar $PLANET~FUELTOSELL 67000
setvar $PLANET~ORGTOSELL 67000
setvar $PLANET~EQUIPTOSELL 67000
setvar $PLANET~_CK_PTRADESETTING $GAME~PTRADESETTING
setvar $PLANET~PLANET $TRADEPLANET
setvar $PLANET~QUANTITYUNKNOWN 1

if ($PLAYER~ORE_HOLDS < $MINORE)
  isnumber $NUMBER $TRADEPLANET
  if ($NUMBER = 0)
    gosub :RECHECKPLANETS
    setvar $TRADEPLANET $NEWPLANETMADE
  end
  send "l" $TRADEPLANET "* t n t1* * q * "
  waitfor "Planet command ("
  waitfor "Command ["
end

send "|"
gosub :PLANET~SELL
send "|"

setvar $TRADEPLANET $PLANET~PLANET

if ($PLANET~EXIT_MESSAGE <> 0)
end

gosub :PLAYER~QUIKSTATS
striptext $PLAYER~CREDITS ","
setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
if ($PLAYER~CREDITSNOW = $PRECREDITS)
  echo "*################*##############"
  echo "*#### NEG FAILED, SELLING AT COST!"
  echo "*###############################"


  send "q q q * * *  p n" $TRADEPLANET "* * * * * * * ^q"
  waitfor "ENDINTERROG"
  gosub :PLAYER~QUIKSTATS
  striptext $PLAYER~CREDITS ","
  setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
end
return
:PLANETTRADE_EP




if ($PLAYER~ORE_HOLDS < $MINORE)
  send "l" $TRADEPLANET "*"
  send "tnt1*"
  waitfor "free cargo holds."
  send "d"
  waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
  send "q"
end


send "pn" $TRADEPLANET "*"
waitfor "Negotiate Planetary TradeAgreement"
:STARTPLANETTRADE_EP
settextlinetrigger WEAREBUYING :WEAREBUYING "We are buying up to "
settexttrigger WEAREDONE :WEAREDONE "(?=Help)?"
pause
:WEAREBUYING
killalltriggers
send "*"
waitfor "Agreed, "
settextlinetrigger SELLEMPTY2 :SELLEMPTY2 "You have"
setdelaytrigger EPSELLWAIT2 :EPSELLWAIT2 7000
pause
:EPSELLWAIT2
killalltriggers

setvar $SWITCHBOARD~MESSAGE "Ep Haggle timed out on Haggle*"
gosub :SWITCHBOARD~SWITCHBOARD
send "*"
:SELLEMPTY2

killalltriggers
goto :STARTPLANETTRADE_EP
:WEAREDONE

killalltriggers

gosub :PLAYER~QUIKSTATS
striptext $PLAYER~CREDITS ","
setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
if ($PLAYER~CREDITSNOW = $PRECREDITS)
  echo "*################*##############"
  echo "*#### NEG FAILED, SELLING AT COST!"
  echo "*###############################"

  send "p n" $TRADEPLANET "* * * * * * * "
  waitfor "Your offer "
  gosub :PLAYER~QUIKSTATS
  striptext $PLAYER~CREDITS ","
  setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
end


return
:PROCESS_PLANET_LINE



getword $PLANET~PLANETINF $PLANET~PLANET_CHECKED 1
getword $PLANET~PLANETINF $PLANET~PLANET_START_FUEL 2
getword $PLANET~PLANETINF $PLANET~PLANET_START_ORG 3
getword $PLANET~PLANETINF $PLANET~PLANET_START_EQUIP 4
getword $PLANET~PLANETINF $PLANET~PLANET_TRADE_PLANET 5
getlength $PLANET~PLANET_CHECKED $LENGTH1
getlength $PLANET~PLANET_START_FUEL $LENGTH2
getlength $PLANET~PLANET_START_ORG $LENGTH3
getlength $PLANET~PLANET_START_EQUIP $LENGTH4
getlength $PLANET~PLANET_TRADE_PLANET $LENGTH5
setvar $STARTLEN ($LENGTH1 + ($LENGTH2 + ($LENGTH3 + ($LENGTH4 + ($LENGTH5 + 6)))))
cuttext $PLANET~PLANETINF $PLANET~PLANETNAME $STARTLEN 999
return
:REWRITEMOOSETTINGS


delete $MOO_SETTING_FILE
setvar $PCOUNT 1
while ($PCOUNT <= $TOTALGAMEPLANETS)

  write $MOO_SETTING_FILE $PLANET~PLANETLIST[$PCOUNT][1]&" "&$PLANET~PLANETLIST[$PCOUNT][2]&" "&$PLANET~PLANETLIST[$PCOUNT][3]&" "&$PLANET~PLANETLIST[$PCOUNT][4]&" "&$PLANET~PLANETLIST[$PCOUNT][5]&" "&$PLANET~PLANETLIST[$PCOUNT]
  add $PCOUNT 1
end

return
:CHECKPLANETNAMES



setvar $PLANET~PLANETI 1
while ($PLANET~PLANETI <= $PLANET~PLANETSINSECTOR)
  setvar $SEARCHNAME $PLANET~PLANETNAMES[$PLANET~PLANETI]
  setvar $SEARCHI 1
  setvar $FOUND 0

  while ($SEARCHI <= 20)
    if ($NEG_PLANETNAMES[$SEARCHI] = $SEARCHNAME)
      setvar $FOUND 1
    end
    add $SEARCHI 1
  end
  if ($FOUND = 1)
    setvar $NEG_PLANETNAMESTAKEN[$PLANET~PLANETI] 1
  end
  add $PLANET~PLANETI 1
end
return
:REMOVEPLANET


setvar $PII 1
while ($PII <= 20)
  if ($NEG_PLANETNAMES[$PII] = $REMOVEPLANETNAME)
    setvar $NEG_PLANETNAMESTAKEN[$PII] 0
  end
  add $PII 1
end
return
:GETPLANETNAME


setvar $PII 1
while ($PII <= 20)
  if ($NEG_PLANETNAMESTAKEN[$PII] = 0)
    setvar $NEWPLANETNAME $NEG_PLANETNAMES[$PII]
    setvar $NEG_PLANETNAMESTAKEN[$PII] 1
    return
  end
  add $PII 1
end

echo "ISSUE SHOULD NOT GET HERE - all 20 names taken*"
halt
return
:RESETPLANETSUSED

setvar $NEWPLANETNAME ""
setvar $PII 1
while ($PII <= 20)
  setvar $NEG_PLANETNAMESTAKEN[$PII] 0
  add $PII 1
end
return
:SMALLDELAY

echo "STARTING SMALL DELAY*"
setdelaytrigger DELAY :WAIT 2000
pause
:WAIT
killalltriggers
return
:CHECKCORP


setarray $CORP_MEMBERS 10 1
setvar $CORP_COUNT 0
send "ta"
waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
waiton "------------------------------------------------------------------------------"
:TA_AGAIN

settextlinetrigger TALINE :TA_CHECK
pause
:TA_CHECK

getwordpos CURRENTLINE $POS "P indicates Trader is on a planet in that sector"
getwordpos CURRENTLINE $POS2 "Corporate command ["
if (($POS > 0) or ($POS > 0))
  goto :DONE_TA
end
setvar $TEST CURRENTLINE
trim $TEST
if ($TEST = "")
  goto :DONE_TA
end
setvar $LINE CURRENTLINE
cuttext $LINE $NAME 1 30
replacetext $LINE $NAME ""
trim $NAME
add $CORP_COUNT 1
setvar $CORP_MEMBERS[$CORP_COUNT] $NAME
getword $LINE $CORP_MEMBERS[$CORP_COUNT][1] 1
goto :TA_AGAIN
:DONE_TA

send "q"
waiton "Command ["
return
:GETEFURBDETAILS



send "'" $EFURBBOT " qss*"
setvar $CONFIRMEDPLANET 0

settextlinetrigger PHOTONBOTNAME :PHOTONBOTNAME "{"&$EFURBBOT&"}"
setdelaytrigger PHOTONBOTNAMETIMEOUT :PHOTONBOTNAMETIMEOUT 3000
pause
:PHOTONBOTNAMETIMEOUT
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Couldn't find bot we are trading ships with - exiting*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:PHOTONBOTNAME
killalltriggers

settextlinetrigger QSSPLANETLINE :QSSPLANETLINE "Sector   :"
settexttrigger QSSDONE :QSSDONE "Bot Mode :General"
pause
:QSSPLANETLINE
gettext CURRENTLINE $EFURBSECTOR "Sector   :" "Ship ID"
trim $EFURBSECTOR
cuttext CURRENTLINE $EFURBPLANET 62 4
trim $EFURBPLANET

pause
:QSSDONE


return
:VERIFYONETRADER


send "d"
setvar $STARTCOUNT 0
setvar $TRADERCOUNT 0
setvar $TRADELOCKED 0

settextlinetrigger V_NOTRADERS :V_NOTRADERS "There are no other Traders in the Citadel."
settextlinetrigger V_TRADERHEADING :V_TRADERHEADING "Other Traders Here"
settextlinetrigger V_TRADERSDONE1 :V_TRADERSDONE1 "Citadel treasury"
settextlinetrigger V_TRADERSDONE2 :V_TRADERSDONE2 "means you are locked out of that Ship and cannot use i"
settextlinetrigger V_EVERYTHING :V_EVERYTHING ""
pause
:V_TRADERHEADING
setvar $STARTCOUNT 1
pause
:V_TRADERSDONE2


setvar $TRADELOCKED 1
:V_TRADERSDONE1
killalltriggers
return
:V_NOTRADERS
killalltriggers
return
:V_EVERYTHING
if ($STARTCOUNT = 1)
  getlength CURRENTLINE $THELEN
  if ($THELEN > 20)
    add $TRADERCOUNT 1
  end
end
settextlinetrigger V_EVERYTHING :V_EVERYTHING ""
pause

return
return

# includes:
include "source\include\BOT"
include "source\include\SWITCHBOARD"
include "source\include\PLAYER"
include "source\include\PLANET"
include "source\include\SHIP"
