reqrecording
logging "OFF"
gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"Bwarp Photon"
setvar $BOT~HELP[2] $BOT~TAB&"Uses planet teleport-pad to arrive adjacent a fighter"
setvar $BOT~HELP[3] $BOT~TAB&"hit; Launches a photon, returns, and lands"
setvar $BOT~HELP[4] $BOT~TAB&"         "
setvar $BOT~HELP[5] $BOT~TAB&"Options: "
setvar $BOT~HELP[6] $BOT~TAB&"    {scrub sector} - use this if you want to scrub somewhere other"
setvar $BOT~HELP[7] $BOT~TAB&"                     than your starting sector"
setvar $BOT~HELP[8] $BOT~TAB&"            {holo) - holoscan after photon     "
setvar $BOT~HELP[9] $BOT~TAB&"         {dens)ity - density scan after photon     "
setvar $BOT~HELP[10] $BOT~TAB&"           {mine)s - trigger on mine hits too"
setvar $BOT~HELP[11] $BOT~TAB&"           "
setvar $BOT~HELP[12] $BOT~TAB&"  Usage:     "
setvar $BOT~HELP[13] $BOT~TAB&"     >boton holo"
setvar $BOT~HELP[14] $BOT~TAB&"     >boton 1234 dens"
setvar $BOT~HELP[15] $BOT~TAB&"     >boton h mine "
setvar $BOT~HELP[16] $BOT~TAB&"     >boton "


gosub :BOT~HELP_FILE

setvar $TAGLINE "LoneStar's BWARP PHOTON"
setvar $TAGLINEB "[LSBOTON]"
setvar $CURENT_VERSION "1.3"
setvar $TAGLINEC "[LSBOTON v"&$CURENT_VERSION&"]"

setvar $HIT_SECTOR 0
setvar $IDX 11
setvar $START_SECTOR 0

setvar $PLANET~PLANET 0
setvar $PLANET_LEVEL 0
setvar $PLANET~PLANET_FUEL 0
setvar $PLANET~PLANET_FUEL_MIN 100
setvar $PLANET_FIG 0
setvar $PLANET~PLANET_TPAD 0
setvar $ORE_TOLERANCE $PLANET~PLANET_FUEL_MIN

setvar $FIREPHOTON TRUE
setvar $ALIENS FALSE
setvar $AUTO_RETURN TRUE

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " holo "

if ($POS > 0)
  setvar $HOLO_SCAN TRUE
  setvar $DEN_SCAN FALSE
else
  setvar $HOLO_SCAN FALSE
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " dens "
if ($POS > 0)
  setvar $DEN_SCAN TRUE
  setvar $HOLO_SCAN FALSE
else
  setvar $DEN_SCAN FALSE
end
setvar $CONTINUOUS TRUE
setvar $TURN_LIMIT $BOT~BOT_TURN_LIMIT
setvar $MINE_REACTION "None"

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " mine "
if ($POS > 0)
  setvar $MINE_REACTION "Armids/Limps"
else
  setvar $MINE_REACTION "None"
end

setvar $UNLIM $PLAYER~UNLIMITEDGAME
setvar $CREDIT_LIMIT 50000
setvar $CREDITS_ON_HAND 10000
setvar $CREDITS_WITHDRAW 200000

setarray $FIGS SECTORS
setarray $SECTS SECTORS 5
setarray $HOLOOUTPUT 1000

isnumber $TST $BOT~PARM1
if ($TST = 0)
  setvar $SCRUB_SECT 0
else
  setvar $SCRUB_SECT $BOT~PARM1
end

setvar $SWITCHBOARD~MESSAGE $TAGLINE&" v"&$CURENT_VERSION&" - Loading...*"
gosub :SWITCHBOARD~SWITCHBOARD

gosub :PLAYER~QUIKSTATS
gosub :GOOD_TO_GO
:FIRE_IN_THE_HOLE


setvar $SUFFIX ""
if ($AUTO_RETURN)
  if ($SCRUB_SECT = 0)
    setvar $SUFFIX " M "&$START_SECTOR&"*  Y  Y  *  L Z"&#8&$PLANET~PLANET&"*  *  J  C  *  "
  else
    setvar $SUFFIX " M "&$SCRUB_SECT&"*  Y  Y  *  J  *  "
  end
end

gosub :READ_IN_FIGS
gosub :MSGS_ON
gosub :PLAYER~QUIKSTATS

if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS)
  setvar $SWITCHBOARD~MESSAGE "Ship Holds Are Not Full of ORE.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if (($SCRUB_SECT <> 0) and $AUTO_RETURN)

  settexttrigger SECTOR_IS_GOOD :SECTOR_IS_GOOD "All Systems Ready, shall we engage?"
  settexttrigger SECTOR_IS_BAD1 :SECTOR_IS_BAD "Do you want to make this transport blind"
  settextlinetrigger SECTOR_IS_BAD2 :SECTOR_IS_BAD "This planetary transporter does not have the range."
  settextlinetrigger SECTOR_IS_BAD3 :SECTOR_IS_BAD "This planet does not have enough Fuel Ore to transport you."
  send "B"&$SCRUB_SECT&"*N*  "
  pause
  :SECTOR_IS_BAD
  killalltriggers
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" - Cannot Obtain Fighter Lock On Scrub Sector. Halting!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :SECTOR_IS_GOOD
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" - Scrub Sector Is Good!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  killalltriggers
end
:DISP_BANNER
if ($FIREPHOTON)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEC&" Running From Planet #"&$PLANET~PLANET&", with "&$PLAYER~PHOTONS&" Photons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $SWITCHBOARD~MESSAGE $TAGLINEC&" Running From Planet #"&$PLANET~PLANET&", Not Firing A Photon.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
:INAC
killalltriggers
send #27
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
setdelaytrigger BANNER :BANNER 350000
settexttrigger BWARP_BLIND :BWARP_BLIND "Do you want to make this transport blind"
settexttrigger BWARP_GO :BWARP_GO "All Systems Ready, shall we engage?"
settextlinetrigger BWARP_MISS :BWARP_MISS "Computer command [TL="
settextlinetrigger GOTEM :GOTEM "Photon Missile launched into sector"
settextlinetrigger WRONG :WRONG "That is not an adjacent sector"
:AGAIN

if ($ALIENS)
  settextlinetrigger FIGHIT_A :FIGHIT_A "Deployed Fighters Report Sector"
else
  settextlinetrigger FIGHIT :FIGHIT "Deployed Fighters Report Sector"
end

settextlinetrigger INAC :INAC "Session termination is imminent."

if (($MINE_REACTION = "Armids") or ($MINE_REACTION = "Armids/Limps"))
  if ($ALIENS)
    settextlinetrigger MINES_A :MINES_A "Your mines in"
  else
    settextlinetrigger MINES :MINES "Your mines in"
  end
end
if (($MINE_REACTION = "Limps") or ($MINE_REACTION = "Armids/Limps"))
  settextlinetrigger LIMP :LIMP "Limpet mine in"
end
pause
:BANNER
killalltriggers
goto :DISP_BANNER
:DISCOD
killalltriggers
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Disconnected **"
:DISCO_TEST
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
  pause
  :EMANCIPATE_CPU
  goto :DISCO_TEST
end
waitfor "(?="
setdelaytrigger WAITINGABIT :WAITINGABIT 3000
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Connected - Waiting For Command Prompt!**"
pause
:WAITINGABIT
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Command")
  send " L Z"&#8&$PLANET~PLANET&"*  *  J  C  *  "
  settextlinetrigger NOTLANDED :NOTLANDED "Are you sure you want to jettison all cargo?"
  settextlinetrigger LANDED :LANDED "<Enter Citadel>"
  setdelaytrigger TESTCONN :TESTCONN 3000
  pause
  :TESTCONN
  killalltriggers
  if (CONNECTED = FALSE)
    goto :DISCO_TEST
  else
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Problem Detected Unable to Land!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  :NOTLANDED
  killalltriggers
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" - Unable To Land After Reconnect,Check My TA!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :LANDED
  killalltriggers
  setvar $SWITCHBOARD~SELF_COMMAND FALSE
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" - Restarting!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  waitfor "Message sent on sub-space channel"
  goto :INAC
elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
  setvar $SWITCHBOARD~SELF_COMMAND FALSE
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" - Restarting!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  waitfor "Message sent on sub-space channel"
  goto :INAC
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$TAGLINEB&"Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :EMQ_DELAY
  killalltriggers
  goto :DISCO_TEST
end
:MINES
killtrigger INAC
killtrigger FIGHIT
killtrigger LIMP
killtrigger MINES
killtrigger FIGHIT_A
getword CURRENTLINE $CK 1
if ($CK <> "Your")
  goto :AGAIN
end
getword CURRENTLINE $HIT_SECTOR 4
goto :PWARP_GO
:MINES_A
killtrigger MINES_A
killtrigger FIGHIT_A
killtrigger INAC
killtrigger LIMP
getword CURRENTLINE $HIT_SECTOR 4
getword CURRENTANSILINE $ANSI 9
cuttext $ANSI $NUM 10 2
striptext $HIT_SECTOR ":"
if ($NUM <> 33)
  goto :PWARP_GO
else
  goto :AGAIN
end
:LIMP
killtrigger FIGHIT_A
killtrigger MINES_A
killtrigger INAC
killtrigger LIMP
killtrigger FIGHIT
killtrigger MINES
getword CURRENTLINE $CK 1
if ($CK <> "Limpet")
  goto :AGAIN
end
getword CURRENTLINE $HIT_SECTOR 4
goto :PWARP_GO
:FIGHIT_A
killtrigger INAC
killtrigger MINES_A
killtrigger FIGHIT_A
killtrigger LIMP
getword CURRENTLINE $HIT_SECTOR 5
getword CURRENTANSILINE $ANSI 6
cuttext $ANSI $NUM 10 2
striptext $HIT_SECTOR ":"
isnumber $TST $HIT_SECTOR
if (($NUM <> 33) and ($TST <> 0))
  goto :PWARP_GO
else
  goto :AGAIN
end
:FIGHIT
killtrigger INAC
killtrigger MINES
killtrigger LIMP
killtrigger FIGHIT
getword CURRENTLINE $CK 1
if ($CK <> "Deployed")
  goto :AGAIN
end
getword CURRENTLINE $HIT_SECTOR 5
striptext $HIT_SECTOR ":"
isnumber $TST $HIT_SECTOR
if ($TST = 0)
  goto :AGAIN
end
:PWARP_GO
setvar $LAUNCH_FROM $SECTS[$HIT_SECTOR]
if ($LAUNCH_FROM <> 0)
  send " B "&$LAUNCH_FROM&"*  C  Q  "
  pause
else
  goto :AGAIN
end
:BWARP_BLIND
killalltriggers
send " N "
gosub :CLEAR_SECTOR
killalltriggers
goto :INAC
:BWARP_MISS
killalltriggers
gosub :CLEAR_SECTOR
goto :INAC
:BWARP_GO
killtrigger BWARP_MISS
killtrigger BWARP_BLIND
killtrigger BWARP_GO
if ($FIREPHOTON)
  send "y  *  c  p  y  "&$HIT_SECTOR&"**Q"
  pause
else
  send "y  *  "
  goto :GOTEM_WITH_NO_PHOTON
end
:GOTEM
killalltriggers
getword CURRENTLINE $CK 1
if ($CK <> "Photon")
  goto :INAC
end
:GOTEM_WITH_NO_PHOTON
if ($HOLO_SCAN)
  gosub :DOSCAN
elseif ($DEN_SCAN)
  gosub :DOSCAN_DEN
end

if ($AUTO_RETURN)
  if ($SCRUB_SECT <> 0)
    if ($FIREPHOTON)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" FIRED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&"* "
      gosub :SWITCHBOARD~SWITCHBOARD
      send $SUFFIX
    else
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" TRIGGERED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&"* "
      gosub :SWITCHBOARD~SWITCHBOARD
      send $SUFFIX
    end
    settexttrigger RETURNEDSAFE :RETURNEDSAFE "Are you sure you want to jettison all cargo"
    setdelaytrigger NOTSAFE2 :WHATSUP 4000
    pause
    :RETURNEDSAFE
    killalltriggers
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_SECTOR <> $SCRUB_SECT)
      setvar $WEREHERE $PLAYER~CURRENT_SECTOR
      gosub :CALL_SAVE_ME
      halt
    end
    gosub :SPIT_IT_OUT
    halt
  else
    if ($FIREPHOTON)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" FIRED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&"* "
      gosub :SWITCHBOARD~SWITCHBOARD
      send $SUFFIX
    else
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" TRIGGERED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&"* "
      gosub :SWITCHBOARD~SWITCHBOARD
      send $SUFFIX
    end
    settextlinetrigger LANDED :DOSCAN_LANDED "Enter Citadel"
    settexttrigger NOTLANDED :DOSCAN_NOTLANDED "Are you sure you want to jettison all cargo"
    setdelaytrigger WHATSUP :WHATSUP 4000
    pause
    :WHATSUP
    killalltriggers
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_PROMPT <> "Command")
      send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$TAGLINEB&" Attempting To Reach Correct Prompt...*"
      settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting To Reach Correct Prompt..."
      setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
      pause
      :EMQ_DELAY
      killalltriggers
    end
    setvar $WEREHERE CURRENTSECTOR
    gosub :CALL_SAVE_ME
    halt
    :DOSCAN_NOTLANDED
    killalltriggers
    settexttrigger WHEREAREWE :WHEREAREWE "(?="
    send "   *   "
    pause
    :WHEREAREWE
    gettext CURRENTLINE $WEREHERE "]:[" "] (?=He"
    isnumber $TST $WEREHERE
    if ($TST = 0)
      setvar $WEREHERE 0
    end
    if ($WEREHERE <> $START_SECTOR)
      gosub :CALL_SAVE_ME
    else
      gosub :SPIT_IT_OUT
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Planet #"&$PLANET~PLANET&" Not In Sector, Halting!!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    halt
    :DOSCAN_LANDED
    killalltriggers
  end
else

  if ($FIREPHOTON)
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" FIRED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&", Halting!!*"
    gosub :SWITCHBOARD~SWITCHBOARD
  else
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" TRIGGERED "&$LAUNCH_FROM&"->"&$HIT_SECTOR&", Halting!!*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
  gosub :SPIT_IT_OUT
  halt
end

gosub :SPIT_IT_OUT
gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send " Q "
  gosub :PLANET~GETPLANETINFO
  send "T N L 2* T N L 3* T N T 1* C "
  if ($PLANET~PLANET_FUEL < $ORE_TOLERANCE)
    setvar $CASHAMOUNT $PLANET~PLANET_FUEL
    gosub :COMMASIZE
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Planet ORE at "&$CASHAMOUNT&", Stopping*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" At Wrong Prompt. Should be in the Citadel!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($CONTINUOUS)
  if ($PLAYER~PHOTONS = 0)
    gosub :WITHDRAW_CASH
    if ($LOOT < $CREDIT_LIMIT)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Not Enough Cash To Furb - Halting!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end

    gosub :BUY_FOTONS
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~PHOTONS = 0)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" No Photons Furb'd - Halting!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    if ($PLAYER~CREDITS > $CREDITS_ON_HAND)
      send " TT"&($PLAYER~CREDITS - $CREDITS_ON_HAND)&"*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
  end
  gosub :PLAYER~QUIKSTATS
  if ($UNLIM = 0)
    if ($PLAYER~TURNS <= $TURN_LIMIT)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Turn Limit Reached. Halting!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end

  if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS)
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Ship Holds Not Full Of ORE - Halting!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  goto :DISP_BANNER
end
halt
:WRONG

killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Citadel")

elseif ($PLAYER~CURRENT_PROMPT = "Command")
  if ($PLAYER~CURRENT_SECTOR <> $START_SECTOR)
    setvar $WEREHERE $PLAYER~CURRENT_SECTOR
    gosub :CALL_SAVE_ME
    halt
  else
    send " L Z"&#8&$PLANET~PLANET&"*  *  J  C  *  ^ Q "
    waitfor ": ENDINTERROG"
    gosub :PLAYER~QUIKSTATS
    if ($PLAYER~CURRENT_PROMPT <> "Citadel")
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" At Wrong Prompt. Should be in the Citadel!**"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end

  send "  Q  "
  gosub :PLANET~GETPLANETINFO
  send "T  N  L  2*  T  N  L  3*  T  N  T  1*  C  "

  if ($UNLIM = 0)
    if ($PLAYER~TURNS <= $TURN_LIMIT)
      setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Turn Limit Reached. Halting!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end


  if ($PLANET~PLANET_FUEL < $ORE_TOLERANCE)
    setvar $CASHAMOUNT $PLANET~PLANET_FUEL
    gosub :COMMASIZE
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Planet ORE at "&$CASHAMOUNT&", Stopping*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~PHOTONS = 0)
    setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Out Of Photons, Stopping!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" At Wrong Prompt. Should be in the Citadel!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
goto :INAC
halt
:ALIENS_CHECK




settextlinetrigger ALIENS :ALIENRACEFOUND "are on the move"
settexttrigger NADDA :NADDA "(?="
send "#"
waitfor "Who's Playing"
pause
:ALIENRACEFOUND
killalltriggers
setvar $ALIENS TRUE
return
:NADDA
killalltriggers
setvar $ALIENS FALSE
return
:CALL_SAVE_ME

settexttrigger FRIENDLYPLANET :FRIENDLYPLANET "Saveme script activated - Planet "
setdelaytrigger TIMEOUT :TIMEOUT 30000
send "'"&$WEREHERE&"=saveme* F Z 1 * Z C D * "
pause
:TIMEOUT
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" 30 seconds after save call, script halted.**"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:FRIENDLYPLANET
killalltriggers
gettext CURRENTLINE $PLANET "Saveme script activated - Planet " " to "
send "L "&$PLANET&"* C 'I landed on planet "&$PLANET&"* * "
halt
return
:GOOD_TO_GO

if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Must Start From The Citadel**"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ((STARDOCK = "") or (STARDOCK = 0))
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" StarDock Not In TWX DBase!**"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($PLAYER~PHOTONS <= 0)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Ship is out of photons, shutting down.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  setvar $FIREPHOTON TRUE
end

setvar $START_SECTOR $PLAYER~CURRENT_SECTOR


if ($PLAYER~CREDITS > $CREDITS_ON_HAND)
  send "TT"&($PLAYER~CREDITS - $CREDITS_ON_HAND)&"*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
send "q "
gosub :PLANET~GETPLANETINFO
send "c "
if ($PLANET~PLANET_TPAD = 0)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Planet Does Not Appear To Have Transport Pad*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($PLANET~PLANET = 0)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Obtain Planet Number.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($PLANET~PLANET_FUEL < $PLANET~PLANET_FUEL_MIN)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Planet Has Too Little Fuel ORE*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send " cn"
settextlinetrigger CN1 :CN1 " ANSI graphics            - Off"
settextlinetrigger CN2 :CN2 " Animation display        - On"
settextlinetrigger CN9 :CN9 " Abort display on keys    - ALL KEYS"
settextlinetrigger CNA :CNA " Message Display Mode     - Long"
settextlinetrigger CNB :CNB " Screen Pauses            - Yes"
settextlinetrigger CNC :CNC " Online Auto Flee         - On"
settexttrigger CND :CND "Settings command (?=Help)"
pause
:CN1

killtrigger CN1
setvar $CN1 TRUE
pause
:CN2
killtrigger CN2
setvar $CN2 TRUE
pause
:CN9
killtrigger CN9
setvar $CN9 TRUE
pause
:CNA
killtrigger CNA
setvar $CNA TRUE
pause
:CNB
killtrigger CNB
setvar $CNB TRUE
pause
:CNC
killtrigger CNC
setvar $CNC TRUE
pause
:CND
killalltriggers
setvar $STR ""
if ($CN1)
  setvar $STR $STR&1
end
if ($CN2)
  setvar $STR $STR&2
end
if ($CN9)
  setvar $STR $STR&9
end
if ($CNA)
  setvar $STR $STR&"A"
end
if ($CNB)
  setvar $STR $STR&"B"
end
if ($CNC)
  setvar $STR $STR&"C"
end

send $STR&" q q "
waitfor "Citadel command (?="
send " SZ*  Q  T  N  L  1*  T  N  L  2*  T  N  L  3*  T  N  T  1*  C  C  U  Y  V  0*  Y  Y  Q"
waitfor "<Computer deactivated>"
waitfor "Citadel command (?="

if ((SECTOR.FIGS.OWNER[$START_SECTOR] <> "belong to your Corp") and (SECTOR.FIGS.OWNER[$START_SECTOR] <> "yours"))
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Must Have Friendly Fighter(s) Deployed In Start Sector!!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return
:READ_IN_FIGS

echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Reading Sector Parameters & Building Arrays...**"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $IDX 11

while ($IDX <= SECTORS)
  getsectorparameter $IDX "FIGSEC" $FLAG
  isnumber $TST $FLAG
  if ($TST <> 0)
    if ($FLAG > 0)
      setvar $FIGS[$IDX] 1
    end
  end
  add $IDX 1
end

setvar $IDX 11
setvar $FCNT 0

while ($IDX <= SECTORS)
  setvar $I 1
  setvar $PTR 1
  while ($I <= SECTOR.WARPCOUNT[$IDX])
    setvar $ADJ SECTOR.WARPS[$IDX][$I]
    if (($FIGS[$ADJ] <> 0) and ($PTR <= 5))
      if ($PTR = 1)
        setvar $SECTS[$IDX] $ADJ
        add $FCNT 1
      else
        setvar $SECTS[$IDX][$PTR] $ADJ
      end
      add $PTR 1
    end
    add $I 1
  end
  add $IDX 1
end

if ($FCNT = 0)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" No Deployed Fighter Data Located. Update FIG List!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

return
:CLEAR_SECTOR


if ($LAUNCH_FROM <> 0)
  setvar $PTR $SECTS[$LAUNCH_FROM]
  setvar $J 1
  while ($J <= 5)
    if ($PTR <> 0)
      setvar $I 1
      while ($I < 5)
        if (($SECTS[$PTR][$I] = $LAUNCH_FROM) or ($SECTS[$PTR][$I] = 0))
          if ($I = 1)
            setvar $SECTS[$PTR] $SECTS[$PTR][$I]
            setvar $SECTS[$PTR][$I] 0
          else
            setvar $SECTS[$PTR][$I] $SECTS[$PTR][($I + 1)]
            setvar $SECTS[$PTR][($I + 1)] 0
          end
        end
        add $I 1
      end
    end
    setvar $PTR $SECTS[$LAUNCH_FROM][$J]
    add $J 1
  end
  setvar $SECTS[$LAUNCH_FROM] 0
  setvar $SECTS[$LAUNCH_FROM][1] 0
  setvar $SECTS[$LAUNCH_FROM][2] 0
  setvar $SECTS[$LAUNCH_FROM][3] 0
  setvar $SECTS[$LAUNCH_FROM][4] 0
  setvar $SECTS[$LAUNCH_FROM][5] 0
end
return
:DOSCAN_DEN

setvar $LINE_POINTER 1
send "  S  D*  J  *  "
waitfor "-------------------------------------------"
settexttrigger DONESCAN_D :DONESCAN_D "Command [TL="
settexttrigger END_OF_LINES_D :END_OF_LINES_D "Are you sure you want to jettison all cargo"
:RESET_TRIGGER_D
settextlinetrigger LINE :LINE_D
pause
:LINE_D
setvar $SCAN_LINE_D CURRENTLINE
if (($SCAN_LINE_D = "") or ($SCAN_LINE_D = 0))
  goto :RESET_TRIGGER_D
end
if ($LINE_POINTER <= 1000)
  replacetext $SCAN_LINE_D " ==>    " " => "
  replacetext $SCAN_LINE_D "  Warps : " "  Warps: "
  replacetext $SCAN_LINE_D "   NavHaz :   " " Haz: "
  replacetext $SCAN_LINE_D "  Anom : " " Anom: "
  setvar $HOLOOUTPUT[$LINE_POINTER] $SCAN_LINE_D
  add $LINE_POINTER 1
end
goto :RESET_TRIGGER_D
:END_OF_LINES_D

killtrigger LINE_D
setvar $HOLOOUTPUT[$LINE_POINTER] "ENDENDENDENDENDENDEND"
pause
:DONESCAN_D
killalltriggers
return
:DOSCAN

setvar $LINE_POINTER 1
send " S H*  J  *  "
settextlinetrigger DONESCAN :DONESCAN "Warps to Sector(s) :"
settextlinetrigger NOSCAN :NOSCAN "Handle which mine type, 1 Armid or 2 Limpet"
settexttrigger END_OF_LINES :END_OF_LINES "Are you sure you want to jettison all cargo"
:RESET_TRIGGER
settextlinetrigger LINE :LINE
pause
:LINE
setvar $HOLOOUTPUT[$LINE_POINTER] CURRENTLINE
if ($LINE_POINTER <= 1000)
  add $LINE_POINTER 1
end
goto :RESET_TRIGGER
:DONESCAN

killtrigger LINE
setvar $HOLOOUTPUT[$LINE_POINTER] "ENDENDENDENDENDENDEND"
pause
:NOSCAN
killalltriggers

halt
:END_OF_LINES
killalltriggers
return
:COMMASIZE

if ($CASHAMOUNT < 1000)

elseif ($CASHAMOUNT < 1000000)
  getlength $CASHAMOUNT $LEN
  setvar $LEN ($LEN - 3)
  cuttext $CASHAMOUNT $TMP 1 $LEN
  cuttext $CASHAMOUNT $TMP1 ($LEN + 1) 999
  setvar $TMP $TMP&","&$TMP1
  setvar $CASHAMOUNT $TMP
elseif ($CASHAMOUNT <= 999999999)
  getlength $CASHAMOUNT $LEN
  setvar $LEN ($LEN - 6)
  cuttext $CASHAMOUNT $TMP 1 $LEN
  setvar $TMP $TMP&","
  cuttext $CASHAMOUNT $TMP1 ($LEN + 1) 3
  setvar $TMP $TMP&$TMP1&","
  cuttext $CASHAMOUNT $TMP1 ($LEN + 4) 999
  setvar $TMP $TMP&$TMP1
  setvar $CASHAMOUNT $TMP
end
return
:MSGS_ON
:ON_AGAIN

settexttrigger ONMSGS_ON :ONMSGS_ON "Displaying all messages."
settexttrigger ONMSGS_OFF :ONMSGS_OFF "Silencing all messages."
send "|"
pause
:ONMSGS_OFF
killalltriggers
goto :ON_AGAIN
:ONMSGS_ON
killalltriggers
return
:SPIT_IT_OUT

if ($LINE_POINTER > 0)
  if ($HOLO_SCAN)
    setvar $I 1
    send "'*"
    send "{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" -------- Sector Scan From "&$LAUNCH_FROM&" ---------*"
    while ($I < $LINE_POINTER)
      getwordpos $HOLOOUTPUT[$I] $POS "Sector  : "&$HIT_SECTOR
      if ($POS <> 0)
        while ($I < $LINE_POINTER)
          getwordpos $HOLOOUTPUT[$I] $POS "Warps to Sector(s) :"
          if (($HOLOOUTPUT[$I] = "") or ($POS <> 0))
            send "     **"
            goto :DONE_SCN
          end
          send $HOLOOUTPUT[$I]&"*"
          add $I 1
        end
      end
      add $I 1
    end
    :DONE_SCN
  elseif ($DEN_SCAN)
    setvar $I 1
    send "'*"
    send "{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" ------- Sector Density Scan From "&$LAUNCH_FROM&" --------*"
    while ($I < $LINE_POINTER)
      getwordpos $HOLOOUTPUT[$I] $POS "Command [TL="
      if ($POS = 0)
        send $HOLOOUTPUT[$I]&"*"
      else
        send "    **"
        goto :DONE_SCN_D
      end
      add $I 1
    end
    :DONE_SCN_D
  end
end
return
:BUY_FOTONS


killalltriggers
if ($PLAYER~ALIGNMENT < 1000)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - Alignment's Below 1,000!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

settextlinetrigger DONEBURST :DONEBURST ": ENDINTERROG"

send " C V O* Y N "&STARDOCK&"* V 0* Y N "&$START_SECTOR&"* U Y Q* ^F"&$PLAYER~CURRENT_SECTOR&"*"&STARDOCK&"*F"&STARDOCK&"*"&$PLAYER~CURRENT_SECTOR&"*Q"
pause
:DONEBURST
killalltriggers

setdelaytrigger WAIT_A_BIT :WAIT_A_BIT 1000
pause
:WAIT_A_BIT
killalltriggers

getdistance $DIST $PLAYER~CURRENT_SECTOR STARDOCK
if ($PLANET~PLANET_TPAD < $DIST)
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - StarDock Is Out Of Range Of T-Pad!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getdistance $DIST STARDOCK $PLAYER~CURRENT_SECTOR
if ($DIST > ($PLAYER~ORE_HOLDS / 3))
  setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - Not Enough Gas For Return Trip!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

settextlinetrigger ITSALIVE :BUY_FOTONS_ITSALIVE "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOSOUPFORME :BUY_FOTONS_NOSOUPFORME "I have no information about a port in that sector"
setdelaytrigger WEHAVEAPROB :BUY_FOTONS_WEHAVEAPROB 3000
send "CR"&STARDOCK&"*Q "
waitfor "Computer command [TL"
pause
:BUY_FOTONS_WEHAVEAPROB
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - Problem Comfirming StarDock's Alive (Timed Out)!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_NOSOUPFORME
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - StarDock Appears To Have Been Blown!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_ITSALIVE
killalltriggers

gosub :PLAYER~QUIKSTATS

settexttrigger BUY_FOTONS_BLIND :BUY_FOTONS_BLIND "Do you want to make this transport blind"
settexttrigger BUY_FOTONS_GO :BUY_FOTONS_GO "All Systems Ready, shall we engage?"
settextlinetrigger BUY_FOTONS_MISS :BUY_FOTONS_MISS "Computer command [TL="
send " B "&STARDOCK&"* C Q "
pause
:BUY_FOTONS_BLIND
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - Unable To Obtain B-Warp Lock!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_MISS
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Furb - Unable To B-Warp. Planet ORE May Be Low!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_GO
killalltriggers
send " Y  P  SGYGQHP"
waitfor "How many Photon Missiles do you want"
gettext CURRENTLINE $LETS_BUY "(Max " ")"
send $LETS_BUY "*"

settexttrigger BUY_FOTONSTWARP_LOCK :BUY_FOTONSTWARP_LOCK "All Systems Ready, shall we engage"
settexttrigger BUY_FOTONSNO_TWRP_LOCK :BUY_FOTONSNO_TWARP_LOCK "Do you want to make this jump blind"
send "Q  Q  Q  Z  N  *  M"&$START_SECTOR&"* Y "
pause
:BUY_FOTONSNO_TWARP_LOCK
killalltriggers
send " N  *  P  SGYG"
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Return, Blind Warp Averted Hiding On Dock!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONSTWARP_LOCK
killalltriggers
send " Y *  *  L Z"&#8&$PLANET~PLANET&"*  * JC*"
gosub :SWITCHBOARD~SWITCHBOARD
settextlinetrigger BUY_FOTONS_NOTLANDED1 :BUY_FOTONS_NOTLANDED1 "Are you sure you want to jettison all cargo?"
setdelaytrigger BUY_FOTONS_NOTLANDED2 :BUY_FOTONS_NOTLANDED2 4000
settextlinetrigger BUY_FOTONS_LANDED :BUY_FOTONS_LANDED "<Enter Citadel>"
pause
:BUY_FOTONS_NOTLANDED1
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Not Landed. Planet "&$PLANET~PLANET&", Not Found!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_NOTLANDED2
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Return Trip Timed Out - Check My TA!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:BUY_FOTONS_LANDED
killalltriggers
send "Q T N T 1* * C"
return
:WITHDRAW_CASH

setvar $LOOT 0
settextlinetrigger TREASURY :TREASURY "Citadel treasury contains"
setdelaytrigger TELLERS_ON_A_SMOKEBREAK :TELLERS_ON_A_SMOKEBREAK 3000
send "  D"
pause
:TELLERS_ON_A_SMOKEBREAK
killalltriggers
setvar $SWITCHBOARD~MESSAGE $TAGLINEB&" Unable To Take Cash From Citadel, Halting!*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:TREASURY
killalltriggers
gettext CURRENTLINE $LOOT "contains" "credits."
striptext $LOOT ","
striptext $LOOT " "
if ($LOOT > $CREDITS_WITHDRAW)
  setvar $LOOT $CREDITS_WITHDRAW
end
send "TF"&$LOOT&"*"
return

# includes:
include "source\include\BOT"
include "source\include\PLAYER"
include "source\include\VALIDATION"
include "source\include\SWITCHBOARD"
include "source\include\PLANET"
