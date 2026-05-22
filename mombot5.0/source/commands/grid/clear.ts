gosub :loadvars~loadvars
gosub :help~initialize
loadvar $player~surroundlimp
loadvar $player~surroundmine

setvar $help~help[1]  $help~tab&"clear - clear all enemy armids and limpets from sector "
gosub :help~helpfile

setvar $switchboard~bot_name $bot~bot_name
setvar $switchboard~self_command $self_command

setvar $switchboard~message "Clearing Current Sector*"
gosub :switchboard~switchboard
gosub :mines~clear
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\help"
include "source\include\switchboard.ts"
