:bot~checkstartingprompt
if ($player~current_prompt = 0)
  gosub :player~currentprompt
end
getwordpos " "&$bot~validprompts&" " $bot~pos $player~current_prompt
if ($bot~pos <= 0)
  setvar $switchboard~message "Invalid starting prompt: ["&$player~current_prompt&"]. Valid prompt(s) for this command: ["&$bot~validprompts&"]*"
  gosub :switchboard~switchboard
  goto :WAIT_FOR_COMMAND
end
return
:bot~killthetriggers


killalltriggers
setdelaytrigger UNFREEZINGTRIGGER :UNFREEZEBOT 100000
return
:bot~bigdelay_killthetriggers
killalltriggers
setdelaytrigger UNFREEZINGTRIGGERBIGDELAY :UNFREEZEBOT 1800000
return
:bot~unfreezebot
echo "*Bot timed out, unfreezing..*"
setdeafclients FALSE
send "'{" $bot~bot_name "} - Bot frozen for over 100 seconds, resetting...*"
goto :WAIT_FOR_COMMAND
:bot~wait_for_command



killalltriggers

if (CONNECTED)
  setvar $connectivity~relogging FALSE
  savevar $connectivity~relogging
end

setvar $user_interface~routing ""
setvar $user_interface~temp_bot_name ""
loadvar $bot~botisdeaf
loadvar $planet~planet
loadvar $bot~mode
loadvar $bot~in_kill_routine
setvar $bot~alive_count 0
loadvar $map~home_sector
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $map~stardock
loadvar $map~backdoor
loadvar $bot~safe_ship
loadvar $bot~bot_turn_limit
loadvar $bot~pgrid_bot
if ($map~stardock <= 0)
  setvar $map~stardock STARDOCK
  savevar $map~stardock
end
if ($map~rylos <= 0)
  setvar $map~rylos RYLOS
  savevar $map~rylos
end
if ($map~alpha_centauri <= 0)
  setvar $map~alpha_centauri ALPHACENTAURI
  savevar $map~alpha_centauri
end

setvar $switchboard~self_command FALSE
setvar $bot~scrubonly FALSE
settextouttrigger USER :user_interface~user_access ">"
settextouttrigger UPARROW :user_interface~user_access #28
settextouttrigger DOWNARROW :user_interface~user_access #29
settextouttrigger UPARROW2 :user_interface~user_access #27&"[A"
settextouttrigger DOWNARROW2 :user_interface~user_access #27&"[B"
settextouttrigger TABKEY :user_interface~hotkey_access #9

setvar $user_interface~authorization 0
setvar $user_interface~logged 0
if ($bot~bot_team_name = 0)
  setvar $bot~bot_team_name $bot~bot_name
  savevar $bot~bot_team_name
end
loadvar $bot~last_loaded_module
seteventtrigger SHUTDOWNTHEMODULE :internal_commands~shutdown "SCRIPT STOPPED" $bot~last_loaded_module
settextlinetrigger OWN_COMMAND :user_interface~check_routing $bot~bot_name
settextlinetrigger OWN_COMMAND_TEAM :user_interface~check_routing_team $bot~bot_team_name
settextlinetrigger OWN_COMMAND_ALL :user_interface~check_routing_all "all"
settextlinetrigger LOGINMEMO :internal_commands~loginmemo "a corporate memo "

if (($bot~mode = "General") and (($bot~autoattack = TRUE) and ($bot~in_kill_routine <> TRUE)))
  settextlinetrigger 1 :internal_commands~autokill "warps into the sector."
  settextlinetrigger 2 :internal_commands~autokill "lifts off from"
  settextlinetrigger 3 :internal_commands~autokill "is powering up weapons systems!"
  settextlinetrigger 4 :internal_commands~autokill "enters the game."
  settextlinetrigger 5 :internal_commands~autokill "blasts off from the "
  settextlinetrigger 6 :internal_commands~autokill "Scanners detect a wormhole opening in this sector!"
end
seteventtrigger RELOG :connectivity~keepalive "CONNECTION LOST"
settexttrigger ONLINE_WATCH :connectivity~online_watch "Your session will be terminated in "
setdelaytrigger KEEPALIVE :connectivity~keepalive 60000
pause
pause
:bot~save_the_variables

savevar $bot~command
savevar $bot~user_command_line
savevar $bot~bot_name
savevar $switchboard~bot_name
savevar $bot~self_command
savevar $switchboard~self_command
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~parm7
savevar $bot~parm8
savevar $player~unlimitedgame
setvar $bot~unlimitedgame $player~unlimitedgame
setvar $~unlimitedgame $bot~unlimitedgame
savevar $~unlimitedgame
savevar $bot~unlimitedgame
savevar $ship~cap_file
savevar $planet~planet_file
savevar $bot~bot_turn_limit
savevar $bot~password
savevar $bot~mode
savevar $game~mbbs
savevar $game~ptradesetting
setvar $bot~_ck_ptradesetting $game~ptradesetting
savevar $bot~_ck_ptradesetting
savevar $map~rylos
savevar $map~alpha_centauri
savevar $map~stardock
savevar $map~backdoor
savevar $map~home_sector
savevar $bot~rylos
savevar $bot~alpha_centauri
savevar $bot~stardock
savevar $bot~backdoor
savevar $bot~home_sector
savevar $game~port_max
savevar $game~steal_factor
savevar $game~rob_factor
savevar $bot~subspace
savevar $game~multiple_photons
savevar $bot~alarm_list
savevar $bot~echointerval
if ($bot~bot_password = 0)
  setvar $bot~bot_password $bot~subspace
end
savevar $bot~bot_password
savevar $player~surroundavoidshieldedonly
savevar $player~surroundavoidallplanets
savevar $player~surrounddontavoid
savevar $bot~surroundautocapture
savevar $player~surroundfigs
savevar $player~surroundlimp
savevar $player~surroundmine
savevar $player~dropoffensive
savevar $player~droptoll
savevar $player~fighter_deploy_type
savevar $player~surroundoverwrite
savevar $player~surroundpassive
savevar $player~surroundnormal
savevar $bot~username
savevar $bot~servername
savevar $bot~letter
savevar $player~defendercapping
savevar $player~offensecapping
savevar $bot~safe_ship
savevar $bot~safe_planet
savevar $player~cappingaliens
savevar $player~surround_before_hkill
savevar $bot~command_prompt_extras
savevar $bot~silent_running
savevar $map~planet_list
savevar $bot~startshipname
savevar $bot~mowtodock
savevar $bot~mowtodockbackdoor
savevar $bot~startgamedelay
savevar $bot~isceo
savevar $bot~corpname
savevar $bot~corppassword
savevar $bot~newgameday1
savevar $bot~newgameolder
savevar $bot~pgrid_bot
savevar $bot~autoattack
gosub :main~backwards_compatible
return
:bot~load_the_variables

loadvar $bot~corpname
loadvar $game~game_menu_prompt_ansi
loadvar $game~game_menu_prompt
loadvar $bot~alarm_list
loadvar $player~offensecapping
loadvar $player~cappingaliens
loadvar $planet~planet
loadvar $game~atomic_cost
loadvar $game~beacon_cost
loadvar $game~corbo_cost
loadvar $game~cloak_cost
loadvar $game~probe_cost
loadvar $game~planet_scanner_cost
loadvar $game~limpet_cost
loadvar $game~armid_cost
loadvar $game~photon_cost
loadvar $game~holo_cost
loadvar $game~density_cost
loadvar $game~disruptor_cost
loadvar $game~genesis_cost
loadvar $game~twarpi_cost
loadvar $game~twarpii_cost
loadvar $game~psychic_cost
loadvar $game~photons_enabled
loadvar $game~photon_duration
loadvar $game~max_commands
loadvar $game~goldenabled
loadvar $game~mbbs
loadvar $game~multiple_photons
loadvar $game~colonist_regen
loadvar $game~ptradesetting
loadvar $game~steal_factor
loadvar $game~rob_factor
loadvar $game~clear_bust_days
loadvar $game~port_max
loadvar $game~production_rate
loadvar $game~production_regen
loadvar $game~debris_loss
loadvar $game~radiation_lifetime
loadvar $game~limpet_removal_cost
loadvar $game~max_planets_per_sector
loadvar $bot~subspace
loadvar $bot~password
loadvar $bot~bot_password
if ($bot~bot_password = 0)
  setvar $bot~bot_password $bot~subspace
  savevar $bot~bot_password
end
loadvar $player~surroundavoidshieldedonly
loadvar $bot~surroundautocapture
loadvar $player~surroundavoidallplanets
loadvar $player~surrounddontavoid
loadvar $map~stardock
loadvar $map~backdoor
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $map~home_sector
loadvar $player~surroundfigs
loadvar $player~surroundlimp
loadvar $player~surroundmine
loadvar $bot~bot_name
setvar $switchboard~bot_name $bot~bot_name
loadvar $player~surroundoverwrite
loadvar $player~surroundpassive
loadvar $player~surroundnormal
loadvar $bot~username
loadvar $bot~servername
loadvar $bot~letter
loadvar $player~defendercapping
loadvar $bot~bot_turn_limit
loadvar $bot~safe_ship
loadvar $bot~pgrid_bot
loadvar $bot~safe_planet
loadvar $bot~corppassword

loadvar $bot~bot_team_name
loadvar $bot~historystring
loadvar $bot~dorelog
loadvar $player~surround_before_hkill
loadvar $bot~command_prompt_extras
loadvar $bot~silent_running
loadvar $bot~autoattack
loadvar $player~fighter_deploy_type
loadvar $player~dropoffensive
loadvar $player~droptoll
gosub :NORMALIZE_DEPLOY_PREFERENCES


return
:bot~load_bot



setvar $bot~do_not_resuscitate FALSE
savevar $bot~do_not_resuscitate

loadvar $bot~major_version
loadvar $bot~minor_version

setvar $bot~mombot_folder_config "scripts/mombot"&$bot~major_version&"_"&$bot~minor_version&".cfg"
fileexists $bot~folder_config_exists $bot~mombot_folder_config
if ($bot~folder_config_exists)
  read $bot~mombot_folder_config $bot~mombot_directory 1
else
  delete $bot~mombot_folder_config
  setvar $bot~mombot_directory $bot~default_bot_directory
  write $bot~mombot_folder_config $bot~mombot_directory
end

savevar $bot~mombot_directory

setvar $bot~legacy_folder "scripts/"&$bot~mombot_directory&"/games/"&GAMENAME
makedir "games"
setvar $bot~folder "games/"&GAMENAME
makedir $bot~folder
gosub :MIGRATE_GAME_FOLDER

setvar $bot~mombot_config_file "scripts/"&$bot~mombot_directory&"/mombot.cfg"
setvar $bot~hotkeys_file $bot~mombot_config_file
setvar $bot~custom_keys_file $bot~mombot_config_file
setvar $bot~custom_commands_file $bot~mombot_config_file
savevar $bot~mombot_config_file

gosub :menus~dosplashscreen
gosub :LOAD_HOTKEY_CONFIG

gosub :combat~init
setvar $player~startinglocation ""
setarray $bot~internalcommandlists 7
setvar $bot~internalcommandlists[1] " stopall stop listall reset emq bot relog tow refresh login logoff unlock lift with dep callin about cn extern twarp bwarp pwarp relog help switchbot "
setvar $bot~internalcommandlists[2] " "
setvar $bot~internalcommandlists[3] " hkill kill htorp "
setvar $bot~internalcommandlists[4] " refurb scrub "
setvar $bot~internalcommandlists[5] " surround exit xenter mow "
setvar $bot~internalcommandlists[6] " "
setvar $bot~internalcommandlists[7] " find pscan sector storeship setvar getvar "
setvar $bot~doubledcommandlist " parm params parms qss sec sect secto cn9 logout emx smow port shipstore finder xenter status pinfo holotorp"
setvar $bot~internalcommandlist $bot~internalcommandlists[1]&$bot~internalcommandlists[2]&$bot~internalcommandlists[3]&$bot~internalcommandlists[4]&$bot~internalcommandlists[5]&$bot~internalcommandlists[6]&$bot~internalcommandlists[7]
setarray $bot~types 7
setvar $bot~types[1] "General"
setvar $bot~types[2] "Defense"
setvar $bot~types[3] "Offense"
setvar $bot~types[4] "Resource"
setvar $bot~types[5] "Grid"
setvar $bot~types[6] "Cashing"
setvar $bot~types[7] "Data"
setarray $bot~catagories 3
setvar $bot~catagories[1] "Modes"
setvar $bot~catagories[2] "Commands"
setvar $bot~catagories[3] "Daemons"
setvar $bot~corpycount 0
setarray $bot~corpy 30 1

setvar $bot~gamestats FALSE
setvar $bot~script_name "Mind ()ver Matter Bot "
setvar $bot~mode "General"
setvar $switchboard~self_command FALSE
setvar $bot~okaytouse TRUE
setvar $player~trader_name ""
setarray $bot~parms 8
setvar $bot~parms 8
setvar $bot~modulecategory ""


setvar $bot~start_fig_hit "Deployed Fighters Report Sector "
setvar $bot~end_fig_hit ":"
setvar $bot~alien_ansi #27&"[1;36m"&#27&"["
setvar $bot~start_fig_hit_owner ":"
setvar $bot~end_fig_hit_owner "'s"



setvar $bot~gconfig_file $bot~folder&"/bot.cfg"
setvar $bot~ck_fig_file $bot~folder&"/_ck_"&GAMENAME&".figs"
setvar $bot~fig_file $bot~folder&"/fighters.cfg"
setvar $bot~fig_count_file $bot~folder&"/fighters.cnt"
setvar $bot~limp_file $bot~folder&"/limpets.cfg"
setvar $bot~limp_count_file $bot~folder&"/limpets.cnt"
setvar $bot~armid_count_file $bot~folder&"/armids.cnt"
setvar $bot~armid_file $bot~folder&"/armids.cfg"
setvar $bot~timer_file $bot~folder&"/timer.cfg"
setvar $game~game_settings_file $bot~folder&"/game_settings.cfg"
setvar $bot~bot_user_file $bot~folder&"/bot_users.lst"
setvar $ship~cap_file $bot~folder&"/ships.cfg"
setvar $planet~planet_file $bot~folder&"/planets.cfg"
setvar $bot~script_file "scripts/"&$bot~mombot_directory&"/hotkey_scripts.cfg"
setvar $bot~bust_file $bot~folder&"/busts.cfg"
setvar $bot~mcic_file $bot~folder&"/planet.nego"

setvar $bot~last_loaded_module ""
savevar $bot~last_loaded_module
savevar $bot~gconfig_file
savevar $bot~folder
savevar $bot~ck_fig_file
savevar $bot~fig_file
savevar $bot~fig_count_file
savevar $bot~limp_file
savevar $bot~limp_count_file
savevar $bot~armid_count_file
savevar $bot~armid_file
savevar $game~game_settings_file
savevar $bot~bot_user_file
savevar $ship~cap_file
savevar $planet~planet_file
savevar $bot~script_file
savevar $bot~bust_file
savevar $bot~mcic_file
savevar $bot~timer_file
goto :AFTER_GAME_FOLDER_MIGRATION_HELPERS
:bot~migrate_game_folder

direxists $bot~legacy_folder_exists $bot~legacy_folder
if ($bot~legacy_folder_exists = 0)
  return
end

setvar $bot~migrate_file "bot.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "bot_users.lst"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "_ck_"&GAMENAME&".figs"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "ships.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "dbonus-ships.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "planets.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "fighters.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "fighters.cnt"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "limpets.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "limpets.cnt"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "armids.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "armids.cnt"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "game_settings.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "timer.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "busts.cfg"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "planet.nego"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "bubble.list"
gosub :MIGRATE_GAME_FILE
setvar $bot~migrate_file "No_Credits.list"
gosub :MIGRATE_GAME_FILE
return
:bot~migrate_game_file

setvar $bot~migrate_source $bot~legacy_folder&"/"&$bot~migrate_file
setvar $bot~migrate_dest $bot~folder&"/"&$bot~migrate_file
fileexists $bot~migrate_source_exists $bot~migrate_source
if ($bot~migrate_source_exists)
  fileexists $bot~migrate_dest_exists $bot~migrate_dest
  if ($bot~migrate_dest_exists = 0)
    rename $bot~migrate_source $bot~migrate_dest
  end
end
return
:bot~after_game_folder_migration_helpers


setarray $bot~history 100
setvar $bot~promptoutput ""
setvar $bot~charcount 0
setvar $bot~historyindex 0
setvar $bot~currentprompttext ""
setvar $bot~historymax 100
setvar $bot~historycount 0
setvar $bot~charpos 0


setvar $bot~player_cash_max 999999999
setvar $planet~citadel_cash_max "999999999999999"


setvar $player~current_prompt "Undefined"
setvar $player~psychic_probe "No"
setvar $player~planet_scanner "No"
setvar $player~scan_type "None"
:bot~getinitial_settings


setvar $connectivity~relogging FALSE
savevar $connectivity~relogging
loadvar $game~gamestats
setvar $bot~pgrid_type "Normal"
setvar $bot~pgrid_end_command " scan "
getword CURRENTLINE $player~startinglocation 1
fileexists $bot~script_file_chk $bot~script_file
if ($bot~script_file_chk)
  setarray $bot~hotkey_scripts 10 1
  setvar $bot~i 1
  setvar $bot~hotkey_scripts 0
  read $bot~script_file $bot~line $bot~i
  while ($bot~line <> "EOF")
    getword $bot~line $bot~filelocation 1
    getwordpos $bot~line $bot~pos #34
    if ($bot~pos <= 0)
      echo "Error with script file. either remove "&$bot~script_file&", or fix it*"
      halt
    end
    cuttext $bot~line $bot~scriptname $bot~pos 9999
    striptext $bot~scriptname #34
    setvar $bot~hotkey_scripts[$bot~i] $bot~filelocation
    setvar $bot~hotkey_scripts[$bot~i][1] $bot~scriptname
    add $bot~i 1
    add $bot~hotkey_scripts 1
    read $bot~script_file $bot~line $bot~i
  end
else
  setarray $bot~hotkey_scripts 10 1
end

fileexists $bot~gfile_chk $bot~gconfig_file
if ($bot~gfile_chk)
  loadvar $game~mbbs
  loadvar $game~steal_factor
  loadvar $game~rob_factor
  loadvar $game~ptradesetting
  loadvar $game~port_max
  loadvar $player~unlimitedgame
  setvar $bot~dorelog TRUE
  savevar $bot~dorelog
  read $bot~gconfig_file $bot~bot_name 1
  setvar $switchboard~bot_name $bot~bot_name
  if (CONNECTED = TRUE)
    gosub :player~quikstats
  end
  if (CONNECTED = TRUE)
    gosub :player~quikstats
    setvar $player~startinglocation $player~current_prompt
  end
  if ((($player~startinglocation = "Command") or ($player~startinglocation = "Citadel")) and (CONNECTED = TRUE))
    if ($game~ptradesetting = 0)
      gosub :game~gamestats
    end
    gosub :player~quikstats
    gosub :player~getinfo
    gosub :ship~getshipstats
    gosub :player~quikstats

    fileexists $ship~cap_file_chk $ship~cap_file
    if ($ship~cap_file_chk)
      gosub :ship~loadshipinfo
    else
      gosub :ship~getshipcapstats
      gosub :ship~loadshipinfo
    end
    fileexists $planet~planet_file_chk $planet~planet_file
    if ($planet~planet_file_chk)
      gosub :planet~loadplanetinfo
    else
      gosub :planet~getplanetstats
      gosub :planet~loadplanetinfo
    end
  else
    fileexists $ship~cap_file_chk $ship~cap_file
    if ($ship~cap_file_chk)
      gosub :ship~loadshipinfo
    end
    fileexists $planet~planet_file_chk $planet~planet_file
    if ($planet~planet_file_chk)
      gosub :planet~loadplanetinfo
    end
  end
else
  :bot~conf_bot
  setvar $player~surroundfigs 1
  savevar $player~surroundfigs
  if (CONNECTED = TRUE)
    gosub :player~quikstats
  end
  echo ANSI_13
  echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
  echo "*  Getting intial settings for M()M Bot . . . *"
  echo "*  Game is not set up for M()M Bot, doing that now. "
  echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  setdelaytrigger WOAH :KEEP_GOING 200
  pause
  pause
  :bot~keep_going
  gosub :menus~add_game
  if ((($player~startinglocation = "Command") or ($player~startinglocation = "Citadel")) and (CONNECTED = TRUE))
    gosub :game~gamestats
    gosub :player~quikstats
    gosub :player~getinfo
    fileexists $ship~cap_file_chk $ship~cap_file
    if ($ship~cap_file_chk)
      gosub :ship~loadshipinfo
    else
      gosub :ship~getshipcapstats
      gosub :ship~loadshipinfo
    end
    fileexists $planet~planet_file_chk $planet~planet_file
    if ($planet~planet_file_chk)
      gosub :planet~loadplanetinfo
    else
      gosub :planet~getplanetstats
      gosub :planet~loadplanetinfo
    end

    echo ANSI_13
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    echo "*  M()M Bot initialization completed . . .  *"
    echo "*  You should be setup and ready to go! "
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  else
    fileexists $ship~cap_file_chk $ship~cap_file
    if ($ship~cap_file_chk)
      gosub :ship~loadshipinfo
    end
    fileexists $planet~planet_file_chk $planet~planet_file
    if ($planet~planet_file_chk)
      gosub :planet~loadplanetinfo
    end
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
    echo "*  You weren't connected to the game when starting "
    echo "*    so you will want to reboot or refresh once "
    echo "* connected into the game to properly configure bot. "
    echo "*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
  end
end




getsectorparameter 2 "FIG_COUNT" $bot~figcount
if ($bot~figcount = "")
  setsectorparameter 2 "FIG_COUNT" 0
end
loadvar $bot~echointerval
if ($bot~echointerval <= 0)
  setvar $bot~echointerval 5760
  savevar $bot~echointerval
end
setvar $bot~botisoff FALSE
gosub :LOAD_THE_VARIABLES
if (($player~surroundavoidshieldedonly = FALSE) and (($bot~surroundautocapture = FALSE) and (($player~surroundavoidallplanets = FALSE) and ($player~surrounddontavoid = FALSE))))
  setvar $player~surroundavoidallplanets TRUE
end
if ($bot~bot_team_name = 0)
  setvar $bot~bot_team_name $bot~bot_name
end
if ($bot~password = 0)
  setvar $bot~password PASSWORD
end
if ($bot~username = 0)
  setvar $bot~username LOGINNAME
end
if ($bot~letter = 0)
  setvar $bot~letter GAME
end
if ($map~stardock <= 0)
  setvar $map~stardock STARDOCK
  savevar $map~stardock
end
if ($map~rylos <= 0)
  setvar $map~rylos RYLOS
  savevar $map~rylos
end
if ($map~alpha_centauri <= 0)
  setvar $map~alpha_centauri ALPHACENTAURI
  savevar $map~alpha_centauri
end
gosub :SAVE_THE_VARIABLES

getfilelist $bot~startup_scripts "scripts\"&$bot~mombot_directory&"\startups\*.cts"
setvar $bot~i 1
while ($bot~i <= $bot~startup_scripts)
  stop "scripts\"&$bot~mombot_directory&"\startups\"&$bot~startup_scripts[$bot~i]
  stop "scripts\"&$bot~mombot_directory&"\startups\"&$bot~startup_scripts[$bot~i]
  stop "scripts\"&$bot~mombot_directory&"\startups\"&$bot~startup_scripts[$bot~i]
  stop "scripts\"&$bot~mombot_directory&"\startups\"&$bot~startup_scripts[$bot~i]
  setvar $bot~command $bot~startup_scripts[$bot~i]
  replacetext $bot~command ".cts" ""
  savevar $bot~command
  load "scripts\"&$bot~mombot_directory&"\startups\"&$bot~startup_scripts[$bot~i]
  add $bot~i 1
end
:bot~run_bot

if ((($player~startinglocation = "Citadel") or ($player~startinglocation = "Command")) and (CONNECTED = TRUE))
  gosub :player~startcnsettings
  killalltriggers
  gosub :player~quikstats
  gosub :player~getinfo
  if ($player~corp <> 0)
    setvar $bot~my_name $player~trader_name
    trim $bot~my_name
    setvar $switchboard~message "Logging corp mates automatically - "
    if ($player~current_prompt = "Citadel")
      send "xa"
    else
      send "ta"
    end
    waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
    waiton "------------------------------------------------------------------------------"
    :bot~ta_again

    settextlinetrigger TALINE :TA_CHECK
    pause
    :bot~ta_check

    getwordpos CURRENTLINE $bot~pos "P indicates Trader is on a planet in that sector"
    getwordpos CURRENTLINE $bot~pos2 "Corporate command ["
    if (($bot~pos > 0) or ($bot~pos2 > 0))
      goto :DONE_TA
    end
    setvar $bot~line CURRENTLINE
    getlength CURRENTLINE $bot~length
    if ($bot~length > 30)
      setvar $bot~line CURRENTLINE
      cuttext $bot~line $bot~name 1 30
      replacetext $bot~line $bot~name ""
      trim $bot~name
      if ($bot~name <> $bot~my_name)
        add $bot~corpycount 1
        setvar $bot~corpy[$bot~corpycount] $bot~name
        getword $bot~line $bot~corpy[$bot~corpycount][1] 1
      end
    else
      goto :DONE_TA
    end
    goto :TA_AGAIN
    :bot~done_ta
    send "q"
    if ($player~current_prompt = "Citadel")
      waiton "Citadel command ("
    else
      waiton "Command ["
    end
  end
  send "'{" $bot~bot_name "} - is ACTIVE: Version - "&$bot~major_version&"."&$bot~minor_version " - type " #34 $bot~bot_name " help" #34 " for command list*"
  send "'{" $bot~bot_name "} - to login - send a corporate memo*"
  if (($bot~username = "") or ($bot~letter = "") or ($bot~dorelog = FALSE))
    send "'{" $bot~bot_name "} - Auto Relog - Not Active*"
    setvar $bot~dorelog FALSE
  end

  gosub :player~quikstats


  fileexists $bot~team_file_check $bot~bot_user_file
  if ($bot~team_file_check)
    setarray $bot~corp_list 1
    readtoarray $bot~bot_user_file $bot~corp_list
    setvar $bot~i 1
    while ($bot~i <= $bot~corp_list)
      setvar $bot~j 1
      setvar $bot~isfound FALSE
      while ($bot~j <= $bot~corpycount)
        setvar $bot~corpy_lower $bot~corpy[$bot~j]
        setvar $bot~corp_list_lower $bot~corp_list[$bot~i]
        lowercase $bot~corpy_lower
        lowercase $bot~corp_list_lower
        if ($bot~corp_list_lower = $bot~corpy_lower)
          setvar $bot~isfound TRUE
        end
        add $bot~j 1
      end
      if ($bot~isfound <> TRUE)
        add $bot~corpycount 1
        setvar $bot~corpy[$bot~corpycount] $bot~corp_list[$bot~i]
      end
      add $bot~i 1
    end
  end
  delete $bot~bot_user_file
  setvar $bot~i 1
  while ($bot~i <= $bot~corpycount)
    setvar $switchboard~message $switchboard~message&$bot~corpy[$bot~i]&", "
    write $bot~bot_user_file $bot~corpy[$bot~i]
    add $bot~i 1
  end
  if ($bot~corpycount > 0)
    replacetext $switchboard~message $bot~corpy[$bot~corpycount]&", " $bot~corpy[$bot~corpycount]
    if ($bot~corpycount = 1)
      setvar $switchboard~message $switchboard~message&" is added.*"
    else
      replacetext $switchboard~message $bot~corpy[$bot~corpycount] "and "&$bot~corpy[$bot~corpycount]
      setvar $switchboard~message $switchboard~message&" are added.*"
    end
    gosub :switchboard~switchboard
  end
else
  fileexists $bot~team_file_check $bot~bot_user_file
  if ($bot~team_file_check)
    setarray $bot~corp_list 1
    readtoarray $bot~bot_user_file $bot~corp_list
    setvar $bot~i 1
    while ($bot~i <= $bot~corp_list)
      setvar $bot~j 1
      setvar $bot~isfound FALSE
      while ($bot~j <= $bot~corpycount)
        setvar $bot~corpy_lower $bot~corpy[$bot~j]
        setvar $bot~corp_list_lower $bot~corp_list[$bot~i]
        lowercase $bot~corpy_lower
        lowercase $bot~corp_list_lower
        if ($bot~corp_list_lower = $bot~corpy_lower)
          setvar $bot~isfound TRUE
        end
        add $bot~j 1
      end
      if ($bot~isfound <> TRUE)
        add $bot~corpycount 1
        setvar $bot~corpy[$bot~corpycount] $bot~corp_list[$bot~i]
      end
      add $bot~i 1
    end
  end
  echo "*{" $bot~bot_name "} is ACTIVE: Version - "&$bot~major_version&"."&$bot~minor_version " - type " #34 $bot~bot_name " help" #34 " for command list*"
  if (($bot~username = "") or ($bot~letter = "") or ($bot~dorelog = FALSE))
    echo "{"&$bot~bot_name&"} - Auto Relog - Not Active*"
    setvar $bot~dorelog FALSE
  end
  echo "{"&$bot~bot_name&"} - No EP Haggle is running because the bot was started offline.*"
end
savevar $bot~bot_name
:bot~initiate_bot
loadvar $bot~isshipdestroyed
if (CONNECTED <> TRUE)
  goto :menus~pregamemenuload
else
  setvar $bot~isshipdestroyed FALSE
  savevar $bot~isshipdestroyed
end




goto :WAIT_FOR_COMMAND
:bot~load_watcher_variables

loadvar $ship~ship_max_attack
loadvar $ship~ship_fighters_max
loadvar $ship~ship_offensive_odds
loadvar $planet~planet
loadvar $player~current_sector
return
:bot~addfigtodata



















setsectorparameter $bot~target "FIGSEC" TRUE
return
:bot~banner




setvar $switchboard~message $bot~script_title&" starting up!*"
gosub :switchboard~switchboard
return
:bot~booleanfield



setvar $bot~currentvalue $bot~fields[$bot~field_index][2]
if ($bot~currentvalue = FALSE)
  setvar $bot~currentvalue TRUE
  setvar $bot~displayvalue ANSI_14&"On"
else
  setvar $bot~currentvalue FALSE
  setvar $bot~displayvalue ANSI_15&"Off"
end
setvar $bot~fields[$bot~field_index][2] $bot~currentvalue
setvar $bot~extra $bot~fields[$bot~field_index][3]
padright $bot~displayvalue $bot~field_padding
setvar $bot~displayvalue $bot~displayvalue&$bot~extra
setmenuvalue $bot~fields[$bot~field_index] $bot~displayvalue
goto :MENU_CREATION
:bot~booleanfield1



setvar $bot~field_index 1
goto :BOOLEANFIELD
:bot~booleanfield10



setvar $bot~field_index 10
goto :BOOLEANFIELD
:bot~booleanfield11



setvar $bot~field_index 11
goto :BOOLEANFIELD
:bot~booleanfield12



setvar $bot~field_index 12
goto :BOOLEANFIELD
:bot~booleanfield13



setvar $bot~field_index 13
goto :BOOLEANFIELD
:bot~booleanfield14



setvar $bot~field_index 14
goto :BOOLEANFIELD
:bot~booleanfield15



setvar $bot~field_index 15
goto :BOOLEANFIELD
:bot~booleanfield16



setvar $bot~field_index 16
goto :BOOLEANFIELD
:bot~booleanfield17



setvar $bot~field_index 17
goto :BOOLEANFIELD
:bot~booleanfield18



setvar $bot~field_index 18
goto :BOOLEANFIELD
:bot~booleanfield19



setvar $bot~field_index 19
goto :BOOLEANFIELD
:bot~booleanfield2



setvar $bot~field_index 2
goto :BOOLEANFIELD
:bot~booleanfield20



setvar $bot~field_index 20
goto :BOOLEANFIELD
:bot~booleanfield21



setvar $bot~field_index 21
goto :BOOLEANFIELD
:bot~booleanfield22



setvar $bot~field_index 22
goto :BOOLEANFIELD
:bot~booleanfield23



setvar $bot~field_index 23
goto :BOOLEANFIELD
:bot~booleanfield24



setvar $bot~field_index 24
goto :BOOLEANFIELD
:bot~booleanfield25



setvar $bot~field_index 25
goto :BOOLEANFIELD
:bot~booleanfield26



setvar $bot~field_index 26
goto :BOOLEANFIELD
:bot~booleanfield27



setvar $bot~field_index 27
goto :BOOLEANFIELD
:bot~booleanfield28



setvar $bot~field_index 28
goto :BOOLEANFIELD
:bot~booleanfield29



setvar $bot~field_index 29
goto :BOOLEANFIELD
:bot~booleanfield3



setvar $bot~field_index 3
goto :BOOLEANFIELD
:bot~booleanfield30



setvar $bot~field_index 30
:bot~booleanfield4



setvar $bot~field_index 4
goto :BOOLEANFIELD
:bot~booleanfield5



setvar $bot~field_index 5
goto :BOOLEANFIELD
:bot~booleanfield6



setvar $bot~field_index 6
goto :BOOLEANFIELD
:bot~booleanfield7



setvar $bot~field_index 7
goto :BOOLEANFIELD
:bot~booleanfield8



setvar $bot~field_index 8
goto :BOOLEANFIELD
:bot~booleanfield9



setvar $bot~field_index 9
goto :BOOLEANFIELD
:bot~changebotname



getinput $bot~bot_to_control "What bot are you trying to control?"

if ($bot~bot_to_control = "")
  setvar $bot~bot_to_control $bot~bot_name
  setvar $bot~bot_to_control_display ANSI_14&$bot~bot_name
else
  setvar $bot~bot_to_control_display ANSI_14&$bot~bot_to_control
end
padright $bot~bot_to_control_display $bot~field_padding
setmenuvalue "CONTROL" $bot~bot_to_control_display
goto :MENU_CREATION
:bot~commas




format $bot~value $bot~value "NUMBER"
return
:bot~disconnecttriggers




settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
:bot~disconnect_triggers



settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
:bot~displayhelp


setvar $bot~i 1
setvar $bot~helpoutput ""
setvar $bot~isdone FALSE
while (($bot~i <= $bot~help) and ($bot~isdone <> TRUE))
  if ($bot~help[$bot~i] <> 0)
    striptext $bot~help[$bot~i] #13
    striptext $bot~help[$bot~i] "`"
    striptext $bot~help[$bot~i] "'"
    replacetext $bot~help[$bot~i] "=" "-"
    setvar $bot~temp $bot~help[$bot~i]
    getlength $bot~temp $bot~length
    setvar $bot~istoolong FALSE
    setvar $bot~next_line ""
    setvar $bot~max_length 65
    if (($switchboard~self_command = TRUE) or ($bot~silent_running = TRUE))
      setvar $bot~line $bot~help[$bot~i]
      gosub :FORMATHELPLINE
      setvar $bot~help[$bot~i] $bot~line
      setvar $bot~next_line_test $bot~next_line
      striptext $bot~next_line_test " "
      if ($bot~next_line_test <> "")
        setvar $bot~line $bot~next_line
        gosub :FORMATHELPLINE
        setvar $bot~next_line $bot~line
      end
    else
      while ($bot~length > $bot~max_length)
        setvar $bot~istoolong TRUE
        cuttext $bot~temp $bot~next_line ($bot~max_length + 1) ($bot~length - $bot~max_length)
        cuttext $bot~temp $bot~help[$bot~i] 1 $bot~max_length
        getlength $bot~next_line $bot~length
      end
    end
    setvar $bot~helpoutput $bot~helpoutput&$bot~help[$bot~i]&"  *"
    setvar $bot~next_line_test $bot~next_line
    striptext $bot~next_line_test " "
    if ($bot~next_line_test <> "")
      setvar $bot~helpoutput $bot~helpoutput&""&$bot~next_line&"  *"
    end
    if ($bot~length <= 1)
    end


  else
    setvar $bot~isdone TRUE
  end
  add $bot~i 1
end

if (($switchboard~self_command = TRUE) or ($bot~silent_running = TRUE))
  setvar $bot~helpoutput "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$bot~helpoutput&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $switchboard~message $bot~helpoutput
  gosub :switchboard~switchboard
else
  setvar $bot~helpoutput "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$bot~helpoutput&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$switchboard~bot_name&"} - *"&$bot~helpoutput&"*"
end
return
:bot~done_help_file


setvar $switchboard~message "Writing text file for "&$bot~command&" in help directory.*"
gosub :switchboard~switchboard

if ($bot~only_help = TRUE)
  gosub :DISPLAYHELP
  halt
end
return
:bot~echo



getdeafclients $bot~botisdeaf
if ($bot~botisdeaf)
  setvar $bot~silent_running TRUE
  gosub :switchboard~switchboard
else
  echo $switchboard~message
end
return
:bot~formathelpline



replacetext $bot~line "[" ANSI_2&"["&ANSI_6
replacetext $bot~line "]" ANSI_2&"]"&ANSI_13
replacetext $bot~line "-" ANSI_7&"-"&ANSI_13
replacetext $bot~line "<<<<" ANSI_14&"<"&ANSI_7&"<"&ANSI_14&"<"&ANSI_7&"<"&ANSI_15
replacetext $bot~line ">>>>" ANSI_7&">"&ANSI_14&">"&ANSI_7&">"&ANSI_14&">"
replacetext $bot~line "{" ANSI_2&"{"&ANSI_6
replacetext $bot~line "}" ANSI_2&"}"&ANSI_13
replacetext $bot~line "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
setvar $bot~line ANSI_13&$bot~line&ANSI_15

return
:bot~helpfile




setvar $bot~only_help FALSE
if (($bot~parm1 = "help") or ($bot~parm1 = "?"))
  setvar $bot~only_help TRUE
end
if (($switchboard~self_command <> FALSE) and (($bot~parm1 = "!") or ($bot~parm1 = "menu")))
  goto :SELF_MENU
end
setvar $bot~help_file "scripts\"&$bot~mombot_directory&"\help\"&$bot~command&".txt"
fileexists $bot~doeshelpfileexist $bot~help_file
if ($bot~doeshelpfileexist)
  setvar $bot~i 1
  read $bot~help_file $bot~help_line ($bot~i + 4)
  while ($bot~help_line <> "EOF")

    striptext $bot~help[$bot~i] #13
    striptext $bot~help[$bot~i] "`"
    striptext $bot~help[$bot~i] "'"

    if ($bot~help[$bot~i] <> $bot~help_line)
      goto :WRITE_NEW_HELP_FILE
    end
    add $bot~i 1
    read $bot~help_file $bot~help_line ($bot~i + 4)
  end
  if (($bot~help[($bot~i + 1)] <> 0) or ($bot~help[($bot~i + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($bot~only_help = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE
:bot~help_file




setvar $bot~help_file "scripts\"&$bot~mombot_directory&"\help\"&$bot~command&".txt"
fileexists $bot~doeshelpfileexist $bot~help_file
setvar $bot~only_help FALSE
if (($bot~parm1 = "help") or ($bot~parm1 = "?"))
  setvar $bot~only_help TRUE
end
if ($bot~doeshelpfileexist)
  setvar $bot~i 1
  read $bot~help_file $bot~help_line ($bot~i + 4)
  while ($bot~help_line <> "EOF")

    striptext $bot~help[$bot~i] #13
    striptext $bot~help[$bot~i] "`"
    striptext $bot~help[$bot~i] "'"
    replacetext $bot~help[$bot~i] "=" "-"
    if ($bot~help[$bot~i] <> $bot~help_line)
      goto :WRITE_NEW_HELP_FILE
    end
    add $bot~i 1
    read $bot~help_file $bot~help_line ($bot~i + 4)
  end
  if (($bot~help[($bot~i + 1)] <> 0) or ($bot~help[($bot~i + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($bot~only_help = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE
:bot~loadvars


loadvar $bot~mode
loadvar $bot~command
loadvar $bot~command_caller
loadvar $bot~mombot_directory
loadvar $bot~mombot_config_file
loadvar $switchboard~bot_name
setvar $bot~bot_name $switchboard~bot_name
loadvar $planet~planet_file
loadvar $ship~cap_file
loadvar $bot~user_command_line
loadvar $bot~parm1
loadvar $bot~parm2
loadvar $bot~parm3
loadvar $bot~parm4
loadvar $bot~parm5
loadvar $bot~parm6
loadvar $bot~parm7
loadvar $bot~parm8
loadvar $bot~bot_turn_limit
loadvar $player~unlimitedgame
loadvar $map~stardock
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $map~home_sector
loadvar $map~backdoor
loadvar $bot~silent_running
loadvar $bot~botisdeaf
loadvar $switchboard~self_command
loadvar $planet~planet
loadvar $bot~password
loadvar $bot~letter
loadvar $game~port_max
loadvar $bot~folder
loadvar $game~photon_duration
loadvar $settings~override
loadvar $player~surroundfigs
loadvar $player~surroundlimp
loadvar $player~surroundmine
loadvar $player~fighter_deploy_type
loadvar $player~dropoffensive
loadvar $player~droptoll
gosub :NORMALIZE_DEPLOY_PREFERENCES




setarray $bot~help 60
setvar $bot~help 60
setvar $bot~tab "     "

return
:bot~normalize_deploy_preferences


if ($player~dropoffensive = TRUE)
  setvar $player~dropoffensive TRUE
  setvar $player~droptoll FALSE
  setvar $player~fighter_deploy_type "o"
elseif ($player~droptoll = TRUE)
  setvar $player~dropoffensive FALSE
  setvar $player~droptoll TRUE
  setvar $player~fighter_deploy_type "t"
else
  lowercase $player~fighter_deploy_type
  if ($player~fighter_deploy_type = "o")
    setvar $player~dropoffensive TRUE
    setvar $player~droptoll FALSE
    setvar $player~fighter_deploy_type "o"
  elseif ($player~fighter_deploy_type = "t")
    setvar $player~dropoffensive FALSE
    setvar $player~droptoll TRUE
    setvar $player~fighter_deploy_type "t"
  else
    setvar $player~dropoffensive FALSE
    setvar $player~droptoll FALSE
    setvar $player~fighter_deploy_type "d"
  end
end
savevar $player~dropoffensive
savevar $player~droptoll
savevar $player~fighter_deploy_type
return
:bot~enter_menu_deaf



if ($bot~menu_deaf_depth <= 0)
  getdeafclients $bot~menu_deaf_restore
end
add $bot~menu_deaf_depth 1
setdeafclients TRUE
setvar $bot~botisdeaf TRUE
savevar $bot~botisdeaf

return
:bot~init_hotkey_defaults



setarray $bot~hotkeys 255
setarray $bot~custom_keys 33
setarray $bot~custom_commands 33

setvar $bot~custom_keys[1] "K"
setvar $bot~custom_keys[2] "C"
setvar $bot~custom_keys[3] "R"
setvar $bot~custom_keys[4] "S"
setvar $bot~custom_keys[5] "H"
setvar $bot~custom_keys[6] "T"
setvar $bot~custom_keys[7] "P"
setvar $bot~custom_keys[8] "Q"
setvar $bot~custom_keys[9] "L"
setvar $bot~custom_keys[10] #9
setvar $bot~custom_keys[11] "D"
setvar $bot~custom_keys[12] "X"
setvar $bot~custom_keys[13] "M"
setvar $bot~custom_keys[14] "F"
setvar $bot~custom_keys[15] "Z"
setvar $bot~custom_keys[16] "~"
setvar $bot~custom_keys[17] "B"

setvar $bot~custom_commands[1] ":INTERNAL_COMMANDS~autokill"
setvar $bot~custom_commands[2] ":INTERNAL_COMMANDS~autocap"
setvar $bot~custom_commands[3] ":INTERNAL_COMMANDS~autorefurb"
setvar $bot~custom_commands[4] ":INTERNAL_COMMANDS~surround"
setvar $bot~custom_commands[5] ":INTERNAL_COMMANDS~htorp"
setvar $bot~custom_commands[6] ":INTERNAL_COMMANDS~twarpswitch"
setvar $bot~custom_commands[7] ":INTERNAL_COMMANDS~kit"
setvar $bot~custom_commands[8] ":USER_INTERFACE~script_access"
setvar $bot~custom_commands[9] ":INTERNAL_COMMANDS~hkill"
setvar $bot~custom_commands[10] ":INTERNAL_COMMANDS~stopModules"
setvar $bot~custom_commands[11] ":INTERNAL_COMMANDS~kit"
setvar $bot~custom_commands[12] ":INTERNAL_COMMANDS~xenter"
setvar $bot~custom_commands[13] ":INTERNAL_COMMANDS~mowswitch"
setvar $bot~custom_commands[14] ":INTERNAL_COMMANDS~fotonswitch"
setvar $bot~custom_commands[15] ":INTERNAL_COMMANDS~clear"
setvar $bot~custom_commands[16] ":MENUS~preferencesMenu"
setvar $bot~custom_commands[17] ":INTERNAL_COMMANDS~dock_shopper"

gosub :REBUILD_HOTKEY_INDEX
return
:bot~load_hotkey_config



gosub :INIT_HOTKEY_DEFAULTS
fileexists $bot~config_exists $bot~mombot_config_file
if ($bot~config_exists)
  readtoarray $bot~mombot_config_file $bot~hotkey_config_lines
  if ($bot~hotkey_config_lines = 33)
    gosub :APPLY_HOTKEY_CONFIG
    if ($bot~hotkey_config_valid = TRUE)
      delete "scripts/"&$bot~mombot_directory&"/hotkeys.cfg"
      delete "scripts/"&$bot~mombot_directory&"/custom_keys.cfg"
      delete "scripts/"&$bot~mombot_directory&"/custom_commands.cfg"
      return
    end
  end
end

fileexists $bot~legacy_keys_exist "scripts/"&$bot~mombot_directory&"/custom_keys.cfg"
fileexists $bot~legacy_commands_exist "scripts/"&$bot~mombot_directory&"/custom_commands.cfg"
if ($bot~legacy_keys_exist and $bot~legacy_commands_exist)
  readtoarray "scripts/"&$bot~mombot_directory&"/custom_keys.cfg" $bot~custom_keys
  readtoarray "scripts/"&$bot~mombot_directory&"/custom_commands.cfg" $bot~custom_commands
  if (($bot~custom_keys = 33) and ($bot~custom_commands = 33))
    gosub :REBUILD_HOTKEY_INDEX
    gosub :WRITE_HOTKEY_CONFIG
    return
  end
end

gosub :INIT_HOTKEY_DEFAULTS
gosub :WRITE_HOTKEY_CONFIG
return
:bot~apply_hotkey_config



setvar $bot~hotkey_config_valid TRUE
setarray $bot~hotkeys 255
setarray $bot~custom_keys 33
setarray $bot~custom_commands 33
setvar $bot~i 1
while ($bot~i <= 33)
  setvar $bot~hotkey_config_line $bot~hotkey_config_lines[$bot~i]
  trim $bot~hotkey_config_line
  if ($bot~hotkey_config_line = "")
    setvar $bot~hotkey_config_valid FALSE
    return
  end

  splittext $bot~hotkey_config_line $bot~hotkey_config_parts "$"
  if ($bot~hotkey_config_parts >= 3)
    setvar $bot~hotkey_slot_token $bot~hotkey_config_parts[1]
    trim $bot~hotkey_slot_token
    if ($bot~hotkey_slot_token <> $bot~i)
      setvar $bot~hotkey_config_valid FALSE
      return
    end
    setvar $bot~hotkey_key_token $bot~hotkey_config_parts[2]
    setvar $bot~hotkey_command_token $bot~hotkey_config_parts[3]
  elseif ($bot~hotkey_config_parts = 2)
    setvar $bot~hotkey_key_token $bot~hotkey_config_parts[1]
    setvar $bot~hotkey_command_token $bot~hotkey_config_parts[2]
  else
    setvar $bot~hotkey_config_valid FALSE
    return
  end

  trim $bot~hotkey_key_token
  trim $bot~hotkey_command_token
  gosub :DECODE_HOTKEY_TOKEN
  if ($bot~hotkey_key_valid <> TRUE)
    setvar $bot~hotkey_config_valid FALSE
    return
  end

  if ($bot~hotkey_command_token = "")
    setvar $bot~hotkey_command_token 0
  end

  setvar $bot~custom_keys[$bot~i] $bot~hotkey_decoded_key
  setvar $bot~custom_commands[$bot~i] $bot~hotkey_command_token
  add $bot~i 1
end

gosub :REBUILD_HOTKEY_INDEX
return
:bot~rebuild_hotkey_index



setarray $bot~hotkeys 255
setvar $bot~i 1
while ($bot~i <= 33)
  setvar $bot~hotkey_key_token $bot~custom_keys[$bot~i]
  gosub :DECODE_HOTKEY_TOKEN
  if (($bot~hotkey_key_valid = TRUE) and ($bot~hotkey_decoded_key <> 0))
    setvar $bot~hotkey_temp $bot~hotkey_decoded_key
    lowercase $bot~hotkey_temp
    getcharcode $bot~hotkey_temp $bot~hotkey_lower
    setvar $bot~hotkey_temp $bot~hotkey_decoded_key
    uppercase $bot~hotkey_temp
    getcharcode $bot~hotkey_temp $bot~hotkey_upper
    if ($bot~hotkey_lower > 0)
      setvar $bot~hotkeys[$bot~hotkey_lower] $bot~i
    end
    if ($bot~hotkey_upper > 0)
      setvar $bot~hotkeys[$bot~hotkey_upper] $bot~i
    end
  end
  add $bot~i 1
end
return
:bot~decode_hotkey_token



setvar $bot~hotkey_key_valid TRUE
setvar $bot~hotkey_decoded_key $bot~hotkey_key_token
trim $bot~hotkey_decoded_key
uppercase $bot~hotkey_decoded_key
if (($bot~hotkey_decoded_key = "") or ($bot~hotkey_decoded_key = 0))
  setvar $bot~hotkey_decoded_key 0
elseif ($bot~hotkey_decoded_key = "TAB")
  setvar $bot~hotkey_decoded_key #9
elseif ($bot~hotkey_decoded_key = "ENTER")
  setvar $bot~hotkey_decoded_key #13
elseif ($bot~hotkey_decoded_key = "BACKSPACE")
  setvar $bot~hotkey_decoded_key #8
elseif ($bot~hotkey_decoded_key = "SPACE")
  setvar $bot~hotkey_decoded_key " "
else
  cuttext $bot~hotkey_key_token $bot~hotkey_decoded_key 1 1
  if ($bot~hotkey_decoded_key = "")
    setvar $bot~hotkey_key_valid FALSE
  end
end
return
:bot~encode_hotkey_token



setvar $bot~hotkey_encoded_key $bot~hotkey_key_token
if (($bot~hotkey_encoded_key = "") or ($bot~hotkey_encoded_key = 0))
  setvar $bot~hotkey_encoded_key 0
elseif ($bot~hotkey_encoded_key = #9)
  setvar $bot~hotkey_encoded_key "TAB"
elseif ($bot~hotkey_encoded_key = #13)
  setvar $bot~hotkey_encoded_key "ENTER"
elseif ($bot~hotkey_encoded_key = #8)
  setvar $bot~hotkey_encoded_key "BACKSPACE"
elseif ($bot~hotkey_encoded_key = " ")
  setvar $bot~hotkey_encoded_key "SPACE"
else
  cuttext $bot~hotkey_encoded_key $bot~hotkey_encoded_key 1 1
end
return
:bot~write_hotkey_config



delete $bot~mombot_config_file
setvar $bot~i 1
while ($bot~i <= 33)
  setvar $bot~hotkey_key_token $bot~custom_keys[$bot~i]
  gosub :ENCODE_HOTKEY_TOKEN
  setvar $bot~hotkey_command_token $bot~custom_commands[$bot~i]
  if (($bot~hotkey_command_token = "") or ($bot~hotkey_command_token = 0))
    setvar $bot~hotkey_command_token 0
  end
  write $bot~mombot_config_file $bot~i&"$"&$bot~hotkey_encoded_key&"$"&$bot~hotkey_command_token
  add $bot~i 1
end

delete "scripts/"&$bot~mombot_directory&"/hotkeys.cfg"
delete "scripts/"&$bot~mombot_directory&"/custom_keys.cfg"
delete "scripts/"&$bot~mombot_directory&"/custom_commands.cfg"
return
:bot~exit_menu_deaf



if ($bot~menu_deaf_depth > 0)
  subtract $bot~menu_deaf_depth 1
end

if ($bot~menu_deaf_depth <= 0)
  if ($bot~menu_deaf_restore = TRUE)
    setdeafclients TRUE
    setvar $bot~botisdeaf TRUE
  else
    setdeafclients FALSE
    setvar $bot~botisdeaf FALSE
  end
  savevar $bot~botisdeaf
end

return
:bot~menu





gosub :ENTER_MENU_DEAF
addmenu "" "ScriptMenu" ANSI_6&"["&ANSI_14&"Settings"&ANSI_6&"]"&ANSI_7 "." "" "Main" FALSE
setvar $bot~i 1
while ($bot~i <= $bot~menu)
  if (($bot~menu[$bot~i] <> 0) and ($bot~menu[$bot~i] <> ""))
    setvar $bot~display_menu $bot~menu[$bot~i]
    replacetext $bot~menu[$bot~i] " " "_"
    addmenu "ScriptMenu" $bot~menu[$bot~i] ANSI_6&"["&ANSI_15&$bot~display_menu&ANSI_6&"]                                 "&ANSI_7 "A" ":MENU_SET" "" FALSE
    setmenuhelp $bot~menu[$bot~i] $bot~menu[$bot~i][1]
  end
  add $bot~i 1
end
openmenu "ScriptMenu"
gosub :EXIT_MENU_DEAF
return
:bot~menu_set



pause
gosub :ENTER_MENU_DEAF
openmenu "Menu"
gosub :EXIT_MENU_DEAF

return
:bot~multifield



splittext $bot~fields[$bot~field_index] $bot~options "|"
if ($bot~options > 1)
  setvar $bot~k 1
  while ($bot~k <= $bot~options)
    if ($bot~options[$bot~k] = $bot~fields[$bot~field_index][2])
      if ($bot~k < $bot~options)
        setvar $bot~optionindex ($bot~k + 1)
      else
        setvar $bot~optionindex 1
      end
      setvar $bot~currentvalue $bot~options[$bot~optionindex]
      splittext $bot~fields[$bot~field_index][3] $bot~descriptions "|"
      setvar $bot~extra ANSI_15&"["&ANSI_14&$bot~descriptions[$bot~optionindex]&ANSI_15&"]"&ANSI_14
      setvar $bot~displayvalue ANSI_14&$bot~currentvalue
      padright $bot~displayvalue $bot~field_padding
      setvar $bot~displayvalue $bot~displayvalue&$bot~extra
    end
    add $bot~k 1
  end

  setvar $bot~fields[$bot~field_index][2] $bot~currentvalue
  setmenuvalue $bot~fields[$bot~field_index] $bot~displayvalue
end

goto :MENU_CREATION
:bot~multifield1



setvar $bot~field_index 1
goto :MULTIFIELD
:bot~multifield10



setvar $bot~field_index 10
goto :MULTIFIELD
:bot~multifield11



setvar $bot~field_index 11
goto :MULTIFIELD
:bot~multifield12



setvar $bot~field_index 12
goto :MULTIFIELD
:bot~multifield13



setvar $bot~field_index 13
goto :MULTIFIELD
:bot~multifield14



setvar $bot~field_index 14
goto :MULTIFIELD
:bot~multifield15



setvar $bot~field_index 15
goto :MULTIFIELD
:bot~multifield16



setvar $bot~field_index 16
goto :MULTIFIELD
:bot~multifield17



setvar $bot~field_index 17
goto :MULTIFIELD
:bot~multifield18



setvar $bot~field_index 18
goto :MULTIFIELD
:bot~multifield19



setvar $bot~field_index 19
goto :MULTIFIELD
:bot~multifield2



setvar $bot~field_index 2
goto :MULTIFIELD
:bot~multifield20



setvar $bot~field_index 20
goto :MULTIFIELD
:bot~multifield21



setvar $bot~field_index 21
goto :MULTIFIELD
:bot~multifield22



setvar $bot~field_index 22
goto :MULTIFIELD
:bot~multifield23



setvar $bot~field_index 23
goto :MULTIFIELD
:bot~multifield24



setvar $bot~field_index 24
goto :MULTIFIELD
:bot~multifield25



setvar $bot~field_index 25
goto :MULTIFIELD
:bot~multifield26



setvar $bot~field_index 26
goto :MULTIFIELD
:bot~multifield27



setvar $bot~field_index 27
goto :MULTIFIELD
:bot~multifield28



setvar $bot~field_index 28
goto :MULTIFIELD
:bot~multifield29



setvar $bot~field_index 29
goto :MULTIFIELD
:bot~multifield3



setvar $bot~field_index 3
goto :MULTIFIELD
:bot~multifield30



setvar $bot~field_index 30
:bot~multifield4



setvar $bot~field_index 4
goto :MULTIFIELD
:bot~multifield5



setvar $bot~field_index 5
goto :MULTIFIELD
:bot~multifield6



setvar $bot~field_index 6
goto :MULTIFIELD
:bot~multifield7



setvar $bot~field_index 7
goto :MULTIFIELD
:bot~multifield8



setvar $bot~field_index 8
goto :MULTIFIELD
:bot~multifield9



setvar $bot~field_index 9
goto :MULTIFIELD
:bot~numberfield




getinput $bot~displayvalue "Please enter a value for "&$bot~fields[$bot~field_index]&"."
isnumber $bot~isnumber $bot~displayvalue
if ($bot~isnumber <> TRUE)
  echo "*Please enter a number value.*"
  goto :NUMBERFIELD
end
setvar $bot~fields[$bot~field_index][2] $bot~displayvalue

if ($bot~displayvalue = 0)
  setvar $bot~displayvalue ANSI_15&$bot~displayvalue
else
  setvar $bot~displayvalue ANSI_14&$bot~displayvalue
end
setvar $bot~extra $bot~fields[$bot~field_index][3]
padright $bot~displayvalue $bot~field_padding
setvar $bot~displayvalue $bot~displayvalue&$bot~extra

setmenuvalue $bot~fields[$bot~field_index] $bot~displayvalue

goto :MENU_CREATION
:bot~numberfield1



setvar $bot~field_index 1
goto :NUMBERFIELD
:bot~numberfield10



setvar $bot~field_index 10
goto :NUMBERFIELD
:bot~numberfield11



setvar $bot~field_index 11
goto :NUMBERFIELD
:bot~numberfield12



setvar $bot~field_index 12
goto :NUMBERFIELD
:bot~numberfield13



setvar $bot~field_index 13
goto :NUMBERFIELD
:bot~numberfield14



setvar $bot~field_index 14
goto :NUMBERFIELD
:bot~numberfield15



setvar $bot~field_index 15
goto :NUMBERFIELD
:bot~numberfield16



setvar $bot~field_index 16
goto :NUMBERFIELD
:bot~numberfield17



setvar $bot~field_index 17
goto :NUMBERFIELD
:bot~numberfield18



setvar $bot~field_index 18
goto :NUMBERFIELD
:bot~numberfield19



setvar $bot~field_index 19
goto :NUMBERFIELD
:bot~numberfield2



setvar $bot~field_index 2
goto :NUMBERFIELD
:bot~numberfield20



setvar $bot~field_index 20
goto :NUMBERFIELD
:bot~numberfield21



setvar $bot~field_index 21
goto :NUMBERFIELD
:bot~numberfield22



setvar $bot~field_index 22
goto :NUMBERFIELD
:bot~numberfield23



setvar $bot~field_index 23
goto :NUMBERFIELD
:bot~numberfield24



setvar $bot~field_index 24
goto :NUMBERFIELD
:bot~numberfield25



setvar $bot~field_index 25
goto :NUMBERFIELD
:bot~numberfield26



setvar $bot~field_index 26
goto :NUMBERFIELD
:bot~numberfield27



setvar $bot~field_index 27
goto :NUMBERFIELD
:bot~numberfield28



setvar $bot~field_index 28
goto :NUMBERFIELD
:bot~numberfield29



setvar $bot~field_index 29
goto :NUMBERFIELD
:bot~numberfield3



setvar $bot~field_index 3
goto :NUMBERFIELD
:bot~numberfield30



setvar $bot~field_index 30
:bot~numberfield4



setvar $bot~field_index 4
goto :NUMBERFIELD
:bot~numberfield5



setvar $bot~field_index 5
goto :NUMBERFIELD
:bot~numberfield6



setvar $bot~field_index 6
goto :NUMBERFIELD
:bot~numberfield7



setvar $bot~field_index 7
goto :NUMBERFIELD
:bot~numberfield8



setvar $bot~field_index 8
goto :NUMBERFIELD
:bot~numberfield9



setvar $bot~field_index 9
goto :NUMBERFIELD
:bot~pausing



killalltriggers
echo ANSI_14 "*[["&ANSI_15&$bot~script_title&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:bot~removefigfromdata




getsectorparameter $bot~target "FIGSEC" $bot~check
if ($bot~check = TRUE)
  getsectorparameter 2 "FIG_COUNT" $bot~figcount
  setsectorparameter 2 "FIG_COUNT" ($bot~figcount - 1)
end
setsectorparameter $bot~target "FIGSEC" FALSE
return
:bot~restarting


killalltriggers
echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
goto :RESTART
:bot~self_menu


setvar $bot~i 1
if (($switchboard~self_command <> FALSE) and (($bot~parm1 = "!") or ($bot~parm1 = "menu")))
  setarray $bot~fields 100 5
  setvar $bot~fields 0
  setvar $bot~field_count 0
  setvar $bot~isdone FALSE
  setvar $bot~topoffile TRUE
  while (($bot~i <= $bot~help) and ($bot~isdone <> TRUE))
    if ($bot~help[$bot~i] <> 0)
      striptext $bot~help[$bot~i] #13
      striptext $bot~help[$bot~i] "`"
      striptext $bot~help[$bot~i] "'"



      setvar $bot~check_for_blank_line $bot~help[$bot~i]
      trim $bot~check_for_blank_line
      if ($bot~check_for_blank_line = "")
        setvar $bot~topoffile FALSE
      else
        if ($bot~topoffile = TRUE)

          if ($bot~i = 1)
            getwordpos $bot~help[$bot~i] $bot~pos "{"
            cuttext $bot~help[$bot~i] $bot~menu_title 1 $bot~pos
            cuttext $bot~help[$bot~i] $bot~rest_of_string $bot~pos 9999
          else
            setvar $bot~rest_of_string $bot~help[$bot~i]
          end
          gettext $bot~rest_of_string $bot~option "{" "}"
          while ($bot~option <> "")



            getwordpos $bot~rest_of_string $bot~pos "}"
            cuttext $bot~rest_of_string&"     " $bot~rest_of_string ($bot~pos + 1) 9999

            replacetext $bot~option "{" ""
            replacetext $bot~option "}" ""
            getwordpos $bot~option $bot~pos "|"

            add $bot~field_count 1

            if ($bot~pos > 0)
              setvar $bot~field_type "multi"
              setvar $bot~field_name $bot~option
              splittext $bot~field_name $bot~options "|"

              setvar $bot~fields[$bot~field_count][2] $bot~options[1]
            else
              getwordpos $bot~option $bot~pos ":"
              getwordpos $bot~option $bot~pos2 #34
              if (($bot~pos > 0) or ($bot~pos2 > 0))
                getwordpos $bot~option $bot~pos ":#"
                if ($bot~pos > 0)
                  setvar $bot~field_type "number"
                  setvar $bot~fields[$bot~field_count][2] 0
                else
                  getwordpos $bot~option $bot~pos #34
                  if ($bot~pos > 0)

                    setvar $bot~fields[$bot~field_count][5] TRUE
                  end
                  setvar $bot~field_type "string"
                  setvar $bot~fields[$bot~field_count][2] ""
                end
                splittext $bot~option $bot~inputs ":"
                setvar $bot~field_name $bot~option
              else
                setvar $bot~field_type "boolean"
                setvar $bot~field_name $bot~option
                setvar $bot~fields[$bot~field_count][2] FALSE
              end
            end
            setvar $bot~fields[$bot~field_count] $bot~field_name
            setvar $bot~fields[$bot~field_count][1] $bot~field_type

            add $bot~fields 1



            gettext $bot~rest_of_string $bot~option "{" "}"
          end
        else
          getwordpos $bot~help[$bot~i] $bot~pos "{"
          if ($bot~pos > 0)








            getword $bot~help[$bot~i] $bot~option 1
            replacetext $bot~option "{" ""
            replacetext $bot~option "}" ""
            trim $bot~option
            getwordpos $bot~help[$bot~i] $bot~pos "}"
            cuttext $bot~help[$bot~i] $bot~help[$bot~i] $bot~pos 9999
            replacetext $bot~help[$bot~i] "{" ""
            replacetext $bot~help[$bot~i] "}" ""
            replacetext $bot~help[$bot~i] "-" ""
            trim $bot~help[$bot~i]

            setvar $bot~j 1
            while ($bot~j <= $bot~fields)
              setvar $bot~foundoption FALSE
              getwordpos $bot~fields[$bot~j] $bot~pos "|"
              if ($bot~pos > 0)
                splittext $bot~fields[$bot~j] $bot~options "|"
                setvar $bot~k 1
                while ($bot~k <= $bot~options)
                  trim $bot~options[$bot~k]
                  if ($bot~options[$bot~k] = $bot~option)
                    if ($bot~fields[$bot~j][3] = 0)
                      setvar $bot~fields[$bot~j][3] ""
                    end
                    setvar $bot~fields[$bot~j][3] $bot~fields[$bot~j][3]&$bot~help[$bot~i]&"|"
                  end
                  add $bot~k 1
                end
              else

                if ($bot~option = $bot~fields[$bot~j])
                  setvar $bot~fields[$bot~j][3] $bot~help[$bot~i]
                end
              end
              add $bot~j 1
            end
          else
          end
        end
      end


    else
      setvar $bot~isdone TRUE
    end
    add $bot~i 1
  end

  setvar $bot~command_display $bot~command
  uppercase $bot~command_display
  addmenu "" "MENUSYSTEM" ANSI_15&":::  "&ANSI_14&"["&ANSI_15&"help - "&ANSI_6&"+"&ANSI_14&"]"&ANSI_15&" -=[ "&ANSI_6&$bot~command_display&ANSI_15&" ]=- "&ANSI_14&"["&ANSI_15&"refresh - "&ANSI_6&"?"&ANSI_14&"]"&ANSI_15&"  ::" "." "" "Main" FALSE
  setmenuoptions "MENUSYSTEM" FALSE FALSE FALSE

  setarray $bot~menu_system_keys 33
  setvar $bot~menu_system_keys 33
  setvar $bot~menu_system_keys[1] 1
  setvar $bot~menu_system_keys[2] 2
  setvar $bot~menu_system_keys[3] 3
  setvar $bot~menu_system_keys[4] 4
  setvar $bot~menu_system_keys[5] 5
  setvar $bot~menu_system_keys[6] 6
  setvar $bot~menu_system_keys[7] 7
  setvar $bot~menu_system_keys[8] 8
  setvar $bot~menu_system_keys[9] 9
  setvar $bot~menu_system_keys[10] "a"
  setvar $bot~menu_system_keys[11] "b"
  setvar $bot~menu_system_keys[12] "c"
  setvar $bot~menu_system_keys[13] "d"
  setvar $bot~menu_system_keys[14] "e"
  setvar $bot~menu_system_keys[15] "f"
  setvar $bot~menu_system_keys[16] "g"
  setvar $bot~menu_system_keys[17] "h"
  setvar $bot~menu_system_keys[18] "i"
  setvar $bot~menu_system_keys[19] "j"
  setvar $bot~menu_system_keys[20] "k"
  setvar $bot~menu_system_keys[21] "l"
  setvar $bot~menu_system_keys[22] "m"
  setvar $bot~menu_system_keys[23] "n"
  setvar $bot~menu_system_keys[24] "o"
  setvar $bot~menu_system_keys[25] "p"
  setvar $bot~menu_system_keys[26] "r"
  setvar $bot~menu_system_keys[27] "s"
  setvar $bot~menu_system_keys[28] "t"
  setvar $bot~menu_system_keys[29] "u"
  setvar $bot~menu_system_keys[30] "v"
  setvar $bot~menu_system_keys[31] "w"
  setvar $bot~menu_system_keys[32] "x"
  setvar $bot~menu_system_keys[33] "y"

  setvar $bot~longest 0
  setvar $bot~i 1
  while ($bot~i <= $bot~fields)
    if ($bot~fields[$bot~i][1] = "multi")
      getlength "::select::" $bot~length
    else
      getlength $bot~fields[$bot~i] $bot~length
    end
    if ($bot~length > $bot~longest)
      setvar $bot~longest $bot~length
    end
    add $bot~i 1
  end
  setvar $bot~bot_to_control $bot~bot_name
  setvar $bot~menu_field_display "Start!"
  padright $bot~menu_field_display $bot~longest
  addmenu "MENUSYSTEM" "START" ANSI_15&$bot~menu_field_display "Z" ":ENDMENUANDGO" "" FALSE
  setvar $bot~menu_field_display "Bot"
  padright $bot~menu_field_display $bot~longest
  setvar $bot~menu_field_display $bot~menu_field_display&" "&ANSI_14&":"&ANSI_15&" "
  addmenu "MENUSYSTEM" "CONTROL" ANSI_15&$bot~menu_field_display 0 ":CHANGEBOTNAME" $bot~bot_to_control FALSE
  setvar $bot~bot_to_control_display ANSI_14&$bot~bot_to_control
  padright $bot~bot_to_control_display $bot~longest
  setmenuvalue "CONTROL" $bot~bot_to_control_display

  setvar $bot~i 1
  setvar $bot~field_padding 18
  while ($bot~i <= $bot~fields)
    setvar $bot~extra $bot~fields[$bot~i][3]
    if ($bot~fields[$bot~i][1] = "boolean")
      if ($bot~fields[$bot~i][2] = TRUE)
        setvar $bot~displayvalue ANSI_14&"On"
      else
        setvar $bot~displayvalue ANSI_15&"Off"
      end
      padright $bot~displayvalue $bot~field_padding
      setvar $bot~displayvalue $bot~displayvalue&$bot~extra
    end
    if ($bot~fields[$bot~i][1] = "multi")
      splittext $bot~fields[$bot~i] $bot~options "|"
      setvar $bot~k 1
      while ($bot~k <= $bot~options)
        if ($bot~options[$bot~k] = $bot~fields[$bot~i][2])
          if ($bot~k < $bot~options)
            setvar $bot~optionindex $bot~k
          else
            setvar $bot~optionindex 1
          end
          setvar $bot~currentvalue $bot~options[$bot~optionindex]
          splittext $bot~fields[$bot~i][3] $bot~descriptions "|"
        end
        add $bot~k 1
      end
      setvar $bot~extra ANSI_15&"["&ANSI_14&$bot~descriptions[$bot~optionindex]&ANSI_15&"]"&ANSI_14
      setvar $bot~displayvalue ANSI_14&$bot~fields[$bot~i][2]
      padright $bot~displayvalue $bot~field_padding
      setvar $bot~displayvalue $bot~displayvalue&$bot~extra
    end
    if ($bot~fields[$bot~i][1] = "string")
      setvar $bot~displayvalue $bot~fields[$bot~i][2]
      if ($bot~displayvalue = "")
        setvar $bot~displayvalue ANSI_15&"Off"
      end
      padright $bot~displayvalue $bot~field_padding
      setvar $bot~displayvalue $bot~displayvalue&$bot~extra
    end
    if ($bot~fields[$bot~i][1] = "number")
      setvar $bot~displayvalue ANSI_15&$bot~fields[$bot~i][2]
      padright $bot~displayvalue $bot~field_padding
      setvar $bot~displayvalue $bot~displayvalue&$bot~extra
    end

    if ($bot~fields[$bot~i][1] = "multi")
      setvar $bot~menu_field_display "::select::"
    else
      setvar $bot~menu_field_display $bot~fields[$bot~i]
    end
    padleft $bot~menu_field_display $bot~longest
    addmenu "MENUSYSTEM" $bot~fields[$bot~i] ANSI_11&$bot~menu_field_display&ANSI_14&" : " $bot~menu_system_keys[$bot~i] ":"&$bot~fields[$bot~i][1]&"Field"&$bot~i $bot~fields[$bot~i][3] FALSE
    setmenuvalue $bot~fields[$bot~i] $bot~displayvalue
    setmenuhelp $bot~fields[$bot~i] $bot~fields[$bot~i][3]
    :bot~menu_creation
    add $bot~i 1
  end
  gosub :ENTER_MENU_DEAF
  openmenu "MENUSYSTEM" TRUE
  :bot~endmenuandgo
  closemenu
  gosub :EXIT_MENU_DEAF
  setvar $bot~i 1
  setvar $bot~parm_count 0
  setvar $bot~user_command_line ""
  while ($bot~i <= $bot~fields)
    trim $bot~fields[$bot~i][2]
    if ($bot~fields[$bot~i][2] = 0) or (($bot~fields[$bot~i][1] = "string") and ($bot~fields[$bot~i][2] = ""))

    else
      if ($bot~fields[$bot~i][1] = "boolean")
        if ($bot~fields[$bot~i][2] = TRUE)
          setvar $bot~user_command_line $bot~user_command_line&" "&$bot~fields[$bot~i]
          setvar $bot~parm_value $bot~fields[$bot~i]
        end
      end
      if (($bot~fields[$bot~i][1] = "string") or ($bot~fields[$bot~i][1] = "number"))
        if ($bot~fields[$bot~i][5] = TRUE)

          setvar $bot~string_field #34&$bot~fields[$bot~i][2]&#34
        else
          splittext $bot~fields[$bot~i] $bot~inputs ":"
          setvar $bot~string_field $bot~inputs[1]&":"&$bot~fields[$bot~i][2]
        end
        setvar $bot~user_command_line $bot~user_command_line&" "&$bot~string_field
        setvar $bot~parm_value $bot~string_field
      end
      if ($bot~fields[$bot~i][1] = "multi")
        setvar $bot~user_command_line $bot~user_command_line&" "&$bot~fields[$bot~i][2]
        setvar $bot~parm_value $bot~fields[$bot~i][2]
      end
      if ($bot~parm_count <= 8)
        add $bot~parm_count 1
        if ($bot~parm_count = 1)
          setvar $bot~parm1 $bot~parm_value
        end
        if ($bot~parm_count = 2)
          setvar $bot~parm2 $bot~parm_value
        end
        if ($bot~parm_count = 3)
          setvar $bot~parm3 $bot~parm_value
        end
        if ($bot~parm_count = 4)
          setvar $bot~parm4 $bot~parm_value
        end
        if ($bot~parm_count = 5)
          setvar $bot~parm5 $bot~parm_value
        end
        if ($bot~parm_count = 6)
          setvar $bot~parm6 $bot~parm_value
        end
        if ($bot~parm_count = 7)
          setvar $bot~parm7 $bot~parm_value
        end
        if ($bot~parm_count = 8)
          setvar $bot~parm8 $bot~parm_value
        end
      end
    end
    add $bot~i 1
  end
  savevar $bot~user_command_line
  savevar $bot~parm1
  savevar $bot~parm2
  savevar $bot~parm3
  savevar $bot~parm4
  savevar $bot~parm5
  savevar $bot~parm6
  savevar $bot~parm7
  savevar $bot~parm8
  trim $bot~command
  trim $bot~user_command_line
  if ($bot~bot_name <> $bot~bot_to_control)
    setvar $bot~control_string "'"&$bot~bot_to_control&" "&$bot~command&" "&$bot~user_command_line
    send $bot~control_string&"*"
    loadvar $bot~historystring
    setvar $bot~history[1] $bot~control_string
    setvar $bot~historystring $bot~history[1]&"<<|HS|>>"&$bot~historystring
    savevar $bot~historystring
    halt
  else
    loadvar $bot~historystring
    setvar $bot~history[1] $bot~command&" "&$bot~user_command_line
    setvar $bot~historystring $bot~history[1]&"<<|HS|>>"&$bot~historystring
    savevar $bot~historystring
  end
end


return
:bot~stringfield




getinput $bot~displayvalue "Please enter a value for "&$bot~fields[$bot~field_index]&"."
setvar $bot~fields[$bot~field_index][2] $bot~displayvalue

if ($bot~displayvalue = "")
  setvar $bot~displayvalue ANSI_15&"Off"
else
  setvar $bot~displayvalue ANSI_14&$bot~displayvalue
end
setvar $bot~extra $bot~fields[$bot~field_index][3]
padright $bot~displayvalue $bot~field_padding
setvar $bot~displayvalue $bot~displayvalue&$bot~extra

setmenuvalue $bot~fields[$bot~field_index] $bot~displayvalue
goto :MENU_CREATION
:bot~stringfield1



setvar $bot~field_index 1
goto :STRINGFIELD
:bot~stringfield10



setvar $bot~field_index 10
goto :STRINGFIELD
:bot~stringfield11



setvar $bot~field_index 11
goto :STRINGFIELD
:bot~stringfield12



setvar $bot~field_index 12
goto :STRINGFIELD
:bot~stringfield13



setvar $bot~field_index 13
goto :STRINGFIELD
:bot~stringfield14



setvar $bot~field_index 14
goto :STRINGFIELD
:bot~stringfield15



setvar $bot~field_index 15
goto :STRINGFIELD
:bot~stringfield16



setvar $bot~field_index 16
goto :STRINGFIELD
:bot~stringfield17



setvar $bot~field_index 17
goto :STRINGFIELD
:bot~stringfield18



setvar $bot~field_index 18
goto :STRINGFIELD
:bot~stringfield19



setvar $bot~field_index 19
goto :STRINGFIELD
:bot~stringfield2



setvar $bot~field_index 2
goto :STRINGFIELD
:bot~stringfield20



setvar $bot~field_index 20
goto :STRINGFIELD
:bot~stringfield21



setvar $bot~field_index 21
goto :STRINGFIELD
:bot~stringfield22



setvar $bot~field_index 22
goto :STRINGFIELD
:bot~stringfield23



setvar $bot~field_index 23
goto :STRINGFIELD
:bot~stringfield24



setvar $bot~field_index 24
goto :STRINGFIELD
:bot~stringfield25



setvar $bot~field_index 25
goto :STRINGFIELD
:bot~stringfield26



setvar $bot~field_index 26
goto :STRINGFIELD
:bot~stringfield27



setvar $bot~field_index 27
goto :STRINGFIELD
:bot~stringfield28



setvar $bot~field_index 28
goto :STRINGFIELD
:bot~stringfield29



setvar $bot~field_index 29
goto :STRINGFIELD
:bot~stringfield3



setvar $bot~field_index 3
goto :STRINGFIELD
:bot~stringfield30



setvar $bot~field_index 30
:bot~stringfield4



setvar $bot~field_index 4
goto :STRINGFIELD
:bot~stringfield5



setvar $bot~field_index 5
goto :STRINGFIELD
:bot~stringfield6



setvar $bot~field_index 6
goto :STRINGFIELD
:bot~stringfield7



setvar $bot~field_index 7
goto :STRINGFIELD
:bot~stringfield8



setvar $bot~field_index 8
goto :STRINGFIELD
:bot~stringfield9



setvar $bot~field_index 9
goto :STRINGFIELD
:bot~write_new_help_file


delete $bot~help_file
setvar $bot~i 1
getlength $bot~command $bot~length
setvar $bot~spaces "                                            "
setvar $bot~stars "---------------------------------------------"
setvar $bot~pos $bot~length
cuttext $bot~stars $bot~border 1 $bot~pos
setvar $bot~pos ((50 - ($bot~length + 10)) / 2)
cuttext $bot~spaces $bot~center 1 $bot~pos
write $bot~help_file "                     "
write $bot~help_file "   "
write $bot~help_file $bot~center&"<<<< "&$bot~command&" >>>>"
write $bot~help_file "   "
while ($bot~i <= $bot~help)
  striptext $bot~help[$bot~i] #13
  striptext $bot~help[$bot~i] "`"
  striptext $bot~help[$bot~i] "'"
  replacetext $bot~help[$bot~i] "=" "-"
  if ($bot~help[$bot~i] = 0)
    goto :DONE_HELP_FILE
  end
  write $bot~help_file $bot~help[$bot~i]
  add $bot~i 1
end
