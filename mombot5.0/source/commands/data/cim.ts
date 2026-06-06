logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $player~unlimitedgame
loadvar $game~ptradesetting
loadvar $bot~bot_turn_limit
loadvar $game~port_max
loadvar $game~ptradesetting
loadvar $bot~mcic_file

setvar $help~help[1] $help~tab&"     Computer Interrogation Mode: Port Report     "
setvar $help~help[2] $help~tab&"           "
setvar $help~help[3] $help~tab&"    cim {upgrade level} {warps}   "
setvar $help~help[4] $help~tab&"                             "
setvar $help~help[5] $help~tab&"Options:"
setvar $help~help[6] $help~tab&"    {upgrade level} - Amount on port to be considered "
setvar $help~help[7] $help~tab&"                      upgraded"
setvar $help~help[8] $help~tab&"                                            "
setvar $help~help[9] $help~tab&"    {warps}         - Perform warp data instead of "
setvar $help~help[10] $help~tab&"                      port CIM"
gosub :help~helpfile

setvar $switchboard~message "CIM starting up!*"
gosub :switchboard~switchboard

setvar $player~save true
gosub :update~cim
halt

# includes:
include "source\include\update"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
