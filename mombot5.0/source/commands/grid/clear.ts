gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $player~surroundlimp
loadvar $player~surroundmine

setVar $HELP~HELP[1]  $HELP~TAB&"clear - clear all enemy armids and limpets from sector "
gosub :HELP~HELPFILE

setVar $SWITCHBOARD~bot_name $bot~bot_name
setVar $SWITCHBOARD~self_command $self_command

setvar $switchboard~message "Clearing Current Sector*"
gosub :SWITCHBOARD~switchboard
gosub :mines~clear
gosub :switchboard~switchboard
halt


# includes:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\help"
include "source\include\switchboard.ts"
