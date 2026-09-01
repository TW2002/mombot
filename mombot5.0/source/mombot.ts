systemscript
reqrecording
# TWX Script            : Mind Over Matter Bot
# Authors           : Mind Dagger / The Bounty Hunter / Lonestar / Hammer
# Contributions/QA              : Misbehavin / DaCreeper / The Butcher
# Description           : Allows Corpies to use you while AFK and a Self Helper
# Credits           : Oz, Zentock, SupG, Dynarri, Cherokee, Alexio, Xide, Phx, Rincrast, Voltron, Traitor, Parrothead, PSI, Elder Prophet, Caretaker, Deign

setvar $bot~major_version   "5"
setvar $bot~minor_version   "1beta"
setvar $bot~default_bot_directory "mombot"
savevar $bot~major_version
savevar $bot~minor_version

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:load_bot
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $bot~do_not_resuscitate false
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

setvar $bot~legacy_folder "scripts/"&$bot~mombot_directory&"/games/"&gamename
makedir "games"
setvar $bot~folder "games/"&gamename
makedir $bot~folder
gosub :bot~migrate_game_folder
setvar $bot~mombot_config_file "scripts/"&$bot~mombot_directory&"/mombot.cfg"
setvar $bot~hotkeys_file $bot~mombot_config_file
setvar $bot~custom_keys_file $bot~mombot_config_file
setvar $bot~custom_commands_file $bot~mombot_config_file
savevar $bot~mombot_config_file

gosub :bot~dosplashscreen
gosub :bot~load_hotkey_config
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
setvar $bot~gamestats false
setvar $bot~script_name "Mind ()ver Matter Bot "
setvar $bot~mode "General"
setvar $switchboard~self_command false
setvar $bot~okaytouse true
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
setvar $bot~ck_fig_file $bot~folder&"/_ck_"&gamename&".figs"
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
setvar $planet~planet_prods_file $bot~folder&"/planetprods.cfg"
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
savevar $planet~planet_prods_file
savevar $bot~script_file
savevar $bot~bust_file
savevar $bot~mcic_file
savevar $bot~timer_file

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:after_game_folder_migration_helpers
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
goto :bot~getinitial_settings

:module_vars
savevar $bot~command
savevar $bot~command_typed
savevar $bot~user_command_line
setvar $switchboard~bot_name $bot~bot_name
savevar $switchboard~bot_name
savevar $bot~name
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
savevar $bot~parm7
savevar $bot~parm8
savevar $bot~bot_turn_limit
savevar $player~unlimitedgame
savevar $bot~letter
gosub :backwards_compatible
return

:backwards_compatible
setvar  $safe_ship $bot~safe_ship
savevar $safe_ship
setvar  $safe_planet $bot~safe_planet
savevar $safe_planet
setvar $command $bot~command
savevar $command
setvar $command_typed $bot~command_typed
savevar $command_typed
setvar $user_command_line $bot~user_command_line
savevar $user_command_line
setvar $bot_name $bot~bot_name
savevar $bot_name
setvar $self_command $bot~self_command
savevar $self_command
setvar $command_caller $bot~command_caller
savevar $command_caller
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
savevar $parm1
savevar $parm2
savevar $parm3
savevar $parm4
savevar $parm5
savevar $parm6
savevar $parm7
savevar $parm8
setvar $rylos $map~rylos
savevar $rylos
setvar $alpha_centauri $map~alpha_centauri
savevar $alpha_centauri
setvar $stardock $map~stardock
savevar $stardock
setvar $backdoor $map~backdoor
savevar $backdoor
setvar $home_sector $map~home_sector
savevar $home_sector
setvar $alarm_list $bot~alarm_list
savevar $alarm_list
setvar $unlimitedgame $player~unlimitedgame
savevar $unlimitedgame
setvar $bot_turn_limit $bot~bot_turn_limit
savevar $bot_turn_limit
setvar $steal_factor $game~steal_factor
setvar $rob_factor $game~rob_factor
setvar $actual_steal_factor $game~actual_steal_factor
setvar $actual_rob_factor $game~actual_rob_factor
savevar $actual_steal_factor
savevar $actual_rob_factor
savevar $steal_factor
savevar $rob_factor
setvar $password $bot~password
savevar $password
setvar $mode $bot~mode
savevar $mode
setvar $subspace $bot~subspace
savevar $subspace
setvar $letter $bot~letter
savevar $letter
setvar $game_menu_prompt_ansi $game~game_menu_prompt_ansi
setvar $game_menu_prompt $game~game_menu_prompt
setvar $offensecapping $player~offensecapping
setvar $cappingaliens $player~cappingaliens
setvar $atomic_cost $game~atomic_cost
setvar $beacon_cost $game~beacon_cost
setvar $corbo_cost $game~corbo_cost
setvar $cloak_cost $game~cloak_cost
setvar $probe_cost $game~probe_cost
setvar $planet_scanner_cost $game~planet_scanner_cost
setvar $limpet_cost $game~limpet_cost
setvar $armid_cost $game~armid_cost
setvar $photon_cost $game~photon_cost
setvar $holo_cost $game~holo_cost
setvar $density_cost $game~density_cost
setvar $disruptor_cost $game~disruptor_cost
setvar $genesis_cost $game~genesis_cost
setvar $twarpi_cost $game~twarpi_cost
setvar $twarpii_cost $game~twarpii_cost
setvar $psychic_cost $game~psychic_cost
setvar $photons_enabled $game~photons_enabled
setvar $photon_duration $game~photon_duration
setvar $max_commands $game~max_commands
setvar $goldenabled $game~goldenabled
setvar $mbbs $game~mbbs
setvar $multiple_photons $game~multiple_photons
setvar $colonist_regen $game~colonist_regen
setvar $ptradesetting $game~ptradesetting
setvar $clear_bust_days $game~clear_bust_days
setvar $port_max $game~port_max
setvar $production_rate $game~production_rate
setvar $production_regen $game~production_regen
setvar $debris_loss $game~debris_loss
setvar $radiation_lifetime $game~radiation_lifetime
setvar $limpet_removal_cost $game~limpet_removal_cost
setvar $max_planets_per_sector $game~max_planets_per_sector
savevar $game_menu_prompt_ansi
savevar $game_menu_prompt
savevar $offensecapping
savevar $cappingaliens
savevar $atomic_cost
savevar $beacon_cost
savevar $corbo_cost
savevar $cloak_cost
savevar $probe_cost
savevar $planet_scanner_cost
savevar $limpet_cost
savevar $armid_cost
savevar $photon_cost
savevar $holo_cost
savevar $density_cost
savevar $disruptor_cost
savevar $genesis_cost
savevar $twarpi_cost
savevar $twarpii_cost
savevar $psychic_cost
savevar $photons_enabled
savevar $photon_duration
savevar $max_commands
savevar $goldenabled
savevar $mbbs
savevar $multiple_photons
savevar $colonist_regen
savevar $ptradesetting
savevar $clear_bust_days
savevar $port_max
savevar $production_rate
savevar $production_regen
savevar $debris_loss
savevar $radiation_lifetime
savevar $limpet_removal_cost
savevar $max_planets_per_sector
return

#INCLUDES:
include "source\include\game"
include "source\include\combat"
include "source\include\bot"
