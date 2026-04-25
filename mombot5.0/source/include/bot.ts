:BOT~CHECKSTARTINGPROMPT
if ($PLAYER~CURRENT_PROMPT = 0)
  gosub :PLAYER~CURRENTPROMPT
end
getwordpos " "&$BOT~VALIDPROMPTS&" " $BOT~POS $PLAYER~CURRENT_PROMPT
if ($BOT~POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$BOT~VALIDPROMPTS&"]*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :WAIT_FOR_COMMAND
end
return
:BOT~KILLTHETRIGGERS


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
send "'{" $BOT~BOT_NAME "} - Bot frozen for over 100 seconds, resetting...*"
goto :WAIT_FOR_COMMAND
:BOT~WAIT_FOR_COMMAND



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
:BOT~SAVE_THE_VARIABLES

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
gosub :MAIN~BACKWARDS_COMPATIBLE
return
:BOT~LOAD_THE_VARIABLES

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
gosub :BOT~NORMALIZE_DEPLOY_PREFERENCES


return
:BOT~LOAD_BOT



setvar $BOT~DO_NOT_RESUSCITATE FALSE
savevar $BOT~DO_NOT_RESUSCITATE

loadvar $BOT~MAJOR_VERSION
loadvar $BOT~MINOR_VERSION

setvar $BOT~MOMBOT_FOLDER_CONFIG "scripts/mombot"&$BOT~MAJOR_VERSION&"_"&$BOT~MINOR_VERSION&".cfg"
fileexists $BOT~FOLDER_CONFIG_EXISTS $BOT~MOMBOT_FOLDER_CONFIG
if ($BOT~FOLDER_CONFIG_EXISTS)
  read $BOT~MOMBOT_FOLDER_CONFIG $BOT~MOMBOT_DIRECTORY 1
else
  delete $BOT~MOMBOT_FOLDER_CONFIG
  setvar $BOT~MOMBOT_DIRECTORY $BOT~DEFAULT_BOT_DIRECTORY
  write $BOT~MOMBOT_FOLDER_CONFIG $BOT~MOMBOT_DIRECTORY
end

savevar $BOT~MOMBOT_DIRECTORY

setvar $BOT~LEGACY_FOLDER "scripts/"&$BOT~MOMBOT_DIRECTORY&"/games/"&GAMENAME
makedir "games"
setvar $BOT~FOLDER "games/"&GAMENAME
makedir $BOT~FOLDER
gosub :BOT~MIGRATE_GAME_FOLDER

setvar $BOT~MOMBOT_CONFIG_FILE "scripts/"&$BOT~MOMBOT_DIRECTORY&"/mombot.cfg"
setvar $BOT~HOTKEYS_FILE $BOT~MOMBOT_CONFIG_FILE
setvar $BOT~CUSTOM_KEYS_FILE $BOT~MOMBOT_CONFIG_FILE
setvar $BOT~CUSTOM_COMMANDS_FILE $BOT~MOMBOT_CONFIG_FILE
savevar $BOT~MOMBOT_CONFIG_FILE

gosub :MENUS~DOSPLASHSCREEN
gosub :BOT~LOAD_HOTKEY_CONFIG

gosub :COMBAT~INIT
setvar $PLAYER~STARTINGLOCATION ""
setarray $BOT~INTERNALCOMMANDLISTS 7
setvar $BOT~INTERNALCOMMANDLISTS[1] " stopall stop listall reset emq bot relog tow refresh login logoff unlock lift with dep callin about cn extern twarp bwarp pwarp relog help switchbot "
setvar $BOT~INTERNALCOMMANDLISTS[2] " "
setvar $BOT~INTERNALCOMMANDLISTS[3] " hkill kill htorp "
setvar $BOT~INTERNALCOMMANDLISTS[4] " refurb scrub "
setvar $BOT~INTERNALCOMMANDLISTS[5] " surround exit xenter mow "
setvar $BOT~INTERNALCOMMANDLISTS[6] " "
setvar $BOT~INTERNALCOMMANDLISTS[7] " find pscan sector storeship setvar getvar "
setvar $BOT~DOUBLEDCOMMANDLIST " parm params parms qss sec sect secto cn9 logout emx smow port shipstore finder xenter status pinfo holotorp"
setvar $BOT~INTERNALCOMMANDLIST $BOT~INTERNALCOMMANDLISTS[1]&$BOT~INTERNALCOMMANDLISTS[2]&$BOT~INTERNALCOMMANDLISTS[3]&$BOT~INTERNALCOMMANDLISTS[4]&$BOT~INTERNALCOMMANDLISTS[5]&$BOT~INTERNALCOMMANDLISTS[6]&$BOT~INTERNALCOMMANDLISTS[7]
setarray $BOT~TYPES 7
setvar $BOT~TYPES[1] "General"
setvar $BOT~TYPES[2] "Defense"
setvar $BOT~TYPES[3] "Offense"
setvar $BOT~TYPES[4] "Resource"
setvar $BOT~TYPES[5] "Grid"
setvar $BOT~TYPES[6] "Cashing"
setvar $BOT~TYPES[7] "Data"
setarray $BOT~CATAGORIES 3
setvar $BOT~CATAGORIES[1] "Modes"
setvar $BOT~CATAGORIES[2] "Commands"
setvar $BOT~CATAGORIES[3] "Daemons"
setvar $BOT~CORPYCOUNT 0
setarray $BOT~CORPY 30 1

setvar $BOT~GAMESTATS FALSE
setvar $BOT~SCRIPT_NAME "Mind ()ver Matter Bot "
setvar $BOT~MODE "General"
setvar $SWITCHBOARD~SELF_COMMAND FALSE
setvar $BOT~OKAYTOUSE TRUE
setvar $PLAYER~TRADER_NAME ""
setarray $BOT~PARMS 8
setvar $BOT~PARMS 8
setvar $BOT~MODULECATEGORY ""


setvar $BOT~START_FIG_HIT "Deployed Fighters Report Sector "
setvar $BOT~END_FIG_HIT ":"
setvar $BOT~ALIEN_ANSI #27&"[1;36m"&#27&"["
setvar $BOT~START_FIG_HIT_OWNER ":"
setvar $BOT~END_FIG_HIT_OWNER "'s"



setvar $BOT~GCONFIG_FILE $BOT~FOLDER&"/bot.cfg"
setvar $BOT~CK_FIG_FILE $BOT~FOLDER&"/_ck_"&GAMENAME&".figs"
setvar $BOT~FIG_FILE $BOT~FOLDER&"/fighters.cfg"
setvar $BOT~FIG_COUNT_FILE $BOT~FOLDER&"/fighters.cnt"
setvar $BOT~LIMP_FILE $BOT~FOLDER&"/limpets.cfg"
setvar $BOT~LIMP_COUNT_FILE $BOT~FOLDER&"/limpets.cnt"
setvar $BOT~ARMID_COUNT_FILE $BOT~FOLDER&"/armids.cnt"
setvar $BOT~ARMID_FILE $BOT~FOLDER&"/armids.cfg"
setvar $BOT~TIMER_FILE $BOT~FOLDER&"/timer.cfg"
setvar $GAME~GAME_SETTINGS_FILE $BOT~FOLDER&"/game_settings.cfg"
setvar $BOT~BOT_USER_FILE $BOT~FOLDER&"/bot_users.lst"
setvar $SHIP~CAP_FILE $BOT~FOLDER&"/ships.cfg"
setvar $PLANET~PLANET_FILE $BOT~FOLDER&"/planets.cfg"
setvar $BOT~SCRIPT_FILE "scripts/"&$BOT~MOMBOT_DIRECTORY&"/hotkey_scripts.cfg"
setvar $BOT~BUST_FILE $BOT~FOLDER&"/busts.cfg"
setvar $BOT~MCIC_FILE $BOT~FOLDER&"/planet.nego"

setvar $BOT~LAST_LOADED_MODULE ""
savevar $BOT~LAST_LOADED_MODULE
savevar $BOT~GCONFIG_FILE
savevar $BOT~FOLDER
savevar $BOT~CK_FIG_FILE
savevar $BOT~FIG_FILE
savevar $BOT~FIG_COUNT_FILE
savevar $BOT~LIMP_FILE
savevar $BOT~LIMP_COUNT_FILE
savevar $BOT~ARMID_COUNT_FILE
savevar $BOT~ARMID_FILE
savevar $GAME~GAME_SETTINGS_FILE
savevar $BOT~BOT_USER_FILE
savevar $SHIP~CAP_FILE
savevar $PLANET~PLANET_FILE
savevar $BOT~SCRIPT_FILE
savevar $BOT~BUST_FILE
savevar $BOT~MCIC_FILE
savevar $BOT~TIMER_FILE
goto :BOT~AFTER_GAME_FOLDER_MIGRATION_HELPERS

:BOT~MIGRATE_GAME_FOLDER
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

:BOT~MIGRATE_GAME_FILE
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

:BOT~AFTER_GAME_FOLDER_MIGRATION_HELPERS

setarray $BOT~HISTORY 100
setvar $BOT~PROMPTOUTPUT ""
setvar $BOT~CHARCOUNT 0
setvar $BOT~HISTORYINDEX 0
setvar $BOT~CURRENTPROMPTTEXT ""
setvar $BOT~HISTORYMAX 100
setvar $BOT~HISTORYCOUNT 0
setvar $BOT~CHARPOS 0


setvar $BOT~PLAYER_CASH_MAX 999999999
setvar $PLANET~CITADEL_CASH_MAX "999999999999999"


setvar $PLAYER~CURRENT_PROMPT "Undefined"
setvar $PLAYER~PSYCHIC_PROBE "No"
setvar $PLAYER~PLANET_SCANNER "No"
setvar $PLAYER~SCAN_TYPE "None"
:BOT~GETINITIAL_SETTINGS


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
:BOT~RUN_BOT

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
  send "'{" $BOT~BOT_NAME "} - is ACTIVE: Version - "&$BOT~MAJOR_VERSION&"."&$BOT~MINOR_VERSION " - type " #34 $BOT~BOT_NAME " help" #34 " for command list*"
  send "'{" $BOT~BOT_NAME "} - to login - send a corporate memo*"
  if (($BOT~USERNAME = "") or ($BOT~LETTER = "") or ($BOT~DORELOG = FALSE))
    send "'{" $BOT~BOT_NAME "} - Auto Relog - Not Active*"
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
  echo "{"&$BOT~BOT_NAME&"} - No EP Haggle is running because the bot was started offline.*"
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
:BOT~LOAD_WATCHER_VARIABLES

loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~SHIP_FIGHTERS_MAX
loadvar $SHIP~SHIP_OFFENSIVE_ODDS
loadvar $PLANET~PLANET
loadvar $PLAYER~CURRENT_SECTOR
return

:BOT~BANNER


setvar $SWITCHBOARD~MESSAGE $BOT~SCRIPT_TITLE&" starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD
return


:BOT~BOOLEANFIELD

setvar $BOT~CURRENTVALUE $BOT~FIELDS[$BOT~FIELD_INDEX][2]
if ($BOT~CURRENTVALUE = FALSE)
  setvar $BOT~CURRENTVALUE TRUE
  setvar $BOT~DISPLAYVALUE ANSI_14&"On"
else
  setvar $BOT~CURRENTVALUE FALSE
  setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
end
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~CURRENTVALUE
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
goto :MENU_CREATION


:BOT~BOOLEANFIELD1

setvar $BOT~FIELD_INDEX 1
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD10

setvar $BOT~FIELD_INDEX 10
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD11

setvar $BOT~FIELD_INDEX 11
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD12

setvar $BOT~FIELD_INDEX 12
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD13

setvar $BOT~FIELD_INDEX 13
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD14

setvar $BOT~FIELD_INDEX 14
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD15

setvar $BOT~FIELD_INDEX 15
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD16

setvar $BOT~FIELD_INDEX 16
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD17

setvar $BOT~FIELD_INDEX 17
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD18

setvar $BOT~FIELD_INDEX 18
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD19

setvar $BOT~FIELD_INDEX 19
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD2

setvar $BOT~FIELD_INDEX 2
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD20

setvar $BOT~FIELD_INDEX 20
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD21

setvar $BOT~FIELD_INDEX 21
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD22

setvar $BOT~FIELD_INDEX 22
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD23

setvar $BOT~FIELD_INDEX 23
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD24

setvar $BOT~FIELD_INDEX 24
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD25

setvar $BOT~FIELD_INDEX 25
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD26

setvar $BOT~FIELD_INDEX 26
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD27

setvar $BOT~FIELD_INDEX 27
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD28

setvar $BOT~FIELD_INDEX 28
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD29

setvar $BOT~FIELD_INDEX 29
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD3

setvar $BOT~FIELD_INDEX 3
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD30

setvar $BOT~FIELD_INDEX 30


:BOT~BOOLEANFIELD4

setvar $BOT~FIELD_INDEX 4
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD5

setvar $BOT~FIELD_INDEX 5
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD6

setvar $BOT~FIELD_INDEX 6
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD7

setvar $BOT~FIELD_INDEX 7
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD8

setvar $BOT~FIELD_INDEX 8
goto :BOOLEANFIELD


:BOT~BOOLEANFIELD9

setvar $BOT~FIELD_INDEX 9
goto :BOOLEANFIELD


:BOT~CHANGEBOTNAME

getinput $BOT~BOT_TO_CONTROL "What bot are you trying to control?"

if ($BOT~BOT_TO_CONTROL = "")
  setvar $BOT~BOT_TO_CONTROL $BOT~BOT_NAME
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_NAME
else
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_TO_CONTROL
end
padright $BOT~BOT_TO_CONTROL_DISPLAY $BOT~FIELD_PADDING
setmenuvalue "CONTROL" $BOT~BOT_TO_CONTROL_DISPLAY
goto :MENU_CREATION


:BOT~COMMAS


format $BOT~VALUE $BOT~VALUE "NUMBER"
return


:BOT~DISCONNECTTRIGGERS


settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return


:BOT~DISCONNECT_TRIGGERS

settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return


:BOT~DISPLAYHELP
setvar $BOT~I 1
setvar $BOT~HELPOUTPUT ""
setvar $BOT~ISDONE FALSE
while (($BOT~I <= $BOT~HELP) and ($BOT~ISDONE <> TRUE))
  if ($BOT~HELP[$BOT~I] <> 0)
    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"
    replacetext $BOT~HELP[$BOT~I] "=" "-"
    setvar $BOT~TEMP $BOT~HELP[$BOT~I]
    getlength $BOT~TEMP $BOT~LENGTH
    setvar $BOT~ISTOOLONG FALSE
    setvar $BOT~NEXT_LINE ""
    setvar $BOT~MAX_LENGTH 65
    if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
      setvar $BOT~LINE $BOT~HELP[$BOT~I]
      gosub :FORMATHELPLINE
      setvar $BOT~HELP[$BOT~I] $BOT~LINE
      setvar $BOT~NEXT_LINE_TEST $BOT~NEXT_LINE
      striptext $BOT~NEXT_LINE_TEST " "
      if ($BOT~NEXT_LINE_TEST <> "")
        setvar $BOT~LINE $BOT~NEXT_LINE
        gosub :FORMATHELPLINE
        setvar $BOT~NEXT_LINE $BOT~LINE
      end
    else
      while ($BOT~LENGTH > $BOT~MAX_LENGTH)
        setvar $BOT~ISTOOLONG TRUE
        cuttext $BOT~TEMP $BOT~NEXT_LINE ($BOT~MAX_LENGTH + 1) ($BOT~LENGTH - $BOT~MAX_LENGTH)
        cuttext $BOT~TEMP $BOT~HELP[$BOT~I] 1 $BOT~MAX_LENGTH
        getlength $BOT~NEXT_LINE $BOT~LENGTH
      end
    end
    setvar $BOT~HELPOUTPUT $BOT~HELPOUTPUT&$BOT~HELP[$BOT~I]&"  *"
    setvar $BOT~NEXT_LINE_TEST $BOT~NEXT_LINE
    striptext $BOT~NEXT_LINE_TEST " "
    if ($BOT~NEXT_LINE_TEST <> "")
      setvar $BOT~HELPOUTPUT $BOT~HELPOUTPUT&""&$BOT~NEXT_LINE&"  *"
    end
    if ($BOT~LENGTH <= 1)
    end


  else
    setvar $BOT~ISDONE TRUE
  end
  add $BOT~I 1
end

if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
  setvar $BOT~HELPOUTPUT "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$BOT~HELPOUTPUT&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $SWITCHBOARD~MESSAGE $BOT~HELPOUTPUT
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $BOT~HELPOUTPUT "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$BOT~HELPOUTPUT&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$SWITCHBOARD~BOT_NAME&"} - *"&$BOT~HELPOUTPUT&"*"
end
return


:BOT~DONE_HELP_FILE
setvar $SWITCHBOARD~MESSAGE "Writing text file for "&$BOT~COMMAND&" in help directory.*"
gosub :SWITCHBOARD~SWITCHBOARD

if ($BOT~ONLY_HELP = TRUE)
  gosub :DISPLAYHELP
  halt
end
return


:BOT~ECHO

getdeafclients $BOT~BOTISDEAF
if ($BOT~BOTISDEAF)
  setvar $BOT~SILENT_RUNNING TRUE
  gosub :SWITCHBOARD~SWITCHBOARD
else
  echo $SWITCHBOARD~MESSAGE
end
return


:BOT~FORMATHELPLINE

replacetext $BOT~LINE "[" ANSI_2&"["&ANSI_6
replacetext $BOT~LINE "]" ANSI_2&"]"&ANSI_13
replacetext $BOT~LINE "-" ANSI_7&"-"&ANSI_13
replacetext $BOT~LINE "<<<<" ANSI_14&"<"&ANSI_7&"<"&ANSI_14&"<"&ANSI_7&"<"&ANSI_15
replacetext $BOT~LINE ">>>>" ANSI_7&">"&ANSI_14&">"&ANSI_7&">"&ANSI_14&">"
replacetext $BOT~LINE "{" ANSI_2&"{"&ANSI_6
replacetext $BOT~LINE "}" ANSI_2&"}"&ANSI_13
replacetext $BOT~LINE "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
setvar $BOT~LINE ANSI_13&$BOT~LINE&ANSI_15

return


:BOT~HELPFILE


setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
if (($SWITCHBOARD~SELF_COMMAND <> FALSE) and (($BOT~PARM1 = "!") or ($BOT~PARM1 = "menu")))
  goto :SELF_MENU
end
setvar $BOT~HELP_FILE "scripts\"&$BOT~MOMBOT_DIRECTORY&"\help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE
if ($BOT~DOESHELPFILEEXIST)
  setvar $BOT~I 1
  read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  while ($BOT~HELP_LINE <> "EOF")

    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"

    if ($BOT~HELP[$BOT~I] <> $BOT~HELP_LINE)
      goto :WRITE_NEW_HELP_FILE
    end
    add $BOT~I 1
    read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  end
  if (($BOT~HELP[($BOT~I + 1)] <> 0) or ($BOT~HELP[($BOT~I + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($BOT~ONLY_HELP = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE


:BOT~HELP_FILE


setvar $BOT~HELP_FILE "scripts\"&$BOT~MOMBOT_DIRECTORY&"\help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE
setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
if ($BOT~DOESHELPFILEEXIST)
  setvar $BOT~I 1
  read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  while ($BOT~HELP_LINE <> "EOF")

    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"
    replacetext $BOT~HELP[$BOT~I] "=" "-"
    if ($BOT~HELP[$BOT~I] <> $BOT~HELP_LINE)
      goto :WRITE_NEW_HELP_FILE
    end
    add $BOT~I 1
    read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  end
  if (($BOT~HELP[($BOT~I + 1)] <> 0) or ($BOT~HELP[($BOT~I + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($BOT~ONLY_HELP = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE


:BOT~LOADVARS
loadvar $BOT~MODE
loadvar $BOT~COMMAND
loadvar $BOT~COMMAND_TYPED
loadvar $BOT~COMMAND_CALLER
loadvar $BOT~MOMBOT_DIRECTORY
loadvar $BOT~MOMBOT_CONFIG_FILE
loadvar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME
loadvar $PLANET~PLANET_FILE
loadvar $SHIP~CAP_FILE
loadvar $BOT~USER_COMMAND_LINE
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $BOT~PARM3
loadvar $BOT~PARM4
loadvar $BOT~PARM5
loadvar $BOT~PARM6
loadvar $BOT~PARM7
loadvar $BOT~PARM8
loadvar $BOT~BOT_TURN_LIMIT
loadvar $PLAYER~UNLIMITEDGAME
loadvar $MAP~STARDOCK
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~HOME_SECTOR
loadvar $MAP~BACKDOOR
loadvar $BOT~SILENT_RUNNING
loadvar $BOT~BOTISDEAF
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $PLANET~PLANET
loadvar $BOT~PASSWORD
loadvar $BOT~LETTER
loadvar $GAME~PORT_MAX
loadvar $BOT~FOLDER
loadvar $GAME~PHOTON_DURATION
loadvar $SETTINGS~OVERRIDE
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
loadvar $PLAYER~FIGHTER_DEPLOY_TYPE
loadvar $PLAYER~DROPOFFENSIVE
loadvar $PLAYER~DROPTOLL
gosub :BOT~NORMALIZE_DEPLOY_PREFERENCES




setarray $BOT~HELP 60
setvar $BOT~HELP 60
setvar $BOT~TAB "     "

return


:BOT~NORMALIZE_DEPLOY_PREFERENCES
if ($PLAYER~DROPOFFENSIVE = TRUE)
  setvar $PLAYER~DROPOFFENSIVE TRUE
  setvar $PLAYER~DROPTOLL FALSE
  setvar $PLAYER~FIGHTER_DEPLOY_TYPE "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setvar $PLAYER~DROPOFFENSIVE FALSE
  setvar $PLAYER~DROPTOLL TRUE
  setvar $PLAYER~FIGHTER_DEPLOY_TYPE "t"
else
  lowercase $PLAYER~FIGHTER_DEPLOY_TYPE
  if ($PLAYER~FIGHTER_DEPLOY_TYPE = "o")
    setvar $PLAYER~DROPOFFENSIVE TRUE
    setvar $PLAYER~DROPTOLL FALSE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "o"
  elseif ($PLAYER~FIGHTER_DEPLOY_TYPE = "t")
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL TRUE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "t"
  else
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL FALSE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "d"
  end
end
savevar $PLAYER~DROPOFFENSIVE
savevar $PLAYER~DROPTOLL
savevar $PLAYER~FIGHTER_DEPLOY_TYPE
return


:BOT~ENTER_MENU_DEAF

if ($BOT~MENU_DEAF_DEPTH <= 0)
  getdeafclients $BOT~MENU_DEAF_RESTORE
end
add $BOT~MENU_DEAF_DEPTH 1
setdeafclients TRUE
setvar $BOT~BOTISDEAF TRUE
savevar $BOT~BOTISDEAF

return


:BOT~INIT_HOTKEY_DEFAULTS

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


:BOT~LOAD_HOTKEY_CONFIG

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


:BOT~APPLY_HOTKEY_CONFIG

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


:BOT~REBUILD_HOTKEY_INDEX

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


:BOT~DECODE_HOTKEY_TOKEN

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


:BOT~ENCODE_HOTKEY_TOKEN

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


:BOT~WRITE_HOTKEY_CONFIG

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


:BOT~EXIT_MENU_DEAF

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


:BOT~MENU



gosub :BOT~ENTER_MENU_DEAF
addmenu "" "ScriptMenu" ANSI_6&"["&ANSI_14&"Settings"&ANSI_6&"]"&ANSI_7 "." "" "Main" FALSE
setvar $BOT~I 1
while ($BOT~I <= $BOT~MENU)
  if (($BOT~MENU[$BOT~I] <> 0) and ($BOT~MENU[$BOT~I] <> ""))
    setvar $BOT~DISPLAY_MENU $BOT~MENU[$BOT~I]
    replacetext $BOT~MENU[$BOT~I] " " "_"
    addmenu "ScriptMenu" $BOT~MENU[$BOT~I] ANSI_6&"["&ANSI_15&$BOT~DISPLAY_MENU&ANSI_6&"]                                 "&ANSI_7 "A" ":MENU_SET" "" FALSE
    setmenuhelp $BOT~MENU[$BOT~I] $BOT~MENU[$BOT~I][1]
  end
  add $BOT~I 1
end
openmenu "ScriptMenu"
gosub :BOT~EXIT_MENU_DEAF
return


:BOT~MENU_SET

pause
gosub :BOT~ENTER_MENU_DEAF
openmenu "Menu"
gosub :BOT~EXIT_MENU_DEAF

return


:BOT~MULTIFIELD

splittext $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~OPTIONS "|"
if ($BOT~OPTIONS > 1)
  setvar $BOT~K 1
  while ($BOT~K <= $BOT~OPTIONS)
    if ($BOT~OPTIONS[$BOT~K] = $BOT~FIELDS[$BOT~FIELD_INDEX][2])
      if ($BOT~K < $BOT~OPTIONS)
        setvar $BOT~OPTIONINDEX ($BOT~K + 1)
      else
        setvar $BOT~OPTIONINDEX 1
      end
      setvar $BOT~CURRENTVALUE $BOT~OPTIONS[$BOT~OPTIONINDEX]
      splittext $BOT~FIELDS[$BOT~FIELD_INDEX][3] $BOT~DESCRIPTIONS "|"
      setvar $BOT~EXTRA ANSI_15&"["&ANSI_14&$BOT~DESCRIPTIONS[$BOT~OPTIONINDEX]&ANSI_15&"]"&ANSI_14
      setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~CURRENTVALUE
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    add $BOT~K 1
  end

  setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~CURRENTVALUE
  setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
end

goto :MENU_CREATION


:BOT~MULTIFIELD1

setvar $BOT~FIELD_INDEX 1
goto :MULTIFIELD


:BOT~MULTIFIELD10

setvar $BOT~FIELD_INDEX 10
goto :MULTIFIELD


:BOT~MULTIFIELD11

setvar $BOT~FIELD_INDEX 11
goto :MULTIFIELD


:BOT~MULTIFIELD12

setvar $BOT~FIELD_INDEX 12
goto :MULTIFIELD


:BOT~MULTIFIELD13

setvar $BOT~FIELD_INDEX 13
goto :MULTIFIELD


:BOT~MULTIFIELD14

setvar $BOT~FIELD_INDEX 14
goto :MULTIFIELD


:BOT~MULTIFIELD15

setvar $BOT~FIELD_INDEX 15
goto :MULTIFIELD


:BOT~MULTIFIELD16

setvar $BOT~FIELD_INDEX 16
goto :MULTIFIELD


:BOT~MULTIFIELD17

setvar $BOT~FIELD_INDEX 17
goto :MULTIFIELD


:BOT~MULTIFIELD18

setvar $BOT~FIELD_INDEX 18
goto :MULTIFIELD


:BOT~MULTIFIELD19

setvar $BOT~FIELD_INDEX 19
goto :MULTIFIELD


:BOT~MULTIFIELD2

setvar $BOT~FIELD_INDEX 2
goto :MULTIFIELD


:BOT~MULTIFIELD20

setvar $BOT~FIELD_INDEX 20
goto :MULTIFIELD


:BOT~MULTIFIELD21

setvar $BOT~FIELD_INDEX 21
goto :MULTIFIELD


:BOT~MULTIFIELD22

setvar $BOT~FIELD_INDEX 22
goto :MULTIFIELD


:BOT~MULTIFIELD23

setvar $BOT~FIELD_INDEX 23
goto :MULTIFIELD


:BOT~MULTIFIELD24

setvar $BOT~FIELD_INDEX 24
goto :MULTIFIELD


:BOT~MULTIFIELD25

setvar $BOT~FIELD_INDEX 25
goto :MULTIFIELD


:BOT~MULTIFIELD26

setvar $BOT~FIELD_INDEX 26
goto :MULTIFIELD


:BOT~MULTIFIELD27

setvar $BOT~FIELD_INDEX 27
goto :MULTIFIELD


:BOT~MULTIFIELD28

setvar $BOT~FIELD_INDEX 28
goto :MULTIFIELD


:BOT~MULTIFIELD29

setvar $BOT~FIELD_INDEX 29
goto :MULTIFIELD


:BOT~MULTIFIELD3

setvar $BOT~FIELD_INDEX 3
goto :MULTIFIELD


:BOT~MULTIFIELD30

setvar $BOT~FIELD_INDEX 30


:BOT~MULTIFIELD4

setvar $BOT~FIELD_INDEX 4
goto :MULTIFIELD


:BOT~MULTIFIELD5

setvar $BOT~FIELD_INDEX 5
goto :MULTIFIELD


:BOT~MULTIFIELD6

setvar $BOT~FIELD_INDEX 6
goto :MULTIFIELD


:BOT~MULTIFIELD7

setvar $BOT~FIELD_INDEX 7
goto :MULTIFIELD


:BOT~MULTIFIELD8

setvar $BOT~FIELD_INDEX 8
goto :MULTIFIELD


:BOT~MULTIFIELD9

setvar $BOT~FIELD_INDEX 9
goto :MULTIFIELD


:BOT~NUMBERFIELD


getinput $BOT~DISPLAYVALUE "Please enter a value for "&$BOT~FIELDS[$BOT~FIELD_INDEX]&"."
isnumber $BOT~ISNUMBER $BOT~DISPLAYVALUE
if ($BOT~ISNUMBER <> TRUE)
  echo "*Please enter a number value.*"
  goto :NUMBERFIELD
end
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~DISPLAYVALUE

if ($BOT~DISPLAYVALUE = 0)
  setvar $BOT~DISPLAYVALUE ANSI_15&$BOT~DISPLAYVALUE
else
  setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~DISPLAYVALUE
end
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA

setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE

goto :MENU_CREATION


:BOT~NUMBERFIELD1

setvar $BOT~FIELD_INDEX 1
goto :NUMBERFIELD


:BOT~NUMBERFIELD10

setvar $BOT~FIELD_INDEX 10
goto :NUMBERFIELD


:BOT~NUMBERFIELD11

setvar $BOT~FIELD_INDEX 11
goto :NUMBERFIELD


:BOT~NUMBERFIELD12

setvar $BOT~FIELD_INDEX 12
goto :NUMBERFIELD


:BOT~NUMBERFIELD13

setvar $BOT~FIELD_INDEX 13
goto :NUMBERFIELD


:BOT~NUMBERFIELD14

setvar $BOT~FIELD_INDEX 14
goto :NUMBERFIELD


:BOT~NUMBERFIELD15

setvar $BOT~FIELD_INDEX 15
goto :NUMBERFIELD


:BOT~NUMBERFIELD16

setvar $BOT~FIELD_INDEX 16
goto :NUMBERFIELD


:BOT~NUMBERFIELD17

setvar $BOT~FIELD_INDEX 17
goto :NUMBERFIELD


:BOT~NUMBERFIELD18

setvar $BOT~FIELD_INDEX 18
goto :NUMBERFIELD


:BOT~NUMBERFIELD19

setvar $BOT~FIELD_INDEX 19
goto :NUMBERFIELD


:BOT~NUMBERFIELD2

setvar $BOT~FIELD_INDEX 2
goto :NUMBERFIELD


:BOT~NUMBERFIELD20

setvar $BOT~FIELD_INDEX 20
goto :NUMBERFIELD


:BOT~NUMBERFIELD21

setvar $BOT~FIELD_INDEX 21
goto :NUMBERFIELD


:BOT~NUMBERFIELD22

setvar $BOT~FIELD_INDEX 22
goto :NUMBERFIELD


:BOT~NUMBERFIELD23

setvar $BOT~FIELD_INDEX 23
goto :NUMBERFIELD


:BOT~NUMBERFIELD24

setvar $BOT~FIELD_INDEX 24
goto :NUMBERFIELD


:BOT~NUMBERFIELD25

setvar $BOT~FIELD_INDEX 25
goto :NUMBERFIELD


:BOT~NUMBERFIELD26

setvar $BOT~FIELD_INDEX 26
goto :NUMBERFIELD


:BOT~NUMBERFIELD27

setvar $BOT~FIELD_INDEX 27
goto :NUMBERFIELD


:BOT~NUMBERFIELD28

setvar $BOT~FIELD_INDEX 28
goto :NUMBERFIELD


:BOT~NUMBERFIELD29

setvar $BOT~FIELD_INDEX 29
goto :NUMBERFIELD


:BOT~NUMBERFIELD3

setvar $BOT~FIELD_INDEX 3
goto :NUMBERFIELD


:BOT~NUMBERFIELD30

setvar $BOT~FIELD_INDEX 30


:BOT~NUMBERFIELD4

setvar $BOT~FIELD_INDEX 4
goto :NUMBERFIELD


:BOT~NUMBERFIELD5

setvar $BOT~FIELD_INDEX 5
goto :NUMBERFIELD


:BOT~NUMBERFIELD6

setvar $BOT~FIELD_INDEX 6
goto :NUMBERFIELD


:BOT~NUMBERFIELD7

setvar $BOT~FIELD_INDEX 7
goto :NUMBERFIELD


:BOT~NUMBERFIELD8

setvar $BOT~FIELD_INDEX 8
goto :NUMBERFIELD


:BOT~NUMBERFIELD9

setvar $BOT~FIELD_INDEX 9
goto :NUMBERFIELD


:BOT~PAUSING

killalltriggers
echo ANSI_14 "*[["&ANSI_15&$BOT~SCRIPT_TITLE&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause


:BOT~RESTARTING
killalltriggers
echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
goto :RESTART


:BOT~SELF_MENU
setvar $BOT~I 1
if (($SWITCHBOARD~SELF_COMMAND <> FALSE) and (($BOT~PARM1 = "!") or ($BOT~PARM1 = "menu")))
  setarray $BOT~FIELDS 100 5
  setvar $BOT~FIELDS 0
  setvar $BOT~FIELD_COUNT 0
  setvar $BOT~ISDONE FALSE
  setvar $BOT~TOPOFFILE TRUE
  while (($BOT~I <= $BOT~HELP) and ($BOT~ISDONE <> TRUE))
    if ($BOT~HELP[$BOT~I] <> 0)
      striptext $BOT~HELP[$BOT~I] #13
      striptext $BOT~HELP[$BOT~I] "`"
      striptext $BOT~HELP[$BOT~I] "'"



      setvar $BOT~CHECK_FOR_BLANK_LINE $BOT~HELP[$BOT~I]
      trim $BOT~CHECK_FOR_BLANK_LINE
      if ($BOT~CHECK_FOR_BLANK_LINE = "")
        setvar $BOT~TOPOFFILE FALSE
      else
        if ($BOT~TOPOFFILE = TRUE)

          if ($BOT~I = 1)
            getwordpos $BOT~HELP[$BOT~I] $BOT~POS "{"
            cuttext $BOT~HELP[$BOT~I] $BOT~MENU_TITLE 1 $BOT~POS
            cuttext $BOT~HELP[$BOT~I] $BOT~REST_OF_STRING $BOT~POS 9999
          else
            setvar $BOT~REST_OF_STRING $BOT~HELP[$BOT~I]
          end
          gettext $BOT~REST_OF_STRING $BOT~OPTION "{" "}"
          while ($BOT~OPTION <> "")



            getwordpos $BOT~REST_OF_STRING $BOT~POS "}"
            cuttext $BOT~REST_OF_STRING&"     " $BOT~REST_OF_STRING ($BOT~POS + 1) 9999

            replacetext $BOT~OPTION "{" ""
            replacetext $BOT~OPTION "}" ""
            getwordpos $BOT~OPTION $BOT~POS "|"

            add $BOT~FIELD_COUNT 1

            if ($BOT~POS > 0)
              setvar $BOT~FIELD_TYPE "multi"
              setvar $BOT~FIELD_NAME $BOT~OPTION
              splittext $BOT~FIELD_NAME $BOT~OPTIONS "|"

              setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] $BOT~OPTIONS[1]
            else
              getwordpos $BOT~OPTION $BOT~POS ":"
              getwordpos $BOT~OPTION $BOT~POS2 #34
              if (($BOT~POS > 0) or ($BOT~POS2 > 0))
                getwordpos $BOT~OPTION $BOT~POS ":#"
                if ($BOT~POS > 0)
                  setvar $BOT~FIELD_TYPE "number"
                  setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] 0
                else
                  getwordpos $BOT~OPTION $BOT~POS #34
                  if ($BOT~POS > 0)

                    setvar $BOT~FIELDS[$BOT~FIELD_COUNT][5] TRUE
                  end
                  setvar $BOT~FIELD_TYPE "string"
                  setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] ""
                end
                splittext $BOT~OPTION $BOT~INPUTS ":"
                setvar $BOT~FIELD_NAME $BOT~OPTION
              else
                setvar $BOT~FIELD_TYPE "boolean"
                setvar $BOT~FIELD_NAME $BOT~OPTION
                setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] FALSE
              end
            end
            setvar $BOT~FIELDS[$BOT~FIELD_COUNT] $BOT~FIELD_NAME
            setvar $BOT~FIELDS[$BOT~FIELD_COUNT][1] $BOT~FIELD_TYPE

            add $BOT~FIELDS 1



            gettext $BOT~REST_OF_STRING $BOT~OPTION "{" "}"
          end
        else
          getwordpos $BOT~HELP[$BOT~I] $BOT~POS "{"
          if ($BOT~POS > 0)








            getword $BOT~HELP[$BOT~I] $BOT~OPTION 1
            replacetext $BOT~OPTION "{" ""
            replacetext $BOT~OPTION "}" ""
            trim $BOT~OPTION
            getwordpos $BOT~HELP[$BOT~I] $BOT~POS "}"
            cuttext $BOT~HELP[$BOT~I] $BOT~HELP[$BOT~I] $BOT~POS 9999
            replacetext $BOT~HELP[$BOT~I] "{" ""
            replacetext $BOT~HELP[$BOT~I] "}" ""
            replacetext $BOT~HELP[$BOT~I] "-" ""
            trim $BOT~HELP[$BOT~I]

            setvar $BOT~J 1
            while ($BOT~J <= $BOT~FIELDS)
              setvar $BOT~FOUNDOPTION FALSE
              getwordpos $BOT~FIELDS[$BOT~J] $BOT~POS "|"
              if ($BOT~POS > 0)
                splittext $BOT~FIELDS[$BOT~J] $BOT~OPTIONS "|"
                setvar $BOT~K 1
                while ($BOT~K <= $BOT~OPTIONS)
                  trim $BOT~OPTIONS[$BOT~K]
                  if ($BOT~OPTIONS[$BOT~K] = $BOT~OPTION)
                    if ($BOT~FIELDS[$BOT~J][3] = 0)
                      setvar $BOT~FIELDS[$BOT~J][3] ""
                    end
                    setvar $BOT~FIELDS[$BOT~J][3] $BOT~FIELDS[$BOT~J][3]&$BOT~HELP[$BOT~I]&"|"
                  end
                  add $BOT~K 1
                end
              else

                if ($BOT~OPTION = $BOT~FIELDS[$BOT~J])
                  setvar $BOT~FIELDS[$BOT~J][3] $BOT~HELP[$BOT~I]
                end
              end
              add $BOT~J 1
            end
          else
          end
        end
      end


    else
      setvar $BOT~ISDONE TRUE
    end
    add $BOT~I 1
  end

  setvar $BOT~COMMAND_DISPLAY $BOT~COMMAND
  uppercase $BOT~COMMAND_DISPLAY
  addmenu "" "MENUSYSTEM" ANSI_15&":::  "&ANSI_14&"["&ANSI_15&"help - "&ANSI_6&"+"&ANSI_14&"]"&ANSI_15&" -=[ "&ANSI_6&$BOT~COMMAND_DISPLAY&ANSI_15&" ]=- "&ANSI_14&"["&ANSI_15&"refresh - "&ANSI_6&"?"&ANSI_14&"]"&ANSI_15&"  ::" "." "" "Main" FALSE
  setmenuoptions "MENUSYSTEM" FALSE FALSE FALSE

  setarray $BOT~MENU_SYSTEM_KEYS 33
  setvar $BOT~MENU_SYSTEM_KEYS 33
  setvar $BOT~MENU_SYSTEM_KEYS[1] 1
  setvar $BOT~MENU_SYSTEM_KEYS[2] 2
  setvar $BOT~MENU_SYSTEM_KEYS[3] 3
  setvar $BOT~MENU_SYSTEM_KEYS[4] 4
  setvar $BOT~MENU_SYSTEM_KEYS[5] 5
  setvar $BOT~MENU_SYSTEM_KEYS[6] 6
  setvar $BOT~MENU_SYSTEM_KEYS[7] 7
  setvar $BOT~MENU_SYSTEM_KEYS[8] 8
  setvar $BOT~MENU_SYSTEM_KEYS[9] 9
  setvar $BOT~MENU_SYSTEM_KEYS[10] "a"
  setvar $BOT~MENU_SYSTEM_KEYS[11] "b"
  setvar $BOT~MENU_SYSTEM_KEYS[12] "c"
  setvar $BOT~MENU_SYSTEM_KEYS[13] "d"
  setvar $BOT~MENU_SYSTEM_KEYS[14] "e"
  setvar $BOT~MENU_SYSTEM_KEYS[15] "f"
  setvar $BOT~MENU_SYSTEM_KEYS[16] "g"
  setvar $BOT~MENU_SYSTEM_KEYS[17] "h"
  setvar $BOT~MENU_SYSTEM_KEYS[18] "i"
  setvar $BOT~MENU_SYSTEM_KEYS[19] "j"
  setvar $BOT~MENU_SYSTEM_KEYS[20] "k"
  setvar $BOT~MENU_SYSTEM_KEYS[21] "l"
  setvar $BOT~MENU_SYSTEM_KEYS[22] "m"
  setvar $BOT~MENU_SYSTEM_KEYS[23] "n"
  setvar $BOT~MENU_SYSTEM_KEYS[24] "o"
  setvar $BOT~MENU_SYSTEM_KEYS[25] "p"
  setvar $BOT~MENU_SYSTEM_KEYS[26] "r"
  setvar $BOT~MENU_SYSTEM_KEYS[27] "s"
  setvar $BOT~MENU_SYSTEM_KEYS[28] "t"
  setvar $BOT~MENU_SYSTEM_KEYS[29] "u"
  setvar $BOT~MENU_SYSTEM_KEYS[30] "v"
  setvar $BOT~MENU_SYSTEM_KEYS[31] "w"
  setvar $BOT~MENU_SYSTEM_KEYS[32] "x"
  setvar $BOT~MENU_SYSTEM_KEYS[33] "y"

  setvar $BOT~LONGEST 0
  setvar $BOT~I 1
  while ($BOT~I <= $BOT~FIELDS)
    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      getlength "::select::" $BOT~LENGTH
    else
      getlength $BOT~FIELDS[$BOT~I] $BOT~LENGTH
    end
    if ($BOT~LENGTH > $BOT~LONGEST)
      setvar $BOT~LONGEST $BOT~LENGTH
    end
    add $BOT~I 1
  end
  setvar $BOT~BOT_TO_CONTROL $BOT~BOT_NAME
  setvar $BOT~MENU_FIELD_DISPLAY "Start!"
  padright $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
  addmenu "MENUSYSTEM" "START" ANSI_15&$BOT~MENU_FIELD_DISPLAY "Z" ":ENDMENUANDGO" "" FALSE
  setvar $BOT~MENU_FIELD_DISPLAY "Bot"
  padright $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
  setvar $BOT~MENU_FIELD_DISPLAY $BOT~MENU_FIELD_DISPLAY&" "&ANSI_14&":"&ANSI_15&" "
  addmenu "MENUSYSTEM" "CONTROL" ANSI_15&$BOT~MENU_FIELD_DISPLAY 0 ":CHANGEBOTNAME" $BOT~BOT_TO_CONTROL FALSE
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_TO_CONTROL
  padright $BOT~BOT_TO_CONTROL_DISPLAY $BOT~LONGEST
  setmenuvalue "CONTROL" $BOT~BOT_TO_CONTROL_DISPLAY

  setvar $BOT~I 1
  setvar $BOT~FIELD_PADDING 18
  while ($BOT~I <= $BOT~FIELDS)
    setvar $BOT~EXTRA $BOT~FIELDS[$BOT~I][3]
    if ($BOT~FIELDS[$BOT~I][1] = "boolean")
      if ($BOT~FIELDS[$BOT~I][2] = TRUE)
        setvar $BOT~DISPLAYVALUE ANSI_14&"On"
      else
        setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
      end
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      splittext $BOT~FIELDS[$BOT~I] $BOT~OPTIONS "|"
      setvar $BOT~K 1
      while ($BOT~K <= $BOT~OPTIONS)
        if ($BOT~OPTIONS[$BOT~K] = $BOT~FIELDS[$BOT~I][2])
          if ($BOT~K < $BOT~OPTIONS)
            setvar $BOT~OPTIONINDEX $BOT~K
          else
            setvar $BOT~OPTIONINDEX 1
          end
          setvar $BOT~CURRENTVALUE $BOT~OPTIONS[$BOT~OPTIONINDEX]
          splittext $BOT~FIELDS[$BOT~I][3] $BOT~DESCRIPTIONS "|"
        end
        add $BOT~K 1
      end
      setvar $BOT~EXTRA ANSI_15&"["&ANSI_14&$BOT~DESCRIPTIONS[$BOT~OPTIONINDEX]&ANSI_15&"]"&ANSI_14
      setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~FIELDS[$BOT~I][2]
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "string")
      setvar $BOT~DISPLAYVALUE $BOT~FIELDS[$BOT~I][2]
      if ($BOT~DISPLAYVALUE = "")
        setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
      end
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "number")
      setvar $BOT~DISPLAYVALUE ANSI_15&$BOT~FIELDS[$BOT~I][2]
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end

    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      setvar $BOT~MENU_FIELD_DISPLAY "::select::"
    else
      setvar $BOT~MENU_FIELD_DISPLAY $BOT~FIELDS[$BOT~I]
    end
    padleft $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
    addmenu "MENUSYSTEM" $BOT~FIELDS[$BOT~I] ANSI_11&$BOT~MENU_FIELD_DISPLAY&ANSI_14&" : " $BOT~MENU_SYSTEM_KEYS[$BOT~I] ":"&$BOT~FIELDS[$BOT~I][1]&"Field"&$BOT~I $BOT~FIELDS[$BOT~I][3] FALSE
    setmenuvalue $BOT~FIELDS[$BOT~I] $BOT~DISPLAYVALUE
    setmenuhelp $BOT~FIELDS[$BOT~I] $BOT~FIELDS[$BOT~I][3]
    :BOT~MENU_CREATION
    add $BOT~I 1
  end
  gosub :BOT~ENTER_MENU_DEAF
  openmenu "MENUSYSTEM" TRUE
  :BOT~ENDMENUANDGO
  closemenu
  gosub :BOT~EXIT_MENU_DEAF
  setvar $BOT~I 1
  setvar $BOT~PARM_COUNT 0
  setvar $BOT~USER_COMMAND_LINE ""
  while ($BOT~I <= $BOT~FIELDS)
    trim $BOT~FIELDS[$BOT~I][2]
    if ($BOT~FIELDS[$BOT~I][2] = 0) or (($BOT~FIELDS[$BOT~I][1] = "string") and ($BOT~FIELDS[$BOT~I][2] = ""))

    else
      if ($BOT~FIELDS[$BOT~I][1] = "boolean")
        if ($BOT~FIELDS[$BOT~I][2] = TRUE)
          setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~FIELDS[$BOT~I]
          setvar $BOT~PARM_VALUE $BOT~FIELDS[$BOT~I]
        end
      end
      if (($BOT~FIELDS[$BOT~I][1] = "string") or ($BOT~FIELDS[$BOT~I][1] = "number"))
        if ($BOT~FIELDS[$BOT~I][5] = TRUE)

          setvar $BOT~STRING_FIELD #34&$BOT~FIELDS[$BOT~I][2]&#34
        else
          splittext $BOT~FIELDS[$BOT~I] $BOT~INPUTS ":"
          setvar $BOT~STRING_FIELD $BOT~INPUTS[1]&":"&$BOT~FIELDS[$BOT~I][2]
        end
        setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~STRING_FIELD
        setvar $BOT~PARM_VALUE $BOT~STRING_FIELD
      end
      if ($BOT~FIELDS[$BOT~I][1] = "multi")
        setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~FIELDS[$BOT~I][2]
        setvar $BOT~PARM_VALUE $BOT~FIELDS[$BOT~I][2]
      end
      if ($BOT~PARM_COUNT <= 8)
        add $BOT~PARM_COUNT 1
        if ($BOT~PARM_COUNT = 1)
          setvar $BOT~PARM1 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 2)
          setvar $BOT~PARM2 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 3)
          setvar $BOT~PARM3 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 4)
          setvar $BOT~PARM4 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 5)
          setvar $BOT~PARM5 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 6)
          setvar $BOT~PARM6 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 7)
          setvar $BOT~PARM7 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 8)
          setvar $BOT~PARM8 $BOT~PARM_VALUE
        end
      end
    end
    add $BOT~I 1
  end
  savevar $BOT~USER_COMMAND_LINE
  savevar $BOT~PARM1
  savevar $BOT~PARM2
  savevar $BOT~PARM3
  savevar $BOT~PARM4
  savevar $BOT~PARM5
  savevar $BOT~PARM6
  savevar $BOT~PARM7
  savevar $BOT~PARM8
  trim $BOT~COMMAND
  trim $BOT~USER_COMMAND_LINE
  if ($BOT~BOT_NAME <> $BOT~BOT_TO_CONTROL)
    setvar $BOT~CONTROL_STRING "'"&$BOT~BOT_TO_CONTROL&" "&$BOT~COMMAND&" "&$BOT~USER_COMMAND_LINE
    send $BOT~CONTROL_STRING&"*"
    loadvar $BOT~HISTORYSTRING
    setvar $BOT~HISTORY[1] $BOT~CONTROL_STRING
    setvar $BOT~HISTORYSTRING $BOT~HISTORY[1]&"<<|HS|>>"&$BOT~HISTORYSTRING
    savevar $BOT~HISTORYSTRING
    halt
  else
    loadvar $BOT~HISTORYSTRING
    setvar $BOT~HISTORY[1] $BOT~COMMAND&" "&$BOT~USER_COMMAND_LINE
    setvar $BOT~HISTORYSTRING $BOT~HISTORY[1]&"<<|HS|>>"&$BOT~HISTORYSTRING
    savevar $BOT~HISTORYSTRING
  end
end


return


:BOT~STRINGFIELD


getinput $BOT~DISPLAYVALUE "Please enter a value for "&$BOT~FIELDS[$BOT~FIELD_INDEX]&"."
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~DISPLAYVALUE

if ($BOT~DISPLAYVALUE = "")
  setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
else
  setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~DISPLAYVALUE
end
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA

setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
goto :MENU_CREATION


:BOT~STRINGFIELD1

setvar $BOT~FIELD_INDEX 1
goto :STRINGFIELD


:BOT~STRINGFIELD10

setvar $BOT~FIELD_INDEX 10
goto :STRINGFIELD


:BOT~STRINGFIELD11

setvar $BOT~FIELD_INDEX 11
goto :STRINGFIELD


:BOT~STRINGFIELD12

setvar $BOT~FIELD_INDEX 12
goto :STRINGFIELD


:BOT~STRINGFIELD13

setvar $BOT~FIELD_INDEX 13
goto :STRINGFIELD


:BOT~STRINGFIELD14

setvar $BOT~FIELD_INDEX 14
goto :STRINGFIELD


:BOT~STRINGFIELD15

setvar $BOT~FIELD_INDEX 15
goto :STRINGFIELD


:BOT~STRINGFIELD16

setvar $BOT~FIELD_INDEX 16
goto :STRINGFIELD


:BOT~STRINGFIELD17

setvar $BOT~FIELD_INDEX 17
goto :STRINGFIELD


:BOT~STRINGFIELD18

setvar $BOT~FIELD_INDEX 18
goto :STRINGFIELD


:BOT~STRINGFIELD19

setvar $BOT~FIELD_INDEX 19
goto :STRINGFIELD


:BOT~STRINGFIELD2

setvar $BOT~FIELD_INDEX 2
goto :STRINGFIELD


:BOT~STRINGFIELD20

setvar $BOT~FIELD_INDEX 20
goto :STRINGFIELD


:BOT~STRINGFIELD21

setvar $BOT~FIELD_INDEX 21
goto :STRINGFIELD


:BOT~STRINGFIELD22

setvar $BOT~FIELD_INDEX 22
goto :STRINGFIELD


:BOT~STRINGFIELD23

setvar $BOT~FIELD_INDEX 23
goto :STRINGFIELD


:BOT~STRINGFIELD24

setvar $BOT~FIELD_INDEX 24
goto :STRINGFIELD


:BOT~STRINGFIELD25

setvar $BOT~FIELD_INDEX 25
goto :STRINGFIELD


:BOT~STRINGFIELD26

setvar $BOT~FIELD_INDEX 26
goto :STRINGFIELD


:BOT~STRINGFIELD27

setvar $BOT~FIELD_INDEX 27
goto :STRINGFIELD


:BOT~STRINGFIELD28

setvar $BOT~FIELD_INDEX 28
goto :STRINGFIELD


:BOT~STRINGFIELD29

setvar $BOT~FIELD_INDEX 29
goto :STRINGFIELD


:BOT~STRINGFIELD3

setvar $BOT~FIELD_INDEX 3
goto :STRINGFIELD


:BOT~STRINGFIELD30

setvar $BOT~FIELD_INDEX 30


:BOT~STRINGFIELD4

setvar $BOT~FIELD_INDEX 4
goto :STRINGFIELD


:BOT~STRINGFIELD5

setvar $BOT~FIELD_INDEX 5
goto :STRINGFIELD


:BOT~STRINGFIELD6

setvar $BOT~FIELD_INDEX 6
goto :STRINGFIELD


:BOT~STRINGFIELD7

setvar $BOT~FIELD_INDEX 7
goto :STRINGFIELD


:BOT~STRINGFIELD8

setvar $BOT~FIELD_INDEX 8
goto :STRINGFIELD


:BOT~STRINGFIELD9

setvar $BOT~FIELD_INDEX 9
goto :STRINGFIELD


:BOT~WRITE_NEW_HELP_FILE
delete $BOT~HELP_FILE
setvar $BOT~I 1
getlength $BOT~COMMAND $BOT~LENGTH
setvar $BOT~SPACES "                                            "
setvar $BOT~STARS "---------------------------------------------"
setvar $BOT~POS $BOT~LENGTH
cuttext $BOT~STARS $BOT~BORDER 1 $BOT~POS
setvar $BOT~POS ((50 - ($BOT~LENGTH + 10)) / 2)
cuttext $BOT~SPACES $BOT~CENTER 1 $BOT~POS
write $BOT~HELP_FILE "                     "
write $BOT~HELP_FILE "   "
write $BOT~HELP_FILE $BOT~CENTER&"<<<< "&$BOT~COMMAND&" >>>>"
write $BOT~HELP_FILE "   "
while ($BOT~I <= $BOT~HELP)
  striptext $BOT~HELP[$BOT~I] #13
  striptext $BOT~HELP[$BOT~I] "`"
  striptext $BOT~HELP[$BOT~I] "'"
  replacetext $BOT~HELP[$BOT~I] "=" "-"
  if ($BOT~HELP[$BOT~I] = 0)
    goto :DONE_HELP_FILE
  end
write $BOT~HELP_FILE $BOT~HELP[$BOT~I]
add $BOT~I 1
end

include "source\include\switchboard"
