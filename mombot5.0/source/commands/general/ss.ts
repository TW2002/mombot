gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"ss - send subspace messages  "
gosub :help~helpfile

send "'"&$bot~user_command_line&"*"
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
