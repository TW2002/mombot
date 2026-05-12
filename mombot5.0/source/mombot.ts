systemscript
reqRecording
# TWX Script            : Mind Over Matter Bot
# Authors           : Mind Dagger / The Bounty Hunter / Lonestar / Hammer
# Contributions/QA              : Misbehavin / DaCreeper / The Butcher
# Description           : Allows Corpies to use you while AFK and a Self Helper
# Credits           : Oz, Zentock, SupG, Dynarri, Cherokee, Alexio, Xide, Phx, Rincrast, Voltron, Traitor, Parrothead, PSI, Elder Prophet, Caretaker, Deign

setVar $bot~major_version   "5"
setVar $bot~minor_version   "0beta"
setvar $bot~default_bot_directory "mombot"
savevar $bot~major_version
savevar $bot~minor_version

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:LOAD_BOT
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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

gosub :BOT~DOSPLASHSCREEN
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
setvar $PLANET~PLANET_PRODS_FILE $BOT~FOLDER&"/planetprods.cfg"
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
savevar $PLANET~PLANET_PRODS_FILE
savevar $BOT~SCRIPT_FILE
savevar $BOT~BUST_FILE
savevar $BOT~MCIC_FILE
savevar $BOT~TIMER_FILE

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:AFTER_GAME_FOLDER_MIGRATION_HELPERS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
goto :BOT~GETINITIAL_SETTINGS

:module_vars
	saveVar $bot~command
	saveVar $bot~command_typed
	saveVar $bot~user_command_line
	setVar $switchboard~bot_name $bot~bot_name
	saveVar $switchboard~bot_name
	savevar $bot~name
	saveVar $bot~parm1
	saveVar $bot~parm2
	saveVar $bot~parm3
	saveVar $bot~parm4
	saveVar $bot~parm5
	saveVar $bot~parm6
	saveVar $bot~parm7
	saveVar $bot~parm8
	saveVar $bot~bot_turn_limit
	saveVar $player~unlimitedGame
	savevar $bot~letter
	gosub :backwards_compatible
return

:backwards_compatible
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

#INCLUDES:
include "source\include\game"
include "source\include\combat"
include "source\include\bot"
