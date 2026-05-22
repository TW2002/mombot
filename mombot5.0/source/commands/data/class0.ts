gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Reports both Class 0 sectors if known."
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"class0 (sector)"
gosub :help~helpfile

loadvar $bot_name
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1

:test
send "'*"
send "Zarkahn's Class 0 Report*"
send "Rylos is Sector: " rylos "*"
send "Alpha Centauri is Sector: " alphacentauri "*"
send "Class 0 Report Complete*"
send "*"
halt
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
