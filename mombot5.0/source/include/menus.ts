:MENUS~PREFERENCESMENU

gosub :BOT~ENTER_MENU_DEAF
gosub :BOT~KILLTHETRIGGERS
gosub :BOT~LOAD_WATCHER_VARIABLES
gosub :BOT~LOAD_THE_VARIABLES
setarray $MENUS~H 31
setarray $MENUS~QSS 31
setarray $MENUS~QSS_VAR 100
:MENUS~REFRESHPREFERENCESMENU

setvar $MENUS~H[2] "                 "
setvar $MENUS~H[3] "Bot Name         "
setvar $MENUS~H[4] "Login Password   "
setvar $MENUS~H[5] "Bot Password     "
setvar $MENUS~H[6] "Figs to drop:         "
setvar $MENUS~H[7] "Limps to drop:        "
setvar $MENUS~H[8] "Armids to drop:       "
setvar $MENUS~H[9] "Avoid Planets?        "
setvar $MENUS~H[10] "Auto Kill Mode?       "
setvar $MENUS~H[11] "Max Attack:      "
setvar $MENUS~H[12] "Offensive Odds:  "
setvar $MENUS~H[13] "Stardock         (S)  "
setvar $MENUS~H[14] "Rylos            (R)  "
setvar $MENUS~H[15] "Alpha            (A)  "
setvar $MENUS~H[16] "Home Sector      (H)  "
setvar $MENUS~H[17] "Max Fighters:    "
setvar $MENUS~H[18] "Login Name:      "
setvar $MENUS~H[19] "Surround type?        "
setvar $MENUS~H[20] "Turn Limit:      "
setvar $MENUS~H[21] "Game Letter:     "
setvar $MENUS~H[22] "Safe Ship:       (X)  "
setvar $MENUS~H[23] "Banner Interval: "
setvar $MENUS~H[24] "Alien Ships:     "
setvar $MENUS~H[25] "Backdoor         (B)  "
setvar $MENUS~H[26] "Fig Type:             "
setvar $MENUS~H[27] "Alarm List            "
setvar $MENUS~H[28] "Surround HKILL?       "
setvar $MENUS~H[29] "MSL/Busted Prompt"
setvar $MENUS~H[30] "Silent Mode:     "
setvar $MENUS~H[31] "Safe Planet:     (L)  "

setvar $MENUS~QSS[2] ""
setvar $MENUS~QSS[3] $SWITCHBOARD~BOT_NAME
setvar $MENUS~QSS[4] $BOT~PASSWORD
if ($BOT~BOT_PASSWORD = 0)
  setvar $BOT~BOT_PASSWORD $BOT~SUBSPACE
  savevar $BOT~BOT_PASSWORD
end
setvar $MENUS~QSS[5] $BOT~BOT_PASSWORD
setvar $MENUS~QSS[6] $PLAYER~SURROUNDFIGS
setvar $MENUS~QSS[7] $PLAYER~SURROUNDLIMP
setvar $MENUS~QSS[8] $PLAYER~SURROUNDMINE
if ($PLAYER~SURROUNDAVOIDSHIELDEDONLY)
  setvar $MENUS~QSS[9] "Shielded"
elseif ($PLAYER~SURROUNDAVOIDALLPLANETS)
  setvar $MENUS~QSS[9] "All"
else
  setvar $MENUS~QSS[9] "None"
end
if ($BOT~AUTOATTACK)
  setvar $MENUS~QSS[10] "Yes"
else
  setvar $MENUS~QSS[10] "No"
end
setvar $MENUS~QSS[11] $SHIP~SHIP_MAX_ATTACK
setvar $MENUS~QSS[12] $SHIP~SHIP_OFFENSIVE_ODDS
if ($MAP~STARDOCK > 0)
  setvar $MENUS~QSS[13] $MAP~STARDOCK
else
  setvar $MENUS~QSS[13] "Not Defined"
end
if ($MAP~BACKDOOR > 0)
  setvar $MENUS~QSS[25] $MAP~BACKDOOR
else
  setvar $MENUS~QSS[25] "Not Defined"
end
if ($MAP~RYLOS > 0)
  setvar $MENUS~QSS[14] $MAP~RYLOS
else
  setvar $MENUS~QSS[14] "Not Defined"
end
if ($MAP~ALPHA_CENTAURI > 0)
  setvar $MENUS~QSS[15] $MAP~ALPHA_CENTAURI
else
  setvar $MENUS~QSS[15] "Not Defined"
end
if ($MAP~HOME_SECTOR > 0)
  setvar $MENUS~QSS[16] $MAP~HOME_SECTOR
else
  setvar $MENUS~QSS[16] "Not Defined"
end
setvar $MENUS~QSS[17] $SHIP~SHIP_FIGHTERS_MAX
setvar $MENUS~QSS[18] $BOT~USERNAME
if ($PLAYER~SURROUNDOVERWRITE)
  setvar $MENUS~QSS[19] "All Sectors"
elseif ($PLAYER~SURROUNDPASSIVE)
  setvar $MENUS~QSS[19] "Passive"
else
  setvar $MENUS~QSS[19] "Normal"
end
if ($PLAYER~UNLIMITEDGAME)
  setvar $MENUS~QSS[20] "Unlimited"
else
  setvar $MENUS~QSS[20] $BOT~BOT_TURN_LIMIT
end
setvar $MENUS~QSS[21] $BOT~LETTER
if ($BOT~SAFE_SHIP > 0)
  setvar $MENUS~QSS[22] $BOT~SAFE_SHIP
else
  setvar $MENUS~QSS[22] "Not Defined"
end
setvar $MENUS~QSS[23] $BOT~ECHOINTERVAL&" Minutes"
if ($PLAYER~DROPOFFENSIVE)
  setvar $MENUS~QSS[26] "Offensive"
elseif ($PLAYER~DROPTOLL)
  setvar $MENUS~QSS[26] "Toll"
else
  setvar $MENUS~QSS[26] "Defensive"
end
if ($PLAYER~DEFENDERCAPPING)
  setvar $MENUS~QSS[24] "Using defense"
elseif ($PLAYER~OFFENSECAPPING)
  setvar $MENUS~QSS[24] "Using offense"
else
  setvar $MENUS~QSS[24] "Don't attack"
end
if ($PLAYER~SURROUND_BEFORE_HKILL)
  setvar $MENUS~QSS[28] "Yes"
else
  setvar $MENUS~QSS[28] "No"
end
if (($BOT~ALARM_LIST <> "") and ($BOT~ALARM_LIST <> 0))
  setvar $MENUS~QSS[27] "Active"
else
  setvar $MENUS~QSS[27] "None"
  setvar $BOT~ALARM_LIST ""
end

if ($BOT~COMMAND_PROMPT_EXTRAS)
  setvar $MENUS~QSS[29] "Yes"
else
  setvar $MENUS~QSS[29] "No"
end
if ($BOT~SILENT_RUNNING)
  setvar $MENUS~QSS[30] "Yes"
else
  setvar $MENUS~QSS[30] "No"
end
if ($BOT~SAFE_PLANET > 0)
  setvar $MENUS~QSS[31] $BOT~SAFE_PLANET
else
  setvar $MENUS~QSS[31] "Not Defined"
end
setvar $MENUS~QSS_TOTAL 31
gosub :MENUSPACING
echo #27&"[2J"
echo "**"
echo ANSI_11&"         General Info                     Gridding/Attack Options*"
echo ANSI_10&#27&"[35m<"&#27&"[32mC"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[18]&ANSI_10&#27&"[35m<"&#27&"[32m3"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[6]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mP"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[4]&ANSI_10&#27&"[35m<"&#27&"[32m4"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[7]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mN"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[3]&ANSI_10&#27&"[35m<"&#27&"[32m5"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[8]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mZ"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[5]&ANSI_10&#27&"[35m<"&#27&"[32m6"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[26]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mG"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[21]&ANSI_10&#27&"[35m<"&#27&"[32m7"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[10]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mE"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[23]&ANSI_10&#27&"[35m<"&#27&"[32m8"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[9]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m1"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[20]&ANSI_10&#27&"[35m<"&#27&"[32m9"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[19]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m0"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[29]&ANSI_10&#27&"[35m<"&#27&"[32mK"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[28]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mV"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[30]&ANSI_10&#27&"[35m<"&#27&"[32mJ"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[27]&"*"
echo ANSI_11&"         Capture Options                   Location Variables*"
echo ANSI_10&#27&"[35m<"&#27&"[32m2"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[24]&ANSI_10&#27&"[35m<"&#27&"[32mS"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[13]&"*"
echo ANSI_11&"        Current Ship Stats             "&#27&"[35m<"&#27&"[32mB"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[25]&"*"
echo ANSI_10&"  "&ANSI_7&$MENUS~QSS_VAR[12]&ANSI_10&"  "&#27&"[35m<"&#27&"[32mR"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[14]&"*"
echo ANSI_10&"  "&ANSI_7&$MENUS~QSS_VAR[11]&ANSI_10&"  "&ANSI_10&""&#27&"[35m<"&#27&"[32mA"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[15]&"*"
echo ANSI_10&"  "&ANSI_7&$MENUS~QSS_VAR[17]&ANSI_10&"  "&#27&"[35m<"&#27&"[32mH"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[16]&"*"
echo ANSI_10&"  "&ANSI_7&$MENUS~QSS_VAR[2]&ANSI_10&"  "&#27&"[35m<"&#27&"[32mX"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[22]&"*"
echo ANSI_10&"  "&ANSI_7&$MENUS~QSS_VAR[2]&ANSI_10&"  "&#27&"[35m<"&#27&"[32mL"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[31]&"*"
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Trader List                    Game Stats"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"
getconsoleinput $MENUS~CHOSEN_OPTION SINGLEKEY
uppercase $MENUS~CHOSEN_OPTION
:MENUS~PROCESS_COMMAND
if ($MENUS~CHOSEN_OPTION = "?")
  goto :REFRESHPREFERENCESMENU
elseif ($MENUS~CHOSEN_OPTION = "+")
  goto :CHATMENU
elseif ($MENUS~CHOSEN_OPTION = "N")

  setvar $MENUS~QUESTION ANSI_13&"What is the 'in game' name of the bot? (one word, no spaces)"&ANSI_7
  gosub :GETINPUT
  setvar $MENUS~NEW_BOT_NAME $MENUS~RESPONSE

  striptext $MENUS~NEW_BOT_NAME "^"
  striptext $MENUS~NEW_BOT_NAME " "
  lowercase $MENUS~NEW_BOT_NAME
  if ($MENUS~NEW_BOT_NAME = "")
    goto :REFRESHPREFERENCESMENU
  end
  delete $BOT~GCONFIG_FILE
  write $BOT~GCONFIG_FILE $MENUS~NEW_BOT_NAME
  setvar $SWITCHBOARD~BOT_NAME $MENUS~NEW_BOT_NAME
  savevar $SWITCHBOARD~BOT_NAME
  setvar $BOT~BOT_NAME $MENUS~NEW_BOT_NAME
  savevar $BOT~BOT_NAME

elseif ($MENUS~CHOSEN_OPTION = "P")
  setvar $MENUS~QUESTION "Please Enter your Game Password"
  gosub :GETINPUT
  setvar $BOT~PASSWORD $MENUS~RESPONSE
elseif ($MENUS~CHOSEN_OPTION = "Z")
  setvar $MENUS~QUESTION "Please Enter your Bot Password"
  gosub :GETINPUT
  setvar $BOT~BOT_PASSWORD $MENUS~RESPONSE
elseif ($MENUS~CHOSEN_OPTION = "G")
  setvar $MENUS~QUESTION "Please Enter your Game Letter"
  gosub :GETINPUT
  setvar $BOT~LETTER $MENUS~RESPONSE
elseif ($MENUS~CHOSEN_OPTION = "C")
  setvar $MENUS~QUESTION "Please Enter your Login Name"
  gosub :GETINPUT
  setvar $BOT~USERNAME $MENUS~RESPONSE
elseif ($MENUS~CHOSEN_OPTION = 1)
  if ($PLAYER~UNLIMITEDGAME = FALSE)
    setvar $MENUS~QUESTION "What are the minimum turns you need to do bot commands?"
    gosub :GETINPUT
    setvar $MENUS~TEMP $MENUS~RESPONSE
    isnumber $MENUS~TEST $MENUS~TEMP
    if ($MENUS~TEST)
      if (($MENUS~TEMP <= 65000) and ($MENUS~TEMP >= 0))
        setvar $BOT~BOT_TURN_LIMIT $MENUS~TEMP
      end
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 3)
  setvar $MENUS~QUESTION "How many fighters to drop on surround/gridding?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= 50000) and ($MENUS~TEMP >= 0))
      setvar $PLAYER~SURROUNDFIGS $MENUS~TEMP
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 4)
  setvar $MENUS~QUESTION "How many limpets to drop on surround/gridding?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= 250) and ($MENUS~TEMP >= 0))
      setvar $PLAYER~SURROUNDLIMP $MENUS~TEMP
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 5)
  setvar $MENUS~QUESTION "How many armid mines to drop on surround/gridding?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= 250) and ($MENUS~TEMP >= 0))
      setvar $PLAYER~SURROUNDMINE $MENUS~TEMP
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 8)
  if ($PLAYER~SURROUNDAVOIDSHIELDEDONLY)
    setvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY FALSE
    setvar $PLAYER~SURROUNDAVOIDALLPLANETS TRUE
    setvar $PLAYER~SURROUNDDONTAVOID FALSE
  elseif ($PLAYER~SURROUNDAVOIDALLPLANETS)
    setvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY FALSE
    setvar $PLAYER~SURROUNDAVOIDALLPLANETS FALSE
    setvar $PLAYER~SURROUNDDONTAVOID TRUE
  else
    setvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY TRUE
    setvar $PLAYER~SURROUNDAVOIDALLPLANETS FALSE
    setvar $PLAYER~SURROUNDDONTAVOID FALSE
  end
elseif ($MENUS~CHOSEN_OPTION = 7)
  if ($BOT~AUTOATTACK)
    setvar $BOT~AUTOATTACK FALSE
  else
    setvar $BOT~AUTOATTACK TRUE
  end
elseif ($MENUS~CHOSEN_OPTION = 2)
  if ($PLAYER~DEFENDERCAPPING)
    setvar $PLAYER~DEFENDERCAPPING FALSE
    setvar $PLAYER~OFFENSECAPPING TRUE
    setvar $PLAYER~CAPPINGALIENS TRUE
  elseif ($PLAYER~OFFENSECAPPING)
    setvar $PLAYER~DEFENDERCAPPING FALSE
    setvar $PLAYER~OFFENSECAPPING FALSE
    setvar $PLAYER~CAPPINGALIENS FALSE
  else
    setvar $PLAYER~DEFENDERCAPPING TRUE
    setvar $PLAYER~OFFENSECAPPING FALSE
    setvar $PLAYER~CAPPINGALIENS TRUE
  end
elseif ($MENUS~CHOSEN_OPTION = 6)
  if ($PLAYER~DROPOFFENSIVE)
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL TRUE
  elseif ($PLAYER~DROPTOLL)
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL FALSE
  else
    setvar $PLAYER~DROPOFFENSIVE TRUE
    setvar $PLAYER~DROPTOLL FALSE
  end
elseif ($MENUS~CHOSEN_OPTION = 0)
  if ($BOT~COMMAND_PROMPT_EXTRAS)
    setvar $BOT~COMMAND_PROMPT_EXTRAS FALSE
  else
    setvar $BOT~COMMAND_PROMPT_EXTRAS TRUE
  end
elseif ($MENUS~CHOSEN_OPTION = "V")
  if ($BOT~SILENT_RUNNING)
    setvar $BOT~SILENT_RUNNING FALSE
    savevar $BOT~SILENT_RUNNING
  else
    setvar $BOT~SILENT_RUNNING TRUE
    savevar $BOT~SILENT_RUNNING
  end
elseif ($MENUS~CHOSEN_OPTION = "K")
  if ($PLAYER~SURROUND_BEFORE_HKILL)
    setvar $PLAYER~SURROUND_BEFORE_HKILL FALSE
  else
    setvar $PLAYER~SURROUND_BEFORE_HKILL TRUE
  end
elseif ($MENUS~CHOSEN_OPTION = "S")
  setvar $MENUS~QUESTION "What sector is the Stardock? (0 to set to twx variable)"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP >= 1))
      setvar $MAP~STARDOCK $MENUS~TEMP
      setvar $MAP~STARDOCK $MENUS~TEMP
    elseif ($MENUS~TEMP = 0)
      setvar $MAP~STARDOCK STARDOCK
      setvar $MAP~STARDOCK STARDOCK
    end
  end
elseif ($MENUS~CHOSEN_OPTION = "J")
  setvar $MENUS~QUESTION "Please enter name of traders, seperated by commas.  Can also use [2],[1] for Corporations."
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  setvar $BOT~ALARM_LIST $MENUS~TEMP
  savevar $BOT~ALARM_LIST
elseif ($MENUS~CHOSEN_OPTION = "X")
  setvar $MENUS~QUESTION "What ship number is your safe ship?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    setvar $BOT~SAFE_SHIP $MENUS~TEMP
  end
elseif ($MENUS~CHOSEN_OPTION = "L")
  setvar $MENUS~QUESTION "What planet is your safe planet?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    setvar $BOT~SAFE_PLANET $MENUS~TEMP
  end
elseif ($MENUS~CHOSEN_OPTION = "E")
  setvar $MENUS~TEMP 5760
  setvar $MENUS~QUESTION "How many minutes afk do you want the echo banner to show each time?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if ($MENUS~TEMP > 0)
      setvar $BOT~ECHOINTERVAL $MENUS~TEMP
    else
      setvar $BOT~ECHOINTERVAL 5760
    end
  end
elseif ($MENUS~CHOSEN_OPTION = "R")
  setvar $MENUS~QUESTION "What sector is the Rylos port? (0 to set to twx variable)"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP >= 1))
      setvar $MAP~RYLOS $MENUS~TEMP
    elseif ($MENUS~TEMP = 0)
      setvar $MAP~RYLOS RYLOS
    end
    savevar $MAP~RYLOS
  end
elseif ($MENUS~CHOSEN_OPTION = "A")
  setvar $MENUS~QUESTION "What sector is the Alpha Centauri port? (0 to set to twx variable)"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP >= 1))
      setvar $MAP~ALPHA_CENTAURI $MENUS~TEMP
    elseif ($MENUS~TEMP = 0)
      setvar $MAP~ALPHA_CENTAURI ALPHACENTAURI
    end
    savevar $MAP~ALPHA_CENTAURI
  end
elseif ($MENUS~CHOSEN_OPTION = "B")
  setvar $MENUS~QUESTION "What sector is the Backdoor to Stardock?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP >= 1))
      setvar $MAP~BACKDOOR $MENUS~TEMP
    end
    savevar $MAP~BACKDOOR
  end
elseif ($MENUS~CHOSEN_OPTION = "H")
  setvar $MENUS~QUESTION "What sector is the Home Sector?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP >= 1))
      setvar $MAP~HOME_SECTOR $MENUS~TEMP
      savevar $MAP~HOME_SECTOR
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 9)
  if ($PLAYER~SURROUNDOVERWRITE)
    setvar $PLAYER~SURROUNDOVERWRITE FALSE
    setvar $PLAYER~SURROUNDPASSIVE TRUE
    setvar $PLAYER~SURROUNDNORMAL FALSE
  elseif ($PLAYER~SURROUNDPASSIVE)
    setvar $PLAYER~SURROUNDOVERWRITE FALSE
    setvar $PLAYER~SURROUNDPASSIVE FALSE
    setvar $PLAYER~SURROUNDNORMAL TRUE
  else
    setvar $PLAYER~SURROUNDOVERWRITE TRUE
    setvar $PLAYER~SURROUNDPASSIVE FALSE
    setvar $PLAYER~SURROUNDNORMAL FALSE
  end
elseif ($MENUS~CHOSEN_OPTION = ">")
  goto :PREFERENCESMENUPAGE2
elseif ($MENUS~CHOSEN_OPTION = "<")
  goto :PREFERENCESMENUPAGE6
else
  gosub :DONEPREFER
end
goto :REFRESHPREFERENCESMENU
:MENUS~DONEPREFER
gosub :BOT~EXIT_MENU_DEAF
echo "*Saving preferences..*"
gosub :BOT~SAVE_THE_VARIABLES

echo #27 "[30D                        " #27 "[30D"
echo CURRENTANSILINE
goto :BOT~WAIT_FOR_COMMAND
return
:MENUS~PREFERENCESMENUPAGE2

gosub :BOT~KILLTHETRIGGERS
setarray $MENUS~H 34
setarray $MENUS~QSS 34
setvar $MENUS~H[1] "Atomic Detonators      "
setvar $MENUS~H[2] "Marker Beacons         "
setvar $MENUS~H[3] "Corbomite Devices      "
setvar $MENUS~H[4] "Cloaking Devices       "
setvar $MENUS~H[5] "SubSpace Ether Probes  "
setvar $MENUS~H[6] "Planet Scanners        "
setvar $MENUS~H[7] "Limpet Tracking Mines  "
setvar $MENUS~H[8] "Space Mines            "
setvar $MENUS~H[9] "Photon Missiles        "
setvar $MENUS~H[10] "Holographic Scan       "
setvar $MENUS~H[11] "Density Scan           "
setvar $MENUS~H[12] "Mine Disruptors        "
setvar $MENUS~H[13] "Genesis Torpedoes      "
setvar $MENUS~H[14] "TransWarp I            "
setvar $MENUS~H[15] "TransWarp II           "
setvar $MENUS~H[16] "Psychic Probes         "
setvar $MENUS~H[17] "Limpet Removal         "
setvar $MENUS~H[18] "Server Max Commands    "
setvar $MENUS~H[19] "Gold Enabled           "
setvar $MENUS~H[20] "MBBS Mode              "
setvar $MENUS~H[21] "Multiple Photons?      "
setvar $MENUS~H[22] "                       "
setvar $MENUS~H[23] "Colonists Per Day      "
setvar $MENUS~H[24] "Planet Trade           "
setvar $MENUS~H[25] "Steal Factor           "
setvar $MENUS~H[26] "Rob Factor             "
setvar $MENUS~H[27] "Days To Bust Clear     "
setvar $MENUS~H[28] "                       "
setvar $MENUS~H[29] "Port Maximum           "
setvar $MENUS~H[30] "Port Production Rate   "
setvar $MENUS~H[31] "Max Port Regen Per Day "
setvar $MENUS~H[32] "                       "
setvar $MENUS~H[33] "Nav Haz Loss Per Day   "
setvar $MENUS~H[34] "Radiation Lifetime     "
setvar $MENUS~QSS[1] $GAME~ATOMIC_COST
setvar $MENUS~QSS[2] $GAME~BEACON_COST
setvar $MENUS~QSS[3] $GAME~CORBO_COST
setvar $MENUS~QSS[4] $GAME~CLOAK_COST
setvar $MENUS~QSS[5] $GAME~PROBE_COST
setvar $MENUS~QSS[6] $GAME~PLANET_SCANNER_COST
setvar $MENUS~QSS[7] $GAME~PLANET_SCANNER_COST
setvar $MENUS~QSS[8] $GAME~ARMID_COST
if ($GAME~PHOTONS_ENABLED)
  setvar $MENUS~QSS[9] $GAME~PHOTON_COST
else
  setvar $MENUS~QSS[9] "Disabled"
end
setvar $MENUS~QSS[10] $GAME~HOLO_COST
setvar $MENUS~QSS[11] $GAME~DENSITY_COST
setvar $MENUS~QSS[12] $GAME~DISRUPTOR_COST
setvar $MENUS~QSS[13] $GAME~GENESIS_COST
setvar $MENUS~QSS[14] $GAME~TWARPI_COST
setvar $MENUS~QSS[15] $GAME~TWARPII_COST
setvar $MENUS~QSS[16] $GAME~PSYCHIC_COST
setvar $MENUS~QSS[17] $GAME~LIMPET_REMOVAL_COST
if ($GAME~MAX_COMMANDS = 0)
  setvar $MENUS~QSS[18] "Unlimited"
else
  setvar $MENUS~QSS[18] $GAME~MAX_COMMANDS
end
if ($GAME~GOLDENABLED)
  setvar $MENUS~QSS[19] "Yes"
else
  setvar $MENUS~QSS[19] "No"
end
if ($GAME~MBBS)
  setvar $MENUS~QSS[20] "Yes"
else
  setvar $MENUS~QSS[20] "No"
end
if ($GAME~PHOTONS_ENABLED = TRUE)
  if ($GAME~MULTIPLE_PHOTONS = TRUE)
    setvar $MENUS~QSS[21] "Yes"
  else
    setvar $MENUS~QSS[21] "No"
  end
else
  setvar $MENUS~QSS[21] "Disabled"
end
setvar $MENUS~QSS[22] ""
setvar $MENUS~QSS[23] $GAME~COLONIST_REGEN
setvar $MENUS~QSS[24] $GAME~PTRADESETTING&"%"
setvar $MENUS~QSS[25] $GAME~STEAL_FACTOR
setvar $MENUS~QSS[26] $GAME~ROB_FACTOR
setvar $MENUS~QSS[27] $GAME~CLEAR_BUST_DAYS
setvar $MENUS~QSS[28] ""
setvar $MENUS~QSS[29] $GAME~PORT_MAX
setvar $MENUS~QSS[30] $GAME~PRODUCTION_RATE&"%"
setvar $MENUS~QSS[31] $GAME~PRODUCTION_REGEN&"%"
setvar $MENUS~QSS[32] ""
setvar $MENUS~QSS[33] $GAME~DEBRIS_LOSS&"%"
setvar $MENUS~QSS[34] $GAME~RADIATION_LIFETIME
setvar $MENUS~QSS_TOTAL 34
gosub :MENUSPACING
echo #27&"[2J"
echo "**"
echo ANSI_11&"      Stardock Prices                 Game Statistics*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[1]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[18]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[2]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[19]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[3]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[20]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[4]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[21]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[5]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[22]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[6]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[23]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[7]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[24]&"*"
echo ANSI_11&" "&ANSI_7&$MENUS~QSS_VAR[8]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[25]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[9]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[26]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[10]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[27]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[11]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[28]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[12]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[29]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[13]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[30]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[14]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[31]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[15]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[32]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[16]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[33]&"*"
echo ANSI_10&" "&ANSI_7&$MENUS~QSS_VAR[17]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[34]&"*"
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Preferences                Hot Keys"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"
getconsoleinput $MENUS~CHOSEN_OPTION SINGLEKEY
uppercase $MENUS~CHOSEN_OPTION
gosub :BOT~KILLTHETRIGGERS
uppercase $MENUS~CHOSEN_OPTION
:MENUS~PROCESS_COMMANDPAGE2
if ($MENUS~CHOSEN_OPTION = "?")
  goto :PREFERENCESMENUPAGE2
elseif ($MENUS~CHOSEN_OPTION = ">")
  goto :PREFERENCESMENUPAGE3
elseif ($MENUS~CHOSEN_OPTION = "<")
  goto :REFRESHPREFERENCESMENU
else
  gosub :DONEPREFER
end
:MENUS~PREFERENCESMENUPAGE3
gosub :BOT~KILLTHETRIGGERS
echo #27&"[2J"
echo "**"
echo ANSI_11&"                  Custom Hotkey Definitions           *"
gosub :ECHOHOTKEYS
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Game Stats                    Ship Info"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"
setvar $MENUS~OPTIONS "1234567890ABCDEFGHIJKLMNOPRSTUVWX\t "
getconsoleinput $MENUS~CHOSEN_OPTION SINGLEKEY
uppercase $MENUS~CHOSEN_OPTION
getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~CHOSEN_OPTION
gosub :BOT~KILLTHETRIGGERS
:MENUS~PROCESS_COMMANDPAGE3

if ($MENUS~CHOSEN_OPTION = "?")
  goto :PREFERENCESMENUPAGE3
elseif ($MENUS~CHOSEN_OPTION = ">")
  goto :PREFERENCESMENUPAGE4
elseif ($MENUS~CHOSEN_OPTION = "<")
  goto :PREFERENCESMENUPAGE2
elseif ($MENUS~POS > 0)
  setdeafclients FALSE
  echo "*What should this hotkey be set to?*"
  getconsoleinput $MENUS~TEMP SINGLEKEY
  setdeafclients TRUE
  lowercase $MENUS~TEMP
  getcharcode $MENUS~TEMP $MENUS~LOWER
  uppercase $MENUS~TEMP
  getcharcode $MENUS~TEMP $MENUS~UPPER
  setvar $MENUS~KEY $BOT~CUSTOM_KEYS[$MENUS~POS]
  uppercase $MENUS~KEY
  getcharcode $MENUS~KEY $MENUS~OLD_UPPER
  lowercase $MENUS~KEY
  getcharcode $MENUS~KEY $MENUS~OLD_LOWER
  if ((((($BOT~HOTKEYS[$MENUS~UPPER] = 0) or ($BOT~HOTKEYS[$MENUS~UPPER] = "")) and (($BOT~HOTKEYS[$MENUS~LOWER] = 0) or ($BOT~HOTKEYS[$MENUS~LOWER] = "")))) and (((($MENUS~LOWER < 48) or ($MENUS~LOWER > 57)) and ($MENUS~TEMP <> "?"))))
    setvar $BOT~HOTKEYS[$MENUS~OLD_UPPER] ""
    setvar $BOT~HOTKEYS[$MENUS~OLD_LOWER] ""
    setvar $BOT~HOTKEYS[$MENUS~UPPER] $MENUS~POS
    setvar $BOT~HOTKEYS[$MENUS~LOWER] $MENUS~POS
    setvar $BOT~CUSTOM_KEYS[$MENUS~POS] $MENUS~TEMP
    if ($MENUS~POS > 17)
      setvar $MENUS~QUESTION "What is the bot command to connect to this hotkey?"
      gosub :GETINPUT
      setvar $MENUS~TEMP $MENUS~RESPONSE
      setvar $BOT~CUSTOM_COMMANDS[$MENUS~POS] $MENUS~TEMP
    end
    gosub :BOT~WRITE_HOTKEY_CONFIG
  else
    setdeafclients FALSE
    echo ANSI_4 "*Hot key already bound to another function.**" ANSI_7
    setdeafclients TRUE
    setdelaytrigger WARNINGDELAY :PREFERENCESMENUPAGE3 1000
    pause
  end
  goto :PREFERENCESMENUPAGE3
else
  gosub :DONEPREFER
end
:MENUS~PREFERENCESMENUPAGE4
gosub :BOT~KILLTHETRIGGERS
setvar $MENUS~I 1
if ($SHIP~SHIPCOUNTER > 10)
  setvar $MENUS~PAGESEXIST TRUE
else
  setvar $MENUS~PAGESEXIST FALSE
end
:MENUS~NEXTSHIPPAGE
gosub :SHIP~LOADSHIPINFO
setvar $MENUS~SHIPSCHANGED FALSE
setvar $MENUS~THISPAGE $MENUS~I
setvar $MENUS~MENUCOUNT 0
echo #27&"[2J"
echo "**"
echo ANSI_11&"                      Known Ship Information           **"
echo ANSI_15 "    Type                      Def  Off  TPW  D-Bonus?   Shields   Fighters *"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
while (($MENUS~I < $SHIP~SHIPCOUNTER) and ($MENUS~MENUCOUNT < 10))
  cuttext $SHIP~SHIPLIST[$MENUS~I]&"                                    " $MENUS~TEMP 1 25
  cuttext $SHIP~SHIPLIST[$MENUS~I][2]&"  " $MENUS~TEMPDEFHEAD 1 1
  cuttext $SHIP~SHIPLIST[$MENUS~I][2]&"  " $MENUS~TEMPDEFTAIL 2 1
  cuttext $SHIP~SHIPLIST[$MENUS~I][3]&"  " $MENUS~TEMPOFFHEAD 1 1
  cuttext $SHIP~SHIPLIST[$MENUS~I][3]&"  " $MENUS~TEMPOFFTAIL 2 1
  if ($SHIP~SHIPLIST[$MENUS~I][8])
    setvar $MENUS~TEMPDEFENDER ANSI_12&"Yes"&ANSI_14
  else
    setvar $MENUS~TEMPDEFENDER "No "
  end
  cuttext $SHIP~SHIPLIST[$MENUS~I][1]&"              " $MENUS~TEMPSHIELDS 1 10
  cuttext $SHIP~SHIPLIST[$MENUS~I][5]&"              " $MENUS~TEMPFIGHTERS 1 6
  cuttext $SHIP~SHIPLIST[$MENUS~I][7]&"              " $MENUS~TEMPTPW 1 3
  echo ANSI_14 "<" $MENUS~MENUCOUNT "> " $MENUS~TEMP " " $MENUS~TEMPDEFHEAD "." $MENUS~TEMPDEFTAIL "  " $MENUS~TEMPOFFHEAD "." $MENUS~TEMPOFFTAIL "   " $MENUS~TEMPTPW "   " $MENUS~TEMPDEFENDER "       " $MENUS~TEMPSHIELDS " " $MENUS~TEMPFIGHTERS "*"
  add $MENUS~I 1
  add $MENUS~MENUCOUNT 1
end
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
echo "*"
if ($MENUS~PAGESEXIST = TRUE)
  echo "  "&ANSI_5&"<"&ANSI_6&"+"&ANSI_5&">"&ANSI_6&" More Ships*"
end
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Hot Keys                 Planet Types"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"

echo "  "&ANSI_5&"Toggle defender status (0-9)? "
getconsoleinput $MENUS~SELECTION SINGLEKEY
setvar $MENUS~OPTIONS 1234567890
uppercase $MENUS~SELECTION
getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~SELECTION
gosub :BOT~KILLTHETRIGGERS
if ($MENUS~SELECTION = "<")
  gosub :REWRITE_CAP_FILE
  goto :PREFERENCESMENUPAGE3
elseif ($MENUS~SELECTION = ">")
  gosub :REWRITE_CAP_FILE
  goto :PREFERENCESMENUPAGEPLANET
elseif ($MENUS~SELECTION = "?")
  gosub :REWRITE_CAP_FILE
  goto :PREFERENCESMENUPAGE4
elseif ($MENUS~PAGESEXIST and ($MENUS~SELECTION = "+"))
  if ($MENUS~I >= $SHIP~SHIPCOUNTER)
    setvar $MENUS~I 1
  end
  goto :NEXTSHIPPAGE
elseif ($MENUS~POS > 0)
  if ($SHIP~SHIPLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][8])
    setvar $SHIP~SHIPLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][8] FALSE
  else
    setvar $SHIP~SHIPLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][8] TRUE
  end
  setvar $MENUS~I $MENUS~THISPAGE
  setvar $MENUS~SHIPSCHANGED TRUE
  gosub :REWRITE_CAP_FILE
  goto :NEXTSHIPPAGE
else
  gosub :REWRITE_CAP_FILE
  gosub :DONEPREFER
end
:MENUS~PREFERENCESMENUPAGEPLANET

gosub :BOT~KILLTHETRIGGERS
setvar $MENUS~I 1
setvar $MENUS~PLANETSCHANGED FALSE
if ($PLANET~PLANETCOUNTER > 10)
  setvar $MENUS~PAGESEXIST TRUE
else
  setvar $MENUS~PAGESEXIST FALSE
end
:MENUS~NEXTPLANETINFOPAGE
setvar $MENUS~THISPAGE $MENUS~I
setvar $MENUS~MENUCOUNT 0
echo #27&"[2J"
echo "**"
echo ANSI_11&"            Planet Type Information  (Max Colos Per Product Type)         **"
echo ANSI_15 "    Type                       Min Fuel  Max Fuel  Min Org  Max Org  Min Equ  Max Equ  Keeper? *"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
while (($MENUS~I <= $PLANET~PLANETCOUNTER) and ($MENUS~MENUCOUNT < 10))
  cuttext $PLANET~PLANETLIST[$MENUS~I]&"                                    " $MENUS~TEMP 8 28
  cuttext $PLANET~PLANETLIST[$MENUS~I][1]&"                                 " $MENUS~TEMPFUELMIN 1 8
  cuttext $PLANET~PLANETLIST[$MENUS~I][2]&"                                 " $MENUS~TEMPFUEL 1 8
  cuttext $PLANET~PLANETLIST[$MENUS~I][3]&"                                 " $MENUS~TEMPORGMIN 1 8
  cuttext $PLANET~PLANETLIST[$MENUS~I][4]&"                                 " $MENUS~TEMPORG 1 8
  cuttext $PLANET~PLANETLIST[$MENUS~I][5]&"                                 " $MENUS~TEMPEQUIPMIN 1 8
  cuttext $PLANET~PLANETLIST[$MENUS~I][6]&"                                 " $MENUS~TEMPEQUIP 1 8
  if ($PLANET~PLANETLIST[$MENUS~I][7] = TRUE)
    setvar $MENUS~TEMPKEEPER "Yes"
  else
    setvar $MENUS~TEMPKEEPER "No"
  end
  echo ANSI_14 "<" $MENUS~MENUCOUNT ">" $MENUS~TEMP " " $MENUS~TEMPFUELMIN " " $MENUS~TEMPFUEL "  " $MENUS~TEMPORGMIN "  " $MENUS~TEMPORG "  " $MENUS~TEMPEQUIPMIN "  " $MENUS~TEMPEQUIP " " $MENUS~TEMPKEEPER "*"
  add $MENUS~I 1
  add $MENUS~MENUCOUNT 1
end
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
echo "*"
if ($MENUS~PAGESEXIST = TRUE)
  echo "  "&ANSI_5&"<"&ANSI_6&"+"&ANSI_5&">"&ANSI_6&" More Planets*"
end
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Hot Keys                 Planet List"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"
if ($MENUS~TOGGLEAGAIN = TRUE)
  goto :TOGGLEAGAIN
end

echo "  "&ANSI_5&"Update Planet Info (0-9)?   Toggle (k)eeper planet"
getconsoleinput $MENUS~SELECTION SINGLEKEY
setvar $MENUS~OPTIONS 1234567890
uppercase $MENUS~SELECTION
getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~SELECTION
gosub :BOT~KILLTHETRIGGERS
if ($MENUS~SELECTION = "<")
  gosub :REWRITE_PLANET_FILE
  goto :PREFERENCESMENUPAGE4
elseif ($MENUS~SELECTION = ">")
  gosub :REWRITE_PLANET_FILE
  goto :PREFERENCESMENUPAGE5
elseif ($MENUS~SELECTION = "?")
  gosub :REWRITE_PLANET_FILE
  goto :PREFERENCESMENUPAGEPLANET
elseif ($MENUS~SELECTION = "K")
  :MENUS~TOGGLEAGAIN
  echo "  "&ANSI_5&"Which planet to set keeper status? (0-9)"
  getconsoleinput $MENUS~PLANET SINGLEKEY
  setvar $MENUS~OPTIONS 1234567890
  uppercase $MENUS~PLANET
  getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~PLANET
  setvar $MENUS~TOGGLEAGAIN FALSE
  if ($MENUS~POS > 0)
    if ($PLANET~PLANETLIST[($MENUS~PLANET + $MENUS~THISPAGE)][7] = TRUE)
      setvar $PLANET~PLANETLIST[($MENUS~PLANET + $MENUS~THISPAGE)][7] FALSE
    else
      setvar $PLANET~PLANETLIST[($MENUS~PLANET + $MENUS~THISPAGE)][7] TRUE
    end
    setvar $MENUS~TOGGLEAGAIN TRUE
  else
    gosub :REWRITE_PLANET_FILE
  end
  setvar $MENUS~I $MENUS~THISPAGE
  setvar $MENUS~PLANETSCHANGED TRUE
  gosub :REWRITE_PLANET_FILE
  goto :PREFERENCESMENUPAGEPLANET
elseif ($MENUS~PAGESEXIST and ($MENUS~SELECTION = "+"))
  if ($MENUS~I >= $PLANET~PLANETCOUNTER)
    setvar $MENUS~I 1
  end
  goto :NEXTPLANETINFOPAGE
elseif ($MENUS~POS > 0)
  setvar $MENUS~QUESTION "What are the min fuel colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][1] $MENUS~TEMP

  setvar $MENUS~QUESTION "What are the max fuel colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][2] $MENUS~TEMP

  setvar $MENUS~QUESTION "What are the min organics colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][3] $MENUS~TEMP

  setvar $MENUS~QUESTION "What are the max organics colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][4] $MENUS~TEMP

  setvar $MENUS~QUESTION "What are the min equipment colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][5] $MENUS~TEMP

  setvar $MENUS~QUESTION "What are the max equipment colos for "&$PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)]&"?"
  gosub :GETINPUT
  setvar $MENUS~TEMP $MENUS~RESPONSE
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST = FALSE)
    goto :PREFERENCESMENUPAGEPLANET
  end
  setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][6] $MENUS~TEMP

  setdeafclients FALSE
  echo "Is this planet a keeper? (y/n)*"
  getconsoleinput $MENUS~KEEPERSELECTION SINGLEKEY
  setdeafclients TRUE
  uppercase $MENUS~KEEPERSELECTION
  if ($MENUS~KEEPERSELECTION = "Y")
    setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][7] TRUE
  else
    setvar $PLANET~PLANETLIST[($MENUS~SELECTION + $MENUS~THISPAGE)][7] FALSE
  end
  setvar $MENUS~I $MENUS~THISPAGE
  setvar $MENUS~PLANETSCHANGED TRUE
  gosub :REWRITE_PLANET_FILE
  goto :PREFERENCESMENUPAGEPLANET
else
  gosub :REWRITE_PLANET_FILE
  gosub :DONEPREFER
end
:MENUS~REWRITE_CAP_FILE


if ($MENUS~SHIPSCHANGED)
  setvar $MENUS~GBONUS_FILE $BOT~FOLDER&"/dbonus-ships.cfg"
  delete $MENUS~GBONUS_FILE
  delete $SHIP~CAP_FILE
  setvar $MENUS~J 1
  while ($MENUS~J < $SHIP~SHIPCOUNTER)
    write $SHIP~CAP_FILE $SHIP~SHIPLIST[$MENUS~J][1]&" "&$SHIP~SHIPLIST[$MENUS~J][2]&" "&$SHIP~SHIPLIST[$MENUS~J][3]&" "&$SHIP~SHIPLIST[$MENUS~J][9]&" "&$SHIP~SHIPLIST[$MENUS~J][4]&" "&$SHIP~SHIPLIST[$MENUS~J][5]&" "&$SHIP~SHIPLIST[$MENUS~J][6]&" "&$SHIP~SHIPLIST[$MENUS~J][7]&" "&$SHIP~SHIPLIST[$MENUS~J][8]&" "&$SHIP~SHIPLIST[$MENUS~J]
    if ($SHIP~SHIPLIST[$MENUS~J][8])
      write $MENUS~GBONUS_FILE $SHIP~SHIPLIST[$MENUS~J]
    end
    add $MENUS~J 1
  end
end
return
:MENUS~REWRITE_PLANET_FILE


if ($MENUS~PLANETSCHANGED)
  delete $PLANET~PLANET_FILE
  setvar $MENUS~J 1
  while ($MENUS~J <= $PLANET~PLANETCOUNTER)
    write $PLANET~PLANET_FILE $PLANET~PLANETLIST[$MENUS~J][1]&" "&$PLANET~PLANETLIST[$MENUS~J][2]&" "&$PLANET~PLANETLIST[$MENUS~J][3]&" "&$PLANET~PLANETLIST[$MENUS~J][4]&" "&$PLANET~PLANETLIST[$MENUS~J][5]&" "&$PLANET~PLANETLIST[$MENUS~J][6]&" "&$PLANET~PLANETLIST[$MENUS~J][7]&"  "&$PLANET~PLANETLIST[$MENUS~J]
    add $MENUS~J 1
  end
end
return
:MENUS~PREFERENCESMENUPAGE5

setvar $MENUS~I 2
:MENUS~NEXTPLANETPAGE
echo ANSI_12 "*Searching for enemy planets in database" ANSI_14 "...*"
gosub :BOT~KILLTHETRIGGERS
setvar $MENUS~FOUNDSECTORS 0
setvar $MENUS~DISPLAY ""
while (($MENUS~I <= SECTORS) and ($MENUS~FOUNDSECTORS < 3))
  getsectorparameter $MENUS~I "BUBBLE" $MENUS~ISBUBBLE
  if ($MENUS~ISBUBBLE <> TRUE)
    if (SECTOR.PLANETCOUNT[$MENUS~I] > 0)
      setvar $MAP~DISPLAYSECTOR $MENUS~I
      gosub :MAP~DISPLAYSECTOR
      setvar $MENUS~DISPLAY $MENUS~DISPLAY&"*"&$MAP~OUTPUT
      add $MENUS~FOUNDSECTORS 1
    end
  end
  add $MENUS~I 1
end
echo #27&"[2J"
echo "**"
echo ANSI_11&"                         Known Planet List*             ("&ANSI_14&"Planets in database (Not in bubble)"&ANSI_11&")              **"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
setvar $MENUS~PAGESEXIST FALSE
if ($MENUS~FOUNDSECTORS > 0)
  echo $MENUS~DISPLAY
  if ($MENUS~I >= SECTORS)
    echo "*    [End of List]"
    setvar $MENUS~I 2
  else
    setvar $MENUS~PAGESEXIST TRUE
  end
else
  echo "*    [End of List]"
end
echo "*"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
echo "*"
if ($MENUS~PAGESEXIST)
  echo "  "&ANSI_5&"<"&ANSI_6&"+"&ANSI_5&">"&ANSI_6&" More Planets*"
end
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Planet Types                 Trader List"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"
getconsoleinput $MENUS~SELECTION SINGLEKEY
setvar $MENUS~OPTIONS ""
uppercase $MENUS~SELECTION
getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~SELECTION
gosub :BOT~KILLTHETRIGGERS
if ($MENUS~SELECTION = "<")
  goto :PREFERENCESMENUPAGEPLANET
elseif ($MENUS~SELECTION = ">")
  goto :PREFERENCESMENUPAGE6
elseif ($MENUS~SELECTION = "?")
  goto :PREFERENCESMENUPAGE5
elseif ($MENUS~SELECTION = "+")
  goto :NEXTPLANETPAGE
else
  gosub :DONEPREFER
end
:MENUS~PREFERENCESMENUPAGE6

setvar $MENUS~I 2
:MENUS~NEXTTRADERPAGE
echo ANSI_12 "*Searching for traders in database" ANSI_14 "...*"
gosub :BOT~KILLTHETRIGGERS
setvar $MENUS~FOUNDSECTORS 0
setvar $MENUS~DISPLAY ""
while (($MENUS~I <= SECTORS) and ($MENUS~FOUNDSECTORS < 3))
  if (SECTOR.TRADERCOUNT[$MENUS~I] > 0)
    setvar $MAP~DISPLAYSECTOR $MENUS~I
    gosub :MAP~DISPLAYSECTOR
    setvar $MENUS~DISPLAY $MENUS~DISPLAY&"*"&$MAP~OUTPUT
    add $MENUS~FOUNDSECTORS 1
  end
  add $MENUS~I 1
end
echo #27&"[2J"
echo "**"
echo ANSI_11&"                         Trader List*             ("&ANSI_14&"Traders last seen in sectors"&ANSI_11&")              **"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
setvar $MENUS~PAGESEXIST FALSE
if ($MENUS~FOUNDSECTORS > 0)
  echo $MENUS~DISPLAY
  if ($MENUS~I >= SECTORS)
    echo "*    [End of List]"
    setvar $MENUS~I 2
  else
    setvar $MENUS~PAGESEXIST TRUE
  end
else
  echo "*    [End of List]"
end
echo "*"
echo "   " #27 "[1m" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
echo "*"
if ($MENUS~PAGESEXIST)
  echo "  "&ANSI_5&"<"&ANSI_6&"+"&ANSI_5&">"&ANSI_6&" More Planets*"
end
echo "*"
echo ANSI_12&"           "&#27&"[35m["&#27&"[32m<"&#27&"[35m]"&ANSI_15&"Planet Info                 Preferences"&#27&"[35m["&#27&"[32m>"&#27&"[35m]*"&ANSI_7&"**"


getconsoleinput $MENUS~SELECTION SINGLEKEY
setvar $MENUS~OPTIONS ""
uppercase $MENUS~SELECTION
getwordpos $MENUS~OPTIONS $MENUS~POS $MENUS~SELECTION
gosub :BOT~KILLTHETRIGGERS
if ($MENUS~SELECTION = "<")
  goto :PREFERENCESMENUPAGE5
elseif ($MENUS~SELECTION = ">")
  goto :REFRESHPREFERENCESMENU
elseif ($MENUS~SELECTION = "?")
  goto :PREFERENCESMENUPAGE6
elseif ($MENUS~SELECTION = "+")
  goto :NEXTTRADERPAGE
else
  gosub :DONEPREFER
end
:MENUS~ECHOHOTKEYS




setarray $MENUS~H 34
setarray $MENUS~QSS 34
setvar $MENUS~H[1] "Auto Kill            "
setvar $MENUS~H[2] "Auto Capture         "
setvar $MENUS~H[3] "Auto Refurb          "
setvar $MENUS~H[4] "Surround             "
setvar $MENUS~H[5] "Holo-Torp            "
setvar $MENUS~H[6] "Transwarp Drive      "
setvar $MENUS~H[7] "Planet Macros        "
setvar $MENUS~H[8] "Quick Script Loading "
setvar $MENUS~H[9] "Dny Holo Kill        "
setvar $MENUS~H[10] "Stop Current Mode    "
setvar $MENUS~H[11] "Dock Macros          "
setvar $MENUS~H[12] "Exit Enter           "
setvar $MENUS~H[13] "Mow                  "
setvar $MENUS~H[14] "Fast Foton           "
setvar $MENUS~H[15] "Clear Sector         "
setvar $MENUS~H[16] "Preferences          "
setvar $MENUS~H[17] "LS Dock Shopper      "
setvar $MENUS~I 1
while ($MENUS~I <= 16)
  if ($BOT~CUSTOM_COMMANDS[($MENUS~I + 17)] <> 0)
    setvar $MENUS~H[($MENUS~I + 17)] $BOT~CUSTOM_COMMANDS[($MENUS~I + 17)]&"                              "
    cuttext $MENUS~H[($MENUS~I + 17)] $MENUS~H[($MENUS~I + 17)] 1 22
  else
    setvar $MENUS~H[($MENUS~I + 17)] "Custom Hotkey "&$MENUS~I&"        "
    cuttext $MENUS~H[($MENUS~I + 17)] $MENUS~H[($MENUS~I + 17)] 1 22
  end
  add $MENUS~I 1
end
setvar $MENUS~H[34] "                     "
setvar $MENUS~I 1
while ($MENUS~I <= 33)
  if (($BOT~CUSTOM_KEYS[$MENUS~I] <> 0) and ($BOT~CUSTOM_KEYS[$MENUS~I] <> ""))
    if (($BOT~CUSTOM_KEYS[$MENUS~I] = #9) or ($BOT~CUSTOM_KEYS[$MENUS~I] = "\t"))
      setvar $MENUS~QSS[$MENUS~I] "TAB-TAB"
    elseif ($BOT~CUSTOM_KEYS[$MENUS~I] = #13)
      setvar $MENUS~QSS[$MENUS~I] "TAB-Enter"
    elseif ($BOT~CUSTOM_KEYS[$MENUS~I] = #8)
      setvar $MENUS~QSS[$MENUS~I] "TAB-Backspace"
    elseif ($BOT~CUSTOM_KEYS[$MENUS~I] = #32)
      setvar $MENUS~QSS[$MENUS~I] "TAB-Spacebar"
    else
      setvar $MENUS~QSS[$MENUS~I] "TAB-"&$BOT~CUSTOM_KEYS[$MENUS~I]
    end
  else
    setvar $MENUS~QSS[$MENUS~I] "Undefined"
  end
  add $MENUS~I 1
end
setvar $MENUS~QSS[34] ""
setvar $MENUS~QSS_TOTAL 34
gosub :MENUSPACING
echo ANSI_10&#27&"[35m<"&#27&"[32m1"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[1]&ANSI_10&#27&"[35m<"&#27&"[32mH"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[18]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m2"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[2]&ANSI_10&#27&"[35m<"&#27&"[32mI"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[19]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m3"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[3]&ANSI_10&#27&"[35m<"&#27&"[32mJ"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[20]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m4"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[4]&ANSI_10&#27&"[35m<"&#27&"[32mK"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[21]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m5"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[5]&ANSI_10&#27&"[35m<"&#27&"[32mL"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[22]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m6"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[6]&ANSI_10&#27&"[35m<"&#27&"[32mM"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[23]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m7"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[7]&ANSI_10&#27&"[35m<"&#27&"[32mN"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[24]&"*"
echo ANSI_11&#27&"[35m<"&#27&"[32m8"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[8]&ANSI_10&#27&"[35m<"&#27&"[32mO"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[25]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m9"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[9]&ANSI_10&#27&"[35m<"&#27&"[32mP"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[26]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m0"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[10]&ANSI_10&#27&"[35m<"&#27&"[32mR"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[27]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mA"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[11]&ANSI_10&#27&"[35m<"&#27&"[32mS"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[28]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mB"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[12]&ANSI_10&#27&"[35m<"&#27&"[32mT"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[29]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mC"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[13]&ANSI_10&#27&"[35m<"&#27&"[32mU"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[30]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mD"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[14]&ANSI_10&#27&"[35m<"&#27&"[32mV"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[31]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mE"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[15]&ANSI_10&#27&"[35m<"&#27&"[32mW"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[32]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mF"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[16]&ANSI_10&#27&"[35m<"&#27&"[32mX"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[33]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mG"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[17]&ANSI_10&""&ANSI_7&$MENUS~QSS_VAR[34]&"*"
return
:MENUS~ADD_GAME




setvar $MENUS~NEW_BOT_NAME ""
getinput $MENUS~NEW_BOT_NAME ANSI_13&"What is the 'in game' name of the bot? (one word, no spaces)"&ANSI_7
striptext $MENUS~NEW_BOT_NAME "^"
striptext $MENUS~NEW_BOT_NAME " "
lowercase $MENUS~NEW_BOT_NAME
if ($MENUS~NEW_BOT_NAME = "")
  goto :ADD_GAME
end
setvar $BOT~PASSWORD PASSWORD
setvar $BOT~USERNAME LOGINNAME
setvar $BOT~LETTER GAME
if (($BOT~LETTER = "") or ($BOT~LETTER = 0))
  getinput $BOT~LETTER "Please Enter your Game Letter"
end
if (($BOT~USERNAME = "") or ($BOT~USERNAME = 0))
  getinput $BOT~USERNAME "Please Enter your Login Name"
end
if (($BOT~PASSWORD = "") or ($BOT~PASSWORD = 0))
  getinput $BOT~PASSWORD "Please Enter your Game password"
end
savevar $BOT~LETTER
savevar $BOT~USERNAME
savevar $BOT~PASSWORD

delete $BOT~GCONFIG_FILE
write $BOT~GCONFIG_FILE $MENUS~NEW_BOT_NAME
setvar $SWITCHBOARD~BOT_NAME $MENUS~NEW_BOT_NAME
savevar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $MENUS~NEW_BOT_NAME
savevar $BOT~BOT_NAME
return
:MENUS~PREGAMEMENULOAD




killalltriggers
loadvar $BOT~PASSWORD
loadvar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME
loadvar $BOT~STARTSHIPNAME
loadvar $BOT~MOWTODOCK
loadvar $BOT~MOWTODOCKBACKDOOR
loadvar $BOT~STARTGAMEDELAY
loadvar $BOT~ISCEO
loadvar $BOT~CORPNAME
if ($BOT~CORPNAME = 0)
  setvar $BOT~CORPNAME ""
  savevar $BOT~CORPNAME
end
loadvar $BOT~SUBSPACE
loadvar $MENUS~CORPNUMBER
loadvar $BOT~CORPPASSWORD
if ($BOT~CORPPASSWORD = 0)
  setvar $BOT~CORPPASSWORD ""
  savevar $BOT~CORPPASSWORD
end
loadvar $BOT~USERNAME
loadvar $BOT~LETTER
loadvar $BOT~PASSWORD
if ($BOT~PASSWORD = 0)
  setvar $BOT~PASSWORD PASSWORD
end
if ($BOT~USERNAME = 0)
  setvar $BOT~USERNAME LOGINNAME
  savevar $BOT~USERNAME
end
if ($BOT~SERVERNAME = 0)
  setvar $BOT~SERVERNAME LOGINNAME
  savevar $BOT~SERVERNAME
end
if ($BOT~LETTER = 0)
  setvar $BOT~LETTER GAME
  savevar $BOT~LETTER
end
if (($BOT~STARTSHIPNAME = 0) or ($BOT~STARTSHIPNAME = ""))
  setvar $BOT~STARTSHIPNAME "Mind ()ver Matter"
end
if ($SWITCHBOARD~BOT_NAME = "")
  setvar $BOT~NEWGAMEDAY1 TRUE
  setvar $BOT~NEWGAMEOLDER FALSE
else
  setvar $BOT~NEWGAMEDAY1 FALSE
  setvar $BOT~NEWGAMEOLDER TRUE
end
if ($BOT~ISSHIPDESTROYED = TRUE)
  setvar $BOT~NEWGAMEDAY1 FALSE
  setvar $BOT~NEWGAMEOLDER FALSE
end
setvar $BOT~STARTMACRO ""
:MENUS~PREGAMEMENU
setarray $MENUS~H 26
setarray $MENUS~QSS 26
setvar $MENUS~H[1] "Bot Name:        "
setvar $MENUS~H[2] "Server Name:     "
setvar $MENUS~H[3] "Login Name:      "
setvar $MENUS~H[4] "Password:        "
setvar $MENUS~H[5] "Game Letter:     "
setvar $MENUS~H[6] "Ship Name:       "
setvar $MENUS~H[7] "Type of login:   "
setvar $MENUS~H[8] "Are you CEO?     "
setvar $MENUS~H[9] "Corp Name:       "
setvar $MENUS~H[10] "Corp Password:   "
setvar $MENUS~H[11] "Subspace Channel:"
setvar $MENUS~H[12] "Delay (Minutes): "
setvar $MENUS~H[13] "After login:     "
setvar $MENUS~H[14] "Bot command to perform:"
setvar $MENUS~H[15] "Mow Option       "
setvar $MENUS~H[16] "Macro to fire after login:"
setvar $MENUS~H[17] "Teammate names:  "
setvar $MENUS~H[18] "                 "
setvar $MENUS~H[19] "                 "
setvar $MENUS~H[20] "                 "
setvar $MENUS~H[21] "                 "
setvar $MENUS~H[22] "                 "
setvar $MENUS~H[23] "                 "
setvar $MENUS~H[24] "                 "
setvar $MENUS~H[25] "                 "
setvar $MENUS~H[26] "                 "
setvar $MENUS~QSS[1] $SWITCHBOARD~BOT_NAME
setvar $MENUS~QSS[2] $BOT~SERVERNAME
setvar $MENUS~QSS[3] $BOT~USERNAME
setvar $MENUS~QSS[4] $BOT~PASSWORD
setvar $MENUS~QSS[5] $BOT~LETTER
setvar $MENUS~QSS[6] $BOT~STARTSHIPNAME
if ($BOT~NEWGAMEDAY1)
  setvar $MENUS~QSS[7] "New Game Account Creation"
elseif ($BOT~NEWGAMEOLDER)
  setvar $MENUS~QSS[7] "Normal Relog"
else
  setvar $MENUS~QSS[7] "Return after being destroyed."
end
if ($BOT~ISCEO)
  setvar $MENUS~QSS[8] "Yes"
else
  setvar $MENUS~QSS[8] "No"
end
loadvar $BOT~CORPNAME
setvar $MENUS~QSS[9] $BOT~CORPNAME
setvar $MENUS~QSS[10] $BOT~CORPPASSWORD
setvar $MENUS~QSS[11] $BOT~SUBSPACE
setvar $MENUS~QSS[12] $BOT~STARTGAMEDELAY
if ($BOT~MOWTODOCK)
  setvar $MENUS~QSS[13] "Mow To Stardock"
elseif ($MENUS~FMOWTODOCK)
  setvar $MENUS~QSS[13] "Fuel Mow to Stardock"
elseif ($MENUS~MOWTOALPHA)
  setvar $MENUS~QSS[13] "Mow To Alpha"
elseif ($MENUS~MOWTORYLOS)
  setvar $MENUS~QSS[13] "Mow To Rylos"
elseif ($MENUS~MOWTOOTHER)
  setvar $MENUS~QSS[13] "Mow To Custom TA"
elseif ($MENUS~XPORTTOSHIP)
  setvar $MENUS~QSS[13] "Xport to ship"
elseif ($MENUS~LANDONTERRA)
  setvar $MENUS~QSS[13] "Land on Terra"
elseif ($MENUS~LANDONSTARDOCK)
  setvar $MENUS~QSS[13] "Land on Stardock"
else
  setvar $MENUS~QSS[13] "Nothing"
end
loadvar $MENUS~COMMAND_TO_ISSUE
if (($MENUS~COMMAND_TO_ISSUE = "") or ($MENUS~COMMAND_TO_ISSUE = 0))
  setvar $MENUS~QSS[14] "None"
else
  setvar $MENUS~QSS[14] $MENUS~COMMAND_TO_ISSUE
end
loadvar $MENUS~START_MOW_OPTION
if (($MENUS~START_MOW_OPTION = "") or ($MENUS~START_MOW_OPTION = 0))
  setvar $MENUS~QSS[15] "Direct"
elseif ($MENUS~START_MOW_OPTION = "backdoor")
  setvar $MENUS~QSS[15] "Via Backdoor"
elseif ($MENUS~START_MOW_OPTION = "i1")
  setvar $MENUS~QSS[15] "Indirect Mow 1"
elseif ($MENUS~START_MOW_OPTION = "i2")
  setvar $MENUS~QSS[15] "Indirect Mow 2"
elseif ($MENUS~START_MOW_OPTION = "i3")
  setvar $MENUS~QSS[15] "Indirect Mow 3"
end
if (($BOT~STARTMACRO = "") or ($BOT~STARTMACRO = 0))
  setvar $MENUS~QSS[16] "None"
else
  replacetext $BOT~STARTMACRO "*" #42
  setvar $MENUS~QSS[16] $BOT~STARTMACRO
end
if (($BOT~TEAMMATES = "") or ($BOT~TEAMMATES = 0))
  setvar $MENUS~QSS[17] "None"
else
  setvar $MENUS~QSS[17] $BOT~STARTMACRO
end
setvar $MENUS~QSS[18] ""
setvar $MENUS~QSS[19] ""
setvar $MENUS~QSS[20] ""
setvar $MENUS~QSS[21] ""
setvar $MENUS~QSS[22] ""
setvar $MENUS~QSS[23] ""
setvar $MENUS~QSS[24] ""
setvar $MENUS~QSS[25] ""
setvar $MENUS~QSS[26] ""
setvar $MENUS~QSS_TOTAL 26
gosub :MENUSPACING
echo "**"
echo ANSI_11&" Relog Menu   (Q to quit, Z to start logging in.)         *"
echo ANSI_10&#27&"[35m<"&#27&"[32m1"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[7]&"*"
echo "*"
echo ANSI_10&#27&"[35m<"&#27&"[32mB"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[1]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mN"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[2]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mL"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[3]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mP"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[4]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32mG"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[5]&"*"
if ($BOT~NEWGAMEOLDER = FALSE)
  echo ANSI_10&#27&"[35m<"&#27&"[32mS"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[6]&"*"
end
if ($BOT~NEWGAMEDAY1 = TRUE)
  echo ANSI_10&#27&"[35m<"&#27&"[32m2"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[8]&"*"
  echo ANSI_10&#27&"[35m<"&#27&"[32m3"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[9]&"*"
  echo ANSI_10&#27&"[35m<"&#27&"[32m4"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[10]&"*"
  echo ANSI_10&#27&"[35m<"&#27&"[32m5"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[11]&"*"
end
echo ANSI_10&#27&"[35m<"&#27&"[32m6"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[12]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m7"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[13]&"*"
if (($BOT~MOWTODOCK = TRUE) or ($MENUS~MOWTOALPHA = TRUE) or ($MENUS~MOWTORYLOS = TRUE) or ($MENUS~MOWTOOTHER = TRUE) or ($MENUS~FMOWTODOCK = TRUE))
  echo ANSI_10&#27&"[35m<"&#27&"[32mM"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[15]&"*"
end
echo ANSI_10&#27&"[35m<"&#27&"[32m8"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[14]&"*"
echo ANSI_10&#27&"[35m<"&#27&"[32m9"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[16]&"*"
if ($BOT~NEWGAMEOLDER <> TRUE)
  echo ANSI_10&#27&"[35m<"&#27&"[32mT"&#27&"[35m> "&ANSI_7&$MENUS~QSS_VAR[17]&"*"
end
echo "*"
:MENUS~GETSTARTGAMEINPUT
getconsoleinput $MENUS~CHOSEN_OPTION SINGLEKEY
killalltriggers
uppercase $MENUS~CHOSEN_OPTION
:MENUS~PROCESS_START_COMMAND
if ($MENUS~CHOSEN_OPTION = "?")
  goto :PREGAMEMENU
elseif ($MENUS~CHOSEN_OPTION = "B")
  killalltriggers
  getinput $MENUS~NEW_BOT_NAME ANSI_13&"What is the 'in game' name of the bot? (one word, no spaces)"&ANSI_7
  striptext $MENUS~NEW_BOT_NAME "^"
  striptext $MENUS~NEW_BOT_NAME " "
  if ($MENUS~NEW_BOT_NAME = "")
    goto :PREGAMEMENU
  end
  delete $BOT~GCONFIG_FILE
  write $BOT~GCONFIG_FILE $MENUS~NEW_BOT_NAME
  setvar $BOT~BOT_NAME $MENUS~NEW_BOT_NAME
  setvar $SWITCHBOARD~BOT_NAME $MENUS~NEW_BOT_NAME
  savevar $SWITCHBOARD~BOT_NAME
  savevar $BOT~BOT_NAME
elseif ($MENUS~CHOSEN_OPTION = "P")
  killalltriggers
  getinput $BOT~PASSWORD "Please Enter your Game Password"
  savevar $BOT~PASSWORD
elseif ($MENUS~CHOSEN_OPTION = "G")
  killalltriggers
  getinput $BOT~LETTER "Please Enter your Game Letter"
  savevar $BOT~LETTER
elseif ($MENUS~CHOSEN_OPTION = "N")
  killalltriggers
  getinput $BOT~SERVERNAME "Please Enter your Server Name"
  savevar $BOT~SERVERNAME
elseif ($MENUS~CHOSEN_OPTION = "L")
  killalltriggers
  getinput $BOT~USERNAME "Please Enter your Login Name"
  savevar $BOT~USERNAME
elseif ($MENUS~CHOSEN_OPTION = "S")
  killalltriggers
  getinput $BOT~STARTSHIPNAME "What ship name would you like?"
  savevar $BOT~STARTSHIPNAME
elseif ($MENUS~CHOSEN_OPTION = 1)
  if ($BOT~NEWGAMEDAY1)
    setvar $BOT~NEWGAMEDAY1 FALSE
    setvar $BOT~NEWGAMEOLDER TRUE
  elseif ($BOT~NEWGAMEOLDER)
    setvar $BOT~NEWGAMEDAY1 FALSE
    setvar $BOT~NEWGAMEOLDER FALSE
  else
    setvar $BOT~NEWGAMEDAY1 TRUE
    setvar $BOT~NEWGAMEOLDER FALSE
  end
elseif (($MENUS~CHOSEN_OPTION = 2) and (($BOT~NEWGAMEDAY1 = TRUE) or ($BOT~NEWGAMEOLDER = TRUE)))
  if ($BOT~ISCEO)
    setvar $BOT~ISCEO FALSE
  else
    setvar $BOT~ISCEO TRUE
  end
elseif (($MENUS~CHOSEN_OPTION = 3) and (($BOT~NEWGAMEDAY1 = TRUE) or ($BOT~NEWGAMEOLDER = TRUE)))
  getinput $MENUS~TEMP "What Corp Name will you use?"
  if ($MENUS~TEMP = 0)
    setvar $MENUS~TEMP ""
  end
  setvar $BOT~CORPNAME $MENUS~TEMP
  savevar $BOT~CORPNAME
elseif (($MENUS~CHOSEN_OPTION = 4) and (($BOT~NEWGAMEDAY1 = TRUE) or ($BOT~NEWGAMEOLDER = TRUE)))
  getinput $MENUS~TEMP "What Corp Password will you use?"
  if ($MENUS~TEMP = 0)
    setvar $MENUS~TEMP ""
  end
  setvar $BOT~CORPPASSWORD $MENUS~TEMP
elseif (($MENUS~CHOSEN_OPTION = 5) and (($BOT~NEWGAMEDAY1 = TRUE) or ($BOT~NEWGAMEOLDER = TRUE)))
  getinput $MENUS~TEMP "What subspace channel do you want to use?"
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    if (($MENUS~TEMP <= 60000) and ($MENUS~TEMP >= 0))
      setvar $BOT~SUBSPACE $MENUS~TEMP
    end
  end
elseif ($MENUS~CHOSEN_OPTION = 6)
  getinput $MENUS~TEMP "How long in minutes before the game starts?"
  isnumber $MENUS~TEST $MENUS~TEMP
  if ($MENUS~TEST)
    setvar $BOT~STARTGAMEDELAY $MENUS~TEMP
  end
elseif ($MENUS~CHOSEN_OPTION = 7)
  if ($MENUS~XPORTTOSHIP)
    setvar $MENUS~QSS[12] "Nothing"
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $MENUS~MOWDESTINATION ""
    setvar $MENUS~DO_NOTHING TRUE
    setvar $MENUS~FMOWTODOCK FALSE
  elseif (($BOT~MOWTODOCK = FALSE) and (($MENUS~MOWTOALPHA = FALSE) and (($MENUS~FMOWTODOCK = FALSE) and (($MENUS~MOWTORYLOS = FALSE) and (($MENUS~MOWTOOTHER = FALSE) and (($MENUS~XPORTTOSHIP = FALSE) and (($MENUS~LANDONTERRA = FALSE) and ($MENUS~LANDONSTARDOCK = FALSE))))))))
    setvar $MENUS~QSS[12] "Land on Terra"
    setvar $MENUS~DO_NOTHING FALSE
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~LANDONTERRA TRUE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $MENUS~MOWDESTINATION ""
    setvar $MENUS~FMOWTODOCK FALSE
  elseif ($MENUS~LANDONTERRA)
    setvar $MENUS~QSS[12] "Land on Stardock"
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK TRUE
    setvar $MENUS~MOWDESTINATION ""
    setvar $MENUS~DO_NOTHING FALSE
    setvar $MENUS~FMOWTODOCK FALSE
  elseif ($MENUS~LANDONSTARDOCK)
    setvar $MENUS~QSS[12] "Mow To Custom TA"
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~MOWTOOTHER TRUE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $MENUS~MOWDESTINATION ""
    setvar $MENUS~DO_NOTHING FALSE
    setvar $MENUS~FMOWTODOCK FALSE
  elseif ($MENUS~MOWTOOTHER)
    setvar $MENUS~QSS[12] "Mow to Stardock"
    setvar $BOT~MOWTODOCK TRUE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $MENUS~DO_NOTHING FALSE
    setvar $MENUS~FMOWTODOCK FALSE
    setvar $MENUS~MOWDESTINATION $MAP~STARDOCK
  elseif ($BOT~MOWTODOCK)
    setvar $MENUS~QSS[12] "Fuel Mow to Stardock"
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~XPORTTOSHIP FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $MENUS~DO_NOTHING FALSE
    setvar $MENUS~FMOWTODOCK TRUE
    setvar $MENUS~MOWDESTINATION $MAP~STARDOCK
  elseif ($MENUS~FMOWTODOCK)
    setvar $MENUS~QSS[12] "Xport to Ship"
    setvar $MENUS~XPORTTOSHIP TRUE
    setvar $MENUS~MOWTOALPHA FALSE
    setvar $MENUS~MOWTORYLOS FALSE
    setvar $MENUS~MOWTOOTHER FALSE
    setvar $MENUS~LANDONTERRA FALSE
    setvar $MENUS~LANDONSTARDOCK FALSE
    setvar $BOT~MOWTODOCK FALSE
    setvar $MENUS~MOWDESTINATION ""
    setvar $MENUS~DO_NOTHING FALSE
    setvar $MENUS~FMOWTODOCK FALSE
  end
  savevar $MENUS~XPORTTOSHIP
  savevar $MENUS~FMOWTODOCK
  savevar $MENUS~MOWTOALPHA
  savevar $MENUS~MOWTORYLOS
  savevar $MENUS~MOWTOOTHER
  savevar $BOT~MOWTODOCK
  savevar $MENUS~LANDONTERRA
  savevar $MENUS~LANDONSTARDOCK
  savevar $MENUS~DO_NOTHING
elseif ($MENUS~CHOSEN_OPTION = "M")

  if ($MENUS~START_MOW_OPTION = "i3")
    setvar $MENUS~QSS[14] "Direct"
    setvar $MENUS~START_MOW_OPTION ""
  elseif (($MENUS~START_MOW_OPTION = "") or ($MENUS~START_MOW_OPTION = 0))
    setvar $MENUS~QSS[14] "Via Backdoor"
    setvar $MENUS~START_MOW_OPTION "backdoor"
  elseif ($MENUS~START_MOW_OPTION = "backdoor")
    setvar $MENUS~QSS[14] "Indirect Mow 1"
    setvar $MENUS~START_MOW_OPTION "i1"
  elseif ($MENUS~START_MOW_OPTION = "i1")
    setvar $MENUS~QSS[14] "Indirect Mow 2"
    setvar $MENUS~START_MOW_OPTION "i2"
  elseif ($MENUS~START_MOW_OPTION = "i2")
    setvar $MENUS~QSS[14] "Indirect Mow 3"
    setvar $MENUS~START_MOW_OPTION "i3"
  end
  savevar $MENUS~START_MOW_OPTION
elseif ($MENUS~CHOSEN_OPTION = 8)
  getinput $MENUS~TEMP "Enter a command line for the bot to run after entering game (No bot name needed)"
  setvar $MENUS~COMMAND_TO_ISSUE $MENUS~TEMP
  savevar $MENUS~COMMAND_TO_ISSUE

elseif ($MENUS~CHOSEN_OPTION = 9)
  getinput $BOT~STARTMACRO "What macro should fire upon entry?"
  replacetext $BOT~STARTMACRO "*" #42
elseif ($MENUS~CHOSEN_OPTION = "T")
  getinput $BOT~TEAMMATES "Enter teammate names (separated by commas)"
elseif ($MENUS~CHOSEN_OPTION = "Q")
  stop $BOT~LAST_LOADED_MODULE
  savevar $BOT~LAST_LOADED_MODULE
  halt
elseif ($MENUS~CHOSEN_OPTION = "Z")
  replacetext $BOT~STARTMACRO "^m" #42
  replacetext $BOT~STARTMACRO "^M" #42
  savevar $BOT~STARTMACRO
  :MENUS~GETMOWSECTOR
  killalltriggers
  if ($MENUS~MOWTOOTHER)
    getinput $MENUS~TEMP "What mow destination do you want to use?"
    isnumber $MENUS~TEST $MENUS~TEMP
    if ($MENUS~TEST)
      if (($MENUS~TEMP <= SECTORS) and ($MENUS~TEMP > 0))
        setvar $MENUS~MOWDESTINATION $MENUS~TEMP
      else
        goto :GETMOWSECTOR
      end
    else
      goto :GETMOWSECTOR
    end
  end
  if ($MENUS~XPORTTOSHIP)
    getinput $MENUS~TEMP "What ship do you want to xport to?"
    isnumber $MENUS~TEST $MENUS~TEMP
    if ($MENUS~TEST <> TRUE)
      goto :GETMOWSECTOR
    else
      setvar $MENUS~MOWDESTINATION $MENUS~TEMP
    end
  end
  setvar $INTERNAL_COMMANDS~TIMETOLOGBACKIN ($BOT~STARTGAMEDELAY * 60)
  if ($INTERNAL_COMMANDS~TIMETOLOGBACKIN > 0)
    killalltriggers
  end
  settextouttrigger LOGEARLY :ENDDELAYSTARTGAME #32
  while ($INTERNAL_COMMANDS~TIMETOLOGBACKIN > 0)
    gosub :INTERNAL_COMMANDS~CALCTIME
    echo ANSI_10 #27&"[1A"&#27&"[K"&$INTERNAL_COMMANDS~HOURS ":" $INTERNAL_COMMANDS~MINUTES ":" $INTERNAL_COMMANDS~SECONDS " left before entering game " GAME " (" GAMENAME ") "&ANSI_15&" ["&ANSI_14&"Spacebar to relog"&ANSI_15&"]*"
    setdelaytrigger TIMEBEFORERELOG :STARTGAMETIMER 1000
    pause
    :MENUS~STARTGAMETIMER
    setvar $INTERNAL_COMMANDS~TIMETOLOGBACKIN ($INTERNAL_COMMANDS~TIMETOLOGBACKIN - 1)
  end
  :MENUS~ENDDELAYSTARTGAME
  killalltriggers
  if ($BOT~NEWGAMEOLDER = TRUE)
    setvar $CONNECTIVITY~NEWGAME FALSE
    load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
    seteventtrigger 1 :RELOGENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
    pause
    :MENUS~RELOGENDED
    gosub :CONNECTIVITY~MOVING
  elseif ($BOT~NEWGAMEDAY1 = TRUE)
    setvar $CONNECTIVITY~NEWGAME TRUE
    gosub :CONNECTIVITY~ENTER_NEW_GAME
  else
    setvar $CONNECTIVITY~NEWGAME FALSE
    gosub :CONNECTIVITY~ENTER_NEW_GAME
  end
  loadvar $BOT~STARTMACRO
  if ($BOT~STARTMACRO <> "")
    replacetext $BOT~STARTMACRO #42 "*"
    send $BOT~STARTMACRO
    setvar $BOT~STARTMACRO ""
    savevar $BOT~STARTMACRO
  end
  goto :DONEPREGAME
else
  goto :GETSTARTGAMEINPUT
end
gosub :PREGAMESTATS
goto :PREGAMEMENU
:MENUS~DONEPREGAME
if (($BOT~TEAMMATES <> "") and ($BOT~TEAMMATES <> 0))
  splittext $BOT~TEAMMATES $MENUS~CORP_LIST ","
  setvar $MENUS~I 1
  while ($MENUS~I <= $MENUS~CORP_LIST)
    setvar $MENUS~J 1
    setvar $MENUS~ISFOUND FALSE
    trim $MENUS~CORP_LIST[$MENUS~I]
    while ($MENUS~J <= $MENUS~CORPYCOUNT)
      trim $BOT~CORPY[$MENUS~J]
      setvar $MENUS~CORPY_LOWER $BOT~CORPY[$MENUS~J]
      setvar $MENUS~CORP_LIST_LOWER $MENUS~CORP_LIST[$MENUS~I]
      lowercase $MENUS~CORPY_LOWER
      lowercase $MENUS~CORP_LIST_LOWER
      if ($MENUS~CORP_LIST_LOWER = $MENUS~CORPY_LOWER)
        setvar $MENUS~ISFOUND TRUE
      end
      add $MENUS~J 1
    end
    if ($MENUS~ISFOUND <> TRUE)
      add $MENUS~CORPYCOUNT 1
      setvar $BOT~CORPY[$MENUS~CORPYCOUNT] $MENUS~CORP_LIST[$MENUS~I]
    end
    add $MENUS~I 1
  end
end
goto :BOT~GETINITIAL_SETTINGS

return
:MENUS~PREGAMESTATS
gosub :BOT~SAVE_THE_VARIABLES
return
:MENUS~MENUSPACING
setvar $MENUS~QSS_SS 0
setvar $MENUS~QSS_COUNT 1
setvar $MENUS~SPC " "
setvar $MENUS~OVERALL 15
while ($MENUS~QSS_COUNT <= $MENUS~QSS_TOTAL)
  setvar $MENUS~SPC_COUNT 1
  setvar $MENUS~CHECKLENGTH $MENUS~H[$MENUS~QSS_COUNT]&""&$MENUS~QSS[$MENUS~QSS_COUNT]
  setvar $MENUS~QSS_VAR[$MENUS~QSS_COUNT] ANSI_15&$MENUS~H[$MENUS~QSS_COUNT]&" "&ANSI_14&$MENUS~QSS[$MENUS~QSS_COUNT]&ANSI_7
  getlength $MENUS~CHECKLENGTH $MENUS~LENGTH
  setvar $MENUS~SPACE 34
  subtract $MENUS~SPACE $MENUS~LENGTH
  while ($MENUS~SPC_COUNT <= $MENUS~SPACE)
    mergetext $MENUS~QSS_VAR[$MENUS~QSS_COUNT] $MENUS~SPC $MENUS~QSS_VAR[$MENUS~QSS_COUNT]
    add $MENUS~SPC_COUNT 1
  end
  add $MENUS~QSS_COUNT 1
end
return
:MENUS~DOSPLASHSCREEN

setdelaytrigger DRAW_DELAY :DRAW_DELAY 500
pause
pause
:MENUS~DRAW_DELAY

echo ANSI_4 "***"
echo ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
echo ANSI_12
echo "                                                                                     *"
echo "                                                                                     *"
echo " /$$      /$$ /$$                 /$$         /$$$/$$$                               *"
echo "| $$$    /$$$|__/                | $$        /$$_/_  $$                              *"
echo "| $$$$  /$$$$ /$$ /$$$$$$$   /$$$$$$$       /$$/   \  $$ /$$    /$$/$$$$$$   /$$$$$$ *"
echo "| $$ $$/$$ $$| $$| $$__  $$ /$$__  $$      | $$     | $$|  $$  /$$/$$__  $$ /$$__  $$*"
echo "| $$  $$$| $$| $$| $$  \ $$| $$  | $$      | $$     | $$ \  $$/$$/ $$$$$$$$| $$  \__/*"
echo "| $$\  $ | $$| $$| $$  | $$| $$  | $$      |  $$    /$$/  \  $$$/| $$_____/| $$      *"
echo "| $$ \/  | $$| $$| $$  | $$|  $$$$$$$       \  $$$/$$$/    \  $/ |  $$$$$$$| $$      *"
echo "|__/     |__/|__/|__/  |__/ \_______/        \___/___/      \_/   \_______/|__/      *"
echo "                                                                                     *"
echo "                                                                                     *"
echo "                                                                                     *"
echo "       /$$      /$$             /$$     /$$                                          *"
echo "      | $$$    /$$$            | $$    | $$                                          *"
echo "      | $$$$  /$$$$  /$$$$$$  /$$$$$$ /$$$$$$    /$$$$$$   /$$$$$$                   *"
echo "      | $$ $$/$$ $$ |____  $$|_  $$_/|_  $$_/   /$$__  $$ /$$__  $$                  *"
echo "      | $$  $$$| $$  /$$$$$$$  | $$    | $$    | $$$$$$$$| $$  \__/                  *"
echo "      | $$\  $ | $$ /$$__  $$  | $$ /$$| $$ /$$| $$_____/| $$                        *"
echo "      | $$ \/  | $$|  $$$$$$$  |  $$$$/|  $$$$/|  $$$$$$$| $$                        *"
echo "      |__/     |__/ \_______/   \___/   \___/   \_______/|__/                        *"
echo "                                                                                     *"
echo "                                                                                     *"
echo "                                                                                     *"
echo "                 /$$$$$$$              /$$                                           *"
echo "                | $$__  $$            | $$                                           *"
echo "                | $$  \ $$  /$$$$$$  /$$$$$$                                         *"
echo "                | $$$$$$$  /$$__  $$|_  $$_/                                         *"
echo "                | $$__  $$| $$  \ $$  | $$                                           *"
echo "                | $$  \ $$| $$  | $$  | $$ /$$                                       *"
echo "                | $$$$$$$/|  $$$$$$/  |  $$$$/                                       *"
echo "                |_______/  \______/    \___/                                         *"
echo "                                                                                     *"
echo "[0m*[1;33m       Created by: The Bounty Hunter, Mind Dagger, Lonestar, and Hammer[0m*[1;33m                    Testing by: Misbehavin and DaCreeper**"
echo "[0m*[1;33m       Credits: Oz, Zentock, SupG, Dynarri, Cherokee, Alexio, Xide,"
echo "[0m*[1;33m                Phx, Rincrast, Voltron, Traitor, Parrothead,"
echo "[0m*[1;33m                PSI, Elder Prophet, Caretaker, Deign*"

echo "**"&ANSI_14 "       Version: " ANSI_15 $BOT~MAJOR_VERSION "." $BOT~MINOR_VERSION "*"
echo ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "***"

return
:MENUS~GETINPUT



gosub :BOT~KILLTHETRIGGERS
setdeafclients FALSE
getinput $MENUS~RESPONSE $MENUS~QUESTION
setdeafclients TRUE
return
