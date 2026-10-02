:loadvars~loadvars


loadvar $bot~bot_turn_limit
loadvar $bot~botisdeaf
loadvar $bot~command
loadvar $bot~command_typed
loadvar $bot~command_caller
loadvar $bot~folder
loadvar $bot~letter
loadvar $bot~mode
loadvar $bot~mombot_directory
loadvar $bot~mombot_config_file
loadvar $bot~parm1
loadvar $bot~parm2
loadvar $bot~parm3
loadvar $bot~parm4
loadvar $bot~parm5
loadvar $bot~parm6
loadvar $bot~parm7
loadvar $bot~parm8
loadvar $bot~password
loadvar $bot~silent_running
loadvar $bot~user_command_line
loadvar $game~port_max
loadvar $game~photon_duration
loadvar $game~goldenabled
loadvar $game~mbbs
loadvar $game~port_max
loadvar $game~ptradesetting
loadvar $game~rob_factor
loadvar $game~production_ra
loadvar $map~stardock
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $map~home_sector
loadvar $map~backdoor
loadvar $player~fighter_deploy_type
loadvar $planet~planet
loadvar $planet~planet_file
loadvar $player~dropoffensive
loadvar $player~droptoll
loadvar $player~override
loadvar $player~surroundfigs
loadvar $player~surroundlimp
loadvar $player~surroundmine
loadvar $player~unlimitedgame
loadvar $ship~cap_file
loadvar $switchboard~bot_name
setvar $bot~bot_name $switchboard~bot_name
loadvar $switchboard~self_command
gosub :NORMALIZE_DEPLOY_PREFERENCES
return
:loadvars~normalize_deploy_preferences



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
