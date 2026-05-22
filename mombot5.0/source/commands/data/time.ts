gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Displays system's local time "
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"  time "
setvar $help~help[4]  $help~tab&"         "
gosub :help~helpfile

loadvar $bot~bot_name
loadvar $bot~parm1
loadvar $bot~user_command_line
loadvar $bot~timer_file

setvar $switchboard~message "Current system time - "&time&"*"
gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
