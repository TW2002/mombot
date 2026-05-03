#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~ADDFIGTODATA
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($PLAYER~TARGET > 0) and ($PLAYER~TARGET <= SECTORS))
  setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~BWARP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "b"
settexttrigger NOBWARP :NOBWARP "Would you like to place a subspace order for one? "
settexttrigger YESBWARP :YESBWARP "Beam to what sector? (U="
settexttrigger IGBWARP :BWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
pause

:PLAYER~NOBWARP
gosub :KILLBWARPTRIGGERS
send "*"
setvar $SWITCHBOARD~MESSAGE "No Bwarp installed on this planet*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~YESBWARP
gosub :KILLBWARPTRIGGERS
send $PLAYER~WARPTO&"*"
settexttrigger BWARP_LOCK :BWARP_NO_RANGE "This planetary transporter does not have the range."
settexttrigger NO_BWRP_LOCK :NO_BWARP_LOCK "Do you want to make this transport blind?"
settexttrigger BWARP_READY :BWARP_LOCK "All Systems Ready, shall we engage?"
settextlinetrigger NO_BWARPFUEL :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
pause

:PLAYER~BWARP_NO_RANGE
gosub :KILLBWARPTRIGGERS
setvar $SWITCHBOARD~MESSAGE "Not enough range on this planet's transporter.*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~NO_BWARP_LOCK
gosub :KILLBWARPTRIGGERS
send "* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $SWITCHBOARD~MESSAGE "No fighter down at that destination, aborting*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~BWARP_LOCK
gosub :KILLBWARPTRIGGERS
send "y     * "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
setvar $SWITCHBOARD~MESSAGE "B-warp completed.*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~BWARPNOFUEL
gosub :KILLBWARPTRIGGERS
setvar $SWITCHBOARD~MESSAGE "Not enough fuel on the planet to make the transport!*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~BWARPPHOTONED
gosub :KILLBWARPTRIGGERS
setvar $SWITCHBOARD~MESSAGE "I have been photoned and can not B-warp!*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLAYER~KILLBWARPTRIGGERS
killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CHECKSTARTINGPROMPT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $BOT~VALIDPROMPTS
if ($PLAYER~CURRENT_PROMPT = 0)
  gosub :PLAYER~CURRENTPROMPT
end
getwordpos " "&$BOT~VALIDPROMPTS&" " $POS $PLAYER~CURRENT_PROMPT
if ($POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$BOT~VALIDPROMPTS&"]*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CHECKCORP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

setarray $PLAYER~CORP_MEMBERS 10 1
setvar $PLAYER~CORP_COUNT 0
gosub :QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "xa"
else
  send "ta"
end
waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
waiton "------------------------------------------------------------------------------"

:PLAYER~TA_AGAIN
settextlinetrigger TALINE :TA_CHECK
pause

:PLAYER~TA_CHECK
getwordpos CURRENTLINE $PLAYER~POS "P indicates Trader is on a planet in that sector"
getwordpos CURRENTLINE $PLAYER~POS2 "Corporate command ["
if (($PLAYER~POS > 0) or ($PLAYER~POS2 > 0))
  goto :DONE_TA
end
setvar $PLAYER~LINE CURRENTLINE
trim $PLAYER~LINE
if ($PLAYER~LINE <> "")
  cuttext $PLAYER~LINE $PLAYER~NAME 1 30
  replacetext $PLAYER~LINE $PLAYER~NAME ""
  trim $PLAYER~NAME
  add $PLAYER~CORP_COUNT 1
  setvar $PLAYER~CORP_MEMBERS[$PLAYER~CORP_COUNT] $PLAYER~NAME
  getword $PLAYER~LINE $PLAYER~CORP_MEMBERS[$PLAYER~CORP_COUNT][1] 1
  replacetext $PLAYER~CORP_MEMBERS[$PLAYER~CORP_COUNT][1] "P" ""
end
goto :TA_AGAIN

:PLAYER~DONE_TA
send "q"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CHECKFORTRAVELNAME
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

if ($parm1 = "me")
  if ($command_caller = "self")
    setvar $SWITCHBOARD~MESSAGE "I don't think you need to travel to yourself.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $PLAYER~WHO_CALLED_ME $command_caller
  gosub :CHECKCORP
  setvar $PLAYER~I 1
  while ($PLAYER~I <= $PLAYER~CORP_COUNT)
    lowercase $PLAYER~CORP_MEMBERS[$PLAYER~I]
    lowercase $PLAYER~WHO_CALLED_ME
    getwordpos $PLAYER~CORP_MEMBERS[$PLAYER~I] $PLAYER~POS $PLAYER~WHO_CALLED_ME
    if ($PLAYER~POS > 0)
      setvar $parm1 $PLAYER~CORP_MEMBERS[$PLAYER~I][1]
      goto :GO_AFTER_ME
    end
    add $PLAYER~I 1
  end
end
isnumber $PLAYER~TEST $parm1
if ($PLAYER~TEST <> TRUE)
  getwordpos $user_command_line $PLAYER~POS "sector:"
  if ($PLAYER~POS > 0)
    setvar $PLAYER~CLINE $user_command_line&" "
    gettext $PLAYER~CLINE $parm1 "sector:" " "
    goto :GO_AFTER_ME
  end
  getwordpos $user_command_line $PLAYER~POS #34
  if ($PLAYER~POS > 0)
    gettext $user_command_line $PLAYER~TRADER #34 #34
    if ($PLAYER~TRADER = FALSE)
      setvar $PLAYER~TRADER $parm1
    end
  else
    setvar $PLAYER~TRADER $parm1
  end

  gosub :CHECKCORP
  setvar $PLAYER~I 1
  while ($PLAYER~I <= $PLAYER~CORP_COUNT)
    lowercase $PLAYER~CORP_MEMBERS[$PLAYER~I]
    lowercase $PLAYER~TRADER
    getwordpos $PLAYER~CORP_MEMBERS[$PLAYER~I] $PLAYER~POS $PLAYER~TRADER
    if ($PLAYER~POS > 0)
      setvar $parm1 $PLAYER~CORP_MEMBERS[$PLAYER~I][1]
      goto :GO_AFTER_ME
    end
    add $PLAYER~I 1
  end
end
:PLAYER~GO_AFTER_ME
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CLEARADJACENT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

getsector $PLAYER~CURRENT_SECTOR $PLAYER~SECTORINFO
if ($PLAYER~SECTORINFO.WARP[1] = 0)
  setvar $SWITCHBOARD~MESSAGE "This sector has no warps, try to scan it first!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
else
  setvar $PLAYER~VOIDSECT 0
  :PLAYER~CLEARVOIDS
  add $PLAYER~VOIDSECT 1
  if ($PLAYER~VOIDSECT < 7)
    if ($PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT] <> 0)
      send "CV0*YN"&$PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT]&"*Q"
    end
    goto :CLEARVOIDS
  end

  send "/"
  waiton " Sect "
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~COMMASIZE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
format $PLAYER~VALUE $PLAYER~VALUE "NUMBER"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CURRENTPROMPT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 5000
send #145
pause
:PLAYER~CURRENT_PROMPT_DELAY
settextouttrigger ATKEYS :CURRENT_PROMPT_AT_KEYS
setdelaytrigger PROMPT_DELAY :VERIFYDELAY 30000
pause
:PLAYER~CURRENT_PROMPT_AT_KEYS
getouttext $PLAYER~OUT
send $PLAYER~OUT
killtrigger PROMPT_DELAY
return
:PLAYER~ALLPROMPTSCATCH
killtrigger PROMPT_DELAY
gosub :PLAYER~PARSE_CURRENT_PROMPT_LINE
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~PARSE_CURRENT_PROMPT_LINE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~ANSILINE CURRENTANSILINE
setvar $PLAYER~SELF_DESTRUCT_PROMPT FALSE
getwordpos $PLAYER~ANSILINE $PLAYER~POS "ARE YOU SURE CAPTAIN? (Y/N) [N]"
if ($PLAYER~POS > 0)
  setvar $PLAYER~SELF_DESTRUCT_PROMPT TRUE
end
setvar $PLAYER~FULL_CURRENT_PROMPT CURRENTLINE
striptext $PLAYER~FULL_CURRENT_PROMPT #145
striptext $PLAYER~FULL_CURRENT_PROMPT #8
getword $PLAYER~FULL_CURRENT_PROMPT $PLAYER~CURRENT_PROMPT 1
if ($PLAYER~CURRENT_PROMPT = 0)
  setvar $PLAYER~FULL_CURRENT_PROMPT CURRENTANSILINE
  striptext $PLAYER~FULL_CURRENT_PROMPT #145
  striptext $PLAYER~FULL_CURRENT_PROMPT #8
  getword $PLAYER~FULL_CURRENT_PROMPT $PLAYER~CURRENT_PROMPT 1
end
striptext $PLAYER~CURRENT_PROMPT #145
striptext $PLAYER~CURRENT_PROMPT #8
return
:PLAYER~VERIFYDELAY

killalltriggers
disconnect

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~FINDJUMPSECTOR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~RED_ADJ 0
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "qt*t1*q* "
else
  send "qq* "
end

setvar $PLAYER~K 1
while (SECTOR.BACKDOORS[$PLAYER~TARGET][$PLAYER~K] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.BACKDOORS[$PLAYER~TARGET][$PLAYER~K]
  gosub :TEST_RED_SECTOR
  if ($PLAYER~FOUNDSECTOR = TRUE)
    goto :SECTORLOCKED
  end
  add $PLAYER~K 1
end

setvar $PLAYER~I 1
while (SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I]
  gosub :TEST_RED_SECTOR
  if ($PLAYER~FOUNDSECTOR = TRUE)
    goto :SECTORLOCKED
  end
  add $PLAYER~I 1
end
:PLAYER~NOADJSFOUND

setvar $PLAYER~RED_ADJ 0
return
:PLAYER~SECTORLOCKED

if ($PLAYER~TARGET = $MAP~STARDOCK)
  setvar $MAP~BACKDOOR $PLAYER~RED_ADJ
  savevar $MAP~BACKDOOR
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~TEST_RED_SECTOR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

setvar $PLAYER~FOUNDSECTOR FALSE
send "m "&$PLAYER~RED_ADJ&"* y"
settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
pause
:PLAYER~TWARPADJ
gosub :KILLFINDJUMPSECTORS
send " * "
return

:PLAYER~TWARPVOIDED
gosub :KILLFINDJUMPSECTORS
send " N N "
return
:PLAYER~TWARPLOCKED

gosub :KILLFINDJUMPSECTORS
send " * "
setvar $PLAYER~FOUNDSECTOR TRUE
return
:PLAYER~TWARPBLIND

gosub :KILLFINDJUMPSECTORS
send " N "
return
:PLAYER~KILLFINDJUMPSECTORS

killtrigger TWARPBLIND
killtrigger TWARPLOCKED
killtrigger TWARPVOIDED
killtrigger TWARPADJ
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~FORMATNUMBERFORSPACES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($PLAYER~INPUTVARIABLE < 10)
  setvar $PLAYER~OUTPUTVARIABLE "    "&$PLAYER~INPUTVARIABLE
elseif ($PLAYER~INPUTVARIABLE < 100)
  setvar $PLAYER~OUTPUTVARIABLE "   "&$PLAYER~INPUTVARIABLE
elseif ($PLAYER~INPUTVARIABLE < 1000)
  setvar $PLAYER~OUTPUTVARIABLE "  "&$PLAYER~INPUTVARIABLE
elseif ($PLAYER~INPUTVARIABLE < 10000)
  setvar $PLAYER~OUTPUTVARIABLE " "&$PLAYER~INPUTVARIABLE
else
  setvar $PLAYER~OUTPUTVARIABLE $PLAYER~INPUTVARIABLE
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~FORMATPERCENTAGESFORSPACES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($PLAYER~INPUTVARIABLE < 10)
  setvar $PLAYER~OUTPUTVARIABLE "  ("&$PLAYER~INPUTVARIABLE&"%)"
elseif ($PLAYER~INPUTVARIABLE < 100)
  setvar $PLAYER~OUTPUTVARIABLE " ("&$PLAYER~INPUTVARIABLE&"%)"
elseif ($PLAYER~INPUTVARIABLE < 1000)
  setvar $PLAYER~OUTPUTVARIABLE "("&$PLAYER~INPUTVARIABLE&"%)"
else
  setvar $PLAYER~OUTPUTVARIABLE $PLAYER~INPUTVARIABLE
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~GETINFO
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~NOFLIP TRUE
setvar $PLAYER~PHOTONS 0
setvar $PLAYER~TOWED ""
setvar $PLAYER~SCAN_TYPE "None"
setvar $PLAYER~TWARP_TYPE 0
setvar $PLAYER~CORPSTRING "[0]"
setvar $PLAYER~IGSTAT 0

:PLAYER~WAITONINFO
send "?"
waiton "<!>"
settextlinetrigger GETINFO_CN9_CHECK_1 :GETINFO_CN9_CHECK "<N> Interdictor Control"
settextlinetrigger GETINFO_CN9_CHECK_2 :GETINFO_CN9_CHECK "<N> Move to NavPoint"
settextlinetrigger GETTRADERNAME :GETTRADERNAME "Trader Name    :"
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETCORP :GETCORP "Corp           #"
settextlinetrigger GETSHIPTYPE :GETSHIPTYPE "Ship Info      :"
settextlinetrigger GETTPW :GETTPW "Turns to Warp  :"
settextlinetrigger GETSECT :GETSECT "Current Sector :"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETTOW :GETTOW "Tractor Beam   : ON, towing "
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETFIGHTERS :GETFIGHTERS "Fighters       :"
settextlinetrigger GETSHIELDS :GETSHIELDS "Shield points  :"
settextlinetrigger GETPHOTONS :GETPHOTONS "Photon Missiles:"
settextlinetrigger GETSCANTYPE :GETSCANTYPE "LongRange Scan :"
settextlinetrigger GETTWARPTYPE1 :GETTWARPTYPE1 "  (Type 1 Jump):"
settextlinetrigger GETTWARPTYPE2 :GETTWARPTYPE2 "  (Type 2 Jump):"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settextlinetrigger CHECKIG :CHECKIG "Interdictor ON :"
send "i"
pause

:PLAYER~GETINFO_CN9_CHECK
setvar $PLAYER~NOFLIP TRUE
pause

:PLAYER~GETTRADERNAME
killtrigger GETINFO_CN9_CHECK_1
killtrigger GETINFO_CN9_CHECK_2
setvar $PLAYER~TRADER_NAME CURRENTLINE
striptext $PLAYER~TRADER_NAME "Trader Name    : "
setvar $PLAYER~I 1
while ($PLAYER~I <= $PLAYER~RANKSLENGTH)
  setvar $PLAYER~TEMP $PLAYER~RANKS[$PLAYER~I]
  striptext $PLAYER~TEMP "31m"
  striptext $PLAYER~TEMP "36m"
  striptext $PLAYER~TRADER_NAME $PLAYER~TEMP&" "
  add $PLAYER~I 1
end
pause

:PLAYER~GETTOW
setvar $PLAYER~LINE CURRENTLINE&"<<|END|>>"
gettext $PLAYER~LINE $PLAYER~TOWED "Tractor Beam   : ON, towing " "<<|END|>>"
pause

:PLAYER~GETEXPANDALIGN
getword CURRENTLINE $PLAYER~EXPERIENCE 5
getword CURRENTLINE $PLAYER~ALIGNMENT 7
striptext $PLAYER~EXPERIENCE ","
striptext $PLAYER~ALIGNMENT ","
striptext $PLAYER~ALIGNMENT "Alignment="
pause

:PLAYER~GETCORP
getword CURRENTLINE $PLAYER~CORP 3
striptext $PLAYER~CORP ","
setvar $PLAYER~CORPSTRING "["&$PLAYER~CORP&"]"
pause

:PLAYER~GETSHIPTYPE
getwordpos CURRENTLINE $PLAYER~SHIPTYPEEND "Ported="
subtract $PLAYER~SHIPTYPEEND 18
cuttext CURRENTLINE $PLAYER~SHIP_TYPE_LONG 18 $PLAYER~SHIPTYPEEND
pause

:PLAYER~GETTPW
getword CURRENTLINE $PLAYER~TURNS_PER_WARP 5
pause

:PLAYER~GETSECT
getword CURRENTLINE $PLAYER~CURRENT_SECTOR 4
pause

:PLAYER~GETTURNS
getword CURRENTLINE $PLAYER~TURNS 4
if ($PLAYER~TURNS = "Unlimited")
  setvar $PLAYER~TURNS 65000
  setvar $PLAYER~UNLIMITEDGAME TRUE
end
savevar $PLAYER~UNLIMITEDGAME
pause

:PLAYER~GETHOLDS
setvar $PLAYER~TEMP CURRENTLINE&" "
gettext $PLAYER~TEMP $PLAYER~ORE_HOLDS "Ore=" " "
if ($PLAYER~ORE_HOLDS = "")
  setvar $PLAYER~ORE_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~ORGANIC_HOLDS "Organics=" " "
if ($PLAYER~ORGANIC_HOLDS = "")
  setvar $PLAYER~ORGANIC_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~EQUIPMENT_HOLDS "Equipment=" " "
if ($PLAYER~EQUIPMENT_HOLDS = "")
  setvar $PLAYER~EQUIPMENT_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~COLONIST_HOLDS "Colonists=" " "
if ($PLAYER~COLONIST_HOLDS = "")
  setvar $PLAYER~COLONIST_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~EMPTY_HOLDS "Empty=" " "
if ($PLAYER~EMPTY_HOLDS = "")
  setvar $PLAYER~EMPTY_HOLDS 0
end
pause

:PLAYER~GETFIGHTERS
getword CURRENTLINE $PLAYER~FIGHTERS 3
striptext $PLAYER~FIGHTERS ","
pause

:PLAYER~GETSHIELDS
getword CURRENTLINE $PLAYER~SHIELDS 4
striptext $PLAYER~SHIELDS ","
pause

:PLAYER~GETPHOTONS
getword CURRENTLINE $PLAYER~PHOTONS 3
pause

:PLAYER~GETSCANTYPE
getword CURRENTLINE $PLAYER~SCAN_TYPE 4
pause


:PLAYER~GETTWARPTYPE1
getword CURRENTLINE $PLAYER~TWARP_1_RANGE 4
setvar $PLAYER~TWARP_TYPE 1
pause

:PLAYER~GETTWARPTYPE2
getword CURRENTLINE $PLAYER~TWARP_2_RANGE 4
setvar $PLAYER~TWARP_TYPE 2
pause

:PLAYER~CHECKIG
getword CURRENTLINE $PLAYER~IGSTAT 4
pause

:PLAYER~GETCREDITS
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
if ($PLAYER~IGSTAT = 0)
  setvar $PLAYER~IGSTAT "NO IG"
end

:PLAYER~GETINFODONE
killtrigger GETEXPANDALIGN
killtrigger GETCORP
killtrigger GETSHIPTYPE
killtrigger GETTPW
killtrigger GETTOW
killtrigger GETSECT
killtrigger GETTURNS
killtrigger GETHOLDS
killtrigger GETFIGHTERS
killtrigger GETSHIELDS
killtrigger GETPHOTONS
killtrigger GETSCANTYPE
killtrigger GETTWARPTYPE1
killtrigger GETTWARPTYPE2
killtrigger GETCREDITS
killtrigger CHECKIG
killtrigger GETINFODONE
killtrigger GETINFODONE2
killtrigger GETINFO_CN9_CHECK_1
killtrigger GETINFO_CN9_CHECK_2

savevar $PLAYER~UNLIMITEDGAME

if ($PLAYER~SAVE)

  savevar $PLAYER~CREDITS
  savevar $PLAYER~FIGHTERS
  savevar $PLAYER~SHIELDS
  savevar $PLAYER~TOTAL_HOLDS
  savevar $PLAYER~ORE_HOLDS
  savevar $PLAYER~ORGANIC_HOLDS
  savevar $PLAYER~EQUIPMENT_HOLDS
  savevar $PLAYER~COLONIST_HOLDS
  savevar $PLAYER~PHOTONS
  savevar $PLAYER~ARMIDS
  savevar $PLAYER~LIMPETS
  savevar $PLAYER~GENESIS
  savevar $PLAYER~TWARP_TYPE
  savevar $PLAYER~CLOAKS
  savevar $PLAYER~BEACONS
  savevar $PLAYER~ATOMIC
  savevar $PLAYER~CORBO
  savevar $PLAYER~EPROBES
  savevar $PLAYER~MINE_DISRUPTORS
  savevar $PLAYER~PSYCHIC_PROBE
  savevar $PLAYER~PLANET_SCANNER
  savevar $PLAYER~SCAN_TYPE
  savevar $PLAYER~ALIGNMENT
  savevar $PLAYER~EXPERIENCE
  savevar $PLAYER~SHIP_NUMBER
  savevar $PLAYER~TRADER_NAME
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~QUIKSTATS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~CURRENT_PROMPT "Undefined"
setvar $PLAYER~QUIKSTATS_RETRY 0
if ($PLAYER~TOWED = 0)
  setvar $PLAYER~TOWED ""
end
loadvar $PLAYER~UNLIMITEDGAME
:PLAYER~TRYPROMPTAGAIN
killtrigger TOOLONGPROMPT
killtrigger NOPROMPT
killtrigger PROMPT
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
setdelaytrigger TOOLONGPROMPT :TRYPROMPTAGAIN 10000
send #145&"/"
pause
:PLAYER~ALLPROMPTS
gosub :PLAYER~PARSE_CURRENT_PROMPT_LINE
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:PLAYER~STATSTART
killtrigger PROMPT
setvar $PLAYER~STATS ""
setvar $PLAYER~WORDY ""
:PLAYER~STATSLINE
killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $PLAYER~LINE2 CURRENTLINE
replacetext $PLAYER~LINE2 #179 " "
striptext $PLAYER~LINE2 ","
setvar $PLAYER~STATS $PLAYER~STATS&$PLAYER~LINE2
getwordpos $PLAYER~LINE2 $PLAYER~POS "Ship"
if ($PLAYER~POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:PLAYER~GOTSTATS
killtrigger TOOLONGPROMPT
killtrigger GETLINE2
setvar $PLAYER~STATS $PLAYER~STATS&" @@@"
getwordpos $PLAYER~STATS $PLAYER~POS "Sect "
if ($PLAYER~POS = 0)
  add $PLAYER~QUIKSTATS_RETRY 1
  if ($PLAYER~QUIKSTATS_RETRY <= 3)
    goto :PLAYER~TRYPROMPTAGAIN
  end
end
getwordpos $PLAYER~STATS $PLAYER~POS "Figs "
if ($PLAYER~POS = 0)
  add $PLAYER~QUIKSTATS_RETRY 1
  if ($PLAYER~QUIKSTATS_RETRY <= 3)
    goto :PLAYER~TRYPROMPTAGAIN
  end
end
setvar $PLAYER~CURRENT_WORD 1
getword $PLAYER~STATS $PLAYER~WORDY $PLAYER~CURRENT_WORD
:PLAYER~PARSESTATS
if ($PLAYER~WORDY <> "@@@")
  if ($PLAYER~WORDY = "Sect")
    getword $PLAYER~STATS $PLAYER~CURRENT_SECTOR ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Turns")
    getword $PLAYER~STATS $PLAYER~TURNS ($PLAYER~CURRENT_WORD + 1)
    if ($PLAYER~UNLIMITEDGAME = TRUE)
      setvar $PLAYER~TURNS 65000
    end
  elseif ($PLAYER~WORDY = "Creds")
    getword $PLAYER~STATS $PLAYER~CREDITS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Figs")
    getword $PLAYER~STATS $PLAYER~FIGHTERS ($PLAYER~CURRENT_WORD + 1)
    savevar $PLAYER~FIGHTERS
  elseif ($PLAYER~WORDY = "Shlds")
    getword $PLAYER~STATS $PLAYER~SHIELDS ($PLAYER~CURRENT_WORD + 1)
    savevar $PLAYER~SHIELDS
  elseif ($PLAYER~WORDY = "Hlds")
    getword $PLAYER~STATS $PLAYER~TOTAL_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Ore")
    getword $PLAYER~STATS $PLAYER~ORE_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Org")
    getword $PLAYER~STATS $PLAYER~ORGANIC_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Equ")
    getword $PLAYER~STATS $PLAYER~EQUIPMENT_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Col")
    getword $PLAYER~STATS $PLAYER~COLONIST_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Phot")
    getword $PLAYER~STATS $PLAYER~PHOTONS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Armd")
    getword $PLAYER~STATS $PLAYER~ARMIDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Lmpt")
    getword $PLAYER~STATS $PLAYER~LIMPETS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "GTorp")
    getword $PLAYER~STATS $PLAYER~GENESIS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "TWarp")
    getword $PLAYER~STATS $PLAYER~TWARP_TYPE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Clks")
    getword $PLAYER~STATS $PLAYER~CLOAKS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Beacns")
    getword $PLAYER~STATS $PLAYER~BEACONS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "AtmDt")
    getword $PLAYER~STATS $PLAYER~ATOMIC ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Corbo")
    getword $PLAYER~STATS $PLAYER~CORBO ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "EPrb")
    getword $PLAYER~STATS $PLAYER~EPROBES ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "MDis")
    getword $PLAYER~STATS $PLAYER~MINE_DISRUPTORS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "PsPrb")
    getword $PLAYER~STATS $PLAYER~PSYCHIC_PROBE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "PlScn")
    getword $PLAYER~STATS $PLAYER~PLANET_SCANNER ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "LRS")
    getword $PLAYER~STATS $PLAYER~SCAN_TYPE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Aln")
    getword $PLAYER~STATS $PLAYER~ALIGNMENT ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Exp")
    getword $PLAYER~STATS $PLAYER~EXPERIENCE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Corp")
    getword $PLAYER~STATS $PLAYER~CORP ($PLAYER~CURRENT_WORD + 1)
    setvar $PLAYER~CORPNUMBER $PLAYER~CORP
    savevar $PLAYER~CORPNUMBER
  elseif ($PLAYER~WORDY = "Ship")
    getword $PLAYER~STATS $PLAYER~SHIP_NUMBER ($PLAYER~CURRENT_WORD + 1)
    getword $PLAYER~STATS $PLAYER~SHIP_TYPE ($PLAYER~CURRENT_WORD + 2)
  end
  add $PLAYER~CURRENT_WORD 1
  getword $PLAYER~STATS $PLAYER~WORDY $PLAYER~CURRENT_WORD
  goto :PLAYER~PARSESTATS
end
if ($PLAYER~CURRENT_PROMPT = "Undefined")
  settextlinetrigger PROMPTAFTERSTATS :PLAYER~PROMPTAFTERSTATS #145&#8
  setdelaytrigger NOPROMPT :PLAYER~NOPROMPT 1000
  pause
end
goto :PLAYER~DONEQUIKSTATS
:PLAYER~PROMPTAFTERSTATS
killtrigger NOPROMPT
gosub :PLAYER~PARSE_CURRENT_PROMPT_LINE
goto :PLAYER~DONEQUIKSTATS
:PLAYER~NOPROMPT
killtrigger PROMPTAFTERSTATS
goto :PLAYER~DONEQUIKSTATS
:PLAYER~DONEQUIKSTATS
killtrigger STATLINETRIG
killtrigger GETLINE2
killtrigger PROMPT
savevar $PLAYER~UNLIMITEDGAME
if ($PLAYER~SAVE)
  savevar $PLAYER~CORP
  savevar $PLAYER~CREDITS
  savevar $PLAYER~CURRENT_SECTOR
  savevar $PLAYER~TURNS
  savevar $PLAYER~FIGHTERS
  savevar $PLAYER~SHIELDS
  savevar $PLAYER~TOTAL_HOLDS
  savevar $PLAYER~ORE_HOLDS
  savevar $PLAYER~ORGANIC_HOLDS
  savevar $PLAYER~EQUIPMENT_HOLDS
  savevar $PLAYER~COLONIST_HOLDS
  savevar $PLAYER~PHOTONS
  savevar $PLAYER~ARMIDS
  savevar $PLAYER~LIMPETS
  savevar $PLAYER~GENESIS
  savevar $PLAYER~TWARP_TYPE
  savevar $PLAYER~CLOAKS
  savevar $PLAYER~BEACONS
  savevar $PLAYER~ATOMIC
  savevar $PLAYER~CORBO
  savevar $PLAYER~EPROBES
  savevar $PLAYER~MINE_DISRUPTORS
  savevar $PLAYER~PSYCHIC_PROBE
  savevar $PLAYER~PLANET_SCANNER
  savevar $PLAYER~SCAN_TYPE
  savevar $PLAYER~ALIGNMENT
  savevar $PLAYER~EXPERIENCE
  savevar $PLAYER~SHIP_NUMBER
  savevar $PLAYER~TRADER_NAME
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~REMOVEFIGFROMDATA
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
getsectorparameter $PLAYER~TARGET "FIGSEC" $PLAYER~CHECK
if ($PLAYER~CHECK = TRUE)
  getsectorparameter 2 "FIG_COUNT" $PLAYER~FIGCOUNT
  setsectorparameter 2 "FIG_COUNT" ($PLAYER~FIGCOUNT - 1)
end
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~DISCOD
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~TAGLINE "["&$command&"]"
setvar $PLAYER~TAGLINEB "["&$command&"]"
killalltriggers
echo "**"&ANSI_14&$PLAYER~TAGLINEB&ANSI_15&" Disconnected **"
:PLAYER~DISCO_TEST
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$PLAYER~TAGLINEB&ANSI_15&" Auto Resume Initiated - Awaiting Connection!**"
  pause
  :PLAYER~EMANCIPATE_CPU
  goto :DISCO_TEST
end
waitfor "(?="
setdelaytrigger WAITINGABIT :WAITINGABIT 3000
echo "**"&ANSI_14&$PLAYER~TAGLINEB&ANSI_15&" Connected - Waiting For Command Prompt!**"
pause
:PLAYER~WAITINGABIT
killalltriggers
gosub :QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Command")
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$PLAYER~TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  # goto :inac
  halt
elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$PLAYER~TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  send "qqqq**"
  # goto :inac
  halt
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$PLAYER~TAGLINEB&"Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :PLAYER~EMQ_DELAY
  killalltriggers
  goto :DISCO_TEST
end
:PLAYER~SETCONNECTIONTRIGGERS

killtrigger DISCOD1
killtrigger DISCOD2
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~STARTCNSETTINGS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "CN"
settextlinetrigger ANSI1 :CNCHECK "(1) ANSI graphics            - Off"
settextlinetrigger ANIM1 :CNCHECK "(2) Animation display        - On"
settextlinetrigger PAGE1 :CNCHECK "(3) Page on messages         - On"
settextlinetrigger SETSSCHN :SETSSCHN "(4) Sub-space radio channel"
settextlinetrigger SILENCE1 :CNCHECK "(7) Silence ALL messages     - Yes"
settextlinetrigger ABORTDISPLAY1 :CNCHECK "(9) Abort display on keys    - ALL KEYS"
settextlinetrigger MESSAGEDISPLAY1 :CNCHECK "(A) Message Display Mode     - Long"
settextlinetrigger SCREENPAUSES1 :CNCHECK "(B) Screen Pauses            - Yes"
settextlinetrigger ONLINEAUTOFLEE0 :CNCDONE "(C) Online Auto Flee         - Off"
settextlinetrigger ONLINEAUTOFLEE1 :CNCALMOSTDONE "(C) Online Auto Flee         - On"
pause
:PLAYER~CNCHECK
gosub :GETCNC
pause
:PLAYER~SETSSCHN
getword CURRENTLINE $subspace 6
if ($subspace = 0)
  getrnd $subspace 101 60000
  send 4&$subspace&"*"
end
savevar $subspace
pause
:PLAYER~CNCALMOSTDONE
gosub :GETCNC
:PLAYER~CNCDONE
send "QQ"
killtrigger 1
killtrigger 2
settexttrigger 1 :SUBSTARTCNCONTINUE "Command [TL="
settexttrigger 2 :SUBSTARTCNCONTINUE "Citadel command (?=help)"
pause
:PLAYER~SUBSTARTCNCONTINUE
killtrigger 1
killtrigger 2
return

:PLAYER~GETCNC
getword CURRENTLINE $PLAYER~CNC 1
striptext $PLAYER~CNC "("
striptext $PLAYER~CNC ")"
send $PLAYER~CNC&"  "
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~SWATHOFF
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $PLAYER~SWATHOFF

if ($PLAYER~SWATHOFF = FALSE)
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  
  :PLAYER~SWATHISON
  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $PLAYER~SWATHOFFMESSAGE "Detected SWATH Autohaggle"
  setvar $PLAYER~SWATHOFF FALSE
  savevar $PLAYER~SWATHOFF
  return
  
  :PLAYER~SWATHISOFF
  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $PLAYER~SWATHOFF TRUE
  savevar $PLAYER~SWATHOFF
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~TOPOFF
:PLAYER~DO_TOPOFF_AGAIN
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger TOPOFF_SUCCESS
killtrigger TOPOFF_FAILURE1
killtrigger TOPOFF_FAILURE2
send " F"
waiton "Your ship can support up to"
getword CURRENTLINE $PLAYER~FTRS_TO_LEAVE 10
striptext $PLAYER~FTRS_TO_LEAVE ","
striptext $PLAYER~FTRS_TO_LEAVE " "
if ($PLAYER~FTRS_TO_LEAVE < 1)
  setvar $PLAYER~FTRS_TO_LEAVE 1
end
send " "&$PLAYER~FTRS_TO_LEAVE&" * c d"
settextlinetrigger TOPOFF_SUCCESS :TOPOFF_SUCCESS "Done. You have "
settextlinetrigger TOPOFF_FAILURE1 :DO_TOPOFF_AGAIN "You don't have that many fighters available."
settextlinetrigger TOPOFF_FAILURE2 :DO_TOPOFF_AGAIN "Too many fighters in your fleet!  You are limited to"
pause
:PLAYER~TOPOFF_SUCCESS
killtrigger TOPOFF_FAILURE1
killtrigger TOPOFF_FAILURE2
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~TURNOFFANSI
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $PLAYER~ANSISTATUS 5
waiton "(2) Animation display"
getword CURRENTLINE $PLAYER~ANIMATIONSTATUS 5
if ($PLAYER~ANIMATIONSTATUS = "On")
  send 2
end
if ($PLAYER~ANSISTATUS = "On")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~TURNONANSI
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $PLAYER~ANSISTATUS 5
if ($PLAYER~ANSISTATUS = "Off")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~TWARP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLAYER~TWARPSUCCESS FALSE
setvar $PLAYER~ORIGINAL 9999999
setvar $PLAYER~TARGET 0
if ($PLAYER~CURRENT_SECTOR = $PLAYER~WARPTO)
  setvar $PLAYER~MSG "Already in that sector!"
  goto :TWARPDONE
elseif (($PLAYER~WARPTO <= 0) or ($PLAYER~WARPTO > SECTORS))
  setvar $PLAYER~MSG "Destination sector is out of range!"
  goto :TWARPDONE
end
if ($PLAYER~TWARP_TYPE = "No")
  setvar $PLAYER~MSG "No T-warp drive on this ship!"
  goto :TWARPDONE
end
if (($PLAYER~PHOTONS > 0) and ($PLAYER~OVERRIDE <> TRUE))
  setvar $SWITCHBOARD~MESSAGE "You can't twarp with photons without override!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $PLAYER~MSG "You can't twarp with photons without override!"
  goto :TWARPDONE
end
loadvar $SHIP~SHIP_MAX_ATTACK
if ($SHIP~SHIP_MAX_ATTACK = 0)
  setvar $SHIP~SHIP_MAX_ATTACK 9999
end
if (($PLAYER~FIGHTERS > 0) and ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK))
  setvar $SHIP~SHIP_MAX_ATTACK $PLAYER~FIGHTERS
end

setvar $PLAYER~WEAREADJDOCK FALSE
if (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  setvar $PLAYER~A 1
  setvar $PLAYER~START_SECTOR $PLAYER~CURRENT_SECTOR
  while ($PLAYER~A <= SECTOR.WARPCOUNT[$PLAYER~START_SECTOR])
    setvar $PLAYER~ADJ_START SECTOR.WARPS[$PLAYER~START_SECTOR][$PLAYER~A]
    if ($PLAYER~ADJ_START = $PLAYER~TARGET)
      setvar $PLAYER~WEAREADJDOCK TRUE
    end
    add $PLAYER~A 1
  end
end
setvar $PLAYER~RED_ADJ 0
if (($PLAYER~ALIGNMENT < 1000) and ((($PLAYER~WEAREADJDOCK = FALSE) and (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10)))))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  gosub :FINDJUMPSECTOR
  if ($PLAYER~RED_ADJ <> 0)
    setvar $PLAYER~ORIGINAL $PLAYER~WARPTO
    setvar $PLAYER~WARPTO $PLAYER~RED_ADJ
  else
    waitfor "Command [TL="
    setvar $PLAYER~MSG "Cannot Find Jump Sector Adjacent Sector "&$PLAYER~TARGET&"."
    goto :TWARPDONE
  end
end
if ($PLAYER~RED_ADJ <> 0)
  send "* mz" $PLAYER~WARPTO "*"
else
  if ($PLAYER~STARTINGLOCATION = "Citadel")
    send "q t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
  elseif ($PLAYER~STARTINGLOCATION = "Planet")
    send "t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
  else
    if ($PLAYER~FASTTWARP)
      send "mz" $PLAYER~WARPTO "*"
    else
      send "q q q n n 0 * c u y q mz" $PLAYER~WARPTO "*"
    end
  end
end

settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$PLAYER~WARPTO&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause

:PLAYER~ADJ_WARP
gosub :KILLTWARPTRIGGERS
send "z*"
goto :TWARP_ADJ

:PLAYER~LOCKING
gosub :KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause

:PLAYER~TWARPNOFUEL
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "Not enough fuel for T-warp."
goto :TWARPDONE

:PLAYER~TWARP_ADJ
gosub :KILLTWARPTRIGGERS
send "za  "&$SHIP~SHIP_MAX_ATTACK&"* * r * "
setvar $PLAYER~MSG "That sector is next door, just plain warping."
setvar $PLAYER~TWARPSUCCESS TRUE
goto :TWARPDONE

:PLAYER~TWARPNOROUTE
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~MSG "No route available to that sector!"
goto :TWARPDONE

:PLAYER~NO_TWARP_LOCK
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $PLAYER~MSG "No fighters at T-warp point!"
goto :TWARPDONE

:PLAYER~TWARPIGD
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "My ship is being held by Interdictor!"
goto :TWARPDONE

:PLAYER~TWARPPHOTONED
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "I have been photoned and can not T-warp!"
goto :TWARPDONE

:PLAYER~TWARP_LOCK
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
send "y   *     "
setvar $PLAYER~MSG "T-warp completed."
setvar $PLAYER~TWARPSUCCESS TRUE

:PLAYER~TWARPDONE
if (($PLAYER~TWARPSUCCESS = TRUE) and (($PLAYER~ORIGINAL = $MAP~STARDOCK) or ($PLAYER~ORIGINAL <= 10)))
  send "* m "&$PLAYER~ORIGINAL&"*  za"&$SHIP~SHIP_MAX_ATTACK&"* * "
end
if ($PLAYER~TWARPSUCCESS = TRUE)
  setvar $PLAYER~CURRENT_SECTOR $PLAYER~WARPTO
end
return

:PLAYER~KILLTWARPTRIGGERS
killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~VOIDADJACENT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
getsector $PLAYER~CURRENT_SECTOR $PLAYER~SECTORINFO
if ($PLAYER~SECTORINFO.WARP[1] = 0)
  send "'This sector has no warps, maybe you need to scan it first*"
  halt
else
  setvar $PLAYER~VOIDSECT 0
  :PLAYER~VOIDS
  add $PLAYER~VOIDSECT 1
  if ($PLAYER~VOIDSECT < 7)
    if ($PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT] <> 0)
      send "CV"&$PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT]&"*Q"
    end
    goto :VOIDS
  end

  send "/"
  waiton " Sect "
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~CLEARVOIDADJACENT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
getsector $PLAYER~CURRENT_SECTOR $PLAYER~SECTORINFO
if ($PLAYER~SECTORINFO.WARP[1] = 0)
  send "'This sector has no warps, maybe you need to scan it first*"
  halt
else
  setvar $PLAYER~VOIDSECT 0
  :PLAYER~CLEARVOIDS
  add $PLAYER~VOIDSECT 1
  if ($PLAYER~VOIDSECT < 7)
    if ($PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT] <> 0)
      send "CV0*YN"&$PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT]&"*Q"
    end
    goto :CLEARVOIDS
  end

  send "/"
  waiton " Sect "
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~INIT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setarray $PLAYER~TRADERS 200
setarray $PLAYER~FAKETRADERS 200
setarray $PLAYER~EMPTYSHIPS 100

:PLAYER~INITRANKS
setvar $PLAYER~RANKSLENGTH 46
setarray $PLAYER~RANKS $PLAYER~RANKSLENGTH
setvar $PLAYER~RANKS[1] "36mCivilian"
setvar $PLAYER~RANKS[2] "36mPrivate 1st Class"
setvar $PLAYER~RANKS[3] "36mPrivate"
setvar $PLAYER~RANKS[4] "36mLance Corporal"
setvar $PLAYER~RANKS[5] "36mCorporal"
setvar $PLAYER~RANKS[6] "36mStaff Sergeant"
setvar $PLAYER~RANKS[7] "36mGunnery Sergeant"
setvar $PLAYER~RANKS[8] "36m1st Sergeant"
setvar $PLAYER~RANKS[9] "36mSergeant Major"
setvar $PLAYER~RANKS[10] "36mSergeant"
setvar $PLAYER~RANKS[11] "31mAnnoyance"
setvar $PLAYER~RANKS[12] "31mNuisance 3rd Class"
setvar $PLAYER~RANKS[13] "31mNuisance 2nd Class"
setvar $PLAYER~RANKS[14] "31mNuisance 1st Class"
setvar $PLAYER~RANKS[15] "31mMenace 3rd Class"
setvar $PLAYER~RANKS[16] "31mMenace 2nd Class"
setvar $PLAYER~RANKS[17] "31mMenace 1st Class"
setvar $PLAYER~RANKS[18] "31mSmuggler 3rd Class"
setvar $PLAYER~RANKS[19] "31mSmuggler 2nd Class"
setvar $PLAYER~RANKS[20] "31mSmuggler 1st Class"
setvar $PLAYER~RANKS[21] "31mSmuggler Savant"
setvar $PLAYER~RANKS[22] "31mRobber"
setvar $PLAYER~RANKS[23] "31mTerrorist"
setvar $PLAYER~RANKS[24] "31mInfamous Pirate"
setvar $PLAYER~RANKS[25] "31mNotorious Pirate"
setvar $PLAYER~RANKS[26] "31mDread Pirate"
setvar $PLAYER~RANKS[27] "31mPirate"
setvar $PLAYER~RANKS[28] "31mGalactic Scourge"
setvar $PLAYER~RANKS[29] "31mEnemy of the State"
setvar $PLAYER~RANKS[30] "31mEnemy of the People"
setvar $PLAYER~RANKS[31] "31mEnemy of Humankind"
setvar $PLAYER~RANKS[32] "31mHeinous Overlord"
setvar $PLAYER~RANKS[33] "31mPrime Evil"
setvar $PLAYER~RANKS[34] "36mChief Warrant Officer"
setvar $PLAYER~RANKS[35] "36mWarrant Officer"
setvar $PLAYER~RANKS[36] "36mEnsign"
setvar $PLAYER~RANKS[37] "36mLieutenant J.G."
setvar $PLAYER~RANKS[38] "36mLieutenant Commander"
setvar $PLAYER~RANKS[39] "36mLieutenant"
setvar $PLAYER~RANKS[40] "36mCommander"
setvar $PLAYER~RANKS[41] "36mCaptain"
setvar $PLAYER~RANKS[42] "36mCommodore"
setvar $PLAYER~RANKS[43] "36mRear Admiral"
setvar $PLAYER~RANKS[44] "36mVice Admiral"
setvar $PLAYER~RANKS[45] "36mFleet Admiral"
setvar $PLAYER~RANKS[46] "36mAdmiral"
setvar $PLAYER~LASTTARGET ""
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLAYER~GETCOURSE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($PLAYER~DESTINATION <= 0) or ($PLAYER~DESTINATION = ""))
  setvar $PLAYER~COURSELENGTH 0
  return
end
if (($PLAYER~STARTING_POINT <= 0) or ($PLAYER~STARTING_POINT = ""))
  setvar $PLAYER~STARTING_POINT CURRENTSECTOR
end

# try getcourse system function first, if we have grid data
getcourse $PLAYER~MOWCOURSE $PLAYER~STARTING_POINT $PLAYER~DESTINATION
if ($PLAYER~MOWCOURSE > 0)
  setvar $PLAYER~COURSELENGTH ($PLAYER~MOWCOURSE + 1)
  return
end

setvar $PLAYER~SECTORS ""
setarray $PLAYER~MOWCOURSE 80
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
send "^f"&$PLAYER~STARTING_POINT&"*"&$PLAYER~DESTINATION&"*"
pause

:PLAYER~GOTSECTORS
setvar $PLAYER~SECTORS $PLAYER~SECTORS&" :::"
setvar $PLAYER~COURSELENGTH 0
setvar $PLAYER~INDEX 1
goto :PLAYER~KEEPGOING

:PLAYER~KEEPGOING
getword $PLAYER~SECTORS $PLAYER~MOWCOURSE[$PLAYER~INDEX] $PLAYER~INDEX
while ($PLAYER~MOWCOURSE[$PLAYER~INDEX] <> ":::")
  add $PLAYER~COURSELENGTH 1
  add $PLAYER~INDEX 1
  getword $PLAYER~SECTORS $PLAYER~MOWCOURSE[$PLAYER~INDEX] $PLAYER~INDEX
end
return

:PLAYER~NOCAPPINGTARGETS
killtrigger NOCTARGET
killtrigger FOUNDCAPTARGET
send "* "

:PLAYER~SECTORSLINE
killtrigger SECTORLINETRIG
killtrigger SECTORLINETRIG2
killtrigger SECTORLINETRIG3
killtrigger SECTORLINETRIG4
killtrigger DONEPATH
killtrigger DONEPATH2
setvar $PLAYER~LINE CURRENTLINE
replacetext $PLAYER~LINE ">" " "
striptext $PLAYER~LINE "("
striptext $PLAYER~LINE ")"
setvar $PLAYER~LINE $PLAYER~LINE&" "
getwordpos $PLAYER~LINE $PLAYER~POS "So what's the point?"
getwordpos $PLAYER~LINE $PLAYER~POS2 ": ENDINTERROG"
getwordpos $PLAYER~LINE $PLAYER~POS3 " No route within "

if (($PLAYER~POS > 0) or ($PLAYER~POS2 > 0) or ($PLAYER~POS3 > 0))
  goto :NOPATH
end
getwordpos $PLAYER~LINE $PLAYER~POS " sector "
getwordpos $PLAYER~LINE $PLAYER~POS2 "TO"

if (($PLAYER~POS <= 0) and ($PLAYER~POS2 <= 0))
  setvar $PLAYER~SECTORS $PLAYER~SECTORS&" "&$PLAYER~LINE
end
getwordpos $PLAYER~LINE $PLAYER~POS " "&$PLAYER~DESTINATION&" "
getwordpos $PLAYER~LINE $PLAYER~POS2 "("&$PLAYER~DESTINATION&")"
getwordpos $PLAYER~LINE $PLAYER~POS3 "TO"

if ((($PLAYER~POS > 0) or ($PLAYER~POS2 > 0)) and ($PLAYER~POS3 <= 0))
  send "* q "
  goto :GOTSECTORS
else
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$PLAYER~DESTINATION&" "
  settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$PLAYER~DESTINATION
  settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$PLAYER~DESTINATION&")"
  settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
  settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"
end
pause

:PLAYER~NOPATH
send "q '{" $SWITCHBOARD~BOT_NAME "} - No path to that sector, cannot mow!*"
setvar $PLAYER~MOWCOURSE 0
setvar $PLAYER~COURSELENGTH 0
return

:PLAYER~STOPPINGPOINT
return

include "source\include\switchboard"
