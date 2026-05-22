gosub :loadvars~loadvars

setarray $internalcommandlists 7
setvar $bot~internalcommandlists[1]  " stopall stop listall reset emq bot relog tow refresh login logoff unlock lift with dep callin about cn extern twarp bwarp pwarp relog help switchbot "
setvar $bot~internalcommandlists[2]  " "
setvar $bot~internalcommandlists[3]  " hkill kill htorp "
setvar $bot~internalcommandlists[4]  " refurb scrub "
setvar $bot~internalcommandlists[5]  " surround exit xenter mow "
setvar $bot~internalcommandlists[6]  " "
setvar $bot~internalcommandlists[7]  " find pscan sector storeship setvar getvar "
setvar $bot~doubledcommandlist       " parm params parms qss sec sect secto cn9 logout emx smow port shipstore finder xenter status pinfo holotorp"
setvar $bot~internalcommandlist     $bot~internalcommandlists[1]&$bot~internalcommandlists[2]&$bot~internalcommandlists[3]&bot~$internalcommandlists[4]&$bot~internalcommandlists[5]&$bot~internalcommandlists[6]&$bot~internalcommandlists[7]
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

goto :user_interface~runusercommandline

halt

:module_vars
savevar $bot~command
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
gosub :backwards_compatible
return

:bot~wait_for_command
halt

:backwards_compatible
setvar  $safe_ship $bot~safe_ship
savevar $safe_ship
setvar  $safe_planet $bot~safe_planet
savevar $safe_planet
setvar $command $bot~command
savevar $command
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

#-=-=-=-=-includes-=-=-=-=-
include "source\include\user_interface"
