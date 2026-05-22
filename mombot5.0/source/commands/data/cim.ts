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

:cim
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
isnumber $test $bot~parm1
if ($test)
	if ($bot~parm1 > 0)
		setvar $upgradelimit $bot~parm1
	else
		setvar $upgradelimit 10000
	end
else
	setvar $upgradelimit 10000
end
setvar $switchboard~message "Stand By - CIMMING . . .*"
gosub :switchboard~switchboard
if (($bot~parm1 = "warps") or ($bot~parm1 = "warp"))
	send "^iq"
	setvar $switchboard~message "Warp Data CIM Complete*"
	gosub :switchboard~switchboard
	halt
else
	send "^rq"
end
waitfor ": ENDINTERROG"
setarray $update~mcic sectors
setvar $update~startinglocation $startinglocation
setvar $update~upgradelimit $upgradelimit
gosub :update~mcic_looper
halt

# includes:
include "source\include\update"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
