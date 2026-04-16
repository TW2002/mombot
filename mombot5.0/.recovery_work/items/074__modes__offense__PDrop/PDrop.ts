reqrecording



gosub :BOT~LOADVARS
setvar $BOT~COMMAND "pdrop"
loadvar $BOT~BOT_TURN_LIMIT
loadvar $MAP~STARDOCK
loadvar $BOT~SUBSPACE
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $SHIP~SHIP_MAX_ATTACK

setvar $BOT~HELP[1] $BOT~TAB&"pdrop {delay:#} {d|a|s|da|de} {fm|f|m|uf} {return} {kill}     "
setvar $BOT~HELP[2] $BOT~TAB&"      {fastkill} {defender} {perfect} {density} {lock}        "
setvar $BOT~HELP[3] $BOT~TAB&"      {plockt:#} {figs:#} {offensive} {twohops} {retrigger}   "
setvar $BOT~HELP[4] $BOT~TAB&"      {densityx} {iglift}                                     "
setvar $BOT~HELP[5] $BOT~TAB&"        "
setvar $BOT~HELP[6] $BOT~TAB&"  {delay:#} - delay before dropping in milliseconds"
setvar $BOT~HELP[7] $BOT~TAB&"        {d} - direct drop"
setvar $BOT~HELP[8] $BOT~TAB&"        {a} - adjacent drop"
setvar $BOT~HELP[9] $BOT~TAB&"        {s} - surround drop"
setvar $BOT~HELP[10] $BOT~TAB&"       {da} - direct, then adjacent drop"
setvar $BOT~HELP[11] $BOT~TAB&"       {de} - dead end drop"
setvar $BOT~HELP[12] $BOT~TAB&"       {fm} - trigger on fighter and mine hits"
setvar $BOT~HELP[13] $BOT~TAB&"        {f} - trigger on fighter hits only"
setvar $BOT~HELP[14] $BOT~TAB&"        {m} - trigger on mines only"
setvar $BOT~HELP[15] $BOT~TAB&"       {uf} - trigger on mines with no fighters"
setvar $BOT~HELP[16] $BOT~TAB&"   {return} - will return planet home after 10 seconds"
setvar $BOT~HELP[17] $BOT~TAB&"     {kill} - checks for enemy, and kills if possible"
setvar $BOT~HELP[18] $BOT~TAB&" {fastkill} - does kill mac without checking"
setvar $BOT~HELP[19] $BOT~TAB&" {defender} - sets and lifts IG capable defender"
setvar $BOT~HELP[20] $BOT~TAB&"  {perfect} - Only drops adjacent when it is only option"
setvar $BOT~HELP[21] $BOT~TAB&"  {density} - Drops adjacent, runs density photon"
setvar $BOT~HELP[22] $BOT~TAB&"     {lock} - Locks on sector then halts"
setvar $BOT~HELP[23] $BOT~TAB&" {plockt:#} - Plock delay before retrigger. Default is no retrigger."
setvar $BOT~HELP[24] $BOT~TAB&"   {figs:#} - drop this many figs to sector on landing"
setvar $BOT~HELP[25] $BOT~TAB&"{offensive} - make figs offensive, default defense."
setvar $BOT~HELP[26] $BOT~TAB&"  {twohops} - deadend drop, make sure de 2 hops or more away"
setvar $BOT~HELP[27] $BOT~TAB&"{retrigger} - Keep hunting for targets"
setvar $BOT~HELP[28] $BOT~TAB&" {densityx} - Density < 40 for xport in and deploy"
setvar $BOT~HELP[29] $BOT~TAB&"   {iglift} - sets and lifts IG self"
setvar $BOT~HELP[30] $BOT~TAB&"    "
setvar $BOT~HELP[31] $BOT~TAB&"   Examples:"
setvar $BOT~HELP[32] $BOT~TAB&"      >pdrop delay:10000 d f return kill"
setvar $BOT~HELP[33] $BOT~TAB&"      >pdrop 1000 da fm "
setvar $BOT~HELP[34] $BOT~TAB&"      >pdrop a f kill"


gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Planet Dropper"
gosub :BOT~BANNER

setvar $PLAYER~SAVE TRUE
gosub :COMBAT~INIT

getsectorparameter SECTORS "FIGSEC" $ISFIGGED


setvar $START_FIG_HIT "Deployed Fighters Report Sector "
setvar $END_FIG_HIT ":"
setvar $ALIEN_ANSI #27&"[1;36m"&#27&"["
setvar $START_FIG_HIT_OWNER ":"
setvar $END_FIG_HIT_OWNER "'s"
loadvar $MAP~STARDOCK
loadvar $MAP~BACKDOOR
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $BOT~COMMAND
getword $BOT~USER_COMMAND_LINE $BOT~PARM1 1
getword $BOT~USER_COMMAND_LINE $BOT~PARM2 2
getword $BOT~USER_COMMAND_LINE $BOT~PARM3 3
getword $BOT~USER_COMMAND_LINE $BOT~PARM4 4
getword $BOT~USER_COMMAND_LINE $BOT~PARM5 5
getword $BOT~USER_COMMAND_LINE $BOT~PARM6 6
getword $BOT~USER_COMMAND_LINE $BOT~PARM7 7
getword $BOT~USER_COMMAND_LINE $BOT~PARM8 8
getsectorparameter SECTORS "FIGSEC" $ISFIGGED
if ($ISFIGGED = "")
  send "'{" $BOT~BOT_NAME "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  halt
end

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $SCRIPT_VER "Mind Over Matter Bot P-drop"
if ($STARTINGLOCATION <> "Citadel")
  send "'{" $BOT~BOT_NAME "} - This script must be run from the Citadel Prompt*"
  setvar $MODE "General"
  halt
end

loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end

gosub :SHIP~GETSHIPSTATS


setvar $BOT~USER_COMMAND_LINE " "&$BOT~USER_COMMAND_LINE&" "

getwordpos $BOT~USER_COMMAND_LINE $POS " delay:"
if ($POS > 0)
  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $DROPDELAY "delay:" " "
else
  isnumber $TEST $BOT~PARM1
  if ($TEST)
    setvar $DROPDELAY $BOT~PARM1
  else
    setvar $DROPDELAY 0
  end
end

getwordpos $BOT~USER_COMMAND_LINE $POS " d "
if ($POS > 0)
  setvar $DROPDESCRIPTION "Direct"
else
  getwordpos $BOT~USER_COMMAND_LINE $POS " a "
  if ($POS > 0)
    setvar $DROPDESCRIPTION "Adjacent"
  else
    getwordpos $BOT~USER_COMMAND_LINE $POS " da "
    if ($POS > 0)
      setvar $DROPDESCRIPTION "Direct, then Adjacent"
    else
      getwordpos $BOT~USER_COMMAND_LINE $POS " s "
      if ($POS > 0)
        setvar $DROPDESCRIPTION "Surround"
      else
        getwordpos $BOT~USER_COMMAND_LINE $POS " ad "
        if ($POS > 0)
          setvar $DROPDESCRIPTION "Adjacent, then Direct"
        else
          getwordpos $BOT~USER_COMMAND_LINE $POS " de "
          if ($POS > 0)
            setvar $DROPDESCRIPTION "Deadend Drop"
          else
            setvar $DROPDESCRIPTION "Direct"
          end
        end
      end
    end
  end
end
getwordpos $BOT~USER_COMMAND_LINE $POS " f "
if ($POS > 0)
  setvar $TRIGGERDESCRIPTION "Fighters"
else
  getwordpos $BOT~USER_COMMAND_LINE $POS " fm "
  if ($POS > 0)
    setvar $TRIGGERDESCRIPTION "Fighters and Mines"
  else
    getwordpos $BOT~USER_COMMAND_LINE $POS " m "
    if ($POS > 0)
      setvar $TRIGGERDESCRIPTION "Mines"
    else
      getwordpos $BOT~USER_COMMAND_LINE $POS " uf "
      if ($POS > 0)
        setvar $TRIGGERDESCRIPTION "Unfigged Mines"
      else
        setvar $TRIGGERDESCRIPTION "Fighters and Mines"
      end
    end
  end
end
getwordpos $BOT~USER_COMMAND_LINE $POS "return"
if ($POS > 0)
  setvar $RETURNHOME TRUE
  setvar $RETURNHOMEDELAY 10
else
  setvar $RETURNHOME FALSE
  setvar $RETURNHOMEDELAY 0
end

getwordpos $BOT~USER_COMMAND_LINE $POS "kill"
if ($POS > 0)
  setvar $ATTACKONSIGHT TRUE
else
  setvar $ATTACKONSIGHT FALSE
end
setvar $RANDOMATTACK TRUE

getwordpos $BOT~USER_COMMAND_LINE $POS "cap"
if ($POS > 0)
  setvar $CAPTURE TRUE
  setvar $ATTACKONSIGHT TRUE
else
  setvar $CAPTURE FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "fastkill"
if ($POS > 0)
  setvar $FASTKILL TRUE
else
  setvar $FASTKILL FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "retrigger"
if ($POS > 0)
  setvar $RETRIGGER TRUE
else
  setvar $RETRIGGER FALSE
end

setvar $DROPFTRSTYPE "d"
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

getwordpos $BOT~USER_COMMAND_LINE $POS "plockt:"
if ($POS > 0)

  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $PLOCKTIMER "plockt:" " "
else
  setvar $PLOCKTIMER 0
end


getwordpos $BOT~USER_COMMAND_LINE $POS "defender"
if ($POS > 0)
  setvar $DEFENDER TRUE
else
  setvar $DEFENDER FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "perfect"
if ($POS > 0)
  setvar $PERFECT TRUE
else
  setvar $PERFECT FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "lock"
if ($POS > 0)
  setvar $LOCK TRUE
else
  setvar $LOCK FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "twohops"
if ($POS > 0)
  setvar $TWOHOPS TRUE
else
  setvar $TWOHOPS FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "density"
if ($POS > 0)
  setvar $DENSITY TRUE
  if ($DROPDESCRIPTION = "Direct")
    setvar $DROPDESCRIPTION "Adjacent"
  end
  if ($PLAYER~PHOTONS < 1)
    setvar $SWITCHBOARD~MESSAGE "No Photons on Board!!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $DENSITY FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "densityx"
if ($POS > 0)
  setvar $DENSITYX TRUE
else
  setvar $DENSITYX FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "iglift"
if ($POS > 0)
  setvar $IGLIFT TRUE
else
  setvar $IGLIFT FALSE
end



setvar $RANDOMATTACK TRUE

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CORPORATION > 0)
  gosub :GETCORPIES
end
gosub :GETNAME
setvar $SCRIPT_VER "Planet Drop"

setvar $DROPSECTOR 0
setvar $ENDLINE "_ENDLINE_"
setvar $STARTLINE "_STARTLINE_"
cuttext CURRENTLINE $LOCATION 1 7
if ($LOCATION <> "Citadel")
  echo ANSI_12 "**This script must be run from the Citadel Prompt"
  halt
end
send "c;q"
waitfor "Figs Per Attack:"
getword CURRENTLINE $MAXFIGATTACK 5




gosub :PLANETSTATS

setvar $MESSAGE "'*  {"&$BOT~BOT_NAME&"} - Planet Dropper Currently Running On Planet "&$PLANET~PLANET&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$DROPDESCRIPTION&" On "&$TRIGGERDESCRIPTION
if ($TARGETINGPERSON)
  setvar $MESSAGE $MESSAGE&"*        Targeting: (Player) "&$TARGET
else
  setvar $MESSAGE $MESSAGE&"*        Targeting: Everyone"
end
if ($PRELOCKACTIVE)
  if ($PRELOCKRELEASETIME > 0)
    setvar $MESSAGE $MESSAGE&"*         Pre-Lock: Enabled With "&$PRELOCKRELEASETIME&" Second Release"
  else
    setvar $MESSAGE $MESSAGE&"*         Pre-Lock: Enabled With Manual Release Only"
  end
end
if ($DROPDELAY > 0)
  setvar $MESSAGE $MESSAGE&"*       Drop Delay: "&$DROPDELAY&" ms"
end
if ($LOCK)
  setvar $MESSAGE $MESSAGE&"*       Plock Mode: Enabled"
end
if ($ATTACKONSIGHT)
  format $PLANET~PLANET_FIGHTERS $FORMATTED_FIGHTERS "NUMBER"
  if ($CAPTURE)
    setvar $MESSAGE $MESSAGE&"*         Auto Cap: Enabled With "&$FORMATTED_FIGHTERS&" Fighters"
  else
    setvar $MESSAGE $MESSAGE&"*        Auto Kill: Enabled With "&$FORMATTED_FIGHTERS&" Fighters"
  end
end
if ($FASTKILL)
  setvar $MESSAGE $MESSAGE&"*        Fast Kill: Will attempt kill macro at every pdrop attempt"
end
if ($RETURNHOME)
  setvar $MESSAGE $MESSAGE&"*      Return Home: Enabled With "&$RETURNHOMEDELAY&" Second Delay"
end
if ($RETRIGGER)
  setvar $MESSAGE $MESSAGE&"*        ReTrigger: We will keep firing whether we hit or miss."
end

if ($DEFENDER = 1)
  setvar $MESSAGE $MESSAGE&"*         Defender: Will set and reset IG enabled Corp Mate"
end
if ($PERFECT = 1)
  setvar $MESSAGE $MESSAGE&"*          Perfect: Will only drop adjacent on perfect firing solution."
end
if ($DENSITY = 1)
  setvar $MESSAGE $MESSAGE&"*          Density: Dropping in next door with density foton."
end
if (($DENSITY = 1) and ($DENSITYX = 1))
  setvar $MESSAGE $MESSAGE&"*          Density: Only shooting from 1 to 39."
end
if ($IGLIFT = 1)
  setvar $MESSAGE $MESSAGE&"*           IGLift: I will lift on landing and hold."
end

if ($RANDOMATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Random"
elseif ($FIRSTATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: First Available Target"
elseif ($SECONDATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Second Available Target"
elseif ($THIRDATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Third Available Target"
elseif ($FOURTHATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Fourth Available Target"
elseif ($FIFTHATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Fifth Available Target"
elseif ($SIXTHATTACK)
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Sixth Available Target"
else
  setvar $MESSAGE $MESSAGE&"*   Attack Pattern: Last Available Target"
end
setvar $MESSAGE $MESSAGE&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
send $MESSAGE
if ($DEFENDER = 1)
  gosub :CHECKDEFENDERS
  gosub :SETDEFENDER
end
if ($IGLIFT = 1)
  gosub :LIFTANDCHECKIG
end
gosub :PLAYER~QUIKSTATS
setvar $HOMESECTOR $PLAYER~CURRENT_SECTOR
:STARTTARGETING
killalltriggers
if (($RETURNHOME = TRUE) and (($ISMANUAL <> TRUE) and ($PLAYER~CURRENT_SECTOR <> $HOMESECTOR)))
  setvar $TIMEINMILLI (($RETURNHOMEDELAY * 1000) + 100)
  echo ANSI_6 "*    [" ANSI_14 "Returning Home In " ANSI_15 $RETURNHOMEDELAY ANSI_14 " Seconds" ANSI_6 "]*" ANSI_7
  setdelaytrigger HOMEDELAY :GOHOME $TIMEINMILLI
end
settextlinetrigger MANUAL :MANUALPWARP "Planetary TransWarp Drive Engaged!"
if ($TRIGGERDESCRIPTION = "Fighters and Mines") or ($TRIGGERDESCRIPTION = "Mines") or ($TRIGGERDESCRIPTION = "Unfigged Mines")
  if ($TARGETINGPERSON = FALSE)
    settexttrigger LIMP :ATTACKSECTORLIMPET "Limpet mine in "
  end
  settexttrigger ARMID :ATTACKSECTORMINE "Your mines in "
end
if ($TRIGGERDESCRIPTION = "Fighters and Mines") or ($TRIGGERDESCRIPTION = "Fighters")
  settexttrigger FIG :ATTACKSECTORFIGHTER "Deployed Fighters "
end
settextlinetrigger WARN :KEEPALIVE "INACTIVITY WARNING:"
settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
settexttrigger PAUSE4 :PAUSING "Transfer To or From the Treasury (T/F)"
settexttrigger PAUSE5 :PAUSING "Qcannon Control Type :"
settexttrigger PAUSE6 :PAUSING "Beam to what sector? (U=Upgrade"
settextouttrigger REDOSETTINGS :DOSETTINGS "%"


setvar $ISMANUAL FALSE
if ($ATTACKONSIGHT)
  settextlinetrigger LIMP2 :SCAN "Limpet mine in "&$PLAYER~CURRENT_SECTOR
  settextlinetrigger WARPS :SCAN "warps into the sector."
  settextlinetrigger LIFTS :SCAN "lifts off from"
  settextlinetrigger DEFFIG :SCAN "Deployed Fighters Report Sector "&$PLAYER~CURRENT_SECTOR
  settextlinetrigger SECGUN :SCAN "Quasar Cannon on"
  settextlinetrigger IG :SCAN "Shipboard Computers The Interdictor Generator on"
  settextlinetrigger POWER :SCAN "is powering up weapons systems!"
  settextlinetrigger WAVE :SCAN " launches a wave of fighters at  "
  settextlinetrigger PLANET :SCAN " launches a Genesis Torpedo into the sector!"
  settextlinetrigger ATOMIC :SCAN " appears from the planetary rubble."
  settextlinetrigger EXITS :SCAN "exits the game."
  settextlinetrigger ENTERS :SCAN "enters the game."
  setdelaytrigger DELAY :SCAN 30000
end
pause
:SCAN

killalltriggers
gosub :CHECKFORVICTIMS
goto :STARTTARGETING
:KEEPALIVE

killalltriggers
gosub :WARNING
goto :STARTTARGETING
:PAUSING

killalltriggers
echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " paused. To restart, re-enter Citadel Prompt" ANSI_6 "]*" ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:RESTARTING
killalltriggers
echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " restarted" ANSI_6 "]*" ANSI_7
gosub :GETSECTORLOCATION
goto :STARTTARGETING
:ANSWER

killalltriggers
gosub :AUTHENTICATE
if ($AUTH_RESULT = "true")
  killalltriggers
  send $MESSAGE
  waiton "Sub-space comm-link terminated"
end
goto :STARTTARGETING
:GOHOME

killalltriggers

if ($DROPFTRS)

  gosub :RETRIEVEFIGS
end



send "p " $HOMESECTOR "*y"
:MANUALPWARP

killalltriggers
if ($ATTACKONSIGHT)
  gosub :CHECKFORVICTIMS
end
setvar $ISMANUAL TRUE
gosub :GETSECTORLOCATION
goto :STARTTARGETING
:ATTACKSECTORMINE
killtrigger FIG
killtrigger LIMP
gosub :VALIDATEMINEHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
goto :GETDROPSECTOR
:ATTACKSECTORLIMPET
killtrigger ARMID
killtrigger FIG
gosub :VALIDATELIMPETHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
goto :GETDROPSECTOR
:ATTACKSECTORFIGHTER
killtrigger ARMID
killtrigger LIMP
gosub :VALIDATEFIGHTERHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
:GETDROPSECTOR

if ($DROPDESCRIPTION = "Direct")
  if ($LOCK = TRUE)
    setvar $SEND "p "&$DROPSECTOR&"*"
    send $SEND
    goto :DOLOCK
  else
    setvar $SEND "p "&$DROPSECTOR&"* y "
    if ($FASTDROP = TRUE)
      if ($SHIP~SHIP_FIGHTERS_MAX <= 100000)
        setvar $FIGSTODROP ($SHIP~SHIP_FIGHTERS_MAX / 2)
      else
        setvar $FIGSTODROP ($SHIP~SHIP_FIGHTERS_MAX - 100000)
      end
      setvar $SEND $SEND&"q q fz"&$FIGSTODROP&"*z c d * l "&$PLANET~PLANET&"*  m  *** c  "
    end
    if ($FASTKILL = TRUE)
      setvar $SEND $SEND&"q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
    end
    if ($IGLIFT = 1)
      setvar $SEND $SEND&"q q * * "
    end
  end

  send $SEND

  if ($DEFENDER = 1)
    killalltriggers
    gosub :LIFTDEFENDERS
  end

  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  gosub :GETSECTORLOCATION

  if ($PLAYER~CURRENT_SECTOR <> $DROPSECTOR)
    setsectorparameter $DROPSECTOR "FIGSEC" FALSE
    if ($DROPFTRS = TRUE)
      gosub :RETRIEVEFIGS
    end
  end
  if ($IGLIFT = 1)
    if ($PLAYER~CURRENT_SECTOR <> $DROPSECTOR)
      send "'Planet did not arrive, resetting*"
      gosub :RESETIGLIFT

    else
      send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
      waitfor "resetpdrop"
      gosub :WAITFORRESTART
      gosub :RESETIGLIFT
    end
  end
  if ($DEFENDER = 1)
    if ($PLAYER~CURRENT_SECTOR <> $DROPSECTOR)
      send "'Planet did not arrive, resetting*"
      gosub :RESETDEFENDER

    else
      send "'Defender Initiated! send reset command to re-enable PDROP*"
      gosub :WAITFORRESTART
      gosub :SETDEFENDER
    end
  end
elseif ($DROPDESCRIPTION = "Adjacent")
  if ($DENSITY = 1)
    gosub :FINDADJACENTDENSITY
  else
    gosub :FINDADJACENT
  end
  gosub :ATTEMPTDROP
  if ($DENSITY = 1)
    if ($TARGETCOUNT = 0)
      goto :STARTTARGETING
    end
    gosub :DENSITYDROP
  end
  if ($DEFENDER = 1)
    killalltriggers
    gosub :LIFTDEFENDERS
  end

  gosub :GETSECTORLOCATION
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  if ($PLAYER~CURRENT_SECTOR <> $GOTOSECTOR)
    send "'Planet did not arrive, resetting*"

  else
    if ($IGLIFT = 1)
      send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
      waitfor "resetpdrop"
      gosub :WAITFORRESTART
      gosub :RESETIGLIFT
    end
  end

  if ($DEFENDER = 1)
    send "'Defender Initiated! send reset command to re-enable PDROP*"
    gosub :WAITFORRESTART
    gosub :SETDEFENDER
  end


  if ($DROPFTRS = TRUE)
    gosub :RETRIEVEFIGS
  end

elseif ($DROPDESCRIPTION = "Adjacent, then Direct")
  gosub :FINDADJACENT
  gosub :ATTEMPTDROP
  send "p " $DROPSECTOR "* y "
  gosub :GETSECTORLOCATION
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
elseif ($DROPDESCRIPTION = "Surround")
  setvar $GOTOSECTOR 0
  gosub :ATTEMPTSURROUNDDROP
  if (($GOTOSECTOR > 0) and ($DEFENDER = 1))
    killalltriggers
    gosub :LIFTDEFENDERS
  end
  gosub :GETSECTORLOCATION
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  if (($IGLIFT = 1) and ($GOTOSECTOR > 0))
    send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
    waitfor "resetpdrop"
    gosub :WAITFORRESTART
    gosub :RESETIGLIFT
  end

  if (($DEFENDER = 1) and ($GOTOSECTOR > 0))
    send "'Defender Initiated! send reset command to re-enable PDROP*"
    gosub :WAITFORRESTART
    gosub :SETDEFENDER
  end
  if ($DROPFTRS = TRUE)
    gosub :RETRIEVEFIGS
  end
elseif ($DROPDESCRIPTION = "Deadend Drop")
  gosub :FINDDEADEND
  gosub :ATTEMPTDROP
  if ($DENSITY = 1)
    gosub :DENSITYDROP
  end
  if ($DEFENDER = 1)
    killalltriggers
    gosub :LIFTDEFENDERS
  end
  gosub :GETSECTORLOCATION
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  if ($IGLIFT = 1)
    send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
    waitfor "resetpdrop"
    gosub :WAITFORRESTART
    gosub :RESETIGLIFT
  end
  if ($DEFENDER = 1)
    send "'Defender Initiated! send reset command to re-enable PDROP*"
    gosub :WAITFORRESTART
    gosub :SETDEFENDER
  end
  if ($DROPFTRS = TRUE)
    gosub :RETRIEVEFIGS
  end
else
  if ($DROPSECTOR <> $PLAYER~CURRENT_SECTOR)
    send "p " $DROPSECTOR "*y"
    settexttrigger PWARPNOTOK :PWARPTRYADJACENT "You do not have any fighters in Sector "
    settexttrigger PWARPOK :PWARPDONE " Planetary TransWarp Drive Engaged! "
    pause
    :PWARPDONE

    killalltriggers
    setvar $PLAYER~CURRENT_SECTOR $DROPSECTOR
    if ($ATTACKONSIGHT)
      gosub :CHECKFORVICTIMS
    end
    goto :STARTTARGETING
  else
    if ($ATTACKONSIGHT)
      gosub :CHECKFORVICTIMS
    end
    goto :STARTTARGETING
  end
  :PWARPTRYADJACENT
  killalltriggers
  setsectorparameter $DROPSECTOR "FIGSEC" FALSE
  gosub :FINDADJACENT
  gosub :ATTEMPTDROP
  goto :STARTTARGETING


end
goto :STARTTARGETING
:END


killalltriggers
echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " Shutting Down" ANSI_6 "]*" ANSI_7
halt
:ATTEMPTSURROUNDDROP

setvar $I 1
setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
setvar $ISFOUND FALSE
while (($CHECKSECTOR > 0) and ($ISFOUND = FALSE))
  getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
  if ($ISFIGGED <> TRUE)
    setvar $RETREATSECTOR $CHECKSECTOR
    setvar $ISFOUND TRUE
  else
    add $I 1
    setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
  end
end

if ($ISFOUND)
  setvar $I 2
  setvar $CHECKSECTOR SECTOR.WARPS[$RETREATSECTOR][$I]
  setvar $ISFOUND FALSE
  setvar $TARGETS ""
  setvar $TARGETCOUNT 0
  while (($CHECKSECTOR > 0) and ($TARGETCOUNT <= 0))
    getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
    if (($ISFIGGED = TRUE) and ($CHECKSECTOR <> $DROPSECTOR))
      setvar $TARGETS $TARGETS&" "&$CHECKSECTOR&" "
      add $TARGETCOUNT 1
    end
    setvar $CHECKSECTOR SECTOR.WARPS[$RETREATSECTOR][$I]
    add $I 1
  end
  if ($TARGETCOUNT > 0)
    setvar $GOTOSECTOR $TARGETS
    gosub :DOPWARP
  else
    echo "** No Adjacent Fig Next To Possible Retreat Sector **"
  end
else
  echo "** No Possible Retreat Sector **"
end
return
:ATTEMPTDROP


if ($TARGETCOUNT > 0)
  getrnd $RANDOMTARGET 1 $TARGETCOUNT
  if (($DROPDELAY > 0) and ($LOCK = FALSE))
    killalltriggers
    setdelaytrigger DELAY :PLANETDROP $DROPDELAY
    pause
  end
  :PLANETDROP
  setvar $GOTOSECTOR $TARGETSECTORS[$RANDOMTARGET]
  if ($LOCK = TRUE)
    send "p "&$GOTOSECTOR&"*"
    setvar $DROPSECTOR $GOTOSECTOR
    goto :DOLOCK
  else

    gosub :DOPWARP
  end
end

return
:DOPWARP
:PLANETDROP2

killalltriggers
setvar $SEND "p "&$GOTOSECTOR&"*y"
if ($DROPFTRS = TRUE)
  setvar $SEND $SEND&$MOVEFIGMACRO
end
if ($IGLIFT = 1)
  setvar $SEND $SEND&"q q * *"
elseif ($FASTKILL = TRUE)
  setvar $SEND $SEND&"q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
end
send $SEND
settextlinetrigger PWARPNO :PWARPNO "You do not have any fighters in Sector "
settextlinetrigger PWARPYES :PWARPYES " Planetary TransWarp Drive Engaged! "
settextlinetrigger PWARPALREADYTHERE :PWARPFINISHED "You are already in that sector!"
pause
:PWARPNO
killalltriggers
setvar $TARGETSECTORS[$RANDOMTARGET] 0
setsectorparameter $GOTOSECTOR "FIGSEC" FALSE
if ($IGLIFT = 1)
  send "l" $PLANET~PLANET "* c "
  waitfor "<Enter Citadel>"
  gosub :PLAYER~QUIKSTATS
elseif ($DROPFTRS = TRUE)

else
  setvar $I 1
  while ($I <= $TARGETCOUNT)
    if ($TARGETSECTORS[$I] > 0)
      setvar $RANDOMTARGET $I
      setvar $GOTOSECTOR $TARGETSECTORS[$RANDOMTARGET]
      goto :PLANETDROP2
    end
    add $I 1
  end
end
goto :PWARPFINISHED
:PWARPYES
killalltriggers
:PWARPFINISHED
gosub :GETSECTORLOCATION

return
:DOLOCK
killalltriggers
settextlinetrigger DOLOCKNO :DOLOCKNO "You do not have any fighters in Sector "
settextlinetrigger DOLOCKYES :DOLOCKYES "Locating beam pinpointed, TransWarp Locked"
settextlinetrigger DOLOCKYESALREADYTHERE :DOLOCKYESALREADYTHERE "You are already in that sector!"
pause
:DOLOCKNO
killalltriggers
goto :STARTTARGETING
:DOLOCKYESALREADYTHERE
goto :STARTTARGETING
killalltriggers
:DOLOCKYES
setvar $SWITCHBOARD~MESSAGE "We have a PLock on "&$DROPSECTOR&", setting kill triggers!*"
gosub :SWITCHBOARD~SWITCHBOARD
killalltriggers
goto :SETPLOCKTRIGGERS
killalltriggers
goto :STARTTARGETING
halt
return
:CLEARSCREEN
echo #27&"[2J"
return
:TURNOFFANSI

send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $ANSISTATUS 5
waiton "(2) Animation display"
getword CURRENTLINE $ANIMATIONSTATUS 5
if ($ANIMATIONSTATUS = "On")
  send 2
end
if ($ANSISTATUS = "On")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:TURNONANSI

send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $ANSISTATUS 5
if ($ANSISTATUS = "Off")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:PLANETSTATS


gosub :PLAYER~QUIKSTATS
send "q"
gosub :PLANET~GETPLANETINFO
setvar $PLANET~PLANETFIGHTERS $PLANET~PLANET_FIGHTERS

if ($DROPFTRS)

  if ($PLANET~PLANET_FIGHTERS < $DROPFIGQUANT)
    setvar $SWITCHBOARD~MESSAGE "There are only "&$PLANET~PLANET_FIGHTERS&" fighters on the planet.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  setvar $SWITCHBOARD~MESSAGE "Dropping "&$DROPFIGQUANT&" on landing; Cannons not changed.*"
  gosub :SWITCHBOARD~SWITCHBOARD

  setvar $MOVEFIGMACRO ""
  setvar $MOVED 0

  while ($MOVED < $DROPFIGQUANT)

    setvar $TOMOVE ($DROPFIGQUANT - $MOVED)

    if ($TOMOVE >= $MAXFIGATTACK)
      setvar $THISMOVE $MAXFIGATTACK
      setvar $MOVED ($MOVED + $THISMOVE)
    else
      setvar $THISMOVE $TOMOVE
      setvar $MOVED ($MOVED + $THISMOVE)
    end

    setvar $MOVEFIGMACRO $MOVEFIGMACRO&"q m n t* q fz "&$MOVED&"* * zc"&$DROPFTRSTYPE&" * l"&$PLANET~PLANET&" *m* t * ccq"
  end
end

send "c "
return
:RETRIEVEFIGS

gosub :PLAYER~QUIKSTATS
send " s*  "
setvar $FIGOWNER SECTOR.FIGS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $FIGQUANT SECTOR.FIGS.QUANTITY[$PLAYER~CURRENT_SECTOR]

waitfor "<Scan Sector>"
waitfor "Citadel treasury contains"


if (($FIGQUANT <> 0) and (($FIGOWNER = "belong to your Corp") or ($FIGOWNER = "yours")))

  setvar $RETFIGMACRO ""
  setvar $MOVED 0
  setvar $SECTORQUANT $FIGQUANT
  if ($DROPFIGQUANT > $FIGQUANT)
    setvar $RETQUANT $FIGQUANT
  else
    setvar $RETQUANT $DROPFIGQUANT
  end
  while ($MOVED < $RETQUANT)

    setvar $TOMOVE ($RETQUANT - $MOVED)

    if ($TOMOVE >= $SHIP~SHIP_FIGHTERS_MAX)
      setvar $THISMOVE $SHIP~SHIP_FIGHTERS_MAX
      setvar $MOVED ($MOVED + $THISMOVE)
      setvar $SECTORQUANT ($SECTORQUANT - $THISMOVE)
    else
      setvar $THISMOVE $TOMOVE
      setvar $MOVED ($MOVED + $THISMOVE)
      setvar $SECTORQUANT ($SECTORQUANT - $THISMOVE)
    end


    if ($SECTORQUANT = 0)

      setvar $RETFIGMACRO $RETFIGMACRO&"q m n l* q fz 1* * zc"&$DROPFTRSTYPE&" * l"&$PLANET~PLANET&" *m* t * ccq"

    else
      setvar $RETFIGMACRO $RETFIGMACRO&"q m n l* q fz "&$SECTORQUANT&"* * zc"&$DROPFTRSTYPE&" * l"&$PLANET~PLANET&" *m* t * ccq"
    end
  end
end



send $RETFIGMACRO

return
:WARNING

send "#"
return
:LANDONPLANETENTERCITADEL

send "l " $PLANET~PLANET "* c"
waiton "<Enter Citadel>"
return
:LEAVECITADELANDPLANET

send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return
:SHOWPRELOCKOPTIONS





echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " Pre-locked onto sector " $GOTOSECTOR ANSI_6 "]*" ANSI_7
echo ANSI_6 "  [" ANSI_14 "%" ANSI_6 "]" ANSI_15 " Let Go of Pre-Lock*" ANSI_7
if ($PRELOCKRELEASETIME > 0)
  echo ANSI_6 "[" ANSI_14 "Script will release pre-lock automatically in "&$PRELOCKRELEASETIME&" seconds.." ANSI_6 "]*" ANSI_7
end
return
:SHOWOPTIONS

echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " Options" ANSI_6 "]*" ANSI_7
echo ANSI_6 "  [" ANSI_14 "%" ANSI_6 "]" ANSI_15 " Change Drop Settings*"
echo ANSI_6 "[" ANSI_14 $SCRIPT_VER " waiting for targets.." ANSI_6 "]*" ANSI_7
return
:CHECKFORVICTIMS



gosub :PLAYER~QUIKSTATS
send " s*  "
:SCANIT_AGAIN
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
gosub :SECTOR~GETSECTORDATA
if ($SECTOR~REALTRADERCOUNT > ($SECTOR~CORPIECOUNT + $SECTOR~DEFENDERSHIPS))
  if ($CAPTURE)
    gosub :COMBAT~FASTCAPTURE
  else
    gosub :COMBAT~FASTCITADELATTACK
  end
  goto :SCANIT_AGAIN
elseif ($SECTOR~EMPTYSHIPCOUNT > $SECTOR~MYSHIPCOUNT)
  gosub :COMBAT~FASTCAPTURE
  goto :SCANIT_AGAIN
end
return
:GETDROPPERSTATS



send "c;q"
waitfor "Figs Per Attack:"
getword CURRENTLINE $SHIP~SHIP_MAX_ATTACK 5

send "q m****c "
waiton "Planet #"
getword CURRENTLINE $PLANET~PLANET 2
waiton "Fighters        N/A"
getword CURRENTLINE $PLANET~PLANETFIGHTERS 5
waiton "<Enter Citadel>"

striptext $PLANET~PLANET "#"
setvar $ISMANUAL FALSE
gosub :GETSTATS
return
:GETSECTORLOCATION

send "/"
waitfor "Sect "
getword CURRENTLINE $TEMP 2
striptext $TEMP "Turns"
striptext $TEMP " "
replacetext $TEMP #179 ""
setvar $PLAYER~CURRENT_SECTOR $TEMP
return
:AUTHENTICATE



killalltriggers
setvar $SUBLINE CURRENTLINE
setvar $SUBLINE $SUBLINE&"             "
getword $SUBLINE $SPOOF 1
cuttext $SUBLINE $SUBSENDER 3 6
setvar $AUTH_RESULT "false"
if ($SPOOF = "'")
  setvar $AUTH_RESULT "self"
elseif ($SPOOF = "R")
  setvar $THISCORPIE 0
  :CORPIESUBLOOP
  add $THISCORPIE 1
  if ($THISCORPIE <= $PLAYER~CORPIES)
    if ($SUBSENDER = $PLAYER~CORPIE[$THISCORPIE])
      setvar $AUTH_RESULT "true"
      goto :AUTHDONE
    end
    goto :CORPIESUBLOOP
  end
end
:AUTHDONE
return
:GETNAME

send "I"
waitfor "<Info>"
:WAITFORNAME
settextlinetrigger GETNAME :GETTRADERNAME "Trader Name    :"
settexttrigger GETNAMEDONE :GETNAMEDONE "Command [TL="
settexttrigger GETNAMEDONE2 :GETNAMEDONE "Citadel command"
pause
:GETTRADERNAME

killalltriggers
setvar $NAME CURRENTLINE
striptext $NAME "Trader Name    : "
striptext $NAME "3rd Class "
striptext $NAME "2nd Class "
striptext $NAME "1st Class "
striptext $NAME "Annoyance "
striptext $NAME "Nuisance "
striptext $NAME "Menace "
striptext $NAME "Smuggler Savant "
striptext $NAME "Smuggler "
striptext $NAME "Robber "
striptext $NAME "Private "
striptext $NAME "Lance Corporal "
striptext $NAME "Corporal "
striptext $NAME "Staff Sergeant "
striptext $NAME "Gunnery Sergeant "
striptext $NAME "1st Sergeant "
striptext $NAME "Sergeant Major "
striptext $NAME "Sergeant "
striptext $NAME "Chief Warrant Officer "
striptext $NAME "Warrant Officer "
striptext $NAME "Terrorist "
striptext $NAME "Infamous Pirate "
striptext $NAME "Notorious Pirate "
striptext $NAME "Dread Pirate "
striptext $NAME "Pirate "
striptext $NAME "Galactic Scourge "
striptext $NAME "Enemy of the State "
striptext $NAME "Enemy of the People "
striptext $NAME "Enemy of Humankind "
striptext $NAME "Heinous Overlord "
striptext $NAME "Prime Evil "
striptext $NAME "Ensign "
striptext $NAME "Lieutenant J.G. "
striptext $NAME "Lieutenant Commander "
striptext $NAME "Lieutenant "
striptext $NAME "Commander "
striptext $NAME "Captain "
striptext $NAME "Commodore "
striptext $NAME "Rear Admiral "
striptext $NAME "Vice Admiral "
striptext $NAME "Fleet Admiral"
striptext $NAME "Admiral "
striptext $NAME "Civilian "
goto :WAITFORNAME
:GETNAMEDONE
killalltriggers
return
:GETCORPIES




setvar $PLAYER~CORPIES 0
send "XAQ"
waitfor " Corp Member Name                   Sector  Fighters Shields Mines  Credits"
waitfor "------------------------------------------------------------------------------"
:WAITFORCORPIENAME
settextlinetrigger GETCORPIENAME :GETCORPIENAME
pause
:GETCORPIENAME

killalltriggers
if (CURRENTLINE = "P indicates Trader is on a planet in that sector")
  goto :GETCORPIENAMEDONE
end
add $PLAYER~CORPIES 1
setvar $PLAYER~CORPIELINE CURRENTLINE
setvar $PLAYER~CORPIELINE $PLAYER~CORPIELINE&"          "
cuttext $PLAYER~CORPIELINE $PLAYER~CORPIE[$PLAYER~CORPIES] 1 6
goto :WAITFORCORPIENAME
:GETCORPIENAMEDONE
killalltriggers
return
:VALIDATEMINEHIT

setvar $ISVALID FALSE
cuttext CURRENTLINE&"    " $CK 1 1
if ($CK <> "Y")
  return
end
gettext CURRENTLINE $DROPSECTOR "Your mines in " " did"
gettext CURRENTANSILINE $ALIEN_CHECK $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
getwordpos CURRENTLINE $POS $START_FIG_HIT_OWNER
getwordpos $ALIEN_CHECK $APOS $ALIEN_ANSI
if (($APOS > 0) or ($POS = 0))
  return
end
if ($TARGETINGPERSON)
  getwordpos CURRENTLINE&" " $POS " "&$TARGET&" "
  if ($POS = 0)
    return
  end
end
setvar $ISVALID TRUE
return
:VALIDATELIMPETHIT

setvar $ISVALID FALSE
cuttext CURRENTLINE&" " $RADIO 1 1
if ($RADIO <> "L")
  return
end
setvar $ISVALID TRUE
gettext CURRENTLINE $DROPSECTOR "Limpet mine in " " a"
return
:VALIDATEFIGHTERHIT

setvar $ISVALID FALSE
cuttext CURRENTLINE&" " $RADIO 1 1
gettext CURRENTLINE $DROPSECTOR $START_FIG_HIT $END_FIG_HIT
if ($RADIO <> "D")
  return
end
gettext CURRENTANSILINE $ALIEN_CHECK $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
getwordpos CURRENTLINE $POS $START_FIG_HIT_OWNER
getwordpos $ALIEN_CHECK $APOS $ALIEN_ANSI
if (($APOS > 0) or ($POS = 0))
  return
end
if ($TARGETINGPERSON)
  getwordpos CURRENTLINE $POS " "&$TARGET&"'s "
  if ($POS <= 0)
    return
  end
end
setvar $ISVALID TRUE
return
:FINDADJACENT

getsectorparameter $DROPSECTOR "FIGSEC" $ISFIGGED
if (($TRIGGERDESCRIPTION = "Unfigged Mines") and ($ISFIGGED = TRUE))
  return
else
  if (($PERFECT = TRUE) and (SECTOR.WARPCOUNT[$DROPSECTOR] <> 2))
    echo "*Not a perfect firing solution"
    return
  end
  setvar $I 1
  setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
  setarray $TARGETSECTORS 6
  setvar $TARGETCOUNT 0
  while ($CHECKSECTOR > 0)
    getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
    if ($ISFIGGED = TRUE)
      add $TARGETCOUNT 1
      setvar $TARGETSECTORS[$TARGETCOUNT] $CHECKSECTOR
    end
    add $I 1
    setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR][$I]
  end
  if ($TARGETCOUNT <= 0)
    echo "No Targets..*"
    setvar $TARGETSECTORS[1] $CURRENT_LOCATION
  end
end

return
:FINDADJACENTDENSITY



getsectorparameter $DROPSECTOR "FIGSEC" $ISFIGGED

if (($PERFECT = TRUE) and (SECTOR.WARPCOUNT[$DROPSECTOR] <> 2))
  echo "*Not a perfect firing solution"
  return
end
setvar $I 1
setvar $CHECKSECTOR SECTOR.WARPSIN[$DROPSECTOR][$I]
setarray $TARGETSECTORS 6
setvar $TARGETCOUNT 0
while ($CHECKSECTOR > 0)
  getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
  if ($ISFIGGED = TRUE)
    add $TARGETCOUNT 1
    setvar $TARGETSECTORS[$TARGETCOUNT] $CHECKSECTOR
  end
  add $I 1
  setvar $CHECKSECTOR SECTOR.WARPSIN[$DROPSECTOR][$I]
end
if ($TARGETCOUNT <= 0)
  echo "No Targets..*"
  setvar $TARGETSECTORS[1] $CURRENT_LOCATION
end


return
:FINDDEADEND


getsectorparameter $DROPSECTOR "FIGSEC" $ISFIGGED
if (($TRIGGERDESCRIPTION = "Unfigged Mines") and ($ISFIGGED = TRUE))
  return
else

  getnearestwarps $NEAREST $DROPSECTOR
  setvar $I 1
  setvar $TARGETCOUNT 1
  while ($I <= $NEAREST)
    setvar $FOCUS $NEAREST[$I]
    getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
    if ($TWOHOPS = TRUE)
      getdistance $DISTANCE $DROPSECTOR $FOCUS
      if ($DISTANCE <= 0)
        send "^f"&$DROPSECTOR&"*"&$FOCUS&"*q"
        waiton "ENDINTERROG"
        getdistance $DISTANCE $DROPSECTOR $FOCUS
      end
    end

    if ((($ISFIGGED = TRUE) and (SECTOR.WARPCOUNT[$FOCUS] = 1)) and ((($TWOHOPS = TRUE) and ($DISTANCE >= 2)) or ($TWOHOPS <> TRUE)))

      setvar $TARGETSECTORS[$TARGETCOUNT] $FOCUS
      return
    end
    add $I 1
  end
  echo "No Targets..*"
  setvar $TARGETSECTORS[1] $CURRENT_LOCATION
end
return
:DENSITYDROP_TOSLOW




waitfor "Citadel command"

setvar $BOT~COMMAND "foton"
setvar $BOT~USER_COMMAND_LINE " on d "
setvar $BOT~PARM1 "on"
setvar $BOT~PARM2 "d"
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\offense\foton.cts"
seteventtrigger DENSITYENDED :DENSITYENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\offense\foton.cts"
pause
:DENSITYENDED
killalltriggers
return
:DENSITYDROP

waitfor "Citadel command"
send "q m * * * q  * * "
send "fz 3500* * zco * "
setvar $CHECKS 0
:CHECK_DENS




setvar $MM 0
setvar $I 1
send "sz*"
waiton "Relative Density Scan"
:DTORP_START

killtrigger ALLDONE
setvar $ATTACK_SECTOR_FOUND FALSE
settextlinetrigger GETSEC :GETSEC "Sector"
settexttrigger ALLDONE :ALLDONE "Command [TL="
pause
:GETSEC

gettext CURRENTLINE $TEMP "Sector" "==>"
striptext $TEMP "("
striptext $TEMP ")"
striptext $TEMP " "
setvar $ADJ[$I] $TEMP

gettext CURRENTLINE $DENS[$I] "==>" "Warps :"
striptext $DENS[$I] ","
striptext $DENS[$I] " "
add $I 1
settextlinetrigger GETSEC :GETSEC "Sector"
pause
:ALLDONE
killtrigger GETSEC
if ($CHECKS > 40)
  goto :MANUAL_STOP
end
gosub :FIRECHK
:LETSLOOK

setvar $W 0
:SUBLOOKY

add $W 1
if ($W > $I)
  goto :ALLDONE
elseif ($DENSITY[$W] <> $DENS[$W])
  setvar $DIFF ($DENSITY[$W] - $DENS[$W])
  if ($DIFF <> 0)
    if ($DENSITYX = TRUE)
      if (($DIFF > 1) and ($DIFF < 40))
        gosub :DO_ACTION
        goto :DTORP_END
      else
        goto :SUBLOOKY
      end
    else
      gosub :DO_ACTION
      goto :DTORP_END
    end
  else
    goto :SUBLOOKY
  end
else
  goto :SUBLOOKY
end
:FIRECHK

setvar $Y 1
send "sz*"
waiton "Relative Density Scan"
add $CHECKS 1
:LOOKY

killtrigger DTOP_DTORP
killtrigger GETSEC
killtrigger ALLDONE
killtrigger DONELOOK
killtrigger MANUAL_STOP
settextlinetrigger DTOP_DTORP :MANUAL_STOP $BOT~BOT_NAME&" foton off"
settextlinetrigger GETSEC :LOOKSEC "Sector"
settexttrigger DONELOOK :DONELOOK "Command [TL="

pause
:LOOKSEC

gettext CURRENTLINE $TEMP "Sector" "==>"
striptext $TEMP "("
striptext $TEMP ")"
striptext $TEMP " "

setvar $ADJSEC[$Y] $TEMP
gettext CURRENTLINE $DENSITY[$Y] "==>" "Warps :"
striptext $DENSITY[$Y] ","
striptext $DENSITY[$Y] " "
add $Y 1
settextlinetrigger GETSEC :LOOKSEC "Sector"
pause
:DONELOOK

killtrigger GETSEC
return
:DTORP_END

killalltriggers
setvar $SWITCHBOARD~MESSAGE "Foton Missle Fired into sector => "&$ADJ[$W]&"*"
gosub :SWITCHBOARD~SWITCHBOARD
gosub :PLAYER~QUIKSTATS
if ($PLAYER~PHOTONS < 1)
  setvar $SWITCHBOARD~MESSAGE "No Photons on Board - Exiting!!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


return
:DO_ACTION
send " c  p  y  " $ADJ[$W] "**q   l " $PLANET~PLANET " * n n * j m * * * j c  *  "
return
:MANUAL_STOP
:DENSITYWAIT

killalltriggers
send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
return
:WAITFORRESTART


settextouttrigger RESTART :RESTART "-"
settexttrigger RESTART2 :RESTART2 "resetpdrop"
pause
:RESTART
:RESTART2
killtrigger RESTART
killtrigger RESTART2
return
:LIFTDEFENDERS



send "'defender mac r ^M ^M ^M f 0^M *"


if ($DEFENDER_KILL = 1)
  setdelaytrigger KILLWAIT :KILLWAIT 400
  pause
  :KILLWAIT
  send "'defender kill*"
end

settextlinetrigger WRONGPROMPT :WRONGPROMPT "Wrong prompt for auto kill"
setdelaytrigger PROMTPW :PROMTPW 500
pause
:WRONGPROMPT
killtrigger WRONGPROMPT
send "'defender kill*"
pause
:PROMTPW

return
:CHECKDEFENDERS


setvar $DEFENDERS 0
send "'defender callout*"


setdelaytrigger DEFWAIT :DEFWAIT 3000
:DEFMORE
settextlinetrigger DEFFOUND :DEFFOUND "Team: defender"
pause
:DEFFOUND
killtrigger DEFFOUND
add $DEFENDERS 1
goto :DEFMORE
:DEFWAIT
killalltriggers

if ($DEFENDERS = 0)
  setvar $SWITCHBOARD~MESSAGE "We need at least one defender in this mode*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  send "'defender ig on*"
  waitfor "Auto IG reset"
  settextlinetrigger IGONE :IGONE "IG on!"
  settextlinetrigger IGTWO :IGTWO "IG was already on"
  pause
  :IGONE
  :IGTWO
  killalltriggers

  send "s"
  setvar $SECFIGS 0
  waitfor "Sector  :"
  settextlinetrigger SCANFIGS :SCANFIGS "Fighters:"
  settextlinetrigger NOFIGS :NOFIGS "Warps to Sector(s) :"
  pause
  :SCANFIGS
  killalltriggers
  getword CURRENTLINE $SECFIGS 2
  striptext $SECFIGS ","
  :NOFIGS
  add $SECFIGS 500
  send "'defender mac f" $SECFIGS "^Mcd*"
  waitfor "Macro Complete"

  setvar $SWITCHBOARD~MESSAGE "We have defenders.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end


return
:RESETDEFENDER
setdelaytrigger QUICKPAUSE :QUICKPAUSE 500
pause
:QUICKPAUSE
killtrigger QUICKPAUSE
gosub :SETDEFENDER

return
:SETDEFENDER


gosub :DISARMPLANET
send "'defender mac l"&$PLANET~PLANET&"^M^M*"
setvar $DEFRESP 0

setdelaytrigger DEFWAITLAND :DEFWAITLAND 3000
:DEFLANDMORE
settextlinetrigger DEFLANDED :DEFLANDED " - Macro Complete"
pause
:DEFLANDED
killtrigger DEFLANDED
add $DEFRESP 1
goto :DEFLANDMORE
:DEFWAITLAND
killalltriggers
if ($DEFRESP < $DEFENDERS)
  setvar $SWITCHBOARD~MESSAGE "We didn't get all defenders landing, aborting!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :ARMPLANET
return
:DISARMPLANET


setvar $CANNONATMOS $PLANET~ATMOSPHERE_CANNON
setvar $MILLEVEL $PLANET~MILITARYREACTION
setvar $SWITCHBOARD~MESSAGE "Disarming planet from Atmos Cannon: "&$CANNONATMOS&" and MR:"&$MILLEVEL&"*"
gosub :SWITCHBOARD~SWITCHBOARD

send "la0*m0*qopc"
waitfor "hould this be a (C)orporate or (P)ersonal planet"

return
:ARMPLANET


setvar $SWITCHBOARD~MESSAGE "Arming planet to Atmos Cannon: "&$CANNONATMOS&" and MR:"&$MILLEVEL&"*"
gosub :SWITCHBOARD~SWITCHBOARD

send "la" $CANNONATMOS "*m" $MILLEVEL "*qocc"
waitfor "<Enter Citadel>"

return
:RESETIGLIFT




send "l" $PLANET~PLANET "*c"
waitfor "<Enter Citadel>"
gosub :PLAYER~QUIKSTATS
return
:LIFTANDCHECKIG

send "i"
settextlinetrigger IGLIFTYES :IGLIFTYES "Interdictor ON : Yes"
settextlinetrigger IGLIFTNO :IGLIFTNO "Interdictor ON : No"
settextlinetrigger IGLIFTNOIG :IGLIFTNOIG "Credits        :"
pause
:IGLIFTNOIG
setvar $SWITCHBOARD~MESSAGE "Ship does not have IG. Exiting.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:IGLIFTNO
killalltriggers
send "q q q * b y l" $PLANET~PLANET "* c "
waitfor "Your Interdictor generator is now ON"
waitfor "<Enter Citadel>"
:IGLIFTYES
killalltriggers

gosub :PLAYER~QUIKSTATS
return
:RETRIEVEFIGS_OLD


gosub :PLAYER~QUIKSTATS






setvar $BOT~COMMAND "movefig"
setvar $BOT~USER_COMMAND_LINE " movefig p "&$DROPFIGQUANT&" "
setvar $BOT~PARM1 "p"
setvar $BOT~PARM2 $DROPFIGQUANT
setvar $BOT~PARM3 ""
setvar $BOT~PARM4 ""
setvar $BOT~PARM5 ""
setvar $BOT~PARM6 ""
setvar $BOT~PARM7 ""
setvar $BOT~PARM8 ""
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3
savevar $BOT~PARM4
savevar $BOT~PARM5
savevar $BOT~PARM6
savevar $BOT~PARM7
savevar $BOT~PARM8
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\movefig.cts"
seteventtrigger MOVEENDED :MOVEENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\resource\movefig.cts"
pause
:MOVEENDED
killalltriggers



return
:SETPLOCKTRIGGERS




killalltriggers
settextlinetrigger 1 :MANUAL "Planet is now in sector "&$DROPSECTOR
settexttrigger 2 :PLOCKFINISHED "Planetary TransWarp Drive shutting down."
settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$DROPSECTOR&": "
settexttrigger 4 :GOLIMPETPLOCK "Limpet mine in "&$DROPSECTOR&" "
settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$DROPSECTOR&" "
settexttrigger 6 :GOPLOCK "Locator beam lost."
if ($PLOCKTIMER > 0)
  setdelaytrigger 7 :PLOCKTIMEREXP $PLOCKTIMER
end
pause
:PLOCKTIMEREXP

killalltriggers
send "n '{" $SWITCHBOARD~BOT_NAME "} - PLOCK Timed Out, Resetting*"
return
:GOARMIDPLOCK
cuttext CURRENTLINE&"    " $CK 1 4
setvar $SPOOF FALSE
if ($CK <> "Your")
  settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$DROPSECTOR&" "
  pause
end
if ($GAME~HASALIENS = TRUE)

  setvar $ALIEN FALSE
  gettext $BOT~ANSI_LAST_ARMID_ATTACK&"[xx][xx][xx]" $ALIEN_CHECK " damage to " "[xx][xx][xx]"
  getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
  if ($POS > 0)
    settexttrigger 5 :GOARMIDPLOCK "Your mines in "&$DROPSECTOR&" "
    pause
  end
end
goto :GOPLOCK
:GOLIMPETPLOCK

cuttext CURRENTLINE&"      " $CK 1 6
setvar $SPOOF FALSE
if ($CK <> "Limpet")
  settexttrigger 4 :GOLIMPETPLOCK "Limpet mine in "&$DROPSECTOR&" "
  pause
end
goto :GOPLOCK
:GOFIGHTERPLOCK
getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
setvar $SPOOF FALSE
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$DROPSECTOR&": "
  pause
end
if ($GAME~HASALIENS = TRUE)
  setvar $ALIEN FALSE
  gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
  getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
  if ($POS > 0)
    settexttrigger 3 :GOFIGHTERPLOCK "Report Sector "&$DROPSECTOR&": "
    pause
  end
end
:GOPLOCK
:MANUAL


killalltriggers
if ($DROPDELAY > 0)
  setdelaytrigger PLOCKDELAY :CONTINUEPLOCK $DROPDELAY
  pause
end
:CONTINUEPLOCK
send "y '{" $SWITCHBOARD~BOT_NAME "} - PLOCK Launched*"
if ($DROPFTRS = TRUE)
  setvar $SEND $SEND&$MOVEFIGMACRO
end
if ($FASTKILL = TRUE)
  setvar $SEND "q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
  send $SEND
end

if ($DEFENDER = 1)
  killalltriggers
  gosub :LIFTDEFENDERS
end
gosub :GETSECTORLOCATION
if ($ATTACKONSIGHT)
  gosub :CHECKFORVICTIMS
end
if ($IGLIFT = 1)
  send "'IGLift Initiated! send reset command to re-enable PDROP (resetpdrop or -)*"
  waitfor "resetpdrop"
  gosub :WAITFORRESTART
end
if ($DEFENDER = 1)
  send "'Defender Initiated! send reset command to re-enable PDROP*"
  gosub :WAITFORRESTART
  gosub :SETDEFENDER
end
if ($DROPFTRS = TRUE)
  gosub :RETRIEVEFIGS
end
send "  s*   "
return
:PLOCKFINISHED
send "  s*   "
setvar $SWITCHBOARD~MESSAGE "PLOCK Sector Cleared*"
gosub :SWITCHBOARD~SWITCHBOARD
return

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/SHIP.ts"
include "include/PLANET.ts"
include "include/COMBAT.ts"
include "include/SECTOR.ts"
