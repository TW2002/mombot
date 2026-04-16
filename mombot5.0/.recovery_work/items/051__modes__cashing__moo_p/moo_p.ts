
gosub :BOT~LOADVARS

loadvar $GAME~PORT_MAX
loadvar $GAME~PTRADESETTING
loadvar $MAP~STARDOCK
loadvar $GAME~MAX_PLANETS_IN_GAME
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $BOT~FOLDER
loadvar $BOT~BOT_TURN_LIMIT
loadvar $MOO_PRIMARY_PRODUCT
loadvar $MOO_PREFERRED_SLOT

setvar $BOT~HELP[1] $BOT~TAB&"       Warps around to ports and sells products from planets"
setvar $BOT~HELP[2] $BOT~TAB&"        "
setvar $BOT~HELP[3] $BOT~TAB&"       "
setvar $BOT~HELP[4] $BOT~TAB&" moo [mode] {maxplanets} {f/o/e} {all/bad/top}"
setvar $BOT~HELP[5] $BOT~TAB&"        {guard} {nofigs} {ephag} {safe/paranoid}"
setvar $BOT~HELP[6] $BOT~TAB&" Options:"
setvar $BOT~HELP[7] $BOT~TAB&"    [mode]       skimpl/upgraded/param/everything/file/sector"
setvar $BOT~HELP[8] $BOT~TAB&"    {maxplanets} Max planets b4 blasting and replacing."
setvar $BOT~HELP[9] $BOT~TAB&"    {f/o/e}      Primary Product, Equipment by default, set"
setvar $BOT~HELP[10] $BOT~TAB&"                 once only then no need to call."
setvar $BOT~HELP[11] $BOT~TAB&"    {bad/all/top}Clean bad/all planets post trading. default none."
setvar $BOT~HELP[12] $BOT~TAB&"                 Top leaves max planets per sector"
setvar $BOT~HELP[13] $BOT~TAB&"    {guard}      Dock corp planet created"
setvar $BOT~HELP[14] $BOT~TAB&"    {ephag}      Default is NEG but set to use EP Haggle"
setvar $BOT~HELP[15] $BOT~TAB&"    {safe}       Ports must be surrounded by figs (ZTM!)"
setvar $BOT~HELP[16] $BOT~TAB&"    {paranoid}   Ports must be surrounded by figs and limpets"
setvar $BOT~HELP[17] $BOT~TAB&"    {efurb:bot}  Bot to exchange ships with at home planet to furb."
setvar $BOT~HELP[18] $BOT~TAB&"    {xfurb:bot:ship} Xport Furb - Furb ship ready above planet."
setvar $BOT~HELP[19] $BOT~TAB&"    {tradeto:n}  Trade to percentage, defaults 15, tradeto:50 = 50%"
setvar $BOT~HELP[20] $BOT~TAB&"    {Secure}    Drop mines and Armids"
setvar $BOT~HELP[21] $BOT~TAB&"   "
setvar $BOT~HELP[22] $BOT~TAB&"    Modes -"
setvar $BOT~HELP[23] $BOT~TAB&"      skimpl/pl  - Sells off product from personal planet list"
setvar $BOT~HELP[24] $BOT~TAB&"                 - Skim versions skips making new planets"
setvar $BOT~HELP[25] $BOT~TAB&"      upgraded   - Visits upgrade ports (10k+) that are ready"
setvar $BOT~HELP[26] $BOT~TAB&"      param      - Sectors with this param i.e. moo MOOPORTS"
setvar $BOT~HELP[27] $BOT~TAB&"      everything - Anything that buys the primary prod with a fig"
setvar $BOT~HELP[28] $BOT~TAB&"      file       - One sector per line, file must end in .txt"
setvar $BOT~HELP[29] $BOT~TAB&"      sector     - One sector >Moo sector {maxplanets} {sector}"
setvar $BOT~HELP[30] $BOT~TAB&"      "

gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Moo - Time to blow some crap up!"
gosub :BOT~BANNER

gosub :PLAYER~QUIKSTATS
setvar $STARTTURNS $PLAYER~TURNS




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


setvar $TRADINGMINPRODUCT 15



setvar $STARTMSG ""

setvar $MINORE 150
if ($PLAYER~TOTAL_HOLDS < $MINORE)
  setvar $MINORE $PLAYER~TOTAL_HOLDS
end



if ($BOT~BOT_TURN_LIMIT < 1)
  setvar $TURN_LIMIT 50
  setvar $STARTMSG $STARTMSG&"Turn Limit not set in bot - setting to 50.*"

else
  setvar $TURN_LIMIT $BOT~BOT_TURN_LIMIT
end


setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Command") and ($STARTINGLOCATION <> "Citadel"))
  setvar $SWITCHBOARD~MESSAGE "Start from the command prompt or a citadel to dump cash.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  if ($STARTINGLOCATION = "Command")
    setvar $STARTMSG $STARTMSG&"Starting from sector level - no planet cash dump or fig top ups!*"
  else
    setvar $STARTMSG $STARTMSG&"Starting on planet - will dump cash and top up figs here.*"
  end
end






setvar $PREFERREDPLANETSLOT $BOT~PARM2
isnumber $NUMBER $PREFERREDPLANETSLOT
if (($NUMBER = 1) and ($PREFERREDPLANETSLOT <> 0))
  if (($PREFERREDPLANETSLOT <= 0) or ($PREFERREDPLANETSLOT > 20))
    setvar $SWITCHBOARD~MESSAGE "Preferred planet should be from 1 to 20*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  else
    setvar $STARTMSG $STARTMSG&"We will create a max of "&$PREFERREDPLANETSLOT&" planets.*"
    setvar $MOO_PREFERRED_SLOT $PREFERREDPLANETSLOT
    savevar $MOO_PREFERRED_SLOT
  end
else
  if ($MOO_PREFERRED_SLOT > 0)
    setvar $PREFERREDPLANETSLOT $MOO_PREFERRED_SLOT
  else
    setvar $SWITCHBOARD~MESSAGE "Max Planets is not defined; please start with a # rom 1-20.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end









setvar $PRIMARYPRODUCT 0
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " f "
if ($POS > 0)
  setvar $PRIMARYPRODUCT 1
  setvar $STARTMSG $STARTMSG&"Primary product will be fuel ore.*"
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " o "
if ($POS > 0)
  setvar $STARTMSG $STARTMSG&"Primary product will be Organics.*"
  setvar $PRIMARYPRODUCT 2
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " e "
if ($POS > 0)
  setvar $PRIMARYPRODUCT 3
  setvar $STARTMSG $STARTMSG&"Primary product will be Equipment.*"
end


if ($PRIMARYPRODUCT = 0)
  if ($MOO_PRIMARY_PRODUCT > 0)
    setvar $PRIMARYPRODUCT $MOO_PRIMARY_PRODUCT
  else
    setvar $PRIMARYPRODUCT 3
    setvar $STARTMSG $STARTMSG&"Primary product not found - defualt to equip.*"
  end

else

  setvar $MOO_PRIMARY_PRODUCT $PRIMARYPRODUCT
  savevar $MOO_PRIMARY_PRODUCT
end


getwordpos $BOT~USER_COMMAND_LINE $POS "secure"
if ($POS > 0)
  setvar $MINES TRUE
  setvar $STARTMSG $STARTMSG&"We are dropping limpets and mines.*"
else
  setvar $MINES FALSE
end


setvar $USERCLEANUP 0
gosub :SWITCHBOARD~SWITCHBOARD
getwordpos $BOT~USER_COMMAND_LINE $POS "all"
if ($POS > 0)
  setvar $USERCLEANUP 2
  setvar $STARTMSG $STARTMSG&"We are blowing ALL planets post trade.*"
else
  getwordpos $BOT~USER_COMMAND_LINE $POS "top"
  if ($POS > 0)
    setvar $USERCLEANUP 3
    setvar $STARTMSG $STARTMSG&"We are blowing up planets above max planets.*"
  else
    getwordpos $BOT~USER_COMMAND_LINE $POS "bad"
    if ($POS > 0)
      setvar $USERCLEANUP 1
      setvar $STARTMSG $STARTMSG&"We are just blowing dud planets.*"
    end
  end
end
setvar $CLEANUP $USERCLEANUP









setvar $MODESTRING $BOT~PARM1
setvar $MODE 0
setvar $SKIMMODE 0
setvar $SEARCHPARAM ""

setvar $SECTORFILE ""

if ($MODESTRING = "skimpl")
  setvar $MODE 1
  setvar $STARTMSG $STARTMSG&"Sourcing sectors from personal planet list, Skim Mode.*"
  setvar $SKIMMODE 1
elseif ($MODESTRING = "pl")
  setvar $MODE 1
  setvar $STARTMSG $STARTMSG&"Sourcing sectors from personal planet list.*"
elseif ($MODESTRING = "upgraded")
  setvar $MODE 2
  setvar $STARTMSG $STARTMSG&"Sourcing sectors from anything upgraded.*"
elseif ($MODESTRING = "everything")
  setvar $MODE 4
  setvar $STARTMSG $STARTMSG&"Sourcing sectors from any good port.*"
elseif ($MODESTRING = "sector")
  setvar $MODE 6
  setvar $STARTMSG $STARTMSG&"Mooing Single Sector.*"
  setvar $MOOSECTOR $BOT~PARM3
  isnumber $NUMBER $MOOSECTOR
  if ($NUMBER = 1)

  else
    setvar $SWITCHBOARD~MESSAGE "Please use >Moo sector {maxplanets} {sector}"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  getwordpos $MODESTRING $POS ".txt"
  if ($POS > 0)
    setvar $MODE 5
    setvar $STARTMSG $STARTMSG&"Sourcing sectors from listed in "&$MODESTRING&".*"
    setvar $SECTORFILE $MODESTRING
  else
    setvar $MODE 3
    setvar $STARTMSG $STARTMSG&"Sourcing sectors with Param: "&$MODESTRING&".*"
    setvar $SEARCHPARAM $MODESTRING
    uppercase $SEARCHPARAM
  end

end
if (($GAME~PTRADESETTING = 0) or ($GAME~MAX_PLANETS_IN_GAME = 0))
  setvar $SWITCHBOARD~MESSAGE "No planet trade/planets in game settings >refresh >update.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

getwordpos $BOT~USER_COMMAND_LINE $POS "guard"
if ($POS > 0)
  setvar $USEGUARD TRUE
  setvar $STARTMSG $STARTMSG&"Creating a corp planet at SD.*"
else
  setvar $USEGUARD FALSE
  setvar $STARTMSG $STARTMSG&"Not Creating Guardian Planets.*"
end


getwordpos $BOT~USER_COMMAND_LINE $POS "nofigs"
if ($POS > 0)
  setvar $FURBFIGS FALSE
  setvar $STARTMSG $STARTMSG&"We are NOT restocking fighters.*"
else
  setvar $FURBFIGS TRUE
  setvar $STARTMSG $STARTMSG&"We are restocking fighters.*"
end





setvar $TRADINGMINPRODUCT 15
getwordpos $BOT~USER_COMMAND_LINE $POS "tradeto:"
if ($POS > 0)

  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $TRADEPERC "tradeto:" " "

  isnumber $ISIT $TRADEPERC
  if ($ISIT = FALSE)
    setvar $SWITCHBOARD~MESSAGE "Trade Percentage should be between 15 and 90.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  else
    if (($TRADEPERC < 15) or ($TRADEPERC > 90))
      setvar $SWITCHBOARD~MESSAGE "Trade Percentage should be between 15 and 90.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    else
      setvar $TRADINGMINPRODUCT $TRADEPERC
      setvar $STARTMSG $STARTMSG&"We are trading ports down to "&$TRADINGMINPRODUCT&"%.*"
    end
  end
end

getwordpos $BOT~USER_COMMAND_LINE $POS "figs:"
if ($POS > 0)
  setvar $DROPFTRS TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $DROPFIGQUANT "figs:" " "

  getwordpos $BOT~USER_COMMAND_LINE $POS "offensive"
  if ($POS > 0)
    setvar $DROPFTRSTYPE "o"
  else
    setvar $DROPFTRSTYPE "d"
  end
else
  setvar $DROPFTRS FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "efurb:"
if ($POS > 0)
  setvar $EFURB TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $EFURBBOT "efurb:" " "

  setvar $STARTMSG $STARTMSG&"We are exchange furbing with bot:"&$EFURBBOT&".*"
  if ($STARTINGLOCATION <> "Citadel")
    setvar $SWITCHBOARD~MESSAGE "Must start eFurb option from a citadel*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  else
  end

else
  setvar $EFURB FALSE
end


setvar $XFURBSHIP 0

getwordpos $BOT~USER_COMMAND_LINE $POS "xfurb:"
if ($POS > 0)
  setvar $XFURB TRUE
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $XFURBINFO "xfurb:" " "

  replacetext $XFURBINFO ":" " "
  getword $XFURBINFO $EFURBBOT 1
  getword $XFURBINFO $XFURBSHIP 2

  setvar $STARTMSG $STARTMSG&"We are exchange furbing with bot: "&$EFURBBOT&" and ship "&$XFURBSHIP&".*"
  isnumber $NUMBER $XFURBSHIP
  if (($NUMBER = FALSE) or ($XFURBSHIP = 0))
    setvar $SWITCHBOARD~MESSAGE "XFurb ship must be a number above 0*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end


  if ($STARTINGLOCATION <> "Citadel")
    setvar $SWITCHBOARD~MESSAGE "Must start xfurb option from a citadel*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  else
  end

else
  setvar $XFURB FALSE
end



getwordpos $BOT~USER_COMMAND_LINE $POS "ephag"
if ($POS > 0)
  setvar $USEEP TRUE
  setvar $STARTMSG $STARTMSG&"Using Ep Haggle*"

  setvar $SWITCHBOARD~MESSAGE "Using Ep Haggle (DISABLED AT THE MO)*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  setvar $USEEP FALSE
  setvar $STARTMSG $STARTMSG&"Using internal NEG for haggle.*"
end

if ($USEEP = 1)
  send "'" $BOT~BOT_NAME " ephaggle planet*"
  setdelaytrigger EPHAGDEL :EPHAGDEL 1500

else
  send "'" $BOT~BOT_NAME " stop ephaggle*"
  setdelaytrigger EPHAGDEL :EPHAGDEL 1500
end
:EPHAGDEL
killalltriggers





getwordpos $BOT~USER_COMMAND_LINE $POS "paranoid"
if ($POS > 0)
  setvar $BOT~PARMANOID TRUE
  setvar $SURROUNDEDSECTORSONLY 1
  setvar $STARTMSG $STARTMSG&"Incoming Sectors require figs and limpets*"
else
  setvar $BOT~PARMANOID FALSE
  getwordpos $BOT~USER_COMMAND_LINE $POS "safe"
  if ($POS > 0)
    setvar $SURROUNDEDSECTORSONLY 1
    setvar $STARTMSG $STARTMSG&"Incoming Sectors require figs.*"
  else
    setvar $SURROUNDEDSECTORSONLY 0
    setvar $STARTMSG $STARTMSG&"Loose Cannon Mode Engaged!!!*"
  end
end

setvar $SWITCHBOARD~MESSAGE $STARTMSG
gosub :SWITCHBOARD~SWITCHBOARD

if ($PLAYER~PLANET_SCANNER <> "Yes")
  setvar $SWITCHBOARD~MESSAGE "Ship needs planet scanners*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $STAT_DOLLARSGROSS 0
setvar $STAT_DOLLARSNET 0
setvar $STAT_DOLLARSSPENT 0
setvar $PLANET~PLANETSPOPPED 0
setvar $PLANET~PLANETSPOPPEDGOOD 0
setvar $UPDATECOUNT 1




setvar $MOO_SETTING_FILE $BOT~FOLDER&"/moo_settings.cfg"


setvar $TOTALGAMEPLANETS 0
setvar $GETPLANETSETTINGSREQ 0



setvar $MOO_FUEL 1
setvar $MOO_ORGANICS 1
setvar $MOO_EQUIPMENT 1
setvar $FUEL_MIN_MOO 750
setvar $ORGANICS_MIN_MOO 500
setvar $EQUIPMENT_MIN_MOO 250




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








setvar $PLANET~PLANETSALLOWEDINGAME $GAME~MAX_PLANETS_IN_GAME
setvar $PLANET~PLANETSALLOWED (($PLANET~PLANETSALLOWEDINGAME * 90) / 100)



setvar $STARTINGFIGHTERS 0
setvar $SAFEFIGHTERS 0

setvar $PLANET~PLANETSINSECTOR 0
setvar $PLANET~PLANETS 0
setvar $PLANET~PLANETI 1


setvar $PERCMINTOSTART 90
setvar $DUMPCASHONPLANET 25000000


setvar $SECTORS 0
setvar $SECTORSOK 0
setvar $SECTORSOKI 1
setvar $SECTORSOKPRODUCT 0
setvar $SECTORSOKPLANETID 0
setvar $PLANET~PLANETSWITHPRODUCTS 0

setvar $SECTORSNOFIG 0
setvar $SECTORSNOFIGI 1


setvar $STARTSECTORS 0
setvar $STARTI 1






setvar $MINTRADE 900

if ($PRIMARYPRODUCT = 1)
  setvar $MINONPLANET $FUEL_MIN_MOO
elseif ($PRIMARYPRODUCT = 2)
  setvar $MINONPLANET $ORGANICS_MIN_MOO
elseif ($PRIMARYPRODUCT = 3)
  setvar $MINONPLANET $EQUIPMENT_MIN_MOO
end
gosub :PLAYER~QUIKSTATS

if ($PLAYER~PHOTONS > 0)
  setvar $SWITCHBOARD~MESSAGE "Yeah Nah, we don't do this with photons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $STARDOCK $MAP~STARDOCK

if ($STARTINGLOCATION = "Citadel")

  if ($PLAYER~CREDITS > 2000000)
    send "tt" $PLAYER~CREDITS "*tf2000000*"
  end

  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c"

  if ($EFURB = TRUE)
    gosub :VERIFYONETRADER
    if ($TRADERCOUNT <> 1)
      setvar $SWITCHBOARD~MESSAGE "Needs to be one other trader in this citadel and it should be the person you are swapping with.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    gosub :VERIFYTRADERPLANET
    send "'" $EFURBBOT " stopall*"
    waitfor " All non-system scripts and modules killed, and modes reset"
    if ($TRADELOCKED = 1)
      send "'" $EFURBBOT " unlock*"
      waitfor "Ship has been unlocked!"
    end
    send "'" $EFURBBOT " moofurb efurb*"
    waitfor "Furber: waiting for ship trade to trigger."
    send "qc"
  end

  if ($XFURB = TRUE)
    gosub :VERIFYTRADERPLANET
    send "'" $EFURBBOT " stopall*"
    waitfor " All non-system scripts and modules killed, and modes reset"

    send "qc"
  end

  setvar $CASHDUMPPLANET $PLANET~PLANET
  setvar $CASHDUMPSECTOR $PLAYER~CURRENT_SECTOR

  waitfor "Planet command"
  send "qmnt**tnt1**q"
  waitfor "lasting off from"

  gosub :PLAYER~QUIKSTATS
  setvar $STARTINGFIGHTERS $PLAYER~FIGHTERS
  setvar $SAFEFIGHTERS ($PLAYER~FIGHTERS / 2)
end




setvar $READI 1


if ($MODE = 1)
  gosub :SECTORSFROMPERSONAL
elseif ($MODE = 2)
  gosub :SECTORSFROMPERSONAL
  gosub :SECTORSFROMUPGRADED
elseif ($MODE = 3)
  gosub :SECTORSFROMPERSONAL
  gosub :SECTORSFROMPARAM
elseif ($MODE = 4)
  gosub :SECTORSFROMPERSONAL
  gosub :SECTORSFROMEVERYTHING
elseif ($MODE = 5)
  gosub :SECTORSFROMPERSONAL
  gosub :SECTORSFROMFILE
elseif ($MODE = 6)
  setvar $SECTORS[$READI] $MOOSECTOR
  add $READI 1

end
gosub :GETPORTREPORTS
gosub :FILTERPORTSANDREPORT

setvar $STAT_TARGETS ($SECTORSOKI - 1)


if (($PLAYER~ALIGNMENT < 1000) and (($SKIMMODE <> TRUE) and (($EFURB <> TRUE) and ($XFURB <> TRUE))))
  setvar $SWITCHBOARD~MESSAGE "MooXmas - You're just not good enough for this script (alignment).*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $WASCLEANUPTOP 0
send "v"
settextlinetrigger GAMEPLANETS :GAMEPLANETS "planets exist in the universe,"
pause
:GAMEPLANETS
killalltriggers
getword CURRENTLINE $VPLANETS 1
striptext $VPLANETS ","
if ($VPLANETS > $PLANET~PLANETSALLOWED)
  if ($CLEANUP = 3)
    setvar $WASCLEANUPTOP 1
  end
  setvar $CLEANUP 2
end


setvar $LOOPI 1
while ($LOOPI < $SECTORSOKI)
  setvar $SECTOR $SECTORSOK[$LOOPI]


  if ($DUMPCASHONPLANET > 0)
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CREDITS > $DUMPCASHONPLANET)

      setvar $PLAYER~WARPTO $CASHDUMPSECTOR
      gosub :PLAYER~TWARP
      gosub :PLAYER~QUIKSTATS
      if ($PLAYER~CURRENT_SECTOR = $CASHDUMPSECTOR)

        send "l"&$CASHDUMPPLANET&"* t n t 1 * C"
        send "TT"
        waitfor "credits, and the Treasury"
        setvar $LINE CURRENTLINE
        getword $LINE $CREDSMADE 3
        striptext $CREDSMADE ","
        subtract $CREDSMADE 1000000
        if ($CREDSMADE >= 1)
          send $CREDSMADE&"*"
          send "QQ"
        else
          send "*QQ"
        end
        waitfor "Blasting off from"
      else
        setvar $SWITCHBOARD~MESSAGE "Failed to make it to cash dump sector - will continue on and try again next lap*"
        gosub :SWITCHBOARD~SWITCHBOARD
      end
    end

    if ($SECTOR <> CURRENTSECTOR)
      setvar $PLAYER~WARPTO $SECTOR
      gosub :PLAYER~TWARP

      if ($PLAYER~TWARPSUCCESS = FALSE)
        setvar $SWITCHBOARD~MESSAGE "Failed to make it to next sector, continuing (could be ore of figs)*"
        gosub :SWITCHBOARD~SWITCHBOARD
        goto :ENDLOOP
      end
    end


  else
    if ($SECTOR <> CURRENTSECTOR)
      setvar $PLAYER~WARPTO $SECTOR
      gosub :PLAYER~TWARP
    end
  end

  if ($MINES = TRUE)
    if ($PLAYER~ARMIDS >= 3)
      send "h 13*c "
      setsectorparameter $SECTOR "MINESEC" 1
    end

    if ($PLAYER~LIMPETS >= 2)
      send "h 22* c "
      setsectorparameter $SECTOR "LIMPSEC" 1
    end
  end

  setvar $NOPLANETSINSECTOR 1
  setvar $SAFETOBLOW 1
  gosub :CHECKSAFETOBLOW
  if ($SAFETOBLOW = 0)
    echo "*#########################################"
    echo "* ### CITADELS DETECTED SKIPPING BOOMS ###"
    echo "*#########################################"
    setvar $SWITCHBOARD~MESSAGE "Warning: Citadel in sector, skipping.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :ENDLOOP
  end


  gosub :CREATEANDSELL
  :THEENDNEXTSECTOR




  gosub :PLAYER~QUIKSTATS

  if ($PLAYER~TURNS < $TURN_LIMIT)
    setvar $SWITCHBOARD~MESSAGE "Hit our turn limited; stopping.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :GOHOMEANDHALT
  end

  gosub :UPDATESTATS
  :ENDLOOP
  add $LOOPI 1
end
:GOHOMEANDHALT


if ($CASHDUMPSECTOR > 0)
  send "* * * "
  setvar $PLAYER~WARPTO $CASHDUMPSECTOR
  gosub :PLAYER~TWARP
end

if ($STARTINGLOCATION = "Citadel")
  send "l"&$CASHDUMPPLANET&"* t n t 1 * C"
  send "TT"
  waitfor "credits, and the Treasury"
  setvar $LINE CURRENTLINE
  getword $LINE $CREDSMADE 3
  striptext $CREDSMADE ","
  subtract $CREDSMADE 500000
  if ($CREDSMADE >= 1)
    send $CREDSMADE&"*"
  else
    send "*"
  end
end
setvar $SWITCHBOARD~MESSAGE "Mooooooooooo Mooooooooooo Done.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:CREATEANDSELL






gosub :RESETPLANETSUSED

setvar $WORKINGPLANETSLOT $PREFERREDPLANETSLOT

setvar $PLANET~PLANETSINSECTOR 0
setvar $PLANET~PLANETS 0
setvar $PLANET~PLANETNAMES 0
setvar $PLANET~PLANETI 1

setvar $CHECKNEWPLANET 0
setvar $INITPLANETS 0

if ($NOPLANETSINSECTOR = 0)
  gosub :RECHECKPLANETS
  setvar $INITPLANETS $PLANET~PLANETSINSECTOR
  gosub :CHECKPLANETNAMES
end

setvar $GO 1

setvar $PLANET~PLANETSINSECTORCHK $PLANET~PLANETSINSECTOR


if ($SECTORSOKPLANETID[$LOOPI] > 0)
  setvar $TRADEPLANET $SECTORSOKPLANETID[$LOOPI]
  goto :SKIPTOTRADE
elseif ($PLANET~PLANETSWITHPRODUCTS[$SECTOR] > 0)
  setvar $TRADEPLANET $PLANET~PLANETSWITHPRODUCTS[$SECTOR]
  goto :SKIPTOTRADE
  setvar $SECTORSOKPLANETID[$SECTOR] 0
end

while ($GO = 1)


  if ($PLANET~PLANETSINSECTORCHK >= $WORKINGPLANETSLOT)

    setvar $CHECKNEWPLANET 0
    gosub :RECHECKPLANETS
    setvar $REMOVEPLANETNAME $PLANET~PLANETNAMES[$WORKINGPLANETSLOT]
    gosub :REMOVEPLANET
    setvar $SHIPBLASTPLANET $PLANET~PLANETS[$WORKINGPLANETSLOT]
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
    add $PLANET~PLANETSPOPPEDGOOD 1

    if ($GETPLANETSETTINGSREQ = 0)

      setvar $NEWPLANETMADE 0

      setvar $TRADEPLANET $NEWPLANETNAME
    end
    :SKIPTOTRADE



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


    if ($PRODPERC <= $TRADINGMINPRODUCT)
      setvar $GO 0
    end


    if (($MODE = 1) and ($SKIMMODE = 1))
      setvar $GO 0
    end
  end








end
if ($TRADEPLANET > $PLANET~PLANETSALLOWED)
  if ($CLEANUP = 3)

    setvar $WASCLEANUPTOP 1
  end
  setvar $CLEANUP 2
else
  setvar $CLEANUP $USERCLEANUP
end


if ($CLEANUP > 0)
  gosub :RECHECKPLANETS
  setvar $PLANET~PLANETSTOBLOW 0
  setvar $FIGSREQUIRED 0
  setvar $I 1
  while ($I <= $PLANET~PLANETSINSECTOR)


    if ($PLANET~PLANETS[$I] <> $TRADEPLANET)
      add $PLANET~PLANETSTOBLOW 1
      add $FIGSREQUIRED (100 * $PLANET~PLANETSTOBLOW)
    elseif (($CLEANUP = 2) or ($CLEANUP = 3))
      add $PLANET~PLANETSTOBLOW 1
      add $FIGSREQUIRED ($FIGSREQUIRED + (100 * $PLANET~PLANETSTOBLOW))
    end
    add $I 1
  end

  add $FIGSREQUIRED ($FIGSREQUIRED + 101)
  if ($FIGSREQUIRED > $PLAYER~FIGHTERS)

    echo "*#########################################"
    echo "* ### Not enough figs For Clean up, theoritically you could go boom! ###"
    echo "*#########################################"
    setvar $SWITCHBOARD~MESSAGE "Warning: Fighters low, can not do cleanup.*"
    gosub :SWITCHBOARD~SWITCHBOARD

    halt
  end
  setvar $I 1


  if ($CLEANUP = 3)

    setvar $I ($GAME~MAX_PLANETS_PER_SECTOR + 1)
  elseif ($WASCLEANUPTOP = 1)
    setvar $I ($INITPLANETS + 1)
  end

  while ($I <= $PLANET~PLANETSINSECTOR)


    if ($PLANET~PLANETS[$I] <> $TRADEPLANET)

      setvar $SHIPBLASTPLANET $PLANET~PLANETS[$I]
      gosub :BLASTPLANET
    elseif (($CLEANUP = 2) or ($CLEANUP = 3))
      setvar $SHIPBLASTPLANET $TRADEPLANET
      gosub :BLASTPLANET
    end


    add $I 1
  end
end


return
:RECHECKPLANETS




if ($CHECKNEWPLANET = 11)

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
  if ((PORT.BUYFUEL[CURRENTSECTOR] = 1) and (PORT.PERCENTFUEL[CURRENTSECTOR] > $TRADINGMINPRODUCT))
    setvar $GOODPLANET 1
  end
end
if (($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][3] > $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
  if ((PORT.BUYORG[CURRENTSECTOR] = 1) and (PORT.PERCENTORG[CURRENTSECTOR] > $TRADINGMINPRODUCT))
    setvar $GOODPLANET 1
  end
end
if (($PLANET~PLANETLIST[$PLANET~PLANETINDEXFOUND][4] > $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
  if ((PORT.BUYEQUIP[CURRENTSECTOR] = 1) and (PORT.PERCENTEQUIP[CURRENTSECTOR] > $TRADINGMINPRODUCT))
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
add $PLANET~PLANETSPOPPED 1

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
:CHECKDOCKTHERE




send "cr" $STARDOCK "*q"
waitfor "Computer activated"
settextlinetrigger CHECKDOCKTHEREYES :CHECKDOCKTHEREYES "Commerce report for"
settextlinetrigger CHECKDOCKTHERENO :CHECKDOCKTHERENO "Computer deactivated"
pause
:CHECKDOCKTHERENO
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Stardock is blown up!! Aborting restock.*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $SWITCHBOARD~MESSAGE "Suggest enemy is waiting at dock; suggest combat mission*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :GOHOMEANDHALT
halt
:CHECKDOCKTHEREYES

killalltriggers


return
:RESTOCK


gosub :PLAYER~QUIKSTATS

if (($PLAYER~ORE_HOLDS < $MINORE) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
  send "pt * * * "
  waitfor "Your offer ["
end


setvar $PRESTOCKCREDITS $PLAYER~CREDITS
striptext $PRECREDITS ","

send "d"
waitfor "Warps to Sector(s) :"

setvar $RETURNSPOT CURRENTSECTOR

add $STAT_REFURBS 1

if ($EFURB = TRUE)
  gosub :RESTOCK_EFURB
elseif ($XFURB = TRUE)
  gosub :RESTOCK_XFURB
else
  gosub :RESTOCK_SELF

end
setvar $POSTSTOCKCREDITS $PLAYER~CREDITS
striptext $POSTSTOCKCREDITS ","
setvar $STAT_DOLLARSSPENT ($PRECREDITS - $POSTSTOCKCREDITS)


return
:RESTOCK_XFURB


setvar $PLAYER~WARPTO $CASHDUMPSECTOR
gosub :PLAYER~TWARP

setvar $PLAYERSHIP $PLAYER~SHIP_NUMBER
send "l"&$CASHDUMPPLANET&"* t n t 1 * m * * * C"
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
gosub :PLAYER~QUIKSTATS
setvar $CSHIP $PLAYER~SHIP_NUMBER

send "q q x j " $XFURBSHIP "* q * l" $CASHDUMPPLANET "* tnt1 * c "
gosub :PLAYER~QUIKSTATS
if ($XFURBSHIP <> $PLAYER~SHIP_NUMBER)
  setvar $SWITCHBOARD~MESSAGE "Failed to switch ships after furb.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  send "'" $EFURBBOT " moofurb xfurb " $CSHIP "*"
end
setvar $XFURBSHIP $CSHIP

gosub :PLAYER~QUIKSTATS

if ($PLAYER~GENESIS < 5)
  setvar $SWITCHBOARD~MESSAGE "XPort Furb Fail - New ship has les than 5 torps*"
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
:RESTOCK_EFURB



setvar $PLAYER~WARPTO $CASHDUMPSECTOR
gosub :PLAYER~TWARP

setvar $PLAYERSHIP $PLAYER~SHIP_NUMBER
send "l"&$CASHDUMPPLANET&"* t n t 1 * m * * * C"
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
:RESTOCK_SELF

if ($PLAYER~FIGHTERS < $SAFEFIGHTERS)

  setvar $PLAYER~WARPTO $CASHDUMPSECTOR
  gosub :PLAYER~TWARP

  send "l"&$CASHDUMPPLANET&"*mnt*tnt1*q"

  waitfor "Blasting off from"
end


gosub :CHECKDOCKTHERE




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


send "m" $STARDOCK "*y"
waitfor "Locating beam pinpointed, TransWarp"
send "y p s"
gosub :LIMPETCHECK
send "h"
send "t"
settexttrigger SHIPCHECKBUYTORPS :SHIPCHECKBUYTORPS "How many Genesis Torpedoes do you want"
pause
:SHIPCHECKBUYTORPS
killalltriggers
getword CURRENTLINE $TORPSSAVAIL 9
striptext $TORPSSAVAIL ")"

send $TORPSSAVAIL "*"

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

if ($MINES = TRUE)
  if ($PLAYER~LIMPETS < 100)
    send "l"
    settexttrigger DOBUYLIMPS :DOBUYLIMPS "How many mines do you want"
    pause
    :DOBUYLIMPS
    getword CURRENTLINE $LIMPS 8
    striptext $LIMPS ")"
    if ($LIMPS > 50)
      setvar $LIMPS 50
    end
    send $LIMPS "*"
  end
  if ($PLAYER~ARMIDS < 100)
    send "m"
    settexttrigger DOBUYARMIDS :DOBUYARMIDS "How many mines do you want"
    pause
    :DOBUYARMIDS
    getword CURRENTLINE $ARMIDS 8
    striptext $ARMIDS ")"
    if ($ARMIDS > 50)
      setvar $ARMIDS 50
    end
    send $ARMIDS "*"
  end
end


gosub :PLAYER~QUIKSTATS
send "qsp"

settexttrigger REFURBFIGPRICET :REFURBFIGPRICET "credits per fighter"
:CHECKSHIELDS
settexttrigger REFURBSHIELDS :REFURBSHIELDS "Shield Points"
pause
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
  send "b" $FIGSTOBUY "*"
end
goto :CHECKSHIELDS
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
gosub :PLAYER~QUIKSTATS
setvar $POSTFURBFIGS $PLAYER~FIGHTERS
setvar $EXITMACRO "qqq    *   "

if ($RESTOCKMAKEPLANET = 1)

  setvar $EXITMACRO $EXITMACRO&"u   y  n  .  n  *  c * *  "
end

setvar $EXITMACRO $EXITMACRO&"m  "&$RETURNSPOT&"*   y   y  "
send $EXITMACRO

settextlinetrigger RESTOCKBACK1 :RESTOCKBACK1 "<Set NavPoint>"
settextlinetrigger RESTOCKBACK2 :RESTOCKBACK2 "Systems Ready, shall we engag"
pause
:RESTOCKBACK1
killalltriggers
send "q * Q * * pss"
setvar $SWITCHBOARD~MESSAGE "Failed to leave dock!! Hopefully on dock..*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:RESTOCKBACK2

killalltriggers

gosub :PLAYER~QUIKSTATS
if ($PLAYER~FIGHTERS < $POSTFURBFIGS)
  setvar $DIFF ($POSTFURBFIGS - $PLAYER~FIGHTERS)
  setvar $SWITCHBOARD~MESSAGE "I took fig damage ("&$DIFF&") exiting dock!! and I probably don't even know it.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  if ($FURBFIGS = FALSE)
    setvar $FURBFIGS TRUE
  end
end


return
:LIMPETCHECK





settexttrigger LIMPETCHECKY :LIMPETCHECKY "A port official runs"
settexttrigger LIMPETCHECKN :LIMPETCHECKN "StarDock> Where to?"
settexttrigger DOCKGONE1 :DOCKGONE1 "Scanners indicate massive debris and heavy"
settexttrigger DOCKGONE2 :DOCKGONE2 "aptain! Are you sure you want to port her"

pause
:DOCKGONE1
:DOCKGONE2
send " n * * *  n 1 y y "
echo "*############################################"
echo "*############################################"
echo "*#### DOCK HE GONE... GONE GONE GONE halting.."
echo "*############################################"
echo "*############################################"
halt
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
  waitfor "credits and"
end


return
:PLANETTRADE_CK_TEST

setvar $PLANET~FUELTOSELL 67000
setvar $PLANET~ORGTOSELL 67000
setvar $PLANET~EQUIPTOSELL 67000
setvar $PLANET~_CK_PTRADESETTING $GAME~PTRADESETTING
setvar $PLANET~PLANET "..x."
setvar $PLANET~QUANTITYUNKNOWN 1

if ($PLAYER~ORE_HOLDS < $MINORE)
  send "l" $TRADEPLANET "* t n t1* * q * "
  waitfor "Planet command ("
  waitfor "Command ["
end

gosub :PLANET~SELL

if ($PLANET~EXIT_MESSAGE <> 0)
  send "'" $PLANET~EXIT_MESSAGE "*"
end
gosub :PLAYER~QUIKSTATS

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
:PLANETTRADE_CK_OLD



send "l" $TRADEPLANET "*"

settextlinetrigger TRADEPLANETLAND1 :TRADEPLANETLAND1 "That planet is not in this sector."
settextlinetrigger TRADEPLANETLAND2 :TRADEPLANETLAND2 "ding sequence engaged"
pause
:TRADEPLANETLAND1
killalltriggers
echo "*### PLANET FOUND! WE COUNTED WRONG SOMEWHERE"
halt
:TRADEPLANETLAND2


killalltriggers
waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
if ($PLAYER~ORE_HOLDS < $MINORE)
  send "tnt1*"
  waitfor "free cargo holds."
  send "d"
  waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
end


settextlinetrigger TRADEPLANETLAND3 :TRADEPLANETLAND3 "Fuel Ore"
settextlinetrigger TRADEPLANETLAND4 :TRADEPLANETLAND4 "Organics"
settextlinetrigger TRADEPLANETLAND5 :TRADEPLANETLAND5 "Equipment"
settexttrigger TRADEPLANETLAND6 :TRADEPLANETLAND6 "Planet command ("
pause
:TRADEPLANETLAND3
killtrigger :TRADEPLANETLAND3
getword CURRENTLINE $AVAILORE 6
striptext $AVAILORE ","
if ($AVAILORE = 0)
  setvar $TRADEORE "-1"
end

pause
:TRADEPLANETLAND4
killtrigger :TRADEPLANETLAND4
getword CURRENTLINE $AVAILORG 5
striptext $AVAILORG ","
if ($AVAILORG = 0)
  setvar $TRADEORG "-1"
end
pause
:TRADEPLANETLAND5
killtrigger :TRADEPLANETLAND5
getword CURRENTLINE $AVAILEQUIP 5
striptext $AVAILEQUIP ","
if ($AVAILEQUIP = 0)
  setvar $TRADEEQUIP "-1"
end
pause
:TRADEPLANETLAND6
killalltriggers
if ($TRADEORE = 0)
  setvar $TRADEORE $AVAILORE
end
if ($TRADEORG = 0)
  setvar $TRADEORG $AVAILORG
end
if ($TRADEEQUIP = 0)
  setvar $TRADEEQUIP $AVAILEQUIP
end

setvar $PLANET~_CK_PNEGO_FUELTOSELL $TRADEORE
setvar $PLANET~_CK_PNEGO_ORGTOSELL $TRADEORG
setvar $PLANET~_CK_PNEGO_EQUIPTOSELL $TRADEEQUIP

gosub :PLAYER~QUIKSTATS

gosub :PLANET~PLANETNEG


gosub :PLAYER~QUIKSTATS
striptext $PLAYER~CREDITS ","
setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
if ($PLAYER~CREDITSNOW = $PRECREDITS)
  echo "*################*##############"
  echo "*#### NEG FAILED, SELLING AT COST!"
  echo "*###############################"


  send "q p n" $TRADEPLANET "* * * * * * * l" $TRADEPLANET "*"
  waitfor "Land on which planet"
  gosub :PLAYER~QUIKSTATS
  striptext $PLAYER~CREDITS ","
  setvar $PLAYER~CREDITSNOW $PLAYER~CREDITS
end

send "q"

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
:UPDATESTATS



setvar $STAT_DOLLARSNET ($STAT_DOLLARSGROSS - $STAT_DOLLARSSPENT)
setvar $STAT_TURNSUSED ($STARTTURNS - $PLAYER~TURNS)

add $UPDATECOUNT 1
if ($UPDATECOUNT > 20)
  setvar $UPDATECOUNT 1
  format $STAT_DOLLARSNET $STAT_DOLLARSNET_FORMATTED "NUMBER"
  format $STAT_TURNSUSED $STAT_TURNSUSED_FORMATTED "NUMBER"
  send "'Moo Update - Planets: " $PLANET~PLANETSPOPPEDGOOD "/" $PLANET~PLANETSPOPPED " Cash: " $STAT_DOLLARSNET_FORMATTED " in " $STAT_TURNSUSED_FORMATTED " Turns*"
end
return
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
setvar $NOPLANETSINSECTOR 0
setvar $SAFETOBLOW 0
return
:CHECKSAFETOBLOWCIT7
gosub :CALLSAVEME
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
:BLASTPLANET
:BLASTBLASTBLAST




send "l " $SHIPBLASTPLANET "* z d y * "
:BLOWPLANET

settextlinetrigger BLOWPLANET1 :BLOWPLANET1 "You do not have any Atomic Detonators!"
settextlinetrigger BLOWPLANET2 :BLOWPLANET2 "For blowing up this planet you receive"
settextlinetrigger BLOWPLANET3 :BLOWPLANET3 "Invalid registry number, landing aborted."
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
:CALLSAVEME

send "'"&CURRENTSECTOR&"=saveme*q q q q * '"&$SWITCHBOARD~BOT_NAME&" call*"
halt
:SECTORSFROMFILE






if ($SECTORFILE <> "")
  fileexists $EXISTS $SECTORFILE

  if ($EXISTS)
    setvar $READI 1
    read $SECTORFILE $SECTOR $READI

    while ($SECTOR <> "EOF")

      setvar $SECTORS[$READI] $SECTOR
      add $READI 1
      read $SECTORFILE $SECTOR $READI
    end
  end
else
  echo "*##### CAN NOT FIND SECTOR FILE: " $SECTORFILE
  halt
end

return
:GETPORTBUYQUANTS




if ($PRIMARYPRODUCT = 1)
  setvar $PRODBUYING PORT.BUYFUEL[$CHKPORT]
  setvar $PRODPERC PORT.PERCENTFUEL[$CHKPORT]
  setvar $PRODAMOUNT PORT.FUEL[$CHKPORT]
elseif ($PRIMARYPRODUCT = 2)
  setvar $PRODBUYING PORT.BUYORG[$CHKPORT]
  setvar $PRODPERC PORT.PERCENTORG[$CHKPORT]
  setvar $PRODAMOUNT PORT.ORG[$CHKPORT]
elseif ($PRIMARYPRODUCT = 3)
  setvar $PRODBUYING PORT.BUYEQUIP[$CHKPORT]
  setvar $PRODPERC PORT.PERCENTEQUIP[$CHKPORT]
  setvar $PRODAMOUNT PORT.EQUIP[$CHKPORT]

end
return
:SECTORSFROMEVERYTHING


setprecision 0

setvar $I 11
setvar $READI 1
while ($I <= SECTORS)
  getsectorparameter $I "FIGSEC" $HASFIG

  if ((PORT.EXISTS[$I] = 1) and ($HASFIG = 1))
    setvar $CHKPORT $I
    gosub :GETPORTBUYQUANTS
    if ($PRODBUYING = 1)

      setvar $SECTORS[$READI] $I
      add $READI 1
    end
  end

  add $I 1
end

return
:SECTORSFROMUPGRADED

setprecision 0
setvar $I 11
setvar $READI 1
while ($I <= SECTORS)

  if (PORT.EXISTS[$I] = 1)
    setvar $CHKPORT $I
    gosub :GETPORTBUYQUANTS

    if ($PRODBUYING = 1)


      if ($PRODPERC = 0)
        setvar $TOTALPROD 0
      elseif ($PRODPERC < 100)
        setprecision 2
        setvar $TOTALPROD ($PRODAMOUNT / ($PRODPERC / 100))
        setprecision 0
      else
        setvar $TOTALPROD $PRODAMOUNT
      end

      if ($TOTALPROD > 10000)
        setvar $SECTORS[$READI] $I
        add $READI 1
      end
    end
  end
  add $I 1

end
return
:SECTORSFROMPARAM



setvar $I 11
setvar $READI 1
while ($I <= SECTORS)
  getsectorparameter $I $SEARCHPARAM $HASPARAM

  if ((PORT.EXISTS[$I] = 1) and ($HASPARAM = 1))
    setvar $CHKPORT $I
    gosub :GETPORTBUYQUANTS

    if ($PRODBUYING = 1)

      setvar $SECTORS[$READI] $I
      add $READI 1
    end
  end

  add $I 1
end
return
:SECTORSFROMPERSONAL






setvar $TARGETP 0
setvar $READI 1
setvar $LASTSECTOR 0

setvar $TEMPSECTORS 0
setvar $TEMPPLANETS 0
setvar $TEMPPROD 0
setvar $TEMPI 1
send "cyq"
waitfor "<Computer activated>"
waitfor "Sector  Planet Name"
:PREAD

settextlinetrigger PREAD1 :PREAD1 "#"
settextlinetrigger PREAD2 :PREAD2 "---"
settextlinetrigger PREADDONE :PREADDONE "======   ============  ==== ==== ==== ===== ===== "
settextlinetrigger PREADDONE2 :PREADDONE "No Planets claimed"

pause
:PREAD1
killalltriggers
getword CURRENTLINE $SECTOR 1
getword CURRENTLINE $LASTP 2
striptext $LASTP "#"


goto :PREAD
:PREAD2
killalltriggers
if ($PRIMARYPRODUCT = 1)
  getword CURRENTLINE $PROD 6
elseif ($PRIMARYPRODUCT = 2)
  getword CURRENTLINE $PROD 7
elseif ($PRIMARYPRODUCT = 3)
  getword CURRENTLINE $PROD 8
end
getwordpos $PROD $POS "T"
if ($POS > 0)
  striptext $PROD "T"
  multiply $PROD 1000
end
getwordpos $PROD $POS "M"
if ($POS > 0)
  striptext $PROD "M"
  multiply $PROD 1000000
end


if ($PROD >= $MINONPLANET)


  if ($LASTSECTOR <> $SECTOR)


    if ($TEMPSECTORS[1] > 1)


      setvar $LOOPI 1
      setvar $TE 0
      setvar $TP 0
      setvar $TS 0
      while ($LOOPI < $TEMPI)

        if ($LOOPI = 1)

          setvar $TE $TEMPPROD[$LOOPI]
          setvar $TP $TEMPPLANETS[$LOOPI]
          setvar $TS $TEMPSECTORS[$LOOPI]
        else
          if ($TEMPPROD[$LOOPI] > $TE)
            setvar $TE $TEMPPROD[$LOOPI]
            setvar $TP $TEMPPLANETS[$LOOPI]
            setvar $TS $TEMPSECTORS[$LOOPI]
          end
        end
        add $LOOPI 1
      end
      if ($MODE = 1)
        setvar $SECTORS[$READI] $TS
        setvar $STARTPLANETS[$READI] $TP
        setvar $STARTPROD[$READI] $TE
      end
      setvar $PLANET~PLANETSWITHPRODUCTS[$TS] $TP
      add $READI 1

      setvar $TEMPSECTORS 0
      setvar $TEMPPLANETS 0
      setvar $TEMPPROD 0
      setvar $TEMPI 1
    end
  end



  setvar $TEMPSECTORS[$TEMPI] $SECTOR
  setvar $TEMPPLANETS[$TEMPI] $LASTP
  setvar $TEMPPROD[$TEMPI] $PROD
  add $TEMPI 1
  setvar $LASTSECTOR $SECTOR
end



goto :PREAD
:PREADDONE
killalltriggers




return
:GETPORTREPORTS




setvar $LOOPI 1
send "c"
waitfor "<Computer activated>"
while ($LOOPI < $READI)
  send "r" $SECTORS[$LOOPI] "*"
  add $LOOPI 1
end
send "Q"
waitfor "<Computer deactivated>"
return
:FILTERPORTSANDREPORT

setvar $LOOPI 1
setvar $NOLIMPETS 0
setvar $NOFIGS 0

if ($LOOPI < $READI)
  setvar $PORTOK 0
  setvar $FTROK 0

  setvar $SECTOR $SECTORS[$LOOPI]

  if ($PRIMARYPRODUCT = 1)
    if (PORT.BUYFUEL[$SECTOR] = 1)
      if (PORT.FUEL[$SECTOR] > $MINTRADE)
        if (PORT.PERCENTFUEL[$SECTOR] > $PERCMINTOSTART)
          setvar $PORTOK 1
        end
      end
    end
  elseif ($PRIMARYPRODUCT = 2)
    if (PORT.BUYORG[$SECTOR] = 1)
      if (PORT.ORG[$SECTOR] > $MINTRADE)
        if (PORT.PERCENTORG[$SECTOR] > $PERCMINTOSTART)
          setvar $PORTOK 1
        end
      end
    end
  elseif ($PRIMARYPRODUCT = 3)
    if (PORT.BUYEQUIP[$SECTOR] = 1)
      if (PORT.EQUIP[$SECTOR] > $MINTRADE)
        if (PORT.PERCENTEQUIP[$SECTOR] > $PERCMINTOSTART)
          setvar $PORTOK 1
        end
      end
    end
  end

  getsectorparameter $SECTOR "FIGSEC" $HASFIG
  if ($HASFIG = 1)
    setvar $FTROK 1
  end

  if (($FTROK = 1) and ($PORTOK = 1))
    if ($SURROUNDEDSECTORSONLY = 1)

      setvar $I 1
      setvar $DANGER 0
      setvar $LDANGER 0
      while ($I <= SECTOR.WARPINCOUNT[$SECTOR])
        getsectorparameter SECTOR.WARPSIN[$SECTOR][$I] "FIGSEC" $HASFIG
        if ($HASFIG = 0)
          setvar $DANGER 1
        end
        add $I 1
      end
      if ($BOT~PARMANOID = TRUE)
        setvar $I 1

        while ($I <= SECTOR.WARPINCOUNT[$SECTOR])
          getsectorparameter SECTOR.WARPSIN[$SECTOR][$I] "LIMPSEC" $HASFIG
          if ($HASFIG = 0)
            setvar $LDANGER 1
          end
          add $I 1
        end
      end


      if (($DANGER = 0) and ($LDANGER = 0))
        setvar $SECTORSOK[$SECTORSOKI] $SECTOR
        if ($STARTPROD[$LOOPI] > 0)
          setvar $SECTORSOKPRODUCT[$SECTORSOKI] $STARTPROD[$LOOPI]
          setvar $SECTORSOKPLANETID[$SECTORSOKI] $STARTPLANETS[$LOOPI]
        else
          setvar $SECTORSOKPRODUCT[$SECTORSOKI] 0
          setvar $SECTORSOKPLANETID[$SECTORSOKI] 0
        end
        add $SECTORSOKI 1
      else
        if ($DANGER = 1)
          echo "*## Slipping Sector - Incoming Warps aren't figged" $SECTOR

          add $NOFIGS 1
        end
        if ($LDANGER = 1)
          echo "*## Slipping Sector - Incoming Warps missing limpets" $SECTOR
          add $NOLIMPETS 1
        end
      end

    else

      setvar $SECTORSOK[$SECTORSOKI] $SECTOR
      if ($STARTPROD[$LOOPI] > 0)
        setvar $SECTORSOKPRODUCT[$SECTORSOKI] $STARTPROD[$LOOPI]
        setvar $SECTORSOKPLANETID[$SECTORSOKI] $STARTPLANETS[$LOOPI]
      else
        setvar $SECTORSOKPRODUCT[$SECTORSOKI] 0
        setvar $SECTORSOKPLANETID[$SECTORSOKI] 0
      end
      add $SECTORSOKI 1
    end
  end

  if ($FTROK = 0)
    setvar $SECTORSNOFIG[$SECTORSNOFIGI] $SECTOR
    add $SECTORSNOFIGI 1
  end

  add $LOOPI 1

end
setvar $SECTORNOFIGSREPORT ""

if ($SECTORSNOFIGI > 1)
  echo "**############# PORTS MISSING FIGHTERS8**"
  setvar $I 1
  while ($I < $SECTORSNOFIGI)
    echo "*# " $SECTORSNOFIG[$I]
    setvar $SECTORNOFIGSREPORT $SECTORNOFIGSREPORT&$SECTORSNOFIG[$I]&" "
    add $I 1
  end
end

setvar $LOOPI 1

echo "###" SECTORS "GOOD" "TO" "GO" " ###**"
while ($LOOPI < $SECTORSOKI)
  echo "*" $SECTORSOK[$LOOPI]

  add $LOOPI 1
end


setvar $STARTMSG "We are visiting "&($SECTORSOKI - 1)&" sectors with target ports."
if ($SECTORSNOFIGI > 1)
  setvar $STARTMSG $STARTMSG&"*There are "&$SECTORSNOFIGI&" ports with no fighters."
  setvar $STARTMSG $STARTMSG&"*"&$SECTORNOFIGSREPORT
end
if ($NOFIGS > 1)
  setvar $STARTMSG $STARTMSG&"*There are "&$NOFIGS&" ports missing incoming fighters."
end
if ($NOLIMPETS > 1)
  setvar $STARTMSG $STARTMSG&"*There are "&$NOLIMPETS&" ports missing incoming Limpets."
end
setvar $STARTMSG $STARTMSG&"*Dumping cash on planet: "&$CASHDUMPPLANET
setvar $STARTMSG $STARTMSG&"*Stopping at turns: "&$TURN_LIMIT

if ($MODE < 6)
  setvar $STARTMSG $STARTMSG&"*Send a Eng age!!! without the space to engage.*"
else
  setvar $STARTMSG $STARTMSG&"*"
end

setvar $SWITCHBOARD~MESSAGE $STARTMSG
gosub :SWITCHBOARD~SWITCHBOARD
waitfor "Sub-space radio"
waitfor "Command ["
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
:VERIFYTRADERPLANET


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
cuttext CURRENTLINE $PLANETID 62 4
trim $PLANETID
echo "#" $PLANETID "#" $PLANET~PLANET "#*"
if ($PLANETID = $PLANET~PLANET)
  setvar $CONFIRMEDPLANET 1
end
pause
:QSSDONE

if ($CONFIRMEDPLANET = 1)

else
  setvar $SWITCHBOARD~MESSAGE "Bot we are trading ships with isn't on our planet.*"
  gosub :SWITCHBOARD~SWITCHBOARD

  halt
end


return

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
include "include/PLANET_2/PLANET.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/PLANET_3/PLANET.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/PLAYER_4/PLAYER.ts"
include "include/PLANET_2/PLANET.ts"
