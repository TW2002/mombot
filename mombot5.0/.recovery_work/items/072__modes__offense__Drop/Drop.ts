reqrecording



gosub :BOT~LOADVARS
setvar $BOT~COMMAND "drop"
loadvar $BOT~BOT_TURN_LIMIT
loadvar $MAP~STARDOCK
loadvar $BOT~SUBSPACE
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $SHIP~SHIP_MAX_ATTACK

setvar $BOT~HELP[1] $BOT~TAB&"drop [on | off]{delay}{drop type}{trigger}{return}{kill} "
setvar $BOT~HELP[2] $BOT~TAB&"       "
setvar $BOT~HELP[3] $BOT~TAB&"     If started from command prompt, will be a ship dropper. "
setvar $BOT~HELP[4] $BOT~TAB&"       "
setvar $BOT~HELP[5] $BOT~TAB&"     - [delay]     = delay before dropping in milliseconds   "
setvar $BOT~HELP[6] $BOT~TAB&"     - [drop type] = [d]irect, [a]djacent, [s]urround, "
setvar $BOT~HELP[7] $BOT~TAB&"                     or [da] direct, then adjacent"
setvar $BOT~HELP[8] $BOT~TAB&"     - [delay]     = delay before dropping in milliseconds "
setvar $BOT~HELP[9] $BOT~TAB&"     - [trigger]   = [f]igs, [fm] figs or mines,  "
setvar $BOT~HELP[10] $BOT~TAB&"                     [m]ines, [uf] No-Fig Mines"
setvar $BOT~HELP[11] $BOT~TAB&"     - [return]    = return planet/ship home after 10 seconds"
setvar $BOT~HELP[12] $BOT~TAB&"     - [kill]      = checks for enemy, and kills if possible"
setvar $BOT~HELP[13] $BOT~TAB&"     - [fastkill]  = does kill mac without checking"
setvar $BOT~HELP[14] $BOT~TAB&"     - [holotorp]  = does holotorp command after drop"
setvar $BOT~HELP[15] $BOT~TAB&"     - [holokill]  = does holokill after drop"
setvar $BOT~HELP[16] $BOT~TAB&"         "
setvar $BOT~HELP[17] $BOT~TAB&"     All of these options can be run at the same time."
setvar $BOT~HELP[18] $BOT~TAB&"     - Order of operations are:"
setvar $BOT~HELP[19] $BOT~TAB&"             delay, drop, fastkill, kill,"
setvar $BOT~HELP[20] $BOT~TAB&"             holotorp, holokill, return"

gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Dropper"
gosub :BOT~BANNER

setvar $PLAYER~SAVE TRUE
gosub :COMBAT~INIT

getsectorparameter SECTORS "FIGSEC" $ISFIGGED
setvar $PLAYER~FASTTWARP TRUE


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
  setvar $SWITCHBOARD~MESSAGE "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :PLAYER~QUIKSTATS
gosub :PLAYER~GETINFO
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $ISPLANETDROP FALSE
if ($STARTINGLOCATION = "Citadel")
  setvar $SCRIPT_VER "Mind Over Matter Planet Dropper"
  setvar $ISPLANETDROP TRUE
elseif ($STARTINGLOCATION = "Command")
  setvar $SCRIPT_VER "Mind Over Matter Ship Dropper"
  if ($PLAYER~TWARP_TYPE = "No")
    setvar $SWITCHBOARD~MESSAGE "No twarp available.  Ship dropper is no good without transwarp drive.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $SWITCHBOARD~MESSAGE "This script must be run from the Citadel or Command Prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $BOT~MODE "General"
  savevar $BOT~MODE
  halt
end
if ($BOT~PARM1 <> "on")
  setvar $SWITCHBOARD~MESSAGE "Please use [on/off] {delay} {drop type} {trigger type} {kill} {return}*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "
isnumber $TEST $BOT~PARM2
if ($TEST)
  setvar $DROPDELAY $BOT~PARM2
else
  setvar $DROPDELAY 0
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
          setvar $DROPDESCRIPTION "Direct"
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

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " fastkill "
if ($POS > 0)
  setvar $FASTKILL TRUE
else
  setvar $FASTKILL FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " holokill "
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS2 " hkill "
if (($POS > 0) or ($POS2 > 0))
  setvar $HOLOKILL TRUE
else
  setvar $HOLOKILL FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " holotorp "
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS2 " htorp "
if (($POS > 0) or ($POS2 > 0))
  setvar $HOLOTORP TRUE
  if ($PLAYER~PHOTONS <= 0)
    setvar $SWITCHBOARD~MESSAGE "You can't run holotorp option without photons on your ship.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $HOLOTORP FALSE
end

if (($HOLOKILL = TRUE) or ($HOLOTORP = TRUE))
  if (($PLAYER~SCAN_TYPE = "None") or ($PLAYER~SCAN_TYPE = "Density"))
    setvar $SWITCHBOARD~MESSAGE "You need holoscanner to run the options you've chosen.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
if (($ATTACKONSIGHT = TRUE) or ($FASTKILL = TRUE) or ($HOLOKILL = TRUE))
  if ($PLAYER~FIGHTERS < 100)
    setvar $SWITCHBOARD~MESSAGE "Fighters are waayyy too low for kill option.  You should refill first.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end

gosub :PLAYER~QUIKSTATS
setvar $HOMESECTOR $PLAYER~CURRENT_SECTOR

if ($PLAYER~CORPORATION > 0)
  gosub :GETCORPIES
end
gosub :GETNAME

setvar $DROPSECTOR 0
setvar $ENDLINE "_ENDLINE_"
setvar $STARTLINE "_STARTLINE_"
gosub :SHIP~GETSHIPSTATS




if ($ISPLANETDROP)
  gosub :PLANETSTATS
  setvar $MESSAGE "Planet Dropper Currently Running On Planet "&$PLANET~PLANET&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$DROPDESCRIPTION&" On "&$TRIGGERDESCRIPTION
else
  setvar $MESSAGE "Ship Dropper Currently Running On Ship "&$PLAYER~SHIP_NUMBER&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$DROPDESCRIPTION&" On "&$TRIGGERDESCRIPTION
end

if ($TARGETINGPERSON)
  setvar $MESSAGE $MESSAGE&"*        Targeting: (Player) "&$TARGET
else
  setvar $MESSAGE $MESSAGE&"*        Targeting: Everyone"
end
if (($ISPLANETDROP <> TRUE) and ($PLAYER~TOWED <> ""))
  setvar $MESSAGE $MESSAGE&"*           Towing: "&$PLAYER~TOWED
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
if ($ATTACKONSIGHT)
  if ($ISPLANETDROP)
    setvar $MESSAGE $MESSAGE&"*        Auto Kill: Enabled With "&$PLANET~PLANETFIGHTERS&" Fighters"
  else
    setvar $MESSAGE $MESSAGE&"*        Auto Kill: Enabled With "&$PLAYER~FIGHTERS&" Fighters"
  end
end
if ($FASTKILL)
  setvar $MESSAGE $MESSAGE&"*        Fast Kill: Will attempt kill macro at every pdrop attempt"
end
if ($HOLOTORP)
  setvar $MESSAGE $MESSAGE&"*         Holotorp: Will attempt photoning any adjacent enemies"
end
if ($HOLOKILL)
  setvar $MESSAGE $MESSAGE&"*         Holokill: Will attempt to kill any adjacent enemies"
end
if ($RETURNHOME)
  setvar $MESSAGE $MESSAGE&"*      Return Home: Enabled With "&$RETURNHOMEDELAY&" Second Delay"
end
setvar $MESSAGE $MESSAGE&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
setvar $SWITCHBOARD~MESSAGE $MESSAGE
gosub :SWITCHBOARD~SWITCHBOARD
:STARTTARGETING

gosub :PLAYER~QUIKSTATS
if ($ISPLANETDROP <> TRUE)
  if ($PLAYER~TWARP_TYPE = "No")
    setvar $SWITCHBOARD~MESSAGE "No twarp available.  Possible pod?*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~FIGHTERS <= 0)
    setvar $SWITCHBOARD~MESSAGE "No more fighters available.  Fill up before running.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~ORE_HOLDS <= 10)
    setvar $SWITCHBOARD~MESSAGE "Fuel too low.  Fill back up before running again.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS)
    setvar $SWITCHBOARD~MESSAGE "WARNING: You have "&$PLAYER~ORE_HOLDS&" out of "&$PLAYER~TOTAL_HOLDS&" holds of fuel.  Make sure that's enough!*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
end
killalltriggers
if (($RETURNHOME = TRUE) and (($ISMANUAL <> TRUE) and ($PLAYER~CURRENT_SECTOR <> $HOMESECTOR)))
  setvar $TIMEINMILLI (($RETURNHOMEDELAY * 1000) + 100)
  echo ANSI_6 "*    [" ANSI_14 "Returning Home In " ANSI_15 $RETURNHOMEDELAY ANSI_14 " Seconds" ANSI_6 "]*" ANSI_7
  setdelaytrigger HOMEDELAY :GOHOME $TIMEINMILLI
end
settextlinetrigger MANUAL :MANUALPWARP "Planetary TransWarp Drive Engaged!"
settextlinetrigger MANUAL2 :MANUALTWARP "All Systems Ready, shall we engage? Yes"
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
setvar $ISMANUAL FALSE
if ($ATTACKONSIGHT)
  settextlinetrigger WARPS :SCAN "warps into the sector."
  settextlinetrigger LIFTS :SCAN "lifts off from"
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
if ($ISPLANETDROP)
  echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " paused. To restart, re-enter Citadel Prompt" ANSI_6 "]*" ANSI_7
  settexttrigger RESTART :RESTARTING "Citadel command ("
else
  echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " paused. To restart, re-enter Command Prompt" ANSI_6 "]*" ANSI_7
  settexttrigger RESTART :RESTARTING "Command [TL="
end
pause
:RESTARTING
killalltriggers
echo ANSI_6 "*[" ANSI_14 $SCRIPT_VER " restarted" ANSI_6 "]*" ANSI_7
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
if ($ISPLANETDROP)
  send "p " $HOMESECTOR "*y"
else
  killalltriggers
  setvar $PLAYER~WARPTO $HOMESECTOR
  gosub :PLAYER~TWARP
  if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
    setvar $SWITCHBOARD~MESSAGE "Could not make it back home with twarp. - ["&$PLAYER~MSG&"]*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
goto :STARTTARGETING
:MANUALPWARP
killalltriggers
if ($ATTACKONSIGHT)
  gosub :CHECKFORVICTIMS
end
setvar $ISMANUAL TRUE
goto :STARTTARGETING
:MANUALTWARP
killalltriggers
if ($ATTACKONSIGHT)
  gosub :CHECKFORVICTIMS
end
setvar $ISMANUAL TRUE
goto :STARTTARGETING
:ATTACKSECTORMINE
gosub :VALIDATEMINEHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
goto :GETDROPSECTOR
:ATTACKSECTORLIMPET

gosub :VALIDATELIMPETHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
goto :GETDROPSECTOR
:ATTACKSECTORFIGHTER

gosub :VALIDATEFIGHTERHIT
if ($ISVALID <> TRUE)
  goto :STARTTARGETING
end
:GETDROPSECTOR

if ($DROPDESCRIPTION = "Direct")
  if ($ISPLANETDROP)
    setvar $SEND "p "&$DROPSECTOR&"* y "
    if ($FASTKILL = TRUE)
      setvar $SEND $SEND&"q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
    end
    send $SEND
  else
    killalltriggers
    setvar $PLAYER~WARPTO $DROPSECTOR
    gosub :PLAYER~TWARP
    if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
      setvar $SWITCHBOARD~MESSAGE "Could not make it to attack sector - ["&$PLAYER~MSG&"]*"
      gosub :SWITCHBOARD~SWITCHBOARD
      goto :STARTTARGETING
    end
    if ($FASTKILL = TRUE)
      send "a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n * * "
    end
  end
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR = $DROPSECTOR)
    if ($ATTACKONSIGHT)
      gosub :CHECKFORVICTIMS
    end
  else
    if ($PLANETDROP)
      setsectorparameter $DROPSECTOR "FIGSEC" FALSE
    end
  end
elseif ($DROPDESCRIPTION = "Adjacent")
  gosub :FINDADJACENT
  gosub :ATTEMPTDROP
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  gosub :PLAYER~QUIKSTATS
elseif ($DROPDESCRIPTION = "Adjacent, then Direct")
  gosub :FINDADJACENT
  gosub :ATTEMPTDROP
  if ($PLANETDROP)
    send "p " $DROPSECTOR "* y "
  else
    setvar $PLAYER~WARPTO $DROPSECTOR
    gosub :PLAYER~TWARP
    if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
      goto :PWARPNO
    else
      if ($FASTKILL = TRUE)
        send "a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n * * "
      end
    end
  end
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  gosub :PLAYER~QUIKSTATS
elseif ($DROPDESCRIPTION = "Direct, then Adjacent")
  if ($PLANETDROP)
    setvar $GOTOSECTOR $DROPSECTOR
    send "p " $DROPSECTOR "* y "
  else
    setvar $GOTOSECTOR $DROPSECTOR
    setvar $PLAYER~WARPTO $DROPSECTOR
    gosub :PLAYER~TWARP
    if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
      goto :PWARPNO
    else
      if ($FASTKILL = TRUE)
        send "a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n * * "
      end
    end
  end
  gosub :FINDADJACENT
  gosub :ATTEMPTDROP
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  gosub :PLAYER~QUIKSTATS
elseif ($DROPDESCRIPTION = "Surround")
  gosub :ATTEMPTSURROUNDDROP
  if ($ATTACKONSIGHT)
    gosub :CHECKFORVICTIMS
  end
  gosub :PLAYER~QUIKSTATS
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
  if ($DROPDELAY > 0)
    killalltriggers
    setdelaytrigger DELAY :PLANETDROP $DROPDELAY
    pause
  end
  :PLANETDROP
  setvar $GOTOSECTOR $TARGETSECTORS[$RANDOMTARGET]
  gosub :DOPWARP
end

return
:DOPWARP

killalltriggers
if ($ISPLANETDROP)
  setvar $SEND "p "&$GOTOSECTOR&"*y"
  if ($FASTKILL = TRUE)
    setvar $SEND $SEND&"q q a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n  l "&$PLANET~PLANET&"*  m  *** c  "
  end
  send $SEND
  settextlinetrigger PWARPNO :PWARPNO "You do not have any fighters in Sector "
  settextlinetrigger PWARPYES :PWARPYES " Planetary TransWarp Drive Engaged! "
  settextlinetrigger PWARPALREADYTHERE :PWARPFINISHED "You are already in that sector!"
  pause
else
  killalltriggers
  setvar $PLAYER~WARPTO $GOTOSECTOR
  gosub :PLAYER~TWARP
  if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
    goto :PWARPNO
  end
  if ($FASTKILL = TRUE)
    send "a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n a y y "&$SHIP~SHIP_MAX_ATTACK&"* * z n * * "
  end
  goto :PWARPYES
end
:PWARPNO
killalltriggers
setvar $TARGETSECTORS[$RANDOMTARGET] 0
setsectorparameter $GOTOSECTOR "FIGSEC" FALSE
setvar $I 1
while ($I <= $TARGETCOUNT)
  if ($TARGETSECTORS[$I] > 0)
    setvar $RANDOMTARGET $I
    goto :PLANETDROP
  end
  add $I 1
end
goto :PWARPFINISHED
:PWARPYES
killalltriggers
:PWARPFINISHED
gosub :PLAYER~QUIKSTATS

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


send "q "
gosub :PLAYER~QUIKSTATS
send "*"
waiton "Planet #"
getword CURRENTLINE $PLANET~PLANET 2
waiton "Fighters"
getword CURRENTLINE $PLANET~PLANETFIGHTERS 5
striptext $PLANET~PLANET "#"
send "c"
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
:SCANIT_AGAIN

killalltriggers
gosub :SECTOR~GETSECTORDATA
if ($SECTOR~REALTRADERCOUNT > ($SECTOR~CORPIECOUNT + $SECTOR~DEFENDERSHIPS))
  if ($ISPLANETDROP)
    gosub :COMBAT~FASTCITADELATTACK
  else
    gosub :COMBAT~FASTATTACK
  end
  goto :SCANIT_AGAIN
elseif (($SECTOR~EMPTYSHIPCOUNT > $SECTOR~MYSHIPCOUNT) and ($CAPEMPTYSHIPS = TRUE))
  gosub :COMBAT~FASTCAPTURE
  goto :SCANIT_AGAIN
end
goto :STARTTARGETING
:CHECKFORVICTIMS


gosub :PLAYER~QUIKSTATS
if ($PLAYER~FIGHTERS <= 0)
  goto :GOHOME
end
:SCANIT_AGAIN
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
gosub :SECTOR~GETSECTORDATA
if ($SECTOR~REALTRADERCOUNT > ($SECTOR~CORPIECOUNT + $SECTOR~DEFENDERSHIPS))
  if ($ISPLANETDROP)
    gosub :COMBAT~FASTCITADELATTACK
  else
    gosub :COMBAT~FASTATTACK
  end
  goto :SCANIT_AGAIN
elseif ($SECTOR~EMPTYSHIPCOUNT > $SECTOR~MYSHIPCOUNT)
  gosub :COMBAT~FASTCAPTURE
  goto :SCANIT_AGAIN
end
if ($HOLOTORP)
  setvar $BOT~COMMAND "htorp"
  setvar $BOT~USER_COMMAND_LINE " htorp "
  setvar $BOT~PARM1 ""
  savevar $BOT~PARM1
  savevar $BOT~COMMAND
  savevar $BOT~USER_COMMAND_LINE
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\offense\htorp.cts"
  seteventtrigger HTORPDONE :HTORPDONE "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\offense\htorp.cts"
  pause
  :HTORPDONE
end
if ($HOLOKILL)
  setvar $BEFORE_HOLO_KILL_SECTOR $PLAYER~CURRENT_SECTOR
  gosub :COMBAT~HOLOKILL
  if ($PLAYER~CURRENT_SECTOR <> $BEFORE_HOLO_KILL_SECTOR)
    setvar $PLAYER~WARPTO $BEFORE_HOLO_KILL_SECTOR
    gosub :PLAYER~TWARP
    if (($PLAYER~TWARPSUCCESS = FALSE) and ($PLAYER~MSG <> "Already in that sector!"))
      setvar $SWITCHBOARD~MESSAGE "Could not make it back to starting sector before holokill. - ["&$PLAYER~MSG&"]*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end
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

# includes:
include "include/BOT.ts"
include "include/COMBAT.ts"
include "include/PLAYER.ts"
include "include/SHIP.ts"
include "include/SECTOR.ts"
