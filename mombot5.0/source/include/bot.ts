#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~KILLTHETRIGGERS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
setdelaytrigger UNFREEZINGTRIGGER :UNFREEZEBOT 100000
return
:BOT~BIGDELAY_KILLTHETRIGGERS
killalltriggers
setdelaytrigger UNFREEZINGTRIGGERBIGDELAY :UNFREEZEBOT 1800000
return
:BOT~UNFREEZEBOT
echo "*Bot timed out, unfreezing..*"
setdeafclients FALSE
setvar $switchboard~message "Bot frozen for over 100 seconds, resetting...*"
gosub :switchboard~switchboard
goto :WAIT_FOR_COMMAND

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~WAIT_FOR_COMMAND
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers

if (CONNECTED)
  setvar $CONNECTIVITY~RELOGGING FALSE
  savevar $CONNECTIVITY~RELOGGING
end

setvar $USER_INTERFACE~ROUTING ""
setvar $USER_INTERFACE~TEMP_BOT_NAME ""
loadvar $BOT~BOTISDEAF
loadvar $PLANET~PLANET
loadvar $BOT~MODE
loadvar $BOT~IN_KILL_ROUTINE
setvar $BOT~ALIVE_COUNT 0
loadvar $MAP~HOME_SECTOR
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~STARDOCK
loadvar $MAP~BACKDOOR
loadvar $BOT~SAFE_SHIP
loadvar $BOT~BOT_TURN_LIMIT
loadvar $BOT~PGRID_BOT
if ($MAP~STARDOCK <= 0)
  setvar $MAP~STARDOCK STARDOCK
  savevar $MAP~STARDOCK
end
if ($MAP~RYLOS <= 0)
  setvar $MAP~RYLOS RYLOS
  savevar $MAP~RYLOS
end
if ($MAP~ALPHA_CENTAURI <= 0)
  setvar $MAP~ALPHA_CENTAURI ALPHACENTAURI
  savevar $MAP~ALPHA_CENTAURI
end

setvar $SWITCHBOARD~SELF_COMMAND FALSE
setvar $BOT~SCRUBONLY FALSE
settextouttrigger USER :USER_INTERFACE~USER_ACCESS ">"
settextouttrigger UPARROW :USER_INTERFACE~USER_ACCESS #28
settextouttrigger DOWNARROW :USER_INTERFACE~USER_ACCESS #29
settextouttrigger UPARROW2 :USER_INTERFACE~USER_ACCESS #27&"[A"
settextouttrigger DOWNARROW2 :USER_INTERFACE~USER_ACCESS #27&"[B"
settextouttrigger TABKEY :USER_INTERFACE~HOTKEY_ACCESS #9

setvar $USER_INTERFACE~AUTHORIZATION 0
setvar $USER_INTERFACE~LOGGED 0
if ($BOT~BOT_TEAM_NAME = 0)
  setvar $BOT~BOT_TEAM_NAME $BOT~BOT_NAME
  savevar $BOT~BOT_TEAM_NAME
end
loadvar $BOT~LAST_LOADED_MODULE
seteventtrigger SHUTDOWNTHEMODULE :INTERNAL_COMMANDS~SHUTDOWN "SCRIPT STOPPED" $BOT~LAST_LOADED_MODULE
settextlinetrigger OWN_COMMAND :USER_INTERFACE~CHECK_ROUTING $BOT~BOT_NAME
settextlinetrigger OWN_COMMAND_TEAM :USER_INTERFACE~CHECK_ROUTING_TEAM $BOT~BOT_TEAM_NAME
settextlinetrigger OWN_COMMAND_ALL :USER_INTERFACE~CHECK_ROUTING_ALL "all"
settextlinetrigger LOGINMEMO :INTERNAL_COMMANDS~LOGINMEMO "a corporate memo "

if (($BOT~MODE = "General") and (($BOT~AUTOATTACK = TRUE) and ($BOT~IN_KILL_ROUTINE <> TRUE)))
  settextlinetrigger 1 :INTERNAL_COMMANDS~AUTOKILL "warps into the sector."
  settextlinetrigger 2 :INTERNAL_COMMANDS~AUTOKILL "lifts off from"
  settextlinetrigger 3 :INTERNAL_COMMANDS~AUTOKILL "is powering up weapons systems!"
  settextlinetrigger 4 :INTERNAL_COMMANDS~AUTOKILL "enters the game."
  settextlinetrigger 5 :INTERNAL_COMMANDS~AUTOKILL "blasts off from the "
  settextlinetrigger 6 :INTERNAL_COMMANDS~AUTOKILL "Scanners detect a wormhole opening in this sector!"
end
seteventtrigger RELOG :CONNECTIVITY~KEEPALIVE "CONNECTION LOST"
settexttrigger ONLINE_WATCH :CONNECTIVITY~ONLINE_WATCH "Your session will be terminated in "
setdelaytrigger KEEPALIVE :CONNECTIVITY~KEEPALIVE 60000
pause
pause

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~SAVE_THE_VARIABLES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
savevar $BOT~COMMAND
savevar $BOT~COMMAND_TYPED
savevar $BOT~USER_COMMAND_LINE
savevar $BOT~BOT_NAME
savevar $SWITCHBOARD~BOT_NAME
savevar $BOT~SELF_COMMAND
savevar $SWITCHBOARD~SELF_COMMAND
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3
savevar $BOT~PARM4
savevar $BOT~PARM5
savevar $BOT~PARM6
savevar $BOT~PARM7
savevar $BOT~PARM8
savevar $PLAYER~UNLIMITEDGAME
setvar $BOT~UNLIMITEDGAME $PLAYER~UNLIMITEDGAME
setvar $~UNLIMITEDGAME $BOT~UNLIMITEDGAME
savevar $~UNLIMITEDGAME
savevar $BOT~UNLIMITEDGAME
savevar $SHIP~CAP_FILE
savevar $PLANET~PLANET_FILE
savevar $BOT~BOT_TURN_LIMIT
savevar $BOT~PASSWORD
savevar $BOT~MODE
savevar $GAME~MBBS
savevar $GAME~PTRADESETTING
setvar $BOT~_CK_PTRADESETTING $GAME~PTRADESETTING
savevar $BOT~_CK_PTRADESETTING
savevar $MAP~RYLOS
savevar $MAP~ALPHA_CENTAURI
savevar $MAP~STARDOCK
savevar $MAP~BACKDOOR
savevar $MAP~HOME_SECTOR
savevar $BOT~RYLOS
savevar $BOT~ALPHA_CENTAURI
savevar $BOT~STARDOCK
savevar $BOT~BACKDOOR
savevar $BOT~HOME_SECTOR
savevar $GAME~PORT_MAX
savevar $GAME~STEAL_FACTOR
savevar $GAME~ROB_FACTOR
savevar $BOT~SUBSPACE
savevar $GAME~MULTIPLE_PHOTONS
savevar $BOT~ALARM_LIST
savevar $BOT~ECHOINTERVAL
if ($BOT~BOT_PASSWORD = 0)
  setvar $BOT~BOT_PASSWORD $BOT~SUBSPACE
end
savevar $BOT~BOT_PASSWORD
savevar $PLAYER~SURROUNDAVOIDSHIELDEDONLY
savevar $PLAYER~SURROUNDAVOIDALLPLANETS
savevar $PLAYER~SURROUNDDONTAVOID
savevar $BOT~SURROUNDAUTOCAPTURE
savevar $PLAYER~SURROUNDFIGS
savevar $PLAYER~SURROUNDLIMP
savevar $PLAYER~SURROUNDMINE
savevar $PLAYER~DROPOFFENSIVE
savevar $PLAYER~DROPTOLL
savevar $PLAYER~FIGHTER_DEPLOY_TYPE
savevar $PLAYER~SURROUNDOVERWRITE
savevar $PLAYER~SURROUNDPASSIVE
savevar $PLAYER~SURROUNDNORMAL
savevar $BOT~USERNAME
savevar $BOT~SERVERNAME
savevar $BOT~LETTER
savevar $PLAYER~DEFENDERCAPPING
savevar $PLAYER~OFFENSECAPPING
savevar $BOT~SAFE_SHIP
savevar $BOT~SAFE_PLANET
savevar $PLAYER~CAPPINGALIENS
savevar $PLAYER~SURROUND_BEFORE_HKILL
savevar $BOT~COMMAND_PROMPT_EXTRAS
savevar $BOT~SILENT_RUNNING
savevar $MAP~PLANET_LIST
savevar $BOT~STARTSHIPNAME
savevar $BOT~MOWTODOCK
savevar $BOT~MOWTODOCKBACKDOOR
savevar $BOT~STARTGAMEDELAY
savevar $BOT~ISCEO
savevar $BOT~CORPNAME
savevar $BOT~CORPPASSWORD
savevar $BOT~NEWGAMEDAY1
savevar $BOT~NEWGAMEOLDER
savevar $BOT~PGRID_BOT
savevar $BOT~AUTOATTACK
gosub :BOT~BACKWARDS_COMPATIBLE
return
:BOT~BACKWARDS_COMPATIBLE
setVar  $safe_ship $bot~safe_ship
saveVar $safe_ship
setVar  $safe_planet $bot~safe_planet
saveVar $safe_planet
setVar $command $bot~command
saveVar $command
setVar $command_typed $bot~command_typed
saveVar $command_typed
setvar $user_command_line $bot~user_command_line
saveVar $user_command_line
setVar $bot_name $bot~bot_name
saveVar $bot_name
setVar $self_command $bot~self_command
saveVar $self_command
setVar $command_caller $bot~command_caller
saveVar $command_caller
setvar $parm1 $bot~parm1
setvar $parm2 $bot~parm2
setvar $parm3 $bot~parm3
setvar $parm4 $bot~parm4
setvar $parm5 $bot~parm5
setvar $parm6 $bot~parm6
setvar $parm7 $bot~parm7
setvar $parm8 $bot~parm8
if ($parm1 = "")
  setvar $parm1 "0"
end
if ($parm2 = "")
  setvar $parm2 "0"
end
if ($parm3 = "")
  setvar $parm3 "0"
end
if ($parm4 = "")
  setvar $parm4 "0"
end
if ($parm5 = "")
  setvar $parm5 "0"
end
if ($parm6 = "")
  setvar $parm6 "0"
end
if ($parm7 = "")
  setvar $parm7 "0"
end
if ($parm8 = "")
  setvar $parm8 "0"
end
saveVar $parm1
saveVar $parm2
saveVar $parm3
saveVar $parm4
saveVar $parm5
saveVar $parm6
saveVar $parm7
saveVar $parm8
setVar $rylos $map~rylos
saveVar $rylos
setVar $alpha_centauri $map~alpha_centauri
saveVar $alpha_centauri
setVar $stardock $map~stardock
saveVar $stardock
setVar $backdoor $map~backdoor
saveVar $backdoor
setVar $home_sector $map~home_sector
saveVar $home_sector
setVar $alarm_list $bot~alarm_list
saveVar $alarm_list
setVar $unlimitedGame $player~unlimitedGame
saveVar $unlimitedGame
setVar $bot_turn_limit $bot~bot_turn_limit
saveVar $bot_turn_limit
setVar $steal_factor $game~steal_factor
setVar $rob_factor $game~rob_factor
setVar $actual_steal_factor $game~actual_steal_factor
setVar $actual_rob_factor $game~actual_rob_factor
saveVar $actual_steal_factor
saveVar $actual_rob_factor
saveVar $steal_factor
saveVar $rob_factor
setVar $password $bot~password
saveVar $password
setVar $mode $bot~mode
saveVar $mode
setVar $silent_running $bot~silent_running
saveVar $silent_running
setVar $only_help $BOT~ONLY_HELP
saveVar $only_help
setVar $subspace $bot~subspace
saveVar $subspace
setvar $letter $bot~letter
savevar $letter
setvar $game_menu_prompt_ansi $game~game_menu_prompt_ansi
setvar $game_menu_prompt $game~game_menu_prompt
setvar $offenseCapping $PLAYER~offenseCapping
setvar $cappingAliens $PLAYER~cappingAliens
setvar $ATOMIC_COST $GAME~ATOMIC_COST
setvar $BEACON_COST $GAME~BEACON_COST
setvar $CORBO_COST $GAME~CORBO_COST
setvar $CLOAK_COST $GAME~CLOAK_COST
setvar $PROBE_COST $GAME~PROBE_COST
setvar $PLANET_SCANNER_COST $GAME~PLANET_SCANNER_COST
setvar $LIMPET_COST $GAME~LIMPET_COST
setvar $ARMID_COST $GAME~ARMID_COST
setvar $PHOTON_COST $GAME~PHOTON_COST
setvar $HOLO_COST $GAME~HOLO_COST
setvar $DENSITY_COST $GAME~DENSITY_COST
setvar $DISRUPTOR_COST $GAME~DISRUPTOR_COST
setvar $GENESIS_COST $GAME~GENESIS_COST
setvar $TWARPI_COST $GAME~TWARPI_COST
setvar $TWARPII_COST $GAME~TWARPII_COST
setvar $PSYCHIC_COST $GAME~PSYCHIC_COST
setvar $PHOTONS_ENABLED $GAME~PHOTONS_ENABLED
setvar $PHOTON_DURATION $GAME~PHOTON_DURATION
setvar $MAX_COMMANDS $GAME~MAX_COMMANDS
setvar $goldEnabled $GAME~goldEnabled
setvar $mbbs $GAME~mbbs
setvar $MULTIPLE_PHOTONS $GAME~MULTIPLE_PHOTONS
setvar $colonist_regen $GAME~colonist_regen
setvar $ptradesetting $GAME~ptradesetting
setvar $CLEAR_BUST_DAYS $GAME~CLEAR_BUST_DAYS
setvar $port_max $GAME~port_max
setvar $PRODUCTION_RATE $GAME~PRODUCTION_RATE
setvar $PRODUCTION_REGEN $GAME~PRODUCTION_REGEN
setvar $DEBRIS_LOSS $GAME~DEBRIS_LOSS
setvar $RADIATION_LIFETIME $GAME~RADIATION_LIFETIME
setvar $LIMPET_REMOVAL_COST $GAME~LIMPET_REMOVAL_COST
setvar $MAX_PLANETS_PER_SECTOR $GAME~MAX_PLANETS_PER_SECTOR
savevar $game_menu_prompt_ansi
savevar $game_menu_prompt
savevar $offenseCapping
savevar $cappingAliens
savevar $ATOMIC_COST
savevar $BEACON_COST
savevar $CORBO_COST
savevar $CLOAK_COST
savevar $PROBE_COST
savevar $PLANET_SCANNER_COST
savevar $LIMPET_COST
savevar $ARMID_COST
savevar $PHOTON_COST
savevar $HOLO_COST
savevar $DENSITY_COST
savevar $DISRUPTOR_COST
savevar $GENESIS_COST
savevar $TWARPI_COST
savevar $TWARPII_COST
savevar $PSYCHIC_COST
savevar $PHOTONS_ENABLED
savevar $PHOTON_DURATION
savevar $MAX_COMMANDS
savevar $goldEnabled
savevar $mbbs
savevar $MULTIPLE_PHOTONS
savevar $colonist_regen
savevar $ptradesetting
savevar $CLEAR_BUST_DAYS
savevar $port_max
savevar $PRODUCTION_RATE
savevar $PRODUCTION_REGEN
savevar $DEBRIS_LOSS
savevar $RADIATION_LIFETIME
savevar $LIMPET_REMOVAL_COST
savevar $MAX_PLANETS_PER_SECTOR
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~LOAD_THE_VARIABLES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $BOT~CORPNAME
loadvar $GAME~GAME_MENU_PROMPT_ANSI
loadvar $GAME~GAME_MENU_PROMPT
loadvar $BOT~ALARM_LIST
loadvar $PLAYER~OFFENSECAPPING
loadvar $PLAYER~CAPPINGALIENS
loadvar $PLANET~PLANET
loadvar $GAME~ATOMIC_COST
loadvar $GAME~BEACON_COST
loadvar $GAME~CORBO_COST
loadvar $GAME~CLOAK_COST
loadvar $GAME~PROBE_COST
loadvar $GAME~PLANET_SCANNER_COST
loadvar $GAME~LIMPET_COST
loadvar $GAME~ARMID_COST
loadvar $GAME~PHOTON_COST
loadvar $GAME~HOLO_COST
loadvar $GAME~DENSITY_COST
loadvar $GAME~DISRUPTOR_COST
loadvar $GAME~GENESIS_COST
loadvar $GAME~TWARPI_COST
loadvar $GAME~TWARPII_COST
loadvar $GAME~PSYCHIC_COST
loadvar $GAME~PHOTONS_ENABLED
loadvar $GAME~PHOTON_DURATION
loadvar $GAME~MAX_COMMANDS
loadvar $GAME~GOLDENABLED
loadvar $GAME~MBBS
loadvar $GAME~MULTIPLE_PHOTONS
loadvar $GAME~COLONIST_REGEN
loadvar $GAME~PTRADESETTING
loadvar $GAME~STEAL_FACTOR
loadvar $GAME~ROB_FACTOR
loadvar $GAME~CLEAR_BUST_DAYS
loadvar $GAME~PORT_MAX
loadvar $GAME~PRODUCTION_RATE
loadvar $GAME~PRODUCTION_REGEN
loadvar $GAME~DEBRIS_LOSS
loadvar $GAME~RADIATION_LIFETIME
loadvar $GAME~LIMPET_REMOVAL_COST
loadvar $GAME~MAX_PLANETS_PER_SECTOR
loadvar $BOT~SUBSPACE
loadvar $BOT~PASSWORD
loadvar $BOT~BOT_PASSWORD
if ($BOT~BOT_PASSWORD = 0)
  setvar $BOT~BOT_PASSWORD $BOT~SUBSPACE
  savevar $BOT~BOT_PASSWORD
end
loadvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY
loadvar $BOT~SURROUNDAUTOCAPTURE
loadvar $PLAYER~SURROUNDAVOIDALLPLANETS
loadvar $PLAYER~SURROUNDDONTAVOID
loadvar $MAP~STARDOCK
loadvar $MAP~BACKDOOR
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~HOME_SECTOR
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
loadvar $BOT~BOT_NAME
setvar $SWITCHBOARD~BOT_NAME $BOT~BOT_NAME
loadvar $PLAYER~SURROUNDOVERWRITE
loadvar $PLAYER~SURROUNDPASSIVE
loadvar $PLAYER~SURROUNDNORMAL
loadvar $BOT~USERNAME
loadvar $BOT~SERVERNAME
loadvar $BOT~LETTER
loadvar $PLAYER~DEFENDERCAPPING
loadvar $BOT~BOT_TURN_LIMIT
loadvar $BOT~SAFE_SHIP
loadvar $BOT~PGRID_BOT
loadvar $BOT~SAFE_PLANET
loadvar $BOT~CORPPASSWORD
loadvar $BOT~BOT_TEAM_NAME
loadvar $BOT~HISTORYSTRING
loadvar $BOT~DORELOG
loadvar $PLAYER~SURROUND_BEFORE_HKILL
loadvar $BOT~COMMAND_PROMPT_EXTRAS
loadvar $BOT~SILENT_RUNNING
loadvar $BOT~AUTOATTACK
loadvar $PLAYER~FIGHTER_DEPLOY_TYPE
loadvar $PLAYER~DROPOFFENSIVE
loadvar $PLAYER~DROPTOLL
gosub :LOADVARS~NORMALIZE_DEPLOY_PREFERENCES
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~MIGRATE_GAME_FOLDER
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
direxists $BOT~LEGACY_FOLDER_EXISTS $BOT~LEGACY_FOLDER
if ($BOT~LEGACY_FOLDER_EXISTS = 0)
  return
end

setvar $BOT~MIGRATE_FILE "bot.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "bot_users.lst"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "_ck_"&GAMENAME&".figs"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "ships.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "dbonus-ships.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "planets.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "fighters.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "fighters.cnt"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "limpets.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "limpets.cnt"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "armids.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "armids.cnt"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "game_settings.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "timer.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "busts.cfg"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "planet.nego"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "bubble.list"
gosub :BOT~MIGRATE_GAME_FILE
setvar $BOT~MIGRATE_FILE "No_Credits.list"
gosub :BOT~MIGRATE_GAME_FILE
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~MIGRATE_GAME_FILE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $BOT~MIGRATE_SOURCE $BOT~LEGACY_FOLDER&"/"&$BOT~MIGRATE_FILE
setvar $BOT~MIGRATE_DEST $BOT~FOLDER&"/"&$BOT~MIGRATE_FILE
fileexists $BOT~MIGRATE_SOURCE_EXISTS $BOT~MIGRATE_SOURCE
if ($BOT~MIGRATE_SOURCE_EXISTS)
  fileexists $BOT~MIGRATE_DEST_EXISTS $BOT~MIGRATE_DEST
  if ($BOT~MIGRATE_DEST_EXISTS = 0)
    rename $BOT~MIGRATE_SOURCE $BOT~MIGRATE_DEST
  end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~GETINITIAL_SETTINGS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $CONNECTIVITY~RELOGGING FALSE
savevar $CONNECTIVITY~RELOGGING
loadvar $GAME~GAMESTATS
setvar $BOT~PGRID_TYPE "Normal"
setvar $BOT~PGRID_END_COMMAND " scan "
getword CURRENTLINE $PLAYER~STARTINGLOCATION 1
fileexists $BOT~SCRIPT_FILE_CHK $BOT~SCRIPT_FILE
if ($BOT~SCRIPT_FILE_CHK)
  setarray $BOT~HOTKEY_SCRIPTS 10 1
  setvar $BOT~I 1
  setvar $BOT~HOTKEY_SCRIPTS 0
  read $BOT~SCRIPT_FILE $BOT~LINE $BOT~I
  while ($BOT~LINE <> "EOF")
    getword $BOT~LINE $BOT~FILELOCATION 1
    getwordpos $BOT~LINE $BOT~POS #34
    if ($BOT~POS <= 0)
      echo "Error with script file. either remove "&$BOT~SCRIPT_FILE&", or fix it*"
      halt
    end
    cuttext $BOT~LINE $BOT~SCRIPTNAME $BOT~POS 9999
    striptext $BOT~SCRIPTNAME #34
    setvar $BOT~HOTKEY_SCRIPTS[$BOT~I] $BOT~FILELOCATION
    setvar $BOT~HOTKEY_SCRIPTS[$BOT~I][1] $BOT~SCRIPTNAME
    add $BOT~I 1
    add $BOT~HOTKEY_SCRIPTS 1
    read $BOT~SCRIPT_FILE $BOT~LINE $BOT~I
  end
else
  setarray $BOT~HOTKEY_SCRIPTS 10 1
end

fileexists $BOT~GFILE_CHK $BOT~GCONFIG_FILE
if ($BOT~GFILE_CHK)
  loadvar $GAME~MBBS
  loadvar $GAME~STEAL_FACTOR
  loadvar $GAME~ROB_FACTOR
  loadvar $GAME~PTRADESETTING
  loadvar $GAME~PORT_MAX
  loadvar $PLAYER~UNLIMITEDGAME
  setvar $BOT~DORELOG TRUE
  savevar $BOT~DORELOG
  read $BOT~GCONFIG_FILE $BOT~BOT_NAME 1
  setvar $SWITCHBOARD~BOT_NAME $BOT~BOT_NAME
  if (CONNECTED = TRUE)
    gosub :PLAYER~QUIKSTATS
    setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  end
  if ((($PLAYER~STARTINGLOCATION = "Command") or ($PLAYER~STARTINGLOCATION = "Citadel")) and (CONNECTED = TRUE))
    if ($GAME~PTRADESETTING = 0)
      gosub :GAME~GAMESTATS
    end
    gosub :PLAYER~GETINFO
    gosub :SHIP~GETSHIPSTATS

    fileexists $SHIP~CAP_FILE_CHK $SHIP~CAP_FILE
    if ($SHIP~CAP_FILE_CHK)
      gosub :SHIP~LOADSHIPINFO
    else
      gosub :SHIP~GETSHIPCAPSTATS
      gosub :SHIP~LOADSHIPINFO
    end
    fileexists $PLANET~PLANET_FILE_CHK $PLANET~PLANET_FILE
    if ($PLANET~PLANET_FILE_CHK)
      gosub :PLANET~LOADPLANETINFO
    else
      gosub :PLANET~GETPLANETSTATS
      gosub :PLANET~LOADPLANETINFO
    end
  else
    fileexists $SHIP~CAP_FILE_CHK $SHIP~CAP_FILE
    if ($SHIP~CAP_FILE_CHK)
      gosub :SHIP~LOADSHIPINFO
    end
    fileexists $PLANET~PLANET_FILE_CHK $PLANET~PLANET_FILE
    if ($PLANET~PLANET_FILE_CHK)
      gosub :PLANET~LOADPLANETINFO
    end
  end
else
  :BOT~CONF_BOT
  setvar $PLAYER~SURROUNDFIGS 1
  savevar $PLAYER~SURROUNDFIGS
  if (CONNECTED = TRUE)
    gosub :PLAYER~QUIKSTATS
  end
  echo ANSI_13
  echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
  echo "*  Getting intial settings for M()M Bot . . . *"
  echo "*  Game is not set up for M()M Bot, doing that now. "
  echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  setdelaytrigger WOAH :KEEP_GOING 200
  pause
  pause
  :BOT~KEEP_GOING
  gosub :MENUS~ADD_GAME
  if ((($PLAYER~STARTINGLOCATION = "Command") or ($PLAYER~STARTINGLOCATION = "Citadel")) and (CONNECTED = TRUE))
    gosub :GAME~GAMESTATS
    gosub :PLAYER~QUIKSTATS
    gosub :PLAYER~GETINFO
    fileexists $SHIP~CAP_FILE_CHK $SHIP~CAP_FILE
    if ($SHIP~CAP_FILE_CHK)
      gosub :SHIP~LOADSHIPINFO
    else
      gosub :SHIP~GETSHIPCAPSTATS
      gosub :SHIP~LOADSHIPINFO
    end
    fileexists $PLANET~PLANET_FILE_CHK $PLANET~PLANET_FILE
    if ($PLANET~PLANET_FILE_CHK)
      gosub :PLANET~LOADPLANETINFO
    else
      gosub :PLANET~GETPLANETSTATS
      gosub :PLANET~LOADPLANETINFO
    end

    echo ANSI_13
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    echo "*  M()M Bot initialization completed . . .  *"
    echo "*  You should be setup and ready to go! "
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  else
    fileexists $SHIP~CAP_FILE_CHK $SHIP~CAP_FILE
    if ($SHIP~CAP_FILE_CHK)
      gosub :SHIP~LOADSHIPINFO
    end
    fileexists $PLANET~PLANET_FILE_CHK $PLANET~PLANET_FILE
    if ($PLANET~PLANET_FILE_CHK)
      gosub :PLANET~LOADPLANETINFO
    end
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    echo "*  You weren't connected to the game when starting "
    echo "*    so you will want to reboot or refresh once "
    echo "* connected into the game to properly configure bot. "
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  end
end

getsectorparameter 2 "FIG_COUNT" $BOT~FIGCOUNT
if ($BOT~FIGCOUNT = "")
  setsectorparameter 2 "FIG_COUNT" 0
end
loadvar $BOT~ECHOINTERVAL
if ($BOT~ECHOINTERVAL <= 0)
  setvar $BOT~ECHOINTERVAL 5760
  savevar $BOT~ECHOINTERVAL
end
setvar $BOT~BOTISOFF FALSE
gosub :LOAD_THE_VARIABLES
if (($PLAYER~SURROUNDAVOIDSHIELDEDONLY = FALSE) and (($BOT~SURROUNDAUTOCAPTURE = FALSE) and (($PLAYER~SURROUNDAVOIDALLPLANETS = FALSE) and ($PLAYER~SURROUNDDONTAVOID = FALSE))))
  setvar $PLAYER~SURROUNDAVOIDALLPLANETS TRUE
end
if ($BOT~BOT_TEAM_NAME = 0)
  setvar $BOT~BOT_TEAM_NAME $BOT~BOT_NAME
end
if ($BOT~PASSWORD = 0)
  setvar $BOT~PASSWORD PASSWORD
end
if ($BOT~USERNAME = 0)
  setvar $BOT~USERNAME LOGINNAME
end
if ($BOT~LETTER = 0)
  setvar $BOT~LETTER GAME
end
if ($MAP~STARDOCK <= 0)
  setvar $MAP~STARDOCK STARDOCK
  savevar $MAP~STARDOCK
end
if ($MAP~RYLOS <= 0)
  setvar $MAP~RYLOS RYLOS
  savevar $MAP~RYLOS
end
if ($MAP~ALPHA_CENTAURI <= 0)
  setvar $MAP~ALPHA_CENTAURI ALPHACENTAURI
  savevar $MAP~ALPHA_CENTAURI
end
gosub :SAVE_THE_VARIABLES

getfilelist $BOT~STARTUP_SCRIPTS "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\*.cts"
setvar $BOT~I 1
while ($BOT~I <= $BOT~STARTUP_SCRIPTS)
  stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\"&$BOT~STARTUP_SCRIPTS[$BOT~I]
  stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\"&$BOT~STARTUP_SCRIPTS[$BOT~I]
  stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\"&$BOT~STARTUP_SCRIPTS[$BOT~I]
  stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\"&$BOT~STARTUP_SCRIPTS[$BOT~I]
  setvar $BOT~COMMAND $BOT~STARTUP_SCRIPTS[$BOT~I]
  replacetext $BOT~COMMAND ".cts" ""
  savevar $BOT~COMMAND
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\startups\"&$BOT~STARTUP_SCRIPTS[$BOT~I]
  add $BOT~I 1
end

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~RUN_BOT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ((($PLAYER~STARTINGLOCATION = "Citadel") or ($PLAYER~STARTINGLOCATION = "Command")) and (CONNECTED = TRUE))
  gosub :PLAYER~STARTCNSETTINGS
  killalltriggers
  gosub :PLAYER~GETINFO
  if ($PLAYER~CORP <> 0)
    setvar $BOT~MY_NAME $PLAYER~TRADER_NAME
    trim $BOT~MY_NAME
    setvar $SWITCHBOARD~MESSAGE "Logging corp mates automatically - "
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      send "xa"
    else
      send "ta"
    end
    waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
    waiton "------------------------------------------------------------------------------"
    :BOT~TA_AGAIN

    settextlinetrigger TALINE :TA_CHECK
    pause
    :BOT~TA_CHECK

    getwordpos CURRENTLINE $BOT~POS "P indicates Trader is on a planet in that sector"
    getwordpos CURRENTLINE $BOT~POS2 "Corporate command ["
    if (($BOT~POS > 0) or ($BOT~POS2 > 0))
      goto :DONE_TA
    end
    setvar $BOT~LINE CURRENTLINE
    getlength CURRENTLINE $BOT~LENGTH
    if ($BOT~LENGTH > 30)
      setvar $BOT~LINE CURRENTLINE
      cuttext $BOT~LINE $BOT~NAME 1 30
      replacetext $BOT~LINE $BOT~NAME ""
      trim $BOT~NAME
      if ($BOT~NAME <> $BOT~MY_NAME)
        add $BOT~CORPYCOUNT 1
        setvar $BOT~CORPY[$BOT~CORPYCOUNT] $BOT~NAME
        getword $BOT~LINE $BOT~CORPY[$BOT~CORPYCOUNT][1] 1
      end
    else
      goto :DONE_TA
    end
    goto :TA_AGAIN
    :BOT~DONE_TA
    send "q"
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      waiton "Citadel command ("
    else
      waiton "Command ["
    end
  end
  setvar $switchboard~message "is ACTIVE: Version - "&$BOT~MAJOR_VERSION&"."&$BOT~MINOR_VERSION " - type " #34 $BOT~BOT_NAME " help" #34 " for command list*"
  gosub :switchboard~switchboard
  setvar $switchboard~message "to login - send a corporate memo*"
  gosub :switchboard~switchboard
  if (($BOT~USERNAME = "") or ($BOT~LETTER = "") or ($BOT~DORELOG = FALSE))
    setvar $switchboard~message "Auto Relog - Not Active*"
    gosub :switchboard~switchboard
    setvar $BOT~DORELOG FALSE
  end


  fileexists $BOT~TEAM_FILE_CHECK $BOT~BOT_USER_FILE
  if ($BOT~TEAM_FILE_CHECK)
    setarray $BOT~CORP_LIST 1
    readtoarray $BOT~BOT_USER_FILE $BOT~CORP_LIST
    setvar $BOT~I 1
    while ($BOT~I <= $BOT~CORP_LIST)
      setvar $BOT~J 1
      setvar $BOT~ISFOUND FALSE
      while ($BOT~J <= $BOT~CORPYCOUNT)
        setvar $BOT~CORPY_LOWER $BOT~CORPY[$BOT~J]
        setvar $BOT~CORP_LIST_LOWER $BOT~CORP_LIST[$BOT~I]
        lowercase $BOT~CORPY_LOWER
        lowercase $BOT~CORP_LIST_LOWER
        if ($BOT~CORP_LIST_LOWER = $BOT~CORPY_LOWER)
          setvar $BOT~ISFOUND TRUE
        end
        add $BOT~J 1
      end
      if ($BOT~ISFOUND <> TRUE)
        add $BOT~CORPYCOUNT 1
        setvar $BOT~CORPY[$BOT~CORPYCOUNT] $BOT~CORP_LIST[$BOT~I]
      end
      add $BOT~I 1
    end
  end
  delete $BOT~BOT_USER_FILE
  setvar $BOT~I 1
  while ($BOT~I <= $BOT~CORPYCOUNT)
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&$BOT~CORPY[$BOT~I]&", "
    write $BOT~BOT_USER_FILE $BOT~CORPY[$BOT~I]
    add $BOT~I 1
  end
  if ($BOT~CORPYCOUNT > 0)
    replacetext $SWITCHBOARD~MESSAGE $BOT~CORPY[$BOT~CORPYCOUNT]&", " $BOT~CORPY[$BOT~CORPYCOUNT]
    if ($BOT~CORPYCOUNT = 1)
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" is added.*"
    else
      replacetext $SWITCHBOARD~MESSAGE $BOT~CORPY[$BOT~CORPYCOUNT] "and "&$BOT~CORPY[$BOT~CORPYCOUNT]
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" are added.*"
    end
    gosub :SWITCHBOARD~SWITCHBOARD
  end
else
  fileexists $BOT~TEAM_FILE_CHECK $BOT~BOT_USER_FILE
  if ($BOT~TEAM_FILE_CHECK)
    setarray $BOT~CORP_LIST 1
    readtoarray $BOT~BOT_USER_FILE $BOT~CORP_LIST
    setvar $BOT~I 1
    while ($BOT~I <= $BOT~CORP_LIST)
      setvar $BOT~J 1
      setvar $BOT~ISFOUND FALSE
      while ($BOT~J <= $BOT~CORPYCOUNT)
        setvar $BOT~CORPY_LOWER $BOT~CORPY[$BOT~J]
        setvar $BOT~CORP_LIST_LOWER $BOT~CORP_LIST[$BOT~I]
        lowercase $BOT~CORPY_LOWER
        lowercase $BOT~CORP_LIST_LOWER
        if ($BOT~CORP_LIST_LOWER = $BOT~CORPY_LOWER)
          setvar $BOT~ISFOUND TRUE
        end
        add $BOT~J 1
      end
      if ($BOT~ISFOUND <> TRUE)
        add $BOT~CORPYCOUNT 1
        setvar $BOT~CORPY[$BOT~CORPYCOUNT] $BOT~CORP_LIST[$BOT~I]
      end
      add $BOT~I 1
    end
  end
  echo "*{" $BOT~BOT_NAME "} is ACTIVE: Version - "&$BOT~MAJOR_VERSION&"."&$BOT~MINOR_VERSION " - type " #34 $BOT~BOT_NAME " help" #34 " for command list*"
  if (($BOT~USERNAME = "") or ($BOT~LETTER = "") or ($BOT~DORELOG = FALSE))
    echo "{"&$BOT~BOT_NAME&"} - Auto Relog - Not Active*"
    setvar $BOT~DORELOG FALSE
  end
end
savevar $BOT~BOT_NAME
:BOT~INITIATE_BOT
loadvar $BOT~ISSHIPDESTROYED
if (CONNECTED <> TRUE)
  goto :MENUS~PREGAMEMENULOAD
else
  setvar $BOT~ISSHIPDESTROYED FALSE
  savevar $BOT~ISSHIPDESTROYED
end

goto :WAIT_FOR_COMMAND

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~LOAD_WATCHER_VARIABLES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~SHIP_FIGHTERS_MAX
loadvar $SHIP~SHIP_OFFENSIVE_ODDS
loadvar $PLANET~PLANET
loadvar $PLAYER~CURRENT_SECTOR
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~ENTER_MENU_DEAF
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($BOT~MENU_DEAF_DEPTH <= 0)
  getdeafclients $BOT~MENU_DEAF_RESTORE
end
add $BOT~MENU_DEAF_DEPTH 1
setdeafclients TRUE
setvar $BOT~BOTISDEAF TRUE
savevar $BOT~BOTISDEAF
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~INIT_HOTKEY_DEFAULTS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setarray $BOT~HOTKEYS 255
setarray $BOT~CUSTOM_KEYS 33
setarray $BOT~CUSTOM_COMMANDS 33
setvar $BOT~CUSTOM_KEYS[1] "K"
setvar $BOT~CUSTOM_KEYS[2] "C"
setvar $BOT~CUSTOM_KEYS[3] "R"
setvar $BOT~CUSTOM_KEYS[4] "S"
setvar $BOT~CUSTOM_KEYS[5] "H"
setvar $BOT~CUSTOM_KEYS[6] "T"
setvar $BOT~CUSTOM_KEYS[7] "P"
setvar $BOT~CUSTOM_KEYS[8] "Q"
setvar $BOT~CUSTOM_KEYS[9] "L"
setvar $BOT~CUSTOM_KEYS[10] #9
setvar $BOT~CUSTOM_KEYS[11] "D"
setvar $BOT~CUSTOM_KEYS[12] "X"
setvar $BOT~CUSTOM_KEYS[13] "M"
setvar $BOT~CUSTOM_KEYS[14] "F"
setvar $BOT~CUSTOM_KEYS[15] "Z"
setvar $BOT~CUSTOM_KEYS[16] "~"
setvar $BOT~CUSTOM_KEYS[17] "B"
setvar $BOT~CUSTOM_COMMANDS[1] ":INTERNAL_COMMANDS~autokill"
setvar $BOT~CUSTOM_COMMANDS[2] ":INTERNAL_COMMANDS~autocap"
setvar $BOT~CUSTOM_COMMANDS[3] ":INTERNAL_COMMANDS~autorefurb"
setvar $BOT~CUSTOM_COMMANDS[4] ":INTERNAL_COMMANDS~surround"
setvar $BOT~CUSTOM_COMMANDS[5] ":INTERNAL_COMMANDS~htorp"
setvar $BOT~CUSTOM_COMMANDS[6] ":INTERNAL_COMMANDS~twarpswitch"
setvar $BOT~CUSTOM_COMMANDS[7] ":INTERNAL_COMMANDS~kit"
setvar $BOT~CUSTOM_COMMANDS[8] ":USER_INTERFACE~script_access"
setvar $BOT~CUSTOM_COMMANDS[9] ":INTERNAL_COMMANDS~hkill"
setvar $BOT~CUSTOM_COMMANDS[10] ":INTERNAL_COMMANDS~stopModules"
setvar $BOT~CUSTOM_COMMANDS[11] ":INTERNAL_COMMANDS~kit"
setvar $BOT~CUSTOM_COMMANDS[12] ":INTERNAL_COMMANDS~xenter"
setvar $BOT~CUSTOM_COMMANDS[13] ":INTERNAL_COMMANDS~mowswitch"
setvar $BOT~CUSTOM_COMMANDS[14] ":INTERNAL_COMMANDS~fotonswitch"
setvar $BOT~CUSTOM_COMMANDS[15] ":INTERNAL_COMMANDS~clear"
setvar $BOT~CUSTOM_COMMANDS[16] ":MENUS~preferencesMenu"
setvar $BOT~CUSTOM_COMMANDS[17] ":INTERNAL_COMMANDS~dock_shopper"
gosub :BOT~REBUILD_HOTKEY_INDEX
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~LOAD_HOTKEY_CONFIG
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :BOT~INIT_HOTKEY_DEFAULTS
fileexists $BOT~CONFIG_EXISTS $BOT~MOMBOT_CONFIG_FILE
if ($BOT~CONFIG_EXISTS)
  readtoarray $BOT~MOMBOT_CONFIG_FILE $BOT~HOTKEY_CONFIG_LINES
  if ($BOT~HOTKEY_CONFIG_LINES = 33)
    gosub :BOT~APPLY_HOTKEY_CONFIG
    if ($BOT~HOTKEY_CONFIG_VALID = TRUE)
      delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/hotkeys.cfg"
      delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_keys.cfg"
      delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_commands.cfg"
      return
    end
  end
end

fileexists $BOT~LEGACY_KEYS_EXIST "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_keys.cfg"
fileexists $BOT~LEGACY_COMMANDS_EXIST "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_commands.cfg"
if ($BOT~LEGACY_KEYS_EXIST and $BOT~LEGACY_COMMANDS_EXIST)
  readtoarray "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_keys.cfg" $BOT~CUSTOM_KEYS
  readtoarray "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_commands.cfg" $BOT~CUSTOM_COMMANDS
  if (($BOT~CUSTOM_KEYS = 33) and ($BOT~CUSTOM_COMMANDS = 33))
    gosub :BOT~REBUILD_HOTKEY_INDEX
    gosub :BOT~WRITE_HOTKEY_CONFIG
    return
  end
end

gosub :BOT~INIT_HOTKEY_DEFAULTS
gosub :BOT~WRITE_HOTKEY_CONFIG
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~APPLY_HOTKEY_CONFIG
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $BOT~HOTKEY_CONFIG_VALID TRUE
setarray $BOT~HOTKEYS 255
setarray $BOT~CUSTOM_KEYS 33
setarray $BOT~CUSTOM_COMMANDS 33
setvar $BOT~I 1
while ($BOT~I <= 33)
  setvar $BOT~HOTKEY_CONFIG_LINE $BOT~HOTKEY_CONFIG_LINES[$BOT~I]
  trim $BOT~HOTKEY_CONFIG_LINE
  if ($BOT~HOTKEY_CONFIG_LINE = "")
    setvar $BOT~HOTKEY_CONFIG_VALID FALSE
    return
  end

  splittext $BOT~HOTKEY_CONFIG_LINE $BOT~HOTKEY_CONFIG_PARTS "$"
  if ($BOT~HOTKEY_CONFIG_PARTS >= 3)
    setvar $BOT~HOTKEY_SLOT_TOKEN $BOT~HOTKEY_CONFIG_PARTS[1]
    trim $BOT~HOTKEY_SLOT_TOKEN
    if ($BOT~HOTKEY_SLOT_TOKEN <> $BOT~I)
      setvar $BOT~HOTKEY_CONFIG_VALID FALSE
      return
    end
    setvar $BOT~HOTKEY_KEY_TOKEN $BOT~HOTKEY_CONFIG_PARTS[2]
    setvar $BOT~HOTKEY_COMMAND_TOKEN $BOT~HOTKEY_CONFIG_PARTS[3]
  elseif ($BOT~HOTKEY_CONFIG_PARTS = 2)
    setvar $BOT~HOTKEY_KEY_TOKEN $BOT~HOTKEY_CONFIG_PARTS[1]
    setvar $BOT~HOTKEY_COMMAND_TOKEN $BOT~HOTKEY_CONFIG_PARTS[2]
  else
    setvar $BOT~HOTKEY_CONFIG_VALID FALSE
    return
  end

  trim $BOT~HOTKEY_KEY_TOKEN
  trim $BOT~HOTKEY_COMMAND_TOKEN
  gosub :BOT~DECODE_HOTKEY_TOKEN
  if ($BOT~HOTKEY_KEY_VALID <> TRUE)
    setvar $BOT~HOTKEY_CONFIG_VALID FALSE
    return
  end

  if ($BOT~HOTKEY_COMMAND_TOKEN = "")
    setvar $BOT~HOTKEY_COMMAND_TOKEN "0"
  end

  setvar $BOT~CUSTOM_KEYS[$BOT~I] $BOT~HOTKEY_DECODED_KEY
  setvar $BOT~CUSTOM_COMMANDS[$BOT~I] $BOT~HOTKEY_COMMAND_TOKEN
  add $BOT~I 1
end

gosub :BOT~REBUILD_HOTKEY_INDEX
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~REBUILD_HOTKEY_INDEX
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setarray $BOT~HOTKEYS 255
setvar $BOT~I 1
while ($BOT~I <= 33)
  setvar $BOT~HOTKEY_KEY_TOKEN $BOT~CUSTOM_KEYS[$BOT~I]
  gosub :BOT~DECODE_HOTKEY_TOKEN
  if (($BOT~HOTKEY_KEY_VALID = TRUE) and ($BOT~HOTKEY_DECODED_KEY <> "0"))
    setvar $BOT~HOTKEY_TEMP $BOT~HOTKEY_DECODED_KEY
    lowercase $BOT~HOTKEY_TEMP
    getcharcode $BOT~HOTKEY_TEMP $BOT~HOTKEY_LOWER
    setvar $BOT~HOTKEY_TEMP $BOT~HOTKEY_DECODED_KEY
    uppercase $BOT~HOTKEY_TEMP
    getcharcode $BOT~HOTKEY_TEMP $BOT~HOTKEY_UPPER
    if ($BOT~HOTKEY_LOWER > 0)
      setvar $BOT~HOTKEYS[$BOT~HOTKEY_LOWER] $BOT~I
    end
    if ($BOT~HOTKEY_UPPER > 0)
      setvar $BOT~HOTKEYS[$BOT~HOTKEY_UPPER] $BOT~I
    end
  end
  add $BOT~I 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~DECODE_HOTKEY_TOKEN
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $BOT~HOTKEY_KEY_VALID TRUE
setvar $BOT~HOTKEY_DECODED_KEY $BOT~HOTKEY_KEY_TOKEN
trim $BOT~HOTKEY_DECODED_KEY
uppercase $BOT~HOTKEY_DECODED_KEY
if (($BOT~HOTKEY_DECODED_KEY = "") or ($BOT~HOTKEY_DECODED_KEY = "0"))
  setvar $BOT~HOTKEY_DECODED_KEY "0"
elseif ($BOT~HOTKEY_DECODED_KEY = "TAB")
  setvar $BOT~HOTKEY_DECODED_KEY #9
elseif ($BOT~HOTKEY_DECODED_KEY = "ENTER")
  setvar $BOT~HOTKEY_DECODED_KEY #13
elseif ($BOT~HOTKEY_DECODED_KEY = "BACKSPACE")
  setvar $BOT~HOTKEY_DECODED_KEY #8
elseif ($BOT~HOTKEY_DECODED_KEY = "SPACE")
  setvar $BOT~HOTKEY_DECODED_KEY " "
else
  cuttext $BOT~HOTKEY_KEY_TOKEN $BOT~HOTKEY_DECODED_KEY 1 1
  if ($BOT~HOTKEY_DECODED_KEY = "")
    setvar $BOT~HOTKEY_KEY_VALID FALSE
  end
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~ENCODE_HOTKEY_TOKEN
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $BOT~HOTKEY_ENCODED_KEY $BOT~HOTKEY_KEY_TOKEN
if (($BOT~HOTKEY_ENCODED_KEY = "") or ($BOT~HOTKEY_ENCODED_KEY = "0"))
  setvar $BOT~HOTKEY_ENCODED_KEY "0"
elseif ($BOT~HOTKEY_ENCODED_KEY = #9)
  setvar $BOT~HOTKEY_ENCODED_KEY "TAB"
elseif ($BOT~HOTKEY_ENCODED_KEY = #13)
  setvar $BOT~HOTKEY_ENCODED_KEY "ENTER"
elseif ($BOT~HOTKEY_ENCODED_KEY = #8)
  setvar $BOT~HOTKEY_ENCODED_KEY "BACKSPACE"
elseif ($BOT~HOTKEY_ENCODED_KEY = " ")
  setvar $BOT~HOTKEY_ENCODED_KEY "SPACE"
else
  cuttext $BOT~HOTKEY_ENCODED_KEY $BOT~HOTKEY_ENCODED_KEY 1 1
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~WRITE_HOTKEY_CONFIG
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
delete $BOT~MOMBOT_CONFIG_FILE
setvar $BOT~I 1
while ($BOT~I <= 33)
  setvar $BOT~HOTKEY_KEY_TOKEN $BOT~CUSTOM_KEYS[$BOT~I]
  gosub :BOT~ENCODE_HOTKEY_TOKEN
  setvar $BOT~HOTKEY_COMMAND_TOKEN $BOT~CUSTOM_COMMANDS[$BOT~I]
  if (($BOT~HOTKEY_COMMAND_TOKEN = "") or ($BOT~HOTKEY_COMMAND_TOKEN = 0))
    setvar $BOT~HOTKEY_COMMAND_TOKEN "0"
  end
  write $BOT~MOMBOT_CONFIG_FILE $BOT~I&"$"&$BOT~HOTKEY_ENCODED_KEY&"$"&$BOT~HOTKEY_COMMAND_TOKEN
  add $BOT~I 1
end

delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/hotkeys.cfg"
delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_keys.cfg"
delete "scripts/"&$BOT~MOMBOT_DIRECTORY&"/custom_commands.cfg"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:BOT~EXIT_MENU_DEAF
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($BOT~MENU_DEAF_DEPTH > 0)
  subtract $BOT~MENU_DEAF_DEPTH 1
end

if ($BOT~MENU_DEAF_DEPTH <= 0)
  if ($BOT~MENU_DEAF_RESTORE = TRUE)
    setdeafclients TRUE
    setvar $BOT~BOTISDEAF TRUE
  else
    setdeafclients FALSE
    setvar $BOT~BOTISDEAF FALSE
  end
  savevar $BOT~BOTISDEAF
end

return

:BOT~DOSPLASHSCREEN

setdelaytrigger DRAW_DELAY :DRAW_DELAY 500
pause
pause
:DRAW_DELAY
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
echo "[0m*[1;33m                Phx, Rincrast, Voltron, Traitor, Parrothead, PSI,"
echo "[0m*[1;33m                Elder Prophet, Caretaker, Deign, Rider, Shadow*"

echo "**"&ANSI_14 "       Version: " ANSI_15 $BOT~MAJOR_VERSION "." $BOT~MINOR_VERSION "*"
echo ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "***"

return

include "source\include\user_interface"
include "source\include\player"
include "source\include\menus"
include "source\include\combat"
include "source\include\game"
include "source\include\planet"
include "source\include\map"
include "source\include\connectivity"
include "source\include\loadvars"
